import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginUser } from '../api'; // Your API function
import useAuthStore from '../store/useAuthStore';

// --- THEME COLORS ---
const COLOR_SOFT_WHITE_BG = "#E9E9E9";
const COLOR_CARD_DARK = "#171221";
const COLOR_HEADER_TEXT = "#F0F0F0";
const COLOR_SUBTLE_TEXT = "#A5A5C2";
const COLOR_INPUT_BG = "#1A162B";
const COLOR_ACCENT_LINK = "#9333ea";
const COLOR_CTA_GRADIENT = "linear-gradient(90deg, #6c5ce7 0%, #4A90E2 100%)";
const COLOR_CTA_HOVER = "linear-gradient(90deg, #4A90E2 0%, #6c5ce7 100%)";

// --- Custom Input ---
const CustomInput = ({ label, name, type, value, onChange, placeholder, required, showForgot, showEye }) => (
    <div style={{ marginBottom: '1.25rem', textAlign: 'left', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label htmlFor={name} style={{ color: COLOR_SUBTLE_TEXT, fontSize: '0.875rem', fontWeight: '600' }}>{label}</label>
            {showForgot && <a href="#" style={{ color: COLOR_ACCENT_LINK, fontSize: '0.875rem', textDecoration: 'none' }}>Forgot password?</a>}
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
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = COLOR_ACCENT_LINK;
                    e.target.style.boxShadow = `0 0 5px ${COLOR_ACCENT_LINK}30`;
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'transparent';
                    e.target.style.boxShadow = 'none';
                }}
            />
            {showEye && <span style={{ position: 'absolute', right: '12px', top: '12px', color: COLOR_SUBTLE_TEXT, cursor: 'pointer' }}>👁️</span>}
        </div>
    </div>
);

// --- Custom Button ---
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
        }}
        onMouseEnter={(e) => { if (!disabled) e.target.style.background = COLOR_CTA_HOVER; }}
        onMouseLeave={(e) => { if (!disabled) e.target.style.background = COLOR_CTA_GRADIENT; }}
    >
        {children}
    </button>
);

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore((state) => state);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setSuccessMessage('Account verified successfully! You can now log in.');
        }
    }, [searchParams]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setIsLoading(true);

        try {
            const response = await loginUser(formData);
            login(response.data.data.user); // update store
            navigate('/dashboard'); // redirect
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

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
            <div style={{
                background: COLOR_CARD_DARK,
                padding: "1.5rem 2rem",
                borderRadius: "2rem",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8)",
                width: "100%",
                maxWidth: "24rem",
                zIndex: 101,
                minHeight: '600px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <h2 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.25rem", textAlign: "center", color: COLOR_HEADER_TEXT }}>Welcome Back</h2>
                <p style={{ textAlign: "center", color: COLOR_SUBTLE_TEXT, marginBottom: "2.5rem", fontSize: "0.875rem" }}>Sign in to access your dashboard</p>

                <form onSubmit={handleSubmit} style={{ width: '100%', display: "flex", flexDirection: "column", gap: '0.5rem' }}>
                    {successMessage && <div style={{ padding: "0.75rem", backgroundColor: "rgba(52, 211, 153, 0.15)", border: "1px solid rgba(52, 211, 153, 0.4)", borderRadius: "0.5rem", color: "#68d391", fontSize: "0.875rem", textAlign: "center", marginBottom: '1rem' }}>{successMessage}</div>}

                    <CustomInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
                    <CustomInput label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required showForgot showEye />

                    {error && <div style={{ padding: "0.75rem", backgroundColor: "rgba(255, 127, 80, 0.15)", border: "1px solid rgba(255, 127, 80, 0.4)", borderRadius: "0.5rem", color: "#ffa07a", fontSize: "0.875rem", textAlign: "center", marginBottom: '1rem' }}>{error}</div>}

                    <CustomButton type="submit" disabled={isLoading} fullWidth style={{ background: COLOR_CTA_GRADIENT, marginTop: '0.5rem' }}>
                        {isLoading ? "Logging In..." : "Sign In"}
                    </CustomButton>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
