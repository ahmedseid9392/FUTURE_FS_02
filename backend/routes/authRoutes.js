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

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password', resetPassword);

// Google OAuth route
router.post('/google', googleAuth);

export default router;