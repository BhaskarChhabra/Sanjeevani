import React, { useState, useEffect, useCallback } from 'react';
// Note: Link is unused in this single-file context, but kept for future router integration
// import { Link } from 'react-router-dom';

// --- NEW LIGHT THEME COLORS (MediBot-Inspired) ---
const COLOR_PRIMARY_PURPLE = "#7d44e7"; // Main CTA/Header Color
const COLOR_SECONDARY_BLUE = "#4A90E2"; // Secondary Accent (highlights/success)
// UPDATED: Light background color
const COLOR_MAIN_BG = "#f8faff"; // Very light blue/purple background
const COLOR_CARD_BG = "#ffffff"; // White Card Background
const COLOR_TEXT_DARK = "#2c3e50"; // Very Dark Gray/Blue for main text
const COLOR_TEXT_SUBTLE = "#667788"; // Softer Gray for paragraph text
const COLOR_ACCENT_BORDER = "rgba(125, 68, 231, 0.2)"; // Subtle transparent purple border

// --- IMAGE CAROUSEL DATA ---
// NOTE: Using placeholder URLs for the images since the original paths are inaccessible
const SLIDES = [
    { src: './background/slide-1.png', alt: 'Practitioner giving personalized advice', zoom: 0.95 },
    { src: './background/slide-2.png', alt: 'Nature and healing herbs motif', zoom: 0.95 },
    { src: './background/slide-3.png', alt: 'AI interface showing data flow', zoom: 0.95 },
];
const AUTOPLAY_INTERVAL = 5000; // 5 seconds

// Reusable style for Section Headings
const sectionHeadingStyle = {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: COLOR_TEXT_DARK, // Headings should be dark on light background
    marginBottom: '1rem',
    textAlign: 'center',
    textShadow: `0 0 5px rgba(0, 0, 0, 0.05)`,
};

// Reusable style for Sub Headings
const subHeadingStyle = {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: COLOR_TEXT_DARK, // Subheadings should be dark
    marginBottom: '0.75rem',
};

// Reusable style for Paragraphs
const paragraphStyle = {
    fontSize: '1rem',
    color: COLOR_TEXT_SUBTLE, // Paragraph text is subtle gray
    lineHeight: '1.6',
    marginBottom: '1.5rem',
};

// Reusable Input/Form Styles
const inputBaseStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '0.5rem',
    border: `1px solid ${COLOR_ACCENT_BORDER}`,
    backgroundColor: '#ffffff', // White input background
    color: COLOR_TEXT_DARK, // Dark input text
    fontSize: '1rem',
    boxSizing: 'border-box',
    marginBottom: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
};


const HomePage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [formStatus, setFormStatus] = useState('');

    // --- Carousel Logic ---
    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, []);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    };

    // Auto-rotation effect
    useEffect(() => {
        const interval = setInterval(nextSlide, AUTOPLAY_INTERVAL);
        return () => clearInterval(interval);
    }, [nextSlide]);
    // ----------------------

    const handleContactSubmit = (e) => {
        e.preventDefault();
        // Updated response to match the 'Sanjeevani' brand name
        setFormStatus('Message sent! The Alchemist\'s Guild will respond soon.');
        e.target.reset();
        setTimeout(() => setFormStatus(''), 5000);
    };

    // Feature list for the AI Assistant section
    const assistantFeatures = [
        "24/7 health questions answered",
        "Personalized medication advice",
        "Interaction warnings",
        "Dosage optimization",
    ];

    return (
        <div
            style={{
                minHeight: '100vh',
                background: COLOR_MAIN_BG, // Now light background
                paddingBottom: '4rem',
                color: COLOR_TEXT_DARK // Main text is dark
            }}
        >
            {/* --- 1. ALCHEMIST'S WELCOME (HERO SECTION: CAROUSEL BACKGROUND) --- */}
            <section id="top" className="hero-carousel-container">
                <div className="carousel-background">
                    {SLIDES.map((slide, index) => (
                        <img
                            key={index}
                            src={slide.src}
                            alt={slide.alt}
                            className={`carousel-image ${index === currentSlide ? 'active' : ''}`}
                            style={{ transform: `scale(${slide.zoom})`, transformOrigin: "center" }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src="https://placehold.co/1280x720/f8faff/7d44e7?text=Image+Missing";
                                console.error(`Failed to load image: ${slide.src}`)
                            }}
                        />
                    ))}
                </div>

                <header className="carousel-content-wrapper" style={{ height: '100%', padding: '0 1.5rem' }}>
                    <div className="carousel-content" style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '6rem', paddingBottom: '4rem', textAlign: 'center' }}>
                        <h1 style={{ ...sectionHeadingStyle, fontSize: '4rem', color: COLOR_TEXT_DARK, textShadow: 'none', lineHeight: 1.2 }}>
                            Transform Your Health with
                            <span style={{ color: COLOR_PRIMARY_PURPLE, marginLeft: '10px' }}>
                                Sanjeevani
                            </span>
                        </h1>
                        <p style={{ ...paragraphStyle, color: COLOR_TEXT_DARK, opacity: 0.8 }}>
                            Your AI-powered health companion that simplifies medication management, provides personalized insights, and ensures you never miss a dose.
                        </p>
                        <button style={{
                            background: COLOR_PRIMARY_PURPLE,
                            color: 'white',
                            padding: '1rem 2rem',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderRadius: '0.75rem',
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '1.5rem',
                            boxShadow: `0 4px 15px ${COLOR_PRIMARY_PURPLE}50`,
                            transition: 'background-color 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#6a3abf'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = COLOR_PRIMARY_PURPLE}
                        >
                            Get Started Free
                        </button>
                    </div>
                </header>

                {/* FIX: Added content (arrows) to the button tags */}
                <button onClick={prevSlide} className="carousel-nav-btn left-0">
                    &lt;
                </button>
                <button onClick={nextSlide} className="carousel-nav-btn right-0">
                    &gt;
                </button>
            </section>

            {/* --- 2. VIDEO SECTION --- */}
            <section id="video-section" style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                >
                    {/* Placeholder for video src */}
                    <source src="/videos/bg-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.3)', // Lighter overlay for light BG/video
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    textAlign: 'center'
                }}>
                    Healing in Motion <span style={{ color: COLOR_PRIMARY_PURPLE, marginLeft: '10px' }}>✨</span>
                </div>
            </section>

            {/* --- NEW SECTION: 2.5 AI ASSISTANT FEATURE BLOCK (MOVED HERE) --- */}
            {/* FIX: Added the 1280px wrapper to center this section's content */}
            <section id="ai-assistant-feature" style={{ padding: '4rem 0' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div
                        className="ai-feature-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '4rem',
                            alignItems: 'center',
                        }}
                    >
                        {/* Left Column: Text and Features */}
                        <div className="ai-feature-text" style={{ textAlign: 'left' }}>
                            <div style={{ color: COLOR_PRIMARY_PURPLE, fontWeight: '600', marginBottom: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-block', background: 'rgba(125, 68, 231, 0.1)' }}>
                                AI Assistant
                            </div>
                            <h2 style={{ fontSize: '3rem', fontWeight: '800', color: COLOR_TEXT_DARK, lineHeight: '1.2', marginBottom: '1rem' }}>
                                Your Personal <span style={{ color: COLOR_PRIMARY_PURPLE }}>Health Companion</span>
                            </h2>
                            <p style={{ ...paragraphStyle, color: COLOR_TEXT_DARK, opacity: 0.8, fontSize: '1.1rem' }}>
                                Sanjeevani's AI assistant learns your health patterns and provides personalized recommendations to optimize your medication routine.
                            </p>

                            <ul style={{ listStyle: 'none', padding: 0, marginTop: '2rem' }}>
                                {assistantFeatures.map((feature, index) => (
                                    <li key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '1rem',
                                        fontSize: '1rem',
                                        color: COLOR_TEXT_DARK
                                    }}>
                                        <span style={{ color: COLOR_SECONDARY_BLUE, marginRight: '10px', fontSize: '1.5rem' }}>✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button style={{
                                background: COLOR_PRIMARY_PURPLE,
                                color: 'white',
                                padding: '1rem 2rem',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                borderRadius: '0.75rem',
                                border: 'none',
                                cursor: 'pointer',
                                marginTop: '2rem',
                                boxShadow: `0 4px 15px ${COLOR_PRIMARY_PURPLE}50`,
                                transition: 'background-color 0.3s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#6a3abf'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = COLOR_PRIMARY_PURPLE}
                            >
                                Try AI Assistant
                            </button>
                        </div>

                        {/* Right Column: Chatbot Mockup */}
                        <div className="ai-feature-visual" style={{ paddingTop: '2rem', paddingBottom: '2rem', minHeight: '500px' }}>
                            <div style={{
                                background: COLOR_CARD_BG,
                                border: `1px solid ${COLOR_ACCENT_BORDER}`,
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                                maxWidth: '500px',
                                margin: '0 auto',
                                position: 'relative'
                            }}>
                                <h3 style={{ ...subHeadingStyle, color: COLOR_PRIMARY_PURPLE, textAlign: 'center', margin: '0 0 1rem 0' }}>Sanjeevani Bot</h3>
                                <div style={{ borderTop: `1px solid ${COLOR_ACCENT_BORDER}`, paddingTop: '1rem' }}>
                                    <p style={{ color: COLOR_TEXT_DARK, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        **User:** How can I improve my daily water intake?
                                    </p>
                                    <div style={{ background: '#f0f0f5', padding: '1rem', borderRadius: '0.5rem', borderLeft: `3px solid ${COLOR_SECONDARY_BLUE}` }}>
                                        <p style={{ fontSize: '0.85rem', color: COLOR_TEXT_SUBTLE, margin: 0 }}>
                                            *Hi Sujay,* Since you've been focusing on managing your medications, remember that **hydration is especially important.** Here are a few quick tips: Use a water tracking app, set hourly reminders, and add slices of lemon or cucumber to your water for flavor!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 3. CONTENT WRAPPER START --- */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                {/* SERVICES, ABOUT, REVIEW, CONTACT SECTIONS */}

                {/* --- 3.1 SERVICES (Now Section 3) --- */}
                <section id="services" style={{ padding: '4rem 0' }}>
                    <h2 style={sectionHeadingStyle}>The Alchemist's Grimoire: Essential Brew Tracking</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
                        <div style={{ background: COLOR_CARD_BG, padding: '2rem', borderRadius: '1rem', border: `1px solid ${COLOR_ACCENT_BORDER}` }}>
                            <h3 style={subHeadingStyle}>Medicine Schedules & Logging</h3>
                            <p style={paragraphStyle}>Set and manage precise elixir schedules (name, dosage, time, frequency). Log doses as taken or missed with the touch of a button.</p>
                        </div>
                        <div style={{ background: COLOR_CARD_BG, padding: '2rem', borderRadius: '1rem', border: `1px solid ${COLOR_ACCENT_BORDER}` }}>
                            <h3 style={subHeadingStyle}>Circus Crier Notifications</h3>
                            <p style={paragraphStyle}>Receive timely reminders via browser alerts or email. Never risk a complex dosage schedule—the Crier ensures no dose is forgotten.</p>
                        </div>
                        <div style={{ background: COLOR_CARD_BG, padding: '2rem', borderRadius: '1rem', border: `1px solid ${COLOR_ACCENT_BORDER}` }}>
                            <h3 style={subHeadingStyle}>Wellness Rate Dashboard</h3>
                            <p style={paragraphStyle}>Visualize performer health with graphs showing **Adherence Rates**, missed dose trends, and a clear view of upcoming and past remedies.</p>
                        </div>
                    </div>
                </section>

                {/* --- 3.2 ABOUT (Mystic Fortune Teller - Now Section 4) --- */}
                <section id="about" style={{ padding: '4rem 0' }}>
                    <h2 style={sectionHeadingStyle}>The Mystic Fortune Teller: AI-Powered Foresight</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start', marginTop: '3rem' }} className="about-grid">
                        <div className="about-col-left" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ background: COLOR_CARD_BG, padding: '1.5rem', borderRadius: '0.75rem', borderLeft: `4px solid ${COLOR_SECONDARY_BLUE}` }}> {/* Updated border color */}
                                <h3 style={subHeadingStyle}>Adherence Prediction</h3>
                                <p style={paragraphStyle}>The Mystic detects patterns like *'User often misses night doses'* and sends **proactive nudges**: *"You usually forget your pill after dinner—should I remind you again in 15 minutes?"*</p>
                            </div>
                            <div style={{ background: COLOR_CARD_BG, padding: '1.5rem', borderRadius: '0.75rem', borderLeft: `4px solid ${COLOR_SECONDARY_BLUE}` }}> {/* Updated border color */}
                                <h3 style={subHeadingStyle}>Al Chatbot Health Assistant</h3>
                                <p style={paragraphStyle}>Ask natural language questions: *"What pills do I need to take today?"* or *"Did I miss any dose yesterday?"* The Al provides instant answers from the Grimoire.</p>
                            </div>
                        </div>
                        <div className="about-col-right" style={{
                            background: COLOR_CARD_BG,
                            padding: '2.5rem',
                            borderRadius: '1rem',
                            border: `2px solid ${COLOR_SECONDARY_BLUE}`, // Updated border color
                            boxShadow: `0 0 30px ${COLOR_SECONDARY_BLUE}10` // Lightened shadow for light theme
                        }}>
                            <h3 style={{
                                ...subHeadingStyle,
                                fontSize: '2rem',
                                color: COLOR_SECONDARY_BLUE, // Updated text color
                                textAlign: 'center'
                            }}>Showstopper Feature: Great Sky Calendar Integration</h3>
                            <p style={paragraphStyle}>Sync medication schedules directly with the **Great Sky Calendar (Google Calendar)** for all performers and managers to see. The Mystic can **auto-update calendar events** if a dose is missed or rescheduled, ensuring flawless coordination across the entire circus.</p>
                        </div>
                    </div>
                </section>

                {/* --- 3.3 REVIEW (Testimonial - Now Section 5) --- */}
                <section id="review" style={{ padding: '4rem 0', textAlign: 'center' }}>
                    <h2 style={sectionHeadingStyle}>Testimonial from the Ringmaster</h2>
                    <p style={{ ...paragraphStyle, color: COLOR_SECONDARY_BLUE, marginBottom: '2rem' }}>"Sanjeevani ensures the show always goes on!"</p> {/* Updated text color */}
                    <div style={{ background: COLOR_CARD_BG, padding: '3rem', borderRadius: '1rem', border: `1px solid ${COLOR_ACCENT_BORDER}`, margin: '0 auto', maxWidth: '600px' }}>
                        <p style={{ fontSize: '1.25rem', fontStyle: 'italic', color: COLOR_TEXT_DARK, marginBottom: '1.5rem' }}>
                            "Before Sanjeevani, managing complex elixir schedules was chaos. Now, the Mystic Fortune Teller keeps every performer healthy and on track. It's truly magical."
                        </p>
                        <p style={{ fontSize: '1rem', fontWeight: '600', color: COLOR_PRIMARY_PURPLE }}>The Ringmaster, Grand Sanjeevani Circus</p> {/* Updated text color */}
                    </div>
                </section>

                {/* --- 3.4 CONTACT (Now Section 6) --- */}
                <section id="contact" style={{ padding: '4rem 0' }}>
                    <h2 style={sectionHeadingStyle}>Contact the Alchemist's Guild</h2>
                    <p style={{...paragraphStyle, textAlign: 'center'}}>Have any questions for the Mystic or the Circus Crier? Send us a query!</p>
                    <div style={{ background: COLOR_CARD_BG, borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                            {[{ icon: '📍', title: 'Address', detail: 'Sanjeevani Point, New Delhi, India' }, { icon: '📞', title: 'Call Us Now', detail: '+91 9876543210' }, { icon: '✉️', title: 'Mail Us Now', detail: 'alchemist@sanjeevani.com' }].map((card) => (
                                <div key={card.title} style={{
                                    background: '#f0f0f5', // Light background for detail cards
                                    padding: '1.5rem',
                                    borderRadius: '0.75rem',
                                    border: `1px solid ${COLOR_ACCENT_BORDER}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.icon}</div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: COLOR_PRIMARY_PURPLE, marginBottom: '0.25rem' }}>{card.title}</h3>
                                    <p style={{ fontSize: '0.9rem', color: COLOR_TEXT_SUBTLE }}>{card.detail}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="contact-grid">
                            <div className="contact-col-left" style={{ textAlign: 'left', background: '#f0f0f5', padding: '2rem', borderRadius: '0.75rem', border: `1px solid ${COLOR_ACCENT_BORDER}` }}>
                                <h3 style={{ fontSize: '1.25rem', color: COLOR_TEXT_DARK, marginBottom: '1rem' }}>Contact Us</h3>
                                <p style={{ ...paragraphStyle, fontSize: '0.9rem', marginBottom: '1.5rem' }}>I have any Query! Please Contact Us:</p>
                                {formStatus && <p style={{ color: COLOR_SECONDARY_BLUE, marginBottom: '1rem', textAlign: 'center' }}>{formStatus}</p>}
                                <form onSubmit={handleContactSubmit}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input type="text" placeholder="Your Name" style={inputBaseStyle} required />
                                        <input type="email" placeholder="Your Email" style={inputBaseStyle} required />
                                        <input type="tel" placeholder="Your Phone Number" style={inputBaseStyle} />
                                        <input type="text" placeholder="Your City" style={inputBaseStyle} />
                                    </div>
                                    <input type="text" placeholder="Subject" style={inputBaseStyle} required />
                                    <textarea placeholder="Leave A Message Here" rows="4" style={{ ...inputBaseStyle, resize: 'none' }} required></textarea>
                                    <button
                                        type="submit"
                                        style={{
                                            width: '100%',
                                            // Primary Purple CTA
                                            background: COLOR_PRIMARY_PURPLE,
                                            color: 'white',
                                            padding: '0.75rem 0',
                                            borderRadius: '0.5rem',
                                            fontWeight: '700',
                                            border: 'none',
                                            cursor: 'pointer',
                                            boxShadow: `0 0 10px ${COLOR_PRIMARY_PURPLE}40`,
                                            transition: 'all 0.3s',
                                        }}
                                        // Added hover effect
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#6a3abf'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = COLOR_PRIMARY_PURPLE}
                                    >
                                        Send Message
                                    </button>
                                </form>
                            </div>
                            <div className="contact-col-right" style={{ background: '#f0f0f5', borderRadius: '0.75rem', overflow: 'hidden', height: '100%', minHeight: '400px' }}>
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    style={{ border: 0 }}
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.996229988185!2d77.2166687150824!3d28.61869898242031!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b08c90855%3A0xc3f345c23e80f68e!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1628172800000!5m2!1sen!2sin"
                                    allowFullScreen=""
                                    aria-hidden="false"
                                    tabIndex="0"
                                    title="New Delhi Location Map"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            {/* --- 3. CONTENT WRAPPER END --- */}

            {/* --- CAROUSEL STYLES (Inline CSS) --- */}
            <style>{`
                .hero-carousel-container { position: relative; height: 80vh; min-height: 700px; overflow: hidden; width: 100vw; left: 50%; transform: translateX(-50%); margin-bottom: 3rem; }
                .carousel-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    /* Subtle background gradient to match the MediBot image look */
                    background: linear-gradient(to bottom, #e0eaff 0%, #f8faff 50%, #f8faff 100%);
                }
                .carousel-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 1s ease-in-out; }
                .carousel-image.active { opacity: 1; }
                .carousel-content-wrapper { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; display: flex; align-items: center; justify-content: center;
                    /* Remove dark overlay for light theme contrast */
                    background: transparent;
                }
                .carousel-content { text-align: center; color: ${COLOR_TEXT_DARK}; }
                .carousel-nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(125, 68, 231, 0.1); /* Very subtle purple button */
                    border: 1px solid rgba(125, 68, 231, 0.4);
                    color: ${COLOR_PRIMARY_PURPLE};
                    font-size: 2rem;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    z-index: 20;
                    border-radius: 0.5rem;
                    transition: background 0.3s;
                }
                .carousel-nav-btn:hover { background: rgba(125, 68, 231, 0.2); }
                .carousel-nav-btn.left-0 { left: 1rem; }
                .carousel-nav-btn.right-0 { right: 1rem; }
                @media (max-width: 768px) {
                    .hero-carousel-container { height: 60vh; min-height: 500px; }
                    .carousel-nav-btn { font-size: 1.5rem; padding: 0.3rem 0.6rem; }
                    .carousel-content-wrapper h1 { font-size: 3rem !important; }
                    .carousel-content-wrapper p { font-size: 0.9rem !important; }
                    .about-grid, .contact-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
                }
                /* NEW MEDIA QUERY FOR AI FEATURE BLOCK - MOVED TO BE WITH THE AI BLOCK */
                @media (max-width: 1024px) {
                    .ai-feature-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
                    .ai-feature-text { text-align: center !important; }
                    .ai-feature-text ul { padding-left: 0; display: inline-block; text-align: left; }
                }
            `}</style>
        </div>
    );
};

export default HomePage;