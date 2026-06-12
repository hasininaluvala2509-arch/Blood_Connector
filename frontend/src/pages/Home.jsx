import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import HeroSection from "../components/HeroSection";
import SOSPanel from "../components/SOSPanel";
import StatsCards from "../components/StatsCards";
import DonorStatusPanel from "../components/DonorStatusPanel";
import NearbyDonors from "../components/NearbyDonors";

export default function Home() {
  const navigate = useNavigate();
  const sosRef = useRef(null);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({ activeDonors: null, requestsToday: null });

  useEffect(() => {
    if (!token) return;

    const loadProfile = async () => {
      try {
        const res = await API.get("/auth/profile");
        setProfile(res.data);
      } catch {
        setProfile(null);
      }
    };

    loadProfile();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = (dateValue) => {
      if (!dateValue) return false;
      const date = new Date(dateValue);
      return date.toDateString() === today.toDateString();
    };

    const loadCounts = async () => {
      try {
        // active donors count (global) — keeps in sync with newly registered donors
        const resCount = await API.get("/auth/active-donors-count");
        const activeCount = resCount.data?.count ?? null;

        if (role === "donor") {
          const res = await API.get("/request/nearby");
          const alerts = Array.isArray(res.data) ? res.data : [];
          const todays = alerts.filter((alert) => isToday(alert.createdAt)).length;
          setCounts({ activeDonors: activeCount, requestsToday: todays || 0 });
        } else if (role === "hospital") {
          const res = await API.get("/request/hospital");
          const alerts = Array.isArray(res.data.alerts) ? res.data.alerts : [];
          const todays = alerts.filter((alert) => isToday(alert.createdAt)).length;
          setCounts({ activeDonors: activeCount, requestsToday: todays || alerts.length || 0 });
        } else {
          setCounts({ activeDonors: activeCount, requestsToday: null });
        }
      } catch (err) {
        setCounts({ activeDonors: null, requestsToday: null });
      }
    };

    loadCounts();
  }, [token, role]);

  const scrollToSOS = () => {
    if (!token) {
      navigate("/login");
      return;
    }
    sosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSignIn = () => navigate("/login");
  const handleRegister = () => navigate("/register");

  const isLoggedIn = Boolean(token);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 1220, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, padding: "18px 0" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 999, background: "#fee2e2", color: "#b91c1c", fontWeight: 700, fontSize: 14 }}>
              <span>🩸</span> BloodBridge
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {isLoggedIn ? (
              <button className="button-hover" style={{ background: "#ef4444", color: "white", border: "none", padding: "12px 20px", borderRadius: 12, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>Dashboard</button>
            ) : (
              <>
                <button className="button-hover" style={{ background: "#b91c1c", color: "white", border: "none", padding: "12px 20px", borderRadius: 12, cursor: "pointer" }} onClick={handleSignIn}>Sign In</button>
                <button className="button-hover" style={{ background: "#ef4444", color: "white", border: "none", padding: "12px 20px", borderRadius: 12, cursor: "pointer" }} onClick={handleRegister}>Register</button>
              </>
            )}
          </div>
        </div>

        <HeroSection onRequestNow={scrollToSOS} />

        <StatsCards activeDonors={counts.activeDonors} requestsToday={counts.requestsToday} />

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, marginTop: 32, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 24 }}>
            <div ref={sosRef}>
              {isLoggedIn ? (
                role === "hospital" ? (
                  <SOSPanel profile={profile} />
                ) : (
                  <div style={{ background: "#ffffff", borderRadius: 28, boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)", padding: 32 }}>
                    <div style={{ marginBottom: 21, color: "#a82c13", fontWeight: 700, fontSize: 22 }}>App. Update under progress</div>
                    <div style={{ marginBottom: 16, color: "#0f172a", fontWeight: 700, fontSize: 22 }}>SOS restricted to hospitals</div>
                    <p style={{ color: "#475569", lineHeight: 1.8, marginBottom: 24 }}>
                      Only hospital accounts can create emergency SOS requests. Donors can view and respond to alerts.
                    </p>
                    <button
                      type="button"
                      style={{ width: "100%", background: "#b91c1c", color: "white", border: "none", borderRadius: 18, padding: "16px 24px", cursor: "pointer", fontWeight: 700 }}
                      onClick={() => navigate(role === "hospital" ? "/dashboard" : "/find-donors")}
                    >
                      Go to your dashboard
                    </button>
                  </div>
                )
              ) : (
                <div style={{ background: "#ffffff", borderRadius: 28, boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)", padding: 32 }}>
                  <div style={{ marginBottom: 16, color: "#0f172a", fontWeight: 700, fontSize: 22 }}>Sign in to create SOS alerts</div>
                  <p style={{ color: "#475569", lineHeight: 1.8, marginBottom: 24 }}>
                    Only logged in donors or hospitals can submit emergency requests.
                  </p>
                  <button
                    type="button"
                    style={{ width: "100%", background: "#e53935", color: "white", border: "none", borderRadius: 18, padding: "16px 24px", cursor: "pointer", fontWeight: 700 }}
                    onClick={handleSignIn}
                  >
                    Sign in to continue
                  </button>
                </div>
              )}
            </div>

            {isLoggedIn ? (
              role === "hospital" ? (
                <NearbyDonors profile={profile} />
              ) : (
                <div style={{ background: "#ffffff", borderRadius: 28, boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)", padding: 32 }}>
                  <div style={{ marginBottom: 16, color: "#0f172a", fontWeight: 700, fontSize: 22 }}>Hospital requests is on your dashboard view</div>
                  <p style={{ color: "#475569", lineHeight: 1.8, marginBottom: 24 }}>
                    Donor can see new requests made by hospitals for nearby emergency alerts also can chat with hospitals for donation and other details . Hospital accounts can see real nearby donors here.
                  </p>
                  <button
                    type="button"
                    style={{ width: "100%", background: "#b91c1c", color: "white", border: "none", borderRadius: 18, padding: "16px 24px", cursor: "pointer", fontWeight: 700 }}
                    onClick={() => navigate(role === "hospital" ? "/dashboard" : "/find-donors")}
                  >
                    Go to your dashboard
                  </button>
                </div>
              )
            ) : (
              <div style={{ background: "#ffffff", borderRadius: 28, boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)", padding: 32 }}>
                <div style={{ marginBottom: 16, color: "#0f172a", fontWeight: 700, fontSize: 22 }}>Nearby donors require sign in</div>
                <p style={{ color: "#475569", lineHeight: 1.8, marginBottom: 24 }}>
                  Registered users can see donor cards, open chat with alert originators, and respond safely.
                </p>
                <button
                  type="button"
                  style={{ width: "100%", background: "#b91c1c", color: "white", border: "none", borderRadius: 18, padding: "16px 24px", cursor: "pointer", fontWeight: 700 }}
                  onClick={handleRegister}
                >
                  Register to view donors
                </button>
              </div>
            )}
          </div>

          <DonorStatusPanel profile={profile} />
        </div>
      </div>
    </div>
  );
}
