import express from 'express';
import { registerUser, getUsers,loginUser,GetBookingUser ,getAppointmentsUser } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.get('/getUsers', getUsers);
userRouter.post('/login', loginUser);
userRouter.get('/appointments', getAppointmentsUser);
userRouter.get('/appointments/:appointmentId', GetBookingUser);

export default userRouter;
