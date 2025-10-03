// ai.routes.js (No significant change required)
import { Router } from "express";
import { askAIController } from "../controllers/ai.controller.js"; // Renamed function
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

// AI Chatbot ek private feature hai, isliye pehle user ka login status check hoga.
router.use(isAuthenticated);

// Route to handle the user's query to the AI
router.route("/ask").post(askAIController);

export default router;