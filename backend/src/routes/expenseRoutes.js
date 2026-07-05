import express from 'express';
import { createExpense, getExpenses } from '../controllers/expenseController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, expenseSchema } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);
router.post('/', authorize('site_manager', 'contractor'), validate(expenseSchema), createExpense);
router.get('/', getExpenses);

export default router;
