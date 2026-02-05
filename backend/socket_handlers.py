from flask import request
from flask_socketio import emit, join_room, leave_room
import logging
import asyncio
from database import db
from ai_service import ai_service
from rate_limiter import rate_limiter

logger = logging.getLogger(__name__)

# Store active users and their rooms
active_users = {}  # socket_id -> {user_id, username, preferred_language, rooms: []}
room_users = {}  # room_id -> set of socket_ids

def register_socket_handlers(socketio):
    """Register all Socket.IO event handlers"""
    
    @socketio.on('connect')
    def handle_connect(auth):
        """Handle client connection"""
        logger.info(f"Client connected: {request.sid}")
        emit('connected', {'status': 'connected', 'socket_id': request.sid})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection"""
        socket_id = request.sid
        if socket_id in active_users:
            user_info = active_users[socket_id]
            # Leave all rooms
            for room_id in user_info.get('rooms', []):
                if room_id in room_users:
                    room_users[room_id].discard(socket_id)
                    if not room_users[room_id]:
                        del room_users[room_id]
                emit('user_left', {
                    'username': user_info['username'],
                    'room_id': room_id
                }, room=room_id, include_self=False)
            
            logger.info(f"User {user_info['username']} disconnected")
            del active_users[socket_id]
    
    @socketio.on('join_room')
    def handle_join_room(data):
        """Handle user joining a room"""
        try:
            socket_id = request.sid
            user_id = data.get('user_id')
            username = data.get('username')
            room_identifier = data.get('room_id', 'general')  # Can be room_id or room_name
            preferred_language = data.get('preferred_language', 'en')
            
            if not user_id or not username:
                emit('error', {'message': 'user_id and username are required'})
                return
            
            # Resolve room identifier to room_id
            room = db.get_room(room_id=room_identifier) or db.get_room(room_name=room_identifier)
            if not room:
                # If room doesn't exist, create it if it's 'general', otherwise error
                if room_identifier.lower() == 'general':
                    room = db.get_or_create_room('general')
                else:
                    emit('error', {'message': f'Room "{room_identifier}" not found'})
                    return
            
            room_id = room['room_id']
            room_name = room['room_name']
            
            # Store user info
            if socket_id not in active_users:
                active_users[socket_id] = {
                    'user_id': user_id,
                    'username': username,
                    'preferred_language': preferred_language,
                    'rooms': []
                }
            else:
                active_users[socket_id]['preferred_language'] = preferred_language
            
            # Join the room (using room_id for Socket.IO room management)
            join_room(room_id)
            
            # Track room membership
            if room_id not in active_users[socket_id]['rooms']:
                active_users[socket_id]['rooms'].append(room_id)
            
            if room_id not in room_users:
                room_users[room_id] = set()
            room_users[room_id].add(socket_id)
            
            logger.info(f"User {username} joined room {room_name} ({room_id})")
            
            emit('joined_room', {
                'room_id': room_id,
                'room_name': room_name,
                'username': username
            })
            
            # Notify others in the room
            emit('user_joined', {
                'username': username,
                'room_id': room_id,
                'room_name': room_name
            }, room=room_id, include_self=False)
            
        except Exception as e:
            logger.error(f"Join room error: {e}")
            emit('error', {'message': 'Failed to join room'})
    
    @socketio.on('leave_room')
    def handle_leave_room(data):
        """Handle user leaving a room"""
        try:
            socket_id = request.sid
            room_id = data.get('room_id', 'general')
            
            if socket_id in active_users:
                user_info = active_users[socket_id]
                
                # Remove from room tracking
                if room_id in user_info.get('rooms', []):
                    user_info['rooms'].remove(room_id)
                
                if room_id in room_users:
                    room_users[room_id].discard(socket_id)
                    if not room_users[room_id]:
                        del room_users[room_id]
                
                leave_room(room_id)
                
                logger.info(f"User {user_info['username']} left room {room_id}")
                
                emit('left_room', {'room_id': room_id})
                
                # Notify others in the room
                emit('user_left', {
                    'username': user_info['username'],
                    'room_id': room_id
                }, room=room_id, include_self=False)
            
        except Exception as e:
            logger.error(f"Leave room error: {e}")
            emit('error', {'message': 'Failed to leave room'})
    
    @socketio.on('send_message')
    def handle_send_message(data):
        """Handle sending a message"""
        try:
            socket_id = request.sid
            
            if socket_id not in active_users:
                emit('error', {'message': 'Not authenticated. Please join a room first.'})
                return
            
            user_info = active_users[socket_id]
            user_id = user_info['user_id']
            username = user_info['username']
            room_id = data.get('room_id', 'general')
            text = data.get('text', '').strip()
            
            if not text:
                emit('error', {'message': 'Message text cannot be empty'})
                return
            
            # Check rate limit
            allowed, message = rate_limiter.is_allowed(user_id)
            if not allowed:
                emit('error', {'message': message})
                return
            
            # Verify user is in the room
            if room_id not in user_info.get('rooms', []):
                emit('error', {'message': 'You are not in this room'})
                return
            
            # Run async operations
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # Detect language and moderate content
            source_language = loop.run_until_complete(ai_service.detect_language(text))
            moderation_result = loop.run_until_complete(ai_service.moderate_content(text))
            
            # Get all users in the room and their preferred languages
            target_languages = set()
            for sid in room_users.get(room_id, set()):
                if sid in active_users:
                    target_languages.add(active_users[sid].get('preferred_language', 'en'))
            
            if not target_languages:
                target_languages = {'en'}  # Default
            
            # Translate to all target languages
            translations = loop.run_until_complete(
                ai_service.translate_for_users(text, source_language, list(target_languages))
            )
            
            loop.close()
            
            # Prepare message data
            message_data = {
                'user_id': user_id,
                'username': username,
                'room_id': room_id,
                'original_text': text,
                'is_flagged': moderation_result['is_flagged'],
                'toxicity_score': moderation_result['toxicity_score'],
                'translations': translations
            }
            
            # Save to database
            saved_message = db.save_message(message_data)
            
            # Prepare response
            response = {
                'message_id': saved_message['message_id'],
                'user_id': user_id,
                'username': username,
                'room_id': room_id,
                'original_text': text,
                'timestamp': saved_message['timestamp'].isoformat(),
                'is_flagged': moderation_result['is_flagged'],
                'toxicity_score': moderation_result['toxicity_score'],
                'flagged_categories': moderation_result.get('flagged_categories', []),
                'translations': translations,
                'source_language': source_language
            }
            
            # Broadcast to all users in the room
            emit('receive_message', response, room=room_id)
            
            logger.info(f"Message sent by {username} in room {room_id}")
            
        except Exception as e:
            logger.error(f"Send message error: {e}")
            emit('error', {'message': 'Failed to send message'})
    
    @socketio.on('user_typing')
    def handle_user_typing(data):
        """Handle typing indicator"""
        try:
            socket_id = request.sid
            
            if socket_id not in active_users:
                return
            
            user_info = active_users[socket_id]
            room_id = data.get('room_id', 'general')
            is_typing = data.get('is_typing', False)
            
            # Verify user is in the room
            if room_id not in user_info.get('rooms', []):
                return
            
            # Broadcast typing status to others in the room
            emit('user_typing', {
                'username': user_info['username'],
                'room_id': room_id,
                'is_typing': is_typing
            }, room=room_id, include_self=False)
            
        except Exception as e:
            logger.error(f"Typing indicator error: {e}")

