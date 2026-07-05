import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Placeholder routes
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Materials route working' });
});

router.post('/', authorize('site_manager', 'contractor'), (req, res) => {
  res.json({ success: true, message: 'Material created' });
});

export default router;
