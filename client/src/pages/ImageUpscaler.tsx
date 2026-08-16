import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Shield,
  Zap,
  X,
  SplitSquareHorizontal,
  Video,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

// ─── Canvas-based bicubic upscaling ────────────────────────────────────────

function cubicWeight(t: number): number {
  const a = -0.5;
  const at = Math.abs(t);
  if (at <= 1) return (a + 2) * at * at * at - (a + 3) * at * at + 1;
  if (at < 2) return a * at * at * at - 5 * a * at * at + 8 * a * at - 4 * a;
  return 0;
}

function bicubicUpscale(
  src: ImageData,
  dstW: number,
  dstH: number
): ImageData {
  const srcW = src.width;
  const srcH = src.height;
  const srcD = src.data;
  const dst = new ImageData(dstW, dstH);
  const dstD = dst.data;

  const scaleX = srcW / dstW;
  const scaleY = srcH / dstH;

  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const srcX = x * scaleX;
      const srcY = y * scaleY;
      const x0 = Math.floor(srcX);
      const y0 = Math.floor(srcY);

      let r = 0, g = 0, b = 0, a = 0, wSum = 0;

      for (let ky = -1; ky <= 2; ky++) {
        const wy = cubicWeight(srcY - (y0 + ky));
        const sy = Math.max(0, Math.min(srcH - 1, y0 + ky));
        for (let kx = -1; kx <= 2; kx++) {
          const wx = cubicWeight(srcX - (x0 + kx));
          const sx = Math.max(0, Math.min(srcW - 1, x0 + kx));
          const w = wx * wy;
          const idx = (sy * srcW + sx) * 4;
          r += srcD[idx] * w;
          g += srcD[idx + 1] * w;
          b += srcD[idx + 2] * w;
          a += srcD[idx + 3] * w;
          wSum += w;
        }
      }

      const di = (y * dstW + x) * 4;
      dstD[di] = Math.max(0, Math.min(255, Math.round(r / wSum)));
      dstD[di + 1] = Math.max(0, Math.min(255, Math.round(g / wSum)));
      dstD[di + 2] = Math.max(0, Math.min(255, Math.round(b / wSum)));
      dstD[di + 3] = Math.max(0, Math.min(255, Math.round(a / wSum)));
    }
  }
  return dst;
}

function unsharpMask(img: ImageData, amount = 0.6, radius = 1): ImageData {
  const w = img.width;
  const h = img.height;
  const src = img.data;
  const blurred = new Uint8ClampedArray(src.length);
  const out = new ImageData(new Uint8ClampedArray(src), w, h);

  const r = Math.max(1, Math.round(radius));

  // Horizontal pass
  const tmp = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let rv = 0, gv = 0, bv = 0, count = 0;
      for (let k = -r; k <= r; k++) {
        const sx = Math.max(0, Math.min(w - 1, x + k));
        const idx = (y * w + sx) * 4;
        rv += src[idx]; gv += src[idx + 1]; bv += src[idx + 2];
        count++;
      }
      const di = (y * w + x) * 4;
      tmp[di] = rv / count;
      tmp[di + 1] = gv / count;
      tmp[di + 2] = bv / count;
      tmp[di + 3] = src[di + 3];
    }
  }

  // Vertical pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let rv = 0, gv = 0, bv = 0, count = 0;
      for (let k = -r; k <= r; k++) {
        const sy = Math.max(0, Math.min(h - 1, y + k));
        const idx = (sy * w + x) * 4;
        rv += tmp[idx]; gv += tmp[idx + 1]; bv += tmp[idx + 2];
        count++;
      }
      const di = (y * w + x) * 4;
      blurred[di] = rv / count;
      blurred[di + 1] = gv / count;
      blurred[di + 2] = bv / count;
      blurred[di + 3] = src[di + 3];
    }
  }

  const outD = out.data;
  for (let i = 0; i < src.length; i += 4) {
    outD[i] = Math.max(0, Math.min(255, src[i] + amount * (src[i] - blurred[i])));
    outD[i + 1] = Math.max(0, Math.min(255, src[i + 1] + amount * (src[i + 1] - blurred[i + 1])));
    outD[i + 2] = Math.max(0, Math.min(255, src[i + 2] + amount * (src[i + 2] - blurred[i + 2])));
    outD[i + 3] = src[i + 3];
  }
  return out;
}

async function upscaleImage(
  file: File,
  scale: 2 | 4
): Promise<{ dataUrl: string; origW: number; origH: number; outW: number; outH: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const origW = img.naturalWidth;
      const origH = img.naturalHeight;
      const maxOut = 6000;
      const outW = Math.min(origW * scale, maxOut);
      const outH = Math.min(origH * scale, maxOut);

      const srcCanvas = document.createElement("canvas");
      srcCanvas.width = origW;
      srcCanvas.height = origH;
      const srcCtx = srcCanvas.getContext("2d")!;
      srcCtx.drawImage(img, 0, 0);
      const srcData = srcCtx.getImageData(0, 0, origW, origH);

      const upscaled = bicubicUpscale(srcData, outW, outH);
      const sharpened = unsharpMask(upscaled, 0.55, 1);

      const dstCanvas = document.createElement("canvas");
      dstCanvas.width = outW;
      dstCanvas.height = outH;
      const dstCtx = dstCanvas.getContext("2d")!;
      dstCtx.putImageData(sharpened, 0, 0);

      const dataUrl = dstCanvas.toDataURL("image/png", 1.0);
      resolve({ dataUrl, origW, origH, outW, outH });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("ছবি লোড করতে সমস্যা হয়েছে।"));
    };

    img.src = url;
  });
}

// ─── Before/After Slider Component ────────────────────────────────────────────

function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative select-none overflow-hidden rounded-2xl cursor-col-resize bg-black/40"
        style={{ touchAction: "none" }}
        role="slider"
        tabIndex={0}
        aria-label="আগে এবং পরে ছবির তুলনা"
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
        onPointerDown={(e) => {
          isDragging.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          updateSlider(e.clientX);
        }}
        onPointerMove={(e) => { if (isDragging.current) updateSlider(e.clientX); }}
        onPointerUp={() => { isDragging.current = false; }}
        onPointerCancel={() => { isDragging.current = false; }}
      >
        {/* After image — full width, bottom layer */}
        <img
          src={after}
          alt="উন্নত"
          className="block w-full max-h-[420px] object-contain"
          draggable={false}
        />

        {/* Before image — clipped to left */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={before}
            alt="আসল"
            className="block max-h-[420px] object-contain"
            style={{ width: `${(100 / sliderPos) * 100}%`, maxWidth: "none" }}
            draggable={false}
          />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.85)] pointer-events-none z-20"
          style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
        />

        {/* Drag handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center ring-2 ring-white/20">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M6 4L2 9L6 14" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 4L16 9L12 14" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
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
          <span className="px-2.5 py-1 rounded-lg bg-blue-600/80 backdrop-blur-sm text-xs font-bold text-white border border-blue-400/30">
            পরে
          </span>
        </div>

        {/* Hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-gray-400 border border-white/10">
            ← স্লাইডার টেনে তুলনা করুন →
          </span>
        </div>
      </div>

      {/* Label row */}
      <div className="grid grid-cols-2 gap-3 text-center text-xs text-gray-500">
        <div className="bg-white/5 rounded-xl py-2 px-3 ring-1 ring-white/8">
          <span className="block text-gray-400 font-semibold mb-0.5">আগে (Original)</span>
          <span className="text-gray-600">মূল ছবি</span>
        </div>
        <div className="bg-blue-500/8 rounded-xl py-2 px-3 ring-1 ring-blue-500/20">
          <span className="block text-blue-300 font-semibold mb-0.5">পরে (Upscaled)</span>
          <span className="text-blue-500/70">উন্নত মান</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

type Stage = "idle" | "processing" | "done" | "error";

export default function ImageUpscaler() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scale, setScale] = useState<2 | 4>(2);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [dims, setDims] = useState<{ origW: number; origH: number; outW: number; outH: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDrag, setIsDrag] = useState(false);
  const [viewMode, setViewMode] = useState<"slider" | "side">("slider");
  const [elapsedTime, setElapsedTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);

  const startTimer = () => {
    startRef.current = Date.now();
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
  };

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const onFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("শুধু ছবি ফাইল সাপোর্ট করা হয়।");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("ছবির সাইজ সর্বোচ্চ ২০MB।");
      return;
    }
    setError(null);
    setFile(f);
    setOutputUrl(null);
    setDims(null);
    setStage("idle");
    setViewMode("slider");
    setPreviewUrl((previousUrl) => {
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      return URL.createObjectURL(f);
    });
  }, []);

  const reset = useCallback(() => {
    stopTimer();
    setFile(null);
    setPreviewUrl((previousUrl) => {
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      return null;
    });
    setOutputUrl(null);
    setDims(null);
    setStage("idle");
    setProgress(0);
    setError(null);
    setViewMode("slider");
    setElapsedTime(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleUpscale = useCallback(async () => {
    if (!file) return;
    setError(null);
    setStage("processing");
    setProgress(10);
    setViewMode("slider");
    startTimer();

    const progressInterval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.random() * 8 : p));
    }, 300);

    try {
      const result = await upscaleImage(file, scale);
      clearInterval(progressInterval);
      stopTimer();
      setProgress(100);
      setOutputUrl(result.dataUrl);
      setDims({ origW: result.origW, origH: result.origH, outW: result.outW, outH: result.outH });
      setStage("done");
    } catch (err) {
      clearInterval(progressInterval);
      stopTimer();
      setError(err instanceof Error ? err.message : "সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      setStage("error");
      setProgress(0);
    }
  }, [file, scale]);

  const handleDownload = useCallback(async () => {
    if (!outputUrl || !file) return;
    const fileName = `upscaled_${scale}x_${file.name.replace(/\.[^.]+$/, "")}.png`;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIOS && navigator.canShare) {
      try {
        const res = await fetch(outputUrl);
        const blob = await res.blob();
        const shareFile = new File([blob], fileName, { type: "image/png" });
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
  }, [outputUrl, file, scale]);

  const isProcessing = stage === "processing";

  return (
    <div className="min-h-screen bg-[#060E1A] text-white pt-24 pb-20">
      <Seo
        title="ইমেজ আপস্কেলার — ছবির মান উন্নত করুন | মাহবুব সরদার সবুজ"
        description="ঝাপসা বা কম মানের ছবি পরিষ্কার করুন। ২x বা ৪x আপস্কেল করুন। সম্পূর্ণ ব্রাউজারে — কোনো আপলোড নেই।"
        path="/image-upscaler"
        keywords="ইমেজ আপস্কেলার, ছবি পরিষ্কার, মাহবুব সরদার সবুজ"
      />
      <Navbar />

      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 mb-5 text-xs font-bold tracking-widest uppercase"
          >
            <Sparkles size={12} /> ইমেজ আপস্কেলার
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-br from-white via-blue-100 to-blue-400 bg-clip-text text-transparent leading-tight"
          >
            ঝাপসা ছবি<br />পরিষ্কার করুন
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed"
          >
            আপনার ছবি সম্পূর্ণ ব্রাউজারে প্রসেস হয়।
            কোনো তথ্য কোথাও পাঠানো হয় না।
          </motion.p>

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
              <Zap size={10} /> তাৎক্ষণিক
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
                      ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/30 ring-1 ring-blue-500/50"
                      : "bg-white/5 text-gray-400 hover:bg-white/8 hover:text-gray-300 ring-1 ring-white/5"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className="block text-base font-black">{s === 2 ? "২× আপস্কেল" : "৪× আপস্কেল"}</span>
                  <span className={`block text-xs mt-0.5 font-normal ${scale === s ? "text-blue-200" : "text-gray-600"}`}>
                    {s === 2 ? "HD মান" : "Ultra HD মান"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5" />

          {/* Upload zone */}
          {!file ? (
            <label
              className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 group ${
                isDrag
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/8 hover:border-blue-500/50 hover:bg-blue-500/5"
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
                isDrag ? "bg-blue-500/20" : "bg-white/5 group-hover:bg-blue-500/10"
              }`}>
                <Upload className={`w-6 h-6 transition-colors duration-200 ${
                  isDrag ? "text-blue-400" : "text-gray-500 group-hover:text-blue-400"
                }`} />
              </div>
              <p className="text-sm text-gray-300 font-semibold">ছবি বেছে নিন</p>
              <p className="text-xs text-gray-600 mt-1.5">JPG, PNG, WebP — সর্বোচ্চ ২০MB</p>
              <p className="text-xs text-gray-700 mt-1">অথবা টেনে এখানে ছাড়ুন</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
              />
            </label>
          ) : (
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3.5 ring-1 ring-white/8">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                  <ImageIcon size={16} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-200 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                    {dims ? ` · ${dims.origW}×${dims.origH} → ${dims.outW}×${dims.outH}` : ""}
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

              {/* Preview (before processing) */}
              {previewUrl && stage !== "done" && (
                <div className="relative rounded-2xl overflow-hidden bg-black/40 ring-1 ring-white/8">
                  <img
                    src={previewUrl}
                    alt="প্রিভিউ"
                    className={`w-full max-h-[300px] object-contain transition-all duration-500 ${
                      isProcessing ? "blur-sm brightness-75" : ""
                    }`}
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30 backdrop-blur-[2px]">
                      <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-white text-sm font-bold">উন্নত করা হচ্ছে...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action button */}
              {stage !== "done" && (
                <button
                  onClick={handleUpscale}
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black text-base shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2.5"
                >
                  {isProcessing ? (
                    <><RefreshCw className="animate-spin" size={17} /> উন্নত করা হচ্ছে...</>
                  ) : (
                    <><Sparkles size={17} /> আপস্কেল করুন</>
                  )}
                </button>
              )}

              {/* Progress */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">প্রসেস হচ্ছে...</span>
                      <span className="text-blue-400 font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-white/8 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-400 rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </div>
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
                  <button onClick={reset} className="text-xs text-red-400/70 hover:text-red-400 mt-2 underline underline-offset-2 transition-colors">
                    আবার চেষ্টা করুন
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ SUCCESS OUTPUT — Before/After Comparison ═══ */}
          <AnimatePresence>
            {stage === "done" && outputUrl && previewUrl && (
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
                    {dims && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {dims.origW}×{dims.origH} → {dims.outW}×{dims.outH}
                        {elapsedTime > 0 ? ` · ${elapsedTime}s` : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* View mode toggle */}
                <div className="flex items-center gap-2 bg-white/5 rounded-2xl p-1 ring-1 ring-white/8">
                  <button
                    onClick={() => setViewMode("slider")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      viewMode === "slider"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
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
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <Video size={13} />
                    পাশাপাশি দেখুন
                  </button>
                </div>

                {/* Slider view — shown by default */}
                {viewMode === "slider" && (
                  <motion.div
                    key="slider"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <BeforeAfterSlider before={previewUrl} after={outputUrl} />
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
                        {dims && <span className="text-xs text-gray-600">{dims.origW}×{dims.origH}</span>}
                      </div>
                      <div className="rounded-xl overflow-hidden bg-black/40 ring-1 ring-white/8">
                        <img
                          src={previewUrl}
                          alt="আসল ছবি"
                          className="w-full object-contain"
                          style={{ maxHeight: "200px" }}
                        />
                      </div>
                      <div className="text-center text-xs text-gray-600 bg-white/5 rounded-lg py-1.5">
                        মূল ছবি
                      </div>
                    </div>

                    {/* After */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400">পরে</span>
                        {dims && <span className="text-xs text-blue-600">{dims.outW}×{dims.outH}</span>}
                      </div>
                      <div className="rounded-xl overflow-hidden bg-black/40 ring-1 ring-blue-500/20">
                        <img
                          src={outputUrl}
                          alt="উন্নত ছবি"
                          className="w-full object-contain"
                          style={{ maxHeight: "200px" }}
                        />
                      </div>
                      <div className="text-center text-xs text-blue-500 bg-blue-500/8 rounded-lg py-1.5 ring-1 ring-blue-500/20">
                        {scale}× আপস্কেলড
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Stats comparison */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 rounded-xl py-3 px-2 ring-1 ring-white/8">
                    <p className="text-xs text-gray-600 mb-1">রেজোলিউশন</p>
                    {dims && (
                      <>
                        <p className="text-xs font-bold text-gray-400">{dims.origW}×{dims.origH}</p>
                        <p className="text-xs text-blue-400 font-black mt-0.5">↑ {dims.outW}×{dims.outH}</p>
                      </>
                    )}
                  </div>
                  <div className="bg-white/5 rounded-xl py-3 px-2 ring-1 ring-white/8">
                    <p className="text-xs text-gray-600 mb-1">স্কেল</p>
                    <p className="text-2xl font-black text-blue-400">{scale}×</p>
                  </div>
                  <div className="bg-white/5 rounded-xl py-3 px-2 ring-1 ring-white/8">
                    <p className="text-xs text-gray-600 mb-1">সময়</p>
                    <p className="text-xs font-bold text-gray-400">
                      {elapsedTime > 0 ? `${elapsedTime}s` : "—"}
                    </p>
                    <p className="text-xs text-green-400 font-semibold mt-0.5">PNG</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3.5 bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl font-bold text-sm shadow-lg shadow-green-600/20 hover:shadow-green-600/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Download size={15} /> ডাউনলোড / সেভ করুন
                  </button>
                  <button
                    onClick={reset}
                    className="px-5 py-3.5 bg-white/5 hover:bg-white/10 ring-1 ring-white/8 rounded-2xl font-semibold text-gray-400 hover:text-gray-300 text-sm transition-all duration-200"
                  >
                    নতুন ছবি
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-700 mt-6"
        >
          আপনার ছবি শুধু আপনার ডিভাইসে প্রসেস হয় — কোথাও পাঠানো হয় না
        </motion.p>
      </div>
    </div>
  );
}
