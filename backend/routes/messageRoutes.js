import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  markAsRead,
  toggleStar,
  deleteMessage,
  starConversation
} from '../controllers/messageController.js';

const router = express.Router();

// Debug middleware to log all requests to this router
router.use((req, res, next) => {
  console.log(`📨 Messages API: ${req.method} ${req.originalUrl}`);
  next();
});

// Protected routes
router.get('/conversations', authenticateToken, getConversations);
router.get('/:id', authenticateToken, getMessages);
router.post('/', authenticateToken, createConversation);
router.post('/:id', authenticateToken, sendMessage);

// IMPORTANT: These routes must be defined BEFORE the /:id route to avoid conflicts
router.put('/:id/read', authenticateToken, markAsRead);
router.put('/:id/star', authenticateToken, toggleStar);
router.delete('/:id', authenticateToken, deleteMessage);
router.put('/conversation/:id/star', authenticateToken, starConversation);

export default router;