import { useState, useRef, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import html2canvas from "html2canvas";

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
  { name: "Hind Siliguri (Google)", value: "'Hind Siliguri', sans-serif" },
  { name: "Noto Serif Bengali (Google)", value: "'Noto Serif Bengali', serif" },
];

const THEMES = [
  { name: "বইয়ের পাতা", bg: "#F5F0E8", text: "#1a1a1a", border: "#8B7355", accent: "#5C4A2A", overlay: "rgba(139,115,85,0.08)" },
  { name: "ক্রিম সাদা", bg: "#FFFEF7", text: "#2d2d2d", border: "#C8B89A", accent: "#8B7355", overlay: "rgba(200,184,154,0.1)" },
  { name: "রাতের আকাশ", bg: "#0d1b2a", text: "#E8D5A3", border: "#D4A843", accent: "#D4A843", overlay: "rgba(212,168,67,0.05)" },
  { name: "গভীর রাত", bg: "#111111", text: "#FFFFFF", border: "#444444", accent: "#D4A843", overlay: "rgba(255,255,255,0.03)" },
  { name: "সোনালি সন্ধ্যা", bg: "#2C1810", text: "#F5DEB3", border: "#D4A843", accent: "#FFD700", overlay: "rgba(212,168,67,0.08)" },
  { name: "সবুজ প্রকৃতি", bg: "#1a2e1a", text: "#E8F5E8", border: "#4CAF50", accent: "#81C784", overlay: "rgba(76,175,80,0.05)" },
  { name: "গোলাপি স্বপ্ন", bg: "#FFF0F5", text: "#4A1942", border: "#E91E8C", accent: "#C2185B", overlay: "rgba(233,30,140,0.05)" },
  { name: "নীল শান্তি", bg: "#EEF4FF", text: "#1A237E", border: "#3F51B5", accent: "#1565C0", overlay: "rgba(63,81,181,0.05)" },
  { name: "ধূসর মেঘ", bg: "#2D2D2D", text: "#E0E0E0", border: "#757575", accent: "#BDBDBD", overlay: "rgba(255,255,255,0.03)" },
  { name: "লাল আবেগ", bg: "#FFF5F5", text: "#3B0000", border: "#C62828", accent: "#B71C1C", overlay: "rgba(198,40,40,0.05)" },
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

export default function Editor() {
  // Content
  const [title, setTitle] = useState("শিরোনাম");
  const [body, setBody] = useState("এখানে আপনার লেখা লিখুন...\n\nআপনার মনের কথা, কবিতা বা গল্প।");
  const [author, setAuthor] = useState("— মাহবুব সরদার সবুজ");
  const [showTitle, setShowTitle] = useState(true);
  const [showAuthor, setShowAuthor] = useState(true);

  // Design
  const [selectedFont, setSelectedFont] = useState(FONTS[0].value);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [customWidth, setCustomWidth] = useState(800);
  const [customHeight, setCustomHeight] = useState(800);
  const [decoration, setDecoration] = useState("inner-border");

  // Typography
  const [titleSize, setTitleSize] = useState(52);
  const [bodySize, setBodySize] = useState(36);
  const [authorSize, setAuthorSize] = useState(28);
  const [lineHeight, setLineHeight] = useState(1.9);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [padding, setPadding] = useState(60);
  const [letterSpacing, setLetterSpacing] = useState(0.5);

  // Background
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState(0.12);

  // State
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "design" | "typography" | "background">("content");

  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cardWidth = selectedSize.name === "কাস্টম" ? customWidth : selectedSize.width;
  const cardHeight = selectedSize.name === "কাস্টম" ? customHeight : selectedSize.height;

  // Scale preview to fit screen
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerW = previewContainerRef.current.clientWidth - 40;
        const containerH = window.innerHeight * 0.65;
        const scaleX = containerW / cardWidth;
        const scaleY = containerH / cardHeight;
        setPreviewScale(Math.min(scaleX, scaleY, 1));
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [cardWidth, cardHeight]);

  // ── Download using html2canvas (captures DOM with real fonts) ───────────────
  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Temporarily set card to full size for capture
      const el = cardRef.current;
      const origTransform = el.style.transform;
      el.style.transform = "none";

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: selectedTheme.bg,
        width: cardWidth,
        height: cardHeight,
        logging: false,
      });

      el.style.transform = origTransform;

      const link = document.createElement("a");
      link.download = `${title || "লেখা"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Download error:", e);
      alert("ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
    setDownloading(false);
  }, [cardRef, selectedTheme, cardWidth, cardHeight, title]);

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBgImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const tabBtnClass = (tab: string) =>
    `px-3 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === tab ? "bg-[#D4A843] text-black" : "text-gray-400 hover:text-white hover:bg-[#1e2d3d]"}`;

  return (
    <div className="min-h-screen bg-[#070d1a]">
      <Seo title="লেখার কার্ড এডিটর | মাহবুব সরদার সবুজ" description="নিজের লেখা সুন্দরভাবে সাজান ও ডাউনলোড করুন" />
      <Navbar />

      <div className="pt-20 pb-10 px-3 md:px-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#D4A843] mb-1">লেখার কার্ড এডিটর</h1>
            <p className="text-gray-400 text-sm">আপনার লেখা সুন্দরভাবে সাজান ও PNG ডাউনলোড করুন</p>
          </div>

          <div className="flex flex-col xl:flex-row gap-5">
            {/* ===== LEFT PANEL ===== */}
            <div className="xl:w-[400px] flex-shrink-0 space-y-3">

              {/* Tab Navigation */}
              <div className="bg-[#111827] rounded-xl p-2 border border-[#2a3a4a] flex gap-1 flex-wrap">
                <button className={tabBtnClass("content")} onClick={() => setActiveTab("content")}>✏️ লেখা</button>
                <button className={tabBtnClass("design")} onClick={() => setActiveTab("design")}>🎨 ডিজাইন</button>
                <button className={tabBtnClass("typography")} onClick={() => setActiveTab("typography")}>🔤 টাইপো</button>
                <button className={tabBtnClass("background")} onClick={() => setActiveTab("background")}>🖼️ পটভূমি</button>
              </div>

              {/* Content Tab */}
              {activeTab === "content" && (
                <div className="bg-[#111827] rounded-xl p-4 border border-[#2a3a4a] space-y-4">
                  <h3 className="text-[#D4A843] font-semibold text-sm uppercase tracking-wider">লেখার বিষয়বস্তু</h3>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <input type="checkbox" id="showTitle" checked={showTitle} onChange={e => setShowTitle(e.target.checked)} className="accent-[#D4A843]" />
                      <label htmlFor="showTitle" className="text-gray-300 text-sm font-medium">শিরোনাম দেখাও</label>
                    </div>
                    {showTitle && (
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="শিরোনাম লিখুন..."
                        className="w-full bg-[#1e2d3d] text-white border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843]"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm font-medium block mb-1">মূল লেখা</label>
                    <textarea
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      placeholder="আপনার লেখা এখানে লিখুন..."
                      rows={10}
                      className="w-full bg-[#1e2d3d] text-white border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843] resize-y"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <input type="checkbox" id="showAuthor" checked={showAuthor} onChange={e => setShowAuthor(e.target.checked)} className="accent-[#D4A843]" />
                      <label htmlFor="showAuthor" className="text-gray-300 text-sm font-medium">লেখকের নাম দেখাও</label>
                    </div>
                    {showAuthor && (
                      <input
                        type="text"
                        value={author}
                        onChange={e => setAuthor(e.target.value)}
                        placeholder="লেখকের নাম..."
                        className="w-full bg-[#1e2d3d] text-white border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843]"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm font-medium block mb-2">টেক্সট সারিবদ্ধতা</label>
                    <div className="flex gap-2">
                      {(["left", "center", "right"] as const).map(a => (
                        <button key={a} onClick={() => setTextAlign(a)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${textAlign === a ? "bg-[#D4A843] text-black" : "bg-[#1e2d3d] text-gray-400 hover:text-white"}`}>
                          {a === "left" ? "বাম" : a === "center" ? "মাঝ" : "ডান"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Design Tab */}
              {activeTab === "design" && (
                <div className="bg-[#111827] rounded-xl p-4 border border-[#2a3a4a] space-y-4">
                  <h3 className="text-[#D4A843] font-semibold text-sm uppercase tracking-wider">ডিজাইন</h3>

                  {/* Font */}
                  <div>
                    <label className="text-gray-300 text-sm font-medium block mb-2">ফন্ট নির্বাচন</label>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {FONTS.map(f => (
                        <button key={f.value} onClick={() => setSelectedFont(f.value)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedFont === f.value ? "bg-[#D4A843] text-black font-semibold" : "bg-[#1e2d3d] text-gray-300 hover:bg-[#2a3a4a]"}`}
                          style={{ fontFamily: `'${f.value}', serif` }}>
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="text-gray-300 text-sm font-medium block mb-2">থিম / রঙ</label>
                    <div className="grid grid-cols-2 gap-2">
                      {THEMES.map(t => (
                        <button key={t.name} onClick={() => setSelectedTheme(t)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border-2 ${selectedTheme.name === t.name ? "border-[#D4A843] scale-105" : "border-transparent"}`}
                          style={{ backgroundColor: t.bg, color: t.text }}>
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="text-gray-300 text-sm font-medium block mb-2">কার্ডের আকার</label>
                    <div className="grid grid-cols-2 gap-2">
                      {SIZES.map(s => (
                        <button key={s.name} onClick={() => setSelectedSize(s)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedSize.name === s.name ? "bg-[#D4A843] text-black" : "bg-[#1e2d3d] text-gray-300 hover:bg-[#2a3a4a]"}`}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                    {selectedSize.name === "কাস্টম" && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="text-gray-400 text-xs mb-1 block">প্রস্থ (px)</label>
                          <input type="number" value={customWidth} onChange={e => setCustomWidth(+e.target.value)} min={300} max={3000}
                            className="w-full bg-[#1e2d3d] text-white border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843]" />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs mb-1 block">উচ্চতা (px)</label>
                          <input type="number" value={customHeight} onChange={e => setCustomHeight(+e.target.value)} min={300} max={3000}
                            className="w-full bg-[#1e2d3d] text-white border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Decoration */}
                  <div>
                    <label className="text-gray-300 text-sm font-medium block mb-2">সজ্জা</label>
                    <div className="grid grid-cols-2 gap-2">
                      {DECORATIONS.map(d => (
                        <button key={d.value} onClick={() => setDecoration(d.value)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${decoration === d.value ? "bg-[#D4A843] text-black" : "bg-[#1e2d3d] text-gray-300 hover:bg-[#2a3a4a]"}`}>
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Padding */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">ভেতরের ফাঁক: {padding}px</label>
                    <input type="range" min={20} max={120} value={padding} onChange={e => setPadding(+e.target.value)} className="w-full accent-[#D4A843]" />
                  </div>
                </div>
              )}

              {/* Typography Tab */}
              {activeTab === "typography" && (
                <div className="bg-[#111827] rounded-xl p-4 border border-[#2a3a4a] space-y-4">
                  <h3 className="text-[#D4A843] font-semibold text-sm uppercase tracking-wider">টাইপোগ্রাফি</h3>

                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">শিরোনামের আকার: {titleSize}px</label>
                    <input type="range" min={24} max={100} value={titleSize} onChange={e => setTitleSize(+e.target.value)} className="w-full accent-[#D4A843]" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">মূল লেখার আকার: {bodySize}px</label>
                    <input type="range" min={16} max={80} value={bodySize} onChange={e => setBodySize(+e.target.value)} className="w-full accent-[#D4A843]" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">লেখকের নামের আকার: {authorSize}px</label>
                    <input type="range" min={14} max={60} value={authorSize} onChange={e => setAuthorSize(+e.target.value)} className="w-full accent-[#D4A843]" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">লাইনের ব্যবধান: {lineHeight.toFixed(1)}</label>
                    <input type="range" min={1.2} max={3.0} step={0.1} value={lineHeight} onChange={e => setLineHeight(+e.target.value)} className="w-full accent-[#D4A843]" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">অক্ষরের ব্যবধান: {letterSpacing}px</label>
                    <input type="range" min={0} max={5} step={0.5} value={letterSpacing} onChange={e => setLetterSpacing(+e.target.value)} className="w-full accent-[#D4A843]" />
                  </div>
                </div>
              )}

              {/* Background Tab */}
              {activeTab === "background" && (
                <div className="bg-[#111827] rounded-xl p-4 border border-[#2a3a4a] space-y-4">
                  <h3 className="text-[#D4A843] font-semibold text-sm uppercase tracking-wider">পটভূমির ছবি</h3>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 bg-[#1e2d3d] hover:bg-[#2a3a4a] text-gray-300 rounded-xl border border-dashed border-[#2a3a4a] hover:border-[#D4A843] transition-all text-sm">
                    {bgImage ? "✓ ছবি নির্বাচিত — পরিবর্তন করুন" : "📁 পটভূমির ছবি আপলোড করুন"}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" />
                  {bgImage && (
                    <>
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">ছবির স্বচ্ছতা: {Math.round(bgOpacity * 100)}%</label>
                        <input type="range" min={0.02} max={1} step={0.02} value={bgOpacity} onChange={e => setBgOpacity(+e.target.value)} className="w-full accent-[#D4A843]" />
                      </div>
                      <button onClick={() => setBgImage(null)}
                        className="w-full py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm transition-all border border-red-900/50">
                        ছবি সরিয়ে দিন
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-4 bg-[#D4A843] hover:bg-[#c49030] text-black font-bold rounded-xl text-base transition-all disabled:opacity-50 shadow-lg shadow-[#D4A843]/20 flex items-center justify-center gap-2"
              >
                {downloading ? (
                  <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> ডাউনলোড হচ্ছে...</>
                ) : (
                  <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> PNG ডাউনলোড করুন</>
                )}
              </button>

              <p className="text-gray-600 text-xs text-center">কার্ডের আকার: {cardWidth} × {cardHeight} px</p>
            </div>

            {/* ===== RIGHT PANEL: Preview ===== */}
            <div className="flex-1 flex flex-col items-center" ref={previewContainerRef}>
              <h3 className="text-gray-400 text-xs mb-4 uppercase tracking-widest">প্রিভিউ</h3>

              <div
                style={{
                  width: `${cardWidth * previewScale}px`,
                  height: `${cardHeight * previewScale}px`,
                  position: "relative",
                  flexShrink: 0,
                  boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                {/* The actual card rendered at full size, scaled down */}
                <div
                  ref={cardRef}
                  style={{
                    width: `${cardWidth}px`,
                    height: `${cardHeight}px`,
                    backgroundColor: selectedTheme.bg,
                    color: selectedTheme.text,
                    fontFamily: `'${selectedFont}', serif`,
                    padding: `${padding}px`,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top left",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    boxSizing: "border-box",
                  }}
                >
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
                      {[["top:16px;left:16px", "border-top:1.5px solid;border-left:1.5px solid"],
                        ["top:16px;right:16px", "border-top:1.5px solid;border-right:1.5px solid"],
                        ["bottom:16px;left:16px", "border-bottom:1.5px solid;border-left:1.5px solid"],
                        ["bottom:16px;right:16px", "border-bottom:1.5px solid;border-right:1.5px solid"]
                      ].map((_, i) => (
                        <div key={i} style={{
                          position: "absolute",
                          width: "40px", height: "40px",
                          borderColor: selectedTheme.border,
                          opacity: 0.7,
                          ...(i === 0 ? { top: 16, left: 16, borderTop: `1.5px solid ${selectedTheme.border}`, borderLeft: `1.5px solid ${selectedTheme.border}` } :
                            i === 1 ? { top: 16, right: 16, borderTop: `1.5px solid ${selectedTheme.border}`, borderRight: `1.5px solid ${selectedTheme.border}` } :
                            i === 2 ? { bottom: 16, left: 16, borderBottom: `1.5px solid ${selectedTheme.border}`, borderLeft: `1.5px solid ${selectedTheme.border}` } :
                            { bottom: 16, right: 16, borderBottom: `1.5px solid ${selectedTheme.border}`, borderRight: `1.5px solid ${selectedTheme.border}` })
                        }} />
                      ))}
                    </div>
                  )}
                  {decoration === "top-bottom" && (
                    <>
                      <div style={{ position: "absolute", top: 24, left: padding, right: padding, height: "1px", backgroundColor: selectedTheme.border, opacity: 0.6, zIndex: 1 }} />
                      <div style={{ position: "absolute", bottom: 24, left: padding, right: padding, height: "1px", backgroundColor: selectedTheme.border, opacity: 0.6, zIndex: 1 }} />
                    </>
                  )}
                  {decoration === "left-bar" && (
                    <div style={{ position: "absolute", top: padding, bottom: padding, left: padding / 2 - 2, width: "4px", backgroundColor: selectedTheme.border, opacity: 0.8, zIndex: 1, borderRadius: "2px" }} />
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
                        fontFamily: `'${selectedFont}', serif`,
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
                      fontFamily: `'${selectedFont}', serif`,
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
                        fontFamily: `'${selectedFont}', serif`,
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
