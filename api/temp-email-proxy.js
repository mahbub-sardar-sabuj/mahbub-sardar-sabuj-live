// api/temp-email-proxy.js — same-origin adapter for Catchmail's public API.
// The adapter keeps the mailbox address behind a short-lived session token and
// exposes only the mailbox actions used by the website.
import { checkRateLimit, limitJsonBodySize } from "./_utils/security.js";

const CATCHMAIL_API = "https://api.catchmail.io/api/v1";
const TEMP_EMAIL_DOMAIN = "zeppost.com";
const REQUEST_TIMEOUT_MS = 12_000;
const USER_AGENT = "MahbubSardarSabujTempEmail/6.0";
const MAILBOX_NAME_PREFIX = "MahbubSardarSabuj";
const MAILBOX_NAME_PATTERN = /^MahbubSardarSabuj\d{4}$/;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (limitJsonBodySize(req, res, 32 * 1024)) return;

  const body = getBody(req);
  const action = typeof body.action === "string" ? body.action : "unknown";
  const ratePolicies = {
    domains: { max: 12, message: "ইমেইল সেবা সাময়িকভাবে ব্যস্ত আছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
    createAccount: { max: 6, message: "নতুন ইমেইল তৈরির অনুরোধ বেশি হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
    messages: { max: 36, message: "ইনবক্স রিফ্রেশের অনুরোধ বেশি হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
    message: { max: 24, message: "ইমেইল খোলার অনুরোধ বেশি হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
    deleteMessage: { max: 18, message: "ইমেইল মুছার অনুরোধ বেশি হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
    deleteAccount: { max: 8, message: "ইমেইল সেবা সাময়িকভাবে ব্যস্ত আছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
  };
  const policy = ratePolicies[action] || { max: 10, message: "ইমেইল সেবা সাময়িকভাবে ব্যস্ত আছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" };
  const rate = checkRateLimit(req, res, {
    keyPrefix: `temp-email:${action}`,
    windowMs: 60_000,
    max: policy.max,
    message: policy.message,
  });
  if (rate.limited) return;

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    return await handleMailboxAction(body, req, res);
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 502;
    const message = error instanceof Error && error.message
      ? error.message
      : "ইমেইল সেবার সঙ্গে সংযোগ স্থাপন করা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
    console.error("Temp email adapter failed:", message);
    return res.status(status).json({ error: message });
  }
}

function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

function isString(value, maxLength = 2048) {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

function isMessageIdentifier(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,160}$/.test(value);
}

function encodeMailboxToken(address) {
  return `cm-${Buffer.from(address, "utf8").toString("base64url")}`;
}

function parseMailboxToken(token) {
  if (!isString(token, 256) || !/^cm-[A-Za-z0-9_-]{20,220}$/.test(token)) return null;
  try {
    const address = Buffer.from(token.slice(3), "base64url").toString("utf8");
    return /^[A-Za-z0-9._+-]{1,64}@[A-Za-z0-9.-]{3,253}$/.test(address) ? address : null;
  } catch {
    return null;
  }
}

function clientIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"] || req.headers?.["x-real-ip"] || "127.0.0.1";
  const value = String(forwarded).split(",")[0].trim();
  return /^[A-Za-z0-9:._-]{1,80}$/.test(value) ? value : "127.0.0.1";
}

async function callCatchmail(path, req, options = {}) {
  const url = new URL(`${CATCHMAIL_API}${path}`);
  for (const [key, value] of Object.entries(options.query || {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: { Accept: "application/json", "User-Agent": USER_AGENT, "X-Forwarded-For": clientIp(req) },
      signal: controller.signal,
    });
    const text = await response.text();
    let payload = null;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
    if (!response.ok) {
      const error = new Error(
        response.status === 429
          ? "ইমেইল সেবা সাময়িকভাবে ব্যস্ত আছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।"
          : "ইমেইল সেবাটি এখন ব্যবহার করা যাচ্ছে না।"
      );
      error.status = response.status >= 500 || response.status === 429 ? 502 : response.status;
      throw error;
    }
    return payload || {};
  } finally {
    clearTimeout(timeoutId);
  }
}

function requireMailbox(token, id) {
  const address = parseMailboxToken(token);
  if (!address || (id !== undefined && id !== token)) {
    const error = new Error("ইমেইল সেশনটি আর সক্রিয় নেই");
    error.status = 400;
    throw error;
  }
  return address;
}

function createMailboxUsername() {
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${MAILBOX_NAME_PREFIX}${suffix}`;
}

function toIsoTimestamp(value) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : new Date().toISOString();
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#39;/g, "'");
}

function mapCatchmailMessage(message) {
  const from = typeof message?.from === "string" ? message.from : message?.from?.address || "";
  return {
    id: String(message?.id || ""),
    from: { name: from.split("@")[0] || "অজানা প্রেরক", address: from },
    subject: decodeHtmlEntities(message?.subject || "(বিষয় নেই)"),
    intro: decodeHtmlEntities(message?.intro || ""),
    seen: Boolean(message?.seen),
    createdAt: toIsoTimestamp(message?.date || message?.createdAt),
    hasAttachments: Number(message?.attachments?.length || message?.hasAttachments) > 0,
  };
}

function mapCatchmailDetail(message) {
  const mapped = mapCatchmailMessage(message);
  return {
    ...mapped,
    text: message?.body?.text || message?.text || "",
    html: message?.body?.html ? [message.body.html] : (Array.isArray(message?.html) ? message.html : []),
  };
}

async function createAccount() {
  const address = `${createMailboxUsername()}@${TEMP_EMAIL_DOMAIN}`;
  const token = encodeMailboxToken(address);
  return { id: token, address, token, createdAt: new Date().toISOString() };
}

async function getMessages(req, token) {
  const address = requireMailbox(token);
  const data = await callCatchmail("/mailbox", req, { query: { address } });
  const list = Array.isArray(data.messages) ? data.messages.map(mapCatchmailMessage) : [];
  return { "hydra:member": list };
}

async function getMessage(req, token, id) {
  const address = requireMailbox(token);
  if (!isMessageIdentifier(id)) {
    const error = new Error("অবৈধ ইমেইল অনুরোধ");
    error.status = 400;
    throw error;
  }
  const data = await callCatchmail(`/message/${encodeURIComponent(id)}`, req, { query: { mailbox: address } });
  return mapCatchmailDetail(data);
}

async function handleMailboxAction({ action, token, id }, req, res) {
  switch (action) {
    case "domains":
      return res.status(200).json({ "hydra:member": [{ domain: TEMP_EMAIL_DOMAIN, isActive: true, isPrivate: false }] });
    case "createAccount":
      return res.status(201).json(await createAccount());
    case "messages":
      return res.status(200).json(await getMessages(req, token));
    case "message":
      return res.status(200).json(await getMessage(req, token, id));
    case "deleteMessage": {
      const address = requireMailbox(token);
      if (!isMessageIdentifier(id)) return res.status(400).json({ error: "অবৈধ ইমেইল অনুরোধ" });
      await callCatchmail(`/message/${encodeURIComponent(id)}`, req, { method: "DELETE", query: { mailbox: address } });
      return res.status(204).end();
    }
    case "deleteAccount":
      requireMailbox(token, id);
      return res.status(204).end();
    default:
      return res.status(400).json({ error: "অজানা ইমেইল অনুরোধ" });
  }
}
