import axios from 'axios';
import { API_BASE_URL } from '../constants/languages';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (username, language) => {
  try {
    const response = await api.post('/api/auth/login', {
      username,
      language,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMessageHistory = async (roomId, limit = 50) => {
  try {
    const response = await api.get(`/api/messages/${roomId}`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const reportMessage = async (messageId, reason) => {
  try {
    const response = await api.post('/api/messages/report', {
      messageId,
      reason,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

