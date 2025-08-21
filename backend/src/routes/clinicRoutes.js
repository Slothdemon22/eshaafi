import express from 'express';
import { clinicAdminMiddleware } from '../middlewares/clinicAdminMiddleware.js';
import { getClinicDoctors, getClinicApplications, approveClinicDoctorApplication, rejectClinicDoctorApplication, updateClinicInfo, removeDoctorFromClinic, getClinicById, submitClinicDoctorApplication, getClinicInfo, getClinicDoctorStats, getPublicClinics, getPublicClinicDoctors } from '../controllers/clinicController.js';

const clinicRouter = express.Router();

// Test route to verify router is working
clinicRouter.get('/test', (req, res) => {
  console.log('Clinic test route hit');
  res.json({ message: 'Clinic router is working' });
});

// Create a separate router for protected routes
const protectedRouter = express.Router();
protectedRouter.use(clinicAdminMiddleware);

// Protected routes
protectedRouter.get('/info', getClinicInfo);
protectedRouter.get('/doctors', getClinicDoctors);
protectedRouter.get('/applications', getClinicApplications);
protectedRouter.get('/doctors/stats', getClinicDoctorStats);
protectedRouter.post('/applications/:id/approve', approveClinicDoctorApplication);
protectedRouter.post('/applications/:id/reject', rejectClinicDoctorApplication);
protectedRouter.put('/info', updateClinicInfo);
protectedRouter.delete('/doctors/:doctorId', removeDoctorFromClinic);

// Mount protected routes with a prefix
clinicRouter.use('/admin', protectedRouter);

// Public routes (no authentication required)
clinicRouter.get('/:clinicId', getClinicById);
clinicRouter.post('/:clinicId/apply', submitClinicDoctorApplication);
clinicRouter.get('/', getPublicClinics);
clinicRouter.get('/:clinicId/doctors', getPublicClinicDoctors);

export default clinicRouter;


