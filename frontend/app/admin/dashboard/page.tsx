'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  TrendingUp, 
  Shield, 
  ArrowLeft,
  RefreshCw,
  Activity,
  UserCheck,
  Clock,
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config';

interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalClinics: number;
  totalPatients: number;
  totalAppointments: number;
  pendingAppointments: number;
  bookedAppointments: number;
  rejectedAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  recentAppointments: any[];
  topDoctors: any[];
  clinicsSummary?: { id: number; name: string; city?: string; country?: string; doctorsCount: number }[];
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, isAuthenticated, isAdmin, isSuperAdmin, loading } = useAuth();
  const { addToast } = useToast();

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch(buildApiUrl(API_ENDPOINTS.adminStats), {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
        if (isRefresh) {
          addToast({
            type: 'success',
            title: 'Data Refreshed',
            message: 'Dashboard data has been updated successfully.',
          });
        }
      } else {
        throw new Error('Failed to fetch dashboard data');
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
    if (isAuthenticated && (isAdmin || isSuperAdmin)) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isAdmin, isSuperAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-[#4B5563] font-medium">Checking your access...</p>
        </div>
      </div>
    );
  }

  // Remove access denied page; keep loader and rely on API guards

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center space-x-2 text-[#0E6BA8] hover:text-[#0B5A8A] mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-3 heading-font">
                {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
              </h1>
              <p className="text-xl text-[#4B5563]">
                Welcome back, {user?.name || 'Admin'}. Here's an overview of your healthcare platform.
              </p>
            </div>
            <div className="flex space-x-3 mt-6 md:mt-0">
              <button
                onClick={() => fetchDashboardData(true)}
                disabled={isRefreshing}
                className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <Link href="/admin/doctors" className="btn-primary flex items-center space-x-2">
                <Stethoscope className="w-4 h-4" />
                <span>Manage Doctors</span>
              </Link>
              <Link href="/admin/users" className="btn-secondary flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>View Users</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-[#4B5563] font-medium">Loading dashboard data...</p>
            </div>
          </motion.div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-hover"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#4B5563] font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-[#1F2937]">{stats.totalUsers}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-hover"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#4B5563] font-medium">Total Doctors</p>
                    <p className="text-2xl font-bold text-[#1F2937]">{stats.totalDoctors}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-hover"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#4B5563] font-medium">Total Appointments</p>
                    <p className="text-2xl font-bold text-[#1F2937]">{stats.totalAppointments}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card-hover"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#ECFDF5] rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#16A34A]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#4B5563] font-medium">Clinics</p>
                    <p className="text-2xl font-bold text-[#1F2937]">{stats.totalClinics}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Appointment Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card-hover"
              >
                <h3 className="text-xl font-semibold text-[#1F2937] mb-4 heading-font">Appointment Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[#FFFBEB] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-[#F59E0B]" />
                      <span className="text-[#1F2937] font-medium">Pending</span>
                    </div>
                    <span className="text-2xl font-bold text-[#F59E0B]">{stats.pendingAppointments}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#ECFDF5] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <UserCheck className="w-5 h-5 text-[#16A34A]" />
                      <span className="text-[#1F2937] font-medium">Completed</span>
                    </div>
                    <span className="text-2xl font-bold text-[#16A34A]">{stats.completedAppointments}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#EFF6FF] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-[#2563EB]" />
                      <span className="text-[#1F2937] font-medium">Booked</span>
                    </div>
                    <span className="text-2xl font-bold text-[#2563EB]">{stats.bookedAppointments}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#FEF2F2] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-[#DC2626]" />
                      <span className="text-[#1F2937] font-medium">Rejected</span>
                    </div>
                    <span className="text-2xl font-bold text-[#DC2626]">{stats.rejectedAppointments}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="card-hover"
              >
                <h3 className="text-xl font-semibold text-[#1F2937] mb-4 heading-font">Top Performing Doctors</h3>
                {stats.topDoctors && stats.topDoctors.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topDoctors.slice(0, 5).map((doctor: any, index: number) => (
                      <div key={doctor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-[#1F2937]">{doctor.name}</p>
                            <p className="text-sm text-[#4B5563]">{doctor.specialty}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#0E6BA8]">{doctor.appointmentCount}</p>
                          <p className="text-xs text-[#4B5563]">appointments</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No data yet</div>
                )}
              </motion.div>
            </div>

            {/* Clinics Summary + Recent Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="card-hover">
                <h3 className="text-xl font-semibold text-[#1F2937] mb-6 heading-font">Clinics Summary</h3>
                <div className="space-y-3">
                  {stats.clinicsSummary?.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-[#1F2937]">{c.name}</p>
                        <p className="text-sm text-[#4B5563]">{c.city}{c.country ? `, ${c.country}` : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#0E6BA8]">{c.doctorsCount}</p>
                        <p className="text-xs text-[#4B5563]">doctors</p>
                      </div>
                    </div>
                  ))}
                  {(!stats.clinicsSummary || stats.clinicsSummary.length === 0) && (
                    <div className="text-sm text-gray-500">No clinics to show</div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="card-hover"
              >
                <h3 className="text-xl font-semibold text-[#1F2937] mb-6 heading-font">Recent Appointments</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-[#1F2937]">Patient</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#1F2937]">Doctor</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#1F2937]">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#1F2937]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentAppointments?.map((appointment: any) => (
                        <tr key={appointment.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 gradient-secondary rounded-full flex items-center justify-center">
                                <UserCheck className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-medium text-[#1F2937]">{appointment.patientName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#4B5563]">{appointment.doctorName}</td>
                          <td className="py-3 px-4 text-[#4B5563]">
                            {new Date(appointment.dateTime).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'COMPLETED' 
                                ? 'bg-[#ECFDF5] text-[#065F46]' 
                                : appointment.status === 'PENDING'
                                ? 'bg-[#FFFBEB] text-[#92400E]'
                                : appointment.status === 'BOOKED'
                                ? 'bg-[#EFF6FF] text-[#1E3A8A]'
                                : 'bg-[#FEF2F2] text-[#991B1B]'
                            }`}>
                              {appointment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-hover text-center py-12"
          >
            <Activity className="w-16 h-16 text-[#9CA3AF] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1F2937] mb-2">No Data Available</h3>
            <p className="text-[#4B5563]">Dashboard data is not available at the moment.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;


