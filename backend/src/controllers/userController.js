import prisma from '../prisma.js';
import jwt from 'jsonwebtoken';
import { authServiceRegister,authServiceLogin, getAppointmentsServiceUser, GetBookedAppointmentService } from '../services/UserService.js';


export const registerUser = async (req, res) => {
  try {
    console.log("Register User called with body:", req.body.name, req.body.email);
    const {name,email,password}=req.body;
    const userData= await authServiceRegister(name,email,password);

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
  

  const token = jwt.sign({ id: userData.id, role: userData.role, email: userData.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

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

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    if (req.user.role === 'ADMIN') {
      return res.status(200).json({ user: { id: 0, name: 'Admin', email: req.user.email, role: 'ADMIN' } });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
          id: { not: userId }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    res.status(200).json({ 
      message: 'Profile updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const bcrypt = await import('bcrypt');
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: {
        id: 'desc'
      }
    });
    res.status(200).json({ message: 'Users fetched successfully', users });
  } catch (error) {
    console.error('Error fetching users:', error);
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

export const editUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
          id: { not: parseInt(userId) }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        name: name || undefined,
        email: email || undefined,
        role: role || undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    res.status(200).json({ 
      message: 'User updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete user (this will cascade delete related records)
    await prisma.user.delete({
      where: { id: parseInt(userId) }
    });
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export default { registerUser, getUsers, getAppointmentsUser, loginUser, GetBookingUser, getUserProfile, logoutUser, updateUserProfile, changePassword, editUser, deleteUser };