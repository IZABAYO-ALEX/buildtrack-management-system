import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Placeholder routes
router.get('/expenses', (req, res) => {
  res.json({ success: true, message: 'Expense report' });
});

router.get('/workers', (req, res) => {
  res.json({ success: true, message: 'Worker report' });
});

router.get('/materials', (req, res) => {
  res.json({ success: true, message: 'Material report' });
});

router.get('/budget', (req, res) => {
  res.json({ success: true, message: 'Budget report' });
});

router.get('/profitability', (req, res) => {
  res.json({ success: true, message: 'Profitability report' });
});

export default router;
