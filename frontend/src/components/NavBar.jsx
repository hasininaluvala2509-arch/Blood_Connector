import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const [unreadCount, setUnreadCount] = useState(0);

  const isHome = location.pathname === "/";
  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/find-donors";
  const isLoggedIn = Boolean(token && role);

  useEffect(() => {
    const loadUnread = async () => {
      if (!isLoggedIn) {
        setUnreadCount(0);
        return;
      }

      try {
        const res = await API.get("/chat/threads");
        const count = res.data.filter((thread) => thread.unread).length;
        setUnreadCount(count);
      } catch (error) {
        setUnreadCount(0);
      }
    };

    loadUnread();
  }, [location, isLoggedIn]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <div style={{ background: "white", color: "#0f172a", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderBottom: "1px solid #fee2e2" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ cursor: "pointer" }} onClick={() => navigate("/")}> 
          <div style={{ fontWeight: 700, fontSize: 22 }}>BloodBridge</div>
          <div style={{ fontSize: 12, color: "#b91c1c" }}>Bridge between donor & receiver</div>
        </div>
        {isDashboard && (
          <button style={{ background: "#f87171", border: "none", borderRadius: 12, padding: "10px 14px", color: "white", cursor: "pointer" }} onClick={() => navigate("/")}>Home</button>
        )}
        {isHome && isLoggedIn && (
          <button style={{ background: "#f87171", border: "none", borderRadius: 12, padding: "10px 14px", color: "white", cursor: "pointer" }} onClick={() => navigate("/dashboard")}>Dashboard</button>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button title="SOS" style={{ background: "#fecaca", border: "none", borderRadius: 12, padding: "10px 14px", color: "#991b1b", cursor: "pointer", fontSize: 16 }} onClick={() => window.location.href = "tel:112"}>SOS</button>
        {isLoggedIn ? (
          <>
            <button title="Chats" style={{ background: "#f87171", border: "none", borderRadius: 12, padding: "10px 14px", color: "white", cursor: "pointer", fontSize: 16 }} onClick={() => navigate("/chats")}>💬{unreadCount > 0 && <span style={{ marginLeft: 6, background: "#ef4444", borderRadius: "50%", width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{unreadCount}</span>}</button>
            <button title="Profile" style={{ background: "#f87171", border: "none", borderRadius: 12, padding: "10px 14px", color: "white", cursor: "pointer", fontSize: 16 }} onClick={() => navigate("/profile")}>👤</button>
            <button style={{ background: "#f87171", border: "none", borderRadius: 12, padding: "10px 14px", color: "white", cursor: "pointer" }} onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <button style={{ background: "#b91c1c", border: "none", borderRadius: 12, padding: "10px 14px", color: "white", cursor: "pointer" }} onClick={() => navigate("/login")}>Sign In</button>
            <button style={{ background: "#ef4444", border: "none", borderRadius: 12, padding: "10px 14px", color: "white", cursor: "pointer" }} onClick={() => navigate("/register")}>Sign Up</button>
          </>
        )}
      </div>
    </div>
  );
}
