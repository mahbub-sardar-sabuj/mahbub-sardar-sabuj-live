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
  Cpu,
  Info,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

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

// Singleton FFmpeg instance to avoid reloading
let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoaded = false;

export default function VideoUpscaler() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState<2 | 4>(2);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<{ w: number; h: number } | null>(
    null
  );
  const [inputSize, setInputSize] = useState<{ w: number; h: number } | null>(
    null
  );
  const [isDrag, setIsDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [outputFileSize, setOutputFileSize] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const abortRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
    setOutputSize(null);
    setInputSize(null);
    setError(null);
    setElapsedTime(0);
    setOutputFileSize(null);
    if (fileRef.current) fileRef.current.value = "";
    setTimeout(() => {
      abortRef.current = false;
    }, 100);
  }, [stopTimer]);

  const onFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) {
      setError("শুধু ভিডিও ফাইল সাপোর্ট করা হয়।");
      return;
    }
    if (f.size > 500 * 1024 * 1024) {
      setError("ফাইল সাইজ সর্বোচ্চ ৫০০MB।");
      return;
    }
    setError(null);
    setFile(f);
    setStage("idle");
    setOutputUrl(null);
    setOutputFileSize(null);

    // Read video dimensions
    const url = URL.createObjectURL(f);
    const v = document.createElement("video");
    v.onloadedmetadata = () => {
      setInputSize({ w: v.videoWidth, h: v.videoHeight });
      URL.revokeObjectURL(url);
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
      setStatusMsg("FFmpeg.wasm লোড হচ্ছে...");
      setProgress(5);

      // Use local files from /public/ffmpeg/
      const baseURL = "/ffmpeg";

      ffmpegInstance.on("log", ({ message }) => {
        // Parse progress from FFmpeg log
        const timeMatch = message.match(/time=(\d+):(\d+):([\d.]+)/);
        if (timeMatch) {
          // We'll handle progress via the progress event instead
        }
      });

      ffmpegInstance.on("progress", ({ progress: p, time }) => {
        if (p >= 0 && p <= 1) {
          const pct = Math.round(20 + p * 75);
          setProgress(Math.min(pct, 95));
          if (time > 0) {
            const timeStr = formatTime(time / 1_000_000);
            setStatusMsg(`প্রসেসিং... (${timeStr} সম্পন্ন)`);
          }
        }
      });

      try {
        await ffmpegInstance.load({
          coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            "text/javascript"
          ),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            "application/wasm"
          ),
          workerURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.worker.js`,
            "text/javascript"
          ),
        });
        ffmpegLoaded = true;
      } catch (e) {
        ffmpegInstance = null;
        ffmpegLoaded = false;
        throw new Error(
          `FFmpeg লোড করতে ব্যর্থ: ${e instanceof Error ? e.message : String(e)}`
        );
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
      setProgress(10);
      setStatusMsg("ভিডিও পড়া হচ্ছে...");

      // Write input file to FFmpeg virtual FS
      const inputName = `input_${Date.now()}.${file.name.split(".").pop() || "mp4"}`;
      const outputName = `output_${Date.now()}.mp4`;

      const fileData = await fetchFile(file);
      if (abortRef.current) return;

      await ffmpeg.writeFile(inputName, fileData);
      if (abortRef.current) return;

      // Get video info via ffprobe
      let inputW = inputSize?.w || 0;
      let inputH = inputSize?.h || 0;

      if (!inputW || !inputH) {
        try {
          await ffmpeg.ffprobe([
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_streams",
            inputName,
            "-o",
            "probe_out.txt",
          ]);
          const probeData = await ffmpeg.readFile("probe_out.txt", "utf8");
          const probeJson = JSON.parse(probeData as string);
          const videoStream = probeJson.streams?.find(
            (s: { codec_type: string }) => s.codec_type === "video"
          );
          if (videoStream) {
            inputW = videoStream.width || 0;
            inputH = videoStream.height || 0;
          }
          await ffmpeg.deleteFile("probe_out.txt").catch(() => {});
        } catch (_e) {
          // ffprobe failed, use defaults
          inputW = inputW || 1280;
          inputH = inputH || 720;
        }
      }

      const outputW = Math.min(inputW * scale, 7680);
      const outputH = Math.min(inputH * scale, 4320);

      setStage("processing");
      setProgress(20);
      setStatusMsg("আপস্কেল শুরু হচ্ছে...");

      // Build FFmpeg filter
      const vfFilter = [
        `scale=${outputW}:${outputH}:flags=lanczos`,
        `unsharp=luma_msize_x=5:luma_msize_y=5:luma_amount=1.2:chroma_msize_x=5:chroma_msize_y=5:chroma_amount=0.5`,
        `eq=contrast=1.05:saturation=1.1:brightness=0.01`,
      ].join(",");

      // Run FFmpeg upscale
      await ffmpeg.exec([
        "-i",
        inputName,
        "-vf",
        vfFilter,
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "20",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-c:a",
        "copy",
        "-y",
        outputName,
      ]);

      if (abortRef.current) return;

      setProgress(97);
      setStatusMsg("আউটপুট তৈরি হচ্ছে...");

      // Read output
      const outputData = await ffmpeg.readFile(outputName);
      const outputBlob = new Blob(
        [outputData instanceof Uint8Array ? (outputData as BlobPart) : new Uint8Array()],
        { type: "video/mp4" }
      );
      const outputObjectUrl = URL.createObjectURL(outputBlob);

      // Cleanup virtual FS
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});

      stopTimer();
      setProgress(100);
      setOutputUrl(outputObjectUrl);
      setOutputSize({ w: outputW, h: outputH });
      setInputSize({ w: inputW, h: inputH });
      setOutputFileSize(outputBlob.size);
      setStage("done");
      setStatusMsg("সম্পন্ন!");
    } catch (err: unknown) {
      stopTimer();
      if (abortRef.current) return;
      const msg =
        err instanceof Error ? err.message : "অজানা সমস্যা হয়েছে।";
      setError(msg);
      setStage("error");
      setProgress(0);
    }
  }, [file, scale, inputSize, getFFmpeg, startTimer, stopTimer]);

  const handleDownload = useCallback(() => {
    if (!outputUrl || !file) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `upscaled_${scale}x_${file.name.replace(/\.[^.]+$/, "")}.mp4`;
    a.click();
  }, [outputUrl, file, scale]);

  const isProcessing = ["loading_ffmpeg", "reading", "processing"].includes(
    stage
  );

  return (
    <div className="min-h-screen bg-[#060E1A] text-white pt-24 pb-20">
      <Seo
        title="AI ভিডিও আপস্কেলার — 4K/8K ফ্রিতে | Mahbub Sardar Sabuj"
        description="ঝাপসা ভিডিও পরিষ্কার করুন। FFmpeg Lanczos + AI শার্পেনিং দিয়ে 2x বা 4x আপস্কেল করুন। সম্পূর্ণ ব্রাউজারে — কোনো আপলোড নেই।"
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
            ঝাপসা ভিডিও পরিষ্কার করুন —{" "}
            <span className="text-purple-400 font-semibold">2x (4K)</span> বা{" "}
            <span className="text-purple-400 font-semibold">4x (8K)</span>{" "}
            আপস্কেল
          </motion.p>

          {/* Privacy badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs"
          >
            <Cpu size={11} />
            ১০০% ব্রাউজারে প্রসেস — কোনো আপলোড নেই, সম্পূর্ণ প্রাইভেট
          </motion.div>
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
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
              আপস্কেল মাত্রা
            </p>
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
                isDrag
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/10 hover:border-purple-500/40 hover:bg-white/3"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDrag(true);
              }}
              onDragLeave={() => setIsDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDrag(false);
                const f = e.dataTransfer.files?.[0];
                if (f) onFile(f);
              }}
            >
              <Upload className="w-9 h-9 text-gray-600 mb-3" />
              <p className="text-sm text-gray-400 font-medium">
                ভিডিও বেছে নিন
              </p>
              <p className="text-xs text-gray-600 mt-1">
                MP4, WebM, MOV · সর্বোচ্চ ৫০০MB
              </p>
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
              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <Video size={18} className="text-purple-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatBytes(file.size)}
                    {inputSize
                      ? ` · ${inputSize.w}×${inputSize.h} → ${inputSize.w * scale}×${inputSize.h * scale}`
                      : ""}
                  </p>
                </div>
                <button
                  onClick={reset}
                  disabled={isProcessing}
                  className="text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-30 shrink-0"
                >
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
                    <>
                      <RefreshCw className="animate-spin" size={18} />{" "}
                      {statusMsg || "প্রসেস হচ্ছে..."}
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> আপস্কেল করুন
                    </>
                  )}
                </button>
              )}

              {/* Progress bar */}
              {isProcessing && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>{statusMsg}</span>
                    <span className="flex items-center gap-2">
                      {elapsedTime > 0 && (
                        <span className="text-gray-600">
                          {formatTime(elapsedTime)}
                        </span>
                      )}
                      <span>{progress}%</span>
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    ব্রাউজার ট্যাব খোলা রাখুন · ভিডিও সাইজ অনুযায়ী সময় লাগতে
                    পারে
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
              >
                <AlertCircle
                  size={16}
                  className="text-red-400 shrink-0 mt-0.5"
                />
                <p className="text-xs text-red-300 leading-relaxed">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success + output */}
          <AnimatePresence>
            {stage === "done" && outputUrl && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-green-400 text-sm font-bold flex-wrap">
                  <CheckCircle2 size={16} />
                  আপস্কেল সম্পন্ন!
                  {outputSize && (
                    <span className="text-gray-500 font-normal text-xs ml-1">
                      {inputSize?.w}×{inputSize?.h} → {outputSize.w}×
                      {outputSize.h}
                    </span>
                  )}
                  {outputFileSize && (
                    <span className="text-gray-600 font-normal text-xs">
                      · {formatBytes(outputFileSize)}
                    </span>
                  )}
                  {elapsedTime > 0 && (
                    <span className="text-gray-600 font-normal text-xs">
                      · {formatTime(elapsedTime)}
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

        {/* Info note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex items-start gap-2 bg-blue-500/5 border border-blue-500/10 rounded-xl p-4"
        >
          <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="text-gray-400 font-medium">
              কীভাবে কাজ করে:
            </span>{" "}
            আপনার ভিডিও সরাসরি ব্রাউজারে FFmpeg WebAssembly দিয়ে প্রসেস হয়।
            Lanczos3 স্কেলিং, Unsharp Mask শার্পেনিং ও কনট্রাস্ট
            এনহান্সমেন্ট ব্যবহার করা হয়। ভিডিও কোথাও আপলোড হয় না।{" "}
            <span className="text-yellow-500/70">
              প্রথমবার ~৩২MB FFmpeg লোড হবে।
            </span>
          </p>
        </motion.div>

        {/* Tech note */}
        <p className="text-center text-xs text-gray-700 mt-4">
          Lanczos3 স্কেলিং · Unsharp Mask শার্পেনিং · H.264 CRF 20 এনকোডিং ·
          FFmpeg.wasm
        </p>
      </div>
    </div>
  );
}
