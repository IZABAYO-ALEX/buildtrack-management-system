import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, DollarSign, Package, Clock, 
  CheckCircle, Plus, Calendar, ArrowUpRight,
  ArrowDownRight, UserPlus, RefreshCw,
  TrendingUp, TrendingDown, AlertCircle,
  Eye, Edit, Trash2, X, Search, Filter,
  FileText, Upload, Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api, { workerService, projectService, expenseService, dailyReportService } from '../../services/api';
import './Dashboard.css';

const SiteManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [projectsRes] = await Promise.all([
        projectService.getAll()
      ]);

      setProjects(projectsRes.data.data || []);
      
      if (projectsRes.data.data?.length > 0) {
        setSelectedProject(projectsRes.data.data[0].id);
        await fetchDashboardData(projectsRes.data.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (projectId) => {
    try {
      const response = await dailyReportService.getDashboard({ projectId });
      setDashboardData(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    }
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    if (projectId) {
      fetchDashboardData(projectId);
    }
  };

  const handleMarkAttendance = async (workerId, status) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const checkIn = status === 'present' ? '08:00' : null;
      const checkOut = status === 'present' ? '17:00' : null;
      const hoursWorked = status === 'present' ? 8 : 0;

      await api.post('/attendance', {
        workerId,
        projectId: selectedProject,
        date: today,
        status,
        checkIn,
        checkOut,
        hoursWorked
      });

      toast.success(`Attendance marked as ${status}`);
      fetchDashboardData(selectedProject);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleGenerateReport = async () => {
    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await dailyReportService.generate({
        projectId: selectedProject,
        date: today
      });
      toast.success('Daily report generated and sent!');
      setShowReportModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="site_manager">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading site data...</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: 'Workers Today',
      value: dashboardData?.workers?.present || 0,
      total: dashboardData?.workers?.total || 0,
      change: '+8%',
      trend: 'up',
      icon: Users,
      color: 'primary',
      subtitle: `${dashboardData?.workers?.absent || 0} absent`
    },
    {
      title: 'Daily Expenses',
      value: `$${dashboardData?.expenses?.total?.toFixed(0) || 0}`,
      change: '-5%',
      trend: 'down',
      icon: DollarSign,
      color: 'warning',
      subtitle: `${dashboardData?.expenses?.count || 0} transactions`
    },
    {
      title: 'Materials Used',
      value: dashboardData?.materials?.reduce((sum, m) => sum + (m.consumed || 0), 0) || 0,
      change: '+12%',
      trend: 'up',
      icon: Package,
      color: 'info',
      subtitle: `${dashboardData?.materials?.length || 0} types`
    },
    {
      title: 'Total Workers',
      value: dashboardData?.workers?.total || 0,
      change: '+4%',
      trend: 'up',
      icon: Clock,
      color: 'success',
      subtitle: 'registered'
    }
  ];

  return (
    <DashboardLayout userRole="site_manager">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Site Manager Dashboard</h1>
            <p>Track daily attendance, materials, and expenses</p>
          </div>
          <div className="header-actions">
            <select
              className="project-select"
              value={selectedProject || ''}
              onChange={handleProjectChange}
            >
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button className="btn-primary" onClick={() => setShowAttendanceModal(true)}>
              <Users size={18} />
              Mark Attendance
            </button>
            <button className="btn-primary" onClick={() => setShowReportModal(true)}>
              <FileText size={18} />
              Generate Report
            </button>
            <button className="btn-outline" onClick={() => fetchDashboardData(selectedProject)}>
              <RefreshCw size={18} />
              Refresh
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
                <div className={`stat-change ${stat.trend}`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
              <div className="stat-subtitle">{stat.subtitle}</div>
              <div className="stat-progress">
                <div className="stat-progress-bar" style={{ width: '65%' }}></div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-main">
            <div className="card">
              <div className="card-header">
                <h3>Today's Workers</h3>
                <button className="btn-link" onClick={() => setShowAttendanceModal(true)}>
                  <Plus size={16} />
                  Mark All
                </button>
              </div>
              {dashboardData?.workers?.details?.length === 0 ? (
                <div className="empty-state-small">
                  <p>No attendance recorded for today</p>
                </div>
              ) : (
                dashboardData?.workers?.details?.map((worker, index) => (
                  <motion.div 
                    key={worker.id} 
                    className="worker-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="worker-info">
                      <div className="worker-avatar-small">
                        {worker.Worker?.fullName?.charAt(0)?.toUpperCase() || 'W'}
                      </div>
                      <div>
                        <div className="worker-name">{worker.Worker?.fullName}</div>
                        <div className="worker-role">{worker.status}</div>
                      </div>
                    </div>
                    <div className="worker-actions">
                      <span className={`status-badge ${worker.status === 'present' ? 'success' : worker.status === 'absent' ? 'danger' : 'warning'}`}>
                        {worker.status}
                      </span>
                      <span className="worker-hours">{worker.hoursWorked}h</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Materials Inventory</h3>
                <button className="btn-link">View All</button>
              </div>
              {dashboardData?.materials?.length === 0 ? (
                <div className="empty-state-small">
                  <p>No materials recorded</p>
                </div>
              ) : (
                dashboardData?.materials?.map((material, index) => (
                  <motion.div 
                    key={material.id} 
                    className="material-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="material-info">
                      <div className="material-name">{material.name}</div>
                      <div className="material-unit">{material.unit}</div>
                    </div>
                    <div className="material-stats">
                      <div className="material-quantity">
                        <span>Total: {material.total}</span>
                        <span className="consumed">Used: {material.consumed}</span>
                        <span className="remaining">Remaining: {material.remaining}</span>
                      </div>
                      <div className="progress-wrapper">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${(material.consumed / material.total) * 100}%` }}></div>
                        </div>
                        <span className="progress-text">
                          {((material.consumed / material.total) * 100).toFixed(0)}% used
                        </span>
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
                <h3>Today's Summary</h3>
              </div>
              <div className="today-summary">
                <div className="summary-item">
                  <span className="summary-label">Workers Present</span>
                  <span className="summary-value">{dashboardData?.workers?.present || 0} / {dashboardData?.workers?.total || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Hours</span>
                  <span className="summary-value">{dashboardData?.workers?.details?.reduce((sum, w) => sum + (w.hoursWorked || 0), 0) || 0}h</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Materials Used</span>
                  <span className="summary-value">{dashboardData?.materials?.reduce((sum, m) => sum + (m.consumed || 0), 0) || 0} units</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Expenses</span>
                  <span className="summary-value">${dashboardData?.expenses?.total?.toFixed(0) || 0}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions">
                <button className="quick-action" onClick={() => setShowAttendanceModal(true)}>
                  <Users size={18} />
                  <span>Mark Attendance</span>
                </button>
                <button className="quick-action" onClick={() => setShowReportModal(true)}>
                  <FileText size={18} />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Modal */}
        {showAttendanceModal && (
          <div className="modal-overlay" onClick={() => setShowAttendanceModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Mark Attendance</h2>
                <button className="modal-close" onClick={() => setShowAttendanceModal(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="attendance-grid">
                {dashboardData?.workers?.details?.map((worker) => (
                  <div key={worker.id} className="attendance-card">
                    <div className="attendance-worker">
                      <span>{worker.Worker?.fullName}</span>
                    </div>
                    <div className="attendance-buttons">
                      <button 
                        className={`attendance-btn present ${worker.status === 'present' ? 'active' : ''}`}
                        onClick={() => handleMarkAttendance(worker.workerId, 'present')}
                      >
                        Present
                      </button>
                      <button 
                        className={`attendance-btn absent ${worker.status === 'absent' ? 'active' : ''}`}
                        onClick={() => handleMarkAttendance(worker.workerId, 'absent')}
                      >
                        Absent
                      </button>
                      <button 
                        className={`attendance-btn leave ${worker.status === 'leave' ? 'active' : ''}`}
                        onClick={() => handleMarkAttendance(worker.workerId, 'leave')}
                      >
                        Leave
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Generate Daily Report</h2>
                <button className="modal-close" onClick={() => setShowReportModal(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="report-preview">
                <div className="report-section">
                  <h4>📊 Today's Summary</h4>
                  <div className="report-item">
                    <span>Workers Present:</span>
                    <strong>{dashboardData?.workers?.present || 0}</strong>
                  </div>
                  <div className="report-item">
                    <span>Total Hours:</span>
                    <strong>{dashboardData?.workers?.details?.reduce((sum, w) => sum + (w.hoursWorked || 0), 0) || 0}h</strong>
                  </div>
                  <div className="report-item">
                    <span>Materials Used:</span>
                    <strong>{dashboardData?.materials?.reduce((sum, m) => sum + (m.consumed || 0), 0) || 0} units</strong>
                  </div>
                  <div className="report-item">
                    <span>Total Expenses:</span>
                    <strong>${dashboardData?.expenses?.total?.toFixed(0) || 0}</strong>
                  </div>
                </div>
                <div className="report-actions">
                  <button 
                    className="btn-primary" 
                    onClick={handleGenerateReport}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Generating...' : 'Generate & Send Report'}
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SiteManagerDashboard;
