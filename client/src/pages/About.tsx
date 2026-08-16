/*
 * About Page — পরিচিতি
 * Design: World-class premium literary author profile
 * Font: AdorshoLipi throughout
 * Palette: Deep Navy #060E1A, Rich Gold #C9A84C, Ivory #FAF6EF
 */
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  MapPin, BookOpen, PenLine, Award, Quote,
  ArrowRight, Calendar, Feather, Globe, Heart, BadgeCheck, LibraryBig, Sparkles
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";
import FAQSection from "@/components/FAQSection";
import { FREE_EBOOKS, PRINTED_BOOKS, bookActionHref, bookActionLabel } from "@/data/bookCatalog";

const PROFILE_1 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";
const BOOK_COVER = "/images/book-cover-20260328.jpg";

const AL = "'AdorshoLipi', sans-serif";

const timeline = [
  { year: "শৈশব", icon: MapPin, title: "কুমিল্লার মাটিতে জন্ম", desc: "কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামে জন্মগ্রহণ করেন।" },
  { year: "২০২৩", icon: BookOpen, title: "ই-বুকের শুরু", desc: "‘চাঁদফুল’ ও ‘সময়ের গহ্বরে’ দিয়ে অনলাইন পাঠকের কাছে তাঁর প্রথম বইয়ের যাত্রা।" },
  { year: "২০২৪", icon: Feather, title: "অনুভূতির আরও পাঠ", desc: "‘স্মৃতির বসন্তে তুমি’সহ কবিতা ও গদ্যের অনলাইন পাঠভুবন আরও সমৃদ্ধ হয়।" },
  { year: "বর্তমান", icon: Award, title: "মুদ্রিত বইয়ের নতুন অধ্যায়", desc: "‘অভিমান’ ও ‘আমি বিচ্ছেদকে বলি দুঃখবিলাস’ এখন পাঠকের জন্য সরাসরি অর্ডার করা যায়।" },
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
  const featuredBook = PRINTED_BOOKS.find((book) => book.isFeatured) ?? PRINTED_BOOKS[0]!;
  const totalBookCount = PRINTED_BOOKS.length + FREE_EBOOKS.length;

  return (
    <div style={{ background: "#060E1A", minHeight: "100vh", overflowX: "hidden" }}>
      <Seo
        title="মাহবুব সরদার সবুজ পরিচিতি | বাংলাদেশি কবি ও লেখক"
        description="বাংলাদেশের জনপ্রিয় কবি ও লেখক মাহবুব সরদার সবুজের পরিচিতি, সাহিত্যজীবন, প্রকাশিত বই ও সৃজনশীল যাত্রা সম্পর্কে জানুন। ভালোবাসা ও বিচ্ছেদের কবিতার রচয়িতা।"
        path="/about"
        keywords="মাহবুব সরদার সবুজ পরিচিতি, Mahbub Sardar Sabuj biography, বাংলা সাহিত্য লেখক, বাংলাদেশি কবি, বাংলা কবিতার রচয়িতা, বাংলাদেশের লেখক পরিচিতি"
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
          paddingTop: "var(--site-nav-offset, 98px)",
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
                style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: "1.25rem" }}
              >
                <div style={{ width: 34, height: 1, background: "#C9A84C" }} />
                <span style={{
                  fontFamily: AL,
                  fontSize: "0.74rem", letterSpacing: "0.18em",
                  textTransform: "uppercase", color: "#C9A84C", fontWeight: 800,
                }}>Official Author Profile</span>
                <span className="about-verified-chip"><BadgeCheck size={14} /> যাচাইকৃত পরিচিতি</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: "'AdorshoLipi', sans-serif",
                  fontSize: "clamp(2.8rem, 6.5vw, 5.5rem)",
                  fontWeight: 700, lineHeight: 1.08,
                  background: "linear-gradient(135deg, #C9A84C 0%, #E8C97A 40%, #F5E4A0 60%, #C9A84C 100%)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text", margin: "0 0 1.5rem",
                  letterSpacing: "-0.02em",
                  textShadow: "none",
                  filter: "drop-shadow(0 4px 20px rgba(201,168,76,0.3))",
                }}
              >
                মাহবুব সরদার সবুজ
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                style={{
                  fontFamily: AL,
                  fontSize: "1.05rem", color: "rgba(250,246,239,0.65)",
                  lineHeight: 1.9, maxWidth: 480, margin: "0 0 2rem",
                }}
              >
                বাংলা সাহিত্যের একজন নিবেদিতপ্রাণ লেখক ও কবি — যাঁর কলমে ধরা দেয় জীবনের অদেখা রূপ, মানুষের অনাবিষ্কৃত অনুভূতি আর সময়ের নির্মম সত্য।
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.78 }}
                className="about-hero-facts"
              >
                <div><span>{PRINTED_BOOKS.length}</span> মুদ্রিত বই</div>
                <div><span>{FREE_EBOOKS.length}</span> মুক্ত ই-বুক</div>
                <div><span>{totalBookCount}</span> বইয়ের পাঠভুবন</div>
              </motion.div>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                style={{ display: "flex", gap: 14, flexWrap: "wrap" }}
              >
                <a href={bookActionHref(featuredBook)} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  <motion.span
                    whileHover={{ scale: 1.03, boxShadow: "0 16px 40px rgba(201,168,76,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "13px 22px", borderRadius: 999,
                      background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                      color: "#060E1A", fontFamily: AL,
                      fontSize: "0.95rem", fontWeight: 800, cursor: "pointer",
                      textDecoration: "none", boxShadow: "0 8px 24px rgba(201,168,76,0.25)",
                    }}
                  >
                    <BookOpen size={15} />
                    {bookActionLabel(featuredBook)}
                  </motion.span>
                </a>
                <Link href="/writings">
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "13px 22px", borderRadius: 999,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(201,168,76,0.3)",
                      color: "rgba(250,246,239,0.86)",
                      fontFamily: AL,
                      fontSize: "0.95rem", fontWeight: 700, cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    <PenLine size={15} />
                    লেখালেখি পড়ুন
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
                  alt="মাহবুব সরদার সবুজ - বাংলা কবি ও লেখক - অফিসিয়াল পরিচিতি পৃষ্ঠা"
                  className="about-portrait-img"
                  onError={(e) => { (e.target as HTMLImageElement).src = BOOK_COVER; }}
                  style={{ width: "100%", display: "block", filter: "contrast(1.05) saturate(0.9)" }}
                  loading="lazy"
                  decoding="async"
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
                    fontFamily: AL,
                    fontSize: "0.65rem", letterSpacing: "0.2em",
                    textTransform: "uppercase", color: "#C9A84C", marginBottom: 4,
                  }}>লেখক ও কবি</div>
                  <div style={{
                    fontFamily: AL,
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
                <img src={featuredBook.cover} alt={`${featuredBook.title} বইয়ের প্রচ্ছদ`} style={{ width: 36, height: 50, objectFit: "cover", borderRadius: 4 }} loading="lazy" decoding="async" />
                <div>
                  <div style={{ fontFamily: AL, fontSize: "0.62rem", color: "#C9A84C", marginBottom: 3 }}>নির্বাচিত বই</div>
                  <div style={{ fontFamily: AL, fontSize: "0.75rem", color: "#FAF6EF", fontWeight: 700, maxWidth: 132, lineHeight: 1.4 }}>{featuredBook.title}</div>
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
          <span style={{ fontFamily: AL, color: "rgba(250,246,239,0.2)", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 36, background: "linear-gradient(to bottom, rgba(201,168,76,0.5), transparent)" }} />
        </motion.div>
      </section>

      <section aria-label="লেখকের বই ও পাঠের পথ" style={{ padding: "clamp(3.5rem, 7vw, 6rem) 2rem", background: "linear-gradient(180deg, #060E1A 0%, #0A1628 100%)", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", top: -280, left: -180, background: "radial-gradient(circle, rgba(201,168,76,0.12), transparent 68%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeUp>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.4rem" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#C9A84C", fontFamily: AL, fontSize: "0.76rem", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}><Sparkles size={14} /> প্রকাশনা ও পাঠ</div>
                <h2 style={{ color: "#FAF6EF", fontFamily: AL, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", margin: "0.42rem 0 0", lineHeight: 1.25 }}>লেখকের বই, পাঠকের জন্য পথ</h2>
              </div>
              <Link href="/ebooks" style={{ color: "#E8C97A", fontFamily: AL, fontWeight: 900, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7, borderBottom: "1px solid rgba(201,168,76,0.45)", paddingBottom: 3 }}>সব বই দেখুন <ArrowRight size={16} /></Link>
            </div>
          </FadeUp>

          <div className="about-reading-grid">
            <FadeUp delay={0.08}>
              <div style={{ borderRadius: 26, padding: "clamp(1rem, 2.8vw, 1.4rem)", background: "linear-gradient(135deg, rgba(201,168,76,0.13), rgba(16,38,78,0.66) 58%, rgba(6,14,26,0.94))", border: "1px solid rgba(201,168,76,0.25)", boxShadow: "0 22px 50px rgba(0,0,0,0.22)" }}>
                <div style={{ color: "rgba(250,246,239,0.72)", fontFamily: AL, fontSize: "0.9rem", marginBottom: "0.95rem" }}><BadgeCheck size={15} style={{ display: "inline", verticalAlign: "-2px", color: "#E8C97A", marginRight: 6 }} />মুদ্রিত বইয়ের verified catalogue</div>
                <div className="about-printed-books">
                  {PRINTED_BOOKS.map((book) => (
                    <article key={book.id} style={{ display: "grid", gridTemplateColumns: "70px minmax(0, 1fr)", gap: "0.85rem", alignItems: "center", padding: "0.78rem", borderRadius: 18, background: "rgba(255,255,255,0.075)", border: `1px solid ${book.accentColor}55` }}>
                      <img src={book.cover} alt={`${book.title} বইয়ের প্রচ্ছদ`} loading="lazy" decoding="async" style={{ width: 70, height: 102, objectFit: "cover", borderRadius: 10, boxShadow: "0 10px 24px rgba(0,0,0,0.35)" }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: book.accentColor, fontFamily: AL, fontSize: "0.71rem", fontWeight: 900 }}>{book.subtitle}</div>
                        <h3 style={{ color: "#FAF6EF", fontFamily: AL, fontSize: "clamp(1rem, 2vw, 1.2rem)", lineHeight: 1.3, margin: "0.22rem 0" }}>{book.title}</h3>
                        <p style={{ color: "rgba(250,246,239,0.62)", fontFamily: AL, fontSize: "0.79rem", lineHeight: 1.52, margin: "0 0 0.55rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{book.description}</p>
                        <a href={bookActionHref(book)} target="_blank" rel="noreferrer" className="about-reading-link" style={{ color: "#071426", background: book.accentColor, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, padding: "0.43rem 0.65rem", borderRadius: 999, fontFamily: AL, fontSize: "0.77rem", fontWeight: 900 }}>{bookActionLabel(book)} <ArrowRight size={13} /></a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.16}>
              <aside style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRadius: 26, padding: "clamp(1.15rem, 3vw, 1.55rem)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
                <div>
                  <div style={{ color: "#E8C97A", fontFamily: AL, fontWeight: 900, fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>পাঠকের জন্য</div>
                  <h3 style={{ color: "#FAF6EF", fontFamily: AL, fontSize: "clamp(1.4rem, 3vw, 1.9rem)", lineHeight: 1.25, margin: "0.38rem 0 1rem" }}>একজন লেখককে জানার তিনটি পথ</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.72rem" }}>
                    {[
                      { icon: BookOpen, title: "মুদ্রিত বই সংগ্রহ", text: "নির্বাচিত দুইটি বই সরাসরি অর্ডার করুন", href: "/ebooks" },
                      { icon: LibraryBig, title: "মুক্ত ই-বুক পাঠ", text: `${FREE_EBOOKS.length}টি বই অনলাইনে পড়ুন`, href: "/ebooks" },
                      { icon: PenLine, title: "লেখালেখির ভুবন", text: "কবিতা ও গদ্যের নির্বাচিত পাঠ", href: "/writings" },
                    ].map((path) => {
                      const PathIcon = path.icon;
                      return <Link key={path.title} href={path.href} className="about-path-link"><span><PathIcon size={18} color="#E8C97A" /></span><span><b>{path.title}</b><small>{path.text}</small></span><ArrowRight size={16} color="#C9A84C" /></Link>;
                    })}
                  </div>
                </div>
                <div style={{ marginTop: "1rem", paddingTop: "0.9rem", borderTop: "1px solid rgba(201,168,76,0.16)", color: "rgba(250,246,239,0.62)", fontFamily: AL, fontSize: "0.84rem", lineHeight: 1.55 }}>এই পাতার বই ও পাঠের তথ্য লেখকের অফিসিয়াল catalogue থেকে নেওয়া হয়েছে।</div>
              </aside>
            </FadeUp>
          </div>
        </div>
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
                <span style={{ fontFamily: AL, fontSize: "0.72rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#C9A84C" }}>পরিচয়</span>
                <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
              </div>
              <h2 style={{
                fontFamily: AL,
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
                border: "1px solid rgba(201,168,76,0.14)",
                borderRadius: 20, padding: "2.8rem",
                height: "100%",
                boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
                position: "relative", overflow: "hidden",
              }}>
                {/* Subtle top glow */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 1,
                  background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)",
                }} />

                {/* উদ্ধৃতি চিহ্ন */}
                <div style={{
                  fontFamily: "Georgia, serif", fontSize: "5rem",
                  color: "rgba(201,168,76,0.12)", lineHeight: 1,
                  marginBottom: "-1.5rem", marginLeft: "-0.5rem",
                  userSelect: "none",
                }}>"</div>

                <p style={{ fontFamily: AL, fontSize: "1.08rem", color: "rgba(250,246,239,0.82)", lineHeight: 2.1, margin: "0 0 1.5rem" }}>
                  মাহবুব সরদার সবুজ — এক নাম, যার কলমে ধরা দেয় জীবনের অদেখা রূপ, মানুষের অনাবিষ্কৃত অনুভূতি আর সময়ের নির্মম সত্য।
                </p>
                <p style={{ fontFamily: AL, fontSize: "1.05rem", color: "rgba(250,246,239,0.72)", lineHeight: 2.1, margin: "0 0 1.5rem" }}>
                  কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়িতে জন্মগ্রহণ করেছেন তিনি। পিতা ফানাউল্লাহ সরদার ও মাতা আহামালী বিনতে মাসুরার স্নেহে বেড়ে ওঠা এই লেখক শৈশব থেকেই শব্দকে বেছে নিয়েছেন আত্মার আশ্রয় হিসেবে।
                </p>
                <p style={{ fontFamily: AL, fontSize: "1.05rem", color: "rgba(250,246,239,0.65)", lineHeight: 2.1, margin: "0 0 1.5rem" }}>
                  তাঁর লেখায় আছে ন্যায় ও সত্যের দৃঢ় উচ্চারণ, আছে প্রেম ও মানবিকতার মমত্ব, আছে সমাজ ও জীবনের বাস্তবতার স্বতঃস্ফূর্ত প্রকাশ। সরল অথচ হৃদয়গ্রাহী ভাষায় তিনি নির্মাণ করেন এমনসব লেখা, যা পাঠকের মনে শুধু দাগ কাটে না, বরং ভেতর থেকে আলোড়িত করে।
                </p>
                <p style={{ fontFamily: AL, fontSize: "1.05rem", color: "rgba(250,246,239,0.58)", lineHeight: 2.1, margin: 0 }}>
                  মাহবুব সরদার সবুজের কলম কেবল লেখা নয় — এ যেন মানুষের আত্মাকে ছুঁয়ে দেওয়া এক সেতু, যা ভাঙা মনকে জাগায়, অবসন্ন মানুষকে প্রেরণা দেয়, আর পথহারা মানুষকে দেখায় ইতিবাচক জীবনের পথচিহ্ন।
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {[
                  { icon: MapPin, label: "জন্মস্থান", value: "আরিফপুর, বরুড়া, কুমিল্লা" },
                  { icon: Globe, label: "বর্তমান অবস্থান", value: "সৌদি আরব" },
                  { icon: BookOpen, label: "বইয়ের পাঠভুবন", value: `${totalBookCount}টি বই (২টি মুদ্রিত + ৪টি ই-বুক)` },
                  { icon: Calendar, label: "মুদ্রিত বই", value: "অভিমান ও আমি বিচ্ছেদকে বলি দুঃখবিলাস" },
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
                        borderRadius: 12,
                        transition: "border-color 0.3s, transform 0.2s",
                      }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                        background: "rgba(201,168,76,0.1)",
                        border: "1px solid rgba(201,168,76,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon size={16} color="#C9A84C" />
                      </div>
                      <div>
                        <div style={{ fontFamily: AL, fontSize: "0.65rem", color: "rgba(201,168,76,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{item.label}</div>
                        <div style={{ fontFamily: AL, fontSize: "0.95rem", color: "#FAF6EF", fontWeight: 600 }}>{item.value}</div>
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
                <span style={{ fontFamily: AL, fontSize: "0.72rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#C9A84C" }}>সাহিত্যিক যাত্রা</span>
                <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
              </div>
              <h2 style={{
                fontFamily: AL,
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
                          <div style={{ fontFamily: AL, fontSize: "0.72rem", color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 8 }}>{item.year}</div>
                          <h3 style={{ fontFamily: AL, fontSize: "1rem", fontWeight: 700, color: "#FAF6EF", margin: "0 0 8px" }}>{item.title}</h3>
                          <p style={{ fontFamily: AL, fontSize: "0.88rem", color: "rgba(250,246,239,0.5)", lineHeight: 1.8, margin: 0 }}>{item.desc}</p>
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
                          <div style={{ fontFamily: AL, fontSize: "0.72rem", color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 8 }}>{item.year}</div>
                          <h3 style={{ fontFamily: AL, fontSize: "1rem", fontWeight: 700, color: "#FAF6EF", margin: "0 0 8px" }}>{item.title}</h3>
                          <p style={{ fontFamily: AL, fontSize: "0.88rem", color: "rgba(250,246,239,0.5)", lineHeight: 1.8, margin: 0 }}>{item.desc}</p>
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
                <span style={{ fontFamily: AL, fontSize: "0.72rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#C9A84C" }}>দর্শন ও বিশ্বাস</span>
                <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
              </div>
              <h2 style={{
                fontFamily: AL,
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
                    borderRadius: 14, padding: "2rem 2.5rem",
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
                    fontFamily: AL,
                    fontSize: "clamp(1rem, 2vw, 1.18rem)",
                    fontStyle: "italic",
                    color: "rgba(250,246,239,0.82)",
                    lineHeight: 1.9, margin: 0,
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
              fontFamily: AL,
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700, color: "#FAF6EF",
              lineHeight: 1.3, margin: "0 0 1.2rem",
            }}>
              লেখকের সাথে যুক্ত থাকুন
            </h2>
            <p style={{
              fontFamily: AL,
              fontSize: "1.05rem", color: "rgba(250,246,239,0.5)",
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
                    color: "#060E1A", fontFamily: AL,
                    fontSize: "0.98rem", fontWeight: 700, cursor: "pointer",
                    textDecoration: "none", boxShadow: "0 8px 24px rgba(201,168,76,0.3)",
                  }}
                >
                  যোগাযোগ করুন
                  <ArrowRight size={16} />
                </motion.span>
              </Link>
              <Link href="/writings">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    padding: "14px 30px", borderRadius: 4,
                    background: "transparent",
                    border: "1px solid rgba(201,168,76,0.3)",
                    color: "rgba(250,246,239,0.75)",
                    fontFamily: AL,
                    fontSize: "0.98rem", fontWeight: 600, cursor: "pointer",
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

      {/* FAQ Section — SEO Rich Snippets */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 1rem" }}>
        <FAQSection
          title="মাহবুব সরদার সবুজ সম্পর্কে সাধারণ প্রশ্ন"
          description="লেখক মাহবুব সরদার সবুজ সম্পর্কে পাঠকদের জিজ্ঞাসার উত্তর"
          faqs={[
            { question: "মাহবুব সরদার সবুজ কোথায় জন্মগ্রহণ করেন?", answer: "মাহবুব সরদার সবুজ কুমিল্লা জেলার বরুড়া উপজেলার আরিফপুর গ্রামে জন্মগ্রহণ করেন।" },
            { question: "মাহবুব সরদার সবুজের প্রথম বইয়ের নাম কী?", answer: "মাহবুব সরদার সবুজের প্রথম মুদ্রিত বইয়ের নাম 'আমি বিচ্ছেদকে বলি দুঃখবিলাস', যা ২০২৬ সালে প্রকাশিত হয়েছে। বইটি রকমারিতে পাওয়া যাচ্ছে।" },
            { question: "মাহবুব সরদার সবুজের বই কোথায় পাওয়া যাবে?", answer: "মাহবুব সরদার সবুজের বই রকমারিতে অর্ডার করা যাবে। এছাড়া তাঁর অফিশিয়াল ওয়েবসাইট mahbubsardarsabuj.com-এ বিনামূল্যে ই-বুক পড়া যাবে।" },
            { question: "মাহবুব সরদার সবুজ কোন ধরনের লেখা লেখেন?", answer: "মাহবুব সরদার সবুজ মূলত ভালোবাসা, বিচ্ছেদ, জীবনদর্শন এবং মানবিক অনুভূতি নিয়ে বাংলা কবিতা এবং ছোট লেখা লেখেন।" },
            { question: "মাহবুব সরদার সবুজের সাথে যোগাযোগ করা যাবে কীভাবে?", answer: "মাহবুব সরদার সবুজের সাথে mahbubsardarsabuj.com/contact পেজের মাধ্যমে, অথবা Facebook, Instagram বা YouTube-এ যোগাযোগ করা যাবে।" },
          ]}
        />
      </div>

      {/* AdSense Ad — পরিচিতি পেজের নিচে */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <AdSenseAd adSlot={AD_SLOTS.ABOUT_BOTTOM} adFormat="auto" fullWidthResponsive={true} />
      </div>
      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Noto+Sans+Bengali:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @import url('https://cdn.msar.me/fonts/adorsho-lipi/font.css');
        * { box-sizing: border-box; }

        /* ── Hero grid ── */
        .about-hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: clamp(3rem, 6vw, 7rem);
          align-items: center;
        }
        .about-portrait-wrapper {
          position: relative;
        }
        .about-verified-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.32rem 0.55rem;
          color: #F6DE97;
          background: rgba(201,168,76,0.10);
          border: 1px solid rgba(201,168,76,0.28);
          border-radius: 999px;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.02em;
        }
        .about-hero-facts {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
          margin: -0.7rem 0 1.55rem;
        }
        .about-hero-facts > div {
          padding: 0.46rem 0.68rem;
          border-radius: 12px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.09);
          color: rgba(250,246,239,0.7);
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.78rem;
          line-height: 1;
        }
        .about-hero-facts span {
          color: #F6DE97;
          font-weight: 900;
          font-size: 1.06rem;
          margin-right: 0.18rem;
        }
        .about-portrait-img {
          height: clamp(520px, 58vw, 700px);
          object-fit: cover;
          object-position: center top;
        }

        /* ── Reading pathways ── */
        .about-reading-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.28fr) minmax(290px, 0.72fr);
          gap: clamp(1rem, 3vw, 1.45rem);
          align-items: stretch;
        }
        .about-printed-books {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.8rem;
        }
        .about-reading-link,
        .about-path-link {
          transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 160ms cubic-bezier(0.23, 1, 0.32, 1), background 160ms cubic-bezier(0.23, 1, 0.32, 1);
        }
        .about-reading-link:hover,
        .about-path-link:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(0,0,0,0.26); }
        .about-reading-link:active,
        .about-path-link:active { transform: scale(0.97); }
        .about-path-link {
          display: grid;
          grid-template-columns: 34px minmax(0, 1fr) auto;
          align-items: center;
          gap: 0.72rem;
          padding: 0.74rem;
          border-radius: 15px;
          background: rgba(6,14,26,0.48);
          border: 1px solid rgba(201,168,76,0.15);
          color: #FAF6EF;
          text-decoration: none;
          font-family: 'AdorshoLipi', sans-serif;
        }
        .about-path-link > span:first-child {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: rgba(201,168,76,0.1);
        }
        .about-path-link b { display: block; font-size: 0.9rem; line-height: 1.25; }
        .about-path-link small { display: block; color: rgba(250,246,239,0.6); font-size: 0.75rem; line-height: 1.35; margin-top: 0.1rem; }

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
          .about-reading-grid { grid-template-columns: 1fr; }
          .timeline-line { display: none; }
          .timeline-item { grid-template-columns: 1fr !important; }
          .timeline-spacer { display: none !important; }
          .timeline-item > div:nth-child(2) { justify-content: flex-start; }
        }
        @media (max-width: 768px) {
          .about-portrait-img { height: 340px; }
          .hero-floating-card { display: none; }
          .about-hero-facts { gap: 0.42rem; }
          .about-hero-facts > div { font-size: 0.74rem; }
          .about-printed-books { grid-template-columns: 1fr; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
        }
      `}</style>
    </div>
  );
}
