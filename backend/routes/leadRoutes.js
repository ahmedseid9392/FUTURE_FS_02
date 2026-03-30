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

// ALL lead routes require authentication (no public routes)
router.use(authenticateToken);

router.get('/', getLeads);
router.get('/:id', getLeadById);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.post('/:id/notes', addNote);
router.get('/:id/notes', getNotes);

export default router;