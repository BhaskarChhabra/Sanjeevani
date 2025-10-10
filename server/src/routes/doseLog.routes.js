import { Router } from "express";
import { logDose, getDoseLogs } from "../controllers/doseLog.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes here require user authentication
router.use(isAuthenticated);

// Create a new dose log (Taken / Missed)
router.route("/log").post(logDose);

// ✅ New route: Get all logs for a specific medication
router.route("/logs/:medicationId").get(getDoseLogs);

export default router;
