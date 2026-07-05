import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Worker = sequelize.define('Worker', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'full_name'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  role: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'project_id'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  photoUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'photo_url'
  },
  totalHours: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'total_hours'
  },
  totalPaid: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'total_paid'
  },
  joinedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'joined_date'
  }
}, {
  tableName: 'workers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Worker;
