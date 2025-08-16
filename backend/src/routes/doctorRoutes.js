import express from "express";
import { getProfileDoctor, addAvailabilityDoctor, updateDoctorProfile, getDoctorAppointments, getDoctorAvailability, deleteAvailabilitySlot, submitDoctorApplication, getDoctorAvailabilityWithBookingsController, getAllDoctorsForBooking, addMultipleAvailabilitySlots, getSpecialities, getDoctorCountsBySpeciality } from '../controllers/doctorController.js';
import { doctorMiddleware } from '../middlewares/doctorMiddleware.js';

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

export default doctorRouter;