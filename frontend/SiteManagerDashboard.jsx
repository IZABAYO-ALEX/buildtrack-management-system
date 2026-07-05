import React from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, Package, Clock, CheckCircle, Plus, Calendar, ArrowUpRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import './Dashboard.css';

const SiteManagerDashboard = () => {
  const stats = [
    { title: 'Workers Today', value: '32', change: '+8%', trend: 'up', icon: Users, color: 'primary', subtitle: 'on site' },
    { title: 'Daily Expenses', value: '$1,240', change: '-5%', trend: 'down', icon: DollarSign, color: 'success', subtitle: 'today' },
    { title: 'Materials Used', value: '156', change: '+12%', trend: 'up', icon: Package, color: 'warning', subtitle: 'units' },
    { title: 'Hours Tracked', value: '280', change: '+4%', trend: 'up', icon: Clock, color: 'info', subtitle: 'this week' }
  ];

  const attendance = [
    { name: 'James Muwonge', status: 'present', time: '07:30' },
    { name: 'Mary Nakato', status: 'present', time: '07:45' },
    { name: 'Robert Odongo', status: 'absent', time: '-' },
    { name: 'Grace Atim', status: 'present', time: '08:00' }
  ];

  return (
    <DashboardLayout userRole="site_manager">
      <div className="dashboard-container">
        <motion.div 
          className="hero-banner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-overlay">
            <div className="hero-content">
              <h1>Welcome Back, Sarah!</h1>
              <p>Track daily operations, manage workers, and monitor site expenses in real-time.</p>
              <div className="hero-buttons">
                <button className="btn-primary">Mark Attendance</button>
                <button className="btn-outline">Record Expense</button>
              </div>
            </div>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&h=400&fit=crop&crop=center"
            alt="Construction Site Workers"
            className="hero-image"
          />
        </motion.div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="stat-header">
                <div className={`stat-icon ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div className={`stat-change ${stat.trend}`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowUpRight size={14} />}
                  {stat.change}
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
              <div className="stat-subtitle">{stat.subtitle}</div>
              <div className="stat-progress">
                <div className="stat-progress-bar" style={{ width: `${Math.random() * 80 + 20}%` }}></div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-main">
            <div className="card">
              <div className="card-header">
                <h3>Today's Attendance</h3>
                <button className="btn-link">View All</button>
              </div>
              {attendance.map((worker, index) => (
                <motion.div 
                  key={index} 
                  className="attendance-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="worker-info">
                    <span className="worker-name">{worker.name}</span>
                  </div>
                  <div className="attendance-status">
                    <span className={`status-badge ${worker.status}`}>
                      {worker.status === 'present' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {worker.status}
                    </span>
                    <span className="attendance-time">{worker.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions">
                <button className="quick-action"><Plus size={18} /><span>Record Expense</span></button>
                <button className="quick-action"><Users size={18} /><span>Mark Attendance</span></button>
                <button className="quick-action"><Package size={18} /><span>Add Material</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SiteManagerDashboard;
