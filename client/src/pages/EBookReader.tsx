/*
 * Premium E-Book Reader — Mahbub Sardar Sabuj
 * Features: PDF.js reader, AdSense ads, no download, beautiful UI
 * Fix v9: zoom buttons working on mobile, pinch-to-zoom, high-DPI (retina) rendering
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  BookOpen,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  PenLine,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";
import Seo from "@/components/Seo";
import { Link } from "wouter";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// ই-বুক ডেটা
const ebookData: Record<string, {
  title: string;
  author: string;
  cover: string;
  pdfUrl: string;
  description: string;
  genre: string;
  year: string;
  totalPages: number;
}> = {
  "smritir-boshonte": {
    title: "স্মৃতির বসন্তে তুমি",
    author: "মাহবুব সরদার সবুজ",
    cover: "/images/ebooks/smritir-boshonte.jpg",
    pdfUrl: "/ebooks/smritir-boshonte.pdf",
    description: "স্মৃতির গভীরে হারিয়ে যাওয়া প্রিয় মুহূর্তগুলো নিয়ে লেখা এই বইটি।",
    genre: "কবিতা ও গদ্য",
    year: "২০২৪",
    totalPages: 0,
  },
  "chand-phool": {
    title: "চাঁদফুল",
    author: "মাহবুব সরদার সবুজ",
    cover: "/images/ebooks/chand-phool.jpg",
    pdfUrl: "/ebooks/chand-phool.pdf",
    description: "প্রকৃতির অপরূপ সৌন্দর্য আর মানবমনের কোমল অনুভূতির মেলবন্ধনে রচিত এই কাব্যগ্রন্থ।",
    genre: "কবিতা",
    year: "২০২৩",
    totalPages: 0,
  },
  "shomoyer-gohvore": {
    title: "সময়ের গহ্বরে",
    author: "মাহবুব সরদার সবুজ",
    cover: "/images/ebooks/shomoyer-gohvore.jpg",
    pdfUrl: "/ebooks/shomoyer-gohvore.pdf",
    description: "সময়ের স্রোতে হারিয়ে যাওয়া শহর, মানুষ আর স্মৃতির কথা।",
    genre: "গদ্য ও কবিতা",
    year: "২০২৩",
    totalPages: 0,
  },
  "onoboddo-lekha": {
    title: "মাহবুব সরদার সবুজের অনবদ্য লেখা",
    author: "মাহবুব সরদার সবুজ",
    cover: "/images/ebooks/onoboddo-lekha-new.jpg",
    pdfUrl: "/ebooks/onoboddo-lekha.pdf",
    description: "১০০টি জীবনমুখী ও অনুপ্রেরণামূলক লেখার সংকলন। ভালোবাসা, বিচ্ছেদ, জীবনদর্শন ও মানবিক অনুভূতির মিশ্রণে রচিত এই সংকলন।",
    genre: "মিশ্র সাহিত্য",
    year: "২০২৬",
    totalPages: 101,
  },
};

// AdSense Auto ads — Google স্বয়ংক্রিয়ভাবে সঠিক জায়গায় বিজ্ঞাপন দেখাবে
// Manual ad units সরানো হয়েছে কারণ slot IDs এখনো তৈরি হয়নি
// Auto ads চালু আছে AdSense dashboard-এ (pub-3350204114310360)
function AdBanner({ slot: _slot, format: _format = "auto", className = "" }: { slot: string; format?: string; className?: string }) {
  // Auto ads enabled — manual slot not needed until site is approved and slots created
  return <div className={className} style={{ minHeight: 0 }} />;
}

// ডিফল্ট স্কেল: মোবাইলে ছোট, ডেস্কটপে বড়
function getDefaultScale(): number {
  if (typeof window === "undefined") return 1.2;
  return window.innerWidth < 640 ? 0.9 : 1.2;
}

export default function EBookReader() {
  const [, params] = useRoute("/ebooks/read/:slug");
  const [ebookCopied, setEbookCopied] = useState(false);
  const slug = params?.slug || "";
  const book = ebookData[slug];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  // userScale: ব্যবহারকারীর zoom পছন্দ (zoom বাটন ও pinch দিয়ে পরিবর্তন হয়)
  const [userScale, setUserScale] = useState<number>(getDefaultScale);
  // pinch-to-zoom tracking
  const lastPinchDistRef = useRef<number | null>(null);
  const lastPinchScaleRef = useRef<number>(getDefaultScale());
  const [isLoading, setIsLoading] = useState(true);
  const [pdfReady, setPdfReady] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageInput, setPageInput] = useState("1");
  const [progressReadyForSlug, setProgressReadyForSlug] = useState("");

  // এই device-এ শেষ পড়া অবস্থান, zoom ও reading mode সংরক্ষণ ও পুনরুদ্ধার
  useEffect(() => {
    if (!slug || !book) return;
    setProgressReadyForSlug("");
    setCurrentPage(1);
    setPageInput("1");
    setUserScale(getDefaultScale());
    setIsDarkMode(false);
    try {
      const saved = JSON.parse(localStorage.getItem(`mss-ebook-reading-${slug}`) || "null") as { page?: number; scale?: number; dark?: boolean } | null;
      if (saved) {
        const restoredPage = Math.min(Math.max(1, Number(saved.page) || 1), book.totalPages || Number.MAX_SAFE_INTEGER);
        setCurrentPage(restoredPage);
        setPageInput(String(restoredPage));
        if (typeof saved.scale === "number") setUserScale(Math.min(3, Math.max(0.5, saved.scale)));
        if (typeof saved.dark === "boolean") setIsDarkMode(saved.dark);
      }
    } catch {
      // Corrupt local state should never prevent reading.
    } finally {
      setProgressReadyForSlug(slug);
    }
  }, [slug, book]);

  useEffect(() => {
    if (!slug || !book || progressReadyForSlug !== slug) return;
    try {
      localStorage.setItem(`mss-ebook-reading-${slug}`, JSON.stringify({ page: currentPage, scale: userScale, dark: isDarkMode, updatedAt: Date.now() }));
    } catch {
      // Reading still works if device storage is unavailable.
    }
  }, [slug, book, currentPage, userScale, isDarkMode, progressReadyForSlug]);

  // PDF লোড করা
  useEffect(() => {
    if (!book) return;
    setIsLoading(true);
    setError("");
    setPdfReady(false);
    setTotalPages(book.totalPages || 0);

    const loadingTask = pdfjsLib.getDocument({
      url: book.pdfUrl,
      disableRange: false,
      disableStream: false,
    });

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setIsLoading(false);
        setError("PDF লোড হতে বেশি সময় লাগছে। মোবাইল ডেটা/নেটওয়ার্ক ধীর হলে পেজটি রিফ্রেশ করুন।");
      }
    }, 25000);

    loadingTask.promise
      .then((pdf: any) => {
        if (cancelled) return;
        window.clearTimeout(timeout);
        pdfRef.current = pdf;
        setTotalPages(pdf.numPages || book.totalPages || 0);
        setIsLoading(false);
        setPdfReady(true);
      })
      .catch((err: any) => {
        if (cancelled) return;
        window.clearTimeout(timeout);
        console.error("PDF load error:", err);
        setError("PDF লোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।");
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      try { loadingTask.destroy?.(); } catch (_) {}
    };
  }, [slug, book]);

  // ── renderPage: zoom সঠিকভাবে কাজ করে, high-DPI (retina) সাপোর্ট ──────────
  const renderPage = useCallback(async (pageNum: number) => {
    const pdf = pdfRef.current;
    if (!pdf || !canvasRef.current || !containerRef.current) return;

    // চলমান render বাতিল করো
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch (_) {}
      renderTaskRef.current = null;
    }

    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      // কন্টেইনারের প্রস্থ বের করো (padding বাদ দিয়ে); mobile viewport-এ negative/zero width এড়ানো
      const containerWidth = Math.max(280, containerRef.current.clientWidth - 24);

      // PDF পেজের স্বাভাবিক মাপ (scale=1)
      const baseViewport = page.getViewport({ scale: 1 });

      // কন্টেইনারে ফিট করার জন্য base fit scale
      const fitScale = containerWidth / baseViewport.width;

      // ব্যবহারকারীর zoom পছন্দ প্রয়োগ করো (fitScale × userScale)
      // এইভাবে zoom বাটন সত্যিকারের কাজ করে
      const renderScale = fitScale * userScale;

      // High-DPI (Retina) সাপোর্ট: devicePixelRatio দিয়ে গুণ করলে ঝাপসা হবে না
      const dpr = window.devicePixelRatio || 1;
      const finalScale = renderScale * dpr;

      const scaledViewport = page.getViewport({ scale: finalScale });

      // Canvas-এর actual pixel size (high-DPI)
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      // CSS দিয়ে display size নিয়ন্ত্রণ (logical size)
      canvas.style.width = `${scaledViewport.width / dpr}px`;
      canvas.style.height = `${scaledViewport.height / dpr}px`;

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
        background: isDarkMode ? "rgb(30, 30, 30)" : "white",
      };

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.error("Render error:", err);
      }
    }
  }, [userScale, isDarkMode]);

  // PDF ready হলে প্রথম পেজ render করো
  useEffect(() => {
    if (pdfReady && pdfRef.current) {
      const timer = setTimeout(() => renderPage(currentPage), 50);
      return () => clearTimeout(timer);
    }
  }, [pdfReady]);

  // পেজ, zoom বা dark mode পরিবর্তনে re-render
  useEffect(() => {
    if (pdfRef.current && !isLoading) {
      renderPage(currentPage);
    }
  }, [currentPage, userScale, isDarkMode, renderPage]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setPageInput(String(page));
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageInput);
    if (!isNaN(p)) goToPage(p);
  };

  // Zoom বাটন: userScale পরিবর্তন করে (0.5x থেকে 3x পর্যন্ত)
  const zoomIn  = () => setUserScale(s => { const next = Math.min(3.0, parseFloat((s + 0.2).toFixed(1))); lastPinchScaleRef.current = next; return next; });
  const zoomOut = () => setUserScale(s => { const next = Math.max(0.5, parseFloat((s - 0.2).toFixed(1))); lastPinchScaleRef.current = next; return next; });

  // Pinch-to-zoom handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDistRef.current = Math.hypot(dx, dy);
      lastPinchScaleRef.current = userScale;
    }
  }, [userScale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDistRef.current !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const ratio = newDist / lastPinchDistRef.current;
      const newScale = Math.min(3.0, Math.max(0.5, parseFloat((lastPinchScaleRef.current * ratio).toFixed(2))));
      setUserScale(newScale);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastPinchDistRef.current = null;
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Right-click ও keyboard shortcut বন্ধ করা (ডাউনলোড প্রতিরোধ)
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    const preventKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p" || e.key === "u")) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("keydown", preventKeyboard);
    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("keydown", preventKeyboard);
    };
  }, []);

  if (!book) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <div className="text-center" style={{ padding: "2rem" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(201,168,76,.12)", border: "1px solid rgba(201,168,76,.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <BookOpen size={36} style={{ color: "#C9A84C" }} />
          </div>
          <h2 style={{ color: "#F2EDE4", fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif", fontSize: "1.4rem", marginBottom: ".75rem" }}>বইটি পাওয়া যায়নি</h2>
          <p style={{ color: "rgba(242,237,228,.5)", fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif", fontSize: ".9rem", marginBottom: "1.5rem" }}>অনুগ্রহ করে ই-বুক সংগ্রহ থেকে বই বেছে নিন</p>
          <Link
            href="/ebooks"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#D4A843,#f0c060)", color: "#0D1B2A", padding: "13px 28px", borderRadius: 999, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif", fontSize: ".9rem", textDecoration: "none" }}
          >
            ই-বুক সংগ্রহে ফিরুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={`${book.title} পড়ুন | মাহবুব সরদার সবুজ | বিনামূল্যে বাংলা ই-বুক`}
        description={`${book.description} মাহবুব সরদার সবুজের ${book.title} বিনামূল্যে অনলাইনে পড়ুন।`}
        path={`/ebooks/read/${slug}`}
        image={`https://www.mahbubsardarsabuj.com${book.cover}`}
        imageAlt={`${book.title} — মাহবুব সরদার সবুজ`}
        keywords={`${book.title}, মাহবুব সরদার সবুজ বই, বাংলা ই-বুক, বিনামূল্যে বাংলা বই, Mahbub Sardar Sabuj ebook, বাংলা সাহিত্য, বাংলা কবিতা বই`}
        type="book"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Book",
          "name": book.title,
          "description": book.description,
          "author": {
            "@type": "Person",
            "name": "Mahbub Sardar Sabuj",
            "alternateName": "মাহবুব সরদার সবুজ",
            "url": "https://www.mahbubsardarsabuj.com/"
          },
          "inLanguage": "bn",
          "bookFormat": "EBook",
          "isAccessibleForFree": true,
          "url": `https://www.mahbubsardarsabuj.com/ebooks/read/${slug}`,
          "image": `https://www.mahbubsardarsabuj.com${book.cover}`,
          "publisher": {
            "@type": "Person",
            "name": "Mahbub Sardar Sabuj"
          },
          "genre": ["Poetry", "Bengali Literature", "বাংলা সাহিত্য"]
        }}
      />

      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gray-950 text-gray-100" : "bg-[#FDF6EC] text-[#0D1B2A]"}`}>
        <Navbar />

        {/* Top Ad Banner */}
        <div className={`w-full py-2 ${isDarkMode ? "bg-gray-900" : "bg-white"} border-b border-gray-200`}>
          <div className="max-w-4xl mx-auto px-4">
            <AdBanner slot="1234567890" format="horizontal" className="min-h-[90px]" />
          </div>
        </div>

        {/* Reader Header — Mobile: single clean row; Desktop: full info */}
        <div className={`sticky top-0 z-[60] ${isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"} border-b shadow-sm overflow-x-hidden`}>
          <div className="max-w-5xl mx-auto px-2 sm:px-3 py-2 flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2">

            {/* Back button — always visible */}
            <Link
              href="/ebooks"
              className={`flex-shrink-0 p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
              title="ই-বুক তালিকায় ফিরুন"
              aria-label="ই-বুক তালিকায় ফিরুন"
            >
              <ChevronLeft size={20} />
            </Link>

            {/* Book thumbnail + title — desktop only */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0" style={{ display: typeof window !== 'undefined' && window.innerWidth < 768 ? 'none' : 'flex' }}>
              <img src={book.cover} alt={book.title} className="w-7 h-9 object-cover rounded shadow" />
              <div className="min-w-0">
                <h1 className="text-sm font-bold truncate max-w-[150px] lg:max-w-[300px]">{book.title}</h1>
                <p className="text-xs text-gray-500 truncate">{book.author}</p>
              </div>
            </div>

            {/* Page navigation — centered, takes remaining space */}
            <div className="flex items-center justify-center gap-1 sm:gap-2 flex-1 min-w-[128px] order-2 sm:order-none">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg bg-[#D4A843] text-[#0D1B2A] disabled:opacity-40 hover:bg-[#c49535] transition-colors flex-shrink-0"
              >
                <ChevronLeft size={16} />
              </button>
              <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
                <input
                  type="number"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  className={`w-10 sm:w-14 text-center text-xs sm:text-sm border rounded px-0.5 py-1 ${isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  min={1}
                  max={totalPages}
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">/ {totalPages || "..."}</span>
              </form>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg bg-[#D4A843] text-[#0D1B2A] disabled:opacity-40 hover:bg-[#c49535] transition-colors flex-shrink-0"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Zoom & Controls — always visible */}
            <div className="flex w-full sm:w-auto items-center justify-center gap-0.5 sm:gap-1 flex-wrap flex-shrink-0 order-3 sm:order-none max-w-full">
              <button
                onClick={zoomOut}
                onTouchEnd={(e) => { e.preventDefault(); zoomOut(); }}
                className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800 active:bg-gray-700" : "hover:bg-gray-100 active:bg-gray-200"} transition-colors`}
                title="ছোট করুন"
                style={{ touchAction: "manipulation" }}
              >
                <ZoomOut size={18} />
              </button>
              <span className="hidden min-[380px]:inline-block text-xs font-medium text-gray-600 w-9 sm:w-10 text-center select-none" style={{ minWidth: 32 }}>
                {Math.round(userScale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                onTouchEnd={(e) => { e.preventDefault(); zoomIn(); }}
                className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800 active:bg-gray-700" : "hover:bg-gray-100 active:bg-gray-200"} transition-colors`}
                title="বড় করুন"
                style={{ touchAction: "manipulation" }}
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={() => setIsDarkMode(d => !d)}
                className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
                title="রাত/দিন মোড"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors hidden md:block`}
                title="পূর্ণ পর্দা"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              {/* লেখালেখি শর্টকাট বাটন */}
              <Link
                href="/writings"
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#D4A843] text-[#0D1B2A] hover:bg-[#c49535] transition-colors flex-shrink-0`}
                title="লেখালেখি পড়ুন"
              >
                <PenLine size={15} />
                <span className="hidden md:inline text-xs font-bold">লেখালেখি</span>
              </Link>
              {/* শেয়ার/কপি লিংক বাটন */}
              <button
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url).catch(() => {
                    const ta = document.createElement("textarea");
                    ta.value = url;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand("copy");
                    document.body.removeChild(ta);
                  });
                  setEbookCopied(true);
                  setTimeout(() => setEbookCopied(false), 2000);
                }}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors flex-shrink-0 ${ebookCopied ? "bg-green-100 text-green-700" : isDarkMode ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}
                title="লিংক কপি করুন"
              >
                {ebookCopied ? <Check size={15} /> : <Copy size={15} />}
                <span className="hidden md:inline text-xs font-medium">{ebookCopied ? "কপি!" : "লিংক"}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Main Reader Area */}
        <div className="max-w-5xl mx-auto w-full px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
          <div className="flex gap-4 lg:gap-6 min-w-0">

            {/* PDF Canvas */}
            <div className="flex-1 min-w-0" ref={containerRef}>

              {/* Loading State */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24"
                  style={{ gap: "1.2rem" }}
                >
                  {/* Book cover preview while loading */}
                  <div style={{ position: "relative", width: 100, height: 133, marginBottom: ".5rem" }}>
                    <img
                      src={book.cover}
                      alt={book.title}
                      loading="lazy"
                      decoding="async"
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14, boxShadow: "0 22px 55px rgba(0,0,0,.55)", opacity: .7 }}
                    />
                    <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(212,168,67,.25)", borderTopColor: "#D4A843", animation: "spin 1s linear infinite" }} />
                    </div>
                  </div>
                  <p style={{ color: "#D4A843", fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif", fontWeight: 600, fontSize: ".95rem" }}>বই প্রস্তুত হচ্ছে…</p>
                  <p style={{ color: "rgba(242,237,228,.4)", fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif", fontSize: ".82rem", maxWidth: 240, textAlign: "center", lineHeight: 1.7 }}>{book.title}</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </motion.div>
              )}

              {/* Error State */}
              {error && (
                <div className={`mx-auto max-w-2xl text-center py-12 px-4 rounded-2xl shadow-lg ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
                  <img src={book.cover} alt={`${book.title} প্রচ্ছদ`} className="w-28 h-40 object-cover rounded-xl shadow mx-auto mb-4" />
                  <BookOpen size={42} className="mx-auto mb-3 text-red-400" />
                  <p className="text-red-400 font-medium">{error}</p>
                  <h2 className="mt-4 text-xl font-bold">{book.title}</h2>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{book.description}</p>
                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full sm:w-auto bg-[#D4A843] text-[#0D1B2A] px-6 py-2.5 rounded-full font-bold"
                    >
                      পুনরায় চেষ্টা করুন
                    </button>
                    <Link
                      href="/ebooks"
                      className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-bold border text-center ${isDarkMode ? "border-gray-700 text-gray-200" : "border-[#D4A843]/50 text-[#0D1B2A]"}`}
                    >
                      ই-বুক তালিকায় ফিরুন
                    </Link>
                  </div>
                </div>
              )}

              {/* PDF Canvas */}
              {!isLoading && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center"
                >
                  {/* Mid-page Ad (every 5 pages) */}
                  {currentPage % 5 === 0 && (
                    <div className="w-full mb-4">
                      <AdBanner slot="2345678901" format="rectangle" className="min-h-[250px]" />
                    </div>
                  )}

                  {/* Canvas wrapper — overflow-x-auto so user can scroll if zoomed in */}
                  <div
                    className={`w-full max-w-full overflow-x-auto overscroll-x-contain shadow-2xl rounded-lg ${isDarkMode ? "shadow-black" : "shadow-gray-400"}`}
                    style={{ userSelect: "none", WebkitUserSelect: "none", touchAction: "pan-x pan-y" }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className="flex justify-center">
                      <canvas
                        ref={canvasRef}
                        style={{ display: "block", maxWidth: "none" }}
                      />
                    </div>
                  </div>

                  {/* Page indicator */}
                  <div className={`mt-4 px-4 py-2 rounded-full text-sm ${isDarkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-600"} shadow`}>
                    পৃষ্ঠা {currentPage} / {totalPages}
                  </div>

                  {/* Reading Progress Bar */}
                  {totalPages > 0 && (
                    <div style={{ width: "100%", maxWidth: 480, marginTop: "1.2rem" }}>
                      <div style={{ height: 4, borderRadius: 999, background: isDarkMode ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.1)", overflow: "hidden" }}>
                        <motion.div
                          style={{ height: "100%", background: "linear-gradient(90deg,#C9A84C,#E8C87A)", borderRadius: 999 }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentPage / totalPages) * 100}%` }}
                          transition={{ duration: .4, ease: "easeOut" }}
                        />
                      </div>
                      <p style={{ textAlign: "center", marginTop: ".5rem", fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif", fontSize: ".72rem", color: isDarkMode ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.35)" }}>
                        {Math.round((currentPage / totalPages) * 100)}% পড়া হয়েছে
                      </p>
                    </div>
                  )}

                  {/* Bottom navigation — Desktop */}
                  <div className="hidden sm:flex items-center gap-4 mt-6">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D4A843] text-[#0D1B2A] rounded-full font-bold disabled:opacity-40 hover:bg-[#c49535] transition-all shadow-lg"
                      style={{ fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif" }}
                    >
                      <ChevronLeft size={18} />
                      আগের পাতা
                    </button>
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D4A843] text-[#0D1B2A] rounded-full font-bold disabled:opacity-40 hover:bg-[#c49535] transition-all shadow-lg"
                      style={{ fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif" }}
                    >
                      পরের পাতা
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  {/* Mobile Bottom Navigation — Fixed floating bar */}
                  <div
                    className="sm:hidden"
                    style={{
                      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
                      padding: "12px 16px",
                      paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
                      background: isDarkMode
                        ? "rgba(10,12,20,.92)"
                        : "rgba(253,246,236,.95)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      borderTop: isDarkMode ? "1px solid rgba(255,255,255,.07)" : "1px solid rgba(0,0,0,.08)",
                      boxShadow: "0 -12px 40px rgba(0,0,0,.18)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 480, margin: "0 auto" }}>
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        style={{
                          flex: 1, height: 50, borderRadius: 16,
                          background: currentPage <= 1 ? "rgba(212,168,67,.2)" : "linear-gradient(135deg,#D4A843,#f0c060)",
                          color: currentPage <= 1 ? "rgba(212,168,67,.4)" : "#0D1B2A",
                          border: "none", cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                          fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif", fontWeight: 700, fontSize: ".85rem",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          transition: "all .22s",
                        }}
                      >
                        <ChevronLeft size={16} /> আগের
                      </button>
                      <div style={{ textAlign: "center", flexShrink: 0, minWidth: 60 }}>
                        <div style={{ fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif", fontSize: ".7rem", color: isDarkMode ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.35)" }}>পৃষ্ঠা</div>
                        <div style={{ fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif", fontWeight: 700, fontSize: ".9rem", color: isDarkMode ? "#F2EDE4" : "#0D1B2A" }}>{currentPage}/{totalPages}</div>
                      </div>
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        style={{
                          flex: 1, height: 50, borderRadius: 16,
                          background: currentPage >= totalPages ? "rgba(212,168,67,.2)" : "linear-gradient(135deg,#D4A843,#f0c060)",
                          color: currentPage >= totalPages ? "rgba(212,168,67,.4)" : "#0D1B2A",
                          border: "none", cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                          fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif", fontWeight: 700, fontSize: ".85rem",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          transition: "all .22s",
                        }}
                      >
                        পরের <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Sidebar Ad */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <AdBanner slot="3456789012" format="vertical" className="min-h-[600px]" />
                {/* Book info card */}
                <div className={`mt-4 rounded-2xl p-5 ${isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-100"} shadow-lg`}>
                  <img src={book.cover} alt={book.title} className="w-full rounded-xl shadow-lg mb-4" style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.22)" }} />
                  <h3 className="font-bold mb-1" style={{ fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif", fontSize: "0.95rem", lineHeight: 1.55 }}>{book.title}</h3>
                  <p className="text-xs mb-3" style={{ color: isDarkMode ? "rgba(212,168,67,0.85)" : "#C9A84C" }}>{book.author}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs bg-[#D4A843]/20 text-[#D4A843] px-2.5 py-1 rounded-full font-medium">{book.genre}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{book.year}</span>
                  </div>
                  <p className="leading-relaxed" style={{ fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif", fontSize: "0.78rem", lineHeight: 1.85, color: isDarkMode ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)" }}>{book.description.slice(0, 150)}...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Ad Banner */}
          <div className="mt-8">
            <AdBanner slot="4567890123" format="horizontal" className="min-h-[90px]" />
          </div>

          {/* Other Books Section */}
          <div className={`mt-8 rounded-2xl p-6 ${isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-100"} shadow-lg`}>
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif" }}>
              <BookOpen size={20} className="text-[#D4A843]" />
              আরও পড়ুন
            </h3>
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(ebookData)
                .filter(([s]) => s !== slug)
                .map(([s, b]) => (
                  <Link key={s} href={`/ebooks/read/${s}`}>
                    <div className={`rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 ${isDarkMode ? "bg-gray-800 hover:bg-gray-750" : "bg-gray-50 hover:bg-white"} shadow hover:shadow-xl`}>
                      <img src={b.cover} alt={b.title} className="w-full aspect-[3/4] object-cover" />
                      <div className="p-3">
                        <p className="font-bold line-clamp-2 mb-1" style={{ fontFamily: "'AdorshoLipi', 'Noto Serif Bengali', serif", fontSize: "0.82rem", lineHeight: 1.55 }}>{b.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: isDarkMode ? "rgba(212,168,67,0.75)" : "#C9A84C" }}>{b.genre}</p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>

        {/* AdSense Ad */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }}>
          <AdSenseAd adSlot={AD_SLOTS.READER_INLINE} adFormat="auto" fullWidthResponsive={true} />
        </div>
        <Footer />
      </div>
    </>
  );
}
