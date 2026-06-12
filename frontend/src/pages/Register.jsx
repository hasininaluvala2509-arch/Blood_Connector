import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Register() {
  const navigate = useNavigate();
  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const [locationStatus, setLocationStatus] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "donor",
    bloodGroup: "A+",
    hospitalName: "",
    address: "",
    lat: "",
    lng: "",
    phone: "",
    lastDonationDate: ""
  });
  const [error, setError] = useState("");

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported in this browser.");
      return;
    }
    setLocationStatus("Detecting current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          lat: position.coords.latitude.toFixed(5),
          lng: position.coords.longitude.toFixed(5),
        }));
        setLocationStatus("Location detected successfully.");
      },
      (error) => {
        setLocationStatus(`Location error: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleRegister = async () => {
    try {
      const data = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        bloodGroup: form.role === "donor" ? form.bloodGroup : undefined,
        hospitalName: form.role === "hospital" ? form.hospitalName : undefined,
        address: form.role === "hospital" ? form.address : undefined,
        phone: form.phone,
        lastDonationDate: form.role === "donor" ? form.lastDonationDate || undefined : undefined,
        location: {
          type: "Point",
          coordinates: [parseFloat(form.lng || 0), parseFloat(form.lat || 0)]
        }
      };

      await API.post("/auth/register", data);
      setError("");
      alert("Registered successfully. Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data || "Register failed");
    }
  };

  return (
    <div style={{ background: "#fdf2f2", minHeight: "100vh", padding: 40 }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: 28, background: "white", borderRadius: 16, boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)" }}>
        <h2 style={{ marginBottom: 24, color: "#991b1b" }}>Create your BloodBridge account</h2>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, color: "#334155" }}>Full Name</label>
            <input
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, color: "#334155" }}>Email</label>
            <input
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, color: "#334155" }}>Password</label>
            <input
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Create a password"
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, color: "#334155" }}>Register as</label>
            <select
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="donor">Donor</option>
              <option value="hospital">Hospital</option>
            </select>
          </div>
          {form.role === "hospital" ? (
            <>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#334155" }}>Hospital Name</label>
                <input
                  style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                  value={form.hospitalName}
                  onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
                  placeholder="The hospital or clinic name"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#334155" }}>Address</label>
                <input
                  style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Hospital address"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#334155" }}>Blood Group</label>
                <select
                  style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                  value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                >
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#334155" }}>Last Donation Date</label>
                <input
                  style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                  type="date"
                  value={form.lastDonationDate}
                  onChange={(e) => setForm({ ...form, lastDonationDate: e.target.value })}
                />
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              style={{ flex: 1, background: "#f87171", color: "white", border: "none", padding: 14, borderRadius: 12, cursor: "pointer", fontWeight: 700 }}
              onClick={handleUseLocation}
            >
              Use my current location
            </button>
            <div style={{ flex: 1, minWidth: 180, alignSelf: "center", color: "#475569" }}>
              {locationStatus || "Automatic GPS will fill latitude and longitude."}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, color: "#334155" }}>Latitude</label>
              <input
                style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
                placeholder="19.0760"
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, color: "#334155" }}>Longitude</label>
              <input
                style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: e.target.value })}
                placeholder="72.8777"
              />
            </div>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, color: "#334155" }}>Phone</label>
            <input
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone number"
            />
          </div>
        </div>
        <button
          style={{ width: "100%", marginTop: 20, padding: 14, borderRadius: 12, border: "none", background: "#b91c1c", color: "white", fontWeight: 600, cursor: "pointer" }}
          onClick={handleRegister}
        >
          Register
        </button>
        {error && <p style={{ color: "#b91c1c", marginTop: 16 }}>{error}</p>}
        <p style={{ marginTop: 20, textAlign: "center", color: "#475569" }}>
          Already registered? <Link to="/login" style={{ color: "#b91c1c" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
