import { motion } from "framer-motion";
import { Facebook, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { facebookPageUrl, facebookRecitations } from "@/data/facebookRecitations";

export default function FacebookRecitations() {
  const recitationsJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "name": "Facebook আবৃত্তি | মাহবুব সরদার সবুজ",
        "url": "https://www.mahbubsardarsabuj.com/facebook-recitations",
        "inLanguage": "bn-BD",
        "description": "মাহবুব সরদার সবুজের Facebook আবৃত্তির সংগ্রহ, যেখানে নির্বাচিত আবৃত্তির ভিডিও লিংক একসাথে পাওয়া যাবে।"
      },
      {
        "@type": "Person",
        "name": "Mahbub Sardar Sabuj",
        "alternateName": "মাহবুব সরদার সবুজ",
        "url": "https://www.mahbubsardarsabuj.com/"
      }
    ]
  };

  return (
    <div style={{ background: "#FDF6EC", minHeight: "100vh", overflowX: "hidden" }}>
      <Seo
        title="Facebook আবৃত্তি | মাহবুব সরদার সবুজ"
        description="মাহবুব সরদার সবুজের Facebook আবৃত্তির নির্বাচিত সংগ্রহ। এই পেজে আবৃত্তির ভিডিওগুলো একসাথে দেখা ও খোলা যাবে।"
        path="/facebook-recitations"
        keywords="মাহবুব সরদার সবুজ আবৃত্তি, Mahbub Sardar Sabuj recitation, Facebook আবৃত্তি, বাংলা আবৃত্তি"
        jsonLd={recitationsJsonLd}
      />
      <Navbar />

      <section
        style={{
          padding: "7.5rem 0 5rem",
          background: "linear-gradient(180deg, #F7F1E7 0%, #EFE5D5 100%)",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.75rem" }}>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "#1877F2",
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "0.75rem",
              }}
            >
              Facebook
            </span>
            <h1
              style={{
                fontFamily: "'Tiro Bangla', serif",
                color: "#0D1B2A",
                fontSize: "clamp(2.1rem, 4vw, 3rem)",
                fontWeight: 400,
                marginBottom: "1rem",
                lineHeight: 1.35,
              }}
            >
              আবৃত্তি
            </h1>
            <div
              style={{
                width: 72,
                height: 3,
                background: "linear-gradient(90deg, #1877F2 0%, #D4A843 100%)",
                margin: "0 auto 1.2rem",
                borderRadius: 999,
              }}
            />
            <motion.a
              href={facebookPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "0.9rem 1.2rem",
                background: "#1877F2",
                color: "#FFFFFF",
                textDecoration: "none",
                borderRadius: 999,
                fontFamily: "'Noto Sans Bengali', sans-serif",
                fontSize: "0.95rem",
                fontWeight: 700,
                boxShadow: "0 14px 28px rgba(24,119,242,0.22)",
              }}
            >
              <Facebook size={18} /> Facebook পেইজ <ExternalLink size={15} />
            </motion.a>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.35rem",
            }}
          >
            {facebookRecitations.map((video, index) => (
              <motion.a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -8, boxShadow: "0 24px 48px rgba(13,27,42,0.16)" }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.88)",
                  borderRadius: 22,
                  overflow: "hidden",
                  border: "1px solid rgba(13,27,42,0.08)",
                  boxShadow: "0 10px 28px rgba(13,27,42,0.08)",
                  height: "100%",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "4 / 5",
                    overflow: "hidden",
                    background: "#0D1B2A",
                  }}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.02)" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, rgba(13,27,42,0.04) 0%, rgba(13,27,42,0.24) 48%, rgba(13,27,42,0.92) 100%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(255,255,255,0.14)",
                      backdropFilter: "blur(10px)",
                      color: "#FFFFFF",
                      borderRadius: 999,
                      padding: "7px 11px",
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                    }}
                  >
                    <Facebook size={13} /> আবৃত্তি
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      right: 14,
                      top: 14,
                      minWidth: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: "rgba(24,119,242,0.9)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "0.84rem",
                      fontWeight: 700,
                      boxShadow: "0 10px 20px rgba(24,119,242,0.24)",
                    }}
                  >
                    {index + 1}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      left: 16,
                      right: 16,
                      bottom: 16,
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: "'Tiro Bangla', serif",
                        color: "#FFFFFF",
                        fontSize: "1.15rem",
                        fontWeight: 400,
                        lineHeight: 1.55,
                        textShadow: "0 4px 14px rgba(0,0,0,0.28)",
                        margin: 0,
                      }}
                    >
                      {video.title}
                    </h2>
                  </div>
                </div>

                <div style={{ padding: "1.1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#1877F2",
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                    }}
                  >
                    Facebook-এ দেখুন
                  </div>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(24,119,242,0.1)",
                      color: "#1877F2",
                    }}
                  >
                    <ExternalLink size={16} />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
