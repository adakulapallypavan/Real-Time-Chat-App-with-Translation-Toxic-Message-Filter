from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import logging
from config import Config

logger = logging.getLogger(__name__)

class Database:
    """MongoDB database operations"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self.users = None
        self.messages = None
        self.rooms = None
        self.translations = None
        self.connected = False
        try:
            self.client = MongoClient(Config.MONGODB_URI, serverSelectionTimeoutMS=5000)
            self.db = self.client[Config.DATABASE_NAME]
            # Test connection
            self.client.admin.command('ping')
            self.users = self.db.users
            self.messages = self.db.messages
            self.rooms = self.db.rooms
            self.translations = self.db.translations  # Cache for translations
            self.connected = True
            logger.info("Connected to MongoDB successfully")
        except Exception as e:
            logger.warning(f"MongoDB not available: {e}. Running in memory-only mode.")
            self.connected = False
    
    def create_user(self, username, preferred_language='en'):
        """Create a new user"""
        user = {
            'user_id': str(ObjectId()),
            'username': username,
            'preferred_language': preferred_language,
            'created_at': datetime.utcnow()
        }
        if self.connected:
            try:
                self.users.insert_one(user)
                logger.info(f"Created user: {username}")
            except Exception as e:
                logger.warning(f"Failed to save user to MongoDB: {e}")
        else:
            logger.info(f"Created user (in-memory): {username}")
        return user
    
    def get_user(self, user_id=None, username=None):
        """Get user by user_id or username"""
        if not self.connected:
            return None
        try:
            if user_id:
                return self.users.find_one({'user_id': user_id})
            elif username:
                return self.users.find_one({'username': username})
        except Exception as e:
            logger.warning(f"Failed to get user from MongoDB: {e}")
        return None
    
    def update_user_language(self, user_id, language):
        """Update user's preferred language"""
        if not self.connected:
            return
        try:
            self.users.update_one(
                {'user_id': user_id},
                {'$set': {'preferred_language': language}}
            )
        except Exception as e:
            logger.warning(f"Failed to update user language: {e}")
    
    def save_message(self, message_data):
        """Save message to database"""
        message = {
            'message_id': str(ObjectId()),
            'user_id': message_data['user_id'],
            'username': message_data['username'],
            'room_id': message_data['room_id'],
            'original_text': message_data['original_text'],
            'timestamp': datetime.utcnow(),
            'is_flagged': message_data.get('is_flagged', False),
            'toxicity_score': message_data.get('toxicity_score', 0.0),
            'translations': message_data.get('translations', {})
        }
        if self.connected:
            try:
                self.messages.insert_one(message)
                logger.info(f"Saved message from {message_data['username']} in room {message_data['room_id']}")
            except Exception as e:
                logger.warning(f"Failed to save message to MongoDB: {e}")
        else:
            logger.info(f"Saved message (in-memory) from {message_data['username']} in room {message_data['room_id']}")
        return message
    
    def get_messages(self, room_id, limit=50):
        """Get recent messages for a room"""
        if not self.connected:
            return []
        try:
            messages = list(self.messages.find(
                {'room_id': room_id}
            ).sort('timestamp', -1).limit(limit))
            
            # Convert ObjectId to string and format timestamp
            for msg in messages:
                msg['_id'] = str(msg['_id'])
                msg['timestamp'] = msg['timestamp'].isoformat()
            
            return list(reversed(messages))  # Return in chronological order
        except Exception as e:
            logger.warning(f"Failed to get messages from MongoDB: {e}")
            return []
    
    def get_cached_translation(self, text, source_lang, target_lang):
        """Get cached translation if exists"""
        if not self.connected:
            return None
        try:
            cache_key = f"{text}_{source_lang}_{target_lang}"
            cached = self.translations.find_one({'cache_key': cache_key})
            if cached:
                return cached.get('translated_text')
        except Exception as e:
            logger.warning(f"Failed to get cached translation from MongoDB: {e}")
        return None
    
    def cache_translation(self, text, source_lang, target_lang, translated_text):
        """Cache a translation"""
        if not self.connected:
            return
        try:
            cache_key = f"{text}_{source_lang}_{target_lang}"
            self.translations.insert_one({
                'cache_key': cache_key,
                'original_text': text,
                'source_language': source_lang,
                'target_language': target_lang,
                'translated_text': translated_text,
                'cached_at': datetime.utcnow()
            })
        except Exception as e:
            logger.warning(f"Failed to cache translation in MongoDB: {e}")
    
    def create_room(self, room_name):
        """Create a new chat room"""
        room = {
            'room_id': str(ObjectId()),
            'room_name': room_name,
            'created_at': datetime.utcnow()
        }
        if self.connected:
            try:
                self.rooms.insert_one(room)
                logger.info(f"Created room: {room_name}")
            except Exception as e:
                logger.warning(f"Failed to save room to MongoDB: {e}")
        else:
            logger.info(f"Created room (in-memory): {room_name}")
        return room
    
    def get_rooms(self):
        """Get all available rooms"""
        if not self.connected:
            return []
        try:
            rooms = list(self.rooms.find())
            for room in rooms:
                room['_id'] = str(room['_id'])
                room['created_at'] = room['created_at'].isoformat()
            return rooms
        except Exception as e:
            logger.warning(f"Failed to get rooms from MongoDB: {e}")
            return []
    
    def get_room(self, room_id=None, room_name=None):
        """Get room by room_id or room_name"""
        if not self.connected:
            return None
        try:
            if room_id:
                return self.rooms.find_one({'room_id': room_id})
            elif room_name:
                return self.rooms.find_one({'room_name': room_name})
        except Exception as e:
            logger.warning(f"Failed to get room from MongoDB: {e}")
        return None
    
    def get_or_create_room(self, room_name):
        """Get existing room or create if it doesn't exist"""
        room = self.get_room(room_name=room_name)
        if not room:
            room = self.create_room(room_name)
        return room

# Global database instance
db = Database()

