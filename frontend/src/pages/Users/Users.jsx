import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit, Trash2, X, User, 
  Mail, Phone, Briefcase, CheckCircle, 
  AlertCircle, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { userService } from '../../services/api';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'site_manager',
    phone: '',
    companyName: ''
  });

  const roles = ['contractor', 'site_manager', 'accountant'];

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
    try {
      const response = await userService.create(formData);
      setUsers([response.data.data, ...users]);
      toast.success('User created successfully!');
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await userService.update(selectedUser.id, formData);
      setUsers(users.map(u => u.id === selectedUser.id ? response.data.data : u));
      toast.success('User updated successfully!');
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userService.delete(id);
      setUsers(users.filter(u => u.id !== id));
      toast.success('User deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await userService.deactivate(id);
      toast.success('User deactivated successfully!');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      role: 'site_manager',
      phone: '',
      companyName: ''
    });
    setSelectedUser(null);
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

  return (
    <DashboardLayout userRole="contractor">
      <div className="users-container">
        <div className="page-header">
          <div>
            <h1>Users</h1>
            <p>Manage all system users</p>
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
            <User size={64} />
            <h3>No users found</h3>
            <p>Create your first user</p>
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
                  <div className="user-actions">
                    <button className="icon-btn" onClick={() => openEditModal(user)}>
                      <Edit size={18} />
                    </button>
                    <button className="icon-btn" onClick={() => handleDeactivate(user.id)}>
                      <AlertCircle size={18} />
                    </button>
                    <button className="icon-btn danger" onClick={() => handleDelete(user.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="user-card-body">
                  <h3 className="user-name">{user.fullName}</h3>
                  <p className="user-email"><Mail size={14} /> {user.email}</p>
                  <div className="user-details">
                    <span className={`role-badge ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                    {user.phone && (
                      <span className="user-phone"><Phone size={14} /> {user.phone}</span>
                    )}
                  </div>
                  {user.companyName && (
                    <p className="user-company"><Briefcase size={14} /> {user.companyName}</p>
                  )}
                </div>
                <div className="user-card-footer">
                  <span className={`status-badge ${user.isActive ? 'success' : 'danger'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="user-created">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
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
                  <h2>Create User</h2>
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
                      />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Password *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Role *</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                      >
                        {roles.map(role => (
                          <option key={role} value={role}>
                            {role.replace('_', ' ').toUpperCase()}
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
                    <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Create User
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
                  <h2>Edit User</h2>
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
                      <label>Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Password (leave blank to keep current)</label>
                      <input
                        type="password"
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
                        {roles.map(role => (
                          <option key={role} value={role}>
                            {role.replace('_', ' ').toUpperCase()}
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
                    <button type="submit" className="btn-primary">
                      Update User
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
