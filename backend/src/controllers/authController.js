import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
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
      role,
      phone,
      companyName
    });
    const token = generateToken(user);
    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
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
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    await user.update({ lastLogin: new Date() });
    const token = generateToken(user);
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
    res.status(400).json({ success: false, message: error.message });
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
