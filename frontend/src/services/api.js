import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      console.error('Permission denied:', error.response?.data?.message);
      window.dispatchEvent(new CustomEvent('permissionError', { 
        detail: error.response?.data?.message 
      }));
    }
    return Promise.reject(error);
  }
);

// Project Service
export const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  archive: (id) => api.patch(`/projects/${id}/archive`)
};

// User Service
export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
  activate: (id) => api.patch(`/users/${id}/activate`),
  verify: (id) => api.patch(`/users/${id}/verify`),
  resetPassword: (id, data) => api.post(`/users/${id}/reset-password`, data)
};

// Expense Service
export const expenseService = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  approve: (id) => api.patch(`/expenses/${id}/approve`),
  reject: (id, data) => api.patch(`/expenses/${id}/reject`, data)
};

// Worker Service
export const workerService = {
  getAll: (params) => api.get('/workers', { params }),
  create: (data) => api.post('/workers', data),
  update: (id, data) => api.put(`/workers/${id}`, data),
  delete: (id) => api.delete(`/workers/${id}`)
};

// Material Service
export const materialService = {
  getAll: (params) => api.get('/materials', { params }),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`)
};

// Attendance Service
export const attendanceService = {
  getAll: (params) => api.get('/attendance', { params }),
  create: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`)
};

// Report Service
export const reportService = {
  getExpenses: (params) => api.get('/reports/expenses', { params }),
  getWorkers: (params) => api.get('/reports/workers', { params }),
  getMaterials: (params) => api.get('/reports/materials', { params }),
  getBudget: (params) => api.get('/reports/budget', { params }),
  getProfitability: (params) => api.get('/reports/profitability', { params })
};

// Dashboard Service
export const dashboardService = {
  getContractor: () => api.get('/dashboard/contractor'),
  getSiteManager: () => api.get('/dashboard/site-manager'),
  getAccountant: () => api.get('/dashboard/accountant')
};

// Daily Report Service
export const dailyReportService = {
  getAll: (params) => api.get('/daily-reports', { params }),
  getById: (id) => api.get(`/daily-reports/${id}`),
  generate: (data) => api.post('/daily-reports/generate', data),
  sync: (data) => api.patch('/daily-reports/sync', data),
  getDashboard: (params) => api.get('/daily-reports/dashboard', { params })
};

// Upload Service
export const uploadService = {
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadMedia: (projectId, file, type, title) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('type', type);
    formData.append('title', title);
    return api.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Analytics Service
export const analyticsService = {
  getBudgetVsActual: (params) => api.get('/analytics/budget-vs-actual', { params }),
  getProjectProgress: (params) => api.get('/analytics/project-progress', { params }),
  getWorkerProductivity: (params) => api.get('/analytics/worker-productivity', { params }),
  getMaterialConsumption: (params) => api.get('/analytics/material-consumption', { params }),
  getExpenseBreakdown: (params) => api.get('/analytics/expense-breakdown', { params }),
  getProfitLoss: (params) => api.get('/analytics/profit-loss', { params }),
  getCashFlow: (params) => api.get('/analytics/cash-flow', { params })
};

// Notification Service
export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all')
};

// Request Service
export const requestService = {
  getAll: (params) => api.get('/requests', { params }),
  create: (data) => api.post('/requests', data),
  approve: (id) => api.patch(`/requests/${id}/approve`),
  reject: (id, data) => api.patch(`/requests/${id}/reject`, data)
};

export default api;
