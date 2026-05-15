import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
// Lazy-load LiveChatWidget — only needed when user opens the live chat tab
const LiveChatWidget = lazy(() => import("./LiveChatWidget"));

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  userAudioName?: string;     // uploaded audio display name
  userAudioSize?: number;     // uploaded audio file size in bytes
  userAudioMime?: string;     // uploaded audio mime/type
  userAudioUrl?: string;      // temporary local preview URL for uploaded audio
  userAudioInstruction?: string; // user instruction for the uploaded audio
  audioUrl?: string;          // edited audio download URL
  audioFilename?: string;     // suggested filename
  audioDescription?: string;  // Bengali description of what was done
  audioAppliedSteps?: string[]; // list of applied processing steps
  audioIntent?: string;       // detected intent (clean/enhance/podcast/etc)
  audioPipeline?: string[];   // ordered pipeline steps
  audioTechnicalNote?: string; // technical explanation
  audioVocalContext?: string;  // detected vocal context (poetry/narration/deep/soft/general)
  processingVersion?: string;  // processing engine version (v9.0)
  operationsApplied?: string[]; // list of applied operation names
  outputSizeKB?: number;       // output file size in KB
  isCopied?: boolean;          // message copy state
}

interface ActionButton {
  label: string;
  path: string;
}

// ── AI call with retry + timeout ────────────────────────────────────────────
type AIMessageContent = string | { type: "text"; text: string }[] | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
async function callAI(
  messages: { role: "user" | "assistant" | "system"; content: AIMessageContent }[],
  attempt = 0
): Promise<string> {
  const MAX_RETRIES = 3;
  const TIMEOUT_MS = 45000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, hasImage: messages.some(m => Array.isArray(m.content)) }),
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

// ── Typing animation hook ────────────────────────────────────────────────────
function useTypingText(fullText: string, speed = 12): { displayText: string; isDone: boolean } {
  const [displayText, setDisplayText] = useState("");
  const [isDone, setIsDone] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayText("");
    setIsDone(false);
    indexRef.current = 0;

    // For short texts, show immediately
    if (fullText.length <= 80) {
      setDisplayText(fullText);
      setIsDone(true);
      return;
    }

    const tick = () => {
      if (indexRef.current < fullText.length) {
        // Add chars in chunks for faster animation on long texts
        const chunkSize = fullText.length > 600 ? 8 : fullText.length > 300 ? 5 : 3;
        const end = Math.min(indexRef.current + chunkSize, fullText.length);
        setDisplayText(fullText.slice(0, end));
        indexRef.current = end;
        timerRef.current = setTimeout(tick, speed);
      } else {
        setIsDone(true);
      }
    };

    timerRef.current = setTimeout(tick, speed);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [fullText, speed]);

  return { displayText, isDone };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function notifyChatbotActivity(payload: Record<string, any>) {
  fetch("/api/chatbot-notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.warn("Chatbot Telegram notification failed", err);
  });
}

const AUTHOR_PHOTO = "/images/author-photo.jpg";

// ── Page map ─────────────────────────────────────────────────────────────────
const PAGE_MAP: { path: string; label: string; keywords: string[] }[] = [
  { path: "/about",    label: "পরিচিতি পেজ দেখুন",    keywords: ["about", "পরিচিতি", "পরিচয়", "জীবনী"] },
  { path: "/ebooks",   label: "বই ও ই-বুক সংগ্রহ দেখুন", keywords: ["ebooks", "ebook", "ই-বুক", "বই"] },
  { path: "/writings", label: "লেখালেখি পেজ দেখুন",   keywords: ["writings", "writing", "লেখালেখি", "লেখা", "কবিতা"] },
  { path: "/contact",  label: "যোগাযোগ পেজ দেখুন",    keywords: ["contact", "যোগাযোগ", "ইমেইল"] },
  { path: "/editor",   label: "ডিজাইন স্টুডিও খুলুন", keywords: ["editor", "ডিজাইন", "স্টুডিও", "ফরম্যাট"] },
  { path: "/",         label: "হোম পেজ দেখুন",        keywords: ["home", "হোম"] },
  { path: "/ebooks/read/smritir-boshonte", label: "স্মৃতির বসন্তে তুমি পড়ুন",  keywords: ["smritir", "স্মৃতির বসন্তে"] },
  { path: "/ebooks/read/chand-phool",      label: "চাঁদফুল পড়ুন",              keywords: ["chand-phool", "চাঁদফুল"] },
  { path: "/ebooks/read/shomoyer-gohvore", label: "সময়ের গহ্বরে পড়ুন",        keywords: ["shomoyer", "সময়ের গহ্বরে"] },
  { path: "/facebook-recitations",         label: "আবৃত্তি সংগ্রহ দেখুন",      keywords: ["recitation", "আবৃত্তি", "facebook"] },
  { path: "/ebooks/read/dukkhovilash",    label: "দুঃখবিলাস বই পড়ুন",           keywords: ["dukkhovilash", "দুঃখবিলাস", "বিচ্ছেদ"] },
  { path: "/gallery",                     label: "গ্যালারি দেখুন",               keywords: ["gallery", "গ্যালারি", "ছবি", "ফটো"] },
  { path: "/news",                        label: "সরদার সংবাদ দেখুন",            keywords: ["news", "সংবাদ", "নিউজ", "সরদার সংবাদ"] },
];

// ── Audio edit request detection ───────────────────────────────────────────────
const PHOTO_KEYWORDS = [
  "ছবি", "photo", "picture", "image", "ফটো", "দেখতে", "চেহারা",
  "মুখ", "face", "look", "দেখাও", "দেখান", "কেমন দেখতে",
];

function isPhotoRequest(text: string): boolean {
  const lower = text.toLowerCase();

  // FIX: Exclude image-edit requests — "ছবি এডিট", "ছবি ক্রপ" etc. should NOT trigger photo display
  const imageEditExclusions = [
    "ছবি এডিট", "ছবি এডিটিং", "ছবি সম্পাদনা",
    "ফটো এডিট", "ফটো এডিটিং",
    "image edit", "photo edit", "picture edit",
    "ছবি ঠিক", "ছবি সুন্দর", "ছবি ক্রপ", "ছবি কাটো",
    "ছবি রিটাচ", "ছবি রিসাইজ", "ছবি কম্প্রেস",
    "ছবি বানাও", "ছবি তৈরি",
    "image editor", "photo editor",
    // Gallery/page navigation — should NOT show author photo
    "গ্যালারি", "gallery",
    // Analysis requests with image attached — handled separately
    "ছবি বিশ্লেষণ", "ছবি দেখে", "ছবিতে", "ছবির মধ্যে",
    "analyze image", "describe image", "what is in the image",
  ];
  if (imageEditExclusions.some(kw => lower.includes(kw))) return false;

  // FIX: Require more specific context — "ছবি" alone is too broad
  // Must be combined with "দেখাও"/"দেখান" or author-specific keywords
  if (lower.includes("ছবি") || lower.includes("ফটো") || lower.includes("photo") || lower.includes("picture") || lower.includes("image")) {
    const showKeywords = ["দেখাও", "দেখান", "দেখতে", "কেমন দেখতে", "মুখ", "face", "look", "চেহারা", "লেখকের ছবি", "লেখকের ফটো", "author photo", "author image"];
    return showKeywords.some(kw => lower.includes(kw));
  }

  return PHOTO_KEYWORDS.some(kw => lower.includes(kw));
}

// ── Live Chat request detection ─────────────────────────────────────────────
const LIVE_CHAT_KEYWORDS = [
  "সরাসরি কথা বলতে চাই", "সরাসরি কথা বলব", "সরাসরি কথা বলবো",
  "লাইভ চ্যাট", "live chat", "livechat",
  "সরাসরি চ্যাট", "real person", "মানুষের সাথে কথা",
  "আপনার সাথে কথা বলতে চাই", "তার সাথে কথা বলতে চাই",
  "সরাসরি যোগাযোগ", "সরাসরি বলতে চাই",
];
function isLiveChatRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return LIVE_CHAT_KEYWORDS.some(kw => lower.includes(kw));
}

// ── Audio edit request detection ─────────────────────────────────────────────
const AUDIO_EDIT_KEYWORDS = [
  // Basic — NOTE: "এডিট"/"edit" removed to prevent false positives with image/video editing
  "অডিও", "audio", "গান", "song", "sound", "ভয়েস", "voice",
  "mp3", "wav", "ogg", "flac", "aac", "m4a",
  "ভলিউম", "volume", "ট্রিম", "trim", "কাটো", "কাট",
  "ফেড", "fade", "গতি", "speed", "নয়েজ", "noise",
  "রিভার্ব", "reverb", "বেস", "bass", "ট্রেবল", "treble",
  "রূপান্তর", "convert",
  // Voice Beautify
  "মধুময়", "honey", "মিষ্টি কণ্ঠ", "মধুর",
  "রেশমি", "silky", "মসৃণ", "smooth", "নরম",
  "ব্রডকাস্ট", "broadcast", "নিউজ ভয়েস",
  "asmr", "ফিসফিস", "whisper",
  "সিনেমা", "cinematic", "হলিউড",
  "স্বর্গীয়", "angelic", "ফেরেশ্তা",
  "পুরনো রেডিও", "vintage", "retro",
  "পডকাস্ট প্রো", "podcast pro",
  "lofi", "lo-fi", "ক্যাসেট",
  "ন্যারেটর", "narrator", "অডিওবুক",
  "জ্যাজ", "jazz",
  "এপিক", "epic", "হিরো", "powerful",
  "sweet voice", "মেয়েলি",
  "স্ফটিক", "crystal", "পরিষ্কার",
  "গভীর উষ্ণ", "deep warm", "পুরুষালি",
  // Effects
  "ইকো", "echo", "কোরাস", "chorus", "পিচ", "pitch",
  "রোবট", "robot", "টেলিফোন", "telephone",
  "মেগাফোন", "megaphone", "পানির নিচে", "underwater",
  "গুহা", "cave", "স্টেডিয়াম", "stadium",
  "ভিনাইল", "vinyl", "টেপ", "tape",
  "ফ্ল্যাঞ্জার", "flanger", "ফেজার", "phaser",
  "ট্রেমোলো", "tremolo", "ভাইব্রেটো", "vibrato",
  "বিটক্রাশার", "bitcrusher", "8-bit",
  "এলিয়েন", "alien", "রেডিও", "radio",
  // Processing
  "কম্প্রেস", "compress", "লিমিটার", "limiter",
  "গেট", "gate", "ডি-এস", "de-ess",
  "হাম", "hum", "ক্লিক", "click", "পপ", "pop",
  "স্টেরিও", "stereo", "মনো", "mono",
  "অটো টিউন", "auto-tune", "auto tune",
  "প্রফেশনাল", "professional", "স্টুডিও", "studio",
  "পডকাস্ট", "podcast", "ভয়েসওভার", "voiceover",
  // NOTE: "কবিতা", "আবৃত্তি", "recitation" intentionally removed to prevent false positives
  // These are handled by audio-edit.js backend when actual audio file is present
  "সুন্দর করো", "ভালো করো", "উন্নত করো",
  "কণ্ঠ", "কণ্ঠস্বর",
  // New v7.0 keywords
  "youtube", "tiktok", "reels", "audiobook", "meditation",
  "news anchor", "নিউজ", "সংবাদ", "conference", "মিটিং",
  "শ্বাস", "breath", "de-reverb", "রুম",
  "ডাবল", "doubler", "স্যাচুরেশন", "saturation",
  "ক্লারিটি", "clarity", "পাঞ্চ", "punch",
  "উষ্ণতা", "warmth", "এয়ার", "air", "ব্রিলিয়ান্স",
  "ফোকাস", "focus", "ডায়নামিক", "dynamic",
  "মাল্টিব্যান্ড", "multiband", "রুম কারেকশন",
  "whatsapp", "telegram", "ভয়েস মেসেজ",
];

// Keywords that indicate the user is asking about poetry/recitation as CONTENT (not audio editing)
const POETRY_CONTENT_KEYWORDS = [
  "কবিতা পড়তে", "কবিতা পড়ব", "কবিতা দেখতে", "কবিতা লিখে", "কবিতা লিখে দিন",
  "কবিতা শুনতে", "কবিতা শুনব", "কবিতা বলুন", "কবিতা বলো",
  "কবিতা আছে", "কবিতা কোথায়", "কবিতা দেখান",
  "আবৃত্তি দেখতে", "আবৃত্তি শুনতে", "আবৃত্তি শুনব", "আবৃত্তি ভিডিও",
  "আবৃত্তি সংগ্রহ", "আবৃত্তি কোথায়", "আবৃত্তি দেখান",
  "লেখকের কবিতা", "লেখকের আবৃত্তি", "ধর্মীয় কবিতা",
  "poem", "poetry", "recitation video", "recitation collection",
];

// Keywords that indicate image/photo/video editing — NOT audio editing
const IMAGE_EDIT_EXCLUSION_KEYWORDS = [
  "ছবি এডিট", "ছবি এডিটিং", "ছবি সম্পাদনা",
  "ফটো এডিট", "ফটো এডিটিং",
  "image edit", "photo edit", "picture edit",
  "ছবি ঠিক", "ছবি সুন্দর", "ছবি ক্রপ", "ছবি কাটো",
  "ছবি রিটাচ", "ছবি রিসাইজ", "ছবি কম্প্রেস",
  "ভিডিও এডিট", "ভিডিও এডিটিং", "video edit", "video editing",
  "ডিজাইন এডিট", "design edit",
  "ছবি বানাও", "ছবি তৈরি",
  "ছবি এডিট করবো", "ছবি এডিট করব", "ছবি এডিট করতে",
  "ছবি এডিট করুন", "ছবি এডিট করো",
  "ফটো এডিট করবো", "ফটো এডিট করব",
  "image editor", "photo editor",
];

function isAudioEditRequest(text: string): boolean {
  const lower = text.toLowerCase();

  // First check: if the text is clearly about image/photo/video editing, NOT audio
  const isImageEditQuery = IMAGE_EDIT_EXCLUSION_KEYWORDS.some(kw => lower.includes(kw));
  if (isImageEditQuery) return false;

  // Also check for "ছবি" or "photo"/"image" combined with edit-like words
  const imageEditPattern = /(ছবি|ফটো|photo|image|picture|pic).{0,15}(এডিট|edit|সম্পাদন|ঠিক|সুন্দর|ক্রপ|crop|রিটাচ|retouch|রিসাইজ|resize|ফিল্টার|filter)|(এডিট|edit).{0,15}(ছবি|ফটো|photo|image|picture)/i;
  if (imageEditPattern.test(lower)) return false;

  // Check for video editing
  const videoEditPattern = /(ভিডিও|video).{0,15}(এডিট|edit|সম্পাদন|কাটো|trim|ক্লিপ|clip)/i;
  if (videoEditPattern.test(lower)) return false;

  // Second check: if the text is clearly about poetry/recitation as CONTENT, not audio editing
  const isPoetryContentQuery = POETRY_CONTENT_KEYWORDS.some(kw => lower.includes(kw));
  if (isPoetryContentQuery) return false;

  // Also check for patterns like "কবিতা + question words" which indicate content queries
  const poetryQuestionPattern = /কবিতা.{0,20}(কোথা|কী|কি|কেন|কিভাবে|কিভাব|পাব|পায়|দেখান|লিখেদিন|লিখে দিন)|আবৃত্তি.{0,20}(কোথা|কী|কি|ভিডিও|পাব|দেখতে)/;
  if (poetryQuestionPattern.test(lower)) return false;

  return AUDIO_EDIT_KEYWORDS.some(kw => lower.includes(kw));
}

// ── Photo request detection ───────────────────────────────────────────────────
const CONTACT_KEYWORDS = [
  "মেসেঞ্জ পাঠাও", "মেসেঞ্জ করো", "মেসেঞ্জ করতে চাই", "মেসেঞ্জ দিতে চাই",
  "যোগাযোগ করতে চাই", "যোগাযোগ করব", "যোগাযোগ করবো",
  "ইমেইল করব", "ইমেইল করতে চাই", "ইমেইল পাঠাব", "ইমেইল দিতে চাই",
  "মেসেঞ্জারে", "messenger", "facebook message", "fb message",
  "contact", "কথা বলতে চাই",
  "reach out", "get in touch",
];

function isContactRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return CONTACT_KEYWORDS.some(kw => lower.includes(kw));
}

// ── Runtime note ─────────────────────────────────────────────────────────────
// The authoritative chatbot knowledge lives on the server in api/chat-knowledge.js.
// The frontend no longer sends a duplicate system prompt, preventing stale memory drift.

function formatTime(date: Date): string {
  return date.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
}

function formatAudioFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "অডিও ফাইল";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAudioFormatLabel(name?: string, mime?: string): string {
  const ext = name?.split(".").pop()?.toUpperCase();
  if (ext && ext.length <= 5) return ext;
  if (mime?.includes("mpeg")) return "MP3";
  if (mime?.includes("wav")) return "WAV";
  if (mime?.includes("ogg")) return "OGG";
  if (mime?.includes("mp4") || mime?.includes("m4a")) return "M4A";
  return "AUDIO";
}

function extractAudioInstruction(content: string): string {
  const marker = "নির্দেশ:";
  const index = content.indexOf(marker);
  return index >= 0 ? content.slice(index + marker.length).trim() : content.trim();
}

function UserAudioAttachmentCard({ message, instruction }: { message: Message; instruction: string }) {
  return (
    <div style={{
      background: "linear-gradient(145deg, rgba(10,22,40,0.92) 0%, rgba(4,10,22,0.98) 100%)",
      border: "1px solid rgba(10,22,40,0.18)",
      borderRadius: 14,
      padding: "9px 10px",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(10,22,40,0.16)",
      color: "#F8E9B6",
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          background: "linear-gradient(135deg, rgba(212,168,67,0.95), rgba(232,192,96,0.9))",
          color: "#071121",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 5px 14px rgba(212,168,67,0.24)",
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "0.72rem",
            fontWeight: 800,
            color: "#F7E7B0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            letterSpacing: "0.01em",
          }}>
            {message.userAudioName || "অডিও ফাইল"}
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            flexWrap: "wrap",
            marginTop: 3,
            color: "rgba(248,233,182,0.66)",
            fontSize: "0.55rem",
            fontWeight: 600,
          }}>
            <span style={{
              padding: "1px 6px",
              borderRadius: 999,
              background: "rgba(212,168,67,0.14)",
              border: "1px solid rgba(212,168,67,0.2)",
              color: "rgba(248,233,182,0.86)",
            }}>{getAudioFormatLabel(message.userAudioName, message.userAudioMime)}</span>
            <span>{formatAudioFileSize(message.userAudioSize)}</span>
            <span>প্রসেসিংয়ের জন্য যুক্ত</span>
          </div>
        </div>
      </div>

      {message.userAudioUrl && (
        <audio
          controls
          src={message.userAudioUrl}
          className="chatbot-audio-player"
          style={{
            width: "100%",
            height: 30,
            borderRadius: 8,
            marginTop: 8,
          }}
        />
      )}

      {instruction && (
        <div style={{
          marginTop: 8,
          padding: "7px 8px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,250,230,0.9)",
          fontSize: "0.65rem",
          lineHeight: 1.55,
          fontWeight: 650,
        }}>
          <span style={{ color: "rgba(212,168,67,0.86)", fontWeight: 800 }}>নির্দেশ:</span> {instruction}
        </div>
      )}
    </div>
  );
}

// ── AudioBuffer → WAV Blob converter ────────────────────────────────────────────────────
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numSamples = buffer.length;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  function writeStr(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeStr(0, "RIFF");
  view.setUint32(4, totalSize - 8, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);        // chunk size
  view.setUint16(20, 1, true);         // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);        // bits per sample
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  // Interleave channels
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

// ── Contact Card ─────────────────────────────────────────────────────────────
function ContactCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        background: "linear-gradient(145deg, rgba(16,28,48,0.98) 0%, rgba(12,22,40,0.98) 100%)",
        borderRadius: "4px 18px 18px 18px",
        padding: "14px 16px",
        border: "1px solid rgba(212,168,67,0.18)",
        borderLeft: "3px solid rgba(212,168,67,0.7)",
        boxShadow: "0 4px 18px rgba(0,0,0,0.3)",
        marginBottom: 4,
      }}
    >
      <p style={{
        color: "rgba(245,238,222,0.9)",
        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
        fontSize: "0.85rem",
        lineHeight: 1.8,
        marginBottom: 12,
      }}>
        মাহবুব সরদার সবুজের সাথে সরাসরি যোগাযোগ করুন:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {/* Messenger button */}
        <a
          href="https://m.me/MahbubSardarSabuj"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            background: "linear-gradient(135deg, rgba(0,120,255,0.15) 0%, rgba(0,90,200,0.1) 100%)",
            border: "1px solid rgba(0,120,255,0.35)",
            borderRadius: 12,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, rgba(0,120,255,0.28) 0%, rgba(0,90,200,0.2) 100%)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,120,255,0.65)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, rgba(0,120,255,0.15) 0%, rgba(0,90,200,0.1) 100%)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,120,255,0.35)";
          }}
        >
          {/* Messenger icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.906 1.419 5.5 3.638 7.22V22l3.316-1.82c.885.245 1.823.376 2.795.376 5.523 0 10-4.145 10-9.243C22 6.145 17.523 2 12 2z" fill="#0084FF"/>
            <path d="M13.5 14.5l-2.5-2.667L6 14.5l5.5-5.833 2.5 2.666L18.5 9l-5 5.5z" fill="white"/>
          </svg>
          <div>
            <div style={{ color: "#60a5fa", fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif", fontSize: "0.82rem", fontWeight: 700 }}>Messenger-এ মেসেজ করুন</div>
            <div style={{ color: "rgba(150,180,220,0.65)", fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif", fontSize: "0.68rem", marginTop: 1 }}>MahbubSardarSabuj</div>
          </div>
          <svg style={{ marginLeft: "auto", flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(100,160,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>

        {/* Email button */}
        <a
          href="mailto:lekhokmahbubsardarsabuj@gmail.com"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            background: "linear-gradient(135deg, rgba(212,168,67,0.12) 0%, rgba(212,168,67,0.06) 100%)",
            border: "1px solid rgba(212,168,67,0.35)",
            borderRadius: 12,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, rgba(212,168,67,0.25) 0%, rgba(212,168,67,0.15) 100%)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(212,168,67,0.65)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, rgba(212,168,67,0.12) 0%, rgba(212,168,67,0.06) 100%)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(212,168,67,0.35)";
          }}
        >
          {/* Email icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="3" fill="rgba(212,168,67,0.2)" stroke="#D4A843" strokeWidth="1.5"/>
            <polyline points="2,4 12,13 22,4" stroke="#D4A843" strokeWidth="1.5" fill="none"/>
          </svg>
          <div>
            <div style={{ color: "#D4A843", fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif", fontSize: "0.82rem", fontWeight: 700 }}>ইমেইল করুন</div>
            <div style={{ color: "rgba(212,168,67,0.55)", fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif", fontSize: "0.68rem", marginTop: 1 }}>lekhokmahbubsardarsabuj@gmail.com</div>
          </div>
          <svg style={{ marginLeft: "auto", flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,67,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
    </motion.div>
  );
}

// ── Parse AI response ───────────────
function parseContent(raw: string): { text: string; buttons: ActionButton[]; showPhoto: boolean; showContact: boolean; showLiveChat: boolean } {
  const buttons: ActionButton[] = [];
  const seen = new Set<string>();
  let showPhoto = false;
  let showContact = false;
  let showLiveChat = false;

  let text = raw.replace(/\[LIVE_CHAT\]/gi, () => { showLiveChat = true; return ""; });
  text = text.replace(/\[CONTACT\]/gi, () => { showContact = true; return ""; });
  text = text.replace(/\[PHOTO\]/gi, () => { showPhoto = true; return ""; });

  text = text.replace(/\[BUTTON:(\/[^\]]*)\]/g, (_, path) => {
    if (!seen.has(path)) {
      seen.add(path);
      const page = PAGE_MAP.find(p => p.path === path);
      buttons.push({ path, label: page?.label || "বিস্তারিত জানুন" });
    }
    return "";
  });

  // Replace both vercel and production domain URLs with navigation buttons
  const urlPattern = new RegExp(`https?://(?:mahbub-sardar-sabuj-live\\.vercel\\.app|(?:www\\.)?mahbubsardarsabuj\\.com)(/[^\\s)>"]*)`, "g");
  text = text.replace(
    urlPattern,
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
  return { text, buttons, showPhoto, showContact, showLiveChat };
}

// ── CSS Keyframes injected once ───────────────────────────────────────────────
const STYLE_ID = "chatbot-premium-styles";
if (!document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @font-face {
      font-family: 'AdorshoLipi';
      src: url('/fonts/AdorshoLipi.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    .chatbot-adorsho, .chatbot-adorsho * {
      font-family: 'AdorshoLipi', 'Noto Sans Bengali', sans-serif !important;
    }
    @keyframes chatbot-ping {
      0% { transform: scale(1); opacity: 0.7; }
      70% { transform: scale(1.8); opacity: 0; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    @keyframes chatbot-ping2 {
      0% { transform: scale(1); opacity: 0.35; }
      70% { transform: scale(2.4); opacity: 0; }
      100% { transform: scale(2.4); opacity: 0; }
    }
    @keyframes chatbot-shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes chatbot-glow-pulse {
      0%, 100% { opacity: 0.7; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.15); }
    }
    @keyframes chatbot-dot-bounce {
      0%, 60%, 100% { transform: translateY(0) scale(1); }
      30% { transform: translateY(-6px) scale(0.9); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes chatbot-fade-in {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes chatbot-border-glow {
      0%, 100% { box-shadow: 0 0 0 1px rgba(212,168,67,0.25), 0 0 20px rgba(212,168,67,0.06); }
      50%       { box-shadow: 0 0 0 1px rgba(212,168,67,0.5),  0 0 30px rgba(212,168,67,0.12); }
    }
    .chatbot-scrollbar::-webkit-scrollbar { width: 2px; }
    .chatbot-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .chatbot-scrollbar::-webkit-scrollbar-thumb { background: rgba(212,168,67,0.2); border-radius: 4px; }
    .chatbot-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212,168,67,0.45); }
    .chatbot-input::placeholder {
      color: rgba(160,140,100,0.38) !important;
      font-family: 'AdorshoLipi', 'Noto Sans Bengali', sans-serif !important;
      font-size: 0.78rem !important;
    }
    .chatbot-input:focus {
      border-color: rgba(212,168,67,0.5) !important;
      box-shadow: 0 0 0 2px rgba(212,168,67,0.07), inset 0 1px 3px rgba(0,0,0,0.2) !important;
    }
    .chatbot-suggestion-btn {
      transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
    }
    .chatbot-suggestion-btn:hover {
      background: rgba(212,168,67,0.1) !important;
      border-color: rgba(212,168,67,0.45) !important;
      color: #E8C060 !important;
      transform: translateY(-1px);
      box-shadow: 0 3px 12px rgba(212,168,67,0.12);
    }
    .chatbot-nav-btn {
      transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
    }
    .chatbot-nav-btn:hover {
      background: rgba(212,168,67,0.12) !important;
      border-color: rgba(212,168,67,0.6) !important;
      color: #E8C060 !important;
      box-shadow: 0 3px 10px rgba(212,168,67,0.18);
      transform: translateX(2px);
    }
    .chatbot-icon-btn {
      transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
    }
    .chatbot-icon-btn:hover {
      background: rgba(212,168,67,0.12) !important;
      border-color: rgba(212,168,67,0.5) !important;
    }
    .chatbot-send-btn {
      transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
    }
    .chatbot-send-btn:not(:disabled):hover {
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(212,168,67,0.4);
    }
    .chatbot-download-btn {
      transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
    }
    .chatbot-download-btn:hover {
      background: rgba(212,168,67,0.2) !important;
      border-color: rgba(212,168,67,0.7) !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(212,168,67,0.2);
    }
    .chatbot-tab-btn {
      transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
    }
    .chatbot-tab-btn:hover:not(.active) {
      color: rgba(212,168,67,0.75) !important;
      background: rgba(212,168,67,0.04) !important;
    }
    .chatbot-audio-player {
      accent-color: #D4A843;
    }
    .chatbot-audio-player::-webkit-media-controls-panel {
      background: rgba(12,22,38,0.95);
    }
    @keyframes chatbot-cursor-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes chatbot-slide-up {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .chatbot-drag-over {
      border-color: rgba(212,168,67,0.7) !important;
      background: rgba(212,168,67,0.06) !important;
      box-shadow: 0 0 0 2px rgba(212,168,67,0.2), 0 32px 80px rgba(0,0,0,0.85) !important;
    }
    .chatbot-msg-animate {
      animation: chatbot-slide-up 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}

// ── Message Bubble ────────────────────────────────────────────
function MessageBubble({ message, onNavigate, onSwitchToLive, isLatest }: { message: Message; onNavigate: (path: string) => void; onSwitchToLive: () => void; isLatest?: boolean }) {
  const isUser = message.role === "user";
  const userAudioInstruction = message.userAudioInstruction || (message.userAudioName ? extractAudioInstruction(message.content) : "");

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 14, y: 4 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}
      >
        <div style={{
          background: "linear-gradient(135deg, #C9A84C 0%, #D4A843 50%, #C0983C 100%)",
          color: "#0A1628",
          borderRadius: "16px 16px 3px 16px",
          padding: "8px 12px",
          maxWidth: "78%",
          fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
          fontSize: "0.78rem",
          lineHeight: 1.65,
          fontWeight: 600,
          boxShadow: "0 3px 14px rgba(212,168,67,0.25), 0 1px 4px rgba(0,0,0,0.2)",
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
                marginBottom: message.content || message.userAudioName ? 7 : 3,
                objectFit: "contain",
                border: "1.5px solid rgba(10,22,40,0.12)",
              }}
            />
          )}
          {message.userAudioName ? (
            <UserAudioAttachmentCard message={message} instruction={userAudioInstruction} />
          ) : (
            message.content
          )}
          <div style={{ fontSize: "0.55rem", color: "rgba(10,22,40,0.45)", marginTop: 3, textAlign: "right", letterSpacing: "0.02em" }}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </motion.div>
    );
  }

  const { text, buttons, showPhoto, showContact, showLiveChat } = parseContent(message.content);
  // Typing animation for latest assistant message
  const { displayText, isDone: typingDone } = useTypingText(isLatest ? text : "", 10);
  const renderedText = isLatest ? displayText : text;

  return (
    <motion.div
      initial={{ opacity: 0, x: -14, y: 4 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      style={{ display: "flex", gap: 8, marginBottom: 10 }}
    >
      {/* Small avatar */}
      <div style={{
        width: 28, height: 28,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        marginTop: 3,
        border: "1px solid rgba(212,168,67,0.5)",
        boxShadow: "0 0 8px rgba(212,168,67,0.25)",
      }}>
        <img src={AUTHOR_PHOTO} alt="AI" style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            t.parentElement!.innerHTML = '<span style="color:#D4A843;font-size:9px;display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#1a2e4a;font-weight:700;">AI</span>';
          }} />
      </div>

      <div style={{ maxWidth: "calc(100% - 44px)", flex: 1, minWidth: 0 }}>
        {showLiveChat && (
          <div style={{ marginBottom: 10 }}>
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
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
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(34,197,94,0.28) 0%, rgba(22,163,74,0.2) 100%)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(34,197,94,0.75)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.1) 100%)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(34,197,94,0.45)";
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(34,197,94,0.15)",
                border: "1.5px solid rgba(34,197,94,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: "#22c55e", fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif", fontSize: "0.83rem", fontWeight: 700 }}>সরাসরি চ্যাট শুরু করুন</div>
                <div style={{ color: "rgba(134,239,172,0.6)", fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif", fontSize: "0.68rem", marginTop: 1 }}>লাইভ চ্যাটে সরাসরি কথা বলুন</div>
              </div>
              <svg style={{ marginLeft: "auto", flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(34,197,94,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </motion.button>
          </div>
        )}
        {showContact && (
          <div style={{ marginBottom: 10 }}>
            <ContactCard />
          </div>
        )}
        {showPhoto && (
          <div style={{ marginBottom: 10 }}>
            <img src={AUTHOR_PHOTO} alt="মাহবুব সরদার সবুজ"
              style={{
                borderRadius: 12,
                width: "100%",
                maxWidth: 180,
                border: "2px solid rgba(212,168,67,0.55)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
              }} />
          </div>
        )}
        {/* ── Audio player & download (for edited audio messages) ── */}
        {message.audioUrl && (
          <div style={{
            background: "linear-gradient(145deg, rgba(11,19,34,0.98) 0%, rgba(8,15,28,0.98) 100%)",
            borderRadius: "3px 14px 14px 14px",
            padding: "10px 12px",
            border: "1px solid rgba(212,168,67,0.18)",
            borderLeft: "2px solid rgba(212,168,67,0.6)",
            boxShadow: "0 3px 14px rgba(0,0,0,0.3)",
            marginBottom: 7,
          }}>
            {/* Intent badge */}
            {message.audioIntent && (
              <div style={{ marginBottom: 7, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  background: "rgba(212,168,67,0.1)",
                  border: "1px solid rgba(212,168,67,0.3)",
                  borderRadius: 20,
                  color: "rgba(212,168,67,0.9)",
                  fontSize: "0.6rem",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                }}>
                  {message.audioIntent === "clean"     ? "🧹 পরিষ্কার প্রসেসিং" :
                   message.audioIntent === "enhance"   ? "✨ ভয়েস এনহ্যান্সমেন্ট" :
                   message.audioIntent === "podcast"   ? "🎙️ পডকাস্ট প্রিসেট" :
                   message.audioIntent === "studio"    ? "🎚️ স্টুডিও মাস্টার" :
                   message.audioIntent === "broadcast" ? "📡 ব্রডকাস্ট রেডি" :
                   message.audioIntent === "asmr"      ? "🌙 ASMR প্রসেসিং" :
                   message.audioIntent === "music"     ? "🎵 মিউজিক প্রসেসিং" :
                   message.audioIntent === "social"    ? "📱 সোশ্যাল মিডিয়া অপ্টিমাইজ" :
                   message.audioIntent === "trim"      ? "✂️ ট্রিম ও কাটাকাটি" :
                   message.audioIntent === "volume"    ? "🔊 ভলিউম অ্যাডজাস্ট" :
                   message.audioIntent === "eq"        ? "🎛️ EQ প্রসেসিং" :
                   message.audioIntent === "denoise"   ? "🔇 নয়েজ রিমুভাল" :
                   message.audioIntent === "vocal"        ? "🎤 ভোকাল প্রসেসিং" :
                   message.audioIntent === "natural_clean" ? "✨ ন্যাচারাল ক্লিন" :
                   message.audioIntent === "warm_voice"    ? "🌡️ ওয়ার্ম ভয়েস" :
                   message.audioIntent === "studio_clear"  ? "🎚️ স্টুডিও ক্লিয়ার" :
                   message.audioIntent === "soft_poetry"   ? "🌸 সফট পোয়েট্রি" :
                   message.audioIntent === "deep_recitation" ? "🎧 ডিপ রিসাইটেশন" :
                   message.audioIntent === "youtube_voice"     ? "🎥 YouTube ভয়েস" :
                   message.audioIntent === "tiktok_voice"      ? "🎤 TikTok ভয়েস" :
                   message.audioIntent === "audiobook_voice"   ? "🎧 অডিওবুক ভয়েস" :
                   message.audioIntent === "meditation_voice"  ? "🧘 মেডিটেশন ভয়েস" :
                   message.audioIntent === "news_anchor"       ? "🎤 নিউজ অ্যাঙ্কর" :
                   message.audioIntent === "bangla_recitation_pro" ? "🎬 আবৃত্তি প্রো" :
                                                          "⚙️ কাস্টম প্রসেসিং"
                  }
                </span>
              </div>
            )}
            {/* Vocal context badge */}
            {message.audioVocalContext && message.audioVocalContext !== "general" && (
              <div style={{ marginBottom: 7, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.22)",
                  borderRadius: 20,
                  color: "rgba(165,180,252,0.85)",
                  fontSize: "0.6rem",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                }}>
                  {message.audioVocalContext === "poetry"    ? "📝 কবিতা/আবৃত্তি মোড" :
                   message.audioVocalContext === "narration" ? "🎧 ন্যারেশন মোড" :
                   message.audioVocalContext === "deep"      ? "🎤 ডিপ ভয়েস মোড" :
                   message.audioVocalContext === "soft"      ? "🎙️ সফট ভয়েস মোড" :
                                                              "🔊 ভোকাল কন্টেক্সট"}
                </span>
              </div>
            )}
            {/* Pipeline steps (ordered) */}
            {message.audioPipeline && message.audioPipeline.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{
                  color: "rgba(212,168,67,0.45)",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "0.56rem",
                  fontWeight: 700,
                  marginBottom: 4,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}>প্রসেসিং পাইপলাইন</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "center" }}>
                  {message.audioPipeline.map((step, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                      <span style={{
                        padding: "1px 6px",
                        background: "rgba(99,102,241,0.08)",
                        border: "1px solid rgba(99,102,241,0.18)",
                        borderRadius: 6,
                        color: "rgba(165,180,252,0.75)",
                        fontSize: "0.56rem",
                        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      }}>{i + 1}. {step}</span>
                      {i < (message.audioPipeline?.length ?? 0) - 1 && (
                        <span style={{ color: "rgba(99,102,241,0.3)", fontSize: "0.5rem" }}>→</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Applied steps */}
            {message.audioAppliedSteps && message.audioAppliedSteps.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{
                  color: "rgba(74,222,128,0.45)",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "0.56rem",
                  fontWeight: 700,
                  marginBottom: 4,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}>সম্পন্ন পদক্ষেপ</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {message.audioAppliedSteps.map((step, i) => (
                    <span key={i} style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                      padding: "1px 7px",
                      background: "rgba(74,222,128,0.06)",
                      border: "1px solid rgba(74,222,128,0.18)",
                      borderRadius: 8,
                      color: "rgba(134,239,172,0.75)",
                      fontSize: "0.58rem",
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    }}>
                      <span style={{ color: "rgba(74,222,128,0.8)", fontSize: "0.55rem" }}>✓</span>
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Description */}
            {message.audioDescription && (
              <div style={{
                color: "rgba(235,225,200,0.85)",
                fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                fontSize: "0.75rem",
                lineHeight: 1.7,
                marginBottom: 8,
                borderTop: "1px solid rgba(212,168,67,0.08)",
                paddingTop: 7,
              }}>
                {message.audioDescription}
              </div>
            )}
            {/* Technical note */}
            {message.audioTechnicalNote && (
              <div style={{
                color: "rgba(140,155,175,0.65)",
                fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                fontSize: "0.6rem",
                lineHeight: 1.6,
                marginBottom: 7,
                padding: "4px 7px",
                background: "rgba(140,155,175,0.04)",
                borderRadius: 5,
                borderLeft: "1.5px solid rgba(140,155,175,0.15)",
              }}>
                🔬 {message.audioTechnicalNote}
              </div>
            )}
            {/* Audio player */}
            <audio
              controls
              src={message.audioUrl}
              className="chatbot-audio-player"
              style={{
                width: "100%",
                borderRadius: 8,
                height: 32,
                marginBottom: 7,
              }}
            />
            {/* Download button */}
            <a
              href={message.audioUrl}
              download={message.audioFilename || "edited_audio.wav"}
              className="chatbot-download-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 12px",
                background: "rgba(212,168,67,0.08)",
                border: "1px solid rgba(212,168,67,0.3)",
                borderRadius: 10,
                color: "rgba(212,168,67,0.85)",
                fontSize: "0.65rem",
                fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              ডাউনলোড করুন
            </a>
            {/* v9.0 Processing info badge */}
            {(message.processingVersion || message.outputSizeKB) && (
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginTop: 6,
                alignItems: "center",
              }}>
                {message.processingVersion && (
                  <span style={{
                    padding: "1px 6px",
                    background: "rgba(212,168,67,0.08)",
                    border: "1px solid rgba(212,168,67,0.2)",
                    borderRadius: 6,
                    color: "rgba(212,168,67,0.6)",
                    fontSize: "0.52rem",
                    fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}>⚙️ {message.processingVersion}</span>
                )}
                {message.outputSizeKB && (
                  <span style={{
                    padding: "1px 6px",
                    background: "rgba(74,222,128,0.05)",
                    border: "1px solid rgba(74,222,128,0.15)",
                    borderRadius: 6,
                    color: "rgba(74,222,128,0.55)",
                    fontSize: "0.52rem",
                    fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    fontWeight: 600,
                  }}>📦 {message.outputSizeKB} KB</span>
                )}
                {message.operationsApplied && message.operationsApplied.length > 0 && (
                  <span style={{
                    padding: "1px 6px",
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.15)",
                    borderRadius: 6,
                    color: "rgba(165,180,252,0.55)",
                    fontSize: "0.52rem",
                    fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    fontWeight: 600,
                  }}>🔧 {message.operationsApplied.length} অপারেশন</span>
                )}
              </div>
            )}
          </div>
        )}
        {renderedText && (
          <div style={{
            background: "linear-gradient(145deg, rgba(13,22,40,0.97) 0%, rgba(10,18,34,0.97) 100%)",
            borderRadius: "3px 14px 14px 14px",
            padding: "9px 12px",
            color: "rgba(238,230,210,0.92)",
            fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
            fontSize: "0.78rem",
            lineHeight: 1.75,
            whiteSpace: "pre-wrap",
            border: "1px solid rgba(212,168,67,0.13)",
            borderLeft: "2px solid rgba(212,168,67,0.55)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.02)",
            wordBreak: "break-word",
          }}>
            {renderedText}
            {isLatest && !typingDone && (
              <span style={{
                display: "inline-block",
                width: 2,
                height: "0.85em",
                background: "rgba(212,168,67,0.8)",
                marginLeft: 2,
                verticalAlign: "text-bottom",
                animation: "chatbot-cursor-blink 0.7s ease-in-out infinite",
              }} />
            )}
          </div>
        )}
        {buttons.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>
            {buttons.map(btn => (
              <button
                key={btn.path}
                onClick={() => onNavigate(btn.path)}
                className="chatbot-nav-btn"
                style={{
                  background: "rgba(212,168,67,0.06)",
                  border: "1px solid rgba(212,168,67,0.3)",
                  color: "rgba(212,168,67,0.85)",
                  borderRadius: 20,
                  padding: "4px 10px",
                  fontSize: "0.68rem",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  cursor: "pointer",
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                }}
              >
                {btn.label} →
              </button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
          <div style={{ color: "rgba(110,130,150,0.4)", fontSize: "0.55rem", paddingLeft: 1, letterSpacing: "0.02em" }}>
            {formatTime(message.timestamp)}
          </div>
          {renderedText && (
            <button
              onClick={() => {
                navigator.clipboard?.writeText(text).then(() => {
                  const btn = document.getElementById(`copy-btn-${message.id}`);
                  if (btn) { btn.textContent = "✓ কপি"; setTimeout(() => { btn.textContent = "⎘ কপি"; }, 1500); }
                }).catch(() => {});
              }}
              id={`copy-btn-${message.id}`}
              title="কপি করুন"
              style={{
                background: "none",
                border: "none",
                color: "rgba(212,168,67,0.35)",
                fontSize: "0.55rem",
                cursor: "pointer",
                padding: "1px 4px",
                borderRadius: 4,
                lineHeight: 1,
                fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(212,168,67,0.7)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(212,168,67,0.35)")}
            >⎘ কপি</button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Typing indicator ────────────────────────────────────────────
function TypingIndicator({ stage }: { stage?: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ display: "flex", gap: 10, marginBottom: 14 }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
        border: "1.5px solid rgba(212,168,67,0.65)",
        boxShadow: "0 0 10px rgba(212,168,67,0.35)",
      }}>
        <img src={AUTHOR_PHOTO} alt="AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{
        background: "linear-gradient(145deg, rgba(16,28,48,0.98) 0%, rgba(12,22,40,0.98) 100%)",
        border: "1px solid rgba(212,168,67,0.18)",
        borderLeft: "3px solid rgba(212,168,67,0.7)",
        borderRadius: "4px 18px 18px 18px",
        padding: stage ? "10px 14px" : "13px 16px",
        display: "flex",
        flexDirection: stage ? "column" : "row",
        gap: stage ? 6 : 5,
        alignItems: stage ? "flex-start" : "center",
        boxShadow: "0 4px 18px rgba(0,0,0,0.3)",
        minWidth: stage ? 140 : "auto",
      }}>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "linear-gradient(135deg, #E8C060, #D4A843)",
              boxShadow: "0 0 5px rgba(212,168,67,0.45)",
              animation: `chatbot-dot-bounce 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
          {stage && (
            <span style={{
              color: "rgba(212,168,67,0.7)",
              fontSize: "0.62rem",
              fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
              fontWeight: 600,
              marginLeft: 4,
              letterSpacing: "0.01em",
            }}>{stage}</span>
          )}
        </div>
        {stage && (
          <div style={{
            width: "100%",
            height: 2,
            background: "rgba(212,168,67,0.12)",
            borderRadius: 2,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              background: "linear-gradient(90deg, #D4A843, #E8C060, #D4A843)",
              backgroundSize: "200% 100%",
              animation: "chatbot-shimmer 1.5s linear infinite",
              borderRadius: 2,
              width: "60%",
            }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  // Cycling: 'photo' for 3s, then 'chat' for 2s, repeat
  const [btnFace, setBtnFace] = useState<'photo' | 'chat'>('photo');
  const cycleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (cycleRef.current) clearTimeout(cycleRef.current);
      return;
    }
    let cancelled = false;
    const cycle = (face: 'photo' | 'chat') => {
      if (cancelled) return;
      setBtnFace(face);
      cycleRef.current = setTimeout(() => {
        cycle(face === 'photo' ? 'chat' : 'photo');
      }, face === 'photo' ? 3000 : 2000);
    };
    cycle('photo');
    return () => {
      cancelled = true;
      if (cycleRef.current) clearTimeout(cycleRef.current);
    };
  }, [isOpen]);
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: `আস্সালামু আলাইকুম ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহ।
আমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI সহকারী।

আমি যেকোনো বিষয়ে সাহায্য করতে পারি:
• লেখক ও তাঁর বই, কবিতা, আবৃত্তি সম্পর্কে যেকোনো প্রশ্ন
• সাধারণ জ্ঞান, বিজ্ঞান, ইতিহাস, প্রযুক্তি ও যেকোনো বিষয়
• অডিও এডিট ও ভয়েস বিউটিফাই ফিচার
• ডিজাইন স্টুডিও ব্যবহারের গাইড
• সরাসরি লাইভ চ্যাটে যোগাযোগ

যেকোনো প্রশ্ন করুন, আমি উত্তর দেব!`,
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [btnPos, setBtnPos] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const retryPayloadRef = useRef<{ role: "user" | "assistant" | "system"; content: AIMessageContent }[] | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoConverting, setVideoConverting] = useState(false);
  const [audioProcessing, setAudioProcessing] = useState(false);
  const [audioProcessingStage, setAudioProcessingStage] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  // lastAudioBlob: stores the most recently edited audio so user can iterate
  const lastAudioBlobRef = useRef<{ blob: Blob; name: string } | null>(null);
  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, bx: 0, by: 0 });

  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"ai" | "live">("ai");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleNavigate = useCallback((path: string) => {
    setIsOpen(false);
    navigate(path);
  }, [navigate]);

  useEffect(() => {
    const handleExternalOpen = () => setIsOpen(true);
    window.addEventListener("open-chatbot", handleExternalOpen);
    return () => window.removeEventListener("open-chatbot", handleExternalOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const getAbsPos = useCallback(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const BW = 54, BH = 54;
    const defaultX = W - BW - 16;
    const defaultY = H - BH - 24;
    return {
      x: btnPos.x !== null ? btnPos.x : defaultX,
      y: btnPos.y !== null ? btnPos.y : defaultY,
    };
  }, [btnPos]);

  const clampPos = useCallback((x: number, y: number) => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const BW = 54, BH = 54;
    return {
      x: Math.max(0, Math.min(x, W - BW)),
      y: Math.max(0, Math.min(y, H - BH)),
    };
  }, []);

  const handleBtnMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    didDrag.current = false;
    const abs = getAbsPos();
    dragStart.current = { x: e.clientX, y: e.clientY, bx: abs.x, by: abs.y };

    let rafId: number | null = null;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - dragStart.current.x;
      const dy = ev.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        setBtnPos(clampPos(dragStart.current.bx + dx, dragStart.current.by + dy));
        rafId = null;
      });
    };
    const onUp = () => {
      isDragging.current = false;
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
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


  // ── Video select handler ──────────────────────────────────────────────
  const handleVideoSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    // Validate video file
    const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v|3gp|ts|mts)$/i.test(file.name);
    if (!isVideo) {
      setError("সমর্থিত ভিডিও ফর্ম্যাট: MP4, MOV, AVI, MKV, WebM, FLV, WMV, M4V");
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setError("ভিডিও ফাইলের আকার সর্বোচ্চ ২০০ MB হতে পারবে।");
      return;
    }

    setVideoFile(file);
    setVideoConverting(true);
    setError(null);

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const convertingMsgId = `ai-video-converting-${Date.now()}`;
    setMessages(prev => [...prev,
      {
        id: `user-video-upload-${Date.now()}`,
        role: "user" as const,
        content: `🎥 ${file.name} (${fileSizeMB} MB)`,
        timestamp: new Date(),
      },
      {
        id: convertingMsgId,
        role: "assistant" as const,
        content: `ভিডিও ফাইলটি (${fileSizeMB} MB) পেয়েছি! ভিডিও থেকে অডিও এক্সট্রাক্ট করছি...`,
        timestamp: new Date(),
      }
    ]);

    try {
      const videoArrayBuffer = await file.arrayBuffer();
      const videoBase64 = btoa(
        new Uint8Array(videoArrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const response = await fetch("/api/video-to-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoData: videoBase64,
          videoMime: file.type || "video/mp4",
          videoName: file.name,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}: অডিও এক্সট্রাক্শন ব্যর্থ`);
      }

      const result = await response.json();
      const { audioData, audioMime = "audio/mpeg", duration, audioFilename: extractedName } = result;

      // Convert base64 → File
      const audioBytes = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: audioMime });
      const audioFileName = extractedName || file.name.replace(/\.[^.]+$/, "") + "_audio.mp3";
      const extractedAudioFile = new File([audioBlob], audioFileName, { type: audioMime });

      setVideoConverting(false);
      setVideoFile(null);

      const durationStr = duration
        ? ` (দৈর্ঘ্য: ${Math.floor(duration / 60)}মি ${Math.round(duration % 60)}সে)`
        : "";

      // Update the converting message to success
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.role === "assistant") {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: `✅ অডিও এক্সট্রাক্শন সফল${durationStr}!\n\nএখন আপনি অডিওটি এডিট করতে পারেন। যেমন বলতে পারেন:\n• ভোকাল ক্লিন করো\n• নয়েজ কমাও\n• কবিতার জন্য উপযুক্ত করো\n• অথবা আপনার মতো নির্দেশ দিন`,
          };
        }
        return updated;
      });

      // Treat extracted audio as regular audio file
      setAudioFile(extractedAudioFile);
      setIsAudioMode(true);

    } catch (err: any) {
      setVideoConverting(false);
      setVideoFile(null);
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.role === "assistant") {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: `❌ ভিডিও থেকে অডিও এক্সট্রাক্শন ব্যর্থ: ${err.message}`,
          };
        }
        return updated;
      });
      setError(`ভিডিও থেকে অডিও এক্সট্রাক্শন ব্যর্থ: ${err.message}`);
    }
  }, [messages]);

  // ── Audio select handler ──────────────────────────────────────────────
  const handleAudioSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // FIX: Validate BEFORE resetting e.target.value — so on hard-fail, the input is not cleared
    if (file.size > 50 * 1024 * 1024) {
      e.target.value = "";
      setError("অডিও ফাইলের আকার সর্বোচ্চ ৫০ MB হতে পারবে।");
      return;
    }
    if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|ogg|flac|aac|m4a|webm|opus)$/i)) {
      e.target.value = "";
      setError("সমর্থিত ফর্ম্যাট: MP3, WAV, OGG, FLAC, AAC, M4A");
      return;
    }
    // Vercel 4.5MB payload limit warning for large files (non-blocking)
    if (file.size > 3.5 * 1024 * 1024) {
      setError(`সতর্কতা: ফাইলটি বড় (~${(file.size / 1024 / 1024).toFixed(1)} MB)। Vercel-এর সীমার কারণে প্রসেসিং ব্যর্থ হতে পারে। MP3 বা ছোট ফাইল ব্যবহার করুন।`);
      // Don't return — still allow the user to try
    }
    // Reset input AFTER all hard validations pass
    e.target.value = "";

    // Smart auto-run: if there's already a pending instruction in input or recent chat, run immediately
    const currentInput = input.trim();

    // Find instruction from recent chat messages (last user message that's an audio edit request)
    let pendingInstruction = currentInput;
    if (!pendingInstruction) {
      const recentUserMsgs = messages
        .filter(m => m.role === "user")
        .slice(-5)
        .map(m => m.content)
        .reverse();
      for (const msg of recentUserMsgs) {
        const clean = msg.replace(/🎵.*?\n.*?\n?/g, "").trim();
        if (clean && !clean.startsWith("🎵") && isAudioEditRequest(clean)) {
          pendingInstruction = clean;
          break;
        }
      }
    }

    if (pendingInstruction) {

      // Auto-run immediately with the found instruction
      setAudioFile(file);
      setIsAudioMode(true);
      setInput("");
      // Use setTimeout to ensure state updates before calling
      setTimeout(async () => {
        // Directly call the API without waiting for state
        if (audioProcessing) return;
        setAudioProcessing(true);
        setError(null);
        const userMsg: Message = {
          id: `user-audio-${Date.now()}`,
          role: "user",
          content: `🎧 ${file.name}\n\nনির্দেশ: ${pendingInstruction}`,
          timestamp: new Date(),
          userAudioName: file.name,
          userAudioSize: file.size,
          userAudioMime: file.type || "audio/wav",
          userAudioUrl: URL.createObjectURL(file),
          userAudioInstruction: pendingInstruction,
        };
        setMessages(prev => [...prev, userMsg]);
        try {
          // ── Unified JSON/base64 path (same as handleAudioEdit) ──
          const audioArrayBuffer = await file.arrayBuffer();
          const audioBase64 = await new Promise<string>((resolve) => {
            const blob = new Blob([audioArrayBuffer]);
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(",")[1]);
            reader.readAsDataURL(blob);
          });
          const audioMime = file.type || "audio/wav";
          const audioController = new AbortController();
          const audioTimeout = setTimeout(() => audioController.abort(), 58000);
          let response: Response;
          try {
            response = await fetch("/api/audio-edit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ instruction: pendingInstruction, audioData: audioBase64, audioMime }),
              signal: audioController.signal,
            });
          } finally {
            clearTimeout(audioTimeout);
          }
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${response.status}`);
          }
          const respJson2 = await response.json();
          // needsMusicFile হ্যান্ডলিং
          if (respJson2.needsMusicFile || respJson2.intent === "ask_music_file") {
            const helpMsg = respJson2.explanation || "ব্যাকগ্রাউন্ড মিউজিক যোগ করতে মিউজিক ফাইল দরকার।";
            setMessages(prev => [...prev, {
              id: `ai-music-req-${Date.now()}`,
              role: "assistant" as const,
              content: `🎵 **মিউজিক ফাইল দরকার**\n\n${helpMsg}\n\nনিচের 🎵 বাটনে ক্লিক করে মিউজিক ফাইল আপলোড করুন (MP3/WAV/OGG) — তারপর আমি ভোকালের সাথে মিক্স করে দেব।`,
              timestamp: new Date(),
              audioIntent: "ask_music_file",
            }]);
            setTimeout(() => audioFileInputRef.current?.click(), 400);
            return;
          }
          const {
            audioData: resultBase64,
            audioMime: resultMime = "audio/wav",
            description,
            appliedSteps = [],
            intent = "custom",
            pipeline = [],
            technicalNote = null,
          } = respJson2;
          if (!resultBase64 || typeof resultBase64 !== "string") {
            throw new Error("সার্ভার থেকে অডিও ডেটা পাওয়া যায়নি।");
          }
          const cleanBase64_2 = resultBase64.replace(/^data:[^;]+;base64,/, "").replace(/\s/g, "");
          let resultBytes: Uint8Array;
          try {
            resultBytes = Uint8Array.from(atob(cleanBase64_2), c => c.charCodeAt(0));
          } catch (e) {
            throw new Error("অডিও ডিকোডিং ব্যার্থ। আবার চেষ্টা করুন।");
          }
          const resultArrayBuffer = new ArrayBuffer(resultBytes.byteLength);
          new Uint8Array(resultArrayBuffer).set(resultBytes);
          const wavBlob = new Blob([resultArrayBuffer], { type: resultMime });
          const audioUrl = URL.createObjectURL(wavBlob);
          const audioFilename = `edited_${Date.now()}.mp3`;
          // Save for iterative editing
          lastAudioBlobRef.current = { blob: wavBlob, name: audioFilename };
          setMessages(prev => [...prev, {
            id: `ai-audio-${Date.now()}`,
            role: "assistant",
            content: description || "অডিও প্রসেসিং সম্পন্ন হয়েছে।",
            timestamp: new Date(),
            audioUrl,
            audioFilename,
            audioDescription: description,
            audioAppliedSteps: appliedSteps,
            audioIntent: intent,
            audioPipeline: pipeline,
            audioTechnicalNote: technicalNote,
          }]);
          notifyChatbotActivity({
            type: "audio_edit_completed",
            title: "AI Chatbot Audio Editing",
            userMessage: `ফাইল: ${file.name}\nনির্দেশ: ${pendingInstruction}`,
            aiResponse: description || "অডিও প্রসেসিং সম্পন্ন হয়েছে।",
            audioData: audioBase64,
            audioMime,
            audioFilename: file.name,
            editedAudioData: resultBase64,
            editedAudioMime: resultMime,
            editedAudioFilename: audioFilename,
            metadata: { intent, pipeline, appliedSteps },
          });
          setAudioFile(null);
          setIsAudioMode(false);
    setVideoFile(null);
    setVideoConverting(false);
        } catch (err: any) {
          setError(`অডিও এডিটিং ব্যর্থ: ${err.message}`);
        } finally {
          setAudioProcessing(false);
        }
      }, 100);
    } else {
      // No pending instruction — set file and AI asks what to do
      setAudioFile(file);
      setIsAudioMode(true);
      setInput("");
      // AI greets with a question
      const fileName = file.name;
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setMessages(prev => [...prev,
        // User message showing the uploaded file
        {
          id: `user-audio-upload-${Date.now()}`,
          role: "user" as const,
          content: `🎧 ${fileName}`,
          timestamp: new Date(),
          userAudioName: fileName,
          userAudioSize: file.size,
          userAudioMime: file.type || "audio/mpeg",
          userAudioUrl: URL.createObjectURL(file),
          userAudioInstruction: "",
        },
        // AI asks what to do
        {
          id: `ai-ask-instruction-${Date.now()}`,
          role: "assistant" as const,
          content: `ফাইলটি (${fileSizeMB} MB) পেয়েছি। আপনি কী করতে চান?\n\nযেমন বলতে পারেন:\n• ভোকাল ক্লিন করো\n• নয়েজ কমাও\n• কবিতার জন্য উপযুক্ত করো\n• অথবা আপনার মতো নির্দেশ দিন`,
          timestamp: new Date(),
        }
      ]);
    }
  }, [input, messages, audioProcessing]);

  // ── Audio edit submit ──────────────────────────────────────────────────────
  const handleAudioEdit = useCallback(async (overrideInstruction?: string) => {
    // Allow iterative editing: use lastAudioBlobRef if no new file selected
    const sourceFile: File | Blob | null = audioFile || (
      lastAudioBlobRef.current
        ? new File([lastAudioBlobRef.current.blob], lastAudioBlobRef.current.name, { type: "audio/wav" })
        : null
    );
    if (!sourceFile || audioProcessing) return;

    // Warn user if file is too large for Vercel
    if (sourceFile.size > 3.5 * 1024 * 1024) {
      setError(`সতর্কতা: ফাইলটি বড় (~${(sourceFile.size / 1024 / 1024).toFixed(1)} MB) — Vercel সীমার কারণে ব্যর্থ হতে পারে। MP3 ব্যবহার করুন।`);
    }

    // Smart instruction resolution
    let instruction = overrideInstruction || input.trim();
    if (!instruction) {
      const recentUserMsgs = messages.filter(m => m.role === "user").slice(-5).map(m => m.content).reverse();
      for (const msg of recentUserMsgs) {
        const clean = msg.replace(/🎵.*?\n.*?\n?/g, "").trim();
        if (clean && !clean.startsWith("🎵") && isAudioEditRequest(clean)) { instruction = clean; break; }
      }
    }
    if (!instruction) instruction = "অডিওটি স্বয়ংক্রিয়ভাবে মান উন্নত করো, নয়েজ কমাও";

    const sourceName = audioFile?.name || lastAudioBlobRef.current?.name || "audio.wav";
    const userMsg: Message = {
      id: `user-audio-${Date.now()}`,
      role: "user",
      content: `🎵 ${sourceName}\n\nনির্দেশ: ${instruction}`,
      timestamp: new Date(),
      userAudioName: sourceName,
      userAudioSize: sourceFile.size,
      userAudioMime: sourceFile.type || "audio/wav",
      userAudioUrl: URL.createObjectURL(sourceFile),
      userAudioInstruction: instruction,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setAudioProcessing(true);
    setAudioProcessingStage("অডিও ফাইল পড়া হচ্ছে...");
    setError(null);
    // Clear audioFile immediately so the banner disappears right away
    setAudioFile(null);

    try {
      // ═══════════════════════════════════════════════════════════════════════════════
      // MANUS AI-STYLE AUDIO PROCESSING ENGINE v7.0 — FFmpeg Server-Side
      // ═══════════════════════════════════════════════════════════════════════════════

      // Step 1: Read audio file as base64
      setAudioProcessingStage("AI নির্দেশ বিশ্লেষণ করছে...");
      const audioArrayBuffer = await sourceFile.arrayBuffer();
      const audioBase64 = await new Promise<string>((resolve) => {
        const blob = new Blob([audioArrayBuffer]);
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(blob);
      });
      const audioMime = sourceFile.type || "audio/wav";

      // Step 2: Send to server — AI intent detection + FFmpeg processing in one call
      setAudioProcessingStage("প্রসেসিং চলছে...");
      const editController = new AbortController();
      const editTimeout = setTimeout(() => editController.abort(), 58000);
      let serverResp: Response;
      try {
        serverResp = await fetch("/api/audio-edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instruction,
            audioData: audioBase64,
            audioMime,
          }),
          signal: editController.signal,
        });
      } finally {
        clearTimeout(editTimeout);
      }

      if (!serverResp.ok) {
        const errData = await serverResp.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${serverResp.status}: সার্ভার প্রসেসিং ব্যর্থ`);
      }

      const respJson = await serverResp.json();

      // সমস্যা ১: needsMusicFile হ্যান্ডলিং — মিউজিক ফাইল দরকার হলে বার্তা দেখানো
      if (respJson.needsMusicFile || respJson.intent === "ask_music_file") {
        const pipelineText = Array.isArray(respJson.pipeline) ? respJson.pipeline.join("\n") : "";
        const helpMsg = respJson.explanation || "ব্যাকগ্রাউন্ড মিউজিক যোগ করতে মিউজিক ফাইল দরকার।";
        setMessages(prev => [...prev, {
          id: `ai-music-req-${Date.now()}`,
          role: "assistant",
          content: `🎵 **মিউজিক ফাইল দরকার**\n\n${helpMsg}\n\n${pipelineText}\n\nনিচের 🎵 বাটনে ক্লিক করে মিউজিক ফাইল আপলোড করুন (MP3/WAV/OGG) — তারপর আমি ভোকালের সাথে মিক্স করে দেব।`,
          timestamp: new Date(),
          audioIntent: "ask_music_file",
        }]);
        // অডিও ফাইল পিকার অটো-ওপেন করা
        setTimeout(() => audioFileInputRef.current?.click(), 400);
        return;
      }

      const {
        audioData: resultBase64,
        audioMime: resultMime = "audio/wav",
        description,
        appliedSteps = [],
        intent = "custom",
        pipeline = [],
        technicalNote = null,
        vocalContext = null,
        processingVersion = "v9.0",
        operationsApplied = [],
        outputSizeKB = null,
      } = respJson;

      // সমস্যা ২: resultBase64 না থাকলে স্পষ্ট এরর দেখানো
      if (!resultBase64 || typeof resultBase64 !== "string" || resultBase64.trim() === "") {
        throw new Error("সার্ভার থেকে অডিও ডেটা পাওয়া যায়নি। আবার চেষ্টা করুন।");
      }

      // Step 3: Decode result base64 → Blob → URL
      setAudioProcessingStage("অডিও প্রস্তুত হচ্ছে...");
      // সমস্যা ৩: base64 ডিকোডিং স্যানিটাইজ করা
      const cleanBase64 = resultBase64.replace(/^data:[^;]+;base64,/, "").replace(/\s/g, "");
      let resultBytes: Uint8Array;
      try {
        resultBytes = Uint8Array.from(atob(cleanBase64), c => c.charCodeAt(0));
      } catch (decodeErr) {
        throw new Error(`অডিও ডিকোডিং ব্যার্থ: সার্ভার থেকে অডিও ফর্ম্যাট সঠিক নয়। আবার চেষ্টা করুন।`);
      }
      const resultArrayBuffer = new ArrayBuffer(resultBytes.byteLength);
      new Uint8Array(resultArrayBuffer).set(resultBytes);
      const wavBlob = new Blob([resultArrayBuffer], { type: resultMime });
      const audioUrl = URL.createObjectURL(wavBlob);
      const audioFilename = `edited_${Date.now()}.mp3`;

      // Save edited blob for iterative editing
      lastAudioBlobRef.current = { blob: wavBlob, name: audioFilename };
      setMessages(prev => [...prev, {
        id: `ai-audio-${Date.now()}`,
        role: "assistant",
        content: description || "অডিও প্রসেসিং সম্পন্ন হয়েছে।",
        timestamp: new Date(),
        audioUrl,
        audioFilename,
        audioDescription: description,
        audioAppliedSteps: appliedSteps,
        audioIntent: intent,
        audioPipeline: pipeline,
        audioTechnicalNote: technicalNote,
        audioVocalContext: vocalContext,
        processingVersion,
        operationsApplied,
        outputSizeKB,
      }]);
      notifyChatbotActivity({
        type: "audio_edit_completed",
        title: "AI Chatbot Audio Editing",
        userMessage: userMsg.content,
        aiResponse: description || "অডিও প্রসেসিং সম্পন্ন হয়েছে।",
        audioData: audioBase64,
        audioMime,
        audioFilename: sourceName,
        editedAudioData: resultBase64,
        editedAudioMime: resultMime,
        editedAudioFilename: audioFilename,
        metadata: { intent, pipeline, appliedSteps },
      });
      setAudioFile(null);
    } catch (err: any) {
      setError(`অডিও এডিটিং ব্যর্থ: ${err.message}`);
    } finally {
      setAudioProcessing(false);
      setAudioProcessingStage(null);
    }
  }, [audioFile, input, audioProcessing, messages, isAudioEditRequest]);

  // ── Image select handler ──────────────────────────────────────────────
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("ছবির আকার সর্বোচ্চ ৫ MB হতে হবে।");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    // reset input so same file can be re-selected
    e.target.value = "";
  }, []);

  // ── Send message ────────────────────────────────────────────────────────────────
  // handleSendWithText: suggestion chip থেকে সরাসরি text পাঠানোর জন্য
  // setInput + setTimeout এর race condition এড়াতে এই ফাংশন ব্যবহার করা হয়
  const handleSendWithText = useCallback(async (chipText: string) => {
    if (!chipText.trim() || isLoading) return;
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: chipText.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);
    const userContent: AIMessageContent = chipText.trim();
    const cleanHistory = messages
      .filter(m => m.role === "user" || m.role === "assistant")
      .filter(m => {
        const c = typeof m.content === "string" ? m.content : "";
        if (c.startsWith("[PHOTO]") || c === "[CONTACT]" || c.startsWith("[LIVE_CHAT]")) return false;
        if (m.audioUrl) return false;
        return true;
      })
      .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));
    const payload = [...cleanHistory, { role: "user" as const, content: userContent }];
    retryPayloadRef.current = payload;
    try {
      const reply = await callAI(payload);
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      }]);
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError" || err?.message?.includes("timeout");
      const isNetwork = err?.message?.includes("fetch") || err?.message?.includes("network");
      if (isTimeout) {
        setError("উত্তর পেতে বেশি সময় লাগছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      } else if (isNetwork) {
        setError("ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।");
      } else {
        setError("সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages]);

  const handleSend = useCallback(async () => {
    // Case 1: Audio file already selected + any text = run edit immediately
    if (audioFile) {
      handleAudioEdit();
      return;
    }

    const text = input.trim();
    // FIX: operator precedence — parentheses ensure correct evaluation
    if ((!text && !imagePreview) || isLoading) return;

    // Case 1b: No new file, but lastAudioBlobRef exists + instruction = iterative edit
    if (isAudioEditRequest(text) && !audioFile && lastAudioBlobRef.current) {
      handleAudioEdit(text);
      return;
    }

    // Case 2: Text looks like audio edit instruction but no file yet
    // Show a smart prompt asking to upload audio
    if (isAudioEditRequest(text) && !audioFile) {
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      setInput("");
      setIsLoading(false);
      // Show AI response asking for audio file
      const aiPromptMsg: Message = {
        id: `ai-audio-prompt-${Date.now()}`,
        role: "assistant",
        content: `অডিও এডিটিংয়ের জন্য প্রস্তুত! নিচের 🎵 বাটনে ক্লিক করে অডিও ফাইলটি আপলোড করুন — তারপর আমি তাৎক্ষণিক "${text}" অনুযায়ী এডিট করে দেব।`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiPromptMsg]);
      notifyChatbotActivity({
        type: "audio_edit_file_requested",
        title: "AI Chatbot Audio Edit Request",
        userMessage: text,
        aiResponse: aiPromptMsg.content,
      });
      // Auto-open audio file picker
      setTimeout(() => audioFileInputRef.current?.click(), 400);
      return;
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text || "দয়া করে এই ছবিটি বিশ্লেষণ করুন।",
      timestamp: new Date(),
      imageUrl: imagePreview || undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setImagePreview(null);
    setIsLoading(true);
    setError(null);

    // Check for image editing request — redirect to Editor page
    const imageEditPattern = /(ছবি|ফটো|photo|image|picture).{0,15}(এডিট|edit|সম্পাদন|ঠিক|সুন্দর|ক্রপ|crop|রিটাচ|retouch|রিসাইজ|resize|ফিল্টার|filter)|(এডিট|edit).{0,15}(ছবি|ফটো|photo|image|picture)/i;
    const imageEditKeywords = ["ছবি এডিট", "ফটো এডিট", "ছবি এডিটিং", "ফটো এডিটিং", "image edit", "photo edit", "ছবি এডিট করবো", "ছবি এডিট করব", "ছবি এডিট করতে", "ছবি এডিট করুন", "ছবি এডিট করো", "ছবি সম্পাদনা"];
    const isImageEditRequest = !imagePreview && (imageEditPattern.test(text) || imageEditKeywords.some(kw => text.toLowerCase().includes(kw)));
    if (isImageEditRequest) {
      const imageEditMsg: Message = {
        id: `img-edit-${Date.now()}`,
        role: "assistant",
        content: "ছবি এডিটিংয়ের জন্য এই ওয়েবসাইটে **সরদার ডিজাইন স্টুডিও** আছে! [BUTTON:/editor] পেজে গিয়ে ছবি আপলোড করুন — ক্রপ, ফিল্টার, টেক্সট, স্টিকার, ব্যাকগ্রাউন্ড পরিবর্তন সহ অনেক প্রফেশনাল ফিচার আছে।",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, imageEditMsg]);
      setIsLoading(false);
      return;
    }

    if (isPhotoRequest(text)) {
      const photoMsg: Message = {
        id: `photo-${Date.now()}`,
        role: "assistant",
        content: "[PHOTO]\nএটি মাহবুব সরদার সবুজের ছবি।",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, photoMsg]);
      notifyChatbotActivity({
        type: "photo_request",
        title: "AI Chatbot Photo Request",
        userMessage: userMsg.content,
        aiResponse: photoMsg.content,
        imageData: userMsg.imageUrl,
      });
      setIsLoading(false);
      return;
    }

    if (isLiveChatRequest(text)) {
      const liveChatMsg: Message = {
        id: `livechat-${Date.now()}`,
        role: "assistant",
        content: "[LIVE_CHAT]সরাসরি কথা বলতে চাইলে নিচের বাটনে ক্লিক করুন — লাইভ চ্যাটে সরাসরি যোগাযোগ করতে পারবেন।",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, liveChatMsg]);
      notifyChatbotActivity({
        type: "live_chat_request",
        title: "AI Chatbot Live Chat Request",
        userMessage: userMsg.content,
        aiResponse: liveChatMsg.content,
      });
      setIsLoading(false);
      return;
    }

    if (isContactRequest(text)) {
      const contactMsg: Message = {
        id: `contact-${Date.now()}`,
        role: "assistant",
        content: "[CONTACT]",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, contactMsg]);
      notifyChatbotActivity({
        type: "contact_request",
        title: "AI Chatbot Contact Request",
        userMessage: userMsg.content,
        aiResponse: contactMsg.content,
      });
      setIsLoading(false);
      return;
    }

    // Build multimodal content if image is attached
    const userContent: AIMessageContent = imagePreview
      ? [
          ...(text ? [{ type: "text" as const, text }] : [{ type: "text" as const, text: "দয়া করে এই ছবিটি বিশ্লেষণ করুন।" }]),
          { type: "image_url" as const, image_url: { url: imagePreview } },
        ]
      : text;

    // Build clean payload: only user/assistant messages, skip internal-only messages
    // (photo, contact, live_chat, audio messages that are UI-only artifacts)
    const cleanHistory = messages
      .filter(m => m.role === "user" || m.role === "assistant")
      .filter(m => {
        const c = typeof m.content === "string" ? m.content : "";
        // Skip UI-only special messages that would confuse the AI
        if (c.startsWith("[PHOTO]") || c === "[CONTACT]" || c.startsWith("[LIVE_CHAT]")) return false;
        if (m.audioUrl) return false; // skip audio result messages
        return true;
      })
      .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));
    const payload = [
      ...cleanHistory,
      { role: "user" as const, content: userContent },
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
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError" || err?.message?.includes("timeout");
      const isNetwork = err?.message?.includes("fetch") || err?.message?.includes("network");
      if (isTimeout) {
        setError("উত্তর পেতে বেশি সময় লাগছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      } else if (isNetwork) {
        setError("ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।");
      } else {
        setError("সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    } finally {
      setIsLoading(false);
    }
  // FIX: Removed isAudioMode from deps — it is not used inside handleSend body
  }, [input, isLoading, messages, imagePreview, audioFile, handleAudioEdit, isAudioEditRequest]);

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
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError" || err?.message?.includes("timeout");
      const isNetwork = err?.message?.includes("fetch") || err?.message?.includes("network");
      if (isTimeout) {
        setError("উত্তর পেতে বেশি সময় লাগছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      } else if (isNetwork) {
        setError("ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।");
      } else {
        setError("সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearChat = () => {
    setMessages([{
      id: "welcome-new",
      role: "assistant",
      content: `নতুন কথোপকথন শুরু হয়েছে।

আপনাকে কীভাবে সাহায্য করতে পারি?
• লেখক সম্পর্কে জানতে চাইলে বলুন
• ই-বুক বা বই সম্পর্কে জানতে চাইলে বলুন
• অডিও এডিট করতে চাইলে নিচের বাটন থেকে অডিও আপলোড করুন`,
      timestamp: new Date(),
    }]);
    setError(null);
    retryPayloadRef.current = null;
    // Reset iterative audio editing state
    lastAudioBlobRef.current = null;
    setAudioFile(null);
    setIsAudioMode(false);
    setVideoFile(null);
    setVideoConverting(false);
    // FIX: imagePreview was not reset on clearChat
    setImagePreview(null);
  };

  return (
    <>
      {/* ── Floating Trigger Button ── */}
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
            }}
            onMouseDown={handleBtnMouseDown}
            onTouchStart={handleBtnTouchStart}
            onMouseUp={(e) => {
              if (!didDrag.current) {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(o => !o);
              }
            }}
            onTouchEnd={(e) => {
              if (!didDrag.current) {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(o => !o);
              }
            }}
          >
            {/* Avatar circle */}
            <motion.div
              onClick={(e) => e.preventDefault()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              style={{
                width: 54, height: 54,
                borderRadius: "50%",
                overflow: "hidden",
                background: "#0d1b2a",
                flexShrink: 0,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 2,
                border: "2px solid #D4A843",
                animation: !isOpen ? "chatbot-glow-pulse 2.5s ease-in-out infinite" : "none",
              }}
            >
              {/* Pulse rings */}
              {!isOpen && (
                <>
                  <span style={{
                    position: "absolute", inset: -5, borderRadius: "50%",
                    border: "2px solid rgba(212,168,67,0.5)",
                    animation: "chatbot-ping 2s ease-in-out infinite",
                    pointerEvents: "none",
                  }} />
                  <span style={{
                    position: "absolute", inset: -10, borderRadius: "50%",
                    border: "1.5px solid rgba(212,168,67,0.25)",
                    animation: "chatbot-ping2 2s ease-in-out infinite 0.4s",
                    pointerEvents: "none",
                  }} />
                </>
              )}
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.span key="x"
                    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                    style={{ color: "#D4A843", fontSize: "1.3rem", fontWeight: 700 }}>✕</motion.span>
                ) : btnFace === 'photo' ? (
                  <motion.div key="av-photo"
                    initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.75, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    style={{ width: "100%", height: "100%" }}>
                    <img src={AUTHOR_PHOTO} alt="AI"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        const t = e.currentTarget as HTMLImageElement;
                        t.style.display = "none";
                        t.parentElement!.innerHTML = '<span style="color:#D4A843;font-size:1.3rem;font-weight:700;">AI</span>';
                      }} />
                  </motion.div>
                ) : (
                  <motion.div key="av-chat"
                    initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.75, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                    {/* Chat bubble icon */}
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                        fill="rgba(212,168,67,0.18)" stroke="#D4A843" strokeWidth="1.8" strokeLinejoin="round"/>
                      <circle cx="8.5" cy="11" r="1" fill="#D4A843"/>
                      <circle cx="12" cy="11" r="1" fill="#D4A843"/>
                      <circle cx="15.5" cy="11" r="1" fill="#D4A843"/>
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        );
      })()}

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`chatbot-adorsho${isDragOver ? " chatbot-drag-over" : ""}`}
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const files = Array.from(e.dataTransfer.files);
              const audioFile = files.find(f => f.type.startsWith("audio/") || /\.(mp3|wav|ogg|flac|aac|m4a|webm|opus)$/i.test(f.name));
              const videoFile = files.find(f => f.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v|3gp)$/i.test(f.name));
              const imgFile = files.find(f => f.type.startsWith("image/"));
              if (audioFile) {
                const fakeEvent = { target: { files: [audioFile], value: "" } } as any;
                handleAudioSelect(fakeEvent);
              } else if (videoFile) {
                const fakeEvent = { target: { files: [videoFile], value: "" } } as any;
                handleVideoSelect(fakeEvent);
              } else if (imgFile) {
                const reader = new FileReader();
                reader.onload = (ev) => setImagePreview(ev.target?.result as string);
                reader.readAsDataURL(imgFile);
              }
            }}
            style={{
              position: "fixed",
              bottom: 80,
              right: 12,
              zIndex: 150,
              width: 368,
              maxWidth: "calc(100vw - 16px)",
              height: "min(610px, calc(100vh - 108px))",
              borderRadius: 20,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              background: "rgba(5,10,19,0.98)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "1px solid rgba(212,168,67,0.22)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(212,168,67,0.08), inset 0 1px 0 rgba(212,168,67,0.08)",
              animation: "chatbot-border-glow 4s ease-in-out infinite",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          >
            {/* Drag-and-drop overlay */}
            {isDragOver && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 100,
                background: "rgba(5,10,19,0.92)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 12,
                borderRadius: "inherit",
                border: "2px dashed rgba(212,168,67,0.7)",
                pointerEvents: "none",
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,67,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <div style={{
                  color: "rgba(212,168,67,0.9)",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textAlign: "center",
                }}>ফাইলটি এখানে ছেড়ে দিন</div>
                <div style={{
                  color: "rgba(212,168,67,0.5)",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "0.65rem",
                  textAlign: "center",
                }}>অডিও, ভিডিও বা ছবি</div>
              </div>
            )}

            {/* Watermark */}
            <div aria-hidden="true" style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${AUTHOR_PHOTO})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              opacity: 0.04,
              pointerEvents: "none",
              zIndex: 0,
              borderRadius: "inherit",
            }} />
            {/* Gradient overlay */}
            <div aria-hidden="true" style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(6,12,22,0.9) 0%, rgba(6,12,22,0.78) 40%, rgba(6,12,22,0.94) 100%)",
              pointerEvents: "none",
              zIndex: 0,
              borderRadius: "inherit",
            }} />

            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

              {/* ── Header ── */}
              <div style={{
                padding: "9px 11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                background: "radial-gradient(circle at 18% 0%, rgba(212,168,67,0.16), transparent 38%), linear-gradient(180deg, rgba(9,16,29,0.99) 0%, rgba(4,9,18,0.97) 100%)",
                borderBottom: "1px solid rgba(212,168,67,0.18)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.36)",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                  {/* Header avatar with premium glow */}
                  <div style={{
                    width: 40, height: 40,
                    borderRadius: "16px",
                    overflow: "hidden",
                    flexShrink: 0,
                    padding: 2,
                    background: "linear-gradient(135deg, rgba(244,213,125,0.95), rgba(201,168,76,0.22), rgba(244,213,125,0.7))",
                    boxShadow: "0 0 0 1px rgba(212,168,67,0.22), 0 10px 24px rgba(212,168,67,0.16)",
                  }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: 14, overflow: "hidden", background: "rgba(4,9,18,0.85)" }}>
                      <img src={AUTHOR_PHOTO} alt="মাহবুব সরদার সবুজ" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          const t = e.currentTarget;
                          t.style.display = "none";
                          t.parentElement!.innerHTML = '<span style="color:#0A1628;font-weight:800;font-size:0.72rem;display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(135deg,#F0D080,#C9A84C);">AI</span>';
                        }} />
                    </div>
                  </div>
                  <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                    {/* Shimmer title */}
                    <div style={{
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      fontWeight: 800,
                      fontSize: "0.86rem",
                      letterSpacing: "0.01em",
                      lineHeight: 1.1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      background: "linear-gradient(90deg, #F7E4A5 0%, #D4A843 46%, #FFF1B8 68%, #C9A84C 100%)",
                      backgroundSize: "220% auto",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "chatbot-shimmer 4s linear infinite",
                    }}>
                      মাহবুব সরদার সবুজ
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "2px 7px",
                        borderRadius: 999,
                        color: "rgba(74,222,128,0.95)",
                        background: "rgba(34,197,94,0.08)",
                        border: "1px solid rgba(34,197,94,0.18)",
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                        letterSpacing: "0.02em",
                        lineHeight: 1.2,
                      }}>
                        <span style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: "#4ade80",
                          boxShadow: "0 0 10px rgba(74,222,128,0.75)",
                          animation: "chatbot-glow-pulse 2.5s ease-in-out infinite",
                        }} />
                        AI Agent
                      </span>
                      <span style={{
                        color: "rgba(245,238,222,0.5)",
                        fontSize: "0.56rem",
                        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                        lineHeight: 1.2,
                      }}>সাহিত্য ও অডিও AI</span>
                    </div>
                  </div>
                </div>

                {/* Header buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {messages.length > 1 && (
                    <span style={{
                      padding: "1px 6px",
                      background: "rgba(212,168,67,0.08)",
                      border: "1px solid rgba(212,168,67,0.2)",
                      borderRadius: 999,
                      color: "rgba(212,168,67,0.5)",
                      fontSize: "0.52rem",
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}>{messages.length - 1}</span>
                  )}
                  <button onClick={clearChat} title="নতুন কথোপকথন"
                    className="chatbot-icon-btn"
                    style={{
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      fontSize: "0.62rem",
                      color: "rgba(212,168,67,0.65)",
                      background: "rgba(212,168,67,0.05)",
                      border: "1px solid rgba(212,168,67,0.16)",
                      borderRadius: 8,
                      padding: "3px 8px",
                      cursor: "pointer",
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                      whiteSpace: "nowrap",
                    }}>
                    নতুন
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="বন্ধ করুন"
                    className="chatbot-icon-btn"
                    style={{
                      width: 26, height: 26,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: "50%",
                      border: "1px solid rgba(255,90,90,0.18)",
                      color: "rgba(200,110,110,0.55)",
                      background: "rgba(255,70,70,0.04)",
                      cursor: "pointer",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* ── Tabs ── */}
              <div style={{
                display: "flex",
                borderBottom: "1px solid rgba(212,168,67,0.1)",
                background: "rgba(4,8,16,0.8)",
                flexShrink: 0,
                padding: "0 4px",
              }}>
                {(["ai", "live"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`chatbot-tab-btn${activeTab === tab ? " active" : ""}`}
                    style={{
                      flex: 1,
                      padding: "7px 8px",
                      background: activeTab === tab ? "rgba(212,168,67,0.07)" : "transparent",
                      border: "none",
                      borderBottom: activeTab === tab ? "1.5px solid rgba(212,168,67,0.8)" : "1.5px solid transparent",
                      color: activeTab === tab ? "rgba(212,168,67,0.95)" : "rgba(160,140,100,0.4)",
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      fontSize: "0.72rem",
                      fontWeight: activeTab === tab ? 700 : 500,
                      letterSpacing: "0.02em",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      marginBottom: -1,
                    }}
                  >
                    {tab === "ai" ? (
                      <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> AI সহকারী</>
                    ) : (
                      <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> সরাসরি চ্যাট</>
                    )}
                  </button>
                ))}
              </div>

              {/* ── Tab Content ── */}
              {activeTab === "live" ? (
                <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <Suspense fallback={
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(212,168,67,0.6)", fontSize: "0.85rem" }}>
                      লোড হচ্ছে...
                    </div>
                  }>
                    <LiveChatWidget />
                  </Suspense>
                </div>
              ) : (
              <>
              {/* ── Quick suggestion chips (context-aware) ── */}
              {!audioFile && !lastAudioBlobRef.current && (() => {
                // Context-aware: detect last assistant message topic
                const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
                const lastText = lastAssistant?.content?.toString().toLowerCase() ?? "";
                let contextChips: { label: string; cmd: string }[] = [];
                if (messages.length > 1) {
                  if (lastText.includes("বই") || lastText.includes("ebook") || lastText.includes("ই-বুক")) {
                    contextChips = [
                      { label: "📖 বিনামূল্যে পড়ুন", cmd: "বিনামূল্যে ই-বুক পড়তে চাই" },
                      { label: "🛒 কিনতে চাই", cmd: "দুঃখবিলাস বই কোথায় পাওয়া যায়?" },
                      { label: "✍️ অন্য বই", cmd: "আর কোন বই আছে?" },
                    ];
                  } else if (lastText.includes("কবিতা") || lastText.includes("লেখা") || lastText.includes("writings")) {
                    contextChips = [
                      { label: "📝 লেখা পড়ুন", cmd: "লেখালেখি পেজে যেতে চাই" },
                      { label: "❤️ ভালোবাসার কবিতা", cmd: "ভালোবাসার কবিতা দেখাও" },
                      { label: "💔 বিচ্ছেদের লেখা", cmd: "বিচ্ছেদের লেখা দেখাও" },
                    ];
                  } else if (lastText.includes("যোগাযোগ") || lastText.includes("contact")) {
                    contextChips = [
                      { label: "📞 যোগাযোগ পেজ", cmd: "যোগাযোগ পেজে যেতে চাই" },
                      { label: "📘 ফেসবুক", cmd: "ফেসবুক পেজের লিংক দাও" },
                    ];
                  } else if (lastText.includes("অডিও") || lastText.includes("audio")) {
                    contextChips = [
                      { label: "🧹 নয়েজ রিমুভ", cmd: "নয়েজ রিমুভ করো" },
                      { label: "⭐ স্টুডিও প্রো", cmd: "স্টুডিও মানের প্রসেসিং করো" },
                    ];
                  }
                }
                const showChips = messages.length <= 1 ? true : contextChips.length > 0;
                if (!showChips) return null;
                const chips = messages.length <= 1 ? [
                  { label: "📚 বই সম্পর্কে", cmd: "লেখকের বই সম্পর্কে বলুন" },
                  { label: "✍️ লেখক কে?", cmd: "মাহবুব সরদার সবুজ কে?" },
                  { label: "📖 ই-বুক পড়ুন", cmd: "বিনামূল্যে ই-বুক পড়তে চাই" },
                  { label: "🎤 আবৃত্তি শুনুন", cmd: "আবৃত্তির তালিকা দেখাও" },
                  { label: "💬 কবিতা পড়ুন", cmd: "একটি সুন্দর কবিতা শোনাও" },
                  { label: "📞 যোগাযোগ", cmd: "লেখকের সাথে যোগাযোগ করতে চাই" },
                  { label: "🌍 সাধারণ জ্ঞান", cmd: "বাংলাদেশ সম্পর্কে কিছু বলো" },
                ] : contextChips;
                return (
                <div style={{
                  padding: "6px 10px 5px",
                  borderBottom: "1px solid rgba(212,168,67,0.07)",
                  background: "rgba(4,8,16,0.7)",
                  flexShrink: 0,
                }}>
                  <div style={{
                    color: "rgba(212,168,67,0.35)",
                    fontSize: "0.52rem",
                    fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    marginBottom: 5,
                  }}>{messages.length <= 1 ? "দ্রুত শুরু করুন" : "সম্পর্কিত প্রশ্ন"}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {chips.map(chip => (
                      <button
                        key={chip.label}
                        onClick={() => {
                          handleSendWithText(chip.cmd);
                        }}
                        className="chatbot-suggestion-btn"
                        style={{
                          padding: "3px 9px",
                          background: "rgba(212,168,67,0.05)",
                          border: "1px solid rgba(212,168,67,0.18)",
                          borderRadius: 999,
                          color: "rgba(212,168,67,0.65)",
                          fontSize: "0.58rem",
                          fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                          cursor: "pointer",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
                );
              })()}

              {/* ── Messages ── */}
              <div className="chatbot-scrollbar" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "14px 12px 6px" }}>
                {messages.map((msg, idx) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onNavigate={handleNavigate}
                    onSwitchToLive={() => setActiveTab("live")}
                    isLatest={msg.role === "assistant" && idx === messages.length - 1 && !isLoading && !audioProcessing}
                  />
                ))}
                {(isLoading || audioProcessing) && <TypingIndicator stage={audioProcessing ? audioProcessingStage : null} />}

                {error && !isLoading && !audioProcessing && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9, padding: "6px 0" }}>
                    <div style={{
                      textAlign: "center",
                      color: "#f87171",
                      fontSize: "0.75rem",
                      background: "rgba(239,68,68,0.09)",
                      border: "1px solid rgba(239,68,68,0.22)",
                      borderRadius: 11,
                      padding: "9px 13px",
                      width: "100%",
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    }}>
                      {error}
                    </div>
                    <button
                      onClick={handleRetry}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "7px 16px",
                        background: "rgba(212,168,67,0.1)",
                        border: "1px solid rgba(212,168,67,0.38)",
                        color: "#D4A843",
                        borderRadius: 13,
                        fontSize: "0.75rem",
                        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      ↺ আবার চেষ্টা করুন
                    </button>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Input ── */}
              <div style={{
                padding: "8px 10px 10px",
                borderTop: "1px solid rgba(212,168,67,0.08)",
                background: "rgba(4,8,16,0.97)",
                flexShrink: 0,
              }}>
                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: "none" }}
                />
                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a,.webm,.opus"
                  onChange={handleAudioSelect}
                  style={{ display: "none" }}
                />
                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/*,.mp4,.mov,.avi,.mkv,.webm,.flv,.wmv,.m4v,.3gp"
                  onChange={handleVideoSelect}
                  style={{ display: "none" }}
                />


                {/* Video converting banner */}
                {videoConverting && videoFile && (
                  <div style={{
                    marginBottom: 7,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "6px 10px",
                    background: "rgba(99,102,241,0.07)",
                    borderRadius: 9,
                    border: "1px solid rgba(99,102,241,0.25)",
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                      background: "rgba(99,102,241,0.12)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: "rgba(99,102,241,0.9)",
                        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{videoFile.name}</div>
                      <div style={{
                        color: "rgba(99,102,241,0.55)",
                        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                        fontSize: "0.54rem", marginTop: 1,
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <span style={{
                          display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                          background: "#6366f1",
                          animation: "pulse 1.2s ease-in-out infinite",
                        }}/>
                        অডিও এক্সট্রাক্ট হচ্ছে...
                      </div>
                    </div>
                  </div>
                )}
                {/* Audio mode banner — only show when a NEW file is selected, not after editing */}
                {audioFile && (
                  <div style={{
                    marginBottom: 7,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "6px 10px",
                    background: "rgba(212,168,67,0.05)",
                    borderRadius: 9,
                    border: "1px solid rgba(212,168,67,0.2)",
                  }}>
                    {/* Audio icon */}
                    <div style={{
                      width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                      background: "rgba(212,168,67,0.1)",
                      border: "1px solid rgba(212,168,67,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l12-2v13"/>
                        <circle cx="6" cy="18" r="3"/>
                        <circle cx="18" cy="16" r="3"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: "rgba(212,168,67,0.85)",
                        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.01em",
                      }}>{audioFile.name}</div>
                      <div style={{
                        color: "rgba(212,168,67,0.4)",
                        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                        fontSize: "0.54rem",
                        marginTop: 1,
                      }}>
                        {(audioFile.size / (1024 * 1024)).toFixed(1)} MB • নির্দেশ দিন
                      </div>
                    </div>

                    <button
                      onClick={() => { setAudioFile(null); setIsAudioMode(false); lastAudioBlobRef.current = null; }}
                      style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: "#ef4444", border: "none",
                        color: "#fff", fontSize: "9px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, fontWeight: 700,
                      }}
                    >✕</button>
                  </div>
                )}

                {/* ── Quick Preset Chips — show when audio file is ready ── */}
                {(audioFile || lastAudioBlobRef.current) && !audioProcessing && (
                  <div style={{ marginBottom: 7 }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    }}>
                      <span style={{
                        color: "rgba(212,168,67,0.5)",
                        fontSize: "0.54rem",
                        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                      }}>⚡ দ্রুত প্রিসেট</span>
                      <button
                        onClick={() => setShowPresets(p => !p)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "rgba(212,168,67,0.4)",
                          fontSize: "0.54rem",
                          cursor: "pointer",
                          fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                          padding: "1px 4px",
                        }}
                      >{showPresets ? "▲ কম" : "▼ আরো"}</button>
                    </div>
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 4,
                    }}>
                      {[
                        // ── সবচেয়ে গুরুত্বপূর্ণ (সবসময় দেখা যাবে) ──
                        { label: "🧹 নয়েজ রিমুভ", cmd: "উচ্চ ভলিউম নয়েজ রিমুভ করো, কণ্ঠের টোন ঠিক রাখো" },
                        { label: "⭐ স্টুডিও প্রো", cmd: "স্টুডিও মানের সম্পূর্ণ প্রসেসিং করো, ভয়েস এনহ্যান্সার প্রো" },
                        { label: "🍯 মধুময় কণ্ঠ", cmd: "কণ্ঠ মধুময় ও সুন্দর করো, মিষ্টি কণ্ঠ প্রিসেট" },
                        { label: "🎬 আবৃত্তি প্রো", cmd: "বাংলা আবৃত্তি প্রো প্রিসেট দিয়ে প্রসেস করো" },
                        { label: "🎵 মিউজিক মিক্স", cmd: "ব্যাকগ্রাউন্ড মিউজিক মিক্স করো" },
                        ...(showPresets ? [
                          // ── ভয়েস ক্লিনআপ ──
                          { label: "🔇 ডি-ব্রিদ", cmd: "শ্বাস-প্রশ্বাসের শব্দ দূর করো" },
                          { label: "🎵 ডি-রিভার্ব", cmd: "রুমের প্রতিধ্বনি কমানো" },
                          { label: "🔬 স্পেকট্রাল ডিনয়েজ", cmd: "স্পেকট্রাল ডিনয়েজ দিয়ে গভীর নয়েজ রিমুভ করো" },
                          { label: "✨ ক্লারিটি বুস্ট", cmd: "ভয়েস ক্লারিটি বাড়াও" },
                          { label: "🔊 লাউডনেস নর্মালাইজ", cmd: "লাউডনেস নর্মালাইজ করো" },
                          { label: "🌞 ওয়ার্মথ", cmd: "কণ্ঠে উষ্ণতা যোগ করো" },
                          // ── কনটেন্ট টাইপ ──
                          { label: "🎹 পডকাস্ট", cmd: "পডকাস্ট প্রো প্রিসেট দিয়ে প্রসেস করো" },
                          { label: "🎥 YouTube", cmd: "YouTube ভয়েস প্রিসেট দিয়ে প্রসেস করো" },
                          { label: "🎧 অডিওবুক", cmd: "অডিওবুক ভয়েস প্রিসেট দিয়ে প্রসেস করো" },
                          { label: "🎤 নিউজ অ্যাঙ্কর", cmd: "নিউজ অ্যাঙ্কর ভয়েস প্রিসেট দিয়ে প্রসেস করো" },
                          { label: "🎙️ WhatsApp ক্লিন", cmd: "ভয়েস মেসেজ ক্লিন প্রিসেস করো" },
                          // ── ভয়েস স্টাইল ──
                          { label: "📡 ব্রডকাস্ট", cmd: "ব্রডকাস্ট ভয়েস ক্লোন প্রিসেট দিয়ে প্রসেস করো" },
                          { label: "🎬 সিনেমাটিক বাংলা", cmd: "সিনেমাটিক বাংলা ভয়েস প্রিসেট দিয়ে প্রসেস করো" },
                          { label: "📻 রেডিও জকি", cmd: "রেডিও জকি ভয়েস প্রিসেট দিয়ে প্রসেস করো" },
                          { label: "🎭 ড্রামা ভয়েস", cmd: "ড্রামা ভয়েস প্রিসেট দিয়ে প্রসেস করো" },
                          { label: "📖 ন্যারেটর", cmd: "ন্যারেটর ভয়েস ক্লোন প্রিসেট দিয়ে প্রসেস করো" },
                          // ── মিউজিক মিক্স ──
                          { label: "🎼 মাল্টি-সেগমেন্ট মিক্স", cmd: "ইন্ট্রো-ভার্স-আউট্রো স্টাইলে মিউজিক মিক্স করো" },
                          { label: "🔀 অ্যাডাপ্টিভ ডাকিং", cmd: "অ্যাডাপ্টিভ সাইডচেইন ডাকিং দিয়ে মিউজিক মিক্স করো" },
                          // ── অ্যাডভান্সড ──
                          { label: "🎹 হার্মোনি", cmd: "ভোকাল হার্মোনি যোগ করো" },
                          { label: "🌐 স্টেরিও ওয়াইড", cmd: "স্টেরিও ফিল্ড প্রশস্ত করো" },
                        ] : []),
                      ].map(preset => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            handleSendWithText(preset.cmd);
                          }}
                          className="chatbot-suggestion-btn"
                          style={{
                            padding: "3px 8px",
                            background: "rgba(212,168,67,0.05)",
                            border: "1px solid rgba(212,168,67,0.2)",
                            borderRadius: 999,
                            color: "rgba(212,168,67,0.7)",
                            fontSize: "0.58rem",
                            fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                            cursor: "pointer",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image preview strip */}
                {imagePreview && (
                  <div style={{
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    background: "rgba(212,168,67,0.06)",
                    borderRadius: 10,
                    border: "1px solid rgba(212,168,67,0.2)",
                  }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <img
                        src={imagePreview}
                        alt="preview"
                        style={{ height: 52, width: 52, borderRadius: 8, objectFit: "cover", display: "block", border: "1.5px solid rgba(212,168,67,0.4)" }}
                      />
                      <button
                        onClick={() => setImagePreview(null)}
                        style={{
                          position: "absolute", top: -5, right: -5,
                          width: 17, height: 17, borderRadius: "50%",
                          background: "#ef4444", border: "none",
                          color: "#fff", fontSize: "9px", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          lineHeight: 1, fontWeight: 700,
                        }}
                      >✕</button>
                    </div>
                    <span style={{
                      color: "rgba(212,168,67,0.65)",
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      fontSize: "0.72rem",
                      lineHeight: 1.4,
                    }}>ছবি যুক্ত — পাঠাতে Send বাটনে চাপুন</span>
                  </div>
                )}

                <div style={{ display: "flex", gap: 5, alignItems: "flex-end" }}>
                  {/* Image attach button (hidden in audio mode) */}
                  {!isAudioMode && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="ছবি যুক্ত করুন"
                    className="chatbot-icon-btn"
                    style={{
                      width: 33, height: 33, borderRadius: 9, flexShrink: 0,
                      background: imagePreview ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${imagePreview ? "rgba(212,168,67,0.4)" : "rgba(212,168,67,0.15)"}`,
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={imagePreview ? "#D4A843" : "rgba(212,168,67,0.4)"}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </button>
                  )}
                  {/* Audio attach button */}
                  <button
                    onClick={() => audioFileInputRef.current?.click()}
                    title="অডিও ফাইল যুক্ত করুন"
                    className="chatbot-icon-btn"
                    style={{
                      width: 33, height: 33, borderRadius: 9, flexShrink: 0,
                      background: isAudioMode ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isAudioMode ? "rgba(212,168,67,0.4)" : "rgba(212,168,67,0.15)"}`,
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={isAudioMode ? "#D4A843" : "rgba(212,168,67,0.4)"}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18V5l12-2v13"/>
                      <circle cx="6" cy="18" r="3"/>
                      <circle cx="18" cy="16" r="3"/>
                    </svg>
                  </button>

                  {/* Video upload button */}
                  <button
                    title="ভিডিও আপলোড করুন (অডিও এক্সট্রাক্ট হবে)"
                    onClick={() => videoFileInputRef.current?.click()}
                    disabled={audioProcessing || videoConverting}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: "rgba(99,102,241,0.07)",
                      border: "1px solid rgba(99,102,241,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: audioProcessing || videoConverting ? "not-allowed" : "pointer",
                      flexShrink: 0,
                      transition: "all 0.2s",
                      opacity: audioProcessing || videoConverting ? 0.5 : 1,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7"/>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                  </button>



                  <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={e => {
                        setInput(e.target.value);
                        const ta = e.target;
                        ta.style.height = "auto";
                        ta.style.height = Math.min(ta.scrollHeight, 88) + "px";
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={audioFile ? "অডিও এডিটিং নির্দেশনা দিন... (যেমন: সিনেমাটিক বাংলা, রেডিও জকি, নয়েজ রিমুভ)" : lastAudioBlobRef.current ? "পূর্ববর্তী অডিওতে আরো পরিবর্তন করুন..." : "লেখক, কবিতা, বই বা অডিও সম্পর্কে জিজ্ঞেস করুন..."}
                      rows={1}
                      disabled={isLoading}
                      className="chatbot-input"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: "rgba(10,18,32,0.95)",
                        color: "rgba(240,232,212,0.92)",
                        border: "1px solid rgba(35,50,68,0.9)",
                        borderRadius: 12,
                        padding: "8px 11px",
                        fontSize: "0.76rem",
                        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                        resize: "none",
                        minHeight: 36,
                        maxHeight: 88,
                        overflowY: "auto",
                        outline: "none",
                        lineHeight: 1.55,
                        display: "block",
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = "rgba(212,168,67,0.45)";
                        e.currentTarget.style.boxShadow = "0 0 0 2px rgba(212,168,67,0.06)";
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = "rgba(35,50,68,0.9)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <button
                    onClick={(audioFile || lastAudioBlobRef.current) ? () => handleAudioEdit() : handleSend}
                    disabled={(audioFile || lastAudioBlobRef.current)
                      ? audioProcessing
                      : ((!input.trim() && !imagePreview) || isLoading)
                    }
                    style={{
                      width: 36, height: 36,
                      borderRadius: 10,
                      background: ((audioFile || lastAudioBlobRef.current) ? !audioProcessing : ((input.trim() || imagePreview) && !isLoading))
                        ? "linear-gradient(135deg, #D8B84E 0%, #C9A84C 100%)"
                        : "rgba(212,168,67,0.1)",
                      border: "none",
                      color: ((audioFile || lastAudioBlobRef.current) ? !audioProcessing : ((input.trim() || imagePreview) && !isLoading)) ? "#0A1628" : "rgba(212,168,67,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                      transition: "all 0.18s",
                    }}
                  >
                    {(isLoading || audioProcessing) ? (
                      <div style={{
                        width: 13, height: 13,
                        border: "1.5px solid rgba(212,168,67,0.3)",
                        borderTop: "1.5px solid #D4A843",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }} />
                    ) : (audioFile || lastAudioBlobRef.current) ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    )}
                  </button>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 4,
                  padding: "0 2px",
                }}>
                  <p style={{
                    color: "rgba(80,100,120,0.3)",
                    fontSize: "0.52rem",
                    margin: 0,
                    fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    letterSpacing: "0.02em",
                  }}>Enter = পাঠান তারপর Shift+Enter = নতুন লাইন</p>
                  {input.length > 0 && (
                    <span style={{
                      color: input.length > 500 ? "rgba(239,68,68,0.6)" : "rgba(80,100,120,0.3)",
                      fontSize: "0.5rem",
                      fontFamily: "monospace",
                    }}>{input.length}</span>
                  )}
                </div>
              </div>
              </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
