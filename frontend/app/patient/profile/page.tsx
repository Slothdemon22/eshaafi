'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ProfileRedirect from '../../../components/ProfileRedirect';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { formatTimeAMPM } from '@/lib/config';

interface Appointment {
  id: number;
  dateTime: string;
  status: string;
  reason?: string;
  symptoms?: string;
  doctor: {
    user: {
      name: string;
    };
    specialty: string;
    location: string;
  };
}

interface Review {
  id: number;
  doctorId: number;
  patientId: number;
  appointmentId: number;
  behaviourRating: number;
  recommendationRating: number;
  reviewText?: string;
  createdAt: string;
}

const PatientProfile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState({
    behaviourRating: 0,
    recommendationRating: 0,
    reviewText: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [doctorReviews, setDoctorReviews] = useState<{ [doctorId: number]: Review[] }>({});

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email
      });
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/appointments', {
        withCredentials: true
      });
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews for all doctors in appointments
  useEffect(() => {
    const fetchReviews = async () => {
      const uniqueDoctorIds = Array.from(new Set(appointments.map(a => a.doctor.user.name + a.doctor.location)));
      const doctorIdMap: { [key: string]: number } = {};
      // You may need to map doctor info to doctorId if available
      // For now, skip if doctorId is not available
      // This is a placeholder for real doctorId mapping
      // If you have doctorId in appointment, use that directly
      // Otherwise, fetch reviews only for appointments with doctorId
      // For demo, skip mapping
      // Fetch reviews for each doctor
      const reviewsObj: { [doctorId: number]: Review[] } = {};
      for (const appointment of appointments) {
        // Assume appointment.doctor.id exists (if not, adjust accordingly)
        const doctorId = (appointment as any).doctorId || (appointment as any).doctor?.id;
        if (!doctorId) continue;
        if (reviewsObj[doctorId]) continue;
        try {
          const res = await axios.get(`/api/doctor/${doctorId}/reviews`, { withCredentials: true });
          reviewsObj[doctorId] = res.data.reviews || [];
        } catch {}
      }
      setDoctorReviews(reviewsObj);
    };
    if (appointments.length > 0) fetchReviews();
  }, [appointments]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async () => {
    try {
      setUpdating(true);
      const response = await axios.put('http://localhost:5000/api/users/profile', formData, {
        withCredentials: true
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      // Update the user context if needed
      window.location.reload(); // Simple refresh to update context
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update profile' 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    try {
      setUpdating(true);
      await axios.put('http://localhost:5000/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        withCredentials: true
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to change password' 
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BOOKED': return 'text-green-600 bg-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'COMPLETED': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Helper to check if appointment is reviewed
  const isReviewed = (appointment: Appointment) => {
    const doctorId = (appointment as any).doctorId || (appointment as any).doctor?.id;
    if (!doctorId) return false;
    const reviews = doctorReviews[doctorId] || [];
    // Check if review exists for this appointment and patient
    return reviews.some(r => r.appointmentId === appointment.id && r.patientId === user?.id);
  };

  // Review form submit handler
  const handleReviewSubmit = async (appointment: Appointment) => {
    const doctorId = (appointment as any).doctorId || (appointment as any).doctor?.id;
    if (!doctorId) return;
    setSubmittingReview(true);
    try {
      await axios.post(`/api/doctor/${doctorId}/reviews`, {
        appointmentId: appointment.id,
        behaviourRating: reviewForm.behaviourRating,
        recommendationRating: reviewForm.recommendationRating,
        reviewText: reviewForm.reviewText
      }, { withCredentials: true });
      setShowReviewModal(null);
      setReviewForm({ behaviourRating: 0, recommendationRating: 0, reviewText: '' });
      // Refetch reviews
      const res = await axios.get(`/api/doctor/${doctorId}/reviews`, { withCredentials: true });
      setDoctorReviews(prev => ({ ...prev, [doctorId]: res.data.reviews || [] }));
      setMessage({ type: 'success', text: 'Review submitted successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to submit review' });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <ProfileRedirect>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Patient Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and appointments</p>
        </motion.div>

        {/* Message Alert */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={updating}
                      className="flex items-center text-green-600 hover:text-green-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {updating ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center text-gray-600 hover:text-gray-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user ? user.name : ''}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user ? user.email : ''}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user ? user.role : ''}
                  </span>
                </div>
              </div>

              {/* Password Change Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Security</h3>
                  {!isChangingPassword ? (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Lock className="w-4 h-4 mr-1" />
                      Change Password
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handlePasswordUpdate}
                        disabled={updating}
                        className="flex items-center text-green-600 hover:text-green-700 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {updating ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }}
                        className="flex items-center text-gray-600 hover:text-gray-700"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {isChangingPassword && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Appointments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Appointment History</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No appointments found</p>
                  <p className="text-gray-500 text-sm">Your appointment history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Dr. {appointment.doctor.user.name}
                          </h3>
                          <p className="text-sm text-gray-600">{appointment.doctor.specialty}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(appointment.dateTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          {formatTimeAMPM(new Date(appointment.dateTime))}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {appointment.doctor.location}
                        </div>
                      </div>
                      
                      {appointment.reason && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Reason:</span> {appointment.reason}
                          </p>
                        </div>
                      )}
                      
                      {appointment.symptoms && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                          </p>
                        </div>
                      )}
                      {/* Review Button for completed appointments */}
                      {appointment.status === 'COMPLETED' && !isReviewed(appointment) && (
                        <button
                          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                          onClick={() => setShowReviewModal(appointment.id)}
                        >
                          Leave a Review
                        </button>
                      )}
                      {/* Review Modal */}
                      {showReviewModal === appointment.id && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Leave a Review</h3>
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Behaviour Rating</label>
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map(star => (
                                  <button
                                    key={star}
                                    type="button"
                                    className={star <= reviewForm.behaviourRating ? 'text-yellow-400' : 'text-gray-300'}
                                    onClick={() => setReviewForm(f => ({ ...f, behaviourRating: star }))}
                                  >
                                    <Star className="w-6 h-6" fill={star <= reviewForm.behaviourRating ? '#facc15' : 'none'} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Recommendation Rating</label>
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map(star => (
                                  <button
                                    key={star}
                                    type="button"
                                    className={star <= reviewForm.recommendationRating ? 'text-yellow-400' : 'text-gray-300'}
                                    onClick={() => setReviewForm(f => ({ ...f, recommendationRating: star }))}
                                  >
                                    <Star className="w-6 h-6" fill={star <= reviewForm.recommendationRating ? '#facc15' : 'none'} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Review (optional)</label>
                              <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                value={reviewForm.reviewText}
                                onChange={e => setReviewForm(f => ({ ...f, reviewText: e.target.value }))}
                              />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                              <button
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                onClick={() => setShowReviewModal(null)}
                                disabled={submittingReview}
                              >
                                Cancel
                              </button>
                              <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                                onClick={() => handleReviewSubmit(appointment)}
                                disabled={submittingReview || reviewForm.behaviourRating === 0 || reviewForm.recommendationRating === 0}
                              >
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
                 </div>
       </div>
     </div>
     </ProfileRedirect>
   );
 };

export default PatientProfile;
