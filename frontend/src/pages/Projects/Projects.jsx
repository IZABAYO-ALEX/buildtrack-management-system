// frontend/src/pages/Projects/Projects.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Edit, Trash2, Eye, 
  Archive, CheckCircle, Clock, AlertCircle,
  Calendar, MapPin, DollarSign, Users, 
  RefreshCw, Building2, FileText, Filter,
  Tag, Activity, BarChart3, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProjectForm from '../../components/common/ProjectForm';
import api, { projectService } from '../../services/api';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, usersRes] = await Promise.all([
        projectService.getAll(),
        api.get('/users')
      ]);
      setProjects(projectsRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this project?')) return;
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
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to archive project');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'warning',
      active: 'success',
      on_hold: 'danger',
      completed: 'info',
      cancelled: 'secondary'
    };
    return colors[status] || 'secondary';
  };

  const getStatusIcon = (status) => {
    const icons = {
      planning: <Clock size={14} />,
      active: <CheckCircle size={14} />,
      on_hold: <AlertCircle size={14} />,
      completed: <CheckCircle size={14} />,
      cancelled: <X size={14} />
    };
    return icons[status] || null;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'danger',
      critical: 'danger critical'
    };
    return colors[priority] || 'secondary';
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.projectCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout userRole="contractor">
      <div className="projects-container">
        <div className="page-header">
          <div>
            <h1>📋 Projects</h1>
            <p>Manage all your construction projects</p>
          </div>
          <div className="page-actions">
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              New Project
            </button>
            <button className="btn-outline" onClick={fetchData}>
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
              placeholder="Search projects by name, client, or code..."
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
              <option value="planning">📋 Planning</option>
              <option value="active">✅ Active</option>
              <option value="on_hold">⏸️ On Hold</option>
              <option value="completed">🎯 Completed</option>
              <option value="cancelled">❌ Cancelled</option>
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
            <Building2 size={64} />
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
                  <div className="project-badges">
                    <span className={`status-badge ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      {project.status?.replace('_', ' ')}
                    </span>
                    {project.priority && (
                      <span className={`priority-badge ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    )}
                    {project.isArchived && (
                      <span className="status-badge archived">📦 Archived</span>
                    )}
                  </div>
                  <div className="project-actions">
                    <button 
                      className="icon-btn" 
                      onClick={() => {
                        setSelectedProject(project);
                        setShowViewModal(true);
                      }}
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="icon-btn" 
                      onClick={() => {
                        setSelectedProject(project);
                        setShowEditModal(true);
                      }}
                      title="Edit Project"
                    >
                      <Edit size={18} />
                    </button>
                    {!project.isArchived && (
                      <button 
                        className="icon-btn" 
                        onClick={() => handleArchive(project.id)}
                        title="Archive Project"
                      >
                        <Archive size={18} />
                      </button>
                    )}
                    <button 
                      className="icon-btn danger" 
                      onClick={() => handleDelete(project.id)}
                      title="Delete Project"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="project-card-body">
                  {project.projectCode && (
                    <div className="project-code">{project.projectCode}</div>
                  )}
                  <h3 className="project-title">{project.name}</h3>
                  {project.clientName && (
                    <p className="project-client">👤 {project.clientName}</p>
                  )}
                  {project.location && (
                    <p className="project-location">
                      <MapPin size={14} />
                      {project.location}
                    </p>
                  )}
                  <p className="project-description">
                    {project.description || 'No description provided'}
                  </p>
                  {project.tags && project.tags.length > 0 && (
                    <div className="project-tags">
                      {project.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="tag-more">+{project.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="project-card-footer">
                  <div className="project-metrics">
                    <div className="metric" title="Budget">
                      <DollarSign size={14} />
                      <span>${project.budget?.toLocaleString() || 0}</span>
                    </div>
                    <div className="metric" title="Workers">
                      <Users size={14} />
                      <span>{project.workerCount || 0}</span>
                    </div>
                    <div className="metric" title="End Date">
                      <Calendar size={14} />
                      <span>{project.endDate || 'N/A'}</span>
                    </div>
                    <div className="metric" title="Progress">
                      <Activity size={14} />
                      <span>{project.progress || 0}%</span>
                    </div>
                  </div>
                  <div className="project-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${Math.min(project.budgetUtilization || 0, 100)}%` }}
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

        {/* Create Project Modal */}
        <ProjectForm
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            resetForm();
            fetchData();
          }}
          users={users}
        />

        {/* Edit Project Modal */}
        <ProjectForm
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
            resetForm();
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedProject(null);
            resetForm();
            fetchData();
          }}
          project={selectedProject}
          users={users}
        />

        {/* View Project Modal */}
        {showViewModal && selectedProject && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <motion.div 
              className="modal view-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Project Details</h2>
                <button className="modal-close" onClick={() => setShowViewModal(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="view-content">
                <div className="view-section">
                  <div className="view-row">
                    <div className="view-label">Project Code</div>
                    <div className="view-value">{selectedProject.projectCode || 'N/A'}</div>
                  </div>
                  <div className="view-row">
                    <div className="view-label">Name</div>
                    <div className="view-value">{selectedProject.name}</div>
                  </div>
                  <div className="view-row">
                    <div className="view-label">Status</div>
                    <div className="view-value">
                      <span className={`status-badge ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status}
                      </span>
                    </div>
                  </div>
                  <div className="view-row">
                    <div className="view-label">Client</div>
                    <div className="view-value">{selectedProject.clientName || 'N/A'}</div>
                  </div>
                  <div className="view-row">
                    <div className="view-label">Location</div>
                    <div className="view-value">{selectedProject.location || 'N/A'}</div>
                  </div>
                  <div className="view-row">
                    <div className="view-label">Budget</div>
                    <div className="view-value">${selectedProject.budget?.toLocaleString() || 0}</div>
                  </div>
                  <div className="view-row">
                    <div className="view-label">Description</div>
                    <div className="view-value">{selectedProject.description || 'No description'}</div>
                  </div>
                  <div className="view-row">
                    <div className="view-label">Start Date</div>
                    <div className="view-value">{selectedProject.startDate || 'N/A'}</div>
                  </div>
                  <div className="view-row">
                    <div className="view-label">End Date</div>
                    <div className="view-value">{selectedProject.endDate || 'N/A'}</div>
                  </div>
                </div>
                <div className="view-actions">
                  <button 
                    className="btn-primary" 
                    onClick={() => {
                      setShowViewModal(false);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit size={18} />
                    Edit Project
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;