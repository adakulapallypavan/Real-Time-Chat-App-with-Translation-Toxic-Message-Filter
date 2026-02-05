import { useUser } from '../contexts/UserContext';
import { LANGUAGES } from '../constants/languages';
import { IoLogOut, IoMoon, IoSunny } from 'react-icons/io5';
import { useState, useEffect } from 'react';

const ChatHeader = ({ currentRoom, onlineUsers, onLanguageChange, onLogout }) => {
  const { user } = useUser();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
           (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          💬 Real-Time Chat
        </h1>
        {currentRoom && (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">#</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {currentRoom.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>{onlineUsers} online</span>
        </div>

        <select
          value={user?.language || 'en'}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <IoSunny className="text-gray-700 dark:text-gray-300" size={20} />
          ) : (
            <IoMoon className="text-gray-700 dark:text-gray-300" size={20} />
          )}
        </button>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <IoLogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;

