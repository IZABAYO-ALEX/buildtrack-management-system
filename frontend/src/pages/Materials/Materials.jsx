import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
// Add this import at the top of materialRoutes.js
import expenseController from '../controllers/expenseController.js';
const Materials = () => {
  return (
    <DashboardLayout userRole="site_manager">
      <div className="dashboard-container">
        <h1>Materials</h1>
        <p>Track material inventory and purchases.</p>
      </div>
    </DashboardLayout>
  );
};

export default Materials;
