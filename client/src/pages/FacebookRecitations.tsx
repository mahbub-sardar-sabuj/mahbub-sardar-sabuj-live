import { motion, useScroll, useTransform } from "framer-motion";
import { Facebook, ExternalLink, Mic, Play } from "lucide-react";
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { facebookPageUrl, facebookRecitations } from "@/data/facebookRecitations";

// ── Palette (matches Homepage) ─────────────────────────────────────────────
// Deep Navy #060E1A | Rich Gold #C9A84C | Ivory #FAF6EF | Charcoal #1E2D3D

export default function FacebookRecitations() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const recitationsJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "name": "Facebook আবৃত্তি | মাহবুব সরদার সবুজ",
        "url": "https://www.mahbubsardarsabuj.com/facebook-recitations",
        "inLanguage": "bn-BD",
        "description": "মাহবুব সরদার সবুজের Facebook আবৃত্তির সংগ্রহ, যেখানে নির্বাচিত আবৃত্তির ভিডিও লিংক একসাথে পাওয়া যাবে।"
      },
      {
        "@type": "Person",
        "name": "Mahbub Sardar Sabuj",
        "alternateName": "মাহবুব সরদার সবুজ",
        "url": "https://www.mahbubsardarsabuj.com/"
      }
    ]
  };

  return (
    <div style={{ background: "#060E1A", minHeight: "100vh", overflowX: "hidden" }}>
      <Seo
        title="Facebook আবৃত্তি | মাহবুব সরদার সবুজ"
        description="মাহবুব সরদার সবুজের Facebook আবৃত্তির নির্বাচিত সংগ্রহ। এই পেজে আবৃত্তির ভিডিওগুলো একসাথে দেখা ও খোলা যাবে।"
        path="/facebook-recitations"
        keywords="মাহবুব সরদার সবুজ আবৃত্তি, Mahbub Sardar Sabuj recitation, Facebook আবৃত্তি, বাংলা আবৃত্তি"
        jsonLd={recitationsJsonLd}
      />
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "52vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "#060E1A",
          paddingTop: "6rem",
          paddingBottom: "4rem",
        }}
      >
        {/* Animated gold radial glow */}
        <motion.div
          animate={{ opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "70vw",
            height: "70vw",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.13) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        {/* Subtle grid texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }} />
        {/* Grain texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.5,
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 1.5rem", maxWidth: 700, margin: "0 auto" }}>
          {/* Mic icon badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: 999,
              padding: "0.45rem 1rem",
              marginBottom: "1.5rem",
            }}
          >
            <Mic size={14} color="#C9A84C" />
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: "#C9A84C",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}>
              Facebook আবৃত্তি সংগ্রহ
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontFamily: "'Tiro Bangla', serif",
              fontSize: "clamp(2.6rem, 6vw, 4rem)",
              fontWeight: 400,
              lineHeight: 1.25,
              margin: "0 0 1.2rem",
              background: "linear-gradient(110deg, #9A6E1A 0%, #C9A84C 20%, #F0D98A 45%, #E8C97A 60%, #C9A84C 80%, #9A6E1A 100%)",
              backgroundSize: "250% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "goldShimmer 4s ease-in-out infinite",
            }}
          >
            আবৃত্তি
          </motion.h1>

          {/* Gold divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              width: 80,
              height: 2,
              background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
              margin: "0 auto 1.6rem",
              borderRadius: 999,
            }}
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{
              fontFamily: "'Noto Sans Bengali', sans-serif",
              color: "rgba(250,246,239,0.55)",
              fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
              lineHeight: 1.75,
              margin: "0 0 2rem",
            }}
          >
            মাহবুব সরদার সবুজের নির্বাচিত আবৃত্তির সংকলন — অনুভূতির কণ্ঠস্বর
          </motion.p>

          {/* Facebook Page Button */}
          <motion.a
            href={facebookPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            whileHover={{ y: -3, boxShadow: "0 20px 40px rgba(201,168,76,0.3)" }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "0.85rem 1.8rem",
              background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
              color: "#060E1A",
              textDecoration: "none",
              borderRadius: 999,
              fontFamily: "'Noto Sans Bengali', sans-serif",
              fontSize: "0.95rem",
              fontWeight: 700,
              boxShadow: "0 12px 28px rgba(201,168,76,0.25)",
              transition: "box-shadow 0.3s",
            }}
          >
            <Facebook size={17} /> Facebook পেইজ <ExternalLink size={14} />
          </motion.a>
        </div>

        {/* Bottom fade */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: 80,
          background: "linear-gradient(to bottom, transparent, #060E1A)",
          pointerEvents: "none",
        }} />
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          RECITATIONS GRID
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{
        background: "linear-gradient(180deg, #060E1A 0%, #0A1628 50%, #0d1e35 100%)",
        padding: "3rem 0 6rem",
        position: "relative",
      }}>
        {/* Subtle gold glow bottom */}
        <motion.div
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "10%",
            right: "-10%",
            width: "50vw",
            height: "50vw",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>

          {/* Section count */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: "2.5rem",
          }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(201,168,76,0.3), transparent)" }} />
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: "rgba(201,168,76,0.6)",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}>
              {facebookRecitations.length}টি আবৃত্তি
            </span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3))" }} />
          </div>

          {/* Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}>
            {facebookRecitations.map((video, index) => (
              <motion.a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.07, 0.4) }}
                whileHover={{ y: -8 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "1px solid rgba(201,168,76,0.12)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                  height: "100%",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.4)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.2)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.12)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.35)";
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  position: "relative",
                  aspectRatio: "4 / 5",
                  overflow: "hidden",
                  background: "#0A1628",
                }}>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: "scale(1.02)",
                      transition: "transform 0.5s ease",
                    }}
                  />
                  {/* Dark gradient overlay */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(180deg, rgba(6,14,26,0.1) 0%, rgba(6,14,26,0.25) 40%, rgba(6,14,26,0.9) 100%)",
                  }} />

                  {/* Top-left badge */}
                  <div style={{
                    position: "absolute",
                    top: 14, left: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(6,14,26,0.7)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(201,168,76,0.25)",
                    color: "#C9A84C",
                    borderRadius: 999,
                    padding: "6px 12px",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                  }}>
                    <Mic size={11} /> আবৃত্তি
                  </div>

                  {/* Top-right number badge */}
                  <div style={{
                    position: "absolute",
                    right: 14, top: 14,
                    minWidth: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                    color: "#060E1A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    boxShadow: "0 8px 20px rgba(201,168,76,0.35)",
                  }}>
                    {index + 1}
                  </div>

                  {/* Play button overlay (center) */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.3s",
                  }}
                    className="play-overlay"
                  >
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "rgba(201,168,76,0.9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 12px 32px rgba(201,168,76,0.4)",
                    }}>
                      <Play size={22} color="#060E1A" fill="#060E1A" />
                    </div>
                  </div>

                  {/* Bottom title */}
                  <div style={{
                    position: "absolute",
                    left: 16, right: 16, bottom: 16,
                  }}>
                    <h2 style={{
                      fontFamily: "'Tiro Bangla', serif",
                      color: "#FAF6EF",
                      fontSize: "1.1rem",
                      fontWeight: 400,
                      lineHeight: 1.55,
                      textShadow: "0 4px 16px rgba(0,0,0,0.5)",
                      margin: 0,
                    }}>
                      {video.title}
                    </h2>
                  </div>
                </div>

                {/* Card footer */}
                <div style={{
                  padding: "1rem 1.1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  background: "rgba(201,168,76,0.04)",
                  borderTop: "1px solid rgba(201,168,76,0.1)",
                }}>
                  <span style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    color: "#C9A84C",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}>
                    <Facebook size={14} /> Facebook-এ দেখুন
                  </span>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(201,168,76,0.12)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    color: "#C9A84C",
                    flexShrink: 0,
                  }}>
                    <ExternalLink size={14} />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Gold shimmer keyframe */}
      <style>{`
        @keyframes goldShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        a:hover .play-overlay { opacity: 1 !important; }
        a:hover img { transform: scale(1.07) !important; }
      `}</style>

      <Footer />
    </div>
  );
}
