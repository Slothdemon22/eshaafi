import prisma from '../prisma.js';
import bcrypt from 'bcrypt';

export const getClinicByAdminUserId = async (userId) => {
  const link = await prisma.clinicAdmin.findUnique({ where: { userId: Number(userId) }, include: { clinic: true } });
  if (!link) throw new Error('Clinic admin not linked to any clinic');
  return link.clinic;
};

export const getClinicInfoService = async (userId) => {
  const clinic = await getClinicByAdminUserId(userId);
  return {
    id: clinic.id,
    name: clinic.name,
    email: clinic.email,
    phone: clinic.phone,
    addressLine1: clinic.addressLine1,
    addressLine2: clinic.addressLine2,
    city: clinic.city,
    state: clinic.state,
    country: clinic.country,
    zip: clinic.zip,
    website: clinic.website,
    logoUrl: clinic.logoUrl,
    description: clinic.description,
  };
};

export const getClinicDoctorsService = async (userId) => {
  const clinic = await getClinicByAdminUserId(userId);
  const doctors = await prisma.doctor.findMany({ where: { clinicId: clinic.id }, include: { user: { select: { id: true, name: true, email: true } } } });
  return { clinicId: clinic.id, doctors };
};

export const getClinicApplicationsService = async (userId) => {
  const clinic = await getClinicByAdminUserId(userId);
  const applications = await prisma.doctorApplication.findMany({ where: { clinicId: clinic.id }, orderBy: { createdAt: 'desc' } });
  return { clinicId: clinic.id, applications };
};

export const approveClinicDoctorApplicationService = async (userId, applicationId) => {
  const clinic = await getClinicByAdminUserId(userId);
  const application = await prisma.doctorApplication.findUnique({ where: { id: Number(applicationId) } });
  if (!application) throw new Error('Application not found');
  if (application.status !== 'PENDING') throw new Error('Application already processed');
  if (application.clinicId !== clinic.id) throw new Error('Application does not belong to your clinic');

  const plainPassword = application.generatedPassword || Math.random().toString(36).slice(-10);
  const user = await prisma.user.create({
    data: {
      name: application.name,
      email: application.email,
      password: await bcrypt.hash(plainPassword, 10),
      role: 'DOCTOR'
    }
  });

  await prisma.doctor.create({
    data: {
      location: application.location,
      userId: user.id,
      specialty: application.specialty,
      clinicId: clinic.id
    }
  });

  await prisma.doctorApplication.update({ where: { id: application.id }, data: { status: 'APPROVED', generatedPassword: plainPassword } });
  return { user, plainPassword };
};

export const rejectClinicDoctorApplicationService = async (userId, applicationId) => {
  const clinic = await getClinicByAdminUserId(userId);
  const application = await prisma.doctorApplication.findUnique({ where: { id: Number(applicationId) } });
  if (!application) throw new Error('Application not found');
  if (application.clinicId !== clinic.id) throw new Error('Application does not belong to your clinic');
  const app = await prisma.doctorApplication.update({ where: { id: application.id }, data: { status: 'REJECTED' } });
  return app;
};

export const updateClinicInfoService = async (userId, payload) => {
  const clinic = await getClinicByAdminUserId(userId);
  const updated = await prisma.clinic.update({
    where: { id: clinic.id },
    data: {
      name: payload.name ?? undefined,
      email: payload.email ?? undefined,
      phone: payload.phone ?? undefined,
      addressLine1: payload.addressLine1 ?? undefined,
      addressLine2: payload.addressLine2 ?? undefined,
      city: payload.city ?? undefined,
      state: payload.state ?? undefined,
      country: payload.country ?? undefined,
      zip: payload.zip ?? undefined,
      website: payload.website ?? undefined,
      logoUrl: payload.logoUrl ?? undefined,
      description: payload.description ?? undefined,
    }
  });
  return updated;
};

export const removeDoctorFromClinicService = async (userId, doctorId) => {
  const clinic = await getClinicByAdminUserId(userId);
  const doctor = await prisma.doctor.findUnique({ where: { id: Number(doctorId) } });
  if (!doctor) throw new Error('Doctor not found');
  if (doctor.clinicId !== clinic.id) throw new Error('Doctor does not belong to your clinic');
  const updated = await prisma.doctor.update({ where: { id: doctor.id }, data: { clinicId: null } });
  return updated;
};

export const getClinicDoctorStatsService = async (userId) => {
  const clinic = await getClinicByAdminUserId(userId);
  // Aggregate appointment stats per doctor in this clinic
  const doctors = await prisma.doctor.findMany({
    where: { clinicId: clinic.id },
    select: {
      id: true,
      userId: true,
      specialty: true,
      user: { select: { name: true, email: true } }
    }
  });
  const doctorIds = doctors.map(d => d.id);
  if (doctorIds.length === 0) return [];
  
  const [bookings, reviews] = await Promise.all([
    prisma.booking.findMany({ where: { doctorId: { in: doctorIds } } }),
    prisma.review.findMany({ where: { doctorId: { in: doctorIds } } })
  ]);
  
  const byDoctor = new Map();
  for (const d of doctors) {
    byDoctor.set(d.id, { 
      doctorId: d.id, 
      name: d.user.name, 
      email: d.user.email, 
      specialty: d.specialty, 
      total: 0, 
      pending: 0, 
      booked: 0, 
      completed: 0, 
      rejected: 0,
      reviewCount: 0,
      averageRating: 0
    });
  }
  
  for (const b of bookings) {
    const row = byDoctor.get(b.doctorId);
    if (!row) continue;
    row.total += 1;
    row[b.status.toLowerCase()] = (row[b.status.toLowerCase()] || 0) + 1;
  }
  
  // Calculate review stats
  const reviewStats = new Map();
  for (const review of reviews) {
    if (!reviewStats.has(review.doctorId)) {
      reviewStats.set(review.doctorId, { count: 0, totalRating: 0 });
    }
    const stats = reviewStats.get(review.doctorId);
    stats.count += 1;
    stats.totalRating += (review.behaviourRating + review.recommendationRating) / 2;
  }
  
  for (const [doctorId, stats] of reviewStats) {
    const row = byDoctor.get(doctorId);
    if (row) {
      row.reviewCount = stats.count;
      row.averageRating = stats.count > 0 ? stats.totalRating / stats.count : 0;
    }
  }
  
  return Array.from(byDoctor.values());
};

export const getClinicByIdService = async (clinicId) => {
  const clinic = await prisma.clinic.findUnique({
    where: { id: Number(clinicId) },
    select: { id: true, name: true, email: true, city: true, country: true }
  });
  if (!clinic) throw new Error('Clinic not found');
  return clinic;
};

export const submitClinicDoctorApplicationService = async (clinicId, payload) => {
  // Verify clinic exists
  const clinic = await getClinicByIdService(clinicId);
  
  // Check for existing application
  const existing = await prisma.doctorApplication.findFirst({ 
    where: { email: payload.email, clinicId: Number(clinicId), status: 'PENDING' } 
  });
  if (existing) throw new Error('Application already submitted for this clinic');
  
  // Prepare data with proper types
  const applicationData = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone || null,
    location: payload.location,
    specialty: payload.specialty,
    experienceYears: payload.experienceYears ? parseInt(payload.experienceYears) : null,
    credentials: payload.credentials || null,
    education: payload.education ? JSON.stringify([payload.education]) : JSON.stringify([]),
    workExperience: payload.workExperience ? JSON.stringify([payload.workExperience]) : null,
    clinicId: Number(clinicId)
  };
  
  // Create application with clinicId
  const app = await prisma.doctorApplication.create({ 
    data: applicationData
  });
  return { application: app, clinic };
};


