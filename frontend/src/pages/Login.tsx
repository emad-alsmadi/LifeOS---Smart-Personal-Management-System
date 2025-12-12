import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, ArrowLeft, LogIn } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { login } from '../lib/api/api';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setGeneralError('');

    try {
      const response = await login(formData.email, formData.password);
      console.log('Login successful:', response);

      // Update auth context
      authLogin(response.token, response.user);

      // Redirect based on role
      if (response.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setGeneralError(
        error instanceof Error
          ? error.message
          : 'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  return (
    <div className='layout-corporate flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center mb-8'
        >
          <Link
            to='/'
            className='inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-all duration-300 mb-6 group'
          >
            <motion.div
              whileHover={{ x: -3 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowLeft className='w-4 h-4 group-hover:text-primary-600' />
            </motion.div>
            <span className='font-medium group-hover:text-primary-600'>
              Back to Home
            </span>
          </Link>

          <div className='flex items-center justify-center space-x-3 mb-6'>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className='p-3 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg'
            >
              <Target className='w-7 h-7 text-white' />
            </motion.div>
            <span className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
              LifeOS
            </span>
          </div>

          <h1 className='text-3xl font-bold text-text-primary mb-2'>
            Welcome Back
          </h1>
          <p className='text-text-muted'>Continue your journey to success</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className='p-8'>
            {generalError && (
              <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md'>
                <p className='text-red-600 text-sm'>{generalError}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className='space-y-6'
            >
              <Input
                label='Email Address'
                name='email'
                type='email'
                placeholder='Enter your email'
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
              />

              <Input
                label='Password'
                name='password'
                type='password'
                placeholder='Enter your password'
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
              />

              <div className='flex items-center justify-between'>
                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    className='rounded border-gray-300 text-primary-600 focus:ring-primary-500'
                  />
                  <span className='ml-2 text-sm text-gray-600'>
                    Remember me
                  </span>
                </label>
                <Link
                  to='/forgot-password'
                  className='text-sm text-primary-600 hover:text-primary-700'
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type='submit'
                className='w-full'
                size='lg'
                disabled={isLoading}
              >
                <LogIn className='w-5 h-5 mr-2' />
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className='mt-6 text-center'>
              <p className='text-text-muted'>
                Don't have an account?{' '}
                <Link
                  to='/register'
                  className='text-primary-600 hover:text-primary-700 font-medium'
                >
                  Create one
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Additional Options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='mt-8 text-center'
        >
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-background text-text-muted'>
                New to LifeOS?
              </span>
            </div>
          </div>
          <div className='mt-4'>
            <Link to='/register'>
              <Button
                variant='outline'
                className='w-full'
              >
                Create Your Free Account
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
