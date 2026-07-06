import express from 'express';
import {
  createRequest,
  getRequests,
  approveRequest,
  rejectRequest
} from '../controllers/requestController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createRequest);
router.get('/', getRequests);
router.patch('/:id/approve', authorize('contractor', 'accountant'), approveRequest);
router.patch('/:id/reject', authorize('contractor', 'accountant'), rejectRequest);

export default router;
