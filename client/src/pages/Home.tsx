/*
 * Design: "Ink & Gold" — World-Class Literary Premium
 * Concept: Cinematic dark luxury author portfolio
 * Palette: Deep Navy #060E1A, Rich Gold #C9A84C, Ivory #FAF6EF, Charcoal #1E2D3D
 * Inspiration: Sarah Vaughan, Anthony Horowitz, luxury editorial magazines
 */
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
  BookOpen, PenLine, Mic2, Images, Newspaper, Mail,
  UserRound, Palette, ArrowRight, ChevronDown, ExternalLink,
  Star, Quote
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

// ── Assets ────────────────────────────────────────────────────────────────────
const PROFILE_1 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";
const PROFILE_2 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile2_57482935.jpg";
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/hero-bg-U7hjBDvWeoSXDDh3veCUTN.webp";
const BOOK_COVER = "/images/book-cover-20260328.jpg";
const ABOUT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/about-bg-UJ5ebeZYm7Pq6XtFEyFtTv.webp";

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = [
  { value: "৫+", label: "প্রকাশিত বই" },
  { value: "৫০K+", label: "পাঠক" },
  { value: "১০+", label: "বছরের অভিজ্ঞতা" },
  { value: "১০০+", label: "কবিতা ও গদ্য" },
];

// ── Navigation sections ───────────────────────────────────────────────────────
const sections = [
  { label: "পরিচিতি", subtitle: "লেখক পরিচয়", href: "/about", icon: UserRound },
  { label: "বই", subtitle: "প্রকাশিত বই", href: "/ebooks", icon: BookOpen },
  { label: "আবৃত্তি", subtitle: "ভিডিও সংগ্রহ", href: "/facebook-recitations", icon: Mic2 },
  { label: "লেখালেখি", subtitle: "প্রবন্ধ ও গদ্য", href: "/writings", icon: PenLine },
  { label: "ই-বুক", subtitle: "ডিজিটাল বই", href: "/ebooks", icon: BookOpen },
  { label: "ডিজাইন", subtitle: "কার্ড তৈরি করুন", href: "/editor", icon: Palette },
  { label: "গ্যালারি", subtitle: "ছবির সংগ্রহ", href: "/gallery", icon: Images },
  { label: "সংবাদ", subtitle: "সাম্প্রতিক খবর", href: "/news", icon: Newspaper },
  { label: "যোগাযোগ", subtitle: "যোগাযোগ করুন", href: "/contact", icon: Mail },
];

// ── Quote ─────────────────────────────────────────────────────────────────────
const authorQuote = "কলমের স্পর্শে আমি বিদ্রোহী, ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি; কেউ কেউ ভালোবেসে ডাকে আমায় কবি।";

// ═══════════════════════════════════════════════════════════════════════════════
// Animated counter
function Counter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  return <span ref={ref}>{inView ? target : "০"}{suffix}</span>;
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const quoteInView = useInView(quoteRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [{
      "@type": "Person",
      "name": "Mahbub Sardar Sabuj",
      "alternateName": "মাহবুব সরদার সবুজ",
      "url": "https://mahbub-sardar-sabuj-live.vercel.app/",
      "image": PROFILE_1,
      "jobTitle": "লেখক ও কবি",
      "description": "বাংলা সাহিত্যের লেখক ও কবি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট।",
      "sameAs": [
        "https://facebook.com/MahbubSardarSabuj",
        "https://www.instagram.com/mahbub_sardar_sabuj",
        "https://youtube.com/@mahbubsardarsabuj"
      ],
    }]
  };

  return (
    <div style={{ background: "#060E1A", minHeight: "100vh", overflowX: "hidden" }}>
      <Seo
        title="মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj | লেখক ও কবি"
        description="মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট। বই, লেখালেখি, কবিতা, গ্যালারি, সংবাদ এবং যোগাযোগ।"
        path="/"
        keywords="মাহবুব সরদার সবুজ, Mahbub Sardar Sabuj, বাংলা লেখক, কবি, বই"
        jsonLd={homeJsonLd}
      />
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — Cinematic Split Layout
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          background: "#060E1A",
        }}
      >
        {/* Full-bleed background image with parallax */}
        <motion.div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            y: heroY,
            scale: heroScale,
          }}
        />

        {/* Multi-layer gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg, rgba(6,14,26,0.97) 0%, rgba(6,14,26,0.88) 45%, rgba(6,14,26,0.4) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(6,14,26,1) 0%, transparent 40%)",
        }} />

        {/* Animated grain texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4,
          pointerEvents: "none",
        }} />

        {/* Gold radial glow — top right */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-10%", right: "-5%",
            width: "50vw", height: "50vw",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <motion.div
          style={{ position: "relative", zIndex: 2, width: "100%", opacity: heroOpacity }}
          className="hero-container"
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }} className="hero-inner">

            {/* Left column — text */}
            <div className="hero-left">
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: "2rem",
                }}
              >
                <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
                <span style={{
                  fontFamily: "'Space Grotesk', 'Noto Sans Bengali', sans-serif",
                  fontSize: "0.7rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                  fontWeight: 600,
                }}>লেখক ও কবি</span>
              </motion.div>

              {/* Main name — premium design */}
              <div style={{ position: "relative", marginBottom: "0.5rem" }}>
                {/* Decorative gold line left */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  style={{
                    position: "absolute", left: -24, top: "50%",
                    width: 16, height: 2,
                    background: "linear-gradient(90deg, transparent, #C9A84C)",
                    transformOrigin: "left",
                  }}
                />
                <motion.h1
                  initial={{ opacity: 0, y: 50, skewX: -3 }}
                  animate={{ opacity: 1, y: 0, skewX: 0 }}
                  transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: "'Tiro Bangla', serif",
                    fontSize: "clamp(3.2rem, 7.5vw, 6.5rem)",
                    fontWeight: 700,
                    lineHeight: 1.05,
                    margin: 0,
                    color: "#FAF6EF",
                    letterSpacing: "-0.02em",
                    textShadow: "0 0 80px rgba(201,168,76,0.15)",
                  }}
                >
                  মাহবুব
                </motion.h1>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 50, skewX: -3 }}
                animate={{ opacity: 1, y: 0, skewX: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: "'Tiro Bangla', serif",
                  fontSize: "clamp(3.2rem, 7.5vw, 6.5rem)",
                  fontWeight: 700,
                  lineHeight: 1.05,
                  margin: "0 0 0.5rem",
                  background: "linear-gradient(120deg, #B8922A 0%, #C9A84C 25%, #E8C97A 55%, #C9A84C 80%, #B8922A 100%)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.02em",
                  filter: "drop-shadow(0 0 20px rgba(201,168,76,0.3))",
                  animation: "goldShimmer 4s ease-in-out infinite",
                }}
              >
                সরদার সবুজ
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)",
                  color: "rgba(250,246,239,0.55)",
                  maxWidth: 480,
                  lineHeight: 1.9,
                  margin: "1.5rem 0 2.5rem",
                }}
              >
                বাংলা সাহিত্যের এক নিবেদিত কণ্ঠস্বর — কবিতা, গদ্য ও মানবিক অনুভূতির অনুসন্ধানী লেখক।
              </motion.p>

              {/* CTA buttons — one row, equal width */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.75 }}
                className="cta-row"
              >
                <Link href="/ebooks" style={{ flex: 1 }}>
                  <motion.span
                    whileHover={{ scale: 1.04, boxShadow: "0 20px 50px rgba(201,168,76,0.5)", y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="cta-btn cta-primary"
                  >
                    <BookOpen size={17} />
                    বই পড়ুন
                    <ArrowRight size={15} />
                  </motion.span>
                </Link>
                <Link href="/about" style={{ flex: 1 }}>
                  <motion.span
                    whileHover={{ scale: 1.04, borderColor: "rgba(201,168,76,0.8)", background: "rgba(201,168,76,0.06)", y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="cta-btn cta-secondary"
                  >
                    <UserRound size={17} />
                    পরিচিতি
                  </motion.span>
                </Link>
                <Link href="/editor" style={{ flex: 1 }}>
                  <motion.span
                    whileHover={{ scale: 1.04, borderColor: "rgba(201,168,76,0.8)", background: "rgba(201,168,76,0.06)", y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="cta-btn cta-secondary"
                  >
                    <Palette size={17} />
                    ডিজাইন করুন
                  </motion.span>
                </Link>
              </motion.div>


            </div>

            {/* Right column — author portrait */}
            <motion.div
              className="hero-right"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "relative" }}
            >
              {/* Portrait frame */}
              <motion.div
                animate={{
                  x: mousePos.x * 0.3,
                  y: mousePos.y * 0.3,
                }}
                transition={{ type: "spring", stiffness: 60, damping: 20 }}
                style={{ position: "relative" }}
              >
                {/* Decorative frame lines */}
                <div style={{
                  position: "absolute",
                  top: -20, right: -20,
                  width: "60%", height: "60%",
                  border: "1px solid rgba(201,168,76,0.25)",
                  borderRadius: 4,
                  pointerEvents: "none",
                  zIndex: 0,
                }} />
                <div style={{
                  position: "absolute",
                  bottom: -20, left: -20,
                  width: "60%", height: "60%",
                  border: "1px solid rgba(201,168,76,0.15)",
                  borderRadius: 4,
                  pointerEvents: "none",
                  zIndex: 0,
                }} />

                {/* Main portrait — suit photo */}
                <div style={{
                  position: "relative",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(201,168,76,0.18)",
                  zIndex: 1,
                }}>
                  <img
                    src={PROFILE_1}
                    alt="মাহবুব সরদার সবুজ"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                      display: "block",
                      filter: "contrast(1.05) saturate(0.88)",
                    }}
                    className="hero-portrait"
                  />
                  {/* Gradient overlay */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, transparent 50%, rgba(6,14,26,0.8) 100%)",
                  }} />
                  {/* Name tag at bottom */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "1.2rem 1.5rem",
                  }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: 3 }}>লেখক ও কবি</div>
                    <div style={{ fontFamily: "'Tiro Bangla', serif", fontSize: "1rem", color: "#FAF6EF", fontWeight: 700 }}>মাহবুব সরদার সবুজ</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{
            position: "absolute", bottom: 40, left: "50%",
            transform: "translateX(-50%)", zIndex: 3,
            opacity: heroOpacity,
          }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: "rgba(250,246,239,0.3)",
              fontSize: "0.62rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
            }}>Scroll</span>
            <div style={{
              width: 1, height: 40,
              background: "linear-gradient(to bottom, rgba(201,168,76,0.6), transparent)",
            }} />
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          MARQUEE — Gold band
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        background: "linear-gradient(90deg, #060E1A 0%, #0A1628 20%, #0d1e35 50%, #0A1628 80%, #060E1A 100%)",
        borderTop: "1px solid rgba(201,168,76,0.2)",
        borderBottom: "1px solid rgba(201,168,76,0.2)",
        padding: "14px 0",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* subtle gold glow line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)",
        }} />
        <motion.div
          animate={{ x: [0, -1400] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          style={{ display: "flex", gap: "5rem", whiteSpace: "nowrap", width: "max-content" }}
        >
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: "5rem", alignItems: "center" }}>
              <span style={{
                fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                color: "#C9A84C",
                fontSize: "1rem",
                fontWeight: 400,
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}>
                আপনাকে স্বাগতম
                <Star size={9} fill="#C9A84C" color="#C9A84C" />
                মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটে
                <Star size={9} fill="rgba(201,168,76,0.4)" color="rgba(201,168,76,0.4)" />
                বাংলা সাহিত্যের এক নিবেদিত কণ্ঠস্বর
                <Star size={9} fill="rgba(201,168,76,0.4)" color="rgba(201,168,76,0.4)" />
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          AUTHOR QUOTE — Full-width editorial
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={quoteRef}
        style={{
          position: "relative",
          padding: "8rem 2rem",
          overflow: "hidden",
          background: "#060E1A",
        }}
      >
        {/* Background image with heavy overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${ABOUT_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.06,
        }} />

        {/* Decorative large quote mark */}
        <div style={{
          position: "absolute",
          top: "10%", left: "5%",
          fontFamily: "Georgia, serif",
          fontSize: "20rem",
          color: "rgba(201,168,76,0.04)",
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
        }}>"</div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={quoteInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48, height: 48,
              borderRadius: "50%",
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.3)",
              marginBottom: "2.5rem",
            }}
          >
            <Quote size={20} color="#C9A84C" />
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0, y: 40 }}
            animate={quoteInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Tiro Bangla', serif",
              fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "rgba(250,246,239,0.9)",
              lineHeight: 1.7,
              margin: "0 0 2.5rem",
              letterSpacing: "0.01em",
            }}
          >
            "{authorQuote}"
          </motion.blockquote>

          <motion.div
            initial={{ opacity: 0 }}
            animate={quoteInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}
          >
            <div style={{ width: 40, height: 1, background: "rgba(201,168,76,0.4)" }} />
            <span style={{
              fontFamily: "'Noto Sans Bengali', sans-serif",
              fontSize: "0.85rem",
              color: "#C9A84C",
              letterSpacing: "0.1em",
            }}>মাহবুব সরদার সবুজ</span>
            <div style={{ width: 40, height: 1, background: "rgba(201,168,76,0.4)" }} />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURED BOOK — Editorial spotlight
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "7rem 2rem",
        background: "linear-gradient(180deg, #0A1628 0%, #0d1e35 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative grid lines */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>
          <div className="book-spotlight-grid">
            {/* Book cover */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              <div style={{ position: "relative" }}>
                {/* Glow behind book */}
                <div style={{
                  position: "absolute",
                  inset: -30,
                  background: "radial-gradient(ellipse, rgba(201,168,76,0.2) 0%, transparent 70%)",
                  borderRadius: "50%",
                  filter: "blur(20px)",
                }} />
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ position: "relative" }}
                >
                  <img
                    src={BOOK_COVER}
                    alt="আমি বিচ্ছেদকে বলি দুঃখবিলাস"
                    style={{
                      width: "clamp(180px, 25vw, 280px)",
                      borderRadius: 8,
                      boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.2), 8px 8px 0 rgba(201,168,76,0.08)",
                      display: "block",
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Book info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                borderRadius: 2,
                background: "rgba(201,168,76,0.1)",
                border: "1px solid rgba(201,168,76,0.25)",
                marginBottom: "1.5rem",
              }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                }}>সর্বশেষ প্রকাশনা</span>
              </div>

              <h2 style={{
                fontFamily: "'Tiro Bangla', serif",
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                fontWeight: 700,
                color: "#FAF6EF",
                lineHeight: 1.25,
                margin: "0 0 1.2rem",
              }}>
                আমি বিচ্ছেদকে বলি<br />
                <span style={{
                  background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>দুঃখবিলাস</span>
              </h2>

              <p style={{
                fontFamily: "'Noto Sans Bengali', sans-serif",
                fontSize: "1rem",
                color: "rgba(250,246,239,0.55)",
                lineHeight: 1.9,
                maxWidth: 480,
                margin: "0 0 2rem",
              }}>
                বিচ্ছেদের বেদনাকে যিনি দুঃখবিলাস বলেন, তাঁর কলমে উঠে আসে মানুষের অন্তরের সবচেয়ে গভীর অনুভূতি। এই বইটি সেই অনুভূতিরই এক অনন্য প্রকাশ।
              </p>

              {/* Rating */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "2rem" }}>
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={16} fill="#C9A84C" color="#C9A84C" />
                ))}
                <span style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  fontSize: "0.8rem",
                  color: "rgba(250,246,239,0.4)",
                  marginLeft: 8,
                }}>পাঠক পছন্দের বই</span>
              </div>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Link href="/ebooks">
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "13px 28px",
                      borderRadius: 4,
                      background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                      color: "#060E1A",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      textDecoration: "none",
                      boxShadow: "0 8px 24px rgba(201,168,76,0.3)",
                    }}
                  >
                    <BookOpen size={16} />
                    বই পড়ুন
                  </motion.span>
                </Link>
                <a
                  href="https://rkmri.co/TTMEoA3l3pM0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "13px 28px",
                      borderRadius: 4,
                      background: "transparent",
                      border: "1px solid rgba(201,168,76,0.3)",
                      color: "rgba(250,246,239,0.75)",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    <ExternalLink size={16} />
                    রকমারিতে কিনুন
                  </motion.span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTIONS GRID — Magazine-style navigation
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "7rem 2rem 8rem",
        background: "#060E1A",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle dot grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(201,168,76,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ marginBottom: "4rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "1rem" }}>
              <div style={{ width: 50, height: 1, background: "#C9A84C" }} />
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.68rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#C9A84C",
              }}>সকল বিভাগ</span>
            </div>
            <h2 style={{
              fontFamily: "'Tiro Bangla', serif",
              fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
              fontWeight: 700,
              color: "#FAF6EF",
              margin: 0,
              lineHeight: 1.2,
            }}>
              অন্বেষণ করুন
            </h2>
          </motion.div>

          {/* Sections grid */}
          <div className="sections-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "rgba(201,168,76,0.08)",
            border: "1px solid rgba(201,168,76,0.08)",
            borderRadius: 12,
            overflow: "hidden",
          }}>
            {sections.map((sec, i) => {
              const Icon = sec.icon;
              return (
                <motion.div
                  key={sec.href + sec.label}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <Link href={sec.href} style={{ textDecoration: "none", display: "block" }}>
                    <motion.div
                      whileHover={{ background: "rgba(201,168,76,0.06)" }}
                      style={{
                        padding: "2rem 1.75rem",
                        background: "#060E1A",
                        cursor: "pointer",
                        transition: "background 0.3s",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: 0,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Hover accent line */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        style={{
                          position: "absolute",
                          top: 0, left: 0, right: 0,
                          height: 2,
                          background: "linear-gradient(90deg, #C9A84C, #E8C97A)",
                          transformOrigin: "left",
                        }}
                      />

                      {/* Number */}
                      <div style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: "0.65rem",
                        color: "rgba(201,168,76,0.3)",
                        letterSpacing: "0.2em",
                        marginBottom: "1rem",
                      }}>
                        {String(i + 1).padStart(2, "0")}
                      </div>

                      {/* Icon */}
                      <div style={{
                        width: 42, height: 42,
                        borderRadius: 10,
                        background: "rgba(201,168,76,0.08)",
                        border: "1px solid rgba(201,168,76,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1.2rem",
                      }}>
                        <Icon size={19} color="#C9A84C" />
                      </div>

                      {/* Label */}
                      <h3 style={{
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: "#FAF6EF",
                        margin: "0 0 0.4rem",
                        lineHeight: 1.3,
                      }}>
                        {sec.label}
                      </h3>

                      {/* Subtitle */}
                      <p style={{
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontSize: "0.78rem",
                        color: "rgba(250,246,239,0.38)",
                        margin: "0 0 1.2rem",
                        lineHeight: 1.5,
                        flex: 1,
                      }}>
                        {sec.subtitle}
                      </p>

                      {/* Arrow */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "rgba(201,168,76,0.5)",
                      }}>
                        <ArrowRight size={15} />
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          AUTHOR PROFILE — Cinematic split
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "7rem 2rem",
        background: "linear-gradient(180deg, #0A1628 0%, #060E1A 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="author-profile-grid">
            {/* Left: image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              style={{ position: "relative" }}
            >
              <div style={{
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
                position: "relative",
              }}>
                <img
                  src={PROFILE_2}
                  alt="মাহবুব সরদার সবুজ — লেখার মুহূর্তে"
                  style={{
                    width: "100%",
                    display: "block",
                    filter: "contrast(1.05) saturate(0.9) brightness(1.02)",
                  }}
                  className="author-profile-img"
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, transparent 60%, rgba(6,14,26,0.8) 100%)",
                }} />
              </div>

              {/* Gold accent border */}
              <div style={{
                position: "absolute",
                top: 20, left: -20,
                width: "30%", height: "50%",
                border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: 8,
                pointerEvents: "none",
              }} />
            </motion.div>

            {/* Right: text */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "2rem" }}>
                <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.68rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                }}>লেখক পরিচয়</span>
              </div>

              <h2 style={{
                fontFamily: "'Tiro Bangla', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                color: "#FAF6EF",
                lineHeight: 1.25,
                margin: "0 0 1.5rem",
              }}>
                কলমের মানুষ,<br />
                <span style={{
                  background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>মানুষের কলম</span>
              </h2>

              <p style={{
                fontFamily: "'Noto Sans Bengali', sans-serif",
                fontSize: "1rem",
                color: "rgba(250,246,239,0.55)",
                lineHeight: 1.95,
                margin: "0 0 1.2rem",
                maxWidth: 500,
              }}>
                মাহবুব সরদার সবুজ বাংলা সাহিত্যের একজন নিবেদিতপ্রাণ লেখক ও কবি। তাঁর লেখায় মানবিক সম্পর্ক, প্রকৃতি, বিচ্ছেদ ও আশার গল্প উঠে আসে অনন্য ভাষায়।
              </p>
              <p style={{
                fontFamily: "'Noto Sans Bengali', sans-serif",
                fontSize: "1rem",
                color: "rgba(250,246,239,0.45)",
                lineHeight: 1.95,
                margin: "0 0 2.5rem",
                maxWidth: 500,
              }}>
                সৌদি আরবে বসবাসরত এই লেখক তাঁর কবিতা ও গদ্যে দেশ, প্রবাস ও মানুষের জীবনের নানা রঙ তুলে ধরেন।
              </p>

              <Link href="/about">
                <motion.span
                  whileHover={{ scale: 1.03, x: 4 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    color: "#C9A84C",
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                  }}
                >
                  সম্পূর্ণ পরিচয় পড়ুন
                  <ArrowRight size={16} />
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── Responsive CSS ────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Noto+Sans+Bengali:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @import url('https://cdn.msar.me/fonts/adorsho-lipi/font.css');

        * { box-sizing: border-box; }

        @keyframes goldShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* CTA row — one line, equal boxes */
        .cta-row {
          display: flex;
          gap: 10px;
          width: 100%;
          max-width: 520px;
        }
        .cta-row a {
          flex: 1;
          text-decoration: none;
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 10px;
          border-radius: 6px;
          font-family: 'Noto Sans Bengali', sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          width: 100%;
          white-space: nowrap;
          transition: all 0.25s ease;
          letter-spacing: 0.01em;
        }
        .cta-primary {
          background: linear-gradient(135deg, #C9A84C 0%, #E8C97A 50%, #C9A84C 100%);
          background-size: 200% 100%;
          color: #060E1A;
          box-shadow: 0 8px 28px rgba(201,168,76,0.35);
          animation: goldShimmer 3s ease-in-out infinite;
        }
        .cta-secondary {
          background: rgba(201,168,76,0.04);
          border: 1px solid rgba(201,168,76,0.3);
          color: rgba(250,246,239,0.85);
          backdrop-filter: blur(10px);
        }
        .cta-secondary:hover {
          background: rgba(201,168,76,0.08);
          border-color: rgba(201,168,76,0.7);
        }

        /* Hero layout */
        .hero-container {
          padding-top: 100px;
          padding-bottom: 80px;
        }
        .hero-inner {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 5rem;
          align-items: center;
        }
        .hero-portrait {
          height: 560px;
          width: 100%;
          object-fit: cover;
        }
        .floating-card {
          min-width: 180px;
        }

        /* Book spotlight */
        .book-spotlight-grid {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 5rem;
          align-items: center;
        }

        /* Sections grid */
        .sections-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }

        /* Author profile */
        .author-profile-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 5rem;
          align-items: center;
        }
        .author-profile-img {
          height: 520px;
          object-fit: cover;
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .hero-inner {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }
          .hero-right {
            display: flex;
            justify-content: center;
          }
          .hero-portrait { height: 400px; }
          .floating-card { display: none; }
          .book-spotlight-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }
          .author-profile-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .author-profile-img { height: 380px; }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .hero-container { padding-top: 80px; padding-bottom: 60px; }
          .sections-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-portrait { height: 320px; }
        }

        @media (max-width: 480px) {
          .sections-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
