import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  FolderOpen,
  DollarSign,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  User,
  ChevronDown,
  Shield,
  LineChart,
  MessageSquare,
  Image
} from 'lucide-react';
import NotificationBell from '../common/NotificationBell';
import './DashboardLayout.css';

const DashboardLayout = ({ children, userRole }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/dashboard/${userRole}` },
    { icon: FolderOpen, label: 'Projects', path: '/projects' },
    { icon: DollarSign, label: 'Expenses', path: '/expenses' },
    { icon: Users, label: 'Workers', path: '/workers' },
    { icon: Package, label: 'Materials', path: '/materials' },
    { icon: MessageSquare, label: 'Requests', path: '/requests' },
    { icon: Image, label: 'Media Gallery', path: '/media' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: LineChart, label: 'Analytics', path: '/analytics' },
  ];

  if (userRole === 'contractor') {
    menuItems.push({ icon: Shield, label: 'Users', path: '/users' });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userName = user?.fullName || user?.name || 'User';
  const userEmail = user?.email || 'user@buildtrack.com';
  const userAvatar = userName.charAt(0).toUpperCase();

  return (
    <div className={`dashboard-layout ${!sidebarOpen ? 'collapsed' : ''}`}>
      <motion.aside 
        className="sidebar"
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sidebar-header">
          <div className="logo">
            <img src="/logo-small.svg" alt="BuildTrack" className="logo-icon-img" />
            {sidebarOpen && <span>Build<span>Track</span></span>}
          </div>
          <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <a key={index} href={item.path} className="nav-item" onClick={(e) => { e.preventDefault(); navigate(item.path); }}>
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="/settings" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/settings'); }}>
            <Settings size={20} />
            {sidebarOpen && <span>Settings</span>}
          </a>
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-logo">
              <img src="/logo-small.svg" alt="BuildTrack" className="topbar-logo-img" />
              <div>
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome back, {userName}!</p>
              </div>
            </div>
          </div>
          <div className="topbar-right">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search..." className="search-input" />
            </div>
            <NotificationBell />
            <div className="profile-wrapper">
              <button className="profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <div className="avatar">{userAvatar}</div>
                <span className="profile-name">{userName}</span>
                <ChevronDown size={16} />
              </button>
              {showProfileMenu && (
                <motion.div className="profile-dropdown" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="dropdown-header">
                    <div className="avatar-lg">{userAvatar}</div>
                    <div>
                      <p className="dropdown-name">{userName}</p>
                      <p className="dropdown-email">{userEmail}</p>
                      <p className="dropdown-role">{userRole?.replace('_', ' ').toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <a href="/profile" className="dropdown-item"><User size={16} />Profile</a>
                  <a href="/settings" className="dropdown-item"><Settings size={16} />Settings</a>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={handleLogout}><LogOut size={16} />Logout</button>
                </motion.div>
              )}
            </div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
