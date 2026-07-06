import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AnalyticsDashboard from '../../components/dashboard/charts/AnalyticsDashboard';

const Analytics = () => {
  return (
    <DashboardLayout userRole="contractor">
      <AnalyticsDashboard />
    </DashboardLayout>
  );
};

export default Analytics;
