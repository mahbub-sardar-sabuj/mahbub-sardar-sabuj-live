/**
 * LocalAuthModal — Custom email+password login/register modal
 * Used in "আমিও লিখবো বাস্তবতা" page when OAuth is not configured.
 * Includes: login, register, forgot-password, reset-password flows.
 */

import { CSSProperties, useEffect, useState } from "react";
import { KeyRound, UserPlus, X, Eye, EyeOff, RefreshCw, CheckCircle2, AlertCircle, Mail, Lock, ArrowLeft } from "lucide-react";

const adorshoFont = "'AdorshoLipi', sans-serif";

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(7,20,38,0.92)",
  backdropFilter: "blur(14px)",
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
};

const modalStyle: CSSProperties = {
  border: "1px solid rgba(232,201,122,0.28)",
  background: "linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
  boxShadow: "0 32px 100px rgba(0,0,0,0.5)",
  backdropFilter: "blur(22px)",
  borderRadius: 28,
  padding: "clamp(1.5rem, 5vw, 2.2rem)",
  width: "min(440px, 100%)",
  display: "grid",
  gap: "1.1rem",
  color: "#FDF6EC",
  fontFamily: adorshoFont,
};

const inputStyle: CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(232,201,122,0.25)",
  borderRadius: 14,
  padding: "0.75rem 1rem",
  color: "#FDF6EC",
  fontFamily: adorshoFont,
  fontSize: "0.96rem",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: CSSProperties = {
  display: "block",
  color: "#F7D56F",
  fontWeight: 700,
  fontSize: "0.85rem",
  marginBottom: 6,
};

const btnPrimary: CSSProperties = {
  width: "100%",
  minHeight: 50,
  borderRadius: 999,
  border: "1px solid rgba(255,235,166,0.72)",
  background: "linear-gradient(135deg, #F7D56F 0%, #D4A843 58%, #B98A24 100%)",
  color: "#071426",
  fontFamily: adorshoFont,
  fontWeight: 900,
  fontSize: "1rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "opacity 0.15s",
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

const btnSecondary: CSSProperties = {
  background: "none",
  border: "1px solid rgba(232,201,122,0.3)",
  color: "rgba(253,246,236,0.7)",
  fontFamily: adorshoFont,
  fontWeight: 600,
  fontSize: "0.85rem",
  cursor: "pointer",
  padding: "0.4rem 0.8rem",
  borderRadius: 8,
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
};

type Mode = "login" | "register" | "forgot" | "reset";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: "login" | "register";
  /** If provided, modal opens directly in reset-password mode with this token */
  resetToken?: string;
}

export default function LocalAuthModal({ onClose, onSuccess, defaultMode = "login", resetToken }: Props) {
  const [mode, setMode] = useState<Mode>(resetToken ? "reset" : defaultMode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Token for reset flow (from URL or prop)
  const [activeResetToken] = useState<string>(resetToken || "");

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function switchToLogin() {
    setMode("login");
    clearMessages();
  }

  function switchToRegister() {
    setMode("register");
    clearMessages();
  }

  function switchToForgot() {
    setMode("forgot");
    clearMessages();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      // ── Login / Register ──────────────────────────────────────────────────
      if (mode === "login" || mode === "register") {
        const body: Record<string, string> = { action: mode, email, password };
        if (mode === "register") body.name = name;

        const res = await fetch("/api/local-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "সমস্যা হয়েছে। আবার চেষ্টা করুন।");
          return;
        }

        setSuccess(
          mode === "register"
            ? `স্বাগতম ${data.name}! একাউন্ট তৈরি হয়েছে।`
            : `স্বাগতম ${data.name}! লগইন সফল হয়েছে।`
        );

        setTimeout(() => {
          onSuccess();
          onClose();
          window.location.reload();
        }, 1200);
        return;
      }

      // ── Forgot Password ───────────────────────────────────────────────────
      if (mode === "forgot") {
        if (!email.trim()) {
          setError("আপনার ইমেইল ঠিকানা দিন");
          return;
        }

        const res = await fetch("/api/local-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "forgot-password", email }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "সমস্যা হয়েছে। আবার চেষ্টা করুন।");
          return;
        }

        setSuccess(data.message || "রিসেট লিঙ্ক পাঠানো হয়েছে। আপনার ইমেইল চেক করুন।");
        return;
      }

      // ── Reset Password ────────────────────────────────────────────────────
      if (mode === "reset") {
        if (!newPassword || newPassword.length < 8) {
          setError("নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে");
          return;
        }
        if (newPassword !== confirmPassword) {
          setError("পাসওয়ার্ড দুটি মিলছে না। আবার দিন।");
          return;
        }

        const res = await fetch("/api/local-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset-password", token: activeResetToken, newPassword }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "পাসওয়ার্ড পরিবর্তনে সমস্যা হয়েছে।");
          return;
        }

        setSuccess(data.message || "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! এখন লগইন করুন।");

        // Remove reset_token from URL
        const url = new URL(window.location.href);
        url.searchParams.delete("reset_token");
        window.history.replaceState({}, "", url.toString());

        setTimeout(() => {
          setMode("login");
          clearMessages();
        }, 2000);
        return;
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const isAuthTab = mode === "login" || mode === "register";

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, color: "#F7D56F" }}>
              {mode === "login" && <><KeyRound size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />লগইন করুন</>}
              {mode === "register" && <><UserPlus size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />একাউন্ট খুলুন</>}
              {mode === "forgot" && <><Mail size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />পাসওয়ার্ড ভুলে গেছেন?</>}
              {mode === "reset" && <><Lock size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />নতুন পাসওয়ার্ড দিন</>}
            </h2>
            <p style={{ margin: "0.3rem 0 0", color: "rgba(253,246,236,0.55)", fontSize: "0.85rem" }}>
              {mode === "login" && "আপনার বাস্তবতার গল্প লিখতে লগইন করুন"}
              {mode === "register" && "বিনামূল্যে একাউন্ট তৈরি করুন"}
              {mode === "forgot" && "ইমেইলে রিসেট লিঙ্ক পাঠানো হবে"}
              {mode === "reset" && "নতুন পাসওয়ার্ড সেট করুন"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              border: "1px solid rgba(232,201,122,0.22)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(253,246,236,0.7)",
              cursor: "pointer",
              display: "grid", placeItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab switcher — only for login/register */}
        {isAuthTab && (
          <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 4 }}>
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); clearMessages(); }}
                style={{
                  flex: 1, padding: "0.5rem", borderRadius: 10,
                  border: "none",
                  background: mode === m ? "rgba(212,168,67,0.22)" : "transparent",
                  color: mode === m ? "#F7D56F" : "rgba(253,246,236,0.5)",
                  fontFamily: adorshoFont,
                  fontWeight: 700, fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {m === "login" ? "লগইন" : "নতুন একাউন্ট"}
              </button>
            ))}
          </div>
        )}

        {/* Back button for forgot/reset */}
        {(mode === "forgot" || mode === "reset") && (
          <button
            type="button"
            onClick={switchToLogin}
            style={{ ...btnSecondary, justifySelf: "start" }}
          >
            <ArrowLeft size={14} /> লগইনে ফিরুন
          </button>
        )}

        {/* Success message */}
        {success && (
          <div style={{
            padding: "0.75rem 1rem", borderRadius: 14,
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.3)",
            color: "#86EFAC",
            display: "flex", alignItems: "center", gap: 8,
            fontSize: "0.9rem", fontWeight: 700,
          }}>
            <CheckCircle2 size={16} /> {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            padding: "0.75rem 1rem", borderRadius: 14,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#FCA5A5",
            display: "flex", alignItems: "center", gap: 8,
            fontSize: "0.88rem",
          }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.9rem" }}>

          {/* Register: name field */}
          {mode === "register" && (
            <div>
              <label style={labelStyle}>আপনার নাম *</label>
              <input
                type="text"
                placeholder="মাহবুব সরদার সবুজ"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          )}

          {/* Login / Register / Forgot: email field */}
          {(mode === "login" || mode === "register" || mode === "forgot") && (
            <div>
              <label style={labelStyle}>ইমেইল *</label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          )}

          {/* Login / Register: password field */}
          {(mode === "login" || mode === "register") && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>পাসওয়ার্ড *</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={switchToForgot}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(247,213,111,0.75)",
                      fontFamily: adorshoFont,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                      fontWeight: 600,
                    }}
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder={mode === "register" ? "কমপক্ষে ৮ অক্ষর" : "আপনার পাসওয়ার্ড"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "register" ? 8 : 1}
                  style={{ ...inputStyle, paddingRight: "2.8rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    color: "rgba(253,246,236,0.45)", cursor: "pointer",
                    padding: 0, display: "flex",
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Reset: new password fields */}
          {mode === "reset" && (
            <>
              <div>
                <label style={labelStyle}>নতুন পাসওয়ার্ড *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNewPass ? "text" : "password"}
                    placeholder="কমপক্ষে ৮ অক্ষর"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    style={{ ...inputStyle, paddingRight: "2.8rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass((p) => !p)}
                    style={{
                      position: "absolute", right: 12, top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none",
                      color: "rgba(253,246,236,0.45)", cursor: "pointer",
                      padding: 0, display: "flex",
                    }}
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>পাসওয়ার্ড নিশ্চিত করুন *</label>
                <input
                  type="password"
                  placeholder="আবার একই পাসওয়ার্ড দিন"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  style={inputStyle}
                />
              </div>
            </>
          )}

          {/* Submit button */}
          <button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? (
              <><RefreshCw size={16} style={{ animation: "spin 0.8s linear infinite" }} /> অপেক্ষা করুন...</>
            ) : mode === "login" ? (
              <><KeyRound size={16} /> লগইন করুন</>
            ) : mode === "register" ? (
              <><UserPlus size={16} /> একাউন্ট তৈরি করুন</>
            ) : mode === "forgot" ? (
              <><Mail size={16} /> রিসেট লিঙ্ক পাঠান</>
            ) : (
              <><Lock size={16} /> পাসওয়ার্ড পরিবর্তন করুন</>
            )}
          </button>
        </form>

        {/* Switch mode footer */}
        {isAuthTab && (
          <div style={{ textAlign: "center", fontSize: "0.87rem", color: "rgba(253,246,236,0.5)" }}>
            {mode === "login" ? (
              <>একাউন্ট নেই?{" "}
                <button type="button" style={btnGhost} onClick={switchToRegister}>
                  নতুন একাউন্ট খুলুন
                </button>
              </>
            ) : (
              <>আগেই একাউন্ট আছে?{" "}
                <button type="button" style={btnGhost} onClick={switchToLogin}>
                  লগইন করুন
                </button>
              </>
            )}
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
