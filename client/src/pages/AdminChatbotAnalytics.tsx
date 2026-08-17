// client/src/pages/AdminChatbotAnalytics.tsx
// Admin page: Chatbot Analytics & Fallback Tracking Dashboard
import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";

interface AnalyticsData {
  summary: {
    totalMessages: number;
    fallbackCount: number;
    fallbackRate: string;
    sessionCount: number;
    uptime: string;
  };
  topIntents: { intent: string; count: number }[];
  recentQuestions: { text: string; intent: string; timestamp: number }[];
  providerStats: Record<string, { success: number; fail: number }>;
  feedback?: { up: number; down: number };
}

const INTENT_LABELS: Record<string, string> = {
  author_info: "লেখক পরিচিতি",
  book_list: "বইয়ের তালিকা",
  book_buy: "বই কেনা",
  ebook_read: "ই-বুক পড়া",
  writing_search: "লেখা খোঁজা",
  contact: "যোগাযোগ",
  audio_edit: "অডিও এডিট",
  design_studio: "ডিজাইন স্টুডিও",
  general_ai: "সাধারণ AI",
  fallback: "ফলব্যাক",
  live_chat: "লাইভ চ্যাট",
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      padding: "14px 18px",
      background: "rgba(10,18,35,0.97)",
      border: `1px solid ${color || "rgba(212,168,67,0.2)"}`,
      borderRadius: 14,
      minWidth: 120,
      flex: 1,
    }}>
      <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.62rem", fontFamily: "'AdorshoLipi', sans-serif", marginBottom: 4 }}>{label}</div>
      <div style={{ color: color || "#D4A843", fontSize: "1.6rem", fontWeight: 800, fontFamily: "monospace", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.55rem", fontFamily: "'AdorshoLipi', sans-serif", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export default function AdminChatbotAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem("admin_analytics_key") || "");
  const [keyInput, setKeyInput] = useState("");

  const fetchData = async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analytics", {
        headers: { "X-Admin-Key": key },
      });
      if (res.status === 403) {
        setError("অ্যাডমিন কী ভুল। সঠিক কী দিন।");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setData(json);
      localStorage.setItem("admin_analytics_key", key);
    } catch {
      setError("ডেটা লোড করতে ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) fetchData(adminKey);
    else setLoading(false);
  }, []);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.trim()) {
      setAdminKey(keyInput.trim());
      fetchData(keyInput.trim());
    }
  };

  if (!adminKey || error === "অ্যাডমিন কী ভুল। সঠিক কী দিন।") {
    return (
      <DashboardLayout>
        <div style={{ padding: 32, maxWidth: 400 }}>
          <h2 style={{ color: "#D4A843", fontFamily: "'AdorshoLipi', sans-serif", marginBottom: 16, fontSize: "1.1rem" }}>
            🔐 অ্যাডমিন অ্যাক্সেস
          </h2>
          {error && (
            <div style={{ color: "#f87171", fontSize: "0.75rem", marginBottom: 12, fontFamily: "'AdorshoLipi', sans-serif" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleKeySubmit} style={{ display: "flex", gap: 8 }}>
            <input
              type="password"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="Analytics Admin Key"
              style={{
                flex: 1,
                padding: "9px 12px",
                background: "rgba(10,18,35,0.97)",
                border: "1px solid rgba(212,168,67,0.3)",
                borderRadius: 10,
                color: "#fff",
                fontSize: "0.8rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "9px 16px",
                background: "rgba(212,168,67,0.15)",
                border: "1px solid rgba(212,168,67,0.4)",
                borderRadius: 10,
                color: "#D4A843",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontFamily: "'AdorshoLipi', sans-serif",
                fontWeight: 700,
              }}
            >
              প্রবেশ করুন
            </button>
          </form>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: "20px 24px", maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={{ color: "#D4A843", fontFamily: "'AdorshoLipi', sans-serif", fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>
              📊 চ্যাটবট অ্যানালিটিক্স
            </h1>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.6rem", fontFamily: "'AdorshoLipi', sans-serif", marginTop: 2 }}>
              রিয়েল-টাইম ইন্টেন্ট ট্র্যাকিং ও ফলব্যাক মনিটরিং
            </div>
          </div>
          <button
            onClick={() => fetchData(adminKey)}
            disabled={loading}
            style={{
              padding: "7px 14px",
              background: "rgba(212,168,67,0.1)",
              border: "1px solid rgba(212,168,67,0.3)",
              borderRadius: 10,
              color: "#D4A843",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.65rem",
              fontFamily: "'AdorshoLipi', sans-serif",
              fontWeight: 700,
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "লোড হচ্ছে..." : "↺ রিফ্রেশ"}
          </button>
        </div>

        {loading && !data && (
          <div style={{ color: "rgba(212,168,67,0.6)", fontFamily: "'AdorshoLipi', sans-serif", fontSize: "0.8rem", padding: 20 }}>
            ডেটা লোড হচ্ছে...
          </div>
        )}

        {error && error !== "অ্যাডমিন কী ভুল। সঠিক কী দিন।" && (
          <div style={{ color: "#f87171", fontSize: "0.75rem", fontFamily: "'AdorshoLipi', sans-serif", padding: 12, background: "rgba(239,68,68,0.08)", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Summary Cards */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <StatCard label="মোট বার্তা" value={data.summary.totalMessages} sub="সব সময়ের" />
              <StatCard label="ফলব্যাক" value={data.summary.fallbackCount} sub={`হার: ${data.summary.fallbackRate}`} color="rgba(251,146,60,0.9)" />
              <StatCard label="সেশন" value={data.summary.sessionCount} sub="মোট সেশন" color="rgba(34,197,94,0.9)" />
              <StatCard label="পজিটিভ" value={data.feedback?.up || 0} sub={`নেগেটিভ: ${data.feedback?.down || 0}`} color="rgba(74,222,128,0.9)" />
              <StatCard label="আপটাইম" value={data.summary.uptime} color="rgba(99,102,241,0.9)" />
            </div>

            {/* Top Intents */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ color: "rgba(212,168,67,0.8)", fontFamily: "'AdorshoLipi', sans-serif", fontSize: "0.8rem", fontWeight: 700, marginBottom: 10 }}>
                🎯 শীর্ষ ইন্টেন্ট
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {data.topIntents.length === 0 ? (
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontFamily: "'AdorshoLipi', sans-serif" }}>কোনো ডেটা নেই</div>
                ) : data.topIntents.map((item, i) => {
                  const maxCount = data.topIntents[0]?.count || 1;
                  const pct = Math.round((item.count / maxCount) * 100);
                  const label = INTENT_LABELS[item.intent] || item.intent;
                  const isFallback = item.intent === "fallback";
                  return (
                    <div key={item.intent} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 18, color: "rgba(255,255,255,0.3)", fontSize: "0.55rem", textAlign: "right", flexShrink: 0 }}>#{i + 1}</div>
                      <div style={{ width: 120, color: isFallback ? "rgba(251,146,60,0.8)" : "rgba(255,255,255,0.7)", fontSize: "0.65rem", fontFamily: "'AdorshoLipi', sans-serif", flexShrink: 0 }}>
                        {label}
                      </div>
                      <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: isFallback ? "rgba(251,146,60,0.6)" : "rgba(212,168,67,0.5)",
                          borderRadius: 4,
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                      <div style={{ width: 30, color: "rgba(255,255,255,0.5)", fontSize: "0.6rem", textAlign: "right", flexShrink: 0 }}>{item.count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Provider Stats */}
            {Object.keys(data.providerStats).length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ color: "rgba(212,168,67,0.8)", fontFamily: "'AdorshoLipi', sans-serif", fontSize: "0.8rem", fontWeight: 700, marginBottom: 10 }}>
                  🤖 AI প্রোভাইডার পারফরম্যান্স
                </h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Object.entries(data.providerStats).map(([provider, stats]) => {
                    const total = stats.success + stats.fail;
                    const successRate = total > 0 ? Math.round((stats.success / total) * 100) : 0;
                    return (
                      <div key={provider} style={{
                        padding: "10px 14px",
                        background: "rgba(10,18,35,0.97)",
                        border: "1px solid rgba(99,102,241,0.2)",
                        borderRadius: 12,
                        minWidth: 140,
                      }}>
                        <div style={{ color: "rgba(165,180,252,0.8)", fontSize: "0.65rem", fontWeight: 700, marginBottom: 5 }}>{provider}</div>
                        <div style={{ display: "flex", gap: 10 }}>
                          <div>
                            <div style={{ color: "rgba(34,197,94,0.8)", fontSize: "0.55rem" }}>✅ সফল</div>
                            <div style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 700, fontFamily: "monospace" }}>{stats.success}</div>
                          </div>
                          <div>
                            <div style={{ color: "rgba(239,68,68,0.8)", fontSize: "0.55rem" }}>❌ ব্যর্থ</div>
                            <div style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 700, fontFamily: "monospace" }}>{stats.fail}</div>
                          </div>
                          <div>
                            <div style={{ color: "rgba(212,168,67,0.7)", fontSize: "0.55rem" }}>📈 হার</div>
                            <div style={{ color: successRate >= 90 ? "#22c55e" : successRate >= 70 ? "#D4A843" : "#ef4444", fontSize: "0.9rem", fontWeight: 700, fontFamily: "monospace" }}>{successRate}%</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Questions */}
            <div>
              <h3 style={{ color: "rgba(212,168,67,0.8)", fontFamily: "'AdorshoLipi', sans-serif", fontSize: "0.8rem", fontWeight: 700, marginBottom: 10 }}>
                💬 সাম্প্রতিক প্রশ্ন
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {data.recentQuestions.length === 0 ? (
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontFamily: "'AdorshoLipi', sans-serif" }}>কোনো প্রশ্ন নেই</div>
                ) : data.recentQuestions.map((q, i) => {
                  const isFallback = q.intent === "fallback";
                  const label = INTENT_LABELS[q.intent] || q.intent;
                  return (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "7px 10px",
                      background: isFallback ? "rgba(251,146,60,0.05)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isFallback ? "rgba(251,146,60,0.2)" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: 8,
                    }}>
                      <div style={{ flex: 1, color: "rgba(255,255,255,0.7)", fontSize: "0.68rem", fontFamily: "'AdorshoLipi', sans-serif", lineHeight: 1.5 }}>
                        {q.text}
                      </div>
                      <div style={{ flexShrink: 0, textAlign: "right" }}>
                        <div style={{
                          padding: "2px 7px",
                          background: isFallback ? "rgba(251,146,60,0.12)" : "rgba(212,168,67,0.08)",
                          border: `1px solid ${isFallback ? "rgba(251,146,60,0.3)" : "rgba(212,168,67,0.2)"}`,
                          borderRadius: 20,
                          color: isFallback ? "rgba(251,146,60,0.8)" : "rgba(212,168,67,0.7)",
                          fontSize: "0.52rem",
                          fontFamily: "'AdorshoLipi', sans-serif",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          marginBottom: 3,
                        }}>
                          {label}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.5rem", fontFamily: "'AdorshoLipi', sans-serif" }}>
                          {formatTime(q.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
