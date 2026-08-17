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
const TEMP_EMAIL_API = "/api/temp-email-proxy";
const TEMP_EMAIL_SESSION_KEY = "mss-temp-email-active-session-v1";
const TEMP_EMAIL_MESSAGES_KEY = "mss-temp-email-session-messages-v1";
const TEMP_EMAIL_REQUEST_TIMEOUT_MS = 16_000;
const TEMP_EMAIL_MAX_ATTEMPTS = 2;

interface ProxyError {
  error?: string;
  message?: string;
  "hydra:description"?: string;
}

async function tempEmailRequest<T>(
  action: string,
  payload: Record<string, string> = {}
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= TEMP_EMAIL_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), TEMP_EMAIL_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(TEMP_EMAIL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as ProxyError | null;
        const message =
          data?.["hydra:description"] ||
          data?.error ||
          data?.message ||
          "ইমেইল সেবাটি এখন ব্যবহার করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।";
        const error = Object.assign(new Error(message), { retryable: response.status >= 500 });
        if (!error.retryable || attempt === TEMP_EMAIL_MAX_ATTEMPTS) throw error;
        lastError = error;
      } else {
        if (response.status === 204) return undefined as T;
        return response.json() as Promise<T>;
      }
    } catch (error) {
      const typedError = error as Error & { retryable?: boolean };
      if (typedError.retryable === false || attempt === TEMP_EMAIL_MAX_ATTEMPTS) throw typedError;
      lastError = typedError;
    } finally {
      window.clearTimeout(timeoutId);
    }

    await new Promise((resolve) => window.setTimeout(resolve, 450 * attempt));
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("ইমেইল সেবাটি এখন ব্যবহার করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।");
}

interface EmailAccount {
  id: string;
  address: string;
  token: string;
  createdAt: string;
}

function isStoredAccount(value: unknown): value is EmailAccount {
  if (!value || typeof value !== "object") return false;
  const account = value as Partial<EmailAccount>;
  return Boolean(
    typeof account.id === "string" &&
    typeof account.token === "string" &&
    typeof account.address === "string" &&
    account.address.includes("@") &&
    typeof account.createdAt === "string"
  );
}

function readStoredAccount(): EmailAccount | null {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(TEMP_EMAIL_SESSION_KEY) || "null");
    return isStoredAccount(value) ? value : null;
  } catch {
    return null;
  }
}

function storeAccount(account: EmailAccount) {
  try {
    window.sessionStorage.setItem(TEMP_EMAIL_SESSION_KEY, JSON.stringify(account));
  } catch {
    // Session storage can be unavailable in strict private browsing; the in-memory session still works.
  }
}

function clearStoredAccount() {
  try {
    window.sessionStorage.removeItem(TEMP_EMAIL_SESSION_KEY);
    window.sessionStorage.removeItem(TEMP_EMAIL_MESSAGES_KEY);
  } catch {
    // Nothing else is required when browser storage is unavailable.
  }
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

function isProviderWelcomeMessage(message: Message): boolean {
  return (
    message.from.address.toLowerCase() === "no-reply@guerrillamail.com" &&
    message.subject.trim().toLowerCase() === "welcome to guerrilla mail"
  );
}

function isStoredMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<Message>;
  return Boolean(
    typeof message.id === "string" &&
    typeof message.subject === "string" &&
    typeof message.intro === "string" &&
    typeof message.seen === "boolean" &&
    typeof message.createdAt === "string" &&
    typeof message.hasAttachments === "boolean" &&
    message.from &&
    typeof message.from.name === "string" &&
    typeof message.from.address === "string"
  );
}

function readStoredMessages(): Message[] {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(TEMP_EMAIL_MESSAGES_KEY) || "[]");
    return Array.isArray(value)
      ? value.filter(isStoredMessage).filter((message) => !isProviderWelcomeMessage(message)).slice(0, 50)
      : [];
  } catch {
    return [];
  }
}

function storeMessages(messages: Message[]) {
  try {
    window.sessionStorage.setItem(TEMP_EMAIL_MESSAGES_KEY, JSON.stringify(messages.slice(0, 50)));
  } catch {
    // The visible in-memory inbox remains available when browser storage is unavailable.
  }
}

function mergeMessages(previous: Message[], incoming: Message[]): Message[] {
  const byId = new Map(
    previous
      .filter((message) => !isProviderWelcomeMessage(message))
      .map((message) => [message.id, message])
  );
  for (const message of incoming) {
    if (isProviderWelcomeMessage(message)) continue;
    const existing = byId.get(message.id);
    byId.set(message.id, existing ? { ...existing, ...message, seen: existing.seen || message.seen } : message);
  }
  return [...byId.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildMessageDocument(message: MessageDetail): string {
  const html = message.html.join("").trim();
  const body = html || `<pre>${escapeHtml(message.text || "(ইমেইলে কোনো টেক্সট নেই)")}</pre>`;

  return `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      html, body { max-width: 100%; margin: 0; background: #ffffff; color: #172033; }
      body { padding: 18px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 16px; line-height: 1.65; overflow-wrap: anywhere; word-break: break-word; }
      img, video, svg, table, blockquote, pre { max-width: 100% !important; }
      img, video { height: auto !important; }
      table { width: auto !important; border-collapse: collapse; }
      td, th { max-width: 100%; overflow-wrap: anywhere; word-break: break-word; }
      pre { white-space: pre-wrap; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      a { color: #075bc9; overflow-wrap: anywhere; }
      @media (max-width: 520px) {
        body { padding: 14px; font-size: 15px; }
        table { width: 100% !important; }
      }
    </style>
  </head>
  <body>${body}</body>
</html>`;
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
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch available domains
  const getDomains = async (): Promise<string[]> => {
    const data = await tempEmailRequest<{ "hydra:member"?: Array<{ isActive: boolean; domain: string }> }>("domains");
    const members = data["hydra:member"] || [];
    return members.filter((d) => d.isActive).map((d) => d.domain);
  };

  // A long random local-part prevents users from accidentally sharing a mailbox.
  const createAccount = async (): Promise<EmailAccount> => {
    const domains = await getDomains();
    if (!domains.length) throw new Error("কোনো ডোমেইন পাওয়া যায়নি");

    const requestedAddress = `mahbubsardarsabuj${Date.now()}${Math.floor(100 + Math.random() * 900)}@${domains[0]}`;
    const accountData = await tempEmailRequest<Record<string, string>>("createAccount", {
      address: requestedAddress,
      password: randomString(16),
    });

    if (!accountData.id || !accountData.token) throw new Error("ইমেইল সেশন তৈরি করতে সমস্যা হয়েছে");

    return {
      id: accountData.id,
      address: accountData.address || requestedAddress,
      token: accountData.token,
      createdAt: accountData.createdAt || new Date().toISOString(),
    };
  };

  // Fetch messages
  const fetchMessages = useCallback(async (acc: EmailAccount, preserved: Message[] = []) => {
    try {
      const data = await tempEmailRequest<{ "hydra:member"?: Message[] }>("messages", { token: acc.token });
      const incoming = data["hydra:member"] || [];
      setMessages((previous) => {
        // On hydration, React may batch the stored-state update with this fetch.
        // Merge the explicit snapshot as well so an empty provider delta cannot erase history.
        const next = mergeMessages(mergeMessages(previous, preserved), incoming);
        storeMessages(next);
        return next;
      });
    } catch {
      setError("ইনবক্স আপডেট করা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।");
    }
  }, []);

  // Fetch single message detail
  const fetchMessageDetail = async (msgId: string, acc: EmailAccount) => {
    setViewingMessage(true);
    try {
      const data = await tempEmailRequest<MessageDetail>("message", { id: msgId, token: acc.token });
      setSelectedMessage(data);
      // Mark as read
      setMessages((previous) => {
        const next = previous.map((message) => (message.id === msgId ? { ...message, seen: true } : message));
        storeMessages(next);
        return next;
      });
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
      setMessages((previous) => {
        const next = previous.filter((message) => message.id !== msgId);
        storeMessages(next);
        return next;
      });
      if (selectedMessage?.id === msgId) setSelectedMessage(null);
    } catch {
      setError("ইমেইল মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
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

  // Restore the current tab's mailbox after a refresh without retaining it after the tab closes.
  useEffect(() => {
    const stored = readStoredAccount();
    if (!stored) return;
    const cachedMessages = readStoredMessages();
    setAccount(stored);
    setMessages(cachedMessages);
    void fetchMessages(stored, cachedMessages);
    startAutoRefresh(stored);
  }, [fetchMessages, startAutoRefresh]);

  // Generate new email
  const generateEmail = async () => {
    setGenerating(true);
    setError(null);
    setSelectedMessage(null);
    try {
      const acc = await createAccount();
      clearStoredAccount();
      storeAccount(acc);
      setAccount(acc);
      setMessages([]);
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
      setError(null);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setError("ইমেইল কপি করা যায়নি। ব্রাউজার clipboard অনুমতি পরীক্ষা করুন।");
    });
  };

  // Delete account and generate new one
  const deleteAccount = async () => {
    if (!account) return;
    setLoading(true);
    try {
      await tempEmailRequest<void>("deleteAccount", { id: account.id, token: account.token });
    } catch {
      setError("অ্যাকাউন্ট সার্ভার থেকে মুছতে সমস্যা হয়েছে; স্থানীয় session সরানো হয়েছে।");
    }
    clearStoredAccount();
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
        robots="noindex, nofollow, noarchive"
      />
      <Navbar />
      <main
        style={{
          minHeight: "100vh",
          background: "radial-gradient(900px 520px at 50% -8%, rgba(201,168,76,0.13), transparent 63%), radial-gradient(760px 520px at 6% 46%, rgba(27,72,132,0.18), transparent 70%), #060E1A",
          paddingTop: "var(--site-nav-offset, 70px)",
          paddingBottom: 72,
          overflow: "hidden",
        }}
      >
        {/* Hero Section */}
        <section
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(201,168,76,0.035) 46%, transparent 100%)",
            borderBottom: `1px solid ${BORDER}`,
            boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.025)",
            padding: "clamp(40px, 8vw, 72px) 20px clamp(34px, 6vw, 56px)",
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
          <div style={{ maxWidth: 980, margin: "0 auto", padding: "clamp(24px, 5vw, 48px) 16px 0" }}>
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
                  onClick={() => {
                    setError(null);
                    if (!account) void generateEmail();
                    else void manualRefresh();
                  }}
                  style={{ marginLeft: "auto", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 9, color: "#fecaca", cursor: "pointer", padding: "6px 10px", fontFamily: "'AdorshoLipi', sans-serif", whiteSpace: "nowrap" }}
                >
                  আবার চেষ্টা করুন
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
              background: "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025))",
              border: "1px solid rgba(255,255,255,0.11)",
              borderRadius: 24,
              padding: "clamp(20px, 4vw, 32px)",
              marginBottom: 28,
              boxShadow: "0 22px 56px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.045)",
              backdropFilter: "blur(18px)",
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
                <p style={{ color: MUTED, fontSize: "0.9rem", fontFamily: "'AdorshoLipi', sans-serif", margin: "0 0 10px" }}>
                  একটি বাটনে ক্লিক করলেই তৈরি হয়ে যাবে আপনার ব্যক্তিগত ডিসপোজেবল ইনবক্স
                </p>
                <p style={{ color: "rgba(232,201,122,0.76)", fontSize: "0.78rem", fontFamily: "'AdorshoLipi', sans-serif", margin: "0 0 22px" }}>
                  ইউনিক ঠিকানা · ৩০ সেকেন্ডে স্বয়ংক্রিয় inbox refresh
                </p>

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
                    background: "linear-gradient(135deg, rgba(201,168,76,0.16), rgba(15,35,64,0.52))",
                    border: "1px solid rgba(232,201,122,0.43)",
                    borderRadius: 16,
                    padding: "clamp(14px, 3vw, 20px)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.12)",
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
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 2 }}>
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
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="temp-email-message-title"
                  style={{
                    background: "#0d1929",
                    border: `1px solid rgba(201,168,76,0.25)`,
                    borderRadius: 20,
                    maxWidth: 680,
                    width: "100%",
                    maxHeight: "min(92dvh, 780px)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.46)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "20px 20px 16px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        id="temp-email-message-title"
                        style={{
                          color: TEXT,
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          margin: "0 0 8px",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {selectedMessage.subject || "(কোনো বিষয় নেই)"}
                      </h3>
                      <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                        <span style={{ color: MUTED, fontSize: "0.82rem", overflowWrap: "anywhere" }}>
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
                      aria-label="ইমেইল বন্ধ করুন"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: `1px solid ${BORDER}`,
                        borderRadius: 10,
                        padding: "8px 12px",
                        color: TEXT,
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        flexShrink: 0,
                      }}
                    >
                      বন্ধ করুন ×
                    </button>
                  </div>

                  {/* Sandboxed message body: scrolls inside its own light, readable document. */}
                  <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", minHeight: 0 }}>
                    <iframe
                      title={`${selectedMessage.subject || "ইমেইল"} — পূর্ণ বার্তা`}
                      srcDoc={buildMessageDocument(selectedMessage)}
                      sandbox=""
                      referrerPolicy="no-referrer"
                      style={{
                        display: "block",
                        width: "100%",
                        height: "min(56dvh, 560px)",
                        minHeight: 320,
                        border: "1px solid rgba(15, 25, 41, 0.18)",
                        borderRadius: 12,
                        background: "#ffffff",
                      }}
                    />
                    <p style={{ color: MUTED, fontSize: "0.76rem", lineHeight: 1.5, margin: "10px 2px 0", fontFamily: "'AdorshoLipi', sans-serif" }}>
                      সম্পূর্ণ বার্তা দেখতে ভেতরের অংশে স্ক্রল করুন। প্রয়োজনীয় সাধারণ লেখা নির্বাচন করে কপি করা যাবে।
                    </p>
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
