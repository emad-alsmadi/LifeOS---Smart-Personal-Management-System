import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, ArrowLeft, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import PasswordStrengthIndicator from '../components/ui/PasswordStrengthIndicator';
import { signup } from '../lib/api/api';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await signup(
        formData.fullName,
        formData.email,
        formData.password
      );
      console.log('Registration successful:', response);

      // Update auth context
      authLogin(response.token, response.user);

      // Redirect to Action Zone
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      setGeneralError(
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.'
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
    <div className='min-h-screen flex items-center justify-center p-4'>
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

          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Create Your Account
          </h1>
          <p className='text-gray-600'>
            Start your journey to a more organized life
          </p>
        </motion.div>

        {/* Registration Form */}
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
                label='Full Name'
                name='fullName'
                type='text'
                placeholder='Enter your full name'
                value={formData.fullName}
                onChange={handleInputChange}
                error={errors.fullName}
                className='pl-10'
              />

              <Input
                label='Email Address'
                name='email'
                type='email'
                placeholder='Enter your email'
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                className='pl-10'
              />

              <div>
                <Input
                  label='Password'
                  name='password'
                  type='password'
                  placeholder='Create a password'
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  showPasswordToggle
                  className='pl-10'
                />
                <PasswordStrengthIndicator password={formData.password} />
              </div>

              <Input
                label='Confirm Password'
                name='confirmPassword'
                type='password'
                placeholder='Confirm your password'
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                showPasswordToggle
                className='pl-10'
              />

              <Button
                type='submit'
                className='w-full'
                size='lg'
                loading={isLoading}
              >
                <UserPlus className='w-5 h-5 mr-2' />
                Create Account
              </Button>
            </form>

            <div className='mt-6 text-center'>
              <p className='text-gray-600'>
                Already have an account?{' '}
                <Link
                  to='/login'
                  className='text-primary-600 hover:text-primary-700 font-medium'
                >
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='mt-8 text-center text-sm text-gray-500'
        >
          <p>🔒 Your data is encrypted and secure</p>
          <p className='mt-1'>✨ Free to use • No credit card required</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
