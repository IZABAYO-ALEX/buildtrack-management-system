import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const WorkerPayment = sequelize.define('WorkerPayment', {
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
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: { min: 0 }
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'payment_date'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'mobile_money', 'check'),
    allowNull: true,
    field: 'payment_method'
  },
  reference: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  periodStart: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'period_start'
  },
  periodEnd: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'period_end'
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
  tableName: 'worker_payments'
});

export default WorkerPayment;
