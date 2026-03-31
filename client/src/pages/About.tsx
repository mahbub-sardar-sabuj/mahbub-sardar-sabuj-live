/*
 * About Page — পরিচিতি
 * Design: World-class premium literary author profile
 * Palette: Deep Navy #060E1A, Rich Gold #C9A84C, Ivory #FAF6EF
 */
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  MapPin, BookOpen, PenLine, Award, Quote,
  ArrowRight, Calendar, Feather, Globe, Heart
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const PROFILE_1 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";
const BOOK_COVER = "/images/book-cover-20260328.jpg";

const timeline = [
  { year: "শৈশব", icon: MapPin, title: "কুমিল্লার মাটিতে জন্ম", desc: "কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামে জন্মগ্রহণ করেন।" },
  { year: "২০১৫+", icon: PenLine, title: "লেখালেখির সূচনা", desc: "সামাজিক মাধ্যমে লেখা শুরু। পাঠকের হৃদয়ে স্থান করে নেওয়া শুরু হয় কবিতা ও ছোট গদ্যের মাধ্যমে।" },
  { year: "২০২৩", icon: BookOpen, title: "প্রথম ই-বুক প্রকাশ", desc: "\"চাঁদফুল\" ও \"সময়ের গহ্বরে\" প্রকাশিত হয়। হাজার হাজার পাঠক বিনামূল্যে পড়ার সুযোগ পান।" },
  { year: "২০২৪", icon: Feather, title: "আরও দুটি ই-বুক", desc: "\"স্মৃতির বসন্তে তুমি\" প্রকাশিত হয়। পাঠকসংখ্যা ৫০ হাজার ছাড়িয়ে যায়।" },
  { year: "২০২৬", icon: Award, title: "প্রথম ফিজিক্যাল বই", desc: "\"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" — প্রথম মুদ্রিত কাব্যগ্রন্থ প্রকাশিত হয়। রকমারিতে পাওয়া যাচ্ছে।" },
];

const philosophyQuotes = [
  "কলমের স্পর্শে আমি বিদ্রোহী, ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি।",
  "মানুষের আচরণই আসল পরিচয় — কে কীভাবে কথা বলে, কেমন ব্যবহারে আগলে রাখে।",
  "লেখালেখি আমার কাছে শুধু শখ নয়; এটি আত্মপ্রকাশ ও পাঠকের সঙ্গে মানসিক সংযোগ।",
];

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function About() {
  return (
    <div style={{ background: "#060E1A", minHeight: "100vh", overflowX: "hidden" }}>
      <Seo
        title="পরিচিতি | মাহবুব সরদার সবুজ"
        description="লেখক মাহবুব সরদার সবুজের পরিচিতি, সাহিত্যচর্চা, বই, এবং সৃজনশীল যাত্রা সম্পর্কে জানুন।"
        path="/about"
        keywords="মাহবুব সরদার সবুজ পরিচিতি, Mahbub Sardar Sabuj biography, বাংলা সাহিত্য লেখক"
      />
      <Navbar />

      {/* ══ HERO — ছবি ও টেক্সট পাশাপাশি ══════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          paddingTop: 80,
        }}
      >
        {/* Background */}
        <div style={{ position: "absolute", inset: 0, background: "#060E1A" }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(201,168,76,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 70%, rgba(6,14,26,1) 100%)",
        }} />

        {/* Gold glow */}
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
          style={{
            position: "absolute", top: "10%", right: "5%",
            width: "50vw", height: "50vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{
          position: "relative", zIndex: 2,
          width: "100%", maxWidth: 1100, margin: "0 auto",
          padding: "5rem 2rem 4rem",
        }}>
          <div className="about-hero-grid">

            {/* ── Left: Text ── */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}
              >
                <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.68rem", letterSpacing: "0.3em",
                  textTransform: "uppercase", color: "#C9A84C", fontWeight: 600,
                }}>Author Profile</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: "'Tiro Bangla', serif",
                  fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)",
                  fontWeight: 700, lineHeight: 1.15,
                  color: "#FAF6EF", margin: "0 0 0.2rem",
                }}
              >
                মাহবুব সরদার
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: "'Tiro Bangla', serif",
                  fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)",
                  fontWeight: 700, lineHeight: 1.15,
                  background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text", margin: "0 0 1.5rem",
                }}
              >
                সবুজ
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  fontSize: "1rem", color: "rgba(250,246,239,0.6)",
                  lineHeight: 1.9, maxWidth: 460, margin: "0 0 2rem",
                }}
              >
                বাংলা সাহিত্যের একজন নিবেদিতপ্রাণ লেখক ও কবি। ভালোবাসা, বিচ্ছেদ, জীবনসংগ্রাম ও মানবিক অনুভূতিকে সহজ অথচ আবেগঘন ভাষায় প্রকাশ করেন।
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                style={{ display: "flex", gap: 14, flexWrap: "wrap" }}
              >
                <Link href="/ebooks">
                  <motion.span
                    whileHover={{ scale: 1.03, boxShadow: "0 16px 40px rgba(201,168,76,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "13px 26px", borderRadius: 4,
                      background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                      color: "#060E1A", fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
                      textDecoration: "none", boxShadow: "0 8px 24px rgba(201,168,76,0.25)",
                    }}
                  >
                    <BookOpen size={15} />
                    বই সংগ্রহ
                  </motion.span>
                </Link>
                <Link href="/contact">
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "13px 26px", borderRadius: 4,
                      background: "transparent",
                      border: "1px solid rgba(201,168,76,0.3)",
                      color: "rgba(250,246,239,0.75)",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    যোগাযোগ
                    <ArrowRight size={15} />
                  </motion.span>
                </Link>
              </motion.div>
            </div>

            {/* ── Right: Portrait ── */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="about-portrait-wrapper"
            >
              {/* Decorative corner frame */}
              <div style={{
                position: "absolute", top: -16, left: -16,
                width: 80, height: 80,
                borderTop: "2px solid rgba(201,168,76,0.4)",
                borderLeft: "2px solid rgba(201,168,76,0.4)",
                borderRadius: "4px 0 0 0",
                pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", bottom: -16, right: -16,
                width: 80, height: 80,
                borderBottom: "2px solid rgba(201,168,76,0.4)",
                borderRight: "2px solid rgba(201,168,76,0.4)",
                borderRadius: "0 0 4px 0",
                pointerEvents: "none",
              }} />

              {/* Portrait image */}
              <div style={{
                borderRadius: 16, overflow: "hidden",
                boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.1)",
                position: "relative",
              }}>
                <img
                  src={PROFILE_1}
                  alt="মাহবুব সরদার সবুজ"
                  className="about-portrait-img"
                  style={{ width: "100%", display: "block", filter: "contrast(1.05) saturate(0.9)" }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, transparent 55%, rgba(6,14,26,0.75) 100%)",
                }} />
                {/* Name overlay at bottom */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  padding: "1.5rem",
                }}>
                  <div style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.65rem", letterSpacing: "0.2em",
                    textTransform: "uppercase", color: "#C9A84C", marginBottom: 4,
                  }}>লেখক ও কবি</div>
                  <div style={{
                    fontFamily: "'Tiro Bangla', serif",
                    fontSize: "1.1rem", color: "#FAF6EF", fontWeight: 700,
                  }}>মাহবুব সরদার সবুজ</div>
                </div>
              </div>

              {/* Floating book card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", bottom: -20, right: -20,
                  background: "rgba(6,14,26,0.85)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  borderRadius: 12, padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                  zIndex: 5,
                }}
                className="hero-floating-card"
              >
                <img src={BOOK_COVER} alt="বই" style={{ width: 36, height: 50, objectFit: "cover", borderRadius: 4 }} />
                <div>
                  <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.62rem", color: "#C9A84C", marginBottom: 3 }}>সর্বশেষ বই</div>
                  <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.75rem", color: "#FAF6EF", fontWeight: 600, maxWidth: 110, lineHeight: 1.4 }}>দুঃখবিলাস</div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{
            position: "absolute", bottom: 28, left: "50%",
            transform: "translateX(-50%)", zIndex: 3,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}
        >
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: "rgba(250,246,239,0.2)", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 36, background: "linear-gradient(to bottom, rgba(201,168,76,0.5), transparent)" }} />
        </motion.div>
      </section>

      {/* ══ BIO DETAIL ════════════════════════════════════════════════════════ */}
      <section style={{ padding: "7rem 2rem", background: "#060E1A", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(201,168,76,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px", pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: "1rem" }}>
                <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.68rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A84C" }}>পরিচয়</span>
                <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
              </div>
              <h2 style={{
                fontFamily: "'Tiro Bangla', serif",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 700, color: "#FAF6EF", margin: 0,
              }}>
                কলমের মানুষ,{" "}
                <span style={{
                  background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>মানুষের কলম</span>
              </h2>
            </div>
          </FadeUp>

          <div className="bio-detail-grid">
            <FadeUp delay={0.1}>
              <div style={{
                background: "rgba(201,168,76,0.04)",
                border: "1px solid rgba(201,168,76,0.12)",
                borderRadius: 16, padding: "2.5rem",
                height: "100%",
              }}>
                <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "1rem", color: "rgba(250,246,239,0.65)", lineHeight: 2, margin: "0 0 1.2rem" }}>
                  মাহবুব সরদার সবুজ একজন বাংলা ভাষার লেখক ও কবি, যিনি ভালোবাসা, বিচ্ছেদ, জীবনসংগ্রাম, স্মৃতি, এবং মানবিক অনুভূতিকে সহজ অথচ আবেগঘন ভাষায় প্রকাশ করে পাঠকের কাছে পরিচিত হয়েছেন।
                </p>
                <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "1rem", color: "rgba(250,246,239,0.55)", lineHeight: 2, margin: "0 0 1.2rem" }}>
                  তিনি কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়িতে জন্মগ্রহণ করেন। কর্মসূত্রে সৌদি আরবে অবস্থান করলেও বাংলা ভাষা, সাহিত্য, এবং পাঠকের সঙ্গে তাঁর সম্পর্ক অটুট রয়েছে।
                </p>
                <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "1rem", color: "rgba(250,246,239,0.5)", lineHeight: 2, margin: 0 }}>
                  লেখালেখি তাঁর কাছে শুধু শখ নয়; এটি আত্মপ্রকাশ, সংবেদনশীল অভিজ্ঞতার প্রকাশ, এবং পাঠকের সঙ্গে মানসিক সংযোগ তৈরির এক অনন্য মাধ্যম।
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {[
                  { icon: MapPin, label: "জন্মস্থান", value: "আরিফপুর, বরুড়া, কুমিল্লা" },
                  { icon: Globe, label: "বর্তমান অবস্থান", value: "সৌদি আরব" },
                  { icon: PenLine, label: "লেখালেখির শুরু", value: "২০১৫ সাল থেকে" },
                  { icon: BookOpen, label: "প্রকাশিত বই", value: "৫টি (৪টি ই-বুক + ১টি মুদ্রিত)" },
                  { icon: Calendar, label: "প্রথম মুদ্রিত বই", value: "২০২৬ — দুঃখবিলাস" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ x: 4, borderColor: "rgba(201,168,76,0.3)" }}
                      style={{
                        display: "flex", alignItems: "center", gap: 16,
                        padding: "1rem 1.4rem",
                        background: "rgba(201,168,76,0.04)",
                        border: "1px solid rgba(201,168,76,0.1)",
                        borderRadius: 10,
                        transition: "border-color 0.3s, transform 0.2s",
                      }}
                    >
                      <div style={{
                        width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                        background: "rgba(201,168,76,0.1)",
                        border: "1px solid rgba(201,168,76,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon size={16} color="#C9A84C" />
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.65rem", color: "rgba(201,168,76,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{item.label}</div>
                        <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.9rem", color: "rgba(250,246,239,0.8)", fontWeight: 500 }}>{item.value}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══ TIMELINE ══════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "7rem 2rem",
        background: "linear-gradient(180deg, #0A1628 0%, #060E1A 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px", pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: "1rem" }}>
                <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.68rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A84C" }}>সাহিত্যিক যাত্রা</span>
                <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
              </div>
              <h2 style={{
                fontFamily: "'Tiro Bangla', serif",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 700, color: "#FAF6EF", margin: 0,
              }}>
                জীবন ও সাহিত্যের টাইমলাইন
              </h2>
            </div>
          </FadeUp>

          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: "50%", top: 0, bottom: 0,
              width: 1, background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.3) 10%, rgba(201,168,76,0.3) 90%, transparent)",
              transform: "translateX(-50%)",
            }} className="timeline-line" />

            {timeline.map((item, i) => {
              const Icon = item.icon;
              const isLeft = i % 2 === 0;
              return (
                <FadeUp key={item.year} delay={i * 0.1}>
                  <div
                    className="timeline-item"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 60px 1fr",
                      gap: "1.5rem",
                      marginBottom: "3rem",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ textAlign: isLeft ? "right" : "left", opacity: isLeft ? 1 : 0 }} className={isLeft ? "" : "timeline-spacer"}>
                      {isLeft && (
                        <div style={{
                          background: "rgba(201,168,76,0.05)",
                          backdropFilter: "blur(20px)",
                          border: "1px solid rgba(201,168,76,0.15)",
                          borderRadius: 12, padding: "1.5rem",
                          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                        }}>
                          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.7rem", color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 8 }}>{item.year}</div>
                          <h3 style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#FAF6EF", margin: "0 0 8px" }}>{item.title}</h3>
                          <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.85rem", color: "rgba(250,246,239,0.5)", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: "rgba(201,168,76,0.1)",
                        border: "2px solid rgba(201,168,76,0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 20px rgba(201,168,76,0.2)",
                        flexShrink: 0,
                      }}>
                        <Icon size={18} color="#C9A84C" />
                      </div>
                    </div>
                    <div style={{ opacity: isLeft ? 0 : 1 }} className={isLeft ? "timeline-spacer" : ""}>
                      {!isLeft && (
                        <div style={{
                          background: "rgba(201,168,76,0.05)",
                          backdropFilter: "blur(20px)",
                          border: "1px solid rgba(201,168,76,0.15)",
                          borderRadius: 12, padding: "1.5rem",
                          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                        }}>
                          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.7rem", color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 8 }}>{item.year}</div>
                          <h3 style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#FAF6EF", margin: "0 0 8px" }}>{item.title}</h3>
                          <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.85rem", color: "rgba(250,246,239,0.5)", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ PHILOSOPHY QUOTES ═════════════════════════════════════════════════ */}
      <section style={{ padding: "7rem 2rem", background: "#060E1A", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "5%", left: "3%",
          fontFamily: "Georgia, serif", fontSize: "18rem",
          color: "rgba(201,168,76,0.03)", lineHeight: 1,
          pointerEvents: "none", userSelect: "none",
        }}>"</div>

        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: "1rem" }}>
                <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.68rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A84C" }}>দর্শন ও বিশ্বাস</span>
                <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
              </div>
              <h2 style={{
                fontFamily: "'Tiro Bangla', serif",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 700, color: "#FAF6EF", margin: 0,
              }}>
                লেখকের কথা
              </h2>
            </div>
          </FadeUp>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {philosophyQuotes.map((q, i) => (
              <FadeUp key={i} delay={i * 0.15}>
                <motion.div
                  whileHover={{ scale: 1.01, borderColor: "rgba(201,168,76,0.35)" }}
                  style={{
                    background: "rgba(201,168,76,0.04)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(201,168,76,0.12)",
                    borderRadius: 12, padding: "2rem 2.5rem",
                    display: "flex", gap: "1.5rem", alignItems: "flex-start",
                    transition: "border-color 0.3s",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(201,168,76,0.1)",
                    border: "1px solid rgba(201,168,76,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginTop: 2,
                  }}>
                    <Quote size={15} color="#C9A84C" />
                  </div>
                  <p style={{
                    fontFamily: "'Tiro Bangla', serif",
                    fontSize: "clamp(1rem, 2vw, 1.2rem)",
                    fontStyle: "italic",
                    color: "rgba(250,246,239,0.8)",
                    lineHeight: 1.8, margin: 0,
                  }}>
                    {q}
                  </p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "6rem 2rem",
        background: "linear-gradient(135deg, #0A1628 0%, #0d1e35 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60vw", height: "60vw", maxWidth: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <FadeUp>
          <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)",
              marginBottom: "2rem",
            }}>
              <Heart size={22} color="#C9A84C" />
            </div>
            <h2 style={{
              fontFamily: "'Tiro Bangla', serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700, color: "#FAF6EF",
              lineHeight: 1.3, margin: "0 0 1.2rem",
            }}>
              লেখকের সাথে যুক্ত থাকুন
            </h2>
            <p style={{
              fontFamily: "'Noto Sans Bengali', sans-serif",
              fontSize: "1rem", color: "rgba(250,246,239,0.5)",
              lineHeight: 1.9, margin: "0 0 2.5rem",
            }}>
              নতুন বই, লেখা এবং আপডেটের জন্য সামাজিক মাধ্যমে অনুসরণ করুন অথবা সরাসরি যোগাযোগ করুন।
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact">
                <motion.span
                  whileHover={{ scale: 1.03, boxShadow: "0 16px 40px rgba(201,168,76,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    padding: "14px 30px", borderRadius: 4,
                    background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                    color: "#060E1A", fontFamily: "'Noto Sans Bengali', sans-serif",
                    fontSize: "0.95rem", fontWeight: 700, cursor: "pointer",
                    textDecoration: "none", boxShadow: "0 8px 24px rgba(201,168,76,0.3)",
                  }}
                >
                  যোগাযোগ করুন
                  <ArrowRight size={16} />
                </motion.span>
              </Link>
              <Link href="/ebooks">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    padding: "14px 30px", borderRadius: 4,
                    background: "transparent",
                    border: "1px solid rgba(201,168,76,0.3)",
                    color: "rgba(250,246,239,0.75)",
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
                    textDecoration: "none",
                  }}
                >
                  <BookOpen size={16} />
                  বই পড়ুন
                </motion.span>
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Noto+Sans+Bengali:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        /* ── Hero grid ── */
        .about-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: center;
        }
        .about-portrait-wrapper {
          position: relative;
        }
        .about-portrait-img {
          height: 560px;
          object-fit: cover;
          object-position: center top;
        }

        /* ── Bio detail grid ── */
        .bio-detail-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 3rem;
          align-items: start;
        }

        /* ── Timeline ── */
        .timeline-line { display: block; }
        .timeline-item { grid-template-columns: 1fr 60px 1fr; }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .about-hero-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .about-portrait-wrapper {
            max-width: 420px;
            margin: 0 auto;
          }
          .about-portrait-img { height: 420px; }
          .bio-detail-grid { grid-template-columns: 1fr; gap: 2rem; }
          .timeline-line { display: none; }
          .timeline-item { grid-template-columns: 1fr !important; }
          .timeline-spacer { display: none !important; }
          .timeline-item > div:nth-child(2) { justify-content: flex-start; }
        }
        @media (max-width: 768px) {
          .about-portrait-img { height: 340px; }
          .hero-floating-card { display: none; }
        }
      `}</style>
    </div>
  );
}
