import express from 'express';
import {
  createWorker,
  getWorkers,
  updateWorker,
  deleteWorker
} from '../controllers/workerController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { validate, workerSchema } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/', 
  authorize('site_manager', 'contractor'),
  uploadSingle('photo'),
  validate(workerSchema),
  createWorker
);

router.get('/', getWorkers);

router.put(
  '/:id',
  authorize('site_manager', 'contractor'),
  uploadSingle('photo'),
  updateWorker
);

router.delete('/:id', authorize('site_manager', 'contractor'), deleteWorker);

export default router;
