import Attendance from '../models/Attendance.js';
import Worker from '../models/Worker.js';
import Audit from '../models/Audit.js';
import { sequelize } from '../config/database.js';
import logger from '../utils/logger.js';

export const recordAttendance = async (req, res) => {
  try {
    const { workerId, projectId, date, checkIn, checkOut, status, notes } = req.body;

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
      details: { workerId, date, status, hoursWorked },
      affectedRecord: attendance.id
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    logger.error('Record attendance error:', error);
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
      totalHours: attendance.reduce((sum, a) => sum + parseFloat(a.hoursWorked || 0), 0)
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

    const oldHours = attendance.hoursWorked;
    await attendance.update(req.body);

    if (req.body.checkIn && req.body.checkOut) {
      const [inHours, inMinutes] = req.body.checkIn.split(':').map(Number);
      const [outHours, outMinutes] = req.body.checkOut.split(':').map(Number);
      const newHours = Math.max(0, (outHours - inHours) + (outMinutes - inMinutes) / 60);
      
      attendance.hoursWorked = newHours;
      await attendance.save();

      const worker = await Worker.findByPk(attendance.workerId);
      if (worker) {
        const diff = newHours - oldHours;
        await worker.increment('totalHours', { by: diff });
      }
    }

    res.json({ success: true, data: attendance });
  } catch (error) {
    logger.error('Update attendance error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
