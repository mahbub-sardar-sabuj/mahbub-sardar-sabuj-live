// api/live-chat.js — Telegram-based Live Chat serverless API
// Visitor messages go to Telegram; admin replies via Telegram Reply
// Poll fetches ALL recent updates and filters by sessionId

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

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

// Fetch last N updates without consuming them (offset=0 always)
async function getRecentUpdates() {
  // Use a large negative offset trick: fetch last 100 updates
  // We never advance the offset so updates stay available
  const res = await fetch(
    `${TELEGRAM_API}/getUpdates?offset=0&limit=100&timeout=0&allowed_updates=["message"]`
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
    const { visitorName, message, sessionId, isSystemMessage } = req.body;

    if (!message || !visitorName) {
      return res.status(400).json({ error: "Missing fields" });
    }

    let text;
    if (isSystemMessage) {
      text =
        `🟢 <b>নতুন সেশন শুরু হয়েছে</b>\n\n` +
        `👤 <b>ভিজিটর:</b> ${visitorName}\n` +
        `🔑 <b>Session:</b> <code>${sessionId}</code>\n\n` +
        `↩️ যেকোনো বার্তায় <b>Reply</b> করুন উত্তর দিতে\n` +
        `<i>(Reply-তে Session ID থাকলে ভিজিটর উত্তর পাবে)</i>`;
    } else {
      text =
        `💬 <b>লাইভ চ্যাট — নতুন বার্তা</b>\n\n` +
        `👤 <b>ভিজিটর:</b> ${visitorName}\n` +
        `🔑 <b>Session:</b> <code>${sessionId}</code>\n` +
        `📝 <b>বার্তা:</b> ${message}\n\n` +
        `↩️ এই মেসেজে <b>Reply</b> করুন উত্তর দিতে`;
    }

    const result = await sendToTelegram(text);

    if (!result.ok) {
      return res.status(500).json({ error: "Telegram error", detail: result });
    }

    return res.status(200).json({
      ok: true,
      messageId: result.result?.message_id,
    });
  }

  // GET /api/live-chat?action=poll&sessionId=xxx&since=<unix_timestamp_ms>
  // Visitor polls for replies from admin
  if (req.method === "GET" && action === "poll") {
    const { sessionId, since } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    const sinceTs = since ? parseInt(since) : 0;
    // Convert ms to seconds for Telegram date comparison
    const sinceSec = Math.floor(sinceTs / 1000);

    const updates = await getRecentUpdates();

    if (!updates.ok) {
      return res.status(500).json({ error: "Telegram error", detail: updates });
    }

    const replies = [];
    let lastUpdateId = sinceTs;

    for (const update of updates.result || []) {
      const msg = update.message;
      if (!msg) continue;

      // Only messages from admin chat
      if (msg.chat.id.toString() !== TELEGRAM_ADMIN_CHAT_ID.toString()) continue;

      // Only messages newer than since
      if (msg.date <= sinceSec) continue;

      // Check if this is a reply to a message containing our sessionId
      const isReplyWithSession =
        msg.reply_to_message &&
        msg.reply_to_message.text &&
        msg.reply_to_message.text.includes(sessionId);

      // Also accept direct messages containing the sessionId (for convenience)
      const isDirectWithSession =
        msg.text && msg.text.includes(sessionId);

      if (isReplyWithSession || isDirectWithSession) {
        // Extract just the reply text (remove sessionId if it was a direct message)
        let replyText = msg.text || "";
        // If direct message with sessionId prefix like "LB8P77CE: হ্যালো", strip it
        replyText = replyText.replace(new RegExp(`^${sessionId}[:\\s]*`, "i"), "").trim();
        if (!replyText) replyText = msg.text || "";

        replies.push({
          text: replyText,
          timestamp: msg.date * 1000,
          updateId: msg.date * 1000, // use timestamp as unique id
        });

        if (msg.date * 1000 > lastUpdateId) {
          lastUpdateId = msg.date * 1000;
        }
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
