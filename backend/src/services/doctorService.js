import prisma from "../prisma.js";

export const getProfileServiceDoctor= async (id) => {
    try {
        const doctorProfile = await prisma.doctor.findUnique({
            where: { id: Number(id) },
            include: {
                user: true
            }
        });
        return doctorProfile;
    } catch (error) {
        console.error("Error fetching doctor profile:", error);
        throw new Error("Could not retrieve doctor profile");
    }
};

export const addAvailabilityService = async (doctorId, date, startTime, endTime, duration) => {
    try {
        const availability = await prisma.availabilitySlot.create({
            data: {
                doctorId: Number(doctorId),
                date: new Date(date),
                startTime: startTime,
                endTime: endTime,
                duration: duration
            },
        });
        return availability;
    } catch (error) {
        console.error("Error adding availability:", error);
        throw new Error("Could not add availability");
    }
}

export const getDoctorAvailabilityWithBookings = async (doctorId, date) => {
    try {
        console.log('Getting availability for doctor:', doctorId, 'date:', date);
        
        // Get all availability slots for the doctor on this specific date
        const slots = await prisma.availabilitySlot.findMany({
            where: { 
                doctorId: Number(doctorId),
                date: new Date(date)
            },
            orderBy: { startTime: 'asc' }
        });
        
        console.log('Found slots:', slots.length);

        // Get all bookings for this doctor on this date
        const bookings = await prisma.booking.findMany({
            where: {
                doctorId: Number(doctorId),
                dateTime: {
                    gte: new Date(date + 'T00:00:00'),
                    lt: new Date(date + 'T23:59:59')
                }
            }
        });
        
        console.log('Found bookings:', bookings.length);

        // Mark slots as booked if they have a booking
        const slotsWithBookingStatus = slots.map(slot => {
            const isBooked = bookings.some(booking => {
                const bookingTime = new Date(booking.dateTime);
                const bookingTimeString = bookingTime.toTimeString().slice(0, 5);
                return bookingTimeString === slot.startTime;
            });
            
            return {
                id: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                duration: slot.duration,
                isBooked,
                date: slot.date
            };
        });

        console.log('Processed slots:', slotsWithBookingStatus);
        return slotsWithBookingStatus;
    } catch (error) {
        console.error("Error fetching doctor availability:", error);
        throw new Error("Could not retrieve doctor availability");
    }
};

export const getAllDoctorsWithAvailability = async () => {
    try {
        const doctors = await prisma.doctor.findMany({
            include: {
                user: true,
                slots: {
                    orderBy: [
                        { date: 'asc' },
                        { startTime: 'asc' }
                    ]
                }
            }
        });

        return doctors.map(doctor => ({
            id: doctor.id,
            name: doctor.user.name,
            email: doctor.user.email,
            specialty: doctor.specialty,
            location: doctor.location,
            availability: doctor.slots
        }));
    } catch (error) {
        console.error("Error fetching doctors:", error);
        throw new Error("Could not retrieve doctors");
    }
};

export const deleteAvailabilitySlotService = async (slotId, doctorId) => {
    try {
        await prisma.availabilitySlot.delete({
            where: {
                id: Number(slotId),
                doctorId: Number(doctorId)
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Error deleting availability slot:", error);
        throw new Error("Could not delete availability slot");
    }
};