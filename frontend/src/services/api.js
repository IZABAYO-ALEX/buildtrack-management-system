import axios from 'axios';

// Use relative path for Vercel (API is served from same domain)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000,
  withCredentials: true
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
  getAll: () => api.get('/expenses'),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  approve: (id) => api.patch(`/expenses/${id}/approve`)
};

// Worker Service
export const workerService = {
  getAll: () => api.get('/workers'),
  create: (data) => api.post('/workers', data),
  update: (id, data) => api.put(`/workers/${id}`, data),
  delete: (id) => api.delete(`/workers/${id}`)
};

// Material Service
export const materialService = {
  getAll: () => api.get('/materials'),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`)
};

// Attendance Service
export const attendanceService = {
  getAll: () => api.get('/attendance'),
  create: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`)
};

// Daily Report Service
export const dailyReportService = {
  getAll: () => api.get('/daily-reports'),
  generate: (data) => api.post('/daily-reports/generate', data),
  getDashboard: (params) => api.get('/daily-reports/dashboard', { params })
};

// Dashboard Service
export const dashboardService = {
  getContractor: () => api.get('/dashboard/contractor'),
  getSiteManager: () => api.get('/dashboard/site-manager'),
  getAccountant: () => api.get('/dashboard/accountant')
};

export default api;
