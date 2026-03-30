import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

interface ActionButton {
  label: string;
  path: string;
}

// ── AI call with retry + timeout ──────────────────────────────────────────────
// দীর্ঘস্থায়ী সমাধান:
//   1. AbortController দিয়ে 30s timeout — request ঝুলে থাকবে না
//   2. Exponential backoff retry (3 বার) — network glitch এ নিজেই retry করবে
//   3. প্রতিটি retry-এর আগে delay বাড়বে (1s → 2s → 4s)
async function callAI(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  attempt = 0
): Promise<string> {
  const MAX_RETRIES = 3;
  const TIMEOUT_MS = 30000; // 30 seconds

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      // 5xx server error হলে retry করো, 4xx হলে করো না
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

    // Network error বা timeout হলে retry করো
    if (attempt < MAX_RETRIES - 1) {
      const isAborted = err?.name === "AbortError";
      const isNetworkError = err?.name === "TypeError" || err?.message?.includes("fetch");

      if (isAborted || isNetworkError) {
        await delay(Math.pow(2, attempt) * 1000);
        return callAI(messages, attempt + 1);
      }
    }

    // সব retry শেষ হলে বাংলায় error message
    throw new Error("connection_failed");
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const AUTHOR_PHOTO = "/images/author-photo.jpg";

// ── Page map ─────────────────────────────────────────────────────────────────
const PAGE_MAP: { path: string; label: string; keywords: string[] }[] = [
  { path: "/about",    label: "পরিচিতি পেজ দেখুন",    keywords: ["about", "পরিচিতি", "পরিচয়", "জীবনী"] },
  { path: "/ebooks",   label: "ই-বুক সংগ্রহ দেখুন",   keywords: ["ebooks", "ebook", "ই-বুক", "বই"] },
  { path: "/writings", label: "লেখালেখি পেজ দেখুন",   keywords: ["writings", "writing", "লেখালেখি", "লেখা", "কবিতা"] },
  { path: "/contact",  label: "যোগাযোগ পেজ দেখুন",    keywords: ["contact", "যোগাযোগ", "ইমেইল"] },
  { path: "/editor",   label: "ডিজাইন ফরম্যাট খুলুন", keywords: ["editor", "ডিজাইন", "ফরম্যাট"] },
  { path: "/",         label: "হোম পেজ দেখুন",        keywords: ["home", "হোম"] },
  { path: "/ebooks/read/smritir-boshonte", label: "স্মৃতির বসন্তে তুমি পড়ুন",  keywords: ["smritir", "স্মৃতির বসন্তে"] },
  { path: "/ebooks/read/chand-phool",      label: "চাঁদফুল পড়ুন",              keywords: ["chand-phool", "চাঁদফুল"] },
  { path: "/ebooks/read/shomoyer-gohvore", label: "সময়ের গহ্বরে পড়ুন",        keywords: ["shomoyer", "সময়ের গহ্বরে"] },
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
তুমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI Agent। তুমি বাংলায় এবং ইংরেজিতে যেকোনো প্রশ্নের উত্তর দাও।

## মূল আচরণবিধি

১. তুমি এই ওয়েবসাইট সম্পর্কে সম্পূর্ণ সঠিক ও নির্ভুল তথ্য জানবে এবং ব্যবহারকারীদের যেকোনো প্রশ্নের যথাযথ উত্তর দেওয়ার চেষ্টা করবে। কোনো অবস্থাতেই ভুল বা বিভ্রান্তিকর তথ্য প্রদান করা যাবে না। যদি কোনো তথ্য সম্পর্কে নিশ্চিত না হও, তাহলে অনুমান করে উত্তর না দিয়ে স্পষ্টভাবে জানাবে যে তুমি নিশ্চিত নও।

২. তুমি সবসময় ব্যবহারকারীদের সহায়তা করবে। যদি কেউ ওয়েবসাইট ব্যবহার করতে না পারে বা কোনো ফিচার বুঝতে অসুবিধা হয়, তাহলে ধাপে ধাপে সহজ ও পরিষ্কারভাবে গাইডলাইন প্রদান করবে (যেমন: কীভাবে লেখা পড়বে, কীভাবে ডিজাইন টুল ব্যবহার করবে ইত্যাদি)।

৩. তুমি লেখক মাহবুব সরদার সবুজ সম্পর্কে কোনো মিথ্যা, অনুমানভিত্তিক বা অযাচাইকৃত তথ্য প্রদান করবে না। শুধুমাত্র ওয়েবসাইটে থাকা যাচাইকৃত তথ্য ব্যবহার করবে।

৪. যদি কোনো ব্যবহারকারী কবিতা বা লেখা চায়, তাহলে তুমি নিজে নতুন করে কোনো লেখা তৈরি করবে না। বরং ওয়েবসাইটে থাকা মাহবুব সরদার সবুজের বিদ্যমান লেখা থেকে ব্যবহারকারীর চাহিদা অনুযায়ী উপযুক্ত লেখা খুঁজে প্রদান করবে এবং সম্পূর্ণ লেখাটি পড়তে লেখালেখি পেজে যেতে বলবে [BUTTON:/writings]।

৫. তোমার উত্তর হবে ভদ্র, পরিষ্কার এবং সহায়ক। অপ্রয়োজনীয় ইমুজি বা চিহ্ন ব্যবহার করবে না এবং সবসময় সহজ ও স্পষ্ট ভাষায় লিখবে।

## মাহবুব সরদার সবুজ সম্পর্কে যাচাইকৃত তথ্য

### ব্যক্তিগত পরিচয়
- পুরো নাম: মাহবুব সরদার সবুজ (Mahbub Sardar Sabuj)
- পেশা: লেখক ও কবি (বাংলা সাহিত্য)
- জন্মস্থান: কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়ি
- পিতা: ফানাউল্লাহ সরদার
- মাতা: আহামালী বীনতে মাসুরা
- বর্তমান অবস্থান: সৌদি আরব
- কর্মক্ষেত্র: সৌদি আরবে একটি ফার্নিচার কোম্পানিতে ম্যানেজার এবং একটি স্টুডিওতে প্রোগ্রামার
- Facebook: https://www.facebook.com/MahbubSardarSabuj
- Email: lekhokmahbubsardarsabuj@gmail.com

### সাহিত্যকর্ম ও পরিসংখ্যান
- মোট লেখা: ৭,০০০+ (কবিতা, গদ্য, প্রবন্ধ)
- ই-বুক: ৪টি প্রকাশিত
- পাঠক: লক্ষাধিক
- বিশেষত্ব: ভালোবাসা, জীবনের বাস্তবতা, আত্মসম্মান, মানবিক সম্পর্ক বিষয়ক লেখা

### প্রকাশিত বই ও ই-বুক
১. আমি বিচ্ছেদকে বলি দুঃখবিলাস — প্রথম ফিজিক্যাল বই (২০২৬)
২. স্মৃতির বসন্তে তুমি — ই-বুক [BUTTON:/ebooks/read/smritir-boshonte]
৩. চাঁদফুল — ই-বুক [BUTTON:/ebooks/read/chand-phool]
৪. সময়ের গহ্বরে — ই-বুক [BUTTON:/ebooks/read/shomoyer-gohvore]

### ওয়েবসাইটে থাকা লেখার তালিকা (বিষয়ভিত্তিক)

জীবনদর্শন: আচরণই আসল পরিচয়, অনুভূতির অসমতা, অব্যক্ত দীর্ঘশ্বাস, দিশাহীনতা, আমার জন্য সময় কোথায়, ভালো মানুষেরা সবসময় ঠকে, আমি মানুষ চিনিনি, ভুল মানুষের শহর, মূল্য থাকে প্রয়োজনে, মূল্যহীন অনুভূতি, বিশ্বাসের মূল্য, প্রকৃত কাছের মানুষ, সুদিনের দেখা মিলবে, অনুশোচনা, একাকী হয়ে বাঁচতে শেখে, সব ঠিক হয়ে যাবে একদিন, অনিশ্চিত জীবন, ভাগ্য পরিবর্তন, মানুষের যত্ন নিতে হয়, নিজেকে বাঁচানো, জীবন কাউকে ধরে রাখে না, মানুষের আসল চেহারা, সময় নেয় বিচার করতে, সম্মানের মূল্য

ভালোবাসা: ভালোবাসার সিংহাসন, অঘোষিত অপেক্ষা, ভালোবাসা প্রমাণ, মনের মানুষের কথা, ভালোবাসার মর্যাদা, ভুলগুলো ক্ষমা করে দিও, সত্যি যদি ভালোবাসো রেখে দিও, মন আগে দেহ পরে, তুমি কেন মন না খুঁজে দেহ খুঁজো, ভালোবাসা অটুট থাকুক, তোমাকে তোমার মতো করেই ভালোবাসি, আমার তোমাকেই লাগবে, অভিমানও এক ধরনের ভালোবাসা, আমি কখনো তোমায় ঘৃণা করিনি, ভালোবাসার দাগ, ভালোবাসার দোষ নেই, বন্ধুত্ব কখনো ভাঙে না

বিচ্ছেদ: দূরত্বের কৌশল, বুকে মাথা রাখার তৃষ্ণা, যাকে তুমি ভালোবাসো, নিষ্ঠুরতার শিকার, কারো হতে পারিনি, দূরত্বের পরিণতি, দূরে যাওয়ার শিক্ষা, দূরত্বের মূল্য, আমি ভালোবেসেছিলাম অগাধ বিশ্বাস নিয়ে

ছোট লেখা: রাতের বেঈমানি, বিনয়ের শক্তি, মেয়েদের কঠিন হওয়ার কারণ, নারীর মূল্য, ভালো মানুষকে ঠকানো হয়, স্বার্থের জন্য স্বপ্ন ভাঙা, মনের যত্ন নিন, সত্য চুপ থাকে, নীরবতাই যথেষ্ট, ভালো থাকা আর ভালো রাখা, প্রকাশ ও গোপন, অতিরিক্ত গুরুত্ব দেওয়া, অপমান নয় শুধরে দিন, সঠিক পথ দেখানোর মানুষ, শব্দ ও মানুষের পরিবর্তন, যোগ্যতা আমি জানি, কারো চোখে সুন্দর, ভুল বোঝা ও শুধরানো, অবহেলার দ্বিধা, সম্পর্কে মানুষ চেনা কঠিন, না বোঝার ভান, ফলবিহীন গাছ, তুমি জীবন্ত মানুষ, বেইমানদের বিশ্বাস করা, কথা বলার অভাব, তুমি না হলেও তুমি, কথার ভেতরকার স্নেহ, নির্দোষ তুমি, চাওয়া কমিয়ে রাখার মাঝেই সুখ, আমরা সবাই ভিক্ষুক, প্রয়োজনেই প্রিয়জন, ছলনার আঘাত, মৃত্যুর আগেই মানুষ মরে যায়, মূল্য বুঝে থাকা শেখো, একাকী থাকা শেখায় আত্মসম্মান

বিখ্যাত উক্তি: "কলমের স্পর্শে আমি বিদ্রোহী, ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি; কেউ কেউ ভালোবেসে ডাকে আমায় কবি।"

### ওয়েবসাইটের পেজসমূহ
- পরিচিতি [BUTTON:/about]
- বই ও ই-বুক [BUTTON:/ebooks]
- লেখালেখি [BUTTON:/writings]
- যোগাযোগ [BUTTON:/contact]
- ডিজাইন ফরম্যাট [BUTTON:/editor]
- Facebook আবৃত্তি [BUTTON:/facebook-recitations]

## প্রযুক্তিগত নির্দেশনা
- কখনো URL লিংক দেবে না (https://... ধরনের কোনো লিংক টেক্সটে লিখবে না)
- যখন কোনো পেজের কথা বলবে, শুধু [BUTTON:/path] ট্যাগ ব্যবহার করবে
- [BUTTON:/path] ট্যাগ স্বয়ংক্রিয়ভাবে সুন্দর বাটনে পরিণত হবে
- যদি কেউ মাহবুব সরদার সবুজের ছবি চায়, তাহলে [PHOTO] ট্যাগ ব্যবহার করো
- সবসময় বাংলায় উত্তর দাও (ব্যবহারকারী ইংরেজিতে জিজ্ঞেস করলে ইংরেজিতে দাও)
- উত্তর সংক্ষিপ্ত ও স্পষ্ট রাখো
- অপ্রয়োজনীয় ইমুজি বা বিশেষ চিহ্ন ব্যবহার করবে না`;

const SUGGESTIONS = [
  "মাহবুব সরদার সবুজের পরিচয় দাও",
  "তার ই-বুকগুলো কোথায় পাব?",
  "ভালোবাসা নিয়ে একটি কবিতা লিখে দাও",
  "তার বিখ্যাত লেখাগুলো কী কী?",
  "বাংলা সাহিত্য কী?",
  "যোগাযোগ করব কীভাবে?",
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
}

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
        transition={{ duration: 0.3 }}
        className="flex justify-end mb-4"
      >
        <div className="max-w-[80%] flex flex-col items-end">
          <div className="px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed whitespace-pre-wrap bg-[#D4A843] text-black">
            {message.content}
          </div>
          <span className="text-gray-500 text-xs mt-1 px-1">{formatTime(message.timestamp)}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#2a3a4a] flex items-center justify-center text-[#D4A843] font-bold text-xs ml-2 flex-shrink-0 mt-1">
          আপ
        </div>
      </motion.div>
    );
  }

  const { text, buttons, showPhoto } = parseContent(message.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start mb-4"
    >
      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 mt-1 border-2 border-[#D4A843]">
        <img
          src={AUTHOR_PHOTO}
          alt="মাহবুব সরদার সবুজ"
          className="w-full h-full object-cover"
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            t.parentElement!.innerHTML = '<span class="text-black font-bold text-xs flex items-center justify-center w-full h-full bg-[#D4A843]">AI</span>';
          }}
        />
      </div>
      <div className="max-w-[85%] flex flex-col items-start">
        <div className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-[#1e2d3d]/90 text-gray-100 border border-[#2a3a4a] backdrop-blur-sm">

          {(showPhoto || message.imageUrl) && (
            <div className="mb-3">
              <div className="relative rounded-xl overflow-hidden border-2 border-[#D4A843]/50 shadow-lg"
                style={{ maxWidth: 220 }}>
                <img
                  src={AUTHOR_PHOTO}
                  alt="মাহবুব সরদার সবুজ"
                  className="w-full object-cover"
                  style={{ maxHeight: 260 }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                  <p className="text-white text-xs font-semibold">মাহবুব সরদার সবুজ</p>
                  <p className="text-[#D4A843] text-[10px]">লেখক ও কবি</p>
                </div>
              </div>
            </div>
          )}

          <p className="whitespace-pre-wrap">{text}</p>

          {buttons.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {buttons.map((btn) => (
                <button
                  key={btn.path}
                  onClick={() => onNavigate(btn.path)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4A843]/20 to-[#D4A843]/10 hover:from-[#D4A843]/30 hover:to-[#D4A843]/20 border border-[#D4A843]/40 hover:border-[#D4A843] text-[#D4A843] rounded-xl text-xs font-semibold transition-all group"
                >
                  <span className="flex-1 text-left">{btn.label}</span>
                  <svg className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-gray-500 text-xs mt-1 px-1">{formatTime(message.timestamp)}</span>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border-2 border-[#D4A843]">
        <img src={AUTHOR_PHOTO} alt="AI" className="w-full h-full object-cover"
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            t.parentElement!.innerHTML = '<span class="text-black font-bold text-xs flex items-center justify-center w-full h-full bg-[#D4A843]">AI</span>';
          }} />
      </div>
      <div className="bg-[#1e2d3d]/90 border border-[#2a3a4a] px-4 py-3 rounded-2xl rounded-bl-sm backdrop-blur-sm">
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 bg-[#D4A843] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-[#D4A843] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-[#D4A843] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `আস্সালামু আলাইকুম! আমি মাহবুব সরদার সবুজ AI Agent। 🌟

আমি তাঁর সম্পর্কে সব তথ্য দিতে পারি — কবিতা, ই-বুক, যোগাযোগ। এছাড়া যেকোনো বিষয়ে প্রশ্ন করুন!`,
  timestamp: new Date(),
};

export default function AIChatbot() {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  // retryPayload: error হলে retry বাটনে ক্লিক করলে আবার পাঠাতে পারবে
  const retryPayloadRef = useRef<{ role: "user" | "assistant" | "system"; content: string }[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);
  const [, navigate]   = useLocation();

  // ── Draggable chatbot position ────────────────────────────────────────────
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, btnX: 0, btnY: 0 });
  const didDrag = useRef(false);

  const handleBtnMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    didDrag.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, btnX: btnPos.x, btnY: btnPos.y };
    e.preventDefault();
  };

  const handleBtnTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    isDragging.current = true;
    didDrag.current = false;
    dragStart.current = { x: t.clientX, y: t.clientY, btnX: btnPos.x, btnY: btnPos.y };
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
      setBtnPos({ x: dragStart.current.btnX + dx, y: dragStart.current.btnY + dy });
    };
    const onMouseUp = () => { isDragging.current = false; };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const t = e.touches[0];
      const dx = t.clientX - dragStart.current.x;
      const dy = t.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
      setBtnPos({ x: dragStart.current.btnX + dx, y: dragStart.current.btnY + dy });
    };
    const onTouchEnd = () => { isDragging.current = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleNavigate = useCallback((path: string) => {
    setIsOpen(false);
    navigate(path);
  }, [navigate]);

  // ── AI call করার core function ────────────────────────────────────────────
  const sendToAI = useCallback(async (
    history: { role: "user" | "assistant" | "system"; content: string }[]
  ) => {
    setIsLoading(true);
    setError(null);
    retryPayloadRef.current = history; // retry-এর জন্য সংরক্ষণ

    try {
      const reply = await callAI(history);
      const assistantMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      retryPayloadRef.current = null; // সফল হলে retry payload মুছে দাও
    } catch {
      setError("সংযোগ সমস্যা হয়েছে। নিচের বাটনে চাপুন।");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Retry বাটন ────────────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    if (retryPayloadRef.current) {
      sendToAI(retryPayloadRef.current);
    }
  }, [sendToAI]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setError(null);

    // ছবির request হলে সরাসরি উত্তর দাও (AI call লাগবে না)
    if (isPhotoRequest(userText)) {
      const photoMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "এই হলেন মাহবুব সরদার সবুজ — বাংলাদেশের প্রিয় লেখক ও কবি। [PHOTO]",
        timestamp: new Date(),
        imageUrl: AUTHOR_PHOTO,
      };
      setMessages(prev => [...prev, photoMsg]);
      return;
    }

    // AI-এর কাছে পাঠাও
    const history = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...[...messages, userMsg]
        .filter(m => m.id !== "welcome" && m.id !== "welcome-new")
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];
    await sendToAI(history);
  }, [input, isLoading, messages, sendToAI]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: "welcome-new",
      role: "assistant",
      content: "নতুন কথোপকথন শুরু হয়েছে। আপনাকে কীভাবে সাহায্য করতে পারি?",
      timestamp: new Date(),
    }]);
    setError(null);
    retryPayloadRef.current = null;
  };

  return (
    <>
      {/* Floating Button — Draggable */}
      <div
        className="fixed z-[60]"
        style={{
          bottom: `calc(1.5rem - ${btnPos.y}px)`,
          right: `calc(1.5rem - ${btnPos.x}px)`,
          filter: "drop-shadow(0 8px 32px rgba(212,168,67,0.45))",
          cursor: isDragging.current ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "none",
        }}
        onMouseDown={handleBtnMouseDown}
        onTouchStart={handleBtnTouchStart}
      >
        {/* Pulse ring animation */}
        {!isOpen && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(212,168,67,0.3)", animationDuration: "1.8s" }} />
            <span className="absolute inset-0 rounded-full" style={{ background: "rgba(212,168,67,0.15)", transform: "scale(1.18)", borderRadius: "9999px" }} />
          </>
        )}
        {/* Tooltip label */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="absolute right-[68px] top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none"
            style={{
              background: "linear-gradient(135deg, #0d1b2a 0%, #1a2e4a 100%)",
              border: "1px solid rgba(212,168,67,0.5)",
              borderRadius: 10,
              padding: "5px 12px",
              color: "#D4A843",
              fontSize: "0.72rem",
              fontFamily: "'Noto Sans Bengali', sans-serif",
              fontWeight: 600,
              letterSpacing: "0.02em",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            আমাকে জিজ্ঞেস করুন
            <span style={{
              position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)",
              width: 0, height: 0,
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderLeft: "6px solid rgba(212,168,67,0.5)",
            }} />
          </motion.div>
        )}
        <motion.button
          onClick={() => { if (!didDrag.current) setIsOpen(o => !o); }}
          className="relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.93 }}
          style={{
            background: "linear-gradient(135deg, #0d1b2a 0%, #1a2e4a 100%)",
            border: "2.5px solid #D4A843",
            boxShadow: "0 0 0 3px rgba(212,168,67,0.2), 0 8px 24px rgba(0,0,0,0.5)",
          }}
          title="মাহবুব সরদার সবুজ AI Agent"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.span key="close"
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                style={{ color: "#D4A843", fontSize: "1.3rem", fontWeight: 700 }}>✕</motion.span>
            ) : (
              <motion.div key="open"
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                className="w-full h-full">
                <img src={AUTHOR_PHOTO} alt="মাহবুব সরদার সবুজ AI" className="w-full h-full object-cover"
                  onError={(e) => {
                    const t = e.currentTarget;
                    t.style.display = "none";
                    t.parentElement!.innerHTML = '<span style="color:#D4A843;font-size:24px;">AI</span>';
                  }} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-[60] w-[380px] max-w-[calc(100vw-24px)] h-[580px] max-h-[calc(100vh-120px)] border border-[#2a3a4a] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ background: "#0d1b2a" }}
          >
            {/* Full-background watermark */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${AUTHOR_PHOTO})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                opacity: 0.07,
                pointerEvents: "none",
                zIndex: 0,
                borderRadius: "inherit",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(13,27,42,0.82) 0%, rgba(13,27,42,0.70) 50%, rgba(13,27,42,0.88) 100%)",
                pointerEvents: "none",
                zIndex: 0,
                borderRadius: "inherit",
              }}
            />

            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

              {/* Header */}
              <div className="bg-[#111827]/90 px-4 py-3 flex items-center justify-between border-b border-[#2a3a4a] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D4A843] flex-shrink-0">
                    <img src={AUTHOR_PHOTO} alt="মাহবুব সরদার সবুজ" className="w-full h-full object-cover"
                      onError={(e) => {
                        const t = e.currentTarget;
                        t.style.display = "none";
                        t.parentElement!.innerHTML = '<span class="text-black font-bold text-sm flex items-center justify-center w-full h-full bg-[#D4A843]">AI</span>';
                      }} />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">মাহবুব সরদার সবুজ AI Agent</div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-xs">সক্রিয়</span>
                    </div>
                  </div>
                </div>
                <button onClick={clearChat} title="নতুন কথোপকথন"
                  className="text-gray-400 hover:text-[#D4A843] text-xs transition-colors px-2 py-1 rounded border border-[#2a3a4a] hover:border-[#D4A843]">
                  নতুন
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {messages.map(msg => (
                  <MessageBubble key={msg.id} message={msg} onNavigate={handleNavigate} />
                ))}
                {isLoading && <TypingIndicator />}

                {/* Error + Retry বাটন */}
                {error && !isLoading && (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="text-center text-red-400 text-xs bg-red-900/20 rounded-lg px-3 py-2 w-full">
                      {error}
                    </div>
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-2 px-4 py-2 bg-[#D4A843]/20 hover:bg-[#D4A843]/30 border border-[#D4A843]/50 hover:border-[#D4A843] text-[#D4A843] rounded-xl text-xs font-semibold transition-all"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                      </svg>
                      আবার চেষ্টা করুন
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {SUGGESTIONS.map(s => (
                    <button key={s}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      className="text-xs bg-[#1e2d3d]/80 text-[#D4A843] border border-[#2a3a4a] rounded-full px-3 py-1 hover:border-[#D4A843] transition-all backdrop-blur-sm">
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-4 py-3 border-t border-[#2a3a4a] bg-[#111827]/90 backdrop-blur-sm">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="আপনার প্রশ্ন লিখুন... (Enter চাপুন)"
                    rows={1}
                    className="flex-1 bg-[#1e2d3d] text-white border border-[#2a3a4a] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843] resize-none placeholder-gray-500 max-h-24 overflow-y-auto"
                    style={{ minHeight: "40px" }}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 rounded-xl bg-[#D4A843] text-black flex items-center justify-center hover:bg-[#c49030] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-gray-600 text-xs mt-1 text-center">Shift+Enter = নতুন লাইন</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
