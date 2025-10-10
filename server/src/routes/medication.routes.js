// medication.routes.js

import { Router } from "express";
import {
    addMedication,
    getAllMedications,
    updateMedication,
    deleteMedication, 
   
    
} from "../controllers/medication.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// --- Core Medication CRUD Routes ---
router.route("/add").post(addMedication);
router.route("/all").get(getAllMedications);
router.route("/update/:id").put(updateMedication); 
router.route("/delete/:id").delete(deleteMedication); 

// --- Advanced Routes (Fixing Frontend Errors) ---

// 1. AI Predictive Adherence: GET /api/v1/medications/:id/adherence-prediction
//router.route("/:id/adherence-prediction").get(getAdherencePrediction);

// 2. Drug Interactions: POST /api/v1/medications/interactions


export default router;