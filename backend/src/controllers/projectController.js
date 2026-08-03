import Project from '../models/Project.js';
import Expense from '../models/Expense.js';
import Worker from '../models/Worker.js';
import User from '../models/User.js';
import Audit from '../models/Audit.js';
//import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';


const generateProjectCode = () => {
  const prefix = 'PRJ';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}${month}-${random}`;
};
const canViewProject = (user, project) => {
  switch (user.role) {
    case 'admin':
      return true;

    case 'contractor':
      return project.contractorId === user.id;

    case 'site_manager':
      return project.siteManagerId === user.id;

    case 'accountant':
      return project.accountantId === user.id;

    default:
      return false;
  }
};

const canManageProject = (user, project) => {
  switch (user.role) {
    case 'admin':
      return true;

    case 'contractor':
      return project.contractorId === user.id;

    case 'site_manager':
      return project.siteManagerId === user.id;

    default:
      return false;
  }
};

export const createProject = async (req, res) => {
  try {

    const {
      name,
      clientName,
      clientEmail,
      clientPhone,
      description,
      location,
      budget,
      contractValue,
      currency,
      startDate,
      endDate,
      status,
      priority,
      category,
      projectType,
      siteArea,
      numberOfUnits,
      numberOfFloors,
      completionDate,
      contractorId,
      siteManagerId,
      accountantId,
      tags,
      riskLevel,
      notes
    } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Project name must be at least 3 characters'
      });
    }

    if (!budget || Number(budget) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid budget is required'
      });
    }

    let assignedContractorId;

    if (req.user.role === 'contractor') {
      assignedContractorId = req.user.id;
    } else if (req.user.role === 'admin') {

      if (!contractorId) {
        return res.status(400).json({
          success: false,
          message: 'Please select a contractor'
        });
      }

      assignedContractorId = contractorId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to create projects'
      });
    }

    const contractor = await User.findOne({
      where: {
        id: assignedContractorId,
        role: 'contractor',
        isActive: true
      }
    });

    if (!contractor) {
      return res.status(400).json({
        success: false,
        message: 'Selected contractor does not exist'
      });
    }

    if (siteManagerId) {
      const manager = await User.findOne({
        where: {
          id: siteManagerId,
          role: 'site_manager',
          isActive: true
        }
      });

      if (!manager) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Site Manager selected'
        });
      }
    }

    if (accountantId) {
      const accountant = await User.findOne({
        where: {
          id: accountantId,
          role: 'accountant',
          isActive: true
        }
      });

      if (!accountant) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Accountant selected'
        });
      }
    }

    const projectCode = generateProjectCode();

    const project = await Project.create({

      name: name.trim(),

      projectCode,

      clientName,

      clientEmail,

      clientPhone,

      description,

      location,

      budget,

      contractValue: contractValue || budget,

      currency: currency || 'UGX',

      startDate,

      endDate,

      status: status || 'planning',

      priority: priority || 'medium',

      category,

      projectType,

      siteArea,

      numberOfUnits,

      numberOfFloors,

      completionDate,

      contractorId: assignedContractorId,

      siteManagerId: siteManagerId || null,

      accountantId: accountantId || null,

      createdBy: req.user.id,

      tags: tags || [],

      riskLevel: riskLevel || 'medium',

      notes,

      progress: 0,

      completionPercentage: 0,

      actualCost: 0,

      isArchived: false

    });

    await Audit.create({
      userId: req.user.id,
      action: 'CREATE_PROJECT',
      details: {
        projectId: project.id,
        projectCode,
        projectName: project.name
      },
      affectedRecord: project.id
    });

    res.status(201).json({
      success: true,
      data: project,
      message: `Project "${project.name}" created successfully.`
    });

  } catch (error) {

    logger.error('Create project error:', error);

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
};

export const getProjects = async (req, res) => {
  try {

    const {
      status,
      search,
      includeArchived,
      page = 1,
      limit = 20
    } = req.query;

    const where = {};

    /*
      Visibility Rules

      Admin          -> All projects
      Contractor     -> Own projects
      Site Manager   -> Assigned projects
      Accountant     -> Assigned projects
    */

    switch (req.user.role) {

      case 'contractor':
        where.contractorId = req.user.id;
        break;

      case 'site_manager':
        where.siteManagerId = req.user.id;
        break;

      case 'accountant':
        where.accountantId = req.user.id;
        break;

      case 'admin':
      default:
        // Admin sees all projects
        break;
    }

    // Filter by status

    if (status) {
      where.status = status;
    }

    // Exclude archived unless requested

    if (!includeArchived || includeArchived === 'false') {
      where.isArchived = false;
    }

    // Search

    if (search) {

      where[Op.or] = [

        {
          name: {
            [Op.like]: `%${search}%`
          }
        },

        {
          projectCode: {
            [Op.like]: `%${search}%`
          }
        },

        {
          clientName: {
            [Op.like]: `%${search}%`
          }
        }

      ];
    }

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    const offset = (pageNumber - 1) * pageSize;

    const projects = await Project.findAll({

      where,

      include: [

        {
          model: Expense,
          as: 'expenses',
          attributes: ['id', 'amount'],
          required: false
        },

        {
          model: Worker,
          as: 'workers',
          attributes: ['id'],
          required: false
        },

        {
          model: User,
          as: 'contractor',
          attributes: [
            'id',
            'fullName',
            'email'
          ],
          required: false
        },

        {
          model: User,
          as: 'siteManager',
          attributes: [
            'id',
            'fullName',
            'email'
          ],
          required: false
        },

        {
          model: User,
          as: 'accountant',
          attributes: [
            'id',
            'fullName',
            'email'
          ],
          required: false
        }

      ],

      order: [
        ['created_at', 'DESC']
      ],

      limit: pageSize,

      offset

    });

    const total = await Project.count({
      where
    });

    const data = projects.map(project => {

      const totalExpenses =
        project.expenses?.reduce(
          (sum, expense) =>
            sum + parseFloat(expense.amount),
          0
        ) || 0;

      const remainingBudget =
        Number(project.budget) - totalExpenses;

      const budgetUtilization =
        Number(project.budget) > 0
          ? (totalExpenses / Number(project.budget)) * 100
          : 0;

      return {

        ...project.toJSON(),

        totalExpenses,

        remainingBudget,

        budgetUtilization,

        workerCount:
          project.workers?.length || 0

      };

    });

    res.json({

      success: true,

      data,

      pagination: {

        total,

        page: pageNumber,

        limit: pageSize,

        pages: Math.ceil(total / pageSize)

      }

    });

  } catch (error) {

    logger.error(
      'Get projects error:',
      error
    );

    res.status(400).json({

      success: false,

      message: error.message

    });

  }
};

export const getProjectById = async (req, res) => {
  try {

    const project = await Project.findByPk(req.params.id, {

      include: [

        {
          model: Expense,
          as: 'expenses',
          attributes: [
            'id',
            'amount',
            'category',
            'description',
            'date'
          ],
          required: false
        },

        {
          model: Worker,
          as: 'workers',
          attributes: [
            'id',
            'fullName',
            'role'
          ],
          required: false
        },

        {
          model: User,
          as: 'contractor',
          attributes: [
            'id',
            'fullName',
            'email'
          ],
          required: false
        },

        {
          model: User,
          as: 'siteManager',
          attributes: [
            'id',
            'fullName',
            'email'
          ],
          required: false
        },

        {
          model: User,
          as: 'accountant',
          attributes: [
            'id',
            'fullName',
            'email'
          ],
          required: false
        }

      ]

    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    /*
      Permission Check
    */

    if (!canViewProject(req.user, project)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this project'
      });
    }

    const totalExpenses =
      project.expenses?.reduce(
        (sum, expense) => sum + parseFloat(expense.amount),
        0
      ) || 0;

    const remainingBudget =
      Number(project.budget) - totalExpenses;

    const budgetUtilization =
      Number(project.budget) > 0
        ? (totalExpenses / Number(project.budget)) * 100
        : 0;

    res.json({

      success: true,

      data: {

        ...project.toJSON(),

        totalExpenses,

        remainingBudget,

        budgetUtilization,

        workerCount:
          project.workers?.length || 0

      }

    });

  } catch (error) {

    logger.error(
      'Get project error:',
      error
    );

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
};

export const updateProject = async (req, res) => {
  try {

    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    /*
      Permission Rules

      Admin          -> Any project
      Contractor     -> Own projects only
      Site Manager   -> Assigned projects only
      Accountant     -> No permission
    */

    if (!canManageProject(req.user, project)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this project'
      });
    }

    /*
      Prevent changing ownership fields.

      Only Admin can reassign these.
    */

    if (req.user.role !== 'admin') {

      delete req.body.contractorId;
      delete req.body.siteManagerId;
      delete req.body.accountantId;

    }

    /*
      If admin changes assignments,
      verify the users exist.
    */

    if (req.user.role === 'admin') {

      if (req.body.contractorId) {

        const contractor = await User.findOne({
          where: {
            id: req.body.contractorId,
            role: 'contractor',
            isActive: true
          }
        });

        if (!contractor) {
          return res.status(400).json({
            success: false,
            message: 'Invalid contractor selected'
          });
        }
      }

      if (req.body.siteManagerId) {

        const manager = await User.findOne({
          where: {
            id: req.body.siteManagerId,
            role: 'site_manager',
            isActive: true
          }
        });

        if (!manager) {
          return res.status(400).json({
            success: false,
            message: 'Invalid Site Manager selected'
          });
        }
      }

      if (req.body.accountantId) {

        const accountant = await User.findOne({
          where: {
            id: req.body.accountantId,
            role: 'accountant',
            isActive: true
          }
        });

        if (!accountant) {
          return res.status(400).json({
            success: false,
            message: 'Invalid Accountant selected'
          });
        }
      }

    }

    await project.update(req.body);

    await Audit.create({

      userId: req.user.id,

      action: 'UPDATE_PROJECT',

      details: {
        projectId: project.id,
        changes: req.body
      },

      affectedRecord: project.id

    });

    res.json({

      success: true,

      data: project,

      message: 'Project updated successfully'

    });

  } catch (error) {

    logger.error('Update project error:', error);

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
};

export const deleteProject = async (req, res) => {
  try {

    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    /*
      Permission Rules

      Admin -> Any project

      Contractor -> Own project only

      Site Manager -> Not allowed

      Accountant -> Not allowed
    */

    if (req.user.role === 'site_manager' || req.user.role === 'accountant') {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete projects'
      });
    }

    if (
      req.user.role === 'contractor' &&
      project.contractorId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own projects'
      });
    }

    /*
      Prevent deleting active projects
    */

    if (project.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Archive the project before deleting it.'
      });
    }

    await project.destroy();

    await Audit.create({

      userId: req.user.id,

      action: 'DELETE_PROJECT',

      details: {

        projectId: project.id,

        projectName: project.name,

        projectCode: project.projectCode,

        performedBy: req.user.email

      },

      affectedRecord: project.id

    });

    res.json({

      success: true,

      message: 'Project moved to recycle bin successfully.'

    });

  } catch (error) {

    logger.error('Delete project error:', error);

    res.status(400).json({

      success: false,

      message: error.message

    });

  }
};

export const archiveProject = async (req, res) => {
  try {

    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }


    /*
      Permission Rules

      Admin:
      - Can archive any project

      Contractor:
      - Can archive only own projects

      Site Manager:
      - Cannot archive

      Accountant:
      - Cannot archive
    */


    if (
      req.user.role === 'site_manager' ||
      req.user.role === 'accountant'
    ) {

      return res.status(403).json({
        success: false,
        message: 'You are not allowed to archive projects'
      });

    }


    if (
      req.user.role === 'contractor' &&
      project.contractorId !== req.user.id
    ) {

      return res.status(403).json({
        success: false,
        message: 'You can only archive your own projects'
      });

    }



    /*
      Prevent duplicate archive action
    */

    if (project.isArchived) {

      return res.status(400).json({
        success: false,
        message: 'Project is already archived'
      });

    }



    project.isArchived = true;

    await project.save();



    await Audit.create({

      userId: req.user.id,

      action: 'ARCHIVE_PROJECT',

      details: {

        projectId: project.id,

        projectName: project.name,

        projectCode: project.projectCode,

        performedBy: req.user.email

      },

      affectedRecord: project.id

    });



    res.json({

      success: true,

      message: 'Project archived successfully'

    });



  } catch (error) {

    logger.error(
      'Archive project error:',
      error
    );


    res.status(400).json({

      success: false,

      message: error.message

    });

  }
};

export const updateProjectProgress = async (req, res) => {
  try {

    const { progress } = req.body;


    const project = await Project.findByPk(req.params.id);


    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }


    /*
      Permission Rules

      Admin:
      - Any project

      Contractor:
      - Own projects only

      Site Manager:
      - Assigned projects only

      Accountant:
      - Not allowed
    */


    if (!canManageProject(req.user, project)) {

      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update project progress'
      });

    }



    /*
      Validate progress value
    */


    if (
      progress === undefined ||
      progress < 0 ||
      progress > 100
    ) {

      return res.status(400).json({

        success: false,

        message: 'Progress must be between 0 and 100'

      });

    }



    const oldProgress = project.progress;

project.progress = progress;
project.completionPercentage = progress;


    /*
      Automatically complete project
    */


    if (Number(progress) === 100) {

      project.status = 'completed';

      project.completionDate = new Date();

    }


    /*
      If progress is reduced,
      reopen the project
    */


    if (
      Number(progress) < 100 &&
      project.status === 'completed'
    ) {

      project.status = 'active';

      project.completionDate = null;

    }



    await project.save();



    await Audit.create({

      userId: req.user.id,

      action: 'UPDATE_PROJECT_PROGRESS',

      details: {

        projectId: project.id,

        projectName: project.name,

        oldProgress,

        newProgress: progress,

        performedBy: req.user.email

      },

      affectedRecord: project.id

    });



    res.json({

      success: true,

      data: project,

      message: 'Project progress updated successfully'

    });




  } catch (error) {


    logger.error(
      'Update progress error:',
      error
    );


    res.status(400).json({

      success:false,

      message:error.message
    });


  }
};
