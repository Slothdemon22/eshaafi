import express from 'express';
import {addUser } from '../controllers/adminController.js';
import { getDoctors } from '../controllers/adminController.js';



const adminRouter = express.Router();

//adminRouter.get('/authorize', adminController);
adminRouter.post("/addUser",addUser);
adminRouter.get("/getDoctors", getDoctors); 

export default adminRouter;