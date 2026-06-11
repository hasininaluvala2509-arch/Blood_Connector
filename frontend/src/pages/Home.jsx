import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#fdf2f2", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 980, background: "white", borderRadius: 28, boxShadow: "0 25px 70px rgba(15, 23, 42, 0.15)", padding: "48px 36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 999, background: "#fee2e2", color: "#b91c1c", fontWeight: 700, fontSize: 14 }}>
              <span>🩸</span> BloodBridge
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button style={{ background: "#b91c1c", color: "white", border: "none", padding: "12px 20px", borderRadius: 12, cursor: "pointer" }} onClick={() => navigate("/login")}>Sign In</button>
            <button style={{ background: "#ef4444", color: "white", border: "none", padding: "12px 20px", borderRadius: 12, cursor: "pointer" }} onClick={() => navigate("/register")}>Register</button>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <div style={{ fontSize: 80, lineHeight: 1, marginBottom: 24 }}>🩸</div>
          <h1 style={{ fontSize: 64, margin: 0, color: "#991b1b", fontWeight: 900 }}>BloodBridge</h1>
          <p style={{ maxWidth: 700, margin: "24px auto 0", fontSize: 20, color: "#475569", lineHeight: 1.7 }}>
            Your bridge between donors and hospitals. Send emergency blood alerts, find nearby donors, and coordinate life-saving donations quickly.
          </p>
        </div>

        <div style={{ display: "grid", gap: 22, marginTop: 12 }}>
          <div style={{ padding: 24, borderRadius: 24, background: "#fee2e2", border: "1px solid #fecaca" }}>
            <h2 style={{ margin: 0, color: "#991b1b" }}>SOS Emergency Contact</h2>
            <p style={{ marginTop: 14, color: "#7f1d1d", lineHeight: 1.8 }}>
              Immediate SOS line: <strong>112</strong>. Call now for urgent response and emergency dispatch.
            </p>
            <button
              style={{ marginTop: 18, background: "#f87171", color: "white", border: "none", padding: "12px 20px", borderRadius: 14, cursor: "pointer", fontWeight: 700 }}
              onClick={() => window.location.href = "tel:112"}
            >
              Call SOS
            </button>
          </div>
          <div style={{ padding: 24, borderRadius: 24, background: "#fee2e2", border: "1px solid #fecaca" }}>
            <h2 style={{ margin: 0, color: "#991b1b" }}>About BloodBridge</h2>
            <p style={{ marginTop: 14, color: "#475569", lineHeight: 1.8 }}>
              BloodBridge connects hospitals in urgent need with eligible donors nearby. It helps hospitals post alerts, donors respond fast, and both parties chat securely until the donation is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
