import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  
});
console.log('API URL:', API_URL);
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

// Handle response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

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