//write a arrow fucntion of auth serivce and epxort ir named



import prisma from '../prisma.js';
import bcrypt from 'bcrypt';


export const authServiceRegister = async (name ,email,password,role)=>
{

    console.log("Auth Service Register called with:", { name, email,password });
 

    const user = await prisma.User.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10), // Hash the password
        role: role ? role : 'PATIENT' // Assuming role is a string like 'user' or 'admin'
      }
    });
    console.log("User created:", user);
    return user;
}


export  const authServiceLogin = async (email,password) => {
  console.log("Auth Service Login called with email:", email);
  
  const user = await prisma.user.findUnique({
    where: { email }
  });
  console.log("User found:", user);
  

  if (!user) {
    throw new Error('User not found');
  }
  

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  return user;
}



export const authServiceGetUsers = async () => {
  console.log("Auth Service Get Users called");
  
  const users = await prisma.user.findMany();
  console.log("Users fetched:", users);
  
  return users;
}

export const GetBookedAppointmentService = async (Id) => {
  console.log("Get Booked Appointment Service called with ID:", Id);
  const booking = await prisma.booking.findUnique({
    where: { id: Number(id) }
  });
  console.log("Booking found:", booking);
  return booking;
}


export const getAppointmentsServiceUser = async (userId) => {
  console.log("Get Appointments Service User called with userId:", userId);
  
  const appointments = await prisma.appointment.findMany({
    where: { userId },
    include: {
      doctor: true
    }
  });
  
  console.log("Appointments fetched for user:", appointments);
  
  return appointments;
}