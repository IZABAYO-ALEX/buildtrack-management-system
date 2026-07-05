import React from 'react';
import { useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

const FormInput = ({ 
  name, 
  label, 
  type = 'text', 
  placeholder, 
  required = false,
  icon: Icon,
  options = [],
  rows = 3,
  disabled = false,
  className = ''
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className={`form-input-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}
      
      <div className="form-input-wrapper">
        {Icon && <Icon className="form-input-icon" size={18} />}
        
        {type === 'textarea' ? (
          <textarea
            id={name}
            className={`form-textarea ${error ? 'form-error' : ''}`}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            {...register(name)}
          />
        ) : type === 'select' ? (
          <select
            id={name}
            className={`form-select ${error ? 'form-error' : ''}`}
            disabled={disabled}
            {...register(name)}
          >
            <option value="">Select...</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'date' ? (
          <input
            id={name}
            type="date"
            className={`form-input ${error ? 'form-error' : ''}`}
            placeholder={placeholder}
            disabled={disabled}
            {...register(name)}
          />
        ) : (
          <input
            id={name}
            type={type}
            className={`form-input ${error ? 'form-error' : ''}`}
            placeholder={placeholder}
            disabled={disabled}
            {...register(name)}
          />
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="form-error-message"
          >
            {error.message}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormInput;
