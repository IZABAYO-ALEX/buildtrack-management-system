import Expense from '../models/Expense.js';
import Project from '../models/Project.js';
import logger from '../utils/logger.js';

export const createExpense = async (req, res) => {
  try {
    const { projectId, category, amount, description, date } = req.body;
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    const expense = await Expense.create({
      projectId,
      category,
      amount,
      description,
      date: date || new Date(),
      recordedBy: req.user.id
    });
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    logger.error('Create expense error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { projectId, category, fromDate, toDate, status } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (category) where.category = category;
    if (status) where.status = status;
    if (fromDate && toDate) {
      where.date = { [Op.between]: [fromDate, toDate] };
    }
    const expenses = await Expense.findAll({
      where,
      include: [{ model: Project, attributes: ['name'] }],
      order: [['date', 'DESC']]
    });
    res.json({ success: true, data: expenses });
  } catch (error) {
    logger.error('Get expenses error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
