/**
 * Writings & E-Books Page — লেখালেখি ও বই
 * Design: CINEMATIC LITERARY UNIVERSE v5 — International Premium Standard
 * Palette: Obsidian #080C14 | Ink #0D1420 | Gold #C9A84C | Amber #E8B84B | Cream #F0EAE0
 * Typography: SolaimanLipi | Spacing: Fluid | Motion: Spring Physics
 * Features: Parallax Hero | Masonry Grid | Immersive Reader | 3D Book Shelf
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { SITE_URL } from "@/components/Seo";
import AdSenseAd from "@/components/AdSenseAd";
import type { Writing } from "@/data/writingsArchive";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useState, useEffect, useRef, useCallback, useMemo, useDeferredValue } from "react";
import { Link, useRoute, useLocation } from "wouter";
import {
  Feather, ArrowLeft, BookOpen, Heart, Star, Calendar, X, Search, Share2, Copy,
  ChevronLeft, ChevronRight, Facebook, Check, AArrowUp, AArrowDown, PenLine,
  ShoppingCart, BookMarked, Eye, Sparkles, Quote, Library, TrendingUp, Award,
  Layers, Filter, SortAsc, Grid3X3, List, Bookmark, ExternalLink, ArrowRight,
  Pen, BookText, Flame, Crown, Zap, Moon, Sun, Scroll, Glasses, Hash,
  ChevronDown, Play, Pause, Volume2, BookCopy, GalleryVerticalEnd, Wand2,
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
function makeSlug(title: string, id: number): string {
  let slug = '';
  for (const ch of title) { slug += BENGALI_TRANS[ch] ?? ''; }
  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  return slug.length >= 3 ? slug : `writing-${id}`;
}

function makeExcerpt(text: string, maxLength = 170): string {
  const normalized = text.replace(/\s+/g, " " ).trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength).trim()}…` : normalized;
}

function siteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

// ── Category System ───────────────────────────────────────────────────────────
const CATS = [
  {id:"all",      label:"সব লেখা",    icon:"✦", color:"#C9A84C", glow:"rgba(201,168,76,.3)"},
  {id:"ছোট লেখা", label:"ছোট লেখা",  icon:"✎", color:"#34D399", glow:"rgba(52,211,153,.3)"},
  {id:"কবিতা",    label:"কবিতা",      icon:"❧", color:"#60A5FA", glow:"rgba(96,165,250,.3)"},
  {id:"ভালোবাসা", label:"ভালোবাসা",  icon:"♡", color:"#F472B6", glow:"rgba(244,114,182,.3)"},
  {id:"জীবনদর্শন",label:"জীবনদর্শন", icon:"◈", color:"#FBBF24", glow:"rgba(251,191,36,.3)"},
  {id:"বিচ্ছেদ",  label:"বিচ্ছেদ",   icon:"◌", color:"#A78BFA", glow:"rgba(167,139,250,.3)"},
];

function getCatStyle(cat: string) {
  const map: Record<string, {accent:string;glow:string;bg:string;badge:string;border:string;icon:string}> = {
    "ভালোবাসা": {accent:"#F472B6",glow:"rgba(244,114,182,.22)",bg:"rgba(244,114,182,.06)",badge:"rgba(244,114,182,.14)",border:"rgba(244,114,182,.28)",icon:"♡"},
    "বিচ্ছেদ":  {accent:"#A78BFA",glow:"rgba(167,139,250,.22)",bg:"rgba(167,139,250,.06)",badge:"rgba(167,139,250,.14)",border:"rgba(167,139,250,.28)",icon:"◌"},
    "কবিতা":    {accent:"#60A5FA",glow:"rgba(96,165,250,.22)", bg:"rgba(96,165,250,.06)", badge:"rgba(96,165,250,.14)", border:"rgba(96,165,250,.28)", icon:"❧"},
    "ছোট লেখা": {accent:"#34D399",glow:"rgba(52,211,153,.22)", bg:"rgba(52,211,153,.06)", badge:"rgba(52,211,153,.14)", border:"rgba(52,211,153,.28)", icon:"✎"},
    "জীবনদর্শন":{accent:"#FBBF24",glow:"rgba(251,191,36,.22)", bg:"rgba(251,191,36,.06)", badge:"rgba(251,191,36,.14)", border:"rgba(251,191,36,.28)", icon:"◈"},
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
//  WRITINGS v7 — PURE TAB PREMIUM
//  No hero. Just two immersive tabs.
//  Palette: Obsidian #06080E | Gold #C8A45A | Cream #EEEAE2
// ══════════════════════════════════════════════════════════════════════════════
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@300;400;500;600&display=swap');

  :root {
    --bg0: #06080E;
    --bg1: #090C14;
    --bg2: #0D1120;
    --bg3: #111828;
    --t0: #EEEAE2;
    --t1: rgba(238,234,226,.82);
    --t2: rgba(238,234,226,.52);
    --t3: rgba(238,234,226,.28);
    --t4: rgba(238,234,226,.14);
    --gold: #C8A45A;
    --gold2: #E8C87A;
    --bdr: rgba(255,255,255,.055);
    --bdr2: rgba(255,255,255,.09);
    --f: 'Noto Serif Bengali', 'SolaimanLipi', serif;
    --r: cubic-bezier(.25,.46,.45,.94);
  }

  /* ── PAGE WRAPPER ── */
  .wp {
    background: var(--bg0);
    min-height: 100vh;
    padding-top: var(--site-nav-offset, 98px);
  }

  /* ── TAB HEADER ── */
  .th {
    position: sticky;
    top: var(--site-nav-offset, 98px);
    z-index: 20;
    background: rgba(6,8,14,.92);
    backdrop-filter: blur(22px) saturate(160%);
    -webkit-backdrop-filter: blur(22px) saturate(160%);
    border-bottom: 1px solid var(--bdr);
  }
  .th-in {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 clamp(1rem,4vw,2.5rem);
    display: flex;
    align-items: center;
    gap: clamp(.5rem,2vw,1.5rem);
    min-height: 58px;
  }
  .th-tabs {
    display: flex;
    gap: 4px;
    background: rgba(255,255,255,.03);
    border: 1px solid var(--bdr);
    border-radius: 14px;
    padding: 4px;
  }
  .th-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 20px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: var(--t2);
    font-family: var(--f);
    font-size: .88rem;
    cursor: pointer;
    transition: all .22s var(--r);
    white-space: nowrap;
    position: relative;
  }
  .th-tab:hover { color: var(--t1); background: rgba(255,255,255,.04); }
  .th-tab.tg {
    background: linear-gradient(135deg,rgba(200,164,90,.18),rgba(200,164,90,.08));
    color: var(--gold);
    border: 1px solid rgba(200,164,90,.22);
    box-shadow: 0 0 18px rgba(200,164,90,.12);
  }
  .th-tab.tb {
    background: linear-gradient(135deg,rgba(99,179,237,.16),rgba(99,179,237,.07));
    color: #63B3ED;
    border: 1px solid rgba(99,179,237,.2);
    box-shadow: 0 0 18px rgba(99,179,237,.1);
  }
  .th-cnt {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 18px;
    padding: 0 6px;
    border-radius: 999px;
    font-size: .65rem;
    font-family: var(--f);
    background: rgba(255,255,255,.07);
    color: var(--t3);
    transition: all .22s;
  }
  .th-tab.tg .th-cnt { background: rgba(200,164,90,.18); color: var(--gold); }
  .th-tab.tb .th-cnt { background: rgba(99,179,237,.18); color: #63B3ED; }

  /* ── SEARCH & FILTER BAR ── */
  .sf {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .sf-s {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,.04);
    border: 1px solid var(--bdr);
    border-radius: 10px;
    padding: 0 12px;
    height: 36px;
    min-width: 160px;
    max-width: 220px;
    transition: border-color .2s;
  }
  .sf-s:focus-within { border-color: rgba(200,164,90,.3); }
  .sf-s input {
    background: none;
    border: none;
    outline: none;
    color: var(--t1);
    font-family: var(--f);
    font-size: .82rem;
    width: 100%;
  }
  .sf-s input::placeholder { color: var(--t3); }
  .sf-cats {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }
  .sf-cat {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid var(--bdr);
    background: rgba(255,255,255,.03);
    color: var(--t2);
    font-family: var(--f);
    font-size: .75rem;
    cursor: pointer;
    transition: all .2s var(--r);
    white-space: nowrap;
  }
  .sf-cat:hover { border-color: var(--bdr2); color: var(--t1); }
  .sf-vw {
    display: flex;
    gap: 3px;
    background: rgba(255,255,255,.03);
    border: 1px solid var(--bdr);
    border-radius: 8px;
    padding: 3px;
    margin-left: auto;
  }
  .sf-vb {
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--t3);
    cursor: pointer;
    transition: all .18s;
  }
  .sf-vb.on { background: rgba(255,255,255,.08); color: var(--t1); }

  /* ── MAIN CONTENT ── */
  .mc {
    max-width: 1200px;
    margin: 0 auto;
    padding: clamp(1.5rem,3vw,2.5rem) clamp(1rem,4vw,2.5rem);
  }

  /* ── RESULTS BAR ── */
  .rb2 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: clamp(1.2rem,2.5vw,2rem);
    padding-bottom: .9rem;
    border-bottom: 1px solid var(--bdr);
  }
  .rb2-t {
    font-family: var(--f);
    font-size: .78rem;
    color: var(--t3);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .rb2-n {
    color: var(--gold);
    font-size: .9rem;
  }
  .rb2-clr {
    display: flex; align-items: center; gap: 5px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--bdr);
    background: none;
    color: var(--t3);
    font-family: var(--f);
    font-size: .72rem;
    cursor: pointer;
    transition: all .18s;
  }
  .rb2-clr:hover { color: var(--t1); border-color: var(--bdr2); }
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
    gap: 8px;
    padding: 10px 22px;
    border-radius: 999px;
    border: 1px solid rgba(200,164,90,.28);
    background: linear-gradient(135deg, rgba(200,164,90,.12), rgba(255,255,255,.03));
    color: var(--gold);
    font-family: var(--f);
    font-size: .82rem;
    cursor: pointer;
    transition: transform .22s var(--r), border-color .22s, background .22s;
  }
  .lm2-btn:hover {
    transform: translateY(-2px);
    border-color: rgba(200,164,90,.45);
    background: linear-gradient(135deg, rgba(200,164,90,.18), rgba(255,255,255,.05));
  }
  .lm2-note { font-size: .72rem; color: var(--t3); }

  /* ── WRITING CARDS GRID ── */
  .wg2 {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: clamp(14px,2vw,20px);
  }
  .wg2-l {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ── WRITING CARD ── */
  .wc2 {
    position: relative;
    background: var(--bg2);
    border: 1px solid var(--bdr);
    border-radius: 18px;
    overflow: hidden;
    cursor: pointer;
    transition: transform .28s var(--r), box-shadow .28s var(--r), border-color .28s;
    animation: fadeUp .4s var(--r) both;
  }
  .wc2:hover {
    transform: translateY(-6px) scale(1.012);
    border-color: var(--bdr2);
    box-shadow: 0 18px 50px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.06);
  }
  .wc2-top {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--ca, var(--gold));
    opacity: 0;
    transition: opacity .28s;
  }
  .wc2:hover .wc2-top { opacity: 1; }
  .wc2-glow {
    position: absolute;
    top: -40px; left: 50%;
    transform: translateX(-50%);
    width: 120px; height: 80px;
    border-radius: 50%;
    background: var(--cg, rgba(200,164,90,.12));
    filter: blur(28px);
    opacity: 0;
    transition: opacity .35s;
    pointer-events: none;
  }
  .wc2:hover .wc2-glow { opacity: 1; }
  .wc2-body {
    padding: clamp(1rem,2.5vw,1.4rem);
  }
  .wc2-tags {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: .85rem;
    flex-wrap: wrap;
  }
  .wc2-cat {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 999px;
    font-family: var(--f);
    font-size: .68rem;
    background: var(--cbg, rgba(200,164,90,.08));
    color: var(--ca, var(--gold));
    border: 1px solid var(--cbdr, rgba(200,164,90,.2));
    transition: all .2s;
  }
  .wc2:hover .wc2-cat { background: var(--cbg2, rgba(200,164,90,.14)); }
  .wc2-star {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 999px;
    font-family: var(--f);
    font-size: .62rem;
    background: rgba(251,191,36,.08);
    color: #FBBF24;
    border: 1px solid rgba(251,191,36,.18);
  }
  .wc2-title {
    font-family: var(--f);
    font-size: clamp(1rem,2.2vw,1.12rem);
    color: var(--t0);
    line-height: 1.55;
    margin-bottom: .7rem;
    font-weight: 500;
    letter-spacing: -.01em;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .wc2-preview {
    font-family: var(--f);
    font-size: .82rem;
    color: var(--t2);
    line-height: 1.85;
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
    padding-top: .85rem;
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
    font-size: .75rem;
    font-weight: 500;
    transition: gap .2s;
  }
  .wc2:hover .wc2-read { gap: 8px; }

  /* List mode card */
  .wc2-l {
    border-radius: 14px;
    padding: 0;
  }
  .wc2-l .wc2-body {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    padding: .9rem 1.2rem;
  }
  .wc2-l .wc2-title {
    font-size: .92rem;
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

  /* ── READING MODAL ── */
  .rm2 {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(3,4,8,.75);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .rm2-box {
    width: 100%;
    max-width: 760px;
    max-height: 94vh;
    border-radius: 24px 24px 0 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 -24px 80px rgba(0,0,0,.7);
  }
  .rm2-hnd {
    width: 36px; height: 4px;
    border-radius: 999px;
    margin: 10px auto 0;
    flex-shrink: 0;
  }
  .rm2-prog {
    height: 2px;
    flex-shrink: 0;
    margin-top: 8px;
  }
  .rm2-pf {
    height: 100%;
    border-radius: 999px;
    transition: width .1s linear;
  }
  .rm2-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .8rem 1.4rem;
    border-bottom: 1px solid;
    flex-shrink: 0;
    gap: 10px;
    flex-wrap: wrap;
  }
  .rm2-hdl { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .rm2-ctrl { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .rm2-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px;
    border-radius: 8px;
    border: 1px solid;
    background: none;
    cursor: pointer;
    transition: all .18s;
  }
  .rm2-btn:hover { opacity: .8; }
  .rm2-fc {
    display: flex;
    border-radius: 8px;
    border: 1px solid;
    overflow: hidden;
  }
  .rm2-fb {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px;
    background: none;
    border: none;
    cursor: pointer;
    transition: all .18s;
  }
  .rm2-fb:hover { opacity: .7; }
  .rm2-th {
    display: flex; align-items: center; gap: 5px;
    padding: 0 10px;
    height: 30px;
    border-radius: 8px;
    border: 1px solid;
    background: none;
    cursor: pointer;
    font-family: var(--f);
    font-size: .68rem;
    transition: all .18s;
  }
  .rm2-th:hover { opacity: .75; }
  .rm2-body {
    flex: 1;
    overflow-y: auto;
    padding: clamp(1.4rem,4vw,2.5rem) clamp(1.2rem,5vw,3rem);
    scroll-behavior: smooth;
  }
  .rm2-body::-webkit-scrollbar { width: 4px; }
  .rm2-body::-webkit-scrollbar-track { background: transparent; }
  .rm2-body::-webkit-scrollbar-thumb { background: rgba(200,164,90,.25); border-radius: 999px; }
  .rm2-ttl {
    font-family: var(--f);
    font-size: clamp(1.4rem,4vw,2rem);
    line-height: 1.45;
    margin-bottom: 1.8rem;
    font-weight: 500;
    letter-spacing: -.02em;
  }
  .rm2-txt {
    font-family: var(--f);
    line-height: 2.1;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .rm2-sig {
    margin-top: 2.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid;
    font-family: var(--f);
    font-size: .82rem;
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
    padding: 1rem 1.4rem;
    background: none;
    border: none;
    cursor: pointer;
    transition: background .18s;
  }
  .rm2-nb:hover { background: rgba(255,255,255,.03); }
  .rm2-nb:disabled { opacity: .3; cursor: default; }
  .rm2-nb:disabled:hover { background: none; }
  .rm2-nb + .rm2-nb { border-left: 1px solid; }
  .rm2-nl {
    display: block;
    font-family: var(--f);
    font-size: .65rem;
    margin-bottom: 2px;
  }
  .rm2-nt {
    display: block;
    font-family: var(--f);
    font-size: .8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
  .rm2-sdd {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: #0F1420;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 12px;
    overflow: hidden;
    min-width: 180px;
    box-shadow: 0 12px 40px rgba(0,0,0,.5);
    z-index: 10;
  }
  .rm2-si {
    display: flex; align-items: center; gap: 10px;
    width: 100%;
    padding: 10px 14px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--f);
    font-size: .8rem;
    transition: background .15s;
  }
  .rm2-si:hover { background: rgba(255,255,255,.05); }

  /* ── BOOKS SECTION ── */
  .bs {
    display: flex;
    flex-direction: column;
    gap: clamp(2rem,4vw,3rem);
  }

  /* Featured book */
  .bf {
    position: relative;
    border-radius: 22px;
    overflow: hidden;
    border: 1px solid rgba(200,164,90,.15);
    background: linear-gradient(135deg,rgba(200,164,90,.06) 0%,rgba(200,164,90,.02) 50%,rgba(99,179,237,.04) 100%);
    cursor: pointer;
    transition: transform .3s var(--r), box-shadow .3s;
  }
  .bf:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 70px rgba(0,0,0,.5), 0 0 0 1px rgba(200,164,90,.2);
  }
  .bf-bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 80% at 10% 50%, rgba(200,164,90,.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .bf-in {
    position: relative;
    display: flex;
    gap: clamp(1.5rem,4vw,3rem);
    padding: clamp(1.5rem,3vw,2.5rem);
    align-items: center;
  }
  .bf-cw {
    flex-shrink: 0;
    position: relative;
  }
  .bf-cv {
    width: clamp(120px,18vw,185px);
    height: auto;
    border-radius: 12px;
    box-shadow: 0 16px 50px rgba(0,0,0,.55), 4px 4px 0 rgba(200,164,90,.12);
    display: block;
    transition: transform .35s var(--r);
  }
  .bf:hover .bf-cv { transform: rotate(-1.5deg) scale(1.03); }
  .bf-badge {
    position: absolute;
    top: -8px; left: -8px;
    display: flex; align-items: center; gap: 5px;
    padding: 4px 10px;
    border-radius: 999px;
    font-family: var(--f);
    font-size: .65rem;
    font-weight: 600;
    letter-spacing: .04em;
    box-shadow: 0 4px 14px rgba(0,0,0,.3);
  }
  .bf-cnt {
    flex: 1;
    min-width: 0;
  }
  .bf-sub {
    display: flex; align-items: center; gap: 6px;
    font-family: var(--f);
    font-size: .72rem;
    color: var(--t3);
    margin-bottom: .7rem;
  }
  .bf-ttl {
    font-family: var(--f);
    font-size: clamp(1.2rem,3vw,1.65rem);
    color: var(--t0);
    line-height: 1.45;
    margin-bottom: .8rem;
    font-weight: 500;
    letter-spacing: -.02em;
  }
  .bf-desc {
    font-family: var(--f);
    font-size: .85rem;
    color: var(--t2);
    line-height: 1.9;
    margin-bottom: 1.2rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .bf-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 1.4rem;
  }
  .bf-tag {
    padding: 3px 10px;
    border-radius: 999px;
    font-family: var(--f);
    font-size: .68rem;
    background: rgba(255,255,255,.04);
    color: var(--t3);
    border: 1px solid var(--bdr);
  }
  .bf-btns {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .bf-buy {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 22px;
    border-radius: 999px;
    border: none;
    font-family: var(--f);
    font-size: .88rem;
    cursor: pointer;
    transition: all .25s var(--r);
    text-decoration: none;
  }
  .bf-buy:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,.3); }
  .bf-read {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 22px;
    border-radius: 999px;
    background: transparent;
    font-family: var(--f);
    font-size: .88rem;
    cursor: pointer;
    transition: all .25s var(--r);
    text-decoration: none;
  }
  .bf-read:hover { background: rgba(255,255,255,.06); }

  .bk-sum {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin: 0 0 clamp(1.2rem,2.5vw,1.8rem);
  }
  .bk-sum-card {
    border: 1px solid var(--bdr);
    background: linear-gradient(135deg, rgba(255,255,255,.035), rgba(255,255,255,.012));
    border-radius: 16px;
    padding: 1rem;
    font-family: var(--f);
  }
  .bk-sum-num {
    display: block;
    color: var(--gold);
    font-size: 1.15rem;
    margin-bottom: .25rem;
  }
  .bk-sum-label { color: var(--t3); font-size: .72rem; line-height: 1.7; }

  /* Books grid */
  .bg2 {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: clamp(14px,2vw,20px);
  }

  /* Book card */
  .bc {
    position: relative;
    border-radius: 18px;
    overflow: hidden;
    background: var(--bg2);
    border: 1px solid var(--bdr);
    cursor: pointer;
    transition: transform .28s var(--r), box-shadow .28s, border-color .28s;
  }
  .bc:hover {
    transform: translateY(-8px) scale(1.015);
    border-color: var(--bdr2);
    box-shadow: 0 22px 55px rgba(0,0,0,.5);
  }
  .bc-cw {
    position: relative;
    overflow: hidden;
    background: var(--bg3);
    aspect-ratio: 3/4;
  }
  .bc-cv {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform .4s var(--r);
  }
  .bc:hover .bc-cv { transform: scale(1.06); }
  .bc-ov {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(6,8,14,.9) 0%, transparent 55%);
    opacity: 0;
    transition: opacity .3s;
  }
  .bc:hover .bc-ov { opacity: 1; }
  .bc-hov {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity .3s;
  }
  .bc:hover .bc-hov { opacity: 1; }
  .bc-hb {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    border-radius: 999px;
    background: rgba(6,8,14,.85);
    border: 1px solid rgba(255,255,255,.15);
    color: var(--t0);
    font-family: var(--f);
    font-size: .75rem;
    cursor: pointer;
    backdrop-filter: blur(8px);
  }
  .bc-badge {
    position: absolute;
    top: 10px; left: 10px;
    padding: 3px 9px;
    border-radius: 999px;
    font-family: var(--f);
    font-size: .62rem;
    backdrop-filter: blur(8px);
  }
  .bc-info {
    padding: 1rem;
  }
  .bc-genre {
    display: inline-flex;
    margin-bottom: .45rem;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(255,255,255,.035);
    border: 1px solid var(--bdr);
    color: var(--t3);
    font-family: var(--f);
    font-size: .62rem;
  }
  .bc-ttl {
    font-family: var(--f);
    font-size: .9rem;
    color: var(--t0);
    line-height: 1.5;
    margin-bottom: .4rem;
    font-weight: 500;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .bc-meta {
    display: flex; align-items: center; gap: 5px;
    font-family: var(--f);
    font-size: .68rem;
    color: var(--t3);
    margin-bottom: .55rem;
  }
  .bc-desc {
    font-family: var(--f);
    font-size: .72rem;
    color: var(--t2);
    line-height: 1.75;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: .85rem;
  }
  .bc-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .bc-vb {
    display: flex; align-items: center; gap: 6px;
    width: 100%;
    padding: 7px 0;
    border-radius: 8px;
    border: 1px solid var(--bdr);
    color: var(--t2);
    background: rgba(255,255,255,.025);
    font-family: var(--f);
    font-size: .75rem;
    cursor: pointer;
    justify-content: center;
    transition: all .2s;
  }
  .bc-vb:hover { color: var(--t0); border-color: var(--bdr2); }
  .bc-rb {
    display: flex; align-items: center; gap: 6px;
    width: 100%;
    padding: 7px 0;
    border-radius: 8px;
    border: 1px solid;
    background: transparent;
    font-family: var(--f);
    font-size: .75rem;
    cursor: pointer;
    justify-content: center;
    transition: all .2s;
  }
  .bc-rb:hover { opacity: .8; }

  /* Coming soon card */
  .bc-soon {
    border-radius: 18px;
    border: 1px dashed rgba(255,255,255,.08);
    background: rgba(255,255,255,.015);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 1rem;
    text-align: center;
    min-height: 280px;
  }

  /* Book modal */
  .bm2 {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(3,4,8,.8);
    backdrop-filter: blur(14px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  .bm2-box {
    width: 100%;
    max-width: 680px;
    max-height: 90vh;
    border-radius: 22px;
    background: #0D1120;
    border: 1px solid rgba(255,255,255,.09);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 30px 90px rgba(0,0,0,.65);
  }
  .bm2-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.4rem;
    border-bottom: 1px solid rgba(255,255,255,.07);
    flex-shrink: 0;
  }
  .bm2-in {
    display: flex;
    gap: clamp(1.2rem,3vw,2rem);
    padding: clamp(1.2rem,3vw,2rem);
    overflow-y: auto;
    align-items: flex-start;
  }
  .bm2-in::-webkit-scrollbar { width: 4px; }
  .bm2-in::-webkit-scrollbar-thumb { background: rgba(200,164,90,.2); border-radius: 999px; }
  .bm2-cw { flex-shrink: 0; }
  .bm2-cv {
    width: clamp(110px,20vw,160px);
    height: auto;
    border-radius: 10px;
    box-shadow: 0 12px 40px rgba(0,0,0,.5);
    display: block;
  }
  .bm2-cnt { flex: 1; min-width: 0; }

  /* Section divider */
  .sd {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: clamp(1.2rem,2.5vw,1.8rem);
  }
  .sd-i {
    width: 32px; height: 32px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sd-l {
    font-family: var(--f);
    font-size: .72rem;
    letter-spacing: .1em;
    text-transform: uppercase;
  }
  .sd-ln {
    flex: 1;
    height: 1px;
  }

  /* ── UNIFIED CINEMATIC LIBRARY v8 ── */
  .wp-cinema {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at 18% 8%, rgba(201,168,76,.12), transparent 34%),
      radial-gradient(circle at 82% 18%, rgba(244,114,182,.09), transparent 30%),
      radial-gradient(circle at 50% 86%, rgba(96,165,250,.07), transparent 38%),
      var(--bg);
  }
  .cinema-aurora {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: .75;
    background:
      linear-gradient(115deg, transparent 0 18%, rgba(201,168,76,.045) 32%, transparent 48% 100%),
      radial-gradient(circle at 45% 0%, rgba(232,184,75,.09), transparent 32%);
    filter: blur(.2px);
  }
  .mc-cinema { position: relative; z-index: 1; padding-top: clamp(1.2rem, 3vw, 2.2rem); }
  .library-hero {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: clamp(24px,4vw,40px);
    padding: clamp(1.4rem,4vw,3rem);
    margin-bottom: clamp(1.2rem,3vw,2rem);
    background:
      linear-gradient(135deg, rgba(255,255,255,.075), rgba(255,255,255,.018)),
      radial-gradient(circle at 90% 5%, rgba(201,168,76,.16), transparent 34%),
      rgba(8,12,20,.62);
    box-shadow: 0 28px 100px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.08);
    backdrop-filter: blur(18px);
  }
  .library-hero::before {
    content: "";
    position: absolute;
    inset: -1px;
    background: linear-gradient(120deg, rgba(201,168,76,.28), transparent 28%, transparent 72%, rgba(244,114,182,.18));
    opacity: .42;
    pointer-events: none;
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    padding: 1px;
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
  .lh-kicker, .wc-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--gold);
    font-family: var(--f);
    font-size: .78rem;
    letter-spacing: .16em;
    text-transform: uppercase;
    margin-bottom: .9rem;
  }
  .lh-title {
    max-width: 830px;
    margin: 0 0 1rem;
    font-family: var(--f);
    font-size: clamp(2rem, 6vw, 4.8rem);
    line-height: 1.08;
    color: var(--t0);
    text-wrap: balance;
    letter-spacing: -.03em;
    text-shadow: 0 20px 60px rgba(0,0,0,.55);
  }
  .lh-copy {
    max-width: 760px;
    margin: 0;
    color: var(--t2);
    font-family: var(--f);
    font-size: clamp(1rem, 2.1vw, 1.22rem);
    line-height: 1.9;
  }
  .lh-stats {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 1.5rem;
  }
  .lh-stats div {
    min-width: 128px;
    padding: .85rem 1rem;
    border: 1px solid rgba(255,255,255,.075);
    border-radius: 18px;
    background: rgba(255,255,255,.035);
  }
  .lh-stats strong {
    display: block;
    color: var(--gold);
    font-size: 1.35rem;
    line-height: 1;
    font-family: var(--f);
  }
  .lh-stats span {
    display: block;
    margin-top: .35rem;
    color: var(--t3);
    font-family: var(--f);
    font-size: .78rem;
  }
  .ebook-stage, .writing-cinema {
    position: relative;
    margin-bottom: clamp(1.6rem,4vw,3rem);
    border-radius: clamp(24px,4vw,36px);
    border: 1px solid rgba(255,255,255,.07);
    background:
      linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.015)),
      rgba(7,10,18,.68);
    box-shadow: 0 28px 90px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.065);
    backdrop-filter: blur(16px);
    overflow: hidden;
  }
  .ebook-stage { padding: clamp(1rem,3vw,2rem); }
  .ebook-stage::after {
    content: "";
    position: absolute;
    left: 8%; right: 8%; bottom: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(201,168,76,.55), transparent);
  }
  .ebook-stage-head, .writing-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: clamp(1rem,3vw,2rem);
    margin-bottom: clamp(1rem,3vw,1.6rem);
  }
  .ebook-stage-head h2, .writing-head h2 {
    margin: 0;
    color: var(--t0);
    font-family: var(--f);
    font-size: clamp(1.45rem,3.5vw,2.5rem);
    line-height: 1.25;
  }
  .ebook-stage-head p, .writing-head p {
    max-width: 650px;
    margin: .55rem 0 0;
    color: var(--t2);
    font-family: var(--f);
    line-height: 1.85;
    font-size: .94rem;
  }
  .bk-sum-cinema {
    grid-template-columns: repeat(3, minmax(94px, 1fr));
    margin: 0;
    min-width: min(430px, 100%);
  }
  .ebook-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(.9rem, 2vw, 1.25rem);
    perspective: 1200px;
  }
  .ebook-tile {
    --book-accent: var(--gold);
    position: relative;
    overflow: hidden;
    min-height: 420px;
    display: flex;
    flex-direction: column;
    border-radius: 26px;
    border: 1px solid color-mix(in srgb, var(--book-accent) 26%, rgba(255,255,255,.08));
    background:
      linear-gradient(160deg, color-mix(in srgb, var(--book-accent) 13%, transparent), transparent 38%),
      linear-gradient(180deg, rgba(255,255,255,.065), rgba(255,255,255,.018)),
      #090D19;
    box-shadow: 0 24px 60px rgba(0,0,0,.35);
    cursor: pointer;
    transform-style: preserve-3d;
    transition: transform .28s ease, border-color .28s ease, box-shadow .28s ease;
  }
  .ebook-tile:hover {
    transform: translateY(-8px) rotateX(2deg);
    border-color: color-mix(in srgb, var(--book-accent) 52%, rgba(255,255,255,.12));
    box-shadow: 0 34px 90px rgba(0,0,0,.48), 0 0 42px color-mix(in srgb, var(--book-accent) 18%, transparent);
  }
  .ebook-tile.featured::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.16), transparent);
    transform: translateX(-120%) skewX(-18deg);
    animation: ebookShine 4.8s ease-in-out infinite;
    pointer-events: none;
  }
  .ebook-glow {
    position: absolute;
    inset: auto 12% 38% 12%;
    height: 64px;
    background: color-mix(in srgb, var(--book-accent) 30%, transparent);
    filter: blur(30px);
    opacity: .75;
  }
  .ebook-cover-wrap {
    position: relative;
    display: flex;
    justify-content: center;
    padding: 1.15rem 1rem .75rem;
    min-height: 205px;
  }
  .ebook-cover {
    position: relative;
    z-index: 1;
    width: min(142px, 54vw);
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: 14px;
    box-shadow: 0 22px 45px rgba(0,0,0,.5), -8px 0 18px rgba(0,0,0,.28);
    transform: rotateY(-10deg) rotateZ(-1deg);
    transition: transform .28s ease;
  }
  .ebook-tile:hover .ebook-cover { transform: rotateY(-2deg) translateY(-4px); }
  .ebook-badge {
    position: absolute;
    z-index: 2;
    top: 14px;
    left: 14px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    max-width: calc(100% - 28px);
    padding: 5px 9px;
    border-radius: 999px;
    color: var(--t0);
    background: rgba(5,8,14,.72);
    border: 1px solid color-mix(in srgb, var(--book-accent) 36%, rgba(255,255,255,.08));
    font-family: var(--f);
    font-size: .66rem;
    backdrop-filter: blur(10px);
  }
  .ebook-copy {
    position: relative;
    z-index: 1;
    padding: .25rem 1.1rem 1.15rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .ebook-genre {
    color: var(--book-accent);
    font-family: var(--f);
    font-size: .7rem;
    letter-spacing: .08em;
  }
  .ebook-copy h3 {
    margin: .45rem 0 .55rem;
    color: var(--t0);
    font-family: var(--f);
    font-size: 1.04rem;
    line-height: 1.45;
  }
  .ebook-copy p {
    margin: 0;
    color: var(--t2);
    font-family: var(--f);
    font-size: .78rem;
    line-height: 1.75;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .ebook-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: .8rem;
    color: var(--t3);
    font-family: var(--f);
    font-size: .72rem;
  }
  .ebook-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 8px;
    margin-top: auto;
    padding-top: 1rem;
  }
  .ebook-actions > * {
    min-height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,.08);
    font-family: var(--f);
    font-size: .75rem;
    text-decoration: none;
    cursor: pointer;
    transition: all .2s ease;
  }
  .ebook-preview { background: rgba(255,255,255,.035); color: var(--t2); }
  .ebook-read, .ebook-buy { background: color-mix(in srgb, var(--book-accent) 18%, transparent); color: var(--t0); border-color: color-mix(in srgb, var(--book-accent) 42%, rgba(255,255,255,.08)); }
  .ebook-actions > *:hover { transform: translateY(-2px); filter: brightness(1.08); }
  .writing-cinema { padding: clamp(1rem,3vw,2rem); }
  .writing-head { align-items: center; }
  .wc-count {
    flex-shrink: 0;
    min-width: 112px;
    padding: .9rem 1rem;
    border-radius: 20px;
    border: 1px solid rgba(201,168,76,.18);
    background: rgba(201,168,76,.07);
    color: var(--t2);
    font-family: var(--f);
    text-align: center;
  }
  .wc-count span { display: block; color: var(--gold); font-size: 1.35rem; line-height: 1; }
  .seo-clusters {
    display: flex;
    flex-wrap: wrap;
    gap: .6rem;
    margin: .9rem 0 1.1rem;
  }
  .seo-clusters a {
    display: inline-flex;
    align-items: center;
    gap: .38rem;
    padding: .52rem .78rem;
    border: 1px solid rgba(200,164,90,.18);
    border-radius: 999px;
    background: rgba(200,164,90,.055);
    color: #E8C87A;
    text-decoration: none;
    font-size: .84rem;
    transition: transform .2s var(--r), border-color .2s var(--r), background .2s var(--r);
  }
  .seo-clusters a:hover {
    transform: translateY(-1px);
    border-color: rgba(200,164,90,.32);
    background: rgba(200,164,90,.1);
  }

  .writing-tools {
    position: sticky;
    top: var(--site-nav-offset, 98px);
    z-index: 15;
    display: grid;
    grid-template-columns: minmax(220px, 360px) 1fr auto;
    gap: 10px;
    align-items: center;
    margin: 1.15rem 0;
    padding: 10px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,.07);
    background: rgba(8,12,20,.82);
    backdrop-filter: blur(18px);
    box-shadow: 0 16px 40px rgba(0,0,0,.28);
  }
  .wt-search { max-width: none; width: 100%; }
  .wt-cats { overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
  .wt-cats::-webkit-scrollbar { display: none; }
  .wt-view { flex-shrink: 0; }
  .rb2-cinema { margin-top: .25rem; margin-bottom: 1.1rem; }
  @keyframes ebookShine {
    0%, 56% { transform: translateX(-125%) skewX(-18deg); opacity: 0; }
    64% { opacity: .7; }
    78%, 100% { transform: translateX(125%) skewX(-18deg); opacity: 0; }
  }

  /* ── ACCESSIBILITY & PREMIUM MICRO-INTERACTIONS ── */
  .ebook-tile, .wc2, .sf-cat, .sf-vb, .lm2-btn, .ebook-preview, .ebook-read, .ebook-buy, .rb2-clr {
    outline: none;
  }
  .ebook-tile:focus-visible, .wc2:focus-visible, .sf-cat:focus-visible, .sf-vb:focus-visible, .lm2-btn:focus-visible, .ebook-preview:focus-visible, .ebook-read:focus-visible, .ebook-buy:focus-visible, .rb2-clr:focus-visible {
    box-shadow: 0 0 0 3px rgba(201,168,76,.28), 0 0 0 1px rgba(238,234,226,.12) inset;
  }
  .ebook-tile, .wc2 { cursor: pointer; }
  .ebook-row { overscroll-behavior-x: contain; -webkit-overflow-scrolling: touch; }
  .sf-s input { min-height: 42px; }
  .writing-tools { will-change: transform; }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes glow {
    0%,100% { opacity: .4; }
    50%      { opacity: .8; }
  }

  /* ── SCROLLBAR ── */
  * { scrollbar-width: thin; scrollbar-color: rgba(200,164,90,.2) transparent; }

  /* ── SELECTION ── */
  ::selection { background: rgba(200,164,90,.22); color: var(--t0); }

  /* ── RESPONSIVE ── */
  @media (max-width: 980px) {
    .ebook-stage-head, .writing-head { flex-direction: column; }
    .bk-sum-cinema { width: 100%; }
    .ebook-row {
      display: flex;
      overflow-x: auto;
      padding: 2px 2px 14px;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
    }
    .ebook-row::-webkit-scrollbar { display: none; }
    .ebook-tile { min-width: min(78vw, 310px); scroll-snap-align: start; }
    .writing-tools { grid-template-columns: 1fr auto; }
    .wt-cats { grid-column: 1 / -1; }
  }
  @media (max-width: 768px) {
    .th-in { flex-wrap: wrap; min-height: auto; padding: .6rem clamp(.8rem,3vw,1.2rem); gap: .5rem; }
    .sf { order: 3; width: 100%; padding-bottom: .5rem; }
    .sf-s { max-width: 100%; flex: 1; }
    .sf-cats { display: none; }
    .wt-cats { display: flex; }
    .wg2 { grid-template-columns: 1fr; }
    .bk-sum { grid-template-columns: 1fr; }
    .bk-sum-cinema { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .bg2 { grid-template-columns: repeat(2, 1fr); }
    .bf-in { flex-direction: column; }
    .bf-cv { width: clamp(100px,40vw,150px); }
    .bm2-in { flex-direction: column; }
    .bm2-cv { width: clamp(100px,35vw,140px); }
    .rm2-nt { max-width: 120px; }
    .library-hero, .ebook-stage, .writing-cinema { border-radius: 24px; }
    .writing-tools { top: var(--site-nav-offset, 98px); border-radius: 18px; }
  }
  @media (max-width: 480px) {
    .bg2 { grid-template-columns: 1fr; }
    .th-tabs { width: 100%; }
    .th-tab { flex: 1; justify-content: center; padding: 8px 12px; font-size: .8rem; }
    .mc-cinema { padding-top: .8rem; }
    .library-hero { padding: 1rem; margin-bottom: .85rem; }
    .lh-kicker { margin-bottom: .55rem; font-size: .66rem; letter-spacing: .12em; }
    .lh-title { font-size: clamp(1.55rem, 9vw, 2.2rem); line-height: 1.18; margin-bottom: .65rem; }
    .lh-copy { font-size: .86rem; line-height: 1.75; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .lh-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: .9rem; }
    .lh-stats div { min-width: 0; padding: .65rem .42rem; border-radius: 15px; }
    .lh-stats strong { font-size: 1rem; }
    .lh-stats span { font-size: .6rem; }
    .bk-sum-cinema { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
    .ebook-stage, .writing-cinema { padding: .85rem; margin-bottom: 1rem; }
    .ebook-stage-head, .writing-head { gap: .7rem; margin-bottom: .8rem; }
    .ebook-stage-head h2, .writing-head h2 { font-size: 1.28rem; }
    .ebook-stage-head p, .writing-head p { font-size: .78rem; line-height: 1.65; }
    .ebook-tile { min-width: 82vw; min-height: 360px; }
    .ebook-cover-wrap { min-height: 170px; padding: .85rem .75rem .45rem; }
    .ebook-cover { width: 118px; }
    .ebook-copy h3 { font-size: .96rem; }
    .ebook-copy p { -webkit-line-clamp: 2; font-size: .74rem; }
    .writing-tools { grid-template-columns: 1fr; position: relative; top: auto; }
    .wt-view { justify-self: end; }
    .wc-count { width: 100%; }
  }
`;

// ── Writing Card v7 ───────────────────────────────────────────────────────────
function WritingCard({ writing, index, onClick, viewMode = "grid" }: {
  writing: Writing; index: number; onClick: () => void; viewMode?: "grid"|"list";
}) {
  const c = getCatStyle(writing.category);
  const isL = viewMode === "list";
  const slug = makeSlug(writing.title, writing.id);

  // ❤️ ভালো লেগেছে বাটন (localStorage)
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
                  <span style={{ fontSize: ".72rem" }}>{c.icon}</span>{writing.category}
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
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: ".82rem", opacity: liked ? 1 : 0.45, transition: "opacity .15s, transform .15s", transform: liked ? "scale(1.2)" : "scale(1)" }}>
                  {liked ? "❤️" : "🤍"}
                </button>
                <Link
                  href={`/writings/${slug}`}
                  onClick={(e) => { e.stopPropagation(); onClick(); }}
                  className="wc2-read"
                  style={{ color: c.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                  aria-label={`${writing.title} পড়ুন`}
                >
                  পড়ুন <ArrowRight size={11}/>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="wc2-tags">
              <span className="wc2-cat">
                <span style={{ fontSize: ".72rem" }}>{c.icon}</span>{writing.category}
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
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: ".82rem", opacity: liked ? 1 : 0.45, transition: "opacity .15s, transform .15s", transform: liked ? "scale(1.2)" : "scale(1)" }}>
                  {liked ? "❤️" : "🤍"}
                </button>
                <Link
                  href={`/writings/${slug}`}
                  onClick={(e) => { e.stopPropagation(); onClick(); }}
                  className="wc2-read"
                  style={{ color: c.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                  aria-label={`${writing.title} পড়ুন`}
                >
                  পড়ুন <ArrowRight size={11}/>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ── Writing Modal v7 ──────────────────────────────────────────────────────────
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

  // পড়ার সময় হিসাব করা (প্রতি মিনিটে ​১৫০ শব্দ)
  const wordCount = writing.content.trim().split(/\s+/).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 150));
  const readTimeLabel = readMinutes === 1 ? "১ মিনিট" : `${readMinutes} মিনিট`;

  // সম্পর্কিত লেখা (একই ক্যাটাগরি থেকে ৩টি)
  const relatedWritings = allWritings
    .filter(w => w.id !== writing.id && w.category === writing.category)
    .slice(0, 3);

  const T = {
    dark:  { bg: "#06080E", txt: "#EEEAE2", sub: "rgba(238,234,226,.48)", bdr: "rgba(255,255,255,.06)", hnd: "rgba(255,255,255,.1)", prog: c.accent },
    sepia: { bg: "#120E06", txt: "#D4C8A0", sub: "rgba(212,200,160,.48)", bdr: "rgba(212,200,160,.1)", hnd: "rgba(212,200,160,.2)", prog: "#C8A45A" },
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

  return (
    <motion.div
      className="rm2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: .25 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="rm2-box"
        style={{ background: T.bg }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 290 }}
      >
        <div className="rm2-hnd" style={{ background: T.hnd }}/>
        <div className="rm2-prog" style={{ background: "rgba(255,255,255,.04)" }}>
          <div className="rm2-pf" style={{ width: `${progress}%`, background: T.prog }}/>
        </div>
        <div className="rm2-hd" style={{ borderColor: T.bdr }}>
          <div className="rm2-hdl">
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 10px", borderRadius: 999,
              background: c.bg, color: c.accent, border: `1px solid ${c.border}`,
              fontFamily: "var(--f)", fontSize: ".68rem",
            }}>
              <span style={{ fontSize: ".72rem" }}>{c.icon}</span>{writing.category}
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
              <span style={{ fontSize: ".67rem" }}>{theme === "dark" ? "ডার্ক" : theme === "sepia" ? "সেপিয়া" : "লাইট"}</span>
            </button>
            <div style={{ position: "relative" }} ref={shareRef}>
              <button className="rm2-btn" style={{ color: T.sub, borderColor: T.bdr }} onClick={() => setShowShare(s => !s)}>
                <Share2 size={13}/>
              </button>
              {showShare && (
                <div className="rm2-sdd">
                  <button className="rm2-si" style={{ color: "#EEEAE2" }}
                    onClick={() => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(writingUrl)}`, "_blank"); setShowShare(false); }}>
                    <Facebook size={14} color="#1877F2"/> Facebook
                  </button>
                  <button className="rm2-si" style={{ color: "#EEEAE2" }}
                    onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(writing.title + ' — ' + writingUrl)}`, "_blank"); setShowShare(false); }}>
                    <span style={{ fontSize: 14 }}>💬</span> WhatsApp
                  </button>
                  <button className="rm2-si" style={{ color: "#EEEAE2" }}
                    onClick={() => { navigator.clipboard.writeText(writingUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => { const el = document.createElement('textarea'); el.value = writingUrl; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem", opacity: 0.55 }}>
            <span style={{ color: T.txt, fontSize: ".72rem", fontFamily: "var(--f)" }}>⏱ {readTimeLabel} পড়তে লাগবে</span>
            <span style={{ color: T.bdr }}>·</span>
            <span style={{ color: T.txt, fontSize: ".72rem", fontFamily: "var(--f)" }}>{writing.category}</span>
          </div>
          <div className="rm2-txt" style={{ color: T.txt, fontSize: `${fontSize}rem` }}>
            {writing.content}
          </div>
          <div className="rm2-sig" style={{ borderColor: T.bdr, color: T.txt }}>
            — মাহবুব সরদার সবুজ · {writing.date}
          </div>
          {relatedWritings.length > 0 && (
            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: `1px solid ${T.bdr}` }}>
              <p style={{ color: T.sub, fontSize: ".72rem", fontFamily: "var(--f)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: ".8rem" }}>সম্পর্কিত লেখা</p>
              <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                {relatedWritings.map(rw => (
                  <button key={rw.id} onClick={() => onNavigate(rw)}
                    style={{ textAlign: "left", padding: ".6rem .9rem", borderRadius: 8, background: "rgba(255,255,255,.04)", border: `1px solid ${T.bdr}`, color: T.txt, cursor: "pointer", fontSize: ".82rem", fontFamily: "var(--f)", lineHeight: 1.4, transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.04)")}>
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
    </motion.div>
  );
}

// ── Book Modal v7 ─────────────────────────────────────────────────────────────
function BookModal({ book, onClose }: { book: typeof ebooks[0]; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <motion.div className="bm2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="bm2-box"
        initial={{ opacity: 0, scale: .93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .93, y: 20 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}>
        <div className="bm2-hd">
          <span style={{ fontFamily: "var(--f)", fontSize: ".75rem", color: "rgba(238,234,226,.4)", display: "flex", alignItems: "center", gap: 6 }}>
            <BookOpen size={13} color={book.accentColor}/> {book.subtitle}
          </span>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(238,234,226,.4)" }}>
            <X size={14}/>
          </button>
        </div>
        <div className="bm2-in">
          <div className="bm2-cw">
            <img src={book.cover} alt={`${book.title} - ${book.genre} ই-বুক কভার - মাহবুব সরদার সবুজ`} className="bm2-cv" loading="lazy" decoding="async"
              onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='213' viewBox='0 0 160 213'%3E%3Crect fill='%230D1120'/%3E%3Ctext x='50%25' y='50%25' fill='%23C8A45A' font-size='14' text-anchor='middle' dominant-baseline='middle'%3E📖%3C/text%3E%3C/svg%3E"; }}/>
          </div>
          <div className="bm2-cnt">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: `${book.accentColor}12`, border: `1px solid ${book.accentColor}25`, marginBottom: ".9rem" }}>
              <span style={{ fontFamily: "var(--f)", fontSize: ".62rem", color: book.accentColor, letterSpacing: ".08em", textTransform: "uppercase" }}>{book.badge}</span>
            </div>
            <h2 style={{ fontFamily: "var(--f)", fontSize: "1.2rem", color: "#EEEAE2", lineHeight: 1.45, marginBottom: ".6rem", fontWeight: 500 }}>{book.title}</h2>
            <p style={{ fontFamily: "var(--f)", fontSize: ".82rem", color: "rgba(238,234,226,.5)", lineHeight: 1.9, marginBottom: "1rem" }}>{book.description}</p>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: "1.2rem" }}>
              {[book.genre, `${book.pages} পৃষ্ঠা`, book.year].map((t, i) => (
                <span key={i} style={{ padding: "3px 10px", borderRadius: 999, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", fontFamily: "var(--f)", fontSize: ".67rem", color: "rgba(238,234,226,.35)" }}>{t}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {book.buyLink && (
                <a href={book.buyLink} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 999, background: `linear-gradient(135deg,${book.accentColor},${book.accentColor}CC)`, color: "#08090F", fontFamily: "var(--f)", fontSize: ".82rem", textDecoration: "none", transition: "all .25s", boxShadow: `0 6px 20px ${book.accentColor}28` }}>
                  <ShoppingCart size={13}/> কিনুন
                </a>
              )}
              {book.canRead && (
                <a href={`/ebooks/read/${book.slug}`} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 999, background: "transparent", color: book.accentColor, fontFamily: "var(--f)", fontSize: ".82rem", textDecoration: "none", border: `1.5px solid ${book.accentColor}35`, transition: "all .25s" }}>
                  <BookOpen size={13}/> পড়ুন
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Cinematic E-Book Shelf ───────────────────────────────────────────────────────────────────
function BooksTab() {
  const [, setLocation] = useLocation();

  return (
    <section className="bs ebook-stage" aria-labelledby="ebook-stage-title">
      <div className="ebook-stage-head">
        <div>
          <div className="wc-kicker"><Library size={14}/> প্রথম সারি</div>
          <h2 id="ebook-stage-title">ই-বুক ও প্রকাশনা সংগ্রহ</h2>
        </div>
      </div>

      <div className="ebook-row">
        {ebooks.map((book, i) => (
          <motion.article
            key={book.id}
            className={`ebook-tile${book.isFeatured ? " featured" : ""}`}
            style={{ "--book-accent": book.accentColor } as React.CSSProperties}
            initial={{ opacity: 0, y: 28, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: i * .08, duration: .48, ease: [.25,.46,.45,.94] }}
            onClick={() => setLocation(`/ebooks/read/${book.slug}`)}
            role="article"
            tabIndex={0}
            aria-label={`${book.title} দেখুন`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLocation(`/ebooks/read/${book.slug}`); } }}
          >
            <div className="ebook-glow"/>
            <div className="ebook-cover-wrap">
              <img src={book.cover} alt={`${book.title} - ${book.genre} বাংলা ই-বুক - মাহবুব সরদার সবুজ`} className="ebook-cover" loading={i === 0 ? "eager" : "lazy"} decoding="async" fetchPriority={i === 0 ? "high" : "auto"}
                onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='267' viewBox='0 0 200 267'%3E%3Crect fill='%230D1120'/%3E%3Ctext x='50%25' y='50%25' fill='%23C8A45A' font-size='14' text-anchor='middle' dominant-baseline='middle'%3E📖%3C/text%3E%3C/svg%3E"; }}/>
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
        ))}
      </div>


    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE v8 — Unified Cinematic Library
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
      const w = archive.find(wr => makeSlug(wr.title, wr.id) === params.slug);
      if (w) setSel(w);
      // If archive is ready but writing not found, slug may be invalid — stay on page
    }
  }, [archive, match, params?.slug, archiveReady]);

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
    : "মাহবুব সরদার সবুজের প্রকাশিত ই-বুক, বই এবং সকল লেখা একসাথে একটি প্রিমিয়াম সাহিত্য সংগ্রহে।";
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
        "numberOfItems": archive.length,
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
          <BooksTab/>

          <section className="writing-cinema" id="all-writings">
            <div className="writing-head">
              <div>
                <div className="wc-kicker"><Feather size={14}/> লেখালেখি</div>
                <h2>নির্বাচিত অনুভূতির আর্কাইভ</h2>
              </div>
              <div className="wc-count"><span>{filtered.length}</span> টি লেখা</div>
            </div>

            <nav className="seo-clusters" aria-label="জনপ্রিয় বাংলা সাহিত্য বিষয়">
              <Link href="/bangla-kobita">বাংলা কবিতা</Link>
              <Link href="/valobashar-kobita">ভালোবাসার কবিতা</Link>
              <Link href="/bichched-kobita">বিচ্ছেদ কবিতা</Link>
              <Link href="/jibon-dorshon">জীবনদর্শন</Link>
              <Link href="/bangla-ebook">বাংলা ই-বুক</Link>
            </nav>

            <div className="writing-tools">
              <div className="sf-s wt-search">
                <Search size={13} color="rgba(238,234,226,.34)"/>
                <input
                  type="text"
                  placeholder="লেখা খুঁজুন…"
                  aria-label="লেখা খুঁজুন"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  disabled={!archiveReady}
                />
                {q && (
                  <button aria-label="সার্চ মুছে ফেলুন" onClick={() => setQ("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(238,234,226,.35)", display: "flex" }}>
                    <X size={12}/>
                  </button>
                )}
              </div>
              <div className="sf-cats wt-cats">
                {CATS.map(c2 => (
                  <motion.button
                    key={c2.id}
                    className="sf-cat"
                    style={cat === c2.id ? { background: `${c2.color}0E`, color: c2.color, borderColor: `${c2.color}25`, boxShadow: `0 0 10px ${c2.glow}` } : {}}
                    onClick={() => setCat(c2.id)}
                    aria-pressed={cat === c2.id}
                    whileTap={{ scale: .93 }}
                  >
                    <span style={{ fontSize: ".75rem" }}>{c2.icon}</span>{c2.label}
                  </motion.button>
                ))}
              </div>
              <div className="sf-vw wt-view">
                <button className={`sf-vb${viewMode === "grid" ? " on" : ""}`} onClick={() => setViewMode("grid")} title="গ্রিড" aria-label="গ্রিড ভিউ" aria-pressed={viewMode === "grid"}><Grid3X3 size={12}/></button>
                <button className={`sf-vb${viewMode === "list" ? " on" : ""}`} onClick={() => setViewMode("list")} title="লিস্ট" aria-label="লিস্ট ভিউ" aria-pressed={viewMode === "list"}><List size={12}/></button>
              </div>
            </div>

            <div className="rb2 rb2-cinema">
              <div className="rb2-t">
                <span className="rb2-n">{filtered.length}</span> টি লেখা{filtered.length > visibleWritings.length && <span>· প্রথমে {visibleWritings.length}টি দেখানো হচ্ছে</span>}
                {cat !== "all" && <span>· {CATS.find(c2 => c2.id === cat)?.label}</span>}
                {deferredQuery && <span>· “{deferredQuery}”</span>}
              </div>
              {(cat !== "all" || q) && (
                <button className="rb2-clr" aria-label="সব ফিল্টার সরান" onClick={() => { setCat("all"); setQ(""); }}>
                  <X size={10}/> সরান
                </button>
              )}
            </div>

            {!archiveReady ? (
              <div className="wc2-em" aria-live="polite">
                <Search size={26} color="rgba(238,234,226,.12)" style={{ margin: "0 auto .8rem", display: "block" }}/>
                <div style={{ fontSize: ".95rem", color: "rgba(238,234,226,.3)", fontFamily: "var(--f)" }}>লেখাগুলো প্রস্তুত হচ্ছে…</div>
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
                    <button className="lm2-btn" aria-label="আরও লেখা দেখুন" onClick={() => setVisibleCount((n) => Math.min(n + WRITINGS_PAGE_SIZE, filtered.length))}>
                      <ChevronDown size={15}/> আরও লেখা দেখুন
                    </button>
                    <div className="lm2-note">{visibleWritings.length} / {filtered.length} টি লেখা দেখা যাচ্ছে</div>
                  </div>
                )}
              </>
            ) : (
              <div className="wc2-em">
                <Search size={26} color="rgba(238,234,226,.12)" style={{ margin: "0 auto .8rem", display: "block" }}/>
                <div style={{ fontSize: ".95rem", color: "rgba(238,234,226,.3)", fontFamily: "var(--f)" }}>কোনো লেখা পাওয়া যায়নি</div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* AdSense Ad — লেখালেখি পেজের নিচে */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "1.5rem 1rem" }}>
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

