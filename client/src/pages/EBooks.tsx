import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight, BookOpen, Check, ChevronRight, Copy, Eye, Library,
  PackageCheck, Quote, Search, ShoppingBag, Sparkles, X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { SITE_URL } from "@/components/Seo";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";
import { BOOK_CATALOG, FREE_EBOOKS, PRINTED_BOOKS, bookActionHref, bookActionLabel, type BookCatalogItem } from "@/data/bookCatalog";

type Shelf = "all" | "printed" | "free";

function countBangla(value: number) {
  return new Intl.NumberFormat("bn-BD").format(value);
}

function BookAction({ book, className = "bk-primary" }: { book: BookCatalogItem; className?: string }) {
  const href = bookActionHref(book);
  const content = <>{bookActionLabel(book)} <ArrowRight size={15} /></>;
  return book.canRead ? (
    <Link href={href} className={className}>{content}</Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
  );
}

function BookPreview({ book, onDetails, feature = false }: { book: BookCatalogItem; onDetails: () => void; feature?: boolean }) {
  return (
    <article className={`bk-card ${feature ? "bk-card-featured" : ""}`} style={{ "--book-color": book.accentColor } as React.CSSProperties}>
      <button className="bk-cover-button" onClick={onDetails} aria-label={`${book.title} সম্পর্কে জানুন`}>
        <img src={book.cover} alt={`${book.title} বইয়ের প্রচ্ছদ`} loading={feature ? "eager" : "lazy"} decoding="async" />
        <span><Eye size={15} /> বিবরণ</span>
      </button>
      <div className="bk-card-copy">
        <div className="bk-card-meta"><span className={book.canRead ? "free" : "order"}>{book.canRead ? "বিনামূল্যে ই-বুক" : "মুদ্রিত বই"}</span><span>{book.genre}</span></div>
        <h3>{book.title}</h3>
        <p>{book.description}</p>
        <div className="bk-facts"><span>{book.year}</span>{book.pages && <><i>•</i><span>{book.pages} পৃষ্ঠা</span></>}</div>
        <div className="bk-card-actions"><BookAction book={book} /><button onClick={onDetails} className="bk-secondary">বই সম্পর্কে</button></div>
      </div>
    </article>
  );
}

function BookModal({ book, onClose }: { book: BookCatalogItem; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(book.canRead ? `${window.location.origin}/ebooks/read/${book.slug}` : book.buyLink || `${window.location.origin}/ebooks`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.div className="bk-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.article className="bk-modal" role="dialog" aria-modal="true" aria-label={`${book.title} সম্পর্কে`} initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.98 }} transition={{ duration: 0.22 }}>
        <header><span>{book.canRead ? "বিনামূল্যে পড়ুন" : "মুদ্রিত বই · সরাসরি অর্ডার"}</span><div><button onClick={copyLink} aria-label="লিংক কপি করুন">{copied ? <Check size={17} /> : <Copy size={17} />}</button><button onClick={onClose} aria-label="বন্ধ করুন"><X size={19} /></button></div></header>
        <div className="bk-modal-body">
          <img className="bk-modal-cover" src={book.cover} alt={`${book.title} বইয়ের প্রচ্ছদ`} />
          <div>
            <span className="bk-modal-genre" style={{ color: book.accentColor }}>{book.genre}</span>
            <h2>{book.title}</h2>
            <p>{book.description}</p>
            <div className="bk-modal-facts"><span>{book.year}</span>{book.pages && <span>{book.pages} পৃষ্ঠা</span>}<span>{book.canRead ? "ই-বুক" : "মুদ্রিত সংস্করণ"}</span></div>
            {book.flap && <div className="bk-flap">{book.flap}</div>}
            {book.quote && <blockquote><Quote size={17} /><p>{book.quote}</p><footer>— মাহবুব সরদার সবুজ</footer></blockquote>}
            <BookAction book={book} className="bk-modal-action" />
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

const CSS = `
  :root { --bk-ink:#101f31; --bk-night:#0f2134; --bk-paper:#f8f7f1; --bk-sand:#efe9dd; --bk-muted:#5b6670; --bk-gold:#b88939; --bk-line:rgba(16,31,49,.14); --bk-serif:'AdorshoLipi',sans-serif; --bk-sans:'AdorshoLipi',sans-serif; }
  .bk-page{background:var(--bk-paper);color:var(--bk-ink);min-height:100vh;padding-top:var(--site-nav-offset,92px)}.bk-shell{width:min(1240px,calc(100% - 32px));margin:0 auto;padding:30px 0 70px}
  .bk-hero{background:linear-gradient(130deg,#10253a 0%,#172e41 60%,#5e3f36 145%);position:relative;overflow:hidden;border-radius:28px;padding:clamp(28px,5vw,68px);color:#fffaf0;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(260px,.85fr);gap:36px;box-shadow:0 22px 62px rgba(10,27,43,.18)}.bk-hero:before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 90% 0,rgba(230,196,117,.2),transparent 30%),repeating-linear-gradient(90deg,transparent 0 58px,rgba(255,255,255,.025) 59px 60px)}.bk-hero-copy,.bk-hero-shelf{position:relative;z-index:1}.bk-kicker{display:inline-flex;align-items:center;gap:8px;color:#e6c475;font:700 .72rem var(--bk-sans);letter-spacing:.12em;text-transform:uppercase}.bk-hero h1{font:700 clamp(2.35rem,5vw,4.8rem)/1.1 var(--bk-serif);letter-spacing:-.058em;margin:16px 0}.bk-hero h1 em{font-style:normal;color:#efd07d}.bk-hero p{color:rgba(255,250,240,.74);max-width:620px;font:400 1rem/1.9 var(--bk-sans);margin:0}.bk-hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:26px}.bk-hero-actions a{display:inline-flex;align-items:center;gap:7px;text-decoration:none;border-radius:10px;padding:11px 14px;font:700 .8rem var(--bk-sans)}.bk-hero-actions a:first-child{background:#f4d17c;color:var(--bk-ink)}.bk-hero-actions a:last-child{border:1px solid rgba(255,255,255,.25);color:#fffaf0;background:rgba(255,255,255,.06)}.bk-hero-shelf{display:flex;align-items:end;justify-content:center;gap:clamp(8px,2vw,16px);padding-top:20px}.bk-hero-shelf img{width:clamp(84px,13vw,142px);aspect-ratio:3/4;object-fit:cover;border-radius:9px;box-shadow:0 18px 32px rgba(0,0,0,.28);transform:rotate(-5deg)}.bk-hero-shelf img:nth-child(2){transform:translateY(-16px);z-index:1}.bk-hero-shelf img:nth-child(3){transform:rotate(5deg)}
  .bk-section{margin-top:42px}.bk-head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:18px}.bk-head>div>span{display:inline-flex;gap:7px;align-items:center;color:var(--bk-gold);font:700 .71rem var(--bk-sans);letter-spacing:.1em;text-transform:uppercase}.bk-head h2{margin:5px 0 0;font:700 clamp(1.6rem,3vw,2.4rem) var(--bk-serif);letter-spacing:-.04em}.bk-head p{margin:0;max-width:470px;color:var(--bk-muted);font:400 .89rem/1.7 var(--bk-sans)}
  .bk-guide{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid var(--bk-line);border-radius:18px;background:#fffdf8;overflow:hidden}.bk-guide-item{padding:17px;display:flex;gap:11px;align-items:flex-start}.bk-guide-item+div{border-left:1px solid var(--bk-line)}.bk-guide-item svg{color:var(--bk-gold);flex:0 0 auto}.bk-guide-item strong{display:block;font:700 .86rem var(--bk-sans)}.bk-guide-item p{margin:3px 0 0;color:var(--bk-muted);font:400 .75rem/1.6 var(--bk-sans)}
  .bk-shelves{display:flex;gap:9px;overflow:auto;padding:3px 0 13px;scrollbar-width:none}.bk-shelves button{min-width:max-content;border:1px solid var(--bk-line);border-radius:99px;background:#fffdf8;color:var(--bk-ink);padding:9px 13px;font:700 .78rem var(--bk-sans)}.bk-shelves button.is-active{background:var(--bk-ink);color:#fffaf0;border-color:var(--bk-ink)}.bk-layout{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.bk-card{display:grid;grid-template-columns:155px minmax(0,1fr);gap:21px;min-width:0;background:#fffdf8;border:1px solid var(--bk-line);border-radius:19px;padding:16px;transition:transform .18s ease,box-shadow .18s ease}.bk-card:hover{transform:translateY(-3px);box-shadow:0 15px 28px rgba(16,31,49,.09)}.bk-cover-button{position:relative;border:0;background:transparent;padding:0;cursor:pointer;overflow:hidden;border-radius:11px;aspect-ratio:3/4;box-shadow:0 8px 18px rgba(16,31,49,.14)}.bk-cover-button img{width:100%;height:100%;object-fit:cover;display:block}.bk-cover-button span{position:absolute;inset:auto 0 0;background:rgba(10,24,38,.84);color:#fffaf0;display:flex;justify-content:center;align-items:center;gap:5px;padding:8px;font:700 .7rem var(--bk-sans);transform:translateY(100%);transition:.18s ease}.bk-cover-button:hover span,.bk-cover-button:focus-visible span{transform:none}.bk-card-copy{display:flex;flex-direction:column;align-items:flex-start}.bk-card-meta{display:flex;gap:7px;flex-wrap:wrap;align-items:center;color:var(--bk-muted);font:600 .68rem var(--bk-sans)}.bk-card-meta .order,.bk-card-meta .free{padding:4px 7px;border-radius:99px}.bk-card-meta .order{color:#a65255;background:#f8e7e1}.bk-card-meta .free{color:#2e7963;background:#e2f2ea}.bk-card h3{margin:11px 0 8px;font:700 1.3rem/1.38 var(--bk-serif);letter-spacing:-.03em}.bk-card p{color:var(--bk-muted);font:400 .83rem/1.72 var(--bk-sans);margin:0}.bk-facts{margin:10px 0;color:#7c858b;font:600 .7rem var(--bk-sans)}.bk-facts i{font-style:normal;margin:0 5px}.bk-card-actions{margin-top:auto;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.bk-primary,.bk-secondary,.bk-modal-action{display:inline-flex;align-items:center;gap:6px;text-decoration:none;border-radius:9px;padding:9px 11px;font:700 .75rem var(--bk-sans);transition:.18s ease}.bk-primary,.bk-modal-action{background:var(--book-color,var(--bk-gold));color:var(--bk-ink)}.bk-secondary{border:1px solid var(--bk-line);background:transparent;color:var(--bk-ink)}
  .bk-feature{background:var(--bk-night);color:#fffaf0;border-radius:24px;padding:clamp(20px,4vw,38px)}.bk-feature .bk-head h2{color:#fffaf0}.bk-feature .bk-head p{color:rgba(255,250,240,.68)}.bk-feature-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:18px}.bk-feature-card{display:grid;grid-template-columns:minmax(140px,30%) 1fr;gap:22px;padding:0;background:transparent;border:0;color:#fffaf0}.bk-feature-card .bk-card-meta{color:rgba(255,250,240,.58)}.bk-feature-card h3{font-size:clamp(1.6rem,3vw,2.4rem)}.bk-feature-card p{color:rgba(255,250,240,.72)}.bk-feature-card .bk-facts{color:rgba(255,250,240,.57)}.bk-feature-card .bk-secondary{border-color:rgba(255,255,255,.24);color:#fffaf0}.bk-feature-note{border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.055);border-radius:16px;padding:19px;align-self:stretch;display:flex;flex-direction:column;justify-content:space-between}.bk-feature-note span{font:700 .71rem var(--bk-sans);color:#e6c475;letter-spacing:.1em;text-transform:uppercase}.bk-feature-note p{margin:15px 0;color:rgba(255,250,240,.74);font:400 .93rem/1.85 var(--bk-serif)}.bk-feature-note a{color:#f3d079;font:700 .78rem var(--bk-sans);text-decoration:none;display:inline-flex;gap:5px;align-items:center}
  .bk-modal-backdrop{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:18px;background:rgba(8,20,31,.68);backdrop-filter:blur(7px)}.bk-modal{width:min(820px,100%);max-height:90vh;overflow:auto;background:#fffdf8;border-radius:20px;box-shadow:0 26px 70px rgba(0,0,0,.35);padding:20px}.bk-modal>header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--bk-line);padding-bottom:14px;color:var(--bk-muted);font:700 .73rem var(--bk-sans)}.bk-modal>header>div{display:flex;gap:7px}.bk-modal>header button{border:1px solid var(--bk-line);background:transparent;color:var(--bk-ink);border-radius:8px;padding:7px;display:flex}.bk-modal-body{display:grid;grid-template-columns:200px 1fr;gap:25px;padding-top:23px}.bk-modal-cover{width:100%;border-radius:12px;box-shadow:0 14px 30px rgba(16,31,49,.16)}.bk-modal-genre{font:700 .72rem var(--bk-sans);letter-spacing:.08em;text-transform:uppercase}.bk-modal h2{font:700 clamp(1.7rem,4vw,2.6rem)/1.32 var(--bk-serif);letter-spacing:-.04em;margin:8px 0 12px}.bk-modal-body>div>p{color:var(--bk-muted);font:400 .9rem/1.8 var(--bk-sans);margin:0}.bk-modal-facts{display:flex;gap:7px;flex-wrap:wrap;margin:14px 0}.bk-modal-facts span{border:1px solid var(--bk-line);border-radius:99px;padding:5px 8px;color:var(--bk-muted);font:600 .68rem var(--bk-sans)}.bk-flap{white-space:pre-line;border-top:1px solid var(--bk-line);margin-top:16px;padding-top:16px;color:#374b5c;font:400 .95rem/1.95 var(--bk-serif)}.bk-modal blockquote{border-left:3px solid var(--book-color,var(--bk-gold));margin:17px 0;padding:3px 0 3px 14px;color:#354a5d}.bk-modal blockquote svg{color:var(--bk-gold)}.bk-modal blockquote p{white-space:pre-line;font:400 .93rem/1.85 var(--bk-serif);margin:5px 0}.bk-modal blockquote footer{font:600 .75rem var(--bk-sans);color:var(--bk-muted)}.bk-modal-action{margin-top:8px}
  @media(max-width:920px){.bk-hero{grid-template-columns:1fr}.bk-hero-shelf{justify-content:start}.bk-layout{grid-template-columns:1fr}.bk-feature-grid{grid-template-columns:1fr}.bk-guide{grid-template-columns:1fr}.bk-guide-item+div{border-left:0;border-top:1px solid var(--bk-line)}}@media(max-width:620px){.bk-shell{width:min(100% - 24px,1240px);padding-top:16px}.bk-hero{border-radius:20px;padding:25px 20px}.bk-hero h1{font-size:2.4rem}.bk-hero-shelf img{width:88px}.bk-head{display:block}.bk-head p{margin-top:8px}.bk-card,.bk-feature-card{grid-template-columns:92px 1fr;gap:14px;padding:13px}.bk-card h3,.bk-feature-card h3{font-size:1.05rem;margin:8px 0 6px}.bk-card p{font-size:.78rem}.bk-cover-button span{display:none}.bk-card-actions{gap:5px}.bk-primary,.bk-secondary{padding:8px 9px;font-size:.7rem}.bk-modal-backdrop{padding:10px}.bk-modal{padding:15px;border-radius:16px}.bk-modal-body{grid-template-columns:1fr;padding-top:17px}.bk-modal-cover{width:135px}.bk-modal h2{font-size:1.7rem}}

  /* ── Reader-first iPhone glass refinement ─────────────────────────────── */
  .bk-page { --bk-ink:#101827; --bk-night:#152c4d; --bk-paper:#eef3fa; --bk-sand:#e5edf8; --bk-muted:#35465e; --bk-gold:#bc7d28; --bk-line:rgba(27,51,83,.17); background:radial-gradient(circle at 8% 3%,rgba(118,181,255,.25),transparent 28%),radial-gradient(circle at 92% 16%,rgba(255,206,120,.20),transparent 25%),linear-gradient(155deg,#f8fbff 0%,#edf3fb 50%,#e4edf9 100%); color:var(--bk-ink); }
  .bk-page, .bk-page button, .bk-page input { font-family:'AdorshoLipi',sans-serif; }
  .bk-shell { padding-top:clamp(18px,3vw,38px); }
  .bk-hero { isolation:isolate; border:1px solid rgba(255,255,255,.50); background:radial-gradient(circle at 85% 7%,rgba(135,191,255,.27),transparent 30%),radial-gradient(circle at 7% 115%,rgba(255,202,113,.17),transparent 42%),linear-gradient(138deg,#111d36 0%,#183258 50%,#314c6c 100%); box-shadow:0 25px 72px rgba(23,47,82,.25),inset 0 1px 0 rgba(255,255,255,.20); backdrop-filter:blur(26px) saturate(150%); }
  .bk-hero:before { background:linear-gradient(120deg,rgba(255,255,255,.11),transparent 35%,rgba(255,255,255,.04)); }.bk-kicker{color:#ffd489;letter-spacing:.045em}.bk-hero h1{color:#f8fbff;letter-spacing:-.023em}.bk-hero h1 em{color:#ffd26c}.bk-hero p{color:#eef5ff;font-size:1.07rem;line-height:1.85}.bk-hero-actions a:first-child{background:#ffda89;color:#13233a;box-shadow:0 7px 18px rgba(0,0,0,.20)}.bk-hero-actions a:last-child{border-color:rgba(255,255,255,.42);background:rgba(255,255,255,.14);color:#fff;backdrop-filter:blur(14px)}
  .bk-hero-shelf img { border:1px solid rgba(255,255,255,.25); box-shadow:0 20px 38px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.25); }
  .bk-head h2 { color:#14243a; letter-spacing:-.016em; }.bk-head p { color:#3c4f69; font-size:.96rem; }.bk-head>div>span { color:#a66111; letter-spacing:.045em; }
  .bk-guide { border-color:rgba(255,255,255,.82); background:linear-gradient(145deg,rgba(255,255,255,.86),rgba(245,249,255,.72)); box-shadow:0 14px 36px rgba(37,65,103,.10),inset 0 1px 0 #fff; backdrop-filter:blur(20px) saturate(145%); }.bk-guide-item+div{border-left-color:rgba(57,87,124,.15)}.bk-guide-item strong{color:#152641;font-size:.94rem}.bk-guide-item p{color:#3b4d66;font-size:.82rem}.bk-guide-item svg{color:#b96f1f}
  .bk-feature { border:1px solid rgba(255,255,255,.34); background:radial-gradient(circle at 92% 6%,rgba(125,188,255,.19),transparent 32%),linear-gradient(135deg,rgba(19,42,74,.96),rgba(35,67,108,.94)); box-shadow:0 22px 60px rgba(20,46,82,.25),inset 0 1px 0 rgba(255,255,255,.14); backdrop-filter:blur(26px) saturate(150%); }.bk-feature .bk-head h2,.bk-feature-card h3{color:#f8fbff}.bk-feature .bk-head p,.bk-feature-card p{color:#e4eefb}.bk-feature-note{border-color:rgba(255,255,255,.24);background:rgba(255,255,255,.12);box-shadow:inset 0 1px 0 rgba(255,255,255,.16);backdrop-filter:blur(18px)}.bk-feature-note span{color:#ffd489;letter-spacing:.045em}.bk-feature-note p{color:#f0f6ff;font-size:1rem}.bk-feature-note a{color:#ffe2a2}.bk-feature-card .bk-secondary{color:#fff;border-color:rgba(255,255,255,.38);background:rgba(255,255,255,.10)}
  .bk-shelves button{border-color:rgba(255,255,255,.85);background:rgba(255,255,255,.74);color:#18304f;box-shadow:0 8px 20px rgba(37,65,103,.08),inset 0 1px 0 #fff;backdrop-filter:blur(16px)}.bk-shelves button.is-active{background:#1b365b;border-color:#1b365b;color:#fff;box-shadow:0 10px 22px rgba(24,54,91,.25)}
  .bk-card { border-color:rgba(255,255,255,.88); background:linear-gradient(145deg,rgba(255,255,255,.94),rgba(245,250,255,.76)); box-shadow:0 14px 38px rgba(29,56,94,.11),inset 0 1px 0 #fff; backdrop-filter:blur(20px) saturate(150%); }.bk-card:hover{transform:translateY(-4px);box-shadow:0 21px 46px rgba(29,56,94,.18),inset 0 1px 0 #fff}.bk-cover-button{box-shadow:0 10px 22px rgba(29,56,94,.20)}.bk-card h3{color:#14243b;letter-spacing:-.01em}.bk-card p{color:#34465e;font-size:.9rem}.bk-card-meta{color:#44566e}.bk-facts{color:#51627a}.bk-primary,.bk-modal-action{color:#102037;box-shadow:0 7px 16px rgba(35,59,93,.18)}.bk-secondary{border-color:rgba(69,96,131,.28);background:rgba(255,255,255,.68);color:#183456;box-shadow:inset 0 1px 0 #fff}.bk-card-meta .order{color:#8e353b;background:#fde9e8}.bk-card-meta .free{color:#18694e;background:#dff5ea}
  .bk-modal-backdrop{background:rgba(11,22,39,.56);backdrop-filter:blur(18px) saturate(145%)}.bk-modal{border:1px solid rgba(255,255,255,.76);background:rgba(250,252,255,.95);box-shadow:0 30px 86px rgba(0,0,0,.34),inset 0 1px 0 #fff;backdrop-filter:blur(30px)}.bk-modal>header{color:#44566e;border-bottom-color:rgba(66,94,130,.18)}.bk-modal>header button{background:rgba(255,255,255,.72);color:#152941;border-color:rgba(69,96,132,.25)}.bk-modal h2{color:#14243b;letter-spacing:-.015em}.bk-modal-body>div>p,.bk-flap{color:#2e4057;font-size:1rem}.bk-modal-facts span{border-color:rgba(69,96,132,.24);color:#43566e;background:rgba(255,255,255,.60)}.bk-modal blockquote{color:#2d4058}.bk-modal blockquote footer{color:#465971}
  /* ── Unified site palette: literary ink, warm gold, dark glass ─────────── */
  .bk-page{--bk-ink:#f8f3e7;--bk-night:#0a1b2e;--bk-paper:#060e1a;--bk-sand:#0d2035;--bk-muted:#c4ceda;--bk-gold:#d4a843;--bk-line:rgba(201,168,76,.23);background:radial-gradient(circle at 88% 4%,rgba(201,168,76,.10),transparent 29%),radial-gradient(circle at 7% 18%,rgba(40,83,129,.16),transparent 30%),#060e1a;color:var(--bk-ink)}
  .bk-hero{border-color:rgba(201,168,76,.30);background:radial-gradient(circle at 84% 9%,rgba(201,168,76,.12),transparent 28%),linear-gradient(138deg,#071321 0%,#0b1d31 55%,#102842 100%);box-shadow:0 26px 72px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.08)}.bk-hero:before{background:linear-gradient(120deg,rgba(255,255,255,.06),transparent 38%,rgba(201,168,76,.05))}.bk-kicker{color:#e7c56f}.bk-hero h1{color:#f8f3e7}.bk-hero h1 em{color:#e8c46f}.bk-hero p{color:#d5dde7}.bk-hero-actions a:first-child{background:#c99f4d;color:#101d2c;box-shadow:0 7px 18px rgba(0,0,0,.25)}.bk-hero-actions a:last-child{border-color:rgba(212,168,67,.35);background:rgba(255,255,255,.06);color:#f8f3e7}.bk-hero-shelf img{border-color:rgba(255,255,255,.14);box-shadow:0 20px 38px rgba(0,0,0,.40)}
  .bk-head h2{color:#f8f3e7}.bk-head p{color:#c2ccd8}.bk-head>div>span{color:#e7c56f}.bk-guide{border-color:rgba(201,168,76,.24);background:linear-gradient(145deg,rgba(18,42,67,.93),rgba(10,25,42,.96));box-shadow:0 14px 36px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.07)}.bk-guide-item+div{border-left-color:rgba(255,255,255,.10)}.bk-guide-item strong{color:#f8f3e7}.bk-guide-item p{color:#c8d2dd}.bk-guide-item svg{color:#e8c46f}
  .bk-feature{border-color:rgba(201,168,76,.26);background:radial-gradient(circle at 92% 8%,rgba(201,168,76,.11),transparent 29%),linear-gradient(138deg,#0a1b2e,#102943);box-shadow:0 22px 60px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.08)}.bk-feature .bk-head h2,.bk-feature-card h3{color:#f8f3e7}.bk-feature .bk-head p,.bk-feature-card p{color:#d5dde7}.bk-feature-note{border-color:rgba(255,255,255,.12);background:rgba(255,255,255,.045);box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}.bk-feature-note span{color:#e7c56f}.bk-feature-note p{color:#e0e6ec}.bk-feature-note a{color:#e8c46f}.bk-feature-card .bk-secondary{color:#f8f3e7;border-color:rgba(212,168,67,.30);background:rgba(255,255,255,.04)}
  .bk-shelves button{border-color:rgba(201,168,76,.24);background:rgba(12,30,50,.76);color:#eef3f8;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}.bk-shelves button.is-active{background:#b98c38;border-color:#d4a843;color:#101c2b;box-shadow:0 10px 22px rgba(0,0,0,.25)}.bk-card{border-color:rgba(255,255,255,.10);background:linear-gradient(145deg,rgba(18,42,67,.94),rgba(10,25,42,.95));box-shadow:0 14px 38px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.07)}.bk-card:hover{box-shadow:0 21px 46px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.09)}.bk-cover-button{box-shadow:0 10px 22px rgba(0,0,0,.32)}.bk-card h3{color:#f8f3e7}.bk-card p{color:#c9d2de}.bk-card-meta{color:#b6c2d0}.bk-facts{color:#aebdcb}.bk-primary,.bk-modal-action{color:#101d2c;box-shadow:0 7px 16px rgba(0,0,0,.25)}.bk-secondary{border-color:rgba(212,168,67,.25);background:rgba(255,255,255,.04);color:#edf3f8;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}.bk-card-meta .order{color:#ffb9bc;background:rgba(167,59,66,.20)}.bk-card-meta .free{color:#93e4bf;background:rgba(25,119,83,.20)}
  .bk-modal-backdrop{background:rgba(3,10,18,.78)}.bk-modal{border-color:rgba(201,168,76,.27);background:linear-gradient(145deg,#102840,#091a2c);box-shadow:0 30px 86px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08)}.bk-modal>header{color:#b9c5d2;border-bottom-color:rgba(255,255,255,.10)}.bk-modal>header button{background:#17334f;color:#f8f3e7;border-color:rgba(201,168,76,.24)}.bk-modal h2{color:#f8f3e7}.bk-modal-body>div>p,.bk-flap{color:#d7dfe8}.bk-modal-facts span{border-color:rgba(201,168,76,.22);color:#c9d4de;background:rgba(255,255,255,.04)}.bk-modal blockquote{color:#d9e1e9}.bk-modal blockquote footer{color:#b6c2d0}
  @media(max-width:620px){.bk-page{background:radial-gradient(circle at 90% 0,rgba(201,168,76,.08),transparent 34%),#060e1a}.bk-hero{border-radius:24px}.bk-hero h1{font-size:2.32rem}.bk-hero p{font-size:1rem}.bk-head h2{font-size:1.72rem}.bk-guide-item strong{font-size:.9rem}.bk-card p{font-size:.86rem}.bk-feature-note p{font-size:.95rem}}
`;

export default function EBooks() {
  const [shelf, setShelf] = useState<Shelf>("all");
  const [selectedBook, setSelectedBook] = useState<BookCatalogItem | null>(null);
  const featuredBook = PRINTED_BOOKS.find((book) => book.isFeatured) ?? PRINTED_BOOKS[0];
  const displayed = useMemo(() => {
    if (shelf === "printed") return PRINTED_BOOKS;
    if (shelf === "free") return FREE_EBOOKS;
    return BOOK_CATALOG;
  }, [shelf]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", name: "বই ও ই-বুক — মাহবুব সরদার সবুজ", url: `${SITE_URL}/ebooks`, inLanguage: "bn-BD", description: "মাহবুব সরদার সবুজের মুদ্রিত বই অর্ডার এবং বিনামূল্যে পড়ার ই-বুকের পাঠকবান্ধব সংগ্রহ।" },
      ...BOOK_CATALOG.map((book) => ({ "@type": "Book", name: book.title, inLanguage: "bn-BD", author: { "@type": "Person", name: "মাহবুব সরদার সবুজ" }, url: book.canRead ? `${SITE_URL}/ebooks/read/${book.slug}` : book.buyLink, image: `${SITE_URL}${book.cover}`, description: book.description, genre: book.genre, bookFormat: book.canRead ? "EBook" : "Paperback", isAccessibleForFree: book.canRead })),
    ],
  };

  return (
    <>
      <Seo title="বই ও ই-বুক — মাহবুব সরদার সবুজ | অর্ডার ও বিনামূল্যে পড়ুন" description="মাহবুব সরদার সবুজের মুদ্রিত বই সরাসরি অর্ডার করুন অথবা নির্বাচিত বাংলা ই-বুক বিনামূল্যে পড়ুন।" path="/ebooks" keywords="মাহবুব সরদার সবুজ বই, অভিমান বই, আমি বিচ্ছেদকে বলি দুঃখবিলাস, বাংলা ই-বুক, বাংলা বই অর্ডার" jsonLd={jsonLd} />
      <Navbar />
      <style>{CSS}</style>
      <main className="bk-page">
        <div className="bk-shell">
          <section className="bk-hero" aria-labelledby="books-title">
            <div className="bk-hero-copy"><span className="bk-kicker"><Library size={15} /> পাঠকের সংগ্রহ</span><h1 id="books-title">আপনার পরের <em>পাঠ</em> বেছে নিন</h1><p>মুদ্রিত বই সরাসরি অর্ডার করুন, অথবা বিনামূল্যের ই-বুকের সংগ্রহ থেকে এখনই পড়া শুরু করুন। প্রতিটি বইয়ের ধরন ও পথ পরিষ্কারভাবে আলাদা করা আছে।</p><div className="bk-hero-actions"><a href="#printed-books">মুদ্রিত বই দেখুন <ChevronRight size={15} /></a><a href="#free-ebooks">বিনামূল্যে পড়ুন <ChevronRight size={15} /></a></div></div>
            <div className="bk-hero-shelf" aria-hidden="true">{BOOK_CATALOG.slice(0, 3).map((book) => <img key={book.id} src={book.cover} alt="" />)}</div>
          </section>

          <section className="bk-section" aria-label="পাঠের সহজ নির্দেশনা"><div className="bk-guide"><div className="bk-guide-item"><ShoppingBag size={20} /><div><strong>মুদ্রিত বই অর্ডার</strong><p>‘সরাসরি অর্ডার করুন’ বাটনে গিয়ে রকমারি থেকে নিরাপদে অর্ডার দিন।</p></div></div><div className="bk-guide-item"><BookOpen size={20} /><div><strong>বিনামূল্যের ই-বুক</strong><p>‘এখনই পড়ুন’ বাটনে ক্লিক করে সাইটেই পড়া শুরু করুন।</p></div></div><div className="bk-guide-item"><PackageCheck size={20} /><div><strong>পরিষ্কার পাঠ-পথ</strong><p>অর্ডারযোগ্য বই ও অনলাইনে পড়ার বই আলাদা করে সাজানো।</p></div></div></div></section>

          <section className="bk-section bk-feature" aria-labelledby="feature-title"><div className="bk-head"><div><span><Sparkles size={14} /> নতুন প্রকাশনা</span><h2 id="feature-title">আজকের বিশেষ বই</h2></div><p>অনুভূতির গভীরতা থেকে আত্মমর্যাদার আলোয় ফেরা—একটি পূর্ণাঙ্গ পাঠের আমন্ত্রণ।</p></div><div className="bk-feature-grid"><BookPreview book={featuredBook} onDetails={() => setSelectedBook(featuredBook)} feature /><aside className="bk-feature-note"><div><span>বইয়ের কথা</span><p>“{featuredBook.quote?.split("\n")[0]}”</p></div><a href="#printed-books">আরও মুদ্রিত বই <ArrowRight size={14} /></a></aside></div></section>

          <section className="bk-section" id="printed-books" aria-labelledby="catalog-title"><div className="bk-head"><div><span><Library size={14} /> ক্যাটালগ</span><h2 id="catalog-title">আপনার পছন্দের সংগ্রহ</h2></div><p>বইয়ের ধরন অনুযায়ী বেছে নিন—অর্ডার দিন অথবা বিনামূল্যে পড়ুন।</p></div><div className="bk-shelves" role="tablist" aria-label="বইয়ের ধরন"><button className={shelf === "all" ? "is-active" : ""} onClick={() => setShelf("all")} role="tab" aria-selected={shelf === "all"}>সব বই · {countBangla(BOOK_CATALOG.length)}</button><button className={shelf === "printed" ? "is-active" : ""} onClick={() => setShelf("printed")} role="tab" aria-selected={shelf === "printed"}>মুদ্রিত বই · {countBangla(PRINTED_BOOKS.length)}</button><button className={shelf === "free" ? "is-active" : ""} onClick={() => setShelf("free")} role="tab" aria-selected={shelf === "free"}>বিনামূল্যে ই-বুক · {countBangla(FREE_EBOOKS.length)}</button></div><div className="bk-layout">{displayed.map((book) => <BookPreview key={book.id} book={book} onDetails={() => setSelectedBook(book)} />)}</div></section>

          <section className="bk-section" id="free-ebooks" aria-labelledby="free-title"><div className="bk-head"><div><span><BookOpen size={14} /> শুরু করুন</span><h2 id="free-title">বিনামূল্যের পাঠাগার</h2></div><p>যেকোনো একটি ই-বুক খুলে নিজের গতিতে পড়ুন।</p></div><div className="bk-layout">{FREE_EBOOKS.map((book) => <BookPreview key={book.id} book={book} onDetails={() => setSelectedBook(book)} />)}</div></section>
        </div>
      </main>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 28px", background: "#060E1A" }}><AdSenseAd adSlot={AD_SLOTS.EBOOKS_SIDEBAR} adFormat="auto" fullWidthResponsive /></div>
      <Footer />
      <AnimatePresence>{selectedBook && <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />}</AnimatePresence>
    </>
  );
}
