# Real-Time Chat Application Backend

A Flask-based real-time chat application backend with AI-powered translation and content moderation features.

## Features

- **User Authentication**: Simple username-based authentication
- **Real-Time Messaging**: WebSocket-based chat using Flask-SocketIO
- **AI Translation**: Automatic message translation using OpenAI GPT models
- **Content Moderation**: Toxic content detection using OpenAI Moderation API
- **Message Persistence**: MongoDB storage for messages and user data
- **Room Management**: Support for multiple chat rooms
- **Rate Limiting**: Prevents spam (10 messages per minute per user)

## Prerequisites

- Python 3.8+
- MongoDB (running locally or remote)
- OpenAI API key

## Installation

1. **Clone the repository and navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/
   DATABASE_NAME=realtime_chat
   OPENAI_API_KEY=your_openai_api_key_here
   SECRET_KEY=your_secret_key_here
   FRONTEND_URL=http://localhost:3000
   RATE_LIMIT_MESSAGES=10
   RATE_LIMIT_WINDOW=60
   OPENAI_MODEL=gpt-3.5-turbo
   TOXICITY_THRESHOLD=0.7
   ```

## Running the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- **POST /api/auth/login**
  - Body: `{ "username": "string" }`
  - Returns: `{ "user_id": "string", "username": "string", "token": "string", "preferred_language": "string" }`

### Messages

- **GET /api/messages/:room_id?limit=50**
  - Returns: `{ "messages": [...], "count": number }`

### Rooms

- **GET /api/rooms**
  - Returns: `{ "rooms": [...] }`

- **POST /api/rooms**
  - Body: `{ "room_name": "string" }`
  - Returns: `{ "room": {...} }`

### Translation

- **POST /api/translate**
  - Body: `{ "text": "string", "target_language": "string", "source_language": "string" }`
  - Returns: `{ "original_text": "string", "translated_text": "string", ... }`

### Health Check

- **GET /health**
  - Returns: `{ "status": "healthy", "service": "realtime-chat-backend" }`

## Socket.IO Events

### Client → Server

- **join_room**: Join a chat room
  - Data: `{ "user_id": "string", "username": "string", "room_id": "string", "preferred_language": "string" }`

- **leave_room**: Leave a chat room
  - Data: `{ "room_id": "string" }`

- **send_message**: Send a message
  - Data: `{ "room_id": "string", "text": "string" }`

- **user_typing**: Send typing indicator
  - Data: `{ "room_id": "string", "is_typing": boolean }`

### Server → Client

- **connected**: Connection confirmation
- **joined_room**: Room join confirmation
- **left_room**: Room leave confirmation
- **user_joined**: Another user joined the room
- **user_left**: Another user left the room
- **receive_message**: New message received
  - Data: `{ "message_id": "string", "username": "string", "original_text": "string", "translations": {...}, "is_flagged": boolean, ... }`
- **user_typing**: User typing indicator
- **error**: Error message

## Project Structure

```
backend/
├── app.py                 # Main Flask application
├── config.py              # Configuration settings
├── database.py            # MongoDB operations
├── ai_service.py          # OpenAI integration
├── routes.py              # REST API routes
├── socket_handlers.py     # Socket.IO event handlers
├── rate_limiter.py        # Rate limiting logic
├── utils.py               # Utility functions
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (create this)
└── README.md             # This file
```

## Database Schema

### Users Collection
```json
{
  "user_id": "string",
  "username": "string",
  "preferred_language": "string",
  "created_at": "datetime"
}
```

### Messages Collection
```json
{
  "message_id": "string",
  "user_id": "string",
  "username": "string",
  "room_id": "string",
  "original_text": "string",
  "timestamp": "datetime",
  "is_flagged": "boolean",
  "toxicity_score": "float",
  "translations": {
    "en": "string",
    "es": "string",
    ...
  }
}
```

### Rooms Collection
```json
{
  "room_id": "string",
  "room_name": "string",
  "created_at": "datetime"
}
```

## Configuration

- **RATE_LIMIT_MESSAGES**: Maximum messages per user per time window (default: 10)
- **RATE_LIMIT_WINDOW**: Time window in seconds (default: 60)
- **TOXICITY_THRESHOLD**: Threshold for flagging toxic content (default: 0.7)
- **OPENAI_MODEL**: OpenAI model to use (default: gpt-3.5-turbo)

## Error Handling

The application includes comprehensive error handling:
- Database connection errors
- OpenAI API failures (with fallbacks)
- Rate limiting violations
- Invalid input validation

## Logging

All operations are logged with appropriate log levels. Check console output for debugging information.

## Notes

- Translations are cached in MongoDB to reduce API calls
- Messages are not blocked, only flagged with warnings
- Default room "general" is created automatically on startup
- Rate limiting is in-memory (resets on server restart)

## License

This project is part of a real-time chat application.

