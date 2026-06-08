/**
 * ReadingProgressBar — Global scroll progress indicator
 * Shows a thin golden bar at the very top of the page as user scrolls
 * Only visible when page has enough content to scroll
 */
import { useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const springProgress = useSpring(progress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setVisible(false);
        return;
      }
      const pct = Math.min(100, (scrollTop / docHeight) * 100);
      setProgress(pct);
      setVisible(scrollTop > 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      {/* Track */}
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(201,168,76,0.08)",
      }} />
      {/* Progress fill */}
      <motion.div
        style={{
          position: "absolute",
          top: 0, left: 0, bottom: 0,
          width: springProgress.get() + "%",
          background: "linear-gradient(90deg, #8A5E10 0%, #C9A84C 30%, #F5E4A0 60%, #E8C97A 80%, #C9A84C 100%)",
          backgroundSize: "200% 100%",
          boxShadow: "0 0 12px rgba(201,168,76,0.6), 0 0 4px rgba(201,168,76,0.9)",
          borderRadius: "0 2px 2px 0",
          animation: "progressShimmer 2s linear infinite",
        }}
      />
      <style>{`
        @keyframes progressShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </motion.div>
  );
}
