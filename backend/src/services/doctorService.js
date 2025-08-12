import prisma from "../prisma.js";


export const getProfileServiceDoctor= async (Id) => {
    try {
        const doctorProfile = await prisma.doctor.findUnique({
            where: { id: doctorId },
        });
        return doctorProfile;
    } catch (error) {
        console.error("Error fetching doctor profile:", error);
        throw new Error("Could not retrieve doctor profile");
    }
};

export const addAvailabilityService = async (doctorId, date, timeSlotStart, timeSlotEnd) => {
    try {
        const availability = await prisma.availability.create({
            data: {
                doctorId,
                dateOfWeek: date,
                timeSlotStart: new Date(timeSlotStart),
                timeSlotEnd: new Date(timeSlotEnd),
            },
        });
        return availability;
    } catch (error) {
        console.error("Error adding availability:", error);
        throw new Error("Could not add availability");
    }
}