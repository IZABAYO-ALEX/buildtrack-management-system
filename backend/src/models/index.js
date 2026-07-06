import Project from './Project.js';
import Expense from './Expense.js';
import Worker from './Worker.js';
import Attendance from './Attendance.js';
import WorkerPayment from './WorkerPayment.js';
import Material from './Material.js';
import User from './User.js';
import DailyReport from './DailyReport.js';
import Request from './Request.js';
import Media from './Media.js';
import Audit from './Audit.js';

// Project associations
Project.hasMany(Expense, { foreignKey: 'projectId' });
Expense.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(Worker, { foreignKey: 'projectId' });
Worker.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(Material, { foreignKey: 'projectId' });
Material.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(DailyReport, { foreignKey: 'projectId' });
DailyReport.belongsTo(Project, { foreignKey: 'projectId' });

// Worker associations
Worker.hasMany(Attendance, { foreignKey: 'workerId' });
Attendance.belongsTo(Worker, { foreignKey: 'workerId' });

Worker.hasMany(WorkerPayment, { foreignKey: 'workerId' });
WorkerPayment.belongsTo(Worker, { foreignKey: 'workerId' });

// User associations
User.hasMany(Project, { foreignKey: 'contractorId' });
Project.belongsTo(User, { foreignKey: 'contractorId' });

User.hasMany(Expense, { foreignKey: 'recordedBy' });
Expense.belongsTo(User, { foreignKey: 'recordedBy' });

User.hasMany(DailyReport, { foreignKey: 'generatedBy' });
DailyReport.belongsTo(User, { foreignKey: 'generatedBy', as: 'generator' });

User.hasMany(Request, { foreignKey: 'requestedBy' });
Request.belongsTo(User, { foreignKey: 'requestedBy', as: 'requestor' });

User.hasMany(Request, { foreignKey: 'requestedTo' });
Request.belongsTo(User, { foreignKey: 'requestedTo', as: 'approver' });

User.hasMany(Media, { foreignKey: 'uploadedBy' });
Media.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

User.hasMany(Audit, { foreignKey: 'userId' });
Audit.belongsTo(User, { foreignKey: 'userId' });

// WorkerPayment - Project association (for analytics)
WorkerPayment.belongsTo(Worker, { foreignKey: 'workerId' });
WorkerPayment.belongsTo(Project, { 
  foreignKey: 'projectId',
  through: Worker 
});

export {
  Project,
  Expense,
  Worker,
  Attendance,
  WorkerPayment,
  Material,
  User,
  DailyReport,
  Request,
  Media,
  Audit
};
