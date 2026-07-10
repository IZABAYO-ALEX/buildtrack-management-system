import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      fullName: user.fullName
    },
    process.env.JWT_SECRET || 'buildtrack_secret_key',
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'buildtrack_refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d' }
  );
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    if (!user.isActive) {
      logger.warn(`Login attempt by inactive user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Check if user is verified (skip for contractors as they're auto-verified)
    if (user.role !== 'contractor' && !user.isVerified) {
      logger.warn(`Login attempt by unverified user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Account not verified. Please wait for administrator verification.',
        code: 'ACCOUNT_UNVERIFIED'
      });
    }

    // Check if user was created by a contractor (skip for contractors themselves)
    if (user.role !== 'contractor' && !user.createdBy) {
      logger.warn(`Login attempt by user not created by contractor: ${email}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. This account was not created by an administrator.',
        code: 'UNAUTHORIZED_CREATION'
      });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      logger.warn(`Failed password attempt for: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    await User.updateLastLogin(user.id);

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.info(`✅ User logged in: ${email} (${user.role})`);

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          companyName: user.companyName,
          isVerified: user.isVerified,
          isActive: user.isActive,
          profileImage: user.profileImage
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again.',
      code: 'SERVER_ERROR'
    });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password, fullName, role, companyName, phone } = req.body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      email,
      passwordHash: password,
      fullName,
      role: role || 'site_manager',
      companyName,
      phone,
      isActive: true,
      isVerified: role === 'contractor' // Contractors are auto-verified
    });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.info(`✅ User registered: ${email} (${user.role})`);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          companyName: user.companyName,
          isVerified: user.isVerified,
          isActive: user.isActive
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register user. Please try again.'
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash', 'resetPasswordToken', 'resetPasswordExpires'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'buildtrack_refresh_secret');
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

export const logout = async (req, res) => {
  try {
    // For token blacklist, you'd add the token to a blacklist in Redis
    // For now, just return success
    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to logout'
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    logger.info(`✅ Password changed for user: ${user.email}`);

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_RESET_SECRET || 'reset_secret',
      { expiresIn: '1h' }
    );

    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // TODO: Send email with reset link
    logger.info(`✅ Password reset requested for: ${email}`);

    return res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process request'
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET || 'reset_secret');
    
    const user = await User.findOne({
      where: {
        id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset fields
    user.passwordHash = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    logger.info(`✅ Password reset successfully for: ${user.email}`);

    return res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

// Export all functions
export default {
  login,
  register,
  getProfile,
  refreshToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword
};
