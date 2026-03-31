/**
 * Gallery.tsx — ফটো গ্যালারি পেজ
 * মাসনরি গ্রিড + ফিল্টার ট্যাব + Lightbox
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Images } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

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
  { src: "/photos/Photoroom_20260224_033915.jpg",   caption: "মাহবুব সরদার সবুজ",              cat: "ব্যক্তিগত" },
  { src: "/photos/edited_image_blazer.png",          caption: "ব্লেজারে লেখক",                  cat: "ব্যক্তিগত" },
  { src: "/photos/bengali_olive_shirt_man_art.png",  caption: "আর্ট পোর্ট্রেট",                 cat: "শিল্পকর্ম" },
  { src: "/photos/bengali_sofa_man_art.png",         caption: "আর্ট পোর্ট্রেট ২",               cat: "শিল্পকর্ম" },
  { src: "/photos/Photoroom_20260105_192556.jpg",    caption: "লেখকের মুহূর্ত",                 cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_63832.PNG",                    caption: "বিশেষ মুহূর্ত",                  cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_6494.jpeg",                    caption: "স্মরণীয় মুহূর্ত",               cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_6021.JPG",                     caption: "লেখকের ছবি",                     cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_6015.JPG",                     caption: "বিশেষ দিন",                      cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_6032.JPG",                     caption: "আনন্দের মুহূর্ত",                cat: "ব্যক্তিগত" },
  { src: "/photos/FullSizeRender.jpg",               caption: "লেখকের পোর্ট্রেট",               cat: "ব্যক্তিগত" },
  { src: "/photos/FullSizeRender_01.jpg",            caption: "প্রিয় মুহূর্ত",                  cat: "ব্যক্তিগত" },
  { src: "/photos/FullSizeRender_02.jpg",            caption: "স্মৃতির পাতা",                   cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_1743.jpg",                     caption: "লেখকের ছবি",                     cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_5349.jpeg",                    caption: "বিশেষ মুহূর্ত",                  cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_4706.JPG",                     caption: "স্মরণীয় দিন",                   cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_3070.JPG",                     caption: "লেখকের ছবি",                     cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_3862.jpeg",                    caption: "প্রিয় মুহূর্ত",                  cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_1014.jpeg",                    caption: "স্মৃতির ছবি",                    cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_2472.jpeg",                    caption: "বিশেষ দিন",                      cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_9833.JPG",                     caption: "লেখকের মুহূর্ত",                 cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_9832.jpeg",                    caption: "আনন্দের ছবি",                    cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_9830.JPG",                     caption: "স্মরণীয় মুহূর্ত",               cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_9832_01.jpeg",                 caption: "প্রিয় স্মৃতি",                   cat: "ব্যক্তিগত" },
  { src: "/photos/photo-output.png",                 caption: "কবিতার ডিজাইন",                  cat: "ডিজাইন" },
  { src: "/photos/Addalittlebitofbodytext.png.JPG",  caption: "কবিতার ডিজাইন ২",               cat: "ডিজাইন" },
  { src: "/photos/IMG_6966.JPG",                     caption: "বাবা",                            cat: "পরিবার" },
  { src: "/photos/IMG_6969.JPG",                     caption: "মাহবুব সরদার সবুজ — অফিসে",     cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_6967.JPG",                     caption: "লেখকের পোর্ট্রেট",               cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_6965.JPG",                     caption: "Front Tech অফিসে",               cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_6964.jpeg",                    caption: "মরুভূমিতে লেখক",                 cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_6963.JPG",                     caption: "প্রকৃতির কোলে",                  cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_6962.JPG",                     caption: "বিশেষ মুহূর্ত",                  cat: "ব্যক্তিগত" },
  { src: "/photos/IMG_6961.JPG",                     caption: "লেখকের ছবি",                     cat: "ব্যক্তিগত" },
  { src: PROFILE_1,          caption: "মাহবুব সরদার সবুজ",              cat: "ব্যক্তিগত" },
  { src: PROFILE_2,          caption: "লেখার মুহূর্তে",                 cat: "ব্যক্তিগত" },
  { src: BOOK_COVER,         caption: "আমি বিচ্ছেদকে বলি দুঃখবিলাস",  cat: "বই" },
  { src: BOOKS_COLLECTION,   caption: "ই-বুক সংগ্রহ",                   cat: "বই" },
  { src: WRITING_SHOWCASE,   caption: "কবিতার পাতা",                    cat: "ডিজাইন" },
  { src: WRITING2,           caption: "কবিতার পৃষ্ঠা",                  cat: "ডিজাইন" },
  { src: BOOK_PHOTO,         caption: "দুঃখবিলাস — বইয়ের সাথে",       cat: "বই" },
];

const CATEGORIES = ["সব", "ব্যক্তিগত", "পরিবার", "শিল্পকর্ম", "ডিজাইন", "বই"];

type GalleryImage = { src: string; caption: string; cat: string };

export default function Gallery() {
  const [filter, setFilter] = useState("সব");
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const filtered = galleryImages.filter(img => filter === "সব" || img.cat === filter);

  const openLightbox = (img: GalleryImage, idx: number) => {
    setLightbox(img);
    setLightboxIdx(idx);
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prev = (lightboxIdx - 1 + filtered.length) % filtered.length;
    setLightbox(filtered[prev]);
    setLightboxIdx(prev);
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = (lightboxIdx + 1) % filtered.length;
    setLightbox(filtered[next]);
    setLightboxIdx(next);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060E1A" }}>
      <Seo
        title="গ্যালারি — মাহবুব সরদার সবুজ"
        description="মাহবুব সরদার সবুজের জীবনের বিশেষ মুহূর্ত, শিল্পকর্ম ও স্মৃতির ফটো গ্যালারি।"
      />
      <Navbar />

      {/* ── Hero Header ── */}
      <div style={{
        paddingTop: "7rem",
        paddingBottom: "3rem",
        textAlign: "center",
        background: "linear-gradient(180deg, #0A1628 0%, #0d1f3c 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 300,
          background: "radial-gradient(ellipse, rgba(201,168,76,0.12) 0%, transparent 70%)",
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
              textTransform: "uppercase",
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
            color: "rgba(250,246,239,0.6)",
            fontSize: "0.95rem",
            maxWidth: 480,
            margin: "0 auto",
          }}>
            মাহবুব সরদার সবুজের জীবনের বিশেষ মুহূর্ত, শিল্পকর্ম ও স্মৃতির সংগ্রহ
          </p>
        </motion.div>
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(6,14,26,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(201,168,76,0.12)",
        padding: "0.9rem 1rem",
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          gap: 8,
          flexWrap: "wrap",
        }}>
          {CATEGORIES.map(cat => {
            const count = cat === "সব" ? galleryImages.length : galleryImages.filter(i => i.cat === cat).length;
            return (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setFilter(cat)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 50,
                  border: filter === cat ? "none" : "1px solid rgba(201,168,76,0.3)",
                  background: filter === cat
                    ? "linear-gradient(135deg, #C9A84C, #E8C4A0)"
                    : "rgba(255,255,255,0.05)",
                  color: filter === cat ? "#0A1628" : "rgba(253,246,236,0.5)",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  fontWeight: filter === cat ? 700 : 500,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  boxShadow: filter === cat ? "0 4px 16px rgba(201,168,76,0.28)" : "none",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {cat}
                <span style={{
                  background: filter === cat ? "rgba(10,22,40,0.15)" : "rgba(201,168,76,0.15)",
                  color: filter === cat ? "#0A1628" : "#C9A84C",
                  borderRadius: 50,
                  padding: "1px 7px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                }}>{count}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Masonry Grid ── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              columns: "4 240px",
              columnGap: "1rem",
              lineHeight: 0,
            }}
          >
            {filtered.map((img, i) => (
              <motion.div
                key={img.src + i}
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.025, 0.5) }}
                onClick={() => openLightbox(img, i)}
                style={{
                  display: "inline-block",
                  width: "100%",
                  marginBottom: "1rem",
                  borderRadius: 14,
                  overflow: "hidden",
                  cursor: "pointer",
                  position: "relative",
                  boxShadow: "0 6px 24px rgba(10,22,40,0.10)",
                  border: "2px solid rgba(201,168,76,0.08)",
                  lineHeight: 0,
                  breakInside: "avoid",
                  transition: "box-shadow 0.3s, transform 0.3s",
                }}
                whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(10,22,40,0.2)" }}
              >
                <img
                  src={img.src}
                  alt={img.caption}
                  loading="lazy"
                  style={{ width: "100%", display: "block", objectFit: "cover", transition: "transform 0.5s" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                {/* Hover overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(10,22,40,0.88) 0%, rgba(10,22,40,0.1) 55%, transparent 100%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "1rem",
                  }}
                >
                  <span style={{
                    display: "inline-block",
                    background: "rgba(201,168,76,0.22)",
                    border: "1px solid rgba(201,168,76,0.4)",
                    color: "#E8C4A0",
                    fontSize: "0.65rem",
                    padding: "2px 9px",
                    borderRadius: 50,
                    marginBottom: 5,
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    width: "fit-content",
                  }}>{img.cat}</span>
                  <span style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    color: "#FAF6EF",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                  }}>{img.caption}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                    <Eye size={11} color="rgba(201,168,76,0.8)" />
                    <span style={{ color: "rgba(201,168,76,0.8)", fontSize: "0.68rem", fontFamily: "'Noto Sans Bengali', sans-serif" }}>বড় করে দেখুন</span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Count footer */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <p style={{ color: "rgba(253,246,236,0.35)", fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.85rem" }}>
            মোট <strong style={{ color: "#C9A84C" }}>{filtered.length}</strong>টি ছবি প্রদর্শিত হচ্ছে
          </p>
        </div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 9999,
              background: "rgba(10,22,40,0.96)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Prev button */}
            <button
              onClick={goPrev}
              style={{
                position: "fixed", left: 16, top: "50%", transform: "translateY(-50%)",
                background: "rgba(201,168,76,0.15)",
                border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: "50%",
                width: 44, height: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#C9A84C", fontSize: 22, zIndex: 10000,
                transition: "background 0.2s",
              }}
            >‹</button>

            {/* Image container */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              style={{ position: "relative", maxWidth: 860, width: "100%" }}
            >
              <img
                src={lightbox.src}
                alt={lightbox.caption}
                style={{
                  width: "100%",
                  maxHeight: "78vh",
                  objectFit: "contain",
                  borderRadius: 16,
                  boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
                }}
              />
              {/* Caption */}
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <span style={{
                  display: "inline-block",
                  background: "rgba(201,168,76,0.15)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: "#E8C4A0",
                  fontSize: "0.7rem",
                  padding: "2px 12px",
                  borderRadius: 50,
                  marginBottom: 6,
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                }}>{lightbox.cat}</span>
                <p style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "rgba(250,246,239,0.8)",
                  fontSize: "0.95rem",
                  margin: "4px 0 0",
                }}>{lightbox.caption}</p>
                <p style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "rgba(250,246,239,0.35)",
                  fontSize: "0.75rem",
                  marginTop: 4,
                }}>{lightboxIdx + 1} / {filtered.length}</p>
              </div>
              {/* Close button */}
              <button
                onClick={() => setLightbox(null)}
                style={{
                  position: "absolute", top: -16, right: -16,
                  background: "#C9A84C",
                  border: "none",
                  borderRadius: "50%",
                  width: 40, height: 40,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  color: "#0A1628",
                  boxShadow: "0 4px 16px rgba(201,168,76,0.4)",
                }}
              >
                <X size={18} />
              </button>
            </motion.div>

            {/* Next button */}
            <button
              onClick={goNext}
              style={{
                position: "fixed", right: 16, top: "50%", transform: "translateY(-50%)",
                background: "rgba(201,168,76,0.15)",
                border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: "50%",
                width: 44, height: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#C9A84C", fontSize: 22, zIndex: 10000,
                transition: "background 0.2s",
              }}
            >›</button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          div[style*="columns: 4"] { columns: 2 !important; }
        }
        @media (max-width: 480px) {
          div[style*="columns: 4"] { columns: 1 !important; }
        }
      `}</style>
    </div>
  );
}
