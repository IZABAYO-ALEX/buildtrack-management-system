import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Building2, DollarSign, Users, Package, 
  TrendingUp, TrendingDown, ArrowUpRight, 
  ArrowDownRight, Plus, Eye, Calendar, 
  CheckCircle, Clock, BarChart3, Download,
  FileText, UserPlus, RefreshCw,
  FolderOpen, CreditCard, PieChart, Activity,
  AlertCircle, Send, FileCheck, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import './Dashboard.css';

const ContractorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/contractor');
      setDashboardData(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return `$${Number(amount).toLocaleString()}`;
  };

  const formatPercentage = (value) => {
    if (!value) return '0%';
    const num = Number(value);
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const getTrendClass = (value) => {
    if (value === undefined || value === null) return 'neutral';
    return value >= 0 ? 'up' : 'down';
  };

  const getTrendIcon = (value) => {
    if (value === undefined || value === null) return null;
    return value >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />;
  };

  const userName = user?.fullName || user?.name || 'Contractor';

  if (loading) {
    return (
      <DashboardLayout userRole="contractor">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const summary = dashboardData?.summary || {};

  const stats = [
    {
      title: 'Active Projects',
      value: summary.activeProjects || 0,
      change: summary.projectChange || 0,
      icon: FolderOpen,
      color: 'primary',
      subtitle: 'ongoing projects',
      clickable: true,
      path: '/projects'
    },
    {
      title: 'Total Budget',
      value: formatCurrency(summary.totalBudget),
      change: summary.projectChange || 0,
      icon: DollarSign,
      color: 'success',
      subtitle: 'allocated'
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(summary.totalExpenses),
      change: summary.expenseChange || 0,
      icon: CreditCard,
      color: 'warning',
      subtitle: 'spent',
      clickable: true,
      path: '/expenses'
    },
    {
      title: 'Total Workers',
      value: summary.totalWorkers || 0,
      change: summary.workerChange || 0,
      icon: Users,
      color: 'info',
      subtitle: 'active',
      clickable: true,
      path: '/workers'
    },
    {
      title: "Today's Reports",
      value: summary.todaysReports || 0,
      change: summary.reportChange || 0,
      icon: FileText,
      color: 'primary',
      subtitle: 'from site managers',
      clickable: true,
      path: '/reports'
    },
    {
      title: 'Budget Utilization',
      value: `${summary.budgetUtilization?.toFixed(1) || 0}%`,
      change: summary.utilizationChange || 0,
      icon: PieChart,
      color: 'warning',
      subtitle: 'used'
    }
  ];

  return (
    <DashboardLayout userRole="contractor">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {userName}! 👋</h1>
            <p>Here's your real-time project overview.</p>
          </div>
          <div className="header-actions">
            <button className="btn-outline" onClick={fetchDashboardData}>
              <RefreshCw size={18} />
              Refresh Data
            </button>
            <button className="btn-primary" onClick={() => navigate('/projects')}>
              <Plus size={18} />
              New Project
            </button>
            <button className="btn-primary" onClick={() => toast.success('Report generated!')}>
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
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
                <div className={`stat-change ${getTrendClass(stat.change)}`}>
                  {getTrendIcon(stat.change)}
                  {formatPercentage(stat.change)}
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
              <div className="stat-subtitle">{stat.subtitle}</div>
              <div className="stat-progress">
                <div 
                  className="stat-progress-bar" 
                  style={{ 
                    width: `${Math.min(Math.abs(stat.change || 0) * 2 + 20, 100)}%`,
                    background: getTrendClass(stat.change) === 'up' 
                      ? 'linear-gradient(90deg, #10b981, #34d399)' 
                      : 'linear-gradient(90deg, #ef4444, #f87171)'
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-main">
            <div className="card">
              <div className="card-header">
                <h3>Project Overview</h3>
                <button className="btn-link" onClick={() => navigate('/projects')}>View All</button>
              </div>
              {dashboardData?.projectBreakdown?.length === 0 ? (
                <div className="empty-state-small">
                  <p>No projects yet. Create your first project!</p>
                  <button className="btn-primary" onClick={() => navigate('/projects')}>
                    <Plus size={16} />
                    Create Project
                  </button>
                </div>
              ) : (
                dashboardData?.projectBreakdown?.slice(0, 5).map((project, index) => (
                  <motion.div 
                    key={index} 
                    className="project-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/projects`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="project-info">
                      <div className="project-name">{project.name}</div>
                      <div className="project-meta">
                        <span className={`status-badge ${project.status}`}>
                          <CheckCircle size={12} />
                          {project.status}
                        </span>
                        <span className="project-workers">
                          <Users size={14} />
                          {project.workers || 0} workers
                        </span>
                      </div>
                    </div>
                    <div className="project-stats">
                      <div className="project-budget">
                        <span>${(project.expenses || 0).toLocaleString()}</span>
                        <span className="budget-total"> / ${(project.budget || 0).toLocaleString()}</span>
                      </div>
                      <div className="progress-wrapper">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${Math.min(project.utilization || 0, 100)}%` }} />
                        </div>
                        <span className="progress-text">{(project.utilization || 0).toFixed(0)}%</span>
                      </div>
                    </div>
                    <button className="project-action" onClick={(e) => { e.stopPropagation(); navigate(`/projects`); }}>
                      <Eye size={18} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions">
                <button className="quick-action" onClick={() => navigate('/projects')}>
                  <Plus size={18} />
                  <span>New Project</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/users')}>
                  <UserPlus size={18} />
                  <span>Manage Users</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/workers')}>
                  <Users size={18} />
                  <span>Register Worker</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/reports')}>
                  <BarChart3 size={18} />
                  <span>View Reports</span>
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Recent Activity</h3>
                <button className="btn-link" onClick={() => navigate('/reports')}>View All</button>
              </div>
              {dashboardData?.recentExpenses?.length === 0 ? (
                <div className="empty-state-small">
                  <p>No recent activity</p>
                </div>
              ) : (
                dashboardData?.recentExpenses?.slice(0, 3).map((expense, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon" style={{ background: '#6366f120', color: '#6366f1' }}>
                      <DollarSign size={16} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Expense Recorded</div>
                      <div className="activity-description">{expense.category} - ${expense.amount}</div>
                      <div className="activity-time">{new Date(expense.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContractorDashboard;
