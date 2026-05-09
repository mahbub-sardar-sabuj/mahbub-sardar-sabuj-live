import type { CSSProperties, ReactNode } from "react";
import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crown,
  Edit3,
  Eye,
  Film,
  Heart,
  KeyRound,
  Lightbulb,
  MessageCircle,
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
} from "lucide-react";
import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { trpc } from "@/lib/trpc";
import { getLoginUrl, getSignupUrl, isLoginConfigured } from "@/const";
import LocalAuthModal from "@/components/LocalAuthModal";

const adorshoFont = "'AdorshoLipi', 'Noto Sans Bengali', sans-serif";

// ── Styles ────────────────────────────────────────────────────────────────────

const shellStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 16% 12%, rgba(212,168,67,0.18), transparent 28%), radial-gradient(circle at 85% 34%, rgba(81,139,255,0.10), transparent 30%), linear-gradient(180deg, #071426 0%, #0B1726 48%, #07111F 100%)",
  color: "#FDF6EC",
  fontFamily: adorshoFont,
};

const glassStyle: CSSProperties = {
  border: "1px solid rgba(232,201,122,0.22)",
  background: "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035))",
  boxShadow: "0 26px 90px rgba(0,0,0,0.32)",
  backdropFilter: "blur(18px)",
};

const cardStyle: CSSProperties = {
  border: "1px solid rgba(232,201,122,0.18)",
  background: "linear-gradient(145deg, rgba(255,255,255,0.065), rgba(255,255,255,0.025))",
  boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
  backdropFilter: "blur(14px)",
  borderRadius: 24,
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
      <a href={href} style={baseStyle}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} disabled={disabled} style={baseStyle} onClick={onClick}>
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

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #D4A843, #B98A24)",
        display: "grid",
        placeItems: "center",
        color: "#071426",
        fontWeight: 900,
        fontSize: size * 0.36,
        fontFamily: adorshoFont,
        flexShrink: 0,
        border: "2px solid rgba(232,201,122,0.35)",
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
        gap: 5,
        padding: "0.22rem 0.65rem",
        borderRadius: 999,
        background: "rgba(232,201,122,0.12)",
        border: "1px solid rgba(232,201,122,0.25)",
        color: "#F7D56F",
        fontSize: "0.78rem",
        fontWeight: 700,
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
            এই ট্যাবের লক্ষ্য হলো বাস্তব জীবনের অভিজ্ঞতা, সমাজের সত্য গল্প এবং মানুষের ভাবনাকে সুন্দরভাবে প্রকাশ করা। লেখা জমা দিলে তা পর্যালোচনার পর প্রকাশিত হবে।
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

function EmptyFeedState({ showMyPosts, searchActive, selectedCategory, isAuthenticated, onWrite, onLogin }: { showMyPosts: boolean; searchActive: boolean; selectedCategory: CategoryKey; isAuthenticated: boolean; onWrite: () => void; onLogin: () => void }) {
  const categoryLabel = CATEGORIES.find(c => c.key === selectedCategory)?.label ?? selectedCategory;
  const title = showMyPosts
    ? "আপনার লেখার ঘর এখনো খালি"
    : searchActive
    ? "এই অনুসন্ধানে কোনো লেখা পাওয়া যায়নি"
    : selectedCategory !== "all"
    ? `“${categoryLabel}” বিভাগে প্রথম লেখা হতে পারে আপনারটি`
    : "বাস্তবতার প্রথম লেখা শুরু হোক আপনার হাতেই";
  const description = showMyPosts
    ? "নিজের অভিজ্ঞতা, গল্প বা ভাবনা লিখে জমা দিন। অনুমোদনের পর তা পাঠকদের সামনে দেখা যাবে।"
    : searchActive
    ? "অন্য শব্দ দিয়ে খুঁজে দেখুন, অথবা নতুন একটি বাস্তব অভিজ্ঞতা লিখে এই জায়গাটি সমৃদ্ধ করুন।"
    : "একটি সত্য ঘটনা, একটি মানবিক শিক্ষা, অথবা সমাজের কোনো বাস্তব সমস্যার কথা লিখুন। ভালো লেখা অন্য মানুষকে ভাবতে ও শিখতে সাহায্য করে।";

  return (
    <div style={{ ...cardStyle, padding: "clamp(1.5rem, 6vw, 2.25rem)", textAlign: "left", display: "grid", gap: "1.1rem" }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ width: 58, height: 58, borderRadius: 22, display: "grid", placeItems: "center", background: "rgba(212,168,67,0.14)", border: "1px solid rgba(232,201,122,0.28)", color: "#F7D56F" }}>
          <PenLine size={28} />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h3 style={{ margin: 0, color: "#FDF6EC", fontSize: "clamp(1.15rem, 4vw, 1.55rem)", lineHeight: 1.35, fontWeight: 900 }}>{title}</h3>
          <p style={{ margin: "0.45rem 0 0", color: "rgba(253,246,236,0.62)", fontSize: "0.92rem", lineHeight: 1.8 }}>{description}</p>
        </div>
      </div>

      {!searchActive && (
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
        {isAuthenticated ? (
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
      utils.writingPlatform.listPosts.invalidate();
      if (postSlug) utils.writingPlatform.getPostBySlug.invalidate({ slug: postSlug });
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
          {activeReaction ? activeReaction.label : "প্রতিক্রিয়া"}
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
            padding: "0.5rem 0.75rem",
            borderRadius: 999,
            background: "rgba(7,20,38,0.96)",
            border: "1px solid rgba(232,201,122,0.25)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            backdropFilter: "blur(20px)",
            zIndex: 100,
          }}
        >
          {(Object.entries(REACTION_CONFIG) as [ReactionType, typeof REACTION_CONFIG[ReactionType]][]).map(
            ([key, cfg]) => (
              <button
                key={key}
                type="button"
                title={cfg.label}
                onClick={() => handleReact(key)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  padding: "0.35rem 0.5rem",
                  borderRadius: 12,
                  border: myReaction === key ? `1px solid ${cfg.color}66` : "1px solid transparent",
                  background: myReaction === key ? `${cfg.color}22` : "transparent",
                  color: cfg.color,
                  cursor: "pointer",
                  transition: "transform 0.12s",
                  fontFamily: adorshoFont,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                }}
              >
                {cfg.icon}
                <span>{cfg.label}</span>
              </button>
            )
          )}
        </div>
      )}
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
  const utils = trpc.useUtils();

  const addComment = trpc.writingPlatform.addComment.useMutation({
    onSuccess: () => {
      setText("");
      setSubmitted(true);
      utils.writingPlatform.listPosts.invalidate();
      setTimeout(() => setSubmitted(false), 3000);
    },
  });

  function handleSubmit() {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }
    if (!text.trim()) return;
    addComment.mutate({ postId, content: text.trim() });
  }

  return (
    <div>
      <button
        type="button"
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
              placeholder={isAuthenticated ? "আপনার মন্তব্য লিখুন..." : "মন্তব্য করতে লগইন করুন"}
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
              <CheckCircle2 size={15} /> মন্তব্য পাঠানো হয়েছে। অনুমোদনের পর প্রকাশিত হবে।
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
  commentCount: number;
  myReaction: ReactionType | null;
};

function PostCard({
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
  const isLong = post.content.length > 280;
  const displayContent = isLong && !expanded ? post.content.slice(0, 280) + "..." : post.content;
  const isOwner = Boolean(currentUserOpenId && post.authorOpenId === currentUserOpenId);

  return (
    <article style={{ ...cardStyle, padding: "clamp(1rem, 3vw, 1.5rem)", display: "grid", gap: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={post.authorName} size={46} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: "1rem", color: "#F7D56F", lineHeight: 1.2 }}>
            {post.authorName}
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
      </div>

      {/* Title */}
      <h2
        style={{
          margin: 0,
          fontSize: "clamp(1.05rem, 3vw, 1.3rem)",
          fontWeight: 900,
          color: "#FDF6EC",
          lineHeight: 1.4,
          cursor: "pointer",
        }}
        onClick={() => onOpenDetail(post.slug)}
      >
        {post.title}
      </h2>

      {/* Content */}
      <div style={{ color: "rgba(253,246,236,0.82)", lineHeight: 1.85, fontSize: "0.97rem" }}>
        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{displayContent}</p>
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

      {/* Media */}
      {post.mediaUrl && post.mediaType === "image" && (
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(232,201,122,0.15)" }}>
          <img
            src={post.mediaUrl}
            alt={post.title}
            style={{ width: "100%", maxHeight: 420, objectFit: "cover", display: "block" }}
            loading="lazy"
          />
        </div>
      )}
      {post.mediaUrl && post.mediaType === "video" && (
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(232,201,122,0.15)", aspectRatio: "16/9" }}>
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
          paddingBottom: "0.75rem",
          borderBottom: "1px solid rgba(232,201,122,0.1)",
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

      {/* Action bar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
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
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: post.title, url: `${window.location.origin}/amio-likhbo-bastobota/${post.slug}` });
            } else {
              navigator.clipboard.writeText(`${window.location.origin}/amio-likhbo-bastobota/${post.slug}`);
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

        {/* Owner actions */}
        {isOwner && onEdit && onDelete && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => onEdit(post)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "0.4rem 0.75rem", borderRadius: 999,
                border: "1px solid rgba(232,201,122,0.25)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(253,246,236,0.6)",
                fontFamily: adorshoFont, fontWeight: 700, fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              <Edit3 size={13} /> সম্পাদনা
            </button>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "0.4rem 0.75rem", borderRadius: 999,
                  border: "1px solid rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.08)",
                  color: "#FCA5A5",
                  fontFamily: adorshoFont, fontWeight: 700, fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={13} /> মুছুন
              </button>
            ) : (
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", color: "rgba(253,246,236,0.55)", fontFamily: adorshoFont }}>নিশ্চিত?</span>
                <button
                  type="button"
                  onClick={() => { onDelete(post.id); setConfirmDelete(false); }}
                  style={{
                    padding: "0.35rem 0.65rem", borderRadius: 999,
                    border: "1px solid rgba(239,68,68,0.5)",
                    background: "rgba(239,68,68,0.18)",
                    color: "#FCA5A5",
                    fontFamily: adorshoFont, fontWeight: 900, fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  হ্যাঁ
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    padding: "0.35rem 0.65rem", borderRadius: 999,
                    border: "1px solid rgba(232,201,122,0.2)",
                    background: "transparent",
                    color: "rgba(253,246,236,0.55)",
                    fontFamily: adorshoFont, fontWeight: 700, fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  না
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ── Create Post Modal ─────────────────────────────────────────────────────────

function CreatePostModal({ onClose, authorName }: { onClose: () => void; authorName: string }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryKey>("thought");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const createPost = trpc.writingPlatform.createPost.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      utils.writingPlatform.listPosts.invalidate();
      utils.writingPlatform.myPosts.invalidate();
      setTimeout(() => onClose(), 2200);
    },
  });

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
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
    if (!content.trim()) return;
    createPost.mutate({
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
        {/* Modal header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name={authorName} size={38} />
            <div>
              <div style={{ fontWeight: 900, color: "#F7D56F" }}>{authorName}</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(253,246,236,0.5)" }}>নতুন পোস্ট লিখুন</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid rgba(232,201,122,0.22)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(253,246,236,0.7)",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          style={{ display: "none" }}
          onChange={handleImageSelect}
        />

        {submitted ? (
          <div
            style={{
              padding: "1.5rem",
              borderRadius: 18,
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.3)",
              color: "#86EFAC",
              textAlign: "center",
              display: "grid",
              gap: 10,
            }}
          >
            <CheckCircle2 size={32} style={{ margin: "0 auto", color: "#22C55E" }} />
            <div style={{ fontWeight: 900, fontSize: "1.1rem" }}>পোস্ট পাঠানো হয়েছে!</div>
            <div style={{ fontSize: "0.88rem", color: "rgba(134,239,172,0.8)" }}>
              অনুমোদনের পর প্রকাশিত হবে।
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
            {/* Title */}
            <div>
              <label style={labelStyle}>শিরোনাম (ঐচ্ছিক)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="লেখার শিরোনাম দিন..."
                maxLength={220}
                style={inputStyle}
              />
            </div>
            <WritingQualityBox />

            {/* Category */}
            <div>
              <label style={labelStyle}>বিভাগ</label>
              <div style={{ color: "rgba(253,246,236,0.45)", fontSize: "0.78rem", lineHeight: 1.6, marginBottom: 8 }}>আপনার লেখার ধরন অনুযায়ী একটি বিভাগ বেছে নিন। এতে পাঠক সহজে লেখা খুঁজে পাবে।</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CATEGORIES.filter(c => c.key !== "all").map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key as CategoryKey)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "0.35rem 0.75rem", borderRadius: 999,
                      border: category === cat.key ? "1px solid rgba(247,213,111,0.7)" : "1px solid rgba(232,201,122,0.2)",
                      background: category === cat.key ? "rgba(212,168,67,0.18)" : "rgba(255,255,255,0.05)",
                      color: category === cat.key ? "#F7D56F" : "rgba(253,246,236,0.55)",
                      fontFamily: adorshoFont, fontWeight: 700, fontSize: "0.82rem",
                      cursor: "pointer", transition: "all 0.12s",
                    }}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Content */}
            <div>
              <label style={labelStyle}>লেখা *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={FORM_EXAMPLE_TEXT}
                required
                rows={7}
                autoFocus
                maxLength={600000}
                style={{ ...inputStyle, resize: "vertical", minHeight: 160, lineHeight: 1.8 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 6, color: "rgba(253,246,236,0.45)", fontSize: "0.78rem", lineHeight: 1.55 }}>
                <span>বাস্তব ঘটনা, শেখা ও মানবিক বার্তা স্পষ্ট করে লিখুন।</span>
                <span>{content.trim().length.toLocaleString("bn-BD")} অক্ষর</span>
              </div>
            </div>

            <div style={{ display: "grid", gap: "0.45rem", padding: "0.8rem", borderRadius: 16, background: "rgba(255,255,255,0.045)", border: "1px solid rgba(232,201,122,0.12)" }}>
              <div style={{ color: "#F7D56F", fontWeight: 900, fontSize: "0.86rem" }}>কমিউনিটি নির্দেশনা</div>
              {COMMUNITY_GUIDELINES.map((item) => (
                <div key={item} style={{ display: "flex", gap: 8, color: "rgba(253,246,236,0.58)", fontSize: "0.78rem", lineHeight: 1.55 }}>
                  <CheckCircle2 size={13} style={{ color: "#86EFAC", marginTop: 3, flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Image preview */}
            {imageUrl && (
              <div style={{ position: "relative", borderRadius: 14, overflow: "hidden" }}>
                <img src={imageUrl} alt="প্রিভিউ" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    width: 30, height: 30, borderRadius: "50%",
                    background: "rgba(0,0,0,0.6)", border: "none",
                    color: "#fff", cursor: "pointer", display: "grid", placeItems: "center",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Upload error — only shows for image upload, does NOT block post */}
            {uploadError && (
              <div style={{ padding: "0.5rem 0.9rem", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: "0.83rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span>ছবি আপলোড হয়নি — {uploadError}</span>
                <button type="button" onClick={() => setUploadError("")} style={{ background: "none", border: "none", color: "#FCA5A5", cursor: "pointer", fontWeight: 900, fontSize: "1rem", lineHeight: 1, padding: 0 }}>✕</button>
              </div>
            )}

            {/* Bottom bar: image upload + submit */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={() => { setUploadError(""); fileInputRef.current?.click(); }}
                disabled={uploading}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "0.55rem 1rem", borderRadius: 999,
                  border: "1px solid rgba(232,201,122,0.3)",
                  background: "rgba(255,255,255,0.05)",
                  color: imageUrl ? "#86EFAC" : "rgba(253,246,236,0.7)",
                  fontFamily: adorshoFont, fontWeight: 700, fontSize: "0.85rem",
                  cursor: uploading ? "not-allowed" : "pointer",
                  flexShrink: 0,
                }}
              >
                {uploading ? <RefreshCw size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <Camera size={15} />}
                {uploading ? "আপলোড..." : imageUrl ? "ছবি যোগ হয়েছে" : "ছবি যোগ করুন"}
              </button>
              <div style={{ flex: 1 }} />
              <ActionButton disabled={!content.trim() || createPost.isPending || uploading}>
                {createPost.isPending ? (
                  <><RefreshCw size={16} style={{ animation: "spin 0.8s linear infinite" }} /> পাঠানো হচ্ছে...</>
                ) : (
                  <><Send size={16} /> পোস্ট করুন</>
                )}
              </ActionButton>
            </div>

            {createPost.isError && (
              <div style={{ padding: "0.6rem 1rem", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: "0.85rem" }}>
                পোস্ট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

// ── Edit Post Modal ─────────────────────────────────────────────────────────
function EditPostModal({ post, onClose, authorName }: { post: EnrichedPost; onClose: () => void; authorName: string }) {
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
      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
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
            <Avatar name={authorName} size={38} />
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
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: "none" }} onChange={handleImageSelect} />

        {submitted ? (
          <div style={{ textAlign: "center", padding: "2rem", display: "grid", gap: "0.75rem" }}>
            <CheckCircle2 size={48} color="#86EFAC" style={{ margin: "0 auto" }} />
            <div style={{ color: "#86EFAC", fontWeight: 900, fontSize: "1.1rem" }}>পোস্ট আপডেট হয়েছে!</div>
            <div style={{ color: "rgba(253,246,236,0.55)", fontSize: "0.88rem" }}>পর্যালোচনার পর প্রকাশিত হবে।</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
            {/* Title */}
            <div>
              <label style={labelStyle}>শিরোনাম (ঐচ্ছিক)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="লেখার শিরোনাম..."
                maxLength={220}
                style={inputStyle}
              />
            </div>
            <WritingQualityBox />

            {/* Category */}
            <div>
              <label style={labelStyle}>বিভাগ</label>
              <div style={{ color: "rgba(253,246,236,0.45)", fontSize: "0.78rem", lineHeight: 1.6, marginBottom: 8 }}>আপনার লেখার ধরন অনুযায়ী একটি বিভাগ বেছে নিন। এতে পাঠক সহজে লেখা খুঁজে পাবে।</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CATEGORIES.filter(c => c.key !== "all").map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key as CategoryKey)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "0.35rem 0.75rem", borderRadius: 999,
                      border: category === cat.key ? "1px solid rgba(247,213,111,0.7)" : "1px solid rgba(232,201,122,0.2)",
                      background: category === cat.key ? "rgba(212,168,67,0.18)" : "rgba(255,255,255,0.05)",
                      color: category === cat.key ? "#F7D56F" : "rgba(253,246,236,0.55)",
                      fontFamily: adorshoFont, fontWeight: 700, fontSize: "0.82rem",
                      cursor: "pointer", transition: "all 0.12s",
                    }}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Content */}
            <div>
              <label style={labelStyle}>লেখা *</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={FORM_EXAMPLE_TEXT} rows={8} maxLength={600000} required style={{ ...inputStyle, resize: "vertical", minHeight: 170, lineHeight: 1.8 }} />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 6, color: "rgba(253,246,236,0.45)", fontSize: "0.78rem", lineHeight: 1.55 }}>
                <span>মূল বক্তব্য, শেখা ও ভাষা আরও পরিষ্কার করুন।</span>
                <span>{content.trim().length.toLocaleString("bn-BD")} অক্ষর</span>
              </div>
            </div>
            {/* Image preview */}
            {imageUrl && (
              <div style={{ position: "relative", borderRadius: 14, overflow: "hidden" }}>
                <img src={imageUrl} alt="প্রিভিউ" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
                <button type="button" onClick={() => setImageUrl("")} style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <X size={14} />
                </button>
              </div>
            )}
            {uploadError && (
              <div style={{ padding: "0.5rem 0.9rem", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: "0.83rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span>ছবি আপলোড হয়নি — {uploadError}</span>
                <button type="button" onClick={() => setUploadError("")} style={{ background: "none", border: "none", color: "#FCA5A5", cursor: "pointer", fontWeight: 900, fontSize: "1rem", lineHeight: 1, padding: 0 }}>✕</button>
              </div>
            )}
            {/* Bottom bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button type="button" onClick={() => { setUploadError(""); fileInputRef.current?.click(); }} disabled={uploading} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0.55rem 1rem", borderRadius: 999, border: "1px solid rgba(232,201,122,0.3)", background: "rgba(255,255,255,0.05)", color: imageUrl ? "#86EFAC" : "rgba(253,246,236,0.7)", fontFamily: adorshoFont, fontWeight: 700, fontSize: "0.85rem", cursor: uploading ? "not-allowed" : "pointer", flexShrink: 0 }}>
                {uploading ? <RefreshCw size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <Camera size={15} />}
                {uploading ? "আপলোড..." : imageUrl ? "ছবি যোগ আছে" : "ছবি যোগ করুন"}
              </button>
              <div style={{ flex: 1 }} />
              <button type="button" onClick={onClose} style={{ padding: "0.6rem 1.2rem", borderRadius: 999, border: "1px solid rgba(232,201,122,0.25)", background: "transparent", color: "rgba(253,246,236,0.7)", fontFamily: adorshoFont, cursor: "pointer" }}>বাতিল</button>
              <ActionButton type="submit" disabled={editPost.isPending || !content.trim() || uploading}>
                {editPost.isPending ? <RefreshCw size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <CheckCircle2 size={15} />}
                {editPost.isPending ? "আপডেট হচ্ছে..." : "আপডেট করুন"}
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

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
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
      <article style={{ ...cardStyle, padding: "clamp(1.2rem, 4vw, 2rem)", display: "grid", gap: "1.2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={post.authorName} size={50} />
          <div>
            <div style={{ fontWeight: 900, color: "#F7D56F", fontSize: "1.05rem" }}>{post.authorName}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
              <TimeAgo date={post.createdAt} />
              <CategoryBadge category={post.category} />
            </div>
          </div>
        </div>

        <h1 style={{ margin: 0, fontSize: "clamp(1.3rem, 4vw, 2rem)", fontWeight: 900, color: "#FDF6EC", lineHeight: 1.35 }}>
          {post.title}
        </h1>

        <div style={{ color: "rgba(253,246,236,0.85)", lineHeight: 1.95, fontSize: "1rem", whiteSpace: "pre-wrap" }}>
          {post.content}
        </div>

        {post.mediaUrl && post.mediaType === "image" && (
          <div style={{ borderRadius: 16, overflow: "hidden" }}>
            <img src={post.mediaUrl} alt={post.title} style={{ width: "100%", display: "block" }} />
          </div>
        )}
        {post.mediaUrl && post.mediaType === "video" && (
          <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "16/9" }}>
            <iframe src={post.mediaUrl} style={{ width: "100%", height: "100%", border: "none" }} allowFullScreen title={post.title} />
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(253,246,236,0.4)", fontSize: "0.82rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(232,201,122,0.1)" }}>
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
          <div style={{ color: "rgba(253,246,236,0.4)", fontSize: "0.88rem", textAlign: "center", padding: "1rem" }}>
            এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্য করুন!
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "0.75rem",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(232,201,122,0.1)",
                }}
              >
                <Avatar name={comment.authorName} size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 900, color: "#F7D56F", fontSize: "0.88rem" }}>{comment.authorName}</span>
                    <TimeAgo date={comment.createdAt} />
                  </div>
                  <p style={{ margin: 0, color: "rgba(253,246,236,0.82)", fontSize: "0.9rem", lineHeight: 1.7 }}>
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AmiOLikhboBastobota() {
  const auth = trpc.auth.me.useQuery(undefined, { retry: false });
  const user = auth.data;
  const isAuthenticated = Boolean(user);
  const loginHref = isLoginConfigured ? getLoginUrl() : undefined;
  const signupHref = isLoginConfigured ? getSignupUrl() : undefined;

  const [, params] = useRoute("/amio-likhbo-bastobota/:slug");
  const [, setLocation] = useLocation();
  const slugFromUrl = params?.slug ?? null;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showMyPosts, setShowMyPosts] = useState(false);
  // Check for password reset token in URL
  const resetTokenFromUrl = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("reset_token") || ""
    : "";
  const [showLocalAuth, setShowLocalAuth] = useState(() => Boolean(resetTokenFromUrl));
  const [localAuthMode, setLocalAuthMode] = useState<"login" | "register">("login");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [editingPost, setEditingPost] = useState<EnrichedPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const postsQuery = trpc.writingPlatform.listPosts.useQuery(
    selectedCategory !== "all" ? { category: selectedCategory } : undefined,
    { refetchInterval: 60000, enabled: !searchActive, retry: false }
  );
  const searchQuery_ = searchQuery.trim();
  const searchResultsQuery = trpc.writingPlatform.searchPosts.useQuery(
    { query: searchQuery_ || "_" },
    { enabled: searchActive && searchQuery_.length >= 2, retry: false }
  );
  const utils = trpc.useUtils();
  const deletePostMutation = trpc.writingPlatform.deletePost.useMutation({
    onSuccess: () => {
      utils.writingPlatform.listPosts.invalidate();
      utils.writingPlatform.myPosts.invalidate();
    },
  });
  const myPostsQuery = trpc.writingPlatform.myPosts.useQuery(undefined, {
    enabled: isAuthenticated && showMyPosts,
    retry: false,
  });
  const activeFeedQuery = searchActive && searchQuery_.length >= 2 ? searchResultsQuery : postsQuery;
  const feedHasError = Boolean(activeFeedQuery.isError);
  const feedIsLoading = Boolean(activeFeedQuery.isLoading || activeFeedQuery.isFetching);
  const posts = (searchActive && searchQuery_.length >= 2
    ? (searchResultsQuery.data ?? [])
    : (postsQuery.data ?? [])) as EnrichedPost[];
  const displayPosts = showMyPosts
    ? ((myPostsQuery.data ?? []) as EnrichedPost[])
    : posts;

  useEffect(() => {
    if (!isAuthenticated && showMyPosts) {
      setShowMyPosts(false);
    }
  }, [isAuthenticated, showMyPosts]);

  function handleLoginRequired() {
    setShowLoginPrompt(true);
    setTimeout(() => setShowLoginPrompt(false), 4000);
  }

  function handleOpenDetail(slug: string) {
    setLocation(`/amio-likhbo-bastobota/${slug}`);
  }

  function handleBack() {
    setLocation("/amio-likhbo-bastobota");
  }

  return (
    <div style={shellStyle}>
      <Seo
        title="আমিও লিখবো বাস্তবতা | সোশ্যাল ফিড"
        description="বাস্তব জীবনের গল্প, অভিজ্ঞতা, কবিতা ও ভাবনা শেয়ার করুন। আমিও লিখবো বাস্তবতা — একটি বাংলা সোশ্যাল লেখার প্ল্যাটফর্ম।"
        path="/amio-likhbo-bastobota"
        type="website"
      />
      <Navbar />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .post-card-enter { animation: fadeIn 0.35s ease forwards; }
        .amio-category-row::-webkit-scrollbar { display: none; }
        @media (max-width: 520px) {
          .amio-mobile-stack { align-items: stretch !important; }
          .amio-mobile-stack > * { width: 100%; }
          .amio-hero-actions { width: 100%; max-width: 100%; flex-direction: column; overflow: hidden; }
          .amio-hero-actions > * { width: 100%; min-width: 0; max-width: 100%; box-sizing: border-box !important; }
          .amio-hero-metrics { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <main style={{ padding: "calc(var(--site-nav-offset, 98px) + clamp(1rem, 4vw, 2rem)) 0 3rem" }}>
        <div style={{ width: "min(720px, calc(100% - clamp(1rem, 5vw, 2rem)))", margin: "0 auto", display: "grid", gap: "1.25rem" }}>

          {/* ── Hero header ── */}
          {!slugFromUrl && (
            <div
              className="amio-mobile-stack"
              style={{
                ...glassStyle,
                borderRadius: 28,
                padding: "clamp(1.2rem, 4vw, 2rem)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 360px", minWidth: 0 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.28rem 0.7rem", borderRadius: 999, background: "rgba(212,168,67,0.13)", border: "1px solid rgba(232,201,122,0.25)", color: "#F7D56F", fontSize: "0.78rem", fontWeight: 900, marginBottom: "0.65rem" }}>
                  <Sparkles size={14} /> বাংলা বাস্তব লেখার কমিউনিটি
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(1.75rem, 5.5vw, 2.85rem)",
                    fontWeight: 900,
                    lineHeight: 1.12,
                    color: "#FDF6EC",
                  }}
                >
                  আমিও লিখবো{" "}
                  <span style={{ color: "#D4A843" }}>বাস্তবতা</span>
                </h1>
                <p style={{ margin: "0.65rem 0 0", color: "rgba(253,246,236,0.68)", fontSize: "0.96rem", lineHeight: 1.8 }}>
                  আপনার জীবনের সত্য গল্প, সমাজের অভিজ্ঞতা, কবিতা ও ভাবনাকে সম্মানজনকভাবে প্রকাশ করুন। এখানে প্রতিটি লেখা পাঠকের মনে প্রশ্ন, সহমর্মিতা ও সমাধানের ভাবনা তৈরি করতে পারে।
                </p>
                <div className="amio-hero-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.65rem", marginTop: "1rem" }}>
                  {FEATURE_STATS.map((item) => (
                    <MiniMetricCard key={item.label} {...item} />
                  ))}
                </div>
              </div>

              <div className="amio-hero-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {isAuthenticated ? (
                  <>
                    <ActionButton onClick={() => setShowCreateModal(true)} small>
                      <Plus size={15} /> নতুন লেখা
                    </ActionButton>
                    <ActionButton onClick={() => setShowMyPosts((p) => !p)} variant="ghost" small>
                      <PenLine size={15} /> {showMyPosts ? "সব পোস্ট" : "আমার পোস্ট"}
                    </ActionButton>
                    <ActionButton href="/profile" variant="ghost" small>
                      <User size={15} /> প্রোফাইল
                    </ActionButton>
                  </>
                ) : isLoginConfigured ? (
                  <>
                    <ActionButton href={loginHref} small>
                      <KeyRound size={15} /> লগইন
                    </ActionButton>
                    <ActionButton href={signupHref} variant="ghost" small>
                      <UserPlus size={15} /> একাউন্ট খুলুন
                    </ActionButton>
                  </>
                ) : (
                  <>
                    <ActionButton onClick={() => { setLocalAuthMode("login"); setShowLocalAuth(true); }} small>
                      <KeyRound size={15} /> লগইন
                    </ActionButton>
                    <ActionButton onClick={() => { setLocalAuthMode("register"); setShowLocalAuth(true); }} variant="ghost" small>
                      <UserPlus size={15} /> একাউন্ট খুলুন
                    </ActionButton>
                  </>
                )}
              </div>
            </div>
          )}

          {!slugFromUrl && (
            <GuidancePanel
              isAuthenticated={isAuthenticated}
              onWrite={() => setShowCreateModal(true)}
              onLogin={() => { setLocalAuthMode("login"); setShowLocalAuth(true); }}
            />
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
                background: "rgba(212,168,67,0.12)",
                border: "1px solid rgba(212,168,67,0.35)",
                color: "#F7D56F",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                animation: "fadeIn 0.25s ease",
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
                <button
                  type="button"
                  onClick={() => { setLocalAuthMode("login"); setShowLocalAuth(true); setShowLoginPrompt(false); }}
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: 999,
                    background: "rgba(212,168,67,0.2)",
                    border: "1px solid rgba(212,168,67,0.4)",
                    color: "#F7D56F",
                    fontWeight: 900,
                    fontSize: "0.82rem",
                    fontFamily: adorshoFont,
                    cursor: "pointer",
                  }}
                >
                  লগইন করুন
                </button>
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
              {/* ── Search bar ── */}
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(253,246,236,0.4)", pointerEvents: "none" }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchActive(e.target.value.trim().length >= 2);
                    }}
                    onFocus={() => searchQuery.trim().length >= 2 && setSearchActive(true)}
                    placeholder="পোস্ট, লেখক বা বিষয় খুঁজুন..."
                    style={{
                      width: "100%",
                      padding: "0.65rem 1rem 0.65rem 2.5rem",
                      borderRadius: 999,
                      border: searchActive ? "1px solid rgba(247,213,111,0.5)" : "1px solid rgba(232,201,122,0.22)",
                      background: "rgba(255,255,255,0.06)",
                      color: "#FDF6EC",
                      fontFamily: adorshoFont,
                      fontSize: "0.9rem",
                      outline: "none",
                      transition: "border 0.15s",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                {searchActive && (
                  <button
                    type="button"
                    aria-label="অনুসন্ধান মুছুন"
                    onClick={() => { setSearchQuery(""); setSearchActive(false); }}
                    style={{ background: "none", border: "none", color: "rgba(253,246,236,0.5)", cursor: "pointer", padding: "0.5rem", display: "flex", alignItems: "center" }}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
              {/* ── Category filter row ── */}
              {!searchActive && (
                <div
                  className="amio-category-row"
                  style={{
                    display: "flex",
                    gap: 8,
                    overflowX: "auto",
                    paddingBottom: 4,
                    scrollbarWidth: "none",
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setSelectedCategory(cat.key as CategoryKey)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "0.45rem 0.9rem",
                        borderRadius: 999,
                        border: selectedCategory === cat.key
                          ? "1px solid rgba(247,213,111,0.7)"
                          : "1px solid rgba(232,201,122,0.2)",
                        background: selectedCategory === cat.key
                          ? "rgba(212,168,67,0.18)"
                          : "rgba(255,255,255,0.05)",
                        color: selectedCategory === cat.key ? "#F7D56F" : "rgba(253,246,236,0.6)",
                        fontFamily: adorshoFont,
                        fontWeight: selectedCategory === cat.key ? 900 : 700,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        transition: "all 0.15s",
                      }}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              )}
              {/* ── Feed ── */}
              <>{searchActive && searchQuery_.length < 2 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "rgba(253,246,236,0.45)", fontSize: "0.9rem" }}>
                  অনুসন্ধানের জন্য কমপক্ষে ২টি অক্ষর লিখুন।
                </div>
              ) : (showMyPosts ? myPostsQuery.isLoading : feedIsLoading) ? (
                <div style={{ display: "grid", placeItems: "center", minHeight: 240 }}>
                  <RefreshCw size={32} color="#D4A843" style={{ animation: "spin 0.8s linear infinite" }} />
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
                  isAuthenticated={isAuthenticated}
                  onWrite={() => setShowCreateModal(true)}
                  onLogin={() => { setLocalAuthMode("login"); setShowLocalAuth(true); }}
                />
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {searchActive && (
                    <div style={{ color: "rgba(253,246,236,0.5)", fontSize: "0.82rem", paddingLeft: 4 }}>
                      "{searchQuery}" এর জন্য {posts.length}টি ফলাফল
                    </div>
                  )}
                  {displayPosts.map((post) => (
                    <div key={post.id} className="post-card-enter">
                      <PostCard
                        post={post}
                        isAuthenticated={isAuthenticated}
                        onLoginRequired={handleLoginRequired}
                        onOpenDetail={handleOpenDetail}
                        currentUserOpenId={user?.openId}
                        onEdit={(p) => setEditingPost(p)}
                        onDelete={(id) => deletePostMutation.mutate({ postId: id })}
                      />
                    </div>
                  ))}
                </div>
              )}
              </>
              {/* ── Refresh ── */}
              {!searchActive && posts.length > 0 && (
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
      </main>

      {/* ── Create post modal ── */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          authorName={user?.name ?? "আপনি"}
        />
      )}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          authorName={user?.name ?? "আপনি"}
        />
      )}
    </div>
  );
}
