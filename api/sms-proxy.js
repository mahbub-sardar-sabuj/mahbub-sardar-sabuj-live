// api/sms-proxy.js — সার্ভার-সাইড প্রক্সি (CORS সমস্যা সমাধান + JSON পার্সিং)
// Node.js 18+ এ native fetch আছে, তাই আলাদা import দরকার নেই

export default async function handler(req, res) {
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
      },
      timeout: 15000,
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
 * নতুন structure: data-message-id, data-message-body, data-message-from, data-message-time attributes ব্যবহার করে।
 */
function parseMessagesFromHtml(html) {
  const messages = [];
  const seen = new Set();

  // Strategy 1: data-message-* attributes (নতুন structure)
  const dataAttrRegex = /data-message-id="(\d+)"[^>]*?data-message-body="((?:[^"\\]|\\.|&#[^;]+;)*)"[^>]*?data-message-from="([^"]*)"[^>]*?data-message-time="(\d+)"/gs;
  let match;
  while ((match = dataAttrRegex.exec(html)) !== null) {
    const id = match[1];
    if (seen.has(id)) continue;
    seen.add(id);

    const body = decodeHtmlEntities(match[2]);
    const from = decodeHtmlEntities(match[3]);
    const timestamp = parseInt(match[4], 10);

    if (body && body.length > 1) {
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
