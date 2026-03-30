/*
 * Design: Literary Avant-Garde — Premium Edition
 * Navbar: Sticky top nav with navy background, gold accents
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Smartphone } from "lucide-react";
import {
  Menu,
  X,
  ChevronRight,
  House,
  UserRound,
  BookOpen,
  Mic2,
  PenLine,
  Images,
  Newspaper,
  Mail,
  Feather,
  Palette,
} from "lucide-react";
import { Link, useLocation } from "wouter";

const navLinks = [
  { label: "হোম", subtitle: "প্রথম পাতা ও প্রধান পরিচিতি", href: "#home", type: "anchor", icon: House },
  { label: "পরিচিতি", subtitle: "লেখক পরিচয় ও সংক্ষিপ্ত জীবনপথ", href: "#about", type: "anchor", icon: UserRound },
  { label: "বই", subtitle: "প্রকাশিত বই ও সংগ্রহের তথ্য", href: "#book", type: "anchor", icon: BookOpen },
  { label: "আবৃত্তি", subtitle: "ভিডিও ও আবৃত্তির নির্বাচিত উপস্থাপনা", href: "/facebook-recitations", type: "page", icon: Mic2 },
  { label: "লেখালেখি", subtitle: "প্রবন্ধ, গদ্য ও সাহিত্যকর্ম", href: "/writings", type: "page", icon: PenLine },
  { label: "ই-বুক", subtitle: "প্রকাশিত বই ও ই-বুকের সংগ্রহ", href: "/ebooks", type: "page", icon: BookOpen },
  { label: "ডিজাইন ফরম্যাট", subtitle: "কার্ড ডিজাইন ও লেখা তৈরি করুন", href: "/editor", type: "page", icon: Palette },
  { label: "গ্যালারি", subtitle: "ছবি, মুহূর্ত ও ভিজ্যুয়াল সংগ্রহ", href: "#gallery", type: "anchor", icon: Images },
  { label: "সংবাদ", subtitle: "আপডেট, প্রকাশনা ও সাম্প্রতিক খবর", href: "/news", type: "page", icon: Newspaper },
  { label: "যোগাযোগ", subtitle: "ইমেইল, লিংক ও যোগাযোগের উপায়", href: "#contact", type: "anchor", icon: Mail },
];

const infoTabs = [
  { titleBn: "পরিচিতি পেজ", description: "লেখক পরিচিতি ও সংক্ষিপ্ত প্রেক্ষিত", href: "/about" },
  { titleBn: "যোগাযোগ", description: "ইমেইল, সামাজিক মাধ্যম ও ওয়েবসাইট", href: "/contact" },
  { titleBn: "প্রাইভেসি পলিসি", description: "তথ্য সংগ্রহ, cookies ও privacy ব্যাখ্যা", href: "/privacy-policy" },
  { titleBn: "শর্তাবলি", description: "ব্যবহারের নিয়ম, অধিকার ও সীমাবদ্ধতা", href: "/terms" },
];

const isInfoTabActive = (href: string, location: string) => location === href;

const isPrimaryNavActive = (href: string, type: string, location: string) => {
  if (type === "page") return location === href;
  if (href === "#home") return location === "/";
  return false;
};

// Global desktop view toggle
let _desktopViewListeners: (() => void)[] = [];
let _isDesktopView = false;
export function toggleDesktopView() {
  _isDesktopView = !_isDesktopView;
  if (_isDesktopView) {
    document.documentElement.style.minWidth = "1280px";
    document.documentElement.style.overflowX = "auto";
    (document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null)
      ?.setAttribute("content", "width=1280");
  } else {
    document.documentElement.style.minWidth = "";
    document.documentElement.style.overflowX = "";
    (document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null)
      ?.setAttribute("content", "width=device-width, initial-scale=1");
  }
  _desktopViewListeners.forEach(fn => fn());
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const [isDesktopMode, setIsDesktopMode] = useState(false);

  useEffect(() => {
    const listener = () => setIsDesktopMode(_isDesktopView);
    _desktopViewListeners.push(listener);
    return () => { _desktopViewListeners = _desktopViewListeners.filter(l => l !== listener); };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavClick = (href: string, type: string) => {
    setMobileOpen(false);
    if (type === "page") return;
    if (location !== "/") { window.location.href = "/" + href; return; }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        transition: "all 0.5s",
        background: scrolled ? "rgba(10,18,34,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        boxShadow: scrolled ? "0 2px 40px rgba(0,0,0,0.4), 0 1px 0 rgba(212,168,67,0.15)" : "none",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>

          {/* ── PREMIUM LOGO ── */}
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); handleNavClick("#home", "anchor"); }}
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}
          >
            {/* Feather icon badge */}
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(212,168,67,0.18) 0%, rgba(212,168,67,0.08) 100%)",
              border: "1px solid rgba(212,168,67,0.35)",
              boxShadow: "0 2px 12px rgba(212,168,67,0.15)",
              flexShrink: 0,
            }}>
              <Feather size={16} color="#D4A843" />
            </span>

            {/* Name with two-tone styling */}
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
              <span style={{
                fontFamily: "'Tiro Bangla', serif",
                fontSize: "1.05rem",
                fontWeight: 700,
                letterSpacing: "0.03em",
                background: "linear-gradient(90deg, #E8C97A 0%, #D4A843 50%, #C49030 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                মাহবুব সরদার সবুজ
              </span>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(212,168,67,0.55)",
                marginTop: 1,
              }}>
                লেখক ও কবি
              </span>
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex" style={{ gap: 6 }}>
            {navLinks.map((link) =>
              link.type === "page" ? (
                <Link key={link.href} href={link.href}>
                  <span
                    onClick={() => setMobileOpen(false)}
                    style={{
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      color: location === link.href ? "#0D1B2A" : "rgba(253,246,236,0.9)",
                      padding: "9px 16px",
                      textDecoration: "none",
                      fontSize: "0.92rem",
                      transition: "all 0.3s ease",
                      borderRadius: 999,
                      cursor: "pointer",
                      display: "inline-block",
                      background: location === link.href
                        ? "linear-gradient(135deg, #D4A843 0%, #E3BC63 100%)"
                        : "rgba(253,246,236,0.04)",
                      border: location === link.href
                        ? "1px solid rgba(212,168,67,0.65)"
                        : "1px solid rgba(212,168,67,0.12)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#0D1B2A";
                      e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,168,67,0.92) 0%, rgba(227,188,99,0.92) 100%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = location === link.href ? "#0D1B2A" : "rgba(253,246,236,0.9)";
                      e.currentTarget.style.background = location === link.href
                        ? "linear-gradient(135deg, #D4A843 0%, #E3BC63 100%)"
                        : "rgba(253,246,236,0.04)";
                    }}
                  >
                    {link.label}
                  </span>
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href, link.type); }}
                  style={{
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                    color: "rgba(253,246,236,0.9)",
                    padding: "9px 16px",
                    textDecoration: "none",
                    fontSize: "0.92rem",
                    transition: "all 0.3s ease",
                    borderRadius: 999,
                    background: "rgba(253,246,236,0.04)",
                    border: "1px solid rgba(212,168,67,0.12)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#0D1B2A";
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,168,67,0.92) 0%, rgba(227,188,99,0.92) 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(253,246,236,0.9)";
                    e.currentTarget.style.background = "rgba(253,246,236,0.04)";
                  }}
                >
                  {link.label}
                </a>
              ),
            )}
          </div>

          {/* Desktop/Mobile View Toggle */}
          <button
            onClick={() => { toggleDesktopView(); setIsDesktopMode(v => !v); }}
            title={isDesktopMode ? "মোবাইল ভিউ" : "ডেস্কটপ ভিউ"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: isDesktopMode ? "#0D1B2A" : "rgba(253,246,236,0.85)",
              background: isDesktopMode
                ? "linear-gradient(135deg, #D4A843 0%, #E3BC63 100%)"
                : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(212,168,67,0.3)",
              borderRadius: 10,
              padding: "7px 12px",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontFamily: "'Noto Sans Bengali', sans-serif",
              fontWeight: 600,
              transition: "all 0.25s",
              marginRight: 8,
              whiteSpace: "nowrap",
            }}
          >
            {isDesktopMode ? <Smartphone size={15} /> : <Monitor size={15} />}
            <span className="hidden sm:inline">{isDesktopMode ? "মোবাইল" : "ডেস্কটপ"}</span>
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
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
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{
              background: "rgba(6,14,26,0.97)",
              borderTop: "1px solid rgba(212,168,67,0.18)",
              position: "fixed",
              top: 70, left: 0, right: 0, bottom: 0,
              height: "calc(100dvh - 70px)",
              minHeight: "calc(100vh - 70px)",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
              touchAction: "pan-y",
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

              {/* Author badge at top of menu */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 18,
                background: "linear-gradient(135deg, rgba(212,168,67,0.1) 0%, rgba(212,168,67,0.04) 100%)",
                border: "1px solid rgba(212,168,67,0.22)",
                marginBottom: 2,
              }}>
                <span style={{
                  width: 44, height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #D4A843, #C49030)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 16px rgba(212,168,67,0.3)",
                }}>
                  <Feather size={20} color="#0A1628" />
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{
                    fontFamily: "'Tiro Bangla', serif",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    background: "linear-gradient(90deg, #E8C97A, #D4A843)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>মাহবুব সরদার সবুজ</span>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.65rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(212,168,67,0.6)",
                  }}>লেখক ও কবি</span>
                </span>
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
                    const active = isPrimaryNavActive(link.href, link.type, location);
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
                          fontFamily: "'Noto Sans Bengali', sans-serif",
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
                          {/* Icon badge */}
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 38,
                            height: 38,
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

                          {/* Label + subtitle */}
                          <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                            <span style={{ fontSize: "0.98rem", fontWeight: 700, lineHeight: 1.3 }}>
                              {link.label}
                            </span>
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

                        {/* Arrow badge */}
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 30,
                          height: 30,
                          borderRadius: 999,
                          background: active ? "rgba(10,22,40,0.12)" : "rgba(212,168,67,0.07)",
                          border: active ? "1px solid rgba(10,22,40,0.12)" : "1px solid rgba(212,168,67,0.15)",
                          flexShrink: 0,
                        }}>
                          <ChevronRight size={14} color={active ? "#0D1B2A" : "#D4A843"} />
                        </span>
                      </motion.span>
                    );

                    return link.type === "page" ? (
                      <Link key={link.href} href={link.href}>
                        <span onClick={() => setMobileOpen(false)} style={{ display: "block" }}>
                          {linkContent}
                        </span>
                      </Link>
                    ) : (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={(e) => { e.preventDefault(); handleNavClick(link.href, link.type); }}
                        style={{ textDecoration: "none", display: "block" }}
                      >
                        {linkContent}
                      </a>
                    );
                  })}
                </motion.div>
              </div>

              {/* Info tabs — 2×2 grid */}
              <div style={{ margin: "0 2px" }}>
                <p style={{
                  fontFamily: "'Space Grotesk', sans-serif",
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
                          onClick={() => setMobileOpen(false)}
                          whileTap={{ scale: 0.97 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.28, ease: "easeOut" }}
                          style={{
                            fontFamily: "'Noto Sans Bengali', sans-serif",
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
                          <span style={{
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            lineHeight: 1.3,
                          }}>
                            {tab.titleBn}
                          </span>
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

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
