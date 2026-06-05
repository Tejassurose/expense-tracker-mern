import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate          = useNavigate();
  const { login, error }  = useAuth();

  const [form,     setForm]     = useState({ email: "", password: "" });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.email.trim())                    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = "Enter a valid email";
    if (!form.password)                         e.password = "Password is required";
    else if (form.password.length < 6)          e.password = "Min 6 characters";
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
    const success = await login(form.email, form.password);
    if (success) {
      navigate("/dashboard");
    } else {
      setApiError(error || "Invalid email or password");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">₹</div>
          <span className="auth-logo-text">Kharcha</span>
        </div>
        <h1 className="auth-title">Welcome back 👋</h1>
        <p className="auth-subtitle">Login to track your expenses</p>

        {apiError && <div className="auth-error">{apiError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              className={`input ${errors.email ? "input-error" : ""}`}
              type="email" name="email"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              className={`input ${errors.password ? "input-error" : ""}`}
              type="password" name="password"
              placeholder="••••••••"
              value={form.password} onChange={handleChange}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? <span className="spinner" /> : "Login"}
          </button>
        </form>

        <p className="auth-divider">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Register here</span>
        </p>
      </div>
    </div>
  );
}