import express from 'express';
import {
  generateDailyReport,
  getDailyReports,
  getDailyReportById,
  syncReports,
  getSiteManagerDashboard
} from '../controllers/dailyReportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', authorize('site_manager', 'contractor'), getSiteManagerDashboard);
router.post('/generate', authorize('site_manager'), generateDailyReport);
router.get('/', authorize('site_manager', 'accountant', 'contractor'), getDailyReports);
router.get('/:id', authorize('site_manager', 'accountant', 'contractor'), getDailyReportById);
router.patch('/sync', authorize('site_manager'), syncReports);

export default router;
