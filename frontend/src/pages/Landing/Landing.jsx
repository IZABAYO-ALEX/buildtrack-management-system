import React, { useState } from 'react';
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
  Briefcase,
  HardHat,
  Calculator,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Play,
} from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { id: 'contractor', name: 'Contractor', icon: <Briefcase size={28} />, description: 'Manage multiple projects and monitor profitability', color: '#6366F1' },
    { id: 'site_manager', name: 'Site Manager', icon: <HardHat size={28} />, description: 'Track daily expenses, attendance, and materials', color: '#F59E0B' },
    { id: 'accountant', name: 'Accountant', icon: <Calculator size={28} />, description: 'Review expenses and generate financial reports', color: '#10B981' }
  ];

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/dashboard/${selectedRole || 'site_manager'}`);
    }, 1500);
  };

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
            <a href="#stats">statistics</a>
            <a href="#about">about us </a>
            <a hrcdef="#blog">blog</a>
            <a href="#notifications">notifications</a>
        
      

          </div>
          <div className="nav-actions">
            <button className="btn-login" onClick={() => setShowLoginModal(true)}>Sign In</button>
            <button className="btn-primary" onClick={() => setShowLoginModal(true)}>
              Get Started <ArrowRight size={18} />
            </button>
            <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-container">
          <motion.div className="hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="hero-badge"><Sparkles size={16} /><span>Better and Reliable Construction Management</span></div>
            <h1 className="hero-title">Build Smarter Efficiently <br /><span className="gradient-text">Track Better</span></h1>
            <p className="hero-description">Streamline your construction projects, track expenses, manage workforce, and make data-driven decisions.</p>
            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={() => setShowLoginModal(true)}>
                Get Started Free <Rocket size={25} />
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
            
              
            </div>
          </motion.div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="features-container">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2> EVERYTHING YOU NEED</h2>
            <p>Comprehensive tools to streamline your construction projects </p>
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
                <p></p>
              </div>
            </div>
            <div><h4>Product</h4><a href="#features">Features</a><a href="#">Pricing</a><a href="#">Integrations</a></div>
            <div><h4>Company</h4><a href="#">About</a><a href="#">Blog</a><a href="#">Careers</a></div>
            <div><h4>Support</h4><a href="#">Help Center</a><a href="#">Documentation</a><a href="#">API</a></div>
          </div>
          <div className="footer-bottom">
            <p>&copy; @2026 BuildTrack. All rights reserved.</p>
            <div><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div>
          </div>
        </div>
      </footer>

      {showLoginModal && (
        <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <motion.div className="login-modal" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLoginModal(false)}><X size={24} /></button>
            <div className="login-modal-content">
              <div className="login-left">
                <div className="login-brand-mini"><Building2 size={32} /><span>Build<span>Track</span></span></div>
                <h2>Welcome Back</h2>
                <p>Sign in to continue managing your projects</p>
                <div className="role-selector">
                  <p className="role-label">Select your role</p>
                  {roles.map((role) => (
                    <button key={role.id} className={`role-option ${selectedRole === role.id ? 'active' : ''}`} onClick={() => setSelectedRole(role.id)} style={{ borderColor: selectedRole === role.id ? role.color : '#e2e8f0', background: selectedRole === role.id ? `${role.color}10` : 'transparent' }}>
                      <div className="role-icon" style={{ color: role.color }}>{role.icon}</div>
                      <div className="role-info"><span className="role-name">{role.name}</span><span className="role-desc">{role.description}</span></div>
                      {selectedRole === role.id && <CheckCircle size={20} color={role.color} />}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-wrapper"><Mail size={18} className="input-icon" /><input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                  </div>
                  <div className="form-options">
                    <label className="checkbox-label"><input type="checkbox" /><span className="checkbox-custom"></span>Remember me</label>
                    <a href="#" className="forgot-link">Forgot password?</a>
                  </div>
                  <button type="submit" className="btn-login-submit" disabled={isLoading}>
                    {isLoading ? <span className="loading-spinner"></span> : <>Sign In <ArrowRight size={18} /></>}
                  </button>
                </form>
                <p className="signup-prompt">Don't have an account? <a href="#">Create one now</a></p>
              </div>
              <div className="login-right">
                <div className="login-illustration">
                  <Building2 size={64} color="#6366F1" />
                  <h3>Manage Your Projects</h3>
                  <p>Track expenses, manage workforce, and monitor materials</p>
                  <div><CheckCircle size={16} color="#10B981" /><span>Real-time tracking</span></div>
                  <div><CheckCircle size={16} color="#10B981" /><span>Automated reporting</span></div>
                  <div><CheckCircle size={16} color="#10B981" /><span>Role-based access</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Landing;
