/**
 * Gallery.tsx — ফটো গ্যালারি পেজ
 * সব ছবি compact masonry grid + Lightbox (no filter tabs, no featured image)
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Images, ZoomIn, Copy, Check, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import AdSenseAd from "@/components/AdSenseAd";
import { useLocation } from "wouter";

// ── Assets ────────────────────────────────────────────────────────────────────
const PROFILE_1 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";
const PROFILE_2 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile2_57482935.jpg";
const BOOK_COVER = "/images/book-cover-20260328.jpg";
const BOOKS_COLLECTION = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/books-collection_0b763103.jpg";
const WRITING_SHOWCASE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/writing1_9f5104e4.png";
const WRITING2 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/writing2_d3a49cae.jpg";
const BOOK_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/book-photo_1173642f.jpg";

// ── Gallery images ────────────────────────────────────────────────────────────
const galleryImages = [
  { src: "/photos/Photoroom_20260224_033915.webp",   caption: "মাহবুব সরদার সবুজ" },
  { src: "/photos/edited_image_blazer.webp",          caption: "ব্লেজারে লেখক" },
  { src: "/photos/bengali_olive_shirt_man_art.webp",  caption: "আর্ট পোর্ট্রেট" },
  { src: "/photos/bengali_sofa_man_art.webp",         caption: "আর্ট পোর্ট্রেট ২" },
  { src: "/photos/Photoroom_20260105_192556.webp",    caption: "লেখকের মুহূর্ত" },
  { src: "/photos/IMG_63832.webp",                    caption: "বিশেষ মুহূর্ত" },
  { src: "/photos/IMG_6494.webp",                    caption: "স্মরণীয় মুহূর্ত" },
  { src: "/photos/IMG_6021.webp",                     caption: "লেখকের ছবি" },
  { src: "/photos/IMG_6015.webp",                     caption: "বিশেষ দিন" },
  { src: "/photos/IMG_6032.webp",                     caption: "আনন্দের মুহূর্ত" },
  { src: "/photos/FullSizeRender.webp",               caption: "লেখকের পোর্ট্রেট" },
  { src: "/photos/FullSizeRender_01.webp",            caption: "প্রিয় মুহূর্ত" },
  { src: "/photos/FullSizeRender_02.webp",            caption: "স্মৃতির পাতা" },
  { src: "/photos/IMG_1743.webp",                     caption: "লেখকের ছবি" },
  { src: "/photos/IMG_5349.webp",                    caption: "বিশেষ মুহূর্ত" },
  { src: "/photos/IMG_4706.webp",                     caption: "স্মরণীয় দিন" },
  { src: "/photos/IMG_3070.webp",                     caption: "লেখকের ছবি" },
  { src: "/photos/IMG_3862.webp",                    caption: "প্রিয় মুহূর্ত" },
  { src: "/photos/IMG_1014.webp",                    caption: "স্মৃতির ছবি" },
  { src: "/photos/IMG_2472.webp",                    caption: "বিশেষ দিন" },
  { src: "/photos/IMG_9833.webp",                     caption: "লেখকের মুহূর্ত" },
  { src: "/photos/IMG_9832.webp",                    caption: "আনন্দের ছবি" },
  { src: "/photos/IMG_9830.webp",                     caption: "স্মরণীয় মুহূর্ত" },
  { src: "/photos/IMG_9832_01.webp",                 caption: "প্রিয় স্মৃতি" },
  { src: "/photos/photo-output.webp",                 caption: "কবিতার ডিজাইন" },
  { src: "/photos/Addalittlebitofbodytext.png.webp",  caption: "কবিতার ডিজাইন ২" },
  { src: "/photos/IMG_6966.webp",                     caption: "বাবা" },
  { src: "/photos/IMG_6969.webp",                     caption: "মাহবুব সরদার সবুজ — অফিসে" },
  { src: "/photos/IMG_6967.webp",                     caption: "লেখকের পোর্ট্রেট" },
  { src: "/photos/IMG_6965.webp",                     caption: "Front Tech অফিসে" },
  { src: "/photos/IMG_6964.webp",                    caption: "মরুভূমিতে লেখক" },
  { src: "/photos/IMG_6963.webp",                     caption: "প্রকৃতির কোলে" },
  { src: "/photos/IMG_6962.webp",                     caption: "বিশেষ মুহূর্ত" },
  { src: "/photos/IMG_6961.webp",                     caption: "লেখকের ছবি" },
  { src: PROFILE_1,          caption: "মাহবুব সরদার সবুজ" },
  { src: PROFILE_2,          caption: "লেখার মুহূর্তে" },
  { src: BOOK_COVER,         caption: "আমি বিচ্ছেদকে বলি দুঃখবিলাস" },
  { src: BOOKS_COLLECTION,   caption: "ই-বুক সংগ্রহ" },
  { src: WRITING_SHOWCASE,   caption: "কবিতার পাতা" },
  { src: WRITING2,           caption: "কবিতার পৃষ্ঠা" },
  { src: BOOK_PHOTO,         caption: "দুঃখবিলাস — বইয়ের সাথে" },
];

type GalleryImage = { src: string; caption: string };

export default function Gallery() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [galleryCopied, setGalleryCopied] = useState(false);
  const [location] = useLocation();

  // URL-এ ?photo=N থাকলে সরাসরি সেই ছবির lightbox খোলা
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const photoParam = params.get("photo");
    if (photoParam !== null) {
      const idx = parseInt(photoParam, 10);
      if (!isNaN(idx) && idx >= 0 && idx < galleryImages.length) {
        setLightboxIdx(idx);
      }
    }
  }, [location]);
  // কীবোর্ড নেভিগেশন — ArrowLeft, ArrowRight, Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIdx(null);
        const url = new URL(window.location.href);
        url.searchParams.delete("photo");
        window.history.replaceState(null, "", url.toString());
      } else if (e.key === "ArrowLeft") {
        setLightboxIdx(prev => prev === null ? null : (prev - 1 + galleryImages.length) % galleryImages.length);
      } else if (e.key === "ArrowRight") {
        setLightboxIdx(prev => prev === null ? null : (prev + 1) % galleryImages.length);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    const url = new URL(window.location.href);
    url.searchParams.set("photo", String(idx));
    window.history.replaceState(null, "", url.toString());
  };
  const closeLightbox = () => {
    setLightboxIdx(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("photo");
    window.history.replaceState(null, "", url.toString());
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIdx === null) return;
    setLightboxIdx((lightboxIdx - 1 + galleryImages.length) % galleryImages.length);
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIdx === null) return;
    setLightboxIdx((lightboxIdx + 1) % galleryImages.length);
  };

  const currentImg = lightboxIdx !== null ? galleryImages[lightboxIdx] : null;

  return (
    <div style={{ minHeight: "100vh", background: "#060E1A" }}>
      <Seo
        title="গ্যালারি | মাহবুব সরদার সবুজের ছবি সংগ্রহ | Mahbub Sardar Sabuj Gallery"
        description="মাহবুব সরদার সবুজের জীবনের বিশেষ মুহূর্ত, শিল্পকর্ম, বই প্রকাশনা ও সাহিত্য অনুষ্ঠানের ফটো গ্যালারি। বাংলাদেশের জনপ্রিয় কবি ও লেখকের ছবি সংগ্রহ।"
        keywords="মাহবুব সরদার সবুজ গ্যালারি, Mahbub Sardar Sabuj photos, বাংলা লেখক ছবি, বাংলাদেশি কবির ছবি"
      />
      <Navbar />

      {/* ── Hero Header ── */}
      <div style={{
        paddingTop: "calc(var(--site-nav-offset, 98px) + 2rem)",
        paddingBottom: "2.5rem",
        textAlign: "center",
        background: "linear-gradient(180deg, #0A1628 0%, #060E1A 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 300,
          background: "radial-gradient(ellipse, rgba(201,168,76,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: "1rem" }}>
            <div style={{ width: 50, height: 1, background: "rgba(201,168,76,0.4)" }} />
            <Images size={20} color="#C9A84C" />
            <span style={{
              fontFamily: "'Noto Sans Bengali', sans-serif",
              color: "#C9A84C",
              fontSize: "0.75rem",
              letterSpacing: "0.22em",
            }}>ফটো গ্যালারি</span>
            <Images size={20} color="#C9A84C" />
            <div style={{ width: 50, height: 1, background: "rgba(201,168,76,0.4)" }} />
          </div>
          <h1 style={{
            fontFamily: "'Tiro Bangla', serif",
            color: "#FAF6EF",
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            fontWeight: 400,
            margin: "0 0 0.75rem",
          }}>গ্যালারি</h1>
          <p style={{
            fontFamily: "'Noto Sans Bengali', sans-serif",
            color: "rgba(250,246,239,0.55)",
            fontSize: "0.9rem",
            maxWidth: 440,
            margin: "0 auto",
          }}>
            মাহবুব সরদার সবুজের জীবনের বিশেষ মুহূর্ত, শিল্পকর্ম ও স্মৃতির সংগ্রহ
          </p>
          <p style={{
            fontFamily: "'Noto Sans Bengali', sans-serif",
            color: "rgba(201,168,76,0.6)",
            fontSize: "0.78rem",
            marginTop: "0.6rem",
          }}>
            {galleryImages.length}টি ছবি — ক্লিক করলে বড় হবে
          </p>
        </motion.div>
      </div>

      {/* ── Compact Masonry Grid ── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem 1rem 5rem" }}>
        <div style={{
          columns: "5 160px",
          columnGap: "8px",
          lineHeight: 0,
        }}>
          {galleryImages.map((img, i) => (
            <motion.div
              key={img.src + i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.018, 0.45) }}
              onClick={() => openLightbox(i)}
              style={{
                display: "inline-block",
                width: "100%",
                marginBottom: "8px",
                borderRadius: 8,
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
                lineHeight: 0,
                breakInside: "avoid",
                border: "1.5px solid rgba(201,168,76,0.06)",
              }}
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={img.src}
                alt={`${img.caption || 'মাহবুব সরদার সবুজ গ্যালারি ছবি'} - গ্যালারি`}
                loading="lazy"
                decoding="async"
                style={{
                  width: "100%",
                  display: "block",
                  objectFit: "cover",
                  transition: "transform 0.4s ease",
                }}
                onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
              />
              {/* Hover overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(6,14,26,0.85) 0%, rgba(6,14,26,0.2) 50%, transparent 100%)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "flex-start",
                  padding: "8px",
                }}
              >
                <ZoomIn size={14} color="#C9A84C" style={{ marginBottom: 3 }} />
                <span style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "rgba(250,246,239,0.9)",
                  fontSize: "0.68rem",
                  lineHeight: 1.4,
                }}>{img.caption}</span>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {currentImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeLightbox}
            style={{
              position: "fixed", inset: 0, zIndex: 9999,
              background: "rgba(6,14,26,0.97)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Prev */}
            <motion.button
              whileHover={{ scale: 1.1, background: "rgba(201,168,76,0.25)" }}
              onClick={goPrev}
              style={{
                position: "fixed", left: 12, top: "50%", transform: "translateY(-50%)",
                background: "rgba(201,168,76,0.12)",
                border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: "50%",
                width: 46, height: 46,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#C9A84C", zIndex: 10000,
                transition: "background 0.2s",
              }}
            >
              <ChevronLeft size={22} />
            </motion.button>

            {/* Image */}
            <motion.div
              key={lightboxIdx}
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              style={{ position: "relative", maxWidth: 900, width: "100%" }}
            >
              <img
                src={currentImg.src}
                alt={`${currentImg.caption || 'মাহবুব সরদার সবুজ গ্যালারি ছবি'} - মাহবুব সরদার সবুজের গ্যালারি`}
                decoding="async"
                style={{
                  width: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  borderRadius: 14,
                  boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.15)",
                  display: "block",
                }}
              />
              {/* Caption + Share */}
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <p style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "rgba(250,246,239,0.85)",
                  fontSize: "0.95rem",
                  margin: "0 0 4px",
                }}>{currentImg.caption}</p>
                <p style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "rgba(201,168,76,0.5)",
                  fontSize: "0.75rem",
                  margin: "0 0 12px",
                }}>{(lightboxIdx ?? 0) + 1} / {galleryImages.length}</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); const url = window.location.origin + "/gallery?photo=" + (lightboxIdx ?? 0); navigator.clipboard.writeText(url).catch(() => { const ta = document.createElement("textarea"); ta.value = url; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }); setGalleryCopied(true); setTimeout(() => setGalleryCopied(false), 2000); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: galleryCopied ? "rgba(52,211,153,0.15)" : "rgba(201,168,76,0.12)", border: galleryCopied ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(201,168,76,0.3)", color: galleryCopied ? "#34D399" : "#C9A84C", fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.75rem", cursor: "pointer" }}
                  >
                    {galleryCopied ? <Check size={13}/> : <Copy size={13}/>}
                  </button>
                  <a
                    href={"https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(window.location.origin + "/gallery?photo=" + (lightboxIdx ?? 0))}
                    target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: "rgba(24,119,242,0.12)", border: "1px solid rgba(24,119,242,0.3)", color: "#1877F2", fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.75rem", textDecoration: "none" }}
                  >
                    <Share2 size={13}/> শেয়ার
                  </a>
                </div>
              </div>
              {/* Close */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeLightbox}
                style={{
                  position: "absolute", top: -14, right: -14,
                  background: "#C9A84C",
                  border: "none",
                  borderRadius: "50%",
                  width: 38, height: 38,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  color: "#060E1A",
                  boxShadow: "0 4px 16px rgba(201,168,76,0.45)",
                }}
              >
                <X size={17} />
              </motion.button>
            </motion.div>

            {/* Next */}
            <motion.button
              whileHover={{ scale: 1.1, background: "rgba(201,168,76,0.25)" }}
              onClick={goNext}
              style={{
                position: "fixed", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "rgba(201,168,76,0.12)",
                border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: "50%",
                width: 46, height: 46,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#C9A84C", zIndex: 10000,
                transition: "background 0.2s",
              }}
            >
              <ChevronRight size={22} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AdSense Ad */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <AdSenseAd adSlot="" adFormat="auto" fullWidthResponsive={true} />
      </div>
      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @media (max-width: 600px) {
          div[style*="columns: 5"] {
            columns: 3 120px !important;
          }
        }
        @media (max-width: 400px) {
          div[style*="columns: 5"] {
            columns: 2 100px !important;
          }
        }
      `}</style>
    </div>
  );
}
