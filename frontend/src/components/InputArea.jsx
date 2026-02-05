import { useState, useEffect, useRef } from 'react';
import { IoPaperPlane, IoHappy } from 'react-icons/io5';

const InputArea = ({ onSendMessage, onTyping, disabled }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear typing indicator after 3 seconds of no typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      onTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            rows={1}
            maxLength={1000}
            disabled={disabled}
            style={{
              minHeight: '48px',
              maxHeight: '120px',
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
          />
          <button
            type="button"
            className="absolute right-2 bottom-2 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            aria-label="Emoji picker"
          >
            <IoHappy size={20} />
          </button>
        </div>
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
        >
          <IoPaperPlane size={18} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};

export default InputArea;

