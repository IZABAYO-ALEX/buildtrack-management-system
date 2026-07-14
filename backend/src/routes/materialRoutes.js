import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.post('/:id/reject', authenticate, authorize('contractor'), expenseController.reject);

// Placeholder routes
router.get('/', authenticate, materialController.getAll);
router.get('/:id', authenticate, materialController.getOne);
router.post('/', authenticate, authorize('contractor'), materialController.create);
router.put('/:id', authenticate, authorize('contractor'), materialController.update);
router.delete('/:id', authenticate, authorize('contractor'), materialController.delete);

router.post('/', authorize('site_manager', 'contractor'), (req, res) => {
  res.json({ success: true, message: 'Material created' });
});

export default router;
