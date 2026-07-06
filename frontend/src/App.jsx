import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import ContractorDashboard from './pages/Dashboard/ContractorDashboard';
import SiteManagerDashboard from './pages/Dashboard/SiteManagerDashboard';
import AccountantDashboard from './pages/Dashboard/AccountantDashboard';
import Projects from './pages/Projects/Projects';
import Expenses from './pages/Expenses/Expenses';
import Workers from './pages/Workers/Workers';
import Materials from './pages/Materials/Materials';
import Reports from './pages/Reports/Reports';
import Users from './pages/Users/Users';
import Analytics from './pages/Analytics/Analytics';
import Requests from './pages/Requests/Requests';
import Blog from './pages/Blog/Blog';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleMap = {
      contractor: '/dashboard/contractor',
      site_manager: '/dashboard/site-manager',
      accountant: '/dashboard/accountant'
    };
    return <Navigate to={roleMap[user.role] || '/dashboard'} replace />;
  }
  
  return children;
};

const RoleRedirect = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const roleMap = {
    contractor: '/dashboard/contractor',
    site_manager: '/dashboard/site-manager',
    accountant: '/dashboard/accountant'
  };
  
  return <Navigate to={roleMap[user.role] || '/dashboard'} replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<RoleRedirect />} />
      
      <Route 
        path="/dashboard/contractor" 
        element={
          <ProtectedRoute allowedRoles={['contractor']}>
            <ContractorDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/site-manager" 
        element={
          <ProtectedRoute allowedRoles={['site_manager']}>
            <SiteManagerDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/accountant" 
        element={
          <ProtectedRoute allowedRoles={['accountant']}>
            <AccountantDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/projects" 
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/expenses" 
        element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/workers" 
        element={
          <ProtectedRoute>
            <Workers />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/materials" 
        element={
          <ProtectedRoute>
            <Materials />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/users" 
        element={
          <ProtectedRoute allowedRoles={['contractor']}>
            <Users />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute allowedRoles={['contractor', 'accountant']}>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/requests" 
        element={
          <ProtectedRoute allowedRoles={['contractor', 'site_manager', 'accountant']}>
            <Requests />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/blog" 
        element={
          <ProtectedRoute>
            <Blog />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
