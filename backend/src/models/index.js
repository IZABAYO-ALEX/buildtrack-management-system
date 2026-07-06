import Project from './Project.js';
import Expense from './Expense.js';
import Worker from './Worker.js';
import Attendance from './Attendance.js';
import WorkerPayment from './WorkerPayment.js';
import Material from './Material.js';
import User from './User.js';
import DailyReport from './DailyReport.js';
import Milestone from './Milestone.js';
import Request from './Request.js';
import Media from './Media.js';
import Audit from './Audit.js';

// Project Associations
Project.belongsTo(User, { foreignKey: 'contractorId', as: 'contractor' });
Project.belongsTo(User, { foreignKey: 'siteManagerId', as: 'siteManager' });
Project.belongsTo(User, { foreignKey: 'accountantId', as: 'accountant' });
Project.hasMany(Expense, { foreignKey: 'projectId', as: 'expenses' });
Project.hasMany(Worker, { foreignKey: 'projectId', as: 'workers' });
Project.hasMany(Material, { foreignKey: 'projectId', as: 'materials' });
Project.hasMany(DailyReport, { foreignKey: 'projectId', as: 'dailyReports' });
Project.hasMany(Milestone, { foreignKey: 'projectId', as: 'milestones' });

// Expense Associations
Expense.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Expense.belongsTo(User, { foreignKey: 'recordedBy', as: 'recorder' });
Expense.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

// Worker Associations
Worker.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Worker.hasMany(Attendance, { foreignKey: 'workerId', as: 'attendances' });
Worker.hasMany(WorkerPayment, { foreignKey: 'workerId', as: 'payments' });

// Attendance Associations
Attendance.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });
Attendance.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// WorkerPayment Associations
WorkerPayment.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });

// Material Associations
Material.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// DailyReport Associations
DailyReport.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
DailyReport.belongsTo(User, { foreignKey: 'generatedBy', as: 'generator' });

// Milestone Associations
Milestone.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Request Associations
Request.belongsTo(User, { foreignKey: 'requestedBy', as: 'requestor' });
Request.belongsTo(User, { foreignKey: 'requestedTo', as: 'approver' });
Request.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Media Associations
Media.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
Media.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Audit Associations
Audit.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  Project,
  Expense,
  Worker,
  Attendance,
  WorkerPayment,
  Material,
  User,
  DailyReport,
  Milestone,
  Request,
  Media,
  Audit
};
