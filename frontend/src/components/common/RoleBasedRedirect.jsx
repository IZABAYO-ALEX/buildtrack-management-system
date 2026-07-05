import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const RoleBasedRedirect = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/login');
        return;
      }

      const roleMap = {
        contractor: '/dashboard/contractor',
        site_manager: '/dashboard/site-manager',
        accountant: '/dashboard/accountant'
      };

      const dashboardPath = roleMap[user.role] || '/dashboard';
      navigate(dashboardPath);
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Redirecting to your dashboard...</p>
    </div>
  );
};

export default RoleBasedRedirect;
