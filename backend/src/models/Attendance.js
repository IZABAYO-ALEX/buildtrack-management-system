import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  workerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'worker_id'
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
  checkIn: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'check_in'
  },
  checkOut: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'check_out'
  },
  hoursWorked: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'hours_worked'
  },
  overtimeHours: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'overtime_hours'
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'half_day', 'leave'),
    defaultValue: 'present'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recordedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'recorded_by'
  },
  syncStatus: {
    type: DataTypes.ENUM('pending', 'synced'),
    defaultValue: 'pending',
    field: 'sync_status'
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Attendance;
