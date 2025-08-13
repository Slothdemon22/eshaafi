
import prisma from '../prisma.js';


export const bookingServiceAddBooking = async (patientId, doctorId, dateTime, reason, symptoms) => {
    console.log("Booking Service Add Booking called with:", { patientId, doctorId, dateTime, reason, symptoms });

    const booking = await prisma.booking.create({
        data: {
            patientId,
            doctorId,
            dateTime: new Date(dateTime),
            reason: reason || null,
            symptoms: symptoms || null,
            status: 'PENDING'
        }
    });
    
    console.log("Booking created:", booking);
    return booking;
}

export const bookingServiceDeleteBooking = async (id) => {
    console.log("Booking Service delete booking called with ID:", id);


        const deletedBooking = await prisma.booking.delete({
            where: { id: Number(id) }
        });

        console.log("Booking deleted:", deletedBooking);
        return deletedBooking;
   
};



export const changeBookingServiceChangeStatus = async (id, status) => {
    const changedBooking = await prisma.booking.update({
        where: { id: Number(id) },
        data: { status: status },
        select: { id: true, status: true }
    });
    console.log("Changed Appointment Status to ", changedBooking.status);
    return changedBooking;
}


export const GetBookedAppointmentService=async( id )=>
{
    const booking = await prisma.booking.findUnique({
        where: { id: Number(id) },
        include: {
            prescription: true
        }
    });
    return booking;
}

export const bookingServiceGetAllBookings = async (Id) => {
    console.log("Booking Service Get All Bookings called");

    const bookings = await prisma.booking.findMany({
        where: { doctorId: Id },
        orderBy: { dateTime: 'asc' },
        include: {
            patient: true,
            doctor: true,
            prescription: true
        }
    });

    console.log("All bookings fetched:", bookings);
    return bookings;
}

export const createPrescriptionService = async (bookingId, medications, dosage, frequency, duration, notes) => {
    console.log("Creating prescription for booking:", bookingId);
    
    const prescription = await prisma.prescription.create({
        data: {
            bookingId: Number(bookingId),
            medications,
            dosage,
            frequency,
            duration,
            notes: notes || null
        }
    });
    
    console.log("Prescription created:", prescription);
    return prescription;
}

export const getPrescriptionService = async (bookingId) => {
    console.log("Getting prescription for booking:", bookingId);
    
    const prescription = await prisma.prescription.findUnique({
        where: { bookingId: Number(bookingId) }
    });
    
    console.log("Prescription found:", prescription);
    return prescription;
}

export const updatePrescriptionService = async (bookingId, medications, dosage, frequency, duration, notes) => {
    console.log("Updating prescription for booking:", bookingId);
    
    const prescription = await prisma.prescription.upsert({
        where: { bookingId: Number(bookingId) },
        update: {
            medications,
            dosage,
            frequency,
            duration,
            notes: notes || null
        },
        create: {
            bookingId: Number(bookingId),
            medications,
            dosage,
            frequency,
            duration,
            notes: notes || null
        }
    });
    
    console.log("Prescription updated:", prescription);
    return prescription;
}
