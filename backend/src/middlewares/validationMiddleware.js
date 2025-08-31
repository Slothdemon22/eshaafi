export const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if all required fields are present
  if (!name || !email || !password) {
    return res.status(400).json({ 
      error: 'Name, email, and password are required' 
    });
  }

  // Validate name
  if (typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ 
      error: 'Name must be at least 2 characters long' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Please enter a valid email address' 
    });
  }

  // Validate password
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ 
      error: 'Password must be at least 6 characters long' 
    });
  }

  // Sanitize inputs
  req.body.name = name.trim();
  req.body.email = email.toLowerCase().trim();

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  // Check if all required fields are present
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Please enter a valid email address' 
    });
  }

  // Validate password
  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ 
      error: 'Password is required' 
    });
  }

  // Sanitize inputs
  req.body.email = email.toLowerCase().trim();

  next();
};
