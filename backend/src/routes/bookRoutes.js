import express from "express";
import {bookAppointment,deleteAppointment ,changeStatusAppointment,GetBooking} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

bookingRouter.post("/addBooking", bookAppointment);
bookingRouter.delete("/deleteBooking/:appointmentId",deleteAppointment);
bookingRouter.get("/getBooking/:bookingId",GetBooking);
bookingRouter.put("/changeBookingStatus",changeStatusAppointment);



export default bookingRouter;