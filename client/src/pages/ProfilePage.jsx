"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { create } from 'zustand';
import axios from 'axios';

// ------------------- Auth Store -------------------
const useAuthStore = create((set) => ({
    user: { _id: 'user123', username: 'Bhaskar Chhabra', email: 'bhaskar.chhabra@example.com' },
    isAuthenticated: true,
    login: (userData) => set({ user: userData, isAuthenticated: true }),
    logout: () => set({ user: null, isAuthenticated: false }),
}));

// ------------------- Inline Icons -------------------
const IconCamera = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="currentColor" d="M149.2 249.2l128 128c6.2 6.2 14.4 9.4 22.6 9.4s16.4-3.2 22.6-9.4l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 306.7V176c0-17.7-14.3-32-32-32s-32 14.3-32 32v130.7L194.2 203.9c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3zM256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-448c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16V64c0-8.8-7.2-16-16-16zm-80 320c0 17.7-14.3 32-32 32s-32-14.3-32-32v-32c0-17.7 14.3-32 32-32s32 14.3 32 32v32zm160 0c0 17.7-14.3 32-32 32s-32-14.3-32-32v-32c0-17.7 14.3-32 32-32s32 14.3 32 32v32z"/>
    </svg>
);

// ------------------- Theme & Styles -------------------
const THEME = {
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    backgroundLight: '#f7f9fc',
    cardBg: '#ffffff',
    textDark: '#1f2937',
    textSubtle: '#6b7280',
    border: '#e5e7eb',
    error: '#dc2626',
    success: '#10b981',
};

const GENDERS = ['', 'Male', 'Female', 'Other', 'Prefer not to say'];
const BLOOD_TYPES = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const styles = {
    profileContainer: { padding: '2rem', maxWidth: '1100px', margin: '0 auto', backgroundColor: THEME.backgroundLight, color: THEME.textDark, minHeight: '100vh', boxSizing: 'border-box' },
    profileCard: { backgroundColor: THEME.cardBg, padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '25px', border: `1px solid ${THEME.border}`, transition: 'all 0.3s' },
    profileTitle: { fontSize: '2rem', fontWeight: 700, color: THEME.textDark, margin: '0 0 25px 0', borderBottom: `2px solid ${THEME.border}`, paddingBottom: '10px' },
    formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' },
    formRowThreeCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' },
    formRowSingleCol: { display: 'grid', gridTemplateColumns: '1fr', maxWidth: '350px', marginBottom: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { fontWeight: 500, color: THEME.textDark, marginBottom: '8px', fontSize: '0.95rem' },
    inputBase: { width: '100%', padding: '12px 15px', border: `1px solid ${THEME.border}`, borderRadius: '8px', backgroundColor: '#f9f9f9', color: THEME.textDark, fontSize: '1rem', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box' },
    disabledInput: { backgroundColor: '#eeeeee', color: THEME.textSubtle, cursor: 'not-allowed' },
    smallText: { color: THEME.textSubtle, fontSize: '0.8rem', marginTop: '4px' },
    avatarSection: { display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
    avatarWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    userAvatarPlaceholder: { width: '100px', height: '100px', borderRadius: '50%', border: `3px solid ${THEME.primary}`, marginBottom: '10px', backgroundColor: THEME.primary, color: 'white', fontSize: '3rem', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' },
    changePhotoBtn: { backgroundColor: THEME.cardBg, color: THEME.textDark, border: `1px solid ${THEME.border}`, padding: '8px 15px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', transition: 'background-color 0.2s' },
    fileInfo: { fontSize: '0.8rem', color: THEME.textSubtle, margin: 0, marginTop: '20px' },
    statusMessage: { padding: '10px 20px', borderRadius: '8px', marginBottom: '20px', fontWeight: 600, fontSize: '0.95rem' },
    statusSuccess: { backgroundColor: '#d1fae5', color: THEME.success, border: `1px solid ${THEME.success}` },
    statusError: { backgroundColor: '#fee2e2', color: THEME.error, border: `1px solid ${THEME.error}` },
    updateBtn: { width: '100%', padding: '15px', backgroundColor: THEME.primary, color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', marginTop: '30px', transition: 'background-color 0.2s', boxShadow: `0 4px 10px rgba(139, 92, 246, 0.4)` },
    googleSyncBtn: { backgroundColor: '#4285f4', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' },
    loader: { border: '4px solid #f3f3f3', borderTop: `4px solid ${THEME.primary}`, borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '20px auto' },
};

// ------------------- Input Focus -------------------
const inputFocus = (e) => { e.target.style.borderColor = THEME.primary; e.target.style.boxShadow = `0 0 0 2px rgba(139,92,246,0.2)`; e.target.style.backgroundColor = THEME.cardBg; };
const inputBlur = (e) => { e.target.style.borderColor = THEME.border; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#f9f9f9'; };

// ------------------- API Functions -------------------
const fetchProfile = async (userId) => {
    try {
        const res = await axios.get(`http://localhost:5000/api/v1/profile/${userId}`, { withCredentials: true });
        if (res.data.success) return res.data.data;
        return {};
    } catch (err) {
        console.error('Fetch profile error:', err);
        return {};
    }
};

const updateProfileAPI = async (userId, data) => {
    try {
        const res = await axios.put(`http://localhost:5000/api/v1/profile/${userId}`, data, { withCredentials: true });
        return res.data;
    } catch (err) {
        console.error('Update profile error:', err);
        return { success: false, message: 'Update failed' };
    }
};

// ------------------- Component -------------------
const ProfilePage = () => {
    const { user } = useAuthStore();
    const [formData, setFormData] = useState({ username: '', email: '', dob: '', gender: '', phone: '', emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: '', allergies: '', conditions: '', bloodType: '' });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        if (!user?._id) return setLoading(false);
        const loadProfile = async () => {
            const data = await fetchProfile(user._id);
            setFormData({
                username: data.username || user.username,
                email: data.email || user.email,
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
            setAvatarUrl(data.avatarUrl || '');
            setLoading(false);
        };
        loadProfile();
    }, [user]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage({ type: '', message: '' });

        if (!user?._id) { setStatusMessage({ type: 'error', message: 'Authentication required.' }); setIsSubmitting(false); return; }

        const payload = {
            userData: { username: formData.username },
            profileData: {
                dob: formData.dob,
                gender: formData.gender,
                phone: formData.phone,
                emergencyContact: { name: formData.emergencyContactName, phone: formData.emergencyContactPhone, relationship: formData.emergencyContactRelationship },
                medicalInfo: { allergies: formData.allergies, conditions: formData.conditions, bloodType: formData.bloodType },
            }
        };

        const res = await updateProfileAPI(user._id, payload);
        setStatusMessage({ type: res.success ? 'success' : 'error', message: res.message });
        setIsSubmitting(false);
    };

    if (loading) return <div style={{ ...styles.profileContainer, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px' }}><div style={styles.loader}></div><p>Loading Profile...</p></div>;

    const displayNameInitial = (formData.username.charAt(0) || user?.username.charAt(0) || 'U').toUpperCase();

    return (
        <>
            <style>{`@keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}`}</style>
            <div style={styles.profileContainer}>
                <div style={styles.profileCard}>
                    <h1 style={styles.profileTitle}>Profile Settings</h1>
                    {statusMessage.message && <div style={{ ...styles.statusMessage, ...(statusMessage.type === 'success' ? styles.statusSuccess : styles.statusError) }}>{statusMessage.message}</div>}
                    <form onSubmit={handleSubmit}>
                        {/* Avatar Section */}
                        <div style={styles.avatarSection}>
                            <div style={styles.avatarWrapper}>
                                {avatarUrl ? <img src={avatarUrl} alt="User Avatar" style={styles.userAvatarPlaceholder} /> : <div style={styles.userAvatarPlaceholder}>{displayNameInitial}</div>}
                                <button type="button" style={styles.changePhotoBtn}><IconCamera style={{ width: '1em', height: '1em' }} /> Change Photo</button>
                            </div>
                            <p style={styles.fileInfo}>JPG, PNG, or GIF. Max size 2MB.</p>
                        </div>

                        {/* Account Info */}
                        <h2 style={styles.profileTitle}>Account Information</h2>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Display Name</label>
                                <input type="text" name="username" value={formData.username} onChange={handleChange} required style={styles.inputBase} onFocus={inputFocus} onBlur={inputBlur} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email Address</label>
                                <input type="email" value={formData.email} disabled style={{ ...styles.inputBase, ...styles.disabledInput }} />
                                <small style={styles.smallText}>Email cannot be changed.</small>
                            </div>
                        </div>

                        {/* DOB, Gender, Phone */}
                        <div style={styles.formRowThreeCol}>
                            <div style={styles.formGroup}><label style={styles.label}>Date of Birth</label><input type="date" name="dob" value={formData.dob} onChange={handleChange} style={styles.inputBase} onFocus={inputFocus} onBlur={inputBlur} /></div>
                            <div style={styles.formGroup}><label style={styles.label}>Gender</label><select name="gender" value={formData.gender} onChange={handleChange} style={styles.inputBase} onFocus={inputFocus} onBlur={inputBlur}>{GENDERS.map(g => <option key={g} value={g}>{g || "Select gender"}</option>)}</select></div>
                            <div style={styles.formGroup}><label style={styles.label}>Phone Number</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={styles.inputBase} onFocus={inputFocus} onBlur={inputBlur} /></div>
                        </div>

                        {/* Emergency Contact */}
                        <h2 style={styles.profileTitle}>Emergency Contact</h2>
                        <div style={styles.formRowThreeCol}>
                            <div style={styles.formGroup}><label style={styles.label}>Contact Name</label><input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} style={styles.inputBase} onFocus={inputFocus} onBlur={inputBlur} /></div>
                            <div style={styles.formGroup}><label style={styles.label}>Contact Phone</label><input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} style={styles.inputBase} onFocus={inputFocus} onBlur={inputBlur} /></div>
                            <div style={styles.formGroup}><label style={styles.label}>Relationship</label><input type="text" name="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleChange} style={styles.inputBase} onFocus={inputFocus} onBlur={inputBlur} /></div>
                        </div>

                        {/* Medical Info */}
                        <h2 style={styles.profileTitle}>Medical Information</h2>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}><label style={styles.label}>Allergies</label><input type="text" name="allergies" value={formData.allergies} onChange={handleChange} style={styles.inputBase} onFocus={inputFocus} onBlur={inputBlur} /></div>
                            <div style={styles.formGroup}><label style={styles.label}>Medical Conditions</label><input type="text" name="conditions" value={formData.conditions} onChange={handleChange} style={styles.inputBase} onFocus={inputFocus} onBlur={inputBlur} /></div>
                        </div>

                        <div style={styles.formRowSingleCol}>
                            <div style={styles.formGroup}><label style={styles.label}>Blood Type</label><select name="bloodType" value={formData.bloodType} onChange={handleChange} style={styles.inputBase} onFocus={inputFocus} onBlur={inputBlur}>{BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt || 'Select blood type'}</option>)}</select></div>
                        </div>

                        <button type="submit" disabled={isSubmitting} style={styles.updateBtn}>{isSubmitting ? 'Updating...' : 'Update Profile'}</button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;
