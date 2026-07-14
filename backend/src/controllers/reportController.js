import { sequelize } from '../config/database.js';
import Project from '../models/Project.js';
import Expense from '../models/Expense.js';
import Worker from '../models/Worker.js';
import WorkerPayment from '../models/WorkerPayment.js';
import Material from '../models/Material.js';
import Attendance from '../models/Attendance.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

export const getExpenseReport = async (req, res) => {
  try {
    const { projectId, category, fromDate, toDate } = req.query;
    const where = {};

    if (projectId) where.projectId = projectId;
    if (category) where.category = category;
    if (fromDate && toDate) {
      where.date = { [Op.between]: [fromDate, toDate] };
    }

    const expenses = await Expense.findAll({ where, include: [{ model: Project, attributes: ['name'] }] });

    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const byCategory = {};
    const byProject = {};
    const byDate = {};

    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + parseFloat(e.amount);
      byProject[e.projectId] = (byProject[e.projectId] || 0) + parseFloat(e.amount);
      const date = e.date;
      byDate[date] = (byDate[date] || 0) + parseFloat(e.amount);
    });

    res.json({
      success: true,
      data: {
        total,
        count: expenses.length,
        byCategory,
        byProject,
        byDate,
        expenses
      }
    });
  } catch (error) {
    logger.error('Expense report error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getWorkerReport = async (req, res) => {
  try {
    const { workerId, projectId, fromDate, toDate } = req.query;
    const where = {};
    if (workerId) where.workerId = workerId;
    if (projectId) where.projectId = projectId;

    const attendance = await Attendance.findAll({
      where,
      include: [{ model: Worker, attributes: ['fullName', 'role'] }]
    });

    const payments = await WorkerPayment.findAll({
      where: { ...(workerId ? { workerId } : {}) },
      include: [{ model: Worker, attributes: ['fullName'] }]
    });

    const totalHours = attendance.reduce((sum, a) => sum + parseFloat(a.hoursWorked || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    res.json({
      success: true,
      data: {
        attendance,
        payments,
        totalHours,
        totalPaid,
        workerCount: new Set(attendance.map(a => a.workerId)).size
      }
    });
  } catch (error) {
    logger.error('Worker report error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMaterialReport = async (req, res) => {
  try {
    const { projectId, supplier } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (supplier) where.supplier = supplier;

    const materials = await Material.findAll({ where, include: [{ model: Project, attributes: ['name'] }] });

    const totalSpent = materials.reduce((sum, m) => sum + parseFloat(m.totalCost), 0);
    const totalConsumed = materials.reduce((sum, m) => sum + parseFloat(m.consumedQuantity || 0), 0);

    res.json({
      success: true,
      data: {
        materials,
        totalSpent,
        totalConsumed,
        bySupplier: materials.reduce((acc, m) => {
          acc[m.supplier] = (acc[m.supplier] || 0) + parseFloat(m.totalCost);
          return acc;
        }, {})
      }
    });
  } catch (error) {
    logger.error('Material report error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getBudgetReport = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [{ model: Expense }]
    });

    const data = projects.map(p => {
      const totalExpenses = p.Expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      return {
        projectId: p.id,
        name: p.name,
        budget: p.budget,
        spent: totalExpenses,
        remaining: p.budget - totalExpenses,
        utilization: p.budget > 0 ? (totalExpenses / p.budget) * 100 : 0
      };
    });

    res.json({
      success: true,
      data: {
        projects: data,
        totalBudget: data.reduce((sum, p) => sum + p.budget, 0),
        totalSpent: data.reduce((sum, p) => sum + p.spent, 0),
        totalRemaining: data.reduce((sum, p) => sum + p.remaining, 0)
      }
    });
  } catch (error) {
    logger.error('Budget report error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProfitabilityReport = async (req, res) => {
  try {
    const { projectId } = req.query;
    const where = {};
    if (projectId) where.id = projectId;

    const projects = await Project.findAll({
      where,
      include: [
        { model: Expense },
        { model: WorkerPayment },
        { model: Material }
      ]
    });

    const data = projects.map(p => {
      const expenses = p.Expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const labor = p.WorkerPayments.reduce((sum, w) => sum + parseFloat(w.amount), 0);
      const materials = p.Materials.reduce((sum, m) => sum + parseFloat(m.totalCost), 0);
      const totalCost = expenses + labor + materials;
      const revenue = p.budget;
      const profit = revenue - totalCost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        projectId: p.id,
        name: p.name,
        revenue,
        expenses,
        labor,
        materials,
        totalCost,
        profit,
        margin
      };
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Profitability report error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
