import React from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, Package, Clock, CheckCircle, Plus, Calendar } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import './Dashboard.css';

const SiteManagerDashboard = () => {
  const stats = [
    { title: 'Workers Today', value: '32', change: '+8%', trend: 'up', icon: Users, color: 'primary' },
    { title: 'Daily Expenses', value: '$1,240', change: '-5%', trend: 'down', icon: DollarSign, color: 'success' },
    { title: 'Materials Used', value: '156', change: '+12%', trend: 'up', icon: Package, color: 'warning' },
    { title: 'Hours Tracked', value: '280', change: '+4%', trend: 'up', icon: Clock, color: 'info' }
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
        <div className="dashboard-header">
          <div><h1>Site Manager Dashboard</h1><p>Welcome back, Sarah! Here's today's site summary.</p></div>
          <div className="header-actions">
            <button className="btn-outline"><Calendar size={18} />Today</button>
            <button className="btn-primary"><Plus size={18} />Record Activity</button>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div key={index} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <div className="stat-header"><div className={`stat-icon ${stat.color}`}><stat.icon size={20} /></div></div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
            </motion.div>
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-main">
            <div className="card">
              <div className="card-header"><h3>Today's Attendance</h3><button className="btn-link">View All</button></div>
              {attendance.map((worker, index) => (
                <motion.div key={index} className="attendance-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                  <div className="worker-info"><span className="worker-name">{worker.name}</span></div>
                  <div className="attendance-status">
                    <span className={`status-badge ${worker.status}`}>{worker.status === 'present' ? <CheckCircle size={12} /> : <Clock size={12} />}{worker.status}</span>
                    <span className="attendance-time">{worker.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="card">
              <div className="card-header"><h3>Quick Actions</h3></div>
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
