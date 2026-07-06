import express from 'express';
import { 
  getContractorDashboard, 
  getSiteManagerDashboard, 
  getAccountantDashboard 
} from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/contractor', authorize('contractor'), getContractorDashboard);
router.get('/site-manager', authorize('site_manager'), getSiteManagerDashboard);
router.get('/accountant', authorize('accountant'), getAccountantDashboard);

export default router;
