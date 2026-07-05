import User from '../models/User.js';
import Audit from '../models/Audit.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: users });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, password, fullName, role, phone, companyName } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const user = await User.create({
      email,
      passwordHash: password,
      fullName,
      role,
      phone,
      companyName
    });

    await Audit.create({
      userId: req.user.id,
      action: 'CREATE_USER',
      details: { email, fullName, role },
      affectedRecord: user.id
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, role, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updates = { fullName, phone, role, isActive };
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    });

    await user.save();

    await Audit.create({
      userId: req.user.id,
      action: 'UPDATE_USER',
      details: { userId: id, changes: updates },
      affectedRecord: id
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.destroy();

    await Audit.create({
      userId: req.user.id,
      action: 'DELETE_USER',
      details: { userId: id, email: user.email },
      affectedRecord: id
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    await Audit.create({
      userId: req.user.id,
      action: 'DEACTIVATE_USER',
      details: { userId: id, email: user.email },
      affectedRecord: id
    });

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    logger.error('Deactivate user error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
