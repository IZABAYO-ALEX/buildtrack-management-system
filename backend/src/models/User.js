import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'full_name'
  },
  role: {
    type: DataTypes.ENUM('contractor', 'site_manager', 'accountant'),
    allowNull: false,
    defaultValue: 'site_manager'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  companyName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'company_name'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  },
  profileImage: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'profile_image'
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.passwordHash) {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('passwordHash')) {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
      }
    }
  }
});

User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

User.prototype.hasPermission = function(permission) {
  const permissions = {
    contractor: ['all'],
    site_manager: ['view_projects', 'update_projects', 'record_expenses', 'manage_workers', 'manage_attendance', 'view_materials', 'record_materials'],
    accountant: ['view_budgets', 'view_expenses', 'view_payments', 'view_profit', 'view_revenue']
  };
  const userPermissions = permissions[this.role] || [];
  return userPermissions.includes('all') || userPermissions.includes(permission);
};

export default User;
