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
  Filter,
  Search,
  Phone,
  Mail,
  Eye,
  RefreshCw,
  Pill,
  Plus,
  Edit
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config';
import { useRouter } from 'next/navigation';

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
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  date: string;
  time: string;
  reason: string;
  status: 'PENDING' | 'BOOKED' | 'REJECTED' | 'COMPLETED';
  symptoms?: string;
  notes?: string;
  prescription?: Prescription;
  rejectionReason?: string; // Add this field
  type?: string;
  videoRoomId?: string;
}

const DoctorAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'BOOKED' | 'REJECTED' | 'COMPLETED'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medications: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: ''
  });
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingAppointmentId, setRejectingAppointmentId] = useState<string | null>(null);
  const { user, isAuthenticated, isDoctor } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  // Fetch real appointments data from API
  const fetchAppointments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await fetch('http://localhost:5000/api/doctor/appointments', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const transformedAppointments: Appointment[] = data.appointments.map((apt: any) => ({
          id: apt.id.toString(),
          patientName: apt.patient?.name || 'Unknown Patient',
          patientEmail: apt.patient?.email || 'No email',
          patientPhone: apt.patient?.phone || 'No phone',
          date: new Date(apt.dateTime).toISOString().split('T')[0],
          time: new Date(apt.dateTime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          reason: apt.reason || 'No reason provided',
          status: apt.status,
          symptoms: apt.symptoms,
          notes: apt.notes,
          prescription: apt.prescription,
          rejectionReason: apt.rejectionReason, // Add this field
          type: apt.type, // Add this field
          videoRoomId: apt.videoRoomId // Add this field
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
          message: 'Unable to fetch appointments. Please try again.',
        });
      } finally {
        setIsLoading(false);
      setIsRefreshing(false);
      }
    };

  useEffect(() => {
    if (isAuthenticated && isDoctor) {
      fetchAppointments();
    }
  }, [isAuthenticated, isDoctor]);

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    if (newStatus === 'REJECTED') {
      setRejectingAppointmentId(appointmentId);
      setShowRejectModal(true);
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/bookings/changeBookingStatus', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: appointmentId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }

      const result = await response.json();
      
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

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      addToast({
        type: 'error',
        title: 'Rejection Reason Required',
        message: 'Please provide a reason for rejection.',
      });
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/bookings/changeBookingStatus', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: rejectingAppointmentId,
          status: 'REJECTED',
          rejectionReason: rejectReason
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }
      const result = await response.json();
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === rejectingAppointmentId
            ? { ...apt, status: 'REJECTED', rejectionReason: rejectReason }
            : apt
        )
      );
      setShowRejectModal(false);
      setRejectReason('');
      setRejectingAppointmentId(null);
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: 'Appointment has been rejected.',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update appointment status. Please try again.',
      });
    }
  };

  const handlePrescriptionSubmit = async (appointmentId: string) => {
    try {
      const url = editingPrescription 
        ? `http://localhost:5000/api/bookings/prescription/${appointmentId}`
        : 'http://localhost:5000/api/bookings/prescription';
      
      const method = editingPrescription ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bookingId: appointmentId,
          ...prescriptionForm
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save prescription');
      }

      const result = await response.json();
      
      // Update the appointment with the new prescription
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, prescription: result.prescription }
            : apt
        )
      );

      setShowPrescriptionModal(false);
      setPrescriptionForm({
        medications: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: ''
      });
      setEditingPrescription(null);

      addToast({
        type: 'success',
        title: 'Prescription Saved',
        message: editingPrescription ? 'Prescription updated successfully.' : 'Prescription created successfully.',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Prescription Failed',
        message: error.message || 'Failed to save prescription. Please try again.',
      });
    }
  };

  const openPrescriptionModal = (appointment: Appointment, prescription?: Prescription) => {
    setSelectedAppointment(appointment);
    if (prescription) {
      setEditingPrescription(prescription);
      setPrescriptionForm({
        medications: prescription.medications,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        notes: prescription.notes || ''
      });
    } else {
      setEditingPrescription(null);
      setPrescriptionForm({
        medications: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: ''
      });
    }
    setShowPrescriptionModal(true);
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

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BOOKED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
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

  const isVirtualAndActive = (appointment: Appointment) => {
    return appointment.type === 'VIRTUAL' && appointment.status === 'BOOKED';
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
          <Link href="/doctor/dashboard" className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Appointments
          </h1>
          <p className="text-xl text-gray-600">
            Manage and track all your patient appointments
          </p>
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients or reasons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full md:w-64"
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
              <p className="text-gray-600">Loading appointments...</p>
            </div>
          </motion.div>
        ) : filteredAppointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You don't have any appointments yet."
                : `No ${filter.toLowerCase()} appointments found.`
              }
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {filteredAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {appointment.patientName}
                        </h3>
                        <p className="text-gray-600 mb-2">{appointment.patientEmail}</p>
                        {appointment.patientPhone && (
                          <p className="text-sm text-gray-500">{appointment.patientPhone}</p>
                        )}
                      </div>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span>{appointment.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(appointment.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="font-medium text-gray-900">{appointment.time}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <MessageSquare className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Reason for Visit</p>
                          <p className="text-gray-900">{appointment.reason}</p>
                        </div>
                      </div>
                      
                      {appointment.symptoms && (
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Symptoms</p>
                            <p className="text-gray-900">{appointment.symptoms}</p>
                          </div>
                        </div>
                      )}

                      {appointment.notes && (
                        <div className="flex items-start space-x-3">
                          <Eye className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Notes</p>
                            <p className="text-gray-900">{appointment.notes}</p>
                          </div>
                        </div>
                      )}

                      {appointment.prescription && (
                        <div className="flex items-start space-x-3">
                          <Pill className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Prescription</p>
                            <p className="text-gray-900">
                              {appointment.prescription.medications} - {appointment.prescription.dosage}
                            </p>
                            <p className="text-sm text-gray-600">
                              {appointment.prescription.frequency} for {appointment.prescription.duration}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col space-y-3">
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {appointment.status === 'BOOKED' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'COMPLETED')}
                            className="btn-primary text-sm"
                          >
                            Mark Complete
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'REJECTED')}
                            className="btn-danger text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>

                    {/* Prescription Button */}
                    {appointment.status === 'COMPLETED' && (
                      <button
                        onClick={() => openPrescriptionModal(appointment, appointment.prescription)}
                        className="btn-secondary text-sm flex items-center space-x-2"
                      >
                        {appointment.prescription ? (
                          <>
                            <Edit className="w-4 h-4" />
                            <span>Edit Prescription</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Add Prescription</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Contact Buttons */}
                    <div className="flex space-x-2">
                      {appointment.patientPhone && (
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors border border-gray-200 rounded-lg">
                          <Phone className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors border border-gray-200 rounded-lg">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>

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
                {/* Show rejection reason if REJECTED */}
                {appointment.status === 'REJECTED' && appointment.rejectionReason && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700 font-semibold">Rejection Reason:</p>
                    <p className="text-sm text-red-700">{appointment.rejectionReason}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Prescription Modal */}
        {showPrescriptionModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold mb-4">
                {editingPrescription ? 'Edit Prescription' : 'Add Prescription'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medications
                  </label>
                  <input
                    type="text"
                    value={prescriptionForm.medications}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, medications: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Paracetamol, Ibuprofen"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={prescriptionForm.dosage}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, dosage: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., 500mg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <input
                    type="text"
                    value={prescriptionForm.frequency}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, frequency: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Twice daily"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={prescriptionForm.duration}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., 7 days"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={prescriptionForm.notes}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="input-field"
                    rows={3}
                    placeholder="Additional instructions..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePrescriptionSubmit(selectedAppointment.id)}
                  className="btn-primary flex-1"
                >
                  {editingPrescription ? 'Update' : 'Save'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold mb-4">Reject Appointment</h3>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="input-field w-full mb-4"
                rows={4}
                placeholder="Please provide a reason..."
              />
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectingAppointmentId(null); }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  className="btn-danger flex-1"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Video Call Modal */}
        {/* Removed all videoModal/token/modal logic for video calls */}
      </div>
    </div>
  );
};

export default DoctorAppointmentsPage;
