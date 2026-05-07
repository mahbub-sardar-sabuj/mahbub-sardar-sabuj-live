import { FormEvent, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowRight, Eye, Heart, MessageCircle, PenLine, Search, ShieldCheck, Sparkles, Star, ThumbsUp, Video } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

type Category = "experience" | "story" | "poem" | "thought" | "photo" | "video";
type ReactionType = "like" | "love" | "inspiring" | "sad";
type StatusFilter = "pending" | "approved" | "rejected" | "removed" | "all";

type PostFormState = {
  title: string;
  category: Category;
  content: string;
  mediaUrl: string;
  mediaType: "none" | "image" | "video";
};

const categories: Array<{ value: Category; label: string; description: string }> = [
  { value: "experience", label: "বাস্তব অভিজ্ঞতা", description: "নিজের দেখা সত্য ঘটনা" },
  { value: "story", label: "গল্প", description: "ছোটগল্প ও ধারাবাহিক গল্প" },
  { value: "poem", label: "কবিতা", description: "অনুভূতি ও ছন্দ" },
  { value: "thought", label: "মনের কথা", description: "ভাবনা, মতামত ও উপলব্ধি" },
  { value: "photo", label: "ছবি", description: "ছবির সঙ্গে লেখা" },
  { value: "video", label: "ভিডিও", description: "ভিডিও লিংকসহ পোস্ট" },
];

const reactions: Array<{ type: ReactionType; label: string }> = [
  { type: "like", label: "লাইক" },
  { type: "love", label: "ভালোবাসা" },
  { type: "inspiring", label: "অনুপ্রেরণা" },
  { type: "sad", label: "ব্যথিত" },
];

const statusLabels: Record<StatusFilter, string> = {
  pending: "অপেক্ষমাণ",
  approved: "প্রকাশিত",
  rejected: "বাতিল",
  removed: "রিমুভড",
  all: "সব",
};

const categoryLabels = categories.reduce<Record<Category, string>>((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {} as Record<Category, string>);

const shellStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #071426 0%, #0B1726 52%, #08111F 100%)",
  color: "#FDF6EC",
};

const sectionStyle: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  padding: "0 1.25rem",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid rgba(212,168,67,0.18)",
  background: "rgba(255,255,255,0.055)",
  borderRadius: 26,
  boxShadow: "0 24px 80px rgba(0,0,0,0.24)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid rgba(212,168,67,0.22)",
  borderRadius: 16,
  padding: "0.9rem 1rem",
  background: "rgba(255,255,255,0.06)",
  color: "#FDF6EC",
  fontFamily: "'Noto Sans Bengali', sans-serif",
  outline: "none",
};

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function shortText(value: string, length = 220) {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        border: "none",
        borderRadius: 999,
        padding: "0.88rem 1.25rem",
        background: props.disabled ? "rgba(212,168,67,0.25)" : "linear-gradient(135deg, #D4A843 0%, #E8C97A 100%)",
        color: "#071426",
        cursor: props.disabled ? "not-allowed" : "pointer",
        fontFamily: "'Noto Sans Bengali', sans-serif",
        fontWeight: 800,
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        ...props.style,
      }}
    />
  );
}

function GhostButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        border: "1px solid rgba(212,168,67,0.24)",
        borderRadius: 999,
        padding: "0.72rem 1rem",
        background: "rgba(255,255,255,0.055)",
        color: "#FDF6EC",
        cursor: props.disabled ? "not-allowed" : "pointer",
        fontFamily: "'Noto Sans Bengali', sans-serif",
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        ...props.style,
      }}
    />
  );
}

function LoginPrompt() {
  return (
    <div style={{ ...cardStyle, padding: "1.25rem", marginTop: "1rem" }}>
      <p style={{ margin: "0 0 1rem", color: "rgba(253,246,236,0.72)", lineHeight: 1.75 }}>
        পোস্ট লিখতে, রিঅ্যাকশন দিতে বা কমেন্ট করতে আগে অ্যাকাউন্টে প্রবেশ করুন। বর্তমান ওয়েবসাইটের নিরাপদ login ব্যবস্থার মাধ্যমেই আপনার profile তৈরি হবে।
      </p>
      <a href={getLoginUrl()} style={{ textDecoration: "none" }}>
        <PrimaryButton type="button">লগইন করে শুরু করুন <ArrowRight size={17} /></PrimaryButton>
      </a>
    </div>
  );
}

function PostCard({ post, onReact }: { post: any; onReact: (postId: number, type: ReactionType) => void }) {
  return (
    <article style={{ ...cardStyle, padding: "1.35rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <Link href={`/amio-likhbo-bastobota/${post.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
            <h3 style={{ margin: "0 0 0.55rem", color: "#E8C97A", fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif", fontSize: "1.65rem", lineHeight: 1.25 }}>
              {post.title}
            </h3>
          </Link>
          <p style={{ margin: 0, color: "rgba(253,246,236,0.58)", fontSize: "0.92rem" }}>
            {post.authorName} · {categoryLabels[post.category as Category]} · {formatDate(post.createdAt)}
          </p>
        </div>
        {post.featured && (
          <span style={{ alignSelf: "flex-start", border: "1px solid rgba(232,201,122,0.35)", borderRadius: 999, padding: "0.45rem 0.8rem", color: "#E8C97A", fontWeight: 800 }}>
            Featured
          </span>
        )}
      </div>
      {post.mediaUrl && post.mediaType === "image" && (
        <img src={post.mediaUrl} alt={post.title} style={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 18, marginBottom: 14 }} loading="lazy" />
      )}
      {post.mediaUrl && post.mediaType === "video" && (
        <a href={post.mediaUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#E8C97A", marginBottom: 14 }}>
          <Video size={18} /> ভিডিও দেখুন
        </a>
      )}
      <p style={{ color: "rgba(253,246,236,0.78)", lineHeight: 1.9, whiteSpace: "pre-wrap", margin: "0 0 1rem" }}>{shortText(post.content)}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {reactions.map((reaction) => (
            <GhostButton key={reaction.type} type="button" onClick={() => onReact(post.id, reaction.type)} style={{ color: post.myReaction === reaction.type ? "#071426" : "#FDF6EC", background: post.myReaction === reaction.type ? "#E8C97A" : "rgba(255,255,255,0.055)" }}>
              {reaction.label} ({post.reactionCounts?.[reaction.type] ?? 0})
            </GhostButton>
          ))}
        </div>
        <div style={{ display: "flex", gap: 14, color: "rgba(253,246,236,0.62)", fontSize: "0.92rem" }}>
          <span><MessageCircle size={15} /> {post.commentCount ?? 0}</span>
          <span><Eye size={15} /> {post.viewCount ?? 0}</span>
        </div>
      </div>
    </article>
  );
}

function PlatformHero({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section style={{ padding: "5.5rem 1.25rem 3rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: "-10% -20% auto auto", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,67,0.22), transparent 62%)" }} />
      <div style={{ ...sectionStyle, position: "relative" }}>
        <div style={{ maxWidth: 860 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "0.55rem 0.9rem", border: "1px solid rgba(212,168,67,0.28)", borderRadius: 999, color: "#E8C97A", background: "rgba(212,168,67,0.08)", fontWeight: 800 }}>
            <Sparkles size={16} /> বাংলা social writing platform
          </div>
          <h1 style={{ margin: "1.25rem 0 1rem", fontSize: "clamp(2.45rem, 7vw, 5.7rem)", lineHeight: 1.02, fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif", color: "#FDF6EC" }}>
            আমিও লিখবো <span style={{ color: "#D4A843" }}>বাস্তবতা</span>
          </h1>
          <p style={{ maxWidth: 760, color: "rgba(253,246,236,0.74)", lineHeight: 1.9, fontSize: "1.08rem" }}>
            এখানে ব্যবহারকারীরা নিজের বাস্তব অভিজ্ঞতা, গল্প, কবিতা, মনের কথা, ছবি ও ভিডিও প্রকাশ করতে পারবেন। পাঠকরা লাইক, রিঅ্যাকশন ও কমেন্টের মাধ্যমে লেখকের সঙ্গে যুক্ত থাকবেন, আর অ্যাডমিন নিরাপদ ও মানসম্মত প্রকাশনা নিশ্চিত করবেন।
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: "1.5rem" }}>
            <a href="#write" style={{ textDecoration: "none" }}><PrimaryButton type="button"><PenLine size={17} /> পোস্ট লিখুন</PrimaryButton></a>
            {!isAuthenticated && <a href={getLoginUrl()} style={{ textDecoration: "none" }}><GhostButton type="button"><ShieldCheck size={17} /> লগইন করুন</GhostButton></a>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AmiOLikhboBastobota() {
  const [matchDetail, params] = useRoute("/amio-likhbo-bastobota/:slug");
  const utils = trpc.useUtils();
  const auth = trpc.auth.me.useQuery(undefined, { retry: false });
  const user = auth.data;
  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === "admin";
  const postSlug = matchDetail ? params?.slug : undefined;

  const [category, setCategory] = useState<Category | "all">("all");
  const [form, setForm] = useState<PostFormState>({ title: "", category: "thought", content: "", mediaUrl: "", mediaType: "none" });
  const [comment, setComment] = useState("");
  const [adminPostStatus, setAdminPostStatus] = useState<StatusFilter>("pending");
  const [adminCommentStatus, setAdminCommentStatus] = useState<StatusFilter>("pending");

  const listInput = useMemo(() => ({ category: category === "all" ? undefined : category, limit: 30 }), [category]);
  const postsQuery = trpc.writingPlatform.listPosts.useQuery(listInput, { enabled: !postSlug });
  const postDetailQuery = trpc.writingPlatform.getPostBySlug.useQuery({ slug: postSlug || "" }, { enabled: Boolean(postSlug) });
  const myPostsQuery = trpc.writingPlatform.myPosts.useQuery(undefined, { enabled: isAuthenticated });
  const adminPostsQuery = trpc.writingPlatform.adminListPosts.useQuery({ status: adminPostStatus }, { enabled: isAdmin });
  const adminCommentsQuery = trpc.writingPlatform.adminListComments.useQuery({ status: adminCommentStatus }, { enabled: isAdmin });

  const createPost = trpc.writingPlatform.createPost.useMutation({
    onSuccess: async () => {
      setForm({ title: "", category: "thought", content: "", mediaUrl: "", mediaType: "none" });
      await Promise.all([utils.writingPlatform.listPosts.invalidate(), utils.writingPlatform.myPosts.invalidate(), utils.writingPlatform.adminListPosts.invalidate()]);
    },
  });

  const reactToPost = trpc.writingPlatform.reactToPost.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.writingPlatform.listPosts.invalidate(), utils.writingPlatform.getPostBySlug.invalidate()]);
    },
  });

  const addComment = trpc.writingPlatform.addComment.useMutation({
    onSuccess: async () => {
      setComment("");
      await Promise.all([utils.writingPlatform.getPostBySlug.invalidate(), utils.writingPlatform.adminListComments.invalidate()]);
    },
  });

  const adminUpdatePost = trpc.writingPlatform.adminUpdatePost.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.writingPlatform.adminListPosts.invalidate(), utils.writingPlatform.listPosts.invalidate(), utils.writingPlatform.getPostBySlug.invalidate()]);
    },
  });

  const adminUpdateComment = trpc.writingPlatform.adminUpdateComment.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.writingPlatform.adminListComments.invalidate(), utils.writingPlatform.getPostBySlug.invalidate()]);
    },
  });

  const handleCreatePost = (event: FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) return;
    createPost.mutate(form);
  };

  const handleComment = (event: FormEvent) => {
    event.preventDefault();
    const postId = postDetailQuery.data?.post?.id;
    if (!postId || !comment.trim()) return;
    addComment.mutate({ postId, content: comment });
  };

  const handleReaction = (postId: number, type: ReactionType) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    reactToPost.mutate({ postId, type });
  };

  const pageTitle = postDetailQuery.data?.post?.title
    ? `${postDetailQuery.data.post.title} | আমিও লিখবো বাস্তবতা`
    : "আমিও লিখবো বাস্তবতা | বাংলা লেখালেখি ও বাস্তব অভিজ্ঞতার প্ল্যাটফর্ম";

  return (
    <div style={shellStyle}>
      <Seo
        title={pageTitle}
        description="আমিও লিখবো বাস্তবতা হলো বাংলা ভাষায় বাস্তব অভিজ্ঞতা, গল্প, কবিতা, ছবি ও ভিডিও প্রকাশের social writing platform।"
        keywords="আমিও লিখবো বাস্তবতা, বাংলা লেখালেখি, গল্প, কবিতা, বাস্তব অভিজ্ঞতা, social writing platform"
        path={postSlug ? `/amio-likhbo-bastobota/${postSlug}` : "/amio-likhbo-bastobota"}
        type={postSlug ? "article" : "website"}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": postSlug ? "Article" : "WebSite",
          name: postDetailQuery.data?.post?.title || "আমিও লিখবো বাস্তবতা",
          description: "বাংলা ভাষায় বাস্তব অভিজ্ঞতা, গল্প, কবিতা, ছবি ও ভিডিও প্রকাশের social writing platform।",
          inLanguage: "bn-BD",
          author: postDetailQuery.data?.post?.authorName ? { "@type": "Person", name: postDetailQuery.data.post.authorName } : undefined,
        }}
      />
      <Navbar />
      <PlatformHero isAuthenticated={isAuthenticated} />

      {postSlug ? (
        <main style={{ ...sectionStyle, paddingBottom: "4rem" }}>
          <Link href="/amio-likhbo-bastobota" style={{ color: "#E8C97A", textDecoration: "none" }}>← সব পোস্টে ফিরে যান</Link>
          {postDetailQuery.isLoading && <p style={{ marginTop: 24 }}>পোস্ট লোড হচ্ছে...</p>}
          {!postDetailQuery.isLoading && !postDetailQuery.data && <p style={{ marginTop: 24 }}>পোস্ট পাওয়া যায়নি অথবা প্রকাশিত নয়।</p>}
          {postDetailQuery.data?.post && (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 22, marginTop: 20 }}>
              <PostCard post={postDetailQuery.data.post} onReact={handleReaction} />
              <section style={{ ...cardStyle, padding: "1.4rem" }}>
                <h2 style={{ marginTop: 0, color: "#E8C97A" }}>কমেন্ট</h2>
                <div style={{ display: "grid", gap: 12 }}>
                  {(postDetailQuery.data.comments || []).map((item: any) => (
                    <div key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 12 }}>
                      <strong>{item.authorName}</strong>
                      <p style={{ margin: "0.4rem 0 0", color: "rgba(253,246,236,0.72)", lineHeight: 1.7 }}>{item.content}</p>
                    </div>
                  ))}
                  {(postDetailQuery.data.comments || []).length === 0 && <p style={{ color: "rgba(253,246,236,0.62)" }}>এখনও কোনো প্রকাশিত কমেন্ট নেই।</p>}
                </div>
                {isAuthenticated ? (
                  <form onSubmit={handleComment} style={{ marginTop: "1rem", display: "grid", gap: 10 }}>
                    <textarea style={{ ...inputStyle, minHeight: 110 }} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="আপনার মন্তব্য লিখুন..." />
                    <PrimaryButton disabled={addComment.isPending || comment.trim().length < 2}>কমেন্ট পাঠান</PrimaryButton>
                    <small style={{ color: "rgba(253,246,236,0.55)" }}>নিরাপত্তার জন্য কমেন্ট admin approval-এর পর প্রকাশিত হবে।</small>
                  </form>
                ) : <LoginPrompt />}
              </section>
            </div>
          )}
        </main>
      ) : (
        <main style={{ ...sectionStyle, paddingBottom: "4.5rem" }}>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: "2rem" }}>
            {categories.map((item) => (
              <button key={item.value} type="button" onClick={() => setCategory(item.value)} style={{ ...cardStyle, padding: "1rem", textAlign: "left", color: "#FDF6EC", cursor: "pointer", borderColor: category === item.value ? "rgba(232,201,122,0.72)" : "rgba(212,168,67,0.18)" }}>
                <strong style={{ color: "#E8C97A" }}>{item.label}</strong>
                <p style={{ margin: "0.4rem 0 0", color: "rgba(253,246,236,0.62)" }}>{item.description}</p>
              </button>
            ))}
          </section>

          <section id="write" style={{ ...cardStyle, padding: "1.5rem", marginBottom: "2rem" }}>
            <h2 style={{ margin: "0 0 0.7rem", color: "#E8C97A", fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif", fontSize: "2rem" }}><PenLine size={24} /> নতুন পোস্ট লিখুন</h2>
            {isAuthenticated ? (
              <form onSubmit={handleCreatePost} style={{ display: "grid", gap: 12 }}>
                <input style={inputStyle} value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="পোস্টের শিরোনাম" />
                <select style={inputStyle} value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as Category }))}>
                  {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <textarea style={{ ...inputStyle, minHeight: 180 }} value={form.content} onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))} placeholder="আপনার বাস্তবতা, গল্প, কবিতা বা মনের কথা লিখুন..." />
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 180px", gap: 10 }}>
                  <input style={inputStyle} value={form.mediaUrl} onChange={(event) => setForm((prev) => ({ ...prev, mediaUrl: event.target.value }))} placeholder="ছবি বা ভিডিও URL (ঐচ্ছিক)" />
                  <select style={inputStyle} value={form.mediaType} onChange={(event) => setForm((prev) => ({ ...prev, mediaType: event.target.value as PostFormState["mediaType"] }))}>
                    <option value="none">মিডিয়া নেই</option>
                    <option value="image">ছবি</option>
                    <option value="video">ভিডিও</option>
                  </select>
                </div>
                <PrimaryButton disabled={createPost.isPending || form.title.trim().length < 3 || form.content.trim().length < 20}>প্রকাশের জন্য পাঠান <ArrowRight size={17} /></PrimaryButton>
                <small style={{ color: "rgba(253,246,236,0.58)" }}>সাধারণ ব্যবহারকারীর পোস্ট admin approval-এর পর public feed-এ প্রকাশিত হবে।</small>
              </form>
            ) : <LoginPrompt />}
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(300px, 0.75fr)", gap: 22, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, color: "#E8C97A", fontFamily: "'AdorshoLipi', 'Tiro Bangla', serif", fontSize: "2rem" }}><Search size={22} /> প্রকাশিত লেখা</h2>
                <GhostButton type="button" onClick={() => setCategory("all")}>সব ক্যাটাগরি</GhostButton>
              </div>
              <div style={{ display: "grid", gap: 16 }}>
                {postsQuery.isLoading && <p>পোস্ট লোড হচ্ছে...</p>}
                {(postsQuery.data || []).map((post: any) => <PostCard key={post.id} post={post} onReact={handleReaction} />)}
                {!postsQuery.isLoading && (postsQuery.data || []).length === 0 && <p style={{ color: "rgba(253,246,236,0.62)" }}>এই ক্যাটাগরিতে এখনও প্রকাশিত পোস্ট নেই।</p>}
              </div>
            </div>

            <aside style={{ display: "grid", gap: 18 }}>
              <div style={{ ...cardStyle, padding: "1.25rem" }}>
                <h3 style={{ color: "#E8C97A", marginTop: 0 }}><ThumbsUp size={19} /> আপনার প্রোফাইল পোস্ট</h3>
                {isAuthenticated ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    {(myPostsQuery.data || []).slice(0, 8).map((post: any) => (
                      <div key={post.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 10 }}>
                        <strong>{post.title}</strong>
                        <p style={{ margin: "0.35rem 0", color: "rgba(253,246,236,0.58)", fontSize: "0.9rem" }}>{statusLabels[post.status as StatusFilter]} · {formatDate(post.createdAt)}</p>
                      </div>
                    ))}
                    {(myPostsQuery.data || []).length === 0 && <p style={{ color: "rgba(253,246,236,0.62)" }}>আপনি এখনও কোনো পোস্ট পাঠাননি।</p>}
                  </div>
                ) : <p style={{ color: "rgba(253,246,236,0.62)" }}>প্রোফাইল পোস্ট দেখতে লগইন করুন।</p>}
              </div>

              <div style={{ ...cardStyle, padding: "1.25rem" }}>
                <h3 style={{ color: "#E8C97A", marginTop: 0 }}><Star size={19} /> প্ল্যাটফর্ম ফিচার</h3>
                <p style={{ lineHeight: 1.8, color: "rgba(253,246,236,0.7)" }}>প্রোফাইলভিত্তিক পোস্ট, reaction, comment approval, featured post, admin boost এবং public SEO-friendly post URL—সবকিছুর MVP ভিত্তি এই ট্যাবের ভিতরে যুক্ত করা হয়েছে।</p>
              </div>
            </aside>
          </section>

          {isAdmin && (
            <section style={{ ...cardStyle, padding: "1.5rem", marginTop: "2rem" }}>
              <h2 style={{ color: "#E8C97A", marginTop: 0 }}><ShieldCheck size={22} /> Admin Moderation</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 12 }}>
                    <h3>পোস্ট মডারেশন</h3>
                    <select style={{ ...inputStyle, maxWidth: 160 }} value={adminPostStatus} onChange={(event) => setAdminPostStatus(event.target.value as StatusFilter)}>
                      {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {(adminPostsQuery.data || []).map((post: any) => (
                      <div key={post.id} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 12 }}>
                        <strong>{post.title}</strong>
                        <p style={{ margin: "0.35rem 0", color: "rgba(253,246,236,0.58)" }}>{post.authorName} · {statusLabels[post.status as StatusFilter]}</p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <GhostButton type="button" onClick={() => adminUpdatePost.mutate({ postId: post.id, status: "approved" })}>Approve</GhostButton>
                          <GhostButton type="button" onClick={() => adminUpdatePost.mutate({ postId: post.id, status: "rejected" })}>Reject</GhostButton>
                          <GhostButton type="button" onClick={() => adminUpdatePost.mutate({ postId: post.id, status: "removed" })}>Remove</GhostButton>
                          <GhostButton type="button" onClick={() => adminUpdatePost.mutate({ postId: post.id, featured: !post.featured })}>{post.featured ? "Unfeature" : "Feature"}</GhostButton>
                          <GhostButton type="button" onClick={() => adminUpdatePost.mutate({ postId: post.id, boostedScore: (post.boostedScore || 0) + 10 })}>Boost +10</GhostButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 12 }}>
                    <h3>কমেন্ট মডারেশন</h3>
                    <select style={{ ...inputStyle, maxWidth: 160 }} value={adminCommentStatus} onChange={(event) => setAdminCommentStatus(event.target.value as StatusFilter)}>
                      {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {(adminCommentsQuery.data || []).map((item: any) => (
                      <div key={item.id} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 12 }}>
                        <strong>{item.authorName}</strong>
                        <p style={{ color: "rgba(253,246,236,0.7)", lineHeight: 1.6 }}>{item.content}</p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <GhostButton type="button" onClick={() => adminUpdateComment.mutate({ commentId: item.id, status: "approved" })}>Approve</GhostButton>
                          <GhostButton type="button" onClick={() => adminUpdateComment.mutate({ commentId: item.id, status: "rejected" })}>Reject</GhostButton>
                          <GhostButton type="button" onClick={() => adminUpdateComment.mutate({ commentId: item.id, status: "removed" })}>Remove</GhostButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      )}
      <Footer />
    </div>
  );
}
