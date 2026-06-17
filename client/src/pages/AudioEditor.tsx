import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Music, Play, Pause, Download, Loader2, CheckCircle,
  AlertCircle, X, Wand2, Volume2, Mic, Sparkles, RefreshCw,
  ChevronDown, ChevronUp, Info, Star, Zap, Shield, Headphones,
  Radio, Waves, Film, BookOpen, MessageSquare, Cpu, Sliders,
  GitMerge, BarChart2, Settings2, Scissors, RotateCcw, Plus, Trash2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

// ── Types ──────────────────────────────────────────────────────────────────────
interface AudioInfo {
  file: File;
  name: string;
  size: number;
  url: string;
  duration?: number;
  waveform?: number[];
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

interface EQBand {
  freq: string;
  label: string;
  value: number; // -12 to +12 dB
}

interface PipelineStep {
  id: string;
  label: string;
  prompt: string;
  color: string;
}

// ── EQ Bands ──────────────────────────────────────────────────────────────────
const DEFAULT_EQ: EQBand[] = [
  { freq: "60Hz", label: "Sub", value: 0 },
  { freq: "150Hz", label: "Bass", value: 0 },
  { freq: "400Hz", label: "Low Mid", value: 0 },
  { freq: "1kHz", label: "Mid", value: 0 },
  { freq: "2.5kHz", label: "Presence", value: 0 },
  { freq: "6kHz", label: "Clarity", value: 0 },
  { freq: "12kHz", label: "Air", value: 0 },
];

// ── Preset categories ──────────────────────────────────────────────────────────
const PRESETS = [
  {
    category: "🎙️ ভয়েস ক্লিনআপ",
    color: "#4ade80",
    items: [
      { label: "নয়েজ রিমুভ", prompt: "নয়েজ কমাও এবং কণ্ঠ পরিষ্কার করো", icon: <Shield className="w-4 h-4" />, desc: "হিস ও ব্যাকগ্রাউন্ড নয়েজ দূর করে" },
      { label: "গভীর নয়েজ রিমুভ", prompt: "গভীর নয়েজ রিমুভ করো — 3-পাস ডিনয়েজ", icon: <Shield className="w-4 h-4" />, desc: "৩-পাস AI ডিনয়েজিং" },
      { label: "শ্বাস সরাও", prompt: "শ্বাসের শব্দ এবং পপ সরাও", icon: <Mic className="w-4 h-4" />, desc: "ব্রেথ ও পপ রিমুভ" },
      { label: "হাম সরাও", prompt: "বৈদ্যুতিক হাম এবং ৫০Hz নয়েজ সরাও", icon: <Zap className="w-4 h-4" />, desc: "ইলেকট্রিক হাম ক্লিন" },
      { label: "পুরনো রেকর্ড রিস্টোর", prompt: "পুরনো রেকর্ডিং রিস্টোর করো", icon: <RefreshCw className="w-4 h-4" />, desc: "ভিনটেজ রেকর্ড পুনরুদ্ধার" },
      { label: "রুম রিভার্ব সরাও", prompt: "রুমের রিভার্ব এবং অ্যাকুস্টিক সরাও", icon: <Waves className="w-4 h-4" />, desc: "রুম অ্যাকুস্টিক্স রিমুভ" },
    ]
  },
  {
    category: "✨ ভয়েস প্রিসেট",
    color: "#c9a84c",
    items: [
      { label: "গোল্ডেন ভয়েস", prompt: "গোল্ডেন ভয়েস — মধুময় উষ্ণ কণ্ঠ", icon: <Sparkles className="w-4 h-4" />, desc: "সোনালি উষ্ণ কণ্ঠ" },
      { label: "ডায়মন্ড ভয়েস", prompt: "ডায়মন্ড ভয়েস — স্ফটিক স্বচ্ছ কণ্ঠ", icon: <Sparkles className="w-4 h-4" />, desc: "ক্রিস্টাল ক্লিয়ার কণ্ঠ" },
      { label: "ভেলভেট ভয়েস", prompt: "ভেলভেট ভয়েস — মখমলের মতো কণ্ঠ", icon: <Sparkles className="w-4 h-4" />, desc: "মসৃণ মখমল কণ্ঠ" },
      { label: "স্টুডিও মান", prompt: "প্রফেশনাল স্টুডিও মান করো", icon: <Star className="w-4 h-4" />, desc: "প্রফেশনাল স্টুডিও কোয়ালিটি" },
      { label: "ভয়েস এনহ্যান্সার প্রো", prompt: "ভয়েস এনহ্যান্সার প্রো — সম্পূর্ণ প্রসেসিং", icon: <Cpu className="w-4 h-4" />, desc: "সম্পূর্ণ AI এনহ্যান্সমেন্ট" },
      { label: "ASMR ভয়েস", prompt: "ASMR ভয়েস — ফিসফিসে শান্ত কণ্ঠ", icon: <Headphones className="w-4 h-4" />, desc: "শান্ত ফিসফিস কণ্ঠ" },
    ]
  },
  {
    category: "🎭 ক্যারেক্টার ভয়েস",
    color: "#a78bfa",
    items: [
      { label: "সিনেমাটিক বাংলা", prompt: "সিনেমাটিক বাংলা ভয়েস করো", icon: <Film className="w-4 h-4" />, desc: "চলচ্চিত্রের মতো কণ্ঠ" },
      { label: "রেডিও জকি", prompt: "রেডিও জকি ভয়েস করো", icon: <Radio className="w-4 h-4" />, desc: "RJ স্টাইল এনার্জেটিক" },
      { label: "সুফি ভয়েস", prompt: "সুফি ভয়েস — আধ্যাত্মিক গভীরতা", icon: <Waves className="w-4 h-4" />, desc: "আধ্যাত্মিক গভীর কণ্ঠ" },
      { label: "ড্রামা ভয়েস", prompt: "ড্রামা ভয়েস — নাটকীয় কণ্ঠ", icon: <Mic className="w-4 h-4" />, desc: "নাটকীয় থিয়েটার কণ্ঠ" },
      { label: "বাংলা আবৃত্তি প্রো", prompt: "বাংলা আবৃত্তি প্রো — কবিতার জন্য", icon: <BookOpen className="w-4 h-4" />, desc: "কবিতা আবৃত্তির জন্য" },
      { label: "নিউজ অ্যাঙ্কর", prompt: "নিউজ অ্যাঙ্কর ভয়েস করো", icon: <Radio className="w-4 h-4" />, desc: "সংবাদ পাঠকের কণ্ঠ" },
    ]
  },
  {
    category: "📱 প্ল্যাটফর্ম অপ্টিমাইজ",
    color: "#38bdf8",
    items: [
      { label: "ভিডিও ভয়েস", prompt: "ভিডিও ভয়েস করো", icon: <Film className="w-4 h-4" />, desc: "ভিডিও কন্টেন্টের জন্য অপ্টিমাইজড" },
      { label: "শর্ট ভিডিও ভয়েস", prompt: "শর্ট ভিডিও ভয়েস করো", icon: <Zap className="w-4 h-4" />, desc: "শর্ট ভিডিওর জন্য" },
      { label: "অডিওবুক", prompt: "অডিওবুক ভয়েস করো", icon: <BookOpen className="w-4 h-4" />, desc: "বই পড়ার মতো কণ্ঠ" },
      { label: "পডকাস্ট", prompt: "পডকাস্ট মান করো", icon: <Headphones className="w-4 h-4" />, desc: "পডকাস্ট কোয়ালিটি" },
      { label: "ভয়েস মেসেজ", prompt: "ভয়েস মেসেজ পরিষ্কার করো", icon: <MessageSquare className="w-4 h-4" />, desc: "মেসেজিং অ্যাপের মান" },
      { label: "মেডিটেশন ভয়েস", prompt: "মেডিটেশন ভয়েস — শান্ত কণ্ঠ", icon: <Waves className="w-4 h-4" />, desc: "শান্তিময় ধ্যানের কণ্ঠ" },
    ]
  },
  {
    category: "🎚️ মাস্টারিং",
    color: "#fb923c",
    items: [
      { label: "স্টুডিও মাস্টার", prompt: "পারফেক্ট মাস্টারিং — স্টুডিও মান", icon: <Star className="w-4 h-4" />, desc: "১০-ধাপ স্টুডিও মাস্টারিং" },
      { label: "স্ট্রিমিং রেডি", prompt: "স্ট্রিমিং রেডি — স্ট্রিমিং মান", icon: <Music className="w-4 h-4" />, desc: "স্ট্রিমিং LUFS মান" },
      { label: "ব্রডকাস্ট মাস্টার", prompt: "ব্রডকাস্ট মাস্টারিং — TV মান", icon: <Radio className="w-4 h-4" />, desc: "টেলিভিশন সম্প্রচার মান" },
      { label: "সিনেমা মাস্টার", prompt: "সিনেমা মাস্টারিং — ফিল্ম মান", icon: <Film className="w-4 h-4" />, desc: "চলচ্চিত্র সাউন্ড মান" },
      { label: "ভিনাইল মাস্টার", prompt: "ভিনাইল মাস্টারিং — রেট্রো মান", icon: <Music className="w-4 h-4" />, desc: "ভিনাইল রেকর্ড স্টাইল" },
      { label: "অটো মাস্টার", prompt: "অটো মাস্টার করো", icon: <Cpu className="w-4 h-4" />, desc: "AI স্বয়ংক্রিয় মাস্টারিং" },
    ]
  },
  {
    category: "🎨 ইফেক্ট ও ট্রান্সফর্ম",
    color: "#f472b6",
    items: [
      { label: "রিভার্ব যোগ", prompt: "রিভার্ব যোগ করো", icon: <Waves className="w-4 h-4" />, desc: "হল রিভার্ব ইফেক্ট" },
      { label: "ইকো যোগ", prompt: "ইকো যোগ করো", icon: <Waves className="w-4 h-4" />, desc: "প্রতিধ্বনি ইফেক্ট" },
      { label: "স্টেরিও বড় করো", prompt: "স্টেরিও ফিল্ড বড় করো", icon: <Headphones className="w-4 h-4" />, desc: "প্রশস্ত স্টেরিও সাউন্ড" },
      { label: "ভিনটেজ রেডিও", prompt: "ভিনটেজ রেডিও ইফেক্ট করো", icon: <Radio className="w-4 h-4" />, desc: "পুরনো রেডিও স্টাইল" },
      { label: "রিভার্স", prompt: "অডিও রিভার্স করো", icon: <RotateCcw className="w-4 h-4" />, desc: "উল্টো দিকে বাজানো" },
      { label: "টেলিফোন ইফেক্ট", prompt: "টেলিফোন ইফেক্ট করো", icon: <MessageSquare className="w-4 h-4" />, desc: "ফোন কলের মতো শব্দ" },
    ]
  },
];

// ── Quick pipeline steps ───────────────────────────────────────────────────────
const PIPELINE_OPTIONS: PipelineStep[] = [
  { id: "denoise", label: "নয়েজ রিমুভ", prompt: "নয়েজ কমাও", color: "#4ade80" },
  { id: "eq", label: "EQ বুস্ট", prompt: "ভয়েস EQ বুস্ট করো", color: "#c9a84c" },
  { id: "compress", label: "কম্প্রেস", prompt: "ডায়নামিক কম্প্রেস করো", color: "#38bdf8" },
  { id: "reverb", label: "রিভার্ব", prompt: "রিভার্ব যোগ করো", color: "#a78bfa" },
  { id: "master", label: "মাস্টার", prompt: "স্টুডিও মাস্টার করো", color: "#fb923c" },
  { id: "normalize", label: "নরমালাইজ", prompt: "লাউডনেস নরমালাইজ করো", color: "#f472b6" },
];

// ── Helper: format bytes ───────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Waveform Canvas Component ─────────────────────────────────────────────────
function WaveformCanvas({ audioUrl, isPlaying, color = "#c9a84c" }: { audioUrl: string; isPlaying: boolean; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveData, setWaveData] = useState<number[]>([]);

  useEffect(() => {
    if (!audioUrl) return;
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    fetch(audioUrl)
      .then(r => r.arrayBuffer())
      .then(buf => audioCtx.decodeAudioData(buf))
      .then(decoded => {
        const raw = decoded.getChannelData(0);
        const samples = 120;
        const blockSize = Math.floor(raw.length / samples);
        const data: number[] = [];
        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(raw[i * blockSize + j]);
          }
          data.push(sum / blockSize);
        }
        const max = Math.max(...data, 0.001);
        setWaveData(data.map(v => v / max));
        audioCtx.close();
      })
      .catch(() => {
        // Fallback: generate fake waveform for display
        setWaveData(Array.from({ length: 120 }, () => Math.random() * 0.8 + 0.1));
      });
  }, [audioUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveData.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const barW = W / waveData.length;
    waveData.forEach((v, i) => {
      const barH = Math.max(2, v * (H * 0.85));
      const x = i * barW;
      const y = (H - barH) / 2;
      const alpha = isPlaying ? 0.9 : 0.6;
      ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, "0");
      ctx.beginPath();
      ctx.roundRect(x + 1, y, Math.max(1, barW - 2), barH, 1);
      ctx.fill();
    });
  }, [waveData, isPlaying, color]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={60}
      className="w-full h-[60px] rounded-xl"
    />
  );
}

// ── EQ Slider Component ────────────────────────────────────────────────────────
function EQSlider({ band, onChange }: { band: EQBand; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <span className="text-[10px] text-[#c9a84c] font-bold tabular-nums">
        {band.value > 0 ? `+${band.value}` : band.value}
      </span>
      <div className="relative h-24 flex items-center justify-center">
        <input
          type="range"
          min={-12}
          max={12}
          step={1}
          value={band.value}
          onChange={e => onChange(Number(e.target.value))}
          className="eq-slider"
          style={{
            writingMode: "vertical-lr" as any,
            direction: "rtl",
            WebkitAppearance: "slider-vertical",
            width: "28px",
            height: "96px",
            cursor: "pointer",
            accentColor: "#c9a84c",
          }}
        />
        {/* Center line */}
        <div className="absolute left-1/2 top-1/2 w-full h-px bg-[#c9a84c]/20 -translate-y-1/2 pointer-events-none" />
      </div>
      <span className="text-[9px] text-white/40 text-center leading-tight">{band.freq}</span>
      <span className="text-[9px] text-white/25 text-center">{band.label}</span>
    </div>
  );
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

  // Advanced controls
  const [activeTab, setActiveTab] = useState<"presets" | "eq" | "controls" | "chain">("presets");
  const [eqBands, setEqBands] = useState<EQBand[]>(DEFAULT_EQ);
  const [pitch, setPitch] = useState(0); // semitones: -6 to +6
  const [speed, setSpeed] = useState(1.0); // 0.5x to 2.0x
  const [volume, setVolume] = useState(0); // dB: -12 to +12
  const [chainSteps, setChainSteps] = useState<PipelineStep[]>([]);
  const [audioDuration, setAudioDuration] = useState(0);

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
    setEqBands(DEFAULT_EQ);
    setPitch(0);
    setSpeed(1.0);
    setVolume(0);
    setChainSteps([]);
  }, [audio, result]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ── Build EQ prompt from bands ───────────────────────────────────────────────
  const buildEqPrompt = useCallback(() => {
    const parts: string[] = [];
    const bandNames = ["sub", "bass", "low_mid", "mud", "mid", "high_mid", "air"];
    eqBands.forEach((b, i) => {
      if (b.value !== 0) {
        const dir = b.value > 0 ? "বাড়াও" : "কমাও";
        parts.push(`${b.freq} ${Math.abs(b.value)}dB ${dir}`);
      }
    });
    if (pitch !== 0) parts.push(`পিচ ${pitch > 0 ? "+" : ""}${pitch} সেমিটোন`);
    if (speed !== 1.0) parts.push(`স্পিড ${speed}x`);
    if (volume !== 0) parts.push(`ভলিউম ${volume > 0 ? "+" : ""}${volume}dB`);
    if (parts.length === 0) return "ভয়েস EQ অপ্টিমাইজ করো";
    return `EQ: ${parts.join(", ")}. নয়েজ কমাও এবং কণ্ঠ পরিষ্কার করো।`;
  }, [eqBands, pitch, speed, volume]);

  // ── Build chain prompt ────────────────────────────────────────────────────────
  const buildChainPrompt = useCallback(() => {
    if (chainSteps.length === 0) return "";
    return chainSteps.map(s => s.prompt).join(", তারপর ");
  }, [chainSteps]);

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

  const resetEQ = () => setEqBands(DEFAULT_EQ.map(b => ({ ...b, value: 0 })));

  const addToChain = (step: PipelineStep) => {
    if (chainSteps.length >= 6) return;
    if (!chainSteps.find(s => s.id === step.id)) {
      setChainSteps(prev => [...prev, step]);
    }
  };

  const removeFromChain = (id: string) => setChainSteps(prev => prev.filter(s => s.id !== id));

  return (
    <div className="min-h-screen bg-[#060E1A] text-white pt-24 pb-24">
      <Seo
        title="অডিও এডিটর — প্রফেশনাল অডিও প্রসেসিং | মাহবুব সরদার সবুজ"
        description="নয়েজ রিমুভ, গোল্ডেন ভয়েস, স্টুডিও মাস্টারিং, পিচ কন্ট্রোল — সব এক জায়গায়।"
        path="/audio-editor"
        keywords="অডিও এডিটর, নয়েজ রিমুভ, ভয়েস এনহ্যান্সার, মাহবুব সরদার সবুজ"
      />
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-2 pb-1"
        >
          <h1 className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-br from-[#FFE39A] via-[#c9a84c] to-[#a07830] bg-clip-text text-transparent leading-tight">
            প্রফেশনাল অডিও<br />প্রসেসিং
          </h1>
          <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed mb-3">
            নয়েজ রিমুভ, ভয়েস এনহ্যান্স, EQ, মাস্টারিং — সব এক জায়গায়
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c]/80 text-xs font-medium">
              <Shield size={10} /> AI প্রসেসিং
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c]/80 text-xs font-medium">
              <Zap size={10} /> সব ডিভাইসে
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c]/80 text-xs font-medium">
              <Sparkles size={10} /> বিনামূল্যে
            </span>
          </div>
        </motion.div>

        {/* ── Upload / File Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] backdrop-blur-xl border border-[#c9a84c]/15 rounded-3xl overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {!audio ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5"
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
                  <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
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
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#c9a84c]/10">
                  <div className="w-9 h-9 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center flex-shrink-0">
                    <Music className="w-4 h-4 text-[#c9a84c]" />
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

                {/* Waveform + Player */}
                <div className="px-5 py-4 border-b border-[#c9a84c]/10">
                  <div className="mb-2">
                    <WaveformCanvas audioUrl={audio.url} isPlaying={originalPlaying} />
                  </div>
                  <p className="text-xs text-white/30 mb-2 font-medium">মূল অডিও</p>
                  <audio
                    ref={originalAudioRef}
                    src={audio.url}
                    onEnded={() => setOriginalPlaying(false)}
                    onPause={() => setOriginalPlaying(false)}
                    onPlay={() => setOriginalPlaying(true)}
                    onLoadedMetadata={e => setAudioDuration((e.target as HTMLAudioElement).duration)}
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
                  <p className="text-sm font-bold text-[#c9a84c]">AI প্রসেসিং চলছে...</p>
                  <p className="text-xs text-white/40 mt-0.5">সার্ভারে অডিও প্রসেস হচ্ছে। একটু অপেক্ষা করুন।</p>
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

              {/* A/B Comparison */}
              <div className="px-5 py-4 border-b border-[#c9a84c]/10 space-y-3">
                {/* Original */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/50">আগে</span>
                    <span className="text-xs text-white/30">মূল অডিও</span>
                  </div>
                  <WaveformCanvas audioUrl={audio!.url} isPlaying={originalPlaying} color="#ffffff" />
                  <audio
                    ref={originalAudioRef}
                    src={audio!.url}
                    onEnded={() => setOriginalPlaying(false)}
                    onPause={() => setOriginalPlaying(false)}
                    onPlay={() => setOriginalPlaying(true)}
                    controls
                    className="w-full h-9 rounded-xl mt-1.5"
                    style={{ colorScheme: "dark" }}
                    preload="metadata"
                    playsInline
                  />
                </div>
                {/* Edited */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c9a84c]/20 text-[#c9a84c]">পরে</span>
                    <span className="text-xs text-white/30">এডিট করা অডিও</span>
                  </div>
                  <WaveformCanvas audioUrl={result.audioUrl} isPlaying={editedPlaying} color="#c9a84c" />
                  <audio
                    ref={editedAudioRef}
                    src={result.audioUrl}
                    onEnded={() => setEditedPlaying(false)}
                    onPause={() => setEditedPlaying(false)}
                    onPlay={() => setEditedPlaying(true)}
                    controls
                    className="w-full h-9 rounded-xl mt-1.5"
                    style={{ colorScheme: "dark" }}
                    preload="auto"
                    playsInline
                  />
                </div>
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
                    প্রসেসিং পাইপলাইন বিস্তারিত
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

        {/* ── Advanced Controls (when file loaded) ── */}
        {audio && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            {/* Tab Navigation */}
            <div className="flex gap-1 bg-white/[0.03] border border-[#c9a84c]/15 rounded-2xl p-1">
              {[
                { id: "presets" as const, label: "প্রিসেট", icon: <Sparkles className="w-3.5 h-3.5" /> },
                { id: "eq" as const, label: "EQ", icon: <BarChart2 className="w-3.5 h-3.5" /> },
                { id: "controls" as const, label: "কন্ট্রোল", icon: <Sliders className="w-3.5 h-3.5" /> },
                { id: "chain" as const, label: "চেইন", icon: <GitMerge className="w-3.5 h-3.5" /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-[#c9a84c] text-black"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab: Presets ── */}
            {activeTab === "presets" && (
              <div className="space-y-2">
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
                                className="flex flex-col gap-1 px-3 py-3 rounded-xl bg-white/[0.03] border border-[#c9a84c]/15 hover:border-[#c9a84c]/40 hover:bg-[#c9a84c]/5 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed group"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[#c9a84c]/60 group-hover:text-[#c9a84c] transition-colors flex-shrink-0">{item.icon}</span>
                                  <span className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors leading-tight">{item.label}</span>
                                </div>
                                <span className="text-[10px] text-white/30 leading-tight">{item.desc}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}

            {/* ── Tab: EQ ── */}
            {activeTab === "eq" && (
              <div className="bg-white/[0.03] border border-[#c9a84c]/15 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#c9a84c]" />
                    <span className="text-sm font-bold text-white">৭-ব্যান্ড গ্রাফিক EQ</span>
                  </div>
                  <button
                    onClick={resetEQ}
                    className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> রিসেট
                  </button>
                </div>

                {/* EQ Sliders */}
                <div className="flex gap-1 justify-between mb-4">
                  {eqBands.map((band, i) => (
                    <EQSlider
                      key={band.freq}
                      band={band}
                      onChange={v => setEqBands(prev => prev.map((b, j) => j === i ? { ...b, value: v } : b))}
                    />
                  ))}
                </div>

                {/* EQ Presets */}
                <div className="border-t border-[#c9a84c]/10 pt-3">
                  <p className="text-xs text-white/30 mb-2">EQ প্রিসেট</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "ভয়েস বুস্ট", values: [0, 2, 1, -2, 3, 2, 1] },
                      { label: "বেস বুস্ট", values: [4, 3, 1, -1, 0, 0, 0] },
                      { label: "ব্রাইট", values: [0, 0, 0, -1, 2, 4, 3] },
                      { label: "ওয়ার্ম", values: [2, 3, 2, -2, 0, -1, -2] },
                      { label: "ফ্ল্যাট", values: [0, 0, 0, 0, 0, 0, 0] },
                    ].map(preset => (
                      <button
                        key={preset.label}
                        onClick={() => setEqBands(DEFAULT_EQ.map((b, i) => ({ ...b, value: preset.values[i] })))}
                        className="px-3 py-1.5 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c]/70 text-xs hover:bg-[#c9a84c]/20 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => processAudio(buildEqPrompt())}
                  disabled={isProcessing}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#a07830] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  EQ প্রয়োগ করুন
                </button>
              </div>
            )}

            {/* ── Tab: Controls ── */}
            {activeTab === "controls" && (
              <div className="bg-white/[0.03] border border-[#c9a84c]/15 rounded-2xl p-5 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <Sliders className="w-4 h-4 text-[#c9a84c]" />
                  <span className="text-sm font-bold text-white">পিচ, স্পিড ও ভলিউম</span>
                </div>

                {/* Pitch Control */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60 font-medium">পিচ কন্ট্রোল</span>
                    <span className="text-xs font-bold text-[#c9a84c]">
                      {pitch > 0 ? `+${pitch}` : pitch} সেমিটোন
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-6}
                    max={6}
                    step={1}
                    value={pitch}
                    onChange={e => setPitch(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: "#c9a84c" }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-white/25">-6 (নিচু)</span>
                    <span className="text-[10px] text-white/25">0 (স্বাভাবিক)</span>
                    <span className="text-[10px] text-white/25">+6 (উঁচু)</span>
                  </div>
                  {/* Quick pitch buttons */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {[-4, -2, -1, 0, 1, 2, 4].map(v => (
                      <button
                        key={v}
                        onClick={() => setPitch(v)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                          pitch === v
                            ? "bg-[#c9a84c] text-black font-bold"
                            : "bg-white/5 text-white/40 hover:bg-white/10"
                        }`}
                      >
                        {v > 0 ? `+${v}` : v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Control */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60 font-medium">স্পিড কন্ট্রোল</span>
                    <span className="text-xs font-bold text-[#c9a84c]">{speed.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.0}
                    step={0.05}
                    value={speed}
                    onChange={e => setSpeed(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: "#c9a84c" }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-white/25">0.5x (ধীর)</span>
                    <span className="text-[10px] text-white/25">1x (স্বাভাবিক)</span>
                    <span className="text-[10px] text-white/25">2x (দ্রুত)</span>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(v => (
                      <button
                        key={v}
                        onClick={() => setSpeed(v)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                          Math.abs(speed - v) < 0.01
                            ? "bg-[#c9a84c] text-black font-bold"
                            : "bg-white/5 text-white/40 hover:bg-white/10"
                        }`}
                      >
                        {v}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume Control */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60 font-medium">ভলিউম অ্যাডজাস্ট</span>
                    <span className="text-xs font-bold text-[#c9a84c]">
                      {volume > 0 ? `+${volume}` : volume} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={volume}
                    onChange={e => setVolume(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: "#c9a84c" }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-white/25">-12dB</span>
                    <span className="text-[10px] text-white/25">0 (স্বাভাবিক)</span>
                    <span className="text-[10px] text-white/25">+12dB</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const parts: string[] = [];
                    if (pitch !== 0) parts.push(`পিচ ${pitch > 0 ? "বাড়াও" : "কমাও"} ${Math.abs(pitch)} সেমিটোন`);
                    if (Math.abs(speed - 1.0) > 0.01) parts.push(`স্পিড ${speed > 1 ? "বাড়াও" : "কমাও"} ${speed}x`);
                    if (volume !== 0) parts.push(`ভলিউম ${volume > 0 ? "বাড়াও" : "কমাও"} ${Math.abs(volume)}dB`);
                    if (parts.length === 0) parts.push("নয়েজ কমাও এবং কণ্ঠ পরিষ্কার করো");
                    processAudio(parts.join(", তারপর ") + ". নয়েজ কমাও।");
                  }}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#a07830] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  কন্ট্রোল প্রয়োগ করুন
                </button>
              </div>
            )}

            {/* ── Tab: Chain Builder ── */}
            {activeTab === "chain" && (
              <div className="bg-white/[0.03] border border-[#c9a84c]/15 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <GitMerge className="w-4 h-4 text-[#c9a84c]" />
                  <span className="text-sm font-bold text-white">মাল্টি-স্টেপ পাইপলাইন</span>
                </div>

                {/* Available steps */}
                <p className="text-xs text-white/40 mb-2">ধাপ যোগ করুন (সর্বোচ্চ ৬টি)</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {PIPELINE_OPTIONS.map(step => (
                    <button
                      key={step.id}
                      onClick={() => addToChain(step)}
                      disabled={chainSteps.length >= 6 || !!chainSteps.find(s => s.id === step.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
                      style={{
                        borderColor: step.color + "40",
                        backgroundColor: step.color + "10",
                        color: step.color,
                      }}
                    >
                      <Plus className="w-3 h-3" />
                      {step.label}
                    </button>
                  ))}
                </div>

                {/* Chain display */}
                {chainSteps.length > 0 ? (
                  <div className="mb-4">
                    <p className="text-xs text-white/40 mb-2">আপনার পাইপলাইন</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      {chainSteps.map((step, i) => (
                        <div key={step.id} className="flex items-center gap-1">
                          <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: step.color + "20", color: step.color, border: `1px solid ${step.color}40` }}
                          >
                            {step.label}
                            <button onClick={() => removeFromChain(step.id)} className="opacity-60 hover:opacity-100">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          {i < chainSteps.length - 1 && (
                            <span className="text-white/20 text-xs">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 py-4 text-center border border-dashed border-[#c9a84c]/15 rounded-xl">
                    <p className="text-xs text-white/30">উপর থেকে ধাপ যোগ করুন</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    const prompt = buildChainPrompt();
                    if (prompt) processAudio(prompt);
                  }}
                  disabled={isProcessing || chainSteps.length === 0}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#a07830] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  পাইপলাইন চালান ({chainSteps.length} ধাপ)
                </button>
              </div>
            )}
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
                { icon: <Shield className="w-4 h-4" />, label: "AI নয়েজ রিমুভ", desc: "৩-পাস ডিনয়েজিং" },
                { icon: <Star className="w-4 h-4" />, label: "স্টুডিও মাস্টারিং", desc: "১০-ধাপ মাস্টারিং" },
                { icon: <Sparkles className="w-4 h-4" />, label: "গোল্ডেন ভয়েস", desc: "মধুময় কণ্ঠ" },
                { icon: <Film className="w-4 h-4" />, label: "সিনেমাটিক ইফেক্ট", desc: "চলচ্চিত্র মান" },
                { icon: <BarChart2 className="w-4 h-4" />, label: "৭-ব্যান্ড EQ", desc: "কাস্টম EQ কন্ট্রোল" },
                { icon: <Sliders className="w-4 h-4" />, label: "পিচ ও স্পিড", desc: "রিয়েল-টাইম কন্ট্রোল" },
                { icon: <GitMerge className="w-4 h-4" />, label: "পাইপলাইন চেইন", desc: "মাল্টি-স্টেপ প্রসেস" },
                { icon: <Waves className="w-4 h-4" />, label: "ওয়েভফর্ম ভিজ্যুয়াল", desc: "A/B তুলনা" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-[#c9a84c]/10">
                  <span className="text-[#c9a84c]/60 flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-white/70">{item.label}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-white/20 mt-4">সার্ভার-সাইড প্রসেসিং — সব ডিভাইসে কাজ করে</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
