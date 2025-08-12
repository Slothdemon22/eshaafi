import { adminServiceRegister ,adminServiceGetDoctors} from '../services/adminService.js';

export const addUser = async (req,res)=> {
    try {
        const { name, email, password, role , location , specialty } = req.body;
        console.log("Add User called with body:", name, email, password, role, location, specialty);
        
        // Assuming you have a service to handle user creation
        const userData = await adminServiceRegister(name, email, password, role, location, specialty);
        
        res.status(201).json({ message: 'User added successfully', user: userData });
    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ error: 'Failed to add user' });
    }
}

export const getDoctors = async (req, res) => {

  try
  {
     const doctors = await adminServiceGetDoctors();
     console.log("Doctors fetched:", doctors);
     res.status(200).json({ message: 'Doctors fetched successfully', doctors });
  }
  catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }





}
