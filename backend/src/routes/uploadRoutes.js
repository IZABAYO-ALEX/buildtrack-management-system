import express from 'express';
import { uploadSingle, uploadMultiple } from '../middleware/upload.js';
import { uploadImage, uploadMultipleImages } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/single', uploadSingle('image'), uploadImage);
router.post('/multiple', uploadMultiple('images', 10), uploadMultipleImages);

export default router;
