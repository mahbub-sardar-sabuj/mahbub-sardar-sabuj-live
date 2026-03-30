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
- মাতা: আহামালী বীনতে মাসুরা
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
        <div style={{
          background: "linear-gradient(135deg, #C9A84C, #D4A843)",
          color: "#0A1628",
          borderRadius: "18px 18px 4px 18px",
          padding: "10px 14px",
          maxWidth: "80%",
          fontFamily: "'Noto Sans Bengali', sans-serif",
          fontSize: "0.88rem",
          lineHeight: 1.7,
          fontWeight: 500,
        }}>
          {message.content}
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
  // Use absolute position from top-left for free drag anywhere
  const [btnPos, setBtnPos] = useState({ x: -1, y: -1 }); // -1 = use default bottom-right
  // Pill expanded state: true = show text label
  const [pillExpanded, setPillExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, bx: 0, by: 0 });
  const retryPayloadRef = useRef<{ role: "user" | "assistant" | "system"; content: string }[] | null>(null);
  const [, navigate] = useLocation();

  // Listen for open-chatbot event from the top banner
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("open-chatbot", handler);
    return () => window.removeEventListener("open-chatbot", handler);
  }, []);

  // Periodic pill expand: expand for 3s every 10s (only when chat closed)
  useEffect(() => {
    if (isOpen) { setPillExpanded(false); return; }
    // Show text after 1.5s on mount
    const firstShow = setTimeout(() => {
      setPillExpanded(true);
      setTimeout(() => setPillExpanded(false), 3000);
    }, 1500);
    // Then repeat every 10s
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
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleNavigate = useCallback((path: string) => {
    setIsOpen(false);
    navigate(path);
  }, [navigate]);

  // ── Drag handlers (absolute position from top-left) ─────────────────────
  const clampPos = useCallback((x: number, y: number) => {
    const BTN = 56;
    return {
      x: Math.max(0, Math.min(window.innerWidth - BTN, x)),
      y: Math.max(0, Math.min(window.innerHeight - BTN, y)),
    };
  }, []);

  // Get current pixel position (default = bottom-right)
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

    // Photo shortcut
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
      {/* Floating Button — Avatar + Text Box, always visible, draggable anywhere */}
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
              {/* Pulse ring */}
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

            {/* Animated text box — slides in from left, always shows when not open */}
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
                    paddingRight: 14,
                    paddingTop: 7,
                    paddingBottom: 7,
                    background: "linear-gradient(135deg, #1a2e4a 0%, #0d1b2a 100%)",
                    border: "1.5px solid #D4A843",
                    borderRadius: "0 20px 20px 0",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.45)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transformOrigin: "left center",
                  }}
                >
                  <span style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#D4A843",
                    letterSpacing: "0.02em",
                    display: "block",
                  }}>আমাকে জিজ্ঞেস করুন</span>
                  <span style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    fontSize: "0.6rem",
                    color: "rgba(212,168,67,0.55)",
                    display: "block",
                    marginTop: 1,
                  }}>AI সহকারী সক্রিয়</span>
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
            className="fixed bottom-24 right-6 z-[60] w-[380px] max-w-[calc(100vw-24px)] h-[580px] max-h-[calc(100vh-120px)] border border-[#2a3a4a] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ background: "#0d1b2a" }}
          >
            {/* Full-background watermark */}
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
                <div className="flex items-center gap-2">
                  <button onClick={clearChat} title="নতুন কথোপকথন"
                    className="text-gray-400 hover:text-[#D4A843] text-xs transition-colors px-2 py-1 rounded border border-[#2a3a4a] hover:border-[#D4A843]">
                    নতুন
                  </button>
                  {/* Close button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    title="বন্ধ করুন"
                    className="w-7 h-7 flex items-center justify-center rounded-full border border-[#2a3a4a] hover:border-red-400 text-gray-400 hover:text-red-400 transition-all text-sm font-bold"
                    style={{ lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {messages.map(msg => (
                  <MessageBubble key={msg.id} message={msg} onNavigate={handleNavigate} />
                ))}
                {isLoading && <TypingIndicator />}

                {/* Error + Retry */}
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
                    style={{ minHeight: "40px", fontFamily: "'Noto Sans Bengali', sans-serif" }}
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
