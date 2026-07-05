import express from 'express';
import {
  recordAttendance,
  getAttendance,
  updateAttendance
} from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('site_manager', 'contractor'), recordAttendance);
router.get('/', getAttendance);
router.put('/:id', authorize('site_manager', 'contractor'), updateAttendance);

export default router;
