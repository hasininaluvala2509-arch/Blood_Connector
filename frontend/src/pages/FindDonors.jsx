import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function FindDonors() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [profile, setProfile] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDonationPrompt, setShowDonationPrompt] = useState(false);
  const [donationAnswer, setDonationAnswer] = useState("");
  const [donationDate, setDonationDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "donor") {
      navigate("/dashboard");
      return;
    }

    async function loadData() {
      await fetchProfile();
      await fetchAlerts();
    }

    loadData();
  }, [navigate, role]);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile");
      setProfile(res.data);
      setError("");
      if (res.data.role === "donor" && !res.data.lastDonationDate) {
        setShowDonationPrompt(true);
      } else {
        setShowDonationPrompt(false);
      }
    } catch (err) {
      setError(err.response?.data || "Unable to load your profile.");
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/request/nearby");
      setAlerts(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data || "Unable to fetch nearby emergencies.");
    } finally {
      setLoading(false);
    }
  };

  const saveDonationDate = async () => {
    if (!donationDate) {
      setError("Please select a donation date.");
      return;
    }

    try {
      await API.put("/auth/profile", { lastDonationDate: donationDate });
      setMessage("Donation date recorded.");
      setError("");
      setShowDonationPrompt(false);
      setDonationAnswer("");
      setDonationDate("");
      fetchProfile();
    } catch (err) {
      setError(err.response?.data || "Unable to save donation date.");
      setMessage("");
    }
  };

  const openChat = async (alert) => {
    try {
      const res = await API.post("/chat/thread", {
        alertId: alert._id,
        donorId: localStorage.getItem("userId"),
        donorName: profile?.name,
        hospitalId: alert.hospitalId,
        hospitalName: alert.hospitalName,
        title: `Chat with ${alert.hospitalName}`
      });
      navigate("/chat", { state: { chatId: res.data._id } });
    } catch (err) {
      setError(err.response?.data || "Unable to start chat.");
    }
  };

  return (
    <div style={{ background: "#fdf2f2", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 24, background: "white", borderRadius: 20, boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ margin: 0, color: "#0f172a" }}>Donor Dashboard</h2>
            <p style={{ color: "#475569", marginTop: 8 }}>Your personal dashboard shows nearby emergencies, donation stats and chat access.</p>
          </div>
          <button
            style={{ background: "#b91c1c", color: "white", border: "none", padding: "12px 20px", borderRadius: 12, cursor: "pointer" }}
            onClick={fetchAlerts}
          >
            Refresh Alerts
          </button>
        </div>

        {showDonationPrompt && (
          <div style={{ marginBottom: 24, padding: 20, borderRadius: 18, background: "#fee2e2", border: "1px solid #fecaca" }}>
            <p style={{ margin: 0, color: "#991b1b", fontWeight: 600 }}>Have you donated blood recently?</p>
            <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                style={{ background: donationAnswer === "yes" ? "#b91c1c" : "#fee2e2", color: donationAnswer === "yes" ? "white" : "#0f172a", border: "none", padding: "10px 18px", borderRadius: 12, cursor: "pointer" }}
                onClick={() => setDonationAnswer("yes")}
              >Yes</button>
              <button
                style={{ background: donationAnswer === "no" ? "#ef4444" : "#fee2e2", color: donationAnswer === "no" ? "white" : "#0f172a", border: "none", padding: "10px 18px", borderRadius: 12, cursor: "pointer" }}
                onClick={() => {
                  setDonationAnswer("no");
                  setShowDonationPrompt(false);
                }}
              >No</button>
            </div>
            {donationAnswer === "yes" && (
              <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
                <label style={{ color: "#334155" }}>Donation date</label>
                <input
                  type="date"
                  value={donationDate}
                  onChange={(e) => setDonationDate(e.target.value)}
                  style={{ padding: 12, borderRadius: 12, border: "1px solid #cbd5e1", width: "250px" }}
                />
                <button
                  style={{ width: "fit-content", background: "#b91c1c", color: "white", border: "none", padding: "12px 18px", borderRadius: 12, cursor: "pointer" }}
                  onClick={saveDonationDate}
                >
                  Save Donation Date
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ padding: 20, borderRadius: 18, background: "#fee2e2" }}>
            <div style={{ fontSize: 13, color: "#b91c1c", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>Donations</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#0f172a" }}>{profile?.donationCount ?? 0}</div>
            <div style={{ color: "#475569", marginTop: 6 }}>Donations recorded</div>
          </div>
          <div style={{ padding: 20, borderRadius: 18, background: "#fee2e2" }}>
            <div style={{ fontSize: 13, color: "#b91c1c", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>Emergencies nearby</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#0f172a" }}>{alerts.length}</div>
            <div style={{ color: "#475569", marginTop: 6 }}>Active alerts within 30 km</div>
          </div>
          <div style={{ padding: 22, borderRadius: 18, background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)", color: "white", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 180 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>Save a life</div>
              <div style={{ fontSize: 28, lineHeight: 1.1 }}>🩸</div>
              <p style={{ marginTop: 12, color: "rgba(255,255,255,0.9)" }}>Keep your donor profile ready and respond to nearby emergencies quickly.</p>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 14 }}>Blood donation makes a bigger difference than you think.</div>
          </div>
        </div>

        {error && <p style={{ color: "#b91c1c", marginBottom: 24 }}>{error}</p>}
        {message && <p style={{ color: "#16a34a", marginBottom: 24 }}>{message}</p>}

        {loading ? (
          <div style={{ padding: 28, borderRadius: 18, background: "#fee2e2", color: "#7f1d1d" }}>Loading nearby emergencies...</div>
        ) : alerts.length === 0 ? (
          <div style={{ padding: 28, borderRadius: 18, background: "#fee2e2", color: "#7f1d1d" }}>No nearby emergency alerts found right now.</div>
        ) : (
          alerts.map((alert) => (
            <div key={alert._id} style={{ padding: 22, borderRadius: 18, border: "1px solid #fde2e2", marginBottom: 18, background: "#ffffff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h3 style={{ margin: 0, color: "#0f172a" }}>{alert.hospitalName}</h3>
                  <p style={{ margin: "8px 0 0", color: "#475569" }}>{alert.location}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ background: "#fee2e2", padding: "10px 14px", borderRadius: 12, color: "#7f1d1d" }}>{alert.distance}</span>
                  <span style={{ background: alert.status === "open" ? "#fee2e2" : alert.status === "completed" ? "#fee2e2" : "#fef3c7", padding: "10px 14px", borderRadius: 12, color: alert.status === "completed" ? "#7f1d1d" : alert.status === "dismissed" ? "#92400e" : "#991b1b" }}>
                    {alert.status === "open" ? "Pending" : alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                  </span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 18, color: "#334155" }}>
                <div>Blood group: <strong>{alert.bloodGroup}</strong></div>
                <div>Urgency: <strong>{alert.urgency}</strong></div>
                <div>Contact: <strong>{alert.contactNumber}</strong></div>
              </div>
              <button
                style={{ marginTop: 18, background: "#b91c1c", color: "white", border: "none", padding: "12px 18px", borderRadius: 12, cursor: "pointer" }}
                onClick={() => openChat(alert)}
              >
                Chat with Hospital
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
