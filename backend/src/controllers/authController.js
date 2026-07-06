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

    if (user.role !== 'contractor' && !user.isVerified) {
      logger.warn(`Login attempt by unverified user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Account not verified. Please wait for administrator verification.',
        code: 'ACCOUNT_UNVERIFIED'
      });
    }

    // Check createdBy for non-contractor users
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

    await user.update({ lastLogin: new Date() });

    const token = generateToken(user);

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
          isVerified: user.isVerified
        },
        token
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

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] }
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
