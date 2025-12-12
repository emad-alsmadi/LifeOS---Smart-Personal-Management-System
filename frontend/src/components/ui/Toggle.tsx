import React from 'react';
import { motion } from 'framer-motion';

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
  leftLabel: string;
  rightLabel: string;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({ 
  isOn, 
  onToggle, 
  leftLabel, 
  rightLabel, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium transition-colors duration-200 ${!isOn ? 'text-primary-700' : 'text-gray-500'}`}>{leftLabel}</span>
        <button
          onClick={onToggle}
          className="relative w-14 h-8 rounded-full bg-gray-200 transition-colors duration-300 focus:outline-none border border-gray-300 shadow-inner"
          aria-pressed={isOn}
          type="button"
        >
          <motion.div
            className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transition-colors duration-300 ${isOn ? 'bg-primary-500' : 'bg-white border border-gray-300'}`}
            animate={{ x: isOn ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ boxShadow: isOn ? '0 2px 8px 0 rgba(37,99,235,0.15)' : '0 1px 4px 0 rgba(0,0,0,0.08)' }}
          />
        </button>
        <span className={`text-sm font-medium transition-colors duration-200 ${isOn ? 'text-primary-700' : 'text-gray-500'}`}>{rightLabel}</span>
      </div>
    </div>
  );
};

export default Toggle; 