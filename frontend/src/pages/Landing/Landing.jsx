import React, { useEffect } from 'react';
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
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Award,
  TrendingUp,
  HardHat,
  Calculator,
  FileText,
  Star,
  Quote,
  Clock,
  Briefcase,
  Home,
  Globe,
  MessageSquare,
  Zap,
  Target,
  Eye
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
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

  const constructionImages = [
    {
      url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1400&h=600&fit=crop&crop=center',
      alt: 'Large construction building in progress - high rise building with cranes',
      title: 'High-Rise Construction'
    },
    {
      url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=400&fit=crop&crop=center',
      alt: 'Construction workers on site with building structure',
      title: 'Active Construction Site'
    },
    {
      url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop&crop=center',
      alt: 'Modern building construction with scaffolding',
      title: 'Modern Building Project'
    },
    {
      url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=400&fit=crop&crop=center',
      alt: 'Construction site with building structure and cranes',
      title: 'Urban Development'
    }
  ];

  const features = [
    { 
      icon: <Building2 size={24} />, 
      title: 'Project Management', 
      description: 'Create and manage multiple construction projects with real-time tracking and milestone monitoring.' 
    },
    { 
      icon: <DollarSign size={24} />, 
      title: 'Expense Tracking', 
      description: 'Record and categorize all project expenses with automated budget calculations and receipt management.' 
    },
    { 
      icon: <Users size={24} />, 
      title: 'Workforce Management', 
      description: 'Track worker attendance, payments, performance analytics, and daily site operations.' 
    },
    { 
      icon: <HardHat size={24} />, 
      title: 'Site Management', 
      description: 'Monitor daily site activities, material usage, and progress with real-time updates and reporting.' 
    },
    { 
      icon: <BarChart3 size={24} />, 
      title: 'Advanced Reporting', 
      description: 'Generate comprehensive financial, operational, and performance reports with interactive dashboards.' 
    },
    { 
      icon: <Shield size={24} />, 
      title: 'Secure Platform', 
      description: 'Enterprise-grade security with role-based access control, audit trails, and data encryption.' 
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'John Mukasa',
      role: 'Construction Director',
      company: 'Mukasa Construction Ltd',
      quote: 'BuildTrack has revolutionized how we manage our construction projects. The real-time tracking and reporting capabilities are exceptional.',
      rating: 5,
      avatar: 'JM'
    },
    {
      id: 2,
      name: 'Sarah Nakato',
      role: 'Site Manager',
      company: 'Nakato Builders',
      quote: 'The workforce management features have saved us countless hours. Tracking attendance and payments has never been easier.',
      rating: 5,
      avatar: 'SN'
    },
    {
      id: 3,
      name: 'Peter Odongo',
      role: 'Accountant',
      company: 'Odongo & Associates',
      quote: 'The financial reporting capabilities are outstanding. I can generate comprehensive reports in seconds, making decision-making effortless.',
      rating: 5,
      avatar: 'PO'
    }
  ];

  const blogPosts = [
    {
      id: 1,
      title: '10 Essential Tips for Managing Large Construction Projects',
      excerpt: 'Learn the best practices for managing multi-million dollar construction projects efficiently and successfully.',
      date: 'June 28, 2026',
      category: 'Project Management',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=400&fit=crop&crop=center'
    },
    {
      id: 2,
      title: 'The Future of Construction Technology in Uganda',
      excerpt: 'How AI, IoT, and digital twins are transforming the construction industry in East Africa.',
      date: 'June 25, 2026',
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=400&fit=crop&crop=center'
    },
    {
      id: 3,
      title: 'Sustainable Building Practices for African Construction',
      excerpt: 'Exploring green building techniques and sustainable materials for the African construction industry.',
      date: 'June 22, 2026',
      category: 'Sustainability',
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=400&fit=crop&crop=center'
    }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <Building2 size={32} className="logo-icon" />
            <span className="logo-text">Build<span>Track</span></span>
          </div>
          <div className="nav-links">
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
            <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }}>Testimonials</a>
            <a href="#blog" onClick={(e) => { e.preventDefault(); scrollToSection('blog'); }}>Blog</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
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

      {/* Hero Section with Construction Image */}
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
                Building Africa's<br />
                <span className="gradient-text-construction">Future, One Project</span><br />
                <span className="gradient-text-construction">at a Time</span>
              </h1>
              
              <p className="hero-description-construction">
                Transform your construction projects with BuildTrack's comprehensive management platform. 
                From planning to completion, we help you build smarter, faster, and better.
              </p>

              <div className="hero-buttons-construction">
                <button className="btn-hero-primary-construction" onClick={() => navigate('/login')}>
                  Start Free Trial <Rocket size={20} />
                </button>
                <button className="btn-hero-secondary-construction">
                  <Play size={20} /> Watch Demo
                </button>
              </div>

              <div className="hero-stats-construction">
                <div className="stat-item-construction">
                  <span className="stat-number-construction">50+</span>
                  <span className="stat-label-construction">Active Projects</span>
                </div>
                <div className="stat-divider-construction"></div>
                <div className="stat-item-construction">
                  <span className="stat-number-construction">2,000+</span>
                  <span className="stat-label-construction">Workers Managed</span>
                </div>
                <div className="stat-divider-construction"></div>
                <div className="stat-item-construction">
                  <span className="stat-number-construction">$5M+</span>
                  <span className="stat-label-construction">Budget Tracked</span>
                </div>
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
                  src={constructionImages[0].url}
                  alt={constructionImages[0].alt}
                  className="hero-image-construction-img"
                />
                <div className="hero-image-overlay-construction">
                  <div className="overlay-content-construction">
                    <h3>Building Tomorrow's Landmarks</h3>
                    <p>Real Estate Development & Construction Management</p>
                    <div className="overlay-tags-construction">
                      <span>🏗️ High-Rise Buildings</span>
                      <span>🏢 Commercial Projects</span>
                      <span>🏠 Residential Development</span>
                    </div>
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
            <h2>Everything You Need to Manage Construction</h2>
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
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="testimonial-card-construction"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
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

      {/* Blog Section */}
      <section className="blog-section-construction" id="blog">
        <div className="blog-container-construction">
          <div className="section-header-construction">
            <span className="section-badge-construction">Blog</span>
            <h2>Latest Insights & Updates</h2>
            <p>Expert advice and industry news for construction professionals</p>
          </div>
          <div className="blog-grid-construction">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                className="blog-card-construction"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="blog-image-construction">
                  <img src={post.image} alt={post.title} />
                  <span className="blog-category-construction">{post.category}</span>
                </div>
                <div className="blog-content-construction">
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="blog-meta-construction">
                    <span className="blog-date-construction">{post.date}</span>
                    <button className="blog-read-more-construction">Read More →</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section-construction" id="about">
        <div className="about-container-construction">
          <div className="about-grid-construction">
            <motion.div 
              className="about-content-construction"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-badge-construction">About Us</span>
              <h2>Building Africa's Future</h2>
              <p>
                BuildTrack is a comprehensive construction management platform designed 
                specifically for the African construction industry. We understand the unique 
                challenges of construction in the region and provide tools to help you succeed.
              </p>
              <div className="about-features-construction">
                <div className="about-feature-construction">
                  <CheckCircle size={20} color="#10b981" />
                  <span>Local expertise with global standards</span>
                </div>
                <div className="about-feature-construction">
                  <CheckCircle size={20} color="#10b981" />
                  <span>Supporting African construction professionals</span>
                </div>
                <div className="about-feature-construction">
                  <CheckCircle size={20} color="#10b981" />
                  <span>Transforming the construction industry</span>
                </div>
                <div className="about-feature-construction">
                  <CheckCircle size={20} color="#10b981" />
                  <span>Empowering site managers and contractors</span>
                </div>
              </div>
              <div className="about-contact-construction">
                <div className="contact-item-construction">
                  <Mail size={18} />
                  <span>info@buildtrack.com</span>
                </div>
                <div className="contact-item-construction">
                  <Phone size={18} />
                  <span>+256 701 234 567</span>
                </div>
                <div className="contact-item-construction">
                  <MapPin size={18} />
                  <span>Kampala, Uganda</span>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="about-image-construction"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=500&fit=crop&crop=center"
                alt="Construction site in Uganda"
              />
              <div className="about-image-overlay-construction">
                <h4>Since 2024</h4>
                <p>Trusted by leading contractors in Africa</p>
              </div>
            </motion.div>
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
            <p>Join thousands of construction professionals who trust BuildTrack to manage their projects efficiently</p>
            <button className="btn-cta-construction" onClick={() => navigate('/login')}>
              Start Free Trial
              <ArrowRight size={20} />
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
                <Building2 size={32} className="logo-icon" />
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
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
              <a href="#">Pricing</a>
              <a href="#">Integrations</a>
              <a href="#">Changelog</a>
            </div>
            <div className="footer-links-construction">
              <h4>Company</h4>
              <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
              <a href="#blog" onClick={(e) => { e.preventDefault(); scrollToSection('blog'); }}>Blog</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-links-construction">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Documentation</a>
              <a href="#">API</a>
              <a href="#">Status</a>
            </div>
          </div>
          <div className="footer-bottom-construction">
            <p>&copy; 2026 BuildTrack. All rights reserved.</p>
            <div className="footer-legal-construction">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
