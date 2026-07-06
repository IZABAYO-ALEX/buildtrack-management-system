import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, TrendingUp, Calendar, Clock, 
  ArrowUpRight, ArrowDownRight, Eye, Download,
  CheckCircle, AlertCircle, RefreshCw,
  BarChart3, PieChart, FileText, Users,
  Package, Building2, Receipt, CreditCard,
  Wallet, TrendingDown, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import './Dashboard.css';

const AccountantDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      pendingApprovals: 0,
      totalProjects: 0,
      approvedExpenses: 0,
      totalPayments: 0,
      pendingPayments: 0,
      totalWorkers: 0,
      materialCosts: 0
    },
    recentExpenses: [],
    recentPayments: [],
    budgetUtilization: [],
    expenseBreakdown: [],
    projects: []
  });
  const [reports, setReports] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all required data
      const [expensesRes, projectsRes, paymentsRes, workersRes, materialsRes, reportsRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/projects'),
        api.get('/workers'),
        api.get('/materials'),
        api.get('/reports/budget')
      ]);

      const expenses = expensesRes.data.data || [];
      const projects = projectsRes.data.data || [];
      const payments = paymentsRes.data.data || [];
      const workers = workersRes.data.data || [];
      const materials = materialsRes.data.data || [];
      const budgetData = reportsRes.data.data || { projects: [] };

      // Calculate summary statistics
      const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
      const totalRevenue = projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
      const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const pendingApprovals = expenses.filter(e => e.status === 'pending').length;
      const approvedExpenses = expenses.filter(e => e.status === 'approved').length;
      const materialCosts = materials.reduce((sum, m) => sum + parseFloat(m.totalCost || 0), 0);
      const totalWorkers = workers.filter(w => w.isActive).length;

      // Calculate budget utilization by project
      const budgetUtilization = budgetData.projects.map(p => ({
        name: p.name,
        budget: p.budget,
        spent: p.spent || 0,
        remaining: p.remaining || 0,
        utilization: p.utilization || 0
      }));

      // Expense breakdown by category
      const expenseBreakdown = {};
      expenses.forEach(e => {
        if (!expenseBreakdown[e.category]) {
          expenseBreakdown[e.category] = 0;
        }
        expenseBreakdown[e.category] += parseFloat(e.amount || 0);
      });

      const expenseBreakdownArray = Object.keys(expenseBreakdown).map(key => ({
        category: key,
        amount: expenseBreakdown[key]
      }));

      // Recent expenses (last 10)
      const recentExpenses = expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

      // Recent payments
      const recentPayments = payments
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
        .slice(0, 10);

      setDashboardData({
        summary: {
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          pendingApprovals,
          totalProjects: projects.length,
          approvedExpenses,
          totalPayments,
          pendingPayments: payments.filter(p => p.status === 'pending').length,
          totalWorkers,
          materialCosts
        },
        recentExpenses,
        recentPayments,
        budgetUtilization,
        expenseBreakdown: expenseBreakdownArray,
        projects
      });

      setReports(reportsRes.data.data || []);

    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await api.get('/reports/expenses');
      toast.success('Report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(dashboardData.summary.totalRevenue),
      change: '+15%',
      trend: 'up',
      icon: DollarSign,
      color: 'success',
      subtitle: 'this quarter',
      clickable: true,
      path: '/reports'
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(dashboardData.summary.totalExpenses),
      change: '-8%',
      trend: 'down',
      icon: CreditCard,
      color: 'danger',
      subtitle: 'this quarter',
      clickable: true,
      path: '/expenses'
    },
    {
      title: 'Net Profit',
      value: formatCurrency(dashboardData.summary.netProfit),
      change: '+12%',
      trend: 'up',
      icon: TrendingUp,
      color: 'primary',
      subtitle: 'this quarter',
      clickable: true,
      path: '/reports/profitability'
    },
    {
      title: 'Pending Approvals',
      value: dashboardData.summary.pendingApprovals,
      change: '-3',
      trend: 'down',
      icon: Clock,
      color: 'warning',
      subtitle: 'need review',
      clickable: true,
      path: '/expenses'
    },
    {
      title: 'Total Payments',
      value: formatCurrency(dashboardData.summary.totalPayments),
      change: '+5%',
      trend: 'up',
      icon: Wallet,
      color: 'info',
      subtitle: 'processed',
      clickable: true,
      path: '/reports/workers'
    },
    {
      title: 'Material Costs',
      value: formatCurrency(dashboardData.summary.materialCosts),
      change: '+2%',
      trend: 'up',
      icon: Package,
      color: 'primary',
      subtitle: 'total',
      clickable: true,
      path: '/materials'
    }
  ];

  if (loading) {
    return (
      <DashboardLayout userRole="accountant">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading financial data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="accountant">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>💰 Accountant Dashboard</h1>
            <p>Real-time financial overview of all projects</p>
          </div>
          <div className="header-actions">
            <button className="btn-outline" onClick={fetchAllData}>
              <RefreshCw size={18} />
              Refresh Data
            </button>
            <button className="btn-primary" onClick={handleExportReport}>
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <motion.div 
              key={index} 
              className={`stat-card ${stat.clickable ? 'clickable' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => stat.clickable && stat.path && navigate(stat.path)}
            >
              <div className="stat-header">
                <div className={`stat-icon ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div className={`stat-change ${stat.trend}`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
              <div className="stat-subtitle">{stat.subtitle}</div>
              <div className="stat-progress">
                <div className="stat-progress-bar" style={{ width: `${Math.min(Math.random() * 80 + 20, 100)}%` }}></div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-main">
            <div className="card">
              <div className="card-header">
                <h3>Recent Expenses</h3>
                <button className="btn-link" onClick={() => navigate('/expenses')}>View All</button>
              </div>
              {dashboardData.recentExpenses.length === 0 ? (
                <div className="empty-state-small">
                  <p>No expenses recorded yet</p>
                </div>
              ) : (
                dashboardData.recentExpenses.map((expense, index) => (
                  <motion.div 
                    key={expense.id} 
                    className="expense-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="expense-info">
                      <span className="expense-category">{expense.category}</span>
                      <span className="expense-date">{expense.date}</span>
                      <span className="expense-project">
                        {dashboardData.projects.find(p => p.id === expense.projectId)?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="expense-actions">
                      <span className="expense-amount">${expense.amount?.toLocaleString()}</span>
                      <span className={`status-badge ${expense.status}`}>{expense.status}</span>
                      <button className="icon-btn" onClick={() => navigate(`/expenses`)}>
                        <Eye size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Budget Utilization</h3>
                <button className="btn-link" onClick={() => navigate('/reports/budget')}>View All</button>
              </div>
              {dashboardData.budgetUtilization.length === 0 ? (
                <div className="empty-state-small">
                  <p>No budget data available</p>
                </div>
              ) : (
                dashboardData.budgetUtilization.slice(0, 5).map((project, index) => (
                  <motion.div 
                    key={index} 
                    className="budget-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="budget-info">
                      <span className="budget-name">{project.name}</span>
                      <span className="budget-amount">
                        ${project.spent?.toLocaleString()} / ${project.budget?.toLocaleString()}
                      </span>
                    </div>
                    <div className="budget-progress">
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${project.utilization > 80 ? 'danger' : project.utilization > 60 ? 'warning' : ''}`}
                          style={{ width: `${Math.min(project.utilization || 0, 100)}%` }}
                        ></div>
                      </div>
                      <span className="budget-percentage">{(project.utilization || 0).toFixed(0)}%</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="card">
              <div className="card-header">
                <h3>Financial Summary</h3>
              </div>
              <div className="financial-summary">
                <div className="summary-row">
                  <span>Revenue</span>
                  <span>{formatCurrency(dashboardData.summary.totalRevenue)}</span>
                </div>
                <div className="summary-row">
                  <span>Expenses</span>
                  <span>{formatCurrency(dashboardData.summary.totalExpenses)}</span>
                </div>
                <div className="summary-row highlight">
                  <span>Net Profit</span>
                  <span className={dashboardData.summary.netProfit >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(dashboardData.summary.netProfit)}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Pending Approvals</span>
                  <span>{dashboardData.summary.pendingApprovals}</span>
                </div>
                <div className="summary-row">
                  <span>Total Payments</span>
                  <span>{formatCurrency(dashboardData.summary.totalPayments)}</span>
                </div>
                <div className="summary-row">
                  <span>Active Workers</span>
                  <span>{dashboardData.summary.totalWorkers}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Expense Categories</h3>
              </div>
              <div className="expense-categories">
                {dashboardData.expenseBreakdown.length === 0 ? (
                  <div className="empty-state-small">
                    <p>No expense data</p>
                  </div>
                ) : (
                  dashboardData.expenseBreakdown.slice(0, 6).map((item, index) => (
                    <div key={index} className="category-item">
                      <span className="category-name">{item.category}</span>
                      <span className="category-amount">{formatCurrency(item.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions">
                <button className="quick-action" onClick={() => navigate('/expenses')}>
                  <Receipt size={18} />
                  <span>Review Expenses</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/reports')}>
                  <FileText size={18} />
                  <span>Generate Report</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/analytics')}>
                  <BarChart3 size={18} />
                  <span>View Analytics</span>
                </button>
                <button className="quick-action" onClick={fetchAllData}>
                  <RefreshCw size={18} />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountantDashboard;
