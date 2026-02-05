import { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      className={`${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] max-w-md animate-slide-in-right`}
      style={{
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 hover:bg-white/20 rounded p-1 transition-colors"
        aria-label="Close"
      >
        <IoClose size={20} />
      </button>
    </div>
  );
};

export default Toast;

