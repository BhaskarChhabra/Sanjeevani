import { 
    fetchPlacesFromGoogle,
    fetchMedicalServicesFromGoogle, // --- NEW ---
    fetchPlaceDetailsFromGoogle     // --- NEW ---
} from "../services/googleMaps.service.js";

// Existing Function
const findNearbyPlaces = async (req, res) => {
    const { lat, lng, service, radius } = req.query;
    if (!lat || !lng || !service || !radius) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }
    try {
        const places = await fetchPlacesFromGoogle({ lat, lng, service, radius });
        return res.status(200).json(places);
    } catch (error) {
        console.error('Error in findNearbyPlaces controller:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// --- NEW FUNCTION --- for keyword search
const searchMedicalServices = async (req, res) => {
    const { lat, lng, keyword, radius } = req.query;
    if (!lat || !lng || !keyword || !radius) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }
    try {
        const places = await fetchMedicalServicesFromGoogle({ lat, lng, keyword, radius });
        return res.status(200).json(places);
    } catch (error) {
        console.error('Error in searchMedicalServices controller:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// --- NEW FUNCTION --- for getting place details
const getPlaceDetails = async (req, res) => {
    const { placeId } = req.params;
    if (!placeId) {
        return res.status(400).json({ message: 'Place ID is required' });
    }
    try {
        const details = await fetchPlaceDetailsFromGoogle(placeId);
        return res.status(200).json(details);
    } catch (error) {
        console.error('Error in getPlaceDetails controller:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export { 
    findNearbyPlaces,
    searchMedicalServices, // --- NEW ---
    getPlaceDetails      // --- NEW ---
};  