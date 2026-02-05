# Real-Time Chat App Frontend

A modern, real-time chat application built with React, featuring automatic translation and toxic message filtering.

## Features

- 🔐 **User Authentication**: Simple login with username and language preference
- 💬 **Real-Time Messaging**: Socket.IO-powered instant messaging
- 🌍 **Multi-Language Support**: Automatic translation to user's preferred language
- 🛡️ **Toxic Message Filtering**: AI-powered content moderation with blur effects
- 🏠 **Room System**: Multiple chat rooms for different topics
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🌙 **Dark Mode**: Toggle between light and dark themes
- ⌨️ **Typing Indicators**: See when others are typing
- 🔔 **Toast Notifications**: System messages and alerts

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Socket.IO Client** - Real-time WebSocket communication
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **date-fns** - Date formatting
- **react-icons** - Icon library

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns).

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Login.jsx        # Login screen
│   │   ├── Chat.jsx         # Main chat component
│   │   ├── ChatHeader.jsx   # Header with controls
│   │   ├── Sidebar.jsx      # Room list sidebar
│   │   ├── MessageList.jsx  # Message display area
│   │   ├── Message.jsx       # Individual message component
│   │   ├── InputArea.jsx    # Message input
│   │   ├── TypingIndicator.jsx
│   │   ├── Toast.jsx
│   │   └── ToastContainer.jsx
│   ├── contexts/            # React contexts
│   │   └── UserContext.jsx  # User state management
│   ├── utils/              # Utility functions
│   │   ├── socket.js       # Socket.IO setup
│   │   ├── api.js          # API calls
│   │   ├── formatTime.js   # Time formatting
│   │   └── sanitize.js     # XSS prevention
│   ├── constants/          # Constants
│   │   └── languages.js    # Language list and config
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── package.json
└── vite.config.js
```

## Configuration

### Backend Connection

The app is configured to connect to a backend server at:
- **API**: `http://localhost:5000`
- **Socket.IO**: `http://localhost:5000`

Update these in `src/constants/languages.js` if your backend runs on a different port.

## Features in Detail

### Login Screen
- Username input (max 30 characters)
- Language preference selector (8 languages supported)
- Stores user data in localStorage
- Calls `/api/auth/login` endpoint

### Chat Interface
- **Header**: App title, current room, language selector, dark mode toggle, logout
- **Sidebar**: List of available rooms, online users count
- **Message Area**: Scrollable message list with auto-scroll
- **Input**: Multi-line text input with emoji button (placeholder)

### Real-Time Features
- Socket.IO connection with auto-reconnect
- Join/leave room events
- Send/receive messages
- Typing indicators
- Online user count

### Translation
- Messages show original language flag
- "See translation" button for messages not in user's language
- Toggle between original and translated text
- Smooth animations

### Toxicity Filtering
- Toxic messages are blurred by default
- Warning overlay with "Click to view" message
- Modal confirmation before revealing content
- Red badge indicator on toxic messages

## Supported Languages

- 🇺🇸 English
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇯🇵 Japanese
- 🇨🇳 Chinese
- 🇮🇳 Hindi
- 🇸🇦 Arabic

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend Requirements

The frontend expects the backend to provide:

### API Endpoints
- `POST /api/auth/login` - User login
- `GET /api/messages/:roomId` - Get message history
- `POST /api/messages/report` - Report a message

### Socket.IO Events

**Client → Server:**
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `user_typing` - User is typing
- `stop_typing` - User stopped typing

**Server → Client:**
- `connect` - Socket connected
- `disconnect` - Socket disconnected
- `receive_message` - New message received
- `user_joined` - User joined room
- `user_left` - User left room
- `typing` - User is typing
- `stop_typing` - User stopped typing
- `online_users` - Online user count update

## Message Format

Messages should have the following structure:
```javascript
{
  id: string,
  text: string,
  translatedText: string,      // Optional
  username: string,
  userId: string,
  roomId: string,
  timestamp: string,            // ISO string
  originalLanguage: string,      // Language code
  isToxic: boolean              // Optional
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- The app uses React Context for global state management
- Socket connection is initialized when user logs in
- Messages are stored in component state (not persisted)
- Dark mode preference is saved in localStorage
- User data is stored in localStorage for persistence

## Future Enhancements

- Emoji picker implementation
- Sound notifications with toggle
- Unread message count badges
- Message search functionality
- File/image sharing
- User profiles and avatars
- Message reactions
- Read receipts

## License

MIT
