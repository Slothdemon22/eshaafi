import prisma from "../prisma.js";

export const getProfileServiceDoctor= async (id) => {
    try {
        const doctorProfile = await prisma.doctor.findUnique({
            where: { userId: Number(id) }, // FIX: use userId instead of id
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

export const addAvailabilityService = async (doctorId, date, startTime, endTime, duration, location, custom = false) => {
    try {
        const availability = await prisma.availabilitySlot.create({
            data: {
                doctorId: Number(doctorId),
                date: new Date(date),
                startTime: startTime,
                endTime: endTime,
                duration: duration,
                location: location || null,
                custom: custom
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
                date: slot.date,
                location: slot.location || null,
                custom: slot.custom // include custom flag
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
                },
                clinic: true
            }
        });

        return doctors.map(doctor => ({
            id: doctor.id,
            name: doctor.user.name,
            email: doctor.user.email,
            specialty: doctor.specialty,
            location: doctor.location,
            availability: doctor.slots,
            clinicId: doctor.clinicId || null,
            // Treat missing active column as true to avoid breaking older DBs
            active: typeof doctor.active === 'boolean' ? doctor.active : true,
            clinicActive: doctor.clinic ? (typeof doctor.clinic.active === 'boolean' ? doctor.clinic.active : true) : true
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

export const createReviewService = async ({ doctorId, patientId, appointmentId, behaviourRating, recommendationRating, reviewText }) => {
  // Check if appointment exists, is completed, and belongs to patient and doctor
  const appointment = await prisma.booking.findUnique({
    where: { id: appointmentId },
    include: { doctor: true, patient: true }
  });
  if (!appointment) throw new Error('Appointment not found');
  if (appointment.status !== 'COMPLETED') throw new Error('Only completed appointments can be reviewed');
  if (appointment.doctorId !== doctorId || appointment.patientId !== patientId) throw new Error('You can only review your own completed appointments');
  // Check if review already exists for this appointment and patient
  const existing = await prisma.review.findUnique({ where: { appointmentId } });
  if (existing) throw new Error('You have already reviewed this appointment');
  // Create review
  return prisma.review.create({
    data: {
      doctorId,
      patientId,
      appointmentId,
      behaviourRating,
      recommendationRating,
      reviewText
    }
  });
};

export const getDoctorReviewsService = async (doctorId) => {
  return prisma.review.findMany({
    where: { doctorId },
    include: {
      patient: { select: { id: true, name: true, email: true } },
      appointment: { select: { dateTime: true, reason: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getDoctorReviewSummaryService = async (doctorId) => {
  const reviews = await prisma.review.findMany({ where: { doctorId } });
  const count = reviews.length;
  if (count === 0) return { count: 0, avgBehaviour: null, avgRecommendation: null };
  const avgBehaviour = reviews.reduce((sum, r) => sum + r.behaviourRating, 0) / count;
  const avgRecommendation = reviews.reduce((sum, r) => sum + r.recommendationRating, 0) / count;
  return {
    count,
    avgBehaviour: Number(avgBehaviour.toFixed(2)),
    avgRecommendation: Number(avgRecommendation.toFixed(2))
  };
};