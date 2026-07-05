import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Edit, Trash2, Eye, 
  X, DollarSign, Calendar, FileText,
  RefreshCw, Filter, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FormInput from '../../components/forms/FormInput';
import FormModal from '../../components/forms/FormModal';
import { expenseService, projectService } from '../../services/api';
import { expenseSchema } from '../../schemas';
import '../../components/forms/Forms.css';
import './Expenses.css';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      projectId: '',
      category: '',
      amount: '',
      description: '',
      date: '',
      status: 'pending'
    }
  });

  const categoryOptions = [
    { value: 'Materials', label: 'Materials' },
    { value: 'Labor', label: 'Labor' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Utilities', label: 'Utilities' },
    { value: 'Other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, projectsRes] = await Promise.all([
        expenseService.getAll(),
        projectService.getAll()
      ]);
      setExpenses(expensesRes.data.data || []);
      setProjects(projectsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await expenseService.create(data);
      setExpenses([response.data.data, ...expenses]);
      toast.success('Expense recorded successfully!');
      setShowCreateModal(false);
      methods.reset();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await expenseService.update(selectedExpense.id, data);
      setExpenses(expenses.map(e => e.id === selectedExpense.id ? response.data.data : e));
      toast.success('Expense updated successfully!');
      setShowEditModal(false);
      methods.reset();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseService.delete(id);
      setExpenses(expenses.filter(e => e.id !== id));
      toast.success('Expense deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete expense');
    }
  };

  const openEditModal = (expense) => {
    setSelectedExpense(expense);
    methods.reset({
      projectId: expense.projectId,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
      status: expense.status
    });
    setShowEditModal(true);
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return colors[status] || 'secondary';
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout userRole="site_manager">
      <div className="expenses-container">
        <div className="page-header">
          <div>
            <h1>Expenses</h1>
            <p>Track and manage all project expenses</p>
          </div>
          <div className="page-actions">
            <button className="btn-primary" onClick={() => {
              methods.reset();
              setShowCreateModal(true);
            }}>
              <Plus size={18} />
              Record Expense
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
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading expenses...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={64} />
            <h3>No expenses recorded</h3>
            <p>Record your first expense to start tracking</p>
            <button className="btn-primary" onClick={() => {
              methods.reset();
              setShowCreateModal(true);
            }}>
              <Plus size={18} />
              Record Expense
            </button>
          </div>
        ) : (
          <div className="expenses-table-wrapper">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense, index) => (
                  <motion.tr
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>{expense.date}</td>
                    <td>{getProjectName(expense.projectId)}</td>
                    <td><span className="category-badge">{expense.category}</span></td>
                    <td>{expense.description}</td>
                    <td className="amount">${expense.amount?.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="icon-btn" onClick={() => openEditModal(expense)}>
                          <Edit size={16} />
                        </button>
                        <button className="icon-btn danger" onClick={() => handleDelete(expense.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Modal */}
        <FormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Record Expense"
          subtitle="Enter expense details below"
          onSubmit={methods.handleSubmit(handleCreate)}
          isLoading={isSubmitting}
          submitText="Record Expense"
        >
          <FormProvider {...methods}>
            <div className="form-grid">
              <div className="full-width">
                <FormInput
                  name="projectId"
                  label="Project"
                  type="select"
                  options={projects.map(p => ({ value: p.id, label: p.name }))}
                  required
                />
              </div>
              <div>
                <FormInput
                  name="category"
                  label="Category"
                  type="select"
                  options={categoryOptions}
                  required
                />
              </div>
              <div>
                <FormInput
                  name="amount"
                  label="Amount"
                  type="number"
                  placeholder="Enter amount"
                  required
                  icon={DollarSign}
                />
              </div>
              <div className="full-width">
                <FormInput
                  name="description"
                  label="Description"
                  placeholder="Enter description"
                  type="textarea"
                  rows={3}
                  required
                />
              </div>
              <div>
                <FormInput
                  name="date"
                  label="Date"
                  type="date"
                  icon={Calendar}
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
            </div>
          </FormProvider>
        </FormModal>

        {/* Edit Modal */}
        <FormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Expense"
          subtitle="Update expense details"
          onSubmit={methods.handleSubmit(handleUpdate)}
          isLoading={isSubmitting}
          submitText="Update Expense"
        >
          <FormProvider {...methods}>
            <div className="form-grid">
              <div className="full-width">
                <FormInput
                  name="projectId"
                  label="Project"
                  type="select"
                  options={projects.map(p => ({ value: p.id, label: p.name }))}
                  required
                />
              </div>
              <div>
                <FormInput
                  name="category"
                  label="Category"
                  type="select"
                  options={categoryOptions}
                  required
                />
              </div>
              <div>
                <FormInput
                  name="amount"
                  label="Amount"
                  type="number"
                  placeholder="Enter amount"
                  required
                  icon={DollarSign}
                />
              </div>
              <div className="full-width">
                <FormInput
                  name="description"
                  label="Description"
                  placeholder="Enter description"
                  type="textarea"
                  rows={3}
                  required
                />
              </div>
              <div>
                <FormInput
                  name="date"
                  label="Date"
                  type="date"
                  icon={Calendar}
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
            </div>
          </FormProvider>
        </FormModal>
      </div>
    </DashboardLayout>
  );
};

export default Expenses;
