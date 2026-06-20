/**
 * Design: Literary Avant-Garde — Premium Edition v2
 * Navbar: Sticky top nav with navy background, gold accents
 * Desktop: Mega-dropdown grouped navigation with smooth animations
 * Responsive: JS-based window width detection (no Tailwind classes)
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  House,
  UserRound,
  BookOpen,
  Mic2,
  PenLine,
  Images,
  Newspaper,
  Mail,
  Palette,
  Feather,
  MailOpen,
  Phone,
  CreditCard,
  Sparkles,
  Music,
  Layers,
  Wrench,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { preloadRoute, preloadRoutesWhenIdle } from "@/lib/routePreloader";

// ── Nav groups for desktop mega-menu ──────────────────────────────────────────
const navGroups = [
  {
    label: "প্রধান",
    icon: House,
    items: [
      { label: "হোম", subtitle: "প্রথম পাতা ও প্রধান পরিচিতি", href: "/", icon: House },
      { label: "পরিচিতি", subtitle: "লেখক পরিচয় ও সংক্ষিপ্ত জীবনপথ", href: "/about", icon: UserRound },
      { label: "গ্যালারি", subtitle: "ছবি, মুহূর্ত ও ভিজ্যুয়াল সংগ্রহ", href: "/gallery", icon: Images },
      { label: "যোগাযোগ", subtitle: "ইমেইল, লিংক ও যোগাযোগের উপায়", href: "/contact", icon: Mail },
    ],
  },
  {
    label: "সাহিত্য",
    icon: PenLine,
    items: [
      { label: "লেখালেখি ও বই", subtitle: "কবিতা, লেখা ও প্রকাশিত বই সংগ্রহ", href: "/writings", icon: PenLine },
      { label: "আবৃত্তি", subtitle: "ভিডিও ও আবৃত্তির নির্বাচিত উপস্থাপনা", href: "/facebook-recitations", icon: Mic2 },
      { label: "আমিও লিখবো বাস্তবতা", subtitle: "সৃজনশীল লেখালেখির নতুন কমিউনিটি", href: "/amio-likhbo-bastobota", icon: Feather },
      { label: "সরদার সংবাদ", subtitle: "আপডেট, প্রকাশনা ও সাম্প্রতিক খবর", href: "/news", icon: Newspaper },
    ],
  },
  {
    label: "ডিজাইন",
    icon: Palette,
    items: [
      { label: "ডিজাইন ফরম্যাট", subtitle: "কার্ড ডিজাইন ও লেখা তৈরি করুন", href: "/editor", icon: Palette },
      { label: "ইমেজ আপস্কেলার", subtitle: "এআই দিয়ে ছবির কোয়ালিটি বাড়ান", href: "/image-upscaler", icon: Sparkles },
      { label: "অডিও এডিটর", subtitle: "ট্রিম, ফেড, স্পিড, রিভার্স ও নয়েজ রিডাকশন", href: "/audio-editor", icon: Music },
      { label: "আবৃত্তি টুল", subtitle: "লেখা দিন, AI মানুষের কণ্ঠে পড়বে ও ডাউনলোড করুন", href: "/text-to-speech", icon: Mic2 },
    ],
  },
  {
    label: "টুলস",
    icon: Wrench,
    items: [
      { label: "টেম্প ইমেইল", subtitle: "বিনামূল্যে ডিসপোজেবল ইমেইল তৈরি করুন", href: "/temp-email", icon: MailOpen },
      { label: "টেম্প নম্বর", subtitle: "বিনামূল্যে ডিসপোজেবল ফোন নম্বর", href: "/temp-number", icon: Phone },
      { label: "টেম্প কার্ড", subtitle: "টেস্টিংয়ের জন্য ভার্চুয়াল কার্ড", href: "/temp-card", icon: CreditCard },
    ],
  },
];

// Flat list for mobile
const navLinks = navGroups.flatMap((g) => g.items.map((item) => ({ ...item, type: "page" })));

const infoTabs = [
  { titleBn: "পরিচিতি পেজ", description: "লেখক পরিচিতি ও সংক্ষিপ্ত প্রেক্ষিত", href: "/about" },
  { titleBn: "যোগাযোগ", description: "ইমেইল, সামাজিক মাধ্যম ও ওয়েবসাইট", href: "/contact" },
  { titleBn: "প্রাইভেসি পলিসি", description: "তথ্য সংগ্রহ, cookies ও privacy ব্যাখ্যা", href: "/privacy-policy" },
  { titleBn: "শর্তাবলি", description: "ব্যবহারের নিয়ম, অধিকার ও সীমাবদ্ধতা", href: "/terms" },
];

const isInfoTabActive = (href: string, location: string) => location === href;

const isPrimaryNavActive = (href: string, location: string) => {
  if (href === "/") return location === "/";
  if (href === "/writings") return location === "/writings" || location === "/ebooks" || location.startsWith("/ebooks/");
  return location === href;
};

const isGroupActive = (group: typeof navGroups[0], location: string) =>
  group.items.some((item) => isPrimaryNavActive(item.href, location));

// Small event emitter to open chatbot from outside
export const openChatbot = () => {
  window.dispatchEvent(new CustomEvent("open-chatbot"));
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [location] = useLocation();
  const dropdownTimerRef = useRef<number | null>(null);
  const isEBookReaderPage = location.startsWith("/ebooks/read/");
  const isWritingsPage = location === "/writings" || location === "/ebooks";
  const isAmioLikhboPage = location.startsWith("/amio-likhbo-bastobota");
  const navElevated = scrolled || isWritingsPage;

  useEffect(() => {
    const checkWidth = () => setIsDesktop(window.innerWidth >= 1024);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // Throttled scroll handler
  const scrollThrottleRef = useRef<number | null>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (scrollThrottleRef.current !== null) return;
      scrollThrottleRef.current = window.setTimeout(() => {
        setScrolled(window.scrollY > 50);
        scrollThrottleRef.current = null;
      }, 100);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollThrottleRef.current !== null) clearTimeout(scrollThrottleRef.current);
    };
  }, []);

  const navHeight = scrolled ? (isDesktop ? 60 : 64) : (isDesktop ? 72 : 76);
  const totalNavOffset = navHeight;

  useEffect(() => {
    document.documentElement.style.setProperty("--site-nav-offset", `${totalNavOffset}px`);
    document.documentElement.style.setProperty("--site-nav-height", `${navHeight}px`);
    document.documentElement.style.setProperty("--site-banner-height", "0px");
    return () => {
      document.documentElement.style.removeProperty("--site-nav-offset");
      document.documentElement.style.removeProperty("--site-nav-height");
      document.documentElement.style.removeProperty("--site-banner-height");
    };
  }, [totalNavOffset, navHeight]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    if (isDesktop && mobileOpen) setMobileOpen(false);
  }, [isDesktop, mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [location]);

  useEffect(() => {
    if (!mobileOpen) return;
    preloadRoutesWhenIdle([...navLinks.map((link) => link.href), ...infoTabs.map((tab) => tab.href)]);
  }, [mobileOpen]);

  const warmRoute = (href: string) => preloadRoute(href);

  const handleDropdownEnter = (idx: number) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setActiveDropdown(idx);
  };

  const handleDropdownLeave = () => {
    dropdownTimerRef.current = window.setTimeout(() => {
      setActiveDropdown(null);
    }, 120);
  };

  if (isEBookReaderPage) return null;

  return (
    <>
      <style>{`
        @keyframes logoMicPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,166,35,0.0), 0 2px 12px rgba(212,168,67,0.15); }
          50% { box-shadow: 0 0 0 6px rgba(245,166,35,0.18), 0 2px 18px rgba(212,168,67,0.35); }
        }
        @keyframes navDropdownIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes navItemSlideIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .nav-group-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 14px;
          border-radius: 10px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.16,1,0.3,1);
          white-space: nowrap;
          background: transparent;
          text-decoration: none;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          color: rgba(253,246,236,0.9);
          letter-spacing: 0.01em;
        }
        .nav-group-btn:hover, .nav-group-btn.active {
          color: #FAF6EF;
          background: rgba(212,168,67,0.1);
          border-color: rgba(212,168,67,0.28);
          box-shadow: 0 2px 12px rgba(212,168,67,0.1);
        }
        .nav-group-btn.active {
          color: #E8C97A;
          background: rgba(212,168,67,0.12);
          border-color: rgba(212,168,67,0.35);
        }
        .nav-group-btn .nav-chevron {
          transition: transform 0.22s ease;
        }
        .nav-group-btn.open .nav-chevron {
          transform: rotate(180deg);
        }
        .nav-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          min-width: 300px;
          background: rgba(6,14,26,0.97);
          border: 1px solid rgba(212,168,67,0.2);
          border-radius: 18px;
          padding: 10px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,168,67,0.08) inset;
          backdrop-filter: blur(28px) saturate(1.6);
          -webkit-backdrop-filter: blur(28px) saturate(1.6);
          animation: navDropdownIn 0.22s cubic-bezier(0.16,1,0.3,1) forwards;
          z-index: 200;
        }
        .nav-dropdown::before {
          content: '';
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 12px;
          background: rgba(6,14,26,0.97);
          border-left: 1px solid rgba(212,168,67,0.2);
          border-top: 1px solid rgba(212,168,67,0.2);
          transform: translateX(-50%) rotate(45deg);
        }
        .nav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          animation: navItemSlideIn 0.2s ease forwards;
          font-family: 'AdorshoLipi', sans-serif;
        }
        .nav-dropdown-item:hover {
          background: rgba(212,168,67,0.08);
          border-color: rgba(212,168,67,0.18);
        }
        .nav-dropdown-item.active {
          background: linear-gradient(135deg, rgba(212,168,67,0.18) 0%, rgba(212,168,67,0.08) 100%);
          border-color: rgba(212,168,67,0.3);
        }
        .nav-dropdown-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(212,168,67,0.14) 0%, rgba(212,168,67,0.06) 100%);
          border: 1px solid rgba(212,168,67,0.2);
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .nav-dropdown-item:hover .nav-dropdown-icon,
        .nav-dropdown-item.active .nav-dropdown-icon {
          background: linear-gradient(135deg, rgba(212,168,67,0.25) 0%, rgba(212,168,67,0.12) 100%);
          border-color: rgba(212,168,67,0.4);
          box-shadow: 0 2px 10px rgba(212,168,67,0.15);
        }
        .nav-dropdown-label {
          font-size: 0.9rem;
          font-weight: 700;
          color: rgba(253,246,236,0.95);
          line-height: 1.3;
          transition: color 0.2s;
        }
        .nav-dropdown-item:hover .nav-dropdown-label,
        .nav-dropdown-item.active .nav-dropdown-label {
          color: #E8C97A;
        }
        .nav-dropdown-sub {
          font-size: 0.71rem;
          color: rgba(253,246,236,0.45);
          line-height: 1.4;
          margin-top: 2px;
          transition: color 0.2s;
        }
        .nav-dropdown-item:hover .nav-dropdown-sub {
          color: rgba(253,246,236,0.6);
        }
        .nav-group-indicator {
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #D4A843;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .nav-group-btn.active .nav-group-indicator {
          opacity: 1;
        }
        /* Home link special */
        .nav-home-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.22s ease;
          color: rgba(253,246,236,0.85);
          text-decoration: none;
        }
        .nav-home-link:hover {
          background: rgba(212,168,67,0.1);
          border-color: rgba(212,168,67,0.28);
          color: #E8C97A;
        }
        .nav-home-link.active {
          background: rgba(212,168,67,0.15);
          border-color: rgba(212,168,67,0.4);
          color: #E8C97A;
        }
        /* Divider in nav */
        .nav-divider {
          width: 1px;
          height: 20px;
          background: rgba(212,168,67,0.18);
          margin: 0 4px;
          flex-shrink: 0;
        }
        /* Gold shimmer for active group label */
        .nav-group-btn.active .nav-group-label {
          background: linear-gradient(135deg, #E8C97A 0%, #D4A843 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          transition: "all 0.5s",
          background: navElevated ? "rgba(6,14,26,0.93)" : "transparent",
          backdropFilter: navElevated ? "blur(24px) saturate(1.5)" : "none",
          WebkitBackdropFilter: navElevated ? "blur(24px) saturate(1.5)" : "none",
          boxShadow: navElevated
            ? "0 4px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(201,168,76,0.2), inset 0 1px 0 rgba(255,255,255,0.03)"
            : "none",
          borderBottom: navElevated ? "1px solid rgba(201,168,76,0.12)" : "none",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: isDesktop ? "0 2rem" : "0 1rem", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: navHeight, transition: "height 0.4s ease", gap: 8 }}>

            {/* ── LOGO ── */}
            <Link
              href="/"
              style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, minWidth: 0 }}
            >
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "linear-gradient(135deg, rgba(212,168,67,0.2) 0%, rgba(212,168,67,0.08) 100%)",
                border: "1px solid rgba(212,168,67,0.38)",
                boxShadow: "0 2px 14px rgba(212,168,67,0.18)",
                flexShrink: 0,
                transition: "all 0.25s",
              }}>
                <Feather size={17} color="#D4A843" />
              </span>
              <span style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", lineHeight: 1.05, minWidth: 0 }}>
                <span style={{
                  fontFamily: "'AdorshoLipi', sans-serif",
                  fontSize: "1.08rem",
                  fontWeight: 800,
                  letterSpacing: "0.01em",
                  background: "linear-gradient(135deg, #E8C97A 0%, #D4A843 50%, #C49030 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  whiteSpace: "nowrap",
                }}>
                  মাহবুব সরদার সবুজ
                </span>
                <span style={{
                  fontFamily: "'AdorshoLipi', sans-serif",
                  fontSize: "0.63rem",
                  letterSpacing: "0.1em",
                  color: "rgba(232,201,122,0.7)",
                  fontWeight: 400,
                  marginTop: 2,
                  lineHeight: 1.05,
                  whiteSpace: "nowrap",
                }}>
                  লেখক ও কবি
                </span>
              </span>
            </Link>

            {/* ── DESKTOP NAV ── */}
            {isDesktop && (
              <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }}>

                {/* Home quick link */}
                <Link href="/">
                  <span
                    className={`nav-home-link${isPrimaryNavActive("/", location) ? " active" : ""}`}
                    title="হোম"
                    onPointerDown={() => warmRoute("/")}
                  >
                    <House size={17} />
                  </span>
                </Link>

                <span className="nav-divider" />

                {/* Grouped dropdown menus — skip "প্রধান" group's Home item since it's above */}
                {navGroups.map((group, gIdx) => {
                  const GroupIcon = group.icon;
                  const isOpen = activeDropdown === gIdx;
                  const isActive = isGroupActive(group, location);

                  return (
                    <div
                      key={gIdx}
                      style={{ position: "relative" }}
                      onMouseEnter={() => handleDropdownEnter(gIdx)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <button
                        className={`nav-group-btn${isActive ? " active" : ""}${isOpen ? " open" : ""}`}
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                        style={{ outline: "none" }}
                      >
                        <GroupIcon size={15} style={{ opacity: 0.85 }} />
                        <span className="nav-group-label">{group.label}</span>
                        <ChevronDown size={13} className="nav-chevron" style={{ opacity: 0.7 }} />
                        <span className="nav-group-indicator" />
                      </button>

                      {/* Dropdown panel */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            className="nav-dropdown"
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            onMouseEnter={() => handleDropdownEnter(gIdx)}
                            onMouseLeave={handleDropdownLeave}
                          >
                            {/* Group header */}
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "8px 12px 10px",
                              borderBottom: "1px solid rgba(212,168,67,0.1)",
                              marginBottom: 6,
                            }}>
                              <span style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                background: "linear-gradient(135deg, rgba(212,168,67,0.2) 0%, rgba(212,168,67,0.08) 100%)",
                                border: "1px solid rgba(212,168,67,0.25)",
                              }}>
                                <GroupIcon size={13} color="#D4A843" />
                              </span>
                              <span style={{
                                fontFamily: "'AdorshoLipi', sans-serif",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                color: "rgba(212,168,67,0.85)",
                                letterSpacing: "0.08em",
                              }}>
                                {group.label}
                              </span>
                            </div>

                            {/* Items */}
                            {group.items.map((item, iIdx) => {
                              const ItemIcon = item.icon;
                              const itemActive = isPrimaryNavActive(item.href, location);
                              return (
                                <Link key={item.href} href={item.href}>
                                  <span
                                    className={`nav-dropdown-item${itemActive ? " active" : ""}`}
                                    style={{ animationDelay: `${iIdx * 0.04}s` }}
                                    onPointerDown={() => warmRoute(item.href)}
                                  >
                                    <span className="nav-dropdown-icon">
                                      <ItemIcon size={15} color={itemActive ? "#E8C97A" : "#D4A843"} />
                                    </span>
                                    <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                                      <span className="nav-dropdown-label">{item.label}</span>
                                      <span className="nav-dropdown-sub">{item.subtitle}</span>
                                    </span>
                                    {itemActive && (
                                      <span style={{
                                        marginLeft: "auto",
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%",
                                        background: "#D4A843",
                                        flexShrink: 0,
                                        boxShadow: "0 0 6px rgba(212,168,67,0.6)",
                                      }} />
                                    )}
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

            {/* ── HAMBURGER (mobile only) ── */}
            {!isDesktop && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  color: "rgba(253,246,236,0.85)",
                  background: mobileOpen ? "rgba(212,168,67,0.12)" : "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(212,168,67,0.2)",
                  borderRadius: 10,
                  padding: "7px 9px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.25s",
                  flexShrink: 0,
                }}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        <AnimatePresence>
          {mobileOpen && !isDesktop && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              style={{
                background: "rgba(6,14,26,0.97)",
                borderTop: "1px solid rgba(212,168,67,0.18)",
                position: "fixed",
                top: totalNavOffset, left: 0, right: 0, bottom: 0,
                height: `calc(100dvh - ${totalNavOffset}px)`,
                minHeight: `calc(100vh - ${totalNavOffset}px)`,
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                touchAction: "pan-y",
                zIndex: 300,
              }}
            >
              <div style={{
                position: "relative",
                minHeight: "100%",
                padding: "1.2rem 1rem calc(2.5rem + env(safe-area-inset-bottom))",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(212,168,67,0.3) rgba(255,255,255,0.03)",
              }}>

                {/* Author branding badge */}
                <div style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 16px",
                  borderRadius: 20,
                  background: "linear-gradient(135deg, rgba(212,168,67,0.07) 0%, rgba(212,168,67,0.02) 100%)",
                  border: "1px solid rgba(212,168,67,0.18)",
                  marginBottom: 2,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 200, height: 200,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(212,168,67,0.06) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }} />
                  <div style={{
                    width: 80, height: 90,
                    borderRadius: 12,
                    overflow: "hidden",
                    flexShrink: 0,
                    border: "1.5px solid rgba(212,168,67,0.35)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                    position: "relative",
                  }}>
                    <img
                      src="https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg"
                      alt="মাহবুব সরদার সবুজ"
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(6,14,26,0.4) 100%)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", position: "relative", flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: "'AdorshoLipi', sans-serif",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      lineHeight: 1.2,
                      background: "linear-gradient(135deg, #E8C97A 0%, #D4A843 50%, #C49030 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      marginBottom: 6,
                      whiteSpace: "nowrap",
                    }}>মাহবুব সরদার সবুজ</div>
                    <div style={{ width: 40, height: 1.5, background: "linear-gradient(90deg, #D4A843, transparent)", marginBottom: 6 }} />
                    <div style={{ fontFamily: "'AdorshoLipi', sans-serif", fontSize: "0.72rem", color: "rgba(212,168,67,0.55)", letterSpacing: "0.06em" }}>লেখক ও কবি</div>
                  </div>
                </div>

                {/* Primary nav links */}
                <div style={{
                  borderRadius: 22,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)",
                  border: "1px solid rgba(212,168,67,0.13)",
                  padding: "10px",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
                }}>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.055, delayChildren: 0.03 } },
                    }}
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {navLinks.map((link) => {
                      const active = isPrimaryNavActive(link.href, location);
                      const Icon = link.icon;
                      const linkContent = (
                        <motion.span
                          variants={{
                            hidden: { opacity: 0, x: -16, scale: 0.97 },
                            visible: { opacity: 1, x: 0, scale: 1 },
                          }}
                          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                          whileTap={{ scale: 0.983 }}
                          style={{
                            fontFamily: "'AdorshoLipi', sans-serif",
                            color: active ? "#0D1B2A" : "#FDF6EC",
                            background: active
                              ? "linear-gradient(135deg, #D4A843 0%, #E8C97A 100%)"
                              : "transparent",
                            border: active
                              ? "1px solid rgba(212,168,67,0.5)"
                              : "1px solid transparent",
                            padding: "11px 12px",
                            textDecoration: "none",
                            borderRadius: 14,
                            transition: "all 0.25s ease",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            boxShadow: active ? "0 8px 24px rgba(212,168,67,0.28)" : "none",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 38, height: 38,
                              borderRadius: 11,
                              background: active
                                ? "rgba(10,22,40,0.15)"
                                : "linear-gradient(135deg, rgba(212,168,67,0.12) 0%, rgba(212,168,67,0.05) 100%)",
                              border: active
                                ? "1px solid rgba(10,22,40,0.15)"
                                : "1px solid rgba(212,168,67,0.2)",
                              flexShrink: 0,
                              boxShadow: active ? "none" : "0 2px 8px rgba(0,0,0,0.15)",
                            }}>
                              <Icon size={17} color={active ? "#0D1B2A" : "#D4A843"} />
                            </span>
                            <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                              <span style={{ fontSize: "0.98rem", fontWeight: 700, lineHeight: 1.3 }}>{link.label}</span>
                              <span style={{
                                fontSize: "0.73rem",
                                lineHeight: 1.4,
                                color: active ? "rgba(10,22,40,0.75)" : "rgba(253,246,236,0.5)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>
                                {link.subtitle}
                              </span>
                            </span>
                          </span>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 30, height: 30,
                            borderRadius: 999,
                            background: active ? "rgba(10,22,40,0.12)" : "rgba(212,168,67,0.07)",
                            border: active ? "1px solid rgba(10,22,40,0.12)" : "1px solid rgba(212,168,67,0.15)",
                            flexShrink: 0,
                          }}>
                            <ChevronRight size={14} color={active ? "#0D1B2A" : "#D4A843"} />
                          </span>
                        </motion.span>
                      );

                      return (
                        <Link key={link.href} href={link.href}>
                          <span
                            onPointerDown={() => warmRoute(link.href)}
                            onTouchStart={() => warmRoute(link.href)}
                            onClick={() => {
                              warmRoute(link.href);
                              setMobileOpen(false);
                            }}
                            style={{ display: "block" }}
                          >
                            {linkContent}
                          </span>
                        </Link>
                      );
                    })}
                  </motion.div>
                </div>

                {/* Info tabs — 2×2 grid */}
                {!isAmioLikhboPage && (
                  <div style={{ margin: "0 2px" }}>
                    <p style={{
                      fontFamily: "'AdorshoLipi', sans-serif",
                      color: "rgba(212,168,67,0.7)",
                      fontSize: "0.7rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      margin: "0 4px 10px",
                    }}>
                      তথ্য ও নীতিমালা
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {infoTabs.map((tab) => {
                        const active = isInfoTabActive(tab.href, location);
                        return (
                          <Link key={tab.href} href={tab.href}>
                            <motion.span
                              onPointerDown={() => warmRoute(tab.href)}
                              onTouchStart={() => warmRoute(tab.href)}
                              onClick={() => {
                                warmRoute(tab.href);
                                setMobileOpen(false);
                              }}
                              whileTap={{ scale: 0.97 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.28, ease: "easeOut" }}
                              style={{
                                fontFamily: "'AdorshoLipi', sans-serif",
                                color: active ? "#0D1B2A" : "#FDF6EC",
                                background: active
                                  ? "linear-gradient(135deg, #D4A843 0%, #E8C97A 100%)"
                                  : "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(212,168,67,0.04) 100%)",
                                border: active
                                  ? "1px solid rgba(212,168,67,0.6)"
                                  : "1px solid rgba(212,168,67,0.18)",
                                padding: "14px 13px",
                                textDecoration: "none",
                                borderRadius: 16,
                                transition: "all 0.25s",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                gap: 5,
                                minHeight: 82,
                                justifyContent: "center",
                                boxShadow: active
                                  ? "0 8px 24px rgba(212,168,67,0.28)"
                                  : "0 4px 16px rgba(0,0,0,0.15)",
                              }}
                            >
                              <span style={{ fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.3 }}>{tab.titleBn}</span>
                              <span style={{
                                fontSize: "0.7rem",
                                lineHeight: 1.45,
                                color: active ? "rgba(10,22,40,0.75)" : "rgba(253,246,236,0.5)",
                              }}>
                                {tab.description}
                              </span>
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
