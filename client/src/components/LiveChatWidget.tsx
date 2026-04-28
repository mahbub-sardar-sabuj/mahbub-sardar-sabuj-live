/**
 * LiveChatWidget — Visitor-facing Live Chat component
 * Uses Telegram API via serverless /api/live-chat endpoint
 * No database required — messages go directly to Telegram
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GOLD = "#D4A843";
const NAVY = "#060E1A";
const FONT = "'AdorshoLipi', 'Noto Sans Bengali', sans-serif";

interface Message {
  id: string;
  text: string;
  sender: "visitor" | "admin";
  timestamp: number;
}

const STORAGE_KEY = "mss_live_chat_v2";

function generateSessionId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
}

interface Props {
  onClose?: () => void;
}

export default function LiveChatWidget({ onClose }: Props) {
  const [visitorName, setVisitorName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastUpdateId, setLastUpdateId] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { name, sid, msgs, lastId } = JSON.parse(saved);
        setVisitorName(name || "");
        setSessionId(sid || null);
        setMessages(msgs || []);
        setLastUpdateId(lastId || (Date.now() - 7 * 24 * 60 * 60 * 1000));
      }
    } catch {}
  }, []);

  // Save session to localStorage
  useEffect(() => {
    if (sessionId) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ name: visitorName, sid: sessionId, msgs: messages, lastId: lastUpdateId })
        );
      } catch {}
    }
  }, [sessionId, visitorName, messages, lastUpdateId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for replies
  const pollReplies = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(
        `/api/live-chat?action=poll&sessionId=${encodeURIComponent(sessionId)}&since=${lastUpdateId}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.ok && data.replies && data.replies.length > 0) {
        const newMsgs: Message[] = data.replies.map((r: { text: string; timestamp: number; updateId: number }) => ({
          id: `admin-${r.updateId}`,
          text: r.text,
          sender: "admin" as const,
          timestamp: r.timestamp,
        }));
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const fresh = newMsgs.filter(m => !existingIds.has(m.id));
          return fresh.length > 0 ? [...prev, ...fresh] : prev;
        });
      }
      if (data.ok && typeof data.lastUpdateId === "number" && data.lastUpdateId > lastUpdateId) {
        setLastUpdateId(data.lastUpdateId);
      }
    } catch {}
  }, [sessionId, lastUpdateId]);

  // Start/stop polling
  useEffect(() => {
    if (sessionId) {
      pollReplies();
      pollRef.current = setInterval(pollReplies, 4000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [sessionId, pollReplies]);

  const startSession = async () => {
    if (!nameInput.trim()) return;
    setIsStarting(true);
    setError("");
    try {
      const sid = generateSessionId();
      // Send a "session started" notification to Telegram
      const res = await fetch("/api/live-chat?action=send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorName: nameInput.trim(),
          message: "🟢 নতুন সেশন শুরু হয়েছে",
          sessionId: sid,
          isSystemMessage: true,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError("সংযোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        return;
      }
      setVisitorName(nameInput.trim());
      setSessionId(sid);
      setMessages([
        {
          id: "welcome",
          text: `স্বাগতম ${nameInput.trim()}! আপনার বার্তা পাঠান। মাহবুব সরদার সবুজ অনলাইনে থাকলে উত্তর দেবেন।`,
          sender: "admin",
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setError("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
    } finally {
      setIsStarting(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !sessionId || isSending) return;
    const text = inputText.trim();
    setInputText("");
    setIsSending(true);
    setError("");

    const tempMsg: Message = {
      id: `v-${Date.now()}`,
      text,
      sender: "visitor",
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/live-chat?action=send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorName, message: text, sessionId }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError("বার্তা পাঠাতে সমস্যা হয়েছে।");
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
    } finally {
      setIsSending(false);
    }
  };

  const resetSession = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    localStorage.removeItem(STORAGE_KEY);
    setVisitorName("");
    setNameInput("");
    setSessionId(null);
    setMessages([]);
    setLastUpdateId(0);
    setError("");
  };

  // ── Name entry screen ──────────────────────────────────────────────────────
  if (!sessionId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px 20px",
          gap: 16,
        }}
      >
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(212,168,67,0.2), rgba(212,168,67,0.08))",
          border: "2px solid rgba(212,168,67,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 4,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ color: GOLD, fontFamily: FONT, fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
            সরাসরি কথা বলুন
          </h3>
          <p style={{ color: "rgba(245,238,222,0.65)", fontFamily: FONT, fontSize: "0.82rem", marginTop: 6, lineHeight: 1.7 }}>
            মাহবুব সরদার সবুজের সাথে সরাসরি কথোপকথন শুরু করুন।
            তিনি অনলাইনে থাকলে উত্তর দেবেন।
          </p>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && startSession()}
            placeholder="আপনার নাম লিখুন..."
            maxLength={50}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(212,168,67,0.35)",
              borderRadius: 12,
              padding: "12px 16px",
              color: "#FAF6EF",
              fontFamily: FONT,
              fontSize: "0.88rem",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={startSession}
            disabled={!nameInput.trim() || isStarting}
            style={{
              background: nameInput.trim() && !isStarting
                ? "linear-gradient(135deg, #C9A84C, #D4A843)"
                : "rgba(212,168,67,0.2)",
              border: "none",
              borderRadius: 12,
              padding: "12px",
              color: nameInput.trim() && !isStarting ? NAVY : "rgba(212,168,67,0.4)",
              fontFamily: FONT,
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: nameInput.trim() && !isStarting ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            {isStarting ? "সংযোগ হচ্ছে..." : "চ্যাট শুরু করুন →"}
          </button>
        </div>

        {error && (
          <p style={{ color: "#f87171", fontFamily: FONT, fontSize: "0.78rem", textAlign: "center" }}>{error}</p>
        )}
      </motion.div>
    );
  }

  // ── Chat screen ────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Status bar */}
      <div style={{
        padding: "8px 14px",
        background: "rgba(212,168,67,0.06)",
        borderBottom: "1px solid rgba(212,168,67,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#fbbf24",
            display: "inline-block",
            animation: "pulse 2s infinite",
          }} />
          <span style={{ color: "rgba(245,238,222,0.7)", fontFamily: FONT, fontSize: "0.75rem" }}>
            বার্তা পাঠানো হয়েছে — উত্তরের অপেক্ষায়
          </span>
        </div>
        <button
          onClick={resetSession}
          style={{
            background: "none",
            border: "none",
            color: "rgba(245,238,222,0.4)",
            fontFamily: FONT,
            fontSize: "0.72rem",
            cursor: "pointer",
            padding: "2px 6px",
          }}
        >
          নতুন চ্যাট
        </button>
      </div>

      {/* Messages */}
      <div
        className="chatbot-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                display: "flex",
                justifyContent: msg.sender === "visitor" ? "flex-end" : "flex-start",
              }}
            >
              <div style={{
                maxWidth: "80%",
                background: msg.sender === "visitor"
                  ? "linear-gradient(135deg, #C9A84C, #D4A843)"
                  : "rgba(255,255,255,0.06)",
                border: msg.sender === "visitor" ? "none" : "1px solid rgba(212,168,67,0.18)",
                borderRadius: msg.sender === "visitor" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                padding: "10px 14px",
                color: msg.sender === "visitor" ? NAVY : "rgba(245,238,222,0.9)",
                fontFamily: FONT,
                fontSize: "0.85rem",
                lineHeight: 1.75,
              }}>
                <p style={{ margin: 0 }}>{msg.text}</p>
                <p style={{
                  margin: "4px 0 0",
                  fontSize: "0.7rem",
                  color: msg.sender === "visitor" ? "rgba(6,14,26,0.55)" : "rgba(245,238,222,0.35)",
                }}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "4px 14px" }}>
          <p style={{ color: "#f87171", fontFamily: FONT, fontSize: "0.75rem", textAlign: "center", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: "10px 12px",
        borderTop: "1px solid rgba(212,168,67,0.12)",
        display: "flex",
        gap: 8,
        alignItems: "flex-end",
      }}>
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="বার্তা লিখুন..."
          rows={1}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(212,168,67,0.3)",
            borderRadius: 12,
            padding: "10px 14px",
            color: "#FAF6EF",
            fontFamily: FONT,
            fontSize: "0.85rem",
            outline: "none",
            resize: "none",
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputText.trim() || isSending}
          style={{
            width: 40, height: 40,
            borderRadius: 12,
            background: inputText.trim() && !isSending
              ? "linear-gradient(135deg, #C9A84C, #D4A843)"
              : "rgba(212,168,67,0.15)",
            border: "none",
            cursor: inputText.trim() && !isSending ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.2s",
          }}
        >
          {isSending ? (
            <div style={{
              width: 16, height: 16,
              border: "2px solid rgba(6,14,26,0.3)",
              borderTop: "2px solid rgba(6,14,26,0.8)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={inputText.trim() ? NAVY : "rgba(212,168,67,0.4)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </div>
      <p style={{ color: "rgba(245,238,222,0.25)", fontFamily: FONT, fontSize: "0.68rem", textAlign: "center", padding: "0 0 8px", margin: 0 }}>
        Shift+Enter = নতুন লাইন
      </p>
    </div>
  );
}
