import Material from '../models/Material.js';
import Project from '../models/Project.js';
import Audit from '../models/Audit.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

export const getAll = async (req, res) => {
  try {
    const { projectId, search } = req.query;
    const where = {};
    
    if (projectId) where.projectId = projectId;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const materials = await Material.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: materials });
  } catch (error) {
    logger.error('Get materials error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByPk(id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ]
    });
    
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }
    
    res.json({ success: true, data: material });
  } catch (error) {
    logger.error('Get material error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { projectId, name, description, quantity, unit, unitPrice, supplier } = req.body;
    
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const material = await Material.create({
      projectId,
      name,
      description,
      quantity,
      unit,
      unitPrice,
      supplier,
      createdBy: req.user.id,
      status: 'active'
    });

    await Audit.create({
      userId: req.user.id,
      action: 'CREATE_MATERIAL',
      details: { materialId: material.id, name },
      affectedRecord: material.id
    });

    res.status(201).json({ success: true, data: material });
  } catch (error) {
    logger.error('Create material error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByPk(id);
    
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    await material.update(req.body);

    await Audit.create({
      userId: req.user.id,
      action: 'UPDATE_MATERIAL',
      details: { materialId: material.id },
      affectedRecord: material.id
    });

    res.json({ success: true, data: material });
  } catch (error) {
    logger.error('Update material error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByPk(id);
    
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    await material.destroy();

    await Audit.create({
      userId: req.user.id,
      action: 'DELETE_MATERIAL',
      details: { materialId: material.id },
      affectedRecord: material.id
    });

    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    logger.error('Delete material error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const reject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    material.status = 'rejected';
    material.rejectionReason = reason || 'No reason provided';
    await material.save();

    await Audit.create({
      userId: req.user.id,
      action: 'REJECT_MATERIAL',
      details: { materialId: material.id, reason },
      affectedRecord: material.id
    });

    res.json({ 
      success: true, 
      data: material, 
      message: 'Material rejected successfully' 
    });
  } catch (error) {
    logger.error('Reject material error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};