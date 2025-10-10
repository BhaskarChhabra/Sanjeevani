// src/pages/GoogleCalendarSuccess.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleCalendarSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard after 2 sec
    const timer = setTimeout(() => navigate('/dashboard'), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>✅ Google Calendar Connected!</h2>
      <p>You will be redirected to dashboard shortly...</p>
    </div>
  );
};

export default GoogleCalendarSuccess;
