/**
 * ডিজাইন ফরম্যাট — InShot-style Premium Bengali Writing Card Designer v3
 * Features:
 *  - Photo upload as main canvas image (not just background)
 *  - Real-time CSS image filters: brightness, contrast, saturation, blur, vintage, B&W
 *  - Draggable text layers (multiple, positioned anywhere on canvas)
 *  - Draggable sticker layers
 *  - InShot-style bottom toolbar on mobile
 *  - All v2 features: themes, gradients, frames, patterns, fonts, PNG export
 */
import { useState, useRef, useCallback, useEffect, useId } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

// ── Fonts ─────────────────────────────────────────────────────────────────────
const FONTS = [
  { name: "চন্দ্রশীলা",          value: "ChandraSheela" },
  { name: "চন্দ্রশীলা প্রিমিয়াম", value: "ChandraSheelaPremium" },
  { name: "মাহবুব সরদার ফন্ট",   value: "MahbubSardarSabujFont" },
  { name: "মাসুদ নান্দনিক",       value: "MasudNandanik" },
  { name: "আদর্শ লিপি",          value: "AdorshoLipi" },
  { name: "BH Sabit Adorsho",    value: "BHSabitAdorshoLightUnicode" },
  { name: "BLAB Norha Gram",     value: "BLABNorhaGramUnicode" },
  { name: "Akhand Bengali",      value: "AkhandBengali" },
  { name: "Tiro Bangla",         value: "TiroBangla" },
  { name: "Noto Sans Bengali",   value: "NotoSansBengali" },
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

// ── Themes ────────────────────────────────────────────────────────────────────
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

// ── Sizes ─────────────────────────────────────────────────────────────────────
const SIZES = [
  { name: "বর্গ (1:1)",       w: 1080, h: 1080 },
  { name: "পোর্ট্রেট (4:5)", w: 1080, h: 1350 },
  { name: "স্টোরি (9:16)",   w: 1080, h: 1920 },
  { name: "আড়াআড়ি (16:9)", w: 1920, h: 1080 },
  { name: "A4 পোর্ট্রেট",   w: 794,  h: 1123 },
  { name: "কাস্টম",          w: 0,    h: 0    },
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
const STICKER_LIST = ["🌸","🌙","⭐","✨","🌿","🦋","🕊️","🌹","💫","🔥","🌊","🎋","🌺","💎","🪷","🌟","🏵️","🌴","🎑","🌾","🎐","🎍","🍂","🌻","❤️","💛","💙","💜","🤍","🖤","🌈","☁️","⚡","🌑","🌕","🍃","🌷","🫧","🪐","🎆","🎇","🧿","🔮","🪬","🌠","🎴","🀄","🎭","🎪","🎨","🖌️"];

// ── Image Filters ─────────────────────────────────────────────────────────────
type FilterPreset = { name: string; filter: string; label: string };
const FILTER_PRESETS: FilterPreset[] = [
  { name: "normal",    filter: "none",                                                                    label: "স্বাভাবিক" },
  { name: "vivid",     filter: "saturate(1.8) contrast(1.1)",                                             label: "উজ্জ্বল" },
  { name: "warm",      filter: "sepia(0.3) saturate(1.4) brightness(1.05)",                               label: "উষ্ণ" },
  { name: "cool",      filter: "hue-rotate(20deg) saturate(1.2) brightness(1.05)",                        label: "শীতল" },
  { name: "vintage",   filter: "sepia(0.6) contrast(1.1) brightness(0.9) saturate(0.8)",                  label: "ভিনটেজ" },
  { name: "bw",        filter: "grayscale(1)",                                                            label: "সাদাকালো" },
  { name: "dramatic",  filter: "contrast(1.4) brightness(0.85) saturate(1.2)",                            label: "নাটকীয়" },
  { name: "fade",      filter: "brightness(1.1) contrast(0.85) saturate(0.7)",                            label: "ফেড" },
  { name: "golden",    filter: "sepia(0.4) saturate(1.6) hue-rotate(-10deg) brightness(1.05)",            label: "সোনালি" },
  { name: "moonlight", filter: "brightness(0.8) contrast(1.2) hue-rotate(200deg) saturate(0.6)",         label: "জ্যোৎস্না" },
  { name: "matte",     filter: "contrast(0.9) brightness(1.1) saturate(0.85)",                            label: "ম্যাট" },
  { name: "pop",       filter: "saturate(2) contrast(1.15) brightness(1.05)",                             label: "পপ" },
];

// ── Templates ─────────────────────────────────────────────────────────────────
const TEMPLATES = [
  { label: "প্রেমের কবিতা",  title: "ভালোবাসা",        body: "ভালোবাসা আমার কাছে\nতোমার হাসির মতো সহজ,\nতোমার চোখের মতো গভীর।", author: "— মাহবুব সরদার সবুজ" },
  { label: "অনুপ্রেরণা",    title: "জীবন",             body: "প্রতিটি ভোরে নতুন সুযোগ আসে,\nসেই সুযোগকে কাজে লাগাও।", author: "— মাহবুব সরদার সবুজ" },
  { label: "প্রকৃতি",       title: "প্রকৃতির ডাক",    body: "সবুজ পাতার ফাঁকে ফাঁকে\nআলো নামে নীরবে।", author: "— মাহবুব সরদার সবুজ" },
  { label: "বিচ্ছেদ",       title: "বিচ্ছেদের ব্যথা", body: "যে চলে গেছে সে আর ফেরে না,\nস্মৃতিরা শুধু বুকে জ্বলে।", author: "— মাহবুব সরদার সবুজ" },
  { label: "আত্মসম্মান",    title: "আত্মসম্মান",       body: "নিজেকে ভালোবাসো সবার আগে,\nআত্মসম্মান হারিও না কখনো।", author: "— মাহবুব সরদার সবুজ" },
];

// ── Author photo ──────────────────────────────────────────────────────────────
const AUTHOR_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";

// ── Layer types ───────────────────────────────────────────────────────────────
interface TextLayer {
  id: string;
  type: "text";
  text: string;
  x: number; // 0-1 fraction of card width
  y: number; // 0-1 fraction of card height
  fontSize: number;
  fontKey: string;
  color: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  shadow: boolean;
  bg: string; // background color, "" = none
  bgOpacity: number;
}

interface StickerLayer {
  id: string;
  type: "sticker";
  emoji: string;
  x: number;
  y: number;
  size: number;
}

type Layer = TextLayer | StickerLayer;

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

function uid() { return Math.random().toString(36).slice(2, 9); }

// ── Main Component ────────────────────────────────────────────────────────────
export default function Editor() {
  // ── Photo & Filters
  const [photoImage, setPhotoImage] = useState<string | null>(null);
  const [filterPreset, setFilterPreset] = useState("normal");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [photoOpacity, setPhotoOpacity] = useState(100);

  // ── Background
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState(0.12);
  const [bgBlur, setBgBlur] = useState(false);
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkOpacity, setWatermarkOpacity] = useState(8);

  // ── Design
  const [themeIdx, setThemeIdx] = useState(2);
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [customBg, setCustomBg] = useState("#1a1a2e");
  const [customText, setCustomText] = useState("#ffffff");
  const [customBorder, setCustomBorder] = useState("#D4A843");
  const [sizeIdx, setSizeIdx] = useState(0);
  const [customW, setCustomW] = useState(800);
  const [customH, setCustomH] = useState(800);
  const [frame, setFrame] = useState("corner");
  const [pattern, setPattern] = useState("none");

  // ── Legacy text (main card text)
  const [title, setTitle] = useState("শিরোনাম");
  const [body, setBody] = useState("এখানে আপনার লেখা লিখুন...\n\nকবিতা, উক্তি বা মনের কথা।");
  const [author, setAuthor] = useState("— মাহবুব সরদার সবুজ");
  const [showTitle, setShowTitle] = useState(true);
  const [showAuthor, setShowAuthor] = useState(true);
  const [titleFontKey, setTitleFontKey] = useState("ChandraSheela");
  const [bodyFontKey, setBodyFontKey] = useState("ChandraSheela");
  const [authorFontKey, setAuthorFontKey] = useState("ChandraSheela");
  const [titleSize, setTitleSize] = useState(52);
  const [bodySize, setBodySize] = useState(36);
  const [authorSize, setAuthorSize] = useState(28);
  const [lineH, setLineH] = useState(1.9);
  const [align, setAlign] = useState<"left" | "center" | "right">("left");
  const [padding, setPadding] = useState(60);
  const [letterSp, setLetterSp] = useState(0.5);
  const [textShadow, setTextShadow] = useState(false);
  const [textGlow, setTextGlow] = useState(false);
  const [boldBody, setBoldBody] = useState(false);
  const [italicTitle, setItalicTitle] = useState(false);
  const [authorOpacity, setAuthorOpacity] = useState(75);

  // ── Layers (draggable text + stickers)
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  // ── UI
  const [tab, setTab] = useState<"photo" | "text" | "layers" | "design" | "typo" | "bg" | "extras">("photo");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scale, setScale] = useState(0.4);

  const photoRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  const theme = useCustomColors
    ? { bg: customBg, text: customText, border: customBorder, gradient: undefined } as Theme
    : THEMES[themeIdx];
  const cardW = SIZES[sizeIdx].name === "কাস্টম" ? customW : SIZES[sizeIdx].w;
  const cardH = SIZES[sizeIdx].name === "কাস্টম" ? customH : SIZES[sizeIdx].h;

  // Compute CSS filter string
  const preset = FILTER_PRESETS.find(f => f.name === filterPreset);
  const customFilterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
  const effectiveFilter = filterPreset === "normal" ? customFilterStr : `${preset?.filter ?? ""} brightness(${brightness}%) contrast(${contrast}%)`;

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

  // ── Drag handlers for layers ───────────────────────────────────────────────
  const startDrag = (e: React.MouseEvent | React.TouchEvent, id: string, lx: number, ly: number) => {
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragging({ id, startX: clientX, startY: clientY, origX: lx, origY: ly });
    setSelectedLayerId(id);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dx = (clientX - dragging.startX) / (cardW * scale);
      const dy = (clientY - dragging.startY) / (cardH * scale);
      setLayers(prev => prev.map(l => l.id === dragging.id
        ? { ...l, x: Math.max(0, Math.min(1, dragging.origX + dx)), y: Math.max(0, Math.min(1, dragging.origY + dy)) }
        : l
      ));
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

  // ── Add layer helpers ──────────────────────────────────────────────────────
  const addTextLayer = () => {
    const id = uid();
    const newLayer: TextLayer = {
      id, type: "text",
      text: "নতুন লেখা",
      x: 0.5, y: 0.5,
      fontSize: 48,
      fontKey: "ChandraSheela",
      color: theme.text,
      bold: false, italic: false,
      align: "center",
      shadow: false,
      bg: "", bgOpacity: 0.5,
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(id);
    setTab("layers");
  };

  const addStickerLayer = (emoji: string) => {
    const id = uid();
    const newLayer: StickerLayer = { id, type: "sticker", emoji, x: 0.5, y: 0.3, size: 80 };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(id);
    setTab("layers");
  };

  const deleteLayer = (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const updateLayer = (id: string, patch: Partial<Layer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } as Layer : l));
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId) ?? null;

  // ── Canvas export ─────────────────────────────────────────────────────────
  const buildCanvas = useCallback(async (): Promise<HTMLCanvasElement> => {
    const allFontKeys = [titleFontKey, bodyFontKey, authorFontKey, ...layers.filter(l => l.type === "text").map(l => (l as TextLayer).fontKey)];
    await Promise.all(allFontKeys.map(ensureFontLoaded));
    await document.fonts.ready;

    const DPR = 2;
    const canvas = document.createElement("canvas");
    canvas.width = cardW * DPR;
    canvas.height = cardH * DPR;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(DPR, DPR);

    // Background
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
      } else { ctx.fillStyle = theme.bg; }
    } else { ctx.fillStyle = theme.bg; }
    ctx.fillRect(0, 0, cardW, cardH);

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
          ctx.restore(); res();
        };
        img.onerror = () => res();
        img.src = bgImage;
      });
    }

    // Main photo
    if (photoImage) {
      await new Promise<void>(res => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          ctx.globalAlpha = photoOpacity / 100;
          const imgAspect = img.naturalWidth / img.naturalHeight;
          const cardAspect = cardW / cardH;
          let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
          if (imgAspect > cardAspect) { sw = img.naturalHeight * cardAspect; sx = (img.naturalWidth - sw) / 2; }
          else { sh = img.naturalWidth / cardAspect; sy = (img.naturalHeight - sh) / 2; }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cardW, cardH);
          ctx.restore(); res();
        };
        img.onerror = () => res();
        img.src = photoImage;
      });
    }

    // Watermark
    if (showWatermark) {
      await new Promise<void>(res => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          ctx.globalAlpha = watermarkOpacity / 100;
          const imgAspect = img.naturalWidth / img.naturalHeight;
          const cardAspect = cardW / cardH;
          let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
          if (imgAspect > cardAspect) { sw = img.naturalHeight * cardAspect; sx = (img.naturalWidth - sw) / 2; }
          else { sh = img.naturalWidth / cardAspect; sy = (img.naturalHeight - sh) / 2; }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cardW, cardH);
          ctx.restore(); res();
        };
        img.onerror = () => res();
        img.src = AUTHOR_PHOTO;
      });
    }

    // Frame
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1.5;
    if (frame === "inner-border") { ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeRect(16, 16, cardW - 32, cardH - 32); ctx.restore(); }
    if (frame === "corner") {
      const corners = [[16, 16, 1, 1], [cardW - 16, 16, -1, 1], [16, cardH - 16, 1, -1], [cardW - 16, cardH - 16, -1, -1]];
      ctx.save(); ctx.globalAlpha = 0.7;
      corners.forEach(([x, y, dx, dy]) => {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 50 * dx, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 50 * dy); ctx.stroke();
      });
      ctx.restore();
    }
    if (frame === "double-border") {
      ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeRect(10, 10, cardW - 20, cardH - 20); ctx.globalAlpha = 0.3; ctx.strokeRect(22, 22, cardW - 44, cardH - 44); ctx.restore();
    }
    if (frame === "left-bar") { ctx.save(); ctx.globalAlpha = 0.8; ctx.fillStyle = theme.border; ctx.fillRect(padding / 2 - 2, padding, 5, cardH - padding * 2); ctx.restore(); }
    if (frame === "shadow-frame") { ctx.save(); ctx.globalAlpha = 0.4; ctx.shadowColor = theme.border; ctx.shadowBlur = 30; ctx.strokeRect(20, 20, cardW - 40, cardH - 40); ctx.restore(); }
    if (frame === "ornate") {
      ctx.save(); ctx.globalAlpha = 0.55; ctx.strokeRect(12, 12, cardW - 24, cardH - 24);
      ctx.globalAlpha = 0.25; ctx.strokeRect(20, 20, cardW - 40, cardH - 40); ctx.restore();
    }

    // Main text content
    const textShadowStyle = textShadow ? { shadow: true, shadowColor: "rgba(0,0,0,0.5)" } : textGlow ? { glow: true, glowColor: theme.border } : {};
    const applyTextEffect = () => {
      if (textShadow) { ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; }
      else if (textGlow) { ctx.shadowColor = theme.border; ctx.shadowBlur = 20; }
      else { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }
    };
    const clearEffect = () => { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; };

    const pad = padding;
    const maxW = cardW - pad * 2;
    let y = cardH * 0.18;

    if (showTitle && title) {
      ctx.font = `${italicTitle ? "italic " : ""}bold ${titleSize}px ${FONT_CSS[titleFontKey] || "'Tiro Bangla', serif"}`;
      ctx.fillStyle = theme.text;
      ctx.textAlign = align;
      applyTextEffect();
      const lines = wrapText(ctx, title, maxW);
      const xPos = align === "center" ? cardW / 2 : align === "right" ? cardW - pad : pad;
      lines.forEach(line => { ctx.fillText(line, xPos, y); y += titleSize * 1.3; });
      y += 20;
      clearEffect();
    }

    ctx.font = `${boldBody ? "bold " : ""}${bodySize}px ${FONT_CSS[bodyFontKey] || "'Tiro Bangla', serif"}`;
    ctx.fillStyle = theme.text;
    ctx.textAlign = align;
    applyTextEffect();
    const bodyLines = wrapText(ctx, body, maxW);
    const xPos = align === "center" ? cardW / 2 : align === "right" ? cardW - pad : pad;
    bodyLines.forEach(line => { ctx.fillText(line, xPos, y); y += bodySize * lineH; });
    clearEffect();

    if (showAuthor && author) {
      y += 28;
      ctx.font = `italic ${authorSize}px ${FONT_CSS[authorFontKey] || "'Tiro Bangla', serif"}`;
      ctx.fillStyle = theme.text;
      ctx.globalAlpha = authorOpacity / 100;
      ctx.textAlign = align;
      applyTextEffect();
      wrapText(ctx, author, maxW).forEach(line => { ctx.fillText(line, xPos, y); y += authorSize * 1.4; });
      ctx.globalAlpha = 1;
      clearEffect();
    }

    // Draggable layers
    for (const layer of layers) {
      if (layer.type === "sticker") {
        ctx.font = `${layer.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(layer.emoji, layer.x * cardW, layer.y * cardH);
        ctx.textBaseline = "alphabetic";
      } else if (layer.type === "text") {
        const tl = layer as TextLayer;
        await ensureFontLoaded(tl.fontKey);
        ctx.font = `${tl.italic ? "italic " : ""}${tl.bold ? "bold " : ""}${tl.fontSize}px ${FONT_CSS[tl.fontKey] || "'Tiro Bangla', serif"}`;
        ctx.fillStyle = tl.color;
        ctx.textAlign = tl.align;
        if (tl.shadow) { ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 8; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; }
        const tlX = tl.align === "center" ? tl.x * cardW : tl.align === "right" ? tl.x * cardW + 200 : tl.x * cardW;
        const tlLines = wrapText(ctx, tl.text, 600);
        tlLines.forEach((line, li) => ctx.fillText(line, tlX, tl.y * cardH + li * tl.fontSize * 1.4));
        clearEffect();
      }
    }

    return canvas;
  }, [theme, cardW, cardH, pattern, bgImage, bgOpacity, bgBlur, photoImage, photoOpacity, showWatermark, watermarkOpacity, frame, title, body, author, showTitle, showAuthor, titleFontKey, bodyFontKey, authorFontKey, titleSize, bodySize, authorSize, lineH, align, padding, letterSp, textShadow, textGlow, boldBody, italicTitle, authorOpacity, layers]);

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

  const handleCopyToClipboard = async () => {
    try {
      const canvas = await buildCanvas();
      canvas.toBlob(async blob => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch { /* ignore */ }
  };

  const onPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setPhotoImage(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  const onBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setBgImage(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  // ── Sub-components ────────────────────────────────────────────────────────
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
        description="InShot-স্টাইল বাংলা লেখার কার্ড ডিজাইন করুন ও PNG ডাউনলোড করুন" />
      <Navbar />

      <div className="pt-20 pb-16 px-3 md:px-5">
        <div className="max-w-[1440px] mx-auto">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 border border-[#D4A843]/25 rounded-full px-5 py-1.5 mb-3">
              <span className="text-[#D4A843] text-xs font-bold tracking-widest uppercase">✦ ডিজাইন ফরম্যাট ✦</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              আপনার লেখা <span className="text-[#D4A843]">সুন্দরভাবে</span> সাজান
            </h1>
            <p className="text-gray-400 text-sm md:text-base">ছবি আপলোড · ফিল্টার · লেখা যোগ করুন · স্টিকার · ডাউনলোড</p>
          </div>

          <div className="flex flex-col xl:flex-row gap-4">

            {/* ══ LEFT PANEL ══ */}
            <div className="xl:w-[440px] flex-shrink-0 flex flex-col gap-3">

              {/* Tab Bar */}
              <div className="bg-[#0f1c2e] rounded-2xl p-1.5 border border-[#1e3050] flex gap-1 overflow-x-auto">
                <TabBtn id="photo"   label="ছবি"      icon="🖼️" />
                <TabBtn id="text"    label="লেখা"     icon="✏️" />
                <TabBtn id="layers"  label="লেয়ার"    icon="📐" />
                <TabBtn id="design"  label="ডিজাইন"   icon="🎨" />
                <TabBtn id="typo"    label="টাইপো"    icon="🔤" />
                <TabBtn id="bg"      label="পটভূমি"   icon="🌅" />
                <TabBtn id="extras"  label="এক্সট্রা"  icon="✨" />
              </div>

              {/* ── Photo Tab ── */}
              {tab === "photo" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-5">
                  <h3 className="text-[#D4A843] text-xs font-bold uppercase tracking-widest">ছবি আপলোড ও ফিল্টার</h3>

                  {/* Upload */}
                  <div>
                    <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={onPhotoUpload} />
                    <button onClick={() => photoRef.current?.click()}
                      className="w-full py-8 border-2 border-dashed border-[#D4A843]/40 rounded-2xl text-center hover:border-[#D4A843] hover:bg-[#D4A843]/5 transition-all group">
                      {photoImage ? (
                        <div className="flex flex-col items-center gap-2">
                          <img src={photoImage} className="w-20 h-20 object-cover rounded-xl mx-auto" />
                          <span className="text-[#D4A843] text-xs font-semibold">ছবি পরিবর্তন করুন</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-4xl">📷</span>
                          <span className="text-gray-400 text-sm">ছবি আপলোড করুন</span>
                          <span className="text-gray-600 text-xs">JPG, PNG, WEBP</span>
                        </div>
                      )}
                    </button>
                    {photoImage && (
                      <button onClick={() => setPhotoImage(null)}
                        className="mt-2 w-full py-2 text-red-400 text-xs border border-red-400/20 rounded-xl hover:bg-red-400/10 transition-all">
                        ছবি সরিয়ে দিন
                      </button>
                    )}
                  </div>

                  {photoImage && (
                    <>
                      {/* Filter Presets */}
                      <div>
                        <label className="text-gray-400 text-xs font-semibold block mb-2">ফিল্টার প্রিসেট</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {FILTER_PRESETS.map(fp => (
                            <button key={fp.name} onClick={() => setFilterPreset(fp.name)}
                              className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all ${
                                filterPreset === fp.name
                                  ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                                  : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                              }`}>
                              <div className="w-10 h-10 rounded-lg overflow-hidden">
                                <img src={photoImage} className="w-full h-full object-cover"
                                  style={{ filter: fp.filter === "none" ? undefined : fp.filter }} />
                              </div>
                              <span className="text-[9px] leading-tight text-center">{fp.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Manual adjustments */}
                      <div className="space-y-3">
                        <label className="text-gray-400 text-xs font-semibold block">ম্যানুয়াল অ্যাডজাস্টমেন্ট</label>
                        <Slider label="উজ্জ্বলতা" val={brightness} set={setBrightness} min={0} max={200} unit="%" />
                        <Slider label="কনট্রাস্ট"  val={contrast}   set={setContrast}   min={0} max={200} unit="%" />
                        <Slider label="স্যাচুরেশন" val={saturation}  set={setSaturation}  min={0} max={200} unit="%" />
                        <Slider label="ব্লার"       val={blur}        set={setBlur}        min={0} max={20}  unit="px" step={0.5} />
                        <Slider label="অপাসিটি"    val={photoOpacity} set={setPhotoOpacity} min={0} max={100} unit="%" />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Text Tab ── */}
              {tab === "text" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-4">
                  <h3 className="text-[#D4A843] text-xs font-bold uppercase tracking-widest">মূল লেখা</h3>

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
                    <textarea value={body} onChange={e => setBody(e.target.value)} rows={6}
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

                  {/* Add floating text layer */}
                  <div className="pt-2 border-t border-[#1e3050]">
                    <p className="text-gray-500 text-xs mb-2">ক্যানভাসে ড্র্যাগযোগ্য লেখা যোগ করুন:</p>
                    <button onClick={addTextLayer}
                      className="w-full py-2.5 bg-[#D4A843]/10 hover:bg-[#D4A843]/20 border border-[#D4A843]/30 hover:border-[#D4A843] text-[#D4A843] font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                      <span className="text-lg">➕</span> নতুন টেক্সট লেয়ার যোগ করুন
                    </button>
                  </div>

                  {/* Templates */}
                  <div className="pt-2 border-t border-[#1e3050]">
                    <label className="text-gray-400 text-xs font-semibold block mb-2">টেমপ্লেট</label>
                    <div className="space-y-1.5">
                      {TEMPLATES.map(tmpl => (
                        <button key={tmpl.label}
                          onClick={() => { setTitle(tmpl.title); setBody(tmpl.body); setAuthor(tmpl.author); setShowTitle(true); setShowAuthor(true); }}
                          className="w-full text-left px-3 py-2.5 bg-[#0a1525] hover:bg-[#1e3050] text-gray-300 rounded-xl text-xs border border-[#1e3050] hover:border-[#D4A843]/40 transition-all">
                          📝 {tmpl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Layers Tab ── */}
              {tab === "layers" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[#D4A843] text-xs font-bold uppercase tracking-widest">লেয়ার ও স্টিকার</h3>
                    <button onClick={addTextLayer}
                      className="text-xs bg-[#D4A843]/10 border border-[#D4A843]/30 text-[#D4A843] px-3 py-1.5 rounded-lg hover:bg-[#D4A843]/20 transition-all">
                      + টেক্সট
                    </button>
                  </div>

                  {/* Sticker picker */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">স্টিকার যোগ করুন</label>
                    <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                      {STICKER_LIST.map(emoji => (
                        <button key={emoji} onClick={() => addStickerLayer(emoji)}
                          className="text-xl p-1 rounded-lg hover:bg-[#D4A843]/10 transition-all text-center leading-none">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Layer list */}
                  {layers.length > 0 && (
                    <div>
                      <label className="text-gray-400 text-xs font-semibold block mb-2">বিদ্যমান লেয়ার ({layers.length}টি)</label>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {layers.map(layer => (
                          <div key={layer.id}
                            onClick={() => setSelectedLayerId(layer.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                              selectedLayerId === layer.id
                                ? "border-[#D4A843] bg-[#D4A843]/10"
                                : "border-[#1e3050] hover:border-[#D4A843]/40"
                            }`}>
                            <span className="text-lg">{layer.type === "sticker" ? (layer as StickerLayer).emoji : "✏️"}</span>
                            <span className="text-gray-300 text-xs flex-1 truncate">
                              {layer.type === "sticker" ? "স্টিকার" : (layer as TextLayer).text.slice(0, 20)}
                            </span>
                            <button onClick={e => { e.stopPropagation(); deleteLayer(layer.id); }}
                              className="text-red-400 hover:text-red-300 text-xs px-1">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected layer editor */}
                  {selectedLayer && selectedLayer.type === "text" && (
                    <div className="space-y-3 pt-3 border-t border-[#1e3050]">
                      <label className="text-[#D4A843] text-xs font-bold">নির্বাচিত টেক্সট লেয়ার</label>
                      <textarea
                        value={(selectedLayer as TextLayer).text}
                        onChange={e => updateLayer(selectedLayer.id, { text: e.target.value })}
                        rows={3}
                        className="w-full bg-[#0a1525] text-white border border-[#1e3050] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843] resize-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-gray-500 text-xs mb-1 block">রঙ</label>
                          <input type="color" value={(selectedLayer as TextLayer).color}
                            onChange={e => updateLayer(selectedLayer.id, { color: e.target.value })}
                            className="w-full h-9 rounded-lg border-0 cursor-pointer bg-transparent" />
                        </div>
                        <div>
                          <label className="text-gray-500 text-xs mb-1 block">ফন্ট সাইজ</label>
                          <input type="number" min={12} max={200} value={(selectedLayer as TextLayer).fontSize}
                            onChange={e => updateLayer(selectedLayer.id, { fontSize: +e.target.value })}
                            className="w-full bg-[#0a1525] text-white border border-[#1e3050] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843]" />
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs mb-1.5 block">ফন্ট</label>
                        <div className="space-y-1 max-h-28 overflow-y-auto">
                          {FONTS.map(f => (
                            <button key={f.value} onClick={() => updateLayer(selectedLayer.id, { fontKey: f.value })}
                              className={`w-full text-left px-3 py-1.5 rounded-lg border text-xs transition-all ${
                                (selectedLayer as TextLayer).fontKey === f.value
                                  ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                                  : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                              }`} style={{ fontFamily: FONT_CSS[f.value] }}>
                              {f.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        {[["B", "bold"], ["I", "italic"], ["S", "shadow"]].map(([lbl, key]) => (
                          <button key={key}
                            onClick={() => updateLayer(selectedLayer.id, { [key]: !(selectedLayer as TextLayer)[key as keyof TextLayer] })}
                            className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                              (selectedLayer as TextLayer)[key as keyof TextLayer]
                                ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                                : "border-[#1e3050] text-gray-400"
                            }`}>
                            {lbl}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLayer && selectedLayer.type === "sticker" && (
                    <div className="space-y-3 pt-3 border-t border-[#1e3050]">
                      <label className="text-[#D4A843] text-xs font-bold">নির্বাচিত স্টিকার: {(selectedLayer as StickerLayer).emoji}</label>
                      <Slider label="আকার" val={(selectedLayer as StickerLayer).size} set={v => updateLayer(selectedLayer.id, { size: v })} min={20} max={300} unit="px" />
                    </div>
                  )}
                </div>
              )}

              {/* ── Design Tab ── */}
              {tab === "design" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-5">
                  <h3 className="text-[#D4A843] text-xs font-bold uppercase tracking-widest">ডিজাইন</h3>

                  {/* Themes */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">রঙের থিম</label>
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

                  {/* Fonts */}
                  <div className="space-y-3">
                    <label className="text-gray-400 text-xs font-semibold block">ফন্ট</label>
                    {[["শিরোনাম", titleFontKey, setTitleFontKey], ["মূল লেখা", bodyFontKey, setBodyFontKey], ["লেখক নাম", authorFontKey, setAuthorFontKey]].map(([lbl, val, set]) => (
                      <div key={lbl as string}>
                        <p className="text-[#D4A843] text-xs font-semibold mb-1">{lbl as string}</p>
                        <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                          {FONTS.map(f => (
                            <button key={f.value} onClick={() => (set as (v: string) => void)(f.value)}
                              className={`w-full text-left px-3 py-1.5 rounded-xl border text-xs transition-all ${
                                val === f.value
                                  ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                                  : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                              }`} style={{ fontFamily: FONT_CSS[f.value] }}>
                              {f.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Size */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">কার্ডের আকার</label>
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

                  {/* Frames */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">ফ্রেম</label>
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
                  </div>

                  {/* Patterns */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">প্যাটার্ন</label>
                    <div className="grid grid-cols-2 gap-1.5">
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
                  <Slider label="শিরোনাম সাইজ"   val={titleSize}   set={setTitleSize}   min={20} max={120} />
                  <Slider label="মূল লেখা সাইজ"  val={bodySize}    set={setBodySize}    min={16} max={80}  />
                  <Slider label="লেখক নাম সাইজ"  val={authorSize}  set={setAuthorSize}  min={12} max={60}  />
                  <Slider label="লাইন উচ্চতা"    val={lineH}       set={setLineH}       min={1}  max={3.5} step={0.05} unit="x" />
                  <Slider label="প্যাডিং"         val={padding}     set={setPadding}     min={20} max={160} />
                  <Slider label="অক্ষর ব্যবধান"   val={letterSp}    set={setLetterSp}    min={0}  max={8}   step={0.1} unit="px" />
                  <Slider label="লেখক অপাসিটি"   val={authorOpacity} set={setAuthorOpacity} min={10} max={100} unit="%" />

                  {/* Alignment */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">সারিবদ্ধতা</label>
                    <div className="flex gap-2">
                      {(["left", "center", "right"] as const).map(a => (
                        <button key={a} onClick={() => setAlign(a)}
                          className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                            align === a ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]" : "border-[#1e3050] text-gray-400"
                          }`}>
                          {a === "left" ? "বাম" : a === "center" ? "মাঝ" : "ডান"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2.5">
                    {[
                      ["টেক্সট শ্যাডো", textShadow, setTextShadow],
                      ["টেক্সট গ্লো",   textGlow,   setTextGlow],
                      ["বোল্ড বডি",     boldBody,   setBoldBody],
                      ["ইটালিক শিরোনাম", italicTitle, setItalicTitle],
                    ].map(([lbl, val, set]) => (
                      <label key={lbl as string} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={val as boolean} onChange={e => (set as (v: boolean) => void)(e.target.checked)} className="w-4 h-4 accent-[#D4A843]" />
                        <span className="text-gray-300 text-sm">{lbl as string}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Background Tab ── */}
              {tab === "bg" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-4">
                  <h3 className="text-[#D4A843] text-xs font-bold uppercase tracking-widest">পটভূমি</h3>

                  <input ref={bgFileRef} type="file" accept="image/*" className="hidden" onChange={onBgUpload} />
                  <button onClick={() => bgFileRef.current?.click()}
                    className="w-full py-3 border border-dashed border-[#D4A843]/40 rounded-xl text-center hover:border-[#D4A843] hover:bg-[#D4A843]/5 transition-all text-gray-400 text-sm">
                    {bgImage ? "✅ পটভূমি ছবি পরিবর্তন করুন" : "📁 পটভূমি ছবি আপলোড করুন"}
                  </button>
                  {bgImage && (
                    <>
                      <Slider label="ছবির অপাসিটি" val={Math.round(bgOpacity * 100)} set={v => setBgOpacity(v / 100)} min={0} max={100} unit="%" />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={bgBlur} onChange={e => setBgBlur(e.target.checked)} className="w-4 h-4 accent-[#D4A843]" />
                        <span className="text-gray-300 text-sm">ব্লার ইফেক্ট</span>
                      </label>
                      <button onClick={() => setBgImage(null)} className="w-full py-2 text-red-400 text-xs border border-red-400/20 rounded-xl hover:bg-red-400/10 transition-all">
                        পটভূমি ছবি সরিয়ে দিন
                      </button>
                    </>
                  )}

                  <div className="pt-2 border-t border-[#1e3050]">
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input type="checkbox" checked={showWatermark} onChange={e => setShowWatermark(e.target.checked)} className="w-4 h-4 accent-[#D4A843]" />
                      <span className="text-gray-300 text-sm font-medium">লেখকের ছবি ওয়াটারমার্ক</span>
                    </label>
                    {showWatermark && (
                      <Slider label="ওয়াটারমার্ক অপাসিটি" val={watermarkOpacity} set={setWatermarkOpacity} min={1} max={40} unit="%" />
                    )}
                  </div>
                </div>
              )}

              {/* ── Extras Tab ── */}
              {tab === "extras" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-4">
                  <h3 className="text-[#D4A843] text-xs font-bold uppercase tracking-widest">এক্সট্রা</h3>
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">দ্রুত স্টিকার</label>
                    <div className="grid grid-cols-8 gap-1">
                      {STICKER_LIST.slice(0, 24).map(emoji => (
                        <button key={emoji} onClick={() => addStickerLayer(emoji)}
                          className="text-xl p-1 rounded-lg hover:bg-[#D4A843]/10 transition-all text-center">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Download Buttons ── */}
              <div className="space-y-2">
                <button onClick={handleDownload} disabled={downloading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#D4A843] to-[#c49030] hover:from-[#c49030] hover:to-[#b07820] text-black font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-[#D4A843]/20">
                  {downloading ? (
                    <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> ডাউনলোড হচ্ছে...</>
                  ) : (
                    <>⬇️ PNG ডাউনলোড করুন</>
                  )}
                </button>
                <button onClick={handleCopyToClipboard}
                  className="w-full py-2.5 bg-[#0f1c2e] hover:bg-[#1e3050] text-[#D4A843] font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all border border-[#D4A843]/30 hover:border-[#D4A843] text-sm">
                  {copied ? "✓ ক্লিপবোর্ডে কপি হয়েছে!" : "📋 ক্লিপবোর্ডে কপি করুন"}
                </button>
                <p className="text-gray-600 text-xs text-center">{cardW} × {cardH} px · 2x রেজোলিউশন</p>
              </div>
            </div>

            {/* ══ RIGHT PANEL: Live Preview ══ */}
            <div className="flex-1 flex flex-col items-center" ref={previewRef}>
              <div className="flex items-center gap-3 mb-4 w-full">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D4A843]/30" />
                <span className="text-[#D4A843]/60 text-xs uppercase tracking-widest font-semibold">লাইভ প্রিভিউ</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D4A843]/30" />
              </div>

              {/* Preview wrapper */}
              <div
                ref={canvasWrapRef}
                style={{
                  width: cardW * scale,
                  height: cardH * scale,
                  position: "relative",
                  flexShrink: 0,
                  boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,168,67,0.12)",
                  borderRadius: 8,
                  overflow: "hidden",
                  cursor: dragging ? "grabbing" : "default",
                }}
                onClick={() => setSelectedLayerId(null)}
              >
                {/* Card at full size, scaled down */}
                <div style={{
                  width: cardW, height: cardH,
                  background: theme.gradient || theme.bg,
                  color: theme.text,
                  padding,
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
                        `repeating-linear-gradient(45deg, ${theme.text} 0, ${theme.text} 1px, transparent 1px, transparent 32px)`,
                      backgroundSize: pattern === "dots" ? "30px 30px" : pattern === "grid" ? "40px 40px" : undefined,
                    }} />
                  )}

                  {/* Background image */}
                  {bgImage && (
                    <div style={{
                      position: "absolute", inset: 0,
                      backgroundImage: `url(${bgImage})`,
                      backgroundSize: "cover", backgroundPosition: "center",
                      opacity: bgOpacity, filter: bgBlur ? "blur(8px)" : "none", zIndex: 1,
                    }} />
                  )}

                  {/* Main photo with filters */}
                  {photoImage && (
                    <div style={{
                      position: "absolute", inset: 0,
                      backgroundImage: `url(${photoImage})`,
                      backgroundSize: "cover", backgroundPosition: "center",
                      opacity: photoOpacity / 100,
                      filter: effectiveFilter,
                      zIndex: 2,
                    }} />
                  )}

                  {/* Watermark */}
                  {showWatermark && (
                    <div style={{
                      position: "absolute", inset: 0,
                      backgroundImage: `url(${AUTHOR_PHOTO})`,
                      backgroundSize: "cover", backgroundPosition: "center top",
                      opacity: watermarkOpacity / 100, zIndex: 3, pointerEvents: "none",
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

                  {/* Main text content */}
                  <div style={{ position: "relative", zIndex: 5, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    {showTitle && title && (
                      <div style={{
                        fontSize: titleSize, fontWeight: "bold",
                        fontFamily: FONT_CSS[titleFontKey],
                        fontStyle: italicTitle ? "italic" : "normal",
                        marginBottom: 20, lineHeight: 1.3,
                        letterSpacing: `${letterSp}px`,
                        ...textShadowStyle,
                      }}>
                        {title}
                      </div>
                    )}
                    <div style={{
                      fontSize: bodySize, lineHeight: lineH, whiteSpace: "pre-wrap",
                      fontFamily: FONT_CSS[bodyFontKey],
                      letterSpacing: `${letterSp}px`, fontWeight: boldBody ? "bold" : "normal",
                      ...textShadowStyle,
                    }}>
                      {body}
                    </div>
                    {showAuthor && author && (
                      <div style={{
                        fontSize: authorSize, marginTop: 28,
                        fontFamily: FONT_CSS[authorFontKey],
                        opacity: authorOpacity / 100, fontStyle: "italic",
                        letterSpacing: `${letterSp}px`,
                        ...textShadowStyle,
                      }}>
                        {author}
                      </div>
                    )}
                  </div>

                  {/* Draggable layers */}
                  {layers.map(layer => (
                    <div
                      key={layer.id}
                      onMouseDown={e => startDrag(e, layer.id, layer.x, layer.y)}
                      onTouchStart={e => startDrag(e, layer.id, layer.x, layer.y)}
                      style={{
                        position: "absolute",
                        left: layer.x * cardW,
                        top: layer.y * cardH,
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                        cursor: dragging?.id === layer.id ? "grabbing" : "grab",
                        userSelect: "none",
                        outline: selectedLayerId === layer.id ? `${2 / scale}px dashed #D4A843` : "none",
                        outlineOffset: `${4 / scale}px`,
                        borderRadius: 4,
                      }}
                    >
                      {layer.type === "sticker" ? (
                        <span style={{ fontSize: (layer as StickerLayer).size, lineHeight: 1, display: "block" }}>
                          {(layer as StickerLayer).emoji}
                        </span>
                      ) : (
                        <div style={{
                          fontSize: (layer as TextLayer).fontSize,
                          fontFamily: FONT_CSS[(layer as TextLayer).fontKey] || "'Tiro Bangla', serif",
                          color: (layer as TextLayer).color,
                          fontWeight: (layer as TextLayer).bold ? "bold" : "normal",
                          fontStyle: (layer as TextLayer).italic ? "italic" : "normal",
                          textAlign: (layer as TextLayer).align,
                          whiteSpace: "pre-wrap",
                          textShadow: (layer as TextLayer).shadow ? "2px 2px 8px rgba(0,0,0,0.6)" : "none",
                          lineHeight: 1.4,
                          maxWidth: cardW * 0.8,
                        }}>
                          {(layer as TextLayer).text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-gray-600 text-xs mt-3">
                স্কেল: {Math.round(scale * 100)}% · {cardW}×{cardH}px
                {layers.length > 0 && ` · ${layers.length}টি লেয়ার`}
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

              {/* Layer hint */}
              {layers.length > 0 && (
                <p className="text-gray-600 text-xs mt-3 text-center">
                  💡 লেয়ারগুলো ড্র্যাগ করে সরানো যাবে · ক্লিক করে নির্বাচন করুন
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
