/*
 * Home Page — হোমপেজ
 * Design: "Ink & Gold" — World-Class Literary Premium v2
 * Concept: Cinematic dark luxury author portfolio
 * Palette: Deep Navy #060E1A, Rich Gold #C9A84C, Ivory #FAF6EF, Charcoal #1E2D3D
 */
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BookOpen, Mic2, Images, Newspaper, Mail,
  UserRound, Palette,
  Star, Feather, MailOpen, Phone
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";

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
  { label: "টেম্প ইমেইল", subtitle: "বিনামূল্যে ডিসপোজেবল ইমেইল তৈরি করুন", href: "/temp-email", icon: MailOpen },
  { label: "টেম্প নম্বর", subtitle: "বিনামূল্যে ডিসপোজেবল ফোন নম্বর", href: "/temp-number", icon: Phone },
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

        {/* Multi-layer gradient overlay — richer depth */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg, rgba(4,10,20,0.96) 0%, rgba(6,14,26,0.88) 42%, rgba(6,14,26,0.35) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(4,10,20,1) 0%, rgba(6,14,26,0.6) 30%, transparent 60%)",
        }} />
        {/* Side vignette */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(4,10,20,0.55) 0%, transparent 40%, transparent 60%, rgba(4,10,20,0.35) 100%)",
          pointerEvents: "none",
        }} />

        {/* Animated grain texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4,
          pointerEvents: "none",
        }} />

        {/* Gold radial glow — top right, more intense */}
        <motion.div
          animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.08, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-15%", right: "-8%",
            width: "55vw", height: "55vw",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.16) 0%, rgba(201,168,76,0.06) 40%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {/* Secondary blue-teal glow — bottom left */}
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          style={{
            position: "absolute",
            bottom: "-10%", left: "-5%",
            width: "40vw", height: "40vw",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(60,120,200,0.1) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Horizontal light streak */}
        <div style={{
          position: "absolute",
          top: "38%", left: 0, right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.12) 30%, rgba(201,168,76,0.22) 50%, rgba(201,168,76,0.12) 70%, transparent 100%)",
          pointerEvents: "none",
        }} />

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
                  marginBottom: "0.8rem",
                  marginTop: "0.4rem",
                  padding: "6px 16px 6px 12px",
                  borderRadius: 40,
                  border: "1px solid rgba(201,168,76,0.4)",
                  background: "rgba(201,168,76,0.08)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 0 28px rgba(201,168,76,0.12), inset 0 1px 0 rgba(201,168,76,0.2), 0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {/* Pulsing dot */}
                <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#C9A84C",
                    display: "block",
                    boxShadow: "0 0 8px #C9A84C, 0 0 16px rgba(201,168,76,0.5)",
                    animation: "pulseDot 2s ease-in-out infinite",
                  }} />
                </span>
                <span style={{
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "0.84rem",
                  letterSpacing: "0.22em",
                  color: "#E8C97A",
                  fontWeight: 400,
                }}>লেখক ও কবি</span>
              </motion.div>

              {/* Main name — single H1 for SEO, split visually with spans */}
              <h1 style={{ margin: 0, padding: 0, display: "block", lineHeight: 1 }}>
              <div style={{ position: "relative", marginBottom: "0.2rem" }}>
                <motion.span
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
                    fontSize: "clamp(3.6rem, 9vw, 8.5rem)",
                    fontWeight: 700,
                    lineHeight: 0.95,
                    display: "block",
                    color: "#FAF6EF",
                    letterSpacing: "-0.03em",
                    textShadow: "0 2px 40px rgba(201,168,76,0.22), 0 0 100px rgba(201,168,76,0.1), 0 8px 32px rgba(0,0,0,0.5)",
                  }}
                >
                  মাহবুব
                </motion.span>
              </div>

              <div style={{ position: "relative", marginBottom: "0.6rem" }}>
                <motion.span
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
                    fontSize: "clamp(3.6rem, 9vw, 8.5rem)",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    display: "block",
                    background: "linear-gradient(110deg, #8A5E10 0%, #C9A84C 18%, #F5E4A0 42%, #EDD07A 58%, #C9A84C 78%, #8A5E10 100%)",
                    backgroundSize: "280% 100%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-0.02em",
                    filter: "drop-shadow(0 6px 28px rgba(201,168,76,0.45))",
                    animation: "goldShimmer 6s ease-in-out infinite",
                    paddingBottom: "12px",
                  }}
                >
                  সরদার সবুজ
                </motion.span>
                {/* Underline glow — wider & softer */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 1.4, delay: 0.85, ease: [0.16,1,0.3,1] }}
                  style={{
                    position: "absolute", bottom: -8, left: 0,
                    height: 2,
                    width: "85%",
                    background: "linear-gradient(90deg, #C9A84C 0%, rgba(201,168,76,0.5) 60%, transparent 100%)",
                    transformOrigin: "left",
                    borderRadius: 2,
                    boxShadow: "0 0 20px rgba(201,168,76,0.7), 0 0 40px rgba(201,168,76,0.3)",
                  }}
                />
                            </div>
              </h1>
              {/* Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.65 }}
                style={{ margin: "1.1rem 0 0.7rem", maxWidth: 460 }}
              >
                <p style={{
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "clamp(1rem, 1.9vw, 1.2rem)",
                  color: "rgba(250,246,239,0.68)",
                  lineHeight: 1.75,
                  margin: 0,
                  letterSpacing: "0.02em",
                  borderLeft: "2px solid rgba(201,168,76,0.5)",
                  paddingLeft: 18,
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
                {/* Decorative frame lines — more visible */}
                <div style={{
                  position: "absolute",
                  top: "var(--hero-frame-offset, -22px)", right: "var(--hero-frame-offset, -22px)",
                  width: "62%", height: "62%",
                  border: "1px solid rgba(201,168,76,0.32)",
                  borderRadius: 6,
                  pointerEvents: "none",
                  zIndex: 0,
                }} />
                <div style={{
                  position: "absolute",
                  bottom: "var(--hero-frame-offset, -22px)", left: "var(--hero-frame-offset, -22px)",
                  width: "62%", height: "62%",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: 6,
                  pointerEvents: "none",
                  zIndex: 0,
                }} />
                {/* Corner accent dots */}
                <div style={{
                  position: "absolute", top: "var(--hero-frame-offset, -22px)", right: "var(--hero-frame-offset, -22px)",
                  width: 8, height: 8, borderRadius: "50%",
                  background: "rgba(201,168,76,0.7)",
                  boxShadow: "0 0 10px rgba(201,168,76,0.5)",
                  zIndex: 2, pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute", bottom: "var(--hero-frame-offset, -22px)", left: "var(--hero-frame-offset, -22px)",
                  width: 8, height: 8, borderRadius: "50%",
                  background: "rgba(201,168,76,0.5)",
                  boxShadow: "0 0 10px rgba(201,168,76,0.4)",
                  zIndex: 2, pointerEvents: "none",
                }} />

                {/* Main portrait — suit photo */}
                <div style={{
                  position: "relative",
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 50px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(201,168,76,0.3), 0 0 80px rgba(201,168,76,0.12)",
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
                      filter: "contrast(1.08) saturate(0.95) brightness(1.0)",
                    }}
                    className="hero-portrait"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                  {/* Gradient overlay — richer */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, transparent 45%, rgba(4,10,20,0.85) 100%)",
                  }} />
                  {/* Side glow on portrait */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to right, rgba(201,168,76,0.06) 0%, transparent 30%)",
                    pointerEvents: "none",
                  }} />
                  {/* Name tag at bottom */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "1.4rem 1.6rem",
                    background: "linear-gradient(to top, rgba(4,10,20,0.9) 0%, transparent 100%)",
                  }}>
                    <div style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "0.6rem", letterSpacing: "0.22em",
                      textTransform: "uppercase", color: "#C9A84C", marginBottom: 4,
                    }}>লেখক ও কবি</div>
                    <div style={{
                      fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
                      fontSize: "1.05rem", color: "#FAF6EF", fontWeight: 700,
                      textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                    }}>মাহবুব সরদার সবুজ</div>
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
              width: 1, height: 44,
              background: "linear-gradient(to bottom, rgba(201,168,76,0.7), transparent)",
              boxShadow: "0 0 8px rgba(201,168,76,0.3)",
            }} />
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          APP LAUNCHER — Compact explore tabs
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="explore-app-section" style={{
        padding: "clamp(3.5rem, 7vw, 5.6rem) 1.25rem",
        background: "linear-gradient(180deg, rgba(4,10,20,0.98) 0%, rgba(6,14,26,1) 16%, rgba(6,14,26,1) 100%), radial-gradient(circle at 78% 12%, rgba(201,168,76,0.15), transparent 32%), radial-gradient(circle at 12% 78%, rgba(232,201,122,0.08), transparent 30%), #060E1A",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Dot grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(201,168,76,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none", opacity: 0.5,
        }} />
        {/* Central glow */}
        <div style={{
          position: "absolute", inset: "8% auto auto 50%",
          width: 480, height: 480,
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: "rgba(201,168,76,0.065)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }} />
        {/* Top separator line */}
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.42), rgba(250,246,239,0.22), rgba(201,168,76,0.42), transparent)",
          boxShadow: "0 0 28px rgba(201,168,76,0.16)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1040, margin: "0 auto" }}>
          <motion.div
            className="explore-app-heading"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: "0.95rem" }}>
              <div style={{ width: 48, height: 1, background: "linear-gradient(90deg, transparent, #C9A84C)" }} />
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.66rem", letterSpacing: "0.34em",
                textTransform: "uppercase", color: "#E8C97A",
                textShadow: "0 0 18px rgba(201,168,76,0.32)",
              }}>Explore</span>
              <div style={{ width: 48, height: 1, background: "linear-gradient(90deg, #C9A84C, transparent)" }} />
            </div>
            <h2 style={{
              fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
              fontSize: "clamp(2rem, 5vw, 3.1rem)",
              fontWeight: 700, color: "#FAF6EF",
              margin: 0, lineHeight: 1.18,
              textShadow: "0 4px 24px rgba(0,0,0,0.48), 0 0 34px rgba(201,168,76,0.14)",
            }}>অন্বেষণ করুন</h2>
            <p style={{
              fontFamily: "'Noto Sans Bengali', sans-serif",
              maxWidth: 650, color: "rgba(250,246,239,0.66)",
              lineHeight: 1.72, margin: "1rem auto 0",
              fontSize: "0.98rem",
            }}>
              লেখক, লেখা, বই, আবৃত্তি, গ্যালারি ও সংবাদ—সব গুরুত্বপূর্ণ ঠিকানা এক জায়গায় সাজানো।
            </p>
          </motion.div>

          <motion.div
            className="app-launcher-shell"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, delay: 0.1 }}
          >
            <div className="app-launcher-topbar">
              <span />
              <strong>সব ট্যাব</strong>
              <span />
            </div>
            <div className="app-launcher-grid">
              {sections.map((sec, i) => {
                const Icon = sec.icon;
                return (
                  <motion.div
                    key={sec.href + sec.label}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                  >
                    <Link href={sec.href} className="app-launcher-link" aria-label={`${sec.label} খুলুন`}>
                      <motion.div
                        className="app-launcher-card"
                        whileHover={{ y: -6, scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="app-icon-wrap">
                          <Icon size={23} strokeWidth={1.8} />
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
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem 1.5rem" }}>
        <AdSenseAd adSlot={AD_SLOTS.HOME_BANNER} adFormat="auto" fullWidthResponsive={true} />
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
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 8px #C9A84C, 0 0 16px rgba(201,168,76,0.5); }
          50% { opacity: 0.65; transform: scale(1.6); box-shadow: 0 0 18px rgba(201,168,76,0.9), 0 0 32px rgba(201,168,76,0.4); }
        }

        /* Hero layout */
        .hero-container {
          padding-top: calc(var(--site-nav-offset, 98px) + 28px);
          padding-bottom: 64px;
        }
        .hero-inner {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: clamp(3rem, 6vw, 6rem);
          align-items: center;
        }
        .hero-portrait {
          height: clamp(480px, 55vw, 680px);
          width: 100%;
          object-fit: cover;
          object-position: center top;
        }
        .floating-card {
          min-width: 180px;
        }

        /* App-style Explore launcher */
        .explore-app-heading {
          text-align: center;
          margin-bottom: 2.35rem;
          position: relative;
        }
        .explore-app-heading::after {
          content: "";
          display: block;
          width: min(220px, 48vw);
          height: 1px;
          margin: 1.25rem auto 0;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.55), transparent);
          box-shadow: 0 0 22px rgba(201,168,76,0.18);
        }
          .app-launcher-shell {
          border: 1px solid rgba(201,168,76,0.34);
          border-radius: 42px;
          padding: clamp(1.25rem, 3vw, 2rem);
          background: linear-gradient(145deg, rgba(255,255,255,0.095) 0%, rgba(201,168,76,0.065) 58%, rgba(8,18,32,0.72) 100%);
          box-shadow:
            0 58px 150px rgba(0,0,0,0.52),
            0 0 42px rgba(201,168,76,0.10),
            0 0 0 1px rgba(255,255,255,0.055) inset,
            inset 0 1px 0 rgba(255,255,255,0.12);
          backdrop-filter: blur(22px) saturate(140%);
          max-width: 840px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }
        .app-launcher-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(232,201,122,0.20), transparent 45%);
          pointer-events: none;
        }
        .app-launcher-shell::after {
          content: "";
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.18), transparent);
          pointer-events: none;
        }
        .app-launcher-topbar {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 0 0 1.25rem;
          color: rgba(232,201,122,0.92);
          font-family: 'Noto Sans Bengali', sans-serif;
          font-size: 0.76rem;
          letter-spacing: 0.1em;
        }
        .app-launcher-topbar span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(201,168,76,0.5);
          box-shadow: 0 0 16px rgba(201,168,76,0.5);
        }
          .app-launcher-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: clamp(0.9rem, 2.5vw, 1.3rem);
        }
        .app-launcher-link {
          display: block;
          text-decoration: none;
          height: 100%;
        }
          .app-launcher-card {
          min-height: 158px;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          text-align: center;
          gap: 0.56rem;
          padding: 1.35rem 0.82rem 1.08rem;
          border-radius: 28px;
          border: 1px solid rgba(201,168,76,0.24);
          background: linear-gradient(160deg, rgba(16,30,52,0.96) 0%, rgba(8,18,32,0.86) 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.08),
            0 22px 54px rgba(0,0,0,0.38),
            0 2px 12px rgba(0,0,0,0.25),
            0 0 0 1px rgba(201,168,76,0.035);
          color: #FAF6EF;
          cursor: pointer;
          transition: border-color 0.28s ease, background 0.28s ease, box-shadow 0.28s ease, transform 0.28s ease;
          position: relative;
          overflow: hidden;
        }
        .app-launcher-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(201,168,76,0.12), transparent 55%);
          opacity: 0;
          transition: opacity 0.28s ease;
          pointer-events: none;
        }
        .app-launcher-card:hover {
          border-color: rgba(201,168,76,0.62);
          background: linear-gradient(160deg, rgba(201,168,76,0.13) 0%, rgba(10,22,38,0.88) 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.09),
            0 28px 64px rgba(0,0,0,0.42),
            0 0 34px rgba(201,168,76,0.16),
            0 0 0 1px rgba(201,168,76,0.14) inset;
        }
        .app-launcher-card:hover::before {
          opacity: 1;
        }
        .app-launcher-link:focus-visible {
          outline: none;
        }
        .app-launcher-link:focus-visible .app-launcher-card {
          border-color: rgba(245,228,160,0.82);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 26px 62px rgba(0,0,0,0.42),
            0 0 0 3px rgba(201,168,76,0.22),
            0 0 34px rgba(201,168,76,0.18);
        }
        .app-launcher-card:active {
          border-color: rgba(245,228,160,0.7);
          background: linear-gradient(160deg, rgba(201,168,76,0.16) 0%, rgba(10,22,38,0.9) 100%);
        }
        .app-launcher-grid > div:nth-child(-n+4) .app-launcher-card {
          border-color: rgba(201,168,76,0.32);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.09),
            0 24px 58px rgba(0,0,0,0.40),
            0 0 26px rgba(201,168,76,0.065);
        }
          .app-icon-wrap {
          width: clamp(52px, 7vw, 64px);
          height: clamp(52px, 7vw, 64px);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F2D789;
          background: linear-gradient(145deg, rgba(201,168,76,0.25), rgba(250,246,239,0.07));
          border: 1px solid rgba(201,168,76,0.36);
          box-shadow:
            0 12px 28px rgba(0,0,0,0.28),
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 0 24px rgba(201,168,76,0.14);
          margin-bottom: 0.2rem;
          transition: box-shadow 0.28s ease, transform 0.28s ease;
        }
        .app-launcher-card:hover .app-icon-wrap {
          box-shadow:
            0 14px 32px rgba(0,0,0,0.32),
            inset 0 1px 0 rgba(255,255,255,0.12),
            0 0 28px rgba(201,168,76,0.22);
          transform: scale(1.06);
        }
        .app-label {
          font-family: 'AdorshoLipi', 'Tiro Bangla', serif;
          font-size: clamp(0.86rem, 2.2vw, 1.02rem);
          font-weight: 700;
          line-height: 1.22;
          color: #FFF8EA;
          min-height: 2.45em;
          text-shadow: 0 2px 12px rgba(0,0,0,0.38);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .app-subtitle {
          font-family: 'Noto Sans Bengali', sans-serif;
          font-size: 0.66rem;
          line-height: 1.38;
          color: rgba(250,246,239,0.58);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .hero-inner {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            text-align: center;
          }
          .hero-right {
            display: flex;
            justify-content: center;
          }
          .hero-portrait { height: 280px; }
          .floating-card { display: none; }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .hero-container { padding-top: calc(var(--site-nav-offset, 98px) + 10px); padding-bottom: 36px; }
          .hero-frame-wrap { --hero-frame-offset: -10px; }
          .scroll-indicator { display: none; }
          .hero-inner { gap: 0.95rem; }
          .app-launcher-shell { border-radius: 30px; padding: 1rem; }
          .app-launcher-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.7rem; }
          .app-launcher-card { min-height: 124px; border-radius: 22px; padding: 0.98rem 0.42rem 0.82rem; }
          .app-icon-wrap { border-radius: 16px; width: 50px; height: 50px; }
          .app-label { font-size: 0.82rem; line-height: 1.25; }
          .app-subtitle { display: none; }
          .hero-portrait { height: 260px; }
        }

        @media (max-width: 480px) {
          .explore-app-section { padding-left: 0.8rem !important; padding-right: 0.8rem !important; }
          .app-launcher-shell { padding: 0.85rem; border-radius: 28px; }
          .app-launcher-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.55rem; }
          .app-launcher-card { min-height: 112px; padding: 0.82rem 0.26rem 0.7rem; border-radius: 20px; }
          .app-icon-wrap { width: 48px; height: 48px; border-radius: 15px; }
          .app-icon-wrap svg { width: 21px; height: 21px; }
          .app-label { font-size: 0.78rem; min-height: 2.6em; }
          .hero-portrait { height: 240px; }
        }
        /* Extra small mobile — 320px fix */
        @media (max-width: 360px) {
          .hero-container { padding-top: calc(var(--site-nav-offset, 98px) + 4px); padding-bottom: 50px; }
          .hero-inner { gap: 0.75rem; }
          .app-launcher-grid { gap: 0.44rem; }
          .app-launcher-card { min-height: 108px; padding-left: 0.18rem; padding-right: 0.18rem; }
          .app-icon-wrap { width: 42px; height: 42px; }
          .app-label { font-size: 0.69rem; }
          .hero-portrait { height: 220px; }
        }
      `}</style>
    </div>
  );
}
