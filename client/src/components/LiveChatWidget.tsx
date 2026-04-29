/**
 * LiveChatWidget — Visitor-facing Live Chat component
 * Supports text + image messages in both directions
 * Uses Telegram API via serverless /api/live-chat endpoint
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
const GOLD = "#D4A843";
const NAVY = "#060E1A";
const FONT = "'AdorshoLipi', 'Noto Sans Bengali', sans-serif";

interface Message {
  id: string;
  text?: string;
  imageUrl?: string;
  type: "text" | "image";
  sender: "visitor" | "admin";
  timestamp: number;
}

const STORAGE_KEY = "mss_live_chat_v4";

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
  const [contactInput, setContactInput] = useState("");
  const [contactType, setContactType] = useState<"whatsapp" | "gmail" | "">("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastUpdateId, setLastUpdateId] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // base64 preview
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect contact type
  useEffect(() => {
    const val = contactInput.trim();
    if (!val) { setContactType(""); return; }
    if (val.includes("@")) setContactType("gmail");
    else if (/^[\d\s\+\-()]+$/.test(val) && val.replace(/\D/g, "").length >= 7) setContactType("whatsapp");
    else setContactType("");
  }, [contactInput]);

  // Restore session
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

  // Save session
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
        const newMsgs: Message[] = data.replies.map((r: { type: string; text?: string; imageUrl?: string; timestamp: number; updateId: number }) => ({
          id: `admin-${r.updateId}`,
          type: (r.type === "image" ? "image" : "text") as "text" | "image",
          text: r.text,
          imageUrl: r.imageUrl,
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
    if (!contactInput.trim() || !contactType) {
      setError("হোয়াটসঅ্যাপ নম্বর বা জিমেইল দেওয়া আবশ্যক।");
      return;
    }
    setIsStarting(true);
    setError("");
    try {
      const sid = generateSessionId();
      const contact = contactInput.trim();
      const res = await fetch("/api/live-chat?action=send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorName: nameInput.trim(),
          message: "🟢 নতুন সেশন শুরু হয়েছে",
          sessionId: sid,
          contact: contact || null,
          contactType: contactType || null,
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
      setMessages([{
        id: "welcome",
        type: "text",
        text: `স্বাগতম ${nameInput.trim()}! আপনার বার্তা বা ছবি পাঠান। মাহবুব সরদার সবুজ অনলাইনে থাকলে উত্তর দেবেন।${contact ? " অনলাইনে না থাকলে আপনার দেওয়া যোগাযোগ মাধ্যমে উত্তর পাঠানো হবে।" : ""}`,
        sender: "admin",
        timestamp: Date.now(),
      }]);
    } catch {
      setError("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
    } finally {
      setIsStarting(false);
    }
  };

  const sendMessage = async () => {
    if ((!inputText.trim() && !imagePreview) || !sessionId || isSending) return;
    setIsSending(true);
    setError("");

    // If image selected, send image
    if (imagePreview) {
      const tempMsg: Message = {
        id: `v-img-${Date.now()}`,
        type: "image",
        imageUrl: imagePreview,
        text: inputText.trim() || undefined,
        sender: "visitor",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, tempMsg]);
      setImagePreview(null);
      setInputText("");
      try {
        const res = await fetch("/api/live-chat?action=send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorName,
            sessionId,
            imageData: tempMsg.imageUrl,
            message: tempMsg.text || "",
          }),
        });
        const data = await res.json();
        if (!data.ok) setError("ছবি পাঠাতে সমস্যা হয়েছে।");
      } catch {
        setError("নেটওয়ার্ক সমস্যা।");
      } finally {
        setIsSending(false);
      }
      return;
    }

    // Text message
    const text = inputText.trim();
    setInputText("");
    const tempMsg: Message = {
      id: `v-${Date.now()}`,
      type: "text",
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
      if (!data.ok) setError("বার্তা পাঠাতে সমস্যা হয়েছে।");
    } catch {
      setError("নেটওয়ার্ক সমস্যা।");
    } finally {
      setIsSending(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("ছবির সাইজ ৫ MB-এর বেশি হওয়া যাবে না।");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetSession = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    localStorage.removeItem(STORAGE_KEY);
    setVisitorName("");
    setNameInput("");
    setContactInput("");
    setContactType("");
    setSessionId(null);
    setMessages([]);
    setLastUpdateId(0);
    setError("");
    setImagePreview(null);
  };

  // ── Name + Contact entry screen ────────────────────────────────────────────
  if (!sessionId) {
    const nameHasValue = nameInput.trim().length > 0;
    const contactHasValue = contactInput.trim().length > 0;
    const canStart = nameHasValue && contactHasValue && !!contactType && !isStarting;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          display: "flex", flexDirection: "column", height: "100%",
          justifyContent: "center", alignItems: "center",
          padding: "28px 22px", gap: 0,
          background: "linear-gradient(180deg, rgba(6,14,26,0) 0%, rgba(212,168,67,0.03) 100%)",
        }}
      >
        {/* Icon */}
        <div style={{
          width: 68, height: 68, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(212,168,67,0.18), rgba(212,168,67,0.06))",
          border: "1.5px solid rgba(212,168,67,0.45)",
          boxShadow: "0 0 24px rgba(212,168,67,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>

        {/* Title */}
        <h3 style={{
          color: GOLD, fontFamily: FONT, fontSize: "1.15rem", fontWeight: 700,
          margin: "0 0 8px", letterSpacing: "0.01em",
        }}>
          সরাসরি কথা বলুন
        </h3>
        <p style={{
          color: "rgba(245,238,222,0.5)", fontFamily: FONT, fontSize: "0.8rem",
          margin: "0 0 24px", lineHeight: 1.7, textAlign: "center",
        }}>
          মাহবুব সরদার সবুজের সাথে সরাসরি কথোপকথন শুরু করুন।
        </p>

        {/* Form */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Name field */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              color: nameHasValue ? GOLD : "rgba(212,168,67,0.35)",
              display: "flex", alignItems: "center", pointerEvents: "none",
              transition: "color 0.2s",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && startSession()}
              placeholder="আপনার নাম লিখুন"
              maxLength={50}
              style={{
                background: nameHasValue ? "rgba(212,168,67,0.07)" : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${nameHasValue ? "rgba(212,168,67,0.55)" : "rgba(212,168,67,0.25)"}`,
                borderRadius: 14, padding: "13px 16px 13px 40px",
                color: "#FAF6EF", fontFamily: FONT, fontSize: "0.88rem",
                outline: "none", width: "100%", boxSizing: "border-box",
                transition: "border-color 0.25s, background 0.25s",
                boxShadow: nameHasValue ? "0 0 0 3px rgba(212,168,67,0.08)" : "none",
              }}
            />
          </div>

          {/* Contact field */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              color: contactType === "whatsapp" ? "#25D366" : contactType === "gmail" ? "#4285F4" : "rgba(212,168,67,0.35)",
              display: "flex", alignItems: "center", pointerEvents: "none",
              transition: "color 0.2s",
            }}>
              {contactType === "whatsapp" ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              ) : contactType === "gmail" ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#4285F4">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.910 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              )}
            </div>
            <input
              type="text"
              value={contactInput}
              onChange={e => setContactInput(e.target.value)}
              placeholder="WhatsApp নম্বর অথবা Gmail"
              maxLength={100}
              style={{
                background: contactType === "whatsapp"
                  ? "rgba(37,211,102,0.06)"
                  : contactType === "gmail"
                  ? "rgba(66,133,244,0.06)"
                  : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${
                  contactType === "gmail" ? "rgba(66,133,244,0.5)"
                  : contactType === "whatsapp" ? "rgba(37,211,102,0.5)"
                  : "rgba(212,168,67,0.25)"
                }`,
                borderRadius: 14, padding: "13px 16px 13px 40px",
                color: "#FAF6EF", fontFamily: FONT, fontSize: "0.88rem",
                outline: "none", width: "100%", boxSizing: "border-box",
                transition: "border-color 0.25s, background 0.25s",
                boxShadow: contactType
                  ? `0 0 0 3px ${contactType === "gmail" ? "rgba(66,133,244,0.08)" : "rgba(37,211,102,0.08)"}`
                  : "none",
              }}
            />
          </div>

          {/* Helper text */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 6,
            padding: "8px 12px",
            background: contactType
              ? `${contactType === "gmail" ? "rgba(66,133,244,0.07)" : "rgba(37,211,102,0.07)"}`
              : "rgba(212,168,67,0.05)",
            borderRadius: 10,
            border: `1px solid ${
              contactType === "gmail" ? "rgba(66,133,244,0.2)"
              : contactType === "whatsapp" ? "rgba(37,211,102,0.2)"
              : "rgba(212,168,67,0.15)"
            }`,
            transition: "all 0.25s",
          }}>
            <span style={{
              color: contactType === "gmail" ? "#4285F4" : contactType === "whatsapp" ? "#25D366" : GOLD,
              fontSize: "0.85rem", lineHeight: 1, marginTop: 1, flexShrink: 0,
              transition: "color 0.2s",
            }}>✱</span>
            <p style={{
              color: contactType
                ? (contactType === "gmail" ? "rgba(66,133,244,0.9)" : "rgba(37,211,102,0.9)")
                : "rgba(245,238,222,0.45)",
              fontFamily: FONT, fontSize: "0.75rem",
              margin: 0, lineHeight: 1.6,
              transition: "color 0.2s",
            }}>
              {contactType === "whatsapp" && "হোয়াটসঅ্যাপ নম্বর নিশ্চিত হয়েছে — অনলাইনে না থাকলে হোয়াটসঅ্যাপে জানানো হবে"}
              {contactType === "gmail" && "জিমেইল নিশ্চিত হয়েছে — অনলাইনে না থাকলে ইমেইলে জানানো হবে"}
              {!contactType && "লাইভ চ্যাট শুরু করতে হোয়াটসঅ্যাপ নম্বর বা জিমেইল দিন"}
            </p>
          </div>

          {/* Submit button */}
          <button
            onClick={startSession}
            disabled={!canStart}
            style={{
              background: canStart
                ? "linear-gradient(135deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%)"
                : "rgba(212,168,67,0.12)",
              backgroundSize: canStart ? "200% 100%" : "100% 100%",
              border: canStart ? "1px solid rgba(212,168,67,0.6)" : "1px solid rgba(212,168,67,0.15)",
              borderRadius: 14, padding: "14px",
              color: canStart ? NAVY : "rgba(212,168,67,0.3)",
              fontFamily: FONT, fontSize: "0.92rem", fontWeight: 700,
              cursor: canStart ? "pointer" : "not-allowed",
              transition: "all 0.25s",
              letterSpacing: "0.02em",
              boxShadow: canStart ? "0 4px 20px rgba(212,168,67,0.25), 0 1px 0 rgba(255,255,255,0.1) inset" : "none",
              marginTop: 2,
            }}
          >
            {isStarting ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{
                  width: 14, height: 14,
                  border: "2px solid rgba(6,14,26,0.3)",
                  borderTop: "2px solid rgba(6,14,26,0.8)",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite",
                }} />
                সংযোগ হচ্ছে...
              </span>
            ) : "চ্যাট শুরু করুন →"}
          </button>
        </div>

        {error && (
          <p style={{
            color: "#f87171", fontFamily: FONT, fontSize: "0.78rem",
            textAlign: "center", marginTop: 10,
            background: "rgba(248,113,113,0.08)", padding: "8px 14px",
            borderRadius: 10, border: "1px solid rgba(248,113,113,0.2)",
          }}>{error}</p>
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
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", background: "#fbbf24",
            display: "inline-block", animation: "pulse 2s infinite",
          }} />
          <span style={{ color: "rgba(245,238,222,0.7)", fontFamily: FONT, fontSize: "0.75rem" }}>
            বার্তা পাঠানো হয়েছে — উত্তরের অপেক্ষায়
          </span>
        </div>
        <button
          onClick={resetSession}
          style={{
            background: "none", border: "none",
            color: "rgba(245,238,222,0.4)", fontFamily: FONT,
            fontSize: "0.72rem", cursor: "pointer", padding: "2px 6px",
          }}
        >
          নতুন চ্যাট
        </button>
      </div>

      {/* Messages */}
      <div
        className="chatbot-scrollbar"
        style={{
          flex: 1, overflowY: "auto", padding: "14px 12px",
          display: "flex", flexDirection: "column", gap: 10,
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
                padding: msg.type === "image" ? "6px" : "10px 14px",
                color: msg.sender === "visitor" ? NAVY : "rgba(245,238,222,0.9)",
                fontFamily: FONT, fontSize: "0.85rem", lineHeight: 1.75,
                overflow: "hidden",
              }}>
                {/* Image message */}
                {msg.type === "image" && msg.imageUrl && (
                  <div>
                    <img
                      src={msg.imageUrl}
                      alt="ছবি"
                      style={{
                        maxWidth: "100%", maxHeight: 220,
                        borderRadius: 10, display: "block",
                        cursor: "pointer",
                      }}
                      onClick={() => window.open(msg.imageUrl, "_blank")}
                    />
                    {msg.text && (
                      <p style={{ margin: "6px 8px 2px", fontSize: "0.82rem" }}>{msg.text}</p>
                    )}
                  </div>
                )}
                {/* Text message */}
                {msg.type === "text" && msg.text && (
                  <p style={{ margin: 0 }}>{msg.text}</p>
                )}
                <p style={{
                  margin: msg.type === "image" ? "2px 8px 4px" : "4px 0 0",
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

      {/* Image preview */}
      {imagePreview && (
        <div style={{
          padding: "8px 12px",
          borderTop: "1px solid rgba(212,168,67,0.12)",
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(212,168,67,0.04)",
        }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={imagePreview}
              alt="preview"
              style={{ height: 60, borderRadius: 8, display: "block", maxWidth: 100, objectFit: "cover" }}
            />
            <button
              onClick={() => setImagePreview(null)}
              style={{
                position: "absolute", top: -6, right: -6,
                width: 18, height: 18, borderRadius: "50%",
                background: "#ef4444", border: "none",
                color: "#fff", fontSize: "10px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                lineHeight: 1,
              }}
            >✕</button>
          </div>
          <span style={{ color: "rgba(245,238,222,0.5)", fontFamily: FONT, fontSize: "0.75rem" }}>
            ছবি নির্বাচিত — পাঠাতে Send বাটনে চাপুন
          </span>
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: "10px 12px",
        borderTop: "1px solid rgba(212,168,67,0.12)",
        display: "flex", gap: 8, alignItems: "flex-end",
      }}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: "none" }}
        />

        {/* Image attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="ছবি পাঠান"
          style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: imagePreview ? "rgba(212,168,67,0.25)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${imagePreview ? "rgba(212,168,67,0.6)" : "rgba(212,168,67,0.2)"}`,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={imagePreview ? GOLD : "rgba(212,168,67,0.5)"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </button>

        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={imagePreview ? "ছবির সাথে বার্তা (ঐচ্ছিক)..." : "বার্তা লিখুন..."}
          rows={1}
          style={{
            flex: 1, background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(212,168,67,0.3)", borderRadius: 12,
            padding: "10px 14px", color: "#FAF6EF", fontFamily: FONT,
            fontSize: "0.85rem", outline: "none", resize: "none", lineHeight: 1.5,
          }}
        />

        <button
          onClick={sendMessage}
          disabled={(!inputText.trim() && !imagePreview) || isSending}
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: (inputText.trim() || imagePreview) && !isSending
              ? "linear-gradient(135deg, #C9A84C, #D4A843)"
              : "rgba(212,168,67,0.15)",
            border: "none",
            cursor: (inputText.trim() || imagePreview) && !isSending ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.2s",
          }}
        >
          {isSending ? (
            <div style={{
              width: 16, height: 16,
              border: "2px solid rgba(6,14,26,0.3)",
              borderTop: "2px solid rgba(6,14,26,0.8)",
              borderRadius: "50%", animation: "spin 0.8s linear infinite",
            }} />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={(inputText.trim() || imagePreview) ? NAVY : "rgba(212,168,67,0.4)"}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </div>
      <p style={{
        color: "rgba(245,238,222,0.25)", fontFamily: FONT, fontSize: "0.68rem",
        textAlign: "center", padding: "0 0 8px", margin: 0,
      }}>
        Shift+Enter = নতুন লাইন
      </p>
    </div>
  );
}
