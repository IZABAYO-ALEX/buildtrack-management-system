import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, DollarSign, Package, Clock, 
  CheckCircle, Plus, Calendar, ArrowUpRight,
  ArrowDownRight, UserPlus, RefreshCw,
  TrendingUp, TrendingDown, AlertCircle,
  Eye, Edit, Trash2, X, Search, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api, { workerService, projectService, expenseService } from '../../services/api';
import './Dashboard.css';

const SiteManagerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({
    totalWorkers: 0,
    presentToday: 0,
    totalExpenses: 0,
    activeProjects: 0,
    totalHours: 0,
    pendingExpenses: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [workersRes, projectsRes, expensesRes] = await Promise.all([
        workerService.getAll(),
        projectService.getAll(),
        expenseService.getAll()
      ]);

      setWorkers(workersRes.data.data || []);
      setProjects(projectsRes.data.data || []);
      setExpenses(expensesRes.data.data || []);

      // Calculate stats
      const totalWorkers = workersRes.data.data?.length || 0;
      const presentToday = workersRes.data.data?.filter(w => w.isActive).length || 0;
      const totalExpenses = expensesRes.data.data?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
      const activeProjects = projectsRes.data.data?.filter(p => p.status === 'active').length || 0;
      const totalHours = workersRes.data.data?.reduce((sum, w) => sum + parseFloat(w.totalHours || 0), 0) || 0;
      const pendingExpenses = expensesRes.data.data?.filter(e => e.status === 'pending').length || 0;

      setStats({
        totalWorkers,
        presentToday,
        totalExpenses,
        activeProjects,
        totalHours,
        pendingExpenses
      });

    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (workerId, status) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.post('/attendance', {
        workerId,
        projectId: workers.find(w => w.id === workerId)?.projectId,
        date: today,
        status,
        checkIn: status === 'present' ? '08:00' : null,
        checkOut: status === 'present' ? '17:00' : null,
        hoursWorked: status === 'present' ? 8 : 0
      });
      toast.success('Attendance marked successfully!');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const statCards = [
    {
      title: 'Total Workers',
      value: stats.totalWorkers,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'primary',
      subtitle: 'active workers',
      clickable: true,
      path: '/workers'
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      change: '+8%',
      trend: 'up',
      icon: CheckCircle,
      color: 'success',
      subtitle: 'checked in',
      clickable: false
    },
    {
      title: 'Total Expenses',
      value: `$${stats.totalExpenses.toFixed(0)}`,
      change: '+5%',
      trend: 'up',
      icon: DollarSign,
      color: 'warning',
      subtitle: 'this month',
      clickable: true,
      path: '/expenses'
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      change: '+3%',
      trend: 'up',
      icon: Package,
      color: 'info',
      subtitle: 'ongoing',
      clickable: true,
      path: '/projects'
    },
    {
      title: 'Hours Tracked',
      value: stats.totalHours.toFixed(1),
      change: '+15%',
      trend: 'up',
      icon: Clock,
      color: 'primary',
      subtitle: 'total hours',
      clickable: false
    },
    {
      title: 'Pending Expenses',
      value: stats.pendingExpenses,
      change: '-2%',
      trend: 'down',
      icon: AlertCircle,
      color: 'danger',
      subtitle: 'need approval',
      clickable: true,
      path: '/expenses'
    }
  ];

  const recentWorkers = workers.slice(0, 5);

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

  return (
    <DashboardLayout userRole="site_manager">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Site Manager Dashboard</h1>
            <p>Welcome back! Here's your site summary.</p>
          </div>
          <div className="header-actions">
            <button className="btn-outline" onClick={fetchAllData}>
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
                <h3>Recent Workers</h3>
                <button className="btn-link" onClick={() => navigate('/workers')}>View All</button>
              </div>
              {recentWorkers.length === 0 ? (
                <div className="empty-state-small">
                  <p>No workers registered yet.</p>
                  <button className="btn-primary" onClick={() => navigate('/workers')}>
                    <UserPlus size={16} />
                    Register Worker
                  </button>
                </div>
              ) : (
                recentWorkers.map((worker, index) => (
                  <motion.div 
                    key={worker.id} 
                    className="worker-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="worker-info">
                      <div className="worker-avatar-small">
                        {worker.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="worker-name">{worker.fullName}</div>
                        <div className="worker-role">{worker.role}</div>
                      </div>
                    </div>
                    <div className="worker-actions">
                      <span className={`status-badge ${worker.isActive ? 'success' : 'danger'}`}>
                        {worker.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button 
                        className="icon-btn" 
                        onClick={() => handleMarkAttendance(worker.id, 'present')}
                        title="Mark Present"
                      >
                        <CheckCircle size={16} color="#10b981" />
                      </button>
                      <button 
                        className="icon-btn" 
                        onClick={() => handleMarkAttendance(worker.id, 'absent')}
                        title="Mark Absent"
                      >
                        <X size={16} color="#ef4444" />
                      </button>
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
                  <UserPlus size={18} />
                  <span>Register Worker</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/expenses')}>
                  <DollarSign size={18} />
                  <span>Record Expense</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/projects')}>
                  <Package size={18} />
                  <span>View Projects</span>
                </button>
                <button className="quick-action" onClick={() => navigate('/reports')}>
                  <TrendingUp size={18} />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Today's Summary</h3>
              </div>
              <div className="today-summary">
                <div className="summary-item">
                  <span className="summary-label">Workers Present</span>
                  <span className="summary-value">{stats.presentToday} / {stats.totalWorkers}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Hours Worked</span>
                  <span className="summary-value">{stats.totalHours.toFixed(1)}h</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Pending Expenses</span>
                  <span className="summary-value">{stats.pendingExpenses}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Active Projects</span>
                  <span className="summary-value">{stats.activeProjects}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SiteManagerDashboard;
