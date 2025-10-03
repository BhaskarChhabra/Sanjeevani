"use client"

const Input = ({ label, name, type = "text", value, onChange, placeholder, required = false, ...rest }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "#e2e8f0",
            letterSpacing: "0.01em",
          }}
        >
          {label}
          {required && <span style={{ color: "#f87171", marginLeft: "0.25rem" }}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%",
          padding: "0.75rem 1rem",
          backgroundColor: "rgba(15, 23, 42, 0.5)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          borderRadius: "0.5rem",
          color: "#f8fafc",
          fontSize: "0.9375rem",
          outline: "none",
          transition: "all 0.2s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#818cf8"
          e.target.style.boxShadow = "0 0 0 3px rgba(129, 140, 248, 0.1)"
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(148, 163, 184, 0.2)"
          e.target.style.boxShadow = "none"
        }}
        {...rest}
      />
    </div>
  )
}

export default Input
