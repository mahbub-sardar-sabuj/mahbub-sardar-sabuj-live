import { useEffect, useState, type CSSProperties } from "react";
import { Link, useRoute } from "wouter";
import {
  ArrowLeft,
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Eye,
  Facebook,
  MessageCircle,
  Share2,
  Twitter,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo, { SITE_URL } from "../components/Seo";
import { newsData } from "../data/newsData";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";

const fallbackImage = "/images/sardar-sangbad-logo-final.png";

export default function NewsDetail() {
  const [, params] = useRoute("/news/:id");
  const [copied, setCopied] = useState(false);
  const newsId = Number.parseInt(params?.id ?? "", 10);
  const news = Number.isFinite(newsId) ? newsData.find((item) => item.id === newsId) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [newsId]);

  if (!news) {
    return (
      <div style={{ minHeight: "100vh", background: "#060E1A", color: "#FAF6EF" }}>
        <Seo
          title="সংবাদ পাওয়া যায়নি | সরদার সংবাদ | মাহবুব সরদার সবুজ"
          description="আপনি যে সংবাদটি খুঁজছেন তা পাওয়া যায়নি।"
          path="/404"
          robots="noindex, nofollow"
        />
        <Navbar />
        <main
          style={{
            minHeight: "70vh",
            display: "grid",
            placeItems: "center",
            padding: "calc(var(--site-nav-offset, 98px) + 48px) 20px 64px",
          }}
        >
          <section style={{ maxWidth: 620, textAlign: "center" }}>
            <p style={{ color: "#F5A623", fontWeight: 800, letterSpacing: "0.12em", margin: "0 0 12px" }}>৪০৪</p>
            <h1 style={{ margin: "0 0 16px", fontFamily: "'AdorshoLipi', sans-serif", fontSize: "clamp(1.7rem, 5vw, 2.5rem)" }}>
              সংবাদটি পাওয়া যায়নি
            </h1>
            <p style={{ color: "rgba(250,246,239,0.68)", lineHeight: 1.8, margin: "0 0 28px" }}>
              লিংকটি পুরোনো হতে পারে অথবা সংবাদটি আর প্রকাশিত নেই।
            </p>
            <Link
              href="/news"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                color: "#060E1A",
                background: "#F5A623",
                padding: "12px 18px",
                borderRadius: 999,
                fontWeight: 800,
              }}
            >
              <ArrowLeft size={17} /> সব সংবাদে ফিরুন
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const pageUrl = `${SITE_URL}/news/${news.id}`;
  const shareTitle = `${news.title} | সরদার সংবাদ`;
  const imageAlt = `${news.title} — সরদার সংবাদ`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = pageUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060E1A", color: "#FAF6EF" }}>
      <Seo
        title={`${news.title} | সরদার সংবাদ | মাহবুব সরদার সবুজ`}
        description={news.excerpt}
        path={`/news/${news.id}`}
        image={news.image}
        imageAlt={imageAlt}
        type="article"
        keywords={news.keywords ?? `${news.title}, ${news.category}, সরদার সংবাদ, মাহবুব সরদার সবুজ, বাংলা সাহিত্য`}
        newsArticle={{
          headline: news.title,
          datePublished: news.date,
          dateModified: news.date,
          author: news.author ?? "মাহবুব সরদার সবুজ",
          publisherName: "সরদার সংবাদ",
          publisherLogo: "/images/sardar-sangbad-logo-final.png",
          articleSection: news.category,
        }}
      />
      <Navbar />

      <main style={{ padding: "calc(var(--site-nav-offset, 98px) + 32px) 20px 92px" }}>
        <article style={{ width: "min(920px, 100%)", margin: "0 auto" }}>
          <Link
            href="/news"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "rgba(250,246,239,0.78)",
              textDecoration: "none",
              fontFamily: "'AdorshoLipi', sans-serif",
              fontSize: "0.95rem",
              marginBottom: 24,
            }}
          >
            <ArrowLeft size={17} /> সব সংবাদে ফিরুন
          </Link>

          <header
            style={{
              padding: "clamp(24px, 5vw, 46px)",
              borderRadius: 28,
              background: "linear-gradient(145deg, rgba(27,42,107,0.62) 0%, rgba(6,14,26,0.96) 72%)",
              border: "1px solid rgba(245,166,35,0.2)",
              boxShadow: "0 20px 55px rgba(0,0,0,0.26)",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: 999,
                  background: news.categoryColor,
                  padding: "5px 13px",
                  fontSize: "0.76rem",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  color: "#fff",
                  fontFamily: "'AdorshoLipi', sans-serif",
                }}
              >
                {news.category}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "rgba(250,246,239,0.6)", fontSize: "0.85rem" }}>
                <Clock3 size={14} /> {news.date}
              </span>
              {news.views ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "rgba(245,166,35,0.78)", fontSize: "0.85rem" }}>
                  <Eye size={14} /> {news.views.toLocaleString("bn-BD")} পাঠক
                </span>
              ) : null}
            </div>

            <h1
              style={{
                margin: 0,
                fontFamily: "'AdorshoLipi', sans-serif",
                fontSize: "clamp(1.85rem, 5vw, 3.2rem)",
                lineHeight: 1.35,
                letterSpacing: "-0.015em",
              }}
            >
              {news.title}
            </h1>

            <p
              style={{
                margin: "18px 0 0",
                color: "rgba(250,246,239,0.76)",
                fontFamily: "'AdorshoLipi', sans-serif",
                fontSize: "clamp(1rem, 2.4vw, 1.18rem)",
                lineHeight: 1.8,
              }}
            >
              {news.excerpt}
            </p>
          </header>

          {news.image ? (
            <figure style={{ margin: "28px 0 0", overflow: "hidden", borderRadius: 26, background: "#0F1E52", border: "1px solid rgba(245,166,35,0.16)" }}>
              <img
                src={news.image}
                alt={imageAlt}
                fetchPriority="high"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.src = fallbackImage;
                  event.currentTarget.style.objectFit = "contain";
                  event.currentTarget.style.padding = "36px";
                }}
                style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "cover", background: "linear-gradient(135deg, #1B2A6B, #060E1A)" }}
              />
            </figure>
          ) : null}

          <section
            style={{
              marginTop: 28,
              padding: "clamp(24px, 5vw, 46px)",
              borderRadius: 28,
              background: "rgba(15,30,82,0.28)",
              border: "1px solid rgba(245,166,35,0.13)",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between", marginBottom: 32, paddingBottom: 20, borderBottom: "1px solid rgba(245,166,35,0.14)" }}>
              <span style={{ color: "rgba(250,246,239,0.62)", fontFamily: "'AdorshoLipi', sans-serif" }}>
                {news.author ? `লেখক: ${news.author}` : "সরদার সংবাদ"}{news.location ? ` · ${news.location}` : ""}
              </span>
              <span style={{ color: "#F5A623", fontFamily: "'AdorshoLipi', sans-serif", fontSize: "0.88rem" }}>#{news.tag}</span>
            </div>

            <div
              style={{
                color: "rgba(250,246,239,0.86)",
                fontFamily: "'AdorshoLipi', sans-serif",
                fontSize: "clamp(1.05rem, 2.2vw, 1.18rem)",
                lineHeight: 1.95,
              }}
            >
              {news.content.split(/\n\n+/).map((paragraph, index) => {
                if (!paragraph.trim()) return null;
                const parts = paragraph.trim().split(/\[([^\]]+)\]\(([^)]+)\)/);
                return (
                  <p key={index} style={{ margin: index === 0 ? "0 0 1.25rem" : "0 0 1.25rem", wordBreak: "break-word", overflowWrap: "break-word" }}>
                    {parts.map((part, i) => {
                      if (i % 3 === 0) return part;
                      if (i % 3 === 2) {
                        const linkText = parts[i - 1];
                        return (
                          <a
                            key={i}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#F5A623",
                              textDecoration: "underline",
                              wordBreak: "break-all",
                              overflowWrap: "break-word",
                            }}
                          >
                            {linkText}
                          </a>
                        );
                      }
                      return null;
                    })}
                  </p>
                );
              })}
            </div>

            {news.orderLinks?.length ? (
              <section
                aria-label="বই অর্ডার করুন"
                style={{
                  marginTop: 30,
                  padding: "clamp(20px, 4vw, 28px)",
                  borderRadius: 22,
                  background: "linear-gradient(135deg, rgba(245,166,35,0.14), rgba(27,42,107,0.3))",
                  border: "1px solid rgba(245,166,35,0.3)",
                }}
              >
                <p style={{ margin: 0, color: "#FFF8E9", fontFamily: "'AdorshoLipi', sans-serif", fontSize: "1.2rem", fontWeight: 800 }}>
                  রকমারি থেকে অর্ডার করুন
                </p>
                <p style={{ margin: "6px 0 18px", color: "rgba(250,246,239,0.68)", fontFamily: "'AdorshoLipi', sans-serif", lineHeight: 1.65 }}>
                  মূল্য ও availability রকমারির live product page অনুযায়ী পরিবর্তিত হতে পারে।
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {news.orderLinks.map((orderLink) => (
                    <a
                      key={orderLink.href}
                      href={orderLink.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        flex: "1 1 250px",
                        minHeight: 48,
                        borderRadius: 14,
                        padding: "11px 16px",
                        color: "#071426",
                        background: "linear-gradient(135deg, #FFE09A, #F5A623)",
                        boxShadow: "0 10px 24px rgba(245,166,35,0.18)",
                        textDecoration: "none",
                        textAlign: "center",
                        fontWeight: 900,
                        fontFamily: "'AdorshoLipi', sans-serif",
                      }}
                    >
                      {orderLink.label} <ExternalLink size={16} />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            <section
              aria-label="এই সংবাদটি শেয়ার করুন"
              style={{
                marginTop: 36,
                padding: "18px 20px",
                borderRadius: 18,
                background: "rgba(6,14,26,0.56)",
                border: "1px solid rgba(245,166,35,0.16)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(250,246,239,0.8)", fontWeight: 700, fontFamily: "'AdorshoLipi', sans-serif" }}>
                <Share2 size={18} color="#F5A623" /> শেয়ার করুন
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ফেসবুকে শেয়ার করুন"
                  title="ফেসবুকে শেয়ার করুন"
                  style={shareButtonStyle("#1877F2")}
                >
                  <Facebook size={18} />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X-এ শেয়ার করুন"
                  title="X-এ শেয়ার করুন"
                  style={shareButtonStyle("#1DA1F2")}
                >
                  <Twitter size={18} />
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${pageUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="হোয়াটসঅ্যাপে শেয়ার করুন"
                  title="হোয়াটসঅ্যাপে শেয়ার করুন"
                  style={shareButtonStyle("#25D366")}
                >
                  <MessageCircle size={18} />
                </a>
                <button
                  type="button"
                  onClick={copyLink}
                  title="লিংক কপি করুন"
                  style={{
                    ...shareButtonStyle("#F5A623"),
                    width: "auto",
                    padding: "0 13px",
                    gap: 7,
                    fontFamily: "'AdorshoLipi', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? "কপি হয়েছে" : "লিংক কপি"}
                </button>
              </div>
            </section>

            {news.link ? (
              <a
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  marginTop: 26,
                  borderRadius: 999,
                  padding: "12px 18px",
                  color: "#060E1A",
                  background: "linear-gradient(135deg, #F5A623, #E8920F)",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontFamily: "'AdorshoLipi', sans-serif",
                }}
              >
                আরও দেখুন <ExternalLink size={17} />
              </a>
            ) : null}
          </section>

          <div style={{ marginTop: 34 }}>
            <AdSenseAd adSlot={AD_SLOTS.NEWS_INLINE} adFormat="auto" fullWidthResponsive />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

function shareButtonStyle(color: string): CSSProperties {
  return {
    width: 40,
    height: 40,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    color,
    background: `${color}1A`,
    border: `1px solid ${color}55`,
    textDecoration: "none",
    cursor: "pointer",
  };
}
