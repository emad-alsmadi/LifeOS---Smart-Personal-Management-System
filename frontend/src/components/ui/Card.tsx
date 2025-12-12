import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', elevated = false }) => {
  const cardClasses = elevated ? 'card-corporate-elevated' : 'card-corporate';
  
  return (
    <motion.div
      className={`${cardClasses} ${className}`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;