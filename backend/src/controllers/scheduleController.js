import cron from 'node-cron';
import { sequelize } from '../config/database.js';
import Project from '../models/Project.js';
import Expense from '../models/Expense.js';
import Worker from '../models/Worker.js';
import NotificationService from '../services/notificationService.js';
import logger from '../utils/logger.js';

class ScheduleReports {
  constructor() {
    this.schedules = {};
    this.initSchedules();
  }

  initSchedules() {
    // Run daily at 6:00 PM
    this.schedules.daily = cron.schedule('0 18 * * *', () => {
      this.generateDailyReports();
    });

    // Run weekly on Monday at 8:00 AM
    this.schedules.weekly = cron.schedule('0 8 * * 1', () => {
      this.generateWeeklyReports();
    });

    // Run monthly on 1st at 9:00 AM
    this.schedules.monthly = cron.schedule('0 9 1 * *', () => {
      this.generateMonthlyReports();
    });

    // Run budget alerts every hour
    this.schedules.budgetAlerts = cron.schedule('0 * * * *', () => {
      this.checkBudgetAlerts();
    });

    logger.info('📊 Scheduled reports initialized');
  }

  async generateDailyReports() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const projects = await Project.findAll({ where: { status: 'active' } });

      for (const project of projects) {
        const expenses = await Expense.findAll({
          where: { projectId: project.id, date: today }
        });

        const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        const utilization = project.budget > 0 ? (totalExpenses / project.budget) * 100 : 0;

        // Send report to contractor and accountant
        const report = {
          project: project.name,
          date: today,
          totalExpenses,
          budgetUtilization: utilization,
          expenseCount: expenses.length,
          categories: {}
        };

        expenses.forEach(e => {
          if (!report.categories[e.category]) {
            report.categories[e.category] = 0;
          }
          report.categories[e.category] += parseFloat(e.amount);
        });

        logger.info('📊 Daily report generated:', report);
      }
    } catch (error) {
      logger.error('Daily report generation error:', error);
    }
  }

  async generateWeeklyReports() {
    try {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const projects = await Project.findAll();
      
      for (const project of projects) {
        const expenses = await Expense.findAll({
          where: {
            projectId: project.id,
            date: { [Op.gte]: lastWeek }
          }
        });

        const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        
        logger.info(`📊 Weekly report for ${project.name}: $${total}`);
      }
    } catch (error) {
      logger.error('Weekly report generation error:', error);
    }
  }

  async generateMonthlyReports() {
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const projects = await Project.findAll();
      
      for (const project of projects) {
        const expenses = await Expense.findAll({
          where: {
            projectId: project.id,
            date: { [Op.gte]: lastMonth }
          }
        });

        const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        
        logger.info(`📊 Monthly report for ${project.name}: $${total}`);
      }
    } catch (error) {
      logger.error('Monthly report generation error:', error);
    }
  }

  async checkBudgetAlerts() {
    try {
      const projects = await Project.findAll({
        where: { status: 'active' },
        include: [{ model: Expense }]
      });

      for (const project of projects) {
        const totalExpenses = project.Expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        const utilization = project.budget > 0 ? (totalExpenses / project.budget) * 100 : 0;

        if (utilization >= 90 && utilization < 100) {
          await NotificationService.sendNotification(
            'contractor',
            {
              id: `budget_alert_${project.id}`,
              type: 'budget_alert',
              title: `⚠️ Budget Alert: ${project.name}`,
              message: `Budget utilization has reached ${utilization.toFixed(1)}%`,
              data: { projectId: project.id, utilization }
            }
          );
        }

        if (utilization >= 100) {
          await NotificationService.sendNotification(
            'contractor',
            {
              id: `budget_critical_${project.id}`,
              type: 'budget_critical',
              title: `🔴 Critical Budget Alert: ${project.name}`,
              message: `Budget has been exceeded by ${(utilization - 100).toFixed(1)}%`,
              data: { projectId: project.id, utilization }
            }
          );
        }
      }
    } catch (error) {
      logger.error('Budget alert check error:', error);
    }
  }

  stopAll() {
    Object.values(this.schedules).forEach(schedule => {
      if (schedule) schedule.stop();
    });
    logger.info('📊 All scheduled reports stopped');
  }
}

export default new ScheduleReports();
