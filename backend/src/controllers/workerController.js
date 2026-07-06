import Worker from '../models/Worker.js';
import Attendance from '../models/Attendance.js';
import WorkerPayment from '../models/WorkerPayment.js';
import Project from '../models/Project.js';
import Audit from '../models/Audit.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';

export const createWorker = async (req, res) => {
  try {
    const { fullName, phone, role, rate, projectId, joinedDate } = req.body;

    const existingWorkers = await Worker.findAll({
      where: {
        [Op.or]: [
          { fullName: { [Op.iLike]: fullName } },
          { phone: phone || null }
        ],
        projectId,
        isActive: true
      }
    });

    if (existingWorkers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A worker with similar name or phone already exists on this project',
        data: existingWorkers.map(w => ({ id: w.id, fullName: w.fullName, phone: w.phone }))
      });
    }

    const worker = await Worker.create({
      fullName,
      phone,
      role,
      rate,
      projectId,
      joinedDate: joinedDate || new Date().toISOString().split('T')[0],
      isActive: true
    });

    await Audit.create({
      userId: req.user.id,
      action: 'CREATE_WORKER',
      details: { workerId: worker.id, fullName: worker.fullName },
      affectedRecord: worker.id
    });

    res.status(201).json({ success: true, data: worker });
  } catch (error) {
    logger.error('Create worker error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getWorkers = async (req, res) => {
  try {
    const { projectId, isActive, search } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { role: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const workers = await Worker.findAll({
      where,
      include: [
        { model: Attendance, as: 'attendances', attributes: ['id', 'date', 'status', 'hoursWorked', 'overtimeHours'] },
        { model: WorkerPayment, as: 'payments', attributes: ['id', 'amount', 'paymentDate'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const workersWithStats = workers.map(worker => {
      const totalHours = worker.attendances?.reduce((sum, a) => sum + parseFloat(a.hoursWorked || 0), 0) || 0;
      const totalOvertime = worker.attendances?.reduce((sum, a) => sum + parseFloat(a.overtimeHours || 0), 0) || 0;
      const totalPaid = worker.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
      
      return {
        ...worker.toJSON(),
        totalHours,
        totalOvertime,
        totalPaid,
        balanceDue: (totalHours * worker.rate) - totalPaid
      };
    });

    res.json({ success: true, data: workersWithStats });
  } catch (error) {
    logger.error('Get workers error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findByPk(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    await worker.update(req.body);

    await Audit.create({
      userId: req.user.id,
      action: 'UPDATE_WORKER',
      details: { workerId: worker.id, updates: req.body },
      affectedRecord: worker.id
    });

    res.json({ success: true, data: worker });
  } catch (error) {
    logger.error('Update worker error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByPk(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    await worker.destroy();

    await Audit.create({
      userId: req.user.id,
      action: 'DELETE_WORKER',
      details: { workerId: worker.id, fullName: worker.fullName },
      affectedRecord: worker.id
    });

    res.json({ success: true, message: 'Worker deleted successfully' });
  } catch (error) {
    logger.error('Delete worker error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
