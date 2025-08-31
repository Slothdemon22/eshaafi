import { adminServiceCreateDoctorFromApplication ,adminServiceGetDoctors, adminServiceGetDoctorApplications, adminServiceSubmitDoctorApplication, adminServiceRejectDoctorApplication, adminServiceGetClinicApplications, adminServiceSubmitClinicApplication, adminServiceRejectClinicApplication, adminServiceApproveClinicApplication, adminServiceGetClinics, adminServiceCreateClinicAdmin, adminServiceDeleteClinic, adminServiceGetClinicDetails } from '../services/adminService.js';
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
    // Get total doctors and breakdown
    const [totalDoctors, totalClinicDoctors, totalSoloDoctors] = await Promise.all([
      prisma.doctor.count(),
      prisma.doctor.count({ where: { clinicId: { not: null } } }),
      prisma.doctor.count({ where: { clinicId: null } })
    ]);
    // Get total patients (users with PATIENT role)
    const totalPatients = await prisma.user.count({
      where: { role: 'PATIENT' }
    });
    // Clinics
    const totalClinics = await prisma.clinic.count();
    // Appointments (all + breakdown by status)
    const totalAppointments = await prisma.booking.count();
    const pendingAppointments = await prisma.booking.count({ where: { status: 'PENDING' } });
    const bookedAppointments = await prisma.booking.count({ where: { status: 'BOOKED' } });
    const rejectedAppointments = await prisma.booking.count({ where: { status: 'REJECTED' } });
    const completedAppointments = await prisma.booking.count({ where: { status: 'COMPLETED' } });

    // Get recent appointments (last 10)
    const recentAppointments = await prisma.booking.findMany({
      orderBy: { dateTime: 'desc' },
      take: 10,
      include: {
        patient: { select: { name: true } },
        doctor: { select: { user: { select: { name: true } } } }
      }
    });

    // Top doctors by appointment count (fallback to doctors with zero if none)
    let topDoctors = [];
    try {
      const grouped = await prisma.booking.groupBy({
        by: ['doctorId'],
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 5
      });
      const doctorIds = grouped.map(g => g.doctorId);
      if (doctorIds.length > 0) {
        const doctors = await prisma.doctor.findMany({
          where: { id: { in: doctorIds } },
          include: { user: true }
        });
        topDoctors = grouped.map(g => {
          const d = doctors.find(doc => doc.id === g.doctorId);
          return d ? {
            id: d.id,
            name: d.user?.name || 'Unknown',
            specialty: d.specialty,
            appointmentCount: g._count._all
          } : null;
        }).filter(Boolean);
      }
      // Fallback: if still empty, pick up to 5 doctors with 0 appointments
      if (topDoctors.length === 0) {
        const fallbackDoctors = await prisma.doctor.findMany({
          take: 5,
          include: { user: true },
          orderBy: { id: 'asc' }
        });
        topDoctors = fallbackDoctors.map(d => ({
          id: d.id,
          name: d.user?.name || 'Unknown',
          specialty: d.specialty,
          appointmentCount: 0
        }));
      }
    } catch (e) {
      // As a last resort, empty array
      topDoctors = [];
    }

    // Clinics summary (top 10 by doctor count)
    const clinicsSummary = await prisma.clinic.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        _count: { select: { doctors: true } }
      },
      orderBy: { doctors: { _count: 'desc' } },
      take: 10
    });

    const stats = {
      totalUsers,
      totalDoctors,
      totalClinicDoctors,
      totalSoloDoctors,
      totalClinics,
      totalPatients,
      totalAppointments,
      pendingAppointments,
      bookedAppointments,
      rejectedAppointments,
      completedAppointments,
      totalRevenue: 0,
      recentAppointments: recentAppointments.map(a => ({
        id: a.id,
        patientName: a.patient?.name || 'Unknown',
        doctorName: a.doctor?.user?.name || 'Unknown',
        dateTime: a.dateTime,
        status: a.status
      })),
      topDoctors,
      clinicsSummary: clinicsSummary.map(c => ({
        id: c.id,
        name: c.name,
        city: c.city,
        country: c.country,
        doctorsCount: c._count.doctors
      }))
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

// Clinic controllers

export const listClinicApplications = async (req, res) => {
  try {
    const apps = await adminServiceGetClinicApplications();
    res.status(200).json({ applications: apps });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clinic applications' });
  }
}

export const approveClinicApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { clinic, user, plainPassword, generatedEmail } = await adminServiceApproveClinicApplication(id);
    res.status(200).json({ message: 'Clinic approved', clinic, adminUser: user, password: plainPassword, email: generatedEmail });
  } catch (error) {
    console.error('Error approving clinic application:', error);
    res.status(400).json({ error: error.message || 'Failed to approve' });
  }
}

export const rejectClinicApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await adminServiceRejectClinicApplication(id);
    res.status(200).json({ message: 'Application rejected', application: app });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to reject' });
  }
}

export const submitClinicApplication = async (req, res) => {
  try {
    const payload = req.body;
    const app = await adminServiceSubmitClinicApplication(payload);
    res.status(201).json({ message: 'Application submitted', application: app });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to submit application' });
  }
}

export const getClinics = async (req, res) => {
  try {
    const clinics = await adminServiceGetClinics();
    res.status(200).json({ clinics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clinics' });
  }
}

export const createClinicAdmin = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { name, email, password } = req.body;
    const result = await adminServiceCreateClinicAdmin(clinicId, { name, email, password });
    res.status(201).json({ message: 'Clinic admin created', ...result });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to create clinic admin' });
  }
}

export const deleteClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const result = await adminServiceDeleteClinic(clinicId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to delete clinic' });
  }
}

export const getClinicDetails = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const clinic = await adminServiceGetClinicDetails(clinicId);
    res.status(200).json({ clinic });
  } catch (error) {
    res.status(404).json({ error: error.message || 'Clinic not found' });
  }
}

// Super admin: update clinic info
export const updateClinicBySuperAdmin = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const data = req.body || {};
    const updated = await prisma.clinic.update({
      where: { id: Number(clinicId) },
      data: {
        name: data.name ?? undefined,
        email: data.email ?? undefined,
        phone: data.phone ?? undefined,
        addressLine1: data.addressLine1 ?? undefined,
        addressLine2: data.addressLine2 ?? undefined,
        city: data.city ?? undefined,
        state: data.state ?? undefined,
        country: data.country ?? undefined,
        zip: data.zip ?? undefined,
        website: data.website ?? undefined,
        logoUrl: data.logoUrl ?? undefined,
        description: data.description ?? undefined,
      }
    });
    res.status(200).json({ message: 'Clinic updated', clinic: updated });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to update clinic' });
  }
}

// Toggle clinic active status
export const setClinicActive = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { active } = req.body;
    const updated = await prisma.clinic.update({ where: { id: Number(clinicId) }, data: { active: !!active } });
    res.status(200).json({ message: 'Clinic status updated', clinic: updated });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to update clinic' });
  }
}

// Toggle doctor active status
export const setDoctorActive = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { active } = req.body;
    const updated = await prisma.doctor.update({ where: { id: Number(doctorId) }, data: { active: !!active } });
    res.status(200).json({ message: 'Doctor status updated', doctor: updated });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to update doctor' });
  }
}

export const getClinicAppointments = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const id = Number(clinicId);
    const clinic = await prisma.clinic.findUnique({ where: { id } });
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    const appointments = await prisma.booking.findMany({
      where: { doctor: { clinicId: id } },
      orderBy: { dateTime: 'desc' },
      take: 100,
      include: {
        patient: { select: { id: true, name: true, email: true } },
        doctor: { include: { user: { select: { id: true, name: true, email: true } } } }
      }
    });
    res.status(200).json({ appointments: appointments.map(a => ({
      id: a.id,
      dateTime: a.dateTime,
      status: a.status,
      patient: { id: a.patient?.id, name: a.patient?.name, email: a.patient?.email },
      doctor: { id: a.doctor?.id, name: a.doctor?.user?.name, email: a.doctor?.user?.email }
    })) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clinic appointments' });
  }
}
