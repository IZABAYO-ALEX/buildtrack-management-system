import Attendance from '../models/Attendance.js';
import Worker from '../models/Worker.js';
import Audit from '../models/Audit.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

export const recordAttendance = async (req, res) => {
  try {
    const { workerId, projectId, date, checkIn, checkOut, status, notes, overtimeHours } = req.body;

    const existing = await Attendance.findOne({
      where: { workerId, date: date || new Date().toISOString().split('T')[0] }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Attendance already recorded for this date' });
    }

    let hoursWorked = 0;
    if (checkIn && checkOut) {
      const [inHours, inMinutes] = checkIn.split(':').map(Number);
      const [outHours, outMinutes] = checkOut.split(':').map(Number);
      hoursWorked = (outHours - inHours) + (outMinutes - inMinutes) / 60;
      hoursWorked = Math.max(0, hoursWorked);
    }

    const attendance = await Attendance.create({
      workerId,
      projectId,
      date: date || new Date().toISOString().split('T')[0],
      checkIn,
      checkOut,
      hoursWorked,
      overtimeHours: overtimeHours || 0,
      status: status || 'present',
      notes,
      recordedBy: req.user.id
    });

    const worker = await Worker.findByPk(workerId);
    if (worker && hoursWorked > 0) {
      await worker.increment('totalHours', { by: hoursWorked });
    }

    await Audit.create({
      userId: req.user.id,
      action: 'RECORD_ATTENDANCE',
      details: { workerId, date, status, hoursWorked, overtimeHours },
      affectedRecord: attendance.id
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    logger.error('Record attendance error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const bulkMarkAttendance = async (req, res) => {
  try {
    const { projectId, date, workers } = req.body;

    if (!projectId || !workers || !Array.isArray(workers) || workers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and workers array are required'
      });
    }

    const results = [];
    const errors = [];

    for (const worker of workers) {
      try {
        const existing = await Attendance.findOne({
          where: { workerId: worker.workerId, date: date || new Date().toISOString().split('T')[0] }
        });

        if (existing) {
          errors.push({ workerId: worker.workerId, message: 'Attendance already exists' });
          continue;
        }

        let hoursWorked = 0;
        if (worker.checkIn && worker.checkOut) {
          const [inHours, inMinutes] = worker.checkIn.split(':').map(Number);
          const [outHours, outMinutes] = worker.checkOut.split(':').map(Number);
          hoursWorked = (outHours - inHours) + (outMinutes - inMinutes) / 60;
          hoursWorked = Math.max(0, hoursWorked);
        }

        const attendance = await Attendance.create({
          workerId: worker.workerId,
          projectId,
          date: date || new Date().toISOString().split('T')[0],
          checkIn: worker.checkIn || null,
          checkOut: worker.checkOut || null,
          hoursWorked,
          overtimeHours: worker.overtimeHours || 0,
          status: worker.status || 'present',
          notes: worker.notes || '',
          recordedBy: req.user.id
        });

        const workerRecord = await Worker.findByPk(worker.workerId);
        if (workerRecord && hoursWorked > 0) {
          await workerRecord.increment('totalHours', { by: hoursWorked });
        }

        results.push(attendance);
      } catch (error) {
        errors.push({ workerId: worker.workerId, message: error.message });
      }
    }

    await Audit.create({
      userId: req.user.id,
      action: 'BULK_ATTENDANCE',
      details: { projectId, date, count: results.length },
      affectedRecord: projectId
    });

    res.status(201).json({
      success: true,
      data: {
        results,
        errors,
        totalProcessed: workers.length,
        totalSuccess: results.length,
        totalErrors: errors.length
      }
    });
  } catch (error) {
    logger.error('Bulk attendance error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const { projectId, workerId, fromDate, toDate } = req.query;
    const where = {};

    if (projectId) where.projectId = projectId;
    if (workerId) where.workerId = workerId;
    if (fromDate && toDate) {
      where.date = { [Op.between]: [fromDate, toDate] };
    }

    const attendance = await Attendance.findAll({
      where,
      include: [{ model: Worker, attributes: ['id', 'fullName', 'role'] }],
      order: [['date', 'DESC']]
    });

    const summary = {
      totalRecords: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      halfDay: attendance.filter(a => a.status === 'half_day').length,
      leave: attendance.filter(a => a.status === 'leave').length,
      totalHours: attendance.reduce((sum, a) => sum + parseFloat(a.hoursWorked || 0), 0),
      totalOvertime: attendance.reduce((sum, a) => sum + parseFloat(a.overtimeHours || 0), 0)
    };

    res.json({ success: true, data: attendance, summary });
  } catch (error) {
    logger.error('Get attendance error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found' });
    }

    await attendance.update(req.body);

    if (req.body.checkIn && req.body.checkOut) {
      const [inHours, inMinutes] = req.body.checkIn.split(':').map(Number);
      const [outHours, outMinutes] = req.body.checkOut.split(':').map(Number);
      const hoursWorked = Math.max(0, (outHours - inHours) + (outMinutes - inMinutes) / 60);
      attendance.hoursWorked = hoursWorked;
      await attendance.save();
    }

    res.json({ success: true, data: attendance });
  } catch (error) {
    logger.error('Update attendance error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found' });
    }

    await attendance.destroy();

    await Audit.create({
      userId: req.user.id,
      action: 'DELETE_ATTENDANCE',
      details: { workerId: attendance.workerId, date: attendance.date },
      affectedRecord: attendance.id
    });

    res.json({ success: true, message: 'Attendance deleted successfully' });
  } catch (error) {
    logger.error('Delete attendance error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
