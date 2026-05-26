import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Copy,
  RefreshCw,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Inbox,
  Globe,
  QrCode
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

// Colors from the premium theme
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E5C167";
const CARD_BG = "rgba(13, 27, 46, 0.7)";
const BORDER = "rgba(201, 168, 76, 0.2)";
const TEXT = "#FFFFFF";
const MUTED = "#A0AEC0";

interface EmailAccount {
  address: string;
  token: string;
  id: string;
}

interface Message {
  id: string;
  from: { address: string; name: string };
  subject: string;
  intro: string;
  createdAt: string;
}

export default function TempEmail() {
  const [account, setAccount] = useState<EmailAccount | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [useCustom, setUseCustom] = useState(false);
  const [customUsername, setCustomUsername] = useState("");
  const [availableDomain, setAvailableDomain] = useState("mail.tm");
  const [allDomains, setAllDomains] = useState<string[]>([]);
  const [showQr, setShowQr] = useState(false);

  // Fetch available domains
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await fetch("https://api.mail.tm/domains");
        const data = await res.json();
        if (data["hydra:member"] && data["hydra:member"].length > 0) {
          const domains = data["hydra:member"].map((d: any) => d.domain);
          setAllDomains(domains);
          setAvailableDomain(domains[0]);
        }
      } catch (e) {
        console.error("Failed to fetch domains", e);
        setAllDomains(["mail.tm"]);
      }
    };
    fetchDomains();
  }, []);

  const generateEmail = async () => {
    setGenerating(true);
    setError(null);
    try {
      const username = useCustom && customUsername.trim().length >= 3 
        ? customUsername.trim().toLowerCase() 
        : Math.random().toString(36).substring(2, 12);
      
      const address = `${username}@${availableDomain}`;
      const password = Math.random().toString(36).substring(2, 15);

      const createRes = await fetch("https://api.mail.tm/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json();
        throw new Error(errData.detail || "ইমেইল তৈরি করতে সমস্যা হয়েছে। অন্য নাম চেষ্টা করুন।");
      }

      const tokenRes = await fetch("https://api.mail.tm/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password }),
      });

      const tokenData = await tokenRes.json();
      const newAccount = { address, token: tokenData.token, id: tokenData.id };
      
      setAccount(newAccount);
      localStorage.setItem("temp_email_account", JSON.stringify(newAccount));
      setMessages([]);
      setCountdown(15);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const fetchMessages = useCallback(async () => {
    if (!account) return;
    setRefreshing(true);
    try {
      const res = await fetch("https://api.mail.tm/messages", {
        headers: { Authorization: `Bearer ${account.token}` },
      });
      const data = await res.json();
      setMessages(data["hydra:member"] || []);
    } catch (e) {
      console.error("Failed to fetch messages", e);
    } finally {
      setRefreshing(false);
    }
  }, [account]);

  useEffect(() => {
    const saved = localStorage.getItem("temp_email_account");
    if (saved) {
      const parsed = JSON.parse(saved);
      setAccount(parsed);
    }
  }, []);

  useEffect(() => {
    if (!account) return;
    fetchMessages();
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchMessages();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [account, fetchMessages]);

  const copyEmail = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteAccount = () => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই ইমেইলটি মুছে ফেলতে চান?")) {
      localStorage.removeItem("temp_email_account");
      setAccount(null);
      setMessages([]);
      setUseCustom(false);
      setCustomUsername("");
    }
  };

  const manualRefresh = () => {
    setCountdown(15);
    fetchMessages();
  };

  return (
    <>
      <Seo
        title="বিনামূল্যে টেম্পোরারি ইমেইল | ডিসপোজেবল ইমেইল সার্ভিস | Temporary Email"
        description="নিরাপদ এবং গোপনীয় টেম্পোরারি ইমেইল ব্যবহার করুন। কোনো রেজিস্ট্রেশন ছাড়াই তাৎক্ষণিক ইনবক্স পান এবং স্প্যাম থেকে বাঁচুন।"
        path="/temp-email"
        seoKeywords="temporary email, temp mail, disposable email, burner email, free temp mail, anonymous email, টেম্পোরারি ইমেইল, টেম্প মেইল, ডিসপোজেবল ইমেইল, বার্নার ইমেইল, ফ্রি টেম্প মেইল, বেনামী ইমেইল"
      />
      <Navbar />
      <div
        className="min-h-screen"
        style={{
          background: "linear-gradient(135deg, #060E1A 0%, #0a1628 100%)",
          color: TEXT,
          fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
          paddingTop: "var(--site-nav-offset, 70px)",
        }}
      >
        {/* Hero Section */}
        <section style={{ textAlign: "center", padding: "60px 20px 40px" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(201,168,76,0.12)",
                border: `1px solid ${BORDER}`,
                padding: "8px 16px",
                borderRadius: 100,
                marginBottom: 24,
              }}
            >
              <Zap size={14} color={GOLD} />
              <span style={{ color: GOLD, fontSize: "0.75rem", fontWeight: 700, letterSpacing: 1.2, uppercase: true }}>
                তাৎক্ষণিক সার্ভিস
              </span>
            </div>
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 800,
                marginBottom: 16,
                fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', serif",
                background: `linear-gradient(to bottom, #FFFFFF, ${MUTED})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              টেম্পোরারি ইমেইল
            </h1>
            <p style={{ color: MUTED, fontSize: "1.1rem", maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.6 }}>
              আপনার আসল ইমেইল গোপন রাখুন। স্প্যাম থেকে বাঁচতে ব্যবহার করুন আমাদের প্রিমিয়াম ডিসপোজেবল ইমেইল সার্ভিস।
            </p>
          </motion.div>
        </section>

        {/* Main Content */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 0" }}>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 20,
                }}
              >
                <AlertCircle size={16} color="#ef4444" />
                <span style={{ color: "#ef4444", fontSize: "0.9rem" }}>{error}</span>
                <button onClick={() => setError(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.1rem" }}>×</button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 20,
              padding: "28px 24px",
              marginBottom: 24,
            }}
          >
            {!account ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(201,168,76,0.1)", border: `2px solid rgba(201,168,76,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <Mail size={32} color={GOLD} />
                </div>
                <h2 style={{ color: TEXT, fontSize: "1.3rem", fontWeight: 600, margin: "0 0 8px" }}>নতুন ইমেইল তৈরি করুন</h2>
                
                {allDomains.length > 0 && (
                  <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: MUTED, fontSize: '0.85rem' }}>
                      <Globe size={14} color={GOLD} /> ডোমেইন:
                    </div>
                    <select 
                      value={availableDomain}
                      onChange={(e) => setAvailableDomain(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '4px 10px', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                    >
                      {allDomains.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}

                <div style={{ marginBottom: 20, textAlign: "left", maxWidth: 420, margin: "0 auto 20px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: useCustom ? 12 : 0 }}>
                    <div onClick={() => setUseCustom(!useCustom)} style={{ width: 40, height: 22, borderRadius: 11, background: useCustom ? GOLD : "rgba(255,255,255,0.1)", border: `1px solid ${useCustom ? GOLD : "rgba(255,255,255,0.2)"}`, position: "relative", transition: "all 0.2s" }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: useCustom ? 20 : 2, transition: "left 0.2s" }} />
                    </div>
                    <span style={{ color: MUTED, fontSize: "0.85rem" }}>কাস্টম নাম ব্যবহার করুন</span>
                  </label>
                  {useCustom && (
                    <div style={{ display: "flex", alignItems: "center", background: "rgba(201,168,76,0.06)", border: `1px solid rgba(201,168,76,0.3)`, borderRadius: 12, overflow: "hidden" }}>
                      <input
                        type="text"
                        value={customUsername}
                        onChange={(e) => setCustomUsername(e.target.value.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 30))}
                        placeholder="আপনার নাম"
                        style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: TEXT, padding: "10px 14px" }}
                      />
                      <span style={{ color: GOLD, fontSize: "0.8rem", padding: "0 12px", borderLeft: `1px solid rgba(201,168,76,0.2)` }}>@{availableDomain}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={generateEmail}
                  disabled={generating}
                  style={{ background: generating ? "rgba(201,168,76,0.3)" : `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#060E1A", border: "none", borderRadius: 14, padding: "14px 36px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, transition: "all 0.2s" }}
                >
                  {generating ? <RefreshCw size={18} className="animate-spin" /> : <Zap size={18} />}
                  ইমেইল তৈরি করুন
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <CheckCircle size={16} color="#22c55e" />
                  <span style={{ color: "#22c55e", fontSize: "0.85rem" }}>ইমেইল সক্রিয় আছে</span>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={13} color={MUTED} />
                    <span style={{ color: MUTED, fontSize: "0.78rem" }}>{countdown}s পরে রিফ্রেশ</span>
                  </div>
                </div>

                <div style={{ background: "rgba(201,168,76,0.06)", border: `2px solid rgba(201,168,76,0.3)`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                  <Mail size={20} color={GOLD} />
                  <span style={{ color: TEXT, fontSize: "1.1rem", fontFamily: "monospace", fontWeight: 600, flex: 1, wordBreak: "break-all" }}>{account.address}</span>
                  <button onClick={copyEmail} style={{ background: copied ? "rgba(34,197,94,0.15)" : "rgba(201,168,76,0.1)", border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(201,168,76,0.3)"}`, borderRadius: 10, padding: "8px 16px", color: copied ? "#22c55e" : GOLD, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
                    {copied ? <CheckCircle size={15} /> : <Copy size={15} />} {copied ? "কপি হয়েছে!" : "কপি করুন"}
                  </button>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={manualRefresh} disabled={refreshing} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: "0.85rem" }}>
                    <RefreshCw size={15} color={GOLD} className={refreshing ? "animate-spin" : ""} /> ইনবক্স রিফ্রেশ
                  </button>
                  <button onClick={() => setShowQr(!showQr)} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: "0.85rem" }}>
                    <QrCode size={15} color={GOLD} /> QR কোড
                  </button>
                  <button onClick={deleteAccount} style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "9px 18px", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: "0.85rem", marginLeft: "auto" }}>
                    <Trash2 size={15} /> মুছে ফেলুন
                  </button>
                </div>

                {showQr && (
                  <div style={{ marginTop: 20, textAlign: 'center', padding: 20, background: 'white', borderRadius: 12, display: 'inline-block' }}>
                    <QRCodeSVG value={account.address} size={150} />
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Inbox Section */}
          <div style={{ marginBottom: 60 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Inbox size={20} color={GOLD} />
              <h3 style={{ color: TEXT, fontSize: "1.2rem", fontWeight: 600 }}>ইনবক্স</h3>
              {refreshing && <span style={{ color: MUTED, fontSize: "0.8rem" }}>আপডেট হচ্ছে...</span>}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: GOLD, fontWeight: 700, fontSize: "0.9rem" }}>{msg.from.name || msg.from.address}</span>
                      <span style={{ color: MUTED, fontSize: "0.75rem" }}>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <h4 style={{ color: TEXT, fontSize: "1rem", fontWeight: 600, marginBottom: 6 }}>{msg.subject}</h4>
                    <p style={{ color: MUTED, fontSize: "0.85rem", lineHeight: 1.5 }}>{msg.intro}</p>
                  </motion.div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.01)", border: `1px dashed ${BORDER}`, borderRadius: 20 }}>
                  <div style={{ color: MUTED, fontSize: "0.9rem" }}>ইনবক্স খালি। কোনো ইমেইল আসলে এখানে দেখা যাবে।</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
