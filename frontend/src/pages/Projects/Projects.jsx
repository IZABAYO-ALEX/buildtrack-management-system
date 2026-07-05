import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, 
  Archive, X, CheckCircle, Clock, AlertCircle,
  Calendar, MapPin, DollarSign, Users, Package,
  ChevronDown, ChevronUp, MoreVertical, Download,
  FileText, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { projectService } from '../../services/api';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    description: '',
    location: '',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'planning'
  });

  const statusOptions = ['planning', 'active', 'completed', 'suspended'];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAll();
      setProjects(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch projects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await projectService.create(formData);
      setProjects([response.data.data, ...projects]);
      toast.success('Project created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await projectService.update(selectedProject.id, formData);
      setProjects(projects.map(p => p.id === selectedProject.id ? response.data.data : p));
      toast.success('Project updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectService.delete(id);
      setProjects(projects.filter(p => p.id !== id));
      toast.success('Project deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleArchive = async (id) => {
    try {
      await projectService.archive(id);
      toast.success('Project archived successfully!');
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to archive project');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      clientName: '',
      description: '',
      location: '',
      budget: '',
      startDate: '',
      endDate: '',
      status: 'planning'
    });
    setSelectedProject(null);
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      clientName: project.clientName || '',
      description: project.description || '',
      location: project.location || '',
      budget: project.budget,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      status: project.status
    });
    setShowEditModal(true);
  };

  const openViewModal = (project) => {
    setSelectedProject(project);
    setShowViewModal(true);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      planning: 'warning',
      active: 'success',
      completed: 'info',
      suspended: 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getStatusIcon = (status) => {
    const icons = {
      planning: <Clock size={14} />,
      active: <CheckCircle size={14} />,
      completed: <CheckCircle size={14} />,
      suspended: <AlertCircle size={14} />
    };
    return icons[status] || null;
  };

  return (
    <DashboardLayout userRole="contractor">
      <div className="projects-container">
        <div className="page-header">
          <div>
            <h1>Projects</h1>
            <p>Manage all your construction projects</p>
          </div>
          <div className="page-actions">
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              New Project
            </button>
            <button className="btn-outline" onClick={fetchProjects}>
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        <div className="filters-bar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} />
            <h3>No projects found</h3>
            <p>Create your first project to get started</p>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              Create Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className="project-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <div className="project-card-header">
                  <div className="project-status">
                    <span className={`status-badge ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      {project.status}
                    </span>
                    {project.isArchived && (
                      <span className="status-badge archived">Archived</span>
                    )}
                  </div>
                  <div className="project-actions-dropdown">
                    <button className="icon-btn" onClick={() => openViewModal(project)}>
                      <Eye size={18} />
                    </button>
                    <button className="icon-btn" onClick={() => openEditModal(project)}>
                      <Edit size={18} />
                    </button>
                    <button className="icon-btn" onClick={() => handleArchive(project.id)}>
                      <Archive size={18} />
                    </button>
                    <button className="icon-btn danger" onClick={() => handleDelete(project.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="project-card-body">
                  <h3 className="project-title">{project.name}</h3>
                  {project.clientName && (
                    <p className="project-client">Client: {project.clientName}</p>
                  )}
                  {project.location && (
                    <p className="project-location">
                      <MapPin size={14} />
                      {project.location}
                    </p>
                  )}
                  <p className="project-description">{project.description}</p>
                </div>

                <div className="project-card-footer">
                  <div className="project-metrics">
                    <div className="metric">
                      <DollarSign size={14} />
                      <span>${project.budget?.toLocaleString() || 0}</span>
                    </div>
                    <div className="metric">
                      <Users size={14} />
                      <span>{project.workerCount || 0} workers</span>
                    </div>
                    <div className="metric">
                      <Calendar size={14} />
                      <span>{project.endDate || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="project-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${project.budgetUtilization || 0}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {project.budgetUtilization?.toFixed(0) || 0}% used
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="modal"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="modal-header">
                  <h2>Create New Project</h2>
                  <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleCreate} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Project Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter project name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Client Name</label>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        placeholder="Enter client name"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter project description"
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Enter location"
                      />
                    </div>
                    <div className="form-group">
                      <label>Budget *</label>
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        required
                        placeholder="Enter budget"
                      />
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Create Project
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {showEditModal && selectedProject && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="modal"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="modal-header">
                  <h2>Edit Project</h2>
                  <button className="modal-close" onClick={() => setShowEditModal(false)}>
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleUpdate} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Project Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Client Name</label>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Budget *</label>
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Update Project
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Modal */}
        <AnimatePresence>
          {showViewModal && selectedProject && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="modal view-modal"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="modal-header">
                  <h2>Project Details</h2>
                  <button className="modal-close" onClick={() => setShowViewModal(false)}>
                    <X size={24} />
                  </button>
                </div>
                <div className="view-content">
                  <div className="view-section">
                    <h3>{selectedProject.name}</h3>
                    <div className="view-meta">
                      <span className={`status-badge ${getStatusColor(selectedProject.status)}`}>
                        {getStatusIcon(selectedProject.status)}
                        {selectedProject.status}
                      </span>
                      {selectedProject.isArchived && (
                        <span className="status-badge archived">Archived</span>
                      )}
                    </div>
                  </div>
                  <div className="view-grid">
                    <div className="view-item">
                      <label>Client</label>
                      <p>{selectedProject.clientName || 'N/A'}</p>
                    </div>
                    <div className="view-item">
                      <label>Location</label>
                      <p>{selectedProject.location || 'N/A'}</p>
                    </div>
                    <div className="view-item">
                      <label>Budget</label>
                      <p>${selectedProject.budget?.toLocaleString() || 0}</p>
                    </div>
                    <div className="view-item">
                      <label>Total Expenses</label>
                      <p>${selectedProject.totalExpenses?.toLocaleString() || 0}</p>
                    </div>
                    <div className="view-item">
                      <label>Remaining Budget</label>
                      <p>${selectedProject.remainingBudget?.toLocaleString() || 0}</p>
                    </div>
                    <div className="view-item">
                      <label>Budget Utilization</label>
                      <p>{selectedProject.budgetUtilization?.toFixed(0) || 0}%</p>
                    </div>
                    <div className="view-item">
                      <label>Start Date</label>
                      <p>{selectedProject.startDate || 'N/A'}</p>
                    </div>
                    <div className="view-item">
                      <label>End Date</label>
                      <p>{selectedProject.endDate || 'N/A'}</p>
                    </div>
                    <div className="view-item full-width">
                      <label>Description</label>
                      <p>{selectedProject.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="view-actions">
                    <button className="btn-primary" onClick={() => {
                      setShowViewModal(false);
                      openEditModal(selectedProject);
                    }}>
                      <Edit size={18} />
                      Edit Project
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
