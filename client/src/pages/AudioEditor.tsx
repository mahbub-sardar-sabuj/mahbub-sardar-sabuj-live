/*
 * AudioEditor.tsx — পূর্ণাঙ্গ ব্রাউজার-ভিত্তিক অডিও এডিটর
 * Design: "Ink & Gold" — World-Class Literary Premium
 * Features: Upload, Waveform, Trim, Speed, Volume, Fade, Reverse, Noise Filter, Download
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Music, Play, Pause, Square, Download,
  Scissors, Volume2, Zap, RotateCcw, Wind, RefreshCw,
  ChevronRight, AlertCircle, CheckCircle2, X, Wand2,
  SkipBack, SkipForward, Gauge,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

// ─── Types ──────────────────────────────────────────────────────────────────
interface AudioState {
  buffer: AudioBuffer | null;
  fileName: string;
  duration: number;
  sampleRate: number;
  channels: number;
}

interface EditParams {
  trimStart: number;
  trimEnd: number;
  volume: number;
  speed: number;
  fadeIn: number;
  fadeOut: number;
  noiseReduction: boolean;
  reverse: boolean;
}

// ─── Waveform Canvas ────────────────────────────────────────────────────────
function WaveformCanvas({
  buffer,
  trimStart,
  trimEnd,
  currentTime,
  duration,
  onSeek,
}: {
  buffer: AudioBuffer | null;
  trimStart: number;
  trimEnd: number;
  currentTime: number;
  duration: number;
  onSeek: (t: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !buffer) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "rgba(4,10,20,0.9)";
    ctx.fillRect(0, 0, W, H);

    // Trim region highlight
    const s = (trimStart / duration) * W;
    const e = (trimEnd / duration) * W;
    ctx.fillStyle = "rgba(201,168,76,0.08)";
    ctx.fillRect(s, 0, e - s, H);

    // Waveform
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / W);
    const mid = H / 2;

    for (let i = 0; i < W; i++) {
      let min = 1, max = -1;
      for (let j = 0; j < step; j++) {
        const v = data[i * step + j] || 0;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const xPos = i / W;
      const inTrim = xPos >= trimStart / duration && xPos <= trimEnd / duration;
      ctx.strokeStyle = inTrim
        ? `rgba(201,168,76,0.85)`
        : `rgba(201,168,76,0.28)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(i, mid + min * mid * 0.9);
      ctx.lineTo(i, mid + max * mid * 0.9);
      ctx.stroke();
    }

    // Trim handles
    ctx.strokeStyle = "rgba(232,201,122,0.9)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(s, 0); ctx.lineTo(s, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(e, 0); ctx.lineTo(e, H); ctx.stroke();
    ctx.setLineDash([]);

    // Playhead
    if (duration > 0) {
      const px = (currentTime / duration) * W;
      ctx.strokeStyle = "#FAF6EF";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
    }
  }, [buffer, trimStart, trimEnd, currentTime, duration]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || duration === 0) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const t = (x / rect.width) * duration;
      onSeek(Math.max(0, Math.min(duration, t)));
    },
    [duration, onSeek]
  );

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={120}
      onClick={handleClick}
      style={{
        width: "100%",
        height: 120,
        borderRadius: 12,
        cursor: "crosshair",
        border: "1px solid rgba(201,168,76,0.18)",
        display: "block",
      }}
    />
  );
}

// ─── Slider Component ────────────────────────────────────────────────────────
function GoldSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
        <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.82rem", color: "rgba(250,246,239,0.7)" }}>
          {label}
        </span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.82rem", color: "#E8C97A", fontWeight: 600 }}>
          {formatValue ? formatValue(value) : value}{unit}
        </span>
      </div>
      <div style={{ position: "relative", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, borderRadius: 3, background: "linear-gradient(90deg, rgba(201,168,76,0.6), #E8C97A)" }} />
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            opacity: 0, cursor: "pointer", margin: 0,
          }}
        />
      </div>
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function GoldToggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.9rem 1rem",
        background: value ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${value ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 12, cursor: "pointer",
        transition: "all 0.25s ease",
        marginBottom: "0.75rem",
      }}
    >
      <div>
        <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.88rem", color: "#FFF8EA", fontWeight: 600 }}>{label}</div>
        <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.75rem", color: "rgba(250,246,239,0.5)", marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{
        width: 40, height: 22, borderRadius: 11,
        background: value ? "linear-gradient(90deg, #C9A84C, #E8C97A)" : "rgba(255,255,255,0.12)",
        position: "relative", transition: "background 0.25s ease", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: 3, left: value ? 21 : 3,
          width: 16, height: 16, borderRadius: "50%",
          background: "#fff", transition: "left 0.25s ease",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AudioEditor() {
  const [audioState, setAudioState] = useState<AudioState>({
    buffer: null, fileName: "", duration: 0, sampleRate: 0, channels: 0,
  });
  const [params, setParams] = useState<EditParams>({
    trimStart: 0, trimEnd: 0,
    volume: 1, speed: 1,
    fadeIn: 0, fadeOut: 0,
    noiseReduction: false, reverse: false,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef(0);
  const startOffsetRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const stopPlayback = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    setIsPlaying(false);
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setError("");
    setSuccess("");
    setProcessedBlob(null);
    stopPlayback();
    setCurrentTime(0);

    const allowed = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/flac", "audio/webm"];
    if (!allowed.some(t => file.type.startsWith(t.split("/")[0]) && file.type.includes(t.split("/")[1])) && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i)) {
      setError("সমর্থিত ফরম্যাট: MP3, WAV, OGG, M4A, AAC, FLAC, WebM");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("ফাইলের সর্বোচ্চ আকার ১০০ MB।");
      return;
    }

    try {
      const ctx = getAudioCtx();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      setAudioState({
        buffer, fileName: file.name,
        duration: buffer.duration,
        sampleRate: buffer.sampleRate,
        channels: buffer.numberOfChannels,
      });
      setParams(p => ({ ...p, trimStart: 0, trimEnd: buffer.duration }));
      setSuccess(`"${file.name}" সফলভাবে লোড হয়েছে।`);
    } catch {
      setError("অডিও ডিকোড করতে সমস্যা হয়েছে। অন্য ফাইল চেষ্টা করুন।");
    }
  }, [getAudioCtx, stopPlayback]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const playPreview = useCallback(() => {
    const { buffer, duration } = audioState;
    if (!buffer) return;
    stopPlayback();

    const ctx = getAudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    const src = ctx.createBufferSource();
    const gain = ctx.createGain();

    src.buffer = buffer;
    src.playbackRate.value = params.speed;
    gain.gain.value = params.volume;

    src.connect(gain);
    gain.connect(ctx.destination);

    const offset = Math.max(params.trimStart, currentTime >= params.trimEnd ? params.trimStart : currentTime);
    const segDur = (params.trimEnd - offset) / params.speed;

    // Fade in
    if (params.fadeIn > 0) {
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(params.volume, ctx.currentTime + Math.min(params.fadeIn, segDur * 0.5));
    }
    // Fade out
    if (params.fadeOut > 0) {
      const fadeOutStart = ctx.currentTime + segDur - Math.min(params.fadeOut, segDur * 0.5);
      gain.gain.setValueAtTime(params.volume, fadeOutStart);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + segDur);
    }

    src.start(0, offset, params.trimEnd - offset);
    src.onended = () => {
      setIsPlaying(false);
      setCurrentTime(params.trimStart);
      cancelAnimationFrame(animFrameRef.current);
    };

    sourceRef.current = src;
    gainRef.current = gain;
    startTimeRef.current = ctx.currentTime;
    startOffsetRef.current = offset;
    setIsPlaying(true);

    const tick = () => {
      const elapsed = (ctx.currentTime - startTimeRef.current) * params.speed;
      const t = Math.min(startOffsetRef.current + elapsed, params.trimEnd);
      setCurrentTime(t);
      if (t < params.trimEnd) animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, [audioState, params, currentTime, getAudioCtx, stopPlayback]);

  const processAndDownload = useCallback(async () => {
    const { buffer, sampleRate, channels } = audioState;
    if (!buffer) return;
    setIsProcessing(true);
    setError("");
    setSuccess("");

    try {
      const ctx = getAudioCtx();
      const trimStart = params.trimStart;
      const trimEnd = params.trimEnd;
      const trimDur = trimEnd - trimStart;
      const outSamples = Math.floor(trimDur * sampleRate);

      // Extract trimmed region
      const offCtx = new OfflineAudioContext(channels, outSamples, sampleRate);
      const src = offCtx.createBufferSource();

      // Build working buffer (possibly reversed)
      let workBuf = buffer;
      if (params.reverse) {
        const rev = offCtx.createBuffer(channels, buffer.length, sampleRate);
        for (let c = 0; c < channels; c++) {
          const orig = buffer.getChannelData(c);
          const revData = rev.getChannelData(c);
          for (let i = 0; i < orig.length; i++) revData[i] = orig[orig.length - 1 - i];
        }
        workBuf = rev;
      }

      src.buffer = workBuf;
      src.playbackRate.value = 1; // speed handled by output length

      const gain = offCtx.createGain();
      gain.gain.value = params.volume;

      let lastNode: AudioNode = src;

      // Noise reduction (low-pass filter)
      if (params.noiseReduction) {
        const filter = offCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 8000;
        filter.Q.value = 0.5;
        lastNode.connect(filter);
        lastNode = filter;
      }

      lastNode.connect(gain);

      // Fade in
      if (params.fadeIn > 0) {
        gain.gain.setValueAtTime(0, 0);
        gain.gain.linearRampToValueAtTime(params.volume, Math.min(params.fadeIn, trimDur * 0.45));
      }
      // Fade out
      if (params.fadeOut > 0) {
        const foStart = Math.max(0, trimDur - params.fadeOut);
        gain.gain.setValueAtTime(params.volume, foStart);
        gain.gain.linearRampToValueAtTime(0, trimDur);
      }

      gain.connect(offCtx.destination);
      src.start(0, params.reverse ? (buffer.duration - trimEnd) : trimStart, trimDur);

      const rendered = await offCtx.startRendering();

      // Speed change via sample-rate trick
      const finalSR = Math.round(rendered.sampleRate * params.speed);
      const finalCtx = new OfflineAudioContext(channels, Math.floor(rendered.length / params.speed), finalSR);
      const finalSrc = finalCtx.createBufferSource();
      finalSrc.buffer = rendered;
      finalSrc.connect(finalCtx.destination);
      finalSrc.start();
      const finalBuf = await finalCtx.startRendering();

      // Encode to WAV
      const wav = encodeWAV(finalBuf);
      const blob = new Blob([wav], { type: "audio/wav" });
      setProcessedBlob(blob);
      setSuccess("প্রসেসিং সম্পন্ন! ডাউনলোড করুন।");
    } catch (err) {
      setError("প্রসেসিং ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsProcessing(false);
    }
  }, [audioState, params, getAudioCtx]);

  const downloadFile = useCallback(() => {
    if (!processedBlob) return;
    const base = audioState.fileName.replace(/\.[^.]+$/, "");
    const url = URL.createObjectURL(processedBlob);
    const a = document.createElement("a");
    a.href = url; a.download = `${base}_edited.wav`;
    a.click();
    URL.revokeObjectURL(url);
  }, [processedBlob, audioState.fileName]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${m}:${sec.toString().padStart(2, "0")}.${ms}`;
  };

  const p = (v: number) => setParams(prev => ({ ...prev, ...v }));

  // Cleanup
  useEffect(() => () => { stopPlayback(); audioCtxRef.current?.close(); }, [stopPlayback]);

  return (
    <div style={{ minHeight: "100vh", background: "#060E1A", color: "#FAF6EF" }}>
      <Seo
        title="অডিও এডিটর — মাহবুব সরদার সবুজ"
        description="ব্রাউজারেই অডিও ট্রিম, ফেড, স্পিড পরিবর্তন, রিভার্স ও নয়েজ রিডাকশন করুন। কোনো সফটওয়্যার ইনস্টল ছাড়াই।"
        keywords="অডিও এডিটর, audio editor bangla, trim audio, audio cutter, noise reduction"
      />
      <Navbar />

      <main style={{ paddingTop: "calc(var(--site-nav-offset, 98px) + 24px)", paddingBottom: "4rem" }}>
        {/* ── Hero Header ─────────────────────────────────────────────── */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.25rem 2.5rem" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: "2.5rem" }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: "0.8rem" }}>
              <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, transparent, #C9A84C)" }} />
              <Music size={14} color="#E8C97A" />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.66rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#E8C97A" }}>
                Audio Editor
              </span>
              <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, #C9A84C, transparent)" }} />
            </div>
            <h1 style={{ fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, color: "#FAF6EF", margin: "0 0 0.8rem", textShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
              অডিও এডিটর
            </h1>
            <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "rgba(250,246,239,0.62)", fontSize: "0.97rem", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
              ব্রাউজারেই অডিও ট্রিম, ফেড, স্পিড পরিবর্তন, রিভার্স ও নয়েজ রিডাকশন করুন — কোনো সফটওয়্যার ইনস্টল ছাড়াই।
            </p>
          </motion.div>

          {/* ── Feature Badges ────────────────────────────────────────── */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", justifyContent: "center", marginBottom: "2.5rem" }}>
            {[
              { icon: <Scissors size={13} />, label: "ট্রিম / কাট" },
              { icon: <Gauge size={13} />, label: "স্পিড কন্ট্রোল" },
              { icon: <Volume2 size={13} />, label: "ভলিউম" },
              { icon: <Wand2 size={13} />, label: "ফেড ইন/আউট" },
              { icon: <Wind size={13} />, label: "নয়েজ রিডাকশন" },
              { icon: <RotateCcw size={13} />, label: "রিভার্স" },
              { icon: <Download size={13} />, label: "WAV ডাউনলোড" },
            ].map(b => (
              <span key={b.label} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "0.32rem 0.75rem",
                background: "rgba(201,168,76,0.08)",
                border: "1px solid rgba(201,168,76,0.18)",
                borderRadius: 20,
                fontFamily: "'Noto Sans Bengali', sans-serif",
                fontSize: "0.75rem", color: "#E8C97A",
              }}>
                {b.icon}{b.label}
              </span>
            ))}
          </div>

          {/* ── Upload Zone ───────────────────────────────────────────── */}
          <AnimatePresence>
            {!audioState.buffer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? "rgba(201,168,76,0.7)" : "rgba(201,168,76,0.25)"}`,
                  borderRadius: 20,
                  padding: "3.5rem 2rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: isDragging ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.02)",
                  transition: "all 0.25s ease",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: "linear-gradient(135deg, rgba(201,168,76,0.18), rgba(201,168,76,0.06))",
                  border: "1px solid rgba(201,168,76,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1.2rem", color: "#E8C97A",
                }}>
                  <Upload size={28} strokeWidth={1.6} />
                </div>
                <h3 style={{ fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif", fontSize: "1.25rem", color: "#FFF8EA", margin: "0 0 0.5rem" }}>
                  অডিও ফাইল আপলোড করুন
                </h3>
                <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.88rem", color: "rgba(250,246,239,0.5)", margin: "0 0 1rem" }}>
                  ড্র্যাগ করুন অথবা ক্লিক করে বেছে নিন
                </p>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.72rem", color: "rgba(250,246,239,0.35)", letterSpacing: "0.05em" }}>
                  MP3 · WAV · OGG · M4A · AAC · FLAC · WebM · সর্বোচ্চ ১০০ MB
                </p>
                <input ref={fileInputRef} type="file" accept="audio/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Alerts ───────────────────────────────────────────────── */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.85rem 1.1rem", background: "rgba(220,50,50,0.1)", border: "1px solid rgba(220,50,50,0.25)", borderRadius: 12, marginBottom: "1rem" }}>
                <AlertCircle size={16} color="#ff6b6b" />
                <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.88rem", color: "#ff9999" }}>{error}</span>
                <X size={14} color="#ff9999" style={{ marginLeft: "auto", cursor: "pointer" }} onClick={() => setError("")} />
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.85rem 1.1rem", background: "rgba(50,200,100,0.08)", border: "1px solid rgba(50,200,100,0.2)", borderRadius: 12, marginBottom: "1rem" }}>
                <CheckCircle2 size={16} color="#6bffaa" />
                <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.88rem", color: "#9dffc8" }}>{success}</span>
                <X size={14} color="#9dffc8" style={{ marginLeft: "auto", cursor: "pointer" }} onClick={() => setSuccess("")} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Editor Panel ─────────────────────────────────────────── */}
          <AnimatePresence>
            {audioState.buffer && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* File info bar */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "0.9rem 1.2rem",
                  background: "rgba(201,168,76,0.06)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  borderRadius: 14, marginBottom: "1.25rem",
                }}>
                  <Music size={18} color="#E8C97A" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.88rem", color: "#FFF8EA", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {audioState.fileName}
                    </div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.72rem", color: "rgba(250,246,239,0.45)", marginTop: 2 }}>
                      {formatTime(audioState.duration)} · {audioState.sampleRate} Hz · {audioState.channels}ch
                    </div>
                  </div>
                  <button
                    onClick={() => { stopPlayback(); setAudioState({ buffer: null, fileName: "", duration: 0, sampleRate: 0, channels: 0 }); setProcessedBlob(null); setSuccess(""); setError(""); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(250,246,239,0.4)", padding: 4 }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Waveform */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <WaveformCanvas
                    buffer={audioState.buffer}
                    trimStart={params.trimStart}
                    trimEnd={params.trimEnd}
                    currentTime={currentTime}
                    duration={audioState.duration}
                    onSeek={(t) => { stopPlayback(); setCurrentTime(t); }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem" }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.7rem", color: "rgba(250,246,239,0.4)" }}>{formatTime(params.trimStart)}</span>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.7rem", color: "#E8C97A" }}>{formatTime(currentTime)}</span>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.7rem", color: "rgba(250,246,239,0.4)" }}>{formatTime(params.trimEnd)}</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
                  <button onClick={() => { stopPlayback(); setCurrentTime(params.trimStart); }}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(250,246,239,0.6)" }}>
                    <SkipBack size={16} />
                  </button>
                  <button
                    onClick={isPlaying ? stopPlayback : playPreview}
                    style={{
                      background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                      border: "none", borderRadius: 14, width: 56, height: 56,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: "#060E1A",
                      boxShadow: "0 4px 20px rgba(201,168,76,0.35)",
                    }}>
                    {isPlaying ? <Pause size={22} strokeWidth={2.2} /> : <Play size={22} strokeWidth={2.2} />}
                  </button>
                  <button onClick={() => { stopPlayback(); setCurrentTime(params.trimEnd); }}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(250,246,239,0.6)" }}>
                    <SkipForward size={16} />
                  </button>
                </div>

                {/* Edit Controls Grid */}
                <div className="audio-edit-grid">
                  {/* Trim */}
                  <div className="audio-panel">
                    <div className="audio-panel-title"><Scissors size={15} />ট্রিম / কাট</div>
                    <GoldSlider label="শুরু" value={params.trimStart} min={0} max={params.trimEnd - 0.1} step={0.01}
                      onChange={v => setParams(p => ({ ...p, trimStart: v }))} formatValue={formatTime} />
                    <GoldSlider label="শেষ" value={params.trimEnd} min={params.trimStart + 0.1} max={audioState.duration} step={0.01}
                      onChange={v => setParams(p => ({ ...p, trimEnd: v }))} formatValue={formatTime} />
                    <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.78rem", color: "rgba(250,246,239,0.45)", textAlign: "center" }}>
                      নির্বাচিত: {formatTime(params.trimEnd - params.trimStart)}
                    </div>
                  </div>

                  {/* Volume & Speed */}
                  <div className="audio-panel">
                    <div className="audio-panel-title"><Volume2 size={15} />ভলিউম ও স্পিড</div>
                    <GoldSlider label="ভলিউম" value={params.volume} min={0} max={2} step={0.01}
                      onChange={v => setParams(p => ({ ...p, volume: v }))} formatValue={v => `${Math.round(v * 100)}%`} />
                    <GoldSlider label="স্পিড" value={params.speed} min={0.25} max={3} step={0.05}
                      onChange={v => setParams(p => ({ ...p, speed: v }))} formatValue={v => `${v.toFixed(2)}x`} />
                  </div>

                  {/* Fade */}
                  <div className="audio-panel">
                    <div className="audio-panel-title"><Wand2 size={15} />ফেড ইন / ফেড আউট</div>
                    <GoldSlider label="ফেড ইন" value={params.fadeIn} min={0} max={Math.min(10, (params.trimEnd - params.trimStart) * 0.45)} step={0.1}
                      onChange={v => setParams(p => ({ ...p, fadeIn: v }))} unit="s" formatValue={v => v.toFixed(1)} />
                    <GoldSlider label="ফেড আউট" value={params.fadeOut} min={0} max={Math.min(10, (params.trimEnd - params.trimStart) * 0.45)} step={0.1}
                      onChange={v => setParams(p => ({ ...p, fadeOut: v }))} unit="s" formatValue={v => v.toFixed(1)} />
                  </div>

                  {/* Effects */}
                  <div className="audio-panel">
                    <div className="audio-panel-title"><Zap size={15} />ইফেক্ট</div>
                    <GoldToggle label="নয়েজ রিডাকশন" desc="উচ্চ-ফ্রিকোয়েন্সি নয়েজ কমায়" value={params.noiseReduction} onChange={v => setParams(p => ({ ...p, noiseReduction: v }))} />
                    <GoldToggle label="রিভার্স" desc="অডিও উল্টো দিক থেকে বাজবে" value={params.reverse} onChange={v => setParams(p => ({ ...p, reverse: v }))} />
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setParams({ trimStart: 0, trimEnd: audioState.duration, volume: 1, speed: 1, fadeIn: 0, fadeOut: 0, noiseReduction: false, reverse: false })}
                    style={{
                      flex: 1, minWidth: 140,
                      padding: "0.85rem 1.2rem",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12, cursor: "pointer",
                      color: "rgba(250,246,239,0.65)",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.9rem",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <RefreshCw size={15} /> রিসেট
                  </button>

                  <button
                    onClick={processAndDownload}
                    disabled={isProcessing}
                    style={{
                      flex: 2, minWidth: 200,
                      padding: "0.85rem 1.5rem",
                      background: isProcessing ? "rgba(201,168,76,0.3)" : "linear-gradient(135deg, #C9A84C, #E8C97A)",
                      border: "none", borderRadius: 12, cursor: isProcessing ? "not-allowed" : "pointer",
                      color: "#060E1A", fontWeight: 700,
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.95rem",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      boxShadow: isProcessing ? "none" : "0 4px 20px rgba(201,168,76,0.3)",
                    }}
                  >
                    {isProcessing ? (
                      <><RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> প্রসেস হচ্ছে...</>
                    ) : (
                      <><Zap size={16} /> প্রসেস করুন</>
                    )}
                  </button>

                  {processedBlob && (
                    <button
                      onClick={downloadFile}
                      style={{
                        flex: 1, minWidth: 140,
                        padding: "0.85rem 1.2rem",
                        background: "rgba(50,200,100,0.1)",
                        border: "1px solid rgba(50,200,100,0.25)",
                        borderRadius: 12, cursor: "pointer",
                        color: "#6bffaa",
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontSize: "0.9rem",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}
                    >
                      <Download size={15} /> WAV ডাউনলোড
                    </button>
                  )}
                </div>

                {/* New file button */}
                <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(201,168,76,0.6)", fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <Upload size={13} /> অন্য ফাইল লোড করুন
                  </button>
                  <input ref={fileInputRef} type="file" accept="audio/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── How to use ───────────────────────────────────────────── */}
          {!audioState.buffer && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ marginTop: "2rem" }}
            >
              <h3 style={{ fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif", fontSize: "1.2rem", color: "#FFF8EA", marginBottom: "1.2rem", textAlign: "center" }}>
                কীভাবে ব্যবহার করবেন?
              </h3>
              <div className="how-to-grid">
                {[
                  { n: "১", t: "ফাইল আপলোড", d: "MP3, WAV বা যেকোনো অডিও ফাইল ড্র্যাগ করুন বা ক্লিক করে বেছে নিন।" },
                  { n: "২", t: "এডিট করুন", d: "ট্রিম, স্পিড, ভলিউম, ফেড ও ইফেক্ট সেটিংস পছন্দমতো ঠিক করুন।" },
                  { n: "৩", t: "প্রিভিউ করুন", d: "প্লে বাটনে চাপ দিয়ে রিয়েল-টাইমে পরিবর্তন শুনুন।" },
                  { n: "৪", t: "ডাউনলোড করুন", d: "'প্রসেস করুন' চাপুন, তারপর WAV ফাইল ডাউনলোড করুন।" },
                ].map(s => (
                  <div key={s.n} style={{
                    padding: "1.2rem",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(201,168,76,0.1)",
                    borderRadius: 14,
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem", fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif", fontSize: "1rem", color: "#E8C97A", fontWeight: 700 }}>{s.n}</div>
                    <div style={{ fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif", fontSize: "0.98rem", color: "#FFF8EA", fontWeight: 700, marginBottom: "0.4rem" }}>{s.t}</div>
                    <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.82rem", color: "rgba(250,246,239,0.55)", lineHeight: 1.6 }}>{s.d}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .audio-edit-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .audio-panel {
          padding: 1.3rem;
          background: linear-gradient(145deg, rgba(18,24,34,0.6), rgba(8,12,18,0.75));
          border: 1px solid rgba(201,168,76,0.1);
          border-radius: 16px;
        }
        .audio-panel-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'AdorshoLipi', 'Tiro Bangla', serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #E8C97A;
          margin-bottom: 1rem;
        }
        .how-to-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.85rem;
        }
        @media (max-width: 768px) {
          .audio-edit-grid { grid-template-columns: 1fr; }
          .how-to-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .how-to-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

// ─── WAV Encoder ─────────────────────────────────────────────────────────────
function encodeWAV(buffer: AudioBuffer): ArrayBuffer {
  const numCh = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const numSamples = buffer.length;
  const bitsPerSample = 16;
  const blockAlign = numCh * (bitsPerSample / 8);
  const byteRate = sr * blockAlign;
  const dataSize = numSamples * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);

  const writeStr = (offset: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i)); };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }
  return ab;
}
