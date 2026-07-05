import express from 'express';
import { createWorker, getWorkers } from '../controllers/workerController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, workerSchema } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);
router.post('/', authorize('site_manager', 'contractor'), validate(workerSchema), createWorker);
router.get('/', getWorkers);

export default router;
