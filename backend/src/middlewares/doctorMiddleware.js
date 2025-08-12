
import jwt from 'jsonwebtoken';

export const doctorMiddleware = (req, res, next) => {
   
   const token = req.cookies.token;
   console.log("Doctor Middleware Token:", token);
   
   if (!token) return res.status(401).json({ error: 'No token provided' });
   console.log("Token :",token );
   try {
     const decoded = jwt.verify(token, process.env.JWT_SECRET);
     req.user = decoded; 
     console.log("Decoded user:", decoded);
     if(!req.user || req.user.role !== 'DOCTOR') {
       return res.status(403).json({ error: 'Access denied' });
     }
     next();
   } catch (err) {
     console.log("Error verifying token:", err);
     return res.status(401).json({ error: 'Invalid token' });
   }
};