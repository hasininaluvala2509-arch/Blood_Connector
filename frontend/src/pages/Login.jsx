import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userName", res.data.user.name);
      setError("");
      navigate(res.data.role === "hospital" ? "/dashboard" : "/find-donors");
    } catch (err) {
      setError(err.response?.data || "Login failed");
    }
  };

  return (
    <div style={{ background: "#fdf2f2", minHeight: "100vh", padding: 40 }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: 28, background: "white", borderRadius: 16, boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)" }}>
        <h2 style={{ marginBottom: 20, color: "#991b1b" }}>Login to BloodBridge</h2>
        <label style={{ display: "block", marginBottom: 8, color: "#334155" }}>Email</label>
        <input
          style={{ width: "100%", padding: 14, marginBottom: 16, borderRadius: 12, border: "1px solid #cbd5e1" }}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="your@email.com"
        />
        <label style={{ display: "block", marginBottom: 8, color: "#334155" }}>Password</label>
        <input
          style={{ width: "100%", padding: 14, marginBottom: 16, borderRadius: 12, border: "1px solid #cbd5e1" }}
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Enter your password"
        />
        <button
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: "#b91c1c", color: "white", fontWeight: 600, cursor: "pointer" }}
          onClick={handleLogin}
        >
          Login
        </button>
        {error && <p style={{ color: "#b91c1c", marginTop: 16 }}>{error}</p>}
        <p style={{ marginTop: 20, textAlign: "center", color: "#475569" }}>
          New here? <Link to="/register" style={{ color: "#b91c1c" }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
