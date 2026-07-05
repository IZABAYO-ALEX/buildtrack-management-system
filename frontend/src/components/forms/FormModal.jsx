import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const FormModal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  children,
  onSubmit,
  onCancel,
  isLoading = false,
  submitText = 'Submit',
  cancelText = 'Cancel',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="form-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`form-modal ${sizeClasses[size]}`}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="form-modal-header">
              <div className="form-modal-title">
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
              </div>
              <button className="form-modal-close" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-modal-body">
              {children}

              <div className="form-modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onCancel || onClose}
                  disabled={isLoading}
                >
                  {cancelText}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading-spinner-sm"></span>
                  ) : (
                    submitText
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FormModal;
