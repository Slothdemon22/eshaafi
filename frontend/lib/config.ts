// Environment configuration
export const config = {
  backendUri: process.env.NEXT_PUBLIC_BACKEND_URI || "http://localhost:5000",
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;

// Helper function to fix localhost URLs in production
export const fixImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  
  // If we're in production and the URL contains localhost, replace it
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Replace localhost URLs with the current domain
    return url.replace(/http:\/\/localhost:\d+/, window.location.origin);
  }
  
  return url;
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  login: '/api/users/login',
  register: '/api/users/register',
  logout: '/api/users/logout',
  
  // User endpoints
  userProfile: '/api/users/profile',
  userAppointments: '/api/users/appointments',
  changePassword: '/api/users/change-password',
  getUsers: '/api/users/getUsers',
  updateUser: (id: string) => `/api/users/users/${id}`,
  deleteUser: (id: string) => `/api/users/users/${id}`,
  // Admin Clinics
  adminClinics: '/api/admin/clinics',
  adminClinicDetails: (clinicId: string | number) => `/api/admin/clinics/${clinicId}`,
  adminClinicAppointments: (clinicId: string | number) => `/api/admin/clinics/${clinicId}/appointments`,
  adminSetClinicActive: (clinicId: string | number) => `/api/admin/clinics/${clinicId}/active`,
  adminSetDoctorActive: (doctorId: string | number) => `/api/admin/doctors/${doctorId}/active`,
  adminDeleteClinic: (clinicId: string | number) => `/api/admin/clinics/${clinicId}`,
  adminUpdateClinic: (clinicId: string | number) => `/api/admin/clinics/${clinicId}`,
  
  // Doctor endpoints
  doctorProfile: '/api/doctor/profile',
  doctorAppointments: '/api/doctor/appointments',
  doctorAvailability: '/api/doctor/availability',
  doctorSlots: '/api/doctor/availability/slots',
  addAvailability: '/api/doctor/addAvailability',
  deleteAvailability: (slotId: string) => `/api/doctor/availability/${slotId}`,
  doctorApply: '/api/doctor/apply',
  allDoctors: '/api/doctor/all',
  getDoctorById: (doctorId: string | number) => `/api/doctor/${doctorId}`,
  doctorReviewSummary: (doctorId: string | number) => `/api/doctor/${doctorId}/reviews/summary`,
  doctorReviews: (doctorId: string | number) => `/api/doctor/${doctorId}/reviews`,
  createReview: (doctorId: string | number) => `/api/doctor/${doctorId}/reviews`,
  doctorOwnReviewSummary: '/api/doctor/reviews/summary',
  doctorOwnReviews: '/api/doctor/reviews',
  doctorAvailabilityBookings: (doctorId: string, date: string) => 
    `/api/doctor/availability/bookings?doctorId=${doctorId}&date=${date}`,
  doctorSpecialities: '/api/doctor/specialities',
  doctorSpecialitiesCounts: '/api/doctor/specialities/counts',
  doctorStatus: '/api/doctor/status',
  doctorStatusById: (doctorId: string | number) => `/api/doctor/status/${doctorId}`,
  
  // Booking endpoints
  bookAppointment: '/api/bookings/book',
  deleteBooking: (bookingId: string) => `/api/bookings/deleteBooking/${bookingId}`,
  changeBookingStatus: '/api/bookings/changeBookingStatus',
  createFollowUp: '/api/bookings/followup',
  prescription: '/api/bookings/prescription',
  prescriptionById: (appointmentId: string) => `/api/bookings/prescription/${appointmentId}`,
  
  // Admin endpoints
  adminStats: '/api/admin/stats',
  // Super admin extras can reuse admin stats endpoint guarded server-side
  adminApplications: '/api/admin/applications',
  approveApplication: (id: string) => `/api/admin/applications/${id}/approve`,
  rejectApplication: (id: string) => `/api/admin/applications/${id}/reject`,
  
  // Clinic endpoints
  clinicApply: '/api/clinics/apply',
  adminClinicApplications: '/api/admin/clinics/applications',
  adminApproveClinicApplication: (id: string) => `/api/admin/clinics/applications/${id}/approve`,
  adminRejectClinicApplication: (id: string) => `/api/admin/clinics/applications/${id}/reject`,
  adminCreateClinicAdmin: (clinicId: string) => `/api/admin/clinics/${clinicId}/admins`,
  
  // Clinic admin endpoints
  clinicDoctors: '/api/clinic/admin/doctors',
  clinicDoctorStats: '/api/clinic/admin/doctors/stats',
  clinicApplications: '/api/clinic/admin/applications',
  clinicApproveApplication: (id: string) => `/api/clinic/admin/applications/${id}/approve`,
  clinicRejectApplication: (id: string) => `/api/clinic/admin/applications/${id}/reject`,
  clinicUpdateInfo: '/api/clinic/admin/info',
  clinicRemoveDoctor: (doctorId: string) => `/api/clinic/admin/doctors/${doctorId}`,
  clinicInfo: '/api/clinic/admin/info',
  
  // Clinic-specific public endpoints
  getPublicClinics: '/api/clinic',
  getClinicById: (clinicId: string) => `/api/clinic/${clinicId}`,
  getPublicClinicDoctors: (clinicId: string) => `/api/clinic/${clinicId}/doctors`,
  submitClinicDoctorApplication: (clinicId: string) => `/api/clinic/${clinicId}/apply`,
  
  // Video call endpoints
  videoInfo: (bookingId: string) => `/api/bookings/video/info/${bookingId}`,
  videoToken: '/api/bookings/video/token',
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Always use backendUri directly for backend API calls
  return `${config.backendUri}${endpoint}`;
};

// Utility: Format time as AM/PM
export function formatTimeAMPM(time: string | Date): string {
  const date = typeof time === 'string' ? new Date(`1970-01-01T${time}`) : time;
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
