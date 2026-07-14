import React, { useState, useRef } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ImageUpload = ({ onUpload, multiple = false, maxFiles = 5, accept = 'image/*' }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (!multiple && files.length > 1) {
      toast.error('Please select only one image');
      return;
    }

    if (multiple && files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append(multiple ? 'images' : 'image', file));

    try {
      const endpoint = multiple ? '/upload/multiple' : '/upload/single';
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const uploadedImages = multiple ? response.data.data : [response.data.data];
      setImages(prev => [...prev, ...uploadedImages]);
      
      if (onUpload) {
        onUpload(uploadedImages);
      }
      
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="image-upload-container">
      <div className="image-upload-area" onClick={() => fileInputRef.current?.click()}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <div className="upload-loading">
            <div className="loading-spinner-sm"></div>
            <span>Uploading...</span>
          </div>
        ) : (
          <div className="upload-placeholder">
            <Camera size={32} />
            <span>Click to upload {multiple ? 'images' : 'image'}</span>
            <small>{multiple ? `Max ${maxFiles} files` : 'Single file'}</small>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((img, index) => (
            <div key={index} className="image-preview-item">
              <img src={`${import.meta.env.VITE_API_URL}${img.url}`} alt={`Upload ${index}`} />
              <button className="remove-image-btn" onClick={() => removeImage(index)}>
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
