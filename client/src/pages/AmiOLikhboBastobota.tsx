import type { CSSProperties, ReactNode } from "react";
import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crown,
  Edit3,
  Eye,
  Film,
  Flag,
  Heart,
  KeyRound,
  Lightbulb,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  Plus,
  RefreshCw,
  Search,
  Send,
  Share2,
  Sparkles,
  ThumbsUp,
  Trash2,
  UserPlus,
  X,
  Frown,
  User,
  Bell,
  Check,
  Users,
  Radio,
  Volume2,
  BarChart3,
  FileClock,
  BookMarked,
} from "lucide-react";
import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import AdSenseAd, { AD_SLOTS } from "@/components/AdSenseAd";
import { trpc } from "@/lib/trpc";
import { getLoginUrl, getSignupUrl, isLoginConfigured } from "@/const";
import LocalAuthModal from "@/components/LocalAuthModal";

const adorshoFont = "'AdorshoLipi', sans-serif";

// ── Styles ────────────────────────────────────────────────────────────────────

const shellStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(ellipse at 15% 10%, rgba(212,168,67,0.22) 0%, transparent 35%), radial-gradient(ellipse at 85% 30%, rgba(81,139,255,0.13) 0%, transparent 35%), radial-gradient(ellipse at 50% 90%, rgba(212,168,67,0.08) 0%, transparent 40%), linear-gradient(180deg, #050B14 0%, #081220 48%, #050A12 100%)",
  color: "#FDF6EC",
  fontFamily: adorshoFont,
};

const glassStyle: CSSProperties = {
  border: "1px solid rgba(232,201,122,0.20)",
  background: "linear-gradient(145deg, rgba(255,255,255,0.085), rgba(255,255,255,0.038))",
  boxShadow: "0 32px 100px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.07)",
  backdropFilter: "blur(16px)",
};

const cardStyle: CSSProperties = {
  border: "1px solid rgba(232,201,122,0.16)",
  background: "linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.045))",
  boxShadow: "0 10px 44px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
  borderRadius: 24,
  willChange: "auto",
};

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "all", label: "সব", icon: <Sparkles size={15} /> },
  { key: "experience", label: "অভিজ্ঞতা", icon: <BookOpen size={15} /> },
  { key: "story", label: "গল্প", icon: <PenLine size={15} /> },
  { key: "poem", label: "কবিতা", icon: <Crown size={15} /> },
  { key: "thought", label: "ভাবনা", icon: <Lightbulb size={15} /> },
  { key: "photo", label: "ছবি", icon: <Camera size={15} /> },
  { key: "video", label: "ভিডিও", icon: <Film size={15} /> },
] as const;

type CategoryKey = "all" | "experience" | "story" | "poem" | "thought" | "photo" | "video";

const REACTION_CONFIG = {
  like: { label: "পছন্দ", icon: <ThumbsUp size={16} />, color: "#60A5FA" },
  love: { label: "ভালোবাসা", icon: <Heart size={16} />, color: "#F472B6" },
  inspiring: { label: "অনুপ্রেরণা", icon: <Lightbulb size={16} />, color: "#FBBF24" },
  sad: { label: "দুঃখ", icon: <Frown size={16} />, color: "#94A3B8" },
} as const;

type ReactionType = keyof typeof REACTION_CONFIG;

type WritingPrompt = {
  title: string;
  description: string;
  category: CategoryKey;
};

const FEATURE_STATS = [
  { label: "লেখার ধরন", value: "৬টি", note: "গল্প, কবিতা, ভাবনা, ছবি" },
  { label: "নিরাপদ প্রকাশ", value: "পর্যালোচনা", note: "অনুমোদনের পর পোস্ট দেখা যায়" },
  { label: "পাঠকের অংশগ্রহণ", value: "রিঅ্যাকশন", note: "পছন্দ, ভালোবাসা ও মন্তব্য" },
] as const;

const WRITING_PROMPTS: WritingPrompt[] = [
  {
    title: "আজকের বাস্তব অভিজ্ঞতা",
    description: "নিজের জীবনের এমন একটি ঘটনা লিখুন, যেটি আপনাকে বদলেছে বা ভাবিয়েছে।",
    category: "experience",
  },
  {
    title: "মানুষ ও সমাজের গল্প",
    description: "গ্রাম, শহর, পরিবার, শ্রম, সম্পর্ক বা মানবতার কোনো সত্য ঘটনা তুলে ধরুন।",
    category: "story",
  },
  {
    title: "একটি ছোট ভাবনা",
    description: "কোনো সমস্যা, শিক্ষা বা সমাধান নিয়ে সংক্ষিপ্ত কিন্তু অর্থবহ লেখা লিখুন।",
    category: "thought",
  },
] as const;

const COMMUNITY_GUIDELINES = [
  "সত্য, সম্মান ও মানবিক ভাষা বজায় রাখুন।",
  "ব্যক্তিগত আক্রমণ, ঘৃণা বা অপমানজনক শব্দ এড়িয়ে চলুন।",
  "নিজের অভিজ্ঞতা হলে তা স্পষ্ট করুন; অন্যের লেখা কপি করবেন না।",
  "ছবি যোগ করলে তা যেন লেখার বিষয়কে সহায়তা করে।",
] as const;

const QUALITY_CHECKLIST = [
  "ঘটনার সময়, স্থান বা প্রেক্ষাপট সংক্ষেপে লিখুন।",
  "সমস্যার সঙ্গে শেখা বা সমাধানের দিকটি যুক্ত করুন।",
  "শিরোনাম দিলে পাঠক দ্রুত লেখার বিষয় বুঝবে।",
] as const;

const FORM_EXAMPLE_TEXT = "উদাহরণ: আজ বাজারে একজন পরিশ্রমী মানুষের সঙ্গে দেখা হলো। তাঁর কথায় বুঝলাম—জীবনের বাস্তবতা শুধু কষ্ট নয়, সাহসও শেখায়...";

// ── Helper components ─────────────────────────────────────────────────────────

function ActionButton({
  href,
  disabled,
  children,
  variant = "primary",
  onClick,
  small,
  type = "button",
}: {
  href?: string;
  disabled?: boolean;
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  onClick?: () => void;
  small?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  const baseStyle: CSSProperties = {
    display: "inline-flex",
    boxSizing: "border-box",
    maxWidth: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: small ? 38 : 48,
    borderRadius: 999,
    padding: small ? "0.5rem 1rem" : "0.75rem 1.25rem",
    border:
      variant === "primary"
        ? "1px solid rgba(255,235,166,0.72)"
        : variant === "danger"
        ? "1px solid rgba(239,68,68,0.4)"
        : "1px solid rgba(232,201,122,0.26)",
    background:
      variant === "primary"
        ? "linear-gradient(135deg, #F7D56F 0%, #D4A843 58%, #B98A24 100%)"
        : variant === "danger"
        ? "rgba(239,68,68,0.12)"
        : "rgba(255,255,255,0.055)",
    color: variant === "primary" ? "#071426" : variant === "danger" ? "#FCA5A5" : "#F7D56F",
    fontFamily: adorshoFont,
    fontWeight: 900,
    fontSize: small ? "0.88rem" : "0.96rem",
    textDecoration: "none",
    boxShadow: variant === "primary" ? "0 12px 30px rgba(212,168,67,0.22)" : "none",
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    pointerEvents: disabled ? "none" : "auto",
    transition: "opacity 0.15s, transform 0.12s",
  };

  if (href && !disabled) {
    return (
      <a href={href} className="amio-action-btn" style={baseStyle}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} disabled={disabled} className="amio-action-btn" style={baseStyle} onClick={onClick}>
      {children}
    </button>
  );
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  // Generate a consistent hue from the name
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, hsl(${hue}, 55%, 42%), hsl(${(hue + 30) % 360}, 50%, 30%))`,
        display: "grid",
        placeItems: "center",
        color: "#fff",
        fontWeight: 900,
        fontSize: size * 0.36,
        fontFamily: adorshoFont,
        flexShrink: 0,
        border: "2px solid rgba(255,255,255,0.18)",
      }}
    >
      {initials || "?"}
    </div>
  );
}

function TimeAgo({ date }: { date: Date | string }) {
  const d = new Date(date);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);

  let label = "";
  if (diff < 60) label = "এইমাত্র";
  else if (diff < 3600) label = `${Math.floor(diff / 60)} মিনিট আগে`;
  else if (diff < 86400) label = `${Math.floor(diff / 3600)} ঘণ্টা আগে`;
  else if (diff < 2592000) label = `${Math.floor(diff / 86400)} দিন আগে`;
  else label = d.toLocaleDateString("bn-BD");

  return <span style={{ color: "rgba(253,246,236,0.48)", fontSize: "0.8rem" }}>{label}</span>;
}

function CategoryBadge({ category }: { category: string }) {
  const cat = CATEGORIES.find((c) => c.key === category);
  if (!cat || cat.key === "all") return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "0.2rem 0.65rem",
        borderRadius: 999,
        background: "linear-gradient(135deg, rgba(212,168,67,0.16), rgba(212,168,67,0.08))",
        border: "1px solid rgba(232,201,122,0.28)",
        color: "#F7D56F",
        fontSize: "0.76rem",
        fontWeight: 700,
        letterSpacing: "0.01em",
      }}
    >
      {cat.icon} {cat.label}
    </span>
  );
}

function MiniMetricCard({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div
      style={{
        padding: "0.8rem",
        borderRadius: 18,
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(232,201,122,0.14)",
        minWidth: 132,
      }}
    >
      <div style={{ color: "#F7D56F", fontSize: "1.05rem", fontWeight: 900 }}>{value}</div>
      <div style={{ color: "#FDF6EC", fontSize: "0.82rem", fontWeight: 800, marginTop: 2 }}>{label}</div>
      <div style={{ color: "rgba(253,246,236,0.48)", fontSize: "0.75rem", lineHeight: 1.45, marginTop: 4 }}>{note}</div>
    </div>
  );
}

function GuidancePanel({ isAuthenticated, onWrite, onLogin }: { isAuthenticated: boolean; onWrite: () => void; onLogin: () => void }) {
  return (
    <section style={{ ...cardStyle, padding: "clamp(1rem, 4vw, 1.5rem)", display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#F7D56F", fontSize: "0.82rem", fontWeight: 900, letterSpacing: "0.02em" }}>লেখা শুরু করার সহজ পথ</div>
          <h2 style={{ margin: "0.25rem 0 0", color: "#FDF6EC", fontSize: "clamp(1.1rem, 3vw, 1.35rem)", lineHeight: 1.35 }}>বাস্তবতা লিখুন স্পষ্টভাবে, মানবিকভাবে, কার্যকরভাবে</h2>
          <p style={{ margin: "0.45rem 0 0", color: "rgba(253,246,236,0.62)", fontSize: "0.9rem", lineHeight: 1.75 }}>
            এই ট্যাবের লক্ষ্য হলো বাস্তব জীবনের অভিজ্ঞতা, সমাজের সত্য গল্প এবং মানুষের ভাবনাকে সুন্দরভাবে প্রকাশ করা। লেখা জমা দিলে তা পর্যালোচনার জন্য পাঠানো হবে; অনুমোদনের পর সবার সামনে প্রকাশিত হবে।
          </p>
        </div>
        <ActionButton onClick={isAuthenticated ? onWrite : onLogin} small>
          {isAuthenticated ? <><Plus size={15} /> এখন লিখুন</> : <><KeyRound size={15} /> লিখতে লগইন</>}
        </ActionButton>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
        {WRITING_PROMPTS.map((prompt) => (
          <button
            key={prompt.title}
            type="button"
            onClick={isAuthenticated ? onWrite : onLogin}
            style={{
              textAlign: "left",
              padding: "0.9rem",
              borderRadius: 18,
              border: "1px solid rgba(232,201,122,0.16)",
              background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025))",
              color: "#FDF6EC",
              fontFamily: adorshoFont,
              cursor: "pointer",
              display: "grid",
              gap: 6,
            }}
          >
            <CategoryBadge category={prompt.category} />
            <span style={{ color: "#F7D56F", fontWeight: 900, fontSize: "0.95rem" }}>{prompt.title}</span>
            <span style={{ color: "rgba(253,246,236,0.58)", lineHeight: 1.65, fontSize: "0.82rem" }}>{prompt.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function WritingQualityBox() {
  return (
    <div
      style={{
        padding: "0.9rem",
        borderRadius: 18,
        background: "rgba(212,168,67,0.09)",
        border: "1px solid rgba(212,168,67,0.22)",
        display: "grid",
        gap: "0.65rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#F7D56F", fontWeight: 900 }}>
        <Lightbulb size={16} /> ভালো লেখার ছোট চেকলিস্ট
      </div>
      <div style={{ display: "grid", gap: "0.45rem" }}>
        {QUALITY_CHECKLIST.map((item) => (
          <div key={item} style={{ display: "flex", gap: 8, color: "rgba(253,246,236,0.66)", fontSize: "0.83rem", lineHeight: 1.65 }}>
            <CheckCircle2 size={14} style={{ color: "#86EFAC", marginTop: 3, flexShrink: 0 }} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyFeedState({ showMyPosts, searchActive, selectedCategory, feedMode, isAuthenticated, onWrite, onLogin, onDiscover }: { showMyPosts: boolean; searchActive: boolean; selectedCategory: CategoryKey; feedMode: "all" | "following" | "trending"; isAuthenticated: boolean; onWrite: () => void; onLogin: () => void; onDiscover: () => void }) {
  const categoryLabel = CATEGORIES.find(c => c.key === selectedCategory)?.label ?? selectedCategory;
  const title = showMyPosts
    ? "আপনার লেখার ঘর এখনো খালি"
    : feedMode === "following"
    ? "এখনো কোনো লেখককে অনুসরণ করছেন না"
    : searchActive
    ? "এই অনুসন্ধানে কোনো লেখা পাওয়া যায়নি"
    : selectedCategory !== "all"
    ? `“${categoryLabel}” বিভাগে প্রথম লেখা হতে পারে আপনারটি`
    : "বাস্তবতার প্রথম লেখা শুরু হোক আপনার হাতেই";
  const description = showMyPosts
    ? "নিজের অভিজ্ঞতা, গল্প বা ভাবনা লিখুন। পোস্ট করলে তা সাথে সাথে পাঠকদের সামনে দেখা যাবে।"
    : feedMode === "following"
    ? "কিছু লেখককে অনুসরণ করলেই তাঁদের নতুন লেখা আলাদা ফিডে দ্রুত দেখতে পাবেন।"
    : searchActive
    ? "অন্য শব্দ দিয়ে খুঁজে দেখুন, অথবা নতুন একটি বাস্তব অভিজ্ঞতা লিখে এই জায়গাটি সমৃদ্ধ করুন।"
    : "একটি সত্য ঘটনা, একটি মানবিক শিক্ষা, অথবা সমাজের কোনো বাস্তব সমস্যার কথা লিখুন। ভালো লেখা অন্য মানুষকে ভাবতে ও শিখতে সাহায্য করে।";

  return (
    <div style={{ ...cardStyle, padding: "clamp(1.5rem, 6vw, 2.25rem)", textAlign: "left", display: "grid", gap: "1.1rem" }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ width: 58, height: 58, borderRadius: 22, display: "grid", placeItems: "center", background: "rgba(212,168,67,0.14)", border: "1px solid rgba(232,201,122,0.28)", color: "#F7D56F" }}>
          {feedMode === "following" ? <Users size={28} /> : <PenLine size={28} />}
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h3 style={{ margin: 0, color: "#FDF6EC", fontSize: "clamp(1.15rem, 4vw, 1.55rem)", lineHeight: 1.35, fontWeight: 900 }}>{title}</h3>
          <p style={{ margin: "0.45rem 0 0", color: "rgba(253,246,236,0.62)", fontSize: "0.92rem", lineHeight: 1.8 }}>{description}</p>
        </div>
      </div>

      {!searchActive && feedMode !== "following" && (
        <div style={{ display: "grid", gap: "0.55rem" }}>
          {WRITING_PROMPTS.map((prompt) => (
            <div key={prompt.title} style={{ padding: "0.75rem 0.85rem", borderRadius: 16, background: "rgba(255,255,255,0.045)", border: "1px solid rgba(232,201,122,0.12)", display: "grid", gap: 4 }}>
              <div style={{ color: "#F7D56F", fontWeight: 900, fontSize: "0.88rem" }}>{prompt.title}</div>
              <div style={{ color: "rgba(253,246,236,0.54)", fontSize: "0.8rem", lineHeight: 1.6 }}>{prompt.description}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {feedMode === "following" ? (
          <ActionButton onClick={onDiscover} small>
            <Users size={15} /> লেখক খুঁজুন
          </ActionButton>
        ) : isAuthenticated ? (
          <ActionButton onClick={onWrite} small>
            <Plus size={15} /> প্রথম লেখা লিখুন
          </ActionButton>
        ) : (
          <ActionButton onClick={onLogin} small>
            <KeyRound size={15} /> লগইন করে লিখুন
          </ActionButton>
        )}
        {searchActive && (
          <span style={{ alignSelf: "center", color: "rgba(253,246,236,0.45)", fontSize: "0.84rem" }}>বানান বা শব্দ বদলে আবার খুঁজে দেখুন।</span>
        )}
      </div>
    </div>
  );
}

// ── Reaction Bar ──────────────────────────────────────────────────────────────

function ReactionBar({
  postId,
  reactionCounts,
  myReaction,
  isAuthenticated,
  onLoginRequired,
  postSlug,
}: {
  postId: number;
  reactionCounts: Record<ReactionType, number>;
  myReaction: ReactionType | null;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
  postSlug?: string;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const utils = trpc.useUtils();
  const reactMutation = trpc.writingPlatform.reactToPost.useMutation({
    onSuccess: () => {
      if (postSlug) utils.writingPlatform.getPostBySlug.invalidate({ slug: postSlug });
      else {
        utils.writingPlatform.listPosts.invalidate();
        utils.writingPlatform.listPostsPaginated.invalidate();
      }
    },
  });

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

  function handleReact(type: ReactionType) {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }
    reactMutation.mutate({ postId, type });
    setShowPicker(false);
  }

  const activeReaction = myReaction ? REACTION_CONFIG[myReaction] : null;

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Main reaction button */}
        <button
          type="button"
          className="amio-action-btn"
          onClick={() => setShowPicker((p) => !p)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "0.45rem 0.9rem",
            borderRadius: 999,
            border: activeReaction
              ? `1px solid ${activeReaction.color}55`
              : "1px solid rgba(232,201,122,0.2)",
            background: activeReaction ? `${activeReaction.color}18` : "rgba(255,255,255,0.05)",
            color: activeReaction ? activeReaction.color : "rgba(253,246,236,0.65)",
            fontFamily: adorshoFont,
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {activeReaction ? activeReaction.icon : <ThumbsUp size={15} />}
          {activeReaction ? activeReaction.label : "পছন্দ"}
        </button>

        {/* Reaction count summary */}
        {totalReactions > 0 && (
          <span style={{ color: "rgba(253,246,236,0.5)", fontSize: "0.82rem" }}>
            {totalReactions} জন
          </span>
        )}
      </div>

      {/* Reaction picker popup */}
      {showPicker && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            display: "flex",
            gap: 6,
            padding: "0.5rem 0.65rem",
            borderRadius: 20,
            background: "rgba(7,20,38,0.95)",
            border: "1px solid rgba(232,201,122,0.28)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
            zIndex: 10,
            animation: "slideDown 0.2s ease",
          }}
        >
          {(Object.entries(REACTION_CONFIG) as [ReactionType, typeof REACTION_CONFIG[ReactionType]][]).map(
            ([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleReact(key)}
                title={cfg.label}
                className={`amio-reaction-btn${myReaction === key ? " reacted" : ""}`}
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  border: myReaction === key ? `1px solid ${cfg.color}77` : "1px solid rgba(255,255,255,0.08)",
                  background: myReaction === key ? `${cfg.color}30` : "rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  fontSize: "1.35rem",
                  boxShadow: myReaction === key ? `0 0 12px ${cfg.color}30` : "none",
                }}
              >
                {cfg.icon}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ── Reader tools: save, meaningful feedback and safety reports ───────────────
const FEEDBACK_OPTIONS = [
  { key: "meaningful", label: "অর্থবহ" },
  { key: "relatable", label: "নিজের মতো" },
  { key: "helpful", label: "সহায়ক" },
  { key: "beautiful", label: "সুন্দর লেখা" },
] as const;

function ReaderTools({ post, isAuthenticated, isOwner, onLoginRequired }: { post: EnrichedPost; isAuthenticated: boolean; isOwner: boolean; onLoginRequired: () => void }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const utils = trpc.useUtils();
  const invalidateFeed = () => {
    utils.writingPlatform.listPosts.invalidate();
    utils.writingPlatform.listPostsPaginated.invalidate();
    utils.writingPlatform.myBookmarks.invalidate();
    utils.writingPlatform.getMyCommunityOverview.invalidate();
  };
  const bookmark = trpc.writingPlatform.toggleBookmark.useMutation({ onSuccess: invalidateFeed });
  const feedback = trpc.writingPlatform.setFeedback.useMutation({ onSuccess: invalidateFeed });
  const report = trpc.writingPlatform.submitReport.useMutation({
    onSuccess: () => { setReportSubmitted(true); setShowReport(false); },
  });
  const feedbackTotal = Object.values(post.feedbackCounts).reduce((sum, value) => sum + value, 0);
  const actionStyle: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "0.42rem 0.78rem", borderRadius: 999, border: "1px solid rgba(232,201,122,0.2)", background: "rgba(255,255,255,0.05)", color: "rgba(253,246,236,0.7)", fontFamily: adorshoFont, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" };
  const requireLogin = (callback: () => void) => { if (!isAuthenticated) { onLoginRequired(); return; } callback(); };

  return (
    <div style={{ position: "relative", display: "inline-flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
      <button type="button" className="amio-action-btn" onClick={() => requireLogin(() => bookmark.mutate({ postId: post.id }))} aria-pressed={post.bookmarked} style={{ ...actionStyle, color: post.bookmarked ? "#F7D56F" : actionStyle.color, borderColor: post.bookmarked ? "rgba(247,213,111,0.55)" : "rgba(232,201,122,0.2)" }}>
        <Bookmark size={14} fill={post.bookmarked ? "currentColor" : "none"} /> {post.bookmarked ? "সংরক্ষিত" : "সংরক্ষণ"}
      </button>
      <button type="button" className="amio-action-btn" onClick={() => requireLogin(() => setShowFeedback((open) => !open))} aria-expanded={showFeedback} style={{ ...actionStyle, color: post.myFeedback ? "#86EFAC" : actionStyle.color }}>
        <Sparkles size={14} /> {post.myFeedback ? "ভালো লেগেছে" : "কেমন লাগল?"}{feedbackTotal > 0 ? ` ${feedbackTotal}` : ""}
      </button>
      {!isOwner && (
        <button type="button" className="amio-action-btn" onClick={() => requireLogin(() => setShowReport((open) => !open))} aria-expanded={showReport} title="সমস্যাজনক লেখা রিপোর্ট করুন" style={{ ...actionStyle, padding: "0.42rem 0.58rem", color: "rgba(253,246,236,0.46)" }}>
          <Flag size={14} />
        </button>
      )}
      {showFeedback && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 15, minWidth: 238, padding: "0.7rem", borderRadius: 16, background: "rgba(7,20,38,0.98)", border: "1px solid rgba(232,201,122,0.28)", boxShadow: "0 14px 38px rgba(0,0,0,0.45)", display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 6 }}>
          {FEEDBACK_OPTIONS.map((option) => (
            <button key={option.key} type="button" onClick={() => feedback.mutate({ postId: post.id, kind: option.key })} style={{ padding: "0.48rem 0.55rem", borderRadius: 10, border: post.myFeedback === option.key ? "1px solid rgba(134,239,172,0.56)" : "1px solid rgba(255,255,255,0.1)", background: post.myFeedback === option.key ? "rgba(134,239,172,0.14)" : "rgba(255,255,255,0.04)", color: post.myFeedback === option.key ? "#86EFAC" : "rgba(253,246,236,0.72)", fontFamily: adorshoFont, fontSize: "0.76rem", cursor: "pointer" }}>{option.label}</button>
          ))}
        </div>
      )}
      {showReport && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 15, width: 232, padding: "0.75rem", borderRadius: 16, background: "rgba(24,8,13,0.98)", border: "1px solid rgba(252,165,165,0.35)", boxShadow: "0 14px 38px rgba(0,0,0,0.45)", display: "grid", gap: 7 }}>
          <span style={{ color: "#FCA5A5", fontWeight: 900, fontSize: "0.8rem" }}>কোন সমস্যা দেখেছেন?</span>
          {[{ key: "harassment", label: "হয়রানি বা অপমান" }, { key: "misinformation", label: "ভুল বা বিভ্রান্তিকর" }, { key: "plagiarism", label: "কপি করা লেখা" }, { key: "other", label: "অন্যান্য" }].map((option) => (
            <button key={option.key} type="button" onClick={() => report.mutate({ postId: post.id, reason: option.key as "harassment" | "misinformation" | "plagiarism" | "other" })} style={{ textAlign: "left", padding: "0.42rem 0.5rem", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(253,246,236,0.75)", fontFamily: adorshoFont, fontSize: "0.76rem", cursor: "pointer" }}>{option.label}</button>
          ))}
        </div>
      )}
      {reportSubmitted && <span style={{ color: "#86EFAC", fontSize: "0.75rem", fontFamily: adorshoFont }}>রিপোর্ট গ্রহণ করা হয়েছে</span>}
    </div>
  );
}

// ── Comment Section ───────────────────────────────────────────────────────────

function CommentSection({
  postId,
  commentCount,
  isAuthenticated,
  onLoginRequired,
}: {
  postId: number;
  commentCount: number;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: number; authorName: string } | null>(null);
  const utils = trpc.useUtils();
  const recentComments = trpc.writingPlatform.listRecentComments.useQuery(
    { postId, limit: 3 },
    { enabled: open && commentCount > 0, staleTime: 60_000, retry: false }
  );

  const addComment = trpc.writingPlatform.addComment.useMutation({
    onSuccess: () => {
      setText("");
      setReplyTo(null);
      setSubmitted(true);
      utils.writingPlatform.listPosts.invalidate();
      utils.writingPlatform.listPostsPaginated.invalidate();
      utils.writingPlatform.listRecentComments.invalidate({ postId });
      setTimeout(() => setSubmitted(false), 3000);
    },
  });

  function handleSubmit() {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }
    if (!text.trim()) return;
    addComment.mutate({ postId, content: text.trim(), ...(replyTo ? { parentCommentId: replyTo.id } : {}) });
  }

  return (
    <div>
        <button
          type="button"
          className="amio-action-btn"
          onClick={() => setOpen((o) => !o)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "0.45rem 0.9rem",
            borderRadius: 999,
            border: "1px solid rgba(232,201,122,0.2)",
            background: open ? "rgba(232,201,122,0.1)" : "rgba(255,255,255,0.05)",
            color: open ? "#F7D56F" : "rgba(253,246,236,0.65)",
            fontFamily: adorshoFont,
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
        <MessageCircle size={15} />
        মন্তব্য {commentCount > 0 && `(${commentCount})`}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && (
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {/* Comment input */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isAuthenticated ? (replyTo ? `${replyTo.authorName}-কে উত্তর লিখুন...` : "আপনার মন্তব্য লিখুন...") : "মন্তব্য করতে লগইন করুন"}
              rows={2}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(232,201,122,0.22)",
                borderRadius: 16,
                padding: "0.65rem 0.9rem",
                color: "#FDF6EC",
                fontFamily: adorshoFont,
                fontSize: "0.9rem",
                resize: "none",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim() || addComment.isPending}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #F7D56F, #D4A843)",
                border: "none",
                display: "grid",
                placeItems: "center",
                color: "#071426",
                cursor: text.trim() ? "pointer" : "not-allowed",
                opacity: text.trim() ? 1 : 0.5,
                flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </div>

          {replyTo && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "0.45rem 0.65rem", borderRadius: 10, background: "rgba(129,140,248,0.10)", border: "1px solid rgba(196,181,253,0.24)", color: "#C4B5FD", fontSize: "0.78rem" }}><span>{replyTo.authorName}-কে উত্তর দিচ্ছেন</span><button type="button" onClick={() => setReplyTo(null)} style={{ border: "none", background: "transparent", color: "#C4B5FD", cursor: "pointer" }}><X size={14} /></button></div>
          )}

          {commentCount > 0 && (
            <div aria-live="polite" style={{ display: "grid", gap: 8, padding: "0.2rem 0.15rem 0" }}>
              {recentComments.isLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(253,246,236,0.48)", fontSize: "0.8rem" }}><RefreshCw size={14} style={{ animation: "spin 0.8s linear infinite" }} /> সাম্প্রতিক মন্তব্য লোড হচ্ছে...</div>
              ) : (recentComments.data ?? []).map((comment) => (
                <div key={comment.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "0.58rem 0.68rem", marginLeft: comment.parentCommentId ? 22 : 0, borderRadius: 14, background: comment.parentCommentId ? "rgba(129,140,248,0.055)" : "rgba(255,255,255,0.035)", border: "1px solid rgba(232,201,122,0.09)" }}>
                  <Avatar name={comment.authorName} size={28} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}><span style={{ color: "#F7D56F", fontSize: "0.78rem", fontWeight: 900 }}>{comment.authorName}</span><TimeAgo date={comment.createdAt} /></div>
                    <div style={{ color: "rgba(253,246,236,0.78)", fontSize: "0.84rem", lineHeight: 1.55, marginTop: 2, whiteSpace: "pre-wrap" }}>{comment.content}</div>
                    <button type="button" onClick={() => { if (!isAuthenticated) { onLoginRequired(); return; } setReplyTo({ id: comment.id, authorName: comment.authorName }); }} style={{ marginTop: 4, padding: 0, border: "none", background: "transparent", color: "#C4B5FD", fontFamily: adorshoFont, fontSize: "0.72rem", fontWeight: 900, cursor: "pointer" }}>উত্তর দিন</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {submitted && (
            <div
              style={{
                padding: "0.6rem 1rem",
                borderRadius: 12,
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.3)",
                color: "#86EFAC",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CheckCircle2 size={15} /> মন্তব্য প্রকাশিত হয়েছে।
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────

type EnrichedPost = {
  id: number;
  slug: string;
  authorOpenId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  title: string;
  category: string;
  content: string;
  mediaUrl: string | null;
  mediaType: string;
  status: string;
  featured: boolean;
  boostedScore: number;
  viewCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  reactionCounts: Record<ReactionType, number>;
  feedbackCounts: Record<"meaningful" | "relatable" | "helpful" | "beautiful", number>;
  commentCount: number;
  bookmarked: boolean;
  myFeedback: "meaningful" | "relatable" | "helpful" | "beautiful" | null;
  myReaction: ReactionType | null;
  followingAuthor?: boolean;
  isOwner?: boolean;
};

const PostCard = memo(function PostCard({
  post,
  isAuthenticated,
  onLoginRequired,
  onOpenDetail,
  currentUserOpenId,
  onEdit,
  onDelete,
}: {
  post: EnrichedPost;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
  onOpenDetail: (slug: string) => void;
  currentUserOpenId?: string;
  onEdit?: (post: EnrichedPost) => void;
  onDelete?: (postId: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [ownerMenuOpen, setOwnerMenuOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const utils = trpc.useUtils();
  const followMutation = trpc.writingPlatform.toggleFollow.useMutation({
    onSuccess: () => {
      utils.writingPlatform.listPosts.invalidate();
      utils.writingPlatform.listPostsPaginated.invalidate();
      utils.writingPlatform.listFollowingFeed.invalidate();
      utils.writingPlatform.listTrendingPosts.invalidate();
    },
  });
  const readingEvent = trpc.writingPlatform.recordReadingEvent.useMutation();
  // Lazy load image: only fetch mediaUrl when post has image (base64 is truncated in feed)
  const hasImage = post.mediaType === "image" && post.mediaUrl;
  const isBase64InFeed = hasImage && post.mediaUrl!.startsWith("data:");
  const mediaRef = useRef<HTMLDivElement>(null);
  const [mediaVisible, setMediaVisible] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  useEffect(() => {
    if (!isBase64InFeed) return;
    if (!mediaRef.current || typeof IntersectionObserver === "undefined") {
      setMediaVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setMediaVisible(true);
      observer.disconnect();
    }, { rootMargin: "320px 0px" });
    observer.observe(mediaRef.current);
    return () => observer.disconnect();
  }, [isBase64InFeed]);

  const mediaQuery = trpc.writingPlatform.getPostMedia.useQuery(
    { postId: post.id },
    { enabled: Boolean(isBase64InFeed && mediaVisible), staleTime: 10 * 60 * 1000 }
  );
  const resolvedMediaUrl = isBase64InFeed
    ? (mediaQuery.data?.mediaUrl ?? null)
    : post.mediaUrl;
  const isMediaPending = isBase64InFeed && (!mediaVisible || mediaQuery.isPending || mediaQuery.isFetching);

  useEffect(() => {
    setImageLoadFailed(false);
  }, [post.id, resolvedMediaUrl]);

  const isLong = post.content.length > 280;
  const speakPost = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(`${post.title}. ${post.content}`);
    utterance.lang = "bn-BD";
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    readingEvent.mutate({ postId: post.id, eventType: "audio_play" });
  };
  const displayContent = isLong && !expanded ? post.content.slice(0, 280) + "..." : post.content;
  const isOwner = post.isOwner ?? Boolean(currentUserOpenId && post.authorOpenId === currentUserOpenId);
  // টাইটেল শুধু দেখাবে যদি কন্টেন্টের প্রথম লাইন থেকে আলাদা হয়
  const contentFirstLine = post.content.split("\n")[0].slice(0, 80);
  const showTitle = post.title && post.title.trim() !== contentFirstLine.trim() && post.title !== "বাস্তবতার গল্প";

  return (
    <article className="amio-post-card" style={{ ...cardStyle, padding: "clamp(1rem, 3vw, 1.5rem)", display: "grid", gap: "1rem", contentVisibility: "auto", containIntrinsicSize: "500px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {post.authorAvatarUrl ? (
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: `url(${post.authorAvatarUrl}) center/cover no-repeat`, border: "2px solid rgba(232,201,122,0.45)", flexShrink: 0, boxShadow: "0 0 0 3px rgba(212,168,67,0.12)" }} />
        ) : (
          <Avatar name={post.authorName} size={48} />
        )}
          <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <div className="amio-post-author" style={{ fontWeight: 900, fontSize: "1.02rem", color: "#F7D56F", lineHeight: 1.2, letterSpacing: "0.01em", textShadow: "0 0 12px rgba(212,168,67,0.2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {post.authorName}
            </div>
            {!isOwner && (
              <button
                type="button"
                className="amio-action-btn"
                disabled={followMutation.isPending}
                onClick={() => {
                  if (!isAuthenticated) { onLoginRequired(); return; }
                  followMutation.mutate({ authorOpenId: post.authorOpenId });
                }}
                style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, padding: "0.25rem 0.55rem", borderRadius: 999, border: post.followingAuthor ? "1px solid rgba(134,239,172,0.42)" : "1px solid rgba(247,213,111,0.48)", background: post.followingAuthor ? "rgba(134,239,172,0.10)" : "rgba(247,213,111,0.10)", color: post.followingAuthor ? "#86EFAC" : "#F7D56F", fontFamily: adorshoFont, fontWeight: 900, fontSize: "0.7rem", cursor: "pointer" }}
              >
                {post.followingAuthor ? <><Check size={12} /> অনুসরণ করছেন</> : <><UserPlus size={12} /> অনুসরণ</>}
              </button>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
            <TimeAgo date={post.createdAt} />
            <CategoryBadge category={post.category} />
            {post.featured && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "0.18rem 0.55rem",
                  borderRadius: 999,
                  background: "rgba(212,168,67,0.18)",
                  border: "1px solid rgba(212,168,67,0.4)",
                  color: "#F7D56F",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                }}
              >
                <Crown size={11} /> বিশেষ
              </span>
            )}
            {isOwner && post.status === "pending" && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "0.18rem 0.55rem",
                  borderRadius: 999,
                  background: "rgba(251,191,36,0.12)",
                  border: "1px solid rgba(251,191,36,0.35)",
                  color: "#FCD34D",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                }}
              >
                পর্যালোচনাধীন
              </span>
            )}
            {isOwner && post.status === "rejected" && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "0.18rem 0.55rem",
                  borderRadius: 999,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#FCA5A5",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                }}
              >
                প্রকাশিত হয়নি
              </span>
            )}
          </div>
        </div>
        {isOwner && onEdit && onDelete && (
          <div style={{ position: "relative", flexShrink: 0, alignSelf: "flex-start" }}>
            <button
              type="button"
              aria-label="আপনার পোস্টের অপশন"
              aria-haspopup="menu"
              aria-expanded={ownerMenuOpen}
              onClick={() => { setOwnerMenuOpen((open) => !open); setConfirmDelete(false); }}
              style={{ width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: "50%", border: "1px solid rgba(232,201,122,0.20)", background: ownerMenuOpen ? "rgba(247,213,111,0.14)" : "rgba(255,255,255,0.045)", color: ownerMenuOpen ? "#F7D56F" : "rgba(253,246,236,0.62)", cursor: "pointer" }}
            >
              <MoreHorizontal size={19} />
            </button>
            {ownerMenuOpen && (
              <div role="menu" aria-label="আপনার পোস্টের অপশন" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 25, minWidth: 184, padding: 6, display: "grid", gap: 4, borderRadius: 15, border: "1px solid rgba(232,201,122,0.28)", background: "rgba(7,20,38,0.98)", boxShadow: "0 16px 42px rgba(0,0,0,0.48)", backdropFilter: "blur(20px)" }}>
                <button type="button" role="menuitem" onClick={() => { setOwnerMenuOpen(false); onEdit(post); }} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", border: "none", borderRadius: 10, padding: "0.6rem 0.7rem", background: "transparent", color: "rgba(253,246,236,0.82)", fontFamily: adorshoFont, fontWeight: 800, fontSize: "0.84rem", textAlign: "left", cursor: "pointer" }}><Edit3 size={15} color="#F7D56F" /> পোস্ট সম্পাদনা</button>
                {!confirmDelete ? (
                  <button type="button" role="menuitem" onClick={() => setConfirmDelete(true)} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", border: "none", borderRadius: 10, padding: "0.6rem 0.7rem", background: "rgba(239,68,68,0.08)", color: "#FCA5A5", fontFamily: adorshoFont, fontWeight: 800, fontSize: "0.84rem", textAlign: "left", cursor: "pointer" }}><Trash2 size={15} /> পোস্ট মুছুন</button>
                ) : (
                  <div style={{ padding: "0.45rem 0.4rem", display: "grid", gap: 7 }}><span style={{ color: "rgba(253,246,236,0.72)", fontSize: "0.76rem", lineHeight: 1.45 }}>পোস্টটি স্থায়ীভাবে মুছবেন?</span><div style={{ display: "flex", gap: 6 }}><button type="button" onClick={() => { onDelete(post.id); setOwnerMenuOpen(false); setConfirmDelete(false); }} style={{ flex: 1, border: "1px solid rgba(239,68,68,0.5)", borderRadius: 9, padding: "0.38rem", background: "rgba(239,68,68,0.2)", color: "#FECACA", fontFamily: adorshoFont, fontWeight: 900, cursor: "pointer" }}>মুছুন</button><button type="button" onClick={() => setConfirmDelete(false)} style={{ flex: 1, border: "1px solid rgba(232,201,122,0.20)", borderRadius: 9, padding: "0.38rem", background: "transparent", color: "rgba(253,246,236,0.64)", fontFamily: adorshoFont, fontWeight: 800, cursor: "pointer" }}>না</button></div></div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Title - only show if different from content first line */}
      {showTitle && (
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(1.08rem, 3vw, 1.35rem)",
            fontWeight: 900,
            color: "#FDF6EC",
            lineHeight: 1.4,
            cursor: "pointer",
            transition: "color 0.18s",
          }}
          onClick={() => onOpenDetail(post.slug)}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#F7D56F"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#FDF6EC"; }}
        >
          {post.title}
        </h2>
      )}

      {/* Content */}
      <div className="amio-post-content" style={{ color: "rgba(253,246,236,0.88)", lineHeight: 1.82, fontSize: "clamp(0.96rem, 3.8vw, 1.02rem)" }}>
        <p style={{ margin: 0, whiteSpace: "pre-wrap", cursor: "pointer" }} onClick={() => onOpenDetail(post.slug)}>{displayContent}</p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            style={{
              background: "none",
              border: "none",
              color: "#F7D56F",
              cursor: "pointer",
              fontFamily: adorshoFont,
              fontWeight: 700,
              fontSize: "0.88rem",
              padding: "0.3rem 0",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {expanded ? <><ChevronUp size={14} /> কম দেখুন</> : <><ChevronDown size={14} /> আরও পড়ুন</>}
          </button>
        )}
      </div>

      {/* Media: normal URL shown directly; base64 lazy-loaded via getPostMedia */}
      {post.mediaType === "image" && hasImage && (
        <div ref={isBase64InFeed ? mediaRef : undefined} style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(232,201,122,0.18)", boxShadow: "0 4px 24px rgba(0,0,0,0.28)" }}>
          {resolvedMediaUrl && !imageLoadFailed ? (
            <img
              src={resolvedMediaUrl}
              alt={post.title}
              className="amio-media-img"
              style={{ width: "100%", maxHeight: 440, objectFit: "cover", display: "block" }}
              loading="lazy"
              onClick={() => onOpenDetail(post.slug)}
              onError={() => setImageLoadFailed(true)}
            />
          ) : isMediaPending ? (
            <div aria-live="polite" style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(232,201,122,0.5)", fontSize: 13 }}>
              <RefreshCw size={16} style={{ animation: "spin 0.8s linear infinite", marginRight: 8 }} /> ছবি লোড হচ্ছে...
            </div>
          ) : (
            <div role="status" style={{ minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", color: "rgba(253,246,236,0.58)", fontSize: 13, textAlign: "center", background: "rgba(255,255,255,0.025)" }}>
              ছবিটি এই মুহূর্তে পাওয়া যাচ্ছে না
            </div>
          )}
        </div>
      )}
      {post.mediaUrl && post.mediaType === "video" && (
        <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(232,201,122,0.18)", aspectRatio: "16/9", boxShadow: "0 4px 24px rgba(0,0,0,0.28)" }}>
          <iframe
            src={post.mediaUrl}
            style={{ width: "100%", height: "100%", border: "none" }}
            allowFullScreen
            title={post.title}
          />
        </div>
      )}

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          paddingTop: "0.25rem",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid rgba(232,201,122,0.08)",
          flexWrap: "wrap",
        }}
      >
        <span style={{ color: "rgba(253,246,236,0.42)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 5 }}>
          <Eye size={13} /> {post.viewCount} বার দেখা হয়েছে
        </span>
        <button
          type="button"
          onClick={() => onOpenDetail(post.slug)}
          style={{
            background: "none",
            border: "none",
            color: "rgba(253,246,236,0.42)",
            fontSize: "0.8rem",
            cursor: "pointer",
            fontFamily: adorshoFont,
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: 0,
          }}
        >
          <MessageCircle size={13} /> {post.commentCount} মন্তব্য
        </button>
      </div>

      {/* Familiar primary social actions, followed by optional reading tools. */}
      <div className="amio-post-actions" style={{ display: "grid", gap: 8 }}>
        <div className="amio-post-primary-actions">
        <ReactionBar
          postId={post.id}
          reactionCounts={post.reactionCounts}
          myReaction={post.myReaction}
          isAuthenticated={isAuthenticated}
          onLoginRequired={onLoginRequired}
        />
        <CommentSection
          postId={post.id}
          commentCount={post.commentCount}
          isAuthenticated={isAuthenticated}
          onLoginRequired={onLoginRequired}
        />
        <button
          type="button"
          className="amio-action-btn"
          onClick={async () => {
            const url = `${window.location.origin}/amio-likhbo-bastobota/${post.slug}`;
            try {
              if (navigator.share) {
                await navigator.share({ title: post.title, text: post.content.slice(0, 140), url });
              } else {
                await navigator.clipboard.writeText(url);
              }
              readingEvent.mutate({ postId: post.id, eventType: "share" });
            } catch {
              // Share cancellation or clipboard permission failure should not break the post view.
            }
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "0.45rem 0.9rem",
            borderRadius: 999,
            border: "1px solid rgba(232,201,122,0.2)",
            background: "rgba(255,255,255,0.05)",
            color: "rgba(253,246,236,0.65)",
            fontFamily: adorshoFont,
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          <Share2 size={15} /> শেয়ার
        </button>
        </div>
        <div className="amio-post-secondary-actions" style={{ gap: 6, flexWrap: "wrap" }}>
          <button type="button" className="amio-action-btn" onClick={speakPost} aria-pressed={speaking} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0.42rem 0.78rem", borderRadius: 999, border: speaking ? "1px solid rgba(129,140,248,0.55)" : "1px solid rgba(232,201,122,0.20)", background: speaking ? "rgba(129,140,248,0.16)" : "rgba(255,255,255,0.05)", color: speaking ? "#C4B5FD" : "rgba(253,246,236,0.68)", fontFamily: adorshoFont, fontWeight: 800, fontSize: "0.78rem", cursor: "pointer" }}><Volume2 size={14} /> {speaking ? "থামান" : "শুনুন"}</button>
          <ReaderTools post={post} isAuthenticated={isAuthenticated} isOwner={isOwner} onLoginRequired={onLoginRequired} />
        </div>
      </div>
    </article>
  );
});
// ── Create Post Modal ──────────────────────────────────────────────────────────

function CreatePostModal({ onClose, authorName, avatarUrl, challenge }: { onClose: () => void; authorName: string; avatarUrl?: string; challenge?: { id: number; title: string; prompt: string; category: CategoryKey } | null }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryKey>(challenge?.category ?? "thought");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [draftId, setDraftId] = useState<number | undefined>();
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [writingHint, setWritingHint] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const [postError, setPostError] = useState("");
  const draftsQuery = trpc.writingPlatform.listDrafts.useQuery(undefined, { staleTime: 30000, retry: false });
  const promptsQuery = trpc.writingPlatform.listPrompts.useQuery({ limit: 3 }, { staleTime: 300000, retry: false });
  const promptSuggestions = promptsQuery.data ?? [];
  const saveDraft = trpc.writingPlatform.saveDraft.useMutation({
    onSuccess: (result) => { setDraftId(result.draftId); setDraftStatus("saved"); utils.writingPlatform.listDrafts.invalidate(); },
    onError: () => setDraftStatus("idle"),
  });
  const deleteDraft = trpc.writingPlatform.deleteDraft.useMutation({ onSuccess: () => utils.writingPlatform.listDrafts.invalidate() });
  const createPost = trpc.writingPlatform.createPost.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setPostError("");
      if (draftId) deleteDraft.mutate({ draftId });
      utils.writingPlatform.listPosts.invalidate();
      utils.writingPlatform.listPostsPaginated.invalidate();
      utils.writingPlatform.myPosts.invalidate();
      setTimeout(() => onClose(), 2200);
    },
    onError: (err) => {
      setPostError(err.message || "পোস্ট প্রকাশ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    },
  });

  const currentDraftInput = useCallback(() => ({
    draftId,
    title: title.trim() || undefined,
    category: category === "all" ? "thought" as const : category,
    content,
    mediaUrl: imageUrl || undefined,
    mediaType: imageUrl ? "image" as const : "none" as const,
    challengeId: challenge?.id,
  }), [draftId, title, category, content, imageUrl, challenge?.id]);

  useEffect(() => {
    if (!content.trim() && !imageUrl && !title.trim()) return;
    setDraftStatus("saving");
    const timer = window.setTimeout(() => saveDraft.mutate(currentDraftInput()), 1400);
    return () => window.clearTimeout(timer);
  }, [content, imageUrl, title, category, currentDraftInput]);

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload?type=image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "আপলোড ব্যর্থ");
      setImageUrl(data.url);
    } catch (err: any) {
      setUploadError(err.message || "ছবি আপলোড করতে সমস্যা হয়েছে");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Allow posting with just caption OR just image
    const hasCaption = content.trim().length > 0;
    const hasImage = imageUrl.length > 0;
    if (!hasCaption && !hasImage) return;
    // If image is base64 (large), post without mediaUrl to avoid body size limit
    // The image was already uploaded via /api/upload?type=image and URL stored in imageUrl
    const finalContent = hasCaption ? content.trim() : " ";
    createPost.mutate({
      title: title.trim() || undefined,
      category: category !== "all" ? category : undefined,
      challengeId: challenge?.id,
      content: finalContent,
      mediaUrl: imageUrl || undefined,
      mediaType: imageUrl ? "image" : "none",
    });
  }

  const inputStyle: CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(232,201,122,0.22)",
    borderRadius: 14,
    padding: "0.7rem 0.9rem",
    color: "#FDF6EC",
    fontFamily: adorshoFont,
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    color: "#F7D56F",
    fontWeight: 700,
    fontSize: "0.88rem",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,11,20,0.92)",
        backdropFilter: "blur(20px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          ...glassStyle,
          borderRadius: "28px 28px 0 0",
          padding: "clamp(1.2rem, 4vw, 2rem)",
          width: "min(640px, 100%)",
          maxHeight: "92vh",
          overflowY: "auto",
          display: "grid",
          gap: "1.2rem",
          animation: "slideUp 0.32s cubic-bezier(0.22,1,0.36,1) forwards",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "-0.4rem", marginBottom: "-0.4rem" }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: "rgba(232,201,122,0.25)" }} />
        </div>
        {/* Modal header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {avatarUrl ? (
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: `url(${avatarUrl}) center/cover no-repeat`, border: "2px solid rgba(232,201,122,0.5)", flexShrink: 0, boxShadow: "0 0 0 3px rgba(212,168,67,0.12)" }} />
            ) : (
              <Avatar name={authorName} size={42} />
            )}
            <div>
              <div style={{ fontWeight: 900, color: "#F7D56F", fontSize: "1.02rem" }}>{authorName}</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(253,246,236,0.5)" }}>নতুন পোস্ট লিখুন</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "1px solid rgba(232,201,122,0.25)",
              background: "rgba(255,255,255,0.07)",
              color: "rgba(253,246,236,0.7)",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              transition: "background 0.15s",
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageSelect}
        />

        {submitted ? (
          <div style={{ padding: "2rem", borderRadius: 18, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#86EFAC", textAlign: "center", display: "grid", gap: 10 }}>
            <CheckCircle2 size={36} style={{ margin: "0 auto", color: "#22C55E" }} />
            <div style={{ fontWeight: 900, fontSize: "1.1rem" }}>লেখা জমা হয়েছে</div>
            <div style={{ fontSize: "0.85rem", color: "rgba(134,239,172,0.8)" }}>পর্যালোচনা ও অনুমোদনের পর এটি নিউজ ফিডে দেখা যাবে।</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
            {challenge && (
              <div style={{ padding: "0.75rem 0.9rem", borderRadius: 14, border: "1px solid rgba(134,239,172,0.35)", background: "rgba(134,239,172,0.10)", display: "grid", gap: 3 }}>
                <span style={{ color: "#86EFAC", fontWeight: 900, fontSize: "0.82rem" }}>চ্যালেঞ্জ: {challenge.title}</span>
                <span style={{ color: "rgba(253,246,236,0.68)", fontSize: "0.8rem", lineHeight: 1.55 }}>{challenge.prompt}</span>
              </div>
            )}
            {/* Image preview */}
            {imageUrl && (
              <div style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}>
                <img src={imageUrl} alt="প্রিভিউ" style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block" }} />
                <button type="button" onClick={() => setImageUrl("")} style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.65)", border: "none", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <X size={14} />
                </button>
              </div>
            )}

            {!content && promptSuggestions.length > 0 && (
              <div style={{ display: "grid", gap: 7, padding: "0.72rem 0.8rem", borderRadius: 15, border: "1px solid rgba(247,213,111,0.18)", background: "rgba(247,213,111,0.055)" }}>
                <div style={{ color: "#F7D56F", fontWeight: 900, fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: 6 }}><Lightbulb size={14} /> লিখতে শুরু করার একটি ভাবনা বেছে নিন</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {promptSuggestions.map((prompt) => (
                    <button key={prompt.id} type="button" onClick={() => { setCategory(prompt.category as CategoryKey); setWritingHint(prompt.prompt); }} style={{ border: "1px solid rgba(232,201,122,0.24)", background: writingHint === prompt.prompt ? "rgba(247,213,111,0.16)" : "rgba(255,255,255,0.035)", color: writingHint === prompt.prompt ? "#F7D56F" : "rgba(253,246,236,0.72)", borderRadius: 999, padding: "0.34rem 0.62rem", fontFamily: adorshoFont, fontSize: "0.73rem", fontWeight: 800, cursor: "pointer" }}>{prompt.title}</button>
                  ))}
                </div>
                {writingHint && <p style={{ margin: 0, color: "rgba(253,246,236,0.6)", fontSize: "0.77rem", lineHeight: 1.55 }}>{writingHint}</p>}
              </div>
            )}

            {(draftsQuery.data ?? []).filter((draft) => draft.id !== draftId).length > 0 && !content && !imageUrl && (
              <div style={{ padding: "0.65rem 0.75rem", borderRadius: 14, border: "1px solid rgba(129,140,248,0.28)", background: "rgba(129,140,248,0.08)", display: "flex", alignItems: "center", gap: 8, overflowX: "auto" }}>
                <FileClock size={15} color="#C4B5FD" /><span style={{ color: "#C4B5FD", fontSize: "0.78rem", fontWeight: 900, whiteSpace: "nowrap" }}>খসড়া খুলুন</span>
                {(draftsQuery.data ?? []).slice(0, 3).map((draft) => <button key={draft.id} type="button" onClick={() => { setDraftId(draft.id); setTitle(draft.title || ""); setCategory(draft.category as CategoryKey); setContent(draft.content); setImageUrl(draft.mediaUrl || ""); setDraftStatus("saved"); }} style={{ border: "1px solid rgba(196,181,253,0.30)", background: "rgba(255,255,255,0.04)", color: "rgba(253,246,236,0.75)", borderRadius: 999, padding: "0.28rem 0.58rem", fontFamily: adorshoFont, fontSize: "0.72rem", cursor: "pointer", whiteSpace: "nowrap" }}>{draft.title || "নামহীন খসড়া"}</button>)}
              </div>
            )}

            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="শিরোনাম দিন (ঐচ্ছিক)" maxLength={220} style={inputStyle} />

            {/* Category selector */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CATEGORIES.filter(c => c.key !== "all").map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key as CategoryKey)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "0.35rem 0.75rem", borderRadius: 999,
                    border: category === cat.key ? "1px solid rgba(247,213,111,0.6)" : "1px solid rgba(232,201,122,0.18)",
                    background: category === cat.key ? "rgba(247,213,111,0.15)" : "rgba(255,255,255,0.04)",
                    color: category === cat.key ? "#F7D56F" : "rgba(253,246,236,0.55)",
                    fontFamily: adorshoFont, fontWeight: category === cat.key ? 900 : 700,
                    fontSize: "0.8rem", cursor: "pointer",
                  }}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Caption */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="আপনার বাস্তব অভিজ্ঞতা, গল্প, ভাবনা বা কবিতা লিখুন..."
              rows={5}
              autoFocus
              maxLength={600000}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(232,201,122,0.22)", borderRadius: 16, padding: "0.9rem 1rem", color: "#FDF6EC", fontFamily: adorshoFont, fontSize: "1rem", outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: 140, lineHeight: 1.85 }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "0.65rem 0.75rem", border: "1px solid rgba(129,140,248,0.24)", borderRadius: 14, background: "rgba(129,140,248,0.06)" }}>
              <span style={{ color: "#C4B5FD", fontSize: "0.78rem", fontWeight: 900, display: "inline-flex", alignItems: "center", gap: 6 }}><FileClock size={15} /> আপনার খসড়া নিরাপদে থাকছে</span>
              <span style={{ color: "rgba(253,246,236,0.46)", fontSize: "0.72rem", textAlign: "right" }}>{draftStatus === "saving" ? "খসড়া সেভ হচ্ছে..." : draftStatus === "saved" ? "খসড়া সেভ হয়েছে" : "লিখতে থাকুন—খসড়া সেভ হবে"}</span>
            </div>

            {uploadError && (
              <div style={{ padding: "0.5rem 0.9rem", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: "0.83rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span>{uploadError}</span>
                <button type="button" onClick={() => setUploadError("")} style={{ background: "none", border: "none", color: "#FCA5A5", cursor: "pointer", fontWeight: 900, fontSize: "1rem", padding: 0 }}>✕</button>
              </div>
            )}

            {/* Bottom bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button type="button" onClick={() => { setUploadError(""); fileInputRef.current?.click(); }} disabled={uploading}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0.55rem 1rem", borderRadius: 999, border: "1px solid rgba(232,201,122,0.3)", background: "rgba(255,255,255,0.05)", color: imageUrl ? "#86EFAC" : "rgba(253,246,236,0.7)", fontFamily: adorshoFont, fontWeight: 700, fontSize: "0.85rem", cursor: uploading ? "not-allowed" : "pointer", flexShrink: 0 }}>
                {uploading ? <RefreshCw size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <Camera size={15} />}
                {uploading ? "আপলোড..." : imageUrl ? "ছবি যোগ হয়েছে" : "ছবি যোগ করুন"}
              </button>
              <button type="button" onClick={() => { setDraftStatus("saving"); saveDraft.mutate(currentDraftInput()); }} disabled={saveDraft.isPending || (!content.trim() && !imageUrl && !title.trim())} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "0.55rem 0.72rem", borderRadius: 999, border: "1px solid rgba(196,181,253,0.35)", background: "rgba(129,140,248,0.10)", color: "#C4B5FD", fontFamily: adorshoFont, fontWeight: 900, fontSize: "0.78rem", cursor: "pointer" }}><BookMarked size={14} /> খসড়া রাখুন</button>
              <div style={{ flex: 1 }} />
              <button
                type="button"
                disabled={(!content.trim() && !imageUrl) || createPost.isPending || uploading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const hasCaption = content.trim().length > 0;
                  const hasImage = imageUrl.length > 0;
                  if (!hasCaption && !hasImage) return;
                  const finalContent = hasCaption ? content.trim() : " ";
                  createPost.mutate({
                    title: title.trim() || undefined,
                    category: category !== "all" ? category : undefined,
                    content: finalContent,
                    mediaUrl: imageUrl || undefined,
                    mediaType: imageUrl ? "image" : "none",
                  });
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0.75rem 1.5rem",
                  borderRadius: 999,
                  border: "1px solid rgba(255,235,166,0.72)",
                  background: ((!content.trim() && !imageUrl) || createPost.isPending || uploading)
                    ? "rgba(212,168,67,0.4)"
                    : "linear-gradient(135deg, #F7D56F 0%, #D4A843 58%, #B98A24 100%)",
                  color: "#071426",
                  fontFamily: adorshoFont,
                  fontWeight: 900,
                  fontSize: "0.96rem",
                  cursor: ((!content.trim() && !imageUrl) || createPost.isPending || uploading) ? "not-allowed" : "pointer",
                  boxShadow: "0 12px 30px rgba(212,168,67,0.22)",
                }}
              >
                {createPost.isPending ? <><RefreshCw size={16} style={{ animation: "spin 0.8s linear infinite" }} /> পোস্ট হচ্ছে...</> : <><Send size={16} /> পোস্ট করুন</>}
              </button>
            </div>

            {createPost.isError && (
              <div style={{ padding: "0.6rem 1rem", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: "0.85rem" }}>
                পোস্ট করতে সমস্যা হয়েছে। {createPost.error?.message && <span style={{opacity:0.75}}>({createPost.error.message})</span>} আবার চেষ্টা করুন।
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

// ── Edit Post Modal ─────────────────────────────────────────────────────────
function EditPostModal({ post, onClose, authorName, avatarUrl }: { post: EnrichedPost; onClose: () => void; authorName: string; avatarUrl?: string }) {
  const [title, setTitle] = useState(post.title);
  const [category, setCategory] = useState<CategoryKey>((post.category as CategoryKey) || "thought");
  const [content, setContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState(post.mediaType === "image" ? (post.mediaUrl ?? "") : "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const editPost = trpc.writingPlatform.editPost.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      utils.writingPlatform.listPosts.invalidate();
      utils.writingPlatform.listPostsPaginated.invalidate();
      utils.writingPlatform.myPosts.invalidate();
      setTimeout(() => onClose(), 2200);
    },
  });

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true); setUploadError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload?type=image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "আপলোড ব্যর্থ");
      setImageUrl(data.url);
    } catch (err: any) {
      setUploadError(err.message || "ছবি আপলোড করতে সমস্যা হয়েছে");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    editPost.mutate({
      postId: post.id,
      title: title.trim() || undefined,
      category: category !== "all" ? category : undefined,
      content: content.trim(),
      mediaUrl: imageUrl || undefined,
      mediaType: imageUrl ? "image" : "none",
    });
  }
  const inputStyle: CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(232,201,122,0.22)",
    borderRadius: 14,
    padding: "0.7rem 0.9rem",
    color: "#FDF6EC",
    fontFamily: adorshoFont,
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle: CSSProperties = {
    display: "block",
    color: "#F7D56F",
    fontWeight: 700,
    fontSize: "0.88rem",
    marginBottom: 6,
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(7,20,38,0.88)",
        backdropFilter: "blur(12px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          ...glassStyle,
          borderRadius: 28,
          padding: "clamp(1.2rem, 4vw, 2rem)",
          width: "min(600px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "grid",
          gap: "1.1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {avatarUrl ? (
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: `url(${avatarUrl}) center/cover no-repeat`, border: "2px solid rgba(232,201,122,0.4)", flexShrink: 0 }} />
            ) : (
              <Avatar name={authorName} size={38} />
            )}
            <div>
              <div style={{ fontWeight: 900, color: "#F7D56F" }}>{authorName}</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(253,246,236,0.5)" }}>পোস্ট সম্পাদনা করুন</div>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(232,201,122,0.22)", background: "rgba(255,255,255,0.06)", color: "rgba(253,246,236,0.7)", cursor: "pointer", display: "grid", placeItems: "center" }}>
            <X size={16} />
          </button>
        </div>
        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageSelect} />

        {submitted ? (
          <div style={{ textAlign: "center", padding: "2rem", display: "grid", gap: "0.75rem" }}>
            <CheckCircle2 size={48} color="#86EFAC" style={{ margin: "0 auto" }} />
            <div style={{ color: "#86EFAC", fontWeight: 900, fontSize: "1.1rem" }}>পোস্ট আপডেট হয়েছে!</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
            {/* Image preview */}
            {imageUrl && (
              <div style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}>
                <img src={imageUrl} alt="প্রিভিউ" style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block" }} />
                <button type="button" onClick={() => setImageUrl("")} style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.65)", border: "none", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Caption */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="আপনার বাস্তব অভিজ্ঞতা, গল্প, ভাবনা বা কবিতা লিখুন..."
              rows={5}
              autoFocus
              maxLength={600000}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(232,201,122,0.22)", borderRadius: 16, padding: "0.9rem 1rem", color: "#FDF6EC", fontFamily: adorshoFont, fontSize: "1rem", outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: 140, lineHeight: 1.85 }}
            />

            {uploadError && (
              <div style={{ padding: "0.5rem 0.9rem", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: "0.83rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span>{uploadError}</span>
                <button type="button" onClick={() => setUploadError("")} style={{ background: "none", border: "none", color: "#FCA5A5", cursor: "pointer", fontWeight: 900, fontSize: "1rem", padding: 0 }}>✕</button>
              </div>
            )}

            {/* Bottom bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button type="button" onClick={() => { setUploadError(""); fileInputRef.current?.click(); }} disabled={uploading}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0.55rem 1rem", borderRadius: 999, border: "1px solid rgba(232,201,122,0.3)", background: "rgba(255,255,255,0.05)", color: imageUrl ? "#86EFAC" : "rgba(253,246,236,0.7)", fontFamily: adorshoFont, fontWeight: 700, fontSize: "0.85rem", cursor: uploading ? "not-allowed" : "pointer", flexShrink: 0 }}>
                {uploading ? <RefreshCw size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <Camera size={15} />}
                {uploading ? "আপলোড..." : imageUrl ? "ছবি যোগ আছে" : "ছবি যোগ করুন"}
              </button>
              <div style={{ flex: 1 }} />
              <button type="button" onClick={onClose} style={{ padding: "0.6rem 1.2rem", borderRadius: 999, border: "1px solid rgba(232,201,122,0.25)", background: "transparent", color: "rgba(253,246,236,0.7)", fontFamily: adorshoFont, cursor: "pointer" }}>বাতিল</button>
              <ActionButton type="submit" disabled={editPost.isPending || !content.trim() || uploading}>
                {editPost.isPending ? <><RefreshCw size={15} style={{ animation: "spin 0.8s linear infinite" }} /> আপডেট...</> : <><CheckCircle2 size={15} /> আপডেট করুন</>}
              </ActionButton>
            </div>
            {editPost.isError && (
              <div style={{ padding: "0.6rem 1rem", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: "0.85rem" }}>আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।</div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
// ── Post Detail View ──────────────────────────────────────────────────────────
function PostDetail({
  slug,
  isAuthenticated,
  onLoginRequired,
  onBack,
}: {
  slug: string;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
  onBack: () => void;
}) {
  const [commentText, setCommentText] = useState("");
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const utils = trpc.useUtils();
  const detail = trpc.writingPlatform.getPostBySlug.useQuery({ slug });
  const addDetailComment = trpc.writingPlatform.addComment.useMutation({
    onSuccess: () => {
      setCommentText("");
      setCommentSubmitted(true);
      utils.writingPlatform.getPostBySlug.invalidate({ slug });
      utils.writingPlatform.listPosts.invalidate();
      utils.writingPlatform.listPostsPaginated.invalidate();
      setTimeout(() => setCommentSubmitted(false), 3000);
    },
  });

  if (detail.isLoading) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: 300 }}>
        <RefreshCw size={28} color="#D4A843" style={{ animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!detail.data) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <div style={{ color: "rgba(253,246,236,0.5)", marginBottom: "1rem" }}>পোস্টটি পাওয়া যায়নি।</div>
        <ActionButton onClick={onBack} small>
          <ArrowLeft size={15} /> ফিরে যান
        </ActionButton>
      </div>
    );
  }

  const { post, comments } = detail.data;

  const SITE_URL = "https://www.mahbubsardarsabuj.com";
  const postUrl = `${SITE_URL}/amio-likhbo-bastobota/${post.slug}`;
  const postDescription = post.content.slice(0, 160).replace(/\n/g, " ").trim();
  const categoryLabels: Record<string, string> = {
    experience: "অভিজ্ঞতা", story: "গল্প", poem: "কবিতা",
    thought: "ভাবনা", photo: "ছবি", video: "ভিডিও",
  };
  const categoryLabel = categoryLabels[post.category] || post.category;
  const seoTitle = `${post.title} — ${post.authorName} | আমিও লিখবো বাস্তবতা`;
  const seoKeywords = `${post.authorName}, ${categoryLabel}, আমিও লিখবো বাস্তবতা, বাস্তব গল্প, বাংলা লেখা, মাহবুব সরদার সবুজ`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": post.category === "poem" ? "Poem" : post.category === "story" ? "ShortStory" : "Article",
    "headline": post.title,
    "description": postDescription,
    "url": postUrl,
    "datePublished": new Date(post.createdAt).toISOString(),
    "dateModified": new Date(post.updatedAt).toISOString(),
    "author": {
      "@type": "Person",
      "name": post.authorName,
    },
    "publisher": {
      "@type": "Organization",
      "name": "আমিও লিখবো বাস্তবতা | মাহবুব সরদার সবুজ",
      "url": SITE_URL,
    },
    "inLanguage": "bn-BD",
    "isAccessibleForFree": true,
    "genre": categoryLabel,
    ...(post.mediaUrl && post.mediaType === "image" ? { "image": post.mediaUrl } : {}),
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <Seo
        title={seoTitle}
        description={postDescription}
        path={`/amio-likhbo-bastobota/${post.slug}`}
        image={post.mediaUrl && post.mediaType === "image" ? post.mediaUrl : undefined}
        keywords={seoKeywords}
        type="article"
        jsonLd={jsonLd}
      />
      <button
        type="button"
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "none",
          border: "none",
          color: "#F7D56F",
          cursor: "pointer",
          fontFamily: adorshoFont,
          fontWeight: 700,
          fontSize: "0.92rem",
          padding: 0,
        }}
      >
        <ArrowLeft size={16} /> ফিডে ফিরুন
      </button>

      {/* Full post */}
      <article style={{ ...cardStyle, padding: "clamp(1.2rem, 4vw, 2rem)", display: "grid", gap: "1.4rem" }}>
        {/* Hero header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0.75rem", borderRadius: 18, background: "rgba(212,168,67,0.06)", border: "1px solid rgba(232,201,122,0.12)" }}>
          {post.authorAvatarUrl ? (
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: `url(${post.authorAvatarUrl}) center/cover no-repeat`, border: "2px solid rgba(232,201,122,0.5)", flexShrink: 0, boxShadow: "0 0 0 4px rgba(212,168,67,0.12)" }} />
          ) : (
            <Avatar name={post.authorName} size={54} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, color: "#F7D56F", fontSize: "1.08rem", textShadow: "0 0 14px rgba(212,168,67,0.25)" }}>{post.authorName}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
              <TimeAgo date={post.createdAt} />
              <CategoryBadge category={post.category} />
            </div>
          </div>
        </div>

        <h1 style={{ margin: 0, fontSize: "clamp(1.35rem, 4vw, 2.1rem)", fontWeight: 900, color: "#FDF6EC", lineHeight: 1.38, letterSpacing: "0.01em" }}>
          {post.title}
        </h1>

        <div style={{ color: "rgba(253,246,236,0.88)", lineHeight: 2.0, fontSize: "1.05rem", whiteSpace: "pre-wrap" }}>
          {post.content}
        </div>

        {post.mediaUrl && post.mediaType === "image" && (
          <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.4)", border: "1px solid rgba(232,201,122,0.18)" }}>
            <img src={post.mediaUrl} alt={post.title} className="amio-media-img" style={{ width: "100%", display: "block" }} loading="lazy" />
          </div>
        )}
        {post.mediaUrl && post.mediaType === "video" && (
          <div style={{ borderRadius: 20, overflow: "hidden", aspectRatio: "16/9", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
            <iframe src={post.mediaUrl} style={{ width: "100%", height: "100%", border: "none" }} allowFullScreen title={post.title} />
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(253,246,236,0.42)", fontSize: "0.82rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(232,201,122,0.1)" }}>
          <Eye size={13} /> {post.viewCount} বার দেখা হয়েছে
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <ReactionBar
            postId={post.id}
            reactionCounts={post.reactionCounts}
            myReaction={post.myReaction}
            isAuthenticated={isAuthenticated}
            onLoginRequired={onLoginRequired}
            postSlug={slug}
          />
        </div>
      </article>

      {/* Comments */}
      <div style={{ ...cardStyle, padding: "clamp(1rem, 3vw, 1.5rem)", display: "grid", gap: "1rem" }}>
        <h3 style={{ margin: 0, color: "#F7D56F", fontWeight: 900, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 8 }}>
          <MessageCircle size={18} /> মন্তব্যসমূহ ({post.commentCount})
        </h3>

        {/* Add comment */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={isAuthenticated ? "মন্তব্য লিখুন..." : "মন্তব্য করতে লগইন করুন"}
            rows={2}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(232,201,122,0.22)",
              borderRadius: 14,
              padding: "0.65rem 0.9rem",
              color: "#FDF6EC",
              fontFamily: adorshoFont,
              fontSize: "0.9rem",
              resize: "none",
              outline: "none",
            }}
          />
          <button
            type="button"
            disabled={!commentText.trim() || addDetailComment.isPending}
            onClick={() => {
              if (!isAuthenticated) { onLoginRequired(); return; }
              if (!commentText.trim()) return;
              addDetailComment.mutate({ postId: post.id, content: commentText.trim() });
            }}
            style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "linear-gradient(135deg, #F7D56F, #D4A843)",
              border: "none", display: "grid", placeItems: "center",
              color: "#071426",
              cursor: commentText.trim() ? "pointer" : "not-allowed",
              opacity: commentText.trim() ? 1 : 0.5,
              flexShrink: 0,
            }}
          >
            {addDetailComment.isPending ? <RefreshCw size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <Send size={16} />}
          </button>
        </div>
        {commentSubmitted && (
          <div style={{
            padding: "0.6rem 1rem", borderRadius: 12,
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.3)",
            color: "#86EFAC", fontSize: "0.85rem",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <CheckCircle2 size={15} /> মন্তব্য পাঠানো হয়েছে। অনুমোদনের পর প্রকাশিত হবে।
          </div>
        )}

        {/* Comment list */}
        {comments.length === 0 ? (
          <div style={{ color: "rgba(253,246,236,0.38)", fontSize: "0.88rem", textAlign: "center", padding: "1.5rem 1rem", display: "grid", gap: 8 }}>
            <MessageCircle size={28} color="rgba(212,168,67,0.3)" style={{ margin: "0 auto" }} />
            <span>এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্য করুন!</span>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "0.85rem 1rem",
                  borderRadius: 18,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
                  border: "1px solid rgba(232,201,122,0.12)",
                  animation: "fadeInFast 0.3s ease forwards",
                }}
              >
                <Avatar name={comment.authorName} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontWeight: 900, color: "#F7D56F", fontSize: "0.9rem" }}>{comment.authorName}</span>
                    <TimeAgo date={comment.createdAt} />
                  </div>
                  <p style={{ margin: 0, color: "rgba(253,246,236,0.85)", fontSize: "0.92rem", lineHeight: 1.75 }}>
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Writer discovery ──────────────────────────────────────────────────────────

type SuggestedAuthor = {
  authorOpenId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  postCount: number;
  totalViews: number;
  following: boolean;
};

function SuggestedAuthorsPanel({
  authors,
  isAuthenticated,
  onLoginRequired,
}: {
  authors: SuggestedAuthor[];
  isAuthenticated: boolean;
  onLoginRequired: () => void;
}) {
  const utils = trpc.useUtils();
  const [pendingAuthorId, setPendingAuthorId] = useState<string | null>(null);
  const toggleFollow = trpc.writingPlatform.toggleFollow.useMutation({
    onSuccess: () => {
      void utils.writingPlatform.listSuggestedAuthors.invalidate();
      void utils.writingPlatform.listFollowingFeed.invalidate();
      void utils.writingPlatform.listPosts.invalidate();
      void utils.writingPlatform.listPostsPaginated.invalidate();
      void utils.writingPlatform.listTrendingPosts.invalidate();
    },
    onSettled: () => setPendingAuthorId(null),
  });

  if (authors.length === 0) return null;

  return (
    <section
      aria-label="আবিষ্কার করুন নতুন লেখক"
      style={{
        ...cardStyle,
        padding: "1rem",
        borderColor: "rgba(196,181,253,0.28)",
        background: "linear-gradient(135deg, rgba(129,140,248,0.14), rgba(81,139,255,0.07) 56%, rgba(247,213,111,0.07))",
        display: "grid",
        gap: "0.8rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ color: "#C4B5FD", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 900, fontSize: "0.8rem" }}><Users size={15} /> নতুন কণ্ঠ আবিষ্কার করুন</div>
          <p style={{ margin: "0.2rem 0 0", color: "rgba(253,246,236,0.6)", fontSize: "0.78rem", lineHeight: 1.55 }}>পাঠকদের পছন্দের লেখকদের অনুসরণ করুন—তাঁদের নতুন লেখা আপনার ফিডে আগে দেখবেন।</p>
        </div>
        <span style={{ flexShrink: 0, color: "rgba(253,246,236,0.42)", fontSize: "0.72rem", paddingTop: 2 }}>লেখকবৃত্ত</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 8 }}>
        {authors.map((author) => {
          const waiting = pendingAuthorId === author.authorOpenId;
          return (
            <div key={author.authorOpenId} style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0, padding: "0.72rem", borderRadius: 15, background: "rgba(5,11,20,0.28)", border: "1px solid rgba(255,255,255,0.075)" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, overflow: "hidden", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #D4A843, #7C8CFF)", border: "1px solid rgba(232,201,122,0.36)", color: "#071426", fontWeight: 900 }}>
                {author.authorAvatarUrl ? <img src={author.authorAvatarUrl} alt={`${author.authorName} এর প্রোফাইল`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : author.authorName.slice(0, 1).toUpperCase()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ color: "#FDF6EC", fontWeight: 900, fontSize: "0.84rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{author.authorName}</div>
                <div style={{ color: "rgba(253,246,236,0.46)", fontSize: "0.7rem", marginTop: 2 }}>{author.postCount}টি প্রকাশিত লেখা · {author.totalViews} পাঠ</div>
              </div>
              <button
                type="button"
                aria-label={`${author.authorName}-কে ${author.following ? "অনুসরণ বন্ধ" : "অনুসরণ"} করুন`}
                disabled={waiting}
                onClick={() => {
                  if (!isAuthenticated) { onLoginRequired(); return; }
                  setPendingAuthorId(author.authorOpenId);
                  toggleFollow.mutate({ authorOpenId: author.authorOpenId });
                }}
                style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, padding: "0.38rem 0.55rem", borderRadius: 999, border: author.following ? "1px solid rgba(134,239,172,0.38)" : "1px solid rgba(247,213,111,0.42)", background: author.following ? "rgba(134,239,172,0.10)" : "rgba(247,213,111,0.10)", color: author.following ? "#86EFAC" : "#F7D56F", fontFamily: adorshoFont, fontWeight: 900, fontSize: "0.7rem", cursor: waiting ? "wait" : "pointer", opacity: waiting ? 0.65 : 1 }}
              >
                {waiting ? <RefreshCw size={12} style={{ animation: "spin 0.8s linear infinite" }} /> : author.following ? <Check size={12} /> : <UserPlus size={12} />}
                {author.following ? "অনুসরণ" : "অনুসরণ"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AmiOLikhboBastobota() {
  const auth = trpc.auth.me.useQuery(undefined, { retry: false });
  const user = auth.data;
  const isAuthenticated = Boolean(user);
  const loginHref = isLoginConfigured ? getLoginUrl() : "/amio-likhbo-login";
  const signupHref = isLoginConfigured ? getSignupUrl() : "/amio-likhbo-login?mode=register";

  const [, params] = useRoute("/amio-likhbo-bastobota/:slug");
  const [, setLocation] = useLocation();
  const slugFromUrl = params?.slug ?? null;

  // Fetch profile avatarUrl from /api/profile (since users table doesn't store avatarUrl)
  const [profileAvatarUrl, setProfileAvatarUrl] = useState("");
  useEffect(() => {
    if (!isAuthenticated) { setProfileAvatarUrl(""); return; }
    fetch("/api/profile").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.avatarUrl) setProfileAvatarUrl(d.avatarUrl);
    }).catch(() => {});
  }, [isAuthenticated]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<{ id: number; title: string; prompt: string; category: CategoryKey } | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [feedMode, setFeedMode] = useState<"all" | "following" | "trending">("all");
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCollectionSlug, setSelectedCollectionSlug] = useState<string | null>(null);
  // Check for password reset token in URL
  const resetTokenFromUrl = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("reset_token") || ""
    : "";
  const [showLocalAuth, setShowLocalAuth] = useState(() => Boolean(resetTokenFromUrl));
  const [localAuthMode, setLocalAuthMode] = useState<"login" | "register">("login");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editingPost, setEditingPost] = useState<EnrichedPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [feedLimit, setFeedLimit] = useState(6);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const postsQuery = trpc.writingPlatform.listPostsPaginated.useQuery(
    {
      limit: feedLimit,
      offset: 0,
      category: selectedCategory === "all" ? undefined : selectedCategory,
    },
    {
      refetchInterval: false,
      refetchIntervalInBackground: false,
      enabled: !searchActive && !showMyPosts,
      retry: false,
      staleTime: 300000,
      gcTime: 600000,
    }
  );
  const followingFeedQuery = trpc.writingPlatform.listFollowingFeed.useQuery(
    { limit: feedLimit, offset: 0, category: selectedCategory === "all" ? undefined : selectedCategory },
    { enabled: isAuthenticated && !searchActive && !showMyPosts && feedMode === "following", retry: false, staleTime: 60000 }
  );
  const trendingFeedQuery = trpc.writingPlatform.listTrendingPosts.useQuery(
    { limit: feedLimit },
    { enabled: !searchActive && !showMyPosts && feedMode === "trending", retry: false, staleTime: 60000 }
  );
  const notificationsQuery = trpc.writingPlatform.listNotifications.useQuery(
    { limit: 20 },
    { enabled: isAuthenticated, retry: false, refetchInterval: 60000, staleTime: 30000 }
  );
  const markNotificationsRead = trpc.writingPlatform.markNotificationsRead.useMutation({
    onSuccess: () => utils.writingPlatform.listNotifications.invalidate(),
  });
  const activeChallengesQuery = trpc.writingPlatform.listActiveChallenges.useQuery(undefined, { staleTime: 300000, retry: false });
  const suggestedAuthorsQuery = trpc.writingPlatform.listSuggestedAuthors.useQuery({ limit: 4 }, { staleTime: 300000, retry: false });
  const editorialPicksQuery = trpc.writingPlatform.listEditorialPicks.useQuery(undefined, { staleTime: 300000, retry: false });
  const collectionsQuery = trpc.writingPlatform.listCollections.useQuery(undefined, { staleTime: 300000, retry: false });
  const liveEventsQuery = trpc.writingPlatform.listLiveEvents.useQuery(undefined, { staleTime: 60000, retry: false });
  const collaborationInvitesQuery = trpc.writingPlatform.myCollaborationInvites.useQuery(undefined, { enabled: isAuthenticated, staleTime: 30000, retry: false });
  const respondToCollaboration = trpc.writingPlatform.respondToCollaborationInvite.useMutation({ onSuccess: () => { utils.writingPlatform.myCollaborationInvites.invalidate(); utils.writingPlatform.listNotifications.invalidate(); } });
  const activeChallenges = activeChallengesQuery.data ?? [];
  const suggestedAuthors = (suggestedAuthorsQuery.data ?? []) as SuggestedAuthor[];
  const editorialPicks = editorialPicksQuery.data ?? [];
  const collections = collectionsQuery.data ?? [];
  const selectedCollectionQuery = trpc.writingPlatform.getCollectionBySlug.useQuery(
    { slug: selectedCollectionSlug ?? "_" }, { enabled: Boolean(selectedCollectionSlug), retry: false, staleTime: 300000 }
  );
  const liveEvents = liveEventsQuery.data ?? [];
  const collaborationInvites = collaborationInvitesQuery.data ?? [];
  const searchQuery_ = searchQuery.trim();
  const debouncedSearch_ = debouncedSearch.trim();
  const searchResultsQuery = trpc.writingPlatform.searchPosts.useQuery(
    { query: debouncedSearch_ || "_" },
    { enabled: searchActive && debouncedSearch_.length >= 2, retry: false, staleTime: 30000 }
  );
  const utils = trpc.useUtils();
  const deletePostMutation = trpc.writingPlatform.deletePost.useMutation({
    onSuccess: () => {
      utils.writingPlatform.listPosts.invalidate();
      utils.writingPlatform.listPostsPaginated.invalidate();
      utils.writingPlatform.myPosts.invalidate();
    },
  });
  const myPostsQuery = trpc.writingPlatform.myPosts.useQuery(undefined, {
    enabled: isAuthenticated && showMyPosts,
    retry: false,
  });
  const activeFeedQuery = searchActive && debouncedSearch_.length >= 2
    ? searchResultsQuery
    : showMyPosts
      ? myPostsQuery
      : feedMode === "following"
        ? followingFeedQuery
        : feedMode === "trending"
          ? trendingFeedQuery
          : postsQuery;
  const feedHasError = Boolean(activeFeedQuery.isError);
  const feedIsLoading = Boolean(activeFeedQuery.isLoading);
  const [feedLoadingDelayed, setFeedLoadingDelayed] = useState(false);
  useEffect(() => {
    if (!feedIsLoading) {
      setFeedLoadingDelayed(false);
      return;
    }
    const timeout = window.setTimeout(() => setFeedLoadingDelayed(true), 8000);
    return () => window.clearTimeout(timeout);
  }, [feedIsLoading]);
  const showFeedRecovery = !showMyPosts && feedIsLoading && feedLoadingDelayed;
  const posts = useMemo(() => (
    (searchActive && debouncedSearch_.length >= 2
      ? (searchResultsQuery.data ?? [])
      : feedMode === "following"
        ? (followingFeedQuery.data?.posts ?? [])
        : feedMode === "trending"
          ? (trendingFeedQuery.data ?? [])
          : (postsQuery.data?.posts ?? [])) as EnrichedPost[]
  ), [searchActive, debouncedSearch_, feedMode, searchResultsQuery.data, postsQuery.data, followingFeedQuery.data, trendingFeedQuery.data]);
  const filteredPosts = useMemo(() => (
    selectedCategory === "all" ? posts : posts.filter((p) => p.category === selectedCategory)
  ), [posts, selectedCategory]);
  const displayPosts = useMemo(() => (
    showMyPosts ? ((myPostsQuery.data ?? []) as EnrichedPost[]) : filteredPosts
  ), [showMyPosts, myPostsQuery.data, filteredPosts]);

  useEffect(() => {
    if (!isAuthenticated && showMyPosts) {
      setShowMyPosts(false);
    }
  }, [isAuthenticated, showMyPosts]);

  useEffect(() => {
    setFeedLimit(6);
  }, [selectedCategory, feedMode]);

    const handleLoginRequired = useCallback(() => {
    setShowLoginPrompt(true);
    setTimeout(() => setShowLoginPrompt(false), 4000);
  }, []);
  const handleOpenDetail = useCallback((slug: string) => {
    setLocation(`/amio-likhbo-bastobota/${slug}`);
  }, [setLocation]);
  const handleBack = useCallback(() => {
    setLocation("/amio-likhbo-bastobota");
  }, [setLocation]);
  const handleEditPost = useCallback((p: EnrichedPost) => setEditingPost(p), []);
  const handleDeletePost = useCallback((id: number) => deletePostMutation.mutate({ postId: id }), [deletePostMutation]);

  return (
    <div className="amio-feed" style={shellStyle}>
      <Seo
        title="আমিও লিখবো বাস্তবতা | সোশ্যাল ফিড"
        description="বাস্তব জীবনের গল্প, অভিজ্ঞতা, কবিতা ও ভাবনা শেয়ার করুন। আমিও লিখবো বাস্তবতা — একটি বাংলা সোশ্যাল লেখার প্ল্যাটফর্ম।"
        path="/amio-likhbo-bastobota"
        type="website"
      />
      <Navbar />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInFast { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { transform: scale(0.88); opacity: 0; } 60% { transform: scale(1.06); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
        @keyframes pulseGold { 0%, 100% { box-shadow: 0 0 0 0 rgba(212,168,67,0); } 50% { box-shadow: 0 0 0 6px rgba(212,168,67,0.18); } }
        @keyframes reactionPop { 0% { transform: scale(1); } 40% { transform: scale(1.35); } 70% { transform: scale(0.92); } 100% { transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .post-card-enter { animation: fadeIn 0.3s ease-out forwards; }
        .amio-topbar-avatar { transition: opacity 0.15s, transform 0.18s; }
        .amio-topbar-avatar:hover { opacity: 0.85; transform: scale(1.07); }
        .amio-post-btn { transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s; }
        .amio-post-btn:hover { opacity: 0.92; transform: scale(1.04); box-shadow: 0 8px 28px rgba(212,168,67,0.38) !important; }
        .amio-post-card { transition: border-color 0.2s, box-shadow 0.2s; }
        .amio-post-card:hover { border-color: rgba(232,201,122,0.38) !important; box-shadow: 0 14px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(232,201,122,0.12) !important; }
        .amio-cat-btn { transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.15s; }
        .amio-cat-btn:hover { background: rgba(232,201,122,0.16) !important; border-color: rgba(232,201,122,0.45) !important; transform: translateY(-1px); }
        .amio-action-btn { transition: background 0.15s, transform 0.12s; }
        .amio-action-btn:hover { background: rgba(255,255,255,0.12) !important; transform: translateY(-1px); }
        .amio-reaction-btn { transition: background 0.15s, transform 0.15s, border-color 0.15s; }
        .amio-reaction-btn:hover { transform: scale(1.12); }
        .amio-reaction-btn.reacted { animation: reactionPop 0.35s cubic-bezier(0.22,1,0.36,1); }
        .amio-media-img { transition: transform 0.35s cubic-bezier(0.22,1,0.36,1); }
        .amio-media-img:hover { transform: scale(1.025); }
        .amio-sticky-bar { position: sticky; top: 0; z-index: 10; }
        .amio-search-input:focus { border-color: rgba(247,213,111,0.55) !important; box-shadow: 0 0 0 3px rgba(212,168,67,0.12), 0 2px 12px rgba(212,168,67,0.10) !important; }
        .amio-skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%); background-size: 600px 100%; animation: shimmer 1.6s infinite linear; border-radius: 10px; }
        .amio-gold-glow { box-shadow: 0 0 18px rgba(212,168,67,0.28), 0 4px 20px rgba(212,168,67,0.18); }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(212,168,67,0.28); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(212,168,67,0.5); }
        .amio-feed { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; overflow-x: clip; }
        .amio-sticky-bar, .amio-feed-toolbar, .amio-post-list, .post-card-enter, .amio-post-card { width: 100%; min-width: 0; max-width: 100%; box-sizing: border-box; }
        .amio-post-list { grid-template-columns: minmax(0, 1fr); }
        .amio-feed {
          --amio-gold: #f7d56f;
          --amio-ink: #071426;
          --amio-glass: linear-gradient(145deg, rgba(255,255,255,0.095), rgba(255,255,255,0.025));
          background-image: radial-gradient(circle at 12% 9%, rgba(247,213,111,0.16), transparent 28%), radial-gradient(circle at 92% 24%, rgba(81,139,255,0.12), transparent 25%), linear-gradient(180deg, #060b14 0%, #0a1525 52%, #07101d 100%) !important;
        }
        .amio-main-column { isolation: isolate; }
        .amio-sticky-bar { filter: drop-shadow(0 14px 30px rgba(0,0,0,0.18)); }
        .amio-sticky-bar > div { border-radius: 26px 26px 0 0 !important; background: linear-gradient(135deg, rgba(247,213,111,0.19), rgba(74,112,181,0.10) 58%, rgba(255,255,255,0.05)) !important; }
        .amio-community-title { font-size: clamp(1.12rem, 4.2vw, 1.45rem) !important; letter-spacing: 0.035em !important; }
        .amio-community-subtitle { color: rgba(253,246,236,0.62) !important; letter-spacing: 0.035em !important; }
        .amio-feed-toolbar { background: linear-gradient(145deg, rgba(7,20,38,0.92), rgba(18,32,53,0.78)) !important; box-shadow: 0 18px 45px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.1) !important; }
        .amio-category-rail { padding: 0.2rem 0 0.3rem !important; mask-image: linear-gradient(90deg, #000 94%, transparent); }
        .amio-cat-btn { min-height: 38px; transition: transform 160ms cubic-bezier(.23,1,.32,1), border-color 160ms ease, background 160ms ease !important; }
        .amio-cat-btn:active, .amio-post-btn:active, .amio-login-btn:active { transform: scale(0.97); }
        .amio-community-status { display: flex; align-items: center; justify-content: space-between; gap: 0.7rem; padding: 0.72rem 0.88rem; border: 1px solid rgba(232,201,122,0.16); border-radius: 16px; background: linear-gradient(90deg, rgba(247,213,111,0.10), rgba(81,139,255,0.075)); box-shadow: inset 0 1px 0 rgba(255,255,255,0.055); color: rgba(253,246,236,0.68); font-size: 0.79rem; line-height: 1.4; }
        .amio-community-status strong { color: var(--amio-gold); font-weight: 900; }
        .amio-community-status > span:first-child { display: inline-flex; align-items: center; gap: 0.36rem; color: #f7d56f; white-space: nowrap; font-weight: 900; }
        .amio-post-card { position: relative; overflow: hidden; background: var(--amio-glass) !important; border-color: rgba(232,201,122,0.18) !important; box-shadow: 0 16px 44px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08) !important; transition: transform 180ms cubic-bezier(.23,1,.32,1), border-color 180ms ease, box-shadow 180ms ease; }
        .amio-post-card::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 3px; background: linear-gradient(180deg, #f7d56f, rgba(81,139,255,0.55), transparent 82%); opacity: 0.68; }
        .amio-post-card:hover { transform: translateY(-2px); border-color: rgba(247,213,111,0.35) !important; box-shadow: 0 22px 56px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.1) !important; }
        .amio-post-card > * { position: relative; z-index: 1; }
        .amio-post-author { letter-spacing: 0.015em; }
        .amio-post-content { color: rgba(253,246,236,0.92) !important; }
        .amio-post-actions { padding-top: 0.75rem; border-top: 1px solid rgba(232,201,122,0.11); }
        .amio-post-primary-actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.38rem; }
        .amio-post-primary-actions > * { min-width: 0; }
        .amio-post-primary-actions .amio-action-btn, .amio-post-primary-actions button { width: 100%; justify-content: center; border-radius: 12px !important; padding-inline: 0.32rem !important; }
        .amio-post-secondary-actions { display: flex; align-items: center; padding-top: 0.15rem; }
        .amio-post-list { gap: 1.1rem !important; }
        .amio-composer { position: relative; overflow: hidden; padding: 0.95rem; border: 1px solid rgba(232,201,122,0.22); border-radius: 22px; background: linear-gradient(145deg, rgba(21,37,61,0.88), rgba(7,20,38,0.78)); box-shadow: 0 18px 45px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08); backdrop-filter: blur(18px); }
        .amio-composer::before { content: \"\"; position: absolute; inset: 0 auto 0 0; width: 3px; background: linear-gradient(180deg, #f7d56f, rgba(81,139,255,0.60), transparent 80%); }
        .amio-composer-trigger { transition: background 160ms ease, border-color 160ms ease, transform 160ms ease; }
        .amio-composer-trigger:hover { background: rgba(255,255,255,0.105) !important; border-color: rgba(247,213,111,0.42) !important; transform: translateY(-1px); }
        .amio-composer-action { transition: background 160ms ease, color 160ms ease; }
        .amio-composer-action:hover { background: rgba(247,213,111,0.12) !important; color: #f7d56f !important; }
        @media (max-width: 480px) {
          .amio-feed-toolbar { gap: 0.45rem !important; padding: 0.6rem !important; }
          .amio-search-input { padding: 0.55rem 1.7rem 0.55rem 2.2rem !important; font-size: 0.84rem !important; }
          .amio-post-btn, .amio-login-btn { width: 38px !important; height: 38px !important; min-width: 38px !important; padding: 0 !important; justify-content: center !important; gap: 0 !important; font-size: 0 !important; }
          .amio-post-btn svg, .amio-login-btn svg { width: 17px; height: 17px; }
          .amio-topbar-avatar { width: 34px !important; height: 34px !important; }
          .amio-post-card { padding: 0.95rem !important; gap: 0.8rem !important; border-radius: 18px !important; }
          .amio-post-author { font-size: 0.96rem !important; }
          .amio-post-content { font-size: 0.96rem !important; line-height: 1.78 !important; }
          .amio-post-actions { gap: 0.45rem !important; }
          .amio-community-status { align-items: flex-start; flex-direction: column; gap: 0.35rem; padding: 0.68rem 0.78rem; }
          .amio-post-card { border-radius: 20px !important; }
          .amio-post-card:hover { transform: none; }
        }
      `}</style>

      <main style={{ padding: "calc(var(--site-nav-offset, 98px) + 1rem) 0 3rem", minHeight: "100vh" }}>
        <div className="amio-main-column" style={{ width: "min(720px, calc(100% - clamp(0.75rem, 4vw, 1.5rem)))", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0, 1fr)", minWidth: 0, gap: "1rem" }}>

          {/* ── Logo Header + Sticky Topbar ── */}
          {!slugFromUrl && (
            <div className="amio-sticky-bar" style={{ display: "grid", gap: 0 }}>
            {/* Logo */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "0.9rem 1rem 0.65rem",
              borderRadius: "22px 22px 0 0",
              background: "linear-gradient(180deg, rgba(212,168,67,0.14) 0%, rgba(255,255,255,0.05) 100%)",
              border: "1px solid rgba(232,201,122,0.22)",
              borderBottom: "none",
              backdropFilter: "blur(16px)",
            }}>
              <div className="amio-gold-glow" style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #F7D56F 0%, #D4A843 55%, #B98A24 100%)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}>
                <PenLine size={17} color="#050B14" />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  color: "#F7D56F",
                  fontFamily: adorshoFont,
                  fontWeight: 900,
                  fontSize: "clamp(1.05rem, 3.5vw, 1.25rem)",
                  letterSpacing: "0.025em",
                  lineHeight: 1.2,
                  textShadow: "0 0 20px rgba(212,168,67,0.35)",
                }} className="amio-community-title">আমিও লিখবো বাস্তবতা</div>
                <div style={{
                  color: "rgba(253,246,236,0.48)",
                  fontFamily: adorshoFont,
                  fontSize: "0.73rem",
                  marginTop: 2,
                  letterSpacing: "0.02em",
                }} className="amio-community-subtitle">বাস্তব গল্প • অভিজ্ঞতা • ভাবনা • কবিতা</div>
              </div>
            </div>
            </div>
          )}

          {/* ── Top Bar: Search + Post Button + Profile ── */}
          {!slugFromUrl && (
            <div className="amio-feed-toolbar" style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0.7rem 0.9rem",
              borderRadius: "0 0 22px 22px",
              background: "linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.045))",
              border: "1px solid rgba(232,201,122,0.22)",
              borderTop: "none",
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 36px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.07)",
              marginTop: "-1rem",
              minWidth: 0,
            }}>
              {/* Search bar */}
              <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(253,246,236,0.38)", pointerEvents: "none" }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val.trim().length >= 2) {
                      setSearchActive(true);
                      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                      searchDebounceRef.current = setTimeout(() => setDebouncedSearch(val), 400);
                    } else {
                      setSearchActive(false);
                      setDebouncedSearch("");
                      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                    }
                  }}
                  onFocus={() => searchQuery.trim().length >= 2 && setSearchActive(true)}
                  placeholder="পোস্ট বা লেখক খুঁজুন..."
                  className="amio-search-input"
                  style={{
                    width: "100%",
                    padding: "0.6rem 2rem 0.6rem 2.4rem",
                    borderRadius: 999,
                    border: searchActive ? "1px solid rgba(247,213,111,0.5)" : "1px solid rgba(232,201,122,0.20)",
                    background: searchActive ? "rgba(255,255,255,0.075)" : "rgba(255,255,255,0.055)",
                    color: "#FDF6EC",
                    fontFamily: adorshoFont,
                    fontSize: "0.9rem",
                    outline: "none",
                    transition: "border 0.2s, background 0.2s, box-shadow 0.2s",
                    boxSizing: "border-box",
                  }}
                />
                {searchActive && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setSearchActive(false); setDebouncedSearch(""); if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); }}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(253,246,236,0.45)", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Post button */}
              {isAuthenticated ? (
                <button
                  className="amio-post-btn"
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  title="নতুন পোস্ট লিখুন"
                  aria-label="নতুন পোস্ট লিখুন"
                  style={{
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "0.52rem 0.95rem",
                    borderRadius: 999,
                    background: "linear-gradient(135deg, #F7D56F 0%, #D4A843 58%, #B98A24 100%)",
                    border: "1px solid rgba(255,235,166,0.6)",
                    color: "#071426",
                    fontFamily: adorshoFont,
                    fontWeight: 900,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(212,168,67,0.28)",
                    transition: "opacity 0.15s, transform 0.12s",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Plus size={15} /> পোস্ট
                </button>
              ) : (
                <a
                  href={isLoginConfigured ? loginHref : "/amio-likhbo-login"}
                  className="amio-login-btn"
                  aria-label="লগইন করুন"
                  style={{
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "0.52rem 0.95rem",
                    borderRadius: 999,
                    background: "linear-gradient(135deg, #F7D56F 0%, #D4A843 58%, #B98A24 100%)",
                    border: "1px solid rgba(255,235,166,0.6)",
                    color: "#071426",
                    fontFamily: adorshoFont,
                    fontWeight: 900,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(212,168,67,0.28)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <KeyRound size={15} /> লগইন
                </a>
              )}

              {isAuthenticated && (
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <button
                    type="button"
                    className="amio-topbar-avatar"
                    aria-label="নোটিফিকেশন"
                    aria-expanded={showNotifications}
                    onClick={() => {
                      const next = !showNotifications;
                      setShowNotifications(next);
                      if (next && notificationsQuery.data?.unreadCount) markNotificationsRead.mutate({});
                    }}
                    style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center", border: "2px solid rgba(232,201,122,0.35)", background: showNotifications ? "rgba(247,213,111,0.16)" : "rgba(255,255,255,0.055)", color: "#F7D56F", cursor: "pointer" }}
                  >
                    <Bell size={16} />
                    {Boolean(notificationsQuery.data?.unreadCount) && <span style={{ position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 99, display: "grid", placeItems: "center", padding: "0 3px", background: "#EF4444", color: "#fff", fontSize: "0.62rem", fontWeight: 900, border: "2px solid #081220" }}>{Math.min(notificationsQuery.data?.unreadCount ?? 0, 9)}</span>}
                  </button>
                  {showNotifications && (
                    <div style={{ position: "absolute", right: 0, top: "calc(100% + 9px)", zIndex: 80, width: "min(340px, calc(100vw - 1.5rem))", maxHeight: 420, overflowY: "auto", padding: "0.6rem", borderRadius: 18, border: "1px solid rgba(232,201,122,0.28)", background: "rgba(7,20,38,0.98)", boxShadow: "0 18px 52px rgba(0,0,0,0.52)", backdropFilter: "blur(22px)" }}>
                      <div style={{ padding: "0.35rem 0.45rem 0.6rem", color: "#F7D56F", fontWeight: 900, fontSize: "0.9rem" }}>আপডেট ও প্রতিক্রিয়া</div>
                      {(notificationsQuery.data?.items ?? []).length === 0 ? <div style={{ padding: "1.2rem 0.6rem", color: "rgba(253,246,236,0.54)", textAlign: "center", fontSize: "0.85rem" }}>এখনো নতুন কোনো নোটিফিকেশন নেই।</div> : (notificationsQuery.data?.items ?? []).map((notification) => (
                        <button key={notification.id} type="button" onClick={() => setShowNotifications(false)} style={{ width: "100%", textAlign: "left", display: "grid", gap: 3, padding: "0.65rem", border: "1px solid rgba(232,201,122,0.10)", borderRadius: 12, background: notification.readAt ? "rgba(255,255,255,0.025)" : "rgba(247,213,111,0.09)", color: "#FDF6EC", fontFamily: adorshoFont, cursor: "pointer", marginBottom: 5 }}>
                          <span style={{ fontWeight: 900, fontSize: "0.82rem", color: notification.readAt ? "rgba(253,246,236,0.74)" : "#F7D56F" }}>{notification.title}</span>
                          {notification.body && <span style={{ color: "rgba(253,246,236,0.52)", fontSize: "0.76rem", lineHeight: 1.45 }}>{notification.body}</span>}
                          <TimeAgo date={notification.createdAt} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Profile avatar / icon */}
              <a
                href="/profile"
                className="amio-topbar-avatar"
                title="প্রোফাইল"
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: isAuthenticated && profileAvatarUrl
                    ? `url(${profileAvatarUrl}) center/cover no-repeat`
                    : "linear-gradient(135deg, rgba(212,168,67,0.25), rgba(81,139,255,0.15))",
                  border: "2px solid rgba(232,201,122,0.35)",
                  textDecoration: "none",
                  color: "#F7D56F",
                  transition: "opacity 0.15s",
                  overflow: "hidden",
                }}
              >
                {!(isAuthenticated && profileAvatarUrl) && (
                  isAuthenticated
                    ? <span style={{ color: "#F7D56F", fontWeight: 900, fontSize: "0.85rem", fontFamily: adorshoFont }}>{(user?.name?.[0] || "?").toUpperCase()}</span>
                    : <User size={16} color="rgba(253,246,236,0.6)" />
                )}
              </a>
            </div>
          )}

          {/* ── Familiar social composer ── */}
          {!slugFromUrl && (
            <section className="amio-composer" aria-label="নতুন লেখা প্রকাশ করুন">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 42, height: 42, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(232,201,122,0.38)", background: profileAvatarUrl ? `url(${profileAvatarUrl}) center/cover no-repeat` : "linear-gradient(135deg, rgba(247,213,111,0.3), rgba(81,139,255,0.2))", color: "#F7D56F", fontWeight: 900 }}>{!profileAvatarUrl && (isAuthenticated ? (user?.name?.[0] || "?").toUpperCase() : <PenLine size={18} />)}</div>
                <button type="button" className="amio-composer-trigger" onClick={() => { if (!isAuthenticated) { handleLoginRequired(); return; } setShowCreateModal(true); }} style={{ flex: 1, minWidth: 0, textAlign: "left", padding: "0.7rem 0.95rem", borderRadius: 999, border: "1px solid rgba(232,201,122,0.16)", background: "rgba(255,255,255,0.06)", color: "rgba(253,246,236,0.58)", fontFamily: adorshoFont, fontSize: "0.93rem", cursor: "pointer" }}>{isAuthenticated ? `${user?.name || "আপনি"}, আজ কী ভাবছেন?` : "নিজের অনুভূতি লিখতে লগইন করুন..."}</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6, marginTop: 10, paddingTop: 9, borderTop: "1px solid rgba(232,201,122,0.12)" }}>
                <button type="button" className="amio-composer-action" onClick={() => { if (!isAuthenticated) { handleLoginRequired(); return; } setShowCreateModal(true); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0.5rem 0.25rem", border: "none", borderRadius: 11, background: "transparent", color: "rgba(253,246,236,0.72)", fontFamily: adorshoFont, fontWeight: 800, fontSize: "0.78rem", cursor: "pointer" }}><Edit3 size={15} color="#F7D56F" /> লিখুন</button>
                <button type="button" className="amio-composer-action" onClick={() => { if (!isAuthenticated) { handleLoginRequired(); return; } setShowCreateModal(true); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0.5rem 0.25rem", border: "none", borderRadius: 11, background: "transparent", color: "rgba(253,246,236,0.72)", fontFamily: adorshoFont, fontWeight: 800, fontSize: "0.78rem", cursor: "pointer" }}><Camera size={15} color="#86EFAC" /> ছবি যোগ করুন</button>
                <button type="button" className="amio-composer-action" onClick={() => { if (!isAuthenticated) { handleLoginRequired(); return; } setSelectedChallenge(null); setShowCreateModal(true); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0.5rem 0.25rem", border: "none", borderRadius: 11, background: "transparent", color: "rgba(253,246,236,0.72)", fontFamily: adorshoFont, fontWeight: 800, fontSize: "0.78rem", cursor: "pointer" }}><Sparkles size={15} color="#A5B4FC" /> ভাবনা লিখুন</button>
              </div>
            </section>
          )}

          {/* ── Category Filter + My Posts Toggle ── */}
          {!slugFromUrl && (
            <div className="amio-category-rail" style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", minWidth: 0, paddingBottom: 2, scrollbarWidth: "none" }}>
              {([
                { key: "all", label: "সবার জন্য", icon: <Sparkles size={14} /> },
                { key: "following", label: "অনুসরণ করছেন", icon: <Users size={14} /> },
                { key: "trending", label: "জনপ্রিয়", icon: <Radio size={14} /> },
              ] as const).map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  className="amio-cat-btn"
                  onClick={() => {
                    if (mode.key === "following" && !isAuthenticated) { handleLoginRequired(); return; }
                    setFeedMode(mode.key);
                    setShowMyPosts(false);
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "0.42rem 0.85rem", borderRadius: 999, border: feedMode === mode.key && !showMyPosts ? "1px solid rgba(129,140,248,0.70)" : "1px solid rgba(232,201,122,0.2)", background: feedMode === mode.key && !showMyPosts ? "linear-gradient(135deg, rgba(129,140,248,0.18), rgba(247,213,111,0.10))" : "rgba(255,255,255,0.04)", color: feedMode === mode.key && !showMyPosts ? "#C4B5FD" : "rgba(253,246,236,0.6)", fontFamily: adorshoFont, fontWeight: feedMode === mode.key && !showMyPosts ? 900 : 700, fontSize: "0.82rem", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                >{mode.icon} {mode.label}</button>
              ))}
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className="amio-cat-btn"
                  onClick={() => { setSelectedCategory(cat.key); setFeedMode("all"); setShowMyPosts(false); }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "0.42rem 0.85rem",
                    borderRadius: 999,
                    border: selectedCategory === cat.key && !showMyPosts
                      ? "1px solid rgba(247,213,111,0.7)"
                      : "1px solid rgba(232,201,122,0.2)",
                    background: selectedCategory === cat.key && !showMyPosts
                      ? "linear-gradient(135deg, rgba(247,213,111,0.2), rgba(212,168,67,0.12))"
                      : "rgba(255,255,255,0.04)",
                    color: selectedCategory === cat.key && !showMyPosts ? "#F7D56F" : "rgba(253,246,236,0.6)",
                    fontFamily: adorshoFont,
                    fontWeight: selectedCategory === cat.key && !showMyPosts ? 900 : 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    boxShadow: selectedCategory === cat.key && !showMyPosts ? "0 2px 12px rgba(212,168,67,0.18)" : "none",
                  }}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
              {isAuthenticated && (
                <button
                  type="button"
                  className="amio-cat-btn"
                  onClick={() => { setShowMyPosts((p) => !p); setFeedMode("all"); }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "0.42rem 0.85rem",
                    borderRadius: 999,
                    border: showMyPosts
                      ? "1px solid rgba(129,140,248,0.6)"
                      : "1px solid rgba(232,201,122,0.2)",
                    background: showMyPosts
                      ? "rgba(129,140,248,0.15)"
                      : "rgba(255,255,255,0.04)",
                    color: showMyPosts ? "#A5B4FC" : "rgba(253,246,236,0.6)",
                    fontFamily: adorshoFont,
                    fontWeight: showMyPosts ? 900 : 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    marginLeft: "auto",
                  }}
                >
                  <UserPlus size={13} /> আমার লেখা
                </button>
              )}
            </div>
          )}

          {!slugFromUrl && (
            <div className="amio-community-status" aria-live="polite">
              <span><Sparkles size={14} /> {showMyPosts ? "আমার লেখার খাতা" : selectedCategory === "all" ? "সবার অনুভূতির আড্ডা" : `${CATEGORIES.find((category) => category.key === selectedCategory)?.label || "নির্বাচিত"} বিভাগ`}</span>
              <span>{showMyPosts ? `${displayPosts.length}টি লেখা এখানে দেখা যাচ্ছে` : isAuthenticated ? "নতুন লেখা আগে পর্যালোচনায় যায়, তারপর প্রকাশিত হয়।" : "নিজের অনুভূতি লিখতে লগইন করুন।"}</span>
            </div>
          )}

          {!slugFromUrl && suggestedAuthors.length > 0 && (
            <SuggestedAuthorsPanel
              authors={suggestedAuthors}
              isAuthenticated={isAuthenticated}
              onLoginRequired={handleLoginRequired}
            />
          )}

          {!slugFromUrl && (activeChallenges.length > 0 || editorialPicks.length > 0) && (
            <section style={{ display: "grid", gap: "0.75rem" }} aria-label="Community highlights">
              {activeChallenges.slice(0, 1).map((challenge) => (
                <div key={challenge.id} style={{ ...cardStyle, padding: "1rem", borderColor: "rgba(134,239,172,0.28)", background: "linear-gradient(135deg, rgba(134,239,172,0.11), rgba(81,139,255,0.08))", display: "grid", gap: "0.65rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div><div style={{ color: "#86EFAC", fontWeight: 900, fontSize: "0.8rem" }}>এই সপ্তাহের লেখার চ্যালেঞ্জ</div><h2 style={{ margin: "0.2rem 0", color: "#FDF6EC", fontSize: "1.08rem" }}>{challenge.title}</h2><p style={{ margin: 0, color: "rgba(253,246,236,0.68)", fontSize: "0.84rem", lineHeight: 1.65 }}>{challenge.prompt}</p></div>
                    <ActionButton small onClick={() => { if (!isAuthenticated) { handleLoginRequired(); return; } setSelectedChallenge({ id: challenge.id, title: challenge.title, prompt: challenge.prompt, category: challenge.category as CategoryKey }); setShowCreateModal(true); }}><PenLine size={14} /> লিখুন</ActionButton>
                  </div>
                </div>
              ))}
              {editorialPicks.slice(0, 1).map((pick) => (
                <button key={pick.id} type="button" onClick={() => handleOpenDetail(pick.post.slug)} style={{ ...cardStyle, textAlign: "left", padding: "0.9rem 1rem", cursor: "pointer", borderColor: "rgba(247,213,111,0.26)", background: "linear-gradient(135deg, rgba(247,213,111,0.12), rgba(255,255,255,0.035))" }}>
                  <div style={{ color: "#F7D56F", fontWeight: 900, fontSize: "0.78rem", marginBottom: 3 }}><Crown size={13} style={{ verticalAlign: "-2px" }} /> সম্পাদকের নির্বাচন</div>
                  <div style={{ color: "#FDF6EC", fontWeight: 900, fontSize: "1rem" }}>{pick.headline || pick.post.title}</div>
                  {pick.editorNote && <div style={{ color: "rgba(253,246,236,0.62)", fontSize: "0.8rem", marginTop: 4, lineHeight: 1.55 }}>{pick.editorNote}</div>}
                </button>
              ))}
            </section>
          )}

          {!slugFromUrl && (liveEvents.length > 0 || collections.length > 0 || collaborationInvites.length > 0) && (
            <section style={{ display: "grid", gap: "0.75rem" }} aria-label="Literary programming">
              {liveEvents.slice(0, 1).map((event) => {
                const isLive = event.status === "live";
                return <div key={event.id} style={{ ...cardStyle, padding: "0.95rem 1rem", borderColor: isLive ? "rgba(248,113,113,0.38)" : "rgba(196,181,253,0.32)", background: isLive ? "linear-gradient(135deg, rgba(248,113,113,0.12), rgba(81,139,255,0.07))" : "linear-gradient(135deg, rgba(129,140,248,0.12), rgba(255,255,255,0.035))", display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}><span style={{ color: isLive ? "#FCA5A5" : "#C4B5FD", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 900, fontSize: "0.8rem" }}><Radio size={14} /> {isLive ? "লাইভ রাইটিং আওয়ার" : "আসছে লাইভ রাইটিং আওয়ার"}</span><span style={{ color: "rgba(253,246,236,0.48)", fontSize: "0.72rem" }}>{new Date(event.startsAt).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" })}</span></div>
                  <div style={{ color: "#FDF6EC", fontWeight: 900 }}>{event.title}</div><div style={{ color: "rgba(253,246,236,0.62)", fontSize: "0.82rem", lineHeight: 1.55 }}>{event.prompt}</div>
                  <ActionButton small onClick={() => { if (!isAuthenticated) { handleLoginRequired(); return; } setSelectedChallenge(null); setShowCreateModal(true); }}><PenLine size={14} /> এই বিষয়ে লিখুন</ActionButton>
                </div>;
              })}
              {collections.slice(0, 2).map((collection) => (
                <div key={collection.id} style={{ ...cardStyle, padding: "0.85rem 0.95rem", borderColor: "rgba(247,213,111,0.22)", background: "linear-gradient(135deg, rgba(247,213,111,0.10), rgba(255,255,255,0.025))", display: "grid", gap: 5 }}>
                  <button type="button" onClick={() => setSelectedCollectionSlug(selectedCollectionSlug === collection.slug ? null : collection.slug)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, textAlign: "left", border: "none", background: "transparent", padding: 0, cursor: "pointer", fontFamily: adorshoFont }}><span style={{ color: "#F7D56F", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 900, fontSize: "0.83rem" }}><BookMarked size={15} /> {collection.title}</span><ChevronDown size={15} color="#F7D56F" /></button>
                  {collection.description && <span style={{ color: "rgba(253,246,236,0.58)", fontSize: "0.78rem", lineHeight: 1.5 }}>{collection.description}</span>}
                  {selectedCollectionSlug === collection.slug && <div style={{ display: "grid", gap: 5, paddingTop: 5, borderTop: "1px solid rgba(232,201,122,0.12)" }}>{selectedCollectionQuery.isLoading ? <span style={{ color: "rgba(253,246,236,0.48)", fontSize: "0.78rem" }}>সংকলন লোড হচ্ছে...</span> : (selectedCollectionQuery.data?.posts ?? []).slice(0, 5).map((post) => <button key={post.id} type="button" onClick={() => handleOpenDetail(post.slug)} style={{ textAlign: "left", border: "none", background: "rgba(255,255,255,0.035)", borderRadius: 9, padding: "0.45rem 0.55rem", color: "rgba(253,246,236,0.82)", fontFamily: adorshoFont, fontSize: "0.78rem", cursor: "pointer" }}>{post.title}</button>)}</div>}
                </div>
              ))}
              {collaborationInvites.slice(0, 2).map(({ invite, post }) => (
                <div key={invite.id} style={{ ...cardStyle, padding: "0.85rem 0.95rem", borderColor: "rgba(196,181,253,0.32)", background: "rgba(129,140,248,0.08)", display: "grid", gap: 7 }}><span style={{ color: "#C4B5FD", fontWeight: 900, fontSize: "0.82rem" }}><Users size={14} style={{ verticalAlign: "-2px" }} /> যৌথ লেখার আমন্ত্রণ</span><span style={{ color: "rgba(253,246,236,0.68)", fontSize: "0.8rem" }}>“{post.title}” লেখায় আপনাকে সহযোগী হতে আমন্ত্রণ জানানো হয়েছে।</span><div style={{ display: "flex", gap: 7 }}><ActionButton small onClick={() => respondToCollaboration.mutate({ inviteId: invite.id, accept: true })}>গ্রহণ করুন</ActionButton><ActionButton small variant="ghost" onClick={() => respondToCollaboration.mutate({ inviteId: invite.id, accept: false })}>না, ধন্যবাদ</ActionButton></div></div>
              ))}
            </section>
          )}

          {!slugFromUrl && (
            <details style={{ ...cardStyle, padding: "0.8rem 1rem", borderRadius: 16, color: "rgba(253,246,236,0.68)" }}>
              <summary style={{ cursor: "pointer", color: "#F7D56F", fontWeight: 900, fontSize: "0.84rem", fontFamily: adorshoFont }}>কমিউনিটি নীতিমালা ও নিরাপত্তা</summary>
              <div style={{ display: "grid", gap: 7, marginTop: 10, fontSize: "0.8rem", lineHeight: 1.65 }}>
                {COMMUNITY_GUIDELINES.map((guideline) => <div key={guideline} style={{ display: "flex", gap: 7 }}><CheckCircle2 size={14} color="#86EFAC" style={{ flexShrink: 0, marginTop: 3 }} /> {guideline}</div>)}
                <div style={{ color: "rgba(253,246,236,0.5)", marginTop: 2 }}>সমস্যাজনক লেখা দেখলে post-এর পতাকা চিহ্নে চাপ দিয়ে নিরাপদে রিপোর্ট করুন।</div>
              </div>
            </details>
          )}

          {/* ── Local Auth Modal ── */}
          {showLocalAuth && (
            <LocalAuthModal
              defaultMode={localAuthMode}
              resetToken={resetTokenFromUrl || undefined}
              onClose={() => setShowLocalAuth(false)}
              onSuccess={() => setShowLocalAuth(false)}
            />
          )}

          {/* ── Login prompt toast ── */}
          {showLoginPrompt && (
            <div
              style={{
                padding: "0.85rem 1.1rem",
                borderRadius: 16,
                background: "linear-gradient(135deg, rgba(212,168,67,0.14), rgba(212,168,67,0.08))",
                border: "1px solid rgba(212,168,67,0.4)",
                color: "#F7D56F",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                animation: "slideDown 0.3s ease",
                boxShadow: "0 4px 20px rgba(212,168,67,0.12)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
                <KeyRound size={16} /> এই কাজটি করতে লগইন করুন
              </span>
              {isLoginConfigured ? (
                <a
                  href={loginHref}
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: 999,
                    background: "rgba(212,168,67,0.2)",
                    border: "1px solid rgba(212,168,67,0.4)",
                    color: "#F7D56F",
                    fontWeight: 900,
                    fontSize: "0.82rem",
                    textDecoration: "none",
                  }}
                >
                  লগইন করুন
                </a>
              ) : (
                <a
                  href="/amio-likhbo-login"
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: 999,
                    background: "rgba(212,168,67,0.2)",
                    border: "1px solid rgba(212,168,67,0.4)",
                    color: "#F7D56F",
                    fontWeight: 900,
                    fontSize: "0.82rem",
                    fontFamily: adorshoFont,
                    textDecoration: "none",
                  }}
                >
                  লগইন করুন
                </a>
              )}
            </div>
          )}

          {/* ── Detail view ── */}
          {slugFromUrl ? (
            <PostDetail
              slug={slugFromUrl}
              isAuthenticated={isAuthenticated}
              onLoginRequired={handleLoginRequired}
              onBack={handleBack}
            />
          ) : (
            <>
              {/* ── Guidance Panel (shown when not searching and not in my-posts mode) ── */}
              {!searchActive && !showMyPosts && !slugFromUrl && posts.length === 0 && !feedIsLoading && !feedHasError && !postsQuery.isFetching && (
                <GuidancePanel
                  isAuthenticated={isAuthenticated}
                  onWrite={() => setShowCreateModal(true)}
                  onLogin={() => {
                    if (isLoginConfigured) { window.location.href = loginHref; }
                    else { setLocalAuthMode("login"); setShowLocalAuth(true); }
                  }}
                />
              )}

              {/* ── Feed ── */}
              <>{searchActive && debouncedSearch_.length < 2 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "rgba(253,246,236,0.45)", fontSize: "0.9rem" }}>
                  অনুসন্ধানের জন্য কমপক্ষে ২টি অক্ষর লিখুন।
                </div>
              ) : showFeedRecovery ? (
                <div style={{ ...cardStyle, padding: "clamp(1.5rem, 6vw, 2rem)", textAlign: "center", display: "grid", gap: "0.75rem" }}>
                  <RefreshCw size={40} color="rgba(247,213,111,0.55)" style={{ margin: "0 auto" }} />
                  <div style={{ color: "#F7D56F", fontWeight: 900 }}>
                    পোস্ট লোড হতে স্বাভাবিকের চেয়ে বেশি সময় লাগছে।
                  </div>
                  <p style={{ margin: 0, color: "rgba(253,246,236,0.58)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                    সংযোগ সাময়িকভাবে ব্যস্ত হতে পারে। আপনি আবার চেষ্টা করতে পারেন—পেজটি আটকে থাকবে না।
                  </p>
                  <ActionButton onClick={() => { setFeedLoadingDelayed(false); postsQuery.refetch(); }} variant="ghost" small>
                    <RefreshCw size={14} /> আবার চেষ্টা করুন
                  </ActionButton>
                </div>
              ) : (showMyPosts ? myPostsQuery.isLoading : feedIsLoading) ? (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ ...cardStyle, padding: "clamp(1rem,3vw,1.5rem)", display: "grid", gap: "0.9rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="amio-skeleton" style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0 }} />
                        <div style={{ flex: 1, display: "grid", gap: 8 }}>
                          <div className="amio-skeleton" style={{ height: 14, width: "45%" }} />
                          <div className="amio-skeleton" style={{ height: 11, width: "28%" }} />
                        </div>
                      </div>
                      <div style={{ display: "grid", gap: 7 }}>
                        <div className="amio-skeleton" style={{ height: 13, width: "100%" }} />
                        <div className="amio-skeleton" style={{ height: 13, width: "92%" }} />
                        <div className="amio-skeleton" style={{ height: 13, width: "78%" }} />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div className="amio-skeleton" style={{ height: 32, width: 90, borderRadius: 999 }} />
                        <div className="amio-skeleton" style={{ height: 32, width: 80, borderRadius: 999 }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (!showMyPosts && feedHasError) ? (
                <div style={{ ...cardStyle, padding: "clamp(1.5rem, 6vw, 2rem)", textAlign: "center", display: "grid", gap: "0.75rem" }}>
                  <PenLine size={40} color="rgba(247,213,111,0.55)" style={{ margin: "0 auto" }} />
                  <div style={{ color: "#F7D56F", fontWeight: 900 }}>
                    পোস্টগুলো এই মুহূর্তে দেখা যাচ্ছে না।
                  </div>
                  <p style={{ margin: 0, color: "rgba(253,246,236,0.58)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                    নেটওয়ার্ক বা সার্ভার সংযোগ সাময়িকভাবে ব্যস্ত হতে পারে। কিছুক্ষণ পর আবার চেষ্টা করুন।
                  </p>
                  <ActionButton onClick={() => activeFeedQuery.refetch()} variant="ghost" small>
                    <RefreshCw size={14} /> আবার চেষ্টা করুন
                  </ActionButton>
                </div>
              ) : displayPosts.length === 0 ? (
                <EmptyFeedState
                  showMyPosts={showMyPosts}
                  searchActive={searchActive}
                  selectedCategory={selectedCategory}
                  feedMode={feedMode}
                  isAuthenticated={isAuthenticated}
                  onWrite={() => setShowCreateModal(true)}
                  onLogin={() => {
                    if (isLoginConfigured) { window.location.href = loginHref; }
                    else { setLocalAuthMode("login"); setShowLocalAuth(true); }
                  }}
                  onDiscover={() => setFeedMode("all")}
                />
              ) : (
                <div className="amio-post-list" style={{ display: "grid", gap: "1rem", minWidth: 0 }}>
                  {searchActive && debouncedSearch_.length >= 2 && (
                    <div style={{ color: "rgba(253,246,236,0.5)", fontSize: "0.82rem", paddingLeft: 4 }}>
                      "{debouncedSearch_}" এর জন্য {posts.length}টি ফলাফল
                    </div>
                  )}
                  {displayPosts.map((post, idx) => (
                    <div key={post.id} className={idx < 5 ? "post-card-enter" : undefined}>
                      <PostCard
                        post={post}
                        isAuthenticated={isAuthenticated}
                        onLoginRequired={handleLoginRequired}
                        onOpenDetail={handleOpenDetail}
                        currentUserOpenId={user?.openId}
                        onEdit={handleEditPost}
                        onDelete={handleDeletePost}
                      />
                    </div>
                  ))}
                  {!searchActive && !showMyPosts && Boolean(postsQuery.data?.hasMore) && feedLimit < 50 && (
                    <div style={{ textAlign: "center", paddingTop: "0.35rem" }}>
                      <ActionButton
                        onClick={() => setFeedLimit((current) => Math.min(current + 6, 50))}
                        variant="ghost"
                        small
                        disabled={postsQuery.isFetching}
                      >
                        {postsQuery.isFetching ? <RefreshCw size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <ChevronDown size={14} />}
                        {postsQuery.isFetching ? "পোস্ট লোড হচ্ছে..." : "আরও পোস্ট দেখুন"}
                      </ActionButton>
                    </div>
                  )}
                </div>
              )}
              </>
              {/* ── Refresh ── */}
              {!searchActive && !showMyPosts && posts.length > 0 && (
                <div style={{ textAlign: "center" }}>
                  <ActionButton
                    onClick={() => postsQuery.refetch()}
                    variant="ghost"
                    small
                    disabled={postsQuery.isFetching}
                  >
                    <RefreshCw size={14} style={postsQuery.isFetching ? { animation: "spin 0.8s linear infinite" } : {}} />
                    {postsQuery.isFetching ? "লোড হচ্ছে..." : "নতুন পোস্ট দেখুন"}
                  </ActionButton>
                </div>
              )}
            </>
          )}
        </div>
      {/* AdSense Ad */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <AdSenseAd adSlot={AD_SLOTS.AMIO_INLINE} adFormat="auto" fullWidthResponsive={true} />
      </div>
      </main>

      {/* ── Create post modal ── */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => { setShowCreateModal(false); setSelectedChallenge(null); }}
          authorName={user?.name || "আপনি"}
          avatarUrl={profileAvatarUrl}
          challenge={selectedChallenge}
        />
      )}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          authorName={user?.name ?? "আপনি"}
          avatarUrl={profileAvatarUrl}
        />
      )}
    </div>
  );
}
