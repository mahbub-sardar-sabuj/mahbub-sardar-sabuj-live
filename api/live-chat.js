// api/live-chat.js — Telegram-based Live Chat serverless API
// Visitor messages go to Telegram, replies come back via webhook polling

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// In-memory store for replies (per serverless instance, short-lived)
// We use Telegram message_id as session key
// For production persistence, replies are fetched from Telegram getUpdates

async function sendToTelegram(text) {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_ADMIN_CHAT_ID,
      text,
      parse_mode: "HTML",
    }),
  });
  return res.json();
}

async function getUpdates(offset) {
  const res = await fetch(
    `${TELEGRAM_API}/getUpdates?offset=${offset || 0}&limit=100&timeout=0`
  );
  return res.json();
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { action } = req.query;

  // POST /api/live-chat?action=send — visitor sends a message
  if (req.method === "POST" && action === "send") {
    const { visitorName, message, sessionId } = req.body;

    if (!message || !visitorName) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const text =
      `💬 <b>লাইভ চ্যাট — নতুন বার্তা</b>\n\n` +
      `👤 <b>ভিজিটর:</b> ${visitorName}\n` +
      `🔑 <b>Session:</b> <code>${sessionId}</code>\n` +
      `📝 <b>বার্তা:</b> ${message}\n\n` +
      `↩️ এই মেসেজে <b>Reply</b> করুন উত্তর দিতে`;

    const result = await sendToTelegram(text);

    if (!result.ok) {
      return res.status(500).json({ error: "Telegram error", detail: result });
    }

    return res.status(200).json({
      ok: true,
      messageId: result.result.message_id,
    });
  }

  // GET /api/live-chat?action=poll&sessionId=xxx&since=<update_id>
  // Visitor polls for replies from admin
  if (req.method === "GET" && action === "poll") {
    const { sessionId, since } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    const offset = since ? parseInt(since) + 1 : 0;
    const updates = await getUpdates(offset);

    if (!updates.ok) {
      return res.status(500).json({ error: "Telegram error" });
    }

    // Find replies that contain the sessionId in the replied-to message
    const replies = [];
    let lastUpdateId = since ? parseInt(since) : 0;

    for (const update of updates.result || []) {
      if (update.update_id > lastUpdateId) {
        lastUpdateId = update.update_id;
      }

      const msg = update.message;
      if (!msg) continue;

      // Check if this is a reply to a message containing our sessionId
      if (
        msg.reply_to_message &&
        msg.reply_to_message.text &&
        msg.reply_to_message.text.includes(sessionId) &&
        msg.chat.id.toString() === TELEGRAM_ADMIN_CHAT_ID
      ) {
        replies.push({
          text: msg.text,
          timestamp: msg.date * 1000,
          updateId: update.update_id,
        });
      }
    }

    return res.status(200).json({
      ok: true,
      replies,
      lastUpdateId,
    });
  }

  return res.status(404).json({ error: "Unknown action" });
}
