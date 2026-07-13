import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  Briefcase,
  HardHat,
  Calculator,
  AlertCircle,
  Shield,
  LogIn,
  Loader2
} from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading: authLoading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let timer;
    if (isLocked && lockTimer > 0) {
      timer = setInterval(() => {
        setLockTimer(prev => prev - 1);
      }, 1000);
    } else if (lockTimer === 0 && isLocked) {
      setIsLocked(false);
      setAttempts(0);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockTimer]);

  const roles = [
    { 
      id: 'contractor', 
      name: 'Contractor', 
      icon: <Briefcase size={22} />, 
      color: '#6366F1',
      bgColor: '#EEF2FF'
    },
    { 
      id: 'site_manager', 
      name: 'Site Manager', 
      icon: <HardHat size={22} />, 
      color: '#F59E0B',
      bgColor: '#FFFBEB'
    },
    { 
      id: 'accountant', 
      name: 'Accountant', 
      icon: <Calculator size={22} />, 
      color: '#10B981',
      bgColor: '#ECFDF5'
    }
  ];

  const fillDemoCredentials = (role) => {
    const credentials = {
      contractor: { email: '', password: '' },
      site_manager: { email: '', password: '' },
      accountant: { email: '', password: '' }
    };
    const cred = credentials[role];
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.password);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      setError(`Too many failed attempts. Please wait ${lockTimer} seconds.`);
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login(email.trim(), password);
      
      if (result.success && result.user) {
        setAttempts(0);
        const roleMap = {
          contractor: '/dashboard/contractor',
          site_manager: '/dashboard/site-manager',
          accountant: '/dashboard/accountant'
        };
        const dashboardPath = roleMap[result.user.role] || '/dashboard';
        navigate(dashboardPath, { replace: true });
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          setIsLocked(true);
          setLockTimer(60);
          setError('Too many failed attempts. Please wait 60 seconds.');
        } else {
          setError(result.error || 'Invalid email or password');
        }
      }
    } catch (err) {
      setError('Unable to connect to server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <motion.div 
          className="login-grid"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Left Panel - Brand Section */}
          <motion.div 
            className="login-brand-panel"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="brand-content">
              <div className="brand-logo">
                <img src="/logo.svg" alt="BuildTrack" className="brand-logo-img" />
                <span className="brand-name">Build<span>Track</span></span>
              </div>
              
              <h1 className="brand-title">
                Construction Management<br />
                <span className="brand-highlight">Reimagined</span>
              </h1>
              
              <p className="brand-description">
                Streamline your construction projects, track expenses, 
                manage workforce, and make data-driven decisions.
              </p>

              <div className="brand-features">
                {[
                  'Real-time project tracking',
                  'Role-based access control',
                  'Comprehensive reporting',
                  'Automated notifications'
                ].map((feature, i) => (
                  <div key={i} className="feature-item">
                    <CheckCircle size={18} color="#10B981" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="brand-testimonial">
                <div className="testimonial-avatars">
                  <div className="avatar">JM</div>
                  <div className="avatar">SN</div>
                  <div className="avatar">PO</div>
                  <div className="avatar-more">+2K</div>
                </div>
                <div className="testimonial-text">
                  <p>Trusted by 2,000+ professionals</p>
                  <div className="stars">★★★★★</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Login Form */}
          <motion.div 
            className="login-form-panel"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="form-content">
              <div className="form-header">
                <h2>Welcome Back</h2>
                <p>Sign in to continue managing your projects</p>
              </div>

              <div className="role-selector">
                <p className="role-selector-label">Quick Access</p>
                <div className="role-buttons">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      className="role-btn"
                      onClick={() => fillDemoCredentials(role.id)}
                      style={{ 
                        borderColor: focusedField === role.id ? role.color : '#e2e8f0',
                        background: focusedField === role.id ? role.bgColor : 'transparent'
                      }}
                      onMouseEnter={() => setFocusedField(role.id)}
                      onMouseLeave={() => setFocusedField(null)}
                    >
                      <div className="role-icon" style={{ color: role.color }}>
                        {role.icon}
                      </div>
                      <span className="role-name">{role.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="error-message"
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                  >
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {isLocked && (
                <div className="lock-message">
                  <Shield size={18} />
                  <span>Account locked for {lockTimer}s</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Enter your email" 
                      required 
                      disabled={isLocked}
                      autoFocus
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Enter your password" 
                      required 
                      disabled={isLocked}
                    />
                    <button 
                      type="button" 
                      className="toggle-password" 
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLocked}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                      disabled={isLocked}
                    />
                    <span className="checkbox-custom"></span>
                    Remember me
                  </label>
                  <Link to="/forgot-password" className="forgot-link">
                    Forgot password?
                  </Link>
                </div>

                <button 
                  type="submit" 
                  className={`login-btn ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading || isLocked || authLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="spinning" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <LogIn size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="login-divider">
                <span>Or continue with</span>
              </div>

              <button type="button" className="social-btn">
                <img src="/google.svg" alt="Google" />
                Sign in with Google
              </button>

              <div className="signup-section">
                <p className="signup-text">
                  Don't have an account? <Link to="/signup" className="signup-link">Create account</Link>
                </p>
              </div>

              <div className="security-badge">
                <Shield size={12} />
                <span>buildtrack the future of construction management</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
