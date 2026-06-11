import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Chats() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadThreads = async () => {
      try {
        const res = await API.get("/chat/threads");
        setThreads(res.data);
      } catch (error) {
        setThreads([]);
      } finally {
        setLoading(false);
      }
    };

    loadThreads();
  }, [navigate, token]);

  const openChat = (thread) => {
    navigate("/chat", { state: { chatId: thread.id } });
  };

  return (
    <div style={{ background: "#fdf2f2", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, background: "white", borderRadius: 20, boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, color: "#0f172a" }}>Chat Threads</h2>
            <p style={{ color: "#475569", marginTop: 8 }}>Review your conversations and open a thread to continue the discussion.</p>
          </div>
          <button
            style={{ background: "#b91c1c", color: "white", border: "none", borderRadius: 12, padding: "10px 18px", cursor: "pointer" }}
            onClick={() => navigate(role === "hospital" ? "/dashboard" : "/find-donors")}
          >
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 28, borderRadius: 18, background: "#fee2e2", color: "#7f1d1d" }}>Loading chats...</div>
        ) : threads.length === 0 ? (
          <div style={{ padding: 28, borderRadius: 18, background: "#fee2e2", color: "#7f1d1d" }}>No chats are available yet. Start a new conversation from an alert.</div>
        ) : (
          threads.map((thread) => (
            <div key={thread.id} style={{ padding: 20, borderRadius: 18, border: "1px solid #fde2e2", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, color: "#0f172a" }}>{thread.title}</h3>
                <p style={{ margin: "8px 0 0", color: "#64748b" }}>{thread.lastMessage || "No messages yet."}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {thread.unread && <span style={{ background: "#ef4444", color: "white", padding: "6px 10px", borderRadius: 999 }}>New</span>}
                <button
                  style={{ background: "#b91c1c", color: "white", border: "none", padding: "10px 16px", borderRadius: 12, cursor: "pointer" }}
                  onClick={() => openChat(thread)}
                >
                  Open
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
