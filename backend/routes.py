from flask import Blueprint, request, jsonify
import logging
from database import db
from utils import generate_token, validate_username, validate_room_name

logger = logging.getLogger(__name__)

api = Blueprint('api', __name__)

@api.route('/auth/login', methods=['POST'])
def login():
    """User authentication endpoint"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        preferred_language = data.get('language', data.get('preferred_language', 'en'))
        
        if not validate_username(username):
            return jsonify({
                'error': 'Invalid username. Username must be 1-50 characters and contain only alphanumeric characters, spaces, underscores, or hyphens.'
            }), 400
        
        # Get or create user
        user = db.get_user(username=username)
        if not user:
            user = db.create_user(username, preferred_language)
        else:
            # Update language if provided
            if preferred_language and preferred_language != user.get('preferred_language'):
                user['preferred_language'] = preferred_language
                if db.connected:
                    try:
                        db.update_user_language(user['user_id'], preferred_language)
                    except Exception as e:
                        logger.warning(f"Failed to update user language: {e}")
        
        # Generate session token
        token = generate_token()
        
        logger.info(f"User logged in: {username}")
        
        return jsonify({
            'userId': user['user_id'],  # Frontend expects userId
            'user_id': user['user_id'],  # Also include user_id for compatibility
            'username': user['username'],
            'token': token,
            'preferred_language': user.get('preferred_language', 'en')
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@api.route('/messages/<room_id>', methods=['GET'])
def get_messages(room_id):
    """Get message history for a room (room_id can be room_id or room_name)"""
    try:
        limit = request.args.get('limit', 50, type=int)
        if limit > 100:
            limit = 100  # Max limit
        
        # Try to find room by ID first, then by name
        room = db.get_room(room_id=room_id) or db.get_room(room_name=room_id)
        if not room:
            # If room doesn't exist, try to get or create 'general' if room_id is 'general'
            if room_id.lower() == 'general':
                room = db.get_or_create_room('general')
                room_id = room['room_id']
            else:
                return jsonify({'error': 'Room not found'}), 404
        else:
            room_id = room['room_id']
        
        messages = db.get_messages(room_id, limit)
        
        return jsonify({
            'messages': messages,
            'count': len(messages)
        }), 200
        
    except Exception as e:
        logger.error(f"Get messages error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@api.route('/rooms', methods=['GET'])
def get_rooms():
    """Get all available rooms"""
    try:
        rooms = db.get_rooms()
        
        # If no rooms exist, create default 'general' room
        if not rooms:
            general_room = db.create_room('general')
            rooms = [general_room]
        
        return jsonify({
            'rooms': rooms
        }), 200
        
    except Exception as e:
        logger.error(f"Get rooms error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@api.route('/rooms', methods=['POST'])
def create_room():
    """Create a new chat room"""
    try:
        data = request.get_json()
        room_name = data.get('room_name', '').strip()
        
        if not validate_room_name(room_name):
            return jsonify({
                'error': 'Invalid room name. Room name must be 1-50 characters.'
            }), 400
        
        # Check if room already exists
        existing_rooms = db.get_rooms()
        if any(room['room_name'].lower() == room_name.lower() for room in existing_rooms):
            return jsonify({
                'error': 'Room with this name already exists'
            }), 400
        
        room = db.create_room(room_name)
        room['_id'] = str(room['_id'])
        room['created_at'] = room['created_at'].isoformat()
        
        logger.info(f"Created room: {room_name}")
        
        return jsonify({
            'room': room
        }), 201
        
    except Exception as e:
        logger.error(f"Create room error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@api.route('/translate', methods=['POST'])
def translate():
    """Manual translation endpoint"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        target_language = data.get('target_language', 'en')
        source_language = data.get('source_language', 'auto')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        # Import here to avoid circular imports
        import asyncio
        from ai_service import ai_service
        
        # Run async translation
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        translated_text = loop.run_until_complete(
            ai_service.translate_text(text, target_language, source_language)
        )
        loop.close()
        
        return jsonify({
            'original_text': text,
            'translated_text': translated_text,
            'source_language': source_language,
            'target_language': target_language
        }), 200
        
    except Exception as e:
        logger.error(f"Translation error: {e}")
        return jsonify({'error': 'Translation failed'}), 500

