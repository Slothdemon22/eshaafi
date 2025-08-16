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
  Plus,
  Filter,
  Search,
  RefreshCw,
  Pill,
  Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import Link from 'next/link';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config';

interface Prescription {
  id: number;
  medications: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  reason: string;
  status: 'PENDING' | 'BOOKED' | 'REJECTED' | 'COMPLETED';
  symptoms?: string;
  prescription?: Prescription;
  rejectionReason?: string; // Add this field
}

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'BOOKED' | 'REJECTED' | 'COMPLETED'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // Fetch appointments from API
  const fetchAppointments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.userAppointments), {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend data to frontend format
        const transformedAppointments: Appointment[] = data.appointments.map((apt: any) => ({
          id: apt.id.toString(),
          doctorName: apt.doctor?.user?.name || 'Unknown Doctor',
          doctorSpecialization: apt.doctor?.specialty || 'General',
          date: new Date(apt.dateTime).toISOString().split('T')[0],
          time: new Date(apt.dateTime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          reason: apt.reason || 'No reason provided',
          status: apt.status,
          symptoms: apt.symptoms,
          prescription: apt.prescription,
          rejectionReason: apt.rejectionReason // Map this field
        }));
        setAppointments(transformedAppointments);
        
        if (isRefresh) {
          addToast({
            type: 'success',
            title: 'Data Refreshed',
            message: 'Appointments data has been updated successfully.',
          });
        }
      } else {
        throw new Error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      addToast({
        type: 'error',
        title: 'Failed to Load Appointments',
        message: 'Unable to fetch your appointments. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      // API call to cancel appointment
      const response = await fetch(buildApiUrl(API_ENDPOINTS.deleteBooking(appointmentId)), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'REJECTED' as const }
            : apt
        )
      );

      addToast({
        type: 'success',
        title: 'Appointment Cancelled',
        message: 'Your appointment has been successfully cancelled.',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: error.message || 'Failed to cancel appointment. Please try again.',
      });
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-[#FFFBEB] text-[#92400E] border-[#F59E0B]/20';
      case 'BOOKED':
        return 'bg-[#ECFDF5] text-[#065F46] border-[#16A34A]/20';
      case 'REJECTED':
        return 'bg-[#FEF2F2] text-[#991B1B] border-[#DC2626]/20';
      case 'COMPLETED':
        return 'bg-[#EFF6FF] text-[#1E40AF] border-[#0284C7]/20';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="w-4 h-4" />;
      case 'BOOKED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusMessage = (status: Appointment['status']) => {
    switch (status) {
      case 'PENDING':
        return 'Waiting for doctor approval';
      case 'BOOKED':
        return 'Appointment confirmed by doctor';
      case 'REJECTED':
        return 'Appointment was rejected or cancelled';
      case 'COMPLETED':
        return 'Appointment completed';
      default:
        return '';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const matchesSearch = appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elevated">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#1F2937] mb-4 heading-font">Authentication Required</h2>
          <p className="text-[#4B5563] mb-8 text-lg">Please log in to view your appointments.</p>
          <Link href="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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
                My Appointments
              </h1>
              <p className="text-xl text-[#4B5563]">
                Manage and track your healthcare appointments
              </p>
            </div>
            <Link href="/book-appointment" className="btn-primary mt-6 md:mt-0 flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Book New Appointment</span>
            </Link>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-hover mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[#4B5563]" />
                <span className="text-sm font-semibold text-[#1F2937]">Filter:</span>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="input-field w-auto"
              >
                <option value="all">All Appointments</option>
                <option value="PENDING">Pending</option>
                <option value="BOOKED">Booked</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <button
                onClick={() => fetchAppointments(true)}
                disabled={isRefreshing}
                className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12 w-full md:w-64"
              />
            </div>
          </div>
        </motion.div>

        {/* Appointments List */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-[#4B5563] font-medium">Loading your appointments...</p>
            </div>
          </motion.div>
        ) : filteredAppointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-hover text-center py-16"
          >
            <div className="w-20 h-20 gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-[#1F2937] mb-3 heading-font">No Appointments Found</h3>
            <p className="text-[#4B5563] mb-8 text-lg">
              {filter === 'all' 
                ? "You don't have any appointments yet."
                : `No ${filter.toLowerCase()} appointments found.`
              }
            </p>
            <Link href="/book-appointment" className="btn-primary">
              Book Your First Appointment
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {filteredAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-hover"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-semibold text-[#1F2937] mb-2 heading-font">
                          {appointment.doctorName}
                        </h3>
                        <p className="text-[#4B5563] text-lg">{appointment.doctorSpecialization}</p>
                      </div>
                      <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span>{appointment.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-[#4B5563] font-medium">Date</p>
                          <p className="font-semibold text-[#1F2937] text-lg">
                            {new Date(appointment.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-[#4B5563] font-medium">Time</p>
                          <p className="font-semibold text-[#1F2937] text-lg">{appointment.time}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-[#4B5563] font-medium mb-1">Reason for Visit</p>
                          <p className="text-[#1F2937] text-lg">{appointment.reason}</p>
                        </div>
                      </div>
                      
                      {appointment.symptoms && (
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-[#FEF2F2] rounded-xl flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-[#DC2626]" />
                          </div>
                          <div>
                            <p className="text-sm text-[#4B5563] font-medium mb-1">Symptoms</p>
                            <p className="text-[#1F2937] text-lg">{appointment.symptoms}</p>
                          </div>
                        </div>
                      )}

                      {appointment.prescription && (
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-[#ECFDF5] rounded-xl flex items-center justify-center flex-shrink-0">
                            <Pill className="w-5 h-5 text-[#16A34A]" />
                          </div>
                          <div>
                            <p className="text-sm text-[#4B5563] font-medium mb-1">Prescription</p>
                            <p className="text-[#1F2937] text-lg">
                              {appointment.prescription.medications} - {appointment.prescription.dosage}
                            </p>
                            <p className="text-[#4B5563]">
                              {appointment.prescription.frequency} for {appointment.prescription.duration}
                            </p>
                            {appointment.prescription.notes && (
                              <p className="text-[#4B5563] mt-2">
                                <span className="font-medium">Notes:</span> {appointment.prescription.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-8 lg:mt-0 lg:ml-8 flex flex-col space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-[#4B5563] mb-2">{getStatusMessage(appointment.status)}</p>
                    </div>
                    
                    {appointment.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="btn-danger"
                      >
                        Cancel Appointment
                      </button>
                    )}
                    
                    {appointment.status === 'BOOKED' && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    )}
                    
                    {appointment.status === 'COMPLETED' && (
                      <div className="text-center">
                        <p className="text-sm text-[#0284C7] font-semibold">Completed</p>
                        {appointment.prescription && (
                          <p className="text-xs text-[#16A34A] mt-1 font-medium">Prescription available</p>
                        )}
                      </div>
                    )}
                    
                    {appointment.status === 'REJECTED' && (
                      <div className="text-center">
                        <p className="text-sm text-[#DC2626] font-semibold">Rejected/Cancelled</p>
                      </div>
                    )}
                    {appointment.status === 'REJECTED' && appointment.rejectionReason && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-700 font-semibold">Rejection Reason:</p>
                        <p className="text-sm text-red-700">{appointment.rejectionReason}</p>
                      </div>
                    )}
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

export default AppointmentsPage;
