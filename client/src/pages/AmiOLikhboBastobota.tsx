import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  Heart,
  ImagePlus,
  MessageCircle,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Video,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const platformFeatures = [
  {
    title: "নিজস্ব প্রোফাইল",
    description: "প্রতিটি লেখক নিজের নাম, ছবি, পরিচিতি ও প্রকাশিত লেখার সংগ্রহ নিয়ে আলাদা প্রোফাইল তৈরি করতে পারবেন।",
    icon: UsersRound,
  },
  {
    title: "গল্প, কবিতা ও বাস্তব অভিজ্ঞতা",
    description: "মনের কথা, জীবনের বাস্তবতা, স্মৃতি, অনুভূতি, গল্প ও কবিতা প্রকাশের জন্য থাকবে সহজ লেখার ব্যবস্থা।",
    icon: BookOpenText,
  },
  {
    title: "ছবি ও ভিডিও প্রকাশ",
    description: "লেখার সঙ্গে ছবি, পোস্টার, আবৃত্তি, ভিডিও বা সৃজনশীল ভিজ্যুয়াল যুক্ত করে প্রকাশ করা যাবে।",
    icon: ImagePlus,
  },
  {
    title: "লাইক, রিঅ্যাক্ট ও কমেন্ট",
    description: "পাঠক ও লেখকের মধ্যে সুন্দর যোগাযোগ তৈরির জন্য প্রতিটি পোস্টে থাকবে প্রতিক্রিয়া ও মন্তব্যের সুযোগ।",
    icon: MessageCircle,
  },
  {
    title: "গুগল সার্চে পরিচিতি",
    description: "প্রকাশিত লেখাগুলো SEO-সহ সাজানো হবে, যাতে লেখকের নাম ও প্রোফাইল অনুযায়ী সার্চে দৃশ্যমান হওয়ার সম্ভাবনা বাড়ে।",
    icon: Search,
  },
  {
    title: "নিরাপদ কমিউনিটি",
    description: "অ্যাডমিন রিভিউ, রিপোর্টিং ও কমিউনিটি নীতিমালার মাধ্যমে প্ল্যাটফর্মকে সম্মানজনক ও নিরাপদ রাখা হবে।",
    icon: ShieldCheck,
  },
];

const launchSteps = [
  "প্রথম ধাপে পরিচিতিমূলক ল্যান্ডিং পেজ ও আগ্রহী লেখকদের জন্য আহ্বান।",
  "দ্বিতীয় ধাপে ব্যবহারকারী অ্যাকাউন্ট, প্রোফাইল ও লেখা প্রকাশের MVP।",
  "তৃতীয় ধাপে লাইক, কমেন্ট, শেয়ার, ছবি-ভিডিও ও অ্যাডমিন মডারেশন।",
  "চূড়ান্ত ধাপে SEO প্রোফাইল, জনপ্রিয় লেখা, ফিচারড পোস্ট ও পূর্ণাঙ্গ কমিউনিটি।",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "আমিও লিখবো বাস্তবতা",
  description:
    "আমিও লিখবো বাস্তবতা হলো বাংলা ভাষার লেখক, পাঠক ও কনটেন্ট ক্রিয়েটরদের জন্য একটি সৃজনশীল লেখালেখি ও সামাজিক প্রকাশনা প্ল্যাটফর্ম।",
  url: "https://www.mahbubsardarsabuj.com/amio-likhbo-bastobota",
  inLanguage: "bn-BD",
  isPartOf: {
    "@type": "WebSite",
    name: "মাহবুব সরদার সবুজ",
    url: "https://www.mahbubsardarsabuj.com",
  },
};

export default function AmiOLikhboBastobota() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #050B14 0%, #071426 44%, #050B14 100%)",
        color: "#FDF6EC",
        overflow: "hidden",
      }}
    >
      <Seo
        title="আমিও লিখবো বাস্তবতা | বাংলা লেখালেখি ও সৃজনশীল প্রকাশনার প্ল্যাটফর্ম"
        description="আমিও লিখবো বাস্তবতা—একটি আধুনিক বাংলা লেখালেখির প্ল্যাটফর্ম, যেখানে লেখকরা গল্প, কবিতা, বাস্তব অভিজ্ঞতা, ছবি ও ভিডিও প্রকাশ করতে পারবেন।"
        path="/amio-likhbo-bastobota"
        keywords="আমিও লিখবো বাস্তবতা, বাংলা লেখালেখি প্ল্যাটফর্ম, বাংলা গল্প, বাংলা কবিতা, লেখক প্রোফাইল, Mahbub Sardar Sabuj"
        jsonLd={jsonLd}
      />
      <Navbar />

      <main style={{ position: "relative" }}>
        <section
          style={{
            position: "relative",
            minHeight: "92vh",
            display: "flex",
            alignItems: "center",
            padding: "calc(var(--site-nav-offset, 98px) + 3rem) 1.25rem 5rem",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 18% 18%, rgba(212,168,67,0.18), transparent 28%), radial-gradient(circle at 82% 22%, rgba(88,166,255,0.14), transparent 26%), radial-gradient(circle at 50% 88%, rgba(212,168,67,0.08), transparent 30%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "linear-gradient(rgba(212,168,67,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.05) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
              maskImage: "linear-gradient(to bottom, black 0%, transparent 82%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative", zIndex: 1, width: "100%" }}>
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              style={{ maxWidth: 880 }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "9px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(212,168,67,0.28)",
                  background: "rgba(212,168,67,0.08)",
                  color: "#E8C97A",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  fontSize: "0.86rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                }}
              >
                <Sparkles size={16} /> নতুন সৃজনশীল কমিউনিটির পরিকল্পনা
              </div>

              <h1
                style={{
                  fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
                  fontSize: "clamp(2.45rem, 8vw, 6.35rem)",
                  lineHeight: 1.02,
                  margin: "0 0 1.5rem",
                  letterSpacing: "-0.04em",
                  color: "#FDF6EC",
                }}
              >
                আমিও লিখবো <span style={{ color: "#D4A843" }}>বাস্তবতা</span>
              </h1>

              <p
                style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  fontSize: "clamp(1.05rem, 2.1vw, 1.35rem)",
                  lineHeight: 1.9,
                  color: "rgba(253,246,236,0.74)",
                  maxWidth: 780,
                  margin: "0 0 2.2rem",
                }}
              >
                এটি হবে মানুষের অনুভূতি, বাস্তব জীবন, গল্প, কবিতা, ছবি ও ভিডিও প্রকাশের একটি আধুনিক বাংলা প্ল্যাটফর্ম—যেখানে নতুন লেখকরা নিজেদের পরিচিতি গড়ে তুলতে পারবেন এবং পাঠকদের সঙ্গে অর্থপূর্ণ সম্পর্ক তৈরি করতে পারবেন।
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                <Link href="/contact">
                  <motion.span
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "14px 20px",
                      borderRadius: 999,
                      background: "linear-gradient(135deg, #D4A843 0%, #E8C97A 100%)",
                      color: "#071426",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontWeight: 800,
                      textDecoration: "none",
                      cursor: "pointer",
                      boxShadow: "0 18px 42px rgba(212,168,67,0.24)",
                    }}
                  >
                    যোগাযোগ করুন <ArrowRight size={18} />
                  </motion.span>
                </Link>
                <Link href="/writings">
                  <motion.span
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "14px 20px",
                      borderRadius: 999,
                      border: "1px solid rgba(212,168,67,0.26)",
                      background: "rgba(255,255,255,0.04)",
                      color: "#FDF6EC",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontWeight: 700,
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    বর্তমান লেখালেখি দেখুন <PenLine size={18} />
                  </motion.span>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section style={{ padding: "3rem 1.25rem 5rem" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 3rem" }}>
              <h2
                style={{
                  fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
                  fontSize: "clamp(2rem, 4vw, 3.35rem)",
                  lineHeight: 1.14,
                  margin: "0 0 1rem",
                  color: "#E8C97A",
                }}
              >
                প্ল্যাটফর্মে যা থাকবে
              </h2>
              <p
                style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "rgba(253,246,236,0.62)",
                  lineHeight: 1.8,
                  fontSize: "1rem",
                  margin: 0,
                }}
              >
                প্রথম ধাপে এটি একটি পরিচিতিমূলক সেকশন হিসেবে থাকবে। ভবিষ্যতে এটিকে পূর্ণাঙ্গ social writing platform হিসেবে উন্নত করা যাবে।
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 18,
              }}
            >
              {platformFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.article
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    style={{
                      padding: "1.45rem",
                      borderRadius: 22,
                      border: "1px solid rgba(212,168,67,0.16)",
                      background: "linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)",
                      boxShadow: "0 18px 55px rgba(0,0,0,0.22)",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 15,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(212,168,67,0.11)",
                        border: "1px solid rgba(212,168,67,0.22)",
                        marginBottom: "1rem",
                      }}
                    >
                      <Icon size={22} color="#D4A843" />
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontSize: "1.12rem",
                        color: "#FDF6EC",
                        margin: "0 0 0.7rem",
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        color: "rgba(253,246,236,0.6)",
                        lineHeight: 1.8,
                        margin: 0,
                        fontSize: "0.92rem",
                      }}
                    >
                      {feature.description}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section style={{ padding: "1rem 1.25rem 6rem" }}>
          <div
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
              alignItems: "stretch",
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6 }}
              style={{
                padding: "2rem",
                borderRadius: 28,
                background: "linear-gradient(135deg, rgba(212,168,67,0.13), rgba(255,255,255,0.035))",
                border: "1px solid rgba(212,168,67,0.22)",
              }}
            >
              <Heart size={34} color="#D4A843" />
              <h2
                style={{
                  fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
                  fontSize: "clamp(1.85rem, 3vw, 2.65rem)",
                  color: "#E8C97A",
                  lineHeight: 1.18,
                  margin: "1.1rem 0 1rem",
                }}
              >
                উদ্দেশ্য
              </h2>
              <p
                style={{
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "rgba(253,246,236,0.68)",
                  lineHeight: 1.9,
                  margin: 0,
                }}
              >
                “আমিও লিখবো বাস্তবতা” হবে এমন একটি জায়গা, যেখানে প্রত্যেক মানুষ নিজের জীবনের গল্পকে গুরুত্ব দিয়ে প্রকাশ করতে পারবেন। এখানে লেখাকে শুধু পোস্ট হিসেবে নয়, বরং ব্যক্তিগত পরিচিতি, সৃজনশীলতা ও সামাজিক প্রভাব তৈরির মাধ্যম হিসেবে দেখা হবে।
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6 }}
              style={{
                padding: "2rem",
                borderRadius: 28,
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(212,168,67,0.16)",
              }}
            >
              <Video size={34} color="#D4A843" />
              <h2
                style={{
                  fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
                  fontSize: "clamp(1.85rem, 3vw, 2.65rem)",
                  color: "#E8C97A",
                  lineHeight: 1.18,
                  margin: "1.1rem 0 1rem",
                }}
              >
                বাস্তবায়নের ধাপ
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {launchSteps.map((step) => (
                  <div key={step} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <CheckCircle2 size={19} color="#D4A843" style={{ marginTop: 4, flexShrink: 0 }} />
                    <p
                      style={{
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        color: "rgba(253,246,236,0.68)",
                        lineHeight: 1.75,
                        margin: 0,
                        fontSize: "0.94rem",
                      }}
                    >
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
