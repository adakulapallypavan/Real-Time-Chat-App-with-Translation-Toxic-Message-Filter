import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { LANGUAGES } from '../constants/languages';
import { login as apiLogin } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: setUser } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    try {
      const response = await apiLogin(username.trim(), language);
      setUser({
        userId: response.userId || Date.now().toString(),
        username: username.trim(),
        language,
      });
      navigate('/chat');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            💬 Real-Time Chat
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join the conversation with translation & moderation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your username"
              maxLength={30}
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Preferred Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Logging in...' : 'Enter Chat'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

