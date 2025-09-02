import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import {authMiddleware} from './middlewares/authmiddleware.js';
import userRouter from './routes/userRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import { submitClinicApplication } from './controllers/adminController.js';
import bookingRouter from './routes/bookRoutes.js';
import doctorRouter from './routes/doctorRoutes.js';
import clinicRouter from './routes/clinicRoutes.js';
import { adminMiddleware } from './middlewares/adminMiddleware.js';
import { doctorMiddleware} from "./middlewares/doctorMiddleware.js"

dotenv.config();


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:3000', // your frontend
    'https://web.postman.co/', // Postman Web
    "http://16.176.230.109:3000",
    "http://139.59.3.40:3000",
    "http://3.27.92.43:3000"

  ],
  credentials: true
}));
// Routes
app.use('/api/users', userRouter);
app.use('/api/admin', adminMiddleware, adminRouter);
app.use('/api/bookings', authMiddleware, bookingRouter);

// Mount doctor routes with proper middleware handling
app.use("/api/doctor", doctorRouter);
app.use('/api/clinic', clinicRouter);
// Public clinic application endpoint
app.post('/api/clinics/apply', submitClinicApplication);
app.get('/', (req, res) => {
  res.send('Welcome to the Eshaafi API');
});

const PORT =  5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))
