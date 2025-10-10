import axios from "axios";

// Existing Function
const fetchPlacesFromGoogle = async ({ lat, lng, service, radius }) => {
    let googleApiType = '';
    if (service.toLowerCase() === 'hospital') googleApiType = 'hospital';
    else if (service.toLowerCase() === 'doctor') googleApiType = 'doctor';
    else if (service.toLowerCase() === 'pharmacy') googleApiType = 'pharmacy';
    else throw new Error('Invalid service type provided');
    
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!GOOGLE_MAPS_API_KEY) throw new Error("Google Maps API key not defined");

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${googleApiType}&key=${GOOGLE_MAPS_API_KEY}`;
    
    try {
        const response = await axios.get(url);
        // ... (formatting code same as yours)
        return response.data.results.map(place => ({
            id: place.place_id, name: place.name, address: place.vicinity,
            rating: place.rating || 'N/A', totalRatings: place.user_ratings_total || 0,
            location: place.geometry.location, isOpen: place.opening_hours ? place.opening_hours.open_now : 'N/A',
        }));
    } catch (error) {
        console.error(`Failed to fetch from Google Maps API: ${error.message}`);
        throw error;
    }
};

// --- NEW FUNCTION --- for keyword search
const fetchMedicalServicesFromGoogle = async ({ lat, lng, keyword, radius }) => {
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!GOOGLE_MAPS_API_KEY) throw new Error("Google Maps API key not defined");

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${keyword}&key=${GOOGLE_MAPS_API_KEY}`;
    
    try {
        const response = await axios.get(url);
        // ... (formatting code same as yours)
        return response.data.results.map(place => ({
            id: place.place_id, name: place.name, address: place.vicinity,
            rating: place.rating || 'N/A', totalRatings: place.user_ratings_total || 0,
            location: place.geometry.location, isOpen: place.opening_hours ? place.opening_hours.open_now : 'N/A',
        }));
    } catch (error) {
        console.error(`Failed to fetch medical services: ${error.message}`);
        throw error;
    }
};

// --- NEW FUNCTION --- for place details
const fetchPlaceDetailsFromGoogle = async (placeId) => {
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!GOOGLE_MAPS_API_KEY) throw new Error("Google Maps API key is not defined");

    const fields = 'name,formatted_address,photos,rating,user_ratings_total,opening_hours,types,reviews,geometry';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
        const response = await axios.get(url);
        const result = response.data.result;
        if (!result) throw new Error('No details found for this place.');

        const photoUrls = result.photos ? result.photos.map(p => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        ) : [];

        return {
            name: result.name, address: result.formatted_address, photos: photoUrls,
            rating: result.rating || 'N/A', totalRatings: result.user_ratings_total || 0,
            isOpen: result.opening_hours ? result.opening_hours.open_now : 'N/A',
            types: result.types || [], reviews: result.reviews || [],
            location: result.geometry.location,
        };
    } catch (error) {
        console.error(`Failed to fetch place details: ${error.message}`);
        throw error;
    }
};

export { 
    fetchPlacesFromGoogle,
    fetchMedicalServicesFromGoogle, // --- NEW ---
    fetchPlaceDetailsFromGoogle     // --- NEW ---
};