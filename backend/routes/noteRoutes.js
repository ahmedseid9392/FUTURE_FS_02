import express from "express";
import { addNote, getNotes } from "../controllers/noteController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// /api/notes/:leadId
router.post("/:leadId", protect, addNote);
router.get("/:leadId", protect, getNotes);

export default router;