import { useState } from "react";
import { Facebook, Instagram, Youtube, Mail, Feather, ArrowRight, BookOpen, PenLine, Images, Mic2, Newspaper, UserRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { preloadRoute } from "@/lib/routePreloader";

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/MahbubSardarSabuj", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/mahbub_sardar_sabuj", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com/@MahbubSardarSabuj", label: "YouTube" },
  { icon: Mail, href: "mailto:lekhokmahbubsardarsabuj@gmail.com", label: "Email" },
];

const quickLinks = [
  { label: "পরিচিতি", href: "/about", icon: UserRound },
  { label: "লেখালেখি ও বই", href: "/writings", icon: BookOpen },
  { label: "আমিও লিখবো বাস্তবতা", href: "/amio-likhbo-bastobota", icon: PenLine },
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

  if (isAmioLikhboPage) return null;

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
          message: "নতুন সাবস্ক্রাইবার: " + email.trim(),
        }),
      });
    } catch {
      // Keep subscription UI optimistic.
    } finally {
      setSubscribed(true);
      setEmail("");
      setSubscribing(false);
    }
  };

  const renderLink = (link: { label: string; href: string; icon?: React.ComponentType<{ size?: number }> }) => {
    const Icon = link.icon;
    const active = location === link.href;
    return (
      <Link key={link.href + link.label} href={link.href}>
        <span className={`clean-footer__link ${active ? "active" : ""}`} onPointerDown={() => warmRoute(link.href)} onTouchStart={() => warmRoute(link.href)} onMouseEnter={() => warmRoute(link.href)} onFocus={() => warmRoute(link.href)}>
          {Icon && <Icon size={15} />} {link.label}
        </span>
      </Link>
    );
  };

  return (
    <footer className="clean-footer">
      <div className="clean-footer__inner footer-grid">
        <section className="clean-footer__brand">
          <div className="clean-footer__brand-row">
            <span className="clean-footer__mark"><Feather size={20} /></span>
            <div>
              <h2>মাহবুব সরদার সবুজ</h2>
              <p>লেখক ও কবি</p>
            </div>
          </div>
          <p className="clean-footer__desc">ভালোবাসা, বিচ্ছেদ, জীবনসংগ্রাম ও মানবিক অনুভূতিকে সহজ অথচ আবেগঘন ভাষায় প্রকাশের একটি পাঠকবান্ধব সাহিত্যভুবন।</p>
          <form className="clean-footer__subscribe" onSubmit={handleSubscribe}>
            <label htmlFor="footer-email">নতুন লেখার আপডেট পান</label>
            {subscribed ? (
              <div className="clean-footer__success">সাবস্ক্রাইব সম্পন্ন হয়েছে।</div>
            ) : (
              <div className="clean-footer__form-row">
                <input id="footer-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="আপনার ইমেইল" />
                <button type="submit" disabled={subscribing} aria-label="সাবস্ক্রাইব করুন"><ArrowRight size={17} /></button>
              </div>
            )}
          </form>
        </section>

        <section><h3>দ্রুত লিংক</h3><div className="clean-footer__links">{quickLinks.map(renderLink)}</div></section>
        <section><h3>সংগ্রহ</h3><div className="clean-footer__links">{collectionLinks.map(renderLink)}</div></section>
        <section><h3>তথ্য</h3><div className="clean-footer__links">{legalLinks.map(renderLink)}</div></section>
        <section><h3>সামাজিক মাধ্যম</h3><div className="clean-footer__socials">{socialLinks.map((social) => { const Icon = social.icon; return <a key={social.label} href={social.href} target={social.href.startsWith("mailto:") ? undefined : "_blank"} rel={social.href.startsWith("mailto:") ? undefined : "noopener noreferrer"} aria-label={social.label}><Icon size={18} /></a>; })}</div></section>
      </div>
      <div className="clean-footer__bottom">© {new Date().getFullYear()} মাহবুব সরদার সবুজ। সকল অধিকার সংরক্ষিত।</div>
    </footer>
  );
}
