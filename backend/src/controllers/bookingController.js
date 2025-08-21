
import { bookingServiceAddBooking,bookingServiceDeleteBooking,changeBookingServiceChangeStatus,GetBookedAppointmentService,bookingServiceGetAllBookings, createPrescriptionService, getPrescriptionService, updatePrescriptionService, bookingServiceAddFollowUp } from '../services/bookingService.js';
import prisma from '../prisma.js';

export const bookAppointment = async (req, res) => {

 try
 {
    const { doctorId, dateTime, reason, symptoms, type } = req.body;
    const patientId = req.user.id;
    console.log("Booking appointment with data:", { patientId, doctorId, dateTime, reason, symptoms, type });
    const booking = await bookingServiceAddBooking(patientId, doctorId, dateTime, reason, symptoms, type || 'PHYSICAL');
   // console.log("Booking created:", booking);
    res.status(201).json({ message: 'Appointment booked successfully and pending doctor approval', booking });


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
    const {id, status, rejectionReason} = req.body;
    if (status === 'REJECTED' && (!rejectionReason || rejectionReason.trim() === '')) {
      return res.status(400).json({ message: 'Rejection reason is required.' });
    }
    const changedAppointmentStatus = await changeBookingServiceChangeStatus(id, status, rejectionReason);
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

export const createPrescription = async (req, res) => {
    try {
        const { bookingId, medications, dosage, frequency, duration, notes } = req.body;
        console.log("Creating prescription with data:", { bookingId, medications, dosage, frequency, duration, notes });
        
        const prescription = await createPrescriptionService(bookingId, medications, dosage, frequency, duration, notes);
        res.status(201).json({ message: 'Prescription created successfully', prescription });
    } catch (error) {
        console.error("Error creating prescription:", error);
        res.status(500).json({ error: 'Failed to create prescription' });
    }
}

export const getPrescription = async (req, res) => {
    try {
        const { bookingId } = req.params;
        console.log("Getting prescription for booking:", bookingId);
        
        const prescription = await getPrescriptionService(bookingId);
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        
        res.status(200).json({ message: 'Prescription found', prescription });
    } catch (error) {
        console.error("Error getting prescription:", error);
        res.status(500).json({ error: 'Failed to get prescription' });
    }
}

export const updatePrescription = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { medications, dosage, frequency, duration, notes } = req.body;
        console.log("Updating prescription for booking:", bookingId);
        
        const prescription = await updatePrescriptionService(bookingId, medications, dosage, frequency, duration, notes);
        res.status(200).json({ message: 'Prescription updated successfully', prescription });
    } catch (error) {
        console.error("Error updating prescription:", error);
        res.status(500).json({ error: 'Failed to update prescription' });
    }
}

export const createFollowUpAppointment = async (req, res) => {
    try {
        const { bookingId, dateTime, type } = req.body;
        if (!bookingId || !dateTime) {
            return res.status(400).json({ message: 'bookingId and dateTime are required' });
        }
        // Ensure only the doctor who owns the original booking can create a follow-up
        const requesterId = req.user?.id;
        const requesterRole = req.user?.role;
        if (!requesterId || requesterRole !== 'DOCTOR') {
            return res.status(403).json({ message: 'Only doctors can create follow-up appointments' });
        }
        const doctor = await prisma.doctor.findUnique({ where: { userId: requesterId } });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        const original = await prisma.booking.findUnique({ where: { id: Number(bookingId) } });
        if (!original) return res.status(404).json({ message: 'Original booking not found' });
        if (original.doctorId !== doctor.id) {
            return res.status(403).json({ message: 'You are not authorized to create a follow-up for this booking' });
        }

        const followUp = await bookingServiceAddFollowUp({ originalBookingId: bookingId, dateTime, type: type || 'PHYSICAL' });
        res.status(201).json({ message: 'Follow-up appointment created successfully', booking: followUp });
    } catch (error) {
        console.error('Error creating follow-up:', error);
        res.status(500).json({ error: 'Failed to create follow-up appointment' });
    }
}