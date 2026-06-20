/**
 * SplashScreen — বিশ্বমানের Intro / Splash Screen
 * Design: "Ink & Gold" Cinematic Literary Experience
 * Shows ONLY on first visit (tracked via localStorage)
 * Author: Mahbub Sardar Sabuj — Official Website
 *
 * Features:
 *  • Cinematic particle field (gold dust floating)
 *  • Typewriter poem reveal with cursor blink
 *  • Author portrait with orbital ring animation
 *  • Shimmer gold name reveal
 *  • Ink-drop radial wipe exit transition
 *  • Accessible: respects prefers-reduced-motion
 *  • Skip button for returning users
 *  • localStorage first-visit gate
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = "mss_splash_seen_v2";
const PROFILE_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663480075829/4WFGjMEZtwqeRWz2WqHMm4/profile_db5ff5d6.jpeg";

// The poem lines shown in the typewriter reveal
const POEM_LINES = [
  "শব্দ দিয়ে গড়া এক জগৎ আছে,",
  "যেখানে প্রতিটি লাইন একটি জীবন।",
];

const AUTHOR_NAME = "মাহবুব সরদার সবুজ";
const AUTHOR_TITLE = "লেখক ও কবি";
const TAGLINE = "বাংলা সাহিত্যের এক নিবেদিত কণ্ঠস্বর";

// ── Particle config ───────────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  drift: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2.5,
    duration: 3 + Math.random() * 5,
    delay: Math.random() * 4,
    opacity: 0.3 + Math.random() * 0.6,
    drift: (Math.random() - 0.5) * 60,
  }));
}

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(
  lines: string[],
  charDelay = 38,
  lineDelay = 500,
  startDelay = 1600
) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (currentLine >= lines.length) {
      setDone(true);
      return;
    }

    const line = lines[currentLine];

    if (currentChar === 0 && currentLine === 0) {
      // First character of first line — wait for startDelay
      const t = setTimeout(() => {
        setDisplayedLines([""]); // init first line
        setCurrentChar(1);
      }, startDelay);
      return () => clearTimeout(t);
    }

    if (currentChar <= line.length) {
      const t = setTimeout(() => {
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[currentLine] = line.slice(0, currentChar);
          return next;
        });
        setCurrentChar((c) => c + 1);
      }, charDelay);
      return () => clearTimeout(t);
    } else {
      // Line complete — move to next
      const t = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
        setDisplayedLines((prev) => [...prev, ""]);
      }, lineDelay);
      return () => clearTimeout(t);
    }
  }, [currentChar, currentLine, lines, charDelay, lineDelay, startDelay]);

  return { displayedLines, done };
}

// ── Main Component ────────────────────────────────────────────────────────────
interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<
    "enter" | "poem" | "name" | "exit" | "done"
  >("enter");
  const [particles] = useState(() => generateParticles(28));
  const [skipVisible, setSkipVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const prefersReducedMotion = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  const { displayedLines, done: poemDone } = useTypewriter(
    POEM_LINES,
    prefersReducedMotion.current ? 0 : 40,
    prefersReducedMotion.current ? 0 : 480,
    prefersReducedMotion.current ? 0 : 1500
  );

  // Show skip button after 1.2s
  useEffect(() => {
    const t = setTimeout(() => setSkipVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // After poem done, show name & CTA
  useEffect(() => {
    if (!poemDone) return;
    const t1 = setTimeout(() => setNameVisible(true), 300);
    const t2 = setTimeout(() => setTaglineVisible(true), 800);
    const t3 = setTimeout(() => setCtaVisible(true), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [poemDone]);

  // Auto-exit after CTA appears (6s total from CTA visible)
  useEffect(() => {
    if (!ctaVisible) return;
    const t = setTimeout(() => handleExit(), 5000);
    return () => clearTimeout(t);
  }, [ctaVisible]);

  const handleExit = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      setPhase("done");
      localStorage.setItem(STORAGE_KEY, "1");
      onComplete();
    }, prefersReducedMotion.current ? 50 : 900);
  }, [exiting, onComplete, prefersReducedMotion]);

  if (phase === "done") return null;

  return (
    <div
      id="mss-splash"
      aria-label="স্বাগতম — মাহবুব সরদার সবুজের ওয়েবসাইটে প্রবেশ করছেন"
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#03050d",
        opacity: exiting ? 0 : 1,
        transition: exiting
          ? "opacity 0.85s cubic-bezier(.4,0,.2,1)"
          : "opacity 0.5s ease",
        willChange: "opacity",
      }}
    >
      {/* ── Background gradient layers ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 90% 55% at 50% 105%, rgba(201,168,76,0.10) 0%, transparent 65%),
            radial-gradient(ellipse 55% 35% at 18% 15%, rgba(201,168,76,0.06) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 82% 10%, rgba(79,140,210,0.07) 0%, transparent 50%),
            linear-gradient(180deg, #03050d 0%, #060b18 55%, #03050d 100%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* ── Subtle grid texture ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)",
          pointerEvents: "none",
        }}
      />

      {/* ── Floating gold particles ── */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              bottom: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: `rgba(201,168,76,${p.opacity})`,
              animation: prefersReducedMotion.current
                ? "none"
                : `splashParticle ${p.duration}s ${p.delay}s linear infinite`,
              boxShadow: p.size > 2 ? `0 0 ${p.size * 3}px rgba(201,168,76,0.4)` : "none",
            }}
          />
        ))}
      </div>

      {/* ── Large calligraphy watermark ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-60px",
          right: "-30px",
          fontFamily: "'AdorshoLipi', sans-serif",
          fontSize: "clamp(180px, 38vw, 320px)",
          color: "rgba(201,168,76,0.022)",
          fontWeight: 700,
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
          letterSpacing: "-0.05em",
        }}
      >
        ম
      </div>

      {/* ── Decorative horizontal lines ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.08) 20%, rgba(201,168,76,0.18) 50%, rgba(201,168,76,0.08) 80%, transparent 100%)",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          animation: prefersReducedMotion.current
            ? "none"
            : "splashLineReveal 1.2s cubic-bezier(.22,1,.36,1) 0.3s both",
        }}
      />

      {/* ── Main content wrapper ── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 480,
          padding: "0 28px",
          gap: 0,
        }}
      >
        {/* Author portrait */}
        <div
          style={{
            position: "relative",
            marginBottom: 32,
            animation: prefersReducedMotion.current
              ? "none"
              : "splashFadeUp 0.9s cubic-bezier(.22,1,.36,1) 0.1s both",
          }}
        >
          {/* Outer dashed orbit */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: -18,
              borderRadius: "50%",
              border: "1px dashed rgba(201,168,76,0.14)",
              animation: prefersReducedMotion.current
                ? "none"
                : "splashRotateCCW 22s linear infinite",
            }}
          />
          {/* Inner glow ring */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: -7,
              borderRadius: "50%",
              border: "1.5px solid rgba(201,168,76,0.32)",
              animation: prefersReducedMotion.current
                ? "none"
                : "splashRotateCW 14s linear infinite, splashGlow 2.8s ease-in-out infinite",
            }}
          />
          {/* Orbit dot */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -18,
              left: "50%",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#C9A84C",
              boxShadow: "0 0 10px rgba(201,168,76,0.8)",
              transform: "translateX(-50%)",
              animation: prefersReducedMotion.current
                ? "none"
                : "splashOrbitDot 14s linear infinite",
              transformOrigin: "3px 89px",
            }}
          />
          {/* Portrait */}
          <img
            src={PROFILE_IMG}
            alt="মাহবুব সরদার সবুজ"
            width={108}
            height={108}
            style={{
              width: 108,
              height: 108,
              borderRadius: "50%",
              objectFit: "cover",
              objectPosition: "top center",
              border: "2.5px solid rgba(201,168,76,0.55)",
              display: "block",
              filter: "contrast(1.06) saturate(0.9) brightness(1.02)",
              animation: prefersReducedMotion.current
                ? "none"
                : "splashImgReveal 0.9s cubic-bezier(.22,1,.36,1) 0.25s both",
            }}
          />
          {/* Online indicator */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 5,
              right: 5,
              width: 13,
              height: 13,
              borderRadius: "50%",
              background: "#C9A84C",
              border: "2.5px solid #03050d",
              animation: prefersReducedMotion.current
                ? "none"
                : "splashPulse 2s ease-in-out infinite",
            }}
          />
        </div>

        {/* Poem typewriter section */}
        <div
          style={{
            minHeight: 72,
            marginBottom: 28,
            textAlign: "center",
            width: "100%",
          }}
        >
          {displayedLines.map((line, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'AdorshoLipi', sans-serif",
                fontSize: "clamp(1rem, 3.5vw, 1.18rem)",
                color: "rgba(243,234,219,0.78)",
                lineHeight: 1.75,
                margin: "0 0 4px 0",
                letterSpacing: "0.01em",
                fontStyle: "italic",
              }}
            >
              {line}
              {/* Blinking cursor on last active line */}
              {i === displayedLines.length - 1 && !poemDone && (
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: "1em",
                    background: "#C9A84C",
                    marginLeft: 3,
                    verticalAlign: "text-bottom",
                    animation: "splashCursorBlink 0.75s step-end infinite",
                  }}
                />
              )}
            </p>
          ))}
        </div>

        {/* Gold divider line */}
        <div
          aria-hidden="true"
          style={{
            width: nameVisible ? 180 : 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(201,168,76,0.7), transparent)",
            marginBottom: 18,
            transition: prefersReducedMotion.current
              ? "none"
              : "width 0.7s cubic-bezier(.22,1,.36,1)",
          }}
        />

        {/* Author name */}
        <div
          style={{
            fontFamily: "'AdorshoLipi', sans-serif",
            fontSize: "clamp(1.5rem, 5.5vw, 2rem)",
            fontWeight: 700,
            letterSpacing: "0.04em",
            background:
              "linear-gradient(135deg, #e8d5a0 0%, #C9A84C 30%, #f0e0a0 52%, #C9A84C 72%, #b8943c 100%)",
            backgroundSize: "300% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textAlign: "center",
            marginBottom: 8,
            opacity: nameVisible ? 1 : 0,
            transform: nameVisible ? "translateY(0)" : "translateY(14px)",
            transition: prefersReducedMotion.current
              ? "none"
              : "opacity 0.7s ease, transform 0.7s cubic-bezier(.22,1,.36,1)",
            animation:
              nameVisible && !prefersReducedMotion.current
                ? "splashShimmer 3.5s linear 0.5s infinite"
                : "none",
          }}
        >
          {AUTHOR_NAME}
        </div>

        {/* Author title badge */}
        <div
          style={{
            fontFamily: "'AdorshoLipi', sans-serif",
            fontSize: "0.78rem",
            letterSpacing: "0.18em",
            color: "rgba(243,234,219,0.42)",
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: 36,
            opacity: taglineVisible ? 1 : 0,
            transform: taglineVisible ? "translateY(0)" : "translateY(10px)",
            transition: prefersReducedMotion.current
              ? "none"
              : "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          {AUTHOR_TITLE}
        </div>

        {/* Enter CTA button */}
        <button
          onClick={handleExit}
          aria-label="ওয়েবসাইটে প্রবেশ করুন"
          style={{
            fontFamily: "'AdorshoLipi', sans-serif",
            fontSize: "0.92rem",
            letterSpacing: "0.08em",
            color: "#03050d",
            background:
              "linear-gradient(135deg, #e8d5a0 0%, #C9A84C 40%, #d4a840 100%)",
            border: "none",
            borderRadius: 999,
            padding: "12px 36px",
            cursor: "pointer",
            fontWeight: 700,
            boxShadow:
              "0 0 30px rgba(201,168,76,0.25), 0 4px 20px rgba(0,0,0,0.4)",
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.94)",
            transition: prefersReducedMotion.current
              ? "none"
              : "opacity 0.6s ease, transform 0.6s cubic-bezier(.22,1,.36,1), box-shadow 0.2s ease",
            WebkitTapHighlightColor: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 50px rgba(201,168,76,0.45), 0 6px 28px rgba(0,0,0,0.5)";
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-2px) scale(1.03)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 30px rgba(201,168,76,0.25), 0 4px 20px rgba(0,0,0,0.4)";
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(0) scale(1)";
          }}
        >
          ওয়েবসাইটে প্রবেশ করুন
        </button>
      </div>

      {/* ── Bottom tagline ── */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "'AdorshoLipi', sans-serif",
          fontSize: "0.7rem",
          letterSpacing: "0.07em",
          color: "rgba(243,234,219,0.16)",
          animation: prefersReducedMotion.current
            ? "none"
            : "splashFadeUp 1s ease 2.2s both",
        }}
      >
        {TAGLINE}
      </div>

      {/* ── Skip button ── */}
      <button
        onClick={handleExit}
        aria-label="স্প্ল্যাশ স্ক্রিন এড়িয়ে যান"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          fontFamily: "'AdorshoLipi', sans-serif",
          fontSize: "0.75rem",
          letterSpacing: "0.06em",
          color: "rgba(243,234,219,0.35)",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 999,
          padding: "6px 16px",
          cursor: "pointer",
          opacity: skipVisible ? 1 : 0,
          transition: "opacity 0.4s ease, color 0.2s ease, background 0.2s ease",
          WebkitTapHighlightColor: "transparent",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color =
            "rgba(243,234,219,0.7)";
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(255,255,255,0.1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color =
            "rgba(243,234,219,0.35)";
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(255,255,255,0.05)";
        }}
      >
        এড়িয়ে যান ✕
      </button>

      {/* ── Keyframe animations (injected via style tag) ── */}
      <style>{`
        @keyframes splashParticle {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: var(--op, 0.6); }
          50%  { transform: translateY(-60px) translateX(var(--drift, 20px)) scale(0.7); opacity: 0.9; }
          100% { transform: translateY(-130px) translateX(calc(var(--drift, 20px) * 1.5)) scale(0); opacity: 0; }
        }
        @keyframes splashFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashImgReveal {
          from { clip-path: inset(0 100% 0 0); opacity: 0; }
          to   { clip-path: inset(0 0% 0 0); opacity: 1; }
        }
        @keyframes splashRotateCW  { to { transform: rotate(360deg); } }
        @keyframes splashRotateCCW { to { transform: rotate(-360deg); } }
        @keyframes splashOrbitDot  { to { transform: translateX(-50%) rotate(360deg); } }
        @keyframes splashGlow {
          0%,100% { box-shadow: 0 0 20px rgba(201,168,76,0.15), 0 0 40px rgba(201,168,76,0.06); }
          50%     { box-shadow: 0 0 40px rgba(201,168,76,0.32), 0 0 80px rgba(201,168,76,0.14); }
        }
        @keyframes splashPulse {
          0%,100% { opacity: 0.7; transform: scale(1); }
          50%     { opacity: 1;   transform: scale(1.15); }
        }
        @keyframes splashShimmer {
          0%   { background-position: -300px 0; }
          100% { background-position: 300px 0; }
        }
        @keyframes splashCursorBlink {
          0%,100% { opacity: 1; }
          50%     { opacity: 0; }
        }
        @keyframes splashLineReveal {
          from { opacity: 0; transform: translateY(-50%) scaleX(0); }
          to   { opacity: 1; transform: translateY(-50%) scaleX(1); }
        }
      `}</style>
    </div>
  );
}

// ── Helper: should show splash? ───────────────────────────────────────────────
export function shouldShowSplash(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(STORAGE_KEY);
}
