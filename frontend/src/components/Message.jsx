import { useState } from 'react';
import { formatMessageTime, formatTimestamp } from '../utils/formatTime';
import { escapeHtml } from '../utils/sanitize';
import { IoWarning, IoLanguage, IoCheckmarkCircle } from 'react-icons/io5';
import { LANGUAGES } from '../constants/languages';

const Message = ({ message, isOwn, userLanguage }) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showToxicModal, setShowToxicModal] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const originalLang = LANGUAGES.find((l) => l.code === message.originalLanguage) || LANGUAGES[0];
  const needsTranslation = message.originalLanguage !== userLanguage && message.translatedText;

  const handleToxicClick = () => {
    if (!revealed) {
      setShowToxicModal(true);
    }
  };

  const handleRevealToxic = () => {
    setRevealed(true);
    setShowToxicModal(false);
  };

  const displayText = showTranslation && message.translatedText
    ? message.translatedText
    : message.text;

  return (
    <>
      <div
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 message-enter`}
      >
        <div
          className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {message.username}
            </span>
            {message.isToxic && (
              <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <IoWarning />
                Toxic
              </span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatMessageTime(message.timestamp)}
            </span>
          </div>

          <div
            className={`relative rounded-2xl px-4 py-2 ${
              isOwn
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
            } ${message.isToxic && !revealed ? 'cursor-pointer' : ''}`}
            onClick={message.isToxic && !revealed ? handleToxicClick : undefined}
          >
            {message.isToxic && !revealed && (
              <>
                <div className="blur-content">
                  <p className="whitespace-pre-wrap break-words">{escapeHtml(displayText)}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/30 rounded-2xl backdrop-blur-sm">
                  <div className="text-center p-4">
                    <IoWarning className="mx-auto mb-2 text-red-600 dark:text-red-400" size={24} />
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                      Potentially Offensive Content
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Click to view
                    </p>
                  </div>
                </div>
              </>
            )}

            {(!message.isToxic || revealed) && (
              <div className="relative">
                <p className="whitespace-pre-wrap break-words">{escapeHtml(displayText)}</p>
              
              {needsTranslation && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTranslation(!showTranslation);
                  }}
                  className="mt-2 text-xs flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <IoLanguage size={14} />
                  {showTranslation ? 'Show original' : 'See translation'}
                </button>
              )}

                {!needsTranslation && message.originalLanguage === userLanguage && (
                  <div className="mt-1 text-xs opacity-70 flex items-center gap-1">
                    <IoCheckmarkCircle size={12} />
                    Your language
                  </div>
                )}
              </div>
            )}

            {message.originalLanguage && (
              <div className="mt-1 text-xs opacity-60">
                {originalLang.flag} {originalLang.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {showToxicModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <IoWarning className="text-red-600 dark:text-red-400" size={32} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Warning: Offensive Content
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              This message was flagged for potentially offensive content. Do you want to view it anyway?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleRevealToxic}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                View Anyway
              </button>
              <button
                onClick={() => setShowToxicModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Message;

