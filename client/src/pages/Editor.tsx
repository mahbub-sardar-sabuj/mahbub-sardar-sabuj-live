/**
 * ডিজাইন ফরম্যাট v7 — সম্পূর্ণ আপগ্রেড
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
  ChandraSheela:              "/fonts/ChandraSheela.ttf",
  ChandraSheelaPremium:       "/fonts/ChandraSheelaPremium.ttf",
  MahbubSardarSabujFont:      "/fonts/MahbubSardarSabujFont.ttf",
  MasudNandanik:              "/fonts/MasudNandanik.ttf",
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
  { name: "বর্গ (1:1)",       w: 1080, h: 1080 },
  { name: "পোর্ট্রেট (4:5)", w: 1080, h: 1350 },
  { name: "স্টোরি (9:16)",   w: 1080, h: 1920 },
  { name: "আড়াআড়ি (16:9)", w: 1920, h: 1080 },
  { name: "A4",               w: 794,  h: 1123 },
];

const FRAMES = [
  { name: "নেই",         value: "none" },
  { name: "ভেতরে",       value: "inner-border" },
  { name: "কোণে",        value: "corner" },
  { name: "ডবল",         value: "double-border" },
  { name: "বাম বার",     value: "left-bar" },
  { name: "শ্যাডো",      value: "shadow-frame" },
  { name: "অর্নেট",      value: "ornate" },
];

const FILTER_PRESETS = [
  { name: "normal",    filter: "none",                                                          label: "স্বাভাবিক" },
  { name: "vivid",     filter: "saturate(1.8) contrast(1.1)",                                   label: "উজ্জ্বল" },
  { name: "warm",      filter: "sepia(0.3) saturate(1.4) brightness(1.05)",                     label: "উষ্ণ" },
  { name: "cool",      filter: "hue-rotate(20deg) saturate(1.2) brightness(1.05)",              label: "শীতল" },
  { name: "vintage",   filter: "sepia(0.6) contrast(1.1) brightness(0.9) saturate(0.8)",        label: "ভিনটেজ" },
  { name: "bw",        filter: "grayscale(1)",                                                  label: "সাদাকালো" },
  { name: "dramatic",  filter: "contrast(1.4) brightness(0.85) saturate(1.2)",                  label: "নাটকীয়" },
  { name: "golden",    filter: "sepia(0.4) saturate(1.6) hue-rotate(-10deg) brightness(1.05)",  label: "সোনালি" },
  { name: "moonlight", filter: "brightness(0.8) contrast(1.2) hue-rotate(200deg) saturate(0.6)", label: "জ্যোৎস্না" },
  { name: "matte",     filter: "contrast(0.9) brightness(1.1) saturate(0.85)",                  label: "ম্যাট" },
];

// ── Expanded Sticker Categories ──────────────────────────────────────────────
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
  { label: "প্রেম",        title: "ভালোবাসা",        body: "ভালোবাসা আমার কাছে\nতোমার হাসির মতো সহজ,\nতোমার চোখের মতো গভীর।" },
  { label: "অনুপ্রেরণা",  title: "জীবন",             body: "প্রতিটি ভোরে নতুন সুযোগ আসে,\nসেই সুযোগকে কাজে লাগাও।" },
  { label: "প্রকৃতি",     title: "প্রকৃতির ডাক",    body: "সবুজ পাতার ফাঁকে ফাঁকে\nআলো নামে নীরবে।" },
  { label: "বিচ্ছেদ",     title: "বিচ্ছেদের ব্যথা", body: "যে চলে গেছে সে আর ফেরে না,\nস্মৃতিরা শুধু বুকে জ্বলে।" },
];

const AUTHOR_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TextBlock {
  id: string;
  kind: "title" | "body" | "author" | "custom";
  text: string;
  x: number; y: number;
  fontSize: number;
  baseFontSize: number; // original fontSize before resize scaling
  fontKey: string;
  color: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  shadow: boolean;
  visible: boolean;
  lineHeight: number;
}

interface StickerLayer {
  id: string;
  kind: "sticker";
  emoji: string;
  x: number; y: number;
  size: number;
}

type ActiveTool = "text" | "style" | "photo" | "design" | "stickers";
type ExportQuality = "1x" | "2x" | "4k";

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
      shadow: false, visible: true, lineHeight: 1.3 },
    { id: "body",   kind: "body",   text: "",
      x: 0.5, y: 0.52, fontSize: 36, baseFontSize: 36, fontKey: "ChandraSheela",
      color: themeText, bold: false, italic: false, align: "center",
      shadow: false, visible: true, lineHeight: 1.9 },
    { id: "author", kind: "author", text: "",
      x: 0.5, y: 0.84, fontSize: 28, baseFontSize: 28, fontKey: "ChandraSheela",
      color: themeText, bold: false, italic: false, align: "center",
      shadow: false, visible: true, lineHeight: 1.4 },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Editor() {
  const [themeIdx, setThemeIdx]       = useState(2);
  const [sizeIdx, setSizeIdx]         = useState(0);
  const [frame, setFrame]             = useState("corner");
  const [padding]                     = useState(60);

  const [photoImage, setPhotoImage]   = useState<string | null>(null);
  const [filterPreset, setFilterPreset] = useState("normal");
  const [photoOpacity, setPhotoOpacity] = useState(85);
  const [bgImage, setBgImage]         = useState<string | null>(null);
  const [bgOpacity, setBgOpacity]     = useState(0.15);
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkOpacity, setWatermarkOpacity] = useState(8);

  const [textLayers, setTextLayers]   = useState<TextBlock[]>(() => makeDefaultLayers(THEMES[2].text));
  const [stickers, setStickers]       = useState<StickerLayer[]>([]);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [dragging, setDragging]       = useState<{
    id: string; isSticker: boolean;
    startX: number; startY: number; origX: number; origY: number;
  } | null>(null);
  const [resizing, setResizing]       = useState<{
    id: string; startX: number; startY: number; origW: number; origH: number;
  } | null>(null);
  // text box widths (fraction of cardW) and heights (fraction of cardH)
  const [textBoxSizes, setTextBoxSizes] = useState<Record<string, { w: number; h: number }>>({});

  const [activeTool, setActiveTool]   = useState<ActiveTool>("text");
  const [downloading, setDownloading] = useState(false);
  const [exportQuality, setExportQuality] = useState<ExportQuality>("2x");
  const [scale, setScale]             = useState(0.36);
  const [activeStickerCat, setActiveStickerCat] = useState(0);

  const photoRef    = useRef<HTMLInputElement>(null);
  const bgFileRef   = useRef<HTMLInputElement>(null);
  const previewRef  = useRef<HTMLDivElement>(null);

  const theme  = THEMES[themeIdx];
  const cardW  = SIZES[sizeIdx].w;
  const cardH  = SIZES[sizeIdx].h;
  const preset = FILTER_PRESETS.find(f => f.name === filterPreset);
  const effectiveFilter = filterPreset === "normal" ? "none" : (preset?.filter ?? "none");

  useEffect(() => {
    setTextLayers(prev => prev.map(l => ({ ...l, color: theme.text })));
  }, [themeIdx]);

  useEffect(() => {
    const update = () => {
      if (!previewRef.current) return;
      const cw = previewRef.current.clientWidth - 4;
      const ch = Math.min(window.innerHeight * 0.55, 480);
      setScale(Math.min(cw / cardW, ch / cardH, 0.9));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [cardW, cardH]);

  // ── Drag ──────────────────────────────────────────────────────────────────

  const startDrag = (
    e: React.MouseEvent | React.TouchEvent,
    id: string, isSticker: boolean, lx: number, ly: number
  ) => {
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

  // ── Layer helpers ─────────────────────────────────────────────────────────

  const updateText = (id: string, patch: Partial<TextBlock>) =>
    setTextLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));

  const addCustomText = () => {
    const id = uid();
    setTextLayers(prev => [...prev, {
      id, kind: "custom", text: "নতুন লেখা",
      x: 0.5, y: 0.5, fontSize: 40, baseFontSize: 40, fontKey: "ChandraSheela",
      color: theme.text, bold: false, italic: false, align: "center",
      shadow: false, visible: true, lineHeight: 1.6,
    }]);
    setTextBoxSizes(prev => ({ ...prev, [id]: { w: 0.7, h: 0.15 } }));
    setSelectedId(id);
    setActiveTool("style");
  };

  const addSticker = (emoji: string) => {
    const id = uid();
    setStickers(prev => [...prev, { id, kind: "sticker", emoji, x: 0.5, y: 0.35, size: 80 }]);
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

  // ── Resize text box — InShot style: auto font scale ───────────────────────
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

      // InShot-style: scale fontSize proportional to box width change
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

  const selectedText    = textLayers.find(l => l.id === selectedId) ?? null;
  const selectedSticker = stickers.find(l => l.id === selectedId) ?? null;

  // ── Canvas export ─────────────────────────────────────────────────────────

  const buildCanvas = useCallback(async (dpr: number): Promise<HTMLCanvasElement> => {
    await Promise.all(textLayers.map(l => ensureFontLoaded(l.fontKey)));
    await document.fonts.ready;
    const canvas = document.createElement("canvas");
    canvas.width = cardW * dpr; canvas.height = cardH * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    if (theme.gradient) {
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
    } else ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, cardW, cardH);

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

    if (bgImage)    await loadImg(bgImage, bgOpacity);
    if (photoImage) await loadImg(photoImage, photoOpacity / 100, effectiveFilter);
    if (showWatermark) await loadImg(AUTHOR_PHOTO, watermarkOpacity / 100);

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

    for (const layer of textLayers) {
      if (!layer.visible || !layer.text.trim()) continue;
      await ensureFontLoaded(layer.fontKey);
      ctx.font = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}${layer.fontSize}px ${FONT_CSS[layer.fontKey] || "'Tiro Bangla', serif"}`;
      ctx.fillStyle = layer.color;
      ctx.textAlign = layer.align;
      if (layer.shadow) { ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; }
      const displayText = layer.kind === "author" ? `___❐ ${layer.text}` : layer.text;
      // Use per-layer box width for text wrapping (InShot-style)
      const boxSize = textBoxSizes[layer.id] ?? { w: 0.8, h: 0.15 };
      const maxW = boxSize.w * cardW - padding;
      const lines = wrapText(ctx, displayText, maxW);
      const totalH = lines.length * layer.fontSize * layer.lineHeight;
      const startY = layer.y * cardH - totalH / 2 + layer.fontSize;
      const xPos = layer.align === "center" ? layer.x * cardW : layer.align === "right" ? layer.x * cardW + 200 : layer.x * cardW;
      lines.forEach((line, i) => ctx.fillText(line, xPos, startY + i * layer.fontSize * layer.lineHeight));
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    }

    for (const s of stickers) {
      ctx.font = `${s.size}px serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(s.emoji, s.x * cardW, s.y * cardH);
      ctx.textBaseline = "alphabetic";
    }

    return canvas;
  }, [theme, cardW, cardH, frame, padding, bgImage, bgOpacity, photoImage, photoOpacity, effectiveFilter, showWatermark, watermarkOpacity, textLayers, stickers, textBoxSizes]);

  const handleDownload = async (quality: ExportQuality) => {
    setDownloading(true);
    try {
      let dpr = 2;
      let suffix = "1080";
      if (quality === "1x") { dpr = 1; suffix = "standard"; }
      else if (quality === "4k") { dpr = 4; suffix = "4K"; }
      const canvas = await buildCanvas(dpr);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `mahbub-sardar-sabuj-design-${suffix}.png`;
      a.click();
    } finally { setDownloading(false); }
  };

  const onPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => setPhotoImage(ev.target?.result as string); r.readAsDataURL(f);
  };
  const onBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => setBgImage(ev.target?.result as string); r.readAsDataURL(f);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // UI helpers
  // ─────────────────────────────────────────────────────────────────────────

  const Pill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick}
      style={{
        padding: "6px 16px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        border: `1px solid ${active ? "#D4A843" : "#1e3050"}`,
        background: active ? "#D4A843" : "transparent",
        color: active ? "#000" : "#9ca3af",
        cursor: "pointer",
        transition: "all 0.15s",
      }}>
      {label}
    </button>
  );

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ color: "#6b7280", fontSize: 11, width: 80, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );

  const Slider = ({ val, set, min, max, step = 1 }: { val: number; set: (v: number) => void; min: number; max: number; step?: number }) => (
    <input type="range" min={min} max={max} step={step} value={val}
      onChange={e => set(+e.target.value)}
      style={{ width: "100%", height: 6, borderRadius: 3, accentColor: "#D4A843", cursor: "pointer" }} />
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#060c18", color: "#fff" }}>
      <Seo title="ডিজাইন ফরম্যাট | মাহবুব সরদার সবুজ"
        description="প্রিমিয়াম বাংলা লেখার কার্ড ডিজাইন করুন" />
      <Navbar />

      <div style={{ paddingTop: 80, paddingBottom: 112, paddingLeft: 12, paddingRight: 12, maxWidth: 1280, margin: "0 auto" }}>
        {/* Desktop two-column layout */}
        <div className="lg:grid lg:grid-cols-[1fr_460px] lg:gap-10 lg:items-start">

        {/* ── LEFT COLUMN: Brand header + Preview ── */}
        <div className="lg:sticky lg:top-24 lg:self-start">

        {/* ── Brand header — animated */}
        <motion.div
          style={{ textAlign: "center", marginBottom: 32 }}
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div style={{ position: "relative", display: "inline-block" }}>
            <motion.div
              style={{ position: "absolute", inset: -32, borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(212,168,67,0.18) 0%, transparent 70%)" }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              style={{ position: "absolute", bottom: -8, left: 0, right: 0, height: 2, borderRadius: 2,
                background: "linear-gradient(90deg, transparent, #D4A843, #f5e27a, #D4A843, transparent)" }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.h1
              style={{
                position: "relative",
                fontFamily: "'AkhandBengali', 'Noto Sans Bengali', sans-serif",
                fontSize: "clamp(1.9rem, 7vw, 2.8rem)",
                fontWeight: 800,
                lineHeight: 1.2,
                background: "linear-gradient(135deg, #f5e27a 0%, #D4A843 30%, #b8892a 60%, #f0c96a 85%, #fff8dc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                backgroundSize: "200% 200%",
                filter: "drop-shadow(0 2px 16px rgba(212,168,67,0.35))",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              সরদার ডিজাইন স্টুডিও
            </motion.h1>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            LIVE PREVIEW
        ══════════════════════════════════════════════════════════════ */}
        <div ref={previewRef} style={{ width: "100%", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: cardW * scale,
                height: cardH * scale,
                position: "relative",
                flexShrink: 0,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,168,67,0.12)",
                cursor: dragging ? "grabbing" : "default",
              }}
              onClick={() => setSelectedId(null)}
            >
              {/* Card */}
              <div style={{
                width: cardW, height: cardH,
                background: theme.gradient || theme.bg,
                position: "absolute", top: 0, left: 0,
                transform: `scale(${scale})`, transformOrigin: "top left",
                overflow: "hidden",
              }}>
                {bgImage && (
                  <div style={{ position: "absolute", inset: 0, zIndex: 1,
                    backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center",
                    opacity: bgOpacity }} />
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
                  if (!layer.visible || !layer.text.trim()) return null;
                  const displayText = layer.kind === "author" ? `___❐ ${layer.text}` : layer.text;
                  const isSelected = selectedId === layer.id;
                  const boxSize = textBoxSizes[layer.id] ?? { w: 0.7, h: 0.15 };
                  const boxW = boxSize.w * cardW;
                  const boxH = boxSize.h * cardH;
                  const handleSz = Math.ceil(28 / scale);
                  return (
                    <div key={layer.id}
                      onClick={e => { e.stopPropagation(); setSelectedId(layer.id); }}
                      onMouseDown={e => { if ((e.target as HTMLElement).dataset.resize) return; startDrag(e, layer.id, false, layer.x, layer.y); }}
                      onTouchStart={e => { if ((e.target as HTMLElement).dataset.resize) return; startDrag(e, layer.id, false, layer.x, layer.y); }}
                      style={{
                        position: "absolute",
                        left: layer.x * cardW, top: layer.y * cardH,
                        width: boxW,
                        minHeight: boxH,
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                        cursor: dragging?.id === layer.id ? "grabbing" : "grab",
                        userSelect: "none",
                        textAlign: layer.align,
                        boxSizing: "border-box",
                      }}>
                      {/* Delete button */}
                      {isSelected && (
                        <button
                          data-nodelete="1"
                          onMouseDown={e => e.stopPropagation()}
                          onTouchStart={e => e.stopPropagation()}
                          onClick={e => { e.stopPropagation(); removeLayer(layer.id); }}
                          style={{
                            position: "absolute",
                            top: -handleSz * 0.9, right: -handleSz * 0.5,
                            zIndex: 30,
                            background: "#ef4444", color: "#fff",
                            border: "2px solid #fff", borderRadius: "50%",
                            width: handleSz, height: handleSz,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: Math.ceil(16 / scale),
                            cursor: "pointer", fontWeight: "bold",
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
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        textShadow: layer.shadow ? "2px 2px 8px rgba(0,0,0,0.5)" : "none",
                        outline: isSelected ? `${Math.ceil(2 / scale)}px dashed #D4A843` : "none",
                        outlineOffset: `${Math.ceil(4 / scale)}px`,
                        borderRadius: Math.ceil(4 / scale),
                        padding: `${Math.ceil(4 / scale)}px`,
                        width: "100%",
                        minHeight: boxH,
                      }}>
                        {displayText}
                      </div>
                      {/* Resize handle — bottom-right corner (InShot style) */}
                      {isSelected && (
                        <div
                          data-resize="1"
                          onMouseDown={e => {
                            e.stopPropagation();
                            setResizing({ id: layer.id, startX: e.clientX, startY: e.clientY, origW: boxSize.w, origH: boxSize.h });
                            // save current fontSize as baseFontSize for scaling reference
                            setTextLayers(prev => prev.map(l => l.id === layer.id ? { ...l, baseFontSize: l.fontSize } : l));
                          }}
                          onTouchStart={e => {
                            e.stopPropagation();
                            setResizing({ id: layer.id, startX: e.touches[0].clientX, startY: e.touches[0].clientY, origW: boxSize.w, origH: boxSize.h });
                            setTextLayers(prev => prev.map(l => l.id === layer.id ? { ...l, baseFontSize: l.fontSize } : l));
                          }}
                          style={{
                            position: "absolute",
                            bottom: -handleSz * 0.5, right: -handleSz * 0.5,
                            width: handleSz, height: handleSz,
                            background: "#D4A843", border: "2px solid #fff",
                            borderRadius: Math.ceil(4 / scale),
                            cursor: "se-resize", zIndex: 30,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: Math.ceil(12 / scale), color: "#000", fontWeight: "bold",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                          }}>⤡</div>
                      )}
                    </div>
                  );
                })}

                {/* Draggable stickers */}
                {stickers.map(s => {
                  const isSelected = selectedId === s.id;
                  return (
                    <div key={s.id}
                      onMouseDown={e => startDrag(e, s.id, true, s.x, s.y)}
                      onTouchStart={e => startDrag(e, s.id, true, s.x, s.y)}
                      style={{
                        position: "absolute",
                        left: s.x * cardW, top: s.y * cardH,
                        transform: "translate(-50%, -50%)",
                        zIndex: 11,
                        cursor: dragging?.id === s.id ? "grabbing" : "grab",
                        userSelect: "none",
                        fontSize: s.size, lineHeight: 1,
                      }}>
                      {isSelected && (
                        <button
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => { e.stopPropagation(); removeLayer(s.id); }}
                          style={{
                            position: "absolute",
                            top: -Math.ceil(28 / scale), right: -Math.ceil(8 / scale),
                            zIndex: 20, background: "#ef4444", color: "#fff",
                            border: "none", borderRadius: Math.ceil(6 / scale),
                            padding: `${Math.ceil(2 / scale)}px ${Math.ceil(8 / scale)}px`,
                            fontSize: Math.ceil(20 / scale), cursor: "pointer",
                            lineHeight: 1.2, fontWeight: "bold",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                          }}>✕</button>
                      )}
                      <div style={{
                        outline: isSelected ? `${Math.ceil(2 / scale)}px dashed #D4A843` : "none",
                        outlineOffset: `${Math.ceil(5 / scale)}px`,
                        borderRadius: Math.ceil(4 / scale),
                        padding: `${Math.ceil(4 / scale)}px`,
                      }}>
                        {s.emoji}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Theme dots row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, padding: "0 4px" }}>
            <span style={{ color: "#374151", fontSize: 10 }}>{cardW}×{cardH}px</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {THEMES.map((t, i) => (
                <button key={t.name} onClick={() => setThemeIdx(i)} title={t.name}
                  style={{
                    width: 20, height: 20, borderRadius: "50%",
                    border: themeIdx === i ? "2px solid #D4A843" : "2px solid transparent",
                    background: t.gradient || t.bg,
                    transform: themeIdx === i ? "scale(1.25)" : "scale(1)",
                    cursor: "pointer", transition: "all 0.15s",
                  }} />
              ))}
            </div>
          </div>
        </div>

        </div>{/* end left column */}

        {/* ── RIGHT COLUMN: Tools + Download ── */}
        <div className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">

        {/* ══════════════════════════════════════════════════════════════
            TOOL TABS
        ══════════════════════════════════════════════════════════════ */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
          {([
            ["text",    "✏️ লেখা"],
            ["style",   "🎨 স্টাইল"],
            ["photo",   "🖼️ ছবি"],
            ["design",  "⚙️ ডিজাইন"],
            ["stickers","✨ স্টিকার"],
          ] as [ActiveTool, string][]).map(([id, label]) => (
            <Pill key={id} label={label} active={activeTool === id} onClick={() => setActiveTool(id)} />
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            TOOL PANELS
        ══════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTool}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{ background: "#0d1a2d", borderRadius: 16, border: "1px solid #1e3050", overflow: "hidden" }}>

            {/* ── TEXT PANEL ── */}
            {activeTool === "text" && (
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ color: "#D4A843", fontSize: 11, fontWeight: 700 }}>লেখার নাম</label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <input type="checkbox" checked={textLayers.find(l => l.kind === "title")?.visible ?? true}
                        onChange={e => updateText("title", { visible: e.target.checked })}
                        style={{ width: 14, height: 14, accentColor: "#D4A843" }} />
                      <span style={{ color: "#6b7280", fontSize: 11 }}>দেখাও</span>
                    </label>
                  </div>
                  <input value={textLayers.find(l => l.kind === "title")?.text ?? ""}
                    onChange={e => updateText("title", { text: e.target.value })}
                    style={{ width: "100%", background: "#060c18", color: "#fff", border: "1px solid #1e3050",
                      borderRadius: 12, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ color: "#D4A843", fontSize: 11, fontWeight: 700 }}>মূল লেখা</label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <input type="checkbox" checked={textLayers.find(l => l.kind === "body")?.visible ?? true}
                        onChange={e => updateText("body", { visible: e.target.checked })}
                        style={{ width: 14, height: 14, accentColor: "#D4A843" }} />
                      <span style={{ color: "#6b7280", fontSize: 11 }}>দেখাও</span>
                    </label>
                  </div>
                  <textarea value={textLayers.find(l => l.kind === "body")?.text ?? ""}
                    onChange={e => updateText("body", { text: e.target.value })}
                    rows={5}
                    style={{ width: "100%", background: "#060c18", color: "#fff", border: "1px solid #1e3050",
                      borderRadius: 12, padding: "10px 12px", fontSize: 14, outline: "none",
                      resize: "vertical", lineHeight: 1.7, boxSizing: "border-box" }} />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ color: "#D4A843", fontSize: 11, fontWeight: 700 }}>লেখক নাম</label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <input type="checkbox" checked={textLayers.find(l => l.kind === "author")?.visible ?? true}
                        onChange={e => updateText("author", { visible: e.target.checked })}
                        style={{ width: 14, height: 14, accentColor: "#D4A843" }} />
                      <span style={{ color: "#6b7280", fontSize: 11 }}>দেখাও</span>
                    </label>
                  </div>
                  <input value={textLayers.find(l => l.kind === "author")?.text ?? ""}
                    onChange={e => updateText("author", { text: e.target.value })}
                    style={{ width: "100%", background: "#060c18", color: "#fff", border: "1px solid #1e3050",
                      borderRadius: 12, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>

                <div>
                  <p style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, marginBottom: 8 }}>দ্রুত টেমপ্লেট</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {TEMPLATES.map(t => (
                      <button key={t.label}
                        onClick={() => { updateText("title", { text: t.title, visible: true }); updateText("body", { text: t.body, visible: true }); }}
                        style={{ textAlign: "left", padding: "8px 12px", background: "#060c18",
                          border: "1px solid #1e3050", borderRadius: 12, fontSize: 12,
                          color: "#d1d5db", cursor: "pointer" }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={addCustomText}
                  style={{ width: "100%", padding: "10px 0", border: "1px dashed rgba(212,168,67,0.3)",
                    borderRadius: 12, fontSize: 13, fontWeight: 600, color: "rgba(212,168,67,0.7)",
                    background: "transparent", cursor: "pointer" }}>
                  + নতুন কাস্টম লেখা যোগ করুন
                </button>
              </div>
            )}

            {/* ── STYLE PANEL ── */}
            {activeTool === "style" && (
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <p style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, marginBottom: 8 }}>কোন লেখা সম্পাদনা করবেন?</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {textLayers.filter(l => l.visible).map(l => (
                      <button key={l.id} onClick={() => setSelectedId(l.id)}
                        style={{
                          padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                          border: `1px solid ${selectedId === l.id ? "#D4A843" : "#1e3050"}`,
                          background: selectedId === l.id ? "rgba(212,168,67,0.1)" : "transparent",
                          color: selectedId === l.id ? "#D4A843" : "#9ca3af", cursor: "pointer",
                        }}>
                        {l.kind === "title" ? "শিরোনাম" : l.kind === "body" ? "মূল লেখা" : l.kind === "author" ? "লেখক নাম" : l.text.slice(0, 8) || "কাস্টম"}
                      </button>
                    ))}
                    {stickers.map(s => (
                      <button key={s.id} onClick={() => setSelectedId(s.id)}
                        style={{
                          padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                          border: `1px solid ${selectedId === s.id ? "#D4A843" : "#1e3050"}`,
                          background: selectedId === s.id ? "rgba(212,168,67,0.1)" : "transparent",
                          color: selectedId === s.id ? "#D4A843" : "#9ca3af", cursor: "pointer",
                        }}>
                        {s.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedText && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Color picker — custom color */}
                    <div>
                      <label style={{ color: "#6b7280", fontSize: 11, display: "block", marginBottom: 8 }}>রঙ নির্বাচন করুন</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Large color swatch that opens native picker */}
                        <label style={{ cursor: "pointer", position: "relative" }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 12,
                            background: selectedText.color,
                            border: "3px solid rgba(255,255,255,0.2)",
                            boxShadow: `0 0 0 2px ${selectedText.color}40, 0 4px 12px rgba(0,0,0,0.4)`,
                            cursor: "pointer",
                          }} />
                          <input type="color" value={selectedText.color}
                            onChange={e => updateText(selectedText.id, { color: e.target.value })}
                            style={{ position: "absolute", opacity: 0, width: 0, height: 0, top: 0, left: 0 }} />
                        </label>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "monospace" }}>
                            {selectedText.color.toUpperCase()}
                          </div>
                          <div style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>ক্লিক করে রঙ বদলান</div>
                        </div>
                        {/* Quick preset colors */}
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 120 }}>
                          {["#FFFFFF","#000000","#D4A843","#E8D5A3","#FF6B6B","#4ECDC4","#45B7D1","#96CEB4"].map(c => (
                            <button key={c} onClick={() => updateText(selectedText.id, { color: c })}
                              title={c}
                              style={{
                                width: 22, height: 22, borderRadius: 6,
                                background: c, border: selectedText.color === c ? "2px solid #D4A843" : "1px solid rgba(255,255,255,0.2)",
                                cursor: "pointer",
                              }} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ color: "#6b7280", fontSize: 11, display: "block", marginBottom: 6 }}>
                          ফন্ট সাইজ — <span style={{ color: "#D4A843", fontWeight: 700 }}>{selectedText.fontSize}px</span>
                        </label>
                        <input type="range" min={10} max={200} step={1} value={selectedText.fontSize}
                          onChange={e => updateText(selectedText.id, { fontSize: +e.target.value, baseFontSize: +e.target.value })}
                          style={{ width: "100%", height: 6, borderRadius: 3, accentColor: "#D4A843", cursor: "pointer" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#374151", fontSize: 10, marginTop: 2 }}>
                          <span>10</span><span>100</span><span>200</span>
                        </div>
                      </div>
                      <div>
                        <label style={{ color: "#6b7280", fontSize: 11, display: "block", marginBottom: 6 }}>
                          লাইন উচ্চতা — <span style={{ color: "#D4A843", fontWeight: 700 }}>{selectedText.lineHeight.toFixed(1)}</span>
                        </label>
                        <Slider val={selectedText.lineHeight} set={v => updateText(selectedText.id, { lineHeight: v })} min={1} max={3.5} step={0.05} />
                      </div>
                    </div>

                    <div>
                      <label style={{ color: "#6b7280", fontSize: 11, display: "block", marginBottom: 8 }}>স্টাইল</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {([["bold", "বোল্ড", selectedText.bold], ["italic", "বাঁকা", selectedText.italic], ["shadow", "শ্যাডো", selectedText.shadow]] as [string, string, boolean][]).map(([key, lbl, val]) => (
                          <button key={key}
                            onClick={() => updateText(selectedText.id, { [key]: !val })}
                            style={{
                              flex: 1, padding: "8px 0", borderRadius: 12, fontSize: 11, fontWeight: 700,
                              border: `1px solid ${val ? "#D4A843" : "#1e3050"}`,
                              background: val ? "rgba(212,168,67,0.15)" : "transparent",
                              color: val ? "#D4A843" : "#6b7280", cursor: "pointer",
                            }}>
                            {lbl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ color: "#6b7280", fontSize: 11, display: "block", marginBottom: 8 }}>সারিবদ্ধতা</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["left", "center", "right"] as const).map(a => (
                          <button key={a} onClick={() => updateText(selectedText.id, { align: a })}
                            style={{
                              flex: 1, padding: "8px 0", borderRadius: 12, fontSize: 13,
                              border: `1px solid ${selectedText.align === a ? "#D4A843" : "#1e3050"}`,
                              background: selectedText.align === a ? "rgba(212,168,67,0.15)" : "transparent",
                              color: selectedText.align === a ? "#D4A843" : "#6b7280", cursor: "pointer",
                            }}>
                            {a === "left" ? "⬅" : a === "center" ? "↔" : "➡"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ color: "#6b7280", fontSize: 11, display: "block", marginBottom: 8 }}>ফন্ট</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, maxHeight: 160, overflowY: "auto" }}>
                        {FONTS.map(f => (
                          <button key={f.value} onClick={() => updateText(selectedText.id, { fontKey: f.value })}
                            style={{
                              textAlign: "left", padding: "8px 12px", borderRadius: 12, fontSize: 11,
                              border: `1px solid ${selectedText.fontKey === f.value ? "#D4A843" : "#1e3050"}`,
                              background: selectedText.fontKey === f.value ? "rgba(212,168,67,0.1)" : "transparent",
                              color: selectedText.fontKey === f.value ? "#D4A843" : "#9ca3af",
                              fontFamily: FONT_CSS[f.value], cursor: "pointer",
                            }}>
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedText.kind === "custom" && (
                      <button onClick={() => removeLayer(selectedText.id)}
                        style={{ width: "100%", padding: "8px 0", color: "#f87171",
                          border: "1px solid rgba(248,113,113,0.2)", borderRadius: 12,
                          fontSize: 11, background: "transparent", cursor: "pointer" }}>
                        এই লেখা মুছে দিন
                      </button>
                    )}
                  </div>
                )}

                {selectedSticker && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ textAlign: "center", fontSize: 48 }}>{selectedSticker.emoji}</div>
                    <Row label="আকার">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Slider val={selectedSticker.size} set={v => setStickers(prev => prev.map(s => s.id === selectedSticker.id ? { ...s, size: v } : s))} min={20} max={300} />
                        <span style={{ color: "#D4A843", fontSize: 11, fontWeight: 700, width: 48, textAlign: "right" }}>{selectedSticker.size}px</span>
                      </div>
                    </Row>
                    <button onClick={() => removeLayer(selectedSticker.id)}
                      style={{ width: "100%", padding: "8px 0", color: "#f87171",
                        border: "1px solid rgba(248,113,113,0.2)", borderRadius: 12,
                        fontSize: 11, background: "transparent", cursor: "pointer" }}>
                      স্টিকার মুছে দিন
                    </button>
                  </div>
                )}

                {!selectedText && !selectedSticker && (
                  <p style={{ color: "#4b5563", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                    উপরে একটি লেখা বা স্টিকার নির্বাচন করুন
                  </p>
                )}
              </div>
            )}

            {/* ── PHOTO PANEL ── */}
            {activeTool === "photo" && (
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 20 }}>
                <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPhotoUpload} />
                <input ref={bgFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onBgUpload} />

                <div>
                  <p style={{ color: "#D4A843", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>মূল ছবি</p>
                  <button onClick={() => photoRef.current?.click()}
                    style={{ width: "100%", padding: "24px 0", border: "2px dashed rgba(212,168,67,0.3)",
                      borderRadius: 16, textAlign: "center", background: "transparent", cursor: "pointer" }}>
                    {photoImage ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <img src={photoImage} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 12, filter: effectiveFilter }} />
                        <span style={{ color: "#D4A843", fontSize: 11 }}>ছবি পরিবর্তন করুন</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 28 }}>📷</span>
                        <span style={{ color: "#9ca3af", fontSize: 13 }}>ছবি আপলোড করুন</span>
                      </div>
                    )}
                  </button>

                  {photoImage && (
                    <>
                      <div style={{ marginTop: 12 }}>
                        <p style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, marginBottom: 8 }}>ফিল্টার</p>
                        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                          {FILTER_PRESETS.map(fp => (
                            <button key={fp.name} onClick={() => setFilterPreset(fp.name)}
                              style={{
                                flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                                padding: 6, borderRadius: 12,
                                border: `1px solid ${filterPreset === fp.name ? "#D4A843" : "#1e3050"}`,
                                background: filterPreset === fp.name ? "rgba(212,168,67,0.1)" : "transparent",
                                cursor: "pointer",
                              }}>
                              <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden" }}>
                                <img src={photoImage} style={{ width: "100%", height: "100%", objectFit: "cover",
                                  filter: fp.filter === "none" ? undefined : fp.filter }} />
                              </div>
                              <span style={{ fontSize: 9, color: filterPreset === fp.name ? "#D4A843" : "#6b7280" }}>{fp.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <Row label="অপাসিটি">
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Slider val={photoOpacity} set={setPhotoOpacity} min={0} max={100} />
                            <span style={{ color: "#D4A843", fontSize: 11, fontWeight: 700, width: 40, textAlign: "right" }}>{photoOpacity}%</span>
                          </div>
                        </Row>
                      </div>
                      <button onClick={() => setPhotoImage(null)}
                        style={{ marginTop: 8, width: "100%", padding: "8px 0", color: "#f87171",
                          fontSize: 11, border: "1px solid rgba(248,113,113,0.2)", borderRadius: 12,
                          background: "transparent", cursor: "pointer" }}>
                        ছবি সরিয়ে দিন
                      </button>
                    </>
                  )}
                </div>

                <div style={{ paddingTop: 16, borderTop: "1px solid #1e3050" }}>
                  <p style={{ color: "#D4A843", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>পটভূমি ছবি</p>
                  <button onClick={() => bgFileRef.current?.click()}
                    style={{ width: "100%", padding: 12, border: "1px dashed #1e3050",
                      borderRadius: 12, color: "#9ca3af", fontSize: 13, background: "transparent", cursor: "pointer" }}>
                    {bgImage ? "✅ পটভূমি পরিবর্তন করুন" : "🌅 পটভূমি ছবি আপলোড করুন"}
                  </button>
                  {bgImage && (
                    <>
                      <div style={{ marginTop: 12 }}>
                        <Row label="অপাসিটি">
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Slider val={Math.round(bgOpacity * 100)} set={v => setBgOpacity(v / 100)} min={0} max={100} />
                            <span style={{ color: "#D4A843", fontSize: 11, fontWeight: 700, width: 40, textAlign: "right" }}>{Math.round(bgOpacity * 100)}%</span>
                          </div>
                        </Row>
                      </div>
                      <button onClick={() => setBgImage(null)}
                        style={{ marginTop: 8, width: "100%", padding: "8px 0", color: "#f87171",
                          fontSize: 11, border: "1px solid rgba(248,113,113,0.2)", borderRadius: 12,
                          background: "transparent", cursor: "pointer" }}>
                        পটভূমি সরিয়ে দিন
                      </button>
                    </>
                  )}
                </div>

                <div style={{ paddingTop: 16, borderTop: "1px solid #1e3050" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={showWatermark} onChange={e => setShowWatermark(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: "#D4A843" }} />
                    <span style={{ color: "#d1d5db", fontSize: 13 }}>লেখকের ছবি ওয়াটারমার্ক</span>
                  </label>
                  {showWatermark && (
                    <div style={{ marginTop: 8 }}>
                      <Row label="অপাসিটি">
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <Slider val={watermarkOpacity} set={setWatermarkOpacity} min={1} max={40} />
                          <span style={{ color: "#D4A843", fontSize: 11, fontWeight: 700, width: 40, textAlign: "right" }}>{watermarkOpacity}%</span>
                        </div>
                      </Row>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── DESIGN PANEL ── */}
            {activeTool === "design" && (
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <p style={{ color: "#D4A843", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>থিম</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, maxHeight: 192, overflowY: "auto" }}>
                    {THEMES.map((t, i) => (
                      <button key={t.name} onClick={() => setThemeIdx(i)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                          borderRadius: 12, fontSize: 11, fontWeight: 500,
                          border: `1px solid ${themeIdx === i ? "#D4A843" : "#1e3050"}`,
                          background: themeIdx === i ? "rgba(212,168,67,0.1)" : "transparent",
                          color: themeIdx === i ? "#D4A843" : "#9ca3af", cursor: "pointer",
                        }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                          border: "1px solid rgba(255,255,255,0.1)", background: t.gradient || t.bg }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ color: "#D4A843", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>আকার</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                    {SIZES.map((s, i) => (
                      <button key={s.name} onClick={() => setSizeIdx(i)}
                        style={{
                          padding: "8px 4px", borderRadius: 12, fontSize: 10, fontWeight: 500,
                          border: `1px solid ${sizeIdx === i ? "#D4A843" : "#1e3050"}`,
                          background: sizeIdx === i ? "rgba(212,168,67,0.1)" : "transparent",
                          color: sizeIdx === i ? "#D4A843" : "#9ca3af", cursor: "pointer",
                        }}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ color: "#D4A843", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>ফ্রেম</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
                    {FRAMES.map(f => (
                      <button key={f.value} onClick={() => setFrame(f.value)}
                        style={{
                          padding: "8px 4px", borderRadius: 12, fontSize: 10, fontWeight: 500,
                          border: `1px solid ${frame === f.value ? "#D4A843" : "#1e3050"}`,
                          background: frame === f.value ? "rgba(212,168,67,0.1)" : "transparent",
                          color: frame === f.value ? "#D4A843" : "#9ca3af", cursor: "pointer",
                        }}>
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STICKERS PANEL ── */}
            {activeTool === "stickers" && (
              <div style={{ padding: 16 }}>
                {/* Category tabs */}
                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 12 }}>
                  {STICKER_CATEGORIES.map((cat, i) => (
                    <button key={i} onClick={() => setActiveStickerCat(i)}
                      style={{
                        flexShrink: 0, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                        border: `1px solid ${activeStickerCat === i ? "#D4A843" : "#1e3050"}`,
                        background: activeStickerCat === i ? "#D4A843" : "transparent",
                        color: activeStickerCat === i ? "#000" : "#9ca3af", cursor: "pointer",
                      }}>
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Sticker grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4 }}>
                  {STICKER_CATEGORIES[activeStickerCat].stickers.map(emoji => (
                    <button key={emoji} onClick={() => addSticker(emoji)}
                      style={{
                        fontSize: 22, padding: 6, borderRadius: 10, textAlign: "center",
                        lineHeight: 1, background: "transparent", border: "none", cursor: "pointer",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(212,168,67,0.1)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      {emoji}
                    </button>
                  ))}
                </div>

                {stickers.length > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1e3050" }}>
                    <p style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, marginBottom: 8 }}>যোগ করা স্টিকার</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {stickers.map(s => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 4,
                          background: "#060c18", border: "1px solid #1e3050", borderRadius: 12, padding: "4px 8px" }}>
                          <span style={{ fontSize: 18 }}>{s.emoji}</span>
                          <button onClick={() => removeLayer(s.id)}
                            style={{ color: "#f87171", fontSize: 11, background: "none", border: "none", cursor: "pointer" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════
            DOWNLOAD SECTION — সব টুলের নিচে
        ══════════════════════════════════════════════════════════════ */}
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Quality selector */}
          <div style={{ display: "flex", gap: 6, background: "#0d1a2d", borderRadius: 14, padding: 6, border: "1px solid #1e3050" }}>
            {([
              ["1x", "স্ট্যান্ডার্ড", `${cardW}×${cardH}`],
              ["2x", "HD", `${cardW * 2}×${cardH * 2}`],
              ["4k", "4K Ultra", `${cardW * 4}×${cardH * 4}`],
            ] as [ExportQuality, string, string][]).map(([q, label, res]) => (
              <button key={q} onClick={() => setExportQuality(q)}
                style={{
                  flex: 1, padding: "8px 4px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                  border: `1px solid ${exportQuality === q ? "#D4A843" : "transparent"}`,
                  background: exportQuality === q ? "rgba(212,168,67,0.15)" : "transparent",
                  color: exportQuality === q ? "#D4A843" : "#6b7280", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                }}>
                <span>{label}</span>
                <span style={{ fontSize: 9, opacity: 0.7 }}>{res}</span>
              </button>
            ))}
          </div>

          {/* Main download button */}
          <button onClick={() => handleDownload(exportQuality)} disabled={downloading}
            style={{
              width: "100%", padding: "16px 0",
              background: downloading ? "rgba(212,168,67,0.5)" : "linear-gradient(135deg, #D4A843 0%, #b8892a 100%)",
              color: "#000", fontWeight: 700, borderRadius: 16, fontSize: 16,
              border: "none", cursor: downloading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 8px 24px rgba(212,168,67,0.3)",
              transition: "all 0.2s",
            }}>
            {downloading
              ? <><div style={{ width: 20, height: 20, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> ডাউনলোড হচ্ছে...</>
              : <>⬇️ ডাউনলোড করুন
                  <span style={{ fontSize: 11, opacity: 0.75, fontWeight: 500 }}>
                    ({exportQuality === "1x" ? "স্ট্যান্ডার্ড" : exportQuality === "2x" ? "HD" : "4K"})
                  </span>
                </>
            }
          </button>
        </div>

        </div>{/* end right column */}
        </div>{/* end desktop grid */}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
