
import { bookingServiceAddBooking,bookingServiceDeleteBooking,changeBookingServiceChangeStatus,GetBookedAppointmentService,bookingServiceGetAllBookings } from '../services/bookingService.js';

export const bookAppointment = async (req, res) => {

 try
 {
    const { doctorId, dateTime } = req.body;
    const patientId = req.user.id;
    console.log("Booking appointment with data:", { patientId, doctorId, dateTime });
    const booking = await bookingServiceAddBooking(patientId, doctorId, dateTime);
   // console.log("Booking created:", booking);
    res.status(201).json({ message: 'Appointment booked successfully', booking });


 } catch (error) 
 {
   console.error("Error booking appointment:", error);
   res.status(500).json({ error: 'Failed to book appointment' });
 }
  
}



export const deleteAppointment= async (req,res)=>
{
    try {
        const { appointmentId } = req.params;
        console.log("Deleting appointment with ID:", appointmentId);
        await bookingServiceDeleteBooking(appointmentId);
        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error("Error deleting appointment:", error);
        res.status(500).json({ error: 'Failed to delete appointment' });
    }
}



export const changeStatusAppointment = async (req, res) => {

 try{
    const {id,status}= req.body;
    const changedAppointmentStatus =await changeBookingServiceChangeStatus(id,status);
    return res.status(200).json({ message: 'Appointment status changed successfully', changedAppointmentStatus });
 }
 catch (error)
 {
    console.log("Error : ",error);
    return res.status(500).json({message: "Appointment status change failed", error: error.message});

 }


}

export const getAllBookings = async (req, res) => {
    try {
        const Id = req.user.id;
        console.log("Fetching all bookings for doctor with ID:", Id);
        const bookings = await bookingServiceGetAllBookings(Id);
        return res.status(200).json({ message: 'All bookings fetched successfully', bookings });
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        return res.status(500).json({ message: 'Failed to fetch all bookings', error: error.message });
    }
}
export const GetBooking = async (req,res)=>
{
    try
    {
        const { bookingId } = req.params;
        const booking = await GetBookedAppointmentService(bookingId);
        return res.status(200).json({message : "Booking Found ",booking});
    }
    catch(error)
    {
        console.log("Error : ",error);
        return res.status(500).json({message:"Cannot get Booking ",error});
    }


}