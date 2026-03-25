import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addNote,
  getNotes
} from '../controllers/leadController.js';

const router = express.Router();

// Public route for form submissions
router.post('/', createLead);

// Protected routes
router.get('/', authenticateToken, getLeads);
router.get('/:id', authenticateToken, getLeadById);
router.put('/:id', authenticateToken, updateLead);
router.delete('/:id', authenticateToken, deleteLead);
router.post('/:id/notes', authenticateToken, addNote);
router.get('/:id/notes', authenticateToken, getNotes);

export default router;