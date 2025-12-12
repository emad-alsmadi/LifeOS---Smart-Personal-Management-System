import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@app/providers';
import AppLayout from '../../../layouts/AuthLayout';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className='layout-corporate flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500'></div>
      </div>
    );
  }

  if (!isAuthenticated)
    return (
      <Navigate
        to='/login'
        replace
      />
    );
  if (user?.role !== 'admin')
    return (
      <Navigate
        to='/unauthorized'
        replace
      />
    );

  return <AppLayout>{children}</AppLayout>;
};

export default AdminRoute;
