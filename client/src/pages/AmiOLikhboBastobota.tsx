import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, CheckCircle2, Crown, KeyRound, LockKeyhole, PenLine, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { trpc } from "@/lib/trpc";
import { getLoginUrl, getSignupUrl, isLoginConfigured } from "@/const";

const adorshoFont = "'AdorshoLipi', 'Noto Sans Bengali', sans-serif";

const shellStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 16% 12%, rgba(212,168,67,0.18), transparent 28%), radial-gradient(circle at 85% 34%, rgba(81,139,255,0.10), transparent 30%), linear-gradient(180deg, #071426 0%, #0B1726 48%, #07111F 100%)",
  color: "#FDF6EC",
  fontFamily: adorshoFont,
};

const sectionStyle: CSSProperties = {
  width: "min(1120px, calc(100% - 2rem))",
  margin: "0 auto",
};

const glassStyle: CSSProperties = {
  border: "1px solid rgba(232,201,122,0.22)",
  background: "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035))",
  boxShadow: "0 26px 90px rgba(0,0,0,0.32)",
  backdropFilter: "blur(18px)",
};

function ActionButton({ href, disabled, children, variant = "primary" }: { href?: string; disabled?: boolean; children: ReactNode; variant?: "primary" | "ghost" }) {
  const baseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 56,
    borderRadius: 999,
    padding: "0.9rem 1.35rem",
    border: variant === "primary" ? "1px solid rgba(255,235,166,0.72)" : "1px solid rgba(232,201,122,0.26)",
    background:
      variant === "primary"
        ? "linear-gradient(135deg, #F7D56F 0%, #D4A843 58%, #B98A24 100%)"
        : "rgba(255,255,255,0.055)",
    color: variant === "primary" ? "#071426" : "#F7D56F",
    fontFamily: adorshoFont,
    fontWeight: 900,
    fontSize: "1.02rem",
    textDecoration: "none",
    boxShadow: variant === "primary" ? "0 18px 40px rgba(212,168,67,0.24)" : "none",
    opacity: disabled ? 0.58 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    pointerEvents: disabled ? "none" : "auto",
  };

  if (href && !disabled) {
    return (
      <a href={href} style={baseStyle} aria-disabled={disabled}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" disabled={disabled} style={baseStyle}>
      {children}
    </button>
  );
}

function ToolCard({ icon, title, subtitle, children }: { icon: ReactNode; title: string; subtitle: string; children: ReactNode }) {
  return (
    <article
      style={{
        ...glassStyle,
        borderRadius: 32,
        padding: "clamp(1.25rem, 4vw, 2rem)",
        display: "grid",
        gap: "1.25rem",
        minHeight: 285,
      }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 20,
            display: "grid",
            placeItems: "center",
            border: "1px solid rgba(232,201,122,0.35)",
            background: "rgba(232,201,122,0.08)",
            color: "#F7D56F",
          }}
        >
          {icon}
        </div>
        <div>
          <h2 style={{ margin: 0, color: "#F7D56F", fontSize: "clamp(1.65rem, 4.4vw, 2.45rem)", lineHeight: 1.1 }}>{title}</h2>
          <p style={{ margin: "0.35rem 0 0", color: "rgba(253,246,236,0.66)", lineHeight: 1.7 }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </article>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        width: "fit-content",
        borderRadius: 999,
        padding: "0.58rem 0.9rem",
        border: active ? "1px solid rgba(34,197,94,0.40)" : "1px solid rgba(232,201,122,0.24)",
        color: active ? "#8EF0B0" : "#F7D56F",
        background: active ? "rgba(34,197,94,0.10)" : "rgba(232,201,122,0.08)",
        fontWeight: 900,
      }}
    >
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: 999,
          background: active ? "#22C55E" : "#F7D56F",
          boxShadow: active ? "0 0 18px rgba(34,197,94,0.82)" : "0 0 18px rgba(247,213,111,0.55)",
        }}
      />
      {active ? "লগইন চালু আছে" : "লগইন শীঘ্রই চালু হবে"}
    </div>
  );
}

export default function AmiOLikhboBastobota() {
  const auth = trpc.auth.me.useQuery(undefined, { retry: false });
  const user = auth.data;
  const isAuthenticated = Boolean(user);
  const loginHref = isLoginConfigured ? getLoginUrl() : undefined;
  const signupHref = isLoginConfigured ? getSignupUrl() : undefined;

  return (
    <div style={shellStyle}>
      <Seo
        title="আমিও লিখবো বাস্তবতা | লগইন ও একাউন্ট"
        description="আমিও লিখবো বাস্তবতা ট্যাবের নিরাপদ লগইন ও নতুন একাউন্ট তৈরির পেজ।"
        path="/amio-likhbo-bastobota"
        type="website"
      />
      <Navbar />

      <main style={{ padding: "clamp(3.5rem, 8vw, 6rem) 0 3.5rem", overflow: "hidden" }}>
        <section style={{ ...sectionStyle, position: "relative" }}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "-50px -90px auto auto",
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(247,213,111,0.20), transparent 68%)",
              filter: "blur(2px)",
            }}
          />

          <div
            style={{
              ...glassStyle,
              position: "relative",
              borderRadius: 38,
              padding: "clamp(1.45rem, 5vw, 3.2rem)",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.08fr) minmax(280px, 0.72fr)",
              gap: "clamp(1.4rem, 4vw, 3rem)",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  border: "1px solid rgba(232,201,122,0.28)",
                  borderRadius: 999,
                  padding: "0.55rem 0.9rem",
                  color: "#F7D56F",
                  background: "rgba(232,201,122,0.08)",
                  fontWeight: 900,
                }}
              >
                <Sparkles size={16} /> নিরাপদ প্রবেশদ্বার
              </div>

              <h1
                style={{
                  margin: "1.1rem 0 0.9rem",
                  fontFamily: adorshoFont,
                  fontSize: "clamp(2.65rem, 9vw, 6.3rem)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.035em",
                  color: "#FDF6EC",
                }}
              >
                আমিও লিখবো <span style={{ color: "#D4A843" }}>বাস্তবতা</span>
              </h1>

              <p style={{ maxWidth: 680, color: "rgba(253,246,236,0.74)", lineHeight: 1.9, fontSize: "1.08rem", margin: 0 }}>
                এই ট্যাবটি এখন শুধু লগইন ও নতুন একাউন্ট তৈরির জন্য সাজানো হয়েছে। লগইন চালু হলে এখান থেকেই নিরাপদভাবে প্রবেশ করা যাবে।
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: "1.6rem" }}>
                <ActionButton href={loginHref} disabled={!isLoginConfigured || isAuthenticated}>
                  <KeyRound size={19} /> {isAuthenticated ? "আপনি লগইন আছেন" : "লগইন করুন"}
                </ActionButton>
                <ActionButton href={signupHref} disabled={!isLoginConfigured || isAuthenticated} variant="ghost">
                  <UserPlus size={19} /> নতুন একাউন্ট তৈরি করুন
                </ActionButton>
              </div>
            </div>

            <div
              style={{
                borderRadius: 30,
                border: "1px solid rgba(232,201,122,0.22)",
                background: "linear-gradient(180deg, rgba(7,20,38,0.72), rgba(255,255,255,0.045))",
                padding: "1.25rem",
                display: "grid",
                gap: "1rem",
              }}
            >
              <StatusPill active={isLoginConfigured} />
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ borderRadius: 22, padding: "1rem", background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <strong style={{ color: "#F7D56F", display: "flex", alignItems: "center", gap: 8, fontSize: "1.1rem" }}>
                    <ShieldCheck size={18} /> নিরাপদ পরিচয়
                  </strong>
                  <p style={{ margin: "0.55rem 0 0", color: "rgba(253,246,236,0.66)", lineHeight: 1.75 }}>একটি একাউন্ট দিয়েই প্রোফাইল, নিরাপত্তা ও ভবিষ্যৎ লেখার সুবিধা চালু থাকবে।</p>
                </div>
                <div style={{ borderRadius: 22, padding: "1rem", background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <strong style={{ color: "#F7D56F", display: "flex", alignItems: "center", gap: 8, fontSize: "1.1rem" }}>
                    <LockKeyhole size={18} /> একাউন্ট টুলস
                  </strong>
                  <p style={{ margin: "0.55rem 0 0", color: "rgba(253,246,236,0.66)", lineHeight: 1.75 }}>লগইন, নতুন একাউন্ট তৈরি ও প্রোফাইল প্রস্তুতির কাজ এই পেজ থেকেই শুরু হবে।</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            ...sectionStyle,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1rem",
            marginTop: "1.25rem",
          }}
        >
          <ToolCard icon={<KeyRound size={28} />} title="লগইন প্যানেল" subtitle="বর্তমান একাউন্টে প্রবেশ করুন।">
            <ActionButton href={loginHref} disabled={!isLoginConfigured || isAuthenticated}>
              <ArrowRight size={18} /> {isAuthenticated ? "লগইন সম্পন্ন" : "লগইন পেইজে যান"}
            </ActionButton>
          </ToolCard>

          <ToolCard icon={<UserPlus size={29} />} title="একাউন্ট তৈরি" subtitle="নতুন ব্যবহারকারীর জন্য নিরাপদ শুরু।">
            <ActionButton href={signupHref} disabled={!isLoginConfigured || isAuthenticated} variant="ghost">
              <UserPlus size={18} /> একাউন্ট খুলুন
            </ActionButton>
          </ToolCard>

          <ToolCard icon={<Crown size={29} />} title="প্রোফাইল প্রস্তুতি" subtitle={isAuthenticated ? "আপনার একাউন্ট সক্রিয় আছে।" : "লগইন হলে প্রোফাইল চালু হবে।"}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderRadius: 20,
                padding: "0.95rem 1rem",
                border: "1px solid rgba(232,201,122,0.18)",
                background: "rgba(255,255,255,0.05)",
                color: isAuthenticated ? "#8EF0B0" : "rgba(253,246,236,0.72)",
                fontWeight: 900,
              }}
            >
              <CheckCircle2 size={19} /> {isAuthenticated ? "একাউন্ট প্রস্তুত" : "প্রথমে লগইন করুন"}
            </div>
          </ToolCard>
        </section>

        {!isLoginConfigured && (
          <section style={{ ...sectionStyle, marginTop: "1.25rem" }}>
            <div
              style={{
                ...glassStyle,
                borderRadius: 28,
                padding: "1.2rem 1.35rem",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                color: "rgba(253,246,236,0.76)",
                lineHeight: 1.85,
              }}
            >
              <PenLine size={22} color="#F7D56F" style={{ marginTop: 4, flex: "0 0 auto" }} />
              <p style={{ margin: 0 }}>
                লগইন সিস্টেম শীঘ্রই চালু হবে। চালু হলে এই পেজের লগইন ও একাউন্ট তৈরির বাটন সরাসরি কাজ করবে।
              </p>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
