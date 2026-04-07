import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getReports, exportReportCSV, exportReportJSON } from '../controllers/reportController.js';

const router = express.Router();

// All report routes require authentication
router.use(authenticateToken);

router.get('/', getReports);
router.get('/export/csv', exportReportCSV);
router.get('/export/json', exportReportJSON);

export default router;