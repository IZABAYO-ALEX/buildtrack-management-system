import { Expense, Project } from '../models/index.js';
import logger from '../utils/logger.js';

export const createExpense = async (req, res) => {
  try {
    const { projectId, category, amount, description, date, invoiceNumber, supplier } = req.body;
    
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const expense = await Expense.create({
      projectId,
      category,
      amount,
      description,
      date: date || new Date().toISOString().split('T')[0],
      invoiceNumber,
      supplier,
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
      include: [{ model: Project, attributes: ['id', 'name'] }],
      order: [['date', 'DESC']]
    });

    const summary = {
      total: expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0),
      pending: expenses.filter(e => e.status === 'pending').length,
      approved: expenses.filter(e => e.status === 'approved').length,
      rejected: expenses.filter(e => e.status === 'rejected').length,
      byCategory: {}
    };

    expenses.forEach(e => {
      summary.byCategory[e.category] = (summary.byCategory[e.category] || 0) + parseFloat(e.amount);
    });

    res.json({ success: true, data: expenses, summary });
  } catch (error) {
    logger.error('Get expenses error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await expense.update(req.body);

    res.json({ success: true, data: expense });
  } catch (error) {
    logger.error('Update expense error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const approveExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await expense.update({
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date()
    });

    res.json({ success: true, data: expense });
  } catch (error) {
    logger.error('Approve expense error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await expense.destroy();

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    logger.error('Delete expense error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
