/*
 * Premium E-Books Page — Mahbub Sardar Sabuj
 * Design: CINEMATIC LITERARY UNIVERSE — Dark Premium
 * Palette: Void #020408 | Obsidian #06080F | Gold #C9A84C | Amber #E8C87A | Cream #F2EDE4
 * Features: Glassmorphism | 3D Book Cards | Smooth Animations | Mobile-First
 */
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef } from "react";
import {
  BookOpen, Eye, X, Star, ShoppingCart, BookMarked, Sparkles,
  Copy, Check, Share2, Crown, Library, ArrowRight, Calendar,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Link } from "wouter";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";

const ebooks = [
  {
    id: 1,
    slug: "dukkhovilash",
    title: "আমি বিচ্ছেদকে বলি দুঃখবিলাস",
    subtitle: "প্রথম ফিজিক্যাল বই",
    cover: "/images/ebooks/dukkhovilash.png",
    description:
      "'আমি বিচ্ছেদকে বলি দুঃখবিলাস' — লেখক মাহবুব সরদার সবুজের প্রথম প্রকাশিত ফিজিক্যাল বই। বিচ্ছেদের ব্যথা, হারানোর কষ্ট আর জীবনের গভীর অনুভূতিগুলো এই বইয়ে অনন্যভাবে তুলে ধরা হয়েছে। প্রতিটি পাতায় লুকিয়ে আছে এক অন্যরকম ভালোবাসার গল্প।",
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
      "'স্মৃতির বসন্তে তুমি' — মাহবুব সরদার সবুজের একটি আবেগঘন কাব্যিক সংকলন। স্মৃতির গভীরে হারিয়ে যাওয়া প্রিয় মুহূর্তগুলো নিয়ে লেখা এই বইটি। চাঁদের আলোয় ভেজা রাত, পুকুরের জলে পদ্মপাতা — সব মিলিয়ে এক অসাধারণ কাব্যিক যাত্রা।",
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
      "'চাঁদফুল' — মাহবুব সরদার সবুজের একটি বিশেষ কাব্যগ্রন্থ যেখানে প্রকৃতির অপরূপ সৌন্দর্য আর মানবমনের কোমল অনুভূতির মেলবন্ধন ঘটেছে। চাঁদের আলো আর ফুলের সুবাস মিলিয়ে তৈরি এক অনন্য সাহিত্যকর্ম।",
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
      "'সময়ের গহ্বরে' — মাহবুব সরদার সবুজের একটি নস্টালজিক সাহিত্যকর্ম। সময়ের স্রোতে হারিয়ে যাওয়া শহর, মানুষ আর স্মৃতির কথা এই বইয়ে অনবদ্যভাবে উঠে এসেছে। পুরনো শহরের গলিপথ, রেলস্টেশনের ঘড়ি — সব মিলিয়ে এক অসাধারণ নস্টালজিক যাত্রা।",
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
    subtitle: "ই-বুক সংকলন",
    cover: "/images/ebooks/onoboddo-lekha-new.png",
    description:
      "মাহবুব সরদার সবুজের বিভিন্ন সময়ে লেখা অনবদ্য কবিতা ও গদ্যের একটি বিশেষ সংকলন। জীবনের নানা অনুভূতি, প্রেম, বিচ্ছেদ ও দর্শনের কথা এই বইয়ে অনন্যভাবে উঠে এসেছে।",
    genre: "কবিতা ও গদ্য সংকলন",
    pages: "৮০+",
    year: "২০২৪",
    badge: "ই-বুক",
    badgeColor: "#8B5CF6",
    buyLink: null,
    isFeatured: true,
    canRead: true,
    accentColor: "#8B5CF6",
  },
];

// ── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@300;400;500;600;700&display=swap');

  :root {
    --eb-void:  #020408;
    --eb-bg0:   #04060C;
    --eb-bg1:   #06080F;
    --eb-bg2:   #090C18;
    --eb-t0:    #F2EDE4;
    --eb-t1:    rgba(242,237,228,.88);
    --eb-t2:    rgba(242,237,228,.56);
    --eb-t3:    rgba(242,237,228,.30);
    --eb-gold:  #C9A84C;
    --eb-gold2: #E8C87A;
    --eb-bdr:   rgba(255,255,255,.055);
    --eb-bdr2:  rgba(255,255,255,.10);
    --eb-f:     'AdorshoLipi', 'Noto Serif Bengali', serif;
    --eb-ease:  cubic-bezier(.25,.46,.45,.94);
    --eb-silk:  cubic-bezier(.16,1,.3,1);
  }

  /* ── PAGE ── */
  .eb-page {
    background: var(--eb-void);
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
  }
  .eb-page::before {
    content: "";
    position: fixed; inset: 0;
    pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 80% 50% at 12% 0%,   rgba(201,168,76,.12) 0%, transparent 52%),
      radial-gradient(ellipse 60% 40% at 88% 10%,  rgba(244,114,182,.08) 0%, transparent 48%),
      radial-gradient(ellipse 50% 40% at 50% 100%, rgba(96,165,250,.06) 0%, transparent 50%);
  }

  /* ── AURORA ── */
  .eb-aurora {
    position: fixed; inset: 0;
    pointer-events: none; z-index: 0; opacity: .5;
    background:
      linear-gradient(122deg, transparent 0 18%, rgba(201,168,76,.055) 34%, transparent 52% 100%),
      radial-gradient(ellipse at 40% 0%, rgba(232,200,122,.10), transparent 38%);
    animation: ebAurora 22s ease-in-out infinite alternate;
  }
  @keyframes ebAurora {
    0%   { opacity:.4; transform: translateX(0) scale(1); }
    50%  { opacity:.6; transform: translateX(12px) scale(1.015); }
    100% { opacity:.45; transform: translateX(-8px) scale(.99); }
  }

  /* ── MAIN CONTENT ── */
  .eb-mc {
    max-width: 1260px;
    margin: 0 auto;
    padding: clamp(1.5rem,3vw,2.5rem) clamp(1rem,4vw,2.5rem);
    position: relative; z-index: 1;
    padding-top: calc(var(--site-nav-offset,98px) + clamp(1.2rem,3vw,2.2rem));
  }

  /* ── HERO STAGE ── */
  .eb-hero {
    position: relative; overflow: hidden;
    border-radius: clamp(28px,5vw,52px);
    margin-bottom: clamp(1.6rem,3.5vw,2.8rem);
    padding: clamp(2rem,5vw,4rem) clamp(1.5rem,4vw,3rem);
    background:
      linear-gradient(150deg, rgba(255,255,255,.09) 0%, rgba(255,255,255,.025) 55%),
      radial-gradient(ellipse 90% 120% at 95% -10%, rgba(201,168,76,.22) 0%, transparent 48%),
      radial-gradient(ellipse 60% 80% at 0% 110%,  rgba(96,165,250,.10) 0%, transparent 45%),
      rgba(6,8,15,.82);
    box-shadow:
      0 50px 140px rgba(0,0,0,.5),
      0 0 0 1px rgba(255,255,255,.055),
      inset 0 1px 0 rgba(255,255,255,.12),
      inset 0 -1px 0 rgba(0,0,0,.4);
    backdrop-filter: blur(24px);
  }
  .eb-hero::before {
    content: "";
    position: absolute; inset: -1px;
    border-radius: inherit; padding: 1px;
    background: linear-gradient(135deg,
      rgba(201,168,76,.6) 0%,
      rgba(255,255,255,.12) 25%,
      transparent 50%,
      rgba(96,165,250,.2) 100%
    );
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none; opacity: .6;
  }
  .eb-hero::after {
    content: "";
    position: absolute; top: 0; left: 5%; right: 5%; height: 1px;
    background: linear-gradient(90deg,
      transparent, rgba(201,168,76,.7) 20%,
      rgba(255,255,255,.5) 50%,
      rgba(201,168,76,.7) 80%, transparent
    );
    border-radius: 999px; pointer-events: none;
  }
  .eb-hero-grid {
    position: relative; z-index: 1;
    display: grid;
    grid-template-columns: minmax(0,1.45fr) minmax(240px,.55fr);
    gap: clamp(1.5rem,4vw,4rem);
    align-items: center;
  }
  .eb-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 16px; border-radius: 999px;
    background: rgba(201,168,76,.1);
    border: 1px solid rgba(201,168,76,.25);
    color: var(--eb-gold); font-family: var(--eb-f);
    font-size: .74rem; letter-spacing: .22em;
    text-transform: uppercase; margin-bottom: 1.1rem;
    font-weight: 500;
  }
  .eb-title {
    margin: 0 0 1.1rem;
    font-family: var(--eb-f);
    font-size: clamp(2.4rem,7vw,5.8rem);
    line-height: 1.04; font-weight: 700;
    letter-spacing: -.04em; color: var(--eb-t0);
    text-shadow: 0 0 100px rgba(201,168,76,.2), 0 28px 80px rgba(0,0,0,.65);
  }
  .eb-title-gold {
    background: linear-gradient(135deg, #F5E0A8 0%, #C9A84C 45%, #E8C87A 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .eb-desc {
    max-width: 640px; margin: 0 0 1.8rem;
    color: var(--eb-t2); font-family: var(--eb-f);
    font-size: clamp(.95rem,2vw,1.18rem); line-height: 2.05;
  }
  .eb-stats {
    display: flex; gap: clamp(.6rem,1.8vw,1.1rem); flex-wrap: wrap;
  }
  .eb-stat {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 16px; border-radius: 14px;
    background: rgba(255,255,255,.045);
    border: 1px solid var(--eb-bdr2);
    backdrop-filter: blur(10px);
    font-family: var(--eb-f); font-size: .76rem; color: var(--eb-t2);
    transition: border-color .22s, background .22s;
  }
  .eb-stat:hover { border-color: rgba(201,168,76,.28); background: rgba(201,168,76,.05); }
  .eb-stat-num { color: var(--eb-gold); font-weight: 700; font-size: .95rem; }

  /* ── BOOK SHOWCASE IN HERO ── */
  .eb-showcase {
    position: relative; min-height: 380px;
    border-radius: 36px;
    border: 1px solid rgba(255,255,255,.09);
    background:
      radial-gradient(ellipse 85% 65% at 50% 0%, rgba(232,200,122,.22) 0%, transparent 52%),
      linear-gradient(180deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,.018) 100%);
    overflow: hidden;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 32px 90px rgba(0,0,0,.35);
  }
  .eb-showcase::after {
    content: "";
    position: absolute; left: 8%; right: 8%; bottom: 18px;
    height: 28px; border-radius: 999px;
    background: rgba(201,168,76,.25); filter: blur(26px);
    pointer-events: none;
  }
  .eb-book-stack {
    position: absolute; inset: 40px 18px 40px;
    display: flex; align-items: flex-end; justify-content: center;
    gap: 16px; perspective: 1100px;
  }
  .eb-book-img {
    width: clamp(74px,9vw,115px); aspect-ratio: 3/4;
    border-radius: 15px; object-fit: cover;
    box-shadow:
      0 35px 70px rgba(0,0,0,.6),
      -12px 0 22px rgba(0,0,0,.22),
      inset 0 0 0 1px rgba(255,255,255,.15);
    transform: rotate(var(--r,0deg)) translateY(var(--l,0px));
    transition: transform .42s var(--eb-ease), box-shadow .42s;
  }
  .eb-showcase:hover .eb-book-img {
    transform: rotate(var(--r,0deg)) translateY(calc(var(--l,0px) - 12px));
    box-shadow: 0 48px 90px rgba(0,0,0,.7), -12px 0 22px rgba(0,0,0,.22), inset 0 0 0 1px rgba(255,255,255,.2);
  }
  .eb-book-img:nth-child(1) { --r:-13deg; --l:20px; }
  .eb-book-img:nth-child(2) { --r:-2deg;  --l:-10px; width: clamp(88px,10.5vw,135px); }
  .eb-book-img:nth-child(3) { --r:10deg;  --l:25px; }

  /* ── PANEL ── */
  .eb-panel {
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
  .eb-panel::before {
    content: "";
    position: absolute; top: 0; left: 6%; right: 6%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(201,168,76,.55), rgba(255,255,255,.3), rgba(201,168,76,.55), transparent);
    pointer-events: none;
  }
  .eb-panel-head {
    display: flex; align-items: flex-start;
    justify-content: space-between;
    gap: clamp(1rem,3vw,2rem);
    margin-bottom: clamp(1.2rem,3vw,2rem);
  }
  .eb-panel-head h2 {
    margin: 0; color: var(--eb-t0); font-family: var(--eb-f);
    font-size: clamp(1.55rem,3.8vw,2.8rem);
    line-height: 1.2; font-weight: 700; letter-spacing: -.03em;
  }
  .eb-panel-head p {
    max-width: 640px; margin: .55rem 0 0;
    color: var(--eb-t2); font-family: var(--eb-f);
    line-height: 1.9; font-size: .93rem;
  }
  .eb-section-eyebrow {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 4px 13px; border-radius: 999px;
    background: rgba(201,168,76,.09);
    border: 1px solid rgba(201,168,76,.2);
    color: var(--eb-gold); font-family: var(--eb-f);
    font-size: .73rem; letter-spacing: .18em;
    text-transform: uppercase; margin-bottom: .75rem; font-weight: 500;
  }

  /* ── FEATURED BOOK ── */
  .eb-featured {
    --ba: #D4A843;
    position: relative; overflow: hidden;
    border-radius: 32px;
    border: 1px solid color-mix(in srgb, var(--ba) 40%, rgba(255,255,255,.09));
    background:
      radial-gradient(ellipse 85% 65% at 50% -5%, color-mix(in srgb, var(--ba) 22%, transparent) 0%, transparent 55%),
      linear-gradient(180deg, rgba(255,255,255,.085) 0%, rgba(255,255,255,.02) 100%),
      #070B18;
    box-shadow:
      0 36px 100px rgba(0,0,0,.52),
      inset 0 1px 0 rgba(255,255,255,.09),
      0 0 0 1px rgba(255,255,255,.03);
    cursor: pointer;
    transition: transform .34s var(--eb-silk), box-shadow .34s, border-color .34s;
    margin-bottom: clamp(1.2rem,3vw,2rem);
  }
  .eb-featured::before {
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
  .eb-featured:hover { transform: translateY(-6px); }
  .eb-featured:hover::before { opacity: 1; }
  .eb-featured:hover { box-shadow: 0 52px 130px rgba(0,0,0,.62), 0 0 70px rgba(212,168,67,.2), inset 0 1px 0 rgba(255,255,255,.11); }
  .eb-featured-inner {
    position: relative; z-index: 1;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: clamp(1.5rem,4vw,3rem);
    align-items: center;
    padding: clamp(1.5rem,4vw,2.8rem);
  }
  .eb-featured-cover {
    width: clamp(130px,20vw,200px); aspect-ratio: 3/4; object-fit: cover;
    border-radius: 20px;
    box-shadow: 0 36px 80px rgba(0,0,0,.62), -14px 0 28px rgba(0,0,0,.28), inset 0 0 0 1px rgba(255,255,255,.14);
    transform: rotateY(-11deg) rotateZ(-1.8deg);
    transition: transform .34s var(--eb-silk), box-shadow .34s;
    flex-shrink: 0;
  }
  .eb-featured:hover .eb-featured-cover {
    transform: rotateY(-2deg) translateY(-10px) scale(1.025);
    box-shadow: 0 50px 100px rgba(0,0,0,.7), -14px 0 28px rgba(0,0,0,.28), inset 0 0 0 1px rgba(255,255,255,.18);
  }
  .eb-featured-info { min-width: 0; }
  .eb-featured-info h3 {
    margin: .6rem 0 .65rem; color: var(--eb-t0); font-family: var(--eb-f);
    font-size: clamp(1.3rem,3.5vw,2.2rem); line-height: 1.35;
    font-weight: 700; letter-spacing: -.025em;
  }
  .eb-featured-info p {
    color: var(--eb-t2); font-family: var(--eb-f);
    font-size: clamp(.88rem,1.8vw,1rem); line-height: 2.0;
    margin-bottom: 1.4rem;
    display: -webkit-box; -webkit-line-clamp: 4;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .eb-featured-meta {
    display: flex; align-items: center; gap: 6px;
    color: var(--eb-t3); font-family: var(--eb-f); font-size: .74rem;
    margin-bottom: 1.4rem;
  }
  .eb-featured-actions {
    display: flex; gap: 11px; flex-wrap: wrap;
  }
  .eb-featured-actions > * {
    min-height: 46px; display: inline-flex; align-items: center;
    justify-content: center; gap: 8px; border-radius: 15px;
    border: 1px solid rgba(255,255,255,.09); font-family: var(--eb-f);
    font-size: .88rem; text-decoration: none; cursor: pointer;
    transition: all .26s var(--eb-silk); font-weight: 700;
    padding: 0 22px;
  }
  .eb-featured-actions > *:hover { transform: translateY(-3px); filter: brightness(1.14); box-shadow: 0 10px 32px rgba(0,0,0,.32); }

  /* ── BOOK BADGE ── */
  .eb-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 14px; border-radius: 999px;
    font-family: var(--eb-f); font-size: .66rem;
    backdrop-filter: blur(14px); font-weight: 600;
    background: rgba(3,5,11,.8);
    border: 1px solid rgba(212,168,67,.44);
    color: var(--eb-t0);
  }

  /* ── BOOKS GRID ── */
  .eb-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: clamp(1rem,2.2vw,1.5rem);
    perspective: 1500px;
  }

  /* ── BOOK CARD ── */
  .eb-card {
    --ba: var(--eb-gold);
    position: relative; overflow: hidden;
    display: flex; flex-direction: column;
    border-radius: 28px;
    border: 1px solid color-mix(in srgb, var(--ba) 30%, rgba(255,255,255,.08));
    background:
      linear-gradient(168deg, color-mix(in srgb, var(--ba) 14%, transparent) 0%, transparent 44%),
      linear-gradient(180deg, rgba(255,255,255,.068) 0%, rgba(255,255,255,.016) 100%),
      #070B18;
    box-shadow: 0 26px 70px rgba(0,0,0,.4);
    cursor: pointer;
    transition: transform .32s var(--eb-silk), border-color .32s, box-shadow .32s;
  }
  .eb-card::before {
    content: "";
    position: absolute; inset: -1px; border-radius: inherit; padding: 1px;
    background: linear-gradient(158deg,
      color-mix(in srgb, var(--ba) 50%, transparent) 0%, transparent 48%
    );
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none; opacity: .5; transition: opacity .32s;
  }
  .eb-card:hover {
    transform: translateY(-12px) scale(1.02);
    border-color: color-mix(in srgb, var(--ba) 60%, rgba(255,255,255,.15));
    box-shadow: 0 48px 110px rgba(0,0,0,.56), 0 0 55px color-mix(in srgb, var(--ba) 22%, transparent);
  }
  .eb-card:hover::before { opacity: .9; }
  @media (hover: none) {
    .eb-card:active { transform: scale(.97); }
  }
  .eb-card-glow {
    position: absolute; inset: auto 10% 46% 10%; height: 75px;
    background: color-mix(in srgb, var(--ba) 38%, transparent);
    filter: blur(38px); opacity: .6; pointer-events: none; z-index: 0;
    transition: opacity .32s;
  }
  .eb-card:hover .eb-card-glow { opacity: 1; }
  .eb-card-cover-wrap {
    position: relative; z-index: 1; display: flex; justify-content: center;
    padding: 1.2rem 1rem .75rem; min-height: 195px;
  }
  .eb-card-cover {
    position: relative; z-index: 1; width: min(128px,52vw); aspect-ratio: 3/4;
    object-fit: cover; border-radius: 17px;
    box-shadow: 0 26px 55px rgba(0,0,0,.58), -10px 0 22px rgba(0,0,0,.32), inset 0 0 0 1px rgba(255,255,255,.13);
    transform: rotateY(-13deg) rotateZ(-1.3deg);
    transition: transform .32s var(--eb-silk), box-shadow .32s;
  }
  .eb-card:hover .eb-card-cover {
    transform: rotateY(-2deg) translateY(-6px) scale(1.04);
    box-shadow: 0 38px 72px rgba(0,0,0,.65), -10px 0 22px rgba(0,0,0,.32), inset 0 0 0 1px rgba(255,255,255,.17);
  }
  .eb-card-badge {
    position: absolute; z-index: 2; top: 18px; left: 18px;
    display: inline-flex; align-items: center; gap: 5px;
    max-width: calc(100% - 36px); padding: 5px 12px; border-radius: 999px;
    color: var(--eb-t0); background: rgba(3,5,11,.8);
    border: 1px solid color-mix(in srgb, var(--ba) 44%, rgba(255,255,255,.1));
    font-family: var(--eb-f); font-size: .66rem;
    backdrop-filter: blur(14px); font-weight: 500;
  }
  .eb-card-copy {
    position: relative; z-index: 1;
    padding: .35rem 1.25rem 1.4rem;
    display: flex; flex-direction: column; flex: 1;
  }
  .eb-card-genre {
    color: var(--ba); font-family: var(--eb-f);
    font-size: .71rem; letter-spacing: .1em;
    text-transform: uppercase; font-weight: 600;
  }
  .eb-card-copy h3 {
    margin: .55rem 0 .7rem; color: var(--eb-t0); font-family: var(--eb-f);
    font-size: 1.08rem; line-height: 1.52;
    font-weight: 700; letter-spacing: -.015em;
  }
  .eb-card-copy p {
    margin: 0; color: var(--eb-t2); font-family: var(--eb-f);
    font-size: .83rem; line-height: 1.95;
    display: -webkit-box; -webkit-line-clamp: 3;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .eb-card-meta {
    display: flex; align-items: center; gap: 6px;
    margin-top: .9rem; color: var(--eb-t3); font-family: var(--eb-f); font-size: .72rem;
  }
  .eb-card-actions {
    display: grid; grid-template-columns: repeat(2,minmax(0,1fr));
    gap: 9px; margin-top: auto; padding-top: 1.1rem;
    position: relative; z-index: 2;
  }
  .eb-card-actions > * {
    min-height: 42px; display: inline-flex; align-items: center;
    justify-content: center; gap: 6px; border-radius: 14px;
    border: 1px solid rgba(255,255,255,.09); font-family: var(--eb-f);
    font-size: .8rem; text-decoration: none; cursor: pointer;
    transition: all .24s var(--eb-silk); font-weight: 600;
  }
  .eb-btn-preview { background: rgba(255,255,255,.04); color: var(--eb-t2); }
  .eb-btn-read {
    background: color-mix(in srgb, var(--ba) 22%, transparent);
    color: var(--eb-t0);
    border-color: color-mix(in srgb, var(--ba) 48%, rgba(255,255,255,.09));
  }
  .eb-card-actions > *:hover { transform: translateY(-2px); filter: brightness(1.12); box-shadow: 0 7px 22px rgba(0,0,0,.3); }

  /* ── COMING SOON BANNER ── */
  .eb-coming {
    margin-top: clamp(1.5rem,3vw,2.5rem);
    padding: clamp(1.2rem,3vw,1.8rem) clamp(1.5rem,4vw,2.5rem);
    border-radius: 22px;
    border: 1px solid rgba(201,168,76,.18);
    background: rgba(201,168,76,.04);
    display: flex; align-items: center; justify-content: center;
    gap: 12px; flex-wrap: wrap; text-align: center;
  }

  /* ── BOOK MODAL ── */
  .eb-modal-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(1,2,6,.88);
    backdrop-filter: blur(20px);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
  }
  .eb-modal-box {
    width: 100%; max-width: 740px; max-height: 92vh;
    border-radius: 30px; background: #0A0F20;
    border: 1px solid rgba(255,255,255,.13);
    overflow: hidden; display: flex; flex-direction: column;
    box-shadow: 0 55px 140px rgba(0,0,0,.80), inset 0 1px 0 rgba(255,255,255,.09);
  }
  .eb-modal-hd {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.15rem 1.6rem;
    border-bottom: 1px solid rgba(255,255,255,.07);
    flex-shrink: 0;
  }
  .eb-modal-body {
    display: flex; gap: clamp(1.3rem,3vw,2.3rem);
    padding: clamp(1.4rem,3vw,2.3rem);
    overflow-y: auto; align-items: flex-start;
    scrollbar-width: thin; scrollbar-color: rgba(201,168,76,.24) transparent;
  }
  .eb-modal-body::-webkit-scrollbar { width: 4px; }
  .eb-modal-body::-webkit-scrollbar-thumb { background: rgba(201,168,76,.24); border-radius: 999px; }
  .eb-modal-cover {
    width: clamp(128px,22vw,180px); height: auto;
    border-radius: 15px;
    box-shadow: 0 22px 65px rgba(0,0,0,.62), inset 0 0 0 1px rgba(255,255,255,.13);
    display: block; flex-shrink: 0;
  }
  .eb-modal-info { flex: 1; min-width: 0; }

  /* ── SCROLLBAR ── */
  .eb-page * { scrollbar-width: thin; scrollbar-color: rgba(201,168,76,.24) transparent; }
  ::selection { background: rgba(201,168,76,.28); color: var(--eb-t0); }

  /* ── RESPONSIVE ── */
  @media (max-width: 980px) {
    .eb-hero-grid { grid-template-columns: 1fr; }
    .eb-showcase { min-height: 300px; }
    .eb-featured-inner { grid-template-columns: 1fr; text-align: center; }
    .eb-featured-cover { margin: 0 auto; transform: none; }
    .eb-featured:hover .eb-featured-cover { transform: translateY(-8px) scale(1.02); }
    .eb-featured-meta { justify-content: center; }
    .eb-featured-actions { justify-content: center; }
  }
  @media (max-width: 768px) {
    .eb-modal-body { flex-direction: column; }
    .eb-modal-cover { width: clamp(100px,36vw,148px); }
    .eb-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .eb-hero { padding: 1.2rem; margin-bottom: 1rem; }
    .eb-title { font-size: clamp(1.7rem,10vw,2.5rem); line-height: 1.14; }
    .eb-desc { font-size: .9rem; line-height: 1.8; }
    .eb-panel { padding: .95rem; margin-bottom: 1.2rem; }
    .eb-panel-head h2 { font-size: 1.35rem; }
    .eb-grid { grid-template-columns: 1fr; }
    .eb-featured-actions > * { min-height: 50px; font-size: .88rem; }
    .eb-card-actions > * { min-height: 46px; font-size: .85rem; }
    .eb-stats { gap: .55rem; }
    .eb-stat { padding: 6px 11px; font-size: .71rem; }
  }
  @media (max-width: 360px) {
    .eb-mc { padding: 1rem .75rem; }
    .eb-hero { padding: 1rem; }
    .eb-panel { padding: .8rem; }
  }
`;

// ── Book Modal ────────────────────────────────────────────────────────────────
function BookModal({ book, onClose }: { book: typeof ebooks[0]; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const bookUrl = `https://www.mahbubsardarsabuj.com/ebooks/read/${book.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookUrl).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = bookUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: book.title, text: `মাহবুব সরদার সবুজের '${book.title}' পড়ুন`, url: bookUrl });
    } else {
      handleCopy();
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="eb-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="eb-modal-box"
          initial={{ opacity: 0, scale: 0.91, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.91, y: 28 }}
          transition={{ type: "spring", damping: 32, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="eb-modal-hd">
            <span style={{ fontFamily: "var(--eb-f)", fontSize: ".77rem", color: "rgba(242,237,228,.42)", display: "flex", alignItems: "center", gap: 7 }}>
              <BookOpen size={13} color={book.accentColor} />
              {book.badge}
            </span>
            <button
              onClick={onClose}
              style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.055)", border: "1px solid rgba(255,255,255,.09)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(242,237,228,.42)", transition: "all .2s" }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="eb-modal-body">
            <img
              src={book.cover}
              alt={`${book.title} - ${book.genre} ই-বুক কভার - মাহবুব সরদার সবুজ`}
              className="eb-modal-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='213' viewBox='0 0 160 213'%3E%3Crect fill='%230D1120'/%3E%3Ctext x='50%25' y='50%25' fill='%23C9A84C' font-size='14' text-anchor='middle' dominant-baseline='middle'%3E📖%3C/text%3E%3C/svg%3E"; }}
            />
            <div className="eb-modal-info">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 999, background: `${book.accentColor}15`, border: `1px solid ${book.accentColor}2A`, marginBottom: "1.1rem" }}>
                <span style={{ fontFamily: "var(--eb-f)", fontSize: ".65rem", color: book.accentColor, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600 }}>{book.badge}</span>
              </div>
              <h2 style={{ fontFamily: "var(--eb-f)", fontSize: "1.32rem", color: "#EDE8DE", lineHeight: 1.52, marginBottom: ".78rem", fontWeight: 700, letterSpacing: "-.018em" }}>{book.title}</h2>
              <p style={{ fontFamily: "var(--eb-f)", fontSize: ".88rem", color: "rgba(237,232,222,.62)", lineHeight: 2.05, marginBottom: "1.25rem" }}>{book.description}</p>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: "1.45rem" }}>
                {[book.genre, `${book.pages} পৃষ্ঠা`, book.year].map((t, i) => (
                  <span key={i} style={{ padding: "5px 14px", borderRadius: 999, background: "rgba(255,255,255,.065)", border: "1px solid rgba(255,255,255,.11)", fontFamily: "var(--eb-f)", fontSize: ".72rem", color: "rgba(237,232,222,.48)" }}>{t}</span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                {book.buyLink && (
                  <a href={book.buyLink} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 22px", borderRadius: 999, background: `linear-gradient(135deg,${book.accentColor},${book.accentColor}CC)`, color: "#080A14", fontFamily: "var(--eb-f)", fontSize: ".85rem", textDecoration: "none", transition: "all .28s", boxShadow: `0 9px 28px ${book.accentColor}32`, fontWeight: 700 }}>
                    <ShoppingCart size={13} /> কিনুন
                  </a>
                )}
                {book.canRead && (
                  <Link href={`/ebooks/read/${book.slug}`} style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 22px", borderRadius: 999, background: "transparent", color: book.accentColor, fontFamily: "var(--eb-f)", fontSize: ".85rem", textDecoration: "none", border: `1.5px solid ${book.accentColor}3A`, transition: "all .28s", fontWeight: 600 }}>
                    <BookOpen size={13} /> পড়ুন
                  </Link>
                )}
                <button onClick={handleCopy} style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 18px", borderRadius: 999, background: "rgba(255,255,255,.055)", color: copied ? "#34D399" : "rgba(242,237,228,.55)", fontFamily: "var(--eb-f)", fontSize: ".82rem", border: "1px solid rgba(255,255,255,.09)", cursor: "pointer", transition: "all .22s", fontWeight: 500 }}>
                  {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "কপি!" : "লিংক"}
                </button>
                <button onClick={handleShare} style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 18px", borderRadius: 999, background: "rgba(255,255,255,.055)", color: "rgba(242,237,228,.55)", fontFamily: "var(--eb-f)", fontSize: ".82rem", border: "1px solid rgba(255,255,255,.09)", cursor: "pointer", transition: "all .22s", fontWeight: 500 }}>
                  <Share2 size={13} /> শেয়ার
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ── Book Card ─────────────────────────────────────────────────────────────────
function BookCard({ book, index, onDetails }: { book: typeof ebooks[0]; index: number; onDetails: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      className="eb-card"
      style={{ "--ba": book.accentColor } as React.CSSProperties}
      initial={{ opacity: 0, y: 30, rotateX: 7 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 30, rotateX: 7 }}
      transition={{ delay: index * 0.08, duration: .48, ease: [.25, .46, .45, .94] }}
      role="article"
      tabIndex={0}
      aria-label={`${book.title} দেখুন`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onDetails(); } }}
    >
      <div className="eb-card-glow" />
      <div className="eb-card-cover-wrap">
        <img
          src={book.cover}
          alt={`${book.title} - ${book.genre} বাংলা ই-বুক - মাহবুব সরদার সবুজ`}
          className="eb-card-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='267' viewBox='0 0 200 267'%3E%3Crect fill='%230D1120'/%3E%3Ctext x='50%25' y='50%25' fill='%23C9A84C' font-size='14' text-anchor='middle' dominant-baseline='middle'%3E📖%3C/text%3E%3C/svg%3E"; }}
        />
        <span className="eb-card-badge">
          {book.isFeatured && <Crown size={10} />} {book.badge}
        </span>
      </div>
      <div className="eb-card-copy">
        <span className="eb-card-genre">{book.genre}</span>
        <h3>{book.title}</h3>
        <p>{book.description}</p>
        <div className="eb-card-meta"><Calendar size={10} />{book.year} · {book.pages} পৃষ্ঠা</div>
        <div className="eb-card-actions">
          <button className="eb-btn-preview" onClick={onDetails}><Eye size={12} /> বিস্তারিত</button>
          {book.canRead && (
            <Link href={`/ebooks/read/${book.slug}`} className="eb-btn-read" style={{ textDecoration: "none" }}>
              <BookOpen size={12} /> পড়ুন
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EBooks() {
  const [selectedBook, setSelectedBook] = useState<typeof ebooks[0] | null>(null);
  const featuredBook = ebooks[0];
  const otherBooks = ebooks.slice(1);

  const heroBooks = ebooks.slice(0, 3);

  const ebooksJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "name": "ই-বুক সংগ্রহ | মাহবুব সরদার সবুজ",
        "url": "https://www.mahbubsardarsabuj.com/ebooks",
        "inLanguage": "bn-BD",
        "description": "মাহবুব সরদার সবুজের প্রকাশিত ই-বুক ও ফিজিক্যাল বইয়ের সম্পূর্ণ সংগ্রহ।",
      },
      ...ebooks.map((book) => ({
        "@type": "Book",
        "@id": `https://www.mahbubsardarsabuj.com/ebooks#${book.slug}`,
        "name": book.title,
        "inLanguage": "bn-BD",
        "author": {
          "@type": "Person",
          "name": "মাহবুব সরদার সবুজ",
          "alternateName": "Mahbub Sardar Sabuj",
          "url": "https://www.mahbubsardarsabuj.com/about",
        },
        "url": `https://www.mahbubsardarsabuj.com/ebooks/read/${book.slug}`,
        "description": book.description,
        "genre": "Bengali Literature",
        "bookFormat": "EBook",
        "isAccessibleForFree": !book.buyLink ? "True" : "False",
      })),
    ],
  };

  return (
    <div className="eb-page">
      <style>{CSS}</style>
      <Seo
        title="বাংলা ই-বুক | দুঃখবিলাস, চাঁদফুল | মাহবুব সরদার সবুজ"
        description="মাহবুব সরদার সবুজের বাংলা ই-বুক সংগ্রহ বিনামূল্যে পড়ুন। দুঃখবিলাস, স্মৃতির বসন্তে তুমি, চাঁদফুল ও সময়ের গহ্বরে — ভালোবাসা ও জীবনদর্শনের অনুপ্রেরণামূলক বাংলা বই।"
        path="/ebooks"
        keywords="বাংলা ই-বুক, বাংলা বই ডাউনলোড, দুঃখবিলাস বই, চাঁদফুল বই, স্মৃতির বসন্তে তুমি, সময়ের গহ্বরে, মাহবুব সরদার সবুজ বই, Mahbub Sardar Sabuj ebook, বাংলা সাহিত্য বই, বিনামূল্যে বাংলা ই-বুক"
        jsonLd={ebooksJsonLd}
      />
      <div className="eb-aurora" aria-hidden="true" />
      <Navbar />

      <div className="eb-mc">
        {/* Hero */}
        <motion.section
          className="eb-hero"
          aria-labelledby="eb-hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .6, ease: [.25, .46, .45, .94] }}
        >
          <div className="eb-hero-grid">
            <div className="eb-hero-copy">
              <motion.div className="eb-eyebrow" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .15, duration: .5 }}>
                <Library size={13} /> বই সংগ্রহ
              </motion.div>
              <motion.h1 id="eb-hero-title" className="eb-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .22, duration: .55 }}>
                বই ও{" "}
                <span className="eb-title-gold">ই-বুক</span>
              </motion.h1>
              <motion.p className="eb-desc" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3, duration: .5 }}>
                মাহবুব সরদার সবুজের প্রকাশিত সকল বই ও ই-বুকের সংগ্রহ। প্রতিটি বই একটি আলাদা অনুভূতির জগৎ — পাঠকের হৃদয় স্পর্শ করার জন্য রচিত।
              </motion.p>
              <motion.div className="eb-stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .38, duration: .48 }}>
                <div className="eb-stat"><span className="eb-stat-num">১টি</span><span>ফিজিক্যাল বই</span></div>
                <div className="eb-stat"><span className="eb-stat-num">৪টি</span><span>ই-বুক</span></div>
                <div className="eb-stat"><span className="eb-stat-num">লক্ষাধিক</span><span>পাঠক</span></div>
              </motion.div>
            </div>
            <motion.div
              className="eb-showcase"
              aria-label="নির্বাচিত বইয়ের প্রদর্শনী"
              initial={{ opacity: 0, scale: .94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: .2, duration: .6 }}
            >
              <div className="eb-book-stack" aria-hidden="true">
                {heroBooks.map((book) => (
                  <img key={book.id} src={book.cover} alt={`${book.title} — মাহবুব সরদার সবুজের বই`} className="eb-book-img" loading="eager" decoding="async" />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Featured Book Panel */}
        <motion.section
          className="eb-panel"
          aria-labelledby="eb-featured-title"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: .52, ease: [.25, .46, .45, .94] }}
        >
          <div className="eb-panel-head">
            <div>
              <div className="eb-section-eyebrow"><Star size={13} fill="currentColor" /> প্রধান বই</div>
              <h2 id="eb-featured-title">প্রথম ফিজিক্যাল প্রকাশনা</h2>
              <p>মাহবুব সরদার সবুজের প্রথম প্রকাশিত ফিজিক্যাল বই — রকমারিতে পাওয়া যাচ্ছে</p>
            </div>
          </div>

          <motion.article
            className="eb-featured"
            style={{ "--ba": featuredBook.accentColor } as React.CSSProperties}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .48, ease: [.25, .46, .45, .94] }}
            onClick={() => setSelectedBook(featuredBook)}
            role="article"
            tabIndex={0}
            aria-label={`${featuredBook.title} দেখুন`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedBook(featuredBook); } }}
          >
            <div className="eb-featured-inner">
              <img
                src={featuredBook.cover}
                alt={`${featuredBook.title} - ${featuredBook.genre} বই - মাহবুব সরদার সবুজ`}
                className="eb-featured-cover"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
              <div className="eb-featured-info">
                <span className="eb-badge" style={{ position: "static" }}>
                  <Crown size={10} /> {featuredBook.badge}
                </span>
                <h3>{featuredBook.title}</h3>
                <div className="eb-featured-meta">
                  <Calendar size={11} />{featuredBook.year} · {featuredBook.pages} পৃষ্ঠা · {featuredBook.genre}
                </div>
                <p>{featuredBook.description}</p>
                <div className="eb-featured-actions" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/ebooks/read/${featuredBook.slug}`}
                    style={{ background: `linear-gradient(135deg,${featuredBook.accentColor}2C,${featuredBook.accentColor}18)`, borderColor: `${featuredBook.accentColor}48`, color: "#F2EDE4", textDecoration: "none" }}
                  >
                    <BookOpen size={14} /> পড়ুন
                  </Link>
                  {featuredBook.buyLink && (
                    <a
                      href={featuredBook.buyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ background: `linear-gradient(135deg,${featuredBook.accentColor},${featuredBook.accentColor}CC)`, borderColor: "transparent", color: "#080A14", textDecoration: "none" }}
                    >
                      <ShoppingCart size={14} /> রকমারিতে কিনুন
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.article>
        </motion.section>

        {/* All Books Grid Panel */}
        <motion.section
          className="eb-panel"
          aria-labelledby="eb-grid-title"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: .52, ease: [.25, .46, .45, .94] }}
        >
          <div className="eb-panel-head">
            <div>
              <div className="eb-section-eyebrow"><BookMarked size={13} /> ই-বুক সংগ্রহ</div>
              <h2 id="eb-grid-title">সকল ই-বুক</h2>
              <p>বিনামূল্যে পড়ুন — ভালোবাসা, বিচ্ছেদ, কবিতা ও জীবনদর্শনের অনন্য সংকলন</p>
            </div>
          </div>

          <div className="eb-grid">
            {otherBooks.map((book, i) => (
              <BookCard
                key={book.id}
                book={book}
                index={i}
                onDetails={() => setSelectedBook(book)}
              />
            ))}
          </div>

          {/* Coming Soon */}
          <motion.div
            className="eb-coming"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .6, delay: .2 }}
          >
            <Sparkles size={18} color="var(--eb-gold)" />
            <p style={{ color: "rgba(242,237,228,.6)", fontSize: ".95rem", lineHeight: 1.8, margin: 0, fontFamily: "var(--eb-f)" }}>
              আরও <strong style={{ color: "var(--eb-gold)" }}>৪টি ই-বুক</strong> শীঘ্রই প্রকাশিত হবে।
              নতুন বই সম্পর্কে আপডেট পেতে{" "}
              <a href="https://facebook.com/MahbubSardarSabuj" target="_blank" rel="noopener noreferrer" style={{ color: "var(--eb-gold)", fontWeight: 700 }}>
                ফেসবুক পেইজ
              </a>{" "}
              ফলো করুন।
            </p>
          </motion.div>
        </motion.section>

        {/* AdSense */}
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem 0 2rem" }}>
          <AdSenseAd adSlot={AD_SLOTS.EBOOKS_SIDEBAR} adFormat="auto" fullWidthResponsive={true} />
        </div>
      </div>

      {/* Book Modal */}
      <AnimatePresence>
        {selectedBook && (
          <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
