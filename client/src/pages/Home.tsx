/*
 * Home Page — মাহবুব সরদার সবুজ
 * Editorial redesign: calm, light, direct and content-first.
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
  { group: "literature", label: "পরিচিতি", subtitle: "জীবন, লেখা ও লেখকের পথচলা", href: "/about", icon: UserRound },
  { group: "literature", label: "লেখালেখি ও বই", subtitle: "কবিতা, গদ্য ও প্রকাশিত বই", href: "/writings", icon: BookOpen },
  { group: "literature", label: "আমিও লিখবো বাস্তবতা", subtitle: "বাস্তবতা লেখার সৃজনশীল পরিসর", href: "/amio-likhbo-bastobota", icon: Feather },
  { group: "literature", label: "ডিজাইন ফরম্যাট", subtitle: "লেখাকে দিন সুন্দর ভিজ্যুয়াল রূপ", href: "/editor", icon: Palette },
  { group: "literature", label: "গ্যালারি", subtitle: "ছবি, মুহূর্ত ও স্মৃতির অ্যালবাম", href: "/gallery", icon: Images },
  { group: "literature", label: "সরদার সংবাদ", subtitle: "আপডেট, প্রকাশনা ও সাম্প্রতিক খবর", href: "/news", icon: Newspaper },
  { group: "literature", label: "যোগাযোগ", subtitle: "বার্তা, ইমেইল ও সংযোগের পথ", href: "/contact", icon: Mail },
  { group: "tools", label: "টেম্প ইমেইল", subtitle: "বিনামূল্যে ডিসপোজেবল ইমেইল তৈরি করুন", href: "/temp-email", icon: MailOpen },
  { group: "tools", label: "টেম্প নম্বর", subtitle: "বিনামূল্যে ডিসপোজেবল ফোন নম্বর", href: "/temp-number", icon: Phone },
  { group: "tools", label: "টেম্প কার্ড", subtitle: "টেস্টিংয়ের জন্য ভার্চুয়াল কার্ড", href: "/temp-card", icon: CreditCard },
  { group: "tools", label: "ইমেজ আপস্কেলার", subtitle: "এআই দিয়ে ছবির কোয়ালিটি বাড়ান", href: "/image-upscaler", icon: Sparkles },
  { group: "tools", label: "ভিডিও আপস্কেলার", subtitle: "ঝাপসা ভিডিও 4K/8K-এ উন্নত করুন", href: "/video-upscaler", icon: Video },
  { group: "tools", label: "অডিও এডিটর", subtitle: "ট্রিম, ফেড, স্পিড, রিভার্স ও নয়েজ রিডাকশন", href: "/audio-editor", icon: Music },
  { group: "tools", label: "আবৃত্তি টুল", subtitle: "লেখা দিন, AI মানুষের কণ্ঠে আবৃত্তি করবে", href: "/text-to-speech", icon: Mic2 },
] as const;

const literarySections = sections.filter((section) => section.group === "literature");
const toolSections = sections.filter((section) => section.group === "tools");

type Section = (typeof sections)[number];

function FeatureGrid({ items, kind }: { items: readonly Section[]; kind: "light" | "dark" }) {
  return (
    <div className={`home-feature-grid home-feature-grid-${kind}`}>
      {items.map((section, index) => {
        const Icon = section.icon;
        return (
          <motion.div
            key={section.href}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.38, delay: index * 0.035 }}
          >
            <Link className="home-feature-link" href={section.href} aria-label={`${section.label} খুলুন`}>
              <motion.div className="home-feature-card" whileHover={{ y: -3 }} whileTap={{ scale: 0.985 }}>
                <span className="home-feature-icon"><Icon size={20} strokeWidth={1.8} /></span>
                <span className="home-feature-text">
                  <strong>{section.label}</strong>
                  <small>{section.subtitle}</small>
                </span>
                <ArrowUpRight className="home-feature-arrow" size={16} strokeWidth={1.8} />
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
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setPwaInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) setPwaInstalled(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
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

  const appTitle = pwaInstalled ? "অ্যাপ ইনস্টল হয়েছে" : pwaInstalling ? "ইনস্টল হচ্ছে..." : "অ্যাপ হিসেবে রাখুন";
  const appDescription = pwaInstalled ? "হোম স্ক্রিন থেকে সরাসরি খুলুন" : "ফোনে দ্রুত ব্যবহার করার সহজ উপায়";

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
    <div className="home-page-editorial">
      <Seo
        title="মাহবুব সরদার সবুজ | Mahbub Sardar Sabuj - লেখক ও কবি"
        description="মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইট। লেখকের পরিচিতি, বাংলা কবিতা, লেখালেখি, বই, ই-বুক, গ্যালারি ও সরদার সংবাদ একসাথে পড়ুন।"
        path="/"
        keywords="মাহবুব সরদার সবুজ, Mahbub Sardar Sabuj, বাংলা কবি, বাংলা লেখক, বাংলা কবিতা, ভালোবাসার কবিতা, বিচ্ছেদের কবিতা, বাংলা ই-বুক, দুঃখবিলাস, স্মৃতির বসন্তে তুমি, চাঁদফুল, সময়ের গহ্বরে, বাংলা সাহিত্য, বাংলাদেশি লেখক, mahbub sardar sabuj kobita, bangla kobita, bangla sahitya, bangladeshi poet, bangla ebook free, সরদার সংবাদ"
        jsonLd={homeJsonLd}
      />
      <Navbar />

      <main>
        <section className="editorial-hero" aria-labelledby="home-title">
          <div className="editorial-hero-inner">
            <motion.div
              className="editorial-hero-copy"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.58, ease: [0.23, 1, 0.32, 1] }}
            >
              <p className="editorial-kicker">লেখক · কবি</p>
              <h1 id="home-title">মাহবুব<br /><em>সরদার সবুজ</em></h1>
              <p className="editorial-hero-intro">
                শব্দ, স্মৃতি ও মানুষের অনুভবের ভেতর দিয়ে গড়ে ওঠা এক নিরন্তর সাহিত্যযাত্রা।
              </p>
              <div className="editorial-hero-actions">
                <Link href="/writings" className="editorial-primary-action"><BookOpen size={18} /> লেখালেখি পড়ুন <ArrowRight size={17} /></Link>
                <Link href="/about" className="editorial-secondary-action">পরিচিতি <ArrowUpRight size={16} /></Link>
              </div>
              <div className="editorial-hero-note">বাংলা সাহিত্য, স্মৃতি ও সৃজনশীলতার একটি ব্যক্তিগত ঠিকানা</div>
            </motion.div>

            <motion.figure
              className="editorial-portrait"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
            >
              <img src={PROFILE_IMAGE} alt="কোট পরা মাহবুব সরদার সবুজের প্রতিকৃতি" loading="eager" fetchPriority="high" decoding="async" />
              <figcaption><span>লেখক ও কবি</span><strong>মাহবুব সরদার সবুজ</strong></figcaption>
            </motion.figure>
          </div>
        </section>

        <section className="editorial-directory" aria-labelledby="literature-title">
          <div className="editorial-container">
            <header className="editorial-section-header">
              <p>০১ — মূল পরিসর</p>
              <h2 id="literature-title">সাহিত্য ও <em>পরিচিতি</em></h2>
              <span>লেখা, স্মৃতি, খবর ও সরাসরি সংযোগের সব ঠিকানা</span>
            </header>
            <FeatureGrid items={literarySections} kind="light" />
          </div>
        </section>

        <section className="editorial-tools" aria-labelledby="tools-title">
          <div className="editorial-container">
            <header className="editorial-section-header editorial-section-header-dark">
              <p>০২ — দরকারি সুবিধা</p>
              <h2 id="tools-title">ডিজিটাল <em>কর্মশালা</em></h2>
              <span>দৈনন্দিন কাজ ও সৃজনশীলতার জন্য সহজ ব্যবহারযোগ্য টুল</span>
            </header>
            <FeatureGrid items={toolSections} kind="dark" />

            <motion.button
              type="button"
              className={`editorial-install ${pwaInstalled ? "is-installed" : ""}`}
              onClick={handleInstallPWA}
              whileTap={{ scale: 0.99 }}
              aria-label="ওয়েবসাইটটি অ্যাপ হিসেবে ইনস্টল করুন"
            >
              <span className="editorial-install-icon">
                {pwaInstalled ? <Check size={20} /> : pwaInstalling ? <Smartphone size={20} /> : <Download size={20} />}
              </span>
              <span><strong>{appTitle}</strong><small>{appDescription}</small></span>
              <ArrowRight size={19} />
            </motion.button>
          </div>
        </section>

        <section className="editorial-contact-strip" aria-label="যোগাযোগের আমন্ত্রণ">
          <div className="editorial-container editorial-contact-inner">
            <p>আপনার অনুভব, মতামত বা প্রয়োজনীয় কোনো কথা জানাতে পারেন সরাসরি।</p>
            <Link href="/contact">যোগাযোগ করুন <ArrowRight size={17} /></Link>
          </div>
        </section>

        <RulesSection />

        <div className="editorial-ad-slot">
          <AdSenseAd adSlot={AD_SLOTS.HOME_BANNER} adFormat="auto" fullWidthResponsive={true} />
        </div>
      </main>

      <style>{`
        .home-page-editorial {
          min-height: 100vh;
          overflow-x: hidden;
          color: #101A27;
          background: #FAF6EF;
        }
        .editorial-container { width: min(1120px, calc(100% - 48px)); margin: 0 auto; }
        .editorial-hero {
          position: relative;
          overflow: hidden;
          padding: calc(var(--site-nav-offset, 98px) + 60px) 0 72px;
          background: #F3EBDD;
          border-bottom: 1px solid rgba(16,26,39,0.12);
        }
        .editorial-hero::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 52%;
          opacity: 0.62;
          pointer-events: none;
          background: repeating-linear-gradient(135deg, rgba(16,26,39,0.045) 0, rgba(16,26,39,0.045) 1px, transparent 1px, transparent 12px);
        }
        .editorial-hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(310px, 0.72fr);
          gap: clamp(3rem, 9vw, 10rem);
          align-items: center;
          width: min(1120px, calc(100% - 48px));
          margin: 0 auto;
        }
        .editorial-hero-copy { max-width: 600px; }
        .editorial-kicker, .editorial-section-header p {
          margin: 0;
          color: #8F6A28;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.74rem;
          letter-spacing: 0.18em;
        }
        .editorial-kicker::before {
          content: "";
          display: inline-block;
          width: 32px;
          height: 1px;
          margin: 0 10px 4px 0;
          vertical-align: middle;
          background: #C9A84C;
        }
        .editorial-hero h1 {
          margin: 1rem 0 0;
          color: #0B1724;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: clamp(3.5rem, 7.8vw, 7.6rem);
          font-weight: 700;
          letter-spacing: -0.055em;
          line-height: 0.92;
        }
        .editorial-hero h1 em { color: #A77B2E; font-style: normal; }
        .editorial-hero-intro {
          max-width: 490px;
          margin: 1.55rem 0 0;
          color: #43505C;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: clamp(1rem, 1.9vw, 1.18rem);
          line-height: 1.85;
        }
        .editorial-hero-actions { display: flex; flex-wrap: wrap; gap: 0.7rem; margin-top: 1.65rem; }
        .editorial-primary-action, .editorial-secondary-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 46px;
          padding: 0 17px;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.88rem;
          text-decoration: none;
          transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
        }
        .editorial-primary-action { color: #FFF9EC; border: 1px solid #132437; border-radius: 4px; background: #132437; }
        .editorial-primary-action:hover { transform: translateY(-2px); background: #24384E; }
        .editorial-secondary-action { color: #132437; border: 1px solid rgba(19,36,55,0.38); border-radius: 4px; background: rgba(255,255,255,0.22); }
        .editorial-secondary-action:hover { transform: translateY(-2px); border-color: #132437; }
        .editorial-hero-note {
          margin-top: 2.35rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(16,26,39,0.16);
          color: #6A737A;
          font-family: 'AdorshoLipi', sans-serif;
          font-size: 0.78rem;
          line-height: 1.55;
        }
        .editorial-portrait { position: relative; margin: 0; justify-self: end; width: min(100%, 370px); }
        .editorial-portrait::before { content: ""; position: absolute; top: -14px; right: -14px; width: 70%; height: 70%; border-top: 1px solid #A77B2E; border-right: 1px solid #A77B2E; pointer-events: none; }
        .editorial-portrait img { display: block; width: 100%; aspect-ratio: 4 / 4.8; object-fit: cover; object-position: center top; border: 1px solid #132437; filter: contrast(1.03) saturate(0.92); }
        .editorial-portrait figcaption { display: flex; flex-direction: column; gap: 2px; margin-top: 12px; color: #132437; font-family: 'AdorshoLipi', sans-serif; }
        .editorial-portrait figcaption span { color: #8F6A28; font-size: 0.68rem; letter-spacing: 0.14em; }
        .editorial-portrait figcaption strong { font-size: 1rem; }

        .editorial-directory { padding: clamp(4.8rem, 9vw, 7rem) 0; background: #FAF6EF; }
        .editorial-section-header { display: grid; grid-template-columns: 160px minmax(0, 1fr); gap: 0 1rem; align-items: end; margin-bottom: 2.2rem; padding-bottom: 1.2rem; border-bottom: 1px solid rgba(16,26,39,0.16); }
        .editorial-section-header h2 { margin: 0; color: #122034; font-family: 'AdorshoLipi', sans-serif; font-size: clamp(2.15rem, 5vw, 4rem); font-weight: 700; letter-spacing: -0.04em; line-height: 1; }
        .editorial-section-header h2 em { color: #A77B2E; font-style: normal; }
        .editorial-section-header span { grid-column: 2; margin-top: 0.72rem; color: #59646D; font-family: 'AdorshoLipi', sans-serif; font-size: 0.9rem; }
        .home-feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; border: 1px solid rgba(16,26,39,0.18); background: rgba(16,26,39,0.18); }
        .home-feature-link { display: block; height: 100%; text-decoration: none; }
        .home-feature-card { position: relative; display: flex; align-items: flex-start; gap: 13px; min-height: 150px; padding: 1.4rem; background: #FAF6EF; transition: background 160ms ease; }
        .home-feature-card:hover { background: #F2E8D8; }
        .home-feature-icon { display: grid; flex: 0 0 auto; width: 38px; height: 38px; place-items: center; color: #A77B2E; border: 1px solid rgba(167,123,46,0.48); border-radius: 50%; }
        .home-feature-text { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 6px; padding-right: 14px; }
        .home-feature-text strong { color: #132437; font-family: 'AdorshoLipi', sans-serif; font-size: 1.05rem; line-height: 1.22; }
        .home-feature-text small { color: #647078; font-family: 'AdorshoLipi', sans-serif; font-size: 0.74rem; line-height: 1.48; }
        .home-feature-arrow { position: absolute; top: 1.25rem; right: 1.2rem; color: rgba(19,36,55,0.45); transition: transform 160ms ease, color 160ms ease; }
        .home-feature-card:hover .home-feature-arrow { color: #A77B2E; transform: translate(2px, -2px); }
        .home-feature-link:focus-visible { outline: 3px solid rgba(167,123,46,0.38); outline-offset: 3px; }

        .editorial-tools { padding: clamp(4.8rem, 9vw, 7rem) 0; background: #122034; }
        .editorial-section-header-dark { border-color: rgba(250,246,239,0.18); }
        .editorial-section-header-dark p { color: #D9B967; }
        .editorial-section-header-dark h2 { color: #FAF6EF; }
        .editorial-section-header-dark h2 em { color: #D9B967; }
        .editorial-section-header-dark span { color: rgba(250,246,239,0.62); }
        .home-feature-grid-dark { border-color: rgba(250,246,239,0.14); background: rgba(250,246,239,0.14); }
        .home-feature-grid-dark .home-feature-card { background: #122034; }
        .home-feature-grid-dark .home-feature-card:hover { background: #1A2D43; }
        .home-feature-grid-dark .home-feature-icon { color: #BFE0F1; border-color: rgba(191,224,241,0.45); }
        .home-feature-grid-dark .home-feature-text strong { color: #FAF6EF; }
        .home-feature-grid-dark .home-feature-text small { color: rgba(250,246,239,0.58); }
        .home-feature-grid-dark .home-feature-arrow { color: rgba(191,224,241,0.48); }
        .home-feature-grid-dark .home-feature-card:hover .home-feature-arrow { color: #BFE0F1; }
        .editorial-install { width: 100%; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 14px; margin-top: 1.6rem; padding: 1.1rem 1.2rem; color: #FAF6EF; text-align: left; cursor: pointer; border: 1px solid rgba(217,185,103,0.44); border-radius: 4px; background: transparent; transition: background 160ms ease, border-color 160ms ease; }
        .editorial-install:hover { border-color: #D9B967; background: rgba(217,185,103,0.08); }
        .editorial-install:focus-visible { outline: 3px solid rgba(217,185,103,0.28); outline-offset: 3px; }
        .editorial-install-icon { display: grid; width: 40px; height: 40px; place-items: center; color: #122034; background: #D9B967; }
        .editorial-install > span:nth-child(2) { display: flex; flex-direction: column; gap: 2px; }
        .editorial-install strong { font-family: 'AdorshoLipi', sans-serif; font-size: 1rem; }
        .editorial-install small { color: rgba(250,246,239,0.58); font-family: 'AdorshoLipi', sans-serif; font-size: 0.76rem; }
        .editorial-install.is-installed { border-color: rgba(123,220,166,0.62); }
        .editorial-install.is-installed .editorial-install-icon { color: #102C21; background: #8BD5AC; }

        .editorial-contact-strip { padding: 2.1rem 0; background: #D9B967; }
        .editorial-contact-inner { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; }
        .editorial-contact-inner p { max-width: 640px; margin: 0; color: #122034; font-family: 'AdorshoLipi', sans-serif; font-size: clamp(1.15rem, 2.4vw, 1.7rem); font-weight: 700; line-height: 1.35; }
        .editorial-contact-inner a { display: inline-flex; align-items: center; gap: 8px; flex: 0 0 auto; min-height: 42px; padding: 0 15px; color: #FAF6EF; font-family: 'AdorshoLipi', sans-serif; font-size: 0.86rem; text-decoration: none; border-radius: 4px; background: #122034; transition: transform 160ms ease, background 160ms ease; }
        .editorial-contact-inner a:hover { transform: translateY(-2px); background: #263E57; }
        .editorial-ad-slot { max-width: 900px; margin: 0 auto; padding: 2rem 1rem 1.5rem; background: #060E1A; }

        @media (max-width: 860px) {
          .editorial-hero { padding-top: calc(var(--site-nav-offset, 88px) + 38px); }
          .editorial-hero-inner { grid-template-columns: 1fr; gap: 2.5rem; }
          .editorial-portrait { order: -1; justify-self: start; width: min(74vw, 350px); }
          .editorial-hero::before { left: 0; opacity: 0.32; }
          .home-feature-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 620px) {
          .editorial-container, .editorial-hero-inner { width: min(100% - 32px, 1120px); }
          .editorial-hero { padding-bottom: 52px; }
          .editorial-hero h1 { font-size: clamp(3.15rem, 16vw, 5.2rem); }
          .editorial-hero-intro { margin-top: 1.15rem; font-size: 1rem; }
          .editorial-hero-note { margin-top: 1.7rem; }
          .editorial-portrait { width: min(84vw, 330px); }
          .editorial-section-header { display: block; margin-bottom: 1.45rem; }
          .editorial-section-header h2 { margin-top: 0.75rem; }
          .editorial-section-header span { display: block; margin-top: 0.55rem; font-size: 0.82rem; }
          .home-feature-grid { grid-template-columns: 1fr; }
          .home-feature-card { min-height: 112px; padding: 1.05rem; }
          .editorial-contact-inner { display: block; }
          .editorial-contact-inner a { margin-top: 1rem; }
        }
        @media (max-width: 380px) {
          .editorial-hero-actions { gap: 0.5rem; }
          .editorial-primary-action, .editorial-secondary-action { min-height: 42px; padding: 0 12px; font-size: 0.79rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .home-page-editorial *, .home-page-editorial *::before, .home-page-editorial *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}
