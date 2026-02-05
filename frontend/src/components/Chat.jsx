import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { initSocket, disconnectSocket } from '../utils/socket';
import { getMessageHistory } from '../utils/api';
import { DEFAULT_ROOMS } from '../constants/languages';
import ChatHeader from './ChatHeader';
import Sidebar from './Sidebar';
import MessageList from './MessageList';
import InputArea from './InputArea';
import TypingIndicator from './TypingIndicator';
import ToastContainer from './ToastContainer';

const Chat = () => {
  const { user, logout, updateLanguage } = useUser();
  const [messages, setMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(DEFAULT_ROOMS[0]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toasts, setToasts] = useState([]);
  const socketRef = useRef(null);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const socket = initSocket(user.userId, user.username);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      addToast('Connected to chat server', 'success');
      
      // Join default room
      socket.emit('join_room', {
        roomId: currentRoom.id,
        userId: user.userId,
        username: user.username,
      });
    });

    socket.on('disconnect', () => {
      addToast('Disconnected from server', 'warning');
    });

    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user_joined', (data) => {
      addToast(`${data.username} joined the room`, 'info', 2000);
      setOnlineUsers(data.onlineCount || 0);
    });

    socket.on('user_left', (data) => {
      addToast(`${data.username} left the room`, 'info', 2000);
      setOnlineUsers(data.onlineCount || 0);
    });

    socket.on('typing', (data) => {
      if (data.username !== user.username) {
        setTypingUsers((prev) => {
          const filtered = prev.filter((u) => u !== data.username);
          return [...filtered, data.username];
        });

        // Remove typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== data.username));
        }, 3000);
      }
    });

    socket.on('stop_typing', (data) => {
      if (data.username !== user.username) {
        setTypingUsers((prev) => prev.filter((u) => u !== data.username));
      }
    });

    socket.on('online_users', (data) => {
      setOnlineUsers(data.count || 0);
    });

    // Load message history for initial room
    loadMessageHistory(currentRoom.id);

    return () => {
      if (socket) {
        socket.emit('leave_room', { roomId: currentRoom.id });
        disconnectSocket();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]); // Only reconnect when user changes, not room

  const loadMessageHistory = async (roomId) => {
    try {
      setLoading(true);
      const history = await getMessageHistory(roomId, 50);
      setMessages(history.messages || []);
    } catch (error) {
      console.error('Failed to load message history:', error);
      addToast('Failed to load message history', 'error');
      // Continue with empty messages for demo
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || !socketRef.current) return;

    setSending(true);
    const messageData = {
      text: text.trim(),
      roomId: currentRoom.id,
      userId: user.userId,
      username: user.username,
      language: user.language,
      timestamp: new Date().toISOString(),
    };

    try {
      socketRef.current.emit('send_message', messageData);
    } catch (error) {
      console.error('Failed to send message:', error);
      addToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (isTyping) => {
    if (!socketRef.current) return;

    if (isTyping) {
      socketRef.current.emit('user_typing', {
        roomId: currentRoom.id,
        username: user.username,
      });
    } else {
      socketRef.current.emit('stop_typing', {
        roomId: currentRoom.id,
        username: user.username,
      });
    }
  };

  const handleRoomChange = (newRoom) => {
    if (newRoom.id === currentRoom.id) return;

    const socket = socketRef.current;
    if (socket) {
      // Leave current room
      socket.emit('leave_room', {
        roomId: currentRoom.id,
        userId: user.userId,
      });

      // Join new room
      socket.emit('join_room', {
        roomId: newRoom.id,
        userId: user.userId,
        username: user.username,
      });
    }

    setCurrentRoom(newRoom);
    setMessages([]);
    setLoading(true);
    loadMessageHistory(newRoom.id);
  };

  const handleLanguageChange = (newLanguage) => {
    updateLanguage(newLanguage);
    addToast(`Language changed to ${newLanguage}`, 'info', 2000);
  };

  const handleLogout = () => {
    const socket = socketRef.current;
    if (socket) {
      socket.emit('leave_room', {
        roomId: currentRoom.id,
        userId: user.userId,
      });
      disconnectSocket();
    }
    logout();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <ChatHeader
        currentRoom={currentRoom}
        onlineUsers={onlineUsers}
        onLanguageChange={handleLanguageChange}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentRoomId={currentRoom.id}
          onRoomChange={handleRoomChange}
          onlineUsers={onlineUsers}
        />

        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          <MessageList messages={messages} loading={loading} />
          <TypingIndicator users={typingUsers} />
          <InputArea
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            disabled={sending || loading}
          />
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Chat;

