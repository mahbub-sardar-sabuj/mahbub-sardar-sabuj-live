/*
 * Design: "Ink & Gold" — World-Class Literary Premium
 * Home: Clean landing page — Hero + Marquee + Quick Nav Cards
 * All content sections moved to dedicated pages
 */
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  UserRound, BookOpen, Mic2, PenLine, Images,
  Newspaper, Mail, Palette, ChevronDown, ArrowRight
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

// ── Assets ────────────────────────────────────────────────────────────────────
const PROFILE_1 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/hero-bg-U7hjBDvWeoSXDDh3veCUTN.webp";

// ── Quick nav cards ───────────────────────────────────────────────────────────
const navCards = [
  { label: "পরিচিতি", subtitle: "লেখক পরিচয় ও জীবনপথ", href: "/about", icon: UserRound, color: "#1E3A5F" },
  { label: "বই", subtitle: "প্রকাশিত বই ও সংগ্রহ", href: "/ebooks", icon: BookOpen, color: "#2D4A1E" },
  { label: "আবৃত্তি", subtitle: "নির্বাচিত আবৃত্তি ভিডিও", href: "/facebook-recitations", icon: Mic2, color: "#4A1E2D" },
  { label: "লেখালেখি", subtitle: "প্রবন্ধ, গদ্য ও সাহিত্যকর্ম", href: "/writings", icon: PenLine, color: "#3A2D1E" },
  { label: "ই-বুক", subtitle: "ই-বুকের সংগ্রহ পড়ুন", href: "/ebooks", icon: BookOpen, color: "#1E2D4A" },
  { label: "ডিজাইন ফরম্যাট", subtitle: "কার্ড ডিজাইন তৈরি করুন", href: "/editor", icon: Palette, color: "#2D1E4A" },
  { label: "গ্যালারি", subtitle: "ছবি ও ভিজ্যুয়াল সংগ্রহ", href: "/gallery", icon: Images, color: "#1E4A3A" },
  { label: "সংবাদ", subtitle: "সাম্প্রতিক আপডেট ও খবর", href: "/news", icon: Newspaper, color: "#4A3A1E" },
  { label: "যোগাযোগ", subtitle: "ইমেইল ও যোগাযোগের উপায়", href: "/contact", icon: Mail, color: "#1E3A4A" },
];

// ═══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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
    <div style={{ background: "#0A1628", minHeight: "100vh", overflowX: "hidden" }}>
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
          justifyContent: "center",
          overflow: "hidden",
          background: "linear-gradient(135deg, #060e1a 0%, #0a1628 40%, #0d2040 70%, #0a1628 100%)",
        }}
      >
        {/* Parallax BG */}
        <motion.div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            y: heroY,
            opacity: 0.18,
          }}
        />

        {/* Gradient overlays */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(6,14,26,0.3) 0%, rgba(6,14,26,0.1) 40%, rgba(6,14,26,0.7) 100%)",
        }} />

        {/* Decorative radial glow */}
        <div style={{
          position: "absolute",
          top: "20%", left: "50%",
          transform: "translateX(-50%)",
          width: 600, height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Content */}
        <motion.div
          style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 1.5rem", opacity: heroOpacity }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Profile photo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: 120, height: 120,
              borderRadius: "50%",
              overflow: "hidden",
              margin: "0 auto 2rem",
              border: "3px solid rgba(201,168,76,0.6)",
              boxShadow: "0 0 40px rgba(201,168,76,0.25), 0 0 80px rgba(201,168,76,0.1)",
            }}
          >
            <img
              src={PROFILE_1}
              alt="মাহবুব সরদার সবুজ"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </motion.div>

          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 18px",
              borderRadius: 999,
              background: "rgba(201,168,76,0.12)",
              border: "1px solid rgba(201,168,76,0.3)",
              marginBottom: "1.5rem",
            }}
          >
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#C9A84C",
            }}>লেখক ও কবি</span>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            style={{
              fontFamily: "'Tiro Bangla', serif",
              fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              margin: "0 0 1.2rem",
              background: "linear-gradient(135deg, #FAF6EF 0%, #E8C97A 40%, #C9A84C 70%, #FAF6EF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            মাহবুব সরদার সবুজ
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            style={{
              fontFamily: "'Noto Sans Bengali', sans-serif",
              fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
              color: "rgba(250,246,239,0.65)",
              maxWidth: 560,
              margin: "0 auto 2.5rem",
              lineHeight: 1.8,
            }}
          >
            কলমের স্পর্শে আমি বিদ্রোহী, ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link href="/ebooks">
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 28px",
                  borderRadius: 999,
                  background: "linear-gradient(135deg, #C9A84C 0%, #E8C97A 100%)",
                  color: "#0A1628",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "none",
                  boxShadow: "0 8px 32px rgba(201,168,76,0.35)",
                }}
              >
                <BookOpen size={18} />
                বই পড়ুন
              </motion.span>
            </Link>
            <Link href="/about">
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 28px",
                  borderRadius: 999,
                  background: "rgba(250,246,239,0.06)",
                  border: "1px solid rgba(201,168,76,0.35)",
                  color: "rgba(250,246,239,0.85)",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none",
                  backdropFilter: "blur(8px)",
                }}
              >
                <UserRound size={18} />
                পরিচিতি
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

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
                  fontFamily: "'AkhandBengali', 'Noto Sans Bengali', sans-serif",
                  color: "#0A1628",
                  fontSize: "1rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
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
          QUICK NAV — Cards grid to all pages
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "6rem 0 8rem",
        background: "linear-gradient(180deg, #0A1628 0%, #0d1e35 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative background dots */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(201,168,76,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem" }}>
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ textAlign: "center", marginBottom: "4rem" }}
          >
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 16px",
              borderRadius: 999,
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.25)",
              marginBottom: "1.2rem",
            }}>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.68rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#C9A84C",
              }}>সকল বিভাগ</span>
            </div>
            <h2 style={{
              fontFamily: "'Tiro Bangla', serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
              color: "#FAF6EF",
              margin: "0 0 0.8rem",
              lineHeight: 1.3,
            }}>
              যা খুঁজছেন তা এখানে পাবেন
            </h2>
            <p style={{
              fontFamily: "'Noto Sans Bengali', sans-serif",
              color: "rgba(250,246,239,0.5)",
              fontSize: "1rem",
              maxWidth: 480,
              margin: "0 auto",
              lineHeight: 1.7,
            }}>
              প্রতিটি ট্যাবে ক্লিক করলে সম্পূর্ণ পেজ খুলবে
            </p>
          </motion.div>

          {/* Cards grid */}
          <div className="nav-cards-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.25rem",
          }}>
            {navCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.href + card.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href={card.href} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{
                      padding: "1.75rem 1.5rem",
                      borderRadius: 20,
                      background: `linear-gradient(135deg, ${card.color}88 0%, rgba(10,22,40,0.6) 100%)`,
                      border: "1px solid rgba(201,168,76,0.15)",
                      backdropFilter: "blur(12px)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.45)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(201,168,76,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.15)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 48, height: 48,
                        borderRadius: 14,
                        background: "rgba(201,168,76,0.12)",
                        border: "1px solid rgba(201,168,76,0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1.1rem",
                      }}>
                        <Icon size={22} color="#C9A84C" />
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
                        {card.label}
                      </h3>

                      {/* Subtitle */}
                      <p style={{
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontSize: "0.8rem",
                        color: "rgba(250,246,239,0.5)",
                        margin: "0 0 1rem",
                        lineHeight: 1.5,
                      }}>
                        {card.subtitle}
                      </p>

                      {/* Arrow */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#C9A84C",
                        fontSize: "0.78rem",
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                      }}>
                        <span>দেখুন</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />

      {/* ── Responsive CSS ────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        @media (max-width: 900px) {
          .nav-cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .nav-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
