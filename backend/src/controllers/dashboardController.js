import { Project, Expense, Worker, WorkerPayment, Material } from '../models/index.js';
import logger from '../utils/logger.js';

export const getContractorDashboard = async (req, res) => {
  try {
    const contractorId = req.user.id;

    const projects = await Project.findAll({
      where: { contractorId, isArchived: false }
    });

    const projectIds = projects.map(p => p.id);

    const expenses = await Expense.findAll({
      where: { projectId: projectIds }
    });

    const workers = await Worker.findAll({
      where: { projectId: projectIds }
    });

    const payments = await WorkerPayment.findAll({
      where: { workerId: workers.map(w => w.id) }
    });

    const materials = await Material.findAll({
      where: { projectId: projectIds }
    });

    const activeProjects = projects.filter(p => p.status === 'active').length;
    const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalWorkers = workers.length;
    const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const materialCosts = materials.reduce((sum, m) => sum + parseFloat(m.totalCost || 0), 0);
    const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
    const remainingBudget = totalBudget - totalExpenses;

    const projectBreakdown = projects.map(project => {
      const projectExpenses = expenses.filter(e => e.projectId === project.id);
      const projectWorkers = workers.filter(w => w.projectId === project.id);
      const projectMaterials = materials.filter(m => m.projectId === project.id);
      
      return {
        id: project.id,
        name: project.name,
        budget: project.budget,
        expenses: projectExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0),
        workers: projectWorkers.length,
        materials: projectMaterials.reduce((sum, m) => sum + parseFloat(m.totalCost || 0), 0),
        status: project.status,
        utilization: project.budget > 0 ? (projectExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0) / project.budget) * 100 : 0
      };
    });

    res.json({
      success: true,
      data: {
        summary: {
          activeProjects,
          totalBudget,
          totalExpenses,
          totalWorkers,
          totalPayments,
          materialCosts,
          budgetUtilization,
          remainingBudget
        },
        projectBreakdown
      }
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
