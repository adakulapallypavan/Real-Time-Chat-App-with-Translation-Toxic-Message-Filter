import { useEffect, useRef } from 'react';
import Message from './Message';
import { useUser } from '../contexts/UserContext';

const MessageList = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);
  const { user } = useUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-xl mb-2">💬</p>
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm">Start chatting!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
      {messages.map((message) => (
        <Message
          key={message.id || message._id || `${message.timestamp}-${message.username}`}
          message={message}
          isOwn={message.userId === user?.userId || message.username === user?.username}
          userLanguage={user?.language || 'en'}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

