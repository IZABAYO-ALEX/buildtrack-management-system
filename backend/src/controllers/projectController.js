import Project from '../models/Project.js';
import Expense from '../models/Expense.js';
import Worker from '../models/Worker.js';
import User from '../models/User.js';
import Audit from '../models/Audit.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';

const generateProjectCode = () => {
  const prefix = 'PRJ';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}${month}-${random}`;
};

export const createProject = async (req, res) => {
  try {
    const {
      name,
      clientName,
      clientEmail,
      clientPhone,
      description,
      location,
      budget,
      contractValue,
      currency,
      startDate,
      endDate,
      status,
      priority,
      category,
      projectType,
      siteArea,
      numberOfUnits,
      numberOfFloors,
      completionDate,
      siteManagerId,
      accountantId,
      tags,
      riskLevel,
      notes
    } = req.body;

    if (!name || name.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Project name must be at least 3 characters'
      });
    }

    if (!budget || budget <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid budget is required'
      });
    }

    const projectCode = generateProjectCode();

    const project = await Project.create({
      name,
      projectCode,
      clientName,
      clientEmail,
      clientPhone,
      description,
      location,
      budget,
      contractValue: contractValue || budget,
      currency: currency || 'UGX',
      startDate,
      endDate,
      status: status || 'planning',
      priority: priority || 'medium',
      category,
      projectType,
      siteArea,
      numberOfUnits,
      numberOfFloors,
      completionDate,
      contractorId: req.user.id,
      siteManagerId,
      accountantId,
      tags: tags || [],
      riskLevel: riskLevel || 'medium',
      notes,
      progress: 0,
      completionPercentage: 0,
      actualCost: 0,
      isArchived: false
    });

    await Audit.create({
      userId: req.user.id,
      action: 'CREATE_PROJECT',
      details: { projectId: project.id, name: project.name, code: project.projectCode },
      affectedRecord: project.id
    });

    res.status(201).json({
      success: true,
      data: project,
      message: `Project "${name}" created successfully! Code: ${projectCode}`
    });
  } catch (error) {
    logger.error('Create project error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const { status, search, includeArchived, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (!includeArchived) where.isArchived = false;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { projectCode: { [Op.iLike]: `%${search}%` } },
        { clientName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const projects = await Project.findAll({
      where,
      include: [
        { 
          model: Expense, 
          as: 'expenses', 
          attributes: ['id', 'amount'],
          required: false
        },
        { 
          model: Worker, 
          as: 'workers', 
          attributes: ['id'],
          required: false
        },
        {
          model: User,
          as: 'contractor',
          attributes: ['id', 'fullName', 'email'],
          required: false
        },
        {
          model: User,
          as: 'siteManager',
          attributes: ['id', 'fullName', 'email'],
          required: false
        },
        {
          model: User,
          as: 'accountant',
          attributes: ['id', 'fullName', 'email'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Project.count({ where });

    const projectsWithMetrics = projects.map(project => {
      const totalExpenses = project.expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0;
      const remainingBudget = project.budget - totalExpenses;
      const budgetUtilization = project.budget > 0 ? (totalExpenses / project.budget) * 100 : 0;

      return {
        ...project.toJSON(),
        totalExpenses,
        remainingBudget,
        budgetUtilization,
        workerCount: project.workers?.length || 0
      };
    });

    res.json({
      success: true,
      data: projectsWithMetrics,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get projects error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { 
          model: Expense, 
          as: 'expenses', 
          attributes: ['id', 'amount', 'category', 'description', 'date'],
          required: false
        },
        { 
          model: Worker, 
          as: 'workers', 
          attributes: ['id', 'fullName', 'role'],
          required: false
        },
        {
          model: User,
          as: 'siteManager',
          attributes: ['id', 'fullName', 'email'],
          required: false
        },
        {
          model: User,
          as: 'accountant',
          attributes: ['id', 'fullName', 'email'],
          required: false
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const totalExpenses = project.expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0;
    const remainingBudget = project.budget - totalExpenses;
    const budgetUtilization = project.budget > 0 ? (totalExpenses / project.budget) * 100 : 0;

    res.json({
      success: true,
      data: {
        ...project.toJSON(),
        totalExpenses,
        remainingBudget,
        budgetUtilization,
        workerCount: project.workers?.length || 0
      }
    });
  } catch (error) {
    logger.error('Get project error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await project.update(req.body);

    await Audit.create({
      userId: req.user.id,
      action: 'UPDATE_PROJECT',
      details: { projectId: project.id, changes: req.body },
      affectedRecord: project.id
    });

    res.json({ success: true, data: project, message: 'Project updated successfully' });
  } catch (error) {
    logger.error('Update project error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await project.destroy();

    await Audit.create({
      userId: req.user.id,
      action: 'DELETE_PROJECT',
      details: { projectId: project.id, name: project.name },
      affectedRecord: project.id
    });

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    logger.error('Delete project error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const archiveProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.isArchived = true;
    await project.save();

    await Audit.create({
      userId: req.user.id,
      action: 'ARCHIVE_PROJECT',
      details: { projectId: project.id, name: project.name },
      affectedRecord: project.id
    });

    res.json({ success: true, message: 'Project archived successfully' });
  } catch (error) {
    logger.error('Archive project error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProjectProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
    }

    project.progress = progress;
    project.completionPercentage = progress;
    await project.save();

    res.json({ success: true, data: project, message: 'Progress updated successfully' });
  } catch (error) {
    logger.error('Update progress error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
