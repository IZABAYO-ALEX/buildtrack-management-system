import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'buildtrack_secret_key',
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
};

export const register = async (req, res) => {
  try {
    const { email, password, fullName, role, phone, companyName } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      email,
      passwordHash: password,
      fullName,
      role: role || 'site_manager',
      phone,
      companyName,
      isActive: true
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔑 Login attempt:', email);

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials - User not found' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User inactive:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated. Please contact admin.' 
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials - Wrong password' 
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = generateToken(user);

    console.log('✅ Login successful:', email, 'Role:', user.role);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          companyName: user.companyName
        },
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    console.error('❌ Login error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Login failed' 
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
