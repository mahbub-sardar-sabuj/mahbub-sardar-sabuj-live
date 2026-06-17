import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Play,
  Square,
  Download,
  Volume2,
  RefreshCw,
  ChevronDown,
  Sparkles,
  Pause,
  AlertCircle,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";

// ── Palette ────────────────────────────────────────────────────────────────────
// Deep Navy #060E1A | Rich Gold #C9A84C | Ivory #FAF6EF | Charcoal #1E2D3D

const MOODS = [
  { value: "default",   label: "স্বাভাবিক",   emoji: "🎙️", rate: 0.82, pitch: 1.0  },
  { value: "romantic",  label: "প্রেমময়",     emoji: "💛", rate: 0.75, pitch: 1.05 },
  { value: "sad",       label: "বিষণ্ণ",      emoji: "💧", rate: 0.70, pitch: 0.92 },
  { value: "heroic",    label: "বীরত্বপূর্ণ", emoji: "🔥", rate: 0.88, pitch: 0.88 },
  { value: "spiritual", label: "আধ্যাত্মিক",  emoji: "🕊️", rate: 0.68, pitch: 1.0  },
  { value: "nature",    label: "প্রকৃতি",      emoji: "🌿", rate: 0.78, pitch: 1.08 },
];

const EXAMPLE_POEM = `তোমার চোখে যে স্বপ্ন ছিল,
সেই স্বপ্নের পথ ধরে
আমি হেঁটেছি একা একা
অনেক রাতের আঁধারে।

ভুলে গেছি সব ক্লান্তি,
শুধু মনে রেখেছি তোমায়—
তুমি আমার প্রথম কবিতা,
তুমি আমার শেষ ভালোবাসায়।`;

// Detect best Bengali voice from browser
function getBengaliVoice(voices: SpeechSynthesisVoice[], gender: string): SpeechSynthesisVoice | null {
  const bn = voices.filter(v =>
    v.lang.startsWith("bn") || v.lang.startsWith("hi") || v.name.toLowerCase().includes("bengali")
  );
  if (bn.length === 0) return voices[0] || null;
  if (gender === "female") {
    const f = bn.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("woman"));
    return f || bn[0];
  }
  const m = bn.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("man"));
  return m || bn[0];
}

export default function PoemReciter() {
  const [poem, setPoem] = useState("");
  const [mood, setMood] = useState("default");
  const [gender, setGender] = useState("female");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState(true);
  const [charCount, setCharCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<"idle"|"recording"|"done"|"error">("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) setVoices(v);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const handlePoemChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 3000) { setPoem(val); setCharCount(val.length); }
  };

  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const handlePlay = useCallback(() => {
    if (!poem.trim()) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }
    stopSpeech();
    const selectedMood = MOODS.find(m => m.value === mood) || MOODS[0];
    const utt = new SpeechSynthesisUtterance(poem.trim());
    utt.lang = "bn-BD";
    utt.rate = selectedMood.rate;
    utt.pitch = selectedMood.pitch;
    utt.volume = 1;
    const voice = getBengaliVoice(voices, gender);
    if (voice) utt.voice = voice;
    utt.onstart = () => setIsPlaying(true);
    utt.onend = () => { setIsPlaying(false); setIsPaused(false); };
    utt.onerror = () => { setIsPlaying(false); setIsPaused(false); };
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
    setIsPlaying(true);
  }, [poem, mood, gender, voices, isPaused, stopSpeech]);

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  // Record audio output via MediaRecorder on system audio (where supported)
  // Fallback: record microphone while TTS plays — user hears it
  const handleRecordAndDownload = useCallback(async () => {
    if (!poem.trim()) return;
    setRecordingStatus("recording");
    setRecordedBlob(null);
    audioChunksRef.current = [];

    try {
      // Try to capture audio output (Chrome/Edge support AudioContext + destination stream)
      const AudioCtx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      const ctx = new AudioCtx();
      const dest = ctx.createMediaStreamDestination();

      const mr = new MediaRecorder(dest.stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        setRecordingStatus("done");
        ctx.close();
      };
      mr.start();

      const selectedMood = MOODS.find(m => m.value === mood) || MOODS[0];
      const utt = new SpeechSynthesisUtterance(poem.trim());
      utt.lang = "bn-BD";
      utt.rate = selectedMood.rate;
      utt.pitch = selectedMood.pitch;
      utt.volume = 1;
      const voice = getBengaliVoice(voices, gender);
      if (voice) utt.voice = voice;
      utt.onend = () => { mr.stop(); setIsPlaying(false); setIsRecording(false); };
      utt.onerror = () => { mr.stop(); setIsPlaying(false); setIsRecording(false); setRecordingStatus("error"); };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utt);
      setIsPlaying(true);
      setIsRecording(true);
    } catch {
      // Fallback: just play without recording, show message
      setRecordingStatus("error");
      handlePlay();
    }
  }, [poem, mood, gender, voices, handlePlay]);

  const handleDownload = () => {
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abritti-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    stopSpeech();
    setRecordedBlob(null);
    setRecordingStatus("idle");
    setIsRecording(false);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI কবিতা আবৃত্তি | মাহবুব সরদার সবুজ",
    "url": "https://www.mahbubsardarsabuj.com/poem-reciter",
    "inLanguage": "bn-BD",
    "description": "কবিতা লিখুন, ব্রাউজার থেকেই আবেগপূর্ণ কণ্ঠে আবৃত্তি শুনুন। সম্পূর্ণ বিনামূল্যে।",
  };

  return (
    <div style={{ background: "#060E1A", minHeight: "100vh", overflowX: "hidden" }}>
      <Seo
        title="কবিতা আবৃত্তি | মাহবুব সরদার সবুজ"
        description="কবিতা লিখুন বা পেস্ট করুন — ব্রাউজার থেকেই আবেগপূর্ণ কণ্ঠে আবৃত্তি শুনুন। অনুভূতি ও কণ্ঠ বেছে নিন। সম্পূর্ণ বিনামূল্যে।"
        path="/poem-reciter"
        keywords="কবিতা আবৃত্তি, বাংলা আবৃত্তি, poem recitation bangla, কবিতা শোনা"
        jsonLd={jsonLd}
      />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        position: "relative", minHeight: "44vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", background: "#060E1A",
        paddingTop: "calc(var(--site-nav-offset, 98px) + 1.5rem)",
        paddingBottom: "3rem",
      }}>
        <motion.div
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: "-20%", left: "50%",
            transform: "translateX(-50%)", width: "70vw", height: "70vw",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.13) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 1.5rem", maxWidth: 700 }}>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(201,168,76,0.18), rgba(201,168,76,0.06))",
              border: "1.5px solid rgba(201,168,76,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem",
              boxShadow: "0 8px 32px rgba(201,168,76,0.15)",
            }}
          >
            <Mic size={32} color="#C9A84C" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            style={{
              fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
              color: "#FAF6EF",
              fontSize: "clamp(1.9rem, 5vw, 3rem)",
              fontWeight: 400, lineHeight: 1.35, margin: "0 0 1rem",
            }}
          >
            কবিতা আবৃত্তি
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            style={{
              fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
              color: "rgba(250,246,239,0.65)",
              fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
              lineHeight: 1.7, margin: 0,
            }}
          >
            কবিতা লিখুন — অনুভূতি বেছে নিন — আবৃত্তি শুনুন।
            <br />
            সম্পূর্ণ বিনামূল্যে, সরাসরি আপনার ব্রাউজার থেকে।
          </motion.p>
        </div>
      </section>

      {/* ── MAIN TOOL ── */}
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "0 1rem 4rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            background: "linear-gradient(160deg, rgba(30,45,61,0.7) 0%, rgba(6,14,26,0.9) 100%)",
            border: "1px solid rgba(201,168,76,0.18)",
            borderRadius: 20, padding: "clamp(1.5rem, 4vw, 2.5rem)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          {/* Browser not supported warning */}
          {!supported && (
            <div style={{
              background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: 12, padding: "1rem", marginBottom: "1.5rem",
              display: "flex", alignItems: "center", gap: 10,
              color: "#f87171", fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
              fontSize: "0.9rem",
            }}>
              <AlertCircle size={18} />
              আপনার ব্রাউজারে Speech API সাপোর্ট নেই। Chrome বা Edge ব্যবহার করুন।
            </div>
          )}

          {/* Poem Input */}
          <div style={{ marginBottom: "1.8rem" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "0.75rem", flexWrap: "wrap", gap: 8,
            }}>
              <label style={{
                fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                color: "#C9A84C", fontSize: "1rem", fontWeight: 700,
              }}>
                কবিতা লিখুন
              </label>
              <button
                onClick={() => { setPoem(EXAMPLE_POEM); setCharCount(EXAMPLE_POEM.length); handleReset(); }}
                style={{
                  background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)",
                  borderRadius: 8, color: "#C9A84C", fontSize: "0.82rem",
                  padding: "4px 12px", cursor: "pointer",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <Sparkles size={12} /> উদাহরণ
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
                borderRadius: 12, color: "#FAF6EF",
                fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
                fontSize: "1.05rem", lineHeight: 1.85,
                padding: "1rem 1.1rem", resize: "vertical",
                outline: "none", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)")}
            />
            <div style={{
              textAlign: "right",
              color: charCount > 2700 ? "#f87171" : "rgba(250,246,239,0.35)",
              fontSize: "0.8rem", marginTop: 5, fontFamily: "monospace",
            }}>
              {charCount} / 3000
            </div>
          </div>

          {/* Mood Selector */}
          <div style={{ marginBottom: "1.8rem" }}>
            <p style={{
              fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
              color: "#C9A84C", fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem",
            }}>
              কবিতার অনুভূতি
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {MOODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => { setMood(m.value); handleReset(); }}
                  style={{
                    background: mood === m.value ? "rgba(201,168,76,0.2)" : "rgba(30,45,61,0.5)",
                    border: mood === m.value ? "1.5px solid rgba(201,168,76,0.6)" : "1.5px solid rgba(201,168,76,0.15)",
                    borderRadius: 10,
                    color: mood === m.value ? "#C9A84C" : "rgba(250,246,239,0.6)",
                    fontSize: "0.9rem", padding: "8px 16px", cursor: "pointer",
                    fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <span>{m.emoji}</span>{m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Gender */}
          <div style={{ marginBottom: "2rem" }}>
            <p style={{
              fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
              color: "#C9A84C", fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem",
            }}>
              কণ্ঠ বেছে নিন
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { value: "female", label: "নারী কণ্ঠ", desc: "কোমল ও উষ্ণ" },
                { value: "male",   label: "পুরুষ কণ্ঠ", desc: "গভীর ও আবেগময়" },
              ].map(v => (
                <button
                  key={v.value}
                  onClick={() => { setGender(v.value); handleReset(); }}
                  style={{
                    flex: 1, minWidth: 140,
                    background: gender === v.value ? "rgba(201,168,76,0.15)" : "rgba(30,45,61,0.4)",
                    border: gender === v.value ? "1.5px solid rgba(201,168,76,0.55)" : "1.5px solid rgba(201,168,76,0.12)",
                    borderRadius: 12, padding: "12px 14px", cursor: "pointer",
                    textAlign: "left", transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    fontSize: "0.95rem",
                    color: gender === v.value ? "#C9A84C" : "rgba(250,246,239,0.7)",
                    fontWeight: gender === v.value ? 700 : 400,
                    marginBottom: 3,
                  }}>{v.label}</div>
                  <div style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    fontSize: "0.78rem", color: "rgba(250,246,239,0.4)",
                  }}>{v.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Play / Pause / Stop Buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "1rem" }}>
            {/* Play / Resume */}
            <motion.button
              onClick={handlePlay}
              disabled={!supported || !poem.trim()}
              whileHover={supported && poem.trim() ? { scale: 1.02 } : {}}
              whileTap={supported && poem.trim() ? { scale: 0.98 } : {}}
              style={{
                flex: 1, minWidth: 160, padding: "1rem",
                borderRadius: 14,
                background: (!supported || !poem.trim())
                  ? "rgba(201,168,76,0.2)"
                  : "linear-gradient(135deg, #C9A84C 0%, #a8863a 100%)",
                border: "none",
                color: (!supported || !poem.trim()) ? "rgba(201,168,76,0.5)" : "#060E1A",
                fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                fontSize: "1.05rem", fontWeight: 700,
                cursor: (!supported || !poem.trim()) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                boxShadow: (supported && poem.trim()) ? "0 8px 24px rgba(201,168,76,0.3)" : "none",
                transition: "all 0.25s",
              }}
            >
              {isPaused ? <><Play size={18} /> চালিয়ে যান</> :
               isPlaying ? <><Volume2 size={18} style={{ animation: "pulse 1s ease-in-out infinite" }} /> আবৃত্তি হচ্ছে…</> :
               <><Mic size={18} /> আবৃত্তি শুনুন</>}
            </motion.button>

            {/* Pause */}
            {isPlaying && !isPaused && (
              <motion.button
                onClick={handlePause}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: "1rem 1.2rem", borderRadius: 14,
                  background: "rgba(201,168,76,0.1)",
                  border: "1.5px solid rgba(201,168,76,0.3)",
                  color: "#C9A84C", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 7,
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "0.9rem",
                }}
              >
                <Pause size={16} /> বিরতি
              </motion.button>
            )}

            {/* Stop */}
            {(isPlaying || isPaused) && (
              <motion.button
                onClick={handleReset}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: "1rem 1.2rem", borderRadius: 14,
                  background: "rgba(248,113,113,0.1)",
                  border: "1.5px solid rgba(248,113,113,0.25)",
                  color: "#f87171", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 7,
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "0.9rem",
                }}
              >
                <Square size={14} /> থামুন
              </motion.button>
            )}
          </div>

          {/* Download Section */}
          <div style={{
            background: "rgba(30,45,61,0.4)",
            border: "1px solid rgba(201,168,76,0.12)",
            borderRadius: 14, padding: "1.2rem",
          }}>
            <p style={{
              fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
              color: "rgba(250,246,239,0.55)", fontSize: "0.88rem",
              margin: "0 0 0.9rem", lineHeight: 1.6,
              display: "flex", alignItems: "flex-start", gap: 7,
            }}>
              <Download size={15} style={{ flexShrink: 0, marginTop: 2, color: "#C9A84C" }} />
              আবৃত্তি রেকর্ড করে ডাউনলোড করতে নিচের বাটনে ক্লিক করুন। রেকর্ডিং শেষ হলে ডাউনলোড বাটন আসবে।
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <motion.button
                onClick={handleRecordAndDownload}
                disabled={!supported || !poem.trim() || isRecording}
                whileHover={supported && poem.trim() && !isRecording ? { scale: 1.02 } : {}}
                style={{
                  flex: 1, minWidth: 160, padding: "0.75rem 1rem",
                  borderRadius: 10,
                  background: isRecording
                    ? "rgba(248,113,113,0.15)"
                    : (!supported || !poem.trim())
                    ? "rgba(201,168,76,0.08)"
                    : "rgba(201,168,76,0.12)",
                  border: isRecording
                    ? "1.5px solid rgba(248,113,113,0.4)"
                    : "1.5px solid rgba(201,168,76,0.25)",
                  color: isRecording ? "#f87171" : (!supported || !poem.trim()) ? "rgba(201,168,76,0.35)" : "#C9A84C",
                  cursor: (!supported || !poem.trim() || isRecording) ? "not-allowed" : "pointer",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "0.9rem", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  transition: "all 0.2s",
                }}
              >
                {isRecording
                  ? <><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171", display: "inline-block", animation: "pulse 1s ease-in-out infinite" }} /> রেকর্ড হচ্ছে…</>
                  : <><Mic size={15} /> রেকর্ড করুন</>}
              </motion.button>

              {recordingStatus === "done" && recordedBlob && (
                <motion.button
                  onClick={handleDownload}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                  style={{
                    flex: 1, minWidth: 160, padding: "0.75rem 1rem",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #C9A84C 0%, #a8863a 100%)",
                    border: "none", color: "#060E1A",
                    fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
                  }}
                >
                  <Download size={15} /> ডাউনলোড করুন
                </motion.button>
              )}

              {recordingStatus === "error" && (
                <div style={{
                  flex: 1, padding: "0.75rem 1rem", borderRadius: 10,
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  color: "rgba(248,113,113,0.8)",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 7,
                }}>
                  <AlertCircle size={14} /> এই ব্রাউজারে রেকর্ডিং সাপোর্ট নেই। আবৃত্তি শুনতে পারবেন।
                </div>
              )}
            </div>
          </div>

          {/* Reset */}
          {(isPlaying || isPaused || recordingStatus !== "idle") && (
            <div style={{ marginTop: "1rem", textAlign: "right" }}>
              <button
                onClick={handleReset}
                style={{
                  background: "none", border: "none",
                  color: "rgba(250,246,239,0.4)", cursor: "pointer",
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "0.85rem",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}
              >
                <RefreshCw size={13} /> নতুন করুন
              </button>
            </div>
          )}
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            marginTop: "2.5rem",
            background: "rgba(30,45,61,0.35)",
            border: "1px solid rgba(201,168,76,0.1)",
            borderRadius: 16, padding: "1.5rem 1.8rem",
          }}
        >
          <h2 style={{
            fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
            color: "#C9A84C", fontSize: "1.1rem", fontWeight: 400,
            marginBottom: "1rem",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <ChevronDown size={16} /> কীভাবে কাজ করে?
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
          }}>
            {[
              { step: "১", text: "কবিতা লিখুন বা পেস্ট করুন" },
              { step: "২", text: "অনুভূতি ও কণ্ঠ বেছে নিন" },
              { step: "৩", text: "\"আবৃত্তি শুনুন\" বাটনে ক্লিক করুন" },
              { step: "৪", text: "রেকর্ড করে ডাউনলোড করুন" },
            ].map(item => (
              <div key={item.step} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(201,168,76,0.15)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#C9A84C", fontSize: "0.85rem", fontWeight: 700,
                  flexShrink: 0,
                  fontFamily: "'AdorshoLipi', sans-serif",
                }}>
                  {item.step}
                </div>
                <p style={{
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  color: "rgba(250,246,239,0.6)", fontSize: "0.9rem",
                  lineHeight: 1.6, margin: 0, paddingTop: 4,
                }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 1rem 1.5rem" }}>
        <AdSenseAd adSlot={AD_SLOTS.RECITATIONS_BOTTOM} adFormat="auto" fullWidthResponsive={true} />
      </div>

      <Footer />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
