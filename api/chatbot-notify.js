import {
  checkRateLimit,
  getClientIp,
  limitJsonBodySize,
} from "./_utils/security.js";

function escapeTelegramHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function truncateTelegramText(value = "", maxLength = 3200) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 20) + "\n…[truncated]";
}

function sanitizeFilename(value = "file.bin") {
  return String(value || "file.bin")
    .replace(/[\\/\0\r\n]/g, "_")
    .slice(0, 120) || "file.bin";
}

function normalizeBase64Payload(data = "") {
  const text = String(data || "");
  const dataUrlMatch = text.match(/^data:([^;]+);base64,(.+)$/s);
  if (dataUrlMatch) {
    return { mimeType: dataUrlMatch[1], base64: dataUrlMatch[2] };
  }
  return { mimeType: null, base64: text };
}

function createMultipartBody(fields, fileField) {
  const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
  const CRLF = "\r\n";
  const chunks = [];

  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === "") continue;
    chunks.push(Buffer.from(
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}` +
      `${value}${CRLF}`,
      "utf-8"
    ));
  }

  chunks.push(Buffer.from(
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="${fileField.fieldName}"; filename="${sanitizeFilename(fileField.filename)}"${CRLF}` +
    `Content-Type: ${fileField.mimeType || "application/octet-stream"}${CRLF}${CRLF}`,
    "utf-8"
  ));
  chunks.push(fileField.buffer);
  chunks.push(Buffer.from(`${CRLF}--${boundary}--`, "utf-8"));

  return { boundary, body: Buffer.concat(chunks) };
}

async function sendTelegramMessage(botToken, adminChatId, text) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: adminChatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok === false) {
    throw new Error(result.description || `Telegram sendMessage failed: ${response.status}`);
  }
  return result;
}

async function sendTelegramFile(botToken, adminChatId, method, fieldName, fileData, options = {}) {
  const { mimeType: detectedMime, base64 } = normalizeBase64Payload(fileData);
  if (!base64) return { ok: false, skipped: true, reason: "empty_file" };

  const buffer = Buffer.from(base64, "base64");
  if (!buffer.length) return { ok: false, skipped: true, reason: "empty_buffer" };

  // Keep this conservative because Vercel request/response limits are already small for chatbot uploads.
  const maxTelegramUploadBytes = 9 * 1024 * 1024;
  if (buffer.length > maxTelegramUploadBytes) {
    return { ok: false, skipped: true, reason: "file_too_large", size: buffer.length };
  }

  const { boundary, body } = createMultipartBody({
    chat_id: adminChatId,
    caption: truncateTelegramText(options.caption || "", 1000),
    parse_mode: options.caption ? "HTML" : undefined,
  }, {
    fieldName,
    filename: options.filename || "chatbot-file.bin",
    mimeType: options.mimeType || detectedMime || "application/octet-stream",
    buffer,
  });

  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok === false) {
    throw new Error(result.description || `Telegram ${method} failed: ${response.status}`);
  }
  return result;
}

function buildActivityText(payload, req) {
  const title = payload.title || "AI Chatbot Activity";
  const lines = [
    `🤖 <b>${escapeTelegramHtml(title)}</b>`,
    "",
    `<b>Type:</b> ${escapeTelegramHtml(payload.type || "chatbot_activity")}`,
  ];

  if (payload.userMessage) {
    lines.push("", `<b>Visitor:</b> ${escapeTelegramHtml(truncateTelegramText(payload.userMessage, 1200))}`);
  }
  if (payload.aiResponse) {
    lines.push("", `<b>AI/System Reply:</b> ${escapeTelegramHtml(truncateTelegramText(payload.aiResponse, 1500))}`);
  }
  if (payload.audioFilename) {
    lines.push("", `<b>Original Audio:</b> ${escapeTelegramHtml(payload.audioFilename)}`);
  }
  if (payload.editedAudioFilename) {
    lines.push(`<b>Edited Audio:</b> ${escapeTelegramHtml(payload.editedAudioFilename)}`);
  }
  if (payload.metadata && typeof payload.metadata === "object") {
    const metadataText = Object.entries(payload.metadata)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
      .join("\n");
    if (metadataText) {
      lines.push("", `<b>Details:</b>\n${escapeTelegramHtml(truncateTelegramText(metadataText, 900))}`);
    }
  }

  const clientIp = getClientIp(req);
  lines.push(
    "",
    `<b>IP:</b> ${escapeTelegramHtml(clientIp)}`,
    `<b>User Agent:</b> ${escapeTelegramHtml(truncateTelegramText(req.headers["user-agent"] || "unknown", 350))}`,
    `<b>Time:</b> ${escapeTelegramHtml(new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" }))}`
  );

  return lines.join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (limitJsonBodySize(req, res, 7 * 1024 * 1024)) return;

  const rate = checkRateLimit(req, res, {
    keyPrefix: "chatbot-notify",
    windowMs: 60 * 1000,
    max: 20,
  });
  if (rate.limited) return;

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
  if (!botToken || !adminChatId) {
    console.warn("Chatbot Telegram notification skipped: Telegram env variables are missing.");
    return res.status(200).json({ ok: false, skipped: true, reason: "missing_env" });
  }

  try {
    const payload = req.body || {};
    const text = buildActivityText(payload, req);
    const results = [];

    results.push(await sendTelegramMessage(botToken, adminChatId, text));

    if (payload.imageData) {
      results.push(await sendTelegramFile(botToken, adminChatId, "sendPhoto", "photo", payload.imageData, {
        filename: payload.imageFilename || "chatbot-image.jpg",
        mimeType: payload.imageMime || "image/jpeg",
        caption: `🤖 <b>Chatbot Image Attachment</b>\n${escapeTelegramHtml(truncateTelegramText(payload.userMessage || payload.title || "", 700))}`,
      }));
    }

    if (payload.audioData) {
      results.push(await sendTelegramFile(botToken, adminChatId, "sendDocument", "document", payload.audioData, {
        filename: payload.audioFilename || "original-audio.wav",
        mimeType: payload.audioMime || "audio/wav",
        caption: `🎵 <b>Original Audio</b>\n${escapeTelegramHtml(truncateTelegramText(payload.userMessage || "", 700))}`,
      }));
    }

    if (payload.editedAudioData) {
      results.push(await sendTelegramFile(botToken, adminChatId, "sendDocument", "document", payload.editedAudioData, {
        filename: payload.editedAudioFilename || "edited-audio.wav",
        mimeType: payload.editedAudioMime || "audio/wav",
        caption: `✅ <b>Edited Audio Output</b>\n${escapeTelegramHtml(truncateTelegramText(payload.aiResponse || "অডিও প্রসেসিং সম্পন্ন হয়েছে।", 700))}`,
      }));
    }

    return res.status(200).json({ ok: true, results });
  } catch (error) {
    console.error("Chatbot Telegram notification failed:", error);
    return res.status(500).json({ ok: false, error: error?.message || String(error) });
  }
}
