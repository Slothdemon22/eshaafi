import { getClinicDoctorsService, getClinicApplicationsService, approveClinicDoctorApplicationService, rejectClinicDoctorApplicationService, updateClinicInfoService, removeDoctorFromClinicService, getClinicByIdService, submitClinicDoctorApplicationService, getClinicInfoService, getClinicDoctorStatsService } from '../services/clinicService.js';

export const getClinicInfo = async (req, res) => {
  console.log('getClinicInfo called');
  try {
    const clinic = await getClinicInfoService(req.user.id);
    console.log('Clinic info:', clinic);
    res.status(200).json({ clinic });
  } catch (error) {
    console.log('Error in getClinicInfo:', error);
    res.status(400).json({ error: error.message || 'Failed to fetch clinic info' });
  }
};

export const getClinicDoctors = async (req, res) => {
  try {
    const { clinicId, doctors } = await getClinicDoctorsService(req.user.id);
    res.status(200).json({ clinicId, doctors });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to fetch doctors' });
  }
};

export const getClinicApplications = async (req, res) => {
  console.log('getClinicApplications called');
  try {
    const { clinicId, applications } = await getClinicApplicationsService(req.user.id);
    console.log('Applications:', applications);
    res.status(200).json({ clinicId, applications });
  } catch (error) {
    console.log('Error in getClinicApplications:', error);
    res.status(400).json({ error: error.message || 'Failed to fetch applications' });
  }
};

export const approveClinicDoctorApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, plainPassword } = await approveClinicDoctorApplicationService(req.user.id, id);
    res.status(200).json({ message: 'Doctor approved', doctorUser: user, password: plainPassword });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to approve application' });
  }
};

export const rejectClinicDoctorApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await rejectClinicDoctorApplicationService(req.user.id, id);
    res.status(200).json({ message: 'Application rejected', application: app });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to reject application' });
  }
};

export const updateClinicInfo = async (req, res) => {
  try {
    const updated = await updateClinicInfoService(req.user.id, req.body);
    res.status(200).json({ message: 'Clinic updated', clinic: updated });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to update clinic' });
  }
};

export const removeDoctorFromClinic = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const updated = await removeDoctorFromClinicService(req.user.id, doctorId);
    res.status(200).json({ message: 'Doctor removed from clinic', doctor: updated });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to remove doctor' });
  }
};

export const getClinicById = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const clinic = await getClinicByIdService(clinicId);
    res.status(200).json({ clinic });
  } catch (error) {
    res.status(404).json({ error: error.message || 'Clinic not found' });
  }
};

export const getClinicDoctorStats = async (req, res) => {
  try {
    const stats = await getClinicDoctorStatsService(req.user.id);
    res.status(200).json({ stats });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to fetch doctor stats' });
  }
};

// Public: list active clinics
export const getPublicClinics = async (req, res) => {
  try {
    let clinics;
    try {
      clinics = await prisma.clinic.findMany({
        where: { active: true },
        select: { id: true, name: true, city: true, country: true, logoUrl: true, description: true }
      });
    } catch (e) {
      // Fallback for databases without the 'active' column yet
      clinics = await prisma.clinic.findMany({
        select: { id: true, name: true, city: true, country: true, logoUrl: true, description: true }
      });
    }
    res.status(200).json({ clinics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clinics' });
  }
};

// Public: list active doctors for a clinic
export const getPublicClinicDoctors = async (req, res) => {
  try {
    const { clinicId } = req.params;
    let clinic;
    try {
      clinic = await prisma.clinic.findUnique({ where: { id: Number(clinicId) }, select: { id: true, active: true } });
      if (!clinic || clinic.active === false) return res.status(404).json({ error: 'Clinic not available' });
    } catch (e) {
      // Fallback if 'active' column missing
      clinic = await prisma.clinic.findUnique({ where: { id: Number(clinicId) }, select: { id: true } });
      if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    }
    let doctors;
    try {
      doctors = await prisma.doctor.findMany({
        where: { clinicId: Number(clinicId), active: true },
        select: {
          id: true,
          specialty: true,
          location: true,
          user: { select: { name: true, email: true } }
        }
      });
    } catch (e) {
      doctors = await prisma.doctor.findMany({
        where: { clinicId: Number(clinicId) },
        select: {
          id: true,
          specialty: true,
          location: true,
          user: { select: { name: true, email: true } }
        }
      });
    }
    res.status(200).json({ doctors });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clinic doctors' });
  }
};

export const submitClinicDoctorApplication = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const payload = req.body;
    const { application, clinic } = await submitClinicDoctorApplicationService(clinicId, payload);
    res.status(201).json({ message: 'Application submitted', application, clinic });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to submit application' });
  }
};


