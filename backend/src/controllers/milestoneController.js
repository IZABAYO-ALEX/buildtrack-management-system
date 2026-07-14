import Milestone from '../models/Milestone.js';
import Project from '../models/Project.js';
import Audit from '../models/Audit.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

export const createMilestone = async (req, res) => {
  try {
    const { projectId, title, description, dueDate, order } = req.body;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const milestone = await Milestone.create({
      projectId,
      title,
      description,
      dueDate,
      order: order || 0,
      createdBy: req.user.id
    });

    await Audit.create({
      userId: req.user.id,
      action: 'CREATE_MILESTONE',
      details: { milestoneId: milestone.id, title },
      affectedRecord: milestone.id
    });

    res.status(201).json({ success: true, data: milestone });
  } catch (error) {
    logger.error('Create milestone error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMilestones = async (req, res) => {
  try {
    const { projectId } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;

    const milestones = await Milestone.findAll({
      where,
      include: [{ model: Project, attributes: ['id', 'name'] }],
      order: [['order', 'ASC']]
    });

    res.json({ success: true, data: milestones });
  } catch (error) {
    logger.error('Get milestones error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMilestoneById = async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id, {
      include: [{ model: Project, attributes: ['id', 'name'] }]
    });
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }
    res.json({ success: true, data: milestone });
  } catch (error) {
    logger.error('Get milestone error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    await milestone.update(req.body);

    await Audit.create({
      userId: req.user.id,
      action: 'UPDATE_MILESTONE',
      details: { milestoneId: milestone.id, changes: req.body },
      affectedRecord: milestone.id
    });

    res.json({ success: true, data: milestone });
  } catch (error) {
    logger.error('Update milestone error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const completeMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    milestone.isCompleted = true;
    milestone.completedDate = new Date().toISOString().split('T')[0];
    milestone.progress = 100;
    await milestone.save();

    // Update project progress
    const project = await Project.findByPk(milestone.projectId);
    if (project) {
      const milestones = await Milestone.findAll({
        where: { projectId: project.id }
      });
      const total = milestones.length;
      const completed = milestones.filter(m => m.isCompleted).length;
      project.progress = total > 0 ? (completed / total) * 100 : 0;
      await project.save();
    }

    await Audit.create({
      userId: req.user.id,
      action: 'COMPLETE_MILESTONE',
      details: { milestoneId: milestone.id, title: milestone.title },
      affectedRecord: milestone.id
    });

    res.json({ success: true, data: milestone });
  } catch (error) {
    logger.error('Complete milestone error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    await milestone.destroy();

    await Audit.create({
      userId: req.user.id,
      action: 'DELETE_MILESTONE',
      details: { milestoneId: milestone.id, title: milestone.title },
      affectedRecord: milestone.id
    });

    res.json({ success: true, message: 'Milestone deleted successfully' });
  } catch (error) {
    logger.error('Delete milestone error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
