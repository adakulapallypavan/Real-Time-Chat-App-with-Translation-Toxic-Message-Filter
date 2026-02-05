import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants/languages';

let socket = null;

export const initSocket = (userId, username) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      userId,
      username,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

