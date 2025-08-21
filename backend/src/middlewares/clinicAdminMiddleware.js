import jwt from 'jsonwebtoken';

export const clinicAdminMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    if (!req.user || (req.user.role !== 'CLINIC_ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
      return res.status(403).json({ error: 'Access denied. Clinic admin or super admin required.' });
    }
    next();
  } catch (err) {
    console.log("Error verifying token:", err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};


