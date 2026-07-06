import nodemailer from 'nodemailer';
import { createClient } from 'redis';
import logger from '../utils/logger.js';

class NotificationService {
  constructor() {
    this.redisClient = null;
    this.emailTransporter = null;
    this.init();
  }

  async init() {
    try {
      // Redis for real-time notifications
      this.redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      await this.redisClient.connect();
      logger.info('Redis connected for notifications');
    } catch (error) {
      logger.warn('Redis not available, notifications will be stored in memory');
    }

    // Email transporter
    if (process.env.EMAIL_HOST) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
  }

  async sendNotification(userId, notification) {
    try {
      // Store in Redis for real-time delivery
      if (this.redisClient) {
        await this.redisClient.lPush(`notifications:${userId}`, JSON.stringify({
          ...notification,
          read: false,
          createdAt: new Date().toISOString()
        }));
        // Keep only last 100 notifications per user
        await this.redisClient.lTrim(`notifications:${userId}`, 0, 99);
        
        // Publish for real-time updates
        await this.redisClient.publish(`user:${userId}:notifications`, JSON.stringify(notification));
      }
    } catch (error) {
      logger.error('Failed to send notification:', error);
    }
  }

  async getNotifications(userId, limit = 20) {
    try {
      if (this.redisClient) {
        const notifications = await this.redisClient.lRange(`notifications:${userId}`, 0, limit - 1);
        return notifications.map(n => JSON.parse(n));
      }
    } catch (error) {
      logger.error('Failed to get notifications:', error);
    }
    return [];
  }

  async markAsRead(userId, notificationId) {
    try {
      if (this.redisClient) {
        const notifications = await this.redisClient.lRange(`notifications:${userId}`, 0, -1);
        const updated = notifications.map(n => {
          const notif = JSON.parse(n);
          if (notif.id === notificationId) {
            notif.read = true;
          }
          return JSON.stringify(notif);
        });
        await this.redisClient.del(`notifications:${userId}`);
        await this.redisClient.rPush(`notifications:${userId}`, updated);
      }
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
    }
  }

  async sendEmail(to, subject, html) {
    if (!this.emailTransporter) {
      logger.warn('Email service not configured');
      return;
    }

    try {
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@buildtrack.com',
        to,
        subject,
        html
      });
      logger.info(`Email sent to ${to}`);
    } catch (error) {
      logger.error('Failed to send email:', error);
    }
  }

  // Notification templates
  async notifyNewUser(user, createdBy) {
    const notification = {
      id: `new_user_${Date.now()}`,
      type: 'user_created',
      title: 'New User Created',
      message: `${createdBy} created a new user account for ${user.fullName}`,
      data: { userId: user.id }
    };
    await this.sendNotification(createdBy.id, notification);
    
    // Send email to new user
    await this.sendEmail(
      user.email,
      'Welcome to BuildTrack',
      `<h1>Welcome to BuildTrack!</h1>
       <p>Hello ${user.fullName},</p>
       <p>You have been added to BuildTrack by ${createdBy.fullName}.</p>
       <p>Your login credentials:</p>
       <ul>
         <li><strong>Email:</strong> ${user.email}</li>
         <li><strong>Password:</strong> ${user.temporaryPassword || 'password123'}</li>
       </ul>
       <p>Please log in and change your password.</p>
       <a href="${process.env.APP_URL}/login">Log in to BuildTrack</a>`
    );
  }

  async notifyPasswordReset(user) {
    const notification = {
      id: `password_reset_${Date.now()}`,
      type: 'password_reset',
      title: 'Password Reset',
      message: `Your password has been reset by the system administrator.`,
      data: { userId: user.id }
    };
    await this.sendNotification(user.id, notification);
    
    await this.sendEmail(
      user.email,
      'Password Reset - BuildTrack',
      `<h1>Password Reset</h1>
       <p>Hello ${user.fullName},</p>
       <p>Your password has been reset by the system administrator.</p>
       <p><strong>New Password:</strong> ${user.temporaryPassword || 'password123'}</p>
       <p>Please log in and change your password.</p>
       <a href="${process.env.APP_URL}/login">Log in to BuildTrack</a>`
    );
  }

  async notifyDailyReport(report, generatedBy) {
    const notification = {
      id: `daily_report_${Date.now()}`,
      type: 'daily_report',
      title: 'Daily Report Generated',
      message: `${generatedBy.fullName} generated a daily report for ${report.date}`,
      data: { reportId: report.id }
    };
    
    // Notify contractor and accountant
    const contractor = await User.findOne({ where: { role: 'contractor' } });
    const accountant = await User.findOne({ where: { role: 'accountant' } });
    
    if (contractor) await this.sendNotification(contractor.id, notification);
    if (accountant) await this.sendNotification(accountant.id, notification);
  }

  async notifyExpenseApproval(expense, approvedBy) {
    const notification = {
      id: `expense_approval_${Date.now()}`,
      type: 'expense_approved',
      title: 'Expense Approved',
      message: `${approvedBy.fullName} approved an expense of $${expense.amount}`,
      data: { expenseId: expense.id }
    };
    await this.sendNotification(expense.recordedBy, notification);
  }

  async notifyBudgetAlert(project, percentage) {
    const notification = {
      id: `budget_alert_${Date.now()}`,
      type: 'budget_alert',
      title: `Budget Alert - ${project.name}`,
      message: `Project budget utilization has reached ${percentage}%`,
      data: { projectId: project.id, percentage }
    };
    
    const contractor = await User.findOne({ where: { role: 'contractor' } });
    if (contractor) await this.sendNotification(contractor.id, notification);
    
    // Send email alert for critical levels
    if (percentage >= 90) {
      await this.sendEmail(
        process.env.ALERT_EMAIL || 'admin@buildtrack.com',
        `⚠️ Critical Budget Alert - ${project.name}`,
        `<h1>Budget Alert</h1>
         <p>Project: ${project.name}</p>
         <p>Budget Utilization: ${percentage}%</p>
         <p>Total Budget: $${project.budget}</p>
         <p>Total Expenses: $${project.totalExpenses || 0}</p>
         <p>Remaining: $${project.remainingBudget || 0}</p>
         <a href="${process.env.APP_URL}/projects/${project.id}">View Project</a>`
      );
    }
  }

  async notifyProjectMilestone(project, milestone) {
    const notification = {
      id: `milestone_${Date.now()}`,
      type: 'milestone_completed',
      title: `Milestone Completed - ${project.name}`,
      message: `${milestone} milestone has been completed for ${project.name}`,
      data: { projectId: project.id, milestone }
    };
    
    const contractor = await User.findOne({ where: { role: 'contractor' } });
    if (contractor) await this.sendNotification(contractor.id, notification);
  }
}

export default new NotificationService();
