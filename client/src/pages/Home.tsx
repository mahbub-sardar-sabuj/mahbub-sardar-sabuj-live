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
                  marginBottom: "1.8rem",
                  marginTop: "0.6rem",
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
                      fontSize: "clamp(3.6rem, 12vw, 8.5rem)",
                      fontWeight: 700,
                      lineHeight: 1.1,
                      display: "block",
                      color: "#FAF6EF",
                      letterSpacing: "-0.03em",
                      textShadow: "0 2px 40px rgba(201,168,76,0.22), 0 0 100px rgba(201,168,76,0.1), 0 8px 32px rgba(0,0,0,0.5)",
                    }}
                  >
                    মাহবুব
                  </motion.span>
                </div>

                <div style={{ position: "relative", marginBottom: "2rem" }}>
                  <motion.span
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
                      fontSize: "clamp(3.6rem, 12vw, 8.5rem)",
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
                    }}
                  >
                    সরদার সবুজ
                  </motion.span>
                  {/* Underline glow — wider & softer */}
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: "absolute",
                      bottom: "-12px", left: 0,
                      width: "40%", height: 3,
                      background: "linear-gradient(90deg, #C9A84C, transparent)",
                      transformOrigin: "left",
                      boxShadow: "0 0 15px rgba(201,168,76,0.6)",
                    }}
                  />
                </div>
              </h1>

              {/* Tagline / Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.75 }}
                style={{
                  maxWidth: "540px",
                  marginTop: "2.5rem",
                  paddingLeft: "1.2rem",
                  borderLeft: "2px solid rgba(201,168,76,0.3)",
                }}
              >
                <p style={{
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)",
                  lineHeight: 1.7,
                  color: "rgba(250,246,239,0.85)",
                  fontWeight: 300,
                  letterSpacing: "0.01em",
                }}>
                  বাংলা সাহিত্যের এক নিবেদিত কণ্ঠস্বর — কবিতা, গদ্য ও মানবিক অনুভূতির অনুসন্ধানী লেখক।
                </p>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.95 }}
                style={{ display: "flex", flexWrap: "wrap", gap: "1.2rem", marginTop: "3.2rem" }}
              >
                <Link href="/writings">
                  <button className="btn-premium-gold">
                    <span className="btn-inner">
                      <Feather size={18} />
                      <span>রচনাবলী দেখুন</span>
                    </span>
                  </button>
                </Link>
                <Link href="/about">
                  <button className="btn-premium-outline">
                    <span className="btn-inner">
                      <span>আমার সম্পর্কে</span>
                    </span>
                  </button>
                </Link>
              </motion.div>

            </div>

            {/* Right column — Floating Profile Frame */}
            <div className="hero-right">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, rotateY: 15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "relative",
                  width: "clamp(280px, 35vw, 460px)",
                  aspectRatio: "0.82",
                  perspective: 1000,
                }}
              >
                {/* Floating ornaments */}
                <motion.div
                  animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  style={{ position: "absolute", top: "-5%", right: "-5%", zIndex: 5, color: "#C9A84C", opacity: 0.8 }}
                >
                  <Star size={32} fill="#C9A84C" />
                </motion.div>

                {/* Main frame */}
                <div style={{
                  position: "relative", width: "100%", height: "100%",
                  borderRadius: "24px",
                  padding: "12px",
                  background: "linear-gradient(135deg, rgba(201,168,76,0.3) 0%, rgba(201,168,76,0.05) 50%, rgba(201,168,76,0.2) 100%)",
                  boxShadow: "0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(201,168,76,0.1)",
                  overflow: "hidden",
                }}>
                  {/* Inner border */}
                  <div style={{
                    position: "absolute", inset: "12px",
                    border: "1px solid rgba(201,168,76,0.2)",
                    borderRadius: "16px",
                    zIndex: 1, pointerEvents: "none",
                  }} />

                  {/* Profile Image */}
                  <motion.div
                    style={{
                      width: "100%", height: "100%",
                      borderRadius: "14px",
                      backgroundImage: `url(${PROFILE_1})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "contrast(1.05) brightness(1.02)",
                      x: mousePos.x * 0.4,
                      y: mousePos.y * 0.4,
                    }}
                  />

                  {/* Corner Accents */}
                  <div style={{ position: "absolute", top: 25, left: 25, width: 20, height: 20, borderTop: "2px solid #C9A84C", borderLeft: "2px solid #C9A84C", zIndex: 2 }} />
                  <div style={{ position: "absolute", bottom: 25, right: 25, width: 20, height: 20, borderBottom: "2px solid #C9A84C", borderRight: "2px solid #C9A84C", zIndex: 2 }} />

                  {/* Caption Overlay */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "2.5rem 1.5rem 1.5rem",
                    background: "linear-gradient(to top, rgba(6,14,26,0.95) 0%, rgba(6,14,26,0.6) 50%, transparent 100%)",
                    zIndex: 3, textAlign: "center",
                  }}>
                    <span style={{
                      display: "block",
                      fontFamily: "'AdorshoLipi', sans-serif",
                      fontSize: "0.75rem",
                      color: "#C9A84C",
                      letterSpacing: "0.15em",
                      marginBottom: "0.4rem",
                      opacity: 0.9,
                    }}>(লেখক ও কবি)</span>
                    <span style={{
                      fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
                      fontSize: "1.4rem",
                      color: "#FAF6EF",
                      fontWeight: 500,
                      letterSpacing: "0.02em",
                    }}>মাহবুব সরদার সবুজ</span>
                  </div>
                </div>

                {/* Back decorative glow */}
                <div style={{
                  position: "absolute", inset: "-20px",
                  background: "radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)",
                  zIndex: -1, filter: "blur(30px)",
                }} />
              </motion.div>
            </div>

          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          style={{
            position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem",
            zIndex: 5, pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: "0.65rem", color: "rgba(201,168,76,0.6)", letterSpacing: "0.3em", textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 50, background: "linear-gradient(to bottom, #C9A84C, transparent)" }} />
        </motion.div>
      </section>

      {/* ── Additional sections below ─────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 10, background: "#060E1A", paddingTop: "4rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
          <AdSenseAd slot={AD_SLOTS.HORIZONTAL} style={{ marginBottom: "4rem" }} />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            paddingBottom: "6rem"
          }}>
            {sections.map((item, idx) => (
              <Link key={idx} href={item.href}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(201,168,76,0.15)",
                    borderRadius: "20px",
                    padding: "2rem",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  }}
                >
                  <div style={{
                    width: "60px", height: "60px",
                    borderRadius: "15px",
                    background: "rgba(201,168,76,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                    color: "#C9A84C",
                  }}>
                    <item.icon size={28} />
                  </div>
                  <h3 style={{
                    fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
                    fontSize: "1.5rem",
                    color: "#FAF6EF",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                  }}>{item.label}</h3>
                  <p style={{
                    fontFamily: "'AdorshoLipi', sans-serif",
                    fontSize: "0.9rem",
                    color: "rgba(250,246,239,0.6)",
                    lineHeight: 1.5,
                  }}>{item.subtitle}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Global CSS for custom styles */}
      <style>{`
        @keyframes goldShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseDot {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .btn-premium-gold {
          position: relative;
          padding: 1px;
          border-radius: 12px;
          background: linear-gradient(135deg, #C9A84C, #F5E4A0, #8A5E10);
          border: none;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.3s ease;
        }
        .btn-premium-gold:hover { transform: translateY(-3px); }
        .btn-premium-gold .btn-inner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 28px;
          border-radius: 11px;
          background: #060E1A;
          color: #C9A84C;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .btn-premium-gold:hover .btn-inner { background: transparent; color: #060E1A; }

        .btn-premium-outline {
          padding: 14px 28px;
          border-radius: 12px;
          background: transparent;
          border: 1px solid rgba(201,168,76,0.4);
          color: #FAF6EF;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-premium-outline:hover {
          background: rgba(201,168,76,0.08);
          border-color: #C9A84C;
          transform: translateY(-3px);
        }

        @media (max-width: 992px) {
          .hero-inner { flex-direction: column; text-align: center; padding-top: 6rem !important; }
          .hero-left { margin-bottom: 4rem; display: flex; flexDirection: column; alignItems: center; }
          .hero-left h1 { display: flex; flex-direction: column; align-items: center; }
          .hero-left div { padding-left: 0 !important; border-left: none !important; text-align: center; }
          .hero-left .motion-div { justify-content: center; }
        }
      `}</style>
    </div>
  );
}
