/**
 * LocalAuthModal — Custom email+password login/register modal
 * Used in "আমিও লিখবো বাস্তবতা" page when OAuth is not configured.
 */

import { CSSProperties, useState } from "react";
import { KeyRound, UserPlus, X, Eye, EyeOff, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

const adorshoFont = "'AdorshoLipi', 'Noto Sans Bengali', sans-serif";

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

type Mode = "login" | "register";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: Mode;
}

export default function LocalAuthModal({ onClose, onSuccess, defaultMode = "login" }: Props) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
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
        // Reload to refresh auth state
        window.location.reload();
      }, 1200);
    } catch {
      setError("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, color: "#F7D56F" }}>
              {mode === "login" ? (
                <><KeyRound size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />লগইন করুন</>
              ) : (
                <><UserPlus size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />একাউন্ট খুলুন</>
              )}
            </h2>
            <p style={{ margin: "0.3rem 0 0", color: "rgba(253,246,236,0.55)", fontSize: "0.85rem" }}>
              {mode === "login"
                ? "আপনার বাস্তবতার গল্প লিখতে লগইন করুন"
                : "বিনামূল্যে একাউন্ট তৈরি করুন"}
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

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 4 }}>
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(""); setSuccess(""); }}
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.9rem" }}>
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

          <div>
            <label style={labelStyle}>পাসওয়ার্ড *</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder={mode === "register" ? "কমপক্ষে ৬ অক্ষর" : "আপনার পাসওয়ার্ড"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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

          <button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? (
              <><RefreshCw size={16} style={{ animation: "spin 0.8s linear infinite" }} /> অপেক্ষা করুন...</>
            ) : mode === "login" ? (
              <><KeyRound size={16} /> লগইন করুন</>
            ) : (
              <><UserPlus size={16} /> একাউন্ট তৈরি করুন</>
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div style={{ textAlign: "center", fontSize: "0.87rem", color: "rgba(253,246,236,0.5)" }}>
          {mode === "login" ? (
            <>একাউন্ট নেই?{" "}
              <button type="button" style={btnGhost} onClick={() => { setMode("register"); setError(""); }}>
                নতুন একাউন্ট খুলুন
              </button>
            </>
          ) : (
            <>আগেই একাউন্ট আছে?{" "}
              <button type="button" style={btnGhost} onClick={() => { setMode("login"); setError(""); }}>
                লগইন করুন
              </button>
            </>
          )}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
