import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import Login from './components/Login';
import Chat from './components/Chat';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useUser();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useUser();
  return !isAuthenticated ? children : <Navigate to="/chat" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

export default App;
