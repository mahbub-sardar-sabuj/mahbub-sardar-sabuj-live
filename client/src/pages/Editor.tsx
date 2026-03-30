/**
 * ডিজাইন ফরম্যাট — Premium Bengali Writing Card Designer v4
 *
 * নতুন ফিচার:
 *  - লাইভ প্রিভিউ উপরে, নিচে কন্ট্রোল প্যানেল (মোবাইল-ফার্স্ট)
 *  - শিরোনাম / মূল লেখা / লেখক নাম — প্রতিটি ড্র্যাগযোগ্য লেয়ার
 *  - প্রতিটি টেক্সটের আলাদা কাস্টম কালার
 *  - লেখক নাম ডিফল্টে সোজা (non-italic)
 *  - লেখক নাম ফরম্যাট: ___❐ মাহবুব সরদার সবুজ
 *  - পটভূমি সেটিংস ডিজাইন ট্যাবে মার্জ
 *  - ক্লিপবোর্ড কপি অপশন সরানো হয়েছে
 *  - ইমোজি স্টিকার ড্র্যাগযোগ্য
 *  - ছবি আপলোড + ১২ ফিল্টার প্রিসেট
 *  - ৬-ট্যাব প্রিমিয়াম UI
 */
import { useState, useRef, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FONTS = [
  { name: "চন্দ্রশীলা",           value: "ChandraSheela" },
  { name: "চন্দ্রশীলা প্রিমিয়াম", value: "ChandraSheelaPremium" },
  { name: "মাহবুব সরদার ফন্ট",    value: "MahbubSardarSabujFont" },
  { name: "মাসুদ নান্দনিক",        value: "MasudNandanik" },
  { name: "আদর্শ লিপি",           value: "AdorshoLipi" },
  { name: "BH Sabit Adorsho",     value: "BHSabitAdorshoLightUnicode" },
  { name: "BLAB Norha Gram",      value: "BLABNorhaGramUnicode" },
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
  ChandraSheela:              "/fonts/চন্দ্রশীলা.ttf",
  ChandraSheelaPremium:       "/fonts/চন্দ্রশীলাপ্রিমিয়াম.ttf",
  MahbubSardarSabujFont:      "/fonts/মাহবুবসরদারসবুজফন্ট.ttf",
  MasudNandanik:              "/fonts/মাসুদনান্দনিক.ttf",
  AdorshoLipi:                "/fonts/AdorshoLipi.ttf",
  BHSabitAdorshoLightUnicode: "/fonts/BHSabitAdorshoLightUnicode.ttf",
  BLABNorhaGramUnicode:       "/fonts/BLABNorhaGramUnicode.ttf",
  AkhandBengali:              "/fonts/AkhandBengali.ttf",
};

type Theme = { name: string; bg: string; text: string; border: string; gradient?: string };

const THEMES: Theme[] = [
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
  { name: "সানসেট ব্লেজ",  bg: "#f7971e", text: "#1a0000", border: "#ffd200",
    gradient: "linear-gradient(135deg,#f7971e 0%,#ffd200 100%)" },
  { name: "ওশান ডিপ",     bg: "#0575e6", text: "#FFFFFF", border: "#00f2fe",
    gradient: "linear-gradient(135deg,#0575e6 0%,#021b79 100%)" },
  { name: "রোজ গোল্ড",    bg: "#f8b4c8", text: "#3d0020", border: "#c9184a",
    gradient: "linear-gradient(135deg,#f8b4c8 0%,#ffd6a5 100%)" },
  { name: "ফরেস্ট মিস্ট",  bg: "#134e5e", text: "#e0ffe0", border: "#71b280",
    gradient: "linear-gradient(135deg,#134e5e 0%,#71b280 100%)" },
  { name: "মিডনাইট গোল্ড", bg: "#0d1b2a", text: "#D4A843", border: "#D4A843",
    gradient: "linear-gradient(135deg,#0d1b2a 0%,#1a2e4a 60%,#2a1a00 100%)" },
];

const SIZES = [
  { name: "বর্গ (1:1)",       w: 1080, h: 1080 },
  { name: "পোর্ট্রেট (4:5)", w: 1080, h: 1350 },
  { name: "স্টোরি (9:16)",   w: 1080, h: 1920 },
  { name: "আড়াআড়ি (16:9)", w: 1920, h: 1080 },
  { name: "A4 পোর্ট্রেট",   w: 794,  h: 1123 },
  { name: "কাস্টম",          w: 0,    h: 0    },
];

const FRAMES = [
  { name: "ফ্রেম নেই",       value: "none" },
  { name: "ভেতরের বর্ডার",   value: "inner-border" },
  { name: "কোণের অলংকার",   value: "corner" },
  { name: "ডবল বর্ডার",     value: "double-border" },
  { name: "বাম পাশে বার",   value: "left-bar" },
  { name: "শ্যাডো ফ্রেম",   value: "shadow-frame" },
  { name: "অর্নেট ফ্রেম",   value: "ornate" },
  { name: "ডট কর্নার",      value: "dot-corner" },
];

const PATTERNS = [
  { name: "প্যাটার্ন নেই", value: "none" },
  { name: "বিন্দু",        value: "dots" },
  { name: "রেখা",          value: "lines" },
  { name: "গ্রিড",         value: "grid" },
  { name: "তির্যক",        value: "diagonal" },
];

const FILTER_PRESETS = [
  { name: "normal",    filter: "none",                                                         label: "স্বাভাবিক" },
  { name: "vivid",     filter: "saturate(1.8) contrast(1.1)",                                  label: "উজ্জ্বল" },
  { name: "warm",      filter: "sepia(0.3) saturate(1.4) brightness(1.05)",                    label: "উষ্ণ" },
  { name: "cool",      filter: "hue-rotate(20deg) saturate(1.2) brightness(1.05)",             label: "শীতল" },
  { name: "vintage",   filter: "sepia(0.6) contrast(1.1) brightness(0.9) saturate(0.8)",       label: "ভিনটেজ" },
  { name: "bw",        filter: "grayscale(1)",                                                 label: "সাদাকালো" },
  { name: "dramatic",  filter: "contrast(1.4) brightness(0.85) saturate(1.2)",                 label: "নাটকীয়" },
  { name: "fade",      filter: "brightness(1.1) contrast(0.85) saturate(0.7)",                 label: "ফেড" },
  { name: "golden",    filter: "sepia(0.4) saturate(1.6) hue-rotate(-10deg) brightness(1.05)", label: "সোনালি" },
  { name: "moonlight", filter: "brightness(0.8) contrast(1.2) hue-rotate(200deg) saturate(0.6)", label: "জ্যোৎস্না" },
  { name: "matte",     filter: "contrast(0.9) brightness(1.1) saturate(0.85)",                 label: "ম্যাট" },
  { name: "pop",       filter: "saturate(2) contrast(1.15) brightness(1.05)",                  label: "পপ" },
];

const STICKER_LIST = [
  "🌸","🌙","⭐","✨","🌿","🦋","🕊️","🌹","💫","🔥","🌊","🎋",
  "🌺","💎","🪷","🌟","🏵️","🌴","🎑","🌾","🎐","🎍","🍂","🌻",
  "❤️","💛","💙","💜","🤍","🖤","🌈","☁️","⚡","🌑","🌕","🍃",
  "🌷","🫧","🪐","🎆","🎇","🧿","🔮","🪬","🌠","🎴","🀄","🎭",
  "🎪","🎨","🖌️","🪞","🕯️","📿","🧸","🪆","🎭","🌃","🌉","🌌",
];

const TEMPLATES = [
  { label: "প্রেমের কবিতা",  title: "ভালোবাসা",        body: "ভালোবাসা আমার কাছে\nতোমার হাসির মতো সহজ,\nতোমার চোখের মতো গভীর।" },
  { label: "অনুপ্রেরণা",    title: "জীবন",             body: "প্রতিটি ভোরে নতুন সুযোগ আসে,\nসেই সুযোগকে কাজে লাগাও।" },
  { label: "প্রকৃতি",       title: "প্রকৃতির ডাক",    body: "সবুজ পাতার ফাঁকে ফাঁকে\nআলো নামে নীরবে।" },
  { label: "বিচ্ছেদ",       title: "বিচ্ছেদের ব্যথা", body: "যে চলে গেছে সে আর ফেরে না,\nস্মৃতিরা শুধু বুকে জ্বলে।" },
  { label: "আত্মসম্মান",    title: "আত্মসম্মান",       body: "নিজেকে ভালোবাসো সবার আগে,\nআত্মসম্মান হারিও না কখনো।" },
];

const AUTHOR_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** A draggable text block (title / body / author or custom) */
interface TextBlock {
  id: string;
  kind: "title" | "body" | "author" | "custom";
  text: string;
  x: number; // 0–1 fraction
  y: number; // 0–1 fraction
  fontSize: number;
  fontKey: string;
  color: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  shadow: boolean;
  glow: boolean;
  visible: boolean;
  letterSpacing: number;
  lineHeight: number;
}

interface StickerLayer {
  id: string;
  kind: "sticker";
  emoji: string;
  x: number;
  y: number;
  size: number;
}

type Layer = TextBlock | StickerLayer;

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

function drawPatternCanvas(ctx: CanvasRenderingContext2D, pattern: string, w: number, h: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.06;
  ctx.lineWidth = 1;
  if (pattern === "dots") {
    for (let x = 20; x < w; x += 30) for (let y = 20; y < h; y += 30) {
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
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

// ─────────────────────────────────────────────────────────────────────────────
// Default layers factory
// ─────────────────────────────────────────────────────────────────────────────

function makeDefaultLayers(themeText: string): TextBlock[] {
  return [
    {
      id: "title",
      kind: "title",
      text: "শিরোনাম",
      x: 0.5, y: 0.22,
      fontSize: 52,
      fontKey: "ChandraSheela",
      color: themeText,
      bold: true, italic: false,
      align: "center",
      shadow: false, glow: false,
      visible: true,
      letterSpacing: 0.5,
      lineHeight: 1.3,
    },
    {
      id: "body",
      kind: "body",
      text: "এখানে আপনার লেখা লিখুন...\n\nকবিতা, উক্তি বা মনের কথা।",
      x: 0.5, y: 0.52,
      fontSize: 36,
      fontKey: "ChandraSheela",
      color: themeText,
      bold: false, italic: false,
      align: "center",
      shadow: false, glow: false,
      visible: true,
      letterSpacing: 0.5,
      lineHeight: 1.9,
    },
    {
      id: "author",
      kind: "author",
      text: "মাহবুব সরদার সবুজ",
      x: 0.5, y: 0.84,
      fontSize: 28,
      fontKey: "ChandraSheela",
      color: themeText,
      bold: false, italic: false,
      align: "center",
      shadow: false, glow: false,
      visible: true,
      letterSpacing: 0.5,
      lineHeight: 1.4,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Editor() {
  // ── Theme & Design
  const [themeIdx, setThemeIdx] = useState(2);
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [customBg, setCustomBg] = useState("#1a1a2e");
  const [customBorder, setCustomBorder] = useState("#D4A843");
  const [sizeIdx, setSizeIdx] = useState(0);
  const [customW, setCustomW] = useState(800);
  const [customH, setCustomH] = useState(800);
  const [frame, setFrame] = useState("corner");
  const [pattern, setPattern] = useState("none");
  const [padding, setPadding] = useState(60);

  // ── Background / Photo
  const [photoImage, setPhotoImage] = useState<string | null>(null);
  const [filterPreset, setFilterPreset] = useState("normal");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [photoOpacity, setPhotoOpacity] = useState(100);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState(0.12);
  const [bgBlur, setBgBlur] = useState(false);
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkOpacity, setWatermarkOpacity] = useState(8);

  // ── Layers (text blocks + stickers)
  const [textLayers, setTextLayers] = useState<TextBlock[]>(() => makeDefaultLayers(THEMES[2].text));
  const [stickerLayers, setStickerLayers] = useState<StickerLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>("body");
  const [dragging, setDragging] = useState<{
    id: string; isSticker: boolean;
    startX: number; startY: number; origX: number; origY: number;
  } | null>(null);

  // ── UI
  const [tab, setTab] = useState<"text" | "layers" | "photo" | "design" | "typo">("text");
  const [downloading, setDownloading] = useState(false);
  const [scale, setScale] = useState(0.38);

  const photoRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const theme = useCustomColors
    ? { bg: customBg, text: "#ffffff", border: customBorder, gradient: undefined } as Theme
    : THEMES[themeIdx];
  const cardW = SIZES[sizeIdx].name === "কাস্টম" ? customW : SIZES[sizeIdx].w;
  const cardH = SIZES[sizeIdx].name === "কাস্টম" ? customH : SIZES[sizeIdx].h;

  const preset = FILTER_PRESETS.find(f => f.name === filterPreset);
  const effectiveFilter = filterPreset === "normal"
    ? `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`
    : `${preset?.filter ?? ""} brightness(${brightness}%) contrast(${contrast}%)`;

  // Update text layer colors when theme changes
  useEffect(() => {
    setTextLayers(prev => prev.map(l => ({ ...l, color: theme.text })));
  }, [themeIdx, useCustomColors, customBg]);

  // Responsive scale
  useEffect(() => {
    const update = () => {
      if (!previewRef.current) return;
      const cw = previewRef.current.clientWidth - 8;
      const ch = window.innerHeight * 0.52;
      setScale(Math.min(cw / cardW, ch / cardH, 1));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [cardW, cardH]);

  // ── Drag ──────────────────────────────────────────────────────────────────

  const startDrag = (
    e: React.MouseEvent | React.TouchEvent,
    id: string, isSticker: boolean,
    lx: number, ly: number
  ) => {
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragging({ id, isSticker, startX: clientX, startY: clientY, origX: lx, origY: ly });
    setSelectedId(id);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dx = (clientX - dragging.startX) / (cardW * scale);
      const dy = (clientY - dragging.startY) / (cardH * scale);
      const nx = Math.max(0, Math.min(1, dragging.origX + dx));
      const ny = Math.max(0, Math.min(1, dragging.origY + dy));
      if (dragging.isSticker) {
        setStickerLayers(prev => prev.map(l => l.id === dragging.id ? { ...l, x: nx, y: ny } : l));
      } else {
        setTextLayers(prev => prev.map(l => l.id === dragging.id ? { ...l, x: nx, y: ny } : l));
      }
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

  // ── Layer helpers ─────────────────────────────────────────────────────────

  const updateTextLayer = (id: string, patch: Partial<TextBlock>) => {
    setTextLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  };

  const addCustomTextLayer = () => {
    const id = uid();
    const newLayer: TextBlock = {
      id, kind: "custom",
      text: "নতুন লেখা",
      x: 0.5, y: 0.5,
      fontSize: 40,
      fontKey: "ChandraSheela",
      color: theme.text,
      bold: false, italic: false,
      align: "center",
      shadow: false, glow: false,
      visible: true,
      letterSpacing: 0.5,
      lineHeight: 1.6,
    };
    setTextLayers(prev => [...prev, newLayer]);
    setSelectedId(id);
    setTab("layers");
  };

  const deleteTextLayer = (id: string) => {
    // Don't allow deleting core layers — just hide them
    setTextLayers(prev => prev.map(l => l.id === id && l.kind !== "custom" ? { ...l, visible: false } : l));
    setStickerLayers(prev => prev.filter(l => l.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const addSticker = (emoji: string) => {
    const id = uid();
    setStickerLayers(prev => [...prev, { id, kind: "sticker", emoji, x: 0.5, y: 0.3, size: 80 }]);
    setSelectedId(id);
    setTab("layers");
  };

  const updateSticker = (id: string, patch: Partial<StickerLayer>) => {
    setStickerLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  };

  // ── Selected layer ────────────────────────────────────────────────────────

  const selectedTextLayer = textLayers.find(l => l.id === selectedId) ?? null;
  const selectedSticker = stickerLayers.find(l => l.id === selectedId) ?? null;

  // ── Canvas export ─────────────────────────────────────────────────────────

  const buildCanvas = useCallback(async (): Promise<HTMLCanvasElement> => {
    const allFontKeys = textLayers.map(l => l.fontKey);
    await Promise.all(allFontKeys.map(ensureFontLoaded));
    await document.fonts.ready;

    const DPR = 2;
    const canvas = document.createElement("canvas");
    canvas.width = cardW * DPR;
    canvas.height = cardH * DPR;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(DPR, DPR);

    // Background fill
    if (theme.gradient) {
      const parts = theme.gradient.match(/linear-gradient\(([^,]+),(.*)\)/s);
      if (parts) {
        const deg = parseFloat(parts[1]) || 135;
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
      } else ctx.fillStyle = theme.bg;
    } else ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, cardW, cardH);

    if (pattern !== "none") drawPatternCanvas(ctx, pattern, cardW, cardH, theme.text);

    // Background image
    if (bgImage) await new Promise<void>(res => {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save();
        if (bgBlur) ctx.filter = "blur(8px)";
        ctx.globalAlpha = bgOpacity;
        ctx.drawImage(img, 0, 0, cardW, cardH);
        ctx.restore(); res();
      };
      img.onerror = () => res(); img.src = bgImage;
    });

    // Main photo
    if (photoImage) await new Promise<void>(res => {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save();
        ctx.globalAlpha = photoOpacity / 100;
        const ia = img.naturalWidth / img.naturalHeight, ca = cardW / cardH;
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        if (ia > ca) { sw = img.naturalHeight * ca; sx = (img.naturalWidth - sw) / 2; }
        else { sh = img.naturalWidth / ca; sy = (img.naturalHeight - sh) / 2; }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cardW, cardH);
        ctx.restore(); res();
      };
      img.onerror = () => res(); img.src = photoImage;
    });

    // Watermark
    if (showWatermark) await new Promise<void>(res => {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save(); ctx.globalAlpha = watermarkOpacity / 100;
        const ia = img.naturalWidth / img.naturalHeight, ca = cardW / cardH;
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        if (ia > ca) { sw = img.naturalHeight * ca; sx = (img.naturalWidth - sw) / 2; }
        else { sh = img.naturalWidth / ca; sy = (img.naturalHeight - sh) / 2; }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cardW, cardH);
        ctx.restore(); res();
      };
      img.onerror = () => res(); img.src = AUTHOR_PHOTO;
    });

    // Frames
    ctx.strokeStyle = theme.border; ctx.lineWidth = 1.5;
    if (frame === "inner-border") { ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeRect(16, 16, cardW - 32, cardH - 32); ctx.restore(); }
    if (frame === "corner") {
      ctx.save(); ctx.globalAlpha = 0.7;
      [[16, 16, 1, 1], [cardW - 16, 16, -1, 1], [16, cardH - 16, 1, -1], [cardW - 16, cardH - 16, -1, -1]].forEach(([x, y, dx, dy]) => {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 50 * dx, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 50 * dy); ctx.stroke();
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
      if (!layer.visible) continue;
      await ensureFontLoaded(layer.fontKey);
      ctx.font = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}${layer.fontSize}px ${FONT_CSS[layer.fontKey] || "'Tiro Bangla', serif"}`;
      ctx.fillStyle = layer.color;
      ctx.textAlign = layer.align;
      ctx.letterSpacing = `${layer.letterSpacing}px`;
      if (layer.shadow) { ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; }
      else if (layer.glow) { ctx.shadowColor = theme.border; ctx.shadowBlur = 20; }
      else { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }

      const maxW = cardW - padding * 2;
      const displayText = layer.kind === "author" ? `___❐ ${layer.text}` : layer.text;
      const lines = wrapText(ctx, displayText, maxW);
      const xPos = layer.align === "center" ? layer.x * cardW : layer.align === "right" ? layer.x * cardW + 200 : layer.x * cardW;
      const totalH = lines.length * layer.fontSize * layer.lineHeight;
      const startY = layer.y * cardH - totalH / 2 + layer.fontSize;
      lines.forEach((line, i) => ctx.fillText(line, xPos, startY + i * layer.fontSize * layer.lineHeight));
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    }

    // Sticker layers
    for (const sticker of stickerLayers) {
      ctx.font = `${sticker.size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sticker.emoji, sticker.x * cardW, sticker.y * cardH);
      ctx.textBaseline = "alphabetic";
    }

    return canvas;
  }, [theme, cardW, cardH, pattern, bgImage, bgOpacity, bgBlur, photoImage, photoOpacity, showWatermark, watermarkOpacity, frame, padding, textLayers, stickerLayers, filterPreset, brightness, contrast, saturation, blur]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = await buildCanvas();
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "mahbub-sardar-sabuj-design.png";
      a.click();
    } finally { setDownloading(false); }
  };

  const onPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setPhotoImage(ev.target?.result as string);
    r.readAsDataURL(f);
  };
  const onBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setBgImage(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  // ── Author display text ───────────────────────────────────────────────────
  const authorLayer = textLayers.find(l => l.kind === "author");
  const authorDisplayText = authorLayer ? `___❐ ${authorLayer.text}` : "";

  // ─────────────────────────────────────────────────────────────────────────
  // Sub-components
  // ─────────────────────────────────────────────────────────────────────────

  const TabBtn = ({ id, label, icon }: { id: typeof tab; label: string; icon: string }) => (
    <button onClick={() => setTab(id)}
      className={`flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl text-xs font-semibold transition-all flex-1 min-w-0 ${
        tab === id ? "bg-[#D4A843] text-black" : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}>
      <span className="text-base leading-none">{icon}</span>
      <span className="text-[9px] leading-tight truncate w-full text-center">{label}</span>
    </button>
  );

  const Slider = ({ label, val, set, min, max, step = 1, unit = "" }: {
    label: string; val: number; set: (v: number) => void;
    min: number; max: number; step?: number; unit?: string;
  }) => (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-400 text-xs">{label}</span>
        <span className="text-[#D4A843] text-xs font-bold">{val}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => set(+e.target.value)}
        className="w-full h-1.5 rounded-full accent-[#D4A843] cursor-pointer" />
    </div>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-px flex-1 bg-[#D4A843]/20" />
      <span className="text-[#D4A843] text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{children}</span>
      <div className="h-px flex-1 bg-[#D4A843]/20" />
    </div>
  );

  // ── Text layer editor panel (shared for all text blocks)
  const TextLayerEditor = ({ layer }: { layer: TextBlock }) => (
    <div className="space-y-3">
      {/* Text input */}
      <div>
        <label className="text-gray-400 text-xs font-semibold block mb-1.5">
          {layer.kind === "title" ? "লেখার নাম লিখুন" :
           layer.kind === "body"  ? "মূল লেখা লিখুন" :
           layer.kind === "author" ? "লেখক নাম লিখুন" : "কাস্টম লেখা"}
        </label>
        {layer.kind === "body" || layer.kind === "custom" ? (
          <textarea value={layer.text}
            onChange={e => updateTextLayer(layer.id, { text: e.target.value })}
            rows={4}
            className="w-full bg-[#0a1525] text-white border border-[#1e3050] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A843] resize-y transition-colors leading-relaxed"
            placeholder={layer.kind === "body" ? "কবিতা, উক্তি বা মনের কথা..." : "লেখা লিখুন..."} />
        ) : (
          <input value={layer.text}
            onChange={e => updateTextLayer(layer.id, { text: e.target.value })}
            className="w-full bg-[#0a1525] text-white border border-[#1e3050] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A843] transition-colors"
            placeholder={layer.kind === "author" ? "লেখকের নাম..." : "শিরোনাম লিখুন..."} />
        )}
        {layer.kind === "author" && (
          <p className="text-gray-600 text-xs mt-1">প্রিভিউতে দেখাবে: <span className="text-[#D4A843]">___❐ {layer.text}</span></p>
        )}
      </div>

      {/* Color + Font Size */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-gray-500 text-xs mb-1.5 block">রঙ</label>
          <div className="flex items-center gap-2">
            <input type="color" value={layer.color}
              onChange={e => updateTextLayer(layer.id, { color: e.target.value })}
              className="w-10 h-9 rounded-lg border-0 cursor-pointer bg-transparent flex-shrink-0" />
            <span className="text-gray-500 text-xs font-mono">{layer.color}</span>
          </div>
        </div>
        <div>
          <label className="text-gray-500 text-xs mb-1.5 block">সাইজ (px)</label>
          <input type="number" min={10} max={200} value={layer.fontSize}
            onChange={e => updateTextLayer(layer.id, { fontSize: +e.target.value })}
            className="w-full bg-[#0a1525] text-white border border-[#1e3050] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843]" />
        </div>
      </div>

      {/* Style toggles */}
      <div>
        <label className="text-gray-500 text-xs mb-2 block">স্টাইল</label>
        <div className="flex gap-2">
          {([
            ["B", "bold", layer.bold],
            ["I", "italic", layer.italic],
            ["S", "shadow", layer.shadow],
            ["G", "glow", layer.glow],
          ] as [string, keyof TextBlock, boolean][]).map(([lbl, key, val]) => (
            <button key={key}
              onClick={() => updateTextLayer(layer.id, { [key]: !val } as Partial<TextBlock>)}
              className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                val ? "border-[#D4A843] bg-[#D4A843]/15 text-[#D4A843]" : "border-[#1e3050] text-gray-500 hover:border-[#D4A843]/40"
              }`}>
              {lbl}
            </button>
          ))}
        </div>
        <div className="flex gap-1 mt-1">
          <span className="text-gray-600 text-[9px]">B=굵게</span>
          <span className="text-gray-600 text-[9px] ml-2">I=বাঁকা</span>
          <span className="text-gray-600 text-[9px] ml-2">S=শ্যাডো</span>
          <span className="text-gray-600 text-[9px] ml-2">G=গ্লো</span>
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label className="text-gray-500 text-xs mb-1.5 block">সারিবদ্ধতা</label>
        <div className="flex gap-2">
          {(["left", "center", "right"] as const).map(a => (
            <button key={a} onClick={() => updateTextLayer(layer.id, { align: a })}
              className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                layer.align === a ? "border-[#D4A843] bg-[#D4A843]/15 text-[#D4A843]" : "border-[#1e3050] text-gray-500"
              }`}>
              {a === "left" ? "⬅ বাম" : a === "center" ? "↔ মাঝ" : "➡ ডান"}
            </button>
          ))}
        </div>
      </div>

      {/* Font */}
      <div>
        <label className="text-gray-500 text-xs mb-1.5 block">ফন্ট</label>
        <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
          {FONTS.map(f => (
            <button key={f.value} onClick={() => updateTextLayer(layer.id, { fontKey: f.value })}
              className={`w-full text-left px-3 py-1.5 rounded-lg border text-xs transition-all ${
                layer.fontKey === f.value
                  ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                  : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
              }`} style={{ fontFamily: FONT_CSS[f.value] }}>
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Visibility */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={layer.visible}
          onChange={e => updateTextLayer(layer.id, { visible: e.target.checked })}
          className="w-4 h-4 accent-[#D4A843]" />
        <span className="text-gray-300 text-sm">দেখাও</span>
      </label>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#060c18]">
      <Seo title="ডিজাইন ফরম্যাট | মাহবুব সরদার সবুজ"
        description="প্রিমিয়াম বাংলা লেখার কার্ড ডিজাইন করুন ও PNG ডাউনলোড করুন" />
      <Navbar />

      <div className="pt-20 pb-20 px-3 md:px-5">
        <div className="max-w-[1440px] mx-auto">

          {/* ── Page Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 border border-[#D4A843]/25 rounded-full px-5 py-1.5 mb-3">
              <span className="text-[#D4A843] text-xs font-bold tracking-widest uppercase">✦ ডিজাইন ফরম্যাট ✦</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1.5">
              আপনার লেখা <span className="text-[#D4A843]">সুন্দরভাবে</span> সাজান
            </h1>
            <p className="text-gray-500 text-sm">ড্র্যাগ করুন · ফিল্টার দিন · ডাউনলোড করুন</p>
          </div>

          <div className="flex flex-col xl:flex-row gap-5">

            {/* ══════════════════════════════════════════════════════════════
                LEFT PANEL — Controls
            ══════════════════════════════════════════════════════════════ */}
            <div className="xl:w-[420px] flex-shrink-0 flex flex-col gap-3">

              {/* Tab Bar */}
              <div className="bg-[#0f1c2e] rounded-2xl p-1.5 border border-[#1e3050] flex gap-1">
                <TabBtn id="text"   label="লেখা"    icon="✏️" />
                <TabBtn id="layers" label="লেয়ার"   icon="📐" />
                <TabBtn id="photo"  label="ছবি"     icon="🖼️" />
                <TabBtn id="design" label="ডিজাইন"  icon="🎨" />
                <TabBtn id="typo"   label="টাইপো"   icon="🔤" />
              </div>

              {/* ── TEXT TAB ── */}
              {tab === "text" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-5">
                  <SectionTitle>মূল লেখা</SectionTitle>

                  {/* Title block */}
                  <div className="bg-[#0a1525] rounded-xl p-3 border border-[#1e3050]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#D4A843] text-xs font-bold">শিরোনাম</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox"
                          checked={textLayers.find(l => l.kind === "title")?.visible ?? true}
                          onChange={e => updateTextLayer("title", { visible: e.target.checked })}
                          className="w-3.5 h-3.5 accent-[#D4A843]" />
                        <span className="text-gray-500 text-xs">দেখাও</span>
                      </label>
                    </div>
                    <input
                      value={textLayers.find(l => l.kind === "title")?.text ?? ""}
                      onChange={e => updateTextLayer("title", { text: e.target.value })}
                      placeholder="লেখার নাম লিখুন..."
                      className="w-full bg-[#060c18] text-white border border-[#1e3050] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A843] transition-colors"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-gray-600 text-xs">রঙ:</label>
                      <input type="color"
                        value={textLayers.find(l => l.kind === "title")?.color ?? "#ffffff"}
                        onChange={e => updateTextLayer("title", { color: e.target.value })}
                        className="w-8 h-7 rounded border-0 cursor-pointer bg-transparent" />
                      <button onClick={() => { setSelectedId("title"); setTab("layers"); }}
                        className="ml-auto text-[10px] text-[#D4A843]/60 hover:text-[#D4A843] transition-colors">
                        বিস্তারিত সম্পাদনা →
                      </button>
                    </div>
                  </div>

                  {/* Body block */}
                  <div className="bg-[#0a1525] rounded-xl p-3 border border-[#1e3050]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#D4A843] text-xs font-bold">মূল লেখা</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox"
                          checked={textLayers.find(l => l.kind === "body")?.visible ?? true}
                          onChange={e => updateTextLayer("body", { visible: e.target.checked })}
                          className="w-3.5 h-3.5 accent-[#D4A843]" />
                        <span className="text-gray-500 text-xs">দেখাও</span>
                      </label>
                    </div>
                    <textarea
                      value={textLayers.find(l => l.kind === "body")?.text ?? ""}
                      onChange={e => updateTextLayer("body", { text: e.target.value })}
                      rows={5}
                      placeholder="মূল লেখা লিখুন..."
                      className="w-full bg-[#060c18] text-white border border-[#1e3050] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A843] resize-y transition-colors leading-relaxed"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-gray-600 text-xs">রঙ:</label>
                      <input type="color"
                        value={textLayers.find(l => l.kind === "body")?.color ?? "#ffffff"}
                        onChange={e => updateTextLayer("body", { color: e.target.value })}
                        className="w-8 h-7 rounded border-0 cursor-pointer bg-transparent" />
                      <button onClick={() => { setSelectedId("body"); setTab("layers"); }}
                        className="ml-auto text-[10px] text-[#D4A843]/60 hover:text-[#D4A843] transition-colors">
                        বিস্তারিত সম্পাদনা →
                      </button>
                    </div>
                  </div>

                  {/* Author block */}
                  <div className="bg-[#0a1525] rounded-xl p-3 border border-[#1e3050]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#D4A843] text-xs font-bold">লেখক নাম</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox"
                          checked={textLayers.find(l => l.kind === "author")?.visible ?? true}
                          onChange={e => updateTextLayer("author", { visible: e.target.checked })}
                          className="w-3.5 h-3.5 accent-[#D4A843]" />
                        <span className="text-gray-500 text-xs">দেখাও</span>
                      </label>
                    </div>
                    <input
                      value={textLayers.find(l => l.kind === "author")?.text ?? ""}
                      onChange={e => updateTextLayer("author", { text: e.target.value })}
                      placeholder="লেখক নাম লিখুন..."
                      className="w-full bg-[#060c18] text-white border border-[#1e3050] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A843] transition-colors"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-gray-600 text-xs">রঙ:</label>
                      <input type="color"
                        value={textLayers.find(l => l.kind === "author")?.color ?? "#ffffff"}
                        onChange={e => updateTextLayer("author", { color: e.target.value })}
                        className="w-8 h-7 rounded border-0 cursor-pointer bg-transparent" />
                      <span className="text-gray-600 text-xs ml-1 truncate">→ {authorDisplayText.slice(0, 20)}...</span>
                    </div>
                    <button onClick={() => { setSelectedId("author"); setTab("layers"); }}
                      className="mt-1.5 text-[10px] text-[#D4A843]/60 hover:text-[#D4A843] transition-colors">
                      বিস্তারিত সম্পাদনা →
                    </button>
                  </div>

                  {/* Templates */}
                  <div>
                    <SectionTitle>টেমপ্লেট</SectionTitle>
                    <div className="grid grid-cols-2 gap-1.5">
                      {TEMPLATES.map(tmpl => (
                        <button key={tmpl.label}
                          onClick={() => {
                            updateTextLayer("title", { text: tmpl.title, visible: true });
                            updateTextLayer("body",  { text: tmpl.body,  visible: true });
                          }}
                          className="text-left px-3 py-2.5 bg-[#0a1525] hover:bg-[#1e3050] text-gray-300 rounded-xl text-xs border border-[#1e3050] hover:border-[#D4A843]/40 transition-all">
                          📝 {tmpl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add custom text layer */}
                  <button onClick={addCustomTextLayer}
                    className="w-full py-2.5 bg-[#D4A843]/8 hover:bg-[#D4A843]/15 border border-[#D4A843]/25 hover:border-[#D4A843]/60 text-[#D4A843] font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                    ➕ নতুন কাস্টম লেখা যোগ করুন
                  </button>
                </div>
              )}

              {/* ── LAYERS TAB ── */}
              {tab === "layers" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-4">
                  <SectionTitle>লেয়ার সম্পাদনা</SectionTitle>

                  {/* Layer list */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">
                      সব লেয়ার ({textLayers.filter(l => l.visible).length + stickerLayers.length}টি সক্রিয়)
                    </label>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {textLayers.map(layer => (
                        <div key={layer.id}
                          onClick={() => setSelectedId(layer.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                            selectedId === layer.id
                              ? "border-[#D4A843] bg-[#D4A843]/10"
                              : layer.visible
                                ? "border-[#1e3050] hover:border-[#D4A843]/40"
                                : "border-[#1e3050]/40 opacity-40"
                          }`}>
                          <span className="text-base">
                            {layer.kind === "title" ? "📌" : layer.kind === "body" ? "📝" : layer.kind === "author" ? "👤" : "✏️"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-300 text-xs truncate">{layer.text.slice(0, 22)}</div>
                            <div className="text-gray-600 text-[9px]">
                              {layer.kind === "title" ? "শিরোনাম" : layer.kind === "body" ? "মূল লেখা" : layer.kind === "author" ? "লেখক নাম" : "কাস্টম"}
                              {" · "}{layer.fontSize}px
                            </div>
                          </div>
                          <div className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                            style={{ backgroundColor: layer.color }} />
                          {layer.kind === "custom" && (
                            <button onClick={e => { e.stopPropagation(); deleteTextLayer(layer.id); }}
                              className="text-red-400 hover:text-red-300 text-xs px-1">✕</button>
                          )}
                        </div>
                      ))}
                      {stickerLayers.map(sticker => (
                        <div key={sticker.id}
                          onClick={() => setSelectedId(sticker.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                            selectedId === sticker.id
                              ? "border-[#D4A843] bg-[#D4A843]/10"
                              : "border-[#1e3050] hover:border-[#D4A843]/40"
                          }`}>
                          <span className="text-xl">{sticker.emoji}</span>
                          <div className="flex-1">
                            <div className="text-gray-300 text-xs">স্টিকার</div>
                            <div className="text-gray-600 text-[9px]">{sticker.size}px</div>
                          </div>
                          <button onClick={e => { e.stopPropagation(); setStickerLayers(prev => prev.filter(l => l.id !== sticker.id)); if (selectedId === sticker.id) setSelectedId(null); }}
                            className="text-red-400 hover:text-red-300 text-xs px-1">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sticker picker */}
                  <div>
                    <SectionTitle>স্টিকার যোগ করুন</SectionTitle>
                    <div className="grid grid-cols-8 gap-1 max-h-28 overflow-y-auto">
                      {STICKER_LIST.map(emoji => (
                        <button key={emoji} onClick={() => addSticker(emoji)}
                          className="text-xl p-1 rounded-lg hover:bg-[#D4A843]/10 transition-all text-center leading-none">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected layer editor */}
                  {selectedTextLayer && (
                    <div className="pt-3 border-t border-[#1e3050]">
                      <SectionTitle>
                        {selectedTextLayer.kind === "title" ? "শিরোনাম সম্পাদনা" :
                         selectedTextLayer.kind === "body" ? "মূল লেখা সম্পাদনা" :
                         selectedTextLayer.kind === "author" ? "লেখক নাম সম্পাদনা" : "কাস্টম লেখা সম্পাদনা"}
                      </SectionTitle>
                      <TextLayerEditor layer={selectedTextLayer} />
                    </div>
                  )}

                  {selectedSticker && (
                    <div className="pt-3 border-t border-[#1e3050]">
                      <SectionTitle>স্টিকার সম্পাদনা</SectionTitle>
                      <div className="text-center text-4xl mb-3">{selectedSticker.emoji}</div>
                      <Slider label="আকার" val={selectedSticker.size} set={v => updateSticker(selectedSticker.id, { size: v })} min={20} max={300} unit="px" />
                    </div>
                  )}

                  <p className="text-gray-600 text-xs text-center pt-1">
                    💡 প্রিভিউতে যেকোনো লেখা বা স্টিকার ড্র্যাগ করে সরানো যাবে
                  </p>
                </div>
              )}

              {/* ── PHOTO TAB ── */}
              {tab === "photo" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-5">
                  <SectionTitle>ছবি আপলোড ও ফিল্টার</SectionTitle>

                  <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={onPhotoUpload} />
                  <button onClick={() => photoRef.current?.click()}
                    className="w-full py-7 border-2 border-dashed border-[#D4A843]/35 rounded-2xl text-center hover:border-[#D4A843] hover:bg-[#D4A843]/5 transition-all">
                    {photoImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={photoImage} className="w-20 h-20 object-cover rounded-xl mx-auto"
                          style={{ filter: effectiveFilter }} />
                        <span className="text-[#D4A843] text-xs font-semibold">ছবি পরিবর্তন করুন</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📷</span>
                        <span className="text-gray-400 text-sm">ছবি আপলোড করুন</span>
                        <span className="text-gray-600 text-xs">JPG · PNG · WEBP</span>
                      </div>
                    )}
                  </button>
                  {photoImage && (
                    <>
                      <div>
                        <label className="text-gray-400 text-xs font-semibold block mb-2">ফিল্টার প্রিসেট</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {FILTER_PRESETS.map(fp => (
                            <button key={fp.name} onClick={() => setFilterPreset(fp.name)}
                              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border text-xs transition-all ${
                                filterPreset === fp.name
                                  ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                                  : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                              }`}>
                              <div className="w-10 h-10 rounded-lg overflow-hidden">
                                <img src={photoImage} className="w-full h-full object-cover"
                                  style={{ filter: fp.filter === "none" ? undefined : fp.filter }} />
                              </div>
                              <span className="text-[9px] text-center leading-tight">{fp.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-gray-400 text-xs font-semibold block">ম্যানুয়াল অ্যাডজাস্টমেন্ট</label>
                        <Slider label="উজ্জ্বলতা"  val={brightness} set={setBrightness} min={0} max={200} unit="%" />
                        <Slider label="কনট্রাস্ট"  val={contrast}   set={setContrast}   min={0} max={200} unit="%" />
                        <Slider label="স্যাচুরেশন" val={saturation}  set={setSaturation}  min={0} max={200} unit="%" />
                        <Slider label="ব্লার"       val={blur}        set={setBlur}        min={0} max={20}  unit="px" step={0.5} />
                        <Slider label="অপাসিটি"    val={photoOpacity} set={setPhotoOpacity} min={0} max={100} unit="%" />
                      </div>
                      <button onClick={() => setPhotoImage(null)}
                        className="w-full py-2 text-red-400 text-xs border border-red-400/20 rounded-xl hover:bg-red-400/10 transition-all">
                        ছবি সরিয়ে দিন
                      </button>
                    </>
                  )}

                  {/* Background image (merged from old bg tab) */}
                  <div className="pt-3 border-t border-[#1e3050]">
                    <SectionTitle>পটভূমি ছবি</SectionTitle>
                    <input ref={bgFileRef} type="file" accept="image/*" className="hidden" onChange={onBgUpload} />
                    <button onClick={() => bgFileRef.current?.click()}
                      className="w-full py-3 border border-dashed border-[#D4A843]/30 rounded-xl text-center hover:border-[#D4A843] hover:bg-[#D4A843]/5 transition-all text-gray-400 text-sm">
                      {bgImage ? "✅ পটভূমি ছবি পরিবর্তন করুন" : "🌅 পটভূমি ছবি আপলোড করুন"}
                    </button>
                    {bgImage && (
                      <>
                        <div className="mt-3 space-y-3">
                          <Slider label="অপাসিটি" val={Math.round(bgOpacity * 100)} set={v => setBgOpacity(v / 100)} min={0} max={100} unit="%" />
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={bgBlur} onChange={e => setBgBlur(e.target.checked)} className="w-4 h-4 accent-[#D4A843]" />
                            <span className="text-gray-300 text-sm">ব্লার ইফেক্ট</span>
                          </label>
                        </div>
                        <button onClick={() => setBgImage(null)} className="mt-2 w-full py-2 text-red-400 text-xs border border-red-400/20 rounded-xl hover:bg-red-400/10 transition-all">
                          পটভূমি সরিয়ে দিন
                        </button>
                      </>
                    )}
                    <div className="mt-3">
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input type="checkbox" checked={showWatermark} onChange={e => setShowWatermark(e.target.checked)} className="w-4 h-4 accent-[#D4A843]" />
                        <span className="text-gray-300 text-sm">লেখকের ছবি ওয়াটারমার্ক</span>
                      </label>
                      {showWatermark && (
                        <Slider label="ওয়াটারমার্ক অপাসিটি" val={watermarkOpacity} set={setWatermarkOpacity} min={1} max={40} unit="%" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── DESIGN TAB ── */}
              {tab === "design" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-5">
                  <SectionTitle>থিম ও রঙ</SectionTitle>

                  <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                    {THEMES.map((t, i) => (
                      <button key={t.name} onClick={() => { setThemeIdx(i); setUseCustomColors(false); }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          !useCustomColors && themeIdx === i
                            ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                            : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                        }`}>
                        <div className="w-5 h-5 rounded-full border border-white/10 flex-shrink-0"
                          style={{ background: t.gradient || t.bg }} />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input type="checkbox" checked={useCustomColors} onChange={e => setUseCustomColors(e.target.checked)} className="w-4 h-4 accent-[#D4A843]" />
                      <span className="text-gray-300 text-sm font-medium">কাস্টম পটভূমি রঙ</span>
                    </label>
                    {useCustomColors && (
                      <div className="grid grid-cols-2 gap-3">
                        {([["পটভূমি", customBg, setCustomBg], ["বর্ডার", customBorder, setCustomBorder]] as const).map(([lbl, val, set]) => (
                          <div key={lbl} className="flex flex-col items-center gap-1">
                            <span className="text-gray-500 text-xs">{lbl}</span>
                            <input type="color" value={val} onChange={e => (set as (v: string) => void)(e.target.value)}
                              className="w-12 h-10 rounded-lg border-0 cursor-pointer bg-transparent" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <SectionTitle>আকার</SectionTitle>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SIZES.map((s, i) => (
                      <button key={s.name} onClick={() => setSizeIdx(i)}
                        className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          sizeIdx === i
                            ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                            : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                        }`}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                  {SIZES[sizeIdx].name === "কাস্টম" && (
                    <div className="grid grid-cols-2 gap-2">
                      {[["প্রস্থ", customW, setCustomW], ["উচ্চতা", customH, setCustomH]].map(([lbl, val, set]) => (
                        <div key={lbl as string}>
                          <label className="text-gray-500 text-xs mb-1 block">{lbl as string} (px)</label>
                          <input type="number" value={val as number} onChange={e => (set as (v: number) => void)(+e.target.value)}
                            className="w-full bg-[#0a1525] text-white border border-[#1e3050] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843]" />
                        </div>
                      ))}
                    </div>
                  )}

                  <SectionTitle>ফ্রেম</SectionTitle>
                  <div className="grid grid-cols-2 gap-1.5">
                    {FRAMES.map(f => (
                      <button key={f.value} onClick={() => setFrame(f.value)}
                        className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          frame === f.value
                            ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                            : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                        }`}>
                        {f.name}
                      </button>
                    ))}
                  </div>

                  <SectionTitle>প্যাটার্ন</SectionTitle>
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
              )}

              {/* ── TYPO TAB ── */}
              {tab === "typo" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-4">
                  <SectionTitle>টাইপোগ্রাফি</SectionTitle>
                  <p className="text-gray-500 text-xs">
                    প্রতিটি লেখার ফন্ট ও সাইজ আলাদাভাবে "লেয়ার" ট্যাব থেকে পরিবর্তন করুন।
                    এখানে গ্লোবাল সেটিংস:
                  </p>
                  <Slider label="প্যাডিং" val={padding} set={setPadding} min={20} max={160} />

                  {/* Per-layer font quick controls */}
                  <SectionTitle>লেখার ফন্ট (দ্রুত)</SectionTitle>
                  {textLayers.filter(l => l.visible).map(layer => (
                    <div key={layer.id} className="bg-[#0a1525] rounded-xl p-3 border border-[#1e3050]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#D4A843] text-xs font-bold">
                          {layer.kind === "title" ? "শিরোনাম" : layer.kind === "body" ? "মূল লেখা" : layer.kind === "author" ? "লেখক নাম" : "কাস্টম"}
                        </span>
                        <span className="text-gray-600 text-xs">{layer.fontSize}px</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input type="number" min={10} max={200} value={layer.fontSize}
                          onChange={e => updateTextLayer(layer.id, { fontSize: +e.target.value })}
                          className="bg-[#060c18] text-white border border-[#1e3050] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#D4A843]" />
                        <select value={layer.fontKey}
                          onChange={e => updateTextLayer(layer.id, { fontKey: e.target.value })}
                          className="bg-[#060c18] text-white border border-[#1e3050] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#D4A843]">
                          {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="range" min={1} max={3.5} step={0.05} value={layer.lineHeight}
                          onChange={e => updateTextLayer(layer.id, { lineHeight: +e.target.value })}
                          className="accent-[#D4A843] cursor-pointer" />
                        <span className="text-gray-500 text-xs self-center">লাইন: {layer.lineHeight.toFixed(1)}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Download Button ── */}
              <button onClick={handleDownload} disabled={downloading}
                className="w-full py-4 bg-gradient-to-r from-[#D4A843] to-[#c49030] hover:from-[#c49030] hover:to-[#b07820] text-black font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-[#D4A843]/25 text-base">
                {downloading ? (
                  <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> ডাউনলোড হচ্ছে...</>
                ) : (
                  <>⬇️ PNG ডাউনলোড করুন ({cardW}×{cardH})</>
                )}
              </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                RIGHT PANEL — Live Preview
            ══════════════════════════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col items-center" ref={previewRef}>

              {/* Author name display above preview */}
              <div className="mb-3 text-center">
                <div className="inline-flex items-center gap-2 bg-[#D4A843]/8 border border-[#D4A843]/20 rounded-full px-5 py-2">
                  <span className="text-[#D4A843] font-semibold text-sm tracking-wide">
                    {authorDisplayText || "___❐ মাহবুব সরদার সবুজ"}
                  </span>
                </div>
              </div>

              {/* Preview label */}
              <div className="flex items-center gap-3 mb-3 w-full">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D4A843]/25" />
                <span className="text-[#D4A843]/50 text-[10px] uppercase tracking-widest font-semibold whitespace-nowrap">লাইভ প্রিভিউ</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D4A843]/25" />
              </div>

              {/* Canvas preview */}
              <div
                style={{
                  width: cardW * scale,
                  height: cardH * scale,
                  position: "relative",
                  flexShrink: 0,
                  boxShadow: "0 40px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(212,168,67,0.1)",
                  borderRadius: 10,
                  overflow: "hidden",
                  cursor: dragging ? "grabbing" : "default",
                }}
                onClick={() => setSelectedId(null)}
              >
                {/* Card at full resolution, scaled down via CSS */}
                <div style={{
                  width: cardW, height: cardH,
                  background: theme.gradient || theme.bg,
                  position: "absolute", top: 0, left: 0,
                  transform: `scale(${scale})`, transformOrigin: "top left",
                  overflow: "hidden", boxSizing: "border-box",
                }}>
                  {/* Pattern */}
                  {pattern !== "none" && (
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 0, opacity: 0.06, pointerEvents: "none",
                      backgroundImage:
                        pattern === "dots"     ? `radial-gradient(circle, ${theme.text} 1.5px, transparent 1.5px)` :
                        pattern === "lines"    ? `repeating-linear-gradient(0deg, ${theme.text} 0, ${theme.text} 1px, transparent 1px, transparent 24px)` :
                        pattern === "grid"     ? `repeating-linear-gradient(0deg, ${theme.text} 0, ${theme.text} 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, ${theme.text} 0, ${theme.text} 1px, transparent 1px, transparent 40px)` :
                        `repeating-linear-gradient(45deg, ${theme.text} 0, ${theme.text} 1px, transparent 1px, transparent 32px)`,
                      backgroundSize: pattern === "dots" ? "30px 30px" : pattern === "grid" ? "40px 40px" : undefined,
                    }} />
                  )}

                  {/* BG image */}
                  {bgImage && (
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 1,
                      backgroundImage: `url(${bgImage})`,
                      backgroundSize: "cover", backgroundPosition: "center",
                      opacity: bgOpacity, filter: bgBlur ? "blur(8px)" : "none",
                    }} />
                  )}

                  {/* Main photo */}
                  {photoImage && (
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 2,
                      backgroundImage: `url(${photoImage})`,
                      backgroundSize: "cover", backgroundPosition: "center",
                      opacity: photoOpacity / 100, filter: effectiveFilter,
                    }} />
                  )}

                  {/* Watermark */}
                  {showWatermark && (
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 3,
                      backgroundImage: `url(${AUTHOR_PHOTO})`,
                      backgroundSize: "cover", backgroundPosition: "center top",
                      opacity: watermarkOpacity / 100, pointerEvents: "none",
                    }} />
                  )}

                  {/* Frames */}
                  {frame === "inner-border" && <div style={{ position: "absolute", inset: 16, border: `1.5px solid ${theme.border}`, opacity: 0.5, zIndex: 4, pointerEvents: "none" }} />}
                  {frame === "corner" && (
                    <div style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none" }}>
                      {[{ top: 16, left: 16, borderTop: `1.5px solid ${theme.border}`, borderLeft: `1.5px solid ${theme.border}` },
                        { top: 16, right: 16, borderTop: `1.5px solid ${theme.border}`, borderRight: `1.5px solid ${theme.border}` },
                        { bottom: 16, left: 16, borderBottom: `1.5px solid ${theme.border}`, borderLeft: `1.5px solid ${theme.border}` },
                        { bottom: 16, right: 16, borderBottom: `1.5px solid ${theme.border}`, borderRight: `1.5px solid ${theme.border}` }
                      ].map((s, i) => <div key={i} style={{ position: "absolute", width: 50, height: 50, opacity: 0.7, ...s }} />)}
                    </div>
                  )}
                  {frame === "double-border" && (
                    <>
                      <div style={{ position: "absolute", inset: 10, border: `1.5px solid ${theme.border}`, opacity: 0.5, zIndex: 4, pointerEvents: "none" }} />
                      <div style={{ position: "absolute", inset: 22, border: `1.5px solid ${theme.border}`, opacity: 0.3, zIndex: 4, pointerEvents: "none" }} />
                    </>
                  )}
                  {frame === "left-bar" && <div style={{ position: "absolute", top: padding, bottom: padding, left: padding / 2 - 2, width: 5, backgroundColor: theme.border, opacity: 0.8, zIndex: 4, borderRadius: 3 }} />}
                  {frame === "shadow-frame" && <div style={{ position: "absolute", inset: 20, border: `1.5px solid ${theme.border}`, opacity: 0.4, zIndex: 4, pointerEvents: "none", boxShadow: `0 0 30px ${theme.border}` }} />}
                  {frame === "ornate" && (
                    <>
                      <div style={{ position: "absolute", inset: 12, border: `1.5px solid ${theme.border}`, opacity: 0.55, zIndex: 4, pointerEvents: "none" }} />
                      <div style={{ position: "absolute", inset: 20, border: `1.5px solid ${theme.border}`, opacity: 0.25, zIndex: 4, pointerEvents: "none" }} />
                    </>
                  )}

                  {/* Draggable text layers */}
                  {textLayers.map(layer => {
                    if (!layer.visible) return null;
                    const displayText = layer.kind === "author" ? `___❐ ${layer.text}` : layer.text;
                    const textEffect = layer.shadow
                      ? { textShadow: "2px 2px 8px rgba(0,0,0,0.5)" }
                      : layer.glow
                        ? { textShadow: `0 0 20px ${theme.border}, 0 0 40px ${theme.border}80` }
                        : {};
                    return (
                      <div
                        key={layer.id}
                        onMouseDown={e => startDrag(e, layer.id, false, layer.x, layer.y)}
                        onTouchStart={e => startDrag(e, layer.id, false, layer.x, layer.y)}
                        style={{
                          position: "absolute",
                          left: layer.x * cardW,
                          top: layer.y * cardH,
                          transform: "translate(-50%, -50%)",
                          zIndex: 10,
                          cursor: dragging?.id === layer.id ? "grabbing" : "grab",
                          userSelect: "none",
                          maxWidth: cardW - padding * 2,
                          textAlign: layer.align,
                          outline: selectedId === layer.id ? `${Math.ceil(2 / scale)}px dashed #D4A843` : "none",
                          outlineOffset: `${Math.ceil(4 / scale)}px`,
                          borderRadius: 4,
                        }}
                      >
                        <div style={{
                          fontSize: layer.fontSize,
                          fontFamily: FONT_CSS[layer.fontKey] || "'Tiro Bangla', serif",
                          color: layer.color,
                          fontWeight: layer.bold ? "bold" : "normal",
                          fontStyle: layer.italic ? "italic" : "normal",
                          letterSpacing: `${layer.letterSpacing}px`,
                          lineHeight: layer.lineHeight,
                          whiteSpace: "pre-wrap",
                          ...textEffect,
                        }}>
                          {displayText}
                        </div>
                      </div>
                    );
                  })}

                  {/* Draggable sticker layers */}
                  {stickerLayers.map(sticker => (
                    <div
                      key={sticker.id}
                      onMouseDown={e => startDrag(e, sticker.id, true, sticker.x, sticker.y)}
                      onTouchStart={e => startDrag(e, sticker.id, true, sticker.x, sticker.y)}
                      style={{
                        position: "absolute",
                        left: sticker.x * cardW,
                        top: sticker.y * cardH,
                        transform: "translate(-50%, -50%)",
                        zIndex: 11,
                        cursor: dragging?.id === sticker.id ? "grabbing" : "grab",
                        userSelect: "none",
                        fontSize: sticker.size,
                        lineHeight: 1,
                        outline: selectedId === sticker.id ? `${Math.ceil(2 / scale)}px dashed #D4A843` : "none",
                        outlineOffset: `${Math.ceil(4 / scale)}px`,
                        borderRadius: 4,
                      }}
                    >
                      {sticker.emoji}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-gray-600 text-xs mt-2.5">
                {Math.round(scale * 100)}% · {cardW}×{cardH}px
                {(textLayers.filter(l => l.visible).length + stickerLayers.length) > 0 &&
                  ` · ${textLayers.filter(l => l.visible).length + stickerLayers.length}টি লেয়ার`}
              </p>

              {/* Quick theme dots */}
              <div className="flex gap-2 mt-4 flex-wrap justify-center max-w-xs">
                {THEMES.map((t, i) => (
                  <button key={t.name} onClick={() => { setThemeIdx(i); setUseCustomColors(false); }}
                    title={t.name}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      !useCustomColors && themeIdx === i ? "border-[#D4A843] scale-125" : "border-transparent hover:border-[#D4A843]/50"
                    }`}
                    style={{ background: t.gradient || t.bg }} />
                ))}
              </div>

              <p className="text-gray-600 text-xs mt-3 text-center max-w-xs">
                💡 প্রিভিউতে যেকোনো লেখা বা স্টিকার ড্র্যাগ করে যেকোনো স্থানে নিন
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
