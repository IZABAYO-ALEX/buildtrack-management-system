import { sequelize } from '../config/database.js';
import logger from '../utils/logger.js';

// ==========================
// Import Models
// ==========================
import User from './User.js';
import Project from './Project.js';
import Worker from './Worker.js';
import Attendance from './Attendance.js';
import Expense from './Expense.js';
import Material from './Material.js';
import Milestone from './Milestone.js';
import Request from './Request.js';
import Media from './Media.js';
import DailyReport from './DailyReport.js';
import WorkerPayment from './WorkerPayment.js';
import Audit from './Audit.js';


// ======================================================
// USER ↔ PROJECT RELATIONSHIPS
// ======================================================

// Contractor owns projects
User.hasMany(Project, {
  foreignKey: 'contractor_id',
  as: 'projects'
});

Project.belongsTo(User, {
  foreignKey: 'contractor_id',
  as: 'contractor'
});


// Site Manager manages projects
User.hasMany(Project, {
  foreignKey: 'site_manager_id',
  as: 'managedProjects'
});

Project.belongsTo(User, {
  foreignKey: 'site_manager_id',
  as: 'siteManager'
});


// Accountant assigned to projects
User.hasMany(Project, {
  foreignKey: 'accountant_id',
  as: 'accountedProjects'
});

Project.belongsTo(User, {
  foreignKey: 'accountant_id',
  as: 'accountant'
});




// PROJECT ↔ WORKER
// ======================================================

Project.hasMany(Worker, {
  foreignKey: 'projectId',
  as: 'workers'
});

Worker.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project'
});



// ======================================================
// PROJECT ↔ EXPENSE
// ======================================================

Project.hasMany(Expense, {
  foreignKey: 'projectId',
  as: 'expenses'
});

Expense.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project'
});



// Expense recorded by user
User.hasMany(Expense, {
  foreignKey: 'recordedBy',
  as: 'recordedExpenses'
});

Expense.belongsTo(User, {
  foreignKey: 'recordedBy',
  as: 'recorder'
});



// Expense approved by user
User.hasMany(Expense, {
  foreignKey: 'approvedBy',
  as: 'approvedExpenses'
});

Expense.belongsTo(User, {
  foreignKey: 'approvedBy',
  as: 'approver'
});



// ======================================================
// PROJECT ↔ MATERIAL
// ======================================================

Project.hasMany(Material, {
  foreignKey: 'project_id',
  as: 'materials'
});

Material.belongsTo(Project, {
  foreignKey: 'project_id',
  as: 'project'
});



// ======================================================
// PROJECT ↔ MILESTONE
// ======================================================

Project.hasMany(Milestone, {
  foreignKey: 'project_id',
  as: 'milestones'
});

Milestone.belongsTo(Project, {
  foreignKey: 'project_id',
  as: 'project'
});



// ======================================================
// PROJECT ↔ REQUEST
// ======================================================

Project.hasMany(Request, {
  foreignKey: 'project_id',
  as: 'requests'
});

Request.belongsTo(Project, {
  foreignKey: 'project_id',
  as: 'project'
});



// ======================================================
// USER ↔ REQUEST
// ======================================================

User.hasMany(Request, {
  foreignKey: 'requestedBy',
  as: 'submittedRequests'
});

Request.belongsTo(User, {
  foreignKey: 'requesterId',
  as: 'requester'
});

Request.belongsTo(User, {
  foreignKey: 'approvedBy',
  as: 'approver'
});



// ======================================================
// PROJECT ↔ DAILY REPORT
// ======================================================

Project.hasMany(DailyReport, {
  foreignKey: 'project_id',
  as: 'dailyReports'
});

DailyReport.belongsTo(Project, {
  foreignKey: 'project_id',
  as: 'project'
});


User.hasMany(DailyReport, {
  foreignKey: 'generatedBy',
  as: 'reports'
});

DailyReport.belongsTo(User, {
  foreignKey: 'generatedBy',
  as: 'generatedByUser'
});


// ======================================================
// PROJECT ↔ MEDIA
// ======================================================

Project.hasMany(Media, {
  foreignKey: 'project_id',
  as: 'media'
});

Media.belongsTo(Project, {
  foreignKey: 'project_id',
  as: 'project'
});



// ======================================================
// WORKER RELATIONSHIPS
// ======================================================

Worker.hasMany(Attendance, {
  foreignKey: 'worker_id',
  as: 'attendances'
});

Attendance.belongsTo(Worker, {
  foreignKey: 'worker_id',
  as: 'worker'
});


Worker.hasMany(WorkerPayment, {
  foreignKey: 'worker_id',
  as: 'payments'
});

WorkerPayment.belongsTo(Worker, {
  foreignKey: 'worker_id',
  as: 'worker'
});



// ======================================================
// USER ↔ AUDIT
// ======================================================

User.hasMany(Audit, {
  foreignKey: 'user_id',
  as: 'auditLogs'
});

Audit.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});



// ======================================================
// EXPORTS
// ======================================================
console.log("WORKER COLUMNS:");
console.log(Object.keys(Worker.rawAttributes));
export {
  sequelize,
  User,
  Project,
  Worker,
  Attendance,
  Expense,
  Material,
  Milestone,
  Request,
  Media,
  DailyReport,
  WorkerPayment,
  Audit
};


logger.info('✅ Models loaded successfully');