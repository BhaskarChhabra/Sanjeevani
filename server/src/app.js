process.env.NO_PROXY = "127.0.0.1,localhost";
process.env.HTTP_PROXY = "";
process.env.HTTPS_PROXY = "";
process.env.http_proxy = "";
process.env.https_proxy = "";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import custom utilities and middlewares
import { ApiError } from "./utils/ApiError.js";
import { errorMiddleware } from "./middlewares/error.js"; 

// Import all your routers
import userRouter from "./routes/user.routes.js";
import medicationRouter from "./routes/medication.routes.js";
import doseLogRouter from "./routes/doseLog.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import aiRouter from "./routes/ai.routes.js"; 
import googleRouter from "./routes/google.routes.js";
import environmentalRoutes from "./routes/environmental.js"; 
import chatRoutes from './routes/chat.js';
import reminderAIRoutes from "./routes/reminderAI.route.js";
import medicalSummaryRoutes from "./routes/medicalSummary.js";
// --- ✅ Correct import for your places router ---
import placesRouter from "./routes/places.routes.js";
import medicineRouter from './routes/medicine.routes.js';
import profileRoutes from './routes/profileRoutes.js';


const API_PREFIX = "/api/v1"; 


// --- 1. APPLICATION INSTANCE ---
export const app = express();

// --- 2. CORE MIDDLEWARES ---
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// --- 3. ROUTES DECLARATION ---
app.use("/api/v1/users", userRouter);
app.use("/api/v1/medications", medicationRouter);
app.use("/api/v1/doses", doseLogRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/google", googleRouter);
app.use("/api/v1/medical-summary", medicalSummaryRoutes);
app.use("/api/environmental-correlation", environmentalRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use("/api/v1/reminder-ai", reminderAIRoutes);

// --- in server.js or app.js ---


// ... after other route registrations
app.use("/api/v1/profile", profileRoutes);

// --- ✅ Route registration for the places API ---
app.use("/api/v1/places", placesRouter);
app.use(`${API_PREFIX}/medicines`, medicineRouter);

// --- 4. Global 404 Not Found Handler ---
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
        console.warn(`[404] API Route Not Found: ${req.originalUrl}`);
        throw new ApiError(404, `API Endpoint Not Found: ${req.originalUrl}`);
    }
    next();
});

// --- 5. Global Error Middleware (MUST BE LAST) ---
app.use(errorMiddleware);
