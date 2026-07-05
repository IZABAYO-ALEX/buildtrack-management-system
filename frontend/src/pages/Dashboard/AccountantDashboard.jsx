import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, Clock, ArrowUpRight, ArrowDownRight, Eye, Download } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import './Dashboard.css';

const AccountantDashboard = () => {
  const stats = [
    { title: 'Total Revenue', value: '$125,000', change: '+15%', trend: 'up', icon: DollarSign, color: 'success', subtitle: 'this quarter' },
    { title: 'Total Expenses', value: '$45,280', change: '-8%', trend: 'down', icon: DollarSign, color: 'danger', subtitle: 'this quarter' },
    { title: 'Net Profit', value: '$79,720', change: '+12%', trend: 'up', icon: TrendingUp, color: 'primary', subtitle: 'this quarter' },
    { title: 'Pending Approvals', value: '7', change: '-3', trend: 'down', icon: Clock, color: 'warning', subtitle: 'need review' }
  ];

  const recentExpenses = [
    { category: 'Materials', amount: '$850', date: '2024-01-15', status: 'approved' },
    { category: 'Labor', amount: '$1,200', date: '2024-01-14', status: 'pending' },
    { category: 'Equipment', amount: '$450', date: '2024-01-13', status: 'approved' }
  ];

  return (
    <DashboardLayout userRole="accountant">
      <div className="dashboard-container">
        <motion.div 
          className="hero-banner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-overlay">
            <div className="hero-content">
              <h1>Welcome Back, Peter!</h1>
              <p>Review expenses, generate financial reports, and ensure budget accuracy.</p>
              <div className="hero-buttons">
                <button className="btn-primary">Generate Report</button>
                <button className="btn-outline">Review Expenses</button>
              </div>
            </div>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=400&fit=crop&crop=center"
            alt="Construction Site Aerial"
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

        <div className="dashboard-grid">
          <div className="dashboard-main">
            <div className="card">
              <div className="card-header">
                <h3>Recent Expenses</h3>
                <button className="btn-link">View All</button>
              </div>
              {recentExpenses.map((expense, index) => (
                <motion.div 
                  key={index} 
                  className="expense-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="expense-info">
                    <span className="expense-category">{expense.category}</span>
                    <span className="expense-date">{expense.date}</span>
                  </div>
                  <div className="expense-actions">
                    <span className="expense-amount">{expense.amount}</span>
                    <span className={`status-badge ${expense.status}`}>{expense.status}</span>
                    <button className="expense-action"><Eye size={16} /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="card">
              <div className="card-header">
                <h3>Financial Summary</h3>
              </div>
              <div className="financial-summary">
                <div><span>Revenue</span><span>$125,000</span></div>
                <div><span>Expenses</span><span>$45,280</span></div>
                <div><span>Profit</span><span>$79,720</span></div>
                <div><span>Margin</span><span>63.8%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountantDashboard;
