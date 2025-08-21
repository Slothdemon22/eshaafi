import express from 'express';
import { addUser, listDoctorApplications, approveDoctorApplication, rejectDoctorApplication, getSystemStats, listClinicApplications, approveClinicApplication, rejectClinicApplication, submitClinicApplication, getClinics, createClinicAdmin, deleteClinic, getClinicDetails, getClinicAppointments, setClinicActive, setDoctorActive, updateClinicBySuperAdmin } from '../controllers/adminController.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import { superAdminMiddleware } from '../middlewares/superAdminMiddleware.js';

const adminRouter = express.Router();

adminRouter.post('/addUser', adminMiddleware, addUser);
// Doctor applications
adminRouter.get("/applications", adminMiddleware, listDoctorApplications);
adminRouter.post("/applications/:id/approve", adminMiddleware, approveDoctorApplication);
adminRouter.post("/applications/:id/reject", adminMiddleware, rejectDoctorApplication);
// Clinic applications (SUPER_ADMIN only)
adminRouter.get('/clinics/applications', superAdminMiddleware, listClinicApplications);
adminRouter.post('/clinics/applications/:id/approve', superAdminMiddleware, approveClinicApplication);
adminRouter.post('/clinics/applications/:id/reject', superAdminMiddleware, rejectClinicApplication);
// Clinics (SUPER_ADMIN only)
adminRouter.get('/clinics', superAdminMiddleware, getClinics);
adminRouter.post('/clinics/:clinicId/admins', superAdminMiddleware, createClinicAdmin);
adminRouter.delete('/clinics/:clinicId', superAdminMiddleware, deleteClinic);
adminRouter.get('/clinics/:clinicId', superAdminMiddleware, getClinicDetails);
adminRouter.get('/clinics/:clinicId/appointments', superAdminMiddleware, getClinicAppointments);
adminRouter.put('/clinics/:clinicId/active', superAdminMiddleware, setClinicActive);
adminRouter.put('/clinics/:clinicId', superAdminMiddleware, updateClinicBySuperAdmin);
adminRouter.put('/doctors/:doctorId/active', superAdminMiddleware, setDoctorActive);
// Stats
adminRouter.get("/stats", adminMiddleware, getSystemStats);

export default adminRouter;