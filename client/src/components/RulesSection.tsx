/*
 * RulesSection — "কেন ব্যবহার করবেন?" সেকশন
 * Design: "Ink & Gold" — World-Class Literary Premium
 * Placed below the app-launcher-shell on Home page
 * Each card links directly to its respective tab/page
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  UserRound, Mic2, BookOpen, Feather, Palette, Images,
  Newspaper, Mail, MailOpen, Phone, CreditCard, Sparkles,
  Video, MessageCircle, Music, Info, CheckCircle2, ArrowUpRight
} from "lucide-react";

const tabs = [
  {
    icon: <UserRound size={20} strokeWidth={1.8} />,
    label: "পরিচিতি",
    href: "/about",
    desc: "আমার ব্যক্তিগত পরিচিতি ও সংক্ষিপ্ত তথ্য পাবেন।",
  },
  {
    icon: <Mic2 size={20} strokeWidth={1.8} />,
    label: "আবৃত্তি",
    href: "/facebook-recitations",
    desc: "আমার লেখার আবৃত্তিগুলোর লিংক এখানে পাওয়া যাবে।",
  },
  {
    icon: <BookOpen size={20} strokeWidth={1.8} />,
    label: "লেখালেখি ও বই",
    href: "/writings",
    desc: "আমার প্রকাশিত ও অপ্রকাশিত বিভিন্ন লেখা এবং বই সম্পর্কিত তথ্য এখানে থাকবে।",
  },
  {
    icon: <Feather size={20} strokeWidth={1.8} />,
    label: "আমিও লিখবো বাস্তবতা",
    href: "/amio-likhbo-bastobota",
    desc: "নিজের নামে অ্যাকাউন্ট খুলে ব্যক্তিগত ওয়েবসাইটের মতো ব্যবহার করতে পারবেন। লেখা, গল্প, কবিতা বা অন্যান্য পোস্ট প্রকাশ করতে পারবেন। আপনার অ্যাকাউন্টের সম্পূর্ণ নিয়ন্ত্রণ আপনার হাতেই থাকবে।",
  },
  {
    icon: <Palette size={20} strokeWidth={1.8} />,
    label: "ডিজাইন ফরম্যাট",
    href: "/editor",
    desc: "নিজের লেখাকে পছন্দমতো ডিজাইন ও সাজানোর সুবিধা পাবেন।",
  },
  {
    icon: <Images size={20} strokeWidth={1.8} />,
    label: "গ্যালারি",
    href: "/gallery",
    desc: "আমার ব্যক্তিগত ছবি ও স্মৃতির সংগ্রহশালা।",
  },
  {
    icon: <Newspaper size={20} strokeWidth={1.8} />,
    label: "সরদার সংবাদ",
    href: "/news",
    desc: "বিভিন্ন সংবাদ ও তথ্যভিত্তিক লেখা এখানে প্রকাশ করা হয়।",
  },
  {
    icon: <Mail size={20} strokeWidth={1.8} />,
    label: "যোগাযোগ",
    href: "/contact",
    desc: "আমার সঙ্গে সরাসরি যোগাযোগ করার প্রয়োজনীয় তথ্য ও পদ্ধতি পাবেন।",
  },
  {
    icon: <MailOpen size={20} strokeWidth={1.8} />,
    label: "টেম্পোরারি ইমেইল",
    href: "/temp-email",
    desc: "কোনো নিবন্ধন ছাড়াই অস্থায়ী ইমেইল ব্যবহার করতে পারবেন। বিভিন্ন ওয়েবসাইটে পরীক্ষামূলকভাবে অ্যাকাউন্ট খোলার কাজে এটি ব্যবহার করা যেতে পারে।",
  },
  {
    icon: <Phone size={20} strokeWidth={1.8} />,
    label: "টেম্প নাম্বার",
    href: "/temp-number",
    desc: "পাবলিক ভার্চুয়াল নাম্বারের মাধ্যমে পরীক্ষামূলক ভেরিফিকেশনের সুবিধা পাবেন। ব্যক্তিগত বা গুরুত্বপূর্ণ কাজে ব্যবহার না করাই ভালো।",
  },
  {
    icon: <CreditCard size={20} strokeWidth={1.8} />,
    label: "টেম্প কার্ড",
    href: "/temp-card",
    desc: "বিভিন্ন ওয়েবসাইটের ফ্রি ট্রায়াল সুবিধা নেওয়ার জন্য ভার্চুয়াল কার্ড সম্পর্কিত তথ্য ও সুবিধা পাবেন।",
  },
  {
    icon: <Sparkles size={20} strokeWidth={1.8} />,
    label: "ইমেজ আপস্কেলার",
    href: "/image-upscaler",
    desc: "ঝাপসা বা কম মানের ছবি উন্নত ও পরিষ্কার করতে পারবেন।",
  },
  {
    icon: <Video size={20} strokeWidth={1.8} />,
    label: "ভিডিও আপস্কেলার",
    href: "/video-upscaler",
    desc: "ঝাপসা ভিডিওর মান উন্নত করে আরও পরিষ্কার করতে পারবেন।",
  },
  {
    icon: <Music size={20} strokeWidth={1.8} />,
    label: "অডিও এডিটর",
    href: "/audio-editor",
    desc: "ব্রাউজারেই অডিও ট্রিম, ফেড, স্পিড পরিবর্তন, রিভার্স ও নয়েজ রিডাকশন করুন — কোনো সফটওয়্যার ইনস্টল ছাড়াই।",
  },
  {
    icon: <MessageCircle size={20} strokeWidth={1.8} />,
    label: "চ্যাটবট",
    href: "/",
    desc: "ওয়েবসাইটে প্রবেশ করলেই একটি চ্যাটবট পাবেন। এর মাধ্যমে বিভিন্ন তথ্য পাওয়ার পাশাপাশি অডিও এডিটিং সম্পর্কিত সহায়তাও নিতে পারবেন এবং সরাসরি লাইভ চ্যাট করতে পারবেন আমার টিমের সাথে।",
  },
];

export default function RulesSection() {
  return (
    <section
      style={{
        background:
          "linear-gradient(180deg, rgba(6,14,26,1) 0%, rgba(4,10,20,0.98) 100%)",
        padding: "0 0 4rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(201,168,76,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
          opacity: 0.5,
        }}
      />

      {/* Separator line at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(201,168,76,0.35), rgba(250,246,239,0.15), rgba(201,168,76,0.35), transparent)",
          boxShadow: "0 0 20px rgba(201,168,76,0.12)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1040,
          margin: "0 auto",
          padding: "3.5rem 1.25rem 0",
        }}
      >
        {/* ── Section Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          style={{ textAlign: "center", marginBottom: "2.8rem" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: "0.9rem",
            }}
          >
            <div
              style={{
                width: 40,
                height: 1,
                background: "linear-gradient(90deg, transparent, #C9A84C)",
              }}
            />
            <Info size={14} color="#E8C97A" />
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.68rem",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "#E8C97A",
                textShadow: "0 0 14px rgba(201,168,76,0.28)",
              }}
            >
              কেন ব্যবহার করবেন?
            </span>
            <div
              style={{
                width: 40,
                height: 1,
                background: "linear-gradient(90deg, #C9A84C, transparent)",
              }}
            />
          </div>

          <h2
            style={{
              fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
              fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)",
              fontWeight: 700,
              color: "#FAF6EF",
              margin: "0 0 1rem",
              lineHeight: 1.18,
              textShadow:
                "0 4px 22px rgba(0,0,0,0.5), 0 0 30px rgba(201,168,76,0.1)",
            }}
          >
            এক নজরে জেনে নিন
          </h2>

          <p
            style={{
              fontFamily: "'Noto Sans Bengali', sans-serif",
              color: "rgba(250,246,239,0.65)",
              maxWidth: 680,
              margin: "0 auto",
              fontSize: "0.97rem",
              lineHeight: 1.72,
            }}
          >
            আমার ওয়েবসাইটটি আমার নিজের নামে তৈরি হলেও এটি শুধু আমার ব্যক্তিগত
            পরিচয় নয়, বরং বিভিন্ন প্রয়োজনীয় ফিচারে সমৃদ্ধ একটি প্ল্যাটফর্ম।
            একজন ব্যবহারকারী হিসেবে আপনি কী কী সুবিধা পাবেন, তা নিচে তুলে ধরা হলো।
          </p>
        </motion.div>

        {/* ── Tabs Grid ──────────────────────────────────────────────── */}
        <div className="rules-tabs-grid">
          {tabs.map((tab, i) => (
            <motion.div
              key={tab.href + tab.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.045 }}
            >
              <Link href={tab.href} className="rules-tab-link" aria-label={`${tab.label} পেজে যান`}>
                <div className="rules-tab-card">
                  {/* Icon */}
                  <div className="rules-tab-icon-wrap">
                    {tab.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        marginBottom: "0.45rem",
                      }}
                    >
                      <CheckCircle2
                        size={13}
                        color="rgba(201,168,76,0.55)"
                        strokeWidth={2}
                      />
                      <h4
                        style={{
                          fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif",
                          fontSize: "1.02rem",
                          fontWeight: 700,
                          color: "#FFF8EA",
                          margin: 0,
                          lineHeight: 1.25,
                          flex: 1,
                        }}
                      >
                        {tab.label}
                      </h4>
                      <ArrowUpRight
                        size={14}
                        className="rules-arrow-icon"
                        strokeWidth={2}
                      />
                    </div>
                    <p
                      style={{
                        fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontSize: "0.84rem",
                        color: "rgba(250,246,239,0.58)",
                        margin: 0,
                        lineHeight: 1.65,
                      }}
                    >
                      {tab.desc}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom Note ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.3 }}
          style={{
            marginTop: "2.8rem",
            padding: "1.4rem 1.8rem",
            background:
              "linear-gradient(135deg, rgba(201,168,76,0.07), rgba(201,168,76,0.03))",
            border: "1px solid rgba(201,168,76,0.18)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
          }}
        >
          <Info
            size={18}
            color="#E8C97A"
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <p
            style={{
              fontFamily: "'Noto Sans Bengali', sans-serif",
              fontSize: "0.88rem",
              color: "rgba(250,246,239,0.72)",
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: "#E8C97A", fontWeight: 700 }}>
              বিশেষ দ্রষ্টব্য:
            </strong>{" "}
            "আমিও লিখবো বাস্তবতা" ট্যাবে আপনার অ্যাকাউন্টের কোনো মালিকানা বা
            নিয়ন্ত্রণ আমার কাছে থাকবে না — আপনার অ্যাকাউন্ট সম্পূর্ণ আপনার।
            টেম্প নাম্বার ও টেম্প কার্ড শুধুমাত্র পরীক্ষামূলক কাজে ব্যবহার
            করুন; ব্যক্তিগত বা গুরুত্বপূর্ণ কাজে এগুলো ব্যবহার না করাই ভালো।
          </p>
        </motion.div>
      </div>

      {/* ── Responsive CSS ─────────────────────────────────────────────── */}
      <style>{`
        .rules-tab-link {
          display: block;
          text-decoration: none;
          color: inherit;
          height: 100%;
        }
        .rules-tabs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .rules-tab-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.3rem 1.4rem;
          background: linear-gradient(145deg, rgba(18,24,34,0.55), rgba(8,12,18,0.7));
          border: 1px solid rgba(201,168,76,0.1);
          border-radius: 16px;
          transition: background 0.28s ease, border-color 0.28s ease, transform 0.28s ease, box-shadow 0.28s ease;
          cursor: pointer;
          height: 100%;
        }
        .rules-tab-link:hover .rules-tab-card {
          background: linear-gradient(145deg, rgba(201,168,76,0.08), rgba(8,12,18,0.75));
          border-color: rgba(201,168,76,0.28);
          transform: translateY(-4px);
          box-shadow: 0 14px 36px rgba(0,0,0,0.35), 0 0 22px rgba(201,168,76,0.07);
        }
        .rules-tab-link:focus-visible .rules-tab-card {
          outline: 2px solid rgba(201,168,76,0.5);
          outline-offset: 2px;
        }
        .rules-tab-icon-wrap {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(201,168,76,0.18), rgba(201,168,76,0.06));
          border: 1px solid rgba(201,168,76,0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #E8C97A;
          box-shadow: 0 4px 14px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06);
          transition: box-shadow 0.28s ease, transform 0.28s ease;
        }
        .rules-tab-link:hover .rules-tab-icon-wrap {
          box-shadow: 0 6px 18px rgba(0,0,0,0.28), 0 0 16px rgba(201,168,76,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
          transform: scale(1.07);
        }
        .rules-arrow-icon {
          color: rgba(201,168,76,0.35);
          flex-shrink: 0;
          transition: color 0.25s ease, transform 0.25s ease;
        }
        .rules-tab-link:hover .rules-arrow-icon {
          color: rgba(201,168,76,0.85);
          transform: translate(2px, -2px);
        }
        @media (max-width: 768px) {
          .rules-tabs-grid {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }
          .rules-tab-card {
            padding: 1.1rem 1.15rem;
          }
        }
        @media (max-width: 480px) {
          .rules-tab-card {
            padding: 1rem;
            border-radius: 14px;
          }
          .rules-tab-icon-wrap {
            width: 40px;
            height: 40px;
            border-radius: 10px;
          }
        }
      `}</style>
    </section>
  );
}
