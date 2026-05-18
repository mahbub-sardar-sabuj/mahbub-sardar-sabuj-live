/**
 * সংবাদ পেজ — Premium News Portal
 * Design: Navy Blue (#1B2A6B) + Amber (#F5A623) — সরদার সংবাদ ব্র্যান্ড
 * Features: Breaking ticker, magazine hero, animated cards, share popup, comments
 */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Share2, Facebook, Twitter, MessageCircle, Link2, Check,
  ThumbsUp, ExternalLink, ArrowRight, Radio, ChevronRight, Clock, Eye
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { newsData as allNewsData } from "../data/newsData";
import type { NewsItem } from "../data/newsData";
import AdSenseAd from "@/components/AdSenseAd";
interface Comment {
  id: number;
  name: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
}






// Breaking news ticker items
const breakingNews = [
  "১১০ হাজার ফলোয়ার পূর্ণ: কৃতজ্ঞতা জানালেন লেখক মাহবুব সরদার সবুজ",
  "\"ডিসেম্বরের শহরে\" পাঠকমহলে ব্যাপক সাড়া ফেলেছে",
  "ঢাকা বাতিঘরে তরুণ আবৃত্তিকারদের বই-পরিচিতি অনুষ্ঠিত",
  "সরদার সংবাদ প্র্যাটফর্মে এখন সংবাদ ও পরিচিতি প্রকাশের সুযোগ",
];

export default function News() {
  const [newsData] = useState<NewsItem[]>(allNewsData);
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("সব");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Record<number, Comment[]>>(() => {
    try {
      const saved = localStorage.getItem("sardar-sangbad-comments");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [copySuccessId, setCopySuccessId] = useState<number | null>(null);
  const [sharePopupId, setSharePopupId] = useState<number | null>(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [cardHovered, setCardHovered] = useState<number | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Breaking news ticker rotation
  useEffect(() => {
    tickerRef.current = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % breakingNews.length);
    }, 4000);
    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, []);

  // Keep selected news in sync with direct URLs and browser back/forward navigation.
  useEffect(() => {
    if (newsData.length === 0) return;

    const match = location.match(/^\/news\/(\d+)$/);

    if (match) {
      const newsId = Number.parseInt(match[1], 10);
      const news = newsData.find(n => n.id === newsId) ?? null;
      setSelectedNews(news);
      return;
    }

    setSelectedNews(null);
  }, [location, newsData]);

  const handleSelectNews = (news: NewsItem | null) => {
    if (news) {
      setLocation(`/news/${news.id}`);
      setSelectedNews(news);
    } else {
      setLocation("/news");
      setSelectedNews(null);
    }
  };

  const categories = ["সব", ...Array.from(new Set(newsData.map(item => item.category)))];

  const filtered = newsData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "সব" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const heroNews = filtered[0];
  const gridNews = filtered.slice(1);

  const handleAddComment = (newsId: number) => {
    if (!commentName.trim() || !commentText.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      name: commentName,
      text: commentText,
      time: "এখনই",
      likes: 0,
      liked: false
    };
    setComments(prev => {
      const updated = { ...prev, [newsId]: [newComment, ...(prev[newsId] || [])] };
      try { localStorage.setItem("sardar-sangbad-comments", JSON.stringify(updated)); } catch {}
      return updated;
    });
    setCommentName("");
    setCommentText("");
  };

  const handleLikeComment = (newsId: number, commentId: number) => {
    setComments(prev => {
      const updated = {
        ...prev,
        [newsId]: (prev[newsId] || []).map(c =>
          c.id === commentId ? { ...c, likes: c.liked ? c.likes - 1 : c.likes + 1, liked: !c.liked } : c
        ),
      };
      try { localStorage.setItem("sardar-sangbad-comments", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const getShareUrl = (newsId: number) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/api/news-og?id=${newsId}`;
  };

  const getNewsPageUrl = (newsId: number) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/news/${newsId}`;
  };

  const shareTitle = selectedNews ? selectedNews.title : '';

  const handleShareClick = async (e: React.MouseEvent, newsId: number) => {
    e.stopPropagation();
    const shareUrl = getShareUrl(newsId);
    const pageUrl = getNewsPageUrl(newsId);
    const title = newsData.find(n => n.id === newsId)?.title || '';
    if (navigator.share) {
      try {
        await navigator.share({ title, url: pageUrl });
        return;
      } catch { /* show popup */ }
    }
    setSharePopupId(newsId);
  };

  const handleCopyLink = async (newsId: number) => {
    const url = getNewsPageUrl(newsId);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopySuccessId(newsId);
    setTimeout(() => { setCopySuccessId(null); setSharePopupId(null); }, 2000);
  };

  return (
    <div style={{ background: "#060E1A", minHeight: "100vh", color: "#FAF6EF" }}>
      <style>{`
        @keyframes tickerSlide {
          0% { opacity: 0; transform: translateY(8px); }
          10% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-8px); }
        }
        @keyframes shimmerCard {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes heroGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(245,166,35,0.08); }
          50% { box-shadow: 0 0 60px rgba(245,166,35,0.18); }
        }
        @keyframes borderPulse {
          0%, 100% { border-color: rgba(245,166,35,0.15); }
          50% { border-color: rgba(245,166,35,0.4); }
        }
        @keyframes logoShimmer {
          0% { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220,30,30,0), 0 8px 40px rgba(0,0,0,0.25); }
          50% { box-shadow: 0 0 0 8px rgba(220,30,30,0.08), 0 8px 40px rgba(0,0,0,0.3); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .logo-shimmer-overlay {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%);
          background-size: 300% 100%;
          animation: logoShimmer 3.5s ease-in-out infinite;
          pointer-events: none;
          z-index: 2;
        }
        .news-card:hover .card-img { transform: scale(1.06); }
        .news-card:hover .read-btn { gap: 10px; }
        .news-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: clamp(1rem, 2.4vw, 1.8rem);
          align-items: stretch;
        }
        .news-card {
          min-width: 0;
          isolation: isolate;
        }
        .news-thumb {
          flex: 0 0 auto;
          width: 100%;
          aspect-ratio: 16 / 9;
          min-height: 190px;
          max-height: 250px;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, rgba(27,42,107,0.95), rgba(6,14,26,0.92));
        }
        .news-thumb::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(6,14,26,0.02) 0%, rgba(6,14,26,0.18) 55%, rgba(6,14,26,0.72) 100%);
        }
        .news-thumb .category-badge {
          z-index: 2;
        }
        .news-card-body {
          min-height: 0;
          flex: 1 1 auto;
        }
        .news-card-footer {
          gap: 14px;
        }
        .news-modal-shell {
          width: min(900px, 100%);
          max-height: min(92vh, 980px);
        }
        .news-modal-scroll {
          overflow-y: auto;
          max-height: min(92vh, 980px);
          -webkit-overflow-scrolling: touch;
        }
        .news-modal-hero {
          height: clamp(210px, 34vw, 330px);
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, rgba(27,42,107,0.95), rgba(6,14,26,0.92));
        }
        .news-modal-content {
          padding: clamp(24px, 4vw, 40px);
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245,166,35,0.3); border-radius: 4px; }
        @media (max-width: 767px) {
          .news-card-grid {
            grid-template-columns: 1fr;
            gap: 1.1rem;
          }
          .news-thumb {
            min-height: 185px;
            max-height: none;
          }
          .news-card-body {
            padding: 18px !important;
          }
          .news-card-footer {
            align-items: flex-start !important;
            flex-direction: column;
          }
          .news-modal-shell {
            border-radius: 22px !important;
            max-height: 94vh !important;
          }
          .news-modal-scroll {
            max-height: 94vh !important;
          }
          .news-modal-hero {
            height: 210px;
          }
        }
        @media (max-width: 390px) {
          .news-thumb { min-height: 170px; }
        }
      `}</style>

      <Seo
        title={selectedNews ? `${selectedNews.title} | সরদার সংবাদ | মাহবুব সরদার সবুজ` : "সরদার সংবাদ | বাংলা সাহিত্য আপডেট | মাহবুব সরদার সবুজ"}
        description={selectedNews ? selectedNews.excerpt : "মাহবুব সরদার সবুজের সর্বশেষ সংবাদ, নতুন বই প্রকাশনা, সাহিত্য পুরস্কার, বাংলা সাহিত্য অনুষ্ঠান ও লেখকের সাম্প্রতিক কার্যক্রমের আপডেট।"}
        path={selectedNews ? `/news/${selectedNews.id}` : "/news"}
        keywords="বাংলা সাহিত্য সংবাদ, বাংলা বই প্রকাশনা, মাহবুব সরদার সবুজ সংবাদ, Mahbub Sardar Sabuj news, বাংলাদেশ সাহিত্য, নতুন বাংলা বই, বাংলা লেখক সংবাদ"
        image={selectedNews?.image}
        type={selectedNews ? "article" : "website"}
        newsArticle={selectedNews ? {
          headline: selectedNews.title,
          datePublished: selectedNews.date,
          dateModified: selectedNews.date,
          author: selectedNews.author ?? "মাহবুব সরদার সবুজ",
          publisherName: "সরদার সংবাদ",
          publisherLogo: "/images/sardar-sangbad-logo-final.png",
          articleSection: selectedNews.category,
        } : undefined}
      />
      <Navbar />

      {/* ── PAGE HEADER ── */}
      <div style={{
        paddingTop: "var(--site-nav-offset, 98px)",
        paddingBottom: "0",
        background: "linear-gradient(180deg, rgba(27,42,107,0.25) 0%, transparent 100%)",
      }}>

        {/* Page title */}
        <div style={{ padding: "8px 0 0", textAlign: "center", width: "100%" }}>
          {/* Logo brand */}
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0 }}
            style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: 10 }}
          >
            <img
              src="/images/sardar-sangbad-logo-final.png"
              alt="সরদার সংবাদ - মাহবুব সরদার সবুজের সাহিত্য ও সংবাদ পোর্টাল"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              style={{
                height: "auto",
                maxWidth: "min(88vw, 640px)",
                width: "min(88vw, 640px)",
                display: "block",
                objectFit: "contain",
              }}
            />
          </motion.div>

          {/* Breaking ticker bar — below logo */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0 }}
            style={{ marginBottom: 32 }}
          >
            <div style={{
              background: "linear-gradient(90deg, #1B2A6B 0%, #0F1E52 50%, #1B2A6B 100%)",
              borderTop: "2px solid #F5A623",
              borderBottom: "2px solid #F5A623",
              overflow: "hidden",
              maxWidth: 700,
              margin: "0 auto",
              borderRadius: 8,
            }}>
              <div style={{
                display: "flex",
                alignItems: "stretch",
              }}>
                <div style={{
                  background: "#F5A623",
                  color: "#060E1A",
                  padding: "9px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  flexShrink: 0,
                  fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                  borderRadius: "8px 0 0 8px",
                }}>
                  <Radio size={13} />
                  ব্রেকিং
                </div>
                <div style={{
                  flex: 1,
                  overflow: "hidden",
                  position: "relative",
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                }}>
                  <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear", repeatType: "loop" }}
                    style={{
                      display: "flex",
                      gap: "4rem",
                      whiteSpace: "nowrap",
                      alignItems: "center",
                    }}
                  >
                    {breakingNews.map((item, j) => (
                      <span key={j} style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexShrink: 0 }}>
                        {item}
                        <span style={{ color: "#F5A623", fontSize: "0.6rem" }}>●</span>
                      </span>
                    ))}
                    {breakingNews.map((item, j) => (
                      <span key={`dup-${j}`} style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexShrink: 0 }}>
                        {item}
                        <span style={{ color: "#F5A623", fontSize: "0.6rem" }}>●</span>
                      </span>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0 }}
            style={{ position: "relative", maxWidth: 480, margin: "24px auto 0" }}
          >
            <Search style={{
              position: "absolute", left: 18, top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(245,166,35,0.5)"
            }} size={18} />
            <input
              type="text"
              placeholder="সংবাদ খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(27,42,107,0.3)",
                border: "1.5px solid rgba(245,166,35,0.2)",
                borderRadius: 50,
                padding: "13px 20px 13px 50px",
                color: "#FAF6EF",
                fontSize: "1rem",
                outline: "none",
                transition: "all 0.3s",
                boxSizing: "border-box",
                fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#F5A623";
                e.currentTarget.style.background = "rgba(27,42,107,0.5)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(245,166,35,0.2)";
                e.currentTarget.style.background = "rgba(27,42,107,0.3)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 100px" }}>

        {/* ── CATEGORY FILTER ── */}
        <div style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 8,
          marginTop: 28,
          marginBottom: 40,
          scrollbarWidth: "none",
          justifyContent: "center",
        }} className="no-scrollbar">
          {categories.map(cat => (
            <motion.button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.04 }}
              style={{
                padding: "10px 26px",
                borderRadius: 50,
                background: selectedCategory === cat
                  ? "linear-gradient(135deg, #F5A623, #E8920F)"
                  : "rgba(27,42,107,0.35)",
                color: selectedCategory === cat ? "#060E1A" : "rgba(250,246,239,0.85)",
                border: `1.5px solid ${selectedCategory === cat ? "#F5A623" : "rgba(245,166,35,0.2)"}`,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontSize: "1rem",
                fontWeight: 700,
                transition: "all 0.25s",
                fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                boxShadow: selectedCategory === cat ? "0 4px 18px rgba(245,166,35,0.35)" : "0 2px 8px rgba(0,0,0,0.18)",
                letterSpacing: "0.01em",
              }}
            >{cat}</motion.button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "rgba(250,246,239,0.4)" }}>
            <p style={{ fontSize: "1.2rem" }}>কোনো সংবাদ পাওয়া যায়নি।</p>
          </div>
        ) : (
          <>
            {/* ── ALL NEWS GRID (equal cards) ── */}
            <div className="news-card-grid">
              {filtered.map((item, idx) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                  viewport={{ once: true }}
                  onClick={() => handleSelectNews(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectNews(item);
                    }
                  }}
                  role="link"
                  tabIndex={0}
                  aria-label={`${item.title} পড়ুন`}
                  onHoverStart={() => setCardHovered(item.id)}
                  onHoverEnd={() => setCardHovered(null)}
                  className="news-card"
                  style={{
                    background: "linear-gradient(180deg, rgba(27,42,107,0.20) 0%, rgba(6,14,26,0.88) 100%)",
                    border: `1.5px solid ${cardHovered === item.id ? "rgba(245,166,35,0.4)" : "rgba(245,166,35,0.12)"}`,
                    borderRadius: 24,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 0.35s ease",
                    boxShadow: cardHovered === item.id ? "0 18px 58px rgba(245,166,35,0.15)" : "0 10px 30px rgba(0,0,0,0.18)",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                  whileHover={{ y: -8 }}
                >
                  {/* Card image */}
                  {item.image && (
                    <div className="news-thumb">
                      <img
                        src={item.image}
                        alt={`${item.title} - সরদার সংবাদ`}
                        className="card-img"
                        loading={idx < 6 ? "eager" : "lazy"}
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.src = "/images/sardar-sangbad-logo-final.png";
                          e.currentTarget.style.objectFit = "contain";
                          e.currentTarget.style.padding = "34px";
                          e.currentTarget.style.background = "linear-gradient(135deg, #1B2A6B, #060E1A)";
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          transition: "transform 0.6s ease",
                        }}
                      />
                      {/* Gradient overlay */}
                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "55%",
                        background: "linear-gradient(to top, rgba(6,14,26,0.78), transparent)",
                        zIndex: 1,
                      }} />
                      {/* Category badge */}
                      <div style={{
                        position: "absolute",
                        top: 14,
                        left: 14,
                        background: item.categoryColor,
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: 50,
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                      className="category-badge"
                    >
                      {item.category}
                    </div>
                    </div>
                  )}

                  {/* Card content */}
                  <div className="news-card-body" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    {/* Meta row */}
                    <div style={{
                      display: "flex",
                      gap: 14,
                      marginBottom: 14,
                      alignItems: "center",
                    }}>
                      {item.views && (
                        <span style={{
                          color: "rgba(245,166,35,0.6)",
                          fontSize: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                        }}>
                          <Eye size={11} /> {item.views.toLocaleString('bn-BD')}
                        </span>
                      )}
                    </div>

                    <h3 style={{
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', serif",
                      fontSize: "1.25rem",
                      color: "#FAF6EF",
                      margin: "0 0 12px",
                      lineHeight: 1.4,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}>
                      <a
                        href={`/news/${item.id}`}
                        onClick={(e) => { e.preventDefault(); handleSelectNews(item); }}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {item.title}
                      </a>
                    </h3>

                    <p style={{
                      color: "rgba(250,246,239,0.55)",
                      fontSize: "0.88rem",
                      lineHeight: 1.65,
                      margin: "0 0 20px",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    }}>
                      {item.excerpt}
                    </p>

                    {/* Footer row */}
                    <div className="news-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                      <span style={{
                        color: "rgba(250,246,239,0.35)",
                        fontSize: "0.78rem",
                        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      }}>
                        {item.date}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                          onClick={(e) => handleShareClick(e, item.id)}
                          style={{
                            background: copySuccessId === item.id ? "rgba(39,174,96,0.15)" : "rgba(245,166,35,0.1)",
                            border: `1px solid ${copySuccessId === item.id ? "rgba(39,174,96,0.5)" : "rgba(245,166,35,0.25)"}`,
                            borderRadius: "50%",
                            width: 34,
                            height: 34,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: copySuccessId === item.id ? "#27AE60" : "#F5A623",
                            transition: "all 0.3s",
                            flexShrink: 0,
                          }}
                        >
                          {copySuccessId === item.id ? <Check size={14} /> : <Share2 size={14} />}
                        </button>
                        <span style={{
                          color: "#F5A623",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                        }}>
                          পড়ুন <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── NEWS DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(6,14,26,0.96)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => handleSelectNews(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                background: "linear-gradient(180deg, #0F1E52 0%, #060E1A 100%)",
                width: "100%",
                maxWidth: 900,
                maxHeight: "92vh",
                borderRadius: 32,
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,166,35,0.2)",
                border: "1.5px solid rgba(245,166,35,0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
              className="news-modal-shell"
            >
              {/* Close button */}
              <button
                type="button"
                aria-label="সংবাদ বিস্তারিত বন্ধ করুন"
                title="সংবাদ বিস্তারিত বন্ধ করুন"
                onClick={() => handleSelectNews(null)}
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  zIndex: 10,
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(245,166,35,0.2)";
                  e.currentTarget.style.borderColor = "rgba(245,166,35,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.5)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              >
                <X size={20} />
              </button>

              <div className="news-modal-scroll custom-scrollbar">
                {/* Modal hero image */}
                {selectedNews.image && (
                  <div className="news-modal-hero">
                    <img
                      src={selectedNews.image}
                      alt={`${selectedNews.title} - সরদার সংবাদ সাহিত্য পোর্টাল`}
                      loading="eager"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.src = "/images/sardar-sangbad-logo-final.png";
                        e.currentTarget.style.objectFit = "contain";
                        e.currentTarget.style.padding = "44px";
                        e.currentTarget.style.background = "linear-gradient(135deg, #1B2A6B, #060E1A)";
                      }}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(15,30,82,0.9) 0%, transparent 60%)",
                    }} />
                    {/* Category + date overlay */}
                    <div style={{
                      position: "absolute",
                      bottom: 24,
                      left: 32,
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}>
                      <span style={{
                        background: selectedNews.categoryColor,
                        color: "#fff",
                        padding: "5px 14px",
                        borderRadius: 50,
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}>
                        {selectedNews.category}
                      </span>

                    </div>
                  </div>
                )}

                <div className="news-modal-content">
                  {/* Title */}
                  <h2 style={{
                    fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', serif",
                    fontSize: "clamp(1.45rem, 3.6vw, 2rem)",
                    color: "#FAF6EF",
                    margin: "0 0 12px",
                    lineHeight: 1.35,
                  }}>
                    {selectedNews.title}
                  </h2>

                  {/* Meta */}
                  <div style={{
                    display: "flex",
                    gap: 20,
                    marginBottom: 28,
                    paddingBottom: 20,
                    borderBottom: "1px solid rgba(245,166,35,0.1)",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}>
                    <span style={{ color: "rgba(250,246,239,0.45)", fontSize: "0.85rem", fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif" }}>
                      {selectedNews.date}
                    </span>
                    {selectedNews.views && (
                      <span style={{
                        color: "rgba(245,166,35,0.6)",
                        fontSize: "0.82rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      }}>
                        <Eye size={13} /> {selectedNews.views.toLocaleString('bn-BD')} পাঠক
                      </span>
                    )}
                    {selectedNews.author && (
                      <span style={{
                        color: "rgba(250,246,239,0.62)",
                        fontSize: "0.84rem",
                        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      }}>
                        লেখক: {selectedNews.author}{selectedNews.location ? ` | ${selectedNews.location}` : ""}
                      </span>
                    )}
                    <span style={{
                      background: "rgba(245,166,35,0.1)",
                      border: "1px solid rgba(245,166,35,0.2)",
                      color: "#F5A623",
                      padding: "3px 12px",
                      borderRadius: 50,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    }}>
                      #{selectedNews.tag}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{
                    color: "rgba(250,246,239,0.82)",
                    fontSize: "1.05rem",
                    lineHeight: 1.9,
                    fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                    marginBottom: 36,
                  }}>
                    {selectedNews.content.split(/\n\n+/).map((para, i) => (
                      para.trim() ? <p key={i} style={{ marginBottom: '1.2rem' }}>{para.trim()}</p> : null
                    ))}
                  </div>

                  {/* Share section — improved */}
                  <div style={{
                    padding: "22px 24px",
                    background: "rgba(27,42,107,0.2)",
                    borderRadius: 20,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid rgba(245,166,35,0.1)",
                    marginBottom: 24,
                    flexWrap: "wrap",
                    gap: 16,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Share2 size={18} color="#F5A623" />
                      <span style={{
                        color: "rgba(250,246,239,0.65)",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                      }}>
                        শেয়ার করুন:
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(selectedNews.id))}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          color: "#1877F2",
                          background: "rgba(24,119,242,0.12)",
                          border: "1px solid rgba(24,119,242,0.25)",
                          width: 38, height: 38,
                          borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.3s",
                        }}
                        title="ফেসবুকে শেয়ার করুন"
                      >
                        <Facebook size={17} />
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl(selectedNews.id))}&text=${encodeURIComponent(shareTitle)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          color: "#1DA1F2",
                          background: "rgba(29,161,242,0.12)",
                          border: "1px solid rgba(29,161,242,0.25)",
                          width: 38, height: 38,
                          borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.3s",
                        }}
                        title="টুইটারে শেয়ার করুন"
                      >
                        <Twitter size={17} />
                      </a>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + getShareUrl(selectedNews.id))}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          color: "#25D366",
                          background: "rgba(37,211,102,0.12)",
                          border: "1px solid rgba(37,211,102,0.25)",
                          width: 38, height: 38,
                          borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.3s",
                        }}
                        title="হোয়াটসঅ্যাপে শেয়ার করুন"
                      >
                        <MessageCircle size={17} />
                      </a>
                      <button
                        onClick={() => handleCopyLink(selectedNews.id)}
                        style={{
                          background: copySuccessId === selectedNews.id ? "rgba(39,174,96,0.15)" : "rgba(245,166,35,0.12)",
                          border: `1px solid ${copySuccessId === selectedNews.id ? "rgba(39,174,96,0.5)" : "rgba(245,166,35,0.3)"}`,
                          color: copySuccessId === selectedNews.id ? "#27AE60" : "#F5A623",
                          borderRadius: 10,
                          padding: "8px 14px",
                          display: "flex", alignItems: "center", gap: 6,
                          cursor: "pointer",
                          transition: "all 0.3s",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
                          whiteSpace: "nowrap",
                        }}
                        title="লিঙ্ক কপি করুন"
                      >
                        {copySuccessId === selectedNews.id ? <><Check size={14} /> কপি হয়েছে!</> : <><Link2 size={14} /> লিঙ্ক কপি</>}
                      </button>
                    </div>
                  </div>

                  {/* External link button */}
                  {selectedNews.link && (
                    <div style={{ marginBottom: 36 }}>
                      <a
                        href={selectedNews.link}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 10,
                          background: "linear-gradient(135deg, #F5A623, #E8920F)",
                          color: "#060E1A",
                          padding: "12px 28px",
                          borderRadius: 50,
                          fontWeight: 800,
                          textDecoration: "none",
                          transition: "all 0.3s",
                          fontFamily: "'Noto Sans Bengali', sans-serif",
                          boxShadow: "0 4px 20px rgba(245,166,35,0.3)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.04)";
                          e.currentTarget.style.boxShadow = "0 8px 32px rgba(245,166,35,0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "0 4px 20px rgba(245,166,35,0.3)";
                        }}
                      >
                        আরও দেখুন <ExternalLink size={17} />
                      </a>
                    </div>
                  )}


                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SHARE POPUP ── */}
      <AnimatePresence>
        {sharePopupId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSharePopupId(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(6,14,26,0.75)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "linear-gradient(180deg, #0F1E52 0%, #060E1A 100%)",
                border: "1.5px solid rgba(245,166,35,0.3)",
                borderRadius: 20,
                padding: 28,
                width: "100%",
                maxWidth: 420,
                boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <h3 style={{
                  color: "#F5A623",
                  fontFamily: "'Tiro Bangla', serif",
                  margin: 0,
                  fontSize: "1.2rem",
                }}>
                  শেয়ার করুন
                </h3>
                <button
                  onClick={() => setSharePopupId(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(250,246,239,0.5)",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: "flex", gap: 14, marginBottom: 22, justifyContent: "center" }}>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(sharePopupId!))}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 7, color: "#1877F2", textDecoration: "none", fontSize: "0.75rem",
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                  }}
                >
                  <div style={{
                    background: "rgba(24,119,242,0.15)",
                    border: "1px solid rgba(24,119,242,0.3)",
                    borderRadius: "50%",
                    width: 52, height: 52,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Facebook size={24} />
                  </div>
                  ফেসবুক
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent((newsData.find(n => n.id === sharePopupId)?.title || '') + ' ' + getShareUrl(sharePopupId!))}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 7, color: "#25D366", textDecoration: "none", fontSize: "0.75rem",
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                  }}
                >
                  <div style={{
                    background: "rgba(37,211,102,0.15)",
                    border: "1px solid rgba(37,211,102,0.3)",
                    borderRadius: "50%",
                    width: 52, height: 52,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <MessageCircle size={24} />
                  </div>
                  হোয়াটসঅ্যাপ
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl(sharePopupId!))}&text=${encodeURIComponent(newsData.find(n => n.id === sharePopupId)?.title || '')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 7, color: "#1DA1F2", textDecoration: "none", fontSize: "0.75rem",
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                  }}
                >
                  <div style={{
                    background: "rgba(29,161,242,0.15)",
                    border: "1px solid rgba(29,161,242,0.3)",
                    borderRadius: "50%",
                    width: 52, height: 52,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Twitter size={24} />
                  </div>
                  টুইটার
                </a>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{
                  flex: 1,
                  background: "rgba(250,246,239,0.04)",
                  border: "1px solid rgba(245,166,35,0.2)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "rgba(250,246,239,0.6)",
                  fontSize: "0.8rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  {getNewsPageUrl(sharePopupId)}
                </div>
                <button
                  onClick={() => handleCopyLink(sharePopupId!)}
                  style={{
                    background: copySuccessId === sharePopupId ? "rgba(39,174,96,0.2)" : "rgba(245,166,35,0.15)",
                    border: `1px solid ${copySuccessId === sharePopupId ? "rgba(39,174,96,0.5)" : "rgba(245,166,35,0.4)"}`,
                    borderRadius: 10,
                    padding: "10px 16px",
                    color: copySuccessId === sharePopupId ? "#27AE60" : "#F5A623",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                    transition: "all 0.3s",
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                  }}
                >
                  {copySuccessId === sharePopupId
                    ? <><Check size={14} /> কপি হয়েছে!</>
                    : <><Link2 size={14} /> কপি করুন</>
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AdSense Ad — সংবাদ পেজের নিচে */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <AdSenseAd adSlot="" adFormat="auto" fullWidthResponsive={true} />
      </div>
      <Footer />
    </div>
  );
}
