import express from "express";
import {bookAppointment,deleteAppointment ,changeStatusAppointment,GetBooking, createPrescription, getPrescription, updatePrescription} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

bookingRouter.post("/book", bookAppointment);
bookingRouter.post("/addBooking", bookAppointment);
bookingRouter.delete("/deleteBooking/:appointmentId",deleteAppointment);
bookingRouter.get("/getBooking/:bookingId",GetBooking);
bookingRouter.put("/changeBookingStatus",changeStatusAppointment);

// Prescription routes
bookingRouter.post("/prescription", createPrescription);
bookingRouter.get("/prescription/:bookingId", getPrescription);
bookingRouter.put("/prescription/:bookingId", updatePrescription);

export default bookingRouter;