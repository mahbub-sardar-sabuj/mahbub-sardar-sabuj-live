import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useRoute } from "wouter";
import {
  ArrowRight, BookOpen, Bookmark, Calendar, ChevronDown, Copy, Feather,
  Grid2X2, Heart, Library, List, Search, Share2, Sparkles, X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { SITE_URL } from "@/components/Seo";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";
import { loadWritingsArchive } from "@/lib/loadWritingsArchive";
import type { Writing } from "@/data/writingsArchive";
import { FREE_EBOOKS, PRINTED_BOOKS, bookActionHref, bookActionLabel } from "@/data/bookCatalog";

const CATEGORIES = [
  { id: "all", label: "সব লেখা", tone: "#b98c38", hint: "সম্পূর্ণ সংগ্রহ" },
  { id: "কবিতা", label: "কবিতা", tone: "#4d89ca", hint: "ছন্দ ও অনুভব" },
  { id: "ভালোবাসা", label: "ভালোবাসা", tone: "#bc5d75", hint: "প্রেমের ভাষা" },
  { id: "বিচ্ছেদ", label: "বিচ্ছেদ", tone: "#7d6cb7", hint: "বিরহ ও স্মৃতি" },
  { id: "জীবনদর্শন", label: "জীবনদর্শন", tone: "#517f6e", hint: "জীবনের কথা" },
  { id: "ছোট লেখা", label: "ছোট লেখা", tone: "#5c9a87", hint: "এক নিঃশ্বাসে" },
  { id: "গল্প", label: "গল্প", tone: "#bd7545", hint: "কথার ভুবন" },
  { id: "ইসলামিক", label: "ইসলামিক", tone: "#378c70", hint: "শান্তির বাণী" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];
type ViewMode = "grid" | "list";
const PAGE_SIZE = 18;

function excerpt(text: string, maxLength = 155) {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength).trim()}…` : normalized;
}

const BENGALI_TRANS: Record<string, string> = {
  "অ":"o","আ":"a","ই":"i","ঈ":"i","উ":"u","ঊ":"u","এ":"e","ঐ":"oi","ও":"o","ঔ":"ou","ক":"k","খ":"kh","গ":"g","ঘ":"gh","ঙ":"ng","চ":"ch","ছ":"chh","জ":"j","ঝ":"jh","ঞ":"n","ট":"t","ঠ":"th","ড":"d","ঢ":"dh","ণ":"n","ত":"t","থ":"th","দ":"d","ধ":"dh","ন":"n","প":"p","ফ":"ph","ব":"b","ভ":"bh","ম":"m","য":"j","র":"r","ল":"l","শ":"sh","ষ":"sh","স":"s","হ":"h","ড়":"r","ঢ়":"rh","য়":"y","ৎ":"t","া":"a","ি":"i","ী":"i","ু":"u","ূ":"u","ে":"e","ৈ":"oi","ো":"o","ৌ":"ou","ং":"ng","ঃ":"h","ঁ":"n","্":""," ":"-","?":"","!":"",",":"",".":"","—":"-","–":"-",
};

function writingPath(writing: Writing) {
  const base = Array.from(writing.title).map((character) => BENGALI_TRANS[character] ?? "").join("").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  return `/writings/${base.length >= 3 ? `${base}-${writing.id}` : `writing-${writing.id}`}`;
}

function categoryMeta(category: string) {
  return CATEGORIES.find((item) => item.id === category) ?? CATEGORIES[0];
}

function humanCount(value: number) {
  return new Intl.NumberFormat("bn-BD").format(value);
}

function ReadingCard({ writing, viewMode, onOpen }: { writing: Writing; viewMode: ViewMode; onOpen: () => void }) {
  const [liked, setLiked] = useState(() => localStorage.getItem(`writing-like-${writing.id}`) === "1");
  const category = categoryMeta(writing.category);

  const toggleLike = (event: React.MouseEvent) => {
    event.stopPropagation();
    const next = !liked;
    setLiked(next);
    if (next) localStorage.setItem(`writing-like-${writing.id}`, "1");
    else localStorage.removeItem(`writing-like-${writing.id}`);
  };

  const share = async (event: React.MouseEvent) => {
    event.stopPropagation();
    const url = `${window.location.origin}${writingPath(writing)}`;
    try {
      if (navigator.share) await navigator.share({ title: writing.title, text: excerpt(writing.content, 90), url });
      else await navigator.clipboard.writeText(url);
    } catch {
      // A cancelled share should not interrupt reading.
    }
  };

  return (
    <article
      className={`wr-card ${viewMode === "list" ? "wr-card-list" : ""}`}
      onClick={onOpen}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(); } }}
      tabIndex={0}
      role="article"
      aria-label={`${writing.title} পড়ুন`}
    >
      <div className="wr-card-top">
        <span className="wr-category" style={{ color: category.tone, background: `${category.tone}14`, borderColor: `${category.tone}32` }}>{writing.category}</span>
        {writing.featured && <span className="wr-featured"><Sparkles size={12} /> নির্বাচিত</span>}
      </div>
      <h3>{writing.title}</h3>
      <p>{excerpt(writing.content, viewMode === "list" ? 230 : 165)}</p>
      <footer>
        <span><Calendar size={13} /> {writing.date}</span>
        <div className="wr-card-actions">
          <button onClick={toggleLike} aria-label={liked ? "পছন্দ বাতিল করুন" : "ভালো লেগেছে"} className={liked ? "is-liked" : ""}><Heart size={15} fill={liked ? "currentColor" : "none"} /></button>
          <button onClick={share} aria-label="লেখা শেয়ার করুন"><Share2 size={15} /></button>
          <button className="wr-read-button" onClick={(event) => { event.stopPropagation(); onOpen(); }}>পড়ুন <ArrowRight size={14} /></button>
        </div>
      </footer>
    </article>
  );
}

function PublicationCard({ slug, title, cover, description, genre, year, canRead, buyLink, accentColor }: (typeof PRINTED_BOOKS)[number]) {
  const href = bookActionHref({ slug, canRead, buyLink } as (typeof PRINTED_BOOKS)[number]);
  const external = !canRead;
  return (
    <article className="wr-publication" style={{ "--book-accent": accentColor } as React.CSSProperties}>
      <div className="wr-publication-cover"><img src={cover} alt={`${title} বইয়ের প্রচ্ছদ`} loading="lazy" /></div>
      <div className="wr-publication-copy">
        <span>{canRead ? "বিনামূল্যে ই-বুক" : "মুদ্রিত বই"}</span>
        <h3>{title}</h3>
        <p>{description}</p>
        <small>{genre} · {year}</small>
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="wr-book-action">{bookActionLabel({ canRead } as (typeof PRINTED_BOOKS)[number])} <ArrowRight size={14} /></a>
        ) : (
          <Link href={href} className="wr-book-action">{bookActionLabel({ canRead } as (typeof PRINTED_BOOKS)[number])} <ArrowRight size={14} /></Link>
        )}
      </div>
    </article>
  );
}

function WritingDialog({ writing, suggestions, onClose, onNavigate }: { writing: Writing; suggestions: Writing[]; onClose: () => void; onNavigate: (item: Writing) => void }) {
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [onClose]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${writingPath(writing)}`);
    } catch {
      // Clipboard permission may be unavailable; keep the reader open without an unhandled rejection.
    }
  };

  return (
    <motion.div className="wr-dialog-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.article className="wr-dialog" role="dialog" aria-modal="true" aria-label={writing.title} initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} transition={{ duration: 0.22 }}>
        <header>
          <div><span className="wr-category" style={{ color: categoryMeta(writing.category).tone, background: `${categoryMeta(writing.category).tone}14`, borderColor: `${categoryMeta(writing.category).tone}32` }}>{writing.category}</span><span className="wr-dialog-date">{writing.date}</span></div>
          <div className="wr-dialog-tools"><button onClick={copyLink} aria-label="লিংক কপি করুন"><Copy size={16} /></button><button onClick={onClose} aria-label="বন্ধ করুন"><X size={18} /></button></div>
        </header>
        <div className="wr-dialog-reading">
          <h1>{writing.title}</h1>
          {writing.content.split(/\n+/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
        {suggestions.length > 0 && (
          <aside className="wr-dialog-more"><span>আরও পড়ুন</span>{suggestions.slice(0, 3).map((item) => <button key={item.id} onClick={() => onNavigate(item)}>{item.title}<ArrowRight size={14} /></button>)}</aside>
        )}
      </motion.article>
    </motion.div>
  );
}

const CSS = `
  :root { --wr-ink:#112235; --wr-paper:#f7f5ef; --wr-paper-deep:#eeeadf; --wr-mist:#e4e0d5; --wr-gold:#bd8d3b; --wr-rust:#aa5b43; --wr-copy:#485462; --wr-line:rgba(17,34,53,.14); --wr-serif:'AdorshoLipi',sans-serif; --wr-sans:'AdorshoLipi',sans-serif; }
  .wr-page { background:var(--wr-paper); color:var(--wr-ink); min-height:100vh; padding-top:var(--site-nav-offset,92px); }
  .wr-shell { width:min(1240px, calc(100% - 32px)); margin:0 auto; padding:30px 0 72px; }
  .wr-hero { background:linear-gradient(122deg,#10243a 0%,#1b3447 58%,#6b4736 160%); color:#fffaf0; border-radius:28px; padding:clamp(28px,5vw,68px); display:grid; grid-template-columns:1.2fr .8fr; gap:36px; overflow:hidden; position:relative; box-shadow:0 22px 60px rgba(15,32,50,.18); }
  .wr-hero:after { content:'ম'; position:absolute; right:3%; bottom:-15%; font:clamp(160px,25vw,330px)/.8 var(--wr-serif); color:rgba(255,250,240,.045); pointer-events:none; }
  .wr-kicker,.wr-section-kicker { display:inline-flex; align-items:center; gap:8px; font:700 .72rem var(--wr-sans); letter-spacing:.12em; text-transform:uppercase; color:#e8c67d; }
  .wr-hero h1 { font:700 clamp(2.25rem,5vw,4.75rem)/1.12 var(--wr-serif); letter-spacing:-.055em; margin:16px 0; max-width:740px; }
  .wr-hero h1 em { color:#efc66d; font-style:normal; }
  .wr-hero p { max-width:630px; margin:0; color:rgba(255,250,240,.75); font:400 1rem/1.9 var(--wr-sans); }
  .wr-hero-search { margin-top:27px; max-width:610px; display:flex; align-items:center; gap:12px; background:#fffdf8; border-radius:14px; padding:5px 7px 5px 17px; box-shadow:0 12px 30px rgba(0,0,0,.18); color:var(--wr-ink); }
  .wr-hero-search input { min-width:0; flex:1; border:0; outline:0; background:transparent; font:500 1rem var(--wr-sans); color:var(--wr-ink); padding:10px 0; }
  .wr-hero-search button { border:0; border-radius:10px; background:var(--wr-ink); color:#fffaf0; padding:11px 15px; font:700 .82rem var(--wr-sans); }
  .wr-hero-aside { align-self:end; position:relative; z-index:1; display:grid; gap:12px; }
  .wr-stat { border-left:1px solid rgba(255,255,255,.27); padding:3px 0 3px 17px; }
  .wr-stat strong { display:block; font:700 1.85rem var(--wr-serif); color:#f1d48e; }.wr-stat span { font:500 .77rem var(--wr-sans); color:rgba(255,250,240,.7); }
  .wr-discovery { display:flex; flex-wrap:wrap; gap:9px; margin:22px 0 0; }.wr-discovery button { border:1px solid rgba(255,255,255,.22); background:rgba(255,255,255,.07); color:#fffaf0; border-radius:99px; padding:8px 12px; font:600 .78rem var(--wr-sans); }
  .wr-section { margin-top:42px; }.wr-section-head { display:flex; gap:20px; align-items:end; justify-content:space-between; margin-bottom:18px; }.wr-section-head h2 { margin:5px 0 0; font:700 clamp(1.55rem,3vw,2.35rem) var(--wr-serif); letter-spacing:-.04em; }.wr-section-head p { margin:0; color:var(--wr-copy); font:400 .9rem/1.7 var(--wr-sans); max-width:460px; }
  .wr-publication-stage { background:#14293c; color:#fffaf0; padding:clamp(20px,4vw,38px); border-radius:24px; }.wr-publication-stage .wr-section-head h2{color:#fffaf0}.wr-publication-stage .wr-section-head p{color:rgba(255,250,240,.7)}
  .wr-publications { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }.wr-publication { display:grid; grid-template-columns:112px 1fr; gap:18px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.05); padding:15px; border-radius:18px; min-width:0; }.wr-publication-cover img { display:block; width:100%; aspect-ratio:3/4; object-fit:cover; border-radius:10px; box-shadow:0 8px 20px rgba(0,0,0,.28); }.wr-publication-copy { display:flex; min-width:0; flex-direction:column; align-items:flex-start; }.wr-publication-copy>span { color:var(--book-accent); font:700 .7rem var(--wr-sans); }.wr-publication h3 { margin:5px 0 8px; font:700 1.2rem/1.35 var(--wr-serif); }.wr-publication p { margin:0; color:rgba(255,250,240,.7); font:400 .83rem/1.72 var(--wr-sans); }.wr-publication small { margin:10px 0; color:rgba(255,250,240,.52); font:.73rem var(--wr-sans); }.wr-book-action { margin-top:auto; display:inline-flex; align-items:center; gap:6px; background:var(--book-accent); color:#122131; text-decoration:none; border-radius:9px; padding:9px 11px; font:700 .76rem var(--wr-sans); }
  .wr-book-rail { margin-top:17px; display:flex; gap:11px; overflow:auto; padding-bottom:3px; scrollbar-width:none; }.wr-ebook { min-width:215px; display:grid; grid-template-columns:46px 1fr; gap:10px; text-decoration:none; color:#fffaf0; border:1px solid rgba(255,255,255,.12); border-radius:14px; padding:8px; background:rgba(255,255,255,.045); }.wr-ebook img{width:46px; height:62px; border-radius:6px; object-fit:cover}.wr-ebook strong{font:700 .83rem/1.4 var(--wr-serif)}.wr-ebook span{display:block;margin-top:4px;color:rgba(255,250,240,.58);font:.7rem var(--wr-sans)}
  .wr-explore { display:flex; gap:9px; overflow:auto; padding:3px 0 10px; scrollbar-width:none; }.wr-explore button { min-width:max-content; border:1px solid var(--wr-line); border-radius:12px; background:transparent; color:var(--wr-ink); padding:11px 13px; text-align:left; font:700 .82rem var(--wr-sans); transition:.18s ease; }.wr-explore button small{display:block;color:var(--wr-copy);font:400 .7rem var(--wr-sans);margin-top:2px}.wr-explore button.is-active{color:#fffaf0;background:var(--wr-ink);border-color:var(--wr-ink)}.wr-explore button.is-active small{color:rgba(255,250,240,.65)}
  .wr-archive { border-top:1px solid var(--wr-line); padding-top:32px; }.wr-archive-top { display:flex; gap:16px; justify-content:space-between; align-items:center; margin-bottom:17px; }.wr-result-note { color:var(--wr-copy); font:.83rem var(--wr-sans); }.wr-view-toggle { display:flex; padding:3px; background:var(--wr-mist); border-radius:9px; }.wr-view-toggle button { border:0; background:transparent; padding:7px; border-radius:7px; color:var(--wr-copy); }.wr-view-toggle button.is-on{background:#fffdf8;color:var(--wr-ink);box-shadow:0 2px 5px rgba(17,34,53,.12)}
  .wr-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:15px; }.wr-grid.list { display:grid; grid-template-columns:1fr; }.wr-card { display:flex; flex-direction:column; min-width:0; border:1px solid var(--wr-line); border-radius:16px; background:#fffdf8; padding:19px; cursor:pointer; transition:transform .18s ease, box-shadow .18s ease,border-color .18s ease; }.wr-card:hover,.wr-card:focus-visible { transform:translateY(-3px); box-shadow:0 14px 28px rgba(17,34,53,.1); border-color:rgba(189,141,59,.5); outline:none; }.wr-card-top { display:flex; justify-content:space-between; gap:8px; align-items:center; }.wr-category,.wr-featured { display:inline-flex; gap:4px; align-items:center; border:1px solid; border-radius:99px; padding:4px 8px; font:700 .67rem var(--wr-sans); }.wr-featured{border:0;color:var(--wr-rust);background:#f8eadf}.wr-card h3{font:700 1.2rem/1.43 var(--wr-serif);margin:14px 0 9px;letter-spacing:-.025em}.wr-card p{margin:0;color:var(--wr-copy);font:400 .83rem/1.78 var(--wr-sans);}.wr-card footer{border-top:1px solid var(--wr-line);display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:auto;padding-top:14px;padding-top:14px;}.wr-card footer>span{display:flex;align-items:center;gap:5px;color:#78818a;font:.7rem var(--wr-sans)}.wr-card-actions{display:flex;gap:5px;align-items:center}.wr-card-actions button{border:0;background:transparent;color:#68737d;padding:6px;display:flex;align-items:center;border-radius:7px}.wr-card-actions button:hover{background:var(--wr-mist);color:var(--wr-ink)}.wr-card-actions .is-liked{color:#b4545f}.wr-card-actions .wr-read-button{gap:4px;color:var(--wr-ink);font:700 .73rem var(--wr-sans);padding-right:0}.wr-card-list{display:grid;grid-template-columns:minmax(220px,.8fr) 1.5fr auto;align-items:center;gap:18px}.wr-card-list .wr-card-top{grid-column:1}.wr-card-list h3{grid-column:1;margin:7px 0}.wr-card-list p{grid-column:2;grid-row:1/3}.wr-card-list footer{grid-column:3;grid-row:1/3;border:0;padding:0;flex-direction:column;align-items:end}.wr-card-list footer>span{white-space:nowrap}
  .wr-empty{border:1px dashed var(--wr-line);text-align:center;padding:54px 20px;background:#fffdf8;border-radius:16px;color:var(--wr-copy);font:var(--wr-sans)}.wr-empty button{margin-top:13px;border:0;border-radius:9px;background:var(--wr-ink);color:#fffaf0;padding:10px 14px;font:700 .78rem var(--wr-sans)}.wr-more{display:flex;align-items:center;justify-content:center;gap:12px;margin:25px 0 0}.wr-more button{border:1px solid var(--wr-ink);background:transparent;color:var(--wr-ink);border-radius:10px;padding:10px 14px;font:700 .78rem var(--wr-sans)}.wr-more span{color:var(--wr-copy);font:.72rem var(--wr-sans)}
  .wr-dialog-backdrop{position:fixed;z-index:80;inset:0;background:rgba(8,18,29,.66);backdrop-filter:blur(7px);padding:22px;display:grid;place-items:center}.wr-dialog{width:min(760px,100%);max-height:min(88vh,900px);overflow:auto;background:#fffdf8;border-radius:20px;box-shadow:0 26px 70px rgba(0,0,0,.3);padding:22px}.wr-dialog>header{display:flex;justify-content:space-between;gap:12px;align-items:center;border-bottom:1px solid var(--wr-line);padding-bottom:15px}.wr-dialog-date{margin-left:9px;color:var(--wr-copy);font:.75rem var(--wr-sans)}.wr-dialog-tools{display:flex;gap:7px}.wr-dialog-tools button{border:1px solid var(--wr-line);border-radius:8px;background:transparent;color:var(--wr-ink);padding:7px}.wr-dialog-reading{max-width:650px;margin:30px auto}.wr-dialog-reading h1{font:700 clamp(1.7rem,4vw,2.6rem)/1.35 var(--wr-serif);letter-spacing:-.04em;margin:0 0 22px}.wr-dialog-reading p{font:400 1.05rem/2.05 var(--wr-serif);color:#263b4b;margin:0 0 18px}.wr-dialog-more{border-top:1px solid var(--wr-line);padding-top:16px}.wr-dialog-more>span{font:700 .74rem var(--wr-sans);color:var(--wr-copy)}.wr-dialog-more button{width:100%;border:0;border-bottom:1px solid var(--wr-line);display:flex;justify-content:space-between;align-items:center;background:transparent;padding:11px 0;color:var(--wr-ink);font:600 .87rem var(--wr-sans);text-align:left}
  @media (max-width:900px){.wr-hero{grid-template-columns:1fr}.wr-hero-aside{grid-template-columns:repeat(3,1fr);margin-top:8px}.wr-publications{grid-template-columns:1fr}.wr-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.wr-card-list{grid-template-columns:1fr}.wr-card-list .wr-card-top,.wr-card-list h3,.wr-card-list p,.wr-card-list footer{grid-column:auto;grid-row:auto}.wr-card-list footer{flex-direction:row;align-items:center;border-top:1px solid var(--wr-line);padding-top:14px}}
  @media (max-width:620px){.wr-shell{width:min(100% - 24px,1240px);padding-top:16px}.wr-hero{border-radius:20px;padding:25px 20px}.wr-hero h1{font-size:2.45rem}.wr-hero-aside{grid-template-columns:repeat(3,1fr)}.wr-stat{padding-left:9px}.wr-stat strong{font-size:1.35rem}.wr-stat span{font-size:.65rem}.wr-hero-search{margin-top:20px}.wr-hero-search button{font-size:.72rem;padding:10px}.wr-section{margin-top:31px}.wr-section-head{display:block}.wr-section-head p{margin-top:8px}.wr-publication{grid-template-columns:82px 1fr;gap:13px}.wr-publication h3{font-size:1.05rem}.wr-grid{grid-template-columns:1fr;gap:11px}.wr-card{padding:16px}.wr-archive-top{align-items:end}.wr-more{flex-direction:column}.wr-dialog-backdrop{padding:10px}.wr-dialog{padding:16px;border-radius:16px;max-height:92vh}.wr-dialog-reading{margin:22px auto}.wr-dialog-reading p{font-size:1rem;line-height:1.95}}
  @media (prefers-reduced-motion:reduce){.wr-card{transition:none}.wr-card:hover{transform:none}}

  /* ── Reader-first iPhone glass refinement ─────────────────────────────── */
  .wr-page { --wr-ink:#101827; --wr-copy:#314054; --wr-paper:#eef3fa; --wr-paper-deep:#e5edf8; --wr-mist:#dce7f5; --wr-line:rgba(23,42,69,.16); --wr-gold:#b87924; background:radial-gradient(circle at 12% 5%,rgba(129,180,255,.26),transparent 28%),radial-gradient(circle at 90% 13%,rgba(255,204,113,.20),transparent 25%),linear-gradient(155deg,#f8fbff 0%,#edf3fb 52%,#e6eef9 100%); color:var(--wr-ink); }
  .wr-page, .wr-page button, .wr-page input { font-family:'AdorshoLipi',sans-serif; }
  .wr-shell { padding-top:clamp(18px,3vw,38px); }
  .wr-hero { isolation:isolate; border:1px solid rgba(255,255,255,.48); background:radial-gradient(circle at 82% 15%,rgba(143,191,255,.26),transparent 28%),radial-gradient(circle at 6% 115%,rgba(255,195,103,.18),transparent 42%),linear-gradient(138deg,#111c35 0%,#172d50 48%,#29415f 100%); box-shadow:0 24px 70px rgba(22,47,83,.24),inset 0 1px 0 rgba(255,255,255,.18); backdrop-filter:blur(26px) saturate(150%); }
  .wr-hero:before { content:''; position:absolute; inset:0; z-index:-1; pointer-events:none; background:linear-gradient(120deg,rgba(255,255,255,.10),transparent 35%,rgba(255,255,255,.04)); }
  .wr-hero:after { color:rgba(232,244,255,.085); }
  .wr-kicker,.wr-section-kicker { color:#ffd58b; letter-spacing:.045em; }
  .wr-hero h1,.wr-hero h1 em { color:#f8fbff; letter-spacing:-.025em; }
  .wr-hero h1 em { color:#ffd36e; }
  .wr-hero p { color:#edf4ff; font-size:1.07rem; line-height:1.85; }
  .wr-hero-search { background:rgba(255,255,255,.94); border:1px solid rgba(255,255,255,.78); border-radius:16px; box-shadow:0 14px 30px rgba(4,13,31,.25),inset 0 1px 0 #fff; }
  .wr-hero-search input { color:#101827; font-weight:600; }.wr-hero-search input::placeholder { color:#536277; opacity:1; }
  .wr-hero-search button { background:#172b4a; color:#fff; border-radius:12px; box-shadow:0 5px 14px rgba(14,35,63,.26); }
  .wr-discovery button { background:rgba(255,255,255,.13); border-color:rgba(255,255,255,.38); color:#fff; backdrop-filter:blur(14px); }
  .wr-discovery button:hover,.wr-discovery button:focus-visible { background:rgba(255,255,255,.23); }
  .wr-stat { border-left-color:rgba(255,255,255,.46); }.wr-stat strong{color:#fff2c9}.wr-stat span{color:#e8f0fb;font-size:.8rem}
  .wr-section-head h2 { color:#131f31; letter-spacing:-.018em; }.wr-section-head p { color:#3b4b61; font-size:.95rem; }
  .wr-publication-stage { position:relative; overflow:hidden; border:1px solid rgba(255,255,255,.32); background:radial-gradient(circle at 90% 5%,rgba(114,177,255,.18),transparent 32%),linear-gradient(135deg,rgba(18,38,66,.96),rgba(29,56,91,.94)); box-shadow:0 20px 56px rgba(21,44,79,.22),inset 0 1px 0 rgba(255,255,255,.13); backdrop-filter:blur(26px) saturate(145%); }
  .wr-publication-stage .wr-section-head h2 { color:#f8fbff; }.wr-publication-stage .wr-section-head p { color:#e2ecfa; }
  .wr-publication { border-color:rgba(255,255,255,.25); background:rgba(255,255,255,.11); box-shadow:inset 0 1px 0 rgba(255,255,255,.16); backdrop-filter:blur(16px); }
  .wr-publication h3,.wr-ebook strong { color:#fff; }.wr-publication p { color:#eef5ff; font-size:.9rem; }.wr-publication small,.wr-ebook span { color:#d8e5f6; }.wr-book-action { color:#132137; box-shadow:0 7px 18px rgba(0,0,0,.18); }
  .wr-ebook { border-color:rgba(255,255,255,.22); background:rgba(255,255,255,.10); backdrop-filter:blur(14px); }
  .wr-explore button { background:rgba(255,255,255,.70); border-color:rgba(255,255,255,.85); color:#16243a; box-shadow:0 8px 22px rgba(42,72,110,.08),inset 0 1px 0 #fff; backdrop-filter:blur(18px); }
  .wr-explore button small { color:#485a72; }.wr-explore button.is-active { background:#1a3458; border-color:#1a3458; color:#fff; box-shadow:0 10px 22px rgba(20,49,84,.26); }.wr-explore button.is-active small { color:#e6effd; }
  .wr-archive { border-top-color:rgba(57,83,119,.20); }.wr-view-toggle { background:rgba(219,230,244,.82); border:1px solid rgba(255,255,255,.72); box-shadow:inset 0 1px 0 #fff; }.wr-view-toggle button { color:#344861; }.wr-view-toggle button.is-on { background:rgba(255,255,255,.92); color:#13253e; box-shadow:0 4px 11px rgba(35,56,87,.16); }
  .wr-card { border-color:rgba(255,255,255,.88); background:linear-gradient(145deg,rgba(255,255,255,.92),rgba(246,250,255,.74)); box-shadow:0 12px 34px rgba(28,57,94,.11),inset 0 1px 0 rgba(255,255,255,.9); backdrop-filter:blur(20px) saturate(150%); }
  .wr-card:hover,.wr-card:focus-visible { transform:translateY(-4px); border-color:rgba(133,179,239,.72); box-shadow:0 20px 42px rgba(28,57,94,.19),inset 0 1px 0 #fff; }.wr-card h3{color:#14233a;letter-spacing:-.01em}.wr-card p{color:#35465e;font-size:.9rem}.wr-card footer{border-top-color:rgba(55,80,113,.14)}.wr-card footer>span,.wr-card-actions button{color:#4f6076}.wr-card-actions button:hover{background:#e7f0fa;color:#11294a}.wr-card-actions .wr-read-button{color:#14365f}
  .wr-empty { border-color:rgba(91,122,163,.35); background:rgba(255,255,255,.78); color:#35465e; box-shadow:inset 0 1px 0 #fff; }.wr-empty button,.wr-more button { background:#173457; border-color:#173457; color:#fff; box-shadow:0 8px 18px rgba(23,52,87,.18); }.wr-more span,.wr-result-note { color:#40536b; }
  .wr-dialog-backdrop { background:rgba(11,22,39,.56); backdrop-filter:blur(18px) saturate(145%); }.wr-dialog { border:1px solid rgba(255,255,255,.72); background:rgba(249,252,255,.94); box-shadow:0 28px 82px rgba(0,0,0,.34),inset 0 1px 0 #fff; backdrop-filter:blur(28px); }.wr-dialog-reading h1 { color:#111f35; letter-spacing:-.018em; }.wr-dialog-reading p { color:#26384f; font-size:1.1rem; line-height:2; }.wr-dialog-date,.wr-dialog-more>span { color:#475a72; }.wr-dialog-tools button { background:rgba(255,255,255,.72); color:#152941; border-color:rgba(69,96,132,.25); }
  /* ── Unified site palette: literary ink, warm gold, dark glass ─────────── */
  .wr-page{--wr-ink:#f8f3e7;--wr-copy:#c7d0dc;--wr-paper:#060e1a;--wr-paper-deep:#0a1625;--wr-mist:#12243a;--wr-line:rgba(201,168,76,.23);--wr-gold:#d4a843;background:radial-gradient(circle at 88% 4%,rgba(201,168,76,.10),transparent 29%),radial-gradient(circle at 7% 18%,rgba(40,83,129,.16),transparent 30%),#060e1a;color:var(--wr-ink)}
  .wr-hero{border-color:rgba(201,168,76,.30);background:radial-gradient(circle at 82% 12%,rgba(201,168,76,.12),transparent 28%),linear-gradient(138deg,#071321 0%,#0b1d31 55%,#102842 100%);box-shadow:0 26px 72px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.08)}.wr-hero:before{background:linear-gradient(120deg,rgba(255,255,255,.06),transparent 38%,rgba(201,168,76,.05))}.wr-hero:after{color:rgba(212,168,67,.08)}
  .wr-kicker,.wr-section-kicker{color:#e7c56f}.wr-hero h1,.wr-hero h1 em{color:#f8f3e7}.wr-hero h1 em{color:#e8c46f}.wr-hero p{color:#d5dde7}.wr-hero-search{background:rgba(255,252,244,.96);border-color:rgba(212,168,67,.42);box-shadow:0 14px 30px rgba(0,0,0,.30),inset 0 1px 0 #fff}.wr-hero-search input{color:#101c2b}.wr-hero-search button{background:#0b2038;color:#fff9ec}.wr-discovery button{background:rgba(255,255,255,.06);border-color:rgba(212,168,67,.30);color:#f8f3e7}.wr-stat{border-left-color:rgba(212,168,67,.42)}.wr-stat strong{color:#f3d78d}.wr-stat span{color:#d5dde7}
  .wr-section-head h2{color:#f8f3e7}.wr-section-head p{color:#c2ccd8}.wr-publication-stage{border-color:rgba(201,168,76,.26);background:radial-gradient(circle at 92% 8%,rgba(201,168,76,.11),transparent 29%),linear-gradient(138deg,#0a1b2e,#102943);box-shadow:0 22px 60px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.08)}.wr-publication{border-color:rgba(255,255,255,.11);background:rgba(255,255,255,.045);box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}.wr-publication h3,.wr-ebook strong{color:#f8f3e7}.wr-publication p{color:#d5dde7}.wr-publication small,.wr-ebook span{color:#b6c2d0}.wr-ebook{border-color:rgba(255,255,255,.11);background:rgba(255,255,255,.04)}
  .wr-explore button{background:rgba(12,30,50,.76);border-color:rgba(201,168,76,.24);color:#eef3f8;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}.wr-explore button small{color:#b7c3d1}.wr-explore button.is-active{background:#b98c38;border-color:#d4a843;color:#101c2b;box-shadow:0 10px 22px rgba(0,0,0,.25)}.wr-explore button.is-active small{color:#26394d}.wr-archive{border-top-color:rgba(201,168,76,.20)}.wr-view-toggle{background:#0d2035;border-color:rgba(201,168,76,.18);box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}.wr-view-toggle button{color:#bdc9d5}.wr-view-toggle button.is-on{background:#19344f;color:#f8f3e7;box-shadow:0 4px 11px rgba(0,0,0,.25)}
  .wr-card{border-color:rgba(255,255,255,.10);background:linear-gradient(145deg,rgba(18,42,67,.94),rgba(10,25,42,.95));box-shadow:0 12px 34px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.07)}.wr-card:hover,.wr-card:focus-visible{border-color:rgba(212,168,67,.55);box-shadow:0 20px 42px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.09)}.wr-card h3{color:#f8f3e7}.wr-card p{color:#c9d2de}.wr-card footer{border-top-color:rgba(255,255,255,.10)}.wr-card footer>span,.wr-card-actions button{color:#b6c2d0}.wr-card-actions button:hover{background:#1a354f;color:#f8f3e7}.wr-card-actions .wr-read-button{color:#e8c46f}.wr-empty{border-color:rgba(201,168,76,.28);background:#0d2035;color:#cbd5df;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}.wr-empty button,.wr-more button{background:#c99f4d;border-color:#d9b869;color:#101d2c;box-shadow:0 8px 18px rgba(0,0,0,.22)}.wr-more span,.wr-result-note{color:#bac6d3}
  .wr-dialog-backdrop{background:rgba(3,10,18,.78)}.wr-dialog{border-color:rgba(201,168,76,.27);background:linear-gradient(145deg,#102840,#091a2c);box-shadow:0 28px 82px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08)}.wr-dialog-reading h1{color:#f8f3e7}.wr-dialog-reading p{color:#d7dfe8}.wr-dialog-date,.wr-dialog-more>span{color:#b9c5d2}.wr-dialog-tools button{background:#17334f;color:#f8f3e7;border-color:rgba(201,168,76,.24)}.wr-dialog-more{border-top-color:rgba(255,255,255,.10)}.wr-dialog-more button{color:#edf2f6;border-bottom-color:rgba(255,255,255,.10)}
  /* ── Unified search control: navy glass + warm gold action ─────────────── */
  .wr-hero-search{background:linear-gradient(135deg,rgba(20,48,76,.94),rgba(10,28,48,.96));border:1px solid rgba(212,168,67,.46);border-radius:18px;padding:6px 7px 6px 16px;box-shadow:0 16px 34px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.10);color:#e8c46f;backdrop-filter:blur(18px) saturate(140%);transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease}
  .wr-hero-search:focus-within{border-color:#e8c46f;box-shadow:0 0 0 4px rgba(212,168,67,.14),0 18px 38px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.14);transform:translateY(-1px)}
  .wr-hero-search input{color:#f8f3e7;caret-color:#e8c46f;font-weight:600}.wr-hero-search input::placeholder{color:#bfcbd8;opacity:1}.wr-hero-search>svg{flex:0 0 auto;color:#e8c46f;filter:drop-shadow(0 0 6px rgba(232,196,111,.28))}.wr-hero-search button{background:#c99f4d;border:1px solid #e1bd69;color:#101d2c;border-radius:12px;padding:11px 16px;box-shadow:0 6px 16px rgba(0,0,0,.24);transition:background .2s ease,transform .2s ease,box-shadow .2s ease}.wr-hero-search button:hover,.wr-hero-search button:focus-visible{background:#e0b85d;box-shadow:0 9px 20px rgba(0,0,0,.30);transform:translateY(-1px);outline:none}
  @media(max-width:620px){.wr-page{background:radial-gradient(circle at 90% 0,rgba(201,168,76,.08),transparent 34%),#060e1a}.wr-hero{border-radius:24px}.wr-hero h1{font-size:2.35rem}.wr-hero p{font-size:1rem}.wr-section-head h2{font-size:1.72rem}.wr-card p{font-size:.88rem}.wr-publication p{font-size:.86rem}.wr-dialog-reading p{font-size:1.04rem;line-height:1.95}.wr-hero-search{gap:9px;padding-left:13px}.wr-hero-search button{padding:10px 13px;font-size:.72rem}}

  /* ── Signature literary edition: premium book-first finish ───────────── */
  .wr-shell{position:relative}.wr-shell:before{content:'';position:absolute;z-index:0;width:min(54vw,680px);height:330px;right:-14%;top:260px;pointer-events:none;background:radial-gradient(ellipse,rgba(212,168,67,.10),transparent 68%);filter:blur(10px)}.wr-shell>*{position:relative;z-index:1}
  .wr-hero{min-height:clamp(330px,37vw,430px);align-items:center;border-radius:32px;box-shadow:0 30px 88px rgba(0,0,0,.44),0 1px 0 rgba(255,255,255,.10) inset}.wr-hero:after{font-size:clamp(190px,27vw,350px);right:1%;bottom:-11%;text-shadow:0 0 48px rgba(212,168,67,.08)}
  .wr-hero-aside{align-self:stretch;place-content:center;gap:16px;padding:24px 0 24px 8%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.025));border-radius:22px}.wr-stat{padding:7px 0 7px 20px}.wr-stat strong{font-size:clamp(1.75rem,2.4vw,2.25rem);letter-spacing:-.025em}.wr-stat span{letter-spacing:.015em}
  .wr-publication-stage{border-radius:30px;padding:clamp(22px,4vw,44px);isolation:isolate}.wr-publication-stage:before{content:'';position:absolute;z-index:-1;inset:0;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,.045),transparent 30%,rgba(212,168,67,.04));}.wr-publication-stage:after{content:'প্রকাশনা';position:absolute;z-index:-1;right:-1%;bottom:-21px;pointer-events:none;color:rgba(212,168,67,.045);font:700 clamp(5rem,12vw,11rem)/1 var(--wr-serif);letter-spacing:-.08em}
  .wr-publications{gap:20px}.wr-publication{position:relative;overflow:hidden;min-height:250px;border-radius:22px;padding:19px;gap:21px;transition:transform .24s cubic-bezier(.23,1,.32,1),border-color .24s ease,box-shadow .24s ease}.wr-publication:before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(123deg,rgba(255,255,255,.08),transparent 29%,transparent 70%,color-mix(in srgb,var(--book-accent) 16%,transparent));opacity:.78}.wr-publication:hover{transform:translateY(-5px);border-color:color-mix(in srgb,var(--book-accent) 70%,white);box-shadow:0 20px 38px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.15)}.wr-publication-cover{position:relative;align-self:center}.wr-publication-cover:after{content:'';position:absolute;inset:7% -9% -6% 18%;z-index:-1;background:color-mix(in srgb,var(--book-accent) 50%,transparent);filter:blur(20px);opacity:.44}.wr-publication-cover img{border-radius:12px;border:1px solid rgba(255,255,255,.24);box-shadow:8px 14px 30px rgba(0,0,0,.43),inset 0 0 0 1px rgba(255,255,255,.10);transition:transform .26s cubic-bezier(.23,1,.32,1)}.wr-publication:hover .wr-publication-cover img{transform:rotate(-1.8deg) translateY(-2px)}.wr-publication-copy{position:relative;z-index:1}.wr-publication-copy>span{padding:4px 8px;border:1px solid color-mix(in srgb,var(--book-accent) 55%,transparent);border-radius:99px;background:color-mix(in srgb,var(--book-accent) 12%,transparent);letter-spacing:.025em}.wr-publication h3{font-size:clamp(1.18rem,2vw,1.48rem);line-height:1.3}.wr-book-action{border:1px solid color-mix(in srgb,var(--book-accent) 70%,white);border-radius:11px;padding:10px 13px;transition:transform .16s ease,filter .16s ease;box-shadow:0 8px 20px rgba(0,0,0,.22)}.wr-book-action:hover{transform:translateY(-2px);filter:brightness(1.08)}.wr-book-action:active{transform:scale(.97)}
  .wr-book-rail{gap:13px;margin-top:22px;padding:2px 2px 8px;scroll-snap-type:x mandatory}.wr-ebook{min-width:242px;grid-template-columns:54px 1fr;gap:12px;padding:10px;border-radius:16px;scroll-snap-align:start;transition:transform .18s ease,border-color .18s ease,background .18s ease}.wr-ebook:hover{transform:translateY(-3px);border-color:rgba(212,168,67,.55);background:rgba(255,255,255,.09)}.wr-ebook img{width:54px;height:72px;border-radius:9px;box-shadow:4px 7px 15px rgba(0,0,0,.34)}.wr-ebook strong{font-size:.92rem}.wr-ebook span{font-size:.74rem;line-height:1.5}
  .wr-section{margin-top:52px}.wr-section-head{margin-bottom:22px}.wr-section-kicker{padding:5px 9px;border:1px solid rgba(212,168,67,.22);border-radius:99px;background:rgba(212,168,67,.07);letter-spacing:.035em}.wr-explore{gap:11px;padding:4px 2px 12px}.wr-explore button{border-radius:15px;padding:13px 15px;transition:transform .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease}.wr-explore button:hover{transform:translateY(-2px);border-color:rgba(212,168,67,.48)}
  .wr-archive{margin-top:56px;padding-top:42px}.wr-grid{gap:18px}.wr-card{border-radius:21px;padding:21px;min-height:252px;transition:transform .22s cubic-bezier(.23,1,.32,1),border-color .22s ease,box-shadow .22s ease}.wr-card:before{content:'';display:block;width:34px;height:2px;margin:2px 0 12px;border-radius:99px;background:linear-gradient(90deg,var(--wr-gold),transparent)}.wr-card h3{font-size:1.3rem;line-height:1.35}.wr-card p{line-height:1.84}.wr-card footer{padding-top:15px}.wr-card-actions{gap:7px}.wr-card-actions button{border:1px solid transparent}.wr-card-actions button:hover{border-color:rgba(212,168,67,.25)}.wr-card-actions .wr-read-button{padding:7px 9px;border-color:rgba(212,168,67,.24);background:rgba(212,168,67,.06);border-radius:9px}.wr-card-actions .wr-read-button:hover{background:rgba(212,168,67,.13)}
  /* Keep decorative glows inside the layout; a negative right offset here could make iPhone Safari horizontally scroll the whole page. */
  .wr-page{overflow-x:clip}.wr-shell:before{right:0}
  @media(max-width:900px){.wr-hero-aside{padding-left:0;background:none}.wr-publication{min-height:0}}@media(max-width:620px){.wr-shell{width:calc(100% - 20px);padding-bottom:52px}.wr-hero{min-height:0;border-radius:25px;padding:27px 21px}.wr-hero-aside{gap:8px;margin-top:14px}.wr-stat{padding:7px 0 7px 10px}.wr-stat strong{font-size:1.43rem}.wr-publication-stage{border-radius:25px;padding:20px 16px}.wr-publications{gap:13px}.wr-publication{border-radius:18px;padding:14px;gap:14px}.wr-publication-cover img{border-radius:9px}.wr-publication-copy>span{font-size:.64rem}.wr-book-rail{margin-left:-2px;margin-right:-2px}.wr-ebook{min-width:220px}.wr-section{margin-top:39px}.wr-grid{gap:13px}.wr-card{min-height:0;border-radius:18px;padding:17px}.wr-card h3{font-size:1.2rem}.wr-card:before{margin-bottom:10px}}
`;

export default function Writings() {
  const [archive, setArchive] = useState<Writing[]>([]);
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Writing | null>(null);
  const deferredQuery = useDeferredValue(query);
  const [, setLocation] = useLocation();
  const [matchesRoute, params] = useRoute("/writings/:slug");

  useEffect(() => {
    let active = true;
    loadWritingsArchive().then((items) => { if (active) { setArchive(items); setReady(true); } }).catch(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => { setVisible(PAGE_SIZE); }, [category, deferredQuery]);

  useEffect(() => {
    if (!matchesRoute || !params?.slug || !ready) return;
    const id = Number(params.slug.replace(/^w-/, "").split("-").pop());
    const item = archive.find((writing) => writing.id === id);
    if (item) setSelected(item);
    else setLocation("/writings", { replace: true });
  }, [archive, matchesRoute, params?.slug, ready, setLocation]);

  const results = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    return archive.filter((writing) => {
      const categoryMatches = category === "all" || writing.category === category;
      const searchMatches = !normalized || `${writing.title} ${writing.content} ${writing.category}`.toLowerCase().includes(normalized);
      return categoryMatches && searchMatches;
    });
  }, [archive, category, deferredQuery]);

  const highlighted = useMemo(() => {
    const featured = archive.filter((item) => item.featured);
    return (featured.length >= 3 ? featured : archive).slice(0, 3);
  }, [archive]);
  const displayed = results.slice(0, visible);
  const selectedSuggestions = useMemo(() => selected ? archive.filter((item) => item.id !== selected.id && (item.category === selected.category || item.featured)).slice(0, 3) : [], [archive, selected]);

  const openWriting = (writing: Writing) => {
    setSelected(writing);
    setLocation(writingPath(writing));
  };
  const closeWriting = () => {
    setSelected(null);
    setLocation("/writings");
  };
  const selectedCategory = categoryMeta(category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", name: "লেখালেখি — মাহবুব সরদার সবুজ", url: `${SITE_URL}/writings`, inLanguage: "bn-BD", description: "মাহবুব সরদার সবুজের বাংলা কবিতা, ছোট লেখা, ভালোবাসা, বিচ্ছেদ ও জীবনদর্শনের পাঠযোগ্য সংগ্রহ।" },
      ...PRINTED_BOOKS.map((book) => ({ "@type": "Book", name: book.title, url: book.buyLink, image: `${SITE_URL}${book.cover}`, inLanguage: "bn-BD", bookFormat: "Paperback", isAccessibleForFree: false })),
    ],
  };

  return (
    <>
      <Seo title="লেখালেখি — মাহবুব সরদার সবুজ | কবিতা, গদ্য ও অনুভূতির সংগ্রহ" description="মাহবুব সরদার সবুজের কবিতা, ছোট লেখা, ভালোবাসা, বিচ্ছেদ ও জীবনদর্শনের নির্বাচিত বাংলা লেখা সহজে খুঁজুন ও পড়ুন।" path="/writings" keywords="মাহবুব সরদার সবুজ লেখা, বাংলা কবিতা, ভালোবাসার লেখা, বিচ্ছেদের কবিতা, বাংলা গদ্য" jsonLd={jsonLd} />
      <Navbar />
      <style>{CSS}</style>
      <main className="wr-page">
        <div className="wr-shell">
          <section className="wr-hero" aria-labelledby="writings-title">
            <div>
              <span className="wr-kicker"><Feather size={14} /> পাঠের জন্য সাজানো</span>
              <h1 id="writings-title">শব্দে খুঁজুন <em>নিজের কথা</em></h1>
              <p>মাহবুব সরদার সবুজের কবিতা, গদ্য ও অনুভূতির সংগ্রহ—যেখানে পড়ার শুরুটা আপনার পছন্দের বিষয় থেকেই।</p>
              <label className="wr-hero-search"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="কোন অনুভূতির লেখা খুঁজছেন?" aria-label="লেখা খুঁজুন" /><button onClick={() => document.getElementById("reading-archive")?.scrollIntoView({ behavior: "smooth" })}>লেখা খুঁজুন</button></label>
              <div className="wr-discovery" aria-label="জনপ্রিয় বিষয়">
                {CATEGORIES.filter((item) => ["ভালোবাসা", "বিচ্ছেদ", "জীবনদর্শন", "ছোট লেখা"].includes(item.id)).map((item) => <button key={item.id} onClick={() => { setCategory(item.id); document.getElementById("reading-archive")?.scrollIntoView({ behavior: "smooth" }); }}>{item.label}</button>)}
              </div>
            </div>
            <aside className="wr-hero-aside" aria-label="সংগ্রহের পরিসংখ্যান">
              <div className="wr-stat"><strong>{ready ? humanCount(archive.length) : "…"}</strong><span>পাঠযোগ্য লেখা</span></div>
              <div className="wr-stat"><strong>{humanCount(PRINTED_BOOKS.length)}</strong><span>মুদ্রিত বই</span></div>
              <div className="wr-stat"><strong>{humanCount(FREE_EBOOKS.length)}</strong><span>বিনামূল্যের ই-বুক</span></div>
            </aside>
          </section>

          <section className="wr-section wr-publication-stage" aria-labelledby="publication-title">
            <div className="wr-section-head"><div><span className="wr-section-kicker"><Library size={14} /> প্রকাশনা</span><h2 id="publication-title">বই, অর্ডার ও পাঠ</h2></div><p>মুদ্রিত বই অর্ডার করুন, অথবা সংগ্রহ থেকে বিনামূল্যের ই-বুক পড়া শুরু করুন।</p></div>
            <div className="wr-publications">{PRINTED_BOOKS.map((book) => <PublicationCard key={book.id} {...book} />)}</div>
            <div className="wr-book-rail" aria-label="বিনামূল্যের ই-বুক">
              {FREE_EBOOKS.map((book) => <Link href={bookActionHref(book)} className="wr-ebook" key={book.id}><img src={book.cover} alt="" /><div><strong>{book.title}</strong><span>{book.genre} · পড়া শুরু করুন</span></div></Link>)}
            </div>
          </section>

          <section className="wr-section" aria-labelledby="explore-title">
            <div className="wr-section-head"><div><span className="wr-section-kicker"><Bookmark size={14} /> পছন্দের বিষয়</span><h2 id="explore-title">আজ কী পড়বেন?</h2></div><p>বিষয় বেছে নিন অথবা সার্চে যেকোনো শব্দ লিখুন।</p></div>
            <div className="wr-explore" role="tablist" aria-label="লেখার বিভাগ">
              {CATEGORIES.map((item) => <button key={item.id} className={category === item.id ? "is-active" : ""} onClick={() => setCategory(item.id)} role="tab" aria-selected={category === item.id}><span>{item.label}</span><small>{item.hint}</small></button>)}
            </div>
          </section>

          {!query && category === "all" && highlighted.length > 0 && (
            <section className="wr-section" aria-labelledby="selected-title">
              <div className="wr-section-head"><div><span className="wr-section-kicker"><Sparkles size={14} /> শুরু করার জন্য</span><h2 id="selected-title">নির্বাচিত লেখা</h2></div><p>প্রথমবার এলে এই লেখাগুলো দিয়ে শুরু করতে পারেন।</p></div>
              <div className="wr-grid">{highlighted.map((writing) => <ReadingCard key={writing.id} writing={writing} viewMode="grid" onOpen={() => openWriting(writing)} />)}</div>
            </section>
          )}

          <section className="wr-section wr-archive" id="reading-archive" aria-labelledby="archive-title">
            <div className="wr-section-head"><div><span className="wr-section-kicker"><BookOpen size={14} /> পাঠাগার</span><h2 id="archive-title">{selectedCategory.label} {query ? "খোঁজার ফল" : "লেখা"}</h2></div><p>প্রতিটি লেখা খুলে সম্পূর্ণ পড়ুন, লিংক কপি করুন বা পছন্দের তালিকায় রাখুন।</p></div>
            <div className="wr-archive-top"><span className="wr-result-note">{ready ? `${humanCount(results.length)}টি লেখা পাওয়া গেছে` : "লেখাগুলো প্রস্তুত হচ্ছে…"}</span><div className="wr-view-toggle" aria-label="ফলাফল দেখার ধরন"><button className={viewMode === "grid" ? "is-on" : ""} onClick={() => setViewMode("grid")} aria-label="গ্রিড ভিউ" aria-pressed={viewMode === "grid"}><Grid2X2 size={16} /></button><button className={viewMode === "list" ? "is-on" : ""} onClick={() => setViewMode("list")} aria-label="লিস্ট ভিউ" aria-pressed={viewMode === "list"}><List size={17} /></button></div></div>
            {!ready ? <div className="wr-empty">লেখাগুলো লোড হচ্ছে…</div> : results.length === 0 ? <div className="wr-empty"><Search size={28} /><p>এই শব্দ বা বিভাগে কোনো লেখা পাওয়া যায়নি।</p><button onClick={() => { setQuery(""); setCategory("all"); }}>সব লেখা দেখুন</button></div> : <><div className={`wr-grid ${viewMode === "list" ? "list" : ""}`}>{displayed.map((writing) => <ReadingCard key={writing.id} writing={writing} viewMode={viewMode} onOpen={() => openWriting(writing)} />)}</div>{displayed.length < results.length && <div className="wr-more"><button onClick={() => setVisible((count) => count + PAGE_SIZE)}><ChevronDown size={15} /> আরও লেখা দেখুন</button><span>{humanCount(displayed.length)} / {humanCount(results.length)}</span></div>}</>}
          </section>
        </div>
      </main>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 32px", background: "#060e1a" }}><AdSenseAd adSlot={AD_SLOTS.WRITINGS_INLINE} adFormat="auto" fullWidthResponsive /></div>
      <Footer />
      <AnimatePresence>{selected && <WritingDialog writing={selected} suggestions={selectedSuggestions} onClose={closeWriting} onNavigate={openWriting} />}</AnimatePresence>
    </>
  );
}
