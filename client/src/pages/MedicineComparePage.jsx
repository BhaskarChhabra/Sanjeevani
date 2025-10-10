import React, { useState } from 'react';
import axios from 'axios';

// Base Lavender Color (Can be adjusted)
const LAVENDER_PRIMARY = '#B19CD9'; // A soft, visible lavender
const LAVENDER_HOVER = '#9370DB'; // A slightly darker lavender for hover/active states
const WHITE_BACKGROUND = '#FFFFFF';
const LIGHT_BACKGROUND = '#F8F9FA'; // Light grey/off-white for contrast

const DEFAULT_MEDICINE_IMAGE = "https://via.placeholder.com/160x160.png?text=Medicine";

const MedicineComparePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // **LOGIC REMAINS UNTOUCHED**
  const [selectedSource, setSelectedSource] = useState('all'); // all / 1mg / pharmeasy
  const [priceSort, setPriceSort] = useState('none'); // none / low / high

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError('Please enter a medicine name to search.');
      return;
    }

    setIsLoading(true);
    setResults([]);
    setError('');

    try {
      const API_URL = `http://localhost:5000/api/v1/medicines/search?medicine=${searchTerm}`;
      const response = await axios.get(API_URL);

      const data = response.data.data || [];
      if (!data.length) {
        setError('No medicines found. Try a different name.');
      }

      setResults(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch data. Server might be down.';
      setError(errorMessage);
      console.error('API call failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = results
    .filter(med => 
      med.name.toLowerCase() !== "n/a this is generic medicine" &&
      (selectedSource === 'all' ? true : med.source.toLowerCase() === selectedSource.toLowerCase())
    )
    .sort((a, b) => {
      if (!a.price) return 1;
      if (!b.price) return -1;
      if (priceSort === 'low') return a.price - b.price;
      if (priceSort === 'high') return b.price - a.price;
      return 0;
    });
  // **END LOGIC**

  // Reusable style for a clean input/select field
  const inputStyle = {
    padding: '12px', 
    fontSize: '1rem', 
    border: '1px solid #ddd', 
    borderRadius: '8px', 
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: WHITE_BACKGROUND,
  };

  return (
    // Using a standard system font stack for a clean, modern look.
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji', backgroundColor: LIGHT_BACKGROUND, minHeight: '100vh', padding: '20px' }}>
      
      {/* Content Area - White box */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: WHITE_BACKGROUND, borderRadius: '12px', boxShadow: '0 4px 18px rgba(0,0,0,0.1)', padding: '30px' }}>
        
        {/* --- ENHANCED HEADER SECTION --- */}
        <header style={{ borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            {/* Enhanced Icon and Title */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              padding: '8px 15px',
              backgroundColor: LAVENDER_PRIMARY, 
              borderRadius: '8px',
              color: WHITE_BACKGROUND,
              boxShadow: '0 2px 8px rgba(177, 156, 217, 0.6)' 
            }}>
              <span style={{ fontSize: '1.25rem', marginRight: '10px' }}>🔗</span> 
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: WHITE_BACKGROUND, margin: 0 }}>
                Medicine Price Comparison
              </h1>
            </div>
          </div>
          <p style={{ color: '#6c757d', fontSize: '1rem', marginTop: '15px' }}>
            Quickly discover the **lowest prices** and best deals from **multiple online pharmacies**.
          </p>
        </header>

        {/* Search Bar and Button */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for medicines, e.g., Crocin 650mg..."
            style={{ ...inputStyle, flexGrow: 1 }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{ 
              padding: '12px 24px', 
              fontSize: '1rem', 
              fontWeight: '600',
              border: 'none', 
              borderRadius: '8px',
              backgroundColor: isLoading ? '#ccc' : LAVENDER_PRIMARY, 
              color: 'white', 
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
        
        {/* --- NEW: LOADING LEADER/PROGRESS BAR --- */}
        {isLoading && (
            <div style={{ marginBottom: '40px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: LAVENDER_HOVER, fontWeight: '500' }}>
                    Searching across pharmacies...
                </p>
                <div style={{ 
                    height: '6px', 
                    backgroundColor: LIGHT_BACKGROUND, 
                    borderRadius: '3px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: '100%', // Take full width of the parent container
                        height: '100%',
                        backgroundColor: LAVENDER_PRIMARY,
                        // CSS Animation for indefinite movement
                        animation: 'loading-stripes 1.5s linear infinite',
                        transform: 'translateX(0%)', // Initial state for animation to start
                        // The keyframes for the animation need to be defined outside of inline styles 
                        // (usually in a CSS file or using styled-components).
                        // Since we are using inline styles, we'll use a simple indicator:
                        opacity: 0.8,
                        transformOrigin: 'left',
                        transition: 'transform 0.5s ease-in-out' // Simple visual cue
                    }} />
                </div>
            </div>
        )}
        {/* -------------------------------------- */}

        {/* Alerts and Filters */}
        
        {error && <p style={{ color: '#dc3545', textAlign: 'center', marginBottom: '20px', fontWeight: '500' }}>⚠️ **Error:** {error}</p>}

        {results.length > 0 && ( 
          <>
            {/* --- ENHANCED FILTER/OPTIONS BAR --- */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: LAVENDER_HOVER, display: 'flex', alignItems: 'center', letterSpacing: '0.5px' }}>
                <span style={{ marginRight: '10px', fontSize: '1.5rem', transform: 'translateY(2px)' }}>⚙️</span> Available Options
              </h2>
              
              <select 
                value={selectedSource} 
                onChange={(e) => setSelectedSource(e.target.value)} 
                style={{ ...inputStyle, width: '150px', padding: '10px', fontWeight: '500' }}
              >
                <option value="all">All Sources</option>
                <option value="1mg">1mg</option>
                <option value="pharmeasy">Pharmeasy</option>
              </select>

              <select 
                value={priceSort} 
                onChange={(e) => setPriceSort(e.target.value)} 
                style={{ ...inputStyle, width: '180px', padding: '10px', fontWeight: '500' }}
              >
                <option value="none">Sort by Price</option>
                <option value="low">Price: Low → High</option>
                <option value="high">Price: High → Low</option>
              </select>
            </div>

            {/* Medicine Results Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
              {filteredResults.map((medicine, index) => (
                <div 
                  key={index} 
                  style={{ 
                    border: `1px solid #e0e0e0`,
                    borderRadius: '12px', 
                    padding: '20px', 
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    backgroundColor: WHITE_BACKGROUND,
                    transition: 'transform 0.2s',
                  }}
                >
                  <div style={{ height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px' }}>
                    <img 
                      src={medicine.imageUrl || DEFAULT_MEDICINE_IMAGE} 
                      alt={medicine.name} 
                      style={{ 
                        maxHeight: '100%', 
                        maxWidth: '100%', 
                        objectFit: 'contain', 
                        borderRadius: '8px'
                      }} 
                    />
                  </div>
                  
                  {/* Source Badge */}
                  <span style={{ display: 'inline-block', backgroundColor: LAVENDER_PRIMARY, color: WHITE_BACKGROUND, padding: '4px 10px', fontSize: '0.75rem', borderRadius: '15px', marginBottom: '8px', fontWeight: '600' }}>
                    {medicine.source || 'Online Pharmacy'}
                  </span>

                  <h3 style={{ fontWeight: '600', fontSize: '1rem', minHeight: '40px', margin: '0 0 5px 0', color: '#333' }}>
                    {medicine.name}
                  </h3>
                  
                  <p style={{ fontSize: '1.5rem', color: '#198754', fontWeight: 'bolder', margin: '0 0 15px 0' }}>
                    ₹{medicine.price ? Number(medicine.price).toFixed(2) : 'N/A'} 
                  </p>
                  
                  <a
                    href={medicine.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'block', 
                      width: '100%', 
                      textAlign: 'center', 
                      backgroundColor: LAVENDER_HOVER, 
                      color: 'white', 
                      padding: '10px', 
                      borderRadius: '8px', 
                      textDecoration: 'none',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Go to Store
                  </a>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default MedicineComparePage;