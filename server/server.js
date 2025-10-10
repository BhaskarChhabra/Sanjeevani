import dotenv from 'dotenv';
// This MUST be the very first line to ensure environment variables are available everywhere.
dotenv.config({ path: './config.env' });

import { app } from './src/app.js';
import { connection } from './src/config/dbConnection.js';
import { startReminderService } from './src/jobs/reminder.job.js';
import { startAdherenceScheduler } from './src/jobs/adherence.job.js';
import http from 'http';
import { initializeSocket } from './src/socket.js';
// import "./cronJobs.js";

console.log(`Gemini Key Status: ${process.env.GEMINI_API_KEY ? 'LOADED' : 'MISSING'}`);

// First, connect to the database.
connection()
.then(() => {
    const PORT = process.env.PORT || 5000;
    const httpServer = http.createServer(app);

    // Initialize Socket.io
    const io = initializeSocket(httpServer);

    // Handle new socket connections
    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            socket.join(userId);
            console.log(`[Socket] User ${userId} connected and joined room.`);
        }
        socket.on('disconnect', () => {
            if (userId) console.log(`[Socket] User ${userId} disconnected.`);
        });
    });

    // If the database connection is successful, THEN start the server.
    httpServer.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        // Start background jobs only after the server is live.
        startReminderService();
        startAdherenceScheduler();
    });
})
.catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
});
