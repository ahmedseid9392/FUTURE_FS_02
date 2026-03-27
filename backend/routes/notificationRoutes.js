import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// Get all notifications
router.get('/', authenticateToken, getNotifications);

// Mark all as read
router.put('/read-all', authenticateToken, markAllAsRead);

// Mark single as read
router.put('/:id/read', authenticateToken, markAsRead);

// Delete notification
router.delete('/:id', authenticateToken, deleteNotification);

export default router;