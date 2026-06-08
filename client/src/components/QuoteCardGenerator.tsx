/**
 * QuoteCardGenerator — লেখার অংশ সিলেক্ট করে সুন্দর কোটেশন কার্ড ডাউনলোড
 * Cinematic Dark Luxury Design — matches site theme
 * Uses Canvas API to render and download the card
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Image as ImageIcon, RefreshCw, Check } from "lucide-react";

interface QuoteCardGeneratorProps {
  quote: string;
  author?: string;
  category?: string;
  onClose: () => void;
}

const THEMES = [
  {
    id: "gold",
    label: "গোল্ড",
    bg: ["#040810", "#0A1428"],
    accent: "#C9A84C",
    text: "#FAF6EF",
    sub: "rgba(201,168,76,0.6)",
    border: "rgba(201,168,76,0.3)",
  },
  {
    id: "rose",
    label: "রোজ",
    bg: ["#0A0410", "#180820"],
    accent: "#F472B6",
    text: "#FDF2F8",
    sub: "rgba(244,114,182,0.6)",
    border: "rgba(244,114,182,0.3)",
  },
  {
    id: "blue",
    label: "নীল",
    bg: ["#040A18", "#081428"],
    accent: "#60A5FA",
    text: "#EFF6FF",
    sub: "rgba(96,165,250,0.6)",
    border: "rgba(96,165,250,0.3)",
  },
  {
    id: "green",
    label: "সবুজ",
    bg: ["#040C08", "#081810"],
    accent: "#34D399",
    text: "#ECFDF5",
    sub: "rgba(52,211,153,0.6)",
    border: "rgba(52,211,153,0.3)",
  },
  {
    id: "sepia",
    label: "সেপিয়া",
    bg: ["#1C1408", "#2A1E0A"],
    accent: "#D4A843",
    text: "#FDF6E3",
    sub: "rgba(212,168,67,0.6)",
    border: "rgba(212,168,67,0.3)",
  },
];

const SIZES = [
  { id: "square", label: "স্কয়ার", w: 1080, h: 1080 },
  { id: "story", label: "স্টোরি", w: 1080, h: 1920 },
  { id: "wide", label: "ওয়াইড", w: 1200, h: 630 },
];

export default function QuoteCardGenerator({ quote, author = "মাহবুব সরদার সবুজ", category, onClose }: QuoteCardGeneratorProps) {
  const [themeIdx, setThemeIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const theme = THEMES[themeIdx];
  const size = SIZES[sizeIdx];

  // Truncate quote for display
  const displayQuote = quote.length > 280 ? quote.slice(0, 280).trim() + "…" : quote;

  const drawCard = useCallback((canvas: HTMLCanvasElement, w: number, h: number, scale = 1) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = w;
    canvas.height = h;

    const s = scale;
    const pad = w * 0.1;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, theme.bg[0]);
    grad.addColorStop(1, theme.bg[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Radial glow top-right
    const glow = ctx.createRadialGradient(w * 0.85, h * 0.15, 0, w * 0.85, h * 0.15, w * 0.5);
    glow.addColorStop(0, theme.accent + "22");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Bottom glow
    const glow2 = ctx.createRadialGradient(w * 0.2, h * 0.9, 0, w * 0.2, h * 0.9, w * 0.4);
    glow2.addColorStop(0, theme.accent + "11");
    glow2.addColorStop(1, "transparent");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, w, h);

    // Decorative top-left corner lines
    ctx.strokeStyle = theme.accent + "44";
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(pad * 0.4, pad * 0.4);
    ctx.lineTo(pad * 0.4 + w * 0.08, pad * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pad * 0.4, pad * 0.4);
    ctx.lineTo(pad * 0.4, pad * 0.4 + h * 0.05);
    ctx.stroke();

    // Decorative bottom-right corner lines
    ctx.beginPath();
    ctx.moveTo(w - pad * 0.4, h - pad * 0.4);
    ctx.lineTo(w - pad * 0.4 - w * 0.08, h - pad * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w - pad * 0.4, h - pad * 0.4);
    ctx.lineTo(w - pad * 0.4, h - pad * 0.4 - h * 0.05);
    ctx.stroke();

    // Opening quote mark
    const quoteFontSize = Math.floor(w * 0.18);
    ctx.font = `${quoteFontSize}px Georgia, serif`;
    ctx.fillStyle = theme.accent + "33";
    ctx.fillText('"', pad * 0.6, pad * 1.4);

    // Quote text — word wrap
    const textX = pad;
    let textY = h * 0.28;
    const maxWidth = w - pad * 2;
    const lineHeight = Math.floor(w * 0.048);
    const fontSize = Math.floor(w * 0.038);

    ctx.font = `${fontSize}px 'Noto Sans Bengali', 'AdorshoLipi', sans-serif`;
    ctx.fillStyle = theme.text;
    ctx.textBaseline = "top";

    // Simple word wrap
    const words = displayQuote.split("");
    let line = "";
    const lines: string[] = [];
    let charCount = 0;
    const charsPerLine = Math.floor(maxWidth / (fontSize * 0.6));

    for (const char of displayQuote) {
      line += char;
      charCount++;
      if (charCount >= charsPerLine || char === "\n") {
        lines.push(line);
        line = "";
        charCount = 0;
      }
    }
    if (line) lines.push(line);

    // Center vertically
    const totalTextHeight = lines.length * lineHeight;
    textY = (h - totalTextHeight) / 2 - lineHeight;

    lines.forEach((l, i) => {
      ctx.fillText(l, textX, textY + i * lineHeight);
    });

    // Divider line
    const divY = textY + totalTextHeight + lineHeight * 1.2;
    ctx.strokeStyle = theme.accent + "55";
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(textX, divY);
    ctx.lineTo(textX + w * 0.15, divY);
    ctx.stroke();

    // Author name
    const authorFontSize = Math.floor(w * 0.028);
    ctx.font = `${authorFontSize}px 'Noto Sans Bengali', 'AdorshoLipi', sans-serif`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(`— ${author}`, textX, divY + lineHeight * 0.5);

    // Category badge (if provided)
    if (category) {
      const catFontSize = Math.floor(w * 0.022);
      ctx.font = `${catFontSize}px 'Space Grotesk', sans-serif`;
      ctx.fillStyle = theme.sub;
      ctx.fillText(category, textX, divY + lineHeight * 1.5);
    }

    // Website watermark bottom-right
    const wmFontSize = Math.floor(w * 0.018);
    ctx.font = `${wmFontSize}px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = theme.accent + "44";
    ctx.textAlign = "right";
    ctx.fillText("mahbubsardarsabuj.com", w - pad * 0.6, h - pad * 0.6);
    ctx.textAlign = "left";

  }, [theme, size, displayQuote, author, category]);

  // Draw preview
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    // Draw at reduced scale for preview
    const previewW = 400;
    const previewH = Math.round(previewW * (size.h / size.w));
    drawCard(canvas, previewW, previewH, previewW / size.w);
  }, [drawCard, size]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      drawCard(canvas, size.w, size.h, 1);
      const url = canvas.toDataURL("image/png", 1.0);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mahbub-sardar-sabuj-quote-${Date.now()}.png`;
      a.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } finally {
      setDownloading(false);
    }
  }, [drawCard, size]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(2,4,8,0.92)",
        backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "min(900px, 96vw)",
          background: "rgba(6,10,20,0.99)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 20,
          boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ImageIcon size={16} color="#C9A84C" />
            <span style={{ fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif", fontSize: ".9rem", color: "#FAF6EF", fontWeight: 600 }}>
              কোটেশন কার্ড তৈরি করুন
            </span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(250,246,239,0.4)", display: "flex", padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
          {/* Preview */}
          <div style={{
            flex: "1 1 300px",
            padding: "20px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}>
            <canvas
              ref={previewRef}
              style={{
                width: "100%", maxWidth: 340,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                display: "block",
              }}
            />
            <p style={{ color: "rgba(250,246,239,0.3)", fontSize: ".7rem", fontFamily: "var(--f, sans-serif)", margin: 0, textAlign: "center" }}>
              প্রিভিউ — আসল কার্ড {size.w}×{size.h}px
            </p>
          </div>

          {/* Controls */}
          <div style={{ flex: "1 1 240px", padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Theme selector */}
            <div>
              <p style={{ color: "rgba(250,246,239,0.5)", fontSize: ".7rem", fontFamily: "var(--f, sans-serif)", letterSpacing: ".1em", textTransform: "uppercase", margin: "0 0 10px" }}>থিম</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {THEMES.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeIdx(i)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border: `1px solid ${themeIdx === i ? t.accent + "88" : "rgba(255,255,255,0.1)"}`,
                      background: themeIdx === i ? t.accent + "18" : "rgba(255,255,255,0.04)",
                      color: themeIdx === i ? t.accent : "rgba(250,246,239,0.5)",
                      cursor: "pointer", fontSize: ".75rem",
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      transition: "all .15s",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div>
              <p style={{ color: "rgba(250,246,239,0.5)", fontSize: ".7rem", fontFamily: "var(--f, sans-serif)", letterSpacing: ".1em", textTransform: "uppercase", margin: "0 0 10px" }}>সাইজ</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SIZES.map((sz, i) => (
                  <button
                    key={sz.id}
                    onClick={() => setSizeIdx(i)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border: `1px solid ${sizeIdx === i ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.1)"}`,
                      background: sizeIdx === i ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.04)",
                      color: sizeIdx === i ? "#C9A84C" : "rgba(250,246,239,0.5)",
                      cursor: "pointer", fontSize: ".75rem",
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      transition: "all .15s",
                    }}
                  >
                    {sz.label}
                    <span style={{ display: "block", fontSize: ".6rem", opacity: 0.6 }}>{sz.w}×{sz.h}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quote preview */}
            <div style={{
              padding: "12px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              flex: 1,
            }}>
              <p style={{ color: "rgba(250,246,239,0.5)", fontSize: ".7rem", fontFamily: "var(--f, sans-serif)", letterSpacing: ".1em", textTransform: "uppercase", margin: "0 0 8px" }}>নির্বাচিত অংশ</p>
              <p style={{
                color: "rgba(250,246,239,0.75)", fontSize: ".82rem",
                fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                lineHeight: 1.7, margin: 0,
                maxHeight: 120, overflow: "hidden",
                display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical",
              }}>
                {displayQuote}
              </p>
            </div>

            {/* Download button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDownload}
              disabled={downloading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px 20px",
                borderRadius: 12,
                background: downloaded
                  ? "linear-gradient(135deg, rgba(52,211,153,0.2), rgba(52,211,153,0.1))"
                  : "linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.15))",
                border: `1px solid ${downloaded ? "rgba(52,211,153,0.4)" : "rgba(201,168,76,0.4)"}`,
                color: downloaded ? "#34D399" : "#C9A84C",
                cursor: downloading ? "wait" : "pointer",
                fontSize: ".88rem",
                fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                fontWeight: 600,
                transition: "all .2s",
              }}
            >
              {downloading ? (
                <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> তৈরি হচ্ছে...</>
              ) : downloaded ? (
                <><Check size={15} /> ডাউনলোড হয়েছে!</>
              ) : (
                <><Download size={15} /> PNG ডাউনলোড করুন</>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
