import express from 'express';
import notificationService from '../services/notificationService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(req.user.id);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    await notificationService.markAsRead(req.user.id, req.params.id);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
