import { adminServiceCreateDoctorFromApplication ,adminServiceGetDoctors, adminServiceGetDoctorApplications, adminServiceSubmitDoctorApplication, adminServiceRejectDoctorApplication } from '../services/adminService.js';
import prisma from '../prisma.js';
import bcrypt from 'bcrypt';

export const listDoctorApplications = async (req, res) => {
  const apps = await adminServiceGetDoctorApplications();
  res.status(200).json({ applications: apps });
}

export const approveDoctorApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, plainPassword } = await adminServiceCreateDoctorFromApplication(id);
    res.status(200).json({ message: 'Doctor approved', doctor: user, password: plainPassword });
  } catch (error) {
    console.error('Error approving doctor application:', error);
    res.status(400).json({ error: error.message || 'Failed to approve' });
  }
}

export const rejectDoctorApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await adminServiceRejectDoctorApplication(id);
    res.status(200).json({ message: 'Application rejected', application: app });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to reject' });
  }
}

export const submitDoctorApplication = async (req, res) => {
  try {
    const payload = req.body;
    const app = await adminServiceSubmitDoctorApplication(payload);
    res.status(201).json({ message: 'Application submitted', application: app });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to submit application' });
  }
}

export const getDoctors = async (req, res) => {

  try
  {
     const doctors = await adminServiceGetDoctors();
     console.log("Doctors fetched:", doctors);
     res.status(200).json({ message: 'Doctors fetched successfully', doctors });
  }
  catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
}

export const getSystemStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await prisma.user.count();
    
    // Get total doctors
    const totalDoctors = await prisma.doctor.count();
    
    // Get total patients (users with PATIENT role)
    const totalPatients = await prisma.user.count({
      where: { role: 'PATIENT' }
    });
    
    // Get total appointments
    const totalAppointments = await prisma.booking.count();
    
    // Get pending appointments
    const pendingAppointments = await prisma.booking.count({
      where: { status: 'PENDING' }
    });
    
    // Get completed appointments
    const completedAppointments = await prisma.booking.count({
      where: { status: 'COMPLETED' }
    });
    
    const stats = {
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      pendingAppointments,
      completedAppointments
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching system stats:", error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
};

export const addUser = async (req, res) => {
  try {
    const { name, email, password, role, location, specialty } = req.body;
    console.log("Add User called with body:", name, email, password, role, location, specialty);
    
    // Create user with DOCTOR role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
        role: "DOCTOR"
      }
    });

    // Create doctor profile
    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        location,
        specialty
      }
    });

    res.status(201).json({ message: 'User added successfully', user, doctor });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: 'Failed to add user' });
  }
};


