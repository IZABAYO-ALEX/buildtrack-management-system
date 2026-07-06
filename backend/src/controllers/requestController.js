import Request from '../models/Request.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import NotificationService from '../services/notificationService.js';
import logger from '../utils/logger.js';

export const createRequest = async (req, res) => {
  try {
    const {
      projectId,
      type,
      title,
      description,
      amount,
      requestedTo,
      priority,
      dueDate,
      attachments
    } = req.body;

    const request = await Request.create({
      projectId,
      type,
      title,
      description,
      amount: amount || null,
      requestedBy: req.user.id,
      requestedTo,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      attachments: attachments || [],
      status: 'pending'
    });

    // Send notification to the requested user
    await NotificationService.sendNotification(requestedTo, {
      id: `request_${request.id}`,
      type: 'new_request',
      title: 'New Request',
      message: `${req.user.fullName} has submitted a request: ${title}`,
      data: { requestId: request.id }
    });

    res.status(201).json({
      success: true,
      data: request,
      message: 'Request created successfully'
    });
  } catch (error) {
    logger.error('Create request error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getRequests = async (req, res) => {
  try {
    const { status, type, projectId } = req.query;
    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (projectId) where.projectId = projectId;

    // For site manager: see all requests they made
    // For accountant: see requests made to them
    // For contractor: see all requests
    if (req.user.role === 'site_manager') {
      where.requestedBy = req.user.id;
    } else if (req.user.role === 'accountant') {
      where.requestedTo = req.user.id;
    }

    const requests = await Request.findAll({
      where,
      include: [
        { model: User, as: 'requestor', attributes: ['id', 'fullName', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'fullName', 'email'] },
        { model: Project, attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: requests });
  } catch (error) {
    logger.error('Get requests error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    request.status = 'approved';
    request.approvedBy = req.user.id;
    request.approvedAt = new Date();
    await request.save();

    await NotificationService.sendNotification(request.requestedBy, {
      id: `request_approved_${request.id}`,
      type: 'request_approved',
      title: 'Request Approved',
      message: `Your request "${request.title}" has been approved${reason ? `: ${reason}` : ''}`,
      data: { requestId: request.id }
    });

    res.json({
      success: true,
      data: request,
      message: 'Request approved successfully'
    });
  } catch (error) {
    logger.error('Approve request error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    request.status = 'rejected';
    request.rejectionReason = reason;
    request.approvedBy = req.user.id;
    request.approvedAt = new Date();
    await request.save();

    await NotificationService.sendNotification(request.requestedBy, {
      id: `request_rejected_${request.id}`,
      type: 'request_rejected',
      title: 'Request Rejected',
      message: `Your request "${request.title}" was rejected. Reason: ${reason}`,
      data: { requestId: request.id }
    });

    res.json({
      success: true,
      data: request,
      message: 'Request rejected'
    });
  } catch (error) {
    logger.error('Reject request error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
