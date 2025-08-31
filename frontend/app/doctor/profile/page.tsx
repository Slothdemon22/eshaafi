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
  Stethoscope,
  Plus,
  Trash2,
  Users
} from 'lucide-react';
import { buildApiUrl, API_ENDPOINTS, formatTimeAMPM } from '@/lib/config';

interface DoctorProfile {
  id: number;
  location: string;
  specialty: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  education: { degree: string; institution: string; year: string }[];
  workExperience: { title: string; organization: string; years: string }[];
}

interface Appointment {
  id: number;
  dateTime: string;
  status: string;
  reason?: string;
  symptoms?: string;
  patient: {
    id: number;
    name: string;
    email: string;
  };
}

interface AvailabilitySlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
}

const DoctorProfile = () => {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isAddingAvailability, setIsAddingAvailability] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: '',
    specialty: ''
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

  // Availability form states
  const [availabilityData, setAvailabilityData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    duration: 30
  });

  const [specialities, setSpecialities] = useState<{ value: string, label: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [education, setEducation] = useState<{ degree: string; institution: string; year: string }[]>([]);
  const [workExperience, setWorkExperience] = useState<{ title: string; organization: string; years: string }[]>([]);

  useEffect(() => {
    fetch(buildApiUrl(API_ENDPOINTS.doctorSpecialities))
      .then(res => res.json())
      .then(setSpecialities);
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        location: '',
        specialty: ''
      });
      fetchDoctorProfile();
      fetchAppointments();
      fetchAvailabilitySlots();
    }
  }, [user]);

  useEffect(() => {
    if (doctorProfile) {
      setEducation(doctorProfile.education || []);
      setWorkExperience(doctorProfile.workExperience || []);
    }
  }, [doctorProfile]);

  const fetchDoctorProfile = async () => {
    try {
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.doctorProfile), {
        withCredentials: true
      });
      setDoctorProfile(response.data);
      setFormData(prev => ({
        ...prev,
        location: response.data.location || '',
        specialty: response.data.specialty || ''
      }));
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.doctorAppointments), {
        withCredentials: true
      });
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilitySlots = async () => {
    try {
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.doctorAvailability), {
        withCredentials: true
      });
      setAvailabilitySlots(response.data.slots || []);
    } catch (error) {
      console.error('Error fetching availability slots:', error);
    }
  };

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

  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAvailabilityData({
      ...availabilityData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async () => {
    try {
      setUpdating(true);
      // Update user profile
      await axios.put(buildApiUrl(API_ENDPOINTS.userProfile), {
        name: formData.name,
        email: formData.email
      }, {
        withCredentials: true
      });
      
      // Update doctor profile
      await axios.put(buildApiUrl(API_ENDPOINTS.doctorProfile), {
        location: formData.location,
        specialty: formData.specialty,
        education,
        workExperience
      }, {
        withCredentials: true
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      fetchDoctorProfile();
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
      await axios.put(buildApiUrl(API_ENDPOINTS.changePassword), {
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

  const handleAddAvailability = async () => {
    if (!availabilityData.date || !availabilityData.startTime || !availabilityData.endTime) {
      setMessage({ type: 'error', text: 'Please fill in all availability fields' });
      return;
    }

    try {
      setUpdating(true);
      await axios.post(buildApiUrl(API_ENDPOINTS.addAvailability), availabilityData, {
        withCredentials: true
      });
      setMessage({ type: 'success', text: 'Availability slot added successfully!' });
      setIsAddingAvailability(false);
      setAvailabilityData({
        date: '',
        startTime: '',
        endTime: '',
        duration: 30
      });
      fetchAvailabilitySlots();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to add availability slot' 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAvailability = async (slotId: number) => {
    try {
      await axios.delete(buildApiUrl(API_ENDPOINTS.deleteAvailability(slotId.toString())), {
        withCredentials: true
      });
      setMessage({ type: 'success', text: 'Availability slot deleted successfully!' });
      fetchAvailabilitySlots();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to delete availability slot' 
      });
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

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Early return if user is not available
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProfileRedirect>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>
          <p className="text-gray-600 mt-2">Manage your professional information and appointments</p>
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
                <h2 className="text-xl font-semibold text-gray-900">Professional Information</h2>
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
                      className="w-full px-3 py-2 border border-blue-200 bg-white/80 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-gray-900 placeholder-gray-400 transition-all duration-150"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.name || 'Not available'}</p>
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
                      className="w-full px-3 py-2 border border-blue-200 bg-white/80 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-gray-900 placeholder-gray-400 transition-all duration-150"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.email || 'Not available'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Stethoscope className="w-4 h-4 inline mr-1" />
                    Specialty
                  </label>
                  {isEditing ? (
                    <div className="relative mb-4">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-blue-200 bg-white/80 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-gray-900 placeholder-gray-400 transition-all duration-150"
                        placeholder="Search specialty..."
                        value={specialtySearch}
                        autoComplete="off"
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
                        onChange={e => {
                          setSpecialtySearch(e.target.value);
                          setShowDropdown(true);
                          setHighlightedIndex(0);
                        }}
                        onKeyDown={e => {
                          const filtered = specialities.filter(s => s.label.toLowerCase().includes(specialtySearch.toLowerCase()));
                          if (e.key === 'ArrowDown') {
                            setHighlightedIndex(i => Math.min(i + 1, filtered.length - 1));
                          } else if (e.key === 'ArrowUp') {
                            setHighlightedIndex(i => Math.max(i - 1, 0));
                          } else if (e.key === 'Enter' && filtered[highlightedIndex]) {
                            setSpecialtySearch(filtered[highlightedIndex].label);
                            setFormData(prev => ({ ...prev, specialty: filtered[highlightedIndex].value }));
                            setShowDropdown(false);
                          }
                        }}
                      />
                      {showDropdown && (
                        <motion.ul
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                          className="absolute z-50 left-0 w-full bg-white border border-blue-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto mt-2 p-1 ring-1 ring-blue-100"
                          style={{ minWidth: '200px' }}
                        >
                          {specialities.filter(s => s.label.toLowerCase().includes(specialtySearch.toLowerCase())).map((s, idx) => (
                            <li
                              key={s.value}
                              className={`flex items-center px-4 py-2 cursor-pointer transition-colors duration-100 rounded-lg mb-1 text-base font-medium
                                ${idx === highlightedIndex ? 'bg-blue-100/80 text-blue-900 font-semibold' : 'hover:bg-blue-50/80 text-gray-800'}
                                ${formData.specialty === s.value ? 'border-l-4 border-blue-400 bg-blue-50/60' : ''}`}
                              onMouseDown={() => {
                                setSpecialtySearch(s.label);
                                setFormData(prev => ({ ...prev, specialty: s.value }));
                                setShowDropdown(false);
                              }}
                              onMouseEnter={() => setHighlightedIndex(idx)}
                              aria-selected={formData.specialty === s.value}
                            >
                              {formData.specialty === s.value && (
                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              )}
                              {s.label}
                            </li>
                          ))}
                          {specialities.filter(s => s.label.toLowerCase().includes(specialtySearch.toLowerCase())).length === 0 && (
                            <li className="px-4 py-2 text-gray-400">No results</li>
                          )}
                        </motion.ul>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900">{specialities.find(s => s.value === doctorProfile?.specialty)?.label || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-blue-200 bg-white/80 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-gray-900 placeholder-gray-400 transition-all duration-150"
                    />
                  ) : (
                    <p className="text-gray-900">{doctorProfile?.location || 'Not specified'}</p>
                  )}
                </div>

                {/* Education & Work Experience Section (move above credentials, themed) */}
                <div className="mt-6">
                  <div className="mb-6 bg-blue-50/60 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Education</h3>
                    {isEditing ? (
                      <div className="space-y-3">
                        {education.map((edu, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Degree"
                              value={edu.degree}
                              onChange={e => setEducation(education.map((ed, i) => i === idx ? { ...ed, degree: e.target.value } : ed))}
                              className="w-1/4 px-2 py-1 border rounded"
                            />
                            <input
                              type="text"
                              placeholder="Institution"
                              value={edu.institution}
                              onChange={e => setEducation(education.map((ed, i) => i === idx ? { ...ed, institution: e.target.value } : ed))}
                              className="w-1/3 px-2 py-1 border rounded"
                            />
                            <input
                              type="text"
                              placeholder="Year"
                              value={edu.year}
                              onChange={e => setEducation(education.map((ed, i) => i === idx ? { ...ed, year: e.target.value } : ed))}
                              className="w-1/6 px-2 py-1 border rounded"
                            />
                            <button onClick={() => setEducation(education.filter((_, i) => i !== idx))} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                        <button onClick={() => setEducation([...education, { degree: '', institution: '', year: '' }])} className="text-blue-600 flex items-center mt-2"><Plus className="w-4 h-4 mr-1" />Add Education</button>
                      </div>
                    ) : (
                      <ul className="list-disc ml-6 text-blue-900">
                        {education.length === 0 && <li>No education info added</li>}
                        {education.map((edu, idx) => (
                          <li key={idx}>{edu.degree} - {edu.institution} ({edu.year})</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="mb-6 bg-green-50/60 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Work Experience</h3>
                    {isEditing ? (
                      <div className="space-y-3">
                        {workExperience.map((exp, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Title"
                              value={exp.title}
                              onChange={e => setWorkExperience(workExperience.map((ex, i) => i === idx ? { ...ex, title: e.target.value } : ex))}
                              className="w-1/4 px-2 py-1 border rounded"
                            />
                            <input
                              type="text"
                              placeholder="Organization"
                              value={exp.organization}
                              onChange={e => setWorkExperience(workExperience.map((ex, i) => i === idx ? { ...ex, organization: e.target.value } : ex))}
                              className="w-1/3 px-2 py-1 border rounded"
                            />
                            <input
                              type="text"
                              placeholder="Years"
                              value={exp.years}
                              onChange={e => setWorkExperience(workExperience.map((ex, i) => i === idx ? { ...ex, years: e.target.value } : ex))}
                              className="w-1/6 px-2 py-1 border rounded"
                            />
                            <button onClick={() => setWorkExperience(workExperience.filter((_, i) => i !== idx))} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                        <button onClick={() => setWorkExperience([...workExperience, { title: '', organization: '', years: '' }])} className="text-green-600 flex items-center mt-2"><Plus className="w-4 h-4 mr-1" />Add Experience</button>
                      </div>
                    ) : (
                      <ul className="list-disc ml-6 text-green-900">
                        {workExperience.length === 0 && <li>No work experience info added</li>}
                        {workExperience.map((exp, idx) => (
                          <li key={idx}>{exp.title} - {exp.organization} ({exp.years})</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user?.role || 'Unknown'}
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

            {/* Availability Management */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Availability</h2>
                {!isAddingAvailability ? (
                  <button
                    onClick={() => setIsAddingAvailability(true)}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Slot
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddAvailability}
                      disabled={updating}
                      className="flex items-center text-green-600 hover:text-green-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {updating ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingAvailability(false);
                        setAvailabilityData({
                          date: '',
                          startTime: '',
                          endTime: '',
                          duration: 30
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

              {isAddingAvailability && (
                <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={availabilityData.date}
                      onChange={handleAvailabilityChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={availabilityData.startTime}
                        onChange={handleAvailabilityChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={availabilityData.endTime}
                        onChange={handleAvailabilityChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <select
                      name="duration"
                      value={availabilityData.duration}
                      onChange={handleAvailabilityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {availabilitySlots.length === 0 ? (
                  <p className="text-gray-500 text-sm">No availability slots set</p>
                ) : (
                  availabilitySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{formatDate(slot.date)}</p>
                        <p className="text-sm text-gray-600">
                          {formatTimeAMPM(slot.startTime)} - {formatTimeAMPM(slot.endTime)} ({slot.duration} min)
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteAvailability(slot.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
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
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Patient Appointments</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No appointments found</p>
                  <p className="text-gray-500 text-sm">Patient appointments will appear here</p>
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
                            {appointment.patient.name}
                          </h3>
                          <p className="text-sm text-gray-600">{appointment.patient.email}</p>
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

export default DoctorProfile;
