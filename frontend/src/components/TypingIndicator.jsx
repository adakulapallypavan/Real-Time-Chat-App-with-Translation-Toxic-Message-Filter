const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;

  return (
    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
      {users.length === 1 ? (
        <span>{users[0]} is typing...</span>
      ) : users.length === 2 ? (
        <span>{users[0]} and {users[1]} are typing...</span>
      ) : (
        <span>{users[0]} and {users.length - 1} others are typing...</span>
      )}
      <span className="inline-block ml-1">
        <span className="animate-bounce">.</span>
        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
        <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
      </span>
    </div>
  );
};

export default TypingIndicator;

