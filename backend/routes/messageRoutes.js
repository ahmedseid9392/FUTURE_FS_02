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

// Protected routes
router.get('/conversations', authenticateToken, getConversations);
router.get('/:id', authenticateToken, getMessages);
router.post('/', authenticateToken, createConversation);
router.post('/:id', authenticateToken, sendMessage);
router.put('/:id/read', authenticateToken, markAsRead);
router.put('/:id/star', authenticateToken, toggleStar);
router.delete('/:id', authenticateToken, deleteMessage);
router.put('/conversation/:id/star', authenticateToken, starConversation);

export default router;