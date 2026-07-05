import { Worker, Attendance, WorkerPayment, Project } from '../models/index.js';
import logger from '../utils/logger.js';

export const createWorker = async (req, res) => {
  try {
    const { fullName, phone, role, rate, projectId, joinedDate } = req.body;

    const worker = await Worker.create({
      fullName,
      phone,
      role,
      rate,
      projectId,
      joinedDate: joinedDate || new Date().toISOString().split('T')[0],
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
      include: [
        { 
          model: Attendance, 
          attributes: ['id', 'date', 'status', 'hoursWorked'],
          required: false
        },
        { 
          model: WorkerPayment, 
          attributes: ['id', 'amount', 'paymentDate'],
          required: false
        },
        {
          model: Project,
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const workersWithStats = workers.map(worker => {
      const totalHours = worker.Attendances?.reduce((sum, a) => sum + parseFloat(a.hoursWorked || 0), 0) || 0;
      const totalPaid = worker.WorkerPayments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
      return {
        ...worker.toJSON(),
        totalHours,
        totalPaid
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

    res.json({ success: true, message: 'Worker deleted successfully' });
  } catch (error) {
    logger.error('Delete worker error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
