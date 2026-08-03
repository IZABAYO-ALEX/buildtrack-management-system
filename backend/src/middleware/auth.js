import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';


export const authenticate = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success:false,
        message:'Authentication required',
        code:'NO_TOKEN'
      });
    }


    const token = authHeader.split(' ')[1];


    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'buildtrack_secret_key'
    );


    if (!decoded.id) {
      return res.status(401).json({
        success:false,
        message:'Invalid token',
        code:'INVALID_TOKEN'
      });
    }


    const user = await User.findByPk(decoded.id, {
      attributes:{
        exclude:[
          'passwordHash',
          'resetPasswordToken',
          'resetPasswordExpires',
          'twoFactorSecret'
        ]
      }
    });


    if (!user) {
      return res.status(401).json({
        success:false,
        message:'User not found',
        code:'USER_NOT_FOUND'
      });
    }


    if (!user.isActive) {
      return res.status(401).json({
        success:false,
        message:'Account is deactivated',
        code:'ACCOUNT_INACTIVE'
      });
    }


    req.user = user;

    next();


  } catch(error){

    if(error.name === 'JsonWebTokenError'){
      return res.status(401).json({
        success:false,
        message:'Invalid token',
        code:'INVALID_TOKEN'
      });
    }


    if(error.name === 'TokenExpiredError'){
      return res.status(401).json({
        success:false,
        message:'Token expired',
        code:'TOKEN_EXPIRED'
      });
    }


    logger.error('Authentication error:', error);


    res.status(500).json({
      success:false,
      message:'Authentication failed',
      code:'AUTH_ERROR'
    });

  }
};



export const authorize = (...roles) => {

  return (req, res, next) => {

    if (!req.user) {

      return res.status(401).json({
        success:false,
        message:'Authentication required'
      });

    }


    // Supports:
    // authorize('admin','contractor')
    // authorize(['admin','contractor'])

    const allowedRoles = roles.flat();


    if (allowedRoles.length === 0) {
      return next();
    }


    if (!allowedRoles.includes(req.user.role)) {

      return res.status(403).json({

        success:false,

        message:'Insufficient permissions',

        requiredRoles: allowedRoles,

        userRole:req.user.role

      });

    }


    next();

  };

};


export default {
 authenticate,
 authorize
};