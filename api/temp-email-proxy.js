// api/temp-email-proxy.js — limited same-origin adapter for a public mailbox API.
// It exposes only the inbox actions used by this website; callers cannot choose arbitrary URLs.
import { checkRateLimit, limitJsonBodySize } from "./_utils/security.js";

// Use two compatible public mailbox APIs. A provider can rotate domains, enforce
// short burst limits, or temporarily fail, so one provider must not take the
// entire feature offline.
const MAIL_PROVIDERS = [
  { baseUrl: "https://api.mail.gw", name: "mail.gw" },
  { baseUrl: "https://api.mail.tm", name: "mail.tm" },
];
const TEMP_EMAIL_TIMEOUT_MS = 4_500;
const ADDRESS_PREFIX = "mahbubsardarsabuj";
const RANDOM_ADDRESS_ATTEMPTS = 3;

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
    // One website request may need several provider attempts when an earlier short
    // address is occupied, so allocation is performed once on the server.
    createAccount: { max: 4, message: "নতুন ইমেইল তৈরির অনুরোধ বেশি হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
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

function generateMailboxPassword() {
  const nonce = globalThis.crypto?.randomUUID?.().replace(/-/g, "") || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  return `Mss-${nonce}`.slice(0, 96);
}

function generateMailboxUsername() {
  const nonce = globalThis.crypto?.randomUUID?.().replace(/-/g, "") || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  // A unique suffix prevents a small, predictable address pool from becoming
  // permanently exhausted while preserving a recognisable site-specific prefix.
  return `${ADDRESS_PREFIX}${nonce.slice(0, 10)}`.slice(0, 64);
}

function isAddressConflict(error) {
  return error?.status === 409 || error?.status === 422;
}

function isRetryableProviderError(error) {
  return isAddressConflict(error) || error?.status === 429 || error?.status >= 500 || error?.name === "AbortError";
}

async function callMailboxProvider(baseUrl, path, { method = "GET", token, body } = {}) {
  // Vercel's Node runtime can lag modern AbortSignal helpers, so keep timeout
  // behavior portable rather than depending on AbortSignal.timeout().
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TEMP_EMAIL_TIMEOUT_MS);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Accept: "application/ld+json, application/json",
        "User-Agent": "MahbubSardarSabujTempEmail/3.0",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
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
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getShortestActiveDomain(baseUrl) {
  const domains = await callMailboxProvider(baseUrl, "/domains");
  const active = (domains?.["hydra:member"] || [])
    .filter((domain) => domain?.isActive && !domain?.isPrivate && isString(domain?.domain, 190))
    .map((domain) => domain.domain)
    .sort((first, second) => first.length - second.length || first.localeCompare(second));
  if (!active[0]) {
    const error = new Error("কোনো সক্রিয় ইমেইল ডোমেইন পাওয়া যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।");
    error.status = 502;
    throw error;
  }
  return active[0];
}

async function createAccountWithProvider(provider) {
  const domain = await getShortestActiveDomain(provider.baseUrl);

  for (let attempt = 1; attempt <= RANDOM_ADDRESS_ATTEMPTS; attempt += 1) {
    const address = `${generateMailboxUsername()}@${domain}`;
    const password = generateMailboxPassword();
    try {
      const account = await callMailboxProvider(provider.baseUrl, "/accounts", { method: "POST", body: { address, password } });
      if (!isIdentifier(account?.id) || !isAddress(account?.address)) {
        throw new Error("ইমেইল সেশন তৈরি করতে সমস্যা হয়েছে");
      }
      const session = await callMailboxProvider(provider.baseUrl, "/token", { method: "POST", body: { address, password } });
      if (!isToken(session?.token)) {
        // A partially created account should not be left active when token creation fails.
        await callMailboxProvider(provider.baseUrl, `/accounts/${encodeURIComponent(account.id)}`, { method: "DELETE", token: session?.token }).catch(() => undefined);
        throw new Error("ইমেইল সেশন তৈরি করতে সমস্যা হয়েছে");
      }
      return {
        id: account.id,
        address: account.address,
        token: session.token,
        createdAt: account.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      // Address collisions are retried locally without exposing account allocation
      // details to the browser or making the UI issue repeated requests.
      if (isAddressConflict(error)) continue;
      throw error;
    }
  }

  const error = new Error("নতুন ইমেইল ঠিকানা বরাদ্দ করা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।");
  error.status = 409;
  throw error;
}

async function createTemporaryAccount() {
  let lastError;

  for (const provider of MAIL_PROVIDERS) {
    try {
      return await createAccountWithProvider(provider);
    } catch (error) {
      lastError = error;
      console.warn(`Temporary email provider ${provider.name} failed:`, error?.message || "Unknown error");
      if (!isRetryableProviderError(error)) throw error;
    }
  }

  throw lastError || new Error("ইমেইল সেবাটি এখন ব্যবহার করা যাচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন।");
}

function isTokenProviderMismatch(error) {
  return error?.status === 401 || error?.status === 404;
}

async function callTokenProvider(path, options) {
  let lastError;

  for (const provider of MAIL_PROVIDERS) {
    try {
      return await callMailboxProvider(provider.baseUrl, path, options);
    } catch (error) {
      lastError = error;
      if (!isTokenProviderMismatch(error) && !isRetryableProviderError(error)) throw error;
    }
  }

  throw lastError || new Error("ইমেইল সেবাটি এখন ব্যবহার করা যাচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন।");
}

async function handleMailboxAction({ action, token, id }, res) {
  switch (action) {
    case "domains":
      return res.status(200).json(await callMailboxProvider(MAIL_PROVIDERS[0].baseUrl, "/domains"));

    case "createAccount":
      return res.status(201).json(await createTemporaryAccount());

    case "messages":
      if (!isToken(token)) return res.status(400).json({ error: "ইমেইল সেশনটি আর সক্রিয় নেই" });
      return res.status(200).json(await callTokenProvider("/messages", { token }));

    case "message":
      if (!isToken(token) || !isIdentifier(id)) return res.status(400).json({ error: "অবৈধ ইমেইল অনুরোধ" });
      return res.status(200).json(await callTokenProvider(`/messages/${encodeURIComponent(id)}`, { token }));

    case "deleteMessage":
      if (!isToken(token) || !isIdentifier(id)) return res.status(400).json({ error: "অবৈধ ইমেইল অনুরোধ" });
      await callTokenProvider(`/messages/${encodeURIComponent(id)}`, { method: "DELETE", token });
      return res.status(204).end();

    case "deleteAccount":
      if (!isToken(token) || !isIdentifier(id)) return res.status(400).json({ error: "অবৈধ ইমেইল অনুরোধ" });
      await callTokenProvider(`/accounts/${encodeURIComponent(id)}`, { method: "DELETE", token });
      return res.status(204).end();

    default:
      return res.status(400).json({ error: "অজানা ইমেইল অনুরোধ" });
  }
}
