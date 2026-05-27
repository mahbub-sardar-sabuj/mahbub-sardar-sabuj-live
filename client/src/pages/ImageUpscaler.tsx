import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Browser-side image upscaling using Canvas API with multi-step interpolation.
 * No server dependency — works reliably on Vercel free tier.
 */
function upscaleWithCanvas(
  dataUrl: string,
  scale: number
): Promise<{ imageData: string; originalSize: { width: number; height: number }; upscaledSize: { width: number; height: number }; scale: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const origW = img.naturalWidth;
        const origH = img.naturalHeight;
        const newW = Math.min(origW * scale, 4000);
        const newH = Math.min(origH * scale, 4000);
        // Multi-step upscaling for better quality
        const steps = Math.ceil(Math.log(scale) / Math.log(1.5));
        const stepScale = Math.pow(scale, 1 / steps);
        let currentCanvas = document.createElement("canvas");
        let currentCtx = currentCanvas.getContext("2d")!;
        currentCanvas.width = origW;
        currentCanvas.height = origH;
        currentCtx.drawImage(img, 0, 0);
        for (let s = 0; s < steps; s++) {
          const isLast = s === steps - 1;
          const targetW = isLast ? newW : Math.round(currentCanvas.width * stepScale);
          const targetH = isLast ? newH : Math.round(currentCanvas.height * stepScale);
          const nextCanvas = document.createElement("canvas");
          nextCanvas.width = targetW;
          nextCanvas.height = targetH;
          const nextCtx = nextCanvas.getContext("2d")!;
          nextCtx.imageSmoothingEnabled = true;
          nextCtx.imageSmoothingQuality = "high";
          nextCtx.drawImage(currentCanvas, 0, 0, targetW, targetH);
          currentCanvas = nextCanvas;
          currentCtx = nextCtx;
        }
        const resultDataUrl = currentCanvas.toDataURL("image/png", 1.0);
        resolve({ imageData: resultDataUrl, originalSize: { width: origW, height: origH }, upscaledSize: { width: newW, height: newH }, scale });
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error("ছবি লোড করতে সমস্যা হয়েছে।"));
    img.src = dataUrl;
  });
}

import { Upload, Image as ImageIcon, Sparkles, Download, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

interface UpscaleResult {
  imageData: string;
  originalSize: { width: number; height: number };
  upscaledSize: { width: number; height: number };
  scale: number;
}

export default function ImageUpscaler() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
  const [scale, setScale] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UpscaleResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 8MB check
    if (file.size > 10 * 1024 * 1024) {
      setError("ছবির সাইজ ১০MB-এর বেশি হওয়া যাবে না।");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setUpscaledImage(null);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUpscale = async () => {
    if (!selectedImage) return;
    setIsUpscaling(true);
    setError(null);
    setUpscaledImage(null);
    setResult(null);

    try {
      const data = await upscaleWithCanvas(selectedImage, scale);
      setUpscaledImage(data.imageData);
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "অজানা সমস্যা হয়েছে।";
      setError(msg);
    } finally {
      setIsUpscaling(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setUpscaledImage(null);
    setIsUpscaling(false);
    setError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#060E1A] text-white pt-24 pb-20">
      <Seo 
        title="AI Image Upscaler — ছবির কোয়ালিটি বাড়ান অনলাইনে | Mahbub Sardar Sabuj"
        description="এআই প্রযুক্তির মাধ্যমে আপনার ঝাপসা বা কম রেজোলিউশনের ছবির কোয়ালিটি বাড়ান একদম ফ্রিতে। ২x এবং ৪x আপসেলিং সুবিধা।"
        path="/image-upscaler"
        keywords="ai image upscaler, ছবি পরিষ্কার করার অ্যাপ, upscale image online, ai photo enhancer, মাহবুব সরদার সবুজ"
      />
      <Navbar />
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4"
          >
            <Sparkles size={16} />
            <span className="text-sm font-bold tracking-wider uppercase">AI Powered Tool</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent"
          >
            AI ইমেজ আপসেলার
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            আপনার ঝাপসা বা লো-কোয়ালিটি ছবিকে এআই-এর মাধ্যমে মুহূর্তেই এইচডি (HD) কোয়ালিটিতে রূপান্তর করুন।
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls & Upload */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ImageIcon className="text-blue-500" /> সেটিংস
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-gray-400 mb-3 block">আপসেলিং স্কেল</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[2, 4].map((s) => (
                      <button
                        key={s}
                        onClick={() => setScale(s)}
                        className={`py-3 rounded-xl font-bold transition-all ${
                          scale === s 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {s}x (HD)
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-4">
                  {!selectedImage ? (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 text-gray-500 group-hover:text-blue-500 transition-colors mb-3" />
                        <p className="text-sm text-gray-400">ছবি সিলেক্ট করুন</p>
                        <p className="text-xs text-gray-600 mt-1">সর্বোচ্চ ৮MB</p>
                      </div>
                      <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={handleUpscale}
                        disabled={isUpscaling}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-black text-lg shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isUpscaling ? (
                          <>
                            <RefreshCw className="animate-spin" /> প্রোসেসিং হচ্ছে...
                          </>
                        ) : (
                          <>
                            <Sparkles size={20} /> আপসেল শুরু করুন
                          </>
                        )}
                      </button>
                      <button
                        onClick={reset}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-gray-400 transition-all"
                      >
                        অন্য ছবি দিন
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="text-red-400 shrink-0" size={20} />
                <p className="text-xs text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Success info */}
            {result && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex gap-3">
                <CheckCircle2 className="text-green-400 shrink-0" size={20} />
                <div className="text-xs text-green-300 leading-relaxed">
                  <p className="font-bold mb-1">আপসেল সফল হয়েছে!</p>
                  <p>আগের সাইজ: {result.originalSize.width}×{result.originalSize.height}px</p>
                  <p>নতুন সাইজ: {result.upscaledSize.width}×{result.upscaledSize.height}px ({result.scale}x)</p>
                </div>
              </div>
            )}

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-3">
              <AlertCircle className="text-blue-400 shrink-0" size={20} />
              <p className="text-xs text-blue-200/70 leading-relaxed">
                ছবিগুলো সরাসরি আপনার ব্রাউজারেই প্রসেস হয় — কোনো সার্ভারে আপলোড হয় না। সম্পূর্ণ প্রাইভেট ও নিরাপদ।
              </p>
            </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-8">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-4 md:p-8 min-h-[500px] flex items-center justify-center relative overflow-hidden">
              <AnimatePresence mode="wait">
                {!selectedImage ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <ImageIcon className="text-gray-600" size={40} />
                    </div>
                    <p className="text-gray-500 font-medium">কোনো ছবি আপলোড করা হয়নি</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full flex flex-col items-center"
                  >
                    <div className="relative group max-w-full rounded-2xl overflow-hidden shadow-2xl">
                      <img 
                        src={upscaledImage || selectedImage} 
                        alt="Preview" 
                        className={`max-h-[600px] object-contain transition-all duration-700 ${isUpscaling ? 'blur-md grayscale' : ''}`}
                      />
                      {isUpscaling && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-white font-black tracking-widest uppercase">AI Enhancing...</p>
                          </div>
                        </div>
                      )}
                      {upscaledImage && !isUpscaling && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1">
                            <Sparkles size={12} /> ENHANCED
                          </div>
                        </div>
                      )}
                    </div>
                    {upscaledImage && !isUpscaling && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 flex gap-4"
                      >
                        <a
                          href={upscaledImage}
                          download={`upscaled-${scale}x.png`}
                          className="px-8 py-4 bg-white text-black rounded-2xl font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                          <Download size={20} /> ডাউনলোড করুন
                        </a>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
