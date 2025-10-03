import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import navigate

const COLOR_PRIMARY_PURPLE = "#7d44e7"; 
const COLOR_HOVER_PURPLE = "#6335c0"; 
const COLOR_TEXT_DARK = "#2c3e50"; 
const COLOR_TEXT_LIGHT = "#ffffff";
const COLOR_BUTTON_BG = "#e0eaff";

// Custom Button Component
const CustomButton = ({ children, style, onMouseEnter, onMouseLeave, onClick }) => (
    <button
        onClick={onClick}
        style={{
            backgroundColor: COLOR_BUTTON_BG,
            color: COLOR_TEXT_DARK,
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            ...style
        }}
        onMouseEnter={onMouseEnter || ((e) => e.currentTarget.style.backgroundColor = '#d5e0ff')}
        onMouseLeave={onMouseLeave || ((e) => e.currentTarget.style.backgroundColor = COLOR_BUTTON_BG)}
    >
        {children}
    </button>
);

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate(); // ✅ create navigate function

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
                    color: isMobile ? COLOR_TEXT_DARK : COLOR_TEXT_LIGHT,
                    fontWeight: '500',
                    textDecoration: 'none',
                    padding: isMobile ? '10px 15px' : '8px 15px',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s, color 0.2s',
                    backgroundColor: isHovered ? (isMobile ? '#f0f0f0' : COLOR_HOVER_PURPLE) : 'transparent',
                    display: 'block',
                    width: isMobile ? '100%' : 'auto'
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
                minWidth: '40px'
            }}
        >
            {children}
        </button>
    );

    return (
        <nav style={{
            backgroundColor: COLOR_PRIMARY_PURPLE,
            padding: '10px 20px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
            zIndex: 10
        }}>
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
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: COLOR_BUTTON_BG, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginRight: '8px'
                    }}>
                        <span style={{ fontSize: '18px' }}>🌱</span>
                    </div>
                    <a href="/" style={{ 
                        color: COLOR_TEXT_LIGHT, 
                        textDecoration: 'none', 
                        fontSize: '1.5rem', 
                        fontWeight: '700' 
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
                        gap: '20px',
                    }}
                >
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {navItems.map(item => (
                            <LinkItem key={item.name} name={item.name} href={item.href} />
                        ))}
                    </div>
                    
                    {/* ✅ Desktop Sign In with route */}
                    <CustomButton style={{ padding: '10px 20px' }} onClick={() => navigate('/login')}>
                        Sign In
                    </CustomButton>
                </div>

                {/* Mobile Hamburger */}
                <div className="mobile-nav-toggle" style={{ display: 'none' }}>
                    <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        )}
                    </MobileMenuButton>
                </div>

                {/* Mobile Dropdown */}
                {isMenuOpen && (
                    <div style={{
                        width: '100%',
                        marginTop: '10px',
                        padding: '10px 0',
                        backgroundColor: COLOR_TEXT_LIGHT,
                        border: `1px solid ${COLOR_PRIMARY_PURPLE}20`,
                        borderRadius: '8px',
                        position: 'absolute',
                        top: '60px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        maxWidth: '90%',
                        zIndex: 1000,
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }}>
                        {navItems.map(item => (
                            <LinkItem key={item.name} name={item.name} href={item.href} isMobile={true} />
                        ))}
                        <div style={{ padding: '10px 15px', paddingTop: '0' }}>
                            {/* ✅ Mobile Sign In with route */}
                            <CustomButton style={{ width: '100%', marginTop: '10px' }} onClick={() => navigate('/login')}>
                                Sign In
                            </CustomButton>
                        </div>
                    </div>
                )}
            </div>

            {/* Responsive CSS */}
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
