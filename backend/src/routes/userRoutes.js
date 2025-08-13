import express from 'express';
import { registerUser, getUsers,loginUser,GetBookingUser ,getAppointmentsUser, getUserProfile, updateUserProfile, changePassword, logoutUser, editUser, deleteUser } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authmiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.get('/getUsers', adminMiddleware, getUsers);
userRouter.post('/login', loginUser);
userRouter.post('/logout', logoutUser);
userRouter.get('/profile', authMiddleware, getUserProfile);
userRouter.put('/profile', authMiddleware, updateUserProfile);
userRouter.put('/change-password', authMiddleware, changePassword);
userRouter.get('/appointments', authMiddleware, getAppointmentsUser);
userRouter.get('/appointments/:appointmentId', authMiddleware, GetBookingUser);

// Admin routes for user management
userRouter.put('/users/:userId', adminMiddleware, editUser);
userRouter.delete('/users/:userId', adminMiddleware, deleteUser);

export default userRouter;
