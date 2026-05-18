/**
 * Writings & E-Books Page — লেখালেখি ও বই
 * Design: CINEMATIC LITERARY UNIVERSE v9 — Ultra Premium Standard
 * Palette: Abyss #04060C | Ink #080C16 | Gold #C9A84C | Amber #E8B84B | Cream #F0EAE0
 * Typography: Noto Serif Bengali | Motion: Spring Physics | Glow: Layered
 * Features: Cinematic Hero | 3D Book Shelf | Immersive Reader | Premium Cards
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { SITE_URL } from "@/components/Seo";
import AdSenseAd from "@/components/AdSenseAd";
import type { Writing } from "@/data/writingsArchive";
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from "framer-motion";
import { useState, useEffect, useRef, useCallback, useMemo, useDeferredValue } from "react";
import { createPortal } from "react-dom";
import { Link, useRoute, useLocation } from "wouter";
import {
  Feather, ArrowLeft, BookOpen, Heart, Star, Calendar, X, Search, Share2, Copy,
  ChevronLeft, ChevronRight, Facebook, Check, AArrowUp, AArrowDown, PenLine,
  ShoppingCart, BookMarked, Eye, Quote, Library, TrendingUp, Award,
  Layers, Filter, SortAsc, Grid3X3, List, Bookmark, ExternalLink, ArrowRight,
  Pen, BookText, Flame, Crown, Zap, Moon, Sun, Scroll, Glasses, Hash,
  ChevronDown, Play, Pause, Volume2, BookCopy, GalleryVerticalEnd, Wand2,
  Sparkles, Stars,
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
  const base = makeLegacySlug(title, id);
  return `${base}-${id}`;
}

function matchesWritingSlug(writing: Writing, slug?: string): boolean {
  if (!slug) return false;
  return makeSlug(writing.title, writing.id) === slug || makeLegacySlug(writing.title, writing.id) === slug;
}

function makeExcerpt(text: string, maxLength = 170): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength).trim()}…` : normalized;
}

function siteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

// ── Category System ───────────────────────────────────────────────────────────
const CATS = [
  {id:"all",      label:"সব লেখা",    icon:"✦", color:"#C9A84C", glow:"rgba(201,168,76,.35)"},
  {id:"ছোট লেখা", label:"ছোট লেখা",  icon:"✎", color:"#34D399", glow:"rgba(52,211,153,.35)"},
  {id:"কবিতা",    label:"কবিতা",      icon:"❧", color:"#60A5FA", glow:"rgba(96,165,250,.35)"},
  {id:"ভালোবাসা", label:"ভালোবাসা",  icon:"♡", color:"#F472B6", glow:"rgba(244,114,182,.35)"},
  {id:"জীবনদর্শন",label:"জীবনদর্শন", icon:"◈", color:"#FBBF24", glow:"rgba(251,191,36,.35)"},
  {id:"বিচ্ছেদ",  label:"বিচ্ছেদ",   icon:"◌", color:"#A78BFA", glow:"rgba(167,139,250,.35)"},
];

function getCatStyle(cat: string) {
  const map: Record<string, {accent:string;glow:string;bg:string;badge:string;border:string;icon:string}> = {
    "ভালোবাসা": {accent:"#F472B6",glow:"rgba(244,114,182,.25)",bg:"rgba(244,114,182,.07)",badge:"rgba(244,114,182,.16)",border:"rgba(244,114,182,.3)",icon:"♡"},
    "বিচ্ছেদ":  {accent:"#A78BFA",glow:"rgba(167,139,250,.25)",bg:"rgba(167,139,250,.07)",badge:"rgba(167,139,250,.16)",border:"rgba(167,139,250,.3)",icon:"◌"},
    "কবিতা":    {accent:"#60A5FA",glow:"rgba(96,165,250,.25)", bg:"rgba(96,165,250,.07)", badge:"rgba(96,165,250,.16)", border:"rgba(96,165,250,.3)", icon:"❧"},
    "ছোট লেখা": {accent:"#34D399",glow:"rgba(52,211,153,.25)", bg:"rgba(52,211,153,.07)", badge:"rgba(52,211,153,.16)", border:"rgba(52,211,153,.3)", icon:"✎"},
    "জীবনদর্শন":{accent:"#FBBF24",glow:"rgba(251,191,36,.25)", bg:"rgba(251,191,36,.07)", badge:"rgba(251,191,36,.16)", border:"rgba(251,191,36,.3)", icon:"◈"},
  };
  return map[cat] ?? map["জীবনদর্শন"];
}

const WRITINGS_PAGE_SIZE = 24;

const ebooks = [
  {
    id: 1,
    slug: "dukkhovilash",
    title: "আমি বিচ্ছেদকে বলি দুঃখবিলাস",
    subtitle: "প্রথম ফিজিক্যাল বই",
    cover: "/images/ebooks/dukkhovilash.png",
    description:
      "'আমি বিচ্ছেদকে বলি দুঃখবিলাস' — লেখক মাহবুব সরদার সবুজের প্রথম প্রকাশিত ফিজিক্যাল বই। বিচ্ছেদের ব্যথা, হারানোর কষ্ট আর জীবনের গভীর অনুভূতিগুলো এই বইয়ে অনন্যভাবে তুলে ধরা হয়েছে।",
    genre: "আবেগী সাহিত্য",
    pages: "১৫০+",
    year: "২০২৬",
    badge: "ফিজিক্যাল বই",
    badgeColor: "#D4A843",
    buyLink: "https://rkmri.co/TTMEoA3l3pM0/",
    isFeatured: true,
    canRead: true,
    accentColor: "#D4A843",
  },
  {
    id: 2,
    slug: "smritir-boshonte",
    title: "স্মৃতির বসন্তে তুমি",
    subtitle: "ই-বুক",
    cover: "/images/ebooks/smritir-boshonte.jpg",
    description:
      "'স্মৃতির বসন্তে তুমি' — মাহবুব সরদার সবুজের একটি আবেগঘন কাব্যিক সংকলন। স্মৃতির গভীরে হারিয়ে যাওয়া প্রিয় মুহূর্তগুলো নিয়ে লেখা এই বইটি।",
    genre: "কবিতা ও গদ্য",
    pages: "৮০+",
    year: "২০২৪",
    badge: "ই-বুক",
    badgeColor: "#4A90D9",
    buyLink: null,
    isFeatured: false,
    canRead: true,
    accentColor: "#4A90D9",
  },
  {
    id: 3,
    slug: "chand-phool",
    title: "চাঁদফুল",
    subtitle: "ই-বুক",
    cover: "/images/ebooks/chand-phool.jpg",
    description:
      "'চাঁদফুল' — মাহবুব সরদার সবুজের একটি বিশেষ কাব্যগ্রন্থ যেখানে প্রকৃতির অপরূপ সৌন্দর্য আর মানবমনের কোমল অনুভূতির মেলবন্ধন ঘটেছে।",
    genre: "কবিতা",
    pages: "৬০+",
    year: "২০২৩",
    badge: "ই-বুক",
    badgeColor: "#27AE60",
    buyLink: null,
    isFeatured: false,
    canRead: true,
    accentColor: "#27AE60",
  },
  {
    id: 4,
    slug: "shomoyer-gohvore",
    title: "সময়ের গহ্বরে",
    subtitle: "ই-বুক",
    cover: "/images/ebooks/shomoyer-gohvore.jpg",
    description:
      "'সময়ের গহ্বরে' — মাহবুব সরদার সবুজের একটি নস্টালজিক সাহিত্যকর্ম। সময়ের স্রোতে হারিয়ে যাওয়া শহর, মানুষ আর স্মৃতির কথা এই বইয়ে অনবদ্যভাবে উঠে এসেছে।",
    genre: "গদ্য ও কবিতা",
    pages: "১০০+",
    year: "২০২৩",
    badge: "ই-বুক",
    badgeColor: "#E67E22",
    buyLink: null,
    isFeatured: false,
    canRead: true,
    accentColor: "#E67E22",
  },
  {
    id: 5,
    slug: "onoboddo-lekha",
    title: "মাহবুব সরদার সবুজের অনবদ্য লেখা",
    subtitle: "ই-বুক",
    cover: "/images/ebooks/onoboddo-lekha.jpg",
    description:
      "'মাহবুব সরদার সবুজের অনবদ্য লেখা' — ১০০টি জীবনমুখী ও অনুপ্রেরণামূলক লেখার সংকলন। ভালোবাসা, বিচ্ছেদ, জীবনদর্শন ও মানবিক অনুভূতির মিশ্রণে রচিত এই সংকলনটি পাঠকের মনে গভীর ছাপ ফেলবে।",
    genre: "মিশ্র সাহিত্য",
    pages: "১০১",
    year: "২০২৬",
    badge: "ই-বুক",
    badgeColor: "#8B5CF6",
    buyLink: null,
    isFeatured: true,
    canRead: true,
    accentColor: "#8B5CF6",
  },
];

// ══════════════════════════════════════════════════════════════════════════════
//  WRITINGS v9 — ULTRA CINEMATIC PREMIUM
//  Palette: Abyss #04060C | Gold #C9A84C | Cream #F0EAE0
// ══════════════════════════════════════════════════════════════════════════════
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@300;400;500;600;700&display=swap');

  :root {
    --bg0: #04060C;
    --bg1: #06080F;
    --bg2: #090C18;
    --bg3: #0D1122;
    --bg4: #111828;
    --t0: #F0EAE0;
    --t1: rgba(240,234,224,.88);
    --t2: rgba(240,234,224,.58);
    --t3: rgba(240,234,224,.32);
    --t4: rgba(240,234,224,.14);
    --gold: #C9A84C;
    --gold2: #E8C87A;
    --gold3: #F5DFA0;
    --bdr: rgba(255,255,255,.06);
    --bdr2: rgba(255,255,255,.11);
    --bdr3: rgba(255,255,255,.18);
    --f: 'Noto Serif Bengali', 'SolaimanLipi', serif;
    --r: cubic-bezier(.25,.46,.45,.94);
    --spring: cubic-bezier(.34,1.56,.64,1);
  }

  /* ── PAGE WRAPPER ── */
  .wp {
    background: var(--bg0);
    min-height: 100vh;
    padding-top: var(--site-nav-offset, 98px);
    position: relative;
  }

  /* ── AMBIENT BACKGROUND ── */
  .wp-cinema {
    position: relative;
    overflow: hidden;
  }
  .wp-cinema::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(ellipse 70% 55% at 15% 5%, rgba(201,168,76,.11) 0%, transparent 55%),
      radial-gradient(ellipse 55% 45% at 85% 15%, rgba(244,114,182,.08) 0%, transparent 50%),
      radial-gradient(ellipse 60% 50% at 50% 95%, rgba(96,165,250,.06) 0%, transparent 55%),
      radial-gradient(ellipse 40% 35% at 70% 50%, rgba(167,139,250,.05) 0%, transparent 45%);
  }
  .cinema-aurora {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: .6;
    background:
      linear-gradient(118deg, transparent 0 20%, rgba(201,168,76,.055) 35%, transparent 52% 100%),
      radial-gradient(circle at 42% 0%, rgba(232,200,122,.1), transparent 35%);
    filter: blur(.3px);
    animation: auroraShift 18s ease-in-out infinite alternate;
  }
  @keyframes auroraShift {
    0%   { opacity: .5; transform: translateX(0) scale(1); }
    50%  { opacity: .7; transform: translateX(12px) scale(1.015); }
    100% { opacity: .55; transform: translateX(-8px) scale(.99); }
  }

  /* ── MAIN CONTENT ── */
  .mc {
    max-width: 1240px;
    margin: 0 auto;
    padding: clamp(1.5rem,3vw,2.5rem) clamp(1rem,4vw,2.5rem);
  }
  .mc-cinema {
    position: relative;
    z-index: 1;
    padding-top: clamp(1.2rem, 3vw, 2.2rem);
  }

  /* ══════════════════════════════════════════════════
     LITERARY HERO — CINEMATIC BANNER
  ══════════════════════════════════════════════════ */
  .library-hero {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: clamp(24px,4vw,44px);
    padding: clamp(1.8rem,5vw,3.5rem);
    margin-bottom: clamp(1.4rem,3vw,2.4rem);
    background:
      linear-gradient(145deg, rgba(255,255,255,.085) 0%, rgba(255,255,255,.022) 60%),
      radial-gradient(ellipse 80% 100% at 92% 0%, rgba(201,168,76,.2) 0%, transparent 45%),
      radial-gradient(ellipse 50% 60% at 0% 100%, rgba(96,165,250,.1) 0%, transparent 40%),
      rgba(7,10,18,.75);
    box-shadow:
      0 40px 120px rgba(0,0,0,.45),
      0 0 0 1px rgba(255,255,255,.05),
      inset 0 1px 0 rgba(255,255,255,.1),
      inset 0 -1px 0 rgba(0,0,0,.3);
    backdrop-filter: blur(20px);
  }
  .library-hero::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(130deg,
      rgba(201,168,76,.45) 0%,
      rgba(255,255,255,.08) 30%,
      transparent 55%,
      rgba(244,114,182,.22) 100%
    );
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: .55;
  }
  .library-hero::after {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(201,168,76,.6) 30%, rgba(255,255,255,.35) 50%, rgba(201,168,76,.6) 70%, transparent 100%);
    border-radius: 999px;
    pointer-events: none;
  }
  .library-hero-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(280px, .6fr);
    gap: clamp(1.5rem, 4vw, 3.5rem);
    align-items: center;
  }
  .library-hero-copy { align-self: center; }
  .lh-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--gold);
    font-family: var(--f);
    font-size: .76rem;
    letter-spacing: .2em;
    text-transform: uppercase;
    margin-bottom: 1rem;
    padding: 5px 14px;
    border-radius: 999px;
    background: rgba(201,168,76,.1);
    border: 1px solid rgba(201,168,76,.22);
  }
  .lh-title {
    max-width: 860px;
    margin: 0 0 1.1rem;
    font-family: var(--f);
    font-size: clamp(2.2rem, 6.5vw, 5.2rem);
    line-height: 1.06;
    color: var(--t0);
    text-wrap: balance;
    letter-spacing: -.035em;
    text-shadow:
      0 0 80px rgba(201,168,76,.18),
      0 24px 70px rgba(0,0,0,.6);
    font-weight: 600;
  }
  .lh-title-accent {
    background: linear-gradient(135deg, var(--gold3) 0%, var(--gold) 50%, var(--gold2) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .lh-copy {
    max-width: 680px;
    margin: 0 0 1.6rem;
    color: var(--t2);
    font-family: var(--f);
    font-size: clamp(.95rem, 2vw, 1.18rem);
    line-height: 2;
  }
  .lh-stats {
    display: flex;
    gap: clamp(.6rem, 2vw, 1.2rem);
    flex-wrap: wrap;
  }
  .lh-stat {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px;
    border-radius: 12px;
    background: rgba(255,255,255,.04);
    border: 1px solid var(--bdr2);
    font-family: var(--f);
    font-size: .76rem;
    color: var(--t2);
    backdrop-filter: blur(8px);
  }
  .lh-stat-num {
    color: var(--gold);
    font-weight: 600;
    font-size: .9rem;
  }

  /* ── BOOK SHOWCASE ── */
  .library-showcase {
    position: relative;
    min-height: 380px;
    border-radius: 32px;
    border: 1px solid rgba(255,255,255,.08);
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,200,122,.22) 0%, transparent 50%),
      linear-gradient(180deg, rgba(255,255,255,.065) 0%, rgba(255,255,255,.018) 100%);
    overflow: hidden;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.09),
      0 28px 80px rgba(0,0,0,.3);
  }
  .library-showcase::after {
    content: "";
    position: absolute;
    left: 10%; right: 10%; bottom: 20px;
    height: 24px;
    border-radius: 999px;
    background: rgba(201,168,76,.25);
    filter: blur(22px);
    pointer-events: none;
  }
  .hero-book-stack {
    position: absolute;
    inset: 36px 20px 36px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 14px;
    perspective: 1000px;
  }
  .hero-book {
    width: clamp(72px, 8.5vw, 108px);
    aspect-ratio: 3 / 4;
    border-radius: 14px;
    object-fit: cover;
    box-shadow:
      0 30px 60px rgba(0,0,0,.55),
      -10px 0 20px rgba(0,0,0,.2),
      inset 0 0 0 1px rgba(255,255,255,.14);
    transform: rotate(var(--rot, 0deg)) translateY(var(--lift, 0px));
    transition: transform .38s var(--r), box-shadow .38s;
  }
  .library-showcase:hover .hero-book {
    transform: rotate(var(--rot, 0deg)) translateY(calc(var(--lift, 0px) - 10px));
    box-shadow: 0 40px 80px rgba(0,0,0,.65), -10px 0 20px rgba(0,0,0,.2), inset 0 0 0 1px rgba(255,255,255,.18);
  }
  .hero-book:nth-child(1) { --rot: -12deg; --lift: 18px; }
  .hero-book:nth-child(2) { --rot: -2deg; --lift: -8px; width: clamp(84px, 10vw, 126px); }
  .hero-book:nth-child(3) { --rot: 9deg; --lift: 22px; }

  /* ══════════════════════════════════════════════════
     BOOKS SECTION — EBOOK STAGE
  ══════════════════════════════════════════════════ */
  .ebook-stage {
    position: relative;
    margin-bottom: clamp(1.8rem,4vw,3.2rem);
    border-radius: clamp(24px,4vw,40px);
    border: 1px solid rgba(255,255,255,.07);
    background:
      linear-gradient(180deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,.016) 100%),
      rgba(7,10,18,.72);
    box-shadow:
      0 32px 100px rgba(0,0,0,.32),
      inset 0 1px 0 rgba(255,255,255,.07);
    backdrop-filter: blur(18px);
    overflow: hidden;
    padding: clamp(1.2rem,3vw,2.2rem);
  }
  .ebook-stage::before {
    content: "";
    position: absolute;
    top: 0; left: 8%; right: 8%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(201,168,76,.5), rgba(255,255,255,.25), rgba(201,168,76,.5), transparent);
    pointer-events: none;
  }
  .ebook-stage-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: clamp(1rem,3vw,2rem);
    margin-bottom: clamp(1.2rem,3vw,1.8rem);
  }
  .ebook-stage-head h2 {
    margin: 0;
    color: var(--t0);
    font-family: var(--f);
    font-size: clamp(1.5rem,3.5vw,2.6rem);
    line-height: 1.22;
    font-weight: 600;
    letter-spacing: -.025em;
  }
  .ebook-stage-head p {
    max-width: 650px;
    margin: .55rem 0 0;
    color: var(--t2);
    font-family: var(--f);
    line-height: 1.9;
    font-size: .92rem;
  }
  .wc-kicker {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--gold);
    font-family: var(--f);
    font-size: .74rem;
    letter-spacing: .18em;
    text-transform: uppercase;
    margin-bottom: .75rem;
    padding: 4px 12px;
    border-radius: 999px;
    background: rgba(201,168,76,.09);
    border: 1px solid rgba(201,168,76,.2);
  }

  /* ── BOOK SHELF LAYOUT ── */
  .book-shelf {
    display: grid;
    grid-template-columns: minmax(260px, .85fr) minmax(0, 1.4fr);
    gap: clamp(1rem, 2.4vw, 1.6rem);
    align-items: stretch;
  }

  /* ── FEATURED BOOK ── */
  .featured-book {
    --book-accent: var(--gold);
    position: relative;
    overflow: hidden;
    min-height: 100%;
    border-radius: 30px;
    border: 1px solid color-mix(in srgb, var(--book-accent) 38%, rgba(255,255,255,.09));
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--book-accent) 22%, transparent) 0%, transparent 55%),
      linear-gradient(180deg, rgba(255,255,255,.08) 0%, rgba(255,255,255,.02) 100%),
      #080C18;
    box-shadow:
      0 32px 90px rgba(0,0,0,.48),
      inset 0 1px 0 rgba(255,255,255,.08),
      0 0 0 1px rgba(255,255,255,.03);
    cursor: pointer;
    transition: transform .32s var(--r), box-shadow .32s, border-color .32s;
  }
  .featured-book::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(160deg,
      color-mix(in srgb, var(--book-accent) 55%, transparent) 0%,
      rgba(255,255,255,.1) 40%,
      transparent 65%
    );
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: .6;
    transition: opacity .32s;
  }
  .featured-book:hover {
    transform: translateY(-6px) scale(1.008);
    box-shadow:
      0 44px 120px rgba(0,0,0,.58),
      0 0 60px color-mix(in srgb, var(--book-accent) 20%, transparent),
      inset 0 1px 0 rgba(255,255,255,.1);
  }
  .featured-book:hover::before { opacity: .85; }
  .featured-book-inner {
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: clamp(1.2rem, 3vw, 1.8rem);
    text-align: center;
  }
  .featured-cover {
    width: min(200px, 60vw);
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: 18px;
    box-shadow:
      0 32px 70px rgba(0,0,0,.58),
      -12px 0 24px rgba(0,0,0,.25),
      inset 0 0 0 1px rgba(255,255,255,.12);
    transform: rotateY(-10deg) rotateZ(-1.5deg);
    transition: transform .32s var(--r), box-shadow .32s;
  }
  .featured-book:hover .featured-cover {
    transform: rotateY(-2deg) translateY(-8px) scale(1.02);
    box-shadow: 0 44px 90px rgba(0,0,0,.65), -12px 0 24px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.16);
  }
  .featured-book h3 {
    margin: .4rem 0 .4rem;
    color: var(--t0);
    font-family: var(--f);
    font-size: clamp(1.1rem, 2.5vw, 1.6rem);
    line-height: 1.42;
    font-weight: 600;
    letter-spacing: -.02em;
  }
  .featured-book-meta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--t3);
    font-family: var(--f);
    font-size: .74rem;
  }
  .featured-book-actions {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 10px;
    position: relative;
    z-index: 2;
  }
  .featured-book-actions > * {
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.09);
    font-family: var(--f);
    font-size: .82rem;
    text-decoration: none;
    cursor: pointer;
    transition: all .24s var(--r);
    font-weight: 500;
  }
  .featured-book-actions > *:hover {
    transform: translateY(-2px);
    filter: brightness(1.12);
    box-shadow: 0 8px 28px rgba(0,0,0,.3);
  }

  /* ── EBOOK ROW ── */
  .ebook-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(.9rem, 2vw, 1.3rem);
    perspective: 1400px;
  }

  /* ── EBOOK TILE ── */
  .ebook-tile {
    --book-accent: var(--gold);
    position: relative;
    overflow: hidden;
    min-height: 380px;
    display: flex;
    flex-direction: column;
    border-radius: 28px;
    border: 1px solid color-mix(in srgb, var(--book-accent) 28%, rgba(255,255,255,.08));
    background:
      linear-gradient(165deg, color-mix(in srgb, var(--book-accent) 15%, transparent) 0%, transparent 42%),
      linear-gradient(180deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,.018) 100%),
      #080C18;
    box-shadow: 0 24px 65px rgba(0,0,0,.38);
    cursor: pointer;
    transition: transform .3s var(--r), border-color .3s, box-shadow .3s;
  }
  .ebook-tile::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(155deg,
      color-mix(in srgb, var(--book-accent) 45%, transparent) 0%,
      transparent 45%
    );
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: .5;
    transition: opacity .3s;
  }
  .ebook-tile:hover {
    transform: translateY(-10px) scale(1.018);
    border-color: color-mix(in srgb, var(--book-accent) 56%, rgba(255,255,255,.14));
    box-shadow:
      0 40px 100px rgba(0,0,0,.52),
      0 0 50px color-mix(in srgb, var(--book-accent) 22%, transparent);
  }
  .ebook-tile:hover::before { opacity: .85; }
  .ebook-tile.featured::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.14), transparent);
    transform: translateX(-130%) skewX(-20deg);
    animation: ebookShine 5s ease-in-out infinite;
    pointer-events: none;
  }
  .ebook-glow {
    position: absolute;
    inset: auto 10% 46% 10%;
    height: 70px;
    background: color-mix(in srgb, var(--book-accent) 35%, transparent);
    filter: blur(34px);
    opacity: .7;
    pointer-events: none;
    z-index: 0;
    transition: opacity .3s;
  }
  .ebook-tile:hover .ebook-glow { opacity: 1; }
  .ebook-cover-wrap {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: center;
    padding: 1.1rem 1rem .7rem;
    min-height: 185px;
  }
  .ebook-cover {
    position: relative;
    z-index: 1;
    width: min(122px, 50vw);
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: 16px;
    box-shadow:
      0 24px 50px rgba(0,0,0,.55),
      -9px 0 20px rgba(0,0,0,.3),
      inset 0 0 0 1px rgba(255,255,255,.12);
    transform: rotateY(-12deg) rotateZ(-1.2deg);
    transition: transform .3s var(--r), box-shadow .3s;
  }
  .ebook-tile:hover .ebook-cover {
    transform: rotateY(-2deg) translateY(-5px) scale(1.03);
    box-shadow: 0 32px 65px rgba(0,0,0,.62), -9px 0 20px rgba(0,0,0,.3), inset 0 0 0 1px rgba(255,255,255,.16);
  }
  .ebook-badge {
    position: absolute;
    z-index: 2;
    top: 16px;
    left: 16px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    max-width: calc(100% - 32px);
    padding: 5px 11px;
    border-radius: 999px;
    color: var(--t0);
    background: rgba(4,6,12,.78);
    border: 1px solid color-mix(in srgb, var(--book-accent) 40%, rgba(255,255,255,.09));
    font-family: var(--f);
    font-size: .65rem;
    backdrop-filter: blur(12px);
    font-weight: 500;
  }
  .ebook-copy {
    position: relative;
    z-index: 1;
    padding: .3rem 1.2rem 1.3rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .ebook-genre {
    color: var(--book-accent);
    font-family: var(--f);
    font-size: .7rem;
    letter-spacing: .1em;
    text-transform: uppercase;
    font-weight: 500;
  }
  .ebook-copy h3 {
    margin: .5rem 0 .6rem;
    color: var(--t0);
    font-family: var(--f);
    font-size: 1.06rem;
    line-height: 1.45;
    font-weight: 600;
    letter-spacing: -.015em;
  }
  .ebook-copy p {
    margin: 0;
    color: var(--t2);
    font-family: var(--f);
    font-size: .78rem;
    line-height: 1.8;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .ebook-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: .85rem;
    color: var(--t3);
    font-family: var(--f);
    font-size: .72rem;
  }
  .ebook-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 9px;
    margin-top: auto;
    padding-top: 1.1rem;
    position: relative;
    z-index: 2;
  }
  .ebook-actions > * {
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-radius: 13px;
    border: 1px solid rgba(255,255,255,.09);
    font-family: var(--f);
    font-size: .76rem;
    text-decoration: none;
    cursor: pointer;
    transition: all .22s var(--r);
    font-weight: 500;
  }
  .ebook-preview {
    background: rgba(255,255,255,.04);
    color: var(--t2);
    border-color: rgba(255,255,255,.08);
  }
  .ebook-read, .ebook-buy {
    background: color-mix(in srgb, var(--book-accent) 20%, transparent);
    color: var(--t0);
    border-color: color-mix(in srgb, var(--book-accent) 46%, rgba(255,255,255,.09));
  }
  .ebook-actions > *:hover {
    transform: translateY(-2px);
    filter: brightness(1.1);
    box-shadow: 0 6px 20px rgba(0,0,0,.28);
  }

  /* ══════════════════════════════════════════════════
     WRITING SECTION — CINEMA PANEL
  ══════════════════════════════════════════════════ */
  .writing-cinema {
    position: relative;
    margin-bottom: clamp(1.8rem,4vw,3rem);
    border-radius: clamp(24px,4vw,40px);
    border: 1px solid rgba(255,255,255,.07);
    background:
      linear-gradient(180deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,.015) 100%),
      rgba(7,10,18,.7);
    box-shadow:
      0 32px 100px rgba(0,0,0,.3),
      inset 0 1px 0 rgba(255,255,255,.07);
    backdrop-filter: blur(18px);
    overflow: hidden;
    padding: clamp(1.2rem,3vw,2.2rem);
  }
  .writing-cinema::before {
    content: "";
    position: absolute;
    top: 0; left: 8%; right: 8%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(96,165,250,.4), rgba(255,255,255,.2), rgba(96,165,250,.4), transparent);
    pointer-events: none;
  }
  .writing-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(1rem,3vw,2rem);
    margin-bottom: clamp(1rem,3vw,1.6rem);
  }
  .writing-head h2 {
    margin: 0;
    color: var(--t0);
    font-family: var(--f);
    font-size: clamp(1.5rem,3.5vw,2.6rem);
    line-height: 1.22;
    font-weight: 600;
    letter-spacing: -.025em;
  }
  .writing-head p {
    max-width: 650px;
    margin: .55rem 0 0;
    color: var(--t2);
    font-family: var(--f);
    line-height: 1.9;
    font-size: .92rem;
  }

  /* ── WRITING TOOLS BAR ── */
  .writing-tools {
    position: sticky;
    top: var(--site-nav-offset, 98px);
    z-index: 15;
    display: grid;
    grid-template-columns: minmax(200px, 340px) 1fr auto;
    gap: 10px;
    align-items: center;
    margin: 1.2rem 0;
    padding: 10px 12px;
    border-radius: 22px;
    border: 1px solid rgba(255,255,255,.08);
    background: rgba(6,8,14,.88);
    backdrop-filter: blur(22px) saturate(160%);
    box-shadow:
      0 18px 50px rgba(0,0,0,.32),
      inset 0 1px 0 rgba(255,255,255,.06);
    will-change: transform;
  }
  .wt-search { max-width: none; width: 100%; }
  .wt-cats { overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
  .wt-cats::-webkit-scrollbar { display: none; }
  .wt-view { flex-shrink: 0; }

  /* ── SEARCH BOX ── */
  .sf-s {
    display: flex;
    align-items: center;
    gap: 9px;
    background: rgba(255,255,255,.05);
    border: 1px solid var(--bdr2);
    border-radius: 13px;
    padding: 0 13px;
    height: 40px;
    min-width: 160px;
    max-width: 280px;
    transition: border-color .22s, background .22s, box-shadow .22s;
  }
  .sf-s:focus-within {
    border-color: rgba(201,168,76,.38);
    background: rgba(201,168,76,.04);
    box-shadow: 0 0 0 3px rgba(201,168,76,.1);
  }
  .sf-s input {
    background: none;
    border: none;
    outline: none;
    color: var(--t1);
    font-family: var(--f);
    font-size: .84rem;
    width: 100%;
    min-height: 40px;
  }
  .sf-s input::placeholder { color: var(--t3); }

  /* ── CATEGORY PILLS ── */
  .sf-cats {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }
  .sf-cat {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 13px;
    border-radius: 999px;
    border: 1px solid var(--bdr2);
    background: rgba(255,255,255,.04);
    color: var(--t2);
    font-family: var(--f);
    font-size: .76rem;
    cursor: pointer;
    transition: all .22s var(--r);
    white-space: nowrap;
    font-weight: 500;
  }
  .sf-cat:hover {
    border-color: var(--bdr3);
    color: var(--t1);
    background: rgba(255,255,255,.07);
    transform: translateY(-1px);
  }

  /* ── VIEW TOGGLE ── */
  .sf-vw {
    display: flex;
    gap: 3px;
    background: rgba(255,255,255,.04);
    border: 1px solid var(--bdr2);
    border-radius: 11px;
    padding: 4px;
  }
  .sf-vb {
    width: 30px; height: 30px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--t3);
    cursor: pointer;
    transition: all .2s var(--r);
  }
  .sf-vb.on {
    background: rgba(255,255,255,.1);
    color: var(--t0);
    box-shadow: 0 2px 8px rgba(0,0,0,.2);
  }
  .sf-vb:hover:not(.on) { color: var(--t2); background: rgba(255,255,255,.06); }

  /* ── RESULTS BAR ── */
  .rb2 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .8rem;
    margin-bottom: clamp(1.2rem,2.5vw,2rem);
    padding-bottom: .9rem;
    border-bottom: 1px solid var(--bdr);
  }
  .rb2-cinema { margin-top: .3rem; margin-bottom: 1.2rem; }
  .rb2-t {
    font-family: var(--f);
    font-size: .78rem;
    color: var(--t3);
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .rb2-clr {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid var(--bdr2);
    background: rgba(255,255,255,.04);
    color: var(--t3);
    font-family: var(--f);
    font-size: .73rem;
    cursor: pointer;
    transition: all .2s var(--r);
  }
  .rb2-clr:hover { color: var(--t1); border-color: var(--bdr3); background: rgba(255,255,255,.07); }

  /* ══════════════════════════════════════════════════
     WRITING CARDS
  ══════════════════════════════════════════════════ */
  .wg2 {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
    gap: clamp(12px,1.8vw,18px);
  }
  .wg2-l {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ── WRITING CARD ── */
  .wc2 {
    position: relative;
    background:
      linear-gradient(180deg, rgba(255,255,255,.042) 0%, rgba(255,255,255,.014) 100%),
      var(--bg2);
    border: 1px solid var(--bdr);
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    min-height: 225px;
    transition: transform .26s var(--r), box-shadow .26s, border-color .26s;
    animation: fadeUp .36s var(--r) both;
  }
  .wc2::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(145deg,
      color-mix(in srgb, var(--ca, var(--gold)) 38%, transparent) 0%,
      transparent 50%
    );
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity .28s;
  }
  .wc2:hover::before { opacity: 1; }
  .wc2:hover {
    transform: translateY(-5px);
    border-color: color-mix(in srgb, var(--ca, var(--gold)) 30%, rgba(255,255,255,.1));
    box-shadow:
      0 22px 55px rgba(0,0,0,.42),
      0 0 0 1px rgba(255,255,255,.05),
      0 0 30px color-mix(in srgb, var(--ca, var(--gold)) 12%, transparent);
  }
  .wc2-top {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--ca, var(--gold)), transparent);
    opacity: 0;
    transition: opacity .3s;
  }
  .wc2:hover .wc2-top { opacity: 1; }
  .wc2-glow {
    position: absolute;
    top: -50px; left: 50%;
    transform: translateX(-50%);
    width: 130px; height: 90px;
    border-radius: 50%;
    background: var(--cg, rgba(201,168,76,.14));
    filter: blur(32px);
    opacity: 0;
    transition: opacity .38s;
    pointer-events: none;
  }
  .wc2:hover .wc2-glow { opacity: 1; }
  .wc2-body {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: clamp(1.1rem,2.2vw,1.35rem);
  }
  .wc2-tags {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: .9rem;
    flex-wrap: wrap;
  }
  .wc2-cat {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 11px;
    border-radius: 999px;
    font-family: var(--f);
    font-size: .7rem;
    background: var(--cbg, rgba(201,168,76,.08));
    color: var(--ca, var(--gold));
    border: 1px solid var(--cbdr, rgba(201,168,76,.22));
    transition: all .22s;
    font-weight: 500;
  }
  .wc2:hover .wc2-cat {
    background: var(--cbg2, rgba(201,168,76,.15));
    box-shadow: 0 0 12px var(--cg, rgba(201,168,76,.18));
  }
  .wc2-star {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 9px;
    border-radius: 999px;
    font-family: var(--f);
    font-size: .64rem;
    background: rgba(251,191,36,.09);
    color: #FBBF24;
    border: 1px solid rgba(251,191,36,.2);
  }
  .wc2-title {
    font-family: var(--f);
    font-size: clamp(1rem,2.2vw,1.14rem);
    color: var(--t0);
    line-height: 1.58;
    margin-bottom: .75rem;
    font-weight: 600;
    letter-spacing: -.015em;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .wc2-preview {
    font-family: var(--f);
    font-size: .82rem;
    color: var(--t2);
    line-height: 1.82;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 1rem;
  }
  .wc2-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .65rem;
    margin-top: auto;
    padding-top: .9rem;
    border-top: 1px solid var(--bdr);
  }
  .wc2-date {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: var(--f);
    font-size: .7rem;
    color: var(--t3);
  }
  .wc2-read {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: var(--f);
    font-size: .76rem;
    font-weight: 600;
    transition: gap .2s;
    letter-spacing: .01em;
  }
  .wc2:hover .wc2-read { gap: 9px; }

  /* List mode card */
  .wc2-l {
    min-height: 0;
    border-radius: 16px;
  }
  .wc2-l .wc2-body {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    padding: .95rem 1.3rem;
  }
  .wc2-l .wc2-title {
    font-size: .94rem;
    margin-bottom: .3rem;
    -webkit-line-clamp: 1;
  }
  .wc2-l .wc2-preview { display: none; }
  .wc2-l .wc2-tags { margin-bottom: 0; }
  .wc2-l .wc2-foot { border: none; padding: 0; margin-left: auto; }

  /* Empty state */
  .wc2-em {
    text-align: center;
    padding: 5rem 2rem;
    color: var(--t3);
    font-family: var(--f);
  }

  /* Load more */
  .lm2 {
    margin: clamp(1.5rem,3vw,2.2rem) auto 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .7rem;
    font-family: var(--f);
    color: var(--t3);
  }
  .lm2-btn {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 12px 28px;
    border-radius: 999px;
    border: 1px solid rgba(201,168,76,.3);
    background: linear-gradient(135deg, rgba(201,168,76,.14), rgba(255,255,255,.04));
    color: var(--gold);
    font-family: var(--f);
    font-size: .84rem;
    cursor: pointer;
    transition: transform .24s var(--r), border-color .24s, background .24s, box-shadow .24s;
    font-weight: 500;
  }
  .lm2-btn:hover {
    transform: translateY(-3px);
    border-color: rgba(201,168,76,.5);
    background: linear-gradient(135deg, rgba(201,168,76,.2), rgba(255,255,255,.06));
    box-shadow: 0 10px 30px rgba(201,168,76,.18);
  }
  .lm2-note { font-size: .72rem; color: var(--t3); }

  /* ══════════════════════════════════════════════════
     READING MODAL — IMMERSIVE READER
  ══════════════════════════════════════════════════ */
  .rm2 {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(2,3,7,.82);
    backdrop-filter: blur(16px) saturate(140%);
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .rm2-box {
    width: 100%;
    max-width: 780px;
    max-height: 94vh;
    border-radius: 28px 28px 0 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow:
      0 -32px 100px rgba(0,0,0,.75),
      0 -1px 0 rgba(255,255,255,.06);
  }
  .rm2-hnd {
    width: 40px; height: 4px;
    border-radius: 999px;
    margin: 12px auto 0;
    flex-shrink: 0;
  }
  .rm2-prog {
    height: 2px;
    flex-shrink: 0;
    margin-top: 10px;
  }
  .rm2-pf {
    height: 100%;
    border-radius: 999px;
    transition: width .12s linear;
  }
  .rm2-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .85rem 1.5rem;
    border-bottom: 1px solid;
    flex-shrink: 0;
    gap: 10px;
    flex-wrap: wrap;
  }
  .rm2-hdl { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .rm2-ctrl { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
  .rm2-btn {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px;
    border-radius: 9px;
    border: 1px solid;
    background: none;
    cursor: pointer;
    transition: all .2s var(--r);
  }
  .rm2-btn:hover { opacity: .8; transform: scale(1.05); }
  .rm2-fc {
    display: flex;
    border-radius: 9px;
    border: 1px solid;
    overflow: hidden;
  }
  .rm2-fb {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px;
    background: none;
    border: none;
    cursor: pointer;
    transition: all .2s;
  }
  .rm2-fb:hover { opacity: .75; }
  .rm2-th {
    display: flex; align-items: center; gap: 5px;
    padding: 0 11px;
    height: 32px;
    border-radius: 9px;
    border: 1px solid;
    background: none;
    cursor: pointer;
    font-family: var(--f);
    font-size: .69rem;
    transition: all .2s;
    font-weight: 500;
  }
  .rm2-th:hover { opacity: .78; }
  .rm2-body {
    flex: 1;
    overflow-y: auto;
    padding: clamp(1.5rem,4vw,2.8rem) clamp(1.3rem,5vw,3.2rem);
    scroll-behavior: smooth;
  }
  .rm2-body::-webkit-scrollbar { width: 4px; }
  .rm2-body::-webkit-scrollbar-track { background: transparent; }
  .rm2-body::-webkit-scrollbar-thumb { background: rgba(201,168,76,.28); border-radius: 999px; }
  .rm2-ttl {
    font-family: var(--f);
    font-size: clamp(1.5rem,4.5vw,2.2rem);
    line-height: 1.42;
    margin-bottom: 1.8rem;
    font-weight: 600;
    letter-spacing: -.025em;
  }
  .rm2-txt {
    font-family: var(--f);
    line-height: 2.15;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .rm2-sig {
    margin-top: 2.8rem;
    padding-top: 1.6rem;
    border-top: 1px solid;
    font-family: var(--f);
    font-size: .84rem;
    opacity: .45;
    font-style: italic;
  }
  .rm2-nav {
    display: flex;
    border-top: 1px solid;
    flex-shrink: 0;
  }
  .rm2-nb {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 1.1rem 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
    transition: background .2s;
  }
  .rm2-nb:hover { background: rgba(255,255,255,.04); }
  .rm2-nb:disabled { opacity: .3; cursor: default; }
  .rm2-nb:disabled:hover { background: none; }
  .rm2-nb + .rm2-nb { border-left: 1px solid; }
  .rm2-nl {
    display: block;
    font-family: var(--f);
    font-size: .65rem;
    margin-bottom: 3px;
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  .rm2-nt {
    display: block;
    font-family: var(--f);
    font-size: .82rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 210px;
    font-weight: 500;
  }
  .rm2-sdd {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: #0C1020;
    border: 1px solid rgba(255,255,255,.11);
    border-radius: 14px;
    overflow: hidden;
    min-width: 185px;
    box-shadow: 0 16px 50px rgba(0,0,0,.55);
    z-index: 10;
  }
  .rm2-si {
    display: flex; align-items: center; gap: 10px;
    width: 100%;
    padding: 11px 15px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--f);
    font-size: .82rem;
    transition: background .15s;
  }
  .rm2-si:hover { background: rgba(255,255,255,.06); }

  /* ══════════════════════════════════════════════════
     SECTION DIVIDER
  ══════════════════════════════════════════════════ */
  .sd {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: clamp(1.2rem,2.5vw,1.8rem);
  }
  .sd-i {
    width: 34px; height: 34px;
    border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sd-l {
    font-family: var(--f);
    font-size: .73rem;
    letter-spacing: .12em;
    text-transform: uppercase;
    font-weight: 500;
  }
  .sd-ln {
    flex: 1;
    height: 1px;
  }

  /* ── BOOK MODAL ── */
  .bm2 {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(2,3,7,.85);
    backdrop-filter: blur(18px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  .bm2-box {
    width: 100%;
    max-width: 700px;
    max-height: 90vh;
    border-radius: 26px;
    background: #0A0E1C;
    border: 1px solid rgba(255,255,255,.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow:
      0 40px 110px rgba(0,0,0,.7),
      inset 0 1px 0 rgba(255,255,255,.07);
  }
  .bm2-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,.07);
    flex-shrink: 0;
  }
  .bm2-in {
    display: flex;
    gap: clamp(1.2rem,3vw,2.2rem);
    padding: clamp(1.3rem,3vw,2.2rem);
    overflow-y: auto;
    align-items: flex-start;
  }
  .bm2-in::-webkit-scrollbar { width: 4px; }
  .bm2-in::-webkit-scrollbar-thumb { background: rgba(201,168,76,.22); border-radius: 999px; }
  .bm2-cw { flex-shrink: 0; }
  .bm2-cv {
    width: clamp(115px,20vw,165px);
    height: auto;
    border-radius: 12px;
    box-shadow:
      0 16px 50px rgba(0,0,0,.55),
      inset 0 0 0 1px rgba(255,255,255,.1);
    display: block;
  }
  .bm2-cnt { flex: 1; min-width: 0; }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes glow {
    0%,100% { opacity: .4; }
    50%      { opacity: .85; }
  }
  @keyframes ebookShine {
    0%, 55% { transform: translateX(-130%) skewX(-20deg); opacity: 0; }
    62% { opacity: .65; }
    76%, 100% { transform: translateX(130%) skewX(-20deg); opacity: 0; }
  }
  @keyframes pulseGold {
    0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,.0); }
    50% { box-shadow: 0 0 0 6px rgba(201,168,76,.12); }
  }

  /* ── ACCESSIBILITY ── */
  .ebook-tile, .wc2, .sf-cat, .sf-vb, .lm2-btn, .ebook-preview, .ebook-read, .ebook-buy, .rb2-clr {
    outline: none;
  }
  .ebook-tile:focus-visible, .wc2:focus-visible, .sf-cat:focus-visible, .sf-vb:focus-visible,
  .lm2-btn:focus-visible, .ebook-preview:focus-visible, .ebook-read:focus-visible,
  .ebook-buy:focus-visible, .rb2-clr:focus-visible {
    box-shadow: 0 0 0 3px rgba(201,168,76,.32), 0 0 0 1px rgba(240,234,224,.14) inset;
  }

  /* ── SCROLLBAR ── */
  * { scrollbar-width: thin; scrollbar-color: rgba(201,168,76,.22) transparent; }

  /* ── SELECTION ── */
  ::selection { background: rgba(201,168,76,.25); color: var(--t0); }

  /* ══════════════════════════════════════════════════
     RESPONSIVE
  ══════════════════════════════════════════════════ */
  @media (max-width: 980px) {
    .library-hero-grid { grid-template-columns: 1fr; }
    .library-showcase { min-height: 320px; }
    .ebook-stage-head, .writing-head { flex-direction: column; }
    .book-shelf { grid-template-columns: 1fr; }
    .ebook-row {
      display: flex;
      overflow-x: auto;
      padding: 4px 4px 16px;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      gap: clamp(.9rem,2vw,1.3rem);
    }
    .ebook-row::-webkit-scrollbar { display: none; }
    .ebook-tile { min-width: min(74vw, 295px); scroll-snap-align: start; }
    .writing-tools { grid-template-columns: 1fr auto; }
    .wt-cats { grid-column: 1 / -1; }
  }
  @media (max-width: 768px) {
    .sf-s { max-width: 100%; flex: 1; }
    .sf-cats { display: none; }
    .wt-cats { display: flex; }
    .wg2 { grid-template-columns: 1fr; }
    .rb2 { align-items: flex-start; flex-direction: column; }
    .library-hero, .ebook-stage, .writing-cinema { border-radius: 24px; }
    .writing-tools { border-radius: 20px; }
    .bm2-in { flex-direction: column; }
    .bm2-cv { width: clamp(100px,35vw,145px); }
    .rm2-nt { max-width: 130px; }
  }
  @media (max-width: 480px) {
    .lh-title { font-size: clamp(1.65rem, 9.5vw, 2.4rem); line-height: 1.16; }
    .lh-copy { font-size: .88rem; line-height: 1.78; }
    .library-hero { padding: 1.1rem; margin-bottom: .9rem; }
    .library-hero-grid { gap: 1rem; }
    .library-showcase { min-height: 255px; border-radius: 24px; }
    .hero-book-stack { inset: 22px 14px; gap: 8px; }
    .hero-book { width: 68px; border-radius: 11px; }
    .hero-book:nth-child(2) { width: 82px; }
    .ebook-stage, .writing-cinema { padding: .9rem; margin-bottom: 1.1rem; }
    .ebook-stage-head h2, .writing-head h2 { font-size: 1.32rem; }
    .ebook-stage-head p, .writing-head p { font-size: .8rem; line-height: 1.68; }
    .featured-book-inner { padding: .95rem; }
    .featured-cover { width: min(142px, 50vw); }
    .featured-book-actions { grid-template-columns: 1fr; }
    .ebook-tile { min-width: 76vw; min-height: 345px; }
    .ebook-cover-wrap { min-height: 158px; padding: .9rem .8rem .5rem; }
    .ebook-cover { width: 108px; }
    .ebook-copy h3 { font-size: .98rem; }
    .writing-tools { grid-template-columns: 1fr; position: relative; top: auto; padding: 9px; margin: .5rem 0 1.5rem; }
    .wc2 { min-height: 185px; }
    .rm2-box { border-radius: 22px 22px 0 0; }
    .rm2-body { padding: 1.6rem 1.25rem; }
    .rm2-ttl { font-size: 1.55rem; margin-bottom: 1.3rem; }
    .rm2-txt { font-size: 1rem; line-height: 1.85; }
    .wc2-l .wc2-body { flex-direction: column; align-items: flex-start; gap: .75rem; }
    .wc2-l .wc2-foot { width: 100%; margin-left: 0; justify-content: space-between; }
    .wt-view { justify-self: end; }
    .lh-stats { gap: .5rem; }
    .lh-stat { padding: 5px 10px; font-size: .7rem; }
  }
`;

// ── Writing Card v9 ───────────────────────────────────────────────────────────
function WritingCard({ writing, index, onClick, viewMode = "grid" }: {
  writing: Writing; index: number; onClick: () => void; viewMode?: "grid"|"list";
}) {
  const c = getCatStyle(writing.category);
  const isL = viewMode === "list";
  const slug = makeSlug(writing.title, writing.id);

  const likeKey = `like_${writing.id}`;
  const [liked, setLiked] = useState(() => localStorage.getItem(likeKey) === "1");
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const next = !liked;
    setLiked(next);
    if (next) localStorage.setItem(likeKey, "1");
    else localStorage.removeItem(likeKey);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const shareUrl = window.location.origin + "/writings/" + slug;
    if (navigator.share) {
      navigator.share({
        title: writing.title,
        text: writing.content.substring(0, 100) + "...",
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
        alert("লিঙ্ক কপি করা হয়েছে!");
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("লিঙ্ক কপি করা হয়েছে!");
    }
  };

  return (
    <motion.div
      className={`wc2${isL?" wc2-l":""}`}
      style={{
        "--ca": c.accent,
        "--cg": c.glow,
        "--cbg": c.bg,
        "--cbg2": c.badge,
        "--cbdr": c.border,
        animationDelay: `${index * 0.04}s`,
        cursor: "pointer",
        textDecoration: "none",
        display: "block",
      } as React.CSSProperties}
      onClick={onClick}
      role="article"
      tabIndex={0}
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
                <span className="wc2-cat">
                  <span style={{ fontSize: ".74rem" }}>{c.icon}</span>{writing.category}
                </span>
                {writing.featured && (
                  <span className="wc2-star"><Star size={9} fill="currentColor"/> বিশেষ</span>
                )}
              </div>
              <div className="wc2-title">{writing.title}</div>
            </div>
            <div className="wc2-foot" style={{ border: "none", padding: 0 }}>
              <span className="wc2-date"><Calendar size={10}/>{writing.date}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
                <button onClick={handleLike} title="ভালো লেগেছে"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: ".84rem", opacity: liked ? 1 : 0.42, transition: "opacity .15s, transform .15s", transform: liked ? "scale(1.22)" : "scale(1)" }}>
                  {liked ? "❤️" : "🤍"}
                </button>
                <button onClick={handleShare} title="শেয়ার করুন"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: ".84rem", opacity: 0.42, transition: "opacity .15s" }}>
                  <Share2 size={11}/>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
                  className="wc2-read"
                  style={{ color: c.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}
                  aria-label={`${writing.title} পড়ুন`}
                >
                  পড়ুন <ArrowRight size={11}/>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="wc2-tags">
              <span className="wc2-cat">
                <span style={{ fontSize: ".74rem" }}>{c.icon}</span>{writing.category}
              </span>
              {writing.featured && (
                <span className="wc2-star"><Star size={9} fill="currentColor"/> বিশেষ</span>
              )}
            </div>
            <div className="wc2-title">{writing.title}</div>
            <div className="wc2-preview">{writing.content}</div>
            <div className="wc2-foot">
              <span className="wc2-date"><Calendar size={10}/>{writing.date}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={handleLike} title="ভালো লেগেছে"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: ".84rem", opacity: liked ? 1 : 0.42, transition: "opacity .15s, transform .15s", transform: liked ? "scale(1.22)" : "scale(1)" }}>
                  {liked ? "❤️" : "🤍"}
                </button>
                <button onClick={handleShare} title="শেয়ার করুন"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: ".84rem", opacity: 0.42, transition: "opacity .15s" }}>
                  <Share2 size={11}/>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
                  className="wc2-read"
                  style={{ color: c.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}
                  aria-label={`${writing.title} পড়ুন`}
                >
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

// ── Writing Modal v9 — Immersive Reader ───────────────────────────────────────
function WritingModal({ writing, allWritings, onClose, onNavigate }: {
  writing: Writing;
  allWritings: Writing[];
  onClose: () => void;
  onNavigate: (w: Writing) => void;
}) {
  const c = getCatStyle(writing.category);
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

  const relatedWritings = allWritings
    .filter(w => w.id !== writing.id && w.category === writing.category)
    .slice(0, 3);

  const T = {
    dark:  { bg: "#04060C", txt: "#F0EAE0", sub: "rgba(240,234,224,.48)", bdr: "rgba(255,255,255,.07)", hnd: "rgba(255,255,255,.12)", prog: c.accent },
    sepia: { bg: "#120E06", txt: "#D4C8A0", sub: "rgba(212,200,160,.48)", bdr: "rgba(212,200,160,.1)", hnd: "rgba(212,200,160,.2)", prog: "#C9A84C" },
    light: { bg: "#F6F3EE", txt: "#1A1612", sub: "rgba(26,22,18,.45)", bdr: "rgba(26,22,18,.1)", hnd: "rgba(26,22,18,.15)", prog: c.accent },
  }[theme];

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const fn = () => {
      const p = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setProgress(isNaN(p) ? 0 : Math.min(1, p) * 100);
    };
    el.addEventListener("scroll", fn);
    return () => el.removeEventListener("scroll", fn);
  }, [writing]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && prev) onNavigate(prev);
      if (e.key === "ArrowRight" && next) onNavigate(next);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [prev, next, onClose, onNavigate]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShowShare(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return createPortal(
    <motion.div
      className="rm2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: .28 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="rm2-box"
        style={{ background: T.bg }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 34, stiffness: 300 }}
      >
        <div className="rm2-hnd" style={{ background: T.hnd }}/>
        <div className="rm2-prog" style={{ background: "rgba(255,255,255,.05)" }}>
          <div className="rm2-pf" style={{ width: `${progress}%`, background: T.prog }}/>
        </div>
        <div className="rm2-hd" style={{ borderColor: T.bdr }}>
          <div className="rm2-hdl">
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 12px", borderRadius: 999,
              background: c.bg, color: c.accent, border: `1px solid ${c.border}`,
              fontFamily: "var(--f)", fontSize: ".7rem", fontWeight: 500,
            }}>
              <span style={{ fontSize: ".74rem" }}>{c.icon}</span>{writing.category}
            </span>
          </div>
          <div className="rm2-ctrl">
            <div className="rm2-fc" style={{ borderColor: T.bdr }}>
              <button className="rm2-fb" style={{ color: T.sub }} onClick={() => setFontSize(f => Math.max(.82, f - .1))}>
                <AArrowDown size={13}/>
              </button>
              <button className="rm2-fb" style={{ color: T.sub, borderLeft: `1px solid ${T.bdr}` }} onClick={() => setFontSize(f => Math.min(1.4, f + .1))}>
                <AArrowUp size={13}/>
              </button>
            </div>
            <button className="rm2-th" style={{ color: T.sub, borderColor: T.bdr }}
              onClick={() => setTheme(t => t === "dark" ? "sepia" : t === "sepia" ? "light" : "dark")}>
              {theme === "dark" ? <Moon size={12}/> : theme === "sepia" ? <Scroll size={12}/> : <Sun size={12}/>}
              <span style={{ fontSize: ".68rem" }}>{theme === "dark" ? "ডার্ক" : theme === "sepia" ? "সেপিয়া" : "লাইট"}</span>
            </button>
            <div style={{ position: "relative" }} ref={shareRef}>
              <button className="rm2-btn" style={{ color: T.sub, borderColor: T.bdr }} onClick={() => setShowShare(s => !s)}>
                <Share2 size={13}/>
              </button>
              {showShare && (
                <div className="rm2-sdd">
                  <button className="rm2-si" style={{ color: "#F0EAE0" }}
                    onClick={() => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(writingUrl)}`, "_blank"); setShowShare(false); }}>
                    <Facebook size={14} color="#1877F2"/> Facebook
                  </button>
                  <button className="rm2-si" style={{ color: "#F0EAE0" }}
                    onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(writing.title + ' — ' + writingUrl)}`, "_blank"); setShowShare(false); }}>
                    <span style={{ fontSize: 14 }}>💬</span> WhatsApp
                  </button>
                  <button className="rm2-si" style={{ color: "#F0EAE0" }}
                    onClick={() => {
                      navigator.clipboard.writeText(writingUrl)
                        .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
                        .catch(() => {
                          const el = document.createElement('textarea');
                          el.value = writingUrl;
                          document.body.appendChild(el);
                          el.select();
                          document.execCommand('copy');
                          document.body.removeChild(el);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        });
                      setShowShare(false);
                    }}>
                    {copied ? <Check size={14} color="#34D399"/> : <Copy size={14}/>}
                    {copied ? "কপি হয়েছে!" : "লিংক কপি"}
                  </button>
                </div>
              )}
            </div>
            <button className="rm2-btn" style={{ color: T.sub, borderColor: T.bdr }} onClick={onClose}>
              <X size={14}/>
            </button>
          </div>
        </div>
        <div className="rm2-body" ref={bodyRef}>
          <h1 className="rm2-ttl" style={{ color: T.txt }}>{writing.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.2rem", opacity: 0.52 }}>
            <span style={{ color: T.txt, fontSize: ".72rem", fontFamily: "var(--f)" }}>⏱ {readTimeLabel} পড়তে লাগবে</span>
            <span style={{ color: T.bdr }}>·</span>
            <span style={{ color: T.txt, fontSize: ".72rem", fontFamily: "var(--f)" }}>{writing.category}</span>
          </div>
          <div className="rm2-txt" style={{ color: T.txt, fontSize: `${fontSize}rem`, whiteSpace: 'pre-line' }}>
            {writing.content.split(/\n\n+/).map((para, i) => (
              para.trim() ? <p key={i} style={{ marginBottom: '1.6rem', lineHeight: '2.1' }}>{para.trim()}</p> : null
            ))}
          </div>
          <div className="rm2-sig" style={{ borderColor: T.bdr, color: T.txt }}>
            — মাহবুব সরদার সবুজ · {writing.date}
          </div>
          {relatedWritings.length > 0 && (
            <div style={{ marginTop: "2.2rem", paddingTop: "1.6rem", borderTop: `1px solid ${T.bdr}` }}>
              <p style={{ color: T.sub, fontSize: ".72rem", fontFamily: "var(--f)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: ".9rem", fontWeight: 500 }}>সম্পর্কিত লেখা</p>
              <div style={{ display: "flex", flexDirection: "column", gap: ".55rem" }}>
                {relatedWritings.map(rw => (
                  <button key={rw.id} onClick={() => onNavigate(rw)}
                    style={{ textAlign: "left", padding: ".7rem 1rem", borderRadius: 10, background: "rgba(255,255,255,.04)", border: `1px solid ${T.bdr}`, color: T.txt, cursor: "pointer", fontSize: ".84rem", fontFamily: "var(--f)", lineHeight: 1.45, transition: "background .15s, border-color .15s" }}
                    onMouseEnter={e => { (e.currentTarget.style.background = "rgba(255,255,255,.08)"); (e.currentTarget.style.borderColor = "rgba(255,255,255,.12)"); }}
                    onMouseLeave={e => { (e.currentTarget.style.background = "rgba(255,255,255,.04)"); (e.currentTarget.style.borderColor = T.bdr); }}>
                    {rw.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="rm2-nav" style={{ borderColor: T.bdr }}>
          <button className="rm2-nb" style={{ borderColor: T.bdr }} onClick={() => prev && onNavigate(prev)} disabled={!prev}>
            <ChevronLeft size={16} style={{ color: prev ? c.accent : T.sub, flexShrink: 0 }}/>
            <span>
              <span className="rm2-nl" style={{ color: T.sub }}>পূর্ববর্তী</span>
              <span className="rm2-nt" style={{ color: T.txt }}>{prev?.title ?? "—"}</span>
            </span>
          </button>
          <button className="rm2-nb" style={{ borderColor: T.bdr, justifyContent: "flex-end" }} onClick={() => next && onNavigate(next)} disabled={!next}>
            <span style={{ textAlign: "right" }}>
              <span className="rm2-nl" style={{ color: T.sub }}>পরবর্তী</span>
              <span className="rm2-nt" style={{ color: T.txt }}>{next?.title ?? "—"}</span>
            </span>
            <ChevronRight size={16} style={{ color: next ? c.accent : T.sub, flexShrink: 0 }}/>
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ── Book Modal v9 ─────────────────────────────────────────────────────────────
function BookModal({ book, onClose }: { book: typeof ebooks[0]; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return createPortal(
    <motion.div className="bm2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="bm2-box"
        initial={{ opacity: 0, scale: .92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .92, y: 24 }}
        transition={{ type: "spring", damping: 30, stiffness: 270 }}>
        <div className="bm2-hd">
          <span style={{ fontFamily: "var(--f)", fontSize: ".76rem", color: "rgba(240,234,224,.42)", display: "flex", alignItems: "center", gap: 6 }}>
            <BookOpen size={13} color={book.accentColor}/> {book.subtitle}
          </span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(240,234,224,.42)", transition: "all .18s" }}>
            <X size={14}/>
          </button>
        </div>
        <div className="bm2-in">
          <div className="bm2-cw">
            <img src={book.cover} alt={`${book.title} - ${book.genre} ই-বুক কভার - মাহবুব সরদার সবুজ`} className="bm2-cv" loading="lazy" decoding="async"
              onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='213' viewBox='0 0 160 213'%3E%3Crect fill='%230D1120'/%3E%3Ctext x='50%25' y='50%25' fill='%23C9A84C' font-size='14' text-anchor='middle' dominant-baseline='middle'%3E📖%3C/text%3E%3C/svg%3E"; }}/>
          </div>
          <div className="bm2-cnt">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 999, background: `${book.accentColor}14`, border: `1px solid ${book.accentColor}28`, marginBottom: "1rem" }}>
              <span style={{ fontFamily: "var(--f)", fontSize: ".64rem", color: book.accentColor, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500 }}>{book.badge}</span>
            </div>
            <h2 style={{ fontFamily: "var(--f)", fontSize: "1.22rem", color: "#F0EAE0", lineHeight: 1.45, marginBottom: ".65rem", fontWeight: 600, letterSpacing: "-.02em" }}>{book.title}</h2>
            <p style={{ fontFamily: "var(--f)", fontSize: ".84rem", color: "rgba(240,234,224,.52)", lineHeight: 1.95, marginBottom: "1.1rem" }}>{book.description}</p>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: "1.3rem" }}>
              {[book.genre, `${book.pages} পৃষ্ঠা`, book.year].map((t, i) => (
                <span key={i} style={{ padding: "4px 11px", borderRadius: 999, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", fontFamily: "var(--f)", fontSize: ".68rem", color: "rgba(240,234,224,.38)" }}>{t}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              {book.buyLink && (
                <a href={book.buyLink} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 999, background: `linear-gradient(135deg,${book.accentColor},${book.accentColor}CC)`, color: "#080A14", fontFamily: "var(--f)", fontSize: ".84rem", textDecoration: "none", transition: "all .26s", boxShadow: `0 8px 24px ${book.accentColor}30`, fontWeight: 600 }}>
                  <ShoppingCart size={13}/> কিনুন
                </a>
              )}
              {book.canRead && (
                <a href={`/ebooks/read/${book.slug}`} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 999, background: "transparent", color: book.accentColor, fontFamily: "var(--f)", fontSize: ".84rem", textDecoration: "none", border: `1.5px solid ${book.accentColor}38`, transition: "all .26s", fontWeight: 500 }}>
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

// ── Cinematic Literary Hero ───────────────────────────────────────────────────
function LiteraryHero({ totalWritings }: { totalWritings: number }) {
  const featuredBooks = ebooks.filter((book) => book.isFeatured).slice(0, 3);
  const heroBooks = featuredBooks.length >= 3 ? featuredBooks : ebooks.slice(0, 3);

  return (
    <section className="library-hero" aria-labelledby="literary-library-title">
      <div className="library-hero-grid">
        <div className="library-hero-copy">
          <div className="lh-kicker">
            <Feather size={13}/>
            সাহিত্য সংগ্রহ
          </div>
          <h1 id="literary-library-title" className="lh-title">
            লেখালেখি ও <span className="lh-title-accent">বই</span>
          </h1>
          <p className="lh-copy">
            মাহবুব সরদার সবুজের কবিতা, অনুভূতির লেখা এবং বইয়ের নির্বাচিত সংগ্রহ — পাঠকের জন্য সাজানো এক নান্দনিক সাহিত্যভুবন।
          </p>
          <div className="lh-stats">
            <div className="lh-stat">
              <span className="lh-stat-num">{totalWritings > 0 ? `${totalWritings}+` : "৩০০+"}</span>
              <span>লেখা</span>
            </div>
            <div className="lh-stat">
              <span className="lh-stat-num">{ebooks.length}</span>
              <span>বই ও ই-বুক</span>
            </div>
            <div className="lh-stat">
              <span className="lh-stat-num">৫</span>
              <span>ক্যাটাগরি</span>
            </div>
          </div>
        </div>
        <div className="library-showcase" aria-label="নির্বাচিত বইয়ের প্রদর্শনী">
          <div className="hero-book-stack" aria-hidden="true">
            {heroBooks.map((book) => (
              <img key={book.id} src={book.cover} alt="" className="hero-book" loading="eager" decoding="async" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Book Tile ─────────────────────────────────────────────────────────────────
function BookTile({ book, index }: { book: typeof ebooks[0]; index: number }) {
  const [, setLocation] = useLocation();

  return (
    <motion.article
      key={book.id}
      className={`ebook-tile${book.isFeatured ? " featured" : ""}`}
      style={{ "--book-accent": book.accentColor } as React.CSSProperties}
      initial={{ opacity: 0, y: 28, rotateX: 6 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * .07, duration: .45, ease: [.25,.46,.45,.94] }}
      onClick={() => setLocation(`/ebooks/read/${book.slug}`)}
      role="article"
      tabIndex={0}
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
          <Link href={`/ebooks/read/${book.slug}`} onClick={(e) => e.stopPropagation()} className="ebook-preview" style={{ display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}><Eye size={12}/> দেখুন</Link>
          {book.canRead && (
            <Link href={`/ebooks/read/${book.slug}`} onClick={(e) => e.stopPropagation()} className="ebook-read">
              <BookOpen size={12}/> পড়ুন
            </Link>
          )}
          {book.buyLink && (
            <a href={book.buyLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ebook-buy">
              <ShoppingCart size={12}/> কিনুন
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ── Books Tab ─────────────────────────────────────────────────────────────────
function BooksTab() {
  const [, setLocation] = useLocation();
  const featured = ebooks[0];
  const remaining = ebooks.slice(1);

  return (
    <section className="ebook-stage" aria-labelledby="ebook-stage-title">
      <div className="ebook-stage-head">
        <div>
          <div className="wc-kicker"><Library size={13}/> বই ও ই-বুক</div>
          <h2 id="ebook-stage-title">প্রকাশনা সংগ্রহ</h2>
          <p>মাহবুব সরদার সবুজের প্রকাশিত বই ও ই-বুকের সম্পূর্ণ সংগ্রহ</p>
        </div>
      </div>

      <div className="book-shelf">
        <motion.article
          className="featured-book"
          style={{ "--book-accent": featured.accentColor } as React.CSSProperties}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .45, ease: [.25,.46,.45,.94] }}
          onClick={() => setLocation(`/ebooks/read/${featured.slug}`)}
          role="article"
          tabIndex={0}
          aria-label={`${featured.title} দেখুন`}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLocation(`/ebooks/read/${featured.slug}`); } }}
        >
          <div className="ebook-glow"/>
          <div className="featured-book-inner">
            <img src={featured.cover} alt={`${featured.title} - ${featured.genre} বই - মাহবুব সরদার সবুজ`} className="featured-cover" loading="eager" decoding="async" fetchPriority="high" />
            <div>
              <span className="ebook-badge" style={{ position: "static" }}><Crown size={10}/> {featured.badge}</span>
              <h3>{featured.title}</h3>
              <div className="featured-book-meta"><Calendar size={11}/>{featured.year} · {featured.pages} পৃষ্ঠা · {featured.genre}</div>
            </div>
            <div className="featured-book-actions">
              <Link href={`/ebooks/read/${featured.slug}`} onClick={(e) => e.stopPropagation()}
                className="ebook-read"
                style={{ background: `linear-gradient(135deg, ${featured.accentColor}28, ${featured.accentColor}14)`, borderColor: `${featured.accentColor}45`, color: "#F0EAE0" }}>
                <BookOpen size={13}/> পড়ুন
              </Link>
              {featured.buyLink && (
                <a href={featured.buyLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="ebook-buy"
                  style={{ background: `linear-gradient(135deg, ${featured.accentColor}, ${featured.accentColor}CC)`, borderColor: "transparent", color: "#080A14", fontWeight: 600 }}>
                  <ShoppingCart size={13}/> কিনুন
                </a>
              )}
            </div>
          </div>
        </motion.article>

        <div className="ebook-row">
          {remaining.map((book, i) => <BookTile key={book.id} book={book} index={i + 1} />)}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE v9 — Ultra Cinematic Literary Universe
// ══════════════════════════════════════════════════════════════════════════════
export default function Writings() {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Writing|null>(null);
  const [viewMode, setViewMode] = useState<"grid"|"list">("grid");
  const [visibleCount, setVisibleCount] = useState(WRITINGS_PAGE_SIZE);
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/writings/:slug");
  const [archive, setArchive] = useState<Writing[]>([]);
  const [archiveReady, setArchiveReady] = useState(false);
  const deferredQuery = useDeferredValue(q);

  useEffect(() => {
    let mounted = true;
    import("@/data/writingsArchive")
      .then(({ writings }) => {
        if (mounted) {
          setArchive(writings);
          setArchiveReady(true);
        }
      })
      .catch(() => {
        if (mounted) setArchiveReady(true);
      });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = archive;
    if (cat !== "all") list = list.filter(w => w.category === cat);
    if (deferredQuery.trim()) {
      const qn = deferredQuery.trim().toLowerCase();
      list = list.filter(w => w.title.toLowerCase().includes(qn) || w.content.toLowerCase().includes(qn));
    }
    return list;
  }, [archive, cat, deferredQuery]);

  useEffect(() => {
    setVisibleCount(WRITINGS_PAGE_SIZE);
  }, [cat, deferredQuery]);

  const visibleWritings = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMoreWritings = visibleCount < filtered.length;

  useEffect(() => {
    if (match && params?.slug && archiveReady) {
      const w = archive.find(wr => matchesWritingSlug(wr, params.slug));
      if (w) {
        setSel(w);
      } else {
        setSel(null);
        setLocation('/writings', { replace: true });
      }
    }
  }, [archive, match, params?.slug, archiveReady, setLocation]);

  const handleCardClick = useCallback((w: Writing) => {
    setSel(w);
    setLocation(`/writings/${makeSlug(w.title, w.id)}`);
  }, [setLocation]);

  const handleModalClose = useCallback(() => {
    setSel(null);
    setLocation("/writings");
  }, [setLocation]);

  const handleNavigate = useCallback((w: Writing) => {
    setSel(w);
    setLocation(`/writings/${makeSlug(w.title, w.id)}`);
  }, [setLocation]);

  const seoPath = sel ? `/writings/${makeSlug(sel.title, sel.id)}` : "/writings";
  const seoTitle = sel
    ? `${sel.title} — মাহবুব সরদার সবুজ`
    : "লেখালেখি ও বই — মাহবুব সরদার সবুজ";
  const seoDescription = sel
    ? makeExcerpt(sel.content)
    : "মাহবুব সরদার সবুজের প্রকাশিত ই-বুক, বই এবং সকল লেখা একসাথে একটি প্রিমিয়াম সাহিত্য সংগ্রহে।";

  const writingsJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": siteUrl("/writings#collection"),
        "name": "লেখালেখি ও বই — মাহবুব সরদার সবুজ",
        "url": siteUrl("/writings"),
        "inLanguage": "bn-BD",
        "description": "মাহবুব সরদার সবুজের বই, ই-বুক, কবিতা, ভালোবাসা, বিচ্ছেদ ও জীবনদর্শনের লেখাগুলোর curated সংগ্রহ।",
        "isPartOf": { "@type": "WebSite", "@id": siteUrl("/#website"), "name": "মাহবুব সরদার সবুজ" },
        "about": { "@id": siteUrl("/about#author") },
      },
      {
        "@type": "Person",
        "@id": siteUrl("/about#author"),
        "name": "মাহবুব সরদার সবুজ",
        "alternateName": "Mahbub Sardar Sabuj",
        "url": siteUrl("/about"),
        "knowsLanguage": ["bn-BD", "en"],
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "হোম", "item": siteUrl("/") },
          { "@type": "ListItem", "position": 2, "name": "লেখালেখি ও বই", "item": siteUrl("/writings") },
          ...(sel ? [{ "@type": "ListItem", "position": 3, "name": sel.title, "item": siteUrl(seoPath) }] : []),
        ],
      },
      {
        "@type": "ItemList",
        "@id": siteUrl("/writings#latest-writings"),
        "name": "নির্বাচিত অনুভূতির আর্কাইভ",
        "itemListElement": archive.slice(0, 24).map((writing, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": siteUrl(`/writings/${makeSlug(writing.title, writing.id)}`),
          "name": writing.title,
        })),
      },
      ...ebooks.map((book) => ({
        "@type": "Book",
        "@id": siteUrl(`/ebooks/read/${book.slug}#book`),
        "name": book.title,
        "inLanguage": "bn-BD",
        "author": { "@id": siteUrl("/about#author") },
        "url": siteUrl(`/ebooks/read/${book.slug}`),
        "image": siteUrl(book.cover),
        "description": book.description,
        "genre": book.genre,
        "bookFormat": book.badge.includes("ফিজিক্যাল") ? "https://schema.org/Hardcover" : "https://schema.org/EBook",
        "isAccessibleForFree": !book.buyLink,
      })),
      ...(sel ? [{
        "@type": "CreativeWork",
        "@id": siteUrl(`${seoPath}#writing`),
        "name": sel.title,
        "headline": sel.title,
        "url": siteUrl(seoPath),
        "inLanguage": "bn-BD",
        "text": makeExcerpt(sel.content, 500),
        "description": makeExcerpt(sel.content),
        "datePublished": sel.date,
        "genre": sel.category,
        "author": { "@id": siteUrl("/about#author") },
        "isAccessibleForFree": true,
      }] : []),
    ],
  }), [archive, sel, seoPath]);

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={seoPath}
        keywords="মাহবুব সরদার সবুজ লেখা, বাংলা কবিতা, বাংলা ই-বুক, বাংলা বই, ভালোবাসার লেখা, বিচ্ছেদের লেখা, জীবনদর্শন, Mahbub Sardar Sabuj writings, bangla kobita, bangla poem collection, বাংলা কবিতা পড়ুন, বাংলা সাহিত্য, বাংলাদেশি কবির লেখা"
        jsonLd={writingsJsonLd}
      />
      <Navbar/>
      <style>{CSS}</style>

      <div className="wp wp-cinema">
        <div className="cinema-aurora" aria-hidden="true"/>
        <div className="mc mc-cinema">

          {/* ── Literary Hero Banner ── */}
          <LiteraryHero totalWritings={archive.length} />

          {/* ── Books & E-Books Section ── */}
          <BooksTab/>

          {/* ── Writings Archive Section ── */}
          <section className="writing-cinema" id="all-writings">
            <div className="writing-head">
              <div>
                <div className="wc-kicker"><Feather size={13}/> লেখালেখি</div>
                <h2>নির্বাচিত অনুভূতির আর্কাইভ</h2>
                <p>ভালোবাসা, বিচ্ছেদ, কবিতা ও জীবনদর্শনের সেরা লেখাগুলো</p>
              </div>
            </div>

            {/* ── Tools Bar ── */}
            <div className="writing-tools">
              <div className="sf-s wt-search">
                <Search size={13} color="rgba(240,234,224,.34)"/>
                <input
                  type="text"
                  placeholder="লেখা খুঁজুন…"
                  aria-label="লেখা খুঁজুন"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  disabled={!archiveReady}
                />
                {q && (
                  <button aria-label="সার্চ মুছে ফেলুন" onClick={() => setQ("")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(240,234,224,.35)", display: "flex", transition: "color .15s" }}>
                    <X size={12}/>
                  </button>
                )}
              </div>
              <div className="sf-cats wt-cats">
                {CATS.map(c2 => (
                  <motion.button
                    key={c2.id}
                    className="sf-cat"
                    style={cat === c2.id ? {
                      background: `${c2.color}10`,
                      color: c2.color,
                      borderColor: `${c2.color}28`,
                      boxShadow: `0 0 14px ${c2.glow}, 0 2px 8px rgba(0,0,0,.2)`,
                    } : {}}
                    onClick={() => setCat(c2.id)}
                    aria-pressed={cat === c2.id}
                    whileTap={{ scale: .93 }}
                  >
                    <span style={{ fontSize: ".76rem" }}>{c2.icon}</span>{c2.label}
                  </motion.button>
                ))}
              </div>
              <div className="sf-vw wt-view">
                <button className={`sf-vb${viewMode === "grid" ? " on" : ""}`} onClick={() => setViewMode("grid")} title="গ্রিড" aria-label="গ্রিড ভিউ" aria-pressed={viewMode === "grid"}><Grid3X3 size={13}/></button>
                <button className={`sf-vb${viewMode === "list" ? " on" : ""}`} onClick={() => setViewMode("list")} title="লিস্ট" aria-label="লিস্ট ভিউ" aria-pressed={viewMode === "list"}><List size={13}/></button>
              </div>
            </div>

            {/* ── Active Filter Bar ── */}
            {(cat !== "all" || q) && (
              <div className="rb2 rb2-cinema">
                <div className="rb2-t">
                  {cat !== "all" && <span style={{ color: CATS.find(c2 => c2.id === cat)?.color }}>{CATS.find(c2 => c2.id === cat)?.label}</span>}
                  {cat !== "all" && deferredQuery && <span>·</span>}
                  {deferredQuery && <span>"{deferredQuery}"</span>}
                  {filtered.length > 0 && <span style={{ color: "rgba(240,234,224,.22)" }}>— {filtered.length}টি লেখা</span>}
                </div>
                <button className="rb2-clr" aria-label="সব ফিল্টার সরান" onClick={() => { setCat("all"); setQ(""); }}>
                  <X size={10}/> সরান
                </button>
              </div>
            )}

            {/* ── Writing Cards ── */}
            {!archiveReady ? (
              <div className="wc2-em" aria-live="polite">
                <motion.div
                  animate={{ opacity: [.3, .7, .3] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                >
                  <Feather size={28} color="rgba(201,168,76,.25)" style={{ margin: "0 auto .9rem", display: "block" }}/>
                </motion.div>
                <div style={{ fontSize: ".96rem", color: "rgba(240,234,224,.3)", fontFamily: "var(--f)" }}>লেখাগুলো প্রস্তুত হচ্ছে…</div>
              </div>
            ) : filtered.length > 0 ? (
              <>
                <div className={viewMode === "grid" ? "wg2" : "wg2-l"}>
                  {visibleWritings.map((w, i) => (
                    <WritingCard
                      key={w.id}
                      writing={w}
                      index={i}
                      onClick={() => handleCardClick(w)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
                {hasMoreWritings && (
                  <div className="lm2">
                    <motion.button
                      className="lm2-btn"
                      aria-label="আরও লেখা দেখুন"
                      onClick={() => setVisibleCount((n) => Math.min(n + WRITINGS_PAGE_SIZE, filtered.length))}
                      whileTap={{ scale: .96 }}
                    >
                      <ChevronDown size={15}/> আরও লেখা দেখুন
                    </motion.button>
                    <span className="lm2-note">{visibleCount} / {filtered.length} লেখা দেখানো হচ্ছে</span>
                  </div>
                )}
              </>
            ) : (
              <div className="wc2-em">
                <Search size={28} color="rgba(240,234,224,.12)" style={{ margin: "0 auto .9rem", display: "block" }}/>
                <div style={{ fontSize: ".96rem", color: "rgba(240,234,224,.3)", fontFamily: "var(--f)" }}>কোনো লেখা পাওয়া যায়নি</div>
                <button onClick={() => { setCat("all"); setQ(""); }}
                  style={{ marginTop: "1rem", padding: "8px 18px", borderRadius: 999, border: "1px solid rgba(201,168,76,.25)", background: "rgba(201,168,76,.08)", color: "#C9A84C", fontFamily: "var(--f)", fontSize: ".8rem", cursor: "pointer" }}>
                  সব লেখা দেখুন
                </button>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* AdSense Ad */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <AdSenseAd adSlot="" adFormat="auto" fullWidthResponsive={true} />
      </div>
      <Footer/>

      <AnimatePresence>
        {sel && (
          <WritingModal
            writing={sel}
            allWritings={filtered.length > 0 ? filtered : archive}
            onClose={handleModalClose}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>
    </>
  );
}
