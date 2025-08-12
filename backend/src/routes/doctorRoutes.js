import express from "express";
import { getProfileDoctor ,addAvailabilityService } from '../controllers/doctorController.js';


const doctorRouter=express.Router();

doctorRouter.get("/profile", getProfileDoctor);
doctorRouter.post("/addAvailability", addAvailabilityService);



export default doctorRouter;