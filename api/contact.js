import {
  checkRateLimit,
  hasHoneypotValue,
  isDisposableOrSuspiciousEmail,
  isProbablySpamText,
  limitJsonBodySize,
  normalizeText,
} from "./_utils/security.js";

/**
 * Contact Form API — Vercel Serverless Function
 * POST /api/contact
 * Receives form data and sends email via Gmail SMTP (Nodemailer)
 * or falls back to storing in a simple log if email is not configured.
 *
 * Required Environment Variables (set in Vercel Dashboard):
 *   CONTACT_EMAIL_TO   — recipient email (e.g. lekhokmahbubsardarsabuj@gmail.com)
 *   CONTACT_EMAIL_FROM — sender email (Gmail address)
 *   GMAIL_APP_PASSWORD — Gmail App Password (16-char, no spaces)
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://www.mahbubsardarsabuj.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  if (limitJsonBodySize(req, res, 128 * 1024)) return;

  const rate = checkRateLimit(req, res, {
    keyPrefix: "contact",
    windowMs: 15 * 60 * 1000,
    max: 5,
  });
  if (rate.limited) return;

  try {
    if (hasHoneypotValue(req.body, ["website", "company", "url", "homepage"])) {
      console.warn(`[CONTACT FORM] Honeypot blocked request from ${rate.clientIp}`);
      return res.status(200).json({
        success: true,
        message: "বার্তা সফলভাবে পাঠানো হয়েছে। শীঘ্রই উত্তর দেওয়া হবে।",
      });
    }

    const { name, email, subject, message } = req.body || {};

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "নাম, ইমেইল এবং বার্তা আবশ্যক।" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || isDisposableOrSuspiciousEmail(email)) {
      return res.status(400).json({ success: false, error: "সঠিক ইমেইল ঠিকানা দিন।" });
    }

    // Sanitize inputs (basic XSS prevention)
    const safeName = normalizeText(name, 120);
    const safeEmail = normalizeText(email, 254);
    const safeSubject = normalizeText(subject || "ওয়েবসাইট থেকে বার্তা", 180);
    const safeMessage = normalizeText(message, 3000);

    if (safeName.length < 2 || safeMessage.length < 10) {
      return res.status(400).json({ success: false, error: "নাম এবং বার্তা আরও বিস্তারিতভাবে লিখুন।" });
    }

    if (isProbablySpamText(`${safeSubject}\n${safeMessage}`)) {
      console.warn(`[CONTACT FORM] Spam-like message blocked from ${rate.clientIp}`);
      return res.status(400).json({ success: false, error: "বার্তাটি গ্রহণ করা যায়নি। অনুগ্রহ করে স্বাভাবিক বার্তা লিখুন।" });
    }

    const TO = process.env.CONTACT_EMAIL_TO || "lekhokmahbubsardarsabuj@gmail.com";
    const FROM = process.env.CONTACT_EMAIL_FROM;
    const PASS = process.env.GMAIL_APP_PASSWORD;

    // Telegram notification (primary fallback)
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

    // Try Telegram first (always available if configured)
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_ADMIN_CHAT_ID) {
      try {
        const telegramText = `📩 <b>নতুন বার্তা — mahbubsardarsabuj.com</b>\n\n👤 <b>নাম:</b> ${safeName}\n📧 <b>ইমেইল:</b> ${safeEmail}\n📌 <b>বিষয়:</b> ${safeSubject}\n\n💬 <b>বার্তা:</b>\n${safeMessage.slice(0, 3000)}`;
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_ADMIN_CHAT_ID,
            text: telegramText,
            parse_mode: "HTML",
          }),
        });
      } catch (telegramErr) {
        console.warn("[CONTACT FORM] Telegram notification failed:", telegramErr.message);
      }
    }

    if (FROM && PASS) {
      // Send via Nodemailer + Gmail SMTP
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.default.createTransport({
          service: "gmail",
          auth: { user: FROM, pass: PASS },
        });

        await transporter.sendMail({
          from: `"${safeName}" <${FROM}>`,
          to: TO,
          replyTo: safeEmail,
          subject: `[mahbubsardarsabuj.com] ${safeSubject}`,
          text: `নাম: ${safeName}\nইমেইল: ${safeEmail}\nবিষয়: ${safeSubject}\n\n${safeMessage}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
              <h2 style="color: #C9A84C; border-bottom: 2px solid #C9A84C; padding-bottom: 10px;">নতুন বার্তা — mahbubsardarsabuj.com</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; font-weight: bold; color: #333; width: 100px;">নাম:</td><td style="padding: 8px; color: #555;">${safeName}</td></tr>
                <tr style="background: #fff;"><td style="padding: 8px; font-weight: bold; color: #333;">ইমেইল:</td><td style="padding: 8px;"><a href="mailto:${safeEmail}" style="color: #C9A84C;">${safeEmail}</a></td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #333;">বিষয়:</td><td style="padding: 8px; color: #555;">${safeSubject}</td></tr>
              </table>
              <div style="margin-top: 20px; padding: 15px; background: #fff; border-left: 4px solid #C9A84C; border-radius: 5px;">
                <p style="color: #333; line-height: 1.8; margin: 0; white-space: pre-wrap;">${safeMessage}</p>
              </div>
              <p style="color: #999; font-size: 12px; margin-top: 20px;">এই বার্তাটি mahbubsardarsabuj.com এর যোগাযোগ ফর্ম থেকে পাঠানো হয়েছে।</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("[CONTACT FORM] Email send failed:", emailErr.message);
        // Email failed but Telegram may have succeeded — still return success
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) {
          throw emailErr;
        }
      }
    }

    // Log to Vercel logs always
    console.log(`[CONTACT FORM] From: ${safeName} <${safeEmail}> | Subject: ${safeSubject} | IP: ${rate.clientIp}`);
    return res.status(200).json({
      success: true,
      message: "বার্তা সফলভাবে পাঠানো হয়েছে। শীঘ্রই উত্তর দেওয়া হবে।",
    });
  } catch (err) {
    console.error("[CONTACT FORM ERROR]", err);
    return res.status(500).json({ success: false, error: "বার্তা পাঠাতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" });
  }
}
