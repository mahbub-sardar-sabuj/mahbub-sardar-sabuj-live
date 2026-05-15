/**
 * AdminLiveChat — Admin panel for managing live chat sessions
 * Route: /admin/live-chat (protected, admin only)
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

const GOLD = "#D4A843";
const NAVY = "#060E1A";
const FONT = "'AdorshoLipi', 'Noto Sans Bengali', sans-serif";

function formatTime(date: Date | string) {
  return new Date(date).toLocaleString("bn-BD", {
    hour: "2-digit", minute: "2-digit",
    day: "2-digit", month: "short",
  });
}

function statusLabel(status: string) {
  if (status === "active") return { text: "সক্রিয়", color: "#4ade80" };
  if (status === "waiting") return { text: "অপেক্ষায়", color: "#fbbf24" };
  return { text: "বন্ধ", color: "#f87171" };
}

export default function AdminLiveChat() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const [lastMsgId, setLastMsgId] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessions, refetch: refetchSessions } = trpc.liveChat.adminGetSessions.useQuery(
    undefined,
    { refetchInterval: 5000 }
  );

  const { data: messages, refetch: refetchMessages } = trpc.liveChat.adminGetMessages.useQuery(
    { sessionId: selectedSession || "", afterId: undefined },
    {
      enabled: !!selectedSession,
      refetchInterval: 3000,
    }
  );

  const adminReply = trpc.liveChat.adminReply.useMutation({
    onSuccess: () => {
      setReplyInput("");
      refetchMessages();
      refetchSessions();
    },
  });

  const closeSession = trpc.liveChat.adminCloseSession.useMutation({
    onSuccess: () => {
      refetchSessions();
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleReply = async () => {
    if (!replyInput.trim() || !selectedSession) return;
    await adminReply.mutateAsync({ sessionId: selectedSession, content: replyInput.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  const selectedSessionData = sessions?.find(s => s.sessionId === selectedSession);

  return (
    <DashboardLayout>
      <div style={{
        display: "flex",
        height: "calc(100vh - 64px)",
        background: "#060C16",
        fontFamily: FONT,
        overflow: "hidden",
      }}>

        {/* ── Session List ── */}
        <div style={{
          width: 280,
          borderRight: "1px solid rgba(212,168,67,0.15)",
          display: "flex",
          flexDirection: "column",
          background: "rgba(6,12,22,0.98)",
          flexShrink: 0,
        }}>
          <div style={{
            padding: "16px 16px 12px",
            borderBottom: "1px solid rgba(212,168,67,0.12)",
            background: "rgba(5,10,20,0.98)",
          }}>
            <h2 style={{
              color: GOLD,
              fontSize: "0.95rem",
              fontWeight: 700,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              লাইভ চ্যাট
            </h2>
            <p style={{ color: "rgba(180,160,120,0.5)", fontSize: "0.72rem", margin: "4px 0 0" }}>
              {sessions?.length || 0}টি কথোপকথন
            </p>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {!sessions || sessions.length === 0 ? (
              <div style={{
                padding: 24,
                textAlign: "center",
                color: "rgba(180,160,120,0.4)",
                fontSize: "0.8rem",
              }}>
                কোনো কথোপকথন নেই
              </div>
            ) : (
              sessions.map(session => {
                const sl = statusLabel(session.status);
                const isSelected = selectedSession === session.sessionId;
                return (
                  <button
                    key={session.sessionId}
                    onClick={() => setSelectedSession(session.sessionId)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: isSelected
                        ? "rgba(212,168,67,0.1)"
                        : "transparent",
                      border: "none",
                      borderLeft: isSelected ? `3px solid ${GOLD}` : "3px solid transparent",
                      borderBottom: "1px solid rgba(212,168,67,0.07)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{
                        color: isSelected ? GOLD : "rgba(245,238,222,0.85)",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                      }}>
                        {session.visitorName || "অতিথি"}
                      </span>
                      <span style={{
                        fontSize: "0.65rem",
                        color: sl.color,
                        background: `${sl.color}18`,
                        padding: "2px 7px",
                        borderRadius: 8,
                        fontWeight: 600,
                      }}>
                        {sl.text}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                      <span style={{ color: "rgba(180,160,120,0.45)", fontSize: "0.65rem" }}>
                        {formatTime(session.lastMessageAt)}
                      </span>
                      {session.visitorContact && (
                        <span style={{
                          fontSize: "0.58rem",
                          color: session.visitorContactType === "whatsapp" ? "rgba(74,222,128,0.7)" : session.visitorContactType === "gmail" ? "rgba(96,165,250,0.7)" : "rgba(180,160,120,0.5)",
                          background: "rgba(255,255,255,0.04)",
                          padding: "1px 5px",
                          borderRadius: 4,
                          maxWidth: 130,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {session.visitorContactType === "whatsapp" ? "📲" : session.visitorContactType === "gmail" ? "📧" : "📌"} {session.visitorContact}
                        </span>
                      )}
                    </div>
                    {!session.adminRead && session.status === "active" && (
                      <div style={{
                        marginTop: 4,
                        display: "inline-block",
                        background: "#ef4444",
                        color: "#fff",
                        fontSize: "0.6rem",
                        padding: "1px 6px",
                        borderRadius: 8,
                        fontWeight: 700,
                      }}>
                        নতুন বার্তা
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!selectedSession ? (
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(180,160,120,0.35)",
              gap: 12,
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,67,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p style={{ fontFamily: FONT, fontSize: "0.85rem" }}>বাম দিক থেকে একটি কথোপকথন বেছে নিন</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{
                padding: "12px 18px",
                borderBottom: "1px solid rgba(212,168,67,0.15)",
                background: "rgba(5,10,20,0.98)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}>
                <div>
                  <div style={{ color: GOLD, fontWeight: 700, fontSize: "0.9rem" }}>
                    {selectedSessionData?.visitorName || "অতিথি"}
                  </div>
                  {selectedSessionData?.visitorContact && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                      <span style={{
                        fontSize: "0.65rem",
                        color: selectedSessionData.visitorContactType === "whatsapp" ? "#4ade80" : selectedSessionData.visitorContactType === "gmail" ? "#60a5fa" : "rgba(180,160,120,0.7)",
                        background: selectedSessionData.visitorContactType === "whatsapp" ? "rgba(74,222,128,0.1)" : selectedSessionData.visitorContactType === "gmail" ? "rgba(96,165,250,0.1)" : "rgba(180,160,120,0.08)",
                        padding: "1px 7px",
                        borderRadius: 6,
                        fontWeight: 600,
                        border: `1px solid ${selectedSessionData.visitorContactType === "whatsapp" ? "rgba(74,222,128,0.25)" : selectedSessionData.visitorContactType === "gmail" ? "rgba(96,165,250,0.25)" : "rgba(180,160,120,0.15)"}`,
                      }}>
                        {selectedSessionData.visitorContactType === "whatsapp" ? "📲 WA" : selectedSessionData.visitorContactType === "gmail" ? "📧 Gmail" : "📌"}
                      </span>
                      <span style={{ color: "rgba(245,238,222,0.75)", fontSize: "0.72rem", fontFamily: FONT }}>
                        {selectedSessionData.visitorContact}
                      </span>
                    </div>
                  )}
                  <div style={{ color: "rgba(180,160,120,0.5)", fontSize: "0.7rem", marginTop: 2 }}>
                    সেশন: {selectedSession}
                  </div>
                </div>
                {selectedSessionData?.status !== "closed" && (
                  <button
                    onClick={() => closeSession.mutate({ sessionId: selectedSession })}
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#f87171",
                      borderRadius: 10,
                      padding: "6px 14px",
                      fontSize: "0.75rem",
                      fontFamily: FONT,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    কথোপকথন বন্ধ করুন
                  </button>
                )}
              </div>

              {/* Messages */}
              <div
                className="chatbot-scrollbar"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {messages?.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      justifyContent: msg.sender === "admin" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={{
                      maxWidth: "70%",
                      background: msg.sender === "admin"
                        ? "linear-gradient(135deg, #C9A84C, #D4A843)"
                        : "rgba(16,28,48,0.95)",
                      color: msg.sender === "admin" ? NAVY : "rgba(245,238,222,0.9)",
                      borderRadius: msg.sender === "admin" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                      padding: "10px 14px",
                      fontFamily: FONT,
                      fontSize: "0.85rem",
                      lineHeight: 1.7,
                      border: msg.sender === "visitor" ? "1px solid rgba(212,168,67,0.15)" : "none",
                    }}>
                      <div style={{
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        marginBottom: 4,
                        color: msg.sender === "admin" ? "rgba(10,22,40,0.6)" : GOLD,
                      }}>
                        {msg.sender === "admin" ? "আপনি (অ্যাডমিন)" : selectedSessionData?.visitorName || "ভিজিটর"}
                      </div>
                      <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>
                      <div style={{
                        fontSize: "0.6rem",
                        color: msg.sender === "admin" ? "rgba(10,22,40,0.45)" : "rgba(180,160,120,0.4)",
                        marginTop: 4,
                        textAlign: "right",
                      }}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                {selectedSessionData?.status === "closed" && (
                  <div style={{
                    textAlign: "center",
                    color: "rgba(248,113,113,0.6)",
                    fontSize: "0.75rem",
                    fontFamily: FONT,
                    padding: "8px 0",
                  }}>
                    — কথোপকথন শেষ হয়েছে —
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              {selectedSessionData?.status !== "closed" && (
                <div style={{
                  padding: "12px 18px",
                  borderTop: "1px solid rgba(212,168,67,0.12)",
                  background: "rgba(5,10,20,0.98)",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-end",
                  flexShrink: 0,
                }}>
                  <textarea
                    value={replyInput}
                    onChange={e => setReplyInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="উত্তর লিখুন... (Enter = পাঠান, Shift+Enter = নতুন লাইন)"
                    rows={2}
                    style={{
                      flex: 1,
                      background: "rgba(12,22,38,0.9)",
                      border: "1px solid rgba(212,168,67,0.25)",
                      borderRadius: 12,
                      padding: "10px 14px",
                      color: "#FAF6EF",
                      fontFamily: FONT,
                      fontSize: "0.85rem",
                      resize: "none",
                      outline: "none",
                      lineHeight: 1.6,
                    }}
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyInput.trim() || adminReply.isPending}
                    style={{
                      padding: "10px 20px",
                      background: replyInput.trim()
                        ? "linear-gradient(135deg, #C9A84C, #D4A843)"
                        : "rgba(212,168,67,0.15)",
                      border: "none",
                      borderRadius: 12,
                      color: replyInput.trim() ? NAVY : "rgba(212,168,67,0.4)",
                      fontFamily: FONT,
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: replyInput.trim() ? "pointer" : "not-allowed",
                      flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                  >
                    {adminReply.isPending ? "পাঠানো হচ্ছে..." : "পাঠান →"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
