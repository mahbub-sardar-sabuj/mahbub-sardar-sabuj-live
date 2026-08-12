/**
 * TempEmail — Temporary Email Generator
 * Design: Deep Navy + Rich Gold (matches site theme)
 * API: mail.tm (free, no API key required)
 * Features: Generate email, copy, receive inbox, auto-refresh, delete
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, RefreshCw, Mail, Trash2, Eye, Clock, CheckCircle, AlertCircle, Inbox, Shield, Zap, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C97A";
const BG = "#060E1A";
const CARD_BG = "rgba(255,255,255,0.03)";
const BORDER = "rgba(201,168,76,0.15)";
const TEXT = "#FAF6EF";
const MUTED = "rgba(250,246,239,0.55)";
const TEMP_EMAIL_API = "/api/sms-proxy?service=temp-email";
const DEFAULT_USERNAME = "mahbubsardarsabuj";

interface ProxyError {
  error?: string;
  message?: string;
  "hydra:description"?: string;
}

async function tempEmailRequest<T>(
  action: string,
  payload: Record<string, string> = {}
): Promise<T> {
  const response = await fetch(TEMP_EMAIL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as ProxyError | null;
    const message =
      data?.["hydra:description"] ||
      data?.error ||
      data?.message ||
      "ইমেইল সেবাটি এখন ব্যবহার করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।";
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

interface EmailAccount {
  id: string;
  address: string;
  token: string;
  password: string;
  createdAt: string;
}

interface Message {
  id: string;
  from: { name: string; address: string };
  subject: string;
  intro: string;
  seen: boolean;
  createdAt: string;
  hasAttachments: boolean;
}

interface MessageDetail {
  id: string;
  from: { name: string; address: string };
  subject: string;
  text: string;
  html: string[];
  createdAt: string;
  hasAttachments: boolean;
}

// Generate random string
function randomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Sanitize custom username: lowercase, alphanumeric + dot/underscore/hyphen only
function sanitizeUsername(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 40);
}

// Format time ago
function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff} সেকেন্ড আগে`;
  if (diff < 3600) return `${Math.floor(diff / 60)} মিনিট আগে`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ঘণ্টা আগে`;
  return `${Math.floor(diff / 86400)} দিন আগে`;
}

export default function TempEmail() {
  const [account, setAccount] = useState<EmailAccount | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [viewingMessage, setViewingMessage] = useState(false);
  const sequenceRef = useRef<number | null>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch available domains
  const getDomains = async (): Promise<string[]> => {
    const data = await tempEmailRequest<{ "hydra:member"?: Array<{ isActive: boolean; domain: string }> }>("domains");
    const members = data["hydra:member"] || [];
    return members.filter((d) => d.isActive).map((d) => d.domain);
  };

  // Create new email account with a predictable sequential username.
  const createAccount = async (): Promise<EmailAccount> => {
    const domains = await getDomains();
    if (!domains.length) throw new Error("কোনো ডোমেইন পাওয়া যায়নি");
    const domain = domains[0];
    const password = randomString(16);

    // Remember the next number during this browser session and across reloads.
    if (sequenceRef.current === null) {
      try {
        const stored = Number.parseInt(localStorage.getItem("temp-email-sequence") || "0", 10);
        sequenceRef.current = Number.isFinite(stored) && stored >= 0 ? stored : 0;
      } catch {
        sequenceRef.current = 0;
      }
    }
    const sequenceStart = sequenceRef.current;
    const tryAddresses = Array.from({ length: 10 }, (_, offset) => {
      const sequence = sequenceStart + offset;
      const username = sequence === 0
        ? DEFAULT_USERNAME
        : `${DEFAULT_USERNAME}${String(sequence).padStart(2, "0")}`;
      return `${username}@${domain}`;
    });

    let address = tryAddresses[0];
    let accountData: Record<string, string> | null = null;

    for (let index = 0; index < tryAddresses.length; index += 1) {
      const addr = tryAddresses[index];
      try {
        accountData = await tempEmailRequest<Record<string, string>>("createAccount", { address: addr, password });
        address = addr;
        sequenceRef.current = sequenceStart + index + 1;
        try {
          localStorage.setItem("temp-email-sequence", String(sequenceRef.current));
        } catch {
          // Private browsing may block localStorage; the in-memory counter still works.
        }
        break;
      } catch (error) {
        if (index === tryAddresses.length - 1) throw error;
      }
    }
    if (!accountData) throw new Error("অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে");

    // Get token
    const tokenData = await tempEmailRequest<{ token?: string }>("createToken", { address, password });
    if (!tokenData.token) throw new Error("টোকেন পেতে সমস্যা হয়েছে");

    return {
      id: accountData.id,
      address,
      token: tokenData.token,
      password,
      createdAt: accountData.createdAt,
    };
  };

  // Fetch messages
  const fetchMessages = useCallback(async (acc: EmailAccount) => {
    try {
      const data = await tempEmailRequest<{ "hydra:member"?: Message[] }>("messages", { token: acc.token });
      setMessages(data["hydra:member"] || []);
    } catch {
      // Silent fail
    }
  }, []);

  // Fetch single message detail
  const fetchMessageDetail = async (msgId: string, acc: EmailAccount) => {
    setViewingMessage(true);
    try {
      const data = await tempEmailRequest<MessageDetail>("message", { id: msgId, token: acc.token });
      setSelectedMessage(data);
      // Mark as read
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, seen: true } : m))
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "ইমেইল লোড করতে সমস্যা হয়েছে");
    } finally {
      setViewingMessage(false);
    }
  };

  // Delete message
  const deleteMessage = async (msgId: string) => {
    if (!account) return;
    try {
      await tempEmailRequest<void>("deleteMessage", { id: msgId, token: account.token });
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      if (selectedMessage?.id === msgId) setSelectedMessage(null);
    } catch {
      // Silent fail
    }
  };

  // Start auto-refresh
  const startAutoRefresh = useCallback(
    (acc: EmailAccount) => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      setCountdown(30);
      refreshIntervalRef.current = setInterval(() => {
        fetchMessages(acc);
        setCountdown(30);
      }, 30000);

      countdownIntervalRef.current = setInterval(() => {
        setCountdown((c) => (c > 0 ? c - 1 : 30));
      }, 1000);
    },
    [fetchMessages]
  );

  // Generate new email
  const generateEmail = async () => {
    setGenerating(true);
    setError(null);
    setMessages([]);
    setSelectedMessage(null);
    try {
      const acc = await createAccount();
      setAccount(acc);
      await fetchMessages(acc);
      startAutoRefresh(acc);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "ইমেইল তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setGenerating(false);
    }
  };

  // Manual refresh
  const manualRefresh = async () => {
    if (!account || refreshing) return;
    setRefreshing(true);
    await fetchMessages(account);
    setCountdown(30);
    setRefreshing(false);
  };

  // Copy email
  const copyEmail = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Delete account and generate new one
  const deleteAccount = async () => {
    if (!account) return;
    setLoading(true);
    try {
      await tempEmailRequest<void>("deleteAccount", { id: account.id, token: account.token });
    } catch {
      // Silent fail
    }
    setAccount(null);
    setMessages([]);
    setSelectedMessage(null);
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setLoading(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const unreadCount = messages.filter((m) => !m.seen).length;

  return (
    <>
      <Seo
        title="টেম্পোরারি ইমেইল | Temporary Email — মাহবুব সরদার সবুজ"
        description="বিনামূল্যে টেম্পোরারি ইমেইল তৈরি করুন। স্প্যাম থেকে আপনার আসল ইমেইল রক্ষা করুন। কোনো রেজিস্ট্রেশন দরকার নেই।"
        path="/temp-email"
      />
      <Navbar />
      <main
        style={{
          minHeight: "100vh",
          background: BG,
          paddingTop: "var(--site-nav-offset, 70px)",
          paddingBottom: 60,
        }}
      >
        {/* Hero Section */}
        <section
          style={{
            background: `linear-gradient(180deg, rgba(201,168,76,0.06) 0%, transparent 100%)`,
            borderBottom: `1px solid ${BORDER}`,
            padding: "48px 20px 40px",
            textAlign: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(201,168,76,0.1)",
                border: `1px solid rgba(201,168,76,0.3)`,
                borderRadius: 100,
                padding: "6px 16px",
                marginBottom: 20,
              }}
            >
              <Shield size={14} color={GOLD} />
              <span style={{ color: GOLD, fontSize: "0.8rem", fontFamily: "'AdorshoLipi', sans-serif" }}>
                সম্পূর্ণ বিনামূল্যে ও নিরাপদ
              </span>
            </div>
            <h1
              style={{
                color: TEXT,
                fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
                fontFamily: "'AdorshoLipi', sans-serif",
                fontWeight: 700,
                margin: "0 0 12px",
                lineHeight: 1.3,
              }}
            >
              টেম্পোরারি{" "}
              <span style={{ color: GOLD }}>ইমেইল</span>
            </h1>
            <p
              style={{
                color: MUTED,
                fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)",
                fontFamily: "'AdorshoLipi', sans-serif",
                maxWidth: 520,
                margin: "0 auto 32px",
                lineHeight: 1.7,
              }}
            >
              আপনার আসল ইমেইল গোপন রাখুন। যেকোনো ওয়েবসাইটে রেজিস্ট্রেশনের জন্য তাৎক্ষণিক ডিসপোজেবল ইমেইল তৈরি করুন।
            </p>

            {/* Feature badges */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { icon: Zap, label: "তাৎক্ষণিক" },
                { icon: Lock, label: "কোনো রেজিস্ট্রেশন নেই" },
                { icon: Shield, label: "স্প্যাম প্রতিরোধ" },
                { icon: RefreshCw, label: "অটো রিফ্রেশ" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    padding: "6px 12px",
                  }}
                >
                  <Icon size={13} color={GOLD} />
                  <span style={{ color: MUTED, fontSize: "0.8rem", fontFamily: "'AdorshoLipi', sans-serif" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Main Content */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 0" }}>
          {/* Error */}
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
                <span style={{ color: "#ef4444", fontSize: "0.9rem", fontFamily: "'AdorshoLipi', sans-serif" }}>
                  {error}
                </span>
                <button
                  onClick={() => setError(null)}
                  style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.1rem" }}
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Display Card */}
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
              /* Generate Button */
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(201,168,76,0.1)",
                    border: `2px solid rgba(201,168,76,0.3)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <Mail size={32} color={GOLD} />
                </div>
                <h2
                  style={{
                    color: TEXT,
                    fontSize: "1.3rem",
                    fontFamily: "'AdorshoLipi', sans-serif",
                    fontWeight: 600,
                    margin: "0 0 8px",
                  }}
                >
                  নতুন টেম্পোরারি ইমেইল তৈরি করুন
                </h2>
                <p style={{ color: MUTED, fontSize: "0.9rem", fontFamily: "'AdorshoLipi', sans-serif", margin: "0 0 20px" }}>
                  একটি বাটনে ক্লিক করলেই তৈরি হয়ে যাবে আপনার ডিসপোজেবল ইমেইল
                </p>

                {/* Predictable sequential username */}
                <div
                  style={{
                    margin: "0 auto 20px",
                    maxWidth: 420,
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "rgba(201,168,76,0.06)",
                    border: `1px solid rgba(201,168,76,0.2)`,
                    color: MUTED,
                    fontSize: "0.82rem",
                    fontFamily: "'AdorshoLipi', sans-serif",
                  }}
                >
                  নাম স্বয়ংক্রিয়ভাবে হবে: <strong style={{ color: GOLD, fontFamily: "monospace" }}>{DEFAULT_USERNAME}</strong>, তারপর <strong style={{ color: GOLD, fontFamily: "monospace" }}>{DEFAULT_USERNAME}01</strong>, <strong style={{ color: GOLD, fontFamily: "monospace" }}>{DEFAULT_USERNAME}02</strong>…
                </div>

                <button
                  onClick={generateEmail}
                  disabled={generating}
                  style={{
                    background: generating
                      ? "rgba(201,168,76,0.3)"
                      : `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                    color: generating ? MUTED : "#060E1A",
                    border: "none",
                    borderRadius: 14,
                    padding: "14px 36px",
                    fontSize: "1rem",
                    fontFamily: "'AdorshoLipi', sans-serif",
                    fontWeight: 700,
                    cursor: generating ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    transition: "all 0.2s",
                    boxShadow: generating ? "none" : `0 4px 20px rgba(201,168,76,0.3)`,
                  }}
                >
                  {generating ? (
                    <>
                      <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} />
                      তৈরি হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      ইমেইল তৈরি করুন
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Email Address Display */
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  <CheckCircle size={16} color="#22c55e" />
                  <span style={{ color: "#22c55e", fontSize: "0.85rem", fontFamily: "'AdorshoLipi', sans-serif" }}>
                    ইমেইল সক্রিয় আছে
                  </span>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={13} color={MUTED} />
                    <span style={{ color: MUTED, fontSize: "0.78rem", fontFamily: "'AdorshoLipi', sans-serif" }}>
                      {countdown}s পরে রিফ্রেশ
                    </span>
                  </div>
                </div>

                {/* Email Address Box */}
                <div
                  style={{
                    background: "rgba(201,168,76,0.06)",
                    border: `2px solid rgba(201,168,76,0.3)`,
                    borderRadius: 14,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <Mail size={20} color={GOLD} style={{ flexShrink: 0 }} />
                  <span
                    style={{
                      color: TEXT,
                      fontSize: "clamp(0.9rem, 3vw, 1.1rem)",
                      fontFamily: "monospace",
                      fontWeight: 600,
                      flex: 1,
                      wordBreak: "break-all",
                    }}
                  >
                    {account.address}
                  </span>
                  <button
                    onClick={copyEmail}
                    style={{
                      background: copied ? "rgba(34,197,94,0.15)" : "rgba(201,168,76,0.1)",
                      border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(201,168,76,0.3)"}`,
                      borderRadius: 10,
                      padding: "8px 16px",
                      color: copied ? "#22c55e" : GOLD,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.85rem",
                      fontFamily: "'AdorshoLipi', sans-serif",
                      transition: "all 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                    {copied ? "কপি হয়েছে!" : "কপি করুন"}
                  </button>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={manualRefresh}
                    disabled={refreshing}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${BORDER}`,
                      borderRadius: 10,
                      padding: "9px 18px",
                      color: TEXT,
                      cursor: refreshing ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: "0.85rem",
                      fontFamily: "'AdorshoLipi', sans-serif",
                      transition: "all 0.2s",
                    }}
                  >
                    <RefreshCw
                      size={15}
                      color={GOLD}
                      style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}
                    />
                    ইনবক্স রিফ্রেশ
                  </button>

                  <button
                    onClick={generateEmail}
                    disabled={generating}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${BORDER}`,
                      borderRadius: 10,
                      padding: "9px 18px",
                      color: TEXT,
                      cursor: generating ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: "0.85rem",
                      fontFamily: "'AdorshoLipi', sans-serif",
                      transition: "all 0.2s",
                    }}
                  >
                    <Zap size={15} color={GOLD} />
                    নতুন ইমেইল
                  </button>

                  <button
                    onClick={deleteAccount}
                    disabled={loading}
                    style={{
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: 10,
                      padding: "9px 18px",
                      color: "#ef4444",
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: "0.85rem",
                      fontFamily: "'AdorshoLipi', sans-serif",
                      transition: "all 0.2s",
                      marginLeft: "auto",
                    }}
                  >
                    <Trash2 size={15} />
                    মুছে ফেলুন
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Inbox */}
          <AnimatePresence>
            {account && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.15 }}
              >
                {/* Inbox Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <Inbox size={18} color={GOLD} />
                  <h2
                    style={{
                      color: TEXT,
                      fontSize: "1.1rem",
                      fontFamily: "'AdorshoLipi', sans-serif",
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    ইনবক্স
                  </h2>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        background: GOLD,
                        color: "#060E1A",
                        borderRadius: 100,
                        padding: "2px 10px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {unreadCount} নতুন
                    </span>
                  )}
                  <span style={{ color: MUTED, fontSize: "0.8rem", fontFamily: "'AdorshoLipi', sans-serif", marginLeft: "auto" }}>
                    {messages.length} টি মেইল
                  </span>
                </div>

                {/* Message List */}
                {messages.length === 0 ? (
                  <div
                    style={{
                      background: CARD_BG,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 16,
                      padding: "40px 20px",
                      textAlign: "center",
                    }}
                  >
                    <Mail size={40} color="rgba(201,168,76,0.3)" style={{ marginBottom: 12 }} />
                    <p style={{ color: MUTED, fontFamily: "'AdorshoLipi', sans-serif", margin: 0 }}>
                      এখনো কোনো ইমেইল আসেনি
                    </p>
                    <p style={{ color: "rgba(250,246,239,0.3)", fontSize: "0.82rem", fontFamily: "'AdorshoLipi', sans-serif", marginTop: 6 }}>
                      ইমেইল আসলে এখানে দেখাবে। প্রতি ৩০ সেকেন্ডে অটো রিফ্রেশ হয়।
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                          background: msg.seen ? CARD_BG : "rgba(201,168,76,0.05)",
                          border: `1px solid ${msg.seen ? BORDER : "rgba(201,168,76,0.25)"}`,
                          borderRadius: 14,
                          padding: "16px 18px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onClick={() => fetchMessageDetail(msg.id, account)}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = msg.seen ? BORDER : "rgba(201,168,76,0.25)";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: "rgba(201,168,76,0.12)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              fontSize: "0.9rem",
                              color: GOLD,
                              fontWeight: 700,
                            }}
                          >
                            {(msg.from.name || msg.from.address)[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span
                                style={{
                                  color: msg.seen ? MUTED : TEXT,
                                  fontSize: "0.85rem",
                                  fontWeight: msg.seen ? 400 : 600,
                                  fontFamily: "monospace",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: "200px",
                                }}
                              >
                                {msg.from.name || msg.from.address}
                              </span>
                              {!msg.seen && (
                                <span
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    background: GOLD,
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                              <span style={{ color: MUTED, fontSize: "0.75rem", marginLeft: "auto", flexShrink: 0 }}>
                                {timeAgo(msg.createdAt)}
                              </span>
                            </div>
                            <div
                              style={{
                                color: msg.seen ? MUTED : TEXT,
                                fontSize: "0.9rem",
                                fontWeight: msg.seen ? 400 : 600,
                                marginBottom: 4,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {msg.subject || "(কোনো বিষয় নেই)"}
                            </div>
                            <div
                              style={{
                                color: MUTED,
                                fontSize: "0.8rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {msg.intro}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchMessageDetail(msg.id, account);
                              }}
                              style={{
                                background: "rgba(201,168,76,0.1)",
                                border: `1px solid rgba(201,168,76,0.2)`,
                                borderRadius: 8,
                                padding: "6px 8px",
                                color: GOLD,
                                cursor: "pointer",
                              }}
                              title="দেখুন"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMessage(msg.id);
                              }}
                              style={{
                                background: "rgba(239,68,68,0.08)",
                                border: "1px solid rgba(239,68,68,0.2)",
                                borderRadius: 8,
                                padding: "6px 8px",
                                color: "#ef4444",
                                cursor: "pointer",
                              }}
                              title="মুছুন"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Detail Modal */}
          <AnimatePresence>
            {selectedMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(6,14,26,0.92)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 16,
                  backdropFilter: "blur(8px)",
                }}
                onClick={() => setSelectedMessage(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  style={{
                    background: "#0d1929",
                    border: `1px solid rgba(201,168,76,0.25)`,
                    borderRadius: 20,
                    padding: "28px 24px",
                    maxWidth: 680,
                    width: "100%",
                    maxHeight: "80vh",
                    overflowY: "auto",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          color: TEXT,
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          margin: "0 0 8px",
                        }}
                      >
                        {selectedMessage.subject || "(কোনো বিষয় নেই)"}
                      </h3>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <span style={{ color: MUTED, fontSize: "0.82rem" }}>
                          <strong style={{ color: GOLD_LIGHT }}>প্রেরক:</strong>{" "}
                          {selectedMessage.from.name
                            ? `${selectedMessage.from.name} <${selectedMessage.from.address}>`
                            : selectedMessage.from.address}
                        </span>
                        <span style={{ color: MUTED, fontSize: "0.82rem" }}>
                          <strong style={{ color: GOLD_LIGHT }}>সময়:</strong>{" "}
                          {new Date(selectedMessage.createdAt).toLocaleString("bn-BD")}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: `1px solid ${BORDER}`,
                        borderRadius: 10,
                        padding: "8px 14px",
                        color: TEXT,
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        flexShrink: 0,
                      }}
                    >
                      বন্ধ করুন ×
                    </button>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: BORDER, marginBottom: 20 }} />

                  {/* Message Body */}
                  <div
                    style={{
                      color: TEXT,
                      fontSize: "0.92rem",
                      lineHeight: 1.8,
                      fontFamily: "monospace",
                    }}
                  >
                    {selectedMessage.html && selectedMessage.html.length > 0 ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedMessage.html.join(""),
                        }}
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: 10,
                          padding: 16,
                          color: TEXT,
                        }}
                      />
                    ) : (
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: 10,
                          padding: 16,
                          margin: 0,
                          color: TEXT,
                          fontFamily: "monospace",
                          fontSize: "0.88rem",
                        }}
                      >
                        {selectedMessage.text || "(ইমেইলে কোনো টেক্সট নেই)"}
                      </pre>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading overlay for message fetch */}
          <AnimatePresence>
            {viewingMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(6,14,26,0.7)",
                  zIndex: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RefreshCw size={32} color={GOLD} style={{ animation: "spin 1s linear infinite" }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* How to use section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 20,
              padding: "28px 24px",
              marginTop: 32,
            }}
          >
            <h2
              style={{
                color: TEXT,
                fontSize: "1.15rem",
                fontFamily: "'AdorshoLipi', sans-serif",
                fontWeight: 700,
                margin: "0 0 20px",
              }}
            >
              কীভাবে ব্যবহার করবেন?
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
              }}
            >
              {[
                {
                  step: "১",
                  title: "ইমেইল তৈরি করুন",
                  desc: "'ইমেইল তৈরি করুন' বাটনে ক্লিক করুন। তাৎক্ষণিক একটি ইমেইল পাবেন।",
                },
                {
                  step: "২",
                  title: "ইমেইল কপি করুন",
                  desc: "ইমেইল ঠিকানাটি কপি করুন এবং যেকোনো ওয়েবসাইটে ব্যবহার করুন।",
                },
                {
                  step: "৩",
                  title: "ইনবক্স দেখুন",
                  desc: "ইমেইল আসলে ইনবক্সে দেখাবে। প্রতি ৩০ সেকেন্ডে অটো রিফ্রেশ হয়।",
                },
                {
                  step: "৪",
                  title: "মুছে ফেলুন",
                  desc: "কাজ শেষে ইমেইল মুছে ফেলুন। আপনার তথ্য সম্পূর্ণ নিরাপদ থাকবে।",
                },
              ].map(({ step, title, desc }) => (
                <div
                  key={step}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 14,
                    padding: "16px 18px",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(201,168,76,0.15)",
                      border: `1px solid rgba(201,168,76,0.3)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: GOLD,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      marginBottom: 10,
                    }}
                  >
                    {step}
                  </div>
                  <h3
                    style={{
                      color: TEXT,
                      fontSize: "0.95rem",
                      fontFamily: "'AdorshoLipi', sans-serif",
                      fontWeight: 600,
                      margin: "0 0 6px",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      color: MUTED,
                      fontSize: "0.83rem",
                      fontFamily: "'AdorshoLipi', sans-serif",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Spin animation */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </main>
      <Footer />
    </>
  );
}
