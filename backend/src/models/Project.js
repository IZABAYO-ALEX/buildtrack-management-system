import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { len: [3, 255] }
  },
  projectCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'project_code'
  },
  clientName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'client_name'
  },
  clientEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'client_email',
    validate: { isEmail: true }
  },
  clientPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'client_phone'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  budget: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },
  contractValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'contract_value',
    validate: { min: 0 }
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'UGX'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'end_date'
  },
  status: {
    type: DataTypes.ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled'),
    defaultValue: 'planning'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  projectType: {
    type: DataTypes.ENUM('residential', 'commercial', 'industrial', 'infrastructure', 'renovation'),
    allowNull: true,
    field: 'project_type'
  },
  siteArea: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'site_area',
    validate: { min: 0 }
  },
  numberOfUnits: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'number_of_units',
    validate: { min: 0 }
  },
  numberOfFloors: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'number_of_floors',
    validate: { min: 0 }
  },
  completionDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'completion_date'
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_archived'
  },
  contractorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'contractor_id'
  },
  siteManagerId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'site_manager_id'
  },
  accountantId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'accountant_id'
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  progress: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: { min: 0, max: 100 }
  },
  completionPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'completion_percentage',
    validate: { min: 0, max: 100 }
  },
  actualCost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'actual_cost',
    validate: { min: 0 }
  },
  riskLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
    field: 'risk_level'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'projects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Project;
