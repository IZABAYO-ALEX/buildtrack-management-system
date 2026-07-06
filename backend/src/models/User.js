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
    validate: {
      isEmail: { msg: 'Please provide a valid email address' },
      notEmpty: { msg: 'Email is required' }
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'full_name',
    validate: {
      notEmpty: { msg: 'Full name is required' },
      len: { args: [2, 255], msg: 'Name must be between 2 and 255 characters' }
    }
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
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_by'
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'verified_by'
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.passwordHash) {
        const salt = await bcrypt.genSalt(12);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('passwordHash')) {
        const salt = await bcrypt.genSalt(12);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
      }
    }
  }
});

User.prototype.comparePassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.passwordHash);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.passwordHash;
  return values;
};

export default User;
