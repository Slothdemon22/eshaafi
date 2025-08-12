import {addAvailabilityService,getProfileDoctor} from '../services/doctorService.js';


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

    const { dayOfWeek, timeSlotStart, timeSlotEnd } = req.body;
    const doctorId = req.user.id;

    try {
        // Assuming you have a service to handle availability creation
        const availabilityData = await addAvailabilityService(doctorId, dayOfWeek, timeSlotStart, timeSlotEnd);
        res.status(201).json({ message: 'Availability added successfully', availability: availabilityData });
    } catch (error) {
        console.error("Error adding availability:", error);
        res.status(500).json({ error: 'Failed to add availability' });
    }
}