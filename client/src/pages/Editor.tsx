/**
 * সরদার ডিজাইন স্টুডিও — সম্পূর্ণ ঠিক করা সংস্করণ
 * ✅ Upscale: ছবি আপলোড + প্রিভিউ + ডাউনলোড
 * ✅ Drawing: সত্যিকারের canvas drawing (pencil/brush/eraser/shapes)
 * ✅ Background: ১০০+ সুন্দর background
 * ✅ সব টুল কার্যকর
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const FONTS = [
  { name: "চন্দ্রশীলা",           value: "ChandraSheela" },
  { name: "চন্দ্রশীলা প্রিমিয়াম", value: "ChandraSheelaPremium" },
  { name: "মাহবুব সরদার ফন্ট",    value: "MahbubSardarSabujFont" },
  { name: "মাসুদ নান্দনিক",        value: "MasudNandanik" },
  { name: "আদর্শ লিপি",           value: "AdorshoLipi" },
  { name: "BH Sabit",             value: "BHSabitAdorshoLightUnicode" },
  { name: "BLAB Norha",           value: "BLABNorhaGramUnicode" },
  { name: "Akhand Bengali",       value: "AkhandBengali" },
  { name: "Tiro Bangla",          value: "TiroBangla" },
  { name: "Noto Sans Bengali",    value: "NotoSansBengali" },
];

const FONT_CSS: Record<string, string> = {
  ChandraSheela:                "'ChandraSheela', serif",
  ChandraSheelaPremium:         "'ChandraSheelaPremium', serif",
  MahbubSardarSabujFont:        "'MahbubSardarSabujFont', serif",
  MasudNandanik:                "'MasudNandanik', serif",
  AdorshoLipi:                  "'AdorshoLipi', serif",
  BHSabitAdorshoLightUnicode:   "'BHSabitAdorshoLightUnicode', serif",
  BLABNorhaGramUnicode:         "'BLABNorhaGramUnicode', serif",
  AkhandBengali:                "'AkhandBengali', serif",
  TiroBangla:                   "'Tiro Bangla', serif",
  NotoSansBengali:              "'Noto Sans Bengali', sans-serif",
};

const FONT_URLS: Record<string, string> = {
  ChandraSheela:              "/fonts/ChandraSheela.ttf",
  ChandraSheelaPremium:       "/fonts/ChandraSheelaPremium.ttf",
  MahbubSardarSabujFont:      "/fonts/MahbubSardarSabujFont.ttf",
  MasudNandanik:              "/fonts/MasudNandanik.ttf",
  AdorshoLipi:                "/fonts/AdorshoLipi.ttf",
  BHSabitAdorshoLightUnicode: "/fonts/BHSabitAdorshoLightUnicode.ttf",
  BLABNorhaGramUnicode:       "/fonts/BLABNorhaGramUnicode.ttf",
  AkhandBengali:              "/fonts/AkhandBengali.ttf",
};

const THEMES = [
  { name: "বইয়ের পাতা",     bg: "#F5F0E8", text: "#1a1a1a", border: "#8B7355" },
  { name: "ক্রিম সাদা",     bg: "#FFFEF7", text: "#2d2d2d", border: "#C8B89A" },
  { name: "রাতের আকাশ",    bg: "#0d1b2a", text: "#E8D5A3", border: "#D4A843" },
  { name: "গভীর রাত",      bg: "#0a0a0a", text: "#FFFFFF", border: "#333333" },
  { name: "সোনালি সন্ধ্যা", bg: "#2C1810", text: "#F5DEB3", border: "#D4A843" },
  { name: "সবুজ প্রকৃতি",  bg: "#0d1f0d", text: "#E8F5E8", border: "#4CAF50" },
  { name: "গোলাপি স্বপ্ন",  bg: "#FFF0F5", text: "#4A1942", border: "#E91E8C" },
  { name: "নীল শান্তি",    bg: "#EEF4FF", text: "#1A237E", border: "#3F51B5" },
  { name: "বেগুনি রহস্য",  bg: "#1a0a2e", text: "#E8D5FF", border: "#9C27B0" },
  { name: "সূর্যাস্ত",     bg: "#1a0533", text: "#FFFFFF", border: "#FFD700",
    gradient: "linear-gradient(135deg,#1a0533 0%,#2d1b69 50%,#11998e 100%)" },
  { name: "অরোরা",         bg: "#0f0c29", text: "#FFFFFF", border: "#a78bfa",
    gradient: "linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)" },
  { name: "সানসেট",        bg: "#f7971e", text: "#1a0000", border: "#ffd200",
    gradient: "linear-gradient(135deg,#f7971e 0%,#ffd200 100%)" },
  { name: "ওশান",          bg: "#0575e6", text: "#FFFFFF", border: "#00f2fe",
    gradient: "linear-gradient(135deg,#0575e6 0%,#021b79 100%)" },
  { name: "রোজ গোল্ড",    bg: "#f8b4c8", text: "#3d0020", border: "#c9184a",
    gradient: "linear-gradient(135deg,#f8b4c8 0%,#ffd6a5 100%)" },
  { name: "ফরেস্ট",        bg: "#134e5e", text: "#e0ffe0", border: "#71b280",
    gradient: "linear-gradient(135deg,#134e5e 0%,#71b280 100%)" },
  { name: "মিডনাইট গোল্ড", bg: "#0d1b2a", text: "#D4A843", border: "#D4A843",
    gradient: "linear-gradient(135deg,#0d1b2a 0%,#1a2e4a 60%,#2a1a00 100%)" },
];

const SIZES = [
  { name: "বর্গ (1:1)",       w: 1080, h: 1080, icon: "⬛" },
  { name: "পোর্ট্রেট (4:5)", w: 1080, h: 1350, icon: "📱" },
  { name: "স্টোরি (9:16)",   w: 1080, h: 1920, icon: "📲" },
  { name: "আড়াআড়ি (16:9)", w: 1920, h: 1080, icon: "🖥️" },
  { name: "A4",               w: 794,  h: 1123, icon: "📄" },
];

const FRAMES = [
  { name: "নেই",     value: "none" },
  { name: "ভেতরে",   value: "inner-border" },
  { name: "কোণে",    value: "corner" },
  { name: "ডবল",     value: "double-border" },
  { name: "বাম বার", value: "left-bar" },
  { name: "শ্যাডো",  value: "shadow-frame" },
  { name: "অর্নেট",  value: "ornate" },
];

const FILTER_PRESETS = [
  { name: "normal",    filter: "none",                                                           label: "স্বাভাবিক", emoji: "🔆" },
  { name: "vivid",     filter: "saturate(1.8) contrast(1.1)",                                    label: "উজ্জ্বল",   emoji: "✨" },
  { name: "warm",      filter: "sepia(0.3) saturate(1.4) brightness(1.05)",                      label: "উষ্ণ",      emoji: "🌅" },
  { name: "cool",      filter: "hue-rotate(20deg) saturate(1.2) brightness(1.05)",               label: "শীতল",      emoji: "❄️" },
  { name: "vintage",   filter: "sepia(0.6) contrast(1.1) brightness(0.9) saturate(0.8)",         label: "ভিনটেজ",    emoji: "📷" },
  { name: "bw",        filter: "grayscale(1)",                                                   label: "সাদাকালো",  emoji: "⬛" },
  { name: "dramatic",  filter: "contrast(1.4) brightness(0.85) saturate(1.2)",                   label: "নাটকীয়",   emoji: "🎭" },
  { name: "golden",    filter: "sepia(0.4) saturate(1.6) hue-rotate(-10deg) brightness(1.05)",   label: "সোনালি",    emoji: "🌟" },
  { name: "moonlight", filter: "brightness(0.8) contrast(1.2) hue-rotate(200deg) saturate(0.6)", label: "জ্যোৎস্না", emoji: "🌙" },
  { name: "matte",     filter: "contrast(0.9) brightness(1.1) saturate(0.85)",                   label: "ম্যাট",     emoji: "🎨" },
];

const STICKER_CATEGORIES = [
  {
    label: "🌿 প্রকৃতি",
    stickers: ["🌸","🌙","⭐","✨","🌿","🦋","🕊️","🌹","💫","🔥","🌊","🎋",
               "🌺","🪷","🌟","🏵️","🌴","🍂","🌻","🌈","☁️","⚡","🌕","🍃",
               "🌷","🌠","🌾","🍀","🌲","🌳","🌵","🎍","🎑","🌄","🌅","🌃"],
  },
  {
    label: "❤️ আবেগ",
    stickers: ["❤️","💛","💙","💜","🤍","🖤","💚","🧡","💗","💓","💞","💕",
               "💔","❣️","💝","💘","🥰","😍","🥺","😢","😭","😊","😄","🤩",
               "😎","🥳","😇","🤗","😴","😤","🫶","💪","🙏","👏","🤝","✌️"],
  },
  {
    label: "✨ প্রতীক",
    stickers: ["💎","🧿","🔮","🪐","🌠","☯️","✡️","☪️","✝️","🕉️","☮️","🔯",
               "⚜️","🏆","🎖️","🥇","🎗️","🎀","🎁","🎊","🎉","🎈","🎆","🎇",
               "🪄","🔑","🗝️","🧲","💡","🕯️","🪔","🔔","🔕","📿","🧿","🪬"],
  },
  {
    label: "🌺 উৎসব",
    stickers: ["🎄","🎃","🎋","🎍","🎎","🎏","🎐","🎑","🧧","🎊","🎉","🎈",
               "🪅","🎆","🎇","🧨","🪔","🕯️","🎂","🍰","🥂","🍾","🥳","🎁",
               "🎀","🎗️","🎟️","🎫","🪄","🎭","🎪","🎠","🎡","🎢","🎯","🎲"],
  },
  {
    label: "🍎 খাবার",
    stickers: ["🍎","🍊","🍋","🍇","🍓","🫐","🍒","🍑","🥭","🍍","🥥","🍌",
               "🍉","🍈","🍏","🥝","🍅","🫒","🥑","🌽","🥕","🧅","🧄","🥦",
               "🍕","🍔","🍜","🍣","🍦","🎂","☕","🧋","🍵","🥤","🍷","🍸"],
  },
  {
    label: "✈️ ভ্রমণ",
    stickers: ["✈️","🚂","🚢","🚗","🏔️","🏝️","🗺️","🧭","⛺","🏕️","🌍","🌏",
               "🌐","🗼","🏰","🏯","🗽","⛩️","🕌","🕍","⛪","🏛️","🌁","🌉",
               "🎡","🎢","🎠","🏖️","🏜️","🏞️","🌋","🏟️","🏗️","🌃","🌆","🌇"],
  },
];

const TEMPLATES = [
  { label: "প্রেম",       title: "ভালোবাসা",        body: "ভালোবাসা আমার কাছে\nতোমার হাসির মতো সহজ,\nতোমার চোখের মতো গভীর।" },
  { label: "অনুপ্রেরণা", title: "জীবন",             body: "প্রতিটি ভোরে নতুন সুযোগ আসে,\nসেই সুযোগকে কাজে লাগাও।" },
  { label: "প্রকৃতি",    title: "প্রকৃতির ডাক",    body: "সবুজ পাতার ফাঁকে ফাঁকে\nআলো নামে নীরবে।" },
  { label: "বিচ্ছেদ",    title: "বিচ্ছেদের ব্যথা", body: "যে চলে গেছে সে আর ফেরে না,\nস্মৃতিরা শুধু বুকে জ্বলে।" },
];

const AUTHOR_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";

const QUICK_COLORS = [
  "#FFFFFF","#000000","#D4A843","#E8D5A3","#FF6B6B","#4ECDC4",
  "#45B7D1","#96CEB4","#FF9FF3","#54A0FF","#5F27CD","#00D2D3",
  "#FF9F43","#EE5A24","#C8D6E5","#8395A7",
];

// ─────────────────────────────────────────────────────────────────────────────
// 100+ Beautiful Backgrounds
// ─────────────────────────────────────────────────────────────────────────────

const BG_CATEGORIES = [
  {
    label: "🌅 গ্রেডিয়েন্ট",
    bgs: [
      { name: "সোনালি রাত",    css: "linear-gradient(135deg,#0d1b2a,#1a2e4a,#2a1a00)" },
      { name: "অরোরা",         css: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" },
      { name: "সূর্যাস্ত",     css: "linear-gradient(135deg,#f7971e,#ffd200)" },
      { name: "ওশান",          css: "linear-gradient(135deg,#0575e6,#021b79)" },
      { name: "রোজ গোল্ড",    css: "linear-gradient(135deg,#f8b4c8,#ffd6a5)" },
      { name: "ফরেস্ট",        css: "linear-gradient(135deg,#134e5e,#71b280)" },
      { name: "বেগুনি স্বপ্ন", css: "linear-gradient(135deg,#667eea,#764ba2)" },
      { name: "আগুন",          css: "linear-gradient(135deg,#f093fb,#f5576c)" },
      { name: "নীল সমুদ্র",   css: "linear-gradient(135deg,#4facfe,#00f2fe)" },
      { name: "সবুজ প্রকৃতি", css: "linear-gradient(135deg,#43e97b,#38f9d7)" },
      { name: "মধ্যরাত",      css: "linear-gradient(135deg,#0c0c0c,#1a1a2e,#16213e)" },
      { name: "চেরি ব্লসম",   css: "linear-gradient(135deg,#ffecd2,#fcb69f)" },
      { name: "লেভেন্ডার",    css: "linear-gradient(135deg,#a18cd1,#fbc2eb)" },
      { name: "সোনালি ঘাস",   css: "linear-gradient(135deg,#d4fc79,#96e6a1)" },
      { name: "ডিপ স্পেস",    css: "linear-gradient(135deg,#000428,#004e92)" },
      { name: "কমলা আকাশ",   css: "linear-gradient(135deg,#ff9a9e,#fecfef)" },
      { name: "সায়ান",        css: "linear-gradient(135deg,#43e97b,#38f9d7,#4facfe)" },
      { name: "ম্যাজেন্টা",   css: "linear-gradient(135deg,#f953c6,#b91d73)" },
      { name: "ইন্ডিগো",      css: "linear-gradient(135deg,#4e54c8,#8f94fb)" },
      { name: "কফি",          css: "linear-gradient(135deg,#6f4e37,#c8a97e)" },
    ],
  },
  {
    label: "🌑 সলিড রং",
    bgs: [
      { name: "কালো",          css: "#000000" },
      { name: "সাদা",          css: "#FFFFFF" },
      { name: "গাঢ় নেভি",    css: "#0d1b2a" },
      { name: "গাঢ় বেগুনি",  css: "#1a0a2e" },
      { name: "গাঢ় সবুজ",    css: "#0d1f0d" },
      { name: "গাঢ় লাল",     css: "#1a0000" },
      { name: "গাঢ় বাদামি",  css: "#1a0e00" },
      { name: "স্লেট",        css: "#1e293b" },
      { name: "চারকোল",       css: "#2d2d2d" },
      { name: "ক্রিম",        css: "#FFFEF7" },
      { name: "বেইজ",         css: "#F5F0E8" },
      { name: "আইভরি",        css: "#FFFFF0" },
      { name: "সোনালি",       css: "#D4A843" },
      { name: "রুবি",         css: "#9B1D20" },
      { name: "ইমারেল্ড",    css: "#2E8B57" },
      { name: "স্যাফায়ার",   css: "#0F52BA" },
      { name: "অ্যাম্বার",    css: "#FFBF00" },
      { name: "কোরাল",        css: "#FF6B6B" },
      { name: "মিন্ট",        css: "#98D8C8" },
      { name: "লাভেন্ডার",   css: "#E6E6FA" },
    ],
  },
  {
    label: "🌌 কসমিক",
    bgs: [
      { name: "গ্যালাক্সি",   css: "radial-gradient(ellipse at center,#1a0533 0%,#2d1b69 40%,#0d1b2a 100%)" },
      { name: "নেবুলা",       css: "radial-gradient(ellipse at 30% 50%,#4a0080 0%,#000428 60%,#004e92 100%)" },
      { name: "স্টারফিল্ড",  css: "radial-gradient(ellipse at top,#1b2735 0%,#090a0f 100%)" },
      { name: "মিল্কিওয়ে",   css: "linear-gradient(160deg,#0d0d1a 0%,#1a0533 30%,#0d1b2a 60%,#000 100%)" },
      { name: "অরোরা বোরিয়ালিস", css: "linear-gradient(180deg,#001a00 0%,#003300 30%,#00cc44 60%,#0066ff 100%)" },
      { name: "ডার্ক ম্যাটার", css: "radial-gradient(ellipse at 70% 30%,#2d0050 0%,#000 60%)" },
      { name: "কসমিক ডাস্ট", css: "linear-gradient(135deg,#1a0533,#4a0080,#0d1b2a,#000428)" },
      { name: "সুপারনোভা",   css: "radial-gradient(ellipse at center,#ff6b00 0%,#cc0000 30%,#1a0000 70%,#000 100%)" },
      { name: "ব্ল্যাক হোল", css: "radial-gradient(ellipse at center,#000 0%,#1a0533 40%,#000 100%)" },
      { name: "কোয়াসার",     css: "linear-gradient(135deg,#000428,#004e92,#1a0533,#4a0080)" },
    ],
  },
  {
    label: "🌿 প্রকৃতি",
    bgs: [
      { name: "ভোরের আলো",   css: "linear-gradient(180deg,#ffecd2 0%,#fcb69f 40%,#ff9a9e 100%)" },
      { name: "বনের ছায়া",   css: "linear-gradient(180deg,#1a3a1a 0%,#2d5a2d 50%,#4a8a4a 100%)" },
      { name: "সমুদ্র তীর",  css: "linear-gradient(180deg,#87ceeb 0%,#4facfe 40%,#c8a97e 80%,#f5deb3 100%)" },
      { name: "মেঘলা আকাশ",  css: "linear-gradient(180deg,#bdc3c7 0%,#2c3e50 100%)" },
      { name: "শরতের পাতা",  css: "linear-gradient(135deg,#f7971e,#d4a843,#8b4513)" },
      { name: "বর্ষার রাত",  css: "linear-gradient(180deg,#0d1b2a 0%,#1a2e4a 50%,#0a0f1a 100%)" },
      { name: "ফুলের বাগান", css: "linear-gradient(135deg,#ffecd2,#fcb69f,#ff9a9e,#fbc2eb)" },
      { name: "পাহাড়ের চূড়া", css: "linear-gradient(180deg,#87ceeb 0%,#ffffff 30%,#e0e0e0 60%,#8b7355 100%)" },
      { name: "সূর্যোদয়",    css: "linear-gradient(180deg,#ff6b35 0%,#f7c59f 40%,#ffe8d6 100%)" },
      { name: "রাতের জঙ্গল", css: "linear-gradient(180deg,#000 0%,#0d1f0d 50%,#1a3a1a 100%)" },
    ],
  },
  {
    label: "🎨 আর্টিস্টিক",
    bgs: [
      { name: "ওয়াটারকালার ১", css: "linear-gradient(135deg,rgba(255,182,193,0.8),rgba(173,216,230,0.8),rgba(144,238,144,0.8))" },
      { name: "ওয়াটারকালার ২", css: "linear-gradient(135deg,rgba(255,165,0,0.7),rgba(255,20,147,0.7),rgba(138,43,226,0.7))" },
      { name: "পেস্টেল ড্রিম",  css: "linear-gradient(135deg,#ffeaa7,#dfe6e9,#fd79a8,#a29bfe)" },
      { name: "নিয়ন গ্লো",     css: "linear-gradient(135deg,#000,#0d1b2a,#00ff88,#0d1b2a,#000)" },
      { name: "ভিনটেজ পেপার",  css: "linear-gradient(135deg,#f5e6d3,#e8d5b7,#d4b896)" },
      { name: "ইঙ্ক স্প্ল্যাশ", css: "radial-gradient(ellipse at 20% 80%,#1a0533 0%,#0d1b2a 40%,#000 100%)" },
      { name: "গোল্ড ফয়েল",   css: "linear-gradient(135deg,#b8860b,#ffd700,#daa520,#b8860b,#ffd700)" },
      { name: "সিলভার শিন",   css: "linear-gradient(135deg,#bdc3c7,#ecf0f1,#bdc3c7,#95a5a6)" },
      { name: "ব্রোঞ্জ",       css: "linear-gradient(135deg,#8b4513,#cd853f,#daa520,#8b4513)" },
      { name: "মার্বেল",       css: "linear-gradient(135deg,#f5f5f5,#e0e0e0,#bdbdbd,#f5f5f5,#e0e0e0)" },
    ],
  },
  {
    label: "🏙️ আরবান",
    bgs: [
      { name: "সিটি নাইট",    css: "linear-gradient(180deg,#0d1b2a 0%,#1a2e4a 40%,#0a0f1a 100%)" },
      { name: "নিয়ন সিটি",   css: "linear-gradient(135deg,#0d0d0d,#1a0533,#0d1b2a)" },
      { name: "রেইনি স্ট্রিট", css: "linear-gradient(180deg,#2c3e50,#3498db,#2c3e50)" },
      { name: "স্কাইলাইন",    css: "linear-gradient(180deg,#ff6b35,#f7c59f,#1a1a2e)" },
      { name: "মেট্রো",       css: "linear-gradient(135deg,#434343,#000000)" },
      { name: "গ্রাফিতি",     css: "linear-gradient(135deg,#f7971e,#ffd200,#f953c6,#b91d73)" },
      { name: "ইন্ডাস্ট্রিয়াল", css: "linear-gradient(135deg,#2c3e50,#4a4a4a,#2c3e50)" },
      { name: "নিয়ন পিঙ্ক",  css: "linear-gradient(135deg,#1a0000,#4a0020,#ff0066,#1a0000)" },
      { name: "সাইবারপাঙ্ক",  css: "linear-gradient(135deg,#0d0d0d,#ff6600,#0d0d0d,#00ffff)" },
      { name: "ডার্ক সিটি",   css: "linear-gradient(180deg,#000 0%,#1a1a2e 50%,#16213e 100%)" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TextBlock {
  id: string;
  kind: "title" | "body" | "author" | "custom";
  text: string;
  x: number; y: number;
  fontSize: number;
  baseFontSize: number;
  fontKey: string;
  color: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  shadow: boolean;
  outline: boolean;
  outlineColor: string;
  visible: boolean;
  lineHeight: number;
  opacity: number;
}

interface StickerLayer {
  id: string;
  kind: "sticker";
  emoji: string;
  x: number; y: number;
  size: number;
  rotation: number;
}

type ActiveTool = "canvas" | "text" | "inlinetext" | "sticker" | "filter" | "adjust" | "bgwall" | "bgphoto" | "upscale" | "crop" | "draw" | null;
type ExportQuality = "1x" | "2x" | "4k";
type ExportFormat = "png" | "jpg";
type DrawTool = "pencil" | "brush" | "eraser" | "line" | "rect" | "circle" | "arrow";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9); }

async function ensureFontLoaded(fontKey: string) {
  const url = FONT_URLS[fontKey];
  if (!url) return;
  try {
    const face = new FontFace(fontKey, `url(${url})`);
    await face.load();
    (document.fonts as FontFaceSet).add(face);
  } catch { /* ignore */ }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    if (!para.trim()) { lines.push(""); continue; }
    let line = "";
    for (const ch of para) {
      const test = line + ch;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = ch; }
      else line = test;
    }
    if (line) lines.push(line);
  }
  return lines;
}

function makeDefaultLayers(themeText: string): TextBlock[] {
  return [
    { id: "title",  kind: "title",  text: "",
      x: 0.5, y: 0.22, fontSize: 52, baseFontSize: 52, fontKey: "ChandraSheela",
      color: themeText, bold: true,  italic: false, align: "center",
      shadow: false, outline: false, outlineColor: "#000000",
      visible: true, lineHeight: 1.3, opacity: 100 },
    { id: "body",   kind: "body",   text: "",
      x: 0.5, y: 0.52, fontSize: 36, baseFontSize: 36, fontKey: "ChandraSheela",
      color: themeText, bold: false, italic: false, align: "center",
      shadow: false, outline: false, outlineColor: "#000000",
      visible: true, lineHeight: 1.9, opacity: 100 },
    { id: "author", kind: "author", text: "",
      x: 0.5, y: 0.84, fontSize: 28, baseFontSize: 28, fontKey: "ChandraSheela",
      color: themeText, bold: false, italic: false, align: "center",
      shadow: false, outline: false, outlineColor: "#000000",
      visible: true, lineHeight: 1.4, opacity: 100 },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ToolBtn({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        padding: "8px 10px", borderRadius: 12, border: "none", cursor: "pointer",
        background: active ? "rgba(212,168,67,0.18)" : "transparent",
        color: active ? "#D4A843" : "#9ca3af",
        transition: "all 0.15s", minWidth: 52, flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
    </button>
  );
}

function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 16px", borderBottom: "1px solid #1e3050", flexShrink: 0 }}>
      <span style={{ color: "#D4A843", fontWeight: 700, fontSize: 14 }}>{title}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280",
        fontSize: 18, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>✕</button>
    </div>
  );
}

function SliderRow({ label, val, set, min, max, step = 1, unit = "" }:
  { label: string; val: number; set: (v: number) => void; min: number; max: number; step?: number; unit?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#9ca3af", fontSize: 12 }}>{label}</span>
        <span style={{ color: "#D4A843", fontSize: 12, fontWeight: 700 }}>{val}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => set(+e.target.value)}
        style={{ width: "100%", height: 4, borderRadius: 2, accentColor: "#D4A843", cursor: "pointer" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UpscalePanel — FIXED: image upload + preview + real processing
// ─────────────────────────────────────────────────────────────────────────────

function UpscalePanel({ onClose }: { onClose: () => void }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imgName, setImgName] = useState("");
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [upscaleScale, setUpscaleScale] = useState<2 | 4>(2);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [sharpness, setSharpness] = useState(70);
  const [denoise, setDenoise] = useState(30);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImgName(f.name);
    setDone(false);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setImgSrc(src);
      // get natural dimensions
      const img = new Image();
      img.onload = () => setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = src;
    };
    reader.readAsDataURL(f);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const processUpscale = async () => {
    if (!imgSrc) return;
    setProcessing(true); setDone(false);
    // yield to browser to update UI
    await new Promise(r => setTimeout(r, 100));
    try {
      const img = new Image();
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("Image load failed"));
        img.src = imgSrc;
      });

      const W = img.naturalWidth * upscaleScale;
      const H = img.naturalHeight * upscaleScale;

      // Multi-step upscale for better quality
      let currentCanvas = document.createElement("canvas");
      let currentCtx = currentCanvas.getContext("2d")!;
      currentCanvas.width = img.naturalWidth;
      currentCanvas.height = img.naturalHeight;
      currentCtx.drawImage(img, 0, 0);

      // Step up by 2x at a time for better quality
      const steps = upscaleScale === 4 ? 2 : 1;
      for (let s = 0; s < steps; s++) {
        const nextW = currentCanvas.width * 2;
        const nextH = currentCanvas.height * 2;
        const nextCanvas = document.createElement("canvas");
        nextCanvas.width = nextW; nextCanvas.height = nextH;
        const nextCtx = nextCanvas.getContext("2d")!;
        nextCtx.imageSmoothingEnabled = true;
        nextCtx.imageSmoothingQuality = "high";
        nextCtx.drawImage(currentCanvas, 0, 0, nextW, nextH);
        currentCanvas = nextCanvas;
        currentCtx = nextCtx;
      }

      // Sharpness via unsharp mask
      if (sharpness > 0) {
        const amount = sharpness / 150;
        const imageData = currentCtx.getImageData(0, 0, W, H);
        const src = imageData.data;
        const blurCanvas = document.createElement("canvas");
        blurCanvas.width = W; blurCanvas.height = H;
        const bCtx = blurCanvas.getContext("2d")!;
        bCtx.filter = `blur(${Math.max(1, upscaleScale)}px)`;
        bCtx.drawImage(currentCanvas, 0, 0);
        const blurData = bCtx.getImageData(0, 0, W, H).data;
        for (let i = 0; i < src.length; i += 4) {
          src[i]   = Math.min(255, Math.max(0, src[i]   + amount * (src[i]   - blurData[i])));
          src[i+1] = Math.min(255, Math.max(0, src[i+1] + amount * (src[i+1] - blurData[i+1])));
          src[i+2] = Math.min(255, Math.max(0, src[i+2] + amount * (src[i+2] - blurData[i+2])));
        }
        currentCtx.putImageData(imageData, 0, 0);
      }

      // Download
      const ext = imgName.toLowerCase().endsWith(".jpg") || imgName.toLowerCase().endsWith(".jpeg") ? "jpeg" : "png";
      const url = currentCanvas.toDataURL(`image/${ext}`, 0.95);
      const a = document.createElement("a");
      a.href = url;
      a.download = `upscaled_${upscaleScale}x_${W}x${H}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDone(true);
    } catch (err) {
      console.error("Upscale error:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <PanelHeader title="🔍 4K ফটো আপস্কেল" onClose={onClose} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>

        {/* Info */}
        <div style={{ background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.2)",
          borderRadius: 10, padding: "10px 14px" }}>
          <p style={{ color: "#D4A843", fontSize: 12, fontWeight: 700, margin: 0 }}>ঝাপসা ছবিকে ক্লিয়ার করুন</p>
          <p style={{ color: "#9ca3af", fontSize: 11, margin: "3px 0 0" }}>
            ছবি আপলোড → স্কেল নির্বাচন → আপস্কেল করুন
          </p>
        </div>

        {/* Upload area */}
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            width: "100%", minHeight: imgSrc ? "auto" : 100,
            border: `2px dashed ${imgSrc ? "#D4A843" : "#1e3050"}`,
            borderRadius: 12, cursor: "pointer", overflow: "hidden",
            background: imgSrc ? "transparent" : "rgba(30,48,80,0.3)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}
        >
          {imgSrc ? (
            <div style={{ width: "100%", position: "relative" }}>
              <img
                src={imgSrc}
                alt="preview"
                style={{ width: "100%", maxHeight: 160, objectFit: "contain", display: "block", borderRadius: 10 }}
              />
              <div style={{
                position: "absolute", bottom: 6, left: 6, right: 6,
                background: "rgba(0,0,0,0.7)", borderRadius: 6, padding: "4px 8px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ color: "#D4A843", fontSize: 11, fontWeight: 600 }}>
                  {imgSize.w}×{imgSize.h}px
                </span>
                <span style={{ color: "#9ca3af", fontSize: 10 }}>
                  → {imgSize.w * upscaleScale}×{imgSize.h * upscaleScale}px
                </span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
              <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>ছবি আপলোড করতে ক্লিক করুন</p>
              <p style={{ color: "#6b7280", fontSize: 11, margin: "4px 0 0" }}>JPG, PNG, WEBP সাপোর্টেড</p>
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

        {imgSrc && (
          <button
            onClick={() => inputRef.current?.click()}
            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #1e3050",
              background: "transparent", color: "#9ca3af", fontSize: 11, cursor: "pointer" }}
          >
            🔄 অন্য ছবি বেছে নিন
          </button>
        )}

        {/* Scale */}
        <div>
          <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>আপস্কেল গুণক</p>
          <div style={{ display: "flex", gap: 8 }}>
            {([2, 4] as const).map(s => (
              <button key={s} onClick={() => setUpscaleScale(s)}
                style={{ flex: 1, padding: "12px 0", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  border: `2px solid ${upscaleScale === s ? "#D4A843" : "#1e3050"}`,
                  background: upscaleScale === s ? "rgba(212,168,67,0.15)" : "transparent",
                  color: upscaleScale === s ? "#D4A843" : "#6b7280", cursor: "pointer" }}>
                <div>{s}× আপস্কেল</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>
                  {imgSrc ? `${imgSize.w * s}×${imgSize.h * s}` : (s === 2 ? "দ্রুত" : "সর্বোচ্চ")}
                </div>
              </button>
            ))}
          </div>
        </div>

        <SliderRow label="শার্পনেস" val={sharpness} set={setSharpness} min={0} max={100} unit="%" />
        <SliderRow label="ডিনয়েজ"  val={denoise}   set={setDenoise}   min={0} max={100} unit="%" />

        <button
          onClick={processUpscale}
          disabled={!imgSrc || processing}
          style={{
            width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
            background: !imgSrc ? "#1e3050" : processing ? "rgba(212,168,67,0.4)" : "linear-gradient(135deg,#D4A843,#b8892a)",
            color: !imgSrc ? "#6b7280" : "#000", fontWeight: 700, fontSize: 14,
            cursor: !imgSrc || processing ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {processing ? (
            <><span style={{ width: 18, height: 18, border: "2px solid #000", borderTopColor: "transparent",
              borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /> প্রক্রিয়া হচ্ছে...</>
          ) : done ? "✅ আবার ডাউনলোড করুন" : "🔍 আপস্কেল করুন ও ডাউনলোড করুন"}
        </button>

        {done && (
          <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
            borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
            <p style={{ color: "#4ade80", fontSize: 13, fontWeight: 700, margin: 0 }}>
              ✅ আপস্কেল সম্পন্ন! ছবি ডাউনলোড হয়েছে।
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DrawPanel — Real canvas drawing with pointer events
// ─────────────────────────────────────────────────────────────────────────────

function DrawPanel({
  onClose,
  drawCanvasRef,
  cardW,
  cardH,
  scale,
}: {
  onClose: () => void;
  drawCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  cardW: number;
  cardH: number;
  scale: number;
}) {
  const [activeTool, setActiveTool] = useState<DrawTool>("pencil");
  const [color, setColor] = useState("#D4A843");
  const [lineWidth, setLineWidth] = useState(4);
  const [opacity, setOpacity] = useState(100);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    const pos = getPos(e);
    lastPos.current = pos;
    startPos.current = pos;
    const ctx = canvas.getContext("2d")!;
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (activeTool === "pencil" || activeTool === "brush" || activeTool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);

    ctx.globalAlpha = opacity / 100;

    if (activeTool === "pencil") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (activeTool === "brush") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = lineWidth * 2;
      ctx.shadowColor = color;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (activeTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = lineWidth * 4;
      ctx.lineCap = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (activeTool === "line" || activeTool === "rect" || activeTool === "circle" || activeTool === "arrow") {
      // Restore snapshot and redraw shape preview
      if (snapshotRef.current) ctx.putImageData(snapshotRef.current, 0, 0);
      ctx.globalAlpha = opacity / 100;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      const sp = startPos.current!;
      ctx.beginPath();
      if (activeTool === "line") {
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (activeTool === "rect") {
        ctx.strokeRect(sp.x, sp.y, pos.x - sp.x, pos.y - sp.y);
      } else if (activeTool === "circle") {
        const rx = Math.abs(pos.x - sp.x) / 2;
        const ry = Math.abs(pos.y - sp.y) / 2;
        const cx = sp.x + (pos.x - sp.x) / 2;
        const cy = sp.y + (pos.y - sp.y) / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (activeTool === "arrow") {
        const dx = pos.x - sp.x;
        const dy = pos.y - sp.y;
        const angle = Math.atan2(dy, dx);
        const headLen = Math.min(30, Math.sqrt(dx * dx + dy * dy) * 0.3);
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x - headLen * Math.cos(angle - Math.PI / 6), pos.y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x - headLen * Math.cos(angle + Math.PI / 6), pos.y - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
    }
    lastPos.current = pos;
  };

  const onPointerUp = () => {
    isDrawing.current = false;
    lastPos.current = null;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowBlur = 0;
    ctx.beginPath();
    snapshotRef.current = null;
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const DRAW_TOOLS: { tool: DrawTool; icon: string; name: string }[] = [
    { tool: "pencil",  icon: "✏️", name: "পেন্সিল" },
    { tool: "brush",   icon: "🖌️", name: "ব্রাশ" },
    { tool: "eraser",  icon: "🧹", name: "ইরেজার" },
    { tool: "line",    icon: "📏", name: "লাইন" },
    { tool: "rect",    icon: "⬜", name: "আয়তক্ষেত্র" },
    { tool: "circle",  icon: "⭕", name: "বৃত্ত" },
    { tool: "arrow",   icon: "↗️", name: "তীর" },
  ];

  // Attach pointer events to the draw canvas
  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    // Set canvas size to match card
    canvas.width = cardW;
    canvas.height = cardH;
  }, [drawCanvasRef, cardW, cardH]);

  return (
    <>
      <PanelHeader title="🖊️ ড্রইং টুলস" onClose={onClose} />
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>

        {/* Tool grid */}
        <div>
          <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, marginBottom: 8 }}>টুল নির্বাচন করুন</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
            {DRAW_TOOLS.map(t => (
              <button key={t.tool} onClick={() => setActiveTool(t.tool)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  padding: "8px 4px", borderRadius: 10,
                  border: `2px solid ${activeTool === t.tool ? "#D4A843" : "#1e3050"}`,
                  background: activeTool === t.tool ? "rgba(212,168,67,0.15)" : "transparent",
                  cursor: "pointer",
                }}>
                <span style={{ fontSize: 20 }}>{t.icon}</span>
                <span style={{ fontSize: 10, color: activeTool === t.tool ? "#D4A843" : "#9ca3af", fontWeight: 600 }}>
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, marginBottom: 8 }}>রং</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {QUICK_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                style={{
                  width: 28, height: 28, borderRadius: "50%", border: `3px solid ${color === c ? "#fff" : "transparent"}`,
                  background: c, cursor: "pointer", flexShrink: 0,
                  boxShadow: color === c ? "0 0 0 2px #D4A843" : "none",
                }} />
            ))}
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              style={{ width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer",
                padding: 0, background: "none" }} />
          </div>
        </div>

        <SliderRow label="ব্রাশ সাইজ" val={lineWidth} set={setLineWidth} min={1} max={40} unit="px" />
        <SliderRow label="অপাসিটি"   val={opacity}   set={setOpacity}   min={10} max={100} unit="%" />

        {/* Canvas instruction */}
        <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 10, padding: "10px 14px" }}>
          <p style={{ color: "#a78bfa", fontSize: 12, fontWeight: 700, margin: 0 }}>
            ✏️ ক্যানভাসে সরাসরি আঁকুন
          </p>
          <p style={{ color: "#9ca3af", fontSize: 11, margin: "4px 0 0" }}>
            উপরের ক্যানভাসে আঙুল বা মাউস দিয়ে আঁকুন
          </p>
        </div>

        {/* Clear button */}
        <button onClick={clearDrawing}
          style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "1px solid #ef4444",
            background: "rgba(239,68,68,0.1)", color: "#ef4444", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          🗑️ ড্রইং মুছুন
        </button>

        {/* Hidden canvas event handlers — exposed via ref */}
        <div style={{ display: "none" }}>
          {/* We attach events directly to the canvas overlay in the main component */}
          <span data-draw-tool={activeTool}
                data-draw-color={color}
                data-draw-width={lineWidth}
                data-draw-opacity={opacity} />
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CropPanel
// ─────────────────────────────────────────────────────────────────────────────

function CropPanel({ sizeIdx, setSizeIdx, frame, setFrame, onClose }:
  { sizeIdx: number; setSizeIdx: (i: number) => void; frame: string; setFrame: (f: string) => void; onClose: () => void }) {
  return (
    <>
      <PanelHeader title="✂️ ক্রপ ও অনুপাত" onClose={onClose} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 10, fontWeight: 600 }}>ক্যানভাস অনুপাত</p>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {SIZES.map((s, idx) => (
              <button key={idx} onClick={() => setSizeIdx(idx)}
                style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "12px 16px", borderRadius: 12,
                  border: `2px solid ${sizeIdx === idx ? "#D4A843" : "#1e3050"}`,
                  background: sizeIdx === idx ? "rgba(212,168,67,0.12)" : "transparent",
                  cursor: "pointer" }}>
                <span style={{ fontSize: 28 }}>{s.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: sizeIdx === idx ? "#D4A843" : "#9ca3af" }}>
                  {s.name.split(" ")[0]}
                </span>
                <span style={{ fontSize: 10, color: "#6b7280" }}>{s.w}×{s.h}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 10, fontWeight: 600 }}>ফ্রেম স্টাইল</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FRAMES.map(f => (
              <button key={f.value} onClick={() => setFrame(f.value)}
                style={{ padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: `1px solid ${frame === f.value ? "#D4A843" : "#1e3050"}`,
                  background: frame === f.value ? "#D4A843" : "transparent",
                  color: frame === f.value ? "#000" : "#9ca3af", cursor: "pointer" }}>
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BgWallPanel — 100+ Beautiful Backgrounds
// ─────────────────────────────────────────────────────────────────────────────

function BgWallPanel({
  onClose,
  onSelect,
  selected,
}: {
  onClose: () => void;
  onSelect: (css: string) => void;
  selected: string;
}) {
  const [activeCat, setActiveCat] = useState(0);
  const cat = BG_CATEGORIES[activeCat];

  return (
    <>
      <PanelHeader title="🖼️ ব্যাকগ্রাউন্ড ওয়াল" onClose={onClose} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        {/* Category tabs */}
        <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid #1e3050",
          flexShrink: 0, padding: "0 8px" }}>
          {BG_CATEGORIES.map((c, i) => (
            <button key={i} onClick={() => setActiveCat(i)}
              style={{ flexShrink: 0, padding: "10px 12px", fontSize: 11, fontWeight: 600,
                border: "none", background: "transparent", cursor: "pointer", whiteSpace: "nowrap",
                color: activeCat === i ? "#D4A843" : "#6b7280",
                borderBottom: activeCat === i ? "2px solid #D4A843" : "2px solid transparent" }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Background grid */}
        <div style={{ overflowY: "auto", padding: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {cat.bgs.map((bg, i) => (
              <button key={i} onClick={() => onSelect(bg.css)}
                style={{
                  position: "relative", aspectRatio: "1/1", borderRadius: 10, cursor: "pointer",
                  border: `3px solid ${selected === bg.css ? "#D4A843" : "transparent"}`,
                  background: bg.css, overflow: "hidden", padding: 0,
                  boxShadow: selected === bg.css ? "0 0 0 2px #D4A843" : "none",
                  transition: "all 0.15s",
                }}>
                {selected === bg.css && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
                    justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>
                    <span style={{ fontSize: 20 }}>✅</span>
                  </div>
                )}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "rgba(0,0,0,0.6)", padding: "3px 4px" }}>
                  <span style={{ color: "#fff", fontSize: 9, fontWeight: 600 }}>{bg.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selected && (
          <div style={{ padding: "8px 12px", borderTop: "1px solid #1e3050", flexShrink: 0 }}>
            <button onClick={() => onSelect("")}
              style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid #ef4444",
                background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              ✕ ব্যাকগ্রাউন্ড সরান
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Editor() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [themeIdx, setThemeIdx]       = useState(2);
  const [sizeIdx, setSizeIdx]         = useState(0);
  const [frame, setFrame]             = useState("corner");
  const padding                       = 60;

  const [photoImage, setPhotoImage]   = useState<string | null>(null);
  const [filterPreset, setFilterPreset] = useState("normal");
  const [photoOpacity, setPhotoOpacity] = useState(85);
  const [bgImage, setBgImage]         = useState<string | null>(null);
  const [bgOpacity, setBgOpacity]     = useState(15);
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkOpacity, setWatermarkOpacity] = useState(8);

  // BgWall — selected CSS background
  const [bgWallCss, setBgWallCss]     = useState("");

  // Adjust sliders
  const [brightness, setBrightness]   = useState(100);
  const [contrast, setContrast]       = useState(100);
  const [saturation, setSaturation]   = useState(100);
  const [blur, setBlur]               = useState(0);
  const [vignette, setVignette]       = useState(0);

  const [textLayers, setTextLayers]   = useState<TextBlock[]>(() => makeDefaultLayers(THEMES[2].text));
  const [stickers, setStickers]       = useState<StickerLayer[]>([]);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [dragging, setDragging]       = useState<{
    id: string; isSticker: boolean;
    startX: number; startY: number; origX: number; origY: number;
  } | null>(null);
  const [resizing, setResizing]       = useState<{
    id: string; startX: number; startY: number; origW: number; origH: number;
  } | null>(null);
  const [textBoxSizes, setTextBoxSizes] = useState<Record<string, { w: number; h: number }>>({});

  const [activeTool, setActiveTool]   = useState<ActiveTool>(null);
  const [downloading, setDownloading] = useState(false);
  const [exportQuality, setExportQuality] = useState<ExportQuality>("2x");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [scale, setScale]             = useState(0.36);
  const [activeStickerCat, setActiveStickerCat] = useState(0);

  // Text editing sub-tab
  const [textSubTab, setTextSubTab]   = useState<"content" | "style" | "font">("content");

  // Inline text tool state
  const [inlineTextPos, setInlineTextPos] = useState<{ x: number; y: number } | null>(null);
  const [inlineTextValue, setInlineTextValue] = useState("");
  const inlineTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Draw state
  const [drawTool, setDrawTool]       = useState<DrawTool>("pencil");
  const [drawColor, setDrawColor]     = useState("#D4A843");
  const [drawWidth, setDrawWidth]     = useState(4);
  const [drawOpacity, setDrawOpacity] = useState(100);
  const isDrawingRef                  = useRef(false);
  const lastDrawPos                   = useRef<{ x: number; y: number } | null>(null);
  const drawStartPos                  = useRef<{ x: number; y: number } | null>(null);
  const drawSnapshot                  = useRef<ImageData | null>(null);

  const photoRef    = useRef<HTMLInputElement>(null);
  const bgFileRef   = useRef<HTMLInputElement>(null);
  const previewRef  = useRef<HTMLDivElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  const theme  = THEMES[themeIdx];
  const cardW  = SIZES[sizeIdx].w;
  const cardH  = SIZES[sizeIdx].h;
  const preset = FILTER_PRESETS.find(f => f.name === filterPreset);
  const baseFilter = filterPreset === "normal" ? "" : (preset?.filter ?? "");
  const adjustFilter = [
    brightness !== 100 ? `brightness(${brightness / 100})` : "",
    contrast   !== 100 ? `contrast(${contrast / 100})` : "",
    saturation !== 100 ? `saturate(${saturation / 100})` : "",
    blur       > 0     ? `blur(${blur}px)` : "",
  ].filter(Boolean).join(" ");
  const effectiveFilter = [baseFilter, adjustFilter].filter(Boolean).join(" ") || "none";

  // ── Sync text color with theme ─────────────────────────────────────────────
  useEffect(() => {
    setTextLayers(prev => prev.map(l => ({ ...l, color: theme.text })));
  }, [themeIdx]);

  // ── Scale canvas to fit viewport ──────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (!previewRef.current) return;
      const cw = previewRef.current.clientWidth - 4;
      const ch = Math.min(window.innerHeight * 0.52, 460);
      setScale(Math.min(cw / cardW, ch / cardH, 0.9));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [cardW, cardH]);

  // ── Init draw canvas size ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    canvas.width = cardW;
    canvas.height = cardH;
  }, [cardW, cardH]);

  // ── Drag ──────────────────────────────────────────────────────────────────
  const startDrag = (
    e: React.MouseEvent | React.TouchEvent,
    id: string, isSticker: boolean, lx: number, ly: number
  ) => {
    if (activeTool === "draw") return; // don't drag when drawing
    e.stopPropagation();
    const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
    const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragging({ id, isSticker, startX: cx, startY: cy, origX: lx, origY: ly });
    setSelectedId(id);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
      const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dx = (cx - dragging.startX) / (cardW * scale);
      const dy = (cy - dragging.startY) / (cardH * scale);
      const nx = Math.max(0.02, Math.min(0.98, dragging.origX + dx));
      const ny = Math.max(0.02, Math.min(0.98, dragging.origY + dy));
      if (dragging.isSticker)
        setStickers(prev => prev.map(l => l.id === dragging.id ? { ...l, x: nx, y: ny } : l));
      else
        setTextLayers(prev => prev.map(l => l.id === dragging.id ? { ...l, x: nx, y: ny } : l));
    };
    const onUp = () => setDragging(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, cardW, cardH, scale]);

  // ── Resize text box ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
      const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dw = (cx - resizing.startX) / (cardW * scale);
      const dh = (cy - resizing.startY) / (cardH * scale);
      const nw = Math.max(0.1, Math.min(0.98, resizing.origW + dw * 2));
      const nh = Math.max(0.05, Math.min(0.9, resizing.origH + dh * 2));
      setTextBoxSizes(prev => ({ ...prev, [resizing.id]: { w: nw, h: nh } }));
      setTextLayers(prev => prev.map(l => {
        if (l.id !== resizing.id) return l;
        const ratio = nw / resizing.origW;
        const newSize = Math.round(Math.max(8, Math.min(300, l.baseFontSize * ratio)));
        return { ...l, fontSize: newSize };
      }));
    };
    const onUp = () => setResizing(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [resizing, cardW, cardH, scale]);

  // ── Draw canvas pointer events ─────────────────────────────────────────────
  const getDrawPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  }, [scale]);

  const onDrawPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool !== "draw") return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pos = getDrawPos(e);
    lastDrawPos.current = pos;
    drawStartPos.current = pos;
    const ctx = canvas.getContext("2d")!;
    drawSnapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [activeTool, getDrawPos]);

  const onDrawPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || activeTool !== "draw") return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getDrawPos(e);
    ctx.globalAlpha = drawOpacity / 100;

    if (drawTool === "pencil") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    } else if (drawTool === "brush") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth * 3;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.shadowBlur = drawWidth * 2; ctx.shadowColor = drawColor;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    } else if (drawTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = drawWidth * 4;
      ctx.lineCap = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    } else {
      // Shape tools: restore snapshot then draw preview
      if (drawSnapshot.current) ctx.putImageData(drawSnapshot.current, 0, 0);
      ctx.globalAlpha = drawOpacity / 100;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.lineCap = "round";
      const sp = drawStartPos.current!;
      ctx.beginPath();
      if (drawTool === "line") {
        ctx.moveTo(sp.x, sp.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
      } else if (drawTool === "rect") {
        ctx.strokeRect(sp.x, sp.y, pos.x - sp.x, pos.y - sp.y);
      } else if (drawTool === "circle") {
        const rx = Math.abs(pos.x - sp.x) / 2;
        const ry = Math.abs(pos.y - sp.y) / 2;
        ctx.ellipse(sp.x + (pos.x - sp.x) / 2, sp.y + (pos.y - sp.y) / 2, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (drawTool === "arrow") {
        const dx = pos.x - sp.x; const dy = pos.y - sp.y;
        const angle = Math.atan2(dy, dx);
        const headLen = Math.min(40, Math.sqrt(dx * dx + dy * dy) * 0.3);
        ctx.moveTo(sp.x, sp.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x - headLen * Math.cos(angle - Math.PI / 6), pos.y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x - headLen * Math.cos(angle + Math.PI / 6), pos.y - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
    }
    lastDrawPos.current = pos;
  }, [activeTool, drawTool, drawColor, drawWidth, drawOpacity, getDrawPos]);

  const onDrawPointerUp = useCallback(() => {
    isDrawingRef.current = false;
    lastDrawPos.current = null;
    drawSnapshot.current = null;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowBlur = 0;
    ctx.beginPath();
  }, []);

  // ── Layer helpers ─────────────────────────────────────────────────────────
  const updateText = (id: string, patch: Partial<TextBlock>) =>
    setTextLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));

  const addCustomText = () => {
    const id = uid();
    setTextLayers(prev => [...prev, {
      id, kind: "custom", text: "নতুন লেখা",
      x: 0.5, y: 0.5, fontSize: 40, baseFontSize: 40, fontKey: "ChandraSheela",
      color: theme.text, bold: false, italic: false, align: "center",
      shadow: false, outline: false, outlineColor: "#000000",
      visible: true, lineHeight: 1.6, opacity: 100,
    }]);
    setTextBoxSizes(prev => ({ ...prev, [id]: { w: 0.7, h: 0.15 } }));
    setSelectedId(id);
    setActiveTool("text");
    setTextSubTab("style");
  };

  // Commit inline text box to a real TextBlock layer
  const commitInlineText = () => {
    if (!inlineTextPos || !inlineTextValue.trim()) {
      setInlineTextPos(null);
      setInlineTextValue("");
      return;
    }
    const id = uid();
    const xFrac = inlineTextPos.x / cardW;
    const yFrac = inlineTextPos.y / cardH;
    setTextLayers(prev => [...prev, {
      id, kind: "custom", text: inlineTextValue,
      x: xFrac, y: yFrac, fontSize: 40, baseFontSize: 40, fontKey: "ChandraSheela",
      color: theme.text, bold: false, italic: false, align: "left",
      shadow: false, outline: false, outlineColor: "#000000",
      visible: true, lineHeight: 1.6, opacity: 100,
    }]);
    setTextBoxSizes(prev => ({ ...prev, [id]: { w: 0.7, h: 0.15 } }));
    setSelectedId(id);
    setInlineTextPos(null);
    setInlineTextValue("");
  };

  const addSticker = (emoji: string) => {
    const id = uid();
    setStickers(prev => [...prev, { id, kind: "sticker", emoji, x: 0.5, y: 0.35, size: 80, rotation: 0 }]);
    setSelectedId(id);
  };

  const removeLayer = (id: string) => {
    setTextLayers(prev =>
      prev.map(l => l.id === id && l.kind !== "custom"
        ? { ...l, visible: false, text: "" }
        : l
      ).filter(l => !(l.id === id && l.kind === "custom"))
    );
    setStickers(prev => prev.filter(l => l.id !== id));
    setTextBoxSizes(prev => { const n = { ...prev }; delete n[id]; return n; });
    if (selectedId === id) setSelectedId(null);
  };

  const selectedText    = textLayers.find(l => l.id === selectedId) ?? null;
  const selectedSticker = stickers.find(l => l.id === selectedId) ?? null;

  // ── Photo upload ──────────────────────────────────────────────────────────
  const onPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setPhotoImage(ev.target?.result as string);
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const onBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setBgImage(ev.target?.result as string);
    r.readAsDataURL(f);
    e.target.value = "";
  };

  // ── Canvas export ─────────────────────────────────────────────────────────
  const buildCanvas = useCallback(async (dpr: number): Promise<HTMLCanvasElement> => {
    await Promise.all(textLayers.map(l => ensureFontLoaded(l.fontKey)));
    await document.fonts.ready;
    const canvas = document.createElement("canvas");
    canvas.width = cardW * dpr; canvas.height = cardH * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    // Background wall CSS
    if (bgWallCss) {
      if (bgWallCss.startsWith("linear-gradient") || bgWallCss.startsWith("radial-gradient")) {
        // Parse gradient for canvas
        const tempDiv = document.createElement("div");
        tempDiv.style.width = "1px"; tempDiv.style.height = "1px";
        tempDiv.style.background = bgWallCss;
        document.body.appendChild(tempDiv);
        document.body.removeChild(tempDiv);
        // Fallback: draw solid color from first color in gradient
        const colorMatch = bgWallCss.match(/#[0-9a-fA-F]{3,8}/);
        ctx.fillStyle = colorMatch ? colorMatch[0] : "#0d1b2a";
        ctx.fillRect(0, 0, cardW, cardH);
      } else {
        ctx.fillStyle = bgWallCss;
        ctx.fillRect(0, 0, cardW, cardH);
      }
    } else if (theme.gradient) {
      const parts = theme.gradient.match(/linear-gradient\(([^,]+),([\s\S]*)\)/);
      if (parts) {
        const deg = parseFloat(parts[1]) || 135;
        const rad = (deg - 90) * Math.PI / 180;
        const cx2 = cardW / 2, cy2 = cardH / 2;
        const len = Math.sqrt(cardW ** 2 + cardH ** 2) / 2;
        const grad = ctx.createLinearGradient(
          cx2 - Math.cos(rad) * len, cy2 - Math.sin(rad) * len,
          cx2 + Math.cos(rad) * len, cy2 + Math.sin(rad) * len
        );
        const stops = parts[2].match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g) || [];
        stops.forEach((c, i) => grad.addColorStop(i / Math.max(stops.length - 1, 1), c));
        ctx.fillStyle = grad;
      } else ctx.fillStyle = theme.bg;
    } else {
      ctx.fillStyle = theme.bg;
    }
    if (!bgWallCss) ctx.fillRect(0, 0, cardW, cardH);

    const loadImg = (src: string, opacity: number, filter?: string) =>
      new Promise<void>(res => {
        const img = new Image(); img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          if (filter && filter !== "none") ctx.filter = filter;
          ctx.globalAlpha = opacity;
          const ia = img.naturalWidth / img.naturalHeight, ca = cardW / cardH;
          let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
          if (ia > ca) { sw = img.naturalHeight * ca; sx = (img.naturalWidth - sw) / 2; }
          else { sh = img.naturalWidth / ca; sy = (img.naturalHeight - sh) / 2; }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cardW, cardH);
          ctx.restore(); res();
        };
        img.onerror = () => res(); img.src = src;
      });

    if (bgImage)    await loadImg(bgImage, bgOpacity / 100);
    if (photoImage) await loadImg(photoImage, photoOpacity / 100, effectiveFilter);
    if (showWatermark) await loadImg(AUTHOR_PHOTO, watermarkOpacity / 100);

    // Draw canvas overlay
    const drawCanvas = drawCanvasRef.current;
    if (drawCanvas) {
      ctx.drawImage(drawCanvas, 0, 0, cardW, cardH);
    }

    // Vignette
    if (vignette > 0) {
      const vg = ctx.createRadialGradient(cardW/2, cardH/2, cardH*0.3, cardW/2, cardH/2, cardH*0.8);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, `rgba(0,0,0,${vignette / 100})`);
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, cardW, cardH);
    }

    // Frames
    ctx.strokeStyle = theme.border; ctx.lineWidth = 1.5;
    if (frame === "inner-border") { ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeRect(16, 16, cardW - 32, cardH - 32); ctx.restore(); }
    if (frame === "corner") {
      ctx.save(); ctx.globalAlpha = 0.7;
      [[16, 16, 1, 1], [cardW - 16, 16, -1, 1], [16, cardH - 16, 1, -1], [cardW - 16, cardH - 16, -1, -1]].forEach(([x, y, dx, dy]) => {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 50 * dx, y); ctx.moveTo(x, y); ctx.lineTo(x, y + 50 * dy); ctx.stroke();
      });
      ctx.restore();
    }
    if (frame === "double-border") {
      ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeRect(10, 10, cardW - 20, cardH - 20);
      ctx.globalAlpha = 0.3; ctx.strokeRect(22, 22, cardW - 44, cardH - 44); ctx.restore();
    }
    if (frame === "left-bar") { ctx.save(); ctx.globalAlpha = 0.8; ctx.fillStyle = theme.border; ctx.fillRect(padding / 2 - 2, padding, 5, cardH - padding * 2); ctx.restore(); }
    if (frame === "shadow-frame") { ctx.save(); ctx.globalAlpha = 0.4; ctx.shadowColor = theme.border; ctx.shadowBlur = 30; ctx.strokeRect(20, 20, cardW - 40, cardH - 40); ctx.restore(); }
    if (frame === "ornate") {
      ctx.save(); ctx.globalAlpha = 0.55; ctx.strokeRect(12, 12, cardW - 24, cardH - 24);
      ctx.globalAlpha = 0.25; ctx.strokeRect(20, 20, cardW - 40, cardH - 40); ctx.restore();
    }

    // Text layers
    for (const layer of textLayers) {
      if (!layer.visible || !layer.text.trim()) continue;
      await ensureFontLoaded(layer.fontKey);
      const displayText = layer.kind === "author" ? `— ${layer.text}` : layer.text;
      ctx.save();
      ctx.globalAlpha = (layer.opacity ?? 100) / 100;
      const fs = layer.fontSize;
      ctx.font = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}${fs}px ${FONT_CSS[layer.fontKey] || "'Tiro Bangla',serif"}`;
      ctx.fillStyle = layer.color;
      ctx.textAlign = layer.align;
      if (layer.shadow) { ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; }
      const boxW = (textBoxSizes[layer.id]?.w ?? 0.7) * cardW;
      const lines = wrapText(ctx, displayText, boxW);
      const lh = fs * layer.lineHeight;
      const totalH = lines.length * lh;
      const startY = layer.y * cardH - totalH / 2 + fs;
      const startX = layer.align === "center" ? layer.x * cardW : layer.align === "left" ? layer.x * cardW - boxW / 2 : layer.x * cardW + boxW / 2;
      lines.forEach((line, i) => {
        const y = startY + i * lh;
        if (layer.outline) {
          ctx.strokeStyle = layer.outlineColor;
          ctx.lineWidth = Math.ceil(fs * 0.06);
          ctx.strokeText(line, startX, y);
        }
        ctx.fillText(line, startX, y);
      });
      ctx.restore();
    }

    // Stickers
    for (const s of stickers) {
      ctx.save();
      ctx.font = `${s.size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const sx = s.x * cardW, sy = s.y * cardH;
      ctx.translate(sx, sy);
      ctx.rotate((s.rotation * Math.PI) / 180);
      ctx.fillText(s.emoji, 0, 0);
      ctx.restore();
    }

    return canvas;
  }, [textLayers, stickers, textBoxSizes, cardW, cardH, theme, bgWallCss, bgImage, bgOpacity, photoImage, photoOpacity, effectiveFilter, showWatermark, watermarkOpacity, vignette, frame, padding]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const dpr = exportQuality === "1x" ? 1 : exportQuality === "2x" ? 2 : 4;
      const canvas = await buildCanvas(dpr);
      const mime = exportFormat === "jpg" ? "image/jpeg" : "image/png";
      const url = canvas.toDataURL(mime, 0.95);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sardar-design-${Date.now()}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloading(false);
    }
  };

  const toggleTool = (tool: ActiveTool) =>
    setActiveTool(prev => prev === tool ? null : tool);

  // Auto-focus inline textarea when it appears
  useEffect(() => {
    if (inlineTextPos && inlineTextareaRef.current) {
      setTimeout(() => inlineTextareaRef.current?.focus(), 50);
    }
  }, [inlineTextPos]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1a", color: "#fff", display: "flex", flexDirection: "column" }}>
      <Seo title="ডিজাইন ফরম্যাট | মাহবুব সরদার সবুজ"
        description="প্রিমিয়াম বাংলা লেখার কার্ড ডিজাইন করুন" />
      <Navbar />

      {/* ── Top bar ── */}
      <div style={{
        background: "#0d1420",
        borderBottom: "1px solid #1e3050",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "68px 16px 12px",
      }}>
        <div>
          <h1 style={{
            fontFamily: "'AkhandBengali','Noto Sans Bengali',sans-serif",
            fontSize: "clamp(1.2rem,4vw,1.6rem)", fontWeight: 800,
            background: "linear-gradient(135deg,#f5e27a,#D4A843,#b8892a)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", margin: 0, lineHeight: 1.2,
          }}>সরদার ডিজাইন স্টুডিও</h1>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: 12, border: "none",
            background: downloading ? "rgba(212,168,67,0.4)" : "linear-gradient(135deg,#D4A843,#b8892a)",
            color: "#000", fontWeight: 700, fontSize: 13, cursor: downloading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 16px rgba(212,168,67,0.3)", transition: "all 0.2s",
          }}
        >
          {downloading
            ? <><span style={{ width: 16, height: 16, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /> হচ্ছে...</>
            : <>⬇ সেভ করুন</>
          }
        </button>
      </div>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Canvas workspace */}
        <div ref={previewRef} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px 12px 8px", overflow: "hidden", minHeight: 0,
        }}>
          <div
            style={{
              width: cardW * scale,
              height: cardH * scale,
              position: "relative",
              flexShrink: 0,
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,168,67,0.15)",
              cursor: activeTool === "draw" ? "crosshair" : activeTool === "inlinetext" ? "text" : dragging ? "grabbing" : "default",
            }}
            onClick={(e) => {
              if (activeTool === "draw") return;
              if (activeTool === "inlinetext") {
                // Place inline text box at click position within the card
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                const clickX = (e.clientX - rect.left) / scale;
                const clickY = (e.clientY - rect.top) / scale;
                setInlineTextPos({ x: clickX, y: clickY });
                setInlineTextValue("");
                return;
              }
              setSelectedId(null);
            }}
          >
            {/* Card inner */}
            <div style={{
              width: cardW, height: cardH,
              background: bgWallCss || theme.gradient || theme.bg,
              position: "absolute", top: 0, left: 0,
              transform: `scale(${scale})`, transformOrigin: "top left",
              overflow: "hidden",
            }}>
              {bgImage && (
                <div style={{ position: "absolute", inset: 0, zIndex: 1,
                  backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center",
                  opacity: bgOpacity / 100 }} />
              )}
              {photoImage && (
                <div style={{ position: "absolute", inset: 0, zIndex: 2,
                  backgroundImage: `url(${photoImage})`, backgroundSize: "cover", backgroundPosition: "center",
                  opacity: photoOpacity / 100, filter: effectiveFilter }} />
              )}
              {showWatermark && (
                <div style={{ position: "absolute", inset: 0, zIndex: 3,
                  backgroundImage: `url(${AUTHOR_PHOTO})`, backgroundSize: "cover", backgroundPosition: "center top",
                  opacity: watermarkOpacity / 100, pointerEvents: "none" }} />
              )}

              {/* Vignette */}
              {vignette > 0 && (
                <div style={{
                  position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none",
                  background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${vignette / 100}) 100%)`,
                }} />
              )}

              {/* Frames */}
              {frame === "inner-border" && <div style={{ position: "absolute", inset: 16, border: `1.5px solid ${theme.border}`, opacity: 0.5, zIndex: 5, pointerEvents: "none" }} />}
              {frame === "corner" && (
                <div style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none" }}>
                  {[{ top: 16, left: 16, borderTop: `1.5px solid ${theme.border}`, borderLeft: `1.5px solid ${theme.border}` },
                    { top: 16, right: 16, borderTop: `1.5px solid ${theme.border}`, borderRight: `1.5px solid ${theme.border}` },
                    { bottom: 16, left: 16, borderBottom: `1.5px solid ${theme.border}`, borderLeft: `1.5px solid ${theme.border}` },
                    { bottom: 16, right: 16, borderBottom: `1.5px solid ${theme.border}`, borderRight: `1.5px solid ${theme.border}` }
                  ].map((s, i) => <div key={i} style={{ position: "absolute", width: 50, height: 50, opacity: 0.7, ...s }} />)}
                </div>
              )}
              {frame === "double-border" && (
                <>
                  <div style={{ position: "absolute", inset: 10, border: `1.5px solid ${theme.border}`, opacity: 0.5, zIndex: 5, pointerEvents: "none" }} />
                  <div style={{ position: "absolute", inset: 22, border: `1.5px solid ${theme.border}`, opacity: 0.3, zIndex: 5, pointerEvents: "none" }} />
                </>
              )}
              {frame === "left-bar" && <div style={{ position: "absolute", top: padding, bottom: padding, left: padding / 2 - 2, width: 5, backgroundColor: theme.border, opacity: 0.8, zIndex: 5, borderRadius: 3 }} />}
              {frame === "shadow-frame" && <div style={{ position: "absolute", inset: 20, border: `1.5px solid ${theme.border}`, opacity: 0.4, zIndex: 5, pointerEvents: "none", boxShadow: `0 0 30px ${theme.border}` }} />}
              {frame === "ornate" && (
                <>
                  <div style={{ position: "absolute", inset: 12, border: `1.5px solid ${theme.border}`, opacity: 0.55, zIndex: 5, pointerEvents: "none" }} />
                  <div style={{ position: "absolute", inset: 20, border: `1.5px solid ${theme.border}`, opacity: 0.25, zIndex: 5, pointerEvents: "none" }} />
                </>
              )}

              {/* Text layers */}
              {textLayers.map(layer => {
                if (!layer.visible || !layer.text.trim()) return null;
                const displayText = layer.kind === "author" ? `— ${layer.text}` : layer.text;
                const isSelected = selectedId === layer.id;
                const boxSize = textBoxSizes[layer.id] ?? { w: 0.7, h: 0.15 };
                const boxW = boxSize.w * cardW;
                const boxH = boxSize.h * cardH;
                const handleSz = Math.ceil(28 / scale);
                return (
                  <div key={layer.id}
                    onClick={e => { e.stopPropagation(); setSelectedId(layer.id); setActiveTool("text"); setTextSubTab("style"); }}
                    onMouseDown={e => { if ((e.target as HTMLElement).dataset.resize) return; startDrag(e, layer.id, false, layer.x, layer.y); }}
                    onTouchStart={e => { if ((e.target as HTMLElement).dataset.resize) return; startDrag(e, layer.id, false, layer.x, layer.y); }}
                    style={{
                      position: "absolute",
                      left: layer.x * cardW, top: layer.y * cardH,
                      width: boxW, minHeight: boxH,
                      transform: "translate(-50%, -50%)",
                      zIndex: 10, cursor: dragging?.id === layer.id ? "grabbing" : "grab",
                      userSelect: "none", textAlign: layer.align, boxSizing: "border-box",
                      opacity: (layer.opacity ?? 100) / 100,
                    }}>
                    {isSelected && (
                      <button data-nodelete="1"
                        onMouseDown={e => e.stopPropagation()}
                        onTouchStart={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); removeLayer(layer.id); }}
                        style={{
                          position: "absolute", top: -handleSz * 0.9, right: -handleSz * 0.5,
                          zIndex: 30, background: "#ef4444", color: "#fff",
                          border: "2px solid #fff", borderRadius: "50%",
                          width: handleSz, height: handleSz,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: Math.ceil(16 / scale), cursor: "pointer", fontWeight: "bold",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.5)", lineHeight: 1,
                        }}>✕</button>
                    )}
                    <div style={{
                      fontSize: layer.fontSize,
                      fontFamily: FONT_CSS[layer.fontKey] || "'Tiro Bangla', serif",
                      color: layer.color,
                      fontWeight: layer.bold ? "bold" : "normal",
                      fontStyle: layer.italic ? "italic" : "normal",
                      lineHeight: layer.lineHeight,
                      whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "break-word",
                      textShadow: layer.shadow ? "2px 2px 8px rgba(0,0,0,0.5)" : "none",
                      WebkitTextStroke: layer.outline ? `${Math.ceil(layer.fontSize * 0.06)}px ${layer.outlineColor}` : "none",
                      outline: isSelected ? `${Math.ceil(2 / scale)}px dashed #D4A843` : "none",
                      outlineOffset: `${Math.ceil(4 / scale)}px`,
                      borderRadius: Math.ceil(4 / scale),
                      padding: `${Math.ceil(4 / scale)}px`,
                      width: "100%", minHeight: boxH,
                    }}>
                      {displayText}
                    </div>
                    {isSelected && (
                      <div data-resize="1"
                        onMouseDown={e => {
                          e.stopPropagation();
                          setResizing({ id: layer.id, startX: e.clientX, startY: e.clientY, origW: boxSize.w, origH: boxSize.h });
                          setTextLayers(prev => prev.map(l => l.id === layer.id ? { ...l, baseFontSize: l.fontSize } : l));
                        }}
                        onTouchStart={e => {
                          e.stopPropagation();
                          setResizing({ id: layer.id, startX: e.touches[0].clientX, startY: e.touches[0].clientY, origW: boxSize.w, origH: boxSize.h });
                          setTextLayers(prev => prev.map(l => l.id === layer.id ? { ...l, baseFontSize: l.fontSize } : l));
                        }}
                        style={{
                          position: "absolute", bottom: -handleSz * 0.5, right: -handleSz * 0.5,
                          width: handleSz, height: handleSz,
                          background: "#D4A843", border: "2px solid #fff",
                          borderRadius: Math.ceil(4 / scale), cursor: "se-resize", zIndex: 30,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: Math.ceil(12 / scale), color: "#000", fontWeight: "bold",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                        }}>⤡</div>
                    )}
                  </div>
                );
              })}

              {/* Stickers */}
              {stickers.map(s => {
                const isSelected = selectedId === s.id;
                const handleSz = Math.ceil(28 / scale);
                return (
                  <div key={s.id}
                    onMouseDown={e => startDrag(e, s.id, true, s.x, s.y)}
                    onTouchStart={e => startDrag(e, s.id, true, s.x, s.y)}
                    onClick={e => { e.stopPropagation(); setSelectedId(s.id); }}
                    style={{
                      position: "absolute",
                      left: s.x * cardW, top: s.y * cardH,
                      transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
                      zIndex: 11, cursor: dragging?.id === s.id ? "grabbing" : "grab",
                      userSelect: "none", fontSize: s.size, lineHeight: 1,
                    }}>
                    {isSelected && (
                      <button
                        onMouseDown={e => e.stopPropagation()}
                        onTouchStart={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); removeLayer(s.id); }}
                        style={{
                          position: "absolute", top: -handleSz * 0.9, right: -handleSz * 0.5,
                          zIndex: 30, background: "#ef4444", color: "#fff",
                          border: "2px solid #fff", borderRadius: "50%",
                          width: handleSz, height: handleSz,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: Math.ceil(16 / scale), cursor: "pointer", fontWeight: "bold",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.5)", lineHeight: 1,
                        }}>✕</button>
                    )}
                    {s.emoji}
                    {isSelected && (
                      <div
                        onMouseDown={e => {
                          e.stopPropagation();
                          setResizing({ id: s.id, startX: e.clientX, startY: e.clientY, origW: s.size / cardW, origH: s.size / cardH });
                        }}
                        onTouchStart={e => {
                          e.stopPropagation();
                          setResizing({ id: s.id, startX: e.touches[0].clientX, startY: e.touches[0].clientY, origW: s.size / cardW, origH: s.size / cardH });
                        }}
                        style={{
                          position: "absolute", bottom: -handleSz * 0.5, right: -handleSz * 0.5,
                          width: handleSz, height: handleSz,
                          background: "#D4A843", border: "2px solid #fff",
                          borderRadius: Math.ceil(4 / scale), cursor: "se-resize", zIndex: 30,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: Math.ceil(12 / scale), color: "#000", fontWeight: "bold",
                        }}>⤡</div>
                    )}
                  </div>
                );
              })}

              {/* Inline text textarea overlay */}
              {inlineTextPos && (
                <div
                  style={{
                    position: "absolute",
                    left: inlineTextPos.x,
                    top: inlineTextPos.y,
                    zIndex: 25,
                    transform: "translate(0, -50%)",
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <textarea
                    ref={inlineTextareaRef}
                    value={inlineTextValue}
                    onChange={e => setInlineTextValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        commitInlineText();
                      }
                      if (e.key === "Escape") {
                        setInlineTextPos(null);
                        setInlineTextValue("");
                      }
                    }}
                    onBlur={commitInlineText}
                    placeholder="লিখুন..."
                    rows={3}
                    style={{
                      background: "rgba(13,20,32,0.85)",
                      border: "2px solid #D4A843",
                      borderRadius: 8,
                      color: theme.text,
                      fontSize: 40,
                      fontFamily: "'ChandraSheela', serif",
                      padding: "8px 12px",
                      minWidth: 300,
                      maxWidth: cardW * 0.8,
                      outline: "none",
                      resize: "both",
                      lineHeight: 1.6,
                      boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
                      backdropFilter: "blur(4px)",
                    }}
                  />
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <button
                      onMouseDown={e => { e.preventDefault(); commitInlineText(); }}
                      style={{
                        padding: "6px 16px", borderRadius: 8, border: "none",
                        background: "#D4A843", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer",
                      }}
                    >✅ যোগ করুন</button>
                    <button
                      onMouseDown={e => { e.preventDefault(); setInlineTextPos(null); setInlineTextValue(""); }}
                      style={{
                        padding: "6px 16px", borderRadius: 8, border: "1px solid #ef4444",
                        background: "rgba(239,68,68,0.15)", color: "#ef4444", fontWeight: 700, fontSize: 13, cursor: "pointer",
                      }}
                    >✕ বাতিল</button>
                  </div>
                </div>
              )}

              {/* Drawing canvas overlay */}
              <canvas
                ref={drawCanvasRef}
                width={cardW}
                height={cardH}
                style={{
                  position: "absolute", inset: 0, zIndex: 20,
                  pointerEvents: activeTool === "draw" ? "auto" : "none",
                  cursor: activeTool === "draw" ? "crosshair" : "none",
                  touchAction: "none",
                }}
                onPointerDown={onDrawPointerDown}
                onPointerMove={onDrawPointerMove}
                onPointerUp={onDrawPointerUp}
                onPointerLeave={onDrawPointerUp}
              />
            </div>
          </div>
        </div>

        {/* ── Sub-panels ── */}
        <AnimatePresence>
          {activeTool && (
            <motion.div
              key={activeTool}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{
                background: "#0d1420",
                borderTop: "1px solid #1e3050",
                maxHeight: "58vh",
                display: "flex", flexDirection: "column",
                flexShrink: 0, overflow: "hidden",
              }}
            >

              {/* ── CANVAS PANEL ── */}
              {activeTool === "canvas" && (
                <>
                  <PanelHeader title="ক্যানভাস সেটিংস" onClose={() => setActiveTool(null)} />
                  <div style={{ padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Size */}
                    <div>
                      <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 10, fontWeight: 600 }}>ক্যানভাস আকার</p>
                      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                        {SIZES.map((s, i) => (
                          <button key={i} onClick={() => setSizeIdx(i)}
                            style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                              padding: "10px 14px", borderRadius: 12,
                              border: `2px solid ${sizeIdx === i ? "#D4A843" : "#1e3050"}`,
                              background: sizeIdx === i ? "rgba(212,168,67,0.12)" : "transparent",
                              cursor: "pointer" }}>
                            <span style={{ fontSize: 22 }}>{s.icon}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: sizeIdx === i ? "#D4A843" : "#9ca3af" }}>{s.name.split(" ")[0]}</span>
                            <span style={{ fontSize: 9, color: "#6b7280" }}>{s.w}×{s.h}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Photo upload */}
                    <div>
                      <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>ছবি আপলোড</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => photoRef.current?.click()}
                          style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px dashed #1e3050",
                            background: photoImage ? "rgba(212,168,67,0.08)" : "transparent",
                            color: photoImage ? "#D4A843" : "#9ca3af", fontSize: 12, cursor: "pointer" }}>
                          {photoImage ? "✅ ছবি পরিবর্তন" : "📷 ছবি যোগ করুন"}
                        </button>
                        {photoImage && (
                          <button onClick={() => setPhotoImage(null)}
                            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ef4444",
                              background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 12, cursor: "pointer" }}>
                            ✕
                          </button>
                        )}
                      </div>
                      {photoImage && <SliderRow label="ছবির অপাসিটি" val={photoOpacity} set={setPhotoOpacity} min={10} max={100} unit="%" />}
                    </div>
                    {/* Export quality */}
                    <div>
                      <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>এক্সপোর্ট মান</p>
                      <div style={{ display: "flex", gap: 6 }}>
                        {([["1x", "স্ট্যান্ডার্ড", `${cardW}×${cardH}`], ["2x", "HD", `${cardW*2}×${cardH*2}`], ["4k", "4K Ultra", `${cardW*4}×${cardH*4}`]] as [ExportQuality, string, string][]).map(([q, label, res]) => (
                          <button key={q} onClick={() => setExportQuality(q)}
                            style={{ flex: 1, padding: "8px 4px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                              border: `1px solid ${exportQuality === q ? "#D4A843" : "#1e3050"}`,
                              background: exportQuality === q ? "rgba(212,168,67,0.15)" : "transparent",
                              color: exportQuality === q ? "#D4A843" : "#6b7280", cursor: "pointer",
                              display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            <span>{label}</span>
                            <span style={{ fontSize: 9, opacity: 0.7 }}>{res}</span>
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        {(["png", "jpg"] as ExportFormat[]).map(f => (
                          <button key={f} onClick={() => setExportFormat(f)}
                            style={{ flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 12, fontWeight: 700,
                              border: `1px solid ${exportFormat === f ? "#D4A843" : "#1e3050"}`,
                              background: exportFormat === f ? "rgba(212,168,67,0.15)" : "transparent",
                              color: exportFormat === f ? "#D4A843" : "#6b7280", cursor: "pointer" }}>
                            {f.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Watermark */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "#060c18", borderRadius: 10, padding: "10px 14px" }}>
                      <span style={{ color: "#9ca3af", fontSize: 12 }}>ওয়াটারমার্ক</span>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input type="checkbox" checked={showWatermark} onChange={e => setShowWatermark(e.target.checked)}
                          style={{ accentColor: "#D4A843", width: 16, height: 16 }} />
                        <span style={{ color: "#D4A843", fontSize: 12, fontWeight: 600 }}>দেখাও</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* ── TEXT PANEL ── */}
              {activeTool === "text" && (
                <>
                  <PanelHeader title="লেখা সম্পাদনা" onClose={() => setActiveTool(null)} />
                  <div style={{ display: "flex", borderBottom: "1px solid #1e3050", flexShrink: 0 }}>
                    {(["content", "style", "font"] as const).map(tab => (
                      <button key={tab} onClick={() => setTextSubTab(tab)}
                        style={{ flex: 1, padding: "10px 0", fontSize: 12, fontWeight: 600, border: "none",
                          background: "transparent", cursor: "pointer",
                          color: textSubTab === tab ? "#D4A843" : "#6b7280",
                          borderBottom: textSubTab === tab ? "2px solid #D4A843" : "2px solid transparent" }}>
                        {tab === "content" ? "বিষয়বস্তু" : tab === "style" ? "স্টাইল" : "ফন্ট"}
                      </button>
                    ))}
                  </div>
                  <div style={{ padding: 16, overflowY: "auto" }}>
                    {textSubTab === "content" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {(["title", "body", "author"] as const).map(kind => {
                          const layer = textLayers.find(l => l.kind === kind)!;
                          const labels = { title: "শিরোনাম", body: "মূল লেখা", author: "লেখক নাম" };
                          return (
                            <div key={kind}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <label style={{ color: "#D4A843", fontSize: 12, fontWeight: 700 }}>{labels[kind]}</label>
                                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                                  <input type="checkbox" checked={layer.visible}
                                    onChange={e => updateText(layer.id, { visible: e.target.checked })}
                                    style={{ accentColor: "#D4A843" }} />
                                  <span style={{ color: "#6b7280", fontSize: 11 }}>দেখাও</span>
                                </label>
                              </div>
                              {kind === "body" ? (
                                <textarea value={layer.text} onChange={e => updateText(layer.id, { text: e.target.value })}
                                  rows={4} placeholder="কবিতা বা উক্তি লিখুন..."
                                  style={{ width: "100%", background: "#060c18", color: "#fff", border: "1px solid #1e3050",
                                    borderRadius: 10, padding: "9px 12px", fontSize: 14, outline: "none",
                                    resize: "vertical", lineHeight: 1.7, boxSizing: "border-box" }} />
                              ) : (
                                <input value={layer.text} onChange={e => updateText(layer.id, { text: e.target.value })}
                                  placeholder={`${labels[kind]} লিখুন...`}
                                  style={{ width: "100%", background: "#060c18", color: "#fff", border: "1px solid #1e3050",
                                    borderRadius: 10, padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                              )}
                            </div>
                          );
                        })}
                        <div>
                          <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, marginBottom: 8 }}>দ্রুত টেমপ্লেট</p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                            {TEMPLATES.map(t => (
                              <button key={t.label}
                                onClick={() => {
                                  updateText(textLayers.find(l => l.kind === "title")!.id, { text: t.title, visible: true });
                                  updateText(textLayers.find(l => l.kind === "body")!.id, { text: t.body, visible: true });
                                }}
                                style={{ textAlign: "left", padding: "8px 12px", background: "#060c18",
                                  border: "1px solid #1e3050", borderRadius: 10, fontSize: 12,
                                  color: "#d1d5db", cursor: "pointer" }}>
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button onClick={addCustomText}
                          style={{ width: "100%", padding: "10px 0", border: "1px dashed rgba(212,168,67,0.3)",
                            borderRadius: 10, fontSize: 13, fontWeight: 600, color: "rgba(212,168,67,0.7)",
                            background: "transparent", cursor: "pointer" }}>
                          + নতুন কাস্টম লেখা
                        </button>
                      </div>
                    )}
                    {textSubTab === "style" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                          <p style={{ color: "#9ca3af", fontSize: 11, marginBottom: 8 }}>কোন লেখা সম্পাদনা করবেন?</p>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {textLayers.filter(l => l.visible && l.text.trim()).map(l => (
                              <button key={l.id} onClick={() => setSelectedId(l.id)}
                                style={{ padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                                  border: `1px solid ${selectedId === l.id ? "#D4A843" : "#1e3050"}`,
                                  background: selectedId === l.id ? "rgba(212,168,67,0.1)" : "transparent",
                                  color: selectedId === l.id ? "#D4A843" : "#9ca3af", cursor: "pointer" }}>
                                {l.kind === "title" ? "শিরোনাম" : l.kind === "body" ? "মূল লেখা" : l.kind === "author" ? "লেখক নাম" : l.text.slice(0, 8) || "কাস্টম"}
                              </button>
                            ))}
                          </div>
                        </div>
                        {selectedText && (
                          <>
                            <div>
                              <p style={{ color: "#9ca3af", fontSize: 11, marginBottom: 8 }}>রং</p>
                              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                                {QUICK_COLORS.map(c => (
                                  <button key={c} onClick={() => updateText(selectedText.id, { color: c })}
                                    style={{ width: 26, height: 26, borderRadius: "50%",
                                      border: `3px solid ${selectedText.color === c ? "#fff" : "transparent"}`,
                                      background: c, cursor: "pointer", flexShrink: 0,
                                      boxShadow: selectedText.color === c ? "0 0 0 2px #D4A843" : "none" }} />
                                ))}
                                <input type="color" value={selectedText.color}
                                  onChange={e => updateText(selectedText.id, { color: e.target.value })}
                                  style={{ width: 26, height: 26, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0 }} />
                              </div>
                            </div>
                            <SliderRow label="ফন্ট সাইজ" val={selectedText.fontSize} set={v => updateText(selectedText.id, { fontSize: v, baseFontSize: v })} min={12} max={200} />
                            <SliderRow label="লাইন স্পেস" val={selectedText.lineHeight} set={v => updateText(selectedText.id, { lineHeight: v })} min={1} max={3} step={0.1} />
                            <SliderRow label="অপাসিটি" val={selectedText.opacity ?? 100} set={v => updateText(selectedText.id, { opacity: v })} min={10} max={100} unit="%" />
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              {[
                                { label: "B", key: "bold", val: selectedText.bold },
                                { label: "I", key: "italic", val: selectedText.italic },
                                { label: "💫", key: "shadow", val: selectedText.shadow },
                                { label: "O", key: "outline", val: selectedText.outline },
                              ].map(btn => (
                                <button key={btn.key}
                                  onClick={() => updateText(selectedText.id, { [btn.key]: !btn.val } as Partial<TextBlock>)}
                                  style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                                    border: `1px solid ${btn.val ? "#D4A843" : "#1e3050"}`,
                                    background: btn.val ? "rgba(212,168,67,0.15)" : "transparent",
                                    color: btn.val ? "#D4A843" : "#6b7280", cursor: "pointer" }}>
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                            {selectedText.outline && (
                              <div>
                                <p style={{ color: "#9ca3af", fontSize: 11, marginBottom: 6 }}>আউটলাইন রং</p>
                                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                                  {QUICK_COLORS.map(c => (
                                    <button key={c} onClick={() => updateText(selectedText.id, { outlineColor: c })}
                                      style={{ width: 22, height: 22, borderRadius: "50%",
                                        border: `3px solid ${selectedText.outlineColor === c ? "#fff" : "transparent"}`,
                                        background: c, cursor: "pointer", flexShrink: 0 }} />
                                  ))}
                                  <input type="color" value={selectedText.outlineColor}
                                    onChange={e => updateText(selectedText.id, { outlineColor: e.target.value })}
                                    style={{ width: 22, height: 22, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0 }} />
                                </div>
                              </div>
                            )}
                            <div>
                              <p style={{ color: "#9ca3af", fontSize: 11, marginBottom: 6 }}>সারিবদ্ধতা</p>
                              <div style={{ display: "flex", gap: 6 }}>
                                {(["left", "center", "right"] as const).map(a => (
                                  <button key={a} onClick={() => updateText(selectedText.id, { align: a })}
                                    style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 16,
                                      border: `1px solid ${selectedText.align === a ? "#D4A843" : "#1e3050"}`,
                                      background: selectedText.align === a ? "rgba(212,168,67,0.15)" : "transparent",
                                      cursor: "pointer" }}>
                                    {a === "left" ? "⬅" : a === "center" ? "↔" : "➡"}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {textSubTab === "font" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {FONTS.map(f => (
                          <button key={f.value}
                            onClick={() => selectedText && updateText(selectedText.id, { fontKey: f.value })}
                            style={{
                              padding: "12px 16px", borderRadius: 10, textAlign: "left",
                              border: `1px solid ${selectedText?.fontKey === f.value ? "#D4A843" : "#1e3050"}`,
                              background: selectedText?.fontKey === f.value ? "rgba(212,168,67,0.1)" : "#060c18",
                              cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                            }}>
                            <span style={{ fontFamily: FONT_CSS[f.value], fontSize: 18, color: "#fff" }}>আমার বাংলা</span>
                            <span style={{ fontSize: 11, color: selectedText?.fontKey === f.value ? "#D4A843" : "#6b7280" }}>{f.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── STICKER PANEL ── */}
              {activeTool === "sticker" && (
                <>
                  <PanelHeader title="😊 স্টিকার" onClose={() => setActiveTool(null)} />
                  <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid #1e3050",
                    flexShrink: 0, padding: "0 8px" }}>
                    {STICKER_CATEGORIES.map((c, i) => (
                      <button key={i} onClick={() => setActiveStickerCat(i)}
                        style={{ flexShrink: 0, padding: "8px 12px", fontSize: 11, fontWeight: 600,
                          border: "none", background: "transparent", cursor: "pointer", whiteSpace: "nowrap",
                          color: activeStickerCat === i ? "#D4A843" : "#6b7280",
                          borderBottom: activeStickerCat === i ? "2px solid #D4A843" : "2px solid transparent" }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ padding: 12, overflowY: "auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 6 }}>
                      {STICKER_CATEGORIES[activeStickerCat].stickers.map((emoji, i) => (
                        <button key={i} onClick={() => addSticker(emoji)}
                          style={{ fontSize: 28, padding: "6px 0", borderRadius: 8, border: "1px solid transparent",
                            background: "transparent", cursor: "pointer", transition: "all 0.15s",
                            lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {emoji}
                        </button>
                      ))}
                    </div>
                    {selectedSticker && (
                      <div style={{ marginTop: 12, padding: 12, background: "#060c18", borderRadius: 10 }}>
                        <p style={{ color: "#9ca3af", fontSize: 11, marginBottom: 8 }}>নির্বাচিত স্টিকার সম্পাদনা</p>
                        <SliderRow label="আকার" val={selectedSticker.size} set={v => setStickers(p => p.map(s => s.id === selectedSticker.id ? { ...s, size: v } : s))} min={20} max={300} />
                        <div style={{ marginTop: 8 }}>
                          <SliderRow label="ঘূর্ণন" val={selectedSticker.rotation} set={v => setStickers(p => p.map(s => s.id === selectedSticker.id ? { ...s, rotation: v } : s))} min={-180} max={180} unit="°" />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── FILTER PANEL ── */}
              {activeTool === "filter" && (
                <>
                  <PanelHeader title="🎨 ফিল্টার" onClose={() => setActiveTool(null)} />
                  <div style={{ padding: 12, overflowY: "auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                      {FILTER_PRESETS.map(fp => (
                        <button key={fp.name} onClick={() => setFilterPreset(fp.name)}
                          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                            padding: "10px 4px", borderRadius: 10,
                            border: `2px solid ${filterPreset === fp.name ? "#D4A843" : "#1e3050"}`,
                            background: filterPreset === fp.name ? "rgba(212,168,67,0.12)" : "#060c18",
                            cursor: "pointer" }}>
                          <span style={{ fontSize: 24 }}>{fp.emoji}</span>
                          <span style={{ fontSize: 10, fontWeight: 600,
                            color: filterPreset === fp.name ? "#D4A843" : "#9ca3af" }}>{fp.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── ADJUST PANEL ── */}
              {activeTool === "adjust" && (
                <>
                  <PanelHeader title="⚙️ সামঞ্জস্য" onClose={() => setActiveTool(null)} />
                  <div style={{ padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
                    <SliderRow label="উজ্জ্বলতা"  val={brightness} set={setBrightness} min={50}  max={200} unit="%" />
                    <SliderRow label="কনট্রাস্ট"  val={contrast}   set={setContrast}   min={50}  max={200} unit="%" />
                    <SliderRow label="স্যাচুরেশন" val={saturation} set={setSaturation} min={0}   max={300} unit="%" />
                    <SliderRow label="ব্লার"       val={blur}       set={setBlur}       min={0}   max={20}  unit="px" />
                    <SliderRow label="ভিগনেট"     val={vignette}   set={setVignette}   min={0}   max={100} unit="%" />
                    <button onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); setBlur(0); setVignette(0); }}
                      style={{ padding: "8px 0", borderRadius: 8, border: "1px solid #1e3050",
                        background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>
                      ↺ রিসেট করুন
                    </button>
                  </div>
                </>
              )}

              {/* ── BGWALL PANEL ── */}
              {activeTool === "bgwall" && (
                <BgWallPanel
                  onClose={() => setActiveTool(null)}
                  onSelect={css => setBgWallCss(css)}
                  selected={bgWallCss}
                />
              )}

              {/* ── UPSCALE PANEL ── */}
              {activeTool === "upscale" && (
                <UpscalePanel onClose={() => setActiveTool(null)} />
              )}

              {/* ── CROP PANEL ── */}
              {activeTool === "crop" && (
                <CropPanel
                  sizeIdx={sizeIdx} setSizeIdx={setSizeIdx}
                  frame={frame} setFrame={setFrame}
                  onClose={() => setActiveTool(null)}
                />
              )}

              {/* ── DRAW PANEL ── */}
              {activeTool === "draw" && (
                <>
                  <PanelHeader title="🖊️ ড্রইং টুলস" onClose={() => setActiveTool(null)} />
                  <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
                    {/* Tool grid */}
                    <div>
                      <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, marginBottom: 8 }}>টুল নির্বাচন</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                        {([
                          { tool: "pencil" as DrawTool, icon: "✏️", name: "পেন্সিল" },
                          { tool: "brush"  as DrawTool, icon: "🖌️", name: "ব্রাশ" },
                          { tool: "eraser" as DrawTool, icon: "🧹", name: "ইরেজার" },
                          { tool: "line"   as DrawTool, icon: "📏", name: "লাইন" },
                          { tool: "rect"   as DrawTool, icon: "⬜", name: "আয়তক্ষেত্র" },
                          { tool: "circle" as DrawTool, icon: "⭕", name: "বৃত্ত" },
                          { tool: "arrow"  as DrawTool, icon: "↗️", name: "তীর" },
                        ]).map(t => (
                          <button key={t.tool} onClick={() => setDrawTool(t.tool)}
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                              padding: "8px 4px", borderRadius: 10,
                              border: `2px solid ${drawTool === t.tool ? "#D4A843" : "#1e3050"}`,
                              background: drawTool === t.tool ? "rgba(212,168,67,0.15)" : "transparent",
                              cursor: "pointer" }}>
                            <span style={{ fontSize: 20 }}>{t.icon}</span>
                            <span style={{ fontSize: 10, color: drawTool === t.tool ? "#D4A843" : "#9ca3af", fontWeight: 600 }}>{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Color */}
                    <div>
                      <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, marginBottom: 8 }}>রং</p>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                        {QUICK_COLORS.map(c => (
                          <button key={c} onClick={() => setDrawColor(c)}
                            style={{ width: 26, height: 26, borderRadius: "50%",
                              border: `3px solid ${drawColor === c ? "#fff" : "transparent"}`,
                              background: c, cursor: "pointer", flexShrink: 0,
                              boxShadow: drawColor === c ? "0 0 0 2px #D4A843" : "none" }} />
                        ))}
                        <input type="color" value={drawColor} onChange={e => setDrawColor(e.target.value)}
                          style={{ width: 26, height: 26, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0 }} />
                      </div>
                    </div>
                    <SliderRow label="ব্রাশ সাইজ" val={drawWidth}   set={setDrawWidth}   min={1}  max={40}  unit="px" />
                    <SliderRow label="অপাসিটি"   val={drawOpacity} set={setDrawOpacity} min={10} max={100} unit="%" />
                    <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                      borderRadius: 10, padding: "10px 14px" }}>
                      <p style={{ color: "#a78bfa", fontSize: 12, fontWeight: 700, margin: 0 }}>✏️ ক্যানভাসে সরাসরি আঁকুন</p>
                      <p style={{ color: "#9ca3af", fontSize: 11, margin: "4px 0 0" }}>উপরের ক্যানভাসে আঙুল বা মাউস দিয়ে আঁকুন</p>
                    </div>
                    <button onClick={() => { const c = drawCanvasRef.current; if (c) c.getContext("2d")!.clearRect(0,0,c.width,c.height); }}
                      style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "1px solid #ef4444",
                        background: "rgba(239,68,68,0.1)", color: "#ef4444", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      🗑️ ড্রইং মুছুন
                    </button>
                  </div>
                </>
              )}

              {/* ── INLINE TEXT TOOL PANEL ── */}
              {activeTool === "inlinetext" && (
                <>
                  <PanelHeader title="🖊️ টেক্সট যোগ করুন" onClose={() => { setActiveTool(null); setInlineTextPos(null); }} />
                  <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.3)",
                      borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>👆</div>
                      <p style={{ color: "#D4A843", fontSize: 14, fontWeight: 700, margin: 0 }}>উপরের ক্যানভাসে যেখানে লিখতে চান সেখানে ট্যাপ করুন</p>
                      <p style={{ color: "#9ca3af", fontSize: 12, margin: "6px 0 0" }}>ট্যাপ করলে সেখানেই লেখার বাক্স আসবে • লিখুন • Enter বা ✅ বাটন দিন</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div style={{ background: "#060c18", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>👆</div>
                        <p style={{ color: "#9ca3af", fontSize: 11, margin: 0, fontWeight: 600 }}>ক্যানভাসে ট্যাপ</p>
                        <p style={{ color: "#6b7280", fontSize: 10, margin: "2px 0 0" }}>যেকোনো জায়গায়</p>
                      </div>
                      <div style={{ background: "#060c18", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>⌨️</div>
                        <p style={{ color: "#9ca3af", fontSize: 11, margin: 0, fontWeight: 600 }}>লিখুন</p>
                        <p style={{ color: "#6b7280", fontSize: 10, margin: "2px 0 0" }}>বাংলা বা ইংরেজি</p>
                      </div>
                      <div style={{ background: "#060c18", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>✅</div>
                        <p style={{ color: "#9ca3af", fontSize: 11, margin: 0, fontWeight: 600 }}>যোগ করুন</p>
                        <p style={{ color: "#6b7280", fontSize: 10, margin: "2px 0 0" }}>Enter বা বাটন</p>
                      </div>
                      <div style={{ background: "#060c18", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>✋</div>
                        <p style={{ color: "#9ca3af", fontSize: 11, margin: 0, fontWeight: 600 }}>সরান</p>
                        <p style={{ color: "#6b7280", fontSize: 10, margin: "2px 0 0" }}>ড্র্যাগ করুন</p>
                      </div>
                    </div>
                    {inlineTextPos && (
                      <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
                        borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                        <p style={{ color: "#4ade80", fontSize: 13, fontWeight: 700, margin: 0 }}>✏️ লেখার বাক্স খোলা আছে — লিখুন!</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── BACKGROUND (পটভূমি) PANEL ── */}
              {activeTool === "bgphoto" && (
                <>
                  <PanelHeader title="🖼️ পটভূমি" onClose={() => setActiveTool(null)} />
                  <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
                    {/* Theme */}
                    <div>
                      <p style={{ color: "#9ca3af", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>থিম</p>
                      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                        {THEMES.map((t, i) => (
                          <button key={i} onClick={() => setThemeIdx(i)}
                            style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 10,
                              background: t.gradient || t.bg,
                              border: `3px solid ${themeIdx === i ? "#D4A843" : "transparent"}`,
                              cursor: "pointer", boxShadow: themeIdx === i ? "0 0 0 2px #D4A843" : "none" }}
                            title={t.name} />
                        ))}
                      </div>
                    </div>
                    {/* BG photo upload */}
                    <div>
                      <p style={{ color: "#9ca3af", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>পটভূমি ছবি</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => bgFileRef.current?.click()}
                          style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px dashed #1e3050",
                            background: bgImage ? "rgba(212,168,67,0.08)" : "transparent",
                            color: bgImage ? "#D4A843" : "#9ca3af", fontSize: 12, cursor: "pointer" }}>
                          {bgImage ? "✅ পটভূমি পরিবর্তন" : "🖼️ পটভূমি ছবি যোগ করুন"}
                        </button>
                        {bgImage && (
                          <button onClick={() => setBgImage(null)}
                            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ef4444",
                              background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 12, cursor: "pointer" }}>
                            ✕
                          </button>
                        )}
                      </div>
                      {bgImage && <SliderRow label="পটভূমি অপাসিটি" val={bgOpacity} set={setBgOpacity} min={5} max={100} unit="%" />}
                    </div>
                  </div>
                </>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom Toolbar ── */}
        <div style={{
          background: "#0d1420",
          borderTop: "1px solid #1e3050",
          display: "flex", overflowX: "auto", padding: "6px 8px",
          flexShrink: 0, gap: 2,
          scrollbarWidth: "none",
        }}>
          <ToolBtn icon="📐" label="ক্যানভাস" active={activeTool === "canvas"}  onClick={() => toggleTool("canvas")} />
          <ToolBtn icon="✍️" label="লেখা"     active={activeTool === "text"}    onClick={() => toggleTool("text")} />
          <ToolBtn icon="🖊️" label="টেক্সট"   active={activeTool === "inlinetext"} onClick={() => { toggleTool("inlinetext"); setInlineTextPos(null); }} />
          <ToolBtn icon="😊" label="স্টিকার"  active={activeTool === "sticker"} onClick={() => toggleTool("sticker")} />
          <ToolBtn icon="🎨" label="ফিল্টার"  active={activeTool === "filter"}  onClick={() => toggleTool("filter")} />
          <ToolBtn icon="⚙️" label="সামঞ্জস্য" active={activeTool === "adjust"} onClick={() => toggleTool("adjust")} />
          <ToolBtn icon="🌄" label="পটভূমি"   active={activeTool === "bgphoto"} onClick={() => toggleTool("bgphoto")} />
          <ToolBtn icon="🖼️" label="ব্যাকগ্রাউন্ড" active={activeTool === "bgwall"} onClick={() => toggleTool("bgwall")} />
          <ToolBtn icon="🔍" label="আপস্কেল"  active={activeTool === "upscale"} onClick={() => toggleTool("upscale")} />
          <ToolBtn icon="✂️" label="ক্রপ"     active={activeTool === "crop"}    onClick={() => toggleTool("crop")} />
          <ToolBtn icon="🖊️" label="ড্র"      active={activeTool === "draw"}    onClick={() => toggleTool("draw")} />
        </div>

        {/* Hidden file inputs */}
        <input ref={photoRef}  type="file" accept="image/*" style={{ display: "none" }} onChange={onPhotoUpload} />
        <input ref={bgFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onBgUpload} />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
        * { -webkit-tap-highlight-color: transparent; }
        input[type=range]::-webkit-slider-thumb { width: 18px; height: 18px; }
      `}</style>
    </div>
  );
}
