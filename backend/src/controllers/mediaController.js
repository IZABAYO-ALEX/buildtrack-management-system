import Media from '../models/Media.js';
import Project from '../models/Project.js';
import NotificationService from '../services/notificationService.js';
import logger from '../utils/logger.js';
import path from 'path';

export const uploadMedia = async (req, res) => {
  try {
    const { projectId, type, title, description, tags } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    const media = await Media.create({
      projectId,
      type,
      title: title || req.file.originalname,
      description: description || '',
      url: fileUrl,
      uploadedBy: req.user.id,
      size: req.file.size,
      mimeType: req.file.mimetype,
      tags: tags ? JSON.parse(tags) : [],
      isApproved: req.user.role === 'contractor' ? true : false
    });

    // Notify contractor if not approved
    if (!media.isApproved) {
      const contractor = await User.findOne({ where: { role: 'contractor' } });
      if (contractor) {
        await NotificationService.sendNotification(contractor.id, {
          id: `media_${media.id}`,
          type: 'new_media',
          title: 'New Media Uploaded',
          message: `${req.user.fullName} uploaded ${type}: ${media.title}`,
          data: { mediaId: media.id }
        });
      }
    }

    res.status(201).json({
      success: true,
      data: media,
      message: 'Media uploaded successfully'
    });
  } catch (error) {
    logger.error('Upload media error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMedia = async (req, res) => {
  try {
    const { projectId, type, approved } = req.query;
    const where = {};

    if (projectId) where.projectId = projectId;
    if (type) where.type = type;
    if (approved !== undefined) where.isApproved = approved === 'true';

    const media = await Media.findAll({
      where,
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'fullName'] },
        { model: Project, attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: media });
  } catch (error) {
    logger.error('Get media error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const approveMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findByPk(id);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    media.isApproved = true;
    media.approvedBy = req.user.id;
    await media.save();

    await NotificationService.sendNotification(media.uploadedBy, {
      id: `media_approved_${media.id}`,
      type: 'media_approved',
      title: 'Media Approved',
      message: `Your upload "${media.title}" has been approved`,
      data: { mediaId: media.id }
    });

    res.json({
      success: true,
      data: media,
      message: 'Media approved successfully'
    });
  } catch (error) {
    logger.error('Approve media error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
