import React from 'react';
import { motion } from 'framer-motion';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex space-x-1 mb-1">
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`h-2 flex-1 rounded-full ${
              index < strength ? strengthColors[Math.min(strength - 1, 4)] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        Password strength: <span className="font-medium">{strengthLabels[Math.min(strength - 1, 4)] || 'Very Weak'}</span>
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;