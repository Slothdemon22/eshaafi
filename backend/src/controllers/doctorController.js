import {addAvailabilityService,getProfileServiceDoctor, getDoctorAvailabilityWithBookings, getAllDoctorsWithAvailability, deleteAvailabilitySlotService} from '../services/doctorService.js';
import { adminServiceSubmitDoctorApplication } from '../services/adminService.js';
import prisma from '../prisma.js';
import pkg from '@prisma/client';
const { Speciality } = pkg;

export const getProfileDoctor =async (req,res)=>
{
    const Id =req.user.id;
    try
    {
        const doctorProfile= await getProfileServiceDoctor(Id);
        if(!doctorProfile)
        {
            return res.status(404).json({message:"Doctor profile not found"});
        }
        return res.status(200).json(doctorProfile);
    }
    catch (error)
    {
        console.error("Error fetching doctor profile:", error);
        return res.status(500).json({message:"Internal server error"});
    }
}

export const addAvailabilityDoctor = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { date, startTime, endTime, duration, location, custom } = req.body;
        
        // First get the doctor record
        const doctor = await prisma.doctor.findUnique({
            where: { userId: doctorId }
        });
        
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        
        const availabilityData = await addAvailabilityService(doctor.id, date, startTime, endTime, duration, location, custom);
        res.status(201).json({ message: 'Availability added successfully', availability: availabilityData });
    } catch (error) {
        console.error("Error adding availability:", error);
        res.status(500).json({ error: 'Failed to add availability' });
    }
}

export const getDoctorAvailabilityWithBookingsController = async (req, res) => {
    try {
        const { doctorId, date } = req.query;
        const availability = await getDoctorAvailabilityWithBookings(doctorId, date);
        res.status(200).json({ availability });
    } catch (error) {
        console.error("Error fetching doctor availability:", error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
};

export const getAllDoctorsForBooking = async (req, res) => {
    try {
        const doctors = await getAllDoctorsWithAvailability();
        res.status(200).json({ doctors });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
};

export const addMultipleAvailabilitySlots = async (req, res) => {
    try {
        const { slots } = req.body;
        const doctorId = req.user.id;

        // First get the doctor record
        const doctor = await prisma.doctor.findUnique({
            where: { userId: doctorId }
        });

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        const createdSlots = [];
        for (const slot of slots) {
            const { date, startTime, endTime, duration, location, custom } = slot;
            
            // Check if slot already exists
            const existingSlot = await prisma.availabilitySlot.findFirst({
                where: {
                    doctorId: doctor.id,
                    date: new Date(date),
                    startTime: startTime,
                    endTime: endTime
                }
            });

            if (!existingSlot) {
                const newSlot = await prisma.availabilitySlot.create({
                    data: {
                        doctorId: doctor.id,
                        date: new Date(date),
                        startTime: startTime,
                        endTime: endTime,
                        duration: duration,
                        location: location || null,
                        custom: custom || false
                    }
                });
                createdSlots.push(newSlot);
            }
        }

        res.status(201).json({ 
            message: 'Availability slots added successfully', 
            slots: createdSlots 
        });
    } catch (error) {
        console.error("Error adding availability slots:", error);
        res.status(500).json({ error: 'Failed to add availability slots' });
    }
};

export const deleteAvailabilitySlot = async (req, res) => {
    try {
        const { slotId } = req.params;
        const doctorId = req.user.id;
        
        // First get the doctor record
        const doctor = await prisma.doctor.findUnique({
            where: { userId: doctorId }
        });
        
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        await deleteAvailabilitySlotService(slotId, doctor.id);
        
        res.status(200).json({ 
            message: 'Availability slot deleted successfully' 
        });
    } catch (error) {
        console.error("Error deleting availability slot:", error);
        res.status(500).json({ error: 'Failed to delete availability slot' });
    }
};

// Utility to get specialities from Prisma enum
export const getSpecialities = (req, res) => {
  const specialities = Object.keys(Speciality);
  const labels = {
    GENERAL_DOCTOR: 'General Doctor (Family Medicine)',
    PEDIATRICS: 'Child Doctor (Pediatrics)',
    CARDIOLOGY: 'Heart Doctor (Cardiology)',
    DERMATOLOGY: 'Skin Doctor (Dermatology)',
    NEUROLOGY: 'Brain & Nerves Doctor (Neurology)',
    ORTHOPEDICS: 'Bone & Joint Doctor (Orthopedics)',
    OPHTHALMOLOGY: 'Eye Doctor (Ophthalmology)',
    ENT: 'Ear, Nose & Throat Doctor (ENT)',
    GYNECOLOGY: 'Women’s Health Doctor (Gynecology)',
    UROLOGY: 'Urine & Kidney Doctor (Urology)',
    GASTROENTEROLOGY: 'Stomach Doctor (Gastroenterology)',
    ENDOCRINOLOGY: 'Diabetes & Hormone Doctor (Endocrinology)',
    ONCOLOGY: 'Cancer Doctor (Oncology)',
    PSYCHIATRY: 'Mental Health Doctor (Psychiatry)',
    PULMONOLOGY: 'Lungs Doctor (Pulmonology)',
    RHEUMATOLOGY: 'Arthritis Doctor (Rheumatology)',
    DENTIST: 'Dentist',
    PHYSIOTHERAPIST: 'Physiotherapist',
    DIET_NUTRITION: 'Diet & Nutrition Expert',
  };
  res.json(specialities.map(key => ({ value: key, label: labels[key] })));
};

export const getDoctorCountsBySpeciality = async (req, res) => {
  try {
    const specialities = Object.keys(Speciality);
    const counts = {};
    for (const spec of specialities) {
      counts[spec] = await prisma.doctor.count({ where: { specialty: spec } });
    }
    res.json(counts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctor counts by speciality' });
  }
};

export const updateDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { location, specialty } = req.body;
        if (specialty && !Object.values(Speciality).includes(specialty)) {
            return res.status(400).json({ error: 'Invalid specialty' });
        }
        const updatedDoctor = await prisma.doctor.update({
            where: { userId: doctorId },
            data: {
                location: location || undefined,
                specialty: specialty || undefined
            },
            include: {
                user: true
            }
        });
        res.status(200).json({
            message: 'Doctor profile updated successfully',
            doctor: updatedDoctor
        });
    } catch (error) {
        console.error("Error updating doctor profile:", error);
        res.status(500).json({ error: 'Failed to update doctor profile' });
    }
};

export const getDoctorAppointments = async (req, res) => {
    try {
        const doctorId = req.user.id;
        
        // First get the doctor record
        const doctor = await prisma.doctor.findUnique({
            where: { userId: doctorId }
        });
        
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        
        const appointments = await prisma.booking.findMany({
            where: { doctorId: doctor.id },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                dateTime: 'desc'
            }
        });
        
        res.status(200).json({ 
            message: 'Doctor appointments fetched successfully', 
            appointments 
        });
    } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        res.status(500).json({ error: 'Failed to fetch doctor appointments' });
    }
};

export const getDoctorAvailability = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { date } = req.query;
        
        // First get the doctor record
        const doctor = await prisma.doctor.findUnique({
            where: { userId: doctorId }
        });
        
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        
        let slots;
        if (date) {
            // Get slots for specific date
            slots = await prisma.availabilitySlot.findMany({
                where: { 
                    doctorId: doctor.id,
                    date: new Date(date)
                },
                orderBy: { startTime: 'asc' }
            });
        } else {
            // Get all slots
            slots = await prisma.availabilitySlot.findMany({
                where: { doctorId: doctor.id },
                orderBy: [
                    { date: 'asc' },
                    { startTime: 'asc' }
                ]
            });
        }
        
        res.status(200).json({ 
            message: 'Availability slots fetched successfully', 
            slots 
        });
    } catch (error) {
        console.error("Error fetching availability slots:", error);
        res.status(500).json({ error: 'Failed to fetch availability slots' });
    }
};

export const submitDoctorApplication = async (req, res) => {
    try {
        const { name, email, phone, location, specialty, experienceYears, credentials } = req.body;
        if (!Object.values(Speciality).includes(specialty)) {
            return res.status(400).json({ error: 'Invalid specialty' });
        }
        const application = await adminServiceSubmitDoctorApplication({
            name,
            email,
            phone,
            location,
            specialty,
            experienceYears: experienceYears ? Number(experienceYears) : null,
            credentials
        });
        res.status(201).json({ message: 'Application submitted', application });
    } catch (error) {
        console.error('Error submitting doctor application:', error);
        res.status(400).json({ error: error.message || 'Failed to submit application' });
    }
}

// Set doctor online/offline status (POST /api/doctor/status)
export const setDoctorOnlineStatus = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { online } = req.body;
    const doctor = await prisma.doctor.update({
      where: { userId: doctorId },
      data: { online: !!online },
    });
    res.status(200).json({ online: doctor.online });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update online status' });
  }
};

// Get doctor online status (GET /api/doctor/status/:doctorId)
export const getDoctorOnlineStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await prisma.doctor.findUnique({
      where: { id: Number(doctorId) }
    });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.status(200).json({ online: doctor.online });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch online status' });
  }
};