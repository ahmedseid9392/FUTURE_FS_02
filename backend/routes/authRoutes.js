import express from "express";
import {
  loginAdmin,
  registerAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 AUTH
router.post("/login", loginAdmin);

// 👇 ADMIN CRUD (protected)
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/", protect, getAdmins);
router.put("/:id", protect, updateAdmin);
router.delete("/:id", protect, deleteAdmin);

export default router;