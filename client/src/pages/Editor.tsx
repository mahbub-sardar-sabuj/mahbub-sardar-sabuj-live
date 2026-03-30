/**
 * ডিজাইন ফরম্যাট v6
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

const STICKER_LIST = [
  "🌸","🌙","⭐","✨","🌿","🦋","🕊️","🌹","💫","🔥","🌊","🎋",
  "🌺","💎","🪷","🌟","🏵️","🌴","🍂","🌻","❤️","💛","💙","💜",
  "🤍","🖤","🌈","☁️","⚡","🌕","🍃","🌷","🪐","🧿","🔮","🌠",
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
      x: 0.5, y: 0.22, fontSize: 52, fontKey: "ChandraSheela",
      color: themeText, bold: true,  italic: false, align: "center",
      shadow: false, visible: true, lineHeight: 1.3 },
    { id: "body",   kind: "body",   text: "",
      x: 0.5, y: 0.52, fontSize: 36, fontKey: "ChandraSheela",
      color: themeText, bold: false, italic: false, align: "center",
      shadow: false, visible: true, lineHeight: 1.9 },
    { id: "author", kind: "author", text: "",
      x: 0.5, y: 0.84, fontSize: 28, fontKey: "ChandraSheela",
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
  const [scale, setScale]             = useState(0.36);

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
      x: 0.5, y: 0.5, fontSize: 40, fontKey: "ChandraSheela",
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

  // ── Resize text box ───────────────────────────────────────────────────────
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

  const buildCanvas = useCallback(async (): Promise<HTMLCanvasElement> => {
    await Promise.all(textLayers.map(l => ensureFontLoaded(l.fontKey)));
    await document.fonts.ready;
    const DPR = 2;
    const canvas = document.createElement("canvas");
    canvas.width = cardW * DPR; canvas.height = cardH * DPR;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(DPR, DPR);

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
      const lines = wrapText(ctx, displayText, cardW - padding * 2);
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
  }, [theme, cardW, cardH, frame, padding, bgImage, bgOpacity, photoImage, photoOpacity, effectiveFilter, showWatermark, watermarkOpacity, textLayers, stickers]);

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
      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border ${
        active
          ? "bg-[#D4A843] text-black border-[#D4A843]"
          : "bg-transparent text-gray-400 border-[#1e3050] hover:border-[#D4A843]/50 hover:text-white"
      }`}>
      {label}
    </button>
  );

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center gap-3">
      <span className="text-gray-500 text-xs w-20 flex-shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );

  const Slider = ({ val, set, min, max, step = 1 }: { val: number; set: (v: number) => void; min: number; max: number; step?: number }) => (
    <input type="range" min={min} max={max} step={step} value={val}
      onChange={e => set(+e.target.value)}
      className="w-full h-1.5 rounded-full accent-[#D4A843] cursor-pointer" />
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#060c18] text-white">
      <Seo title="ডিজাইন ফরম্যাট | মাহবুব সরদার সবুজ"
        description="প্রিমিয়াম বাংলা লেখার কার্ড ডিজাইন করুন" />
      <Navbar />

      <div className="pt-20 pb-28 px-3 max-w-7xl mx-auto">
        {/* Desktop two-column layout */}
        <div className="lg:grid lg:grid-cols-[1fr_460px] lg:gap-10 lg:items-start">

        {/* ── LEFT COLUMN: Brand header + Preview ── */}
        <div className="lg:sticky lg:top-24 lg:self-start">

        {/* ── Brand header — animated */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="relative inline-block">
            {/* Pulsing ambient glow */}
            <motion.div
              className="absolute -inset-8 rounded-full"
              style={{ background: "radial-gradient(ellipse, rgba(212,168,67,0.18) 0%, transparent 70%)" }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Shimmer underline bar */}
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, #D4A843, #f5e27a, #D4A843, transparent)" }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            {/* Main brand title */}
            <motion.h1
              className="relative font-extrabold leading-tight"
              style={{
                fontFamily: "'AkhandBengali', 'Noto Sans Bengali', sans-serif",
                fontSize: "clamp(1.9rem, 7vw, 2.8rem)",
                background: "linear-gradient(135deg, #f5e27a 0%, #D4A843 30%, #b8892a 60%, #f0c96a 85%, #fff8dc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                backgroundSize: "200% 200%",
                filter: "drop-shadow(0 2px 16px rgba(212,168,67,0.35))",
                letterSpacing: "-0.01em",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              সরদার ডিজাইন স্টুডিও
            </motion.h1>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            LIVE PREVIEW — top, full width
        ══════════════════════════════════════════════════════════════ */}
        <div ref={previewRef} className="w-full mb-3">
          <div className="flex justify-center">
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
                      {/* Delete button — top-right, one click */}
                      {isSelected && (
                        <button
                          data-nodelete="1"
                          onMouseDown={e => e.stopPropagation()}
                          onTouchStart={e => e.stopPropagation()}
                          onClick={e => { e.stopPropagation(); removeLayer(layer.id); }}
                          style={{
                            position: "absolute",
                            top: -handleSz * 0.9,
                            right: -handleSz * 0.5,
                            zIndex: 30,
                            background: "#ef4444",
                            color: "#fff",
                            border: "2px solid #fff",
                            borderRadius: "50%",
                            width: handleSz,
                            height: handleSz,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: Math.ceil(16 / scale),
                            cursor: "pointer",
                            fontWeight: "bold",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                            lineHeight: 1,
                          }}>
                          ✕
                        </button>
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
                      {/* Resize handle — bottom-right corner */}
                      {isSelected && (
                        <div
                          data-resize="1"
                          onMouseDown={e => {
                            e.stopPropagation();
                            setResizing({ id: layer.id, startX: e.clientX, startY: e.clientY, origW: boxSize.w, origH: boxSize.h });
                          }}
                          onTouchStart={e => {
                            e.stopPropagation();
                            setResizing({ id: layer.id, startX: e.touches[0].clientX, startY: e.touches[0].clientY, origW: boxSize.w, origH: boxSize.h });
                          }}
                          style={{
                            position: "absolute",
                            bottom: -handleSz * 0.5,
                            right: -handleSz * 0.5,
                            width: handleSz,
                            height: handleSz,
                            background: "#D4A843",
                            border: "2px solid #fff",
                            borderRadius: Math.ceil(4 / scale),
                            cursor: "se-resize",
                            zIndex: 30,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: Math.ceil(12 / scale),
                            color: "#000",
                            fontWeight: "bold",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                          }}>
                          ⤡
                        </div>
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
                            top: -Math.ceil(28 / scale),
                            right: -Math.ceil(8 / scale),
                            zIndex: 20,
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: Math.ceil(6 / scale),
                            padding: `${Math.ceil(2 / scale)}px ${Math.ceil(8 / scale)}px`,
                            fontSize: Math.ceil(20 / scale),
                            cursor: "pointer",
                            lineHeight: 1.2,
                            fontWeight: "bold",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                          }}>
                          ✕
                        </button>
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
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-gray-700 text-[10px]">{cardW}×{cardH}px</span>
            <div className="flex gap-1.5 flex-wrap justify-end">
              {THEMES.map((t, i) => (
                <button key={t.name} onClick={() => setThemeIdx(i)} title={t.name}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    themeIdx === i ? "border-[#D4A843] scale-125" : "border-transparent hover:border-[#D4A843]/50"
                  }`}
                  style={{ background: t.gradient || t.bg }} />
              ))}
            </div>
          </div>
        </div>

        </div>{/* end left column */}

        {/* ── RIGHT COLUMN: Download + Tools ── */}
        <div className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
        {/* ════════════════════════════════════════════════════════════
            DOWNLOAD BUTTON
        ══════════════════════════════════════════════════════════════ */}
        <button onClick={handleDownload} disabled={downloading}
          className="w-full py-4 bg-gradient-to-r from-[#D4A843] to-[#b8892a] hover:from-[#c49030] hover:to-[#a07020] text-black font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-[#D4A843]/20 text-base mb-6">
          {downloading
            ? <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> ডাউনলোড হচ্ছে...</>
            : <>⬇️ PNG ডাউনলোড করুন ({cardW}×{cardH})</>
          }
        </button>

        {/* ══════════════════════════════════════════════════════════════
            TOOL TABS
        ══════════════════════════════════════════════════════════════ */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
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
            className="bg-[#0d1a2d] rounded-2xl border border-[#1e3050] overflow-hidden">

            {/* ── TEXT PANEL ── */}
            {activeTool === "text" && (
              <div className="p-4 space-y-4">

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#D4A843] text-xs font-bold">লেখার নাম</label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={textLayers.find(l => l.kind === "title")?.visible ?? true}
                        onChange={e => updateText("title", { visible: e.target.checked })}
                        className="w-3.5 h-3.5 accent-[#D4A843]" />
                      <span className="text-gray-500 text-xs">দেখাও</span>
                    </label>
                  </div>
                  <input value={textLayers.find(l => l.kind === "title")?.text ?? ""}
                    onChange={e => updateText("title", { text: e.target.value })}
                    className="w-full bg-[#060c18] text-white border border-[#1e3050] focus:border-[#D4A843] rounded-xl px-3 py-2.5 text-sm outline-none transition-colors" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#D4A843] text-xs font-bold">মূল লেখা</label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={textLayers.find(l => l.kind === "body")?.visible ?? true}
                        onChange={e => updateText("body", { visible: e.target.checked })}
                        className="w-3.5 h-3.5 accent-[#D4A843]" />
                      <span className="text-gray-500 text-xs">দেখাও</span>
                    </label>
                  </div>
                  <textarea value={textLayers.find(l => l.kind === "body")?.text ?? ""}
                    onChange={e => updateText("body", { text: e.target.value })}
                    rows={5}
                    className="w-full bg-[#060c18] text-white border border-[#1e3050] focus:border-[#D4A843] rounded-xl px-3 py-2.5 text-sm outline-none resize-y transition-colors leading-relaxed" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#D4A843] text-xs font-bold">লেখক নাম</label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={textLayers.find(l => l.kind === "author")?.visible ?? true}
                        onChange={e => updateText("author", { visible: e.target.checked })}
                        className="w-3.5 h-3.5 accent-[#D4A843]" />
                      <span className="text-gray-500 text-xs">দেখাও</span>
                    </label>
                  </div>
                  <input value={textLayers.find(l => l.kind === "author")?.text ?? ""}
                    onChange={e => updateText("author", { text: e.target.value })}
                    className="w-full bg-[#060c18] text-white border border-[#1e3050] focus:border-[#D4A843] rounded-xl px-3 py-2.5 text-sm outline-none transition-colors" />
                </div>

                <div>
                  <p className="text-gray-500 text-xs font-semibold mb-2">দ্রুত টেমপ্লেট</p>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATES.map(t => (
                      <button key={t.label}
                        onClick={() => { updateText("title", { text: t.title, visible: true }); updateText("body", { text: t.body, visible: true }); }}
                        className="text-left px-3 py-2 bg-[#060c18] hover:bg-[#1e3050] border border-[#1e3050] hover:border-[#D4A843]/40 rounded-xl text-xs text-gray-300 transition-all">
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={addCustomText}
                  className="w-full py-2.5 border border-dashed border-[#D4A843]/30 hover:border-[#D4A843]/70 text-[#D4A843]/70 hover:text-[#D4A843] rounded-xl text-sm font-semibold transition-all">
                  + নতুন কাস্টম লেখা যোগ করুন
                </button>
              </div>
            )}

            {/* ── STYLE PANEL ── */}
            {activeTool === "style" && (
              <div className="p-4 space-y-5">
                <div>
                  <p className="text-gray-500 text-xs font-semibold mb-2">কোন লেখা সম্পাদনা করবেন?</p>
                  <div className="flex gap-2 flex-wrap">
                    {textLayers.filter(l => l.visible).map(l => (
                      <button key={l.id} onClick={() => setSelectedId(l.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          selectedId === l.id
                            ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                            : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                        }`}>
                        {l.kind === "title" ? "শিরোনাম" : l.kind === "body" ? "মূল লেখা" : l.kind === "author" ? "লেখক নাম" : l.text.slice(0, 8) || "কাস্টম"}
                      </button>
                    ))}
                    {stickers.map(s => (
                      <button key={s.id} onClick={() => setSelectedId(s.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          selectedId === s.id
                            ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                            : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                        }`}>
                        {s.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedText && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-500 text-xs block mb-1.5">রঙ</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={selectedText.color}
                            onChange={e => updateText(selectedText.id, { color: e.target.value })}
                            className="w-10 h-9 rounded-lg border-0 cursor-pointer bg-transparent" />
                          <span className="text-gray-600 text-xs font-mono">{selectedText.color}</span>
                        </div>
                      </div>
                    <div>
                      <label className="text-gray-500 text-xs block mb-1.5">ফন্ট সাইজ — <span className="text-[#D4A843] font-bold">{selectedText.fontSize}px</span></label>
                      <input type="range" min={10} max={200} step={1} value={selectedText.fontSize}
                        onChange={e => updateText(selectedText.id, { fontSize: +e.target.value })}
                        className="w-full h-2 rounded-full accent-[#D4A843] cursor-pointer" />
                      <div className="flex justify-between text-gray-700 text-[10px] mt-0.5">
                        <span>10px</span><span>100px</span><span>200px</span>
                      </div>
                    </div>
                    </div>

                    <div>
                      <label className="text-gray-500 text-xs block mb-2">স্টাইল</label>
                      <div className="flex gap-2">
                        {([["bold", "বোল্ড", selectedText.bold], ["italic", "বাঁকা", selectedText.italic], ["shadow", "শ্যাডো", selectedText.shadow]] as [string, string, boolean][]).map(([key, lbl, val]) => (
                          <button key={key}
                            onClick={() => updateText(selectedText.id, { [key]: !val })}
                            className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                              val ? "border-[#D4A843] bg-[#D4A843]/15 text-[#D4A843]" : "border-[#1e3050] text-gray-500"
                            }`}>
                            {lbl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-500 text-xs block mb-2">সারিবদ্ধতা</label>
                      <div className="flex gap-2">
                        {(["left", "center", "right"] as const).map(a => (
                          <button key={a} onClick={() => updateText(selectedText.id, { align: a })}
                            className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                              selectedText.align === a ? "border-[#D4A843] bg-[#D4A843]/15 text-[#D4A843]" : "border-[#1e3050] text-gray-500"
                            }`}>
                            {a === "left" ? "⬅" : a === "center" ? "↔" : "➡"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-500 text-xs block mb-2">ফন্ট</label>
                      <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                        {FONTS.map(f => (
                          <button key={f.value} onClick={() => updateText(selectedText.id, { fontKey: f.value })}
                            className={`text-left px-3 py-2 rounded-xl border text-xs transition-all ${
                              selectedText.fontKey === f.value
                                ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                                : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                            }`} style={{ fontFamily: FONT_CSS[f.value] }}>
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Row label="লাইন উচ্চতা">
                      <div className="flex items-center gap-3">
                        <Slider val={selectedText.lineHeight} set={v => updateText(selectedText.id, { lineHeight: v })} min={1} max={3.5} step={0.05} />
                        <span className="text-[#D4A843] text-xs font-bold w-8 text-right">{selectedText.lineHeight.toFixed(1)}</span>
                      </div>
                    </Row>

                    {selectedText.kind === "custom" && (
                      <button onClick={() => removeLayer(selectedText.id)}
                        className="w-full py-2 text-red-400 border border-red-400/20 rounded-xl text-xs hover:bg-red-400/10 transition-all">
                        এই লেখা মুছে দিন
                      </button>
                    )}
                  </div>
                )}

                {selectedSticker && (
                  <div className="space-y-4">
                    <div className="text-center text-5xl">{selectedSticker.emoji}</div>
                    <Row label="আকার">
                      <div className="flex items-center gap-3">
                        <Slider val={selectedSticker.size} set={v => setStickers(prev => prev.map(s => s.id === selectedSticker.id ? { ...s, size: v } : s))} min={20} max={300} />
                        <span className="text-[#D4A843] text-xs font-bold w-12 text-right">{selectedSticker.size}px</span>
                      </div>
                    </Row>
                    <button onClick={() => removeLayer(selectedSticker.id)}
                      className="w-full py-2 text-red-400 border border-red-400/20 rounded-xl text-xs hover:bg-red-400/10 transition-all">
                      স্টিকার মুছে দিন
                    </button>
                  </div>
                )}

                {!selectedText && !selectedSticker && (
                  <p className="text-gray-600 text-sm text-center py-4">উপরে একটি লেখা বা স্টিকার নির্বাচন করুন</p>
                )}
              </div>
            )}

            {/* ── PHOTO PANEL ── */}
            {activeTool === "photo" && (
              <div className="p-4 space-y-5">
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={onPhotoUpload} />
                <input ref={bgFileRef} type="file" accept="image/*" className="hidden" onChange={onBgUpload} />

                <div>
                  <p className="text-[#D4A843] text-xs font-bold mb-2">মূল ছবি</p>
                  <button onClick={() => photoRef.current?.click()}
                    className="w-full py-6 border-2 border-dashed border-[#D4A843]/30 hover:border-[#D4A843] rounded-2xl text-center hover:bg-[#D4A843]/5 transition-all">
                    {photoImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={photoImage} className="w-16 h-16 object-cover rounded-xl mx-auto" style={{ filter: effectiveFilter }} />
                        <span className="text-[#D4A843] text-xs">ছবি পরিবর্তন করুন</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-3xl">📷</span>
                        <span className="text-gray-400 text-sm">ছবি আপলোড করুন</span>
                      </div>
                    )}
                  </button>

                  {photoImage && (
                    <>
                      <div className="mt-3">
                        <p className="text-gray-500 text-xs font-semibold mb-2">ফিল্টার</p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {FILTER_PRESETS.map(fp => (
                            <button key={fp.name} onClick={() => setFilterPreset(fp.name)}
                              className={`flex-shrink-0 flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all ${
                                filterPreset === fp.name
                                  ? "border-[#D4A843] bg-[#D4A843]/10"
                                  : "border-[#1e3050] hover:border-[#D4A843]/40"
                              }`}>
                              <div className="w-12 h-12 rounded-lg overflow-hidden">
                                <img src={photoImage} className="w-full h-full object-cover"
                                  style={{ filter: fp.filter === "none" ? undefined : fp.filter }} />
                              </div>
                              <span className={`text-[9px] ${filterPreset === fp.name ? "text-[#D4A843]" : "text-gray-500"}`}>{fp.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3">
                        <Row label="অপাসিটি">
                          <div className="flex items-center gap-3">
                            <Slider val={photoOpacity} set={setPhotoOpacity} min={0} max={100} />
                            <span className="text-[#D4A843] text-xs font-bold w-10 text-right">{photoOpacity}%</span>
                          </div>
                        </Row>
                      </div>
                      <button onClick={() => setPhotoImage(null)}
                        className="mt-2 w-full py-2 text-red-400 text-xs border border-red-400/20 rounded-xl hover:bg-red-400/10 transition-all">
                        ছবি সরিয়ে দিন
                      </button>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t border-[#1e3050]">
                  <p className="text-[#D4A843] text-xs font-bold mb-2">পটভূমি ছবি</p>
                  <button onClick={() => bgFileRef.current?.click()}
                    className="w-full py-3 border border-dashed border-[#1e3050] hover:border-[#D4A843]/50 rounded-xl text-gray-400 text-sm hover:bg-[#D4A843]/5 transition-all">
                    {bgImage ? "✅ পটভূমি পরিবর্তন করুন" : "🌅 পটভূমি ছবি আপলোড করুন"}
                  </button>
                  {bgImage && (
                    <>
                      <div className="mt-3">
                        <Row label="অপাসিটি">
                          <div className="flex items-center gap-3">
                            <Slider val={Math.round(bgOpacity * 100)} set={v => setBgOpacity(v / 100)} min={0} max={100} />
                            <span className="text-[#D4A843] text-xs font-bold w-10 text-right">{Math.round(bgOpacity * 100)}%</span>
                          </div>
                        </Row>
                      </div>
                      <button onClick={() => setBgImage(null)}
                        className="mt-2 w-full py-2 text-red-400 text-xs border border-red-400/20 rounded-xl hover:bg-red-400/10 transition-all">
                        পটভূমি সরিয়ে দিন
                      </button>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t border-[#1e3050]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showWatermark} onChange={e => setShowWatermark(e.target.checked)} className="w-4 h-4 accent-[#D4A843]" />
                    <span className="text-gray-300 text-sm">লেখকের ছবি ওয়াটারমার্ক</span>
                  </label>
                  {showWatermark && (
                    <div className="mt-2">
                      <Row label="অপাসিটি">
                        <div className="flex items-center gap-3">
                          <Slider val={watermarkOpacity} set={setWatermarkOpacity} min={1} max={40} />
                          <span className="text-[#D4A843] text-xs font-bold w-10 text-right">{watermarkOpacity}%</span>
                        </div>
                      </Row>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── DESIGN PANEL ── */}
            {activeTool === "design" && (
              <div className="p-4 space-y-5">
                <div>
                  <p className="text-[#D4A843] text-xs font-bold mb-2">থিম</p>
                  <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {THEMES.map((t, i) => (
                      <button key={t.name} onClick={() => setThemeIdx(i)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          themeIdx === i
                            ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                            : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                        }`}>
                        <div className="w-5 h-5 rounded-full border border-white/10 flex-shrink-0"
                          style={{ background: t.gradient || t.bg }} />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[#D4A843] text-xs font-bold mb-2">আকার</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {SIZES.map((s, i) => (
                      <button key={s.name} onClick={() => setSizeIdx(i)}
                        className={`px-2 py-2 rounded-xl border text-xs font-medium transition-all ${
                          sizeIdx === i
                            ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                            : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                        }`}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[#D4A843] text-xs font-bold mb-2">ফ্রেম</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {FRAMES.map(f => (
                      <button key={f.value} onClick={() => setFrame(f.value)}
                        className={`px-2 py-2 rounded-xl border text-xs font-medium transition-all ${
                          frame === f.value
                            ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                            : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                        }`}>
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STICKERS PANEL ── */}
            {activeTool === "stickers" && (
              <div className="p-4">
                <p className="text-[#D4A843] text-xs font-bold mb-3">স্টিকার যোগ করুন</p>
                <div className="grid grid-cols-8 gap-1.5">
                  {STICKER_LIST.map(emoji => (
                    <button key={emoji} onClick={() => addSticker(emoji)}
                      className="text-2xl p-1.5 rounded-xl hover:bg-[#D4A843]/10 transition-all text-center leading-none">
                      {emoji}
                    </button>
                  ))}
                </div>

                {stickers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#1e3050]">
                    <p className="text-gray-500 text-xs font-semibold mb-2">যোগ করা স্টিকার</p>
                    <div className="flex gap-2 flex-wrap">
                      {stickers.map(s => (
                        <div key={s.id} className="flex items-center gap-1 bg-[#060c18] border border-[#1e3050] rounded-xl px-2 py-1">
                          <span className="text-xl">{s.emoji}</span>
                          <button onClick={() => removeLayer(s.id)} className="text-red-400 text-xs ml-1">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
        </div>{/* end right column */}
        </div>{/* end desktop grid */}
      </div>
    </div>
  );
}
