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
  isVoice?: boolean;           // if message was sent via voice
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
    if (data.reply) return data.reply;
    return "দুঃখিত, উত্তর দিতে পারছি না।";

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

    if (fullText.length <= 80) {
      setDisplayText(fullText);
      setIsDone(true);
      return;
    }

    const tick = () => {
      if (indexRef.current < fullText.length) {
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

const PHOTO_KEYWORDS = [
  "ছবি", "photo", "picture", "image", "ফটো", "দেখতে", "চেহারা",
  "মুখ", "face", "look", "দেখাও", "দেখান", "কেমন দেখতে",
];

function isPhotoRequest(text: string): boolean {
  const lower = text.toLowerCase();
  const imageEditExclusions = [
    "ছবি এডিট", "ছবি এডিটিং", "ছবি সম্পাদনা",
    "ফটো এডিট", "ফটো এডিটিং",
    "image edit", "photo edit", "picture edit",
    "ছবি ঠিক", "ছবি সুন্দর", "ছবি ক্রপ", "ছবি কাটো",
    "ছবি রিটাচ", "ছবি রিসাইজ", "ছবি কম্প্রেস",
    "ছবি বানাও", "ছবি তৈরি",
    "image editor", "photo editor",
    "গ্যালারি", "gallery",
    "ছবি বিশ্লেষণ", "ছবি দেখে", "ছবিতে", "ছবির মধ্যে",
    "analyze image", "describe image", "what is in the image",
  ];
  if (imageEditExclusions.some(kw => lower.includes(kw))) return false;

  if (lower.includes("ছবি") || lower.includes("ফটো") || lower.includes("photo") || lower.includes("picture") || lower.includes("image")) {
    const showKeywords = ["দেখাও", "দেখান", "দেখতে", "কেমন দেখতে", "মুখ", "face", "look", "চেহারা", "লেখকের ছবি", "লেখকের ফটো", "author photo", "author image"];
    return showKeywords.some(kw => lower.includes(kw));
  }

  return PHOTO_KEYWORDS.some(kw => lower.includes(kw));
}

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

const AUDIO_EDIT_KEYWORDS = [
  "অডিও", "audio", "গান", "song", "sound", "ভয়েস", "voice",
  "mp3", "wav", "ogg", "flac", "aac", "m4a",
  "ভলিউম", "volume", "ট্রিম", "trim", "কাটো", "কাট",
  "ফেড", "fade", "গতি", "speed", "নয়েজ", "noise",
  "রিভার্ব", "reverb", "বেস", "bass", "ট্রেবল", "treble",
  "রূপান্তর", "convert",
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
  "ইকো", "echo", "কোরাস", "chorus", "পিচ", "pitch",
  "রোবট", "robot", "টেলিফোন", "telephone",
  "মেগাফোন", "megaphone", "পানির নিচে", "underwater",
  "গুহা", "cave", "স্টেডিয়াম", "stadium",
  "ভিনাইল", "vinyl", "টেপ", "tape",
  "ফ্ল্যাঞ্জার", "flanger", "ফেজার", "phaser",
  "ট্রেমোলো", "tremolo", "ভাইব্রেটো", "vibrato",
  "বিটক্রাশার", "bitcrusher", "8-bit",
  "এলিয়েন", "alien", "রেডিও", "radio",
  "কম্প্রেস", "compress", "লিমিটার", "limiter",
  "গেট", "gate", "ডি-এস", "de-ess",
  "হাম", "hum", "ক্লিক", "click", "পপ", "pop",
  "স্টেরিও", "stereo", "মনো", "mono",
  "অটো টিউন", "auto-tune", "auto tune",
  "প্রফেশনাল", "professional", "স্টুডিও", "studio",
  "পডকাস্ট", "podcast", "ভয়েসওভার", "voiceover",
  "সুন্দর করো", "ভালো করো", "উন্নত করো",
  "কণ্ঠ", "কণ্ঠস্বর",
  "youtube", "tiktok", "reels", "audiobook", "meditation",
  "news anchor", "নিউজ", "সংবাদ", "conference", "মিটিং",
  "শ্বাস", "breath", "de-reverb", "রুম",
  "ডাবল", "doubler", "স্যাচুরেশন", "saturation",
  "ক্লারিটি", "clarity", "পাঞ্চ", "punch",
  "উষ্ণতা", "warmth", "এয়ার", "air", "ব্রিলিয়ান্স",
  "ফোকাস", "focus", "ডায়নামিক", "dynamic",
  "মাল্টিব্যান্ড", "multiband", "রুম কারেকশন",
  "whatsapp", "telegram", "ভয়েস মেসেজ",
  "নিখুঁত", "perfect", "মাস্টারিং", "mastering", "master",
  "স্ট্রিমিং", "streaming", "সিনেমাটিক", "cinematic",
  "deep warm", "crisp", "airy", "intimate", "powerful",
];

function isAudioEditRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return AUDIO_EDIT_KEYWORDS.some(kw => lower.includes(kw));
}

const CONTACT_KEYWORDS = [
  "যোগাযোগ", "contact", "email", "ইমেইল", "ফোন", "phone",
  "ঠিকানা", "address", "লিংক", "link", "social", "ফেসবুক", "facebook",
];
function isContactRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return CONTACT_KEYWORDS.some(kw => lower.includes(kw));
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "আসসালামু আলাইকুম! আমি মাহবুব সরদার সবুজের AI এজেন্ট। আমি আপনাকে লেখকের জীবনী, কবিতা, বই, ই-বুক এবং অডিও এডিটিং সম্পর্কে তথ্য দিয়ে সাহায্য করতে পারি। আপনি চাইলে অডিও ফাইল আপলোড করে তা এডিটও করে নিতে পারেন। কীভাবে সাহায্য করতে পারি?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioProcessing, setAudioProcessing] = useState(false);
  const [audioProcessingStage, setAudioProcessingStage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoConverting, setVideoConverting] = useState(false);
  const [btnFace, setBtnFace] = useState<'chat' | 'photo'>('chat');
  const [isListening, setIsListening] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const retryPayloadRef = useRef<{ role: "user" | "assistant" | "system"; content: AIMessageContent }[] | null>(null);
  const lastAudioBlobRef = useRef<{ blob: Blob; name: string } | null>(null);

  const [, setLocation] = useLocation();

  // ── Dragging logic ──────────────────────────────────────────────────────────
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 }); // offset from bottom-right
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);

  const getAbsPos = () => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    return {
      x: window.innerWidth - 80 - btnPos.x,
      y: window.innerHeight - 80 - btnPos.y,
    };
  };

  const handleBtnMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX + btnPos.x, y: e.clientY + btnPos.y };
    didDrag.current = false;
  };
  const handleBtnTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    const t = e.touches[0];
    dragStart.current = { x: t.clientX + btnPos.x, y: t.clientY + btnPos.y };
    didDrag.current = false;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
      const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dx = dragStart.current.x - cx;
      const dy = dragStart.current.y - cy;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) didDrag.current = true;
      setBtnPos({ x: dx, y: dy });
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, audioProcessing]);

  // ── Avatar face switcher ────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) setBtnFace(f => f === 'chat' ? 'photo' : 'chat');
    }, 6000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // ── Audio select handler ────────────────────────────────────────────────────
  const handleAudioSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setError("অডিও ফাইলের আকার সর্বোচ্চ ২৫ MB হতে হবে।");
      return;
    }
    setAudioFile(file);
    setIsAudioMode(true);
    e.target.value = "";
  }, []);

  // ── Video select handler ────────────────────────────────────────────────────
  const handleVideoSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setError("ভিডিও ফাইলের আকার সর্বোচ্চ ৫০ MB হতে হবে।");
      return;
    }
    setVideoFile(file);
    setVideoConverting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("video", file);
      const res = await fetch("/api/video-to-audio", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("ভিডিও থেকে অডিও এক্সট্রাক্ট করা সম্ভব হয়নি।");
      const data = await res.json();
      const audioBlob = await fetch(data.audioUrl).then(r => r.blob());
      const audioFile = new File([audioBlob], file.name.replace(/\.[^/.]+$/, "") + ".mp3", { type: "audio/mpeg" });
      setAudioFile(audioFile);
      setIsAudioMode(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVideoConverting(false);
      setVideoFile(null);
      e.target.value = "";
    }
  }, []);

  // ── Audio edit handler ──────────────────────────────────────────────────────
  const handleAudioEdit = useCallback(async (iterativeInstruction?: string) => {
    const sourceFile = audioFile || (lastAudioBlobRef.current ? new File([lastAudioBlobRef.current.blob], lastAudioBlobRef.current.name, { type: lastAudioBlobRef.current.blob.type }) : null);
    if (!sourceFile || audioProcessing) return;

    const userMsg: Message = {
      id: `user-audio-${Date.now()}`,
      role: "user",
      content: iterativeInstruction || input.trim() || "অডিওটি এডিট করো",
      timestamp: new Date(),
      userAudioName: sourceFile.name,
      userAudioSize: sourceFile.size,
      userAudioMime: sourceFile.type,
      userAudioInstruction: iterativeInstruction || input.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setAudioProcessing(true);
    setAudioProcessingStage("প্রসেসিং শুরু হচ্ছে...");
    setError(null);

    try {
      const reader = new FileReader();
      const audioBase64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(sourceFile);
      });
      const audioBase64 = await audioBase64Promise;
      const audioMime = sourceFile.type;
      const sourceName = sourceFile.name;

      setAudioProcessingStage("AI বিশ্লেষণ করছে...");
      const res = await fetch("/api/audio-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioData: audioBase64,
          audioMime,
          audioFilename: sourceName,
          instruction: userMsg.content,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `সার্ভার ত্রুটি: ${res.status}`);
      }

      setAudioProcessingStage("ফাইল তৈরি হচ্ছে...");
      const {
        audioData: resultBase64,
        audioMime: resultMime,
        description,
        appliedSteps,
        intent,
        pipeline,
        technicalNote,
        vocalContext,
        processingVersion,
        operationsApplied,
        outputSizeKB,
      } = await res.json();

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
    e.target.value = "";
  }, []);

  // ── Send message ────────────────────────────────────────────────────────────────
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
    if (audioFile) {
      handleAudioEdit();
      return;
    }

    const text = input.trim();
    if ((!text && !imagePreview) || isLoading) return;

    if (isAudioEditRequest(text) && !audioFile && lastAudioBlobRef.current) {
      handleAudioEdit(text);
      return;
    }

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

    const userContent: AIMessageContent = imagePreview
      ? [
          ...(text ? [{ type: "text" as const, text }] : [{ type: "text" as const, text: "দয়া করে এই ছবিটি বিশ্লেষণ করুন।" }]),
          { type: "image_url" as const, image_url: { url: imagePreview } },
        ]
      : text;

    const cleanHistory = messages
      .filter(m => m.role === "user" || m.role === "assistant")
      .filter(m => {
        const c = typeof m.content === "string" ? m.content : "";
        if (c.startsWith("[PHOTO]") || c === "[CONTACT]" || c.startsWith("[LIVE_CHAT]")) return false;
        if (m.audioUrl) return false;
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
  }, [input, isLoading, messages, imagePreview, audioFile, handleAudioEdit, isAudioEditRequest]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
      setError("পুনরায় চেষ্টা ব্যর্থ হয়েছে।");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "আসসালামু আলাইকুম! আমি মাহবুব সরদার সবুজের AI এজেন্ট। আমি আপনাকে লেখকের জীবনী, কবিতা, বই, ই-বুক এবং অডিও এডিটিং সম্পর্কে তথ্য দিয়ে সাহায্য করতে পারি। আপনি চাইলে অডিও ফাইল আপলোড করে তা এডিটও করে নিতে পারেন। কীভাবে সাহায্য করতে পারি?",
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setIsLoading(false);
    setError(null);
    retryPayloadRef.current = null;
    lastAudioBlobRef.current = null;
    setAudioFile(null);
    setIsAudioMode(false);
    setVideoFile(null);
    setVideoConverting(false);
    setImagePreview(null);
  };

  // ── Voice UI ──────────────────────────────────────────────────────────────
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      setError("আপনার ব্রাউজার ভয়েস সাপোর্ট করে না।");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Auto send voice input
      setTimeout(() => handleSend(), 500);
    };
    recognition.start();
  };

  // ── Inject Global Styles ────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof document === "undefined") return;
    const styleId = "chatbot-premium-styles";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      @keyframes chatbot-glow-pulse {
        0%, 100% { box-shadow: 0 0 15px rgba(212,168,67,0.4), 0 0 30px rgba(212,168,67,0.2); border-color: #D4A843; }
        50% { box-shadow: 0 0 25px rgba(212,168,67,0.7), 0 0 50px rgba(212,168,67,0.4); border-color: #F4D57D; }
      }
      @keyframes chatbot-ping {
        0% { transform: scale(1); opacity: 0.8; }
        100% { transform: scale(1.4); opacity: 0; }
      }
      @keyframes chatbot-ping2 {
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(1.8); opacity: 0; }
      }
      @keyframes chatbot-shimmer {
        0% { background-position: -100% center; }
        100% { background-position: 100% center; }
      }
      @keyframes chatbot-border-glow {
        0%, 100% { border-color: rgba(212,168,67,0.28); }
        50% { border-color: rgba(212,168,67,0.6); }
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      
      .chatbot-glass {
        background: rgba(8, 14, 28, 0.82) !important;
        backdrop-filter: blur(25px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(25px) saturate(180%) !important;
        border: 1px solid rgba(212, 168, 67, 0.2) !important;
      }
      
      .chatbot-scrollbar::-webkit-scrollbar { width: 5px; }
      .chatbot-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .chatbot-scrollbar::-webkit-scrollbar-thumb { background: rgba(212,168,67,0.15); border-radius: 10px; }
      .chatbot-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212,168,67,0.3); }
      
      .chatbot-input::placeholder { color: rgba(212,168,67,0.3) !important; }
      
      .chatbot-msg-user {
        background: linear-gradient(135deg, #D4A843 0%, #B8923A 100%) !important;
        color: #0A1628 !important;
        box-shadow: 0 8px 20px rgba(212,168,67,0.2) !important;
      }
      
      .chatbot-msg-ai {
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid rgba(212, 168, 67, 0.1) !important;
        backdrop-filter: blur(10px) !important;
      }
      
      .chatbot-btn-premium {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: rgba(212, 168, 67, 0.05);
        border: 1px solid rgba(212, 168, 67, 0.15);
      }
      .chatbot-btn-premium:hover {
        background: rgba(212, 168, 67, 0.12);
        border-color: rgba(212, 168, 67, 0.4);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(212, 168, 67, 0.1);
      }
    `;
    document.head.appendChild(style);
  }, []);

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
            onMouseUp={(e) => { if (!didDrag.current) { e.preventDefault(); setIsOpen(o => !o); } }}
            onTouchEnd={(e) => { if (!didDrag.current) { e.preventDefault(); setIsOpen(o => !o); } }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: 64, height: 64,
                borderRadius: "50%",
                background: "linear-gradient(145deg, #0d1b2a, #050a14)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", zIndex: 2,
                border: "2px solid #D4A843",
                animation: !isOpen ? "chatbot-glow-pulse 3s infinite" : "none",
              }}
            >
              {!isOpen && (
                <>
                  <span style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "2px solid rgba(212,168,67,0.4)", animation: "chatbot-ping 2s infinite" }} />
                  <span style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1px solid rgba(212,168,67,0.2)", animation: "chatbot-ping2 2s infinite 0.5s" }} />
                </>
              )}
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} style={{ color: "#D4A843", fontSize: "1.5rem" }}>✕</motion.span>
                ) : (
                  <motion.div key="av" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
                    <img src={AUTHOR_PHOTO} alt="AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
            className="chatbot-glass"
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: "fixed", bottom: 90, right: 20, zIndex: 150,
              width: 420, maxWidth: "calc(100vw - 40px)",
              height: "min(720px, calc(100vh - 120px))",
              borderRadius: 32, display: "flex", flexDirection: "column",
              overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,168,67,0.15)",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(180deg, rgba(212,168,67,0.15) 0%, transparent 100%)",
              borderBottom: "1px solid rgba(212,168,67,0.15)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, overflow: "hidden", border: "2px solid #D4A843", boxShadow: "0 0 15px rgba(212,168,67,0.3)" }}>
                  <img src={AUTHOR_PHOTO} alt="AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <div style={{ color: "#F4D57D", fontWeight: 800, fontSize: "1rem", fontFamily: "'AdorshoLipi', sans-serif" }}>মাহবুব সরদার সবুজ</div>
                  <div style={{ color: "rgba(212,168,67,0.6)", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} /> Online
                  </div>
                </div>
              </div>
              <button onClick={clearChat} className="chatbot-btn-premium" style={{ padding: "8px 12px", borderRadius: 12, color: "#D4A843", fontSize: "0.75rem", fontWeight: 600 }}>নতুন চ্যাট</button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="chatbot-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>
              {messages.map((msg, i) => (
                <MessageBubble key={msg.id} message={msg} onNavigate={setLocation} onSwitchToLive={() => {}} isLatest={i === messages.length - 1} />
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: 8, padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 16, width: "fit-content" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4A843", animation: "chatbot-ping 1s infinite" }} />
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4A843", animation: "chatbot-ping 1s infinite 0.2s" }} />
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4A843", animation: "chatbot-ping 1s infinite 0.4s" }} />
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div style={{ padding: "20px 24px", background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(212,168,67,0.1)" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, background: "rgba(255,255,255,0.03)", borderRadius: 20, padding: "8px 8px 8px 16px", border: "1px solid rgba(212,168,67,0.15)" }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="আপনার প্রশ্ন লিখুন..."
                  rows={1}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", padding: "8px 0", fontSize: "0.9rem", resize: "none", maxHeight: 120, fontFamily: "'AdorshoLipi', sans-serif" }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={startListening} style={{ width: 40, height: 40, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: isListening ? "rgba(239,68,68,0.2)" : "transparent", color: isListening ? "#ef4444" : "rgba(212,168,67,0.6)", transition: "0.3s" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  </button>
                  <button onClick={handleSend} disabled={!input.trim() && !imagePreview} style={{ width: 40, height: 40, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: input.trim() ? "#D4A843" : "rgba(212,168,67,0.1)", color: input.trim() ? "#0A1628" : "rgba(212,168,67,0.3)", transition: "0.3s" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 10, textAlign: "center", fontSize: "0.65rem", color: "rgba(212,168,67,0.4)", fontFamily: "'AdorshoLipi', sans-serif" }}>মাহবুব সরদার সবুজ AI Agent • Premium Experience</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MessageBubble({ message, onNavigate, isLatest }: { message: Message; onNavigate: (path: string) => void; onSwitchToLive: () => void; isLatest?: boolean }) {
  const isUser = message.role === "user";
  const { displayText, isDone } = useTypingText(message.content, isLatest ? 15 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}
    >
      <div
        className={isUser ? "chatbot-msg-user" : "chatbot-msg-ai"}
        style={{
          maxWidth: "85%",
          padding: "14px 18px",
          borderRadius: isUser ? "24px 24px 4px 24px" : "24px 24px 24px 4px",
          fontSize: "0.9rem",
          lineHeight: 1.6,
          fontFamily: "'AdorshoLipi', sans-serif",
          position: "relative",
        }}
      >
        {isUser ? message.content : displayText}
        {!isUser && !isDone && <span style={{ display: "inline-block", width: 8, height: 15, background: "#D4A843", marginLeft: 4, animation: "chatbot-ping 0.8s infinite" }} />}
        
        {/* Action Buttons in AI response */}
        {!isUser && isDone && (
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PAGE_MAP.filter(p => message.content.toLowerCase().includes(p.keywords[0])).map(p => (
              <button key={p.path} onClick={() => onNavigate(p.path)} className="chatbot-btn-premium" style={{ padding: "6px 10px", borderRadius: 8, fontSize: "0.7rem", color: "#D4A843" }}>{p.label}</button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
