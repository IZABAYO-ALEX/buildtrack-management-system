import express from 'express';
import {
  getExpenseReport,
  getWorkerReport,
  getMaterialReport,
  getBudgetReport,
  getProfitabilityReport
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/expenses', authorize('contractor', 'accountant'), getExpenseReport);
router.get('/workers', authorize('contractor', 'accountant', 'site_manager'), getWorkerReport);
router.get('/materials', authorize('contractor', 'accountant'), getMaterialReport);
router.get('/budget', authorize('contractor', 'accountant'), getBudgetReport);
router.get('/profitability', authorize('contractor'), getProfitabilityReport);

export default router;
