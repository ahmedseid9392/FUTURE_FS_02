import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/calendarController.js';

const router = express.Router();

// Get events
router.get('/events', authenticateToken, getEvents);

// Create event
router.post('/events', authenticateToken, createEvent);

// Update event
router.put('/events/:id', authenticateToken, updateEvent);

// Delete event
router.delete('/events/:id', authenticateToken, deleteEvent);

export default router;