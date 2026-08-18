// api/temp-email-proxy.js — limited same-origin adapter for the public mail.tm mailbox API.
// It exposes only the inbox actions used by this website; callers cannot choose arbitrary URLs.
import { checkRateLimit, limitJsonBodySize } from "./_utils/security.js";

const MAILTM_BASE = "https://api.mail.tm";
const TEMP_EMAIL_TIMEOUT_MS = 12_000;

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
    createAccount: { max: 8, message: "নতুন ইমেইল তৈরির অনুরোধ বেশি হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
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
    return await handleMailboxAction(body, res);
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 502;
    const message = error instanceof Error && error.message
      ? error.message
      : "ইমেইল সেবার সঙ্গে সংযোগ স্থাপন করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।";
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

function isAddress(value) {
  return isString(value, 254) && /^[a-z0-9._-]{3,64}@[a-z0-9.-]{1,190}$/i.test(value);
}

function isIdentifier(value) {
  return typeof value === "string" && /^[a-z0-9]{1,64}$/i.test(value);
}

function isToken(value) {
  return typeof value === "string" && /^[A-Za-z0-9._-]{20,2048}$/.test(value);
}

function readableProviderError(payload, fallback) {
  if (!payload || typeof payload !== "object") return fallback;
  return payload.detail || payload["hydra:description"] || payload.message || fallback;
}

async function callMailTm(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${MAILTM_BASE}${path}`, {
    method,
    headers: {
      Accept: "application/ld+json, application/json",
      "User-Agent": "MahbubSardarSabujTempEmail/2.0",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(TEMP_EMAIL_TIMEOUT_MS),
  });
  const text = await response.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }

  if (!response.ok) {
    const error = new Error(readableProviderError(payload, "ইমেইল সেবাটি এখন ব্যবহার করা যাচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন।"));
    error.status = response.status === 429 || response.status >= 500 ? 502 : response.status;
    throw error;
  }
  return payload;
}

async function handleMailboxAction({ action, address, password, token, id }, res) {
  switch (action) {
    case "domains":
      return res.status(200).json(await callMailTm("/domains"));

    case "createAccount": {
      if (!isAddress(address) || !isString(password, 128) || password.length < 12) {
        return res.status(400).json({ error: "অবৈধ ইমেইল ঠিকানা বা পাসওয়ার্ড" });
      }
      const account = await callMailTm("/accounts", { method: "POST", body: { address, password } });
      if (!isIdentifier(account?.id) || !isAddress(account?.address)) {
        throw new Error("ইমেইল সেশন তৈরি করতে সমস্যা হয়েছে");
      }
      const session = await callMailTm("/token", { method: "POST", body: { address, password } });
      if (!isToken(session?.token)) throw new Error("ইমেইল সেশন তৈরি করতে সমস্যা হয়েছে");
      return res.status(201).json({
        id: account.id,
        address: account.address,
        token: session.token,
        createdAt: account.createdAt || new Date().toISOString(),
      });
    }

    case "messages":
      if (!isToken(token)) return res.status(400).json({ error: "ইমেইল সেশনটি আর সক্রিয় নেই" });
      return res.status(200).json(await callMailTm("/messages", { token }));

    case "message":
      if (!isToken(token) || !isIdentifier(id)) return res.status(400).json({ error: "অবৈধ ইমেইল অনুরোধ" });
      return res.status(200).json(await callMailTm(`/messages/${encodeURIComponent(id)}`, { token }));

    case "deleteMessage":
      if (!isToken(token) || !isIdentifier(id)) return res.status(400).json({ error: "অবৈধ ইমেইল অনুরোধ" });
      await callMailTm(`/messages/${encodeURIComponent(id)}`, { method: "DELETE", token });
      return res.status(204).end();

    case "deleteAccount":
      if (!isToken(token) || !isIdentifier(id)) return res.status(400).json({ error: "অবৈধ ইমেইল অনুরোধ" });
      await callMailTm(`/accounts/${encodeURIComponent(id)}`, { method: "DELETE", token });
      return res.status(204).end();

    default:
      return res.status(400).json({ error: "অজানা ইমেইল অনুরোধ" });
  }
}
