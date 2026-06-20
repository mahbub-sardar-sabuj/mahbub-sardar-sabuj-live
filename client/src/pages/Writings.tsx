/**
 * Writings & E-Books — লেখালেখি ও বই
 * Design: EDITORIAL CLARITY v11 — World-Class Premium
 * Philosophy: Clean, Readable, Immersive — inspired by Medium, Substack, Notion
 * Palette: Ink #0A0C14 | Surface #111420 | Gold #C9A84C | Cream #F0EAE0
 * Features: Editorial Cards | Immersive Reader | Smooth Transitions | Mobile-First
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { SITE_URL } from "@/components/Seo";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";
import { loadWritingsArchive } from "@/lib/loadWritingsArchive";
import type { Writing } from "@/data/writingsArchive";
import {
  motion, AnimatePresence, useInView,
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
  Crown, Moon, Sun, Scroll, ChevronDown, BookMarked,
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
  { id:"গল্প",       label:"গল্প",       icon:"✦", color:"#FB923C", glow:"rgba(251,146,60,.4)"  },
];
function getCatStyle(cat: string) {
  const m: Record<string,{accent:string;glow:string;bg:string;badge:string;border:string;icon:string}> = {
    "ভালোবাসা": { accent:"#F472B6",glow:"rgba(244,114,182,.28)",bg:"rgba(244,114,182,.07)",badge:"rgba(244,114,182,.16)",border:"rgba(244,114,182,.32)",icon:"♡" },
    "বিচ্ছেদ":  { accent:"#A78BFA",glow:"rgba(167,139,250,.28)",bg:"rgba(167,139,250,.07)",badge:"rgba(167,139,250,.16)",border:"rgba(167,139,250,.32)",icon:"◌" },
    "কবিতা":    { accent:"#60A5FA",glow:"rgba(96,165,250,.28)", bg:"rgba(96,165,250,.07)", badge:"rgba(96,165,250,.16)", border:"rgba(96,165,250,.32)", icon:"❧" },
    "ছোট লেখা": { accent:"#34D399",glow:"rgba(52,211,153,.28)", bg:"rgba(52,211,153,.07)", badge:"rgba(52,211,153,.16)", border:"rgba(52,211,153,.32)", icon:"✎" },
    "জীবনদর্শন":{ accent:"#FBBF24",glow:"rgba(251,191,36,.28)", bg:"rgba(251,191,36,.07)", badge:"rgba(251,191,36,.16)", border:"rgba(251,191,36,.32)", icon:"◈" },
    "গল্প":      { accent:"#FB923C",glow:"rgba(251,146,60,.28)",  bg:"rgba(251,146,60,.07)",  badge:"rgba(251,146,60,.16)",  border:"rgba(251,146,60,.32)",  icon:"✦" },
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
//  CSS — EDITORIAL CLARITY v11
// ══════════════════════════════════════════════════════════════════════════════
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@300;400;500;600;700&display=swap');

  :root {
    --ink:   #0A0C14;
    --bg0:   #0D0F1A;
    --bg1:   #111420;
    --bg2:   #161928;
    --bg3:   #1C2030;
    --t0:    #F0EAE0;
    --t1:    rgba(240,234,224,.90);
    --t2:    rgba(240,234,224,.60);
    --t3:    rgba(240,234,224,.35);
    --t4:    rgba(240,234,224,.14);
    --gold:  #C9A84C;
    --gold2: #E8C87A;
    --gold3: #F5E0A8;
    --bdr:   rgba(255,255,255,.07);
    --bdr2:  rgba(255,255,255,.11);
    --bdr3:  rgba(255,255,255,.18);
    --f:     'AdorshoLipi', 'Noto Serif Bengali', serif;
    --ease:  cubic-bezier(.25,.46,.45,.94);
    --silk:  cubic-bezier(.16,1,.3,1);
    --spring: cubic-bezier(.34,1.56,.64,1);
  }

  /* ── PAGE WRAPPER ── */
  .wp { background: var(--ink); min-height: 100vh; padding-top: var(--site-nav-offset,98px); }

  /* ── SUBTLE BACKGROUND GRADIENT ── */
  .wp::before {
    content: "";
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 70% 45% at 15% 0%, rgba(201,168,76,.08) 0%, transparent 55%),
      radial-gradient(ellipse 50% 35% at 85% 15%, rgba(96,165,250,.05) 0%, transparent 50%),
      radial-gradient(ellipse 40% 30% at 50% 100%, rgba(167,139,250,.04) 0%, transparent 48%);
  }

  /* ── MAIN CONTENT ── */
  .mc { max-width: 1280px; margin: 0 auto; padding: clamp(1.5rem,3vw,2.5rem) clamp(1rem,4vw,2.5rem); position: relative; z-index: 1; }

  /* ══════════════════════════════════════════════════
     HERO — EDITORIAL HEADER
  ══════════════════════════════════════════════════ */
  .hero-wrap {
    position: relative; overflow: hidden;
    border-radius: clamp(24px,4vw,40px);
    margin-bottom: clamp(1.5rem,3vw,2.5rem);
    padding: clamp(2rem,5vw,3.5rem) clamp(1.5rem,4vw,3rem);
    background:
      linear-gradient(135deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,.02) 60%),
      radial-gradient(ellipse 80% 100% at 90% -5%, rgba(201,168,76,.2) 0%, transparent 50%),
      radial-gradient(ellipse 55% 70% at 5% 105%, rgba(96,165,250,.1) 0%, transparent 45%),
      var(--bg1);
    border: 1px solid rgba(255,255,255,.08);
    box-shadow: 0 40px 120px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.1);
  }
  /* Top shimmer */
  .hero-wrap::before {
    content: "";
    position: absolute; top: 0; left: 8%; right: 8%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(201,168,76,.6) 30%, rgba(255,255,255,.4) 50%, rgba(201,168,76,.6) 70%, transparent);
    pointer-events: none;
  }
  .hero-layout {
    display: grid;
    grid-template-columns: 1fr minmax(240px,.45fr);
    gap: clamp(2rem,5vw,4rem);
    align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 5px 14px; border-radius: 999px;
    background: rgba(201,168,76,.1); border: 1px solid rgba(201,168,76,.22);
    color: var(--gold); font-family: var(--f);
    font-size: .72rem; letter-spacing: .2em;
    text-transform: uppercase; margin-bottom: 1rem; font-weight: 500;
  }
  .hero-h1 {
    margin: 0 0 1rem; font-family: var(--f);
    font-size: clamp(2.2rem,6vw,5rem);
    line-height: 1.06; font-weight: 700;
    letter-spacing: -.04em; color: var(--t0);
  }
  .hero-h1-gold {
    background: linear-gradient(135deg, var(--gold3) 0%, var(--gold) 50%, var(--gold2) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .hero-sub {
    max-width: 580px; margin: 0 0 1.8rem;
    color: var(--t2); font-family: var(--f);
    font-size: clamp(.9rem,1.8vw,1.1rem); line-height: 2.0;
  }
  .hero-stats {
    display: flex; gap: .75rem; flex-wrap: wrap;
  }
  .hero-stat {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 16px; border-radius: 12px;
    background: rgba(255,255,255,.05); border: 1px solid var(--bdr2);
    font-family: var(--f); font-size: .75rem; color: var(--t2);
    transition: border-color .2s, background .2s;
  }
  .hero-stat:hover { border-color: rgba(201,168,76,.3); background: rgba(201,168,76,.06); }
  .hero-stat-num { color: var(--gold); font-weight: 700; font-size: .92rem; }
  /* Book stack in hero */
  .hero-books {
    position: relative; min-height: 360px;
    border-radius: 28px; overflow: hidden;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,.22) 0%, transparent 55%),
      linear-gradient(180deg, rgba(255,255,255,.065) 0%, rgba(255,255,255,.015) 100%);
    border: 1px solid rgba(255,255,255,.09);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 28px 80px rgba(0,0,0,.3);
  }
  .hero-books::after {
    content: ""; position: absolute; left: 10%; right: 10%; bottom: 14px;
    height: 22px; border-radius: 999px;
    background: rgba(201,168,76,.24); filter: blur(22px); pointer-events: none;
  }
  .hero-book-stack {
    position: absolute; inset: 36px 16px 36px;
    display: flex; align-items: flex-end; justify-content: center;
    gap: 14px; perspective: 1100px;
  }
  .hero-book {
    width: clamp(70px,8.5vw,108px); aspect-ratio: 3/4;
    border-radius: 13px; object-fit: cover;
    box-shadow: 0 30px 65px rgba(0,0,0,.58), -10px 0 20px rgba(0,0,0,.2), inset 0 0 0 1px rgba(255,255,255,.14);
    transform: rotate(var(--r,0deg)) translateY(var(--l,0px));
    transition: transform .4s var(--ease), box-shadow .4s;
  }
  .hero-books:hover .hero-book {
    transform: rotate(var(--r,0deg)) translateY(calc(var(--l,0px) - 10px));
    box-shadow: 0 42px 85px rgba(0,0,0,.68), -10px 0 20px rgba(0,0,0,.2), inset 0 0 0 1px rgba(255,255,255,.2);
  }
  .hero-book:nth-child(1) { --r:-12deg; --l:18px; }
  .hero-book:nth-child(2) { --r:-2deg;  --l:-8px; width: clamp(84px,10vw,128px); }
  .hero-book:nth-child(3) { --r:9deg;   --l:22px; }

  /* ══════════════════════════════════════════════════
     SECTION PANELS
  ══════════════════════════════════════════════════ */
  .panel {
    position: relative; overflow: hidden;
    border-radius: clamp(20px,3.5vw,36px);
    border: 1px solid var(--bdr);
    background: linear-gradient(180deg, rgba(255,255,255,.055) 0%, rgba(255,255,255,.015) 100%), var(--bg1);
    box-shadow: 0 30px 90px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.065);
    backdrop-filter: blur(18px);
    margin-bottom: clamp(1.5rem,3.5vw,2.8rem);
    padding: clamp(1.4rem,3vw,2.4rem);
  }
  .panel-gold::before {
    content: ""; position: absolute; top: 0; left: 8%; right: 8%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(201,168,76,.5), rgba(255,255,255,.28), rgba(201,168,76,.5), transparent);
    pointer-events: none;
  }
  .panel-blue::before {
    content: ""; position: absolute; top: 0; left: 8%; right: 8%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(96,165,250,.4), rgba(255,255,255,.22), rgba(96,165,250,.4), transparent);
    pointer-events: none;
  }
  .panel-head {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 1.5rem; margin-bottom: clamp(1.2rem,2.5vw,1.8rem);
  }
  .section-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px; border-radius: 999px;
    background: rgba(201,168,76,.08); border: 1px solid rgba(201,168,76,.18);
    color: var(--gold); font-family: var(--f);
    font-size: .71rem; letter-spacing: .16em;
    text-transform: uppercase; margin-bottom: .65rem; font-weight: 500;
  }
  .panel-head h2 {
    margin: 0; color: var(--t0); font-family: var(--f);
    font-size: clamp(1.4rem,3.5vw,2.4rem);
    line-height: 1.22; font-weight: 700; letter-spacing: -.028em;
  }
  .panel-head p {
    max-width: 600px; margin: .5rem 0 0;
    color: var(--t2); font-family: var(--f); line-height: 1.85; font-size: .9rem;
  }

  /* ══════════════════════════════════════════════════
     BOOKS SECTION — REDESIGNED
  ══════════════════════════════════════════════════ */

  /* Featured Book — Full-width hero card */
  .featured-book-hero {
    --ba: var(--gold);
    position: relative; overflow: hidden;
    border-radius: 28px; margin-bottom: 1.4rem;
    border: 1px solid color-mix(in srgb, var(--ba) 35%, rgba(255,255,255,.08));
    background:
      radial-gradient(ellipse 75% 55% at 90% -10%, color-mix(in srgb, var(--ba) 22%, transparent) 0%, transparent 52%),
      radial-gradient(ellipse 50% 40% at 5% 110%, rgba(96,165,250,.09) 0%, transparent 45%),
      linear-gradient(180deg, rgba(255,255,255,.08) 0%, rgba(255,255,255,.02) 100%),
      #0C1020;
    box-shadow: 0 32px 90px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.09);
    cursor: pointer;
    transition: transform .3s var(--silk), box-shadow .3s;
  }
  .featured-book-hero::before {
    content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px;
    background: linear-gradient(145deg, color-mix(in srgb, var(--ba) 55%, transparent) 0%, rgba(255,255,255,.1) 35%, transparent 60%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none; opacity: .6; transition: opacity .3s;
  }
  .featured-book-hero:hover { transform: translateY(-6px); box-shadow: 0 48px 120px rgba(0,0,0,.56), 0 0 60px color-mix(in srgb, var(--ba) 18%, transparent); }
  .featured-book-hero:hover::before { opacity: 1; }
  .featured-book-inner {
    display: grid; grid-template-columns: auto 1fr;
    gap: clamp(1.5rem,3vw,2.5rem); align-items: center;
    padding: clamp(1.5rem,3vw,2.5rem);
    position: relative; z-index: 1;
  }
  .featured-cover-wrap { position: relative; flex-shrink: 0; }
  .featured-cover-img {
    width: clamp(120px,15vw,185px); aspect-ratio: 3/4; object-fit: cover;
    border-radius: 18px;
    box-shadow: 0 32px 72px rgba(0,0,0,.6), -12px 0 26px rgba(0,0,0,.26), inset 0 0 0 1px rgba(255,255,255,.14);
    transform: rotateY(-10deg) rotateZ(-1.5deg);
    transition: transform .34s var(--silk), box-shadow .34s;
    display: block;
  }
  .featured-book-hero:hover .featured-cover-img {
    transform: rotateY(-2deg) translateY(-8px) scale(1.025);
    box-shadow: 0 46px 95px rgba(0,0,0,.68), -12px 0 26px rgba(0,0,0,.26), inset 0 0 0 1px rgba(255,255,255,.18);
  }
  .featured-cover-badge {
    position: absolute; top: -10px; right: -10px;
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 999px;
    background: rgba(10,12,20,.9); border: 1px solid color-mix(in srgb, var(--ba) 50%, rgba(255,255,255,.1));
    color: var(--t0); font-family: var(--f); font-size: .65rem;
    backdrop-filter: blur(12px); font-weight: 600;
    box-shadow: 0 6px 20px rgba(0,0,0,.4);
  }
  .featured-book-content { min-width: 0; }
  .featured-book-genre {
    color: var(--ba); font-family: var(--f);
    font-size: .7rem; letter-spacing: .12em;
    text-transform: uppercase; font-weight: 600; margin-bottom: .6rem;
  }
  .featured-book-title {
    font-family: var(--f); font-size: clamp(1.2rem,3vw,1.9rem);
    color: var(--t0); line-height: 1.38; font-weight: 700;
    letter-spacing: -.022em; margin: 0 0 .75rem;
  }
  .featured-book-desc {
    font-family: var(--f); font-size: .88rem; color: var(--t2);
    line-height: 1.95; margin: 0 0 1.2rem;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  }
  .featured-book-meta {
    display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    margin-bottom: 1.4rem;
  }
  .featured-book-meta span {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 999px;
    background: rgba(255,255,255,.06); border: 1px solid var(--bdr2);
    font-family: var(--f); font-size: .72rem; color: var(--t3);
  }
  .featured-book-actions {
    display: flex; gap: 10px; flex-wrap: wrap;
  }
  .btn-buy {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 11px 22px; border-radius: 14px;
    background: linear-gradient(135deg, var(--ba), color-mix(in srgb, var(--ba) 80%, transparent));
    color: #080A14; font-family: var(--f); font-size: .84rem;
    text-decoration: none; font-weight: 700; border: none; cursor: pointer;
    transition: all .26s var(--silk);
    box-shadow: 0 8px 26px color-mix(in srgb, var(--ba) 35%, transparent);
  }
  .btn-buy:hover { transform: translateY(-3px); filter: brightness(1.1); box-shadow: 0 14px 36px color-mix(in srgb, var(--ba) 42%, transparent); }
  .btn-read {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 20px; border-radius: 14px;
    background: rgba(255,255,255,.06);
    border: 1px solid var(--bdr2); color: var(--t1);
    font-family: var(--f); font-size: .84rem;
    text-decoration: none; font-weight: 600; cursor: pointer;
    transition: all .26s var(--silk);
  }
  .btn-read:hover { background: rgba(255,255,255,.11); border-color: var(--bdr3); transform: translateY(-2px); }

  /* Books Grid — 2 or 3 columns */
  .books-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: clamp(1rem,2vw,1.4rem);
  }

  /* Book Card — Vertical */
  .book-card {
    --ba: var(--gold);
    position: relative; overflow: hidden;
    border-radius: 22px; cursor: pointer;
    border: 1px solid color-mix(in srgb, var(--ba) 25%, rgba(255,255,255,.07));
    background:
      linear-gradient(160deg, color-mix(in srgb, var(--ba) 12%, transparent) 0%, transparent 42%),
      linear-gradient(180deg, rgba(255,255,255,.065) 0%, rgba(255,255,255,.016) 100%),
      #0C1020;
    transition: transform .3s var(--silk), box-shadow .3s, border-color .3s;
    display: flex; flex-direction: column;
  }
  .book-card::before {
    content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px;
    background: linear-gradient(155deg, color-mix(in srgb, var(--ba) 45%, transparent) 0%, transparent 50%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none; opacity: .45; transition: opacity .3s;
  }
  .book-card:hover {
    transform: translateY(-10px) scale(1.015);
    border-color: color-mix(in srgb, var(--ba) 55%, rgba(255,255,255,.14));
    box-shadow: 0 40px 100px rgba(0,0,0,.52), 0 0 50px color-mix(in srgb, var(--ba) 20%, transparent);
  }
  .book-card:hover::before { opacity: .88; }
  /* Shine effect */
  .book-card::after {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.14), transparent);
    transform: translateX(-130%) skewX(-20deg);
    animation: bookshine 6s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes bookshine {
    0%,55%  { transform: translateX(-130%) skewX(-20deg); opacity: 0; }
    62%     { opacity: .5; }
    78%,100%{ transform: translateX(130%) skewX(-20deg); opacity: 0; }
  }
  .book-card-cover-wrap {
    position: relative; z-index: 1;
    display: flex; justify-content: center;
    padding: 1.3rem 1rem .8rem; min-height: 180px;
  }
  .book-card-glow {
    position: absolute; inset: auto 12% 40% 12%; height: 65px;
    background: color-mix(in srgb, var(--ba) 35%, transparent);
    filter: blur(34px); opacity: .6; pointer-events: none; z-index: 0;
    transition: opacity .3s;
  }
  .book-card:hover .book-card-glow { opacity: .95; }
  .book-card-cover {
    position: relative; z-index: 1;
    width: min(118px,48vw); aspect-ratio: 3/4; object-fit: cover;
    border-radius: 14px;
    box-shadow: 0 22px 50px rgba(0,0,0,.55), -8px 0 18px rgba(0,0,0,.28), inset 0 0 0 1px rgba(255,255,255,.12);
    transform: rotateY(-12deg) rotateZ(-1.2deg);
    transition: transform .3s var(--silk), box-shadow .3s;
  }
  .book-card:hover .book-card-cover {
    transform: rotateY(-2deg) translateY(-5px) scale(1.04);
    box-shadow: 0 34px 68px rgba(0,0,0,.62), -8px 0 18px rgba(0,0,0,.28), inset 0 0 0 1px rgba(255,255,255,.16);
  }
  .book-card-badge {
    position: absolute; z-index: 2; top: 14px; left: 14px;
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 999px;
    color: var(--t0); background: rgba(5,7,14,.82);
    border: 1px solid color-mix(in srgb, var(--ba) 40%, rgba(255,255,255,.1));
    font-family: var(--f); font-size: .62rem;
    backdrop-filter: blur(12px); font-weight: 500;
  }
  .book-card-body {
    position: relative; z-index: 1;
    padding: .4rem 1.1rem 1.3rem;
    display: flex; flex-direction: column; flex: 1;
  }
  .book-card-genre {
    color: var(--ba); font-family: var(--f);
    font-size: .68rem; letter-spacing: .1em;
    text-transform: uppercase; font-weight: 600;
  }
  .book-card-title {
    margin: .45rem 0 .6rem; color: var(--t0); font-family: var(--f);
    font-size: 1.05rem; line-height: 1.5; font-weight: 700; letter-spacing: -.014em;
  }
  .book-card-desc {
    margin: 0; color: var(--t2); font-family: var(--f);
    font-size: .8rem; line-height: 1.9;
    display: -webkit-box; -webkit-line-clamp: 3;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .book-card-meta {
    display: flex; align-items: center; gap: 5px;
    margin-top: .8rem; color: var(--t3); font-family: var(--f); font-size: .7rem;
  }
  .book-card-actions {
    display: grid; grid-template-columns: repeat(2,minmax(0,1fr));
    gap: 8px; margin-top: auto; padding-top: 1rem;
    position: relative; z-index: 2;
  }
  .book-card-actions > * {
    min-height: 38px; display: inline-flex; align-items: center;
    justify-content: center; gap: 5px; border-radius: 12px;
    border: 1px solid rgba(255,255,255,.08); font-family: var(--f);
    font-size: .78rem; text-decoration: none; cursor: pointer;
    transition: all .22s var(--silk); font-weight: 600;
  }
  .book-btn-view { background: rgba(255,255,255,.04); color: var(--t2); }
  .book-btn-read, .book-btn-buy {
    background: color-mix(in srgb, var(--ba) 20%, transparent);
    color: var(--t0);
    border-color: color-mix(in srgb, var(--ba) 44%, rgba(255,255,255,.08));
  }
  .book-card-actions > *:hover { transform: translateY(-2px); filter: brightness(1.14); box-shadow: 0 6px 20px rgba(0,0,0,.28); }

  /* ══════════════════════════════════════════════════
     WRITING TOOLS BAR
  ══════════════════════════════════════════════════ */
  .writing-tools {
    position: sticky; top: var(--site-nav-offset,98px); z-index: 15;
    display: grid; grid-template-columns: minmax(180px,310px) 1fr auto;
    gap: 10px; align-items: center;
    margin: 1.2rem 0; padding: 10px 12px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,.08);
    background: rgba(10,12,20,.94);
    backdrop-filter: blur(24px) saturate(160%);
    box-shadow: 0 18px 50px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.06);
  }
  .wt-search { max-width: none; width: 100%; }
  .wt-cats { overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
  .wt-cats::-webkit-scrollbar { display: none; }
  .wt-view { flex-shrink: 0; }

  /* Search box */
  .sf-s {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,.05); border: 1px solid var(--bdr2);
    border-radius: 12px; padding: 0 12px; height: 40px;
    transition: border-color .22s, background .22s, box-shadow .22s;
  }
  .sf-s:focus-within {
    border-color: rgba(201,168,76,.4); background: rgba(201,168,76,.04);
    box-shadow: 0 0 0 3px rgba(201,168,76,.1);
  }
  .sf-s input {
    background: none; border: none; outline: none;
    color: var(--t1); font-family: var(--f); font-size: .84rem;
    width: 100%; min-height: 40px;
  }
  .sf-s input::placeholder { color: var(--t3); }

  /* Category pills */
  .sf-cats { display: flex; gap: 5px; flex-wrap: nowrap; }
  .sf-cat {
    display: flex; align-items: center; gap: 5px;
    padding: 6px 13px; border-radius: 999px;
    border: 1px solid var(--bdr2); background: rgba(255,255,255,.04);
    color: var(--t2); font-family: var(--f); font-size: .76rem;
    cursor: pointer; transition: all .22s var(--silk);
    white-space: nowrap; font-weight: 500;
  }
  .sf-cat:hover { border-color: var(--bdr3); color: var(--t1); background: rgba(255,255,255,.07); transform: translateY(-1px); }

  /* View toggle */
  .sf-vw {
    display: flex; gap: 3px; background: rgba(255,255,255,.04);
    border: 1px solid var(--bdr2); border-radius: 11px; padding: 3px;
  }
  .sf-vb {
    width: 30px; height: 30px; display: flex; align-items: center;
    justify-content: center; border-radius: 8px; border: none;
    background: transparent; color: var(--t3); cursor: pointer;
    transition: all .2s var(--silk);
  }
  .sf-vb.on { background: rgba(255,255,255,.1); color: var(--t0); box-shadow: 0 2px 8px rgba(0,0,0,.2); }
  .sf-vb:hover:not(.on) { color: var(--t2); background: rgba(255,255,255,.06); }

  /* Results bar */
  .rb2 {
    display: flex; align-items: center; justify-content: space-between;
    gap: .8rem; margin-bottom: clamp(1rem,2vw,1.6rem);
    padding-bottom: .8rem; border-bottom: 1px solid var(--bdr);
  }
  .rb2-t { font-family: var(--f); font-size: .78rem; color: var(--t3); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .rb2-clr {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 999px;
    border: 1px solid var(--bdr2); background: rgba(255,255,255,.04);
    color: var(--t3); font-family: var(--f); font-size: .73rem;
    cursor: pointer; transition: all .2s var(--silk);
  }
  .rb2-clr:hover { color: var(--t1); border-color: var(--bdr3); background: rgba(255,255,255,.07); }

  /* ══════════════════════════════════════════════════
     WRITING CARDS — EDITORIAL STYLE
  ══════════════════════════════════════════════════ */
  .wg2 { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: clamp(12px,1.6vw,16px); }
  .wg2-l { display: flex; flex-direction: column; gap: 8px; }

  .wc2 {
    position: relative; overflow: hidden;
    background: linear-gradient(180deg, rgba(255,255,255,.048) 0%, rgba(255,255,255,.016) 100%), var(--bg2);
    border: 1px solid var(--bdr); border-radius: 20px;
    cursor: pointer; min-height: 230px;
    transition: transform .26s var(--silk), box-shadow .26s, border-color .26s;
    animation: fadeUp .36s var(--ease) both;
  }
  /* Left accent bar */
  .wc2::after {
    content: ""; position: absolute; left: 0; top: 15%; bottom: 15%;
    width: 3px; border-radius: 0 3px 3px 0;
    background: var(--ca, var(--gold));
    opacity: 0; transition: opacity .28s;
  }
  .wc2:hover::after { opacity: 1; }
  /* Top glow */
  .wc2-glow {
    position: absolute; top: -50px; left: 50%; transform: translateX(-50%);
    width: 130px; height: 90px; border-radius: 50%;
    background: var(--cg, rgba(201,168,76,.14));
    filter: blur(32px); opacity: 0; transition: opacity .38s; pointer-events: none;
  }
  .wc2:hover .wc2-glow { opacity: 1; }
  .wc2:hover {
    transform: translateY(-5px);
    border-color: color-mix(in srgb, var(--ca,var(--gold)) 28%, rgba(255,255,255,.1));
    box-shadow: 0 22px 55px rgba(0,0,0,.42), 0 0 30px color-mix(in srgb, var(--ca,var(--gold)) 12%, transparent);
  }
  .wc2-body { height: 100%; display: flex; flex-direction: column; padding: clamp(1.1rem,2.2vw,1.45rem); }
  .wc2-tags { display: flex; align-items: center; gap: 6px; margin-bottom: .8rem; flex-wrap: wrap; }
  .wc2-cat {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 11px; border-radius: 999px; font-family: var(--f); font-size: .7rem;
    background: var(--cbg,rgba(201,168,76,.08)); color: var(--ca,var(--gold));
    border: 1px solid var(--cbdr,rgba(201,168,76,.2));
    transition: all .22s; font-weight: 600;
  }
  .wc2:hover .wc2-cat { background: var(--cbg2,rgba(201,168,76,.15)); }
  .wc2-star {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 8px; border-radius: 999px; font-family: var(--f); font-size: .63rem;
    background: rgba(251,191,36,.08); color: #FBBF24; border: 1px solid rgba(251,191,36,.2);
  }
  .wc2-title {
    font-family: var(--f); font-size: clamp(1rem,2.2vw,1.18rem);
    color: var(--t0); line-height: 1.62; margin-bottom: .8rem;
    font-weight: 700; letter-spacing: -.014em;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .wc2-preview {
    font-family: var(--f); font-size: .86rem; color: var(--t2);
    line-height: 2.0; display: -webkit-box; -webkit-line-clamp: 4;
    -webkit-box-orient: vertical; overflow: hidden; margin-bottom: .9rem;
  }
  .wc2-short .wc2-preview { -webkit-line-clamp: 6; font-size: .88rem; line-height: 2.05; }
  .wc2-short .wc2-tags { margin-bottom: .45rem; }
  .wc2-short { min-height: 190px; }
  .wc2-foot {
    display: flex; align-items: center; justify-content: space-between;
    gap: .6rem; margin-top: auto; padding-top: .85rem; border-top: 1px solid var(--bdr);
  }
  .wc2-date { display: flex; align-items: center; gap: 4px; font-family: var(--f); font-size: .7rem; color: var(--t3); }
  .wc2-read { display: flex; align-items: center; gap: 5px; font-family: var(--f); font-size: .76rem; font-weight: 700; transition: gap .2s; }
  .wc2:hover .wc2-read { gap: 9px; }

  /* List mode */
  .wc2-l { min-height: 0; border-radius: 15px; }
  .wc2-l .wc2-body { display: flex; align-items: center; gap: 1rem; padding: .9rem 1.2rem; }
  .wc2-l .wc2-title { font-size: .93rem; margin-bottom: .25rem; -webkit-line-clamp: 1; }
  .wc2-l .wc2-preview { display: none; }
  .wc2-l .wc2-tags { margin-bottom: 0; }
  .wc2-l .wc2-foot { border: none; padding: 0; margin-left: auto; }

  /* Empty state */
  .wc2-em { text-align: center; padding: 4.5rem 2rem; color: var(--t3); font-family: var(--f); }

  /* Section divider */
  .section-divider {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 1.1rem; margin-top: .4rem;
  }
  .section-divider-label {
    font-family: var(--f); font-size: .7rem;
    letter-spacing: .12em; text-transform: uppercase; font-weight: 600;
    white-space: nowrap;
  }
  .section-divider-line { flex: 1; height: 1px; }
  .section-divider-count {
    font-family: var(--f); font-size: .66rem; color: rgba(242,237,228,.2);
    white-space: nowrap;
  }

  /* Load more */
  .lm2 { margin: clamp(1.4rem,2.5vw,2rem) auto 0; display: flex; flex-direction: column; align-items: center; gap: .7rem; font-family: var(--f); color: var(--t3); }
  .lm2-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 28px; border-radius: 999px;
    border: 1px solid rgba(201,168,76,.28);
    background: linear-gradient(135deg, rgba(201,168,76,.12), rgba(255,255,255,.04));
    color: var(--gold); font-family: var(--f); font-size: .84rem;
    cursor: pointer; transition: all .24s var(--silk); font-weight: 600;
  }
  .lm2-btn:hover {
    transform: translateY(-3px);
    border-color: rgba(201,168,76,.5);
    background: linear-gradient(135deg, rgba(201,168,76,.2), rgba(255,255,255,.055));
    box-shadow: 0 10px 32px rgba(201,168,76,.2);
  }
  .lm2-note { font-size: .72rem; color: var(--t3); }

  /* ══════════════════════════════════════════════════
     READING MODAL — IMMERSIVE READER v11
  ══════════════════════════════════════════════════ */
  .rm2 {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(2,3,8,.88);
    backdrop-filter: blur(20px) saturate(140%);
    display: flex; align-items: flex-end; justify-content: center;
  }
  .rm2-box {
    width: 100%; max-width: 820px; max-height: 94vh;
    border-radius: 28px 28px 0 0; overflow: hidden;
    display: flex; flex-direction: column;
    box-shadow: 0 -44px 130px rgba(0,0,0,.82), 0 -1px 0 rgba(255,255,255,.08);
  }
  .rm2-hnd { width: 40px; height: 4px; border-radius: 999px; margin: 12px auto 0; flex-shrink: 0; }
  .rm2-prog { height: 2px; flex-shrink: 0; margin-top: 10px; }
  .rm2-pf { height: 100%; border-radius: 999px; transition: width .1s linear; }
  .rm2-hd {
    display: flex; align-items: center; justify-content: space-between;
    padding: .85rem 1.5rem; border-bottom: 1px solid; flex-shrink: 0; gap: 10px; flex-wrap: wrap;
  }
  .rm2-hdl { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .rm2-ctrl { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .rm2-btn {
    display: flex; align-items: center; justify-content: center;
    width: 34px; height: 34px; border-radius: 10px; border: 1px solid;
    background: none; cursor: pointer; transition: all .2s var(--silk);
  }
  .rm2-btn:hover { opacity: .8; transform: scale(1.06); }
  .rm2-fc { display: flex; border-radius: 10px; border: 1px solid; overflow: hidden; }
  .rm2-fb {
    display: flex; align-items: center; justify-content: center;
    width: 34px; height: 34px; background: none; border: none; cursor: pointer;
    transition: background .15s;
  }
  .rm2-fb:hover { background: rgba(255,255,255,.07); }
  .rm2-th {
    display: flex; align-items: center; gap: 5px; padding: 0 11px; height: 34px;
    border-radius: 10px; border: 1px solid; background: none; cursor: pointer;
    font-family: var(--f); font-size: .69rem; transition: all .2s; font-weight: 500;
  }
  .rm2-th:hover { opacity: .78; }
  .rm2-body {
    flex: 1; overflow-y: auto;
    padding: clamp(1.8rem,5vw,3.5rem) clamp(1.5rem,6vw,4.5rem);
    scroll-behavior: smooth;
  }
  .rm2-body::-webkit-scrollbar { width: 4px; }
  .rm2-body::-webkit-scrollbar-track { background: transparent; }
  .rm2-body::-webkit-scrollbar-thumb { background: rgba(201,168,76,.28); border-radius: 999px; }
  .rm2-ttl { font-family: var(--f); font-size: clamp(1.6rem,5vw,2.5rem); line-height: 1.45; margin-bottom: 2rem; font-weight: 700; letter-spacing: -.022em; }
  .rm2-txt { font-family: var(--f); line-height: 2.35; white-space: pre-wrap; word-break: break-word; font-size: 1.08rem; letter-spacing: .01em; }
  .rm2-sig { margin-top: 3.2rem; padding-top: 1.8rem; border-top: 1px solid; font-family: var(--f); font-size: .88rem; opacity: .52; font-style: italic; letter-spacing: .02em; }
  .rm2-nav { display: flex; border-top: 1px solid; flex-shrink: 0; }
  .rm2-nb {
    flex: 1; display: flex; align-items: center; gap: 10px;
    padding: 1.1rem 1.5rem; background: none; border: none; cursor: pointer; transition: background .2s;
  }
  .rm2-nb:hover { background: rgba(255,255,255,.04); }
  .rm2-nb:disabled { opacity: .3; cursor: default; }
  .rm2-nb:disabled:hover { background: none; }
  .rm2-nb + .rm2-nb { border-left: 1px solid; }
  .rm2-nl { display: block; font-family: var(--f); font-size: .63rem; margin-bottom: 3px; letter-spacing: .07em; text-transform: uppercase; }
  .rm2-nt { display: block; font-family: var(--f); font-size: .82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 210px; font-weight: 600; }
  .rm2-sdd { position: absolute; top: calc(100% + 8px); right: 0; background: #0A0E1E; border: 1px solid rgba(255,255,255,.12); border-radius: 14px; overflow: hidden; min-width: 185px; box-shadow: 0 16px 50px rgba(0,0,0,.58); z-index: 10; }
  .rm2-si { display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 15px; background: none; border: none; cursor: pointer; font-family: var(--f); font-size: .82rem; transition: background .15s; }
  .rm2-si:hover { background: rgba(255,255,255,.07); }

  /* ── BOOK MODAL ── */
  .bm2 { position: fixed; inset: 0; z-index: 9999; background: rgba(1,2,6,.88); backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .bm2-box { width: 100%; max-width: 720px; max-height: 92vh; border-radius: 28px; background: #0A0F20; border: 1px solid rgba(255,255,255,.12); overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 50px 130px rgba(0,0,0,.78), inset 0 1px 0 rgba(255,255,255,.08); }
  .bm2-hd { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,.07); flex-shrink: 0; }
  .bm2-in { display: flex; gap: clamp(1.2rem,2.8vw,2.2rem); padding: clamp(1.3rem,2.8vw,2.2rem); overflow-y: auto; align-items: flex-start; }
  .bm2-in::-webkit-scrollbar { width: 4px; }
  .bm2-in::-webkit-scrollbar-thumb { background: rgba(201,168,76,.22); border-radius: 999px; }
  .bm2-cw { flex-shrink: 0; }
  .bm2-cv { width: clamp(120px,20vw,170px); height: auto; border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.12); display: block; }
  .bm2-cnt { flex: 1; min-width: 0; }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }

  /* ── SKELETON LOADING ── */
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.09) 40%, rgba(255,255,255,.04) 80%);
    background-size: 600px 100%;
    animation: shimmer 1.6s ease-in-out infinite;
    border-radius: 8px;
  }
  .sk-card {
    border-radius: 20px; border: 1px solid rgba(255,255,255,.05);
    background: rgba(9,12,24,.75); min-height: 230px;
    padding: 1.3rem; display: flex; flex-direction: column; gap: .9rem;
  }
  .sk-tag  { height: 21px; width: 78px; }
  .sk-ttl  { height: 19px; width: 74%; }
  .sk-ttl2 { height: 19px; width: 54%; margin-top: -5px; }
  .sk-line { height: 13px; }
  .sk-line2{ height: 13px; width: 84%; }
  .sk-line3{ height: 13px; width: 64%; }
  .sk-foot { height: 13px; width: 38%; margin-top: auto; }

  /* ── SCROLLBAR & SELECTION ── */
  * { scrollbar-width: thin; scrollbar-color: rgba(201,168,76,.22) transparent; }
  ::selection { background: rgba(201,168,76,.26); color: var(--t0); }

  /* ── ACCESSIBILITY ── */
  .book-card, .wc2, .sf-cat, .sf-vb, .lm2-btn, .book-btn-view, .book-btn-read, .book-btn-buy, .rb2-clr { outline: none; }
  .book-card:focus-visible, .wc2:focus-visible, .sf-cat:focus-visible, .lm2-btn:focus-visible { box-shadow: 0 0 0 3px rgba(201,168,76,.32), 0 0 0 1px rgba(242,237,228,.14) inset; }

  /* ── PREMIUM TOUCH FEEDBACK ── */
  @media (hover: none) {
    .wc2:active { transform: scale(.97); }
    .book-card:active { transform: scale(.97); }
    .sf-cat:active { transform: scale(.95); }
    .lm2-btn:active { transform: scale(.97); }
  }

  /* ── SAFE AREA ── */
  @supports (padding: env(safe-area-inset-bottom)) {
    .rm2-box { padding-bottom: env(safe-area-inset-bottom); }
  }

  /* ══════════════════════════════════════════════════
     RESPONSIVE
  ══════════════════════════════════════════════════ */
  @media (max-width: 980px) {
    .hero-layout { grid-template-columns: 1fr; }
    .hero-books { min-height: 300px; }
    .panel-head { flex-direction: column; }
    .featured-book-inner { grid-template-columns: auto 1fr; }
  }
  @media (max-width: 768px) {
    .sf-cats { display: none; }
    .wt-cats { display: flex; }
    .wg2 { grid-template-columns: 1fr; }
    .rb2 { align-items: flex-start; flex-direction: column; }
    .hero-wrap, .panel { border-radius: 22px; }
    .writing-tools { border-radius: 18px; }
    .bm2-in { flex-direction: column; }
    .bm2-cv { width: clamp(96px,34vw,140px); }
    .rm2-nt { max-width: 130px; }
    .featured-book-inner { grid-template-columns: 1fr; text-align: center; }
    .featured-cover-wrap { display: flex; justify-content: center; }
    .featured-book-actions { justify-content: center; }
    .books-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .hero-h1 { font-size: clamp(1.65rem,9.5vw,2.4rem); line-height: 1.12; }
    .hero-sub { font-size: .88rem; line-height: 1.78; }
    .hero-wrap { padding: 1.2rem; margin-bottom: .9rem; }
    .hero-layout { gap: 1rem; }
    .hero-books { min-height: 250px; border-radius: 22px; }
    .hero-book-stack { inset: 22px 14px; gap: 8px; }
    .hero-book { width: 66px; border-radius: 11px; }
    .hero-book:nth-child(2) { width: 80px; }
    .panel { padding: .9rem; margin-bottom: 1.1rem; }
    .panel-head h2 { font-size: 1.3rem; }
    .panel-head p { font-size: .8rem; line-height: 1.68; }
    .featured-book-inner { padding: 1rem; }
    .featured-cover-img { width: min(140px,50vw); }
    .featured-book-actions { flex-direction: column; }
    .featured-book-actions > * { width: 100%; justify-content: center; }
    .books-grid { grid-template-columns: repeat(2, 1fr); gap: .75rem; }
    .book-card-cover { width: 100px; }
    .book-card-title { font-size: .96rem; }
    .writing-tools { grid-template-columns: 1fr; position: relative; top: auto; padding: 9px; margin: .5rem 0 1.4rem; }
    .wc2 { min-height: 185px; }
    .rm2-box { border-radius: 22px 22px 0 0; }
    .rm2-body { padding: 1.8rem 1.4rem; }
    .rm2-ttl { font-size: 1.7rem; margin-bottom: 1.5rem; }
    .rm2-txt { font-size: 1.04rem; line-height: 2.18; }
    .wc2-l .wc2-body { flex-direction: column; align-items: flex-start; gap: .75rem; }
    .wc2-l .wc2-foot { width: 100%; margin-left: 0; justify-content: space-between; }
    .wt-view { justify-self: end; }
    .hero-stats { gap: .5rem; }
    .hero-stat { padding: 6px 10px; font-size: .7rem; }
    .sf-cat { padding: 8px 14px; font-size: .78rem; min-height: 38px; }
    .sf-s { height: 44px; }
    .sf-s input { font-size: .88rem; }
    .sf-vb { width: 34px; height: 34px; }
    .lm2-btn { padding: 14px 30px; font-size: .88rem; min-height: 50px; }
    .wc2-foot { padding-top: .9rem; }
    .book-card-actions > * { min-height: 42px; font-size: .82rem; }
    .featured-book-actions > * { min-height: 48px; font-size: .86rem; }
  }
  @media (max-width: 360px) {
    .mc { padding: .9rem .7rem; }
    .hero-wrap { padding: .95rem; }
    .panel { padding: .75rem; }
    .wg2 { grid-template-columns: 1fr; }
    .books-grid { grid-template-columns: 1fr; }
    .writing-tools { padding: 7px; gap: 6px; }
  }
`;

// ── Writing Card ──────────────────────────────────────────────────────────────
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
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: .4, delay: index * 0.032, ease: [.25,.46,.45,.94] }}
      onClick={onClick}
      role="article" tabIndex={0}
      aria-label={`${writing.title} পড়ুন`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      whileTap={{ scale: .97 }}
      data-href={`/writings/${slug}`}
    >
      <div className="wc2-glow"/>
      <div className="wc2-body">
        {isL ? (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="wc2-tags">
                {!hideShortWritingLabel && <span className="wc2-cat"><span style={{ fontSize: ".74rem" }}>{c.icon}</span>{writing.category}</span>}
                {writing.featured && <span className="wc2-star"><Star size={9} fill="currentColor"/> বিশেষ</span>}
              </div>
              <div className="wc2-title">{writing.title}</div>
            </div>
            <div className="wc2-foot" style={{ border: "none", padding: 0 }}>
              <span className="wc2-date"><Calendar size={10}/>{writing.date}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
                <button onClick={handleLike} title="ভালো লেগেছে" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: ".84rem", opacity: liked ? 1 : .4, transition: "opacity .15s, transform .15s", transform: liked ? "scale(1.22)" : "scale(1)" }}>
                  {liked ? "❤️" : "🤍"}
                </button>
                <button onClick={handleShare} title="শেয়ার করুন" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: ".84rem", opacity: .4, transition: "opacity .15s" }}>
                  <Share2 size={11}/>
                </button>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }} className="wc2-read" style={{ color: c.accent, display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }} aria-label={`${writing.title} পড়ুন`}>
                  পড়ুন <ArrowRight size={11}/>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="wc2-tags">
              {!hideShortWritingLabel && <span className="wc2-cat"><span style={{ fontSize: ".74rem" }}>{c.icon}</span>{writing.category}</span>}
              {writing.featured && <span className="wc2-star"><Star size={9} fill="currentColor"/> বিশেষ</span>}
            </div>
            {!hideShortWritingLabel && <div className="wc2-title">{writing.title}</div>}
            <div className="wc2-preview">{writing.content}</div>
            <div className="wc2-foot">
              <span className="wc2-date"><Calendar size={10}/>{writing.date}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={handleLike} title="ভালো লেগেছে" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: ".84rem", opacity: liked ? 1 : .4, transition: "opacity .15s, transform .15s", transform: liked ? "scale(1.22)" : "scale(1)" }}>
                  {liked ? "❤️" : "🤍"}
                </button>
                <button onClick={handleShare} title="শেয়ার করুন" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: ".84rem", opacity: .4, transition: "opacity .15s" }}>
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

// ── Writing Modal — Immersive Reader ─────────────────────────────────────────
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
    <motion.div className="rm2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .28 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="rm2-box" style={{ background: T.bg }}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 36, stiffness: 310 }}>
        <div className="rm2-hnd" style={{ background: T.hnd }}/>
        <div className="rm2-prog" style={{ background: "rgba(255,255,255,.05)" }}>
          <div className="rm2-pf" style={{ width: `${progress}%`, background: T.prog }}/>
        </div>
        <div className="rm2-hd" style={{ borderColor: T.bdr }}>
          <div className="rm2-hdl">
            <span style={{ fontFamily:"var(--f)", fontSize:".71rem", color:T.sub, fontWeight:500 }}>লেখালেখি ও বই</span>
          </div>
          <div className="rm2-ctrl">
            <div className="rm2-fc" style={{ borderColor: T.bdr }}>
              <button className="rm2-fb" style={{ color: T.sub }} onClick={() => setFontSize(f => Math.max(.82, f - .1))}><AArrowDown size={13}/></button>
              <button className="rm2-fb" style={{ color: T.sub, borderLeft: `1px solid ${T.bdr}` }} onClick={() => setFontSize(f => Math.min(1.4, f + .1))}><AArrowUp size={13}/></button>
            </div>
            <button className="rm2-th" style={{ color: T.sub, borderColor: T.bdr }} onClick={() => setTheme(t => t === "dark" ? "sepia" : t === "sepia" ? "light" : "dark")}>
              {theme === "dark" ? <Moon size={12}/> : theme === "sepia" ? <Scroll size={12}/> : <Sun size={12}/>}
              <span style={{ fontSize:".68rem" }}>{theme === "dark" ? "ডার্ক" : theme === "sepia" ? "সেপিয়া" : "লাইট"}</span>
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
          <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: `1px solid ${T.bdr}` }}>
            {!hideShortWritingLabel && (
              <div style={{ marginBottom: ".8rem" }}>
                <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 13px", borderRadius:999, background:c.bg, color:c.accent, border:`1px solid ${c.border}`, fontFamily:"var(--f)", fontSize:".69rem", fontWeight:700, letterSpacing:".06em", textTransform:"uppercase" }}>
                  <span>{c.icon}</span>{writing.category}
                </span>
              </div>
            )}
            <h1 style={{ fontFamily:"var(--f)", fontSize:"clamp(1.4rem, 4vw, 2rem)", color:T.txt, lineHeight:1.35, margin:"0 0 1rem", fontWeight:700, letterSpacing:"-.02em" }}>
              {writing.title}
            </h1>
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:"0.55rem 1.1rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg, ${c.accent}30, ${c.accent}10)`, border:`1.5px solid ${c.accent}40`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Feather size={12} color={c.accent}/>
                </div>
                <div>
                  <div style={{ fontFamily:"var(--f)", fontSize:".8rem", color:T.txt, fontWeight:600, lineHeight:1.2 }}>মাহবুব সরদার সবুজ</div>
                  <div style={{ fontFamily:"var(--f)", fontSize:".66rem", color:T.sub, lineHeight:1.2 }}>লেখক ও কবি</div>
                </div>
              </div>
              <span style={{ color:T.bdr, fontSize:".8rem" }}>·</span>
              <span style={{ fontFamily:"var(--f)", fontSize:".73rem", color:T.sub }}>{writing.date}</span>
              <span style={{ color:T.bdr, fontSize:".8rem" }}>·</span>
              <span style={{ fontFamily:"var(--f)", fontSize:".73rem", color:T.sub, display:"flex", alignItems:"center", gap:4 }}>⏱ {readTimeLabel} পড়তে লাগবে</span>
            </div>
          </div>
          <div className="rm2-txt" style={{ color:T.txt, fontSize:`${fontSize}rem`, whiteSpace:'pre-line' }}>
            {writing.content.split(/\n\n+/).map((para, i) => (
              para.trim() ? <p key={i} style={{ marginBottom:'2rem', lineHeight:'2.4', fontSize:'inherit' }}>{para.trim()}</p> : null
            ))}
          </div>
          <div className="rm2-sig" style={{ borderColor:T.bdr, color:T.txt }}>
            <span style={{ color:c.accent, marginRight:6 }}>{c.icon}</span>
            মাহবুব সরদার সবুজ
            <span style={{ margin:"0 8px", opacity:.4 }}>·</span>
            {writing.category}
            <span style={{ margin:"0 8px", opacity:.4 }}>·</span>
            {writing.date}
          </div>
          {relatedWritings.length > 0 && (
            <div style={{ marginTop:"2.2rem", paddingTop:"1.6rem", borderTop:`1px solid ${T.bdr}` }}>
              <p style={{ color:T.sub, fontSize:".71rem", fontFamily:"var(--f)", letterSpacing:".1em", textTransform:"uppercase", marginBottom:".9rem", fontWeight:600 }}>সম্পর্কিত লেখা</p>
              <div style={{ display:"flex", flexDirection:"column", gap:".55rem" }}>
                {relatedWritings.map(rw => (
                  <button key={rw.id} onClick={() => onNavigate(rw)} style={{ textAlign:"left", padding:".72rem 1rem", borderRadius:10, background:"rgba(255,255,255,.04)", border:`1px solid ${T.bdr}`, color:T.txt, cursor:"pointer", fontSize:".84rem", fontFamily:"var(--f)", lineHeight:1.45, transition:"background .15s, border-color .15s" }}
                    onMouseEnter={e => { (e.currentTarget.style.background="rgba(255,255,255,.08)"); (e.currentTarget.style.borderColor="rgba(255,255,255,.13)"); }}
                    onMouseLeave={e => { (e.currentTarget.style.background="rgba(255,255,255,.04)"); (e.currentTarget.style.borderColor=T.bdr); }}>
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

// ── Book Modal ────────────────────────────────────────────────────────────────
function BookModal({ book, onClose }: { book: typeof ebooks[0]; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return createPortal(
    <motion.div className="bm2" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="bm2-box"
        initial={{ opacity:0, scale:.92, y:26 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:.92, y:26 }}
        transition={{ type:"spring", damping:32, stiffness:280 }}>
        <div className="bm2-hd">
          <span style={{ fontFamily:"var(--f)", fontSize:".76rem", color:"rgba(242,237,228,.4)", display:"flex", alignItems:"center", gap:6 }}>
            <BookOpen size={13} color={book.accentColor}/> {book.subtitle}
          </span>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.09)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"rgba(242,237,228,.4)", transition:"all .2s" }}>
            <X size={14}/>
          </button>
        </div>
        <div className="bm2-in">
          <div className="bm2-cw">
            <img src={book.cover} alt={`${book.title} - ${book.genre} ই-বুক কভার - মাহবুব সরদার সবুজ`} className="bm2-cv" loading="lazy" decoding="async"
              onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='213' viewBox='0 0 160 213'%3E%3Crect fill='%230D1120'/%3E%3Ctext x='50%25' y='50%25' fill='%23C9A84C' font-size='14' text-anchor='middle' dominant-baseline='middle'%3E📖%3C/text%3E%3C/svg%3E"; }}/>
          </div>
          <div className="bm2-cnt">
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 13px", borderRadius:999, background:`${book.accentColor}14`, border:`1px solid ${book.accentColor}28`, marginBottom:"1rem" }}>
              <span style={{ fontFamily:"var(--f)", fontSize:".64rem", color:book.accentColor, letterSpacing:".1em", textTransform:"uppercase", fontWeight:600 }}>{book.badge}</span>
            </div>
            <h2 style={{ fontFamily:"var(--f)", fontSize:"1.28rem", color:"#EDE8DE", lineHeight:1.5, marginBottom:".72rem", fontWeight:700, letterSpacing:"-.018em" }}>{book.title}</h2>
            <p style={{ fontFamily:"var(--f)", fontSize:".86rem", color:"rgba(237,232,222,.6)", lineHeight:2.0, marginBottom:"1.2rem" }}>{book.description}</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:"1.4rem" }}>
              {[book.genre, `${book.pages} পৃষ্ঠা`, book.year].map((t, i) => (
                <span key={i} style={{ padding:"4px 12px", borderRadius:999, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", fontFamily:"var(--f)", fontSize:".7rem", color:"rgba(237,232,222,.46)" }}>{t}</span>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {book.buyLink && (
                <a href={book.buyLink} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 20px", borderRadius:999, background:`linear-gradient(135deg,${book.accentColor},${book.accentColor}CC)`, color:"#080A14", fontFamily:"var(--f)", fontSize:".84rem", textDecoration:"none", transition:"all .26s", boxShadow:`0 8px 26px ${book.accentColor}30`, fontWeight:700 }}>
                  <ShoppingCart size={13}/> কিনুন
                </a>
              )}
              {book.canRead && (
                <a href={`/ebooks/read/${book.slug}`} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 20px", borderRadius:999, background:"transparent", color:book.accentColor, fontFamily:"var(--f)", fontSize:".84rem", textDecoration:"none", border:`1.5px solid ${book.accentColor}38`, transition:"all .26s", fontWeight:600 }}>
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
  const heroBooks = ebooks.filter(b => b.isFeatured).slice(0,3);
  const books = heroBooks.length >= 3 ? heroBooks : ebooks.slice(0,3);

  return (
    <motion.section
      className="hero-wrap"
      aria-labelledby="hero-title"
      initial={{ opacity:0, y:24 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:.55, ease:[.25,.46,.45,.94] }}
    >
      <div className="hero-layout">
        <div>
          <motion.div className="hero-eyebrow" initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} transition={{ delay:.12, duration:.45 }}>
            <Feather size={12}/> সাহিত্য সংগ্রহ
          </motion.div>
          <motion.h1 id="hero-title" className="hero-h1" initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2, duration:.5 }}>
            লেখালেখি ও{" "}
            <span className="hero-h1-gold">বই</span>
          </motion.h1>
          <motion.p className="hero-sub" initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:.28, duration:.46 }}>
            মাহবুব সরদার সবুজের কবিতা, অনুভূতির লেখা এবং বইয়ের নির্বাচিত সংগ্রহ — পাঠকের জন্য সাজানো এক নান্দনিক সাহিত্যভুবন।
          </motion.p>
          <motion.div className="hero-stats" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.36, duration:.44 }}>
            <div className="hero-stat"><span className="hero-stat-num">{totalWritings > 0 ? `${totalWritings}+` : "৩০০+"}</span><span>লেখা</span></div>
            <div className="hero-stat"><span className="hero-stat-num">{ebooks.length}</span><span>বই ও ই-বুক</span></div>
            <div className="hero-stat"><span className="hero-stat-num">৫</span><span>ক্যাটাগরি</span></div>
          </motion.div>
        </div>
        <motion.div className="hero-books" aria-label="নির্বাচিত বইয়ের প্রদর্শনী"
          initial={{ opacity:0, scale:.94 }} animate={{ opacity:1, scale:1 }} transition={{ delay:.18, duration:.55 }}>
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

// ── Book Card (grid item) ─────────────────────────────────────────────────────
function BookCard({ book, index }: { book: typeof ebooks[0]; index: number }) {
  const [, setLocation] = useLocation();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.article
      ref={ref}
      className="book-card"
      style={{ "--ba": book.accentColor } as React.CSSProperties}
      initial={{ opacity:0, y:28, rotateX:6 }}
      animate={isInView ? { opacity:1, y:0, rotateX:0 } : { opacity:0, y:28, rotateX:6 }}
      transition={{ delay:index*.07, duration:.44, ease:[.25,.46,.45,.94] }}
      onClick={() => setLocation(`/ebooks/read/${book.slug}`)}
      role="article" tabIndex={0}
      aria-label={`${book.title} দেখুন`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLocation(`/ebooks/read/${book.slug}`); } }}
    >
      <div className="book-card-glow"/>
      <div className="book-card-cover-wrap">
        <img src={book.cover} alt={`${book.title} - ${book.genre} বাংলা ই-বুক - মাহবুব সরদার সবুজ`} className="book-card-cover" loading="lazy" decoding="async"
          onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='267' viewBox='0 0 200 267'%3E%3Crect fill='%230D1120'/%3E%3Ctext x='50%25' y='50%25' fill='%23C9A84C' font-size='14' text-anchor='middle' dominant-baseline='middle'%3E📖%3C/text%3E%3C/svg%3E"; }}/>
        <span className="book-card-badge">{book.isFeatured && <Crown size={10}/>} {book.badge}</span>
      </div>
      <div className="book-card-body">
        <span className="book-card-genre">{book.genre}</span>
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-desc">{book.description}</p>
        <div className="book-card-meta"><Calendar size={10}/>{book.year} · {book.pages} পৃষ্ঠা</div>
        <div className="book-card-actions">
          <Link href={`/ebooks/read/${book.slug}`} onClick={(e) => e.stopPropagation()} className="book-btn-view" style={{ display:"flex", alignItems:"center", gap:5, textDecoration:"none" }}><Eye size={12}/> দেখুন</Link>
          {book.canRead && <Link href={`/ebooks/read/${book.slug}`} onClick={(e) => e.stopPropagation()} className="book-btn-read"><BookOpen size={12}/> পড়ুন</Link>}
          {book.buyLink && <a href={book.buyLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="book-btn-buy"><ShoppingCart size={12}/> কিনুন</a>}
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
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.section
      ref={ref}
      className="panel panel-gold"
      aria-labelledby="books-title"
      initial={{ opacity:0, y:24 }}
      animate={isInView ? { opacity:1, y:0 } : { opacity:0, y:24 }}
      transition={{ duration:.48, ease:[.25,.46,.45,.94] }}
    >
      <div className="panel-head">
        <div>
          <div className="section-eyebrow"><Library size={12}/> বই ও ই-বুক</div>
          <h2 id="books-title">প্রকাশনা সংগ্রহ</h2>
          <p>মাহবুব সরদার সবুজের প্রকাশিত বই ও ই-বুকের সম্পূর্ণ সংগ্রহ</p>
        </div>
        <Link href="/ebooks" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:999, border:"1px solid rgba(201,168,76,.25)", background:"rgba(201,168,76,.07)", color:"#C9A84C", fontFamily:"var(--f)", fontSize:".78rem", textDecoration:"none", fontWeight:600, transition:"all .22s", whiteSpace:"nowrap", flexShrink:0 }}>
          সব বই <ArrowRight size={13}/>
        </Link>
      </div>

      {/* Featured book — full width hero */}
      <motion.article
        className="featured-book-hero"
        style={{ "--ba": featured.accentColor } as React.CSSProperties}
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:.44, ease:[.25,.46,.45,.94] }}
        onClick={() => setLocation(`/ebooks/read/${featured.slug}`)}
        role="article" tabIndex={0}
        aria-label={`${featured.title} দেখুন`}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLocation(`/ebooks/read/${featured.slug}`); } }}
      >
        <div className="featured-book-inner">
          <div className="featured-cover-wrap">
            <img src={featured.cover} alt={`${featured.title} - ${featured.genre} বই - মাহবুব সরদার সবুজ`} className="featured-cover-img" loading="eager" decoding="async" fetchPriority="high"/>
            <span className="featured-cover-badge"><Crown size={10}/> {featured.badge}</span>
          </div>
          <div className="featured-book-content">
            <div className="featured-book-genre">{featured.genre}</div>
            <h3 className="featured-book-title">{featured.title}</h3>
            <p className="featured-book-desc">{featured.description}</p>
            <div className="featured-book-meta">
              <span><Calendar size={10}/>{featured.year}</span>
              <span><BookMarked size={10}/>{featured.pages} পৃষ্ঠা</span>
              <span><Star size={10}/> বিশেষ সংস্করণ</span>
            </div>
            <div className="featured-book-actions">
              {featured.buyLink && (
                <a href={featured.buyLink} target="_blank" rel="noopener noreferrer" className="btn-buy" onClick={(e) => e.stopPropagation()}
                  style={{ background:`linear-gradient(135deg,${featured.accentColor},${featured.accentColor}CC)`, boxShadow:`0 8px 26px ${featured.accentColor}38` }}>
                  <ShoppingCart size={14}/> এখনই কিনুন
                </a>
              )}
              <Link href={`/ebooks/read/${featured.slug}`} onClick={(e) => e.stopPropagation()} className="btn-read">
                <BookOpen size={14}/> পড়ুন
              </Link>
            </div>
          </div>
        </div>
      </motion.article>

      {/* Remaining books grid */}
      <div className="books-grid">
        {remaining.map((book, i) => <BookCard key={book.id} book={book} index={i+1}/>)}
      </div>
    </motion.section>
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
    if (deferredQuery.trim()) { const qn = deferredQuery.trim().toLowerCase(); list = list.filter(w => w.title.toLowerCase().includes(qn) || w.content.toLowerCase().includes(qn)); }
    return list;
  }, [archive, cat, deferredQuery]);

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

  const handleCardClick = useCallback((w: Writing) => { setLocation(`/writings/${makeSlug(w.title, w.id)}`); }, [setLocation]);
  const handleModalClose = useCallback(() => { setSel(null); setLocation("/writings"); }, [setLocation]);
  const handleNavigate = useCallback((w: Writing) => { setSel(w); setLocation(`/writings/${makeSlug(w.title, w.id)}`); }, [setLocation]);

  const seoPath = sel ? `/writings/${makeSlug(sel.title, sel.id)}` : "/writings";
  const seoTitle = sel ? `${sel.title} — মাহবুব সরদার সবুজ` : "লেখালেখি ও বই — মাহবুব সরদার সবুজ | ২২৫৮+ কবিতা ও লেখা";
  const seoDescription = sel
    ? `${makeExcerpt(sel.content, 155)} — মাহবুব সরদার সবুজ`
    : "মাহবুব সরদার সবুজের ২২৫৮+ বাংলা কবিতা, ছোট লেখা, ভালোবাসার লেখা, বিচ্ছেদের কবিতা ও জীবনদর্শন। বিনামূল্যে পড়ুন।";
  const catKeywordMap: Record<string, string> = {
    "ভালোবাসা": "ভালোবাসার কবিতা, প্রেমের লেখা, love poem bangla, ভালোবাসার স্ট্যাটাস",
    "বিচ্ছেদ": "বিচ্ছেদের কবিতা, বিরহের লেখা, কষ্টের কবিতা, sad bangla poem",
    "কবিতা": "বাংলা কবিতা, bangla kobita, কবিতা পড়ুন, বাংলা সাহিত্য",
    "ছোট লেখা": "বাংলা স্ট্যাটাস, ছোট কবিতা, bangla status, বাংলা উক্তি",
    "জীবনদর্শন": "জীবনদর্শন, জীবনের কথা, অনুপ্রেরণামূলক লেখা, motivational bangla",
  };
  const seoKeywords = sel
    ? `${sel.title}, ${sel.category}, মাহবুব সরদার সবুজ, ${catKeywordMap[sel.category] ?? "বাংলা কবিতা, bangla kobita"}, Mahbub Sardar Sabuj`
    : "মাহবুব সরদার সবুজ লেখা, বাংলা কবিতা, বাংলা ই-বুক, বাংলা বই, ভালোবাসার লেখা, বিচ্ছেদের লেখা, জীবনদর্শন, Mahbub Sardar Sabuj writings, bangla kobita, bangla poem collection, বাংলা কবিতা পড়ুন, বাংলা সাহিত্য, বাংলাদেশি কবির লেখা";

  const writingsJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      { "@type":"CollectionPage", "@id":siteUrl("/writings#collection"), "name":"লেখালেখি ও বই — মাহবুব সরদার সবুজ", "url":siteUrl("/writings"), "inLanguage":"bn-BD", "description":"মাহবুব সরদার সবুজের বই, ই-বুক, কবিতা, ভালোবাসা, বিচ্ছেদ ও জীবনদর্শনের লেখাগুলোর curated সংগ্রহ।", "isPartOf":{ "@type":"WebSite", "@id":siteUrl("/#website"), "name":"মাহবুব সরদার সবুজ" }, "about":{ "@id":siteUrl("/about#author") } },
      { "@type":"Person", "@id":siteUrl("/about#author"), "name":"মাহবুব সরদার সবুজ", "alternateName":"Mahbub Sardar Sabuj", "url":siteUrl("/about"), "knowsLanguage":["bn-BD","en"] },
      { "@type":"BreadcrumbList", "itemListElement":[ { "@type":"ListItem","position":1,"name":"হোম","item":siteUrl("/") }, { "@type":"ListItem","position":2,"name":"লেখালেখি ও বই","item":siteUrl("/writings") }, ...(sel?[{ "@type":"ListItem","position":3,"name":sel.title,"item":siteUrl(seoPath) }]:[]) ] },
      { "@type":"ItemList", "@id":siteUrl("/writings#latest-writings"), "name":"নির্বাচিত অনুভূতির আর্কাইভ — মাহবুব সরদার সবুজের ২২৫৮+ লেখা", "itemListElement":archive.slice(0,24).map((writing,index) => ({ "@type":"ListItem","position":index+1,"url":siteUrl(`/writings/${makeSlug(writing.title,writing.id)}`),"name":writing.title })) },
      ...ebooks.map(book => ({ "@type":"Book","@id":siteUrl(`/ebooks/read/${book.slug}#book`),"name":book.title,"inLanguage":"bn-BD","author":{"@id":siteUrl("/about#author")},"url":siteUrl(`/ebooks/read/${book.slug}`),"image":siteUrl(book.cover),"description":book.description,"genre":book.genre,"bookFormat":book.badge.includes("ফিজিক্যাল")?"https://schema.org/Hardcover":"https://schema.org/EBook","isAccessibleForFree":!book.buyLink })),
      ...(sel?[{ "@type":"CreativeWork","@id":siteUrl(`${seoPath}#writing`),"name":sel.title,"headline":sel.title,"url":siteUrl(seoPath),"inLanguage":"bn-BD","text":makeExcerpt(sel.content,500),"description":makeExcerpt(sel.content),"datePublished":sel.date,"genre":sel.category,"author":{"@id":siteUrl("/about#author")},"isAccessibleForFree":true }]:[]),
    ],
  }), [archive, sel, seoPath]);

  return (
    <>
      <Seo title={seoTitle} description={seoDescription} path={seoPath}
        keywords={seoKeywords}
        jsonLd={writingsJsonLd}/>
      <Navbar/>
      <style>{CSS}</style>

      <div className="wp">
        <div className="mc">
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
            initial={{ opacity:0, y:24 }}
            animate={isWritingsInView ? { opacity:1, y:0 } : { opacity:0, y:24 }}
            transition={{ duration:.48, ease:[.25,.46,.45,.94] }}
          >
            <div className="panel-head">
              <div>
                <div
 className="section-eyebrow"><Feather size={12}/> লেখালেখি</div>
                <h2 id="writings-title">নির্বাচিত অনুভূতির আর্কাইভ</h2>
                <p>ভালোবাসা, বিচ্ছেদ, কবিতা ও জীবনদর্শনের সেরা লেখাগুলো</p>
              </div>
            </div>

            {/* Tools bar */}
            <div className="writing-tools">
              <div className="sf-s wt-search">
                <Search size={13} color="rgba(240,234,224,.32)"/>
                <input type="text" placeholder="লেখা খুঁজুন…" aria-label="লেখা খুঁজুন" value={q} onChange={e => setQ(e.target.value)} disabled={!archiveReady}/>
                {q && <button aria-label="সার্চ মুছে ফেলুন" onClick={() => setQ("")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(240,234,224,.32)", display:"flex", transition:"color .15s" }}><X size={12}/></button>}
              </div>
              <div className="sf-cats wt-cats">
                {CATS.map(c2 => (
                  <motion.button key={c2.id} className="sf-cat"
                    style={cat === c2.id ? { background:`${c2.color}10`, color:c2.color, borderColor:`${c2.color}28`, boxShadow:`0 0 14px ${c2.glow}, 0 2px 8px rgba(0,0,0,.2)` } : {}}
                    onClick={() => setCat(c2.id)} aria-pressed={cat === c2.id} whileTap={{ scale:.92 }}>
                    <span style={{ fontSize:".76rem" }}>{c2.icon}</span>{c2.label}
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
              <div className="rb2">
                <div className="rb2-t">
                  {cat !== "all" && <span style={{ color:CATS.find(c2=>c2.id===cat)?.color }}>{CATS.find(c2=>c2.id===cat)?.label}</span>}
                  {cat !== "all" && deferredQuery && <span>·</span>}
                  {deferredQuery && <span>"{deferredQuery}"</span>}
                  {filtered.length > 0 && <span style={{ color:"rgba(240,234,224,.2)" }}>— {filtered.length}টি লেখা</span>}
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
                        <div className="sk-line skeleton" style={{ width:"88%" }}/>
                      </div>
                      <div className="sk-foot skeleton"/>
                    </div>
                  ))}
                </div>
              </div>
            ) : filtered.length > 0 ? (
              <>
                {/* বড় লেখা সেকশন */}
                {visibleWritings.length > 0 && (
                  <>
                    {cat === "all" && longWritings.length > 0 && (
                      <div className="section-divider">
                        <span className="section-divider-label" style={{ color:"rgba(201,168,76,.55)" }}>✦ বড় লেখা</span>
                        <div className="section-divider-line" style={{ background:"rgba(201,168,76,.1)" }}/>
                        <span className="section-divider-count">{longWritings.length}টি</span>
                      </div>
                    )}
                    <div className={viewMode==="grid"?"wg2":"wg2-l"}>
                      {visibleWritings.map((w, i) => (
                        <WritingCard key={w.id} writing={w} index={i} onClick={() => handleCardClick(w)} viewMode={viewMode}/>
                      ))}
                    </div>
                    {hasMoreWritings && (
                      <div className="lm2">
                        <motion.button className="lm2-btn" aria-label="আরও বড় লেখা দেখুন" onClick={() => setVisibleCount(n => Math.min(n + WRITINGS_PAGE_SIZE, mainList.length))} whileTap={{ scale:.96 }}>
                          <ChevronDown size={14}/> আরও বড় লেখা দেখুন
                        </motion.button>
                        <span className="lm2-note">{visibleCount} / {mainList.length} লেখা দেখানো হচ্ছে</span>
                      </div>
                    )}
                  </>
                )}

                {/* ছোট লেখা সেকশন */}
                {cat === "all" && shortWritings.length > 0 && (
                  <motion.div
                    initial={{ opacity:0, y:16 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ duration:.42, delay:.1, ease:[.25,.46,.45,.94] }}
                    style={{ marginTop:"2.5rem" }}
                  >
                    <div className="section-divider">
                      <span className="section-divider-label" style={{ color:"rgba(52,211,153,.6)" }}>✎ ছোট লেখা</span>
                      <div className="section-divider-line" style={{ background:"rgba(52,211,153,.1)" }}/>
                      <span className="section-divider-count">{shortWritings.length}টি</span>
                    </div>
                    <div className={viewMode==="grid"?"wg2":"wg2-l"}>
                      {visibleShortWritings.map((w, i) => (
                        <WritingCard key={w.id} writing={w} index={i} onClick={() => handleCardClick(w)} viewMode={viewMode}/>
                      ))}
                    </div>
                    {hasMoreShortWritings && (
                      <div className="lm2">
                        <motion.button className="lm2-btn" aria-label="আরও ছোট লেখা দেখুন" onClick={() => setVisibleShortCount(n => Math.min(n + WRITINGS_PAGE_SIZE, shortWritings.length))} whileTap={{ scale:.96 }}>
                          <ChevronDown size={14}/> আরও ছোট লেখা দেখুন
                        </motion.button>
                        <span className="lm2-note">{visibleShortCount} / {shortWritings.length} লেখা দেখানো হচ্ছে</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            ) : (
              <div className="wc2-em">
                <Search size={28} color="rgba(240,234,224,.1)" style={{ margin:"0 auto 1rem", display:"block" }}/>
                <div style={{ fontSize:".95rem", color:"rgba(240,234,224,.28)", fontFamily:"var(--f)" }}>কোনো লেখা পাওয়া যায়নি</div>
                <button onClick={() => { setCat("all"); setQ(""); }} style={{ marginTop:"1rem", padding:"9px 20px", borderRadius:999, border:"1px solid rgba(201,168,76,.26)", background:"rgba(201,168,76,.08)", color:"#C9A84C", fontFamily:"var(--f)", fontSize:".8rem", cursor:"pointer", fontWeight:600 }}>
                  সব লেখা দেখুন
                </button>
              </div>
            )}
          </motion.section>
        </div>
      </div>

      <div style={{ maxWidth:840, margin:"0 auto", padding:"1.5rem 1rem" }}>
        <AdSenseAd adSlot={AD_SLOTS.WRITINGS_INLINE} adFormat="auto" fullWidthResponsive={true}/>
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
