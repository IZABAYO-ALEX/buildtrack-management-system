import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  DollarSign,
  BarChart3,
  Shield,
  Layers,
  Rocket,
  ArrowRight,
  Menu,
  X,
  CheckCircle,
  Sparkles,
  Play,
  Twitter,
  Github,
  Youtube
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const roleMap = {
        contractor: '/dashboard/contractor',
        site_manager: '/dashboard/site-manager',
        accountant: '/dashboard/accountant'
      };
      navigate(roleMap[user.role] || '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const features = [
    { icon: <Layers size={24} />, title: 'Project Management', description: 'Create and manage multiple construction projects' },
    { icon: <DollarSign size={24} />, title: 'Expense Tracking', description: 'Record and categorize all project expenses' },
    { icon: <Users size={24} />, title: 'Workforce Management', description: 'Track worker attendance and payments' },
    { icon: <BarChart3 size={24} />, title: 'Advanced Reporting', description: 'Generate comprehensive reports' },
    { icon: <Shield size={24} />, title: 'Secure Platform', description: 'Enterprise-grade security with role-based access' }
  ];

  const stats = [
    { value: '50+', label: 'Active Projects' },
    { value: '2,000+', label: 'Workers Managed' },
    { value: '$5M+', label: 'Budget Tracked' },
    { value: '98%', label: 'Satisfaction Rate' }
  ];

  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <Building2 size={32} className="logo-icon" />
            <span className="logo-text">Build<span>Track</span></span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#stats">Statistics</a>
            <a href="#about">About Us</a>
            <a href="#blog">Blog</a>
          </div>
          <div className="nav-actions">
            <button className="btn-login" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Get Started <ArrowRight size={18} />
            </button>
            <button className="menu-toggle">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-container">
          <motion.div className="hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="hero-badge"><Sparkles size={16} /><span>🚀 Better and Reliable Construction Management</span></div>
            <h1 className="hero-title">Build Smarter,<br /><span className="gradient-text">Track Better</span></h1>
            <p className="hero-description">Streamline your construction projects, track expenses, manage workforce, and make data-driven decisions.</p>
            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={() => navigate('/login')}>
                Get Started Free <Rocket size={20} />
              </button>
              <button className="btn-hero-secondary"><Play size={20} /> Watch Demo</button>
            </div>
            <div className="hero-stats-mini">
              {stats.slice(0, 3).map((stat, i) => (
                <div key={i} className="stat-item">
                  <div className="stat-number">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dots"><span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span></div>
                <span className="preview-title">BuildTrack Dashboard</span>
              </div>
              <div className="preview-content">
                <div className="preview-stats">
                  <div><div className="stat-value">$45.2K</div><div className="stat-label">Total Expenses</div></div>
                  <div><div className="stat-value">68%</div><div className="stat-label">Budget Used</div></div>
                  <div><div className="stat-value">12</div><div className="stat-label">Active Projects</div></div>
                </div>
                <div className="preview-chart">
                  {[60, 40, 80, 50, 70, 30, 90].map((height, i) => (
                    <div key={i} className="chart-bar" style={{ height: `${height}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="features-container">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2>Everything You Need</h2>
            <p>Comprehensive tools to streamline your construction projects</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div key={index} className="feature-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ y: -8 }}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-section" id="stats">
        <div className="stats-container">
          <div className="section-header">
            <span className="section-badge">Statistics</span>
            <h2>Trusted by Professionals</h2>
            <p>Real numbers from real users who trust BuildTrack</p>
          </div>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div key={index} className="stat-card" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: index * 0.1 }}>
                <div className="stat-value-large">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo"><Building2 size={32} /><span>Build<span>Track</span></span></div>
              <p>Streamlining construction management for professionals.</p>
              <div className="footer-social">
                <a href="#"><Twitter size={20} /></a>
                <a href="#"><Github size={20} /></a>
                <a href="#"><Youtube size={20} /></a>
              </div>
            </div>
            <div><h4>Product</h4><a href="#features">Features</a><a href="#">Pricing</a><a href="#">Integrations</a></div>
            <div><h4>Company</h4><a href="#">About</a><a href="#">Blog</a><a href="#">Careers</a></div>
            <div><h4>Support</h4><a href="#">Help Center</a><a href="#">Documentation</a><a href="#">API</a></div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 BuildTrack. All rights reserved.</p>
            <div><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
