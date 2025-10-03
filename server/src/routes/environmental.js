import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { fetchEnvironmentalCorrelation } from "../controllers/environmentalController.js"; // <--- Import the controller

const router = Router();

// Apply authentication middleware (if required for this API)
router.use(isAuthenticated); 

// CRITICAL FIX: Define the root route ("/") correctly.
// Since the router is mounted at "/api/environmental-correlation", 
// this line handles the full path: /api/environmental-correlation
router.route("/").get(fetchEnvironmentalCorrelation);

export default router;
