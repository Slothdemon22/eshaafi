// Environment configuration
export const config = {
  backendUri: process.env.NEXT_PUBLIC_BACKEND_URI || 'http://localhost:5000',
  apiBaseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URI || 'http://localhost:5000'}/api`,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  login: '/users/login',
  register: '/users/register',
  logout: '/users/logout',
  
  // User endpoints
  userProfile: '/users/profile',
  userAppointments: '/users/appointments',
  changePassword: '/users/change-password',
  getUsers: '/users/getUsers',
  updateUser: (id: string) => `/users/users/${id}`,
  deleteUser: (id: string) => `/users/users/${id}`,
  
  // Doctor endpoints
  doctorProfile: '/doctor/profile',
  doctorAppointments: '/doctor/appointments',
  doctorAvailability: '/doctor/availability',
  doctorSlots: '/doctor/availability/slots',
  addAvailability: '/doctor/addAvailability',
  deleteAvailability: (slotId: string) => `/doctor/availability/${slotId}`,
  doctorApply: '/doctor/apply',
  allDoctors: '/doctor/all',
  doctorAvailabilityBookings: (doctorId: string, date: string) => 
    `/doctor/availability/bookings?doctorId=${doctorId}&date=${date}`,
  
  // Booking endpoints
  bookAppointment: '/bookings/book',
  deleteBooking: (bookingId: string) => `/bookings/deleteBooking/${bookingId}`,
  changeBookingStatus: '/bookings/changeBookingStatus',
  prescription: '/bookings/prescription',
  prescriptionById: (appointmentId: string) => `/bookings/prescription/${appointmentId}`,
  
  // Admin endpoints
  adminStats: '/admin/stats',
  adminApplications: '/admin/applications',
  approveApplication: (id: string) => `/admin/applications/${id}/approve`,
  rejectApplication: (id: string) => `/admin/applications/${id}/reject`,
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${config.apiBaseUrl}${endpoint}`;
};
