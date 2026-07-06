import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  Briefcase,
  HardHat,
  Calculator
} from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { id: 'contractor', name: 'Contractor', icon: <Briefcase size={24} />, description: 'Manage projects & users', color: '#6366F1' },
    { id: 'site_manager', name: 'Site Manager', icon: <HardHat size={24} />, description: 'Track daily operations', color: '#F59E0B' },
    { id: 'accountant', name: 'Accountant', icon: <Calculator size={24} />, description: 'Review expenses & reports', color: '#10B981' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (result.success && result.user) {
        const roleMap = {
          contractor: '/dashboard/contractor',
          site_manager: '/dashboard/site-manager',
          accountant: '/dashboard/accountant'
        };
        const dashboardPath = roleMap[result.user.role] || '/dashboard';
        navigate(dashboardPath, { replace: true });
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please make sure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-grid">
        <motion.div 
          className="login-brand" 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <div className="brand-content">
            <div className="brand-logo">
              <Building2 size={40} color="#6366F1" />
              <span>Build<span>Track</span></span>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to continue managing your construction projects</p>
            <div className="brand-features">
              <div><CheckCircle size={18} color="#10B981" /><span>Real-time project tracking</span></div>
              <div><CheckCircle size={18} color="#10B981" /><span>Role-based access control</span></div>
              <div><CheckCircle size={18} color="#10B981" /><span>Comprehensive reporting</span></div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="login-form-wrapper" 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="login-form">
            <h2>Sign In</h2>
            <p className="form-subtitle">Enter your credentials to access your dashboard</p>

            <div className="login-hint">
              <p><strong>🔐 Secure Login</strong></p>
              <p>Only users created by the Contractor can access the system</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
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
                  />
                  <button 
                    type="button" 
                    className="toggle-password" 
                    onClick={() => setShowPassword(!showPassword)}
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
                  />
                  <span className="checkbox-custom"></span>
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? <span className="spinner"></span> : <>Sign In <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="login-divider"><span>Or continue with</span></div>
            <button type="button" className="social-btn"><img src="/google.svg" alt="Google" />Sign in with Google</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
