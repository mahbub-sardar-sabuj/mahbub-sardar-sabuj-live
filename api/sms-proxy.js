// api/sms-proxy.js — সার্ভার-সাইড প্রক্সি (CORS সমস্যা সমাধান + JSON পার্সিং)
// Node.js 18+ এ native fetch আছে, তাই আলাদা import দরকার নেই

export default async function handler(req, res) {
  if (req.query?.service === 'temp-email') {
    return handleTempEmailProxy(req, res);
  }

  const { country, number } = req.query;

  if (!country || !number) {
    return res.status(400).json({ error: 'Country and number are required' });
  }

  const targetUrl = `https://receive-smss.live/sms/${country}/${number}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://receive-smss.live/',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Source site returned ${response.status}`);
    }

    const html = await response.text();

    // ✅ নতুন পার্সিং: data-message-* attributes থেকে সরাসরি JSON তৈরি
    const messages = parseMessagesFromHtml(html);

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json({ messages, count: messages.length });
  } catch (error) {
    console.error('SMS Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to fetch SMS data', messages: [] });
  }
}

/**
 * receive-smss.live এর HTML থেকে message data extract করে।
 * Attributes যেকোনো ক্রমে থাকতে পারে, তাই প্রতিটি আলাদাভাবে extract করা হচ্ছে।
 */
function parseMessagesFromHtml(html) {
  const messages = [];
  const seen = new Set();

  // Strategy 1: data-message-id দিয়ে সব entry খুঁজে, তারপর আশেপাশে অন্য attributes খোঁজা
  const idRegex = /data-message-id="(\d+)"/g;
  let idMatch;
  while ((idMatch = idRegex.exec(html)) !== null) {
    const id = idMatch[1];
    if (seen.has(id)) continue;

    // id-এর আশেপাশের ৬০০ character-এ অন্য attributes খোঁজা
    const startPos = Math.max(0, idMatch.index - 100);
    const endPos = Math.min(html.length, idMatch.index + 600);
    const chunk = html.slice(startPos, endPos);

    const bodyMatch = chunk.match(/data-message-body="((?:[^"\\]|\\.)*)"/);
    const fromMatch = chunk.match(/data-message-from="([^"]*)"/);
    const timeMatch = chunk.match(/data-message-time="(\d+)"/);

    if (!bodyMatch) continue;

    const body = decodeHtmlEntities(bodyMatch[1]);
    const from = fromMatch ? decodeHtmlEntities(fromMatch[1]) : 'Unknown';
    const timestamp = timeMatch ? parseInt(timeMatch[1], 10) : 0;

    if (body && body.length > 1) {
      seen.add(id);
      messages.push({
        sender: from || 'Unknown',
        message: body,
        time: formatTimestamp(timestamp),
      });
    }
  }

  // Strategy 2: পুরনো .message-row structure (ফলব্যাক)
  if (messages.length === 0) {
    const rowRegex = /<div[^>]+class="[^"]*message-row[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g;
    let match;
    while ((match = rowRegex.exec(html)) !== null) {
      const rowHtml = match[1];
      const bodyMatch = rowHtml.match(/class="[^"]*message-body[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      const senderMatch = rowHtml.match(/class="[^"]*(?:truncate|font-black)[^"]*"[^>]*>([\s\S]*?)<\/span>/);
      const timeMatch = rowHtml.match(/class="[^"]*(?:text-gray-400|whitespace-nowrap)[^"]*"[^>]*>([\s\S]*?)<\/span>/);

      if (bodyMatch) {
        const body = stripHtml(bodyMatch[1]).trim();
        if (body.length > 2) {
          messages.push({
            sender: senderMatch ? stripHtml(senderMatch[1]).trim() : 'System',
            message: body,
            time: timeMatch ? stripHtml(timeMatch[1]).trim() : 'Recently',
          });
        }
      }
    }
  }

  // Strategy 3: table rows (শেষ ফলব্যাক)
  if (messages.length === 0) {
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    let match;
    while ((match = trRegex.exec(html)) !== null) {
      const cells = [];
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
      let tdMatch;
      while ((tdMatch = tdRegex.exec(match[1])) !== null) {
        cells.push(stripHtml(tdMatch[1]).trim());
      }
      if (cells.length >= 2 && cells[1].length > 2) {
        messages.push({
          sender: cells[0] || 'Sender',
          message: cells[1],
          time: cells[2] || 'Recently',
        });
      }
    }
  }

  // Deduplicate by message content
  const unique = messages.filter((m, i, arr) =>
    m.message.length > 2 && arr.findIndex(t => t.message === m.message) === i
  );

  return unique.slice(0, 30);
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '');
}

function stripHtml(str) {
  return str.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function formatTimestamp(unix) {
  if (!unix || isNaN(unix)) return 'Recently';
  const date = new Date(unix * 1000);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'এইমাত্র';
  if (diffMin < 60) return `${diffMin} মিনিট আগে`;
  if (diffHr < 24) return `${diffHr} ঘণ্টা আগে`;
  return `${diffDay} দিন আগে`;
}


const MAIL_TM_BASE = 'https://api.mail.gw';
const TEMP_EMAIL_TIMEOUT_MS = 12_000;

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
