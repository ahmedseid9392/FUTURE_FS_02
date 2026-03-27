import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getReports, exportReport } from '../controllers/reportController.js';

const router = express.Router();

// Get reports
router.get('/', authenticateToken, getReports);

// Export report
router.get('/export', authenticateToken, exportReport);

export default router;