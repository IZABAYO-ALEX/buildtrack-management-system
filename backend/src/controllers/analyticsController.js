import { sequelize } from '../config/database.js';
import Project from '../models/Project.js';
import Expense from '../models/Expense.js';
import Worker from '../models/Worker.js';
import Material from '../models/Material.js';
import Attendance from '../models/Attendance.js';
import WorkerPayment from '../models/WorkerPayment.js';
import logger from '../utils/logger.js';

export const getBudgetVsActual = async (req, res) => {
  try {
    const { projectId } = req.query;
    const where = {};
    if (projectId) where.id = projectId;

    const projects = await Project.findAll({
      where,
      include: [{ model: Expense, attributes: ['amount'] }]
    });

    const data = projects.map(p => {
      const actual = p.Expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      return {
        name: p.name,
        budget: parseFloat(p.budget),
        actual: actual,
        variance: parseFloat(p.budget) - actual,
        percentage: p.budget > 0 ? (actual / p.budget) * 100 : 0
      };
    });

    res.json({
      success: true,
      data: {
        projects: data,
        summary: {
          totalBudget: data.reduce((s, p) => s + p.budget, 0),
          totalActual: data.reduce((s, p) => s + p.actual, 0),
          totalVariance: data.reduce((s, p) => s + p.variance, 0)
        }
      }
    });
  } catch (error) {
    logger.error('Budget vs Actual error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProjectProgress = async (req, res) => {
  try {
    const { projectId } = req.query;
    const where = {};
    if (projectId) where.id = projectId;

    const projects = await Project.findAll({
      where,
      include: [
        { model: Expense, attributes: ['amount', 'date'] },
        { model: Worker, attributes: ['id'] },
        { model: Material, attributes: ['id', 'quantity', 'consumedQuantity'] }
      ]
    });

    const data = projects.map(p => {
      const totalExpenses = p.Expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const progress = p.budget > 0 ? (totalExpenses / p.budget) * 100 : 0;
      
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      const now = new Date();
      const totalDays = (end - start) / (1000 * 60 * 60 * 24);
      const elapsedDays = (now - start) / (1000 * 60 * 60 * 24);
      const timelineProgress = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;

      return {
        id: p.id,
        name: p.name,
        budgetProgress: Math.min(progress, 100),
        timelineProgress: Math.min(timelineProgress, 100),
        status: p.status,
        workers: p.Workers.length,
        materials: p.Materials.length,
        totalExpenses
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Project progress error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getWorkerProductivity = async (req, res) => {
  try {
    const { projectId, fromDate, toDate } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;

    const attendance = await Attendance.findAll({
      where,
      include: [{ model: Worker, attributes: ['id', 'fullName', 'role'] }]
    });

    const payments = await WorkerPayment.findAll({
      where: { projectId }
    });

    const workerStats = {};
    attendance.forEach(a => {
      if (!workerStats[a.workerId]) {
        workerStats[a.workerId] = {
          name: a.Worker?.fullName || 'Unknown',
          role: a.Worker?.role || 'Unknown',
          totalHours: 0,
          totalDays: 0,
          presentDays: 0,
          totalPaid: 0
        };
      }
      workerStats[a.workerId].totalHours += parseFloat(a.hoursWorked || 0);
      workerStats[a.workerId].totalDays += 1;
      if (a.status === 'present') {
        workerStats[a.workerId].presentDays += 1;
      }
    });

    payments.forEach(p => {
      if (workerStats[p.workerId]) {
        workerStats[p.workerId].totalPaid += parseFloat(p.amount);
      }
    });

    const data = Object.values(workerStats).map(w => ({
      ...w,
      productivity: w.totalDays > 0 ? (w.presentDays / w.totalDays) * 100 : 0,
      efficiency: w.totalPaid > 0 ? (w.totalHours / (w.totalPaid / 100)) * 100 : 0
    }));

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Worker productivity error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMaterialConsumption = async (req, res) => {
  try {
    const { projectId } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;

    const materials = await Material.findAll({
      where,
      order: [['purchaseDate', 'ASC']]
    });

    const data = materials.map(m => ({
      name: m.name,
      total: parseFloat(m.quantity),
      consumed: parseFloat(m.consumedQuantity || 0),
      remaining: parseFloat(m.remainingQuantity || m.quantity),
      unit: m.unit,
      consumptionRate: m.quantity > 0 ? ((m.consumedQuantity || 0) / m.quantity) * 100 : 0,
      category: m.category || 'Uncategorized'
    }));

    const summary = {
      totalMaterials: data.length,
      totalQuantity: data.reduce((s, m) => s + m.total, 0),
      totalConsumed: data.reduce((s, m) => s + m.consumed, 0),
      totalRemaining: data.reduce((s, m) => s + m.remaining, 0),
      byCategory: {}
    };

    data.forEach(m => {
      if (!summary.byCategory[m.category]) {
        summary.byCategory[m.category] = { total: 0, consumed: 0 };
      }
      summary.byCategory[m.category].total += m.total;
      summary.byCategory[m.category].consumed += m.consumed;
    });

    res.json({ success: true, data: { materials: data, summary } });
  } catch (error) {
    logger.error('Material consumption error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getExpenseBreakdown = async (req, res) => {
  try {
    const { projectId, fromDate, toDate } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (fromDate && toDate) {
      where.date = { [Op.between]: [fromDate, toDate] };
    }

    const expenses = await Expense.findAll({ where });

    const byCategory = {};
    expenses.forEach(e => {
      if (!byCategory[e.category]) {
        byCategory[e.category] = { total: 0, count: 0, items: [] };
      }
      byCategory[e.category].total += parseFloat(e.amount);
      byCategory[e.category].count += 1;
      byCategory[e.category].items.push({
        amount: e.amount,
        description: e.description,
        date: e.date
      });
    });

    const categories = Object.keys(byCategory).map(cat => ({
      name: cat,
      total: byCategory[cat].total,
      count: byCategory[cat].count,
      percentage: expenses.length > 0 ? (byCategory[cat].total / expenses.reduce((s, e) => s + parseFloat(e.amount), 0)) * 100 : 0
    }));

    res.json({
      success: true,
      data: {
        categories,
        total: expenses.reduce((s, e) => s + parseFloat(e.amount), 0),
        count: expenses.length,
        breakdown: byCategory
      }
    });
  } catch (error) {
    logger.error('Expense breakdown error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProfitLoss = async (req, res) => {
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
      const expenses = p.Expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
      const labor = p.WorkerPayments.reduce((s, w) => s + parseFloat(w.amount), 0);
      const materials = p.Materials.reduce((s, m) => s + parseFloat(m.totalCost || 0), 0);
      const totalCost = expenses + labor + materials;
      const revenue = parseFloat(p.budget);
      const profit = revenue - totalCost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        project: p.name,
        revenue,
        expenses,
        labor,
        materials,
        totalCost,
        profit,
        margin
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Profit/Loss error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCashFlow = async (req, res) => {
  try {
    const { projectId, months = 6 } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;

    const expenses = await Expense.findAll({
      where,
      order: [['date', 'ASC']]
    });

    const payments = await WorkerPayment.findAll({
      where,
      order: [['paymentDate', 'ASC']]
    });

    const cashFlow = {};
    const now = new Date();
    
    for (let i = 0; i < months; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const key = date.toISOString().slice(0, 7);
      cashFlow[key] = { income: 0, expenses: 0, balance: 0 };
    }

    expenses.forEach(e => {
      const key = e.date.slice(0, 7);
      if (cashFlow[key]) {
        cashFlow[key].expenses += parseFloat(e.amount);
      }
    });

    payments.forEach(p => {
      const key = p.paymentDate.slice(0, 7);
      if (cashFlow[key]) {
        cashFlow[key].income += parseFloat(p.amount);
      }
    });

    let runningBalance = 0;
    const sortedKeys = Object.keys(cashFlow).sort();
    sortedKeys.forEach(key => {
      runningBalance += cashFlow[key].income - cashFlow[key].expenses;
      cashFlow[key].balance = runningBalance;
    });

    res.json({
      success: true,
      data: cashFlow
    });
  } catch (error) {
    logger.error('Cash flow error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
