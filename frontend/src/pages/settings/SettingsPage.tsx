import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { changePassword, updateUserProfile } from '../../lib/api/api';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {}
  );
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {}
  );
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const { user, updateUser } = useAuth();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
  ];

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (passwordSuccess) {
      setPasswordSuccess('');
    }
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};

    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters long';
    }

    if (!passwordForm.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    setIsChangingPassword(true);
    setPasswordSuccess('');

    try {
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Password change failed:', error);
      setPasswordErrors({
        currentPassword:
          error instanceof Error ? error.message : 'Failed to change password',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Profile update handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (profileSuccess) {
      setProfileSuccess('');
    }
  };

  const validateProfileForm = () => {
    const errors: Record<string, string> = {};

    if (!profileForm.name.trim()) {
      errors.name = 'Name is required';
    } else if (profileForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) return;

    setIsUpdatingProfile(true);
    setProfileSuccess('');

    try {
      await updateUserProfile(profileForm.name.trim());
      setProfileSuccess('Profile updated successfully!');
      setIsEditingName(false);
      // Update the user context with new name
      if (updateUser) {
        updateUser({ ...user, name: profileForm.name.trim() });
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      setProfileErrors({
        name:
          error instanceof Error ? error.message : 'Failed to update profile',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const startEditingName = () => {
    setProfileForm({ name: user?.name || '' });
    setIsEditingName(true);
    setProfileErrors({});
    setProfileSuccess('');
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setProfileForm({ name: '' });
    setProfileErrors({});
  };

  return (
    <>
      {/* page content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='space-y-6'
        >
          {/* Header */}
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Settings</h1>
            <p className='mt-2 text-gray-600'>
              Manage your account settings and preferences.
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
            {/* Sidebar */}
            <div className='lg:col-span-1'>
              <Card className='p-4'>
                <nav className='space-y-1'>
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className='w-5 h-5' />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </Card>
            </div>

            {/* Content */}
            <div className='lg:col-span-3'>
              <Card className='p-6'>
                {activeTab === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className='space-y-6'
                  >
                    <div>
                      <h3 className='text-lg font-medium text-gray-900 mb-4'>
                        Profile Information
                      </h3>

                      <div className='space-y-6'>
                        {/* Name Section */}
                        <div className='space-y-4'>
                          <div className='flex items-center justify-between'>
                            <label className='block text-sm font-medium text-gray-700'>
                              Full Name
                            </label>
                            {!isEditingName && (
                              <Button
                                onClick={startEditingName}
                                variant='outline'
                                size='sm'
                                className='text-primary-600 hover:text-primary-700'
                              >
                                Edit
                              </Button>
                            )}
                          </div>

                          {isEditingName ? (
                            <form
                              onSubmit={handleProfileSubmit}
                              className='space-y-4'
                            >
                              <Input
                                label=''
                                name='name'
                                type='text'
                                placeholder='Enter your full name'
                                value={profileForm.name}
                                onChange={handleProfileChange}
                                error={profileErrors.name}
                                className='max-w-md'
                              />
                              <div className='flex items-center gap-3'>
                                <Button
                                  type='submit'
                                  loading={isUpdatingProfile}
                                  disabled={isUpdatingProfile}
                                  size='sm'
                                >
                                  Save
                                </Button>
                                <Button
                                  type='button'
                                  variant='outline'
                                  onClick={cancelEditingName}
                                  size='sm'
                                >
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200'>
                              <User className='w-5 h-5 text-gray-400' />
                              <span className='text-gray-900 font-medium'>
                                {user?.name || 'Not provided'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Email Section (Read-only) */}
                        <div className='space-y-2'>
                          <label className='block text-sm font-medium text-gray-700'>
                            Email
                          </label>
                          <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200'>
                            <Mail className='w-5 h-5 text-gray-400' />
                            <span className='text-gray-900 font-medium'>
                              {user?.email || 'Not provided'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {profileSuccess && (
                        <div className='p-3 bg-green-50 border border-green-200 rounded-md'>
                          <p className='text-green-600 text-sm'>
                            {profileSuccess}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'privacy' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className='space-y-6'
                  >
                    <div>
                      <h3 className='text-lg font-medium text-gray-900 mb-4'>
                        Privacy & Security
                      </h3>

                      <form
                        onSubmit={handlePasswordSubmit}
                        className='space-y-6'
                      >
                        <div>
                          <h4 className='font-medium text-gray-900 mb-2'>
                            Password
                          </h4>
                          <div className='space-y-3'>
                            <Input
                              label='Current Password'
                              name='currentPassword'
                              type='password'
                              placeholder='Enter current password'
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordChange}
                              error={passwordErrors.currentPassword}
                            />
                            <Input
                              label='New Password'
                              name='newPassword'
                              type='password'
                              placeholder='Enter new password'
                              value={passwordForm.newPassword}
                              onChange={handlePasswordChange}
                              error={passwordErrors.newPassword}
                            />
                            <Input
                              label='Confirm New Password'
                              name='confirmPassword'
                              type='password'
                              placeholder='Confirm new password'
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordChange}
                              error={passwordErrors.confirmPassword}
                            />
                          </div>
                        </div>

                        {passwordSuccess && (
                          <div className='p-3 bg-green-50 border border-green-200 rounded-md'>
                            <p className='text-green-600 text-sm'>
                              {passwordSuccess}
                            </p>
                          </div>
                        )}

                        <div className='flex justify-end'>
                          <Button
                            type='submit'
                            loading={isChangingPassword}
                            disabled={isChangingPassword}
                          >
                            Change Password
                          </Button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SettingsPage;
