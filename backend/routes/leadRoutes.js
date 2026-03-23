import express from "express";
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addNote,
  getNotes
} from "../controllers/leadController.js";
import protect from "../middleware/authMiddleware.js";


const router = express.Router();

router.get('/', protect, getLeads);
router.get('/:id', protect, getLeadById);
router.put('/:id', protect, updateLead);
router.delete('/:id', protect, deleteLead);
router.post('/:id/notes', protect, addNote);
router.get('/:id/notes', protect, getNotes);

export default router;