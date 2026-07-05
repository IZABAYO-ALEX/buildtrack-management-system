import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit, Trash2, Eye, 
  Archive, X, CheckCircle, Clock, AlertCircle,
  Calendar, MapPin, DollarSign, Users, Package,
  RefreshCw, Building2, FileText, Filter
} from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FormInput from '../../components/forms/FormInput';
import FormModal from '../../components/forms/FormModal';
import { projectService } from '../../services/api';
import { projectSchema } from '../../schemas';
import '../../components/forms/Forms.css';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      clientName: '',
      description: '',
      location: '',
      budget: '',
      startDate: '',
      endDate: '',
      status: 'planning'
    }
  });

  const statusOptions = [
    { value: 'planning', label: 'Planning' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'suspended', label: 'Suspended' }
  ];

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
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await projectService.create(data);
      setProjects([response.data.data, ...projects]);
      toast.success('Project created successfully!');
      setShowCreateModal(false);
      methods.reset();
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await projectService.update(selectedProject.id, data);
      setProjects(projects.map(p => p.id === selectedProject.id ? response.data.data : p));
      toast.success('Project updated successfully!');
      setShowEditModal(false);
      methods.reset();
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    } finally {
      setIsSubmitting(false);
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

  const openEditModal = (project) => {
    setSelectedProject(project);
    methods.reset({
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
            <button className="btn-primary" onClick={() => {
              methods.reset();
              setShowCreateModal(true);
            }}>
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
                <option key={status.value} value={status.value}>
                  {status.label}
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
            <button className="btn-primary" onClick={() => {
              methods.reset();
              setShowCreateModal(true);
            }}>
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
                    <p className="project-client"><Building2 size={14} /> {project.clientName}</p>
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
        <FormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Project"
          subtitle="Fill in the project details below"
          onSubmit={methods.handleSubmit(handleCreate)}
          isLoading={isSubmitting}
          submitText="Create Project"
        >
          <FormProvider {...methods}>
            <div className="form-grid">
              <div className="full-width">
                <FormInput
                  name="name"
                  label="Project Name"
                  placeholder="Enter project name"
                  required
                  icon={Building2}
                />
              </div>
              <div>
                <FormInput
                  name="clientName"
                  label="Client Name"
                  placeholder="Enter client name"
                  icon={Users}
                />
              </div>
              <div>
                <FormInput
                  name="location"
                  label="Location"
                  placeholder="Enter location"
                  icon={MapPin}
                />
              </div>
              <div className="full-width">
                <FormInput
                  name="description"
                  label="Description"
                  placeholder="Enter project description"
                  type="textarea"
                  rows={3}
                />
              </div>
              <div>
                <FormInput
                  name="budget"
                  label="Budget"
                  placeholder="Enter budget"
                  type="number"
                  required
                  icon={DollarSign}
                />
              </div>
              <div>
                <FormInput
                  name="status"
                  label="Status"
                  type="select"
                  options={statusOptions}
                />
              </div>
              <div>
                <FormInput
                  name="startDate"
                  label="Start Date"
                  type="date"
                  icon={Calendar}
                />
              </div>
              <div>
                <FormInput
                  name="endDate"
                  label="End Date"
                  type="date"
                  icon={Calendar}
                />
              </div>
            </div>
          </FormProvider>
        </FormModal>

        {/* Edit Modal */}
        <FormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Project"
          subtitle="Update project details"
          onSubmit={methods.handleSubmit(handleUpdate)}
          isLoading={isSubmitting}
          submitText="Update Project"
        >
          <FormProvider {...methods}>
            <div className="form-grid">
              <div className="full-width">
                <FormInput
                  name="name"
                  label="Project Name"
                  placeholder="Enter project name"
                  required
                  icon={Building2}
                />
              </div>
              <div>
                <FormInput
                  name="clientName"
                  label="Client Name"
                  placeholder="Enter client name"
                  icon={Users}
                />
              </div>
              <div>
                <FormInput
                  name="location"
                  label="Location"
                  placeholder="Enter location"
                  icon={MapPin}
                />
              </div>
              <div className="full-width">
                <FormInput
                  name="description"
                  label="Description"
                  placeholder="Enter project description"
                  type="textarea"
                  rows={3}
                />
              </div>
              <div>
                <FormInput
                  name="budget"
                  label="Budget"
                  placeholder="Enter budget"
                  type="number"
                  required
                  icon={DollarSign}
                />
              </div>
              <div>
                <FormInput
                  name="status"
                  label="Status"
                  type="select"
                  options={statusOptions}
                />
              </div>
              <div>
                <FormInput
                  name="startDate"
                  label="Start Date"
                  type="date"
                  icon={Calendar}
                />
              </div>
              <div>
                <FormInput
                  name="endDate"
                  label="End Date"
                  type="date"
                  icon={Calendar}
                />
              </div>
            </div>
          </FormProvider>
        </FormModal>

        {/* View Modal */}
        <FormModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Project Details"
          submitText="Close"
          onCancel={() => setShowViewModal(false)}
        >
          {selectedProject && (
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
            </div>
          )}
        </FormModal>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
