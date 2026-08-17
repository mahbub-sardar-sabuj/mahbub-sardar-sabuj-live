// api/temp-email-proxy.js — disposable-email provider-এর জন্য same-origin proxy.
// No phone number, SMS, or payment-card data is handled here.
import { checkRateLimit, limitJsonBodySize } from "./_utils/security.js";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (limitJsonBodySize(req, res, 32 * 1024)) return;

  const rate = checkRateLimit(req, res, {
    keyPrefix: "temp-email",
    windowMs: 60_000,
    max: 10,
    message: "ইমেইল সেবায় অনেকবার চেষ্টা করা হয়েছে। অনুগ্রহ করে এক মিনিট পরে আবার চেষ্টা করুন।",
  });
  if (rate.limited) return;

  return handleTempEmailProxy(req, res);
}

// api.mail.gw Cloudflare-এর 502 failure দিচ্ছিল; mail.tm একই documented
// Hydra API contract দেয় এবং production audit-এ active domain list দিয়েছে.
const MAIL_TM_BASE = 'https://api.mail.tm';
const TEMP_EMAIL_TIMEOUT_MS = 10_000;

function getTempEmailBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function isTempEmailString(value, maxLength = 2048) {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

function isTempEmailAddress(value) {
  return isTempEmailString(value, 254) && /^[a-z0-9._-]{3,64}@[a-z0-9.-]{1,190}$/i.test(value);
}

function isTempEmailId(value) {
  return isTempEmailString(value, 64) && /^[a-f0-9]{24}$/i.test(value);
}

async function callTempEmailProvider(path, { method = 'GET', body, token } = {}) {
  // The compatible provider returns Hydra collection objects for this media type; the client uses that shape.
  const headers = { Accept: 'application/ld+json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${MAIL_TM_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(TEMP_EMAIL_TIMEOUT_MS),
  });

  if (response.status === 204) return { status: 204, payload: null };

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }
  return { status: response.status, payload };
}

function sendTempEmailProviderResponse(res, { status, payload }) {
  if (status === 204) return res.status(204).end();
  if (payload && typeof payload === 'object') return res.status(status).json(payload);
  return res.status(status).json({
    error: status >= 500
      ? 'ইমেইল সেবা সাময়িকভাবে অনুপলব্ধ'
      : 'ইমেইল অনুরোধটি সম্পন্ন করা যায়নি',
  });
}

/**
 * Same-origin proxy for a disposable-email API. Only known operations are exposed;
 * callers cannot select a destination URL.
 */
async function handleTempEmailProxy(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, address, password, token, id } = getTempEmailBody(req);

  try {
    switch (action) {
      case 'domains':
        return sendTempEmailProviderResponse(res, await callTempEmailProvider('/domains?page=1'));

      case 'createAccount':
        if (!isTempEmailAddress(address) || !isTempEmailString(password, 128) || password.length < 8) {
          return res.status(400).json({ error: 'অবৈধ ইমেইল ঠিকানা বা পাসওয়ার্ড' });
        }
        return sendTempEmailProviderResponse(
          res,
          await callTempEmailProvider('/accounts', {
            method: 'POST',
            body: { address, password },
          })
        );

      case 'createToken':
        if (!isTempEmailAddress(address) || !isTempEmailString(password, 128) || password.length < 8) {
          return res.status(400).json({ error: 'অবৈধ ইমেইল ঠিকানা বা পাসওয়ার্ড' });
        }
        return sendTempEmailProviderResponse(
          res,
          await callTempEmailProvider('/token', {
            method: 'POST',
            body: { address, password },
          })
        );

      case 'messages':
        if (!isTempEmailString(token)) {
          return res.status(400).json({ error: 'ইমেইল সেশনটি আর সক্রিয় নেই' });
        }
        return sendTempEmailProviderResponse(res, await callTempEmailProvider('/messages?page=1', { token }));

      case 'message':
        if (!isTempEmailString(token) || !isTempEmailId(id)) {
          return res.status(400).json({ error: 'অবৈধ ইমেইল অনুরোধ' });
        }
        return sendTempEmailProviderResponse(res, await callTempEmailProvider(`/messages/${id}`, { token }));

      case 'deleteMessage':
        if (!isTempEmailString(token) || !isTempEmailId(id)) {
          return res.status(400).json({ error: 'অবৈধ ইমেইল অনুরোধ' });
        }
        return sendTempEmailProviderResponse(
          res,
          await callTempEmailProvider(`/messages/${id}`, { method: 'DELETE', token })
        );

      case 'deleteAccount':
        if (!isTempEmailString(token) || !isTempEmailId(id)) {
          return res.status(400).json({ error: 'অবৈধ ইমেইল অনুরোধ' });
        }
        return sendTempEmailProviderResponse(
          res,
          await callTempEmailProvider(`/accounts/${id}`, { method: 'DELETE', token })
        );

      default:
        return res.status(400).json({ error: 'অজানা ইমেইল অনুরোধ' });
    }
  } catch (error) {
    console.error('Temp email proxy failed:', error instanceof Error ? error.message : error);
    return res.status(502).json({ error: 'ইমেইল সেবার সঙ্গে সংযোগ স্থাপন করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।' });
  }
}
