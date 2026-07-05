import express from 'express';
import { getAudits } from '../controllers/auditController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('contractor'));

router.get('/', getAudits);

export default router;
