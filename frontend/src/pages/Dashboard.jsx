import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ emergenciesCount: 0, successfulMissions: 0 });
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [matchedDonors, setMatchedDonors] = useState([]);
  const [form, setForm] = useState({ bloodGroup: "A+", location: "", neededByDate: "", neededByTime: "", contactNumber: "", lat: "19.0760", lng: "72.8777" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sortedAlerts = alerts.slice().sort((a, b) => {
    if (a.status === "open" && b.status !== "open") return -1;
    if (a.status !== "open" && b.status === "open") return 1;
    if (a.status === "completed" && b.status === "dismissed") return -1;
    if (a.status === "dismissed" && b.status === "completed") return 1;
    return 0;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) {
      navigate("/login");
      return;
    }
    if (role !== "hospital") {
      navigate("/find-donors");
      return;
    }

    fetchProfile();
    fetchStats();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile");
      setProfile(res.data);
    } catch (err) {
      setError(err.response?.data || "Unable to load profile.");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/request/hospital");
      setStats({
        emergenciesCount: res.data.emergenciesCount,
        successfulMissions: res.data.successfulMissions
      });
      setAlerts(res.data.alerts);
      setError("");
    } catch (err) {
      setError(err.response?.data || "Unable to load hospital dashboard.");
    }
  };

  const createRequest = async () => {
    if (!form.neededByDate || !form.neededByTime) {
      setError("Please select the needed by date and time.");
      setMessage("");
      return;
    }

    try {
      const neededBy = `${form.neededByDate}T${form.neededByTime}`;
      await API.post("/request", {
        bloodGroup: form.bloodGroup,
        location: form.location,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        neededBy,
        contactNumber: form.contactNumber
      });
      setMessage("Alert created successfully.");
      setError("");
      setForm({ ...form, location: "", neededByDate: "", neededByTime: "", contactNumber: "" });
      fetchStats();
    } catch (err) {
      setError(err.response?.data || "Unable to create alert.");
      setMessage("");
    }
  };

  const updateAlertStatus = async (alertId, status) => {
    try {
      await API.patch(`/request/${alertId}/status`, { status });
      setMessage("Alert status updated.");
      setError("");
      fetchStats();
      if (selectedAlert?._id === alertId) {
        setSelectedAlert({ ...selectedAlert, status });
      }
    } catch (err) {
      setError(err.response?.data || "Unable to update alert status.");
      setMessage("");
    }
  };

  const openAlert = async (alert) => {
    setSelectedAlert(alert);
    try {
      const res = await API.get(`/request/alert/${alert._id}/donors`);
      setMatchedDonors(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data || "Unable to load donor matches.");
      setMatchedDonors([]);
    }
  };

  const openChat = async (donor) => {
    try {
      const res = await API.post("/chat/thread", {
        alertId: selectedAlert._id,
        donorId: donor.id,
        donorName: donor.name,
        hospitalId: localStorage.getItem("userId"),
        hospitalName: profile?.hospitalName || profile?.name,
        title: `Chat with ${donor.name}`
      });
      navigate("/chat", { state: { chatId: res.data._id } });
    } catch (err) {
      setError(err.response?.data || "Unable to start chat.");
    }
  };

  return (
    <div style={{ background: "#fdf2f2", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: 24, background: "white", borderRadius: 20, boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, color: "#0f172a" }}>Hospital Dashboard</h2>
            <p style={{ color: "#475569", marginTop: 8 }}>Manage alerts, review donor matches and message donors from your hospital.</p>
          </div>
          <button
            style={{ background: "#b91c1c", color: "white", border: "none", padding: "12px 20px", borderRadius: 12, cursor: "pointer" }}
            onClick={fetchStats}
          >
            Refresh Dashboard
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
          <div style={{ padding: 20, borderRadius: 18, background: "#fee2e2" }}>
            <div style={{ color: "#b91c1c", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>Open alerts</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#0f172a" }}>{stats.emergenciesCount}</div>
          </div>
          <div style={{ padding: 20, borderRadius: 18, background: "#fee2e2" }}>
            <div style={{ color: "#b91c1c", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>Successful missions</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#0f172a" }}>{stats.successfulMissions}</div>
          </div>
          <div style={{ padding: 22, borderRadius: 18, background: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)", color: "white", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 180 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>Find donors faster</div>
              <div style={{ fontSize: 28, lineHeight: 1.1 }}>🩸</div>
              <p style={{ marginTop: 12, color: "rgba(255,255,255,0.9)" }}>Your alert matches will appear on the right panel as donors are found.</p>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 14 }}>Select an alert to see available donors.</div>
          </div>
        </div>

        <div style={{ marginBottom: 32, padding: 22, borderRadius: 20, border: "1px solid #fde2e2", background: "#ffffff" }}>
          <h3 style={{ marginTop: 0, color: "#0f172a" }}>Create Emergency Alert</h3>
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
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
                <label style={{ display: "block", marginBottom: 8, color: "#475569" }}>Needed by</label>
                <div style={{ display: "grid", gap: 12 }}>
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.neededByDate}
                    onChange={(e) => setForm({ ...form, neededByDate: e.target.value })}
                    style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                  />
                  <input
                    type="time"
                    min={form.neededByDate === new Date().toISOString().slice(0, 10)
                      ? new Date(Date.now() + 10 * 60 * 1000).toTimeString().slice(0, 5)
                      : "00:00"
                    }
                    value={form.neededByTime}
                    onChange={(e) => setForm({ ...form, neededByTime: e.target.value })}
                    style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, color: "#475569" }}>Patient Location</label>
              <input
                style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Location description"
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#475569" }}>Latitude</label>
                <input
                  style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#475569" }}>Longitude</label>
                <input
                  style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, color: "#475569" }}>Contact Number</label>
              <input
                style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1" }}
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                placeholder="Phone number for donors"
              />
            </div>
            <button
              style={{ width: "100%", background: "#b91c1c", color: "white", border: "none", borderRadius: 12, padding: 14, cursor: "pointer" }}
              onClick={createRequest}
            >
              Post Alert
            </button>
            {message && <p style={{ color: "#16a34a" }}>{message}</p>}
            {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.9fr", gap: 24, marginTop: 8 }}>
          <div>
            <div style={{ display: "grid", gap: 18 }}>
              <h3 style={{ margin: 0, color: "#0f172a" }}>Your Alerts</h3>
              {alerts.length === 0 ? (
                <div style={{ padding: 22, borderRadius: 18, background: "#fee2e2", color: "#7f1d1d" }}>No alert posts yet. Post one to match donors.</div>
              ) : (
                sortedAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    style={{ padding: 22, borderRadius: 18, border: "1px solid #fde2e2", background: "#ffffff" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                      <div>
                        <h4 style={{ margin: 0, color: "#0f172a" }}>{alert.location}</h4>
                        <p style={{ margin: "8px 0 0", color: "#475569" }}>
                          {alert.bloodGroup} • Needed by {alert.neededBy ? new Date(alert.neededBy).toLocaleString() : "Not set"}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ background: alert.status === "open" ? "#fee2e2" : alert.status === "completed" ? "#fee2e2" : "#fef3c7", color: alert.status === "completed" ? "#7f1d1d" : alert.status === "dismissed" ? "#92400e" : "#991b1b", padding: "8px 12px", borderRadius: 12 }}>
                          {alert.status === "open" ? "Pending" : alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                        </span>
                        <button
                          style={{ background: "#b91c1c", color: "white", border: "none", padding: "10px 16px", borderRadius: 12, cursor: "pointer" }}
                          onClick={() => openAlert(alert)}
                        >
                          View Donor Matches
                        </button>
                      </div>
                    </div>
                    {alert.status === "open" && (
                      <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <button
                          style={{ background: "#16a34a", color: "white", border: "none", padding: "10px 16px", borderRadius: 12, cursor: "pointer" }}
                          onClick={() => updateAlertStatus(alert._id, "completed")}
                        >
                          Mission Completed
                        </button>
                        <button
                          style={{ background: "#ef4444", color: "white", border: "none", padding: "10px 16px", borderRadius: 12, cursor: "pointer" }}
                          onClick={() => updateAlertStatus(alert._id, "dismissed")}
                        >
                          Mission Dismissed
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ padding: 24, borderRadius: 24, border: "1px solid #fde2e2", background: "#fee2e2", minHeight: 480 }}>
            {!selectedAlert ? (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 18, color: "#475569" }}>
                <div style={{ fontSize: 42 }}>🩸</div>
                <div>
                  <h3 style={{ margin: 0, color: "#0f172a" }}>Donor matches will appear here</h3>
                  <p style={{ marginTop: 10 }}>Click any alert to load matching donors on the right side.</p>
                </div>
                <div style={{ maxWidth: 320, borderRadius: 18, padding: 18, background: "white", boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)" }}>
                  <p style={{ margin: 0, color: "#475569" }}>Keep your alerts active and the system will show eligible donors as soon as they are found.</p>
                </div>
              </div>
            ) : matchedDonors.length === 0 ? (
              <div style={{ textAlign: "center", color: "#475569" }}>
                <div style={{ fontSize: 42 }}>🩸</div>
                <h3 style={{ marginTop: 0, color: "#0f172a" }}>No donors matched yet</h3>
                <p>We are searching for donors that meet this alert criteria.</p>
              </div>
            ) : (
              <div>
                <h3 style={{ margin: 0, color: "#0f172a", marginBottom: 18 }}>Matches for {selectedAlert.location}</h3>
                {matchedDonors.map((donor) => (
                  <div key={donor.id} style={{ padding: 18, borderRadius: 18, background: "white", border: "1px solid #fde2e2", marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <strong style={{ color: "#0f172a" }}>{donor.name}</strong>
                        <p style={{ margin: "6px 0 0", color: "#475569" }}>Distance: {donor.distance}</p>
                      </div>
                      <button
                        style={{ background: "#b91c1c", color: "white", border: "none", padding: "10px 16px", borderRadius: 12, cursor: "pointer" }}
                        onClick={() => openChat(donor)}
                      >
                        Chat with Donor
                      </button>
                    </div>
                    <div style={{ marginTop: 12, color: "#334155" }}>
                      <div>Blood Group: {donor.bloodGroup}</div>
                      <div>Phone: {donor.phone}</div>
                      <div>Last Donation: {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : "Unknown"}</div>
                      <div style={{ marginTop: 10 }}>
                        <span style={{ background: selectedAlert?.status === "open" ? "#fee2e2" : selectedAlert?.status === "completed" ? "#fee2e2" : "#fef3c7", color: selectedAlert?.status === "completed" ? "#7f1d1d" : selectedAlert?.status === "dismissed" ? "#92400e" : "#991b1b", padding: "6px 10px", borderRadius: 12, fontSize: 13, display: "inline-flex" }}>
                          Alert status: {selectedAlert?.status === "open" ? "Pending" : selectedAlert?.status.charAt(0).toUpperCase() + selectedAlert?.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
