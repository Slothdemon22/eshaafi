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
  Heart,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import Link from 'next/link';
import { buildApiUrl, API_ENDPOINTS, formatTimeAMPM } from '@/lib/config';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import ReviewModal from '@/components/ReviewModal';

const VideoCall = dynamic(() => import('@/components/VideoCall'), { ssr: false });

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
  type?: string;
  videoRoomId?: string;
  slotDuration?: number; // 30 or 60
  followUpOf?: {
    id: number;
    doctorName: string;
    doctorSpecialization: string;
    date: string;
    time: string;
  };
  followUps?: Array<{
    id: number;
    doctorName: string;
    doctorSpecialization: string;
    date: string;
    time: string;
  }>;
  review?: {
    id: number;
    behaviourRating: number;
    recommendationRating: number;
    reviewText?: string;
  };
  doctorId?: number;
}

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'BOOKED' | 'REJECTED' | 'COMPLETED'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [durationFilter, setDurationFilter] = useState<'all' | 'half' | 'full'>('all');
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    doctorId: number;
    doctorName: string;
    appointmentId: number;
  }>({
    isOpen: false,
    doctorId: 0,
    doctorName: '',
    appointmentId: 0
  });
  const { user, isAuthenticated, loading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

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
            hour12: true 
          }),
          reason: apt.reason || 'No reason provided',
          status: apt.status,
          symptoms: apt.symptoms,
          prescription: apt.prescription,
          rejectionReason: apt.rejectionReason,
          type: apt.type,
          videoRoomId: apt.videoRoomId,
          slotDuration: apt.slotDuration,
          doctorId: apt.doctor?.id,
          followUpOf: apt.followUpOf ? {
            id: apt.followUpOf.id,
            doctorName: apt.followUpOf.doctor?.user?.name || 'Unknown Doctor',
            doctorSpecialization: apt.followUpOf.doctor?.specialty || 'General',
            date: new Date(apt.followUpOf.dateTime).toISOString().split('T')[0],
            time: new Date(apt.followUpOf.dateTime).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })
          } : undefined,
          followUps: apt.followUps?.map((followUp: any) => ({
            id: followUp.id,
            doctorName: followUp.doctor?.user?.name || 'Unknown Doctor',
            doctorSpecialization: followUp.doctor?.specialty || 'General',
            date: new Date(followUp.dateTime).toISOString().split('T')[0],
            time: new Date(followUp.dateTime).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })
          })) || [],
          review: apt.review
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

  const handleJoinVideoCall = async (appointment: Appointment) => {
    try {
      // Fetch video info
      const infoRes = await fetch(buildApiUrl(API_ENDPOINTS.videoInfo(appointment.id)), { credentials: 'include' });
      if (!infoRes.ok) throw new Error('Failed to get video info');
      const info = await infoRes.json();
      // Open video call page in a new tab
      window.open(`/appointments/videocall?roomCode=${encodeURIComponent(info.roomCode)}`, '_blank');
    } catch (err) {
      addToast({ type: 'error', title: 'Video Call Error', message: 'Could not join video call.' });
    }
  };

  const handleOpenReviewModal = (appointment: Appointment) => {
    if (!appointment.doctorId) return;
    setReviewModal({
      isOpen: true,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      appointmentId: parseInt(appointment.id)
    });
  };

  const handleReviewSubmitted = () => {
    // Refresh appointments to show the new review
    fetchAppointments(true);
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

  const isVirtualAndActive = (appointment: Appointment) => {
    return appointment.type === 'VIRTUAL' && appointment.status === 'BOOKED';
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const matchesSearch = appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDuration =
      durationFilter === 'all' ? true :
      durationFilter === 'half' ? appointment.slotDuration === 30 :
      durationFilter === 'full' ? appointment.slotDuration === 60 : true;
    return matchesFilter && matchesSearch && matchesDuration;
  });

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-[#4B5563] font-medium">Checking your access...</p>
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
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#1F2937] mb-3 heading-font">
                My Appointments
              </h1>
              <p className="text-base sm:text-lg text-[#4B5563]">
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-3 md:gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[#4B5563]" />
                <span className="text-sm font-semibold text-[#1F2937]">Filter:</span>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="input-field w-full md:w-auto"
              >
                <option value="all">All Appointments</option>
                <option value="PENDING">Pending</option>
                <option value="BOOKED">Booked</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
              {/* Duration Filter */}
              <select
                value={durationFilter}
                onChange={e => setDurationFilter(e.target.value as any)}
                className="input-field w-full md:w-auto"
              >
                <option value="all">All Durations</option>
                <option value="half">Half Hour</option>
                <option value="full">Full Hour</option>
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
            
            <div className="relative w-full md:w-auto">
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
          <div className="grid gap-4 sm:gap-6">
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
                        <h3 className="text-xl sm:text-2xl font-semibold text-[#1F2937] mb-2 heading-font">
                          {appointment.doctorName}
                        </h3>
                        <p className="text-[#4B5563] text-base sm:text-lg">{appointment.doctorSpecialization}</p>
                      </div>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-xl border text-xs sm:text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span>{appointment.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-[#4B5563] font-medium">Date</p>
                          <p className="font-semibold text-[#1F2937] text-base sm:text-lg">
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
                          <p className="font-semibold text-[#1F2937] text-base sm:text-lg">
                            {appointment.time && formatTimeAMPM(appointment.time)}
                          </p>
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
                          <p className="text-[#1F2937] text-base sm:text-lg">{appointment.reason}</p>
                        </div>
                      </div>
                      
                      {appointment.symptoms && (
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-[#FEF2F2] rounded-xl flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-[#DC2626]" />
                          </div>
                          <div>
                            <p className="text-sm text-[#4B5563] font-medium mb-1">Symptoms</p>
                            <p className="text-[#1F2937] text-base sm:text-lg">{appointment.symptoms}</p>
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

                      {/* Follow-up Information */}
                      {appointment.followUpOf && (
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-[#FEF3C7] rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#D97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-[#4B5563] font-medium mb-1">Follow-up Appointment</p>
                            <p className="text-[#1F2937] text-lg">
                              This is a follow-up to your appointment with Dr. {appointment.followUpOf.doctorName}
                            </p>
                            <p className="text-[#4B5563] text-sm">
                              Original appointment: {new Date(appointment.followUpOf.date).toLocaleDateString()} at {formatTimeAMPM(appointment.followUpOf.time)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Review Information */}
                      {appointment.review && (
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-[#E0F2FE] rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#0284C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-[#4B5563] font-medium mb-1">Your Review</p>
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="flex items-center space-x-1">
                                <span className="text-sm text-[#4B5563]">Behaviour:</span>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= appointment.review!.behaviourRating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-sm text-[#4B5563]">Recommendation:</span>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= appointment.review!.recommendationRating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {appointment.review.reviewText && (
                              <p className="text-[#4B5563] text-sm italic">
                                "{appointment.review.reviewText}"
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
                      <div className="text-center space-y-2">
                        <p className="text-sm text-[#0284C7] font-semibold">Completed</p>
                        {appointment.prescription && (
                          <p className="text-xs text-[#16A34A] font-medium">Prescription available</p>
                        )}
                        {!appointment.review && (
                          <button
                            onClick={() => handleOpenReviewModal(appointment)}
                            className="btn-primary text-sm px-4 py-2"
                          >
                            Rate & Review
                          </button>
                        )}
                        {appointment.review && (
                          <p className="text-xs text-[#16A34A] font-medium">✓ Reviewed</p>
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
                    {isVirtualAndActive(appointment) && (
                      <button
                        className="btn-primary"
                        onClick={() => handleJoinVideoCall(appointment)}
                      >
                        Join Video Call
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}
          doctorId={reviewModal.doctorId}
          doctorName={reviewModal.doctorName}
          appointmentId={reviewModal.appointmentId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      </div>
    </div>
  );
};

export default AppointmentsPage;
