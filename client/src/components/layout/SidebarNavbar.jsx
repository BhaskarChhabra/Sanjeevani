"use client";

import React, { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// 🛑 Import the actual useAuthStore
import useAuthStore from '../../store/useAuthStore'; // Assuming useAuthStore.js is in the same directory or accessible via this path

// --- SVG ICONS ---
const IconRobot = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M364.9 24.3l-108 81c-11.4 8.5-27.1 8.5-38.5 0l-108-81C92.2 18.2 80 27.2 80 41.5V108c0 5.3 1.9 10.4 5.3 14.4l32 38.4C125.7 167.9 141.4 176 158 176h196c16.6 0 32.3-8.1 42.7-25.2l32-38.4c3.4-4 5.3-9.1 5.3-14.4V41.5c0-14.3-12.2-23.3-26.9-17.2zM456 208H56c-22.1 0-40 17.9-40 40v248c0 13.3 10.7 24 24 24h448c13.3 0 24-10.7 24-24V248c0-22.1-17.9-40-40-40zM352 352a32 32 0 1 1 64 0 32 32 0 1 1-64 0zM128 352a32 32 0 1 1 64 0 32 32 0 1 1-64 0z"/></svg>;
const IconFileContract = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M224 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V160H240c-13.3 0-24-10.7-24-24V0zm112 456c0 4.4-3.6 8-8 8H48c-4.4 0-8-3.6-8-8V48c0-4.4 3.6-8 8-8h160v104h104v304zM264 424h-40v-40h40v40zm0-80h-40v-40h40v40zm0-80h-40v-40h40v40zm0-80h-40v-40h40v40zm-80 160h-40v-40h40v40zm0-80h-40v-40h40v40zm0-80h-40v-40h40v40z"/></svg>;
const IconPills = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M496 32h-64c-8.8 0-16 7.2-16 16v160h-160V48c0-8.8-7.2-16-16-16h-64c-8.8 0-16 7.2-16 16v416c0 8.8 7.2 16 16 16h64c8.8 0 16-7.2 16-16V304h160v160c0 8.8 7.2 16 16 16h64c8.8 0 16-7.2 16-16V48c0-8.8-7.2-16-16-16zM496 248h-64c-8.8 0-16 7.2-16 16v48h160V264c0-8.8-7.2-16-16-16z"/></svg>;
const IconHistory = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c-3.1 0-5.9 1.7-7.5 4.5l-72 136c-2.8 5.3-2.1 11.9 1.7 16.5l35.6 42.7c3.2 3.8 8.1 6.1 13.3 6.1h100.9c5.2 0 10.2-2.3 13.3-6.1l35.6-42.7c3.8-4.6 4.5-11.2 1.7-16.5l-72-136c-1.6-2.8-4.4-4.5-7.5-4.5z"/></svg>;
const IconUserCircle = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-256c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm96 112c-35.1 27.6-80.4 44-128 44s-92.9-16.4-128-44c-16.3-12.7-25.7-32.2-25.7-52.8v-6.6c19.1-8.5 37.8-17.2 55.4-26.2C140.6 308.1 198.8 336 256 336s115.4-27.9 148.3-64.8c17.6 9 36.3 17.7 55.4 26.2v6.6c0 20.6-9.4 40.1-25.7 52.8z"/></svg>;
const IconAngleDoubleLeft = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M272 456c-4.6 9.2-12.2 15-21.6 15s-16.9-5.8-21.6-15L32 256l216.4-200c4.6-9.2 12.2-15 21.6-15s16.9 5.8 21.6 15L416 256l-144 200z"/></svg>;
const IconAngleDoubleRight = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M176 456c-4.6 9.2-12.2 15-21.6 15s-16.9-5.8-21.6-15L32 256l128.4-200c4.6-9.2 12.2-15 21.6-15s16.9 5.8 21.6 15L416 256l-216 200z"/></svg>;
const IconMapMarkerAlt = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M172.2 512c-7.6 0-15.1-2.9-20.6-8.3L12 376.1c-16.7-16.7-25.9-39.7-25.9-63.1V80c0-44.2 35.8-80 80-80h224c44.2 0 80 35.8 80 80v233c0 23.4-9.2 46.4-25.9 63.1L232.4 503.7c-5.5 5.4-13 8.3-20.6 8.3H172.2zm0-448H320c13.3 0 24 10.7 24 24v205.8c0 9.8-3.9 19.1-10.8 26L211.5 455.5c-4.2 4.2-11 4.2-15.2 0L10.8 335.8c-6.9-6.9-10.8-16.2-10.8-26V80c0-13.3 10.7-24 24-24zM192 272a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>;
const IconFindServices = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M496 496a16 16 0 0 1-16 16H32a16 16 0 0 1-16-16V32a16 16 0 0 1 16-16h448a16 16 0 0 1 16 16v464zM240 384h32c8.8 0 16-7.2 16-16V160c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v208c0 8.8 7.2 16 16 16zm-96 0h32c8.8 0 16-7.2 16-16V224c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v144c0 8.8 7.2 16 16 16zm192 0h32c8.8 0 16-7.2 16-16V192c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v176c0 8.8 7.2 16 16 16z"/></svg>;

// --- THEME ---
const THEME = {
    primary: "#8b5cf6",
    background: "#ffffff",
    linkText: "#1f2937",
    linkIconDefault: "#6b7280",
    linkHoverBg: "#f3f4f6",
    activeBg: "#8b5cf6",
    activeText: "#ffffff",
    appButtonBg: "#e0e7ff",
    appButtonText: "#4f46e5",
    appButtonBorder: "#c7d2fe",
    transitionSpeed: '0.3s ease',
};

// --- NAV ITEM COMPONENT ---
const NavItem = ({ icon: Icon, text, isActive, onClick, isCollapsed }) => {
    const defaultStyle = useMemo(() => ({
        display: 'flex',
        alignItems: 'center',
        gap: isCollapsed ? '0' : '1rem',
        padding: isCollapsed ? '0.75rem 0.5rem' : '0.75rem 1.5rem',
        cursor: 'pointer',
        color: isActive ? THEME.activeText : THEME.linkText,
        fontWeight: isActive ? '600' : '500',
        backgroundColor: isActive ? THEME.activeBg : 'transparent',
        borderRadius: '8px',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        transition: `background-color 0.15s, color 0.15s, padding ${THEME.transitionSpeed}`,
        fontSize: '1rem',
    }), [isActive, isCollapsed]);

    const iconProps = { style: { color: isActive ? THEME.activeText : THEME.linkIconDefault, fontSize: '1.25rem', width: '1.25em', height: '1.25em' } };

    return (
        <div
            style={defaultStyle}
            onClick={onClick}
            onMouseEnter={e => !isActive && (e.currentTarget.style.backgroundColor = THEME.linkHoverBg)}
            onMouseLeave={e => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
        >
            <Icon {...iconProps} />
            {!isCollapsed && <span style={{ flexGrow: 1 }}>{text}</span>}
        </div>
    );
};

// --- SIDEBAR NAVBAR ---
const SidebarNavbar = ({ isCollapsed, toggleCollapse }) => {
    // 🛑 Use the imported, real useAuthStore
    const { user } = useAuthStore();
    
    const navigate = useNavigate();
    const location = useLocation();
    const SIDEBAR_WIDTH = isCollapsed ? '80px' : '240px';
    const HEADER_PADDING = isCollapsed ? '1rem 0.5rem' : '1rem 1.5rem';

    const navItemMap = useMemo(() => ([
        { text: 'AI Chat', icon: IconRobot, key: 'ai-chatbot', path: '/ai-chat' },
        { text: 'Summary', icon: IconFileContract, key: 'info-summarizer', path: '/medical-summary' },
        { text: 'Services', icon: IconFindServices, key: 'find-services', path: '/find-medical-services' },
        { text: 'Healthcare', icon: IconMapMarkerAlt, key: 'local-health-map', path: '/local-health-map' },
        { text: 'Pharmacy', icon: IconPills, key: 'medicine-compare', path: '/medicine-compare' },
        { text: 'Medications', icon: IconPills, key: 'medications', path: '/medications' },
        { text: 'Chat History', icon: IconHistory, key: 'chat-history', path: '/chat-history' },
        { text: 'Profile', icon: IconUserCircle, key: 'my-profile', path: '/profile' },
    ]), []);

    const handleNavClick = useCallback((path) => navigate(path), [navigate]);
    const isLinkActive = useCallback((path) => location.pathname.startsWith(path), [location.pathname]);

    const sidebarStyle = {
        position: 'fixed', top: 0, left: 0, width: SIDEBAR_WIDTH, height: '100vh',
        backgroundColor: THEME.background, boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif",
        zIndex: 10, color: THEME.linkText, padding: '0 0 1rem 0', transition: `width ${THEME.transitionSpeed}`,
    };

    const CollapseIcon = isCollapsed ? IconAngleDoubleRight : IconAngleDoubleLeft;

    // 🛑 Dynamic User Details Logic
    const displayName = user?.fullName || user?.username || 'Guest';
    const userInitials = displayName.charAt(0).toUpperCase();
    const userEmail = user?.email || 'Not logged in';

    return (
        <div style={sidebarStyle}>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: HEADER_PADDING, borderBottom: `1px solid ${THEME.linkHoverBg}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', overflow: 'hidden', width: isCollapsed ? '0' : 'auto', opacity: isCollapsed ? 0 : 1 }} onClick={() => navigate('/dashboard')}>
                    <img src="https://i.postimg.cc/8kBV8ktT/5f98ba83-e045-4eec-a3f2-611838a2fb1d.jpg" alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: THEME.linkText, margin: 0 }}>Sanjeevani</h1>
                </div>
                <CollapseIcon onClick={toggleCollapse} style={{ color: THEME.linkIconDefault, cursor: 'pointer', fontSize: '1.25rem', width: '1.25em', height: '1.25em', padding: '0.25rem', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = THEME.linkHoverBg} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'} />
            </div>

            {/* NAV ITEMS */}
            <div style={{ flexGrow: 1, marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', paddingRight: isCollapsed ? '0' : '0.75rem', paddingLeft: isCollapsed ? '0' : '0.75rem' }}>
                {navItemMap.map(item => (
                    <NavItem key={item.key} icon={item.icon} text={item.text} isActive={isLinkActive(item.path)} onClick={() => handleNavClick(item.path)} isCollapsed={isCollapsed} />
                ))}
            </div>

            {/* USER INFO (Updated to use dynamic user data from Zustand) */}
            <div style={{ padding: HEADER_PADDING, display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: `1px solid ${THEME.linkHoverBg}`, marginTop: '1rem' }}>
                <div style={{ width: '40px', minWidth: '40px', height: '40px', backgroundColor: THEME.primary, borderRadius: '50%', color: 'white', fontWeight: 'bold', fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Display user initials */}
                    {user ? userInitials : '?'}
                </div>
                
                {!isCollapsed && (
                    <div style={{ lineHeight: '1.2', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {/* Display user full name or username */}
                        <p style={{ margin: 0, fontWeight: '600', fontSize: '0.875rem', color: THEME.linkText }}>{displayName}</p>
                        {/* Display user email */}
                        <p style={{ margin: 0, fontSize: '0.75rem', color: THEME.linkIconDefault }}>{userEmail}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SidebarNavbar