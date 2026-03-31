/**
 * Footer — Premium Edition
 * Design: Literary Avant-Garde | Deep Navy + Rich Gold
 * Features: Newsletter UI, animated social icons, hover effects, glassmorphism
 */
import { useState } from "react";
import { Facebook, Instagram, Youtube, Mail, Feather, ArrowRight, BookOpen, PenLine, Images, Mic2, Newspaper, UserRound, Heart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/MahbubSardarSabuj", label: "Facebook", color: "#1877F2" },
  { icon: Instagram, href: "https://www.instagram.com/mahbub_sardar_sabuj", label: "Instagram", color: "#E1306C" },
  { icon: Youtube, href: "https://youtube.com/@mahbubsardarsabuj", label: "YouTube", color: "#FF0000" },
  { icon: Mail, href: "mailto:lekhokmahbubsardarsabuj@gmail.com", label: "Email", color: "#C9A84C" },
];

const quickLinks = [
  { label: "পরিচিতি", href: "/about", icon: UserRound },
  { label: "বই ও ই-বুক", href: "/ebooks", icon: BookOpen },
  { label: "লেখালেখি", href: "/writings", icon: PenLine },
  { label: "আবৃত্তি", href: "/facebook-recitations", icon: Mic2 },
  { label: "গ্যালারি", href: "/gallery", icon: Images },
  { label: "সংবাদ", href: "/news", icon: Newspaper },
];

const legalLinks = [
  { label: "পরিচিতি পেজ", href: "/about" },
  { label: "যোগাযোগ", href: "/contact" },
  { label: "প্রাইভেসি পলিসি", href: "/privacy-policy" },
  { label: "শর্তাবলি", href: "/terms" },
];

export default function Footer() {
  const [location] = useLocation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
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
          gridTemplateColumns: "1.8fr 1fr 1fr 1.2fr",
          gap: "3rem",
          marginBottom: "4rem",
        }} className="footer-grid">

          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))",
                border: "1px solid rgba(201,168,76,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(201,168,76,0.15)",
              }}>
                <Feather size={18} color="#C9A84C" />
              </div>
              <div>
                <div style={{
                  fontFamily: "'Tiro Bangla', serif",
                  fontSize: "1.1rem", fontWeight: 700,
                  background: "linear-gradient(90deg, #E8C97A, #C9A84C)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>মাহবুব সরদার সবুজ</div>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.6rem", letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "rgba(201,168,76,0.5)", marginTop: 2,
                }}>লেখক ও কবি</div>
              </div>
            </div>

            <p style={{
              fontFamily: "'Noto Sans Bengali', sans-serif",
              color: "rgba(250,246,239,0.45)",
              fontSize: "0.875rem", lineHeight: 1.9,
              margin: "0 0 2rem",
            }}>
              বাংলা সাহিত্যের একজন নিবেদিতপ্রাণ লেখক ও কবি। ভালোবাসা, বিচ্ছেদ, জীবনসংগ্রাম ও মানবিক অনুভূতিকে সহজ অথচ আবেগঘন ভাষায় প্রকাশ করেন।
            </p>

            {/* Newsletter */}
            <div style={{
              background: "rgba(201,168,76,0.04)",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: 12, padding: "1.25rem",
            }}>
              <div style={{
                fontFamily: "'Noto Sans Bengali', sans-serif",
                fontSize: "0.8rem", fontWeight: 600,
                color: "#C9A84C", marginBottom: "0.75rem",
              }}>নতুন লেখার আপডেট পান</div>
              {subscribed ? (
                <div style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  fontSize: "0.85rem", color: "#4ade80",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span>✓</span> সাবস্ক্রাইব সম্পন্ন হয়েছে!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 8 }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="আপনার ইমেইল"
                    style={{
                      flex: 1, padding: "9px 14px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      borderRadius: 6, color: "#FAF6EF",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.8rem", outline: "none",
                    }}
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "9px 14px",
                      background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                      border: "none", borderRadius: 6,
                      color: "#060E1A", cursor: "pointer",
                      display: "flex", alignItems: "center",
                    }}
                  >
                    <ArrowRight size={16} />
                  </motion.button>
                </form>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.65rem", letterSpacing: "0.25em",
              textTransform: "uppercase", color: "#C9A84C",
              marginBottom: "1.5rem",
            }}>দ্রুত লিংক</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {quickLinks.map((link) => {
                const Icon = link.icon;
                const active = location === link.href;
                return (
                  <Link key={link.href + link.label} href={link.href}>
                    <motion.span
                      whileHover={{ x: 6, color: "#C9A84C" }}
                      style={{
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        color: active ? "#C9A84C" : "rgba(250,246,239,0.5)",
                        textDecoration: "none",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "6px 0",
                        transition: "color 0.2s",
                      }}
                    >
                      <Icon size={13} color={active ? "#C9A84C" : "rgba(201,168,76,0.35)"} />
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
              fontFamily: "'Space Grotesk', sans-serif",
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
                      whileHover={{ x: 6, color: "#C9A84C" }}
                      style={{
                        fontFamily: "'Noto Sans Bengali', sans-serif",
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
              fontFamily: "'Space Grotesk', sans-serif",
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
                      e.currentTarget.style.background = s.color + "22";
                      e.currentTarget.style.borderColor = s.color + "66";
                      e.currentTarget.style.color = s.color;
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
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.6rem", letterSpacing: "0.15em",
                textTransform: "uppercase", color: "rgba(201,168,76,0.5)",
                marginBottom: "0.5rem",
              }}>ইমেইল</div>
              <a
                href="mailto:lekhokmahbubsardarsabuj@gmail.com"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
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
            fontFamily: "'Noto Sans Bengali', sans-serif",
            color: "rgba(250,246,239,0.3)",
            fontSize: "0.8rem",
            margin: 0,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            © ২০২৬ মাহবুব সরদার সবুজ। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p style={{
            fontFamily: "'Noto Sans Bengali', sans-serif",
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
