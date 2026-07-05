import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Expenses = () => {
  return (
    <DashboardLayout userRole="site_manager">
      <div className="dashboard-container">
        <h1>Expenses</h1>
        <p>Track and manage project expenses.</p>
      </div>
    </DashboardLayout>
  );
};

export default Expenses;
