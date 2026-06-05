import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate            = useNavigate();
  const { register, error } = useAuth();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const [success,  setSuccess]  = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                e.name = "Name is required";
    else if (form.name.trim().length < 2)  e.name = "Min 2 characters";
    if (!form.email.trim())                      e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))   e.email = "Enter a valid email";
    if (!form.password)                  e.password = "Password is required";
    else if (form.password.length < 6)   e.password = "Min 6 characters";
    if (!form.confirmPassword)
      e.confirmPassword = "Please confirm password";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const ok = await register(form.name, form.email, form.password);
    if (ok) {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setApiError(error || "Registration failed");
    }
    setLoading(false);
  };

  const getStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6)  return { label: "Weak",   color: "#f87171", width: "30%" };
    if (p.length < 10) return { label: "Fair",   color: "#fbbf24", width: "60%" };
    return               { label: "Strong", color: "#4ade80", width: "100%" };
  };
  const strength = getStrength();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">₹</div>
          <span className="auth-logo-text">Kharcha</span>
        </div>
        <h1 className="auth-title">Create account 🚀</h1>
        <p className="auth-subtitle">Start tracking your money today</p>

        {/* Success Message */}
        {success && (
          <div style={{
            background: "rgba(74,222,128,0.1)",
            border: "1px solid rgba(74,222,128,0.3)",
            borderRadius: "10px", padding: "10px 14px",
            fontSize: 13, color: "#4ade80",
            textAlign: "center", marginBottom: 8
          }}>
            ✓ Account created! Redirecting to login...
          </div>
        )}

        {apiError && <div className="auth-error">{apiError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input className={`input ${errors.name ? "input-error" : ""}`}
              type="text" name="name" placeholder="Rahul Sharma"
              value={form.name} onChange={handleChange} />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input className={`input ${errors.email ? "input-error" : ""}`}
              type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input className={`input ${errors.password ? "input-error" : ""}`}
              type="password" name="password" placeholder="Min 6 characters"
              value={form.password} onChange={handleChange} />
            {strength && (
              <div style={{ marginTop: 5 }}>
                <div style={{ height: 4, background: "#1e2d45", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: strength.width, background: strength.color, borderRadius: 99, transition: "all 0.3s" }} />
                </div>
                <span style={{ fontSize: 11, color: strength.color, marginTop: 2, display: "block" }}>
                  {strength.label} password
                </span>
              </div>
            )}
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <input className={`input ${errors.confirmPassword ? "input-error" : ""}`}
              type="password" name="confirmPassword" placeholder="Re-enter password"
              value={form.confirmPassword} onChange={handleChange} />
            {form.confirmPassword && !errors.confirmPassword && form.password === form.confirmPassword && (
              <span style={{ fontSize: 11, color: "#4ade80", marginTop: 2, display: "block" }}>
                ✓ Passwords match
              </span>
            )}
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full"
            disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <span className="spinner" /> : "Create Account"}
          </button>
        </form>

        <p className="auth-divider">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login here</span>
        </p>
      </div>
    </div>
  );
}