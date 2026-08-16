/**
 * Gallery.tsx — ফটো গ্যালারি পেজ
 * Premium editorial gallery with responsive photo grid + shareable lightbox.
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Images,
  Share2,
  X,
  ZoomIn,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";
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
  { src: "/photos/Photoroom_20260224_033915.webp", caption: "মাহবুব সরদার সবুজ" },
  { src: "/photos/edited_image_blazer.webp", caption: "ব্লেজারে লেখক" },
  { src: "/photos/bengali_olive_shirt_man_art.webp", caption: "আর্ট পোর্ট্রেট" },
  { src: "/photos/bengali_sofa_man_art.webp", caption: "আর্ট পোর্ট্রেট ২" },
  { src: "/photos/Photoroom_20260105_192556.webp", caption: "লেখকের মুহূর্ত" },
  { src: "/photos/IMG_63832.webp", caption: "বিশেষ মুহূর্ত" },
  { src: "/photos/IMG_6494.webp", caption: "স্মরণীয় মুহূর্ত" },
  { src: "/photos/IMG_6021.webp", caption: "লেখকের ছবি" },
  { src: "/photos/IMG_6015.webp", caption: "বিশেষ দিন" },
  { src: "/photos/IMG_6032.webp", caption: "আনন্দের মুহূর্ত" },
  { src: "/photos/FullSizeRender.webp", caption: "লেখকের পোর্ট্রেট" },
  { src: "/photos/FullSizeRender_01.webp", caption: "প্রিয় মুহূর্ত" },
  { src: "/photos/FullSizeRender_02.webp", caption: "স্মৃতির পাতা" },
  { src: "/photos/IMG_1743.webp", caption: "লেখকের ছবি" },
  { src: "/photos/IMG_5349.webp", caption: "বিশেষ মুহূর্ত" },
  { src: "/photos/IMG_4706.webp", caption: "স্মরণীয় দিন" },
  { src: "/photos/IMG_3070.webp", caption: "লেখকের ছবি" },
  { src: "/photos/IMG_3862.webp", caption: "প্রিয় মুহূর্ত" },
  { src: "/photos/IMG_1014.webp", caption: "স্মৃতির ছবি" },
  { src: "/photos/IMG_2472.webp", caption: "বিশেষ দিন" },
  { src: "/photos/IMG_9833.webp", caption: "লেখকের মুহূর্ত" },
  { src: "/photos/IMG_9832.webp", caption: "আনন্দের ছবি" },
  { src: "/photos/IMG_9830.webp", caption: "স্মরণীয় মুহূর্ত" },
  { src: "/photos/IMG_9832_01.webp", caption: "প্রিয় স্মৃতি" },
  { src: "/photos/photo-output.webp", caption: "কবিতার ডিজাইন" },
  { src: "/photos/Addalittlebitofbodytext.png.webp", caption: "কবিতার ডিজাইন ২" },
  { src: "/photos/IMG_6966.webp", caption: "বাবা" },
  { src: "/photos/IMG_6969.webp", caption: "মাহবুব সরদার সবুজ — অফিসে" },
  { src: "/photos/IMG_6967.webp", caption: "লেখকের পোর্ট্রেট" },
  { src: "/photos/IMG_6965.webp", caption: "Front Tech অফিসে" },
  { src: "/photos/IMG_6964.webp", caption: "মরুভূমিতে লেখক" },
  { src: "/photos/IMG_6963.webp", caption: "প্রকৃতির কোলে" },
  { src: "/photos/IMG_6962.webp", caption: "বিশেষ মুহূর্ত" },
  { src: "/photos/IMG_6961.webp", caption: "লেখকের ছবি" },
  { src: PROFILE_1, caption: "মাহবুব সরদার সবুজ" },
  { src: PROFILE_2, caption: "লেখার মুহূর্তে" },
  { src: BOOK_COVER, caption: "আমি বিচ্ছেদকে বলি দুঃখবিলাস" },
  { src: BOOKS_COLLECTION, caption: "ই-বুক সংগ্রহ" },
  { src: WRITING_SHOWCASE, caption: "কবিতার পাতা" },
  { src: WRITING2, caption: "কবিতার পৃষ্ঠা" },
  { src: BOOK_PHOTO, caption: "দুঃখবিলাস — বইয়ের সাথে" },
];

type GalleryImage = { src: string; caption: string };

function copyGalleryLink(photoIndex: number, onComplete: () => void) {
  const url = `${window.location.origin}/gallery?photo=${photoIndex}`;
  const fallbackCopy = () => {
    const textarea = document.createElement("textarea");
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  navigator.clipboard?.writeText(url).catch(fallbackCopy) ?? fallbackCopy();
  onComplete();
}

export default function Gallery() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [galleryCopied, setGalleryCopied] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const [location] = useLocation();
  const visibleImages = galleryImages.slice(0, visibleCount);
  const hasMoreImages = visibleCount < galleryImages.length;
  const currentImg: GalleryImage | null = lightboxIdx !== null ? galleryImages[lightboxIdx] : null;

  useEffect(() => {
    setVisibleCount(window.matchMedia("(max-width: 768px)").matches ? 14 : 24);
  }, []);

  useEffect(() => {
    const photoParam = new URLSearchParams(window.location.search).get("photo");
    if (photoParam === null) return;
    const index = parseInt(photoParam, 10);
    if (!Number.isNaN(index) && index >= 0 && index < galleryImages.length) setLightboxIdx(index);
  }, [location]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") setLightboxIdx((previous) => previous === null ? null : (previous - 1 + galleryImages.length) % galleryImages.length);
      if (event.key === "ArrowRight") setLightboxIdx((previous) => previous === null ? null : (previous + 1) % galleryImages.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const openLightbox = (index: number) => {
    setLightboxIdx(index);
    const url = new URL(window.location.href);
    url.searchParams.set("photo", String(index));
    window.history.replaceState(null, "", url.toString());
  };

  const closeLightbox = () => {
    setLightboxIdx(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("photo");
    window.history.replaceState(null, "", url.toString());
  };

  const goPrevious = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (lightboxIdx !== null) setLightboxIdx((lightboxIdx - 1 + galleryImages.length) % galleryImages.length);
  };

  const goNext = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (lightboxIdx !== null) setLightboxIdx((lightboxIdx + 1) % galleryImages.length);
  };

  const handleCopy = () => {
    if (lightboxIdx === null) return;
    copyGalleryLink(lightboxIdx, () => {
      setGalleryCopied(true);
      window.setTimeout(() => setGalleryCopied(false), 2000);
    });
  };

  return (
    <div className="gallery-page-shell">
      <Seo
        title="গ্যালারি | মাহবুব সরদার সবুজের ছবি সংগ্রহ | Mahbub Sardar Sabuj Gallery"
        description="মাহবুব সরদার সবুজের জীবনের বিশেষ মুহূর্ত, শিল্পকর্ম, বই প্রকাশনা ও সাহিত্য অনুষ্ঠানের ফটো গ্যালারি। বাংলাদেশের জনপ্রিয় কবি ও লেখকের ছবি সংগ্রহ।"
        path="/gallery"
        image={PROFILE_1}
        imageAlt="মাহবুব সরদার সবুজ — বাংলাদেশি কবি ও লেখক"
        keywords="মাহবুব সরদার সবুজ গ্যালারি, Mahbub Sardar Sabuj photos, বাংলা লেখক ছবি, বাংলাদেশি কবির ছবি, Mahbub Sardar Sabuj gallery, বাংলা সাহিত্যিক ছবি"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: "মাহবুব সরদার সবুজের ফটো গ্যালারি",
          description: "মাহবুব সরদার সবুজের জীবনের বিশেষ মুহূর্ত, বই প্রকাশনা ও সাহিত্য অনুষ্ঠানের ফটো সংগ্রহ",
          url: "https://www.mahbubsardarsabuj.com/gallery",
          author: { "@type": "Person", name: "Mahbub Sardar Sabuj", url: "https://www.mahbubsardarsabuj.com/" },
        }}
      />
      <Navbar />

      <main>
        <section className="gallery-hero" style={{ position: "relative" }}>
          <div className="gallery-hero-noise" aria-hidden="true" />
          <div className="gallery-hero-collage" aria-hidden="true">
            {galleryImages.slice(0, 5).map((image, index) => (
              <div
                className={`gallery-collage-image gallery-collage-image-${index + 1}`}
                key={image.src}
                style={{ backgroundImage: `url(${image.src})` }}
              />
            ))}
          </div>
          <div className="gallery-hero-shade" aria-hidden="true" />
          <div className="gallery-hero-orbit gallery-hero-orbit-one" aria-hidden="true" />
          <div className="gallery-hero-orbit gallery-hero-orbit-two" aria-hidden="true" />

          <div
            className="gallery-hero-content"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 4,
            }}
          >
            <div className="gallery-hero-kicker"><span /><Images size={15} /> ফটো গ্যালারি <span /></div>
            <h1>গ্যালারি</h1>
            <p>মাহবুব সরদার সবুজের জীবনের বিশেষ মুহূর্ত, শিল্পকর্ম ও স্মৃতির সংগ্রহ</p>
            <div className="gallery-hero-meta">
              <span className="gallery-meta-dot" />
              <span>{galleryImages.length}টি ছবি</span>
              <i />
              <span>ক্লিক করলে বড় হবে</span>
            </div>
          </div>
        </section>

        <section className="gallery-archive" aria-label="ছবির সংগ্রহ">
          <div className="gallery-archive-heading">
            <div>
              <span className="gallery-index">01 — VISUAL ARCHIVE</span>
              <h2>স্মৃতির <em>নির্বাচিত</em> ফ্রেম</h2>
            </div>
            <p>প্রতিটি ফ্রেমে রয়েছে যাত্রা, সাহিত্য আর মানুষের কাছে পৌঁছে যাওয়ার ছোট ছোট গল্প।</p>
          </div>

          <div className="gallery-editorial-grid">
            {visibleImages.map((image, index) => (
              <motion.button
                type="button"
                className={`gallery-photo-tile gallery-photo-tile-${(index % 12) + 1}`}
                key={`${image.src}-${index}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.45, delay: Math.min(index * 0.025, 0.35) }}
                onClick={() => openLightbox(index)}
                aria-label={`${image.caption} বড় করে দেখুন`}
              >
                <img
                  src={image.src}
                  alt={`${image.caption || "মাহবুব সরদার সবুজ গ্যালারি ছবি"} - গ্যালারি`}
                  loading={index < 6 ? "eager" : "lazy"}
                  fetchPriority={index < 3 ? "high" : "auto"}
                  decoding="async"
                  onError={(event) => { (event.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                />
                <span className="gallery-photo-veil" aria-hidden="true" />
                <span className="gallery-photo-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="gallery-photo-caption">
                  <ZoomIn size={15} />
                  <span>{image.caption}</span>
                </span>
              </motion.button>
            ))}
          </div>

          {hasMoreImages && (
            <div className="gallery-load-more-wrap">
              <button type="button" className="gallery-load-more" onClick={() => setVisibleCount((count) => Math.min(count + 12, galleryImages.length))}>
                <span>আরও ছবি দেখুন</span>
                <span className="gallery-load-more-count">{galleryImages.length - visibleCount}</span>
              </button>
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {currentImg && (
          <motion.div
            className="gallery-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`${currentImg.caption} বড় করে দেখা হচ্ছে`}
          >
            <div className="gallery-lightbox-backdrop" aria-hidden="true" />
            <motion.button className="gallery-lightbox-arrow gallery-lightbox-arrow-left" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} onClick={goPrevious} aria-label="আগের ছবি">
              <ChevronLeft size={23} />
            </motion.button>

            <motion.div
              className="gallery-lightbox-frame"
              key={lightboxIdx}
              initial={{ scale: 0.92, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 18 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="gallery-lightbox-image-wrap">
                <img src={currentImg.src} alt={`${currentImg.caption || "মাহবুব সরদার সবুজ গ্যালারি ছবি"} - মাহবুব সরদার সবুজের গ্যালারি`} decoding="async" />
                <button type="button" className="gallery-lightbox-close" onClick={closeLightbox} aria-label="ছবি বন্ধ করুন"><X size={18} /></button>
              </div>
              <div className="gallery-lightbox-details">
                <div>
                  <span>PHOTO {String((lightboxIdx ?? 0) + 1).padStart(2, "0")} / {galleryImages.length}</span>
                  <p>{currentImg.caption}</p>
                </div>
                <div className="gallery-lightbox-actions">
                  <button type="button" onClick={handleCopy} className={galleryCopied ? "copied" : ""}>
                    {galleryCopied ? <Check size={15} /> : <Copy size={15} />}
                    <span>{galleryCopied ? "কপি হয়েছে" : "লিংক কপি"}</span>
                  </button>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/gallery?photo=${lightboxIdx ?? 0}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Share2 size={15} /><span>শেয়ার</span>
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.button className="gallery-lightbox-arrow gallery-lightbox-arrow-right" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} onClick={goNext} aria-label="পরের ছবি">
              <ChevronRight size={23} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="gallery-ad-slot"><AdSenseAd adSlot={AD_SLOTS.GALLERY_BOTTOM} adFormat="auto" fullWidthResponsive /></div>
      <Footer />

      <style>{`
        .gallery-page-shell {
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at 84% 7%, rgba(201,168,76,0.10), transparent 25rem),
            radial-gradient(circle at 8% 32%, rgba(54,108,156,0.11), transparent 33rem),
            #060e1a;
          color: #faf6ef;
        }
        .gallery-page-shell * { box-sizing: border-box; }
        .gallery-hero {
          height: clamp(420px, 54vw, 620px);
          min-height: 0;
          margin-top: var(--site-nav-offset, 98px);
          padding: 0 1.25rem;
          position: relative;
          display: grid;
          place-items: center;
          isolation: isolate;
          border-bottom: 1px solid rgba(232,201,122,0.16);
          overflow: hidden;
          background: #07131f;
        }
        .gallery-hero-noise {
          position: absolute; inset: 0; z-index: -1; opacity: 0.34; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.18'/%3E%3C/svg%3E");
        }
        .gallery-hero-collage { position: absolute; inset: -12%; z-index: -3; display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.5rem; transform: rotate(-7deg) scale(1.18); opacity: 0.38; filter: saturate(.72) contrast(1.08); }
        .gallery-collage-image { min-height: 120%; border: 1px solid rgba(255,249,226,0.14); border-radius: 12px; background-size: cover; background-position: center; box-shadow: 0 20px 45px rgba(0,0,0,.38); }
        .gallery-collage-image:nth-child(odd) { transform: translateY(-8%); }
        .gallery-collage-image-2 { background-position: center top; }
        .gallery-collage-image-4 { transform: translateY(10%) !important; }
        .gallery-hero-shade { position: absolute; inset: 0; z-index: -2; background: linear-gradient(180deg, rgba(5,13,23,.64) 0%, rgba(6,14,26,.84) 53%, #060e1a 100%), linear-gradient(90deg, rgba(6,14,26,.84), transparent 48%, rgba(6,14,26,.74)); }
        .gallery-hero-orbit { position: absolute; z-index: -1; border: 1px solid rgba(232,201,122,.18); border-radius: 50%; pointer-events: none; }
        .gallery-hero-orbit-one { width: 530px; height: 530px; top: -330px; right: -60px; box-shadow: 0 0 100px rgba(201,168,76,.10) inset; }
        .gallery-hero-orbit-two { width: 360px; height: 360px; bottom: -290px; left: 6%; border-color: rgba(103,165,214,.18); }
        .gallery-hero-content { width: min(720px, calc(100% - 2rem)); text-align: center; position: absolute; top: 52%; left: 50%; z-index: 4; transform: translate(-50%, -50%); opacity: 1; visibility: visible; }
        .gallery-hero-kicker { display: inline-flex; align-items: center; gap: .55rem; color: #efd58e; font-family: 'AdorshoLipi', sans-serif; font-size: .74rem; letter-spacing: .24em; text-transform: uppercase; }
        .gallery-hero-kicker span { display: block; width: 36px; height: 1px; background: linear-gradient(90deg, transparent, rgba(232,201,122,.75)); }
        .gallery-hero-kicker span:last-child { transform: scaleX(-1); }
        .gallery-hero h1 { margin: 1.1rem 0 .9rem; font-family: 'AdorshoLipi', sans-serif; font-size: clamp(3.2rem, 8vw, 6.6rem); line-height: .95; letter-spacing: -.045em; color: #fffaf0; text-shadow: 0 4px 40px rgba(0,0,0,.45), 0 0 50px rgba(201,168,76,.18); }
        .gallery-hero p { max-width: 540px; margin: 0 auto; color: rgba(250,246,239,.72); font-family: 'AdorshoLipi', sans-serif; font-size: clamp(1rem, 2vw, 1.12rem); line-height: 1.75; }
        .gallery-hero-meta { display: inline-flex; align-items: center; gap: .62rem; margin-top: 1.65rem; padding: .58rem .95rem; border: 1px solid rgba(232,201,122,.25); border-radius: 999px; background: rgba(5,15,27,.35); box-shadow: inset 0 1px 0 rgba(255,255,255,.08); color: rgba(250,246,239,.72); font: .78rem 'AdorshoLipi', sans-serif; backdrop-filter: blur(10px); }
        .gallery-meta-dot { width: 6px; height: 6px; border-radius: 50%; background: #e8c97a; box-shadow: 0 0 12px rgba(232,201,122,.95); }
        .gallery-hero-meta i { height: 14px; width: 1px; background: rgba(232,201,122,.3); }

        .gallery-archive { width: min(1450px, 100%); margin: 0 auto; padding: clamp(3.5rem, 7vw, 7rem) clamp(1rem, 3vw, 2.4rem) clamp(5rem, 10vw, 9rem); position: relative; z-index: 1; }
        .gallery-archive-heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin: 0 auto clamp(2rem, 4vw, 3.2rem); max-width: 1240px; }
        .gallery-index { display: block; margin-bottom: .7rem; color: #d9b96a; font: .67rem/1 'AdorshoLipi', sans-serif; letter-spacing: .18em; }
        .gallery-archive-heading h2 { margin: 0; color: #fbf6ea; font: 700 clamp(2rem, 4vw, 3.4rem)/1.06 'AdorshoLipi', sans-serif; letter-spacing: -.025em; }
        .gallery-archive-heading h2 em { color: #d5b15c; font-style: normal; }
        .gallery-archive-heading p { max-width: 385px; margin: 0; padding-left: 1.1rem; border-left: 1px solid rgba(232,201,122,.38); color: rgba(250,246,239,.64); font: .95rem/1.72 'AdorshoLipi', sans-serif; }

        .gallery-editorial-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); grid-auto-flow: dense; grid-auto-rows: 84px; gap: clamp(.55rem, 1vw, .9rem); max-width: 1240px; margin: 0 auto; }
        .gallery-photo-tile { padding: 0; position: relative; display: block; width: 100%; min-width: 0; overflow: hidden; border: 1px solid rgba(255,249,226,.10); border-radius: 16px; background: #10263d; cursor: pointer; box-shadow: 0 14px 34px rgba(0,0,0,.22); isolation: isolate; }
        .gallery-photo-tile img { width: 100%; height: 100%; display: block; object-fit: cover; transition: transform .7s cubic-bezier(.16,1,.3,1), filter .45s ease; filter: saturate(.88) contrast(1.04); }
        .gallery-photo-tile::after { content: ''; position: absolute; inset: 0; z-index: -1; border: 1px solid rgba(255,249,226,.12); border-radius: inherit; pointer-events: none; }
        .gallery-photo-tile:hover img, .gallery-photo-tile:focus-visible img { transform: scale(1.075); filter: saturate(1.08) contrast(1.05); }
        .gallery-photo-tile:focus-visible { outline: 2px solid #f2d889; outline-offset: 3px; }
        .gallery-photo-veil { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 35%, rgba(4,12,22,.88) 100%); opacity: .25; transition: opacity .35s ease; }
        .gallery-photo-tile:hover .gallery-photo-veil, .gallery-photo-tile:focus-visible .gallery-photo-veil { opacity: 1; }
        .gallery-photo-number { position: absolute; top: .8rem; left: .85rem; color: rgba(255,249,226,.86); font: .61rem/1 system-ui, sans-serif; letter-spacing: .12em; text-shadow: 0 2px 10px rgba(0,0,0,.65); opacity: 0; transform: translateY(-4px); transition: opacity .25s ease, transform .25s ease; }
        .gallery-photo-caption { position: absolute; left: .85rem; right: .85rem; bottom: .78rem; display: flex; align-items: center; gap: .45rem; color: #fff9e7; font: .84rem/1.35 'AdorshoLipi', sans-serif; text-align: left; opacity: 0; transform: translateY(8px); transition: opacity .28s ease, transform .28s ease; }
        .gallery-photo-caption svg { flex: 0 0 auto; color: #ead083; }
        .gallery-photo-tile:hover .gallery-photo-caption, .gallery-photo-tile:hover .gallery-photo-number, .gallery-photo-tile:focus-visible .gallery-photo-caption, .gallery-photo-tile:focus-visible .gallery-photo-number { opacity: 1; transform: translateY(0); }
        .gallery-photo-tile-1 { grid-column: span 5; grid-row: span 5; }
        .gallery-photo-tile-2 { grid-column: span 4; grid-row: span 3; }
        .gallery-photo-tile-3 { grid-column: span 3; grid-row: span 4; }
        .gallery-photo-tile-4 { grid-column: span 4; grid-row: span 3; }
        .gallery-photo-tile-5 { grid-column: span 3; grid-row: span 4; }
        .gallery-photo-tile-6 { grid-column: span 5; grid-row: span 3; }
        .gallery-photo-tile-7 { grid-column: span 3; grid-row: span 3; }
        .gallery-photo-tile-8 { grid-column: span 4; grid-row: span 4; }
        .gallery-photo-tile-9 { grid-column: span 5; grid-row: span 3; }
        .gallery-photo-tile-10 { grid-column: span 3; grid-row: span 4; }
        .gallery-photo-tile-11 { grid-column: span 4; grid-row: span 3; }
        .gallery-photo-tile-12 { grid-column: span 5; grid-row: span 4; }

        .gallery-load-more-wrap { display: flex; justify-content: center; padding-top: 2.5rem; }
        .gallery-load-more { display: inline-flex; align-items: center; gap: .75rem; min-height: 48px; padding: .45rem .55rem .45rem 1.15rem; border: 1px solid rgba(232,201,122,.42); border-radius: 999px; color: #f0d58e; background: linear-gradient(135deg, rgba(201,168,76,.13), rgba(6,16,29,.40)); font: .92rem 'AdorshoLipi', sans-serif; cursor: pointer; box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 12px 28px rgba(0,0,0,.22); transition: transform .25s ease, border-color .25s ease, background .25s ease; }
        .gallery-load-more:hover { transform: translateY(-3px); border-color: #f1d77f; background: linear-gradient(135deg, rgba(201,168,76,.25), rgba(6,16,29,.46)); }
        .gallery-load-more-count { display: grid; place-items: center; min-width: 36px; height: 36px; border-radius: 50%; color: #07121e; background: #ebd387; font: 700 .75rem system-ui, sans-serif; }

        .gallery-lightbox { position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; padding: clamp(1rem, 4vw, 3rem) clamp(3.75rem, 9vw, 7rem); background: rgba(3,9,17,.88); backdrop-filter: blur(18px); }
        .gallery-lightbox-backdrop { position: absolute; inset: 0; z-index: -1; background: radial-gradient(circle at 50% 40%, rgba(201,168,76,.17), transparent 38rem); }
        .gallery-lightbox-frame { width: min(100%, 1080px); position: relative; }
        .gallery-lightbox-image-wrap { position: relative; overflow: hidden; border: 1px solid rgba(255,249,226,.21); border-radius: 20px; box-shadow: 0 40px 100px rgba(0,0,0,.62), 0 0 0 8px rgba(201,168,76,.05); background: #08131f; }
        .gallery-lightbox-image-wrap img { display: block; width: 100%; max-height: min(70vh, 760px); object-fit: contain; background: #08131f; }
        .gallery-lightbox-close { position: absolute; top: .85rem; right: .85rem; width: 40px; height: 40px; display: grid; place-items: center; border: 1px solid rgba(255,249,226,.36); border-radius: 50%; background: rgba(5,14,25,.68); color: #fff9e7; cursor: pointer; backdrop-filter: blur(10px); transition: transform .2s ease, background .2s ease; }
        .gallery-lightbox-close:hover { transform: rotate(90deg); background: #d7b95f; color: #07121e; }
        .gallery-lightbox-details { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 1rem .25rem 0; color: #fff9e7; }
        .gallery-lightbox-details > div:first-child span { color: rgba(232,201,122,.75); font: .63rem system-ui, sans-serif; letter-spacing: .14em; }
        .gallery-lightbox-details p { margin: .22rem 0 0; font: .96rem 'AdorshoLipi', sans-serif; }
        .gallery-lightbox-actions { display: flex; gap: .55rem; flex-wrap: wrap; justify-content: flex-end; }
        .gallery-lightbox-actions button, .gallery-lightbox-actions a { display: inline-flex; align-items: center; gap: .45rem; min-height: 35px; padding: .45rem .75rem; border: 1px solid rgba(232,201,122,.32); border-radius: 999px; color: #ecd486; background: rgba(201,168,76,.09); font: .75rem 'AdorshoLipi', sans-serif; text-decoration: none; cursor: pointer; }
        .gallery-lightbox-actions button.copied { color: #5ee2a4; border-color: rgba(94,226,164,.38); background: rgba(94,226,164,.10); }
        .gallery-lightbox-actions a { color: #a9cef8; border-color: rgba(95,160,230,.42); background: rgba(46,111,186,.16); }
        .gallery-lightbox-arrow { position: fixed; top: 50%; z-index: 2; width: 48px; height: 48px; display: grid; place-items: center; border: 1px solid rgba(232,201,122,.34); border-radius: 50%; color: #efd581; background: rgba(8,21,35,.72); cursor: pointer; backdrop-filter: blur(12px); }
        .gallery-lightbox-arrow-left { left: clamp(.75rem, 2vw, 2rem); }
        .gallery-lightbox-arrow-right { right: clamp(.75rem, 2vw, 2rem); }
        .gallery-ad-slot { max-width: 1200px; margin: 0 auto; padding: 0 1rem 1.5rem; }

        @media (max-width: 900px) {
          .gallery-hero { height: 520px; min-height: 0; margin-top: var(--site-nav-offset, 98px); padding: 0 1rem; }
          .gallery-archive-heading { align-items: start; flex-direction: column; gap: 1rem; }
          .gallery-editorial-grid { grid-auto-rows: 68px; }
          .gallery-photo-tile-1 { grid-column: span 6; grid-row: span 5; }
          .gallery-photo-tile-2, .gallery-photo-tile-4, .gallery-photo-tile-8, .gallery-photo-tile-11 { grid-column: span 6; grid-row: span 3; }
          .gallery-photo-tile-3, .gallery-photo-tile-5, .gallery-photo-tile-7, .gallery-photo-tile-10 { grid-column: span 4; grid-row: span 3; }
          .gallery-photo-tile-6, .gallery-photo-tile-9, .gallery-photo-tile-12 { grid-column: span 6; grid-row: span 4; }
        }
        @media (max-width: 600px) {
          .gallery-hero { height: 460px; min-height: 0; margin-top: var(--site-nav-offset, 98px); padding: 0 1rem; }
          .gallery-hero-collage { inset: -30% -52%; gap: .75rem; opacity: .30; }
          .gallery-hero-kicker { font-size: .64rem; letter-spacing: .16em; }
          .gallery-hero-kicker span { width: 22px; }
          .gallery-hero h1 { font-size: clamp(3.25rem, 18vw, 5rem); }
          .gallery-hero p { font-size: .94rem; }
          .gallery-hero-meta { font-size: .72rem; }
          .gallery-archive { padding: 3.5rem .8rem 5.5rem; }
          .gallery-archive-heading { margin-bottom: 1.65rem; padding: 0 .25rem; }
          .gallery-archive-heading h2 { font-size: 2.25rem; }
          .gallery-archive-heading p { padding-left: .85rem; font-size: .88rem; }
          .gallery-editorial-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 118px; gap: .6rem; }
          .gallery-photo-tile, .gallery-photo-tile-1, .gallery-photo-tile-2, .gallery-photo-tile-3, .gallery-photo-tile-4, .gallery-photo-tile-5, .gallery-photo-tile-6, .gallery-photo-tile-7, .gallery-photo-tile-8, .gallery-photo-tile-9, .gallery-photo-tile-10, .gallery-photo-tile-11, .gallery-photo-tile-12 { grid-column: span 1; grid-row: span 2; border-radius: 13px; }
          .gallery-photo-tile-1, .gallery-photo-tile-4, .gallery-photo-tile-7, .gallery-photo-tile-10 { grid-row: span 3; }
          .gallery-photo-caption { opacity: 1; transform: none; left: .7rem; right: .7rem; bottom: .65rem; font-size: .74rem; }
          .gallery-photo-number { opacity: 1; transform: none; top: .65rem; left: .7rem; font-size: .55rem; }
          .gallery-lightbox { padding: 1rem .8rem 5.3rem; }
          .gallery-lightbox-arrow { top: auto; bottom: 1.1rem; width: 44px; height: 44px; }
          .gallery-lightbox-arrow-left { left: calc(50% - 54px); }
          .gallery-lightbox-arrow-right { right: calc(50% - 54px); }
          .gallery-lightbox-image-wrap { border-radius: 15px; }
          .gallery-lightbox-image-wrap img { max-height: 62vh; }
          .gallery-lightbox-details { align-items: flex-start; flex-direction: column; padding: .8rem .15rem 0; }
          .gallery-lightbox-actions { justify-content: flex-start; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gallery-page-shell *, .gallery-page-shell *::before, .gallery-page-shell *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>
    </div>
  );
}
