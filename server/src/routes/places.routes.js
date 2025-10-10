import { Router } from "express";
import { 
    findNearbyPlaces,
    searchMedicalServices, // --- NEW ---
    getPlaceDetails      // --- NEW ---
} from "../controllers/places.controller.js";

const router = Router();

// Existing route for Hospital, Doctor, Pharmacy
router.route("/").get(findNearbyPlaces);

// --- NEW --- Route for keyword search (e.g., "cardiologist")
router.route("/search").get(searchMedicalServices);

// --- NEW --- Route to get full details of a single place
router.route("/details/:placeId").get(getPlaceDetails);

export default router;