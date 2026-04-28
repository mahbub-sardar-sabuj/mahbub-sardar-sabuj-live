/**
 * LiveChatWidget — Visitor-facing Live Chat component
 * Integrates into AIChatbot as a "Live Chat" mode tab
 * Design: matches "Ink & Gold" theme
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

// ── Visitor ID (browser-persistent) ──────────────────────────────────────────
function getVisitorId(): string {
  const KEY = "mss_visitor_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(KEY, id);
  }
  return id;
}

interface LiveMessage {
  id: number;
  sender: "visitor" | "admin";
  content: string;
  createdAt: Date | string;
}

const GOLD = "#D4A843";
const NAVY = "#060E1A";
const FONT = "'AdorshoLipi', 'Noto Sans Bengali', sans-serif";

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
}

interface Props {
  onClose?: () => void;
}

export default function LiveChatWidget({ onClose }: Props) {
  const visitorId = getVisitorId();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [input, setInput] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<"waiting" | "active" | "closed">("waiting");
  const [lastId, setLastId] = useState<number>(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSession = trpc.liveChat.startSession.useMutation();
  const sendMessage = trpc.liveChat.sendMessage.useMutation();

  // Poll for new messages
  const { data: pollData, refetch: refetchMessages } = trpc.liveChat.pollMessages.useQuery(
    { sessionId: sessionId || "", visitorId, afterId: lastId || undefined },
    {
      enabled: !!sessionId,
      refetchInterval: 3000,
      refetchIntervalInBackground: false,
    }
  );

  useEffect(() => {
    if (pollData?.messages && pollData.messages.length > 0) {
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMsgs = pollData.messages.filter(m => !existingIds.has(m.id));
        if (newMsgs.length === 0) return prev;
        const maxId = Math.max(...pollData.messages.map(m => m.id));
        setLastId(maxId);
        return [...prev, ...newMsgs];
      });
    }
    if (pollData?.sessionStatus) {
      setSessionStatus(pollData.sessionStatus as "waiting" | "active" | "closed");
    }
  }, [pollData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check localStorage for existing session
  useEffect(() => {
    const savedSession = localStorage.getItem("mss_live_session");
    const savedName = localStorage.getItem("mss_visitor_name");
    if (savedSession) {
      setSessionId(savedSession);
      setNameSubmitted(true);
      if (savedName) setVisitorName(savedName);
    }
  }, []);

  const handleStartChat = async () => {
    if (!visitorName.trim()) return;
    try {
      const result = await startSession.mutateAsync({ visitorId, visitorName: visitorName.trim() });
      setSessionId(result.sessionId);
      setNameSubmitted(true);
      localStorage.setItem("mss_live_session", result.sessionId);
      localStorage.setItem("mss_visitor_name", visitorName.trim());
    } catch {
      setError("সেশন শুরু করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId || sending) return;
    if (sessionStatus === "closed") {
      setError("এই কথোপকথনটি বন্ধ হয়ে গেছে।");
      return;
    }
    setSending(true);
    setError(null);
    const content = input.trim();
    setInput("");

    // Optimistic update
    const tempMsg: LiveMessage = {
      id: Date.now(),
      sender: "visitor",
      content,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await sendMessage.mutateAsync({ sessionId, content, visitorId });
    } catch {
      setError("বার্তা পাঠাতে সমস্যা হয়েছে।");
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Name entry screen ─────────────────────────────────────────────────────
  if (!nameSubmitted) {
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
            value={visitorName}
            onChange={e => setVisitorName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleStartChat()}
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
            onClick={handleStartChat}
            disabled={!visitorName.trim() || startSession.isPending}
            style={{
              background: visitorName.trim()
                ? "linear-gradient(135deg, #C9A84C, #D4A843)"
                : "rgba(212,168,67,0.2)",
              border: "none",
              borderRadius: 12,
              padding: "12px",
              color: visitorName.trim() ? NAVY : "rgba(212,168,67,0.4)",
              fontFamily: FONT,
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: visitorName.trim() ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            {startSession.isPending ? "শুরু হচ্ছে..." : "চ্যাট শুরু করুন →"}
          </button>
        </div>

        {error && (
          <p style={{ color: "#f87171", fontFamily: FONT, fontSize: "0.78rem", textAlign: "center" }}>{error}</p>
        )}
      </motion.div>
    );
  }

  // ── Chat screen ───────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Status bar */}
      <div style={{
        padding: "8px 14px",
        background: "rgba(212,168,67,0.06)",
        borderBottom: "1px solid rgba(212,168,67,0.12)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: sessionStatus === "active" ? "#4ade80" : sessionStatus === "closed" ? "#f87171" : "#fbbf24",
          display: "inline-block",
          boxShadow: sessionStatus === "active" ? "0 0 6px #4ade80" : "none",
        }} />
        <span style={{ color: "rgba(245,238,222,0.7)", fontFamily: FONT, fontSize: "0.75rem" }}>
          {sessionStatus === "active"
            ? "সক্রিয় — লেখক অনলাইনে আছেন"
            : sessionStatus === "closed"
            ? "কথোপকথন বন্ধ হয়েছে"
            : "অপেক্ষা করুন — লেখককে জানানো হচ্ছে"}
        </span>
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
        {/* Welcome message */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(212,168,67,0.07)",
              border: "1px solid rgba(212,168,67,0.15)",
              borderRadius: "4px 16px 16px 16px",
              padding: "12px 14px",
              color: "rgba(245,238,222,0.75)",
              fontFamily: FONT,
              fontSize: "0.82rem",
              lineHeight: 1.8,
            }}
          >
            আপনার বার্তা পাঠান। মাহবুব সরদার সবুজ অনলাইনে থাকলে সরাসরি উত্তর দেবেন।
          </motion.div>
        )}

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
                  ? "linear-gradient(135deg, #C9A84C 0%, #D4A843 100%)"
                  : "linear-gradient(145deg, rgba(16,28,48,0.98), rgba(12,22,40,0.98))",
                color: msg.sender === "visitor" ? NAVY : "rgba(245,238,222,0.9)",
                borderRadius: msg.sender === "visitor" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                padding: "10px 14px",
                fontFamily: FONT,
                fontSize: "0.84rem",
                lineHeight: 1.7,
                fontWeight: msg.sender === "visitor" ? 600 : 400,
                border: msg.sender === "admin" ? "1px solid rgba(212,168,67,0.18)" : "none",
                boxShadow: msg.sender === "visitor"
                  ? "0 4px 14px rgba(212,168,67,0.25)"
                  : "0 2px 10px rgba(0,0,0,0.2)",
              }}>
                {msg.sender === "admin" && (
                  <div style={{ color: GOLD, fontSize: "0.7rem", fontWeight: 700, marginBottom: 4 }}>
                    মাহবুব সরদার সবুজ
                  </div>
                )}
                <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>
                <div style={{
                  fontSize: "0.6rem",
                  color: msg.sender === "visitor" ? "rgba(10,22,40,0.5)" : "rgba(180,160,120,0.5)",
                  marginTop: 4,
                  textAlign: "right",
                }}>
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sessionStatus === "closed" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: "center",
              color: "rgba(248,113,113,0.7)",
              fontFamily: FONT,
              fontSize: "0.75rem",
              padding: "8px 0",
            }}
          >
            — কথোপকথন শেষ হয়েছে —
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "6px 14px",
          color: "#f87171",
          fontFamily: FONT,
          fontSize: "0.75rem",
          background: "rgba(248,113,113,0.08)",
        }}>
          {error}
        </div>
      )}

      {/* Input */}
      {sessionStatus !== "closed" && (
        <div style={{
          padding: "10px 12px",
          borderTop: "1px solid rgba(212,168,67,0.12)",
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="বার্তা লিখুন..."
            rows={1}
            maxLength={2000}
            className="chatbot-input chatbot-scrollbar"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(212,168,67,0.25)",
              borderRadius: 12,
              padding: "10px 12px",
              color: "#FAF6EF",
              fontFamily: FONT,
              fontSize: "0.84rem",
              resize: "none",
              outline: "none",
              lineHeight: 1.6,
              maxHeight: 80,
              overflowY: "auto",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            style={{
              width: 40, height: 40,
              borderRadius: "50%",
              background: input.trim()
                ? "linear-gradient(135deg, #C9A84C, #D4A843)"
                : "rgba(212,168,67,0.15)",
              border: "none",
              cursor: input.trim() ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={input.trim() ? NAVY : "rgba(212,168,67,0.4)"}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
