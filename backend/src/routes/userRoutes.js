import express from 'express';
import {
  getUsers,
  createUser,
  verifyUser,
  deleteUser,
  deactivateUser,
  activateUser,
  resetPassword
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(['contractor', 'accountant']));

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id/verify', verifyUser);
router.delete('/:id', deleteUser);
router.patch('/:id/deactivate', deactivateUser);
router.patch('/:id/activate', activateUser);
router.post('/:id/reset-password', resetPassword);

export default router;
