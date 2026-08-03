import express from 'express';

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  archiveProject,
  deleteProject
} from '../controllers/projectController.js';

import {
  authenticate,
  authorize
} from '../middleware/auth.js';

import {
  validate,
  projectSchema
} from '../middleware/validation.js';


const router = express.Router();


// All project routes require authentication
router.use(authenticate);



// =====================================
// CREATE PROJECT
// Admin + Contractor only
// =====================================

router.post(
  '/',
  authorize(
    'admin',
    'contractor'
  ),
  validate(projectSchema),
  createProject
);



// =====================================
// VIEW ALL PROJECTS
// Admin
// Contractor
// Site Manager
// Accountant
//
// Controller handles ownership:
// Contractor -> own projects
// Site Manager -> assigned projects
// Accountant -> assigned projects
// =====================================

router.get(
  '/',
  authorize(
    'admin',
    'contractor',
    'site_manager',
    'accountant'
  ),
  getProjects
);



// =====================================
// VIEW SINGLE PROJECT
// Admin
// Contractor
// Site Manager
// Accountant
// =====================================

router.get(
  '/:id',
  authorize(
    'admin',
    'contractor',
    'site_manager',
    'accountant'
  ),
  getProjectById
);



// =====================================
// UPDATE PROJECT DETAILS
// Admin + Contractor only
// =====================================

router.put(
  '/:id',
  authorize(
    'admin',
    'contractor'
  ),
  validate(projectSchema),
  updateProject
);



// =====================================
// ARCHIVE PROJECT
// Admin + Contractor only
// =====================================

router.patch(
  '/:id/archive',
  authorize(
    'admin',
    'contractor'
  ),
  archiveProject
);



// =====================================
// DELETE PROJECT
// Admin + Contractor only
// =====================================

router.delete(
  '/:id',
  authorize(
    'admin',
    'contractor'
  ),
  deleteProject
);



export default router;