// api/live-chat.js — Telegram-based Live Chat serverless API
// Supports text + image messages in both directions
// Visitor images → Telegram; Admin Telegram images → website via file URL

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// In-memory session contact store
const sessionContacts = {};

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

// Send a photo to Telegram using URL (base64 data URL converted to buffer)
async function sendPhotoToTelegram(base64Data, caption) {
  // base64Data is like "data:image/jpeg;base64,/9j/..."
  const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return { ok: false, error: "Invalid image data" };
  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], "base64");
  const ext = mimeType.split("/")[1] || "jpg";

  // Build multipart form
  const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
  const CRLF = "\r\n";
  const parts = [];

  // chat_id
  parts.push(
    `--${boundary}${CRLF}Content-Disposition: form-data; name="chat_id"${CRLF}${CRLF}${TELEGRAM_ADMIN_CHAT_ID}`
  );
  // caption
  if (caption) {
    parts.push(
      `--${boundary}${CRLF}Content-Disposition: form-data; name="caption"${CRLF}${CRLF}${caption}`
    );
  }

  const headerStr = parts.join(CRLF) + CRLF;
  const fileHeader = `--${boundary}${CRLF}Content-Disposition: form-data; name="photo"; filename="photo.${ext}"${CRLF}Content-Type: ${mimeType}${CRLF}${CRLF}`;
  const footer = `${CRLF}--${boundary}--`;

  const headerBuf = Buffer.from(headerStr, "utf-8");
  const fileHeaderBuf = Buffer.from(fileHeader, "utf-8");
  const footerBuf = Buffer.from(footer, "utf-8");
  const body = Buffer.concat([headerBuf, fileHeaderBuf, buffer, footerBuf]);

  const res = await fetch(`${TELEGRAM_API}/sendPhoto`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": body.length,
    },
    body,
  });
  return res.json();
}

// Get Telegram file URL from file_id
async function getTelegramFileUrl(fileId) {
  const res = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
  const data = await res.json();
  if (!data.ok) return null;
  return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${data.result.file_path}`;
}

async function sendEmailNotification({ visitorName, visitorMessage, adminReply, contact }) {
  const FROM = process.env.CONTACT_EMAIL_FROM;
  const PASS = process.env.GMAIL_APP_PASSWORD;
  if (!FROM || !PASS) return { ok: false, error: "Email not configured" };
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: { user: FROM, pass: PASS },
    });
    await transporter.sendMail({
      from: `"মাহবুব সরদার সবুজ" <${FROM}>`,
      to: contact,
      subject: "মাহবুব সরদার সবুজের উত্তর — mahbubsardarsabuj.com",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #060E1A; color: #FAF6EF; padding: 32px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #D4A843; margin: 0;">মাহবুব সরদার সবুজ</h2>
            <p style="color: rgba(245,238,222,0.6); margin: 4px 0 0; font-size: 14px;">লেখক ও কবি</p>
          </div>
          <p style="color: rgba(245,238,222,0.7);">প্রিয় ${visitorName},</p>
          <div style="background: rgba(212,168,67,0.08); border: 1px solid rgba(212,168,67,0.2); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="color: rgba(245,238,222,0.5); font-size: 12px; margin: 0 0 8px;">আপনার বার্তা:</p>
            <p style="margin: 0; color: rgba(245,238,222,0.8);">${visitorMessage}</p>
          </div>
          <div style="background: rgba(212,168,67,0.15); border: 1px solid rgba(212,168,67,0.4); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #D4A843; font-size: 12px; margin: 0 0 8px; font-weight: bold;">মাহবুব সরদার সবুজের উত্তর:</p>
            <p style="margin: 0; color: #FAF6EF; font-size: 16px;">${adminReply}</p>
          </div>
          <div style="text-align: center;">
            <a href="https://www.mahbubsardarsabuj.com" style="display: inline-block; background: linear-gradient(135deg, #C9A84C, #D4A843); color: #060E1A; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">ওয়েবসাইট ভিজিট করুন</a>
          </div>
          <p style="color: rgba(245,238,222,0.3); font-size: 11px; text-align: center; margin-top: 24px;">
            এই ইমেইল mahbubsardarsabuj.com থেকে পাঠানো হয়েছে।
          </p>
        </div>
      `,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function getRecentUpdates() {
  const res = await fetch(
    `${TELEGRAM_API}/getUpdates?offset=0&limit=100&timeout=0&allowed_updates=["message"]`
  );
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { action } = req.query;

  // ── POST /api/live-chat?action=send ────────────────────────────────────────
  if (req.method === "POST" && action === "send") {
    const { visitorName, message, sessionId, contact, contactType, isSystemMessage, imageData } = req.body;
    if (!visitorName) return res.status(400).json({ error: "Missing visitorName" });

    // Store contact info
    if (contact && sessionId) {
      sessionContacts[sessionId] = { contact, contactType, visitorName };
    }

    // If image, send as photo to Telegram
    if (imageData && sessionId) {
      const stored = sessionContacts[sessionId];
      let contactLine = "";
      if (stored?.contact) {
        if (stored.contactType === "whatsapp") {
          const phone = stored.contact.replace(/\D/g, "");
          contactLine = `\n📱 WhatsApp: +${phone}`;
        } else if (stored.contactType === "gmail") {
          contactLine = `\n📧 Gmail: ${stored.contact}`;
        }
      }
      const caption = `🖼 ছবি পাঠিয়েছেন\n👤 ভিজিটর: ${visitorName}\n🔑 Session: ${sessionId}${contactLine}\n\n↩️ Reply করুন উত্তর দিতে`;
      const result = await sendPhotoToTelegram(imageData, caption);
      if (!result.ok) return res.status(500).json({ error: "Telegram photo error", detail: result });
      return res.status(200).json({ ok: true, messageId: result.result?.message_id });
    }

    if (!message) return res.status(400).json({ error: "Missing message" });

    let text;
    if (isSystemMessage) {
      let contactLine = "";
      if (contact) {
        if (contactType === "whatsapp") {
          const phone = contact.replace(/\D/g, "");
          contactLine = `\n📱 <b>WhatsApp:</b> <a href="https://wa.me/${phone}">${contact}</a>`;
        } else if (contactType === "gmail") {
          contactLine = `\n📧 <b>Gmail:</b> ${contact}`;
        }
      } else {
        contactLine = `\n⚠️ <i>যোগাযোগ মাধ্যম দেননি</i>`;
      }
      text =
        `🟢 <b>নতুন সেশন শুরু হয়েছে</b>\n\n` +
        `👤 <b>ভিজিটর:</b> ${visitorName}\n` +
        `🔑 <b>Session:</b> <code>${sessionId}</code>` +
        contactLine +
        `\n\n↩️ যেকোনো বার্তায় <b>Reply</b> করুন উত্তর দিতে`;
    } else {
      const stored = sessionContacts[sessionId];
      let contactLine = "";
      if (stored?.contact) {
        if (stored.contactType === "whatsapp") {
          const phone = stored.contact.replace(/\D/g, "");
          contactLine = `\n📱 <b>WhatsApp:</b> <a href="https://wa.me/${phone}">${stored.contact}</a>`;
        } else if (stored.contactType === "gmail") {
          contactLine = `\n📧 <b>Gmail:</b> ${stored.contact}`;
        }
      }
      text =
        `💬 <b>লাইভ চ্যাট — নতুন বার্তা</b>\n\n` +
        `👤 <b>ভিজিটর:</b> ${visitorName}\n` +
        `🔑 <b>Session:</b> <code>${sessionId}</code>\n` +
        `📝 <b>বার্তা:</b> ${message}` +
        contactLine +
        `\n\n↩️ এই মেসেজে <b>Reply</b> করুন উত্তর দিতে`;
    }

    const result = await sendToTelegram(text);
    if (!result.ok) return res.status(500).json({ error: "Telegram error", detail: result });
    return res.status(200).json({ ok: true, messageId: result.result?.message_id });
  }

  // ── POST /api/live-chat?action=notify ──────────────────────────────────────
  if (req.method === "POST" && action === "notify") {
    const { sessionId, adminReply, visitorMessage } = req.body;
    if (!sessionId || !adminReply) return res.status(400).json({ error: "Missing fields" });
    const stored = sessionContacts[sessionId];
    if (!stored?.contact) return res.status(200).json({ ok: false, reason: "No contact info" });
    if (stored.contactType === "gmail") {
      const emailResult = await sendEmailNotification({
        visitorName: stored.visitorName,
        visitorMessage: visitorMessage || "(বার্তা পাওয়া যায়নি)",
        adminReply,
        contact: stored.contact,
      });
      return res.status(200).json(emailResult);
    }
    if (stored.contactType === "whatsapp") {
      return res.status(200).json({ ok: true, method: "whatsapp_manual", contact: stored.contact });
    }
    return res.status(200).json({ ok: false, reason: "Unknown contact type" });
  }

  // ── GET /api/live-chat?action=poll ─────────────────────────────────────────
  if (req.method === "GET" && action === "poll") {
    const { sessionId, since } = req.query;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    const sinceTs = since ? parseInt(since) : 0;
    const sinceSec = Math.floor(sinceTs / 1000);
    const updates = await getRecentUpdates();
    if (!updates.ok) return res.status(500).json({ error: "Telegram error", detail: updates });

    const replies = [];
    let lastUpdateId = sinceTs;

    for (const update of updates.result || []) {
      const msg = update.message;
      if (!msg) continue;
      if (msg.chat.id.toString() !== TELEGRAM_ADMIN_CHAT_ID.toString()) continue;
      if (msg.date <= sinceSec) continue;

      const isReplyWithSession =
        msg.reply_to_message &&
        msg.reply_to_message.text &&
        msg.reply_to_message.text.includes(sessionId);
      const isReplyWithSessionCaption =
        msg.reply_to_message &&
        msg.reply_to_message.caption &&
        msg.reply_to_message.caption.includes(sessionId);
      const isDirectWithSession =
        (msg.text && msg.text.includes(sessionId)) ||
        (msg.caption && msg.caption.includes(sessionId));

      if (isReplyWithSession || isReplyWithSessionCaption || isDirectWithSession) {
        // Check if admin replied with a photo
        if (msg.photo && msg.photo.length > 0) {
          // Get the largest photo
          const photo = msg.photo[msg.photo.length - 1];
          const fileUrl = await getTelegramFileUrl(photo.file_id);
          if (fileUrl) {
            replies.push({
              type: "image",
              imageUrl: fileUrl,
              text: msg.caption || "",
              timestamp: msg.date * 1000,
              updateId: msg.date * 1000,
            });
          }
        } else {
          // Text reply
          let replyText = msg.text || "";
          replyText = replyText.replace(new RegExp(`^${sessionId}[:\\s]*`, "i"), "").trim();
          if (!replyText) replyText = msg.text || "";
          replies.push({
            type: "text",
            text: replyText,
            timestamp: msg.date * 1000,
            updateId: msg.date * 1000,
          });
        }

        if (msg.date * 1000 > lastUpdateId) {
          lastUpdateId = msg.date * 1000;
        }
      }
    }

    return res.status(200).json({ ok: true, replies, lastUpdateId });
  }

  return res.status(404).json({ error: "Unknown action" });
}
