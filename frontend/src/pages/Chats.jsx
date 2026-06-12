import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

export default function Chats() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [threads, setThreads] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState("");
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
      } catch (err) {
        setThreads([]);
      } finally {
        setLoadingThreads(false);
      }
    };

    loadThreads();
  }, [navigate, token]);

  useEffect(() => {
    if (!chatId) {
      setSelectedChat(null);
      return;
    }

    const fetchSelectedChat = async () => {
      try {
        setLoadingChat(true);
        const res = await API.get(`/chat/${chatId}`);
        setSelectedChat(res.data);
        setError("");
      } catch (err) {
        setSelectedChat(null);
        setError(err.response?.data || "Unable to load chat.");
      } finally {
        setLoadingChat(false);
      }
    };

    fetchSelectedChat();
  }, [chatId]);

  const openChat = (thread) => {
    navigate(`/chats/${thread.id}`);
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      const res = await API.post(`/chat/${selectedChat._id}/message`, {
        text: message.trim()
      });
      setSelectedChat(res.data);
      setMessage("");
      setError("");
    } catch (err) {
      setError(err.response?.data || "Unable to send message.");
    }
  };

  const otherName = selectedChat
    ? role === "donor"
      ? selectedChat.hospitalName
      : selectedChat.donorName
    : "";

  return (
    <div style={{ background: "#fdf2f2", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: selectedChat ? "1.1fr 1fr" : "1fr", gap: 24 }}>
        <div style={{ padding: 24, background: "white", borderRadius: 20, boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)" }}>
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

          {loadingThreads ? (
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

        {selectedChat && (
          <div style={{ padding: 24, background: "white", borderRadius: 20, boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, color: "#0f172a" }}>Chat with {otherName}</h2>
                <p style={{ marginTop: 8, color: "#475569" }}>Messages remain in the thread and show new replies when available.</p>
              </div>
              <button
                style={{ background: "#ef4444", color: "white", border: "none", padding: "10px 18px", borderRadius: 12, cursor: "pointer" }}
                onClick={() => navigate("/chats")}
              >
                Back to Threads
              </button>
            </div>

            {loadingChat ? (
              <div style={{ padding: 24, borderRadius: 18, background: "#fee2e2", color: "#7f1d1d" }}>Loading conversation...</div>
            ) : (
              <>
                <div style={{ padding: 20, borderRadius: 20, border: "1px solid #fde2e2", minHeight: 340, marginBottom: 24, background: "#fee2e2" }}>
                  {selectedChat.messages.length === 0 ? (
                    <div style={{ color: "#475569" }}>No messages yet. Send the first message to start the conversation.</div>
                  ) : (
                    selectedChat.messages.map((msg, index) => (
                      <div key={index} style={{ marginBottom: 16, display: "flex", justifyContent: msg.senderRole === role ? "flex-end" : "flex-start" }}>
                        <div style={{ maxWidth: "78%", padding: 14, borderRadius: 18, background: msg.senderRole === role ? "#dc2626" : "#fee2e2", color: msg.senderRole === role ? "white" : "#0f172a" }}>
                          <div style={{ fontSize: 12, marginBottom: 6, opacity: 0.85 }}>{msg.senderRole === role ? "You" : otherName}</div>
                          <div>{msg.text}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <input
                    style={{ flex: 1, minWidth: 220, padding: 14, borderRadius: 14, border: "1px solid #cbd5e1" }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button
                    style={{ background: "#b91c1c", color: "white", border: "none", borderRadius: 14, padding: "14px 22px", cursor: "pointer" }}
                    onClick={sendMessage}
                  >
                    Send
                  </button>
                </div>
                {error && <p style={{ color: "#b91c1c", marginTop: 16 }}>{error}</p>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
