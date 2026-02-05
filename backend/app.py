from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import logging
import eventlet

from config import Config
from routes import api
from socket_handlers import register_socket_handlers
from database import db

# Apply eventlet monkey patch after heavy imports (e.g., openai/httpx) to avoid
# trio compatibility errors triggered during import.
eventlet.monkey_patch()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = Config.SECRET_KEY

# Configure CORS
CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

# Initialize SocketIO
socketio = SocketIO(
    app,
    cors_allowed_origins=Config.CORS_ORIGINS,
    async_mode='eventlet',
    logger=True,
    engineio_logger=True
)

# Register routes
app.register_blueprint(api, url_prefix='/api')

# Register socket handlers
register_socket_handlers(socketio)

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return {'status': 'healthy', 'service': 'realtime-chat-backend'}, 200

if __name__ == '__main__':
    # Initialize default room
    try:
        rooms = db.get_rooms()
        if not rooms:
            db.create_room('general')
            logger.info("Created default 'general' room")
    except Exception as e:
        logger.error(f"Failed to initialize default room: {e}")
    
    logger.info("Starting Flask-SocketIO server on port 5000...")
    socketio.run(
        app,
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=False
    )

