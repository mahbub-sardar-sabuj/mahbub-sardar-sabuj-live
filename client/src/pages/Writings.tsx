/**
 * Writings & E-Books — লেখালেখি ও বই
 * Design: CINEMATIC LITERARY UNIVERSE v10 — World-Class Premium
 * Palette: Void #020408 | Obsidian #06080F | Gold #C9A84C | Amber #E8C87A | Cream #F2EDE4
 * Features: Floating Particles | Magnetic Cards | Depth Layers | Cinematic Typography
 *           Staggered Reveals | Glow Pulse | 3D Book Perspective | Immersive Reader
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { SITE_URL } from "@/components/Seo";
import AdSenseAd from "@/components/AdSenseAd";
import type { Writing } from "@/data/writingsArchive";
import {
  motion, AnimatePresence, useMotionValue, useSpring, useInView,
} from "framer-motion";
import {
  useState, useEffect, useRef, useCallback,
  useMemo, useDeferredValue,
} from "react";
import { createPortal } from "react-dom";
import { Link, useRoute, useLocation } from "wouter";
import {
  Feather, BookOpen, Star, Calendar, X, Search, Share2, Copy,
  ChevronLeft, ChevronRight, Facebook, Check, AArrowUp, AArrowDown,
  ShoppingCart, Eye, Library, Grid3X3, List, ArrowRight,
  Crown, Moon, Sun, Scroll, ChevronDown,
} from "lucide-react";

// ── Slug Utility ──────────────────────────────────────────────────────────────
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
function makeExcerpt(text: string, maxLength = 170): string {
  const n = text.replace(/\s+/g, " ").trim();
  return n.length > maxLength ? `${n.slice(0, maxLength).trim()}…` : n;
}
function siteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

// ── Category System ───────────────────────────────────────────────────────────
const CATS = [
  { id:"all",       label:"সব লেখা",    icon:"✦", color:"#C9A84C", glow:"rgba(201,168,76,.4)"  },
  { id:"ছোট লেখা",  label:"ছোট লেখা",  icon:"✎", color:"#34D399", glow:"rgba(52,211,153,.4)"  },
  { id:"কবিতা",     label:"কবিতা",      icon:"❧", color:"#60A5FA", glow:"rgba(96,165,250,.4)"  },
  { id:"ভালোবাসা",  label:"ভালোবাসা",  icon:"♡", color:"#F472B6", glow:"rgba(244,114,182,.4)" },
  { id:"জীবনদর্শন", label:"জীবনদর্শন", icon:"◈", color:"#FBBF24", glow:"rgba(251,191,36,.4)"  },
  { id:"বিচ্ছেদ",   label:"বিচ্ছেদ",   icon:"◌", color:"#A78BFA", glow:"rgba(167,139,250,.4)" },
];
function getCatStyle(cat: string) {
  const m: Record<string,{accent:string;glow:string;bg:string;badge:string;border:string;icon:string}> = {
    "ভালোবাসা": { accent:"#F472B6",glow:"rgba(244,114,182,.28)",bg:"rgba(244,114,182,.07)",badge:"rgba(244,114,182,.16)",border:"rgba(244,114,182,.32)",icon:"♡" },
    "বিচ্ছেদ":  { accent:"#A78BFA",glow:"rgba(167,139,250,.28)",bg:"rgba(167,139,250,.07)",badge:"rgba(167,139,250,.16)",border:"rgba(167,139,250,.32)",icon:"◌" },
    "কবিতা":    { accent:"#60A5FA",glow:"rgba(96,165,250,.28)", bg:"rgba(96,165,250,.07)", badge:"rgba(96,165,250,.16)", border:"rgba(96,165,250,.32)", icon:"❧" },
    "ছোট লেখা": { accent:"#34D399",glow:"rgba(52,211,153,.28)", bg:"rgba(52,211,153,.07)", badge:"rgba(52,211,153,.16)", border:"rgba(52,211,153,.32)", icon:"✎" },
    "জীবনদর্শন":{ accent:"#FBBF24",glow:"rgba(251,191,36,.28)", bg:"rgba(251,191,36,.07)", badge:"rgba(251,191,36,.16)", border:"rgba(251,191,36,.32)", icon:"◈" },
  };
  return m[cat] ?? m["জীবনদর্শন"];
}

const WRITINGS_PAGE_SIZE = 24;

const ebooks = [
  { id:1, slug:"dukkhovilash", title:"আমি বিচ্ছেদকে বলি দুঃখবিলাস", subtitle:"প্রথম ফিজিক্যাল বই", cover:"/images/ebooks/dukkhovilash.png", description:"'আমি বিচ্ছেদকে বলি দুঃখবিলাস' — লেখক মাহবুব সরদার সবুজের প্রথম প্রকাশিত ফিজিক্যাল বই। বিচ্ছেদের ব্যথা, হারানোর কষ্ট আর জীবনের গভীর অনুভূতিগুলো এই বইয়ে অনন্যভাবে তুলে ধরা হয়েছে।", genre:"আবেগী সাহিত্য", pages:"১৫০+", year:"২০২৬", badge:"ফিজিক্যাল বই", badgeColor:"#D4A843", buyLink:"https://rkmri.co/TTMEoA3l3pM0/", isFeatured:true, canRead:true, accentColor:"#D4A843" },
  { id:2, slug:"smritir-boshonte", title:"স্মৃতির বসন্তে তুমি", subtitle:"ই-বুক", cover:"/images/ebooks/smritir-boshonte.jpg", description:"'স্মৃতির বসন্তে তুমি' — মাহবুব সরদার সবুজের একটি আবেগঘন কাব্যিক সংকলন। স্মৃতির গভীরে হারিয়ে যাওয়া প্রিয় মুহূর্তগুলো নিয়ে লেখা এই বইটি।", genre:"কবিতা ও গদ্য", pages:"৮০+", year:"২০২৪", badge:"ই-বুক", badgeColor:"#4A90D9", buyLink:null, isFeatured:false, canRead:true, accentColor:"#4A90D9" },
  { id:3, slug:"chand-phool", title:"চাঁদফুল", subtitle:"ই-বুক", cover:"/images/ebooks/chand-phool.jpg", description:"'চাঁদফুল' — মাহবুব সরদার সবুজের একটি বিশেষ কাব্যগ্রন্থ যেখানে প্রকৃতির অপরূপ সৌন্দর্য আর মানবমনের কোমল অনুভূতির মেলবন্ধন ঘটেছে।", genre:"কবিতা", pages:"৬০+", year:"২০২৩", badge:"ই-বুক", badgeColor:"#27AE60", buyLink:null, isFeatured:false, canRead:true, accentColor:"#27AE60" },
  { id:4, slug:"shomoyer-gohvore", title:"সময়ের গহ্বরে", subtitle:"ই-বুক", cover:"/images/ebooks/shomoyer-gohvore.jpg", description:"'সময়ের গহ্বরে' — মাহবুব সরদার সবুজের একটি নস্টালজিক সাহিত্যকর্ম। সময়ের স্রোতে হারিয়ে যাওয়া শহর, মানুষ আর স্মৃতির কথা এই বইয়ে অনবদ্যভাবে উঠে এসেছে।", genre:"গদ্য ও কবিতা", pages:"১০০+", year:"২০২৩", badge:"ই-বুক", badgeColor:"#E67E22", buyLink:null, isFeatured:false, canRead:true, accentColor:"#E67E22" },
  { id:5, slug:"onoboddo-lekha", title:"মাহবুব সরদার সবুজের অনবদ্য লেখা", subtitle:"ই-বুক", cover:"/images/ebooks/onoboddo-lekha.jpg", description:"'মাহবুব সরদার সবুজের অনবদ্য লেখা' — ১০০টি জীবনমুখী ও অনুপ্রেরণামূলক লেখার সংকলন। ভালোবাসা, বিচ্ছেদ, জীবনদর্শন ও মানবিক অনুভূতির মিশ্রণে রচিত এই সংকলনটি পাঠকের মনে গভীর ছাপ ফেলবে।", genre:"মিশ্র সাহিত্য", pages:"১০১", year:"২০২৬", badge:"ই-বুক", badgeColor:"#8B5CF6", buyLink:null, isFeatured:true, canRead:true, accentColor:"#8B5CF6" },
];

// ══════════════════════════════════════════════════════════════════════════════
//  CSS — CINEMATIC LITERARY UNIVERSE v10
// ══════════════════════════════════════════════════════════════════════════════
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@300;400;500;600;700&display=swap');

  :root {
    --void:  #020408;
    --bg0:   #04060C;
    --bg1:   #06080F;
    --bg2:   #090C18;
    --bg3:   #0C1020;
    --bg4:   #101526;
    --t0:    #F2EDE4;
    --t1:    rgba(242,237,228,.88);
    --t2:    rgba(242,237,228,.56);
    --t3:    rgba(242,237,228,.30);
    --t4:    rgba(242,237,228,.12);
    --gold:  #C9A84C;
    --gold2: #E8C87A;
    --gold3: #F5E0A8;
    --bdr:   rgba(255,255,255,.055);
    --bdr2:  rgba(255,255,255,.10);
    --bdr3:  rgba(255,255,255,.17);
    --f:     'Noto Serif Bengali', 'SolaimanLipi', serif;
    --ease:  cubic-bezier(.25,.46,.45,.94);
    --spring: cubic-bezier(.34,1.56,.64,1);
    --silk:  cubic-bezier(.16,1,.3,1);
  }

  /* ── PAGE WRAPPER ── */
  .wp { background: var(--void); min-height: 100vh; padding-top: var(--site-nav-offset,98px); }
  .wp-cinema { position: relative; overflow: hidden; }

  /* ── DEEP SPACE BACKGROUND ── */
  .wp-cinema::before {
    content: "";
    position: fixed; inset: 0;
    pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 80% 50% at 12% 0%,   rgba(201,168,76,.13) 0%, transparent 52%),
      radial-gradient(ellipse 60% 40% at 88% 10%,  rgba(244,114,182,.09) 0%, transparent 48%),
      radial-gradient(ellipse 50% 40% at 50% 100%, rgba(96,165,250,.07) 0%, transparent 50%),
      radial-gradient(ellipse 35% 30% at 75% 55%,  rgba(167,139,250,.06) 0%, transparent 42%);
  }

  /* ── AURORA ANIMATION ── */
  .cinema-aurora {
    position: fixed; inset: 0;
    pointer-events: none; z-index: 0; opacity: .55;
    background:
      linear-gradient(122deg, transparent 0 18%, rgba(201,168,76,.06) 34%, transparent 52% 100%),
      radial-gradient(ellipse at 40% 0%, rgba(232,200,122,.12), transparent 38%);
    animation: aurora 22s ease-in-out infinite alternate;
  }
  @keyframes aurora {
    0%   { opacity:.45; transform: translateX(0)    scale(1);    }
    33%  { opacity:.65; transform: translateX(14px)  scale(1.02); }
    66%  { opacity:.50; transform: translateX(-10px) scale(.985); }
    100% { opacity:.55; transform: translateX(6px)   scale(1.01); }
  }

  /* ── FLOATING PARTICLES ── */
  .particles {
    position: fixed; inset: 0;
    pointer-events: none; z-index: 0; overflow: hidden;
  }
  .particle {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, var(--gold) 0%, transparent 70%);
    animation: floatParticle var(--dur,12s) var(--delay,0s) ease-in-out infinite alternate;
    opacity: 0;
  }
  @keyframes floatParticle {
    0%   { opacity: 0;   transform: translateY(0)     scale(0); }
    15%  { opacity: .55; transform: translateY(-20px)  scale(1); }
    85%  { opacity: .35; transform: translateY(-80px)  scale(.7); }
    100% { opacity: 0;   transform: translateY(-120px) scale(0); }
  }

  /* ── MAIN CONTENT ── */
  .mc { max-width: 1260px; margin: 0 auto; padding: clamp(1.5rem,3vw,2.5rem) clamp(1rem,4vw,2.5rem); }
  .mc-cinema { position: relative; z-index: 1; padding-top: clamp(1.2rem,3vw,2.2rem); }

  /* ══════════════════════════════════════════════════
     HERO BANNER — CINEMATIC STAGE
  ══════════════════════════════════════════════════ */
  .hero-stage {
    position: relative; overflow: hidden;
    border-radius: clamp(28px,5vw,52px);
    margin-bottom: clamp(1.6rem,3.5vw,2.8rem);
    padding: clamp(2rem,5vw,4rem) clamp(1.5rem,4vw,3rem);
    background:
      linear-gradient(150deg, rgba(255,255,255,.09) 0%, rgba(255,255,255,.025) 55%),
      radial-gradient(ellipse 90% 120% at 95% -10%, rgba(201,168,76,.24) 0%, transparent 48%),
      radial-gradient(ellipse 60% 80% at 0% 110%,  rgba(96,165,250,.12) 0%, transparent 45%),
      rgba(6,8,15,.82);
    box-shadow:
      0 50px 140px rgba(0,0,0,.5),
      0 0 0 1px rgba(255,255,255,.055),
      inset 0 1px 0 rgba(255,255,255,.12),
      inset 0 -1px 0 rgba(0,0,0,.4);
    backdrop-filter: blur(24px);
  }
  /* Gradient border via pseudo-element */
  .hero-stage::before {
    content: "";
    position: absolute; inset: -1px;
    border-radius: inherit; padding: 1px;
    background: linear-gradient(135deg,
      rgba(201,168,76,.6) 0%,
      rgba(255,255,255,.12) 25%,
      transparent 50%,
      rgba(244,114,182,.25) 100%
    );
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none; opacity: .65;
  }
  /* Top shimmer line */
  .hero-stage::after {
    content: "";
    position: absolute; top: 0; left: 5%; right: 5%; height: 1px;
    background: linear-gradient(90deg,
      transparent, rgba(201,168,76,.7) 20%,
      rgba(255,255,255,.5) 50%,
      rgba(201,168,76,.7) 80%, transparent
    );
    border-radius: 999px; pointer-events: none;
  }
  .hero-grid {
    position: relative; z-index: 1;
    display: grid;
    grid-template-columns: minmax(0,1.45fr) minmax(260px,.55fr);
    gap: clamp(1.5rem,4vw,4rem);
    align-items: center;
  }
  .hero-copy { align-self: center; }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 16px; border-radius: 999px;
    background: rgba(201,168,76,.1);
    border: 1px solid rgba(201,168,76,.25);
    color: var(--gold); font-family: var(--f);
    font-size: .74rem; letter-spacing: .22em;
    text-transform: uppercase; margin-bottom: 1.1rem;
    font-weight: 500;
  }
  .hero-title {
    margin: 0 0 1.1rem;
    font-family: var(--f);
    font-size: clamp(2.4rem,7vw,5.8rem);
    line-height: 1.04; font-weight: 700;
    letter-spacing: -.04em; color: var(--t0);
    text-shadow: 0 0 100px rgba(201,168,76,.2), 0 28px 80px rgba(0,0,0,.65);
  }
  .hero-title-gold {
    background: linear-gradient(135deg, var(--gold3) 0%, var(--gold) 45%, var(--gold2) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-desc {
    max-width: 640px; margin: 0 0 1.8rem;
    color: var(--t2); font-family: var(--f);
    font-size: clamp(.95rem,2vw,1.18rem); line-height: 2.05;
  }
  .hero-stats {
    display: flex; gap: clamp(.6rem,1.8vw,1.1rem); flex-wrap: wrap;
  }
  .hero-stat {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 16px; border-radius: 14px;
    background: rgba(255,255,255,.045);
    border: 1px solid var(--bdr2);
    backdrop-filter: blur(10px);
    font-family: var(--f); font-size: .76rem; color: var(--t2);
    transition: border-color .22s, background .22s;
  }
  .hero-stat:hover { border-color: rgba(201,168,76,.28); background: rgba(201,168,76,.05); }
  .hero-stat-num { color: var(--gold); font-weight: 700; font-size: .95rem; }

  /* ── BOOK SHOWCASE IN HERO ── */
  .hero-showcase {
    position: relative; min-height: 400px;
    border-radius: 36px;
    border: 1px solid rgba(255,255,255,.09);
    background:
      radial-gradient(ellipse 85% 65% at 50% 0%, rgba(232,200,122,.25) 0%, transparent 52%),
      linear-gradient(180deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,.018) 100%);
    overflow: hidden;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 32px 90px rgba(0,0,0,.35);
  }
  .hero-showcase::after {
    content: "";
    position: absolute; left: 8%; right: 8%; bottom: 18px;
    height: 28px; border-radius: 999px;
    background: rgba(201,168,76,.28); filter: blur(26px);
    pointer-events: none;
  }
  .hero-book-stack {
    position: absolute; inset: 40px 18px 40px;
    display: flex; align-items: flex-end; justify-content: center;
    gap: 16px; perspective: 1100px;
  }
  .hero-book {
    width: clamp(74px,9vw,115px); aspect-ratio: 3/4;
    border-radius: 15px; object-fit: cover;
    box-shadow:
      0 35px 70px rgba(0,0,0,.6),
      -12px 0 22px rgba(0,0,0,.22),
      inset 0 0 0 1px rgba(255,255,255,.15);
    transform: rotate(var(--r,0deg)) translateY(var(--l,0px));
    transition: transform .42s var(--ease), box-shadow .42s;
  }
  .hero-showcase:hover .hero-book {
    transform: rotate(var(--r,0deg)) translateY(calc(var(--l,0px) - 12px));
    box-shadow: 0 48px 90px rgba(0,0,0,.7), -12px 0 22px rgba(0,0,0,.22), inset 0 0 0 1px rgba(255,255,255,.2);
  }
  .hero-book:nth-child(1) { --r:-13deg; --l:20px; }
  .hero-book:nth-child(2) { --r:-2deg;  --l:-10px; width: clamp(88px,10.5vw,135px); }
  .hero-book:nth-child(3) { --r:10deg;  --l:25px; }

  /* ══════════════════════════════════════════════════
     SECTION PANELS
  ══════════════════════════════════════════════════ */
  .panel {
    position: relative; overflow: hidden;
    border-radius: clamp(24px,4vw,44px);
    border: 1px solid rgba(255,255,255,.065);
    background:
      linear-gradient(180deg, rgba(255,255,255,.062) 0%, rgba(255,255,255,.016) 100%),
      rgba(6,8,15,.75);
    box-shadow: 0 36px 110px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.07);
    backdrop-filter: blur(20px);
    margin-bottom: clamp(1.8rem,4vw,3.2rem);
    padding: clamp(1.4rem,3.5vw,2.5rem);
  }
  .panel-gold::before {
    content: "";
    position: absolute; top: 0; left: 6%; right: 6%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(201,168,76,.55), rgba(255,255,255,.3), rgba(201,168,76,.55), transparent);
    pointer-events: none;
  }
  .panel-blue::before {
    content: "";
    position: absolute; top: 0; left: 6%; right: 6%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(96,165,250,.45), rgba(255,255,255,.25), rgba(96,165,250,.45), transparent);
    pointer-events: none;
  }
  .panel-head {
    display: flex; align-items: flex-start;
    justify-content: space-between;
    gap: clamp(1rem,3vw,2rem);
    margin-bottom: clamp(1.2rem,3vw,2rem);
  }
  .panel-head h2 {
    margin: 0; color: var(--t0); font-family: var(--f);
    font-size: clamp(1.55rem,3.8vw,2.8rem);
    line-height: 1.2; font-weight: 700; letter-spacing: -.03em;
  }
  .panel-head p {
    max-width: 640px; margin: .55rem 0 0;
    color: var(--t2); font-family: var(--f);
    line-height: 1.9; font-size: .93rem;
  }
  .section-eyebrow {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 4px 13px; border-radius: 999px;
    background: rgba(201,168,76,.09);
    border: 1px solid rgba(201,168,76,.2);
    color: var(--gold); font-family: var(--f);
    font-size: .73rem; letter-spacing: .18em;
    text-transform: uppercase; margin-bottom: .75rem; font-weight: 500;
  }

  /* ══════════════════════════════════════════════════
     BOOK SHELF
  ══════════════════════════════════════════════════ */
  .book-shelf {
    display: grid;
    grid-template-columns: minmax(250px,.82fr) minmax(0,1.42fr);
    gap: clamp(1rem,2.5vw,1.8rem); align-items: stretch;
  }

  /* ── FEATURED BOOK ── */
  .featured-book {
    --ba: var(--gold);
    position: relative; overflow: hidden;
    border-radius: 32px;
    border: 1px solid color-mix(in srgb, var(--ba) 40%, rgba(255,255,255,.09));
    background:
      radial-gradient(ellipse 85% 65% at 50% -5%, color-mix(in srgb, var(--ba) 24%, transparent) 0%, transparent 55%),
      linear-gradient(180deg, rgba(255,255,255,.085) 0%, rgba(255,255,255,.02) 100%),
      #070B18;
    box-shadow:
      0 36px 100px rgba(0,0,0,.52),
      inset 0 1px 0 rgba(255,255,255,.09),
      0 0 0 1px rgba(255,255,255,.03);
    cursor: pointer;
    transition: transform .34s var(--silk), box-shadow .34s, border-color .34s;
  }
  .featured-book::before {
    content: "";
    position: absolute; inset: -1px; border-radius: inherit; padding: 1px;
    background: linear-gradient(165deg,
      color-mix(in srgb, var(--ba) 62%, transparent) 0%,
      rgba(255,255,255,.12) 38%, transparent 62%
    );
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none; opacity: .65; transition: opacity .34s;
  }
  .featured-book:hover { transform: translateY(-8px) scale(1.01); }
  .featured-book:hover::before { opacity: 1; }
  .featured-book:hover { box-shadow: 0 52px 130px rgba(0,0,0,.62), 0 0 70px color-mix(in srgb, var(--ba) 22%, transparent), inset 0 1px 0 rgba(255,255,255,.11); }
  .featured-inner {
    position: relative; z-index: 1; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: space-between;
    gap: 1.1rem; padding: clamp(1.3rem,3.5vw,2rem); text-align: center;
  }
  .featured-cover {
    width: min(210px,62vw); aspect-ratio: 3/4; object-fit: cover;
    border-radius: 20px;
    box-shadow: 0 36px 80px rgba(0,0,0,.62), -14px 0 28px rgba(0,0,0,.28), inset 0 0 0 1px rgba(255,255,255,.14);
    transform: rotateY(-11deg) rotateZ(-1.8deg);
    transition: transform .34s var(--silk), box-shadow .34s;
  }
  .featured-book:hover .featured-cover {
    transform: rotateY(-2deg) translateY(-10px) scale(1.025);
    box-shadow: 0 50px 100px rgba(0,0,0,.7), -14px 0 28px rgba(0,0,0,.28), inset 0 0 0 1px rgba(255,255,255,.18);
  }
  .featured-book h3 {
    margin: .45rem 0 .4rem; color: var(--t0); font-family: var(--f);
    font-size: clamp(1.12rem,2.8vw,1.7rem); line-height: 1.4;
    font-weight: 700; letter-spacing: -.022em;
  }
  .featured-meta {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 6px; color: var(--t3); font-family: var(--f); font-size: .74rem;
  }
  .featured-actions {
    width: 100%; display: grid;
    grid-template-columns: repeat(2,minmax(0,1fr));
    gap: 11px; position: relative; z-index: 2;
  }
  .featured-actions > * {
    min-height: 44px; display: inline-flex; align-items: center;
    justify-content: center; gap: 7px; border-radius: 15px;
    border: 1px solid rgba(255,255,255,.09); font-family: var(--f);
    font-size: .83rem; text-decoration: none; cursor: pointer;
    transition: all .26s var(--silk); font-weight: 600;
  }
  .featured-actions > *:hover { transform: translateY(-3px); filter: brightness(1.14); box-shadow: 0 10px 32px rgba(0,0,0,.32); }

  /* ── EBOOK ROW ── */
  .ebook-row {
    display: grid; grid-template-columns: repeat(2,minmax(0,1fr));
    gap: clamp(1rem,2.2vw,1.4rem); perspective: 1500px;
  }

  /* ── EBOOK TILE ── */
  .ebook-tile {
    --ba: var(--gold);
    position: relative; overflow: hidden; min-height: 390px;
    display: flex; flex-direction: column; border-radius: 30px;
    border: 1px solid color-mix(in srgb, var(--ba) 30%, rgba(255,255,255,.08));
    background:
      linear-gradient(168deg, color-mix(in srgb, var(--ba) 16%, transparent) 0%, transparent 44%),
      linear-gradient(180deg, rgba(255,255,255,.072) 0%, rgba(255,255,255,.018) 100%),
      #070B18;
    box-shadow: 0 26px 70px rgba(0,0,0,.4);
    cursor: pointer;
    transition: transform .32s var(--silk), border-color .32s, box-shadow .32s;
  }
  .ebook-tile::before {
    content: "";
    position: absolute; inset: -1px; border-radius: inherit; padding: 1px;
    background: linear-gradient(158deg,
      color-mix(in srgb, var(--ba) 50%, transparent) 0%, transparent 48%
    );
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none; opacity: .52; transition: opacity .32s;
  }
  .ebook-tile:hover {
    transform: translateY(-12px) scale(1.02);
    border-color: color-mix(in srgb, var(--ba) 60%, rgba(255,255,255,.15));
    box-shadow: 0 48px 110px rgba(0,0,0,.56), 0 0 55px color-mix(in srgb, var(--ba) 25%, transparent);
  }
  .ebook-tile:hover::before { opacity: .9; }
  .ebook-tile.featured::after {
    content: "";
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.16), transparent);
    transform: translateX(-135%) skewX(-22deg);
    animation: shine 5.5s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes shine {
    0%,54%  { transform: translateX(-135%) skewX(-22deg); opacity: 0; }
    60%     { opacity: .6; }
    76%,100%{ transform: translateX(135%) skewX(-22deg); opacity: 0; }
  }
  .ebook-glow {
    position: absolute; inset: auto 10% 46% 10%; height: 75px;
    background: color-mix(in srgb, var(--ba) 38%, transparent);
    filter: blur(38px); opacity: .65; pointer-events: none; z-index: 0;
    transition: opacity .32s;
  }
  .ebook-tile:hover .ebook-glow { opacity: 1; }
  .ebook-cover-wrap {
    position: relative; z-index: 1; display: flex; justify-content: center;
    padding: 1.2rem 1rem .75rem; min-height: 195px;
  }
  .ebook-cover {
    position: relative; z-index: 1; width: min(128px,52vw); aspect-ratio: 3/4;
    object-fit: cover; border-radius: 17px;
    box-shadow: 0 26px 55px rgba(0,0,0,.58), -10px 0 22px rgba(0,0,0,.32), inset 0 0 0 1px rgba(255,255,255,.13);
    transform: rotateY(-13deg) rotateZ(-1.3deg);
    transition: transform .32s var(--silk), box-shadow .32s;
  }
  .ebook-tile:hover .ebook-cover {
    transform: rotateY(-2deg) translateY(-6px) scale(1.04);
    box-shadow: 0 38px 72px rgba(0,0,0,.65), -10px 0 22px rgba(0,0,0,.32), inset 0 0 0 1px rgba(255,255,255,.17);
  }
  .ebook-badge {
    position: absolute; z-index: 2; top: 18px; left: 18px;
    display: inline-flex; align-items: center; gap: 5px;
    max-width: calc(100% - 36px); padding: 5px 12px; border-radius: 999px;
    color: var(--t0); background: rgba(3,5,11,.8);
    border: 1px solid color-mix(in srgb, var(--ba) 44%, rgba(255,255,255,.1));
    font-family: var(--f); font-size: .66rem;
    backdrop-filter: blur(14px); font-weight: 500;
  }
  .ebook-copy {
    position: relative; z-index: 1;
    padding: .35rem 1.25rem 1.4rem;
    display: flex; flex-direction: column; flex: 1;
  }
  .ebook-genre {
    color: var(--ba); font-family: var(--f);
    font-size: .71rem; letter-spacing: .1em;
    text-transform: uppercase; font-weight: 600;
  }
  .ebook-copy h3 {
    margin: .55rem 0 .7rem; color: var(--t0); font-family: var(--f);
    font-size: 1.12rem; line-height: 1.52;
    font-weight: 700; letter-spacing: -.015em;
  }
  .ebook-copy p {
    margin: 0; color: var(--t2); font-family: var(--f);
    font-size: .83rem; line-height: 1.95;
    display: -webkit-box; -webkit-line-clamp: 3;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .ebook-meta {
    display: flex; align-items: center; gap: 6px;
    margin-top: .9rem; color: var(--t3); font-family: var(--f); font-size: .72rem;
  }
  .ebook-actions {
    display: grid; grid-template-columns: repeat(2,minmax(0,1fr));
    gap: 9px; margin-top: auto; padding-top: 1.1rem;
    position: relative; z-index: 2;
  }
  .ebook-actions > * {
    min-height: 40px; display: inline-flex; align-items: center;
    justify-content: center; gap: 6px; border-radius: 14px;
    border: 1px solid rgba(255,255,255,.09); font-family: var(--f);
    font-size: .8rem; text-decoration: none; cursor: pointer;
    transition: all .24s var(--silk); font-weight: 600;
  }
  .ebook-preview { background: rgba(255,255,255,.04); color: var(--t2); }
  .ebook-read, .ebook-buy {
    background: color-mix(in srgb, var(--ba) 22%, transparent);
    color: var(--t0);
    border-color: color-mix(in srgb, var(--ba) 48%, rgba(255,255,255,.09));
  }
  .ebook-actions > *:hover { transform: translateY(-2px); filter: brightness(1.12); box-shadow: 0 7px 22px rgba(0,0,0,.3); }

  /* ══════════════════════════════════════════════════
     WRITING SECTION
  ══════════════════════════════════════════════════ */
  .writing-tools {
    position: sticky; top: var(--site-nav-offset,98px); z-index: 15;
    display: grid; grid-template-columns: minmax(190px,330px) 1fr auto;
    gap: 10px; align-items: center;
    margin: 1.3rem 0; padding: 11px 14px;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,.09);
    background: rgba(4,6,12,.92);
    backdrop-filter: blur(26px) saturate(170%);
    box-shadow: 0 20px 55px rgba(0,0,0,.36), inset 0 1px 0 rgba(255,255,255,.065);
    will-change: transform;
  }
  .wt-search { max-width: none; width: 100%; }
  .wt-cats { overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
  .wt-cats::-webkit-scrollbar { display: none; }
  .wt-view { flex-shrink: 0; }

  /* Search box */
  .sf-s {
    display: flex; align-items: center; gap: 9px;
    background: rgba(255,255,255,.055); border: 1px solid var(--bdr2);
    border-radius: 14px; padding: 0 14px; height: 42px;
    transition: border-color .24s, background .24s, box-shadow .24s;
  }
  .sf-s:focus-within {
    border-color: rgba(201,168,76,.42); background: rgba(201,168,76,.045);
    box-shadow: 0 0 0 3px rgba(201,168,76,.12);
  }
  .sf-s input {
    background: none; border: none; outline: none;
    color: var(--t1); font-family: var(--f); font-size: .85rem;
    width: 100%; min-height: 42px;
  }
  .sf-s input::placeholder { color: var(--t3); }

  /* Category pills */
  .sf-cats { display: flex; gap: 5px; flex-wrap: wrap; }
  .sf-cat {
    display: flex; align-items: center; gap: 5px;
    padding: 7px 14px; border-radius: 999px;
    border: 1px solid var(--bdr2); background: rgba(255,255,255,.045);
    color: var(--t2); font-family: var(--f); font-size: .77rem;
    cursor: pointer; transition: all .24s var(--silk);
    white-space: nowrap; font-weight: 500;
  }
  .sf-cat:hover { border-color: var(--bdr3); color: var(--t1); background: rgba(255,255,255,.08); transform: translateY(-1px); }

  /* View toggle */
  .sf-vw {
    display: flex; gap: 3px; background: rgba(255,255,255,.045);
    border: 1px solid var(--bdr2); border-radius: 12px; padding: 4px;
  }
  .sf-vb {
    width: 32px; height: 32px; display: flex; align-items: center;
    justify-content: center; border-radius: 9px; border: none;
    background: transparent; color: var(--t3); cursor: pointer;
    transition: all .22s var(--silk);
  }
  .sf-vb.on { background: rgba(255,255,255,.11); color: var(--t0); box-shadow: 0 2px 10px rgba(0,0,0,.22); }
  .sf-vb:hover:not(.on) { color: var(--t2); background: rgba(255,255,255,.07); }

  /* Results bar */
  .rb2 {
    display: flex; align-items: center; justify-content: space-between;
    gap: .8rem; margin-bottom: clamp(1.2rem,2.5vw,2rem);
    padding-bottom: .9rem; border-bottom: 1px solid var(--bdr);
  }
  .rb2-cinema { margin-top: .3rem; margin-bottom: 1.3rem; }
  .rb2-t { font-family: var(--f); font-size: .79rem; color: var(--t3); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .rb2-clr {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 13px; border-radius: 999px;
    border: 1px solid var(--bdr2); background: rgba(255,255,255,.045);
    color: var(--t3); font-family: var(--f); font-size: .74rem;
    cursor: pointer; transition: all .22s var(--silk);
  }
  .rb2-clr:hover { color: var(--t1); border-color: var(--bdr3); background: rgba(255,255,255,.08); }

  /* ══════════════════════════════════════════════════
     WRITING CARDS
  ══════════════════════════════════════════════════ */
  .wg2 { display: grid; grid-template-columns: repeat(auto-fill,minmax(278px,1fr)); gap: clamp(12px,1.8vw,18px); }
  .wg2-l { display: flex; flex-direction: column; gap: 10px; }

  .wc2 {
    position: relative; overflow: hidden;
    background: linear-gradient(180deg, rgba(255,255,255,.05) 0%, rgba(255,255,255,.018) 100%), var(--bg2);
    border: 1px solid var(--bdr); border-radius: 24px;
    cursor: pointer; min-height: 240px;
    transition: transform .28s var(--silk), box-shadow .28s, border-color .28s;
    animation: fadeUp .38s var(--ease) both;
  }
  /* Gradient border on hover */
  .wc2::before {
    content: "";
    position: absolute; inset: -1px; border-radius: inherit; padding: 1px;
    background: linear-gradient(148deg,
      color-mix(in srgb, var(--ca,var(--gold)) 42%, transparent) 0%, transparent 52%
    );
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none; opacity: 0; transition: opacity .3s;
  }
  .wc2:hover::before { opacity: 1; }
  .wc2:hover {
    transform: translateY(-6px);
    border-color: color-mix(in srgb, var(--ca,var(--gold)) 32%, rgba(255,255,255,.1));
    box-shadow:
      0 26px 60px rgba(0,0,0,.46),
      0 0 35px color-mix(in srgb, var(--ca,var(--gold)) 14%, transparent),
      0 0 0 1px rgba(255,255,255,.05);
  }
  /* Top accent line */
  .wc2-top {
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--ca,var(--gold)), transparent);
    opacity: 0; transition: opacity .32s;
  }
  .wc2:hover .wc2-top { opacity: 1; }
  /* Ambient glow */
  .wc2-glow {
    position: absolute; top: -55px; left: 50%; transform: translateX(-50%);
    width: 140px; height: 100px; border-radius: 50%;
    background: var(--cg,rgba(201,168,76,.15));
    filter: blur(36px); opacity: 0; transition: opacity .4s; pointer-events: none;
  }
  .wc2:hover .wc2-glow { opacity: 1; }
  .wc2-body { height: 100%; display: flex; flex-direction: column; padding: clamp(1.2rem,2.4vw,1.55rem); }
  .wc2-tags { display: flex; align-items: center; gap: 6px; margin-bottom: .9rem; flex-wrap: wrap; }
  .wc2-cat {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 12px; border-radius: 999px; font-family: var(--f); font-size: .71rem;
    background: var(--cbg,rgba(201,168,76,.08)); color: var(--ca,var(--gold));
    border: 1px solid var(--cbdr,rgba(201,168,76,.22));
    transition: all .24s; font-weight: 600;
  }
  .wc2:hover .wc2-cat { background: var(--cbg2,rgba(201,168,76,.16)); box-shadow: 0 0 14px var(--cg,rgba(201,168,76,.2)); }
  .wc2-star {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 999px; font-family: var(--f); font-size: .65rem;
    background: rgba(251,191,36,.09); color: #FBBF24; border: 1px solid rgba(251,191,36,.22);
  }
  .wc2-title {
    font-family: var(--f); font-size: clamp(1.05rem,2.4vw,1.22rem);
    color: var(--t0); line-height: 1.65; margin-bottom: .85rem;
    font-weight: 700; letter-spacing: -.015em;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .wc2-preview {
    font-family: var(--f); font-size: .87rem; color: var(--t2);
    line-height: 2.0; display: -webkit-box; -webkit-line-clamp: 4;
    -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 1rem;
  }
  /* ছোট লেখার কার্ডে শিরোনাম নেই, তাই preview আরও বেশি দেখাবে */
  .wc2-short .wc2-preview {
    -webkit-line-clamp: 6;
    font-size: .9rem;
    line-height: 2.05;
  }
  .wc2-short .wc2-tags { margin-bottom: .5rem; }
  .wc2-short { min-height: 200px; }
  .wc2-foot {
    display: flex; align-items: center; justify-content: space-between;
    gap: .65rem; margin-top: auto; padding-top: .9rem; border-top: 1px solid var(--bdr);
  }
  .wc2-date { display: flex; align-items: center; gap: 5px; font-family: var(--f); font-size: .71rem; color: var(--t3); }
  .wc2-read { display: flex; align-items: center; gap: 5px; font-family: var(--f); font-size: .77rem; font-weight: 700; transition: gap .22s; }
  .wc2:hover .wc2-read { gap: 10px; }

  /* List mode */
  .wc2-l { min-height: 0; border-radius: 17px; }
  .wc2-l .wc2-body { display: flex; align-items: center; gap: 1.2rem; padding: 1rem 1.35rem; }
  .wc2-l .wc2-title { font-size: .95rem; margin-bottom: .3rem; -webkit-line-clamp: 1; }
  .wc2-l .wc2-preview { display: none; }
  .wc2-l .wc2-tags { margin-bottom: 0; }
  .wc2-l .wc2-foot { border: none; padding: 0; margin-left: auto; }

  /* Empty state */
  .wc2-em { text-align: center; padding: 5rem 2rem; color: var(--t3); font-family: var(--f); }

  /* Load more */
  .lm2 { margin: clamp(1.5rem,3vw,2.4rem) auto 0; display: flex; flex-direction: column; align-items: center; gap: .75rem; font-family: var(--f); color: var(--t3); }
  .lm2-btn {
    display: inline-flex; align-items: center; gap: 9px;
    padding: 13px 30px; border-radius: 999px;
    border: 1px solid rgba(201,168,76,.32);
    background: linear-gradient(135deg, rgba(201,168,76,.15), rgba(255,255,255,.045));
    color: var(--gold); font-family: var(--f); font-size: .85rem;
    cursor: pointer; transition: all .26s var(--silk); font-weight: 600;
  }
  .lm2-btn:hover {
    transform: translateY(-4px);
    border-color: rgba(201,168,76,.55);
    background: linear-gradient(135deg, rgba(201,168,76,.22), rgba(255,255,255,.06));
    box-shadow: 0 12px 36px rgba(201,168,76,.22);
  }
  .lm2-note { font-size: .73rem; color: var(--t3); }

  /* ══════════════════════════════════════════════════
     READING MODAL
  ══════════════════════════════════════════════════ */
  .rm2 {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(1,2,6,.85);
    backdrop-filter: blur(18px) saturate(150%);
    display: flex; align-items: flex-end; justify-content: center;
  }
  .rm2-box {
    width: 100%; max-width: 860px; max-height: 94vh;
    border-radius: 32px 32px 0 0; overflow: hidden;
    display: flex; flex-direction: column;
    box-shadow: 0 -50px 140px rgba(0,0,0,.85), 0 -1px 0 rgba(255,255,255,.09);
  }
  .rm2-hnd { width: 42px; height: 4px; border-radius: 999px; margin: 13px auto 0; flex-shrink: 0; }
  .rm2-prog { height: 2px; flex-shrink: 0; margin-top: 11px; }
  .rm2-pf { height: 100%; border-radius: 999px; transition: width .12s linear; }
  .rm2-hd {
    display: flex; align-items: center; justify-content: space-between;
    padding: .9rem 1.6rem; border-bottom: 1px solid; flex-shrink: 0; gap: 10px; flex-wrap: wrap;
  }
  .rm2-hdl { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .rm2-ctrl { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
  .rm2-btn {
    display: flex; align-items: center; justify-content: center;
    width: 34px; height: 34px; border-radius: 10px; border: 1px solid;
    background: none; cursor: pointer; transition: all .22s var(--silk);
  }
  .rm2-btn:hover { opacity: .8; transform: scale(1.06); }
  .rm2-fc { display: flex; border-radius: 10px; border: 1px solid; overflow: hidden; }
  .rm2-fb { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: none; border: none; cursor: pointer; transition: all .2s; }
  .rm2-fb:hover { opacity: .75; }
  .rm2-th {
    display: flex; align-items: center; gap: 5px; padding: 0 12px; height: 34px;
    border-radius: 10px; border: 1px solid; background: none; cursor: pointer;
    font-family: var(--f); font-size: .7rem; transition: all .2s; font-weight: 500;
  }
  .rm2-th:hover { opacity: .78; }
  .rm2-body {
    flex: 1; overflow-y: auto;
    padding: clamp(1.8rem,5vw,3.5rem) clamp(1.6rem,6vw,4.5rem);
    scroll-behavior: smooth;
  }
  .rm2-body::-webkit-scrollbar { width: 4px; }
  .rm2-body::-webkit-scrollbar-track { background: transparent; }
  .rm2-body::-webkit-scrollbar-thumb { background: rgba(201,168,76,.3); border-radius: 999px; }
  .rm2-ttl { font-family: var(--f); font-size: clamp(1.65rem,5vw,2.6rem); line-height: 1.48; margin-bottom: 2.1rem; font-weight: 700; letter-spacing: -.022em; }
  .rm2-txt { font-family: var(--f); line-height: 2.35; white-space: pre-wrap; word-break: break-word; font-size: 1.08rem; letter-spacing: 0.01em; }
  .rm2-sig { margin-top: 3.5rem; padding-top: 1.9rem; border-top: 1px solid; font-family: var(--f); font-size: .9rem; opacity: .55; font-style: italic; letter-spacing: .02em; }
  .rm2-nav { display: flex; border-top: 1px solid; flex-shrink: 0; }
  .rm2-nb {
    flex: 1; display: flex; align-items: center; gap: 10px;
    padding: 1.15rem 1.6rem; background: none; border: none; cursor: pointer; transition: background .2s;
  }
  .rm2-nb:hover { background: rgba(255,255,255,.045); }
  .rm2-nb:disabled { opacity: .3; cursor: default; }
  .rm2-nb:disabled:hover { background: none; }
  .rm2-nb + .rm2-nb { border-left: 1px solid; }
  .rm2-nl { display: block; font-family: var(--f); font-size: .65rem; margin-bottom: 3px; letter-spacing: .07em; text-transform: uppercase; }
  .rm2-nt { display: block; font-family: var(--f); font-size: .83rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 215px; font-weight: 600; }
  .rm2-sdd { position: absolute; top: calc(100% + 8px); right: 0; background: #0A0E1E; border: 1px solid rgba(255,255,255,.12); border-radius: 15px; overflow: hidden; min-width: 190px; box-shadow: 0 18px 55px rgba(0,0,0,.6); z-index: 10; }
  .rm2-si { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 16px; background: none; border: none; cursor: pointer; font-family: var(--f); font-size: .83rem; transition: background .15s; }
  .rm2-si:hover { background: rgba(255,255,255,.07); }

  /* ── BOOK MODAL ── */
  .bm2 { position: fixed; inset: 0; z-index: 9999; background: rgba(1,2,6,.88); backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .bm2-box { width: 100%; max-width: 740px; max-height: 92vh; border-radius: 30px; background: #0A0F20; border: 1px solid rgba(255,255,255,.13); overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 55px 140px rgba(0,0,0,.80), inset 0 1px 0 rgba(255,255,255,.09); }
  .bm2-hd { display: flex; align-items: center; justify-content: space-between; padding: 1.15rem 1.6rem; border-bottom: 1px solid rgba(255,255,255,.07); flex-shrink: 0; }
  .bm2-in { display: flex; gap: clamp(1.3rem,3vw,2.3rem); padding: clamp(1.4rem,3vw,2.3rem); overflow-y: auto; align-items: flex-start; }
  .bm2-in::-webkit-scrollbar { width: 4px; }
  .bm2-in::-webkit-scrollbar-thumb { background: rgba(201,168,76,.24); border-radius: 999px; }
  .bm2-cw { flex-shrink: 0; }
  .bm2-cv { width: clamp(128px,22vw,180px); height: auto; border-radius: 15px; box-shadow: 0 22px 65px rgba(0,0,0,.62), inset 0 0 0 1px rgba(255,255,255,.13); display: block; }
  .bm2-cnt { flex: 1; min-width: 0; }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

  /* ── SKELETON LOADING ── */
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg,
      rgba(255,255,255,.04) 0%,
      rgba(255,255,255,.10) 40%,
      rgba(255,255,255,.04) 80%
    );
    background-size: 600px 100%;
    animation: shimmer 1.6s ease-in-out infinite;
    border-radius: 8px;
  }
  .sk-card {
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,.055);
    background: rgba(9,12,24,.75);
    min-height: 240px;
    padding: 1.4rem;
    display: flex; flex-direction: column; gap: 1rem;
  }
  .sk-tag  { height: 22px; width: 80px; }
  .sk-ttl  { height: 20px; width: 75%; }
  .sk-ttl2 { height: 20px; width: 55%; margin-top: -6px; }
  .sk-line { height: 14px; }
  .sk-line2{ height: 14px; width: 85%; }
  .sk-line3{ height: 14px; width: 65%; }
  .sk-foot { height: 14px; width: 40%; margin-top: auto; }

  /* ── MOBILE FILTER SCROLL INDICATOR ── */
  .wt-cats-wrap {
    position: relative;
    overflow: hidden;
  }
  .wt-cats-wrap::after {
    content: "";
    position: absolute; right: 0; top: 0; bottom: 0;
    width: 32px;
    background: linear-gradient(to right, transparent, rgba(4,6,12,.9));
    pointer-events: none;
    opacity: 0;
    transition: opacity .2s;
  }
  .wt-cats-wrap.has-overflow::after { opacity: 1; }

  /* ── PREMIUM TOUCH FEEDBACK ── */
  @media (hover: none) {
    .wc2:active { transform: scale(.97); }
    .ebook-tile:active { transform: scale(.97); }
    .sf-cat:active { transform: scale(.95); }
    .lm2-btn:active { transform: scale(.97); }
  }

  /* ── WRITING TOOLS MOBILE STICKY FIX ── */
  @supports (padding: env(safe-area-inset-bottom)) {
    .rm2-box { padding-bottom: env(safe-area-inset-bottom); }
  }

  /* ── SCROLLBAR & SELECTION ── */
  * { scrollbar-width: thin; scrollbar-color: rgba(201,168,76,.24) transparent; }
  ::selection { background: rgba(201,168,76,.28); color: var(--t0); }

  /* ── ACCESSIBILITY ── */
  .ebook-tile, .wc2, .sf-cat, .sf-vb, .lm2-btn, .ebook-preview, .ebook-read, .ebook-buy, .rb2-clr { outline: none; }
  .ebook-tile:focus-visible, .wc2:focus-visible, .sf-cat:focus-visible, .lm2-btn:focus-visible { box-shadow: 0 0 0 3px rgba(201,168,76,.35), 0 0 0 1px rgba(242,237,228,.15) inset; }

  /* ══════════════════════════════════════════════════
     RESPONSIVE
  ══════════════════════════════════════════════════ */
  @media (max-width: 980px) {
    .hero-grid { grid-template-columns: 1fr; }
    .hero-showcase { min-height: 330px; }
    .panel-head { flex-direction: column; }
    .book-shelf { grid-template-columns: 1fr; }
    .ebook-row { display: flex; overflow-x: auto; padding: 4px 4px 18px; scroll-snap-type: x mandatory; scrollbar-width: none; }
    .ebook-row::-webkit-scrollbar { display: none; }
    .ebook-tile { min-width: min(76vw,300px); scroll-snap-align: start; }
    .writing-tools { grid-template-columns: 1fr auto; }
    .wt-cats { grid-column: 1 / -1; }
  }
  @media (max-width: 768px) {
    .sf-s { max-width: 100%; flex: 1; }
    .sf-cats { display: none; }
    .wt-cats { display: flex; }
    .wg2 { grid-template-columns: 1fr; }
    .rb2 { align-items: flex-start; flex-direction: column; }
    .hero-stage, .panel { border-radius: 26px; }
    .writing-tools { border-radius: 22px; }
    .bm2-in { flex-direction: column; }
    .bm2-cv { width: clamp(100px,36vw,148px); }
    .rm2-nt { max-width: 135px; }
  }
  @media (max-width: 480px) {
    .hero-title { font-size: clamp(1.7rem,10vw,2.5rem); line-height: 1.14; }
    .hero-desc { font-size: .9rem; line-height: 1.8; }
    .hero-stage { padding: 1.2rem; margin-bottom: 1rem; }
    .hero-grid { gap: 1.1rem; }
    .hero-showcase { min-height: 265px; border-radius: 26px; }
    .hero-book-stack { inset: 24px 15px; gap: 9px; }
    .hero-book { width: 70px; border-radius: 12px; }
    .hero-book:nth-child(2) { width: 85px; }
    .panel { padding: .95rem; margin-bottom: 1.2rem; }
    .panel-head h2 { font-size: 1.35rem; }
    .panel-head p { font-size: .82rem; line-height: 1.7; }
    .featured-inner { padding: 1rem; }
    .featured-cover { width: min(148px,52vw); }
    .featured-actions { grid-template-columns: 1fr; }
    .ebook-tile { min-width: 78vw; min-height: 355px; }
    .ebook-cover-wrap { min-height: 162px; padding: .95rem .85rem .55rem; }
    .ebook-cover { width: 112px; }
    .ebook-copy h3 { font-size: 1rem; }
    .writing-tools { grid-template-columns: 1fr; position: relative; top: auto; padding: 10px; margin: .5rem 0 1.6rem; }
    .wc2 { min-height: 190px; }
    .rm2-box { border-radius: 26px 26px 0 0; }
    .rm2-body { padding: 2rem 1.5rem; }
    .rm2-ttl { font-size: 1.75rem; margin-bottom: 1.6rem; }
    .rm2-txt { font-size: 1.06rem; line-height: 2.2; }
    .wc2-l .wc2-body { flex-direction: column; align-items: flex-start; gap: .8rem; }
    .wc2-l .wc2-foot { width: 100%; margin-left: 0; justify-content: space-between; }
    .wt-view { justify-self: end; }
    .hero-stats { gap: .55rem; }
    .hero-stat { padding: 6px 11px; font-size: .71rem; }
    /* Mobile: filter pills bigger touch targets */
    .sf-cat { padding: 9px 16px; font-size: .8rem; min-height: 40px; }
    /* Mobile: search input bigger */
    .sf-s { height: 46px; }
    .sf-s input { font-size: .9rem; }
    /* Mobile: view toggle bigger */
    .sf-vb { width: 36px; height: 36px; }
    /* Mobile: load more button bigger */
    .lm2-btn { padding: 15px 32px; font-size: .9rem; min-height: 52px; }
    /* Mobile: writing card footer bigger tap targets */
    .wc2-foot { padding-top: 1rem; }
    /* Mobile: ebook actions bigger */
    .ebook-actions > * { min-height: 44px; font-size: .85rem; }
    .featured-actions > * { min-height: 50px; font-size: .88rem; }
  }

  /* ── ULTRA-SMALL (360px) ── */
  @media (max-width: 360px) {
    .mc { padding: 1rem .75rem; }
    .hero-stage { padding: 1rem; }
    .panel { padding: .8rem; }
    .wg2 { grid-template-columns: 1fr; }
    .ebook-row { padding: 4px 2px 14px; }
    .ebook-tile { min-width: 82vw; }
    .writing-tools { padding: 8px; gap: 7px; }
  }
`;

// ── Floating Particles Component ──────────────────────────────────────────────
function FloatingParticles() {
  const particles = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${8 + (i * 5.2) % 84}%`,
    top: `${10 + (i * 7.3) % 80}%`,
    size: 2 + (i % 4),
    dur: `${10 + (i % 8)}s`,
    delay: `${(i * 1.3) % 9}s`,
  })), []);

  return (
    <div className="particles" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left, top: p.top,
            width: p.size, height: p.size,
            "--dur": p.dur, "--delay": p.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ── Magnetic Writing Card v10 ─────────────────────────────────────────────────
function WritingCard({ writing, index, onClick, viewMode = "grid" }: {
  writing: Writing; index: number; onClick: () => void; viewMode?: "grid"|"list";
}) {
  const c = getCatStyle(writing.category);
  const hideShortWritingLabel = writing.category === "ছোট লেখা";
  const isL = viewMode === "list";
  const slug = makeSlug(writing.title, writing.id);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const likeKey = `like_${writing.id}`;
  const [liked, setLiked] = useState(() => localStorage.getItem(likeKey) === "1");
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const next = !liked; setLiked(next);
    if (next) localStorage.setItem(likeKey, "1"); else localStorage.removeItem(likeKey);
  };
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const shareUrl = window.location.origin + "/writings/" + slug;
    if (navigator.share) {
      navigator.share({ title: writing.title, text: writing.content.substring(0, 100) + "...", url: shareUrl })
        .catch(() => { navigator.clipboard.writeText(shareUrl); alert("লিঙ্ক কপি করা হয়েছে!"); });
    } else {
      navigator.clipboard.writeText(shareUrl); alert("লিঙ্ক কপি করা হয়েছে!");
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`wc2${isL?" wc2-l":""}${hideShortWritingLabel?" wc2-short":""}`}
      style={{
        "--ca": c.accent, "--cg": c.glow, "--cbg": c.bg,
        "--cbg2": c.badge, "--cbdr": c.border,
        animationDelay: `${index * 0.04}s`,
        cursor: "pointer", display: "block",
      } as React.CSSProperties}
      initial={{ opacity: 0, y: 22 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={{ duration: .42, delay: index * 0.035, ease: [.25,.46,.45,.94] }}
      onClick={onClick}
      role="article" tabIndex={0}
      aria-label={`${writing.title} পড়ুন`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      whileTap={{ scale: .97 }}
      data-href={`/writings/${slug}`}
    >
      <div className="wc2-top"/>
      <div className="wc2-glow"/>
      <div className="wc2-body">
        {isL ? (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="wc2-tags">
                {!hideShortWritingLabel && <span className="wc2-cat"><span style={{ fontSize: ".75rem" }}>{c.icon}</span>{writing.category}</span>}
                {writing.featured && <span className="wc2-star"><Star size={9} fill="currentColor"/> বিশেষ</span>}
              </div>
              <div className="wc2-title">{writing.title}</div>
            </div>
            <div className="wc2-foot" style={{ border: "none", padding: 0 }}>
              <span className="wc2-date"><Calendar size={10}/>{writing.date}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
                <button onClick={handleLike} title="ভালো লেগেছে" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: ".85rem", opacity: liked ? 1 : .42, transition: "opacity .15s, transform .15s", transform: liked ? "scale(1.24)" : "scale(1)" }}>
                  {liked ? "❤️" : "🤍"}
                </button>
                <button onClick={handleShare} title="শেয়ার করুন" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: ".85rem", opacity: .42, transition: "opacity .15s" }}>
                  <Share2 size={11}/>
                </button>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }} className="wc2-read" style={{ color: c.accent, display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }} aria-label={`${writing.title} পড়ুন`}>
                  পড়ুন <ArrowRight size={11}/>
                </button>
              </div>
            </div>
          </>
        ) : (
                    <>            <div className="wc2-tags">
              {!hideShortWritingLabel && <span className="wc2-cat"><span style={{ fontSize: ".75rem" }}>{c.icon}</span>{writing.category}</span>}
              {writing.featured && <span className="wc2-star"><Star size={9} fill="currentColor"/> বিশেষ</span>}
            </div>
            {!hideShortWritingLabel && <div className="wc2-title">{writing.title}</div>}
            <div className="wc2-preview">{writing.content}</div>
            <div className="wc2-foot">
              <span className="wc2-date"><Calendar size={10}/>{writing.date}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={handleLike} title="ভালো লেগেছে" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: ".85rem", opacity: liked ? 1 : .42, transition: "opacity .15s, transform .15s", transform: liked ? "scale(1.24)" : "scale(1)" }}>
                  {liked ? "❤️" : "🤍"}
                </button>
                <button onClick={handleShare} title="শেয়ার করুন" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: ".85rem", opacity: .42, transition: "opacity .15s" }}>
                  <Share2 size={11}/>
                </button>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }} className="wc2-read" style={{ color: c.accent, display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }} aria-label={`${writing.title} পড়ুন`}>
                  পড়ুন <ArrowRight size={11}/>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ── Writing Modal v10 — Immersive Reader ──────────────────────────────────────
function WritingModal({ writing, allWritings, onClose, onNavigate }: {
  writing: Writing; allWritings: Writing[];
  onClose: () => void; onNavigate: (w: Writing) => void;
}) {
  const c = getCatStyle(writing.category);
  const hideShortWritingLabel = writing.category === "ছোট লেখা";
  const [fontSize, setFontSize] = useState(1.0);
  const [theme, setTheme] = useState<"dark"|"sepia"|"light">("dark");
  const [progress, setProgress] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  const idx = allWritings.findIndex(w => w.id === writing.id);
  const prev = idx > 0 ? allWritings[idx - 1] : null;
  const next = idx < allWritings.length - 1 ? allWritings[idx + 1] : null;
  const writingSlug = makeSlug(writing.title, writing.id);
  const writingUrl = `${window.location.origin}/writings/${writingSlug}`;
  const wordCount = writing.content.trim().split(/\s+/).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 150));
  const readTimeLabel = readMinutes === 1 ? "১ মিনিট" : `${readMinutes} মিনিট`;
  const relatedWritings = allWritings.filter(w => w.id !== writing.id && w.category === writing.category).slice(0, 3);

  const T = {
    dark:  { bg:"#040810", txt:"#EDE8DE", sub:"rgba(237,232,222,.55)", bdr:"rgba(255,255,255,.09)", hnd:"rgba(255,255,255,.16)", prog:c.accent },
    sepia: { bg:"#1C1408", txt:"#E8D8A8", sub:"rgba(232,216,168,.58)", bdr:"rgba(232,216,168,.15)", hnd:"rgba(232,216,168,.28)", prog:"#D4A84C" },
    light: { bg:"#FDFAF6", txt:"#1C1814", sub:"rgba(28,24,20,.52)", bdr:"rgba(28,24,20,.12)", hnd:"rgba(28,24,20,.18)", prog:c.accent },
  }[theme];

  useEffect(() => {
    const el = bodyRef.current; if (!el) return;
    const fn = () => { const p = el.scrollTop / (el.scrollHeight - el.clientHeight); setProgress(isNaN(p) ? 0 : Math.min(1, p) * 100); };
    el.addEventListener("scroll", fn); return () => el.removeEventListener("scroll", fn);
  }, [writing]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowLeft" && prev) onNavigate(prev); if (e.key === "ArrowRight" && next) onNavigate(next); };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [prev, next, onClose, onNavigate]);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShowShare(false); };
    document.addEventListener("mousedown", fn); return () => document.removeEventListener("mousedown", fn);
  }, []);

  return createPortal(
    <motion.div className="rm2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .3 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="rm2-box" style={{ background: T.bg }}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 36, stiffness: 310 }}>
        <div className="rm2-hnd" style={{ background: T.hnd }}/>
        <div className="rm2-prog" style={{ background: "rgba(255,255,255,.055)" }}>
          <div className="rm2-pf" style={{ width: `${progress}%`, background: T.prog }}/>
        </div>
        <div className="rm2-hd" style={{ borderColor: T.bdr }}>
          <div className="rm2-hdl">
            {!hideShortWritingLabel && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 13px", borderRadius:999, background:c.bg, color:c.accent, border:`1px solid ${c.border}`, fontFamily:"var(--f)", fontSize:".71rem", fontWeight:600 }}>
                <span style={{ fontSize:".75rem" }}>{c.icon}</span>{writing.category}
              </span>
            )}
          </div>
          <div className="rm2-ctrl">
            <div className="rm2-fc" style={{ borderColor: T.bdr }}>
              <button className="rm2-fb" style={{ color: T.sub }} onClick={() => setFontSize(f => Math.max(.82, f - .1))}><AArrowDown size={13}/></button>
              <button className="rm2-fb" style={{ color: T.sub, borderLeft: `1px solid ${T.bdr}` }} onClick={() => setFontSize(f => Math.min(1.4, f + .1))}><AArrowUp size={13}/></button>
            </div>
            <button className="rm2-th" style={{ color: T.sub, borderColor: T.bdr }} onClick={() => setTheme(t => t === "dark" ? "sepia" : t === "sepia" ? "light" : "dark")}>
              {theme === "dark" ? <Moon size={12}/> : theme === "sepia" ? <Scroll size={12}/> : <Sun size={12}/>}
              <span style={{ fontSize:".69rem" }}>{theme === "dark" ? "ডার্ক" : theme === "sepia" ? "সেপিয়া" : "লাইট"}</span>
            </button>
            <div style={{ position:"relative" }} ref={shareRef}>
              <button className="rm2-btn" style={{ color: T.sub, borderColor: T.bdr }} onClick={() => setShowShare(s => !s)}><Share2 size={13}/></button>
              {showShare && (
                <div className="rm2-sdd">
                  <button className="rm2-si" style={{ color:"#F2EDE4" }} onClick={() => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(writingUrl)}`,"_blank"); setShowShare(false); }}><Facebook size={14} color="#1877F2"/> Facebook</button>
                  <button className="rm2-si" style={{ color:"#F2EDE4" }} onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(writing.title+' — '+writingUrl)}`,"_blank"); setShowShare(false); }}><span style={{ fontSize:14 }}>💬</span> WhatsApp</button>
                  <button className="rm2-si" style={{ color:"#F2EDE4" }} onClick={() => { navigator.clipboard.writeText(writingUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => { const el = document.createElement('textarea'); el.value = writingUrl; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); setCopied(true); setTimeout(() => setCopied(false), 2000); }); setShowShare(false); }}>{copied ? <Check size={14} color="#34D399"/> : <Copy size={14}/>}{copied ? "কপি হয়েছে!" : "লিংক কপি"}</button>
                </div>
              )}
            </div>
            <button className="rm2-btn" style={{ color: T.sub, borderColor: T.bdr }} onClick={onClose}><X size={14}/></button>
          </div>
        </div>
        <div className="rm2-body" ref={bodyRef}>
          {!hideShortWritingLabel && <h1 className="rm2-ttl" style={{ color: T.txt }}>{writing.title}</h1>}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:"1.3rem", opacity:.52 }}>
            <span style={{ color:T.txt, fontSize:".73rem", fontFamily:"var(--f)" }}>⏱ {readTimeLabel} পড়তে লাগবে</span>
            {!hideShortWritingLabel && <span style={{ color:T.bdr }}>·</span>}
            {!hideShortWritingLabel && <span style={{ color:T.txt, fontSize:".73rem", fontFamily:"var(--f)" }}>{writing.category}</span>}
          </div>
          <div className="rm2-txt" style={{ color:T.txt, fontSize:`${fontSize}rem`, whiteSpace:'pre-line' }}>
            {writing.content.split(/\n\n+/).map((para, i) => (
              para.trim() ? <p key={i} style={{ marginBottom:'2rem', lineHeight:'2.4', fontSize:'inherit' }}>{para.trim()}</p> : null
            ))}
          </div>
          <div className="rm2-sig" style={{ borderColor:T.bdr, color:T.txt }}>— মাহবুব সরদার সবুজ · {writing.date}</div>
          {relatedWritings.length > 0 && (
            <div style={{ marginTop:"2.4rem", paddingTop:"1.7rem", borderTop:`1px solid ${T.bdr}` }}>
              <p style={{ color:T.sub, fontSize:".73rem", fontFamily:"var(--f)", letterSpacing:".1em", textTransform:"uppercase", marginBottom:".95rem", fontWeight:600 }}>সম্পর্কিত লেখা</p>
              <div style={{ display:"flex", flexDirection:"column", gap:".58rem" }}>
                {relatedWritings.map(rw => (
                  <button key={rw.id} onClick={() => onNavigate(rw)} style={{ textAlign:"left", padding:".75rem 1.1rem", borderRadius:11, background:"rgba(255,255,255,.045)", border:`1px solid ${T.bdr}`, color:T.txt, cursor:"pointer", fontSize:".85rem", fontFamily:"var(--f)", lineHeight:1.45, transition:"background .15s, border-color .15s" }}
                    onMouseEnter={e => { (e.currentTarget.style.background="rgba(255,255,255,.09)"); (e.currentTarget.style.borderColor="rgba(255,255,255,.14)"); }}
                    onMouseLeave={e => { (e.currentTarget.style.background="rgba(255,255,255,.045)"); (e.currentTarget.style.borderColor=T.bdr); }}>
                    {rw.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="rm2-nav" style={{ borderColor: T.bdr }}>
          <button className="rm2-nb" style={{ borderColor:T.bdr }} onClick={() => prev && onNavigate(prev)} disabled={!prev}>
            <ChevronLeft size={16} style={{ color:prev?c.accent:T.sub, flexShrink:0 }}/>
            <span><span className="rm2-nl" style={{ color:T.sub }}>পূর্ববর্তী</span><span className="rm2-nt" style={{ color:T.txt }}>{prev?.title ?? "—"}</span></span>
          </button>
          <button className="rm2-nb" style={{ borderColor:T.bdr, justifyContent:"flex-end" }} onClick={() => next && onNavigate(next)} disabled={!next}>
            <span style={{ textAlign:"right" }}><span className="rm2-nl" style={{ color:T.sub }}>পরবর্তী</span><span className="rm2-nt" style={{ color:T.txt }}>{next?.title ?? "—"}</span></span>
            <ChevronRight size={16} style={{ color:next?c.accent:T.sub, flexShrink:0 }}/>
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ── Book Modal v10 ────────────────────────────────────────────────────────────
function BookModal({ book, onClose }: { book: typeof ebooks[0]; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return createPortal(
    <motion.div className="bm2" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="bm2-box"
        initial={{ opacity:0, scale:.91, y:28 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:.91, y:28 }}
        transition={{ type:"spring", damping:32, stiffness:280 }}>
        <div className="bm2-hd">
          <span style={{ fontFamily:"var(--f)", fontSize:".77rem", color:"rgba(242,237,228,.42)", display:"flex", alignItems:"center", gap:6 }}>
            <BookOpen size={13} color={book.accentColor}/> {book.subtitle}
          </span>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,.055)", border:"1px solid rgba(255,255,255,.09)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"rgba(242,237,228,.42)", transition:"all .2s" }}>
            <X size={14}/>
          </button>
        </div>
        <div className="bm2-in">
          <div className="bm2-cw">
            <img src={book.cover} alt={`${book.title} - ${book.genre} ই-বুক কভার - মাহবুব সরদার সবুজ`} className="bm2-cv" loading="lazy" decoding="async"
              onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='213' viewBox='0 0 160 213'%3E%3Crect fill='%230D1120'/%3E%3Ctext x='50%25' y='50%25' fill='%23C9A84C' font-size='14' text-anchor='middle' dominant-baseline='middle'%3E📖%3C/text%3E%3C/svg%3E"; }}/>
          </div>
          <div className="bm2-cnt">
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:999, background:`${book.accentColor}15`, border:`1px solid ${book.accentColor}2A`, marginBottom:"1.1rem" }}>
              <span style={{ fontFamily:"var(--f)", fontSize:".65rem", color:book.accentColor, letterSpacing:".1em", textTransform:"uppercase", fontWeight:600 }}>{book.badge}</span>
            </div>
            <h2 style={{ fontFamily:"var(--f)", fontSize:"1.32rem", color:"#EDE8DE", lineHeight:1.52, marginBottom:".78rem", fontWeight:700, letterSpacing:"-.018em" }}>{book.title}</h2>
            <p style={{ fontFamily:"var(--f)", fontSize:".88rem", color:"rgba(237,232,222,.62)", lineHeight:2.05, marginBottom:"1.25rem" }}>{book.description}</p>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:"1.45rem" }}>
              {[book.genre, `${book.pages} পৃষ্ঠা`, book.year].map((t, i) => (
                <span key={i} style={{ padding:"5px 14px", borderRadius:999, background:"rgba(255,255,255,.065)", border:"1px solid rgba(255,255,255,.11)", fontFamily:"var(--f)", fontSize:".72rem", color:"rgba(237,232,222,.48)" }}>{t}</span>
              ))}
            </div>
            <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
              {book.buyLink && (
                <a href={book.buyLink} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:7, padding:"11px 22px", borderRadius:999, background:`linear-gradient(135deg,${book.accentColor},${book.accentColor}CC)`, color:"#080A14", fontFamily:"var(--f)", fontSize:".85rem", textDecoration:"none", transition:"all .28s", boxShadow:`0 9px 28px ${book.accentColor}32`, fontWeight:700 }}>
                  <ShoppingCart size={13}/> কিনুন
                </a>
              )}
              {book.canRead && (
                <a href={`/ebooks/read/${book.slug}`} style={{ display:"flex", alignItems:"center", gap:7, padding:"11px 22px", borderRadius:999, background:"transparent", color:book.accentColor, fontFamily:"var(--f)", fontSize:".85rem", textDecoration:"none", border:`1.5px solid ${book.accentColor}3A`, transition:"all .28s", fontWeight:600 }}>
                  <BookOpen size={13}/> পড়ুন
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ── Literary Hero v10 ─────────────────────────────────────────────────────────
function LiteraryHero({ totalWritings }: { totalWritings: number }) {
  const heroBooks = ebooks.filter(b => b.isFeatured).slice(0,3);
  const books = heroBooks.length >= 3 ? heroBooks : ebooks.slice(0,3);

  return (
    <motion.section
      className="hero-stage"
      aria-labelledby="hero-title"
      initial={{ opacity:0, y:30 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:.6, ease:[.25,.46,.45,.94] }}
    >
      <div className="hero-grid">
        <div className="hero-copy">
          <motion.div className="hero-eyebrow" initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:.15, duration:.5 }}>
            <Feather size={13}/> সাহিত্য সংগ্রহ
          </motion.div>
          <motion.h1 id="hero-title" className="hero-title" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.22, duration:.55 }}>
            লেখালেখি ও{" "}
            <span className="hero-title-gold">বই</span>
          </motion.h1>
          <motion.p className="hero-desc" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.3, duration:.5 }}>
            মাহবুব সরদার সবুজের কবিতা, অনুভূতির লেখা এবং বইয়ের নির্বাচিত সংগ্রহ — পাঠকের জন্য সাজানো এক নান্দনিক সাহিত্যভুবন।
          </motion.p>
          <motion.div className="hero-stats" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.38, duration:.48 }}>
            <div className="hero-stat"><span className="hero-stat-num">{totalWritings > 0 ? `${totalWritings}+` : "৩০০+"}</span><span>লেখা</span></div>
            <div className="hero-stat"><span className="hero-stat-num">{ebooks.length}</span><span>বই ও ই-বুক</span></div>
            <div className="hero-stat"><span className="hero-stat-num">৫</span><span>ক্যাটাগরি</span></div>
          </motion.div>
        </div>
        <motion.div className="hero-showcase" aria-label="নির্বাচিত বইয়ের প্রদর্শনী"
          initial={{ opacity:0, scale:.94 }} animate={{ opacity:1, scale:1 }} transition={{ delay:.2, duration:.6 }}>
          <div className="hero-book-stack" aria-hidden="true">
            {books.map(book => (
              <img key={book.id} src={book.cover} alt={`${book.title} — মাহবুব সরদার সবুজ`} className="hero-book" loading="eager" decoding="async"/>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ── Book Tile v10 ─────────────────────────────────────────────────────────────
function BookTile({ book, index }: { book: typeof ebooks[0]; index: number }) {
  const [, setLocation] = useLocation();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.article
      ref={ref}
      className={`ebook-tile${book.isFeatured?" featured":""}`}
      style={{ "--ba": book.accentColor } as React.CSSProperties}
      initial={{ opacity:0, y:30, rotateX:7 }}
      animate={isInView ? { opacity:1, y:0, rotateX:0 } : { opacity:0, y:30, rotateX:7 }}
      transition={{ delay:index*.08, duration:.48, ease:[.25,.46,.45,.94] }}
      onClick={() => setLocation(`/ebooks/read/${book.slug}`)}
      role="article" tabIndex={0}
      aria-label={`${book.title} দেখুন`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLocation(`/ebooks/read/${book.slug}`); } }}
    >
      <div className="ebook-glow"/>
      <div className="ebook-cover-wrap">
        <img src={book.cover} alt={`${book.title} - ${book.genre} বাংলা ই-বুক - মাহবুব সরদার সবুজ`} className="ebook-cover" loading="lazy" decoding="async"
          onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='267' viewBox='0 0 200 267'%3E%3Crect fill='%230D1120'/%3E%3Ctext x='50%25' y='50%25' fill='%23C9A84C' font-size='14' text-anchor='middle' dominant-baseline='middle'%3E📖%3C/text%3E%3C/svg%3E"; }}/>
        <span className="ebook-badge">{book.isFeatured && <Crown size={10}/>} {book.badge}</span>
      </div>
      <div className="ebook-copy">
        <span className="ebook-genre">{book.genre}</span>
        <h3>{book.title}</h3>
        <p>{book.description}</p>
        <div className="ebook-meta"><Calendar size={10}/>{book.year} · {book.pages} পৃষ্ঠা</div>
        <div className="ebook-actions">
          <Link href={`/ebooks/read/${book.slug}`} onClick={(e) => e.stopPropagation()} className="ebook-preview" style={{ display:"flex", alignItems:"center", gap:5, textDecoration:"none" }}><Eye size={12}/> দেখুন</Link>
          {book.canRead && <Link href={`/ebooks/read/${book.slug}`} onClick={(e) => e.stopPropagation()} className="ebook-read"><BookOpen size={12}/> পড়ুন</Link>}
          {book.buyLink && <a href={book.buyLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ebook-buy"><ShoppingCart size={12}/> কিনুন</a>}
        </div>
      </div>
    </motion.article>
  );
}

// ── Books Tab v10 ─────────────────────────────────────────────────────────────
function BooksTab() {
  const [, setLocation] = useLocation();
  const featured = ebooks[0];
  const remaining = ebooks.slice(1);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.section
      ref={ref}
      className="panel panel-gold"
      aria-labelledby="books-title"
      initial={{ opacity:0, y:28 }}
      animate={isInView ? { opacity:1, y:0 } : { opacity:0, y:28 }}
      transition={{ duration:.52, ease:[.25,.46,.45,.94] }}
    >
      <div className="panel-head">
        <div>
          <div className="section-eyebrow"><Library size={13}/> বই ও ই-বুক</div>
          <h2 id="books-title">প্রকাশনা সংগ্রহ</h2>
          <p>মাহবুব সরদার সবুজের প্রকাশিত বই ও ই-বুকের সম্পূর্ণ সংগ্রহ</p>
        </div>
      </div>

      <div className="book-shelf">
        {/* Featured book */}
        <motion.article
          className="featured-book"
          style={{ "--ba": featured.accentColor } as React.CSSProperties}
          initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:.48, ease:[.25,.46,.45,.94] }}
          onClick={() => setLocation(`/ebooks/read/${featured.slug}`)}
          role="article" tabIndex={0}
          aria-label={`${featured.title} দেখুন`}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLocation(`/ebooks/read/${featured.slug}`); } }}
        >
          <div className="ebook-glow"/>
          <div className="featured-inner">
            <img src={featured.cover} alt={`${featured.title} - ${featured.genre} বই - মাহবুব সরদার সবুজ`} className="featured-cover" loading="eager" decoding="async" fetchPriority="high"/>
            <div>
              <span className="ebook-badge" style={{ position:"static" }}><Crown size={10}/> {featured.badge}</span>
              <h3>{featured.title}</h3>
              <div className="featured-meta"><Calendar size={11}/>{featured.year} · {featured.pages} পৃষ্ঠা · {featured.genre}</div>
            </div>
            <div className="featured-actions">
              <Link href={`/ebooks/read/${featured.slug}`} onClick={(e) => e.stopPropagation()}
                style={{ background:`linear-gradient(135deg,${featured.accentColor}2C,${featured.accentColor}18)`, borderColor:`${featured.accentColor}48`, color:"#F2EDE4" }}>
                <BookOpen size={13}/> পড়ুন
              </Link>
              {featured.buyLink && (
                <a href={featured.buyLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  style={{ background:`linear-gradient(135deg,${featured.accentColor},${featured.accentColor}CC)`, borderColor:"transparent", color:"#080A14" }}>
                  <ShoppingCart size={13}/> কিনুন
                </a>
              )}
            </div>
          </div>
        </motion.article>

        {/* Remaining books */}
        <div className="ebook-row">
          {remaining.map((book, i) => <BookTile key={book.id} book={book} index={i+1}/>)}
        </div>
      </div>
    </motion.section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE v10 — Cinematic Literary Universe
// ══════════════════════════════════════════════════════════════════════════════
export default function Writings() {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Writing|null>(null);
  const [viewMode, setViewMode] = useState<"grid"|"list">("grid");
  const [visibleCount, setVisibleCount] = useState(WRITINGS_PAGE_SIZE);
  const [visibleShortCount, setVisibleShortCount] = useState(WRITINGS_PAGE_SIZE);
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/writings/:slug");
  const [archive, setArchive] = useState<Writing[]>([]);
  const [archiveReady, setArchiveReady] = useState(false);
  const deferredQuery = useDeferredValue(q);
  const writingsSectionRef = useRef<HTMLElement>(null);
  const isWritingsInView = useInView(writingsSectionRef, { once: true, margin: "-60px" });

  useEffect(() => {
    let mounted = true;
    import("@/data/writingsArchive").then(({ writings }) => { if (mounted) { setArchive(writings); setArchiveReady(true); } }).catch(() => { if (mounted) setArchiveReady(true); });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = archive;
    if (cat !== "all") list = list.filter(w => w.category === cat);
    if (deferredQuery.trim()) { const qn = deferredQuery.trim().toLowerCase(); list = list.filter(w => w.title.toLowerCase().includes(qn) || w.content.toLowerCase().includes(qn)); }
    return list;
  }, [archive, cat, deferredQuery]);

  // সব লেখা ফিল্টারে: বড় লেখা ও ছোট লেখা আলাদা সেকশনে দেখাবে
  // নির্দিষ্ট ক্যাটাগরি ফিল্টারে: সব লেখা এক সেকশনে
  const showSplitSections = cat === "all";
  const longWritings = useMemo(() => {
    if (!showSplitSections) return filtered;
    return filtered.filter(w => w.category !== "ছোট লেখা");
  }, [filtered, showSplitSections]);
  const shortWritings = useMemo(() => {
    if (!showSplitSections) return [];
    return filtered.filter(w => w.category === "ছোট লেখা");
  }, [filtered, showSplitSections]);

  useEffect(() => { setVisibleCount(WRITINGS_PAGE_SIZE); setVisibleShortCount(WRITINGS_PAGE_SIZE); }, [cat, deferredQuery]);

  const mainList = showSplitSections ? longWritings : filtered;
  const visibleWritings = useMemo(() => mainList.slice(0, visibleCount), [mainList, visibleCount]);
  const hasMoreWritings = visibleCount < mainList.length;
  const visibleShortWritings = useMemo(() => shortWritings.slice(0, visibleShortCount), [shortWritings, visibleShortCount]);
  const hasMoreShortWritings = visibleShortCount < shortWritings.length;

  useEffect(() => {
    if (match && params?.slug && archiveReady) {
      const w = archive.find(wr => matchesWritingSlug(wr, params.slug));
      if (w) { setSel(w); } else { setSel(null); setLocation('/writings', { replace: true }); }
    }
  }, [archive, match, params?.slug, archiveReady, setLocation]);

  const handleCardClick = useCallback((w: Writing) => { setSel(w); setLocation(`/writings/${makeSlug(w.title, w.id)}`); }, [setLocation]);
  const handleModalClose = useCallback(() => { setSel(null); setLocation("/writings"); }, [setLocation]);
  const handleNavigate = useCallback((w: Writing) => { setSel(w); setLocation(`/writings/${makeSlug(w.title, w.id)}`); }, [setLocation]);

  const seoPath = sel ? `/writings/${makeSlug(sel.title, sel.id)}` : "/writings";
  const seoTitle = sel ? `${sel.title} — মাহবুব সরদার সবুজ` : "লেখালেখি ও বই — মাহবুব সরদার সবুজ";
  const seoDescription = sel ? makeExcerpt(sel.content) : "মাহবুব সরদার সবুজের প্রকাশিত ই-বুক, বই এবং সকল লেখা একসাথে একটি প্রিমিয়াম সাহিত্য সংগ্রহে।";

  const writingsJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      { "@type":"CollectionPage", "@id":siteUrl("/writings#collection"), "name":"লেখালেখি ও বই — মাহবুব সরদার সবুজ", "url":siteUrl("/writings"), "inLanguage":"bn-BD", "description":"মাহবুব সরদার সবুজের বই, ই-বুক, কবিতা, ভালোবাসা, বিচ্ছেদ ও জীবনদর্শনের লেখাগুলোর curated সংগ্রহ।", "isPartOf":{ "@type":"WebSite", "@id":siteUrl("/#website"), "name":"মাহবুব সরদার সবুজ" }, "about":{ "@id":siteUrl("/about#author") } },
      { "@type":"Person", "@id":siteUrl("/about#author"), "name":"মাহবুব সরদার সবুজ", "alternateName":"Mahbub Sardar Sabuj", "url":siteUrl("/about"), "knowsLanguage":["bn-BD","en"] },
      { "@type":"BreadcrumbList", "itemListElement":[ { "@type":"ListItem","position":1,"name":"হোম","item":siteUrl("/") }, { "@type":"ListItem","position":2,"name":"লেখালেখি ও বই","item":siteUrl("/writings") }, ...(sel?[{ "@type":"ListItem","position":3,"name":sel.title,"item":siteUrl(seoPath) }]:[]) ] },
      { "@type":"ItemList", "@id":siteUrl("/writings#latest-writings"), "name":"নির্বাচিত অনুভূতির আর্কাইভ", "itemListElement":archive.slice(0,24).map((writing,index) => ({ "@type":"ListItem","position":index+1,"url":siteUrl(`/writings/${makeSlug(writing.title,writing.id)}`),"name":writing.title })) },
      ...ebooks.map(book => ({ "@type":"Book","@id":siteUrl(`/ebooks/read/${book.slug}#book`),"name":book.title,"inLanguage":"bn-BD","author":{"@id":siteUrl("/about#author")},"url":siteUrl(`/ebooks/read/${book.slug}`),"image":siteUrl(book.cover),"description":book.description,"genre":book.genre,"bookFormat":book.badge.includes("ফিজিক্যাল")?"https://schema.org/Hardcover":"https://schema.org/EBook","isAccessibleForFree":!book.buyLink })),
      ...(sel?[{ "@type":"CreativeWork","@id":siteUrl(`${seoPath}#writing`),"name":sel.title,"headline":sel.title,"url":siteUrl(seoPath),"inLanguage":"bn-BD","text":makeExcerpt(sel.content,500),"description":makeExcerpt(sel.content),"datePublished":sel.date,"genre":sel.category,"author":{"@id":siteUrl("/about#author")},"isAccessibleForFree":true }]:[]),
    ],
  }), [archive, sel, seoPath]);

  return (
    <>
      <Seo title={seoTitle} description={seoDescription} path={seoPath}
        keywords="মাহবুব সরদার সবুজ লেখা, বাংলা কবিতা, বাংলা ই-বুক, বাংলা বই, ভালোবাসার লেখা, বিচ্ছেদের লেখা, জীবনদর্শন, Mahbub Sardar Sabuj writings, bangla kobita, bangla poem collection, বাংলা কবিতা পড়ুন, বাংলা সাহিত্য, বাংলাদেশি কবির লেখা"
        jsonLd={writingsJsonLd}/>
      <Navbar/>
      <style>{CSS}</style>

      <div className="wp wp-cinema">
        <FloatingParticles/>
        <div className="cinema-aurora" aria-hidden="true"/>

        <div className="mc mc-cinema">
          {/* Hero */}
          <LiteraryHero totalWritings={archive.length}/>

          {/* Books */}
          <BooksTab/>

          {/* Writings Archive */}
          <motion.section
            ref={writingsSectionRef}
            className="panel panel-blue"
            id="all-writings"
            aria-labelledby="writings-title"
            initial={{ opacity:0, y:28 }}
            animate={isWritingsInView ? { opacity:1, y:0 } : { opacity:0, y:28 }}
            transition={{ duration:.52, ease:[.25,.46,.45,.94] }}
          >
            <div className="panel-head">
              <div>
                <div className="section-eyebrow"><Feather size={13}/> লেখালেখি</div>
                <h2 id="writings-title">নির্বাচিত অনুভূতির আর্কাইভ</h2>
                <p>ভালোবাসা, বিচ্ছেদ, কবিতা ও জীবনদর্শনের সেরা লেখাগুলো</p>
              </div>
            </div>

            {/* Tools bar */}
            <div className="writing-tools">
              <div className="sf-s wt-search">
                <Search size={13} color="rgba(242,237,228,.34)"/>
                <input type="text" placeholder="লেখা খুঁজুন…" aria-label="লেখা খুঁজুন" value={q} onChange={e => setQ(e.target.value)} disabled={!archiveReady}/>
                {q && <button aria-label="সার্চ মুছে ফেলুন" onClick={() => setQ("")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(242,237,228,.35)", display:"flex", transition:"color .15s" }}><X size={12}/></button>}
              </div>
              <div className="sf-cats wt-cats">
                {CATS.map(c2 => (
                  <motion.button key={c2.id} className="sf-cat"
                    style={cat === c2.id ? { background:`${c2.color}11`, color:c2.color, borderColor:`${c2.color}2A`, boxShadow:`0 0 16px ${c2.glow}, 0 2px 10px rgba(0,0,0,.22)` } : {}}
                    onClick={() => setCat(c2.id)} aria-pressed={cat === c2.id} whileTap={{ scale:.92 }}>
                    <span style={{ fontSize:".77rem" }}>{c2.icon}</span>{c2.label}
                  </motion.button>
                ))}
              </div>
              <div className="sf-vw wt-view">
                <button className={`sf-vb${viewMode==="grid"?" on":""}`} onClick={() => setViewMode("grid")} title="গ্রিড" aria-label="গ্রিড ভিউ" aria-pressed={viewMode==="grid"}><Grid3X3 size={13}/></button>
                <button className={`sf-vb${viewMode==="list"?" on":""}`} onClick={() => setViewMode("list")} title="লিস্ট" aria-label="লিস্ট ভিউ" aria-pressed={viewMode==="list"}><List size={13}/></button>
              </div>
            </div>

            {/* Active filter */}
            {(cat !== "all" || q) && (
              <div className="rb2 rb2-cinema">
                <div className="rb2-t">
                  {cat !== "all" && <span style={{ color:CATS.find(c2=>c2.id===cat)?.color }}>{CATS.find(c2=>c2.id===cat)?.label}</span>}
                  {cat !== "all" && deferredQuery && <span>·</span>}
                  {deferredQuery && <span>"{deferredQuery}"</span>}
                  {filtered.length > 0 && <span style={{ color:"rgba(242,237,228,.22)" }}>— {filtered.length}টি লেখা</span>}
                </div>
                <button className="rb2-clr" aria-label="সব ফিল্টার সরান" onClick={() => { setCat("all"); setQ(""); }}><X size={10}/> সরান</button>
              </div>
            )}

            {/* Cards */}
            {!archiveReady ? (
              <div aria-live="polite" aria-label="লেখাগুলো লোড হচ্ছে">
                <div className="wg2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="sk-card" style={{ animationDelay: `${i * 0.08}s` }}>
                      <div className="sk-tag skeleton"/>
                      <div className="sk-ttl skeleton"/>
                      <div className="sk-ttl2 skeleton"/>
                      <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1 }}>
                        <div className="sk-line skeleton"/>
                        <div className="sk-line2 skeleton"/>
                        <div className="sk-line3 skeleton"/>
                        <div className="sk-line skeleton" style={{ width:"90%" }}/>
                      </div>
                      <div className="sk-foot skeleton"/>
                    </div>
                  ))}
                </div>
              </div>
            ) : filtered.length > 0 ? (
              <>
                {/* বড় লেখা সেকশন — কবিতা, ভালোবাসা, জীবনদর্শন, বিচ্ছেদ */}
                {visibleWritings.length > 0 && (
                  <>
                    {cat === "all" && longWritings.length > 0 && (
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1.2rem", marginTop:".5rem" }}>
                        <span style={{ fontFamily:"var(--f)", fontSize:".72rem", color:"rgba(201,168,76,.55)", letterSpacing:".12em", textTransform:"uppercase", fontWeight:600 }}>✦ বড় লেখা</span>
                        <div style={{ flex:1, height:1, background:"rgba(201,168,76,.12)" }}/>
                        <span style={{ fontFamily:"var(--f)", fontSize:".68rem", color:"rgba(242,237,228,.22)" }}>{longWritings.length}টি</span>
                      </div>
                    )}
                    <div className={viewMode==="grid"?"wg2":"wg2-l"}>
                      {visibleWritings.map((w, i) => (
                        <WritingCard key={w.id} writing={w} index={i} onClick={() => handleCardClick(w)} viewMode={viewMode}/>
                      ))}
                    </div>
                    {hasMoreWritings && (
                      <div className="lm2">
                        <motion.button className="lm2-btn" aria-label="আরও বড় লেখা দেখুন" onClick={() => setVisibleCount(n => Math.min(n + WRITINGS_PAGE_SIZE, mainList.length))} whileTap={{ scale:.96 }}>
                          <ChevronDown size={15}/> আরও বড় লেখা দেখুন
                        </motion.button>
                        <span className="lm2-note">{visibleCount} / {mainList.length} লেখা দেখানো হচ্ছে</span>
                      </div>
                    )}
                  </>
                )}

                {/* ছোট লেখা সেকশন — শুধু "সব লেখা" ফিল্টারে আলাদা দেখাবে */}
                {cat === "all" && shortWritings.length > 0 && (
                  <motion.div
                    initial={{ opacity:0, y:18 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ duration:.45, delay:.1, ease:[.25,.46,.45,.94] }}
                    style={{ marginTop:"2.8rem" }}
                  >
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1.4rem" }}>
                      <span style={{ fontFamily:"var(--f)", fontSize:".72rem", color:"rgba(52,211,153,.65)", letterSpacing:".12em", textTransform:"uppercase", fontWeight:600 }}>✎ ছোট লেখা</span>
                      <div style={{ flex:1, height:1, background:"rgba(52,211,153,.12)" }}/>
                      <span style={{ fontFamily:"var(--f)", fontSize:".68rem", color:"rgba(242,237,228,.22)" }}>{shortWritings.length}টি</span>
                    </div>
                    <div className={viewMode==="grid"?"wg2":"wg2-l"}>
                      {visibleShortWritings.map((w, i) => (
                        <WritingCard key={w.id} writing={w} index={i} onClick={() => handleCardClick(w)} viewMode={viewMode}/>
                      ))}
                    </div>
                    {hasMoreShortWritings && (
                      <div className="lm2">
                        <motion.button className="lm2-btn" aria-label="আরও ছোট লেখা দেখুন" onClick={() => setVisibleShortCount(n => Math.min(n + WRITINGS_PAGE_SIZE, shortWritings.length))} whileTap={{ scale:.96 }}>
                          <ChevronDown size={15}/> আরও ছোট লেখা দেখুন
                        </motion.button>
                        <span className="lm2-note">{visibleShortCount} / {shortWritings.length} লেখা দেখানো হচ্ছে</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            ) : (
              <div className="wc2-em">
                <Search size={30} color="rgba(242,237,228,.12)" style={{ margin:"0 auto 1rem", display:"block" }}/>
                <div style={{ fontSize:".97rem", color:"rgba(242,237,228,.3)", fontFamily:"var(--f)" }}>কোনো লেখা পাওয়া যায়নি</div>
                <button onClick={() => { setCat("all"); setQ(""); }} style={{ marginTop:"1.1rem", padding:"9px 20px", borderRadius:999, border:"1px solid rgba(201,168,76,.28)", background:"rgba(201,168,76,.09)", color:"#C9A84C", fontFamily:"var(--f)", fontSize:".82rem", cursor:"pointer", fontWeight:600 }}>
                  সব লেখা দেখুন
                </button>
              </div>
            )}
          </motion.section>
        </div>
      </div>

      <div style={{ maxWidth:840, margin:"0 auto", padding:"1.5rem 1rem" }}>
        <AdSenseAd adSlot="" adFormat="auto" fullWidthResponsive={true}/>
      </div>
      <Footer/>

      <AnimatePresence>
        {sel && (
          <WritingModal writing={sel} allWritings={filtered.length>0?filtered:archive} onClose={handleModalClose} onNavigate={handleNavigate}/>
        )}
      </AnimatePresence>
    </>
  );
}
