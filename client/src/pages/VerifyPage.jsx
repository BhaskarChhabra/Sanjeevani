import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyUser, resendOtp } from '../api';

// --- Theme Colors ---
const COLOR_SOFT_WHITE_BG = "#E9E9E9";
const COLOR_CARD_DARK = "#171221";
const COLOR_HEADER_TEXT = "#F0F0F0";
const COLOR_SUBTLE_TEXT = "#A5A5C2";
const COLOR_INPUT_BG = "#1A162B";
const COLOR_ACCENT_LINK = "#9333ea";
const COLOR_CTA_GRADIENT = "linear-gradient(90deg, #6c5ce7 0%, #4A90E2 100%)";
const COLOR_CTA_HOVER = "linear-gradient(90deg, #4A90E2 0%, #6c5ce7 100%)";

// --- Custom Input ---
const CustomInput = ({ label, name, type, value, onChange, placeholder, required }) => (
    <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
        <label htmlFor={name} style={{ color: COLOR_SUBTLE_TEXT, fontSize: '0.875rem', fontWeight: '600' }}>{label}</label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            maxLength={6}
            style={{
                width: '100%',
                padding: '12px',
                borderRadius: '0.5rem',
                border: '1px solid transparent',
                backgroundColor: COLOR_INPUT_BG,
                color: COLOR_HEADER_TEXT,
                fontSize: '1rem',
                textAlign: 'center',
                letterSpacing: '0.5rem',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            onFocus={(e) => { e.target.style.borderColor = COLOR_ACCENT_LINK; e.target.style.boxShadow = `0 0 5px ${COLOR_ACCENT_LINK}30`; }}
            onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
        />
    </div>
);

// --- Custom Button ---
const CustomButton = ({ children, type, disabled, fullWidth, onClick }) => (
    <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        style={{
            width: fullWidth ? '100%' : 'auto',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: '700',
            color: 'white',
            fontFamily: 'inherit',
            boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
            background: COLOR_CTA_GRADIENT,
            transition: 'opacity 0.2s, background 0.3s',
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
    const [successMessage, setSuccessMessage] = useState(null);
    const [isResending, setIsResending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email');

    // --- Resend OTP ---
    const handleResend = async (initialLoad = false) => {
        if (!email) return setError("Email not found. Please go back to login.");

        setError(null);
        setIsResending(true);
        setSuccessMessage(initialLoad ? 'Sending a new OTP...' : 'Resending OTP...');

        try {
            await resendOtp({ email });
            setSuccessMessage('OTP sent! Check your inbox/spam folder.');
        } catch (err) {
            console.error("Resend OTP failed:", err);
            setError('Failed to send OTP. Please try again.');
            setSuccessMessage(null);
        } finally {
            setIsResending(false);
        }
    };

    useEffect(() => { handleResend(true); }, [email]);

    // --- Verify OTP ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return setError("Email not found. Please start over.");

        setError(null);
        setIsVerifying(true);

        try {
            await verifyUser({ email, code });
            navigate('/login?verified=true');
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired code.");
        } finally {
            setIsVerifying(false);
        }
    };

    // --- Status Message Component ---
    const StatusMessage = ({ message, type }) => (
        <div style={{
            padding: "0.75rem",
            backgroundColor: type === 'success' ? "rgba(52,211,153,0.15)" : "rgba(255,127,80,0.15)",
            border: type === 'success' ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(255,127,80,0.4)",
            borderRadius: "0.5rem",
            color: type === 'success' ? "#68d391" : "#ffa07a",
            fontSize: "0.875rem",
            textAlign: "center",
            marginBottom: '1rem'
        }}>{message}</div>
    );

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundImage: 'url(/login/loginbg.png)',
            backgroundSize: '120%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: COLOR_SOFT_WHITE_BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            overflowY: 'auto'
        }}>
            <div style={{
                background: COLOR_CARD_DARK,
                padding: "1.5rem 2rem",
                borderRadius: "2rem",
                boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
                width: "100%",
                maxWidth: "24rem",
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: COLOR_HEADER_TEXT, marginBottom: '0.25rem', textAlign: 'center' }}>Confirm Your Identity</h2>
                <p style={{ textAlign: 'center', color: COLOR_SUBTLE_TEXT, marginBottom: '2.5rem', fontSize: '0.875rem' }}>
                    A verification code was sent to <span style={{color: COLOR_ACCENT_LINK}}>{email || "your email"}</span>. Enter it below.
                </p>

                <form onSubmit={handleSubmit} style={{ width: '100%', display: "flex", flexDirection: "column", gap: '0.5rem' }}>
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

                    <CustomButton type="submit" disabled={isVerifying || isResending} fullWidth>
                        {isVerifying ? "Verifying..." : "Verify Account"}
                    </CustomButton>
                </form>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: COLOR_SUBTLE_TEXT }}>
                    Didn't receive the code?{' '}
                    <button
                        onClick={() => handleResend(false)}
                        disabled={isResending || isVerifying}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            color: COLOR_ACCENT_LINK,
                            cursor: (isResending || isVerifying) ? 'not-allowed' : 'pointer',
                            fontWeight: '700',
                            textDecoration: 'none',
                            opacity: (isResending || isVerifying) ? 0.6 : 1,
                            fontFamily: 'inherit'
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
