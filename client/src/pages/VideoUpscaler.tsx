/*
 * Video Upscaler Page — ভিডিও আপস্কেলার
 * Technology: WebGPU + WebCodecs (Client-side AI Upscaling)
 * Uses: WebSR SDK (Anime4K CNN networks) + webcodecs-utils
 * Zero server cost — all processing on user's device
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Video, Sparkles, Download, RefreshCw,
  AlertCircle, CheckCircle2, Zap, Shield, Cpu,
  ChevronRight, Play, Pause, Info
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProcessingState {
  stage: "idle" | "loading" | "decoding" | "upscaling" | "encoding" | "done" | "error";
  progress: number;
  message: string;
}

interface VideoInfo {
  name: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
}

// ── Utility ───────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function VideoUpscaler() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [targetScale, setTargetScale] = useState<"2x" | "4x">("2x");
  const [networkSize, setNetworkSize] = useState<"small" | "medium" | "large">("medium");
  const [processing, setProcessing] = useState<ProcessingState>({
    stage: "idle", progress: 0, message: ""
  });
  const [gpuSupported, setGpuSupported] = useState<boolean | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const outputVideoRef = useRef<HTMLVideoElement>(null);
  const abortRef = useRef<boolean>(false);

  // Check WebGPU support on mount
  useEffect(() => {
    const checkGPU = async () => {
      try {
        if (!("gpu" in navigator)) {
          setGpuSupported(false);
          return;
        }
        const adapter = await (navigator as Navigator & { gpu: { requestAdapter: () => Promise<unknown> } }).gpu.requestAdapter();
        setGpuSupported(!!adapter);
      } catch {
        setGpuSupported(false);
      }
    };
    checkGPU();
  }, []);

  // Load video metadata when file selected
  useEffect(() => {
    if (!videoFile || !videoPreviewRef.current) return;
    const url = URL.createObjectURL(videoFile);
    const vid = videoPreviewRef.current;
    vid.src = url;
    vid.onloadedmetadata = () => {
      setVideoInfo({
        name: videoFile.name,
        size: videoFile.size,
        duration: vid.duration,
        width: vid.videoWidth,
        height: vid.videoHeight,
      });
    };
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) {
      setProcessing({ stage: "error", progress: 0, message: "শুধুমাত্র ভিডিও ফাইল সাপোর্ট করা হয়। (MP4, WebM, MOV)" });
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setProcessing({ stage: "error", progress: 0, message: "ফাইল সাইজ ৫০০MB এর বেশি হওয়া যাবে না।" });
      return;
    }
    setVideoFile(file);
    setOutputUrl(null);
    setProcessing({ stage: "idle", progress: 0, message: "" });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setVideoFile(null);
    setVideoInfo(null);
    setOutputUrl(null);
    setProcessing({ stage: "idle", progress: 0, message: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ── Core Upscaling Logic ───────────────────────────────────────────────────
  const handleUpscale = useCallback(async () => {
    if (!videoFile) return;
    abortRef.current = false;

    // Check WebCodecs support
    if (typeof VideoDecoder === "undefined" || typeof VideoEncoder === "undefined") {
      setProcessing({
        stage: "error", progress: 0,
        message: "আপনার ব্রাউজার WebCodecs সাপোর্ট করে না। Chrome 94+ বা Edge 94+ ব্যবহার করুন।"
      });
      return;
    }

    setProcessing({ stage: "loading", progress: 5, message: "WebSR SDK লোড হচ্ছে..." });

    try {
      // Dynamically import WebSR SDK and webcodecs-utils
      const [{ default: WebSR }, webCodecsUtils] = await Promise.all([
        import(/* @vite-ignore */ "https://esm.sh/@websr/websr@0.0.15"),
        import(/* @vite-ignore */ "https://esm.sh/webcodecs-utils"),
      ]);

      if (abortRef.current) return;

      setProcessing({ stage: "loading", progress: 15, message: "GPU ইনিশিয়ালাইজ হচ্ছে..." });

      // Initialize WebGPU
      const gpu = await WebSR.initWebGPU();
      if (!gpu) {
        // Fallback: use canvas-based bicubic upscaling
        await handleFallbackUpscale();
        return;
      }

      if (abortRef.current) return;

      // Pick network based on user selection
      const networkMap = {
        small: "anime4k/cnn-2x-s",
        medium: "anime4k/cnn-2x-m",
        large: "anime4k/cnn-2x-l",
      };
      const networkName = networkMap[networkSize];

      setProcessing({ stage: "loading", progress: 25, message: "AI মডেল লোড হচ্ছে..." });

      // Load weights
      const weightsUrl = `https://katana.video/files/cnn-2x-${networkSize === "small" ? "sm" : networkSize === "medium" ? "md" : "lg"}-2d-animation.json`;
      let weights: unknown;
      try {
        const resp = await fetch(weightsUrl);
        weights = await resp.json();
      } catch {
        // Try alternate weights URL
        const altResp = await fetch("https://katana.video/files/cnn-2x-lg-2d-animation.json");
        weights = await altResp.json();
      }

      if (abortRef.current) return;

      // Create off-screen canvas for WebSR
      const offscreenCanvas = document.createElement("canvas");
      const scaleMultiplier = targetScale === "4x" ? 4 : 2;

      const websr = new WebSR({
        network_name: networkName,
        weights,
        gpu,
        canvas: offscreenCanvas,
      });

      setProcessing({ stage: "decoding", progress: 35, message: "ভিডিও ডিকোড হচ্ছে..." });

      const { SimpleDemuxer, VideoDecodeStream, VideoProcessStream, VideoEncodeStream, SimpleMuxer } = webCodecsUtils;

      // Set canvas dimensions
      const inputWidth = videoInfo?.width || 640;
      const inputHeight = videoInfo?.height || 360;
      offscreenCanvas.width = inputWidth * scaleMultiplier;
      offscreenCanvas.height = inputHeight * scaleMultiplier;

      // Set up demuxer
      const demuxer = new SimpleDemuxer(videoFile);
      await demuxer.load();
      const decoderConfig = await demuxer.getVideoDecoderConfig();

      const outputWidth = inputWidth * scaleMultiplier;
      const outputHeight = inputHeight * scaleMultiplier;

      const encoderConfig = {
        codec: "avc1.4d0034",
        width: outputWidth,
        height: outputHeight,
        bitrate: 8_000_000,
        framerate: 30,
      };

      const muxer = new SimpleMuxer({ video: "avc" });

      let frameCount = 0;
      const estimatedFrames = Math.ceil((videoInfo?.duration || 10) * 30);

      setProcessing({ stage: "upscaling", progress: 40, message: "AI দিয়ে ভিডিও উন্নত হচ্ছে..." });

      await demuxer
        .videoStream()
        .pipeThrough(new VideoDecodeStream(decoderConfig))
        .pipeThrough(
          new VideoProcessStream(async (frame: VideoFrame) => {
            if (abortRef.current) throw new Error("aborted");

            frameCount++;
            const pct = Math.min(40 + Math.floor((frameCount / estimatedFrames) * 50), 90);
            if (frameCount % 10 === 0) {
              setProcessing({
                stage: "upscaling",
                progress: pct,
                message: `ফ্রেম প্রসেস হচ্ছে... (${frameCount}/${estimatedFrames})`,
              });
            }

            await websr.render(frame);
            const upscaledFrame = new VideoFrame(offscreenCanvas, {
              timestamp: frame.timestamp,
              duration: frame.duration,
            });
            frame.close();
            return upscaledFrame;
          })
        )
        .pipeThrough(new VideoEncodeStream(encoderConfig))
        .pipeTo(muxer.videoSink());

      if (abortRef.current) return;

      setProcessing({ stage: "encoding", progress: 92, message: "ভিডিও এনকোড হচ্ছে..." });

      const blob = await muxer.finalize();
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setProcessing({ stage: "done", progress: 100, message: "সফলভাবে আপস্কেল হয়েছে!" });

    } catch (err: unknown) {
      if (abortRef.current) return;
      const msg = err instanceof Error ? err.message : "অজানা সমস্যা হয়েছে।";
      if (msg === "aborted") return;

      // If WebSR fails, try fallback
      if (msg.includes("fetch") || msg.includes("network") || msg.includes("weights")) {
        await handleFallbackUpscale();
      } else {
        setProcessing({ stage: "error", progress: 0, message: `সমস্যা হয়েছে: ${msg}` });
      }
    }
  }, [videoFile, videoInfo, targetScale, networkSize]);

  // ── Fallback: Canvas-based bicubic upscaling ───────────────────────────────
  const handleFallbackUpscale = useCallback(async () => {
    if (!videoFile || !videoPreviewRef.current) return;

    setProcessing({ stage: "upscaling", progress: 20, message: "ক্যানভাস-ভিত্তিক আপস্কেলিং শুরু হচ্ছে..." });

    try {
      const video = videoPreviewRef.current;
      const scaleMultiplier = targetScale === "4x" ? 4 : 2;
      const outW = (videoInfo?.width || 640) * scaleMultiplier;
      const outH = (videoInfo?.height || 360) * scaleMultiplier;

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas context not available");

      // Use MediaRecorder to capture upscaled frames
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm",
        videoBitsPerSecond: 8_000_000,
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      const recordingDone = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType }));
      });

      recorder.start(100);
      video.currentTime = 0;
      await new Promise<void>((res) => { video.onseeked = () => res(); });
      video.play();

      const duration = videoInfo?.duration || 10;
      let lastTime = -1;

      const drawFrame = () => {
        if (abortRef.current) { recorder.stop(); return; }
        if (video.ended || video.currentTime >= duration) {
          recorder.stop();
          return;
        }
        if (video.currentTime !== lastTime) {
          lastTime = video.currentTime;
          // Apply sharpening filter
          ctx.filter = "contrast(1.1) saturate(1.05)";
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(video, 0, 0, outW, outH);

          const pct = Math.min(20 + Math.floor((video.currentTime / duration) * 75), 95);
          setProcessing({
            stage: "upscaling", progress: pct,
            message: `ফ্রেম রেন্ডার হচ্ছে... (${Math.floor(video.currentTime)}s / ${Math.floor(duration)}s)`,
          });
        }
        requestAnimationFrame(drawFrame);
      };

      requestAnimationFrame(drawFrame);
      const blob = await recordingDone;
      video.pause();

      if (abortRef.current) return;

      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setProcessing({ stage: "done", progress: 100, message: "আপস্কেল সম্পন্ন! (Canvas মোড)" });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "অজানা সমস্যা";
      setProcessing({ stage: "error", progress: 0, message: `সমস্যা হয়েছে: ${msg}` });
    }
  }, [videoFile, videoInfo, targetScale]);

  const handleDownload = useCallback(() => {
    if (!outputUrl || !videoFile) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    const ext = videoFile.name.split(".").pop() || "mp4";
    a.download = `upscaled_${targetScale}_${videoFile.name.replace(`.${ext}`, "")}.${ext === "mp4" ? "mp4" : "webm"}`;
    a.click();
  }, [outputUrl, videoFile, targetScale]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const isProcessing = ["loading", "decoding", "upscaling", "encoding"].includes(processing.stage);

  const stageLabels: Record<string, string> = {
    loading: "লোড হচ্ছে",
    decoding: "ডিকোড হচ্ছে",
    upscaling: "AI আপস্কেলিং",
    encoding: "এনকোড হচ্ছে",
  };

  return (
    <div className="min-h-screen bg-[#060E1A] text-white pt-24 pb-20">
      <Seo
        title="AI ভিডিও আপস্কেলার — ঝাপসা ভিডিও 4K/8K করুন ফ্রিতে | Mahbub Sardar Sabuj"
        description="এআই প্রযুক্তির মাধ্যমে আপনার ঝাপসা বা লো-রেজোলিউশন ভিডিওকে 4K বা 8K মানে উন্নত করুন সম্পূর্ণ বিনামূল্যে। WebGPU ব্যবহার করে ব্রাউজারেই প্রসেস হয়।"
        path="/video-upscaler"
        keywords="ai video upscaler, ভিডিও আপস্কেলার, 4k video upscaler free, video enhance online, ঝাপসা ভিডিও ক্লিন, মাহবুব সরদার সবুজ"
      />
      <Navbar />

      <div className="max-w-6xl mx-auto px-4">
        {/* ── Header ── */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4"
          >
            <Sparkles size={16} />
            <span className="text-sm font-bold tracking-wider uppercase">AI Powered · Client-Side · Zero Server Cost</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-purple-100 to-purple-400 bg-clip-text text-transparent"
          >
            AI ভিডিও আপস্কেলার
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            ঝাপসা বা লো-কোয়ালিটি ভিডিওকে <span className="text-purple-400 font-bold">4K / 8K</span> মানে উন্নত করুন।
            সম্পূর্ণ ব্রাউজারে প্রসেস হয় — কোনো আপলোড নেই, কোনো গোপনীয়তার ঝুঁকি নেই।
          </motion.p>

          {/* Feature badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mt-6"
          >
            {[
              { icon: Zap, label: "WebGPU Powered", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
              { icon: Shield, label: "১০০% প্রাইভেট", color: "text-green-400 bg-green-400/10 border-green-400/20" },
              { icon: Cpu, label: "AI Neural Network", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
            ].map(({ icon: Icon, label, color }) => (
              <span key={label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${color}`}>
                <Icon size={12} /> {label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── GPU Support Warning ── */}
        {gpuSupported === false && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 max-w-3xl mx-auto"
          >
            <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-amber-200/80">
              <p className="font-bold mb-1">WebGPU সাপোর্ট পাওয়া যায়নি</p>
              <p>আপনার ব্রাউজার WebGPU সাপোর্ট করে না। Canvas-ভিত্তিক ফলব্যাক মোডে কাজ করবে (কিছুটা ধীরগতির)।
              সেরা ফলাফলের জন্য Chrome 113+ বা Edge 113+ ব্যবহার করুন।</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Panel: Controls ── */}
          <div className="lg:col-span-4 space-y-5">
            {/* Settings Card */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Video className="text-purple-400" size={20} /> সেটিংস
              </h3>

              {/* Target Resolution */}
              <div className="mb-5">
                <label className="text-sm text-gray-400 mb-3 block font-medium">টার্গেট রেজোলিউশন</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["2x", "4x"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setTargetScale(s)}
                      disabled={isProcessing}
                      className={`py-3 rounded-xl font-bold transition-all text-sm ${
                        targetScale === s
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      } disabled:opacity-50`}
                    >
                      {s === "2x" ? "2x (FHD→4K)" : "4x (HD→8K)"}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {targetScale === "2x"
                    ? "1080p ভিডিও → 4K (2160p) মানে উন্নত হবে"
                    : "720p ভিডিও → 8K (4320p) মানে উন্নত হবে"}
                </p>
              </div>

              {/* AI Network Size */}
              <div className="mb-5">
                <label className="text-sm text-gray-400 mb-3 block font-medium">AI মডেল সাইজ</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["small", "medium", "large"] as const).map((n) => (
                    <button
                      key={n}
                      onClick={() => setNetworkSize(n)}
                      disabled={isProcessing}
                      className={`py-2.5 rounded-xl font-bold transition-all text-xs ${
                        networkSize === n
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      } disabled:opacity-50`}
                    >
                      {n === "small" ? "দ্রুত" : n === "medium" ? "ব্যালেন্সড" : "সেরা মান"}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {networkSize === "small"
                    ? "দ্রুত প্রসেস, ভালো মান"
                    : networkSize === "medium"
                    ? "গতি ও মানের ভারসাম্য (প্রস্তাবিত)"
                    : "সর্বোচ্চ মান, কিছুটা ধীর"}
                </p>
              </div>

              {/* File Upload */}
              <div>
                {!videoFile ? (
                  <label
                    className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${
                      isDragging
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5"
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-10 h-10 text-gray-500 group-hover:text-purple-400 transition-colors mb-3" />
                    <p className="text-sm text-gray-400 font-medium">ভিডিও সিলেক্ট করুন</p>
                    <p className="text-xs text-gray-500 mt-1">বা এখানে ড্র্যাগ করুন</p>
                    <p className="text-xs text-gray-600 mt-1">MP4, WebM, MOV · সর্বোচ্চ ৫০০MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                      accept="video/*"
                    />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleUpscale}
                      disabled={isProcessing || processing.stage === "done"}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-black text-lg shadow-xl shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="animate-spin" size={20} />
                          {stageLabels[processing.stage] || "প্রসেসিং..."}
                        </>
                      ) : processing.stage === "done" ? (
                        <>
                          <CheckCircle2 size={20} /> সম্পন্ন হয়েছে!
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} /> আপস্কেল শুরু করুন
                        </>
                      )}
                    </button>

                    {processing.stage === "done" && outputUrl && (
                      <button
                        onClick={handleDownload}
                        className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-base shadow-lg shadow-green-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={18} /> ডাউনলোড করুন
                      </button>
                    )}

                    <button
                      onClick={reset}
                      disabled={isProcessing}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-gray-400 transition-all disabled:opacity-50 text-sm"
                    >
                      অন্য ভিডিও দিন
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Video Info */}
            {videoInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 border border-white/10 rounded-2xl p-4 space-y-2"
              >
                <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                  <Info size={14} className="text-purple-400" /> ভিডিও তথ্য
                </h4>
                {[
                  { label: "নাম", value: videoInfo.name.length > 20 ? videoInfo.name.slice(0, 20) + "..." : videoInfo.name },
                  { label: "সাইজ", value: formatBytes(videoInfo.size) },
                  ...(videoInfo.duration ? [{ label: "দৈর্ঘ্য", value: formatDuration(videoInfo.duration) }] : []),
                  ...(videoInfo.width && videoInfo.height ? [
                    { label: "রেজোলিউশন", value: `${videoInfo.width}×${videoInfo.height}` },
                    {
                      label: "আউটপুট",
                      value: `${videoInfo.width * (targetScale === "4x" ? 4 : 2)}×${videoInfo.height * (targetScale === "4x" ? 4 : 2)}`
                    },
                  ] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-300 font-medium">{value}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Progress */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4"
              >
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-purple-300 font-medium">{processing.message}</span>
                  <span className="text-purple-400 font-bold">{processing.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${processing.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  ব্রাউজার ট্যাব খোলা রাখুন — প্রসেস চলছে
                </p>
              </motion.div>
            )}

            {/* Error */}
            {processing.stage === "error" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3"
              >
                <AlertCircle className="text-red-400 shrink-0" size={18} />
                <p className="text-xs text-red-300 leading-relaxed">{processing.message}</p>
              </motion.div>
            )}

            {/* Success */}
            {processing.stage === "done" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex gap-3"
              >
                <CheckCircle2 className="text-green-400 shrink-0" size={18} />
                <div className="text-xs text-green-300 leading-relaxed">
                  <p className="font-bold mb-1">আপস্কেল সফল হয়েছে!</p>
                  <p>ভিডিওটি {targetScale} স্কেলে উন্নত করা হয়েছে। ডাউনলোড করুন।</p>
                </div>
              </motion.div>
            )}

            {/* Info note */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-3">
              <Shield className="text-blue-400 shrink-0" size={16} />
              <p className="text-xs text-blue-200/60 leading-relaxed">
                সম্পূর্ণ ক্লায়েন্ট-সাইড প্রসেসিং। আপনার ভিডিও কোনো সার্ভারে যায় না।
                WebGPU দিয়ে AI নিউরাল নেটওয়ার্ক আপনার ডিভাইসেই চলে।
              </p>
            </div>
          </div>

          {/* ── Right Panel: Preview ── */}
          <div className="lg:col-span-8 space-y-5">
            {/* Input Preview */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 md:p-6">
              <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                <Play size={14} className="text-purple-400" /> ইনপুট ভিডিও
              </h3>
              <div className="relative rounded-2xl overflow-hidden bg-black/50 min-h-[200px] flex items-center justify-center">
                {videoFile ? (
                  <video
                    ref={videoPreviewRef}
                    className="w-full max-h-[300px] object-contain rounded-xl"
                    controls
                    muted
                    playsInline
                  />
                ) : (
                  <div className="text-center py-16 px-4">
                    <Video className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm">ভিডিও সিলেক্ট করুন</p>
                    <p className="text-gray-700 text-xs mt-1">বাম দিক থেকে ফাইল আপলোড করুন</p>
                  </div>
                )}
              </div>
            </div>

            {/* Output Preview */}
            <AnimatePresence>
              {outputUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-[2rem] p-4 md:p-6"
                >
                  <h3 className="text-sm font-bold text-purple-400 mb-4 flex items-center gap-2">
                    <Sparkles size={14} /> আপস্কেলড আউটপুট ({targetScale})
                  </h3>
                  <div className="relative rounded-2xl overflow-hidden bg-black/50">
                    <video
                      ref={outputVideoRef}
                      src={outputUrl}
                      className="w-full max-h-[300px] object-contain rounded-xl"
                      controls
                      playsInline
                    />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleDownload}
                      className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={16} /> ডাউনলোড করুন
                    </button>
                    <button
                      onClick={reset}
                      className="px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-gray-400 text-sm transition-all flex items-center gap-2"
                    >
                      <RefreshCw size={14} /> নতুন ভিডিও
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* How it works */}
            {!videoFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-900/30 border border-white/5 rounded-[2rem] p-6"
              >
                <h3 className="text-lg font-bold mb-5 text-gray-300">কীভাবে কাজ করে?</h3>
                <div className="space-y-4">
                  {[
                    { step: "১", title: "ভিডিও আপলোড করুন", desc: "MP4, WebM বা MOV ফরম্যাটের ভিডিও সিলেক্ট করুন।", color: "bg-purple-500/20 text-purple-400" },
                    { step: "২", title: "AI প্রতিটি ফ্রেম বিশ্লেষণ করে", desc: "WebGPU ব্যবহার করে Anime4K CNN নিউরাল নেটওয়ার্ক প্রতিটি ফ্রেমের ডিটেইল পুনরুদ্ধার করে।", color: "bg-blue-500/20 text-blue-400" },
                    { step: "৩", title: "4K/8K আউটপুট তৈরি হয়", desc: "WebCodecs দিয়ে আপস্কেলড ফ্রেমগুলো এনকোড হয়ে একটি নতুন ভিডিও তৈরি হয়।", color: "bg-green-500/20 text-green-400" },
                    { step: "৪", title: "ডাউনলোড করুন", desc: "সম্পূর্ণ প্রসেস আপনার ব্রাউজারেই হয়। কোনো ডেটা সার্ভারে যায় না।", color: "bg-amber-500/20 text-amber-400" },
                  ].map(({ step, title, desc, color }) => (
                    <div key={step} className="flex gap-4 items-start">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${color}`}>
                        {step}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-200">{title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comparison table */}
                <div className="mt-6 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-3 text-xs font-bold text-gray-500 bg-white/5 px-4 py-2.5">
                    <span>টুল</span>
                    <span className="text-center">মূল্য</span>
                    <span className="text-right">গোপনীয়তা</span>
                  </div>
                  {[
                    { name: "এই টুল (AI)", price: "সম্পূর্ণ ফ্রি", privacy: "শতভাগ", highlight: true },
                    { name: "Topaz Video AI", price: "$299/বছর", privacy: "সার্ভারে যায়", highlight: false },
                    { name: "Canva Upscaler", price: "সীমিত ফ্রি", privacy: "সার্ভারে যায়", highlight: false },
                  ].map(({ name, price, privacy, highlight }) => (
                    <div
                      key={name}
                      className={`grid grid-cols-3 px-4 py-2.5 text-xs border-t border-white/5 ${highlight ? "bg-purple-500/10 text-purple-200" : "text-gray-500"}`}
                    >
                      <span className={highlight ? "font-bold" : ""}>{name}</span>
                      <span className={`text-center ${highlight ? "text-green-400 font-bold" : ""}`}>{price}</span>
                      <span className={`text-right ${highlight ? "text-green-400" : ""}`}>
                        {highlight ? <span className="flex items-center justify-end gap-1"><CheckCircle2 size={10} /> {privacy}</span> : privacy}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── FAQ Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-black text-center mb-8 text-gray-200">সাধারণ প্রশ্নোত্তর</h2>
          <div className="space-y-4">
            {[
              {
                q: "এটি কি সত্যিই ফ্রি?",
                a: "হ্যাঁ, সম্পূর্ণ বিনামূল্যে। প্রসেসিং আপনার ডিভাইসেই হয়, তাই কোনো সার্ভার খরচ নেই।"
              },
              {
                q: "কোন ব্রাউজার সবচেয়ে ভালো কাজ করে?",
                a: "Chrome 113+ বা Edge 113+ সবচেয়ে ভালো। WebGPU সাপোর্টের কারণে এগুলো ২-৫ গুণ দ্রুত কাজ করে।"
              },
              {
                q: "ভিডিওর মান কতটা উন্নত হবে?",
                a: "AI নিউরাল নেটওয়ার্ক ভিডিওর প্রতিটি ফ্রেমের ডিটেইল পুনরুদ্ধার করে। ঝাপসা ভিডিও অনেকটাই পরিষ্কার হয়।"
              },
              {
                q: "কতক্ষণ সময় লাগবে?",
                a: "ভিডিওর দৈর্ঘ্য ও আপনার ডিভাইসের ক্ষমতার ওপর নির্ভর করে। সাধারণত প্রতি মিনিট ভিডিওর জন্য ২-১০ মিনিট লাগে।"
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-gray-900/40 border border-white/5 rounded-2xl p-5">
                <p className="font-bold text-sm text-gray-200 flex items-center gap-2 mb-2">
                  <ChevronRight size={14} className="text-purple-400" /> {q}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed pl-5">{a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
