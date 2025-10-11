import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- STYLING CONSTANTS ---
const COLOR_PRIMARY_PURPLE = "#7d44e7"; // Main Brand Color
const COLOR_TEXT_DARK = "#1f2937"; // Dark Text for contrast
const COLOR_TEXT_LIGHT = "#ffffff";
const COLOR_BUTTON_BG = "#f3e8ff"; // Very Light Lavender/Purple for logo background
const COLOR_HOVER_PURPLE = "#9d5cff";

// --- GLOBAL FONT FIX (Recommended to be placed in an index.html or global CSS) ---
// For the component's inline styles to work, the font must be available.
// I'm adding a global style block here for the sake of completeness in one file.
const GlobalFontStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
        }
    `}</style>
);
// ---------------------------------------------------------------------------------


// ✨ Animated Gradient Button
const AnimatedButton = ({ children, style, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            style={{
                position: 'relative',
                overflow: 'hidden',
                background: isHovered
                    ? 'linear-gradient(135deg, #ffffff, #f9f9ff)'
                    : `linear-gradient(135deg, ${COLOR_HOVER_PURPLE}, ${COLOR_PRIMARY_PURPLE})`,
                color: isHovered ? COLOR_TEXT_DARK : COLOR_TEXT_LIGHT,
                padding: '10px 24px', // Slightly adjusted padding
                borderRadius: '8px', // Slightly smaller radius
                border: isHovered ? `2px solid ${COLOR_PRIMARY_PURPLE}80` : 'none',
                fontWeight: '600', // Slightly lighter weight for modern look
                fontSize: '0.95rem',
                letterSpacing: '0.3px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isHovered
                    ? `0 6px 15px rgba(125,68,231,0.2)`
                    : '0 4px 8px rgba(0,0,0,0.1)',
                transform: isHovered ? 'translateY(-2px)' : 'scale(1)', // Elegant lift on hover
                ...style
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span
                style={{
                    position: 'relative',
                    zIndex: 2,
                }}
            >
                {children}
            </span>

            <span
                style={{
                    position: 'absolute',
                    top: 0,
                    left: isHovered ? '100%' : '-75%',
                    width: '50%',
                    height: '100%',
                    background: 'rgba(255,255,255,0.35)',
                    transform: 'skewX(-20deg)',
                    transition: 'left 0.4s ease',
                    zIndex: 1,
                }}
            />
        </button>
    );
};

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const navItems = [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'About Us', href: '#about' },
        { name: 'Contact', href: '#contact' },
    ];

    const LinkItem = ({ name, href, isMobile = false }) => {
        const [isHovered, setIsHovered] = useState(false);
        return (
            <a
                href={href}
                style={{
                    color: isHovered
                        ? COLOR_TEXT_LIGHT // Keep link white on hover for mobile
                        : (isMobile ? COLOR_TEXT_DARK : COLOR_TEXT_LIGHT),
                    fontWeight: '500',
                    textDecoration: 'none',
                    padding: isMobile ? '12px 15px' : '8px 12px',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    backgroundColor: isHovered ? `${COLOR_PRIMARY_PURPLE}30` : 'transparent', // Subtle hover background
                    display: 'block',
                    width: isMobile ? '100%' : 'auto',
                    boxShadow: 'none',
                    fontSize: isMobile ? '1rem' : '0.95rem',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={isMobile ? () => setIsMenuOpen(false) : undefined}
            >
                {name}
            </a>
        );
    };

    const MobileMenuButton = ({ children, onClick }) => (
        <button
            onClick={onClick}
            style={{
                background: 'none',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '8px',
                padding: '8px',
                color: COLOR_TEXT_LIGHT,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                minWidth: '40px',
                transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = `${COLOR_PRIMARY_PURPLE}30`}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
            {children}
        </button>
    );

    return (
        <nav style={{
            backgroundColor: COLOR_PRIMARY_PURPLE,
            padding: '12px 20px', // Slightly more padding
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontFamily: 'Inter, sans-serif', // ✨ Set new elegant font
            position: 'relative',
            zIndex: 10
        }}>
            <GlobalFontStyles /> {/* Include font import here */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                        width: '36px', // Standardized size
                        height: '36px', 
                        borderRadius: '50%',
                        backgroundColor: COLOR_BUTTON_BG,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '8px', // Tighter gap
                        overflow: 'hidden'
                    }}>
                        <img
                            src="https://i.postimg.cc/8kBV8ktT/5f98ba83-e045-4eec-a3f2-611838a2fb1d.jpg"
                            alt="Logo"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <a href="/" style={{
                        color: COLOR_TEXT_LIGHT,
                        textDecoration: 'none',
                        fontSize: '1.6rem', // Balanced logo size
                        fontWeight: '600', // Bolder but not too heavy
                        fontFamily: 'Inter, sans-serif',
                        letterSpacing: '-0.5px'
                    }}>
                        Sanjeevani
                    </a>
                </div>

                {/* Desktop Links */}
                <div
                    className="desktop-nav"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px', // Increased space between links and button
                    }}
                >
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {navItems.map(item => (
                            <LinkItem key={item.name} name={item.name} href={item.href} />
                        ))}
                    </div>

                    <AnimatedButton onClick={() => navigate('/login')}>
                        Sign In
                    </AnimatedButton>
                </div>

                {/* Mobile Hamburger */}
                <div className="mobile-nav-toggle" style={{ display: 'none' }}>
                    <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        )}
                    </MobileMenuButton>
                </div>

                {/* Mobile Dropdown */}
                {isMenuOpen && (
                    <div style={{
                        width: '100%',
                        marginTop: '10px',
                        padding: '10px 15px',
                        backgroundColor: COLOR_TEXT_LIGHT,
                        border: `1px solid ${COLOR_PRIMARY_PURPLE}20`,
                        borderRadius: '8px',
                        position: 'absolute',
                        top: '60px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        maxWidth: 'calc(100% - 40px)', // Fixed width calculation
                        zIndex: 1000,
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px'}}>
                            {navItems.map(item => (
                                <LinkItem key={item.name} name={item.name} href={item.href} isMobile={true} />
                            ))}
                        </div>
                        
                        <AnimatedButton style={{ width: '100%', marginTop: '5px', padding: '12px 0' }} onClick={() => navigate('/login')}>
                            Sign In
                        </AnimatedButton>
                    </div>
                )}
            </div>

            {/* Media Query for responsiveness */}
            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .mobile-nav-toggle {
                        display: block !important;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;