/*
 * Design: Literary Avant-Garde
 * Colors: Navy #0D1B2A, Gold #D4A843, Cream #FDF6EC
 * Fonts: Tiro Bangla (display), Noto Sans Bengali (body), DM Serif Display (EN heading), Space Grotesk (EN body)
 * Layout: Editorial magazine-style, asymmetric, news+gallery feel
 */
import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Facebook, Instagram, Youtube, Mail, ExternalLink,
  BookOpen, Users, PenLine, Send, ChevronDown, X, Phone
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

// ── CDN URLs ──────────────────────────────────────────────────────────────────
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

// ── Fade-in animation hook ────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, direction = "up" }: { children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right" | "none" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 40 : 0,
      x: direction === "left" ? -40 : direction === "right" ? 40 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  };
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Gallery lightbox ──────────────────────────────────────────────────────────
const galleryImages = [
  { src: PROFILE_1, caption: "মাহবুব সরদার সবুজ" },
  { src: PROFILE_2, caption: "লেখার মুহূর্তে" },
  { src: BOOK_COVER, caption: "আমি বিচ্ছেদকে বলি দুঃখবিলাস — বইয়ের কভার" },
  { src: BOOKS_COLLECTION, caption: "ই-বুক সংগ্রহ" },
  { src: WRITING_SHOWCASE, caption: "কবিতার পাতা" },
  { src: WRITING2, caption: "কবিতার পৃষ্ঠা" },
  { src: BOOK_PHOTO, caption: "দুঃখবিলাস — বইয়ের সাথে" },
];

// ── News / Updates ────────────────────────────────────────────────────────────
const newsItems = [
  {
    date: "মার্চ ২০২৬",
    tag: "বই",
    title: "\"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" এখন রকমারিতে",
    desc: "মাহবুব সরদার সবুজের প্রথম ফিজিক্যাল বইটি এখন বাংলাদেশের সকল অনলাইন বুকস্টোরে এবং রকমারিতে পাওয়া যাচ্ছে।",
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
    title: "৮টি ই-বুক প্রকাশ",
    desc: "লেখক মাহবুব সরদার সবুজ এ পর্যন্ত ৮টি ই-বুক প্রকাশ করেছেন। পাঠকদের ভালোবাসায় তিনি লিখে চলেছেন।",
    link: "https://facebook.com/MahbubSardarSabuj",
  },
  {
    date: "২০২৩",
    tag: "সোশ্যাল মিডিয়া",
    title: "ইচ্ছে কাব্য পেইজ চালু",
    desc: "পাঠকদের জন্য নতুন ফেসবুক পেইজ \"ইচ্ছে কাব্য\" চালু হয়েছে। এখানে নিয়মিত কবিতা ও গল্প প্রকাশিত হয়।",
    link: "https://facebook.com/IchchheKabya",
  },
];

// ── Social platforms ──────────────────────────────────────────────────────────
const socialPlatforms = [
  { name: "Facebook Profile", handle: "Lekhok.MahbubSardarSabuj", href: "https://facebook.com/Lekhok.MahbubSardarSabuj", color: "#1877F2", icon: <Facebook size={22} /> },
  { name: "Facebook Page", handle: "MahbubSardarSabuj", href: "https://facebook.com/MahbubSardarSabuj", color: "#1877F2", icon: <Facebook size={22} /> },
  { name: "Facebook Page", handle: "IchchheKabya", href: "https://facebook.com/IchchheKabya", color: "#1877F2", icon: <Facebook size={22} /> },
  { name: "Instagram", handle: "@mahbub_sardar_sabuj", href: "https://www.instagram.com/mahbub_sardar_sabuj", color: "#E1306C", icon: <Instagram size={22} /> },
  { name: "YouTube", handle: "@mahbubsardarsabuj", href: "https://youtube.com/@mahbubsardarsabuj", color: "#FF0000", icon: <Youtube size={22} /> },
  { name: "TikTok", handle: "@mahbub_sardar_sabuj", href: "https://www.tiktok.com/@mahbub_sardar_sabuj", color: "#010101", icon: <PenLine size={22} /> },
  { name: "Threads", handle: "@mahbub_sardar_sabuj", href: "https://www.threads.com/@mahbub_sardar_sabuj", color: "#000000", icon: <PenLine size={22} /> },
  { name: "Pinterest", handle: "Pinterest", href: "https://pin.it/1ZzP7UEcO", color: "#E60023", icon: <BookOpen size={22} /> },
  { name: "Telegram", handle: "MahbubSardarSabuj", href: "https://t.me/MahbubSardarSabuj", color: "#0088CC", icon: <Send size={22} /> },
];

// ── Facebook Groups ───────────────────────────────────────────────────────────
const fbGroups = [
  { name: "ফেসবুক গ্রুপ ১", href: "https://www.facebook.com/share/g/18MrSrc7JK/?mibextid=wwXIfr" },
  { name: "ফেসবুক গ্রুপ ২", href: "https://www.facebook.com/share/g/186pdvToeC/?mibextid=wwXIfr" },
];

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = [
  { value: "৭,০০০+", label: "প্রকাশিত লেখা", icon: <PenLine size={28} /> },
  { value: "৮টি", label: "ই-বুক", icon: <BookOpen size={28} /> },
  { value: "১টি", label: "ফিজিক্যাল বই", icon: <BookOpen size={28} /> },
  { value: "লক্ষাধিক", label: "পাঠক", icon: <Users size={28} /> },
];

// ═══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const [lightboxImg, setLightboxImg] = useState<{ src: string; caption: string } | null>(null);

  // Close lightbox on Escape
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
        "description": "বাংলা সাহিত্যের লেখক, কবি এবং আবৃত্তিশিল্পী মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট।",
        "sameAs": [
          "https://facebook.com/MahbubSardarSabuj",
          "https://www.instagram.com/mahbub_sardar_sabuj",
          "https://youtube.com/@mahbubsardarsabuj"
        ],
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Cumilla",
          "addressCountry": "BD"
        }
      },
      {
        "@type": "WebSite",
        "name": "মাহবুব সরদার সবুজ - Mahbub Sardar Sabuj",
        "url": "https://mahbub-sardar-sabuj-live.vercel.app/",
        "inLanguage": "bn-BD",
        "publisher": {
          "@type": "Person",
          "name": "Mahbub Sardar Sabuj"
        }
      }
    ]
  };

  return (
    <div style={{ background: "#FDF6EC", minHeight: "100vh", overflowX: "hidden" }}>
      <Seo
        title="মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj | লেখক, কবি ও আবৃত্তি"
        description="মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট। এখানে তার বই, লেখালেখি, কবিতা, আবৃত্তি, গ্যালারি, সংবাদ এবং যোগাযোগের তথ্য পাওয়া যাবে।"
        path="/"
        keywords="মাহবুব সরদার সবুজ, Mahbub Sardar Sabuj, বাংলা লেখক, কবি, আবৃত্তি, বই, লেখালেখি"
        jsonLd={homeJsonLd}
      />
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section id="home" style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "#0D1B2A",
      }}>
        {/* Hero BG */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35,
        }} />
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(13,27,42,0.95) 0%, rgba(13,27,42,0.6) 60%, rgba(13,27,42,0.85) 100%)",
        }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", width: "100%", paddingTop: 80 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }} className="hero-grid">
            {/* Left: Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span style={{
                  display: "inline-block",
                  background: "rgba(212,168,67,0.15)",
                  border: "1px solid rgba(212,168,67,0.4)",
                  color: "#D4A843",
                  padding: "6px 18px",
                  borderRadius: 100,
                  fontSize: "0.8rem",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  letterSpacing: "0.1em",
                  marginBottom: "1.5rem",
                }}>
                  বাংলা সাহিত্যের লেখক
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.4 }}
                style={{
                  fontFamily: "'Tiro Bangla', serif",
                  color: "#FDF6EC",
                  fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                  lineHeight: 1.15,
                  marginBottom: "0.5rem",
                  fontWeight: 400,
                }}
              >
                মাহবুব সরদার সবুজ
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.55 }}
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  color: "#D4A843",
                  fontSize: "clamp(1rem, 2vw, 1.4rem)",
                  marginBottom: "1.5rem",
                  fontStyle: "italic",
                }}
              >
                Mahbub Sardar Sabuj
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "rgba(253,246,236,0.75)",
                  fontSize: "1rem",
                  lineHeight: 1.9,
                  maxWidth: 480,
                  marginBottom: "2rem",
                }}
              >
                আমি লিখি পাঠকের হৃদয়ের কথা। বিচ্ছেদ, ভালোবাসা, আর জীবনের গল্প — সব কিছুই আমার কলমের বিষয়।
                কুমিল্লার আরিফপুর থেকে সৌদি আরব — লেখা আমার সঙ্গী সবখানে।
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.85 }}
                style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
              >
                <a
                  href="https://rkmri.co/TTMEoA3l3pM0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#D4A843",
                    color: "#0D1B2A",
                    padding: "12px 28px",
                    borderRadius: 6,
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#e8b94a"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#D4A843"; e.currentTarget.style.transform = "none"; }}
                >
                  <BookOpen size={18} /> বই সংগ্রহ করুন
                </a>
                <a
                  href="#about"
                  onClick={e => { e.preventDefault(); document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" }); }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "transparent",
                    color: "#FDF6EC",
                    padding: "12px 28px",
                    borderRadius: 6,
                    border: "1px solid rgba(253,246,236,0.3)",
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#D4A843"; e.currentTarget.style.color = "#D4A843"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(253,246,236,0.3)"; e.currentTarget.style.color = "#FDF6EC"; }}
                >
                  পরিচিতি জানুন
                </a>
              </motion.div>
            </div>

            {/* Right: Profile Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              style={{ display: "flex", justifyContent: "center" }}
              className="hero-photo"
            >
              <div style={{ position: "relative" }}>
                {/* Gold border frame */}
                <div style={{
                  position: "absolute",
                  top: -16, left: -16,
                  right: 16, bottom: 16,
                  border: "2px solid rgba(212,168,67,0.4)",
                  borderRadius: 12,
                  zIndex: 0,
                }} />
                <img
                  src={PROFILE_1}
                  alt="মাহবুব সরদার সবুজ"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    maxWidth: 380,
                    height: 460,
                    objectFit: "cover",
                    borderRadius: 10,
                    boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
                  }}
                />
                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    bottom: -20,
                    right: -20,
                    zIndex: 2,
                    background: "#D4A843",
                    color: "#0D1B2A",
                    padding: "12px 20px",
                    borderRadius: 10,
                    boxShadow: "0 10px 30px rgba(212,168,67,0.4)",
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    textAlign: "center",
                    lineHeight: 1.4,
                  }}
                >
                  <div style={{ fontSize: "1.3rem" }}>📚</div>
                  <div>৭,০০০+ লেখা</div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: "absolute",
              bottom: 40,
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(253,246,236,0.4)",
              cursor: "pointer",
            }}
            onClick={() => document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" })}
          >
            <ChevronDown size={32} />
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────────── */}
      <section style={{
        background: "#0D1B2A",
        borderTop: "1px solid rgba(212,168,67,0.2)",
        borderBottom: "1px solid rgba(212,168,67,0.2)",
        padding: "2rem 0",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
          }} className="stats-grid">
            {stats.map((s, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div style={{
                  textAlign: "center",
                  padding: "1.5rem 1rem",
                  borderRight: i < stats.length - 1 ? "1px solid rgba(212,168,67,0.15)" : "none",
                }}>
                  <div style={{ color: "#D4A843", marginBottom: 8 }}>{s.icon}</div>
                  <div style={{
                    fontFamily: "'Tiro Bangla', serif",
                    color: "#D4A843",
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    lineHeight: 1,
                    marginBottom: 6,
                  }}>{s.value}</div>
                  <div style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    color: "rgba(253,246,236,0.6)",
                    fontSize: "0.85rem",
                  }}>{s.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────────── */}
      <section id="about" style={{ padding: "6rem 0", background: "#FDF6EC" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5rem",
            alignItems: "center",
          }} className="about-grid">
            {/* Left: Image */}
            <FadeIn direction="left">
              <div style={{ position: "relative" }}>
                <img
                  src={PROFILE_2}
                  alt="মাহবুব সরদার সবুজ — লেখার মুহূর্তে"
                  style={{
                    width: "100%",
                    height: 500,
                    objectFit: "cover",
                    objectPosition: "top",
                    borderRadius: 12,
                    boxShadow: "0 20px 60px rgba(13,27,42,0.15)",
                  }}
                />
                {/* Decorative gold line */}
                <div style={{
                  position: "absolute",
                  top: 24, left: -24,
                  width: 4, height: "60%",
                  background: "linear-gradient(to bottom, #D4A843, transparent)",
                  borderRadius: 2,
                }} />
              </div>
            </FadeIn>

            {/* Right: Text */}
            <FadeIn direction="right">
              <div>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: "#D4A843",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "1rem",
                }}>ABOUT ME</span>

                <h2 style={{
                  fontFamily: "'Tiro Bangla', serif",
                  color: "#0D1B2A",
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  lineHeight: 1.3,
                  marginBottom: "1.5rem",
                  fontWeight: 400,
                }}>
                  পরিচিতি
                </h2>

                <div style={{
                  width: 60, height: 3,
                  background: "#D4A843",
                  marginBottom: "1.5rem",
                  borderRadius: 2,
                }} />

                <div style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "#2A3A4A",
                  fontSize: "1rem",
                  lineHeight: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}>
                  <p>
                    আমার জন্ম <strong>কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়িতে</strong>।
                    পিতা: ফানাউল্লাহ সরদার এবং মাতা: আহামালী বিনতে মাসুরা।
                  </p>
                  <p>
                    লেখালেখি আমার পেশা নয়; এটা আমার <strong>ভালোবাসার কেন্দ্রবিন্দু</strong>।
                    বর্তমানে সৌদি আরবে কর্মরত আছি এবং আমার লেখালেখি সেখানকার চাকরির বাইরে একটি শখ হিসেবে চলমান।
                  </p>
                  <p>
                    লেখালেখির জগতে আমার প্রবেশ ছিল মূলত টাইমপাস করার জন্য। তবে সময়ের সঙ্গে সঙ্গে <strong>পাঠকদের ভালোবাসা</strong> আমাকে
                    পরিচয় করিয়ে দিয়েছে তাদের মনের কথাগুলো তুলে ধরার একজন বিশেষ মানুষ হিসেবে।
                  </p>
                  <p>
                    এখন আর আমি শুধুমাত্র টাইমপাসের জন্য লিখি না, বরং <strong>পাঠকের জন্য লিখি</strong>।
                  </p>
                </div>

                <div style={{ display: "flex", gap: "1.5rem", marginTop: "2rem", flexWrap: "wrap" }}>
                  {[
                    { label: "জন্মস্থান", value: "আরিফপুর, কুমিল্লা" },
                    { label: "বর্তমান", value: "সৌদি আরব" },
                  ].map(item => (
                    <div key={item.label} style={{
                      padding: "12px 20px",
                      background: "#0D1B2A",
                      borderRadius: 8,
                      borderLeft: "3px solid #D4A843",
                    }}>
                      <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#D4A843", fontSize: "0.75rem", marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#FDF6EC", fontSize: "0.9rem", fontWeight: 600 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── BOOK SECTION ─────────────────────────────────────────────────────── */}
      <section id="book" style={{
        padding: "6rem 0",
        background: "#0D1B2A",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* BG texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${NEWS_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.08,
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
          <FadeIn direction="up">
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "#D4A843",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "1rem",
              }}>MY BOOKS</span>
              <h2 style={{
                fontFamily: "'Tiro Bangla', serif",
                color: "#FDF6EC",
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 400,
                marginBottom: "1rem",
              }}>প্রকাশিত বই</h2>
              <div style={{ width: 60, height: 3, background: "#D4A843", margin: "0 auto", borderRadius: 2 }} />
            </div>
          </FadeIn>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: "5rem",
            alignItems: "center",
          }} className="book-grid">
            {/* Book Cover */}
            <FadeIn direction="left">
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ position: "relative" }}>
                  <motion.div
                    animate={{ rotateY: [0, 3, 0, -3, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <img
                      src={BOOK_COVER}
                      alt="আমি বিচ্ছেদকে বলি দুঃখবিলাস"
                      style={{
                        width: 280,
                        height: 380,
                        objectFit: "cover",
                        borderRadius: 8,
                        boxShadow: "0 30px 80px rgba(0,0,0,0.6), 10px 10px 30px rgba(212,168,67,0.2)",
                      }}
                    />
                  </motion.div>
                  {/* Glow effect */}
                  <div style={{
                    position: "absolute",
                    bottom: -30,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 200,
                    height: 40,
                    background: "rgba(212,168,67,0.2)",
                    filter: "blur(20px)",
                    borderRadius: "50%",
                  }} />
                </div>
              </div>
            </FadeIn>

            {/* Book Info */}
            <FadeIn direction="right">
              <div>
                <div style={{
                  display: "inline-block",
                  background: "rgba(212,168,67,0.15)",
                  border: "1px solid rgba(212,168,67,0.3)",
                  color: "#D4A843",
                  padding: "5px 14px",
                  borderRadius: 100,
                  fontSize: "0.8rem",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  marginBottom: "1.2rem",
                }}>ফিজিক্যাল বই</div>

                <h3 style={{
                  fontFamily: "'Tiro Bangla', serif",
                  color: "#FDF6EC",
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                  fontWeight: 400,
                  lineHeight: 1.4,
                  marginBottom: "1.5rem",
                }}>
                  আমি বিচ্ছেদকে বলি দুঃখবিলাস
                </h3>

                <p style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "rgba(253,246,236,0.7)",
                  fontSize: "0.95rem",
                  lineHeight: 1.9,
                  marginBottom: "2rem",
                }}>
                  মাহবুব সরদার সবুজের প্রথম ও একমাত্র ফিজিক্যাল বই। বিচ্ছেদের ব্যথা, হারানোর কষ্ট আর
                  জীবনের অনুভূতিগুলো এই বইয়ে অনন্যভাবে তুলে ধরা হয়েছে। বাংলাদেশের যেকোনো অনলাইন
                  বুকস্টোরে এবং রকমারিতে পাওয়া যাচ্ছে।
                </p>

                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                  {[
                    { label: "লেখক", value: "মাহবুব সরদার সবুজ" },
                    { label: "ধরন", value: "আবেগী সাহিত্য" },
                    { label: "পাওয়া যাচ্ছে", value: "রকমারি ও অনলাইনে" },
                  ].map(item => (
                    <div key={item.label} style={{
                      padding: "10px 16px",
                      background: "rgba(253,246,236,0.05)",
                      border: "1px solid rgba(212,168,67,0.2)",
                      borderRadius: 8,
                    }}>
                      <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#D4A843", fontSize: "0.7rem", marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: "#FDF6EC", fontSize: "0.85rem" }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <a
                  href="https://rkmri.co/TTMEoA3l3pM0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#D4A843",
                    color: "#0D1B2A",
                    padding: "14px 32px",
                    borderRadius: 8,
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    textDecoration: "none",
                    transition: "all 0.3s",
                    boxShadow: "0 8px 25px rgba(212,168,67,0.3)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#e8b94a"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 35px rgba(212,168,67,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#D4A843"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(212,168,67,0.3)"; }}
                >
                  <BookOpen size={20} /> রকমারি থেকে অর্ডার করুন
                </a>

                {/* E-books link */}
                <div style={{
                  marginTop: "2rem",
                  padding: "16px 20px",
                  background: "rgba(212,168,67,0.08)",
                  border: "1px solid rgba(212,168,67,0.2)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                }}>
                  <p style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    color: "rgba(253,246,236,0.65)",
                    fontSize: "0.875rem",
                    lineHeight: 1.7,
                    margin: 0,
                  }}>
                    📖 এছাড়াও <strong style={{ color: "#D4A843" }}>৪টি ই-বুক</strong> প্রকাশিত হয়েছে।
                  </p>
                  <a
                    href="/ebooks"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(212,168,67,0.2)",
                      color: "#D4A843",
                      padding: "8px 16px",
                      borderRadius: 6,
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      textDecoration: "none",
                      border: "1px solid rgba(212,168,67,0.35)",
                      transition: "all 0.3s",
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#D4A843"; e.currentTarget.style.color = "#0D1B2A"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(212,168,67,0.2)"; e.currentTarget.style.color = "#D4A843"; }}
                  >
                    ই-বুক দেখুন →
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── GALLERY ──────────────────────────────────────────────────────────── */}
      <section id="gallery" style={{ padding: "6rem 0", background: "#FDF6EC" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
          <FadeIn direction="up">
            <div style={{ marginBottom: "3rem" }}>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "#D4A843",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "0.75rem",
              }}>GALLERY</span>
              <h2 style={{
                fontFamily: "'Tiro Bangla', serif",
                color: "#0D1B2A",
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 400,
                marginBottom: "0.5rem",
              }}>গ্যালারি</h2>
              <div style={{ width: 60, height: 3, background: "#D4A843", borderRadius: 2 }} />
            </div>
          </FadeIn>

          {/* Masonry-style grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
          }} className="gallery-grid">
            {galleryImages.map((img, i) => (
              <FadeIn key={i} delay={i * 0.08} direction="up">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setLightboxImg(img)}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 10,
                    cursor: "pointer",
                    aspectRatio: i === 0 || i === 3 ? "4/5" : "4/3",
                    boxShadow: "0 4px 20px rgba(13,27,42,0.1)",
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.caption}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  />
                  {/* Hover overlay */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(13,27,42,0.8) 0%, transparent 60%)",
                    opacity: 0,
                    transition: "opacity 0.3s",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "1rem",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
                  >
                    <span style={{
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      color: "#FDF6EC",
                      fontSize: "0.85rem",
                    }}>{img.caption}</span>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWS / UPDATES ───────────────────────────────────────────────────── */}
      <section id="news" style={{
        padding: "6rem 0",
        background: "#0D1B2A",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${NEWS_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.12,
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
          <FadeIn direction="up">
            <div style={{ marginBottom: "3rem" }}>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "#D4A843",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "0.75rem",
              }}>NEWS & UPDATES</span>
              <h2 style={{
                fontFamily: "'Tiro Bangla', serif",
                color: "#FDF6EC",
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 400,
                marginBottom: "0.5rem",
              }}>সংবাদ ও আপডেট</h2>
              <div style={{ width: 60, height: 3, background: "#D4A843", borderRadius: 2 }} />
            </div>
          </FadeIn>

          {/* Featured news + sidebar */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: "2rem",
          }} className="news-grid">
            {/* Featured */}
            <FadeIn direction="left">
              <a
                href={newsItems[0].link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", display: "block" }}
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  style={{
                    background: "rgba(253,246,236,0.04)",
                    border: "1px solid rgba(212,168,67,0.2)",
                    borderRadius: 12,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "border-color 0.3s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(212,168,67,0.5)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(212,168,67,0.2)")}
                >
                  <img
                    src={BOOKS_COLLECTION}
                    alt="বই সংগ্রহ"
                    style={{ width: "100%", height: 260, objectFit: "cover" }}
                  />
                  <div style={{ padding: "1.5rem" }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: "1rem", alignItems: "center" }}>
                      <span style={{
                        background: "#D4A843",
                        color: "#0D1B2A",
                        padding: "3px 12px",
                        borderRadius: 100,
                        fontSize: "0.75rem",
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontWeight: 700,
                      }}>{newsItems[0].tag}</span>
                      <span style={{
                        color: "rgba(253,246,236,0.4)",
                        fontSize: "0.8rem",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}>{newsItems[0].date}</span>
                    </div>
                    <h3 style={{
                      fontFamily: "'Tiro Bangla', serif",
                      color: "#FDF6EC",
                      fontSize: "1.3rem",
                      fontWeight: 400,
                      lineHeight: 1.5,
                      marginBottom: "0.75rem",
                    }}>{newsItems[0].title}</h3>
                    <p style={{
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      color: "rgba(253,246,236,0.6)",
                      fontSize: "0.9rem",
                      lineHeight: 1.8,
                    }}>{newsItems[0].desc}</p>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#D4A843",
                      fontSize: "0.85rem",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      marginTop: "1rem",
                    }}>
                      বিস্তারিত পড়ুন <ExternalLink size={14} />
                    </div>
                  </div>
                </motion.div>
              </a>
            </FadeIn>

            {/* Sidebar news */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {newsItems.slice(1).map((item, i) => (
                <FadeIn key={i} delay={i * 0.1} direction="right">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      style={{
                        background: "rgba(253,246,236,0.04)",
                        border: "1px solid rgba(212,168,67,0.15)",
                        borderLeft: "3px solid #D4A843",
                        borderRadius: "0 8px 8px 0",
                        padding: "1.2rem",
                        cursor: "pointer",
                        transition: "background 0.3s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(253,246,236,0.07)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(253,246,236,0.04)")}
                    >
                      <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                        <span style={{
                          background: "rgba(212,168,67,0.15)",
                          color: "#D4A843",
                          padding: "2px 10px",
                          borderRadius: 100,
                          fontSize: "0.7rem",
                          fontFamily: "'Noto Sans Bengali', sans-serif",
                        }}>{item.tag}</span>
                        <span style={{
                          color: "rgba(253,246,236,0.35)",
                          fontSize: "0.75rem",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}>{item.date}</span>
                      </div>
                      <h4 style={{
                        fontFamily: "'Tiro Bangla', serif",
                        color: "#FDF6EC",
                        fontSize: "1rem",
                        fontWeight: 400,
                        lineHeight: 1.5,
                        marginBottom: "0.5rem",
                      }}>{item.title}</h4>
                      <p style={{
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        color: "rgba(253,246,236,0.5)",
                        fontSize: "0.82rem",
                        lineHeight: 1.7,
                        margin: 0,
                      }}>{item.desc}</p>
                    </motion.div>
                  </a>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ── SOCIAL MEDIA ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "6rem 0", background: "#F5EFE3" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
          <FadeIn direction="up">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "#D4A843",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "0.75rem",
              }}>FOLLOW ME</span>
              <h2 style={{
                fontFamily: "'Tiro Bangla', serif",
                color: "#0D1B2A",
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 400,
                marginBottom: "0.75rem",
              }}>সোশ্যাল মিডিয়া</h2>
              <div style={{ width: 60, height: 3, background: "#D4A843", margin: "0 auto 1rem", borderRadius: 2 }} />
              <p style={{
                fontFamily: "'Noto Sans Bengali', sans-serif",
                color: "#4A5568",
                fontSize: "0.95rem",
                maxWidth: 600,
                margin: "0 auto",
                lineHeight: 1.8,
              }}>
                আমার সকল অফিসিয়াল প্ল্যাটফর্মে যুক্ত হোন। এর বাইরে অন্য কোনো পেইজে আমার মালিকানা নেই।
              </p>
            </div>
          </FadeIn>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1rem",
          }}>
            {socialPlatforms.map((s, i) => (
              <FadeIn key={i} delay={i * 0.06} direction="up">
                <motion.a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(13,27,42,0.15)" }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1.2rem 1.5rem",
                    background: "#fff",
                    borderRadius: 10,
                    border: "1px solid rgba(13,27,42,0.08)",
                    textDecoration: "none",
                    transition: "all 0.3s",
                    boxShadow: "0 2px 10px rgba(13,27,42,0.06)",
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: s.color + "18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: s.color,
                    flexShrink: 0,
                  }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: "#0D1B2A",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      marginBottom: 2,
                    }}>{s.name}</div>
                    <div style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: "#6B7280",
                      fontSize: "0.8rem",
                    }}>{s.handle}</div>
                  </div>
                  <ExternalLink size={14} style={{ marginLeft: "auto", color: "#9CA3AF" }} />
                </motion.a>
              </FadeIn>
            ))}
          </div>

          {/* Facebook Groups */}
          <FadeIn delay={0.3} direction="up">
            <div style={{ marginTop: "2.5rem" }}>
              <h3 style={{
                fontFamily: "'Tiro Bangla', serif",
                color: "#0D1B2A",
                fontSize: "1.4rem",
                fontWeight: 400,
                marginBottom: "1rem",
                textAlign: "center",
              }}>ফেসবুক গ্রুপ</h3>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                {fbGroups.map((g, i) => (
                  <a
                    key={i}
                    href={g.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 24px",
                      background: "#0D1B2A",
                      color: "#FDF6EC",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.9rem",
                      transition: "all 0.3s",
                      border: "1px solid rgba(212,168,67,0.2)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#D4A843"; e.currentTarget.style.color = "#0D1B2A"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#0D1B2A"; e.currentTarget.style.color = "#FDF6EC"; }}
                  >
                    <Users size={16} /> {g.name}
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────────────────── */}
      <section id="contact" style={{
        padding: "6rem 0",
        background: "#0D1B2A",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${ABOUT_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.07,
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5rem",
            alignItems: "center",
          }} className="contact-grid">
            {/* Left */}
            <FadeIn direction="left">
              <div>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: "#D4A843",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "1rem",
                }}>CONTACT</span>
                <h2 style={{
                  fontFamily: "'Tiro Bangla', serif",
                  color: "#FDF6EC",
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  fontWeight: 400,
                  marginBottom: "1rem",
                }}>যোগাযোগ করুন</h2>
                <div style={{ width: 60, height: 3, background: "#D4A843", marginBottom: "1.5rem", borderRadius: 2 }} />

                <p style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "rgba(253,246,236,0.7)",
                  fontSize: "1rem",
                  lineHeight: 1.9,
                  marginBottom: "2rem",
                }}>
                  আমার সাথে যোগাযোগ করতে চাইলে ইমেইল করুন বা সোশ্যাল মিডিয়ায় মেসেজ পাঠান।
                  পাঠকদের সাথে কথা বলতে আমি সবসময় আগ্রহী।
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <a
                    href="mailto:lekhokmahbubsardarsabuj@gmail.com"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem 1.5rem",
                      background: "rgba(253,246,236,0.05)",
                      border: "1px solid rgba(212,168,67,0.2)",
                      borderRadius: 10,
                      textDecoration: "none",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,168,67,0.1)"; e.currentTarget.style.borderColor = "rgba(212,168,67,0.4)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(253,246,236,0.05)"; e.currentTarget.style.borderColor = "rgba(212,168,67,0.2)"; }}
                  >
                    <div style={{
                      width: 44, height: 44,
                      borderRadius: "50%",
                      background: "rgba(212,168,67,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#D4A843",
                    }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#D4A843", fontSize: "0.75rem", marginBottom: 3 }}>ইমেইল</div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#FDF6EC", fontSize: "0.9rem" }}>lekhokmahbubsardarsabuj@gmail.com</div>
                    </div>
                  </a>

                  <a
                    href="https://facebook.com/Lekhok.MahbubSardarSabuj"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem 1.5rem",
                      background: "rgba(253,246,236,0.05)",
                      border: "1px solid rgba(212,168,67,0.2)",
                      borderRadius: 10,
                      textDecoration: "none",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,168,67,0.1)"; e.currentTarget.style.borderColor = "rgba(212,168,67,0.4)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(253,246,236,0.05)"; e.currentTarget.style.borderColor = "rgba(212,168,67,0.2)"; }}
                  >
                    <div style={{
                      width: 44, height: 44,
                      borderRadius: "50%",
                      background: "rgba(24,119,242,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#1877F2",
                    }}>
                      <Facebook size={20} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#D4A843", fontSize: "0.75rem", marginBottom: 3 }}>Facebook</div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#FDF6EC", fontSize: "0.9rem" }}>Lekhok.MahbubSardarSabuj</div>
                    </div>
                  </a>

                  <a
                    href="https://t.me/MahbubSardarSabuj"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem 1.5rem",
                      background: "rgba(253,246,236,0.05)",
                      border: "1px solid rgba(212,168,67,0.2)",
                      borderRadius: 10,
                      textDecoration: "none",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,168,67,0.1)"; e.currentTarget.style.borderColor = "rgba(212,168,67,0.4)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(253,246,236,0.05)"; e.currentTarget.style.borderColor = "rgba(212,168,67,0.2)"; }}
                  >
                    <div style={{
                      width: 44, height: 44,
                      borderRadius: "50%",
                      background: "rgba(0,136,204,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#0088CC",
                    }}>
                      <Send size={20} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#D4A843", fontSize: "0.75rem", marginBottom: 3 }}>Telegram</div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#FDF6EC", fontSize: "0.9rem" }}>@MahbubSardarSabuj</div>
                    </div>
                  </a>
                </div>
              </div>
            </FadeIn>

            {/* Right: Quote / Writing showcase */}
            <FadeIn direction="right">
              <div style={{ position: "relative" }}>
                <img
                  src={WRITING_SHOWCASE}
                  alt="লেখার জগৎ"
                  style={{
                    width: "100%",
                    height: 420,
                    objectFit: "cover",
                    borderRadius: 12,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                  }}
                />
                {/* Quote overlay */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(to top, rgba(13,27,42,0.95) 0%, transparent 100%)",
                  padding: "3rem 2rem 2rem",
                  borderRadius: "0 0 12px 12px",
                }}>
                  <p style={{
                    fontFamily: "'Tiro Bangla', serif",
                    color: "#FDF6EC",
                    fontSize: "1.1rem",
                    lineHeight: 1.7,
                    fontStyle: "italic",
                    margin: 0,
                  }}>
                    "এখন আর আমি শুধুমাত্র টাইমপাসের জন্য লিখি না, বরং পাঠকের জন্য লিখি।"
                  </p>
                  <p style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    color: "#D4A843",
                    fontSize: "0.85rem",
                    marginTop: 8,
                  }}>— মাহবুব সরদার সবুজ</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── LIGHTBOX ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImg(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(0,0,0,0.92)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ position: "relative", maxWidth: 800, width: "100%" }}
            >
              <img
                src={lightboxImg.src}
                alt={lightboxImg.caption}
                style={{
                  width: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  borderRadius: 10,
                  boxShadow: "0 30px 80px rgba(0,0,0,0.8)",
                }}
              />
              <p style={{
                fontFamily: "'Noto Sans Bengali', sans-serif",
                color: "rgba(253,246,236,0.7)",
                textAlign: "center",
                marginTop: "1rem",
                fontSize: "0.9rem",
              }}>{lightboxImg.caption}</p>
              <button
                onClick={() => setLightboxImg(null)}
                style={{
                  position: "absolute",
                  top: -16, right: -16,
                  background: "#D4A843",
                  border: "none",
                  borderRadius: "50%",
                  width: 36, height: 36,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  color: "#0D1B2A",
                }}
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Responsive CSS ───────────────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 2rem !important; text-align: center; }
          .hero-photo { display: none !important; }
          .about-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .book-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .news-grid { grid-template-columns: 1fr !important; }
          .contact-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .gallery-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
