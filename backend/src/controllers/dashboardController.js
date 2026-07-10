import { sequelize } from '../config/database.js';
import Project from '../models/Project.js';
import Expense from '../models/Expense.js';
import Worker from '../models/Worker.js';
import WorkerPayment from '../models/WorkerPayment.js';
import Material from '../models/Material.js';
import DailyReport from '../models/DailyReport.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';
import Attendance from '../models/Attendance.js';

const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const getContractorDashboard = async (req, res) => {
  try {
    const contractorId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get all projects for this contractor
    const projects = await Project.findAll({
      where: { contractorId, isArchived: false }
    });

    const projectIds = projects.map(p => p.id);

    // Get all data
    const expenses = await Expense.findAll({
      where: { projectId: projectIds }
    });

    const workers = await Worker.findAll({
      where: { projectId: projectIds }
    });

    const payments = await WorkerPayment.findAll({
      where: { workerId: workers.map(w => w.id) }
    });

    const materials = await Material.findAll({
      where: { projectId: projectIds }
    });

    const dailyReports = await DailyReport.findAll({
      where: { projectId: projectIds }
    });

    // ===== Current Period (Last 30 days) =====
    const currentExpenses = expenses.filter(e => new Date(e.date) >= thirtyDaysAgo);
    const previousExpenses = expenses.filter(e => 
      new Date(e.date) >= sixtyDaysAgo && new Date(e.date) < thirtyDaysAgo
    );

    const currentWorkers = workers.filter(w => new Date(w.createdAt) >= thirtyDaysAgo);
    const previousWorkers = workers.filter(w => 
      new Date(w.createdAt) >= sixtyDaysAgo && new Date(w.createdAt) < thirtyDaysAgo
    );

    const currentProjects = projects.filter(p => new Date(p.createdAt) >= thirtyDaysAgo);
    const previousProjects = projects.filter(p => 
      new Date(p.createdAt) >= sixtyDaysAgo && new Date(p.createdAt) < thirtyDaysAgo
    );

    const currentReports = dailyReports.filter(r => new Date(r.createdAt) >= thirtyDaysAgo);
    const previousReports = dailyReports.filter(r => 
      new Date(r.createdAt) >= sixtyDaysAgo && new Date(r.createdAt) < thirtyDaysAgo
    );

    // ===== Calculate Percentages =====
    const currentTotalExpenses = currentExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const previousTotalExpenses = previousExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const expenseChange = calculatePercentageChange(currentTotalExpenses, previousTotalExpenses);

    const currentTotalWorkers = currentWorkers.length;
    const previousTotalWorkers = previousWorkers.length;
    const workerChange = calculatePercentageChange(currentTotalWorkers, previousTotalWorkers);

    const currentTotalProjects = currentProjects.length;
    const previousTotalProjects = previousProjects.length;
    const projectChange = calculatePercentageChange(currentTotalProjects, previousTotalProjects);

    const currentTotalReports = currentReports.length;
    const previousTotalReports = previousReports.length;
    const reportChange = calculatePercentageChange(currentTotalReports, previousTotalReports);

    // ===== Budget Utilization Change =====
    const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const currentUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

    const previousMonthBudget = totalBudget * 0.9;
    const previousMonthExpenses = totalExpenses * 0.85;
    const previousUtilization = previousMonthBudget > 0 ? (previousMonthExpenses / previousMonthBudget) * 100 : 0;
    const utilizationChange = calculatePercentageChange(currentUtilization, previousUtilization);

    // ===== Summary =====
    const summary = {
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalBudget,
      totalExpenses,
      totalWorkers: workers.length,
      totalPayments: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      materialCosts: materials.reduce((sum, m) => sum + parseFloat(m.totalCost || 0), 0),
      budgetUtilization: currentUtilization,
      remainingBudget: totalBudget - totalExpenses,
      todaysReports: dailyReports.filter(r => r.date === today).length,
      // Percentage changes
      expenseChange: parseFloat(expenseChange.toFixed(1)),
      workerChange: parseFloat(workerChange.toFixed(1)),
      projectChange: parseFloat(projectChange.toFixed(1)),
      reportChange: parseFloat(reportChange.toFixed(1)),
      utilizationChange: parseFloat(utilizationChange.toFixed(1))
    };

    // Project breakdown
    const projectBreakdown = projects.map(project => {
      const projectExpenses = expenses.filter(e => e.projectId === project.id);
      return {
        id: project.id,
        name: project.name,
        budget: project.budget,
        expenses: projectExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
        workers: workers.filter(w => w.projectId === project.id).length,
        status: project.status,
        utilization: project.budget > 0 ? (projectExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) / project.budget) * 100 : 0
      };
    });

    res.json({
      success: true,
      data: {
        summary,
        projectBreakdown,
        recentExpenses: expenses.slice(0, 5)
      },
      user: {
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSiteManagerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const projects = await Project.findAll({
      where: { siteManagerId: userId, isArchived: false }
    });

    const projectIds = projects.map(p => p.id);

    const expenses = await Expense.findAll({
      where: { projectId: projectIds }
    });

    const workers = await Worker.findAll({
      where: { projectId: projectIds, isActive: true }
    });

    const materials = await Material.findAll({
      where: { projectId: projectIds }
    });

    const attendance = await Attendance.findAll({
      where: { projectId: projectIds, date: today }
    });

    // Calculate changes
    const currentWorkers = workers.filter(w => new Date(w.createdAt) >= thirtyDaysAgo);
    const previousWorkers = workers.filter(w => 
      new Date(w.createdAt) >= sixtyDaysAgo && new Date(w.createdAt) < thirtyDaysAgo
    );
    const workerChange = calculatePercentageChange(currentWorkers.length, previousWorkers.length);

    const currentExpenses = expenses.filter(e => new Date(e.date) >= thirtyDaysAgo);
    const previousExpenses = expenses.filter(e => 
      new Date(e.date) >= sixtyDaysAgo && new Date(e.date) < thirtyDaysAgo
    );
    const currentTotal = currentExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const previousTotal = previousExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const expenseChange = calculatePercentageChange(currentTotal, previousTotal);

    const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalMaterials = materials.reduce((sum, m) => sum + parseFloat(m.quantity || 0), 0);
    const consumedMaterials = materials.reduce((sum, m) => sum + parseFloat(m.consumedQuantity || 0), 0);

    const summary = {
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalBudget,
      totalExpenses,
      totalWorkers: workers.length,
      presentToday: attendance.filter(a => a.status === 'present').length,
      totalMaterials,
      consumedMaterials,
      materialUtilization: totalMaterials > 0 ? (consumedMaterials / totalMaterials) * 100 : 0,
      remainingBudget: totalBudget - totalExpenses,
      budgetUtilization: totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0,
      expenseChange: parseFloat(expenseChange.toFixed(1)),
      workerChange: parseFloat(workerChange.toFixed(1))
    };

    res.json({
      success: true,
      data: {
        summary,
        projects: projects.map(p => ({ id: p.id, name: p.name, status: p.status, progress: p.progress || 0 }))
      },
      user: {
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    logger.error('Site Manager Dashboard error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAccountantDashboard = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const projects = await Project.findAll({ where: { isArchived: false } });
    const projectIds = projects.map(p => p.id);

    const expenses = await Expense.findAll({ where: { projectId: projectIds } });
    const workers = await Worker.findAll({ where: { projectId: projectIds } });
    const payments = await WorkerPayment.findAll({ where: { workerId: workers.map(w => w.id) } });
    const materials = await Material.findAll({ where: { projectId: projectIds } });

    // Calculate revenue and expenses
    const totalRevenue = projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Calculate changes
    const currentExpenses = expenses.filter(e => new Date(e.date) >= thirtyDaysAgo);
    const previousExpenses = expenses.filter(e => 
      new Date(e.date) >= sixtyDaysAgo && new Date(e.date) < thirtyDaysAgo
    );
    const currentTotal = currentExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const previousTotal = previousExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const expenseChange = calculatePercentageChange(currentTotal, previousTotal);

    const currentRevenue = projects.filter(p => new Date(p.createdAt) >= thirtyDaysAgo)
      .reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
    const previousRevenue = projects.filter(p => 
      new Date(p.createdAt) >= sixtyDaysAgo && new Date(p.createdAt) < thirtyDaysAgo
    ).reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
    const revenueChange = calculatePercentageChange(currentRevenue, previousRevenue);

    const currentProfit = netProfit;
    const previousProfit = previousRevenue - previousTotal;
    const profitChange = calculatePercentageChange(currentProfit, previousProfit);

    const summary = {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      pendingApprovals: expenses.filter(e => e.status === 'pending').length,
      totalProjects: projects.length,
      totalPayments: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      materialCosts: materials.reduce((sum, m) => sum + parseFloat(m.totalCost || 0), 0),
      totalWorkers: workers.length,
      expenseChange: parseFloat(expenseChange.toFixed(1)),
      revenueChange: parseFloat(revenueChange.toFixed(1)),
      profitChange: parseFloat(profitChange.toFixed(1))
    };

    res.json({
      success: true,
      data: {
        summary,
        recentExpenses: expenses.slice(0, 10),
        expenseBreakdown: expenses.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount || 0);
          return acc;
        }, {})
      },
      user: {
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    logger.error('Accountant Dashboard error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
