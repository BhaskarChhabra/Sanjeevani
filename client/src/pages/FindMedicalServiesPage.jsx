import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { FaHeartbeat, FaBrain, FaBone, FaEye, FaStethoscope, FaChild, FaTooth } from 'react-icons/fa';
import { AiFillExperiment } from 'react-icons/ai';
import { BsHospital, BsCapsule } from 'react-icons/bs';

// --- CSS KEYFRAMES INJECTION FIX ---
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
const COLOR_PRIMARY_ACCENT = "#8b5cf6";
const COLOR_TEXT_DARK = "#1f2937";
const COLOR_PRIMARY_LIGHT = "#f3e8ff"; // Added for use in loader

// --- DATA FOR CARDS ---
const specialists = [
    { name: "Heart Issues", icon: <FaHeartbeat />, keyword: "cardiologist" },
    { name: "Neurological", icon: <FaBrain />, keyword: "neurologist" },
    { name: "Orthopedic", icon: <FaBone />, keyword: "orthopedic" },
    { name: "Eye Care", icon: <FaEye />, keyword: "ophthalmologist" },
    { name: "General Health", icon: <FaStethoscope />, keyword: "general physician" },
    { name: "Pediatric", icon: <FaChild />, keyword: "pediatrician" },
    { name: "Dental", icon: <FaTooth />, keyword: "dentist" },
];

const facilities = [
    { name: "Hospitals", icon: <BsHospital />, keyword: "hospital" },
    { name: "Pharmacies", icon: <BsCapsule />, keyword: "pharmacy" },
    { name: "Labs", icon: <AiFillExperiment />, keyword: "diagnostic lab" },
];

const DISTANCES = { "1km": 1000, "5km": 5000, "10km": 10000 };

// ====================================================================
// --- Loader Component (Used the style previously defined) ---
// ====================================================================
const BigMapLoader = ({ message }) => (
    <div style={loaderStyles.container}>
        <div style={loaderStyles.spinner} />
        <p style={loaderStyles.message}>{message}</p>
    </div>
);

// ====================================================================
// --- Details Modal Component ---
const DetailsModal = ({ place, onClose, isLoading }) => {
    const [activeTab, setActiveTab] = useState('Information');
    if (!place && !isLoading) return null;

    return (
        <div style={modalStyles.modalOverlay} onClick={onClose}>
            <div style={modalStyles.modalContent} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={modalStyles.closeButton}>&times;</button>
                {isLoading ? (
                    <BigMapLoader message="Loading details..." />
                ) : (
                    <>
                        <h2 style={{ color: COLOR_PRIMARY_ACCENT }}>{place.name}</h2>
                        <div style={modalStyles.tabs}>
                            <button onClick={() => setActiveTab('Information')} style={modalStyles.tab(activeTab === 'Information')}>Information</button>
                            <button onClick={() => setActiveTab('Photos')} style={modalStyles.tab(activeTab === 'Photos')}>Photos</button>
                            <button onClick={() => setActiveTab('Reviews')} style={modalStyles.tab(activeTab === 'Reviews')}>Reviews</button>
                        </div>
                        {/* Use fixed content area for scroll control */}
                        <div style={modalStyles.fixedContentArea}>
                            <div style={modalStyles.scrollableContent}>
                                {activeTab === 'Information' && (
                                    <div>
                                        <p><strong>Address:</strong> {place.address}</p>
                                        <p><strong>Rating:</strong> ⭐ {place.rating} ({place.totalRatings} reviews)</p>
                                        <p><strong>Status:</strong> <span style={{ color: place.isOpen ? 'green' : (place.isOpen === false ? 'red' : 'grey') }}>{place.isOpen ? 'Open Now' : (place.isOpen === false ? 'Closed' : 'Hours N/A')}</span></p>
                                        <div><strong>Services:</strong> {place.types.map(type => <span key={type} style={modalStyles.tag}>{type.replace(/_/g, ' ')}</span>)}</div>
                                    </div>
                                )}
                                {activeTab === 'Photos' && (
                                    <div style={modalStyles.photoGrid}>
                                        {place.photos && place.photos.length > 0 ? place.photos.map((photo, index) => (
                                            <img key={index} src={photo} alt={`${place.name} photo ${index + 1}`} style={modalStyles.photo} />
                                        )) : <p>No photos available.</p>}
                                    </div>
                                )}
                                {activeTab === 'Reviews' && (
                                    <div style={modalStyles.reviewList}>
                                        {place.reviews && place.reviews.length > 0 ? place.reviews.map((review, index) => (
                                            <div key={index} style={modalStyles.review}>
                                                <strong>{review.author_name}</strong> (Rated: {review.rating}/5)
                                                <p style={{ margin: '0.5rem 0' }}>{review.text}</p>
                                                <small>{review.relative_time_description}</small>
                                            </div>
                                        )) : <p>No reviews available.</p>}
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
const ResultsView = ({ userCoords, searchParams }) => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [modalDetails, setModalDetails] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: "AIzaSyCxO6iCtNnN35TV0kJadt6k2UTVvzquodg" });

    useEffect(() => {
        if (!userCoords || !searchParams) return;
        const fetchPlaces = async () => {
            setLoading(true); setPlaces([]); setSelectedPlace(null);
            // Changed from 'service' to 'keyword' to align with the specialist/facility data structure
            const params = { lat: userCoords.lat, lng: userCoords.lng, radius: searchParams.radius, keyword: searchParams.value };
            try {
                // Assuming API endpoint is correct for fetching places by keyword and radius
                const response = await axios.get(`http://localhost:5000/api/v1/places/search`, { params });
                setPlaces(response.data);
            } catch (error) { console.error("Failed to fetch places:", error); } 
            finally { setLoading(false); }
        };
        fetchPlaces();
    }, [userCoords, searchParams]);

    const handleViewDetails = async (placeId) => {
        setIsModalOpen(true); setDetailsLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/v1/places/details/${placeId}`);
            setModalDetails(response.data);
        } catch (error) { console.error("Failed to fetch place details:", error); } 
        finally { setDetailsLoading(false); }
    };

    if (loading) return <BigMapLoader message={`Searching for nearest ${searchParams.value}s...`} />;
    if (!places.length) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>No "{searchParams.value}" found within {searchParams.radius/1000}km. Try increasing the distance.</p>;

    return (
        <>
            {isModalOpen && <DetailsModal place={modalDetails} onClose={() => setIsModalOpen(false)} isLoading={detailsLoading} />}
            {/* FIX 1: contentWrapper now uses height: 80vh to prevent map overflow */}
            <div style={resultsStyles.contentWrapper}>
                {/* FIX 2: listContainer now has fixed width and scroll */}
                <div style={resultsStyles.listContainer}>
                    {places.map((place) => (
                        <div key={place.id} style={resultsStyles.listItem(selectedPlace && selectedPlace.id === place.id)} onClick={() => setSelectedPlace(place)}>
                            <h4 style={{ margin: '0 0 5px 0' }}>{place.name}</h4>
                            <p style={{ fontSize: '0.9rem', margin: '0 0 10px 0' }}>{place.address}</p>
                            <div style={resultsStyles.detailsRow}>
                                <span style={{ fontSize: '0.8rem' }}>⭐ {place.rating} ({place.totalRatings} reviews) - <span style={{ color: place.isOpen ? 'green' : 'red' }}>{place.isOpen ? 'Open' : 'Closed'}</span></span>
                                <button style={resultsStyles.detailsButton} onClick={(e) => {e.stopPropagation(); handleViewDetails(place.id)}}>View Details</button>
                            </div>
                        </div>
                    ))}
                </div>
                {/* FIX 3: mapContainer is now flex-grow and correctly contained */}
                <div style={resultsStyles.mapContainer}>
                    {isLoaded ? (
                        <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={selectedPlace ? selectedPlace.location : userCoords} zoom={14}>
                            <Marker position={userCoords} icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}/>
                            {places.map((place) => <Marker key={place.id} position={place.location} onClick={() => setSelectedPlace(place)} />)}
                            {selectedPlace && (<InfoWindow position={selectedPlace.location} onCloseClick={() => setSelectedPlace(null)}><div><strong>{selectedPlace.name}</strong></div></InfoWindow>)}
                        </GoogleMap>
                    ) : <BigMapLoader message="Loading Map Resources..." />}
                </div>
            </div>
        </>
    );
};

// ====================================================================
// --- Main Page Component ---
export default function FindMedicalServicesPage() {
    const [userCoords, setUserCoords] = useState(null);
    const [searchParams, setSearchParams] = useState(null);
    const [selectedDistance, setSelectedDistance] = useState(5000);
    const [locationRequested, setLocationRequested] = useState(false);

    useEffect(() => {
        injectSpinKeyframes(); // Ensure spinner works
        setLocationRequested(true);
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setUserCoords({ lat: 28.61, lng: 77.21 }) // Default location on denial
            );
        } else {
             setUserCoords({ lat: 28.61, lng: 77.21 }); // Default location if geo is not supported
        }
    }, []);
    
    const handleSearch = (keyword) => {
        // Toggle search off if the same button is clicked
        if(searchParams?.value === keyword) setSearchParams(null);
        // Set new search params (type isn't strictly needed for this usage, but kept for future proofing)
        else setSearchParams({ type: 'keyword', value: keyword, radius: selectedDistance });
    };

    const handleDistanceChange = (newRadius) => {
        setSelectedDistance(newRadius);
        if (searchParams) {
            // Update search params to re-fetch results with new radius
            setSearchParams(prev => ({ ...prev, radius: newRadius }));
        }
    };

    return (
        <div style={pageStyles.pageContainer}>
            <h1 style={pageStyles.title}>Find Medical Services</h1>
            <p style={pageStyles.subtitle}>Connect with healthcare professionals and medical facilities in your area</p>

            { !userCoords && locationRequested && <BigMapLoader message="Getting your location..." /> }
            { userCoords &&
                <>
                    <h2 style={pageStyles.sectionTitle}>Medical Specialists</h2>
                    <div style={pageStyles.grid}>
                        {specialists.map(item => (
                            <div 
                                key={item.name} 
                                style={pageStyles.card(searchParams?.value === item.keyword)} 
                                onClick={() => handleSearch(item.keyword)}
                            > 
                                <span style={pageStyles.icon}>{item.icon}</span> 
                                <span>{item.name}</span> 
                            </div>
                        ))}
                    </div>

                    <h2 style={pageStyles.sectionTitle}>Medical Facilities</h2>
                    {/* FIX 4: facilityContainer now uses flex for horizontal layout */}
                    <div style={pageStyles.facilityContainer}>
                        {/* FIX 5: facility cards are now horizontal within the grid */}
                        <div style={pageStyles.gridFacilities}>
                            {facilities.map(item => (
                                <div 
                                    key={item.name} 
                                    style={pageStyles.card(searchParams?.value === item.keyword)} 
                                    onClick={() => handleSearch(item.keyword)}
                                > 
                                    <span style={pageStyles.icon}>{item.icon}</span> 
                                    <span>{item.name}</span> 
                                </div>
                            ))}
                        </div>
                        <select 
                            value={selectedDistance} 
                            onChange={e => handleDistanceChange(parseInt(e.target.value))} 
                            style={pageStyles.distanceSelect}
                        >
                             {Object.entries(DISTANCES).map(([label, val]) => (
                                <option key={val} value={val}>
                                    Within {label}
                                </option>
                            ))}
                        </select>
                    </div>
                    { searchParams && <ResultsView userCoords={userCoords} searchParams={searchParams} /> }
                </>
            }
        </div>
    );
}

// ====================================================================
// --- UPDATED STYLES ---
// ====================================================================

const loaderStyles = {
    container: {
        width: '100%',
        height: '300px', // Smaller height for modal and location loading
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: COLOR_PRIMARY_LIGHT,
        borderRadius: '10px',
        border: `1px dashed ${COLOR_PRIMARY_ACCENT}`,
        marginTop: '20px',
    },
    spinner: {
        border: '6px solid #f3f3f3',
        borderTop: `6px solid ${COLOR_PRIMARY_ACCENT}`,
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite', 
        marginBottom: '10px',
    },
    message: {
        fontSize: '1rem',
        fontWeight: '600',
        color: COLOR_PRIMARY_ACCENT,
    },
};

const pageStyles = {
    pageContainer: { padding: '2rem 4rem', backgroundColor: '#fdfdff', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' },
    title: { textAlign: 'center', color: COLOR_TEXT_DARK, fontSize: '2.5rem' },
    subtitle: { textAlign: 'center', color: '#666', marginBottom: '3rem' },
    sectionTitle: { color: COLOR_TEXT_DARK, marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginTop: '3rem' },
    
    // Grid for Specialists (as per Image 1)
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.5rem', flexGrow: 1, marginBottom: '2rem' },

    // FIX 4 & 5: Horizontal layout for Facilities + Distance Selector
    facilityContainer: { 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '2rem', 
        marginBottom: '2rem', 
    },
    // Used a specific grid for facilities so it doesn't try to take up all the space
    gridFacilities: {
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, minmax(140px, 1fr))', // Ensure facilities only take up 3 columns
        gap: '1.5rem', 
    },

    card: (isSelected) => ({ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', 
        borderRadius: '10px', backgroundColor: '#fff', 
        border: `2px solid ${isSelected ? COLOR_PRIMARY_ACCENT : '#f0f0f0'}`, 
        boxShadow: isSelected ? '0 4px 12px rgba(139, 92, 246, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)', 
        cursor: 'pointer', transition: 'all 0.2s ease', 
        transform: isSelected ? 'translateY(-5px)' : 'none',
        textAlign: 'center'
    }),
    icon: { fontSize: '2rem', color: COLOR_PRIMARY_ACCENT, marginBottom: '0.75rem' },
    distanceSelect: { padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', height: 'fit-content', minWidth: '150px' },
};

const resultsStyles = {
    // FIX 1: Set a maximum height for the content wrapper and use flex to manage children
    contentWrapper: { 
        display: 'flex', 
        gap: '1.5rem', 
        height: '80vh', // Ensure the wrapper controls the maximum height
        marginTop: '1.5rem',
    },
    // FIX 2: List container with fixed width and scrollable content
    listContainer: { 
        flex: '0 0 400px', // Fixed width for the list
        background: '#fff', 
        borderRadius: '1rem', 
        border: '1px solid #e5e7eb', 
        overflowY: 'auto', 
        padding: '0.5rem', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    listItem: (isSelected) => ({ 
        padding: '1rem', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', transition: 'background-color 0.2s', 
        backgroundColor: isSelected ? COLOR_PRIMARY_LIGHT : 'transparent',
    }),
    detailsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    detailsButton: { padding: '0.3rem 0.8rem', border: `1px solid ${COLOR_PRIMARY_ACCENT}`, color: COLOR_PRIMARY_ACCENT, backgroundColor: '#fff', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' },
    // FIX 3: Map container fills remaining space and is hidden from overflow
    mapContainer: { 
        flex: 1, // Takes up remaining space
        borderRadius: '1rem', 
        overflow: 'hidden', 
        border: '1px solid #e5e7eb', 
        minHeight: '400px',
    },
};

const modalStyles = {
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { 
        background: '#fff', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '600px', 
        maxHeight: '80vh', // Main modal container height limit
        display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' 
    },
    closeButton: { position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: '#666' },
    tabs: { display: 'flex', borderBottom: '1px solid #eee', marginBottom: '1rem' },
    tab: (isActive) => ({ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: `3px solid ${isActive ? COLOR_PRIMARY_ACCENT : 'transparent'}`, fontWeight: isActive ? '600' : '500', color: isActive ? COLOR_PRIMARY_ACCENT : COLOR_TEXT_DARK, marginBottom: '-1px' }),
    
    fixedContentArea: {
        flexGrow: 1, 
        minHeight: '200px', 
        overflowY: 'auto', 
        paddingRight: '10px',
    },
    scrollableContent: {
        lineHeight: "1.6",
    },

    tag: { backgroundColor: '#f0f0f0', padding: '0.2rem 0.6rem', borderRadius: '12px', marginRight: '0.5rem', marginBottom: '0.5rem', display: 'inline-block', fontSize: '0.8rem', textTransform: 'capitalize' },
    photoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' },
    photo: { width: '100%', height: '90px', objectFit: 'cover', borderRadius: '4px' },
    reviewList: { padding: '10px 0' },
    review: { borderBottom: '1px solid #eee', padding: '1rem 0' },
};