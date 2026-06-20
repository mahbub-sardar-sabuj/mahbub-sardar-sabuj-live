import { motion } from "framer-motion";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

export default function NotFound() {
  return (
    <div style={{ background: "#060E1A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Seo
        title="পেজ পাওয়া যায়নি (404) | মাহবুব সরদার সবুজ"
        description="আপনি যে পেজটি খুঁজছেন তা পাওয়া যায়নি। মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটের হোম পেজে ফিরে যান।"
        path="/404"
        keywords="404, পেজ পাওয়া যায়নি, মাহবুব সরদার সবুজ"
        robots="noindex, follow"
      />
      <Navbar />

      <main style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60vw", height: "60vw",
          maxWidth: 600, maxHeight: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        {/* Dot pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(201,168,76,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: 560,
          }}
        >
          {/* 404 number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'AdorshoLipi', sans-serif",
              fontSize: "clamp(7rem, 20vw, 12rem)",
              fontWeight: 700,
              lineHeight: 1,
              background: "linear-gradient(135deg, #9A6E1A 0%, #C9A84C 30%, #F0D98A 55%, #C9A84C 80%, #9A6E1A 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "0.5rem",
              filter: "drop-shadow(0 0 40px rgba(201,168,76,0.3))",
            }}
          >
            ৪০৪
          </motion.div>

          {/* Divider line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)",
              marginBottom: "2rem",
            }}
          />

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            style={{
              fontFamily: "'AdorshoLipi', sans-serif",
              color: "#FAF6EF",
              fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
              fontWeight: 400,
              marginBottom: "1rem",
              lineHeight: 1.4,
            }}
          >
            পেজটি পাওয়া যায়নি
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            style={{
              fontFamily: "'AdorshoLipi', sans-serif",
              color: "rgba(250,246,239,0.55)",
              fontSize: "1rem",
              lineHeight: 2,
              marginBottom: "2.5rem",
            }}
          >
            আপনি যে পেজটি খুঁজছেন তা সরানো হয়েছে, মুছে ফেলা হয়েছে, অথবা কখনো ছিল না।
            <br />
            হোম পেজে ফিরে যান এবং আবার চেষ্টা করুন।
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link href="/">
              <motion.a
                whileHover={{ scale: 1.04, boxShadow: "0 20px 50px rgba(201,168,76,0.35)" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "linear-gradient(135deg, #C9A84C 0%, #E8C97A 100%)",
                  color: "#060E1A",
                  fontFamily: "'AdorshoLipi', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  padding: "14px 32px",
                  borderRadius: 50,
                  textDecoration: "none",
                  boxShadow: "0 10px 30px rgba(201,168,76,0.2)",
                  cursor: "pointer",
                }}
              >
                🏠 হোম পেজে যান
              </motion.a>
            </Link>

            <Link href="/contact">
              <motion.a
                whileHover={{ scale: 1.04, borderColor: "rgba(201,168,76,0.6)" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "transparent",
                  color: "#C9A84C",
                  fontFamily: "'AdorshoLipi', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  padding: "14px 32px",
                  borderRadius: 50,
                  textDecoration: "none",
                  border: "1px solid rgba(201,168,76,0.3)",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
              >
                ✉️ যোগাযোগ করুন
              </motion.a>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
