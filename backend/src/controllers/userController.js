import prisma from '../prisma.js';
import jwt from 'jsonwebtoken';
import { authServiceRegister,authServiceLogin } from '../services/UserService.js';


export const registerUser = async (req, res) => {
  try {
    console.log("Register User called with body:", req.body.name, req.body.email, req.body.password, req.body.role);
    const {name,email,password,role}=req.body;
    const userData= await authServiceRegister(name,email,password,role);

    res.status(201).json({ message: 'User registered successfully', user: userData   });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: 'Failed to register user' });
  }
}

export const loginUser=async (req,res)=>
{
   const {email,password}=req.body;
   const userData=await authServiceLogin(email,password);
  

  const token = jwt.sign({ id: userData.id, role: userData.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only https in prod
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 dayz
  });
  return res.status(200).json({
    message: 'Login successful',
    user: userData
  });
}


export const getUsers = async (req, res) => {
  try {
    const users = await authServiceGetUsers();
    res.status(200).json({ message: 'Users fetched successfully', users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getAppointmentsUser =async (req, res) => {
  const userId = req.user.id;
  try {
    const appointments = await getAppointmentsServiceUser(userId);
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found for this user' });
    }
    res.status(200).json({ message: 'User appointments fetched successfully', appointments })

  }
  catch(error)
  {
    console.error("Error fetching user appointments:", error);
    res.status(500).json({ error: 'Failed to fetch user appointments' });
  }
};

export const GetBookingUser = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    console.log("Fetching booking with ID:", appointmentId);
    const booking = await GetBookedAppointmentService(appointmentId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    } 
    return res.status(200).json({ message: 'Booking found', booking });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return res.status(500).json({ message: 'Failed to fetch booking', error: error.message });
  }
}

export default { registerUser, getUsers, getAppointmentsUser, loginUser, GetBookingUser };