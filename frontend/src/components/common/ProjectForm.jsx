import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Trash2, Upload, Calendar, MapPin, 
  DollarSign, Users, Building2, Tag, AlertCircle,
  CheckCircle, Clock, ChevronDown, ChevronUp,
  Save, Send, FileText, Briefcase, Home,
  Factory, Building, HardHat, Calculator
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './ProjectForm.css';

const ProjectForm = ({ isOpen, onClose, onSuccess, project = null, users = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    description: '',
    location: '',
    budget: '',
    currency: 'UGX',
    startDate: '',
    endDate: '',
    status: 'planning',
    priority: 'medium',
    category: '',
    projectType: 'residential',
    siteArea: '',
    numberOfUnits: '',
    numberOfFloors: '',
    completionDate: '',
    siteManagerId: '',
    accountantId: '',
    tags: [],
    riskLevel: 'medium',
    notes: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const projectTypes = [
    { value: 'residential', label: '🏠 Residential', icon: <Home size={16} /> },
    { value: 'commercial', label: '🏢 Commercial', icon: <Building size={16} /> },
    { value: 'industrial', label: '🏭 Industrial', icon: <Factory size={16} /> },
    { value: 'infrastructure', label: '🌉 Infrastructure', icon: <Building2 size={16} /> },
    { value: 'renovation', label: '🔨 Renovation', icon: <HardHat size={16} /> }
  ];

  const statuses = [
    { value: 'planning', label: '📋 Planning' },
    { value: 'active', label: '✅ Active' },
    { value: 'on_hold', label: '⏸️ On Hold' },
    { value: 'completed', label: '🎯 Completed' },
    { value: 'cancelled', label: '❌ Cancelled' }
  ];

  const priorities = [
    { value: 'low', label: '🟢 Low' },
    { value: 'medium', label: '🟡 Medium' },
    { value: 'high', label: '🟠 High' },
    { value: 'critical', label: '🔴 Critical' }
  ];

  const riskLevels = [
    { value: 'low', label: '🟢 Low Risk' },
    { value: 'medium', label: '🟡 Medium Risk' },
    { value: 'high', label: '🔴 High Risk' }
  ];

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        clientName: project.clientName || '',
        clientEmail: project.clientEmail || '',
        clientPhone: project.clientPhone || '',
        description: project.description || '',
        location: project.location || '',
        budget: project.budget || '',
        currency: project.currency || 'UGX',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        category: project.category || '',
        projectType: project.projectType || 'residential',
        siteArea: project.siteArea || '',
        numberOfUnits: project.numberOfUnits || '',
        numberOfFloors: project.numberOfFloors || '',
        completionDate: project.completionDate || '',
        siteManagerId: project.siteManagerId || '',
        accountantId: project.accountantId || '',
        tags: project.tags || [],
        riskLevel: project.riskLevel || 'medium',
        notes: project.notes || ''
      });
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        budget: parseFloat(formData.budget),
        siteArea: formData.siteArea ? parseFloat(formData.siteArea) : null,
        numberOfUnits: formData.numberOfUnits ? parseInt(formData.numberOfUnits) : null,
        numberOfFloors: formData.numberOfFloors ? parseInt(formData.numberOfFloors) : null
      };

      let response;
      if (project) {
        response = await api.put(`/projects/${project.id}`, data);
        toast.success('Project updated successfully!');
      } else {
        response = await api.post('/projects', data);
        toast.success(response.data.message || 'Project created successfully!');
      }

      if (onSuccess) onSuccess(response.data.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const tabs = [
    { id: 'basic', label: '📋 Basic Info' },
    { id: 'details', label: '📊 Details' },
    { id: 'team', label: '👥 Team' },
    { id: 'advanced', label: '⚙️ Advanced' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="project-form-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="project-form-modal"
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="project-form-header">
              <div>
                <h2>{project ? '✏️ Edit Project' : '🚀 Create New Project'}</h2>
                <p>{project ? 'Update project details' : 'Fill in the project details below'}</p>
              </div>
              <button className="close-btn" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            <div className="project-form-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="project-form-body">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="tab-content">
                  <div className="form-row">
                    <div className="form-group full">
                      <label>Project Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter project name"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Client Name</label>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        placeholder="Enter client name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Client Email</label>
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        placeholder="client@email.com"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Client Phone</label>
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        placeholder="+256 700 000 000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <div className="input-with-icon">
                        <MapPin size={18} />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Enter project location"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Budget *</label>
                      <div className="input-with-icon">
                        <DollarSign size={18} />
                        <input
                          type="number"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          placeholder="Enter budget"
                          required
                          min="0"
                          step="1000"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      >
                        <option value="UGX">🇺🇬 UGX</option>
                        <option value="USD">🇺🇸 USD</option>
                        <option value="EUR">🇪�� EUR</option>
                        <option value="KES">🇰🇪 KES</option>
                        <option value="TZS">🇹🇿 TZS</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group full">
                      <label>Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the project"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="tab-content">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        {statuses.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        {priorities.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Project Type</label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      >
                        {projectTypes.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g. Construction, Renovation"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date</label>
                      <div className="input-with-icon">
                        <Calendar size={18} />
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <div className="input-with-icon">
                        <Calendar size={18} />
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Site Area (sq meters)</label>
                      <input
                        type="number"
                        value={formData.siteArea}
                        onChange={(e) => setFormData({ ...formData, siteArea: e.target.value })}
                        placeholder="Enter site area"
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Number of Units</label>
                      <input
                        type="number"
                        value={formData.numberOfUnits}
                        onChange={(e) => setFormData({ ...formData, numberOfUnits: e.target.value })}
                        placeholder="Enter number of units"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Number of Floors</label>
                      <input
                        type="number"
                        value={formData.numberOfFloors}
                        onChange={(e) => setFormData({ ...formData, numberOfFloors: e.target.value })}
                        placeholder="Enter number of floors"
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Expected Completion Date</label>
                      <div className="input-with-icon">
                        <Calendar size={18} />
                        <input
                          type="date"
                          value={formData.completionDate}
                          onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Tab */}
              {activeTab === 'team' && (
                <div className="tab-content">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Site Manager</label>
                      <select
                        value={formData.siteManagerId}
                        onChange={(e) => setFormData({ ...formData, siteManagerId: e.target.value })}
                      >
                        <option value="">Select Site Manager</option>
                        {users.filter(u => u.role === 'site_manager').map(u => (
                          <option key={u.id} value={u.id}>
                            {u.fullName} ({u.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Accountant</label>
                      <select
                        value={formData.accountantId}
                        onChange={(e) => setFormData({ ...formData, accountantId: e.target.value })}
                      >
                        <option value="">Select Accountant</option>
                        {users.filter(u => u.role === 'accountant').map(u => (
                          <option key={u.id} value={u.id}>
                            {u.fullName} ({u.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Tab */}
              {activeTab === 'advanced' && (
                <div className="tab-content">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Risk Level</label>
                      <select
                        value={formData.riskLevel}
                        onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                      >
                        {riskLevels.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Tags</label>
                      <div className="tags-input">
                        <div className="tags-list">
                          {formData.tags.map(tag => (
                            <span key={tag} className="tag">
                              {tag}
                              <button type="button" onClick={() => removeTag(tag)}>
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="tag-input-wrapper">
                          <Tag size={18} />
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add tag..."
                          />
                          <button type="button" onClick={addTag}>
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group full">
                      <label>Additional Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Any additional notes about the project"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="project-form-footer">
                <button type="button" className="btn-cancel" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <span className="spinner"></span>
                  ) : (
                    <>
                      {project ? 'Update Project' : 'Create Project'}
                      <Send size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectForm;
