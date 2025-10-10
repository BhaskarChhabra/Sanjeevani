import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../api/apiClient"; // your axios instance

// --- THEME & COMPONENTS ---
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
  <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
    <label htmlFor={name} style={{ color: COLOR_SUBTLE_TEXT, fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      style={{ width: '100%', padding: '12px', borderRadius: '0.5rem', border: '1px solid transparent', backgroundColor: COLOR_INPUT_BG, color: COLOR_HEADER_TEXT, fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
    />
  </div>
);

const CustomButton = ({ children, type, disabled, fullWidth, onClick }) => (
  <button type={type} disabled={disabled} onClick={onClick} style={{
    width: fullWidth ? '100%' : 'auto',
    padding: '0.8rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: '700',
    color: 'white',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: COLOR_CTA_GRADIENT
  }}>
    {children}
  </button>
);
// --- END OF THEME ---

const VerifyResetOtp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setLoading(true);

  console.log("Email:", email);
  console.log("OTP entered: ", otp); // 🔥 Check OTP value here

  try {
    const response = await apiClient.post("/users/verify-reset-otp", { email, code: otp });
    console.log("OTP verification response:", response.data); // 🔥 Check server response
    navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
  } catch (err) {
    console.error("OTP verification error: ", err.response?.data);
    setError(err.response?.data?.message || "Invalid or expired OTP.");
  } finally {
    setLoading(false);
  }
};



  const handleResendOtp = async () => {
    setResendLoading(true);
    setError("");
    setSuccess("");
    try {
      // Resend password reset OTP
      await apiClient.post("/users/forgot-password", { email });
      setSuccess("A new password reset code has been sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend password reset code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundImage: 'url(/login/loginbg.png)', backgroundSize: '120%', backgroundPosition: 'center', backgroundColor: COLOR_SOFT_WHITE_BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", overflowY: 'auto' }}>
      <div style={{ background: COLOR_CARD_DARK, padding: "1.5rem 2rem", borderRadius: "2rem", width: "100%", maxWidth: "24rem", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SanjeevaniBranding />
        <h2 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.25rem", textAlign: "center", color: COLOR_HEADER_TEXT }}>Check Your Email</h2>
        <p style={{ textAlign: "center", color: COLOR_SUBTLE_TEXT, marginBottom: "2.5rem", fontSize: "0.875rem" }}>We sent a verification code to {email}</p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <CustomInput label="Verification Code" name="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit code" required />

          {error && <div style={{ padding: "0.75rem", backgroundColor: "rgba(255,127,80,0.15)", borderRadius: "0.5rem", color: "#ffa07a", marginBottom: '1rem', textAlign: "center" }}>{error}</div>}
          {success && <div style={{ padding: "0.75rem", backgroundColor: "rgba(104,211,145,0.15)", borderRadius: "0.5rem", color: "#68d391", marginBottom: '1rem', textAlign: "center" }}>{success}</div>}

          <CustomButton type="submit" fullWidth disabled={loading}>{loading ? "Verifying..." : "Verify Code"}</CustomButton>
        </form>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: COLOR_SUBTLE_TEXT }}>
          Didn't receive the code?{" "}
          <button onClick={handleResendOtp} disabled={resendLoading} style={{ background: 'none', border: 'none', color: COLOR_ACCENT_LINK, fontWeight: '700', cursor: 'pointer', padding: 0 }}>
            {resendLoading ? 'Sending...' : 'Click to resend'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyResetOtp;
