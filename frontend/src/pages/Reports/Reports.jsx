import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Reports = () => {
  return (
    <DashboardLayout userRole="accountant">
      <div className="dashboard-container">
        <h1>Reports</h1>
        <p>Generate and view management reports.</p>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
