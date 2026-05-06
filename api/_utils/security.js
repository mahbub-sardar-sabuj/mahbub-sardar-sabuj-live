const buckets = new Map();

function now() {
  return Date.now();
}

function parseForwardedIp(value) {
  if (!value || typeof value !== "string") return "";
  return value.split(",")[0]?.trim() || "";
}

export function getClientIp(req) {
  return (
    parseForwardedIp(req.headers?.["x-forwarded-for"]) ||
    parseForwardedIp(req.headers?.["x-real-ip"]) ||
    parseForwardedIp(req.headers?.["cf-connecting-ip"]) ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

export function limitJsonBodySize(req, res, maxBytes = 1024 * 1024) {
  const length = Number(req.headers?.["content-length"] || 0);
  if (Number.isFinite(length) && length > maxBytes) {
    res.status(413).json({ success: false, error: "অনুরোধটি খুব বড়। অনুগ্রহ করে ছোট বার্তা পাঠান।" });
    return true;
  }
  return false;
}

export function checkRateLimit(req, res, options = {}) {
  const {
    keyPrefix = "global",
    windowMs = 60_000,
    max = 20,
    message = "অনেকবার চেষ্টা করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।",
  } = options;

  const currentTime = now();
  const clientIp = getClientIp(req);
  const key = `${keyPrefix}:${clientIp}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= currentTime) {
    const resetAt = currentTime + windowMs;
    buckets.set(key, { count: 1, resetAt });
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(max - 1, 0)));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
    return { limited: false, clientIp };
  }

  current.count += 1;
  const remaining = Math.max(max - current.count, 0);
  res.setHeader("X-RateLimit-Limit", String(max));
  res.setHeader("X-RateLimit-Remaining", String(remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(current.resetAt / 1000)));

  if (current.count > max) {
    const retryAfter = Math.max(Math.ceil((current.resetAt - currentTime) / 1000), 1);
    res.setHeader("Retry-After", String(retryAfter));
    res.status(429).json({ success: false, error: message, retryAfter });
    return { limited: true, clientIp };
  }

  return { limited: false, clientIp };
}

export function hasHoneypotValue(body, fieldNames = ["website", "company", "url", "homepage"]) {
  if (!body || typeof body !== "object") return false;
  return fieldNames.some((field) => {
    const value = body[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}

export function normalizeText(value, maxLength = 2000) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s{3,}/g, "  ")
    .trim()
    .slice(0, maxLength);
}

export function isDisposableOrSuspiciousEmail(email) {
  const normalized = String(email || "").toLowerCase();
  const blockedDomains = [
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "tempmail.com",
    "yopmail.com",
  ];
  return blockedDomains.some((domain) => normalized.endsWith(`@${domain}`));
}

export function isProbablySpamText(value) {
  const text = String(value || "").toLowerCase();
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  const repeatedChars = /(.)\1{12,}/.test(text);
  const spamKeywords = ["casino", "loan", "crypto", "viagra", "porn", "betting"];
  return urlCount > 3 || repeatedChars || spamKeywords.some((word) => text.includes(word));
}
