import { motion, useScroll, useTransform } from "framer-motion";
import { Facebook, ExternalLink, Mic, Play, Copy, Check, ArrowRight, BadgeCheck, Headphones, Sparkles, Volume2 } from "lucide-react";
import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";
import { facebookPageUrl, facebookRecitations } from "@/data/facebookRecitations";

// ── Palette (matches Homepage) ─────────────────────────────────────────────
// Deep Navy #060E1A | Rich Gold #C9A84C | Ivory #FAF6EF | Charcoal #1E2D3D

export default function FacebookRecitations() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const featuredRecitation = facebookRecitations[0]!;
  const archiveRecitations = facebookRecitations.slice(1);
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
        title="Facebook আবৃত্তি | মাহবুব সরদার সবুজের কবিতা আবৃত্তি সংগ্রহ"
        description="মাহবুব সরদার সবুজের Facebook আবৃত্তির নির্বাচিত সংগ্রহ। বাংলা কবিতার আবৃত্তির ভিডিওগুলো একসাথে দেখুন ও শুনুন।"
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
          paddingTop: "calc(var(--site-nav-offset, 98px) + 1.5rem)",
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
              fontFamily: "'AdorshoLipi', sans-serif",
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
              fontFamily: "'AdorshoLipi', sans-serif",
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
              fontFamily: "'AdorshoLipi', sans-serif",
              color: "rgba(250,246,239,0.55)",
              fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
              lineHeight: 1.75,
              margin: "0 0 2rem",
            }}
          >
            মাহবুব সরদার সবুজের নির্বাচিত আবৃত্তির সংকলন — লেখা থেকে কণ্ঠে, অনুভূতির আরও কাছে।
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 }}
            className="recitation-hero-facts"
          >
            <span><Volume2 size={14} /> {facebookRecitations.length}টি নির্বাচিত আবৃত্তি</span>
            <span><Headphones size={14} /> কবিতা ও অনুভূতির কণ্ঠ</span>
            <span><BadgeCheck size={14} /> অফিশিয়াল Facebook archive</span>
          </motion.div>

          {/* Facebook Page Button */}
          <motion.a
            href={facebookPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
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
              fontFamily: "'AdorshoLipi', sans-serif",
              fontSize: "0.95rem",
              fontWeight: 700,
              boxShadow: "0 12px 28px rgba(201,168,76,0.25)",
              transition: "box-shadow 0.3s",
            }}
          >
            <Facebook size={17} /> সব আবৃত্তির update দেখুন <ExternalLink size={14} />
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

      <section aria-label="নির্বাচিত আবৃত্তি" className="recitation-spotlight-section">
        <div className="recitation-spotlight-grid">
          <motion.a
            href={featuredRecitation.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            whileHover={{ y: -5 }}
            className="recitation-spotlight-cover"
          >
            <img src={featuredRecitation.thumbnail} alt={`${featuredRecitation.title} আবৃত্তির প্রচ্ছদ`} />
            <div className="recitation-spotlight-shade" />
            <span className="recitation-spotlight-badge"><Sparkles size={14} /> নির্বাচিত শ্রবণ</span>
            <span className="recitation-spotlight-play"><Play size={22} fill="currentColor" /></span>
            <span className="recitation-spotlight-meta">REEL 01 <ArrowRight size={14} /></span>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.08 }}
            className="recitation-spotlight-copy"
          >
            <div className="recitation-kicker"><Headphones size={15} /> আজকের শুনুন</div>
            <h2>{featuredRecitation.title}</h2>
            <p>{featuredRecitation.description}</p>
            <div className="recitation-spotlight-details">
              <span><Mic size={14} /> মাহবুব সরদার সবুজের কণ্ঠ</span>
              <span><Facebook size={14} /> Facebook Reel</span>
            </div>
            <a href={featuredRecitation.url} target="_blank" rel="noopener noreferrer" className="recitation-primary-action">
              <Play size={16} fill="currentColor" /> এখন আবৃত্তি শুনুন <ExternalLink size={14} />
            </a>
            <div className="recitation-source-note"><BadgeCheck size={14} /> Play করতে Facebook Reel-এ খুলবে</div>
          </motion.div>
        </div>
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

          {/* Listening archive heading */}
          <div className="recitation-archive-heading">
            <div>
              <div className="recitation-kicker"><Mic size={14} /> আবৃত্তির সংগ্রহ</div>
              <h2>আরও শুনুন, আরও অনুভব করুন</h2>
              <p>নির্বাচিত কবিতা ও অনুভূতির বাকি {archiveRecitations.length}টি কণ্ঠস্বর এখানে একসঙ্গে আছে।</p>
            </div>
            <div className="recitation-archive-count"><Volume2 size={16} /> {facebookRecitations.length}টি আবৃত্তি</div>
          </div>

          {/* Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}>
            {archiveRecitations.map((video, index) => (
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
                    fontFamily: "'AdorshoLipi', sans-serif",
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
                    fontFamily: "'AdorshoLipi', sans-serif",
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    boxShadow: "0 8px 20px rgba(201,168,76,0.35)",
                  }}>
                    {index + 2}
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
                        fontFamily: "'AdorshoLipi', sans-serif",
                        color: "#FAF6EF",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        lineHeight: 1.42,
                        textShadow: "0 4px 16px rgba(0,0,0,0.5)",
                        margin: 0,
                      }}>
                        {video.title}
                      </h2>
                      <p className="recitation-card-excerpt">{video.description}</p>

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
                    fontFamily: "'AdorshoLipi', sans-serif",
                    color: "#C9A84C",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}>
                    <Facebook size={14} /> Facebook-এ দেখুন
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); const url = video.url; navigator.clipboard.writeText(url).catch(() => { const ta = document.createElement("textarea"); ta.value = url; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }); setCopiedId(video.id); setTimeout(() => setCopiedId(null), 2000); }}
                      title={copiedId === video.id ? "লিংক কপি হয়েছে" : "লিংক কপি করুন"}
                      aria-label={copiedId === video.id ? `${video.title} আবৃত্তির লিংক কপি হয়েছে` : `${video.title} আবৃত্তির Facebook লিংক কপি করুন`}
                      style={{
                        width: 32, height: 32, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: copiedId === video.id ? "rgba(52,211,153,0.15)" : "rgba(201,168,76,0.12)",
                        border: copiedId === video.id ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(201,168,76,0.2)",
                        color: copiedId === video.id ? "#34D399" : "#C9A84C",
                        cursor: "pointer", flexShrink: 0,
                      }}
                    >
                      {copiedId === video.id ? <Check size={14}/> : <Copy size={14}/>}
                    </button>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(201,168,76,0.12)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      color: "#C9A84C", flexShrink: 0,
                    }}>
                      <ExternalLink size={14} />
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
          <div className="recitation-copy-status" aria-live="polite">{copiedId ? "আবৃত্তির Facebook লিংক কপি করা হয়েছে" : ""}</div>
        </div>
      </section>

      {/* Gold shimmer keyframe */}
      <style>{`
        .recitation-hero-facts {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: -0.6rem auto 1.75rem;
        }
        .recitation-hero-facts span,
        .recitation-archive-count,
        .recitation-spotlight-details span {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.42rem 0.64rem;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          color: rgba(250,246,239,0.74);
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.76rem;
          line-height: 1;
        }
        .recitation-hero-facts svg,
        .recitation-archive-count svg,
        .recitation-spotlight-details svg { color: #E8C97A; }
        .recitation-spotlight-section {
          position: relative;
          padding: clamp(3.5rem, 7vw, 6rem) 1.5rem;
          background: linear-gradient(135deg, #0A1628 0%, #071426 54%, #0D1E35 100%);
          overflow: hidden;
        }
        .recitation-spotlight-section::before {
          content: '';
          position: absolute;
          width: min(62vw, 780px);
          aspect-ratio: 1;
          border-radius: 50%;
          top: -58%;
          right: -18%;
          background: radial-gradient(circle, rgba(201,168,76,0.17), transparent 66%);
          pointer-events: none;
        }
        .recitation-spotlight-grid {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(300px, 1.1fr);
          gap: clamp(1.4rem, 5vw, 4rem);
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .recitation-spotlight-cover {
          min-height: 420px;
          display: block;
          position: relative;
          overflow: hidden;
          border-radius: 26px;
          background: #060E1A;
          border: 1px solid rgba(201,168,76,0.35);
          box-shadow: 0 26px 60px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.09);
          text-decoration: none;
          isolation: isolate;
          transition: transform 180ms cubic-bezier(0.23,1,0.32,1), box-shadow 180ms cubic-bezier(0.23,1,0.32,1);
        }
        .recitation-spotlight-cover img {
          width: 100%;
          height: 100%;
          position: absolute;
          inset: 0;
          object-fit: cover;
          transition: transform 500ms cubic-bezier(0.23,1,0.32,1);
        }
        .recitation-spotlight-cover:hover img { transform: scale(1.055); }
        .recitation-spotlight-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(6,14,26,0.12), rgba(6,14,26,0.22) 44%, rgba(6,14,26,0.95)); }
        .recitation-spotlight-badge,
        .recitation-spotlight-meta {
          position: absolute;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #F4D477;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.76rem;
          font-weight: 900;
          letter-spacing: 0.04em;
        }
        .recitation-spotlight-badge { top: 1rem; left: 1rem; padding: 0.45rem 0.65rem; border-radius: 999px; background: rgba(6,14,26,0.68); backdrop-filter: blur(12px); border: 1px solid rgba(244,212,119,0.3); }
        .recitation-spotlight-meta { bottom: 1rem; left: 1rem; }
        .recitation-spotlight-play {
          position: absolute;
          width: 68px;
          height: 68px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #071426;
          background: linear-gradient(135deg, #F0D98A, #C9A84C);
          box-shadow: 0 14px 34px rgba(201,168,76,0.38);
          inset: 50% auto auto 50%;
          transform: translate(-50%, -50%);
          transition: transform 180ms cubic-bezier(0.23,1,0.32,1);
        }
        .recitation-spotlight-cover:hover .recitation-spotlight-play { transform: translate(-50%, -50%) scale(1.08); }
        .recitation-spotlight-copy { padding: 0.35rem 0; }
        .recitation-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #E8C97A;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.78rem;
          font-weight: 900;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }
        .recitation-spotlight-copy h2,
        .recitation-archive-heading h2 {
          margin: 0.45rem 0 0.8rem;
          color: #FAF6EF;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: clamp(2rem, 4.2vw, 3.25rem);
          font-weight: 700;
          line-height: 1.16;
        }
        .recitation-spotlight-copy > p,
        .recitation-archive-heading p {
          margin: 0;
          color: rgba(250,246,239,0.67);
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 1.02rem;
          line-height: 1.9;
        }
        .recitation-spotlight-details { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1.25rem 0; }
        .recitation-primary-action {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #C9A84C, #E8C97A);
          color: #071426;
          text-decoration: none;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.92rem;
          font-weight: 900;
          box-shadow: 0 12px 26px rgba(201,168,76,0.22);
          transition: transform 160ms cubic-bezier(0.23,1,0.32,1), box-shadow 160ms cubic-bezier(0.23,1,0.32,1);
        }
        .recitation-primary-action:hover { transform: translateY(-2px); box-shadow: 0 16px 34px rgba(201,168,76,0.32); }
        .recitation-primary-action:active { transform: scale(0.97); }
        .recitation-source-note { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.9rem; color: rgba(250,246,239,0.48); font-family: 'AdorshoLipi', sans-serif; font-size: 0.78rem; }
        .recitation-source-note svg { color: #C9A84C; }
        .recitation-card-excerpt {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0.34rem 0 0;
          color: rgba(250,246,239,0.63);
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.78rem;
          line-height: 1.48;
          text-shadow: 0 3px 12px rgba(0,0,0,0.55);
        }
        .recitation-copy-status {
          min-height: 1.4rem;
          margin-top: 1.1rem;
          text-align: center;
          color: #7EE0B5;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.84rem;
        }
        .recitation-archive-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 2.2rem; }
        .recitation-archive-heading h2 { font-size: clamp(1.7rem, 3.3vw, 2.5rem); margin-bottom: 0.45rem; }
        .recitation-archive-heading p { font-size: 0.95rem; }
        .recitation-archive-count { flex-shrink: 0; color: #F4D477; border-color: rgba(201,168,76,0.25); background: rgba(201,168,76,0.08); font-weight: 800; }
        @media (max-width: 760px) {
          .recitation-spotlight-section { padding-left: 1rem; padding-right: 1rem; }
          .recitation-spotlight-grid { grid-template-columns: 1fr; gap: 1.3rem; }
          .recitation-spotlight-cover { min-height: min(112vw, 430px); }
          .recitation-archive-heading { align-items: flex-start; flex-direction: column; margin-bottom: 1.5rem; }
          .recitation-archive-count { align-self: flex-start; }
          .recitation-hero-facts { margin-bottom: 1.4rem; }
          .recitation-hero-facts span { font-size: 0.71rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
        }
        @keyframes goldShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        a:hover .play-overlay { opacity: 1 !important; }
        a:hover img { transform: scale(1.07) !important; }
      `}</style>

      {/* AdSense Ad */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <AdSenseAd adSlot={AD_SLOTS.RECITATIONS_BOTTOM} adFormat="auto" fullWidthResponsive={true} />
      </div>
      <Footer />
    </div>
  );
}
