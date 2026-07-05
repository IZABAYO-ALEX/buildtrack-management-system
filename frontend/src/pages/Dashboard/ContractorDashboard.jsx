import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, FolderOpen, TrendingUp, ArrowUpRight, ArrowDownRight, Plus, Eye, Calendar, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import './Dashboard.css';

const ContractorDashboard = () => {
  const stats = [
    { title: 'Total Expenses', value: '$45,280', change: '+12.5%', trend: 'up', icon: DollarSign, color: 'primary', subtitle: 'This month' },
    { title: 'Budget Used', value: '68%', change: '+8.2%', trend: 'up', icon: TrendingUp, color: 'warning', subtitle: 'of total budget' },
    { title: 'Active Projects', value: '12', change: '+4.3%', trend: 'up', icon: FolderOpen, color: 'success', subtitle: 'ongoing projects' },
    { title: 'Active Workers', value: '48', change: '-2.1%', trend: 'down', icon: Users, color: 'info', subtitle: 'on site today' }
  ];

  const projects = [
    { name: 'Kampala Heights', spent: 325000, budget: 500000, progress: 65, status: 'active', deadline: 'Dec 2024' },
    { name: 'Entebbe Mall', spent: 450000, budget: 750000, progress: 60, status: 'active', deadline: 'Feb 2025' },
    { name: 'Jinja Complex', spent: 300000, budget: 1000000, progress: 30, status: 'on_hold', deadline: 'May 2025' }
  ];

  return (
    <DashboardLayout userRole="contractor">
      <div className="dashboard-container">
        {/* Hero Section with Construction Site Image */}
        <motion.div 
          className="hero-banner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-overlay">
            <div className="hero-content">
              <h1>Welcome Back, John!</h1>
              <p>Track your construction projects, monitor expenses, and manage your workforce efficiently.</p>
              <div className="hero-buttons">
                <button className="btn-primary">View Projects</button>
                <button className="btn-outline">Add Expense</button>
              </div>
            </div>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=400&fit=crop&crop=center"
            alt="Construction Site"
            className="hero-image"
          />
        </motion.div>

        {/* Stats Grid */}
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
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
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

        {/* Projects & Activities Grid */}
        <div className="dashboard-grid">
          <div className="dashboard-main">
            <div className="card">
              <div className="card-header">
                <h3>Project Overview</h3>
                <button className="btn-link">View All</button>
              </div>
              {projects.map((project, index) => (
                <motion.div 
                  key={index} 
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
                      <span className="project-deadline">
                        <Calendar size={14} />
                        {project.deadline}
                      </span>
                    </div>
                  </div>
                  <div className="project-stats">
                    <div className="project-budget">
                      <span>${project.spent.toLocaleString()}</span>
                      <span className="budget-total"> / ${project.budget.toLocaleString()}</span>
                    </div>
                    <div className="progress-wrapper">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                      </div>
                      <span className="progress-text">{project.progress}%</span>
                    </div>
                  </div>
                  <button className="project-action"><Eye size={18} /></button>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="card">
              <div className="card-header">
                <h3>Recent Activity</h3>
                <button className="btn-link">View All</button>
              </div>
              <div className="activity-list">
                {[
                  { title: 'New expense recorded', desc: 'Cement purchase - $850', time: '2 hours ago' },
                  { title: 'Worker attendance', desc: '5 workers checked in', time: '4 hours ago' },
                  { title: 'Project milestone', desc: 'Foundation completed', time: '1 day ago' }
                ].map((item, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-icon" style={{ background: '#6366f120', color: '#6366f1' }}>
                      <DollarSign size={16} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{item.title}</div>
                      <div className="activity-description">{item.desc}</div>
                      <div className="activity-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions">
                <button className="quick-action"><Plus size={18} /><span>New Project</span></button>
                <button className="quick-action"><DollarSign size={18} /><span>Add Expense</span></button>
                <button className="quick-action"><Users size={18} /><span>Register Worker</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContractorDashboard;
