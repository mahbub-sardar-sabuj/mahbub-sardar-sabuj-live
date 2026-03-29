/**
 * ডিজাইন ফরম্যাট — Premium Bengali Writing Card Designer
 * Features: Canvas-based PNG export (mobile-safe), 10 themes, 10 fonts,
 *           6 sizes, 6 decorations, text shadow, bold toggle, emoji stickers,
 *           custom colors, bg blur, quick templates, live preview, one-tap download.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

// ── Data ─────────────────────────────────────────────────────────────────────

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

const THEMES = [
  { name: "বইয়ের পাতা", bg: "#F5F0E8", text: "#1a1a1a", border: "#8B7355", gradient: false },
  { name: "ক্রিম সাদা", bg: "#FFFEF7", text: "#2d2d2d", border: "#C8B89A", gradient: false },
  { name: "রাতের আকাশ", bg: "#0d1b2a", text: "#E8D5A3", border: "#D4A843", gradient: false },
  { name: "গভীর রাত", bg: "#0a0a0a", text: "#FFFFFF", border: "#333333", gradient: false },
  { name: "সোনালি সন্ধ্যা", bg: "#2C1810", text: "#F5DEB3", border: "#D4A843", gradient: false },
  { name: "সবুজ প্রকৃতি", bg: "#0d1f0d", text: "#E8F5E8", border: "#4CAF50", gradient: false },
  { name: "গোলাপি স্বপ্ন", bg: "#FFF0F5", text: "#4A1942", border: "#E91E8C", gradient: false },
  { name: "নীল শান্তি", bg: "#EEF4FF", text: "#1A237E", border: "#3F51B5", gradient: false },
  { name: "বেগুনি রহস্য", bg: "#1a0a2e", text: "#E8D5FF", border: "#9C27B0", gradient: false },
  { name: "সূর্যাস্ত", bg: "#1a0533", text: "#FFFFFF", border: "#FFD700", gradient: true },
];

const SIZES = [
  { name: "বর্গ (1:1)", w: 1080, h: 1080, icon: "⬛" },
  { name: "পোর্ট্রেট (4:5)", w: 1080, h: 1350, icon: "📱" },
  { name: "স্টোরি (9:16)", w: 1080, h: 1920, icon: "📲" },
  { name: "আড়াআড়ি (16:9)", w: 1920, h: 1080, icon: "🖥️" },
  { name: "A4 পোর্ট্রেট", w: 794, h: 1123, icon: "📄" },
  { name: "কাস্টম", w: 0, h: 0, icon: "✏️" },
];

const DECORATIONS = [
  { name: "কোনো সজ্জা নেই", value: "none" },
  { name: "ভেতরের বর্ডার", value: "inner-border" },
  { name: "কোণের অলংকার", value: "corner" },
  { name: "উপর-নিচ লাইন", value: "top-bottom" },
  { name: "বাম পাশে বার", value: "left-bar" },
  { name: "ডবল বর্ডার", value: "double-border" },
];

const STICKERS = ["🌸", "🌙", "⭐", "✨", "🌿", "🦋", "🕊️", "🌹", "💫", "🔥", "🌊", "🎋", "🌺", "💎", "🪷", "🌟"];

const TEMPLATES = [
  { label: "প্রেমের কবিতা", t: "ভালোবাসা", b: "তুমি আমার হৃদয়ের গভীরে\nএক অনন্ত আলোর মতো জ্বলো।\nতোমার স্পর্শে জীবন হয়\nঅর্থবহ, সুন্দর ও কোমল।", a: "— মাহবুব সরদার সবুজ" },
  { label: "অনুপ্রেরণা", t: "জীবন", b: "প্রতিটি ভোরে নতুন সুযোগ আসে,\nসেই সুযোগকে কাজে লাগাও।\nব্যর্থতা থেকে শিক্ষা নাও,\nসাফল্যের পথে এগিয়ে যাও।", a: "— মাহবুব সরদার সবুজ" },
  { label: "প্রকৃতি", t: "প্রকৃতির ডাক", b: "সবুজ পাতার ফাঁকে ফাঁকে\nআলো নামে নীরবে।\nনদীর কলতানে মিশে যায়\nমনের সব কথা।", a: "— মাহবুব সরদার সবুজ" },
  { label: "বিদ্রোহ", t: "কলমের বিদ্রোহ", b: "কলমের স্পর্শে আমি বিদ্রোহী,\nন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি;\nকেউ কেউ ভালোবেসে ডাকে আমায় কবি।", a: "— মাহবুব সরদার সবুজ" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Main Component ────────────────────────────────────────────────────────────

export default function Editor() {
  // Content state
  const [title, setTitle] = useState("শিরোনাম");
  const [body, setBody] = useState("এখানে আপনার লেখা লিখুন...\n\nকবিতা, উক্তি বা মনের কথা।");
  const [author, setAuthor] = useState("— মাহবুব সরদার সবুজ");
  const [showTitle, setShowTitle] = useState(true);
  const [showAuthor, setShowAuthor] = useState(true);
  const [sticker, setSticker] = useState("");

  // Design state
  const [themeIdx, setThemeIdx] = useState(0);
  const [fontKey, setFontKey] = useState("ChandraSheela");
  const [sizeIdx, setSizeIdx] = useState(0);
  const [customW, setCustomW] = useState(800);
  const [customH, setCustomH] = useState(800);
  const [decoration, setDecoration] = useState("inner-border");

  // Custom colors
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [customBg, setCustomBg] = useState("#1a1a2e");
  const [customText, setCustomText] = useState("#ffffff");
  const [customBorder, setCustomBorder] = useState("#D4A843");

  // Typography state
  const [titleSize, setTitleSize] = useState(52);
  const [bodySize, setBodySize] = useState(36);
  const [authorSize, setAuthorSize] = useState(28);
  const [lineH, setLineH] = useState(1.9);
  const [align, setAlign] = useState<"left" | "center" | "right">("left");
  const [padding, setPadding] = useState(60);
  const [letterSp, setLetterSp] = useState(0.5);
  const [textShadow, setTextShadow] = useState(false);
  const [boldBody, setBoldBody] = useState(false);

  // Background state
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState(0.12);
  const [bgBlur, setBgBlur] = useState(false);

  // UI state
  const [tab, setTab] = useState<"content" | "design" | "typo" | "bg" | "extras">("content");
  const [downloading, setDownloading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  // Computed
  const theme = useCustomColors
    ? { bg: customBg, text: customText, border: customBorder, gradient: false }
    : THEMES[themeIdx];
  const cardW = SIZES[sizeIdx].name === "কাস্টম" ? customW : SIZES[sizeIdx].w;
  const cardH = SIZES[sizeIdx].name === "কাস্টম" ? customH : SIZES[sizeIdx].h;
  const fontCss = FONT_CSS[fontKey] || "'Tiro Bangla', serif";

  // Scale preview to container
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

  // ── Canvas-based PNG Download (works on mobile) ───────────────────────────
  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      await ensureFontLoaded(fontKey);
      await document.fonts.ready;

      const DPR = 2;
      const canvas = document.createElement("canvas");
      canvas.width = cardW * DPR;
      canvas.height = cardH * DPR;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(DPR, DPR);

      // Background
      if (theme.gradient) {
        const grad = ctx.createLinearGradient(0, 0, cardW, cardH);
        grad.addColorStop(0, "#1a0533");
        grad.addColorStop(0.5, "#2d1b69");
        grad.addColorStop(1, "#11998e");
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = theme.bg;
      }
      ctx.fillRect(0, 0, cardW, cardH);

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

      // Decoration
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 1.5;
      if (decoration === "inner-border") {
        ctx.save(); ctx.globalAlpha = 0.5;
        ctx.strokeRect(16, 16, cardW - 32, cardH - 32);
        ctx.restore();
      } else if (decoration === "corner") {
        const cs = 50;
        ctx.save(); ctx.globalAlpha = 0.7;
        [{ x: 16, y: 16, dx: 1, dy: 1 }, { x: cardW - 16, y: 16, dx: -1, dy: 1 },
          { x: 16, y: cardH - 16, dx: 1, dy: -1 }, { x: cardW - 16, y: cardH - 16, dx: -1, dy: -1 }
        ].forEach(({ x, y, dx, dy }) => {
          ctx.beginPath();
          ctx.moveTo(x + cs * dx, y); ctx.lineTo(x, y); ctx.lineTo(x, y + cs * dy);
          ctx.stroke();
        });
        ctx.restore();
      } else if (decoration === "top-bottom") {
        ctx.save(); ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.moveTo(padding, 24); ctx.lineTo(cardW - padding, 24); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(padding, cardH - 24); ctx.lineTo(cardW - padding, cardH - 24); ctx.stroke();
        ctx.restore();
      } else if (decoration === "left-bar") {
        ctx.save(); ctx.globalAlpha = 0.8; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(padding / 2, padding); ctx.lineTo(padding / 2, cardH - padding); ctx.stroke();
        ctx.restore();
      } else if (decoration === "double-border") {
        ctx.save();
        ctx.globalAlpha = 0.5; ctx.strokeRect(10, 10, cardW - 20, cardH - 20);
        ctx.globalAlpha = 0.3; ctx.strokeRect(22, 22, cardW - 44, cardH - 44);
        ctx.restore();
      }

      // Text setup
      const ff = `${fontKey}, 'Tiro Bangla', serif`;
      ctx.fillStyle = theme.text;
      const maxW = cardW - padding * 2;
      const tx = align === "center" ? cardW / 2 : align === "right" ? cardW - padding : padding;
      ctx.textAlign = align;
      if (textShadow) {
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }

      // Measure total height for vertical centering
      let totalH = 0;
      if (sticker) totalH += 80;
      if (showTitle && title) {
        ctx.font = `bold ${titleSize}px ${ff}`;
        totalH += wrapText(ctx, title, maxW).length * titleSize * 1.3 + 40;
      }
      ctx.font = `${boldBody ? "bold " : ""}${bodySize}px ${ff}`;
      const bLines = wrapText(ctx, body, maxW);
      bLines.forEach(l => { totalH += l === "" ? bodySize * 0.6 : bodySize * lineH; });
      if (showAuthor && author) totalH += authorSize + 40;

      let cy = Math.max(padding, (cardH - totalH) / 2);

      // Sticker
      if (sticker) {
        ctx.font = "60px serif";
        ctx.textAlign = "center";
        ctx.fillText(sticker, cardW / 2, cy + 60);
        ctx.textAlign = align;
        cy += 80;
      }

      // Title
      if (showTitle && title) {
        ctx.font = `bold ${titleSize}px ${ff}`;
        const tLines = wrapText(ctx, title, maxW);
        for (const line of tLines) {
          ctx.fillText(line, tx, cy + titleSize);
          cy += titleSize * 1.3;
        }
        ctx.save(); ctx.globalAlpha = 0.35;
        ctx.beginPath(); ctx.moveTo(padding, cy + 10); ctx.lineTo(cardW - padding, cy + 10); ctx.stroke();
        ctx.restore();
        cy += 30;
      }

      // Body
      ctx.font = `${boldBody ? "bold " : ""}${bodySize}px ${ff}`;
      for (const line of bLines) {
        if (line === "") { cy += bodySize * 0.6; continue; }
        ctx.fillText(line, tx, cy + bodySize);
        cy += bodySize * lineH;
      }

      // Author
      if (showAuthor && author) {
        cy += 16;
        ctx.save(); ctx.globalAlpha = 0.35;
        ctx.beginPath(); ctx.moveTo(padding, cy); ctx.lineTo(cardW - padding, cy); ctx.stroke();
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.75;
        ctx.font = `italic ${authorSize}px ${ff}`;
        ctx.fillText(author, tx, cy + authorSize + 10);
        ctx.restore();
      }

      // Trigger download
      const a = document.createElement("a");
      a.download = `${title || "ডিজাইন"}.png`;
      a.href = canvas.toDataURL("image/png");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      alert("ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
    setDownloading(false);
  }, [theme, fontKey, cardW, cardH, title, body, author, showTitle, showAuthor,
    titleSize, bodySize, authorSize, lineH, align, padding, letterSp, decoration,
    bgImage, bgOpacity, bgBlur, textShadow, boldBody, sticker]);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setBgImage(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  // ── Reusable sub-components ───────────────────────────────────────────────
  const TabBtn = ({ id, label, emoji }: { id: typeof tab; label: string; emoji: string }) => (
    <button onClick={() => setTab(id)}
      className={`flex flex-col items-center gap-0.5 px-1.5 py-2 rounded-xl text-xs font-semibold transition-all flex-1 ${
        tab === id ? "bg-[#D4A843] text-black" : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}>
      <span className="text-base leading-none">{emoji}</span>
      <span>{label}</span>
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

  const textShadowStyle = textShadow ? { textShadow: "2px 2px 8px rgba(0,0,0,0.5)" } : {};

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060c18]">
      <Seo title="ডিজাইন ফরম্যাট | মাহবুব সরদার সবুজ"
        description="বাংলা লেখার কার্ড ডিজাইন করুন ও PNG ডাউনলোড করুন" />
      <Navbar />

      <div className="pt-20 pb-12 px-3 md:px-5">
        <div className="max-w-[1440px] mx-auto">

          {/* ── Page Header ── */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 border border-[#D4A843]/25 rounded-full px-5 py-1.5 mb-3">
              <span className="text-[#D4A843] text-xs font-bold tracking-widest uppercase">✦ ডিজাইন ফরম্যাট ✦</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              আপনার লেখা <span className="text-[#D4A843]">সুন্দরভাবে</span> সাজান
            </h1>
            <p className="text-gray-400 text-sm md:text-base">ফন্ট · থিম · সাইজ · সজ্জা বেছে নিন — এক ক্লিকে PNG ডাউনলোড করুন</p>
          </div>

          <div className="flex flex-col xl:flex-row gap-4">

            {/* ══════════════ LEFT PANEL ══════════════ */}
            <div className="xl:w-[400px] flex-shrink-0 flex flex-col gap-3">

              {/* Tab Bar */}
              <div className="bg-[#0f1c2e] rounded-2xl p-1.5 border border-[#1e3050] flex gap-1">
                <TabBtn id="content" label="লেখা" emoji="✏️" />
                <TabBtn id="design" label="ডিজাইন" emoji="🎨" />
                <TabBtn id="typo" label="টাইপো" emoji="🔤" />
                <TabBtn id="bg" label="পটভূমি" emoji="🖼️" />
                <TabBtn id="extras" label="এক্সট্রা" emoji="✨" />
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
                    <span className="text-gray-300 text-sm font-medium">লেখকের নাম দেখাও</span>
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

                  {/* Theme */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">রঙের থিম</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {THEMES.map((t, i) => (
                        <button key={t.name} onClick={() => { setThemeIdx(i); setUseCustomColors(false); }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                            !useCustomColors && themeIdx === i
                              ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                              : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                          }`}>
                          <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
                            style={{ background: t.gradient ? "linear-gradient(135deg,#1a0533,#11998e)" : t.bg }} />
                          <span className="truncate">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input type="checkbox" checked={useCustomColors} onChange={e => setUseCustomColors(e.target.checked)} className="w-4 h-4 accent-[#D4A843]" />
                      <span className="text-gray-300 text-sm font-medium">কাস্টম রঙ ব্যবহার করুন</span>
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

                  {/* Font */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">ফন্ট</label>
                    <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                      {FONTS.map(f => (
                        <button key={f.value} onClick={() => setFontKey(f.value)}
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
                        <div>
                          <label className="text-gray-500 text-xs mb-1 block">প্রস্থ (px)</label>
                          <input type="number" value={customW} onChange={e => setCustomW(+e.target.value)}
                            className="w-full bg-[#0a1525] text-white border border-[#1e3050] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843]" />
                        </div>
                        <div>
                          <label className="text-gray-500 text-xs mb-1 block">উচ্চতা (px)</label>
                          <input type="number" value={customH} onChange={e => setCustomH(+e.target.value)}
                            className="w-full bg-[#0a1525] text-white border border-[#1e3050] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Decoration */}
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">সজ্জা</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {DECORATIONS.map(d => (
                        <button key={d.value} onClick={() => setDecoration(d.value)}
                          className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                            decoration === d.value
                              ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                              : "border-[#1e3050] text-gray-400 hover:border-[#D4A843]/40"
                          }`}>
                          {d.name}
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
                  <Slider label="শিরোনামের আকার" val={titleSize} set={setTitleSize} min={24} max={120} />
                  <Slider label="লেখার আকার" val={bodySize} set={setBodySize} min={16} max={80} />
                  <Slider label="লেখকের নামের আকার" val={authorSize} set={setAuthorSize} min={14} max={60} />
                  <Slider label="লাইনের উচ্চতা" val={lineH} set={setLineH} min={1.2} max={3.0} step={0.1} unit="x" />
                  <Slider label="প্যাডিং" val={padding} set={setPadding} min={20} max={150} />
                  <Slider label="অক্ষর ব্যবধান" val={letterSp} set={setLetterSp} min={-1} max={5} step={0.1} />

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

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={textShadow} onChange={e => setTextShadow(e.target.checked)} className="w-4 h-4 accent-[#D4A843]" />
                      <span className="text-gray-300 text-sm">টেক্সট শ্যাডো</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={boldBody} onChange={e => setBoldBody(e.target.checked)} className="w-4 h-4 accent-[#D4A843]" />
                      <span className="text-gray-300 text-sm">বোল্ড লেখা</span>
                    </label>
                  </div>
                </div>
              )}

              {/* ── Background Tab ── */}
              {tab === "bg" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-4">
                  <h3 className="text-[#D4A843] text-xs font-bold uppercase tracking-widest">পটভূমির ছবি</h3>
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full py-4 bg-[#0a1525] hover:bg-[#0f1c2e] text-gray-300 rounded-2xl border-2 border-dashed border-[#1e3050] hover:border-[#D4A843] transition-all text-sm">
                    {bgImage ? "✓ ছবি নির্বাচিত — পরিবর্তন করুন" : "📁 পটভূমির ছবি আপলোড করুন"}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
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
                </div>
              )}

              {/* ── Extras Tab ── */}
              {tab === "extras" && (
                <div className="bg-[#0f1c2e] rounded-2xl p-4 border border-[#1e3050] space-y-4">
                  <h3 className="text-[#D4A843] text-xs font-bold uppercase tracking-widest">অতিরিক্ত সজ্জা</h3>

                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">ইমোজি স্টিকার (উপরে)</label>
                    <div className="grid grid-cols-9 gap-1">
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

              {/* ── Download Button ── */}
              <button onClick={handleDownload} disabled={downloading}
                className="w-full py-4 bg-gradient-to-r from-[#D4A843] via-[#e8c060] to-[#c49030] hover:from-[#c49030] hover:to-[#b07820] text-black font-bold rounded-2xl text-base transition-all disabled:opacity-50 shadow-2xl shadow-[#D4A843]/20 flex items-center justify-center gap-3">
                {downloading ? (
                  <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> ডাউনলোড হচ্ছে...</>
                ) : (
                  <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> PNG ডাউনলোড করুন</>
                )}
              </button>
              <p className="text-gray-600 text-xs text-center">আসল আকার: {cardW} × {cardH} px · 2x রেজোলিউশন</p>
            </div>

            {/* ══════════════ RIGHT PANEL: Live Preview ══════════════ */}
            <div className="flex-1 flex flex-col items-center" ref={previewRef}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D4A843]/30" />
                <span className="text-[#D4A843]/60 text-xs uppercase tracking-widest font-semibold">লাইভ প্রিভিউ</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D4A843]/30" />
              </div>

              {/* Preview wrapper */}
              <div style={{
                width: cardW * scale,
                height: cardH * scale,
                position: "relative",
                flexShrink: 0,
                boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,168,67,0.12)",
                borderRadius: 8,
                overflow: "hidden",
              }}>
                {/* Actual card at full size, scaled down via transform */}
                <div style={{
                  width: cardW, height: cardH,
                  background: theme.gradient
                    ? "linear-gradient(135deg,#1a0533 0%,#2d1b69 50%,#11998e 100%)"
                    : theme.bg,
                  color: theme.text,
                  fontFamily: fontCss,
                  padding,
                  position: "absolute", top: 0, left: 0,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  overflow: "hidden",
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  boxSizing: "border-box",
                  textAlign: align,
                  letterSpacing: `${letterSp}px`,
                }}>
                  {/* Background image */}
                  {bgImage && (
                    <div style={{
                      position: "absolute", inset: 0,
                      backgroundImage: `url(${bgImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      opacity: bgOpacity,
                      filter: bgBlur ? "blur(8px)" : "none",
                      zIndex: 0,
                    }} />
                  )}

                  {/* Decorations */}
                  {decoration === "inner-border" && (
                    <div style={{ position: "absolute", inset: 16, border: `1.5px solid ${theme.border}`, opacity: 0.5, zIndex: 1, pointerEvents: "none" }} />
                  )}
                  {decoration === "corner" && (
                    <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
                      {[
                        { top: 16, left: 16, borderTop: `1.5px solid ${theme.border}`, borderLeft: `1.5px solid ${theme.border}` },
                        { top: 16, right: 16, borderTop: `1.5px solid ${theme.border}`, borderRight: `1.5px solid ${theme.border}` },
                        { bottom: 16, left: 16, borderBottom: `1.5px solid ${theme.border}`, borderLeft: `1.5px solid ${theme.border}` },
                        { bottom: 16, right: 16, borderBottom: `1.5px solid ${theme.border}`, borderRight: `1.5px solid ${theme.border}` },
                      ].map((s, i) => <div key={i} style={{ position: "absolute", width: 50, height: 50, opacity: 0.7, ...s }} />)}
                    </div>
                  )}
                  {decoration === "top-bottom" && (
                    <>
                      <div style={{ position: "absolute", top: 24, left: padding, right: padding, height: 1, backgroundColor: theme.border, opacity: 0.6, zIndex: 1 }} />
                      <div style={{ position: "absolute", bottom: 24, left: padding, right: padding, height: 1, backgroundColor: theme.border, opacity: 0.6, zIndex: 1 }} />
                    </>
                  )}
                  {decoration === "left-bar" && (
                    <div style={{ position: "absolute", top: padding, bottom: padding, left: padding / 2 - 2, width: 5, backgroundColor: theme.border, opacity: 0.8, zIndex: 1, borderRadius: 3 }} />
                  )}
                  {decoration === "double-border" && (
                    <>
                      <div style={{ position: "absolute", inset: 10, border: `1.5px solid ${theme.border}`, opacity: 0.5, zIndex: 1, pointerEvents: "none" }} />
                      <div style={{ position: "absolute", inset: 22, border: `1.5px solid ${theme.border}`, opacity: 0.3, zIndex: 1, pointerEvents: "none" }} />
                    </>
                  )}

                  {/* Content */}
                  <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    {sticker && <div style={{ fontSize: 60, marginBottom: 16, textAlign: "center" }}>{sticker}</div>}
                    {showTitle && title && (
                      <div style={{
                        fontSize: titleSize, fontWeight: "bold", marginBottom: 24,
                        lineHeight: 1.3, borderBottom: `1px solid ${theme.border}`,
                        paddingBottom: 16, letterSpacing: `${letterSp}px`,
                        ...textShadowStyle,
                      }}>
                        {title}
                      </div>
                    )}
                    <div style={{
                      fontSize: bodySize, lineHeight: lineH, whiteSpace: "pre-wrap",
                      letterSpacing: `${letterSp}px`, fontWeight: boldBody ? "bold" : "normal",
                      ...textShadowStyle,
                    }}>
                      {body}
                    </div>
                    {showAuthor && author && (
                      <div style={{
                        fontSize: authorSize, marginTop: 28, opacity: 0.75,
                        fontStyle: "italic", borderTop: `1px solid ${theme.border}`,
                        paddingTop: 12, letterSpacing: `${letterSp}px`,
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

              {/* Quick theme color dots below preview */}
              <div className="flex gap-2 mt-4 flex-wrap justify-center">
                {THEMES.map((t, i) => (
                  <button key={t.name} onClick={() => { setThemeIdx(i); setUseCustomColors(false); }}
                    title={t.name}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      !useCustomColors && themeIdx === i ? "border-[#D4A843] scale-125" : "border-transparent hover:border-[#D4A843]/50"
                    }`}
                    style={{ background: t.gradient ? "linear-gradient(135deg,#1a0533,#11998e)" : t.bg }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
