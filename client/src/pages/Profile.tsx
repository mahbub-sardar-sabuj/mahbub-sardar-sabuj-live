/**
 * Profile — "আমিও লিখবো বাস্তবতা" User Profile Page
 * Premium design: large avatar, stats cards, bio editing, post list.
 */
import { useState, useRef, useEffect, type CSSProperties } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Feather,
  FileText,
  LogOut,
  PenLine,
  RefreshCw,
  Save,
  Settings,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const adorshoFont = "'AdorshoLipi', 'Noto Sans Bengali', sans-serif";

const shellStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 16% 12%, rgba(212,168,67,0.18), transparent 28%), radial-gradient(circle at 85% 34%, rgba(81,139,255,0.10), transparent 30%), linear-gradient(180deg, #071426 0%, #0B1726 48%, #07111F 100%)",
  color: "#FDF6EC",
  fontFamily: adorshoFont,
};

const glassCard: CSSProperties = {
  background: "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.03))",
  border: "1px solid rgba(232,201,122,0.2)",
  borderRadius: 24,
  backdropFilter: "blur(18px)",
  boxShadow: "0 16px 60px rgba(0,0,0,0.3)",
};

const inputStyle: CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.06)",
  border: "1.5px solid rgba(232,201,122,0.22)",
  borderRadius: 12,
  padding: "0.75rem 1rem",
  color: "#FDF6EC",
  fontFamily: adorshoFont,
  fontSize: "0.96rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const goldBtn: CSSProperties = {
  background: "linear-gradient(135deg, #F7D56F 0%, #D4A843 55%, #B98A24 100%)",
  color: "#071426",
  border: "1px solid rgba(255,235,166,0.6)",
  borderRadius: 999,
  padding: "0.65rem 1.4rem",
  fontFamily: adorshoFont,
  fontSize: "0.92rem",
  fontWeight: 900,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  boxShadow: "0 4px 18px rgba(212,168,67,0.3)",
  transition: "opacity 0.15s",
};

const ghostBtn: CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(232,201,122,0.22)",
  borderRadius: 999,
  padding: "0.65rem 1.2rem",
  color: "rgba(253,246,236,0.75)",
  fontFamily: adorshoFont,
  fontSize: "0.88rem",
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const dangerBtn: CSSProperties = {
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.3)",
  borderRadius: 999,
  padding: "0.65rem 1.2rem",
  color: "#FCA5A5",
  fontFamily: adorshoFont,
  fontSize: "0.88rem",
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading, logout, refresh } = useAuth();

  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    bio: string;
    avatarUrl: string;
    coverUrl: string;
    postCount: number;
    approvedPostCount: number;
    createdAt: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setProfile(null); setLoading(false); return; }

    let cancelled = false;
    setLoading(true);
    setError("");

    fetch("/api/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        else {
          setProfile(data);
          setEditName(data.name || "");
          setEditBio(data.bio || "");
        }
      })
      .catch(() => { if (!cancelled) setError("প্রোফাইল লোড করতে সমস্যা হয়েছে"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [authLoading, user?.openId]);

  async function handleSave() {
    if (!editName.trim()) { setError("নাম দিন"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, bio: editBio, avatarUrl: profile?.avatarUrl }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setProfile((prev) => prev ? { ...prev, name: editName, bio: editBio } : prev);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      refresh();
    } catch { setError("সেভ করতে সমস্যা হয়েছে"); }
    finally { setSaving(false); }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true); setAvatarError("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/upload?type=avatar", { method: "POST", credentials: "include", body: formData });
      const data = await res.json();
      if (data.error) { setAvatarError(data.error); return; }
      setProfile((prev) => prev ? { ...prev, avatarUrl: data.avatarUrl } : prev);
    } catch { setAvatarError("ছবি আপলোড করতে সমস্যা হয়েছে"); }
    finally { setAvatarUploading(false); }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true); setCoverError("");
    try {
      const formData = new FormData();
      formData.append("cover", file);
      const res = await fetch("/api/upload?type=cover", { method: "POST", credentials: "include", body: formData });
      const data = await res.json();
      if (data.error) { setCoverError(data.error); return; }
      setProfile((prev) => prev ? { ...prev, coverUrl: data.coverUrl } : prev);
    } catch { setCoverError("কভার ছবি আপলোড করতে সমস্যা হয়েছে"); }
    finally { setCoverUploading(false); if (e.target) e.target.value = ""; }
  }

  async function handleLogout() {
    if (!window.confirm("আপনি কি সত্যিই লগআউট করতে চান?")) return;
    setLoggingOut(true); setLogoutError("");
    try {
      await logout();
      setProfile(null);
      setLocation("/amio-likhbo-bastobota");
    } catch { setLogoutError("লগআউট করতে সমস্যা হয়েছে।"); }
    finally { setLoggingOut(false); }
  }

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div style={shellStyle}>
        <Navbar />
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "140px 20px", textAlign: "center" }}>
          <div
            style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(212,168,67,0.12)", border: "1px solid rgba(232,201,122,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Feather size={32} color="#D4A843" />
          </div>
          <h2 style={{ color: "#F7D56F", fontFamily: adorshoFont, marginBottom: 10, fontSize: "1.4rem" }}>
            লগইন করুন
          </h2>
          <p style={{ color: "rgba(253,246,236,0.6)", marginBottom: 28, lineHeight: 1.7 }}>
            প্রোফাইল দেখতে ও পোস্ট করতে লগইন করতে হবে।
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/amio-likhbo-login"
              style={{ ...goldBtn, textDecoration: "none" }}
            >
              লগইন করুন
            </a>
            <button style={ghostBtn} onClick={() => setLocation("/amio-likhbo-bastobota")}>
              <ArrowLeft size={15} /> ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <Seo
        title="আমার প্রোফাইল — আমিও লিখবো বাস্তবতা"
        description="আমিও লিখবো বাস্তবতা প্ল্যাটফর্মে নিজের প্রোফাইল, পরিচিতি এবং প্রকাশিত লেখাগুলো দেখুন ও সম্পাদনা করুন।"
        path="/profile"
      />
      <Navbar />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .profile-card { animation: fadeInUp 0.4s ease forwards; }
        input:focus, textarea:focus { border-color: rgba(212,168,67,0.6) !important; }
      `}</style>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "calc(var(--site-nav-offset, 98px) + 1.5rem) 1rem 4rem" }}>
        {/* Back button */}
        <button
          onClick={() => setLocation("/amio-likhbo-bastobota")}
          style={{
            background: "none", border: "none", color: "rgba(253,246,236,0.55)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            fontFamily: adorshoFont, fontSize: "0.85rem", marginBottom: "1.5rem", padding: 0,
          }}
        >
          <ArrowLeft size={15} /> বাস্তবতায় ফিরুন
        </button>

        {loading ? (
          <div style={{ display: "grid", placeItems: "center", minHeight: 280 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <RefreshCw size={28} color="#D4A843" style={{ animation: "spin 0.8s linear infinite" }} />
              <span style={{ color: "rgba(253,246,236,0.45)", fontFamily: adorshoFont }}>লোড হচ্ছে...</span>
            </div>
          </div>
        ) : error && !profile ? (
          <div style={{ ...glassCard, padding: "2rem", textAlign: "center", color: "#FCA5A5" }}>
            {error}
          </div>
        ) : profile ? (
          <div className="profile-card" style={{ display: "grid", gap: "1.25rem" }}>
            {/* Success toast */}
            {saveSuccess && (
              <div style={{
                background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: 14, padding: "0.85rem 1.1rem",
                display: "flex", alignItems: "center", gap: 8, color: "#86efac",
                fontFamily: adorshoFont, fontSize: "0.9rem",
              }}>
                <CheckCircle2 size={16} /> প্রোফাইল সফলভাবে আপডেট হয়েছে!
              </div>
            )}

            {/* ── Profile Hero Card ── */}
            <div style={{ ...glassCard, padding: "clamp(1.5rem, 5vw, 2.2rem)" }}>
              {/* Cover Photo */}
              <div style={{
                height: 140,
                borderRadius: "16px 16px 0 0",
                margin: "-clamp(1.5rem, 5vw, 2.2rem) -clamp(1.5rem, 5vw, 2.2rem) 0",
                background: profile?.coverUrl
                  ? `url(${profile.coverUrl}) center/cover no-repeat`
                  : "linear-gradient(135deg, rgba(212,168,67,0.28) 0%, rgba(81,139,255,0.15) 50%, rgba(212,168,67,0.1) 100%)",
                borderBottom: "1px solid rgba(232,201,122,0.15)",
                marginBottom: 0,
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Cover upload button */}
                <button
                  onClick={() => coverInputRef.current?.click()}
                  disabled={coverUploading}
                  title="কভার ছবি পরিবর্তন করুন"
                  style={{
                    position: "absolute", bottom: 10, right: 12,
                    background: "rgba(0,0,0,0.55)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 20,
                    padding: "0.35rem 0.75rem",
                    color: "#FDF6EC",
                    fontFamily: adorshoFont,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: coverUploading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    backdropFilter: "blur(8px)",
                    opacity: coverUploading ? 0.65 : 1,
                    transition: "opacity 0.15s",
                  }}
                >
                  {coverUploading
                    ? <><RefreshCw size={12} style={{ animation: "spin 0.8s linear infinite" }} /> আপলোড...</>
                    : <><Camera size={12} /> কভার পরিবর্তন</>
                  }
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleCoverChange}
                />
              </div>

              {/* Avatar row */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: "-40px", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 88, height: 88, borderRadius: "50%",
                    background: "linear-gradient(135deg, #D4A843, #F7D56F)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 32, fontWeight: 900, color: "#071426",
                    overflow: "hidden",
                    border: "3px solid #0B1726",
                    boxShadow: "0 0 0 2px rgba(232,201,122,0.4), 0 8px 24px rgba(0,0,0,0.4)",
                  }}>
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="প্রোফাইল ছবি"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      (profile.name?.[0] || "?").toUpperCase()
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    title="ছবি পরিবর্তন করুন"
                    style={{
                      position: "absolute", bottom: 2, right: 2,
                      width: 26, height: 26, borderRadius: "50%",
                      background: "linear-gradient(135deg, #D4A843, #F7D56F)",
                      border: "2px solid #0B1726",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: avatarUploading ? "not-allowed" : "pointer", padding: 0,
                      opacity: avatarUploading ? 0.6 : 1,
                    }}
                  >
                    {avatarUploading
                      ? <RefreshCw size={11} color="#071426" style={{ animation: "spin 0.8s linear infinite" }} />
                      : <Camera size={11} color="#071426" />
                    }
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                  />
                </div>

                {/* Action buttons top-right */}
                {!editing && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: "2.5rem" }}>
                    <button style={goldBtn} onClick={() => setEditing(true)}>
                      <Settings size={14} /> সম্পাদনা
                    </button>
                    <button
                      style={{ ...dangerBtn, opacity: loggingOut ? 0.65 : 1 }}
                      onClick={handleLogout}
                      disabled={loggingOut}
                    >
                      <LogOut size={14} /> {loggingOut ? "লগআউট..." : "লগআউট"}
                    </button>
                  </div>
                )}
              </div>

              {/* Avatar error */}
              {avatarError && (
                <div style={{ color: "#FCA5A5", fontSize: "0.82rem", marginBottom: "0.75rem", fontFamily: adorshoFont }}>
                  {avatarError}
                </div>
              )}
              {/* Cover error */}
              {coverError && (
                <div style={{ color: "#FCA5A5", fontSize: "0.82rem", marginBottom: "0.75rem", fontFamily: adorshoFont }}>
                  {coverError}
                </div>
              )}

              {/* Name & email */}
              {editing ? (
                <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ color: "rgba(247,213,111,0.85)", fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: 5 }}>
                      নাম *
                    </label>
                    <input
                      style={inputStyle}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={160}
                      placeholder="আপনার নাম"
                    />
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: "1rem" }}>
                  <h2 style={{ margin: "0 0 4px", color: "#F7D56F", fontSize: "clamp(1.2rem, 4vw, 1.5rem)", fontFamily: adorshoFont, lineHeight: 1.2 }}>
                    {profile.name}
                  </h2>
                  <p style={{ margin: 0, color: "rgba(253,246,236,0.45)", fontSize: "0.85rem" }}>
                    {profile.email}
                  </p>
                </div>
              )}

              {/* Stats row */}
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                {[
                  { value: profile.postCount, label: "প্রকাশিত লেখা", color: "#86efac" },
                  { value: new Date(profile.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "short" }), label: "যোগদান", color: "#F7D56F" },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      flex: "1 1 90px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(232,201,122,0.12)",
                      borderRadius: 14,
                      padding: "0.75rem 1rem",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ color: s.color, fontWeight: 900, fontSize: "1.3rem", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ color: "rgba(253,246,236,0.45)", fontSize: "0.75rem", marginTop: 4, lineHeight: 1.3 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Bio */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ color: "rgba(247,213,111,0.8)", fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: 6 }}>
                  পরিচিতি (বায়ো)
                </label>
                {editing ? (
                  <>
                    <textarea
                      style={{ ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.7 }}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      maxLength={500}
                      placeholder="নিজের সম্পর্কে কিছু লিখুন... (সর্বোচ্চ ৫০০ অক্ষর)"
                    />
                    <div style={{ textAlign: "right", color: "rgba(253,246,236,0.35)", fontSize: "0.75rem", marginTop: 4 }}>
                      {editBio.length}/500
                    </div>
                  </>
                ) : (
                  <p style={{
                    color: profile.bio ? "rgba(253,246,236,0.85)" : "rgba(253,246,236,0.3)",
                    fontSize: "0.95rem", lineHeight: 1.75, margin: 0, fontFamily: adorshoFont,
                  }}>
                    {profile.bio || "এখনো কোনো পরিচিতি যোগ করা হয়নি। সম্পাদনা করে যোগ করুন।"}
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div style={{ color: "#FCA5A5", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                  {error}
                </div>
              )}
              {logoutError && (
                <div style={{ color: "#FCA5A5", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                  {logoutError}
                </div>
              )}

              {/* Edit mode action buttons */}
              {editing && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button style={{ ...goldBtn, opacity: saving ? 0.75 : 1 }} onClick={handleSave} disabled={saving}>
                    <Save size={14} /> {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
                  </button>
                  <button
                    style={ghostBtn}
                    onClick={() => { setEditing(false); setEditName(profile.name); setEditBio(profile.bio || ""); setError(""); }}
                  >
                    <X size={14} /> বাতিল
                  </button>
                </div>
              )}
            </div>

            {/* ── Quick Links ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
              {[
                { icon: <PenLine size={16} />, label: "নতুন লেখা", href: "/amio-likhbo-bastobota", action: () => setLocation("/amio-likhbo-bastobota") },
                { icon: <ExternalLink size={16} />, label: "ফিড দেখুন", href: "/amio-likhbo-bastobota", action: () => setLocation("/amio-likhbo-bastobota") },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  style={{
                    ...glassCard,
                    padding: "0.9rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "rgba(247,213,111,0.8)",
                    fontFamily: adorshoFont,
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    border: "1px solid rgba(232,201,122,0.15)",
                    background: "rgba(255,255,255,0.04)",
                    transition: "background 0.15s",
                  }}
                >
                  {link.icon} {link.label}
                </button>
              ))}
            </div>

            {/* ── My Posts ── */}
            <MyPostsList openId={user?.openId || ""} />
          </div>
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

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending:  { label: "পর্যালোচনাধীন", color: "#FCD34D", bg: "rgba(252,211,77,0.1)" },
    approved: { label: "প্রকাশিত",      color: "#86efac", bg: "rgba(134,239,172,0.1)" },
    rejected: { label: "প্রকাশিত হয়নি", color: "#FCA5A5", bg: "rgba(252,165,165,0.1)" },
    removed:  { label: "সরানো হয়েছে",  color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  };

  return (
    <div style={{
      background: "linear-gradient(145deg, rgba(255,255,255,0.065), rgba(255,255,255,0.025))",
      border: "1px solid rgba(232,201,122,0.18)",
      borderRadius: 24,
      backdropFilter: "blur(14px)",
      padding: "clamp(1.2rem, 4vw, 1.8rem)",
    }}>
      <h3 style={{
        margin: "0 0 1.1rem",
        color: "#F7D56F",
        fontFamily: adorshoFont,
        fontSize: "1.05rem",
        fontWeight: 900,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <FileText size={18} /> আমার লেখাসমূহ
      </h3>

      {myPostsQuery.isLoading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(253,246,236,0.4)", fontFamily: adorshoFont, padding: "1rem 0" }}>
          <RefreshCw size={16} style={{ animation: "spin 0.8s linear infinite" }} /> লোড হচ্ছে...
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✍️</div>
          <p style={{ color: "rgba(253,246,236,0.45)", fontFamily: adorshoFont, margin: 0, lineHeight: 1.7 }}>
            এখনো কোনো লেখা নেই।
            <br />
            <a href="/amio-likhbo-bastobota" style={{ color: "#F7D56F", textDecoration: "none", fontWeight: 700 }}>
              প্রথম লেখাটি শুরু করুন →
            </a>
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {(posts as any[]).map((post) => {
            const s = statusConfig[post.status] || { label: post.status, color: "#aaa", bg: "rgba(170,170,170,0.1)" };
            return (
              <a
                key={post.id}
                href={`/amio-likhbo-bastobota/${post.slug}`}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(232,201,122,0.1)",
                  borderRadius: 14,
                  padding: "1rem 1.1rem",
                  textDecoration: "none",
                  display: "block",
                  transition: "background 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.borderColor = "rgba(232,201,122,0.22)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(232,201,122,0.1)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <p style={{
                    margin: 0, color: "#FDF6EC", fontSize: "0.95rem",
                    fontFamily: adorshoFont, lineHeight: 1.55, flex: 1, fontWeight: 700,
                  }}>
                    {post.title?.length > 90 ? post.title.slice(0, 90) + "..." : post.title}
                  </p>
                  <span style={{
                    fontSize: "0.72rem", color: s.color,
                    background: s.bg, border: `1px solid ${s.color}44`,
                    borderRadius: 8, padding: "0.2rem 0.6rem",
                    whiteSpace: "nowrap", flexShrink: 0,
                    fontFamily: adorshoFont, fontWeight: 700,
                  }}>
                    {s.label}
                  </span>
                </div>
                <div style={{ marginTop: "0.4rem", color: "rgba(253,246,236,0.38)", fontSize: "0.78rem", fontFamily: adorshoFont }}>
                  {new Date(post.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
