// routes/profileRoutes.js

import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';

// Agar aap authentication check kar rahe ho to middleware import kar lena
// import { isAuthenticated } from '../middlewares/auth.js'; 

const router = express.Router();

// Profile dekhne ka route
// URL: GET /api/v1/profile/:userId
// Ismein :userId woh ID hai jis user ki profile dekhni hai
router.get('/:userId', /*isAuthenticated,*/ getProfile);


// Profile update karne ka route
// URL: PUT /api/v1/profile/:userId
// Ismein :userId woh ID hai jis user ki profile update karni hai
router.put('/:userId', /*isAuthenticated,*/ updateProfile);


export default router;