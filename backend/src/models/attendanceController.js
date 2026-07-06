export const bulkMarkAttendance = async (req, res) => {
  try {
    const { projectId, date, workers } = req.body;
    // workers: [{ workerId, status, checkIn, checkOut, overtimeHours }]
    
    const results = [];
    for (const worker of workers) {
      const attendance = await Attendance.create({
        workerId: worker.workerId,
        projectId,
        date: date || new Date().toISOString().split('T')[0],
        status: worker.status || 'present',
        checkIn: worker.checkIn || null,
        checkOut: worker.checkOut || null,
        overtimeHours: worker.overtimeHours || 0,
        recordedBy: req.user.id
      });
      results.push(attendance);
    }
    
    res.status(201).json({ success: true, data: results });
  } catch (error) {
    logger.error('Bulk attendance error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
