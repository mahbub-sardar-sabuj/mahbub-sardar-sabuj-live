/**
 * WritingDetailPage — প্রতিটি লেখার জন্য আলাদা পুরো পেজ
 * সরদার সংবাদের news detail পেজের মতো design
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { SITE_URL } from "@/components/Seo";
import { loadWritingsArchive } from "@/lib/loadWritingsArchive";
import type { Writing } from "@/data/writingsArchive";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Feather, Share2, Copy, Check, Facebook, ChevronLeft,
  ChevronRight, ArrowLeft,
  AArrowUp, AArrowDown, Moon, Sun, Scroll,
} from "lucide-react";

// ── Slug Utilities (same as Writings.tsx) ─────────────────────────────────────
const BENGALI_TRANS: Record<string, string> = {
  'অ':'o','আ':'a','ই':'i','ঈ':'i','উ':'u','ঊ':'u','এ':'e','ঐ':'oi','ও':'o','ঔ':'ou',
  'ক':'k','খ':'kh','গ':'g','ঘ':'gh','ঙ':'ng',
  'চ':'ch','ছ':'chh','জ':'j','ঝ':'jh','ঞ':'n',
  'ট':'t','ঠ':'th','ড':'d','ঢ':'dh','ণ':'n',
  'ত':'t','থ':'th','দ':'d','ধ':'dh','ন':'n',
  'প':'p','ফ':'ph','ব':'b','ভ':'bh','ম':'m',
  'য':'j','র':'r','ল':'l','শ':'sh','ষ':'sh','স':'s','হ':'h',
  'ড়':'r','ঢ়':'rh','য়':'y','ৎ':'t',
  'া':'a','ি':'i','ী':'i','ু':'u','ূ':'u','ে':'e','ৈ':'oi','ো':'o','ৌ':'ou',
  'ং':'ng','ঃ':'h','ঁ':'n','্':'',
  ' ':'-','?':'','!':'',',':'','.':'','"':'',"'":'','—':'-','–':'-',
};
function makeLegacySlug(title: string, id: number): string {
  let slug = '';
  for (const ch of title) { slug += BENGALI_TRANS[ch] ?? ''; }
  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  return slug.length >= 3 ? slug : `writing-${id}`;
}
function makeSlug(title: string, id: number): string {
  return `${makeLegacySlug(title, id)}-${id}`;
}
function matchesWritingSlug(writing: Writing, slug?: string): boolean {
  if (!slug) return false;
  return makeSlug(writing.title, writing.id) === slug || makeLegacySlug(writing.title, writing.id) === slug;
}

// ── Category Styles ───────────────────────────────────────────────────────────
function getCatStyle(cat: string) {
  const m: Record<string, { accent: string; bg: string; border: string; icon: string }> = {
    "ভালোবাসা": { accent: "#F472B6", bg: "rgba(244,114,182,.10)", border: "rgba(244,114,182,.35)", icon: "♡" },
    "বিচ্ছেদ":  { accent: "#A78BFA", bg: "rgba(167,139,250,.10)", border: "rgba(167,139,250,.35)", icon: "◌" },
    "কবিতা":    { accent: "#60A5FA", bg: "rgba(96,165,250,.10)",  border: "rgba(96,165,250,.35)",  icon: "❧" },
    "ছোট লেখা": { accent: "#34D399", bg: "rgba(52,211,153,.10)",  border: "rgba(52,211,153,.35)",  icon: "✎" },
    "জীবনদর্শন":{ accent: "#FBBF24", bg: "rgba(251,191,36,.10)",  border: "rgba(251,191,36,.35)",  icon: "◈" },
    "গল্প":      { accent: "#FB923C", bg: "rgba(251,146,60,.10)",  border: "rgba(251,146,60,.35)",  icon: "✦" },
  };
  return m[cat] ?? m["জীবনদর্শন"];
}

// ── Reading time estimate ─────────────────────────────────────────────────────
function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 100));
  return `${mins} মিনিট`;
}

// ── Theme config ──────────────────────────────────────────────────────────────
type Theme = "dark" | "sepia" | "light";
const THEMES: Record<Theme, { bg: string; surface: string; txt: string; sub: string; bdr: string; page: string }> = {
  dark:  { bg: "#020408", surface: "#0A1020", txt: "#F2EDE4", sub: "rgba(242,237,228,.5)",  bdr: "rgba(255,255,255,.08)", page: "#06080F" },
  sepia: { bg: "#1A1208", surface: "#231A0E", txt: "#EDE0C8", sub: "rgba(237,224,200,.5)",  bdr: "rgba(237,224,200,.12)", page: "#1A1208" },
  light: { bg: "#F5F0E8", surface: "#FFFFFF", txt: "#1A1208", sub: "rgba(26,18,8,.5)",      bdr: "rgba(26,18,8,.12)",    page: "#F5F0E8" },
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function WritingDetailPage({ params }: { params?: { slug?: string } }) {
  const [, setLocation] = useLocation();
  const [archive, setArchive] = useState<Writing[]>([]);
  const [writing, setWriting] = useState<Writing | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [fontSize, setFontSize] = useState(1.05);
  const [copied, setCopied] = useState(false);
  const [prevW, setPrevW] = useState<Writing | null>(null);
  const [nextW, setNextW] = useState<Writing | null>(null);
  const [related, setRelated] = useState<Writing[]>([]);
  const topRef = useRef<HTMLDivElement>(null);

  const T = THEMES[theme];

  // Load archive
  useEffect(() => {
    loadWritingsArchive().then(setArchive);
  }, []);

  // Find writing by slug
  useEffect(() => {
    if (!archive.length || !params?.slug) return;
    const found = archive.find(w => matchesWritingSlug(w, params.slug));
    if (found) {
      setWriting(found);
      setNotFound(false);
      // Find prev/next in same category
      const same = archive.filter(w => w.category === found.category);
      const idx = same.findIndex(w => w.id === found.id);
      setPrevW(idx > 0 ? same[idx - 1] : null);
      setNextW(idx < same.length - 1 ? same[idx + 1] : null);
      // Related: same category, different writing, max 4
      setRelated(same.filter(w => w.id !== found.id).slice(0, 4));
    } else {
      setNotFound(true);
    }
  }, [archive, params?.slug]);

  // Scroll to top on writing change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [writing?.id]);

  const handleCopy = () => {
    const url = `${window.location.origin}/writings/${params?.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareUrl = writing ? `${window.location.origin}/writings/${makeSlug(writing.title, writing.id)}` : "";

  const handleNativeShare = async () => {
    if (!writing) return;
    if (!navigator.share) {
      handleCopy();
      return;
    }
    try {
      await navigator.share({
        title: `${writing.title} — মাহবুব সরদার সবুজ`,
        text: `${writing.title} — মাহবুব সরদার সবুজের লেখা পড়ুন।`,
        url: shareUrl,
      });
    } catch {
      // User cancellation must not create an error state; they can still use copy or social actions.
    }
  };

  if (notFound) {
    return (
      <div style={{ background: "#020408", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
          <p style={{ color: "#F2EDE4", fontFamily: "'AdorshoLipi',sans-serif", fontSize: "1.2rem" }}>লেখাটি পাওয়া যায়নি।</p>
          <button onClick={() => setLocation("/writings")} style={{ background: "rgba(201,168,76,.15)", border: "1px solid rgba(201,168,76,.4)", color: "#C9A84C", padding: "10px 24px", borderRadius: 999, cursor: "pointer", fontFamily: "'AdorshoLipi',sans-serif", fontSize: ".9rem" }}>
            ← লেখালেখিতে ফিরুন
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!writing) {
    return (
      <div style={{ background: "#020408", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(201,168,76,.3)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const c = getCatStyle(writing.category);
  const paragraphs = writing.content.split(/\n\n+/).filter(Boolean);
  const writingPath = `/writings/${makeSlug(writing.title, writing.id)}`;
  const writingUrl = `${SITE_URL}${writingPath}`;
  const writingDescription = writing.content.slice(0, 160).trim();
  const writingJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: writing.title,
      description: writingDescription,
      inLanguage: "bn-BD",
      articleSection: writing.category,
      author: {
        "@type": "Person",
        name: "মাহবুব সরদার সবুজ",
        url: `${SITE_URL}/about`,
      },
      publisher: {
        "@type": "Organization",
        name: "মাহবুব সরদার সবুজ",
        url: SITE_URL,
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": writingUrl,
      },
      isAccessibleForFree: true,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "হোম", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "লেখালেখি", item: `${SITE_URL}/writings` },
        { "@type": "ListItem", position: 3, name: writing.title, item: writingUrl },
      ],
    },
  ];

  return (
    <div style={{ background: T.page, minHeight: "100vh", display: "flex", flexDirection: "column", transition: "background .3s" }}>
      <Seo
        title={`${writing.title} — মাহবুব সরদার সবুজ`}
        description={writingDescription}
        path={writingPath}
        type="article"
        jsonLd={writingJsonLd}
      />
      <Navbar />

      <main style={{ flex: 1, width: "100%", maxWidth: 860, margin: "0 auto", padding: "var(--site-nav-offset, 80px) 16px 64px" }}>
        <div ref={topRef} />

        {/* ── Back button ── */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .4 }}
          style={{ paddingTop: 8, paddingBottom: 8 }}
        >
          <button
            onClick={() => setLocation("/writings")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "transparent",
              border: `1px solid ${T.bdr}`,
              color: T.sub,
              padding: "7px 16px", borderRadius: 999,
              cursor: "pointer", fontSize: ".8rem",
              fontFamily: "'AdorshoLipi',sans-serif",
              transition: "all .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.color = c.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdr; e.currentTarget.style.color = T.sub; }}
          >
            <ArrowLeft size={14} /> লেখালেখি ও বই
          </button>
        </motion.div>

        {/* ── Article card ── */}
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .5, ease: [.25, .46, .45, .94] }}
          style={{
            background: T.surface,
            borderRadius: 24,
            overflow: "hidden",
            border: `1.5px solid ${T.bdr}`,
            boxShadow: `0 24px 64px rgba(0,0,0,.35), 0 0 0 1px ${c.border}`,
            marginTop: 8,
          }}
        >
          {/* ── Top toolbar ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 24px",
            borderBottom: `1px solid ${T.bdr}`,
            background: T.bg,
          }}>
            <span style={{ fontFamily: "'AdorshoLipi',sans-serif", fontSize: ".72rem", color: T.sub }}>
              লেখালেখি ও বই
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Font size */}
              <div style={{ display: "flex", border: `1px solid ${T.bdr}`, borderRadius: 8, overflow: "hidden" }}>
                <button onClick={() => setFontSize(f => Math.max(.82, f - .1))} style={{ background: "transparent", border: "none", color: T.sub, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <AArrowDown size={13} />
                </button>
                <button onClick={() => setFontSize(f => Math.min(1.4, f + .1))} style={{ background: "transparent", border: `none`, borderLeft: `1px solid ${T.bdr}`, color: T.sub, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <AArrowUp size={13} />
                </button>
              </div>
              {/* Theme toggle */}
              <button
                onClick={() => setTheme(t => t === "dark" ? "sepia" : t === "sepia" ? "light" : "dark")}
                style={{ background: "transparent", border: `1px solid ${T.bdr}`, color: T.sub, padding: "6px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: ".7rem", fontFamily: "'AdorshoLipi',sans-serif" }}
              >
                {theme === "dark" ? <Moon size={12} /> : theme === "sepia" ? <Scroll size={12} /> : <Sun size={12} />}
                {theme === "dark" ? "ডার্ক" : theme === "sepia" ? "সেপিয়া" : "লাইট"}
              </button>
              {/* Share */}
              <button
                onClick={handleCopy}
                style={{ background: copied ? "rgba(52,211,153,.12)" : "transparent", border: `1px solid ${copied ? "rgba(52,211,153,.4)" : T.bdr}`, color: copied ? "#34D399" : T.sub, padding: "6px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: ".7rem", fontFamily: "'AdorshoLipi',sans-serif", transition: "all .2s" }}
              >
                {copied ? <><Check size={12} /> কপি হয়েছে!</> : <><Copy size={12} /> লিংক কপি</>}
              </button>
            </div>
          </div>

          {/* ── Article body ── */}
          <div style={{ padding: "clamp(20px, 5vw, 48px)" }}>

                        {/* Title */}
            <h1 style={{
              fontFamily: "'AdorshoLipi',sans-serif",
              fontSize: "clamp(1.55rem, 4.5vw, 2.4rem)",
              color: T.txt,
              lineHeight: 1.3,
              margin: "0 0 0.4rem",
              fontWeight: 700,
              letterSpacing: "-.01em",
            }}>
              {writing.title}
            </h1>
            {/* Author — simple one-line, close to title */}
            <div style={{
              paddingBottom: "1.4rem",
              borderBottom: `1px solid ${T.bdr}`,
              marginBottom: "2rem",
            }}>
              <span style={{ fontFamily: "'AdorshoLipi',sans-serif", fontSize: ".85rem", color: T.sub }}>
                লেখক: <span style={{ color: T.txt, fontWeight: 600 }}>মাহবুব সরদার সবুজ</span>
              </span>
            </div>

            {/* ── Main content ── */}
            <div style={{ fontFamily: "'AdorshoLipi',sans-serif", fontSize: `${fontSize}rem`, color: T.txt, lineHeight: 1.95, letterSpacing: ".01em" }}>
              {paragraphs.map((para, i) => (
                <p key={i} style={{ marginBottom: "1.4em", textAlign: "left" }}>
                  {para}
                </p>
              ))}
            </div>

            {/* ── Closing signature ── */}
            <div style={{
              marginTop: "2.5rem", paddingTop: "1.5rem",
              borderTop: `1px solid ${T.bdr}`,
              display: "flex", flexWrap: "wrap", alignItems: "center",
              justifyContent: "space-between", gap: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.sub, fontSize: ".78rem", fontFamily: "'AdorshoLipi',sans-serif" }}>
                <Feather size={13} color={c.accent} />
                <span style={{ color: c.accent, fontWeight: 600 }}>মাহবুব সরদার সবুজ</span>
                <span>·</span>
                <span>{writing.category}</span>
                <span>·</span>
                <span>{writing.date ?? "২০২৬"}</span>
              </div>
              {/* Social share */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleNativeShare}
                  style={{ width: 36, height: 36, borderRadius: "50%", background: `rgba(${c.accent.replace('#','').match(/.{2}/g)?.map(x=>parseInt(x,16)).join(',') ?? '201,168,76'},.12)`, border: `1px solid ${c.border}`, color: c.accent, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  title="শেয়ার করুন"
                  aria-label="শেয়ার করুন"
                >
                  <Share2 size={15} />
                </button>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(24,119,242,.12)", border: "1px solid rgba(24,119,242,.3)", color: "#1877F2", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                  title="ফেসবুকে শেয়ার"
                >
                  <Facebook size={15} />
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(writing.title + " — " + shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(37,211,102,.12)", border: "1px solid rgba(37,211,102,.3)", color: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: 15 }}
                  title="হোয়াটসঅ্যাপে শেয়ার"
                >
                  💬
                </a>
                <button
                  onClick={handleCopy}
                  style={{ width: 36, height: 36, borderRadius: "50%", background: copied ? "rgba(52,211,153,.12)" : `rgba(${c.accent.replace('#','').match(/.{2}/g)?.map(x=>parseInt(x,16)).join(',') ?? '201,168,76'},.12)`, border: `1px solid ${copied ? "rgba(52,211,153,.4)" : c.border}`, color: copied ? "#34D399" : c.accent, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .2s" }}
                  title="লিংক কপি"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </motion.article>

        {/* ── Prev / Next navigation ── */}
        {(prevW || nextW) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .3, duration: .4 }}
            style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}
          >
            {prevW && (
              <Link
                href={`/writings/${makeSlug(prevW.title, prevW.id)}`}
                style={{
                  flex: 1, minWidth: 200,
                  display: "flex", alignItems: "center", gap: 10,
                  background: T.surface, border: `1px solid ${T.bdr}`,
                  borderRadius: 14, padding: "14px 18px",
                  textDecoration: "none", transition: "all .2s",
                  color: T.txt,
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = c.accent; }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = T.bdr; }}
              >
                <ChevronLeft size={18} color={c.accent} />
                <div>
                  <div style={{ fontSize: ".68rem", color: T.sub, fontFamily: "'AdorshoLipi',sans-serif", marginBottom: 2 }}>পূর্ববর্তী</div>
                  <div style={{ fontSize: ".85rem", fontFamily: "'AdorshoLipi',sans-serif", color: T.txt, lineHeight: 1.3, fontWeight: 600 }}>
                    {prevW.title.length > 40 ? prevW.title.slice(0, 40) + "…" : prevW.title}
                  </div>
                </div>
              </Link>
            )}
            {nextW && (
              <Link
                href={`/writings/${makeSlug(nextW.title, nextW.id)}`}
                style={{
                  flex: 1, minWidth: 200,
                  display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10,
                  background: T.surface, border: `1px solid ${T.bdr}`,
                  borderRadius: 14, padding: "14px 18px",
                  textDecoration: "none", transition: "all .2s",
                  color: T.txt, textAlign: "right",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = c.accent; }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = T.bdr; }}
              >
                <div>
                  <div style={{ fontSize: ".68rem", color: T.sub, fontFamily: "'AdorshoLipi',sans-serif", marginBottom: 2 }}>পরবর্তী</div>
                  <div style={{ fontSize: ".85rem", fontFamily: "'AdorshoLipi',sans-serif", color: T.txt, lineHeight: 1.3, fontWeight: 600 }}>
                    {nextW.title.length > 40 ? nextW.title.slice(0, 40) + "…" : nextW.title}
                  </div>
                </div>
                <ChevronRight size={18} color={c.accent} />
              </Link>
            )}
          </motion.div>
        )}

        {/* ── Related writings ── */}
        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .45, duration: .4 }}
            style={{ marginTop: 32 }}
          >
            <h2 style={{
              fontFamily: "'AdorshoLipi',sans-serif",
              fontSize: "1.1rem", color: T.txt,
              marginBottom: 14, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ color: c.accent }}>{getCatStyle(writing.category).icon}</span>
              আরও {writing.category}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {related.map(w => (
                <Link
                  key={w.id}
                  href={`/writings/${makeSlug(w.title, w.id)}`}
                  style={{
                    background: T.surface, border: `1px solid ${T.bdr}`,
                    borderRadius: 14, padding: "14px 16px",
                    textDecoration: "none", display: "block",
                    transition: "all .2s",
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = T.bdr; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ fontSize: ".72rem", color: c.accent, fontFamily: "'AdorshoLipi',sans-serif", marginBottom: 6, fontWeight: 600 }}>
                    {c.icon} {w.category}
                  </div>
                  <div style={{ fontSize: ".88rem", fontFamily: "'AdorshoLipi',sans-serif", color: T.txt, lineHeight: 1.4, fontWeight: 600 }}>
                    {w.title.length > 50 ? w.title.slice(0, 50) + "…" : w.title}
                  </div>
                  <div style={{ fontSize: ".72rem", color: T.sub, fontFamily: "'AdorshoLipi',sans-serif", marginTop: 6 }}>
                    {readingTime(w.content)} পড়তে লাগবে
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </main>

      <Footer />
    </div>
  );
}
