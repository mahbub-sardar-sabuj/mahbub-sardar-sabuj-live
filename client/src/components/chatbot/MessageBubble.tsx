// client/src/components/chatbot/MessageBubble.tsx
// Extracted MessageBubble component with streaming support
import { useCallback } from "react";
import { AudioResultCard } from "./AudioResultCard";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  userAudioName?: string;
  userAudioSize?: number;
  userAudioMime?: string;
  userAudioUrl?: string;
  userAudioInstruction?: string;
  audioUrl?: string;
  audioFilename?: string;
  audioDescription?: string;
  audioAppliedSteps?: string[];
  audioIntent?: string;
  audioPipeline?: string[];
  audioTechnicalNote?: string;
  audioVocalContext?: string;
  outputSizeKB?: number;
  reaction?: "up" | "down" | null;
  isStreaming?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
  onNavigate: (path: string) => void;
  onSwitchToLive: () => void;
  onReact: (msgId: string, reaction: "up" | "down") => void;
  onCopy: (text: string, msgId: string) => void;
  authorPhoto: string;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
}

// Parse content for special tokens like [BUTTON:/path], [PHOTO], [CONTACT], [LIVE_CHAT]
function parseContent(content: string) {
  const buttons: { label: string; path: string }[] = [];
  let showPhoto = false;
  let showContact = false;
  let showLiveChat = false;

  let text = content
    .replace(/\[BUTTON:([^\]]+)\]/g, (_, path) => {
      const labels: Record<string, string> = {
        "/writings": "লেখালেখি দেখুন",
        "/ebooks": "ই-বুক দেখুন",
        "/facebook-recitations": "আবৃত্তি দেখুন",
        "/contact": "যোগাযোগ করুন",
        "/editor": "ডিজাইন স্টুডিও",
        "/": "হোমপেজে যান",
      };
      const label = labels[path] || path.replace("/", "").replace(/-/g, " ");
      buttons.push({ label, path });
      return "";
    })
    .replace(/\[PHOTO\]/g, () => { showPhoto = true; return ""; })
    .replace(/\[CONTACT\]/g, () => { showContact = true; return ""; })
    .replace(/\[LIVE_CHAT\][^\n]*/g, () => { showLiveChat = true; return ""; })
    .trim();

  return { text, buttons, showPhoto, showContact, showLiveChat };
}

// Streaming cursor component
function StreamingCursor() {
  return (
    <span style={{
      display: "inline-block",
      width: 2,
      height: "1em",
      background: "rgba(212,168,67,0.9)",
      marginLeft: 2,
      verticalAlign: "text-bottom",
      animation: "blink 0.7s step-end infinite",
    }} />
  );
}

export function MessageBubble({
  message,
  isLatest,
  onNavigate,
  onSwitchToLive,
  onReact,
  onCopy,
  authorPhoto,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  const handleCopy = useCallback(() => {
    const text = typeof message.content === "string" ? message.content : "";
    onCopy(text, message.id);
  }, [message, onCopy]);

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <div style={{
          background: "linear-gradient(135deg, #D4A843 0%, #C9A84C 50%, #B8923A 100%)",
          color: "#0A1628",
          borderRadius: "18px 18px 4px 18px",
          padding: "10px 14px",
          maxWidth: "80%",
          fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
          fontSize: "0.8rem",
          lineHeight: 1.7,
          fontWeight: 600,
          boxShadow: "0 4px 18px rgba(212,168,67,0.3), 0 2px 6px rgba(0,0,0,0.25)",
          wordBreak: "break-word",
        }}>
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="সংযুক্ত ছবি"
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: 160,
                borderRadius: 8,
                marginBottom: 7,
                objectFit: "contain",
                border: "1.5px solid rgba(10,22,40,0.12)",
              }}
            />
          )}
          {message.userAudioName ? (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: "1rem" }}>🎵</span>
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0A1628" }}>{message.userAudioName}</div>
                {message.userAudioInstruction && (
                  <div style={{ fontSize: "0.62rem", color: "rgba(10,22,40,0.65)", marginTop: 2 }}>
                    নির্দেশ: {message.userAudioInstruction}
                  </div>
                )}
              </div>
            </div>
          ) : (
            message.content
          )}
          <div style={{ fontSize: "0.55rem", color: "rgba(10,22,40,0.45)", marginTop: 3, textAlign: "right" }}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  const { text, buttons, showPhoto, showContact, showLiveChat } = parseContent(message.content);

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        marginTop: 3,
        border: "1.5px solid rgba(212,168,67,0.6)",
        boxShadow: "0 0 12px rgba(212,168,67,0.3)",
      }}>
        <img
          src={authorPhoto}
          alt="AI"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            if (t.parentElement) {
              t.parentElement.innerHTML = '<span style="color:#D4A843;font-size:9px;display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#1a2e4a;font-weight:700;">AI</span>';
            }
          }}
        />
      </div>

      <div style={{ maxWidth: "calc(100% - 44px)", flex: 1, minWidth: 0 }}>
        {/* Live chat card */}
        {showLiveChat && (
          <div style={{ marginBottom: 10 }}>
            <button
              onClick={onSwitchToLive}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 16px",
                background: "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.1) 100%)",
                border: "1px solid rgba(34,197,94,0.45)",
                borderRadius: 14,
                cursor: "pointer",
                width: "100%",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(34,197,94,0.15)",
                border: "1.5px solid rgba(34,197,94,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: "#22c55e", fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif", fontSize: "0.83rem", fontWeight: 700 }}>সরাসরি চ্যাট শুরু করুন</div>
                <div style={{ color: "rgba(134,239,172,0.6)", fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif", fontSize: "0.68rem", marginTop: 1 }}>লাইভ চ্যাটে সরাসরি কথা বলুন</div>
              </div>
            </button>
          </div>
        )}

        {/* Audio result card */}
        {message.audioUrl && (
          <AudioResultCard
            audioUrl={message.audioUrl}
            audioFilename={message.audioFilename || "edited_audio.mp3"}
            audioDescription={message.audioDescription}
            audioAppliedSteps={message.audioAppliedSteps}
            audioIntent={message.audioIntent}
            audioPipeline={message.audioPipeline}
            audioTechnicalNote={message.audioTechnicalNote}
            outputSizeKB={message.outputSizeKB}
          />
        )}

        {/* Text content */}
        {text && (
          <div style={{
            background: "linear-gradient(145deg, rgba(15,25,45,0.97) 0%, rgba(10,18,35,0.97) 100%)",
            borderRadius: "3px 14px 14px 14px",
            padding: "10px 13px",
            border: "1px solid rgba(212,168,67,0.12)",
            borderLeft: "2px solid rgba(212,168,67,0.5)",
            boxShadow: "0 3px 14px rgba(0,0,0,0.28)",
            marginBottom: buttons.length > 0 ? 7 : 0,
          }}>
            <div style={{
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.88)",
              fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {text}
              {message.isStreaming && <StreamingCursor />}
            </div>

            {/* Reaction & Copy buttons (only when not streaming) */}
            {!message.isStreaming && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7, justifyContent: "space-between" }}>
                <div style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.25)" }}>
                  {formatTime(message.timestamp)}
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button
                    onClick={() => onReact(message.id, "up")}
                    style={{
                      background: message.reaction === "up" ? "rgba(34,197,94,0.15)" : "none",
                      border: `1px solid ${message.reaction === "up" ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 6,
                      padding: "2px 6px",
                      cursor: "pointer",
                      fontSize: "0.65rem",
                      color: message.reaction === "up" ? "#22c55e" : "rgba(255,255,255,0.35)",
                    }}
                  >
                    👍
                  </button>
                  <button
                    onClick={() => onReact(message.id, "down")}
                    style={{
                      background: message.reaction === "down" ? "rgba(239,68,68,0.12)" : "none",
                      border: `1px solid ${message.reaction === "down" ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 6,
                      padding: "2px 6px",
                      cursor: "pointer",
                      fontSize: "0.65rem",
                      color: message.reaction === "down" ? "#ef4444" : "rgba(255,255,255,0.35)",
                    }}
                  >
                    👎
                  </button>
                  <button
                    onClick={handleCopy}
                    style={{
                      background: "none",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 6,
                      padding: "2px 6px",
                      cursor: "pointer",
                      fontSize: "0.65rem",
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    📋
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        {buttons.length > 0 && !message.isStreaming && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {buttons.map((btn, i) => (
              <button
                key={i}
                onClick={() => onNavigate(btn.path)}
                style={{
                  padding: "6px 12px",
                  background: "linear-gradient(135deg, rgba(212,168,67,0.15) 0%, rgba(184,146,58,0.1) 100%)",
                  border: "1px solid rgba(212,168,67,0.4)",
                  borderRadius: 20,
                  color: "rgba(212,168,67,0.9)",
                  fontSize: "0.65rem",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  letterSpacing: "0.02em",
                }}
              >
                {btn.label} →
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
