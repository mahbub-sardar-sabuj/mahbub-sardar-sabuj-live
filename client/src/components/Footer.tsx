/**
 * Footer — Premium Edition
 * Design: Literary Avant-Garde | Deep Navy + Rich Gold
 * Features: Newsletter UI, animated social icons, hover effects, glassmorphism
 */
import { useState } from "react";
import { Facebook, Instagram, Youtube, Mail, Feather, ArrowRight, BookOpen, PenLine, Images, Mic2, Newspaper, UserRound, Heart, MailOpen, Phone, CreditCard } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { preloadRoute } from "@/lib/routePreloader";

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/MahbubSardarSabuj", label: "Facebook", color: "#1877F2" },
  { icon: Instagram, href: "https://www.instagram.com/mahbub_sardar_sabuj", label: "Instagram", color: "#E1306C" },
  { icon: Youtube, href: "https://youtube.com/@MahbubSardarSabuj", label: "YouTube", color: "#FF0000" },
  { icon: Mail, href: "mailto:lekhokmahbubsardarsabuj@gmail.com", label: "Email", color: "#C9A84C" },
];

const quickLinks = [
  { label: "পরিচিতি", href: "/about", icon: UserRound },
  { label: "লেখালেখি ও বই", href: "/writings", icon: BookOpen },
  { label: "আমিও লিখবো বাস্তবতা", href: "/amio-likhbo-bastobota", icon: PenLine },

  { label: "আবৃত্তি", href: "/facebook-recitations", icon: Mic2 },
  { label: "গ্যালারি", href: "/gallery", icon: Images },
  { label: "সংবাদ", href: "/news", icon: Newspaper },
  { label: "টেম্প ইমেইল", href: "/temp-email", icon: MailOpen },
  { label: "টেম্প নম্বর", href: "/temp-number", icon: Phone },
  { label: "টেম্প কার্ড", href: "/temp-card", icon: CreditCard },
];

const legalLinks = [
  { label: "পরিচিতি পেজ", href: "/about" },
  { label: "যোগাযোগ", href: "/contact" },
  { label: "প্রাইভেসি পলিসি", href: "/privacy-policy" },
  { label: "শর্তাবলি", href: "/terms" },
];

const collectionLinks = [
  { label: "বাংলা কবিতা", href: "/bangla-kobita" },
  { label: "ভালোবাসার কবিতা", href: "/valobashar-kobita" },
  { label: "কষ্টের কবিতা", href: "/koster-kobita" },
  { label: "বাংলা স্ট্যাটাস", href: "/bangla-status" },
  { label: "বাংলা উক্তি", href: "/bangla-quotes" },
  { label: "বাংলা ই-বুক", href: "/bangla-ebook" },
];

export default function Footer() {
  const [location] = useLocation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const isAmioLikhboPage = location.startsWith("/amio-likhbo-bastobota");
  const warmRoute = (href: string) => preloadRoute(href);

  if (isAmioLikhboPage) {
    return null;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribing) return;
    setSubscribing(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter Subscriber",
          email: email.trim(),
          subject: "নিউজলেটার সাবস্ক্রিপশন",
          message: "নতুন সাবস্ক্রাইবার: " + email.trim() + " — mahbubsardarsabuj.com ওয়েবসাইট থেকে নিউজলেটার সাবস্ক্রাইব করেছেন।",
        }),
      });
    } catch {
      // Silent fail — show success regardless
    } finally {
      setSubscribed(true);
      setEmail("");
      setSubscribing(false);
    }
  };

  return (
    <footer style={{
      background: "linear-gradient(180deg, #060E1A 0%, #0A1628 100%)",
      borderTop: "1px solid rgba(201,168,76,0.12)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(201,168,76,0.04) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        pointerEvents: "none",
      }} />
      {/* Top gold glow */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "60%", height: 1,
        background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "5rem 2rem 2rem", position: "relative", zIndex: 1 }}>

        {/* ── MAIN GRID ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isAmioLikhboPage ? "1.8fr 1fr" : "1fr 1fr 1.2fr",
          gap: "3rem",
          marginBottom: "4rem",
        }} className="footer-grid">

          {/* Brand column removed */}
          {/* Quick links removed */}

          {!isAmioLikhboPage && (
            <>
              {/* SEO collection links */}
              <div>
                <div style={{
                  fontFamily: "'AdorshoLipi', sans-serif",
                  fontSize: "0.65rem", letterSpacing: "0.25em",
                  textTransform: "uppercase", color: "#C9A84C",
                  marginBottom: "1.5rem",
                }}>জনপ্রিয় সংগ্রহ</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {collectionLinks.map((link) => {
                    const active = location === link.href;
                    return (
                      <Link key={link.href} href={link.href}>
                        <motion.span
                          onPointerDown={() => warmRoute(link.href)}
                          onTouchStart={() => warmRoute(link.href)}
                          onFocus={() => warmRoute(link.href)}
                          onMouseEnter={() => warmRoute(link.href)}
                          whileHover={{ x: 6, color: "#C9A84C" }}
                          style={{
                            fontFamily: "'AdorshoLipi', sans-serif",
                            color: active ? "#C9A84C" : "rgba(250,246,239,0.5)",
                            textDecoration: "none",
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "6px 0",
                            transition: "color 0.2s",
                          }}
                        >
                          <span style={{ color: active ? "#C9A84C" : "rgba(201,168,76,0.3)", fontSize: "0.7rem" }}>◆</span>
                          {link.label}
                        </motion.span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Legal links */}
              <div>
                <div style={{
                  fontFamily: "'AdorshoLipi', sans-serif",
                  fontSize: "0.65rem", letterSpacing: "0.25em",
                  textTransform: "uppercase", color: "#C9A84C",
                  marginBottom: "1.5rem",
                }}>তথ্য ও নীতিমালা</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {legalLinks.map((link) => {
                    const active = location === link.href;
                    return (
                      <Link key={link.href} href={link.href}>
                        <motion.span
                          onPointerDown={() => warmRoute(link.href)}
                          onTouchStart={() => warmRoute(link.href)}
                          onFocus={() => warmRoute(link.href)}
                          onMouseEnter={() => warmRoute(link.href)}
                          whileHover={{ x: 6, color: "#C9A84C" }}
                          style={{
                            fontFamily: "'AdorshoLipi', sans-serif",
                            color: active ? "#C9A84C" : "rgba(250,246,239,0.5)",
                            textDecoration: "none",
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "6px 0",
                            transition: "color 0.2s",
                          }}
                        >
                          <span style={{ color: active ? "#C9A84C" : "rgba(201,168,76,0.3)", fontSize: "0.7rem" }}>◆</span>
                          {link.label}
                        </motion.span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Social & contact */}
              <div>
                <div style={{
                  fontFamily: "'AdorshoLipi', sans-serif",
                  fontSize: "0.65rem", letterSpacing: "0.25em",
                  textTransform: "uppercase", color: "#C9A84C",
                  marginBottom: "1.5rem",
                }}>সোশ্যাল মিডিয়া</div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1.5rem" }}>
                  {socialLinks.map((s) => {
                    const Icon = s.icon;
                    return (
                      <motion.a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.label}
                        whileHover={{ scale: 1.15, y: -3 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: 44, height: 44, borderRadius: 12,
                          background: "rgba(201,168,76,0.06)",
                          border: "1px solid rgba(201,168,76,0.2)",
                          color: "rgba(250,246,239,0.6)",
                          textDecoration: "none",
                          transition: "all 0.3s",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = s.color;
                          e.currentTarget.style.borderColor = s.color;
                          e.currentTarget.style.color = "#fff";
                          e.currentTarget.style.boxShadow = `0 8px 24px ${s.color}33`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(201,168,76,0.06)";
                          e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)";
                          e.currentTarget.style.color = "rgba(250,246,239,0.6)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                        }}
                      >
                        <Icon size={18} />
                      </motion.a>
                    );
                  })}
                </div>

                <div style={{
                  background: "rgba(201,168,76,0.04)",
                  border: "1px solid rgba(201,168,76,0.1)",
                  borderRadius: 10, padding: "1rem",
                }}>
                  <div style={{
                    fontFamily: "'AdorshoLipi', sans-serif",
                    fontSize: "0.6rem", letterSpacing: "0.15em",
                    textTransform: "uppercase", color: "rgba(201,168,76,0.5)",
                    marginBottom: "0.5rem",
                  }}>ইমেইল</div>
                  <a
                    href="mailto:lekhokmahbubsardarsabuj@gmail.com"
                    style={{
                      fontFamily: "'AdorshoLipi', sans-serif",
                      color: "rgba(250,246,239,0.5)",
                      fontSize: "0.75rem",
                      textDecoration: "none",
                      wordBreak: "break-all",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#C9A84C"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(250,246,239,0.5)"}
                  >
                    lekhokmahbubsardarsabuj@gmail.com
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── BOTTOM BAR ── */}
        <div style={{
          borderTop: "1px solid rgba(201,168,76,0.08)",
          paddingTop: "2rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}>
          <p style={{
            fontFamily: "'AdorshoLipi', sans-serif",
            color: "rgba(250,246,239,0.3)",
            fontSize: "0.8rem",
            margin: 0,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            © ২০২৬ মাহবুব সরদার সবুজ। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p style={{
            fontFamily: "'AdorshoLipi', sans-serif",
            color: "rgba(250,246,239,0.25)",
            fontSize: "0.8rem",
            margin: 0,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            তৈরি করা হয়েছে <Heart size={12} color="rgba(201,168,76,0.4)" style={{ margin: "0 2px" }} /> দিয়ে — কুমিল্লা, বাংলাদেশ
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
