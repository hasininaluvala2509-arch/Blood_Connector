import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function SOSPanel({ profile }) {
  const navigate = useNavigate();
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [units, setUnits] = useState("1");
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [sentDonors, setSentDonors] = useState(null);

  useEffect(() => {
    if (!location && profile?.location?.coordinates) {
      setLocation({
        lat: parseFloat(profile.location.coordinates[1]).toFixed(5),
        lng: parseFloat(profile.location.coordinates[0]).toFixed(5),
      });
      setStatus("Location loaded from your profile.");
      return;
    }

    if (location || !navigator.geolocation) return;

    setStatus("Detecting your location automatically...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude.toFixed(5),
          lng: position.coords.longitude.toFixed(5),
        };
        setLocation(coords);
        setStatus("Location captured successfully.");
      },
      (error) => {
        setStatus(`Location error: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [location]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by your browser.");
      return;
    }

    setStatus("Finding your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude.toFixed(5),
          lng: position.coords.longitude.toFixed(5),
        };
        setLocation(coords);
        setStatus("Location captured successfully.");
      },
      (error) => {
        setStatus(`Location error: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Simulate a form submit without backend calls.
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!location) {
      setStatus("Please capture your location before sending.");
      return;
    }

    const payload = {
      bloodGroup,
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lng),
      description,
      contactNumber: profile?.phone || undefined
    };

    setStatus("Sending SOS to nearby donors...");
    API.post("/request/sos", payload)
      .then((res) => {
        setRequestSent(true);
        setStatus(res.data?.message || "New feature under progress");
        setSentDonors(res.data?.donors || []);
        // keep notification briefly
        window.setTimeout(() => setRequestSent(false), 3500);
      })
      .catch((err) => {
        setStatus(err.response?.data || "Unable to send SOS.");
      });
  };

  return (
    <section
      id="sos-panel"
      style={{
        background: "white",
        borderRadius: 28,
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
        padding: 32,
        marginTop: 24,
      }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 30, color: "#ac0e31", fontWeight: 700, marginBottom: 6 }}>NOTE : Update under Progress</div>
          <div style={{ fontSize: 14, color: "#e11d48", fontWeight: 700, marginBottom: 6 }}>Emergency SOS</div>
          <h2 style={{ margin: 0, fontSize: 28, color: "#111827" }}>Create a fast blood request</h2>
          <p style={{ margin: "12px 0 0", color: "#475569", lineHeight: 1.7 }}>Use this panel for an instant emergency request without backend calls.</p>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fef2f2", borderRadius: 999, padding: "10px 16px", color: "#b91c1c", fontWeight: 700 }}>
          <span>🔥</span>
          SOS Mode
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr", minWidth: 0 }}>
          <label style={{ display: "grid", gap: 8, color: "#334155", fontWeight: 600 }}>
            Blood group
            <select
              value={bloodGroup}
              onChange={(event) => setBloodGroup(event.target.value)}
              style={{ width: "100%", padding: "14px 16px", borderRadius: 16, border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a" }}>
              {bloodGroups.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 8, color: "#334155", fontWeight: 600 }}>
            Units required
            <input
              type="number"
              min="1"
              value={units}
              onChange={(event) => setUnits(event.target.value)}
              style={{ width: "100%", padding: "14px 16px", borderRadius: 16, border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a" }}
            />
          </label>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            type="button"
            onClick={handleUseLocation}
            className="secondary-button button-hover"
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fca5a5",
              borderRadius: 16,
              padding: "14px 18px",
              cursor: "pointer",
              fontWeight: 700,
            }}>
            Use My Location
          </button>

          {location && (
            <div style={{ padding: 16, borderRadius: 18, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155" }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Location captured</div>
              <div>Latitude: {location.lat}</div>
              <div>Longitude: {location.lng}</div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!location}
          className="button-hover"
          style={{
            background: location ? "#e53935" : "#fca5a5",
            color: "white",
            border: "none",
            borderRadius: 18,
            padding: "18px 22px",
            cursor: location ? "pointer" : "not-allowed",
            fontSize: 16,
            fontWeight: 700,
            marginTop: 4,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}>
          {location ? "Send request to nearby donors" : "Waiting for location..."}
        </button>
      </form>

      {/* Modal-like donor list shown after SOS is sent */}
      {/* {sentDonors && (
        <div style={{ marginTop: 20, padding: 18, borderRadius: 16, background: "#fff7ed", border: "1px solid #fecaca" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>SOS delivered to the following donors</div>
          {sentDonors.length === 0 ? (
            <div>No donors were notified.</div>
          ) : (
            sentDonors.map((d) => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #ffefe6" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{d.name}</div>
                  <div style={{ color: "#475569", fontSize: 13 }}>{d.distance} • {d.phone || 'No phone'}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => window.open(`tel:${d.phone}`)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 12px", borderRadius: 12 }}>Call</button>
                  {d.chatId && (
                    <button onClick={() => navigate(`/chats/${d.chatId}`)} style={{ background: "#e53935", color: "white", border: "none", padding: "8px 12px", borderRadius: 12 }}>Open chat</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )} */}

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {status && (
          <div style={{ borderRadius: 18, padding: "16px 20px", background: requestSent ? "#dcfce7" : "#fef2f2", border: requestSent ? "1px solid #86efac" : "1px solid #fecaca", color: requestSent ? "#166534" : "#b91c1c" }}>
            {status}
          </div>
        )}
        <div style={{ color: "#475569", fontSize: 14 }}>
          Fill the form and use location to simulate an emergency donor request.
        </div>
      </div>
    </section>
  );
}
