"use client"

import React, { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// --- SVGS REPLACED REACT-ICONS ---
const IconRobot = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M364.9 24.3l-108 81c-11.4 8.5-27.1 8.5-38.5 0l-108-81C92.2 18.2 80 27.2 80 41.5V108c0 5.3 1.9 10.4 5.3 14.4l32 38.4C125.7 167.9 141.4 176 158 176h196c16.6 0 32.3-8.1 42.7-25.2l32-38.4c3.4-4 5.3-9.1 5.3-14.4V41.5c0-14.3-12.2-23.3-26.9-17.2zM456 208H56c-22.1 0-40 17.9-40 40v248c0 13.3 10.7 24 24 24h448c13.3 0 24-10.7 24-24V248c0-22.1-17.9-40-40-40zM352 352a32 32 0 1 1 64 0 32 32 0 1 1-64 0zM128 352a32 32 0 1 1 64 0 32 32 0 1 1-64 0z"/></svg>
const IconFileContract = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M224 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V160H240c-13.3 0-24-10.7-24-24V0zm112 456c0 4.4-3.6 8-8 8H48c-4.4 0-8-3.6-8-8V48c0-4.4 3.6-8 8-8h160v104h104v304zM264 424h-40v-40h40v40zm0-80h-40v-40h40v40zm0-80h-40v-40h40v40zm0-80h-40v-40h40v40zm-80 160h-40v-40h40v40zm0-80h-40v-40h40v40zm0-80h-40v-40h40v40z"/></svg>
const IconPills = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M544 32c-35.3 0-64 28.7-64 64s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64zm-80 96c0-17.7 14.3-32 32-32s32 14.3 32 32v12c0 23.3 18.7 42 42 42h12c17.7 0 32 14.3 32 32s-14.3 32-32 32h-12c-23.3 0-42-18.7-42-42v-12c0-17.7-14.3-32-32-32s-32-14.3-32-32zM80 64C44.7 64 16 92.7 16 128s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64zm80 96c0-17.7 14.3-32 32-32s32 14.3 32 32v12c0 23.3 18.7 42 42 42h12c17.7 0 32 14.3 32 32s-14.3 32-32 32H206c-23.3 0-42-18.7-42-42v-12c0-17.7-14.3-32-32-32s-32-14.3-32-32zM320 224c-35.3 0-64 28.7-64 64s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64zm80 96c0-17.7 14.3-32 32-32s32 14.3 32 32v12c0 23.3 18.7 42 42 42h12c17.7 0 32 14.3 32 32s-14.3 32-32 32h-12c-23.3 0-42-18.7-42-42v-12c0-17.7-14.3-32-32-32s-32-14.3-32-32zM544 384c-35.3 0-64 28.7-64 64s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64zm-80 96c0-17.7 14.3-32 32-32s32 14.3 32 32v12c0 23.3 18.7 42 42 42h12c17.7 0 32 14.3 32 32s-14.3 32-32 32h-12c-23.3 0-42-18.7-42-42v-12c0-17.7-14.3-32-32-32s-32-14.3-32-32zM80 384C44.7 384 16 412.7 16 448s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64zm80 96c0-17.7 14.3-32 32-32s32 14.3 32 32v12c0 23.3 18.7 42 42 42h12c17.7 0 32 14.3 32 32s-14.3 32-32 32H206c-23.3 0-42-18.7-42-42v-12c0-17.7-14.3-32-32-32s-32-14.3-32-32z"/></svg>
const IconHistory = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c-3.1 0-5.9 1.7-7.5 4.5l-72 136c-2.8 5.3-2.1 11.9 1.7 16.5l35.6 42.7c3.2 3.8 8.1 6.1 13.3 6.1h100.9c5.2 0 10.2-2.3 13.3-6.1l35.6-42.7c3.8-4.6 4.5-11.2 1.7-16.5l-72-136c-1.6-2.8-4.4-4.5-7.5-4.5z"/></svg>
const IconUserCircle = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-256c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm96 112c-35.1 27.6-80.4 44-128 44s-92.9-16.4-128-44c-16.3-12.7-25.7-32.2-25.7-52.8v-6.6c19.1-8.5 37.8-17.2 55.4-26.2C140.6 308.1 198.8 336 256 336s115.4-27.9 148.3-64.8c17.6 9 36.3 17.7 55.4 26.2v6.6c0 20.6-9.4 40.1-25.7 52.8z"/></svg>
const IconAngleDoubleLeft = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M192 448c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l139.4 139.4c12.5 12.5 12.5 32.75 0 45.25C208.4 444.9 200.2 448 192 448zM384 448c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L270.8 256l139.4 139.4c12.5 12.5 12.5 32.75 0 45.25C400.4 444.9 392.2 448 384 448z"/></svg>
const IconSmartphone = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M304 0H80C44.7 0 16 28.7 16 64v384c0 35.3 28.7 64 64 64h224c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64zM224 480c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16s7.2-16 16-16h32c8.8 0 16 7.2 16 16zM304 64c0-8.8-7.2-16-16-16H96c-8.8 0-16 7.2-16 16V368h240V64z"/></svg>

// --- THEME ---
const THEME = {
    primary: "#00122e",
    secondary: "#1b0046",
    gold: "#ffb84d",
    emerald: "#38a169",
    emerald_light: "#68d391",
    ruby: "#cc4444",
    indigo: "#a5b4fc",
    card_bg: "rgba(30, 30, 46, 0.7)",
    accent_border: "rgba(255, 184, 77, 0.3)",
    delete_gradient: "linear-gradient(135deg, #cc4444, #a02c2c)",
    glass_bg: "rgba(255, 255, 255, 0.05)",
    
    // NEW COLORS BASED ON IMAGE:
    activePurple: "#8a2be2", 
    appButtonBg: "#f0f8ff",   
    appButtonBorder: "#a5b4fc", 
    appButtonText: "#3b82f6",  
};

const MOCK_USER = {
    initials: 'B',
    fullName: 'Bhaskar Chhabra',
    email: 'bhaskarchhabra...'
}

/**
 * Helper component for a single navigation link.
 */
const NavItem = ({ icon: Icon, text, isActive, onClick }) => {
    const defaultStyle = useMemo(() => ({
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem 1.5rem',
        marginRight: '0.75rem', 
        cursor: 'pointer',
        
        color: isActive ? 'white' : THEME.primary, 
        fontWeight: isActive ? '600' : '500',
        backgroundColor: isActive ? THEME.activePurple : 'transparent', 
        borderRadius: '8px', 
        
        borderLeft: 'none', 
        marginLeft: '0', 
        
        transition: 'background-color 0.15s, color 0.15s',
        fontSize: '1rem',
    }), [isActive]);

    const iconProps = {
        style: { color: isActive ? 'white' : '#9ca3af', fontSize: '1.25rem', width: '1.25em', height: '1.25em' }
    };

    return (
        <div 
            style={defaultStyle}
            onClick={onClick} 
            onMouseEnter={e => !isActive && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={e => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
        >
            {/* Render the icon component with dynamic props */}
            <Icon {...iconProps} /> 
            <span style={{ flexGrow: 1 }}>{text}</span>
        </div>
    );
};

// --- MAIN COMPONENT ---
const SidebarNavbar = () => {
    // ⭐️ Router hooks remain functional
    const navigate = useNavigate();
    const location = useLocation();

    // Mapping sidebar icon components to paths
    const navItemMap = useMemo(() => ([
        { text: 'AI Chatbot', icon: IconRobot, key: 'ai-chatbot', path: '/ai-chat' },
        { text: 'Info Summarizer', icon: IconFileContract, key: 'info-summarizer', path: '/info-summarizer' },
        { text: 'Medications', icon: IconPills, key: 'medications', path: '/medications' },
        { text: 'Chat History', icon: IconHistory, key: 'chat-history', path: '/chat-history' },
        { text: 'My Profile', icon: IconUserCircle, key: 'my-profile', path: '/profile' },
    ]), []);

    const handleNavClick = useCallback((path) => {
        navigate(path);
    }, [navigate]);

    // Function to check if the current location matches the item's path
    const isLinkActive = useCallback((path) => {
        // Handle root path /ai-chat and similar paths by checking start
        if (path === '/') return location.pathname === path;
        // Adjusting for paths like /info-summarizer and ensuring it doesn't match /info-summarizer-long
        return location.pathname.startsWith(path) && 
               (location.pathname.length === path.length || location.pathname[path.length] === '/');
    }, [location.pathname]);

    const sidebarStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '240px',
        height: '100vh',
        backgroundColor: '#fff', 
        boxShadow: '2px 0 10px rgba(0,0,0,0.05)', 
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', sans-serif",
        zIndex: 10,
        color: '#1f2937', 
        padding: '0 0 1rem 0', 
    };
    
    return (
        <div style={sidebarStyle}>
            {/* Header: Logo and Collapse Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                    onClick={() => navigate('/dashboard')}
                >
                    {/* Placeholder image tag */}
                    <img src="https://placehold.co/24x24/38a169/ffffff?text=M" alt="Medibot Logo" style={{ width: '24px', height: '24px', borderRadius: '50%' }} /> 
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: THEME.primary, margin: 0 }}>Sanjeevani</h1>
                </div>
                {/* Icon replacement */}
                <IconAngleDoubleLeft style={{ color: '#9ca3af', cursor: 'pointer', fontSize: '1.25rem', width: '1.25em', height: '1.25em' }} />
            </div>

            {/* Navigation Links (List) */}
            <div style={{ flexGrow: 1, marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {navItemMap.map(item => (
                    <NavItem 
                        key={item.key}
                        icon={item.icon}
                        text={item.text}
                        isActive={isLinkActive(item.path)} 
                        onClick={() => handleNavClick(item.path)}
                    />
                ))}
            </div>

            {/* Footer: Get the App Button */}
            <div style={{ padding: '1rem 1.5rem 0 1.5rem' }}>
                <button
                    style={{
                        width: '100%',
                        padding: '0.75rem 0',
                        backgroundColor: THEME.appButtonBg,
                        color: THEME.appButtonText, 
                        borderRadius: '0.5rem',
                        border: `1px solid ${THEME.appButtonBorder}`, 
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'background-color 0.15s, border-color 0.15s',
                    }}
                    onClick={() => console.log("Redirecting to App Store/Play Store...")}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = THEME.appButtonBg}
                >
                    {/* Icon replacement */}
                    <IconSmartphone style={{ width: '1.125rem', height: '1.125rem' }} />
                    Get the App
                </button>
            </div>

            {/* Footer: User Profile */}
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid #f3f4f6', marginTop: '1rem' }}>
                <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: THEME.ruby, 
                    borderRadius: '50%', 
                    color: 'white', 
                    fontWeight: 'bold', 
                    fontSize: '1.125rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {MOCK_USER.initials}
                </div>
                <div style={{ lineHeight: '1.2' }}>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '0.875rem', color: THEME.primary }}>{MOCK_USER.fullName}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>{MOCK_USER.email}</p>
                </div>
            </div>
        </div>
    );
};

export default SidebarNavbar;
