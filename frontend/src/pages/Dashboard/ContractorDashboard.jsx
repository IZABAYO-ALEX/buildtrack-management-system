import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, DollarSign, Users, Package, 
  TrendingUp, TrendingDown, ArrowUpRight, 
  ArrowDownRight, Plus, Eye, Calendar, 
  CheckCircle, Clock, BarChart3, Download,
  FileText, UserPlus, RefreshCw,
  FolderOpen, CreditCard, PieChart, Activity,
  AlertCircle, Send, FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import './Dashboard.css';

const ContractorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [projectsRes, reportsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/daily-reports')
      ]);

      setProjects(projectsRes.data.data || []);
      setDailyReports(reportsRes.data.data || []);

      const dashboardRes = await api.get('/dashboard/contractor');
      setDashboardData(dashboardRes.data.data);

    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

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

  const stats = [
    {
      title: 'Active Projects',
      value: dashboardData?.summary?.activeProjects || 0,
      change: '+12.5%',
      trend: 'up',
      icon: FolderOpen,
      color: 'primary',
      subtitle: 'ongoing projects'
    },
    {
      title: 'Total Budget',
      value: `$${dashboardData?.summary?.totalBudget?.toLocaleString() || 0}`,
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'success',
      subtitle: 'allocated'
    },
    {
      title: 'Total Expenses',
      value: `$${dashboardData?.summary?.totalExpenses?.toLocaleString() || 0}`,
      change: '-5.3%',
      trend: 'down',
      icon: CreditCard,
      color: 'warning',
      subtitle: 'spent'
    },
    {
      title: 'Total Workers',
      value: dashboardData?.summary?.totalWorkers || 0,
      change: '+4.3%',
      trend: 'up',
      icon: Users,
      color: 'info',
      subtitle: 'active'
    },
    {
      title: 'Today\'s Reports',
      value: dailyReports.filter(r => r.date === new Date().toISOString().split('T')[0]).length || 0,
      change: '+2.1%',
      trend: 'up',
      icon: FileText,
      color: 'primary',
      subtitle: 'from site managers'
    },
    {
      title: 'Budget Utilization',
      value: `${dashboardData?.summary?.budgetUtilization?.toFixed(1) || 0}%`,
      change: '+6.8%',
      trend: 'up',
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
            <h1>Contractor Dashboard</h1>
            <p>Real-time overview of all projects and site activities</p>
          </div>
          <div className="header-actions">
            <button className="btn-outline" onClick={fetchAllData}>
              <RefreshCw size={18} />
              Sync All
            </button>
            <button className="btn-primary" onClick={() => navigate('/projects')}>
              <Plus size={18} />
              New Project
            </button>
            <button className="btn-primary" onClick={() => toast.success('Report downloaded!')}>
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="stat-card clickable"
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
                          <div className="progress-fill" style={{ width: `${Math.min(project.utilization || 0, 100)}%` }}></div>
                        </div>
                        <span className="progress-text">{(project.utilization || 0).toFixed(0)}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Daily Reports from Sites</h3>
                <button className="btn-link" onClick={() => navigate('/reports')}>View All</button>
              </div>
              {dailyReports.length === 0 ? (
                <div className="empty-state-small">
                  <p>No daily reports yet</p>
                </div>
              ) : (
                dailyReports.slice(0, 4).map((report, index) => (
                  <motion.div 
                    key={report.id} 
                    className="report-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="report-info">
                      <div className="report-date">
                        <Calendar size={14} />
                        {report.date}
                      </div>
                      <div className="report-summary">
                        <span>👷 {report.workersPresent} workers</span>
                        <span>📦 {Object.keys(report.materialsUsed || {}).length} materials</span>
                        <span>💰 ${report.totalExpenses?.toFixed(0) || 0}</span>
                      </div>
                    </div>
                    <div className="report-status">
                      <span className={`status-badge ${report.sentToContractor ? 'success' : 'warning'}`}>
                        {report.sentToContractor ? '✅ Synced' : '⏳ Pending'}
                      </span>
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
                <button className="quick-action" onClick={() => navigate('/projects')}>
                  <Plus size={18} />
                  <span>New Project</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/users')}>
                  <UserPlus size={18} />
                  <span>Manage Users</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/reports')}>
                  <BarChart3 size={18} />
                  <span>View Reports</span>
                </button>
                <button className="quick-action" onClick={fetchAllData}>
                  <RefreshCw size={18} />
                  <span>Sync Data</span>
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Site Manager Status</h3>
              </div>
              <div className="site-status">
                <div className="status-item">
                  <span className="status-label">Active Sites</span>
                  <span className="status-value">{projects.filter(p => p.status === 'active').length}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Reports Today</span>
                  <span className="status-value">
                    {dailyReports.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Pending Sync</span>
                  <span className="status-value">
                    {dailyReports.filter(r => !r.sentToContractor).length}
                  </span>
                </div>
                <div className="status-item highlight">
                  <span className="status-label">Overall Status</span>
                  <span className="status-value status-synced">🟢 All Systems Go</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContractorDashboard;
