import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyUser, resendOtp } from '../api'; // Ensure resendOtp and verifyUser are imported

// --- THEME COLORS from LoginPage ---
const COLOR_SOFT_WHITE_BG = "#E9E9E9";
const COLOR_CARD_DARK = "#171221";
const COLOR_HEADER_TEXT = "#F0F0F0";
const COLOR_SUBTLE_TEXT = "#A5A5C2";
const COLOR_INPUT_BG = "#1A162B";
const COLOR_ACCENT_LINK = "#9333ea";
const COLOR_CTA_GRADIENT = "linear-gradient(90deg, #6c5ce7 0%, #4A90E2 100%)";
const COLOR_CTA_HOVER = "linear-gradient(90deg, #4A90E2 0%, #6c5ce7 100%)";

// --- Custom Input (Themed Component) ---
const CustomInput = ({ label, name, type, value, onChange, placeholder, required }) => (
    <div style={{ marginBottom: '1.25rem', textAlign: 'left', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label htmlFor={name} style={{ color: COLOR_SUBTLE_TEXT, fontSize: '0.875rem', fontWeight: '600' }}>{label}</label>
        </div>
        <div style={{ position: 'relative' }}>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '0.5rem',
                    border: '1px solid transparent',
                    backgroundColor: COLOR_INPUT_BG,
                    color: COLOR_HEADER_TEXT,
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    fontFamily: 'inherit',
                    textAlign: 'center', // Center text for OTP
                    letterSpacing: '0.5rem', // Space out digits for readability
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = COLOR_ACCENT_LINK;
                    e.target.style.boxShadow = `0 0 5px ${COLOR_ACCENT_LINK}30`;
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'transparent';
                    e.target.style.boxShadow = 'none';
                }}
                maxLength={6} // Assuming a 6-digit OTP
            />
        </div>
    </div>
);

// --- Custom Button (Themed Component) ---
const CustomButton = ({ children, type, disabled, fullWidth, style, onClick }) => (
    <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        style={{
            ...style,
            width: fullWidth ? '100%' : 'auto',
            transition: 'opacity 0.2s, background 0.3s',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: '700',
            color: 'white',
            fontFamily: 'inherit',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
            background: COLOR_CTA_GRADIENT, // Set initial background
        }}
        onMouseEnter={(e) => { if (!disabled) e.target.style.background = COLOR_CTA_HOVER; }}
        onMouseLeave={(e) => { if (!disabled) e.target.style.background = COLOR_CTA_GRADIENT; }}
    >
        {children}
    </button>
);


const VerifyPage = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null); // Changed to null to avoid initial false success
    const [isResending, setIsResending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const email = searchParams.get('email');

    // Function to handle OTP resend logic
    const handleResend = async (initialLoad = false) => {
        if (!email) {
            setError("Email not provided. Please return to the login page.");
            setSuccessMessage(null);
            return;
        }

        setError(null);
        setIsResending(true);
        setSuccessMessage(initialLoad ? 'Sending a new OTP to your email...' : 'Resending OTP...');

        try {
            await resendOtp({ email: email });
            setSuccessMessage('A fresh OTP has been sent to your email! Please check your inbox/spam folder.');
        } catch (err) {
            console.error("Resend OTP failed:", err);
            setSuccessMessage(null);
            setError('Failed to send OTP. Please ensure your email is correct.');
        } finally {
            setIsResending(false);
        }
    };

    // Auto-resend OTP on page load
    useEffect(() => {
        handleResend(true);
    }, [email]); // Dependency on email in case the URL changes

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsVerifying(true);

        if (!email) {
            setError("Email not found. Please start the registration process again.");
            setIsVerifying(false);
            return;
        }

        try {
            await verifyUser({ email, code });
            navigate('/login?verified=true'); // Redirect on success

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Invalid or expired code. Please try again.';
            setError(errorMessage);
        } finally {
            setIsVerifying(false);
        }
    };

    const StatusMessage = ({ message, type }) => (
        <div style={{
            padding: "0.75rem",
            backgroundColor: type === 'success' ? "rgba(52, 211, 153, 0.15)" : "rgba(255, 127, 80, 0.15)",
            border: type === 'success' ? "1px solid rgba(52, 211, 153, 0.4)" : "1px solid rgba(255, 127, 80, 0.4)",
            borderRadius: "0.5rem",
            color: type === 'success' ? "#68d391" : "#ffa07a",
            fontSize: "0.875rem",
            textAlign: "center",
            marginBottom: '1rem'
        }}>
            {message}
        </div>
    );

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundImage: 'url(/login/loginbg.png)',
            backgroundSize: '120%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: COLOR_SOFT_WHITE_BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            zIndex: 100,
            boxSizing: 'border-box',
            overflowY: 'auto'
        }}>
            {/* Inner Card Container - Same as LoginPage */}
            <div style={{
                background: COLOR_CARD_DARK,
                padding: "1.5rem 2rem",
                borderRadius: "2rem",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8)",
                width: "100%",
                maxWidth: "24rem",
                zIndex: 101,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                {/* Header */}
                <h2 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.25rem", textAlign: "center", color: COLOR_HEADER_TEXT }}>Confirm Your Identity</h2>
                <p style={{ textAlign: "center", color: COLOR_SUBTLE_TEXT, marginBottom: "2.5rem", fontSize: "0.875rem" }}>
                    A verification code was sent to **<span style={{color: COLOR_ACCENT_LINK}}>{email || "your account"}</span>**. Enter it below.
                </p>

                <form onSubmit={handleSubmit} style={{ width: '100%', display: "flex", flexDirection: "column", gap: '0.5rem' }}>
                    
                    {/* Status Messages */}
                    {successMessage && <StatusMessage message={successMessage} type="success" />}
                    {error && <StatusMessage message={error} type="error" />}

                    <CustomInput
                        label="6-Digit Code"
                        name="code"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="••••••"
                        required
                    />

                    {/* Verify Button */}
                    <CustomButton type="submit" disabled={isVerifying || isResending} fullWidth style={{ marginTop: '0.5rem' }}>
                        {isVerifying ? "Verifying..." : "Verify Account"}
                    </CustomButton>
                </form>

                {/* Resend OTP Link/Button */}
                <p 
                    style={{ 
                        marginTop: '1.5rem', 
                        textAlign: 'center', 
                        fontSize: '0.875rem', 
                        color: COLOR_SUBTLE_TEXT 
                    }}
                >
                    Didn't receive the code?{' '}
                    <button 
                        onClick={handleResend}
                        disabled={isResending || isVerifying}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            color: COLOR_ACCENT_LINK,
                            cursor: (isResending || isVerifying) ? 'not-allowed' : 'pointer',
                            textDecoration: "none",
                            fontWeight: "700",
                            transition: "color 0.2s, opacity 0.2s",
                            opacity: (isResending || isVerifying) ? 0.6 : 1,
                            fontFamily: 'inherit',
                        }}
                    >
                        {isResending ? 'Sending...' : 'Resend Code'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default VerifyPage;