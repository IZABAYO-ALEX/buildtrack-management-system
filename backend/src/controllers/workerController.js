import Worker from '../models/Worker.js';
import logger from '../utils/logger.js';

export const createWorker = async (req, res) => {
  try {
    const { fullName, phone, role, rate, projectId } = req.body;
    const worker = await Worker.create({
      fullName,
      phone,
      role,
      rate,
      projectId,
      isActive: true
    });
    res.status(201).json({ success: true, data: worker });
  } catch (error) {
    logger.error('Create worker error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getWorkers = async (req, res) => {
  try {
    const { projectId, isActive } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    const workers = await Worker.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: workers });
  } catch (error) {
    logger.error('Get workers error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
