/*
 * Design: "Ink & Gold" — World-Class Literary Premium
 * Concept: Cinematic dark luxury author portfolio
 * Palette: Deep Navy #060E1A, Rich Gold #C9A84C, Ivory #FAF6EF, Charcoal #1E2D3D
 * Inspiration: Sarah Vaughan, Anthony Horowitz, luxury editorial magazines
 */
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  BookOpen, Mic2, Images, Newspaper, Mail,
  UserRound, Palette, ArrowRight, ExternalLink,
  Quote, Star, Feather
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import AdSenseAd from "@/components/AdSenseAd";

// ── Assets ────────────────────────────────────────────────────────────────────
const PROFILE_1 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";
const PROFILE_2 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile2_57482935.jpg";
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/hero-bg-U7hjBDvWeoSXDDh3veCUTN.webp";
const BOOK_COVER = "/images/book-cover-20260328.jpg";
const ABOUT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/about-bg-UJ5ebeZYm7Pq6XtFEyFtTv.webp";

// ── Navigation sections ───────────────────────────────────────────────────────
const sections = [
  { label: "পরিচিতি", subtitle: "লেখক পরিচয় ও সংক্ষিপ্ত জীবনপথ", href: "/about", icon: UserRound },
  { label: "আবৃত্তি", subtitle: "ভিডিও ও আবৃত্তির নির্বাচিত উপস্থাপনা", href: "/facebook-recitations", icon: Mic2 },
  { label: "লেখালেখি ও বই", subtitle: "কবিতা, লেখা ও প্রকাশিত বই সংগ্রহ", href: "/writings", icon: BookOpen },
  { label: "আমিও লিখবো বাস্তবতা", subtitle: "সৃজনশীল লেখালেখির নতুন কমিউনিটি", href: "/amio-likhbo-bastobota", icon: Feather },
  { label: "ডিজাইন ফরম্যাট", subtitle: "কার্ড ডিজাইন ও লেখা তৈরি করুন", href: "/editor", icon: Palette },
  { label: "গ্যালারি", subtitle: "ছবি, মুহূর্ত ও ভিজ্যুয়াল সংগ্রহ", href: "/gallery", icon: Images },
  { label: "সরদার সংবাদ", subtitle: "আপডেট, প্রকাশনা ও সাম্প্রতিক খবর", href: "/news", icon: Newspaper },
  { label: "যোগাযোগ", subtitle: "ইমেইল, লিংক ও যোগাযোগের উপায়", href: "/contact", icon: Mail },
];

// ── Quote ─────────────────────────────────────────────────────────────────────
const authorQuote = "কলমের স্পর্শে আমি বিদ্রোহী, ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি; কেউ কেউ ভালোবেসে ডাকে আমায় কবি।";

// ═════════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const quoteInView = useInView(quoteRef, { once: true, margin: "-100px" });

  // Throttled mousemove handler — fires at most once per 50ms to reduce re-renders
  const mouseMoveThrottleRef = useRef<number | null>(null);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (mouseMoveThrottleRef.current !== null) return;
    mouseMoveThrottleRef.current = window.setTimeout(() => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
      mouseMoveThrottleRef.current = null;
    }, 50);
  }, []);
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (mouseMoveThrottleRef.current !== null) clearTimeout(mouseMoveThrottleRef.current);
    };
  }, [handleMouseMove]);

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [{
      "@type": "Person",
      "name": "Mahbub Sardar Sabuj",
      "alternateName": "মাহবুব সরদার সবুজ",
      "url": "https://www.mahbubsardarsabuj.com/",
      "image": PROFILE_1,
      "jobTitle": "লেখক ও কবি",
      "description": "বাংলা সাহিত্যের লেখক ও কবি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট।",
      "sameAs": [
        "https://facebook.com/MahbubSardarSabuj",
        "https://www.instagram.com/mahbub_sardar_sabuj",
        "https://youtube.com/@MahbubSardarSabuj"
      ],
    }]
  };

  return (
    <div style={{ background: "#060E1A", minHeight: "100vh", overflowX: "hidden" }}>
      <Seo
        title="মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj - লেখক ও কবি"
        description="মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট। লেখকের পরিচিতি, বাংলা কবিতা, লেখালেখি, বই, ই-বুক, গ্যালারি ও সরদার সংবাদ একসাথে পড়ুন।"
        path="/"
        keywords="মাহবুব সরদার সবুজ, Mahbub Sardar Sabuj, বাংলা কবি, বাংলা লেখক, বাংলা কবিতা, ভালোবাসার কবিতা, বিচ্ছেদের কবিতা, বাংলা ই-বুক, দুঃখবিলাস, স্মৃতির বসন্তে তুমি, চাঁদফুল, সময়ের গহ্বরে, বাংলা সাহিত্য, বাংলাদেশি লেখক, mahbub sardar sabuj kobita, bangla kobita, bangla sahitya, bangladeshi poet, bangla ebook free, সরদার সংবাদ"
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

              {/* Eyebrow badge */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16,1,0.3,1] }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: "1.8rem",
                  marginTop: "0.6rem",
                  padding: "5px 14px 5px 11px",
                  borderRadius: 40,
                  border: "1px solid rgba(201,168,76,0.35)",
                  background: "rgba(201,168,76,0.06)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 0 20px rgba(201,168,76,0.08), inset 0 1px 0 rgba(201,168,76,0.15)",
                }}
              >
                {/* Pulsing dot */}
                <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#C9A84C",
                    display: "block",
                    boxShadow: "0 0 6px #C9A84C",
                    animation: "pulseDot 2s ease-in-out infinite",
                  }} />
                </span>
                <span style={{
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "0.82rem",
                  letterSpacing: "0.2em",
                  color: "#C9A84C",
                  fontWeight: 400,
                }}>লেখক ও কবি</span>
              </motion.div>

              {/* Main name */}
              <div style={{ position: "relative", marginBottom: "0.2rem" }}>
                <motion.h1
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: "'Tiro Bangla', serif",
                    fontSize: "clamp(3.4rem, 8vw, 7rem)",
                    fontWeight: 700,
                    lineHeight: 1.0,
                    margin: 0,
                    color: "#FAF6EF",
                    letterSpacing: "-0.02em",
                    textShadow: "0 2px 40px rgba(201,168,76,0.18), 0 0 80px rgba(201,168,76,0.08)",
                  }}
                >
                  মাহবুব
                </motion.h1>
              </div>

              <div style={{ position: "relative", marginBottom: "0.6rem" }}>
                <motion.h1
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: "'Tiro Bangla', serif",
                    fontSize: "clamp(3.4rem, 8vw, 7rem)",
                    fontWeight: 700,
                    lineHeight: 1.0,
                    margin: 0,
                    background: "linear-gradient(110deg, #9A6E1A 0%, #C9A84C 20%, #F0D98A 45%, #E8C97A 60%, #C9A84C 80%, #9A6E1A 100%)",
                    backgroundSize: "250% 100%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-0.02em",
                    filter: "drop-shadow(0 4px 24px rgba(201,168,76,0.4))",
                    animation: "goldShimmer 4s ease-in-out infinite",
                  }}
                >
                  সরদার সবুজ
                </motion.h1>
                {/* Underline glow */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.8, ease: [0.16,1,0.3,1] }}
                  style={{
                    position: "absolute", bottom: -6, left: 0,
                    height: 2,
                    width: "70%",
                    background: "linear-gradient(90deg, #C9A84C, rgba(201,168,76,0.3), transparent)",
                    transformOrigin: "left",
                    borderRadius: 2,
                    boxShadow: "0 0 12px rgba(201,168,76,0.5)",
                  }}
                />
              </div>

              {/* Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.65 }}
                style={{ margin: "2rem 0 2.5rem", maxWidth: 480 }}
              >
                <p style={{
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "clamp(1rem, 1.9vw, 1.2rem)",
                  color: "rgba(250,246,239,0.65)",
                  lineHeight: 2,
                  margin: 0,
                  letterSpacing: "0.02em",
                  borderLeft: "2px solid rgba(201,168,76,0.4)",
                  paddingLeft: 16,
                }}>
                  বাংলা সাহিত্যের এক নিবেদিত কণ্ঠস্বর — কবিতা, গদ্য ও মানবিক অনুভূতির অনুসন্ধানী লেখক।
                </p>
              </motion.div>

              {/* CTA buttons — one row */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="cta-row"
              >
                <Link href="/writings" style={{ flex: 1 }}>
                  <motion.span
                    whileHover={{ scale: 1.05, y: -3, boxShadow: "0 20px 50px rgba(201,168,76,0.55)" }}
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
                    whileHover={{ scale: 1.05, y: -3, borderColor: "rgba(201,168,76,0.9)", background: "rgba(201,168,76,0.1)" }}
                    whileTap={{ scale: 0.96 }}
                    className="cta-btn cta-secondary"
                  >
                    <UserRound size={17} />
                    পরিচিতি
                  </motion.span>
                </Link>
                <Link href="/editor" style={{ flex: 1 }}>
                  <motion.span
                    whileHover={{ scale: 1.05, y: -3, borderColor: "rgba(201,168,76,0.9)", background: "rgba(201,168,76,0.1)" }}
                    whileTap={{ scale: 0.96 }}
                    className="cta-btn cta-secondary"
                  >
                    <Palette size={17} />
                    ডিজাইন করুন
                  </motion.span>
                </Link>
                <Link href="/news" style={{ flex: 1 }}>
                  <motion.span
                    whileHover={{ scale: 1.05, y: -3, borderColor: "rgba(201,168,76,0.9)", background: "rgba(201,168,76,0.1)" }}
                    whileTap={{ scale: 0.96 }}
                    className="cta-btn cta-secondary"
                  >
                    <Newspaper size={17} />
                    সরদার সংবাদ
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
                    alt="মাহবুব সরদার সবুজ - বাংলা কবি ও লেখক - অফিসিয়াল প্রোফাইল ছবি"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                      display: "block",
                      filter: "contrast(1.05) saturate(0.88)",
                    }}
                    className="hero-portrait"
                    fetchPriority="high"
                    decoding="async"
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
          AUTHOR QUOTE — Premium editorial glass panel
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={quoteRef}
        style={{
          position: "relative",
          padding: "7rem 2rem",
          overflow: "hidden",
          background: "radial-gradient(circle at 20% 10%, rgba(201,168,76,0.08), transparent 32%), linear-gradient(180deg, #071321 0%, #060E1A 100%)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${ABOUT_BG})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.055 }} />
        <div style={{ position: "absolute", inset: "12% 8%", border: "1px solid rgba(201,168,76,0.08)", borderRadius: 36, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 980, margin: "0 auto", textAlign: "center", padding: "clamp(2rem, 5vw, 4rem)", borderRadius: 30, border: "1px solid rgba(201,168,76,0.16)", background: "linear-gradient(145deg, rgba(255,255,255,0.045), rgba(201,168,76,0.026))", boxShadow: "0 35px 100px rgba(0,0,0,0.28)", backdropFilter: "blur(16px)" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={quoteInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.55 }}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 50, height: 50, borderRadius: "50%", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.28)", marginBottom: "2rem" }}
          >
            <Quote size={20} color="#C9A84C" />
          </motion.div>
          <motion.blockquote
            initial={{ opacity: 0, y: 35 }}
            animate={quoteInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.12 }}
            style={{ fontFamily: "'Tiro Bangla', serif", fontSize: "clamp(1.45rem, 3.4vw, 2.35rem)", fontStyle: "italic", color: "rgba(250,246,239,0.9)", lineHeight: 1.75, margin: "0 0 2rem" }}
          >
            “{authorQuote}”
          </motion.blockquote>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
            <span style={{ width: 48, height: 1, background: "rgba(201,168,76,0.45)" }} />
            <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.88rem", color: "#C9A84C", letterSpacing: "0.08em" }}>মাহবুব সরদার সবুজ</span>
            <span style={{ width: 48, height: 1, background: "rgba(201,168,76,0.45)" }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURED BOOK — Elegant literary spotlight
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="featured-book-section" style={{
        padding: "clamp(5rem, 9vw, 7.5rem) 1.25rem",
        background: "radial-gradient(circle at 18% 18%, rgba(201,168,76,0.12), transparent 30%), radial-gradient(circle at 84% 76%, rgba(232,201,122,0.075), transparent 32%), linear-gradient(180deg, #060E1A 0%, #0A1628 52%, #071321 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(201,168,76,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.035) 1px, transparent 1px)", backgroundSize: "70px 70px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "50%", top: "10%", width: 520, height: 520, transform: "translateX(-50%)", borderRadius: "50%", background: "rgba(201,168,76,0.055)", filter: "blur(90px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1120, margin: "0 auto" }}>
          <div className="book-spotlight-grid">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ display: "flex", justifyContent: "center" }}>
              <div className="book-cover-frame">
                <div className="book-cover-glow" />
                <div className="book-cover-badge">নির্বাচিত বই</div>
                <img src={BOOK_COVER} alt="দুঃখবিলাস - মাহবুব সরদার সবুজের প্রকাশিত বাংলা কবিতা সংগ্রহ বই" className="featured-book-cover" loading="lazy" decoding="async" />
              </div>
            </motion.div>
            <motion.div className="book-copy-panel" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.12 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 17px", borderRadius: 999, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.28)", marginBottom: "1.45rem", boxShadow: "0 12px 35px rgba(0,0,0,0.18)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E8C97A", boxShadow: "0 0 12px rgba(201,168,76,0.8)" }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.66rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "#E8C97A" }}>Featured Book</span>
              </div>
              <h2 style={{ fontFamily: "'Tiro Bangla', serif", fontSize: "clamp(2.15rem, 4.4vw, 3.45rem)", fontWeight: 700, color: "#FAF6EF", lineHeight: 1.2, margin: "0 0 1.25rem", letterSpacing: "-0.01em" }}>
                বিচ্ছেদের নীরব ভাষা,<br />
                <span style={{ background: "linear-gradient(135deg, #F5DE93, #C9A84C 55%, #FFF0B3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>দুঃখবিলাস</span>
              </h2>
              <p style={{ fontFamily: "'Tiro Bangla', serif", fontSize: "clamp(1.08rem, 2.1vw, 1.32rem)", color: "rgba(250,246,239,0.68)", lineHeight: 2.05, maxWidth: 590, margin: "0 0 1.45rem" }}>
                যে বেদনা বলা যায় না, কবি তাকে শব্দের কোমল আশ্রয়ে তুলে ধরেছেন। <strong style={{ color: "#E8C97A", fontWeight: 700 }}>দুঃখবিলাস</strong> হলো প্রেম, বিচ্ছেদ ও স্মৃতির এমন এক কাব্যভুবন—যেখানে নীরব কান্নাও হয়ে ওঠে সাহিত্যের সৌন্দর্য।
              </p>
              <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.94rem", color: "rgba(250,246,239,0.48)", lineHeight: 1.9, maxWidth: 570, margin: "0 0 1.7rem" }}>
                পাঠকের হৃদয়ের গভীরে জমে থাকা না-বলা অনুভূতিগুলোকে এই বই স্পর্শ করে মমতা, সংযম ও অনুপম ভাষার ভেতর দিয়ে।
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "2rem" }}>
                {["কাব্যগ্রন্থ", "প্রেম ও বিচ্ছেদ", "হৃদয়ের ভাষা"].map((tag) => (
                  <span key={tag} style={{ padding: "8px 13px", borderRadius: 999, border: "1px solid rgba(201,168,76,0.2)", background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(201,168,76,0.05))", color: "rgba(250,246,239,0.68)", fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.78rem", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>{tag}</span>
                ))}
              </div>
              <div className="featured-book-actions">
                <Link href="/writings" style={{ textDecoration: "none" }}>
                  <motion.span className="featured-book-btn featured-book-btn-primary" whileHover={{ scale: 1.035, y: -2 }} whileTap={{ scale: 0.97 }}>
                    <BookOpen size={17} /> বই পড়ুন
                  </motion.span>
                </Link>
                <a href="https://rkmri.co/TTMEoA3l3pM0/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <motion.span className="featured-book-btn featured-book-btn-secondary" whileHover={{ scale: 1.035, y: -2 }} whileTap={{ scale: 0.97 }}>
                    <ExternalLink size={17} /> রকমারিতে কিনুন
                  </motion.span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          APP LAUNCHER — Compact explore tabs
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="explore-app-section" style={{
        padding: "clamp(4.2rem, 8vw, 6.5rem) 1.25rem",
        background: "radial-gradient(circle at 78% 12%, rgba(201,168,76,0.1), transparent 30%), radial-gradient(circle at 12% 78%, rgba(232,201,122,0.055), transparent 28%), #060E1A",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(201,168,76,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none", opacity: 0.45 }} />
        <div style={{ position: "absolute", inset: "12% auto auto 50%", width: 420, height: 420, transform: "translateX(-50%)", borderRadius: "50%", background: "rgba(201,168,76,0.055)", filter: "blur(95px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 980, margin: "0 auto" }}>
          <motion.div className="explore-app-heading" initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: "0.95rem" }}>
              <div style={{ width: 42, height: 1, background: "linear-gradient(90deg, transparent, #C9A84C)" }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.66rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "#C9A84C" }}>Explore</span>
              <div style={{ width: 42, height: 1, background: "linear-gradient(90deg, #C9A84C, transparent)" }} />
            </div>
            <h2 style={{ fontFamily: "'Tiro Bangla', serif", fontSize: "clamp(2rem, 5vw, 3.05rem)", fontWeight: 700, color: "#FAF6EF", margin: 0, lineHeight: 1.18 }}>অন্বেষণ করুন</h2>
            <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", maxWidth: 650, color: "rgba(250,246,239,0.54)", lineHeight: 1.75, margin: "1rem auto 0", fontSize: "0.92rem" }}>
              ওয়েবসাইটের সব গুরুত্বপূর্ণ ট্যাব এখন ফোনের অ্যাপের মতো এক জায়গায়—ট্যাপ করলেই দ্রুত খুলে যাবে।
            </p>
          </motion.div>

          <motion.div className="app-launcher-shell" initial={{ opacity: 0, y: 30, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.72, delay: 0.08 }}>
            <div className="app-launcher-topbar">
              <span />
              <strong>সব ট্যাব</strong>
              <span />
            </div>
            <div className="app-launcher-grid">
              {sections.map((sec, i) => {
                const Icon = sec.icon;
                return (
                  <motion.div key={sec.href + sec.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.38, delay: i * 0.035 }}>
                    <Link href={sec.href} className="app-launcher-link" aria-label={`${sec.label} খুলুন`}>
                      <motion.div className="app-launcher-card" whileHover={{ y: -5, scale: 1.025 }} whileTap={{ scale: 0.96 }}>
                        <div className="app-icon-wrap">
                          <Icon size={23} strokeWidth={1.9} />
                        </div>
                        <span className="app-label">{sec.label}</span>
                        <span className="app-subtitle">{sec.subtitle}</span>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          AUTHOR PROFILE — Redesigned clean split
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "7rem 2rem",
        background: "linear-gradient(180deg, #0A1628 0%, #060E1A 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 18% 20%, rgba(201,168,76,0.11), transparent 32%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1120, margin: "0 auto" }}>
          <div className="author-profile-grid">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ position: "relative" }}>
              <div style={{ borderRadius: 28, overflow: "hidden", boxShadow: "0 42px 100px rgba(0,0,0,0.52)", position: "relative", border: "1px solid rgba(201,168,76,0.16)", padding: 6, background: "rgba(255,255,255,0.035)" }}>
                <img src={PROFILE_2} alt="মাহবুব সরদার সবুজ - বাংলা কবি ও লেখক - লেখার মুহূর্তে প্রোফাইল ছবি" onError={(e) => { (e.target as HTMLImageElement).src = PROFILE_1; }} style={{ width: "100%", display: "block", filter: "contrast(1.05) saturate(0.9) brightness(1.02)", borderRadius: 22 }} className="author-profile-img" loading="lazy" decoding="async" />
                <div style={{ position: "absolute", inset: 6, borderRadius: 22, background: "linear-gradient(to bottom, transparent 55%, rgba(6,14,26,0.82) 100%)" }} />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "2rem" }}>
                <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.68rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A84C" }}>লেখক পরিচয়</span>
              </div>
              <h2 style={{ fontFamily: "'Tiro Bangla', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#FAF6EF", lineHeight: 1.25, margin: "0 0 1.5rem" }}>
                কলমের মানুষ,<br />
                <span style={{ background: "linear-gradient(135deg, #C9A84C, #E8C97A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>মানুষের কলম</span>
              </h2>
              <p style={{ fontFamily: "'Tiro Bangla', serif", fontSize: "clamp(1.08rem, 2.5vw, 1.28rem)", color: "rgba(250,246,239,0.62)", lineHeight: 2.05, margin: "0 0 1.2rem", maxWidth: 560, letterSpacing: "0.01em" }}>
                মাহবুব সরদার সবুজ সমকালীন বাংলা সাহিত্যের একজন অনুভূতিশীল লেখক ও কবি। তাঁর কলমে ভালোবাসা, বিচ্ছেদ, মানবিক সম্পর্ক ও জীবনের নীরব সত্যগুলো সহজ অথচ হৃদয়স্পর্শী ভাষায় ফুটে ওঠে।
              </p>
              <p style={{ fontFamily: "'Tiro Bangla', serif", fontSize: "clamp(1.08rem, 2.5vw, 1.28rem)", color: "rgba(250,246,239,0.54)", lineHeight: 2.05, margin: 0, maxWidth: 560, letterSpacing: "0.01em" }}>
                প্রবাসের দূরত্বে থেকেও তিনি বাংলা ভাষা, মাটি ও মানুষের সঙ্গে গভীর আত্মিক বন্ধন বহন করেন। তাই তাঁর কবিতা ও গদ্যে ফিরে আসে দেশ, স্মৃতি, প্রবাসজীবন এবং মানুষের অন্তর্গত আলোর গল্প।
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AdSense Ad — হোম পেজের নিচে */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <AdSenseAd adSlot="" adFormat="auto" fullWidthResponsive={true} />
      </div>

      {/* ── Responsive CSS ────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Noto+Sans+Bengali:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @import url('https://cdn.msar.me/fonts/adorsho-lipi/font.css');

        * { box-sizing: border-box; }

        @keyframes goldShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 8px #C9A84C; }
          50% { opacity: 0.6; transform: scale(1.5); box-shadow: 0 0 16px rgba(201,168,76,0.8); }
        }

        /* CTA row — one line, equal boxes */
        .cta-row {
          display: flex;
          gap: 8px;
          width: 100%;
          max-width: 680px;
        }
        .cta-row a {
          flex: 1;
          text-decoration: none;
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 13px 8px;
          border-radius: 6px;
          font-family: 'Noto Sans Bengali', sans-serif;
          font-size: 0.82rem;
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
          padding-top: calc(var(--site-nav-offset, 98px) + 20px);
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
          grid-template-columns: 0.92fr 1.18fr;
          gap: clamp(3rem, 6vw, 5.6rem);
          align-items: center;
        }
        .book-cover-frame {
          position: relative;
          padding: clamp(0.95rem, 2vw, 1.25rem);
          border-radius: 34px;
          background: linear-gradient(145deg, rgba(255,255,255,0.075), rgba(201,168,76,0.065));
          border: 1px solid rgba(201,168,76,0.22);
          box-shadow: 0 46px 120px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.08);
          overflow: hidden;
        }
        .book-cover-frame::before {
          content: "";
          position: absolute;
          inset: 11px;
          border-radius: 25px;
          border: 1px solid rgba(232,201,122,0.13);
          pointer-events: none;
          z-index: 2;
        }
        .book-cover-glow {
          position: absolute;
          inset: -34px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,201,122,0.2), transparent 66%);
          filter: blur(20px);
          pointer-events: none;
        }
        .book-cover-badge {
          position: absolute;
          top: 22px;
          left: 22px;
          z-index: 3;
          padding: 7px 12px;
          border-radius: 999px;
          border: 1px solid rgba(232,201,122,0.28);
          background: rgba(6,14,26,0.72);
          backdrop-filter: blur(12px);
          color: #F5DE93;
          font-family: 'Noto Sans Bengali', sans-serif;
          font-size: 0.74rem;
          box-shadow: 0 12px 28px rgba(0,0,0,0.3);
        }
        .featured-book-cover {
          position: relative;
          z-index: 1;
          width: clamp(205px, 27vw, 318px);
          border-radius: 22px;
          box-shadow: 0 30px 78px rgba(0,0,0,0.66);
          display: block;
        }
        .book-copy-panel {
          position: relative;
          padding: clamp(1.2rem, 3vw, 2.15rem);
          border-radius: 32px;
          background: linear-gradient(145deg, rgba(255,255,255,0.045), rgba(201,168,76,0.025));
          border: 1px solid rgba(201,168,76,0.12);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.055);
        }
        .book-copy-panel::before {
          content: "“";
          position: absolute;
          top: -0.35rem;
          right: 1.4rem;
          font-family: 'Tiro Bangla', serif;
          font-size: 6.8rem;
          line-height: 1;
          color: rgba(201,168,76,0.12);
          pointer-events: none;
        }
        .featured-book-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }
        .featured-book-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 50px;
          padding: 13px 26px;
          border-radius: 999px;
          font-family: 'Tiro Bangla', serif;
          font-size: 1.04rem;
          font-weight: 700;
          cursor: pointer;
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .featured-book-btn-primary {
          background: linear-gradient(135deg, #C9A84C, #F5DE93 58%, #E8C97A);
          color: #060E1A;
          box-shadow: 0 16px 40px rgba(201,168,76,0.32);
        }
        .featured-book-btn-secondary {
          background: rgba(201,168,76,0.055);
          border: 1px solid rgba(201,168,76,0.36);
          color: #F5DE93;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.045);
        }

        /* App-style Explore launcher */
        .explore-app-heading {
          text-align: center;
          margin-bottom: 2.2rem;
        }
        .app-launcher-shell {
          border: 1px solid rgba(201,168,76,0.18);
          border-radius: 34px;
          padding: clamp(1.05rem, 3vw, 1.55rem);
          background: linear-gradient(145deg, rgba(255,255,255,0.07), rgba(201,168,76,0.035));
          box-shadow: 0 36px 110px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08);
          backdrop-filter: blur(18px);
          max-width: 820px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }
        .app-launcher-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(232,201,122,0.13), transparent 42%);
          pointer-events: none;
        }
        .app-launcher-topbar {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 0 0 1rem;
          color: rgba(232,201,122,0.78);
          font-family: 'Noto Sans Bengali', sans-serif;
          font-size: 0.76rem;
          letter-spacing: 0.08em;
        }
        .app-launcher-topbar span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(201,168,76,0.46);
          box-shadow: 0 0 14px rgba(201,168,76,0.42);
        }
        .app-launcher-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: clamp(0.72rem, 2.4vw, 1.05rem);
        }
        .app-launcher-link {
          display: block;
          text-decoration: none;
          height: 100%;
        }
        .app-launcher-card {
          min-height: 138px;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          text-align: center;
          gap: 0.48rem;
          padding: 1rem 0.6rem 0.85rem;
          border-radius: 24px;
          border: 1px solid rgba(201,168,76,0.14);
          background: linear-gradient(180deg, rgba(8,20,34,0.86), rgba(11,25,42,0.68));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.055), 0 16px 38px rgba(0,0,0,0.22);
          color: #FAF6EF;
          cursor: pointer;
          transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
        }
        .app-launcher-card:hover {
          border-color: rgba(201,168,76,0.42);
          background: linear-gradient(180deg, rgba(201,168,76,0.115), rgba(9,22,38,0.82));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 22px 50px rgba(0,0,0,0.28);
        }
        .app-icon-wrap {
          width: clamp(48px, 7vw, 58px);
          height: clamp(48px, 7vw, 58px);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #E8C97A;
          background: linear-gradient(145deg, rgba(201,168,76,0.18), rgba(250,246,239,0.04));
          border: 1px solid rgba(201,168,76,0.24);
          box-shadow: 0 10px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08);
          margin-bottom: 0.18rem;
        }
        .app-label {
          font-family: 'Tiro Bangla', serif;
          font-size: clamp(0.86rem, 2.2vw, 1.02rem);
          font-weight: 700;
          line-height: 1.22;
          color: #FAF6EF;
          min-height: 2.45em;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .app-subtitle {
          font-family: 'Noto Sans Bengali', sans-serif;
          font-size: 0.66rem;
          line-height: 1.35;
          color: rgba(250,246,239,0.42);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
          .book-copy-panel { max-width: 720px; margin: 0 auto; }
          .featured-book-actions { justify-content: center; }
          .author-profile-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .author-profile-img { height: 380px; }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .hero-container { padding-top: calc(var(--site-nav-offset, 98px) + 10px); padding-bottom: 60px; }
          .app-launcher-shell { border-radius: 28px; }
          .app-launcher-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.62rem; }
          .app-launcher-card { min-height: 124px; border-radius: 20px; padding: 0.85rem 0.35rem 0.7rem; }
          .app-icon-wrap { border-radius: 16px; }
          .app-subtitle { display: none; }
          .hero-portrait { height: 320px; }
          .featured-book-section { padding-left: 0.8rem !important; padding-right: 0.8rem !important; }
          .book-copy-panel { padding: 1.2rem 0.9rem 1.35rem; border-radius: 26px; }
          .book-copy-panel::before { font-size: 4.8rem; right: 0.7rem; top: -0.2rem; }
          .featured-book-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.72rem; }
          .featured-book-btn { width: 100%; min-height: 54px; padding: 12px 10px; font-size: 0.98rem; }
          .cta-row { gap: 5px; max-width: 100%; }
          .cta-btn {
            font-size: 0.72rem;
            padding: 11px 4px;
            gap: 3px;
          }
          .cta-btn svg { width: 13px; height: 13px; }
        }

        @media (max-width: 480px) {
          .explore-app-section { padding-left: 0.8rem !important; padding-right: 0.8rem !important; }
          .app-launcher-shell { padding: 0.82rem; border-radius: 26px; }
          .app-launcher-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.52rem; }
          .app-launcher-card { min-height: 112px; padding: 0.72rem 0.22rem 0.62rem; border-radius: 18px; }
          .app-icon-wrap { width: 44px; height: 44px; border-radius: 14px; }
          .app-icon-wrap svg { width: 20px; height: 20px; }
          .app-label { font-size: 0.72rem; min-height: 2.55em; }
          .book-cover-frame { border-radius: 28px; padding: 0.78rem; }
          .book-cover-badge { top: 16px; left: 16px; font-size: 0.68rem; padding: 6px 10px; }
          .featured-book-cover { width: min(78vw, 290px); border-radius: 19px; }
          .cta-row { gap: 4px; }
          .cta-btn {
            font-size: 0.68rem;
            padding: 10px 3px;
            gap: 2px;
          }
          .cta-btn svg { width: 12px; height: 12px; }
        }
        /* Extra small mobile — 320px fix */
        @media (max-width: 360px) {
          .hero-container { padding-top: calc(var(--site-nav-offset, 98px) + 4px); padding-bottom: 50px; }
          .cta-row {
            flex-wrap: wrap;
            gap: 6px;
          }
          .cta-row a {
            flex: 1 1 calc(50% - 3px);
            min-width: 0;
          }
          .cta-btn {
            font-size: 0.6rem;
            padding: 9px 4px;
            gap: 2px;
            justify-content: center;
          }
          .cta-btn svg { width: 10px; height: 10px; }
          .app-launcher-grid { gap: 0.42rem; }
          .app-launcher-card { min-height: 104px; }
          .app-icon-wrap { width: 40px; height: 40px; }
          .app-label { font-size: 0.66rem; }
          .featured-book-actions { grid-template-columns: 1fr; }
          .featured-book-btn { min-height: 50px; }
        }
      `}</style>
    </div>
  );
}
