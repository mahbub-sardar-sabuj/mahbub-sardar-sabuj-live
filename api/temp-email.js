const MAIL_TM_BASE = "https://api.mail.tm";
const REQUEST_TIMEOUT_MS = 12_000;

function getBody(req) {
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

function isNonEmptyString(value, maxLength = 2048) {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

function isEmailAddress(value) {
  return isNonEmptyString(value, 254) && /^[a-z0-9._-]{3,64}@[a-z0-9.-]{1,190}$/i.test(value);
}

function isMailTmId(value) {
  return isNonEmptyString(value, 64) && /^[a-f0-9]{24}$/i.test(value);
}

function providerErrorPayload(status, payload) {
  if (payload && typeof payload === "object") return payload;
  return {
    error: status >= 500 ? "ইমেইল সেবা সাময়িকভাবে অনুপলব্ধ" : "ইমেইল অনুরোধটি সম্পন্ন করা যায়নি",
  };
}

async function callMailTm(path, { method = "GET", body, token } = {}) {
  // mail.tm returns Hydra collection objects for this media type; the client uses that shape.
  const headers = { Accept: "application/ld+json" };
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${MAIL_TM_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (response.status === 204) {
    return { status: response.status, payload: null };
  }

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  return { status: response.status, payload };
}

function sendProviderResponse(res, { status, payload }) {
  if (status === 204) return res.status(204).end();
  return res.status(status).json(providerErrorPayload(status, payload));
}

/**
 * Same-origin proxy for the mail.tm API.
 * Only the required mail operations are exposed; callers cannot supply a URL.
 */
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, address, password, token, id } = getBody(req);

  try {
    switch (action) {
      case "domains":
        return sendProviderResponse(res, await callMailTm("/domains?page=1"));

      case "createAccount":
        if (!isEmailAddress(address) || !isNonEmptyString(password, 128) || password.length < 8) {
          return res.status(400).json({ error: "অবৈধ ইমেইল ঠিকানা বা পাসওয়ার্ড" });
        }
        return sendProviderResponse(
          res,
          await callMailTm("/accounts", {
            method: "POST",
            body: { address, password },
          })
        );

      case "createToken":
        if (!isEmailAddress(address) || !isNonEmptyString(password, 128) || password.length < 8) {
          return res.status(400).json({ error: "অবৈধ ইমেইল ঠিকানা বা পাসওয়ার্ড" });
        }
        return sendProviderResponse(
          res,
          await callMailTm("/token", {
            method: "POST",
            body: { address, password },
          })
        );

      case "messages":
        if (!isNonEmptyString(token)) {
          return res.status(400).json({ error: "ইমেইল সেশনটি আর সক্রিয় নেই" });
        }
        return sendProviderResponse(res, await callMailTm("/messages?page=1", { token }));

      case "message":
        if (!isNonEmptyString(token) || !isMailTmId(id)) {
          return res.status(400).json({ error: "অবৈধ ইমেইল অনুরোধ" });
        }
        return sendProviderResponse(res, await callMailTm(`/messages/${id}`, { token }));

      case "deleteMessage":
        if (!isNonEmptyString(token) || !isMailTmId(id)) {
          return res.status(400).json({ error: "অবৈধ ইমেইল অনুরোধ" });
        }
        return sendProviderResponse(
          res,
          await callMailTm(`/messages/${id}`, { method: "DELETE", token })
        );

      case "deleteAccount":
        if (!isNonEmptyString(token) || !isMailTmId(id)) {
          return res.status(400).json({ error: "অবৈধ ইমেইল অনুরোধ" });
        }
        return sendProviderResponse(
          res,
          await callMailTm(`/accounts/${id}`, { method: "DELETE", token })
        );

      default:
        return res.status(400).json({ error: "অজানা ইমেইল অনুরোধ" });
    }
  } catch (error) {
    console.error("Temp email proxy failed:", error instanceof Error ? error.message : error);
    return res.status(502).json({ error: "ইমেইল সেবার সঙ্গে সংযোগ স্থাপন করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।" });
  }
}
