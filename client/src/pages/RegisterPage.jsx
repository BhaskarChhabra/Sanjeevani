    import React, { useState } from 'react';
    import { useNavigate, Link } from 'react-router-dom';
    import { registerUser, resendOtp } from '../api/index'; // ensure ../api is present and correct

    // --- THEME COLORS ---
    const COLOR_SOFT_WHITE_BG = "#E9E9E9";
    const COLOR_CARD_DARK = "#171221";
    const COLOR_HEADER_TEXT = "#F0F0F0";
    const COLOR_SUBTLE_TEXT = "#A5A5C2";
    const COLOR_INPUT_BG = "#1A162B";
    const COLOR_ACCENT_LINK = "#9333ea";
    const COLOR_CTA_GRADIENT = "linear-gradient(90deg, #6c5ce7 0%, #4A90E2 100%)";
    const COLOR_CTA_HOVER = "linear-gradient(90deg, #4A90E2 0%, #6c5ce7 100%)";

    // --- Sanjeevani Branding Component (CSS FIXED) ---
    const SanjeevaniBranding = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem',
        marginTop: '1rem', // Slightly increased top margin for visual space
      }}>
        <img
          src="https://i.postimg.cc/8kBV8ktT/5f98ba83-e045-4eec-a3f2-611838a2fb1d.jpg"
          alt="Sanjeevani Logo"
          style={{
            width: '60px', // FIX: Logo size increased
            height: '60px', // FIX: Logo size increased
            borderRadius: '50%',
            marginRight: '1rem',
            border: `3px solid ${COLOR_ACCENT_LINK}`, // Slightly thicker border
            objectFit: 'cover'
          }}
        />
        <span style={{
          fontSize: "2.5rem", // FIX: Text size increased
          fontWeight: "800",
          backgroundImage: `linear-gradient(90deg, ${COLOR_ACCENT_LINK} 0%, #4A90E2 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: COLOR_HEADER_TEXT,
        }}>
          Sanjeevani
        </span>
        </div>
    );

    // --- Custom Input ---
    const CustomInput = ({ label, name, type, value, onChange, placeholder, required, showEye }) => {
      const isPasswordField = type === 'password';
      const [inputType, setInputType] = useState(type);

      const togglePasswordVisibility = () => {
        setInputType(inputType === 'password' ? 'text' : 'password');
      };

      return (
        <div style={{ marginBottom: '1.25rem', textAlign: 'left', position: 'relative' }}>
          <label htmlFor={name} style={{ color: COLOR_SUBTLE_TEXT, fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>
            {label}
          </label>
          <input
            id={name}
            name={name}
            type={inputType}
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
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = COLOR_ACCENT_LINK; e.target.style.boxShadow = `0 0 5px ${COLOR_ACCENT_LINK}30`; }}
            onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
          />
          {isPasswordField && showEye && (
            <span
              onClick={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(15px)',
                color: COLOR_SUBTLE_TEXT,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              {inputType === 'password' ? '👁️' : '🔒'}
            </span>
          )}
        </div>
      );
    };

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
      const [otpSent, setOtpSent] = useState(false);
      const [resendLoading, setResendLoading] = useState(false);

      const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // client-side validation (backend expects phone too)
        if (!formData.username || !formData.email || !formData.password || !formData.phone || !formData.verificationMethod) {
          setError('Please fill all required fields (username, email, password, phone, verification method).');
          setIsLoading(false);
          return;
        }

        try {
          const response = await registerUser(formData);
          // If your backend returns email under data.data.email (as your stub showed)
          const emailToVerify = response?.data?.data?.email || formData.email;
          // Move to verify page
          navigate(`/verify?email=${encodeURIComponent(emailToVerify)}`);
        } catch (err) {
          const message = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
          setError(message);
        } finally {
          setIsLoading(false);
        }
      };

      // --- Resend OTP handler ---
      const handleResendOtp = async () => {
        if (!formData.email) {
          setError('Please enter the email to resend OTP.');
          return;
        }

        setResendLoading(true);
        setError('');
        try {
          const res = await resendOtp({ email: formData.email });
          // Optionally check res.status or res.data
          setOtpSent(true);
        } catch (err) {
          const message = err?.response?.data?.message || err?.message || 'Failed to resend OTP.';
          setError(message);
        } finally {
          setResendLoading(false);
        }
      };

      return (
        <div style={{
          position: "relative",
          minHeight: "100vh", 
          width: "100vw",
          backgroundImage: 'url(/login/loginbg.png)',
          // FIX: Changed backgroundSize from 'cover' back to 'contain' to prevent extreme zooming, 
          //      as indicated by your screenshot where the phones are fully visible.
          backgroundSize: 'contain', 
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: COLOR_SOFT_WHITE_BG,
          display: "flex",
          alignItems: "flex-start", 
          justifyContent: "center",
          padding: "2rem", 
          zIndex: 100,
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flexShrink: 0 
          }}>
            <SanjeevaniBranding />

            <h2 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.25rem", textAlign: "center", color: COLOR_HEADER_TEXT }}>
              Join Us Today
            </h2>
            <p style={{ textAlign: "center", color: COLOR_SUBTLE_TEXT, marginBottom: "2.5rem", fontSize: "0.875rem" }}>
              Create your account to start your journey
            </p>

            <form onSubmit={handleSubmit} style={{ width: '100%', display: "flex", flexDirection: "column", gap: '0.5rem' }}>
              <CustomInput label="Username" name="username" type="text" value={formData.username} onChange={handleChange} placeholder="Choose a username" required />
              <CustomInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
              <CustomInput label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Set a strong password" required showEye />
              {/* Phone is required to satisfy backend */}
              <CustomInput label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" required />

              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="verificationMethod" style={{ color: COLOR_SUBTLE_TEXT, fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>
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
                    outline: 'none',
                    fontFamily: 'inherit',
                    appearance: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = COLOR_ACCENT_LINK; e.target.style.boxShadow = `0 0 5px ${COLOR_ACCENT_LINK}30`; }}
                  onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>

              {error && <div style={{ padding: "0.75rem", backgroundColor: "rgba(255, 127, 80, 0.15)", border: "1px solid rgba(255, 127, 80, 0.4)", borderRadius: "0.5rem", color: "#ffa07a", fontSize: "0.875rem", textAlign: "center", marginBottom: '1rem' }}>{error}</div>}

              <CustomButton type="submit" disabled={isLoading} fullWidth style={{ marginTop: '0.5rem' }}>
                {isLoading ? 'Registering...' : 'Sign Up'}
              </CustomButton>

              {otpSent && <div style={{ marginTop: '0.75rem', color: "#68d391", textAlign: 'center', fontSize: '0.875rem' }}>OTP sent successfully!</div>}

              {!otpSent && formData.email && (
                <button
                  type="button"
                  disabled={resendLoading}
                  onClick={handleResendOtp}
                  style={{
                    marginTop: '0.75rem',
                    background: 'transparent',
                    color: COLOR_ACCENT_LINK,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  {resendLoading ? 'Resending...' : 'Resend OTP'}
                </button>
              )}
            </form>

            <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: COLOR_SUBTLE_TEXT }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: COLOR_ACCENT_LINK, textDecoration: "none", fontWeight: "700" }}>Log In</Link>
            </p>
          </div>
        </div>
      );
    };

    export default RegisterPage;