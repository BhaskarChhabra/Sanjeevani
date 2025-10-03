import { Router } from "express";
import { logDose } from "../controllers/doseLog.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

// Is file ke saare routes protected hain, user ka logged in hona zaroori hai.
router.use(isAuthenticated);

// Naya dose log create karne ke liye route
router.route("/log").post(logDose);


export default router;