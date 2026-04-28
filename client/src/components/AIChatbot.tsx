import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;       // user-uploaded image (data URL)
  imageAnalysis?: boolean; // was this an image analysis response?
}

interface ActionButton {
  label: string;
  path: string;
}

type ActiveTab = "chat";

// ── Helpers ───────────────────────────────────────────────────────────────────
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Convert file to base64 data URL
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Extract base64 content from data URL
function extractBase64(dataUrl: string): { base64: string; mimeType: string } {
  const [header, base64] = dataUrl.split(",");
  const mimeType = header.match(/data:([^;]+)/)?.[1] || "image/jpeg";
  return { base64, mimeType };
}

// ── AI Chat API call (text only) ──────────────────────────────────────────────
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
      const isNetworkError = err?.name === "TypeError" || err?.message?.includes("fetch");
      if (isAborted || isNetworkError) {
        await delay(Math.pow(2, attempt) * 1000);
        return callAI(messages, attempt + 1);
      }
    }
    throw new Error("connection_failed");
  }
}

// ── AI Vision API call (image + text) ────────────────────────────────────────
async function callAIVision(
  imageDataUrl: string,
  userText: string,
  attempt = 0
): Promise<string> {
  const MAX_RETRIES = 2;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  const { base64, mimeType } = extractBase64(imageDataUrl);

  try {
    const res = await fetch("/api/chat-vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: base64,
        mimeType,
        prompt: userText || "এই ছবিটি বিশ্লেষণ করুন এবং বাংলায় বিস্তারিত বলুন।",
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status >= 500 && attempt < MAX_RETRIES - 1) {
        await delay(2000);
        return callAIVision(imageDataUrl, userText, attempt + 1);
      }
      throw new Error(`Vision API error: ${res.status}`);
    }

    const data = await res.json();
    return data.reply || "ছবিটি বিশ্লেষণ করতে পারিনি।";
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (attempt < MAX_RETRIES - 1) {
      await delay(2000);
      return callAIVision(imageDataUrl, userText, attempt + 1);
    }
    throw new Error("vision_failed");
  }
}

const AUTHOR_PHOTO = "/images/author-photo.jpg";

// ── Page map ──────────────────────────────────────────────────────────────────
const PAGE_MAP: { path: string; label: string; keywords: string[] }[] = [
  { path: "/about",    label: "পরিচিতি পেজ দেখুন",    keywords: ["about", "পরিচিতি", "পরিচয়", "জীবনী"] },
  { path: "/ebooks",   label: "ই-বুক সংগ্রহ দেখুন",   keywords: ["ebooks", "ebook", "ই-বুক", "বই"] },
  { path: "/writings", label: "লেখালেখি পেজ দেখুন",   keywords: ["writings", "writing", "লেখালেখি", "লেখা", "কবিতা"] },
  { path: "/contact",  label: "যোগাযোগ পেজ দেখুন",    keywords: ["contact", "যোগাযোগ", "ইমেইল"] },
  { path: "/editor",   label: "ডিজাইন স্টুডিও খুলুন", keywords: ["editor", "ডিজাইন", "স্টুডিও", "ফরম্যাট"] },
  { path: "/",         label: "হোম পেজ দেখুন",        keywords: ["home", "হোম"] },
  { path: "/ebooks/read/smritir-boshonte", label: "স্মৃতির বসন্তে তুমি পড়ুন",  keywords: ["smritir", "স্মৃতির বসন্তে"] },
  { path: "/ebooks/read/chand-phool",      label: "চাঁদফুল পড়ুন",              keywords: ["chand-phool", "চাঁদফুল"] },
  { path: "/ebooks/read/shomoyer-gohvore", label: "সময়ের গহ্বরে পড়ুন",        keywords: ["shomoyer", "সময়ের গহ্বরে"] },
  { path: "/facebook-recitations",         label: "আবৃত্তি সংগ্রহ দেখুন",      keywords: ["recitation", "আবৃত্তি", "facebook"] },
];

// ── Photo request detection ───────────────────────────────────────────────────
const PHOTO_KEYWORDS = [
  "ছবি", "photo", "picture", "image", "ফটো", "দেখতে", "চেহারা",
  "মুখ", "face", "look", "দেখাও", "দেখান", "কেমন দেখতে",
];

function isPhotoRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return PHOTO_KEYWORDS.some(kw => lower.includes(kw));
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `তুমি "মাহবুব সরদার সবুজ AI Agent" — বাংলাদেশের লেখক ও কবি মাহবুব সরদার সবুজের ব্যক্তিগত AI সহকারী।

## তোমার পরিচয়
তুমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI Agent। তুমি বাংলায় এবং ইংরেজিতে যেকোনো প্রশ্নের উত্তর দাও। তুমি ছবি বিশ্লেষণ করতে পারো এবং ছবি সম্পর্কে বিস্তারিত বলতে পারো।

## ভাষা ও বানান নির্দেশনা (অত্যন্ত গুরুত্বপূর্ণ)
- সবসময় শুদ্ধ ও নির্ভুল বাংলা বানান ব্যবহার করবে
- ভদ্র ও সম্মানজনক ভাষায় কথা বলবে — "আপনি", "আপনার" ব্যবহার করবে
- সহজ, পরিষ্কার ও প্রাঞ্জল বাংলায় উত্তর দেবে
- অপ্রয়োজনীয় ইমোজি বা বিশেষ চিহ্ন ব্যবহার করবে না
- উত্তর সংক্ষিপ্ত ও স্পষ্ট রাখবে — অতিরিক্ত দীর্ঘ উত্তর দেবে না
- কখনো URL লিংক (https://...) সরাসরি টেক্সটে লিখবে না, শুধু [BUTTON:/path] ট্যাগ ব্যবহার করবে

## মূল আচরণবিধি
১. সম্পূর্ণ সঠিক ও নির্ভুল তথ্য প্রদান করবে। কোনো তথ্য সম্পর্কে নিশ্চিত না হলে অনুমান করে উত্তর দেবে না।
২. ব্যবহারকারীদের সহায়তা করবে — ওয়েবসাইট ব্যবহার, ডিজাইন টুল, ই-বুক পড়া সব বিষয়ে গাইড করবে।
৩. লেখক সম্পর্কে শুধুমাত্র যাচাইকৃত তথ্য প্রদান করবে।
৪. কবিতা বা লেখা চাইলে নিজে তৈরি না করে ওয়েবসাইটের বিদ্যমান লেখা থেকে দেখাবে এবং [BUTTON:/writings] পেজে যেতে বলবে।
৫. ছবি আপলোড করা হলে সেটি বিস্তারিতভাবে বিশ্লেষণ করবে।

## মাহবুব সরদার সবুজ — সম্পূর্ণ তথ্য

### ব্যক্তিগত পরিচয়
- পুরো নাম: মাহবুব সরদার সবুজ (Mahbub Sardar Sabuj)
- পেশা: লেখক ও কবি (বাংলা সাহিত্য)
- জন্মস্থান: কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়ি
- পিতা: ফানাউল্লাহ সরদার
- মাতা: আহামালী বিনতে মাসুরা
- বর্তমান অবস্থান: সৌদি আরব
- বৈবাহিক অবস্থা: অবিবাহিত
- কর্মক্ষেত্র: সৌদি আরবে একটি ফার্নিচার কোম্পানিতে ম্যানেজার এবং একটি স্টুডিওতে প্রোগ্রামার
- ইমেইল: lekhokmahbubsardarsabuj@gmail.com
- Facebook: Lekhok.MahbubSardarSabuj

### সাহিত্যকর্ম ও পরিসংখ্যান
- মোট লেখা: ৭,০০০+ (কবিতা, গদ্য, প্রবন্ধ)
- প্রকাশিত ই-বুক: ৪টি
- পাঠক: লক্ষাধিক
- বিশেষত্ব: ভালোবাসা, জীবনের বাস্তবতা, আত্মসম্মান, মানবিক সম্পর্ক বিষয়ক লেখা
- বিখ্যাত উক্তি: "কলমের স্পর্শে আমি বিদ্রোহী, ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি; কেউ কেউ ভালোবেসে ডাকে আমায় কবি।"

### প্রকাশিত বই ও ই-বুক
১. আমি বিচ্ছেদকে বলি দুঃখবিলাস — প্রথম ফিজিক্যাল বই (২০২৬), রকমারিতে পাওয়া যায়
২. স্মৃতির বসন্তে তুমি — ই-বুক [BUTTON:/ebooks/read/smritir-boshonte]
৩. চাঁদফুল — ই-বুক [BUTTON:/ebooks/read/chand-phool]
৪. সময়ের গহ্বরে — ই-বুক [BUTTON:/ebooks/read/shomoyer-gohvore]

### ওয়েবসাইটের পেজসমূহ
- হোম পেজ [BUTTON:/] — লেখকের পরিচয়, বই, লেখা, সংবাদ সব এক জায়গায়
- পরিচিতি পেজ [BUTTON:/about] — লেখকের বিস্তারিত জীবনী ও পরিচয়
- বই ও ই-বুক [BUTTON:/ebooks] — সব প্রকাশিত বই ও ই-বুক
- লেখালেখি [BUTTON:/writings] — ৭,০০০+ লেখার সংগ্রহ
- যোগাযোগ [BUTTON:/contact] — ইমেইল ও সামাজিক মাধ্যমের তথ্য
- সরদার ডিজাইন স্টুডিও [BUTTON:/editor] — ডিজাইন কার্ড তৈরির টুল
- Facebook আবৃত্তি [BUTTON:/facebook-recitations] — কবিতার আবৃত্তি সংগ্রহ

## প্রযুক্তিগত নির্দেশনা
- কখনো URL লিংক দেবে না (https://... ধরনের কোনো লিংক টেক্সটে লিখবে না)
- যখন কোনো পেজের কথা বলবে, শুধু [BUTTON:/path] ট্যাগ ব্যবহার করবে
- [BUTTON:/path] ট্যাগ স্বয়ংক্রিয়ভাবে সুন্দর বাটনে পরিণত হবে
- যদি কেউ মাহবুব সরদার সবুজের ছবি চায়, তাহলে [PHOTO] ট্যাগ ব্যবহার করো
- সবসময় বাংলায় উত্তর দাও (ব্যবহারকারী ইংরেজিতে জিজ্ঞেস করলে ইংরেজিতে দাও)`;

const SUGGESTIONS = [
  "মাহবুব সরদার সবুজের পরিচয় দাও",
  "তার ই-বুকগুলো কোথায় পাব?",
  "ডিজাইন স্টুডিও কীভাবে ব্যবহার করব?",
  "তার বিখ্যাত লেখাগুলো কী কী?",
  "ভালোবাসার কবিতা কোথায় পাব?",
  "যোগাযোগ করব কীভাবে?",
];

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
    new RegExp(`https?://mahbub-sardar-sabuj-live\\.vercel\\.app(/[^\\s)>"]*)`, "g"),
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

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ message, onNavigate }: { message: Message; onNavigate: (path: string) => void }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end mb-3"
      >
        <div style={{ maxWidth: "85%", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          {message.imageUrl && (
            <div style={{ position: "relative" }}>
              <img
                src={message.imageUrl}
                alt="আপলোড করা ছবি"
                style={{
                  maxWidth: 200,
                  maxHeight: 200,
                  borderRadius: 12,
                  border: "2px solid rgba(212,168,67,0.5)",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div style={{
                position: "absolute",
                bottom: 4,
                right: 4,
                background: "rgba(0,0,0,0.6)",
                color: "#D4A843",
                fontSize: "0.6rem",
                padding: "2px 6px",
                borderRadius: 8,
                fontFamily: "'Noto Sans Bengali', sans-serif",
              }}>
                ছবি
              </div>
            </div>
          )}
          {message.content && (
            <div style={{
              background: "linear-gradient(135deg, #C9A84C, #D4A843)",
              color: "#0A1628",
              borderRadius: "18px 18px 4px 18px",
              padding: "10px 14px",
              fontFamily: "'Noto Sans Bengali', sans-serif",
              fontSize: "0.88rem",
              lineHeight: 1.7,
              fontWeight: 500,
            }}>
              {message.content}
            </div>
          )}
          <div style={{ color: "rgba(150,160,170,0.6)", fontSize: "0.68rem", paddingRight: 2 }}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </motion.div>
    );
  }

  const { text, buttons, showPhoto } = parseContent(message.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 mb-3"
    >
      <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D4A843] flex-shrink-0 mt-1">
        <img src={AUTHOR_PHOTO} alt="AI" className="w-full h-full object-cover"
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            t.parentElement!.innerHTML = '<span style="color:#D4A843;font-size:10px;display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#1a2e4a;">AI</span>';
          }} />
      </div>
      <div style={{ maxWidth: "85%" }}>
        {showPhoto && (
          <div className="mb-2">
            <img src={AUTHOR_PHOTO} alt="মাহবুব সরদার সবুজ"
              className="rounded-xl w-full max-w-[200px] border-2 border-[#D4A843]"
              style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }} />
          </div>
        )}
        {message.imageAnalysis && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(212,168,67,0.1)",
            border: "1px solid rgba(212,168,67,0.3)",
            borderRadius: 12,
            padding: "3px 8px",
            marginBottom: 6,
            fontSize: "0.7rem",
            color: "#D4A843",
            fontFamily: "'Noto Sans Bengali', sans-serif",
          }}>
            <span>ছবি বিশ্লেষণ</span>
          </div>
        )}
        {text && (
          <div style={{
            background: "rgba(30,45,61,0.9)",
            border: "1px solid rgba(212,168,67,0.2)",
            borderRadius: "4px 18px 18px 18px",
            padding: "10px 14px",
            color: "rgba(253,246,236,0.92)",
            fontFamily: "'Noto Sans Bengali', sans-serif",
            fontSize: "0.88rem",
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
          }}>
            {text}
          </div>
        )}
        {buttons.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {buttons.map(btn => (
              <button
                key={btn.path}
                onClick={() => onNavigate(btn.path)}
                style={{
                  background: "rgba(212,168,67,0.12)",
                  border: "1px solid rgba(212,168,67,0.4)",
                  color: "#D4A843",
                  borderRadius: 20,
                  padding: "5px 12px",
                  fontSize: "0.78rem",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,168,67,0.25)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#D4A843";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,168,67,0.12)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,168,67,0.4)";
                }}
              >
                {btn.label} →
              </button>
            ))}
          </div>
        )}
        <div style={{ color: "rgba(150,160,170,0.6)", fontSize: "0.68rem", marginTop: 4, paddingLeft: 2 }}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </motion.div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-2 mb-3">
      <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D4A843] flex-shrink-0">
        <img src={AUTHOR_PHOTO} alt="AI" className="w-full h-full object-cover" />
      </div>
      <div style={{
        background: "rgba(30,45,61,0.9)",
        border: "1px solid rgba(212,168,67,0.2)",
        borderRadius: "4px 18px 18px 18px",
        padding: "12px 16px",
        display: "flex",
        gap: 5,
        alignItems: "center",
      }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            style={{ width: 7, height: 7, borderRadius: "50%", background: "#D4A843" }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: `আস্সালামু আলাইকুম! আমি মাহবুব সরদার সবুজ AI Agent।

আমি তাঁর সম্পর্কে সব তথ্য দিতে পারি — কবিতা, ই-বুক, যোগাযোগ। এছাড়া ছবি আপলোড করে বিশ্লেষণ করতে পারি। যেকোনো বিষয়ে প্রশ্ন করুন!`,
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingImageName, setPendingImageName] = useState<string>("");

  // Drag state
  const [btnPos, setBtnPos] = useState({ x: -1, y: -1 });
  const [pillExpanded, setPillExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, bx: 0, by: 0 });
  const retryPayloadRef = useRef<{ role: "user" | "assistant" | "system"; content: string }[] | null>(null);
  const [, navigate] = useLocation();

  // Listen for open-chatbot event
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("open-chatbot", handler);
    return () => window.removeEventListener("open-chatbot", handler);
  }, []);

  // Periodic pill expand
  useEffect(() => {
    if (isOpen) { setPillExpanded(false); return; }
    const firstShow = setTimeout(() => {
      setPillExpanded(true);
      setTimeout(() => setPillExpanded(false), 3000);
    }, 1500);
    const interval = setInterval(() => {
      setPillExpanded(true);
      setTimeout(() => setPillExpanded(false), 3000);
    }, 10000);
    return () => { clearTimeout(firstShow); clearInterval(interval); };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === "chat") setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen, activeTab]);

  const handleNavigate = useCallback((path: string) => {
    setIsOpen(false);
    navigate(path);
  }, [navigate]);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const clampPos = useCallback((x: number, y: number) => {
    const BTN = 56;
    return {
      x: Math.max(0, Math.min(window.innerWidth - BTN, x)),
      y: Math.max(0, Math.min(window.innerHeight - BTN, y)),
    };
  }, []);

  const getAbsPos = useCallback(() => {
    if (btnPos.x === -1) {
      return { x: window.innerWidth - 72, y: window.innerHeight - 88 };
    }
    return btnPos;
  }, [btnPos]);

  const handleBtnMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    didDrag.current = false;
    const abs = getAbsPos();
    dragStart.current = { x: e.clientX, y: e.clientY, bx: abs.x, by: abs.y };

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - dragStart.current.x;
      const dy = ev.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
      setBtnPos(clampPos(dragStart.current.bx + dx, dragStart.current.by + dy));
    };
    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    e.preventDefault();
  }, [getAbsPos, clampPos]);

  const handleBtnTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    didDrag.current = false;
    const t = e.touches[0];
    const abs = getAbsPos();
    dragStart.current = { x: t.clientX, y: t.clientY, bx: abs.x, by: abs.y };

    const onMove = (ev: TouchEvent) => {
      ev.preventDefault();
      const touch = ev.touches[0];
      const dx = touch.clientX - dragStart.current.x;
      const dy = touch.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
      setBtnPos(clampPos(dragStart.current.bx + dx, dragStart.current.by + dy));
    };
    const onEnd = () => {
      isDragging.current = false;
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }, [getAbsPos, clampPos]);

  // ── Image upload handler ──────────────────────────────────────────────────
  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("ছবির সাইজ সর্বোচ্চ ১০ MB হতে পারবে।");
      return;
    }
    const dataUrl = await fileToBase64(file);
    setPendingImage(dataUrl);
    setPendingImageName(file.name);
    inputRef.current?.focus();
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if ((!text && !pendingImage) || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
      imageUrl: pendingImage || undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    const capturedImage = pendingImage;
    setPendingImage(null);
    setPendingImageName("");
    setIsLoading(true);
    setError(null);

    // If image is attached → use Vision API
    if (capturedImage) {
      try {
        const reply = await callAIVision(capturedImage, text);
        setMessages(prev => [...prev, {
          id: `ai-vision-${Date.now()}`,
          role: "assistant",
          content: reply,
          timestamp: new Date(),
          imageAnalysis: true,
        }]);
      } catch {
        setError("ছবি বিশ্লেষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Photo shortcut (text only)
    if (isPhotoRequest(text)) {
      const photoMsg: Message = {
        id: `photo-${Date.now()}`,
        role: "assistant",
        content: "[PHOTO]\nএটি মাহবুব সরদার সবুজের ছবি।",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, photoMsg]);
      setIsLoading(false);
      return;
    }

    const payload = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: text },
    ];

    retryPayloadRef.current = payload;

    try {
      const reply = await callAI(payload);
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      }]);
    } catch {
      setError("সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  }, [input, pendingImage, isLoading, messages]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleRetry = useCallback(async () => {
    if (!retryPayloadRef.current) return;
    setIsLoading(true);
    setError(null);
    try {
      const reply = await callAI(retryPayloadRef.current);
      setMessages(prev => [...prev, {
        id: `ai-retry-${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      }]);
    } catch {
      setError("সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearChat = () => {
    setMessages([{
      id: "welcome-new",
      role: "assistant",
      content: "নতুন কথোপকথন শুরু হয়েছে। আপনাকে কীভাবে সাহায্য করতে পারি?",
      timestamp: new Date(),
    }]);
    setError(null);
    setPendingImage(null);
    retryPayloadRef.current = null;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating Button */}
      {(() => {
        const abs = getAbsPos();
        return (
          <div
            className="fixed z-[60]"
            style={{
              left: abs.x,
              top: abs.y,
              cursor: isDragging.current ? "grabbing" : "grab",
              userSelect: "none",
              touchAction: "none",
              display: "flex",
              alignItems: "center",
              gap: 0,
            }}
            onMouseDown={handleBtnMouseDown}
            onTouchStart={handleBtnTouchStart}
          >
            {/* Circular avatar button */}
            <motion.div
              onClick={() => { if (!didDrag.current) setIsOpen(o => !o); }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              style={{
                width: 52, height: 52,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2.5px solid #D4A843",
                boxShadow: "0 0 0 3px rgba(212,168,67,0.22), 0 6px 20px rgba(0,0,0,0.55)",
                background: "#0d1b2a",
                flexShrink: 0,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 2,
              }}
            >
              {!isOpen && (
                <span style={{
                  position: "absolute", inset: -3, borderRadius: "50%",
                  border: "2px solid rgba(212,168,67,0.4)",
                  animation: "ping 2s ease-in-out infinite",
                  pointerEvents: "none",
                }} />
              )}
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.span key="x"
                    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                    style={{ color: "#D4A843", fontSize: "1.2rem", fontWeight: 700 }}>✕</motion.span>
                ) : (
                  <motion.div key="av"
                    initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
                    style={{ width: "100%", height: "100%" }}>
                    <img src={AUTHOR_PHOTO} alt="AI"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        const t = e.currentTarget;
                        t.style.display = "none";
                        t.parentElement!.innerHTML = '<span style="color:#D4A843;font-size:1.3rem;font-weight:700;">AI</span>';
                      }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Pill text */}
            <AnimatePresence>
              {!isOpen && pillExpanded && (
                <motion.div
                  key="textbox"
                  initial={{ opacity: 0, x: -18, scaleX: 0.6 }}
                  animate={{ opacity: 1, x: 0, scaleX: 1 }}
                  exit={{ opacity: 0, x: -18, scaleX: 0.6 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  onClick={() => { if (!didDrag.current) setIsOpen(true); }}
                  style={{
                    marginLeft: -10,
                    paddingLeft: 18,
                    paddingRight: 16,
                    paddingTop: 9,
                    paddingBottom: 9,
                    background: "linear-gradient(135deg, #060E1A 0%, #0A1628 60%, #0d1e35 100%)",
                    border: "1.5px solid rgba(201,168,76,0.5)",
                    borderRadius: "0 20px 20px 0",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(201,168,76,0.08)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transformOrigin: "left center",
                  }}
                >
                  <span style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#C9A84C",
                    letterSpacing: "0.02em",
                    display: "block",
                  }}>আপনাকে স্বাগতম</span>
                  <span style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    fontSize: "0.62rem",
                    color: "rgba(250,246,239,0.45)",
                    display: "block",
                    marginTop: 2,
                  }}>মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটে</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })()}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-[60] w-[380px] max-w-[calc(100vw-24px)] h-[600px] max-h-[calc(100vh-120px)] border border-[#2a3a4a] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ background: "#0d1b2a" }}
          >
            {/* Background watermark */}
            <div aria-hidden="true" style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${AUTHOR_PHOTO})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              opacity: 0.07,
              pointerEvents: "none",
              zIndex: 0,
              borderRadius: "inherit",
            }} />
            <div aria-hidden="true" style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(13,27,42,0.82) 0%, rgba(13,27,42,0.70) 50%, rgba(13,27,42,0.88) 100%)",
              pointerEvents: "none",
              zIndex: 0,
              borderRadius: "inherit",
            }} />

            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

              {/* Header */}
              <div className="bg-[#111827]/90 px-4 py-3 flex items-center justify-between border-b border-[#2a3a4a] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D4A843] flex-shrink-0">
                    <img src={AUTHOR_PHOTO} alt="মাহবুব সরদার সবুজ" className="w-full h-full object-cover"
                      onError={(e) => {
                        const t = e.currentTarget;
                        t.style.display = "none";
                        t.parentElement!.innerHTML = '<span style="color:#D4A843;font-size:1rem;display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#1a2e4a;">AI</span>';
                      }} />
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: "#D4A843",
                    }}>মাহবুব সরদার সবুজ</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
                      <span style={{
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontSize: "0.68rem",
                        color: "rgba(253,246,236,0.5)",
                      }}>AI Agent · সক্রিয়</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab === "chat" && (
                    <button
                      onClick={clearChat}
                      title="চ্যাট পরিষ্কার করুন"
                      style={{
                        background: "rgba(212,168,67,0.1)",
                        border: "1px solid rgba(212,168,67,0.2)",
                        color: "rgba(212,168,67,0.7)",
                        borderRadius: 8,
                        padding: "4px 8px",
                        fontSize: "0.7rem",
                        cursor: "pointer",
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                      }}
                    >
                      পরিষ্কার
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: "rgba(212,168,67,0.1)",
                      border: "1px solid rgba(212,168,67,0.2)",
                      color: "#D4A843",
                      borderRadius: 8,
                      padding: "4px 8px",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >✕</button>
                </div>
              </div>

              {/* Tab Bar */}
              <div style={{
                display: "flex",
                borderBottom: "1px solid rgba(42,58,74,0.8)",
                background: "rgba(10,22,40,0.6)",
              }}>
                {(["chat"] as ActiveTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      border: "none",
                      background: "transparent",
                      borderBottom: activeTab === tab ? "2px solid #D4A843" : "2px solid transparent",
                      color: activeTab === tab ? "#D4A843" : "rgba(253,246,236,0.4)",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: activeTab === tab ? 700 : 400,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {"💬 চ্যাট"}
                  </button>
                ))}
              </div>

              {/* Chat Content */}
              <>
                  {/* Messages */}
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "12px 14px",
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(212,168,67,0.2) transparent",
                    }}
                  >
                    {/* Suggestions */}
                    {messages.length === 1 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{
                          fontFamily: "'Noto Sans Bengali', sans-serif",
                          fontSize: "0.7rem",
                          color: "rgba(253,246,236,0.35)",
                          marginBottom: 6,
                          textAlign: "center",
                        }}>
                          প্রস্তাবিত প্রশ্ন
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                          {SUGGESTIONS.map(s => (
                            <button
                              key={s}
                              onClick={() => { setInput(s); inputRef.current?.focus(); }}
                              style={{
                                background: "rgba(212,168,67,0.08)",
                                border: "1px solid rgba(212,168,67,0.25)",
                                color: "rgba(253,246,236,0.7)",
                                borderRadius: 16,
                                padding: "4px 10px",
                                fontSize: "0.72rem",
                                fontFamily: "'Noto Sans Bengali', sans-serif",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,168,67,0.18)";
                                (e.currentTarget as HTMLButtonElement).style.color = "#D4A843";
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,168,67,0.08)";
                                (e.currentTarget as HTMLButtonElement).style.color = "rgba(253,246,236,0.7)";
                              }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map(msg => (
                      <MessageBubble key={msg.id} message={msg} onNavigate={handleNavigate} />
                    ))}

                    {isLoading && <TypingIndicator />}

                    {error && (
                      <div style={{
                        background: "rgba(220,50,50,0.12)",
                        border: "1px solid rgba(220,50,50,0.3)",
                        borderRadius: 10,
                        padding: "8px 12px",
                        marginBottom: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}>
                        <span style={{
                          fontFamily: "'Noto Sans Bengali', sans-serif",
                          fontSize: "0.78rem",
                          color: "#ff8080",
                        }}>{error}</span>
                        <button
                          onClick={handleRetry}
                          style={{
                            background: "rgba(220,50,50,0.2)",
                            border: "1px solid rgba(220,50,50,0.4)",
                            color: "#ff8080",
                            borderRadius: 6,
                            padding: "3px 8px",
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            fontFamily: "'Noto Sans Bengali', sans-serif",
                            whiteSpace: "nowrap",
                          }}
                        >
                          আবার চেষ্টা
                        </button>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Pending image preview */}
                  {pendingImage && (
                    <div style={{
                      padding: "6px 14px",
                      borderTop: "1px solid rgba(42,58,74,0.5)",
                      background: "rgba(10,22,40,0.5)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}>
                      <img
                        src={pendingImage}
                        alt="pending"
                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(212,168,67,0.4)" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: "'Noto Sans Bengali', sans-serif",
                          fontSize: "0.72rem",
                          color: "#D4A843",
                          fontWeight: 600,
                        }}>ছবি সংযুক্ত</div>
                        <div style={{
                          fontFamily: "monospace",
                          fontSize: "0.65rem",
                          color: "rgba(253,246,236,0.4)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>{pendingImageName}</div>
                      </div>
                      <button
                        onClick={() => { setPendingImage(null); setPendingImageName(""); }}
                        style={{
                          background: "rgba(220,50,50,0.15)",
                          border: "none",
                          color: "#ff8080",
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          cursor: "pointer",
                          fontSize: "0.7rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >✕</button>
                    </div>
                  )}

                  {/* Input area */}
                  <div style={{
                    padding: "10px 14px",
                    borderTop: "1px solid rgba(42,58,74,0.8)",
                    background: "rgba(10,22,40,0.8)",
                    backdropFilter: "blur(8px)",
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 8,
                      background: "rgba(30,45,61,0.8)",
                      border: "1px solid rgba(42,58,74,0.8)",
                      borderRadius: 14,
                      padding: "6px 8px 6px 12px",
                    }}>
                      {/* Image upload button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        title="ছবি আপলোড করুন"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: pendingImage ? "#D4A843" : "rgba(212,168,67,0.5)",
                          cursor: "pointer",
                          padding: "4px",
                          borderRadius: 6,
                          fontSize: "1.1rem",
                          flexShrink: 0,
                          transition: "color 0.2s",
                          alignSelf: "flex-end",
                          marginBottom: 2,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#D4A843")}
                        onMouseLeave={e => (e.currentTarget.style.color = pendingImage ? "#D4A843" : "rgba(212,168,67,0.5)")}
                      >
                        📎
                      </button>

                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={pendingImage ? "ছবি সম্পর্কে প্রশ্ন করুন..." : "বার্তা লিখুন..."}
                        rows={1}
                        style={{
                          flex: 1,
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          color: "rgba(253,246,236,0.9)",
                          fontFamily: "'Noto Sans Bengali', sans-serif",
                          fontSize: "0.88rem",
                          lineHeight: 1.6,
                          resize: "none",
                          maxHeight: 80,
                          overflowY: "auto",
                          padding: "4px 0",
                        }}
                        onInput={e => {
                          const el = e.currentTarget;
                          el.style.height = "auto";
                          el.style.height = Math.min(el.scrollHeight, 80) + "px";
                        }}
                      />

                      <button
                        onClick={handleSend}
                        disabled={(!input.trim() && !pendingImage) || isLoading}
                        style={{
                          background: (!input.trim() && !pendingImage) || isLoading
                            ? "rgba(212,168,67,0.2)"
                            : "linear-gradient(135deg, #C9A84C, #D4A843)",
                          border: "none",
                          borderRadius: 10,
                          width: 34,
                          height: 34,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: (!input.trim() && !pendingImage) || isLoading ? "not-allowed" : "pointer",
                          flexShrink: 0,
                          transition: "all 0.2s",
                          alignSelf: "flex-end",
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M22 2L11 13" stroke={(!input.trim() && !pendingImage) || isLoading ? "rgba(212,168,67,0.5)" : "#0A1628"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={(!input.trim() && !pendingImage) || isLoading ? "rgba(212,168,67,0.5)" : "#0A1628"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>

                    <div style={{
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.62rem",
                      color: "rgba(253,246,236,0.25)",
                      textAlign: "center",
                      marginTop: 6,
                    }}>
                      📎 ছবি আপলোড করুন · Enter পাঠান · Shift+Enter নতুন লাইন
                    </div>
                  </div>
                </>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
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
