"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore'; // your Zustand store

const THEME = {
    primary: '#8b5cf6',
    backgroundLight: '#f7f9fc',
    cardBg: '#ffffff',
    textDark: '#1f2937',
    textSubtle: '#6b7280',
    border: '#e5e7eb',
    error: '#dc2626',
    success: '#10b981'
};

// --- UPDATED STYLES OBJECT FOR BETTER AESTHETICS AND SPACING ---
const styles = {
    // Outer container: Fixes unnecessary scrollbar/lack of spacing issue
    profileContainer: { 
        // FIX 1: Set margins to give space from the parent's top/bottom edges
        padding: '0 1rem 40px 1rem', 
        maxWidth: '1000px', 
        margin: '40px auto 60px auto', // Changed margin for visual balance
        backgroundColor: THEME.backgroundLight, 
        color: THEME.textDark, 
        borderRadius: '15px' 
    },
    // Inner Card: Enhanced padding and shadow
    profileCard: { 
        backgroundColor: THEME.cardBg, 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)', 
        border: `1px solid #f0f0f0`,
        minHeight: '600px',
        overflowY: 'hidden',
    },
    // Main Title: Bold and clear separation
    profileTitle: { 
        fontSize: '1.8rem', 
        fontWeight: 700, 
        color: THEME.textDark, 
        margin: '0px 0 30px 0', 
        borderBottom: `1px solid ${THEME.border}`, 
        paddingBottom: '10px' 
    },
     
    // Sub-section Title: Clear visual hierarchy and space below
    sectionTitle: { fontSize: '1.4rem', fontWeight: 600, color: THEME.textDark, margin: '30px 0 20px 0', borderBottom: `1px solid ${THEME.border}`, paddingBottom: '5px' },

    // Form Grid: Improved gap for visual separation
    formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px 20px', marginBottom: '10px' },
     
    // Form Group: Standardized spacing
    formGroup: { display: 'flex', flexDirection: 'column', marginBottom: '15px' },
    label: { fontWeight: 600, color: THEME.textSubtle, marginBottom: '6px', fontSize: '0.9rem', textTransform: 'uppercase' },

    // Input Base: Slightly more padding and defined hover/focus styles
    inputBase: { 
        width: '100%', 
        padding: '14px 15px', 
        border: `1px solid ${THEME.border}`, 
        borderRadius: '10px', 
        backgroundColor: '#fefefe', 
        color: THEME.textDark, 
        fontSize: '1rem', 
        transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s', 
        boxSizing: 'border-box',
    },
    // Disabled Input: Light background and subtle text
    disabledInput: { backgroundColor: '#f0f0f0', color: THEME.textSubtle, cursor: 'not-allowed' },
     
    statusMessage: { padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', fontWeight: 600, fontSize: '0.95rem', textAlign: 'center' },
    statusSuccess: { backgroundColor: '#d1fae5', color: THEME.success },
    statusError: { backgroundColor: '#fee2e2', color: THEME.error },
     
    // Button: Cleaner color and spacing
    updateBtn: { width: '100%', padding: '16px', backgroundColor: THEME.primary, color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', marginTop: '40px', transition: 'background-color 0.2s, transform 0.2s' },
    loader: { border: '4px solid #f3f3f3', borderTop: `4px solid ${THEME.primary}`, borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '50px auto' },
};
// --- END UPDATED STYLES ---


const GENDERS = ['', 'Male', 'Female', 'Other', 'Prefer not to say'];
const BLOOD_TYPES = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ProfilePage = () => {
    const { user } = useAuthStore(); // get logged-in user
    const userId = user?._id;

    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });

    // NOTE: Added user to dependency array to satisfy ESLint/React Hooks rules
    const loadProfile = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/profile/${userId}`);
            if (res.data.success) {
                const data = res.data.data;
                setFormData({
                    username: data.username || '',
                    email: data.email || '',
                    dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
                    gender: data.gender || '',
                    phone: data.phone || '',
                    emergencyContactName: data.emergencyContact?.name || '',
                    emergencyContactPhone: data.emergencyContact?.phone || '',
                    emergencyContactRelationship: data.emergencyContact?.relationship || '',
                    allergies: data.medicalInfo?.allergies || '',
                    conditions: data.medicalInfo?.conditions || '',
                    bloodType: data.medicalInfo?.bloodType || '',
                });
            } else {
                setStatusMessage({ type: 'error', message: res.data.message });
            }
        } catch {
            setStatusMessage({ type: 'error', message: 'Profile fetch karne me error aaya.' });
        } finally {
            setLoading(false);
        }
    }, [userId]); 

    useEffect(() => { loadProfile(); }, [loadProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) return;
        setIsSubmitting(true);
        setStatusMessage({ type: '', message: '' });

        const payload = {
            username: formData.username || null,
            dob: formData.dob ? new Date(formData.dob).toISOString() : null,
            gender: formData.gender || null,
            phone: formData.phone || null,
            emergencyContact: {
                name: formData.emergencyContactName || null,
                phone: formData.emergencyContactPhone || null,
                relationship: formData.emergencyContactRelationship || null,
            },
            medicalInfo: {
                allergies: formData.allergies || null,
                conditions: formData.conditions || null,
                bloodType: formData.bloodType || null,
            },
        };

        try {
            const res = await axios.put(`${API_BASE_URL}/api/v1/profile/${userId}`, payload);
            setStatusMessage({ type: res.data.success ? 'success' : 'error', message: res.data.message });
            if (res.data.success) setTimeout(() => setStatusMessage({ type: '', message: '' }), 4000);
        } catch (err) {
            console.error("[PROFILE SUBMIT] Error:", err);
            setStatusMessage({ type: 'error', message: 'Update fail ho gaya!' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!userId) return <div style={{ textAlign: 'center', marginTop: '50px' }}>User not logged in.</div>;
    if (loading) return <div style={styles.loader}></div>;

    // Helper function for inputs to apply focus/hover styles directly via inline JSX
    const getInputStyle = (name) => ({
        ...styles.inputBase,
    });

    return (
        // FIX 2: Outermost div acts as the full page container. 
        // FIX 3: Removed the redundant wrapper div that caused the error.
        <div style={{
            backgroundColor: THEME.backgroundLight,
            minHeight: '100vh',
            boxSizing: 'border-box'
        }}>
            <div style={styles.profileContainer}>
                <div style={styles.profileCard}>
                    <h1 style={styles.profileTitle}>Edit Your Profile</h1>
                    {statusMessage.message && <div style={{ ...styles.statusMessage, ...(statusMessage.type === 'success' ? styles.statusSuccess : styles.statusError) }}>{statusMessage.message}</div>}

                    <form onSubmit={handleSubmit}>
                        
                        {/* Account Info */}
                        <h2 style={styles.sectionTitle}>Account Info</h2>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Display Name</label>
                                <input 
                                    type="text" name="username" value={formData.username || ''} onChange={handleChange} required 
                                    style={getInputStyle('username')}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 2px ${THEME.primary}40`; e.currentTarget.style.backgroundColor = THEME.cardBg; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = '#fefefe'; }}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email Address</label>
                                <input 
                                    type="email" value={formData.email || ''} disabled 
                                    style={{ ...styles.inputBase, ...styles.disabledInput }} 
                                />
                            </div>
                        </div>

                        {/* Personal Details */}
                        <h2 style={styles.sectionTitle}>Personal Details</h2>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Date of Birth</label>
                                <input 
                                    type="date" name="dob" value={formData.dob || ''} onChange={handleChange} 
                                    style={getInputStyle('dob')}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 2px ${THEME.primary}40`; e.currentTarget.style.backgroundColor = THEME.cardBg; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = '#fefefe'; }}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Gender</label>
                                <select 
                                    name="gender" value={formData.gender || ''} onChange={handleChange} 
                                    style={getInputStyle('gender')}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 2px ${THEME.primary}40`; e.currentTarget.style.backgroundColor = THEME.cardBg; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = '#fefefe'; }}
                                >
                                    {GENDERS.map(g => <option key={g} value={g || ''}>{g || "Select"}</option>)}
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Phone Number</label>
                                <input 
                                    type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} 
                                    style={getInputStyle('phone')}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 2px ${THEME.primary}40`; e.currentTarget.style.backgroundColor = THEME.cardBg; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = '#fefefe'; }}
                                />
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <h2 style={styles.sectionTitle}>Emergency Contact</h2>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Contact Name</label>
                                <input 
                                    type="text" name="emergencyContactName" value={formData.emergencyContactName || ''} onChange={handleChange} 
                                    style={getInputStyle('emergencyContactName')}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 2px ${THEME.primary}40`; e.currentTarget.style.backgroundColor = THEME.cardBg; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = '#fefefe'; }}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Contact Phone</label>
                                <input 
                                    type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone || ''} onChange={handleChange} 
                                    style={getInputStyle('emergencyContactPhone')}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 2px ${THEME.primary}40`; e.currentTarget.style.backgroundColor = THEME.cardBg; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = '#fefefe'; }}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Relationship</label>
                                <input 
                                    type="text" name="emergencyContactRelationship" value={formData.emergencyContactRelationship || ''} onChange={handleChange} 
                                    style={getInputStyle('emergencyContactRelationship')}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 2px ${THEME.primary}40`; e.currentTarget.style.backgroundColor = THEME.cardBg; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = '#fefefe'; }}
                                />
                            </div>
                        </div>

                        {/* Medical Info */}
                        <h2 style={styles.sectionTitle}>Medical Info</h2>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Blood Type</label>
                                <select 
                                    name="bloodType" value={formData.bloodType || ''} onChange={handleChange} 
                                    style={getInputStyle('bloodType')}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 2px ${THEME.primary}40`; e.currentTarget.style.backgroundColor = THEME.cardBg; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = '#fefefe'; }}
                                >
                                    {BLOOD_TYPES.map(b => <option key={b} value={b || ''}>{b || "Select"}</option>)}
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Allergies</label>
                                <input 
                                    type="text" name="allergies" value={formData.allergies || ''} onChange={handleChange} 
                                    style={getInputStyle('allergies')}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 2px ${THEME.primary}40`; e.currentTarget.style.backgroundColor = THEME.cardBg; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = '#fefefe'; }}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Medical Conditions</label>
                                <input 
                                    type="text" name="conditions" value={formData.conditions || ''} onChange={handleChange} 
                                    style={getInputStyle('conditions')}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.boxShadow = `0 0 0 2px ${THEME.primary}40`; e.currentTarget.style.backgroundColor = THEME.cardBg; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = '#fefefe'; }}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting} style={{ ...styles.updateBtn, backgroundColor: isSubmitting ? THEME.textSubtle : THEME.primary }}>
                            {isSubmitting ? 'Updating...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;