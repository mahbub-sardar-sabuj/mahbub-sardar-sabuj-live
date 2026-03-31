/**
 * Design: Literary Avant-Garde
 * Footer: Dark navy with gold accents, social links, legal information
 */
import { Facebook, Instagram, Youtube, Mail } from "lucide-react";
import { Link, useLocation } from "wouter";

const socialLinks = [
  { icon: <Facebook size={18} />, href: "https://facebook.com/MahbubSardarSabuj", label: "Facebook Page" },
  { icon: <Instagram size={18} />, href: "https://www.instagram.com/mahbub_sardar_sabuj", label: "Instagram" },
  { icon: <Youtube size={18} />, href: "https://youtube.com/@mahbubsardarsabuj", label: "YouTube" },
  { icon: <Mail size={18} />, href: "mailto:lekhokmahbubsardarsabuj@gmail.com", label: "Email" },
];

const quickLinks = [
  { label: "পরিচিতি", href: "/about", type: "page" },
  { label: "বই", href: "/ebooks", type: "page" },
  { label: "ই-বুক", href: "/ebooks", type: "page" },
  { label: "লেখালেখি", href: "/writings", type: "page" },
  { label: "আবৃত্তি", href: "/facebook-recitations", type: "page" },
  { label: "গ্যালারি", href: "/gallery", type: "page" },
  { label: "যোগাযোগ", href: "/contact", type: "page" },
];

const legalLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export default function Footer() {
  const [location] = useLocation();

  return (
    <footer
      style={{
        background: "#0D1B2A",
        borderTop: "1px solid rgba(212,168,67,0.2)",
        padding: "3rem 0 1.5rem",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "'Tiro Bangla', serif",
                color: "#D4A843",
                fontSize: "1.3rem",
                marginBottom: "0.75rem",
              }}
            >
              মাহবুব সরদার সবুজ
            </h3>
            <p
              style={{
                fontFamily: "'Noto Sans Bengali', sans-serif",
                color: "rgba(253,246,236,0.6)",
                fontSize: "0.875rem",
                lineHeight: 1.8,
              }}
            >
              বাংলা সাহিত্যের একজন আবেগী লেখক। পাঠকের হৃদয়ের কথা তুলে ধরাই আমার লেখার উদ্দেশ্য।
            </p>
          </div>

          <div>
            <h4
              style={{
                fontFamily: "'Noto Sans Bengali', sans-serif",
                color: "#D4A843",
                fontSize: "0.95rem",
                fontWeight: 600,
                marginBottom: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              দ্রুত লিংক
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {quickLinks.map((link) => (
                <Link key={link.href + link.label} href={link.href}>
                  <span
                    style={{
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      color: location === link.href ? "#D4A843" : "rgba(253,246,236,0.6)",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      transition: "color 0.3s",
                      cursor: "pointer",
                      display: "inline-block",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#D4A843")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = location === link.href ? "#D4A843" : "rgba(253,246,236,0.6)")
                    }
                  >
                    → {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4
              style={{
                fontFamily: "'Noto Sans Bengali', sans-serif",
                color: "#D4A843",
                fontSize: "0.95rem",
                fontWeight: 600,
                marginBottom: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              তথ্য ও নীতিমালা
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    style={{
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      color: location === link.href ? "#D4A843" : "rgba(253,246,236,0.6)",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      transition: "color 0.3s",
                      cursor: "pointer",
                      display: "inline-block",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#D4A843")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = location === link.href ? "#D4A843" : "rgba(253,246,236,0.6)")
                    }
                  >
                    → {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4
              style={{
                fontFamily: "'Noto Sans Bengali', sans-serif",
                color: "#D4A843",
                fontSize: "0.95rem",
                fontWeight: 600,
                marginBottom: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              সোশ্যাল মিডিয়া
            </h4>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "1px solid rgba(212,168,67,0.3)",
                    color: "rgba(253,246,236,0.7)",
                    textDecoration: "none",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#D4A843";
                    e.currentTarget.style.color = "#0D1B2A";
                    e.currentTarget.style.borderColor = "#D4A843";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(253,246,236,0.7)";
                    e.currentTarget.style.borderColor = "rgba(212,168,67,0.3)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <p
              style={{
                fontFamily: "'Noto Sans Bengali', sans-serif",
                color: "rgba(253,246,236,0.5)",
                fontSize: "0.8rem",
                marginTop: "1rem",
              }}
            >
              ইমেইল: lekhokmahbubsardarsabuj@gmail.com
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(212,168,67,0.1)",
            paddingTop: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <p
            style={{
              fontFamily: "'Noto Sans Bengali', sans-serif",
              color: "rgba(253,246,236,0.4)",
              fontSize: "0.8rem",
            }}
          >
            © ২০২৬ মাহবুব সরদার সবুজ। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p
            style={{
              fontFamily: "'Noto Sans Bengali', sans-serif",
              color: "rgba(253,246,236,0.4)",
              fontSize: "0.8rem",
            }}
          >
            কুমিল্লা, বাংলাদেশ
          </p>
        </div>
      </div>
    </footer>
  );
}
