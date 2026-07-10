import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Users, DollarSign, Package, Clock, 
  CheckCircle, Plus, Calendar, ArrowUpRight,
  ArrowDownRight, UserPlus, RefreshCw,
  TrendingUp, TrendingDown, AlertCircle,
  Eye, Edit, Trash2, X, Search, Filter,
  FileText, Upload, Send, Activity, CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import './Dashboard.css';

const SiteManagerDashboard = () => {
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
      const response = await api.get('/dashboard/site-manager');
      setDashboardData(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
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

  const userName = user?.fullName || user?.name || 'Site Manager';

  if (loading) {
    return (
      <DashboardLayout userRole="site_manager">
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
      icon: Package,
      color: 'primary',
      subtitle: 'assigned to you'
    },
    {
      title: 'Budget',
      value: formatCurrency(summary.totalBudget),
      change: summary.projectChange || 0,
      icon: DollarSign,
      color: 'success',
      subtitle: 'total allocated'
    },
    {
      title: 'Expenses',
      value: formatCurrency(summary.totalExpenses),
      change: summary.expenseChange || 0,
      icon: CreditCard,
      color: 'warning',
      subtitle: 'spent'
    },
    {
      title: 'Workers Today',
      value: summary.presentToday || 0,
      change: summary.workerChange || 0,
      icon: Users,
      color: 'info',
      subtitle: `${summary.totalWorkers || 0} total`
    },
    {
      title: 'Materials Used',
      value: `${summary.consumedMaterials?.toFixed(0) || 0} units`,
      change: summary.expenseChange || 0,
      icon: Package,
      color: 'warning',
      subtitle: `${summary.materialUtilization?.toFixed(0) || 0}% utilization`
    }
  ];

  return (
    <DashboardLayout userRole="site_manager">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {userName}! 🏗️</h1>
            <p>Here's your site summary for today.</p>
          </div>
          <div className="header-actions">
            <button className="btn-outline" onClick={fetchDashboardData}>
              <RefreshCw size={18} />
              Refresh
            </button>
            <button className="btn-primary" onClick={() => navigate('/workers')}>
              <UserPlus size={18} />
              Register Worker
            </button>
            <button className="btn-primary" onClick={() => navigate('/expenses')}>
              <Plus size={18} />
              Record Expense
            </button>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
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
                    width: '65%',
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
                <h3>My Projects</h3>
                <button className="btn-link" onClick={() => navigate('/projects')}>View All</button>
              </div>
              {dashboardData?.projects?.length === 0 ? (
                <div className="empty-state-small">
                  <p>No projects assigned to you</p>
                </div>
              ) : (
                dashboardData?.projects?.map((project, index) => (
                  <motion.div 
                    key={project.id} 
                    className="project-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="project-info">
                      <div className="project-name">{project.name}</div>
                      <div className="project-meta">
                        <span className={`status-badge ${project.status}`}>
                          <CheckCircle size={12} />
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="project-stats">
                      <div className="progress-wrapper">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${project.progress || 0}%` }} />
                        </div>
                        <span className="progress-text">{project.progress || 0}%</span>
                      </div>
                    </div>
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
                <button className="quick-action" onClick={() => navigate('/workers')}>
                  <Users size={18} />
                  <span>Mark Attendance</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/expenses')}>
                  <DollarSign size={18} />
                  <span>Record Expense</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/materials')}>
                  <Package size={18} />
                  <span>Add Material</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/reports')}>
                  <FileText size={18} />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SiteManagerDashboard;
