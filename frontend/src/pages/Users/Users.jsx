import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit, Trash2, X, 
  User, Mail, Phone, Briefcase, 
  CheckCircle, AlertCircle, RefreshCw,
  Shield, Users as UsersIcon, Eye,
  Key, Power, PowerOff, Save,
  Verified, ShieldCheck, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api, { userService } from '../../services/api';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: 'password123',
    fullName: '',
    role: 'site_manager',
    phone: '',
    companyName: ''
  });

  const roles = [
    { value: 'site_manager', label: '🏗️ Site Manager', description: 'Site operations' },
    { value: 'accountant', label: '💰 Accountant', description: 'Financial management' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      setUsers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await userService.create(formData);
      setUsers([response.data.data, ...users]);
      toast.success(response.data.message || 'User created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await userService.update(selectedUser.id, formData);
      setUsers(users.map(u => u.id === selectedUser.id ? response.data.data : u));
      toast.success(response.data.message || 'User updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      const response = await api.patch(`/users/${id}/verify`);
      toast.success(response.data.message || 'User verified and activated successfully!');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this user?')) return;
    try {
      await userService.delete(id);
      setUsers(users.filter(u => u.id !== id));
      toast.success('User deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await userService.deactivate(id);
      toast.success('User deactivated successfully!');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const handleActivate = async (id) => {
    try {
      await userService.activate(id);
      toast.success('User activated successfully!');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate user');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      await userService.resetPassword(selectedUser.id, { newPassword });
      toast.success('Password reset successfully!');
      setShowResetPasswordModal(false);
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: 'password123',
      fullName: '',
      role: 'site_manager',
      phone: '',
      companyName: ''
    });
    setSelectedUser(null);
    setNewPassword('');
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      fullName: user.fullName,
      role: user.role,
      phone: user.phone || '',
      companyName: user.companyName || ''
    });
    setShowEditModal(true);
  };

  const openResetPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowResetPasswordModal(true);
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    const colors = {
      contractor: 'primary',
      site_manager: 'warning',
      accountant: 'success'
    };
    return colors[role] || 'secondary';
  };

  const getRoleEmoji = (role) => {
    const emojis = {
      contractor: '👔',
      site_manager: '🏗️',
      accountant: '💰'
    };
    return emojis[role] || '👤';
  };

  return (
    <DashboardLayout userRole="contractor">
      <div className="users-container">
        <div className="page-header">
          <div>
            <h1>�� User Management</h1>
            <p>Create and manage system users ({users.filter(u => u.role !== 'contractor').length} managed)</p>
          </div>
          <div className="page-actions">
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              Create User
            </button>
            <button className="btn-outline" onClick={fetchUsers}>
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <UsersIcon size={64} />
            <h3>No users found</h3>
            <p>Create your first user to get started</p>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              Create User
            </button>
          </div>
        ) : (
          <div className="users-grid">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                className="user-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <div className="user-card-header">
                  <div className="user-avatar">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-status-badges">
                    {user.role === 'contractor' ? (
                      <span className="badge contractor-badge">👔 Owner</span>
                    ) : (
                      <>
                        {user.isVerified ? (
                          <span className="badge verified-badge">✅ Verified</span>
                        ) : (
                          <span className="badge unverified-badge">⏳ Pending</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="user-card-body">
                  <h3 className="user-name">{user.fullName}</h3>
                  <p className="user-email"><Mail size={14} /> {user.email}</p>
                  <div className="user-details">
                    <span className={`role-badge ${getRoleColor(user.role)}`}>
                      {getRoleEmoji(user.role)} {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                    {user.phone && (
                      <span className="user-phone"><Phone size={14} /> {user.phone}</span>
                    )}
                  </div>
                  {user.companyName && (
                    <p className="user-company"><Briefcase size={14} /> {user.companyName}</p>
                  )}
                  <p className="user-created">Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  {user.verifiedAt && (
                    <p className="user-verified">Verified: {new Date(user.verifiedAt).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="user-card-footer">
                  <div className="user-status">
                    <span className={`status-badge ${user.isActive ? 'success' : 'danger'}`}>
                      {user.isActive ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                    {user.role !== 'contractor' && !user.isVerified && (
                      <button 
                        className="btn-verify" 
                        onClick={() => handleVerify(user.id)}
                        title="Verify User"
                      >
                        <ShieldCheck size={16} />
                        Verify
                      </button>
                    )}
                  </div>
                  <div className="user-actions">
                    <button className="icon-btn" onClick={() => openEditModal(user)} title="Edit">
                      <Edit size={18} />
                    </button>
                    <button className="icon-btn" onClick={() => openResetPasswordModal(user)} title="Reset Password">
                      <Key size={18} />
                    </button>
                    {user.role !== 'contractor' && (
                      <>
                        {user.isActive ? (
                          <button className="icon-btn" onClick={() => handleDeactivate(user.id)} title="Deactivate">
                            <PowerOff size={18} color="#ef4444" />
                          </button>
                        ) : (
                          <button className="icon-btn" onClick={() => handleActivate(user.id)} title="Activate">
                            <Power size={18} color="#10b981" />
                          </button>
                        )}
                      </>
                    )}
                    <button className="icon-btn danger" onClick={() => handleDelete(user.id)} title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
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
                  <div>
                    <h2>👤 Create New User</h2>
                    <p className="modal-subtitle">The user will need to be verified before accessing the system</p>
                  </div>
                  <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleCreate} className="modal-form">
                  <div className="form-grid">
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
                    <div className="form-group full-width">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Default: password123"
                      />
                      <small>Default password: password123</small>
                    </div>
                    <div className="form-group">
                      <label>Role *</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                      >
                        <option value="">Select role</option>
                        {roles.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label} - {role.description}
                          </option>
                        ))}
                      </select>
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
                      <label>Company Name</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Enter company name"
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {showEditModal && selectedUser && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
                <div className="modal-header">
                  <div>
                    <h2>✏️ Edit User</h2>
                    <p className="modal-subtitle">Update user details</p>
                  </div>
                  <button className="modal-close" onClick={() => setShowEditModal(false)}>
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleUpdate} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                      />
                      <small>Email cannot be changed</small>
                    </div>
                    <div className="form-group">
                      <label>New Password (leave blank to keep current)</label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="form-group">
                      <label>Role *</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                      >
                        <option value="">Select role</option>
                        {roles.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label} - {role.description}
                          </option>
                        ))}
                      </select>
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
                      <label>Company Name</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Updating...' : 'Update User'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset Password Modal */}
        <AnimatePresence>
          {showResetPasswordModal && selectedUser && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal modal-sm" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
                <div className="modal-header">
                  <div>
                    <h2>🔑 Reset Password</h2>
                    <p className="modal-subtitle">Reset password for {selectedUser.fullName}</p>
                  </div>
                  <button className="modal-close" onClick={() => setShowResetPasswordModal(false)}>
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className="modal-form">
                  <div className="form-group">
                    <label>New Password *</label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password (min 6 characters)"
                    />
                    <small>Password must be at least 6 characters</small>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={() => setShowResetPasswordModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

export default Users;
