import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C97A";
const BG = "#060E1A";
const TEXT = "#FAF6EF";
const MUTED = "rgba(250,246,239,0.55)";

const socialLinks = [
  {
    name: "Facebook",
    handle: "Lekhok.MahbubSardarSabuj",
    url: "https://facebook.com/Lekhok.MahbubSardarSabuj",
    icon: "f",
    color: "#1877F2",
    bg: "rgba(24,119,242,0.08)",
    border: "rgba(24,119,242,0.2)",
  },
  {
    name: "Instagram",
    handle: "mahbub_sardar_sabuj",
    url: "https://www.instagram.com/mahbub_sardar_sabuj",
    icon: "📸",
    color: "#E1306C",
    bg: "rgba(225,48,108,0.08)",
    border: "rgba(225,48,108,0.2)",
  },
  {
    name: "YouTube",
    handle: "@mahbubsardarsabuj",
    url: "https://youtube.com/@mahbubsardarsabuj",
    icon: "▶",
    color: "#FF4444",
    bg: "rgba(255,68,68,0.08)",
    border: "rgba(255,68,68,0.2)",
  },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(201,168,76,0.2)",
  borderRadius: 14,
  padding: "14px 18px",
  color: TEXT,
  fontFamily: "'Noto Sans Bengali', sans-serif",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s",
  WebkitAppearance: "none",
};

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    await new Promise(r => setTimeout(r, 1000));
    const subject = encodeURIComponent(form.subject || "ওয়েবসাইট থেকে বার্তা");
    const body = encodeURIComponent(`নাম: ${form.name}\nইমেইল: ${form.email}\n\n${form.message}`);
    window.open(`mailto:lekhokmahbubsardarsabuj@gmail.com?subject=${subject}&body=${body}`, "_blank");
    setStatus("sent");
    setTimeout(() => {
      setStatus("idle");
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 5000);
  };

  const getFocusStyle = (field: string): React.CSSProperties =>
    focused === field
      ? { ...inputStyle, borderColor: GOLD, boxShadow: `0 0 0 3px rgba(201,168,76,0.12)` }
      : inputStyle;

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .name-email-row { grid-template-columns: 1fr !important; }
          .contact-hero h1 { font-size: 2.2rem !important; }
        }
        input::placeholder, textarea::placeholder { color: rgba(250,246,239,0.3); }
        input:-webkit-autofill, textarea:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px rgba(13,27,42,0.95) inset !important;
          -webkit-text-fill-color: #FAF6EF !important;
        }
      `}</style>

      <div style={{ background: BG, minHeight: "100vh" }}>
        <Seo
          title="যোগাযোগ | মাহবুব সরদার সবুজ"
          description="লেখক মাহবুব সরদার সবুজ-এর সঙ্গে যোগাযোগের জন্য ইমেইল, সামাজিক মাধ্যম এবং বার্তা পাঠানোর ফর্ম।"
          path="/contact"
          keywords="মাহবুব সরদার সবুজ যোগাযোগ, Mahbub Sardar Sabuj contact"
        />
        <Navbar />

        {/* ── HERO ── */}
        <section
          className="contact-hero"
          style={{
            paddingTop: 140,
            paddingBottom: 60,
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
          }}
        >
          {/* Dot pattern */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(rgba(201,168,76,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }} />
          {/* Glow */}
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: 600, height: 300,
            background: "radial-gradient(ellipse, rgba(201,168,76,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "0 1.5rem" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: 50, padding: "6px 20px", marginBottom: "1.5rem",
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: GOLD, display: "inline-block", boxShadow: `0 0 8px ${GOLD}` }} />
                <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: GOLD, fontSize: "0.75rem", letterSpacing: "0.18em" }}>যোগাযোগ</span>
              </div>

              <h1 style={{
                fontFamily: "'Tiro Bangla', serif",
                color: TEXT,
                fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
                fontWeight: 400,
                lineHeight: 1.35,
                marginBottom: "1.2rem",
              }}>
                কথা বলুন{" "}
                <span style={{ color: GOLD, textShadow: `0 0 40px rgba(201,168,76,0.35)` }}>আমার সাথে</span>
              </h1>

              <p style={{
                fontFamily: "'Noto Sans Bengali', sans-serif",
                color: MUTED,
                fontSize: "1rem",
                lineHeight: 2,
                maxWidth: 520,
                margin: "0 auto",
              }}>
                পাঠকদের সাথে কথা বলতে আমি সবসময় আগ্রহী। ইমেইল করুন, সামাজিক মাধ্যমে মেসেজ পাঠান, অথবা নিচের ফর্ম ব্যবহার করুন।
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── MAIN CONTENT ── */}
        <section style={{ padding: "0 0 100px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem" }}>

            {/* Grid: left info + right form */}
            <div
              className="contact-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.45fr",
                gap: "2.5rem",
                alignItems: "start",
              }}
            >

              {/* ── LEFT COLUMN ── */}
              <div>
                {/* Email */}
                <motion.a
                  href="mailto:lekhokmahbubsardarsabuj@gmail.com"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  whileHover={{ y: -3, boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}
                  style={{
                    display: "flex", alignItems: "center", gap: "1rem",
                    background: "rgba(201,168,76,0.06)",
                    border: "1px solid rgba(201,168,76,0.18)",
                    borderRadius: 18, padding: "1.3rem 1.5rem",
                    marginBottom: "1rem", textDecoration: "none",
                    cursor: "pointer", transition: "all 0.3s",
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem",
                  }}>✉️</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: MUTED, fontSize: "0.72rem", marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>ইমেইল</div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: TEXT, fontSize: "0.82rem", fontWeight: 500, wordBreak: "break-all" }}>lekhokmahbubsardarsabuj@gmail.com</div>
                  </div>
                  <div style={{ marginLeft: "auto", color: GOLD, fontSize: "1.1rem", flexShrink: 0 }}>→</div>
                </motion.a>

                {/* Location */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  style={{
                    display: "flex", alignItems: "center", gap: "1rem",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 18, padding: "1.3rem 1.5rem", marginBottom: "2rem",
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem",
                  }}>📍</div>
                  <div>
                    <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: MUTED, fontSize: "0.72rem", marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>অবস্থান</div>
                    <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: TEXT, fontSize: "0.95rem" }}>সৌদি আরব</div>
                  </div>
                </motion.div>

                {/* Social */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: MUTED, fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>সামাজিক মাধ্যম</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {socialLinks.map((s, i) => (
                      <motion.a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.25 + i * 0.07 }}
                        whileHover={{ x: 5, boxShadow: `0 8px 25px rgba(0,0,0,0.3)` }}
                        style={{
                          display: "flex", alignItems: "center", gap: "1rem",
                          background: s.bg, border: `1px solid ${s.border}`,
                          borderRadius: 16, padding: "1rem 1.2rem",
                          textDecoration: "none", cursor: "pointer",
                          transition: "all 0.3s",
                        }}
                      >
                        <div style={{
                          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                          background: `${s.color}18`, border: `1px solid ${s.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: s.name === "Facebook" ? "1rem" : "0.9rem",
                          fontWeight: 700, color: s.color,
                        }}>{s.icon}</div>
                        <div>
                          <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: s.color, fontSize: "0.82rem", fontWeight: 600, marginBottom: 2 }}>{s.name}</div>
                          <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: MUTED, fontSize: "0.78rem" }}>{s.handle}</div>
                        </div>
                        <div style={{ marginLeft: "auto", color: s.color, opacity: 0.7 }}>→</div>
                      </motion.a>
                    ))}
                  </div>
                </motion.div>

                {/* Quote */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  style={{
                    marginTop: "2rem",
                    padding: "1.4rem 1.8rem",
                    background: "rgba(201,168,76,0.05)",
                    border: "1px solid rgba(201,168,76,0.15)",
                    borderLeft: `3px solid ${GOLD}`,
                    borderRadius: 16,
                  }}
                >
                  <p style={{ fontFamily: "'Tiro Bangla', serif", color: GOLD, fontSize: "0.98rem", lineHeight: 1.9, margin: 0, fontStyle: "italic" }}>
                    "পাঠকের ভালোবাসাই আমার লেখার শক্তি।"
                  </p>
                  <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: MUTED, fontSize: "0.78rem", marginTop: 8, marginBottom: 0 }}>— মাহবুব সরদার সবুজ</p>
                </motion.div>
              </div>

              {/* ── RIGHT COLUMN: FORM ── */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                style={{
                  background: "linear-gradient(145deg, rgba(13,27,42,0.95) 0%, rgba(20,34,54,0.95) 100%)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: 28,
                  padding: "clamp(1.5rem, 4vw, 2.5rem)",
                  boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
                  position: "relative",
                  overflow: "hidden",
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* Top gold line */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD_LIGHT}, transparent)`,
                }} />

                <AnimatePresence mode="wait">
                  {status === "sent" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ textAlign: "center", padding: "3rem 1rem" }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                        style={{ fontSize: "3.5rem", marginBottom: "1.2rem" }}
                      >✅</motion.div>
                      <h3 style={{ fontFamily: "'Tiro Bangla', serif", color: GOLD, fontSize: "1.5rem", marginBottom: "0.8rem" }}>বার্তা পাঠানো হয়েছে!</h3>
                      <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: MUTED, fontSize: "0.9rem", lineHeight: 1.9 }}>
                        আপনার ইমেইল অ্যাপ খুলেছে। ধন্যবাদ আপনার বার্তার জন্য — আমি শীঘ্রই উত্তর দেব।
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h2 style={{ fontFamily: "'Tiro Bangla', serif", color: TEXT, fontSize: "1.7rem", marginBottom: "0.4rem" }}>বার্তা পাঠান</h2>
                      <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: MUTED, fontSize: "0.88rem", lineHeight: 1.8, marginBottom: "1.8rem" }}>
                        আপনার বার্তা পাঠান — আমি যত দ্রুত সম্ভব উত্তর দেব।
                      </p>

                      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

                        {/* Name + Email */}
                        <div
                          className="name-email-row"
                          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
                        >
                          <div>
                            <label style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: MUTED, fontSize: "0.78rem", display: "block", marginBottom: 6 }}>আপনার নাম *</label>
                            <input
                              type="text"
                              value={form.name}
                              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                              placeholder="পুরো নাম"
                              required
                              style={getFocusStyle("name")}
                              onFocus={() => setFocused("name")}
                              onBlur={() => setFocused(null)}
                            />
                          </div>
                          <div>
                            <label style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: MUTED, fontSize: "0.78rem", display: "block", marginBottom: 6 }}>ইমেইল *</label>
                            <input
                              type="email"
                              value={form.email}
                              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                              placeholder="your@email.com"
                              required
                              style={getFocusStyle("email")}
                              onFocus={() => setFocused("email")}
                              onBlur={() => setFocused(null)}
                            />
                          </div>
                        </div>

                        {/* Subject */}
                        <div>
                          <label style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: MUTED, fontSize: "0.78rem", display: "block", marginBottom: 6 }}>বিষয় <span style={{ opacity: 0.5 }}>(ঐচ্ছিক)</span></label>
                          <input
                            type="text"
                            value={form.subject}
                            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                            placeholder="বার্তার বিষয়"
                            style={getFocusStyle("subject")}
                            onFocus={() => setFocused("subject")}
                            onBlur={() => setFocused(null)}
                          />
                        </div>

                        {/* Message */}
                        <div>
                          <label style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: MUTED, fontSize: "0.78rem", display: "block", marginBottom: 6 }}>বার্তা *</label>
                          <textarea
                            value={form.message}
                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                            placeholder="আপনার বার্তা লিখুন..."
                            required
                            rows={6}
                            style={{
                              ...getFocusStyle("message"),
                              resize: "vertical",
                              lineHeight: 1.9,
                              minHeight: 130,
                            }}
                            onFocus={() => setFocused("message")}
                            onBlur={() => setFocused(null)}
                          />
                        </div>

                        {/* Submit button */}
                        <motion.button
                          type="submit"
                          disabled={status === "sending"}
                          whileHover={status !== "sending" ? { scale: 1.02, boxShadow: `0 20px 50px rgba(201,168,76,0.35)` } : {}}
                          whileTap={status !== "sending" ? { scale: 0.98 } : {}}
                          style={{
                            background: status === "sending"
                              ? "rgba(201,168,76,0.35)"
                              : `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
                            color: "#060E1A",
                            border: "none",
                            borderRadius: 50,
                            padding: "16px 40px",
                            fontFamily: "'Noto Sans Bengali', sans-serif",
                            fontWeight: 700,
                            fontSize: "1rem",
                            cursor: status === "sending" ? "not-allowed" : "pointer",
                            boxShadow: "0 10px 30px rgba(201,168,76,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            marginTop: "0.3rem",
                            transition: "background 0.3s",
                          }}
                        >
                          {status === "sending" ? (
                            <>
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                style={{ display: "inline-block", fontSize: "1.1rem" }}
                              >⟳</motion.span>
                              পাঠানো হচ্ছে...
                            </>
                          ) : (
                            <>✉️ বার্তা পাঠান</>
                          )}
                        </motion.button>

                        <p style={{ fontFamily: "'Noto Sans Bengali', sans-serif", color: MUTED, fontSize: "0.73rem", textAlign: "center", margin: 0 }}>
                          * চিহ্নিত ঘরগুলো পূরণ করা আবশ্যক
                        </p>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
