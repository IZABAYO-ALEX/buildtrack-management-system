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
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const totalSteps = 4;

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

  const steps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: "Project Details" },
    { number: 3, title: "Project Team" },
    { number: 4, title: "Advanced" }
  ];

  // Validation rules per step
  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Project name is required';
        isValid = false;
      }
      if (!formData.clientName.trim()) {
        newErrors.clientName = 'Client name is required';
        isValid = false;
      }
      if (!formData.clientEmail.trim()) {
        newErrors.clientEmail = 'Client email is required';
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
        newErrors.clientEmail = 'Please enter a valid email address';
        isValid = false;
      }
      if (!formData.clientPhone.trim()) {
        newErrors.clientPhone = 'Client phone is required';
        isValid = false;
      }
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
        isValid = false;
      }
      if (!formData.budget) {
        newErrors.budget = 'Budget is required';
        isValid = false;
      } else if (parseFloat(formData.budget) <= 0) {
        newErrors.budget = 'Budget must be greater than 0';
        isValid = false;
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
        isValid = false;
      }
    }

    if (step === 2) {
      if (!formData.projectType) {
        newErrors.projectType = 'Project type is required';
        isValid = false;
      }
      if (!formData.category.trim()) {
        newErrors.category = 'Category is required';
        isValid = false;
      }
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
        isValid = false;
      }
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
        isValid = false;
      }
      if (!formData.siteArea) {
        newErrors.siteArea = 'Site area is required';
        isValid = false;
      } else if (parseFloat(formData.siteArea) <= 0) {
        newErrors.siteArea = 'Site area must be greater than 0';
        isValid = false;
      }
      if (!formData.numberOfUnits) {
        newErrors.numberOfUnits = 'Number of units is required';
        isValid = false;
      } else if (parseInt(formData.numberOfUnits) <= 0) {
        newErrors.numberOfUnits = 'Number of units must be greater than 0';
        isValid = false;
      }
      if (!formData.numberOfFloors) {
        newErrors.numberOfFloors = 'Number of floors is required';
        isValid = false;
      } else if (parseInt(formData.numberOfFloors) <= 0) {
        newErrors.numberOfFloors = 'Number of floors must be greater than 0';
        isValid = false;
      }
      if (!formData.completionDate) {
        newErrors.completionDate = 'Completion date is required';
        isValid = false;
      }
    }

    if (step === 3) {
      if (!formData.siteManagerId) {
        newErrors.siteManagerId = 'Site Manager is required';
        isValid = false;
      }
      if (!formData.accountantId) {
        newErrors.accountantId = 'Accountant is required';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

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
    
    // Validate all steps before submitting
    let allValid = true;
    for (let step = 1; step <= totalSteps; step++) {
      if (!validateStep(step)) {
        allValid = false;
        setCurrentStep(step);
        toast.error(`Please complete all required fields in Step ${step}`);
        break;
      }
    }

    if (!allValid) return;

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

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        setErrors({});
      }
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="wizard-progress">
        <div className="progress-info">
          <span className="step-label">Step {currentStep} of {totalSteps}</span>
          <span className="step-percent">{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
        </div>
      </div>
    );
  };

  const renderStepHeader = () => {
    return (
      <div className="wizard-header">
        {steps.map(step => (
          <div
            key={step.number}
            className={`wizard-step ${
              currentStep === step.number ? "active" : currentStep > step.number ? "completed" : ""
            }`}
          >
            <div className="step-circle">
              {currentStep > step.number ? <CheckCircle size={18} /> : step.number}
            </div>
            <span>{step.title}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderFieldError = (fieldName) => {
    if (errors[fieldName]) {
      return <span className="field-error">{errors[fieldName]}</span>;
    }
    return null;
  };

  const renderBasicInfo = () => {
    return (
      <div className="tab-content">
        <div className="form-row">
          <div className="form-group full">
            <label>Project Name <span className="required">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
              className={errors.name ? 'error' : ''}
              required
            />
            {renderFieldError('name')}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Client Name <span className="required">*</span></label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="Enter client name"
              className={errors.clientName ? 'error' : ''}
              required
            />
            {renderFieldError('clientName')}
          </div>
          <div className="form-group">
            <label>Client Email <span className="required">*</span></label>
            <input
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              placeholder="client@email.com"
              className={errors.clientEmail ? 'error' : ''}
              required
            />
            {renderFieldError('clientEmail')}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Client Phone <span className="required">*</span></label>
            <input
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              placeholder="+256 700 000 000"
              className={errors.clientPhone ? 'error' : ''}
              required
            />
            {renderFieldError('clientPhone')}
          </div>
          <div className="form-group">
            <label>Location <span className="required">*</span></label>
            <div className={`input-with-icon ${errors.location ? 'error' : ''}`}>
              <MapPin size={18} />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter project location"
                className={errors.location ? 'error' : ''}
                required
              />
            </div>
            {renderFieldError('location')}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Budget <span className="required">*</span></label>
            <div className={`input-with-icon ${errors.budget ? 'error' : ''}`}>
              <DollarSign size={18} />
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="Enter budget"
                required
                min="0"
                step="1000"
                className={errors.budget ? 'error' : ''}
              />
            </div>
            {renderFieldError('budget')}
          </div>
          <div className="form-group">
            <label>Currency <span className="required">*</span></label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              required
            >
              <option value="UGX">🇺🇬 UGX</option>
              <option value="USD">🇺🇸 USD</option>
              <option value="EUR">🇪🇺 EUR</option>
              <option value="KES">🇰🇪 KES</option>
              <option value="TZS">🇹🇿 TZS</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full">
            <label>Description <span className="required">*</span></label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the project"
              rows="3"
              className={errors.description ? 'error' : ''}
              required
            />
            {renderFieldError('description')}
          </div>
        </div>
      </div>
    );
  };

  const renderProjectDetails = () => {
    return (
      <div className="tab-content">
        <div className="form-row">
          <div className="form-group">
            <label>Status <span className="required">*</span></label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              {statuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Priority <span className="required">*</span></label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              required
            >
              {priorities.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Project Type <span className="required">*</span></label>
            <select
              value={formData.projectType}
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
              className={errors.projectType ? 'error' : ''}
              required
            >
              {projectTypes.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            {renderFieldError('projectType')}
          </div>
          <div className="form-group">
            <label>Category <span className="required">*</span></label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Construction, Renovation"
              className={errors.category ? 'error' : ''}
              required
            />
            {renderFieldError('category')}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date <span className="required">*</span></label>
            <div className={`input-with-icon ${errors.startDate ? 'error' : ''}`}>
              <Calendar size={18} />
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={errors.startDate ? 'error' : ''}
                required
              />
            </div>
            {renderFieldError('startDate')}
          </div>
          <div className="form-group">
            <label>End Date <span className="required">*</span></label>
            <div className={`input-with-icon ${errors.endDate ? 'error' : ''}`}>
              <Calendar size={18} />
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={errors.endDate ? 'error' : ''}
                required
              />
            </div>
            {renderFieldError('endDate')}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Site Area (sq meters) <span className="required">*</span></label>
            <input
              type="number"
              value={formData.siteArea}
              onChange={(e) => setFormData({ ...formData, siteArea: e.target.value })}
              placeholder="Enter site area"
              min="0"
              step="1"
              className={errors.siteArea ? 'error' : ''}
              required
            />
            {renderFieldError('siteArea')}
          </div>
          <div className="form-group">
            <label>Number of Units <span className="required">*</span></label>
            <input
              type="number"
              value={formData.numberOfUnits}
              onChange={(e) => setFormData({ ...formData, numberOfUnits: e.target.value })}
              placeholder="Enter number of units"
              min="0"
              step="1"
              className={errors.numberOfUnits ? 'error' : ''}
              required
            />
            {renderFieldError('numberOfUnits')}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Number of Floors <span className="required">*</span></label>
            <input
              type="number"
              value={formData.numberOfFloors}
              onChange={(e) => setFormData({ ...formData, numberOfFloors: e.target.value })}
              placeholder="Enter number of floors"
              min="0"
              step="1"
              className={errors.numberOfFloors ? 'error' : ''}
              required
            />
            {renderFieldError('numberOfFloors')}
          </div>
          <div className="form-group">
            <label>Expected Completion Date <span className="required">*</span></label>
            <div className={`input-with-icon ${errors.completionDate ? 'error' : ''}`}>
              <Calendar size={18} />
              <input
                type="date"
                value={formData.completionDate}
                onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                className={errors.completionDate ? 'error' : ''}
                required
              />
            </div>
            {renderFieldError('completionDate')}
          </div>
        </div>
      </div>
    );
  };

  const renderProjectTeam = () => {
    return (
      <div className="tab-content">
        <div className="form-row">
          <div className="form-group">
            <label>Site Manager <span className="required">*</span></label>
            <select
              value={formData.siteManagerId}
              onChange={(e) => setFormData({ ...formData, siteManagerId: e.target.value })}
              className={errors.siteManagerId ? 'error' : ''}
              required
            >
              <option value="">Select Site Manager</option>
              {users.filter(u => u.role === 'site_manager').map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.email})
                </option>
              ))}
            </select>
            {renderFieldError('siteManagerId')}
          </div>
          <div className="form-group">
            <label>Accountant <span className="required">*</span></label>
            <select
              value={formData.accountantId}
              onChange={(e) => setFormData({ ...formData, accountantId: e.target.value })}
              className={errors.accountantId ? 'error' : ''}
              required
            >
              <option value="">Select Accountant</option>
              {users.filter(u => u.role === 'accountant').map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.email})
                </option>
              ))}
            </select>
            {renderFieldError('accountantId')}
          </div>
        </div>
      </div>
    );
  };

  const renderAdvanced = () => {
    return (
      <div className="tab-content">
        <div className="form-row">
          <div className="form-group">
            <label>Risk Level <span className="required">*</span></label>
            <select
              value={formData.riskLevel}
              onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
              required
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
            <label>Additional Notes <span className="required">*</span></label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about the project"
              rows="3"
              className={errors.notes ? 'error' : ''}
              required
            />
            {renderFieldError('notes')}
          </div>
        </div>
      </div>
    );
  };

  const renderNavigationButtons = () => {
    return (
      <div className="form-navigation">
        <div className="nav-buttons">
          {currentStep > 1 && (
            <button type="button" className="btn-prev" onClick={previousStep}>
              Previous
            </button>
          )}
          {currentStep < totalSteps ? (
            <button type="button" className="btn-next" onClick={nextStep}>
              Next Step
            </button>
          ) : (
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
          )}
        </div>
      </div>
    );
  };

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
                <h2>{project ? '✏️ Edit Project' : '📋 New Project'}</h2>
                <p>{project ? 'Update project details' : 'Fill in the project details below'}</p>
              </div>
              <button className="close-btn" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            {renderStepIndicator()}
            {renderStepHeader()}

            <form onSubmit={handleSubmit} className="project-form-body">
              {currentStep === 1 && renderBasicInfo()}
              {currentStep === 2 && renderProjectDetails()}
              {currentStep === 3 && renderProjectTeam()}
              {currentStep === 4 && renderAdvanced()}
              {renderNavigationButtons()}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectForm;