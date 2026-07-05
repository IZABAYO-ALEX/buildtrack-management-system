import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit, Trash2, Eye, X, 
  Users, DollarSign, Phone, MapPin, Calendar,
  CheckCircle, Clock, AlertCircle, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { workerService, projectService } from '../../services/api';
import './Workers.css';

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    role: '',
    rate: '',
    projectId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workersRes, projectsRes] = await Promise.all([
        workerService.getAll(),
        projectService.getAll()
      ]);
      setWorkers(workersRes.data.data || []);
      setProjects(projectsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await workerService.create(formData);
      setWorkers([response.data.data, ...workers]);
      toast.success('Worker created successfully!');
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create worker');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await workerService.update(selectedWorker.id, formData);
      setWorkers(workers.map(w => w.id === selectedWorker.id ? response.data.data : w));
      toast.success('Worker updated successfully!');
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update worker');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this worker?')) return;
    try {
      await workerService.delete(id);
      setWorkers(workers.filter(w => w.id !== id));
      toast.success('Worker deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete worker');
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      role: '',
      rate: '',
      projectId: ''
    });
    setSelectedWorker(null);
  };

  const openEditModal = (worker) => {
    setSelectedWorker(worker);
    setFormData({
      fullName: worker.fullName,
      phone: worker.phone || '',
      role: worker.role,
      rate: worker.rate,
      projectId: worker.projectId
    });
    setShowEditModal(true);
  };

  const filteredWorkers = workers.filter(worker =>
    worker.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  return (
    <DashboardLayout userRole="contractor">
      <div className="workers-container">
        <div className="page-header">
          <div>
            <h1>Workers</h1>
            <p>Manage all your construction workers</p>
          </div>
          <div className="page-actions">
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              Register Worker
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
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading workers...</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="empty-state">
            <Users size={64} />
            <h3>No workers found</h3>
            <p>Register your first worker to get started</p>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              Register Worker
            </button>
          </div>
        ) : (
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
                  <div className="worker-avatar">
                    {worker.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="worker-actions">
                    <button className="icon-btn" onClick={() => openEditModal(worker)}>
                      <Edit size={18} />
                    </button>
                    <button className="icon-btn danger" onClick={() => handleDelete(worker.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="worker-card-body">
                  <h3 className="worker-name">{worker.fullName}</h3>
                  <p className="worker-role">{worker.role}</p>
                  <div className="worker-details">
                    <div className="worker-detail">
                      <Phone size={14} />
                      <span>{worker.phone || 'N/A'}</span>
                    </div>
                    <div className="worker-detail">
                      <DollarSign size={14} />
                      <span>${worker.rate}/day</span>
                    </div>
                    <div className="worker-detail">
                      <MapPin size={14} />
                      <span>{getProjectName(worker.projectId)}</span>
                    </div>
                  </div>
                </div>
                <div className="worker-card-footer">
                  <span className={`status-badge ${worker.isActive ? 'success' : 'danger'}`}>
                    {worker.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
                <div className="modal-header">
                  <h2>Register Worker</h2>
                  <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleCreate} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group">
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
                      <label>Phone</label>
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
                    <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Register Worker
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {showEditModal && selectedWorker && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
                <div className="modal-header">
                  <h2>Edit Worker</h2>
                  <button className="modal-close" onClick={() => setShowEditModal(false)}>
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleUpdate} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
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
                    <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Update Worker
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Workers;
