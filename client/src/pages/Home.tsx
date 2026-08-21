/*
 * Home Page — হোমপেজ
 * Design: "Ink & Gold" — World-Class Literary Premium v2
 * Concept: Cinematic dark luxury author portfolio
 * Palette: Deep Navy #060E1A, Rich Gold #C9A84C, Ivory #FAF6EF, Charcoal #1E2D3D
 */
import { lazy, Suspense, useState, useEffect, useRef } from "react";

// PWA install prompt type
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
import {
  BookOpen, Images, Newspaper, Mail,
  UserRound, Palette,
  Star, Feather, Sparkles, Video, Music, Download, Smartphone, MailOpen,
  Search, ShieldCheck, Trash2, ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";

// ── Assets ────────────────────────────────────────────────────────────────────
// Critical LCP assets are served locally so Vercel/CDN caching is controlled by this project.
const PROFILE_1 = "/images/home/profile-home.jpeg";
const PROFILE_FALLBACK = "/images/author-photo.jpg";
const HERO_BG = "/images/home/hero-bg.webp";
const ABOUT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/about-bg-UJ5ebeZYm7Pq6XtFEyFtTv.webp";
const RulesSection = lazy(() => import("@/components/RulesSection"));

// ── Navigation sections ───────────────────────────────────────────────────────
const sections = [
  { label: "লেখালেখি ও বই", subtitle: "কবিতা, গদ্য ও প্রকাশিত বই", href: "/writings", icon: BookOpen },
  { label: "আমিও লিখবো বাস্তবতা", subtitle: "বাস্তবতা লেখার সৃজনশীল পরিসর", href: "/amio-likhbo-bastobota", icon: Feather },
  { label: "পরিচিতি", subtitle: "জীবন, লেখা ও লেখকের পথচলা", href: "/about", icon: UserRound },
  { label: "সরদার সংবাদ", subtitle: "আপডেট, প্রকাশনা ও সাম্প্রতিক খবর", href: "/news", icon: Newspaper },
  { label: "গ্যালারি", subtitle: "ছবি, মুহূর্ত ও স্মৃতির অ্যালবাম", href: "/gallery", icon: Images },
  { label: "ডিজাইন ফরম্যাট", subtitle: "লেখাকে দিন সুন্দর ভিজ্যুয়াল রূপ", href: "/editor", icon: Palette },
  { label: "যোগাযোগ", subtitle: "বার্তা, ইমেইল ও সংযোগের পথ", href: "/contact", icon: Mail },
  { label: "ইমেজ আপস্কেলার", subtitle: "এআই দিয়ে ছবির কোয়ালিটি বাড়ান", href: "/image-upscaler", icon: Sparkles },
  { label: "ভিডিও আপস্কেলার", subtitle: "ঝাপসা ভিডিও 4K/8K-এ উন্নত করুন", href: "/video-upscaler", icon: Video },
  { label: "অডিও এডিটর", subtitle: "ট্রিম, ফেড, স্পিড, রিভার্স ও নয়েজ রিডাকশন", href: "/audio-editor", icon: Music },
  { label: "টেম্প ইমেইল", subtitle: "বিনামূল্যে ডিসপোজেবল ইমেইল তৈরি করুন", href: "/temp-email", icon: MailOpen },
];

// ═════════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [pwaInstalling, setPwaInstalling] = useState(false);
  const [loadRulesSection, setLoadRulesSection] = useState(false);
  const [launcherVisible, setLauncherVisible] = useState(false);
  const [privateSearchQuery, setPrivateSearchQuery] = useState("");
  const privateSearchInputRef = useRef<HTMLInputElement | null>(null);
  const launcherRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const rulesSentinelRef = useRef<HTMLDivElement | null>(null);

  // PWA install prompt listener
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setPwaInstalled(true);
    }
    const onAppInstalled = () => {
      setPwaInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  useEffect(() => {
    // The rules section is content-heavy and sits well below the first screen.
    // Fetch it only when the visitor is approaching it, instead of interrupting
    // the first interaction after a fixed timer.
    const sentinel = rulesSentinelRef.current;
    if (!sentinel) return;

    const loadSection = () => setLoadRulesSection(true);
    if (typeof IntersectionObserver === "undefined") {
      const timer = window.setTimeout(loadSection, 3200);
      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        loadSection();
        observer.disconnect();
      }
    }, { rootMargin: "900px 0px" });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      setLauncherVisible(true);
      return;
    }

    const launcher = launcherRef.current;
    if (!launcher) return;
    const fallback = window.setTimeout(() => setLauncherVisible(true), 2600);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLauncherVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(launcher);
    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hero = heroRef.current;
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
      deviceMemory?: number;
    };
    const constrainedTouchDevice = window.matchMedia("(pointer: coarse)").matches && (
      nav.connection?.saveData === true ||
      (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) ||
      navigator.hardwareConcurrency <= 4
    );
    if (reducedMotion.matches || constrainedTouchDevice || !hero) return;

    let frame = 0;
    let heroIsVisible = true;
    const updateScrollEffects = () => {
      frame = 0;
      if (!heroIsVisible || document.hidden) return;
      const offset = Math.min(window.scrollY, 860);
      document.documentElement.style.setProperty("--home-hero-shift", `${-Math.min(offset * 0.045, 38)}px`);
      document.documentElement.style.setProperty("--home-glow-shift", `${Math.min(offset * 0.024, 22)}px`);
      document.documentElement.style.setProperty("--home-frame-shift", `${-Math.min(offset * 0.016, 14)}px`);
    };
    const queueScrollEffects = () => {
      if (heroIsVisible && !document.hidden && !frame) {
        frame = window.requestAnimationFrame(updateScrollEffects);
      }
    };
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroIsVisible = entry.isIntersecting;
      if (heroIsVisible) queueScrollEffects();
    }, { threshold: 0, rootMargin: "120px 0px 120px 0px" });
    const onVisibilityChange = () => {
      if (!document.hidden) queueScrollEffects();
    };

    heroObserver.observe(hero);
    updateScrollEffects();
    window.addEventListener("scroll", queueScrollEffects, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("scroll", queueScrollEffects);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      heroObserver.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      document.documentElement.style.removeProperty("--home-hero-shift");
      document.documentElement.style.removeProperty("--home-glow-shift");
      document.documentElement.style.removeProperty("--home-frame-shift");
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      // Fallback: show instructions
      alert('অ্যাপ ইনস্টল করতে:\n\nAndroid: Chrome মেনু > "অ্যাপ ইনস্টল করুন"\niPhone: Safari Share > "Add to Home Screen"');
      return;
    }
    setPwaInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setPwaInstalled(true);
    }
    setDeferredPrompt(null);
    setPwaInstalling(false);
  };

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [{
      "@type": "Person",
      "name": "Mahbub Sardar Sabuj",
      "alternateName": "মাহবুব সরদার সবুজ",
      "url": "https://www.mahbubsardarsabuj.com/",
      "image": PROFILE_1,
      "jobTitle": "লেখক ও কবি",
      "description": "বাংলা সাহিত্যের লেখক ও কবি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট।",
      "sameAs": [
        "https://facebook.com/MahbubSardarSabuj",
        "https://www.instagram.com/mahbub_sardar_sabuj",
        "https://youtube.com/@MahbubSardarSabuj"
      ],
    }]
  };

  return (
    <div className="home-page-premium" style={{ background: "#060E1A", minHeight: "100vh", overflowX: "hidden" }}>
      <Seo
        title="মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj - লেখক ও কবি"
        description="মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট। লেখকের পরিচিতি, বাংলা কবিতা, লেখালেখি, বই, ই-বুক, গ্যালারি ও সরদার সংবাদ একসাথে পড়ুন।"
        path="/"
        keywords="মাহবুব সরদার সবুজ, Mahbub Sardar Sabuj, বাংলা কবি, বাংলা লেখক, বাংলা কবিতা, ভালোবাসার কবিতা, বিচ্ছেদের কবিতা, বাংলা ই-বুক, দুঃখবিলাস, স্মৃতির বসন্তে তুমি, চাঁদফুল, সময়ের গহ্বরে, বাংলা সাহিত্য, বাংলাদেশি লেখক, mahbub sardar sabuj kobita, bangla kobita, bangla sahitya, bangladeshi poet, bangla ebook free, সরদার সংবাদ"
        jsonLd={homeJsonLd}
      />
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — Cinematic Split Layout
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="home-premium-hero"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          background: "#060E1A",
        }}
      >
        {/* Full-bleed background image with parallax */}
        <div
          className="hero-parallax-bg"
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            transform: "scale(1.02)",
          }}
        />

        {/* Multi-layer gradient overlay — richer depth */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg, rgba(4,10,20,0.96) 0%, rgba(6,14,26,0.88) 42%, rgba(6,14,26,0.35) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(4,10,20,1) 0%, rgba(6,14,26,0.6) 30%, transparent 60%)",
        }} />
        {/* Side vignette */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(4,10,20,0.55) 0%, transparent 40%, transparent 60%, rgba(4,10,20,0.35) 100%)",
          pointerEvents: "none",
        }} />

        {/* Animated grain texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4,
          pointerEvents: "none",
        }} />

        {/* Gold radial glow — top right, more intense */}
        <div
          className="hero-gold-glow"
          style={{
            position: "absolute",
            top: "-15%", right: "-8%",
            width: "55vw", height: "55vw",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.16) 0%, rgba(201,168,76,0.06) 40%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {/* Secondary blue-teal glow — bottom left */}
        <div
          className="hero-blue-glow"
          style={{
            position: "absolute",
            bottom: "-10%", left: "-5%",
            width: "40vw", height: "40vw",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(60,120,200,0.1) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Horizontal light streak */}
        <div style={{
          position: "absolute",
          top: "38%", left: 0, right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.12) 30%, rgba(201,168,76,0.22) 50%, rgba(201,168,76,0.12) 70%, transparent 100%)",
          pointerEvents: "none",
        }} />

        {/* Content */}
        <div
          style={{ position: "relative", zIndex: 2, width: "100%", opacity: 1 }}
          className="hero-container"
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem", minWidth: 0 }} className="hero-inner">

            {/* Left column — text */}
            <div className="hero-left">

              {/* Eyebrow badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: "0.8rem",
                  marginTop: "0.4rem",
                  padding: "6px 16px 6px 12px",
                  borderRadius: 40,
                  border: "1px solid rgba(201,168,76,0.4)",
                  background: "rgba(201,168,76,0.08)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 0 28px rgba(201,168,76,0.12), inset 0 1px 0 rgba(201,168,76,0.2), 0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {/* Pulsing dot */}
                <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#C9A84C",
                    display: "block",
                    boxShadow: "0 0 8px #C9A84C, 0 0 16px rgba(201,168,76,0.5)",
                    animation: "pulseDot 2s ease-in-out infinite",
                  }} />
                </span>
                <span style={{
                  fontFamily: "'AdorshoLipi', sans-serif",
                  fontSize: "0.84rem",
                  letterSpacing: "0.22em",
                  color: "#E8C97A",
                  fontWeight: 400,
                }}>লেখক ও কবি</span>
              </div>

              {/* Main name — single H1 for SEO, split visually with spans */}
              <h1 className="hero-title" style={{ margin: 0, padding: 0, display: "block", lineHeight: 1, maxWidth: "100%" }}>
              <div style={{ position: "relative", marginBottom: "0.2rem" }}>
                <span
                  style={{
                    fontFamily: "'AdorshoLipi', sans-serif",
                    fontSize: "clamp(3rem, 8.2vw, 8.5rem)",
                    fontWeight: 700,
                    lineHeight: 0.95,
                    display: "block",
                    maxWidth: "100%",
                    overflowWrap: "anywhere",
                    color: "#FAF6EF",
                    letterSpacing: "-0.03em",
                    textShadow: "0 2px 40px rgba(201,168,76,0.22), 0 0 100px rgba(201,168,76,0.1), 0 8px 32px rgba(0,0,0,0.5)",
                  }}
                >
                  মাহবুব
                </span>
              </div>

              <div style={{ position: "relative", marginBottom: "0.6rem" }}>
                <span
                  style={{
                    fontFamily: "'AdorshoLipi', sans-serif",
                    fontSize: "clamp(3rem, 8.2vw, 8.5rem)",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    display: "block",
                    maxWidth: "100%",
                    overflowWrap: "anywhere",
                    background: "linear-gradient(110deg, #8A5E10 0%, #C9A84C 18%, #F5E4A0 42%, #EDD07A 58%, #C9A84C 78%, #8A5E10 100%)",
                    backgroundSize: "280% 100%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-0.02em",
                    filter: "drop-shadow(0 6px 28px rgba(201,168,76,0.45))",
                    animation: "goldShimmer 6s ease-in-out infinite",
                    paddingBottom: "12px",
                  }}
                >
                  সরদার সবুজ
                </span>
                {/* Underline glow — wider & softer */}
                <div
                  style={{
                    position: "absolute", bottom: -8, left: 0,
                    height: 2,
                    width: "85%",
                    background: "linear-gradient(90deg, #C9A84C 0%, rgba(201,168,76,0.5) 60%, transparent 100%)",
                    transformOrigin: "left",
                    borderRadius: 2,
                    boxShadow: "0 0 20px rgba(201,168,76,0.7), 0 0 40px rgba(201,168,76,0.3)",
                  }}
                />
                            </div>
              </h1>
              {/* Tagline */}
              <div
                style={{ margin: "1.1rem 0 0.7rem", maxWidth: 460 }}
              >
                <p style={{
                  fontFamily: "'AdorshoLipi', sans-serif",
                  fontSize: "clamp(1rem, 1.9vw, 1.2rem)",
                  color: "rgba(250,246,239,0.68)",
                  lineHeight: 1.75,
                  margin: 0,
                  letterSpacing: "0.02em",
                  borderLeft: "2px solid rgba(201,168,76,0.5)",
                  paddingLeft: 18,
                }}>
                  বাংলা সাহিত্যের এক নিবেদিত কণ্ঠস্বর — কবিতা, গদ্য ও মানবিক অনুভূতির অনুসন্ধানী লেখক।
                </p>
              </div>

            </div>

            {/* Right column — author portrait */}
            <div
              className="hero-right"
              style={{ position: "relative" }}
            >
              {/* Portrait frame */}
              <div className="hero-frame-wrap" style={{ position: "relative" }}>
                {/* Decorative frame lines — more visible */}
                <div style={{
                  position: "absolute",
                  top: "var(--hero-frame-offset, -22px)", right: "var(--hero-frame-offset, -22px)",
                  width: "62%", height: "62%",
                  border: "1px solid rgba(201,168,76,0.32)",
                  borderRadius: 6,
                  pointerEvents: "none",
                  zIndex: 0,
                }} />
                <div style={{
                  position: "absolute",
                  bottom: "var(--hero-frame-offset, -22px)", left: "var(--hero-frame-offset, -22px)",
                  width: "62%", height: "62%",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: 6,
                  pointerEvents: "none",
                  zIndex: 0,
                }} />
                {/* Corner accent dots */}
                <div style={{
                  position: "absolute", top: "var(--hero-frame-offset, -22px)", right: "var(--hero-frame-offset, -22px)",
                  width: 8, height: 8, borderRadius: "50%",
                  background: "rgba(201,168,76,0.7)",
                  boxShadow: "0 0 10px rgba(201,168,76,0.5)",
                  zIndex: 2, pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute", bottom: "var(--hero-frame-offset, -22px)", left: "var(--hero-frame-offset, -22px)",
                  width: 8, height: 8, borderRadius: "50%",
                  background: "rgba(201,168,76,0.5)",
                  boxShadow: "0 0 10px rgba(201,168,76,0.4)",
                  zIndex: 2, pointerEvents: "none",
                }} />

                {/* Main portrait — suit photo */}
                <div style={{
                  position: "relative",
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 50px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(201,168,76,0.3), 0 0 80px rgba(201,168,76,0.12)",
                  backgroundColor: "#0A1728",
                  backgroundImage: `url(${PROFILE_1})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                  zIndex: 1,
                }}>
                  <img
                    src={PROFILE_1}
                    alt="মাহবুব সরদার সবুজ - বাংলা কবি ও লেখক - অফিসিয়াল প্রোফাইল ছবি"
                    onError={(e) => {
                      const image = e.currentTarget;
                      if (image.dataset.fallbackApplied !== "true") {
                        image.dataset.fallbackApplied = "true";
                        image.src = PROFILE_FALLBACK;
                      }
                    }}
                    style={{
                      width: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                      display: "block",
                      filter: "contrast(1.08) saturate(0.95) brightness(1.0)",
                    }}
                    className="hero-portrait"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                  {/* Gradient overlay — richer */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, transparent 45%, rgba(4,10,20,0.85) 100%)",
                  }} />
                  {/* Side glow on portrait */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to right, rgba(201,168,76,0.06) 0%, transparent 30%)",
                    pointerEvents: "none",
                  }} />
                  {/* Name tag at bottom */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "1.4rem 1.6rem",
                    background: "linear-gradient(to top, rgba(4,10,20,0.9) 0%, transparent 100%)",
                  }}>
                    <div style={{
                      fontFamily: "'AdorshoLipi', sans-serif",
                      fontSize: "0.6rem", letterSpacing: "0.22em",
                      textTransform: "uppercase", color: "#C9A84C", marginBottom: 4,
                    }}>লেখক ও কবি</div>
                    <div style={{
                      fontFamily: "'AdorshoLipi', sans-serif",
                      fontSize: "1.05rem", color: "#FAF6EF", fontWeight: 700,
                      textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                    }}>মাহবুব সরদার সবুজ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="scroll-indicator"
          style={{
            position: "absolute", bottom: 40, left: "50%",
            transform: "translateX(-50%)", zIndex: 3,
            opacity: 1,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: "'AdorshoLipi', sans-serif",
              color: "rgba(250,246,239,0.3)",
              fontSize: "0.62rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
            }}>Scroll</span>
            <div style={{
              width: 1, height: 44,
              background: "linear-gradient(to bottom, rgba(201,168,76,0.7), transparent)",
              boxShadow: "0 0 8px rgba(201,168,76,0.3)",
            }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          APP LAUNCHER — Compact explore tabs
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="explore"
        ref={launcherRef}
        className={`explore-app-section${launcherVisible ? " is-revealed" : ""}`}
        style={{
        padding: "clamp(3.5rem, 7vw, 5.6rem) 1.25rem",
        background: "linear-gradient(180deg, rgba(4,10,20,0.98) 0%, rgba(6,14,26,1) 16%, rgba(6,14,26,1) 100%), radial-gradient(circle at 78% 12%, rgba(201,168,76,0.15), transparent 32%), radial-gradient(circle at 12% 78%, rgba(232,201,122,0.08), transparent 30%), #060E1A",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Dot grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(201,168,76,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none", opacity: 0.5,
        }} />
        {/* Central glow */}
        <div style={{
          position: "absolute", inset: "8% auto auto 50%",
          width: 480, height: 480,
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: "rgba(201,168,76,0.065)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }} />
        {/* Top separator line */}
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.42), rgba(250,246,239,0.22), rgba(201,168,76,0.42), transparent)",
          boxShadow: "0 0 28px rgba(201,168,76,0.16)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1040, margin: "0 auto" }}>
          <div
            className="explore-app-heading"
          >
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: "0.95rem" }}>
              <div style={{ width: 48, height: 1, background: "linear-gradient(90deg, transparent, #C9A84C)" }} />
              <span style={{
                fontFamily: "'AdorshoLipi', sans-serif",
                fontSize: "0.66rem", letterSpacing: "0.34em",
                textTransform: "uppercase", color: "#E8C97A",
                textShadow: "0 0 18px rgba(201,168,76,0.32)",
              }}>Explore</span>
              <div style={{ width: 48, height: 1, background: "linear-gradient(90deg, #C9A84C, transparent)" }} />
            </div>
            <h2 style={{
              fontFamily: "'AdorshoLipi', sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.1rem)",
              fontWeight: 700, color: "#FAF6EF",
              margin: 0, lineHeight: 1.18,
              textShadow: "0 4px 24px rgba(0,0,0,0.48), 0 0 34px rgba(201,168,76,0.14)",
            }}>অন্বেষণ করুন</h2>
            <p style={{
              fontFamily: "'AdorshoLipi', sans-serif",
              maxWidth: 650, color: "rgba(250,246,239,0.66)",
              lineHeight: 1.72, margin: "1rem auto 0",
              fontSize: "0.98rem",
            }}>
              লেখক, লেখা, বই, গ্যালারি ও সংবাদ—সব গুরুত্বপূর্ণ ঠিকানা এক জায়গায় সাজানো।
            </p>
          </div>

          <div
            className="app-launcher-shell"
          >
            <div className="app-launcher-topbar">
              <span />
              <strong>সব ট্যাব</strong>
              <span />
            </div>
            <div className="app-launcher-grid">
              {sections.map((sec, i) => {
                const Icon = sec.icon;
                return (
                  <div
                    key={sec.href + sec.label}
                  >
                    <Link href={sec.href} className="app-launcher-link" aria-label={`${sec.label} খুলুন`}>
                      <div
                        className="app-launcher-card"
                      >
                        <div className="app-icon-wrap">
                          <Icon size={23} strokeWidth={1.8} />
                        </div>
                        <span className="app-label">{sec.label}</span>
                        <span className="app-subtitle">{sec.subtitle}</span>
                      </div>
                    </Link>
                  </div>
                );
              })}

              {/* PWA Install Card */}
              <div
              >
                <button
                  onClick={handleInstallPWA}
                  className="app-launcher-link"
                  style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  aria-label="অ্যাপ ইনস্টল করুন"
                >
                  <div
                    className="app-launcher-card pwa-install-card"
                    style={{
                      background: pwaInstalled
                        ? 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(74,222,128,0.05))'
                        : 'linear-gradient(135deg, rgba(201,168,76,0.18), rgba(201,168,76,0.06))',
                      border: pwaInstalled
                        ? '1.5px solid rgba(74,222,128,0.35)'
                        : '1.5px solid rgba(201,168,76,0.35)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Glow effect */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0,
                      height: '2px',
                      background: pwaInstalled
                        ? 'linear-gradient(90deg, transparent, rgba(74,222,128,0.8), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(201,168,76,0.8), transparent)',
                    }} />
                    <div className="app-icon-wrap" style={{
                      background: pwaInstalled
                        ? 'rgba(74,222,128,0.15)'
                        : 'rgba(201,168,76,0.15)',
                      border: pwaInstalled
                        ? '1px solid rgba(74,222,128,0.3)'
                        : '1px solid rgba(201,168,76,0.3)',
                    }}>
                      {pwaInstalling ? (
                        <Smartphone size={23} strokeWidth={1.8} style={{ color: '#c9a84c', animation: 'pulse 1s infinite' }} />
                      ) : pwaInstalled ? (
                        <Smartphone size={23} strokeWidth={1.8} style={{ color: '#4ade80' }} />
                      ) : (
                        <Download size={23} strokeWidth={1.8} style={{ color: '#c9a84c' }} />
                      )}
                    </div>
                    <span className="app-label" style={{
                      color: pwaInstalled ? '#4ade80' : '#c9a84c',
                      fontWeight: 700,
                    }}>
                      {pwaInstalled ? 'ইনস্টল হয়েছে' : pwaInstalling ? 'ইনস্টল হচ্ছে...' : 'অ্যাপ ইনস্টল'}
                    </span>
                    <span className="app-subtitle">
                      {pwaInstalled ? 'হোম স্ক্রিনে আছে ✓' : 'ফোনে অ্যাপ হিসেবে রাখুন'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <section className="private-search-section" aria-labelledby="private-search-title">
            <div className="private-search-meta">
              <div className="private-search-title-row">
                <span className="private-search-badge"><ShieldCheck size={15} strokeWidth={2.1} aria-hidden="true" /> Private</span>
                <strong id="private-search-title">Mahbub Sardar Sabuj Private Search</strong>
              </div>
              <span className="private-search-description">Brave Search ব্যবহার করুন, এই ওয়েবসাইটে কোনো search history রাখা হয় না।</span>
            </div>

            <form
              className="private-search-form"
              onSubmit={(event) => {
                event.preventDefault();
                const searchTerm = privateSearchQuery.trim();
                if (!searchTerm) {
                  privateSearchInputRef.current?.focus();
                  return;
                }
                const braveUrl = `https://search.brave.com/search?q=${encodeURIComponent(searchTerm)}&source=web`;
                window.open(braveUrl, "_blank", "noopener,noreferrer");
                setPrivateSearchQuery("");
              }}
            >
              <Search className="private-search-icon" size={22} strokeWidth={1.9} aria-hidden="true" />
              <input
                ref={privateSearchInputRef}
                value={privateSearchQuery}
                onChange={(event) => setPrivateSearchQuery(event.target.value)}
                type="search"
                inputMode="search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="প্রাইভেটভাবে যা খুঁজতে চান লিখুন..."
                aria-label="Brave Search-এ সার্চ করুন"
              />
              {privateSearchQuery ? (
                <button
                  type="button"
                  className="private-search-clear"
                  onClick={() => {
                    setPrivateSearchQuery("");
                    try { window.sessionStorage.removeItem("mss-private-search-query"); } catch { /* Storage may be unavailable in strict private browsing. */ }
                    window.requestAnimationFrame(() => privateSearchInputRef.current?.focus());
                  }}
                  aria-label="সার্চ লেখা মুছুন"
                  title="সার্চ লেখা মুছুন"
                >
                  <Trash2 size={17} strokeWidth={2} aria-hidden="true" />
                </button>
              ) : null}
              <button type="submit" className="private-search-submit" aria-label="Brave Search-এ নতুন tab-এ সার্চ করুন">
                <span>সার্চ</span>
                <ExternalLink size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </form>

            <div className="private-search-footer">
              <span><ShieldCheck size={14} strokeWidth={2} aria-hidden="true" /> কোনো search history সংরক্ষণ করা হয় না</span>
              <button
                type="button"
                onClick={() => {
                  setPrivateSearchQuery("");
                  try { window.sessionStorage.removeItem("mss-private-search-query"); } catch { /* Storage may be unavailable in strict private browsing. */ }
                  window.requestAnimationFrame(() => privateSearchInputRef.current?.focus());
                }}
              >
                <Trash2 size={14} strokeWidth={2} aria-hidden="true" /> সব তথ্য মুছুন
              </button>
            </div>
          </section>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          RULES / WHY USE THIS WEBSITE SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <div ref={rulesSentinelRef} aria-hidden="true" style={{ height: 0, pointerEvents: "none" }} />
      {loadRulesSection ? (
        <Suspense fallback={null}>
          <RulesSection />
        </Suspense>
      ) : null}

      {/* AdSense Ad — হোম পেজের নিচে */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem 1.5rem" }}>
        <AdSenseAd adSlot={AD_SLOTS.HOME_BANNER} adFormat="auto" fullWidthResponsive={true} />
      </div>

      {/* ── Responsive CSS ────────────────────────────────────────────────────── */}
      <style>{`
        /* Bengali typography is served locally through AdorshoLipi to avoid render-blocking third-party font requests. */

        * { box-sizing: border-box; }

        @keyframes goldShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 8px #C9A84C, 0 0 16px rgba(201,168,76,0.5); }
          50% { opacity: 0.65; transform: scale(1.6); box-shadow: 0 0 18px rgba(201,168,76,0.9), 0 0 32px rgba(201,168,76,0.4); }
        }
        @keyframes homeHeroReveal {
          from { opacity: 0; transform: translate3d(0, 10px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes homePortraitSettle {
          from { opacity: 0; transform: translate3d(0, 14px, 0) scale(0.985); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes glassCardReveal {
          from { opacity: 0; transform: translate3d(0, 18px, 0) scale(0.982); filter: blur(3px); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
        }
        @keyframes cinematicCrownDrift {
          0%, 100% { opacity: 0.36; transform: translate3d(-2%, -1%, 0) scale(1); }
          50% { opacity: 0.72; transform: translate3d(3%, 2%, 0) scale(1.035); }
        }
        @keyframes portraitHaloBreathe {
          0%, 100% { opacity: 0.36; transform: scale(0.94); }
          50% { opacity: 0.68; transform: scale(1.06); }
        }

        /* Hero layout */
        .hero-container {
          padding-top: calc(var(--site-nav-offset, 98px) + 28px);
          padding-bottom: 64px;
        }
        .hero-inner {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: clamp(3rem, 6vw, 6rem);
          align-items: center;
        }
        .hero-portrait {
          height: clamp(480px, 55vw, 680px);
          width: 100%;
          object-fit: cover;
          object-position: center top;
        }
        .floating-card {
          min-width: 180px;
        }

        /* App-style Explore launcher */
        .explore-app-heading {
          text-align: center;
          margin-bottom: 2.35rem;
          position: relative;
        }
        .explore-app-heading::after {
          content: "";
          display: block;
          width: min(220px, 48vw);
          height: 1px;
          margin: 1.25rem auto 0;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.55), transparent);
          box-shadow: 0 0 22px rgba(201,168,76,0.18);
        }
          .app-launcher-shell {
          border: 1px solid rgba(201,168,76,0.34);
          border-radius: 42px;
          padding: clamp(1.25rem, 3vw, 2rem);
          background: linear-gradient(145deg, rgba(255,255,255,0.095) 0%, rgba(201,168,76,0.065) 58%, rgba(8,18,32,0.72) 100%);
          box-shadow:
            0 58px 150px rgba(0,0,0,0.52),
            0 0 42px rgba(201,168,76,0.10),
            0 0 0 1px rgba(255,255,255,0.055) inset,
            inset 0 1px 0 rgba(255,255,255,0.12);
          backdrop-filter: blur(22px) saturate(140%);
          max-width: 840px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }
        .app-launcher-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(232,201,122,0.20), transparent 45%);
          pointer-events: none;
        }
        .app-launcher-shell::after {
          content: "";
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.18), transparent);
          pointer-events: none;
        }
        .app-launcher-topbar {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 0 0 1.25rem;
          color: rgba(232,201,122,0.92);
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.76rem;
          letter-spacing: 0.1em;
        }
        .app-launcher-topbar span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(201,168,76,0.5);
          box-shadow: 0 0 16px rgba(201,168,76,0.5);
        }
          .app-launcher-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: clamp(0.72rem, 2vw, 1rem);
        }
        .app-launcher-link {
          display: block;
          text-decoration: none;
          height: 100%;
        }
          .app-launcher-card {
          min-height: 148px;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          text-align: center;
          gap: 0.48rem;
          padding: 1.12rem 0.7rem 0.92rem;
          border-radius: 28px;
          border: 1px solid rgba(201,168,76,0.24);
          background:
            radial-gradient(circle at 50% -18%, rgba(232,201,122,0.16), transparent 48%),
            linear-gradient(160deg, rgba(20,35,59,0.98) 0%, rgba(8,18,32,0.9) 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.10),
            inset 0 -1px 0 rgba(0,0,0,0.22),
            0 18px 42px rgba(0,0,0,0.34),
            0 2px 12px rgba(0,0,0,0.25),
            0 0 0 1px rgba(201,168,76,0.035);
          color: #FAF6EF;
          cursor: pointer;
          transition: border-color 0.28s ease, background 0.28s ease, box-shadow 0.28s ease, transform 0.28s ease;
          position: relative;
          overflow: hidden;
          isolation: isolate;
          transform: translateZ(0);
        }
        .app-launcher-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(201,168,76,0.12), transparent 55%);
          opacity: 0;
          transition: opacity 0.28s ease;
          pointer-events: none;
        }
        .app-launcher-card::after {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: calc(28px - 1px);
          border: 1px solid rgba(255,255,255,0.035);
          pointer-events: none;
          z-index: -1;
        }
        .app-launcher-card:hover {
          border-color: rgba(201,168,76,0.62);
          background: linear-gradient(160deg, rgba(201,168,76,0.13) 0%, rgba(10,22,38,0.88) 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.09),
            0 28px 64px rgba(0,0,0,0.42),
            0 0 34px rgba(201,168,76,0.16),
            0 0 0 1px rgba(201,168,76,0.14) inset;
        }
        .app-launcher-card:hover::before {
          opacity: 1;
        }
        .app-launcher-link:focus-visible {
          outline: none;
        }
        .app-launcher-link:focus-visible .app-launcher-card {
          border-color: rgba(245,228,160,0.82);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 26px 62px rgba(0,0,0,0.42),
            0 0 0 3px rgba(201,168,76,0.22),
            0 0 34px rgba(201,168,76,0.18);
        }
        .app-launcher-card:active {
          border-color: rgba(245,228,160,0.7);
          background: linear-gradient(160deg, rgba(201,168,76,0.16) 0%, rgba(10,22,38,0.9) 100%);
          transform: translateZ(0) scale(0.97);
        }
        .app-launcher-grid > div:nth-child(-n+4) .app-launcher-card {
          border-color: rgba(201,168,76,0.32);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.09),
            0 24px 58px rgba(0,0,0,0.40),
            0 0 26px rgba(201,168,76,0.065);
        }
          .app-icon-wrap {
          width: clamp(52px, 7vw, 64px);
          height: clamp(52px, 7vw, 64px);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F2D789;
          background: linear-gradient(145deg, rgba(201,168,76,0.25), rgba(250,246,239,0.07));
          border: 1px solid rgba(201,168,76,0.36);
          box-shadow:
            0 12px 28px rgba(0,0,0,0.28),
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 0 24px rgba(201,168,76,0.14);
          margin-bottom: 0.2rem;
          transition: box-shadow 0.28s ease, transform 0.28s ease;
        }
        .app-launcher-card:hover .app-icon-wrap {
          box-shadow:
            0 14px 32px rgba(0,0,0,0.32),
            inset 0 1px 0 rgba(255,255,255,0.12),
            0 0 28px rgba(201,168,76,0.22);
          transform: scale(1.06);
        }
        .app-label {
          font-family: 'AdorshoLipi', sans-serif;
          font-size: clamp(0.86rem, 2.2vw, 1.02rem);
          font-weight: 700;
          line-height: 1.22;
          color: #FFF8EA;
          min-height: 2.45em;
          text-shadow: 0 2px 12px rgba(0,0,0,0.38);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .app-subtitle {
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.66rem;
          line-height: 1.38;
          color: rgba(250,246,239,0.58);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Private Search: only the current query exists in memory, then opens in a fresh Brave Search tab. */
        .private-search-section {
          position: relative;
          z-index: 1;
          max-width: 840px;
          margin: clamp(1rem, 2.3vw, 1.45rem) auto 0;
          padding: clamp(0.72rem, 1.8vw, 1rem);
          border: 1px solid rgba(201,168,76,0.30);
          border-radius: 25px;
          background: linear-gradient(140deg, rgba(255,255,255,0.10), rgba(201,168,76,0.07) 47%, rgba(8,18,32,0.82));
          box-shadow: 0 24px 60px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.11), 0 0 30px rgba(201,168,76,0.07);
          backdrop-filter: blur(20px) saturate(135%);
        }
        .private-search-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.85rem;
          padding: 0.08rem 0.42rem 0.68rem;
          font-family: 'AdorshoLipi', sans-serif;
        }
        .private-search-title-row { display: flex; align-items: center; gap: 0.62rem; min-width: 0; }
        .private-search-title-row strong { color: #FFF7DF; font-size: clamp(0.78rem, 1.8vw, 0.96rem); letter-spacing: 0.015em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .private-search-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          flex: 0 0 auto;
          border: 1px solid rgba(95,226,161,0.32);
          border-radius: 999px;
          padding: 0.24rem 0.5rem;
          color: #89E5B4;
          background: rgba(39,170,104,0.11);
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.04em;
        }
        .private-search-description { color: rgba(250,246,239,0.52); font-size: 0.67rem; line-height: 1.35; text-align: right; }
        .private-search-form {
          display: flex;
          align-items: center;
          gap: 0.62rem;
          min-height: 62px;
          padding: 0.38rem 0.42rem 0.38rem 1rem;
          border: 1px solid rgba(201,168,76,0.38);
          border-radius: 18px;
          background: linear-gradient(100deg, rgba(4,12,23,0.92), rgba(13,29,48,0.92));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.22), 0 8px 22px rgba(0,0,0,0.22);
          transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
        }
        .private-search-form:focus-within {
          border-color: rgba(245,224,140,0.78);
          background: linear-gradient(100deg, rgba(6,16,29,0.98), rgba(18,39,63,0.97));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.09), 0 0 0 3px rgba(201,168,76,0.13), 0 12px 28px rgba(0,0,0,0.30), 0 0 24px rgba(201,168,76,0.11);
        }
        .private-search-icon { flex: 0 0 auto; color: #E9C96D; filter: drop-shadow(0 0 7px rgba(232,201,122,0.28)); }
        .private-search-form input {
          flex: 1;
          min-width: 0;
          height: 46px;
          border: 0;
          outline: 0;
          padding: 0;
          color: #FFF9EC;
          background: transparent;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: clamp(0.96rem, 2.4vw, 1.12rem);
          line-height: 1.3;
        }
        .private-search-form input::placeholder { color: rgba(250,246,239,0.44); opacity: 1; }
        .private-search-clear {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          padding: 0;
          border: 1px solid rgba(250,246,239,0.16);
          border-radius: 11px;
          color: rgba(250,246,239,0.68);
          background: rgba(255,255,255,0.055);
          transition: background .16s ease, border-color .16s ease, color .16s ease, transform .16s ease;
        }
        .private-search-clear:hover { color: #FFF9EC; border-color: rgba(201,168,76,0.48); background: rgba(201,168,76,0.13); }
        .private-search-clear:active, .private-search-submit:active, .private-search-footer button:active { transform: scale(0.97); }
        .private-search-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.38rem;
          min-width: 100px;
          min-height: 46px;
          padding: 0.65rem 0.86rem;
          border: 1px solid rgba(255,234,154,0.72);
          border-radius: 13px;
          color: #102134;
          background: linear-gradient(135deg, #F5DC85, #C99D38);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.54), 0 8px 18px rgba(0,0,0,0.22);
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.87rem;
          font-weight: 900;
          transition: transform .16s ease, filter .16s ease, box-shadow .16s ease;
        }
        .private-search-submit:hover { filter: brightness(1.06); box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 10px 22px rgba(201,168,76,0.22); }
        .private-search-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.6rem;
          padding: 0.65rem 0.35rem 0.05rem;
          color: rgba(250,246,239,0.49);
          font: 0.67rem/1.35 'AdorshoLipi', sans-serif;
        }
        .private-search-footer span, .private-search-footer button { display: inline-flex; align-items: center; gap: 0.34rem; }
        .private-search-footer button {
          border: 0;
          padding: 0.18rem 0;
          color: #EACD79;
          background: transparent;
          font: 800 0.69rem 'AdorshoLipi', sans-serif;
          transition: color .16s ease, transform .16s ease;
        }
        .private-search-footer button:hover { color: #FFF1B5; }
        .private-search-form input:focus-visible, .private-search-clear:focus-visible, .private-search-submit:focus-visible, .private-search-footer button:focus-visible {
          outline: 2px solid rgba(245,224,140,0.92);
          outline-offset: 3px;
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .hero-inner {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            text-align: center;
          }
          .hero-right {
            display: flex;
            justify-content: center;
          }
          .hero-portrait { height: 280px; }
          .floating-card { display: none; }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .hero-container { padding-top: calc(var(--site-nav-offset, 98px) + 10px); padding-bottom: 36px; }
          .hero-frame-wrap { --hero-frame-offset: -10px; width: 100%; }
          .scroll-indicator { display: none; }
          .hero-inner { gap: 0.95rem; padding-left: 1rem !important; padding-right: 1rem !important; min-width: 0; }
          .hero-left { min-width: 0; width: 100%; }
          .hero-right { display: flex; justify-content: center; margin-top: -1.35rem; }
          .hero-title { width: 100%; }
          .hero-title span { font-size: clamp(2.62rem, 15vw, 5rem) !important; letter-spacing: -0.045em !important; }
          .app-launcher-shell { border-radius: 30px; padding: 0.88rem; }
          .app-launcher-topbar { margin-bottom: 0.9rem; }
          .app-launcher-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.6rem; }
          .app-launcher-card { min-height: 114px; border-radius: 22px; padding: 0.78rem 0.36rem 0.66rem; }
          .app-icon-wrap { border-radius: 15px; width: 46px; height: 46px; margin-bottom: 0.08rem; }
          .app-label { font-size: 0.79rem; line-height: 1.2; min-height: 2.3em; }
          .app-subtitle { display: none; }
          .private-search-section { margin-top: 0.9rem; border-radius: 21px; padding: 0.64rem; }
          .private-search-form { min-height: 58px; padding-left: 0.82rem; gap: 0.5rem; }
          .private-search-description { display: none; }
          .private-search-footer { padding: 0.52rem 0.2rem 0.02rem; }
          .hero-portrait { height: clamp(280px, 78vw, 420px); }
        }

        @media (max-width: 480px) {
          .explore-app-section { padding-left: 0.8rem !important; padding-right: 0.8rem !important; }
          .hero-inner { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
          .hero-title span { font-size: clamp(2.28rem, 14.2vw, 4.4rem) !important; }
          .app-launcher-shell { padding: 0.78rem; border-radius: 27px; }
          .app-launcher-topbar { margin-bottom: 0.76rem; }
          .app-launcher-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.56rem; }
          .app-launcher-card { min-height: 108px; padding: 0.7rem 0.3rem 0.58rem; border-radius: 20px; }
          .app-launcher-card::after { border-radius: calc(20px - 1px); }
          .app-icon-wrap { width: 43px; height: 43px; border-radius: 14px; }
          .app-icon-wrap svg { width: 20px; height: 20px; }
          .app-label { font-size: 0.76rem; min-height: 2.3em; }
          .private-search-title-row strong { font-size: 0.75rem; }
          .private-search-form input { font-size: 0.9rem; }
          .private-search-submit { min-width: 46px; padding: 0.62rem; }
          .private-search-submit span { display: none; }
          .private-search-footer span { font-size: 0.62rem; }
          .private-search-footer button { font-size: 0.64rem; }
          .hero-portrait { height: min(360px, calc(100vw - 24px)); }
        }
        /* Current layout premium polish — content, routes and interactions remain unchanged. */
        .home-page-premium {
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .home-page-premium .hero-parallax-bg {
          transform: translate3d(0, var(--home-hero-shift, 0px), 0) scale(1.045) !important;
          transition: transform .12s linear;
          will-change: transform;
        }
        .home-page-premium .hero-gold-glow {
          transform: translate3d(0, var(--home-glow-shift, 0px), 0) !important;
          transition: transform .12s linear;
          will-change: transform;
        }
        .home-page-premium .hero-blue-glow {
          transform: translate3d(0, calc(var(--home-glow-shift, 0px) * -0.7), 0) !important;
          transition: transform .12s linear;
          will-change: transform;
        }
        .home-page-premium .hero-right {
          transform: translate3d(0, var(--home-frame-shift, 0px), 0);
          transition: transform .16s linear;
          will-change: transform;
        }
        .home-page-premium .home-premium-hero::before {
          content: "";
          position: absolute;
          z-index: 1;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 44% 34% at 50% -6%, rgba(255,239,178,0.20) 0%, rgba(201,168,76,0.08) 38%, transparent 74%),
            linear-gradient(116deg, transparent 24%, rgba(245,228,160,0.055) 47%, transparent 70%);
          mask-image: linear-gradient(to bottom, black 0%, rgba(0,0,0,0.72) 30%, transparent 68%);
          -webkit-mask-image: linear-gradient(to bottom, black 0%, rgba(0,0,0,0.72) 30%, transparent 68%);
          animation: cinematicCrownDrift 10s cubic-bezier(0.42, 0, 0.58, 1) infinite;
          will-change: transform, opacity;
        }
        .home-page-premium .home-premium-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.028), transparent 24%, transparent 76%, rgba(201,168,76,0.045)),
            radial-gradient(circle at 76% 17%, rgba(245,228,160,0.09), transparent 25%);
          box-shadow: inset 0 -1px 0 rgba(255,255,255,0.055), inset 0 1px 0 rgba(255,255,255,0.028);
        }
        .home-page-premium .hero-container {
          padding-top: calc(var(--site-nav-offset, 98px) + 34px);
          padding-bottom: 76px;
          animation: homeHeroReveal .62s cubic-bezier(0.23, 1, 0.32, 1) both;
          will-change: transform, opacity;
        }
        .home-page-premium .hero-inner {
          gap: clamp(3.5rem, 7vw, 7.5rem);
        }
        .home-page-premium .hero-left > div:first-child {
          box-shadow: 0 12px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.07);
        }
        .home-page-premium .hero-title {
          text-wrap: balance;
        }
        .home-page-premium .hero-right {
          max-width: 430px;
          justify-self: end;
          isolation: isolate;
        }
        .home-page-premium .hero-frame-wrap {
          filter: drop-shadow(0 28px 56px rgba(0,0,0,0.24));
          animation: homePortraitSettle .78s cubic-bezier(0.23, 1, 0.32, 1) .08s both;
          will-change: transform, opacity;
        }
        .home-page-premium .hero-frame-wrap::before {
          content: "";
          position: absolute;
          z-index: 0;
          inset: -14%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,201,122,0.24) 0%, rgba(201,168,76,0.09) 40%, transparent 70%);
          filter: blur(18px);
          pointer-events: none;
          animation: portraitHaloBreathe 7.5s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .home-page-premium .hero-frame-wrap::after {
          content: "";
          position: absolute;
          inset: 8px;
          z-index: 2;
          border: 1px solid rgba(250,246,239,0.10);
          border-radius: 14px;
          pointer-events: none;
          box-shadow: inset 0 0 0 1px rgba(201,168,76,0.08);
        }
        .home-page-premium .hero-portrait {
          filter: contrast(1.06) saturate(0.94) brightness(1.02) !important;
        }
        .home-page-premium .explore-app-section {
          padding-top: clamp(4rem, 7.5vw, 6rem) !important;
          padding-bottom: clamp(4.2rem, 8vw, 6.3rem) !important;
        }
        .home-page-premium .explore-app-heading {
          margin-bottom: 2.65rem;
        }
        .home-page-premium .app-launcher-shell {
          max-width: 890px;
          padding: clamp(1.12rem, 2.5vw, 1.72rem);
          border-color: rgba(232,201,122,0.40);
          box-shadow:
            0 62px 154px rgba(0,0,0,0.56),
            0 0 58px rgba(201,168,76,0.11),
            0 0 0 1px rgba(255,255,255,0.065) inset,
            inset 0 1px 0 rgba(255,255,255,0.14);
        }
        .home-page-premium .app-launcher-shell::before {
          background:
            radial-gradient(circle at 50% 0%, rgba(232,201,122,0.22), transparent 47%),
            linear-gradient(120deg, rgba(255,255,255,0.025), transparent 42%);
        }
        .home-page-premium .app-launcher-topbar {
          margin-bottom: 1.08rem;
          letter-spacing: 0.15em;
        }
        .home-page-premium .app-launcher-grid {
          gap: clamp(0.68rem, 1.8vw, 0.92rem);
        }
        .home-page-premium .app-launcher-card {
          min-height: 144px;
          border-color: rgba(232,201,122,0.27);
          background:
            radial-gradient(circle at 50% -14%, rgba(232,201,122,0.18), transparent 47%),
            linear-gradient(160deg, rgba(23,42,67,0.98) 0%, rgba(7,16,29,0.94) 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.12),
            inset 0 -1px 0 rgba(0,0,0,0.24),
            0 21px 48px rgba(0,0,0,0.37),
            0 0 0 1px rgba(201,168,76,0.05);
        }
        .home-page-premium .app-launcher-card::after {
          border-color: rgba(255,255,255,0.052);
        }
        .home-page-premium .app-launcher-card:hover {
          border-color: rgba(245,228,160,0.72);
          background:
            radial-gradient(circle at 50% 0%, rgba(232,201,122,0.22), transparent 50%),
            linear-gradient(160deg, rgba(34,55,81,0.99) 0%, rgba(9,21,37,0.97) 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.14),
            0 30px 68px rgba(0,0,0,0.48),
            0 0 38px rgba(201,168,76,0.18),
            0 0 0 1px rgba(201,168,76,0.16) inset;
        }
        .home-page-premium .app-icon-wrap {
          border-color: rgba(232,201,122,0.44);
          background: linear-gradient(145deg, rgba(201,168,76,0.29), rgba(250,246,239,0.08));
          box-shadow:
            0 14px 30px rgba(0,0,0,0.30),
            inset 0 1px 0 rgba(255,255,255,0.14),
            0 0 28px rgba(201,168,76,0.16);
        }
        .home-page-premium .app-label {
          letter-spacing: 0.005em;
        }
        .home-page-premium .app-subtitle {
          color: rgba(250,246,239,0.64);
        }
        .home-page-premium .explore-app-section:not(.is-revealed) .app-launcher-grid > div {
          opacity: 0;
          transform: translate3d(0, 18px, 0) scale(0.982);
        }
        .home-page-premium .explore-app-section.is-revealed .app-launcher-grid > div {
          animation: glassCardReveal .52s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        .home-page-premium .explore-app-section.is-revealed .app-launcher-grid > div:nth-child(1) { animation-delay: 0ms; }
        .home-page-premium .explore-app-section.is-revealed .app-launcher-grid > div:nth-child(2) { animation-delay: 45ms; }
        .home-page-premium .explore-app-section.is-revealed .app-launcher-grid > div:nth-child(3) { animation-delay: 90ms; }
        .home-page-premium .explore-app-section.is-revealed .app-launcher-grid > div:nth-child(4) { animation-delay: 135ms; }
        .home-page-premium .explore-app-section.is-revealed .app-launcher-grid > div:nth-child(5) { animation-delay: 180ms; }
        .home-page-premium .explore-app-section.is-revealed .app-launcher-grid > div:nth-child(6) { animation-delay: 225ms; }
        .home-page-premium .explore-app-section.is-revealed .app-launcher-grid > div:nth-child(7) { animation-delay: 270ms; }
        .home-page-premium .explore-app-section.is-revealed .app-launcher-grid > div:nth-child(8) { animation-delay: 315ms; }
        .home-page-premium .explore-app-section.is-revealed .app-launcher-grid > div:nth-child(9) { animation-delay: 360ms; }
        .home-page-premium .explore-app-section.is-revealed .app-launcher-grid > div:nth-child(10) { animation-delay: 405ms; }
        .home-page-premium .explore-app-section.is-revealed .app-launcher-grid > div:nth-child(11) { animation-delay: 450ms; }
        .home-page-premium .explore-app-section.is-revealed .app-launcher-grid > div:nth-child(12) { animation-delay: 495ms; }
        .home-page-premium .app-launcher-link:focus-visible .app-launcher-card,
        .home-page-premium .pwa-install-card:focus-visible {
          outline: 3px solid rgba(245,228,160,0.30);
          outline-offset: 3px;
        }
        @media (max-width: 1024px) {
          .home-page-premium .hero-right { justify-self: center; }
        }
        @media (max-width: 768px) {
          .home-page-premium .home-premium-hero::after {
            background: linear-gradient(180deg, rgba(255,255,255,0.025), transparent 34%), radial-gradient(circle at 80% 14%, rgba(245,228,160,0.07), transparent 27%);
          }
          .home-page-premium .hero-container { padding-top: calc(var(--site-nav-offset, 98px) + 10px); padding-bottom: 36px; }
          .home-page-premium .hero-right { width: 100%; max-width: none; justify-self: stretch; }
          .home-page-premium .app-launcher-shell { padding: 0.88rem; }
          .home-page-premium .app-launcher-topbar { margin-bottom: 0.9rem; }
          .home-page-premium .app-launcher-card { min-height: 114px; }
        }
        @media (max-width: 480px) {
          .home-page-premium .explore-app-section { padding-top: 3.4rem !important; padding-bottom: 3.7rem !important; }
          .home-page-premium .app-launcher-shell { padding: 0.78rem; }
          .home-page-premium .app-launcher-card { min-height: 108px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .app-launcher-card,
          .app-icon-wrap,
          .home-page-premium .hero-container,
          .home-page-premium .hero-frame-wrap,
          .home-page-premium .hero-parallax-bg,
          .home-page-premium .hero-gold-glow,
          .home-page-premium .hero-blue-glow,
          .home-page-premium .hero-right,
          .home-page-premium .home-premium-hero::before,
          .home-page-premium .hero-frame-wrap::before,
          .home-page-premium .explore-app-section .app-launcher-grid > div {
            transition: none !important;
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
            filter: none !important;
          }
        }

        /* Extra small mobile — 320px fix */
        @media (max-width: 360px) {
          .hero-container { padding-top: calc(var(--site-nav-offset, 98px) + 4px); padding-bottom: 50px; }
          .hero-inner { gap: 0.75rem; padding-left: 0.55rem !important; padding-right: 0.55rem !important; }
          .hero-title span { font-size: clamp(2rem, 13.5vw, 3.8rem) !important; }
          .app-launcher-grid { gap: 0.44rem; }
          .app-launcher-card { min-height: 108px; padding-left: 0.18rem; padding-right: 0.18rem; }
          .app-icon-wrap { width: 42px; height: 42px; }
          .app-label { font-size: 0.69rem; }
          .hero-portrait { height: 220px; }
        }
      `}</style>
    </div>
  );
}
