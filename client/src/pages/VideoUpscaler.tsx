import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Video,
  Sparkles,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Shield,
  Zap,
  X,
  SplitSquareHorizontal,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

type Stage =
  | "idle"
  | "loading_ffmpeg"
  | "reading"
  | "processing"
  | "done"
  | "error";

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

// Singleton FFmpeg instance
let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoaded = false;

// ─── Before/After Slider Component ───────────────────────────────────────────
function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
}: {
  beforeUrl: string;
  afterUrl: string;
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeVideoRef = useRef<HTMLVideoElement>(null);
  const afterVideoRef = useRef<HTMLVideoElement>(null);
  const syncingRef = useRef(false);

  // Sync playback between both videos
  const syncVideos = useCallback(
    (source: "before" | "after", event: string) => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      const src = source === "before" ? beforeVideoRef.current : afterVideoRef.current;
      const dst = source === "before" ? afterVideoRef.current : beforeVideoRef.current;
      if (!src || !dst) { syncingRef.current = false; return; }

      if (event === "play") dst.play().catch(() => {});
      else if (event === "pause") dst.pause();
      else if (event === "seeked") dst.currentTime = src.currentTime;
      else if (event === "timeupdate") {
        if (Math.abs(dst.currentTime - src.currentTime) > 0.3) {
          dst.currentTime = src.currentTime;
        }
      }
      setTimeout(() => { syncingRef.current = false; }, 50);
    },
    []
  );

  useEffect(() => {
    const bv = beforeVideoRef.current;
    const av = afterVideoRef.current;
    if (!bv || !av) return;

    const handlers: { el: HTMLVideoElement; event: string; fn: EventListener }[] = [
      { el: bv, event: "play",       fn: () => syncVideos("before", "play") },
      { el: bv, event: "pause",      fn: () => syncVideos("before", "pause") },
      { el: bv, event: "seeked",     fn: () => syncVideos("before", "seeked") },
      { el: bv, event: "timeupdate", fn: () => syncVideos("before", "timeupdate") },
      { el: av, event: "play",       fn: () => syncVideos("after", "play") },
      { el: av, event: "pause",      fn: () => syncVideos("after", "pause") },
      { el: av, event: "seeked",     fn: () => syncVideos("after", "seeked") },
    ];
    handlers.forEach(({ el, event, fn }) => el.addEventListener(event, fn));
    return () => handlers.forEach(({ el, event, fn }) => el.removeEventListener(event, fn));
  }, [syncVideos]);

  const updateSlider = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => { e.preventDefault(); setIsDragging(true); updateSlider(e.clientX); };
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => updateSlider(e.clientX);
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [isDragging, updateSlider]);

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => { updateSlider(e.touches[0].clientX); setIsDragging(true); };
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: TouchEvent) => { e.preventDefault(); updateSlider(e.touches[0].clientX); };
    const onEnd = () => setIsDragging(false);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => { window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); };
  }, [isDragging, updateSlider]);

  return (
    <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden bg-black select-none cursor-col-resize"
        style={{ aspectRatio: "16/9" }}
        role="slider"
        tabIndex={0}
        aria-label="আগে এবং পরে ভিডিওর তুলনা"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(sliderPos)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            setSliderPos((value) => Math.max(0, value - 5));
          } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            setSliderPos((value) => Math.min(100, value + 5));
          } else if (e.key === "Home") {
            e.preventDefault();
            setSliderPos(0);
          } else if (e.key === "End") {
            e.preventDefault();
            setSliderPos(100);
          }
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {/* AFTER video (full width, bottom layer) */}
        <video
          ref={afterVideoRef}
          src={afterUrl}
          className="absolute inset-0 w-full h-full object-contain"
          playsInline
          loop
          muted={false}
        />

        {/* BEFORE video (clipped to left side) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <video
            ref={beforeVideoRef}
            src={beforeUrl}
            className="absolute inset-0 h-full object-contain"
            style={{ width: `${(100 / sliderPos) * 100}%`, maxWidth: "none" }}
            playsInline
            loop
            controls
            muted={false}
          />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none z-20"
          style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
        />

        {/* Drag handle */}
        <div
          className="absolute top-1/2 z-30 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className={`w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center transition-transform duration-150 ${isDragging ? "scale-110" : "scale-100"}`}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M6 4L2 9L6 14" stroke="#6d28d9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 4L16 9L12 14" stroke="#6d28d9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-xs font-bold text-gray-300 border border-white/10">
            আগে
          </span>
        </div>
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg bg-purple-600/80 backdrop-blur-sm text-xs font-bold text-white border border-purple-400/30">
            পরে
          </span>
        </div>

      </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VideoUpscaler() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState<2 | 4>(2);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<{ w: number; h: number } | null>(null);
  const [inputSize, setInputSize] = useState<{ w: number; h: number } | null>(null);
  const [isDrag, setIsDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [outputFileSize, setOutputFileSize] = useState<number | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [viewMode, setViewMode] = useState<"slider" | "side">("slider");
  const [isIOS] = useState(() =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const abortRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (inputUrl) URL.revokeObjectURL(inputUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [inputUrl, outputUrl]);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    stopTimer();
    setFile(null);
    setStage("idle");
    setProgress(0);
    setStatusMsg("");
    setOutputUrl(null);
    setInputUrl(null);
    setOutputSize(null);
    setInputSize(null);
    setError(null);
    setElapsedTime(0);
    setOutputFileSize(null);
    setOutputBlob(null);
    if (fileRef.current) fileRef.current.value = "";
    setTimeout(() => { abortRef.current = false; }, 100);
  }, [stopTimer]);

  const onFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) {
      setError("শুধু ভিডিও ফাইল সাপোর্ট করা হয়।");
      return;
    }
    if (f.size > 250 * 1024 * 1024) {
      setError("Browser-এ নির্ভরযোগ্য processing-এর জন্য ফাইল সাইজ সর্বোচ্চ ২৫০MB।");
      return;
    }
    setError(null);
    setFile(f);
    setStage("idle");
    setOutputUrl(null);
    setInputUrl(null);
    setOutputFileSize(null);

    const url = URL.createObjectURL(f);
    setInputUrl(url);
    const v = document.createElement("video");
    v.onloadedmetadata = () => {
      setInputSize({ w: v.videoWidth, h: v.videoHeight });
    };
    v.src = url;
  }, []);

  const getFFmpeg = useCallback(async (): Promise<FFmpeg> => {
    if (ffmpegInstance && ffmpegLoaded) return ffmpegInstance;

    if (!ffmpegInstance) {
      ffmpegInstance = new FFmpeg();
    }

    if (!ffmpegLoaded) {
      setStage("loading_ffmpeg");
      setStatusMsg("প্রস্তুত হচ্ছে...");
      setProgress(5);

      ffmpegInstance.on("progress", ({ progress: p }) => {
        if (p >= 0 && p <= 1) {
          const pct = Math.round(20 + p * 72);
          setProgress(Math.min(pct, 93));
        }
      });

      const origin = window.location.origin;
      const baseURL = `${origin}/ffmpeg-st`;

      try {
        await ffmpegInstance.load({
          coreURL: `${baseURL}/ffmpeg-core-esm.js`,
          wasmURL: `${baseURL}/ffmpeg-core.wasm`,
        });
        ffmpegLoaded = true;
      } catch (e) {
        ffmpegInstance = null;
        ffmpegLoaded = false;
        throw new Error(`প্রস্তুতিতে সমস্যা হয়েছে। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।`);
      }
    }

    return ffmpegInstance;
  }, []);

  const handleUpscale = useCallback(async () => {
    if (!file) return;
    abortRef.current = false;
    setError(null);
    setProgress(0);
    startTimer();

    try {
      const ffmpeg = await getFFmpeg();
      if (abortRef.current) return;

      setStage("reading");
      setProgress(12);
      setStatusMsg("ভিডিও পড়া হচ্ছে...");

      const inputName = `input_${Date.now()}.${file.name.split(".").pop() || "mp4"}`;
      const outputName = `output_${Date.now()}.mp4`;

      const fileData = await fetchFile(file);
      if (abortRef.current) return;

      await ffmpeg.writeFile(inputName, fileData);
      if (abortRef.current) return;

      const inputW = inputSize?.w || 1280;
      const inputH = inputSize?.h || 720;

      const outputW = inputW * scale;
      const outputH = inputH * scale;
      const maxOutputPixels = 16_000_000;
      if (outputW * outputH > maxOutputPixels) {
        throw new Error("নির্বাচিত scale-এ output video browser-এর জন্য খুব বড় হবে। ২× scale বা ছোট resolution ব্যবহার করুন।");
      }

      setStage("processing");
      setProgress(20);
      setStatusMsg("রেজোলিউশন ও শার্পনেস প্রয়োগ হচ্ছে...");

      const vfFilter = [
        `scale=${outputW}:${outputH}:flags=lanczos`,
        `unsharp=luma_msize_x=5:luma_msize_y=5:luma_amount=1.2:chroma_msize_x=5:chroma_msize_y=5:chroma_amount=0.5`,
        `eq=contrast=1.05:saturation=1.1:brightness=0.01`,
      ].join(",");

      await ffmpeg.exec([
        "-i", inputName,
        "-vf", vfFilter,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-c:a", "copy",
        "-y", outputName,
      ]);

      if (abortRef.current) return;

      setProgress(96);
      setStatusMsg("সম্পন্ন করা হচ্ছে...");

      const outputData = await ffmpeg.readFile(outputName);
      const blob = new Blob(
        [outputData instanceof Uint8Array ? (outputData as BlobPart) : new Uint8Array()],
        { type: "video/mp4" }
      );
      const outputObjectUrl = URL.createObjectURL(blob);

      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});

      stopTimer();
      setProgress(100);
      setOutputUrl(outputObjectUrl);
      setOutputSize({ w: outputW, h: outputH });
      setInputSize({ w: inputW, h: inputH });
      setOutputFileSize(blob.size);
      setOutputBlob(blob);
      setStage("done");
      setStatusMsg("সম্পন্ন!");
    } catch (err: unknown) {
      stopTimer();
      if (abortRef.current) return;
      const msg = err instanceof Error ? err.message : "অজানা সমস্যা হয়েছে।";
      setError(msg);
      setStage("error");
      setProgress(0);
    }
  }, [file, scale, inputSize, getFFmpeg, startTimer, stopTimer]);

  const handleDownload = useCallback(async () => {
    if (!outputUrl || !file || !outputBlob) return;
    const fileName = `upscaled_${scale}x_${file.name.replace(/\.[^.]+$/, "")}.mp4`;

    if (isIOS && navigator.canShare) {
      try {
        const shareFile = new File([outputBlob], fileName, { type: "video/mp4" });
        if (navigator.canShare({ files: [shareFile] })) {
          await navigator.share({ files: [shareFile], title: fileName });
          return;
        }
      } catch (e) {
        // fall through
      }
    }

    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [outputUrl, outputBlob, file, scale, isIOS]);

  const isProcessing = ["loading_ffmpeg", "reading", "processing"].includes(stage);

  const scaleLabels: Record<2 | 4, { label: string; sub: string }> = {
    2: { label: "২× রেজোলিউশন", sub: "দ্রুত ও নিরাপদ" },
    4: { label: "৪× রেজোলিউশন", sub: "ছোট ভিডিওর জন্য" },
  };

  return (
    <div className="min-h-screen bg-[#060E1A] text-white pt-24 pb-20">
      <Seo
        title="ভিডিও আপস্কেলার — Browser-based video resize | মাহবুব সরদার সবুজ"
        description="ভিডিওর রেজোলিউশন ২x বা ৪x করুন। সম্পূর্ণ ব্রাউজারে — কোনো আপলোড নেই।"
        path="/video-upscaler"
        keywords="ভিডিও রেজোলিউশন, ভিডিও আপস্কেলার, browser video processing, মাহবুব সরদার সবুজ"
      />
      <Navbar />

      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 mb-5 text-xs font-bold tracking-widest uppercase"
          >
            <Sparkles size={12} /> ভিডিও আপস্কেলার
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-br from-white via-purple-100 to-purple-400 bg-clip-text text-transparent leading-tight"
          >
            ঝাপসা ভিডিও<br />পরিষ্কার করুন
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed"
          >
            আপনার ভিডিও সম্পূর্ণ ব্রাউজারে প্রসেস হয়।
            কোনো তথ্য কোথাও পাঠানো হয় না।
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.19 }}
            className="flex items-center justify-center gap-3 mt-5 flex-wrap"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
              <Shield size={10} /> সম্পূর্ণ প্রাইভেট
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              <Zap size={10} /> কোনো আপলোড নেই
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
              <Sparkles size={10} /> সম্পূর্ণ বিনামূল্যে
            </span>
          </motion.div>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-5"
        >
          {/* Scale selector */}
          <div>
            <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-widest">
              মান নির্বাচন করুন
            </p>
            <div className="grid grid-cols-2 gap-3">
              {([2, 4] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  disabled={isProcessing}
                  className={`relative py-4 px-4 rounded-2xl font-bold text-sm transition-all duration-200 text-left ${
                    scale === s
                      ? "bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl shadow-purple-600/30 ring-1 ring-purple-500/50"
                      : "bg-white/5 text-gray-400 hover:bg-white/8 hover:text-gray-300 ring-1 ring-white/5"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className="block text-base font-black">{scaleLabels[s].label}</span>
                  <span className={`block text-xs mt-0.5 font-normal ${scale === s ? "text-purple-200" : "text-gray-600"}`}>
                    {scaleLabels[s].sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5" />

          {/* Upload zone or file info */}
          {!file ? (
            <label
              className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 group ${
                isDrag
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/8 hover:border-purple-500/50 hover:bg-purple-500/5"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
              onDragLeave={() => setIsDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDrag(false);
                const f = e.dataTransfer.files?.[0];
                if (f) onFile(f);
              }}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-200 ${
                isDrag ? "bg-purple-500/20" : "bg-white/5 group-hover:bg-purple-500/10"
              }`}>
                <Upload className={`w-6 h-6 transition-colors duration-200 ${
                  isDrag ? "text-purple-400" : "text-gray-500 group-hover:text-purple-400"
                }`} />
              </div>
              <p className="text-sm text-gray-300 font-semibold">ভিডিও বেছে নিন</p>
              <p className="text-xs text-gray-600 mt-1.5">
                MP4, WebM, MOV — সর্বোচ্চ ৫০০MB
              </p>
              <p className="text-xs text-gray-700 mt-1">অথবা টেনে এখানে ছাড়ুন</p>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                }}
              />
            </label>
          ) : (
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3.5 ring-1 ring-white/8">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
                  <Video size={16} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-200 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatBytes(file.size)}
                    {inputSize
                      ? ` · ${inputSize.w}×${inputSize.h} → ${inputSize.w * scale}×${inputSize.h * scale}`
                      : ""}
                  </p>
                </div>
                {!isProcessing && (
                  <button
                    onClick={reset}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-all shrink-0"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Action button */}
              {stage !== "done" && (
                <button
                  onClick={handleUpscale}
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-black text-base shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2.5"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="animate-spin" size={17} />
                      <span>{statusMsg || "প্রসেস হচ্ছে..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={17} />
                      <span>আপস্কেল করুন</span>
                    </>
                  )}
                </button>
              )}

              {/* Progress bar */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">{statusMsg}</span>
                      <span className="text-gray-500 flex items-center gap-2">
                        {elapsedTime > 0 && <span>{formatTime(elapsedTime)}</span>}
                        <span className="text-purple-400 font-bold">{progress}%</span>
                      </span>
                    </div>
                    <div className="w-full bg-white/8 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-400 rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-xs text-gray-700 text-center">
                      ব্রাউজার ট্যাব খোলা রাখুন
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3 bg-red-500/8 border border-red-500/20 rounded-2xl p-4"
              >
                <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-red-300 leading-relaxed">{error}</p>
                  <button
                    onClick={reset}
                    className="text-xs text-red-400/70 hover:text-red-400 mt-2 underline underline-offset-2 transition-colors"
                  >
                    আবার চেষ্টা করুন
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ SUCCESS OUTPUT — Before/After Comparison ═══ */}
          <AnimatePresence>
            {stage === "done" && outputUrl && inputUrl && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Success badge */}
                <div className="flex items-center gap-2.5 bg-green-500/8 border border-green-500/20 rounded-2xl px-4 py-3">
                  <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-400">আপস্কেল সম্পন্ন!</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {inputSize?.w}×{inputSize?.h} → {outputSize?.w}×{outputSize?.h}
                      {outputFileSize ? ` · ${formatBytes(outputFileSize)}` : ""}
                      {elapsedTime > 0 ? ` · ${formatTime(elapsedTime)}` : ""}
                    </p>
                  </div>
                </div>

                {/* View mode toggle */}
                <div className="flex items-center gap-2 bg-white/5 rounded-2xl p-1 ring-1 ring-white/8">
                  <button
                    onClick={() => setViewMode("slider")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      viewMode === "slider"
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <SplitSquareHorizontal size={13} />
                    স্লাইডার তুলনা
                  </button>
                  <button
                    onClick={() => setViewMode("side")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      viewMode === "side"
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <Video size={13} />
                    পাশাপাশি দেখুন
                  </button>
                </div>

                {/* Slider view */}
                {viewMode === "slider" && (
                  <motion.div
                    key="slider"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <BeforeAfterSlider beforeUrl={inputUrl} afterUrl={outputUrl} />
                  </motion.div>
                )}

                {/* Side-by-side view */}
                {viewMode === "side" && (
                  <motion.div
                    key="side"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {/* Before */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400">আগে</span>
                        <span className="text-xs text-gray-600">{inputSize?.w}×{inputSize?.h}</span>
                      </div>
                      <div className="rounded-xl overflow-hidden bg-black/60 ring-1 ring-white/8">
                        <video
                          src={inputUrl}
                          className="w-full object-contain"
                          controls
                          playsInline
                          style={{ maxHeight: "200px" }}
                        />
                      </div>

                    </div>

                    {/* After */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-400">পরে</span>
                        <span className="text-xs text-purple-600">{outputSize?.w}×{outputSize?.h}</span>
                      </div>
                      <div className="rounded-xl overflow-hidden bg-black/60 ring-1 ring-purple-500/20">
                        <video
                          src={outputUrl}
                          className="w-full object-contain"
                          controls
                          playsInline
                          style={{ maxHeight: "200px" }}
                        />
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3.5 bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl font-bold text-sm shadow-lg shadow-green-600/20 hover:shadow-green-600/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Download size={15} /> {isIOS ? "শেয়ার / সেভ করুন" : "ডাউনলোড করুন"}
                  </button>
                  <button
                    onClick={reset}
                    className="px-5 py-3.5 bg-white/5 hover:bg-white/10 ring-1 ring-white/8 rounded-2xl font-semibold text-gray-400 hover:text-gray-300 text-sm transition-all duration-200"
                  >
                    নতুন ভিডিও
                  </button>
                </div>


              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>


      </div>
    </div>
  );
}
