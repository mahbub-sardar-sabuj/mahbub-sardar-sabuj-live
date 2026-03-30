/**
 * সংবাদ পেজ — Professional News Portal
 * Design: Premium literary news portal with Navy/Gold theme
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, Tag, Search, ChevronRight, BookOpen, Mic2, Award, Calendar, ExternalLink, X } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categoryColor: string;
  date: string;
  readTime: string;
  featured: boolean;
  tag: string;
  link?: string;
}

const newsData: NewsItem[] = [
  {
    id: 1,
    title: "\"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" — নতুন বই প্রকাশিত হচ্ছে ২০২৬ সালে",
    excerpt: "মাহবুব সরদার সবুজের নতুন কাব্যগ্রন্থ ২০২৬ সালে প্রকাশিত হতে চলেছে। বইটিতে বিচ্ছেদ, প্রেম ও জীবনদর্শনের গভীর অনুভূতি শব্দে বাঁধা হয়েছে।",
    content: "মাহবুব সরদার সবুজের বহুল প্রতীক্ষিত কাব্যগ্রন্থ \"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" ২০২৬ সালে প্রকাশিত হতে চলেছে। বইটিতে লেখকের জীবনের বিভিন্ন পর্যায়ের অনুভূতি — বিচ্ছেদের বেদনা, প্রেমের মাধুর্য এবং জীবনদর্শনের গভীরতা — কাব্যিক ভাষায় উপস্থাপিত হয়েছে। পাঠকদের মধ্যে ইতিমধ্যেই এই বইটি নিয়ে ব্যাপক আগ্রহ তৈরি হয়েছে।",
    category: "প্রকাশনা",
    categoryColor: "#C9A84C",
    date: "মার্চ ২০২৬",
    readTime: "৩ মিনিট",
    featured: true,
    tag: "নতুন বই",
  },
  {
    id: 2,
    title: "ওয়েবসাইটে যুক্ত হলো সরদার ডিজাইন স্টুডিও",
    excerpt: "পাঠকরা এখন নিজেদের পছন্দের কবিতা বা উক্তি দিয়ে সুন্দর ডিজাইন কার্ড তৈরি করতে পারবেন এবং সোশ্যাল মিডিয়ায় শেয়ার করতে পারবেন।",
    content: "মাহবুব সরদার সবুজের ওয়েবসাইটে নতুন একটি ফিচার যোগ হয়েছে — সরদার ডিজাইন স্টুডিও। এই টুলটি ব্যবহার করে পাঠকরা তাদের পছন্দের কবিতা বা উক্তি দিয়ে সুন্দর ডিজাইন কার্ড তৈরি করতে পারবেন। ১৬টিরও বেশি থিম, ড্র্যাগযোগ্য টেক্সট লেয়ার, ফটো ফিল্টার এবং হাই-রেজ PNG ডাউনলোডের সুবিধা রয়েছে।",
    category: "ওয়েবসাইট",
    categoryColor: "#4A90D9",
    date: "মার্চ ২০২৬",
    readTime: "২ মিনিট",
    featured: true,
    tag: "আপডেট",
    link: "/editor",
  },
  {
    id: 3,
    title: "তিনটি ই-বুক এখন বিনামূল্যে পড়া যাচ্ছে",
    excerpt: "স্মৃতির বসন্তে তুমি, চাঁদফুল এবং সময়ের গহ্বরে — এই তিনটি ই-বুক এখন ওয়েবসাইটে বিনামূল্যে পড়া যাচ্ছে।",
    content: "মাহবুব সরদার সবুজের তিনটি জনপ্রিয় ই-বুক — \"স্মৃতির বসন্তে তুমি\", \"চাঁদফুল\" এবং \"সময়ের গহ্বরে\" — এখন ওয়েবসাইটে বিনামূল্যে পড়া যাচ্ছে। পাঠকরা যেকোনো ডিভাইস থেকে সহজেই এই বইগুলো পড়তে পারবেন।",
    category: "ই-বুক",
    categoryColor: "#7B68EE",
    date: "ফেব্রুয়ারি ২০২৬",
    readTime: "২ মিনিট",
    featured: false,
    tag: "ই-বুক",
    link: "/ebooks",
  },
  {
    id: 4,
    title: "ফেসবুকে ৭,০০০+ কবিতা ও লেখার বিশাল সংগ্রহ",
    excerpt: "মাহবুব সরদার সবুজের ফেসবুক পেজে এখন ৭,০০০-এরও বেশি কবিতা ও গল্প সংরক্ষিত আছে, যা পাঠকদের মধ্যে ব্যাপক সাড়া ফেলেছে।",
    content: "মাহবুব সরদার সবুজের ফেসবুক পেজে এখন ৭,০০০-এরও বেশি কবিতা ও গল্প সংরক্ষিত আছে। প্রেম, বিচ্ছেদ, প্রকৃতি, জীবনদর্শন — প্রতিটি অনুভূতি শব্দে বাঁধা। পাঠকদের মধ্যে এই লেখাগুলো ব্যাপক সাড়া ফেলেছে এবং প্রতিদিন হাজার হাজার মানুষ এই লেখাগুলো পড়ছেন।",
    category: "সোশ্যাল মিডিয়া",
    categoryColor: "#1877F2",
    date: "জানুয়ারি ২০২৬",
    readTime: "৩ মিনিট",
    featured: false,
    tag: "ফেসবুক",
    link: "https://www.facebook.com/mahbubsardarsabuj",
  },
  {
    id: 5,
    title: "আবৃত্তি সংগ্রহ — ফেসবুক লাইভ রেকর্ডিং",
    excerpt: "লেখকের ফেসবুক লাইভ আবৃত্তির সংগ্রহ এখন ওয়েবসাইটে দেখা যাচ্ছে। নিজের কণ্ঠে কবিতা পাঠের অনন্য অভিজ্ঞতা নিন।",
    content: "মাহবুব সরদার সবুজের ফেসবুক লাইভ আবৃত্তির সংগ্রহ এখন ওয়েবসাইটে দেখা যাচ্ছে। লেখক নিজের কণ্ঠে তাঁর কবিতা পাঠ করেছেন, যা শ্রোতাদের মধ্যে গভীর আবেগ তৈরি করেছে। এই সংগ্রহটি সাহিত্যপ্রেমীদের জন্য একটি অমূল্য সম্পদ।",
    category: "আবৃত্তি",
    categoryColor: "#E74C3C",
    date: "ডিসেম্বর ২০২৫",
    readTime: "২ মিনিট",
    featured: false,
    tag: "আবৃত্তি",
    link: "/facebook-recitations",
  },
  {
    id: 6,
    title: "নতুন AI চ্যাটবট — লেখক সম্পর্কে যেকোনো প্রশ্ন করুন",
    excerpt: "ওয়েবসাইটে যুক্ত হয়েছে AI চ্যাটবট। লেখক মাহবুব সরদার সবুজ সম্পর্কে যেকোনো প্রশ্নের উত্তর পাবেন তাৎক্ষণিকভাবে।",
    content: "মাহবুব সরদার সবুজের ওয়েবসাইটে একটি AI চ্যাটবট যুক্ত হয়েছে। এই চ্যাটবটটি লেখক সম্পর্কে সম্পূর্ণ সঠিক ও নির্ভুল তথ্য প্রদান করে। পাঠকরা কবিতা, ই-বুক, যোগাযোগ বা ওয়েবসাইট ব্যবহার সংক্রান্ত যেকোনো প্রশ্ন করতে পারবেন।",
    category: "প্রযুক্তি",
    categoryColor: "#27AE60",
    date: "নভেম্বর ২০২৫",
    readTime: "২ মিনিট",
    featured: false,
    tag: "AI",
  },
];

const categories = ["সব", "প্রকাশনা", "ওয়েবসাইট", "ই-বুক", "সোশ্যাল মিডিয়া", "আবৃত্তি", "প্রযুক্তি"];

function FadeIn({ children, delay = 0, direction = "up" }: { children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right" }) {
  const variants = {
    hidden: { opacity: 0, y: direction === "up" ? 30 : 0, x: direction === "left" ? -30 : direction === "right" ? 30 : 0 },
    visible: { opacity: 1, y: 0, x: 0 },
  };
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay, ease: "easeOut" }} variants={variants}>
      {children}
    </motion.div>
  );
}

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState("সব");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const filtered = newsData.filter(item => {
    const matchCat = selectedCategory === "সব" || item.category === selectedCategory;
    const matchSearch = !searchQuery || item.title.includes(searchQuery) || item.excerpt.includes(searchQuery);
    return matchCat && matchSearch;
  });

  const featured = filtered.filter(n => n.featured);
  const regular = filtered.filter(n => !n.featured);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF6EF", fontFamily: "'Noto Sans Bengali', sans-serif" }}>
      <Navbar />

      {/* ── HERO HEADER ── */}
      <section style={{
        background: "linear-gradient(135deg, #0A1628 0%, #0d2040 60%, #0A1628 100%)",
        padding: "8rem 0 5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }} />
        {/* Glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(201,168,76,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 2rem", textAlign: "center" }}>
          <FadeIn direction="up">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: "1.5rem" }}>
              <div style={{ width: 60, height: 1, background: "rgba(201,168,76,0.4)" }} />
              <span style={{ color: "#C9A84C", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>সাম্প্রতিক</span>
              <div style={{ width: 60, height: 1, background: "rgba(201,168,76,0.4)" }} />
            </div>
            <h1 style={{
              fontFamily: "'Tiro Bangla', serif",
              color: "#FAF6EF",
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 400,
              marginBottom: "1.5rem",
              lineHeight: 1.3,
            }}>সংবাদ ও আপডেট</h1>
            <p style={{
              color: "rgba(250,246,239,0.6)",
              fontSize: "1.05rem",
              maxWidth: 560,
              margin: "0 auto 3rem",
              lineHeight: 2,
            }}>লেখক মাহবুব সরদার সবুজের সর্বশেষ খবর, প্রকাশনা ও ওয়েবসাইট আপডেট</p>

            {/* Search bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: 50,
              padding: "12px 20px",
              maxWidth: 480,
              margin: "0 auto",
            }}>
              <Search size={18} color="rgba(201,168,76,0.7)" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="সংবাদ খুঁজুন..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#FAF6EF",
                  fontSize: "0.95rem",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(201,168,76,0.7)", display: "flex" }}>
                  <X size={16} />
                </button>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── TICKER BAR ── */}
      <div style={{
        background: "#C9A84C",
        padding: "10px 0",
        overflow: "hidden",
        position: "relative",
      }}>
        <div style={{
          display: "flex",
          gap: "4rem",
          animation: "ticker 30s linear infinite",
          whiteSpace: "nowrap",
          color: "#0A1628",
          fontWeight: 700,
          fontSize: "0.85rem",
        }}>
          {[...Array(4)].map((_, i) => (
            <span key={i} style={{ display: "flex", gap: "4rem", flexShrink: 0 }}>
              <span>📚 নতুন বই প্রকাশিত হচ্ছে ২০২৬ সালে</span>
              <span>✨ সরদার ডিজাইন স্টুডিও চালু হয়েছে</span>
              <span>📖 তিনটি ই-বুক বিনামূল্যে পড়ুন</span>
              <span>🎙️ আবৃত্তি সংগ্রহ দেখুন</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* ── CATEGORY FILTER ── */}
      <section style={{ background: "#0A1628", padding: "2rem 0", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center" }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 50,
                  border: selectedCategory === cat ? "1px solid #C9A84C" : "1px solid rgba(201,168,76,0.2)",
                  background: selectedCategory === cat ? "linear-gradient(135deg, #C9A84C, #E8C4A0)" : "rgba(201,168,76,0.05)",
                  color: selectedCategory === cat ? "#0A1628" : "rgba(250,246,239,0.7)",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: selectedCategory === cat ? 700 : 400,
                  cursor: "pointer",
                  transition: "all 0.25s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 2rem" }}>

        {/* Featured news */}
        {featured.length > 0 && (
          <div style={{ marginBottom: "4rem" }}>
            <FadeIn direction="up">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem" }}>
                <div style={{ width: 4, height: 24, background: "#C9A84C", borderRadius: 2 }} />
                <h2 style={{ fontFamily: "'Tiro Bangla', serif", color: "#0A1628", fontSize: "1.5rem", fontWeight: 400 }}>প্রধান সংবাদ</h2>
              </div>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: featured.length >= 2 ? "1fr 1fr" : "1fr", gap: "1.5rem" }} className="news-grid">
              {featured.map((item, i) => (
                <FadeIn key={item.id} delay={i * 0.1} direction="up">
                  <motion.div
                    whileHover={{ y: -6, boxShadow: "0 30px 70px rgba(10,22,40,0.15)" }}
                    onClick={() => setSelectedNews(item)}
                    style={{
                      background: "#fff",
                      borderRadius: 20,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: "1px solid rgba(10,22,40,0.08)",
                      boxShadow: "0 8px 30px rgba(10,22,40,0.08)",
                      transition: "all 0.3s",
                      position: "relative",
                    }}
                  >
                    {/* Top accent */}
                    <div style={{ height: 4, background: `linear-gradient(90deg, ${item.categoryColor}, transparent)` }} />
                    {/* Featured badge */}
                    <div style={{
                      position: "absolute", top: 20, right: 20,
                      background: "linear-gradient(135deg, #C9A84C, #E8C4A0)",
                      color: "#0A1628",
                      padding: "4px 12px",
                      borderRadius: 50,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                    }}>প্রধান</div>

                    <div style={{ padding: "2rem" }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: "1.2rem", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{
                          background: item.categoryColor + "18",
                          color: item.categoryColor,
                          padding: "4px 12px",
                          borderRadius: 50,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          border: `1px solid ${item.categoryColor}30`,
                        }}>{item.category}</span>
                        <span style={{ color: "#8A9AAA", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={13} /> {item.date}
                        </span>
                        <span style={{ color: "#8A9AAA", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={13} /> {item.readTime}
                        </span>
                      </div>

                      <h3 style={{
                        fontFamily: "'Tiro Bangla', serif",
                        color: "#0A1628",
                        fontSize: "1.25rem",
                        fontWeight: 400,
                        lineHeight: 1.6,
                        marginBottom: "1rem",
                      }}>{item.title}</h3>

                      <p style={{
                        color: "#5A6A7A",
                        fontSize: "0.9rem",
                        lineHeight: 1.9,
                        marginBottom: "1.5rem",
                      }}>{item.excerpt}</p>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#C9A84C", fontSize: "0.85rem", fontWeight: 600 }}>
                        বিস্তারিত পড়ুন <ChevronRight size={16} />
                      </div>
                    </div>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {/* Regular news grid */}
        {regular.length > 0 && (
          <div>
            <FadeIn direction="up">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem" }}>
                <div style={{ width: 4, height: 24, background: "#C9A84C", borderRadius: 2 }} />
                <h2 style={{ fontFamily: "'Tiro Bangla', serif", color: "#0A1628", fontSize: "1.5rem", fontWeight: 400 }}>সাম্প্রতিক সংবাদ</h2>
              </div>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
              {regular.map((item, i) => (
                <FadeIn key={item.id} delay={i * 0.08} direction="up">
                  <motion.div
                    whileHover={{ y: -5, boxShadow: "0 20px 50px rgba(10,22,40,0.12)" }}
                    onClick={() => setSelectedNews(item)}
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: "1px solid rgba(10,22,40,0.07)",
                      boxShadow: "0 4px 20px rgba(10,22,40,0.06)",
                      transition: "all 0.3s",
                    }}
                  >
                    <div style={{ height: 3, background: `linear-gradient(90deg, ${item.categoryColor}, transparent)` }} />
                    <div style={{ padding: "1.5rem" }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{
                          background: item.categoryColor + "18",
                          color: item.categoryColor,
                          padding: "3px 10px",
                          borderRadius: 50,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                        }}>{item.category}</span>
                        <span style={{ color: "#8A9AAA", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 3 }}>
                          <Calendar size={12} /> {item.date}
                        </span>
                      </div>
                      <h3 style={{
                        fontFamily: "'Tiro Bangla', serif",
                        color: "#0A1628",
                        fontSize: "1.05rem",
                        fontWeight: 400,
                        lineHeight: 1.6,
                        marginBottom: "0.8rem",
                      }}>{item.title}</h3>
                      <p style={{ color: "#5A6A7A", fontSize: "0.85rem", lineHeight: 1.8, marginBottom: "1rem" }}>{item.excerpt}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#C9A84C", fontSize: "0.8rem", fontWeight: 600 }}>
                        পড়ুন <ArrowRight size={14} />
                      </div>
                    </div>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#8A9AAA" }}>
            <Search size={40} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <p style={{ fontSize: "1rem" }}>কোনো সংবাদ পাওয়া যায়নি।</p>
          </div>
        )}
      </section>

      {/* ── NEWS DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNews(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(10,22,40,0.85)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: 24,
                maxWidth: 680,
                width: "100%",
                maxHeight: "85vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
              }}
            >
              {/* Modal header accent */}
              <div style={{ height: 5, background: `linear-gradient(90deg, ${selectedNews.categoryColor}, transparent)` }} />

              <div style={{ padding: "2rem", overflowY: "auto", flex: 1 }}>
                {/* Close button */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                  <button
                    onClick={() => setSelectedNews(null)}
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "rgba(10,22,40,0.08)",
                      border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#5A6A7A",
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{
                    background: selectedNews.categoryColor + "18",
                    color: selectedNews.categoryColor,
                    padding: "5px 14px",
                    borderRadius: 50,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    border: `1px solid ${selectedNews.categoryColor}30`,
                  }}>{selectedNews.category}</span>
                  <span style={{ color: "#8A9AAA", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={14} /> {selectedNews.date}
                  </span>
                  <span style={{ color: "#8A9AAA", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={14} /> {selectedNews.readTime}
                  </span>
                </div>

                <h2 style={{
                  fontFamily: "'Tiro Bangla', serif",
                  color: "#0A1628",
                  fontSize: "1.5rem",
                  fontWeight: 400,
                  lineHeight: 1.6,
                  marginBottom: "1.5rem",
                }}>{selectedNews.title}</h2>

                <p style={{
                  color: "#3A4A5A",
                  fontSize: "1rem",
                  lineHeight: 2.1,
                  marginBottom: "2rem",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                }}>{selectedNews.content}</p>

                {selectedNews.link && (
                  <a
                    href={selectedNews.link}
                    target={selectedNews.link.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "linear-gradient(135deg, #C9A84C, #E8C4A0)",
                      color: "#0A1628",
                      padding: "12px 28px",
                      borderRadius: 50,
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      textDecoration: "none",
                      boxShadow: "0 8px 24px rgba(201,168,76,0.3)",
                    }}
                  >
                    {selectedNews.link.startsWith("http") ? <ExternalLink size={16} /> : <ArrowRight size={16} />}
                    {selectedNews.link.startsWith("http") ? "বাইরের লিংক দেখুন" : "পেজে যান"}
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
