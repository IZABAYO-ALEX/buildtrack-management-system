import express from 'express';
import {
  createExpense,
  getExpenses,
  updateExpense,
  approveExpense,
  deleteExpense
} from '../controllers/expenseController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { validate, expenseSchema } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorize('site_manager', 'contractor'),
  uploadSingle('receipt'),
  validate(expenseSchema),
  createExpense
);

router.get('/', getExpenses);

router.put(
  '/:id',
  authorize('site_manager', 'contractor'),
  uploadSingle('receipt'),
  updateExpense
);

router.patch('/:id/approve', authorize('accountant', 'contractor'), approveExpense);

router.delete('/:id', authorize('site_manager', 'contractor'), deleteExpense);

export default router;
