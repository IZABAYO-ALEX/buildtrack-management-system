import Expense from '../models/Expense.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Audit from '../models/Audit.js';
import NotificationService from '../services/notificationService.js';
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
      recordedBy: req.user.id,
      status: req.user.role === 'contractor' ? 'approved' : 'pending'
    });

    await Audit.create({
      userId: req.user.id,
      action: 'CREATE_EXPENSE',
      details: { expenseId: expense.id, amount, category },
      affectedRecord: expense.id
    });

    if (expense.status === 'pending') {
      const accountant = await User.findOne({ where: { role: 'accountant' } });
      if (accountant) {
        await NotificationService.sendNotification(accountant.id, {
          id: `expense_pending_${expense.id}`,
          type: 'expense_pending',
          title: 'Expense Pending Approval',
          message: `${req.user.fullName} recorded an expense of $${amount} for ${project.name}`,
          data: { expenseId: expense.id }
        });
      }
    }

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    logger.error('Create expense error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const approveExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const expense = await Expense.findByPk(id, {
      include: [{ model: Project, as: 'project', attributes: ['name'] }]
    });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (expense.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Expense is already ${expense.status}` 
      });
    }

    expense.status = 'approved';
    expense.approvedBy = req.user.id;
    expense.approvedAt = new Date();
    expense.approvalNotes = notes || null;
    await expense.save();

    await Audit.create({
      userId: req.user.id,
      action: 'APPROVE_EXPENSE',
      details: { expenseId: expense.id, amount: expense.amount },
      affectedRecord: expense.id
    });

    await NotificationService.sendNotification(expense.recordedBy, {
      id: `expense_approved_${expense.id}`,
      type: 'expense_approved',
      title: 'Expense Approved',
      message: `Your expense of $${expense.amount} for ${expense.project?.name} was approved by ${req.user.fullName}`,
      data: { expenseId: expense.id }
    });

    res.json({ 
      success: true, 
      data: expense, 
      message: 'Expense approved successfully' 
    });
  } catch (error) {
    logger.error('Approve expense error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const rejectExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection reason is required' 
      });
    }

    const expense = await Expense.findByPk(id, {
      include: [{ model: Project, as: 'project', attributes: ['name'] }]
    });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (expense.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Expense is already ${expense.status}` 
      });
    }

    expense.status = 'rejected';
    expense.approvedBy = req.user.id;
    expense.approvedAt = new Date();
    expense.rejectionReason = reason;
    await expense.save();

    await Audit.create({
      userId: req.user.id,
      action: 'REJECT_EXPENSE',
      details: { expenseId: expense.id, reason },
      affectedRecord: expense.id
    });

    await NotificationService.sendNotification(expense.recordedBy, {
      id: `expense_rejected_${expense.id}`,
      type: 'expense_rejected',
      title: 'Expense Rejected',
      message: `Your expense of $${expense.amount} for ${expense.project?.name} was rejected. Reason: ${reason}`,
      data: { expenseId: expense.id }
    });

    res.json({ 
      success: true, 
      data: expense, 
      message: 'Expense rejected' 
    });
  } catch (error) {
    logger.error('Reject expense error:', error);
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
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'recorder', attributes: ['id', 'fullName'] },
        { model: User, as: 'approver', attributes: ['id', 'fullName'] }
      ],
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

    if (expense.status === 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Approved expenses cannot be edited' 
      });
    }

    await expense.update(req.body);
    res.json({ success: true, data: expense });
  } catch (error) {
    logger.error('Update expense error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (expense.status === 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Approved expenses cannot be deleted' 
      });
    }

    await expense.destroy();

    await Audit.create({
      userId: req.user.id,
      action: 'DELETE_EXPENSE',
      details: { expenseId: expense.id },
      affectedRecord: expense.id
    });

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    logger.error('Delete expense error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
