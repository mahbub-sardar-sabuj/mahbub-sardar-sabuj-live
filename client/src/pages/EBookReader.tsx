/*
 * Premium E-Book Reader — Mahbub Sardar Sabuj
 * Features: PDF.js reader, AdSense ads, no download, beautiful UI
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
  Home,
  Menu,
  X,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  List,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Link } from "wouter";

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
  "dukkhovilash": {
    title: "আমি বিচ্ছেদকে বলি দুঃখবিলাস",
    author: "মাহবুব সরদার সবুজ",
    cover: "/images/ebooks/dukkhovilash.png",
    pdfUrl: "/ebooks/dukkhovilash.pdf",
    description: "বিচ্ছেদের ব্যথা, হারানোর কষ্ট আর জীবনের গভীর অনুভূতিগুলো এই বইয়ে অনন্যভাবে তুলে ধরা হয়েছে।",
    genre: "আবেগী সাহিত্য",
    year: "২০২৬",
    totalPages: 0,
  },
  "smritir-boshonte": {
    title: "স্মৃতির বসন্তে তুমি",
    author: "মাহবুব সরদার সবুজ",
    cover: "/images/ebooks/smritir-boshonte.png",
    pdfUrl: "/ebooks/smritir-boshonte.pdf",
    description: "স্মৃতির গভীরে হারিয়ে যাওয়া প্রিয় মুহূর্তগুলো নিয়ে লেখা এই বইটি।",
    genre: "কবিতা ও গদ্য",
    year: "২০২৪",
    totalPages: 0,
  },
  "chand-phool": {
    title: "চাঁদফুল",
    author: "মাহবুব সরদার সবুজ",
    cover: "/images/ebooks/chand-phool.png",
    pdfUrl: "/ebooks/chand-phool.pdf",
    description: "প্রকৃতির অপরূপ সৌন্দর্য আর মানবমনের কোমল অনুভূতির মেলবন্ধনে রচিত এই কাব্যগ্রন্থ।",
    genre: "কবিতা",
    year: "২০২৩",
    totalPages: 0,
  },
  "shomoyer-gohvore": {
    title: "সময়ের গহ্বরে",
    author: "মাহবুব সরদার সবুজ",
    cover: "/images/ebooks/shomoyer-gohvore.png",
    pdfUrl: "/ebooks/shomoyer-gohvore.pdf",
    description: "সময়ের স্রোতে হারিয়ে যাওয়া শহর, মানুষ আর স্মৃতির কথা।",
    genre: "গদ্য ও কবিতা",
    year: "২০২৩",
    totalPages: 0,
  },
};

// AdSense বিজ্ঞাপন কম্পোনেন্ট
function AdBanner({ slot, format = "auto", className = "" }: { slot: string; format?: string; className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      if (adRef.current && typeof window !== "undefined") {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      }
    } catch (e) {}
  }, []);
  return (
    <div ref={adRef} className={`ad-container overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-3350204114310360"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

export default function EBookReader() {
  const [, params] = useRoute("/ebooks/read/:slug");
  const slug = params?.slug || "";
  const book = ebookData[slug];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfReady, setPdfReady] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [pageInput, setPageInput] = useState("1");
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);

  // PDF.js লোড করা
  useEffect(() => {
    if ((window as any).pdfjsLib) {
      setPdfJsLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setPdfJsLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // PDF লোড করা
  useEffect(() => {
    if (!pdfJsLoaded || !book) return;
    const pdfjsLib = (window as any).pdfjsLib;
    setIsLoading(true);
    setError("");

    const loadingTask = pdfjsLib.getDocument({
      url: book.pdfUrl,
      disableRange: false,
      disableStream: false,
    });

    loadingTask.promise
      .then((pdf: any) => {
        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);
        setIsLoading(false);
        // setPdfReady triggers a useEffect that renders after canvas is in DOM
        setPdfReady(true);
      })
      .catch((err: any) => {
        console.error("PDF load error:", err);
        setError("PDF লোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।");
        setIsLoading(false);
      });
  }, [pdfJsLoaded, slug]);

  const renderPage = useCallback(async (pageNum: number, pdfDoc?: any) => {
    const pdf = pdfDoc || pdfRef.current;
    if (!pdf || !canvasRef.current) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      const containerWidth = containerRef.current?.clientWidth || 800;
      const viewport = page.getViewport({ scale: 1 });
      const autoScale = Math.min((containerWidth - 40) / viewport.width, scale);
      const scaledViewport = page.getViewport({ scale: autoScale });

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
        background: isDarkMode ? "rgb(30, 30, 30)" : "white",
      };

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
    } catch (err: any) {
      if (err.name !== "RenderingCancelledException") {
        console.error("Render error:", err);
      }
    }
  }, [scale, isDarkMode]);

  // Render when PDF is ready (after canvas mounts)
  useEffect(() => {
    if (pdfReady && pdfRef.current) {
      // Small timeout to ensure canvas is in DOM after isLoading=false
      const timer = setTimeout(() => {
        renderPage(currentPage);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [pdfReady]);

  useEffect(() => {
    if (pdfRef.current && !isLoading) {
      renderPage(currentPage);
    }
  }, [currentPage, scale, isDarkMode, renderPage]);

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
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-center text-white">
          <BookOpen size={64} className="mx-auto mb-4 text-[#D4A843]" />
          <h2 className="text-2xl font-bold mb-2">বইটি পাওয়া যায়নি</h2>
          <Link href="/ebooks">
            <button className="mt-4 bg-[#D4A843] text-[#0D1B2A] px-6 py-2 rounded-full font-bold">
              ই-বুক সংগ্রহে ফিরুন
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={`${book.title} পড়ুন | মাহবুব সরদার সবুজ`}
        description={book.description}
        canonical={`https://mahbubsardarsabuj.com/ebooks/read/${slug}`}
      />

      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gray-950 text-gray-100" : "bg-[#FDF6EC] text-[#0D1B2A]"}`}>
        <Navbar />

        {/* Top Ad Banner */}
        <div className={`w-full py-2 ${isDarkMode ? "bg-gray-900" : "bg-white"} border-b border-gray-200`}>
          <div className="max-w-4xl mx-auto px-4">
            <AdBanner slot="1234567890" format="horizontal" className="min-h-[90px]" />
          </div>
        </div>

        {/* Reader Header */}
        <div className={`sticky top-0 z-40 ${isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"} border-b shadow-sm`}>
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            {/* Left: Book info */}
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/ebooks">
                <button className={`p-2 rounded-lg hover:bg-gray-100 ${isDarkMode ? "hover:bg-gray-800" : ""} transition-colors flex-shrink-0`} title="ই-বুক তালিকায় ফিরুন">
                  <ChevronLeft size={20} />
                </button>
              </Link>
              <img src={book.cover} alt={book.title} className="w-8 h-10 object-cover rounded shadow flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm font-bold truncate">{book.title}</h1>
                <p className="text-xs text-gray-500">{book.author}</p>
              </div>
            </div>

            {/* Center: Page navigation */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg bg-[#D4A843] text-[#0D1B2A] disabled:opacity-40 hover:bg-[#c49535] transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
                <input
                  type="number"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  className={`w-12 text-center text-sm border rounded px-1 py-1 ${isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  min={1}
                  max={totalPages}
                />
                <span className="text-sm text-gray-500">/ {totalPages || "..."}</span>
              </form>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg bg-[#D4A843] text-[#0D1B2A] disabled:opacity-40 hover:bg-[#c49535] transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))} className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`} title="ছোট করুন">
                <ZoomOut size={16} />
              </button>
              <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`} title="বড় করুন">
                <ZoomIn size={16} />
              </button>
              <button onClick={() => setIsDarkMode(d => !d)} className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`} title="রাত/দিন মোড">
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button onClick={toggleFullscreen} className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors hidden md:block`} title="পূর্ণ পর্দা">
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Main Reader Area */}
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* PDF Canvas */}
            <div className="flex-1 min-w-0" ref={containerRef}>
              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-16 h-16 border-4 border-[#D4A843] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-[#D4A843] font-medium">বই লোড হচ্ছে...</p>
                  <p className="text-sm text-gray-500 mt-1">{book.title}</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-16">
                  <BookOpen size={48} className="mx-auto mb-4 text-red-400" />
                  <p className="text-red-400 font-medium">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-[#D4A843] text-[#0D1B2A] px-6 py-2 rounded-full font-bold"
                  >
                    পুনরায় চেষ্টা করুন
                  </button>
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

                  {/* Canvas */}
                  <div
                    className={`shadow-2xl rounded-lg overflow-hidden select-none ${isDarkMode ? "shadow-black" : "shadow-gray-400"}`}
                    style={{ userSelect: "none", WebkitUserSelect: "none" }}
                  >
                    <canvas
                      ref={canvasRef}
                      className="max-w-full"
                      style={{ display: "block" }}
                    />
                  </div>

                  {/* Page indicator */}
                  <div className={`mt-4 px-4 py-2 rounded-full text-sm ${isDarkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-600"} shadow`}>
                    পৃষ্ঠা {currentPage} / {totalPages}
                  </div>

                  {/* Bottom navigation */}
                  <div className="flex items-center gap-4 mt-6">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="flex items-center gap-2 px-6 py-3 bg-[#D4A843] text-[#0D1B2A] rounded-full font-bold disabled:opacity-40 hover:bg-[#c49535] transition-all shadow-lg"
                    >
                      <ChevronLeft size={18} />
                      আগের পাতা
                    </button>
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="flex items-center gap-2 px-6 py-3 bg-[#D4A843] text-[#0D1B2A] rounded-full font-bold disabled:opacity-40 hover:bg-[#c49535] transition-all shadow-lg"
                    >
                      পরের পাতা
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Sidebar Ad */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <AdBanner slot="3456789012" format="vertical" className="min-h-[600px]" />
                {/* Book info card */}
                <div className={`mt-4 rounded-2xl p-4 ${isDarkMode ? "bg-gray-900" : "bg-white"} shadow-lg`}>
                  <img src={book.cover} alt={book.title} className="w-full rounded-lg shadow mb-3" />
                  <h3 className="font-bold text-sm mb-1">{book.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{book.author}</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-[#D4A843]/20 text-[#D4A843] px-2 py-0.5 rounded-full">{book.genre}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{book.year}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{book.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Ad Banner */}
          <div className="mt-8">
            <AdBanner slot="4567890123" format="horizontal" className="min-h-[90px]" />
          </div>

          {/* Other Books Section */}
          <div className={`mt-8 rounded-2xl p-6 ${isDarkMode ? "bg-gray-900" : "bg-white"} shadow-lg`}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-[#D4A843]" />
              আরও পড়ুন
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(ebookData)
                .filter(([s]) => s !== slug)
                .map(([s, b]) => (
                  <Link key={s} href={`/ebooks/read/${s}`}>
                    <div className={`rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform ${isDarkMode ? "bg-gray-800" : "bg-gray-50"} shadow`}>
                      <img src={b.cover} alt={b.title} className="w-full aspect-[3/4] object-cover" />
                      <div className="p-2">
                        <p className="text-xs font-bold line-clamp-2">{b.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{b.genre}</p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
