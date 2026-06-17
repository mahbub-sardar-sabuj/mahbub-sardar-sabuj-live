import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Play,
  Square,
  Download,
  Loader2,
  Volume2,
  RefreshCw,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useRef, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";

// ── Palette ────────────────────────────────────────────────────────────────────
// Deep Navy #060E1A | Rich Gold #C9A84C | Ivory #FAF6EF | Charcoal #1E2D3D

const MOODS = [
  { value: "default",   label: "স্বাভাবিক",   emoji: "🎙️" },
  { value: "romantic",  label: "প্রেমময়",     emoji: "💛" },
  { value: "sad",       label: "বিষণ্ণ",      emoji: "💧" },
  { value: "heroic",    label: "বীরত্বপূর্ণ", emoji: "🔥" },
  { value: "spiritual", label: "আধ্যাত্মিক",  emoji: "🕊️" },
  { value: "nature",    label: "প্রকৃতি",      emoji: "🌿" },
];

const VOICES = [
  { value: "male",    label: "পুরুষ কণ্ঠ",   desc: "গভীর ও আবেগময়" },
  { value: "female",  label: "নারী কণ্ঠ",    desc: "উষ্ণ ও কোমল" },
  { value: "neutral", label: "নিরপেক্ষ কণ্ঠ", desc: "মৃদু ও অনুভূতিশীল" },
];

const EXAMPLE_POEM = `তোমার চোখে যে স্বপ্ন ছিল,
সেই স্বপ্নের পথ ধরে
আমি হেঁটেছি একা একা
অনেক রাতের আঁধারে।

ভুলে গেছি সব ক্লান্তি,
শুধু মনে রেখেছি তোমায়—
তুমি আমার প্রথম কবিতা,
তুমি আমার শেষ ভালোবাসায়।`;

export default function PoemReciter() {
  const [poem, setPoem] = useState("");
  const [mood, setMood] = useState("default");
  const [voice, setVoice] = useState("male");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePoemChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 3000) {
      setPoem(val);
      setCharCount(val.length);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!poem.trim() || poem.trim().length < 5) {
      setError("অনুগ্রহ করে কবিতা লিখুন।");
      return;
    }
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setAudioBlob(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const res = await fetch("/api/poem-recite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poem: poem.trim(), mood, voice }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "আবৃত্তি তৈরি করতে সমস্যা হয়েছে।");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, [poem, mood, voice]);

  const handlePlayPause = () => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
      audio.onplay = () => setIsPlaying(true);
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleDownload = () => {
    if (!audioBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(audioBlob);
    a.download = `abritti-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setIsPlaying(false);
    setError(null);
  };

  const handleUseExample = () => {
    setPoem(EXAMPLE_POEM);
    setCharCount(EXAMPLE_POEM.length);
    setAudioUrl(null);
    setAudioBlob(null);
    setError(null);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI কবিতা আবৃত্তি | মাহবুব সরদার সবুজ",
    "url": "https://www.mahbubsardarsabuj.com/poem-reciter",
    "inLanguage": "bn-BD",
    "description": "কবিতা লিখুন, AI মানবিক ও আবেগপূর্ণ কণ্ঠে আবৃত্তি করে শোনাবে। ডাউনলোডও করা যাবে।",
    "applicationCategory": "UtilityApplication",
  };

  return (
    <div style={{ background: "#060E1A", minHeight: "100vh", overflowX: "hidden" }}>
      <Seo
        title="AI কবিতা আবৃত্তি | মাহবুব সরদার সবুজ"
        description="কবিতা লিখুন, AI মানবিক ও আবেগপূর্ণ বাংলা কণ্ঠে আবৃত্তি করে শোনাবে। প্রেম, বিষণ্ণতা, বীরত্ব — যেকোনো অনুভূতিতে। MP3 ডাউনলোডও করুন।"
        path="/poem-reciter"
        keywords="AI কবিতা আবৃত্তি, বাংলা আবৃত্তি AI, কবিতা শোনা, poem recitation AI, বাংলা TTS"
        jsonLd={jsonLd}
      />
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "44vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "#060E1A",
          paddingTop: "calc(var(--site-nav-offset, 98px) + 1.5rem)",
          paddingBottom: "3rem",
        }}
      >
        {/* Gold glow */}
        <motion.div
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "70vw",
            height: "70vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,168,76,0.13) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            padding: "0 1.5rem",
            maxWidth: 700,
          }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.06) 100%)",
              border: "1.5px solid rgba(201,168,76,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              boxShadow: "0 8px 32px rgba(201,168,76,0.15)",
            }}
          >
            <Mic size={32} color="#C9A84C" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            style={{
              fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
              color: "#FAF6EF",
              fontSize: "clamp(1.9rem, 5vw, 3rem)",
              fontWeight: 400,
              lineHeight: 1.35,
              margin: "0 0 1rem",
            }}
          >
            AI কবিতা আবৃত্তি
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            style={{
              fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
              color: "rgba(250,246,239,0.65)",
              fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            কবিতা লিখুন — AI মানবিক ও আবেগপূর্ণ কণ্ঠে আবৃত্তি করে শোনাবে।
            <br />
            অনুভূতি বেছে নিন, কণ্ঠ বেছে নিন, তারপর শুনুন ও ডাউনলোড করুন।
          </motion.p>
        </div>
      </section>

      {/* ── MAIN TOOL ─────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "0 1rem 4rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            background:
              "linear-gradient(160deg, rgba(30,45,61,0.7) 0%, rgba(6,14,26,0.9) 100%)",
            border: "1px solid rgba(201,168,76,0.18)",
            borderRadius: 20,
            padding: "clamp(1.5rem, 4vw, 2.5rem)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          {/* ── Poem Input ── */}
          <div style={{ marginBottom: "1.8rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <label
                style={{
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  color: "#C9A84C",
                  fontSize: "1rem",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                }}
              >
                কবিতা লিখুন
              </label>
              <button
                onClick={handleUseExample}
                style={{
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  borderRadius: 8,
                  color: "#C9A84C",
                  fontSize: "0.82rem",
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  transition: "background 0.2s",
                }}
              >
                <Sparkles size={12} /> উদাহরণ ব্যবহার করুন
              </button>
            </div>
            <textarea
              value={poem}
              onChange={handlePoemChange}
              placeholder="এখানে কবিতা লিখুন বা পেস্ট করুন…"
              rows={10}
              style={{
                width: "100%",
                background: "rgba(6,14,26,0.7)",
                border: "1.5px solid rgba(201,168,76,0.2)",
                borderRadius: 12,
                color: "#FAF6EF",
                fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
                fontSize: "1.05rem",
                lineHeight: 1.85,
                padding: "1rem 1.1rem",
                resize: "vertical",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)")
              }
            />
            <div
              style={{
                textAlign: "right",
                color:
                  charCount > 2700
                    ? "#f87171"
                    : "rgba(250,246,239,0.35)",
                fontSize: "0.8rem",
                marginTop: 5,
                fontFamily: "monospace",
              }}
            >
              {charCount} / 3000
            </div>
          </div>

          {/* ── Mood Selector ── */}
          <div style={{ marginBottom: "1.8rem" }}>
            <p
              style={{
                fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                color: "#C9A84C",
                fontSize: "1rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
              }}
            >
              কবিতার অনুভূতি
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  style={{
                    background:
                      mood === m.value
                        ? "rgba(201,168,76,0.2)"
                        : "rgba(30,45,61,0.5)",
                    border:
                      mood === m.value
                        ? "1.5px solid rgba(201,168,76,0.6)"
                        : "1.5px solid rgba(201,168,76,0.15)",
                    borderRadius: 10,
                    color: mood === m.value ? "#C9A84C" : "rgba(250,246,239,0.6)",
                    fontSize: "0.9rem",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Voice Selector ── */}
          <div style={{ marginBottom: "2rem" }}>
            <p
              style={{
                fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                color: "#C9A84C",
                fontSize: "1rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
              }}
            >
              কণ্ঠ বেছে নিন
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 10,
              }}
            >
              {VOICES.map((v) => (
                <button
                  key={v.value}
                  onClick={() => setVoice(v.value)}
                  style={{
                    background:
                      voice === v.value
                        ? "rgba(201,168,76,0.15)"
                        : "rgba(30,45,61,0.4)",
                    border:
                      voice === v.value
                        ? "1.5px solid rgba(201,168,76,0.55)"
                        : "1.5px solid rgba(201,168,76,0.12)",
                    borderRadius: 12,
                    color: voice === v.value ? "#FAF6EF" : "rgba(250,246,239,0.55)",
                    padding: "12px 14px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      fontSize: "0.95rem",
                      fontWeight: voice === v.value ? 700 : 400,
                      color: voice === v.value ? "#C9A84C" : "rgba(250,246,239,0.7)",
                      marginBottom: 3,
                    }}
                  >
                    {v.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.78rem",
                      color: "rgba(250,246,239,0.4)",
                    }}
                  >
                    {v.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Generate Button ── */}
          <motion.button
            onClick={handleGenerate}
            disabled={loading || !poem.trim()}
            whileHover={!loading && poem.trim() ? { scale: 1.02 } : {}}
            whileTap={!loading && poem.trim() ? { scale: 0.98 } : {}}
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: 14,
              background:
                loading || !poem.trim()
                  ? "rgba(201,168,76,0.2)"
                  : "linear-gradient(135deg, #C9A84C 0%, #a8863a 100%)",
              border: "none",
              color: loading || !poem.trim() ? "rgba(201,168,76,0.5)" : "#060E1A",
              fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: loading || !poem.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "all 0.25s",
              boxShadow:
                !loading && poem.trim()
                  ? "0 8px 24px rgba(201,168,76,0.3)"
                  : "none",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                আবৃত্তি তৈরি হচ্ছে…
              </>
            ) : (
              <>
                <Mic size={20} />
                আবৃত্তি শুনুন
              </>
            )}
          </motion.button>

          {/* ── Error ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: "1rem",
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.3)",
                  borderRadius: 10,
                  padding: "0.75rem 1rem",
                  color: "#f87171",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "0.9rem",
                  textAlign: "center",
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Audio Player ── */}
          <AnimatePresence>
            {audioUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  marginTop: "1.8rem",
                  background:
                    "linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(30,45,61,0.6) 100%)",
                  border: "1.5px solid rgba(201,168,76,0.3)",
                  borderRadius: 16,
                  padding: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: "1.2rem",
                  }}
                >
                  <Volume2 size={18} color="#C9A84C" />
                  <span
                    style={{
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      color: "#C9A84C",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                    }}
                  >
                    আবৃত্তি প্রস্তুত
                  </span>
                </div>

                {/* Native audio player */}
                <audio
                  src={audioUrl}
                  controls
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    marginBottom: "1rem",
                    accentColor: "#C9A84C",
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <motion.button
                    onClick={handleDownload}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1,
                      minWidth: 140,
                      padding: "0.75rem 1rem",
                      borderRadius: 10,
                      background:
                        "linear-gradient(135deg, #C9A84C 0%, #a8863a 100%)",
                      border: "none",
                      color: "#060E1A",
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                      boxShadow: "0 4px 16px rgba(201,168,76,0.25)",
                    }}
                  >
                    <Download size={16} />
                    MP3 ডাউনলোড
                  </motion.button>

                  <motion.button
                    onClick={handleReset}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: "0.75rem 1.2rem",
                      borderRadius: 10,
                      background: "rgba(30,45,61,0.6)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      color: "rgba(250,246,239,0.6)",
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <RefreshCw size={15} />
                    নতুন করুন
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── How it works ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            marginTop: "2.5rem",
            background: "rgba(30,45,61,0.35)",
            border: "1px solid rgba(201,168,76,0.1)",
            borderRadius: 16,
            padding: "1.5rem 1.8rem",
          }}
        >
          <h2
            style={{
              fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
              color: "#C9A84C",
              fontSize: "1.1rem",
              fontWeight: 400,
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ChevronDown size={16} /> কীভাবে কাজ করে?
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              { step: "১", text: "কবিতা লিখুন বা পেস্ট করুন" },
              { step: "২", text: "অনুভূতি ও কণ্ঠ বেছে নিন" },
              { step: "৩", text: "\"আবৃত্তি শুনুন\" বাটনে ক্লিক করুন" },
              { step: "৪", text: "শুনুন এবং MP3 ডাউনলোড করুন" },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(201,168,76,0.15)",
                    border: "1px solid rgba(201,168,76,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#C9A84C",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    fontFamily: "'AdorshoLipi', sans-serif",
                  }}
                >
                  {item.step}
                </div>
                <p
                  style={{
                    fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    color: "rgba(250,246,239,0.6)",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    margin: 0,
                    paddingTop: 4,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── AdSense ── */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 1rem 1.5rem" }}>
        <AdSenseAd
          adSlot={AD_SLOTS.RECITATIONS_BOTTOM}
          adFormat="auto"
          fullWidthResponsive={true}
        />
      </div>

      <Footer />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
