import { createContext, useContext, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("et_user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // ── REGISTER ────────────────────────────────────────
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await API.post("/auth/register", { name, email, password });

      // Save token and user
      localStorage.setItem("et_token", data.token);
      localStorage.setItem("et_user",  JSON.stringify({ id: data._id, name: data.name, email: data.email }));
      setUser({ id: data._id, name: data.name, email: data.email });
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── LOGIN ────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await API.post("/auth/login", { email, password });

      // Save token and user
      localStorage.setItem("et_token", data.token);
      localStorage.setItem("et_user",  JSON.stringify({ id: data._id, name: data.name, email: data.email }));
      setUser({ id: data._id, name: data.name, email: data.email });
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── LOGOUT ───────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem("et_user");
    localStorage.removeItem("et_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}