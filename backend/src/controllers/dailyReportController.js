import DailyReport from '../models/DailyReport.js';
import Attendance from '../models/Attendance.js';
import Material from '../models/Material.js';
import Expense from '../models/Expense.js';
import Worker from '../models/Worker.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export const generateDailyReport = async (req, res) => {
  try {
    const { projectId, date } = req.body;

    if (!projectId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Project ID is required' 
      });
    }

    const reportDate = date || new Date().toISOString().split('T')[0];

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    const attendance = await Attendance.findAll({
      where: { projectId, date: reportDate },
      include: [{ model: Worker, as: 'worker', attributes: ['id', 'fullName', 'role'] }]
    });

    const materials = await Material.findAll({
      where: { projectId }
    });

    const expenses = await Expense.findAll({
      where: { projectId, date: reportDate }
    });

    const workersPresent = attendance.filter(a => a.status === 'present').length;
    const totalHoursWorked = attendance.reduce((sum, a) => sum + parseFloat(a.hoursWorked || 0), 0);

    const materialsUsed = {};
    let totalExpenses = 0;

    expenses.forEach(e => {
      totalExpenses += parseFloat(e.amount);
      if (!materialsUsed[e.category]) {
        materialsUsed[e.category] = [];
      }
      materialsUsed[e.category].push({
        amount: e.amount,
        description: e.description
      });
    });

    const report = await DailyReport.create({
      projectId,
      date: reportDate,
      workersPresent,
      totalHoursWorked,
      materialsUsed,
      expenses: materialsUsed,
      totalExpenses,
      summary: `Daily report for ${reportDate}`,
      generatedBy: req.user.id,
      sentToAccountant: true,
      sentToContractor: true,
      syncStatus: 'synced'
    });

    for (const material of materials) {
      const dailyConsumption = material.dailyConsumption || {};
      dailyConsumption[reportDate] = material.consumedQuantity || 0;
      material.dailyConsumption = dailyConsumption;
      material.remainingQuantity = material.quantity - (material.consumedQuantity || 0);
      await material.save();
    }

    res.status(201).json({
      success: true,
      data: report,
      message: 'Daily report generated successfully'
    });
  } catch (error) {
    logger.error('Generate daily report error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getDailyReports = async (req, res) => {
  try {
    const { projectId, fromDate, toDate } = req.query;
    const where = {};

    if (projectId) where.projectId = projectId;
    if (fromDate && toDate) {
      where.date = { [Op.between]: [fromDate, toDate] };
    }

    const reports = await DailyReport.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'generator', attributes: ['id', 'fullName'] }
      ],
      order: [['date', 'DESC']]
    });

    res.json({ success: true, data: reports });
  } catch (error) {
    logger.error('Get daily reports error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getDailyReportById = async (req, res) => {
  try {
    const report = await DailyReport.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'generator', attributes: ['id', 'fullName'] }
      ]
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Get daily report error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const syncReports = async (req, res) => {
  try {
    const { reportIds } = req.body;

    await DailyReport.update(
      { syncStatus: 'synced', sentToContractor: true, sentToAccountant: true },
      { where: { id: reportIds } }
    );

    res.json({
      success: true,
      message: 'Reports synced successfully'
    });
  } catch (error) {
    logger.error('Sync reports error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSiteManagerDashboard = async (req, res) => {
  try {
    const projectId = req.query.projectId;
    const today = new Date().toISOString().split('T')[0];

    if (!projectId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Project ID is required' 
      });
    }

    const todayAttendance = await Attendance.findAll({
      where: { projectId, date: today },
      include: [{ model: Worker, as: 'worker', attributes: ['id', 'fullName'] }]
    });

    const todayExpenses = await Expense.findAll({
      where: { projectId, date: today }
    });

    const materials = await Material.findAll({
      where: { projectId }
    });

    const workers = await Worker.findAll({
      where: { projectId, isActive: true }
    });

    const dashboardData = {
      date: today,
      workers: {
        total: workers.length,
        present: todayAttendance.filter(a => a.status === 'present').length,
        absent: todayAttendance.filter(a => a.status === 'absent').length,
        onLeave: todayAttendance.filter(a => a.status === 'leave').length,
        details: todayAttendance
      },
      expenses: {
        total: todayExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0),
        count: todayExpenses.length,
        details: todayExpenses
      },
      materials: materials.map(m => ({
        id: m.id,
        name: m.name,
        total: parseFloat(m.quantity),
        consumed: parseFloat(m.consumedQuantity || 0),
        remaining: parseFloat(m.remainingQuantity || m.quantity),
        unit: m.unit
      })),
      summary: {
        totalWorkers: workers.length,
        totalMaterials: materials.length,
        totalExpenses: todayExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
      }
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    logger.error('Get site manager dashboard error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
