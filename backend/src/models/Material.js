import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Material = sequelize.define('Material', {
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
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 }
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_cost',
    validate: { min: 0 }
  },
  totalCost: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'total_cost',
    validate: { min: 0 }
  },
  supplier: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  purchaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'purchase_date'
  },
  receiptUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'receipt_url'
  },
  consumedQuantity: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'consumed_quantity'
  },
  remainingQuantity: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'remaining_quantity'
  },
  dailyConsumption: {
    type: DataTypes.JSONB,
    defaultValue: {},
    field: 'daily_consumption'
  },
  syncStatus: {
    type: DataTypes.ENUM('pending', 'synced'),
    defaultValue: 'pending',
    field: 'sync_status'
  }
}, {
  tableName: 'materials',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: (material) => {
      material.totalCost = material.quantity * material.unitCost;
      material.remainingQuantity = material.quantity;
    },
    beforeUpdate: (material) => {
      if (material.changed('quantity') || material.changed('unitCost')) {
        material.totalCost = material.quantity * material.unitCost;
      }
      if (material.changed('quantity') || material.changed('consumedQuantity')) {
        material.remainingQuantity = material.quantity - material.consumedQuantity;
      }
    }
  }
});

export default Material;
