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
async function callAI(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  attempt = 0
): Promise<string> {
  const MAX_RETRIES = 3;
  const TIMEOUT_MS = 30000;

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
তুমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI Agent। তুমি বাংলায় এবং ইংরেজিতে যেকোনো প্রশ্নের উত্তর দাও।

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
৫. ডিজাইন বা এডিটিং সংক্রান্ত প্রশ্নে বিস্তারিত গাইডলাইন দেবে।

## মাহবুব সরদার সবুজ — সম্পূর্ণ তথ্য

### ব্যক্তিগত পরিচয়
- পুরো নাম: মাহবুব সরদার সবুজ (Mahbub Sardar Sabuj)
- পেশা: লেখক ও কবি (বাংলা সাহিত্য)
- জন্মস্থান: কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়ি
- পিতা: ফানাউল্লাহ সরদার
- মাতা: আহামালী বিনতে মাসুরা। তিনি অবিবাহিত।
- বর্তমান অবস্থান: সৌদি আরব
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

### ওয়েবসাইটে থাকা লেখার তালিকা

জীবনদর্শন: আচরণই আসল পরিচয়, অনুভূতির অসমতা, অব্যক্ত দীর্ঘশ্বাস, দিশাহীনতা, আমার জন্য সময় কোথায়, ভালো মানুষেরা সবসময় ঠকে, আমি মানুষ চিনিনি, ভুল মানুষের শহর, মূল্য থাকে প্রয়োজনে, মূল্যহীন অনুভূতি, বিশ্বাসের মূল্য, প্রকৃত কাছের মানুষ, সুদিনের দেখা মিলবে, অনুশোচনা, একাকী হয়ে বাঁচতে শেখে, সব ঠিক হয়ে যাবে একদিন, অনিশ্চিত জীবন, ভাগ্য পরিবর্তন, মানুষের যত্ন নিতে হয়, নিজেকে বাঁচানো, জীবন কাউকে ধরে রাখে না, মানুষের আসল চেহারা, সময় নেয় বিচার করতে, সম্মানের মূল্য

ভালোবাসা: ভালোবাসার সিংহাসন, অঘোষিত অপেক্ষা, ভালোবাসা প্রমাণ, মনের মানুষের কথা, ভালোবাসার মর্যাদা, ভুলগুলো ক্ষমা করে দিও, সত্যি যদি ভালোবাসো রেখে দিও, মন আগে দেহ পরে, তুমি কেন মন না খুঁজে দেহ খুঁজো, ভালোবাসা অটুট থাকুক, তোমাকে তোমার মতো করেই ভালোবাসি, আমার তোমাকেই লাগবে, অভিমানও এক ধরনের ভালোবাসা, আমি কখনো তোমায় ঘৃণা করিনি, ভালোবাসার দাগ, ভালোবাসার দোষ নেই, বন্ধুত্ব কখনো ভাঙে না

বিচ্ছেদ: দূরত্বের কৌশল, বুকে মাথা রাখার তৃষ্ণা, যাকে তুমি ভালোবাসো, নিষ্ঠুরতার শিকার, কারো হতে পারিনি, দূরত্বের পরিণতি, দূরে যাওয়ার শিক্ষা, দূরত্বের মূল্য, আমি ভালোবেসেছিলাম অগাধ বিশ্বাস নিয়ে

ছোট লেখা: রাতের বেঈমানি, বিনয়ের শক্তি, মেয়েদের কঠিন হওয়ার কারণ, নারীর মূল্য, ভালো মানুষকে ঠকানো হয়, স্বার্থের জন্য স্বপ্ন ভাঙা, মনের যত্ন নিন, সত্য চুপ থাকে, নীরবতাই যথেষ্ট, ভালো থাকা আর ভালো রাখা

## সরদার ডিজাইন স্টুডিও — সম্পূর্ণ গাইড [BUTTON:/editor]

সরদার ডিজাইন স্টুডিও একটি বিনামূল্যের অনলাইন ডিজাইন টুল যেখানে আপনি সুন্দর কবিতা কার্ড ও ডিজাইন তৈরি করতে পারবেন।

### টুলসমূহ ও ব্যবহার পদ্ধতি

**ক্যানভাস টুল (📐)**
- ক্যানভাসের আকার পরিবর্তন করুন (1:1, 4:5, 9:16 ইত্যাদি)
- Export quality নির্বাচন করুন (PNG বা JPG)
- "সেভ করুন" বাটনে ক্লিক করে ডাউনলোড করুন

**লেখা টুল (✍️)**
- বিষয়বস্তু ট্যাব: শিরোনাম, মূল লেখা, লেখকের নাম লিখুন
- স্টাইল ট্যাব: রং, ফন্ট সাইজ, bold/italic, alignment পরিবর্তন করুন
- ফন্ট ট্যাব: ১০টি বাংলা ফন্ট থেকে পছন্দের ফন্ট বেছে নিন

**টেক্সট টুল (🖊️)**
- এই টুলে ক্লিক করুন, তারপর ক্যানভাসে যেখানে লিখতে চান সেখানে ট্যাপ করুন
- সরাসরি সেখানে একটি লেখার বাক্স আসবে — বাংলা বা ইংরেজি লিখুন
- Enter চাপুন বা "✅ যোগ করুন" বাটনে ক্লিক করুন

**স্টিকার টুল (😊)**
- ২১৬টি স্টিকার — ৬টি ক্যাটাগরিতে বিভক্ত
- পছন্দের স্টিকারে ক্লিক করলে ক্যানভাসে যোগ হবে
- স্টিকার drag করে সরানো যাবে, rotation slider দিয়ে ঘোরানো যাবে

**ফিল্টার টুল (🎨)**
- ১০টি ফিল্টার preset — Normal, Warm, Cool, Vintage, Dramatic, Fade, B&W, Sepia, Vivid, Matte
- যেকোনো ফিল্টারে ক্লিক করলে সাথে সাথে প্রিভিউ দেখাবে

**সামঞ্জস্য টুল (⚙️)**
- Brightness, Contrast, Saturation, Blur, Vignette স্লাইডার দিয়ে ছবি সামঞ্জস্য করুন

**পটভূমি টুল (🌄)**
- ছবি আপলোড করুন ক্যানভাসের পটভূমি হিসেবে
- Watermark যোগ করুন

**ব্যাকগ্রাউন্ড টুল (🖼️)**
- ১২০+ সুন্দর background — Gradient, Solid, Cosmic, Nature, Artistic, Urban
- পছন্দের background-এ ক্লিক করলে সাথে সাথে ক্যানভাসে যোগ হবে

**আপস্কেল টুল (🔍)**
- ঝাপসা ছবি ক্লিয়ার করুন
- ছবি আপলোড করুন → 2× বা 4× নির্বাচন করুন → "✨ ক্লিয়ার করুন" বাটনে ক্লিক করুন
- "আগে" ও "পরে" বাটন দিয়ে পার্থক্য দেখুন → ডাউনলোড করুন

**ক্রপ টুল (✂️)**
- Aspect ratio পরিবর্তন করুন (1:1, 4:5, 9:16, 16:9, A4)

**ড্রইং টুল (🖊️ ড্র)**
- ক্যানভাসে সরাসরি আঁকুন
- পেন্সিল, ব্রাশ, ইরেজার, লাইন, আয়তক্ষেত্র, বৃত্ত, তীর টুল
- রং ও ব্রাশ সাইজ কাস্টমাইজ করুন

### ডিজাইন টিপস
- ভালো ডিজাইনের জন্য: গাঢ় background + হালকা লেখার রং ব্যবহার করুন
- Navy থিম + সোনালি লেখা সবচেয়ে আকর্ষণীয় দেখায়
- ফন্ট সাইজ: শিরোনামের জন্য ৪০-৬০px, মূল লেখার জন্য ২৪-৩২px উপযুক্ত
- সোশ্যাল মিডিয়ার জন্য 1:1 (1080×1080) অনুপাত সবচেয়ে ভালো
- ডাউনলোড করতে উপরের "⬇ সেভ করুন" বাটনে ক্লিক করুন

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

// ── CSS Keyframes injected once ───────────────────────────────────────────────
const STYLE_ID = "chatbot-premium-styles";
if (!document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes chatbot-ping {
      0% { transform: scale(1); opacity: 0.7; }
      70% { transform: scale(1.6); opacity: 0; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes chatbot-ping2 {
      0% { transform: scale(1); opacity: 0.4; }
      70% { transform: scale(2.1); opacity: 0; }
      100% { transform: scale(2.1); opacity: 0; }
    }
    @keyframes chatbot-shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes chatbot-glow-pulse {
      0%, 100% { box-shadow: 0 0 8px rgba(212,168,67,0.5), 0 0 20px rgba(212,168,67,0.2); }
      50% { box-shadow: 0 0 16px rgba(212,168,67,0.8), 0 0 40px rgba(212,168,67,0.4); }
    }
    @keyframes chatbot-dot-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-8px); }
    }
    .chatbot-scrollbar::-webkit-scrollbar { width: 4px; }
    .chatbot-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .chatbot-scrollbar::-webkit-scrollbar-thumb { background: rgba(212,168,67,0.35); border-radius: 4px; }
    .chatbot-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212,168,67,0.6); }
  `;
  document.head.appendChild(style);
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ message, onNavigate }: { message: Message; onNavigate: (path: string) => void }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20, y: 5 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="flex justify-end mb-4"
      >
        <div style={{
          background: "linear-gradient(135deg, #C9A84C 0%, #D4A843 40%, #E8C060 100%)",
          color: "#0A1628",
          borderRadius: "20px 20px 4px 20px",
          padding: "11px 16px",
          maxWidth: "78%",
          fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
          fontSize: "0.875rem",
          lineHeight: 1.75,
          fontWeight: 600,
          boxShadow: "0 4px 20px rgba(212,168,67,0.35), 0 2px 8px rgba(0,0,0,0.3)",
        }}>
          {message.content}
          <div style={{ fontSize: "0.65rem", color: "rgba(10,22,40,0.55)", marginTop: 4, textAlign: "right" }}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </motion.div>
    );
  }

  const { text, buttons, showPhoto } = parseContent(message.content);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, y: 5 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="flex gap-3 mb-4"
    >
      {/* Small avatar */}
      <div style={{
        width: 34, height: 34,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        marginTop: 2,
        border: "1.5px solid rgba(212,168,67,0.7)",
        boxShadow: "0 0 10px rgba(212,168,67,0.4)",
      }}>
        <img src={AUTHOR_PHOTO} alt="AI" style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            t.parentElement!.innerHTML = '<span style="color:#D4A843;font-size:10px;display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#1a2e4a;font-weight:700;">AI</span>';
          }} />
      </div>

      <div style={{ maxWidth: "82%", flex: 1 }}>
        {showPhoto && (
          <div style={{ marginBottom: 10 }}>
            <img src={AUTHOR_PHOTO} alt="মাহবুব সরদার সবুজ"
              style={{
                borderRadius: 14,
                width: "100%",
                maxWidth: 200,
                border: "2px solid rgba(212,168,67,0.6)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }} />
          </div>
        )}
        {text && (
          <div style={{
            background: "linear-gradient(145deg, rgba(18,32,52,0.98) 0%, rgba(14,26,44,0.98) 100%)",
            borderRadius: "4px 20px 20px 20px",
            padding: "12px 16px",
            color: "rgba(248,242,230,0.95)",
            fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
            fontSize: "0.875rem",
            lineHeight: 1.85,
            whiteSpace: "pre-wrap",
            border: "1px solid rgba(212,168,67,0.2)",
            borderLeft: "3px solid rgba(212,168,67,0.75)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}>
            {text}
          </div>
        )}
        {buttons.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {buttons.map(btn => (
              <button
                key={btn.path}
                onClick={() => onNavigate(btn.path)}
                style={{
                  background: "linear-gradient(135deg, rgba(212,168,67,0.12) 0%, rgba(212,168,67,0.06) 100%)",
                  border: "1px solid rgba(212,168,67,0.45)",
                  color: "#D4A843",
                  borderRadius: 20,
                  padding: "6px 14px",
                  fontSize: "0.78rem",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontWeight: 600,
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = "linear-gradient(135deg, rgba(212,168,67,0.28) 0%, rgba(212,168,67,0.18) 100%)";
                  b.style.borderColor = "#D4A843";
                  b.style.boxShadow = "0 4px 12px rgba(212,168,67,0.25)";
                  b.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = "linear-gradient(135deg, rgba(212,168,67,0.12) 0%, rgba(212,168,67,0.06) 100%)";
                  b.style.borderColor = "rgba(212,168,67,0.45)";
                  b.style.boxShadow = "none";
                  b.style.transform = "translateY(0)";
                }}
              >
                {btn.label} →
              </button>
            ))}
          </div>
        )}
        <div style={{ color: "rgba(140,155,170,0.55)", fontSize: "0.65rem", marginTop: 5, paddingLeft: 4 }}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </motion.div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3 mb-4"
    >
      <div style={{
        width: 34, height: 34, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
        border: "1.5px solid rgba(212,168,67,0.7)",
        boxShadow: "0 0 10px rgba(212,168,67,0.4)",
      }}>
        <img src={AUTHOR_PHOTO} alt="AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{
        background: "linear-gradient(145deg, rgba(18,32,52,0.98) 0%, rgba(14,26,44,0.98) 100%)",
        border: "1px solid rgba(212,168,67,0.2)",
        borderLeft: "3px solid rgba(212,168,67,0.75)",
        borderRadius: "4px 20px 20px 20px",
        padding: "14px 18px",
        display: "flex",
        gap: 6,
        alignItems: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "linear-gradient(135deg, #E8C060, #D4A843)",
            boxShadow: "0 0 6px rgba(212,168,67,0.5)",
            animation: `chatbot-dot-bounce 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: `আস্সালামু আলাইকুম! আমি মাহবুব সরদার সবুজ AI Agent।

আমি তাঁর সম্পর্কে সব তথ্য দিতে পারি — কবিতা, ই-বুক, যোগাযোগ। এছাড়া সরদার ডিজাইন স্টুডিও ব্যবহারের গাইডলাইনও দিতে পারি। যেকোনো বিষয়ে প্রশ্ন করুন!`,
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [btnPos, setBtnPos] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const retryPayloadRef = useRef<{ role: "user" | "assistant" | "system"; content: string }[] | null>(null);
  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, bx: 0, by: 0 });

  const [, navigate] = useLocation();

  const handleNavigate = useCallback((path: string) => {
    setIsOpen(false);
    navigate(path);
  }, [navigate]);



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
    const BW = 220, BH = 52;
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
    const BW = 220, BH = 52;
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

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

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
  }, [input, isLoading, messages]);

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
    retryPayloadRef.current = null;
  };

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'AdorshoLipi';
          src: url('/fonts/AdorshoLipi.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        .chatbot-adorsho * {
          font-family: 'AdorshoLipi', 'Noto Sans Bengali', sans-serif !important;
        }
      `}</style>
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
              display: "flex",
              alignItems: "center",
              gap: 0,
            }}
            onMouseDown={handleBtnMouseDown}
            onTouchStart={handleBtnTouchStart}
          >
            {/* Avatar circle */}
            <motion.div
              onClick={() => { if (!didDrag.current) setIsOpen(o => !o); }}
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


          </div>
        );
      })()}

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-adorsho"
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            style={{
              position: "fixed",
              bottom: 96,
              right: 16,
              zIndex: 60,
              width: 390,
              maxWidth: "calc(100vw - 20px)",
              height: 600,
              maxHeight: "calc(100vh - 120px)",
              borderRadius: 24,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              background: "rgba(7,14,26,0.96)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(212,168,67,0.3)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(212,168,67,0.12), 0 0 60px rgba(212,168,67,0.06)",
            }}
          >
            {/* Watermark */}
            <div aria-hidden="true" style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${AUTHOR_PHOTO})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              opacity: 0.05,
              pointerEvents: "none",
              zIndex: 0,
              borderRadius: "inherit",
            }} />
            {/* Gradient overlay */}
            <div aria-hidden="true" style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(7,14,26,0.88) 0%, rgba(7,14,26,0.75) 40%, rgba(7,14,26,0.92) 100%)",
              pointerEvents: "none",
              zIndex: 0,
              borderRadius: "inherit",
            }} />

            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

              {/* ── Header ── */}
              <div style={{
                padding: "14px 16px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, rgba(6,12,22,0.97) 0%, rgba(10,20,36,0.97) 100%)",
                borderBottom: "1px solid rgba(212,168,67,0.2)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Header avatar with glow */}
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: "50%",
                    overflow: "hidden",
                    flexShrink: 0,
                    border: "2px solid #D4A843",
                    boxShadow: "0 0 0 3px rgba(212,168,67,0.18), 0 0 20px rgba(212,168,67,0.45), 0 0 40px rgba(212,168,67,0.2)",
                  }}>
                    <img src={AUTHOR_PHOTO} alt="মাহবুব সরদার সবুজ" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        const t = e.currentTarget;
                        t.style.display = "none";
                        t.parentElement!.innerHTML = '<span style="color:#0A1628;font-weight:700;font-size:0.8rem;display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(135deg,#D4A843,#C9A84C);">AI</span>';
                      }} />
                  </div>
                  <div>
                    {/* Shimmer title */}
                    <div style={{
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      background: "linear-gradient(90deg, #C9A84C 0%, #F0D080 30%, #D4A843 60%, #E8C060 80%, #C9A84C 100%)",
                      backgroundSize: "200% auto",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "chatbot-shimmer 3s linear infinite",
                    }}>
                      মাহবুব সরদার সবুজ
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "#4ade80",
                        boxShadow: "0 0 6px rgba(74,222,128,0.8)",
                        animation: "chatbot-glow-pulse 2s ease-in-out infinite",
                      }} />
                      <span style={{ color: "#4ade80", fontSize: "0.7rem", fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif" }}>AI Agent · সক্রিয়</span>
                    </div>
                  </div>
                </div>

                {/* Header buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={clearChat} title="নতুন কথোপকথন"
                    style={{
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      fontSize: "0.72rem",
                      color: "rgba(212,168,67,0.8)",
                      background: "rgba(212,168,67,0.08)",
                      border: "1px solid rgba(212,168,67,0.25)",
                      borderRadius: 10,
                      padding: "5px 10px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontWeight: 600,
                    }}
                    onMouseEnter={e => {
                      const b = e.currentTarget as HTMLButtonElement;
                      b.style.background = "rgba(212,168,67,0.18)";
                      b.style.borderColor = "rgba(212,168,67,0.6)";
                    }}
                    onMouseLeave={e => {
                      const b = e.currentTarget as HTMLButtonElement;
                      b.style.background = "rgba(212,168,67,0.08)";
                      b.style.borderColor = "rgba(212,168,67,0.25)";
                    }}>
                    নতুন
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="বন্ধ করুন"
                    style={{
                      width: 30, height: 30,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: "50%",
                      border: "1px solid rgba(255,100,100,0.25)",
                      color: "rgba(200,120,120,0.7)",
                      background: "rgba(255,80,80,0.06)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => {
                      const b = e.currentTarget as HTMLButtonElement;
                      b.style.background = "rgba(255,80,80,0.18)";
                      b.style.borderColor = "rgba(255,100,100,0.6)";
                      b.style.color = "#ff6464";
                    }}
                    onMouseLeave={e => {
                      const b = e.currentTarget as HTMLButtonElement;
                      b.style.background = "rgba(255,80,80,0.06)";
                      b.style.borderColor = "rgba(255,100,100,0.25)";
                      b.style.color = "rgba(200,120,120,0.7)";
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* ── Messages ── */}
              <div className="chatbot-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px" }}>
                {messages.map(msg => (
                  <MessageBubble key={msg.id} message={msg} onNavigate={handleNavigate} />
                ))}
                {isLoading && <TypingIndicator />}

                {error && !isLoading && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "8px 0" }}>
                    <div style={{
                      textAlign: "center",
                      color: "#f87171",
                      fontSize: "0.78rem",
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      borderRadius: 12,
                      padding: "10px 14px",
                      width: "100%",
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    }}>
                      {error}
                    </div>
                    <button
                      onClick={handleRetry}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 18px",
                        background: "rgba(212,168,67,0.12)",
                        border: "1px solid rgba(212,168,67,0.4)",
                        color: "#D4A843",
                        borderRadius: 14,
                        fontSize: "0.78rem",
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

              {/* ── Suggestions ── */}
              {messages.length === 1 && (
                <div style={{
                  padding: "10px 14px 12px",
                  borderTop: "1px solid rgba(212,168,67,0.1)",
                  background: "rgba(6,12,22,0.5)",
                }}>
                  <p style={{
                    fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    fontSize: "0.68rem",
                    color: "rgba(212,168,67,0.5)",
                    marginBottom: 8,
                    letterSpacing: "0.04em",
                  }}>জিজ্ঞেস করুন:</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                    {SUGGESTIONS.map(s => (
                      <button key={s}
                        onClick={() => { setInput(s); inputRef.current?.focus(); }}
                        style={{
                          fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                          fontSize: "0.75rem",
                          color: "rgba(212,168,67,0.85)",
                          background: "rgba(18,32,52,0.7)",
                          border: "1px solid rgba(42,58,74,0.9)",
                          borderRadius: 12,
                          padding: "8px 10px",
                          cursor: "pointer",
                          textAlign: "left",
                          lineHeight: 1.45,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={e => {
                          const b = e.currentTarget as HTMLButtonElement;
                          b.style.background = "rgba(212,168,67,0.12)";
                          b.style.borderColor = "rgba(212,168,67,0.5)";
                          b.style.color = "#D4A843";
                          b.style.transform = "translateY(-1px)";
                          b.style.boxShadow = "0 4px 12px rgba(212,168,67,0.15)";
                        }}
                        onMouseLeave={e => {
                          const b = e.currentTarget as HTMLButtonElement;
                          b.style.background = "rgba(18,32,52,0.7)";
                          b.style.borderColor = "rgba(42,58,74,0.9)";
                          b.style.color = "rgba(212,168,67,0.85)";
                          b.style.transform = "translateY(0)";
                          b.style.boxShadow = "none";
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Input ── */}
              <div style={{
                padding: "12px 14px 14px",
                borderTop: "1px solid rgba(212,168,67,0.15)",
                background: "linear-gradient(135deg, rgba(6,12,22,0.97) 0%, rgba(10,20,36,0.97) 100%)",
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="মাহবুব সরদার সবুজ সম্পর্কে জিজ্ঞেস করুন..."
                    rows={1}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      background: "rgba(14,26,44,0.9)",
                      color: "rgba(248,242,230,0.95)",
                      border: "1px solid rgba(42,58,74,0.9)",
                      borderRadius: 16,
                      padding: "10px 14px",
                      fontSize: "0.875rem",
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      resize: "none",
                      minHeight: 42,
                      maxHeight: 100,
                      overflowY: "auto",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      lineHeight: 1.6,
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = "rgba(212,168,67,0.65)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,168,67,0.1), 0 0 20px rgba(212,168,67,0.08)";
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = "rgba(42,58,74,0.9)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    style={{
                      width: 42, height: 42,
                      borderRadius: 14,
                      background: input.trim() && !isLoading
                        ? "linear-gradient(135deg, #E8C060 0%, #D4A843 50%, #C9A84C 100%)"
                        : "rgba(212,168,67,0.2)",
                      border: "none",
                      color: input.trim() && !isLoading ? "#0A1628" : "rgba(212,168,67,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                      flexShrink: 0,
                      transition: "all 0.2s",
                      boxShadow: input.trim() && !isLoading ? "0 4px 16px rgba(212,168,67,0.4)" : "none",
                    }}
                    onMouseEnter={e => {
                      if (input.trim() && !isLoading) {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(212,168,67,0.6)";
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = input.trim() && !isLoading ? "0 4px 16px rgba(212,168,67,0.4)" : "none";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                    }}
                  >
                    {isLoading ? (
                      <div style={{
                        width: 16, height: 16,
                        border: "2px solid rgba(212,168,67,0.4)",
                        borderTop: "2px solid #D4A843",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }} />
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    )}
                  </button>
                </div>
                <p style={{
                  color: "rgba(100,120,140,0.5)",
                  fontSize: "0.65rem",
                  marginTop: 6,
                  textAlign: "center",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                }}>Shift+Enter = নতুন লাইন</p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
