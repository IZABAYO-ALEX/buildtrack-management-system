import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  ResponsiveContainer, ComposedChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Package,
  Calendar, Download, RefreshCw, FileText, PieChart as PieChartIcon,
  BarChart3, LineChart as LineChartIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#14b8a6', '#f472b6'];

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [budgetData, setBudgetData] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [workerData, setWorkerData] = useState([]);
  const [materialData, setMaterialData] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [cashFlowData, setCashFlowData] = useState({});

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      const [
        budgetRes,
        progressRes,
        expenseRes,
        workerRes,
        materialRes,
        profitRes,
        cashFlowRes
      ] = await Promise.all([
        api.get('/analytics/budget-vs-actual'),
        api.get('/analytics/project-progress'),
        api.get('/analytics/expense-breakdown'),
        api.get('/analytics/worker-productivity'),
        api.get('/analytics/material-consumption'),
        api.get('/analytics/profit-loss'),
        api.get('/analytics/cash-flow')
      ]);

      setBudgetData(budgetRes.data.data.projects || []);
      setProgressData(progressRes.data.data || []);
      setExpenseData(expenseRes.data.data.categories || []);
      setWorkerData(workerRes.data.data || []);
      setMaterialData(materialRes.data.data.materials || []);
      setProfitData(profitRes.data.data || []);
      setCashFlowData(cashFlowRes.data.data || {});
    } catch (error) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>📊 Analytics Dashboard</h2>
        <div className="header-actions">
          <button className="btn-outline" onClick={fetchAllAnalytics}>
            <RefreshCw size={18} />
            Refresh
          </button>
          <button className="btn-outline">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      <div className="analytics-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} />
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          <DollarSign size={16} />
          Budget
        </button>
        <button 
          className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <PieChartIcon size={16} />
          Expenses
        </button>
        <button 
          className={`tab-btn ${activeTab === 'workers' ? 'active' : ''}`}
          onClick={() => setActiveTab('workers')}
        >
          <Users size={16} />
          Workers
        </button>
        <button 
          className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          <Package size={16} />
          Materials
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profit' ? 'active' : ''}`}
          onClick={() => setActiveTab('profit')}
        >
          <TrendingUp size={16} />
          Profit/Loss
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="analytics-grid">
          <div className="chart-card full-width">
            <h3>Budget vs Actual</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#6366f1" name="Budget" />
                <Bar dataKey="actual" fill="#10b981" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Project Progress</h3>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budgetProgress" fill="#6366f1" name="Budget Progress" />
                <Line type="monotone" dataKey="timelineProgress" stroke="#f59e0b" name="Timeline Progress" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="analytics-grid">
          <div className="chart-card full-width">
            <h3>Budget Utilization by Project</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#6366f1" name="Budget" />
                <Bar dataKey="actual" fill="#10b981" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="analytics-grid">
          <div className="chart-card full-width">
            <h3>Expense Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  outerRadius={100}
                  dataKey="total"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'workers' && (
        <div className="analytics-grid">
          <div className="chart-card full-width">
            <h3>Worker Productivity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="productivity" fill="#6366f1" name="Productivity %" />
                <Bar dataKey="efficiency" fill="#10b981" name="Efficiency %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="analytics-grid">
          <div className="chart-card full-width">
            <h3>Material Consumption</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={materialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#6366f1" name="Total" />
                <Bar dataKey="consumed" fill="#f59e0b" name="Consumed" />
                <Bar dataKey="remaining" fill="#10b981" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'profit' && (
        <div className="analytics-grid">
          <div className="chart-card full-width">
            <h3>Profit/Loss Summary</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="project" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#6366f1" name="Revenue" />
                <Bar dataKey="totalCost" fill="#ef4444" name="Total Cost" />
                <Bar dataKey="profit" fill="#10b981" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
