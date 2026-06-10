import { checkRateLimit, limitJsonBodySize } from "./_utils/security.js";

function escapeTelegramHtml(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function truncateTelegramText(value = "", maxLength = 3200) {
  const text = String(value || "").trim();
  return text.length <= maxLength ? text : text.slice(0, maxLength - 20) + "\n…[truncated]";
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  if (chunks.length === 0) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return {}; }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (limitJsonBodySize(req, res, 512 * 1024)) return;

  const rate = checkRateLimit(req, res, { keyPrefix: "chatbot-notify", windowMs: 60 * 1000, max: 20 });
  if (rate.limited) return;

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
  if (!botToken || !adminChatId) {
    return res.status(200).json({ ok: false, skipped: true, reason: "missing_env" });
  }

  const payload = await readJsonBody(req);
  const title = payload.title || "AI Chatbot Activity";
  const lines = [
    `🤖 <b>${escapeTelegramHtml(title)}</b>`,
    "",
    `<b>Type:</b> ${escapeTelegramHtml(payload.type || "chatbot_activity")}`,
  ];
  if (payload.userMessage) lines.push("", `<b>Visitor:</b> ${escapeTelegramHtml(truncateTelegramText(payload.userMessage, 1200))}`);
  if (payload.aiResponse) lines.push("", `<b>AI Reply:</b> ${escapeTelegramHtml(truncateTelegramText(payload.aiResponse, 1500))}`);
  lines.push(
    "",
    `<b>IP:</b> ${escapeTelegramHtml(rate.clientIp || "unknown")}`,
    `<b>Time:</b> ${escapeTelegramHtml(new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" }))}`,
  );

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: adminChatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok === false) {
      throw new Error(result.description || `Telegram failed: ${response.status}`);
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Chatbot notify failed:", error);
    return res.status(500).json({ ok: false, error: error?.message || String(error) });
  }
}
