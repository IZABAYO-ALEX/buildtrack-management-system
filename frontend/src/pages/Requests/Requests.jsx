import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, CheckCircle, XCircle, Clock,
  Eye, Edit, Trash2, RefreshCw, Download,
  AlertCircle, DollarSign, Users, Package, Calendar,
  MessageSquare, Send, ThumbsUp, ThumbsDown, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import RequestModal from '../../components/common/RequestModal';
import api from '../../services/api';
import './Requests.css';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, projectsRes, usersRes] = await Promise.all([
        api.get('/requests'),
        api.get('/projects'),
        api.get('/users')
      ]);

      setRequests(requestsRes.data.data || []);
      setProjects(projectsRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/requests/${id}/approve`);
      toast.success('Request approved!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await api.patch(`/requests/${id}/reject`, { reason: rejectionReason });
      toast.success('Request rejected');
      setShowRejectionModal(false);
      setRejectionReason('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      cancelled: 'secondary'
    };
    return badges[status] || 'secondary';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'info',
      medium: 'warning',
      high: 'danger',
      urgent: 'danger urgent'
    };
    return badges[priority] || 'secondary';
  };

  const filteredRequests = activeFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === activeFilter);

  return (
    <DashboardLayout userRole="site_manager">
      <div className="requests-container">
        <div className="page-header">
          <div>
            <h1>📨 Requests</h1>
            <p>Manage and track all requests</p>
          </div>
          <div className="page-actions">
            <button className="btn-primary" onClick={() => setShowRequestModal(true)}>
              <Plus size={18} />
              New Request
            </button>
            <button className="btn-outline" onClick={fetchData}>
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        <div className="filters-bar">
          <div className="filter-group">
            <button 
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveFilter('approved')}
            >
              Approved
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveFilter('rejected')}
            >
              Rejected
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={64} />
            <h3>No requests found</h3>
            <p>Create a new request to get started</p>
            <button className="btn-primary" onClick={() => setShowRequestModal(true)}>
              <Plus size={18} />
              New Request
            </button>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                className="request-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="request-header">
                  <div className="request-type">
                    <span className={`priority-badge ${getPriorityBadge(request.priority)}`}>
                      {request.priority}
                    </span>
                    <span className="request-type-label">{request.type?.replace('_', ' ')}</span>
                  </div>
                  <span className={`status-badge ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="request-body">
                  <h3 className="request-title">{request.title}</h3>
                  <p className="request-description">{request.description}</p>
                  
                  {request.amount && (
                    <div className="request-amount">
                      <DollarSign size={16} />
                      ${request.amount}
                    </div>
                  )}

                  <div className="request-meta">
                    <div className="meta-item">
                      <Users size={14} />
                      <span>From: {request.requestor?.fullName || 'Unknown'}</span>
                    </div>
                    <div className="meta-item">
                      <Users size={14} />
                      <span>To: {request.approver?.fullName || 'Pending'}</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {request.rejectionReason && (
                    <div className="rejection-reason">
                      <AlertCircle size={14} />
                      <span>Rejected: {request.rejectionReason}</span>
                    </div>
                  )}
                </div>

                <div className="request-footer">
                  {request.status === 'pending' && (
                    <div className="request-actions">
                      <button 
                        className="btn-approve"
                        onClick={() => handleApprove(request.id)}
                      >
                        <ThumbsUp size={16} />
                        Approve
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectionModal(true);
                        }}
                      >
                        <ThumbsDown size={16} />
                        Reject
                      </button>
                    </div>
                  )}
                  {request.status === 'approved' && (
                    <div className="request-status approved">
                      <CheckCircle size={16} />
                      Approved by {request.approver?.fullName || 'Unknown'}
                    </div>
                  )}
                  {request.status === 'rejected' && (
                    <div className="request-status rejected">
                      <XCircle size={16} />
                      Rejected
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <RequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          projects={projects}
          users={users}
          onSuccess={fetchData}
        />

        {/* Rejection Modal */}
        {showRejectionModal && (
          <div className="modal-overlay" onClick={() => setShowRejectionModal(false)}>
            <div className="modal rejection-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Reject Request</h2>
                <button className="modal-close" onClick={() => setShowRejectionModal(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-form">
                <div className="form-group">
                  <label>Reason for Rejection *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this request"
                    rows="4"
                  />
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={() => setShowRejectionModal(false)}>
                    Cancel
                  </button>
                  <button className="btn-danger" onClick={() => handleReject(selectedRequest?.id)}>
                    Reject Request
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

export default Requests;
