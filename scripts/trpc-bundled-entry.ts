import type { IncomingMessage, ServerResponse } from "node:http";
import crypto from "node:crypto";
import mysql from "mysql2/promise";
import { jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "../server/routers";
import { sdk } from "../server/_core/sdk";
import { handleTelegramWebhook } from "../server/telegramService";
import { getDb } from "../server/db";
import { users } from "../drizzle/schema";

const COOKIE_NAME = "app_session_id";

type HeaderValue = string | string[] | undefined;
type CompatibleRequest = IncomingMessage & {
  query?: Record<string, unknown>;
  protocol?: string;
  hostname?: string;
  body?: unknown;
};
type CompatibleResponse = ServerResponse & {
  clearCookie?: (name?: string, options?: Record<string, unknown>) => CompatibleResponse;
  status?: (code: number) => CompatibleResponse;
  json?: (data: unknown) => void;
};

function firstHeaderValue(value: HeaderValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getCookieValue(req: IncomingMessage, name: string) {
  const match = (req.headers.cookie || "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

async function authenticateLocalSession(req: IncomingMessage) {
  const token = getCookieValue(req, COOKIE_NAME);
  const secret = process.env.COOKIE_SECRET || process.env.JWT_SECRET;
  if (!token || !secret) return null;
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(secret));
    const openId = typeof verified.payload.openId === "string" ? verified.payload.openId : null;
    if (!openId) return null;
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    const user = rows[0];
    if (!user) return null;
    const configuredOwnerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
    const userEmail = user.email?.trim().toLowerCase();
    // Only the holder of a valid signed local session whose email exactly matches the
    // production owner configuration can receive the dashboard administrator role.
    if (configuredOwnerEmail && userEmail === configuredOwnerEmail && user.role !== "admin") {
      await db.update(users).set({ role: "admin" }).where(eq(users.id, user.id));
      return { ...user, role: "admin" };
    }
    return user;
  } catch {
    return null;
  }
}

function getRequestProtocol(req: IncomingMessage): string {
  const forwardedProto = firstHeaderValue(req.headers["x-forwarded-proto"] as HeaderValue);
  if (forwardedProto?.split(",").some((proto) => proto.trim().toLowerCase() === "https")) {
    return "https";
  }
  return "http";
}

function serializeExpiredCookie(name: string, options: Record<string, unknown> = {}): string {
  const parts = [
    `${name}=`,
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    `Path=${typeof options.path === "string" ? options.path : "/"}`,
  ];
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${String(options.sameSite)}`);
  if (typeof options.domain === "string" && options.domain) parts.push(`Domain=${options.domain}`);
  return parts.join("; ");
}

function addExpressCompatibility(req: IncomingMessage, res: ServerResponse) {
  const compatibleReq = Object.assign(req, {
    protocol: getRequestProtocol(req),
    hostname:
      firstHeaderValue(req.headers["x-forwarded-host"] as HeaderValue) ||
      firstHeaderValue(req.headers.host as HeaderValue) ||
      "",
  }) as CompatibleRequest;

  const compatibleRes = Object.assign(res, {
    clearCookie(name?: string, options: Record<string, unknown> = {}) {
      const cookieName = name || COOKIE_NAME;
      const nextCookie = serializeExpiredCookie(cookieName, options);
      const previous = res.getHeader("Set-Cookie");
      if (!previous) {
        res.setHeader("Set-Cookie", nextCookie);
      } else if (Array.isArray(previous)) {
        res.setHeader("Set-Cookie", [...previous, nextCookie]);
      } else {
        res.setHeader("Set-Cookie", [String(previous), nextCookie]);
      }
      return compatibleRes;
    },
    status(code: number) {
      res.statusCode = code;
      return compatibleRes;
    },
    json(data: unknown) {
      if (!res.headersSent) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify(data));
      }
    },
  }) as CompatibleResponse;

  return { compatibleReq, compatibleRes };
}

function createPublicVercelContext({ req, res }: { req: IncomingMessage; res: ServerResponse }) {
  const { compatibleReq, compatibleRes } = addExpressCompatibility(req, res);
  return { req: compatibleReq, res: compatibleRes, user: null };
}

async function createVercelContext({ req, res }: { req: IncomingMessage; res: ServerResponse }) {
  const { compatibleReq, compatibleRes } = addExpressCompatibility(req, res);
  let user = null;
  try {
    user = await sdk.authenticateRequest(compatibleReq);
  } catch {
    user = null;
  }
  // The literary community already uses a signed local email-password session.
  // Fall back to it only when the optional external runtime auth is unavailable.
  if (!user) user = await authenticateLocalSession(compatibleReq);
  return {
    req: compatibleReq,
    res: compatibleRes,
    user,
  };
}

function getTrpcPath(req: CompatibleRequest): string {
  const trpcPath = req.query?.trpc;
  if (Array.isArray(trpcPath)) return trpcPath.join("/");
  if (typeof trpcPath === "string") return trpcPath;

  const url = req.url ? new URL(req.url, "https://local.invalid") : null;
  const queryPath = url?.searchParams.get("trpc");
  if (queryPath) return queryPath;

  const pathname = url?.pathname ?? "";
  const routePrefix = "/api/trpc/";
  if (pathname.startsWith(routePrefix)) return decodeURIComponent(pathname.slice(routePrefix.length));
  return "";
}

// These reads are safe to serve without identity resolution only for visitors who have no
// application session. Signed-in readers still receive personalised bookmarks, reactions,
// feedback and ownership controls through the normal authenticated context.
const ANONYMOUS_CACHEABLE_TRPC_PROCEDURES = new Set([
  "writingPlatform.listPosts",
  "writingPlatform.listPostsPaginated",
  "writingPlatform.searchPosts",
  "writingPlatform.getPostMedia",
  "writingPlatform.listRecentComments",
  "writingPlatform.listActiveChallenges",
  "writingPlatform.listEditorialPicks",
]);

function hasAppSession(req: IncomingMessage) {
  return /(?:^|;\\s*)app_session_id=/.test(req.headers.cookie || "");
}

function isAnonymousCacheableRead(path: string, req: IncomingMessage) {
  if (req.method !== "GET" || hasAppSession(req)) return false;
  const procedures = path.split(",").filter(Boolean);
  return procedures.length > 0 && procedures.every((procedure) => ANONYMOUS_CACHEABLE_TRPC_PROCEDURES.has(procedure));
}

function sendFunctionError(res: ServerResponse, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("[tRPC function failure]", error);
  if (!res.headersSent) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("x-app-function-error", message.slice(0, 180));
  }
  res.end(
    JSON.stringify({
      error: "API function failed to initialize.",
      message: message.slice(0, 300),
    }),
  );
}

// ── Inline security helpers (replaces _utils/security.js dependency) ──────────
function getClientIpInline(req: IncomingMessage): string {
  function parseIp(v: unknown): string {
    if (!v || typeof v !== "string") return "";
    return v.split(",")[0]?.trim() || "";
  }
  return (
    parseIp(req.headers["x-forwarded-for"]) ||
    parseIp(req.headers["x-real-ip"]) ||
    parseIp(req.headers["cf-connecting-ip"]) ||
    (req.socket as { remoteAddress?: string })?.remoteAddress ||
    "unknown"
  );
}

function normalizeTextInline(value: unknown, maxLength = 2000): string {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s{3,}/g, "  ")
    .trim()
    .slice(0, maxLength);
}

function isDisposableEmail(email: string): boolean {
  const normalized = String(email || "").toLowerCase();
  const blocked = ["10minutemail.com", "guerrillamail.com", "mailinator.com", "tempmail.com", "yopmail.com"];
  return blocked.some((d) => normalized.endsWith(`@${d}`));
}

function isProbablySpam(value: string): boolean {
  const text = String(value || "").toLowerCase();
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  const repeatedChars = /(.)\1{12,}/.test(text);
  const spamWords = ["casino", "loan", "crypto", "viagra", "porn", "betting"];
  return urlCount > 3 || repeatedChars || spamWords.some((w) => text.includes(w));
}

// Simple in-memory rate limiter
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function checkRateLimitInline(
  req: IncomingMessage,
  res: CompatibleResponse,
  opts: { keyPrefix: string; windowMs: number; max: number },
): { limited: boolean; clientIp: string } {
  const clientIp = getClientIpInline(req);
  const key = `${opts.keyPrefix}:${clientIp}`;
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { limited: false, clientIp };
  }
  current.count += 1;
  if (current.count > opts.max) {
    res.statusCode = 429;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ success: false, error: "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" }));
    return { limited: true, clientIp };
  }
  return { limited: false, clientIp };
}

function parseJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
    req.on("error", () => resolve({}));
  });
}

export const config = { api: { bodyParser: false } };

// ── /api/facebook-webhook handler ────────────────────────────────────────────
let facebookWebhookPool: ReturnType<typeof mysql.createPool> | null = null;

function facebookWebhookConfigured() {
  return Boolean(process.env.FACEBOOK_APP_SECRET?.trim() && process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN?.trim() && process.env.DATABASE_URL);
}

function getFacebookWebhookPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!facebookWebhookPool) facebookWebhookPool = mysql.createPool({ uri: process.env.DATABASE_URL, waitForConnections: true, connectionLimit: 3, queueLimit: 0 });
  return facebookWebhookPool;
}

async function readRawWebhookBody(req: IncomingMessage, maxBytes = 1024 * 1024) {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > maxBytes) throw new Error("Payload too large");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

function safeSignatureEqual(left: string, right: string) {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function verifyFacebookSignature(rawBody: Buffer, header: string | string[] | undefined) {
  const signature = Array.isArray(header) ? header[0] : header;
  if (!signature?.startsWith("sha256=")) return false;
  const expected = `sha256=${crypto.createHmac("sha256", process.env.FACEBOOK_APP_SECRET || "").update(rawBody).digest("hex")}`;
  return safeSignatureEqual(signature, expected);
}

function facebookWebhookEvents(payload: any) {
  const events: Array<{ providerEventId: string; pageId: string | null; eventType: string; payload: string }> = [];
  for (const entry of Array.isArray(payload?.entry) ? payload.entry : []) {
    const pageId = entry?.id ? String(entry.id).slice(0, 64) : null;
    const entryTime = String(entry?.time || Date.now());
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    changes.forEach((change: any, index: number) => {
      const value = change?.value || {};
      const eventId = value.comment_id || value.post_id || `${pageId || "page"}:${entryTime}:feed:${index}`;
      events.push({ providerEventId: `feed:${String(eventId).slice(0, 170)}`, pageId, eventType: String(change?.field || "feed").slice(0, 100), payload: JSON.stringify({ object: payload?.object || "page", entry: { id: pageId, time: entry?.time }, change }) });
    });
    const messaging = Array.isArray(entry?.messaging) ? entry.messaging : [];
    messaging.forEach((event: any, index: number) => {
      const eventId = event?.message?.mid || event?.postback?.mid || `${pageId || "page"}:${event?.timestamp || entryTime}:message:${index}`;
      events.push({ providerEventId: `message:${String(eventId).slice(0, 166)}`, pageId, eventType: event?.message ? "messages" : event?.postback ? "postback" : "messaging", payload: JSON.stringify({ object: payload?.object || "page", entry: { id: pageId, time: entry?.time }, messaging: event }) });
    });
  }
  return events;
}

async function handleFacebookWebhook(req: IncomingMessage, res: CompatibleResponse, url: URL) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  if (req.method === "GET") {
    if (!facebookWebhookConfigured()) { res.statusCode = 503; res.end("Facebook webhook is not configured"); return; }
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token") || "";
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && challenge && safeSignatureEqual(token, process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || "")) { res.statusCode = 200; res.end(challenge); return; }
    res.statusCode = 403; res.end("Forbidden"); return;
  }
  if (req.method !== "POST") { res.statusCode = 405; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify({ error: "Method not allowed" })); return; }
  if (!facebookWebhookConfigured()) { res.statusCode = 503; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify({ error: "Facebook webhook is not configured" })); return; }
  try {
    const rawBody = await readRawWebhookBody(req);
    if (!verifyFacebookSignature(rawBody, req.headers["x-hub-signature-256"])) { res.statusCode = 401; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify({ error: "Invalid signature" })); return; }
    const payload = JSON.parse(rawBody.toString("utf8"));
    if (payload?.object !== "page") { res.statusCode = 404; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify({ error: "Unsupported webhook object" })); return; }
    const database = getFacebookWebhookPool();
    if (!database) throw new Error("Database unavailable");
    for (const event of facebookWebhookEvents(payload)) {
      await database.execute("INSERT IGNORE INTO facebook_webhook_events (providerEventId, pageId, eventType, payload, processStatus) VALUES (?, ?, ?, ?, 'pending')", [event.providerEventId, event.pageId, event.eventType, event.payload]);
    }
    // The webhook only stores authenticated events. No reply is generated or sent from this request.
    res.statusCode = 200; res.end("EVENT_RECEIVED");
  } catch (error) {
    console.error("[FACEBOOK WEBHOOK ERROR]", error instanceof Error ? error.message : String(error));
    if (!res.headersSent) { res.statusCode = 500; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify({ error: "Webhook intake failed" })); }
  }
}

// ── /api/contact handler ───────────────────────────────────────────────────────
async function handleContact(req: IncomingMessage, res: CompatibleResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "https://www.mahbubsardarsabuj.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.statusCode = 200; res.end(); return; }
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ success: false, error: "Method Not Allowed" }));
    return;
  }

  const rate = checkRateLimitInline(req, res, { keyPrefix: "contact", windowMs: 15 * 60 * 1000, max: 5 });
  if (rate.limited) return;

  const body = (req as CompatibleRequest).body ?? (await parseJsonBody(req)) as Record<string, unknown>;
  const b = body as Record<string, unknown>;

  // Honeypot check
  const honeypotFields = ["website", "company", "url", "homepage"];
  if (honeypotFields.some((f) => typeof b[f] === "string" && (b[f] as string).trim().length > 0)) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ success: true, message: "বার্তা সফলভাবে পাঠানো হয়েছে। শীঘ্রই উত্তর দেওয়া হবে।" }));
    return;
  }

  const { name, email, subject, message } = b as { name?: string; email?: string; subject?: string; message?: string };
  if (!name || !email || !message) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ success: false, error: "নাম, ইমেইল এবং বার্তা আবশ্যক।" }));
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || isDisposableEmail(email)) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ success: false, error: "সঠিক ইমেইল ঠিকানা দিন।" }));
    return;
  }

  const safeName = normalizeTextInline(name, 120);
  const safeEmail = normalizeTextInline(email, 254);
  const safeSubject = normalizeTextInline(subject || "ওয়েবসাইট থেকে বার্তা", 180);
  const safeMessage = normalizeTextInline(message, 3000);

  if (safeName.length < 2 || safeMessage.length < 10) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ success: false, error: "নাম এবং বার্তা আরও বিস্তারিতভাবে লিখুন।" }));
    return;
  }

  if (isProbablySpam(`${safeSubject}\n${safeMessage}`)) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ success: false, error: "বার্তাটি গ্রহণ করা যায়নি। অনুগ্রহ করে স্বাভাবিক বার্তা লিখুন।" }));
    return;
  }

  const TO = process.env.CONTACT_EMAIL_TO || "lekhokmahbubsardarsabuj@gmail.com";
  const FROM = process.env.CONTACT_EMAIL_FROM;
  const PASS = process.env.GMAIL_APP_PASSWORD;
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (TELEGRAM_BOT_TOKEN && TELEGRAM_ADMIN_CHAT_ID) {
    try {
      const telegramText = `📩 <b>নতুন বার্তা — mahbubsardarsabuj.com</b>\n\n👤 <b>নাম:</b> ${safeName}\n📧 <b>ইমেইল:</b> ${safeEmail}\n📌 <b>বিষয়:</b> ${safeSubject}\n\n💬 <b>বার্তা:</b>\n${safeMessage.slice(0, 3000)}`;
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_ADMIN_CHAT_ID, text: telegramText, parse_mode: "HTML" }),
      });
    } catch (e) {
      console.warn("[CONTACT] Telegram failed:", (e as Error).message);
    }
  }

  if (FROM && PASS) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({ service: "gmail", auth: { user: FROM, pass: PASS } });
      await transporter.sendMail({
        from: `"${safeName}" <${FROM}>`,
        to: TO,
        replyTo: safeEmail,
        subject: `[mahbubsardarsabuj.com] ${safeSubject}`,
        text: `নাম: ${safeName}\nইমেইল: ${safeEmail}\nবিষয়: ${safeSubject}\n\n${safeMessage}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;border-radius:10px"><h2 style="color:#C9A84C;border-bottom:2px solid #C9A84C;padding-bottom:10px">নতুন বার্তা — mahbubsardarsabuj.com</h2><p><b>নাম:</b> ${safeName}</p><p><b>ইমেইল:</b> <a href="mailto:${safeEmail}">${safeEmail}</a></p><p><b>বিষয়:</b> ${safeSubject}</p><div style="margin-top:20px;padding:15px;background:#fff;border-left:4px solid #C9A84C;border-radius:5px"><p style="white-space:pre-wrap">${safeMessage}</p></div></div>`,
      });
    } catch (emailErr) {
      console.error("[CONTACT] Email failed:", (emailErr as Error).message);
      if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) throw emailErr;
    }
  }

  console.log(`[CONTACT] From: ${safeName} <${safeEmail}> | IP: ${rate.clientIp}`);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ success: true, message: "বার্তা সফলভাবে পাঠানো হয়েছে। শীঘ্রই উত্তর দেওয়া হবে।" }));
}

// ── /api/chatbot-notify handler ───────────────────────────────────────────────
function escapeTg(value = ""): string {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function truncateTg(value = "", maxLength = 3200): string {
  const text = String(value || "").trim();
  return text.length <= maxLength ? text : text.slice(0, maxLength - 20) + "\n…[truncated]";
}

async function handleChatbotNotify(req: IncomingMessage, res: CompatibleResponse): Promise<void> {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const rate = checkRateLimitInline(req, res, { keyPrefix: "chatbot-notify", windowMs: 60 * 1000, max: 20 });
  if (rate.limited) return;

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
  if (!botToken || !adminChatId) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, skipped: true, reason: "missing_env" }));
    return;
  }

  const payload = ((req as CompatibleRequest).body ?? (await parseJsonBody(req))) as Record<string, unknown>;
  const title = (payload.title as string) || "AI Chatbot Activity";
  const lines = [
    `🤖 <b>${escapeTg(title)}</b>`,
    "",
    `<b>Type:</b> ${escapeTg((payload.type as string) || "chatbot_activity")}`,
  ];
  if (payload.userMessage) lines.push("", `<b>Visitor:</b> ${escapeTg(truncateTg(payload.userMessage as string, 1200))}`);
  if (payload.aiResponse) lines.push("", `<b>AI Reply:</b> ${escapeTg(truncateTg(payload.aiResponse as string, 1500))}`);
  lines.push(
    "",
    `<b>IP:</b> ${escapeTg(getClientIpInline(req))}`,
    `<b>Time:</b> ${escapeTg(new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" }))}`,
  );
  const text = lines.join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: adminChatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    const result = await response.json().catch(() => ({})) as { ok?: boolean; description?: string };
    if (!response.ok || result.ok === false) throw new Error(result.description || `Telegram failed: ${response.status}`);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: true }));
  } catch (error) {
    console.error("Chatbot notify failed:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: (error as Error)?.message || String(error) }));
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = req.url ? new URL(req.url, "https://local.invalid") : null;
  const pathname = url?.pathname ?? "";

  const { compatibleRes } = addExpressCompatibility(req, res);

  const isFacebookWebhook = pathname === "/api/facebook-webhook" || url?.searchParams.get("_facebook_webhook") === "1";
  if (isFacebookWebhook) {
    await handleFacebookWebhook(req, compatibleRes, url || new URL("https://local.invalid/api/facebook-webhook"));
    return;
  }

  // Route: /api/contact
  if (pathname === "/api/contact" || pathname.startsWith("/api/contact?")) {
    try {
      await handleContact(req, compatibleRes);
    } catch (err) {
      console.error("[CONTACT ERROR]", err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ success: false, error: "বার্তা পাঠাতে সমস্যা হয়েছে।" }));
      }
    }
    return;
  }

  // Route: /api/chatbot-notify
  if (pathname === "/api/chatbot-notify" || pathname.startsWith("/api/chatbot-notify?")) {
    try {
      await handleChatbotNotify(req, compatibleRes);
    } catch (err) {
      console.error("[CHATBOT-NOTIFY ERROR]", err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ ok: false, error: "Internal error" }));
      }
    }
    return;
  }

  // Route: /api/telegram/webhook — receives admin replies from Telegram Bot
  const isTelegramWebhook =
    pathname === "/api/telegram/webhook" ||
    url?.searchParams.get("_telegram_webhook") === "1";
  if (isTelegramWebhook) {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }
    try {
      // Parse body if not already parsed
      let body: unknown;
      if ((req as CompatibleRequest).body !== undefined) {
        body = (req as CompatibleRequest).body;
      } else {
        body = await parseJsonBody(req);
      }
      await handleTelegramWebhook(body as Parameters<typeof handleTelegramWebhook>[0]);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      console.error("[TELEGRAM WEBHOOK ERROR]", err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ ok: false }));
      }
    }
    return;
  }

  // Default: tRPC handler
  try {
    const trpcPath = getTrpcPath(req as CompatibleRequest);
    const canUseAnonymousFeedCache = isAnonymousCacheableRead(trpcPath, req);
    await nodeHTTPRequestHandler({
      router: appRouter,
      path: trpcPath,
      req,
      res,
      createContext: canUseAnonymousFeedCache ? createPublicVercelContext : createVercelContext,
      responseMeta: () => canUseAnonymousFeedCache
        ? {
            // Feed data changes through moderated writes, not on every read. A short CDN TTL gives
            // anonymous visitors a fast first paint while preserving timely updates.
            headers: {
              "cache-control": "public, max-age=0, s-maxage=30, stale-while-revalidate=120",
              "cdn-cache-control": "max-age=30, stale-while-revalidate=120",
              "vary": "Cookie, trpc-accept, accept",
            },
          }
        : {},
    });
  } catch (error) {
    sendFunctionError(res, error);
  }
}
