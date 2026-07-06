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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔑 Login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ 
      where: { email: email.toLowerCase().trim() } 
    });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    console.log('👤 User found:', user.email, 'Role:', user.role);
    console.log('📝 Stored password:', user.passwordHash);

    if (!user.isActive) {
      console.log('❌ User inactive:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated. Please contact administrator.' 
      });
    }

    if (user.role !== 'contractor' && !user.isVerified) {
      console.log('❌ User not verified:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Account not verified. Please wait for administrator verification.' 
      });
    }

    if (user.role !== 'contractor' && !user.createdBy) {
      console.log('❌ User not created by contractor:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Contact your administrator.' 
      });
    }

    const isValidPassword = await user.comparePassword(password);
    console.log('🔑 Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    await user.update({ lastLogin: new Date() });

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
          companyName: user.companyName,
          isVerified: user.isVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
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
    console.error('Profile error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
