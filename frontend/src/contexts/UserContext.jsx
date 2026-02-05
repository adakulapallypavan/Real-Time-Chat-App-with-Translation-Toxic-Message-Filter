import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('chatUser');
    return stored ? JSON.parse(stored) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!user);

  useEffect(() => {
    if (user) {
      localStorage.setItem('chatUser', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('chatUser');
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('chatUser');
  };

  const updateLanguage = (language) => {
    if (user) {
      const updatedUser = { ...user, language };
      setUser(updatedUser);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        updateLanguage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

