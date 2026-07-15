import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Edit, Trash2, Eye, 
  X, Users, Phone, DollarSign, 
  RefreshCw, Clock, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api, { workerService, projectService } from '../../services/api';
import './Workers.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Workers = () => {
  // State Management
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    role: '',
    rate: '',
    projectId: '',
    joinedDate: ''
  });

  // Helper Functions
  const getInitials = (name) => {
    if (!name) return 'W';
    return name.charAt(0).toUpperCase();
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      role: '',
      rate: '',
      projectId: '',
      joinedDate: ''
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setSelectedWorker(null);
  };

  // Data Fetching
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [workersRes, projectsRes] = await Promise.all([
        workerService.getAll(),
        projectService.getAll()
      ]);
      setWorkers(workersRes?.data?.data || []);
      setProjects(projectsRes?.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Photo Handling
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // CRUD Operations
  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formDataObj = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) formDataObj.append(key, formData[key]);
    });
    if (photoFile) formDataObj.append('photo', photoFile);

    try {
      const response = await api.post('/workers', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setWorkers([response?.data?.data, ...workers]);
      toast.success('Worker registered successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to register worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataObj = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) formDataObj.append(key, formData[key]);
    });
    if (photoFile) formDataObj.append('photo', photoFile);

    try {
      const response = await api.put(`/workers/${selectedWorker.id}`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setWorkers(workers.map(w => w.id === selectedWorker.id ? response?.data?.data : w));
      toast.success('Worker updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this worker?')) return;
    try {
      await workerService.delete(id);
      setWorkers(workers.filter(w => w.id !== id));
      toast.success('Worker deleted successfully!');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete worker');
    }
  };

  // Modal Handlers
  const openEditModal = (worker) => {
    setSelectedWorker(worker);
    setFormData({
      fullName: worker.fullName || '',
      phone: worker.phone || '',
      role: worker.role || '',
      rate: worker.rate || '',
      projectId: worker.projectId || '',
      joinedDate: worker.joinedDate || ''
    });
    setPhotoPreview(worker?.photoUrl ? `${API_URL}/uploads/${worker.photoUrl}` : null);
    setShowEditModal(true);
  };

  const openViewModal = (worker) => {
    setSelectedWorker(worker);
    setShowViewModal(true);
  };

  // Filter Workers
  const filteredWorkers = workers.filter(worker => {
    const name = worker?.fullName?.toLowerCase() || '';
    const role = worker?.role?.toLowerCase() || '';
    const term = searchTerm?.toLowerCase() || '';
    return name.includes(term) || role.includes(term);
  });

  // Avatar Component
  const WorkerAvatar = ({ worker, size = 'medium' }) => {
    const avatarClass = size === 'large' ? 'avatar-placeholder' : 'worker-avatar-placeholder';
    const imgClass = size === 'large' ? 'view-avatar' : 'worker-avatar';
    
    return (
      <div className={imgClass}>
        {worker?.photoUrl ? (
          <img 
            src={`${API_URL}/uploads/${worker.photoUrl}`} 
            alt={worker?.fullName || 'Worker'}
            onError={(e) => {
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent) {
                const placeholder = document.createElement('div');
                placeholder.className = avatarClass;
                placeholder.textContent = getInitials(worker?.fullName);
                parent.appendChild(placeholder);
              }
            }}
          />
        ) : (
          <div className={avatarClass}>
            {getInitials(worker?.fullName)}
          </div>
        )}
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <DashboardLayout userRole="site_manager">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading workers...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="site_manager">
      <div className="workers-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Workers</h1>
            <p>Manage all your construction workers ({workers.length} total)</p>
          </div>
          <div className="page-actions">
            <button 
              className="btn-primary" 
              onClick={() => setShowCreateModal(true)}
              aria-label="Register new worker"
            >
              <Plus size={18} />
              Register Worker
            </button>
            <button 
              className="btn-outline" 
              onClick={fetchData}
              aria-label="Refresh workers list"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="filters-bar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search workers"
            />
          </div>
        </div>

        {/* Empty State */}
        {filteredWorkers.length === 0 ? (
          <div className="empty-state">
            <Users size={64} />
            <h3>No workers found</h3>
            <p>Register your first worker to get started</p>
            <button 
              className="btn-primary" 
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={18} />
              Register Worker
            </button>
          </div>
        ) : (
          /* Workers Grid */
          <div className="workers-grid">
            {filteredWorkers.map((worker, index) => (
              <motion.div
                key={worker.id}
                className="worker-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <div className="worker-card-header">
                  <WorkerAvatar worker={worker} size="medium" />
                  <div className="worker-actions">
                    <button 
                      className="icon-btn" 
                      onClick={() => openViewModal(worker)}
                      aria-label={`View ${worker.fullName}`}
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="icon-btn" 
                      onClick={() => openEditModal(worker)}
                      aria-label={`Edit ${worker.fullName}`}
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="icon-btn danger" 
                      onClick={() => handleDelete(worker.id)}
                      aria-label={`Delete ${worker.fullName}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div 
                  className="worker-card-body" 
                  onClick={() => openViewModal(worker)} 
                  style={{ cursor: 'pointer' }}
                >
                  <h3 className="worker-name">{worker.fullName || 'Unknown'}</h3>
                  <p className="worker-role">{worker.role || 'No role'}</p>
                  <div className="worker-details">
                    <div className="worker-detail">
                      <Phone size={14} />
                      <span>{worker.phone || 'N/A'}</span>
                    </div>
                    <div className="worker-detail">
                      <DollarSign size={14} />
                      <span>${worker.rate || 0}/day</span>
                    </div>
                    <div className="worker-detail">
                      <Users size={14} />
                      <span>{getProjectName(worker.projectId)}</span>
                    </div>
                    <div className="worker-detail">
                      <Clock size={14} />
                      <span>{worker.totalHours || 0}h worked</span>
                    </div>
                  </div>
                </div>
                <div className="worker-card-footer">
                  <span className={`status-badge ${worker.isActive ? 'success' : 'danger'}`}>
                    {worker.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="worker-payments">
                    ${worker.totalPaid || 0} paid
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Register Worker</h2>
                <button 
                  className="modal-close" 
                  onClick={() => setShowCreateModal(false)}
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="modal-form">
                <div className="form-grid">
                  {/* Photo Upload */}
                  <div className="form-group full-width">
                    <label>Photo</label>
                    <div className="photo-upload">
                      {photoPreview ? (
                        <div className="photo-preview">
                          <img src={photoPreview} alt="Preview" />
                          <button 
                            type="button" 
                            onClick={() => { 
                              setPhotoFile(null); 
                              setPhotoPreview(null); 
                            }}
                            aria-label="Remove photo"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="upload-area">
                          <Upload size={24} />
                          <span>Click to upload photo</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handlePhotoChange} 
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="form-group full-width">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Role *</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                      placeholder="e.g. Foreman, Laborer"
                    />
                  </div>

                  <div className="form-group">
                    <label>Daily Rate *</label>
                    <input
                      type="number"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      required
                      placeholder="Enter daily rate"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>Joined Date</label>
                    <input
                      type="date"
                      value={formData.joinedDate}
                      onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Project *</label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      required
                    >
                      <option value="">Select a project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Registering...' : 'Register Worker'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedWorker && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Worker</h2>
                <button 
                  className="modal-close" 
                  onClick={() => setShowEditModal(false)}
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="modal-form">
                <div className="form-grid">
                  {/* Photo Upload */}
                  <div className="form-group full-width">
                    <label>Photo</label>
                    <div className="photo-upload">
                      {photoPreview ? (
                        <div className="photo-preview">
                          <img 
                            src={photoPreview.startsWith('data:') ? photoPreview : `${API_URL}${photoPreview}`} 
                            alt="Preview" 
                          />
                          <button 
                            type="button" 
                            onClick={() => { 
                              setPhotoFile(null); 
                              setPhotoPreview(null); 
                            }}
                            aria-label="Remove photo"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="upload-area">
                          <Upload size={24} />
                          <span>Click to upload photo</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handlePhotoChange} 
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="form-group full-width">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Role *</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Daily Rate *</label>
                    <input
                      type="number"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>Joined Date</label>
                    <input
                      type="date"
                      value={formData.joinedDate}
                      onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Project *</label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      required
                    >
                      <option value="">Select a project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update Worker'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedWorker && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal view-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Worker Details</h2>
                <button 
                  className="modal-close" 
                  onClick={() => setShowViewModal(false)}
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="view-content">
                <div className="view-section">
                  <WorkerAvatar worker={selectedWorker} size="large" />
                  <h3>{selectedWorker.fullName || 'Unknown'}</h3>
                  <div className="view-meta">
                    <span className={`status-badge ${selectedWorker.isActive ? 'success' : 'danger'}`}>
                      {selectedWorker.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="view-grid">
                  <div className="view-item">
                    <label>Role</label>
                    <p>{selectedWorker.role || 'N/A'}</p>
                  </div>
                  <div className="view-item">
                    <label>Phone</label>
                    <p>{selectedWorker.phone || 'N/A'}</p>
                  </div>
                  <div className="view-item">
                    <label>Daily Rate</label>
                    <p>${selectedWorker.rate || 0}</p>
                  </div>
                  <div className="view-item">
                    <label>Project</label>
                    <p>{getProjectName(selectedWorker.projectId)}</p>
                  </div>
                  <div className="view-item">
                    <label>Total Hours Worked</label>
                    <p>{selectedWorker.totalHours || 0}h</p>
                  </div>
                  <div className="view-item">
                    <label>Total Paid</label>
                    <p>${selectedWorker.totalPaid || 0}</p>
                  </div>
                  <div className="view-item">
                    <label>Joined Date</label>
                    <p>{selectedWorker.joinedDate || 'N/A'}</p>
                  </div>
                </div>
                <div className="view-actions">
                  <button 
                    className="btn-primary" 
                    onClick={() => {
                      setShowViewModal(false);
                      openEditModal(selectedWorker);
                    }}
                  >
                    <Edit size={18} />
                    Edit Worker
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Workers;