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
import chatRoutes  from './routes/chat.js';



// --- 1. APPLICATION INSTANCE (MUST BE FIRST) ---
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

// Mounting the environmental route: Frontend calls /api/environmental-correlation
app.use("/api/environmental-correlation", environmentalRoutes);
app.use('/api/v1/chat', chatRoutes);

// --- 4. CRITICAL FIX: Global 404 Not Found Handler ---
// This middleware catches requests for routes that were not handled by any router above.
// It is essential to return JSON here to stop the frontend SyntaxError.
app.use((req, res, next) => {
    // If the request path starts with /api/, we explicitly handle it as a JSON error.
    if (req.originalUrl.startsWith('/api')) {
        console.warn(`[404] API Route Not Found: ${req.originalUrl}`);
        // Throwing the ApiError ensures the final errorMiddleware catches it 
        // and returns a structured JSON response.
        throw new ApiError(404, `API Endpoint Not Found: ${req.originalUrl}`);
    }
    // For non-API calls, continue the normal flow (e.g., serving static files or next())
    next();
});

// --- 5. Global Error Middleware (MUST BE LAST) ---
// This will catch the ApiError thrown by the 404 handler and any other errors 
// thrown by isAuthenticated or asyncHandler.
app.use(errorMiddleware);
