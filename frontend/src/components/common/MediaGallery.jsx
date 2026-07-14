import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, Image, Video, FileText, X, Eye, 
  CheckCircle, Clock, Grid, List, Trash2,
  Download, RefreshCw, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './MediaGallery.css';

const MediaGallery = ({ projectId }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, [projectId]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/media?projectId=${projectId}`);
      setMedia(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const type = file.type.startsWith('image/') ? 'image' : 
                 file.type.startsWith('video/') ? 'video' : 'document';

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('type', type);
    formData.append('title', file.name);

    try {
      await api.post('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Media uploaded successfully!');
      fetchMedia();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/media/${id}/approve`);
      toast.success('Media approved!');
      fetchMedia();
    } catch (error) {
      toast.error('Failed to approve media');
    }
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image': return <Image size={24} />;
      case 'video': return <Video size={24} />;
      case 'receipt': return <FileText size={24} />;
      default: return <FileText size={24} />;
    }
  };

  return (
    <div className="media-gallery">
      <div className="media-header">
        <div className="media-actions">
          <button className="btn-primary upload-btn">
            <Upload size={18} />
            Upload Media
            <input
              type="file"
              onChange={handleUpload}
              accept="image/*,video/*,.pdf,.doc,.docx"
              disabled={uploading}
            />
          </button>
          <button className="btn-outline" onClick={fetchMedia}>
            <RefreshCw size={18} />
          </button>
        </div>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={18} />
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading media...</p>
        </div>
      ) : media.length === 0 ? (
        <div className="empty-state">
          <Image size={48} />
          <h3>No media uploaded</h3>
          <p>Upload photos, videos, receipts, and documents</p>
        </div>
      ) : (
        <div className={`media-grid ${viewMode}`}>
          {media.map((item, index) => (
            <motion.div
              key={item.id}
              className="media-item"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="media-preview">
                {item.type === 'image' ? (
                  <img src={`${import.meta.env.VITE_API_URL}${item.url}`} alt={item.title} />
                ) : item.type === 'video' ? (
                  <video src={`${import.meta.env.VITE_API_URL}${item.url}`} />
                ) : (
                  <div className="document-icon">
                    {getMediaIcon(item.type)}
                    <span className="file-name">{item.title}</span>
                  </div>
                )}
                <div className="media-overlay">
                  <a 
                    href={`${import.meta.env.VITE_API_URL}${item.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-btn"
                  >
                    <Eye size={20} />
                  </a>
                  {!item.isApproved && (
                    <button 
                      className="approve-btn"
                      onClick={() => handleApprove(item.id)}
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                </div>
              </div>
              <div className="media-info">
                <div className="media-title">{item.title}</div>
                <div className="media-meta">
                  <span className="media-type">{item.type}</span>
                  <span className={`approval-status ${item.isApproved ? 'approved' : 'pending'}`}>
                    {item.isApproved ? '✅ Approved' : '⏳ Pending'}
                  </span>
                </div>
                <div className="media-uploader">
                  By: {item.uploader?.fullName || 'Unknown'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
