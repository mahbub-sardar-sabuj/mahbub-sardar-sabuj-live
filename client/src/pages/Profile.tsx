import type { CSSProperties } from "react";
import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Edit3,
  FileText,
  Save,
  User,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { trpc } from "@/lib/trpc";

const adorshoFont = "'AdorshoLipi', 'Noto Sans Bengali', sans-serif";

const shellStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 16% 12%, rgba(212,168,67,0.18), transparent 28%), radial-gradient(circle at 85% 34%, rgba(81,139,255,0.10), transparent 30%), linear-gradient(180deg, #071426 0%, #0B1726 48%, #07111F 100%)",
  color: "#FDF6EC",
  fontFamily: adorshoFont,
};

const glassStyle: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(232,201,122,0.18)",
  borderRadius: 16,
  backdropFilter: "blur(12px)",
};

const goldBtn: CSSProperties = {
  background: "linear-gradient(135deg, #D4A843 0%, #F7D56F 50%, #C89A2E 100%)",
  color: "#071426",
  border: "none",
  borderRadius: 12,
  padding: "10px 22px",
  fontFamily: adorshoFont,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const inputStyle: CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(232,201,122,0.25)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#FDF6EC",
  fontFamily: adorshoFont,
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
};

export default function Profile() {
  const [, setLocation] = useLocation();
  const auth = trpc.auth.me.useQuery(undefined, { retry: false });
  const user = auth.data;

  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    bio: string;
    avatarUrl: string;
    postCount: number;
    approvedPostCount: number;
    createdAt: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // প্রোফাইল লোড করা
  useEffect(() => {
    fetch("/api/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setProfile(data);
          setEditName(data.name || "");
          setEditBio(data.bio || "");
        }
      })
      .catch(() => setError("প্রোফাইল লোড করতে সমস্যা হয়েছে"))
      .finally(() => setLoading(false));
  }, []);

  // প্রোফাইল সেভ করা
  async function handleSave() {
    if (!editName.trim()) { setError("নাম দিন"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, bio: editBio, avatarUrl: profile?.avatarUrl }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setProfile((prev) => prev ? { ...prev, name: editName, bio: editBio } : prev);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      auth.refetch();
    } catch {
      setError("সেভ করতে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  }

  // ছবি আপলোড করা
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setAvatarError("ছবির সাইজ সর্বোচ্চ ২ MB"); return; }
    setAvatarUploading(true);
    setAvatarError("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.error) { setAvatarError(data.error); return; }
      setProfile((prev) => prev ? { ...prev, avatarUrl: data.avatarUrl } : prev);
    } catch {
      setAvatarError("ছবি আপলোড করতে সমস্যা হয়েছে");
    } finally {
      setAvatarUploading(false);
    }
  }

  if (!auth.isLoading && !user) {
    return (
      <div style={shellStyle}>
        <Navbar />
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "120px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🔒</div>
          <h2 style={{ color: "#F7D56F", fontFamily: adorshoFont, marginBottom: 12 }}>লগইন করুন</h2>
          <p style={{ color: "rgba(253,246,236,0.7)", marginBottom: 24 }}>প্রোফাইল দেখতে লগইন করতে হবে।</p>
          <button style={goldBtn} onClick={() => setLocation("/amio-likhbo-bastobota")}>
            <ArrowLeft size={16} /> ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <Seo title="আমার প্রোফাইল — মাহবুব সরদার সবুজ" />
      <Navbar />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "100px 16px 60px" }}>
        {/* Back button */}
        <button
          onClick={() => setLocation("/amio-likhbo-bastobota")}
          style={{
            background: "none", border: "none", color: "rgba(253,246,236,0.6)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            fontFamily: adorshoFont, fontSize: 14, marginBottom: 24, padding: 0,
          }}
        >
          <ArrowLeft size={16} /> বাস্তবতায় ফিরুন
        </button>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(253,246,236,0.5)" }}>
            লোড হচ্ছে...
          </div>
        ) : error && !profile ? (
          <div style={{ ...glassStyle, padding: 24, textAlign: "center", color: "#ff6b6b" }}>
            {error}
          </div>
        ) : profile ? (
          <>
            {/* Success message */}
            {saveSuccess && (
              <div style={{
                background: "rgba(72,199,142,0.15)", border: "1px solid rgba(72,199,142,0.4)",
                borderRadius: 10, padding: "10px 16px", marginBottom: 16,
                display: "flex", alignItems: "center", gap: 8, color: "#48c78e",
                fontFamily: adorshoFont,
              }}>
                <CheckCircle2 size={16} /> প্রোফাইল সফলভাবে আপডেট হয়েছে!
              </div>
            )}

            {/* Profile Card */}
            <div style={{ ...glassStyle, padding: 28, marginBottom: 24 }}>
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 90, height: 90, borderRadius: "50%",
                    background: "linear-gradient(135deg, #D4A843, #F7D56F)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 36, fontWeight: 700, color: "#071426",
                    overflow: "hidden", border: "3px solid rgba(232,201,122,0.4)",
                  }}>
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="প্রোফাইল ছবি"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      (profile.name?.[0] || "?").toUpperCase()
                    )}
                  </div>
                  {/* ছবি পরিবর্তন বাটন */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    style={{
                      position: "absolute", bottom: 0, right: 0,
                      width: 28, height: 28, borderRadius: "50%",
                      background: "linear-gradient(135deg, #D4A843, #F7D56F)",
                      border: "2px solid #071426",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", padding: 0,
                    }}
                    title="ছবি পরিবর্তন করুন"
                  >
                    {avatarUploading ? (
                      <span style={{ fontSize: 10, color: "#071426" }}>...</span>
                    ) : (
                      <Camera size={13} color="#071426" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  {editing ? (
                    <>
                      <label style={{ color: "rgba(253,246,236,0.6)", fontSize: 13, display: "block", marginBottom: 4 }}>
                        নাম *
                      </label>
                      <input
                        style={{ ...inputStyle, marginBottom: 10 }}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={160}
                        placeholder="আপনার নাম"
                      />
                    </>
                  ) : (
                    <>
                      <h2 style={{ margin: "0 0 4px", color: "#F7D56F", fontSize: 22, fontFamily: adorshoFont }}>
                        {profile.name}
                      </h2>
                      <p style={{ margin: "0 0 8px", color: "rgba(253,246,236,0.5)", fontSize: 13 }}>
                        {profile.email}
                      </p>
                    </>
                  )}

                  {/* Stats */}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#F7D56F", fontWeight: 700, fontSize: 18 }}>{profile.approvedPostCount}</div>
                      <div style={{ color: "rgba(253,246,236,0.5)", fontSize: 12 }}>প্রকাশিত</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#F7D56F", fontWeight: 700, fontSize: 18 }}>{profile.postCount}</div>
                      <div style={{ color: "rgba(253,246,236,0.5)", fontSize: 12 }}>মোট লেখা</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Avatar error */}
              {avatarError && (
                <div style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 12, fontFamily: adorshoFont }}>
                  {avatarError}
                </div>
              )}

              {/* Bio */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: "rgba(253,246,236,0.6)", fontSize: 13, display: "block", marginBottom: 6 }}>
                  পরিচিতি (বায়ো)
                </label>
                {editing ? (
                  <textarea
                    style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    maxLength={500}
                    placeholder="নিজের সম্পর্কে কিছু লিখুন... (সর্বোচ্চ ৫০০ অক্ষর)"
                  />
                ) : (
                  <p style={{
                    color: profile.bio ? "#FDF6EC" : "rgba(253,246,236,0.35)",
                    fontSize: 15, lineHeight: 1.7, margin: 0, fontFamily: adorshoFont,
                  }}>
                    {profile.bio || "এখনো কোনো পরিচিতি যোগ করা হয়নি।"}
                  </p>
                )}
                {editing && (
                  <div style={{ textAlign: "right", color: "rgba(253,246,236,0.4)", fontSize: 12, marginTop: 4 }}>
                    {editBio.length}/500
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 12, fontFamily: adorshoFont }}>
                  {error}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {editing ? (
                  <>
                    <button style={goldBtn} onClick={handleSave} disabled={saving}>
                      <Save size={15} /> {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setEditName(profile.name); setEditBio(profile.bio || ""); setError(""); }}
                      style={{
                        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 12, padding: "10px 18px", color: "#FDF6EC",
                        fontFamily: adorshoFont, fontSize: 14, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      <X size={14} /> বাতিল
                    </button>
                  </>
                ) : (
                  <button style={goldBtn} onClick={() => setEditing(true)}>
                    <Edit3 size={15} /> প্রোফাইল সম্পাদনা
                  </button>
                )}
              </div>
            </div>

            {/* My Posts Section */}
            <MyPostsList openId={user?.openId || ""} />
          </>
        ) : null}
      </div>
    </div>
  );
}

// ── My Posts List ─────────────────────────────────────────────────────────────
function MyPostsList({ openId }: { openId: string }) {
  const myPostsQuery = trpc.writingPlatform.myPosts.useQuery(undefined, {
    enabled: Boolean(openId),
    retry: false,
  });

  const posts = myPostsQuery.data || [];

  const statusLabel: Record<string, { label: string; color: string }> = {
    pending:  { label: "পর্যালোচনাধীন", color: "#F7D56F" },
    approved: { label: "প্রকাশিত",      color: "#48c78e" },
    rejected: { label: "প্রকাশিত হয়নি", color: "#ff6b6b" },
    removed:  { label: "সরানো হয়েছে",  color: "#aaa" },
  };

  return (
    <div style={{ ...glassStyle, padding: 24 } as CSSProperties}>
      <h3 style={{ margin: "0 0 16px", color: "#F7D56F", fontFamily: "'AdorshoLipi','Noto Sans Bengali',sans-serif", fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
        <FileText size={18} /> আমার লেখাসমূহ
      </h3>

      {myPostsQuery.isLoading ? (
        <p style={{ color: "rgba(253,246,236,0.4)", fontFamily: "'AdorshoLipi','Noto Sans Bengali',sans-serif" }}>লোড হচ্ছে...</p>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✍️</div>
          <p style={{ color: "rgba(253,246,236,0.5)", fontFamily: "'AdorshoLipi','Noto Sans Bengali',sans-serif" }}>
            এখনো কোনো লেখা নেই।
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {posts.map((post: any) => {
            const s = statusLabel[post.status] || { label: post.status, color: "#aaa" };
            return (
              <div key={post.id} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(232,201,122,0.12)",
                borderRadius: 10, padding: "14px 16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <p style={{
                    margin: 0, color: "#FDF6EC", fontSize: 15,
                    fontFamily: "'AdorshoLipi','Noto Sans Bengali',sans-serif",
                    lineHeight: 1.6, flex: 1,
                  }}>
                    {post.title?.length > 80 ? post.title.slice(0, 80) + "..." : post.title}
                  </p>
                  <span style={{
                    fontSize: 11, color: s.color, background: `${s.color}22`,
                    border: `1px solid ${s.color}44`,
                    borderRadius: 6, padding: "2px 8px", whiteSpace: "nowrap", flexShrink: 0,
                    fontFamily: "'AdorshoLipi','Noto Sans Bengali',sans-serif",
                  }}>
                    {s.label}
                  </span>
                </div>
                <div style={{ marginTop: 6, color: "rgba(253,246,236,0.4)", fontSize: 12, fontFamily: "'AdorshoLipi','Noto Sans Bengali',sans-serif" }}>
                  {new Date(post.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
