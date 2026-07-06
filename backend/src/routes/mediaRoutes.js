import express from 'express';
import {
  uploadMedia,
  getMedia,
  approveMedia
} from '../controllers/mediaController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

router.post('/', uploadSingle('file'), uploadMedia);
router.get('/', getMedia);
router.patch('/:id/approve', authorize('contractor'), approveMedia);

export default router;
