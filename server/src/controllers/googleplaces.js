import axios from "axios";

// 🔹 Fetch nearby places for given types (hospital, doctor, pharmacy)
async function getPlaces({ lat, lng, radius = 5000, types = [], apiKey }) {
  let allPlaces = [];

  for (const type of types) {
    const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    const params = {
      location: `${lat},${lng}`,
      radius,
      type,
      key: apiKey,
    };

    const res = await axios.get(url, { params });

    if (res.data?.results?.length) {
      // tag each place with its type (useful later)
      const taggedResults = res.data.results.map((place) => ({
        ...place,
        place_type: type,
      }));
      allPlaces = allPlaces.concat(taggedResults);
    }
  }

  return allPlaces;
}

// 🔹 Sort results
function sortPlaces(places, sortBy) {
  if (sortBy === "rating")
    return places.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (sortBy === "popularity")
    return places.sort(
      (a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0)
    );
  return places;
}

// 🔹 Main Controller
export const GooglePlaces = async (req, res) => {
  try {
    const {
      destination,
      radius = 5000,
      sort = "rating",
      limit = 100,
    } = req.body;

    if (!destination || !destination.lat || !destination.lng) {
      return res
        .status(400)
        .json({ error: "Destination with lat & lng required" });
    }

    const apiKey = "AIzaSyCxO6iCtNnN35TV0kJadt6k2UTVvzquodg"; // 🔒 Replace with your key

    // 🔹 Define the medical categories to fetch
    const types = ["hospital", "doctor", "pharmacy"];

    // 🔹 Fetch data from Google Places API
    let places = await getPlaces({
      lat: destination.lat,
      lng: destination.lng,
      radius,
      types,
      apiKey,
    });

    // 🔹 Sort and limit
    places = sortPlaces(places, sort).slice(0, Number(limit));

    // 🔹 Format & filter results
    const formatted = places
      .map((p) => ({
        place_id: p.place_id,
        name: p.name,
        address: p.vicinity || p.formatted_address || "",
        rating: p.rating || "N/A",
        total_ratings: p.user_ratings_total || 0,
        location: p.geometry?.location || {},
        type: p.place_type,
        photo: p.photos
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photos[0].photo_reference}&key=${apiKey}`
          : null,
      }))
      .filter((p) => p.total_ratings >= 5); // only keep places with >=5 reviews

    // 🔹 Remove duplicates
    const uniquePlaces = [];
    const seen = new Set();

    for (const p of formatted) {
      const key = `${p.place_id}-${p.location.lat}-${p.location.lng}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePlaces.push(p);
      }
    }

    res.json(uniquePlaces);
  } catch (error) {
    console.error("Google Places API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Google Places fetch error" });
  }
};
