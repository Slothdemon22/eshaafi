import jwt from 'jsonwebtoken';



export function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  
  if (!token) return res.status(401).json({ error: 'No token provided' });
  console.log("Token :",token );
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    console.log("Decoded user:", decoded);
    next();
  } catch (err) {
    console.log("Error verifying token:", err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
