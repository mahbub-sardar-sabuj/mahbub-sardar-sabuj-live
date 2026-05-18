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
          WELCOME BAND — Clean editorial divider
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        position: "relative",
        padding: "3rem 2rem",
        background: "linear-gradient(180deg, #060E1A 0%, #071321 100%)",
        borderTop: "1px solid rgba(201,168,76,0.14)",
        borderBottom: "1px solid rgba(201,168,76,0.1)",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(201,168,76,0.06) 1px, transparent 1px)", backgroundSize: "30px 30px", opacity: 0.45, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          {[
            ["পরিচিতি", "লেখকের জীবনপথ"],
            ["লেখালেখি", "কবিতা ও বই"],
            ["ডিজাইন", "কার্ড ফরম্যাট"],
            ["সংবাদ", "সাম্প্রতিক আপডেট"],
          ].map(([title, desc]) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              style={{
                border: "1px solid rgba(201,168,76,0.16)",
                borderRadius: 18,
                padding: "1.25rem",
                background: "linear-gradient(135deg, rgba(255,255,255,0.045), rgba(201,168,76,0.035))",
                boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ fontFamily: "'Tiro Bangla', serif", fontSize: "1.25rem", color: "#E8C97A", marginBottom: 6 }}>{title}</div>
              <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.82rem", color: "rgba(250,246,239,0.52)" }}>{desc}</div>
            </motion.div>
          ))}
        </div>
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
          FEATURED BOOK — Clean premium spotlight
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "7rem 2rem",
        background: "linear-gradient(180deg, #060E1A 0%, #0A1628 52%, #071321 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(201,168,76,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.035) 1px, transparent 1px)", backgroundSize: "70px 70px", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1120, margin: "0 auto" }}>
          <div className="book-spotlight-grid">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", padding: "1rem", borderRadius: 28, background: "linear-gradient(135deg, rgba(201,168,76,0.1), rgba(255,255,255,0.035))", border: "1px solid rgba(201,168,76,0.18)", boxShadow: "0 40px 110px rgba(0,0,0,0.45)" }}>
                <div style={{ position: "absolute", inset: -25, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.18), transparent 68%)", filter: "blur(20px)", pointerEvents: "none" }} />
                <img src={BOOK_COVER} alt="দুঃখবিলাস - মাহবুব সরদার সবুজের প্রকাশিত বাংলা কবিতা সংগ্রহ বই" style={{ position: "relative", width: "clamp(190px, 26vw, 300px)", borderRadius: 16, boxShadow: "0 28px 70px rgba(0,0,0,0.65)", display: "block" }} loading="lazy" decoding="async" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.12 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "7px 15px", borderRadius: 999, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.22)", marginBottom: "1.5rem" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#C9A84C", boxShadow: "0 0 10px rgba(201,168,76,0.7)" }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.66rem", letterSpacing: "0.23em", textTransform: "uppercase", color: "#C9A84C" }}>Featured Book</span>
              </div>
              <h2 style={{ fontFamily: "'Tiro Bangla', serif", fontSize: "clamp(2rem, 4vw, 3.15rem)", fontWeight: 700, color: "#FAF6EF", lineHeight: 1.25, margin: "0 0 1.25rem" }}>
                আমি বিচ্ছেদকে বলি<br />
                <span style={{ background: "linear-gradient(135deg, #C9A84C, #E8C97A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>দুঃখবিলাস</span>
              </h2>
              <p style={{ fontFamily: "'Tiro Bangla', serif", fontSize: "clamp(1.05rem, 2vw, 1.25rem)", color: "rgba(250,246,239,0.58)", lineHeight: 2, maxWidth: 560, margin: "0 0 1.8rem" }}>
                বিচ্ছেদের বেদনাকে যিনি দুঃখবিলাস বলেন, তাঁর কলমে উঠে আসে মানুষের অন্তরের সবচেয়ে গভীর অনুভূতি। এই বইটি সেই নীরব অনুভূতির এক অনন্য সাহিত্যিক প্রকাশ।
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "2rem" }}>
                {["কাব্যগ্রন্থ", "বিচ্ছেদ", "মানবিক অনুভূতি"].map((tag) => (
                  <span key={tag} style={{ padding: "7px 12px", borderRadius: 999, border: "1px solid rgba(201,168,76,0.18)", background: "rgba(255,255,255,0.035)", color: "rgba(250,246,239,0.56)", fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.78rem" }}>{tag}</span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Link href="/writings" style={{ textDecoration: "none" }}>
                  <motion.span whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 26px", borderRadius: 999, background: "linear-gradient(135deg, #C9A84C, #E8C97A)", color: "#060E1A", fontFamily: "'Tiro Bangla', serif", fontSize: "1.02rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 12px 30px rgba(201,168,76,0.28)" }}>
                    <BookOpen size={16} /> বই পড়ুন
                  </motion.span>
                </Link>
                <a href="https://rkmri.co/TTMEoA3l3pM0/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <motion.span whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 26px", borderRadius: 999, background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.32)", color: "#D8B760", fontFamily: "'Tiro Bangla', serif", fontSize: "1.02rem", fontWeight: 700, cursor: "pointer" }}>
                    <ExternalLink size={16} /> রকমারিতে কিনুন
                  </motion.span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTIONS GRID — Expanded explore tabs
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "7rem 2rem 8rem",
        background: "radial-gradient(circle at 78% 12%, rgba(201,168,76,0.08), transparent 30%), #060E1A",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(201,168,76,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none", opacity: 0.55 }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1160, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} style={{ marginBottom: "3.4rem", display: "flex", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap", alignItems: "end" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "1rem" }}>
                <div style={{ width: 50, height: 1, background: "#C9A84C" }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.68rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A84C" }}>Explore</span>
              </div>
              <h2 style={{ fontFamily: "'Tiro Bangla', serif", fontSize: "clamp(2rem, 4.5vw, 3.2rem)", fontWeight: 700, color: "#FAF6EF", margin: 0, lineHeight: 1.2 }}>অন্বেষণ করুন</h2>
            </div>
            <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", maxWidth: 440, color: "rgba(250,246,239,0.48)", lineHeight: 1.8, margin: 0, fontSize: "0.92rem" }}>
              ওয়েবসাইটের বিদ্যমান সব ট্যাব—পরিচিতি, আবৃত্তি, লেখালেখি, কমিউনিটি, ডিজাইন, গ্যালারি, সংবাদ ও যোগাযোগ—দ্রুত খুঁজে নিন।
            </p>
          </motion.div>
          <div className="sections-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {sections.map((sec, i) => {
              const Icon = sec.icon;
              return (
                <motion.div key={sec.href + sec.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.42, delay: i * 0.035 }}>
                  <Link href={sec.href} style={{ textDecoration: "none", display: "block" }}>
                    <motion.div whileHover={{ y: -6, borderColor: "rgba(201,168,76,0.42)", background: "rgba(201,168,76,0.075)" }} style={{ padding: "1.35rem", background: "linear-gradient(145deg, rgba(255,255,255,0.045), rgba(201,168,76,0.025))", border: "1px solid rgba(201,168,76,0.14)", borderRadius: 20, cursor: "pointer", minHeight: 170, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", boxShadow: "0 22px 60px rgba(0,0,0,0.2)" }}>
                      <span style={{ position: "absolute", top: 14, right: 16, fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.68rem", color: "rgba(201,168,76,0.28)", letterSpacing: "0.16em" }}>{String(i + 1).padStart(2, "0")}</span>
                      <div style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(201,168,76,0.09)", border: "1px solid rgba(201,168,76,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.1rem" }}>
                        <Icon size={19} color="#C9A84C" />
                      </div>
                      <h3 style={{ fontFamily: "'Tiro Bangla', serif", fontSize: "1.18rem", fontWeight: 700, color: "#FAF6EF", margin: "0 0 0.45rem", lineHeight: 1.35 }}>{sec.label}</h3>
                      <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.78rem", color: "rgba(250,246,239,0.42)", margin: "0 0 1rem", lineHeight: 1.55, flex: 1 }}>{sec.subtitle}</p>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(201,168,76,0.7)", fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.78rem", fontWeight: 600 }}>
                        খুলুন <ArrowRight size={14} />
                      </span>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
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
          .hero-container { padding-top: calc(var(--site-nav-offset, 98px) + 10px); padding-bottom: 60px; }
          .sections-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-portrait { height: 320px; }
          .cta-row { gap: 5px; max-width: 100%; }
          .cta-btn {
            font-size: 0.72rem;
            padding: 11px 4px;
            gap: 3px;
          }
          .cta-btn svg { width: 13px; height: 13px; }
        }

        @media (max-width: 480px) {
          .sections-grid { grid-template-columns: 1fr !important; }
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
          .sections-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
