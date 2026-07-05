import express from 'express';
import { getContractorDashboard } from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/contractor', authorize('contractor'), getContractorDashboard);

export default router;
