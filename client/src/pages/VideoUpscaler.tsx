import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Video, Sparkles, Download, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

type Stage = "idle" | "reading" | "uploading" | "processing" | "done" | "error";

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VideoUpscaler() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState<2 | 4>(2);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<{ w: number; h: number } | null>(null);
  const [inputSize, setInputSize] = useState<{ w: number; h: number } | null>(null);
  const [isDrag, setIsDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const reset = useCallback(() => {
    setFile(null); setStage("idle"); setProgress(0); setStatusMsg("");
    setOutputUrl(null); setOutputSize(null); setInputSize(null); setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const onFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) { setError("শুধু ভিডিও ফাইল সাপোর্ট করা হয়।"); return; }
    if (f.size > 150 * 1024 * 1024) { setError("ফাইল সাইজ সর্বোচ্চ ১৫০MB।"); return; }
    setError(null); setFile(f); setStage("idle"); setOutputUrl(null);
    // Read video dimensions
    const url = URL.createObjectURL(f);
    const v = document.createElement("video");
    v.onloadedmetadata = () => {
      setInputSize({ w: v.videoWidth, h: v.videoHeight });
      URL.revokeObjectURL(url);
    };
    v.src = url;
  }, []);

  const handleUpscale = useCallback(async () => {
    if (!file) return;
    setError(null);
    setStage("reading");
    setProgress(5);
    setStatusMsg("ফাইল পড়া হচ্ছে...");

    try {
      // Read file as base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setStage("uploading");
      setProgress(20);
      setStatusMsg("সার্ভারে পাঠানো হচ্ছে...");

      const res = await fetch("/api/video-to-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upscale", videoData: base64, videoName: file.name, scale }),
      });

      setStage("processing");
      setProgress(70);
      setStatusMsg("FFmpeg দিয়ে আপস্কেল হচ্ছে...");

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "আপস্কেল ব্যর্থ হয়েছে।");
      }

      setProgress(100);
      setOutputUrl(data.videoData);
      setOutputSize({ w: data.outputSize.width, h: data.outputSize.height });
      setInputSize({ w: data.originalSize.width, h: data.originalSize.height });
      setStage("done");
      setStatusMsg("সম্পন্ন!");

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "অজানা সমস্যা হয়েছে।";
      setError(msg);
      setStage("error");
      setProgress(0);
    }
  }, [file, scale]);

  const handleDownload = useCallback(() => {
    if (!outputUrl || !file) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `upscaled_${scale}x_${file.name.replace(/\.[^.]+$/, "")}.mp4`;
    a.click();
  }, [outputUrl, file, scale]);

  const isProcessing = ["reading", "uploading", "processing"].includes(stage);

  return (
    <div className="min-h-screen bg-[#060E1A] text-white pt-24 pb-20">
      <Seo
        title="AI ভিডিও আপস্কেলার — 4K/8K ফ্রিতে | Mahbub Sardar Sabuj"
        description="ঝাপসা ভিডিও পরিষ্কার করুন। FFmpeg Lanczos + AI শার্পেনিং দিয়ে 2x বা 4x আপস্কেল করুন।"
        path="/video-upscaler"
        keywords="video upscaler 4k, ভিডিও আপস্কেলার, video enhance free, মাহবুব সরদার সবুজ"
      />
      <Navbar />

      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4 text-xs font-bold tracking-widest uppercase"
          >
            <Sparkles size={13} /> AI Video Upscaler
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent"
          >
            ভিডিও আপস্কেলার
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="text-gray-400 text-base"
          >
            ঝাপসা ভিডিও পরিষ্কার করুন — <span className="text-purple-400 font-semibold">2x (4K)</span> বা <span className="text-purple-400 font-semibold">4x (8K)</span> আপস্কেল
          </motion.p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6"
        >
          {/* Scale selector */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">আপস্কেল মাত্রা</p>
            <div className="grid grid-cols-2 gap-3">
              {([2, 4] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  disabled={isProcessing}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${
                    scale === s
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  } disabled:opacity-40`}
                >
                  {s === 2 ? "2× — 4K" : "4× — 8K"}
                </button>
              ))}
            </div>
          </div>

          {/* Upload zone */}
          {!file ? (
            <label
              className={`flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                isDrag ? "border-purple-500 bg-purple-500/10" : "border-white/10 hover:border-purple-500/40 hover:bg-white/3"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
              onDragLeave={() => setIsDrag(false)}
              onDrop={(e) => { e.preventDefault(); setIsDrag(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
            >
              <Upload className="w-9 h-9 text-gray-600 mb-3" />
              <p className="text-sm text-gray-400 font-medium">ভিডিও বেছে নিন</p>
              <p className="text-xs text-gray-600 mt-1">MP4, WebM, MOV · সর্বোচ্চ ১৫০MB</p>
              <input ref={fileRef} type="file" accept="video/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
            </label>
          ) : (
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <Video size={18} className="text-purple-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatBytes(file.size)}
                    {inputSize ? ` · ${inputSize.w}×${inputSize.h} → ${inputSize.w * scale}×${inputSize.h * scale}` : ""}
                  </p>
                </div>
                <button onClick={reset} disabled={isProcessing}
                  className="text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-30 shrink-0">
                  <RefreshCw size={15} />
                </button>
              </div>

              {/* Action buttons */}
              {stage !== "done" && (
                <button
                  onClick={handleUpscale}
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-black text-base shadow-xl shadow-purple-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <><RefreshCw className="animate-spin" size={18} /> {statusMsg || "প্রসেস হচ্ছে..."}</>
                  ) : (
                    <><Sparkles size={18} /> আপস্কেল করুন</>
                  )}
                </button>
              )}

              {/* Progress bar */}
              {isProcessing && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>{statusMsg}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">ব্রাউজার ট্যাব খোলা রাখুন</p>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
              >
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 leading-relaxed">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success + output */}
          <AnimatePresence>
            {stage === "done" && outputUrl && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                  <CheckCircle2 size={16} />
                  আপস্কেল সম্পন্ন!
                  {outputSize && (
                    <span className="text-gray-500 font-normal text-xs ml-1">
                      {inputSize?.w}×{inputSize?.h} → {outputSize.w}×{outputSize.h}
                    </span>
                  )}
                </div>

                {/* Output video preview */}
                <div className="rounded-2xl overflow-hidden bg-black border border-purple-500/20">
                  <video
                    src={outputUrl}
                    className="w-full max-h-[360px] object-contain"
                    controls
                    playsInline
                  />
                </div>

                {/* Download + new */}
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3.5 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> ডাউনলোড করুন
                  </button>
                  <button
                    onClick={reset}
                    className="px-5 py-3.5 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-gray-400 text-sm transition-all"
                  >
                    নতুন
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tech note */}
        <p className="text-center text-xs text-gray-700 mt-6">
          Lanczos3 স্কেলিং · Unsharp Mask শার্পেনিং · H.264 CRF 18 এনকোডিং
        </p>
      </div>
    </div>
  );
}
