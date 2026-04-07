import express from 'express';
import { 
  register, 
  login, 
  getProfile,
  forgotPassword,
  verifyResetToken,
  resetPassword
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { googleAuth } from '../controllers/googleAuthController.js';


const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;