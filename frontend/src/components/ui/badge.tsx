import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
  className?: string;
  onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className = '',
  onClick 
}) => {
  const baseClasses = 'badge-corporate';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'badge-corporate-primary',
    secondary: 'bg-gray-100 text-gray-700',
    success: 'badge-corporate-success',
    warning: 'badge-corporate-warning',
    destructive: 'badge-corporate-error',
    outline: 'bg-transparent border border-border text-text-primary',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`;

  if (onClick) {
    return (
      <button onClick={onClick} className={classes}>
        {children}
      </button>
    );
  }

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export { Badge };