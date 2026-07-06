import express from 'express';
import {
  createMilestone,
  getMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
  completeMilestone
} from '../controllers/milestoneController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('contractor', 'site_manager'), createMilestone);
router.get('/', getMilestones);
router.get('/:id', getMilestoneById);
router.put('/:id', authorize('contractor', 'site_manager'), updateMilestone);
router.patch('/:id/complete', authorize('contractor', 'site_manager'), completeMilestone);
router.delete('/:id', authorize('contractor'), deleteMilestone);

export default router;
