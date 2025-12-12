import React from 'react';
import { motion } from 'framer-motion';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  accept?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  name,
  id,
  required = false,
  disabled = false,
  error,
  className = '',
  accept,
}) => {
  const inputId = id || name;

  return (
    <div className={`form-corporate-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-corporate-label">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
        <motion.input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        accept={accept}
        className={`input-corporate ${error ? 'input-corporate-error' : ''}`}
          whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="form-corporate-error"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;