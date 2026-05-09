/**
 * LiveChatWidget — Visitor-facing Live Chat component
 * Migrated to tRPC/DB-backed flow (liveChat router)
 * Supports text messages in both directions
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { nanoid } from "nanoid";

const GOLD = "#D4A843";
const NAVY = "#060E1A";
const FONT = "'AdorshoLipi', 'Noto Sans Bengali', sans-serif";

const STORAGE_KEY = "mss_live_chat_v5";

function generateSessionId() {
  return nanoid(16);
}

function generateVisitorId() {
  return nanoid(20);
}

function formatTime(date: Date | string | number) {
  return new Date(date).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
}

interface Props {
  onClose?: () => void;
}

export default function LiveChatWidget({ onClose }: Props) {
  const [nameInput, setNameInput] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [contactType, setContactType] = useState<"whatsapp" | "gmail" | "">("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [visitorName, setVisitorName] = useState("");
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [lastMsgId, setLastMsgId] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect contact type
  useEffect(() => {
    const val = contactInput.trim();
    if (!val) { setContactType(""); return; }
    if (val.includes("@")) setContactType("gmail");
    else if (/^[\d\s\+\-()]+$/.test(val) && val.replace(/\D/g, "").length >= 7) setContactType("whatsapp");
    else setContactType("");
  }, [contactInput]);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { name, sid, vid } = JSON.parse(saved);
        if (name && sid && vid) {
          setVisitorName(name);
          setSessionId(sid);
          setVisitorId(vid);
        }
      }
    } catch {}
  }, []);

  // Save session to localStorage
  useEffect(() => {
    if (sessionId && visitorId && visitorName) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          name: visitorName,
          sid: sessionId,
          vid: visitorId,
        }));
      } catch {}
    }
  }, [sessionId, visitorId, visitorName]);

  // ── tRPC mutations & queries ──────────────────────────────────────────────
  const startSessionMutation = trpc.liveChat.startSession.useMutation();
  const sendMessageMutation = trpc.liveChat.sendMessage.useMutation();

  const { data: pollData, refetch: refetchMessages } = trpc.liveChat.pollMessages.useQuery(
    {
      sessionId: sessionId ?? "",
      visitorId: visitorId ?? "",
      afterId: lastMsgId || undefined,
    },
    {
      enabled: !!sessionId && !!visitorId,
      // Poll every 6s; pause when tab is hidden to save resources
      refetchInterval: (query) => {
        if (typeof document !== "undefined" && document.visibilityState === "hidden") return false;
        return 6000;
      },
      refetchIntervalInBackground: false,
    }
  );

  // Track last message id for polling
  useEffect(() => {
    if (pollData?.messages && pollData.messages.length > 0) {
      const maxId = Math.max(...pollData.messages.map((m) => m.id));
      setLastMsgId((prev) => Math.max(prev, maxId));
    }
  }, [pollData]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pollData?.messages]);

  // ── Start session ─────────────────────────────────────────────────────────
  const startSession = async () => {
    if (!nameInput.trim()) return;
    if (!contactInput.trim() || !contactType) {
      setError("হোয়াটসঅ্যাপ নম্বর বা জিমেইল দেওয়া আবশ্যক।");
      return;
    }
    setIsStarting(true);
    setError("");
    try {
      const vid = generateVisitorId();
      const name = nameInput.trim();

      const result = await startSessionMutation.mutateAsync({
        visitorId: vid,
        visitorName: name,
      });

      setVisitorName(name);
      setSessionId(result.sessionId);
      setVisitorId(vid);
      setLastMsgId(0);
    } catch (err) {
      setError("সংযোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsStarting(false);
    }
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!inputText.trim() || !sessionId || !visitorId) return;
    const text = inputText.trim();
    setInputText("");
    setError("");
    try {
      await sendMessageMutation.mutateAsync({
        sessionId,
        visitorId,
        content: text,
      });
      await refetchMessages();
    } catch {
      setError("বার্তা পাঠাতে সমস্যা হয়েছে।");
    }
  };

  // ── Reset session ─────────────────────────────────────────────────────────
  const resetSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setVisitorName("");
    setNameInput("");
    setContactInput("");
    setContactType("");
    setSessionId(null);
    setVisitorId(null);
    setLastMsgId(0);
    setError("");
  };

  // ── Combine all messages for display ─────────────────────────────────────
  // We get all messages from pollMessages (no afterId filter initially)
  const { data: allMessagesData } = trpc.liveChat.pollMessages.useQuery(
    {
      sessionId: sessionId ?? "",
      visitorId: visitorId ?? "",
    },
    {
      enabled: !!sessionId && !!visitorId,
      // Poll every 6s; pause when tab is hidden to save resources
      refetchInterval: (query) => {
        if (typeof document !== "undefined" && document.visibilityState === "hidden") return false;
        return 6000;
      },
      refetchIntervalInBackground: false,
    }
  );

  const messages = allMessagesData?.messages ?? [];
  const sessionStatus = allMessagesData?.sessionStatus ?? "waiting";

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
          padding: "16px 16px", gap: 0,
          background: "radial-gradient(circle at 50% 0%, rgba(212,168,67,0.08), transparent 42%), linear-gradient(180deg, rgba(6,14,26,0) 0%, rgba(212,168,67,0.025) 100%)",
        }}
      >
        {/* Icon */}
        <div style={{
          width: 50, height: 50, borderRadius: "18px",
          background: "linear-gradient(135deg, rgba(212,168,67,0.2), rgba(212,168,67,0.055))",
          border: "1px solid rgba(212,168,67,0.38)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.28), 0 0 18px rgba(212,168,67,0.10), inset 0 1px 0 rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10,
        }}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>

        {/* Title */}
        <h3 style={{
          color: GOLD, fontFamily: FONT, fontSize: "1.02rem", fontWeight: 800,
          margin: "0 0 5px", letterSpacing: "0.01em", lineHeight: 1.25,
          textShadow: "0 0 18px rgba(212,168,67,0.12)",
        }}>
          সরাসরি কথা বলুন
        </h3>
        <p style={{
          color: "rgba(245,238,222,0.48)", fontFamily: FONT, fontSize: "0.72rem",
          margin: "0 0 14px", lineHeight: 1.5, textAlign: "center",
        }}>
          নাম ও যোগাযোগ দিন—তারপর লাইভ চ্যাট শুরু করুন।
        </p>

        {/* Form */}
        <div style={{
          width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 9,
          padding: "12px",
          borderRadius: 18,
          background: "rgba(4,8,16,0.42)",
          border: "1px solid rgba(212,168,67,0.10)",
          boxShadow: "0 18px 42px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.035)",
        }}>

          {/* Name field */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              color: nameHasValue ? GOLD : "rgba(212,168,67,0.35)",
              display: "flex", alignItems: "center", pointerEvents: "none",
              transition: "color 0.2s",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                borderRadius: 12, padding: "10px 13px 10px 36px",
                color: "#FAF6EF", fontFamily: FONT, fontSize: "0.8rem",
                outline: "none", width: "100%", boxSizing: "border-box",
                transition: "border-color 0.25s, background 0.25s, box-shadow 0.25s",
                boxShadow: nameHasValue ? "0 0 0 2px rgba(212,168,67,0.08)" : "none",
              }}
            />
          </div>

          {/* Contact field */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              color: contactType === "whatsapp" ? "#25D366" : contactType === "gmail" ? "#4285F4" : "rgba(212,168,67,0.35)",
              display: "flex", alignItems: "center", pointerEvents: "none",
              transition: "color 0.2s",
            }}>
              {contactType === "whatsapp" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              ) : contactType === "gmail" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#4285F4">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.910 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              )}
            </div>
            <input
              type="text"
              value={contactInput}
              onChange={e => setContactInput(e.target.value)}
              placeholder="হোয়াটসঅ্যাপ নম্বর অথবা জিমেইল"
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
                borderRadius: 12, padding: "10px 13px 10px 36px",
                color: "#FAF6EF", fontFamily: FONT, fontSize: "0.8rem",
                outline: "none", width: "100%", boxSizing: "border-box",
                transition: "border-color 0.25s, background 0.25s, box-shadow 0.25s",
                boxShadow: contactType
                  ? `0 0 0 2px ${contactType === "gmail" ? "rgba(66,133,244,0.08)" : "rgba(37,211,102,0.08)"}`
                  : "none",
              }}
            />
          </div>

          {/* Helper text */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 6,
            padding: "7px 9px",
            background: contactType
              ? `${contactType === "gmail" ? "rgba(66,133,244,0.07)" : "rgba(37,211,102,0.07)"}`
              : "rgba(212,168,67,0.05)",
            borderRadius: 9,
            border: `1px solid ${
              contactType === "gmail" ? "rgba(66,133,244,0.2)"
              : contactType === "whatsapp" ? "rgba(37,211,102,0.2)"
              : "rgba(212,168,67,0.15)"
            }`,
            transition: "all 0.25s",
          }}>
            <p style={{
              color: contactType
                ? (contactType === "gmail" ? "rgba(66,133,244,0.9)" : "rgba(37,211,102,0.9)")
                : "rgba(245,238,222,0.45)",
              fontFamily: FONT, fontSize: "0.66rem",
              margin: 0, lineHeight: 1.45, whiteSpace: "normal",
              transition: "color 0.2s",
            }}>
              {contactType === "whatsapp" && "হোয়াটসঅ্যাপ নিশ্চিত — অফলাইনে থাকলে সেখানেই জানানো হবে।"}
              {contactType === "gmail" && "জিমেইল নিশ্চিত — অফলাইনে থাকলে ইমেইলে জানানো হবে।"}
              {!contactType && "হোয়াটসঅ্যাপ নম্বর বা জিমেইল দিন।"}
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
              borderRadius: 12, padding: "11px 12px",
              color: canStart ? NAVY : "rgba(212,168,67,0.3)",
              fontFamily: FONT, fontSize: "0.82rem", fontWeight: 800,
              cursor: canStart ? "pointer" : "not-allowed",
              transition: "all 0.25s",
              letterSpacing: "0.02em",
              boxShadow: canStart ? "0 8px 22px rgba(212,168,67,0.20), 0 1px 0 rgba(255,255,255,0.14) inset" : "none",
              marginTop: 0,
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
  const isClosed = sessionStatus === "closed";

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
            width: 8, height: 8, borderRadius: "50%",
            background: isClosed ? "#f87171" : sessionStatus === "active" ? "#4ade80" : "#fbbf24",
            display: "inline-block",
            animation: isClosed ? "none" : "pulse 2s infinite",
          }} />
          <span style={{ color: "rgba(245,238,222,0.7)", fontFamily: FONT, fontSize: "0.75rem" }}>
            {isClosed
              ? "কথোপকথন শেষ হয়েছে"
              : sessionStatus === "active"
              ? "সক্রিয় — উত্তর পাঠানো হচ্ছে"
              : "বার্তা পাঠানো হয়েছে — উত্তরের অপেক্ষায়"}
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
        {/* Welcome message */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", justifyContent: "flex-start" }}
        >
          <div style={{
            maxWidth: "80%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(212,168,67,0.18)",
            borderRadius: "4px 16px 16px 16px",
            padding: "10px 14px",
            color: "rgba(245,238,222,0.9)",
            fontFamily: FONT, fontSize: "0.85rem", lineHeight: 1.75,
          }}>
            <p style={{ margin: 0 }}>
              স্বাগতম {visitorName}! আপনার বার্তা পাঠান। মাহবুব সরদার সবুজ অনলাইনে থাকলে উত্তর দেবেন।
            </p>
          </div>
        </motion.div>

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
                fontFamily: FONT, fontSize: "0.85rem", lineHeight: 1.75,
              }}>
                <p style={{ margin: 0 }}>{msg.content}</p>
                <p style={{
                  margin: "4px 0 0",
                  fontSize: "0.7rem",
                  color: msg.sender === "visitor" ? "rgba(6,14,26,0.55)" : "rgba(245,238,222,0.35)",
                }}>
                  {formatTime(msg.createdAt)}
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

      {/* Input — disabled if session closed */}
      {!isClosed ? (
        <div style={{
          padding: "10px 12px",
          borderTop: "1px solid rgba(212,168,67,0.12)",
          display: "flex", gap: 8, alignItems: "flex-end",
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
              flex: 1, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(212,168,67,0.3)", borderRadius: 12,
              padding: "10px 14px", color: "#FAF6EF", fontFamily: FONT,
              fontSize: "0.85rem", outline: "none", resize: "none", lineHeight: 1.5,
            }}
          />

          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || sendMessageMutation.isPending}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: inputText.trim() && !sendMessageMutation.isPending
                ? "linear-gradient(135deg, #C9A84C, #D4A843)"
                : "rgba(212,168,67,0.15)",
              border: "none",
              cursor: inputText.trim() && !sendMessageMutation.isPending ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all 0.2s",
            }}
          >
            {sendMessageMutation.isPending ? (
              <div style={{
                width: 16, height: 16,
                border: "2px solid rgba(6,14,26,0.3)",
                borderTop: "2px solid rgba(6,14,26,0.8)",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={inputText.trim() ? NAVY : "rgba(212,168,67,0.4)"}
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </div>
      ) : (
        <div style={{
          padding: "12px 14px",
          borderTop: "1px solid rgba(212,168,67,0.12)",
          textAlign: "center",
        }}>
          <p style={{ color: "rgba(245,238,222,0.4)", fontFamily: FONT, fontSize: "0.75rem", margin: "0 0 8px" }}>
            এই কথোপকথনটি বন্ধ হয়ে গেছে।
          </p>
          <button
            onClick={resetSession}
            style={{
              background: "rgba(212,168,67,0.15)",
              border: "1px solid rgba(212,168,67,0.3)",
              borderRadius: 10, padding: "8px 16px",
              color: GOLD, fontFamily: FONT, fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            নতুন চ্যাট শুরু করুন
          </button>
        </div>
      )}

      <p style={{
        color: "rgba(245,238,222,0.25)", fontFamily: FONT, fontSize: "0.68rem",
        textAlign: "center", padding: "0 0 8px", margin: 0,
      }}>
        Shift+Enter = নতুন লাইন
      </p>
    </div>
  );
}
