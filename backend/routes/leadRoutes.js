import express from "express";
import {
  createLead,
  getLeads,
  updateLeadStatus,
  deleteLead
} from "../controllers/leadController.js";
import protect from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/", protect, getLeads);
router.post("/", protect, createLead);
router.put("/:id", protect, updateLeadStatus);
router.delete("/:id", protect, deleteLead);

export default router;