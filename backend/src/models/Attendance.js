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
  status: {
    type: DataTypes.ENUM('present', 'absent', 'half_day'),
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
  }
}, {
  tableName: 'attendance'
});

export default Attendance;
