/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  "Literary Ink" — Dual-Layer Cinematic Navbar               ║
 * ║  World-class unique design for Mahbub Sardar Sabuj          ║
 * ║  v4.0 — Ultra Premium Edition                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Features:
 *  • Dual-layer: thin gold top-bar + center-logo main nav
 *  • Cinematic full-width mega-dropdown with calligraphy motif
 *  • Liquid gold underline animation on hover
 *  • Magnetic cursor-tracking glow on nav items
 *  • Top-bar slides away on scroll, nav compacts smoothly
 *  • Mobile: immersive full-screen drawer with author card
 */

import { useState, useEffect, useRef } from "react";
import {
  Menu, X, ChevronDown,
  House, UserRound, PenLine, Images,
  Newspaper, Mail, Palette, Feather,
  Sparkles, Music, Wrench,
  ArrowRight, BookOpen,
} from "lucide-react";
import { Link, useLocation } from "wouter";

// ─── Data ──────────────────────────────────────────────────────────────────────
const LEFT_GROUPS = [
  {
    id: 0,
    label: "প্রধান",
    glyph: "প",
    glyphColor: "#D4A843",
    items: [
      { label: "হোম",       subtitle: "প্রথম পাতা",                    href: "/",                      icon: House    },
      { label: "পরিচিতি",   subtitle: "লেখকের জীবন ও পথচলা",           href: "/about",                 icon: UserRound },
      { label: "গ্যালারি",   subtitle: "ছবি ও স্মৃতির অ্যালবাম",        href: "/gallery",               icon: Images   },
      { label: "যোগাযোগ",   subtitle: "ইমেইল ও সংযোগ",                  href: "/contact",               icon: Mail     },
    ],
  },
  {
    id: 1,
    label: "সাহিত্য",
    glyph: "স",
    glyphColor: "#B48FE8",
    items: [
      { label: "লেখালেখি ও বই",  subtitle: "কবিতা, গদ্য ও প্রকাশিত বই",  href: "/writings",              icon: BookOpen  },
      { label: "আমিও লিখবো বাস্তবতা", subtitle: "সৃজনশীল লেখার কমিউনিটি",    href: "/amio-likhbo-bastobota", icon: PenLine   },
      { label: "সরদার সংবাদ",    subtitle: "আপডেট ও সাম্প্রতিক খবর",    href: "/news",                  icon: Newspaper },
    ],
  },
];

const RIGHT_GROUPS = [
  {
    id: 2,
    label: "ডিজাইন",
    glyph: "ড",
    glyphColor: "#5BC8E8",
    items: [
      { label: "ডিজাইন ফরম্যাট",  subtitle: "কার্ড ও লেখা ডিজাইন",       href: "/editor",          icon: Palette  },
      { label: "ইমেজ আপস্কেলার",  subtitle: "AI দিয়ে ছবির মান বাড়ান",   href: "/image-upscaler",  icon: Sparkles },
      { label: "ভিডিও আপস্কেলার",  subtitle: "ঝাপসা ভিডিও 4K/8K-এ উন্নত করুন", href: "/video-upscaler", icon: Sparkles },
      { label: "অডিও এডিটর",      subtitle: "ট্রিম, ফেড, স্পিড, রিভার্স", href: "/audio-editor",    icon: Music    },
    ],
  },
];

const ALL_GROUPS = [...LEFT_GROUPS, ...RIGHT_GROUPS];
const ALL_LINKS  = ALL_GROUPS.flatMap((g) => g.items.map((i) => ({ ...i, groupColor: g.glyphColor })));

const SOCIAL = [
  { label: "Facebook", href: "https://facebook.com/MahbubSardarSabuj", icon: "f" },
  { label: "YouTube",  href: "https://youtube.com/@MahbubSardarSabuj",  icon: "▶" },
];

const isActive = (href: string, loc: string) => {
  if (href === "/") return loc === "/";
  if (href === "/writings") return loc === "/writings" || loc === "/ebooks" || loc.startsWith("/ebooks/");
  return loc === href || loc.startsWith(href + "/");
};

const isGroupActive = (g: typeof ALL_GROUPS[0], loc: string) =>
  g.items.some((i) => isActive(i.href, loc));

// ─── Component ─────────────────────────────────────────────────────────────────
export const openChatbot = () => window.dispatchEvent(new CustomEvent("open-chatbot"));

export default function Navbar() {
  const [location]                          = useLocation();
  const [scrolled, setScrolled]             = useState(false);
  const [mobileOpen, setMobileOpen]         = useState(false);
  const [isDesktop, setIsDesktop]           = useState(false);
  const [activeGroup, setActiveGroup]       = useState<number | null>(null);
  const [hoverGroup, setHoverGroup]         = useState<number | null>(null);
  const leaveTimer                          = useRef<number | null>(null);
  const isEBookReader                       = location.startsWith("/ebooks/read/");

  /* resize */
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1100);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* scroll */
  useEffect(() => {
    let raf: number | null = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        raf = null;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  /* nav height CSS var */
  const topBarH  = scrolled ? 0 : (isDesktop ? 34 : 0);
  const mainNavH = scrolled ? (isDesktop ? 60 : 62) : (isDesktop ? 72 : 68);
  const totalH   = topBarH + mainNavH;

  useEffect(() => {
    document.documentElement.style.setProperty("--site-nav-offset",  `${totalH}px`);
    document.documentElement.style.setProperty("--site-nav-height",  `${totalH}px`);
    document.documentElement.style.setProperty("--site-banner-height","0px");
    return () => {
      document.documentElement.style.removeProperty("--site-nav-offset");
      document.documentElement.style.removeProperty("--site-nav-height");
      document.documentElement.style.removeProperty("--site-banner-height");
    };
  }, [totalH]);

  /* body lock */
  useEffect(() => { document.body.style.overflow = mobileOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobileOpen]);

  /* close on route */
  useEffect(() => { setMobileOpen(false); setActiveGroup(null); setHoverGroup(null); }, [location]);
  useEffect(() => { if (isDesktop && mobileOpen) setMobileOpen(false); }, [isDesktop, mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  const onEnter = (id: number) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setActiveGroup(id);
    setHoverGroup(id);
  };
  const onLeave = () => {
    leaveTimer.current = window.setTimeout(() => { setActiveGroup(null); setHoverGroup(null); }, 160);
  };
  const toggleGroup = (id: number) => {
    if (activeGroup === id) {
      setActiveGroup(null);
      setHoverGroup(null);
    } else {
      onEnter(id);
    }
  };
  const handleGroupKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, id: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleGroup(id);
    } else if (event.key === "Escape") {
      setActiveGroup(null);
      setHoverGroup(null);
      event.currentTarget.blur();
    }
  };

  if (isEBookReader) return null;

  const currentGroup = activeGroup !== null ? ALL_GROUPS.find((g) => g.id === activeGroup) : null;

  // Bengali day/month
  const now = new Date();
  const bnDays   = ["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"];
  const bnMonths = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
  const bnDate   = `${bnDays[now.getDay()]}, ${now.getDate()} ${bnMonths[now.getMonth()]} ${now.getFullYear()}`;

  /* ─────────────────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Global CSS ── */}
      <style>{`
        /* Fonts & base */
        @keyframes inkDrop {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.08) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes navSlideIn {
          from { opacity: 0; transform: translateY(-18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes drawerIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes drawerItemIn {
          from { opacity: 0; transform: translateX(14px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes liquidLine {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }
        @keyframes goldShimmer {
          0%   { background-position: -300% center; }
          100% { background-position:  300% center; }
        }
        @keyframes topBarSlide {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes megaIn {
          from { opacity: 0; transform: translateY(-16px) scale(.975); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    filter: blur(0);   }
        }
        @keyframes glyphFloat {
          0%,100% { transform: translateY(0) rotate(-3deg); }
          50%      { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(212,168,67,.45); }
          70%  { box-shadow: 0 0 0 10px rgba(212,168,67,0); }
          100% { box-shadow: 0 0 0 0 rgba(212,168,67,0); }
        }
        @keyframes scanLine {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }

        .nb-fixed { animation: navSlideIn .5s cubic-bezier(.16,1,.3,1) both; }
        .nb-menu-button:active { transform: scale(.92); }
        .nb-mobile-drawer { animation: drawerIn .28s cubic-bezier(.16,1,.3,1) both; }
        .nb-mobile-link { animation: drawerItemIn .26s cubic-bezier(.22,1,.36,1) both; }
        .nb-mobile-backdrop { animation: backdropIn .2s ease-out both; }

        /* ── TOP BAR ── */
        .nb-topbar {
          height: 34px;
          background: linear-gradient(90deg,
            rgba(4,10,20,1) 0%,
            rgba(8,16,30,1) 40%,
            rgba(10,20,36,1) 60%,
            rgba(4,10,20,1) 100%);
          border-bottom: 1px solid rgba(212,168,67,.12);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          overflow: hidden;
          position: relative;
          animation: topBarSlide .6s ease forwards;
        }
        .nb-topbar::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 60px;
          background: linear-gradient(90deg, transparent, rgba(212,168,67,.08), transparent);
          animation: scanLine 4s ease-in-out infinite;
        }
        /* Continuous ornament is desktop-only; touch devices keep the same visual hierarchy without repaint work. */
        @media (max-width: 767px), (prefers-reduced-motion: reduce) {
          .nb-topbar::after, .nb-logo-icon, .nb-logo-name, .nb-mega-glyph { animation: none !important; }
          .nb-logo-name { background-position: 50% center; }
        }
        .nb-topbar-date {
          font-family: 'AdorshoLipi', sans-serif;
          font-size: .68rem;
          color: rgba(212,168,67,.55);
          letter-spacing: .08em;
        }
        .nb-topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .nb-topbar-social {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nb-topbar-social a {
          font-size: .65rem;
          color: rgba(212,168,67,.45);
          text-decoration: none;
          letter-spacing: .06em;
          font-family: 'AdorshoLipi', sans-serif;
          transition: color .2s;
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid transparent;
        }
        .nb-topbar-social a:hover {
          color: rgba(212,168,67,.9);
          border-color: rgba(212,168,67,.2);
          background: rgba(212,168,67,.06);
        }
        .nb-topbar-divider {
          width: 1px; height: 12px;
          background: rgba(212,168,67,.18);
        }
        .nb-topbar-tagline {
          font-family: 'AdorshoLipi', sans-serif;
          font-size: .63rem;
          color: rgba(212,168,67,.3);
          letter-spacing: .12em;
          font-style: italic;
        }

        /* ── MAIN NAV WRAPPER ── */
        .nb-main {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          transition: height .4s cubic-bezier(.4,0,.2,1);
        }

        /* ── LOGO ── */
        .nb-logo-wrap {
          display: flex;
          align-items: center;
          gap: 11px;
          text-decoration: none;
          flex-shrink: 0;
          position: relative;
        }
        .nb-logo-icon {
          position: relative;
          width: 42px; height: 42px;
          border-radius: 13px;
          background: linear-gradient(135deg, rgba(212,168,67,.18) 0%, rgba(212,168,67,.06) 100%);
          border: 1px solid rgba(212,168,67,.38);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          animation: pulseRing 3.5s ease-in-out infinite;
          overflow: hidden;
        }
        .nb-logo-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.06) 0%, transparent 60%);
          border-radius: inherit;
        }
        .nb-logo-text-wrap {
          display: flex;
          flex-direction: column;
        }
        .nb-logo-name {
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 1.05rem;
          font-weight: 900;
          background: linear-gradient(90deg,
            #A07020 0%, #C49030 15%, #E8C97A 30%,
            #FFF5D6 45%, #FFEEA0 55%, #E8C97A 70%,
            #C49030 85%, #A07020 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: goldShimmer 6s linear infinite;
          white-space: nowrap;
          line-height: 1.2;
        }
        .nb-logo-sub {
          font-family: 'AdorshoLipi', sans-serif;
          font-size: .6rem;
          color: rgba(212,168,67,.45);
          letter-spacing: .14em;
          margin-top: 2px;
          white-space: nowrap;
        }

        /* ── NAV SIDES ── */
        .nb-side {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        /* ── GROUP BUTTON ── */
        .nb-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 14px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: .84rem;
          font-weight: 600;
          color: rgba(253,246,236,.72);
          letter-spacing: .01em;
          white-space: nowrap;
          outline: none;
          transition: color .22s;
          border-radius: 8px;
        }
        .nb-btn::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 14px;
          right: 14px;
          height: 1.5px;
          background: linear-gradient(90deg, #C49030, #E8C97A, #C49030);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform .3s cubic-bezier(.4,0,.2,1);
          border-radius: 2px;
        }
        .nb-btn:hover,
        .nb-btn.nb-btn-open { color: #FAF6EF; }
        .nb-btn:hover::after,
        .nb-btn.nb-btn-open::after { transform: scaleX(1); animation: liquidLine .3s cubic-bezier(.4,0,.2,1) forwards; }
        .nb-btn.nb-btn-active { color: #E8C97A; }
        .nb-btn.nb-btn-active::after { transform: scaleX(1); }
        .nb-btn-chevron { transition: transform .25s ease; opacity: .5; }
        .nb-btn.nb-btn-open .nb-btn-chevron { transform: rotate(180deg); opacity: .8; }

        /* ── MEGA DROPDOWN ── */
        .nb-mega-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 98;
          pointer-events: none;
        }
        .nb-mega {
          position: fixed;
          left: 0; right: 0;
          z-index: 99;
          animation: megaIn .25s cubic-bezier(.16,1,.3,1) forwards;
          pointer-events: all;
        }
        .nb-mega-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 2.5rem;
        }
        .nb-mega-panel {
          background: linear-gradient(160deg,
            rgba(5,11,22,.97) 0%,
            rgba(8,16,30,.98) 50%,
            rgba(6,13,26,.97) 100%);
          border: 1px solid rgba(212,168,67,.14);
          border-top: none;
          border-radius: 0 0 24px 24px;
          overflow: hidden;
          box-shadow:
            0 40px 100px rgba(0,0,0,.7),
            0 0 0 1px rgba(255,255,255,.02) inset;
          backdrop-filter: blur(40px) saturate(1.8);
          -webkit-backdrop-filter: blur(40px) saturate(1.8);
          display: grid;
          grid-template-columns: 200px 1fr;
          min-height: 220px;
        }

        /* Left accent panel */
        .nb-mega-accent {
          position: relative;
          background: linear-gradient(180deg,
            rgba(212,168,67,.07) 0%,
            rgba(212,168,67,.03) 100%);
          border-right: 1px solid rgba(212,168,67,.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          overflow: hidden;
        }
        .nb-mega-glyph {
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 7rem;
          font-weight: 900;
          line-height: 1;
          opacity: .07;
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          pointer-events: none;
          user-select: none;
          animation: glyphFloat 6s ease-in-out infinite;
        }
        .nb-mega-accent-icon {
          position: relative;
          z-index: 1;
          width: 52px; height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          border: 1px solid rgba(212,168,67,.25);
          background: linear-gradient(135deg, rgba(212,168,67,.15) 0%, rgba(212,168,67,.05) 100%);
          box-shadow: 0 8px 24px rgba(0,0,0,.3);
        }
        .nb-mega-accent-label {
          position: relative;
          z-index: 1;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .16em;
          color: rgba(212,168,67,.6);
          text-align: center;
        }
        .nb-mega-accent-line {
          position: relative;
          z-index: 1;
          width: 32px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,168,67,.4), transparent);
          margin: 10px auto 0;
        }

        /* Right content */
        .nb-mega-content {
          padding: 24px 28px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
          align-content: start;
        }

        /* Mega item */
        .nb-mega-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 13px;
          border-radius: 14px;
          border: 1px solid transparent;
          text-decoration: none;
          cursor: pointer;
          transition: background .18s, border-color .18s, transform .18s;
          position: relative;
          overflow: hidden;
        }
        .nb-mega-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(212,168,67,.06) 0%, transparent 60%);
          opacity: 0;
          transition: opacity .18s;
          border-radius: inherit;
        }
        .nb-mega-item:hover {
          background: rgba(212,168,67,.06);
          border-color: rgba(212,168,67,.14);
          transform: translateX(3px);
        }
        .nb-mega-item:hover::before { opacity: 1; }
        .nb-mega-item.nb-item-active {
          background: linear-gradient(135deg, rgba(212,168,67,.14) 0%, rgba(212,168,67,.06) 100%);
          border-color: rgba(212,168,67,.25);
        }
        .nb-mega-item.nb-item-active::before { opacity: 1; }
        .nb-mega-icon {
          width: 38px; height: 38px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(212,168,67,.16);
          background: linear-gradient(135deg, rgba(212,168,67,.1) 0%, rgba(212,168,67,.04) 100%);
          transition: border-color .18s, box-shadow .18s, background .18s;
        }
        .nb-mega-item:hover .nb-mega-icon,
        .nb-mega-item.nb-item-active .nb-mega-icon {
          border-color: rgba(212,168,67,.35);
          box-shadow: 0 4px 14px rgba(212,168,67,.18);
          background: linear-gradient(135deg, rgba(212,168,67,.18) 0%, rgba(212,168,67,.08) 100%);
        }
        .nb-mega-label {
          font-family: 'AdorshoLipi', sans-serif;
          font-size: .9rem;
          font-weight: 700;
          color: rgba(253,246,236,.88);
          line-height: 1.3;
          transition: color .18s;
        }
        .nb-mega-item:hover .nb-mega-label,
        .nb-mega-item.nb-item-active .nb-mega-label { color: #E8C97A; }
        .nb-mega-sub {
          font-family: 'AdorshoLipi', sans-serif;
          font-size: .68rem;
          color: rgba(253,246,236,.38);
          margin-top: 2px;
          line-height: 1.4;
          transition: color .18s;
        }
        .nb-mega-item:hover .nb-mega-sub { color: rgba(253,246,236,.55); }
        .nb-mega-arrow {
          margin-left: auto;
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity .18s, transform .18s;
          flex-shrink: 0;
        }
        .nb-mega-item:hover .nb-mega-arrow { opacity: 1; transform: translateX(0); }
        .nb-mega-active-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #D4A843;
          margin-left: auto;
          flex-shrink: 0;
          box-shadow: 0 0 8px rgba(212,168,67,.7);
        }

        /* Bottom bar of mega */
        .nb-mega-footer {
          grid-column: 1 / -1;
          border-top: 1px solid rgba(212,168,67,.08);
          padding: 12px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
        }
        .nb-mega-footer-hint {
          font-family: 'AdorshoLipi', sans-serif;
          font-size: .65rem;
          color: rgba(212,168,67,.3);
          letter-spacing: .08em;
        }
        .nb-mega-footer-count {
          font-family: 'AdorshoLipi', sans-serif;
          font-size: .65rem;
          color: rgba(212,168,67,.25);
          letter-spacing: .06em;
        }

        /* ── GOLD SEPARATOR ── */
        .nb-vsep {
          width: 1px; height: 20px;
          background: linear-gradient(180deg, transparent, rgba(212,168,67,.22), transparent);
          margin: 0 4px;
          flex-shrink: 0;
        }

        /* ── BOTTOM GOLD LINE ── */
        .nb-bottom-line {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(212,168,67,.08) 10%,
            rgba(212,168,67,.35) 30%,
            rgba(232,201,122,.5) 50%,
            rgba(212,168,67,.35) 70%,
            rgba(212,168,67,.08) 90%,
            transparent 100%);
          opacity: 0;
          transition: opacity .5s;
        }
        .nb-bottom-line.show { opacity: 1; }

        @media (prefers-reduced-motion: reduce) {
          .nb-fixed, .nb-mobile-drawer, .nb-mobile-link, .nb-mobile-backdrop, .nb-topbar { animation: none !important; }
        }

        /* ── MAGNETIC GLOW ── */
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FIXED WRAPPER                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="nb-fixed"
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          background: scrolled
            ? "linear-gradient(180deg, rgba(4,10,20,.97) 0%, rgba(6,14,26,.95) 100%)"
            : "transparent",
          backdropFilter: scrolled ? "blur(32px) saturate(1.8)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(32px) saturate(1.8)" : "none",
          boxShadow: scrolled ? "0 8px 60px rgba(0,0,0,.6)" : "none",
          transition: "background .5s, box-shadow .5s",
        }}
      >
        {/* ── TOP BAR ── */}
        {!scrolled && isDesktop && (
            <div className="nb-topbar" style={{ overflow: "hidden" }}>
              <span className="nb-topbar-date">{bnDate}</span>
              <div className="nb-topbar-right">
                <span className="nb-topbar-tagline">বাংলা সাহিত্যের এক নিবেদিত কণ্ঠস্বর</span>
                <span className="nb-topbar-divider" />
                <div className="nb-topbar-social">
                  {SOCIAL.map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* ── MAIN NAV ── */}
        <div
          className="nb-main"
          style={{ height: mainNavH, transition: "height .4s cubic-bezier(.4,0,.2,1)" }}
        >
          {/* Bottom line */}
          <div className={`nb-bottom-line${scrolled ? " show" : ""}`} />

          {/* ── LEFT GROUPS ── */}
          {isDesktop && (
            <div className="nb-side">
              {LEFT_GROUPS.map((group) => {
                const GIcon  = group.items[0].icon;
                const active = isGroupActive(group, location);
                const open   = activeGroup === group.id;
                return (
                  <div
                    key={group.id}
                    style={{ position: "relative" }}
                    onMouseEnter={() => onEnter(group.id)}
                    onMouseLeave={onLeave}
                  >
                    <button
                      type="button"
                      className={`nb-btn${active ? " nb-btn-active" : ""}${open ? " nb-btn-open" : ""}`}
                      aria-haspopup="true"
                      aria-expanded={open}
                      aria-controls={`nb-mega-${group.id}`}
                      onPointerDown={(event) => { event.preventDefault(); toggleGroup(group.id); }}
                      onKeyDown={(event) => handleGroupKeyDown(event, group.id)}
                    >
                      <span>{group.label}</span>
                      <ChevronDown size={11} className="nb-btn-chevron" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── CENTER LOGO ── */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <div className="nb-logo-wrap">
              <div className="nb-logo-icon">
                <Feather size={18} color="#E8C97A" />
              </div>
              <div className="nb-logo-text-wrap">
                <span className="nb-logo-name">মাহবুব সরদার সবুজ</span>
                <span className="nb-logo-sub">লেখক ও কবি</span>
              </div>
            </div>
          </Link>

          {/* ── RIGHT GROUPS ── */}
          {isDesktop && (
            <div className="nb-side">
              {RIGHT_GROUPS.map((group) => {
                const active = isGroupActive(group, location);
                const open   = activeGroup === group.id;
                return (
                  <div
                    key={group.id}
                    style={{ position: "relative" }}
                    onMouseEnter={() => onEnter(group.id)}
                    onMouseLeave={onLeave}
                  >
                    <button
                      type="button"
                      className={`nb-btn${active ? " nb-btn-active" : ""}${open ? " nb-btn-open" : ""}`}
                      aria-haspopup="true"
                      aria-expanded={open}
                      aria-controls={`nb-mega-${group.id}`}
                      onPointerDown={(event) => { event.preventDefault(); toggleGroup(group.id); }}
                      onKeyDown={(event) => handleGroupKeyDown(event, group.id)}
                    >
                      <span>{group.label}</span>
                      <ChevronDown size={11} className="nb-btn-chevron" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── HAMBURGER ── */}
          {!isDesktop && (
            <button
              type="button"
              className="nb-menu-button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-site-navigation"
              style={{
                color: "rgba(253,246,236,.88)",
                background: mobileOpen ? "rgba(212,168,67,.15)" : "rgba(255,255,255,.04)",
                border: `1px solid ${mobileOpen ? "rgba(212,168,67,.4)" : "rgba(212,168,67,.16)"}`,
                borderRadius: 12,
                padding: "8px 10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all .25s",
                flexShrink: 0,
              }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MEGA DROPDOWN (full-width, below nav)                                  */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isDesktop && activeGroup !== null && currentGroup && (
          <div
            id={`nb-mega-${currentGroup.id}`}
            className="nb-mega"
            style={{ top: totalH }}
            onMouseEnter={() => onEnter(activeGroup)}
            onMouseLeave={onLeave}
          >
            <div className="nb-mega-inner">
              <div className="nb-mega-panel">
                {/* Left accent */}
                <div className="nb-mega-accent">
                  <span className="nb-mega-glyph" style={{ color: currentGroup.glyphColor }}>
                    {currentGroup.glyph}
                  </span>
                  <div
                    className="nb-mega-accent-icon"
                    style={{
                      background: `linear-gradient(135deg, ${currentGroup.glyphColor}22 0%, ${currentGroup.glyphColor}0a 100%)`,
                      borderColor: `${currentGroup.glyphColor}33`,
                    }}
                  >
                    {(() => { const G = currentGroup.items[0].icon; return <G size={22} color={currentGroup.glyphColor} />; })()}
                  </div>
                  <span className="nb-mega-accent-label" style={{ color: `${currentGroup.glyphColor}99` }}>
                    {currentGroup.label}
                  </span>
                  <div className="nb-mega-accent-line" />
                </div>

                {/* Right content */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div className="nb-mega-content">
                    {currentGroup.items.map((item, idx) => {
                      const IIcon      = item.icon;
                      const itemActive = isActive(item.href, location);
                      return (
                        <Link key={item.href} href={item.href}>
                          <div
                            className={`nb-mega-item${itemActive ? " nb-item-active" : ""}`}
                            style={{ animationDelay: `${idx * 0.04}s` }}
                          >
                            <div
                              className="nb-mega-icon"
                              style={itemActive ? {
                                borderColor: `${currentGroup.glyphColor}55`,
                                background: `linear-gradient(135deg, ${currentGroup.glyphColor}22 0%, ${currentGroup.glyphColor}0a 100%)`,
                              } : {}}
                            >
                              <IIcon size={16} color={itemActive ? currentGroup.glyphColor : "#D4A843"} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                              <span className="nb-mega-label">{item.label}</span>
                              <span className="nb-mega-sub">{item.subtitle}</span>
                            </div>
                            {itemActive
                              ? <span className="nb-mega-active-dot" style={{ background: currentGroup.glyphColor, boxShadow: `0 0 8px ${currentGroup.glyphColor}99` }} />
                              : <ArrowRight size={13} color="rgba(212,168,67,.4)" className="nb-mega-arrow" />
                            }
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="nb-mega-footer">
                    <span className="nb-mega-footer-hint">↑ hover করুন বা ক্লিক করুন</span>
                    <span className="nb-mega-footer-count">{currentGroup.items.length}টি পেজ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MOBILE DRAWER                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {mobileOpen && !isDesktop && (
          <div
            id="mobile-site-navigation"
            className="nb-mobile-drawer"
            style={{
              position: "fixed",
              top: mainNavH, right: 0,
              width: "min(360px, 100vw)",
              height: `calc(100dvh - ${mainNavH}px)`,
              background: "linear-gradient(160deg, rgba(4,10,20,.99) 0%, rgba(8,16,30,.99) 100%)",
              borderLeft: "1px solid rgba(212,168,67,.12)",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
              zIndex: 300,
              boxShadow: "-20px 0 60px rgba(0,0,0,.6)",
            }}
          >
            <div style={{ padding: "1.2rem 1rem calc(3rem + env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Author card */}
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "16px",
                borderRadius: 18,
                background: "linear-gradient(135deg,rgba(212,168,67,.07) 0%,rgba(212,168,67,.02) 100%)",
                border: "1px solid rgba(212,168,67,.16)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 50%, rgba(212,168,67,.05) 0%, transparent 70%)", pointerEvents:"none" }} />
                <div style={{
                  width: 68, height: 78, borderRadius: 12, overflow: "hidden", flexShrink: 0,
                  border: "1.5px solid rgba(212,168,67,.3)",
                  boxShadow: "0 4px 16px rgba(0,0,0,.4)",
                }}>
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg"
                    alt="মাহবুব সরদার সবুজ"
                    style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}
                  />
                </div>
                <div style={{ display:"flex", flexDirection:"column", flex:1, minWidth:0, position:"relative" }}>
                  <span style={{
                    fontFamily:"'AdorshoLipi',sans-serif", fontSize:"1.1rem", fontWeight:900, lineHeight:1.2,
                    background:"linear-gradient(135deg,#E8C97A 0%,#D4A843 100%)",
                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                    whiteSpace:"nowrap",
                  }}>মাহবুব সরদার সবুজ</span>
                  <span style={{ fontFamily:"'AdorshoLipi',sans-serif", fontSize:".65rem", color:"rgba(212,168,67,.45)", letterSpacing:".1em", marginTop:5 }}>লেখক ও কবি</span>
                </div>
              </div>

              {/* Groups */}
              {ALL_GROUPS.map((group) => (
                <div key={group.id}>
                  <p style={{
                    fontFamily:"'AdorshoLipi',sans-serif",
                    fontSize:".65rem", color:`${group.glyphColor}66`,
                    letterSpacing:".14em", margin:"0 4px 8px",
                    display:"flex", alignItems:"center", gap:8,
                  }}>
                    <span style={{ width:20, height:1, background:`linear-gradient(90deg,${group.glyphColor}44,transparent)`, display:"inline-block" }} />
                    {group.label}
                    <span style={{ flex:1, height:1, background:`linear-gradient(90deg,transparent,${group.glyphColor}22)`, display:"inline-block" }} />
                  </p>
                  <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    {group.items.map((item, idx) => {
                      const IIcon      = item.icon;
                      const itemActive = isActive(item.href, location);
                      return (
                        <Link key={item.href} href={item.href}>
                          <div
                            className="nb-mobile-link"
                            onClick={() => setMobileOpen(false)}
                            style={{
                              fontFamily:"'AdorshoLipi',sans-serif",
                              display:"flex", alignItems:"center", gap:11,
                              padding:"10px 12px",
                              borderRadius:13,
                              cursor:"pointer",
                              background: itemActive
                                ? `linear-gradient(135deg,${group.glyphColor}22 0%,${group.glyphColor}0a 100%)`
                                : "transparent",
                              border: itemActive ? `1px solid ${group.glyphColor}33` : "1px solid transparent",
                              transition:"all .2s",
                              animationDelay: `${idx * 0.035}s`,
                            }}
                          >
                            <span style={{
                              display:"inline-flex", alignItems:"center", justifyContent:"center",
                              width:36, height:36, borderRadius:10, flexShrink:0,
                              background: `linear-gradient(135deg,${group.glyphColor}18 0%,${group.glyphColor}08 100%)`,
                              border: `1px solid ${group.glyphColor}28`,
                            }}>
                              <IIcon size={16} color={itemActive ? group.glyphColor : `${group.glyphColor}cc`} />
                            </span>
                            <span style={{ display:"flex", flexDirection:"column", flex:1, minWidth:0 }}>
                              <span style={{
                                fontSize:".9rem", fontWeight:700, lineHeight:1.3,
                                color: itemActive ? group.glyphColor : "rgba(253,246,236,.88)",
                              }}>{item.label}</span>
                              <span style={{ fontSize:".68rem", color:"rgba(253,246,236,.38)", lineHeight:1.4 }}>{item.subtitle}</span>
                            </span>
                            {itemActive && (
                              <span style={{
                                width:6, height:6, borderRadius:"50%",
                                background: group.glyphColor,
                                flexShrink:0,
                                boxShadow:`0 0 8px ${group.glyphColor}99`,
                              }} />
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Mobile backdrop */}
      {mobileOpen && !isDesktop && (
          <div
            className="nb-mobile-backdrop"
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,.55)",
              zIndex: 299,
              backdropFilter: "blur(2px)",
            }}
          />
        )}
    </>
  );
}
