import express from "express";
import { getProfileDoctor ,addAvailabilityDoctor } from '../controllers/doctorController.js';


const doctorRouter=express.Router();

doctorRouter.get("/profile", getProfileDoctor);
doctorRouter.post("/addAvailability", addAvailabilityDoctor);



export default doctorRouter;