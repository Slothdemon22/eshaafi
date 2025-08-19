// Environment configuration
export const config = {
  backendUri: process.env.NEXT_PUBLIC_BACKEND_URI || 'http://localhost:5000',
} as const;

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
  
  // Doctor endpoints
  doctorProfile: '/api/doctor/profile',
  doctorAppointments: '/api/doctor/appointments',
  doctorAvailability: '/api/doctor/availability',
  doctorSlots: '/api/doctor/availability/slots',
  addAvailability: '/api/doctor/addAvailability',
  deleteAvailability: (slotId: string) => `/api/doctor/availability/${slotId}`,
  doctorApply: '/api/doctor/apply',
  allDoctors: '/api/doctor/all',
  doctorAvailabilityBookings: (doctorId: string, date: string) => 
    `/api/doctor/availability/bookings?doctorId=${doctorId}&date=${date}`,
  doctorSpecialities: '/api/doctor/specialities',
  doctorSpecialitiesCounts: '/api/doctor/specialities/counts',
  
  // Booking endpoints
  bookAppointment: '/api/bookings/book',
  deleteBooking: (bookingId: string) => `/api/bookings/deleteBooking/${bookingId}`,
  changeBookingStatus: '/api/bookings/changeBookingStatus',
  prescription: '/api/bookings/prescription',
  prescriptionById: (appointmentId: string) => `/api/bookings/prescription/${appointmentId}`,
  
  // Admin endpoints
  adminStats: '/api/admin/stats',
  adminApplications: '/api/admin/applications',
  approveApplication: (id: string) => `/api/admin/applications/${id}/approve`,
  rejectApplication: (id: string) => `/api/admin/applications/${id}/reject`,
  
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
