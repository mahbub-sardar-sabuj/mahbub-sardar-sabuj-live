import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, House, UserRound, Mic2, PenLine, Images, Newspaper, Mail, Palette, Feather } from "lucide-react";
import { Link, useLocation } from "wouter";
import { preloadRoute, preloadRoutesWhenIdle } from "@/lib/routePreloader";

const navLinks = [
  { label: "হোম", href: "/", icon: House },
  { label: "পরিচিতি", href: "/about", icon: UserRound },
  { label: "আবৃত্তি", href: "/facebook-recitations", icon: Mic2 },
  { label: "লেখালেখি ও বই", href: "/writings", icon: PenLine },
  { label: "আমিও লিখবো", href: "/amio-likhbo-bastobota", icon: Feather },
  { label: "ডিজাইন", href: "/editor", icon: Palette },
  { label: "গ্যালারি", href: "/gallery", icon: Images },
  { label: "সংবাদ", href: "/news", icon: Newspaper },
  { label: "যোগাযোগ", href: "/contact", icon: Mail },
];

const isActive = (href: string, location: string) => {
  if (href === "/") return location === "/";
  if (href === "/writings") return location === "/writings" || location === "/ebooks" || location.startsWith("/writings/") || location.startsWith("/ebooks/");
  return location === href || location.startsWith(href + "/");
};

export const openChatbot = () => {
  window.dispatchEvent(new CustomEvent("open-chatbot"));
};

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollThrottleRef = useRef<number | null>(null);
  const isEBookReaderPage = location.startsWith("/ebooks/read/");

  useEffect(() => {
    const navHeight = 72;
    document.documentElement.style.setProperty("--site-nav-offset", `${navHeight}px`);
    document.documentElement.style.setProperty("--site-nav-height", `${navHeight}px`);
    document.documentElement.style.setProperty("--site-banner-height", "0px");
    return () => {
      document.documentElement.style.removeProperty("--site-nav-offset");
      document.documentElement.style.removeProperty("--site-nav-height");
      document.documentElement.style.removeProperty("--site-banner-height");
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (scrollThrottleRef.current !== null) return;
      scrollThrottleRef.current = window.setTimeout(() => {
        setScrolled(window.scrollY > 10);
        scrollThrottleRef.current = null;
      }, 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollThrottleRef.current !== null) clearTimeout(scrollThrottleRef.current);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    if (mobileOpen) preloadRoutesWhenIdle(navLinks.map((link) => link.href));
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => setMobileOpen(false), [location]);
  const warmRoute = (href: string) => preloadRoute(href);
  if (isEBookReaderPage) return null;

  return (
    <nav className={`clean-navbar ${scrolled ? "is-scrolled" : ""}`}>
      <div className="clean-navbar__inner">
        <Link href="/">
          <span className="clean-navbar__brand" onPointerDown={() => warmRoute("/")} onMouseEnter={() => warmRoute("/")}>
            <span className="clean-navbar__mark"><Feather size={18} /></span>
            <span className="clean-navbar__brand-text">
              <strong>মাহবুব সরদার সবুজ</strong>
              <small>লেখক ও কবি</small>
            </span>
          </span>
        </Link>

        <div className="clean-navbar__links" aria-label="প্রধান মেনু">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href, location);
            return (
              <Link key={link.href} href={link.href}>
                <span
                  className={`clean-navbar__link ${active ? "active" : ""}`}
                  onPointerDown={() => warmRoute(link.href)}
                  onMouseEnter={() => warmRoute(link.href)}
                  onFocus={() => warmRoute(link.href)}
                >
                  <Icon size={15} /> {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        <button className="clean-navbar__menu" type="button" onClick={() => setMobileOpen((v) => !v)} aria-expanded={mobileOpen} aria-label="মেনু খুলুন">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="clean-navbar__mobile" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .18 }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href, location);
              return (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`clean-navbar__mobile-link ${active ? "active" : ""}`}
                    onPointerDown={() => warmRoute(link.href)}
                    onTouchStart={() => warmRoute(link.href)}
                    onMouseEnter={() => warmRoute(link.href)}
                    onFocus={() => warmRoute(link.href)}
                  >
                    <Icon size={18} /> {link.label}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
