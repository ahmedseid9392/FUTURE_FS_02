import axios from 'axios';

// IMPORTANT: Make sure API_URL includes /api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API URL:', API_URL); // Should show: https://crm-backend-cw8h.onrender.com/api

const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
  return config;
});

export default API;

// Add these to your existing API service
export const messageAPI = {
  getConversations: () => API.get('/messages/conversations'),
  getMessages: (conversationId) => API.get(`/messages/${conversationId}`),
  createConversation: (data) => API.post('/messages', data),
  sendMessage: (conversationId, text) => API.post(`/messages/${conversationId}`, { text }),
  markAsRead: (messageId) => API.put(`/messages/${messageId}/read`),
  toggleStar: (messageId, starred) => API.put(`/messages/${messageId}/star`, { starred }),
  deleteMessage: (messageId) => API.delete(`/messages/${messageId}`),
  starConversation: (conversationId, starred) => API.put(`/messages/conversation/${conversationId}/star`, { starred })
};
