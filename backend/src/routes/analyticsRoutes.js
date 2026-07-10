import express from 'express';
import {
  getBudgetVsActual,
  getProjectProgress,
  getWorkerProductivity,
  getMaterialConsumption,
  getExpenseBreakdown,
  getProfitLoss,
  getCashFlow
} from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/budget-vs-actual', authorize('contractor', 'accountant'), getBudgetVsActual);
router.get('/project-progress', authorize('contractor', 'site_manager', 'accountant'), getProjectProgress);
router.get('/worker-productivity', authorize('contractor', 'site_manager','accountant' ), getWorkerProductivity);
router.get('/material-consumption', authorize('contractor', 'site_manager'), getMaterialConsumption);
router.get('/expense-breakdown', authorize('contractor', 'accountant'), getExpenseBreakdown);
router.get('/profit-loss', authorize('contractor', ), getProfitLoss);
router.get('/cash-flow', authorize('contractor', 'accountant'), getCashFlow);

export default router;
