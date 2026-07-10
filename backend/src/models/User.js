import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    comment: 'Unique user identifier'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address'
      },
      notEmpty: {
        msg: 'Email is required'
      }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim());
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash',
    validate: {
      notEmpty: {
        msg: 'Password is required'
      }
    }
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'full_name',
    validate: {
      notEmpty: {
        msg: 'Full name is required'
      },
      len: {
        args: [2, 255],
        msg: 'Full name must be between 2 and 255 characters'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('contractor', 'site_manager', 'accountant'),
    allowNull: false,
    defaultValue: 'site_manager',
    validate: {
      isIn: {
        args: [['contractor', 'site_manager', 'accountant']],
        msg: 'Invalid role specified'
      }
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: {
        args: /^\+?[\d\s-()]+$/,
        msg: 'Please provide a valid phone number'
      }
    }
  },
  companyName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'company_name'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
    comment: 'User account active status'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified',
    comment: 'Email verification status'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'verified_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at'
  },
  resetPasswordToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'reset_password_token'
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reset_password_expires'
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'User preferences in JSON format'
  },
  profileImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'profile_image'
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'two_factor_enabled'
  },
  twoFactorSecret: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'two_factor_secret'
  },
  lastPasswordChange: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_password_change'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  underscored: true,
  paranoid: true,
  
  indexes: [
    {
      name: 'users_email_idx',
      fields: ['email'],
      unique: true
    },
    {
      name: 'users_role_idx',
      fields: ['role']
    },
    {
      name: 'users_company_idx',
      fields: ['company_name']
    },
    {
      name: 'users_active_idx',
      fields: ['is_active', 'is_verified']
    },
    {
      name: 'users_last_login_idx',
      fields: ['last_login']
    }
  ],
  
  hooks: {
    beforeCreate: async (user) => {
      if (user.passwordHash) {
        const salt = await bcrypt.genSalt(12);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
      }
      // Set verified_at if user is being verified at creation
      if (user.isVerified) {
        user.verifiedAt = new Date();
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('passwordHash')) {
        const salt = await bcrypt.genSalt(12);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        user.lastPasswordChange = new Date();
      }
      // Update verified_at when verification status changes
      if (user.changed('isVerified') && user.isVerified) {
        user.verifiedAt = new Date();
      }
    },
    afterCreate: async (user) => {
      logger.info(`✅ User created: ${user.email} (${user.role})`);
    },
    afterUpdate: async (user) => {
      if (user.changed('isVerified') && user.isVerified) {
        logger.info(`✅ User verified: ${user.email}`);
      }
      if (user.changed('isActive') && !user.isActive) {
        logger.info(`⚠️ User deactivated: ${user.email}`);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(password) {
  try {
    const result = await bcrypt.compare(password, this.passwordHash);
    logger.debug(`🔐 Password comparison for ${this.email}: ${result}`);
    return result;
  } catch (error) {
    logger.error('❌ Password comparison error:', error);
    return false;
  }
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.passwordHash;
  delete values.resetPasswordToken;
  delete values.resetPasswordExpires;
  delete values.twoFactorSecret;
  return values;
};

// Class methods
User.findByEmail = async function(email) {
  try {
    return await this.findOne({
      where: {
        email: email.toLowerCase().trim(),
        isActive: true
      }
    });
  } catch (error) {
    logger.error('Find by email error:', error);
    return null;
  }
};

User.findByEmailWithDeleted = async function(email) {
  try {
    return await this.findOne({
      where: {
        email: email.toLowerCase().trim()
      },
      paranoid: false // Include soft-deleted records
    });
  } catch (error) {
    logger.error('Find by email with deleted error:', error);
    return null;
  }
};

User.createWithRole = async function(userData, role = 'site_manager') {
  try {
    return await this.create({
      ...userData,
      role
    });
  } catch (error) {
    logger.error('Create with role error:', error);
    throw error;
  }
};

User.getActiveUsers = async function() {
  try {
    return await this.findAll({
      where: { isActive: true },
      attributes: { exclude: ['passwordHash', 'resetPasswordToken', 'twoFactorSecret'] }
    });
  } catch (error) {
    logger.error('Get active users error:', error);
    return [];
  }
};

User.getUsersByRole = async function(role) {
  try {
    return await this.findAll({
      where: { 
        role, 
        isActive: true 
      },
      attributes: { exclude: ['passwordHash', 'resetPasswordToken', 'twoFactorSecret'] }
    });
  } catch (error) {
    logger.error('Get users by role error:', error);
    return [];
  }
};

User.updateLastLogin = async function(userId) {
  try {
    return await this.update(
      { lastLogin: new Date() },
      { where: { id: userId } }
    );
  } catch (error) {
    logger.error('Update last login error:', error);
    return null;
  }
};

User.getUserWithPermissions = async function(userId) {
  try {
    const user = await this.findByPk(userId, {
      attributes: { exclude: ['passwordHash', 'resetPasswordToken', 'twoFactorSecret'] }
    });
    
    if (!user) return null;
    
    // Define role-based permissions
    const permissions = {
      'admin': ['*'],
      'contractor': [
        'manage_projects',
        'manage_users',
        'view_reports',
        'manage_expenses',
        'view_analytics',
        'manage_workers'
      ],
      'site_manager': [
        'manage_workers',
        'track_expenses',
        'view_reports',
        'manage_materials',
        'mark_attendance'
      ],
      'accountant': [
        'manage_finances',
        'view_reports',
        'manage_expenses',
        'view_analytics',
        'generate_invoices'
      ]
    };
    
    return {
      ...user.toJSON(),
      permissions: permissions[user.role] || []
    };
  } catch (error) {
    logger.error('Get user with permissions error:', error);
    return null;
  }
};

User.getDashboardStats = async function() {
  try {
    const stats = await this.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['role']
    });
    
    const total = await this.count({ where: { isActive: true } });
    const verified = await this.count({ 
      where: { isActive: true, isVerified: true } 
    });
    
    return {
      total,
      verified,
      unverified: total - verified,
      roles: stats.reduce((acc, curr) => {
        acc[curr.role] = parseInt(curr.get('count'));
        return acc;
      }, {})
    };
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    return null;
  }
};

export default User;
