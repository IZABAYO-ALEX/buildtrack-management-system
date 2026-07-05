import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('contractor'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/deactivate', deactivateUser);

export default router;
