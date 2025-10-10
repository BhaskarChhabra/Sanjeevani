import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPasswordRequest } from "../api"; // ✅ Correct endpoint

// --- THEME & COMPONENTS (Self-Contained) ---
const COLOR_SOFT_WHITE_BG = "#E9E9E9";
const COLOR_CARD_DARK = "#171221";
const COLOR_HEADER_TEXT = "#F0F0F0";
const COLOR_SUBTLE_TEXT = "#A5A5C2";
const COLOR_INPUT_BG = "#1A162B";
const COLOR_ACCENT_LINK = "#9333ea";
const COLOR_CTA_GRADIENT = "linear-gradient(90deg, #6c5ce7 0%, #4A90E2 100%)";
const COLOR_CTA_HOVER = "linear-gradient(90deg, #4A90E2 0%, #6c5ce7 100%)";

const SanjeevaniBranding = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', marginTop: '0.5rem' }}>
        <img src="/login/sanjeevani-logo.png" alt="Sanjeevani Logo" style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '1rem', border: `2px solid ${COLOR_ACCENT_LINK}` }} />
        <span style={{ fontSize: "2.25rem", fontWeight: "800", backgroundImage: `linear-gradient(90deg, ${COLOR_ACCENT_LINK} 0%, #4A90E2 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: COLOR_HEADER_TEXT }}>
            Sanjeevani
        </span>
    </div>
);

const CustomInput = ({ label, name, type, value, onChange, placeholder, required }) => (
    <div style={{ marginBottom: '1.25rem', textAlign: 'left', position: 'relative' }}>
        <label htmlFor={name} style={{ color: COLOR_SUBTLE_TEXT, fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>{label}</label>
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
                fontFamily: 'inherit',
                transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            onFocus={(e) => { e.target.style.borderColor = COLOR_ACCENT_LINK; e.target.style.boxShadow = `0 0 5px ${COLOR_ACCENT_LINK}30`; }}
            onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
        />
    </div>
);

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
            background: COLOR_CTA_GRADIENT
        }}
        onMouseEnter={(e) => { if (!disabled) e.target.style.background = COLOR_CTA_HOVER; }}
        onMouseLeave={(e) => { if (!disabled) e.target.style.background = COLOR_CTA_GRADIENT; }}
    >
        {children}
    </button>
);
// --- END OF THEME & COMPONENTS ---


const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        setOtpSent(false);

        try {
            // ✅ Use forgotPasswordRequest for verified users only
            await forgotPasswordRequest({ email });
            setOtpSent(true);
            setTimeout(() => {
                navigate(`/verify-reset-otp?email=${encodeURIComponent(email)}`);
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send reset code. Make sure your account is verified.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundImage: 'url(/login/loginbg.png)', backgroundSize: '120%', backgroundPosition: 'center', backgroundColor: COLOR_SOFT_WHITE_BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", overflowY: 'auto' }}>
            <div style={{ background: COLOR_CARD_DARK, padding: "1.5rem 2rem", borderRadius: "2rem", border: "1px solid rgba(255, 255, 255, 0.05)", boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8)", width: "100%", maxWidth: "24rem", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                <SanjeevaniBranding />

                <h2 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.25rem", textAlign: "center", color: COLOR_HEADER_TEXT }}>
                    Forgot Password
                </h2>
                <p style={{ textAlign: "center", color: COLOR_SUBTLE_TEXT, marginBottom: "2.5rem", fontSize: "0.875rem" }}>
                    Enter your email to receive a reset code
                </p>

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <CustomInput
                        label="Email Address"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />

                    {error && <div style={{ padding: "0.75rem", backgroundColor: "rgba(255, 127, 80, 0.15)", border: "1px solid rgba(255, 127, 80, 0.4)", borderRadius: "0.5rem", color: "#ffa07a", fontSize: "0.875rem", textAlign: "center", marginBottom: '1rem' }}>{error}</div>}

                    {otpSent && <div style={{ padding: "0.75rem", backgroundColor: "rgba(104, 211, 145, 0.15)", border: "1px solid rgba(104, 211, 145, 0.4)", borderRadius: "0.5rem", color: "#68d391", fontSize: "0.875rem", textAlign: "center", marginBottom: '1rem' }}>
                        Reset code sent successfully! Redirecting...
                    </div>}

                    <CustomButton type="submit" fullWidth disabled={loading} style={{ marginTop: '0.5rem' }}>
                        {loading ? "Sending..." : "Send Reset Code"}
                    </CustomButton>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: COLOR_SUBTLE_TEXT }}>
                    Remember your password?{" "}
                    <Link to="/login" style={{ color: COLOR_ACCENT_LINK, textDecoration: "none", fontWeight: "700" }}>Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
