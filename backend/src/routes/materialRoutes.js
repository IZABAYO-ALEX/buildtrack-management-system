import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as materialController from '../controllers/materialController.js';
import * as expenseController from '../controllers/expenseController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Route to reject an expense
router.post('/:id/reject', authorize('contractor'), expenseController.rejectExpense);

// Material routes
router.get('/', materialController.getAll);
router.get('/:id', materialController.getOne);

// ✅ Only ONE POST route - combined permissions
router.post('/', authorize('contractor', 'site_manager'), materialController.create);

router.put('/:id', authorize('contractor'), materialController.update);
router.delete('/:id', authenticate, authorize('contractor'), materialController.deleteMaterial);

export default router;