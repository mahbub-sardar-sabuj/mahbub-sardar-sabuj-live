/*
 * About Page — পরিচিতি
 * Design: World-class premium literary author profile
 * Palette: Deep Navy #060E1A, Rich Gold #C9A84C, Ivory #FAF6EF
 */
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  MapPin, BookOpen, PenLine, Users, Award, Quote,
  ArrowRight, Calendar, Feather, Globe, Heart
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const PROFILE_1 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";
const PROFILE_2 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile2_57482935.jpg";
const BOOK_COVER = "/images/book-cover-20260328.jpg";

const timeline = [
  { year: "শৈশব", icon: MapPin, title: "কুমিল্লার মাটিতে জন্ম", desc: "কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামে জন্মগ্রহণ করেন।" },
  { year: "২০১৫+", icon: PenLine, title: "লেখালেখির সূচনা", desc: "সামাজিক মাধ্যমে লেখা শুরু। পাঠকের হৃদয়ে স্থান করে নেওয়া শুরু হয় কবিতা ও ছোট গদ্যের মাধ্যমে।" },
  { year: "২০২৩", icon: BookOpen, title: "প্রথম ই-বুক প্রকাশ", desc: "\"চাঁদফুল\" ও \"সময়ের গহ্বরে\" প্রকাশিত হয়। হাজার হাজার পাঠক বিনামূল্যে পড়ার সুযোগ পান।" },
  { year: "২০২৪", icon: Feather, title: "আরও দুটি ই-বুক", desc: "\"স্মৃতির বসন্তে তুমি\" প্রকাশিত হয়। পাঠকসংখ্যা ৫০ হাজার ছাড়িয়ে যায়।" },
  { year: "২০২৬", icon: Award, title: "প্রথম ফিজিক্যাল বই", desc: "\"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" — প্রথম মুদ্রিত কাব্যগ্রন্থ প্রকাশিত হয়। রকমারিতে পাওয়া যাচ্ছে।" },
];

const stats = [
  { value: "৫+", label: "প্রকাশিত বই", icon: BookOpen },
  { value: "৫০K+", label: "পাঠক", icon: Users },
  { value: "১০+", label: "বছরের লেখালেখি", icon: Calendar },
  { value: "১০০+", label: "কবিতা ও গদ্য", icon: PenLine },
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
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ background: "#060E1A", minHeight: "100vh", overflowX: "hidden" }}>
      <Seo
        title="পরিচিতি | মাহবুব সরদার সবুজ"
        description="লেখক মাহবুব সরদার সবুজের পরিচিতি, সাহিত্যচর্চা, বই, এবং সৃজনশীল যাত্রা সম্পর্কে জানুন।"
        path="/about"
        keywords="মাহবুব সরদার সবুজ পরিচিতি, Mahbub Sardar Sabuj biography, বাংলা সাহিত্য লেখক"
      />
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          paddingTop: 80,
        }}
      >
        {/* Clean dark background with subtle grid */}
        <div style={{
          position: "absolute", inset: 0,
          background: "#060E1A",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(201,168,76,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 60%, rgba(6,14,26,1) 100%)",
        }} />

        {/* Gold glow */}
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
          style={{
            position: "absolute", top: "20%", right: "10%",
            width: "40vw", height: "40vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1100, margin: "0 auto", padding: "4rem 2rem" }}>
          <div className="about-hero-grid">
            {/* Left text */}
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
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  fontWeight: 700, lineHeight: 1.15,
                  color: "#FAF6EF", margin: "0 0 0.3rem",
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
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  fontWeight: 700, lineHeight: 1.15,
                  background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text", margin: "0 0 2rem",
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
                  fontSize: "1.05rem", color: "rgba(250,246,239,0.6)",
                  lineHeight: 1.9, maxWidth: 480, margin: "0 0 2.5rem",
                }}
              >
                বাংলা সাহিত্যের একজন নিবেদিতপ্রাণ লেখক ও কবি। ভালোবাসা, বিচ্ছেদ, জীবনসংগ্রাম ও মানবিক অনুভূতিকে সহজ অথচ আবেগঘন ভাষায় প্রকাশ করেন।
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                style={{ display: "flex", gap: 10, flexWrap: "nowrap", flexDirection: "row", alignItems: "center" }}
              >
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 14px",
                  background: "rgba(201,168,76,0.08)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: 6, whiteSpace: "nowrap",
                }}>
                  <MapPin size={14} color="#C9A84C" />
                  <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.8rem", color: "rgba(250,246,239,0.7)" }}>কুমিল্লা, বাংলাদেশ</span>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 14px",
                  background: "rgba(201,168,76,0.08)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: 6, whiteSpace: "nowrap",
                }}>
                  <Globe size={14} color="#C9A84C" />
                  <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.8rem", color: "rgba(250,246,239,0.7)" }}>বর্তমান অবস্থান: সৌদি আরব</span>
                </div>
              </motion.div>
            </div>

            {/* Right portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="about-hero-portrait"
            >
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", top: -16, right: -16,
                  width: "70%", height: "70%",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: 8, pointerEvents: "none",
                }} />
                <div style={{
                  borderRadius: 12, overflow: "hidden",
                  boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.15)",
                  position: "relative",
                }}>
                  <img
                    src={PROFILE_2}
                    alt="মাহবুব সরদার সবুজ"
                    style={{ width: "100%", display: "block", filter: "contrast(1.05) saturate(0.9)" }}
                    className="about-portrait-img"
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, transparent 60%, rgba(6,14,26,0.7) 100%)",
                  }} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{
            position: "absolute", bottom: 32, left: "50%",
            transform: "translateX(-50%)", zIndex: 3,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}
        >
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: "rgba(250,246,239,0.25)", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 36, background: "linear-gradient(to bottom, rgba(201,168,76,0.5), transparent)" }} />
        </motion.div>
      </section>



      {/* ══ BIO ═══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "7rem 2rem", background: "#060E1A", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(201,168,76,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px", pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div className="bio-grid">
            {/* Left: image */}
            <FadeUp>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", bottom: -20, left: -20,
                  width: "50%", height: "50%",
                  border: "1px solid rgba(201,168,76,0.15)", borderRadius: 8,
                  pointerEvents: "none",
                }} />
                <div style={{
                  borderRadius: 12, overflow: "hidden",
                  boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
                  position: "relative",
                }}>
                  <img
                    src={PROFILE_1}
                    alt="মাহবুব সরদার সবুজ"
                    style={{ width: "100%", display: "block", filter: "contrast(1.05) saturate(0.85)" }}
                    className="bio-img"
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, transparent 60%, rgba(6,14,26,0.6) 100%)",
                  }} />
                </div>
                {/* Floating book */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute", bottom: -30, right: -20,
                    background: "rgba(201,168,76,0.07)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    borderRadius: 12, padding: "12px 16px",
                    display: "flex", alignItems: "center", gap: 12,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
                  }}
                  className="bio-floating-card"
                >
                  <img src={BOOK_COVER} alt="বই" style={{ width: 36, height: 50, objectFit: "cover", borderRadius: 4 }} />
                  <div>
                    <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.65rem", color: "#C9A84C", marginBottom: 3 }}>সর্বশেষ বই</div>
                    <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.75rem", color: "#FAF6EF", fontWeight: 600, maxWidth: 110, lineHeight: 1.4 }}>দুঃখবিলাস</div>
                  </div>
                </motion.div>
              </div>
            </FadeUp>

            {/* Right: text */}
            <div>
              <FadeUp delay={0.15}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "1.5rem" }}>
                  <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.68rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A84C" }}>পরিচয়</span>
                </div>
                <h2 style={{
                  fontFamily: "'Tiro Bangla', serif",
                  fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                  fontWeight: 700, color: "#FAF6EF",
                  lineHeight: 1.3, margin: "0 0 1.5rem",
                }}>
                  কলমের মানুষ,<br />
                  <span style={{
                    background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>মানুষের কলম</span>
                </h2>
              </FadeUp>

              <FadeUp delay={0.25}>
                <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "1rem", color: "rgba(250,246,239,0.6)", lineHeight: 1.95, margin: "0 0 1.2rem" }}>
                  মাহবুব সরদার সবুজ একজন বাংলা ভাষার লেখক ও কবি, যিনি ভালোবাসা, বিচ্ছেদ, জীবনসংগ্রাম, স্মৃতি, এবং মানবিক অনুভূতিকে সহজ অথচ আবেগঘন ভাষায় প্রকাশ করে পাঠকের কাছে পরিচিত হয়েছেন।
                </p>
                <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "1rem", color: "rgba(250,246,239,0.5)", lineHeight: 1.95, margin: "0 0 1.2rem" }}>
                  তিনি কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়িতে জন্মগ্রহণ করেন। কর্মসূত্রে সৌদি আরবে অবস্থান করলেও বাংলা ভাষা, সাহিত্য, এবং পাঠকের সঙ্গে তাঁর সম্পর্ক অটুট রয়েছে।
                </p>
                <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "1rem", color: "rgba(250,246,239,0.45)", lineHeight: 1.95, margin: "0 0 2.5rem" }}>
                  লেখালেখি তাঁর কাছে শুধু শখ নয়; এটি আত্মপ্রকাশ, সংবেদনশীল অভিজ্ঞতার প্রকাশ, এবং পাঠকের সঙ্গে মানসিক সংযোগ তৈরির এক অনন্য মাধ্যম।
                </p>
              </FadeUp>

              <FadeUp delay={0.35}>
                <Link href="/ebooks">
                  <motion.span
                    whileHover={{ scale: 1.03, x: 4 }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 10,
                      color: "#C9A84C",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.9rem", fontWeight: 600,
                      textDecoration: "none", cursor: "pointer",
                      letterSpacing: "0.05em",
                    }}
                  >
                    বই সংগ্রহ দেখুন
                    <ArrowRight size={16} />
                  </motion.span>
                </Link>
              </FadeUp>
            </div>
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

          {/* Timeline items */}
          <div style={{ position: "relative" }}>
            {/* Vertical line */}
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
                    {/* Left content */}
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

                    {/* Center dot */}
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

                    {/* Right content */}
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

        .about-hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 5rem;
          align-items: center;
        }
        .about-portrait-img { height: 520px; object-fit: cover; }
        .bio-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 5rem;
          align-items: center;
        }
        .bio-img { height: 480px; object-fit: cover; }
        .stats-row { grid-template-columns: repeat(4, 1fr); }

        @media (max-width: 1024px) {
          .about-hero-grid { grid-template-columns: 1fr; gap: 3rem; }
          .about-hero-portrait { display: flex; justify-content: center; }
          .about-portrait-img { height: 380px; }
          .bio-grid { grid-template-columns: 1fr; gap: 3rem; }
          .bio-img { height: 340px; }
          .bio-floating-card { display: none; }
          .timeline-line { display: none; }
          .timeline-item { grid-template-columns: 1fr !important; }
          .timeline-spacer { display: none !important; }
          .timeline-item > div:nth-child(2) { justify-content: flex-start; }
        }
        @media (max-width: 768px) {
          .stats-row { grid-template-columns: repeat(2, 1fr) !important; }
          .about-portrait-img { height: 300px; }
        }
      `}</style>
    </div>
  );
}
