// api/temp-email-proxy.js — disposable-email provider-এর জন্য same-origin proxy.
// No phone number, SMS, or payment-card data is handled here.
import { checkRateLimit, limitJsonBodySize } from "./_utils/security.js";

const GUERRILLA_BASE = "https://api.guerrillamail.com/ajax.php";
const TEMP_EMAIL_TIMEOUT_MS = 10_000;
const GUERRILLA_AGENT = "MahbubSardarSabujTempEmail/1.0";
const DISPLAY_DOMAIN = "guerrillamailblock.com";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (limitJsonBodySize(req, res, 32 * 1024)) return;

  // Keep mailbox reads responsive without weakening protection for mailbox creation.
  // A single shared 10-request bucket made the 30-second background refresh compete
  // with create, detail and delete actions, which could show a false failure banner
  // while the inbox itself was still usable.
  const body = getTempEmailBody(req);
  const action = typeof body.action === "string" ? body.action : "unknown";
  const ratePolicies = {
    domains: { max: 24, message: "ইমেইল সেবা সাময়িকভাবে ব্যস্ত আছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
    createAccount: { max: 6, message: "নতুন ইমেইল তৈরির অনুরোধ বেশি হয়েছে। অনুগ্রহ করে এক মিনিট পরে আবার চেষ্টা করুন।" },
    messages: { max: 36, message: "ইনবক্স রিফ্রেশের অনুরোধ বেশি হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
    message: { max: 24, message: "ইমেইল খোলার অনুরোধ বেশি হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
    deleteMessage: { max: 18, message: "ইমেইল মুছার অনুরোধ বেশি হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
    deleteAccount: { max: 12, message: "ইমেইল সেবা সাময়িকভাবে ব্যস্ত আছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
  };
  const policy = ratePolicies[action] || { max: 12, message: "ইমেইল সেবা সাময়িকভাবে ব্যস্ত আছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" };
  const rate = checkRateLimit(req, res, {
    keyPrefix: `temp-email:${action}`,
    windowMs: 60_000,
    max: policy.max,
    message: policy.message,
  });
  if (rate.limited) return;

  return handleTempEmailProxy(req, res);
}

function getTempEmailBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function isTempEmailString(value, maxLength = 2048) {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

function isTempEmailAddress(value) {
  return isTempEmailString(value, 254) && /^[a-z0-9._-]{3,64}@[a-z0-9.-]{1,190}$/i.test(value);
}

function isTempEmailId(value) {
  return typeof value === "string" && /^[0-9]{1,12}$/.test(value);
}

function isSessionToken(value) {
  return typeof value === "string" && /^[a-z0-9]{12,128}$/i.test(value);
}

function toIsoDate(value) {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return new Date().toISOString();
  return new Date(timestamp * 1000).toISOString();
}

function splitAddress(address) {
  return address.slice(0, address.indexOf("@"));
}

async function callGuerrilla(action, params = {}) {
  const url = new URL(GUERRILLA_BASE);
  url.searchParams.set("f", action);
  url.searchParams.set("agent", GUERRILLA_AGENT);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(TEMP_EMAIL_TIMEOUT_MS),
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload || typeof payload !== "object") {
    throw new Error("Disposable email provider unavailable");
  }
  return payload;
}

function mapMessage(message) {
  const sender = typeof message.mail_from === "string" ? message.mail_from : "";
  return {
    id: String(message.mail_id ?? ""),
    from: { name: sender.split("@")[0] || "অজানা প্রেরক", address: sender },
    subject: typeof message.mail_subject === "string" ? message.mail_subject : "(বিষয় নেই)",
    intro: typeof message.mail_excerpt === "string" ? message.mail_excerpt : "",
    seen: Number(message.mail_read) === 1,
    createdAt: toIsoDate(message.mail_timestamp),
    hasAttachments: Number(message.att) > 0,
  };
}

function mapMessageDetail(message) {
  const sender = typeof message.mail_from === "string" ? message.mail_from : "";
  const html = typeof message.mail_body === "string" && /<[^>]+>/.test(message.mail_body)
    ? [message.mail_body]
    : [];
  return {
    id: String(message.mail_id ?? ""),
    from: { name: sender.split("@")[0] || "অজানা প্রেরক", address: sender },
    subject: typeof message.mail_subject === "string" ? message.mail_subject : "(বিষয় নেই)",
    text: typeof message.mail_body === "string" ? message.mail_body : "",
    html,
    createdAt: toIsoDate(message.mail_timestamp),
    hasAttachments: Number(message.att) > 0,
  };
}

/**
 * Same-origin adapter for GuerrillaMail. Only known operations are exposed;
 * callers cannot select a destination URL. Its responses are normalized to the
 * existing mail.tm-shaped client contract, so inbox rendering stays unchanged.
 */
async function handleTempEmailProxy(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, address, password, token, id } = getTempEmailBody(req);

  try {
    switch (action) {
      case "domains":
        return res.status(200).json({
          "hydra:member": [{ isActive: true, domain: DISPLAY_DOMAIN }],
        });

      case "createAccount": {
        if (!isTempEmailAddress(address) || !isTempEmailString(password, 128) || password.length < 8) {
          return res.status(400).json({ error: "অবৈধ ইমেইল ঠিকানা বা পাসওয়ার্ড" });
        }
        const created = await callGuerrilla("set_email_user", {
          email_user: splitAddress(address),
          lang: "en",
        });
        if (!isSessionToken(created.sid_token) || !isTempEmailAddress(created.email_addr)) {
          throw new Error("Disposable email provider returned an invalid session");
        }
        return res.status(201).json({
          id: created.sid_token,
          address: created.email_addr,
          token: created.sid_token,
          createdAt: new Date().toISOString(),
        });
      }

      case "createToken":
        // New client versions use the token returned from createAccount. This
        // compatibility response retains a safe, clear error for stale clients.
        return res.status(409).json({ error: "ইমেইল সেশনটি আবার তৈরি করুন" });

      case "messages": {
        if (!isSessionToken(token)) return res.status(400).json({ error: "ইমেইল সেশনটি আর সক্রিয় নেই" });
        const inbox = await callGuerrilla("check_email", { sid_token: token, seq: 0 });
        const list = Array.isArray(inbox.list) ? inbox.list.map(mapMessage).filter((message) => message.id) : [];
        return res.status(200).json({ "hydra:member": list });
      }

      case "message": {
        if (!isSessionToken(token) || !isTempEmailId(id)) return res.status(400).json({ error: "অবৈধ ইমেইল অনুরোধ" });
        const message = await callGuerrilla("fetch_email", { sid_token: token, email_id: id });
        return res.status(200).json(mapMessageDetail(message));
      }

      case "deleteMessage": {
        if (!isSessionToken(token) || !isTempEmailId(id)) return res.status(400).json({ error: "অবৈধ ইমেইল অনুরোধ" });
        await callGuerrilla("del_email", { sid_token: token, "email_ids[]": id });
        return res.status(204).end();
      }

      case "deleteAccount":
        if (!isSessionToken(token)) return res.status(400).json({ error: "ইমেইল সেশনটি আর সক্রিয় নেই" });
        // The provider expires mailboxes automatically; removing the local
        // session in the client is the privacy-preserving account deletion.
        return res.status(204).end();

      default:
        return res.status(400).json({ error: "অজানা ইমেইল অনুরোধ" });
    }
  } catch (error) {
    console.error("Temp email proxy failed:", error instanceof Error ? error.message : error);
    return res.status(502).json({ error: "ইমেইল সেবার সঙ্গে সংযোগ স্থাপন করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।" });
  }
}
