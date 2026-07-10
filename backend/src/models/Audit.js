import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Audit = sequelize.define('Audit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  },
  affectedRecord: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'affected_record'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent'
  }
}, {
  tableName: 'audits',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default Audit;
