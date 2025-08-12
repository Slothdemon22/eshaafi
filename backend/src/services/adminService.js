import prisma  from '../prisma.js';
import bcrypt from 'bcrypt';

export const adminServiceRegister = async (name, email, password, role, location, specialty) => {


    console.log("Admin Service Register called with:", { name, email, password, role });
    
    const user = await prisma.User.create({
        data: {
        name,
        email,
        password: await bcrypt.hash(password, 10), // Hash the password
        role: "DOCTOR" // Assuming role is a string like 'user' or 'admin'
        }
    });
    const data=await prisma.Doctor.create({
        data: {
            location,
            userId: user.id,
            specialty
        }
    });
    console.log("Doctor created:", data);
    console.log("User created:", user);
    return user;
    }



export const adminServiceGetDoctors = async () => {
    console.log("Admin Service Get Doctors called");
    
    const doctors = await prisma.Doctor.findMany({
        include: {
            user: true // Include user details
        }
    });
    console.log("Doctors fetched:", doctors);
    
    return doctors;
}
