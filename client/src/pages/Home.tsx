/*
 * Home Page — মাহবুব সরদার সবুজ
 * Design system: Ink & Gold
 * Purpose: a calm, editorial home that separates literary work from useful tools.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CreditCard,
  Download,
  Feather,
  Images,
  Mail,
  MailOpen,
  Mic2,
  Music,
  Newspaper,
  Palette,
  Phone,
  Smartphone,
  Sparkles,
  UserRound,
  Video,
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";
import RulesSection from "@/components/RulesSection";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PROFILE_IMAGE = "/images/og-home-suit.jpg";
const PROFILE_SCHEMA_IMAGE = "https://www.mahbubsardarsabuj.com/images/og-home-suit.jpg";

const sections = [
  { group: "literary", label: "পরিচিতি", subtitle: "জীবন, লেখা ও লেখকের পথচলা", href: "/about", icon: UserRound },
  { group: "literary", label: "লেখালেখি ও বই", subtitle: "কবিতা, গদ্য ও প্রকাশিত বই", href: "/writings", icon: BookOpen },
  { group: "literary", label: "আমিও লিখবো বাস্তবতা", subtitle: "বাস্তবতা লেখার সৃজনশীল পরিসর", href: "/amio-likhbo-bastobota", icon: Feather },
  { group: "literary", label: "ডিজাইন ফরম্যাট", subtitle: "লেখাকে দিন সুন্দর ভিজ্যুয়াল রূপ", href: "/editor", icon: Palette },
  { group: "literary", label: "গ্যালারি", subtitle: "ছবি, মুহূর্ত ও স্মৃতির অ্যালবাম", href: "/gallery", icon: Images },
  { group: "literary", label: "সরদার সংবাদ", subtitle: "আপডেট, প্রকাশনা ও সাম্প্রতিক খবর", href: "/news", icon: Newspaper },
  { group: "literary", label: "যোগাযোগ", subtitle: "বার্তা, ইমেইল ও সংযোগের পথ", href: "/contact", icon: Mail },
  { group: "tools", label: "টেম্প ইমেইল", subtitle: "বিনামূল্যে ডিসপোজেবল ইমেইল তৈরি করুন", href: "/temp-email", icon: MailOpen },
  { group: "tools", label: "টেম্প নম্বর", subtitle: "বিনামূল্যে ডিসপোজেবল ফোন নম্বর", href: "/temp-number", icon: Phone },
  { group: "tools", label: "টেম্প কার্ড", subtitle: "টেস্টিংয়ের জন্য ভার্চুয়াল কার্ড", href: "/temp-card", icon: CreditCard },
  { group: "tools", label: "ইমেজ আপস্কেলার", subtitle: "এআই দিয়ে ছবির কোয়ালিটি বাড়ান", href: "/image-upscaler", icon: Sparkles },
  { group: "tools", label: "ভিডিও আপস্কেলার", subtitle: "ঝাপসা ভিডিও 4K/8K-এ উন্নত করুন", href: "/video-upscaler", icon: Video },
  { group: "tools", label: "অডিও এডিটর", subtitle: "ট্রিম, ফেড, স্পিড, রিভার্স ও নয়েজ রিডাকশন", href: "/audio-editor", icon: Music },
  { group: "tools", label: "আবৃত্তি টুল", subtitle: "লেখা দিন, AI মানুষের কণ্ঠে আবৃত্তি করবে", href: "/text-to-speech", icon: Mic2 },
] as const;

const literarySections = sections.filter((section) => section.group === "literary");
const toolSections = sections.filter((section) => section.group === "tools");

function DirectoryGrid({
  items,
  delayOffset = 0,
}: {
  items: readonly (typeof sections)[number][];
  delayOffset?: number;
}) {
  return (
    <div className="home-directory-grid">
      {items.map((section, index) => {
        const Icon = section.icon;
        return (
          <motion.div
            key={section.href}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.42, delay: delayOffset + index * 0.045 }}
          >
            <Link href={section.href} className="home-directory-link" aria-label={`${section.label} খুলুন`}>
              <motion.div className="home-directory-card" whileHover={{ y: -5 }} whileTap={{ scale: 0.985 }}>
                <span className="home-directory-icon"><Icon size={22} strokeWidth={1.8} /></span>
                <span className="home-directory-copy">
                  <span className="home-directory-label">{section.label}</span>
                  <span className="home-directory-subtitle">{section.subtitle}</span>
                </span>
                <ArrowUpRight className="home-directory-arrow" size={17} strokeWidth={1.8} />
              </motion.div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [pwaInstalling, setPwaInstalling] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setPwaInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) setPwaInstalled(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('অ্যাপ ইনস্টল করতে:\n\nAndroid: Chrome মেনু > "অ্যাপ ইনস্টল করুন"\niPhone: Safari Share > "Add to Home Screen"');
      return;
    }

    setPwaInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setPwaInstalled(true);
      setDeferredPrompt(null);
    } finally {
      setPwaInstalling(false);
    }
  };

  const installTitle = pwaInstalled ? "অ্যাপ ইনস্টল হয়েছে" : pwaInstalling ? "ইনস্টল হচ্ছে..." : "অ্যাপ হিসেবে রাখুন";
  const installCopy = pwaInstalled ? "হোম স্ক্রিন থেকে সরাসরি খুলুন" : "ওয়েবসাইটটি ফোনে দ্রুত খুলুন";

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [{
      "@type": "Person",
      name: "Mahbub Sardar Sabuj",
      alternateName: "মাহবুব সরদার সবুজ",
      url: "https://www.mahbubsardarsabuj.com/",
      image: PROFILE_SCHEMA_IMAGE,
      jobTitle: "লেখক ও কবি",
      description: "বাংলা সাহিত্যের লেখক ও কবি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট।",
      sameAs: [
        "https://facebook.com/MahbubSardarSabuj",
        "https://www.instagram.com/mahbub_sardar_sabuj",
        "https://youtube.com/@MahbubSardarSabuj",
      ],
    }],
  };

  return (
    <div className="home-page">
      <Seo
        title="মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj - লেখক ও কবি"
        description="মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট। লেখকের পরিচিতি, বাংলা কবিতা, লেখালেখি, বই, ই-বুক, গ্যালারি ও সরদার সংবাদ একসাথে পড়ুন।"
        path="/"
        keywords="মাহবুব সরদার সবুজ, Mahbub Sardar Sabuj, বাংলা কবি, বাংলা লেখক, বাংলা কবিতা, ভালোবাসার কবিতা, বিচ্ছেদের কবিতা, বাংলা ই-বুক, দুঃখবিলাস, স্মৃতির বসন্তে তুমি, চাঁদফুল, সময়ের গহ্বরে, বাংলা সাহিত্য, বাংলাদেশি লেখক, mahbub sardar sabuj kobita, bangla kobita, bangla sahitya, bangladeshi poet, bangla ebook free, সরদার সংবাদ"
        jsonLd={homeJsonLd}
      />
      <Navbar />

      <main>
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero-grid" />
          <div className="home-hero-aura home-hero-aura-gold" />
          <div className="home-hero-aura home-hero-aura-blue" />
          <div className="home-hero-line" />

          <div className="home-hero-inner">
            <motion.div
              className="home-hero-copy"
              initial={{ opacity: 0, x: -26 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="home-eyebrow"><span /><span>শব্দ · স্মৃতি · সৃজন</span></div>
              <h1 id="home-title" className="home-hero-title">
                মাহবুব <em>সরদার সবুজ</em>
              </h1>
              <p className="home-hero-intro">
                বাংলা ভাষার অনুভব, মানুষের গল্প এবং শব্দের গভীরতা নিয়ে এক নিবেদিত সাহিত্যযাত্রা।
              </p>

              <div className="home-hero-actions">
                <Link href="/writings" className="home-action home-action-primary"><BookOpen size={18} /> লেখালেখি পড়ুন <ArrowRight size={17} /></Link>
                <Link href="/about" className="home-action home-action-secondary"><UserRound size={17} /> পরিচিতি</Link>
              </div>

              <div className="home-hero-index" aria-label="ওয়েবসাইটের প্রধান বিষয়সমূহ">
                <span><b>লেখা</b><small>কবিতা ও গদ্য</small></span>
                <span><b>স্মৃতি</b><small>ছবি ও মুহূর্ত</small></span>
                <span><b>সুবিধা</b><small>সৃজনশীল টুল</small></span>
              </div>
            </motion.div>

            <motion.div
              className="home-portrait-stage"
              initial={{ opacity: 0, x: 30, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.82, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="home-portrait-corner home-portrait-corner-top" />
              <div className="home-portrait-corner home-portrait-corner-bottom" />
              <div className="home-portrait-frame">
                <img
                  src={PROFILE_IMAGE}
                  alt="কোট পরা মাহবুব সরদার সবুজের প্রতিকৃতি"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              <div className="home-portrait-caption">
                <span>লেখক ও কবি</span>
                <strong>মাহবুব সরদার সবুজ</strong>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="home-directory" id="explore" aria-labelledby="directory-title">
          <div className="home-directory-pattern" />
          <div className="home-directory-inner">
            <motion.header
              className="home-directory-header"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <div className="home-section-kicker"><span /> আপনার জন্য সাজানো <span /></div>
              <h2 id="directory-title">যা খুঁজছেন, <em>এক জায়গায়</em></h2>
              <p>সাহিত্য, স্মৃতি, খবর এবং প্রয়োজনীয় ডিজিটাল সুবিধা—পরিষ্কার বিভাগে সাজানো প্রতিটি ঠিকানা।</p>
            </motion.header>

            <section className="home-directory-group" aria-labelledby="literary-directory-title">
              <div className="home-directory-group-head">
                <div>
                  <span className="home-directory-group-number">০১</span>
                  <h3 id="literary-directory-title">সাহিত্য ও পরিচিতি</h3>
                </div>
                <p>লেখক, লেখা, পাঠ এবং স্মৃতির মূল পরিসর</p>
              </div>
              <DirectoryGrid items={literarySections} />
            </section>

            <section className="home-directory-group home-tools-group" aria-labelledby="tools-directory-title">
              <div className="home-directory-group-head">
                <div>
                  <span className="home-directory-group-number">০২</span>
                  <h3 id="tools-directory-title">ডিজিটাল কর্মশালা</h3>
                </div>
                <p>দৈনন্দিন কাজ ও সৃজনশীলতার ব্যবহারিক টুল</p>
              </div>
              <DirectoryGrid items={toolSections} delayOffset={0.06} />
            </section>

            <motion.button
              type="button"
              className={`home-install-card ${pwaInstalled ? "is-installed" : ""}`}
              onClick={handleInstallPWA}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              aria-label="ওয়েবসাইটটি অ্যাপ হিসেবে ইনস্টল করুন"
            >
              <span className="home-install-icon">
                {pwaInstalled ? <Check size={22} /> : pwaInstalling ? <Smartphone size={22} /> : <Download size={22} />}
              </span>
              <span className="home-install-copy"><strong>{installTitle}</strong><small>{installCopy}</small></span>
              <span className="home-install-arrow"><ArrowRight size={20} /></span>
            </motion.button>
          </div>
        </section>

        <section className="home-connection" aria-label="যোগাযোগের আমন্ত্রণ">
          <div className="home-connection-inner">
            <div className="home-connection-mark">“</div>
            <div>
              <p>পাঠকের অনুভবই লেখার সবচেয়ে মূল্যবান প্রাপ্তি।</p>
              <span>আপনার কথা জানাতে পারেন সরাসরি</span>
            </div>
            <Link href="/contact" className="home-connection-link">যোগাযোগ করুন <ArrowUpRight size={17} /></Link>
          </div>
        </section>

        <RulesSection />

        <div className="home-ad-slot">
          <AdSenseAd adSlot={AD_SLOTS.HOME_BANNER} adFormat="auto" fullWidthResponsive={true} />
        </div>
      </main>

      <style>{`
        .home-page {
          min-height: 100vh;
          overflow-x: hidden;
          color: #FAF6EF;
          background:
            radial-gradient(circle at 95% 6%, rgba(201,168,76,0.10), transparent 20%),
            #060E1A;
        }
        .home-hero {
          position: relative;
          min-height: min(800px, 100svh);
          display: grid;
          align-items: center;
          overflow: hidden;
          isolation: isolate;
          padding: calc(var(--site-nav-offset, 98px) + 42px) 1.5rem 74px;
          background:
            linear-gradient(120deg, #050D19 0%, #071527 55%, #08111F 100%);
        }
        .home-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background:
            radial-gradient(circle at 14% 37%, rgba(201,168,76,0.15), transparent 28%),
            radial-gradient(circle at 84% 62%, rgba(39,94,147,0.21), transparent 31%),
            linear-gradient(180deg, rgba(1,6,13,0.18), rgba(1,6,13,0.54));
        }
        .home-hero-grid {
          position: absolute !important;
          z-index: -1 !important;
          inset: 0;
          pointer-events: none;
          opacity: 0.44;
          background-image:
            linear-gradient(rgba(232,201,122,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,201,122,0.045) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: linear-gradient(to bottom, black, transparent 92%);
        }
        .home-hero-aura {
          position: absolute !important;
          z-index: -1 !important;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(2px);
        }
        .home-hero-aura-gold {
          width: min(55vw, 700px);
          aspect-ratio: 1;
          top: -30%;
          right: -9%;
          border: 1px solid rgba(232,201,122,0.18);
          box-shadow: 0 0 0 66px rgba(201,168,76,0.025), 0 0 130px rgba(201,168,76,0.12);
        }
        .home-hero-aura-blue {
          width: min(45vw, 520px);
          aspect-ratio: 1;
          bottom: -36%;
          left: -12%;
          border: 1px solid rgba(83,144,202,0.12);
          box-shadow: 0 0 120px rgba(48,113,177,0.20);
        }
        .home-hero-line {
          position: absolute !important;
          z-index: -1 !important;
          width: min(1160px, 84vw);
          height: 1px;
          left: 50%;
          bottom: 50px;
          transform: translateX(-50%);
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.42), transparent);
          box-shadow: 0 0 22px rgba(201,168,76,0.12);
          pointer-events: none;
        }
        .home-hero-inner {
          position: relative;
          z-index: 1;
          width: min(1180px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(310px, 0.72fr);
          gap: clamp(2.7rem, 8vw, 8rem);
          align-items: center;
        }
        .home-hero-copy { min-width: 0; }
        .home-eyebrow, .home-section-kicker {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #E8C97A;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.71rem;
          line-height: 1;
          letter-spacing: 0.18em;
        }
        .home-eyebrow {
          padding: 8px 13px 8px 10px;
          border: 1px solid rgba(232,201,122,0.26);
          border-radius: 999px;
          background: rgba(201,168,76,0.075);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 30px rgba(0,0,0,0.14);
        }
        .home-eyebrow > span:first-child {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #E8C97A;
          box-shadow: 0 0 0 5px rgba(232,201,122,0.10), 0 0 14px rgba(232,201,122,0.7);
        }
        .home-hero-title {
          max-width: 720px;
          margin: 1.35rem 0 0;
          font-family: 'AdorshoLipi', sans-serif;
          font-weight: 700;
          font-size: clamp(3.3rem, 7.1vw, 7.35rem);
          line-height: 0.98;
          letter-spacing: -0.048em;
          color: #FAF6EF;
          text-shadow: 0 12px 46px rgba(0,0,0,0.5);
        }
        .home-hero-title em {
          display: block;
          margin-top: 0.14em;
          color: transparent;
          font-style: normal;
          background: linear-gradient(110deg, #9E6E1A 0%, #E8C97A 32%, #FFF0B9 50%, #C9A84C 71%, #946215 100%);
          background-clip: text;
          -webkit-background-clip: text;
          filter: drop-shadow(0 9px 20px rgba(201,168,76,0.20));
        }
        .home-hero-intro {
          max-width: 520px;
          margin: 1.5rem 0 0;
          padding-left: 16px;
          border-left: 2px solid rgba(201,168,76,0.58);
          color: rgba(250,246,239,0.68);
          font-family: 'AdorshoLipi', sans-serif;
          font-size: clamp(1rem, 1.9vw, 1.16rem);
          line-height: 1.86;
        }
        .home-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.75rem;
        }
        .home-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 47px;
          padding: 0 17px;
          border-radius: 999px;
          text-decoration: none;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.88rem;
          transition: transform 180ms cubic-bezier(0.23,1,0.32,1), border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
        }
        .home-action:hover { transform: translateY(-2px); }
        .home-action:active { transform: scale(0.97); }
        .home-action-primary {
          color: #101521;
          border: 1px solid #F2D789;
          background: linear-gradient(120deg, #B98A33, #F0D78E 52%, #C69C46);
          box-shadow: 0 14px 34px rgba(0,0,0,0.32), 0 0 25px rgba(201,168,76,0.17);
        }
        .home-action-primary:hover { box-shadow: 0 18px 40px rgba(0,0,0,0.36), 0 0 35px rgba(201,168,76,0.28); }
        .home-action-secondary {
          color: #FAF6EF;
          border: 1px solid rgba(232,201,122,0.32);
          background: rgba(6,14,26,0.34);
        }
        .home-action-secondary:hover { border-color: rgba(232,201,122,0.72); background: rgba(201,168,76,0.10); }
        .home-hero-index {
          display: flex;
          flex-wrap: wrap;
          gap: 0;
          margin-top: 2.3rem;
        }
        .home-hero-index > span {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 118px;
          padding: 0 19px;
          border-left: 1px solid rgba(232,201,122,0.20);
        }
        .home-hero-index > span:first-child { padding-left: 0; border-left: 0; }
        .home-hero-index b { color: #F3DB94; font-family: 'AdorshoLipi', sans-serif; font-size: 0.93rem; }
        .home-hero-index small { color: rgba(250,246,239,0.48); font-family: 'AdorshoLipi', sans-serif; font-size: 0.68rem; }
        .home-portrait-stage {
          position: relative;
          width: min(100%, 388px);
          justify-self: end;
          padding: 12px;
        }
        .home-portrait-stage::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 28px;
          border: 1px solid rgba(232,201,122,0.48);
          background: linear-gradient(145deg, rgba(201,168,76,0.16), rgba(8,22,39,0.06));
          box-shadow: 0 32px 85px rgba(0,0,0,0.54), 0 0 70px rgba(201,168,76,0.10), inset 0 1px 0 rgba(255,255,255,0.18);
        }
        .home-portrait-corner {
          position: absolute;
          z-index: 2;
          width: 47%;
          height: 26%;
          pointer-events: none;
          border-color: rgba(232,201,122,0.28);
        }
        .home-portrait-corner-top { top: -12px; right: -12px; border-top: 1px solid; border-right: 1px solid; border-radius: 0 22px 0 0; }
        .home-portrait-corner-bottom { bottom: -12px; left: -12px; border-bottom: 1px solid; border-left: 1px solid; border-radius: 0 0 0 22px; }
        .home-portrait-frame {
          position: relative;
          z-index: 1;
          aspect-ratio: 4 / 4.7;
          overflow: hidden;
          border: 1px solid rgba(250,246,239,0.12);
          border-radius: 20px;
          background: #0B1726;
        }
        .home-portrait-frame::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(145deg, rgba(201,168,76,0.12), transparent 34%, rgba(3,9,16,0.18));
        }
        .home-portrait-frame img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; filter: contrast(1.05) saturate(0.93); }
        .home-portrait-caption {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          gap: 2px;
          width: calc(100% - 32px);
          margin: -3px auto 0;
          padding: 13px 17px 14px;
          border: 1px solid rgba(232,201,122,0.25);
          border-radius: 0 0 16px 16px;
          background: linear-gradient(150deg, rgba(7,18,31,0.96), rgba(12,29,48,0.95));
          box-shadow: 0 16px 34px rgba(0,0,0,0.25);
        }
        .home-portrait-caption span { color: #DDBB68; font-family: 'AdorshoLipi', sans-serif; font-size: 0.61rem; letter-spacing: 0.14em; }
        .home-portrait-caption strong { color: #FAF6EF; font-family: 'AdorshoLipi', sans-serif; font-size: 0.98rem; line-height: 1.2; }

        .home-directory {
          position: relative;
          overflow: hidden;
          padding: clamp(4.5rem, 9vw, 7.2rem) 1.25rem clamp(4.2rem, 8vw, 6.6rem);
          background:
            radial-gradient(circle at 10% 9%, rgba(201,168,76,0.09), transparent 20%),
            radial-gradient(circle at 93% 65%, rgba(38,92,143,0.12), transparent 26%),
            linear-gradient(180deg, #050D19 0%, #071321 45%, #060E1A 100%);
        }
        .home-directory-pattern {
          position: absolute !important;
          z-index: 0 !important;
          inset: 0;
          opacity: 0.42;
          pointer-events: none;
          background-image: radial-gradient(rgba(232,201,122,0.11) 0.72px, transparent 0.72px);
          background-size: 26px 26px;
          mask-image: linear-gradient(to bottom, black, transparent 80%);
        }
        .home-directory-inner { position: relative; z-index: 1; width: min(1120px, 100%); margin: 0 auto; }
        .home-directory-header { max-width: 710px; margin: 0 auto clamp(3.4rem, 6vw, 4.6rem); text-align: center; }
        .home-section-kicker { gap: 12px; justify-content: center; }
        .home-section-kicker span:not(:nth-child(2)) { width: 48px; height: 1px; background: linear-gradient(90deg, transparent, #C9A84C); }
        .home-section-kicker span:last-child { background: linear-gradient(90deg, #C9A84C, transparent); }
        .home-directory-header h2 {
          margin: 1.1rem 0 0;
          color: #FAF6EF;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: clamp(2.4rem, 5.8vw, 4.45rem);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.12;
        }
        .home-directory-header h2 em { color: #DDBB68; font-style: normal; }
        .home-directory-header p { margin: 1rem auto 0; color: rgba(250,246,239,0.62); font-family: 'AdorshoLipi', sans-serif; font-size: 1rem; line-height: 1.8; }
        .home-directory-group + .home-directory-group { margin-top: clamp(3.4rem, 7vw, 5.4rem); }
        .home-directory-group-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: 1.35rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(232,201,122,0.16);
        }
        .home-directory-group-head > div { display: flex; align-items: center; gap: 12px; }
        .home-directory-group-number { color: #E8C97A; font-family: 'AdorshoLipi', sans-serif; font-size: 0.7rem; letter-spacing: 0.16em; }
        .home-directory-group-head h3 { margin: 0; color: #FAF6EF; font-family: 'AdorshoLipi', sans-serif; font-size: clamp(1.55rem, 3vw, 2.2rem); line-height: 1.15; }
        .home-directory-group-head p { max-width: 330px; margin: 0; color: rgba(250,246,239,0.50); font-family: 'AdorshoLipi', sans-serif; font-size: 0.83rem; line-height: 1.55; text-align: right; }
        .home-directory-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
        .home-directory-link { display: block; height: 100%; text-decoration: none; }
        .home-directory-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-height: 174px;
          height: 100%;
          padding: 1.25rem;
          overflow: hidden;
          border: 1px solid rgba(232,201,122,0.16);
          border-radius: 20px;
          background: linear-gradient(145deg, rgba(19,37,59,0.78), rgba(7,18,31,0.88));
          box-shadow: 0 18px 38px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06);
          transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
        }
        .home-directory-card::before {
          content: "";
          position: absolute;
          top: -48px;
          right: -40px;
          width: 126px;
          height: 126px;
          border: 1px solid rgba(232,201,122,0.08);
          border-radius: 50%;
          box-shadow: 0 0 0 20px rgba(201,168,76,0.018);
        }
        .home-directory-card::after {
          content: "";
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          height: 2px;
          opacity: 0;
          background: linear-gradient(90deg, transparent, #E8C97A, transparent);
          transition: opacity 180ms ease;
        }
        .home-directory-card:hover {
          border-color: rgba(232,201,122,0.55);
          background: linear-gradient(145deg, rgba(201,168,76,0.13), rgba(9,24,40,0.94));
          box-shadow: 0 25px 50px rgba(0,0,0,0.34), 0 0 25px rgba(201,168,76,0.09), inset 0 1px 0 rgba(255,255,255,0.09);
        }
        .home-directory-card:hover::after { opacity: 1; }
        .home-directory-link:focus-visible { outline: none; }
        .home-directory-link:focus-visible .home-directory-card { border-color: #F3DB94; box-shadow: 0 0 0 3px rgba(201,168,76,0.22); }
        .home-directory-icon {
          position: relative;
          z-index: 1;
          display: grid;
          width: 48px;
          height: 48px;
          place-items: center;
          margin-bottom: auto;
          color: #F1D486;
          border: 1px solid rgba(232,201,122,0.32);
          border-radius: 15px;
          background: linear-gradient(145deg, rgba(201,168,76,0.23), rgba(250,246,239,0.05));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 9px 22px rgba(0,0,0,0.2);
        }
        .home-directory-copy { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 5px; margin-top: 1rem; padding-right: 14px; }
        .home-directory-label { color: #FFF8EA; font-family: 'AdorshoLipi', sans-serif; font-size: 1rem; font-weight: 700; line-height: 1.25; }
        .home-directory-subtitle { color: rgba(250,246,239,0.58); font-family: 'AdorshoLipi', sans-serif; font-size: 0.74rem; line-height: 1.42; }
        .home-directory-arrow { position: absolute; z-index: 1; top: 1.25rem; right: 1.15rem; color: rgba(232,201,122,0.48); transition: color 180ms ease, transform 180ms ease; }
        .home-directory-card:hover .home-directory-arrow { color: #F1D486; transform: translate(2px, -2px); }
        .home-tools-group .home-directory-card { background: linear-gradient(145deg, rgba(11,28,47,0.82), rgba(6,15,27,0.92)); }
        .home-tools-group .home-directory-icon { color: #9ED4F5; border-color: rgba(114,175,223,0.30); background: linear-gradient(145deg, rgba(62,126,176,0.24), rgba(250,246,239,0.04)); }
        .home-tools-group .home-directory-card:hover { border-color: rgba(135,191,231,0.54); background: linear-gradient(145deg, rgba(48,112,164,0.20), rgba(7,21,37,0.96)); box-shadow: 0 25px 50px rgba(0,0,0,0.34), 0 0 25px rgba(65,140,196,0.09); }
        .home-tools-group .home-directory-card::after { background: linear-gradient(90deg, transparent, #8BC5E7, transparent); }
        .home-tools-group .home-directory-arrow { color: rgba(139,197,231,0.48); }
        .home-tools-group .home-directory-card:hover .home-directory-arrow { color: #B5E5FF; }
        .home-install-card {
          width: 100%;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1rem;
          margin-top: clamp(3.4rem, 6vw, 5rem);
          padding: 1rem 1.2rem;
          color: #FAF6EF;
          text-align: left;
          cursor: pointer;
          border: 1px solid rgba(232,201,122,0.30);
          border-radius: 18px;
          background: linear-gradient(105deg, rgba(201,168,76,0.14), rgba(12,29,48,0.88) 55%, rgba(201,168,76,0.08));
          box-shadow: 0 22px 50px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.09);
          transition: border-color 180ms ease, box-shadow 180ms ease;
        }
        .home-install-card:hover { border-color: rgba(232,201,122,0.68); box-shadow: 0 28px 56px rgba(0,0,0,0.30), 0 0 26px rgba(201,168,76,0.10); }
        .home-install-card:focus-visible { outline: 3px solid rgba(201,168,76,0.28); outline-offset: 3px; }
        .home-install-card.is-installed { border-color: rgba(96,211,151,0.45); background: linear-gradient(105deg, rgba(70,185,123,0.15), rgba(12,39,38,0.88) 55%, rgba(70,185,123,0.08)); }
        .home-install-icon { display: grid; width: 44px; height: 44px; place-items: center; color: #141926; border-radius: 13px; background: linear-gradient(145deg, #F3DB94, #B8872C); }
        .home-install-card.is-installed .home-install-icon { color: #062316; background: linear-gradient(145deg, #9BE5B7, #4ABD7F); }
        .home-install-copy { display: flex; flex-direction: column; gap: 2px; }
        .home-install-copy strong { font-family: 'AdorshoLipi', sans-serif; font-size: 1.02rem; }
        .home-install-copy small { color: rgba(250,246,239,0.58); font-family: 'AdorshoLipi', sans-serif; font-size: 0.76rem; }
        .home-install-arrow { color: #E8C97A; }

        .home-connection {
          position: relative;
          padding: 0 1.25rem;
          background: #060E1A;
        }
        .home-connection-inner {
          position: relative;
          z-index: 1;
          width: min(1120px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: clamp(1rem, 3vw, 2rem);
          padding: clamp(1.6rem, 4vw, 2.5rem);
          transform: translateY(50%);
          border: 1px solid rgba(232,201,122,0.24);
          border-radius: 22px;
          background: linear-gradient(125deg, rgba(21,40,63,0.98), rgba(7,17,30,0.98));
          box-shadow: 0 28px 70px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .home-connection-mark { color: #DAB663; font-family: Georgia, serif; font-size: 4rem; line-height: 0.7; opacity: 0.7; }
        .home-connection p { margin: 0; color: #FAF6EF; font-family: 'AdorshoLipi', sans-serif; font-size: clamp(1.15rem, 2.4vw, 1.65rem); font-weight: 700; line-height: 1.25; }
        .home-connection span { display: block; margin-top: 0.35rem; color: rgba(250,246,239,0.56); font-family: 'AdorshoLipi', sans-serif; font-size: 0.83rem; }
        .home-connection-link { display: inline-flex; align-items: center; gap: 7px; min-height: 42px; padding: 0 15px; color: #F3DB94; font-family: 'AdorshoLipi', sans-serif; font-size: 0.86rem; text-decoration: none; border: 1px solid rgba(232,201,122,0.35); border-radius: 999px; transition: background 180ms ease, transform 180ms ease; }
        .home-connection-link:hover { transform: translateY(-2px); background: rgba(201,168,76,0.10); }
        .home-ad-slot { max-width: 900px; margin: 0 auto; padding: clamp(7rem, 12vw, 10rem) 1rem 1.5rem; }

        @media (max-width: 940px) {
          .home-hero { min-height: auto; padding-top: calc(var(--site-nav-offset, 88px) + 38px); }
          .home-hero-inner { grid-template-columns: 1fr; gap: 2.2rem; max-width: 640px; text-align: center; }
          .home-portrait-stage { order: -1; justify-self: center; width: min(78vw, 355px); }
          .home-hero-title { margin-left: auto; margin-right: auto; }
          .home-hero-intro { margin-left: auto; margin-right: auto; text-align: left; }
          .home-hero-actions, .home-hero-index { justify-content: center; }
          .home-hero-index > span:first-child { padding-left: 17px; border-left: 1px solid rgba(232,201,122,0.20); }
          .home-directory-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 680px) {
          .home-hero { padding: calc(var(--site-nav-offset, 82px) + 28px) 1rem 54px; }
          .home-portrait-stage { width: min(82vw, 330px); padding: 10px; }
          .home-portrait-stage::before { border-radius: 24px; }
          .home-portrait-frame { border-radius: 17px; }
          .home-portrait-caption { width: calc(100% - 25px); padding: 11px 14px 12px; }
          .home-hero-title { font-size: clamp(2.9rem, 14vw, 4.7rem); }
          .home-hero-intro { margin-top: 1.2rem; font-size: 0.99rem; line-height: 1.78; }
          .home-hero-actions { margin-top: 1.4rem; }
          .home-action { min-height: 43px; padding: 0 14px; font-size: 0.81rem; }
          .home-hero-index { margin-top: 1.7rem; }
          .home-hero-index > span { min-width: auto; padding: 0 13px; }
          .home-directory { padding-left: 1rem; padding-right: 1rem; }
          .home-directory-header { margin-bottom: 2.8rem; }
          .home-directory-group-head { display: block; margin-bottom: 1rem; }
          .home-directory-group-head p { margin-top: 0.55rem; text-align: left; }
          .home-directory-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.72rem; }
          .home-directory-card { min-height: 158px; padding: 1rem; border-radius: 17px; }
          .home-directory-icon { width: 43px; height: 43px; border-radius: 13px; }
          .home-directory-icon svg { width: 20px; height: 20px; }
          .home-directory-label { font-size: 0.88rem; }
          .home-directory-subtitle { font-size: 0.66rem; line-height: 1.35; }
          .home-directory-arrow { top: 1rem; right: 0.92rem; width: 15px; }
          .home-install-card { margin-top: 2.6rem; padding: 0.9rem; border-radius: 16px; }
          .home-install-icon { width: 39px; height: 39px; border-radius: 11px; }
          .home-connection { padding: 0 1rem; }
          .home-connection-inner { grid-template-columns: auto 1fr; gap: 0.8rem 1rem; padding: 1.25rem; transform: translateY(35%); border-radius: 18px; }
          .home-connection-mark { font-size: 3.2rem; }
          .home-connection-link { grid-column: 2; justify-self: start; min-height: 37px; font-size: 0.76rem; }
          .home-ad-slot { padding-top: 6rem; }
        }
        @media (max-width: 390px) {
          .home-hero-index > span { padding: 0 9px; }
          .home-hero-index b { font-size: 0.82rem; }
          .home-hero-index small { font-size: 0.61rem; }
          .home-directory-card { min-height: 150px; padding: 0.86rem; }
          .home-directory-label { font-size: 0.8rem; }
          .home-directory-subtitle { font-size: 0.62rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .home-page *, .home-page *::before, .home-page *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}
