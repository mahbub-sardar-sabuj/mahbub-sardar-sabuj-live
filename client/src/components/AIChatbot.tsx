import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  imageAnalysis?: boolean;
  reaction?: string;
  isStreaming?: boolean;
}
interface ActionButton {
  label: string;
  path: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function formatTime(date: Date): string {
  return date.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
}
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function extractBase64(dataUrl: string): { base64: string; mimeType: string } {
  const [header, base64] = dataUrl.split(",");
  const mimeType = header.match(/data:([^;]+)/)?.[1] || "image/jpeg";
  return { base64, mimeType };
}

// ── LocalStorage chat history ─────────────────────────────────────────────────
const STORAGE_KEY = "mss_chat_history_v2";
function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch {
    return [];
  }
}
function saveHistory(messages: Message[]) {
  try {
    const toSave = messages.slice(-50).map(m => ({
      ...m,
      isStreaming: false,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
}

// ── Streaming AI call ─────────────────────────────────────────────────────────
async function callAIStream(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);
  try {
    const res = await fetch("/api/chat-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok || !res.body) {
      // Fallback to non-streaming
      const data = await res.json().catch(() => ({}));
      onError(data?.error || "API error");
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === "data: [DONE]") { onDone(); return; }
        if (trimmed.startsWith("data: ")) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            if (json.error) { onError(json.error); return; }
            if (json.token) onToken(json.token);
          } catch {}
        }
      }
    }
    onDone();
  } catch (err: any) {
    clearTimeout(timeoutId);
    onError(err?.message || "connection_failed");
  }
}

// ── Non-streaming fallback ────────────────────────────────────────────────────
async function callAI(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  attempt = 0
): Promise<string> {
  const MAX_RETRIES = 3;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      if (res.status >= 500 && attempt < MAX_RETRIES - 1) {
        await delay(Math.pow(2, attempt) * 1000);
        return callAI(messages, attempt + 1);
      }
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    return data.reply || "দুঃখিত, উত্তর দিতে পারছি না।";
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (attempt < MAX_RETRIES - 1) {
      const isAborted = err?.name === "AbortError";
      const isNetworkError = err?.name === "TypeError";
      if (isAborted || isNetworkError) {
        await delay(Math.pow(2, attempt) * 1000);
        return callAI(messages, attempt + 1);
      }
    }
    throw new Error("connection_failed");
  }
}

// ── AI Vision API call ────────────────────────────────────────────────────────
async function callAIVision(
  imageDataUrl: string,
  userText: string,
  attempt = 0
): Promise<string> {
  const MAX_RETRIES = 2;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);
  try {
    const { base64, mimeType } = extractBase64(imageDataUrl);
    const res = await fetch("/api/chat-vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, mimeType, userText }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      if (attempt < MAX_RETRIES - 1) {
        await delay(2000);
        return callAIVision(imageDataUrl, userText, attempt + 1);
      }
      throw new Error(`Vision API error: ${res.status}`);
    }
    const data = await res.json();
    return data.reply || "ছবিটি বিশ্লেষণ করতে পারছি না।";
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (attempt < MAX_RETRIES - 1) {
      await delay(2000);
      return callAIVision(imageDataUrl, userText, attempt + 1);
    }
    throw new Error("vision_failed");
  }
}

// ── Page map ──────────────────────────────────────────────────────────────────
const AUTHOR_PHOTO = "/images/author-photo.jpg";
const PAGE_MAP: { path: string; label: string; keywords: string[] }[] = [
  { path: "/", label: "হোম পেজ", keywords: ["হোম", "মূল পেজ"] },
  { path: "/about", label: "পরিচিতি পেজ", keywords: ["পরিচয়", "জীবনী"] },
  { path: "/ebooks", label: "ই-বুক পেজ", keywords: ["বই", "ই-বুক"] },
  { path: "/writings", label: "লেখালেখি পেজ", keywords: ["লেখা", "কবিতা"] },
  { path: "/contact", label: "যোগাযোগ পেজ", keywords: ["যোগাযোগ"] },
  { path: "/editor", label: "সরদার ডিজাইন স্টুডিও", keywords: ["এডিটর", "ডিজাইন"] },
  { path: "/facebook-recitations", label: "Facebook আবৃত্তি", keywords: ["আবৃত্তি"] },
];
const PHOTO_KEYWORDS = ["ছবি", "photo", "picture", "দেখাও", "দেখতে চাই"];
function isPhotoRequest(text: string): boolean {
  return PHOTO_KEYWORDS.some(k => text.toLowerCase().includes(k));
}

// ── Suggestions ───────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "মাহবুব সরদার সবুজের পরিচয় দাও",
  "তার ই-বুকগুলো কোথায় পাব?",
  "ডিজাইন স্টুডিও কীভাবে ব্যবহার করব?",
  "তার বিখ্যাত লেখাগুলো কী কী?",
  "ভালোবাসার কবিতা কোথায় পাব?",
  "যোগাযোগ করব কীভাবে?",
];

// ── Reactions ─────────────────────────────────────────────────────────────────
const REACTIONS = ["❤️", "👍", "😊", "🔥", "👏"];

// ── Parse AI response ─────────────────────────────────────────────────────────
function parseContent(raw: string): { text: string; buttons: ActionButton[]; showPhoto: boolean } {
  const buttons: ActionButton[] = [];
  const seen = new Set<string>();
  let showPhoto = false;
  let text = raw.replace(/\[PHOTO\]/gi, () => { showPhoto = true; return ""; });
  text = text.replace(/\[BUTTON:(\/[^\]]*)\]/g, (_, path) => {
    if (!seen.has(path)) {
      seen.add(path);
      const page = PAGE_MAP.find(p => p.path === path);
      buttons.push({ path, label: page?.label || "বিস্তারিত জানুন" });
    }
    return "";
  });
  text = text.replace(
    new RegExp(`https?://mahbub-sardar-sabuj-live\\.vercel\\.app(/[^\\s)>"]*)`,"g"),
    (_, path) => {
      const cleanPath = path || "/";
      if (!seen.has(cleanPath)) {
        seen.add(cleanPath);
        const page = PAGE_MAP.find(p => p.path === cleanPath);
        buttons.push({ path: cleanPath, label: page?.label || "বিস্তারিত জানুন" });
      }
      return "";
    }
  );
  text = text.replace(/:\s*\n\n/g, ":\n").replace(/\n{3,}/g, "\n\n").trim();
  return { text, buttons, showPhoto };
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-start gap-2 mb-3"
    >
      <div className="w-7 h-7 rounded-full overflow-hidden border border-[#D4A843] flex-shrink-0 mt-1" style={{ boxShadow: "0 0 8px rgba(212,168,67,0.4)" }}>
        <img src={AUTHOR_PHOTO} alt="AI" className="w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style="color:#D4A843;font-size:9px;display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#1a2e4a;">AI</span>'; }} />
      </div>
      <div style={{
        background: "rgba(20,35,55,0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(212,168,67,0.2)",
        borderRadius: "4px 16px 16px 16px",
        padding: "10px 14px",
        display: "flex",
        gap: 5,
        alignItems: "center",
      }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={{ width: 7, height: 7, borderRadius: "50%", background: "#D4A843" }}
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({
  message,
  onNavigate,
  onReact,
  onCopy,
}: {
  message: Message;
  onNavigate: (path: string) => void;
  onReact: (id: string, emoji: string) => void;
  onCopy: (text: string) => void;
}) {
  const isUser = message.role === "user";
  const [showReactions, setShowReactions] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="flex justify-end mb-3"
      >
        <div style={{ maxWidth: "85%", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          {message.imageUrl && (
            <div style={{ position: "relative" }}>
              <img
                src={message.imageUrl}
                alt="আপলোড করা ছবি"
                style={{
                  maxWidth: 180,
                  maxHeight: 180,
                  borderRadius: 14,
                  border: "2px solid rgba(212,168,67,0.5)",
                  objectFit: "cover",
                  display: "block",
                  boxShadow: "0 4px 20px rgba(212,168,67,0.2)",
                }}
              />
            </div>
          )}
          {message.content && (
            <div style={{
              background: "linear-gradient(135deg, #C9A84C, #D4A843)",
              color: "#0A1628",
              borderRadius: "18px 18px 4px 18px",
              padding: "10px 14px",
              fontFamily: "'Noto Sans Bengali', sans-serif",
              fontSize: "0.82rem",
              lineHeight: 1.6,
              fontWeight: 500,
              boxShadow: "0 4px 15px rgba(212,168,67,0.3)",
            }}>
              {message.content}
            </div>
          )}
          <div style={{
            fontSize: "0.6rem",
            color: "rgba(253,246,236,0.35)",
            fontFamily: "'Noto Sans Bengali', sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <button onClick={handleCopy} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(212,168,67,0.5)", fontSize: "0.65rem", padding: 0 }}>
              {copied ? "✓ কপি" : "কপি"}
            </button>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </motion.div>
    );
  }

  // AI message
  const { text, buttons, showPhoto } = parseContent(message.content);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex items-start gap-2 mb-3"
    >
      <div className="flex-shrink-0 mt-1" style={{ position: "relative" }}>
        <div style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          overflow: "hidden",
          border: "1.5px solid #D4A843",
          boxShadow: "0 0 10px rgba(212,168,67,0.5)",
        }}>
          <img src={AUTHOR_PHOTO} alt="AI" style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style="color:#D4A843;font-size:9px;display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#1a2e4a;">AI</span>'; }} />
        </div>
        <div style={{
          position: "absolute",
          bottom: -1,
          right: -1,
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: "#22c55e",
          border: "1.5px solid #0A1628",
        }} />
      </div>
      <div style={{ maxWidth: "88%", display: "flex", flexDirection: "column", gap: 4 }}>
        {showPhoto && (
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={AUTHOR_PHOTO}
            alt="মাহবুব সরদার সবুজ"
            style={{
              borderRadius: 14,
              width: "100%",
              maxWidth: 200,
              border: "2px solid #D4A843",
              boxShadow: "0 4px 20px rgba(212,168,67,0.3)",
            }}
          />
        )}
        {text && (
          <div style={{
            background: "rgba(15,28,48,0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(212,168,67,0.2)",
            borderRadius: "4px 16px 16px 16px",
            padding: "10px 14px",
            fontFamily: "'Noto Sans Bengali', sans-serif",
            fontSize: "0.82rem",
            lineHeight: 1.7,
            color: "rgba(253,246,236,0.92)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,168,67,0.1)",
            whiteSpace: "pre-wrap",
          }}>
            {message.isStreaming ? (
              <>
                {text}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                  style={{ display: "inline-block", width: 2, height: "1em", background: "#D4A843", marginLeft: 2, verticalAlign: "text-bottom", borderRadius: 1 }}
                />
              </>
            ) : text}
          </div>
        )}
        {buttons.length > 0 && !message.isStreaming && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
            {buttons.map((btn, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => onNavigate(btn.path)}
                style={{
                  background: "rgba(212,168,67,0.1)",
                  border: "1px solid rgba(212,168,67,0.4)",
                  color: "#D4A843",
                  borderRadius: 20,
                  padding: "5px 12px",
                  fontSize: "0.72rem",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,168,67,0.25)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 12px rgba(212,168,67,0.3)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,168,67,0.1)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                {btn.label} →
              </motion.button>
            ))}
          </div>
        )}
        {/* Reaction & Copy bar */}
        {!message.isStreaming && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: "0.6rem", color: "rgba(253,246,236,0.3)", fontFamily: "'Noto Sans Bengali', sans-serif" }}>
              {formatTime(message.timestamp)}
            </span>
            <button onClick={handleCopy} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(212,168,67,0.45)", fontSize: "0.65rem",
              fontFamily: "'Noto Sans Bengali', sans-serif", padding: 0,
            }}>
              {copied ? "✓" : "কপি"}
            </button>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowReactions(v => !v)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", padding: "0 2px", opacity: 0.5 }}
              >
                {message.reaction || "☺"}
              </button>
              <AnimatePresence>
                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      left: 0,
                      background: "rgba(10,22,40,0.95)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(212,168,67,0.3)",
                      borderRadius: 20,
                      padding: "4px 8px",
                      display: "flex",
                      gap: 4,
                      zIndex: 100,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                    }}
                  >
                    {REACTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => { onReact(message.id, emoji); setShowReactions(false); }}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: "1rem", padding: "2px 3px",
                          transition: "transform 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.3)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const history = loadHistory();
    if (history.length > 0) return history;
    return [{
      id: "welcome",
      role: "assistant",
      content: "আস্সালামু আলাইকুম! আমি মাহবুব সরদার সবুজ AI Agent।\n\nআমি তাঁর সম্পর্কে সব তথ্য দিতে পারি — কবিতা, ই-বুক, যোগাযোগ। এছাড়া সরদার ডিজাইন স্টুডিও ব্যবহারের গাইডলাইনও দিতে পারি। যেকোনো বিষয়ে প্রশ্ন করুন!",
      timestamp: new Date(),
    }];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [pulseOpen, setPulseOpen] = useState(true);
  const [copiedToast, setCopiedToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const [, navigate] = useLocation();

  // Pulse animation for open button
  useEffect(() => {
    const t = setTimeout(() => setPulseOpen(false), 8000);
    return () => clearTimeout(t);
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save history
  useEffect(() => {
    if (messages.length > 1) saveHistory(messages);
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen, isMinimized]);

  // Clear chat
  const clearChat = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([{
      id: "welcome-" + Date.now(),
      role: "assistant",
      content: "আস্সালামু আলাইকুম! আমি মাহবুব সরদার সবুজ AI Agent।\n\nআমি তাঁর সম্পর্কে সব তথ্য দিতে পারি — কবিতা, ই-বুক, যোগাযোগ। যেকোনো বিষয়ে প্রশ্ন করুন!",
      timestamp: new Date(),
    }]);
    setPendingImage(null);
  }, []);

  // React to message
  const handleReact = useCallback((id: string, emoji: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, reaction: emoji } : m));
  }, []);

  // Copy text
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    });
  }, []);

  // Voice input
  const toggleVoice = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("আপনার browser-এ voice input সমর্থিত নয়।");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "bn-BD";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => prev + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  // Image upload
  const handleImageSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) { alert("ছবির সাইজ সর্বোচ্চ ১০ MB হতে পারবে।"); return; }
    const dataUrl = await fileToBase64(file);
    setPendingImage(dataUrl);
  }, []);

  // Send message
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text && !pendingImage) return;
    if (isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text || (pendingImage ? "এই ছবিটি বিশ্লেষণ করো।" : ""),
      timestamp: new Date(),
      imageUrl: pendingImage || undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setPendingImage(null);
    setIsLoading(true);

    // Placeholder streaming message
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: Message = {
      id: aiMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    try {
      if (pendingImage) {
        // Vision (non-streaming)
        setMessages(prev => [...prev, { ...aiMsg, isStreaming: false }]);
        const reply = await callAIVision(pendingImage, text || "এই ছবিটি বিশ্লেষণ করো।");
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: reply, isStreaming: false } : m));
      } else {
        // Streaming
        const history = messages.filter(m => !m.isStreaming).slice(-8).map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
        history.push({ role: "user", content: text });

        setMessages(prev => [...prev, aiMsg]);
        let fullText = "";

        await callAIStream(
          history,
          (token) => {
            fullText += token;
            setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: fullText } : m));
          },
          () => {
            setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m));
          },
          async (err) => {
            // Fallback to non-streaming
            try {
              const reply = await callAI(history);
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: reply, isStreaming: false } : m));
            } catch {
              setMessages(prev => prev.map(m => m.id === aiMsgId ? {
                ...m,
                content: "দুঃখিত, সংযোগে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।",
                isStreaming: false,
              } : m));
            }
          }
        );
      }
    } catch (err: any) {
      setMessages(prev => {
        const hasAiMsg = prev.some(m => m.id === aiMsgId);
        const errMsg: Message = {
          id: aiMsgId,
          role: "assistant",
          content: "দুঃখিত, সংযোগে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।",
          timestamp: new Date(),
          isStreaming: false,
        };
        if (hasAiMsg) return prev.map(m => m.id === aiMsgId ? errMsg : m);
        return [...prev, errMsg];
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, pendingImage, isLoading, messages]);

  // Keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const showTyping = isLoading && !messages.some(m => m.isStreaming && m.content.length > 0);

  return (
    <>
      {/* ── Floating open button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{ position: "fixed", bottom: 24, right: 20, zIndex: 9999 }}
          >
            {/* Pulse ring */}
            {pulseOpen && (
              <motion.div
                style={{
                  position: "absolute",
                  inset: -6,
                  borderRadius: "50%",
                  border: "2px solid rgba(212,168,67,0.5)",
                }}
                animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <motion.button
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #C9A84C, #D4A843, #B8942A)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                boxShadow: "0 4px 20px rgba(212,168,67,0.5), 0 0 0 3px rgba(212,168,67,0.15)",
                overflow: "hidden",
                padding: 0,
              }}
            >
              <img src={AUTHOR_PHOTO} alt="AI" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => {
                  const btn = (e.target as HTMLImageElement).parentElement!;
                  (e.target as HTMLImageElement).style.display = "none";
                  btn.innerHTML += '<span style="color:#0A1628;font-size:11px;font-weight:700;font-family:sans-serif;position:absolute;">AI</span>';
                }} />
            </motion.button>
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              style={{
                position: "absolute",
                right: "110%",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(10,22,40,0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(212,168,67,0.3)",
                borderRadius: 10,
                padding: "6px 12px",
                whiteSpace: "nowrap",
                fontFamily: "'Noto Sans Bengali', sans-serif",
                fontSize: "0.72rem",
                color: "#D4A843",
                pointerEvents: "none",
                boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
              }}
            >
              আমাকে জিজ্ঞেস করুন
            </motion.div>
            {/* Online dot */}
            <div style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              width: 13,
              height: 13,
              borderRadius: "50%",
              background: "#22c55e",
              border: "2px solid #0A1628",
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            style={{
              position: "fixed",
              bottom: 20,
              right: 16,
              width: "min(400px, calc(100vw - 32px))",
              height: isMinimized ? "auto" : "min(600px, calc(100vh - 80px))",
              zIndex: 9998,
              display: "flex",
              flexDirection: "column",
              borderRadius: 20,
              overflow: "hidden",
              background: "rgba(8,18,35,0.88)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(212,168,67,0.25)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,67,0.1), inset 0 1px 0 rgba(212,168,67,0.15)",
            }}
          >
            {/* ── Header ── */}
            <div style={{
              background: "linear-gradient(135deg, rgba(20,35,55,0.95) 0%, rgba(30,48,70,0.95) 100%)",
              borderBottom: "1px solid rgba(212,168,67,0.2)",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Shimmer effect */}
              <motion.div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "60%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(212,168,67,0.08), transparent)",
                  pointerEvents: "none",
                }}
                animate={{ left: ["−100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
              />
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <motion.div
                  animate={{ boxShadow: ["0 0 8px rgba(212,168,67,0.4)", "0 0 16px rgba(212,168,67,0.7)", "0 0 8px rgba(212,168,67,0.4)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid #D4A843" }}
                >
                  <img src={AUTHOR_PHOTO} alt="AI" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style="color:#D4A843;font-size:10px;display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#1a2e4a;">AI</span>'; }} />
                </motion.div>
                <div style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 11, height: 11, borderRadius: "50%",
                  background: "#22c55e", border: "2px solid #0A1628",
                }} />
              </div>
              {/* Title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.88rem", fontWeight: 700, color: "#FDF6EC", letterSpacing: "0.01em" }}>
                  মাহবুব সরদার সবুজ
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }}
                  />
                  <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.68rem", color: "#22c55e" }}>
                    AI Agent · সক্রিয়
                  </span>
                </div>
              </div>
              {/* Controls */}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button
                  onClick={clearChat}
                  title="চ্যাট পরিষ্কার করুন"
                  style={{
                    background: "rgba(212,168,67,0.08)",
                    border: "1px solid rgba(212,168,67,0.2)",
                    color: "rgba(212,168,67,0.6)",
                    borderRadius: 8,
                    padding: "4px 8px",
                    fontSize: "0.65rem",
                    cursor: "pointer",
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(212,168,67,0.2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(212,168,67,0.08)")}
                >
                  পরিষ্কার
                </button>
                <button
                  onClick={() => setIsMinimized(v => !v)}
                  title={isMinimized ? "বড় করুন" : "ছোট করুন"}
                  style={{
                    background: "rgba(212,168,67,0.08)",
                    border: "1px solid rgba(212,168,67,0.2)",
                    color: "#D4A843",
                    borderRadius: 8,
                    padding: "4px 8px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(212,168,67,0.2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(212,168,67,0.08)")}
                >
                  {isMinimized ? "▲" : "▼"}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: "rgba(212,168,67,0.08)",
                    border: "1px solid rgba(212,168,67,0.2)",
                    color: "#D4A843",
                    borderRadius: 8,
                    padding: "4px 8px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(212,168,67,0.2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(212,168,67,0.08)")}
                >✕</button>
              </div>
            </div>

            {/* ── Body (hidden when minimized) ── */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}
                >
                  {/* Messages */}
                  <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "14px 14px 8px",
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(212,168,67,0.25) transparent",
                  }}>
                    {/* Suggestions */}
                    {messages.length === 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{ marginBottom: 14 }}
                      >
                        <div style={{
                          fontFamily: "'Noto Sans Bengali', sans-serif",
                          fontSize: "0.68rem",
                          color: "rgba(253,246,236,0.3)",
                          marginBottom: 8,
                          textAlign: "center",
                          letterSpacing: "0.05em",
                        }}>
                          ✦ প্রস্তাবিত প্রশ্ন ✦
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                          {SUGGESTIONS.map((s, i) => (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + i * 0.07 }}
                              onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 100); }}
                              style={{
                                background: "rgba(212,168,67,0.07)",
                                border: "1px solid rgba(212,168,67,0.25)",
                                color: "rgba(253,246,236,0.75)",
                                borderRadius: 20,
                                padding: "5px 12px",
                                fontSize: "0.72rem",
                                fontFamily: "'Noto Sans Bengali', sans-serif",
                                cursor: "pointer",
                                backdropFilter: "blur(8px)",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(212,168,67,0.18)";
                                e.currentTarget.style.color = "#D4A843";
                                e.currentTarget.style.borderColor = "rgba(212,168,67,0.5)";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = "rgba(212,168,67,0.07)";
                                e.currentTarget.style.color = "rgba(253,246,236,0.75)";
                                e.currentTarget.style.borderColor = "rgba(212,168,67,0.25)";
                              }}
                            >
                              {s}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {messages.map(msg => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        onNavigate={path => { navigate(path); setIsOpen(false); }}
                        onReact={handleReact}
                        onCopy={handleCopy}
                      />
                    ))}
                    <AnimatePresence>
                      {showTyping && <TypingIndicator />}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>

                  {/* ── Pending image preview ── */}
                  <AnimatePresence>
                    {pendingImage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          padding: "6px 14px",
                          borderTop: "1px solid rgba(212,168,67,0.1)",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          background: "rgba(212,168,67,0.05)",
                        }}
                      >
                        <img src={pendingImage} alt="preview" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: "1px solid rgba(212,168,67,0.4)" }} />
                        <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.72rem", color: "#D4A843", flex: 1 }}>ছবি যোগ করা হয়েছে</span>
                        <button onClick={() => setPendingImage(null)} style={{ background: "none", border: "none", color: "rgba(253,246,236,0.5)", cursor: "pointer", fontSize: "1rem" }}>✕</button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Input area ── */}
                  <div style={{
                    padding: "10px 12px 12px",
                    borderTop: "1px solid rgba(212,168,67,0.15)",
                    background: "rgba(8,18,35,0.6)",
                    backdropFilter: "blur(12px)",
                    flexShrink: 0,
                  }}>
                    <div style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-end",
                      background: "rgba(20,35,55,0.8)",
                      border: "1px solid rgba(212,168,67,0.25)",
                      borderRadius: 16,
                      padding: "8px 10px",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                      onFocus={() => {}}
                    >
                      {/* Image upload */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        title="ছবি আপলোড"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: pendingImage ? "#D4A843" : "rgba(212,168,67,0.45)",
                          fontSize: "1.1rem",
                          padding: "2px 4px",
                          flexShrink: 0,
                          transition: "color 0.2s",
                          alignSelf: "flex-end",
                          marginBottom: 2,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#D4A843")}
                        onMouseLeave={e => (e.currentTarget.style.color = pendingImage ? "#D4A843" : "rgba(212,168,67,0.45)")}
                      >
                        📎
                      </button>
                      {/* Voice input */}
                      <motion.button
                        onClick={toggleVoice}
                        title="ভয়েস ইনপুট"
                        animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        style={{
                          background: isListening ? "rgba(239,68,68,0.2)" : "none",
                          border: isListening ? "1px solid rgba(239,68,68,0.5)" : "none",
                          borderRadius: 8,
                          cursor: "pointer",
                          color: isListening ? "#ef4444" : "rgba(212,168,67,0.45)",
                          fontSize: "1rem",
                          padding: "2px 5px",
                          flexShrink: 0,
                          transition: "all 0.2s",
                          alignSelf: "flex-end",
                          marginBottom: 2,
                        }}
                        onMouseEnter={e => !isListening && (e.currentTarget.style.color = "#D4A843")}
                        onMouseLeave={e => !isListening && (e.currentTarget.style.color = "rgba(212,168,67,0.45)")}
                      >
                        🎤
                      </motion.button>
                      {/* Text input */}
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isListening ? "শুনছি..." : "আপনার প্রশ্ন লিখুন..."}
                        rows={1}
                        style={{
                          flex: 1,
                          background: "none",
                          border: "none",
                          outline: "none",
                          color: "#FDF6EC",
                          fontFamily: "'Noto Sans Bengali', sans-serif",
                          fontSize: "0.82rem",
                          resize: "none",
                          lineHeight: 1.5,
                          maxHeight: 100,
                          overflowY: "auto",
                          scrollbarWidth: "none",
                        }}
                        onInput={e => {
                          const el = e.currentTarget;
                          el.style.height = "auto";
                          el.style.height = Math.min(el.scrollHeight, 100) + "px";
                        }}
                      />
                      {/* Send button */}
                      <motion.button
                        onClick={sendMessage}
                        disabled={(!input.trim() && !pendingImage) || isLoading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: (!input.trim() && !pendingImage) || isLoading
                            ? "rgba(212,168,67,0.15)"
                            : "linear-gradient(135deg, #C9A84C, #D4A843)",
                          border: "none",
                          cursor: (!input.trim() && !pendingImage) || isLoading ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.2s",
                          alignSelf: "flex-end",
                          boxShadow: (!input.trim() && !pendingImage) || isLoading ? "none" : "0 2px 10px rgba(212,168,67,0.4)",
                        }}
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            style={{ width: 14, height: 14, border: "2px solid rgba(212,168,67,0.3)", borderTopColor: "#D4A843", borderRadius: "50%" }}
                          />
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13" stroke={(!input.trim() && !pendingImage) ? "rgba(212,168,67,0.4)" : "#0A1628"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={(!input.trim() && !pendingImage) ? "rgba(212,168,67,0.4)" : "#0A1628"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </motion.button>
                    </div>
                    <div style={{
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.6rem",
                      color: "rgba(253,246,236,0.2)",
                      textAlign: "center",
                      marginTop: 5,
                    }}>
                      📎 ছবি · 🎤 ভয়েস · Enter পাঠান · Shift+Enter নতুন লাইন
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Copied toast ── */}
      <AnimatePresence>
        {copiedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: "fixed",
              bottom: 90,
              right: 20,
              background: "rgba(10,22,40,0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(212,168,67,0.3)",
              borderRadius: 10,
              padding: "8px 16px",
              fontFamily: "'Noto Sans Bengali', sans-serif",
              fontSize: "0.75rem",
              color: "#D4A843",
              zIndex: 10000,
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            ✓ কপি হয়েছে
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hidden file input ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleImageSelect(file);
          e.target.value = "";
        }}
      />
    </>
  );
}
