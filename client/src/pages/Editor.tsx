/**
 * ডিজাইন ফরম্যাট — Premium Bengali Writing Card Designer v2
 * New in v2:
 *  - Removed title/author divider lines
 *  - 6 new gradient themes (Aurora, Sunset Blaze, Ocean Deep, Rose Gold, Forest Mist, Midnight Gold)
 *  - Watermark / author logo overlay option
 *  - 8 frame styles (none, inner border, corner ornament, double border, left bar, shadow frame, ornate, minimal dot)
 *  - Pattern backgrounds (dots, lines, grid, diagonal)
 *  - Text glow effect toggle
 *  - Italic title toggle
 *  - Opacity control for author name
 *  - Copy design as image to clipboard
 *  - Canvas-based PNG export (mobile-safe, 2x resolution)
 */
import { useState, useRef, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { trpc } from "@/lib/trpc";

// ── Fonts ─────────────────────────────────────────────────────────────────────
const FONTS = [
  { name: "চন্দ্রশীলা", value: "ChandraSheela" },
  { name: "চন্দ্রশীলা প্রিমিয়াম", value: "ChandraSheelaPremium" },
  { name: "মাহবুব সরদার ফন্ট", value: "MahbubSardarSabujFont" },
  { name: "মাসুদ নান্দনিক", value: "MasudNandanik" },
  { name: "আদর্শ লিপি", value: "AdorshoLipi" },
  { name: "BH Sabit Adorsho", value: "BHSabitAdorshoLightUnicode" },
  { name: "BLAB Norha Gram", value: "BLABNorhaGramUnicode" },
  { name: "Akhand Bengali", value: "AkhandBengali" },
  { name: "Tiro Bangla", value: "TiroBangla" },
  { name: "Noto Sans Bengali", value: "NotoSansBengali" },
];

const FONT_CSS: Record<string, string> = {
  ChandraSheela: "'ChandraSheela', serif",
  ChandraSheelaPremium: "'ChandraSheelaPremium', serif",
  MahbubSardarSabujFont: "'MahbubSardarSabujFont', serif",
  MasudNandanik: "'MasudNandanik', serif",
  AdorshoLipi: "'AdorshoLipi', serif",
  BHSabitAdorshoLightUnicode: "'BHSabitAdorshoLightUnicode', serif",
  BLABNorhaGramUnicode: "'BLABNorhaGramUnicode', serif",
  AkhandBengali: "'AkhandBengali', serif",
  TiroBangla: "'Tiro Bangla', serif",
  NotoSansBengali: "'Noto Sans Bengali', sans-serif",
};

const FONT_URLS: Record<string, string> = {
  ChandraSheela: "/fonts/\u099a\u09a8\u09cd\u09a6\u09cd\u09b0\u09b6\u09c0\u09b2\u09be.ttf",
  ChandraSheelaPremium: "/fonts/\u099a\u09a8\u09cd\u09a6\u09cd\u09b0\u09b6\u09c0\u09b2\u09be\u09aa\u09cd\u09b0\u09bf\u09ae\u09bf\u09af\u09bc\u09be\u09ae.ttf",
  MahbubSardarSabujFont: "/fonts/\u09ae\u09be\u09b9\u09ac\u09c1\u09ac\u09b8\u09b0\u09a6\u09be\u09b0\u09b8\u09ac\u09c1\u099c\u09ab\u09a8\u09cd\u099f.ttf",
  MasudNandanik: "/fonts/\u09ae\u09be\u09b8\u09c1\u09a6\u09a8\u09be\u09a8\u09cd\u09a6\u09a8\u09bf\u0995.ttf",
  AdorshoLipi: "/fonts/AdorshoLipi.ttf",
  BHSabitAdorshoLightUnicode: "/fonts/BHSabitAdorshoLightUnicode.ttf",
  BLABNorhaGramUnicode: "/fonts/BLABNorhaGramUnicode.ttf",
  AkhandBengali: "/fonts/AkhandBengali.ttf",
};

// ── Themes ────────────────────────────────────────────────────────────────────
type Theme = { name: string; bg: string; text: string; border: string; gradient?: string };

const THEMES: Theme[] = [
  // Solid
  { name: "বইয়ের পাতা",     bg: "#F5F0E8", text: "#1a1a1a", border: "#8B7355" },
  { name: "ক্রিম সাদা",     bg: "#FFFEF7", text: "#2d2d2d", border: "#C8B89A" },
  { name: "রাতের আকাশ",    bg: "#0d1b2a", text: "#E8D5A3", border: "#D4A843" },
  { name: "গভীর রাত",      bg: "#0a0a0a", text: "#FFFFFF", border: "#333333" },
  { name: "সোনালি সন্ধ্যা", bg: "#2C1810", text: "#F5DEB3", border: "#D4A843" },
  { name: "সবুজ প্রকৃতি",  bg: "#0d1f0d", text: "#E8F5E8", border: "#4CAF50" },
  { name: "গোলাপি স্বপ্ন",  bg: "#FFF0F5", text: "#4A1942", border: "#E91E8C" },
  { name: "নীল শান্তি",    bg: "#EEF4FF", text: "#1A237E", border: "#3F51B5" },
  { name: "বেগুনি রহস্য",  bg: "#1a0a2e", text: "#E8D5FF", border: "#9C27B0" },
  // Gradient
  { name: "সূর্যাস্ত",      bg: "#1a0533", text: "#FFFFFF", border: "#FFD700",
    gradient: "linear-gradient(135deg,#1a0533 0%,#2d1b69 50%,#11998e 100%)" },
  { name: "অরোরা",          bg: "#0f0c29", text: "#FFFFFF", border: "#a78bfa",
    gradient: "linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)" },
  { name: "সানসেট ব্লেজ",  bg: "#f7971e", text: "#1a0000", border: "#ffd200",
    gradient: "linear-gradient(135deg,#f7971e 0%,#ffd200 100%)" },
  { name: "ওশান ডিপ",      bg: "#0575e6", text: "#FFFFFF", border: "#00f2fe",
    gradient: "linear-gradient(135deg,#0575e6 0%,#021b79 100%)" },
  { name: "রোজ গোল্ড",     bg: "#f8b4c8", text: "#3d0020", border: "#c9184a",
    gradient: "linear-gradient(135deg,#f8b4c8 0%,#ffd6a5 100%)" },
  { name: "ফরেস্ট মিস্ট",  bg: "#134e5e", text: "#e0ffe0", border: "#71b280",
    gradient: "linear-gradient(135deg,#134e5e 0%,#71b280 100%)" },
  { name: "মিডনাইট গোল্ড", bg: "#0d1b2a", text: "#D4A843", border: "#D4A843",
    gradient: "linear-gradient(135deg,#0d1b2a 0%,#1a2e4a 60%,#2a1a00 100%)" },
];

// ── Sizes ─────────────────────────────────────────────────────────────────────
const SIZES = [
  { name: "বর্গ (1:1)",       w: 1080, h: 1080, icon: "⬛" },
  { name: "পোর্ট্রেট (4:5)", w: 1080, h: 1350, icon: "📱" },
  { name: "স্টোরি (9:16)",   w: 1080, h: 1920, icon: "📲" },
  { name: "আড়াআড়ি (16:9)", w: 1920, h: 1080, icon: "🖥️" },
  { name: "A4 পোর্ট্রেট",   w: 794,  h: 1123, icon: "📄" },
  { name: "কাস্টম",          w: 0,    h: 0,    icon: "✏️" },
];

// ── Frames ────────────────────────────────────────────────────────────────────
const FRAMES = [
  { name: "কোনো ফ্রেম নেই",  value: "none" },
  { name: "ভেতরের বর্ডার",   value: "inner-border" },
  { name: "কোণের অলংকার",   value: "corner" },
  { name: "ডবল বর্ডার",     value: "double-border" },
  { name: "বাম পাশে বার",   value: "left-bar" },
  { name: "শ্যাডো ফ্রেম",   value: "shadow-frame" },
  { name: "অর্নেট ফ্রেম",   value: "ornate" },
  { name: "ডট কর্নার",      value: "dot-corner" },
];

// ── Patterns ──────────────────────────────────────────────────────────────────
const PATTERNS = [
  { name: "কোনো প্যাটার্ন নেই", value: "none" },
  { name: "বিন্দু",             value: "dots" },
  { name: "রেখা",               value: "lines" },
  { name: "গ্রিড",              value: "grid" },
  { name: "তির্যক",             value: "diagonal" },
];

// ── Stickers ──────────────────────────────────────────────────────────────────
const STICKERS = ["🌸","🌙","⭐","✨","🌿","🦋","🕊️","🌹","💫","🔥","🌊","🎋","🌺","💎","🪷","🌟","🏵️","🌴","🎑","🌾","🎐","🎍","🍂","🌻"];

// ── Templates ─────────────────────────────────────────────────────────────────
const TEMPLATES = [
  { label: "প্রেমের কবিতা", t: "ভালোবাসা", b: "তুমি আমার হৃদয়ের গভীরে\nএক অনন্ত আলোর মতো জ্বলো।\nতোমার স্পর্শে জীবন হয়\nঅর্থবহ, সুন্দর ও কোমল।", a: "— মাহবুব সরদার সবুজ" },
  { label: "অনুপ্রেরণা",   t: "জীবন",     b: "প্রতিটি ভোরে নতুন সুযোগ আসে,\nসেই সুযোগকে কাজে লাগাও।\nব্যর্থতা থেকে শিক্ষা নাও,\nসাফল্যের পথে এগিয়ে যাও।", a: "— মাহবুব সরদার সবুজ" },
  { label: "প্রকৃতি",      t: "প্রকৃতির ডাক", b: "সবুজ পাতার ফাঁকে ফাঁকে\nআলো নামে নীরবে।\nনদীর কলতানে মিশে যায়\nমনের সব কথা।", a: "— মাহবুব সরদার সবুজ" },
  { label: "বিদ্রোহ",     t: "কলমের বিদ্রোহ", b: "কলমের স্পর্শে আমি বিদ্রোহী,\nন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি;\nকেউ কেউ ভালোবেসে ডাকে আমায় কবি।", a: "— মাহবুব সরদার সবুজ" },
  { label: "বিচ্ছেদ",     t: "বিচ্ছেদের ব্যথা", b: "যে চলে গেছে সে আর ফেরে না,\nস্মৃতিরা শুধু বুকে জ্বলে।\nকষ্টের এই গল্প বলা যায় না,\nনীরবে চোখের জল গড়িয়ে পড়ে।", a: "— মাহবুব সরদার সবুজ" },
  { label: "আত্মসম্মান",  t: "আত্মসম্মান", b: "নিজেকে ভালোবাসো সবার আগে,\nআত্মসম্মান হারিও না কখনো।\nযে তোমাকে মূল্য দেয় না,\nতার জন্য কাঁদতে নেই।", a: "— মাহবুব সরদার সবুজ" },
];

// ── Author watermark photo ────────────────────────────────────────────────────
const AUTHOR_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";

// ── Helpers ───────────────────────────────────────────────────────────────────
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

function drawPattern(ctx: CanvasRenderingContext2D, pattern: string, w: number, h: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.06;
  ctx.lineWidth = 1;
  if (pattern === "dots") {
    for (let x = 20; x < w; x += 30) for (let y = 20; y < h; y += 30) {
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    }
  } else if (pattern === "lines") {
    for (let y = 0; y < h; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  } else if (pattern === "grid") {
    for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  } else if (pattern === "diagonal") {
    for (let i = -h; i < w + h; i += 32) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke(); }
  }
  ctx.restore();
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Editor() {
  // Content
  const [title, setTitle]           = useState("শিরোনাম");
  const [body, setBody]             = useState("এখানে আপনার লেখা লিখুন...\n\nকবিতা, উক্তি বা মনের কথা।");
  const [author, setAuthor]         = useState("— মাহবুব সরদার সবুজ");
  const [showTitle, setShowTitle]   = useState(true);
  const [showAuthor, setShowAuthor] = useState(true);
  const [sticker, setSticker]       = useState("");

  // Per-element fonts
  const [titleFontKey, setTitleFontKey]   = useState("ChandraSheela");
  const [bodyFontKey, setBodyFontKey]     = useState("ChandraSheela");
  const [authorFontKey, setAuthorFontKey] = useState("ChandraSheela");

  // Design
  const [themeIdx, setThemeIdx]           = useState(2);
  const [fontKey, setFontKey]             = useState("ChandraSheela");
  const [sizeIdx, setSizeIdx]             = useState(0);
  const [customW, setCustomW]             = useState(800);
  const [customH, setCustomH]             = useState(800);
  const [frame, setFrame]                 = useState("corner");
  const [pattern, setPattern]             = useState("none");
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [customBg, setCustomBg]           = useState("#1a1a2e");
  const [customText, setCustomText]       = useState("#ffffff");
  const [customBorder, setCustomBorder]   = useState("#D4A843");

  // Typography
  const [titleSize, setTitleSize]   = useState(52);
  const [bodySize, setBodySize]     = useState(36);
  const [authorSize, setAuthorSize] = useState(28);
  const [lineH, setLineH]           = useState(1.9);
  const [align, setAlign]           = useState<"left"|"center"|"right">("left");
  const [padding, setPadding]       = useState(60);
  const [letterSp, setLetterSp]     = useState(0.5);
  const [textShadow, setTextShadow] = useState(false);
  const [textGlow, setTextGlow]     = useState(false);
  const [boldBody, setBoldBody]     = useState(false);
  const [italicTitle, setItalicTitle] = useState(false);
  const [authorOpacity, setAuthorOpacity] = useState(75);

  // Background
  const [bgImage, setBgImage]     = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState(0.12);
  const [bgBlur, setBgBlur]       = useState(false);
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkOpacity, setWatermarkOpacity] = useState(8);

  // AI Background generation
  const [aiPrompt, setAiPrompt]       = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError]         = useState("");
  const [bgLoading, setBgLoading]     = useState(false);
  const generateBgMutation = trpc.chat.generateBackground.useMutation();

  // Helper: preload an image URL and return a data URL (avoids CORS issues in preview)
  const preloadImage = useCallback((url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Convert to data URL via canvas to avoid CORS in preview
        try {
          const c = document.createElement("canvas");
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          const ctx2 = c.getContext("2d")!;
          ctx2.drawImage(img, 0, 0);
          resolve(c.toDataURL("image/jpeg", 0.92));
        } catch {
          resolve(url); // fallback: use URL directly
        }
      };
      img.onerror = () => reject(new Error("load failed"));
      img.src = url;
    });
  }, []);

  const handleAiGenerate = useCallback(async () => {
    if (!aiPrompt.trim() || aiGenerating) return;
    setAiGenerating(true);
    setBgLoading(true);
    setAiError("");
    setBgImage(null);

    let imageUrl = "";
    try {
      const result = await generateBgMutation.mutateAsync({ prompt: aiPrompt.trim() });
      imageUrl = result.imageUrl;
    } catch {
      // Fallback: build Pollinations URL directly on client
      const encoded = encodeURIComponent(aiPrompt.trim() + " beautiful artistic background, painterly, no text, high quality");
      const seed = Math.floor(Math.random() * 999999);
      imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1080&height=1080&seed=${seed}&nologo=true`;
    }

    setAiGenerating(false);

    // Now preload the image so preview shows it immediately when ready
    try {
      const dataUrl = await preloadImage(imageUrl);
      setBgImage(dataUrl);
      setBgOpacity(0.35);
    } catch {
      // If preload fails, set URL directly and let browser handle it
      setBgImage(imageUrl);
      setBgOpacity(0.35);
    }
    setBgLoading(false);
  }, [aiPrompt, aiGenerating, generateBgMutation, preloadImage]);

  // UI
  const [tab, setTab]           = useState<"content"|"design"|"typo"|"bg"|"extras">("content");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied]     = useState(false);

  const fileRef    = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  // Computed
  const theme = useCustomColors
    ? { bg: customBg, text: customText, border: customBorder, gradient: undefined } as Theme
    : THEMES[themeIdx];
  const cardW = SIZES[sizeIdx].name === "কাস্টম" ? customW : SIZES[sizeIdx].w;
  const cardH = SIZES[sizeIdx].name === "কাস্টম" ? customH : SIZES[sizeIdx].h;
  const fontCss = FONT_CSS[fontKey] || "'Tiro Bangla', serif";

  useEffect(() => {
    const update = () => {
      if (!previewRef.current) return;
      const cw = previewRef.current.clientWidth - 32;
      const ch = window.innerHeight * 0.55;
      setScale(Math.min(cw / cardW, ch / cardH, 1));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [cardW, cardH]);

  // ── Canvas export ─────────────────────────────────────────────────────────
  const buildCanvas = useCallback(async (): Promise<HTMLCanvasElement> => {
    await Promise.all([ensureFontLoaded(titleFontKey), ensureFontLoaded(bodyFontKey), ensureFontLoaded(authorFontKey), ensureFontLoaded(fontKey)]);
    await document.fonts.ready;

    const DPR = 2;
    const canvas = document.createElement("canvas");
    canvas.width  = cardW * DPR;
    canvas.height = cardH * DPR;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(DPR, DPR);

    // Background
    if (theme.gradient) {
      const parts = theme.gradient.match(/linear-gradient\(([^,]+),(.*)\)/s);
      if (parts) {
        const angle = parts[1].trim();
        const deg = parseFloat(angle) || 135;
        const rad = (deg - 90) * Math.PI / 180;
        const cx = cardW / 2, cy = cardH / 2;
        const len = Math.sqrt(cardW ** 2 + cardH ** 2) / 2;
        const grad = ctx.createLinearGradient(
          cx - Math.cos(rad) * len, cy - Math.sin(rad) * len,
          cx + Math.cos(rad) * len, cy + Math.sin(rad) * len
        );
        const stops = parts[2].match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g) || [];
        stops.forEach((c, i) => grad.addColorStop(i / Math.max(stops.length - 1, 1), c));
        ctx.fillStyle = grad;
      } else { ctx.fillStyle = theme.bg; }
    } else { ctx.fillStyle = theme.bg; }
    ctx.fillRect(0, 0, cardW, cardH);

    // Pattern
    if (pattern !== "none") drawPattern(ctx, pattern, cardW, cardH, theme.text);

    // Background image
    if (bgImage) {
      await new Promise<void>(res => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          if (bgBlur) ctx.filter = "blur(8px)";
          ctx.globalAlpha = bgOpacity;
          ctx.drawImage(img, 0, 0, cardW, cardH);
          ctx.restore();
          res();
        };
        img.onerror = () => res();
        img.src = bgImage;
      });
    }

    // Watermark — full background cover
    if (showWatermark) {
      await new Promise<void>(res => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          ctx.globalAlpha = watermarkOpacity / 100;
          // Cover the entire card
          const imgAspect = img.naturalWidth / img.naturalHeight;
          const cardAspect = cardW / cardH;
          let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
          if (imgAspect > cardAspect) {
            sw = img.naturalHeight * cardAspect;
            sx = (img.naturalWidth - sw) / 2;
          } else {
            sh = img.naturalWidth / cardAspect;
            sy = (img.naturalHeight - sh) / 2;
          }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cardW, cardH);
          ctx.restore();
          res();
        };
        img.onerror = () => res();
        img.src = AUTHOR_PHOTO;
      });
    }

    // Frame
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1.5;
    if (frame === "inner-border") {
      ctx.save(); ctx.globalAlpha = 0.5;
      ctx.strokeRect(16, 16, cardW - 32, cardH - 32);
      ctx.restore();
    } else if (frame === "corner") {
      const cs = 50;
      ctx.save(); ctx.globalAlpha = 0.7;
      [{ x: 16, y: 16, dx: 1, dy: 1 }, { x: cardW - 16, y: 16, dx: -1, dy: 1 },
       { x: 16, y: cardH - 16, dx: 1, dy: -1 }, { x: cardW - 16, y: cardH - 16, dx: -1, dy: -1 }
      ].forEach(({ x, y, dx, dy }) => {
        ctx.beginPath(); ctx.moveTo(x + cs * dx, y); ctx.lineTo(x, y); ctx.lineTo(x, y + cs * dy); ctx.stroke();
      });
      ctx.restore();
    } else if (frame === "double-border") {
      ctx.save();
      ctx.globalAlpha = 0.5; ctx.strokeRect(10, 10, cardW - 20, cardH - 20);
      ctx.globalAlpha = 0.3; ctx.strokeRect(22, 22, cardW - 44, cardH - 44);
      ctx.restore();
    } else if (frame === "left-bar") {
      ctx.save(); ctx.globalAlpha = 0.8; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(padding / 2, padding); ctx.lineTo(padding / 2, cardH - padding); ctx.stroke();
      ctx.restore();
    } else if (frame === "shadow-frame") {
      ctx.save();
      ctx.shadowColor = theme.border; ctx.shadowBlur = 30;
      ctx.globalAlpha = 0.4;
      ctx.strokeRect(20, 20, cardW - 40, cardH - 40);
      ctx.restore();
    } else if (frame === "ornate") {
      ctx.save(); ctx.globalAlpha = 0.55;
      ctx.strokeRect(12, 12, cardW - 24, cardH - 24);
      ctx.globalAlpha = 0.25;
      ctx.strokeRect(20, 20, cardW - 40, cardH - 40);
      // corner diamonds
      const pts = [[24, 24], [cardW - 24, 24], [24, cardH - 24], [cardW - 24, cardH - 24]];
      ctx.globalAlpha = 0.5;
      pts.forEach(([px, py]) => {
        ctx.beginPath(); ctx.moveTo(px, py - 8); ctx.lineTo(px + 8, py);
        ctx.lineTo(px, py + 8); ctx.lineTo(px - 8, py); ctx.closePath(); ctx.stroke();
      });
      ctx.restore();
    } else if (frame === "dot-corner") {
      ctx.save(); ctx.globalAlpha = 0.6;
      const dotPts = [[20, 20], [cardW - 20, 20], [20, cardH - 20], [cardW - 20, cardH - 20]];
      dotPts.forEach(([px, py]) => {
        for (let d = 0; d < 3; d++) {
          ctx.beginPath(); ctx.arc(px + d * 8 * (px < cardW / 2 ? 1 : -1), py, 2, 0, Math.PI * 2);
          ctx.fillStyle = theme.border; ctx.fill();
          ctx.beginPath(); ctx.arc(px, py + d * 8 * (py < cardH / 2 ? 1 : -1), 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
    }

    // Text
    const titleFF  = `${titleFontKey}, 'Tiro Bangla', serif`;
    const bodyFF   = `${bodyFontKey}, 'Tiro Bangla', serif`;
    const authorFF = `${authorFontKey}, 'Tiro Bangla', serif`;
    ctx.fillStyle = theme.text;
    const maxW = cardW - padding * 2;
    const tx = align === "center" ? cardW / 2 : align === "right" ? cardW - padding : padding;
    ctx.textAlign = align;
    if (textShadow) { ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; }
    if (textGlow)   { ctx.shadowColor = theme.border; ctx.shadowBlur = 20; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }

    // Measure total height
    let totalH = 0;
    if (sticker) totalH += 80;
    if (showTitle && title) {
      ctx.font = `${italicTitle ? "italic " : ""}bold ${titleSize}px ${titleFF}`;
      totalH += wrapText(ctx, title, maxW).length * titleSize * 1.3 + 20;
    }
    ctx.font = `${boldBody ? "bold " : ""}${bodySize}px ${bodyFF}`;
    const bLines = wrapText(ctx, body, maxW);
    bLines.forEach(l => { totalH += l === "" ? bodySize * 0.6 : bodySize * lineH; });
    if (showAuthor && author) totalH += authorSize + 28;

    let cy = Math.max(padding, (cardH - totalH) / 2);

    // Sticker
    if (sticker) {
      ctx.font = "60px serif";
      ctx.textAlign = "center";
      ctx.fillText(sticker, cardW / 2, cy + 60);
      ctx.textAlign = align;
      cy += 80;
    }

    // Title (NO divider line)
    if (showTitle && title) {
      ctx.font = `${italicTitle ? "italic " : ""}bold ${titleSize}px ${titleFF}`;
      const tLines = wrapText(ctx, title, maxW);
      for (const line of tLines) {
        ctx.fillText(line, tx, cy + titleSize);
        cy += titleSize * 1.3;
      }
      cy += 20;
    }

    // Body
    ctx.font = `${boldBody ? "bold " : ""}${bodySize}px ${bodyFF}`;
    for (const line of bLines) {
      if (line === "") { cy += bodySize * 0.6; continue; }
      ctx.fillText(line, tx, cy + bodySize);
      cy += bodySize * lineH;
    }

    // Author (NO divider line)
    if (showAuthor && author) {
      cy += 16;
      ctx.save();
      ctx.globalAlpha = authorOpacity / 100;
      ctx.font = `italic ${authorSize}px ${authorFF}`;
      ctx.fillText(author, tx, cy + authorSize);
      ctx.restore();
    }

    return canvas;
  }, [theme, fontKey, titleFontKey, bodyFontKey, authorFontKey, cardW, cardH, title, body, author, showTitle, showAuthor,
      titleSize, bodySize, authorSize, lineH, align, padding, letterSp, frame, pattern,
      bgImage, bgOpacity, bgBlur, textShadow, textGlow, boldBody, italicTitle,
      authorOpacity, sticker, showWatermark, watermarkOpacity]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const canvas = await buildCanvas();
      const a = document.createElement("a");
      a.download = `${title || "ডিজাইন"}.png`;
      a.href = canvas.toDataURL("image/png");
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (e) { console.error(e); alert("ডাউনলোড করতে সমস্যা হয়েছে।"); }
    setDownloading(false);
  }, [buildCanvas, title]);

  const handleCopyToClipboard = useCallback(async () => {
    try {
      const canvas = await buildCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }, "image/png");
    } catch { alert("ক্লিপবোর্ডে কপি করা যায়নি।"); }
  }, [buildCanvas]);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setBgImage(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  // ── Sub-components ────────────────────────────────────────────────────────
  const TabBtn = ({ id, label, emoji }: { id: typeof tab; label: string; emoji: string }) => (
    <button onClick={() => setTab(id)}
      className={`flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl text-xs font-semibold transition-all flex-1 ${
        tab === id ? "bg-[#D4A843] text-black" : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}>
      <span className="text-base leading-none">{emoji}</span>
      <span className="text-[10px]">{label}</span>
    </button>
  );

  const Slider = ({ label, val, set, min, max, step = 1, unit = "px" }: {
    label: string; val: number; set: (v: number) => void;
    min: number; max: number; step?: number; unit?: string;
  }) => (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-gray-400 text-xs">{label}</span>
        <span className="text-[#D4A843] text-xs font-bold">{val}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => set(+e.target.value)}
        className="w-full h-1.5 rounded-full accent-[#D4A843] cursor-pointer" />
    </div>
  );

  const textShadowStyle = textShadow
    ? { textShadow: "2px 2px 8px rgba(0,0,0,0.5)" }
    : textGlow
      ? { textShadow: `0 0 20px ${theme.border}, 0 0 40px ${theme.border}80` }
      : {};

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060c18]">
      <Seo title="ডিজাইন ফরম্যাট | মাহবুব সরদার সবুজ"
        description="বাংলা লেখার কার্ড ডিজাইন করুন ও PNG ডাউনলোড করুন" />
      <Navbar />

      <div className="pt-20 pb-12 px-3 md:px-5">
        <div className="max-w-[1440px] mx-auto">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 border border-[#D4A843]/25 rounded-full px-5 py-1.5 mb-3">
              <span className="text-[#D4A843] text-xs font-bold tracking-widest uppercase">✦ ডিজাইন ফরম্যাট ✦</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              আপনার লেখা <span className="text-[#D4A843]">সুন্দরভাবে</span> সাজান
            </h1>
            <p className="text-gray-400 text-sm md:text-base">ফন্ট · থিম · ফ্রেম · ইফেক্ট বেছে নিন — এক ক্লিকে PNG ডাউনলোড করুন</p>
          </div>

          <div className="flex flex-col xl:flex-row gap-4">

            {/* ══ LEFT PANEL ══ */}
            <div className="xl:w-[420px] flex-shrink-0 flex flex-col gap-3">

              {/* Tab Bar */}
              <div className="bg-[#0f1c2e] rounded-2xl p-1.5 border border-[#1e3050] flex gap-1">
                <TabBtn id="content" label="লেখা"    emoji="✏️" />
                <TabBtn id="design"  label="ডিজাইন"  emoji="🎨" />
                <TabBtn id="typo"    label="টাইপো"   emoji="🔤" />
                <TabBtn id="bg"      label="পটভূমি"  emoji="🖼️" />
                <TabBtn id="extras"  label="এক্সট্রা" emoji="✨" />
              </div>

              {/* ── Content Tab ── */}
              {tab === "content" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-4">
                  <h3 className="text-[#D4A843] text-xs font-bold uppercase tracking-widest">লেখার বিষয়বস্তু</h3>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showTitle} onChange={e => setShowTitle(e.target.checked)} className="w-4 h-4 accent-[#D4A843]" />
                    <span className="text-gray-300 text-sm font-medium">শিরোনাম দেখাও</span>
                  </label>
                  {showTitle && (
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="শিরোনাম লিখুন..."
                      className="w-full bg-[#0a1525] text-white border border-[#1e3050] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A843] transition-colors" />
                  )}

                  <div>
                    <label className="text-gray-300 text-sm font-medium block mb-1.5">মূল লেখা</label>
                    <textarea value={body} onChange={e => setBody(e.target.value)} rows={7}
                      placeholder="কবিতা, উক্তি বা মনের কথা..."
                      className="w-full bg-[#0a1525] text-white border border-[#1e3050] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A843] resize-y transition-colors leading-relaxed" />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showAuthor} onChange={e => setShowAuthor(e.target.checked)} className="w-4 h-4 accent-[#D4A843]" />
                    <span className="text-gray-300 text-sm font-medium">লেখক নাম</span>
                  </label>
                  {showAuthor && (
                    <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="লেখকের নাম..."
                      className="w-full bg-[#0a1525] text-white border border-[#1e3050] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A843] transition-colors" />
                  )}
                </div>
              )}

              {/* ── Design Tab ── */}
              {tab === "design" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-5">
                  <h3 className="text-[#D4A843] text-xs font-bold uppercase tracking-widest">ডিজাইন</h3>

                  {/* Themes */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">রঙের থিম ({THEMES.length}টি)</label>
                    <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                      {THEMES.map((t, i) => (
                        <button key={t.name} onClick={() => { setThemeIdx(i); setUseCustomColors(false); }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                            !useCustomColors && themeIdx === i
                              ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                              : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                          }`}>
                          <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
                            style={{ background: t.gradient || t.bg }} />
                          <span className="truncate">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input type="checkbox" checked={useCustomColors} onChange={e => setUseCustomColors(e.target.checked)} className="w-4 h-4 accent-[#D4A843]" />
                      <span className="text-gray-300 text-sm font-medium">কাস্টম রঙ</span>
                    </label>
                    {useCustomColors && (
                      <div className="grid grid-cols-3 gap-3">
                        {([["পটভূমি", customBg, setCustomBg], ["লেখা", customText, setCustomText], ["বর্ডার", customBorder, setCustomBorder]] as const).map(([lbl, val, set]) => (
                          <div key={lbl} className="flex flex-col items-center gap-1">
                            <span className="text-gray-500 text-xs">{lbl}</span>
                            <input type="color" value={val} onChange={e => (set as (v: string) => void)(e.target.value)}
                              className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Per-element Fonts */}
                  <div className="space-y-4">
                    <label className="text-gray-400 text-xs font-semibold block">ফন্ট (আলাদা আলাদা)</label>

                    {/* Quick apply all */}
                    <div>
                      <p className="text-gray-600 text-xs mb-1.5">সবকিছুতে এক ফন্ট</p>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {FONTS.map(f => (
                          <button key={f.value} onClick={() => { setFontKey(f.value); setTitleFontKey(f.value); setBodyFontKey(f.value); setAuthorFontKey(f.value); }}
                            className={`w-full text-left px-3 py-2 rounded-xl border text-sm transition-all ${
                              fontKey === f.value
                                ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                                : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                            }`}
                            style={{ fontFamily: FONT_CSS[f.value] }}>
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title font */}
                    <div>
                      <p className="text-[#D4A843] text-xs font-semibold mb-1.5">শিরোনামের ফন্ট</p>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {FONTS.map(f => (
                          <button key={f.value} onClick={() => setTitleFontKey(f.value)}
                            className={`w-full text-left px-3 py-2 rounded-xl border text-sm transition-all ${
                              titleFontKey === f.value
                                ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                                : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                            }`}
                            style={{ fontFamily: FONT_CSS[f.value] }}>
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Body font */}
                    <div>
                      <p className="text-[#D4A843] text-xs font-semibold mb-1.5">মূল লেখার ফন্ট</p>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {FONTS.map(f => (
                          <button key={f.value} onClick={() => setBodyFontKey(f.value)}
                            className={`w-full text-left px-3 py-2 rounded-xl border text-sm transition-all ${
                              bodyFontKey === f.value
                                ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                                : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                            }`}
                            style={{ fontFamily: FONT_CSS[f.value] }}>
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Author font */}
                    <div>
                      <p className="text-[#D4A843] text-xs font-semibold mb-1.5">লেখক নামের ফন্ট</p>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {FONTS.map(f => (
                          <button key={f.value} onClick={() => setAuthorFontKey(f.value)}
                            className={`w-full text-left px-3 py-2 rounded-xl border text-sm transition-all ${
                              authorFontKey === f.value
                                ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                                : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                            }`}
                            style={{ fontFamily: FONT_CSS[f.value] }}>
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">কার্ডের আকার</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SIZES.map((s, i) => (
                        <button key={s.name} onClick={() => setSizeIdx(i)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                            sizeIdx === i
                              ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                              : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                          }`}>
                          <span>{s.icon}</span> {s.name}
                        </button>
                      ))}
                    </div>
                    {SIZES[sizeIdx].name === "কাস্টম" && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[["প্রস্থ", customW, setCustomW], ["উচ্চতা", customH, setCustomH]].map(([lbl, val, set]) => (
                          <div key={lbl as string}>
                            <label className="text-gray-500 text-xs mb-1 block">{lbl as string} (px)</label>
                            <input type="number" value={val as number} onChange={e => (set as (v: number) => void)(+e.target.value)}
                              className="w-full bg-[#0a1525] text-white border border-[#1e3050] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843]" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Frame */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">ফ্রেম স্টাইল</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {FRAMES.map(d => (
                        <button key={d.value} onClick={() => setFrame(d.value)}
                          className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                            frame === d.value
                              ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                              : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                          }`}>
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pattern */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">প্যাটার্ন ব্যাকগ্রাউন্ড</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {PATTERNS.map(p => (
                        <button key={p.value} onClick={() => setPattern(p.value)}
                          className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                            pattern === p.value
                              ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                              : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                          }`}>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Typography Tab ── */}
              {tab === "typo" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-4">
                  <h3 className="text-[#D4A843] text-xs font-bold uppercase tracking-widest">টাইপোগ্রাফি</h3>
                  <Slider label="শিরোনামের আকার"    val={titleSize}   set={setTitleSize}   min={24} max={120} />
                  <Slider label="লেখার আকার"        val={bodySize}    set={setBodySize}    min={16} max={80} />
                  <Slider label="লেখকের নামের আকার" val={authorSize}  set={setAuthorSize}  min={14} max={60} />
                  <Slider label="লেখকের নামের স্বচ্ছতা" val={authorOpacity} set={setAuthorOpacity} min={20} max={100} unit="%" />
                  <Slider label="লাইনের উচ্চতা"    val={lineH}       set={setLineH}       min={1.2} max={3.0} step={0.1} unit="x" />
                  <Slider label="প্যাডিং"           val={padding}     set={setPadding}     min={20} max={150} />
                  <Slider label="অক্ষর ব্যবধান"     val={letterSp}    set={setLetterSp}    min={-1} max={5} step={0.1} />

                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">টেক্সট সারবদ্ধতা</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["left", "center", "right"] as const).map(a => (
                        <button key={a} onClick={() => setAlign(a)}
                          className={`py-2 rounded-xl border text-xs font-medium transition-all ${
                            align === a
                              ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                              : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                          }`}>
                          {a === "left" ? "⬅ বাম" : a === "center" ? "↔ মাঝ" : "➡ ডান"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["টেক্সট শ্যাডো", textShadow, setTextShadow],
                      ["টেক্সট গ্লো",   textGlow,   setTextGlow],
                      ["বোল্ড লেখা",    boldBody,   setBoldBody],
                      ["ইটালিক শিরোনাম", italicTitle, setItalicTitle],
                    ].map(([lbl, val, set]) => (
                      <label key={lbl as string} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={val as boolean}
                          onChange={e => (set as (v: boolean) => void)(e.target.checked)}
                          className="w-4 h-4 accent-[#D4A843]" />
                        <span className="text-gray-300 text-sm">{lbl as string}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Background Tab ── */}
              {tab === "bg" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-4">
                  <h3 className="text-[#D4A843] text-xs font-bold uppercase tracking-widest">পটভূমি ও ওয়াটারমার্ক</h3>

                  {/* ── AI Background Generator ── */}
                  <div className="bg-gradient-to-br from-[#0a1525] to-[#0f1c2e] rounded-2xl p-4 border border-[#D4A843]/20 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <img src={AUTHOR_PHOTO} alt="" className="w-7 h-7 rounded-full object-cover border border-[#D4A843]/40" />
                      <span className="text-[#D4A843] text-sm font-bold">AI ব্যাকগ্রাউন্ড তৈরি করুন</span>
                    </div>
                    <p className="text-gray-500 text-xs">বাংলায় লিখুন — AI আপনার জন্য সুন্দর ব্যাকগ্রাউন্ড তৈরি করবে</p>
                    <textarea
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      placeholder="যেমন: রাতের আকাশে তারা, বাংলাদেশের সবুজ মাঠ, গোলাপ ফুলের বাগান..."
                      rows={3}
                      className="w-full bg-[#060c18] text-white border border-[#1e3050] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A843] resize-none placeholder-gray-600 transition-colors"
                    />
                    {aiError && <p className="text-red-400 text-xs">{aiError}</p>}
                    <button
                      onClick={handleAiGenerate}
                      disabled={!aiPrompt.trim() || aiGenerating || bgLoading}
                      className="w-full py-3 bg-gradient-to-r from-[#D4A843] to-[#c49030] hover:from-[#c49030] hover:to-[#b07820] text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aiGenerating ? (
                        <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> AI ছবি তৈরি হচ্ছে...</>
                      ) : bgLoading ? (
                        <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> প্রিভিউতে লোড হচ্ছে...</>
                      ) : (
                        <>✨ AI দিয়ে ব্যাকগ্রাউন্ড তৈরি করুন</>
                      )}
                    </button>
                    {bgImage && !bgLoading && (
                      <div className="flex items-center gap-2 text-green-400 text-xs">
                        <span>✓</span> AI ব্যাকগ্রাউন্ড প্রিভিউতে দেখা যাচ্ছে ↓
                      </div>
                    )}
                    {bgLoading && (
                      <div className="flex items-center gap-2 text-yellow-400 text-xs">
                        <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" /> প্রিভিউতে যোগ হচ্ছে, দয়া করে অপেক্ষা করুন...
                      </div>
                    )}
                  </div>

                  {/* Manual upload */}
                  <div className="border-t border-[#1e3050] pt-3">
                    <p className="text-gray-500 text-xs mb-2">অথবা নিজে ছবি আপলোড করুন</p>
                    <button onClick={() => fileRef.current?.click()}
                      className="w-full py-3 bg-[#0a1525] hover:bg-[#0f1c2e] text-gray-300 rounded-2xl border-2 border-dashed border-[#1e3050] hover:border-[#D4A843] transition-all text-sm">
                      {bgImage && !bgImage.includes("pollinations") ? "✓ ছবি নির্বাচিত — পরিবর্তন করুন" : "📁 পটভূমির ছবি আপলোড করুন"}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
                  </div>

                  {bgImage && (
                    <>
                      <Slider label="ছবির স্বচ্ছতা" val={Math.round(bgOpacity * 100)} set={v => setBgOpacity(v / 100)} min={2} max={100} step={2} unit="%" />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={bgBlur} onChange={e => setBgBlur(e.target.checked)} className="w-4 h-4 accent-[#D4A843]" />
                        <span className="text-gray-300 text-sm">ছবি ব্লার করুন</span>
                      </label>
                      <button onClick={() => setBgImage(null)}
                        className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-xl text-sm transition-all border border-red-900/40">
                        ছবি সরিয়ে দিন
                      </button>
                    </>
                  )}

                  {/* Watermark — full background cover */}
                  <div className="border-t border-[#1e3050] pt-4">
                    <label className="flex items-center gap-2 cursor-pointer mb-1">
                      <input type="checkbox" checked={showWatermark} onChange={e => setShowWatermark(e.target.checked)} className="w-4 h-4 accent-[#D4A843]" />
                      <span className="text-gray-300 text-sm font-medium">লেখকের ছবি ওয়াটারমার্ক (পুরো পটভূমি)</span>
                    </label>
                    <p className="text-gray-600 text-xs mb-2">লেখকের ছবি পুরো কার্ডের ব্যাকগ্রাউন্ডে watermark হিসেবে দেখাবে</p>
                    {showWatermark && (
                      <Slider label="ওয়াটারমার্ক স্বচ্ছতা" val={watermarkOpacity} set={setWatermarkOpacity} min={3} max={40} unit="%" />
                    )}
                  </div>
                </div>
              )}

              {/* ── Extras Tab ── */}
              {tab === "extras" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-4">
                  <h3 className="text-[#D4A843] text-xs font-bold uppercase tracking-widest">অতিরিক্ত সজ্জা</h3>

                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">ইমোজি স্টিকার (উপরে)</label>
                    <div className="grid grid-cols-8 gap-1">
                      <button onClick={() => setSticker("")}
                        className={`text-xs py-1.5 rounded-lg border transition-all ${!sticker ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]" : "border-[#1e3050] text-gray-500 hover:border-[#D4A843]/40"}`}>
                        ✕
                      </button>
                      {STICKERS.map(s => (
                        <button key={s} onClick={() => setSticker(s)}
                          className={`text-lg py-0.5 rounded-lg border transition-all ${sticker === s ? "border-[#D4A843] bg-[#D4A843]/10" : "border-[#1e3050] hover:border-[#D4A843]/40"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">দ্রুত টেমপ্লেট</label>
                    <div className="space-y-2">
                      {TEMPLATES.map(tmpl => (
                        <button key={tmpl.label}
                          onClick={() => { setTitle(tmpl.t); setBody(tmpl.b); setAuthor(tmpl.a); setShowTitle(true); setShowAuthor(true); }}
                          className="w-full text-left px-3 py-2.5 bg-[#0a1525] hover:bg-[#1e3050] text-gray-300 rounded-xl text-xs border border-[#1e3050] hover:border-[#D4A843]/40 transition-all">
                          📝 {tmpl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Download & Copy Buttons ── */}
              <div className="space-y-2">
                <button onClick={handleDownload} disabled={downloading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#D4A843] to-[#c49030] hover:from-[#c49030] hover:to-[#b07820] text-black font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-[#D4A843]/20">
                  {downloading ? (
                    <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> ডাউনলোড হচ্ছে...</>
                  ) : (
                    <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> PNG ডাউনলোড করুন</>
                  )}
                </button>
                <button onClick={handleCopyToClipboard}
                  className="w-full py-2.5 bg-[#0f1c2e] hover:bg-[#1e3050] text-[#D4A843] font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all border border-[#D4A843]/30 hover:border-[#D4A843] text-sm">
                  {copied ? "✓ ক্লিপবোর্ডে কপি হয়েছে!" : "📋 ক্লিপবোর্ডে কপি করুন"}
                </button>
                <p className="text-gray-600 text-xs text-center">আসল আকার: {cardW} × {cardH} px · 2x রেজোলিউশন</p>
              </div>
            </div>

            {/* ══ RIGHT PANEL: Live Preview ══ */}
            <div className="flex-1 flex flex-col items-center" ref={previewRef}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D4A843]/30" />
                <span className="text-[#D4A843]/60 text-xs uppercase tracking-widest font-semibold">লাইভ প্রিভিউ</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D4A843]/30" />
              </div>

              {/* Preview wrapper */}
              <div style={{
                width: cardW * scale, height: cardH * scale,
                position: "relative", flexShrink: 0,
                boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,168,67,0.12)",
                borderRadius: 8, overflow: "hidden",
              }}>
                {/* Card at full size, scaled down */}
                <div style={{
                  width: cardW, height: cardH,
                  background: theme.gradient || theme.bg,
                  color: theme.text, fontFamily: fontCss, padding,
                  position: "absolute", top: 0, left: 0,
                  transform: `scale(${scale})`, transformOrigin: "top left",
                  overflow: "hidden", display: "flex", flexDirection: "column",
                  justifyContent: "center", boxSizing: "border-box",
                  textAlign: align, letterSpacing: `${letterSp}px`,
                }}>
                  {/* Pattern */}
                  {pattern !== "none" && (
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 0, opacity: 0.06,
                      backgroundImage:
                        pattern === "dots"     ? `radial-gradient(circle, ${theme.text} 1.5px, transparent 1.5px)` :
                        pattern === "lines"    ? `repeating-linear-gradient(0deg, ${theme.text} 0, ${theme.text} 1px, transparent 1px, transparent 24px)` :
                        pattern === "grid"     ? `repeating-linear-gradient(0deg, ${theme.text} 0, ${theme.text} 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, ${theme.text} 0, ${theme.text} 1px, transparent 1px, transparent 40px)` :
                        pattern === "diagonal" ? `repeating-linear-gradient(45deg, ${theme.text} 0, ${theme.text} 1px, transparent 1px, transparent 32px)` : "none",
                      backgroundSize:
                        pattern === "dots" ? "30px 30px" :
                        pattern === "grid" ? "40px 40px" : undefined,
                    }} />
                  )}

                  {/* Background image */}
                  {bgImage && (
                    <div style={{
                      position: "absolute", inset: 0,
                      backgroundImage: `url(${bgImage})`,
                      backgroundSize: "cover", backgroundPosition: "center",
                      opacity: bgOpacity, filter: bgBlur ? "blur(8px)" : "none", zIndex: 0,
                    }} />
                  )}

                  {/* Watermark — full background cover */}
                  {showWatermark && (
                    <div style={{
                      position: "absolute", inset: 0,
                      backgroundImage: `url(${AUTHOR_PHOTO})`,
                      backgroundSize: "cover", backgroundPosition: "center top",
                      opacity: watermarkOpacity / 100, zIndex: 0, pointerEvents: "none",
                    }} />
                  )}

                  {/* Frames */}
                  {frame === "inner-border" && (
                    <div style={{ position: "absolute", inset: 16, border: `1.5px solid ${theme.border}`, opacity: 0.5, zIndex: 1, pointerEvents: "none" }} />
                  )}
                  {frame === "corner" && (
                    <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
                      {[
                        { top: 16, left: 16, borderTop: `1.5px solid ${theme.border}`, borderLeft: `1.5px solid ${theme.border}` },
                        { top: 16, right: 16, borderTop: `1.5px solid ${theme.border}`, borderRight: `1.5px solid ${theme.border}` },
                        { bottom: 16, left: 16, borderBottom: `1.5px solid ${theme.border}`, borderLeft: `1.5px solid ${theme.border}` },
                        { bottom: 16, right: 16, borderBottom: `1.5px solid ${theme.border}`, borderRight: `1.5px solid ${theme.border}` },
                      ].map((s, i) => <div key={i} style={{ position: "absolute", width: 50, height: 50, opacity: 0.7, ...s }} />)}
                    </div>
                  )}
                  {frame === "double-border" && (
                    <>
                      <div style={{ position: "absolute", inset: 10, border: `1.5px solid ${theme.border}`, opacity: 0.5, zIndex: 1, pointerEvents: "none" }} />
                      <div style={{ position: "absolute", inset: 22, border: `1.5px solid ${theme.border}`, opacity: 0.3, zIndex: 1, pointerEvents: "none" }} />
                    </>
                  )}
                  {frame === "left-bar" && (
                    <div style={{ position: "absolute", top: padding, bottom: padding, left: padding / 2 - 2, width: 5, backgroundColor: theme.border, opacity: 0.8, zIndex: 1, borderRadius: 3 }} />
                  )}
                  {frame === "shadow-frame" && (
                    <div style={{ position: "absolute", inset: 20, border: `1.5px solid ${theme.border}`, opacity: 0.4, zIndex: 1, pointerEvents: "none", boxShadow: `0 0 30px ${theme.border}` }} />
                  )}
                  {frame === "ornate" && (
                    <>
                      <div style={{ position: "absolute", inset: 12, border: `1.5px solid ${theme.border}`, opacity: 0.55, zIndex: 1, pointerEvents: "none" }} />
                      <div style={{ position: "absolute", inset: 20, border: `1.5px solid ${theme.border}`, opacity: 0.25, zIndex: 1, pointerEvents: "none" }} />
                    </>
                  )}
                  {frame === "dot-corner" && (
                    <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
                      {[[20, 20, 1, 1], [cardW - 20, 20, -1, 1], [20, cardH - 20, 1, -1], [cardW - 20, cardH - 20, -1, -1]].map(([px, py, dx, dy], ci) => (
                        <div key={ci} style={{ position: "absolute", left: px - 10, top: py - 10, width: 20, height: 20 }}>
                          {[0, 1, 2].map(d => (
                            <div key={d} style={{
                              position: "absolute", width: 4, height: 4, borderRadius: "50%",
                              backgroundColor: theme.border, opacity: 0.6,
                              left: 8 + d * 8 * dx, top: 8,
                            }} />
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    {sticker && <div style={{ fontSize: 60, marginBottom: 16, textAlign: "center" }}>{sticker}</div>}

                    {/* Title */}
                    {showTitle && title && (
                      <div style={{
                        fontSize: titleSize, fontWeight: "bold",
                        fontFamily: FONT_CSS[titleFontKey] || fontCss,
                        fontStyle: italicTitle ? "italic" : "normal",
                        marginBottom: 20, lineHeight: 1.3,
                        letterSpacing: `${letterSp}px`,
                        ...textShadowStyle,
                      }}>
                        {title}
                      </div>
                    )}

                    {/* Body */}
                    <div style={{
                      fontSize: bodySize, lineHeight: lineH, whiteSpace: "pre-wrap",
                      fontFamily: FONT_CSS[bodyFontKey] || fontCss,
                      letterSpacing: `${letterSp}px`, fontWeight: boldBody ? "bold" : "normal",
                      ...textShadowStyle,
                    }}>
                      {body}
                    </div>

                    {/* Author */}
                    {showAuthor && author && (
                      <div style={{
                        fontSize: authorSize, marginTop: 28,
                        fontFamily: FONT_CSS[authorFontKey] || fontCss,
                        opacity: authorOpacity / 100, fontStyle: "italic",
                        letterSpacing: `${letterSp}px`,
                        ...textShadowStyle,
                      }}>
                        {author}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-xs mt-3">
                স্কেল: {Math.round(scale * 100)}% · {cardW}×{cardH}px
              </p>

              {/* Quick theme dots */}
              <div className="flex gap-2 mt-4 flex-wrap justify-center">
                {THEMES.map((t, i) => (
                  <button key={t.name} onClick={() => { setThemeIdx(i); setUseCustomColors(false); }}
                    title={t.name}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      !useCustomColors && themeIdx === i ? "border-[#D4A843] scale-125" : "border-transparent hover:border-[#D4A843]/50"
                    }`}
                    style={{ background: t.gradient || t.bg }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
