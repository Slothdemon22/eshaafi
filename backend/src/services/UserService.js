//write a arrow fucntion of auth serivce and epxort ir named



import prisma from '../prisma.js';
import bcrypt from 'bcrypt';


export const authServiceRegister = async (name ,email,password)=>
{
    console.log("Auth Service Register called with:", { name, email });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
        role: 'PATIENT'
      }
    });
    console.log("User created:", user);
    return user;
}


export  const authServiceLogin = async (email,password) => {
  console.log("Auth Service Login called with email:", email);
  
  // Hardcoded admin credentials
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    return { id: 0, name: 'Admin', email, role: 'ADMIN' };
  }

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

export const GetBookedAppointmentService = async (id) => {
  console.log("Get Booked Appointment Service called with ID:", id);
  const booking = await prisma.booking.findUnique({
    where: { id: Number(id) },
    include: {
      prescription: true
    }
  });
  console.log("Booking found:", booking);
  return booking;
}


export const getAppointmentsServiceUser = async (userId) => {
  console.log("Get Appointments Service User called with userId:", userId);
  
  const appointments = await prisma.booking.findMany({
    where: { patientId: userId },
    include: {
      doctor: {
        include: {
          user: true
        }
      },
      prescription: true
    }
  });
  
  // For each appointment, fetch the corresponding slot to get duration
  const appointmentsWithDuration = await Promise.all(
    appointments.map(async (apt) => {
      // Extract date, startTime from booking
      const date = apt.dateTime;
      const doctorId = apt.doctorId;
      // Get time string in HH:mm format
      const startTime = new Date(date).toTimeString().slice(0,5);
      // Find the slot for this doctor, date, and startTime
      const slot = await prisma.availabilitySlot.findFirst({
        where: {
          doctorId: doctorId,
          date: {
            equals: new Date(date.toISOString().split('T')[0])
          },
          startTime: startTime
        }
      });
      return {
        ...apt,
        slotDuration: slot ? slot.duration : null
      };
    })
  );
  
  console.log("Appointments fetched for user (with duration):", appointmentsWithDuration);
  
  return appointmentsWithDuration;
}