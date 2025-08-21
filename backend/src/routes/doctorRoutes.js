import express from "express";
import { getProfileDoctor, addAvailabilityDoctor, updateDoctorProfile, getDoctorAppointments, getDoctorAvailability, deleteAvailabilitySlot, submitDoctorApplication, getDoctorAvailabilityWithBookingsController, getAllDoctorsForBooking, addMultipleAvailabilitySlots, getSpecialities, getDoctorCountsBySpeciality, setDoctorOnlineStatus, getDoctorOnlineStatus, createReview, getDoctorReviews, getDoctorReviewSummary, getDoctorByIdPublic } from '../controllers/doctorController.js';
import { doctorMiddleware } from '../middlewares/doctorMiddleware.js';
import { authMiddleware } from '../middlewares/authmiddleware.js';

const doctorRouter=express.Router();

// Public endpoints (no authentication required)
doctorRouter.post('/apply', submitDoctorApplication);
doctorRouter.get('/all', getAllDoctorsForBooking);
doctorRouter.get('/specialities', getSpecialities);
doctorRouter.get('/specialities/counts', getDoctorCountsBySpeciality);

// Protected endpoints (require doctor authentication)
doctorRouter.get("/profile", doctorMiddleware, getProfileDoctor);
doctorRouter.put("/profile", doctorMiddleware, updateDoctorProfile);
doctorRouter.get("/appointments", doctorMiddleware, getDoctorAppointments);
doctorRouter.get("/availability", doctorMiddleware, getDoctorAvailability);
doctorRouter.post("/addAvailability", doctorMiddleware, addAvailabilityDoctor);
doctorRouter.delete("/availability/:slotId", doctorMiddleware, deleteAvailabilitySlot);
doctorRouter.post("/availability/slots", doctorMiddleware, addMultipleAvailabilitySlots);
doctorRouter.get("/availability/bookings", getDoctorAvailabilityWithBookingsController);

// Online status endpoints
// Set status (doctor only)
doctorRouter.post('/status', doctorMiddleware, setDoctorOnlineStatus);
// Get status (public)
doctorRouter.get('/status/:doctorId', getDoctorOnlineStatus);

// Review endpoints
// Create review (patient only, completed appointment required)
doctorRouter.post('/:doctorId/reviews', authMiddleware, createReview);
// Get all reviews for a doctor (public)
doctorRouter.get('/:doctorId/reviews', getDoctorReviews);
// Get review summary (public)
doctorRouter.get('/:doctorId/reviews/summary', getDoctorReviewSummary);
// Get doctor's own review summary (protected)
doctorRouter.get('/reviews/summary', doctorMiddleware, getDoctorReviewSummary);
// Get doctor's own reviews (protected)
doctorRouter.get('/reviews', doctorMiddleware, getDoctorReviews);

// Public route to fetch single doctor by id (keep after other prefixed routes to avoid conflicts)
doctorRouter.get('/:doctorId', getDoctorByIdPublic);

export default doctorRouter;