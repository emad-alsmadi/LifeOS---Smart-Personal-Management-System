import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, Users, UserCheck, UserX, Crown, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Trash2, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated. Please log in.');
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) throw new Error('Unauthorized. Please log in as admin.');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (user: User, newRole: string) => {
    setActionLoading(user._id);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      await fetchUsers();
    } catch (err) {
      alert('Error updating user role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActiveToggle = async (user: User) => {
    setActionLoading(user._id);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      await fetchUsers();
    } catch (err) {
      alert('Error updating user status');
    } finally {
      setActionLoading(null);
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleDelete = async () => {
    if (!userToDelete) return;
    setActionLoading(userToDelete._id);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/users/${userToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete user');
      await fetchUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      alert('Error deleting user');
    } finally {
      setActionLoading(null);
    }
  };



  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Enhanced Admin Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3 px-4 flex items-center justify-between shadow-2xl relative overflow-hidden flex-shrink-0"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-blue-100 text-xs mt-1">Manage users and system settings</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <Crown className="w-5 h-5 text-yellow-300" />
            <span className="text-white font-semibold text-sm">{user?.name}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition-all duration-200 backdrop-blur-sm shadow-lg"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Enhanced Content Area */}
      <div className="flex-1 p-2 overflow-auto">
        <div className="w-full h-full">
          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4"
          >
            <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900">{users.length}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Active Users</p>
                  <p className="text-2xl font-bold text-green-900">{users.filter(u => u.isActive).length}</p>
                </div>
                <div className="p-3 bg-green-500 rounded-xl">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Admins</p>
                  <p className="text-2xl font-bold text-purple-900">{users.filter(u => u.role === 'admin').length}</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-xl">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Inactive Users</p>
                  <p className="text-2xl font-bold text-orange-900">{users.filter(u => !u.isActive).length}</p>
                </div>
                <div className="p-3 bg-orange-500 rounded-xl">
                  <UserX className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Enhanced Users Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-0 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden h-full">
              <div className="p-4 lg:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg lg:text-xl font-bold text-gray-900">User Management</h2>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            {loading ? (
              <div className="flex items-center justify-center py-8 h-64">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <p className="text-lg text-gray-600 font-medium">Loading users...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 h-64">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-red-600 mb-2">Error Loading Users</p>
                    <p className="text-gray-600">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto h-full">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                      <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                      <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                      <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 max-h-screen">
                    <AnimatePresence>
                      {users.map((user, index) => (
                        <motion.tr 
                          key={user._id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-3 lg:px-6 py-3 lg:py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                  <span className="text-sm font-semibold text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 lg:px-6 py-3 lg:py-4">
                            <div className="flex items-center">
                              <select
                                value={user.role}
                                disabled={actionLoading === user._id}
                                onChange={e => handleRoleChange(user, e.target.value)}
                                className="rounded-lg border-gray-300 px-3 py-2 text-sm bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                              {user.role === 'admin' && (
                                <Crown className="w-4 h-4 text-yellow-500 ml-2" />
                              )}
                            </div>
                          </td>
                          <td className="px-3 lg:px-6 py-3 lg:py-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleActiveToggle(user)}
                              disabled={actionLoading === user._id}
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                                user.isActive 
                                  ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                              }`}
                            >
                              {user.isActive ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3" />
                                  Inactive
                                </>
                              )}
                            </motion.button>
                          </td>
                          <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-3 lg:px-6 py-3 lg:py-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setUserToDelete(user);
                                setDeleteDialogOpen(true);
                              }}
                              disabled={actionLoading === user._id}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </Card>
            </motion.div>
        </div>
      </div>


    {/* Enhanced Delete Confirmation Dialog */}
    <AnimatePresence>
      {deleteDialogOpen && userToDelete && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
                      <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 relative overflow-hidden"
            >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 opacity-50"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-red-100 rounded-full mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Delete User</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                    {userToDelete.name}
                  </span>
                  ? This action cannot be undone.
                </p>
                
                {/* User Info Card */}
                <div className="w-full bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {userToDelete.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">{userToDelete.name}</p>
                      <p className="text-sm text-gray-500">{userToDelete.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {userToDelete.role === 'admin' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                      {userToDelete.isActive ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteDialogOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  disabled={actionLoading === userToDelete._id}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg disabled:opacity-50"
                >
                  {actionLoading === userToDelete._id ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete User'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
