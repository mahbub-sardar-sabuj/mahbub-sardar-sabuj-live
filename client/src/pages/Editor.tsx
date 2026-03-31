/**
 * সরদার ডিজাইন স্টুডিও — সম্পূর্ণ ঠিক করা সংস্করণ v3
 * ✅ Mobile-first layout: canvas on top, toolbar below, panels slide up
 * ✅ No glitches: removed spring animation, use simple ease
 * ✅ All tools accessible: toolbar scrollable with visible scroll indicator
 * ✅ Panels properly scrollable with correct maxHeight
 * ✅ Scale calculation improved for all screen sizes
 * ✅ Pinch-to-resize text (InShot-style)
 * ✅ Drawing canvas
 * ✅ 100+ backgrounds
 * ✅ Upscale panel
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const FONTS = [
  // ── বিদ্যমান ফন্ট ──
  { name: "আদর্শ লিপি",              value: "AdorshoLipi" },
  { name: "চন্দ্রশীলা",              value: "ChandraSheela" },
  { name: "চন্দ্রশীলা প্রিমিয়াম",   value: "ChandraSheelaPremium" },
  { name: "মাহবুব সরদার ফন্ট",      value: "MahbubSardarSabujFont" },
  { name: "মাসুদ নান্দনিক",          value: "MasudNandanik" },
  { name: "BH Sabit",               value: "BHSabitAdorshoLightUnicode" },
  { name: "BLAB Norha",             value: "BLABNorhaGramUnicode" },
  { name: "Akhand Bengali",         value: "AkhandBengali" },
  { name: "Tiro Bangla",            value: "TiroBangla" },
  { name: "Noto Sans Bengali",      value: "NotoSansBengali" },
  // ── নতুন BH সিরিজ ──
  { name: "BH অপরাজিত",            value: "BHAparajito" },
  { name: "BH হাদাভোদা",           value: "BHHadaVoda" },
  { name: "BH বর্ণবিথি",            value: "BHBornobithi" },
  { name: "BH নীলমায়া",            value: "BHNilMaya" },
  { name: "BH শামিম অপরাজেয়",     value: "BHShamimOporajeyo" },
  { name: "BH শামিম অপরাজেয় রাফ", value: "BHShamimOporajeyoRough" },
  { name: "BH শামিম হস্তলিপি",     value: "BHShamimHostolipi" },
  // ── হাদি সিরিজ ──
  { name: "হাদি",                   value: "Hadi" },
  { name: "হাদি রাউন্ডেড",          value: "HadiRounded" },
  { name: "হাদি ইউনিকোড",          value: "HadiUnicode" },
  { name: "হাদি মাত্রা",            value: "HadiMatra" },
  { name: "হাদি রাফ",              value: "HadiRough" },
  { name: "হাদি 3D",               value: "Hadi3D" },
  { name: "হাদি স্কেচ",            value: "HadiSketch" },
  // ── প্রিমিয়াম বাংলা ──
  { name: "লি সূচয়না",             value: "LiSuchayana" },
  { name: "বর্ণপরিচয়",             value: "Bornoporichay" },
  { name: "চিরকুট মহারানি",        value: "ChirkutMoharani" },
  { name: "FL আগুন",               value: "FLAgun" },
  { name: "সাহিল শিশির",           value: "SahilShishir" },
  { name: "শাকিব এডিটজ",          value: "Shakibeditz" },
  { name: "মাহফুজ ফুলকুলি",       value: "MahfuzFulkuli" },
  { name: "বলপেন বঙ্গলিপি",       value: "BolpenBongolipi" },
  { name: "বিজয় ৭১",              value: "Bijoy71" },
  { name: "মহাকর্ষ",               value: "Mohakorso" },
  { name: "মহাসাগর",               value: "Mohasagar" },
  { name: "মায়াজাল",               value: "Mayajal" },
  { name: "মাসউদ নান্দনিক ২",     value: "MasudNandanik2" },
  { name: "মাসুদ বলপেন",          value: "MasudBolpen" },
  { name: "মাসুদ ঐতিহ্য",         value: "MasudOitiho" },
  { name: "রিমঝিম",                value: "Rimjhim" },
  { name: "শহীদ ওসমান হাদি",      value: "ShahidOsmanHadi" },
  { name: "শালবন",                 value: "Shalbon" },
  { name: "সামিম চলন্তিকা",       value: "SamimChalantika" },
  { name: "সুপ্তি",                value: "Supti" },
  { name: "সুপ্তি ২",              value: "Supti2" },
  { name: "হেলাল গগন",            value: "HelalGagon" },
];

const FONT_CSS: Record<string, string> = {
  // existing
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
  // new BH series
  BHAparajito:                  "'BHAparajito', serif",
  BHHadaVoda:                   "'BHHadaVoda', serif",
  BHBornobithi:                 "'BHBornobithi', serif",
  BHNilMaya:                    "'BHNilMaya', serif",
  BHShamimOporajeyo:            "'BHShamimOporajeyo', serif",
  BHShamimOporajeyoRough:       "'BHShamimOporajeyoRough', serif",
  BHShamimHostolipi:            "'BHShamimHostolipi', serif",
  // Hadi series
  Hadi:                         "'Hadi', serif",
  HadiRounded:                  "'HadiRounded', serif",
  HadiUnicode:                  "'HadiUnicode', serif",
  HadiMatra:                    "'HadiMatra', serif",
  HadiRough:                    "'HadiRough', serif",
  Hadi3D:                       "'Hadi3D', serif",
  HadiSketch:                   "'HadiSketch', serif",
  // premium Bangla
  LiSuchayana:                  "'LiSuchayana', serif",
  Bornoporichay:                "'Bornoporichay', serif",
  ChirkutMoharani:              "'ChirkutMoharani', serif",
  FLAgun:                       "'FLAgun', serif",
  SahilShishir:                 "'SahilShishir', serif",
  Shakibeditz:                  "'Shakibeditz', serif",
  MahfuzFulkuli:                "'MahfuzFulkuli', serif",
  BolpenBongolipi:              "'BolpenBongolipi', serif",
  Bijoy71:                      "'Bijoy71', serif",
  Mohakorso:                    "'Mohakorso', serif",
  Mohasagar:                    "'Mohasagar', serif",
  Mayajal:                      "'Mayajal', serif",
  MasudNandanik2:               "'MasudNandanik2', serif",
  MasudBolpen:                  "'MasudBolpen', serif",
  MasudOitiho:                  "'MasudOitiho', serif",
  Rimjhim:                      "'Rimjhim', serif",
  ShahidOsmanHadi:              "'ShahidOsmanHadi', serif",
  Shalbon:                      "'Shalbon', serif",
  SamimChalantika:              "'SamimChalantika', serif",
  Supti:                        "'Supti', serif",
  Supti2:                       "'Supti2', serif",
  HelalGagon:                   "'HelalGagon', serif",
};

const FONT_URLS: Record<string, string> = {
  // existing
  ChandraSheela:              "/fonts/ChandraSheela.ttf",
  ChandraSheelaPremium:       "/fonts/ChandraSheelaPremium.ttf",
  MahbubSardarSabujFont:      "/fonts/MahbubSardarSabujFont.ttf",
  MasudNandanik:              "/fonts/MasudNandanik.ttf",
  AdorshoLipi:                "/fonts/AdorshoLipi.ttf",
  BHSabitAdorshoLightUnicode: "/fonts/BHSabitAdorshoLightUnicode.ttf",
  BLABNorhaGramUnicode:       "/fonts/BLABNorhaGramUnicode.ttf",
  AkhandBengali:              "/fonts/AkhandBengali.ttf",
  // new BH series
  BHAparajito:                "/fonts/BHAparajito.ttf",
  BHHadaVoda:                 "/fonts/BHHadaVoda.ttf",
  BHBornobithi:               "/fonts/BHBornobithi.ttf",
  BHNilMaya:                  "/fonts/BHNilMaya.ttf",
  BHShamimOporajeyo:          "/fonts/BHShamimOporajeyo.ttf",
  BHShamimOporajeyoRough:     "/fonts/BHShamimOporajeyoRough.ttf",
  BHShamimHostolipi:          "/fonts/BHShamimHostolipi.ttf",
  // Hadi series
  Hadi:                       "/fonts/Hadi.ttf",
  HadiRounded:                "/fonts/HadiRounded.ttf",
  HadiUnicode:                "/fonts/HadiUnicode.ttf",
  HadiMatra:                  "/fonts/HadiMatra.ttf",
  HadiRough:                  "/fonts/HadiRough.ttf",
  Hadi3D:                     "/fonts/Hadi3D.ttf",
  HadiSketch:                 "/fonts/HadiSketch.ttf",
  // premium Bangla
  LiSuchayana:                "/fonts/LiSuchayana.ttf",
  Bornoporichay:              "/fonts/Bornoporichay.ttf",
  ChirkutMoharani:            "/fonts/ChirkutMoharani.ttf",
  FLAgun:                     "/fonts/FLAgun.ttf",
  SahilShishir:               "/fonts/SahilShishir.ttf",
  Shakibeditz:                "/fonts/Shakibeditz.ttf",
  MahfuzFulkuli:              "/fonts/MahfuzFulkuli.ttf",
  BolpenBongolipi:            "/fonts/BolpenBongolipi.ttf",
  Bijoy71:                    "/fonts/Bijoy71.ttf",
  Mohakorso:                  "/fonts/Mohakorso.ttf",
  Mohasagar:                  "/fonts/Mohasagar.ttf",
  Mayajal:                    "/fonts/Mayajal.ttf",
  MasudNandanik2:             "/fonts/MasudNandanik2.ttf",
  MasudBolpen:                "/fonts/MasudBolpen.ttf",
  MasudOitiho:                "/fonts/MasudOitiho.ttf",
  Rimjhim:                    "/fonts/Rimjhim.ttf",
  ShahidOsmanHadi:            "/fonts/ShahidOsmanHadi.ttf",
  Shalbon:                    "/fonts/Shalbon.ttf",
  SamimChalantika:            "/fonts/SamimChalantika.ttf",
  Supti:                      "/fonts/Supti.ttf",
  Supti2:                     "/fonts/Supti2.ttf",
  HelalGagon:                 "/fonts/HelalGagon.ttf",
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
      { name: "স্লেট",        css: "#1e293b" },
      { name: "চারকোল",       css: "#2d2d2d" },
      { name: "ক্রিম",        css: "#FFFEF7" },
      { name: "সোনালি",       css: "#D4A843" },
      { name: "রুবি",         css: "#9B1D20" },
      { name: "ইমারেল্ড",    css: "#2E8B57" },
    ],
  },
  {
    label: "🌌 কসমিক",
    bgs: [
      { name: "গ্যালাক্সি",   css: "radial-gradient(ellipse at center,#1a0533 0%,#2d1b69 40%,#0d1b2a 100%)" },
      { name: "নেবুলা",       css: "radial-gradient(ellipse at 30% 50%,#4a0080 0%,#000428 60%,#004e92 100%)" },
      { name: "স্টারফিল্ড",  css: "radial-gradient(ellipse at top,#1b2735 0%,#090a0f 100%)" },
      { name: "মিল্কিওয়ে",   css: "linear-gradient(160deg,#0d0d1a 0%,#1a0533 30%,#0d1b2a 60%,#000 100%)" },
      { name: "সুপারনোভা",   css: "radial-gradient(ellipse at center,#ff6b00 0%,#cc0000 30%,#1a0000 70%,#000 100%)" },
      { name: "ব্ল্যাক হোল", css: "radial-gradient(ellipse at center,#000 0%,#1a0533 40%,#000 100%)" },
    ],
  },
  {
    label: "🌿 প্রকৃতি",
    bgs: [
      { name: "ভোরের আলো",   css: "linear-gradient(180deg,#ffecd2 0%,#fcb69f 40%,#ff9a9e 100%)" },
      { name: "বনের ছায়া",   css: "linear-gradient(180deg,#1a3a1a 0%,#2d5a2d 50%,#4a8a4a 100%)" },
      { name: "সমুদ্র তীর",  css: "linear-gradient(180deg,#87ceeb 0%,#4facfe 40%,#c8a97e 80%,#f5deb3 100%)" },
      { name: "শরতের পাতা",  css: "linear-gradient(135deg,#f7971e,#d4a843,#8b4513)" },
      { name: "সূর্যোদয়",    css: "linear-gradient(180deg,#ff6b35 0%,#f7c59f 40%,#ffe8d6 100%)" },
      { name: "রাতের জঙ্গল", css: "linear-gradient(180deg,#000 0%,#0d1f0d 50%,#1a3a1a 100%)" },
    ],
  },
  {
    label: "🎨 আর্টিস্টিক",
    bgs: [
      { name: "গোল্ড ফয়েল",   css: "linear-gradient(135deg,#b8860b,#ffd700,#daa520,#b8860b,#ffd700)" },
      { name: "সিলভার শিন",   css: "linear-gradient(135deg,#bdc3c7,#ecf0f1,#bdc3c7,#95a5a6)" },
      { name: "মার্বেল",       css: "linear-gradient(135deg,#f5f5f5,#e0e0e0,#bdbdbd,#f5f5f5,#e0e0e0)" },
      { name: "নিয়ন গ্লো",     css: "linear-gradient(135deg,#000,#0d1b2a,#00ff88,#0d1b2a,#000)" },
      { name: "পেস্টেল ড্রিম",  css: "linear-gradient(135deg,#ffeaa7,#dfe6e9,#fd79a8,#a29bfe)" },
      { name: "ভিনটেজ পেপার",  css: "linear-gradient(135deg,#f5e6d3,#e8d5b7,#d4b896)" },
    ],
  },
];

const AUTHOR_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";

const QUICK_COLORS = [
  "#FFFFFF","#000000","#D4A843","#E8D5A3","#FF6B6B","#4ECDC4",
  "#45B7D1","#96CEB4","#FF9FF3","#54A0FF","#5F27CD","#00D2D3",
  "#FF9F43","#EE5A24","#C8D6E5","#8395A7",
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
  rotation: number;
  letterSpacing: number;
}

interface StickerLayer {
  id: string;
  kind: "sticker";
  emoji: string;
  x: number; y: number;
  size: number;
  rotation: number;
}

interface PipLayer {
  id: string;
  src: string;
  x: number; // 0-1 relative to cardW
  y: number; // 0-1 relative to cardH
  w: number; // 0-1 relative to cardW
  h: number; // 0-1 relative to cardH
  rotation: number;
  opacity: number;
  shape: "rect" | "circle" | "rounded";
}

type ActiveTool = "canvas" | "text" | "inlinetext" | "sticker" | "filter" | "adjust" | "bgwall" | "bgphoto" | "upscale" | "crop" | "draw" | "pip" | "imgmove" | null;
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
      x: 0.5, y: 0.22, fontSize: 52, baseFontSize: 52, fontKey: "AdorshoLipi",
      color: themeText, bold: true,  italic: false, align: "center",
      shadow: false, outline: false, outlineColor: "#000000",
      visible: true, lineHeight: 1.3, opacity: 100, rotation: 0, letterSpacing: 0 },
    { id: "body",   kind: "body",   text: "",
      x: 0.5, y: 0.52, fontSize: 36, baseFontSize: 36, fontKey: "AdorshoLipi",
      color: themeText, bold: false, italic: false, align: "center",
      shadow: false, outline: false, outlineColor: "#000000",
      visible: true, lineHeight: 1.9, opacity: 100, rotation: 0, letterSpacing: 0 },
    { id: "author", kind: "author", text: "",
      x: 0.5, y: 0.84, fontSize: 28, baseFontSize: 28, fontKey: "AdorshoLipi",
      color: themeText, bold: false, italic: false, align: "center",
      shadow: false, outline: false, outlineColor: "#000000",
      visible: true, lineHeight: 1.4, opacity: 100, rotation: 0, letterSpacing: 0 },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// FontItem: loads font on mount and shows preview in correct font
function FontItem({ fontKey, fontName, isSelected, onClick }: {
  fontKey: string; fontName: string; isSelected: boolean; onClick: () => void;
}) {
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    let cancelled = false;
    const url = FONT_URLS[fontKey];
    if (!url) { setLoaded(true); return; }
    const face = new FontFace(fontKey, `url(${url})`);
    face.load().then(() => {
      (document.fonts as FontFaceSet).add(face);
      if (!cancelled) setLoaded(true);
    }).catch(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [fontKey]);
  return (
    <button onClick={onClick} style={{
      padding: "12px 16px", borderRadius: 10, textAlign: "left",
      border: `1px solid ${isSelected ? "#D4A843" : "#1e3050"}`,
      background: isSelected ? "rgba(212,168,67,0.1)" : "#060c18",
      cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <span style={{ fontFamily: loaded ? `'${fontKey}', serif` : "serif", fontSize: 18, color: "#fff",
        opacity: loaded ? 1 : 0.5, transition: "opacity 0.3s" }}>আমার বাংলা</span>
      <span style={{ fontSize: 11, color: isSelected ? "#D4A843" : "#6b7280" }}>{fontName}</span>
    </button>
  );
}

function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 16px", borderBottom: "1px solid #1e3050", flexShrink: 0,
      background: "#0d1420",
      position: "sticky", top: 0, zIndex: 2,
    }}>
      <span style={{ color: "#D4A843", fontWeight: 700, fontSize: 14 }}>{title}</span>
      <button onClick={onClose} style={{
        background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
        color: "#ef4444", fontSize: 16, cursor: "pointer", padding: "4px 10px",
        borderRadius: 8, lineHeight: 1, fontWeight: 700,
      }}>✕</button>
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
// Upscale Panel
// ─────────────────────────────────────────────────────────────────────────────

function UpscalePanel({ onClose }: { onClose: () => void }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imgName, setImgName] = useState("image.png");
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [upscaleScale, setUpscaleScale] = useState<2 | 4>(2);
  const [sharpness, setSharpness] = useState(70);
  const [denoise, setDenoise] = useState(25);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [showAfter, setShowAfter] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setImgName(f.name);
    const r = new FileReader();
    r.onload = ev => {
      const src = ev.target?.result as string;
      setImgSrc(src);
      setResultSrc(null);
      const img = new Image();
      img.onload = () => setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = src;
    };
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const processUpscale = async () => {
    if (!imgSrc) return;
    setProcessing(true); setProgress(0); setResultSrc(null);
    try {
      setProgress(20);
      const img = new Image();
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = imgSrc; });
      setProgress(40);
      const W = img.naturalWidth * upscaleScale;
      const H = img.naturalHeight * upscaleScale;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, W, H);
      setProgress(70);
      if (sharpness > 0) {
        const amount = sharpness / 100;
        const blurCanvas = document.createElement("canvas");
        blurCanvas.width = W; blurCanvas.height = H;
        const bCtx = blurCanvas.getContext("2d")!;
        bCtx.filter = `blur(${Math.max(1, Math.round(amount * 3))}px)`;
        bCtx.drawImage(canvas, 0, 0);
        const orig = ctx.getImageData(0, 0, W, H);
        const blurred = bCtx.getImageData(0, 0, W, H);
        const out = new Uint8ClampedArray(orig.data.length);
        for (let i = 0; i < orig.data.length; i += 4) {
          for (let c = 0; c < 3; c++) {
            out[i+c] = Math.min(255, Math.max(0, orig.data[i+c] + amount * 1.5 * (orig.data[i+c] - blurred.data[i+c])));
          }
          out[i+3] = orig.data[i+3];
        }
        ctx.putImageData(new ImageData(out, W, H), 0, 0);
      }
      setProgress(90);
      const ext = imgName.toLowerCase().match(/\.jpe?g$/) ? "image/jpeg" : "image/png";
      setResultSrc(canvas.toDataURL(ext, 0.95));
      setProgress(100);
    } catch (err) {
      console.error("Upscale error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultSrc) return;
    const ext = imgName.toLowerCase().match(/\.jpe?g$/) ? "jpg" : "png";
    const W = imgSize.w * upscaleScale, H = imgSize.h * upscaleScale;
    const a = document.createElement("a");
    a.href = resultSrc;
    a.download = `upscaled_${upscaleScale}x_${W}x${H}.${ext}`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <>
      <PanelHeader title="🔍 4K ফটো আপস্কেল" onClose={onClose} />
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {!imgSrc ? (
          <div onClick={() => inputRef.current?.click()} style={{
            width: "100%", height: 100,
            border: "2px dashed #1e3050", borderRadius: 14, cursor: "pointer",
            background: "rgba(30,48,80,0.3)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <div style={{ fontSize: 32 }}>📁</div>
            <p style={{ color: "#D4A843", fontSize: 13, fontWeight: 700, margin: 0 }}>ছবি আপলোড করুন</p>
            <p style={{ color: "#6b7280", fontSize: 11, margin: 0 }}>JPG · PNG · WEBP</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {resultSrc && (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setShowAfter(false)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
                  border: `2px solid ${!showAfter ? "#D4A843" : "#1e3050"}`,
                  background: !showAfter ? "rgba(212,168,67,0.15)" : "transparent",
                  color: !showAfter ? "#D4A843" : "#6b7280", cursor: "pointer" }}>আগে</button>
                <button onClick={() => setShowAfter(true)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
                  border: `2px solid ${showAfter ? "#4ade80" : "#1e3050"}`,
                  background: showAfter ? "rgba(74,222,128,0.12)" : "transparent",
                  color: showAfter ? "#4ade80" : "#6b7280", cursor: "pointer" }}>পরে (ক্লিয়ার)</button>
              </div>
            )}
            <div style={{ position: "relative", borderRadius: 12, overflow: "hidden",
              border: `2px solid ${resultSrc ? (showAfter ? "#4ade80" : "#D4A843") : "#D4A843"}` }}>
              <img src={showAfter && resultSrc ? resultSrc : imgSrc} alt="preview"
                style={{ width: "100%", display: "block", maxHeight: 180, objectFit: "contain", background: "#060c18" }} />
              <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,0.75)", borderRadius: 6, padding: "3px 8px" }}>
                <span style={{ color: showAfter && resultSrc ? "#4ade80" : "#D4A843", fontSize: 11, fontWeight: 700 }}>
                  {showAfter && resultSrc ? `✨ ${imgSize.w * upscaleScale}×${imgSize.h * upscaleScale}px` : `${imgSize.w}×${imgSize.h}px`}
                </span>
              </div>
            </div>
            <button onClick={() => inputRef.current?.click()} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #1e3050",
              background: "transparent", color: "#9ca3af", fontSize: 11, cursor: "pointer" }}>
              🔄 অন্য ছবি বেছে নিন
            </button>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

        <div>
          <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>আপস্কেল গুণক</p>
          <div style={{ display: "flex", gap: 8 }}>
            {([2, 4] as const).map(s => (
              <button key={s} onClick={() => { setUpscaleScale(s); setResultSrc(null); }}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  border: `2px solid ${upscaleScale === s ? "#D4A843" : "#1e3050"}`,
                  background: upscaleScale === s ? "rgba(212,168,67,0.15)" : "transparent",
                  color: upscaleScale === s ? "#D4A843" : "#6b7280", cursor: "pointer" }}>
                <div>{s}×</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>
                  {imgSrc ? `${imgSize.w * s}×${imgSize.h * s}` : (s === 2 ? "2K" : "4K")}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: "#060c18", borderRadius: 12, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ color: "#D4A843", fontSize: 12, fontWeight: 700, margin: 0 }}>🔬 শার্পনিং সেটিংস</p>
          <SliderRow label="শার্পনেস" val={sharpness} set={v => { setSharpness(v); setResultSrc(null); }} min={0} max={100} unit="%" />
          <SliderRow label="ডিনয়েজ"  val={denoise}   set={v => { setDenoise(v);   setResultSrc(null); }} min={0} max={80}  unit="%" />
        </div>

        {processing && (
          <div style={{ background: "#060c18", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#D4A843", fontSize: 12, fontWeight: 700 }}>প্রক্রিয়া হচ্ছে...</span>
              <span style={{ color: "#D4A843", fontSize: 12 }}>{progress}%</span>
            </div>
            <div style={{ height: 6, background: "#1e3050", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#D4A843,#4ade80)",
                borderRadius: 3, transition: "width 0.3s" }} />
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={processUpscale} disabled={!imgSrc || processing}
            style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
              background: !imgSrc ? "#1e3050" : processing ? "rgba(212,168,67,0.4)" : "linear-gradient(135deg,#D4A843,#b8892a)",
              color: !imgSrc ? "#6b7280" : "#000", fontWeight: 700, fontSize: 13,
              cursor: !imgSrc || processing ? "not-allowed" : "pointer" }}>
            {processing ? "⏳ হচ্ছে..." : "🔍 আপস্কেল করুন"}
          </button>
          {resultSrc && (
            <button onClick={downloadResult}
              style={{ padding: "12px 16px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#4ade80,#22c55e)",
                color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              ⬇️
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BgWall Panel
// ─────────────────────────────────────────────────────────────────────────────

function BgWallPanel({ onClose, onSelect, selected }: {
  onClose: () => void;
  onSelect: (css: string) => void;
  selected: string;
}) {
  const [activeCat, setActiveCat] = useState(0);
  const cat = BG_CATEGORIES[activeCat];

  return (
    <>
      <PanelHeader title="🖼️ ব্যাকগ্রাউন্ড ওয়াল" onClose={onClose} />
      <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid #1e3050",
        flexShrink: 0, padding: "0 8px", scrollbarWidth: "none" }}>
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
      <div style={{ padding: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {cat.bgs.map((bg, i) => (
            <button key={i} onClick={() => onSelect(bg.css)}
              style={{
                position: "relative", aspectRatio: "1/1", borderRadius: 10, cursor: "pointer",
                border: `3px solid ${selected === bg.css ? "#D4A843" : "transparent"}`,
                background: bg.css, overflow: "hidden", padding: 0,
                boxShadow: selected === bg.css ? "0 0 0 2px #D4A843" : "none",
              }}>
              {selected === bg.css && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
                  justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>
                  <span style={{ fontSize: 18 }}>✅</span>
                </div>
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0,
                background: "rgba(0,0,0,0.6)", padding: "2px 4px" }}>
                <span style={{ color: "#fff", fontSize: 9, fontWeight: 600 }}>{bg.name}</span>
              </div>
            </button>
          ))}
        </div>
        {selected && (
          <button onClick={() => onSelect("")}
            style={{ width: "100%", marginTop: 10, padding: "8px 0", borderRadius: 8, border: "1px solid #ef4444",
              background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            ✕ ব্যাকগ্রাউন্ড সরান
          </button>
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
  const [bgWallCss, setBgWallCss]     = useState("");

  const [brightness, setBrightness]   = useState(100);
  const [contrast, setContrast]       = useState(100);
  const [saturation, setSaturation]   = useState(100);
  const [blur, setBlur]               = useState(0);
  const [vignette, setVignette]       = useState(0);

  const [textLayers, setTextLayers]   = useState<TextBlock[]>(() => makeDefaultLayers(THEMES[2].text));
  const [stickers, setStickers]       = useState<StickerLayer[]>([]);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [dragging, setDragging]       = useState<{
    id: string; isSticker: boolean;
    startX: number; startY: number; origX: number; origY: number;
  } | null>(null);
  const [textBoxSizes, setTextBoxSizes] = useState<Record<string, { w: number; h: number }>>({});
  const [editingInlineId, setEditingInlineId] = useState<string | null>(null);
  const [editingInlineText, setEditingInlineText] = useState("");
  const pinchRef = useRef<{ dist: number; origSize: number; id: string } | null>(null);

  const [activeTool, setActiveTool]   = useState<ActiveTool>(null);
  const [downloading, setDownloading] = useState(false);
  const [exportQuality, setExportQuality] = useState<ExportQuality>("2x");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [scale, setScale]             = useState(0.36);
  const [activeStickerCat, setActiveStickerCat] = useState(0);
  const [textSubTab, setTextSubTab]   = useState<"content" | "style" | "font">("content");

  const [inlineTextPos, setInlineTextPos] = useState<{ x: number; y: number } | null>(null);
  const [inlineTextValue, setInlineTextValue] = useState("");
  const inlineTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [drawTool, setDrawTool]       = useState<DrawTool>("pencil");
  const [drawColor, setDrawColor]     = useState("#D4A843");
  const [drawWidth, setDrawWidth]     = useState(4);
  const [drawOpacity, setDrawOpacity] = useState(100);
  const isDrawingRef                  = useRef(false);
  const lastDrawPos                   = useRef<{ x: number; y: number } | null>(null);
  const drawStartPos                  = useRef<{ x: number; y: number } | null>(null);
  const drawSnapshot                  = useRef<ImageData | null>(null);

  // ── Photo position, rotation, crop state ──────────────────────────────────
  const [photoX, setPhotoX]           = useState(50); // 0-100 background-position-x
  const [photoY, setPhotoY]           = useState(50); // 0-100 background-position-y
  const [photoRotation, setPhotoRotation] = useState(0); // degrees
  const [photoScale, setPhotoScale]   = useState(100); // 100 = cover, >100 = zoom in
  const [photoFlipH, setPhotoFlipH]   = useState(false);
  const [photoFlipV, setPhotoFlipV]   = useState(false);
  // Crop state (values in 0-100 percent of image)
  const [cropMode, setCropMode]       = useState(false);
  const [cropX, setCropX]             = useState(0);
  const [cropY, setCropY]             = useState(0);
  const [cropW, setCropW]             = useState(100);
  const [cropH, setCropH]             = useState(100);
  const [croppedSrc, setCroppedSrc]   = useState<string | null>(null);
  const cropDragRef = useRef<{ corner: string; startX: number; startY: number; origCrop: { x: number; y: number; w: number; h: number } } | null>(null);

  // ── In-canvas photo drag-to-move ─────────────────────────────────────────
  const [draggingPhoto, setDraggingPhoto] = useState<{
    startX: number; startY: number; origX: number; origY: number;
  } | null>(null);

  // ── In-canvas crop overlay drag ───────────────────────────────────────────
  // cropOverlayDrag: which handle is being dragged on the visual crop overlay
  const [cropOverlayDrag, setCropOverlayDrag] = useState<{
    handle: "tl"|"tr"|"bl"|"br"|"move";
    startX: number; startY: number;
    origCrop: { x: number; y: number; w: number; h: number };
  } | null>(null);

  // ── PIP (Picture-in-Picture) layers ───────────────────────────────────────
  const [pipLayers, setPipLayers]     = useState<PipLayer[]>([]);
  const [selectedPipId, setSelectedPipId] = useState<string | null>(null);
  const [draggingPip, setDraggingPip] = useState<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const pipFileRef = useRef<HTMLInputElement>(null);

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

  // ── Preload all fonts on mount ───────────────────────────────────────────────
  useEffect(() => {
    // Load all fonts in background so they're ready when selected
    const loadAllFonts = async () => {
      const fontKeys = Object.keys(FONT_URLS);
      // Load first 5 fonts immediately (most common ones)
      const priority = ["AdorshoLipi", "ChandraSheela", "MahbubSardarSabujFont", "MasudNandanik", "ChandraSheelaPremium"];
      await Promise.all(priority.map(k => ensureFontLoaded(k)));
      // Load rest in background
      fontKeys.filter(k => !priority.includes(k)).forEach(k => ensureFontLoaded(k));
    };
    loadAllFonts();
  }, []);

  // ── Sync text color with theme ─────────────────────────────────────────────
  useEffect(() => {
    setTextLayers(prev => prev.map(l => ({ ...l, color: theme.text })));
  }, [themeIdx]);

  // ── Scale canvas to fit viewport — FIXED ──────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (!previewRef.current) return;
      const cw = previewRef.current.clientWidth - 24; // 12px padding each side
      // Available height: viewport - navbar(70) - topbar(~70) - toolbar(~72) - some margin
      const availH = window.innerHeight - 70 - 70 - 72 - 20;
      const maxH = Math.max(180, Math.min(availH, 380));
      setScale(Math.min(cw / cardW, maxH / cardH, 0.85));
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
    if (activeTool === "draw") return;
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
      ctx.strokeStyle = drawColor; ctx.lineWidth = drawWidth;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.lineTo(pos.x, pos.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    } else if (drawTool === "brush") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = drawColor; ctx.lineWidth = drawWidth * 3;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.shadowBlur = drawWidth * 2; ctx.shadowColor = drawColor;
      ctx.lineTo(pos.x, pos.y); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    } else if (drawTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = drawWidth * 4; ctx.lineCap = "round";
      ctx.lineTo(pos.x, pos.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    } else {
      if (drawSnapshot.current) ctx.putImageData(drawSnapshot.current, 0, 0);
      ctx.globalAlpha = drawOpacity / 100;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = drawColor; ctx.lineWidth = drawWidth; ctx.lineCap = "round";
      const sp = drawStartPos.current!;
      ctx.beginPath();
      if (drawTool === "line") {
        ctx.moveTo(sp.x, sp.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
      } else if (drawTool === "rect") {
        ctx.strokeRect(sp.x, sp.y, pos.x - sp.x, pos.y - sp.y);
      } else if (drawTool === "circle") {
        const rx = Math.abs(pos.x - sp.x) / 2, ry = Math.abs(pos.y - sp.y) / 2;
        const cx2 = sp.x + (pos.x - sp.x) / 2, cy2 = sp.y + (pos.y - sp.y) / 2;
        ctx.ellipse(cx2, cy2, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
      } else if (drawTool === "arrow") {
        const dx = pos.x - sp.x, dy = pos.y - sp.y;
        const angle = Math.atan2(dy, dx);
        const headLen = Math.min(30, Math.sqrt(dx*dx+dy*dy) * 0.3);
        ctx.moveTo(sp.x, sp.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x - headLen * Math.cos(angle - Math.PI/6), pos.y - headLen * Math.sin(angle - Math.PI/6));
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x - headLen * Math.cos(angle + Math.PI/6), pos.y - headLen * Math.sin(angle + Math.PI/6));
        ctx.stroke();
      }
    }
    lastDrawPos.current = pos;
  }, [activeTool, drawTool, drawColor, drawWidth, drawOpacity, getDrawPos]);

  const onDrawPointerUp = useCallback(() => {
    isDrawingRef.current = false;
    lastDrawPos.current = null;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowBlur = 0;
    ctx.beginPath();
    drawSnapshot.current = null;
  }, []);

  // ── Text helpers ──────────────────────────────────────────────────────────
  const updateText = (id: string, patch: Partial<TextBlock>) => {
    // If fontKey is being changed, load the font first
    if (patch.fontKey) {
      ensureFontLoaded(patch.fontKey);
    }
    setTextLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  };

  const addCustomText = () => {
    const id = uid();
    setTextLayers(prev => [...prev, {
      id, kind: "custom", text: "নতুন লেখা",
      x: 0.5, y: 0.5, fontSize: 40, baseFontSize: 40, fontKey: "AdorshoLipi",
      color: theme.text, bold: false, italic: false, align: "center",
      shadow: false, outline: false, outlineColor: "#000000",
      visible: true, lineHeight: 1.6, opacity: 100, rotation: 0, letterSpacing: 0,
    }]);
    setTextBoxSizes(prev => ({ ...prev, [id]: { w: 0.7, h: 0.15 } }));
    setSelectedId(id);
    setActiveTool("text");
    setTextSubTab("style");
  };

  const commitInlineText = () => {
    if (!inlineTextPos || !inlineTextValue.trim()) {
      setInlineTextPos(null); setInlineTextValue(""); return;
    }
    const id = uid();
    setTextLayers(prev => [...prev, {
      id, kind: "custom", text: inlineTextValue,
      x: inlineTextPos.x / cardW, y: inlineTextPos.y / cardH,
      fontSize: 40, baseFontSize: 40, fontKey: "AdorshoLipi",
      color: theme.text, bold: false, italic: false, align: "left",
      shadow: false, outline: false, outlineColor: "#000000",
      visible: true, lineHeight: 1.6, opacity: 100, rotation: 0, letterSpacing: 0,
    }]);
    setTextBoxSizes(prev => ({ ...prev, [id]: { w: 0.7, h: 0.15 } }));
    setSelectedId(id);
    setInlineTextPos(null); setInlineTextValue("");
  };

  const addSticker = (emoji: string) => {
    const id = uid();
    setStickers(prev => [...prev, { id, kind: "sticker", emoji, x: 0.5, y: 0.35, size: 80, rotation: 0 }]);
    setSelectedId(id);
  };

  const removeLayer = (id: string) => {
    setTextLayers(prev =>
      prev.map(l => l.id === id && l.kind !== "custom" ? { ...l, visible: false, text: "" } : l)
          .filter(l => !(l.id === id && l.kind === "custom"))
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
    r.onload = ev => {
      setPhotoImage(ev.target?.result as string);
      // Auto-activate imgmove so user can immediately drag the photo
      setActiveTool("imgmove");
      // Reset transforms for fresh start
      setPhotoX(50); setPhotoY(50);
      setPhotoRotation(0); setPhotoScale(100);
      setPhotoFlipH(false); setPhotoFlipV(false);
      setCropX(0); setCropY(0); setCropW(100); setCropH(100);
      setCroppedSrc(null);
    };
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

  // ── PIP upload ────────────────────────────────────────────────────────────
  const onPipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      const src = ev.target?.result as string;
      const newPip: PipLayer = {
        id: uid(), src,
        x: 0.1, y: 0.1,
        w: 0.4, h: 0.35,
        rotation: 0, opacity: 100,
        shape: "rounded",
      };
      setPipLayers(prev => [...prev, newPip]);
      setSelectedPipId(newPip.id);
      setActiveTool("pip");
    };
    r.readAsDataURL(f);
    e.target.value = "";
  };

  // ── PIP drag ──────────────────────────────────────────────────────────────
  const startPipDrag = (
    e: React.MouseEvent | React.TouchEvent,
    id: string, ox: number, oy: number
  ) => {
    e.stopPropagation();
    const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
    const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDraggingPip({ id, startX: cx, startY: cy, origX: ox, origY: oy });
    setSelectedPipId(id);
  };

  useEffect(() => {
    if (!draggingPip) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const cx = "touches" in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const cy = "touches" in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      const dx = (cx - draggingPip.startX) / (cardW * scale);
      const dy = (cy - draggingPip.startY) / (cardH * scale);
      const nx = Math.max(0, Math.min(0.98, draggingPip.origX + dx));
      const ny = Math.max(0, Math.min(0.98, draggingPip.origY + dy));
      setPipLayers(prev => prev.map(p => p.id === draggingPip.id ? { ...p, x: nx, y: ny } : p));
    };
    const onUp = () => setDraggingPip(null);
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
  }, [draggingPip, cardW, cardH, scale]);

  // ── In-canvas photo drag-to-move handler ────────────────────────────────
  useEffect(() => {
    if (!draggingPhoto) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const cx = "touches" in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const cy = "touches" in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      // Each pixel moved = how many percent of background-position
      // The image is scaled to photoScale%, so 1px on canvas = 100/(cardW*scale) in bg-pos units
      const sensitivity = 0.15; // tuned for smooth feel
      const dx = (cx - draggingPhoto.startX) * sensitivity;
      const dy = (cy - draggingPhoto.startY) * sensitivity;
      const nx = Math.max(0, Math.min(100, draggingPhoto.origX - dx));
      const ny = Math.max(0, Math.min(100, draggingPhoto.origY - dy));
      setPhotoX(nx);
      setPhotoY(ny);
    };
    const onUp = () => setDraggingPhoto(null);
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
  }, [draggingPhoto]);

  // ── In-canvas crop overlay drag handler ───────────────────────────────
  useEffect(() => {
    if (!cropOverlayDrag) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const cx = "touches" in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const cy = "touches" in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      // Convert pixel delta to percent of canvas
      const dx = (cx - cropOverlayDrag.startX) / (cardW * scale) * 100;
      const dy = (cy - cropOverlayDrag.startY) / (cardH * scale) * 100;
      const o = cropOverlayDrag.origCrop;
      let nx = o.x, ny = o.y, nw = o.w, nh = o.h;
      if (cropOverlayDrag.handle === "move") {
        nx = Math.max(0, Math.min(100 - o.w, o.x + dx));
        ny = Math.max(0, Math.min(100 - o.h, o.y + dy));
      } else if (cropOverlayDrag.handle === "tl") {
        nx = Math.max(0, Math.min(o.x + o.w - 10, o.x + dx));
        ny = Math.max(0, Math.min(o.y + o.h - 10, o.y + dy));
        nw = o.w - (nx - o.x);
        nh = o.h - (ny - o.y);
      } else if (cropOverlayDrag.handle === "tr") {
        ny = Math.max(0, Math.min(o.y + o.h - 10, o.y + dy));
        nw = Math.max(10, Math.min(100 - o.x, o.w + dx));
        nh = o.h - (ny - o.y);
      } else if (cropOverlayDrag.handle === "bl") {
        nx = Math.max(0, Math.min(o.x + o.w - 10, o.x + dx));
        nw = o.w - (nx - o.x);
        nh = Math.max(10, Math.min(100 - o.y, o.h + dy));
      } else if (cropOverlayDrag.handle === "br") {
        nw = Math.max(10, Math.min(100 - o.x, o.w + dx));
        nh = Math.max(10, Math.min(100 - o.y, o.h + dy));
      }
      setCropX(Math.round(nx)); setCropY(Math.round(ny));
      setCropW(Math.round(nw)); setCropH(Math.round(nh));
    };
    const onUp = () => setCropOverlayDrag(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [cropOverlayDrag, cardW, cardH, scale]);

  // ── Crop helper ───────────────────────────────────────────────────────────
  const applyCrop = useCallback(() => {
    if (!photoImage) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const sw = img.naturalWidth * (cropW / 100);
      const sh = img.naturalHeight * (cropH / 100);
      const sx = img.naturalWidth * (cropX / 100);
      const sy = img.naturalHeight * (cropY / 100);
      canvas.width = sw; canvas.height = sh;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const cropped = canvas.toDataURL("image/png");
      setCroppedSrc(cropped);
      setPhotoImage(cropped);
      setCropMode(false);
      setCropX(0); setCropY(0); setCropW(100); setCropH(100);
    };
    img.src = photoImage;
  }, [photoImage, cropX, cropY, cropW, cropH]);

  // ── Canvas export ─────────────────────────────────────────────────────────
  const buildCanvas = useCallback(async (dpr: number): Promise<HTMLCanvasElement> => {
    await Promise.all(textLayers.map(l => ensureFontLoaded(l.fontKey)));
    await document.fonts.ready;
    const canvas = document.createElement("canvas");
    canvas.width = cardW * dpr; canvas.height = cardH * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    if (bgWallCss) {
      if (bgWallCss.startsWith("linear-gradient") || bgWallCss.startsWith("radial-gradient")) {
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
      ctx.fillRect(0, 0, cardW, cardH);
    } else {
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, cardW, cardH);
    }

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

    const loadPhotoWithTransform = (src: string, opacity: number, filter?: string) =>
      new Promise<void>(res => {
        const img = new Image(); img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          if (filter && filter !== "none") ctx.filter = filter;
          ctx.globalAlpha = opacity;
          // Apply rotation and flip
          ctx.translate(cardW / 2, cardH / 2);
          ctx.rotate((photoRotation * Math.PI) / 180);
          ctx.scale(photoFlipH ? -1 : 1, photoFlipV ? -1 : 1);
          const scl = photoScale / 100;
          const ia = img.naturalWidth / img.naturalHeight, ca = cardW / cardH;
          let sw = img.naturalWidth, sh = img.naturalHeight;
          let dw = cardW * scl, dh = cardH * scl;
          if (ia > ca) { dw = dh * ia; }
          else { dh = dw / ia; }
          // Apply position offset
          const offX = ((photoX - 50) / 50) * (dw - cardW) / 2;
          const offY = ((photoY - 50) / 50) * (dh - cardH) / 2;
          ctx.drawImage(img, 0, 0, sw, sh, -dw/2 - offX, -dh/2 - offY, dw, dh);
          ctx.restore(); res();
        };
        img.onerror = () => res(); img.src = src;
      });

    const loadPipImg = (pip: PipLayer) =>
      new Promise<void>(res => {
        const img = new Image(); img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          ctx.globalAlpha = pip.opacity / 100;
          const px = pip.x * cardW, py = pip.y * cardH;
          const pw = pip.w * cardW, ph = pip.h * cardH;
          ctx.translate(px + pw / 2, py + ph / 2);
          ctx.rotate((pip.rotation * Math.PI) / 180);
          if (pip.shape === "circle") {
            ctx.beginPath();
            ctx.ellipse(0, 0, pw / 2, ph / 2, 0, 0, Math.PI * 2);
            ctx.clip();
          } else if (pip.shape === "rounded") {
            const r = Math.min(pw, ph) * 0.1;
            ctx.beginPath();
            ctx.roundRect(-pw/2, -ph/2, pw, ph, r);
            ctx.clip();
          }
          ctx.drawImage(img, -pw / 2, -ph / 2, pw, ph);
          ctx.restore(); res();
        };
        img.onerror = () => res(); img.src = pip.src;
      });

    if (bgImage)    await loadImg(bgImage, bgOpacity / 100);
    if (photoImage) await loadPhotoWithTransform(photoImage, photoOpacity / 100, effectiveFilter);
    for (const pip of pipLayers) await loadPipImg(pip);
    if (showWatermark) await loadImg(AUTHOR_PHOTO, watermarkOpacity / 100);

    const drawCanvas = drawCanvasRef.current;
    if (drawCanvas) ctx.drawImage(drawCanvas, 0, 0, cardW, cardH);

    if (vignette > 0) {
      const vg = ctx.createRadialGradient(cardW/2, cardH/2, cardH*0.3, cardW/2, cardH/2, cardH*0.8);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, `rgba(0,0,0,${vignette / 100})`);
      ctx.fillStyle = vg; ctx.fillRect(0, 0, cardW, cardH);
    }

    ctx.strokeStyle = theme.border; ctx.lineWidth = 1.5;
    if (frame === "inner-border") { ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeRect(16, 16, cardW - 32, cardH - 32); ctx.restore(); }
    if (frame === "corner") {
      ctx.save(); ctx.globalAlpha = 0.7;
      [[16, 16, 1, 1], [cardW - 16, 16, -1, 1], [16, cardH - 16, 1, -1], [cardW - 16, cardH - 16, -1, -1]].forEach(([x, y, dx, dy]) => {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 50 * dx, y); ctx.moveTo(x, y); ctx.lineTo(x, y + 50 * dy); ctx.stroke();
      });
      ctx.restore();
    }

    for (const layer of textLayers) {
      if (!layer.visible || !layer.text.trim()) continue;
      await ensureFontLoaded(layer.fontKey);
      ctx.save();
      ctx.globalAlpha = (layer.opacity ?? 100) / 100;
      const fs = layer.fontSize;
      ctx.font = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}${fs}px ${FONT_CSS[layer.fontKey] || "'AdorshoLipi',serif"}`;
      ctx.fillStyle = layer.color;
      ctx.textAlign = layer.align;
      if (layer.shadow) { ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; }
      const boxW = (textBoxSizes[layer.id]?.w ?? 0.7) * cardW;
      const rot = layer.rotation ?? 0;
      if (rot !== 0) {
        ctx.translate(layer.x * cardW, layer.y * cardH);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.translate(-(layer.x * cardW), -(layer.y * cardH));
      }
      const lines = wrapText(ctx, layer.text, boxW);
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

    for (const s of stickers) {
      ctx.save();
      ctx.font = `${s.size}px serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.translate(s.x * cardW, s.y * cardH);
      ctx.rotate((s.rotation * Math.PI) / 180);
      ctx.fillText(s.emoji, 0, 0);
      ctx.restore();
    }

    return canvas;
  }, [textLayers, stickers, pipLayers, textBoxSizes, cardW, cardH, theme, bgWallCss, bgImage, bgOpacity, photoImage, photoOpacity, effectiveFilter, photoRotation, photoFlipH, photoFlipV, photoScale, photoX, photoY, showWatermark, watermarkOpacity, vignette, frame, padding]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const dpr = exportQuality === "1x" ? 1 : exportQuality === "2x" ? 2 : 4;
      const canvas = await buildCanvas(dpr);
      const mime = exportFormat === "jpg" ? "image/jpeg" : "image/png";
      const url = canvas.toDataURL(mime, 0.95);
      const a = document.createElement("a");
      a.href = url; a.download = `sardar-design-${Date.now()}.${exportFormat}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } finally {
      setDownloading(false);
    }
  };

  const toggleTool = (tool: ActiveTool) =>
    setActiveTool(prev => prev === tool ? null : tool);

  useEffect(() => {
    if (inlineTextPos && inlineTextareaRef.current) {
      setTimeout(() => inlineTextareaRef.current?.focus(), 50);
    }
  }, [inlineTextPos]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      height: "100dvh",
      background: "#0a0f1a",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      paddingTop: 70,
      overflow: "hidden",
    }}>
      <Seo title="ডিজাইন ফরম্যাট | মাহবুব সরদার সবুজ"
        description="প্রিমিয়াম বাংলা লেখার কার্ড ডিজাইন করুন" />
      <Navbar />

      {/* ── Top bar ── */}
      <div style={{
        background: "linear-gradient(180deg, #0a1020 0%, #0d1420 100%)",
        borderBottom: "1px solid rgba(212,168,67,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "10px 16px 8px",
        position: "relative",
        flexShrink: 0,
      }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'AkhandBengali','Noto Sans Bengali',sans-serif",
            fontSize: "clamp(1.1rem,4vw,1.5rem)",
            fontWeight: 800,
            background: "linear-gradient(135deg,#f5e27a 0%,#D4A843 50%,#b8892a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: 0, lineHeight: 1.2,
          }}>সরদার ডিজাইন স্টুডিও</h1>
          <p style={{
            fontFamily: "'Noto Sans Bengali',sans-serif",
            fontSize: "0.65rem", color: "rgba(212,168,67,0.5)",
            margin: "2px 0 0", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>মাহবুব সরদার সবুজ</p>
        </div>
        {/* Save button in top bar */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            display: "flex", alignItems: "center", gap: 5,
            padding: "7px 14px", borderRadius: 10, border: "none",
            background: downloading ? "rgba(212,168,67,0.4)" : "linear-gradient(135deg,#D4A843,#b8892a)",
            color: "#000", fontWeight: 700, fontSize: 12,
            cursor: downloading ? "not-allowed" : "pointer",
            boxShadow: "0 2px 12px rgba(212,168,67,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          {downloading ? "⏳" : "⬇️"} সেভ
        </button>
      </div>

      {/* ── Canvas workspace ── */}
      <div ref={previewRef} style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 12px 8px",
        overflow: "hidden",
        minHeight: 0,
        background: "#060c18",
      }}>
        <div
          style={{
            width: cardW * scale,
            height: cardH * scale,
            position: "relative",
            flexShrink: 0,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 16px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,168,67,0.15)",
            cursor: activeTool === "draw" ? "crosshair" : activeTool === "inlinetext" ? "text" : dragging ? "grabbing" : "default",
          }}
          onClick={(e) => {
            if (activeTool === "draw") return;
            if (activeTool === "inlinetext") {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              setInlineTextPos({ x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale });
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
              <div
                style={{
                  position: "absolute", inset: 0, zIndex: 2,
                  overflow: "hidden",
                  opacity: photoOpacity / 100,
                  cursor: activeTool === "imgmove" ? (draggingPhoto ? "grabbing" : "grab") : "default",
                }}
                onMouseDown={e => {
                  if (activeTool !== "imgmove") return;
                  e.stopPropagation();
                  setDraggingPhoto({ startX: e.clientX, startY: e.clientY, origX: photoX, origY: photoY });
                }}
                onTouchStart={e => {
                  if (activeTool !== "imgmove") return;
                  e.stopPropagation();
                  setDraggingPhoto({ startX: e.touches[0].clientX, startY: e.touches[0].clientY, origX: photoX, origY: photoY });
                }}
              >
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url(${photoImage})`,
                  backgroundSize: `${photoScale}%`,
                  backgroundPosition: `${photoX}% ${photoY}%`,
                  backgroundRepeat: "no-repeat",
                  filter: effectiveFilter,
                  transform: `rotate(${photoRotation}deg) scaleX(${photoFlipH ? -1 : 1}) scaleY(${photoFlipV ? -1 : 1})`,
                  transformOrigin: "center center",
                  pointerEvents: "none",
                }} />
                {/* Drag hint badge when imgmove is active */}
                {activeTool === "imgmove" && !draggingPhoto && (
                  <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "rgba(0,0,0,0.55)", borderRadius: 12,
                    padding: "8px 14px", pointerEvents: "none",
                    display: "flex", alignItems: "center", gap: 6,
                    border: "1.5px solid rgba(212,168,67,0.6)",
                    backdropFilter: "blur(4px)",
                  }}>
                    <span style={{ fontSize: Math.ceil(18 / scale) }}>✋</span>
                    <span style={{ color: "#D4A843", fontSize: Math.ceil(11 / scale), fontWeight: 700, whiteSpace: "nowrap" }}>টেনে সরান</span>
                  </div>
                )}
              </div>
            )}

            {/* Crop overlay — shown when activeTool === 'crop' and photoImage exists */}
            {activeTool === "crop" && photoImage && (() => {
              const ox = cropX / 100 * cardW;
              const oy = cropY / 100 * cardH;
              const ow = cropW / 100 * cardW;
              const oh = cropH / 100 * cardH;
              const hSz = Math.ceil(22 / scale); // handle size in canvas px
              const startOverlayDrag = (handle: "tl"|"tr"|"bl"|"br"|"move", e: React.MouseEvent | React.TouchEvent) => {
                e.stopPropagation();
                const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
                const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
                setCropOverlayDrag({ handle, startX: cx, startY: cy, origCrop: { x: cropX, y: cropY, w: cropW, h: cropH } });
              };
              return (
                <div style={{ position: "absolute", inset: 0, zIndex: 30, pointerEvents: "none" }}>
                  {/* Dark overlay outside crop area */}
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", pointerEvents: "none" }} />
                  {/* Bright crop window */}
                  <div style={{
                    position: "absolute",
                    left: ox, top: oy, width: ow, height: oh,
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
                    border: "2px solid #D4A843",
                    pointerEvents: "auto",
                    cursor: cropOverlayDrag?.handle === "move" ? "grabbing" : "move",
                  }}
                    onMouseDown={e => startOverlayDrag("move", e)}
                    onTouchStart={e => startOverlayDrag("move", e)}
                  >
                    {/* Rule-of-thirds grid lines */}
                    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                      {["33.3%", "66.6%"].map(p => (
                        <div key={p} style={{ position: "absolute", left: p, top: 0, bottom: 0, width: 1, background: "rgba(212,168,67,0.4)" }} />
                      ))}
                      {["33.3%", "66.6%"].map(p => (
                        <div key={p} style={{ position: "absolute", top: p, left: 0, right: 0, height: 1, background: "rgba(212,168,67,0.4)" }} />
                      ))}
                    </div>
                    {/* Corner handles */}
                    {(["tl", "tr", "bl", "br"] as const).map(corner => (
                      <div key={corner}
                        onMouseDown={e => { e.stopPropagation(); startOverlayDrag(corner, e); }}
                        onTouchStart={e => { e.stopPropagation(); startOverlayDrag(corner, e); }}
                        style={{
                          position: "absolute",
                          width: hSz, height: hSz,
                          background: "#D4A843",
                          borderRadius: 3,
                          cursor: corner === "tl" || corner === "br" ? "nwse-resize" : "nesw-resize",
                          ...(corner === "tl" ? { top: -hSz/2, left: -hSz/2 } :
                              corner === "tr" ? { top: -hSz/2, right: -hSz/2 } :
                              corner === "bl" ? { bottom: -hSz/2, left: -hSz/2 } :
                                               { bottom: -hSz/2, right: -hSz/2 }),
                        }}
                      />
                    ))}
                    {/* Apply crop button inside overlay */}
                    <div style={{
                      position: "absolute", bottom: -hSz * 2.5, left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex", gap: 6, pointerEvents: "auto",
                    }}>
                      <button
                        onMouseDown={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); applyCrop(); }}
                        style={{
                          padding: `${Math.ceil(5/scale)}px ${Math.ceil(12/scale)}px`,
                          borderRadius: Math.ceil(8/scale),
                          border: "none",
                          background: "linear-gradient(135deg,#D4A843,#b8892a)",
                          color: "#000", fontWeight: 700,
                          fontSize: Math.ceil(11/scale),
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                        }}>
                        ✂️ ক্রপ
                      </button>
                      <button
                        onMouseDown={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); setCropX(0); setCropY(0); setCropW(100); setCropH(100); }}
                        style={{
                          padding: `${Math.ceil(5/scale)}px ${Math.ceil(10/scale)}px`,
                          borderRadius: Math.ceil(8/scale),
                          border: `1px solid rgba(212,168,67,0.5)`,
                          background: "rgba(13,20,32,0.85)",
                          color: "#D4A843", fontWeight: 600,
                          fontSize: Math.ceil(11/scale),
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}>
                        রিসেট
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
            {showWatermark && (
              <div style={{ position: "absolute", inset: 0, zIndex: 3,
                backgroundImage: `url(${AUTHOR_PHOTO})`, backgroundSize: "cover", backgroundPosition: "center top",
                opacity: watermarkOpacity / 100, pointerEvents: "none" }} />
            )}

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
              const isSelected = selectedId === layer.id;
              const boxSize = textBoxSizes[layer.id] ?? { w: 0.7, h: 0.15 };
              const boxW = boxSize.w * cardW;
              const handleSz = Math.ceil(32 / scale);
              const rot = layer.rotation ?? 0;
              const isEditingInline = editingInlineId === layer.id;

              return (
                <div key={layer.id}
                  onMouseDown={e => {
                    const target = e.target as HTMLElement;
                    if (target.dataset.edit || target.dataset.del) return;
                    if (isEditingInline) return;
                    startDrag(e, layer.id, false, layer.x, layer.y);
                  }}
                  onTouchStart={e => {
                    const target = e.target as HTMLElement;
                    if (target.dataset.edit || target.dataset.del) return;
                    if (isEditingInline) return;
                    if (e.touches.length === 2) {
                      const dx = e.touches[0].clientX - e.touches[1].clientX;
                      const dy = e.touches[0].clientY - e.touches[1].clientY;
                      const dist = Math.sqrt(dx * dx + dy * dy);
                      pinchRef.current = { dist, origSize: layer.fontSize, id: layer.id };
                      setTextLayers(prev => prev.map(l => l.id === layer.id ? { ...l, baseFontSize: l.fontSize } : l));
                      return;
                    }
                    startDrag(e, layer.id, false, layer.x, layer.y);
                  }}
                  onTouchMove={e => {
                    if (e.touches.length === 2 && pinchRef.current?.id === layer.id) {
                      e.stopPropagation();
                      e.preventDefault();
                      const dx = e.touches[0].clientX - e.touches[1].clientX;
                      const dy = e.touches[0].clientY - e.touches[1].clientY;
                      const dist = Math.sqrt(dx * dx + dy * dy);
                      const ratio = dist / pinchRef.current.dist;
                      const newSize = Math.round(Math.max(8, Math.min(300, pinchRef.current.origSize * ratio)));
                      setTextLayers(prev => prev.map(l => l.id === layer.id ? { ...l, fontSize: newSize } : l));
                    }
                  }}
                  onTouchEnd={e => { if (pinchRef.current?.id === layer.id) e.stopPropagation(); pinchRef.current = null; }}
                  onClick={e => { e.stopPropagation(); if (isEditingInline) return; setSelectedId(layer.id); }}
                  style={{
                    position: "absolute",
                    left: layer.x * cardW, top: layer.y * cardH,
                    width: "auto", maxWidth: Math.min(boxW * 1.5, cardW * 0.95),
                    minWidth: Math.max(60, boxW * 0.3),
                    transform: `translate(-50%, -50%) rotate(${rot}deg)`,
                    zIndex: isSelected ? 15 : 10,
                    cursor: dragging?.id === layer.id ? "grabbing" : "grab",
                    userSelect: "none", textAlign: layer.align, boxSizing: "border-box",
                    opacity: (layer.opacity ?? 100) / 100,
                    touchAction: "none",
                  }}>

                  {isEditingInline ? (
                    <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
                      <textarea
                        autoFocus
                        value={editingInlineText}
                        onChange={e => setEditingInlineText(e.target.value)}
                        onKeyDown={e => { if (e.key === "Escape") setEditingInlineId(null); }}
                        style={{
                          width: "100%", minHeight: "auto",
                          background: "rgba(13,20,32,0.9)",
                          border: `${Math.ceil(2/scale)}px solid #D4A843`,
                          borderRadius: Math.ceil(8/scale),
                          color: layer.color, fontSize: layer.fontSize,
                          fontFamily: FONT_CSS[layer.fontKey] || "'AdorshoLipi', serif",
                           fontWeight: layer.bold ? "bold" : "normal",
                           fontStyle: layer.italic ? "italic" : "normal",
                          lineHeight: layer.lineHeight,
                          padding: `${Math.ceil(4/scale)}px`,
                          boxSizing: "border-box",
                          textAlign: layer.align,
                        }}
                        rows={3}
                      />
                      <div style={{ display: "flex", gap: Math.ceil(6/scale), marginTop: Math.ceil(4/scale) }}>
                        <button
                          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                          onClick={e => { e.stopPropagation(); updateText(layer.id, { text: editingInlineText }); setEditingInlineId(null); }}
                          style={{ flex: 1, padding: `${Math.ceil(6/scale)}px`, borderRadius: Math.ceil(8/scale),
                            border: "none", background: "#D4A843", color: "#000", fontWeight: 700, fontSize: Math.ceil(13/scale), cursor: "pointer" }}>
                          ✅ ঠিক আছে
                        </button>
                        <button
                          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                          onClick={e => { e.stopPropagation(); setEditingInlineId(null); }}
                          style={{ padding: `${Math.ceil(6/scale)}px ${Math.ceil(12/scale)}px`,
                            borderRadius: Math.ceil(8/scale), border: "1px solid #ef4444",
                            background: "rgba(239,68,68,0.15)", color: "#ef4444", fontWeight: 700, fontSize: Math.ceil(13/scale), cursor: "pointer" }}>
                          বাতিল
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      fontSize: layer.fontSize,
                      fontFamily: FONT_CSS[layer.fontKey] || "'AdorshoLipi', serif",
                      color: layer.color,
                      fontWeight: layer.bold ? "bold" : "normal",
                      fontStyle: layer.italic ? "italic" : "normal",
                      lineHeight: layer.lineHeight,
                      letterSpacing: (layer.letterSpacing ?? 0) + "px",
                      whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "anywhere",
                      textShadow: layer.shadow ? "2px 2px 8px rgba(0,0,0,0.5)" : "none",
                      WebkitTextStroke: layer.outline ? `${Math.ceil(layer.fontSize * 0.06)}px ${layer.outlineColor}` : "none",
                      border: isSelected ? `${Math.ceil(2/scale)}px dashed rgba(212,168,67,0.8)` : "none",
                      borderRadius: Math.ceil(4/scale),
                      padding: `${Math.ceil(6/scale)}px`,
                      width: "100%", boxSizing: "border-box",
                    }}>
                      {layer.text}
                    </div>
                  )}

                  {/* Handles — only when selected */}
                  {isSelected && !isEditingInline && (
                    <>
                      {/* Delete — top left */}
                      <button data-del="1"
                        onMouseDown={e => e.stopPropagation()}
                        onTouchStart={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); removeLayer(layer.id); }}
                        style={{
                          position: "absolute", top: -handleSz / 2, left: -handleSz / 2,
                          width: handleSz, height: handleSz, borderRadius: "50%",
                          background: "#ef4444", border: "none", color: "#fff",
                          fontSize: Math.ceil(14/scale), cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          zIndex: 20, fontWeight: 700, lineHeight: 1,
                        }}>✕</button>
                      {/* Edit — top right */}
                      <button data-edit="1"
                        onMouseDown={e => e.stopPropagation()}
                        onTouchStart={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); setEditingInlineId(layer.id); setEditingInlineText(layer.text); }}
                        style={{
                          position: "absolute", top: -handleSz / 2, right: -handleSz / 2,
                          width: handleSz, height: handleSz, borderRadius: "50%",
                          background: "#D4A843", border: "none", color: "#000",
                          fontSize: Math.ceil(14/scale), cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          zIndex: 20, fontWeight: 700, lineHeight: 1,
                        }}>✏️</button>
                    </>
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
                  onMouseDown={e => { e.stopPropagation(); startDrag(e, s.id, true, s.x, s.y); }}
                  onTouchStart={e => { e.stopPropagation(); startDrag(e, s.id, true, s.x, s.y); }}
                  onClick={e => { e.stopPropagation(); setSelectedId(s.id); }}
                  style={{
                    position: "absolute",
                    left: s.x * cardW, top: s.y * cardH,
                    transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
                    zIndex: isSelected ? 15 : 10,
                    cursor: "grab", userSelect: "none", touchAction: "none",
                    fontSize: s.size, lineHeight: 1,
                  }}>
                  {s.emoji}
                  {isSelected && (
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); removeLayer(s.id); }}
                      style={{
                        position: "absolute", top: -handleSz / 2, right: -handleSz / 2,
                        width: handleSz, height: handleSz, borderRadius: "50%",
                        background: "#ef4444", border: "none", color: "#fff",
                        fontSize: Math.ceil(12/scale), cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 20,
                      }}>✕</button>
                  )}
                </div>
              );
            })}

            {/* PIP Layers */}
            {pipLayers.map(pip => {
              const isSelected = selectedPipId === pip.id;
              const pw = pip.w * cardW;
              const ph = pip.h * cardH;
              const handleSz = Math.ceil(28 / scale);
              const borderRadius = pip.shape === "circle" ? "50%" : pip.shape === "rounded" ? "10%" : "0";
              return (
                <div key={pip.id}
                  onMouseDown={e => startPipDrag(e, pip.id, pip.x, pip.y)}
                  onTouchStart={e => startPipDrag(e, pip.id, pip.x, pip.y)}
                  onClick={e => { e.stopPropagation(); setSelectedPipId(pip.id); }}
                  style={{
                    position: "absolute",
                    left: pip.x * cardW, top: pip.y * cardH,
                    width: pw, height: ph,
                    transform: `rotate(${pip.rotation}deg)`,
                    transformOrigin: "center center",
                    zIndex: isSelected ? 16 : 11,
                    cursor: draggingPip?.id === pip.id ? "grabbing" : "grab",
                    userSelect: "none", touchAction: "none",
                    borderRadius,
                    overflow: "hidden",
                    opacity: pip.opacity / 100,
                    boxShadow: isSelected ? `0 0 0 ${Math.ceil(3/scale)}px #D4A843` : "0 4px 16px rgba(0,0,0,0.5)",
                  }}>
                  <img src={pip.src} alt="pip" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }} />
                  {isSelected && (
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); setPipLayers(prev => prev.filter(p => p.id !== pip.id)); setSelectedPipId(null); }}
                      style={{
                        position: "absolute", top: -handleSz / 2, right: -handleSz / 2,
                        width: handleSz, height: handleSz, borderRadius: "50%",
                        background: "#ef4444", border: "none", color: "#fff",
                        fontSize: Math.ceil(12/scale), cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 20,
                      }}>✕</button>
                  )}
                </div>
              );
            })}

            {/* Inline text input */}
            {inlineTextPos && (
              <div style={{
                position: "absolute", left: inlineTextPos.x, top: inlineTextPos.y,
                zIndex: 25, transform: "translate(0, -50%)",
              }} onClick={e => e.stopPropagation()}>
                <textarea
                  ref={inlineTextareaRef}
                  value={inlineTextValue}
                  onChange={e => setInlineTextValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitInlineText(); }
                    if (e.key === "Escape") { setInlineTextPos(null); setInlineTextValue(""); }
                  }}
                  onBlur={commitInlineText}
                  placeholder="লিখুন..."
                  rows={3}
                  style={{
                    background: "rgba(13,20,32,0.85)", border: "2px solid #D4A843",
                    borderRadius: 8, color: theme.text, fontSize: 40,
                    fontFamily: "'AdorshoLipi', serif", padding: "8px 12px",
                    minWidth: 300, maxWidth: cardW * 0.8, outline: "none",
                    resize: "both", lineHeight: 1.6,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
                  }}
                />
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <button onMouseDown={e => { e.preventDefault(); commitInlineText(); }}
                    style={{ padding: "6px 16px", borderRadius: 8, border: "none",
                      background: "#D4A843", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    ✅ যোগ করুন
                  </button>
                  <button onMouseDown={e => { e.preventDefault(); setInlineTextPos(null); setInlineTextValue(""); }}
                    style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid #ef4444",
                      background: "rgba(239,68,68,0.15)", color: "#ef4444", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    ✕ বাতিল
                  </button>
                </div>
              </div>
            )}

            {/* Drawing canvas overlay */}
            <canvas
              ref={drawCanvasRef}
              width={cardW} height={cardH}
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

      {/* ── Tool Panel (slides up) ── */}
      <AnimatePresence>
        {activeTool && (
          <motion.div
            key={activeTool}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              background: "#0d1420",
              borderTop: "1px solid #1e3050",
              maxHeight: "45vh",
              overflowY: "auto",
              flexShrink: 0,
              overscrollBehavior: "contain",
            }}
          >
            {/* ── CANVAS PANEL ── */}
            {activeTool === "canvas" && (
              <>
                <PanelHeader title="📐 ক্যানভাস সেটিংস" onClose={() => setActiveTool(null)} />
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 10, fontWeight: 600 }}>ক্যানভাস আকার</p>
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
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
                            background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 12, cursor: "pointer" }}>✕</button>
                      )}
                    </div>
                    {photoImage && <div style={{ marginTop: 8 }}><SliderRow label="ছবির অপাসিটি" val={photoOpacity} set={setPhotoOpacity} min={10} max={100} unit="%" /></div>}
                  </div>
                  <div>
                    <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>এক্সপোর্ট মান</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      {([["1x", "স্ট্যান্ডার্ড"], ["2x", "HD"], ["4k", "4K"]] as [ExportQuality, string][]).map(([q, label]) => (
                        <button key={q} onClick={() => setExportQuality(q)}
                          style={{ flex: 1, padding: "8px 4px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                            border: `1px solid ${exportQuality === q ? "#D4A843" : "#1e3050"}`,
                            background: exportQuality === q ? "rgba(212,168,67,0.15)" : "transparent",
                            color: exportQuality === q ? "#D4A843" : "#6b7280", cursor: "pointer" }}>
                          {label}
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

            {/* ── IMAGE MOVE PANEL ── */}
            {activeTool === "imgmove" && (
              <>
                <PanelHeader title="🔀 ছবি সরান ও ঘোরান" onClose={() => setActiveTool(null)} />
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                  {!photoImage ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                      <p style={{ color: "#9ca3af", fontSize: 13 }}>প্রথমে ক্যানভাস থেকে ছবি আপলোড করুন</p>
                      <button onClick={() => { setActiveTool("canvas"); }} style={{ marginTop: 10, padding: "8px 20px", borderRadius: 10, border: "none", background: "#D4A843", color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>📐 ক্যানভাসে যান</button>
                    </div>
                  ) : (
                    <>
                      {/* Drag hint */}
                      <div style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.3)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>✋</span>
                        <p style={{ color: "#D4A843", fontSize: 12, fontWeight: 600, margin: 0 }}>প্রিভিউতে ছবির উপর আঙ্গুল দিয়ে টেনে সরান যাবে! নিচে স্লাইডারও আছে।</p>
                      </div>
                      <div style={{ background: "#060c18", borderRadius: 10, padding: 12 }}>
                        <p style={{ color: "#D4A843", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>📍 অবস্থান</p>
                        <SliderRow label="অনুভূমিক (X)" val={Math.round(photoX)} set={setPhotoX} min={0} max={100} unit="%" />
                        <div style={{ marginTop: 10 }}>
                          <SliderRow label="উল্লম্ব (Y)" val={Math.round(photoY)} set={setPhotoY} min={0} max={100} unit="%" />
                        </div>
                      </div>
                      <div style={{ background: "#060c18", borderRadius: 10, padding: 12 }}>
                        <p style={{ color: "#D4A843", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>🔄 ঘূর্ণন ও জুম</p>
                        <SliderRow label="ঘূর্ণন" val={photoRotation} set={setPhotoRotation} min={-180} max={180} unit="°" />
                        <div style={{ marginTop: 10 }}>
                          <SliderRow label="জুম" val={photoScale} set={setPhotoScale} min={100} max={300} unit="%" />
                        </div>
                      </div>
                      <div style={{ background: "#060c18", borderRadius: 10, padding: 12 }}>
                        <p style={{ color: "#D4A843", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>↔️ ফ্লিপ</p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => setPhotoFlipH(v => !v)}
                            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${photoFlipH ? "#D4A843" : "#1e3050"}`,
                              background: photoFlipH ? "rgba(212,168,67,0.15)" : "transparent",
                              color: photoFlipH ? "#D4A843" : "#9ca3af", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            ↔️ অনুভূমিক
                          </button>
                          <button onClick={() => setPhotoFlipV(v => !v)}
                            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${photoFlipV ? "#D4A843" : "#1e3050"}`,
                              background: photoFlipV ? "rgba(212,168,67,0.15)" : "transparent",
                              color: photoFlipV ? "#D4A843" : "#9ca3af", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            ↕️ উল্লম্ব
                          </button>
                        </div>
                      </div>
                      <button onClick={() => { setPhotoX(50); setPhotoY(50); setPhotoRotation(0); setPhotoScale(100); setPhotoFlipH(false); setPhotoFlipV(false); }}
                        style={{ padding: "10px 0", borderRadius: 10, border: "1px solid #1e3050",
                          background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>
                        🔄 রিসেট করুন
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* ── CROP PANEL ── */}
            {activeTool === "crop" && (
              <>
                <PanelHeader title="✂️ ক্রপ করুন" onClose={() => setActiveTool(null)} />
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                  {!photoImage ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                      <p style={{ color: "#9ca3af", fontSize: 13 }}>প্রথমে ক্যানভাস থেকে ছবি আপলোড করুন</p>
                      <button onClick={() => setActiveTool("canvas")} style={{ marginTop: 10, padding: "8px 20px", borderRadius: 10, border: "none", background: "#D4A843", color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>📐 ক্যানভাসে যান</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.3)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>✌️</span>
                        <p style={{ color: "#D4A843", fontSize: 12, fontWeight: 600, margin: 0 }}>প্রিভিউতে সোনালি বাক্সটি টেনে সরান বা কোণার হ্যান্ডেল দিয়ে রিসাইজ করুন! নিচে স্লাইডারও আছে।</p>
                      </div>
                      <div style={{ background: "#060c18", borderRadius: 10, padding: 12 }}>
                        <p style={{ color: "#D4A843", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>📐 ক্রপ এলাকা</p>
                        <SliderRow label="বাম থেকে শুরু (X)" val={cropX} set={v => { setCropX(v); if (v + cropW > 100) setCropW(100 - v); }} min={0} max={90} unit="%" />
                        <div style={{ marginTop: 10 }}>
                          <SliderRow label="উপর থেকে শুরু (Y)" val={cropY} set={v => { setCropY(v); if (v + cropH > 100) setCropH(100 - v); }} min={0} max={90} unit="%" />
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <SliderRow label="প্রস্থ (W)" val={cropW} set={v => setCropW(Math.min(v, 100 - cropX))} min={10} max={100} unit="%" />
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <SliderRow label="উচ্চতা (H)" val={cropH} set={v => setCropH(Math.min(v, 100 - cropY))} min={10} max={100} unit="%" />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {([["1:1",100,100],["4:3",100,75],["16:9",100,56],["9:16",56,100]] as [string,number,number][]).map(([label, w, h]) => (
                          <button key={label} onClick={() => { setCropX(0); setCropY(0); setCropW(w); setCropH(h); }}
                            style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #1e3050",
                              background: "transparent", color: "#9ca3af", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            {label}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={applyCrop}
                          style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                            background: "linear-gradient(135deg,#D4A843,#b8892a)",
                            color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                          ✂️ ক্রপ করুন
                        </button>
                        <button onClick={() => { setCropX(0); setCropY(0); setCropW(100); setCropH(100); }}
                          style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid #1e3050",
                            background: "transparent", color: "#9ca3af", fontSize: 13, cursor: "pointer" }}>
                          রিসেট
                        </button>
                      </div>
                      {croppedSrc && (
                        <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 10, padding: "10px 14px" }}>
                          <p style={{ color: "#4ade80", fontSize: 12, fontWeight: 600, margin: 0 }}>✅ ক্রপ সফল হয়েছে!</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            {/* ── PIP PANEL ── */}
            {activeTool === "pip" && (
              <>
                <PanelHeader title="🖼️ PIP — অতিরিক্ত ছবি" onClose={() => setActiveTool(null)} />
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                  <button onClick={() => pipFileRef.current?.click()}
                    style={{ padding: "12px 0", borderRadius: 12, border: "1px dashed #1e3050",
                      background: "transparent", color: "#D4A843", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    ➕ নতুন ছবি যোগ করুন
                  </button>
                  {pipLayers.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "10px 0" }}>
                      <p style={{ color: "#6b7280", fontSize: 12 }}>এখনো কোনো PIP ছবি নেই</p>
                    </div>
                  ) : (
                    <>
                      {pipLayers.map((pip, idx) => {
                        const isSelected = selectedPipId === pip.id;
                        return (
                          <div key={pip.id}
                            onClick={() => setSelectedPipId(pip.id)}
                            style={{ background: isSelected ? "rgba(212,168,67,0.1)" : "#060c18",
                              border: `1px solid ${isSelected ? "#D4A843" : "#1e3050"}`,
                              borderRadius: 10, padding: 12, cursor: "pointer" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isSelected ? 12 : 0 }}>
                              <img src={pip.src} alt="pip" style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                              <span style={{ color: isSelected ? "#D4A843" : "#9ca3af", fontSize: 12, fontWeight: 600 }}>ছবি {idx + 1}</span>
                              <button onClick={e => { e.stopPropagation(); setPipLayers(prev => prev.filter(p => p.id !== pip.id)); if (selectedPipId === pip.id) setSelectedPipId(null); }}
                                style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: 8, border: "1px solid #ef4444",
                                  background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 11, cursor: "pointer" }}>✕</button>
                            </div>
                            {isSelected && (
                              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <SliderRow label="প্রস্থ" val={Math.round(pip.w * 100)} set={v => setPipLayers(p => p.map(l => l.id === pip.id ? { ...l, w: v / 100 } : l))} min={10} max={100} unit="%" />
                                <SliderRow label="উচ্চতা" val={Math.round(pip.h * 100)} set={v => setPipLayers(p => p.map(l => l.id === pip.id ? { ...l, h: v / 100 } : l))} min={10} max={100} unit="%" />
                                <SliderRow label="ঘূর্ণন" val={pip.rotation} set={v => setPipLayers(p => p.map(l => l.id === pip.id ? { ...l, rotation: v } : l))} min={-180} max={180} unit="°" />
                                <SliderRow label="অপাসিটি" val={pip.opacity} set={v => setPipLayers(p => p.map(l => l.id === pip.id ? { ...l, opacity: v } : l))} min={10} max={100} unit="%" />
                                <div>
                                  <p style={{ color: "#9ca3af", fontSize: 11, marginBottom: 6 }}>আকৃতি</p>
                                  <div style={{ display: "flex", gap: 6 }}>
                                    {(["rect", "rounded", "circle"] as PipLayer["shape"][]).map(sh => (
                                      <button key={sh} onClick={() => setPipLayers(p => p.map(l => l.id === pip.id ? { ...l, shape: sh } : l))}
                                        style={{ flex: 1, padding: "8px 0", borderRadius: 8,
                                          border: `1px solid ${pip.shape === sh ? "#D4A843" : "#1e3050"}`,
                                          background: pip.shape === sh ? "rgba(212,168,67,0.15)" : "transparent",
                                          color: pip.shape === sh ? "#D4A843" : "#6b7280", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                                        {sh === "rect" ? "⬜ আয়ত" : sh === "rounded" ? "🔲 গোলাকার" : "⭕ বৃত্ত"}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </>
            )}

            {/* ── TEXT PANEL ── */}
            {activeTool === "text" && (
              <>
                <PanelHeader title="✍️ লেখা সম্পাদনা" onClose={() => setActiveTool(null)} />
                <div style={{ display: "flex", borderBottom: "1px solid #1e3050", flexShrink: 0, background: "#0d1420", position: "sticky", top: 52, zIndex: 1 }}>
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
                <div style={{ padding: 16 }}>
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
                              <input type="text" value={layer.text} onChange={e => updateText(layer.id, { text: e.target.value })}
                                placeholder={`${labels[kind]} লিখুন...`}
                                style={{ width: "100%", background: "#060c18", color: "#fff", border: "1px solid #1e3050",
                                  borderRadius: 10, padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                            )}
                          </div>
                        );
                      })}
                      {textLayers.filter(l => l.kind === "custom").map((layer, idx) => (
                        <div key={layer.id}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <label style={{ color: "#D4A843", fontSize: 12, fontWeight: 700 }}>কাস্টম লেখা {idx + 1}</label>
                            <button onClick={() => removeLayer(layer.id)}
                              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                                borderRadius: 6, color: "#ef4444", fontSize: 11, padding: "2px 8px", cursor: "pointer" }}>
                              মুছুন
                            </button>
                          </div>
                          <textarea value={layer.text} onChange={e => updateText(layer.id, { text: e.target.value })}
                            rows={3} placeholder="কাস্টম লেখা লিখুন..."
                            style={{ width: "100%", background: "#060c18", color: "#fff", border: "1px solid #1e3050",
                              borderRadius: 10, padding: "9px 12px", fontSize: 14, outline: "none",
                              resize: "vertical", lineHeight: 1.7, boxSizing: "border-box" }} />
                        </div>
                      ))}
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
                          <SliderRow label="লেটার স্পেস" val={selectedText.letterSpacing ?? 0} set={v => updateText(selectedText.id, { letterSpacing: v })} min={-5} max={30} unit="px" />
                          <SliderRow label="ঘূর্ণন" val={selectedText.rotation ?? 0} set={v => updateText(selectedText.id, { rotation: v })} min={-180} max={180} unit="°" />
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
                        <FontItem
                          key={f.value}
                          fontKey={f.value}
                          fontName={f.name}
                          isSelected={selectedText?.fontKey === f.value}
                          onClick={async () => {
                            if (!selectedText) return;
                            await ensureFontLoaded(f.value);
                            updateText(selectedText.id, { fontKey: f.value });
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── INLINE TEXT PANEL ── */}
            {activeTool === "inlinetext" && (
              <>
                <PanelHeader title="🖊️ টেক্সট যোগ করুন" onClose={() => { setActiveTool(null); setInlineTextPos(null); }} />
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.3)",
                    borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>👆</div>
                    <p style={{ color: "#D4A843", fontSize: 14, fontWeight: 700, margin: 0 }}>উপরের ক্যানভাসে ট্যাপ করুন</p>
                    <p style={{ color: "#9ca3af", fontSize: 12, margin: "6px 0 0" }}>যেখানে লিখতে চান সেখানে ট্যাপ করুন → লিখুন → Enter দিন</p>
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

            {/* ── STICKER PANEL ── */}
            {activeTool === "sticker" && (
              <>
                <PanelHeader title="😊 স্টিকার" onClose={() => setActiveTool(null)} />
                <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid #1e3050",
                  flexShrink: 0, padding: "0 8px", scrollbarWidth: "none", background: "#0d1420",
                  position: "sticky", top: 52, zIndex: 1 }}>
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
                <div style={{ padding: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 6 }}>
                    {STICKER_CATEGORIES[activeStickerCat].stickers.map((emoji, i) => (
                      <button key={i} onClick={() => addSticker(emoji)}
                        style={{ fontSize: 26, padding: "4px 0", borderRadius: 8, border: "1px solid transparent",
                          background: "transparent", cursor: "pointer", lineHeight: 1,
                          display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                  {selectedSticker && (
                    <div style={{ marginTop: 12, padding: 12, background: "#060c18", borderRadius: 10 }}>
                      <p style={{ color: "#9ca3af", fontSize: 11, marginBottom: 8 }}>নির্বাচিত স্টিকার</p>
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
                <div style={{ padding: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                    {FILTER_PRESETS.map(fp => (
                      <button key={fp.name} onClick={() => setFilterPreset(fp.name)}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                          padding: "10px 6px", borderRadius: 10,
                          border: `2px solid ${filterPreset === fp.name ? "#D4A843" : "#1e3050"}`,
                          background: filterPreset === fp.name ? "rgba(212,168,67,0.12)" : "#060c18",
                          cursor: "pointer",
                        }}>
                        <span style={{ fontSize: 20 }}>{fp.emoji}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: filterPreset === fp.name ? "#D4A843" : "#9ca3af" }}>{fp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── ADJUST PANEL ── */}
            {activeTool === "adjust" && (
              <>
                <PanelHeader title="⚙️ অ্যাডজাস্ট" onClose={() => setActiveTool(null)} />
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                  <SliderRow label="উজ্জ্বলতা" val={brightness} set={setBrightness} min={50} max={200} unit="%" />
                  <SliderRow label="কনট্রাস্ট" val={contrast} set={setContrast} min={50} max={200} unit="%" />
                  <SliderRow label="স্যাচুরেশন" val={saturation} set={setSaturation} min={0} max={300} unit="%" />
                  <SliderRow label="ব্লার" val={blur} set={setBlur} min={0} max={20} unit="px" />
                  <SliderRow label="ভিগনেট" val={vignette} set={setVignette} min={0} max={100} unit="%" />
                  <button onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); setBlur(0); setVignette(0); }}
                    style={{ padding: "8px 0", borderRadius: 10, border: "1px solid #1e3050",
                      background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>
                    রিসেট করুন
                  </button>
                </div>
              </>
            )}

            {/* ── BG WALL PANEL ── */}
            {activeTool === "bgwall" && (
              <BgWallPanel
                onClose={() => setActiveTool(null)}
                onSelect={css => setBgWallCss(css)}
                selected={bgWallCss}
              />
            )}

            {/* ── BG PHOTO PANEL ── */}
            {activeTool === "bgphoto" && (
              <>
                <PanelHeader title="🖼️ ব্যাকগ্রাউন্ড ছবি" onClose={() => setActiveTool(null)} />
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => bgFileRef.current?.click()}
                      style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "1px dashed #1e3050",
                        background: bgImage ? "rgba(212,168,67,0.08)" : "transparent",
                        color: bgImage ? "#D4A843" : "#9ca3af", fontSize: 13, cursor: "pointer" }}>
                      {bgImage ? "✅ ছবি পরিবর্তন" : "📁 ব্যাকগ্রাউন্ড ছবি"}
                    </button>
                    {bgImage && (
                      <button onClick={() => setBgImage(null)}
                        style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #ef4444",
                          background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 13, cursor: "pointer" }}>✕</button>
                    )}
                  </div>
                  {bgImage && <SliderRow label="অপাসিটি" val={bgOpacity} set={setBgOpacity} min={5} max={100} unit="%" />}
                  <div>
                    <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>থিম নির্বাচন</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                      {THEMES.map((t, i) => (
                        <button key={i} onClick={() => setThemeIdx(i)}
                          style={{
                            padding: "10px 6px", borderRadius: 10, cursor: "pointer",
                            border: `2px solid ${themeIdx === i ? "#D4A843" : "#1e3050"}`,
                            background: t.gradient || t.bg,
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                          }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: t.text,
                            textShadow: "0 1px 3px rgba(0,0,0,0.8)", wordBreak: "break-word", textAlign: "center" }}>{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>ফ্রেম</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {FRAMES.map(f => (
                        <button key={f.value} onClick={() => setFrame(f.value)}
                          style={{ padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                            border: `1px solid ${frame === f.value ? "#D4A843" : "#1e3050"}`,
                            background: frame === f.value ? "rgba(212,168,67,0.12)" : "transparent",
                            color: frame === f.value ? "#D4A843" : "#6b7280", cursor: "pointer" }}>
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── UPSCALE PANEL ── */}
            {activeTool === "upscale" && (
              <UpscalePanel onClose={() => setActiveTool(null)} />
            )}

            {/* ── DRAW PANEL ── */}
            {activeTool === "draw" && (
              <>
                <PanelHeader title="🖌️ ড্রয়িং" onClose={() => setActiveTool(null)} />
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <p style={{ color: "#9ca3af", fontSize: 11, marginBottom: 8 }}>টুল</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(["pencil", "brush", "eraser", "line", "rect", "circle", "arrow"] as DrawTool[]).map(t => (
                        <button key={t} onClick={() => setDrawTool(t)}
                          style={{ padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                            border: `1px solid ${drawTool === t ? "#D4A843" : "#1e3050"}`,
                            background: drawTool === t ? "rgba(212,168,67,0.15)" : "transparent",
                            color: drawTool === t ? "#D4A843" : "#6b7280", cursor: "pointer" }}>
                          {t === "pencil" ? "✏️" : t === "brush" ? "🖌️" : t === "eraser" ? "🧹" :
                           t === "line" ? "➖" : t === "rect" ? "⬜" : t === "circle" ? "⭕" : "➡️"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ color: "#9ca3af", fontSize: 11, marginBottom: 8 }}>রং</p>
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
                  <SliderRow label="ব্রাশ সাইজ" val={drawWidth} set={setDrawWidth} min={1} max={50} />
                  <SliderRow label="অপাসিটি" val={drawOpacity} set={setDrawOpacity} min={10} max={100} unit="%" />
                  <button
                    onClick={() => {
                      const canvas = drawCanvasRef.current;
                      if (!canvas) return;
                      const ctx = canvas.getContext("2d")!;
                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }}
                    style={{ padding: "8px 0", borderRadius: 10, border: "1px solid #ef4444",
                      background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 12, cursor: "pointer" }}>
                    🗑️ ক্যানভাস মুছুন
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Toolbar ── */}
      <div style={{
        background: "linear-gradient(180deg, #0d1420 0%, #0a0f1a 100%)",
        borderTop: "1px solid rgba(212,168,67,0.2)",
        flexShrink: 0,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}>
        {/* Tool buttons row */}
        <div style={{
          display: "flex",
          overflowX: "auto",
          padding: "8px 8px 4px",
          gap: 4,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        } as React.CSSProperties}>
          {([
            { tool: "canvas" as ActiveTool,     icon: "📐", label: "ক্যানভাস" },
            { tool: "imgmove" as ActiveTool,    icon: "🔀", label: "সরান" },
            { tool: "crop" as ActiveTool,       icon: "✂️", label: "ক্রপ" },
            { tool: "pip" as ActiveTool,        icon: "🖼️", label: "PIP" },
            { tool: "bgwall" as ActiveTool,     icon: "🌅", label: "ব্যাকগ্রাউন্ড" },
            { tool: "bgphoto" as ActiveTool,    icon: "🎨", label: "থিম" },
            { tool: "filter" as ActiveTool,     icon: "✨", label: "ফিল্টার" },
            { tool: "adjust" as ActiveTool,     icon: "⚙️", label: "অ্যাডজাস্ট" },
            { tool: "text" as ActiveTool,       icon: "✍️", label: "লেখা" },
            { tool: "inlinetext" as ActiveTool, icon: "🖊️", label: "টেক্সট" },
            { tool: "sticker" as ActiveTool,    icon: "😊", label: "স্টিকার" },
            { tool: "draw" as ActiveTool,       icon: "🖌️", label: "ড্রয়িং" },
            { tool: "upscale" as ActiveTool,    icon: "🔍", label: "আপস্কেল" },
          ]).map(({ tool, icon, label }) => (
            <button
              key={tool}
              onClick={() => toggleTool(tool)}
              style={{
                flexShrink: 0,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "8px 10px", borderRadius: 12, border: "none",
                background: activeTool === tool
                  ? "rgba(212,168,67,0.18)"
                  : "transparent",
                cursor: "pointer",
                minWidth: 58,
                transition: "background 0.15s",
                outline: activeTool === tool ? "1.5px solid rgba(212,168,67,0.5)" : "none",
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
              <span style={{
                fontSize: 9, fontWeight: 600, whiteSpace: "nowrap",
                color: activeTool === tool ? "#D4A843" : "#6b7280",
              }}>{label}</span>
            </button>
          ))}
        </div>
        {/* Scroll indicator dots */}
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 6, gap: 3 }}>
          {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
            <div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(212,168,67,0.3)" }} />
          ))}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPhotoUpload} />
      <input ref={bgFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onBgUpload} />
      <input ref={pipFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPipUpload} />
    </div>
  );
}
