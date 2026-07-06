import User from '../models/User.js';
import Audit from '../models/Audit.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['passwordHash'] },
      order: [['created_at', 'DESC']]
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
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const plainPassword = password || 'password123';
    
    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash: plainPassword,
      fullName,
      role: role || 'site_manager',
      phone: phone || '',
      companyName: companyName || '',
      isActive: true,
      isVerified: false,
      createdBy: req.user.id
    });

    console.log('✅ User created:', user.email, 'Role:', user.role);

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        companyName: user.companyName,
        isActive: user.isActive,
        isVerified: user.isVerified
      },
      message: `User ${fullName} created successfully! Password: ${plainPassword}`
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'contractor') {
      return res.status(400).json({ success: false, message: 'Cannot verify contractor' });
    }

    user.isVerified = true;
    user.isActive = true;
    user.verifiedBy = req.user.id;
    user.verifiedAt = new Date();
    await user.save();

    res.json({ 
      success: true, 
      message: `User ${user.fullName} verified and activated successfully!` 
    });
  } catch (error) {
    logger.error('Verify user error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot delete your own account' 
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.destroy();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot deactivate your own account' 
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    logger.error('Deactivate user error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.json({ success: true, message: 'User activated successfully' });
  } catch (error) {
    logger.error('Activate user error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.passwordHash = newPassword;
    await user.save();

    res.json({ 
      success: true, 
      message: `Password reset successfully for ${user.fullName}` 
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
