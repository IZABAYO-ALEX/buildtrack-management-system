import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Milestone = sequelize.define('Milestone', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'due_date'
  },
  completedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'completed_date'
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_completed'
  },
  progress: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: { min: 0, max: 100 }
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'created_by'
  }
}, {
  tableName: 'milestones',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Milestone;
