'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Search, 
  Filter,
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS, buildApiUrl } from '@/lib/config';
import { useToast } from '@/components/ui/Toaster';
import Link from 'next/link';

interface Application {
  id: number;
  name: string;
  email: string;
  phone?: string;
  specialty: string;
  location: string;
  experienceYears?: number;
  credentials?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  generatedPassword?: string | null;
}

const AdminDoctorsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  const { addToast } = useToast();

  const fetchApplications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch(buildApiUrl(API_ENDPOINTS.adminApplications), { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        if (isRefresh) {
          addToast({
            type: 'success',
            title: 'Data Refreshed',
            message: 'Applications data has been updated successfully.',
          });
        }
      } else {
        setApplications([]);
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Load Applications',
        message: 'Unable to fetch doctor applications. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (isAdmin || isSuperAdmin)) {
      fetchApplications();
    }
  }, [isAuthenticated, isAdmin, isSuperAdmin]);

  const approve = async (id: number) => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.approveApplication(String(id))), { method: 'POST', credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'APPROVED', generatedPassword: data.password } : a));
        addToast({
          type: 'success',
          title: 'Doctor Approved',
          message: 'Doctor account created. Password shown below.',
        });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Approval Failed',
        message: error.message || 'Failed to approve doctor. Please try again.',
      });
    }
  };

  const reject = async (id: number) => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.rejectApplication(String(id))), { method: 'POST', credentials: 'include' });
      if (response.ok) {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'REJECTED' } : a));
        addToast({ type: 'success', title: 'Application Rejected', message: 'The application has been rejected.' });
      } else {
        throw new Error('Failed to reject');
      }
    } catch (error: any) {
      addToast({ type: 'error', title: 'Reject Failed', message: error.message || 'Failed to reject application.' });
    }
  };

  const getStatusColor = (status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!isAuthenticated || !(isAdmin || isSuperAdmin)) {
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
                Doctor Applications
              </h1>
              <p className="text-xl text-gray-600">
                Review, approve or reject doctor applications
              </p>
            </div>
            <div />
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
                <option value="all">All Applications</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <button
                onClick={() => fetchApplications(true)}
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
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full md:w-64"
              />
            </div>
          </div>
        </motion.div>

        {/* Applications List */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading doctors...</p>
            </div>
          </motion.div>
        ) : filteredApplications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Doctors Found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "No applications found."
                : `No ${filter.toLowerCase()} applications found.`
              }
            </p>
            <div />
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {filteredApplications.map((app, index) => (
              <motion.div
                key={app.id}
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
                          {app.name}
                        </h3>
                        <p className="text-gray-600 mb-2">{app.specialty}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{app.email}</span>
                          </div>
                          {app.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{app.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(app.status as any)}`}>
                        <span>{app.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="text-sm text-gray-600">Location: {app.location}</div>
                      {typeof app.experienceYears === 'number' && (
                        <div className="text-sm text-gray-600">Experience: {app.experienceYears} years</div>
                      )}
                      {app.credentials && (
                        <div className="text-sm text-gray-600">Credentials: {app.credentials}</div>
                      )}
                    </div>
                    {app.status === 'APPROVED' && app.generatedPassword && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-sm">
                        Temporary password: <span className="font-mono font-semibold">{app.generatedPassword}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <button onClick={() => approve(app.id)} disabled={app.status !== 'PENDING'} className="btn-primary text-sm flex items-center space-x-1 disabled:opacity-50">
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button onClick={() => reject(app.id)} disabled={app.status !== 'PENDING'} className="btn-danger text-sm flex items-center space-x-1 disabled:opacity-50">
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDoctorsPage;


