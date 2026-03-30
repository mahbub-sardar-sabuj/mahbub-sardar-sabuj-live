/*
 * Design: "Ink & Gold" — World-Class Literary Premium
 * Palette: Deep Navy #0A1628, Rich Gold #C9A84C, Warm Ivory #FAF6EF, Charcoal #1E2D3D
 * Accents: Blush #E8C4A0, Sage #8BA888, Muted Rose #C4848A
 * Fonts: Tiro Bangla (display), Noto Sans Bengali (body), Playfair Display (EN headings)
 * Concept: Award-winning literary magazine meets luxury author portfolio
 */
import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Facebook, Instagram, Youtube, Mail, ExternalLink,
  BookOpen, Users, PenLine, Send, ChevronDown, X, Phone,
  Star, Quote, ArrowRight, Eye
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

// ── Assets ────────────────────────────────────────────────────────────────────
const PROFILE_1 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";
const PROFILE_2 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile2_57482935.jpg";
const BOOK_COVER = "/images/book-cover-20260328.jpg";
const BOOKS_COLLECTION = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/books-collection_0b763103.jpg";
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/hero-bg-U7hjBDvWeoSXDDh3veCUTN.webp";
const ABOUT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/about-bg-UJ5ebeZYm7Pq6XtFEyFtTv.webp";
const WRITING_SHOWCASE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/writing1_9f5104e4.png";
const WRITING2 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/writing2_d3a49cae.jpg";
const BOOK_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/book-photo_1173642f.jpg";
const NEWS_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/news-section-bg-B7c2bXDVcAEUipbBK8mz4Z.webp";

// ── Ebook covers ──────────────────────────────────────────────────────────────
const EBOOK_COVERS = [
  { src: "/images/ebooks/dukkhovilash.png", title: "আমি বিচ্ছেদকে বলি দুঃখবিলাস", slug: "dukkhovilash" },
  { src: "/images/ebooks/smritir-boshonte.png", title: "স্মৃতির বসন্তে তুমি", slug: "smritir-boshonte" },
  { src: "/images/ebooks/chand-phool.png", title: "চাঁদফুল", slug: "chand-phool" },
  { src: "/images/ebooks/shomoyer-gohvore.png", title: "সময়ের গহ্বরে", slug: "shomoyer-gohvore" },
];

// ── Gallery images ────────────────────────────────────────────────────────────
const galleryImages = [
  { src: PROFILE_1, caption: "মাহবুব সরদার সবুজ" },
  { src: PROFILE_2, caption: "লেখার মুহূর্তে" },
  { src: BOOK_COVER, caption: "আমি বিচ্ছেদকে বলি দুঃখবিলাস" },
  { src: BOOKS_COLLECTION, caption: "ই-বুক সংগ্রহ" },
  { src: WRITING_SHOWCASE, caption: "কবিতার পাতা" },
  { src: WRITING2, caption: "কবিতার পৃষ্ঠা" },
  { src: BOOK_PHOTO, caption: "দুঃখবিলাস — বইয়ের সাথে" },
];

// ── News ──────────────────────────────────────────────────────────────────────
const newsItems = [
  {
    date: "মার্চ ২০২৬",
    tag: "বই",
    title: "\"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" এখন রকমারিতে",
    desc: "মাহবুব সরদার সবুজের প্রথম ফিজিক্যাল বইটি এখন বাংলাদেশের সকল অনলাইন বুকস্টোরে পাওয়া যাচ্ছে।",
    link: "https://rkmri.co/TTMEoA3l3pM0/",
  },
  {
    date: "২০২৫",
    tag: "লেখালেখি",
    title: "৭,০০০+ লেখা প্রকাশিত",
    desc: "বিভিন্ন সোশ্যাল মিডিয়া প্ল্যাটফর্মে এ পর্যন্ত ৭,০০০-এরও বেশি লেখা প্রকাশিত হয়েছে।",
    link: "https://facebook.com/MahbubSardarSabuj",
  },
  {
    date: "২০২৪",
    tag: "ই-বুক",
    title: "৪টি ই-বুক প্রকাশ",
    desc: "লেখক মাহবুব সরদার সবুজ এ পর্যন্ত ৪টি ই-বুক প্রকাশ করেছেন।",
    link: "/ebooks",
  },
  {
    date: "২০২৩",
    tag: "সোশ্যাল মিডিয়া",
    title: "ইচ্ছে কাব্য পেইজ চালু",
    desc: "পাঠকদের জন্য নতুন ফেসবুক পেইজ \"ইচ্ছে কাব্য\" চালু হয়েছে।",
    link: "https://facebook.com/IchchheKabya",
  },
];

// ── Social platforms ──────────────────────────────────────────────────────────
const socialPlatforms = [
  { name: "Facebook Profile", handle: "Lekhok.MahbubSardarSabuj", href: "https://facebook.com/Lekhok.MahbubSardarSabuj", color: "#1877F2", icon: <Facebook size={20} /> },
  { name: "Facebook Page", handle: "MahbubSardarSabuj", href: "https://facebook.com/MahbubSardarSabuj", color: "#1877F2", icon: <Facebook size={20} /> },
  { name: "ইচ্ছে কাব্য", handle: "IchchheKabya", href: "https://facebook.com/IchchheKabya", color: "#1877F2", icon: <Facebook size={20} /> },
  { name: "Instagram", handle: "@mahbub_sardar_sabuj", href: "https://www.instagram.com/mahbub_sardar_sabuj", color: "#E1306C", icon: <Instagram size={20} /> },
  { name: "YouTube", handle: "@mahbubsardarsabuj", href: "https://youtube.com/@mahbubsardarsabuj", color: "#FF0000", icon: <Youtube size={20} /> },
  { name: "TikTok", handle: "@mahbub_sardar_sabuj", href: "https://www.tiktok.com/@mahbub_sardar_sabuj", color: "#010101", icon: <PenLine size={20} /> },
  { name: "Threads", handle: "@mahbub_sardar_sabuj", href: "https://www.threads.com/@mahbub_sardar_sabuj", color: "#000000", icon: <PenLine size={20} /> },
  { name: "Telegram", handle: "MahbubSardarSabuj", href: "https://t.me/MahbubSardarSabuj", color: "#0088CC", icon: <Send size={20} /> },
];

const fbGroups = [
  { name: "ফেসবুক গ্রুপ ১", href: "https://www.facebook.com/share/g/18MrSrc7JK/?mibextid=wwXIfr" },
  { name: "ফেসবুক গ্রুপ ২", href: "https://www.facebook.com/share/g/186pdvToeC/?mibextid=wwXIfr" },
];

const stats = [
  { value: "৭,০০০+", label: "প্রকাশিত লেখা" },
  { value: "৪টি", label: "ই-বুক" },
  { value: "১টি", label: "ফিজিক্যাল বই" },
  { value: "লক্ষাধিক", label: "পাঠক" },
];

// ── Reusable FadeIn ───────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, direction = "up", className = "" }: {
  children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right" | "none"; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: direction === "up" ? 50 : 0, x: direction === "left" ? -50 : direction === "right" ? 50 : 0 }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function StatCard({ value, label, index }: { value: string; label: string; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        textAlign: "center",
        padding: "2rem 1.5rem",
        background: "rgba(201,168,76,0.08)",
        border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: 16,
        backdropFilter: "blur(10px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
      }} />
      <div style={{
        fontFamily: "'Tiro Bangla', serif",
        fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
        color: "#C9A84C",
        fontWeight: 700,
        lineHeight: 1,
        marginBottom: "0.5rem",
      }}>{value}</div>
      <div style={{
        fontFamily: "'Noto Sans Bengali', sans-serif",
        color: "rgba(250,246,239,0.6)",
        fontSize: "0.85rem",
        letterSpacing: "0.05em",
      }}>{label}</div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const [lightboxImg, setLightboxImg] = useState<{ src: string; caption: string } | null>(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxImg(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "name": "Mahbub Sardar Sabuj",
        "alternateName": "মাহবুব সরদার সবুজ",
        "url": "https://mahbub-sardar-sabuj-live.vercel.app/",
        "image": PROFILE_1,
        "jobTitle": "লেখক",
        "description": "বাংলা সাহিত্যের লেখক ও কবি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট।",
        "sameAs": [
          "https://facebook.com/MahbubSardarSabuj",
          "https://www.instagram.com/mahbub_sardar_sabuj",
          "https://youtube.com/@mahbubsardarsabuj"
        ],
      },
    ]
  };

  return (
    <div style={{ background: "#FAF6EF", minHeight: "100vh", overflowX: "hidden" }}>
      <Seo
        title="মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj | লেখক ও কবি"
        description="মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট। এখানে তার বই, লেখালেখি, কবিতা, গ্যালারি, সংবাদ এবং যোগাযোগের তথ্য পাওয়া যাবে।"
        path="/"
        keywords="মাহবুব সরদার সবুজ, Mahbub Sardar Sabuj, বাংলা লেখক, কবি, বই, লেখালেখি"
        jsonLd={homeJsonLd}
      />
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — Cinematic Full-Screen with Parallax
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="home"
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          background: "#0A1628",
        }}
      >
        {/* Parallax BG */}
        <motion.div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            y: heroY,
            opacity: 0.3,
          }}
        />

        {/* Multi-layer gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 20% 50%, rgba(10,22,40,0.7) 0%, transparent 70%),
            radial-gradient(ellipse 60% 80% at 80% 50%, rgba(10,22,40,0.9) 0%, transparent 60%),
            linear-gradient(180deg, rgba(10,22,40,0.4) 0%, rgba(10,22,40,0.2) 50%, rgba(10,22,40,0.95) 100%)
          `,
        }} />

        {/* Decorative gold lines */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, transparent 0%, #C9A84C 30%, #E8C4A0 50%, #C9A84C 70%, transparent 100%)",
        }} />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              width: i % 2 === 0 ? 4 : 2,
              height: i % 2 === 0 ? 4 : 2,
              borderRadius: "50%",
              background: "#C9A84C",
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 20}%`,
              opacity: 0.4,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          />
        ))}

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto", padding: "0 2rem", width: "100%", paddingTop: 90 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "5rem",
            alignItems: "center",
          }} className="hero-grid">

            {/* ── Left: Text ── */}
            <div>
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}
              >
                <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
                <span style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "#C9A84C",
                  fontSize: "0.8rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}>বাংলা সাহিত্যের লেখক</span>
              </motion.div>

              {/* Main heading */}
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: "'Tiro Bangla', serif",
                  color: "#FAF6EF",
                  fontSize: "clamp(3rem, 6vw, 5rem)",
                  fontWeight: 400,
                  lineHeight: 1.15,
                  marginBottom: "0.5rem",
                  letterSpacing: "-0.01em",
                }}
              >
                মাহবুব সরদার
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: "'Tiro Bangla', serif",
                  color: "#C9A84C",
                  fontSize: "clamp(3rem, 6vw, 5rem)",
                  fontWeight: 400,
                  lineHeight: 1.15,
                  marginBottom: "2rem",
                  letterSpacing: "-0.01em",
                }}
              >
                সবুজ
              </motion.h1>

              {/* Quote */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.5 }}
                style={{
                  borderLeft: "3px solid #C9A84C",
                  paddingLeft: "1.5rem",
                  marginBottom: "2.5rem",
                }}
              >
                <p style={{
                  fontFamily: "'Tiro Bangla', serif",
                  color: "rgba(250,246,239,0.75)",
                  fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
                  lineHeight: 1.8,
                  fontStyle: "italic",
                  margin: 0,
                }}>
                  "লেখালেখি আমার পেশা নয়, এটা আমার ভালোবাসার কেন্দ্রবিন্দু।"
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.65 }}
                style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
              >
                <Link href="/writings">
                  <motion.a
                    whileHover={{ scale: 1.04, boxShadow: "0 20px 50px rgba(201,168,76,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      background: "linear-gradient(135deg, #C9A84C 0%, #E8C4A0 100%)",
                      color: "#0A1628",
                      padding: "14px 32px",
                      borderRadius: 50,
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      textDecoration: "none",
                      cursor: "pointer",
                      boxShadow: "0 10px 30px rgba(201,168,76,0.3)",
                    }}
                  >
                    <PenLine size={18} /> লেখা পড়ুন
                  </motion.a>
                </Link>
                <a
                  href="https://rkmri.co/TTMEoA3l3pM0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <motion.div
                    whileHover={{ scale: 1.04, background: "rgba(201,168,76,0.15)" }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      background: "rgba(250,246,239,0.07)",
                      color: "#FAF6EF",
                      padding: "14px 32px",
                      borderRadius: 50,
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      border: "1px solid rgba(201,168,76,0.4)",
                      cursor: "pointer",
                    }}
                  >
                    <BookOpen size={18} /> বই কিনুন
                  </motion.div>
                </a>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.9 }}
                style={{
                  display: "flex",
                  gap: "2rem",
                  marginTop: "3rem",
                  paddingTop: "2rem",
                  borderTop: "1px solid rgba(201,168,76,0.15)",
                  flexWrap: "wrap",
                }}
              >
                {[
                  { n: "৭,০০০+", l: "লেখা" },
                  { n: "৪টি", l: "ই-বুক" },
                  { n: "লক্ষাধিক", l: "পাঠক" },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: "'Tiro Bangla', serif", color: "#C9A84C", fontSize: "1.4rem", fontWeight: 700 }}>{s.n}</div>
                    <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "rgba(250,246,239,0.5)", fontSize: "0.8rem" }}>{s.l}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── Right: Profile Image ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: 60 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", justifyContent: "center", position: "relative" }}
            >
              {/* Decorative ring */}
              <div style={{
                position: "absolute",
                width: 420,
                height: 420,
                borderRadius: "50%",
                border: "1px solid rgba(201,168,76,0.15)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }} />
              <div style={{
                position: "absolute",
                width: 360,
                height: 360,
                borderRadius: "50%",
                border: "1px solid rgba(201,168,76,0.1)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }} />

              {/* Profile image */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "relative", zIndex: 2 }}
              >
                <div style={{
                  width: 320,
                  height: 400,
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                  overflow: "hidden",
                  border: "3px solid rgba(201,168,76,0.4)",
                  boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 60px rgba(201,168,76,0.1)",
                  position: "relative",
                }}>
                  <img
                    src={PROFILE_1}
                    alt="মাহবুব সরদার সবুজ"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                  />
                  {/* Inner glow */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(180deg, transparent 50%, rgba(10,22,40,0.6) 100%)",
                  }} />
                </div>

                {/* Floating badge */}
                <motion.div
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    bottom: 30,
                    right: -20,
                    background: "linear-gradient(135deg, #C9A84C, #E8C4A0)",
                    borderRadius: 12,
                    padding: "10px 16px",
                    boxShadow: "0 10px 30px rgba(201,168,76,0.4)",
                  }}
                >
                  <div style={{ fontFamily: "'Tiro Bangla', serif", color: "#0A1628", fontSize: "0.75rem", fontWeight: 700 }}>লেখক</div>
                  <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#0A1628", fontSize: "0.65rem", opacity: 0.7 }}>মাহবুব সরদার সবুজ</div>
                </motion.div>
              </motion.div>

              {/* Glow */}
              <div style={{
                position: "absolute",
                bottom: -40,
                left: "50%",
                transform: "translateX(-50%)",
                width: 250,
                height: 60,
                background: "rgba(201,168,76,0.15)",
                filter: "blur(30px)",
                borderRadius: "50%",
              }} />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", zIndex: 2, opacity: heroOpacity }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "rgba(250,246,239,0.4)", fontSize: "0.7rem", letterSpacing: "0.15em" }}>স্ক্রল করুন</span>
            <ChevronDown size={20} color="rgba(201,168,76,0.6)" />
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          MARQUEE — Scrolling text band
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        background: "#C9A84C",
        padding: "14px 0",
        overflow: "hidden",
        position: "relative",
      }}>
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ display: "flex", gap: "4rem", whiteSpace: "nowrap", width: "max-content" }}
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: "4rem", alignItems: "center" }}>
              {["কলমের স্পর্শে আমি বিদ্রোহী, ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি; কেউ কেউ ভালোবেসে ডাকে আমায় কবি।"].map((text, j) => (
                <span key={j} style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "#0A1628",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}>
                  {text}
                  <span style={{ color: "rgba(10,22,40,0.4)", fontSize: "1.2rem" }}>✦</span>
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ABOUT — Split editorial layout
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="about" style={{
        padding: "8rem 0",
        background: "#FAF6EF",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative background text */}
        <div style={{
          position: "absolute",
          top: "50%",
          right: "-5%",
          transform: "translateY(-50%)",
          fontFamily: "'Tiro Bangla', serif",
          fontSize: "20vw",
          color: "rgba(10,22,40,0.03)",
          fontWeight: 700,
          userSelect: "none",
          pointerEvents: "none",
          lineHeight: 1,
        }}>সবুজ</div>

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: "6rem",
            alignItems: "center",
          }} className="about-grid">

            {/* Left: Image collage */}
            <FadeIn direction="left">
              <div style={{ position: "relative", height: 520 }}>
                {/* Main image */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "75%",
                  height: "80%",
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 30px 80px rgba(10,22,40,0.2)",
                }}>
                  <img src={PROFILE_2} alt="মাহবুব সরদার সবুজ" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>

                {/* Secondary image */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "55%",
                  height: "55%",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 20px 50px rgba(10,22,40,0.25)",
                  border: "4px solid #FAF6EF",
                }}>
                  <img src={BOOK_PHOTO} alt="বই" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>

                {/* Gold accent card */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    top: "40%",
                    right: "5%",
                    background: "#0A1628",
                    borderRadius: 14,
                    padding: "16px 20px",
                    boxShadow: "0 20px 50px rgba(10,22,40,0.3)",
                    border: "1px solid rgba(201,168,76,0.3)",
                    zIndex: 3,
                  }}
                >
                  <div style={{ fontFamily: "'Tiro Bangla', serif", color: "#C9A84C", fontSize: "1.8rem", fontWeight: 700, lineHeight: 1 }}>৭,০০০+</div>
                  <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "rgba(250,246,239,0.6)", fontSize: "0.75rem", marginTop: 4 }}>প্রকাশিত লেখা</div>
                </motion.div>

                {/* Decorative dots */}
                <div style={{
                  position: "absolute",
                  bottom: "15%",
                  left: "5%",
                  width: 80,
                  height: 80,
                  backgroundImage: "radial-gradient(circle, #C9A84C 1.5px, transparent 1.5px)",
                  backgroundSize: "12px 12px",
                  opacity: 0.3,
                }} />
              </div>
            </FadeIn>

            {/* Right: Text */}
            <FadeIn direction="right">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                  <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
                  <span style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    color: "#C9A84C",
                    fontSize: "0.8rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}>পরিচিতি</span>
                </div>

                <h2 style={{
                  fontFamily: "'Tiro Bangla', serif",
                  color: "#0A1628",
                  fontSize: "clamp(2rem, 3.5vw, 3rem)",
                  fontWeight: 400,
                  lineHeight: 1.25,
                  marginBottom: "2rem",
                }}>
                  পাঠকের মনের কথা<br />
                  <span style={{ color: "#C9A84C" }}>তুলে ধরার মানুষ</span>
                </h2>

                <div style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "#3A4A5A",
                  fontSize: "1rem",
                  lineHeight: 2.1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.2rem",
                }}>
                  <p>
                    আমার জন্ম <strong style={{ color: "#0A1628" }}>কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়িতে</strong>।
                    পিতা: ফানাউল্লাহ সরদার এবং মাতা: আহামালী বিনতে মাসুরা।
                  </p>
                  <p>
                    লেখালেখি আমার পেশা নয়; এটা আমার <strong style={{ color: "#0A1628" }}>ভালোবাসার কেন্দ্রবিন্দু</strong>।
                    বর্তমানে সৌদি আরবে কর্মরত আছি এবং আমার লেখালেখি চাকরির বাইরে একটি শখ হিসেবে চলমান।
                  </p>
                  <p>
                    সময়ের সঙ্গে সঙ্গে <strong style={{ color: "#0A1628" }}>পাঠকদের ভালোবাসা</strong> আমাকে পরিচয় করিয়ে দিয়েছে
                    তাদের মনের কথাগুলো তুলে ধরার একজন বিশেষ মানুষ হিসেবে।
                  </p>
                </div>

                {/* Info tags */}
                <div style={{ display: "flex", gap: "1rem", marginTop: "2.5rem", flexWrap: "wrap" }}>
                  {[
                    { icon: "📍", label: "জন্মস্থান", value: "আরিফপুর, কুমিল্লা" },
                    { icon: "🌍", label: "বর্তমান", value: "সৌদি আরব" },
                  ].map(item => (
                    <div key={item.label} style={{
                      padding: "12px 20px",
                      background: "#0A1628",
                      borderRadius: 12,
                      borderBottom: "3px solid #C9A84C",
                    }}>
                      <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "rgba(250,246,239,0.5)", fontSize: "0.7rem", marginBottom: 3 }}>{item.icon} {item.label}</div>
                      <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#FAF6EF", fontSize: "0.9rem", fontWeight: 600 }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <Link href="/about">
                  <motion.a
                    whileHover={{ gap: "1rem" }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      marginTop: "2.5rem",
                      color: "#C9A84C",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      borderBottom: "1px solid rgba(201,168,76,0.3)",
                      paddingBottom: 4,
                      cursor: "pointer",
                    }}
                  >
                    বিস্তারিত পড়ুন <ArrowRight size={16} />
                  </motion.a>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STATS — Dark band
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "5rem 0",
        background: "#0A1628",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${NEWS_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.05,
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.5rem",
          }} className="stats-grid">
            {stats.map((s, i) => <StatCard key={i} value={s.value} label={s.label} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          BOOK — Featured publication
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="book" style={{
        padding: "8rem 0",
        background: "linear-gradient(135deg, #1E2D3D 0%, #0A1628 60%, #1A2535 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 500, height: 500, borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.08)",
        }} />
        <div style={{
          position: "absolute", bottom: -150, left: -150,
          width: 600, height: 600, borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.05)",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
          <FadeIn direction="up">
            <div style={{ textAlign: "center", marginBottom: "5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: "1rem" }}>
                <div style={{ width: 60, height: 1, background: "rgba(201,168,76,0.4)" }} />
                <span style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "#C9A84C",
                  fontSize: "0.8rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}>প্রকাশিত বই</span>
                <div style={{ width: 60, height: 1, background: "rgba(201,168,76,0.4)" }} />
              </div>
              <h2 style={{
                fontFamily: "'Tiro Bangla', serif",
                color: "#FAF6EF",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 400,
              }}>আমার বই</h2>
            </div>
          </FadeIn>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr",
            gap: "6rem",
            alignItems: "center",
          }} className="book-grid">

            {/* Book cover with 3D effect */}
            <FadeIn direction="left">
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ position: "relative" }}>
                  {/* Shadow layers for 3D book effect */}
                  <div style={{
                    position: "absolute",
                    top: 10, left: 10,
                    width: 280, height: 380,
                    background: "rgba(201,168,76,0.1)",
                    borderRadius: 8,
                    filter: "blur(20px)",
                  }} />
                  <motion.div
                    animate={{ rotateY: [0, 4, 0, -4, 0], rotateX: [0, 2, 0, -2, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                  >
                    <div style={{ position: "relative" }}>
                      <img
                        src={BOOK_COVER}
                        alt="আমি বিচ্ছেদকে বলি দুঃখবিলাস"
                        style={{
                          width: 280,
                          height: 380,
                          objectFit: "cover",
                          borderRadius: 8,
                          boxShadow: "0 40px 100px rgba(0,0,0,0.6), 15px 15px 40px rgba(201,168,76,0.15)",
                          display: "block",
                        }}
                      />
                      {/* Spine highlight */}
                      <div style={{
                        position: "absolute",
                        top: 0, left: 0,
                        width: 20, height: "100%",
                        background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)",
                        borderRadius: "8px 0 0 8px",
                      }} />
                      {/* Shine */}
                      <div style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0,
                        height: "40%",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.08), transparent)",
                        borderRadius: "8px 8px 0 0",
                      }} />
                    </div>
                  </motion.div>

                  {/* Glow */}
                  <div style={{
                    position: "absolute",
                    bottom: -30,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 220,
                    height: 50,
                    background: "rgba(201,168,76,0.25)",
                    filter: "blur(25px)",
                    borderRadius: "50%",
                  }} />
                </div>
              </div>
            </FadeIn>

            {/* Book info */}
            <FadeIn direction="right">
              <div>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(201,168,76,0.12)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: "#C9A84C",
                  padding: "6px 16px",
                  borderRadius: 50,
                  fontSize: "0.8rem",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  marginBottom: "1.5rem",
                }}>
                  <Star size={12} fill="#C9A84C" /> ফিজিক্যাল বই
                </div>

                <h3 style={{
                  fontFamily: "'Tiro Bangla', serif",
                  color: "#FAF6EF",
                  fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                  fontWeight: 400,
                  lineHeight: 1.3,
                  marginBottom: "1.5rem",
                }}>
                  আমি বিচ্ছেদকে বলি<br />
                  <span style={{ color: "#C9A84C" }}>দুঃখবিলাস</span>
                </h3>

                {/* Quote from book */}
                <div style={{
                  padding: "1.5rem",
                  background: "rgba(201,168,76,0.06)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  borderLeft: "4px solid #C9A84C",
                  borderRadius: "0 12px 12px 0",
                  marginBottom: "2rem",
                }}>
                  <Quote size={20} color="rgba(201,168,76,0.4)" style={{ marginBottom: 8 }} />
                  <p style={{
                    fontFamily: "'Tiro Bangla', serif",
                    color: "rgba(250,246,239,0.8)",
                    fontSize: "1rem",
                    lineHeight: 1.9,
                    fontStyle: "italic",
                    margin: 0,
                  }}>
                    বিচ্ছেদের ব্যথা, হারানোর কষ্ট আর জীবনের গভীর অনুভূতিগুলো এই বইয়ে অনন্যভাবে তুলে ধরা হয়েছে।
                  </p>
                </div>

                {/* Meta */}
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
                  {[
                    { label: "লেখক", value: "মাহবুব সরদার সবুজ" },
                    { label: "ধরন", value: "আবেগী সাহিত্য" },
                    { label: "পাওয়া যাচ্ছে", value: "রকমারি ও অনলাইনে" },
                  ].map(item => (
                    <div key={item.label} style={{
                      padding: "10px 16px",
                      background: "rgba(250,246,239,0.04)",
                      border: "1px solid rgba(201,168,76,0.15)",
                      borderRadius: 10,
                    }}>
                      <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#C9A84C", fontSize: "0.7rem", marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#FAF6EF", fontSize: "0.85rem" }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <a href="https://rkmri.co/TTMEoA3l3pM0/" target="_blank" rel="noopener noreferrer">
                    <motion.div
                      whileHover={{ scale: 1.04, boxShadow: "0 20px 50px rgba(201,168,76,0.4)" }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        background: "linear-gradient(135deg, #C9A84C, #E8C4A0)",
                        color: "#0A1628",
                        padding: "14px 28px",
                        borderRadius: 50,
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        boxShadow: "0 10px 30px rgba(201,168,76,0.3)",
                      }}
                    >
                      <BookOpen size={18} /> রকমারি থেকে কিনুন
                    </motion.div>
                  </a>
                  <Link href="/ebooks">
                    <motion.a
                      whileHover={{ scale: 1.04, background: "rgba(201,168,76,0.12)" }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        background: "rgba(250,246,239,0.06)",
                        color: "#FAF6EF",
                        padding: "14px 28px",
                        borderRadius: 50,
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        border: "1px solid rgba(201,168,76,0.3)",
                        cursor: "pointer",
                        textDecoration: "none",
                      }}
                    >
                      <Eye size={18} /> ই-বুক পড়ুন
                    </motion.a>
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          EBOOKS — Horizontal scroll showcase
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "8rem 0",
        background: "#FAF6EF",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
          <FadeIn direction="up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
                  <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
                  <span style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    color: "#C9A84C",
                    fontSize: "0.8rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}>ই-বুক সংগ্রহ</span>
                </div>
                <h2 style={{
                  fontFamily: "'Tiro Bangla', serif",
                  color: "#0A1628",
                  fontSize: "clamp(2rem, 3.5vw, 3rem)",
                  fontWeight: 400,
                  margin: 0,
                }}>বিনামূল্যে পড়ুন</h2>
              </div>
              <Link href="/ebooks">
                <motion.a
                  whileHover={{ gap: "1rem" }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    color: "#C9A84C",
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(201,168,76,0.3)",
                    paddingBottom: 4,
                    cursor: "pointer",
                  }}
                >
                  সব ই-বুক দেখুন <ArrowRight size={16} />
                </motion.a>
              </Link>
            </div>
          </FadeIn>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "2rem",
          }} className="ebooks-grid">
            {EBOOK_COVERS.map((book, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={`/ebooks/read/${book.slug}`}>
                  <motion.a
                    whileHover={{ y: -10 }}
                    style={{ display: "block", textDecoration: "none", cursor: "pointer" }}
                  >
                    <div style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      boxShadow: "0 20px 50px rgba(10,22,40,0.12)",
                      marginBottom: "1rem",
                      position: "relative",
                      aspectRatio: "3/4",
                    }}>
                      <img
                        src={book.src}
                        alt={book.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      {/* Hover overlay */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        style={{
                          position: "absolute", inset: 0,
                          background: "rgba(10,22,40,0.75)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <Eye size={28} color="#C9A84C" />
                        <span style={{
                          fontFamily: "'Noto Sans Bengali', sans-serif",
                          color: "#FAF6EF",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}>এখনই পড়ুন</span>
                      </motion.div>
                    </div>
                    <h4 style={{
                      fontFamily: "'Tiro Bangla', serif",
                      color: "#0A1628",
                      fontSize: "0.95rem",
                      fontWeight: 400,
                      lineHeight: 1.5,
                      margin: 0,
                    }}>{book.title}</h4>
                    <p style={{
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      color: "#C9A84C",
                      fontSize: "0.8rem",
                      marginTop: 4,
                    }}>মাহবুব সরদার সবুজ</p>
                  </motion.a>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          WRITINGS — Featured section
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "8rem 0",
        background: "#0A1628",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${ABOUT_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.06,
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6rem",
            alignItems: "center",
          }} className="writings-grid">

            <FadeIn direction="left">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                  <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
                  <span style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    color: "#C9A84C",
                    fontSize: "0.8rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}>লেখালেখি</span>
                </div>

                <h2 style={{
                  fontFamily: "'Tiro Bangla', serif",
                  color: "#FAF6EF",
                  fontSize: "clamp(2rem, 3.5vw, 3rem)",
                  fontWeight: 400,
                  lineHeight: 1.3,
                  marginBottom: "1.5rem",
                }}>
                  ৭,০০০+ কবিতা ও<br />
                  <span style={{ color: "#C9A84C" }}>গল্পের ভান্ডার</span>
                </h2>

                <p style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "rgba(250,246,239,0.65)",
                  fontSize: "1rem",
                  lineHeight: 2,
                  marginBottom: "2.5rem",
                }}>
                  প্রেম, বিচ্ছেদ, প্রকৃতি, জীবনদর্শন — প্রতিটি অনুভূতি শব্দে বাঁধা। পাঠকের হৃদয় স্পর্শ করার
                  জন্য লেখা প্রতিটি কবিতা ও গল্প এখানে সংরক্ষিত।
                </p>

                <Link href="/writings">
                  <motion.a
                    whileHover={{ scale: 1.04, boxShadow: "0 20px 50px rgba(201,168,76,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      background: "linear-gradient(135deg, #C9A84C, #E8C4A0)",
                      color: "#0A1628",
                      padding: "14px 32px",
                      borderRadius: 50,
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      boxShadow: "0 10px 30px rgba(201,168,76,0.3)",
                      textDecoration: "none",
                    }}
                  >
                    <PenLine size={18} /> সব লেখা পড়ুন
                  </motion.a>
                </Link>
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <div style={{ position: "relative" }}>
                <div style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
                }}>
                  <img
                    src={WRITING_SHOWCASE}
                    alt="লেখালেখি"
                    style={{ width: "100%", height: 400, objectFit: "cover", display: "block" }}
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(180deg, transparent 40%, rgba(10,22,40,0.8) 100%)",
                  }} />
                </div>

                {/* Floating writing count */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    background: "linear-gradient(135deg, #C9A84C, #E8C4A0)",
                    borderRadius: 16,
                    padding: "20px 24px",
                    boxShadow: "0 20px 50px rgba(201,168,76,0.4)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontFamily: "'Tiro Bangla', serif", color: "#0A1628", fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>৯৩+</div>
                  <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "rgba(10,22,40,0.7)", fontSize: "0.75rem", marginTop: 4 }}>ওয়েবসাইটে লেখা</div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          GALLERY — Masonry-style grid
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="gallery" style={{
        padding: "8rem 0",
        background: "#FAF6EF",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
          <FadeIn direction="up">
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: "1rem" }}>
                <div style={{ width: 60, height: 1, background: "rgba(201,168,76,0.4)" }} />
                <span style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "#C9A84C",
                  fontSize: "0.8rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}>ফটো গ্যালারি</span>
                <div style={{ width: 60, height: 1, background: "rgba(201,168,76,0.4)" }} />
              </div>
              <h2 style={{
                fontFamily: "'Tiro Bangla', serif",
                color: "#0A1628",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 400,
              }}>গ্যালারি</h2>
            </div>
          </FadeIn>

          {/* Gallery grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
          }} className="gallery-grid">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setLightboxImg(img)}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  cursor: "pointer",
                  position: "relative",
                  aspectRatio: "4/3",
                  boxShadow: "0 10px 30px rgba(10,22,40,0.1)",
                  ...(i === galleryImages.length - 1 && galleryImages.length % 3 === 1 ? { gridColumn: "1 / -1", maxWidth: "60%", margin: "0 auto" } : {}),
                }}
              >
                <img
                  src={img.src}
                  alt={img.caption}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  style={{
                    position: "absolute", inset: 0,
                    background: "rgba(10,22,40,0.7)",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "1.5rem",
                  }}
                >
                  <span style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    color: "#FAF6EF",
                    fontSize: "0.9rem",
                  }}>{img.caption}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <FadeIn delay={0.3} direction="up">
            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <motion.button
                  onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
                  whileHover={{ scale: 1.04 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.06))",
                    color: "#FAF6EF",
                    padding: "14px 32px",
                    borderRadius: 50,
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    border: "1px solid rgba(201,168,76,0.3)",
                  }}
                >
                  সব ছবি দেখুন <ArrowRight size={16} />
                </motion.button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          DESIGN STUDIO — Feature showcase section
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "8rem 0",
        background: "linear-gradient(160deg, #060e1a 0%, #0a1628 30%, #0d2040 60%, #0a1628 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative dots pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(201,168,76,0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }} />
        {/* Top glow */}
        <div style={{
          position: "absolute", top: -100, left: "50%",
          transform: "translateX(-50%)",
          width: 800, height: 400, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(201,168,76,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        {/* Bottom glow */}
        <div style={{
          position: "absolute", bottom: -100, right: "10%",
          width: 500, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(100,140,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>

          {/* Section header */}
          <FadeIn direction="up">
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: "1.2rem",
                background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: 50, padding: "6px 20px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#C9A84C", display: "inline-block", boxShadow: "0 0 8px #C9A84C" }} />
                <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#C9A84C",
                  fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>নতুন ফিচার</span>
              </div>
              <h2 style={{ fontFamily: "'Tiro Bangla', serif", color: "#FAF6EF",
                fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 400, marginBottom: "1.2rem",
                textShadow: "0 0 40px rgba(201,168,76,0.2)" }}>
                সরদার ডিজাইন স্টুডিও
              </h2>
              <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "rgba(250,246,239,0.65)",
                fontSize: "1.05rem", maxWidth: 600, margin: "0 auto", lineHeight: 2 }}>
                আপনার পছন্দের কবিতা বা উক্তি দিয়ে সুন্দর ডিজাইন কার্ড তৈরি করুন।
                সোশ্যাল মিডিয়ায় শেয়ার করুন — সম্পূর্ণ বিনামূল্যে।
              </p>
            </div>
          </FadeIn>

          {/* Main content: mockup left, features right */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }} className="hero-grid">

            {/* Left: animated mockup */}
            <FadeIn direction="left">
              <div style={{ position: "relative" }}>
                {/* Glow behind card */}
                <div style={{ position: "absolute", inset: -20, borderRadius: 40,
                  background: "radial-gradient(ellipse, rgba(201,168,76,0.15) 0%, transparent 70%)",
                  filter: "blur(20px)", pointerEvents: "none" }} />

                {/* Main mockup card */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    background: "linear-gradient(145deg, #0d1b2a 0%, #142236 50%, #0d1b2a 100%)",
                    border: "1px solid rgba(201,168,76,0.35)",
                    borderRadius: 28,
                    padding: "2.5rem",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.1), inset 0 1px 0 rgba(201,168,76,0.15)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Top accent line */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: "linear-gradient(90deg, transparent 0%, #C9A84C 40%, #E8C4A0 60%, transparent 100%)" }} />

                  {/* Toolbar mockup */}
                  <div style={{ display: "flex", gap: 6, marginBottom: "1.5rem", opacity: 0.7 }}>
                    {["#ff5f57","#febc2e","#28c840"].map(c => (
                      <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                    ))}
                    <div style={{ flex: 1, height: 10, borderRadius: 5, background: "rgba(201,168,76,0.1)", marginLeft: 8 }} />
                  </div>

                  {/* Poetry card preview */}
                  <div style={{
                    background: "linear-gradient(135deg, #1a2e4a 0%, #0d1b2a 100%)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    borderRadius: 16,
                    padding: "2rem",
                    marginBottom: "1.5rem",
                    position: "relative",
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
                      background: "linear-gradient(90deg, #C9A84C, #E8C4A0, #C9A84C)" }} />
                    <div style={{ fontFamily: "'Tiro Bangla', serif", color: "#C9A84C",
                      fontSize: "1.3rem", lineHeight: 1.9, marginBottom: "1rem" }}>
                      "তুমি চলে গেছ, তবু<br />তোমার স্মৃতি রয়ে গেছে"
                    </div>
                    <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif",
                      color: "rgba(250,246,239,0.45)", fontSize: "0.78rem", letterSpacing: "0.1em" }}>
                      — মাহবুব সরদার সবুজ
                    </div>
                    {/* Theme badge */}
                    <div style={{ position: "absolute", bottom: 10, right: 12,
                      background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)",
                      borderRadius: 8, padding: "3px 10px", color: "#C9A84C",
                      fontSize: "0.68rem", fontFamily: "'Noto Sans Bengali', sans-serif" }}>Navy থিম</div>
                  </div>

                  {/* Tool icons row */}
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    {["✍️","😊","🎨","⚙️","🖼️","🔍","🖊️"].map((icon, i) => (
                      <motion.div key={i}
                        whileHover={{ scale: 1.2, y: -2 }}
                        style={{ width: 36, height: 36, borderRadius: 10,
                          background: i === 0 ? "rgba(201,168,76,0.25)" : "rgba(201,168,76,0.08)",
                          border: i === 0 ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgba(201,168,76,0.15)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "1rem", cursor: "pointer" }}
                      >{icon}</motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Floating badges */}
                <motion.div
                  animate={{ x: [0, 5, 0], y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  style={{ position: "absolute", top: -16, right: -16,
                    background: "linear-gradient(135deg, #C9A84C, #E8C4A0)",
                    color: "#0A1628", borderRadius: 12, padding: "8px 14px",
                    fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.75rem", fontWeight: 700,
                    boxShadow: "0 8px 24px rgba(201,168,76,0.4)" }}
                >
                  ✨ ১২০+ Background
                </motion.div>
                <motion.div
                  animate={{ x: [0, -4, 0], y: [0, 4, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  style={{ position: "absolute", bottom: -12, left: -16,
                    background: "rgba(13,27,42,0.95)", border: "1px solid rgba(201,168,76,0.4)",
                    color: "#C9A84C", borderRadius: 12, padding: "8px 14px",
                    fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.75rem", fontWeight: 600,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
                >
                  🔍 4K আপস্কেল
                </motion.div>
              </div>
            </FadeIn>

            {/* Right: feature list + CTA */}
            <FadeIn direction="right">
              <div>
                {/* Feature grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2.5rem" }}>
                  {[
                    { icon: "🎨", title: "১২০+ ব্যাকগ্রাউন্ড", desc: "Gradient, Cosmic, Nature, Artistic — নানা স্টাইল", color: "#C9A84C" },
                    { icon: "✍️", title: "বাংলা ফন্ট", desc: "১০টি সুন্দর বাংলা ফন্ট — live preview সহ", color: "#8BA888" },
                    { icon: "🔍", title: "4K আপস্কেল", desc: "ঝাপসা ছবি ক্লিয়ার করুন — AI sharpening", color: "#C4848A" },
                    { icon: "🖊️", title: "ড্রইং টুলস", desc: "ক্যানভাসে সরাসরি আঁকুন — ৭টি টুল", color: "#7BA7BC" },
                    { icon: "😊", title: "২১৬ স্টিকার", desc: "৬টি ক্যাটাগরিতে সুন্দর স্টিকার সংগ্রহ", color: "#D4A843" },
                    { icon: "💾", title: "4K ডাউনলোড", desc: "1080×1080 হাই-রেজ PNG/JPG ডাউনলোড", color: "#A8C4A2" },
                  ].map((f, i) => (
                    <FadeIn key={i} delay={i * 0.08} direction="up">
                      <motion.div
                        whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.4)" }}
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(201,168,76,0.12)",
                          borderRadius: 16,
                          padding: "1.2rem",
                          position: "relative",
                          overflow: "hidden",
                          cursor: "default",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2,
                          background: `linear-gradient(90deg, ${f.color}, transparent)` }} />
                        <div style={{ fontSize: "1.6rem", marginBottom: "0.6rem" }}>{f.icon}</div>
                        <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: f.color,
                          fontSize: "0.88rem", fontWeight: 700, marginBottom: "0.3rem" }}>{f.title}</div>
                        <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif",
                          color: "rgba(250,246,239,0.45)", fontSize: "0.75rem", lineHeight: 1.6 }}>{f.desc}</div>
                      </motion.div>
                    </FadeIn>
                  ))}
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: "2rem", marginBottom: "2.5rem",
                  padding: "1.5rem", background: "rgba(201,168,76,0.05)",
                  border: "1px solid rgba(201,168,76,0.12)", borderRadius: 16 }}>
                  {[
                    { num: "১০+", label: "টুলস" },
                    { num: "১২০+", label: "ব্যাকগ্রাউন্ড" },
                    { num: "২১৬", label: "স্টিকার" },
                    { num: "4K", label: "এক্সপোর্ট" },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", color: "#C9A84C",
                        fontSize: "1.5rem", fontWeight: 700, lineHeight: 1 }}>{s.num}</div>
                      <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif",
                        color: "rgba(250,246,239,0.45)", fontSize: "0.72rem", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA buttons */}
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <Link href="/editor">
                    <motion.a
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 50px rgba(201,168,76,0.45)" }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 10,
                        background: "linear-gradient(135deg, #C9A84C 0%, #E8C4A0 100%)",
                        color: "#0A1628", padding: "16px 36px", borderRadius: 50,
                        fontFamily: "'Noto Sans Bengali', sans-serif", fontWeight: 700,
                        fontSize: "1rem", cursor: "pointer",
                        boxShadow: "0 10px 30px rgba(201,168,76,0.3)",
                        textDecoration: "none",
                      }}
                    >
                      ✨ ডিজাইন শুরু করুন
                    </motion.a>
                  </Link>
                  <Link href="/editor">
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "transparent",
                        border: "1px solid rgba(201,168,76,0.4)",
                        color: "#C9A84C", padding: "16px 28px", borderRadius: 50,
                        fontFamily: "'Noto Sans Bengali', sans-serif", fontWeight: 600,
                        fontSize: "0.9rem", cursor: "pointer",
                        textDecoration: "none",
                      }}
                    >
                      🔍 আপস্কেল করুন
                    </motion.a>
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          NEWS — Premium news portal style
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="news" style={{
        padding: "8rem 0",
        background: "#0A1628",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${NEWS_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.07,
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
          <FadeIn direction="up">
            <div style={{ textAlign: "center", marginBottom: "5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: "1rem" }}>
                <div style={{ width: 60, height: 1, background: "rgba(201,168,76,0.4)" }} />
                <span style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "#C9A84C",
                  fontSize: "0.8rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}>সাম্প্রতিক</span>
                <div style={{ width: 60, height: 1, background: "rgba(201,168,76,0.4)" }} />
              </div>
              <h2 style={{
                fontFamily: "'Tiro Bangla', serif",
                color: "#FAF6EF",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 400,
              }}>সংবাদ ও আপডেট</h2>
            </div>
          </FadeIn>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1.5rem",
          }} className="news-grid">
            {newsItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <a href={item.link} target={item.link.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <motion.div
                    whileHover={{ y: -6, boxShadow: "0 30px 70px rgba(0,0,0,0.3)" }}
                    style={{
                      background: "rgba(250,246,239,0.04)",
                      border: "1px solid rgba(201,168,76,0.12)",
                      borderRadius: 20,
                      padding: "2rem",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      height: "100%",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Top accent line */}
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: 2,
                      background: "linear-gradient(90deg, #C9A84C, transparent)",
                    }} />

                    <div style={{ display: "flex", gap: 10, marginBottom: "1.2rem", alignItems: "center" }}>
                      <span style={{
                        background: "rgba(201,168,76,0.15)",
                        color: "#C9A84C",
                        padding: "4px 12px",
                        borderRadius: 50,
                        fontSize: "0.75rem",
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontWeight: 600,
                      }}>{item.tag}</span>
                      <span style={{
                        color: "rgba(250,246,239,0.3)",
                        fontSize: "0.8rem",
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                      }}>{item.date}</span>
                    </div>

                    <h4 style={{
                      fontFamily: "'Tiro Bangla', serif",
                      color: "#FAF6EF",
                      fontSize: "1.1rem",
                      fontWeight: 400,
                      lineHeight: 1.6,
                      marginBottom: "0.8rem",
                    }}>{item.title}</h4>

                    <p style={{
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      color: "rgba(250,246,239,0.5)",
                      fontSize: "0.85rem",
                      lineHeight: 1.8,
                      margin: 0,
                    }}>{item.desc}</p>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: "1.5rem",
                      color: "#C9A84C",
                      fontSize: "0.8rem",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                    }}>
                      বিস্তারিত পড়ুন <ArrowRight size={14} />
                    </div>
                  </motion.div>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SOCIAL MEDIA — Premium card grid
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "8rem 0",
        background: "#FAF6EF",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative BG text */}
        <div style={{
          position: "absolute",
          bottom: "10%",
          left: "-5%",
          fontFamily: "'Tiro Bangla', serif",
          fontSize: "18vw",
          color: "rgba(10,22,40,0.025)",
          fontWeight: 700,
          userSelect: "none",
          pointerEvents: "none",
          lineHeight: 1,
        }}>সোশ্যাল</div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
          <FadeIn direction="up">
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: "1rem" }}>
                <div style={{ width: 60, height: 1, background: "rgba(201,168,76,0.4)" }} />
                <span style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "#C9A84C",
                  fontSize: "0.8rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}>অনুসরণ করুন</span>
                <div style={{ width: 60, height: 1, background: "rgba(201,168,76,0.4)" }} />
              </div>
              <h2 style={{
                fontFamily: "'Tiro Bangla', serif",
                color: "#0A1628",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 400,
                marginBottom: "1rem",
              }}>সোশ্যাল মিডিয়া</h2>
              <p style={{
                fontFamily: "'Noto Sans Bengali', sans-serif",
                color: "#5A6A7A",
                fontSize: "0.95rem",
                maxWidth: 550,
                margin: "0 auto",
                lineHeight: 1.9,
              }}>
                আমার সকল অফিসিয়াল প্ল্যাটফর্মে যুক্ত হোন। এর বাইরে অন্য কোনো পেইজে আমার মালিকানা নেই।
              </p>
            </div>
          </FadeIn>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1rem",
          }}>
            {socialPlatforms.map((s, i) => (
              <FadeIn key={i} delay={i * 0.06} direction="up">
                <motion.a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -6, boxShadow: "0 20px 50px rgba(10,22,40,0.12)" }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1.2rem 1.5rem",
                    background: "#fff",
                    borderRadius: 16,
                    border: "1px solid rgba(10,22,40,0.06)",
                    textDecoration: "none",
                    transition: "all 0.3s",
                    boxShadow: "0 4px 15px rgba(10,22,40,0.06)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 0, left: 0, width: 3, height: "100%",
                    background: s.color,
                    borderRadius: "3px 0 0 3px",
                  }} />
                  <div style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: s.color + "15",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: s.color,
                    flexShrink: 0,
                  }}>
                    {s.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      color: "#0A1628",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      marginBottom: 2,
                    }}>{s.name}</div>
                    <div style={{
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      color: "#8A9AAA",
                      fontSize: "0.78rem",
                    }}>{s.handle}</div>
                  </div>
                  <ExternalLink size={14} color="#C9A84C" />
                </motion.a>
              </FadeIn>
            ))}
          </div>

          {/* Facebook Groups */}
          <FadeIn delay={0.4} direction="up">
            <div style={{ marginTop: "3rem", textAlign: "center" }}>
              <h3 style={{
                fontFamily: "'Tiro Bangla', serif",
                color: "#0A1628",
                fontSize: "1.5rem",
                fontWeight: 400,
                marginBottom: "1.5rem",
              }}>ফেসবুক গ্রুপ</h3>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                {fbGroups.map((g, i) => (
                  <a key={i} href={g.href} target="_blank" rel="noopener noreferrer">
                    <motion.div
                      whileHover={{ scale: 1.04, background: "#C9A84C", color: "#0A1628" }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "12px 28px",
                        background: "#0A1628",
                        color: "#FAF6EF",
                        borderRadius: 50,
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "1px solid rgba(201,168,76,0.2)",
                        transition: "all 0.3s",
                      }}
                    >
                      <Users size={16} /> {g.name}
                    </motion.div>
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CONTACT — Split dark section
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="contact" style={{
        padding: "8rem 0",
        background: "linear-gradient(135deg, #0A1628 0%, #1E2D3D 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative element */}
        <div style={{
          position: "absolute",
          top: "50%",
          right: "10%",
          transform: "translateY(-50%)",
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.08)",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6rem",
            alignItems: "center",
          }} className="contact-grid">

            <FadeIn direction="left">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                  <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
                  <span style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    color: "#C9A84C",
                    fontSize: "0.8rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}>যোগাযোগ</span>
                </div>

                <h2 style={{
                  fontFamily: "'Tiro Bangla', serif",
                  color: "#FAF6EF",
                  fontSize: "clamp(2rem, 3.5vw, 3rem)",
                  fontWeight: 400,
                  lineHeight: 1.3,
                  marginBottom: "1.5rem",
                }}>
                  কথা বলুন<br />
                  <span style={{ color: "#C9A84C" }}>আমার সাথে</span>
                </h2>

                <p style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "rgba(250,246,239,0.65)",
                  fontSize: "1rem",
                  lineHeight: 2,
                  marginBottom: "2.5rem",
                }}>
                  পাঠকদের সাথে কথা বলতে আমি সবসময় আগ্রহী। ইমেইল করুন বা সোশ্যাল মিডিয়ায় মেসেজ পাঠান।
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[
                    { icon: <Mail size={20} />, label: "ইমেইল", value: "lekhokmahbubsardarsabuj@gmail.com", href: "mailto:lekhokmahbubsardarsabuj@gmail.com" },
                    { icon: <Facebook size={20} />, label: "Facebook", value: "Lekhok.MahbubSardarSabuj", href: "https://facebook.com/Lekhok.MahbubSardarSabuj" },
                  ].map((contact, i) => (
                    <motion.a
                      key={i}
                      href={contact.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ x: 6, background: "rgba(201,168,76,0.1)" }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1.2rem 1.5rem",
                        background: "rgba(250,246,239,0.04)",
                        border: "1px solid rgba(201,168,76,0.12)",
                        borderRadius: 14,
                        textDecoration: "none",
                        transition: "all 0.3s",
                      }}
                    >
                      <div style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        background: "rgba(201,168,76,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#C9A84C",
                        flexShrink: 0,
                      }}>
                        {contact.icon}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "rgba(250,246,239,0.5)", fontSize: "0.75rem", marginBottom: 3 }}>{contact.label}</div>
                        <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#FAF6EF", fontSize: "0.9rem" }}>{contact.value}</div>
                      </div>
                      <ArrowRight size={16} color="rgba(201,168,76,0.5)" style={{ marginLeft: "auto" }} />
                    </motion.a>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Right: Contact form */}
            <FadeIn direction="right">
              <div style={{
                background: "rgba(250,246,239,0.04)",
                border: "1px solid rgba(201,168,76,0.15)",
                borderRadius: 24,
                padding: "3rem",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: "linear-gradient(90deg, #C9A84C, #E8C4A0, #C9A84C)",
                }} />

                <h3 style={{
                  fontFamily: "'Tiro Bangla', serif",
                  color: "#FAF6EF",
                  fontSize: "1.5rem",
                  fontWeight: 400,
                  marginBottom: "2rem",
                }}>বার্তা পাঠান</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  {[
                    { label: "আপনার নাম", type: "text", placeholder: "আপনার পুরো নাম" },
                    { label: "ইমেইল", type: "email", placeholder: "আপনার ইমেইল ঠিকানা" },
                  ].map((field, i) => (
                    <div key={i}>
                      <label style={{
                        display: "block",
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        color: "rgba(250,246,239,0.6)",
                        fontSize: "0.8rem",
                        marginBottom: 8,
                      }}>{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "rgba(250,246,239,0.06)",
                          border: "1px solid rgba(201,168,76,0.15)",
                          borderRadius: 10,
                          color: "#FAF6EF",
                          fontFamily: "'Noto Sans Bengali', sans-serif",
                          fontSize: "0.9rem",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{
                      display: "block",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      color: "rgba(250,246,239,0.6)",
                      fontSize: "0.8rem",
                      marginBottom: 8,
                    }}>বার্তা</label>
                    <textarea
                      placeholder="আপনার বার্তা লিখুন..."
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "rgba(250,246,239,0.06)",
                        border: "1px solid rgba(201,168,76,0.15)",
                        borderRadius: 10,
                        color: "#FAF6EF",
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontSize: "0.9rem",
                        outline: "none",
                        resize: "vertical",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <a href="mailto:lekhokmahbubsardarsabuj@gmail.com">
                    <motion.div
                      whileHover={{ scale: 1.02, boxShadow: "0 15px 40px rgba(201,168,76,0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        background: "linear-gradient(135deg, #C9A84C, #E8C4A0)",
                        color: "#0A1628",
                        padding: "14px",
                        borderRadius: 12,
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        boxShadow: "0 8px 25px rgba(201,168,76,0.25)",
                      }}
                    >
                      <Send size={18} /> ইমেইলে পাঠান
                    </motion.div>
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Lightbox ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImg(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 9999,
              background: "rgba(10,22,40,0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              backdropFilter: "blur(10px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              style={{ position: "relative", maxWidth: 800, width: "100%" }}
            >
              <img
                src={lightboxImg.src}
                alt={lightboxImg.caption}
                style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: 16 }}
              />
              <p style={{
                textAlign: "center",
                fontFamily: "'Noto Sans Bengali', sans-serif",
                color: "rgba(250,246,239,0.7)",
                marginTop: "1rem",
                fontSize: "0.9rem",
              }}>{lightboxImg.caption}</p>
              <button
                onClick={() => setLightboxImg(null)}
                style={{
                  position: "absolute",
                  top: -16,
                  right: -16,
                  background: "#C9A84C",
                  border: "none",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#0A1628",
                }}
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      {/* ── Responsive CSS ────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        .hero-grid { grid-template-columns: 1.1fr 0.9fr !important; }
        .about-grid { grid-template-columns: 1fr 1.2fr !important; }
        .book-grid { grid-template-columns: 1fr 1.5fr !important; }
        .writings-grid { grid-template-columns: 1fr 1fr !important; }
        .news-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .contact-grid { grid-template-columns: 1fr 1fr !important; }
        .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
        .ebooks-grid { grid-template-columns: repeat(4, 1fr) !important; }
        .gallery-grid { grid-template-columns: repeat(3, 1fr) !important; }

        input::placeholder, textarea::placeholder {
          color: rgba(250,246,239,0.3);
        }
        input:focus, textarea:focus {
          border-color: rgba(201,168,76,0.4) !important;
          background: rgba(250,246,239,0.08) !important;
        }

        @media (max-width: 1024px) {
          .ebooks-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        @media (max-width: 768px) {
          .hero-grid, .about-grid, .book-grid, .writings-grid, .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
          .news-grid { grid-template-columns: 1fr !important; }
          .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .ebooks-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        @media (max-width: 480px) {
          .gallery-grid { grid-template-columns: 1fr !important; }
          .ebooks-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
