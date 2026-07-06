import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import './Blog.css';

const Blog = () => {
  const navigate = useNavigate();

  const posts = [
    {
      id: 1,
      title: '10 Tips for Managing Large Construction Projects',
      excerpt: 'Managing large construction projects requires careful planning, effective communication, and the right tools.',
      date: 'June 28, 2026',
      author: 'John Mukasa',
      category: 'Project Management',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=400&fit=crop'
    },
    {
      id: 2,
      title: 'The Future of Construction Technology',
      excerpt: 'AI, IoT, and digital twins are revolutionizing the construction industry.',
      date: 'June 25, 2026',
      author: 'Sarah Nakato',
      category: 'Technology',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=400&fit=crop'
    },
    {
      id: 3,
      title: 'Sustainable Building Practices in Uganda',
      excerpt: 'As Uganda\'s construction industry grows, sustainable building practices are becoming increasingly important.',
      date: 'June 22, 2026',
      author: 'Peter Odongo',
      category: 'Sustainability',
      readTime: '3 min read',
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=400&fit=crop'
    }
  ];

  return (
    <DashboardLayout userRole="contractor">
      <div className="blog-page">
        <div className="blog-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1>📝 BuildTrack Blog</h1>
          <p>Insights, updates, and expert advice for construction professionals</p>
        </div>

        <div className="blog-posts-grid">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              className="blog-post-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="post-image">
                <img src={post.image} alt={post.title} />
                <span className="post-category">{post.category}</span>
              </div>
              <div className="post-content">
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
                <div className="post-meta">
                  <span><Calendar size={14} /> {post.date}</span>
                  <span><User size={14} /> {post.author}</span>
                  <span><Clock size={14} /> {post.readTime}</span>
                </div>
                <button className="read-more-btn">Read More →</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Blog;
