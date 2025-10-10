import { Router } from 'express';
import { getAuthUrl, handleAuthCallback, getGoogleStatus, // <--- Import the new functions
    disconnectGoogle  } from '../controllers/google.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = Router();

// This route STILL needs to be protected to ensure only a logged-in user can start the process.
router.route('/auth-url').get(isAuthenticated, getAuthUrl);

// This route can no longer use the middleware, as the cookie won't be sent on redirect.
// We will identify the user via the 'state' parameter ("the tag") instead.
router.route('/callback').get(handleAuthCallback);
// Route to check status
router.route("/status").get(isAuthenticated, getGoogleStatus); // <--- ADD THIS

// Route to disconnect
router.route("/disconnect").post(isAuthenticated, disconnectGoogle);
export default router;

