import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-md">
        <ShieldOff className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Unauthorized</h1>
        <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
        <Link to="/dashboard" className="text-primary-600 hover:underline font-medium">Back to Action Zone</Link>
      </div>
    </div>
  );
};

export default Unauthorized; 