import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Music, Play, Pause, Download, Loader2, CheckCircle,
  AlertCircle, X, Wand2, Volume2, Mic, Sparkles, RefreshCw,
  ChevronDown, ChevronUp, Info, Star, Zap, Shield, Headphones,
  Radio, Waves, Film, BookOpen, MessageSquare, Cpu
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

// ── Types ──────────────────────────────────────────────────────────────────────
interface AudioInfo {
  file: File;
  name: string;
  size: number;
  url: string;
}

interface ProcessResult {
  audioUrl: string;
  audioFilename: string;
  description: string;
  appliedSteps: string[];
  pipeline: string[];
  intent: string;
  technicalNote?: string;
  outputSizeKB?: number;
}

// ── Preset categories ──────────────────────────────────────────────────────────
const PRESETS = [
  {
    category: "🎙️ ভয়েস ক্লিনআপ",
    items: [
      { label: "নয়েজ রিমুভ", prompt: "নয়েজ কমাও এবং কণ্ঠ পরিষ্কার করো", icon: <Shield className="w-4 h-4" /> },
      { label: "গভীর নয়েজ রিমুভ", prompt: "গভীর নয়েজ রিমুভ করো — 3-পাস ডিনয়েজ", icon: <Shield className="w-4 h-4" /> },
      { label: "শ্বাস সরাও", prompt: "শ্বাসের শব্দ এবং পপ সরাও", icon: <Mic className="w-4 h-4" /> },
      { label: "হাম সরাও", prompt: "বৈদ্যুতিক হাম এবং ৫০Hz নয়েজ সরাও", icon: <Zap className="w-4 h-4" /> },
      { label: "পুরনো রেকর্ড রিস্টোর", prompt: "পুরনো রেকর্ডিং রিস্টোর করো", icon: <RefreshCw className="w-4 h-4" /> },
    ]
  },
  {
    category: "✨ ভয়েস প্রিসেট",
    items: [
      { label: "স্টুডিও মান", prompt: "প্রফেশনাল স্টুডিও মান করো", icon: <Star className="w-4 h-4" /> },
      { label: "গোল্ডেন ভয়েস", prompt: "গোল্ডেন ভয়েস — মধুময় উষ্ণ কণ্ঠ", icon: <Sparkles className="w-4 h-4" /> },
      { label: "ডায়মন্ড ভয়েস", prompt: "ডায়মন্ড ভয়েস — স্ফটিক স্বচ্ছ কণ্ঠ", icon: <Sparkles className="w-4 h-4" /> },
      { label: "ভেলভেট ভয়েস", prompt: "ভেলভেট ভয়েস — মখমলের মতো কণ্ঠ", icon: <Sparkles className="w-4 h-4" /> },
      { label: "ভয়েস এনহ্যান্সার প্রো", prompt: "ভয়েস এনহ্যান্সার প্রো — সম্পূর্ণ প্রসেসিং", icon: <Cpu className="w-4 h-4" /> },
    ]
  },
  {
    category: "🎭 ক্যারেক্টার ভয়েস",
    items: [
      { label: "সিনেমাটিক বাংলা", prompt: "সিনেমাটিক বাংলা ভয়েস করো", icon: <Film className="w-4 h-4" /> },
      { label: "রেডিও জকি", prompt: "রেডিও জকি ভয়েস করো", icon: <Radio className="w-4 h-4" /> },
      { label: "সুফি ভয়েস", prompt: "সুফি ভয়েস — আধ্যাত্মিক গভীরতা", icon: <Waves className="w-4 h-4" /> },
      { label: "ড্রামা ভয়েস", prompt: "ড্রামা ভয়েস — নাটকীয় কণ্ঠ", icon: <Mic className="w-4 h-4" /> },
      { label: "বাংলা আবৃত্তি প্রো", prompt: "বাংলা আবৃত্তি প্রো — কবিতার জন্য", icon: <BookOpen className="w-4 h-4" /> },
    ]
  },
  {
    category: "📱 প্ল্যাটফর্ম অপ্টিমাইজ",
    items: [
      { label: "YouTube ভয়েস", prompt: "YouTube ভয়েস করো", icon: <Film className="w-4 h-4" /> },
      { label: "TikTok/Reels", prompt: "TikTok ভয়েস করো", icon: <Zap className="w-4 h-4" /> },
      { label: "অডিওবুক", prompt: "অডিওবুক ভয়েস করো", icon: <BookOpen className="w-4 h-4" /> },
      { label: "পডকাস্ট", prompt: "পডকাস্ট মান করো", icon: <Headphones className="w-4 h-4" /> },
      { label: "ভয়েস মেসেজ", prompt: "ভয়েস মেসেজ পরিষ্কার করো", icon: <MessageSquare className="w-4 h-4" /> },
    ]
  },
  {
    category: "🎚️ মাস্টারিং",
    items: [
      { label: "স্টুডিও মাস্টার", prompt: "পারফেক্ট মাস্টারিং — স্টুডিও মান", icon: <Star className="w-4 h-4" /> },
      { label: "স্ট্রিমিং রেডি", prompt: "স্ট্রিমিং রেডি — Spotify/YouTube মান", icon: <Music className="w-4 h-4" /> },
      { label: "ব্রডকাস্ট মাস্টার", prompt: "ব্রডকাস্ট মাস্টারিং — TV মান", icon: <Radio className="w-4 h-4" /> },
      { label: "সিনেমা মাস্টার", prompt: "সিনেমা মাস্টারিং — ফিল্ম মান", icon: <Film className="w-4 h-4" /> },
      { label: "অটো মাস্টার", prompt: "অটো মাস্টার করো", icon: <Cpu className="w-4 h-4" /> },
    ]
  },
  {
    category: "🎨 ইফেক্ট",
    items: [
      { label: "রিভার্ব যোগ", prompt: "রিভার্ব যোগ করো", icon: <Waves className="w-4 h-4" /> },
      { label: "ইকো যোগ", prompt: "ইকো যোগ করো", icon: <Waves className="w-4 h-4" /> },
      { label: "পিচ বাড়াও", prompt: "পিচ বাড়াও ২ সেমিটোন", icon: <ChevronUp className="w-4 h-4" /> },
      { label: "পিচ কমাও", prompt: "পিচ কমাও ২ সেমিটোন", icon: <ChevronDown className="w-4 h-4" /> },
      { label: "স্টেরিও বড় করো", prompt: "স্টেরিও ফিল্ড বড় করো", icon: <Headphones className="w-4 h-4" /> },
    ]
  },
];

// ── Helper: format bytes ───────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AudioEditor() {
  const [audio, setAudio] = useState<AudioInfo | null>(null);
  const [instruction, setInstruction] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(PRESETS[0].category);
  const [showPipeline, setShowPipeline] = useState(false);
  const [originalPlaying, setOriginalPlaying] = useState(false);
  const [editedPlaying, setEditedPlaying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const editedAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    return () => {
      if (audio?.url) URL.revokeObjectURL(audio.url);
      if (result?.audioUrl) URL.revokeObjectURL(result.audioUrl);
    };
  }, []);

  // ── File handling ────────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac|webm|opus|caf|mp4)$/i)) {
      setError("সমর্থিত ফরম্যাট: MP3, WAV, OGG, M4A, AAC, FLAC, WebM");
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setError("ফাইলের সর্বোচ্চ আকার ২০০ MB।");
      return;
    }
    if (audio?.url) URL.revokeObjectURL(audio.url);
    if (result?.audioUrl) URL.revokeObjectURL(result.audioUrl);
    const url = URL.createObjectURL(file);
    setAudio({ file, name: file.name, size: file.size, url });
    setResult(null);
    setError("");
    setInstruction("");
  }, [audio, result]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ── Process audio via server API ─────────────────────────────────────────────
  const processAudio = useCallback(async (prompt: string) => {
    if (!audio || !prompt.trim()) return;
    setIsProcessing(true);
    setError("");
    setResult(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 180000);

      const formData = new FormData();
      formData.append("audio", audio.file, audio.name);
      formData.append("instruction", prompt);
      formData.append("prompt", prompt);

      let response: Response;
      try {
        response = await fetch("/api/audio-edit", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `সার্ভার ত্রুটি: HTTP ${response.status}`);
      }

      const json = await response.json();

      if (json.needsMusicFile || json.intent === "ask_music_file") {
        setError("এই ফিচারের জন্য ব্যাকগ্রাউন্ড মিউজিক ফাইল দরকার। চ্যাটবটে গিয়ে মিউজিক ফাইলসহ চেষ্টা করুন।");
        return;
      }

      const { audioData, audioMime: mime = "audio/mpeg", description, appliedSteps = [], pipeline = [], intent = "custom", technicalNote } = json;

      if (!audioData) throw new Error("সার্ভার থেকে অডিও ডেটা পাওয়া যায়নি।");

      const clean = audioData.replace(/^data:[^;]+;base64,/, "").replace(/\s/g, "");
      const bytes = Uint8Array.from(atob(clean), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: mime });
      const audioUrl = URL.createObjectURL(blob);
      const audioFilename = `edited_${Date.now()}.mp3`;

      setResult({
        audioUrl,
        audioFilename,
        description: description || "অডিও প্রসেসিং সম্পন্ন।",
        appliedSteps,
        pipeline,
        intent,
        technicalNote,
        outputSizeKB: Math.round(bytes.byteLength / 1024),
      });
    } catch (e: any) {
      if (e.name === "AbortError") {
        setError("সময়সীমা শেষ। ফাইলটি ছোট করে আবার চেষ্টা করুন।");
      } else {
        setError(e.message || "প্রসেসিং ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      }
    } finally {
      setIsProcessing(false);
    }
  }, [audio]);

  // ── Download ─────────────────────────────────────────────────────────────────
  const downloadResult = useCallback(() => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.audioUrl;
    a.download = result.audioFilename;
    a.click();
  }, [result]);

  // ── Audio play/pause helpers ─────────────────────────────────────────────────
  const toggleOriginal = () => {
    const el = originalAudioRef.current;
    if (!el) return;
    if (el.paused) { el.play(); setOriginalPlaying(true); }
    else { el.pause(); setOriginalPlaying(false); }
  };
  const toggleEdited = () => {
    const el = editedAudioRef.current;
    if (!el) return;
    if (el.paused) { el.play(); setEditedPlaying(true); }
    else { el.pause(); setEditedPlaying(false); }
  };

  return (
    <div className="min-h-screen bg-[#060E1A] text-white pb-20">
      <Seo
        title="অডিও এডিটর — প্রফেশনাল অডিও প্রসেসিং | মাহবুব সরদার সবুজ"
        description="নয়েজ রিমুভ, গোল্ডেন ভয়েস, স্টুডিও মাস্টারিং, পিচ কন্ট্রোল — সব এক জায়গায়।"
        path="/audio-editor"
        keywords="অডিও এডিটর, নয়েজ রিমুভ, ভয়েস এনহ্যান্সার, মাহবুব সরদার সবুজ"
      />
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-5">

        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-4 pb-2"
        >

          <h1 className="text-3xl md:text-4xl font-black mb-3 bg-gradient-to-br from-[#FFE39A] via-[#c9a84c] to-[#a07830] bg-clip-text text-transparent leading-tight">
            প্রফেশনাল অডিও<br />প্রসেসিং
          </h1>
          <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
            নয়েজ রিমুভ, ভয়েস এনহ্যান্স, মাস্টারিং — সব এক ক্লিকে
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c]/80 text-xs font-medium">
              <Shield size={10} /> সার্ভার-সাইড প্রসেসিং
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c]/80 text-xs font-medium">
              <Zap size={10} /> সব ডিভাইসে কাজ করে
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c]/80 text-xs font-medium">
              <Sparkles size={10} /> সম্পূর্ণ বিনামূল্যে
            </span>
          </div>
        </motion.div>

        {/* ── Main Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] backdrop-blur-xl border border-[#c9a84c]/15 rounded-3xl overflow-hidden"
        >

          {/* ── Upload Zone ── */}
          <AnimatePresence mode="wait">
            {!audio ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <label
                  htmlFor="audio-file-input"
                  className={`block cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 ${
                    isDragging
                      ? "border-[#c9a84c] bg-[#c9a84c]/10 scale-[1.01]"
                      : "border-[#c9a84c]/25 bg-[#c9a84c]/[0.03] hover:border-[#c9a84c]/50 hover:bg-[#c9a84c]/[0.06]"
                  }`}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a84c]/20 to-[#c9a84c]/5 flex items-center justify-center mb-4 border border-[#c9a84c]/20">
                      <Upload className="w-7 h-7 text-[#c9a84c]" />
                    </div>
                    <p className="text-[#c9a84c] font-bold text-base mb-1">অডিও ফাইল আপলোড করুন</p>
                    <p className="text-white/40 text-sm mb-4">ট্যাপ করুন বা ড্র্যাগ করুন</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {["MP3", "WAV", "M4A", "OGG", "AAC", "FLAC"].map(f => (
                        <span key={f} className="px-2.5 py-1 rounded-full bg-[#c9a84c]/10 text-[#c9a84c]/70 text-xs border border-[#c9a84c]/20 font-medium">{f}</span>
                      ))}
                    </div>
                    <p className="text-white/25 text-xs mt-3">সর্বোচ্চ ২০০ MB</p>
                  </div>
                </label>
                <input
                  id="audio-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.webm,.opus,.mp4,.caf"
                  className="sr-only"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="loaded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* File info bar */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[#c9a84c]/10">
                  <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 text-[#c9a84c]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{audio.name}</p>
                    <p className="text-xs text-white/40">{formatBytes(audio.size)}</p>
                  </div>
                  <button
                    onClick={() => { if (audio.url) URL.revokeObjectURL(audio.url); setAudio(null); setResult(null); setError(""); }}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white/50" />
                  </button>
                </div>

                {/* Original audio player */}
                <div className="px-5 py-4 border-b border-[#c9a84c]/10">
                  <p className="text-xs text-white/40 mb-2 font-medium">মূল অডিও</p>
                  <audio
                    ref={originalAudioRef}
                    src={audio.url}
                    onEnded={() => setOriginalPlaying(false)}
                    onPause={() => setOriginalPlaying(false)}
                    onPlay={() => setOriginalPlaying(true)}
                    controls
                    className="w-full h-10 rounded-xl"
                    style={{ colorScheme: "dark" }}
                    preload="metadata"
                    playsInline
                  />
                </div>

                {/* Instruction input */}
                <div className="px-5 py-4">
                  <label className="text-xs text-white/40 mb-2 block font-medium">আপনি কী করতে চান?</label>
                  <div className="flex gap-2">
                    <textarea
                      value={instruction}
                      onChange={e => setInstruction(e.target.value)}
                      placeholder="যেমন: নয়েজ কমাও, গোল্ডেন ভয়েস করো, স্টুডিও মান করো..."
                      rows={2}
                      className="flex-1 bg-white/[0.04] border border-[#c9a84c]/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
                    />
                    <button
                      onClick={() => processAudio(instruction)}
                      disabled={isProcessing || !instruction.trim()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#a07830] text-black font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-1.5 self-end"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                      {isProcessing ? "..." : "শুরু"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300 flex-1">{error}</p>
              <button onClick={() => setError("")}><X className="w-4 h-4 text-red-400/60" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Processing indicator ── */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/[0.03] border border-[#c9a84c]/20 rounded-2xl p-5"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full border-2 border-[#c9a84c]/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-[#c9a84c] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-[#c9a84c]" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#c9a84c]">প্রসেসিং চলছে...</p>
                  <p className="text-xs text-white/40 mt-0.5">অডিও এডিট হচ্ছে। একটু অপেক্ষা করুন।</p>
                </div>
              </div>
              <div className="mt-4 h-1.5 rounded-full bg-[#c9a84c]/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#c9a84c] to-[#a07830] rounded-full"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Result ── */}
        <AnimatePresence>
          {result && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white/[0.03] border border-[#c9a84c]/30 rounded-2xl overflow-hidden"
            >
              {/* Success header */}
              <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#c9a84c]/10 to-transparent border-b border-[#c9a84c]/15">
                <CheckCircle className="w-5 h-5 text-[#c9a84c] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#c9a84c]">প্রসেসিং সম্পন্ন!</p>
                  <p className="text-xs text-white/40 truncate">{result.description}</p>
                </div>
                {result.outputSizeKB && (
                  <span className="text-xs text-white/30 flex-shrink-0">{result.outputSizeKB} KB</span>
                )}
              </div>

              {/* Edited audio player */}
              <div className="px-5 py-4 border-b border-[#c9a84c]/10">
                <p className="text-xs text-white/40 mb-2 font-medium">এডিট করা অডিও</p>
                <audio
                  ref={editedAudioRef}
                  src={result.audioUrl}
                  onEnded={() => setEditedPlaying(false)}
                  onPause={() => setEditedPlaying(false)}
                  onPlay={() => setEditedPlaying(true)}
                  controls
                  className="w-full h-10 rounded-xl"
                  style={{ colorScheme: "dark" }}
                  preload="auto"
                  playsInline
                />
              </div>

              {/* Applied steps */}
              {result.appliedSteps.length > 0 && (
                <div className="px-5 py-3 border-b border-[#c9a84c]/10">
                  <p className="text-xs text-white/40 mb-2">প্রয়োগ করা ধাপ</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.appliedSteps.map((step, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c]/80 text-xs border border-[#c9a84c]/15">
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pipeline toggle */}
              {result.pipeline.length > 0 && (
                <div className="px-5 py-3 border-b border-[#c9a84c]/10">
                  <button
                    onClick={() => setShowPipeline(v => !v)}
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" />
                    প্রসেসিং পাইপলাইন
                    {showPipeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <AnimatePresence>
                    {showPipeline && (
                      <motion.ol
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 space-y-1 overflow-hidden"
                      >
                        {result.pipeline.map((step, i) => (
                          <li key={i} className="text-xs text-white/50 flex gap-2">
                            <span className="text-[#c9a84c]/50 flex-shrink-0">{i + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </motion.ol>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Download + re-edit */}
              <div className="px-5 py-4 flex gap-2">
                <button
                  onClick={downloadResult}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#a07830] text-black font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  ডাউনলোড করুন
                </button>
                <button
                  onClick={() => { setResult(null); setInstruction(""); }}
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  আবার এডিট
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Preset Grid ── */}
        {audio && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <p className="text-xs text-white/40 px-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c9a84c]" />
              প্রিমিয়াম প্রিসেট — ট্যাপ করলেই শুরু হবে
            </p>
            {PRESETS.map((cat) => (
              <div key={cat.category} className="rounded-2xl bg-white/[0.03] border border-[#c9a84c]/15 overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === cat.category ? null : cat.category)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-semibold text-white/80">{cat.category}</span>
                  {expandedCategory === cat.category
                    ? <ChevronUp className="w-4 h-4 text-[#c9a84c]/60" />
                    : <ChevronDown className="w-4 h-4 text-white/30" />
                  }
                </button>
                <AnimatePresence>
                  {expandedCategory === cat.category && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                        {cat.items.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => processAudio(item.prompt)}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-[#c9a84c]/15 hover:border-[#c9a84c]/40 hover:bg-[#c9a84c]/5 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed group"
                          >
                            <span className="text-[#c9a84c]/60 group-hover:text-[#c9a84c] transition-colors flex-shrink-0">{item.icon}</span>
                            <span className="text-xs text-white/70 group-hover:text-white transition-colors leading-tight">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Info box (when no file) ── */}
        {!audio && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.03] border border-[#c9a84c]/15 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#c9a84c]" />
              <h2 className="text-sm font-bold text-[#c9a84c]">কী কী করতে পারবেন?</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Shield className="w-4 h-4" />, label: "নয়েজ রিমুভ" },
                { icon: <Star className="w-4 h-4" />, label: "স্টুডিও মাস্টারিং" },
                { icon: <Sparkles className="w-4 h-4" />, label: "গোল্ডেন/ডায়মন্ড ভয়েস" },
                { icon: <Film className="w-4 h-4" />, label: "সিনেমাটিক ইফেক্ট" },
                { icon: <Radio className="w-4 h-4" />, label: "রেডিও জকি ভয়েস" },
                { icon: <Waves className="w-4 h-4" />, label: "রিভার্ব / ইকো" },
                { icon: <BookOpen className="w-4 h-4" />, label: "আবৃত্তি / পডকাস্ট" },
                { icon: <Zap className="w-4 h-4" />, label: "পিচ / স্পিড কন্ট্রোল" },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2.5 text-xs text-white/50 bg-white/[0.02] rounded-xl px-3 py-2.5 border border-white/5">
                  <span className="text-[#c9a84c]/50 flex-shrink-0">{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/25 mt-4 text-center">
              সার্ভার-সাইড FFmpeg প্রসেসিং — সব ডিভাইসে কাজ করে
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
