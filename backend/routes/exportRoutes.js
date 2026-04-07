import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  exportAllData,
  exportLeads,
  exportMessages,
  exportEvents
} from '../controllers/exportController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/all', exportAllData);
router.get('/leads', exportLeads);
router.get('/messages', exportMessages);
router.get('/events', exportEvents);

export default router;