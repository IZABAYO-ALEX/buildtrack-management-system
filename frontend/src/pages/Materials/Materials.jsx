import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

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
