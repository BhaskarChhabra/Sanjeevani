import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api'; // Your API function

// --- THEME COLORS from LoginPage ---
const COLOR_SOFT_WHITE_BG = "#E9E9E9";
const COLOR_CARD_DARK = "#171221";
const COLOR_HEADER_TEXT = "#F0F0F0";
const COLOR_SUBTLE_TEXT = "#A5A5C2";
const COLOR_INPUT_BG = "#1A162B";
const COLOR_ACCENT_LINK = "#9333ea"; // Used for 'Forgot password?' and links
const COLOR_CTA_GRADIENT = "linear-gradient(90deg, #6c5ce7 0%, #4A90E2 100%)";
const COLOR_CTA_HOVER = "linear-gradient(90deg, #4A90E2 0%, #6c5ce7 100%)";

// --- Custom Input (Copied from LoginPage) ---
const CustomInput = ({ label, name, type, value, onChange, placeholder, required, showForgot, showEye }) => {
    // Determine the input type for showEye logic
    const isPasswordField = type === 'password';
    // State to toggle password visibility
    const [inputType, setInputType] = useState(type);
    
    const togglePasswordVisibility = () => {
        setInputType(inputType === 'password' ? 'text' : 'password');
    };

    return (
        <div style={{ marginBottom: '1.25rem', textAlign: 'left', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label htmlFor={name} style={{ color: COLOR_SUBTLE_TEXT, fontSize: '0.875rem', fontWeight: '600' }}>{label}</label>
                {showForgot && <a href="#" style={{ color: COLOR_ACCENT_LINK, fontSize: '0.875rem', textDecoration: 'none' }}>Forgot password?</a>}
            </div>
            <div style={{ position: 'relative' }}>
                <input
                    id={name}
                    name={name}
                    type={inputType} // Use inputType for toggling
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
                {isPasswordField && showEye && ( // Only show eye for password fields
                    <span 
                        onClick={togglePasswordVisibility}
                        style={{ 
                            position: 'absolute', 
                            right: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            color: COLOR_SUBTLE_TEXT, 
                            cursor: 'pointer',
                            userSelect: 'none', // Prevent text selection
                        }}
                    >
                        {inputType === 'password' ? '👁️' : '🔒'}
                    </span>
                )}
            </div>
        </div>
    );
};


// --- Custom Button (Copied from LoginPage) ---
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
            // Initial background is the CTA gradient
            background: COLOR_CTA_GRADIENT,
        }}
        onMouseEnter={(e) => { if (!disabled) e.target.style.background = COLOR_CTA_HOVER; }}
        onMouseLeave={(e) => { if (!disabled) e.target.style.background = COLOR_CTA_GRADIENT; }}
    >
        {children}
    </button>
);


const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
        verificationMethod: 'email',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await registerUser(formData);
            const emailToVerify = response.data.data.email || formData.email;

            // Navigate to verify page with email
            navigate(`/verify?email=${emailToVerify}`);

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
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
            backgroundImage: 'url(/login/loginbg.png)', // Use the same background image
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
                maxWidth: "24rem", // Keep the same max width
                zIndex: 101,
                minHeight: '600px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                {/* Header - Same style as LoginPage */}
                <h2 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.25rem", textAlign: "center", color: COLOR_HEADER_TEXT }}>Join Us Today</h2>
                <p style={{ textAlign: "center", color: COLOR_SUBTLE_TEXT, marginBottom: "2.5rem", fontSize: "0.875rem" }}>Create your account to start your journey</p>

                <form onSubmit={handleSubmit} style={{ width: '100%', display: "flex", flexDirection: "column", gap: '0.5rem' }}>
                    
                    <CustomInput 
                        label="Username" 
                        name="username" 
                        type="text" 
                        value={formData.username} 
                        onChange={handleChange} 
                        placeholder="Choose a username" 
                        required 
                    />
                    <CustomInput 
                        label="Email Address" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="you@example.com" 
                        required 
                    />
                    <CustomInput 
                        label="Password" 
                        name="password" 
                        type="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        placeholder="Set a strong password" 
                        required 
                        showEye 
                    />
                    <CustomInput 
                        label="Phone Number (Optional)" 
                        name="phone" 
                        type="tel" // Use 'tel' for phone input
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="Enter your phone number" 
                    />

                    {/* Verification Method Select Field - Styled to match inputs */}
                    <div style={{ marginBottom: '1.25rem', textAlign: 'left', position: 'relative' }}>
                        <label 
                            htmlFor="verificationMethod" 
                            style={{ color: COLOR_SUBTLE_TEXT, fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}
                        >
                            Verification Method
                        </label>
                        <select
                            id="verificationMethod"
                            name="verificationMethod"
                            value={formData.verificationMethod}
                            onChange={handleChange}
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
                                // Custom styling for select arrow
                                appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%23A5A5C2' d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0.75rem center',
                                backgroundSize: '1.5em 1.5em',
                            }}
                        >
                            <option value="email" style={{ backgroundColor: COLOR_INPUT_BG, color: COLOR_HEADER_TEXT }}>Email</option>
                            <option value="phone" style={{ backgroundColor: COLOR_INPUT_BG, color: COLOR_HEADER_TEXT }}>Phone Call</option>
                        </select>
                    </div>


                    {/* Error Message - Same style as LoginPage */}
                    {error && <div style={{ padding: "0.75rem", backgroundColor: "rgba(255, 127, 80, 0.15)", border: "1px solid rgba(255, 127, 80, 0.4)", borderRadius: "0.5rem", color: "#ffa07a", fontSize: "0.875rem", textAlign: "center", marginBottom: '1rem' }}>{error}</div>}

                    {/* Submit Button - Same as LoginPage */}
                    <CustomButton type="submit" disabled={isLoading} fullWidth style={{ marginTop: '0.5rem' }}>
                        {isLoading ? 'Registering...' : 'Sign Up'}
                    </CustomButton>

                </form>

                {/* Login Link - Same style as LoginPage link */}
                <p
                    style={{
                        marginTop: '2rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color: COLOR_SUBTLE_TEXT // Use subtle text for the main text
                    }}
                >
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        style={{
                            color: COLOR_ACCENT_LINK, // Use accent link color
                            textDecoration: "none",
                            fontWeight: "700",
                            transition: "color 0.2s",
                        }}
                    >
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;