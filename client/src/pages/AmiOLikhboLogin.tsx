/**
 * AmiOLikhboLogin — "আমিও লিখবো বাস্তবতা" Dedicated Login/Register Page
 * Premium minimal design with gold accents on dark navy background.
 * Supports: email+password login, register, forgot password, reset password.
 */
import { type CSSProperties, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Feather,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useLocation } from "wouter";
import Seo from "@/components/Seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl, getSignupUrl, isLoginConfigured } from "@/const";

const adorshoFont = "'AdorshoLipi', 'Noto Sans Bengali', sans-serif";

// ── Styles ────────────────────────────────────────────────────────────────────
const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(ellipse at 18% 8%, rgba(212,168,67,0.26) 0%, transparent 38%), radial-gradient(ellipse at 82% 82%, rgba(81,139,255,0.15) 0%, transparent 38%), radial-gradient(ellipse at 50% 50%, rgba(212,168,67,0.06) 0%, transparent 60%), linear-gradient(160deg, #050B14 0%, #081220 50%, #050A12 100%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.5rem",
  fontFamily: adorshoFont,
  color: "#FDF6EC",
  position: "relative",
  overflow: "hidden",
};

const glowOrb1: CSSProperties = {
  position: "fixed",
  top: "-12%",
  left: "-8%",
  width: "50vw",
  height: "50vw",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(212,168,67,0.15) 0%, transparent 70%)",
  pointerEvents: "none",
  zIndex: 0,
  animation: "driftOrb1 8s ease-in-out infinite alternate",
};

const glowOrb2: CSSProperties = {
  position: "fixed",
  bottom: "-18%",
  right: "-10%",
  width: "55vw",
  height: "55vw",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(81,139,255,0.11) 0%, transparent 70%)",
  pointerEvents: "none",
  zIndex: 0,
  animation: "driftOrb2 10s ease-in-out infinite alternate",
};

const cardStyle: CSSProperties = {
  position: "relative",
  zIndex: 1,
  width: "min(480px, 100%)",
  background: "linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.042) 100%)",
  border: "1px solid rgba(232,201,122,0.26)",
  borderRadius: 32,
  boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 0 60px rgba(212,168,67,0.06)",
  backdropFilter: "blur(32px)",
  padding: "clamp(1.8rem, 6vw, 2.8rem)",
  display: "grid",
  gap: "1.3rem",
  animation: "loginCardIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
};

const inputWrapStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: 7,
};

const labelStyle: CSSProperties = {
  color: "rgba(247,213,111,0.92)",
  fontWeight: 700,
  fontSize: "0.84rem",
  letterSpacing: "0.03em",
};

const inputStyle: CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.065)",
  border: "1.5px solid rgba(232,201,122,0.22)",
  borderRadius: 16,
  padding: "0.85rem 1rem",
  color: "#FDF6EC",
  fontFamily: adorshoFont,
  fontSize: "0.98rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
};

const btnPrimary: CSSProperties = {
  width: "100%",
  minHeight: 54,
  borderRadius: 999,
  border: "1px solid rgba(255,235,166,0.7)",
  background: "linear-gradient(135deg, #F7D56F 0%, #D4A843 55%, #B98A24 100%)",
  color: "#050B14",
  fontFamily: adorshoFont,
  fontWeight: 900,
  fontSize: "1.04rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "opacity 0.15s, transform 0.12s, box-shadow 0.15s",
  boxShadow: "0 6px 28px rgba(212,168,67,0.42), inset 0 1px 0 rgba(255,255,255,0.25)",
};

const btnGhost: CSSProperties = {
  background: "none",
  border: "none",
  color: "#F7D56F",
  fontFamily: adorshoFont,
  fontWeight: 700,
  fontSize: "0.88rem",
  cursor: "pointer",
  textDecoration: "underline",
  padding: 0,
};

const dividerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  color: "rgba(253,246,236,0.3)",
  fontSize: "0.78rem",
};

const dividerLine: CSSProperties = {
  flex: 1,
  height: 1,
  background: "rgba(232,201,122,0.15)",
};

type Mode = "login" | "register" | "forgot" | "reset";

export default function AmiOLikhboLogin() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setLocation("/amio-likhbo-bastobota");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  // Check for reset token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("reset_token");
    if (token) {
      setResetToken(token);
      setMode("reset");
    }
  }, []);

  function clearForm() {
    setError("");
    setSuccess("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "register" && !name.trim()) {
      setError("আপনার নাম দিন।");
      return;
    }
    if (mode === "reset") {
      if (!newPassword || newPassword.length < 6) {
        setError("নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("পাসওয়ার্ড দুটি মিলছে না।");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "forgot") {
        const res = await fetch("/api/local-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "forgot-password", email }),
          credentials: "include",
        });
        const data = await res.json();
        if (data.error) { setError(data.error); return; }
        setSuccess(data.message || "রিসেট লিঙ্ক পাঠানো হয়েছে। ইমেইল চেক করুন।");
        return;
      }

      if (mode === "reset") {
        const res = await fetch("/api/local-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset-password", token: resetToken, newPassword }),
          credentials: "include",
        });
        const data = await res.json();
        if (data.error) { setError(data.error); return; }
        setSuccess("পাসওয়ার্ড পরিবর্তন হয়েছে! এখন লগইন করুন।");
        setTimeout(() => { setMode("login"); clearForm(); }, 2000);
        return;
      }

      const res = await fetch("/api/local-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          email,
          password,
          name: mode === "register" ? name : undefined,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }

      if (mode === "register") {
        setSuccess("একাউন্ট তৈরি হয়েছে! এখন লগইন করুন।");
        setTimeout(() => { setMode("login"); clearForm(); }, 1800);
      } else {
        // login success — redirect
        window.location.href = "/amio-likhbo-bastobota";
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  const titleMap: Record<Mode, string> = {
    login: "লগইন করুন",
    register: "নতুন একাউন্ট",
    forgot: "পাসওয়ার্ড ভুলেছেন?",
    reset: "নতুন পাসওয়ার্ড",
  };

  const subtitleMap: Record<Mode, string> = {
    login: "আপনার লেখার জগতে স্বাগতম",
    register: "বাস্তবতার লেখক হিসেবে যোগ দিন",
    forgot: "ইমেইলে রিসেট লিঙ্ক পাঠানো হবে",
    reset: "নতুন পাসওয়ার্ড সেট করুন",
  };

  if (authLoading) {
    return (
      <div style={{ ...pageStyle, justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <RefreshCw size={32} color="#D4A843" style={{ animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "rgba(253,246,236,0.5)", fontFamily: adorshoFont }}>লোড হচ্ছে...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <Seo
        title="লগইন — আমিও লিখবো বাস্তবতা"
        description="আমিও লিখবো বাস্তবতা প্ল্যাটফর্মে লগইন করুন এবং আপনার বাস্তব অনুভূতি, গল্প ও কবিতা প্রকাশ করুন।"
      />
      {/* Background orbs */}
      <div style={glowOrb1} />
      <div style={glowOrb2} />

      {/* Floating particles */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 3 + (i % 3),
              height: 3 + (i % 3),
              borderRadius: "50%",
              background: `rgba(212,168,67,${0.15 + i * 0.05})`,
              top: `${10 + i * 15}%`,
              left: `${5 + i * 16}%`,
              animation: `float${i} ${4 + i}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Back link */}
      <div style={{ position: "relative", zIndex: 1, width: "min(460px, 100%)", marginBottom: "0.75rem" }}>
        <button
          onClick={() => setLocation("/amio-likhbo-bastobota")}
          style={{
            background: "none",
            border: "none",
            color: "rgba(247,213,111,0.7)",
            fontFamily: adorshoFont,
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: 0,
          }}
        >
          <ArrowLeft size={15} /> আমিও লিখবো বাস্তবতায় ফিরুন
        </button>
      </div>

      {/* Main card */}
      <div style={cardStyle}>
        {/* Logo & Title */}
        <div style={{ textAlign: "center", display: "grid", gap: "0.5rem" }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(212,168,67,0.25) 0%, rgba(212,168,67,0.08) 100%)",
              border: "1.5px solid rgba(232,201,122,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              boxShadow: "0 0 30px rgba(212,168,67,0.2)",
            }}
          >
            <Feather size={26} color="#D4A843" />
          </div>
          <div>
            <div
              style={{
                fontSize: "clamp(0.7rem, 2vw, 0.78rem)",
                color: "rgba(247,213,111,0.65)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              আমিও লিখবো বাস্তবতা
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.35rem, 4vw, 1.65rem)",
                fontWeight: 900,
                color: "#FDF6EC",
                lineHeight: 1.2,
              }}
            >
              {titleMap[mode]}
            </h1>
            <p
              style={{
                margin: "0.3rem 0 0",
                fontSize: "0.85rem",
                color: "rgba(253,246,236,0.5)",
                lineHeight: 1.5,
              }}
            >
              {subtitleMap[mode]}
            </p>
          </div>
        </div>

        {/* Tab switcher — login / register */}
        {(mode === "login" || mode === "register") && (
          <div style={{
            display: "flex", gap: 4,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(232,201,122,0.15)",
            borderRadius: 14, padding: 4,
          }}>
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); clearForm(); }}
                style={{
                  flex: 1, padding: "0.55rem 0.5rem",
                  borderRadius: 10, border: "none",
                  background: mode === m ? "rgba(212,168,67,0.22)" : "transparent",
                  color: mode === m ? "#F7D56F" : "rgba(253,246,236,0.45)",
                  fontFamily: adorshoFont, fontWeight: mode === m ? 900 : 600,
                  fontSize: "0.88rem", cursor: "pointer",
                  transition: "all 0.15s",
                  outline: mode === m ? "1px solid rgba(212,168,67,0.3)" : "none",
                }}
              >
                {m === "login" ? "লগইন" : "নতুন একাউন্ট"}
              </button>
            ))}
          </div>
        )}

        {/* Google OAuth button */}
        {isLoginConfigured && (mode === "login" || mode === "register") && (
          <>
            <a
              href={mode === "register" ? getSignupUrl() : getLoginUrl()}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                width: "100%", padding: "0.8rem 1rem",
                background: "rgba(255,255,255,0.07)",
                border: "1.5px solid rgba(232,201,122,0.25)",
                borderRadius: 14, color: "#FDF6EC",
                fontFamily: adorshoFont, fontWeight: 700, fontSize: "0.95rem",
                textDecoration: "none",
                transition: "background 0.15s",
              }}
            >
              <Sparkles size={17} color="#D4A843" />
              {mode === "register" ? "গুগল দিয়ে একাউন্ট খুলুন" : "গুগল দিয়ে লগইন করুন"}
            </a>
            <div style={dividerStyle}>
              <div style={dividerLine} />
              <span>অথবা ইমেইল দিয়ে</span>
              <div style={dividerLine} />
            </div>
          </>
        )}

        {/* Divider for non-OAuth mode */}
        {!isLoginConfigured && (mode === "login" || mode === "register") && (
          <div style={dividerStyle}>
            <div style={dividerLine} />
            <Sparkles size={12} color="rgba(232,201,122,0.4)" />
            <div style={dividerLine} />
          </div>
        )}

        {/* Success message */}
        {success && (
          <div
            style={{
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: 12,
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              color: "#86efac",
              fontSize: "0.88rem",
            }}
          >
            <CheckCircle2 size={16} style={{ marginTop: 1, flexShrink: 0 }} />
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.28)",
              borderRadius: 12,
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              color: "#fca5a5",
              fontSize: "0.88rem",
            }}
          >
            <AlertCircle size={16} style={{ marginTop: 1, flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          {/* Name field (register only) */}
          {mode === "register" && (
            <div style={inputWrapStyle}>
              <label style={labelStyle}>আপনার নাম *</label>
              <input
                type="text"
                placeholder="পুরো নাম লিখুন"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(212,168,67,0.6)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(232,201,122,0.22)"; }}
              />
            </div>
          )}

          {/* Email field */}
          {mode !== "reset" && (
            <div style={inputWrapStyle}>
              <label style={labelStyle}>ইমেইল *</label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus={mode === "login" || mode === "forgot"}
                  className="amio-login-input"
                  style={{ ...inputStyle, paddingLeft: "2.6rem" }}
                />
                <Mail
                  size={15}
                  color="rgba(247,213,111,0.45)"
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
              </div>
            </div>
          )}

          {/* Password field (login/register) */}
          {(mode === "login" || mode === "register") && (
            <div style={inputWrapStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={labelStyle}>পাসওয়ার্ড *</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); clearForm(); }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(247,213,111,0.6)",
                      fontFamily: adorshoFont,
                      fontSize: "0.76rem",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    পাসওয়ার্ড ভুলেছেন?
                  </button>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder={mode === "register" ? "কমপক্ষে ৬ অক্ষর" : "আপনার পাসওয়ার্ড"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ ...inputStyle, paddingLeft: "2.6rem", paddingRight: "2.8rem" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(212,168,67,0.6)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(232,201,122,0.22)"; }}
                />
                <Lock
                  size={15}
                  color="rgba(247,213,111,0.45)"
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    color: "rgba(253,246,236,0.4)", cursor: "pointer",
                    padding: 0, display: "flex",
                  }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          {/* Reset: new password fields */}
          {mode === "reset" && (
            <>
              <div style={inputWrapStyle}>
                <label style={labelStyle}>নতুন পাসওয়ার্ড *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNewPass ? "text" : "password"}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoFocus
                    style={{ ...inputStyle, paddingLeft: "2.6rem", paddingRight: "2.8rem" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(212,168,67,0.6)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(232,201,122,0.22)"; }}
                  />
                  <Lock
                    size={15}
                    color="rgba(247,213,111,0.45)"
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass((p) => !p)}
                    style={{
                      position: "absolute", right: 12, top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none",
                      color: "rgba(253,246,236,0.4)", cursor: "pointer",
                      padding: 0, display: "flex",
                    }}
                  >
                    {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div style={inputWrapStyle}>
                <label style={labelStyle}>পাসওয়ার্ড নিশ্চিত করুন *</label>
                <input
                  type="password"
                  placeholder="আবার একই পাসওয়ার্ড দিন"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ ...inputStyle, paddingLeft: "1rem" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(212,168,67,0.6)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(232,201,122,0.22)"; }}
                />
              </div>
            </>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="amio-login-btn"
            style={{ ...btnPrimary, opacity: loading ? 0.75 : 1 }}
            disabled={loading}
          >
            {loading ? (
              <><RefreshCw size={17} style={{ animation: "spin 0.8s linear infinite" }} /> অপেক্ষা করুন...</>
            ) : mode === "login" ? (
              <><KeyRound size={17} /> লগইন করুন</>
            ) : mode === "register" ? (
              <><UserPlus size={17} /> একাউন্ট তৈরি করুন</>
            ) : mode === "forgot" ? (
              <><Mail size={17} /> রিসেট লিঙ্ক পাঠান</>
            ) : (
              <><Lock size={17} /> পাসওয়ার্ড পরিবর্তন করুন</>
            )}
          </button>
        </form>

        {/* Mode switch footer */}
        {(mode === "login" || mode === "register") && (
          <div style={{ textAlign: "center", fontSize: "0.87rem", color: "rgba(253,246,236,0.48)" }}>
            {mode === "login" ? (
              <>
                একাউন্ট নেই?{" "}
                <button
                  type="button"
                  style={btnGhost}
                  onClick={() => { setMode("register"); clearForm(); }}
                >
                  নতুন একাউন্ট খুলুন
                </button>
              </>
            ) : (
              <>
                আগেই একাউন্ট আছে?{" "}
                <button
                  type="button"
                  style={btnGhost}
                  onClick={() => { setMode("login"); clearForm(); }}
                >
                  লগইন করুন
                </button>
              </>
            )}
          </div>
        )}

        {/* Back to login from forgot */}
        {(mode === "forgot" || mode === "reset") && (
          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              style={{ ...btnGhost, fontSize: "0.83rem", color: "rgba(247,213,111,0.6)" }}
              onClick={() => { setMode("login"); clearForm(); }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <ArrowLeft size={13} /> লগইন পেইজে ফিরুন
              </span>
            </button>
          </div>
        )}

        {/* Platform tagline */}
        <div
          style={{
            textAlign: "center",
            paddingTop: "0.5rem",
            borderTop: "1px solid rgba(232,201,122,0.1)",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(253,246,236,0.3)", lineHeight: 1.6 }}>
            বাস্তব অনুভূতি, গল্প, কবিতা ও ভাবনা প্রকাশের প্ল্যাটফর্ম
          </p>
        </div>
      </div>



      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float0 { from { transform: translateY(0px) rotate(0deg); } to { transform: translateY(-14px) rotate(5deg); } }
        @keyframes float1 { from { transform: translateY(0px) rotate(0deg); } to { transform: translateY(-20px) rotate(-4deg); } }
        @keyframes float2 { from { transform: translateY(0px); } to { transform: translateY(-10px); } }
        @keyframes float3 { from { transform: translateY(0px) rotate(0deg); } to { transform: translateY(-18px) rotate(6deg); } }
        @keyframes float4 { from { transform: translateY(0px); } to { transform: translateY(-12px); } }
        @keyframes float5 { from { transform: translateY(0px) rotate(0deg); } to { transform: translateY(-22px) rotate(-5deg); } }
        @keyframes driftOrb1 { from { transform: translate(0,0) scale(1); } to { transform: translate(20px, 15px) scale(1.08); } }
        @keyframes driftOrb2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-18px, -12px) scale(1.06); } }
        @keyframes loginCardIn { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .amio-login-input:focus { border-color: rgba(247,213,111,0.6) !important; box-shadow: 0 0 0 3px rgba(212,168,67,0.14), 0 2px 16px rgba(212,168,67,0.12) !important; background: rgba(255,255,255,0.09) !important; }
        .amio-login-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 10px 36px rgba(212,168,67,0.52) !important; }
        .amio-login-btn:active { transform: translateY(0); }
      `}</style>
    </div>
  );
}
