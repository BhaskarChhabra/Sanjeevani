"use client"

const Button = ({ children, fullWidth = false, ...rest }) => {
  const buttonStyle = {
    width: fullWidth ? "100%" : "auto",
    padding: "0.75rem 1.5rem",
    backgroundColor: rest.disabled ? "#4338ca" : "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    cursor: rest.disabled ? "not-allowed" : "pointer",
    opacity: rest.disabled ? 0.6 : 1,
    transition: "all 0.2s",
    fontSize: "0.9375rem",
    fontWeight: "600",
    letterSpacing: "0.01em",
    boxShadow: rest.disabled ? "none" : "0 4px 6px -1px rgba(99, 102, 241, 0.3)",
  }

  const handleMouseEnter = (e) => {
    if (!rest.disabled) {
      e.target.style.backgroundColor = "#4f46e5"
      e.target.style.transform = "translateY(-1px)"
      e.target.style.boxShadow = "0 6px 8px -1px rgba(99, 102, 241, 0.4)"
    }
  }

  const handleMouseLeave = (e) => {
    if (!rest.disabled) {
      e.target.style.backgroundColor = "#6366f1"
      e.target.style.transform = "translateY(0)"
      e.target.style.boxShadow = "0 4px 6px -1px rgba(99, 102, 241, 0.3)"
    }
  }

  return (
    <button style={buttonStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...rest}>
      {children}
    </button>
  )
}

export default Button
