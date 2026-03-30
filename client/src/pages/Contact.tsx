import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C4A0";
const BG_DARK = "#0A1628";
const TEXT_MAIN = "#FAF6EF";
const TEXT_MUTED = "rgba(250,246,239,0.55)";

const FadeIn = ({ children, delay = 0, direction = "up" }: { children: React.ReactNode; delay?: number; direction?: string }) => {
  const variants = {
    hidden: { opacity: 0, y: direction === "up" ? 30 : direction === "down" ? -30 : 0, x: direction === "left" ? 30 : direction === "right" ? -30 : 0 },
    visible: { opacity: 1, y: 0, x: 0 },
  };
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} variants={variants}>
      {children}
    </motion.div>
  );
};

const socialLinks = [
  {
    name: "Facebook",
    handle: "Lekhok.MahbubSardarSabuj",
    url: "https://facebook.com/Lekhok.MahbubSardarSabuj",
    icon: "f",
    color: "#1877F2",
    bg: "rgba(24,119,242,0.1)",
    border: "rgba(24,119,242,0.25)",
  },
  {
    name: "Instagram",
    handle: "mahbub_sardar_sabuj",
    url: "https://www.instagram.com/mahbub_sardar_sabuj",
    icon: "📸",
    color: "#E1306C",
    bg: "rgba(225,48,108,0.1)",
    border: "rgba(225,48,108,0.25)",
  },
  {
    name: "YouTube",
    handle: "@mahbubsardarsabuj",
    url: "https://youtube.com/@mahbubsardarsabuj",
    icon: "▶",
    color: "#FF0000",
    bg: "rgba(255,0,0,0.1)",
    border: "rgba(255,0,0,0.25)",
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    // Simulate sending (no backend needed — opens mailto)
    await new Promise(r => setTimeout(r, 1200));
    const subject = encodeURIComponent(form.subject || "ওয়েবসাইট থেকে বার্তা");
    const body = encodeURIComponent(`নাম: ${form.name}\nইমেইল: ${form.email}\n\n${form.message}`);
    window.open(`mailto:lekhokmahbubsardarsabuj@gmail.com?subject=${subject}&body=${body}`, "_blank");
    setStatus("sent");
    setTimeout(() => { setStatus("idle"); setForm({ name: "", email: "", subject: "", message: "" }); }, 4000);
  };

  return (
    <div style={{ background: `linear-gradient(180deg, ${BG_DARK} 0%, #0d1f35 50%, ${BG_DARK} 100%)`, minHeight: "100vh" }}>
      <Seo
        title="যোগাযোগ | মাহবুব সরদার সবুজ"
        description="লেখক মাহবুব সরদার সবুজ-এর সঙ্গে যোগাযোগের জন্য ইমেইল, সামাজিক মাধ্যম এবং বার্তা পাঠানোর ফর্ম।"
        path="/contact"
        keywords="মাহবুব সরদার সবুজ যোগাযোগ, Mahbub Sardar Sabuj contact, বাংলা লেখক যোগাযোগ"
      />
      <Navbar />

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 80, position: "relative", overflow: "hidden" }}>
        {/* Background decoration */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(201,168,76,0.07) 1px, transparent 1px)", backgroundSize: "30px 30px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 700, height: 350, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(201,168,76,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 2rem", textAlign: "center" }}>
          <FadeIn direction="up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: "1.5rem",
              background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: 50, padding: "6px 20px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: GOLD, display: "inline-block", boxShadow: `0 0 8px ${GOLD}` }} />
              <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: GOLD, fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>যোগাযোগ</span>
            </div>
            <h1 style={{ fontFamily: "'Tiro Bangla', serif", color: TEXT_MAIN, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 400, marginBottom: "1.2rem", lineHeight: 1.3 }}>
              কথা বলুন{" "}
              <span style={{ color: GOLD, textShadow: `0 0 30px rgba(201,168,76,0.4)` }}>আমার সাথে</span>
            </h1>
            <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: TEXT_MUTED, fontSize: "1.05rem", maxWidth: 580, margin: "0 auto", lineHeight: 2 }}>
              পাঠকদের সাথে কথা বলতে আমি সবসময় আগ্রহী। ইমেইল করুন, সামাজিক মাধ্যমে মেসেজ পাঠান, অথবা নিচের ফর্ম ব্যবহার করুন।
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Main content */}
      <section style={{ paddingBottom: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "3rem", alignItems: "start" }} className="hero-grid">

            {/* Left: contact info */}
            <div>
              {/* Email card */}
              <FadeIn direction="left" delay={0.1}>
                <motion.a
                  href="mailto:lekhokmahbubsardarsabuj@gmail.com"
                  whileHover={{ y: -4, boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}
                  style={{
                    display: "flex", alignItems: "center", gap: "1.2rem",
                    background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)",
                    borderRadius: 20, padding: "1.5rem", marginBottom: "1rem",
                    textDecoration: "none", cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>✉️</div>
                  <div>
                    <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: TEXT_MUTED, fontSize: "0.75rem", marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>ইমেইল</div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: TEXT_MAIN, fontSize: "0.9rem", fontWeight: 500 }}>lekhokmahbubsardarsabuj@gmail.com</div>
                  </div>
                  <div style={{ marginLeft: "auto", color: GOLD, fontSize: "1.2rem" }}>→</div>
                </motion.a>
              </FadeIn>

              {/* Location card */}
              <FadeIn direction="left" delay={0.15}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "1.2rem",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 20, padding: "1.5rem", marginBottom: "1rem",
                }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>📍</div>
                  <div>
                    <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: TEXT_MUTED, fontSize: "0.75rem", marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>অবস্থান</div>
                    <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: TEXT_MAIN, fontSize: "0.95rem" }}>কুমিল্লা, বাংলাদেশ</div>
                  </div>
                </div>
              </FadeIn>

              {/* Social links */}
              <FadeIn direction="left" delay={0.2}>
                <div style={{ marginTop: "2rem" }}>
                  <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: TEXT_MUTED, fontSize: "0.78rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>সামাজিক মাধ্যম</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                    {socialLinks.map((s, i) => (
                      <FadeIn key={i} delay={0.25 + i * 0.07} direction="left">
                        <motion.a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ x: 6, boxShadow: `0 10px 30px rgba(0,0,0,0.3)` }}
                          style={{
                            display: "flex", alignItems: "center", gap: "1rem",
                            background: s.bg, border: `1px solid ${s.border}`,
                            borderRadius: 16, padding: "1rem 1.2rem",
                            textDecoration: "none", cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: `rgba(${s.name === "Facebook" ? "24,119,242" : s.name === "Instagram" ? "225,48,108" : "255,0,0"},0.15)`, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: s.name === "Facebook" ? "1.1rem" : "1rem", fontWeight: 700, color: s.color, flexShrink: 0 }}>{s.icon}</div>
                          <div>
                            <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: s.color, fontSize: "0.82rem", fontWeight: 600, marginBottom: 2 }}>{s.name}</div>
                            <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: TEXT_MUTED, fontSize: "0.8rem" }}>{s.handle}</div>
                          </div>
                          <div style={{ marginLeft: "auto", color: s.color, opacity: 0.7 }}>→</div>
                        </motion.a>
                      </FadeIn>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* Quote */}
              <FadeIn direction="left" delay={0.4}>
                <div style={{ marginTop: "2.5rem", padding: "1.5rem 2rem", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 20, borderLeft: `3px solid ${GOLD}` }}>
                  <p style={{ fontFamily: "'Tiro Bangla', serif", color: GOLD, fontSize: "1rem", lineHeight: 1.9, margin: 0, fontStyle: "italic" }}>
                    "পাঠকের ভালোবাসাই আমার লেখার শক্তি।"
                  </p>
                  <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: TEXT_MUTED, fontSize: "0.78rem", marginTop: 8, marginBottom: 0 }}>— মাহবুব সরদার সবুজ</p>
                </div>
              </FadeIn>
            </div>

            {/* Right: message form */}
            <FadeIn direction="right" delay={0.2}>
              <div style={{
                background: "linear-gradient(145deg, rgba(13,27,42,0.9) 0%, rgba(20,34,54,0.9) 100%)",
                border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: 28,
                padding: "2.5rem",
                boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Top accent */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD_LIGHT}, transparent)` }} />

                <h2 style={{ fontFamily: "'Tiro Bangla', serif", color: TEXT_MAIN, fontSize: "1.6rem", marginBottom: "0.5rem" }}>বার্তা পাঠান</h2>
                <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: TEXT_MUTED, fontSize: "0.88rem", marginBottom: "2rem", lineHeight: 1.8 }}>
                  আপনার বার্তা পাঠান — আমি যত দ্রুত সম্ভব উত্তর দেব।
                </p>

                {status === "sent" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: "center", padding: "3rem 2rem" }}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                    <h3 style={{ fontFamily: "'Tiro Bangla', serif", color: GOLD, fontSize: "1.4rem", marginBottom: "0.8rem" }}>বার্তা পাঠানো হয়েছে!</h3>
                    <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: TEXT_MUTED, fontSize: "0.9rem", lineHeight: 1.8 }}>
                      আপনার ইমেইল অ্যাপ খুলেছে। ধন্যবাদ আপনার বার্তার জন্য।
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    {/* Name + Email row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: TEXT_MUTED, fontSize: "0.8rem", display: "block", marginBottom: 6 }}>আপনার নাম *</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="পুরো নাম"
                          required
                          style={{
                            width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.2)",
                            borderRadius: 12, padding: "12px 16px", color: TEXT_MAIN,
                            fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.9rem",
                            outline: "none", boxSizing: "border-box",
                          }}
                          onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px rgba(201,168,76,0.1)`; }}
                          onBlur={e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; }}
                        />
                      </div>
                      <div>
                        <label style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: TEXT_MUTED, fontSize: "0.8rem", display: "block", marginBottom: 6 }}>ইমেইল *</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="আপনার ইমেইল"
                          required
                          style={{
                            width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.2)",
                            borderRadius: 12, padding: "12px 16px", color: TEXT_MAIN,
                            fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.9rem",
                            outline: "none", boxSizing: "border-box",
                          }}
                          onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px rgba(201,168,76,0.1)`; }}
                          onBlur={e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; }}
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: TEXT_MUTED, fontSize: "0.8rem", display: "block", marginBottom: 6 }}>বিষয়</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        placeholder="বার্তার বিষয় (ঐচ্ছিক)"
                        style={{
                          width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.2)",
                          borderRadius: 12, padding: "12px 16px", color: TEXT_MAIN,
                          fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.9rem",
                          outline: "none", boxSizing: "border-box",
                        }}
                        onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px rgba(201,168,76,0.1)`; }}
                        onBlur={e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; }}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: TEXT_MUTED, fontSize: "0.8rem", display: "block", marginBottom: 6 }}>বার্তা *</label>
                      <textarea
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="আপনার বার্তা লিখুন..."
                        required
                        rows={5}
                        style={{
                          width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.2)",
                          borderRadius: 12, padding: "14px 16px", color: TEXT_MAIN,
                          fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: "0.9rem",
                          outline: "none", resize: "vertical", boxSizing: "border-box",
                          lineHeight: 1.8,
                        }}
                        onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px rgba(201,168,76,0.1)`; }}
                        onBlur={e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; }}
                      />
                    </div>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={status === "sending"}
                      whileHover={status !== "sending" ? { scale: 1.02, boxShadow: "0 20px 50px rgba(201,168,76,0.4)" } : {}}
                      whileTap={status !== "sending" ? { scale: 0.98 } : {}}
                      style={{
                        background: status === "sending" ? "rgba(201,168,76,0.4)" : `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
                        color: "#0A1628", border: "none", borderRadius: 50,
                        padding: "16px 36px", fontFamily: "'Noto Sans Bengali', sans-serif",
                        fontWeight: 700, fontSize: "1rem", cursor: status === "sending" ? "not-allowed" : "pointer",
                        boxShadow: "0 10px 30px rgba(201,168,76,0.25)",
                        transition: "all 0.3s ease",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}
                    >
                      {status === "sending" ? (
                        <>
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block" }}>⟳</motion.span>
                          পাঠানো হচ্ছে...
                        </>
                      ) : (
                        <>✉️ বার্তা পাঠান</>
                      )}
                    </motion.button>

                    <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: TEXT_MUTED, fontSize: "0.75rem", textAlign: "center", margin: 0 }}>
                      * চিহ্নিত ঘরগুলো পূরণ করা আবশ্যক
                    </p>
                  </form>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
