/**
 * TextToSpeech.tsx — আবৃত্তি টুল
 * Design: Ink & Gold — Literary Premium
 * Feature: AI-powered Bengali TTS with human-like voice, download support
 */
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic2, Play, Pause, Download, Loader2, AlertCircle,
  RefreshCw, Volume2, ChevronDown, Sparkles, Music2,
  Square, Copy, Check
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

// ── Voice catalog (from TTS skill) ──────────────────────────────────────────
const VOICES = [
  // ── নারী কণ্ঠ ──
  { id: "Sulafat", label: "সুলাফাত", desc: "উষ্ণ ও আন্তরিক", gender: "female", emoji: "🌸" },
  { id: "Despina", label: "দেসপিনা", desc: "মিষ্টি ও আমন্ত্রণমূলক", gender: "female", emoji: "💛" },
  { id: "Aoede", label: "আওয়েদে", desc: "চিন্তাশীল ও প্রাণবন্ত", gender: "female", emoji: "🎵" },
  { id: "Leda", label: "লেডা", desc: "পরিশীলিত ও আত্মবিশ্বাসী", gender: "female", emoji: "👑" },
  { id: "Vindemiatrix", label: "ভিন্দেমিয়াট্রিক্স", desc: "শান্ত ও পরিপক্ব", gender: "female", emoji: "🌿" },
  { id: "Gacrux", label: "গ্যাক্রাক্স", desc: "গভীর ও আবেগময়", gender: "female", emoji: "🌙" },
  { id: "Kore", label: "কোরে", desc: "প্রাণবন্ত ও উজ্জ্বল", gender: "female", emoji: "⭐" },
  { id: "Zephyr", label: "জেফির", desc: "উচ্ছল ও তারুণ্যময়", gender: "female", emoji: "🌬️" },
  { id: "Achernar", label: "আচেরনার", desc: "নরম ও মধুর", gender: "female", emoji: "✨" },
  { id: "Laomedeia", label: "লাওমেডিয়া", desc: "কৌতূহলী ও উদ্যমী", gender: "female", emoji: "🔮" },
  // ── পুরুষ কণ্ঠ ──
  { id: "Orus", label: "ওরাস", desc: "গভীর ও প্রজ্ঞাময়", gender: "male", emoji: "🌌" },
  { id: "Rasalgethi", label: "রাসালগেথি", desc: "উষ্ণ ও বিশ্বস্ত", gender: "male", emoji: "📖" },
  { id: "Fenrir", label: "ফেনরির", desc: "বন্ধুত্বপূর্ণ ও স্পষ্ট", gender: "male", emoji: "🔥" },
  { id: "Algieba", label: "আলজিবা", desc: "মসৃণ ও প্রবাহমান", gender: "male", emoji: "🎭" },
  { id: "Puck", label: "পাক", desc: "সরাসরি ও আন্তরিক", gender: "male", emoji: "🎯" },
  { id: "Achird", label: "আচির্ড", desc: "তরুণ ও উৎসাহী", gender: "male", emoji: "🤝" },
  { id: "Sadachbia", label: "সাদাচবিয়া", desc: "গভীর ও ব্যক্তিত্বময়", gender: "male", emoji: "🎸" },
  { id: "Autonoe", label: "অটোনোয়ে", desc: "পরিপক্ব ও গম্ভীর", gender: "male", emoji: "🦅" },
  { id: "Umbriel", label: "আমব্রিয়েল", desc: "কর্তৃত্বপূর্ণ ও উষ্ণ", gender: "male", emoji: "🌊" },
  { id: "Iapetus", label: "ইয়াপেটাস", desc: "শক্তিশালী ও গম্ভীর", gender: "male", emoji: "⚡" },
];

const STYLE_PRESETS = [
  {
    id: "recitation",
    label: "আবৃত্তি",
    icon: "🎙️",
    desc: "কবিতা আবৃত্তির ধাঁচে",
    prompt: "You are a deeply emotional Bengali poet reading your own poem aloud. Speak in natural, human Bengali — not robotic, not AI-like. Let your voice tremble slightly with feeling. Take real, natural breaths between lines. Pause meaningfully at commas and line breaks. Emphasize words that carry pain, longing, or love. Your voice should feel like a real person who has lived through what they are reading. Never sound mechanical or uniform — vary your pace, your pitch, your breath. This is a human heart speaking.",
  },
  {
    id: "story",
    label: "গল্প পাঠ",
    icon: "📖",
    desc: "গল্প বলার ভঙ্গিতে",
    prompt: "You are a warm, gifted Bengali storyteller speaking to a close friend. Your voice is completely natural and human — with real pauses, gentle sighs, and a conversational rhythm. Vary your pace: slow down for emotional moments, speed up for excitement. Let your voice smile when the story is joyful, and soften when it turns sad. Never sound like a machine reading text — sound like a real person who loves telling stories.",
  },
  {
    id: "news",
    label: "সংবাদ পাঠ",
    icon: "📰",
    desc: "সংবাদ পাঠকের কণ্ঠে",
    prompt: "You are a professional Bengali news anchor with a warm, human voice. Speak clearly and confidently, with natural breathing and measured pacing. Your voice carries authority but also warmth — like a trusted person delivering important news. Pronounce each word crisply but naturally, never robotic. Maintain a steady, calm rhythm with brief natural pauses between sentences.",
  },
  {
    id: "soft",
    label: "কোমল কণ্ঠ",
    icon: "🌸",
    desc: "নরম ও মৃদু স্বরে",
    prompt: "You are a gentle, loving person speaking softly to someone who needs comfort. Your voice is barely above a whisper — warm, tender, and deeply human. Breathe naturally and slowly. Speak each word with care, as if each syllable is a gentle touch. Let there be soft, natural pauses. Your voice should feel like a warm embrace — completely real, completely human, full of quiet love.",
  },
  {
    id: "dramatic",
    label: "নাটকীয়",
    icon: "🎭",
    desc: "আবেগময় ও নাটকীয়",
    prompt: "You are a passionate Bengali stage actor delivering a powerful, emotional monologue. Your voice is raw, human, and deeply felt — not theatrical in a fake way, but genuinely moved. Let your voice crack slightly at painful moments. Build intensity gradually. Use dramatic pauses that feel earned. Vary your volume — sometimes loud and powerful, sometimes dropping to a near-whisper for impact. This is real human emotion, not performance.",
  },
  {
    id: "natural",
    label: "স্বাভাবিক",
    icon: "💬",
    desc: "সাধারণ কথোপকথনের মতো",
    prompt: "You are simply a real person having a natural conversation in Bengali. Speak exactly as a human would — with natural hesitations, gentle breathing, varied pace, and authentic emotion. Do not sound like AI or a voice assistant. Sound like someone's friend, neighbor, or family member speaking from the heart. Be completely relaxed, genuine, and human in every way.",
  },
];

// ── Waveform visualizer ──────────────────────────────────────────────────────
function WaveformBars({ isPlaying }: { isPlaying: boolean }) {
  const bars = Array.from({ length: 32 }, (_, i) => i);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 48 }}>
      {bars.map((i) => (
        <motion.div
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            background: `linear-gradient(180deg, #D4A843 0%, #C9A84C80 100%)`,
            transformOrigin: "bottom",
          }}
          animate={isPlaying ? {
            height: [8, Math.random() * 32 + 8, 8],
            opacity: [0.6, 1, 0.6],
          } : {
            height: 6,
            opacity: 0.3,
          }}
          transition={isPlaying ? {
            duration: 0.4 + Math.random() * 0.4,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.03,
          } : { duration: 0.3 }}
        />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const MAX_CHARS = 5000;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setText(val);
      setCharCount(val.length);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      setError("অনুগ্রহ করে কিছু লিখুন।");
      return;
    }
    if (text.trim().length < 2) {
      setError("কমপক্ষে ২টি অক্ষর লিখুন।");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);
    setAudioBlob(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const startTime = Date.now();

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          voice: selectedVoice.id,
          language: "bn-BD",
          style: selectedStyle.prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "আবৃত্তি তৈরি করতে ব্যর্থ হয়েছে।");
      }

      if (!data.audioData) {
        throw new Error("অডিও ডেটা পাওয়া যায়নি।");
      }

      // Convert base64 to blob - Clean the base64 string first to avoid pattern matching errors
      const base64Data = data.audioData.replace(/\s/g, "");
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.mimeType || "audio/wav" });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      setAudioBlob(blob);
      setGenerationTime(Math.round((Date.now() - startTime) / 100) / 10);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "অজানা ত্রুটি হয়েছে।";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }, [text, selectedVoice, selectedStyle]);

  const handlePlayPause = useCallback(() => {
    if (!audioUrl) return;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    }
  }, [audioUrl, isPlaying]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!audioBlob) return;
    const a = document.createElement("a");
    const url = URL.createObjectURL(audioBlob);
    a.href = url;
    // Generate filename from first few words of text
    const words = text.trim().split(/\s+/).slice(0, 4).join("_").replace(/[^\u0980-\u09FF\w]/g, "");
    a.download = `আবৃত্তি_${words || "audio"}_${selectedVoice.label}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [audioBlob, text, selectedVoice]);

  const handleCopyText = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  const handleReset = useCallback(() => {
    setText("");
    setCharCount(0);
    setAudioUrl(null);
    setAudioBlob(null);
    setError(null);
    setIsPlaying(false);
    setGenerationTime(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    textareaRef.current?.focus();
  }, []);

  const femaleVoices = VOICES.filter(v => v.gender === "female");
  const maleVoices = VOICES.filter(v => v.gender === "male");

  return (
    <>
      <Seo
        title="আবৃত্তি টুল — লেখা থেকে মানুষের কণ্ঠে অডিও | মাহবুব সরদার সবুজ"
        description="বাংলা লেখা দিন, AI মানুষের মতো আবৃত্তি করে দেবে। কবিতা, গল্প, যেকোনো লেখা — ডাউনলোড করুন বিনামূল্যে।"
        path="/text-to-speech"
        keywords="আবৃত্তি টুল, বাংলা TTS, text to speech বাংলা, AI আবৃত্তি, বাংলা কণ্ঠ, কবিতা আবৃত্তি"
      />
      <Navbar />

      <div style={{ minHeight: "100vh", background: "#060E1A", paddingTop: "var(--site-nav-offset, 70px)" }}>
        {/* ── Hero Header ── */}
        <div style={{
          background: "linear-gradient(180deg, rgba(212,168,67,0.06) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(212,168,67,0.1)",
          padding: "40px 24px 32px",
          textAlign: "center",
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.25)",
              borderRadius: 20, padding: "6px 16px", marginBottom: 16,
            }}>
              <Sparkles size={14} color="#D4A843" />
              <span style={{ color: "#D4A843", fontSize: "0.78rem", fontFamily: "'Noto Sans Bengali', sans-serif", fontWeight: 600 }}>
                AI আবৃত্তি টুল
              </span>
            </div>

            <h1 style={{
              fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              background: "linear-gradient(135deg, #E8C97A 0%, #D4A843 50%, #C49030 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: "0 0 12px",
              lineHeight: 1.2,
            }}>
              লেখা থেকে আবৃত্তি
            </h1>

            <p style={{
              color: "rgba(250,246,239,0.65)",
              fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
              fontFamily: "'Noto Sans Bengali', sans-serif",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.7,
            }}>
              কবিতা, গল্প বা যেকোনো বাংলা লেখা দিন — AI মানুষের মতো কণ্ঠে আবৃত্তি করবে এবং ডাউনলোড করতে পারবেন
            </p>
          </motion.div>
        </div>

        {/* ── Main Content ── */}
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px 80px" }}>
          <div style={{ display: "grid", gap: 20 }}>

            {/* ── Text Input Card ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(212,168,67,0.15)",
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(212,168,67,0.08)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Mic2 size={16} color="#D4A843" />
                  <span style={{ color: "#E8C97A", fontFamily: "'Noto Sans Bengali', sans-serif", fontWeight: 600, fontSize: "0.9rem" }}>
                    আপনার লেখা
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {text && (
                    <button
                      onClick={handleCopyText}
                      style={{
                        background: "none", border: "1px solid rgba(212,168,67,0.2)",
                        borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 4,
                        color: copied ? "#4ade80" : "rgba(232,201,122,0.7)",
                        fontSize: "0.75rem", fontFamily: "'Noto Sans Bengali', sans-serif",
                        transition: "all 0.2s",
                      }}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? "কপি হয়েছে" : "কপি"}
                    </button>
                  )}
                  <span style={{
                    color: charCount > MAX_CHARS * 0.9 ? "#f87171" : "rgba(250,246,239,0.35)",
                    fontSize: "0.75rem", fontFamily: "monospace",
                  }}>
                    {charCount}/{MAX_CHARS}
                  </span>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                placeholder="এখানে বাংলা কবিতা, গল্প বা যেকোনো লেখা লিখুন অথবা পেস্ট করুন...&#10;&#10;উদাহরণ:&#10;আমার সোনার বাংলা, আমি তোমায় ভালোবাসি&#10;চিরদিন তোমার আকাশ, তোমার বাতাস, আমার প্রাণে বাজায় বাঁশি।"
                style={{
                  width: "100%",
                  minHeight: 200,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#FAF6EF",
                  fontSize: "1rem",
                  fontFamily: "'AdorshoLipi', 'Tiro Bangla', 'Noto Sans Bengali', serif",
                  lineHeight: 1.8,
                  padding: "16px 20px",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </motion.div>

            {/* ── Style Presets ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <Music2 size={14} color="#D4A843" />
                <span style={{ color: "rgba(232,201,122,0.8)", fontSize: "0.82rem", fontFamily: "'Noto Sans Bengali', sans-serif", fontWeight: 600 }}>
                  পাঠের ধরন
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedStyle(preset)}
                    style={{
                      background: selectedStyle.id === preset.id
                        ? "linear-gradient(135deg, rgba(212,168,67,0.2) 0%, rgba(212,168,67,0.1) 100%)"
                        : "rgba(255,255,255,0.03)",
                      border: selectedStyle.id === preset.id
                        ? "1px solid rgba(212,168,67,0.5)"
                        : "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 10,
                      padding: "10px 12px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontSize: "1.1rem", marginBottom: 4 }}>{preset.icon}</div>
                    <div style={{
                      color: selectedStyle.id === preset.id ? "#E8C97A" : "rgba(250,246,239,0.8)",
                      fontSize: "0.82rem",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontWeight: selectedStyle.id === preset.id ? 700 : 400,
                      marginBottom: 2,
                    }}>
                      {preset.label}
                    </div>
                    <div style={{ color: "rgba(250,246,239,0.4)", fontSize: "0.7rem", fontFamily: "'Noto Sans Bengali', sans-serif" }}>
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ── Voice Selection ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <Volume2 size={14} color="#D4A843" />
                <span style={{ color: "rgba(232,201,122,0.8)", fontSize: "0.82rem", fontFamily: "'Noto Sans Bengali', sans-serif", fontWeight: 600 }}>
                  কণ্ঠ নির্বাচন
                </span>
              </div>

              {/* Custom dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(212,168,67,0.2)",
                    borderRadius: 10,
                    padding: "12px 16px",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    color: "#FAF6EF",
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.2rem" }}>{selectedVoice.emoji}</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#E8C97A" }}>{selectedVoice.label}</div>
                      <div style={{ fontSize: "0.72rem", color: "rgba(250,246,239,0.5)" }}>{selectedVoice.desc} · {selectedVoice.gender === "female" ? "নারী কণ্ঠ" : "পুরুষ কণ্ঠ"}</div>
                    </div>
                  </div>
                  <ChevronDown size={16} color="rgba(212,168,67,0.6)" style={{ transform: showVoiceDropdown ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                </button>

                <AnimatePresence>
                  {showVoiceDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                        background: "#0D1B2A",
                        border: "1px solid rgba(212,168,67,0.2)",
                        borderRadius: 10,
                        overflow: "hidden",
                        zIndex: 50,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                      }}
                    >
                      {/* Female voices */}
                      <div style={{ padding: "8px 12px 4px", color: "rgba(212,168,67,0.6)", fontSize: "0.7rem", fontFamily: "'Noto Sans Bengali', sans-serif", fontWeight: 600, letterSpacing: "0.05em" }}>
                        🌸 নারী কণ্ঠ
                      </div>
                      {femaleVoices.map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => { setSelectedVoice(voice); setShowVoiceDropdown(false); }}
                          style={{
                            width: "100%", background: selectedVoice.id === voice.id ? "rgba(212,168,67,0.1)" : "transparent",
                            border: "none", padding: "10px 16px", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 10,
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(212,168,67,0.08)")}
                          onMouseLeave={e => (e.currentTarget.style.background = selectedVoice.id === voice.id ? "rgba(212,168,67,0.1)" : "transparent")}
                        >
                          <span style={{ fontSize: "1rem" }}>{voice.emoji}</span>
                          <div style={{ textAlign: "left" }}>
                            <div style={{ color: selectedVoice.id === voice.id ? "#E8C97A" : "#FAF6EF", fontSize: "0.85rem", fontFamily: "'Noto Sans Bengali', sans-serif", fontWeight: selectedVoice.id === voice.id ? 600 : 400 }}>{voice.label}</div>
                            <div style={{ color: "rgba(250,246,239,0.4)", fontSize: "0.7rem", fontFamily: "'Noto Sans Bengali', sans-serif" }}>{voice.desc}</div>
                          </div>
                        </button>
                      ))}
                      {/* Male voices */}
                      <div style={{ padding: "8px 12px 4px", color: "rgba(212,168,67,0.6)", fontSize: "0.7rem", fontFamily: "'Noto Sans Bengali', sans-serif", fontWeight: 600, letterSpacing: "0.05em", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 4 }}>
                        🦁 পুরুষ কণ্ঠ
                      </div>
                      {maleVoices.map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => { setSelectedVoice(voice); setShowVoiceDropdown(false); }}
                          style={{
                            width: "100%", background: selectedVoice.id === voice.id ? "rgba(212,168,67,0.1)" : "transparent",
                            border: "none", padding: "10px 16px", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 10,
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(212,168,67,0.08)")}
                          onMouseLeave={e => (e.currentTarget.style.background = selectedVoice.id === voice.id ? "rgba(212,168,67,0.1)" : "transparent")}
                        >
                          <span style={{ fontSize: "1rem" }}>{voice.emoji}</span>
                          <div style={{ textAlign: "left" }}>
                            <div style={{ color: selectedVoice.id === voice.id ? "#E8C97A" : "#FAF6EF", fontSize: "0.85rem", fontFamily: "'Noto Sans Bengali', sans-serif", fontWeight: selectedVoice.id === voice.id ? 600 : 400 }}>{voice.label}</div>
                            <div style={{ color: "rgba(250,246,239,0.4)", fontSize: "0.7rem", fontFamily: "'Noto Sans Bengali', sans-serif" }}>{voice.desc}</div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* ── Generate Button ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                style={{
                  width: "100%",
                  padding: "16px 24px",
                  background: isGenerating || !text.trim()
                    ? "rgba(212,168,67,0.15)"
                    : "linear-gradient(135deg, #D4A843 0%, #E8C97A 50%, #C49030 100%)",
                  border: "none",
                  borderRadius: 12,
                  cursor: isGenerating || !text.trim() ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  color: isGenerating || !text.trim() ? "rgba(212,168,67,0.5)" : "#060E1A",
                  fontSize: "1rem",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  fontWeight: 700,
                  transition: "all 0.3s",
                  boxShadow: isGenerating || !text.trim() ? "none" : "0 4px 24px rgba(212,168,67,0.35)",
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                    আবৃত্তি তৈরি হচ্ছে...
                  </>
                ) : (
                  <>
                    <Mic2 size={20} />
                    আবৃত্তি তৈরি করুন
                  </>
                )}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </motion.div>

            {/* ── Error ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    background: "rgba(248,113,113,0.1)",
                    border: "1px solid rgba(248,113,113,0.3)",
                    borderRadius: 10,
                    padding: "12px 16px",
                    display: "flex", alignItems: "flex-start", gap: 10,
                  }}
                >
                  <AlertCircle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ color: "#fca5a5", fontSize: "0.88rem", fontFamily: "'Noto Sans Bengali', sans-serif" }}>
                    {error}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Audio Player & Download ── */}
            <AnimatePresence>
              {audioUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                  style={{
                    background: "linear-gradient(135deg, rgba(212,168,67,0.08) 0%, rgba(212,168,67,0.04) 100%)",
                    border: "1px solid rgba(212,168,67,0.25)",
                    borderRadius: 16,
                    padding: "24px 20px",
                  }}
                >
                  {/* Success header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: "rgba(74,222,128,0.15)",
                        border: "1px solid rgba(74,222,128,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Mic2 size={16} color="#4ade80" />
                      </div>
                      <div>
                        <div style={{ color: "#4ade80", fontSize: "0.85rem", fontFamily: "'Noto Sans Bengali', sans-serif", fontWeight: 600 }}>
                          আবৃত্তি প্রস্তুত!
                        </div>
                        {generationTime && (
                          <div style={{ color: "rgba(250,246,239,0.4)", fontSize: "0.7rem", fontFamily: "monospace" }}>
                            {generationTime}s · {selectedVoice.label} · {selectedStyle.label}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleReset}
                      style={{
                        background: "none", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                        color: "rgba(250,246,239,0.5)", fontSize: "0.75rem",
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        display: "flex", alignItems: "center", gap: 4,
                      }}
                    >
                      <RefreshCw size={12} />
                      নতুন
                    </button>
                  </div>

                  {/* Waveform */}
                  <div style={{
                    background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "12px 16px",
                    marginBottom: 16,
                  }}>
                    <WaveformBars isPlaying={isPlaying} />
                  </div>

                  {/* Controls */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <button
                      onClick={handlePlayPause}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: isPlaying
                          ? "rgba(212,168,67,0.15)"
                          : "linear-gradient(135deg, #D4A843 0%, #E8C97A 100%)",
                        border: isPlaying ? "1px solid rgba(212,168,67,0.4)" : "none",
                        borderRadius: 10,
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        color: isPlaying ? "#E8C97A" : "#060E1A",
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        transition: "all 0.2s",
                      }}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                      {isPlaying ? "বিরতি" : "শুনুন"}
                    </button>

                    {isPlaying && (
                      <button
                        onClick={handleStop}
                        style={{
                          padding: "12px 16px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 10,
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "rgba(250,246,239,0.6)",
                          transition: "all 0.2s",
                        }}
                      >
                        <Square size={16} />
                      </button>
                    )}

                    <button
                      onClick={handleDownload}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "rgba(74,222,128,0.1)",
                        border: "1px solid rgba(74,222,128,0.3)",
                        borderRadius: 10,
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        color: "#4ade80",
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(74,222,128,0.18)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(74,222,128,0.1)")}
                    >
                      <Download size={18} />
                      ডাউনলোড
                    </button>
                  </div>

                  {/* Native audio player as fallback */}
                  <audio
                    src={audioUrl}
                    controls
                    style={{ width: "100%", borderRadius: 8, opacity: 0.7 }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>



          </div>
        </div>
      </div>
    </>
  );
}
