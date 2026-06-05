// client/src/components/chatbot/AudioResultCard.tsx
// Professional Audio Result Card — Before/After Player, Playback Speed, Share
import { useState, useRef } from "react";

interface AudioResultCardProps {
  audioUrl: string;
  audioFilename: string;
  audioDescription?: string;
  audioAppliedSteps?: string[];
  audioIntent?: string;
  audioPipeline?: string[];
  audioTechnicalNote?: string;
  originalAudioUrl?: string;
  originalAudioName?: string;
  outputSizeKB?: number;
}

const INTENT_LABELS: Record<string, string> = {
  clean: "🧹 পরিষ্কার প্রসেসিং",
  enhance: "✨ ভয়েস এনহ্যান্সমেন্ট",
  podcast: "🎙️ পডকাস্ট প্রিসেট",
  studio: "🎚️ স্টুডিও মাস্টার",
  broadcast: "📡 ব্রডকাস্ট রেডি",
  asmr: "🌙 ASMR প্রসেসিং",
  music: "🎵 মিউজিক প্রসেসিং",
  social: "📱 সোশ্যাল মিডিয়া অপ্টিমাইজ",
  trim: "✂️ ট্রিম ও কাটাকাটি",
  volume: "🔊 ভলিউম অ্যাডজাস্ট",
  eq: "🎛️ EQ প্রসেসিং",
  denoise: "🔇 নয়েজ রিমুভাল",
  vocal: "🎤 ভোকাল প্রসেসিং",
  natural_clean: "✨ ন্যাচারাল ক্লিন",
  warm_voice: "🌡️ ওয়ার্ম ভয়েস",
  studio_clear: "🎚️ স্টুডিও ক্লিয়ার",
  soft_poetry: "🌸 সফট পোয়েট্রি",
  deep_recitation: "🎧 ডিপ রিসাইটেশন",
  youtube_voice: "🎥 YouTube ভয়েস",
  tiktok_voice: "🎤 TikTok ভয়েস",
  audiobook_voice: "🎧 অডিওবুক ভয়েস",
  meditation_voice: "🧘 মেডিটেশন ভয়েস",
  news_anchor: "🎤 নিউজ অ্যাঙ্কর",
  bangla_recitation_pro: "🎬 আবৃত্তি প্রো",
  golden_voice: "✨ গোল্ডেন ভয়েস",
  diamond_voice: "💎 ডায়মন্ড ভয়েস",
  velvet_voice: "🎭 ভেলভেট ভয়েস",
  ultra_clean_voice: "🔬 আল্ট্রা ক্লিন",
  perfect_master_studio: "🏆 স্টুডিও মাস্টার",
  perfect_master_broadcast: "📡 ব্রডকাস্ট মাস্টার",
  perfect_master_streaming: "▶️ স্ট্রিমিং মাস্টার",
  perfect_master_cinema: "🎬 সিনেমা মাস্টার",
};

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export function AudioResultCard({
  audioUrl,
  audioFilename,
  audioDescription,
  audioAppliedSteps = [],
  audioIntent,
  audioPipeline = [],
  audioTechnicalNote,
  originalAudioUrl,
  originalAudioName,
  outputSizeKB,
}: AudioResultCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [beforeAfterMode, setBeforeAfterMode] = useState<"after" | "before">("after");
  const [isDownloading, setIsDownloading] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const originalAudioRef = useRef<HTMLAudioElement>(null);

  const intentLabel = audioIntent ? (INTENT_LABELS[audioIntent] || "⚙️ কাস্টম প্রসেসিং") : null;
  const steps = audioAppliedSteps.length > 0 ? audioAppliedSteps : audioPipeline;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = audioFilename || "edited_audio.mp3";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => setIsDownloading(false), 1200);
    }
  };

  const handleDownloadOriginal = async () => {
    if (!originalAudioUrl) return;
    const a = document.createElement("a");
    a.href = originalAudioUrl;
    a.download = originalAudioName || "original_audio.mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const switchPlayer = (mode: "after" | "before") => {
    audioRef.current?.pause();
    originalAudioRef.current?.pause();
    setBeforeAfterMode(mode);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    if (audioRef.current) audioRef.current.playbackRate = speed;
    if (originalAudioRef.current) originalAudioRef.current.playbackRate = speed;
  };

  const handleCopyFilename = async () => {
    try {
      await navigator.clipboard.writeText(audioFilename || "edited_audio.mp3");
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {}
  };

  return (
    <div style={{
      background: "linear-gradient(145deg, rgba(11,19,34,0.98) 0%, rgba(8,15,28,0.98) 100%)",
      borderRadius: "3px 14px 14px 14px",
      padding: "12px 14px",
      border: "1px solid rgba(212,168,67,0.2)",
      borderLeft: "2.5px solid rgba(212,168,67,0.7)",
      boxShadow: "0 4px 18px rgba(0,0,0,0.35)",
      marginBottom: 8,
    }}>
      {/* Header: Intent Badge + Size + Speed */}
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {intentLabel && (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 10px",
            background: "rgba(212,168,67,0.12)",
            border: "1px solid rgba(212,168,67,0.35)",
            borderRadius: 20,
            color: "rgba(212,168,67,0.95)",
            fontSize: "0.62rem",
            fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
            fontWeight: 700,
            letterSpacing: "0.03em",
          }}>
            {intentLabel}
          </span>
        )}
        {outputSizeKB && (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 8px",
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.22)",
            borderRadius: 20,
            color: "rgba(165,180,252,0.8)",
            fontSize: "0.58rem",
            fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
            fontWeight: 600,
          }}>
            📦 {outputSizeKB < 1024 ? `${outputSizeKB} KB` : `${(outputSizeKB / 1024).toFixed(1)} MB`}
          </span>
        )}
        {/* Playback Speed Button */}
        <div style={{ position: "relative", marginLeft: "auto" }}>
          <button
            onClick={() => setShowSpeedMenu(v => !v)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              padding: "3px 8px",
              background: playbackSpeed !== 1.0 ? "rgba(212,168,67,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${playbackSpeed !== 1.0 ? "rgba(212,168,67,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 20,
              color: playbackSpeed !== 1.0 ? "rgba(212,168,67,0.9)" : "rgba(255,255,255,0.45)",
              fontSize: "0.58rem",
              fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            title="প্লেব্যাক গতি পরিবর্তন করুন"
          >
            ⚡ {playbackSpeed}x
          </button>
          {showSpeedMenu && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "110%",
              background: "rgba(11,19,34,0.98)",
              border: "1px solid rgba(212,168,67,0.25)",
              borderRadius: 10,
              padding: "4px 0",
              zIndex: 100,
              minWidth: 80,
              boxShadow: "0 4px 18px rgba(0,0,0,0.5)",
            }}>
              {SPEED_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "5px 12px",
                    background: s === playbackSpeed ? "rgba(212,168,67,0.12)" : "none",
                    border: "none",
                    color: s === playbackSpeed ? "rgba(212,168,67,0.95)" : "rgba(255,255,255,0.65)",
                    fontSize: "0.65rem",
                    fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    fontWeight: s === playbackSpeed ? 700 : 400,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  {s === 1.0 ? "1.0x (স্বাভাবিক)" : `${s}x`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Before / After Toggle */}
      {originalAudioUrl && (
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <button
            onClick={() => switchPlayer("before")}
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: 8,
              border: `1.5px solid ${beforeAfterMode === "before" ? "rgba(212,168,67,0.7)" : "rgba(255,255,255,0.1)"}`,
              background: beforeAfterMode === "before" ? "rgba(212,168,67,0.12)" : "rgba(255,255,255,0.04)",
              color: beforeAfterMode === "before" ? "rgba(212,168,67,0.95)" : "rgba(255,255,255,0.45)",
              fontSize: "0.65rem",
              fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            ⏮ আগে (Before)
          </button>
          <button
            onClick={() => switchPlayer("after")}
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: 8,
              border: `1.5px solid ${beforeAfterMode === "after" ? "rgba(34,197,94,0.7)" : "rgba(255,255,255,0.1)"}`,
              background: beforeAfterMode === "after" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
              color: beforeAfterMode === "after" ? "rgba(34,197,94,0.95)" : "rgba(255,255,255,0.45)",
              fontSize: "0.65rem",
              fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            ✅ পরে (After)
          </button>
        </div>
      )}

      {/* Audio Player */}
      <div style={{ marginBottom: 10 }}>
        {/* Before player */}
        {originalAudioUrl && beforeAfterMode === "before" && (
          <div>
            <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif", marginBottom: 4 }}>
              📁 মূল ফাইল: {originalAudioName || "original.mp3"}
            </div>
            <audio
              ref={originalAudioRef}
              controls
              src={originalAudioUrl}
              onLoadedMetadata={() => { if (originalAudioRef.current) originalAudioRef.current.playbackRate = playbackSpeed; }}
              style={{ width: "100%", height: 36, borderRadius: 8, outline: "none", accentColor: "#D4A843" }}
            />
          </div>
        )}
        {/* After player */}
        {beforeAfterMode === "after" && (
          <div>
            {originalAudioUrl && (
              <div style={{ fontSize: "0.6rem", color: "rgba(34,197,94,0.7)", fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif", marginBottom: 4 }}>
                ✅ এডিটেড ফাইল
              </div>
            )}
            <audio
              ref={audioRef}
              controls
              src={audioUrl}
              onLoadedMetadata={() => { if (audioRef.current) audioRef.current.playbackRate = playbackSpeed; }}
              style={{ width: "100%", height: 36, borderRadius: 8, outline: "none", accentColor: "#D4A843" }}
            />
          </div>
        )}
      </div>

      {/* Description */}
      {audioDescription && (
        <div style={{
          fontSize: "0.72rem",
          color: "rgba(255,255,255,0.75)",
          fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
          lineHeight: 1.65,
          marginBottom: 10,
          padding: "8px 10px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
          {audioDescription}
        </div>
      )}

      {/* Applied Steps (Report Card) */}
      {steps.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: "none",
              color: "rgba(212,168,67,0.75)",
              fontSize: "0.62rem",
              fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              padding: "4px 0",
              letterSpacing: "0.02em",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points={showDetails ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
            </svg>
            {showDetails ? "বিস্তারিত লুকাও" : `${steps.length}টি প্রসেসিং স্টেপ দেখুন`}
          </button>

          {showDetails && (
            <div style={{ marginTop: 6 }}>
              {steps.map((step, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 7,
                  padding: "5px 8px",
                  marginBottom: 3,
                  background: "rgba(212,168,67,0.05)",
                  borderRadius: 7,
                  border: "1px solid rgba(212,168,67,0.1)",
                }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "rgba(212,168,67,0.15)",
                    color: "rgba(212,168,67,0.9)",
                    fontSize: "0.52rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{
                    fontSize: "0.65rem",
                    color: "rgba(255,255,255,0.65)",
                    fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    lineHeight: 1.5,
                  }}>
                    {step}
                  </span>
                </div>
              ))}

              {/* Technical Note */}
              {audioTechnicalNote && (
                <div style={{
                  marginTop: 8,
                  padding: "6px 10px",
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid rgba(99,102,241,0.18)",
                  borderRadius: 8,
                  fontSize: "0.6rem",
                  color: "rgba(165,180,252,0.7)",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  lineHeight: 1.5,
                }}>
                  🔬 <strong>টেকনিক্যাল নোট:</strong> {audioTechnicalNote}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons Row */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {/* Download Edited */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          style={{
            flex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: "9px 14px",
            background: isDownloading
              ? "rgba(212,168,67,0.08)"
              : "linear-gradient(135deg, rgba(212,168,67,0.18) 0%, rgba(184,146,58,0.12) 100%)",
            border: `1.5px solid rgba(212,168,67,${isDownloading ? "0.2" : "0.5"})`,
            borderRadius: 10,
            color: isDownloading ? "rgba(212,168,67,0.4)" : "rgba(212,168,67,0.95)",
            fontSize: "0.7rem",
            fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
            fontWeight: 700,
            cursor: isDownloading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            letterSpacing: "0.02em",
          }}
        >
          {isDownloading ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              ডাউনলোড হচ্ছে...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              এডিটেড ডাউনলোড
            </>
          )}
        </button>

        {/* Copy filename */}
        <button
          onClick={handleCopyFilename}
          title="ফাইলনাম কপি করুন"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "9px 10px",
            background: copySuccess ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${copySuccess ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 10,
            color: copySuccess ? "rgba(34,197,94,0.9)" : "rgba(255,255,255,0.45)",
            fontSize: "0.65rem",
            fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {copySuccess ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              কপি!
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              নাম
            </>
          )}
        </button>

        {/* Download Original (if available) */}
        {originalAudioUrl && (
          <button
            onClick={handleDownloadOriginal}
            title="মূল ফাইল ডাউনলোড করুন"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: "9px 10px",
              background: "rgba(255,255,255,0.03)",
              border: "1.5px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              color: "rgba(255,255,255,0.35)",
              fontSize: "0.6rem",
              fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            মূল
          </button>
        )}
      </div>
    </div>
  );
}
