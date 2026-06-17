import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bloodGroup: "A+",
    lastDonationDate: "",
    hospitalName: "",
    address: "",
    lat: "",
    lng: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile");
      setProfile(res.data);
      setForm({
        name: res.data.name || "",
        phone: res.data.phone || "",
        bloodGroup: res.data.bloodGroup || "A+",
        lastDonationDate: res.data.lastDonationDate ? res.data.lastDonationDate.split("T")[0] : "",
        hospitalName: res.data.hospitalName || "",
        address: res.data.address || "",
        lat: res.data.location?.coordinates?.[1] ? String(res.data.location.coordinates[1]) : "",
        lng: res.data.location?.coordinates?.[0] ? String(res.data.location.coordinates[0]) : ""
      });
      setError("");
    } catch (err) {
      setError(err.response?.data || "Could not load profile.");
    }
  };

  const handleSave = async () => {
    try {
      await API.put("/auth/profile", {
        name: form.name,
        phone: form.phone,
        bloodGroup: profile?.role === "donor" ? form.bloodGroup : undefined,
        lastDonationDate: profile?.role === "donor" ? form.lastDonationDate : undefined,
        hospitalName: profile?.role === "hospital" ? form.hospitalName : undefined,
        address: profile?.role === "hospital" ? form.address : undefined,
        location: form.lat && form.lng ? { lat: form.lat, lng: form.lng } : undefined
      });
      localStorage.setItem("userName", form.name);
      setMessage("Profile updated successfully.");
      setError("");
      fetchProfile();
    } catch (err) {
      setError(err.response?.data || "Unable to save profile.");
      setMessage("");
    }
  };

  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          lat: position.coords.latitude.toFixed(5),
          lng: position.coords.longitude.toFixed(5)
        }));
        setMessage("GPS Location captured.");
        setError("");
      },
      (err) => {
        setError(`Location error: ${err.message}`);
      },
      { enableHighAccuracy: true }
    );
  };

  if (!profile) {
    return null;
  }

  return (
    <div style={{ background: "#fdf2f2", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, background: "white", borderRadius: 20, boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, color: "#991b1b" }}>Your Profile</h2>
            <p style={{ color: "#475569", marginTop: 8 }}>Review your account details and edit information anytime.</p>
          </div>
          <button
            style={{ background: "#b91c1c", color: "white", border: "none", padding: "10px 18px", borderRadius: 12, cursor: "pointer" }}
            onClick={() => navigate(profile.role === "hospital" ? "/dashboard" : "/find-donors")}
          >
            Back to Dashboard
          </button>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, color: "#475569" }}>Full Name</label>
              <input
                style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, color: "#475569" }}>Phone</label>
              <input
                style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            {profile.role === "donor" ? (
              <>
                <div>
                  <label style={{ display: "block", marginBottom: 8, color: "#475569" }}>Blood Group</label>
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
                  <label style={{ display: "block", marginBottom: 8, color: "#475569" }}>Last Donation Date</label>
                  <input
                    type="date"
                    style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                    value={form.lastDonationDate}
                    onChange={(e) => setForm({ ...form, lastDonationDate: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ display: "block", marginBottom: 8, color: "#475569" }}>Hospital Name</label>
                  <input
                    style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                    value={form.hospitalName}
                    onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, color: "#475569" }}>Address</label>
                  <input
                    style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#475569" }}>Latitude</label>
                <input
                  style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  placeholder="19.0760"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#475569" }}>Longitude</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })}
                    placeholder="72.8777"
                  />
                  <button
                    type="button"
                    onClick={handleCaptureGPS}
                    style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: 12, padding: "0 16px", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}
                  >
                    Use GPS
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button
            style={{ width: "100%", background: "#b91c1c", color: "white", border: "none", padding: 14, borderRadius: 12, cursor: "pointer" }}
            onClick={handleSave}
          >
            Save Profile
          </button>
          {message && <p style={{ color: "#16a34a" }}>{message}</p>}
          {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}
