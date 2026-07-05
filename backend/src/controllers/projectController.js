import { Project, Expense, Worker } from '../models/index.js';
import logger from '../utils/logger.js';

export const createProject = async (req, res) => {
  try {
    const { name, clientName, description, location, budget, startDate, endDate, status } = req.body;

    const project = await Project.create({
      name,
      clientName,
      description,
      location,
      budget,
      startDate,
      endDate,
      status: status || 'planning',
      contractorId: req.user.id
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    logger.error('Create project error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const { status, includeArchived } = req.query;
    const where = {};

    if (status) where.status = status;
    if (!includeArchived) where.isArchived = false;

    const projects = await Project.findAll({
      where,
      include: [
        { model: Expense, attributes: ['id', 'amount'], required: false },
        { model: Worker, attributes: ['id'], required: false }
      ],
      order: [['created_at', 'DESC']]
    });

    const projectsWithMetrics = projects.map(project => {
      const totalExpenses = project.Expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0;
      const remainingBudget = project.budget - totalExpenses;
      const budgetUtilization = project.budget > 0 ? (totalExpenses / project.budget) * 100 : 0;

      return {
        ...project.toJSON(),
        totalExpenses,
        remainingBudget,
        budgetUtilization,
        workerCount: project.Workers?.length || 0
      };
    });

    res.json({ success: true, data: projectsWithMetrics });
  } catch (error) {
    logger.error('Get projects error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Expense, attributes: ['id', 'amount', 'category', 'description', 'date'], required: false },
        { model: Worker, attributes: ['id', 'fullName', 'role'], required: false }
      ]
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const totalExpenses = project.Expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0;
    const remainingBudget = project.budget - totalExpenses;
    const budgetUtilization = project.budget > 0 ? (totalExpenses / project.budget) * 100 : 0;

    res.json({
      success: true,
      data: {
        ...project.toJSON(),
        totalExpenses,
        remainingBudget,
        budgetUtilization,
        workerCount: project.Workers?.length || 0
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

    res.json({ success: true, data: project });
  } catch (error) {
    logger.error('Update project error:', error);
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

    res.json({ success: true, message: 'Project archived successfully' });
  } catch (error) {
    logger.error('Archive project error:', error);
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

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    logger.error('Delete project error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
