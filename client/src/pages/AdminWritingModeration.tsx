/**
 * AdminWritingModeration — Admin panel for moderating writing platform posts & comments
 * Route: /admin/writing (protected, admin only)
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  CheckCircle,
  XCircle,
  Trash2,
  Star,
  StarOff,
  Eye,
  MessageSquare,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const GOLD = "#D4A843";
const NAVY = "#060E1A";
const FONT = "'AdorshoLipi', 'Noto Sans Bengali', sans-serif";

const CATEGORY_LABELS: Record<string, string> = {
  experience: "অভিজ্ঞতা",
  story: "গল্প",
  poem: "কবিতা",
  thought: "ভাবনা",
  photo: "ছবি",
  video: "ভিডিও",
};

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: "অপেক্ষায়", color: "#fbbf24" },
  approved: { text: "অনুমোদিত", color: "#4ade80" },
  rejected: { text: "প্রত্যাখ্যাত", color: "#f87171" },
  removed: { text: "সরানো হয়েছে", color: "#94a3b8" },
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("bn-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type PostStatus = "pending" | "approved" | "rejected" | "removed" | "all";
type CommentStatus = "pending" | "approved" | "rejected" | "removed" | "all";

export default function AdminWritingModeration() {
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [postStatus, setPostStatus] = useState<PostStatus>("pending");
  const [commentStatus, setCommentStatus] = useState<CommentStatus>("pending");
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [expandedComment, setExpandedComment] = useState<number | null>(null);

  // ── Posts ─────────────────────────────────────────────────────────────────
  const {
    data: posts,
    refetch: refetchPosts,
    isLoading: postsLoading,
  } = trpc.writingPlatform.adminListPosts.useQuery(
    { status: postStatus },
    { refetchInterval: 30000 }
  );

  const updatePost = trpc.writingPlatform.adminUpdatePost.useMutation({
    onSuccess: () => refetchPosts(),
  });

  // ── Comments ──────────────────────────────────────────────────────────────
  const {
    data: comments,
    refetch: refetchComments,
    isLoading: commentsLoading,
  } = trpc.writingPlatform.adminListComments.useQuery(
    { status: commentStatus },
    { refetchInterval: 30000 }
  );

  const updateComment = trpc.writingPlatform.adminUpdateComment.useMutation({
    onSuccess: () => refetchComments(),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  function handlePostAction(
    postId: number,
    action: "approve" | "reject" | "remove" | "feature" | "unfeature"
  ) {
    if (action === "approve") updatePost.mutate({ postId, status: "approved" });
    else if (action === "reject") updatePost.mutate({ postId, status: "rejected" });
    else if (action === "remove") updatePost.mutate({ postId, status: "removed" });
    else if (action === "feature") updatePost.mutate({ postId, featured: true });
    else if (action === "unfeature") updatePost.mutate({ postId, featured: false });
  }

  function handleCommentAction(
    commentId: number,
    action: "approve" | "reject" | "remove"
  ) {
    if (action === "approve") updateComment.mutate({ commentId, status: "approved" });
    else if (action === "reject") updateComment.mutate({ commentId, status: "rejected" });
    else if (action === "remove") updateComment.mutate({ commentId, status: "removed" });
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const shell: React.CSSProperties = {
    minHeight: "100vh",
    background: `linear-gradient(180deg, ${NAVY} 0%, #0B1726 100%)`,
    color: "#FDF6EC",
    fontFamily: FONT,
    padding: "24px",
  };

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(212,168,67,0.2)",
    borderRadius: 16,
    padding: "20px",
    marginBottom: 16,
  };

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: "10px 24px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontFamily: FONT,
    fontSize: 15,
    fontWeight: active ? 700 : 400,
    background: active ? GOLD : "rgba(255,255,255,0.08)",
    color: active ? NAVY : "#FDF6EC",
    transition: "all 0.2s",
  });

  const filterBtn = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    borderRadius: 8,
    border: `1px solid ${active ? GOLD : "rgba(212,168,67,0.3)"}`,
    cursor: "pointer",
    fontFamily: FONT,
    fontSize: 13,
    background: active ? "rgba(212,168,67,0.15)" : "transparent",
    color: active ? GOLD : "#94a3b8",
    transition: "all 0.2s",
  });

  const actionBtn = (color: string): React.CSSProperties => ({
    padding: "6px 12px",
    borderRadius: 8,
    border: `1px solid ${color}`,
    cursor: "pointer",
    fontFamily: FONT,
    fontSize: 12,
    background: `${color}20`,
    color: color,
    display: "flex",
    alignItems: "center",
    gap: 4,
    transition: "all 0.2s",
  });

  return (
    <DashboardLayout>
      <div style={shell}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: GOLD, margin: 0 }}>
            লেখা মডারেশন প্যানেল
          </h1>
          <p style={{ color: "#94a3b8", marginTop: 6, fontSize: 14 }}>
            ব্যবহারকারীদের জমা দেওয়া লেখা ও মন্তব্য পর্যালোচনা করুন
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <button style={tabBtn(activeTab === "posts")} onClick={() => setActiveTab("posts")}>
            <FileText size={16} style={{ display: "inline", marginRight: 6 }} />
            লেখাসমূহ {posts ? `(${posts.length})` : ""}
          </button>
          <button style={tabBtn(activeTab === "comments")} onClick={() => setActiveTab("comments")}>
            <MessageSquare size={16} style={{ display: "inline", marginRight: 6 }} />
            মন্তব্যসমূহ {comments ? `(${comments.length})` : ""}
          </button>
        </div>

        {/* ── POSTS TAB ── */}
        {activeTab === "posts" && (
          <div>
            {/* Filter bar */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              {(["pending", "approved", "rejected", "removed", "all"] as PostStatus[]).map((s) => (
                <button
                  key={s}
                  style={filterBtn(postStatus === s)}
                  onClick={() => setPostStatus(s)}
                >
                  {s === "pending" ? "অপেক্ষায়"
                    : s === "approved" ? "অনুমোদিত"
                    : s === "rejected" ? "প্রত্যাখ্যাত"
                    : s === "removed" ? "সরানো"
                    : "সব"}
                </button>
              ))}
              <button
                style={{ ...filterBtn(false), marginLeft: "auto" }}
                onClick={() => refetchPosts()}
              >
                <RefreshCw size={13} style={{ display: "inline", marginRight: 4 }} />
                রিফ্রেশ
              </button>
            </div>

            {/* Posts list */}
            {postsLoading ? (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>লোড হচ্ছে...</div>
            ) : !posts || posts.length === 0 ? (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>
                কোনো লেখা পাওয়া যায়নি
              </div>
            ) : (
              posts.map((post) => {
                const status = STATUS_LABELS[post.status] ?? { text: post.status, color: "#94a3b8" };
                const isExpanded = expandedPost === post.id;
                return (
                  <div key={post.id} style={card}>
                    {/* Post header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{
                            background: `${status.color}20`,
                            color: status.color,
                            border: `1px solid ${status.color}`,
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: 12,
                          }}>
                            {status.text}
                          </span>
                          <span style={{
                            background: "rgba(212,168,67,0.1)",
                            color: GOLD,
                            border: "1px solid rgba(212,168,67,0.3)",
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: 12,
                          }}>
                            {CATEGORY_LABELS[post.category] ?? post.category}
                          </span>
                          {post.featured && (
                            <span style={{
                              background: "rgba(251,191,36,0.15)",
                              color: "#fbbf24",
                              border: "1px solid #fbbf24",
                              borderRadius: 6,
                              padding: "2px 8px",
                              fontSize: 12,
                            }}>
                              ⭐ ফিচার্ড
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 600, color: "#FDF6EC", margin: "0 0 4px 0" }}>
                          {post.title}
                        </h3>
                        <div style={{ fontSize: 13, color: "#94a3b8" }}>
                          ✍️ {post.authorName} &nbsp;·&nbsp; 🕐 {formatDate(post.createdAt)}
                          &nbsp;·&nbsp; 👁️ {post.viewCount} বার দেখা
                          &nbsp;·&nbsp; 💬 {post.commentCount} মন্তব্য
                        </div>
                      </div>
                      <button
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                        onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                      >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div style={{
                        marginTop: 16,
                        padding: 16,
                        background: "rgba(0,0,0,0.3)",
                        borderRadius: 10,
                        fontSize: 14,
                        color: "#e2e8f0",
                        lineHeight: 1.8,
                        maxHeight: 300,
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                      }}>
                        {post.content}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                      {post.status !== "approved" && (
                        <button
                          style={actionBtn("#4ade80")}
                          onClick={() => handlePostAction(post.id, "approve")}
                          disabled={updatePost.isPending}
                        >
                          <CheckCircle size={13} /> অনুমোদন
                        </button>
                      )}
                      {post.status !== "rejected" && (
                        <button
                          style={actionBtn("#f87171")}
                          onClick={() => handlePostAction(post.id, "reject")}
                          disabled={updatePost.isPending}
                        >
                          <XCircle size={13} /> প্রত্যাখ্যান
                        </button>
                      )}
                      {post.status !== "removed" && (
                        <button
                          style={actionBtn("#94a3b8")}
                          onClick={() => {
                            if (confirm("এই লেখাটি সরিয়ে দিতে চান?")) {
                              handlePostAction(post.id, "remove");
                            }
                          }}
                          disabled={updatePost.isPending}
                        >
                          <Trash2 size={13} /> সরিয়ে দিন
                        </button>
                      )}
                      {post.status === "approved" && !post.featured && (
                        <button
                          style={actionBtn("#fbbf24")}
                          onClick={() => handlePostAction(post.id, "feature")}
                          disabled={updatePost.isPending}
                        >
                          <Star size={13} /> ফিচার্ড করুন
                        </button>
                      )}
                      {post.featured && (
                        <button
                          style={actionBtn("#94a3b8")}
                          onClick={() => handlePostAction(post.id, "unfeature")}
                          disabled={updatePost.isPending}
                        >
                          <StarOff size={13} /> ফিচার্ড সরান
                        </button>
                      )}
                      <a
                        href={`/amio-likhbo-bastobota/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...actionBtn("#60a5fa"), textDecoration: "none" }}
                      >
                        <Eye size={13} /> দেখুন
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── COMMENTS TAB ── */}
        {activeTab === "comments" && (
          <div>
            {/* Filter bar */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              {(["pending", "approved", "rejected", "removed", "all"] as CommentStatus[]).map((s) => (
                <button
                  key={s}
                  style={filterBtn(commentStatus === s)}
                  onClick={() => setCommentStatus(s)}
                >
                  {s === "pending" ? "অপেক্ষায়"
                    : s === "approved" ? "অনুমোদিত"
                    : s === "rejected" ? "প্রত্যাখ্যাত"
                    : s === "removed" ? "সরানো"
                    : "সব"}
                </button>
              ))}
              <button
                style={{ ...filterBtn(false), marginLeft: "auto" }}
                onClick={() => refetchComments()}
              >
                <RefreshCw size={13} style={{ display: "inline", marginRight: 4 }} />
                রিফ্রেশ
              </button>
            </div>

            {/* Comments list */}
            {commentsLoading ? (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>লোড হচ্ছে...</div>
            ) : !comments || comments.length === 0 ? (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>
                কোনো মন্তব্য পাওয়া যায়নি
              </div>
            ) : (
              comments.map((comment) => {
                const status = STATUS_LABELS[comment.status] ?? { text: comment.status, color: "#94a3b8" };
                const isExpanded = expandedComment === comment.id;
                return (
                  <div key={comment.id} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{
                            background: `${status.color}20`,
                            color: status.color,
                            border: `1px solid ${status.color}`,
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: 12,
                          }}>
                            {status.text}
                          </span>
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>
                            Post #{comment.postId}
                          </span>
                        </div>
                        <div style={{ fontSize: 14, color: "#FDF6EC", marginBottom: 4 }}>
                          {comment.content.length > 150 && !isExpanded
                            ? comment.content.slice(0, 150) + "..."
                            : comment.content}
                        </div>
                        <div style={{ fontSize: 13, color: "#94a3b8" }}>
                          ✍️ {comment.authorName} &nbsp;·&nbsp; 🕐 {formatDate(comment.createdAt)}
                        </div>
                      </div>
                      {comment.content.length > 150 && (
                        <button
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                          onClick={() => setExpandedComment(isExpanded ? null : comment.id)}
                        >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      {comment.status !== "approved" && (
                        <button
                          style={actionBtn("#4ade80")}
                          onClick={() => handleCommentAction(comment.id, "approve")}
                          disabled={updateComment.isPending}
                        >
                          <CheckCircle size={13} /> অনুমোদন
                        </button>
                      )}
                      {comment.status !== "rejected" && (
                        <button
                          style={actionBtn("#f87171")}
                          onClick={() => handleCommentAction(comment.id, "reject")}
                          disabled={updateComment.isPending}
                        >
                          <XCircle size={13} /> প্রত্যাখ্যান
                        </button>
                      )}
                      {comment.status !== "removed" && (
                        <button
                          style={actionBtn("#94a3b8")}
                          onClick={() => {
                            if (confirm("এই মন্তব্যটি সরিয়ে দিতে চান?")) {
                              handleCommentAction(comment.id, "remove");
                            }
                          }}
                          disabled={updateComment.isPending}
                        >
                          <Trash2 size={13} /> সরিয়ে দিন
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
