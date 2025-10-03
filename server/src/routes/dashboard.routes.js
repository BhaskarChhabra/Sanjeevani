import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

// All dashboard routes are protected
router.use(isAuthenticated);

// Route to get the main statistics
router.route("/stats").get(getDashboardStats);

export default router;