import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";

// --- CSS KEYFRAMES INJECTION FIX (Kept for spinner functionality) ---
const injectSpinKeyframes = () => {
    // Check if the style tag is already present to prevent duplicates
    if (!document.getElementById('spin-keyframes')) {
        const style = document.createElement('style');
        style.id = 'spin-keyframes';
        style.innerHTML = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
};
// --- END FIX ---

// --- STYLING & CONSTANTS ---
const COLOR_PRIMARY_ACCENT = "#8b5cf6"; // Lavender/Purple
const COLOR_PRIMARY_LIGHT = "#f3e8ff"; // Light Lavender Background
const COLOR_TEXT_DARK = "#1f2937";
const SERVICES = ["Hospital", "Doctor", "Pharmacy"];
const DISTANCES = { "1km": 1000, "5km": 5000, "10km": 10000 };

// --- NEW/UPDATED SVG ICONS ---
const MapIconPlaceholder = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{ width: '80px', height: '80px' }}>
        <path fill="currentColor" d="M304 32v128h128V32h-128zm-64 0h-128c-17.67 0-32 14.33-32 32v384c0 17.67 14.33 32 32 32h192c17.67 0 32-14.33 32-32v-128h-64c-17.67 0-32-14.33-32-32V32zM384 384H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h352c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/>
    </svg>
);
// --- END ICONS ---

// ====================================================================
// --- NEW Loader Component ---
// ====================================================================
const BigMapLoader = ({ message }) => (
    <div style={loaderStyles.container}>
        <div style={loaderStyles.spinner} />
        <p style={loaderStyles.message}>{message}</p>
    </div>
);

// ====================================================================
// --- NEW Placeholder Component ---
// ====================================================================
const NoLocationSelectedPlaceholder = () => (
    <div style={placeholderStyles.container}>
        <div style={placeholderStyles.contentBox}>
            <div style={placeholderStyles.mapIconWrapper}>
                <MapIconPlaceholder style={placeholderStyles.mapIcon} />
            </div>
            <h3 style={placeholderStyles.heading}>No location selected</h3>
            <p style={placeholderStyles.text}>
                Click the button above to find healthcare services near you
            </p>
        </div>
    </div>
);


// ====================================================================
// --- Details Modal Component --- 
// ====================================================================
const DetailsModal = ({ place, onClose, isLoading }) => {
    const [activeTab, setActiveTab] = useState("Information");
    if (!place && !isLoading) return null;

    return (
        <div style={modalStyles.modalOverlay} onClick={onClose}>
            <div style={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} style={modalStyles.closeButton}>
                    &times;
                </button>
                {isLoading ? (
                    <p style={{ textAlign: "center" }}>Loading details...</p>
                ) : (
                    <>
                        <h2 style={{ color: COLOR_PRIMARY_ACCENT }}>{place.name}</h2>
                        <div style={modalStyles.tabs}>
                            {["Information", "Photos", "Reviews"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={modalStyles.tab(activeTab === tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        {/* 🛑 Fixed size content area with scroll */}
                        <div style={modalStyles.fixedContentArea}>
                            <div style={modalStyles.scrollableContent}>
                                {activeTab === "Information" && (
                                    <div>
                                        <p>
                                            <strong>Address:</strong> {place.address}
                                        </p>
                                        <p>
                                            <strong>Rating:</strong> ⭐ {place.rating} ({place.totalRatings} reviews)
                                        </p>
                                        <p>
                                            <strong>Status:</strong>{" "}
                                            <span
                                                style={{
                                                    color: place.isOpen
                                                        ? "green"
                                                        : place.isOpen === false
                                                            ? "red"
                                                            : "grey",
                                                }}
                                            >
                                                {place.isOpen
                                                    ? "Open Now"
                                                    : place.isOpen === false
                                                        ? "Closed"
                                                        : "Hours N/A"}
                                            </span>
                                        </p>
                                        <div>
                                            <strong>Services:</strong>{" "}
                                            {place.types.map((type) => (
                                                <span key={type} style={modalStyles.tag}>
                                                    {type.replace(/_/g, " ")}
                                                </span>
                                            ))}
                                        </div>
                                        {/* Adding filler content for testing scroll */}
                                        <p style={{marginTop: '20px', color: '#888'}}>This is filler content to demonstrate scrolling within a fixed modal size. When review or photo content is long, the modal box remains stable, and only this inner section scrolls. This ensures a consistent UI/UX.</p>
                                        <p style={{color: '#888'}}>More filler text here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>
                                    </div>
                                )}
                                {activeTab === "Photos" && (
                                    <div style={modalStyles.photoGrid}>
                                        {place.photos?.length ? (
                                            place.photos.map((photo, index) => (
                                                <img
                                                    key={index}
                                                    src={photo}
                                                    alt={`${place.name} photo ${index + 1}`}
                                                    style={modalStyles.photo}
                                                />
                                            ))
                                        ) : (
                                            <p>No photos available.</p>
                                        )}
                                        {/* Add some empty divs to force scroll for testing */}
                                        <div style={{height: '100px'}}></div>
                                    </div>
                                )}
                                {activeTab === "Reviews" && (
                                    <div style={modalStyles.reviewList}>
                                        {place.reviews?.length ? (
                                            place.reviews.map((review, index) => (
                                                <div key={index} style={modalStyles.review}>
                                                    <strong>{review.author_name}</strong> (Rated: {review.rating}/5)
                                                    <p style={{ margin: "0.5rem 0" }}>{review.text}</p>
                                                    <small>{review.relative_time_description}</small>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No reviews available.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ====================================================================
// --- Results View Component --- 
// ====================================================================
const ResultsView = ({ userCoords, searchParams }) => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [modalDetails, setModalDetails] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: "AIzaSyCxO6iCtNnN35TV0kJadt6k2UTVvzquodg",
    });

    useEffect(() => {
        if (!userCoords || !searchParams) return;
        const fetchPlaces = async () => {
            setLoading(true);
            try {
                // LOGIC UNCHANGED
                const { data } = await axios.get(`http://localhost:5000/api/v1/places`, {
                    params: {
                        lat: userCoords.lat,
                        lng: userCoords.lng,
                        radius: searchParams.radius,
                        service: searchParams.value,
                    },
                });
                setPlaces(data);
            } catch (error) {
                console.error("Error fetching places:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlaces();
    }, [userCoords, searchParams]);

    const handleViewDetails = async (id) => {
        setIsModalOpen(true);
        setDetailsLoading(true);
        // LOGIC UNCHANGED
        try {
            const { data } = await axios.get(`http://localhost:5000/api/v1/places/details/${id}`);
            setModalDetails(data);
        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setDetailsLoading(false);
        }
    };

    // Loader replaced the simple text "Loading..."
    if (loading) return <BigMapLoader message={`Searching for nearest ${searchParams.value}s...`} />;
    if (!places.length)
        return <p style={{ textAlign: "center", padding: '20px' }}>No "{searchParams.value}" found nearby.</p>;

    return (
        <div style={{ width: "100%" }}>
            {isModalOpen && (
                <DetailsModal place={modalDetails} onClose={() => setIsModalOpen(false)} isLoading={detailsLoading} />
            )}

            <div style={resultsStyles.mapContainer}>
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        center={selectedPlace ? selectedPlace.location : userCoords}
                        zoom={14}
                    >
                        {places.map((place) => (
                            <Marker key={place.id} position={place.location} onClick={() => setSelectedPlace(place)} />
                        ))}
                        {selectedPlace && (
                            <InfoWindow position={selectedPlace.location} onCloseClick={() => setSelectedPlace(null)}>
                                <div><strong>{selectedPlace.name}</strong></div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                ) : (
                    <BigMapLoader message="Loading Map Resources..." /> // Use loader while map is loading
                )}
            </div>

            <div style={resultsStyles.listContainer}>
                {places.map((place) => (
                    <div
                        key={place.id}
                        style={resultsStyles.listItem(selectedPlace && selectedPlace.id === place.id)}
                        onClick={() => setSelectedPlace(place)}
                    >
                        <h4>{place.name}</h4>
                        <p style={{ fontSize: "0.9rem" }}>{place.address}</p>
                        <div style={resultsStyles.detailsRow}>
                            <span style={{ fontSize: "0.8rem" }}>
                                ⭐ {place.rating} ({place.totalRatings} reviews) -{" "}
                                <span style={{ color: place.isOpen ? "green" : "red" }}>
                                    {place.isOpen ? "Open" : "Closed"}
                                </span>
                            </span>
                            <button style={resultsStyles.detailsButton} onClick={() => handleViewDetails(place.id)}>
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ====================================================================
// --- Main Page Component ---
// ====================================================================
export default function LocalHealthMapPage() {
    const [userCoords, setUserCoords] = useState(null);
    const [locationDenied, setLocationDenied] = useState(false);
    const [locationRequested, setLocationRequested] = useState(false);
    const [searchParams, setSearchParams] = useState(null);

    // FIX 1: Inject the keyframes when the component mounts
    useEffect(() => {
        injectSpinKeyframes();
    }, []);

    const requestLocation = () => {
        setLocationRequested(true);
        // LOGIC UNCHANGED
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setSearchParams({ value: "Hospital", radius: 5000 });
                },
                () => {
                    setLocationDenied(true);
                    setUserCoords({ lat: 28.61, lng: 77.21 }); // Default location
                    setSearchParams({ value: "Hospital", radius: 5000 });
                }
            );
        } else setLocationDenied(true);
    };

    const handleFilterChange = (key, value) => setSearchParams((prev) => ({ ...prev, [key]: value }));

    // Helper function to determine button content and disabled state
    const getButtonState = () => {
        if (userCoords) {
            return {
                text: locationDenied ? "Default Location Used" : "Location Found ✅",
                disabled: true,
            };
        } else if (locationRequested) {
            return {
                text: "Getting Location...",
                disabled: true,
            };
        } else {
            return {
                text: "Allow browser to know your location",
                disabled: false,
            };
        }
    };

    const buttonState = getButtonState();

    return (
        <div style={pageStyles.pageContainer}>
            <div style={pageStyles.header}>
                <h1 style={{ color: COLOR_PRIMARY_ACCENT }}>Locate Sanjeevani Resources</h1>
                <p>Find the nearest Hospital, Doctor, or Pharmacy near you.</p>
            </div>

            <div style={{ textAlign: "center", marginBottom: '20px' }}>
                <button 
                    onClick={requestLocation} 
                    style={pageStyles.locationButton} 
                    disabled={buttonState.disabled}
                >
                    {/* FIX 2: Use the dynamic state determined above */}
                    {buttonState.text}
                </button>
            </div>

            {!locationRequested ? (
                // Render the Placeholder when no request has been made
                <NoLocationSelectedPlaceholder />
            ) : !userCoords ? (
                // Show the big loader while location is being fetched
                <BigMapLoader message="Fetching GPS Coordinates..." />
            ) : (
                <>
                    {locationDenied && (
                        <p style={pageStyles.errorText}>Location denied. Showing default area.</p>
                    )}
                    <div style={pageStyles.filtersContainer}>
                        {SERVICES.map((s) => (
                            <button
                                key={s}
                                onClick={() => handleFilterChange("value", s)}
                                style={pageStyles.serviceButton(searchParams.value === s)}
                            >
                                {s}s
                            </button>
                        ))}
                        <select
                            value={searchParams.radius}
                            onChange={(e) => handleFilterChange("radius", parseInt(e.target.value))}
                            style={pageStyles.distanceSelect}
                        >
                            {Object.entries(DISTANCES).map(([label, val]) => (
                                <option key={val} value={val}>
                                    Within {label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <ResultsView userCoords={userCoords} searchParams={searchParams} />
                </>
            )}
        </div>
    );
}

// ====================================================================
// --- STYLES (UNCHANGED) ---
// ====================================================================

const loaderStyles = {
    // ... (Loader Styles remain unchanged)
    container: {
        width: '100%',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: COLOR_PRIMARY_LIGHT, // Light Lavender background for the loading area
        borderRadius: '12px',
        border: `1px solid ${COLOR_PRIMARY_ACCENT}`,
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        marginTop: '20px',
    },
    spinner: {
        border: '6px solid #f3f3f3',
        borderTop: `6px solid ${COLOR_PRIMARY_ACCENT}`, // Lavender color for spin
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite', 
        marginBottom: '15px',
    },
    message: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: COLOR_PRIMARY_ACCENT,
    },
};

const placeholderStyles = {
    // ... (Placeholder Styles remain unchanged)
    container: {
        width: '100%',
        minHeight: '400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        marginTop: '20px',
    },
    contentBox: {
        textAlign: 'center',
        padding: '30px',
    },
    mapIconWrapper: {
        color: '#ccc', // Lighter shade for the icon
        marginBottom: '15px',
    },
    mapIcon: {
        width: '70px', // Increased size for a bolder look
        height: '70px',
        color: '#b0b0b0', // A nice, neutral gray
    },
    heading: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: COLOR_TEXT_DARK,
        margin: '0 0 10px 0',
    },
    text: {
        fontSize: '1rem',
        color: '#6c757d',
        margin: 0,
    }
}

const pageStyles = {
    // ... (pageStyles remain unchanged)
    pageContainer: {
        padding: "2rem",
        background: "linear-gradient(180deg, #ffffff 0%, #f6f0ff 100%)",
        minHeight: "100%",
    },
    header: { textAlign: "center", marginBottom: "2rem" },
    locationButton: {
        padding: "0.75rem 1.5rem",
        borderRadius: "0.5rem",
        border: "none",
        backgroundColor: COLOR_PRIMARY_ACCENT,
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
        transition: 'background-color 0.2s',
    },
    errorText: { color: "red", textAlign: "center", marginBottom: "1rem" },
    filtersContainer: {
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "1rem",
        background: "#fff",
        padding: "1rem",
        borderRadius: "0.75rem",
        boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
        marginBottom: "1.5rem",
    },
    serviceButton: (isActive) => ({
        padding: "0.75rem 1.5rem",
        borderRadius: "0.5rem",
        cursor: "pointer",
        fontWeight: 600,
        background: isActive ? COLOR_PRIMARY_ACCENT : "#f0f0f0",
        color: isActive ? "#fff" : COLOR_TEXT_DARK,
        border: `1px solid ${isActive ? COLOR_PRIMARY_ACCENT : "#e5e7eb"}`,
        transition: 'all 0.2s',
    }),
    distanceSelect: {
        padding: "0.75rem 1rem",
        borderRadius: "0.5rem",
        border: "1px solid #e5e7eb",
    },
};

const resultsStyles = {
    // ... (resultsStyles remain unchanged)
    mapContainer: {
        width: "100%",
        height: "400px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        marginBottom: "1.5rem",
    },
    listContainer: {
        background: "#fff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        padding: "0.5rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    listItem: (isSelected) => ({
        padding: "1rem",
        borderBottom: "1px solid #f1f1f1",
        cursor: "pointer",
        transition: "background 0.2s",
        background: isSelected ? COLOR_PRIMARY_LIGHT : "transparent", // Use light accent color for selected
    }),
    detailsRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    detailsButton: {
        padding: "0.3rem 0.8rem",
        border: `1px solid ${COLOR_PRIMARY_ACCENT}`,
        color: COLOR_PRIMARY_ACCENT,
        backgroundColor: "#fff",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "0.8rem",
        transition: 'background-color 0.2s',
    },
};

const modalStyles = {
    // ... (modalStyles remain unchanged)
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modalContent: {
        background: "#fff",
        padding: "2rem",
        borderRadius: "8px",
        width: "90%",
        maxWidth: "600px",
        // 🛑 Removed maxHeight and overflowY from here!
        position: "relative",
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '80vh', // Main modal container height limit
    },
    closeButton: {
        position: "absolute",
        top: "10px",
        right: "15px",
        background: "none",
        border: "none",
        fontSize: "1.8rem",
        cursor: "pointer",
    },
    tabs: { display: "flex", borderBottom: "1px solid #eee", marginBottom: "1rem" },
    tab: (isActive) => ({
        background: "none",
        border: "none",
        padding: "0.5rem 1rem",
        cursor: "pointer",
        borderBottom: `3px solid ${isActive ? COLOR_PRIMARY_ACCENT : "transparent"}`,
        fontWeight: isActive ? "600" : "500",
        color: isActive ? COLOR_PRIMARY_ACCENT : COLOR_TEXT_DARK,
    }),
    tabContent: { lineHeight: "1.6" }, // This is the old tabContent wrapper, replacing it with a controlled one:

    // 🛑 NEW: Fixed Content Area (The parent of the scrollable part)
    fixedContentArea: {
        flexGrow: 1, // Allows this area to fill the remaining modal height
        minHeight: '200px', // Minimum height for modal stability
        overflowY: 'auto', // Add vertical scrolling to this section!
        paddingRight: '10px', // Add some padding inside for the scrollbar visually
    },
    // 🛑 NEW: Scrollable Content (Content sits inside fixedContentArea)
    scrollableContent: {
        lineHeight: "1.6",
    },

    tag: {
        backgroundColor: "#f0f0f0",
        padding: "0.2rem 0.6rem",
        borderRadius: "12px",
        marginRight: "0.5rem",
        display: "inline-block",
        fontSize: "0.8rem",
    },
    photoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: "10px",
    },
    photo: {
        width: "100%",
        height: "90px",
        objectFit: "cover",
        borderRadius: "4px",
    },
    reviewList: { padding: '10px 0' }, // Removed max-height/overflow from here, now controlled by fixedContentArea
    review: { borderBottom: "1px solid #eee", padding: "1rem 0" },
};