
import prisma from '../prisma.js';
import { create100msRoom, create100msRoomCode } from './videoService.js';


export const bookingServiceAddBooking = async (patientId, doctorId, dateTime, reason, symptoms, type = 'PHYSICAL') => {
    // Check if doctor and slot are available (pseudo, implement as needed)
    // For now, assume available
    const status = 'BOOKED'; // Booked by default
    let videoRoomId = null;
    if (type === 'VIRTUAL') {
        try {
            const room = await create100msRoom(`${patientId}_${doctorId}_${Date.now()}`);
            console.log('100ms room creation response:', room);
            const roomId = typeof room === 'string' ? room : (room && room.id ? room.id : null);
            if (!roomId) throw new Error('Room ID not found in 100ms room creation response');
            console.log('100ms roomId to use for room code:', roomId);
            videoRoomId = await create100msRoomCode(roomId); // store room code for prebuilt UI
            console.log('100ms room code created:', videoRoomId);
        } catch (err) {
            console.error('Error during 100ms room/room code creation:', err);
            throw err;
        }
    }
    const booking = await prisma.booking.create({
        data: {
            patientId,
            doctorId,
            dateTime: new Date(dateTime),
            reason: reason || null,
            symptoms: symptoms || null,
            status,
            type,
            videoRoomId
        }
    });
    console.log('Booking created with videoRoomId (roomCode):', videoRoomId);
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



export const changeBookingServiceChangeStatus = async (id, status, rejectionReason) => {
    const updateData = { status };
    if (status === 'REJECTED') {
        updateData.rejectionReason = rejectionReason;
    }
    const changedBooking = await prisma.booking.update({
        where: { id: Number(id) },
        data: updateData,
        select: { id: true, status: true, rejectionReason: true }
    });
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
