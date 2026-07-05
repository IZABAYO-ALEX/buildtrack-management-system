import Audit from '../models/Audit.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export const getAudits = async (req, res) => {
  try {
    const { action, fromDate, toDate, userId } = req.query;
    const where = {};

    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (fromDate && toDate) {
      where.createdAt = { [Op.between]: [fromDate, toDate] };
    }

    const audits = await Audit.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'fullName', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    res.json({ success: true, data: audits });
  } catch (error) {
    logger.error('Get audits error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createAudit = async (userId, action, details, affectedRecord, req) => {
  try {
    await Audit.create({
      userId,
      action,
      details,
      affectedRecord,
      ipAddress: req?.ip || req?.socket?.remoteAddress,
      userAgent: req?.headers?.['user-agent']
    });
  } catch (error) {
    logger.error('Create audit error:', error);
  }
};
