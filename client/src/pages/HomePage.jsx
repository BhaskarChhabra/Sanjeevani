import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- THEME COLORS ---
const lightTheme = {
    primary: "#7d44e7",
    primaryDark: "#6a3abf",
    secondary: "#4A90E2",
    background: "#f8faff",
    cardBg: "rgba(255, 255, 255, 0.7)",
    textDark: "#2c3e50",
    textSubtle: "#667788",
    accentBorder: "rgba(125, 68, 231, 0.2)",
    accentGlow: "rgba(125, 68, 231, 0.4)",
};

const darkTheme = {
    primary: "#8a5ff0",
    primaryDark: "#7d44e7",
    secondary: "#5aaaff",
    background: "#0a0a1a",
    cardBg: "rgba(16, 16, 32, 0.75)",
    textDark: "#f0f0f5",
    textSubtle: "#a0a0c0",
    accentBorder: "rgba(125, 68, 231, 0.3)",
    accentGlow: "rgba(125, 68, 231, 0.5)",
};

// --- ADVANCED ANIMATION HOOK ---
const useIntersectionObserver = (threshold = 0.1) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            },
            { threshold }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold]);

    return [ref, isVisible];
};

// --- PARTICLE BACKGROUND COMPONENT ---
const ParticleCanvas = ({ theme }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles = [];
        const mouse = { x: null, y: null, radius: 100 };

        window.addEventListener('mousemove', (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
        });
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
                if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
                
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    if (mouse.x < this.x && this.x < canvas.width - this.size * 10) this.x += 5;
                    if (mouse.x > this.x && this.x > this.size * 10) this.x -= 5;
                    if (mouse.y < this.y && this.y < canvas.height - this.size * 10) this.y += 5;
                    if (mouse.y > this.y && this.y > this.size * 10) this.y -= 5;
                }

                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        function init() {
            particles = [];
            const particleColor = theme.mode === 'dark' ? 'rgba(138, 95, 240, 0.5)' : 'rgba(125, 68, 231, 0.5)';
            let numberOfParticles = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 1;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * 0.4) - 0.2;
                let directionY = (Math.random() * 0.4) - 0.2;
                particles.push(new Particle(x, y, directionX, directionY, size, particleColor));
            }
        }

        function animate() {
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }
            animationFrameId = requestAnimationFrame(animate);
        }
        
        init();
        animate();

        return () => {
            window.removeEventListener('mousemove', ()=>{});
            window.removeEventListener('resize', ()=>{});
            cancelAnimationFrame(animationFrameId);
        }
    }, [theme]);

    return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, width: '100%', height: '100%' }} />;
};

// --- MAIN COMPONENT ---
const HomePage = () => {
    const [theme, setTheme] = useState(darkTheme);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [formStatus, setFormStatus] = useState('');
    const [scrollPosition, setScrollPosition] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Observer Refs
    const [videoRef, videoVisible] = useIntersectionObserver(0.2);
    const [aiFeatureRef, aiFeatureVisible] = useIntersectionObserver(0.2);
    const [featuresRef, featuresVisible] = useIntersectionObserver(0.2);
    const [servicesRef, servicesVisible] = useIntersectionObserver(0.2);
    const [aboutRef, aboutVisible] = useIntersectionObserver(0.2);
    const [reviewRef, reviewVisible] = useIntersectionObserver(0.2);
    const [contactRef, contactVisible] = useIntersectionObserver(0.2);

    // Theme Toggle Function
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    useEffect(() => {
        setTheme(isDarkMode ? darkTheme : lightTheme);
    }, [isDarkMode]);

    // Scroll Listener
    useEffect(() => {
        const handleScroll = () => {
            const position = window.pageYOffset;
            setScrollPosition(position);
            setShowScrollTop(position > 300);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setFormStatus('Message sent! The Alchemist\'s Guild will respond soon.');
        e.target.reset();
        setTimeout(() => setFormStatus(''), 5010);
    };
    
    const assistantFeatures = [
        "24/7 health questions answered", "Personalized medication advice",
        "Interaction warnings", "Dosage optimization",
    ];

    // Reusable styles using theme
    const sectionHeadingStyle = {
        fontSize: '3rem', fontWeight: '800', color: theme.textDark,
        marginBottom: '1rem', textAlign: 'center', letterSpacing: '-1px',
        textShadow: `0 0 20px ${theme.accentGlow}`,
    };

    const paragraphStyle = {
        fontSize: '1.1rem', color: theme.textSubtle, lineHeight: '1.7',
        marginBottom: '1.5rem', maxWidth: '650px', margin: '0 auto',
    };

    const inputBaseStyle = {
        width: '100%', padding: '14px 18px', borderRadius: '0.5rem',
        border: `1px solid ${theme.accentBorder}`, backgroundColor: isDarkMode ? 'rgba(0, 0, 10, 0.5)' : '#fff',
        color: theme.textDark, fontSize: '1rem', boxSizing: 'border-box',
        marginBottom: '1rem', outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s',
    };
    
    // Animation Style Generator
    const getAnimatedStyle = (isVisible, delayIndex = 0, direction = 'up') => {
        let transformValue = 'translate3d(0, 50px, 0)';
        if (direction === 'left') transformValue = 'translate3d(-50px, 0, 0)';
        else if (direction === 'right') transformValue = 'translate3d(50px, 0, 0)';

        return {
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translate3d(0, 0, 0)' : transformValue,
            transition: 'opacity 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transitionDelay: `${0.1 + delayIndex * 0.15}s`,
            willChange: 'opacity, transform',
        };
    };

    const heroParallaxStyle = { transform: `translate3d(0, ${scrollPosition * 0.3}px, 0)` };

    // Hover effect for cards
    const handleCardMouseEnter = (e) => {
        e.currentTarget.style.transform = 'translateY(-10px) scale(1.03)';
        e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.2), 0 0 30px ${theme.accentGlow}`;
    };
    const handleCardMouseLeave = (e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
    };

    // Features data for the new section
    const featuresData = [
        {
            icon: "💊",
            title: "Smart Medication Tracking",
            description: "Easily log and track your medications with our intuitive interface. Set up schedules, view history, and get insights into your adherence."
        },
        {
            icon: "🤖",
            title: "AI-Powered Health Chat",
            description: "Ask MediBot anything about your health or prescriptions. Our AI provides accurate, personalized advice to support your wellness journey."
        },
        {
            icon: "⏰",
            title: "Timely Reminders",
            description: "Receive customized reminders via email, WhatsApp, or push notifications to stay on top of your medication schedule."
        },
        {
            icon: "📝",
            title: "Medical Information Summarizer",
            description: "Visualize your medication and appointment schedules in a sleek, interactive calendar to plan your health routine effectively."
        },
        {
            icon: "📊",
            title: "Prescription Analysis",
            description: "Get tailored health tips and analytics based on your medication adherence and health data to optimize your well-being."
        },
        {
            icon: "🔒",
            title: "Secure & Private",
            description: "Your data is protected with state-of-the-art encryption, ensuring your health information remains private and secure."
        }
    ];

    return (
        <div style={{
            background: theme.background, color: theme.textDark,
            transition: 'background 0.5s ease, color 0.5s ease', overflowX: 'hidden'
        }}>
            
            {/* --- THEME TOGGLE BUTTON --- */}
            <button onClick={toggleTheme} style={{
                position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
                background: theme.cardBg, color: theme.textDark,
                border: `1px solid ${theme.accentBorder}`, borderRadius: '50%',
                width: '50px', height: '50px', cursor: 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '1.5rem', backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
                {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* --- SCROLL TO TOP BUTTON --- */}
            {showScrollTop && (
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{
                    position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000,
                    background: theme.primary, color: '#fff',
                    border: 'none', borderRadius: '50%',
                    width: '50px', height: '50px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    fontSize: '1.5rem', boxShadow: `0 8px 30px ${theme.primary}70`,
                    opacity: showScrollTop ? 1 : 0, transition: 'opacity 0.3s'
                }}>
                    ↑
                </button>
            )}

            {/* --- 1. HERO SECTION --- */}
            <section id="top" style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1.5rem' }}>
                <ParticleCanvas theme={theme} />
                <div style={{ ...heroParallaxStyle, zIndex: 2 }}>
                    <h1 style={{ ...sectionHeadingStyle, fontSize: '4.5rem', color: theme.textDark, textShadow: '0 0 30px rgba(255,255,255,0.3)', lineHeight: 1.1 }}>
                        Transform Your Health with
                        <span style={{ 
                            background: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginLeft: '15px'
                        }}>
                            Sanjeevani
                        </span>
                    </h1>
                    <p style={{ ...paragraphStyle, color: theme.textSubtle, fontSize: '1.25rem', marginTop: '1.5rem' }}>
                        Your AI-powered health companion that simplifies medication management, provides personalized insights, and ensures you never miss a dose.
                    </p>
                    <button style={{
                        background: `linear-gradient(45deg, ${theme.primary}, ${theme.primaryDark})`,
                        color: 'white', padding: '1.2rem 2.5rem', fontSize: '1.2rem', fontWeight: 'bold',
                        borderRadius: '50px', border: 'none', cursor: 'pointer', marginTop: '2.5rem',
                        boxShadow: `0 8px 30px ${theme.primary}70`, transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}
                    onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = `0 12px 40px ${theme.primary}90`; }}
                    onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = `0 8px 30px ${theme.primary}70`; }}>
                        Get Started Free
                    </button>
                </div>
            </section>
            
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>

                {/* --- 2. VIDEO SECTION --- */}
                <section ref={videoRef} id="video-section" style={{
                    position: 'relative', height: '80vh', overflow: 'hidden', borderRadius: '30px', margin: '4rem 0',
                    opacity: videoVisible ? 1 : 0, transform: videoVisible ? 'translateY(0)' : 'translateY(50px)',
                    transition: 'opacity 1s, transform 1s'
                }}>
                    <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                        <source src="/videos/bg-video.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'linear-gradient(to top, rgba(10, 10, 26, 0.8), rgba(10, 10, 26, 0.2))',
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                        color: 'white', padding: '4rem', textAlign: 'center'
                    }}>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: '800' }}>
                            Healing in <span style={{ color: theme.primary }}>Motion</span> ✨
                        </h2>
                    </div>
                </section>

                {/* --- 3. FEATURES SECTION (NEW ADDED SECTION) --- */}
                <section ref={featuresRef} id="features" style={{ padding: '6rem 0' }}>
                    <h2 style={{...sectionHeadingStyle, ...getAnimatedStyle(featuresVisible, 0)}}>Powerful Features</h2>
                    <p style={{ ...paragraphStyle, ...getAnimatedStyle(featuresVisible, 1), marginBottom: '4rem', color: theme.textSubtle }}>
                        Discover how Sanjeevani makes managing your health simple and effective with our comprehensive suite of tools.
                    </p>
                    
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                        gap: '2rem',
                        position: 'relative'
                    }}>
                        {featuresData.map((feature, index) => (
                            <div 
                                key={index} 
                                style={{ 
                                    ...getAnimatedStyle(featuresVisible, 2 + index, 'up'), 
                                    background: theme.cardBg, 
                                    padding: '2.5rem', 
                                    borderRadius: '1.5rem', 
                                    border: `1px solid ${theme.accentBorder}`,
                                    boxShadow: `0 10px 30px rgba(0,0,0,0.1)`,
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    backdropFilter: 'blur(10px)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = `0 25px 50px rgba(0,0,0,0.15), 0 0 40px ${theme.accentGlow}`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                                }}
                            >
                                {/* Gradient Border Effect */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                                    transform: 'scaleX(0)',
                                    transition: 'transform 0.4s ease',
                                    transformOrigin: 'left'
                                }} 
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scaleX(1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scaleX(0)';
                                }}
                                />
                                
                                {/* Feature Icon */}
                                <div style={{
                                    fontSize: '3.5rem',
                                    marginBottom: '1.5rem',
                                    textAlign: 'center',
                                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    filter: `drop-shadow(0 5px 15px ${theme.accentGlow})`
                                }}>
                                    {feature.icon}
                                </div>
                                
                                {/* Feature Title */}
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: theme.textDark,
                                    textAlign: 'center',
                                    marginBottom: '1rem',
                                    lineHeight: '1.3'
                                }}>
                                    {feature.title}
                                </h3>
                                
                                {/* Feature Description */}
                                <p style={{
                                    fontSize: '1rem',
                                    color: theme.textSubtle,
                                    lineHeight: '1.6',
                                    textAlign: 'center',
                                    margin: 0
                                }}>
                                    {feature.description}
                                </p>
                                
                                {/* Hover Glow Effect */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: `radial-gradient(circle at center, ${theme.accentGlow}20 0%, transparent 70%)`,
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease',
                                    pointerEvents: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.opacity = '0';
                                }}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- 4. AI ASSISTANT FEATURE BLOCK --- */}
                <section ref={aiFeatureRef} id="ai-assistant-feature" style={{ padding: '6rem 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="responsive-grid">
                        <div style={{ ...getAnimatedStyle(aiFeatureVisible, 0, 'left'), textAlign: 'left' }}>
                            <div style={{ color: theme.primary, fontWeight: '600', marginBottom: '1rem', display: 'inline-block', background: isDarkMode ? 'rgba(125, 68, 231, 0.1)' : 'rgba(125, 68, 231, 0.1)', padding: '0.5rem 1rem', borderRadius: '50px' }}>
                                AI Assistant
                            </div>
                            <h2 style={{ fontSize: '3.5rem', fontWeight: '800', color: theme.textDark, lineHeight: '1.2', marginBottom: '1.5rem' }}>
                                Your Personal <br/> <span style={{ color: theme.primary }}>Health Companion</span>
                            </h2>
                            <p style={{ ...paragraphStyle, margin: '0 0 2rem 0', textAlign: 'left', color: theme.textSubtle }}>
                                Sanjeevani's AI assistant learns your health patterns and provides personalized recommendations.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, marginTop: '2rem' }}>
                                {assistantFeatures.map((feature, index) => (
                                    <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', fontSize: '1.1rem', color: theme.textSubtle, ...getAnimatedStyle(aiFeatureVisible, 2 + index * 0.5, 'left') }}>
                                        <span style={{ color: theme.secondary, marginRight: '15px', fontSize: '1.5rem' }}>✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div style={{ ...getAnimatedStyle(aiFeatureVisible, 1, 'right'), perspective: '1000px' }}>
                            <div style={{
                                background: theme.cardBg, border: `1px solid ${theme.accentBorder}`, borderRadius: '1.5rem',
                                padding: '2rem', boxShadow: `0 20px 50px rgba(0, 0, 0, 0.3), 0 0 20px ${theme.accentGlow}50 inset`,
                                backdropFilter: 'blur(10px)', transform: 'rotateY(-10deg) rotateX(5deg)', transition: 'transform 0.5s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(0) rotateX(0)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(-10deg) rotateX(5deg)'}>
                                <h3 style={{ ...sectionHeadingStyle, fontSize: '1.5rem', color: theme.primary, textAlign: 'center', margin: '0 0 1.5rem 0', textShadow: 'none' }}>Sanjeevani Bot</h3>
                                <div style={{ borderTop: `1px solid ${theme.accentBorder}`, paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <p style={{ color: '#fff', fontSize: '1rem', alignSelf: 'flex-end', background: theme.primary, padding: '0.75rem 1rem', borderRadius: '1rem 1rem 0 1rem' }}>
                                        How can I improve my daily water intake?
                                    </p>
                                    <div style={{ background: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(230,230,255,0.5)', padding: '1rem', borderRadius: '1rem 1rem 1rem 0', borderLeft: `3px solid ${theme.secondary}` }}>
                                        <p style={{ fontSize: '1rem', color: theme.textSubtle, margin: 0 }}>
                                            <strong>Hi Sujay,</strong> since hydration is key, try a smart water bottle or add natural flavors like mint. Stay hydrated!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 5. SERVICES SECTION --- */}
                <section ref={servicesRef} id="services" style={{ padding: '4rem 0' }}>
                    <h2 style={{...sectionHeadingStyle, ...getAnimatedStyle(servicesVisible, 0)}}>The Alchemist's Grimoire</h2>
                    <p style={{ ...paragraphStyle, ...getAnimatedStyle(servicesVisible, 1), marginBottom: '4rem', color: theme.textSubtle }}>Manage your elixirs with precision and never miss a dose. Our grimoire tracks everything you need for a flawless health regimen.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[{title: "Schedules & Logging", desc: "Set and manage precise elixir schedules. Log doses as taken or missed with the touch of a button."},
                          {title: "Circus Crier Notifications", desc: "Receive timely reminders via browser alerts or email. The Crier ensures no dose is forgotten."},
                          {title: "Wellness Rate Dashboard", desc: "Visualize performer health with graphs showing Adherence Rates, missed dose trends, and more."}
                        ].map((service, index) => (
                            <div key={index} style={{ ...getAnimatedStyle(servicesVisible, 2 + index, 'up'), background: theme.cardBg, padding: '2.5rem', borderRadius: '1.5rem', border: `1px solid ${theme.accentBorder}`, boxShadow: '0 10px 20px rgba(0,0,0,0.1)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', backdropFilter: 'blur(10px)' }}
                                onMouseEnter={handleCardMouseEnter} onMouseLeave={handleCardMouseLeave}>
                                <h3 style={{...sectionHeadingStyle, fontSize: '1.75rem', textAlign:'left', textShadow: 'none', color: theme.textDark}}>{service.title}</h3>
                                <p style={{...paragraphStyle, margin: 0, textAlign: 'left', fontSize: '1rem', color: theme.textSubtle}}>{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
                
                {/* --- 6. REVIEW SECTION --- */}
                <section ref={reviewRef} id="review" style={{ padding: '4rem 0', textAlign: 'center' }}>
                    <h2 style={{...sectionHeadingStyle, ...getAnimatedStyle(reviewVisible, 0)}}>Testimonial from the Ringmaster</h2>
                    <p style={{ ...getAnimatedStyle(reviewVisible, 1), ...paragraphStyle, color: theme.secondary, marginBottom: '3rem', fontSize: '1.2rem' }}>"Sanjeevani ensures the show always goes on!"</p>
                    <div style={{ ...getAnimatedStyle(reviewVisible, 2, 'up'), background: theme.cardBg, padding: '3.5rem', borderRadius: '1.5rem', border: `1px solid ${theme.accentBorder}`, margin: '0 auto', maxWidth: '700px', transition: 'transform 0.3s ease, box-shadow 0.3s ease', backdropFilter: 'blur(10px)' }}
                        onMouseEnter={handleCardMouseEnter} onMouseLeave={handleCardMouseLeave}>
                        <p style={{ fontSize: '1.5rem', fontStyle: 'italic', color: theme.textDark, marginBottom: '2rem', lineHeight: '1.6' }}>
                            "Before Sanjeevani, managing complex elixir schedules was chaos. Now, the Mystic Fortune Teller keeps every performer healthy and on track. It's truly magical."
                        </p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '700', color: theme.primary }}>The Ringmaster, Grand Sanjeevani Circus</p>
                    </div>
                </section>
                
                {/* --- 7. CONTACT SECTION --- */}
                <section ref={contactRef} id="contact" style={{ padding: '6rem 0' }}>
                    <h2 style={{...sectionHeadingStyle, ...getAnimatedStyle(contactVisible, 0)}}>Contact the Alchemist's Guild</h2>
                    <p style={{...paragraphStyle, ...getAnimatedStyle(contactVisible, 1), marginBottom: '4rem', color: theme.textSubtle}}>Have any questions? Send us a query!</p>
                    <div style={{ ...getAnimatedStyle(contactVisible, 2, 'up'), background: theme.cardBg, backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '3rem', border: `1px solid ${theme.accentBorder}` }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }} className="responsive-grid">
                            <div>
                                <h3 style={{ fontSize: '1.75rem', color: theme.textDark, marginBottom: '2rem' }}>Send Us A Message</h3>
                                {formStatus && <p style={{ color: theme.secondary, marginBottom: '1rem', textAlign: 'center' }}>{formStatus}</p>}
                                <form onSubmit={handleContactSubmit}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-grid">
                                        <input type="text" placeholder="Your Name" style={inputBaseStyle} required onFocus={(e) => e.target.style.borderColor = theme.primary} onBlur={(e) => e.target.style.borderColor = theme.accentBorder} />
                                        <input type="email" placeholder="Your Email" style={inputBaseStyle} required onFocus={(e) => e.target.style.borderColor = theme.primary} onBlur={(e) => e.target.style.borderColor = theme.accentBorder} />
                                    </div>
                                    <input type="text" placeholder="Subject" style={{...inputBaseStyle, width: '100%'}} required onFocus={(e) => e.target.style.borderColor = theme.primary} onBlur={(e) => e.target.style.borderColor = theme.accentBorder} />
                                    <textarea placeholder="Leave A Message Here" rows="5" style={{ ...inputBaseStyle, resize: 'none', width: '100%' }} required onFocus={(e) => e.target.style.borderColor = theme.primary} onBlur={(e) => e.target.style.borderColor = theme.accentBorder}></textarea>
                                    <button
                                        type="submit"
                                        style={{
                                            width: '100%', background: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`,
                                            color: 'white', padding: '1rem 0', borderRadius: '0.5rem', fontWeight: '700',
                                            border: 'none', cursor: 'pointer', boxShadow: `0 0 20px ${theme.primary}70`, transition: 'all 0.3s',
                                        }}
                                        onMouseEnter={(e) => e.target.style.boxShadow = `0 0 30px ${theme.primary}90`}
                                        onMouseLeave={(e) => e.target.style.boxShadow = `0 0 20px ${theme.primary}70`}
                                    > Send Message </button>
                                </form>
                            </div>
                            <div style={{ borderRadius: '1rem', overflow: 'hidden', minHeight: '400px', border: `1px solid ${theme.accentBorder}` }}>
                                <iframe
                                    width="100%" height="100%" frameBorder="0" style={{ border: 0, filter: isDarkMode ? 'invert(90%) hue-rotate(180deg)' : 'none' }}
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112038.5344390979!2d77.1228906954316!3d28.64433898550918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b08c90855%3A0xc3f345c23e80f68e!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1628172800000!5m2!1sen!2sin&q=New+Delhi"
                                    allowFullScreen="" aria-hidden="false" tabIndex="0" title="New Delhi Location Map">
                                </iframe>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            
            {/* --- GLOBAL STYLES --- */}
            <style>{`
                body {
                    font-family: 'Inter', sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                .responsive-grid {
                    grid-template-columns: 1fr 1fr;
                }
                .form-grid {
                    grid-template-columns: 1fr 1fr;
                }
                @media (max-width: 1024px) {
                    .responsive-grid {
                        grid-template-columns: 1fr !important;
                        gap: 4rem !important;
                        text-align: center !important;
                    }
                    .responsive-grid > div {
                        text-align: center !important;
                    }
                    p {
                        margin-left: auto !important;
                        margin-right: auto !important;
                    }
                }
                @media (max-width: 768px) {
                    html { font-size: 90%; }
                    h1 { font-size: 3rem !important; }
                    .form-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default HomePage;