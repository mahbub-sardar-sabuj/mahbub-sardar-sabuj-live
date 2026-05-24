/**
 * Contact & Newsletter API Route
 * POST /api/contact  — sends a contact form message via Telegram notification
 * POST /api/newsletter — stores newsletter subscriber email
 */

import type { Express, Request, Response } from "express";
import { ENV } from "./_core/env";

const TELEGRAM_API = `https://api.telegram.org/bot${ENV.telegramBotToken}`;

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

async function sendTelegramMessage(text: string): Promise<void> {
  if (!ENV.telegramBotToken || !ENV.telegramAdminChatId) {
    console.warn("[Contact] Telegram not configured — skipping notification");
    return;
  }
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ENV.telegramAdminChatId,
        text,
        parse_mode: "Markdown",
      }),
    });
    const data = await res.json() as { ok: boolean; description?: string };
    if (!data.ok) {
      console.error("[Contact] Telegram sendMessage failed:", data.description);
    }
  } catch (err) {
    console.error("[Contact] Telegram sendMessage error:", err);
  }
}

// In-memory newsletter store (persists as long as server is running)
// For production, this should be moved to the database
const newsletterSubscribers = new Set<string>();

export function registerContactRoute(app: Express) {
  // ── Contact Form ────────────────────────────────────────────────────────────
  app.post("/api/contact", async (req: Request, res: Response) => {
    const { name, email, subject, message, website } = req.body || {};

    // Honeypot check (spam bots fill the hidden "website" field)
    if (website) {
      res.json({ success: true }); // silently discard
      return;
    }

    // Validate required fields
    if (!name || !email || !message) {
      res.status(400).json({ error: "নাম, ইমেইল এবং বার্তা প্রয়োজন।" });
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "সঠিক ইমেইল ঠিকানা দিন।" });
      return;
    }

    // Sanitize inputs
    const safeName = String(name).slice(0, 120).trim();
    const safeEmail = String(email).slice(0, 320).trim().toLowerCase();
    const safeSubject = subject ? String(subject).slice(0, 200).trim() : "কোনো বিষয় নেই";
    const safeMessage = String(message).slice(0, 2000).trim();

    // Check if this is a newsletter subscription (from Footer)
    const isNewsletter = safeSubject === "নিউজলেটার সাবস্ক্রিপশন";

    if (isNewsletter) {
      newsletterSubscribers.add(safeEmail);
      const text =
        `📧 *নতুন নিউজলেটার সাবস্ক্রাইবার*\n\n` +
        `👤 *নাম:* ${escapeMarkdown(safeName)}\n` +
        `📩 *ইমেইল:* ${escapeMarkdown(safeEmail)}\n` +
        `📊 *মোট সাবস্ক্রাইবার:* ${newsletterSubscribers.size}`;
      await sendTelegramMessage(text);
    } else {
      const text =
        `📬 *নতুন যোগাযোগ বার্তা — ওয়েবসাইট*\n\n` +
        `👤 *নাম:* ${escapeMarkdown(safeName)}\n` +
        `📩 *ইমেইল:* ${escapeMarkdown(safeEmail)}\n` +
        `📌 *বিষয়:* ${escapeMarkdown(safeSubject)}\n\n` +
        `💬 *বার্তা:*\n${escapeMarkdown(safeMessage)}`;
      await sendTelegramMessage(text);
    }

    res.json({ success: true, message: "বার্তা সফলভাবে পাঠানো হয়েছে।" });
  });

  // ── Newsletter Subscriber Count (admin use) ─────────────────────────────────
  app.get("/api/newsletter/count", (_req: Request, res: Response) => {
    res.json({ count: newsletterSubscribers.size });
  });
}
