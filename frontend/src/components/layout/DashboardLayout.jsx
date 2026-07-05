import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
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
  ChevronDown
} from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout = ({ children, userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/dashboard/${userRole}` },
    { icon: FolderOpen, label: 'Projects', path: '/projects' },
    { icon: DollarSign, label: 'Expenses', path: '/expenses' },
    { icon: Users, label: 'Workers', path: '/workers' },
    { icon: Package, label: 'Materials', path: '/materials' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
  ];

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
            <Building2 size={32} color="#6366F1" />
            {sidebarOpen && <span>Build<span>Track</span></span>}
          </div>
          <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <a key={index} href={item.path} className="nav-item">
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="/settings" className="nav-item">
            <Settings size={20} />
            {sidebarOpen && <span>Settings</span>}
          </a>
          <a href="/logout" className="nav-item logout">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </a>
        </div>
      </motion.aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back, User</p>
          </div>
          <div className="topbar-right">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search..." className="search-input" />
            </div>
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <div className="profile-wrapper">
              <button className="profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <div className="avatar">U</div>
                <span className="profile-name">User</span>
                <ChevronDown size={16} />
              </button>
              {showProfileMenu && (
                <motion.div className="profile-dropdown" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="dropdown-header">
                    <div className="avatar-lg">U</div>
                    <div>
                      <p className="dropdown-name">User</p>
                      <p className="dropdown-email">user@buildtrack.com</p>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <a href="/profile" className="dropdown-item"><User size={16} />Profile</a>
                  <a href="/settings" className="dropdown-item"><Settings size={16} />Settings</a>
                  <div className="dropdown-divider"></div>
                  <a href="/logout" className="dropdown-item logout"><LogOut size={16} />Logout</a>
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
