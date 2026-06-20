/**
 * Writings & E-Books — লেখালেখি ও বই
 * Design: LUMINARY ULTRA v13 — World-Class Literary Experience
 * Philosophy: Cinematic depth · Editorial clarity · Emotional resonance
 * Inspired by: Apple Books, Substack, Kindle, Vercel, Linear, Notion
 * Palette: Void #060810 | Obsidian #0E1018 | Gold #C9A84C | Cream #F2EDE4
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { SITE_URL } from "@/components/Seo";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";
import { loadWritingsArchive } from "@/lib/loadWritingsArchive";
import type { Writing } from "@/data/writingsArchive";
import { motion, AnimatePresence, useInView, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useState, useEffect, useRef, useCallback, useMemo, useDeferredValue } from "react";
import { createPortal } from "react-dom";
import { Link, useRoute, useLocation } from "wouter";
import {
  Feather, BookOpen, Star, Calendar, X, Search, Share2, Copy,
  ChevronLeft, ChevronRight, Facebook, Check, AArrowUp, AArrowDown,
  ShoppingCart, Eye, Library, Grid3X3, List, ArrowRight, Crown,
  Moon, Sun, Scroll, ChevronDown, BookMarked, Sparkles, Heart,
  Quote, Bookmark, TrendingUp, Filter, Pen, Flame, Wind,
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
  { id:"all",        label:"সব লেখা",    icon:"✦",  color:"#C9A84C", glow:"rgba(201,168,76,.5)",   bg:"rgba(201,168,76,.08)"  },
  { id:"ছোট লেখা",   label:"ছোট লেখা",  icon:"✎",  color:"#34D399", glow:"rgba(52,211,153,.5)",   bg:"rgba(52,211,153,.08)"  },
  { id:"কবিতা",      label:"কবিতা",      icon:"❧",  color:"#60A5FA", glow:"rgba(96,165,250,.5)",   bg:"rgba(96,165,250,.08)"  },
  { id:"ভালোবাসা",   label:"ভালোবাসা",  icon:"♡",  color:"#F472B6", glow:"rgba(244,114,182,.5)",  bg:"rgba(244,114,182,.08)" },
  { id:"জীবনদর্শন",  label:"জীবনদর্শন", icon:"◈",  color:"#FBBF24", glow:"rgba(251,191,36,.5)",   bg:"rgba(251,191,36,.08)"  },
  { id:"বিচ্ছেদ",    label:"বিচ্ছেদ",   icon:"◌",  color:"#A78BFA", glow:"rgba(167,139,250,.5)",  bg:"rgba(167,139,250,.08)" },
  { id:"গল্প",        label:"গল্প",       icon:"✦",  color:"#FB923C", glow:"rgba(251,146,60,.5)",   bg:"rgba(251,146,60,.08)"  },
];

function getCatStyle(cat: string) {
  const m: Record<string,{accent:string;glow:string;bg:string;badge:string;border:string;icon:string;rgb:string}> = {
    "ভালোবাসা": { accent:"#F472B6",glow:"rgba(244,114,182,.3)", bg:"rgba(244,114,182,.07)",badge:"rgba(244,114,182,.14)",border:"rgba(244,114,182,.28)",icon:"♡", rgb:"244,114,182" },
    "বিচ্ছেদ":  { accent:"#A78BFA",glow:"rgba(167,139,250,.3)", bg:"rgba(167,139,250,.07)",badge:"rgba(167,139,250,.14)",border:"rgba(167,139,250,.28)",icon:"◌", rgb:"167,139,250" },
    "কবিতা":    { accent:"#60A5FA",glow:"rgba(96,165,250,.3)",  bg:"rgba(96,165,250,.07)", badge:"rgba(96,165,250,.14)", border:"rgba(96,165,250,.28)", icon:"❧", rgb:"96,165,250"  },
    "ছোট লেখা": { accent:"#34D399",glow:"rgba(52,211,153,.3)",  bg:"rgba(52,211,153,.07)", badge:"rgba(52,211,153,.14)", border:"rgba(52,211,153,.28)", icon:"✎", rgb:"52,211,153"  },
    "জীবনদর্শন":{ accent:"#FBBF24",glow:"rgba(251,191,36,.3)",  bg:"rgba(251,191,36,.07)", badge:"rgba(251,191,36,.14)", border:"rgba(251,191,36,.28)", icon:"◈", rgb:"251,191,36"  },
    "গল্প":      { accent:"#FB923C",glow:"rgba(251,146,60,.3)",  bg:"rgba(251,146,60,.07)", badge:"rgba(251,146,60,.14)", border:"rgba(251,146,60,.28)", icon:"✦", rgb:"251,146,60"  },
  };
  return m[cat] ?? m["জীবনদর্শন"];
}

const WRITINGS_PAGE_SIZE = 24;

const ebooks = [
  { id:1, slug:"dukkhovilash",      title:"আমি বিচ্ছেদকে বলি দুঃখবিলাস",          subtitle:"প্রথম ফিজিক্যাল বই", cover:"/images/ebooks/dukkhovilash.jpg",      description:"বিচ্ছেদের ব্যথা, হারানোর কষ্ট আর জীবনের গভীর অনুভূতিগুলো এই বইয়ে অনন্যভাবে তুলে ধরা হয়েছে।",                                                                                                         genre:"আবেগী সাহিত্য", pages:"১৫০+", year:"২০২৬", badge:"ফিজিক্যাল বই", badgeColor:"#D4A843", buyLink:"https://rkmri.co/TTMEoA3l3pM0/", isFeatured:true,  canRead:true, accentColor:"#D4A843", accentRgb:"212,168,67" },
  { id:2, slug:"smritir-boshonte",  title:"স্মৃতির বসন্তে তুমি",                   subtitle:"ই-বুক",              cover:"/images/ebooks/smritir-boshonte.jpg",  description:"স্মৃতির গভীরে হারিয়ে যাওয়া প্রিয় মুহূর্তগুলো নিয়ে লেখা এই আবেগঘন কাব্যিক সংকলন।",                                                                                                            genre:"কবিতা ও গদ্য",  pages:"৮০+",  year:"২০২৪", badge:"ই-বুক",        badgeColor:"#4A90D9", buyLink:null,                                   isFeatured:false, canRead:true, accentColor:"#4A90D9", accentRgb:"74,144,217" },
  { id:3, slug:"chand-phool",       title:"চাঁদফুল",                                subtitle:"ই-বুক",              cover:"/images/ebooks/chand-phool.jpg",       description:"প্রকৃতির অপরূপ সৌন্দর্য আর মানবমনের কোমল অনুভূতির মেলবন্ধনে রচিত এই বিশেষ কাব্যগ্রন্থ।",                                                                                                           genre:"কবিতা",         pages:"৬০+",  year:"২০২৩", badge:"ই-বুক",        badgeColor:"#27AE60", buyLink:null,                                   isFeatured:false, canRead:true, accentColor:"#27AE60", accentRgb:"39,174,96"  },
  { id:4, slug:"shomoyer-gohvore",  title:"সময়ের গহ্বরে",                           subtitle:"ই-বুক",              cover:"/images/ebooks/shomoyer-gohvore.jpg",  description:"সময়ের স্রোতে হারিয়ে যাওয়া শহর, মানুষ আর স্মৃতির কথা এই নস্টালজিক সাহিত্যকর্মে অনবদ্যভাবে উঠে এসেছে।",                                                                                    genre:"গদ্য ও কবিতা",  pages:"১০০+", year:"২০২৩", badge:"ই-বুক",        badgeColor:"#E67E22", buyLink:null,                                   isFeatured:false, canRead:true, accentColor:"#E67E22", accentRgb:"230,126,34" },
  { id:5, slug:"onoboddo-lekha",    title:"মাহবুব সরদার সবুজের অনবদ্য লেখা",       subtitle:"ই-বুক",              cover:"/images/ebooks/onoboddo-lekha-new.jpg",    description:"১০০টি জীবনমুখী ও অনুপ্রেরণামূলক লেখার সংকলন — ভালোবাসা, বিচ্ছেদ, জীবনদর্শন ও মানবিক অনুভূতির অপূর্ব মিশ্রণ।",                                                                           genre:"মিশ্র সাহিত্য", pages:"১০১",  year:"২০২৬", badge:"ই-বুক",        badgeColor:"#8B5CF6", buyLink:null,                                   isFeatured:true,  canRead:true, accentColor:"#8B5CF6", accentRgb:"139,92,246" },
];

// Featured quotes for Quote Spotlight
const FEATURED_QUOTES = [
  { text: "দূরত্বে মানুষ হারিয়ে যায় না, হারিয়ে যায় শুধু তার গুরুত্ব।", cat: "বিচ্ছেদ", color: "#A78BFA" },
  { text: "যে মানুষ আপনার জীবনে শান্তি নিয়ে আসে, তাকে কখনো অবহেলা করবেন না।", cat: "জীবনদর্শন", color: "#FBBF24" },
  { text: "ভাঙা বিশ্বাসের যন্ত্রণা, অনেক সময় ভাঙা হৃদয়ের চেয়েও বেশি কষ্ট দেয়।", cat: "বিচ্ছেদ", color: "#A78BFA" },
  { text: "নিজেকে ছোট ভাবার অভ্যাস মানুষকে ধীরে ধীরে নিজের স্বপ্ন থেকে দূরে সরিয়ে দেয়।", cat: "জীবনদর্শন", color: "#FBBF24" },
  { text: "কিছু মানুষ জীবনে আসে, কিন্তু থেকে যাওয়ার জন্য আসে না।", cat: "বিচ্ছেদ", color: "#A78BFA" },
];

// ══════════════════════════════════════════════════════════════════════════════
//  CSS — LUMINARY ULTRA v13
// ══════════════════════════════════════════════════════════════════════════════
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@300;400;500;600;700&display=swap');

  /* ── DESIGN TOKENS ── */
  :root {
    --void:    #060810;
    --obs:     #0E1018;
    --surf1:   #121520;
    --surf2:   #171B28;
    --surf3:   #1D2130;
    --t0:      #F2EDE4;
    --t1:      rgba(242,237,228,.92);
    --t2:      rgba(242,237,228,.62);
    --t3:      rgba(242,237,228,.38);
    --t4:      rgba(242,237,228,.16);
    --t5:      rgba(242,237,228,.07);
    --gold:    #C9A84C;
    --gold2:   #E8C87A;
    --gold3:   #F5E0A8;
    --gold4:   #A07830;
    --bdr1:    rgba(255,255,255,.06);
    --bdr2:    rgba(255,255,255,.10);
    --bdr3:    rgba(255,255,255,.16);
    --bdr4:    rgba(255,255,255,.24);
    --f:       'AdorshoLipi', 'Noto Serif Bengali', serif;
    --ease:    cubic-bezier(.25,.46,.45,.94);
    --silk:    cubic-bezier(.16,1,.3,1);
    --spring:  cubic-bezier(.34,1.56,.64,1);
    --bounce:  cubic-bezier(.68,-.55,.27,1.55);
  }

  /* ── PAGE ── */
  .lw-page { background: var(--void); min-height: 100vh; padding-top: var(--site-nav-offset,98px); overflow-x: hidden; }
  .lw-page::before {
    content: "";
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 80% 50% at 10% -5%,  rgba(201,168,76,.09)  0%, transparent 55%),
      radial-gradient(ellipse 55% 40% at 90% 20%,  rgba(96,165,250,.06)  0%, transparent 50%),
      radial-gradient(ellipse 45% 35% at 50% 105%, rgba(167,139,250,.05) 0%, transparent 48%),
      radial-gradient(ellipse 30% 25% at 80% 80%,  rgba(244,114,182,.04) 0%, transparent 42%);
  }
  .lw-wrap { max-width: 1300px; margin: 0 auto; padding: clamp(1.2rem,3vw,2.5rem) clamp(.9rem,3.5vw,2.5rem); position: relative; z-index: 1; }

  /* ══════════════════════════════════════════════════
     HERO v13 — FULL CINEMATIC STAGE
  ══════════════════════════════════════════════════ */
  .lw-hero {
    position: relative; overflow: hidden;
    border-radius: clamp(24px,4vw,48px);
    margin-bottom: clamp(1.4rem,3vw,2.8rem);
    padding: clamp(3rem,6vw,5.5rem) clamp(2rem,5vw,4.5rem);
    background:
      radial-gradient(ellipse 100% 80% at 95% -15%, rgba(201,168,76,.28) 0%, transparent 50%),
      radial-gradient(ellipse 65% 55% at 0% 115%,  rgba(96,165,250,.13) 0%, transparent 46%),
      radial-gradient(ellipse 40% 35% at 50% 50%, rgba(167,139,250,.04) 0%, transparent 60%),
      linear-gradient(160deg, rgba(255,255,255,.08) 0%, rgba(255,255,255,.018) 55%, transparent 100%),
      #080C1A;
    border: 1px solid rgba(255,255,255,.08);
    box-shadow:
      0 0 0 1px rgba(201,168,76,.08) inset,
      0 60px 160px rgba(0,0,0,.6),
      0 1px 0 rgba(255,255,255,.12) inset;
  }
  /* Shimmer top line */
  .lw-hero::before {
    content: "";
    position: absolute; top: 0; left: 0; right: 0; height: 1px; pointer-events: none;
    background: linear-gradient(90deg, transparent 0%, rgba(201,168,76,.8) 20%, rgba(255,255,255,.6) 50%, rgba(201,168,76,.8) 80%, transparent 100%);
  }
  /* Noise texture overlay */
  .lw-hero::after {
    content: "";
    position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
    background-size: 200px 200px; opacity: .5;
  }

  /* Calligraphy watermark */
  .lw-hero-calligraphy {
    position: absolute; right: -2%; top: 50%; transform: translateY(-50%);
    font-family: var(--f); font-size: clamp(14rem,22vw,26rem);
    color: rgba(201,168,76,.04); font-weight: 700; line-height: 1;
    pointer-events: none; user-select: none; z-index: 0;
    letter-spacing: -.08em;
  }

  .lw-hero-inner {
    display: grid;
    grid-template-columns: 1fr minmax(260px,.48fr);
    gap: clamp(2.5rem,6vw,5rem);
    align-items: center;
    position: relative; z-index: 1;
  }

  .lw-hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 18px; border-radius: 999px; margin-bottom: 1.4rem;
    background: rgba(201,168,76,.1); border: 1px solid rgba(201,168,76,.28);
    color: var(--gold); font-family: var(--f);
    font-size: .72rem; letter-spacing: .24em; text-transform: uppercase; font-weight: 700;
    box-shadow: 0 0 24px rgba(201,168,76,.12);
  }
  .lw-hero-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--gold); box-shadow: 0 0 8px rgba(201,168,76,.8);
    animation: lw-pulse 2s ease-in-out infinite;
  }
  @keyframes lw-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.7)} }

  .lw-hero-h1 {
    margin: 0 0 .5rem; font-family: var(--f);
    font-size: clamp(2.8rem,7.5vw,6.5rem);
    line-height: 1.02; font-weight: 700; letter-spacing: -.05em; color: var(--t0);
  }
  .lw-hero-h1-gold {
    background: linear-gradient(135deg, var(--gold3) 0%, var(--gold) 40%, var(--gold2) 75%, var(--gold4) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    filter: drop-shadow(0 0 32px rgba(201,168,76,.4));
    display: block; margin-top: -.1em;
  }
  .lw-hero-sub {
    max-width: 540px; margin: 1.4rem 0 2.4rem;
    color: var(--t2); font-family: var(--f);
    font-size: clamp(.95rem,2vw,1.15rem); line-height: 2.1;
    border-left: 2px solid rgba(201,168,76,.3); padding-left: 1.2rem;
  }
  .lw-hero-stats {
    display: flex; gap: .8rem; flex-wrap: wrap;
  }
  .lw-hero-stat {
    display: flex; flex-direction: column; align-items: center;
    padding: 14px 22px; border-radius: 18px;
    background: rgba(255,255,255,.05); border: 1px solid var(--bdr2);
    font-family: var(--f); cursor: default;
    transition: all .28s var(--silk); min-width: 80px;
    position: relative; overflow: hidden;
  }
  .lw-hero-stat::before {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(201,168,76,.08) 0%, transparent 60%);
    opacity: 0; transition: opacity .28s;
  }
  .lw-hero-stat:hover { border-color: rgba(201,168,76,.35); transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.3), 0 0 20px rgba(201,168,76,.1); }
  .lw-hero-stat:hover::before { opacity: 1; }
  .lw-hero-stat-n { color: var(--gold); font-weight: 800; font-size: 1.5rem; line-height: 1; letter-spacing: -.03em; }
  .lw-hero-stat-l { color: var(--t3); font-size: .7rem; margin-top: 4px; letter-spacing: .06em; }

  /* Quote ticker */
  .lw-ticker {
    margin-top: 2.8rem; padding-top: 1.8rem;
    border-top: 1px solid rgba(255,255,255,.07);
    overflow: hidden; position: relative;
  }
  .lw-ticker::before, .lw-ticker::after {
    content: ""; position: absolute; top: 0; bottom: 0; width: 80px; z-index: 2; pointer-events: none;
  }
  .lw-ticker::before { left: 0; background: linear-gradient(90deg, #080C1A, transparent); }
  .lw-ticker::after  { right: 0; background: linear-gradient(-90deg, #080C1A, transparent); }
  .lw-ticker-track {
    display: flex; gap: 3rem; align-items: center;
    animation: lw-ticker 40s linear infinite;
    width: max-content;
  }
  .lw-ticker-track:hover { animation-play-state: paused; }
  @keyframes lw-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .lw-ticker-item {
    display: flex; align-items: center; gap: .8rem;
    white-space: nowrap; font-family: var(--f); font-size: .82rem;
    color: var(--t3); flex-shrink: 0;
  }
  .lw-ticker-item span { color: var(--gold); opacity: .6; font-size: .7rem; }

  /* Book showcase */
  .lw-hero-showcase {
    position: relative; min-height: 420px;
    border-radius: 32px; overflow: hidden;
    background:
      radial-gradient(ellipse 90% 70% at 50% 0%, rgba(201,168,76,.28) 0%, transparent 58%),
      radial-gradient(ellipse 60% 50% at 20% 100%, rgba(96,165,250,.12) 0%, transparent 48%),
      linear-gradient(180deg, rgba(255,255,255,.08) 0%, rgba(255,255,255,.015) 100%);
    border: 1px solid rgba(255,255,255,.1);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 40px 100px rgba(0,0,0,.4);
  }
  .lw-hero-showcase::after {
    content: ""; position: absolute; left: 10%; right: 10%; bottom: 20px;
    height: 28px; border-radius: 999px;
    background: rgba(201,168,76,.35); filter: blur(28px); pointer-events: none;
  }
  .lw-hero-stack {
    position: absolute; inset: 40px 12px 50px;
    display: flex; align-items: flex-end; justify-content: center;
    gap: 16px; perspective: 1400px;
  }
  .lw-hero-book {
    width: clamp(80px,9.5vw,120px); aspect-ratio: 3/4;
    border-radius: 16px; object-fit: cover;
    box-shadow: 0 36px 72px rgba(0,0,0,.65), -12px 0 24px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.16);
    transform: rotate(var(--r,0deg)) translateY(var(--l,0px));
    transition: transform .5s var(--silk), box-shadow .5s;
  }
  .lw-hero-showcase:hover .lw-hero-book {
    transform: rotate(var(--r,0deg)) translateY(calc(var(--l,0px) - 16px));
    box-shadow: 0 52px 100px rgba(0,0,0,.75), -12px 0 24px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.22);
  }
  .lw-hero-book:nth-child(1) { --r:-14deg; --l:22px; }
  .lw-hero-book:nth-child(2) { --r:-1deg;  --l:-12px; width: clamp(96px,11.5vw,144px); }
  .lw-hero-book:nth-child(3) { --r:11deg;  --l:26px; }

  /* Showcase label */
  .lw-hero-showcase-label {
    position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
    font-family: var(--f); font-size: .65rem; color: rgba(201,168,76,.6);
    letter-spacing: .18em; text-transform: uppercase; white-space: nowrap;
    z-index: 2;
  }

  /* ══════════════════════════════════════════════════
     SECTION PANELS
  ══════════════════════════════════════════════════ */
  .lw-panel {
    position: relative; overflow: hidden;
    border-radius: clamp(22px,3.8vw,42px);
    border: 1px solid var(--bdr1);
    background: linear-gradient(175deg, rgba(255,255,255,.058) 0%, rgba(255,255,255,.014) 100%), var(--surf1);
    box-shadow: 0 32px 100px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.065);
    backdrop-filter: blur(18px);
    margin-bottom: clamp(1.4rem,3.2vw,2.8rem);
    padding: clamp(1.8rem,3.5vw,3rem);
  }
  .lw-panel-gold::before {
    content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent 5%, rgba(201,168,76,.65), rgba(255,255,255,.38), rgba(201,168,76,.65), transparent 95%);
    pointer-events: none;
  }
  .lw-panel-blue::before {
    content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent 5%, rgba(96,165,250,.55), rgba(255,255,255,.32), rgba(96,165,250,.55), transparent 95%);
    pointer-events: none;
  }
  .lw-panel-purple::before {
    content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent 5%, rgba(167,139,250,.55), rgba(255,255,255,.28), rgba(167,139,250,.55), transparent 95%);
    pointer-events: none;
  }
  .lw-panel-head {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 1.5rem; margin-bottom: clamp(1.5rem,3vw,2.4rem);
  }
  .lw-eyebrow {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 5px 14px; border-radius: 999px; margin-bottom: .75rem;
    background: rgba(201,168,76,.08); border: 1px solid rgba(201,168,76,.2);
    color: var(--gold); font-family: var(--f);
    font-size: .7rem; letter-spacing: .18em; text-transform: uppercase; font-weight: 700;
  }
  .lw-panel-head h2 {
    margin: 0; color: var(--t0); font-family: var(--f);
    font-size: clamp(1.55rem,3.8vw,2.6rem);
    line-height: 1.18; font-weight: 700; letter-spacing: -.035em;
  }
  .lw-panel-head p {
    max-width: 580px; margin: .55rem 0 0;
    color: var(--t2); font-family: var(--f); line-height: 1.9; font-size: .9rem;
  }
  .lw-see-all {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 999px; white-space: nowrap; flex-shrink: 0;
    border: 1px solid rgba(201,168,76,.26); background: rgba(201,168,76,.07);
    color: var(--gold); font-family: var(--f); font-size: .8rem;
    text-decoration: none; font-weight: 700;
    transition: all .24s var(--silk);
  }
  .lw-see-all:hover { background: rgba(201,168,76,.16); border-color: rgba(201,168,76,.48); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,.2); }

  /* ══════════════════════════════════════════════════
     FEATURED BOOK — MAGAZINE EDITORIAL SPREAD
  ══════════════════════════════════════════════════ */
  .lw-featured {
    --ba: var(--gold);
    --ba-rgb: 201,168,76;
    position: relative; overflow: hidden;
    border-radius: 30px; margin-bottom: 2rem; cursor: pointer;
    border: 1px solid rgba(var(--ba-rgb), .3);
    background:
      radial-gradient(ellipse 75% 65% at 96% -8%,  rgba(var(--ba-rgb),.26) 0%, transparent 52%),
      radial-gradient(ellipse 55% 48% at 4% 112%,  rgba(96,165,250,.1) 0%, transparent 46%),
      linear-gradient(160deg, rgba(255,255,255,.09) 0%, rgba(255,255,255,.02) 100%),
      #0A0E1E;
    box-shadow: 0 40px 110px rgba(0,0,0,.52), 0 0 0 1px rgba(var(--ba-rgb),.14) inset;
    transition: transform .38s var(--silk), box-shadow .38s;
  }
  .lw-featured:hover { transform: translateY(-8px); box-shadow: 0 56px 140px rgba(0,0,0,.62), 0 0 70px rgba(var(--ba-rgb),.18), 0 0 0 1px rgba(var(--ba-rgb),.26) inset; }
  .lw-featured::before {
    content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px;
    background: linear-gradient(145deg, rgba(var(--ba-rgb),.65) 0%, rgba(255,255,255,.14) 35%, transparent 62%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none; opacity: .5; transition: opacity .38s;
  }
  .lw-featured:hover::before { opacity: 1; }
  .lw-featured-inner {
    display: grid; grid-template-columns: auto 1fr;
    gap: clamp(2rem,4vw,3.5rem); align-items: center;
    padding: clamp(2rem,4vw,3.2rem);
    position: relative; z-index: 1;
  }
  .lw-featured-cover-wrap { position: relative; flex-shrink: 0; }
  .lw-featured-cover {
    width: clamp(140px,17vw,210px); aspect-ratio: 3/4; object-fit: cover;
    border-radius: 20px; display: block;
    box-shadow: 0 40px 90px rgba(0,0,0,.65), -16px 0 32px rgba(0,0,0,.3), inset 0 0 0 1px rgba(255,255,255,.16);
    transform: rotateY(-14deg) rotateZ(-2deg);
    transition: transform .42s var(--silk), box-shadow .42s;
  }
  .lw-featured:hover .lw-featured-cover {
    transform: rotateY(-2deg) translateY(-10px) scale(1.03);
    box-shadow: 0 56px 110px rgba(0,0,0,.72), -16px 0 32px rgba(0,0,0,.3), inset 0 0 0 1px rgba(255,255,255,.2);
  }
  .lw-featured-cover-wrap::after {
    content: ""; position: absolute; left: -10px; top: 5%; bottom: 5%; width: 10px;
    background: linear-gradient(90deg, rgba(0,0,0,.55), transparent);
    border-radius: 3px 0 0 3px; pointer-events: none;
  }
  .lw-featured-badge {
    position: absolute; top: -14px; right: -14px;
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 14px; border-radius: 999px;
    background: rgba(6,8,16,.94); border: 1px solid rgba(var(--ba-rgb),.55);
    color: var(--t0); font-family: var(--f); font-size: .65rem; font-weight: 800;
    backdrop-filter: blur(16px); box-shadow: 0 8px 26px rgba(0,0,0,.5), 0 0 16px rgba(var(--ba-rgb),.2);
    letter-spacing: .05em;
  }
  .lw-featured-content { min-width: 0; }
  .lw-featured-genre {
    color: rgba(var(--ba-rgb),1); font-family: var(--f);
    font-size: .7rem; letter-spacing: .16em; text-transform: uppercase; font-weight: 800; margin-bottom: .7rem;
  }
  .lw-featured-title {
    font-family: var(--f); font-size: clamp(1.3rem,3.5vw,2.2rem);
    color: var(--t0); line-height: 1.36; font-weight: 700; letter-spacing: -.025em; margin: 0 0 .9rem;
  }
  .lw-featured-desc {
    font-family: var(--f); font-size: .9rem; color: var(--t2); line-height: 2.05; margin: 0 0 1.5rem;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  }
  .lw-featured-meta {
    display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-bottom: 1.8rem;
  }
  .lw-featured-meta span {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 13px; border-radius: 999px;
    background: rgba(255,255,255,.055); border: 1px solid var(--bdr2);
    font-family: var(--f); font-size: .72rem; color: var(--t3);
  }
  .lw-featured-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .lw-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 26px; border-radius: 18px;
    color: #060810; font-family: var(--f); font-size: .87rem;
    text-decoration: none; font-weight: 800; border: none; cursor: pointer;
    transition: all .3s var(--silk); letter-spacing: .01em;
    background: linear-gradient(135deg, rgba(var(--ba-rgb),1), rgba(var(--ba-rgb),.82));
    box-shadow: 0 10px 32px rgba(var(--ba-rgb),.42), 0 1px 0 rgba(255,255,255,.28) inset;
  }
  .lw-btn-primary:hover { transform: translateY(-3px) scale(1.02); filter: brightness(1.12); box-shadow: 0 18px 44px rgba(var(--ba-rgb),.52); }
  .lw-btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 24px; border-radius: 18px;
    background: rgba(255,255,255,.06); border: 1px solid var(--bdr3);
    color: var(--t1); font-family: var(--f); font-size: .87rem;
    text-decoration: none; font-weight: 600; cursor: pointer;
    transition: all .28s var(--silk);
  }
  .lw-btn-secondary:hover { background: rgba(255,255,255,.12); border-color: var(--bdr4); transform: translateY(-2px); }

  /* ── Books Bookshelf ── */
  .lw-bookshelf {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: clamp(1rem,2vw,1.6rem);
  }

  /* ── Book Card v13 ── */
  .lw-book-card {
    --ba: var(--gold);
    --ba-rgb: 201,168,76;
    position: relative; overflow: hidden;
    border-radius: 26px; cursor: pointer;
    border: 1px solid rgba(var(--ba-rgb),.18);
    background:
      linear-gradient(160deg, rgba(var(--ba-rgb),.1) 0%, transparent 45%),
      linear-gradient(180deg, rgba(255,255,255,.065) 0%, rgba(255,255,255,.015) 100%),
      #0A0E1E;
    transition: transform .35s var(--silk), box-shadow .35s, border-color .35s;
    display: flex; flex-direction: column;
  }
  .lw-book-card::before {
    content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px;
    background: linear-gradient(160deg, rgba(var(--ba-rgb),.5) 0%, transparent 52%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none; opacity: .3; transition: opacity .35s;
  }
  .lw-book-card:hover { transform: translateY(-14px) scale(1.02); border-color: rgba(var(--ba-rgb),.52); box-shadow: 0 48px 120px rgba(0,0,0,.58), 0 0 60px rgba(var(--ba-rgb),.22); }
  .lw-book-card:hover::before { opacity: .95; }
  .lw-book-card::after {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent);
    transform: translateX(-140%) skewX(-22deg);
    animation: lw-shine 7s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes lw-shine {
    0%,55%   { transform: translateX(-140%) skewX(-22deg); opacity: 0; }
    62%      { opacity: .6; }
    80%,100% { transform: translateX(140%) skewX(-22deg); opacity: 0; }
  }
  .lw-book-cover-wrap {
    position: relative; z-index: 1;
    display: flex; justify-content: center;
    padding: 1.6rem 1.2rem 1rem; min-height: 200px;
  }
  .lw-book-glow {
    position: absolute; inset: auto 10% 42% 10%; height: 72px;
    background: rgba(var(--ba-rgb),.4); filter: blur(38px); opacity: .5;
    pointer-events: none; z-index: 0; transition: opacity .35s;
  }
  .lw-book-card:hover .lw-book-glow { opacity: 1; }
  .lw-book-cover {
    position: relative; z-index: 1;
    width: min(125px,52vw); aspect-ratio: 3/4; object-fit: cover;
    border-radius: 15px;
    box-shadow: 0 28px 60px rgba(0,0,0,.6), -9px 0 20px rgba(0,0,0,.32), inset 0 0 0 1px rgba(255,255,255,.14);
    transform: rotateY(-15deg) rotateZ(-1.5deg);
    transition: transform .35s var(--silk), box-shadow .35s;
  }
  .lw-book-card:hover .lw-book-cover {
    transform: rotateY(-2deg) translateY(-7px) scale(1.05);
    box-shadow: 0 40px 80px rgba(0,0,0,.68), -9px 0 20px rgba(0,0,0,.32), inset 0 0 0 1px rgba(255,255,255,.18);
  }
  .lw-book-badge {
    position: absolute; z-index: 2; top: 14px; left: 14px;
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 11px; border-radius: 999px;
    color: var(--t0); background: rgba(4,6,14,.86);
    border: 1px solid rgba(var(--ba-rgb),.44);
    font-family: var(--f); font-size: .63rem; font-weight: 700;
    backdrop-filter: blur(16px);
  }
  .lw-book-body {
    position: relative; z-index: 1;
    padding: .5rem 1.2rem 1.6rem;
    display: flex; flex-direction: column; flex: 1;
  }
  .lw-book-genre { color: rgba(var(--ba-rgb),1); font-family: var(--f); font-size: .69rem; letter-spacing: .1em; text-transform: uppercase; font-weight: 800; }
  .lw-book-title { margin: .5rem 0 .65rem; color: var(--t0); font-family: var(--f); font-size: 1.06rem; line-height: 1.54; font-weight: 700; letter-spacing: -.015em; }
  .lw-book-desc { margin: 0; color: var(--t2); font-family: var(--f); font-size: .81rem; line-height: 1.94; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .lw-book-meta { display: flex; align-items: center; gap: 5px; margin-top: .85rem; color: var(--t3); font-family: var(--f); font-size: .71rem; }
  .lw-book-actions {
    display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
    margin-top: auto; padding-top: 1.1rem; position: relative; z-index: 2;
  }
  .lw-book-btn {
    min-height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 5px;
    border-radius: 13px; border: 1px solid var(--bdr2);
    font-family: var(--f); font-size: .79rem; text-decoration: none; cursor: pointer;
    transition: all .24s var(--silk); font-weight: 700; background: rgba(255,255,255,.04); color: var(--t2);
  }
  .lw-book-btn-accent {
    background: rgba(var(--ba-rgb),.18);
    color: var(--t0);
    border-color: rgba(var(--ba-rgb),.42);
  }
  .lw-book-btn:hover { transform: translateY(-2px); filter: brightness(1.15); box-shadow: 0 6px 20px rgba(0,0,0,.3); }

  /* ══════════════════════════════════════════════════
     QUOTE SPOTLIGHT — CINEMATIC ROTATING QUOTES
  ══════════════════════════════════════════════════ */
  .lw-quotes {
    position: relative; overflow: hidden;
    border-radius: clamp(22px,3.8vw,42px);
    margin-bottom: clamp(1.4rem,3.2vw,2.8rem);
    padding: clamp(2.5rem,5vw,4.5rem) clamp(2rem,4vw,3.5rem);
    background:
      radial-gradient(ellipse 80% 70% at 50% 50%, rgba(167,139,250,.08) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 10% 0%, rgba(201,168,76,.06) 0%, transparent 50%),
      linear-gradient(180deg, rgba(255,255,255,.055) 0%, rgba(255,255,255,.012) 100%),
      var(--surf1);
    border: 1px solid rgba(167,139,250,.14);
    box-shadow: 0 32px 100px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.06);
    text-align: center;
  }
  .lw-quotes::before {
    content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent 5%, rgba(167,139,250,.5), rgba(255,255,255,.28), rgba(167,139,250,.5), transparent 95%);
  }
  .lw-quotes-icon {
    width: 52px; height: 52px; border-radius: 50%;
    background: rgba(167,139,250,.1); border: 1px solid rgba(167,139,250,.22);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.8rem; color: #A78BFA;
    box-shadow: 0 0 32px rgba(167,139,250,.2);
  }
  .lw-quotes-text {
    font-family: var(--f); font-size: clamp(1.1rem,2.8vw,1.65rem);
    color: var(--t0); line-height: 1.85; font-weight: 500;
    max-width: 780px; margin: 0 auto 1.6rem;
    letter-spacing: -.01em;
  }
  .lw-quotes-cat {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 16px; border-radius: 999px;
    font-family: var(--f); font-size: .7rem; font-weight: 700;
    letter-spacing: .12em; text-transform: uppercase;
  }
  .lw-quotes-dots {
    display: flex; gap: 8px; justify-content: center; margin-top: 2rem;
  }
  .lw-quotes-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(255,255,255,.15); cursor: pointer;
    transition: all .28s var(--silk); border: none;
  }
  .lw-quotes-dot.active { background: #A78BFA; box-shadow: 0 0 12px rgba(167,139,250,.6); transform: scale(1.3); }

  /* ══════════════════════════════════════════════════
     WRITING TOOLS BAR — STICKY COMMAND CENTER
  ══════════════════════════════════════════════════ */
  .lw-tools {
    position: sticky; top: var(--site-nav-offset,98px); z-index: 15;
    display: grid; grid-template-columns: minmax(180px,320px) 1fr auto;
    gap: 10px; align-items: center;
    margin: 1.2rem 0; padding: 10px 14px;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,.09);
    background: rgba(8,10,18,.97);
    backdrop-filter: blur(32px) saturate(180%);
    box-shadow: 0 20px 60px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.07);
  }
  .lw-search {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,.055); border: 1px solid var(--bdr2);
    border-radius: 14px; padding: 0 14px; height: 42px;
    transition: border-color .22s, background .22s, box-shadow .22s;
  }
  .lw-search:focus-within {
    border-color: rgba(201,168,76,.45); background: rgba(201,168,76,.05);
    box-shadow: 0 0 0 3px rgba(201,168,76,.14);
  }
  .lw-search input {
    background: none; border: none; outline: none;
    color: var(--t1); font-family: var(--f); font-size: .86rem; width: 100%; min-height: 42px;
  }
  .lw-search input::placeholder { color: var(--t4); }
  .lw-cats { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
  .lw-cats::-webkit-scrollbar { display: none; }
  .lw-cat {
    display: flex; align-items: center; gap: 5px;
    padding: 7px 16px; border-radius: 999px;
    border: 1px solid var(--bdr2); background: rgba(255,255,255,.04);
    color: var(--t2); font-family: var(--f); font-size: .77rem;
    cursor: pointer; transition: all .24s var(--silk); white-space: nowrap; font-weight: 600;
  }
  .lw-cat:hover { border-color: var(--bdr3); color: var(--t1); background: rgba(255,255,255,.07); transform: translateY(-1px); }
  .lw-view {
    display: flex; gap: 3px; background: rgba(255,255,255,.04);
    border: 1px solid var(--bdr2); border-radius: 13px; padding: 3px;
  }
  .lw-vb {
    width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
    border-radius: 9px; border: none; background: transparent; color: var(--t3);
    cursor: pointer; transition: all .2s var(--silk);
  }
  .lw-vb.on { background: rgba(255,255,255,.12); color: var(--t0); box-shadow: 0 2px 8px rgba(0,0,0,.24); }
  .lw-vb:hover:not(.on) { color: var(--t2); background: rgba(255,255,255,.06); }

  .lw-results {
    display: flex; align-items: center; justify-content: space-between;
    gap: .8rem; margin-bottom: clamp(1rem,2vw,1.6rem);
    padding-bottom: .9rem; border-bottom: 1px solid var(--bdr1);
  }
  .lw-results-t { font-family: var(--f); font-size: .79rem; color: var(--t3); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .lw-clr {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 13px; border-radius: 999px;
    border: 1px solid var(--bdr2); background: rgba(255,255,255,.04);
    color: var(--t3); font-family: var(--f); font-size: .74rem; cursor: pointer;
    transition: all .2s var(--silk);
  }
  .lw-clr:hover { color: var(--t1); border-color: var(--bdr3); background: rgba(255,255,255,.07); }

  /* ══════════════════════════════════════════════════
     WRITING CARDS v13 — EDITORIAL MOOD CARDS
  ══════════════════════════════════════════════════ */
  .lw-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: clamp(10px,1.6vw,16px); }
  .lw-grid-l { display: flex; flex-direction: column; gap: 8px; }

  .lw-card {
    position: relative; overflow: hidden;
    background: linear-gradient(175deg, rgba(255,255,255,.054) 0%, rgba(255,255,255,.014) 100%), var(--surf2);
    border: 1px solid var(--bdr1); border-radius: 24px;
    cursor: pointer; min-height: 240px;
    transition: transform .3s var(--silk), box-shadow .3s, border-color .3s;
    animation: lw-fadeup .4s var(--ease) both;
  }
  /* Mood accent left bar */
  .lw-card::before {
    content: ""; position: absolute; left: 0; top: 10%; bottom: 10%;
    width: 3px; border-radius: 0 4px 4px 0;
    background: var(--ca, var(--gold)); opacity: 0; transition: opacity .3s;
  }
  .lw-card:hover::before { opacity: 1; }
  /* Top shimmer line */
  .lw-card-shimmer {
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--ca, var(--gold)), transparent);
    opacity: 0; transition: opacity .3s;
  }
  .lw-card:hover .lw-card-shimmer { opacity: .5; }
  /* Ambient glow */
  .lw-card-glow {
    position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
    width: 150px; height: 110px; border-radius: 50%;
    background: var(--cg, rgba(201,168,76,.14)); filter: blur(40px);
    opacity: 0; transition: opacity .4s; pointer-events: none;
  }
  .lw-card:hover .lw-card-glow { opacity: 1; }
  .lw-card:hover {
    transform: translateY(-7px);
    border-color: rgba(var(--ca-rgb, 201,168,76), .32);
    box-shadow: 0 28px 70px rgba(0,0,0,.46), 0 0 36px rgba(var(--ca-rgb, 201,168,76), .14);
  }
  .lw-card-body { height: 100%; display: flex; flex-direction: column; padding: clamp(1.2rem,2.4vw,1.6rem); }
  .lw-card-tags { display: flex; align-items: center; gap: 7px; margin-bottom: .9rem; flex-wrap: wrap; }
  .lw-card-cat {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 12px; border-radius: 999px; font-family: var(--f); font-size: .71rem;
    background: var(--cbg, rgba(201,168,76,.08)); color: var(--ca, var(--gold));
    border: 1px solid var(--cbdr, rgba(201,168,76,.22));
    transition: background .22s; font-weight: 800;
  }
  .lw-card:hover .lw-card-cat { background: var(--cbadge, rgba(201,168,76,.15)); }
  .lw-card-star {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 999px; font-family: var(--f); font-size: .64rem;
    background: rgba(251,191,36,.08); color: #FBBF24; border: 1px solid rgba(251,191,36,.22);
  }
  .lw-card-title {
    font-family: var(--f); font-size: clamp(1.02rem,2.3vw,1.2rem);
    color: var(--t0); line-height: 1.64; margin-bottom: .9rem;
    font-weight: 700; letter-spacing: -.016em;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .lw-card-preview {
    font-family: var(--f); font-size: .87rem; color: var(--t2); line-height: 2.08;
    display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
    margin-bottom: .95rem;
  }
  .lw-card-short .lw-card-preview { -webkit-line-clamp: 7; font-size: .89rem; }
  .lw-card-short { min-height: 200px; }
  .lw-card-foot {
    display: flex; align-items: center; justify-content: space-between;
    gap: .6rem; margin-top: auto; padding-top: .95rem; border-top: 1px solid var(--bdr1);
  }
  .lw-card-date { display: flex; align-items: center; gap: 4px; font-family: var(--f); font-size: .71rem; color: var(--t3); }
  .lw-card-actions { display: flex; align-items: center; gap: 8px; }
  .lw-card-like {
    background: none; border: none; cursor: pointer; padding: 2px 4px;
    font-size: .86rem; transition: transform .15s, opacity .15s;
    opacity: .38;
  }
  .lw-card-like.liked { opacity: 1; transform: scale(1.26); }
  .lw-card-share { background: none; border: none; cursor: pointer; padding: 2px 4px; opacity: .32; transition: opacity .15s; color: var(--t2); display: flex; }
  .lw-card-share:hover { opacity: .7; }
  .lw-card-read {
    display: flex; align-items: center; gap: 5px;
    color: var(--ca, var(--gold)); font-family: var(--f); font-size: .77rem; font-weight: 800;
    background: none; border: none; cursor: pointer; padding: 0;
    transition: gap .22s var(--silk);
  }
  .lw-card:hover .lw-card-read { gap: 9px; }

  /* List mode */
  .lw-card-l { min-height: 0; border-radius: 18px; }
  .lw-card-l .lw-card-body { flex-direction: row; align-items: center; gap: 1.1rem; padding: .95rem 1.3rem; }
  .lw-card-l .lw-card-title { font-size: .95rem; margin-bottom: .28rem; -webkit-line-clamp: 1; }
  .lw-card-l .lw-card-preview { display: none; }
  .lw-card-l .lw-card-tags { margin-bottom: 0; }
  .lw-card-l .lw-card-foot { border: none; padding: 0; margin-left: auto; }

  /* Empty */
  .lw-empty { text-align: center; padding: 5rem 2rem; color: var(--t3); font-family: var(--f); }

  /* Section divider */
  .lw-divider { display: flex; align-items: center; gap: 10px; margin: .4rem 0 1.2rem; }
  .lw-divider-label { font-family: var(--f); font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; white-space: nowrap; }
  .lw-divider-line { flex: 1; height: 1px; }
  .lw-divider-count { font-family: var(--f); font-size: .66rem; color: var(--t4); white-space: nowrap; }

  /* Load more */
  .lw-more { margin: clamp(1.5rem,2.8vw,2.2rem) auto 0; display: flex; flex-direction: column; align-items: center; gap: .75rem; }
  .lw-more-btn {
    display: inline-flex; align-items: center; gap: 9px;
    padding: 14px 32px; border-radius: 999px;
    border: 1px solid rgba(201,168,76,.3);
    background: linear-gradient(135deg, rgba(201,168,76,.12), rgba(255,255,255,.04));
    color: var(--gold); font-family: var(--f); font-size: .86rem;
    cursor: pointer; transition: all .28s var(--silk); font-weight: 800;
  }
  .lw-more-btn:hover {
    transform: translateY(-3px);
    border-color: rgba(201,168,76,.55);
    background: linear-gradient(135deg, rgba(201,168,76,.22), rgba(255,255,255,.06));
    box-shadow: 0 12px 36px rgba(201,168,76,.2);
  }
  .lw-more-note { font-family: var(--f); font-size: .72rem; color: var(--t4); }

  /* ══════════════════════════════════════════════════
     CTA SECTION — READING INVITATION
  ══════════════════════════════════════════════════ */
  .lw-cta {
    position: relative; overflow: hidden;
    border-radius: clamp(22px,3.8vw,42px);
    margin-bottom: clamp(1.4rem,3.2vw,2.8rem);
    padding: clamp(2.5rem,5vw,4rem) clamp(2rem,4vw,3.5rem);
    background:
      radial-gradient(ellipse 80% 70% at 50% 0%, rgba(201,168,76,.22) 0%, transparent 55%),
      radial-gradient(ellipse 50% 45% at 0% 100%, rgba(96,165,250,.1) 0%, transparent 48%),
      linear-gradient(160deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,.015) 100%),
      #0A0E1E;
    border: 1px solid rgba(201,168,76,.18);
    box-shadow: 0 32px 100px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.08);
    text-align: center;
  }
  .lw-cta::before {
    content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent 5%, rgba(201,168,76,.7), rgba(255,255,255,.4), rgba(201,168,76,.7), transparent 95%);
  }
  .lw-cta-icon {
    width: 60px; height: 60px; border-radius: 50%;
    background: rgba(201,168,76,.1); border: 1px solid rgba(201,168,76,.24);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.6rem; color: var(--gold);
    box-shadow: 0 0 36px rgba(201,168,76,.2);
  }
  .lw-cta h2 {
    font-family: var(--f); font-size: clamp(1.4rem,3.5vw,2.4rem);
    color: var(--t0); font-weight: 700; letter-spacing: -.03em;
    margin: 0 0 .9rem; line-height: 1.3;
  }
  .lw-cta p {
    font-family: var(--f); font-size: clamp(.9rem,2vw,1.05rem);
    color: var(--t2); line-height: 2.0; max-width: 560px; margin: 0 auto 2rem;
  }
  .lw-cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

  /* ══════════════════════════════════════════════════
     IMMERSIVE READER MODAL v13
  ══════════════════════════════════════════════════ */
  .lw-rm {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(2,3,9,.92); backdrop-filter: blur(24px) saturate(160%);
    display: flex; align-items: flex-end; justify-content: center;
  }
  .lw-rm-box {
    width: 100%; max-width: 860px; max-height: 95vh;
    border-radius: 32px 32px 0 0; overflow: hidden;
    display: flex; flex-direction: column;
    box-shadow: 0 -52px 150px rgba(0,0,0,.88), 0 -1px 0 rgba(255,255,255,.1);
  }
  .lw-rm-handle { width: 44px; height: 4px; border-radius: 999px; margin: 13px auto 0; flex-shrink: 0; }
  .lw-rm-prog { height: 2px; flex-shrink: 0; margin-top: 11px; background: rgba(255,255,255,.05); }
  .lw-rm-pf { height: 100%; border-radius: 999px; transition: width .1s linear; }
  .lw-rm-hd {
    display: flex; align-items: center; justify-content: space-between;
    padding: .95rem 1.7rem; border-bottom: 1px solid; flex-shrink: 0; gap: 10px; flex-wrap: wrap;
  }
  .lw-rm-hdl { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .lw-rm-ctrl { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .lw-rm-btn {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 11px; border: 1px solid;
    background: none; cursor: pointer; transition: all .2s var(--silk);
  }
  .lw-rm-btn:hover { opacity: .8; transform: scale(1.06); }
  .lw-rm-fc { display: flex; border-radius: 11px; border: 1px solid; overflow: hidden; }
  .lw-rm-fb {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; background: none; border: none; cursor: pointer; transition: background .15s;
  }
  .lw-rm-fb:hover { background: rgba(255,255,255,.07); }
  .lw-rm-th {
    display: flex; align-items: center; gap: 5px; padding: 0 13px; height: 36px;
    border-radius: 11px; border: 1px solid; background: none; cursor: pointer;
    font-family: var(--f); font-size: .7rem; transition: all .2s; font-weight: 700;
  }
  .lw-rm-th:hover { opacity: .78; }
  .lw-rm-body {
    flex: 1; overflow-y: auto;
    padding: clamp(2rem,5.5vw,4rem) clamp(1.6rem,6.5vw,5.5rem);
    scroll-behavior: smooth;
  }
  .lw-rm-body::-webkit-scrollbar { width: 4px; }
  .lw-rm-body::-webkit-scrollbar-track { background: transparent; }
  .lw-rm-body::-webkit-scrollbar-thumb { background: rgba(201,168,76,.28); border-radius: 999px; }
  .lw-rm-ttl { font-family: var(--f); font-size: clamp(1.7rem,5.2vw,2.7rem); line-height: 1.44; margin-bottom: 2.2rem; font-weight: 700; letter-spacing: -.024em; }
  .lw-rm-txt { font-family: var(--f); line-height: 2.42; white-space: pre-wrap; word-break: break-word; font-size: 1.1rem; letter-spacing: .01em; }
  .lw-rm-txt p { margin-bottom: 2.1rem; line-height: inherit; font-size: inherit; }
  .lw-rm-sig { margin-top: 3.8rem; padding-top: 2.2rem; border-top: 1px solid; font-family: var(--f); font-size: .9rem; opacity: .5; font-style: italic; letter-spacing: .02em; }
  .lw-rm-nav { display: flex; border-top: 1px solid; flex-shrink: 0; }
  .lw-rm-nb {
    flex: 1; display: flex; align-items: center; gap: 10px;
    padding: 1.2rem 1.7rem; background: none; border: none; cursor: pointer; transition: background .2s;
  }
  .lw-rm-nb:hover { background: rgba(255,255,255,.04); }
  .lw-rm-nb:disabled { opacity: .3; cursor: default; }
  .lw-rm-nb:disabled:hover { background: none; }
  .lw-rm-nb + .lw-rm-nb { border-left: 1px solid; }
  .lw-rm-nl { display: block; font-family: var(--f); font-size: .64rem; margin-bottom: 3px; letter-spacing: .08em; text-transform: uppercase; }
  .lw-rm-nt { display: block; font-family: var(--f); font-size: .84rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; font-weight: 700; }
  .lw-rm-sdd { position: absolute; top: calc(100% + 8px); right: 0; background: #0A0E1E; border: 1px solid rgba(255,255,255,.12); border-radius: 15px; overflow: hidden; min-width: 195px; box-shadow: 0 20px 60px rgba(0,0,0,.65); z-index: 10; }
  .lw-rm-si { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 17px; background: none; border: none; cursor: pointer; font-family: var(--f); font-size: .83rem; transition: background .15s; }
  .lw-rm-si:hover { background: rgba(255,255,255,.07); }

  /* ── BOOK MODAL ── */
  .lw-bm { position: fixed; inset: 0; z-index: 9999; background: rgba(1,2,7,.92); backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .lw-bm-box { width: 100%; max-width: 760px; max-height: 92vh; border-radius: 32px; background: #0A0F20; border: 1px solid rgba(255,255,255,.12); overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 60px 160px rgba(0,0,0,.85), inset 0 1px 0 rgba(255,255,255,.09); }
  .lw-bm-hd { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 1.7rem; border-bottom: 1px solid rgba(255,255,255,.07); flex-shrink: 0; }
  .lw-bm-in { display: flex; gap: clamp(1.4rem,3.2vw,2.6rem); padding: clamp(1.5rem,3.2vw,2.6rem); overflow-y: auto; align-items: flex-start; }
  .lw-bm-in::-webkit-scrollbar { width: 4px; }
  .lw-bm-in::-webkit-scrollbar-thumb { background: rgba(201,168,76,.22); border-radius: 999px; }
  .lw-bm-cw { flex-shrink: 0; }
  .lw-bm-cv { width: clamp(130px,22vw,180px); height: auto; border-radius: 16px; box-shadow: 0 24px 70px rgba(0,0,0,.65), inset 0 0 0 1px rgba(255,255,255,.12); display: block; }
  .lw-bm-cnt { flex: 1; min-width: 0; }

  /* ── ANIMATIONS ── */
  @keyframes lw-fadeup { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes lw-shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }

  /* ── SKELETON ── */
  .lw-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.09) 40%, rgba(255,255,255,.04) 80%);
    background-size: 600px 100%; animation: lw-shimmer 1.6s ease-in-out infinite; border-radius: 8px;
  }
  .lw-sk-card { border-radius: 24px; border: 1px solid rgba(255,255,255,.05); background: rgba(9,12,24,.75); min-height: 240px; padding: 1.4rem; display: flex; flex-direction: column; gap: .95rem; }
  .lw-sk-tag  { height: 22px; width: 80px; }
  .lw-sk-ttl  { height: 20px; width: 74%; }
  .lw-sk-ttl2 { height: 20px; width: 54%; margin-top: -5px; }
  .lw-sk-line { height: 13px; }
  .lw-sk-l2   { height: 13px; width: 84%; }
  .lw-sk-l3   { height: 13px; width: 64%; }
  .lw-sk-foot { height: 13px; width: 38%; margin-top: auto; }

  /* ── SCROLLBAR & SELECTION ── */
  * { scrollbar-width: thin; scrollbar-color: rgba(201,168,76,.22) transparent; }
  ::selection { background: rgba(201,168,76,.28); color: var(--t0); }

  /* ── ACCESSIBILITY ── */
  .lw-book-card, .lw-card, .lw-cat, .lw-vb, .lw-more-btn { outline: none; }
  .lw-book-card:focus-visible, .lw-card:focus-visible, .lw-cat:focus-visible, .lw-more-btn:focus-visible { box-shadow: 0 0 0 3px rgba(201,168,76,.36), 0 0 0 1px rgba(242,237,228,.14) inset; }

  /* ── TOUCH ── */
  @media (hover: none) {
    .lw-card:active { transform: scale(.97); }
    .lw-book-card:active { transform: scale(.97); }
    .lw-cat:active { transform: scale(.94); }
    .lw-more-btn:active { transform: scale(.97); }
  }

  /* ── SAFE AREA ── */
  @supports (padding: env(safe-area-inset-bottom)) {
    .lw-rm-box { padding-bottom: env(safe-area-inset-bottom); }
  }

  /* ══════════════════════════════════════════════════
     RESPONSIVE
  ══════════════════════════════════════════════════ */
  @media (max-width: 1024px) {
    .lw-hero-inner { grid-template-columns: 1fr; }
    .lw-hero-showcase { min-height: 280px; max-width: 500px; margin: 0 auto; }
    .lw-hero-calligraphy { font-size: 18rem; opacity: .03; }
  }
  @media (max-width: 980px) {
    .lw-panel-head { flex-direction: column; }
    .lw-featured-inner { grid-template-columns: auto 1fr; }
  }
  @media (max-width: 768px) {
    .lw-cats { display: flex; }
    .lw-grid { grid-template-columns: 1fr; }
    .lw-results { align-items: flex-start; flex-direction: column; }
    .lw-hero, .lw-panel, .lw-quotes, .lw-cta { border-radius: 24px; }
    /* Tools bar: stack vertically on mobile */
    .lw-tools {
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
      border-radius: 20px;
    }
    .lw-search { grid-column: 1; grid-row: 1; }
    .lw-cats { grid-column: 1 / -1; grid-row: 2; }
    .lw-view { grid-column: 2; grid-row: 1; }
    .lw-bm-in { flex-direction: column; }
    .lw-bm-cv { width: clamp(105px,38vw,150px); }
    .lw-rm-nt { max-width: 140px; }
    .lw-featured-inner { grid-template-columns: 1fr; text-align: center; }
    .lw-featured-cover-wrap { display: flex; justify-content: center; }
    .lw-featured-actions { justify-content: center; }
    .lw-bookshelf { grid-template-columns: repeat(2, 1fr); }
    .lw-hero-calligraphy { display: none; }
    /* Hero showcase hidden on mobile — saves vertical space */
    .lw-hero-showcase { display: none; }
    /* Stats row wraps nicely */
    .lw-hero-stats { display: grid; grid-template-columns: repeat(2,1fr); gap: .6rem; }
    .lw-hero-stat { min-width: 0; }
  }
  @media (max-width: 480px) {
    .lw-hero-h1 { font-size: clamp(2rem,11vw,2.8rem); line-height: 1.08; }
    .lw-hero-sub { font-size: .9rem; line-height: 1.82; }
    .lw-hero { padding: 1.4rem 1.2rem; margin-bottom: 1rem; }
    .lw-hero-inner { gap: 1.2rem; }
    .lw-panel, .lw-quotes, .lw-cta { padding: 1.1rem; margin-bottom: 1.2rem; }
    .lw-panel-head h2 { font-size: 1.35rem; }
    .lw-panel-head p { font-size: .82rem; }
    .lw-panel-head { flex-direction: column; gap: .8rem; }
    .lw-featured-inner { padding: 1.1rem; }
    .lw-featured-cover { width: min(145px,52vw); }
    .lw-featured-actions { flex-direction: column; }
    .lw-featured-actions > * { width: 100%; justify-content: center; }
    .lw-bookshelf { grid-template-columns: repeat(2,1fr); gap: .8rem; }
    .lw-book-cover { width: 100%; max-width: 130px; }
    .lw-book-card { padding: .9rem .8rem; }
    .lw-book-title { font-size: .9rem; -webkit-line-clamp: 2; }
    .lw-book-meta { font-size: .68rem; }
    .lw-book-actions { flex-direction: column; gap: 6px; }
    .lw-book-actions > * { width: 100%; justify-content: center; }
    /* Tools bar full-width on small screens */
    .lw-tools {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      position: relative; top: auto;
      padding: 10px 12px;
      margin: .6rem 0 1.2rem;
      gap: 8px;
    }
    .lw-search { grid-column: 1; grid-row: 1; height: 46px; }
    .lw-cats { grid-column: 1; grid-row: 2; }
    .lw-view { grid-column: 1; grid-row: 3; justify-self: start; }
    .lw-card { min-height: 192px; }
    .lw-rm-box { border-radius: 24px 24px 0 0; }
    .lw-rm-body { padding: 1.9rem 1.5rem; }
    .lw-rm-ttl { font-size: 1.76rem; margin-bottom: 1.7rem; }
    .lw-rm-txt { font-size: 1.06rem; line-height: 2.25; }
    .lw-card-l .lw-card-body { flex-direction: column; align-items: flex-start; gap: .8rem; }
    .lw-card-l .lw-card-foot { width: 100%; margin-left: 0; justify-content: space-between; }
    .lw-hero-stats { grid-template-columns: repeat(2,1fr); gap: .5rem; }
    .lw-hero-stat { padding: 10px 12px; }
    .lw-hero-stat-n { font-size: 1.25rem; }
    .lw-hero-stat-l { font-size: .65rem; }
    .lw-cat { padding: 8px 14px; font-size: .79rem; min-height: 40px; }
    .lw-search input { font-size: .9rem; }
    .lw-vb { width: 36px; height: 36px; }
    .lw-more-btn { padding: 14px 32px; font-size: .9rem; min-height: 52px; }
    .lw-card-foot { padding-top: .95rem; }
    .lw-book-actions > * { min-height: 44px; font-size: .84rem; }
    .lw-featured-actions > * { min-height: 50px; font-size: .88rem; }
    .lw-quotes-text { font-size: 1rem; }
    .lw-cta-actions { flex-direction: column; align-items: center; }
    /* Quote section mobile */
    .lw-quotes { padding: 1.4rem 1.1rem; }
    .lw-quotes-text { font-size: .98rem; line-height: 1.9; }
    /* Ticker hidden on very small screens */
    .lw-ticker { display: none; }
    .lw-cta-actions > * { width: 100%; max-width: 280px; justify-content: center; }
  }
  @media (max-width: 360px) {
    .lw-wrap { padding: .9rem .75rem; }
    .lw-hero { padding: 1rem; }
    .lw-panel, .lw-quotes, .lw-cta { padding: .85rem; }
    .lw-grid { grid-template-columns: 1fr; }
    .lw-bookshelf { grid-template-columns: 1fr; }
    .lw-tools { padding: 8px; gap: 7px; }
  }
`;

// ── Writing Card ──────────────────────────────────────────────────────────────
function WritingCard({ writing, index, onClick, viewMode = "grid" }: {
  writing: Writing; index: number; onClick: () => void; viewMode?: "grid"|"list";
}) {
  const c = getCatStyle(writing.category);
  const isShort = writing.category === "ছোট লেখা";
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
        .catch(() => { navigator.clipboard.writeText(shareUrl); });
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`lw-card${isL ? " lw-card-l" : ""}${isShort ? " lw-card-short" : ""}`}
      style={{
        "--ca": c.accent, "--cg": c.glow, "--cbg": c.bg,
        "--cbadge": c.badge, "--cbdr": c.border,
        "--ca-rgb": c.rgb,
        animationDelay: `${index * 0.04}s`,
      } as React.CSSProperties}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: .44, delay: index * 0.03, ease: [.25,.46,.45,.94] }}
      onClick={onClick}
      role="article" tabIndex={0}
      aria-label={`${writing.title} পড়ুন`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      whileTap={{ scale: .97 }}
    >
      <div className="lw-card-shimmer"/>
      <div className="lw-card-glow"/>
      <div className="lw-card-body">
        {isL ? (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="lw-card-tags">
                {!isShort && <span className="lw-card-cat"><span style={{ fontSize: ".76rem" }}>{c.icon}</span>{writing.category}</span>}
                {writing.featured && <span className="lw-card-star"><Star size={9} fill="currentColor"/> বিশেষ</span>}
              </div>
              <div className="lw-card-title">{writing.title}</div>
            </div>
            <div className="lw-card-foot" style={{ border: "none", padding: 0 }}>
              <span className="lw-card-date"><Calendar size={10}/>{writing.date}</span>
              <div className="lw-card-actions">
                <button onClick={handleLike} className={`lw-card-like${liked ? " liked" : ""}`} title="ভালো লেগেছে">{liked ? "❤️" : "🤍"}</button>
                <button onClick={handleShare} className="lw-card-share" title="শেয়ার"><Share2 size={11}/></button>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }} className="lw-card-read" aria-label={`${writing.title} পড়ুন`}>
                  পড়ুন <ArrowRight size={11}/>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="lw-card-tags">
              {!isShort && <span className="lw-card-cat"><span style={{ fontSize: ".76rem" }}>{c.icon}</span>{writing.category}</span>}
              {writing.featured && <span className="lw-card-star"><Star size={9} fill="currentColor"/> বিশেষ</span>}
            </div>
            <div className="lw-card-title">{writing.title}</div>
            <p className="lw-card-preview">{makeExcerpt(writing.content, 200)}</p>
            <div className="lw-card-foot">
              <span className="lw-card-date"><Calendar size={10}/>{writing.date}</span>
              <div className="lw-card-actions">
                <button onClick={handleLike} className={`lw-card-like${liked ? " liked" : ""}`} title="ভালো লেগেছে">{liked ? "❤️" : "🤍"}</button>
                <button onClick={handleShare} className="lw-card-share" title="শেয়ার"><Share2 size={11}/></button>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }} className="lw-card-read" aria-label={`${writing.title} পড়ুন`}>
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

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1800;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Quote Spotlight ───────────────────────────────────────────────────────────
function QuoteSpotlight() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    const interval = setInterval(() => {
      setActive(a => (a + 1) % FEATURED_QUOTES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const q = FEATURED_QUOTES[active];

  return (
    <motion.div
      ref={ref}
      className="lw-quotes"
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: .55, ease: [.25,.46,.45,.94] }}
    >
      <div className="lw-quotes-icon">
        <Quote size={22}/>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={active}
          className="lw-quotes-text"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: .4, ease: [.25,.46,.45,.94] }}
        >
          "{q.text}"
        </motion.p>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={active + "-cat"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: .3 }}
        >
          <span
            className="lw-quotes-cat"
            style={{
              background: `${q.color}14`,
              border: `1px solid ${q.color}28`,
              color: q.color,
            }}
          >
            — মাহবুব সরদার সবুজ · {q.cat}
          </span>
        </motion.div>
      </AnimatePresence>

      <div className="lw-quotes-dots">
        {FEATURED_QUOTES.map((_, i) => (
          <button
            key={i}
            className={`lw-quotes-dot${i === active ? " active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`Quote ${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── CTA Section ───────────────────────────────────────────────────────────────
function ReadingCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="lw-cta"
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: .55, ease: [.25,.46,.45,.94] }}
    >
      <div className="lw-cta-icon">
        <Feather size={26}/>
      </div>
      <h2>আরো পড়তে চান?</h2>
      <p>
        মাহবুব সরদার সবুজের আবৃত্তি শুনুন, নতুন লেখার আপডেট পান এবং সরদার সংবাদে যুক্ত থাকুন।
      </p>
      <div className="lw-cta-actions">
        <Link
          href="/facebook-recitations"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "13px 28px", borderRadius: 18,
            background: "linear-gradient(135deg, #C9A84C, #A07830)",
            color: "#060810", fontFamily: "var(--f)", fontSize: ".88rem",
            textDecoration: "none", fontWeight: 800,
            boxShadow: "0 10px 32px rgba(201,168,76,.38)",
            transition: "all .28s cubic-bezier(.16,1,.3,1)",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 18px 44px rgba(201,168,76,.48)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = ""; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 10px 32px rgba(201,168,76,.38)"; }}
        >
          <Eye size={15}/> আবৃত্তি দেখুন
        </Link>
        <Link
          href="/news"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 26px", borderRadius: 18,
            background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.16)",
            color: "rgba(242,237,228,.88)", fontFamily: "var(--f)", fontSize: ".88rem",
            textDecoration: "none", fontWeight: 600,
            transition: "all .28s cubic-bezier(.16,1,.3,1)",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,.12)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,.06)"; (e.currentTarget as HTMLAnchorElement).style.transform = ""; }}
        >
          <TrendingUp size={15}/> সরদার সংবাদ
        </Link>
      </div>
    </motion.div>
  );
}

// ── Writing Modal ─────────────────────────────────────────────────────────────
function WritingModal({ writing, allWritings, onClose, onNavigate }: {
  writing: Writing; allWritings: Writing[]; onClose: () => void; onNavigate: (w: Writing) => void;
}) {
  const c = getCatStyle(writing.category);
  const isShort = writing.category === "ছোট লেখা";
  const [fontSize, setFontSize] = useState(1.1);
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
  const related = allWritings.filter(w => w.id !== writing.id && w.category === writing.category).slice(0, 3);

  const T = {
    dark:  { bg:"#040810", txt:"#EDE8DE", sub:"rgba(237,232,222,.55)", bdr:"rgba(255,255,255,.09)", hnd:"rgba(255,255,255,.16)", prog:c.accent, card:"rgba(255,255,255,.04)" },
    sepia: { bg:"#1A1208", txt:"#E8D8A8", sub:"rgba(232,216,168,.58)", bdr:"rgba(232,216,168,.14)", hnd:"rgba(232,216,168,.26)", prog:"#D4A84C", card:"rgba(232,216,168,.05)" },
    light: { bg:"#FDFAF6", txt:"#1C1814", sub:"rgba(28,24,20,.52)", bdr:"rgba(28,24,20,.12)", hnd:"rgba(28,24,20,.18)", prog:c.accent, card:"rgba(28,24,20,.04)" },
  }[theme];

  useEffect(() => {
    const el = bodyRef.current; if (!el) return;
    const fn = () => {
      const p = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setProgress(isNaN(p) ? 0 : Math.min(1, p) * 100);
    };
    el.addEventListener("scroll", fn); return () => el.removeEventListener("scroll", fn);
  }, [writing]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && prev) onNavigate(prev);
      if (e.key === "ArrowRight" && next) onNavigate(next);
    };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [prev, next, onClose, onNavigate]);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShowShare(false); };
    document.addEventListener("mousedown", fn); return () => document.removeEventListener("mousedown", fn);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(writingUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
      .catch(() => { const el = document.createElement('textarea'); el.value = writingUrl; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); setCopied(true); setTimeout(() => setCopied(false), 2000); });
    setShowShare(false);
  };

  return createPortal(
    <motion.div className="lw-rm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .28 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="lw-rm-box" style={{ background: T.bg }}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 36, stiffness: 310 }}>
        <div className="lw-rm-handle" style={{ background: T.hnd }}/>
        <div className="lw-rm-prog"><div className="lw-rm-pf" style={{ width: `${progress}%`, background: T.prog }}/></div>
        <div className="lw-rm-hd" style={{ borderColor: T.bdr }}>
          <div className="lw-rm-hdl">
            <span style={{ fontFamily:"var(--f)", fontSize:".72rem", color:T.sub, fontWeight:500 }}>লেখালেখি ও বই</span>
          </div>
          <div className="lw-rm-ctrl">
            <div className="lw-rm-fc" style={{ borderColor: T.bdr }}>
              <button className="lw-rm-fb" style={{ color: T.sub }} onClick={() => setFontSize(f => Math.max(.82, f - .1))}><AArrowDown size={13}/></button>
              <button className="lw-rm-fb" style={{ color: T.sub, borderLeft: `1px solid ${T.bdr}` }} onClick={() => setFontSize(f => Math.min(1.4, f + .1))}><AArrowUp size={13}/></button>
            </div>
            <button className="lw-rm-th" style={{ color: T.sub, borderColor: T.bdr }} onClick={() => setTheme(t => t === "dark" ? "sepia" : t === "sepia" ? "light" : "dark")}>
              {theme === "dark" ? <Moon size={12}/> : theme === "sepia" ? <Scroll size={12}/> : <Sun size={12}/>}
              <span style={{ fontSize:".69rem" }}>{theme === "dark" ? "ডার্ক" : theme === "sepia" ? "সেপিয়া" : "লাইট"}</span>
            </button>
            <div style={{ position:"relative" }} ref={shareRef}>
              <button className="lw-rm-btn" style={{ color: T.sub, borderColor: T.bdr }} onClick={() => setShowShare(s => !s)}><Share2 size={13}/></button>
              {showShare && (
                <div className="lw-rm-sdd">
                  <button className="lw-rm-si" style={{ color:"#F2EDE4" }} onClick={() => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(writingUrl)}`,"_blank"); setShowShare(false); }}><Facebook size={14} color="#1877F2"/> Facebook</button>
                  <button className="lw-rm-si" style={{ color:"#F2EDE4" }} onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(writing.title+' — '+writingUrl)}`,"_blank"); setShowShare(false); }}><span style={{ fontSize:14 }}>💬</span> WhatsApp</button>
                  <button className="lw-rm-si" style={{ color:"#F2EDE4" }} onClick={copyLink}>{copied ? <Check size={14} color="#34D399"/> : <Copy size={14}/>}{copied ? "কপি হয়েছে!" : "লিংক কপি"}</button>
                </div>
              )}
            </div>
            <button className="lw-rm-btn" style={{ color: T.sub, borderColor: T.bdr }} onClick={onClose}><X size={14}/></button>
          </div>
        </div>

        <div className="lw-rm-body" ref={bodyRef}>
          <div style={{ marginBottom: "2.4rem", paddingBottom: "1.8rem", borderBottom: `1px solid ${T.bdr}` }}>
            {!isShort && (
              <div style={{ marginBottom: "1rem" }}>
                <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 14px", borderRadius:999, background:c.bg, color:c.accent, border:`1px solid ${c.border}`, fontFamily:"var(--f)", fontSize:".7rem", fontWeight:800, letterSpacing:".07em", textTransform:"uppercase" }}>
                  <span>{c.icon}</span>{writing.category}
                </span>
              </div>
            )}
            <h1 className="lw-rm-ttl" style={{ color: T.txt }}>
              {writing.title}
            </h1>
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:"0.5rem 1.2rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg, ${c.accent}28, ${c.accent}10)`, border:`1.5px solid ${c.accent}38`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Feather size={13} color={c.accent}/>
                </div>
                <div>
                  <div style={{ fontFamily:"var(--f)", fontSize:".82rem", color:T.txt, fontWeight:700, lineHeight:1.2 }}>মাহবুব সরদার সবুজ</div>
                  <div style={{ fontFamily:"var(--f)", fontSize:".67rem", color:T.sub, lineHeight:1.2 }}>লেখক ও কবি</div>
                </div>
              </div>
              <span style={{ color:T.bdr, fontSize:".8rem" }}>·</span>
              <span style={{ fontFamily:"var(--f)", fontSize:".74rem", color:T.sub }}>{writing.date}</span>
              <span style={{ color:T.bdr, fontSize:".8rem" }}>·</span>
              <span style={{ fontFamily:"var(--f)", fontSize:".74rem", color:T.sub, display:"flex", alignItems:"center", gap:4 }}>⏱ {readTimeLabel} পড়তে লাগবে</span>
            </div>
          </div>

          <div className="lw-rm-txt" style={{ color: T.txt, fontSize: `${fontSize}rem` }}>
            {writing.content.split(/\n\n+/).map((para, i) => (
              para.trim() ? <p key={i}>{para.trim()}</p> : null
            ))}
          </div>

          <div className="lw-rm-sig" style={{ borderColor: T.bdr, color: T.txt }}>
            <span style={{ color:c.accent, marginRight:6 }}>{c.icon}</span>
            মাহবুব সরদার সবুজ
            <span style={{ margin:"0 8px", opacity:.4 }}>·</span>
            {writing.category}
            <span style={{ margin:"0 8px", opacity:.4 }}>·</span>
            {writing.date}
          </div>

          {related.length > 0 && (
            <div style={{ marginTop:"2.6rem", paddingTop:"2rem", borderTop:`1px solid ${T.bdr}` }}>
              <p style={{ color:T.sub, fontSize:".71rem", fontFamily:"var(--f)", letterSpacing:".13em", textTransform:"uppercase", marginBottom:"1.1rem", fontWeight:800 }}>সম্পর্কিত লেখা</p>
              <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
                {related.map(rw => (
                  <button key={rw.id} onClick={() => onNavigate(rw)}
                    style={{ textAlign:"left", padding:".8rem 1.2rem", borderRadius:14, background:T.card, border:`1px solid ${T.bdr}`, color:T.txt, cursor:"pointer", fontSize:".86rem", fontFamily:"var(--f)", lineHeight:1.5, transition:"background .15s, border-color .15s" }}
                    onMouseEnter={e => { (e.currentTarget.style.background="rgba(255,255,255,.08)"); }}
                    onMouseLeave={e => { (e.currentTarget.style.background=T.card); }}>
                    {rw.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lw-rm-nav" style={{ borderColor: T.bdr }}>
          <button className="lw-rm-nb" style={{ borderColor:T.bdr }} onClick={() => prev && onNavigate(prev)} disabled={!prev}>
            <ChevronLeft size={16} style={{ color:prev?c.accent:T.sub, flexShrink:0 }}/>
            <span><span className="lw-rm-nl" style={{ color:T.sub }}>পূর্ববর্তী</span><span className="lw-rm-nt" style={{ color:T.txt }}>{prev?.title ?? "—"}</span></span>
          </button>
          <button className="lw-rm-nb" style={{ borderColor:T.bdr, justifyContent:"flex-end" }} onClick={() => next && onNavigate(next)} disabled={!next}>
            <span style={{ textAlign:"right" }}><span className="lw-rm-nl" style={{ color:T.sub }}>পরবর্তী</span><span className="lw-rm-nt" style={{ color:T.txt }}>{next?.title ?? "—"}</span></span>
            <ChevronRight size={16} style={{ color:next?c.accent:T.sub, flexShrink:0 }}/>
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ── Book Card ─────────────────────────────────────────────────────────────────
function BookCard({ book, index }: { book: typeof ebooks[0]; index: number }) {
  const [, setLocation] = useLocation();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.article
      ref={ref}
      className="lw-book-card"
      style={{ "--ba": book.accentColor, "--ba-rgb": book.accentRgb } as React.CSSProperties}
      initial={{ opacity:0, y:32, rotateX:6 }}
      animate={isInView ? { opacity:1, y:0, rotateX:0 } : { opacity:0, y:32, rotateX:6 }}
      transition={{ delay:index*.08, duration:.48, ease:[.25,.46,.45,.94] }}
      onClick={() => setLocation(`/ebooks/read/${book.slug}`)}
      role="article" tabIndex={0}
      aria-label={`${book.title} দেখুন`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLocation(`/ebooks/read/${book.slug}`); } }}
    >
      <div className="lw-book-glow"/>
      <div className="lw-book-cover-wrap">
        <img
          src={book.cover}
          alt={`${book.title} — মাহবুব সরদার সবুজ`}
          className="lw-book-cover"
          loading="lazy" decoding="async"
        />
        <span className="lw-book-badge">{book.badge}</span>
      </div>
      <div className="lw-book-body">
        <div className="lw-book-genre">{book.genre}</div>
        <div className="lw-book-title">{book.title}</div>
        <p className="lw-book-desc">{book.description}</p>
        <div className="lw-book-meta">
          <Calendar size={10}/>{book.year}
          <span style={{ margin:"0 4px", opacity:.3 }}>·</span>
          <BookMarked size={10}/>{book.pages} পৃষ্ঠা
        </div>
        <div className="lw-book-actions">
          <a
            href={`/ebooks/read/${book.slug}`}
            className="lw-book-btn lw-book-btn-accent"
            onClick={e => e.stopPropagation()}
            style={{ background:`rgba(${book.accentRgb},.18)`, borderColor:`rgba(${book.accentRgb},.42)` }}
          >
            <BookOpen size={12}/> পড়ুন
          </a>
          <a
            href={`/ebooks/read/${book.slug}`}
            className="lw-book-btn"
            onClick={e => e.stopPropagation()}
          >
            <Eye size={12}/> দেখুন
          </a>
        </div>
      </div>
    </motion.article>
  );
}

// ── Book Modal ────────────────────────────────────────────────────────────────
function BookModal({ book, onClose }: { book: typeof ebooks[0]; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return createPortal(
    <motion.div className="lw-bm" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:.26 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="lw-bm-box" initial={{ scale:.92, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:.92, opacity:0 }} transition={{ type:"spring", damping:32, stiffness:290 }}>
        <div className="lw-bm-hd">
          <span style={{ fontFamily:"var(--f)", fontSize:".74rem", color:"rgba(237,232,222,.45)", fontWeight:500 }}>বইয়ের বিবরণ</span>
          <button onClick={onClose} style={{ display:"flex", alignItems:"center", justifyContent:"center", width:34, height:34, borderRadius:10, border:"1px solid rgba(255,255,255,.1)", background:"none", cursor:"pointer", color:"rgba(237,232,222,.45)", transition:"all .2s" }}><X size={14}/></button>
        </div>
        <div className="lw-bm-in">
          <div className="lw-bm-cw">
            <img src={book.cover} alt={book.title} className="lw-bm-cv" loading="lazy"/>
          </div>
          <div className="lw-bm-cnt">
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 13px", borderRadius:999, background:`${book.accentColor}14`, border:`1px solid ${book.accentColor}28`, marginBottom:"1rem" }}>
              <span style={{ fontFamily:"var(--f)", fontSize:".64rem", color:book.accentColor, letterSpacing:".1em", textTransform:"uppercase", fontWeight:700 }}>{book.badge}</span>
            </div>
            <h2 style={{ fontFamily:"var(--f)", fontSize:"1.3rem", color:"#EDE8DE", lineHeight:1.5, marginBottom:".75rem", fontWeight:700, letterSpacing:"-.018em" }}>{book.title}</h2>
            <p style={{ fontFamily:"var(--f)", fontSize:".87rem", color:"rgba(237,232,222,.6)", lineHeight:2.0, marginBottom:"1.2rem" }}>{book.description}</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:"1.5rem" }}>
              {[book.genre, `${book.pages} পৃষ্ঠা`, book.year].map((t, i) => (
                <span key={i} style={{ padding:"4px 12px", borderRadius:999, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", fontFamily:"var(--f)", fontSize:".7rem", color:"rgba(237,232,222,.46)" }}>{t}</span>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {book.buyLink && (
                <a href={book.buyLink} target="_blank" rel="noopener noreferrer"
                  style={{ display:"flex", alignItems:"center", gap:7, padding:"11px 22px", borderRadius:999, background:`linear-gradient(135deg,${book.accentColor},${book.accentColor}CC)`, color:"#080A14", fontFamily:"var(--f)", fontSize:".85rem", textDecoration:"none", transition:"all .26s", boxShadow:`0 8px 26px ${book.accentColor}30`, fontWeight:800 }}>
                  <ShoppingCart size={13}/> কিনুন
                </a>
              )}
              {book.canRead && (
                <a href={`/ebooks/read/${book.slug}`}
                  style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 20px", borderRadius:999, background:"transparent", color:book.accentColor, fontFamily:"var(--f)", fontSize:".85rem", textDecoration:"none", border:`1.5px solid ${book.accentColor}38`, transition:"all .26s", fontWeight:600 }}>
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

// ── Hero Section ──────────────────────────────────────────────────────────────
function LiteraryHero({ totalWritings }: { totalWritings: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const tickerItems = [
    "কবিতা", "ভালোবাসা", "বিচ্ছেদ", "জীবনদর্শন", "ছোট লেখা", "গল্প",
    "কবিতা", "ভালোবাসা", "বিচ্ছেদ", "জীবনদর্শন", "ছোট লেখা", "গল্প",
  ];

  return (
    <motion.div
      ref={ref}
      className="lw-hero"
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: .65, ease: [.16,1,.3,1] }}
    >
      <div className="lw-hero-calligraphy" aria-hidden="true">আ</div>

      <div className="lw-hero-inner">
        {/* Left: Text */}
        <div>
          <motion.div
            className="lw-hero-eyebrow"
            initial={{ opacity:0, x:-20 }} animate={isInView ? { opacity:1, x:0 } : {}}
            transition={{ delay:.1, duration:.5, ease:[.16,1,.3,1] }}
          >
            <div className="lw-hero-eyebrow-dot"/>
            লেখক ও কবি
          </motion.div>

          <motion.h1
            className="lw-hero-h1"
            initial={{ opacity:0, y:28 }} animate={isInView ? { opacity:1, y:0 } : {}}
            transition={{ delay:.18, duration:.6, ease:[.16,1,.3,1] }}
          >
            লেখালেখি
            <span className="lw-hero-h1-gold">ও বই</span>
          </motion.h1>

          <motion.p
            className="lw-hero-sub"
            initial={{ opacity:0, y:20 }} animate={isInView ? { opacity:1, y:0 } : {}}
            transition={{ delay:.26, duration:.55, ease:[.16,1,.3,1] }}
          >
            মাহবুব সরদার সবুজের কবিতা, গদ্য, ছোট লেখা ও প্রকাশিত বইয়ের সম্পূর্ণ সংগ্রহ।
            বাংলা সাহিত্যের এক নিবেদিত কণ্ঠস্বর।
          </motion.p>

          <motion.div
            className="lw-hero-stats"
            initial={{ opacity:0, y:16 }} animate={isInView ? { opacity:1, y:0 } : {}}
            transition={{ delay:.34, duration:.5, ease:[.16,1,.3,1] }}
          >
            {[
              { n: totalWritings || 2343, s: "+", l: "লেখা" },
              { n: 5, s: "", l: "বই ও ই-বুক" },
              { n: 6, s: "টি", l: "ক্যাটাগরি" },
              { n: 7, s: "+", l: "বছর" },
            ].map((st, i) => (
              <div key={i} className="lw-hero-stat">
                <span className="lw-hero-stat-n">
                  <AnimatedCounter target={st.n} suffix={st.s}/>
                </span>
                <span className="lw-hero-stat-l">{st.l}</span>
              </div>
            ))}
          </motion.div>

          {/* Ticker */}
          <div className="lw-ticker">
            <div className="lw-ticker-track">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <div key={i} className="lw-ticker-item">
                  <span>✦</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Book showcase */}
        <motion.div
          className="lw-hero-showcase"
          initial={{ opacity:0, scale:.9, rotateY:8 }} animate={isInView ? { opacity:1, scale:1, rotateY:0 } : {}}
          transition={{ delay:.22, duration:.7, ease:[.16,1,.3,1] }}
        >
          <div className="lw-hero-stack">
            {ebooks.slice(0, 3).map((book, i) => (
              <img
                key={book.id}
                src={book.cover}
                alt={book.title}
                className="lw-hero-book"
                loading="eager"
              />
            ))}
          </div>
          <div className="lw-hero-showcase-label">প্রকাশনা সংগ্রহ</div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Books Tab ─────────────────────────────────────────────────────────────────
function BooksTab() {
  const [, setLocation] = useLocation();
  const [selBook, setSelBook] = useState<typeof ebooks[0]|null>(null);
  const featured = ebooks[0];
  const remaining = ebooks.slice(1);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <>
      <motion.section
        ref={ref}
        className="lw-panel lw-panel-gold"
        aria-labelledby="lw-books-title"
        initial={{ opacity:0, y:26 }}
        animate={isInView ? { opacity:1, y:0 } : { opacity:0, y:26 }}
        transition={{ duration:.5, ease:[.25,.46,.45,.94] }}
      >
        <div className="lw-panel-head">
          <div>
            <div className="lw-eyebrow"><Library size={12}/> বই ও ই-বুক</div>
            <h2 id="lw-books-title">প্রকাশনা সংগ্রহ</h2>
            <p>মাহবুব সরদার সবুজের প্রকাশিত বই ও ই-বুকের সম্পূর্ণ সংগ্রহ</p>
          </div>
          <Link href="/ebooks" className="lw-see-all">সব বই <ArrowRight size={13}/></Link>
        </div>

        {/* Featured Book */}
        <motion.article
          className="lw-featured"
          style={{ "--ba": featured.accentColor, "--ba-rgb": featured.accentRgb } as React.CSSProperties}
          initial={{ opacity:0, y:22 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:.46, ease:[.25,.46,.45,.94] }}
          onClick={() => setLocation(`/ebooks/read/${featured.slug}`)}
          role="article" tabIndex={0}
          aria-label={`${featured.title} দেখুন`}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLocation(`/ebooks/read/${featured.slug}`); } }}
        >
          <div className="lw-featured-inner">
            <div className="lw-featured-cover-wrap">
              <img
                src={featured.cover}
                alt={`${featured.title} - ${featured.genre} বই - মাহবুব সরদার সবুজ`}
                className="lw-featured-cover"
                loading="eager" decoding="async"
              />
              <span className="lw-featured-badge"><Crown size={10}/> {featured.badge}</span>
            </div>
            <div className="lw-featured-content">
              <div className="lw-featured-genre">{featured.genre}</div>
              <h3 className="lw-featured-title">{featured.title}</h3>
              <p className="lw-featured-desc">{featured.description}</p>
              <div className="lw-featured-meta">
                <span><Calendar size={10}/>{featured.year}</span>
                <span><BookMarked size={10}/>{featured.pages} পৃষ্ঠা</span>
                <span><Star size={10}/> বিশেষ সংস্করণ</span>
              </div>
              <div className="lw-featured-actions">
                {featured.buyLink && (
                  <a
                    href={featured.buyLink} target="_blank" rel="noopener noreferrer"
                    className="lw-btn-primary"
                    onClick={(e) => e.stopPropagation()}
                    style={{ background:`linear-gradient(135deg,${featured.accentColor},${featured.accentColor}CC)`, boxShadow:`0 8px 28px rgba(${featured.accentRgb},.4)` }}
                  >
                    <ShoppingCart size={14}/> এখনই কিনুন
                  </a>
                )}
                <Link href={`/ebooks/read/${featured.slug}`} onClick={(e) => e.stopPropagation()} className="lw-btn-secondary">
                  <BookOpen size={14}/> পড়ুন
                </Link>
              </div>
            </div>
          </div>
        </motion.article>

        {/* Bookshelf Grid */}
        <div className="lw-bookshelf">
          {remaining.map((book, i) => <BookCard key={book.id} book={book} index={i+1}/>)}
        </div>
      </motion.section>

      <AnimatePresence>
        {selBook && <BookModal book={selBook} onClose={() => setSelBook(null)}/>}
      </AnimatePresence>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
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
    loadWritingsArchive().then((writings) => { if (mounted) { setArchive(writings); setArchiveReady(true); } }).catch(() => { if (mounted) setArchiveReady(true); });
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

  const showSplit = cat === "all";
  const longWritings = useMemo(() => showSplit ? filtered.filter(w => w.category !== "ছোট লেখা") : filtered, [filtered, showSplit]);
  const shortWritings = useMemo(() => showSplit ? filtered.filter(w => w.category === "ছোট লেখা") : [], [filtered, showSplit]);

  useEffect(() => { setVisibleCount(WRITINGS_PAGE_SIZE); setVisibleShortCount(WRITINGS_PAGE_SIZE); }, [cat, deferredQuery]);

  const mainList = showSplit ? longWritings : filtered;
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

  const handleCardClick = useCallback((w: Writing) => { setLocation(`/writings/${makeSlug(w.title, w.id)}`); }, [setLocation]);
  const handleModalClose = useCallback(() => { setSel(null); setLocation("/writings"); }, [setLocation]);
  const handleNavigate = useCallback((w: Writing) => { setSel(w); setLocation(`/writings/${makeSlug(w.title, w.id)}`); }, [setLocation]);

  const seoPath = sel ? `/writings/${makeSlug(sel.title, sel.id)}` : "/writings";
  const seoTitle = sel ? `${sel.title} — মাহবুব সরদার সবুজ` : "লেখালেখি ও বই — মাহবুব সরদার সবুজ | ২৩৪৩+ কবিতা ও লেখা";
  const seoDescription = sel
    ? `${makeExcerpt(sel.content, 155)} — মাহবুব সরদার সবুজ`
    : "মাহবুব সরদার সবুজের ২৩৪৩+ বাংলা কবিতা, ছোট লেখা, ভালোবাসার লেখা, বিচ্ছেদের কবিতা ও জীবনদর্শন। বিনামূল্যে পড়ুন।";
  const catKeywordMap: Record<string, string> = {
    "ভালোবাসা": "ভালোবাসার কবিতা, প্রেমের লেখা, love poem bangla",
    "বিচ্ছেদ": "বিচ্ছেদের কবিতা, বিরহের লেখা, কষ্টের কবিতা",
    "কবিতা": "বাংলা কবিতা, bangla kobita, কবিতা পড়ুন",
    "ছোট লেখা": "বাংলা স্ট্যাটাস, ছোট কবিতা, bangla status",
    "জীবনদর্শন": "জীবনদর্শন, অনুপ্রেরণামূলক লেখা, motivational bangla",
  };
  const seoKeywords = sel
    ? `${sel.title}, ${sel.category}, মাহবুব সরদার সবুজ, ${catKeywordMap[sel.category] ?? "বাংলা কবিতা"}, Mahbub Sardar Sabuj`
    : "মাহবুব সরদার সবুজ লেখা, বাংলা কবিতা, বাংলা ই-বুক, ভালোবাসার লেখা, বিচ্ছেদের লেখা, Mahbub Sardar Sabuj writings, bangla kobita";

  const writingsJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      { "@type":"CollectionPage", "@id":siteUrl("/writings#collection"), "name":"লেখালেখি ও বই — মাহবুব সরদার সবুজ", "url":siteUrl("/writings"), "inLanguage":"bn-BD", "description":"মাহবুব সরদার সবুজের বই, ই-বুক, কবিতা, ভালোবাসা, বিচ্ছেদ ও জীবনদর্শনের লেখাগুলোর curated সংগ্রহ।", "isPartOf":{ "@type":"WebSite", "@id":siteUrl("/#website"), "name":"মাহবুব সরদার সবুজ" }, "about":{ "@id":siteUrl("/about#author") } },
      { "@type":"Person", "@id":siteUrl("/about#author"), "name":"মাহবুব সরদার সবুজ", "alternateName":"Mahbub Sardar Sabuj", "url":siteUrl("/about"), "knowsLanguage":["bn-BD","en"] },
      { "@type":"BreadcrumbList", "itemListElement":[ { "@type":"ListItem","position":1,"name":"হোম","item":siteUrl("/") }, { "@type":"ListItem","position":2,"name":"লেখালেখি ও বই","item":siteUrl("/writings") }, ...(sel?[{ "@type":"ListItem","position":3,"name":sel.title,"item":siteUrl(seoPath) }]:[]) ] },
      { "@type":"ItemList", "@id":siteUrl("/writings#latest-writings"), "name":"নির্বাচিত অনুভূতির আর্কাইভ — মাহবুব সরদার সবুজের ২৩৪৩+ লেখা", "itemListElement":archive.slice(0,24).map((writing,index) => ({ "@type":"ListItem","position":index+1,"url":siteUrl(`/writings/${makeSlug(writing.title,writing.id)}`),"name":writing.title })) },
      ...ebooks.map(book => ({ "@type":"Book","@id":siteUrl(`/ebooks/read/${book.slug}#book`),"name":book.title,"inLanguage":"bn-BD","author":{"@id":siteUrl("/about#author")},"url":siteUrl(`/ebooks/read/${book.slug}`),"image":siteUrl(book.cover),"description":book.description,"genre":book.genre,"bookFormat":book.badge.includes("ফিজিক্যাল")?"https://schema.org/Hardcover":"https://schema.org/EBook","isAccessibleForFree":!book.buyLink })),
      ...(sel?[{ "@type":"CreativeWork","@id":siteUrl(`${seoPath}#writing`),"name":sel.title,"headline":sel.title,"url":siteUrl(seoPath),"inLanguage":"bn-BD","text":makeExcerpt(sel.content,500),"description":makeExcerpt(sel.content),"datePublished":sel.date,"genre":sel.category,"author":{"@id":siteUrl("/about#author")},"isAccessibleForFree":true }]:[]),
    ],
  }), [archive, sel, seoPath]);

  return (
    <>
      <Seo title={seoTitle} description={seoDescription} path={seoPath} keywords={seoKeywords} jsonLd={writingsJsonLd}/>
      <Navbar/>
      <style>{CSS}</style>

      <div className="lw-page">
        <div className="lw-wrap">

          {/* ── Hero ── */}
          <LiteraryHero totalWritings={archive.length}/>

          {/* ── Books ── */}
          <BooksTab/>

          {/* ── Quote Spotlight ── */}
          <QuoteSpotlight/>

          {/* ── Writings Archive ── */}
          <motion.section
            ref={writingsSectionRef}
            className="lw-panel lw-panel-blue"
            id="all-writings"
            aria-labelledby="lw-writings-title"
            initial={{ opacity:0, y:26 }}
            animate={isWritingsInView ? { opacity:1, y:0 } : { opacity:0, y:26 }}
            transition={{ duration:.5, ease:[.25,.46,.45,.94] }}
          >
            <div className="lw-panel-head">
              <div>
                <div className="lw-eyebrow"><Feather size={12}/> লেখালেখি</div>
                <h2 id="lw-writings-title">নির্বাচিত অনুভূতির আর্কাইভ</h2>
                <p>ভালোবাসা, বিচ্ছেদ, কবিতা ও জীবনদর্শনের সেরা লেখাগুলো</p>
              </div>
            </div>

            {/* Tools bar */}
            <div className="lw-tools">
              <div className="lw-search">
                <Search size={13} color="rgba(240,234,224,.3)"/>
                <input
                  type="text" placeholder="লেখা খুঁজুন…" aria-label="লেখা খুঁজুন"
                  value={q} onChange={e => setQ(e.target.value)} disabled={!archiveReady}
                />
                {q && (
                  <button aria-label="সার্চ মুছে ফেলুন" onClick={() => setQ("")}
                    style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(240,234,224,.3)", display:"flex", transition:"color .15s" }}>
                    <X size={12}/>
                  </button>
                )}
              </div>
              <div className="lw-cats">
                {CATS.map(c2 => (
                  <motion.button
                    key={c2.id} className="lw-cat"
                    style={cat === c2.id ? { background:c2.bg, color:c2.color, borderColor:`${c2.color}28`, boxShadow:`0 0 16px ${c2.glow}, 0 2px 8px rgba(0,0,0,.2)` } : {}}
                    onClick={() => setCat(c2.id)} aria-pressed={cat === c2.id}
                    whileTap={{ scale:.91 }}
                  >
                    <span style={{ fontSize:".76rem" }}>{c2.icon}</span>{c2.label}
                  </motion.button>
                ))}
              </div>
              <div className="lw-view">
                <button className={`lw-vb${viewMode==="grid"?" on":""}`} onClick={() => setViewMode("grid")} title="গ্রিড" aria-label="গ্রিড ভিউ" aria-pressed={viewMode==="grid"}><Grid3X3 size={13}/></button>
                <button className={`lw-vb${viewMode==="list"?" on":""}`} onClick={() => setViewMode("list")} title="লিস্ট" aria-label="লিস্ট ভিউ" aria-pressed={viewMode==="list"}><List size={13}/></button>
              </div>
            </div>

            {/* Active filter bar */}
            {(cat !== "all" || q) && (
              <div className="lw-results">
                <div className="lw-results-t">
                  {cat !== "all" && <span style={{ color:CATS.find(c2=>c2.id===cat)?.color }}>{CATS.find(c2=>c2.id===cat)?.label}</span>}
                  {cat !== "all" && deferredQuery && <span>·</span>}
                  {deferredQuery && <span>"{deferredQuery}"</span>}
                  {filtered.length > 0 && <span style={{ color:"rgba(240,234,224,.2)" }}>— {filtered.length}টি লেখা</span>}
                </div>
                <button className="lw-clr" aria-label="সব ফিল্টার সরান" onClick={() => { setCat("all"); setQ(""); }}>
                  <X size={10}/> সরান
                </button>
              </div>
            )}

            {/* Cards */}
            {!archiveReady ? (
              <div aria-live="polite" aria-label="লেখাগুলো লোড হচ্ছে">
                <div className="lw-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="lw-sk-card" style={{ animationDelay: `${i * 0.08}s` }}>
                      <div className="lw-sk-tag lw-skeleton"/>
                      <div className="lw-sk-ttl lw-skeleton"/>
                      <div className="lw-sk-ttl2 lw-skeleton"/>
                      <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1 }}>
                        <div className="lw-sk-line lw-skeleton"/>
                        <div className="lw-sk-l2 lw-skeleton"/>
                        <div className="lw-sk-l3 lw-skeleton"/>
                        <div className="lw-sk-line lw-skeleton" style={{ width:"88%" }}/>
                      </div>
                      <div className="lw-sk-foot lw-skeleton"/>
                    </div>
                  ))}
                </div>
              </div>
            ) : filtered.length > 0 ? (
              <>
                {/* বড় লেখা */}
                {visibleWritings.length > 0 && (
                  <>
                    {cat === "all" && longWritings.length > 0 && (
                      <div className="lw-divider">
                        <span className="lw-divider-label" style={{ color:"rgba(201,168,76,.6)" }}>✦ বড় লেখা</span>
                        <div className="lw-divider-line" style={{ background:"rgba(201,168,76,.1)" }}/>
                        <span className="lw-divider-count">{longWritings.length}টি</span>
                      </div>
                    )}
                    <div className={viewMode==="grid" ? "lw-grid" : "lw-grid-l"}>
                      {visibleWritings.map((w, i) => (
                        <WritingCard key={w.id} writing={w} index={i} onClick={() => handleCardClick(w)} viewMode={viewMode}/>
                      ))}
                    </div>
                    {hasMoreWritings && (
                      <div className="lw-more">
                        <motion.button
                          className="lw-more-btn"
                          aria-label="আরও বড় লেখা দেখুন"
                          onClick={() => setVisibleCount(n => Math.min(n + WRITINGS_PAGE_SIZE, mainList.length))}
                          whileTap={{ scale:.96 }}
                        >
                          <ChevronDown size={14}/> আরও বড় লেখা দেখুন
                        </motion.button>
                        <span className="lw-more-note">{visibleCount} / {mainList.length} লেখা দেখানো হচ্ছে</span>
                      </div>
                    )}
                  </>
                )}

                {/* ছোট লেখা */}
                {cat === "all" && shortWritings.length > 0 && (
                  <motion.div
                    initial={{ opacity:0, y:18 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ duration:.44, delay:.1, ease:[.25,.46,.45,.94] }}
                    style={{ marginTop:"2.8rem" }}
                  >
                    <div className="lw-divider">
                      <span className="lw-divider-label" style={{ color:"rgba(52,211,153,.65)" }}>✎ ছোট লেখা</span>
                      <div className="lw-divider-line" style={{ background:"rgba(52,211,153,.1)" }}/>
                      <span className="lw-divider-count">{shortWritings.length}টি</span>
                    </div>
                    <div className={viewMode==="grid" ? "lw-grid" : "lw-grid-l"}>
                      {visibleShortWritings.map((w, i) => (
                        <WritingCard key={w.id} writing={w} index={i} onClick={() => handleCardClick(w)} viewMode={viewMode}/>
                      ))}
                    </div>
                    {hasMoreShortWritings && (
                      <div className="lw-more">
                        <motion.button
                          className="lw-more-btn"
                          aria-label="আরও ছোট লেখা দেখুন"
                          onClick={() => setVisibleShortCount(n => Math.min(n + WRITINGS_PAGE_SIZE, shortWritings.length))}
                          whileTap={{ scale:.96 }}
                        >
                          <ChevronDown size={14}/> আরও ছোট লেখা দেখুন
                        </motion.button>
                        <span className="lw-more-note">{visibleShortCount} / {shortWritings.length} লেখা দেখানো হচ্ছে</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            ) : (
              <div className="lw-empty">
                <Search size={30} color="rgba(240,234,224,.1)" style={{ margin:"0 auto 1.2rem", display:"block" }}/>
                <div style={{ fontSize:".96rem", color:"rgba(240,234,224,.28)", fontFamily:"var(--f)" }}>কোনো লেখা পাওয়া যায়নি</div>
                <button
                  onClick={() => { setCat("all"); setQ(""); }}
                  style={{ marginTop:"1.1rem", padding:"9px 22px", borderRadius:999, border:"1px solid rgba(201,168,76,.26)", background:"rgba(201,168,76,.08)", color:"#C9A84C", fontFamily:"var(--f)", fontSize:".8rem", cursor:"pointer", fontWeight:700 }}
                >
                  সব লেখা দেখুন
                </button>
              </div>
            )}
          </motion.section>

          {/* ── Reading CTA ── */}
          <ReadingCTA/>

        </div>
      </div>

      <div style={{ maxWidth:840, margin:"0 auto", padding:"1.5rem 1rem" }}>
        <AdSenseAd adSlot={AD_SLOTS.WRITINGS_INLINE} adFormat="auto" fullWidthResponsive={true}/>
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
