/*
 * Design: "Ink & Gold" — World-Class Literary Premium
 * Concept: Cinematic dark luxury author portfolio
 * Palette: Deep Navy #060E1A, Rich Gold #C9A84C, Ivory #FAF6EF, Charcoal #1E2D3D
 * Inspiration: Sarah Vaughan, Anthony Horowitz, luxury editorial magazines
 */
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BookOpen, Mic2, Images, Newspaper, Mail,
  UserRound, Palette,
  Star, Feather
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import AdSenseAd from "@/components/AdSenseAd";

// ── Assets ────────────────────────────────────────────────────────────────────
const PROFILE_1 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/hero-bg-U7hjBDvWeoSXDDh3veCUTN.webp";
const ABOUT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/about-bg-UJ5ebeZYm7Pq6XtFEyFtTv.webp";

// ── Navigation sections ───────────────────────────────────────────────────────
const sections = [
  { label: "পরিচিতি", subtitle: "জীবন, লেখা ও লেখকের পথচলা", href: "/about", icon: UserRound },
  { label: "আবৃত্তি", subtitle: "কণ্ঠে কবিতা, অনুভবে উচ্চারণ", href: "/facebook-recitations", icon: Mic2 },
  { label: "লেখালেখি ও বই", subtitle: "কবিতা, গদ্য ও প্রকাশিত বই", href: "/writings", icon: BookOpen },
  { label: "আমিও লিখবো বাস্তবতা", subtitle: "বাস্তবতা লেখার সৃজনশীল পরিসর", href: "/amio-likhbo-bastobota", icon: Feather },
  { label: "ডিজাইন ফরম্যাট", subtitle: "লেখাকে দিন সুন্দর ভিজ্যুয়াল রূপ", href: "/editor", icon: Palette },
  { label: "গ্যালারি", subtitle: "ছবি, মুহূর্ত ও স্মৃতির অ্যালবাম", href: "/gallery", icon: Images },
  { label: "সরদার সংবাদ", subtitle: "আপডেট, প্রকাশনা ও সাম্প্রতিক খবর", href: "/news", icon: Newspaper },
  { label: "যোগাযোগ", subtitle: "বার্তা, ইমেইল ও সংযোগের পথ", href: "/contact", icon: Mail },
];

// ═════════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

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

              {/* ═══════════════════════════════════════════════════════
                  UNIQUE TYPOGRAPHY — মাহবুব সরদার সবুজ
                  Design: Letter-reveal + Calligraphic SVG + Neon Glow
              ═══════════════════════════════════════════════════════ */}

              {/* ── Line 1: মাহবুব — Ivory with letter-by-letter reveal + ink glow ── */}
              <div style={{ position: "relative", marginBottom: "0.15rem" }}>
                {/* Ambient ink-glow blob behind the name */}
                <div style={{
                  position: "absolute",
                  top: "50%", left: "-8%",
                  transform: "translateY(-50%)",
                  width: "110%", height: "160%",
                  background: "radial-gradient(ellipse 70% 55% at 40% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)",
                  pointerEvents: "none",
                  zIndex: 0,
                }} />

                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1, delay: 0.25 }}
                  style={{
                    fontFamily: "'Tiro Bangla', serif",
                    fontSize: "clamp(3.4rem, 8vw, 7rem)",
                    fontWeight: 700,
                    lineHeight: 1.0,
                    margin: 0,
                    position: "relative",
                    zIndex: 1,
                    letterSpacing: "-0.02em",
                    display: "flex",
                    gap: "0.04em",
                    flexWrap: "nowrap",
                  }}
                >
                  {/* Letter-by-letter animated spans for মাহবুব */}
                  {["মা", "হ", "বু", "ব"].map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 50, rotateX: -90 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{
                        duration: 0.75,
                        delay: 0.3 + i * 0.12,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      style={{
                        display: "inline-block",
                        color: "#FAF6EF",
                        textShadow: "0 0 40px rgba(201,168,76,0.22), 0 2px 20px rgba(201,168,76,0.12), 0 0 2px rgba(250,246,239,0.3)",
                        transformOrigin: "bottom center",
                        animation: `nameLetterFloat${i} ${3.5 + i * 0.4}s ease-in-out infinite`,
                        animationDelay: `${i * 0.25}s`,
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.h1>

                {/* Calligraphic SVG ink-stroke under মাহবুব */}
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.6, delay: 0.9, ease: "easeInOut" }}
                  viewBox="0 0 380 18"
                  style={{
                    position: "absolute",
                    bottom: -8,
                    left: 0,
                    width: "clamp(200px, 55vw, 380px)",
                    height: 18,
                    overflow: "visible",
                    zIndex: 2,
                  }}
                >
                  <motion.path
                    d="M4 12 Q40 4 80 10 Q120 16 160 8 Q200 2 240 10 Q280 16 320 7 Q350 2 376 9"
                    fill="none"
                    stroke="url(#inkGrad1)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.6, delay: 0.9, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M4 14 Q80 18 160 13 Q240 8 376 14"
                    fill="none"
                    stroke="rgba(201,168,76,0.2)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.8, delay: 1.1, ease: "easeInOut" }}
                  />
                  <defs>
                    <linearGradient id="inkGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#F0D98A" stopOpacity="1" />
                      <stop offset="100%" stopColor="rgba(201,168,76,0.3)" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </div>

              {/* ── Line 2: সরদার সবুজ — Layered gold + glitch shadow + neon glow ── */}
              <div style={{ position: "relative", marginBottom: "0.6rem", marginTop: "0.25rem" }}>

                {/* Deep glow layer behind সরদার সবুজ */}
                <div style={{
                  position: "absolute",
                  top: "50%", left: "-5%",
                  transform: "translateY(-50%)",
                  width: "110%", height: "200%",
                  background: "radial-gradient(ellipse 80% 60% at 45% 50%, rgba(201,168,76,0.13) 0%, rgba(201,168,76,0.04) 50%, transparent 70%)",
                  pointerEvents: "none",
                  zIndex: 0,
                  animation: "deepGlowPulse 3s ease-in-out infinite",
                }} />

                {/* Ghost/glitch layer — offset copy */}
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.55 }}
                  aria-hidden="true"
                  style={{
                    fontFamily: "'Tiro Bangla', serif",
                    fontSize: "clamp(3.4rem, 8vw, 7rem)",
                    fontWeight: 700,
                    lineHeight: 1.0,
                    margin: 0,
                    position: "absolute",
                    top: 0, left: 0,
                    zIndex: 1,
                    letterSpacing: "-0.02em",
                    color: "transparent",
                    WebkitTextStroke: "1px rgba(201,168,76,0.18)",
                    transform: "translate(3px, 2px)",
                    animation: "glitchShift 6s ease-in-out infinite",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  সরদার সবুজ
                </motion.h1>

                {/* Main সরদার সবুজ — premium gold with shimmer */}
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
                    position: "relative",
                    zIndex: 2,
                    background: "linear-gradient(110deg, #7A5010 0%, #B8922A 12%, #C9A84C 25%, #F0D98A 40%, #FFE9A0 50%, #F0D98A 60%, #C9A84C 75%, #B8922A 88%, #7A5010 100%)",
                    backgroundSize: "300% 100%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-0.02em",
                    filter: "drop-shadow(0 0 18px rgba(201,168,76,0.55)) drop-shadow(0 4px 28px rgba(201,168,76,0.3))",
                    animation: "goldShimmer 3.5s ease-in-out infinite",
                  }}
                >
                  সরদার সবুজ
                </motion.h1>

                {/* Decorative double underline */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 1.3, delay: 0.85, ease: [0.16,1,0.3,1] }}
                  style={{
                    position: "absolute", bottom: -8, left: 0,
                    width: "80%",
                    transformOrigin: "left",
                    zIndex: 3,
                  }}
                >
                  {/* Primary gold line */}
                  <div style={{
                    height: 2.5,
                    background: "linear-gradient(90deg, #C9A84C 0%, #F0D98A 40%, rgba(201,168,76,0.4) 80%, transparent 100%)",
                    borderRadius: 2,
                    boxShadow: "0 0 14px rgba(201,168,76,0.7), 0 0 28px rgba(201,168,76,0.3)",
                    animation: "lineGlow 2.5s ease-in-out infinite",
                  }} />
                  {/* Secondary dim line */}
                  <div style={{
                    height: 1,
                    marginTop: 3,
                    background: "linear-gradient(90deg, rgba(201,168,76,0.35) 0%, rgba(201,168,76,0.15) 60%, transparent 100%)",
                    borderRadius: 2,
                    width: "65%",
                  }} />
                </motion.div>

                {/* Floating ink particles */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 0.7, 0], scale: [0, 1, 0], y: [0, -30 - i * 8], x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 5)] }}
                    transition={{
                      duration: 2.5 + i * 0.4,
                      delay: 1.2 + i * 0.3,
                      repeat: Infinity,
                      repeatDelay: 1.5 + i * 0.5,
                      ease: "easeOut",
                    }}
                    style={{
                      position: "absolute",
                      bottom: 10,
                      left: `${15 + i * 18}%`,
                      width: 3 + (i % 3),
                      height: 3 + (i % 3),
                      borderRadius: "50%",
                      background: i % 2 === 0 ? "#C9A84C" : "#F0D98A",
                      boxShadow: `0 0 ${6 + i * 2}px rgba(201,168,76,0.8)`,
                      pointerEvents: "none",
                      zIndex: 4,
                    }}
                  />
                ))}
              </div>

              {/* Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.65 }}
                style={{ margin: "0.9rem 0 0.7rem", maxWidth: 440 }}
              >
                <p style={{
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "clamp(1rem, 1.9vw, 1.2rem)",
                  color: "rgba(250,246,239,0.65)",
                  lineHeight: 1.7,
                  margin: 0,
                  letterSpacing: "0.02em",
                  borderLeft: "2px solid rgba(201,168,76,0.4)",
                  paddingLeft: 16,
                }}>
                  বাংলা সাহিত্যের এক নিবেদিত কণ্ঠস্বর — কবিতা, গদ্য ও মানবিক অনুভূতির অনুসন্ধানী লেখক।
                </p>
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
                className="hero-frame-wrap"
                style={{ position: "relative" }}
              >
                {/* Decorative frame lines */}
                <div style={{
                  position: "absolute",
                  top: "var(--hero-frame-offset, -20px)", right: "var(--hero-frame-offset, -20px)",
                  width: "60%", height: "60%",
                  border: "1px solid rgba(201,168,76,0.25)",
                  borderRadius: 4,
                  pointerEvents: "none",
                  zIndex: 0,
                }} />
                <div style={{
                  position: "absolute",
                  bottom: "var(--hero-frame-offset, -20px)", left: "var(--hero-frame-offset, -20px)",
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
          className="scroll-indicator"
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
          APP LAUNCHER — Compact explore tabs
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="explore-app-section" style={{
        padding: "clamp(2.8rem, 6vw, 4.5rem) 1.25rem",
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
            <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", maxWidth: 650, color: "rgba(250,246,239,0.54)", lineHeight: 1.6, margin: "1rem auto 0", fontSize: "0.98rem" }}>
              লেখক, লেখা, বই, আবৃত্তি, গ্যালারি ও সংবাদ—সব গুরুত্বপূর্ণ ঠিকানা এক জায়গায় সাজানো।
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
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 8px #C9A84C; }
          50% { opacity: 0.6; transform: scale(1.5); box-shadow: 0 0 16px rgba(201,168,76,0.8); }
        }

        /* ── Unique Typography Animations ─────────────────────────────── */

        /* Letter float — subtle vertical oscillation per letter */
        @keyframes nameLetterFloat0 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
        @keyframes nameLetterFloat1 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes nameLetterFloat2 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-3px); }
        }
        @keyframes nameLetterFloat3 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }

        /* Deep glow pulse behind সরদার সবুজ */
        @keyframes deepGlowPulse {
          0%, 100% { opacity: 0.7; transform: translateY(-50%) scale(1); }
          50%       { opacity: 1;   transform: translateY(-50%) scale(1.06); }
        }

        /* Glitch shift — ghost layer offset */
        @keyframes glitchShift {
          0%, 90%, 100% { transform: translate(3px, 2px); opacity: 0.12; }
          92%            { transform: translate(-2px, -1px) skewX(-1deg); opacity: 0.22; }
          94%            { transform: translate(4px, 1px) skewX(0.5deg); opacity: 0.08; }
          96%            { transform: translate(-1px, 3px); opacity: 0.18; }
          98%            { transform: translate(2px, -2px) skewX(-0.5deg); opacity: 0.14; }
        }

        /* Underline glow pulse */
        @keyframes lineGlow {
          0%, 100% { box-shadow: 0 0 14px rgba(201,168,76,0.7), 0 0 28px rgba(201,168,76,0.3); }
          50%       { box-shadow: 0 0 22px rgba(201,168,76,1),   0 0 44px rgba(201,168,76,0.5); }
        }

        /* Hero layout */
        .hero-container {
          padding-top: calc(var(--site-nav-offset, 98px) + 20px);
          padding-bottom: 48px;
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

        /* App-style Explore launcher */
        .explore-app-heading {
          text-align: center;
          margin-bottom: 1.6rem;
        }
        .app-launcher-shell {
          border: 1px solid rgba(201,168,76,0.18);
          border-radius: 34px;
          padding: clamp(1.05rem, 3vw, 1.55rem);
          background: linear-gradient(145deg, rgba(255,255,255,0.07), rgba(201,168,76,0.035));
          box-shadow: 0 42px 120px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.09);
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
          min-height: 130px;
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
          color: rgba(250,246,239,0.48);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .hero-inner {
            grid-template-columns: 1fr;
            gap: 1.7rem;
            text-align: center;
          }
          .hero-right {
            display: flex;
            justify-content: center;
          }
          .hero-portrait { height: 400px; }
          .floating-card { display: none; }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .hero-container { padding-top: calc(var(--site-nav-offset, 98px) + 10px); padding-bottom: 36px; }
          .hero-frame-wrap { --hero-frame-offset: -10px; }
          .scroll-indicator { display: none; }
          .hero-inner { gap: 0.95rem; }
          .app-launcher-shell { border-radius: 28px; }
          .app-launcher-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.62rem; }
          .app-launcher-card { min-height: 112px; border-radius: 20px; padding: 0.85rem 0.35rem 0.7rem; }
          .app-icon-wrap { border-radius: 16px; }
          .app-subtitle { display: none; }
          .hero-portrait { height: 320px; }
        }

        @media (max-width: 480px) {
          .explore-app-section { padding-left: 0.8rem !important; padding-right: 0.8rem !important; }
          .app-launcher-shell { padding: 0.82rem; border-radius: 26px; }
          .app-launcher-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.52rem; }
          .app-launcher-card { min-height: 100px; padding: 0.72rem 0.22rem 0.62rem; border-radius: 18px; }
          .app-icon-wrap { width: 44px; height: 44px; border-radius: 14px; }
          .app-icon-wrap svg { width: 20px; height: 20px; }
          .app-label { font-size: 0.72rem; min-height: 2.55em; }
        }
        /* Extra small mobile — 320px fix */
        @media (max-width: 360px) {
          .hero-container { padding-top: calc(var(--site-nav-offset, 98px) + 4px); padding-bottom: 50px; }
          .hero-inner { gap: 0.75rem; }
          .app-launcher-grid { gap: 0.42rem; }
          .app-launcher-card { min-height: 104px; }
          .app-icon-wrap { width: 40px; height: 40px; }
          .app-label { font-size: 0.66rem; }
        }
      `}</style>
    </div>
  );
}
