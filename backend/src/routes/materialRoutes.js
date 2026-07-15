import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as materialController from '../controllers/materialController.js';
import * as expenseController from '../controllers/expenseController.js';

const router = express.Router();

router.use(authenticate);

// Route to reject an expense (using expenseController)
router.post('/:id/reject', authenticate, authorize('contractor'), expenseController.rejectExpense);

// Material routes
router.get('/', authenticate, materialController.getAll);
router.get('/:id', authenticate, materialController.getOne);
router.post('/', authenticate, authorize('contractor'), materialController.create);
router.put('/:id', authenticate, authorize('contractor'), materialController.update);
router.delete('/:id', authenticate, authorize('contractor'), materialController.delete);

// Additional material creation route for site_manager and contractor
router.post('/', authorize('site_manager', 'contractor'), (req, res) => {
  res.json({ success: true, message: 'Material created' });
});

export default router;