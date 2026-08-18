import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Download,
  FileAudio,
  Gauge,
  Loader2,
  Music,
  Pause,
  Play,
  RotateCcw,
  Scissors,
  Sparkles,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

interface AudioProject {
  file: File;
  url: string;
  buffer: AudioBuffer;
  samples: number[];
}

const MAX_FILE_BYTES = 120 * 1024 * 1024;
const ACCENT = "#E8C46F";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function makeWaveform(buffer: AudioBuffer, bars = 88) {
  const channel = buffer.getChannelData(0);
  const block = Math.max(1, Math.floor(channel.length / bars));
  const values = Array.from({ length: bars }, (_, index) => {
    const start = index * block;
    let peak = 0;
    for (let point = start; point < Math.min(start + block, channel.length); point += 1) {
      peak = Math.max(peak, Math.abs(channel[point] ?? 0));
    }
    return peak;
  });
  const max = Math.max(...values, 0.001);
  return values.map((value) => Math.max(0.08, value / max));
}

function writeWav(buffer: AudioBuffer) {
  const channels = buffer.numberOfChannels;
  const frames = buffer.length;
  const output = new ArrayBuffer(44 + frames * channels * 2);
  const view = new DataView(output);
  const writeText = (offset: number, value: string) => {
    [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + frames * channels * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, frames * channels * 2, true);

  const channelData = Array.from({ length: channels }, (_, channel) => buffer.getChannelData(channel));
  let offset = 44;
  for (let frame = 0; frame < frames; frame += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = clamp(channelData[channel][frame] ?? 0, -1, 1);
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return output;
}

function calculatePeak(buffer: AudioBuffer, start: number, end: number) {
  const from = Math.max(0, Math.floor(start * buffer.sampleRate));
  const to = Math.min(buffer.length, Math.ceil(end * buffer.sampleRate));
  let peak = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let index = from; index < to; index += 1) peak = Math.max(peak, Math.abs(data[index] ?? 0));
  }
  return peak;
}

function Waveform({ samples, duration, start, end, current }: { samples: number[]; duration: number; start: number; end: number; current: number }) {
  const startRatio = duration ? start / duration : 0;
  const endRatio = duration ? end / duration : 1;
  const currentRatio = duration ? current / duration : 0;

  return (
    <div className="relative h-28 overflow-hidden rounded-2xl border border-white/10 bg-[#071426] px-3 py-4" aria-label="অডিও ওয়েভফর্ম">
      <div className="absolute inset-y-0 left-0 bg-[#020711]/55" style={{ width: `${startRatio * 100}%` }} />
      <div className="absolute inset-y-0 right-0 bg-[#020711]/55" style={{ width: `${Math.max(0, (1 - endRatio) * 100)}%` }} />
      <div className="relative z-10 grid h-full items-center gap-[2px]" style={{ gridTemplateColumns: `repeat(${samples.length || 88}, minmax(1px, 1fr))` }}>
        {(samples.length ? samples : Array.from({ length: 88 }, (_, index) => 0.18 + ((index * 13) % 71) / 110)).map((value, index) => {
          const ratio = index / Math.max(samples.length - 1, 1);
          const selected = ratio >= startRatio && ratio <= endRatio;
          const played = ratio <= currentRatio && selected;
          return <span key={index} className="rounded-full" style={{ height: `${Math.max(10, value * 74)}%`, background: played ? ACCENT : selected ? "rgba(196,215,238,.75)" : "rgba(120,144,174,.28)" }} />;
        })}
      </div>
      <span className="absolute inset-y-0 w-px bg-[#fff3c4] shadow-[0_0_12px_#e8c46f]" style={{ left: `${clamp(currentRatio, startRatio, endRatio) * 100}%` }} />
    </div>
  );
}

function RangeControl({ label, value, min, max, step, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; suffix?: string; onChange: (value: number) => void }) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-3 flex items-center justify-between gap-3"><span className="text-sm font-semibold text-[#f8f3e7]">{label}</span><output className="rounded-full bg-[#e8c46f]/10 px-2.5 py-1 text-xs font-bold text-[#e8c46f]">{value}{suffix}</output></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="studio-range w-full" style={{ accentColor: ACCENT }} />
    </label>
  );
}

export default function AudioEditor() {
  const [project, setProject] = useState<AudioProject | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [volumeDb, setVolumeDb] = useState(0);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [normalize, setNormalize] = useState(true);
  const [exported, setExported] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<HTMLAudioElement>(null);
  const projectUrlRef = useRef<string | null>(null);

  const duration = project?.buffer.duration ?? 0;
  const clipDuration = Math.max(0, trimEnd - trimStart);
  const previewVolume = clamp(10 ** (volumeDb / 20), 0, 1);

  useEffect(() => () => { if (projectUrlRef.current) URL.revokeObjectURL(projectUrlRef.current); }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (player) {
      player.playbackRate = speed;
      player.volume = previewVolume;
    }
  }, [previewVolume, speed]);

  const clearProject = useCallback(() => {
    const player = playerRef.current;
    if (player) player.pause();
    if (projectUrlRef.current) URL.revokeObjectURL(projectUrlRef.current);
    projectUrlRef.current = null;
    setProject(null);
    setCurrentTime(0);
    setTrimStart(0);
    setTrimEnd(0);
    setIsPlaying(false);
    setExported(false);
    setError("");
  }, []);

  const loadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|aac|ogg|flac|webm|opus)$/i.test(file.name)) {
      setError("MP3, WAV, M4A, AAC, OGG, FLAC, WebM অথবা Opus audio file দিন।");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("ফাইলের আকার ১২০ MB-এর মধ্যে রাখুন।");
      return;
    }

    setIsDecoding(true);
    setError("");
    try {
      const Context = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = new Context();
      const data = await file.arrayBuffer();
      const buffer = await context.decodeAudioData(data.slice(0));
      await context.close();
      if (projectUrlRef.current) URL.revokeObjectURL(projectUrlRef.current);
      const url = URL.createObjectURL(file);
      projectUrlRef.current = url;
      setProject({ file, url, buffer, samples: makeWaveform(buffer) });
      setTrimStart(0);
      setTrimEnd(buffer.duration);
      setCurrentTime(0);
      setVolumeDb(0);
      setFadeIn(0);
      setFadeOut(0);
      setSpeed(1);
      setNormalize(true);
      setExported(false);
    } catch {
      setError("ফাইলটি decode করা যায়নি। অন্য একটি standard MP3, WAV বা M4A file চেষ্টা করুন।");
    } finally {
      setIsDecoding(false);
    }
  }, []);

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void loadFile(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void loadFile(file);
  };

  const togglePlayback = async () => {
    const player = playerRef.current;
    if (!player || !project) return;
    if (!player.paused) {
      player.pause();
      return;
    }
    if (player.currentTime < trimStart || player.currentTime >= trimEnd) player.currentTime = trimStart;
    player.playbackRate = speed;
    player.volume = previewVolume;
    try { await player.play(); } catch { setError("Preview চালু করা যায়নি। browser-এর media permission পরীক্ষা করুন।"); }
  };

  const onTimeUpdate = () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.currentTime >= trimEnd) {
      player.pause();
      player.currentTime = trimStart;
      setCurrentTime(trimStart);
      return;
    }
    setCurrentTime(player.currentTime);
  };

  const resetEdits = () => {
    if (!project) return;
    setTrimStart(0);
    setTrimEnd(project.buffer.duration);
    setVolumeDb(0);
    setFadeIn(0);
    setFadeOut(0);
    setSpeed(1);
    setNormalize(true);
    setCurrentTime(0);
    if (playerRef.current) playerRef.current.currentTime = 0;
    setExported(false);
  };

  const exportEditedAudio = async () => {
    if (!project || clipDuration <= 0.05) return;
    setIsExporting(true);
    setError("");
    setExported(false);
    try {
      const outputDuration = clipDuration / speed;
      const Offline = window.OfflineAudioContext || (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
      const offline = new Offline(project.buffer.numberOfChannels, Math.ceil(outputDuration * project.buffer.sampleRate), project.buffer.sampleRate);
      const source = offline.createBufferSource();
      const gain = offline.createGain();
      source.buffer = project.buffer;
      source.playbackRate.value = speed;
      const peak = normalize ? calculatePeak(project.buffer, trimStart, trimEnd) : 1;
      const normalizedGain = normalize && peak > 0 ? Math.min(1 / peak, 8) : 1;
      const targetGain = normalizedGain * 10 ** (volumeDb / 20);
      const safeFadeIn = Math.min(fadeIn, outputDuration / 2);
      const safeFadeOut = Math.min(fadeOut, outputDuration / 2);
      gain.gain.setValueAtTime(safeFadeIn > 0 ? 0 : targetGain, 0);
      if (safeFadeIn > 0) gain.gain.linearRampToValueAtTime(targetGain, safeFadeIn);
      if (safeFadeOut > 0) {
        gain.gain.setValueAtTime(targetGain, Math.max(safeFadeIn, outputDuration - safeFadeOut));
        gain.gain.linearRampToValueAtTime(0, outputDuration);
      }
      source.connect(gain).connect(offline.destination);
      source.start(0, trimStart, clipDuration);
      const rendered = await offline.startRendering();
      const wav = writeWav(rendered);
      const blob = new Blob([wav], { type: "audio/wav" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const base = project.file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-") || "edited-audio";
      link.download = `${base}-edited.wav`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      setExported(true);
    } catch {
      setError("Export সম্পন্ন করা যায়নি। ছোট file দিয়ে পুনরায় চেষ্টা করুন।");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060e1a] pb-20 pt-[var(--site-nav-offset,76px)] text-[#f8f3e7]">
      <Seo title="অডিও এডিটর — Trim, Volume, Fade ও Export | মাহবুব সরদার সবুজ" description="Browser-এ ব্যক্তিগতভাবে audio trim, volume, fade, speed ও WAV export করুন।" path="/audio-editor" robots="noindex, nofollow" />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <section className="relative overflow-hidden rounded-[30px] border border-[#e8c46f]/25 bg-[radial-gradient(circle_at_82%_12%,rgba(232,196,111,.15),transparent_27%),linear-gradient(135deg,#071629,#0b233c)] px-5 py-8 shadow-[0_28px_70px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.08)] sm:px-10 sm:py-11">
          <div className="absolute -right-7 -top-12 text-[180px] font-bold leading-none text-[#e8c46f]/[0.045]">♪</div>
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e8c46f]/25 bg-[#e8c46f]/[0.08] px-3 py-1.5 text-xs font-bold text-[#f1d78f]"><Music size={14} /> ব্যক্তিগত audio workspace</span>
            <h1 className="mt-4 font-['AdorshoLipi'] text-4xl font-bold leading-tight tracking-tight text-[#f8f3e7] sm:text-5xl">সহজে করুন <span className="text-[#e8c46f]">পরিষ্কার edit</span></h1>
            <p className="mt-3 max-w-xl text-base leading-8 text-[#cbd7e4]">Trim, volume, fade ও speed নিয়ন্ত্রণ করুন। ফাইল আপনার browser থেকেই process হয়—কোনো ভুয়া AI preset নয়, কেবল দরকারি বাস্তব editing tools।</p>
          </div>
        </section>

        {!project ? (
          <section className="mt-6 rounded-[26px] border border-white/10 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.06)] sm:p-6">
            <label htmlFor="audio-upload" onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} className={`flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-[22px] border-2 border-dashed px-5 text-center transition ${dragging ? "border-[#e8c46f] bg-[#e8c46f]/10" : "border-[#e8c46f]/30 bg-[#091a2d] hover:border-[#e8c46f]/60 hover:bg-[#e8c46f]/[0.05]"}`}>
              <span className="grid h-16 w-16 place-items-center rounded-2xl border border-[#e8c46f]/25 bg-[#e8c46f]/10 text-[#e8c46f]"><Upload size={28} /></span>
              <strong className="mt-5 text-xl">অডিও ফাইল দিন</strong>
              <span className="mt-2 text-sm text-[#bdc9d7]">ট্যাপ করুন অথবা এখানে drag & drop করুন</span>
              <span className="mt-5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[#d6dfeb]">MP3 · WAV · M4A · AAC · OGG · FLAC · WebM</span>
              <span className="mt-3 text-xs text-white/35">সর্বোচ্চ ১২০ MB · ফাইল device থেকে upload হয় না</span>
              <input ref={inputRef} id="audio-upload" type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.webm,.opus" className="sr-only" onChange={handleSelect} />
            </label>
            {isDecoding && <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#e8c46f]"><Loader2 className="animate-spin" size={17} /> অডিও প্রস্তুত হচ্ছে…</div>}
          </section>
        ) : (
          <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(145deg,rgba(18,42,67,.94),rgba(8,23,39,.96))] shadow-[0_20px_52px_rgba(0,0,0,.24),inset_0_1px_0_rgba(255,255,255,.07)]">
              <header className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8c46f]/10 text-[#e8c46f]"><FileAudio size={20} /></span>
                <div className="min-w-0 flex-1"><h2 className="truncate font-semibold text-[#f8f3e7]">{project.file.name}</h2><p className="mt-0.5 text-xs text-[#aab8c8]">{formatBytes(project.file.size)} · {formatTime(duration)}</p></div>
                <button onClick={clearProject} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-[#bdc9d7] transition hover:border-red-300/40 hover:text-red-200" aria-label="অন্য audio নির্বাচন করুন"><X size={18} /></button>
              </header>
              <div className="p-5 sm:p-6">
                <Waveform samples={project.samples} duration={duration} start={trimStart} end={trimEnd} current={currentTime} />
                <div className="mt-4 flex items-center gap-3">
                  <button onClick={() => void togglePlayback()} className="grid h-11 w-11 place-items-center rounded-full bg-[#e8c46f] text-[#101d2c] shadow-[0_7px_18px_rgba(0,0,0,.24)] transition active:scale-95" aria-label={isPlaying ? "বিরতি" : "Preview চালু করুন"}>{isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button>
                  <div className="min-w-0 flex-1"><div className="flex justify-between text-xs font-medium text-[#cbd7e4]"><span>{formatTime(currentTime)}</span><span>{formatTime(clipDuration)} নির্বাচিত</span><span>{formatTime(duration)}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#e8c46f]" style={{ width: `${duration ? ((currentTime - trimStart) / Math.max(clipDuration, 0.01)) * 100 : 0}%` }} /></div></div>
                </div>
                <audio ref={playerRef} src={project.url} preload="metadata" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} onTimeUpdate={onTimeUpdate} />
                <p className="mt-4 rounded-xl border border-[#e8c46f]/15 bg-[#e8c46f]/[0.05] px-3 py-2 text-xs leading-5 text-[#d8e3ee]">Preview-তে trim, speed ও volume শুনতে পারবেন। Export-এ fade, normalize ও volume-সহ final WAV তৈরি হবে।</p>
              </div>
            </div>

            <aside className="rounded-[26px] border border-[#e8c46f]/18 bg-[#0a1b2e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
              <div className="flex items-start gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8c46f]/10 text-[#e8c46f]"><Sparkles size={18} /></span><div><h2 className="font-semibold">বাস্তব edit, কম control</h2><p className="mt-1 text-xs leading-5 text-[#b7c5d4]">Trim করুন, level ঠিক করুন, শুরু ও শেষে fade দিন; তারপর WAV export করুন।</p></div></div>
              <button onClick={resetEdits} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-[#dbe5ee] transition hover:border-[#e8c46f]/35 hover:text-[#f6d983]"><RotateCcw size={15} /> সব edit reset</button>
              <dl className="mt-5 divide-y divide-white/10 text-sm"><div className="flex justify-between py-2.5"><dt className="text-[#aebdcb]">Trim-এর পর</dt><dd className="font-semibold text-[#f8f3e7]">{formatTime(clipDuration / speed)}</dd></div><div className="flex justify-between py-2.5"><dt className="text-[#aebdcb]">Speed</dt><dd className="font-semibold text-[#f8f3e7]">{speed.toFixed(2)}×</dd></div><div className="flex justify-between py-2.5"><dt className="text-[#aebdcb]">Output</dt><dd className="font-semibold text-[#e8c46f]">WAV</dd></div></dl>
            </aside>
          </section>
        )}

        {project && (
          <section className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
            <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8c46f]/10 text-[#e8c46f]"><Scissors size={18} /></span><div><h2 className="text-lg font-bold">কোন অংশ রাখবেন?</h2><p className="text-sm text-[#b7c5d4]">শুরু ও শেষ সময় ঠিক করুন।</p></div></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <RangeControl label="শুরু" value={Number(trimStart.toFixed(1))} min={0} max={Math.max(0, trimEnd - 0.1)} step={0.1} suffix="s" onChange={(value) => { setTrimStart(value); if (currentTime < value) setCurrentTime(value); }} />
                <RangeControl label="শেষ" value={Number(trimEnd.toFixed(1))} min={Math.min(duration, trimStart + 0.1)} max={duration} step={0.1} suffix="s" onChange={(value) => setTrimEnd(value)} />
              </div>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8c46f]/10 text-[#e8c46f]"><Volume2 size={18} /></span><div><h2 className="text-lg font-bold">শব্দের level</h2><p className="text-sm text-[#b7c5d4]">Volume বাড়ান বা কমান।</p></div></div>
              <RangeControl label="Volume" value={volumeDb} min={-18} max={12} step={1} suffix=" dB" onChange={setVolumeDb} />
            </div>
          </section>
        )}

        {project && (
          <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RangeControl label="Fade in" value={Number(fadeIn.toFixed(1))} min={0} max={Math.min(8, clipDuration / 2)} step={0.1} suffix="s" onChange={setFadeIn} />
            <RangeControl label="Fade out" value={Number(fadeOut.toFixed(1))} min={0} max={Math.min(8, clipDuration / 2)} step={0.1} suffix="s" onChange={setFadeOut} />
            <RangeControl label="Speed" value={speed} min={0.6} max={1.5} step={0.05} suffix="×" onChange={setSpeed} />
            <label className="flex min-h-[120px] cursor-pointer flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div className="flex items-center gap-2"><Gauge size={17} className="text-[#e8c46f]" /><span className="text-sm font-semibold">Normalize</span></div><p className="text-xs leading-5 text-[#b7c5d4]">সর্বোচ্চ safe level পর্যন্ত audio level সামঞ্জস্য করে।</p><button type="button" onClick={() => setNormalize((value) => !value)} className={`flex h-8 w-14 items-center rounded-full p-1 transition ${normalize ? "bg-[#e8c46f]" : "bg-white/10"}`} aria-pressed={normalize}><span className={`h-6 w-6 rounded-full bg-white shadow transition ${normalize ? "translate-x-6" : "translate-x-0"}`} /></button></label>
          </section>
        )}

        {project && <section className="mt-5 rounded-[26px] border border-[#e8c46f]/25 bg-[linear-gradient(135deg,rgba(232,196,111,.10),rgba(18,42,67,.72))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6"><div><div className="flex items-center gap-2"><Download className="text-[#e8c46f]" size={20} /><h2 className="text-xl font-bold">Final audio export</h2></div><p className="mt-2 text-sm leading-6 text-[#cbd7e4]">নির্বাচিত অংশটি {formatTime(clipDuration / speed)} দৈর্ঘ্যে WAV file হিসেবে download হবে।</p></div><button onClick={() => void exportEditedAudio()} disabled={isExporting || clipDuration <= 0.05} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e8c46f] px-5 py-3.5 font-bold text-[#101d2c] shadow-[0_10px_22px_rgba(0,0,0,.25)] transition hover:bg-[#f2d786] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 sm:w-auto">{isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}{isExporting ? "WAV তৈরি হচ্ছে…" : "WAV export করুন"}</button>{exported && <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#e8c46f] sm:mt-0"><CheckCircle2 size={18} /> Download শুরু হয়েছে</div>}</section>}

        {error && <div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100"><X className="mt-0.5 shrink-0 text-red-300" size={18} /><p className="flex-1">{error}</p><button onClick={() => setError("")} aria-label="বার্তা বন্ধ করুন"><X size={17} /></button></div>}
      </main>
      <Footer />
    </div>
  );
}
