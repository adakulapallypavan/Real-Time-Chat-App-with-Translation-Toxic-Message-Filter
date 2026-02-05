import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
    DATABASE_NAME = os.getenv('DATABASE_NAME', 'realtime_chat')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    
    # Rate limiting
    RATE_LIMIT_MESSAGES = int(os.getenv('RATE_LIMIT_MESSAGES', '10'))
    RATE_LIMIT_WINDOW = int(os.getenv('RATE_LIMIT_WINDOW', '60'))  # seconds
    
    # OpenAI settings
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
    TOXICITY_THRESHOLD = float(os.getenv('TOXICITY_THRESHOLD', '0.7'))
    
    # CORS settings
    CORS_ORIGINS = [FRONTEND_URL, 'http://localhost:5173']  # Vite default port

