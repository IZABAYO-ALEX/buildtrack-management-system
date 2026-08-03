import express from 'express';

import {
  getUsers,
  createUser,
  verifyUser,
  deleteUser,
  deactivateUser,
  activateUser,
  resetPassword,
  getProjectTeam
} from '../controllers/userController.js';

import {
  authenticate,
  authorize
} from '../middleware/auth.js';


const router = express.Router();


// Every route requires login
router.use(authenticate);


// Only admin and contractor can access user management
router.use(
  authorize(
    'admin',
    'contractor'
  )
);


// Get all users
router.get(
  '/',
  getUsers
);


// Create users
router.post(
  '/',
  createUser
);


// Verify users
router.patch(
  '/:id/verify',
  verifyUser
);


// Delete users
router.delete(
  '/:id',
  deleteUser
);


// Deactivate users
router.patch(
  '/:id/deactivate',
  deactivateUser
);


// Activate users
router.patch(
  '/:id/activate',
  activateUser
);


// Reset password
router.post(
  '/:id/reset-password',
  resetPassword
);
router.get(
  '/team',
  authenticate,
  getProjectTeam
);


export default router;