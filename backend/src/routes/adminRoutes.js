import express from 'express';
import { addUser, listDoctorApplications, approveDoctorApplication, rejectDoctorApplication, getSystemStats } from '../controllers/adminController.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const adminRouter = express.Router();

adminRouter.post('/addUser', adminMiddleware, addUser);
adminRouter.get("/applications", adminMiddleware, listDoctorApplications);
adminRouter.post("/applications/:id/approve", adminMiddleware, approveDoctorApplication);
adminRouter.post("/applications/:id/reject", adminMiddleware, rejectDoctorApplication);
adminRouter.get("/stats", adminMiddleware, getSystemStats);

export default adminRouter;