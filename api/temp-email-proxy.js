// api/temp-email-proxy.js — same-origin adapter for Guerrilla Mail's public JSON API.
// The adapter keeps provider session details server-side and exposes only the
// mailbox actions used by the website.
import { checkRateLimit, limitJsonBodySize } from "./_utils/security.js";

const GUERRILLA_API = "https://api.guerrillamail.com/ajax.php";
const REQUEST_TIMEOUT_MS = 12_000;
const USER_AGENT = "MahbubSardarSabujTempEmail/4.0";

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

function isIdentifier(value) {
  return typeof value === "string" && /^[A-Za-z0-9]{1,80}$/.test(value);
}

function parseGuerrillaToken(token) {
  if (!isString(token, 128) || !/^gm-[A-Za-z0-9]{20,100}$/.test(token)) return null;
  return token.slice(3);
}

function clientIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"] || req.headers?.["x-real-ip"] || "127.0.0.1";
  const value = String(forwarded).split(",")[0].trim();
  return /^[A-Za-z0-9:._-]{1,80}$/.test(value) ? value : "127.0.0.1";
}

async function callGuerrilla(functionName, params, req) {
  const url = new URL(GUERRILLA_API);
  url.searchParams.set("f", functionName);
  url.searchParams.set("ip", clientIp(req));
  url.searchParams.set("agent", USER_AGENT);
  for (const [key, value] of Object.entries(params || {})) {
    if (key === "email_ids[]" && Array.isArray(value)) {
      for (const id of value) url.searchParams.append("email_ids[]", String(id));
    } else if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    const text = await response.text();
    let payload = null;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
    if (!response.ok || payload === null || payload === undefined) {
      const error = new Error("ইমেইল সেবাটি এখন ব্যবহার করা যাচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন।");
      error.status = response.status >= 400 ? 502 : 503;
      throw error;
    }
    return payload;
  } finally {
    clearTimeout(timeoutId);
  }
}

function requireSession(token, id) {
  const sid = parseGuerrillaToken(token);
  if (!sid || (id !== undefined && (!isIdentifier(id) || id !== sid))) {
    const error = new Error("ইমেইল সেশনটি আর সক্রিয় নেই");
    error.status = 400;
    throw error;
  }
  return sid;
}

function toIsoTimestamp(value) {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0
    ? new Date(seconds * 1000).toISOString()
    : new Date().toISOString();
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#39;/g, "'");
}

function mapGuerrillaMessage(message) {
  const from = decodeHtmlEntities(message?.mail_from || "");
  return {
    id: String(message?.mail_id || ""),
    from: { name: from.split("@")[0] || "অজানা প্রেরক", address: from },
    subject: decodeHtmlEntities(message?.mail_subject || "(বিষয় নেই)"),
    intro: decodeHtmlEntities(message?.mail_excerpt || ""),
    seen: Number(message?.mail_read) === 1,
    createdAt: toIsoTimestamp(message?.mail_timestamp),
    hasAttachments: Number(message?.att) > 0,
  };
}

function mapGuerrillaDetail(message) {
  const mapped = mapGuerrillaMessage(message);
  const html = typeof message?.mail_html === "string" ? message.mail_html : "";
  return {
    ...mapped,
    text: decodeHtmlEntities(message?.mail_body || ""),
    html: html ? [html] : [],
  };
}

async function createAccount(req) {
  const account = await callGuerrilla("get_email_address", { lang: "en" }, req);
  if (!isString(account?.email_addr, 254) || !isString(account?.sid_token, 128)) {
    throw new Error("ইমেইল সেশন তৈরি করতে সমস্যা হয়েছে");
  }
  return {
    id: account.sid_token,
    address: account.email_addr,
    token: `gm-${account.sid_token}`,
    createdAt: toIsoTimestamp(account.email_timestamp),
  };
}

async function getMessages(req, token) {
  const sid = requireSession(token);
  const data = await callGuerrilla("get_email_list", { offset: 0, sid_token: sid }, req);
  const list = Array.isArray(data.list) ? data.list.map(mapGuerrillaMessage) : [];
  return { "hydra:member": list };
}

async function getMessage(req, token, id) {
  const sid = requireSession(token);
  if (!/^\d{1,20}$/.test(String(id))) {
    const error = new Error("অবৈধ ইমেইল অনুরোধ");
    error.status = 400;
    throw error;
  }
  const data = await callGuerrilla("fetch_email", { email_id: id, sid_token: sid }, req);
  return mapGuerrillaDetail(data);
}

async function handleMailboxAction({ action, token, id }, req, res) {
  switch (action) {
    case "domains":
      return res.status(200).json({
        "hydra:member": [{ domain: "guerrillamailblock.com", isActive: true, isPrivate: false }],
      });
    case "createAccount":
      return res.status(201).json(await createAccount(req));
    case "messages":
      return res.status(200).json(await getMessages(req, token));
    case "message":
      return res.status(200).json(await getMessage(req, token, id));
    case "deleteMessage": {
      const sid = requireSession(token);
      if (!/^\d{1,20}$/.test(String(id))) return res.status(400).json({ error: "অবৈধ ইমেইল অনুরোধ" });
      await callGuerrilla("del_email", { "email_ids[]": [id], sid_token: sid }, req);
      return res.status(204).end();
    }
    case "deleteAccount": {
      const sid = requireSession(token, id);
      await callGuerrilla("forget_me", { sid_token: sid }, req);
      return res.status(204).end();
    }
    default:
      return res.status(400).json({ error: "অজানা ইমেইল অনুরোধ" });
  }
}
