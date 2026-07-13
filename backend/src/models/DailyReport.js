import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const DailyReport = sequelize.define('DailyReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'project_id'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  workersPresent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'workers_present'
  },
  totalHoursWorked: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'total_hours_worked'
  },
  materialsUsed: {
    type: DataTypes.JSON,
    defaultValue: {},
    field: 'materials_used'
  },
  expenses: {
    type: DataTypes.JSON,
    defaultValue: {},
    field: 'expenses'
  },
  totalExpenses: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'total_expenses'
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  generatedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'generated_by'
},
  sentToAccountant: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'sent_to_accountant'
  },
  sentToContractor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'sent_to_contractor'
  },
  syncStatus: {
    type: DataTypes.ENUM('pending', 'synced'),
    defaultValue: 'pending',
    field: 'sync_status'
  }
}, {
  tableName: 'daily_reports',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default DailyReport;
