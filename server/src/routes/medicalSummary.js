// routes/medicalSummaryRoute.js
import express from "express";
import { generateMedicalSummary } from "../controllers/medicalSummaryController.js";

const router = express.Router();

// ✅ This defines the POST endpoint: /api/v1/medical-summary/summary
router.post("/summary", generateMedicalSummary);

export default router;
