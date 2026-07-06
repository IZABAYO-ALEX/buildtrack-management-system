import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Award,
  Star
} from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
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
    { icon: <Layers size={24} />, title: 'Project Management', description: 'Create and manage multiple construction projects with real-time tracking' },
    { icon: <DollarSign size={24} />, title: 'Expense Tracking', description: 'Record and categorize all project expenses with receipt management' },
    { icon: <Users size={24} />, title: 'Workforce Management', description: 'Track worker attendance, payments, and performance analytics' },
    { icon: <Shield size={24} />, title: 'Secure Platform', description: 'Enterprise-grade security with role-based access control' }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'John Mukasa',
      role: 'Construction Director',
      company: 'Mukasa Construction Ltd',
      quote: 'BuildTrack has completely transformed how we manage our projects.',
      rating: 5,
      avatar: 'JM'
    },
    {
      id: 2,
      name: 'Sarah Nakato',
      role: 'Site Manager',
      company: 'Nakato Builders',
      quote: 'The workforce management features have saved us countless hours.',
      rating: 5,
      avatar: 'SN'
    },
    {
      id: 3,
      name: 'Peter Odongo',
      role: 'Accountant',
      company: 'Odongo & Associates',
      quote: 'The reporting capabilities are outstanding. Reports in seconds!',
      rating: 5,
      avatar: 'PO'
    }
  ];

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <img src="/logo-small.svg" alt="BuildTrack" className="nav-logo-img" />
            <span className="logo-text">Build<span>Track</span></span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#about">About</a>
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

      {/* Hero Section */}
      <section className="hero-section-construction">
        <div className="hero-overlay-construction">
          <div className="hero-container-construction">
            <motion.div 
              className="hero-content-construction"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="hero-badge-construction">
                <Sparkles size={16} />
                <span>🚀 Premier Construction Management Platform</span>
              </div>
              
              <h1 className="hero-title-construction">
                Build Smarter,<br />
                <span className="gradient-text-construction">Track Better</span>
              </h1>
              
              <p className="hero-description-construction">
                Streamline your construction projects, track expenses, manage workforce, 
                and make data-driven decisions with BuildTrack.
              </p>

              <div className="hero-buttons-construction">
                <button className="btn-hero-primary-construction" onClick={() => navigate('/login')}>
                  Start Free Trial <Rocket size={20} />
                </button>
                <button className="btn-hero-secondary-construction">
                  <Play size={20} /> Watch Demo
                </button>
              </div>

              <div className="hero-trust-construction">
                <div className="trust-avatars-construction">
                  <div className="avatar-construction">JM</div>
                  <div className="avatar-construction">SN</div>
                  <div className="avatar-construction">PO</div>
                  <div className="avatar-more-construction">+2K</div>
                </div>
                <p>Trusted by 2,000+ construction professionals</p>
              </div>
            </motion.div>

            <motion.div 
              className="hero-image-construction"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className="hero-image-wrapper-construction">
                <img 
                  src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=600&fit=crop&crop=center"
                  alt="Construction building in progress"
                  className="hero-image-construction-img"
                />
                <div className="hero-image-overlay-construction">
                  <div className="overlay-content-construction">
                    <h3>Building Tomorrow's Landmarks</h3>
                    <p>Real Estate Development & Construction Management</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section-construction" id="features">
        <div className="features-container-construction">
          <div className="section-header-construction">
            <span className="section-badge-construction">Features</span>
            <h2>Everything You Need</h2>
            <p>Comprehensive tools for successful project delivery</p>
          </div>
          <div className="features-grid-construction">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card-construction"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="feature-icon-construction">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section-construction" id="testimonials">
        <div className="testimonials-container-construction">
          <div className="section-header-construction">
            <span className="section-badge-construction">Testimonials</span>
            <h2>What Our Users Say</h2>
            <p>Hear from construction professionals using BuildTrack daily</p>
          </div>
          <div className="testimonials-grid-construction">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                className="testimonial-card-construction"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -4 }}
              >
                <div className="testimonial-rating-construction">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <div className="testimonial-quote-construction">"{testimonial.quote}"</div>
                <div className="testimonial-author-construction">
                  <div className="testimonial-avatar-construction">{testimonial.avatar}</div>
                  <div>
                    <div className="testimonial-name-construction">{testimonial.name}</div>
                    <div className="testimonial-role-construction">{testimonial.role}</div>
                    <div className="testimonial-company-construction">{testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-construction">
        <div className="cta-container-construction">
          <motion.div
            className="cta-content-construction"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2>Ready to Transform Your Construction Management?</h2>
            <p>Join thousands of construction professionals who trust BuildTrack</p>
            <button className="btn-cta-construction" onClick={() => navigate('/login')}>
              Start Free Trial <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer-construction">
        <div className="footer-container-construction">
          <div className="footer-grid-construction">
            <div className="footer-brand-construction">
              <div className="footer-logo-construction">
                <img src="/logo-small.svg" alt="BuildTrack" className="footer-logo-img" />
                <span>Build<span>Track</span></span>
              </div>
              <p>Streamlining construction management for professionals across Africa.</p>
              <div className="footer-social-construction">
                <a href="#"><Twitter size={20} /></a>
                <a href="#"><Linkedin size={20} /></a>
                <a href="#"><Github size={20} /></a>
                <a href="#"><Youtube size={20} /></a>
              </div>
            </div>
            <div className="footer-links-construction">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Integrations</a>
            </div>
            <div className="footer-links-construction">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
            </div>
            <div className="footer-links-construction">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Documentation</a>
              <a href="#">API</a>
            </div>
          </div>
          <div className="footer-bottom-construction">
            <p>&copy; 2026 BuildTrack. All rights reserved.</p>
            <div className="footer-legal-construction">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
