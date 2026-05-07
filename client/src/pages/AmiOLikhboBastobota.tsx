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
  Eye,
  Film,
  Heart,
  KeyRound,
  Laugh,
  Lightbulb,
  MessageCircle,
  PenLine,
  Plus,
  RefreshCw,
  Send,
  Share2,
  Sparkles,
  ThumbsUp,
  UserPlus,
  X,
  Frown,
} from "lucide-react";
import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

// ── Helper components ─────────────────────────────────────────────────────────

function ActionButton({
  href,
  disabled,
  children,
  variant = "primary",
  onClick,
  small,
}: {
  href?: string;
  disabled?: boolean;
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  onClick?: () => void;
  small?: boolean;
}) {
  const baseStyle: CSSProperties = {
    display: "inline-flex",
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
    <button type="button" disabled={disabled} style={baseStyle} onClick={onClick}>
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

// ── Reaction Bar ──────────────────────────────────────────────────────────────

function ReactionBar({
  postId,
  reactionCounts,
  myReaction,
  isAuthenticated,
  onLoginRequired,
}: {
  postId: number;
  reactionCounts: Record<ReactionType, number>;
  myReaction: ReactionType | null;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const utils = trpc.useUtils();
  const reactMutation = trpc.writingPlatform.reactToPost.useMutation({
    onSuccess: () => utils.writingPlatform.listPosts.invalidate(),
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

  const postDetail = trpc.writingPlatform.getPostBySlug.useQuery(
    { slug: "" },
    { enabled: false }
  );

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
  authorName: string;
  title: string;
  category: string;
  content: string;
  mediaUrl: string | null;
  mediaType: string;
  featured: boolean;
  viewCount: number;
  createdAt: Date | string;
  reactionCounts: Record<ReactionType, number>;
  commentCount: number;
  myReaction: ReactionType | null;
};

function PostCard({
  post,
  isAuthenticated,
  onLoginRequired,
  onOpenDetail,
}: {
  post: EnrichedPost;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
  onOpenDetail: (slug: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = post.content.length > 280;
  const displayContent = isLong && !expanded ? post.content.slice(0, 280) + "..." : post.content;

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
              navigator.share({ title: post.title, url: `/amio-likhbo-bastobota/${post.slug}` });
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
      </div>
    </article>
  );
}

// ── Create Post Modal ─────────────────────────────────────────────────────────

function CreatePostModal({ onClose, authorName }: { onClose: () => void; authorName: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Exclude<CategoryKey, "all">>("thought");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"none" | "image" | "video">("none");
  const [submitted, setSubmitted] = useState(false);
  const utils = trpc.useUtils();

  const createPost = trpc.writingPlatform.createPost.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      utils.writingPlatform.listPosts.invalidate();
      setTimeout(() => onClose(), 2200);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createPost.mutate({
      title: title.trim(),
      content: content.trim(),
      category,
      mediaUrl: mediaUrl.trim() || undefined,
      mediaType: mediaUrl.trim() ? mediaType : "none",
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
            {/* Category */}
            <div>
              <label style={labelStyle}>বিভাগ</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CATEGORIES.filter((c) => c.key !== "all").map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key as Exclude<CategoryKey, "all">)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "0.35rem 0.75rem",
                      borderRadius: 999,
                      border:
                        category === cat.key
                          ? "1px solid rgba(247,213,111,0.7)"
                          : "1px solid rgba(232,201,122,0.2)",
                      background:
                        category === cat.key
                          ? "rgba(247,213,111,0.15)"
                          : "rgba(255,255,255,0.04)",
                      color: category === cat.key ? "#F7D56F" : "rgba(253,246,236,0.6)",
                      fontFamily: adorshoFont,
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label style={labelStyle}>শিরোনাম *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="পোস্টের শিরোনাম লিখুন..."
                required
                style={inputStyle}
              />
            </div>

            {/* Content */}
            <div>
              <label style={labelStyle}>লেখা *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="আপনার বাস্তবতার গল্প, অভিজ্ঞতা বা ভাবনা লিখুন..."
                required
                rows={6}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* Media URL */}
            <div>
              <label style={labelStyle}>মিডিয়া লিংক (ঐচ্ছিক)</label>
              <div style={{ display: "grid", gap: 8 }}>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="ছবি বা ভিডিওর URL..."
                  style={inputStyle}
                />
                {mediaUrl && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["image", "video"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setMediaType(t)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "0.3rem 0.7rem",
                          borderRadius: 999,
                          border:
                            mediaType === t
                              ? "1px solid rgba(247,213,111,0.6)"
                              : "1px solid rgba(232,201,122,0.2)",
                          background:
                            mediaType === t ? "rgba(247,213,111,0.12)" : "rgba(255,255,255,0.04)",
                          color: mediaType === t ? "#F7D56F" : "rgba(253,246,236,0.55)",
                          fontFamily: adorshoFont,
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                        }}
                      >
                        {t === "image" ? <Camera size={13} /> : <Film size={13} />}
                        {t === "image" ? "ছবি" : "ভিডিও"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <ActionButton disabled={!title.trim() || !content.trim() || createPost.isPending}>
              {createPost.isPending ? (
                <><RefreshCw size={16} style={{ animation: "spin 0.8s linear infinite" }} /> পাঠানো হচ্ছে...</>
              ) : (
                <><Send size={16} /> পোস্ট করুন</>
              )}
            </ActionButton>

            {createPost.isError && (
              <div
                style={{
                  padding: "0.6rem 1rem",
                  borderRadius: 12,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#FCA5A5",
                  fontSize: "0.85rem",
                }}
              >
                পোস্ট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
              </div>
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
  const detail = trpc.writingPlatform.getPostBySlug.useQuery({ slug });

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
            id={`comment-detail-${post.id}`}
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
            onClick={() => {
              const ta = document.getElementById(`comment-detail-${post.id}`) as HTMLTextAreaElement;
              if (!ta?.value.trim()) return;
              if (!isAuthenticated) { onLoginRequired(); return; }
            }}
            style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "linear-gradient(135deg, #F7D56F, #D4A843)",
              border: "none", display: "grid", placeItems: "center",
              color: "#071426", cursor: "pointer", flexShrink: 0,
            }}
          >
            <Send size={16} />
          </button>
        </div>

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

  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showLocalAuth, setShowLocalAuth] = useState(false);
  const [localAuthMode, setLocalAuthMode] = useState<"login" | "register">("login");

  const postsQuery = trpc.writingPlatform.listPosts.useQuery(
    activeCategory === "all" ? undefined : { category: activeCategory as Exclude<CategoryKey, "all"> },
    { refetchInterval: 60000 }
  );

  const posts = (postsQuery.data ?? []) as EnrichedPost[];

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
      `}</style>

      <main style={{ padding: "clamp(2rem, 6vw, 4rem) 0 3rem" }}>
        <div style={{ width: "min(720px, calc(100% - 2rem))", margin: "0 auto", display: "grid", gap: "1.25rem" }}>

          {/* ── Hero header ── */}
          {!slugFromUrl && (
            <div
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
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(1.6rem, 5vw, 2.6rem)",
                    fontWeight: 900,
                    lineHeight: 1.1,
                    color: "#FDF6EC",
                  }}
                >
                  আমিও লিখবো{" "}
                  <span style={{ color: "#D4A843" }}>বাস্তবতা</span>
                </h1>
                <p style={{ margin: "0.5rem 0 0", color: "rgba(253,246,236,0.6)", fontSize: "0.92rem" }}>
                  বাস্তব জীবনের গল্প, অভিজ্ঞতা ও ভাবনা শেয়ার করুন
                </p>
              </div>

              {isAuthenticated ? (
                <ActionButton onClick={() => setShowCreateModal(true)} small>
                  <Plus size={16} /> নতুন পোস্ট
                </ActionButton>
              ) : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {isLoginConfigured ? (
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
              )}
            </div>
          )}

          {/* ── Local Auth Modal ── */}
          {showLocalAuth && (
            <LocalAuthModal
              defaultMode={localAuthMode}
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
              {/* ── Create post box (logged in) ── */}
              {isAuthenticated && (
                <div
                  style={{
                    ...cardStyle,
                    padding: "1rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                  }}
                  onClick={() => setShowCreateModal(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setShowCreateModal(true)}
                >
                  <Avatar name={user?.name ?? "আপনি"} size={42} />
                  <div
                    style={{
                      flex: 1,
                      padding: "0.6rem 1rem",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(232,201,122,0.18)",
                      color: "rgba(253,246,236,0.45)",
                      fontSize: "0.95rem",
                    }}
                  >
                    আপনার বাস্তবতার গল্প লিখুন...
                  </div>
                  <Plus size={20} color="#D4A843" />
                </div>
              )}

              {/* ── Category filter ── */}
              <div
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
                    onClick={() => setActiveCategory(cat.key as CategoryKey)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "0.45rem 0.9rem",
                      borderRadius: 999,
                      border:
                        activeCategory === cat.key
                          ? "1px solid rgba(247,213,111,0.65)"
                          : "1px solid rgba(232,201,122,0.18)",
                      background:
                        activeCategory === cat.key
                          ? "rgba(247,213,111,0.14)"
                          : "rgba(255,255,255,0.04)",
                      color: activeCategory === cat.key ? "#F7D56F" : "rgba(253,246,236,0.58)",
                      fontFamily: adorshoFont,
                      fontWeight: 700,
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

              {/* ── Feed ── */}
              {postsQuery.isLoading ? (
                <div style={{ display: "grid", placeItems: "center", minHeight: 240 }}>
                  <RefreshCw size={32} color="#D4A843" style={{ animation: "spin 0.8s linear infinite" }} />
                </div>
              ) : posts.length === 0 ? (
                <div
                  style={{
                    ...cardStyle,
                    padding: "3rem 1.5rem",
                    textAlign: "center",
                    display: "grid",
                    gap: "0.75rem",
                  }}
                >
                  <PenLine size={40} color="rgba(232,201,122,0.35)" style={{ margin: "0 auto" }} />
                  <div style={{ color: "rgba(253,246,236,0.55)", fontSize: "1rem" }}>
                    এখনো কোনো পোস্ট নেই।
                  </div>
                  {isAuthenticated ? (
                    <ActionButton onClick={() => setShowCreateModal(true)} small>
                      <Plus size={15} /> প্রথম পোস্ট লিখুন
                    </ActionButton>
                  ) : (
                    <div style={{ color: "rgba(253,246,236,0.4)", fontSize: "0.88rem" }}>
                      লগইন করে প্রথম পোস্ট লিখুন!
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {posts.map((post) => (
                    <div key={post.id} className="post-card-enter">
                      <PostCard
                        post={post}
                        isAuthenticated={isAuthenticated}
                        onLoginRequired={handleLoginRequired}
                        onOpenDetail={handleOpenDetail}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ── Refresh ── */}
              {posts.length > 0 && (
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

      <Footer />
    </div>
  );
}
