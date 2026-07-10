import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Expense = sequelize.define(
  'Expense',
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false
    },

    projectId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'project_id'
    },

    category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },

    receiptUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'receipt_url'
    },

    invoiceNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'invoice_number'
    },

    supplier: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    recordedBy: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'recorded_by'
    },

    status: {
      type: DataTypes.ENUM(
        'pending',
        'approved',
        'rejected'
      ),
      defaultValue: 'pending'
    },

    approvedBy: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      field: 'approved_by'
    },

    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approved_at'
    },

    approvalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'approval_notes'
    },

    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rejection_reason'
    }
  },
  {
    tableName: 'expenses',

    timestamps: true,

    createdAt: 'created_at',

    updatedAt: 'updated_at',

    deletedAt: 'deleted_at',

    paranoid: true,

    underscored: true
  }
);


export default Expense;