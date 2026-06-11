import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!role || !userId) {
      navigate("/login");
      return;
    }

    const chatId = location.state?.chatId;
    if (!chatId) {
      navigate("/chats");
      return;
    }

    fetchChat(chatId);
  }, [location, navigate, role, userId]);

  const fetchChat = async (chatId) => {
    try {
      const res = await API.get(`/chat/${chatId}`);
      setChat(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data || "Unable to load chat.");
      if ([403, 404].includes(err.response?.status)) {
        navigate("/chats");
      }
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !chat) return;

    try {
      const res = await API.post(`/chat/${chat._id}/message`, {
        text: message.trim()
      });
      setChat(res.data);
      setMessage("");
      setError("");
    } catch (err) {
      setError(err.response?.data || "Unable to send message.");
    }
  };

  if (!chat) {
    return null;
  }

  const isDonor = role === "donor";
  const otherName = isDonor ? chat.hospitalName : chat.donorName;

  return (
    <div style={{ background: "#fdf2f2", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: 24, background: "white", borderRadius: 20, boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, color: "#0f172a" }}>Chat with {otherName}</h2>
            <p style={{ marginTop: 8, color: "#475569" }}>Messages remain in the chat list and show a red badge for new replies.</p>
          </div>
          <button
            style={{ background: "#ef4444", color: "white", border: "none", padding: "10px 18px", borderRadius: 12, cursor: "pointer" }}
            onClick={() => navigate("/chats")}
          >
            Back to Chats
          </button>
        </div>

        <div style={{ padding: 20, borderRadius: 20, border: "1px solid #fde2e2", minHeight: 340, marginBottom: 24, background: "#fee2e2" }}>
          {chat.messages.length === 0 ? (
            <div style={{ color: "#475569" }}>No messages yet. Send the first message to start the conversation.</div>
          ) : (
            chat.messages.map((msg, index) => (
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
      </div>
    </div>
  );
}
