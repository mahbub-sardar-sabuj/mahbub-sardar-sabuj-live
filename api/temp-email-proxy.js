// api/temp-email-proxy.js — same-origin adapter for mail.tm's public API.
// The adapter keeps the mailbox credentials behind a short-lived browser token
// and exposes only the mailbox actions used by the website.
import { checkRateLimit, limitJsonBodySize } from "./_utils/security.js";

const MAIL_TM_API = "https://api.mail.tm";
const CATCHMAIL_API = "https://api.catchmail.io/api/v1";
// mail.tm's /domains endpoint is aggressively rate-limited from shared serverless
// egress IPs. Keep the currently active domain here so mailbox creation does not
// fail before it can even reach the account endpoint.
const MAIL_TM_DOMAIN = "uberip.com";
const REQUEST_TIMEOUT_MS = 12_000;
const USER_AGENT = "MahbubSardarSabujTempEmail/7.0";
const MAILBOX_NAME_PREFIX = "mahbubsardarsabuj";
const MAILBOX_NAME_PATTERN = /^mahbubsardarsabuj\d{5,}$/;

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

function encodeMailboxToken(mailbox) {
  return `mt-${Buffer.from(JSON.stringify(mailbox), "utf8").toString("base64url")}`;
}

function parseMailboxToken(token) {
  if (!isString(token, 4096) || !/^mt-[A-Za-z0-9_-]{40,4000}$/.test(token)) return null;
  try {
    const mailbox = JSON.parse(Buffer.from(token.slice(3), "base64url").toString("utf8"));
    if (!mailbox || typeof mailbox !== "object") return null;
    if (!/^[a-z0-9._+-]{1,64}@[a-z0-9.-]{3,253}$/.test(mailbox.address)) return null;
    if (mailbox.provider === "catchmail") return { address: mailbox.address, provider: "catchmail" };
    if (!/^[A-Za-z0-9._-]{80,2000}$/.test(mailbox.jwt)) return null;
    return { address: mailbox.address, jwt: mailbox.jwt, provider: "mail.tm" };
  } catch {
    return null;
  }
}

function requireMailbox(token, id) {
  const mailbox = parseMailboxToken(token);
  if (!mailbox || (id !== undefined && id !== token)) {
    const error = new Error("ইমেইল সেশনটি আর সক্রিয় নেই");
    error.status = 400;
    throw error;
  }
  return mailbox;
}

function createMailboxUsername() {
  return `${MAILBOX_NAME_PREFIX}${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`.toLowerCase();
}

function toIsoTimestamp(value) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : new Date().toISOString();
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'");
}

function mapMailTmMessage(message) {
  const from = typeof message?.from === "string" ? { address: message.from } : (message?.from || {});
  return {
    id: String(message?.id || ""),
    from: { name: from.name || from.address?.split("@")[0] || "অজানা প্রেরক", address: from.address || "" },
    subject: decodeHtmlEntities(message?.subject || "(বিষয় নেই)"),
    intro: decodeHtmlEntities(message?.intro || ""),
    seen: Boolean(message?.seen),
    createdAt: toIsoTimestamp(message?.createdAt),
    hasAttachments: Boolean(message?.hasAttachments),
  };
}

function mapMailTmDetail(message) {
  const mapped = mapMailTmMessage(message);
  return {
    ...mapped,
    text: message?.text || "",
    html: Array.isArray(message?.html) ? message.html : [],
  };
}

async function callMailTm(path, req, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers = {
    Accept: "application/ld+json, application/json",
    "User-Agent": USER_AGENT,
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.jwt ? { Authorization: `Bearer ${options.jwt}` } : {}),
  };
  try {
    const response = await fetch(`${MAIL_TM_API}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    const text = await response.text();
    let payload = null;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
    if (!response.ok) {
      const error = new Error(response.status === 429
        ? "ইমেইল সেবা সাময়িকভাবে ব্যস্ত আছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।"
        : response.status === 401
          ? "ইমেইল সেশনটির মেয়াদ শেষ হয়েছে। নতুন ইমেইল তৈরি করুন।"
          : "ইমেইল সেবাটি এখন ব্যবহার করা যাচ্ছে না।");
      error.status = response.status === 429 || response.status >= 500 ? 502 : response.status;
      throw error;
    }
    return payload || {};
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callCatchmail(path, req, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const url = new URL(`${CATCHMAIL_API}${path}`);
  for (const [key, value] of Object.entries(options.query || {})) url.searchParams.set(key, String(value));
  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    const text = await response.text();
    let payload = null;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
    if (!response.ok) {
      const error = new Error("ইমেইল সেবাটি এখন ব্যবহার করা যাচ্ছে না।");
      error.status = response.status >= 500 || response.status === 429 ? 502 : response.status;
      throw error;
    }
    return payload || {};
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getActiveDomain(req) {
  return MAIL_TM_DOMAIN;
}

async function createAccount(req) {
  const domain = await getActiveDomain(req);
  const address = `${createMailboxUsername()}@${domain}`;
  const password = `Mss${cryptoRandom()}aA1!`;
  try {
    await callMailTm("/accounts", req, { method: "POST", body: { address, password } });
    const auth = await callMailTm("/token", req, { method: "POST", body: { address, password } });
    if (!auth.token) throw new Error("ইমেইল সেশন তৈরি করতে সমস্যা হয়েছে");
    const token = encodeMailboxToken({ address, jwt: auth.token });
    return { id: token, address, token, createdAt: new Date().toISOString() };
  } catch (error) {
    console.warn("mail.tm account creation failed; using Catchmail fallback:", error?.message || error);
    const fallbackAddress = `${createMailboxUsername()}@zeppost.com`;
    const token = encodeMailboxToken({ provider: "catchmail", address: fallbackAddress });
    return { id: token, address: fallbackAddress, token, createdAt: new Date().toISOString() };
  }
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function getMessages(req, token) {
  const mailbox = requireMailbox(token);
  if (mailbox.provider === "catchmail") {
    const data = await callCatchmail("/mailbox", req, { query: { address: mailbox.address } });
    return { "hydra:member": Array.isArray(data.messages) ? data.messages.map(mapMailTmMessage) : [] };
  }
  const data = await callMailTm("/messages", req, { jwt: mailbox.jwt });
  const list = Array.isArray(data["hydra:member"]) ? data["hydra:member"].map(mapMailTmMessage) : [];
  return { "hydra:member": list };
}

async function getMessage(req, token, id) {
  const mailbox = requireMailbox(token);
  if (!isMessageIdentifier(id)) {
    const error = new Error("অবৈধ ইমেইল অনুরোধ");
    error.status = 400;
    throw error;
  }
  const data = mailbox.provider === "catchmail"
    ? await callCatchmail(`/message/${encodeURIComponent(id)}`, req, { query: { mailbox: mailbox.address } })
    : await callMailTm(`/messages/${encodeURIComponent(id)}`, req, { jwt: mailbox.jwt });
  return mapMailTmDetail(data);
}

async function handleMailboxAction({ action, token, id }, req, res) {
  switch (action) {
    case "domains": {
      const domain = await getActiveDomain(req);
      return res.status(200).json({ "hydra:member": [{ domain, isActive: true, isPrivate: false }] });
    }
    case "createAccount":
      return res.status(201).json(await createAccount(req));
    case "messages":
      return res.status(200).json(await getMessages(req, token));
    case "message":
      return res.status(200).json(await getMessage(req, token, id));
    case "deleteMessage": {
      const mailbox = requireMailbox(token);
      if (!isMessageIdentifier(id)) return res.status(400).json({ error: "অবৈধ ইমেইল অনুরোধ" });
      if (mailbox.provider === "catchmail") {
        await callCatchmail(`/message/${encodeURIComponent(id)}`, req, { method: "DELETE", query: { mailbox: mailbox.address } });
      } else {
        await callMailTm(`/messages/${encodeURIComponent(id)}`, req, { method: "DELETE", jwt: mailbox.jwt });
      }
      return res.status(204).end();
    }
    case "deleteAccount":
      requireMailbox(token, id);
      return res.status(204).end();
    default:
      return res.status(400).json({ error: "অজানা ইমেইল অনুরোধ" });
  }
}

// Keep this export for the standalone API adapter's module contract.
export { MAILBOX_NAME_PATTERN };
