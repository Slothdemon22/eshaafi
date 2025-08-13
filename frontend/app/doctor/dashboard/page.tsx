'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  MessageSquare, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Users,
  Star,
  Phone,
  Mail,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import Link from 'next/link';

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  date: string;
  time: string;
  reason: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  symptoms?: string;
}

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  todayAppointments: number;
  averageRating: number;
  totalPatients: number;
}

const DoctorDashboardPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    todayAppointments: 0,
    averageRating: 4.8,
    totalPatients: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'>('all');
  const { user, isAuthenticated, isDoctor } = useAuth();
  const { addToast } = useToast();

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      // Fetch appointments
      const appointmentsResponse = await fetch('http://localhost:5000/api/doctor/appointments', {
        credentials: 'include'
      });

      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        const transformedAppointments: Appointment[] = appointmentsData.appointments.map((apt: any) => ({
          id: apt.id.toString(),
          patientName: apt.patient?.name || 'Unknown Patient',
          patientEmail: apt.patient?.email || 'No email',
          date: new Date(apt.dateTime).toISOString().split('T')[0],
          time: new Date(apt.dateTime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          reason: apt.reason || 'No reason provided',
          status: apt.status,
          symptoms: apt.symptoms
        }));
        setAppointments(transformedAppointments);
        
        // Calculate stats from appointments
        const totalAppointments = transformedAppointments.length;
        const pendingAppointments = transformedAppointments.filter(apt => apt.status === 'PENDING').length;
        const completedAppointments = transformedAppointments.filter(apt => apt.status === 'COMPLETED').length;
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = transformedAppointments.filter(apt => apt.date === today).length;
        const uniquePatients = new Set(transformedAppointments.map(apt => apt.patientEmail)).size;
        
        setStats({
          totalAppointments,
          pendingAppointments,
          completedAppointments,
          todayAppointments,
          averageRating: 4.8, // This would come from a rating system
          totalPatients: uniquePatients
        });

        if (isRefresh) {
          addToast({
            type: 'success',
            title: 'Data Refreshed',
            message: 'Dashboard data has been updated successfully.',
          });
        }
      } else {
        throw new Error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      addToast({
        type: 'error',
        title: 'Failed to Load Dashboard',
        message: 'Unable to fetch dashboard data. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isDoctor) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isDoctor]);

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      // API call to change appointment status
      const response = await fetch('/api/bookings/changeBookingStatus', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }

      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: newStatus }
            : apt
        )
      );

      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Appointment status has been updated to ${newStatus.toLowerCase()}.`,
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update appointment status. Please try again.',
      });
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="w-4 h-4" />;
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredAppointments = appointments.filter(appointment => 
    filter === 'all' || appointment.status === filter
  );

  if (!isAuthenticated || !isDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center medical-gradient">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be logged in as a doctor to access this page.</p>
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
          <Link href="/" className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Doctor Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Welcome back, Dr. {user?.name}. Here's your practice overview.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rating and Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid lg:grid-cols-3 gap-8 mb-8"
        >
          {/* Rating Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Patient Rating
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.averageRating}</div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < Math.floor(stats.averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">Based on patient reviews</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => fetchDashboardData(true)}
                disabled={isRefreshing}
                className="btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
              </button>
              <Link href="/doctor/availability" className="btn-secondary flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Manage Availability</span>
              </Link>
              <Link href="/doctor/appointments" className="btn-primary flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>View All Appointments</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Recent Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
              Recent Appointments
            </h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input-field w-auto"
            >
              <option value="all">All Appointments</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Loading appointments...</p>
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You don't have any appointments yet."
                  : `No ${filter.toLowerCase()} appointments found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{appointment.patientName}</h4>
                          <p className="text-sm text-gray-600">{appointment.patientEmail}</p>
                        </div>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span>{appointment.status}</span>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">
                            {new Date(appointment.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">{appointment.time}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Reason:</span> {appointment.reason}
                        </p>
                        {appointment.symptoms && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-wrap gap-2">
                      {appointment.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'CONFIRMED')}
                            className="btn-primary text-sm"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'CANCELLED')}
                            className="btn-danger text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      
                      {appointment.status === 'CONFIRMED' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'COMPLETED')}
                            className="btn-primary text-sm"
                          >
                            Mark Complete
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'CANCELLED')}
                            className="btn-secondary text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
