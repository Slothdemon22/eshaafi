'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter,
  ArrowLeft,
  Mail,
  User,
  Shield,
  Edit,
  Trash2,
  Calendar,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'PATIENT' | 'DOCTOR' | 'ADMIN'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { addToast } = useToast();

  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch('http://localhost:5000/api/users/getUsers', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        if (isRefresh) {
          addToast({
            type: 'success',
            title: 'Data Refreshed',
            message: 'Users data has been updated successfully.',
          });
        }
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      addToast({
        type: 'error',
        title: 'Failed to Load Users',
        message: 'Unable to fetch users. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin]);

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DOCTOR':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PATIENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4" />;
      case 'DOCTOR':
        return <User className="w-4 h-4" />;
      case 'PATIENT':
        return <Users className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditing(false); // Ensure not stuck in editing state
  };

  const handleUpdateUser = async (updatedData: Partial<User>) => {
    if (!editingUser) return;
    setIsEditing(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(prev => prev.map(u => u.id === editingUser.id ? data.user : u));
        addToast({
          type: 'success',
          title: 'User Updated',
          message: 'User has been updated successfully.',
        });
        setEditingUser(null); // Close modal after update
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update user. Please try again.',
      });
    } finally {
      setIsEditing(false); // Always reset editing state
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:5000/api/users/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        addToast({
          type: 'success',
          title: 'User Deleted',
          message: 'User has been deleted successfully.',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete user. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center medical-gradient">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be logged in as an admin to access this page.</p>
          <Link href="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen medical-gradient py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/admin/dashboard" className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Manage Users
              </h1>
              <p className="text-xl text-gray-600">
                View and manage all registered users on the platform
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="input-field w-auto"
              >
                <option value="all">All Users</option>
                <option value="PATIENT">Patients</option>
                <option value="DOCTOR">Doctors</option>
                <option value="ADMIN">Admins</option>
              </select>
              <button
                onClick={() => fetchUsers(true)}
                disabled={isRefreshing}
                className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full md:w-64"
              />
            </div>
          </div>
        </motion.div>

        {/* Users List */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          </motion.div>
        ) : filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "No users have been registered yet."
                : `No ${filter.toLowerCase()} users found.`
              }
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {user.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span>{user.role}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>User ID: {user.id}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        disabled={isEditing || isDeleting}
                        className="btn-secondary text-sm flex items-center space-x-1 disabled:opacity-50"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={isEditing || isDeleting}
                        className="btn-danger text-sm flex items-center space-x-1 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'PATIENT').length}
              </div>
              <div className="text-sm text-gray-600">Patients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === 'DOCTOR').length}
              </div>
              <div className="text-sm text-gray-600">Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'ADMIN').length}
              </div>
              <div className="text-sm text-gray-600">Admins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {users.length}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateUser({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                role: formData.get('role') as 'PATIENT' | 'DOCTOR' | 'ADMIN'
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={editingUser.name}
                    required
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={editingUser.email}
                    required
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    defaultValue={editingUser.role}
                    required
                    className="input-field w-full"
                  >
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  disabled={isEditing}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {isEditing ? 'Updating...' : 'Update User'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  disabled={isEditing}
                  className="btn-secondary flex-1 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;


