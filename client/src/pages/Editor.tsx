import { useState, useRef, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

// ── Font declarations (loaded via @font-face in index.html) ──────────────────
const FONTS = [
  { name: "চন্দ্রশীলা", value: "ChandraSheela" },
  { name: "চন্দ্রশীলা প্রিমিয়াম", value: "ChandraSheelaPremium" },
  { name: "মাহবুব সরদার সবুজ ফন্ট", value: "MahbubSardarSabujFont" },
  { name: "মাসুদ নান্দনিক", value: "MasudNandanik" },
  { name: "আদর্শ লিপি", value: "AdorshoLipi" },
  { name: "BH Sabit Adorsho", value: "BHSabitAdorshoLightUnicode" },
  { name: "BLAB Norha Gram", value: "BLABNorhaGramUnicode" },
  { name: "Akhand Bengali", value: "AkhandBengali" },
  { name: "Tiro Bangla", value: "'Tiro Bangla', serif" },
  { name: "Noto Sans Bengali", value: "'Noto Sans Bengali', sans-serif" },
];

const THEMES = [
  { name: "বইয়ের পাতা", bg: "#F5F0E8", text: "#1a1a1a", border: "#8B7355", accent: "#5C4A2A" },
  { name: "ক্রিম সাদা", bg: "#FFFEF7", text: "#2d2d2d", border: "#C8B89A", accent: "#8B7355" },
  { name: "রাতের আকাশ", bg: "#0d1b2a", text: "#E8D5A3", border: "#D4A843", accent: "#D4A843" },
  { name: "গভীর রাত", bg: "#111111", text: "#FFFFFF", border: "#444444", accent: "#D4A843" },
  { name: "সোনালি সন্ধ্যা", bg: "#2C1810", text: "#F5DEB3", border: "#D4A843", accent: "#FFD700" },
  { name: "সবুজ প্রকৃতি", bg: "#1a2e1a", text: "#E8F5E8", border: "#4CAF50", accent: "#81C784" },
  { name: "গোলাপি স্বপ্ন", bg: "#FFF0F5", text: "#4A1942", border: "#E91E8C", accent: "#C2185B" },
  { name: "নীল শান্তি", bg: "#EEF4FF", text: "#1A237E", border: "#3F51B5", accent: "#1565C0" },
  { name: "ধূসর মেঘ", bg: "#2D2D2D", text: "#E0E0E0", border: "#757575", accent: "#BDBDBD" },
  { name: "লাল আবেগ", bg: "#FFF5F5", text: "#3B0000", border: "#C62828", accent: "#B71C1C" },
];

const SIZES = [
  { name: "বর্গাকার (1:1)", width: 1080, height: 1080 },
  { name: "পোর্ট্রেট (4:5)", width: 1080, height: 1350 },
  { name: "স্টোরি (9:16)", width: 1080, height: 1920 },
  { name: "আড়াআড়ি (16:9)", width: 1920, height: 1080 },
  { name: "A4 পোর্ট্রেট", width: 794, height: 1123 },
  { name: "কাস্টম", width: 0, height: 0 },
];

const DECORATIONS = [
  { name: "কোনো সজ্জা নেই", value: "none" },
  { name: "ভেতরের বর্ডার", value: "inner-border" },
  { name: "কোণের অলংকার", value: "corner" },
  { name: "উপর-নিচ লাইন", value: "top-bottom" },
  { name: "বাম পাশে বার", value: "left-bar" },
  { name: "ডবল বর্ডার", value: "double-border" },
];

// Wrap text for canvas
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split("\n");
  for (const para of paragraphs) {
    if (para.trim() === "") { lines.push(""); continue; }
    let line = "";
    for (const char of para) {
      const test = line + char;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = char;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

// Load font into canvas context
async function loadFontForCanvas(fontFamily: string, fontUrl: string): Promise<void> {
  try {
    const font = new FontFace(fontFamily, `url(${fontUrl})`);
    await font.load();
    (document.fonts as any).add(font);
  } catch {
    // ignore
  }
}

const FONT_URLS: Record<string, string> = {
  "ChandraSheela": "/fonts/চন্দ্রশীলা.ttf",
  "ChandraSheelaPremium": "/fonts/চন্দ্রশীলাপ্রিমিয়াম.ttf",
  "MahbubSardarSabujFont": "/fonts/মাহবুবসরদারসবুজফন্ট.ttf",
  "MasudNandanik": "/fonts/মাসুদনান্দনিক.ttf",
  "AdorshoLipi": "/fonts/AdorshoLipi.ttf",
  "BHSabitAdorshoLightUnicode": "/fonts/BHSabitAdorshoLightUnicode.ttf",
  "BLABNorhaGramUnicode": "/fonts/BLABNorhaGramUnicode.ttf",
  "AkhandBengali": "/fonts/AkhandBengali.ttf",
};

export default function Editor() {
  const [title, setTitle] = useState("শিরোনাম");
  const [body, setBody] = useState("এখানে আপনার লেখা লিখুন...\n\nআপনার মনের কথা, কবিতা বা গল্প।");
  const [author, setAuthor] = useState("— মাহবুব সরদার সবুজ");
  const [showTitle, setShowTitle] = useState(true);
  const [showAuthor, setShowAuthor] = useState(true);

  const [selectedFont, setSelectedFont] = useState(FONTS[0].value);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [customWidth, setCustomWidth] = useState(800);
  const [customHeight, setCustomHeight] = useState(800);
  const [decoration, setDecoration] = useState("inner-border");

  const [titleSize, setTitleSize] = useState(52);
  const [bodySize, setBodySize] = useState(36);
  const [authorSize, setAuthorSize] = useState(28);
  const [lineHeight, setLineHeight] = useState(1.9);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [padding, setPadding] = useState(60);
  const [letterSpacing, setLetterSpacing] = useState(0.5);

  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState(0.12);

  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "design" | "typography" | "background">("content");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const cardWidth = selectedSize.name === "কাস্টম" ? customWidth : selectedSize.width;
  const cardHeight = selectedSize.name === "কাস্টম" ? customHeight : selectedSize.height;

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerW = previewContainerRef.current.clientWidth - 32;
        const containerH = window.innerHeight * 0.6;
        const scaleX = containerW / cardWidth;
        const scaleY = containerH / cardHeight;
        setPreviewScale(Math.min(scaleX, scaleY, 1));
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [cardWidth, cardHeight]);

  // ── Canvas-based download (works on all devices) ─────────────────────────────
  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      // Ensure font is loaded for canvas
      const fontFamily = selectedFont.replace(/'/g, "").split(",")[0].trim();
      if (FONT_URLS[fontFamily]) {
        await loadFontForCanvas(fontFamily, FONT_URLS[fontFamily]);
      }
      await document.fonts.ready;

      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = cardWidth * scale;
      canvas.height = cardHeight * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(scale, scale);

      // Background
      ctx.fillStyle = selectedTheme.bg;
      ctx.fillRect(0, 0, cardWidth, cardHeight);

      // Background image
      if (bgImage) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            ctx.save();
            ctx.globalAlpha = bgOpacity;
            ctx.drawImage(img, 0, 0, cardWidth, cardHeight);
            ctx.restore();
            resolve();
          };
          img.onerror = () => resolve();
          img.src = bgImage;
        });
      }

      // Decoration
      ctx.strokeStyle = selectedTheme.border;
      ctx.lineWidth = 1.5;
      if (decoration === "inner-border") {
        ctx.save(); ctx.globalAlpha = 0.5;
        ctx.strokeRect(16, 16, cardWidth - 32, cardHeight - 32);
        ctx.restore();
      } else if (decoration === "corner") {
        const cs = 40;
        ctx.save(); ctx.globalAlpha = 0.7;
        [[16, 16, 1, 0, 0, 1], [cardWidth - 16, 16, -1, 0, 0, 1],
          [16, cardHeight - 16, 1, 0, 0, -1], [cardWidth - 16, cardHeight - 16, -1, 0, 0, -1]
        ].forEach(([x, y, dx, , , dy]) => {
          ctx.beginPath();
          ctx.moveTo(x as number, (y as number) + cs * (dy as number));
          ctx.lineTo(x as number, y as number);
          ctx.lineTo((x as number) + cs * (dx as number), y as number);
          ctx.stroke();
        });
        ctx.restore();
      } else if (decoration === "top-bottom") {
        ctx.save(); ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.moveTo(padding, 24); ctx.lineTo(cardWidth - padding, 24); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(padding, cardHeight - 24); ctx.lineTo(cardWidth - padding, cardHeight - 24); ctx.stroke();
        ctx.restore();
      } else if (decoration === "left-bar") {
        ctx.save(); ctx.globalAlpha = 0.8; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(padding / 2, padding); ctx.lineTo(padding / 2, cardHeight - padding); ctx.stroke();
        ctx.restore();
      } else if (decoration === "double-border") {
        ctx.save(); ctx.globalAlpha = 0.5;
        ctx.strokeRect(10, 10, cardWidth - 20, cardHeight - 20);
        ctx.globalAlpha = 0.3;
        ctx.strokeRect(20, 20, cardWidth - 40, cardHeight - 40);
        ctx.restore();
      }

      // Font
      const ff = `'${fontFamily}', 'Tiro Bangla', serif`;
      ctx.fillStyle = selectedTheme.text;
      const maxW = cardWidth - padding * 2;
      const textX = textAlign === "center" ? cardWidth / 2 : textAlign === "right" ? cardWidth - padding : padding;
      ctx.textAlign = textAlign;

      // Calculate total content height for vertical centering
      let totalH = 0;
      if (showTitle && title) {
        ctx.font = `bold ${titleSize}px ${ff}`;
        const tLines = wrapText(ctx, title, maxW);
        totalH += tLines.length * titleSize * 1.3 + 40;
      }
      ctx.font = `${bodySize}px ${ff}`;
      const bLines = wrapText(ctx, body, maxW);
      bLines.forEach(l => { totalH += l === "" ? bodySize * 0.6 : bodySize * lineHeight; });
      if (showAuthor && author) totalH += authorSize + 40;

      let currentY = Math.max(padding, (cardHeight - totalH) / 2);

      // Title
      if (showTitle && title) {
        ctx.font = `bold ${titleSize}px ${ff}`;
        const tLines = wrapText(ctx, title, maxW);
        for (const line of tLines) {
          ctx.fillText(line, textX, currentY + titleSize);
          currentY += titleSize * 1.3;
        }
        ctx.save(); ctx.globalAlpha = 0.4;
        ctx.beginPath(); ctx.moveTo(padding, currentY + 10); ctx.lineTo(cardWidth - padding, currentY + 10); ctx.stroke();
        ctx.restore();
        currentY += 30;
      }

      // Body
      ctx.font = `${bodySize}px ${ff}`;
      for (const line of bLines) {
        if (line === "") {
          currentY += bodySize * 0.6;
        } else {
          ctx.fillText(line, textX, currentY + bodySize);
          currentY += bodySize * lineHeight;
        }
      }

      // Author
      if (showAuthor && author) {
        currentY += 16;
        ctx.save(); ctx.globalAlpha = 0.4;
        ctx.beginPath(); ctx.moveTo(padding, currentY); ctx.lineTo(cardWidth - padding, currentY); ctx.stroke();
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.75;
        ctx.font = `italic ${authorSize}px ${ff}`;
        ctx.fillText(author, textX, currentY + authorSize + 8);
        ctx.restore();
      }

      // Download
      const link = document.createElement("a");
      link.download = `${title || "লেখা"}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Download error:", e);
      alert("ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
    setDownloading(false);
  }, [selectedTheme, selectedFont, cardWidth, cardHeight, title, body, author, showTitle, showAuthor,
    titleSize, bodySize, authorSize, lineHeight, textAlign, padding, letterSpacing, decoration, bgImage, bgOpacity]);

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBgImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const tabBtnClass = (tab: string) =>
    `px-3 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === tab ? "bg-[#D4A843] text-black" : "text-gray-400 hover:text-white hover:bg-[#1e2d3d]"}`;

  const sliderClass = "w-full accent-[#D4A843] h-2 rounded-full";

  return (
    <div className="min-h-screen bg-[#070d1a]">
      <Seo title="লেখা ডিজাইন ফরম্যাট | মাহবুব সরদার সবুজ" description="নিজের লেখা সুন্দরভাবে সাজান ও ডাউনলোড করুন" />
      <Navbar />

      <div className="pt-20 pb-10 px-3 md:px-6">
        <div className="max-w-[1400px] mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 border border-[#D4A843]/30 rounded-full px-4 py-1 mb-3">
              <span className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase">লেখা ডিজাইন ফরম্যাট</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              আপনার লেখা <span className="text-[#D4A843]">সুন্দরভাবে</span> সাজান
            </h1>
            <p className="text-gray-400 text-sm">ফন্ট, থিম, সাইজ বেছে নিন — PNG ডাউনলোড করুন</p>
          </div>

          <div className="flex flex-col xl:flex-row gap-5">

            {/* ===== LEFT PANEL ===== */}
            <div className="xl:w-[420px] flex-shrink-0 space-y-3">

              {/* Tab Navigation */}
              <div className="bg-[#111827] rounded-2xl p-2 border border-[#2a3a4a] flex gap-1">
                <button className={tabBtnClass("content")} onClick={() => setActiveTab("content")}>✏️ লেখা</button>
                <button className={tabBtnClass("design")} onClick={() => setActiveTab("design")}>🎨 ডিজাইন</button>
                <button className={tabBtnClass("typography")} onClick={() => setActiveTab("typography")}>🔤 টাইপো</button>
                <button className={tabBtnClass("background")} onClick={() => setActiveTab("background")}>🖼️ পটভূমি</button>
              </div>

              {/* ── Content Tab ── */}
              {activeTab === "content" && (
                <div className="bg-[#111827] rounded-2xl p-5 border border-[#2a3a4a] space-y-4">
                  <h3 className="text-[#D4A843] font-bold text-xs uppercase tracking-widest">লেখার বিষয়বস্তু</h3>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input type="checkbox" id="showTitle" checked={showTitle} onChange={e => setShowTitle(e.target.checked)} className="accent-[#D4A843] w-4 h-4" />
                      <label htmlFor="showTitle" className="text-gray-300 text-sm font-medium">শিরোনাম দেখাও</label>
                    </div>
                    {showTitle && (
                      <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="শিরোনাম লিখুন..."
                        className="w-full bg-[#1e2d3d] text-white border border-[#2a3a4a] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4A843] transition-colors" />
                    )}
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm font-medium block mb-2">মূল লেখা</label>
                    <textarea value={body} onChange={e => setBody(e.target.value)}
                      rows={8} placeholder="আপনার লেখা এখানে..."
                      className="w-full bg-[#1e2d3d] text-white border border-[#2a3a4a] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4A843] resize-y transition-colors leading-relaxed" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input type="checkbox" id="showAuthor" checked={showAuthor} onChange={e => setShowAuthor(e.target.checked)} className="accent-[#D4A843] w-4 h-4" />
                      <label htmlFor="showAuthor" className="text-gray-300 text-sm font-medium">লেখকের নাম দেখাও</label>
                    </div>
                    {showAuthor && (
                      <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
                        placeholder="লেখকের নাম..."
                        className="w-full bg-[#1e2d3d] text-white border border-[#2a3a4a] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4A843] transition-colors" />
                    )}
                  </div>
                </div>
              )}

              {/* ── Design Tab ── */}
              {activeTab === "design" && (
                <div className="bg-[#111827] rounded-2xl p-5 border border-[#2a3a4a] space-y-5">
                  <h3 className="text-[#D4A843] font-bold text-xs uppercase tracking-widest">ডিজাইন</h3>

                  {/* Theme */}
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block font-semibold">রঙের থিম</label>
                    <div className="grid grid-cols-2 gap-2">
                      {THEMES.map(t => (
                        <button key={t.name} onClick={() => setSelectedTheme(t)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${selectedTheme.name === t.name ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]" : "border-[#2a3a4a] text-gray-400 hover:border-[#D4A843]/50"}`}>
                          <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" style={{ background: t.bg }} />
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font */}
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block font-semibold">ফন্ট</label>
                    <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
                      {FONTS.map(f => (
                        <button key={f.value} onClick={() => setSelectedFont(f.value)}
                          className={`text-left px-3 py-2 rounded-xl border text-sm transition-all ${selectedFont === f.value ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]" : "border-[#2a3a4a] text-gray-400 hover:border-[#D4A843]/50"}`}
                          style={{ fontFamily: `${f.value}, serif` }}>
                          {f.name} — বাংলা লেখা
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block font-semibold">কার্ডের আকার</label>
                    <div className="grid grid-cols-2 gap-2">
                      {SIZES.map(s => (
                        <button key={s.name} onClick={() => setSelectedSize(s)}
                          className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${selectedSize.name === s.name ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]" : "border-[#2a3a4a] text-gray-400 hover:border-[#D4A843]/50"}`}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                    {selectedSize.name === "কাস্টম" && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="text-gray-500 text-xs mb-1 block">প্রস্থ (px)</label>
                          <input type="number" value={customWidth} onChange={e => setCustomWidth(+e.target.value)}
                            className="w-full bg-[#1e2d3d] text-white border border-[#2a3a4a] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843]" />
                        </div>
                        <div>
                          <label className="text-gray-500 text-xs mb-1 block">উচ্চতা (px)</label>
                          <input type="number" value={customHeight} onChange={e => setCustomHeight(+e.target.value)}
                            className="w-full bg-[#1e2d3d] text-white border border-[#2a3a4a] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Decoration */}
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block font-semibold">সজ্জা</label>
                    <div className="grid grid-cols-2 gap-2">
                      {DECORATIONS.map(d => (
                        <button key={d.value} onClick={() => setDecoration(d.value)}
                          className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${decoration === d.value ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]" : "border-[#2a3a4a] text-gray-400 hover:border-[#D4A843]/50"}`}>
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Typography Tab ── */}
              {activeTab === "typography" && (
                <div className="bg-[#111827] rounded-2xl p-5 border border-[#2a3a4a] space-y-5">
                  <h3 className="text-[#D4A843] font-bold text-xs uppercase tracking-widest">টাইপোগ্রাফি</h3>

                  {[
                    { label: "শিরোনামের আকার", value: titleSize, setter: setTitleSize, min: 24, max: 120 },
                    { label: "লেখার আকার", value: bodySize, setter: setBodySize, min: 16, max: 80 },
                    { label: "লেখকের নামের আকার", value: authorSize, setter: setAuthorSize, min: 14, max: 60 },
                  ].map(({ label, value, setter, min, max }) => (
                    <div key={label}>
                      <div className="flex justify-between mb-2">
                        <label className="text-gray-400 text-xs font-semibold">{label}</label>
                        <span className="text-[#D4A843] text-xs font-bold">{value}px</span>
                      </div>
                      <input type="range" min={min} max={max} value={value} onChange={e => setter(+e.target.value)} className={sliderClass} />
                    </div>
                  ))}

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-gray-400 text-xs font-semibold">লাইনের উচ্চতা</label>
                      <span className="text-[#D4A843] text-xs font-bold">{lineHeight}</span>
                    </div>
                    <input type="range" min={1.2} max={3} step={0.1} value={lineHeight} onChange={e => setLineHeight(+e.target.value)} className={sliderClass} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-gray-400 text-xs font-semibold">প্যাডিং</label>
                      <span className="text-[#D4A843] text-xs font-bold">{padding}px</span>
                    </div>
                    <input type="range" min={20} max={150} value={padding} onChange={e => setPadding(+e.target.value)} className={sliderClass} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-gray-400 text-xs font-semibold">অক্ষর ব্যবধান</label>
                      <span className="text-[#D4A843] text-xs font-bold">{letterSpacing}px</span>
                    </div>
                    <input type="range" min={-1} max={5} step={0.1} value={letterSpacing} onChange={e => setLetterSpacing(+e.target.value)} className={sliderClass} />
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs mb-2 block font-semibold">টেক্সট সারবদ্ধতা</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["left", "center", "right"] as const).map(a => (
                        <button key={a} onClick={() => setTextAlign(a)}
                          className={`py-2 rounded-xl border text-xs font-medium transition-all ${textAlign === a ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]" : "border-[#2a3a4a] text-gray-400 hover:border-[#D4A843]/50"}`}>
                          {a === "left" ? "বাম" : a === "center" ? "মাঝ" : "ডান"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Background Tab ── */}
              {activeTab === "background" && (
                <div className="bg-[#111827] rounded-2xl p-5 border border-[#2a3a4a] space-y-4">
                  <h3 className="text-[#D4A843] font-bold text-xs uppercase tracking-widest">পটভূমির ছবি</h3>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 bg-[#1e2d3d] hover:bg-[#2a3a4a] text-gray-300 rounded-2xl border-2 border-dashed border-[#2a3a4a] hover:border-[#D4A843] transition-all text-sm">
                    {bgImage ? "✓ ছবি নির্বাচিত — পরিবর্তন করুন" : "📁 পটভূমির ছবি আপলোড করুন"}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" />
                  {bgImage && (
                    <>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-gray-400 text-xs font-semibold">ছবির স্বচ্ছতা</label>
                          <span className="text-[#D4A843] text-xs font-bold">{Math.round(bgOpacity * 100)}%</span>
                        </div>
                        <input type="range" min={0.02} max={1} step={0.02} value={bgOpacity} onChange={e => setBgOpacity(+e.target.value)} className={sliderClass} />
                      </div>
                      <button onClick={() => setBgImage(null)}
                        className="w-full py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-xl text-sm transition-all border border-red-900/50">
                        ছবি সরিয়ে দিন
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Download Button */}
              <button onClick={handleDownload} disabled={downloading}
                className="w-full py-4 bg-gradient-to-r from-[#D4A843] to-[#c49030] hover:from-[#c49030] hover:to-[#b07820] text-black font-bold rounded-2xl text-base transition-all disabled:opacity-50 shadow-xl shadow-[#D4A843]/20 flex items-center justify-center gap-3">
                {downloading ? (
                  <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> ডাউনলোড হচ্ছে...</>
                ) : (
                  <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> PNG ডাউনলোড করুন</>
                )}
              </button>
              <p className="text-gray-600 text-xs text-center">আসল আকার: {cardWidth} × {cardHeight} px</p>
            </div>

            {/* ===== RIGHT PANEL: Preview ===== */}
            <div className="flex-1 flex flex-col items-center" ref={previewContainerRef}>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px w-8 bg-[#D4A843]/30" />
                <span className="text-gray-500 text-xs uppercase tracking-widest">প্রিভিউ</span>
                <div className="h-px w-8 bg-[#D4A843]/30" />
              </div>

              <div style={{
                width: `${cardWidth * previewScale}px`,
                height: `${cardHeight * previewScale}px`,
                position: "relative",
                flexShrink: 0,
                boxShadow: "0 30px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,168,67,0.15)",
                borderRadius: "6px",
                overflow: "hidden",
              }}>
                {/* The actual card rendered at full size, scaled down */}
                <div style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  backgroundColor: selectedTheme.bg,
                  color: selectedTheme.text,
                  fontFamily: `'${selectedFont}', 'Tiro Bangla', serif`,
                  padding: `${padding}px`,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  boxSizing: "border-box",
                }}>
                  {/* Background image */}
                  {bgImage && (
                    <div style={{
                      position: "absolute", inset: 0,
                      backgroundImage: `url(${bgImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      opacity: bgOpacity,
                      zIndex: 0,
                    }} />
                  )}

                  {/* Decoration */}
                  {decoration === "inner-border" && (
                    <div style={{ position: "absolute", inset: "16px", border: `1.5px solid ${selectedTheme.border}`, opacity: 0.5, zIndex: 1, pointerEvents: "none" }} />
                  )}
                  {decoration === "corner" && (
                    <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
                      {[
                        { top: 16, left: 16, borderTop: `1.5px solid ${selectedTheme.border}`, borderLeft: `1.5px solid ${selectedTheme.border}` },
                        { top: 16, right: 16, borderTop: `1.5px solid ${selectedTheme.border}`, borderRight: `1.5px solid ${selectedTheme.border}` },
                        { bottom: 16, left: 16, borderBottom: `1.5px solid ${selectedTheme.border}`, borderLeft: `1.5px solid ${selectedTheme.border}` },
                        { bottom: 16, right: 16, borderBottom: `1.5px solid ${selectedTheme.border}`, borderRight: `1.5px solid ${selectedTheme.border}` },
                      ].map((s, i) => <div key={i} style={{ position: "absolute", width: 40, height: 40, opacity: 0.7, ...s }} />)}
                    </div>
                  )}
                  {decoration === "top-bottom" && (
                    <>
                      <div style={{ position: "absolute", top: 24, left: padding, right: padding, height: "1px", backgroundColor: selectedTheme.border, opacity: 0.6, zIndex: 1 }} />
                      <div style={{ position: "absolute", bottom: 24, left: padding, right: padding, height: "1px", backgroundColor: selectedTheme.border, opacity: 0.6, zIndex: 1 }} />
                    </>
                  )}
                  {decoration === "left-bar" && (
                    <div style={{ position: "absolute", top: padding, bottom: padding, left: padding / 2 - 2, width: 4, backgroundColor: selectedTheme.border, opacity: 0.8, zIndex: 1, borderRadius: 2 }} />
                  )}
                  {decoration === "double-border" && (
                    <>
                      <div style={{ position: "absolute", inset: "10px", border: `1.5px solid ${selectedTheme.border}`, opacity: 0.5, zIndex: 1, pointerEvents: "none" }} />
                      <div style={{ position: "absolute", inset: "20px", border: `1.5px solid ${selectedTheme.border}`, opacity: 0.3, zIndex: 1, pointerEvents: "none" }} />
                    </>
                  )}

                  {/* Content */}
                  <div style={{ position: "relative", zIndex: 2, textAlign, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    {showTitle && title && (
                      <div style={{
                        fontSize: `${titleSize}px`,
                        fontWeight: "bold",
                        marginBottom: "24px",
                        lineHeight: 1.3,
                        borderBottom: `1px solid ${selectedTheme.border}`,
                        paddingBottom: "16px",
                        letterSpacing: `${letterSpacing}px`,
                      }}>
                        {title}
                      </div>
                    )}
                    <div style={{
                      fontSize: `${bodySize}px`,
                      lineHeight,
                      whiteSpace: "pre-wrap",
                      letterSpacing: `${letterSpacing}px`,
                    }}>
                      {body}
                    </div>
                    {showAuthor && author && (
                      <div style={{
                        fontSize: `${authorSize}px`,
                        marginTop: "28px",
                        opacity: 0.75,
                        fontStyle: "italic",
                        borderTop: `1px solid ${selectedTheme.border}`,
                        paddingTop: "12px",
                        letterSpacing: `${letterSpacing}px`,
                      }}>
                        {author}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-xs mt-4">
                স্কেল: {Math.round(previewScale * 100)}% — আসল আকার: {cardWidth} × {cardHeight}px
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
