/**
 * Design: Literary Avant-Garde — Ultra Premium Edition v3
 * Navbar: Center-logo layout, glassmorphism, animated gold accents
 * Desktop: Elegant grouped nav with rich mega-dropdown panels
 * Mobile: Full-screen immersive drawer
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, ChevronDown, ChevronRight,
  House, UserRound, Mic2, PenLine, Images,
  Newspaper, Mail, Palette, Feather,
  MailOpen, Phone, CreditCard, Sparkles, Music, Wrench,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { preloadRoute, preloadRoutesWhenIdle } from "@/lib/routePreloader";

// ── Nav groups ─────────────────────────────────────────────────────────────────
const navGroups = [
  {
    label: "প্রধান",
    icon: House,
    color: "#D4A843",
    items: [
      { label: "হোম",              subtitle: "প্রথম পাতা ও প্রধান পরিচিতি",          href: "/",                        icon: House },
      { label: "পরিচিতি",          subtitle: "লেখক পরিচয় ও সংক্ষিপ্ত জীবনপথ",       href: "/about",                   icon: UserRound },
      { label: "গ্যালারি",          subtitle: "ছবি, মুহূর্ত ও ভিজ্যুয়াল সংগ্রহ",      href: "/gallery",                 icon: Images },
      { label: "যোগাযোগ",          subtitle: "ইমেইল, লিংক ও যোগাযোগের উপায়",         href: "/contact",                 icon: Mail },
    ],
  },
  {
    label: "সাহিত্য",
    icon: PenLine,
    color: "#A87FD4",
    items: [
      { label: "লেখালেখি ও বই",    subtitle: "কবিতা, লেখা ও প্রকাশিত বই সংগ্রহ",    href: "/writings",                icon: PenLine },
      { label: "আবৃত্তি",           subtitle: "ভিডিও ও আবৃত্তির নির্বাচিত উপস্থাপনা", href: "/facebook-recitations",    icon: Mic2 },
      { label: "আমিও লিখবো",       subtitle: "সৃজনশীল লেখালেখির নতুন কমিউনিটি",     href: "/amio-likhbo-bastobota",   icon: Feather },
      { label: "সরদার সংবাদ",      subtitle: "আপডেট, প্রকাশনা ও সাম্প্রতিক খবর",    href: "/news",                    icon: Newspaper },
    ],
  },
  {
    label: "ডিজাইন",
    icon: Palette,
    color: "#4AADCF",
    items: [
      { label: "ডিজাইন ফরম্যাট",   subtitle: "কার্ড ডিজাইন ও লেখা তৈরি করুন",       href: "/editor",                  icon: Palette },
      { label: "ইমেজ আপস্কেলার",   subtitle: "এআই দিয়ে ছবির কোয়ালিটি বাড়ান",      href: "/image-upscaler",          icon: Sparkles },
      { label: "অডিও এডিটর",       subtitle: "ট্রিম, ফেড, স্পিড, রিভার্স",           href: "/audio-editor",            icon: Music },
      { label: "আবৃত্তি টুল",       subtitle: "AI কণ্ঠে আবৃত্তি ও ডাউনলোড",          href: "/text-to-speech",          icon: Mic2 },
    ],
  },
  {
    label: "টুলস",
    icon: Wrench,
    color: "#4ACF8A",
    items: [
      { label: "টেম্প ইমেইল",       subtitle: "ডিসপোজেবল ইমেইল তৈরি করুন",           href: "/temp-email",              icon: MailOpen },
      { label: "টেম্প নম্বর",        subtitle: "ডিসপোজেবল ফোন নম্বর",                 href: "/temp-number",             icon: Phone },
      { label: "টেম্প কার্ড",        subtitle: "টেস্টিংয়ের জন্য ভার্চুয়াল কার্ড",    href: "/temp-card",               icon: CreditCard },
    ],
  },
];

const navLinks = navGroups.flatMap((g) =>
  g.items.map((item) => ({ ...item, type: "page", groupColor: g.color }))
);

const infoTabs = [
  { titleBn: "পরিচিতি পেজ",   description: "লেখক পরিচিতি ও সংক্ষিপ্ত প্রেক্ষিত",    href: "/about" },
  { titleBn: "যোগাযোগ",       description: "ইমেইল, সামাজিক মাধ্যম ও ওয়েবসাইট",      href: "/contact" },
  { titleBn: "প্রাইভেসি পলিসি", description: "তথ্য সংগ্রহ, cookies ও privacy ব্যাখ্যা", href: "/privacy-policy" },
  { titleBn: "শর্তাবলি",       description: "ব্যবহারের নিয়ম, অধিকার ও সীমাবদ্ধতা",   href: "/terms" },
];

const isPrimaryNavActive = (href: string, location: string) => {
  if (href === "/") return location === "/";
  if (href === "/writings") return location === "/writings" || location === "/ebooks" || location.startsWith("/ebooks/");
  return location === href;
};

const isGroupActive = (group: typeof navGroups[0], location: string) =>
  group.items.some((item) => isPrimaryNavActive(item.href, location));

export const openChatbot = () => window.dispatchEvent(new CustomEvent("open-chatbot"));

export default function Navbar() {
  const [scrolled, setScrolled]           = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [isDesktop, setIsDesktop]         = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [location]                        = useLocation();
  const dropdownTimer                     = useRef<number | null>(null);

  const isEBookReaderPage = location.startsWith("/ebooks/read/");
  const isWritingsPage    = location === "/writings" || location === "/ebooks";
  const isAmioLikhboPage  = location.startsWith("/amio-likhbo-bastobota");
  const navElevated       = scrolled || isWritingsPage;

  /* ── resize ── */
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── scroll ── */
  const scrollRef = useRef<number | null>(null);
  useEffect(() => {
    const onScroll = () => {
      if (scrollRef.current !== null) return;
      scrollRef.current = window.setTimeout(() => {
        setScrolled(window.scrollY > 40);
        scrollRef.current = null;
      }, 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (scrollRef.current) clearTimeout(scrollRef.current); };
  }, []);

  /* ── nav height ── */
  const navHeight = scrolled ? (isDesktop ? 58 : 62) : (isDesktop ? 72 : 76);
  useEffect(() => {
    document.documentElement.style.setProperty("--site-nav-offset", `${navHeight}px`);
    document.documentElement.style.setProperty("--site-nav-height", `${navHeight}px`);
    document.documentElement.style.setProperty("--site-banner-height", "0px");
    return () => {
      document.documentElement.style.removeProperty("--site-nav-offset");
      document.documentElement.style.removeProperty("--site-nav-height");
      document.documentElement.style.removeProperty("--site-banner-height");
    };
  }, [navHeight]);

  /* ── body scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* ── close on route change ── */
  useEffect(() => { setMobileOpen(false); setActiveDropdown(null); }, [location]);
  useEffect(() => { if (isDesktop && mobileOpen) setMobileOpen(false); }, [isDesktop, mobileOpen]);

  /* ── preload ── */
  useEffect(() => {
    if (!mobileOpen) return;
    preloadRoutesWhenIdle([...navLinks.map((l) => l.href), ...infoTabs.map((t) => t.href)]);
  }, [mobileOpen]);

  const warm = (href: string) => preloadRoute(href);

  const onEnter = (idx: number) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setActiveDropdown(idx);
  };
  const onLeave = () => {
    dropdownTimer.current = window.setTimeout(() => setActiveDropdown(null), 150);
  };

  if (isEBookReaderPage) return null;

  /* ─────────────────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Global keyframes & utility classes ── */}
      <style>{`
        @keyframes navShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes navGlow {
          0%,100% { opacity:.6; }
          50%      { opacity:1; }
        }
        @keyframes dropIn {
          from { opacity:0; transform:translateY(-10px) scale(.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes slideItem {
          from { opacity:0; transform:translateX(-8px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes borderGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(212,168,67,0); }
          50%      { box-shadow: 0 0 18px 2px rgba(212,168,67,.22); }
        }

        /* ── Logo shimmer text ── */
        .nb-logo-name {
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 1.08rem;
          font-weight: 800;
          background: linear-gradient(90deg,#C49030 0%,#E8C97A 30%,#FFF5D6 50%,#E8C97A 70%,#C49030 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: navShimmer 5s linear infinite;
          white-space: nowrap;
        }
        .nb-logo-sub {
          font-family: 'AdorshoLipi', sans-serif;
          font-size: .62rem;
          letter-spacing: .12em;
          color: rgba(232,201,122,.65);
          margin-top: 2px;
          white-space: nowrap;
        }

        /* ── Group button ── */
        .nb-group {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 13px;
          border-radius: 999px;
          border: 1px solid transparent;
          cursor: pointer;
          background: transparent;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: .85rem;
          font-weight: 500;
          color: rgba(253,246,236,.82);
          letter-spacing: .01em;
          transition: color .22s, background .22s, border-color .22s, box-shadow .22s;
          white-space: nowrap;
          outline: none;
        }
        .nb-group:hover {
          color: #FAF6EF;
          background: rgba(212,168,67,.09);
          border-color: rgba(212,168,67,.25);
          box-shadow: 0 2px 14px rgba(212,168,67,.1);
        }
        .nb-group.nb-active {
          color: #E8C97A;
          background: rgba(212,168,67,.13);
          border-color: rgba(212,168,67,.35);
          box-shadow: 0 2px 18px rgba(212,168,67,.18);
        }
        .nb-group.nb-open {
          color: #FAF6EF;
          background: rgba(212,168,67,.12);
          border-color: rgba(212,168,67,.3);
        }
        .nb-chevron { transition: transform .22s ease; }
        .nb-group.nb-open .nb-chevron { transform: rotate(180deg); }

        /* ── Active dot under group label ── */
        .nb-active-dot {
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #D4A843;
          opacity: 0;
          transition: opacity .2s;
          box-shadow: 0 0 6px rgba(212,168,67,.7);
        }
        .nb-group.nb-active .nb-active-dot { opacity: 1; }

        /* ── Dropdown panel ── */
        .nb-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%);
          min-width: 310px;
          background: linear-gradient(160deg, rgba(8,16,32,.97) 0%, rgba(10,20,38,.99) 100%);
          border: 1px solid rgba(212,168,67,.18);
          border-radius: 20px;
          padding: 8px;
          box-shadow:
            0 32px 80px rgba(0,0,0,.65),
            0 0 0 1px rgba(255,255,255,.03) inset,
            0 1px 0 rgba(212,168,67,.12) inset;
          backdrop-filter: blur(32px) saturate(1.8);
          -webkit-backdrop-filter: blur(32px) saturate(1.8);
          animation: dropIn .2s cubic-bezier(.16,1,.3,1) forwards;
          z-index: 200;
        }
        /* arrow */
        .nb-dropdown::before {
          content:'';
          position:absolute;
          top:-6px; left:50%;
          width:12px; height:12px;
          background: rgba(8,16,32,.97);
          border-left:1px solid rgba(212,168,67,.18);
          border-top:1px solid rgba(212,168,67,.18);
          transform: translateX(-50%) rotate(45deg);
        }

        /* ── Dropdown header ── */
        .nb-dd-header {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 12px 10px;
          border-bottom: 1px solid rgba(212,168,67,.1);
          margin-bottom: 6px;
        }
        .nb-dd-header-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px; height: 30px;
          border-radius: 9px;
          border: 1px solid rgba(212,168,67,.22);
        }
        .nb-dd-header-label {
          font-family: 'AdorshoLipi', sans-serif;
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .1em;
          color: rgba(212,168,67,.85);
        }

        /* ── Dropdown item ── */
        .nb-dd-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 11px;
          border-radius: 13px;
          border: 1px solid transparent;
          cursor: pointer;
          text-decoration: none;
          font-family: 'AdorshoLipi', sans-serif;
          transition: background .18s, border-color .18s, box-shadow .18s;
          animation: slideItem .18s ease forwards;
        }
        .nb-dd-item:hover {
          background: rgba(212,168,67,.07);
          border-color: rgba(212,168,67,.16);
          box-shadow: 0 2px 12px rgba(0,0,0,.2);
        }
        .nb-dd-item.nb-dd-active {
          background: linear-gradient(135deg, rgba(212,168,67,.16) 0%, rgba(212,168,67,.07) 100%);
          border-color: rgba(212,168,67,.28);
          box-shadow: 0 2px 16px rgba(212,168,67,.12);
        }
        .nb-dd-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(212,168,67,.18);
          background: linear-gradient(135deg,rgba(212,168,67,.12) 0%,rgba(212,168,67,.05) 100%);
          flex-shrink: 0;
          transition: background .18s, border-color .18s, box-shadow .18s;
        }
        .nb-dd-item:hover .nb-dd-icon,
        .nb-dd-item.nb-dd-active .nb-dd-icon {
          background: linear-gradient(135deg,rgba(212,168,67,.22) 0%,rgba(212,168,67,.1) 100%);
          border-color: rgba(212,168,67,.38);
          box-shadow: 0 2px 10px rgba(212,168,67,.18);
        }
        .nb-dd-label {
          font-size: .88rem;
          font-weight: 700;
          color: rgba(253,246,236,.92);
          line-height: 1.3;
          transition: color .18s;
        }
        .nb-dd-item:hover .nb-dd-label,
        .nb-dd-item.nb-dd-active .nb-dd-label { color: #E8C97A; }
        .nb-dd-sub {
          font-size: .69rem;
          color: rgba(253,246,236,.4);
          line-height: 1.4;
          margin-top: 2px;
          transition: color .18s;
        }
        .nb-dd-item:hover .nb-dd-sub { color: rgba(253,246,236,.58); }

        /* ── Active badge ── */
        .nb-dd-badge {
          margin-left: auto;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #D4A843;
          flex-shrink: 0;
          box-shadow: 0 0 8px rgba(212,168,67,.7);
          animation: navGlow 2s ease-in-out infinite;
        }

        /* ── Gold separator ── */
        .nb-sep {
          width: 1px; height: 18px;
          background: linear-gradient(180deg, transparent, rgba(212,168,67,.25), transparent);
          flex-shrink: 0;
          margin: 0 2px;
        }

        /* ── Home icon btn ── */
        .nb-home {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px; height: 34px;
          border-radius: 10px;
          border: 1px solid transparent;
          cursor: pointer;
          color: rgba(253,246,236,.75);
          text-decoration: none;
          transition: color .2s, background .2s, border-color .2s;
        }
        .nb-home:hover { color:#E8C97A; background:rgba(212,168,67,.1); border-color:rgba(212,168,67,.25); }
        .nb-home.nb-home-active { color:#E8C97A; background:rgba(212,168,67,.14); border-color:rgba(212,168,67,.35); }

        /* ── Bottom gold line on scroll ── */
        .nb-gold-line {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212,168,67,.35) 30%, rgba(232,201,122,.55) 50%, rgba(212,168,67,.35) 70%, transparent 100%);
          opacity: 0;
          transition: opacity .4s;
        }
        .nb-gold-line.nb-line-show { opacity: 1; }
      `}</style>

      <motion.nav
        initial={{ y: -110 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          transition: "background .5s, box-shadow .5s, backdrop-filter .5s",
          background: navElevated
            ? "linear-gradient(180deg, rgba(5,12,24,.96) 0%, rgba(8,16,30,.94) 100%)"
            : "transparent",
          backdropFilter: navElevated ? "blur(28px) saturate(1.6)" : "none",
          WebkitBackdropFilter: navElevated ? "blur(28px) saturate(1.6)" : "none",
          boxShadow: navElevated
            ? "0 8px 48px rgba(0,0,0,.55), 0 1px 0 rgba(212,168,67,.12)"
            : "none",
        }}
      >
        {/* Gold bottom line */}
        <div className={`nb-gold-line${navElevated ? " nb-line-show" : ""}`} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: isDesktop ? "0 2.5rem" : "0 1rem", position: "relative" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isDesktop ? "space-between" : "space-between",
            height: navHeight,
            transition: "height .4s ease",
            gap: 12,
          }}>

            {/* ── LOGO ── */}
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              {/* Feather icon with animated ring */}
              <span style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40, height: 40,
                borderRadius: 12,
                background: "linear-gradient(135deg, rgba(212,168,67,.22) 0%, rgba(212,168,67,.08) 100%)",
                border: "1px solid rgba(212,168,67,.4)",
                boxShadow: "0 4px 18px rgba(212,168,67,.2), inset 0 1px 0 rgba(255,255,255,.06)",
                flexShrink: 0,
                animation: "borderGlow 3s ease-in-out infinite",
              }}>
                <Feather size={17} color="#E8C97A" />
              </span>
              <span style={{ display: "flex", flexDirection: "column" }}>
                <span className="nb-logo-name">মাহবুব সরদার সবুজ</span>
                <span className="nb-logo-sub">লেখক ও কবি</span>
              </span>
            </Link>

            {/* ── DESKTOP NAV ── */}
            {isDesktop && (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>

                {/* Home icon */}
                <Link href="/">
                  <span className={`nb-home${isPrimaryNavActive("/", location) ? " nb-home-active" : ""}`} title="হোম" onPointerDown={() => warm("/")}>
                    <House size={16} />
                  </span>
                </Link>

                <span className="nb-sep" />

                {/* Groups */}
                {navGroups.map((group, gIdx) => {
                  const GIcon    = group.icon;
                  const isOpen   = activeDropdown === gIdx;
                  const isActive = isGroupActive(group, location);

                  return (
                    <div
                      key={gIdx}
                      style={{ position: "relative" }}
                      onMouseEnter={() => onEnter(gIdx)}
                      onMouseLeave={onLeave}
                    >
                      <button
                        className={`nb-group${isActive ? " nb-active" : ""}${isOpen ? " nb-open" : ""}`}
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                      >
                        <GIcon size={14} style={{ opacity: .85 }} />
                        <span>{group.label}</span>
                        <ChevronDown size={12} className="nb-chevron" style={{ opacity: .65 }} />
                        <span className="nb-active-dot" />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            className="nb-dropdown"
                            initial={{ opacity: 0, y: -10, scale: .97 }}
                            animate={{ opacity: 1, y: 0,   scale: 1   }}
                            exit   ={{ opacity: 0, y: -8,  scale: .97 }}
                            transition={{ duration: .2, ease: [.16,1,.3,1] }}
                            onMouseEnter={() => onEnter(gIdx)}
                            onMouseLeave={onLeave}
                          >
                            {/* Header */}
                            <div className="nb-dd-header">
                              <span
                                className="nb-dd-header-icon"
                                style={{ background: `linear-gradient(135deg, ${group.color}22 0%, ${group.color}0a 100%)` }}
                              >
                                <GIcon size={14} color={group.color} />
                              </span>
                              <span className="nb-dd-header-label" style={{ color: group.color }}>{group.label}</span>
                            </div>

                            {/* Items */}
                            {group.items.map((item, iIdx) => {
                              const IIcon  = item.icon;
                              const active = isPrimaryNavActive(item.href, location);
                              return (
                                <Link key={item.href} href={item.href}>
                                  <span
                                    className={`nb-dd-item${active ? " nb-dd-active" : ""}`}
                                    style={{ animationDelay: `${iIdx * 0.04}s` }}
                                    onPointerDown={() => warm(item.href)}
                                  >
                                    <span className="nb-dd-icon">
                                      <IIcon size={15} color={active ? group.color : "#D4A843"} />
                                    </span>
                                    <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                                      <span className="nb-dd-label">{item.label}</span>
                                      <span className="nb-dd-sub">{item.subtitle}</span>
                                    </span>
                                    {active && <span className="nb-dd-badge" style={{ background: group.color, boxShadow: `0 0 8px ${group.color}99` }} />}
                                  </span>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── HAMBURGER ── */}
            {!isDesktop && (
              <motion.button
                whileTap={{ scale: .92 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  color: "rgba(253,246,236,.88)",
                  background: mobileOpen ? "rgba(212,168,67,.14)" : "rgba(255,255,255,.05)",
                  border: `1px solid ${mobileOpen ? "rgba(212,168,67,.35)" : "rgba(212,168,67,.18)"}`,
                  borderRadius: 11,
                  padding: "7px 9px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all .25s",
                  flexShrink: 0,
                }}
              >
                <AnimatePresence mode="wait">
                  {mobileOpen
                    ? <motion.span key="x"   initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}} transition={{duration:.18}}><X    size={21}/></motion.span>
                    : <motion.span key="men" initial={{rotate: 90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:-90,opacity:0}} transition={{duration:.18}}><Menu size={21}/></motion.span>
                  }
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </div>

        {/* ── MOBILE DRAWER ── */}
        <AnimatePresence>
          {mobileOpen && !isDesktop && (
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit  ={{ opacity: 0, y: -10 }}
              transition={{ duration: .28, ease: "easeOut" }}
              style={{
                background: "linear-gradient(160deg, rgba(5,12,24,.98) 0%, rgba(8,18,34,.99) 100%)",
                borderTop: "1px solid rgba(212,168,67,.15)",
                position: "fixed",
                top: navHeight, left: 0, right: 0, bottom: 0,
                height: `calc(100dvh - ${navHeight}px)`,
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                zIndex: 300,
              }}
            >
              <div style={{
                minHeight: "100%",
                padding: "1.2rem 1rem calc(2.5rem + env(safe-area-inset-bottom))",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}>
                {/* Author card */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 16px",
                  borderRadius: 20,
                  background: "linear-gradient(135deg,rgba(212,168,67,.07) 0%,rgba(212,168,67,.02) 100%)",
                  border: "1px solid rgba(212,168,67,.18)",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position:"absolute", top:"50%", left:"50%",
                    transform:"translate(-50%,-50%)",
                    width:200, height:200, borderRadius:"50%",
                    background:"radial-gradient(circle,rgba(212,168,67,.06) 0%,transparent 70%)",
                    pointerEvents:"none",
                  }}/>
                  <div style={{
                    width:80, height:90, borderRadius:12,
                    overflow:"hidden", flexShrink:0,
                    border:"1.5px solid rgba(212,168,67,.35)",
                    boxShadow:"0 4px 16px rgba(0,0,0,.4)",
                    position:"relative",
                  }}>
                    <img
                      src="https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg"
                      alt="মাহবুব সরদার সবুজ"
                      style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}
                    />
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 50%,rgba(6,14,26,.4) 100%)" }}/>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", flex:1, minWidth:0 }}>
                    <div style={{
                      fontFamily:"'AdorshoLipi',sans-serif",
                      fontSize:"1.22rem", fontWeight:800, lineHeight:1.2,
                      background:"linear-gradient(135deg,#E8C97A 0%,#D4A843 50%,#C49030 100%)",
                      WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                      marginBottom:6, whiteSpace:"nowrap",
                    }}>মাহবুব সরদার সবুজ</div>
                    <div style={{ width:40, height:1.5, background:"linear-gradient(90deg,#D4A843,transparent)", marginBottom:6 }}/>
                    <div style={{ fontFamily:"'AdorshoLipi',sans-serif", fontSize:".72rem", color:"rgba(212,168,67,.55)", letterSpacing:".06em" }}>লেখক ও কবি</div>
                  </div>
                </div>

                {/* Nav links */}
                <div style={{
                  borderRadius:22,
                  background:"linear-gradient(180deg,rgba(255,255,255,.03) 0%,rgba(255,255,255,.015) 100%)",
                  border:"1px solid rgba(212,168,67,.13)",
                  padding:"10px",
                  boxShadow:"0 16px 40px rgba(0,0,0,.25)",
                }}>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden:{}, visible:{ transition:{ staggerChildren:.05, delayChildren:.03 } } }}
                    style={{ display:"flex", flexDirection:"column", gap:5 }}
                  >
                    {navLinks.map((link) => {
                      const active = isPrimaryNavActive(link.href, location);
                      const Icon   = link.icon;
                      return (
                        <Link key={link.href} href={link.href}>
                          <motion.span
                            variants={{ hidden:{opacity:0,x:-14,scale:.97}, visible:{opacity:1,x:0,scale:1} }}
                            transition={{ duration:.3, ease:[.22,1,.36,1] }}
                            whileTap={{ scale:.983 }}
                            onPointerDown={() => warm(link.href)}
                            onClick={() => setMobileOpen(false)}
                            style={{
                              fontFamily:"'AdorshoLipi',sans-serif",
                              color: active ? "#0D1B2A" : "#FDF6EC",
                              background: active ? "linear-gradient(135deg,#D4A843 0%,#E8C97A 100%)" : "transparent",
                              border: active ? "1px solid rgba(212,168,67,.5)" : "1px solid transparent",
                              padding:"10px 12px",
                              borderRadius:13,
                              cursor:"pointer",
                              display:"flex",
                              alignItems:"center",
                              justifyContent:"space-between",
                              gap:12,
                              boxShadow: active ? "0 6px 22px rgba(212,168,67,.25)" : "none",
                              transition:"all .2s",
                            }}
                          >
                            <span style={{ display:"flex", alignItems:"center", gap:11, minWidth:0, flex:1 }}>
                              <span style={{
                                display:"inline-flex", alignItems:"center", justifyContent:"center",
                                width:36, height:36, borderRadius:10, flexShrink:0,
                                background: active ? "rgba(10,22,40,.15)" : `linear-gradient(135deg,${link.groupColor}20 0%,${link.groupColor}0a 100%)`,
                                border: active ? "1px solid rgba(10,22,40,.15)" : `1px solid ${link.groupColor}33`,
                                boxShadow: active ? "none" : "0 2px 8px rgba(0,0,0,.15)",
                              }}>
                                <Icon size={16} color={active ? "#0D1B2A" : link.groupColor} />
                              </span>
                              <span style={{ display:"flex", flexDirection:"column", gap:2, minWidth:0 }}>
                                <span style={{ fontSize:".96rem", fontWeight:700, lineHeight:1.3 }}>{link.label}</span>
                                <span style={{
                                  fontSize:".71rem", lineHeight:1.4,
                                  color: active ? "rgba(10,22,40,.72)" : "rgba(253,246,236,.45)",
                                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                                }}>{link.subtitle}</span>
                              </span>
                            </span>
                            <span style={{
                              display:"inline-flex", alignItems:"center", justifyContent:"center",
                              width:28, height:28, borderRadius:999, flexShrink:0,
                              background: active ? "rgba(10,22,40,.12)" : "rgba(212,168,67,.07)",
                              border: active ? "1px solid rgba(10,22,40,.12)" : "1px solid rgba(212,168,67,.15)",
                            }}>
                              <ChevronRight size={13} color={active ? "#0D1B2A" : "#D4A843"} />
                            </span>
                          </motion.span>
                        </Link>
                      );
                    })}
                  </motion.div>
                </div>

                {/* Info tabs */}
                {!isAmioLikhboPage && (
                  <div style={{ margin:"0 2px" }}>
                    <p style={{
                      fontFamily:"'AdorshoLipi',sans-serif",
                      color:"rgba(212,168,67,.65)",
                      fontSize:".68rem",
                      letterSpacing:".16em",
                      textTransform:"uppercase",
                      margin:"0 4px 10px",
                    }}>তথ্য ও নীতিমালা</p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      {infoTabs.map((tab) => {
                        const active = location === tab.href;
                        return (
                          <Link key={tab.href} href={tab.href}>
                            <motion.span
                              onPointerDown={() => warm(tab.href)}
                              onClick={() => setMobileOpen(false)}
                              whileTap={{ scale:.97 }}
                              initial={{ opacity:0, y:10 }}
                              animate={{ opacity:1, y:0 }}
                              transition={{ duration:.28, ease:"easeOut" }}
                              style={{
                                fontFamily:"'AdorshoLipi',sans-serif",
                                color: active ? "#0D1B2A" : "#FDF6EC",
                                background: active
                                  ? "linear-gradient(135deg,#D4A843 0%,#E8C97A 100%)"
                                  : "linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(212,168,67,.04) 100%)",
                                border: active ? "1px solid rgba(212,168,67,.6)" : "1px solid rgba(212,168,67,.16)",
                                padding:"13px 12px",
                                borderRadius:15,
                                cursor:"pointer",
                                display:"flex",
                                flexDirection:"column",
                                gap:5,
                                minHeight:78,
                                justifyContent:"center",
                                boxShadow: active ? "0 8px 24px rgba(212,168,67,.28)" : "0 4px 16px rgba(0,0,0,.15)",
                                transition:"all .22s",
                              }}
                            >
                              <span style={{ fontSize:".88rem", fontWeight:700, lineHeight:1.3 }}>{tab.titleBn}</span>
                              <span style={{ fontSize:".68rem", lineHeight:1.45, color: active ? "rgba(10,22,40,.72)" : "rgba(253,246,236,.45)" }}>{tab.description}</span>
                            </motion.span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
