import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, projectSchema } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);
router.post('/', authorize('contractor'), validate(projectSchema), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', authorize('contractor'), validate(projectSchema), updateProject);
router.delete('/:id', authorize('contractor'), deleteProject);

export default router;
