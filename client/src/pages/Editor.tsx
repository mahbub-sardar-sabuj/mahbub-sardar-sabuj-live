import { useState, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import html2canvas from "html2canvas";

const FONTS = [
  { name: "চন্দ্রশীলা", value: "ChandraSheela", file: "/fonts/ChandraSheela.ttf" },
  { name: "চন্দ্রশীলা প্রিমিয়াম", value: "ChandraSheelaPremium", file: "/fonts/ChandraSheelaPremium.ttf" },
  { name: "মাহবুব সরদার সবুজ ফন্ট", value: "MahbubSardarSabujFont", file: "/fonts/MahbubSardarSabujFont.ttf" },
  { name: "মাসুদ নান্দনিক", value: "MasudNandanik", file: "/fonts/MasudNandanik.ttf" },
  { name: "আদর্শ লিপি", value: "AdorshoLipi", file: "/fonts/AdorshoLipi.ttf" },
  { name: "BH Sabit Adorsho Light", value: "BHSabitAdorshoLight", file: "/fonts/BHSabitAdorshoLightUnicode.ttf" },
  { name: "BLAB Norha Gram", value: "BLABNorhaGram", file: "/fonts/BLABNorhaGramUnicode.ttf" },
  { name: "Akhand Bengali", value: "AkhandBengali", file: "/fonts/AkhandBengali.ttf" },
];

// Load all fonts into the document
const loadedFonts = new Set<string>();
function loadFont(font: typeof FONTS[0]) {
  if (loadedFonts.has(font.value)) return;
  loadedFonts.add(font.value);
  const style = document.createElement("style");
  style.textContent = `@font-face { font-family: '${font.value}'; src: url('${font.file}') format('truetype'); }`;
  document.head.appendChild(style);
}
FONTS.forEach(loadFont);

const BG_THEMES = [
  { name: "বইয়ের পাতা", bg: "#f5f0e8", text: "#1a1a1a", border: "#d4c9a8" },
  { name: "ক্রিম সাদা", bg: "#fffef7", text: "#2c2c2c", border: "#e8e0c8" },
  { name: "রাতের আকাশ", bg: "#0d1b2a", text: "#e8d5a3", border: "#2a3a4a" },
  { name: "সোনালি সন্ধ্যা", bg: "#1a1200", text: "#f0d060", border: "#3a2a00" },
  { name: "সবুজ প্রকৃতি", bg: "#f0f7f0", text: "#1a3a1a", border: "#c0d8c0" },
  { name: "গোলাপি স্বপ্ন", bg: "#fff0f5", text: "#4a1a2a", border: "#e8c0d0" },
  { name: "নীল শান্তি", bg: "#f0f4ff", text: "#1a2a4a", border: "#c0d0e8" },
  { name: "ধূসর মেঘ", bg: "#f5f5f5", text: "#2a2a2a", border: "#d0d0d0" },
];

const CARD_SIZES = [
  { name: "বর্গাকার (1:1)", width: 600, height: 600 },
  { name: "পোর্ট্রেট (4:5)", width: 600, height: 750 },
  { name: "লম্বা (9:16)", width: 450, height: 800 },
  { name: "আড়াআড়ি (16:9)", width: 800, height: 450 },
  { name: "A4 পোর্ট্রেট", width: 595, height: 842 },
  { name: "কাস্টম", width: 0, height: 0 },
];

export default function Editor() {
  const [title, setTitle] = useState("শিরোনাম লিখুন");
  const [body, setBody] = useState("এখানে আপনার লেখা লিখুন...\n\nকবিতা, গল্প, অনুভূতি — যা খুশি।");
  const [author, setAuthor] = useState("— লেখকের নাম");
  const [selectedFont, setSelectedFont] = useState(FONTS[0].value);
  const [titleSize, setTitleSize] = useState(32);
  const [bodySize, setBodySize] = useState(18);
  const [authorSize, setAuthorSize] = useState(16);
  const [selectedTheme, setSelectedTheme] = useState(BG_THEMES[0]);
  const [selectedSize, setSelectedSize] = useState(CARD_SIZES[0]);
  const [customWidth, setCustomWidth] = useState(600);
  const [customHeight, setCustomHeight] = useState(600);
  const [padding, setPadding] = useState(48);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [showAuthor, setShowAuthor] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState(0.15);

  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cardWidth = selectedSize.name === "কাস্টম" ? customWidth : selectedSize.width;
  const cardHeight = selectedSize.name === "কাস্টম" ? customHeight : selectedSize.height;

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: selectedTheme.bg,
        width: cardWidth,
        height: cardHeight,
      });
      const link = document.createElement("a");
      link.download = `${title || "লেখা"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error(e);
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

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <Seo
        title="লেখার এডিটর | মাহবুব সরদার সবুজ"
        description="নিজের লেখা সুন্দরভাবে সাজান ও ডাউনলোড করুন"
      />
      <Navbar />

      <div className="pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#D4A843] mb-2">লেখার কার্ড এডিটর</h1>
            <p className="text-gray-400">আপনার লেখা সুন্দরভাবে সাজান ও ডাউনলোড করুন</p>
          </div>

          <div className="flex flex-col xl:flex-row gap-6">
            {/* ===== LEFT PANEL: Controls ===== */}
            <div className="xl:w-[380px] flex-shrink-0 space-y-4">

              {/* Text Content */}
              <div className="bg-[#111827] rounded-xl p-4 border border-[#2a3a4a]">
                <h3 className="text-[#D4A843] font-semibold mb-3 text-sm uppercase tracking-wider">লেখার বিষয়বস্তু</h3>

                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" id="showTitle" checked={showTitle} onChange={e => setShowTitle(e.target.checked)} className="accent-[#D4A843]" />
                  <label htmlFor="showTitle" className="text-gray-300 text-sm">শিরোনাম দেখাও</label>
                </div>
                {showTitle && (
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-[#1a2535] text-white border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#D4A843]"
                    placeholder="শিরোনাম"
                  />
                )}

                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={6}
                  className="w-full bg-[#1a2535] text-white border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#D4A843] resize-y"
                  placeholder="আপনার লেখা এখানে..."
                />

                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" id="showAuthor" checked={showAuthor} onChange={e => setShowAuthor(e.target.checked)} className="accent-[#D4A843]" />
                  <label htmlFor="showAuthor" className="text-gray-300 text-sm">লেখকের নাম দেখাও</label>
                </div>
                {showAuthor && (
                  <input
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    className="w-full bg-[#1a2535] text-white border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843]"
                    placeholder="— লেখকের নাম"
                  />
                )}
              </div>

              {/* Font */}
              <div className="bg-[#111827] rounded-xl p-4 border border-[#2a3a4a]">
                <h3 className="text-[#D4A843] font-semibold mb-3 text-sm uppercase tracking-wider">ফন্ট</h3>
                <select
                  value={selectedFont}
                  onChange={e => setSelectedFont(e.target.value)}
                  className="w-full bg-[#1a2535] text-white border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843] mb-3"
                >
                  {FONTS.map(f => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.name}</option>
                  ))}
                </select>

                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">শিরোনামের আকার: {titleSize}px</label>
                    <input type="range" min={18} max={72} value={titleSize} onChange={e => setTitleSize(+e.target.value)}
                      className="w-full accent-[#D4A843]" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">লেখার আকার: {bodySize}px</label>
                    <input type="range" min={12} max={48} value={bodySize} onChange={e => setBodySize(+e.target.value)}
                      className="w-full accent-[#D4A843]" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">লেখকের নামের আকার: {authorSize}px</label>
                    <input type="range" min={10} max={36} value={authorSize} onChange={e => setAuthorSize(+e.target.value)}
                      className="w-full accent-[#D4A843]" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">লাইনের ফাঁক: {lineHeight}</label>
                    <input type="range" min={1.2} max={3.0} step={0.1} value={lineHeight} onChange={e => setLineHeight(+e.target.value)}
                      className="w-full accent-[#D4A843]" />
                  </div>
                </div>
              </div>

              {/* Alignment */}
              <div className="bg-[#111827] rounded-xl p-4 border border-[#2a3a4a]">
                <h3 className="text-[#D4A843] font-semibold mb-3 text-sm uppercase tracking-wider">সারিবদ্ধতা</h3>
                <div className="flex gap-2">
                  {(["left", "center", "right"] as const).map(align => (
                    <button
                      key={align}
                      onClick={() => setTextAlign(align)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${textAlign === align ? "bg-[#D4A843] text-black" : "bg-[#1a2535] text-gray-300 hover:bg-[#2a3545]"}`}
                    >
                      {align === "left" ? "বাম" : align === "center" ? "মধ্য" : "ডান"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Theme */}
              <div className="bg-[#111827] rounded-xl p-4 border border-[#2a3a4a]">
                <h3 className="text-[#D4A843] font-semibold mb-3 text-sm uppercase tracking-wider">পটভূমির রং</h3>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {BG_THEMES.map(theme => (
                    <button
                      key={theme.name}
                      onClick={() => setSelectedTheme(theme)}
                      title={theme.name}
                      className={`h-10 rounded-lg border-2 transition-all ${selectedTheme.name === theme.name ? "border-[#D4A843] scale-110" : "border-transparent hover:border-gray-500"}`}
                      style={{ backgroundColor: theme.bg }}
                    />
                  ))}
                </div>
                <p className="text-gray-400 text-xs mb-3">নির্বাচিত: {selectedTheme.name}</p>

                {/* Background image upload */}
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">পটভূমির ছবি (ঐচ্ছিক)</label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 bg-[#1a2535] text-gray-300 border border-[#2a3a4a] rounded-lg text-sm hover:border-[#D4A843] transition-all"
                  >
                    ছবি আপলোড করুন
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" />
                  {bgImage && (
                    <div className="mt-2">
                      <label className="text-gray-400 text-xs mb-1 block">ছবির স্বচ্ছতা: {Math.round(bgOpacity * 100)}%</label>
                      <input type="range" min={0.05} max={0.5} step={0.05} value={bgOpacity} onChange={e => setBgOpacity(+e.target.value)}
                        className="w-full accent-[#D4A843]" />
                      <button onClick={() => setBgImage(null)} className="mt-1 text-xs text-red-400 hover:text-red-300">ছবি সরান</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Size */}
              <div className="bg-[#111827] rounded-xl p-4 border border-[#2a3a4a]">
                <h3 className="text-[#D4A843] font-semibold mb-3 text-sm uppercase tracking-wider">কার্ডের আকার</h3>
                <select
                  value={selectedSize.name}
                  onChange={e => setSelectedSize(CARD_SIZES.find(s => s.name === e.target.value) || CARD_SIZES[0])}
                  className="w-full bg-[#1a2535] text-white border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843] mb-3"
                >
                  {CARD_SIZES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>

                {selectedSize.name === "কাস্টম" && (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-gray-400 text-xs mb-1 block">প্রস্থ (px)</label>
                      <input type="number" value={customWidth} onChange={e => setCustomWidth(+e.target.value)} min={200} max={1200}
                        className="w-full bg-[#1a2535] text-white border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843]" />
                    </div>
                    <div className="flex-1">
                      <label className="text-gray-400 text-xs mb-1 block">উচ্চতা (px)</label>
                      <input type="number" value={customHeight} onChange={e => setCustomHeight(+e.target.value)} min={200} max={1600}
                        className="w-full bg-[#1a2535] text-white border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4A843]" />
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <label className="text-gray-400 text-xs mb-1 block">ভেতরের ফাঁক: {padding}px</label>
                  <input type="range" min={16} max={80} value={padding} onChange={e => setPadding(+e.target.value)}
                    className="w-full accent-[#D4A843]" />
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-4 bg-[#D4A843] hover:bg-[#c49030] text-black font-bold rounded-xl text-lg transition-all disabled:opacity-50 shadow-lg shadow-[#D4A843]/20"
              >
                {downloading ? "ডাউনলোড হচ্ছে..." : "⬇ PNG ডাউনলোড করুন"}
              </button>
            </div>

            {/* ===== RIGHT PANEL: Preview ===== */}
            <div className="flex-1 flex flex-col items-center">
              <h3 className="text-gray-400 text-sm mb-4 uppercase tracking-wider">প্রিভিউ</h3>
              <div className="overflow-auto w-full flex justify-center">
                <div
                  ref={cardRef}
                  style={{
                    width: `${cardWidth}px`,
                    height: `${cardHeight}px`,
                    backgroundColor: selectedTheme.bg,
                    color: selectedTheme.text,
                    fontFamily: `'${selectedFont}', serif`,
                    padding: `${padding}px`,
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    border: `2px solid ${selectedTheme.border}`,
                    borderRadius: "4px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                    flexShrink: 0,
                  }}
                >
                  {/* Background image overlay */}
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

                  {/* Decorative border lines */}
                  <div style={{
                    position: "absolute", inset: "12px",
                    border: `1px solid ${selectedTheme.border}`,
                    opacity: 0.5,
                    zIndex: 1,
                    pointerEvents: "none",
                  }} />

                  {/* Content */}
                  <div style={{ position: "relative", zIndex: 2, textAlign }}>
                    {showTitle && title && (
                      <div style={{
                        fontSize: `${titleSize}px`,
                        fontWeight: "bold",
                        marginBottom: "24px",
                        lineHeight: 1.3,
                        fontFamily: `'${selectedFont}', serif`,
                        borderBottom: `1px solid ${selectedTheme.border}`,
                        paddingBottom: "16px",
                      }}>
                        {title}
                      </div>
                    )}

                    <div style={{
                      fontSize: `${bodySize}px`,
                      lineHeight,
                      whiteSpace: "pre-wrap",
                      fontFamily: `'${selectedFont}', serif`,
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
                      }}>
                        {author}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-500 text-xs mt-4">
                কার্ডের আকার: {cardWidth} × {cardHeight} px
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
