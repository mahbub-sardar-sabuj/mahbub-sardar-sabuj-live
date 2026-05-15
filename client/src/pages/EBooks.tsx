/*
 * Premium E-Books Page — Mahbub Sardar Sabuj
 * Design: Literary Avant-Garde — Navy #0D1B2A, Gold #D4A843, Cream #FDF6EC
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Eye, X, Star, ShoppingCart, BookMarked, Sparkles, Copy, Check, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Link } from "wouter";
import AdSenseAd from "@/components/AdSenseAd";

const ebooks = [
  {
    id: 1,
    slug: "dukkhovilash",
    title: "আমি বিচ্ছেদকে বলি দুঃখবিলাস",
    subtitle: "প্রথম ফিজিক্যাল বই",
    cover: "/images/ebooks/dukkhovilash.png",
    description:
      "'আমি বিচ্ছেদকে বলি দুঃখবিলাস' — লেখক মাহবুব সরদার সবুজের প্রথম প্রকাশিত ফিজিক্যাল বই। বিচ্ছেদের ব্যথা, হারানোর কষ্ট আর জীবনের গভীর অনুভূতিগুলো এই বইয়ে অনন্যভাবে তুলে ধরা হয়েছে। প্রতিটি পাতায় লুকিয়ে আছে এক অন্যরকম ভালোবাসার গল্প। যে ভালোবাসা শুধু আনন্দের নয়, যে ভালোবাসায় মিশে আছে বিচ্ছেদের নীল বেদনা, অপেক্ষার দীর্ঘ রাত আর না-পাওয়ার হাহাকার। লেখক তার নিজস্ব জীবনের অনুভূতি ও পর্যবেক্ষণ থেকে এই বইটি রচনা করেছেন, যা পাঠকের হৃদয়ে সরাসরি নাড়া দেয়। বইটি ইতোমধ্যেই পাঠকমহলে ব্যাপক সাড়া ফেলেছে এবং তরুণ প্রজন্মের কাছে বিশেষভাবে সমাদৃত হয়েছে।",
    genre: "আবেগী সাহিত্য",
    pages: "১৫০+",
    year: "২০২৬",
    badge: "ফিজিক্যাল বই",
    badgeColor: "#D4A843",
    buyLink: "https://rkmri.co/TTMEoA3l3pM0/",
    isFeatured: true,
    canRead: true,
    accentColor: "#D4A843",
  },
  {
    id: 2,
    slug: "smritir-boshonte",
    title: "স্মৃতির বসন্তে তুমি",
    subtitle: "ই-বুক",
    cover: "/images/ebooks/smritir-boshonte.jpg",
    description:
      "'স্মৃতির বসন্তে তুমি' — মাহবুব সরদার সবুজের একটি আবেগঘন কাব্যিক সংকলন। স্মৃতির গভীরে হারিয়ে যাওয়া প্রিয় মুহূর্তগুলো নিয়ে লেখা এই বইটি। চাঁদের আলোয় ভেজা রাত, পুকুরের জলে পদ্মপাতা, শৈশবের সেই মেঠোপথ — সব মিলিয়ে এক অসাধারণ কাব্যিক যাত্রা। প্রতিটি কবিতায় লেখক স্মৃতি ও বর্তমানের মাঝে এক সেতু তৈরি করেছেন। পাঠক এই বইয়ের পাতায় পাতায় নিজের হারিয়ে যাওয়া স্মৃতির ছায়া খুঁজে পাবেন। বাংলার প্রকৃতি ও মানবমনের গভীর সংযোগ এই বইটিকে করেছে অনন্য ও হৃদয়গ্রাহী।",
    genre: "কবিতা ও গদ্য",
    pages: "৮০+",
    year: "২০২৪",
    badge: "ই-বুক",
    badgeColor: "#4A90D9",
    buyLink: null,
    isFeatured: false,
    canRead: true,
    accentColor: "#4A90D9",
  },
  {
    id: 3,
    slug: "chand-phool",
    title: "চাঁদফুল",
    subtitle: "ই-বুক",
    cover: "/images/ebooks/chand-phool.jpg",
    description:
      "'চাঁদফুল' — মাহবুব সরদার সবুজের একটি বিশেষ কাব্যগ্রন্থ যেখানে প্রকৃতির অপরূপ সৌন্দর্য আর মানবমনের কোমল অনুভূতির মেলবন্ধন ঘটেছে। চাঁদের আলো আর ফুলের সুবাস মিলিয়ে তৈরি এক অনন্য সাহিত্যকর্ম। এই বইয়ের কবিতাগুলো পাঠককে নিয়ে যায় এক স্বপ্নময় জগতে, যেখানে প্রকৃতি ও মানুষ একসূত্রে গাঁথা। রাতের আকাশের চাঁদ, ভোরের শিশিরভেজা ফুল, বৃষ্টির সুর — এই সব উপাদান মিলে তৈরি হয়েছে এক অপূর্ব কাব্যিক বিশ্ব। বাংলা সাহিত্যের প্রকৃতিপ্রেমী পাঠকদের জন্য এটি একটি অবশ্যপাঠ্য বই।",
    genre: "কবিতা",
    pages: "৬০+",
    year: "২০২৩",
    badge: "ই-বুক",
    badgeColor: "#27AE60",
    buyLink: null,
    isFeatured: false,
    canRead: true,
    accentColor: "#27AE60",
  },
  {
    id: 4,
    slug: "shomoyer-gohvore",
    title: "সময়ের গহ্বরে",
    subtitle: "ই-বুক",
    cover: "/images/ebooks/shomoyer-gohvore.jpg",
    description:
      "'সময়ের গহ্বরে' — মাহবুব সরদার সবুজের একটি নস্টালজিক সাহিত্যকর্ম। সময়ের স্রোতে হারিয়ে যাওয়া শহর, মানুষ আর স্মৃতির কথা এই বইয়ে অনবদ্যভাবে উঠে এসেছে। পুরনো শহরের গলিপথ, রেলস্টেশনের ঘড়ি, বাজারের কোলাহল, নদীর ধারের সন্ধ্যা — সব মিলিয়ে এক অসাধারণ নস্টালজিক সাহিত্যযাত্রা। লেখক এই বইয়ে সময়কে ধরে রাখার এক অদ্ভুত প্রচেষ্টা করেছেন। যে সময় চলে গেছে, যে মানুষগুলো হারিয়ে গেছে — তাদের স্মৃতি এই বইয়ের পাতায় জীবন্ত হয়ে উঠেছে। পাঠক এই বইয়ে নিজের জীবনের হারিয়ে যাওয়া মুহূর্তগুলোর প্রতিফলন দেখতে পাবেন।",
    genre: "গদ্য ও কবিতা",
    pages: "১০০+",
    year: "২০২৩",
    badge: "ই-বুক",
    badgeColor: "#E67E22",
    buyLink: null,
    isFeatured: false,
    canRead: true,
    accentColor: "#E67E22",
  },
  {
    id: 5,
    slug: "onoboddo-lekha",
    title: "মাহবুব সরদার সবুজের অনবদ্য লেখা",
    subtitle: "ই-বুক সংকলন",
    cover: "/images/ebooks/onoboddo-lekha.jpg",
    description:
      "মাহবুব সরদার সবুজের বিভিন্ন সময়ে লেখা অনবদ্য কবিতা ও গদ্যের একটি বিশেষ সংকলন। জীবনের নানা অনুভূতি, প্রেম, বিচ্ছেদ ও দর্শনের কথা এই বইয়ে অনন্যভাবে উঠে এসেছে।",
    genre: "কবিতা ও গদ্য সংকলন",
    pages: "৮০+",
    year: "২০২৪",
    badge: "ই-বুক",
    badgeColor: "#8B5CF6",
    buyLink: null,
    isFeatured: false,
    canRead: true,
    accentColor: "#8B5CF6",
  },
];

function BookModal({ book, onClose }: { book: typeof ebooks[0]; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const bookUrl = `https://www.mahbubsardarsabuj.com/ebooks/read/${book.slug}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(bookUrl).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = bookUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: book.title, text: `মাহবুব সরদার সবুজের '${book.title}' পড়ুন`, url: bookUrl });
    } else {
      handleCopy();
    }
  };
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(13,27,42,0.88)", backdropFilter: "blur(12px)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[#FDF6EC] rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          style={{ boxShadow: "0 40px 80px rgba(13,27,42,0.5)" }}
        >
          {/* Header */}
          <div className="bg-[#0D1B2A] p-6 flex justify-between items-start">
            <div>
              <span className="text-[#D4A843] text-xs font-bold tracking-widest uppercase">{book.badge}</span>
              <h2 className="text-white text-2xl mt-1 leading-tight" style={{ fontFamily: "'Tiro Bangla', serif" }}>
                {book.title}
              </h2>
              <p className="text-[#D4A843] text-sm mt-1">মাহবুব সরদার সবুজ</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ml-4"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex gap-6 p-6 flex-wrap">
            <img
              src={book.cover}
              alt={book.title}
              className="w-44 rounded-xl shadow-2xl flex-shrink-0"
              style={{ boxShadow: `0 20px 40px ${book.accentColor}40` }}
            />
            <div className="flex-1 min-w-48">
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { label: "ধরন", value: book.genre },
                  { label: "পৃষ্ঠা", value: book.pages },
                  { label: "প্রকাশ", value: book.year },
                ].map((item) => (
                  <div key={item.label} className="px-3 py-2 rounded-lg" style={{ background: "rgba(13,27,42,0.06)", border: "1px solid rgba(13,27,42,0.1)" }}>
                    <div className="text-[#D4A843] text-xs mb-0.5">{item.label}</div>
                    <div className="text-[#0D1B2A] text-sm font-semibold">{item.value}</div>
                  </div>
                ))}
              </div>
              <p className="text-[#0D1B2A] text-sm leading-relaxed mb-5">{book.description}</p>
              <div className="flex flex-wrap gap-3">
                {book.canRead && (
                  <Link href={`/ebooks/read/${book.slug}`}>
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(212,168,67,0.4)" }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-[#0D1B2A]"
                      style={{ background: "linear-gradient(135deg, #D4A843, #f0c060)" }}
                    >
                      <BookOpen size={18} />
                      এখনই পড়ুন
                    </motion.button>
                  </Link>
                )}
                {book.buyLink && (
                  <a href={book.buyLink} target="_blank" rel="noopener noreferrer">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-full font-bold border-2 border-[#D4A843] text-[#D4A843] hover:bg-[#D4A843]/10 transition-colors"
                    >
                      <ShoppingCart size={18} />
                      রকমারিতে কিনুন
                    </motion.button>
                  </a>
                )}
                <motion.button
                  onClick={handleCopy}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-full font-bold border-2 transition-colors ${
                    copied ? "border-green-500 text-green-600 bg-green-50" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "কপি হয়েছে!" : "লিংক কপি"}
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-3 rounded-full font-bold border-2 border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Share2 size={16} />
                  শেয়ার
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function EBooks() {
  const [selectedBook, setSelectedBook] = useState<typeof ebooks[0] | null>(null);
  const featuredBook = ebooks[0];
  const otherBooks = ebooks.slice(1);

  const ebooksJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "name": "ই-বুক সংগ্রহ | মাহবুব সরদার সবুজ",
        "url": "https://www.mahbubsardarsabuj.com/ebooks",
        "inLanguage": "bn-BD",
        "description": "মাহবুব সরদার সবুজের প্রকাশিত ই-বুক ও ফিজিক্যাল বইয়ের সম্পূর্ণ সংগ্রহ।",
      },
      ...ebooks.map((book) => ({
        "@type": "Book",
        "@id": `https://www.mahbubsardarsabuj.com/ebooks#${book.slug}`,
        "name": book.title,
        "inLanguage": "bn-BD",
        "author": {
          "@type": "Person",
          "name": "মাহবুব সরদার সবুজ",
          "alternateName": "Mahbub Sardar Sabuj",
          "url": "https://www.mahbubsardarsabuj.com/about",
        },
        "url": `https://www.mahbubsardarsabuj.com/ebooks/read/${book.slug}`,
        "description": book.description,
        "genre": "Bengali Literature",
        "bookFormat": "EBook",
        "isAccessibleForFree": (book as any).isFree ? "True" : "False",
        ...((book as any).coverImage ? { "image": (book as any).coverImage } : {}),
      })),
    ],
  };

  return (
    <div style={{ background: "#060E1A", minHeight: "100vh", overflowX: "hidden" }}>
      <Seo
        title="বাংলা ই-বুক | দুঃখবিলাস, চাঁদফুল | মাহবুব সরদার সবুজ"
        description="মাহবুব সরদার সবুজের বাংলা ই-বুক সংগ্রহ বিনামূল্যে পড়ুন। দুঃখবিলাস, স্মৃতির বসন্তে তুমি, চাঁদফুল ও সময়ের গহ্বরে — ভালোবাসা ও জীবনদর্শনের অনুপ্রেরণামূলক বাংলা বই।"
        path="/ebooks"
        keywords="বাংলা ই-বুক, বাংলা বই ডাউনলোড, দুঃখবিলাস বই, চাঁদফুল বই, স্মৃতির বসন্তে তুমি, সময়ের গহ্বরে, মাহবুব সরদার সবুজ বই, Mahbub Sardar Sabuj ebook, বাংলা সাহিত্য বই, বিনামূল্যে বাংলা ই-বুক"
        jsonLd={ebooksJsonLd}
      />
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          padding: "8rem 0 5rem",
          background: "linear-gradient(160deg, #0D1B2A 0%, #1a2e42 50%, #0D1B2A 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", top: "-20%", right: "-10%",
            width: "50vw", height: "50vw",
            background: "radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -15, 0], opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
              style={{
                position: "absolute",
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                fontSize: "2.5rem",
              }}
            >
              📖
            </motion.div>
          ))}
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem", position: "relative", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p style={{ color: "#D4A843", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem" }}>
              Books & E-Books
            </p>
            <h1 style={{ fontFamily: "'Tiro Bangla', serif", color: "#FDF6EC", fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 400, lineHeight: 1.2, marginBottom: "1.25rem" }}>
              বই সংগ্রহ
            </h1>
            <p style={{ color: "rgba(253,246,236,0.7)", fontSize: "1.05rem", maxWidth: 520, margin: "0 auto 2.5rem", lineHeight: 1.8 }}>
              মাহবুব সরদার সবুজের প্রকাশিত সকল বই ও ই-বুকের সংগ্রহ। প্রতিটি বই একটি আলাদা অনুভূতির জগৎ।
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ display: "flex", justifyContent: "center", gap: "clamp(2rem, 6vw, 5rem)" }}
          >
            {[
              { value: "১টি", label: "ফিজিক্যাল বই" },
              { value: "৩টি", label: "ই-বুক প্রকাশিত" },
              { value: "লক্ষাধিক", label: "পাঠক" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, color: "#D4A843" }}>{stat.value}</div>
                <div style={{ color: "rgba(253,246,236,0.6)", fontSize: "0.85rem", marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Book */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "4rem 1.5rem 2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
          <Star size={16} fill="#D4A843" color="#D4A843" />
          <span style={{ color: "#D4A843", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Featured</span>
          <div style={{ flex: 1, height: 1, background: "rgba(212,168,67,0.2)" }} />
        </div>
        <h2 style={{ fontFamily: "'Tiro Bangla', serif", color: "#FDF6EC", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 400, marginBottom: "1.5rem" }}>
          প্রধান বই
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{
            background: "#0D1B2A",
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(13,27,42,0.25)",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {/* Cover */}
          <div style={{ position: "relative", minWidth: 260, flex: "0 0 300px", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(212,168,67,0.15) 0%, transparent 60%)" }} />
            <img
              src={featuredBook.cover}
              alt={featuredBook.title}
              style={{ width: "100%", height: "100%", minHeight: 360, objectFit: "cover", display: "block" }}
            />
            <div style={{ position: "absolute", top: 16, left: 16 }}>
              <span style={{
                background: "#D4A843", color: "#0D1B2A",
                fontSize: "0.72rem", fontWeight: 700, padding: "6px 14px",
                borderRadius: 999, display: "flex", alignItems: "center", gap: 5,
              }}>
                <Star size={11} fill="currentColor" /> ফিজিক্যাল বই
              </span>
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, padding: "clamp(2rem, 5vw, 3.5rem)", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 260 }}>
            <p style={{ color: "#D4A843", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.75rem" }}>মাহবুব সরদার সবুজ</p>
            <h3 style={{ fontFamily: "'Tiro Bangla', serif", color: "#FDF6EC", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 400, lineHeight: 1.3, marginBottom: "1rem" }}>
              {featuredBook.title}
            </h3>
            <p style={{ color: "rgba(253,246,236,0.75)", fontSize: "1rem", lineHeight: 1.85, marginBottom: "1.5rem" }}>
              {featuredBook.description}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "2rem" }}>
              {[featuredBook.genre, featuredBook.pages + " পৃষ্ঠা", featuredBook.year, "রকমারিতে পাওয়া যাচ্ছে"].map((tag, i) => (
                <span key={tag} style={{
                  fontSize: "0.78rem", padding: "6px 14px", borderRadius: 999,
                  background: i === 3 ? "rgba(39,174,96,0.2)" : "rgba(255,255,255,0.1)",
                  color: i === 3 ? "#2ecc71" : "rgba(253,246,236,0.75)",
                }}>
                  {tag}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link href={`/ebooks/read/${featuredBook.slug}`}>
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 0 35px rgba(212,168,67,0.45)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "linear-gradient(135deg, #D4A843, #f0c060)",
                    color: "#0D1B2A", padding: "14px 28px", borderRadius: 999,
                    fontWeight: 700, fontSize: "1rem", border: "none", cursor: "pointer",
                    boxShadow: "0 8px 25px rgba(212,168,67,0.3)",
                  }}
                >
                  <BookOpen size={20} /> এখনই পড়ুন
                </motion.button>
              </Link>
              <a href="https://rkmri.co/TTMEoA3l3pM0/" target="_blank" rel="noopener noreferrer">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(212,168,67,0.3)" }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: "transparent", color: "#D4A843",
                      padding: "14px 28px", borderRadius: 999,
                      fontWeight: 700, fontSize: "1rem",
                      border: "2px solid #D4A843", cursor: "pointer",
                    }}
                  >
                    <ShoppingCart size={20} /> রকমারি থেকে অর্ডার করুন
                  </motion.button>
                </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* E-Books Grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
          <BookMarked size={16} color="#D4A843" />
          <span style={{ color: "#D4A843", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>E-Books</span>
          <div style={{ flex: 1, height: 1, background: "rgba(212,168,67,0.2)" }} />
        </div>
        <h2 style={{ fontFamily: "'Tiro Bangla', serif", color: "#FDF6EC", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 400, marginBottom: "2rem" }}>
          ই-বুক সংগ্রহ
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
          {otherBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                border: "1px solid rgba(201,168,76,0.12)",
                display: "flex",
                flexDirection: "column",
                transition: "box-shadow 0.3s, border-color 0.3s",
              }}
            >
              {/* Cover */}
              <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", background: "#0D1B2A", cursor: "pointer" }}
                onClick={() => setSelectedBook(book)}
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(13,27,42,0.7) 100%)" }} />
                <span style={{
                  position: "absolute", top: 12, left: 12,
                  background: book.badgeColor, color: "#FFF",
                  fontSize: "0.72rem", fontWeight: 700, padding: "5px 12px", borderRadius: 999,
                }}>
                  {book.badge}
                </span>
                {/* Hover overlay */}
                <div
                  className="hover-overlay"
                  style={{
                    position: "absolute", inset: 0,
                    background: "rgba(13,27,42,0.82)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    opacity: 0, transition: "opacity 0.3s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; }}
                >
                  <BookOpen size={36} color="#D4A843" style={{ marginBottom: 8 }} />
                  <p style={{ color: "#FFF", fontWeight: 700, fontSize: "0.9rem" }}>বিস্তারিত দেখুন</p>
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: "1.4rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontFamily: "'Tiro Bangla', serif", color: "#FDF6EC", fontSize: "1.15rem", fontWeight: 400, lineHeight: 1.45, marginBottom: "0.5rem" }}>
                  {book.title}
                </h3>
                <p style={{ color: "rgba(201,168,76,0.6)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>{book.genre} • {book.year}</p>
                <p style={{ color: "rgba(253,246,236,0.55)", fontSize: "0.875rem", lineHeight: 1.7, flex: 1, marginBottom: "1.25rem" }}>
                  {book.description.slice(0, 100)}...
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={`/ebooks/read/${book.slug}`}>
                    <motion.button
                      whileHover={{ scale: 1.04, boxShadow: "0 6px 20px rgba(212,168,67,0.35)" }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "linear-gradient(135deg, #D4A843, #f0c060)",
                        color: "#0D1B2A", padding: "9px 18px", borderRadius: 999,
                        fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: "pointer",
                      }}
                    >
                      <BookOpen size={15} /> পড়ুন
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedBook(book)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: "transparent", color: "rgba(253,246,236,0.7)",
                      padding: "9px 18px", borderRadius: 999,
                      fontWeight: 600, fontSize: "0.875rem",
                      border: "1.5px solid rgba(201,168,76,0.2)", cursor: "pointer",
                    }}
                  >
                    <Eye size={15} /> বিস্তারিত
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{
            marginTop: "3rem",
            padding: "1.5rem 2rem",
            background: "rgba(201,168,76,0.04)",
            border: "1px solid rgba(201,168,76,0.15)",
            borderRadius: 16,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <Sparkles size={18} color="#D4A843" />
            <p style={{ color: "rgba(253,246,236,0.6)", fontSize: "0.95rem", lineHeight: 1.8, margin: 0 }}>
            আরও <strong style={{ color: "#D4A843" }}>৪টি ই-বুক</strong> শীঘ্রই প্রকাশিত হবে।
            নতুন বই সম্পর্কে আপডেট পেতে{" "}
            <a href="https://facebook.com/MahbubSardarSabuj" target="_blank" rel="noopener noreferrer" style={{ color: "#D4A843", fontWeight: 700 }}>
              ফেসবুক পেইজ
            </a>{" "}
            ফলো করুন।
          </p>
        </motion.div>
      </section>

      {/* Book Modal */}
      {selectedBook && (
        <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}

      {/* AdSense Ad — ই-বুক পেজের নিচে */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <AdSenseAd adSlot="" adFormat="auto" fullWidthResponsive={true} />
      </div>
      <Footer />
    </div>
  );
}
