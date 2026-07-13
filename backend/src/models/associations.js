import Project from './Project.js';
import Expense from './Expense.js';
import Worker from './Worker.js';
import Attendance from './Attendance.js';
import WorkerPayment from './WorkerPayment.js';
import Material from './Material.js';
import User from './User.js';

Project.hasMany(Expense, { foreignKey: 'projectId' });
Expense.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(Worker, { foreignKey: 'projectId' });
Worker.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project'
});

Worker.hasMany(WorkerPayment, {
  foreignKey: 'workerId',
  as: 'payments'
});
WorkerPayment.belongsTo(Worker, { foreignKey: 'workerId' });

Project.hasMany(Material, { foreignKey: 'projectId' });
Material.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(Project, { foreignKey: 'contractorId' });
Project.belongsTo(User, { foreignKey: 'contractorId' });

User.hasMany(Expense, { foreignKey: 'recordedBy' });
Expense.belongsTo(User, { foreignKey: 'recordedBy' });

User.hasMany(Worker, { foreignKey: 'recordedBy' });
Worker.belongsTo(User, { foreignKey: 'recordedBy' });

export {
  Project,
  Expense,
  Worker,
  Attendance,
  WorkerPayment,
  Material,
  User
};
