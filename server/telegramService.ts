/**
 * Telegram Bot Service
 * - Sends visitor messages as notifications to admin's Telegram
 * - Handles admin replies from Telegram → stores in DB → visitor sees in chat
 *
 * Bot: @MahbubLiveChat_bot
 * Token: stored in TELEGRAM_BOT_TOKEN env var
 * Admin Chat ID: stored in TELEGRAM_ADMIN_CHAT_ID env var
 */
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { liveChatMessages, liveChatSessions } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

const TELEGRAM_API = `https://api.telegram.org/bot${ENV.telegramBotToken}`;

// ── Send a message to admin via Telegram ─────────────────────────────────────
export async function sendTelegramNotification(opts: {
  sessionId: string;
  visitorName: string;
  message: string;
}): Promise<void> {
  if (!ENV.telegramBotToken || !ENV.telegramAdminChatId) {
    console.warn("[Telegram] Bot token or admin chat ID not configured");
    return;
  }

  const text =
    `💬 *নতুন বার্তা — লাইভ চ্যাট*\n\n` +
    `👤 *ভিজিটর:* ${escapeMarkdown(opts.visitorName)}\n` +
    `🔑 *Session:* \`${opts.sessionId}\`\n\n` +
    `📝 *বার্তা:*\n${escapeMarkdown(opts.message)}\n\n` +
    `↩️ *রিপ্লাই দিতে:* এই মেসেজের Reply করুন`;

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
      console.error("[Telegram] sendMessage failed:", data.description);
    }
  } catch (err) {
    console.error("[Telegram] sendMessage error:", err);
  }
}

// ── Send a session-closed notification ───────────────────────────────────────
export async function sendTelegramSessionClosed(sessionId: string, visitorName: string): Promise<void> {
  if (!ENV.telegramBotToken || !ENV.telegramAdminChatId) return;

  const text =
    `🔴 *কথোপকথন শেষ হয়েছে*\n\n` +
    `👤 *ভিজিটর:* ${escapeMarkdown(visitorName)}\n` +
    `🔑 *Session:* \`${sessionId}\``;

  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ENV.telegramAdminChatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    console.error("[Telegram] session closed notification error:", err);
  }
}

// ── Handle incoming Telegram webhook update ───────────────────────────────────
export async function handleTelegramWebhook(body: TelegramUpdate): Promise<void> {
  const message = body.message;
  if (!message || !message.text) return;

  // Only process messages from the admin chat
  if (String(message.chat.id) !== String(ENV.telegramAdminChatId)) {
    console.warn("[Telegram] Ignoring message from unknown chat:", message.chat.id);
    return;
  }

  // Must be a reply to a bot message
  const replyTo = message.reply_to_message;
  if (!replyTo || !replyTo.text) {
    // Not a reply — send help message
    await sendHelpMessage();
    return;
  }

  // Extract session ID from the original bot message
  // Format: "🔑 *Session:* `SESSION_ID`"
  const sessionMatch = replyTo.text.match(/Session:\s*`?([A-Za-z0-9_-]{10,20})`?/);
  if (!sessionMatch) {
    await sendTelegramMessage(
      ENV.telegramAdminChatId,
      "⚠️ Session ID খুঁজে পাওয়া যায়নি। অনুগ্রহ করে ভিজিটরের মেসেজটি Reply করুন।"
    );
    return;
  }

  const sessionId = sessionMatch[1];
  const replyContent = message.text.trim();

  if (!replyContent) return;

  const db = await getDb();
  if (!db) {
    await sendTelegramMessage(ENV.telegramAdminChatId, "❌ ডেটাবেজ সংযোগ ব্যর্থ হয়েছে।");
    return;
  }

  // Check session exists and is not closed
  const sessions = await db
    .select()
    .from(liveChatSessions)
    .where(eq(liveChatSessions.sessionId, sessionId))
    .limit(1);

  if (sessions.length === 0) {
    await sendTelegramMessage(ENV.telegramAdminChatId, `❌ Session \`${sessionId}\` পাওয়া যায়নি।`);
    return;
  }

  if (sessions[0].status === "closed") {
    await sendTelegramMessage(ENV.telegramAdminChatId, `⚠️ এই কথোপকথনটি ইতিমধ্যে বন্ধ হয়ে গেছে।`);
    return;
  }

  // Save admin reply to DB
  await db.insert(liveChatMessages).values({
    sessionId,
    sender: "admin",
    content: replyContent,
    read: false,
  });

  // Update session
  await db
    .update(liveChatSessions)
    .set({ status: "active", lastMessageAt: new Date() })
    .where(eq(liveChatSessions.sessionId, sessionId));

  // Confirm to admin
  const visitorName = sessions[0].visitorName || "অতিথি";
  await sendTelegramMessage(
    ENV.telegramAdminChatId,
    `✅ *রিপ্লাই পাঠানো হয়েছে*\n👤 ${escapeMarkdown(visitorName)}\n\n_"${escapeMarkdown(replyContent)}"_`
  );
}

// ── Helper: send plain message ────────────────────────────────────────────────
async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
  } catch (err) {
    console.error("[Telegram] sendMessage error:", err);
  }
}

// ── Help message ──────────────────────────────────────────────────────────────
async function sendHelpMessage(): Promise<void> {
  await sendTelegramMessage(
    ENV.telegramAdminChatId,
    `ℹ️ *মাহবুব সরদার সবুজ — লাইভ চ্যাট বট*\n\n` +
    `ভিজিটর মেসেজ দিলে এখানে নোটিফিকেশন আসবে।\n` +
    `রিপ্লাই দিতে সেই মেসেজটি *Reply* করুন।`
  );
}

// ── Writing Platform Moderation Notifications ────────────────────────────────
export async function sendTelegramPostSubmitted(opts: {
  postId: number;
  title: string;
  authorName: string;
  category: string;
  slug: string;
}): Promise<void> {
  if (!ENV.telegramBotToken || !ENV.telegramAdminChatId) return;

  const categoryLabels: Record<string, string> = {
    experience: "অভিজ্ঞতা",
    story: "গল্প",
    poem: "কবিতা",
    thought: "ভাবনা",
    photo: "ছবি",
    video: "ভিডিও",
  };
  const catLabel = categoryLabels[opts.category] ?? opts.category;

  const text =
    `📝 *নতুন লেখা জমা পড়েছে — অনুমোদনের অপেক্ষায়*\n\n` +
    `✍️ *লেখক:* ${escapeMarkdown(opts.authorName)}\n` +
    `📌 *শিরোনাম:* ${escapeMarkdown(opts.title)}\n` +
    `🏷️ *বিভাগ:* ${catLabel}\n` +
    `🆔 *Post ID:* ${opts.postId}\n\n` +
    `👉 অ্যাডমিন প্যানেলে গিয়ে অনুমোদন বা প্রত্যাখ্যান করুন।`;

  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ENV.telegramAdminChatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    console.error("[Telegram] post submitted notification error:", err);
  }
}

export async function sendTelegramPostModerated(opts: {
  postId: number;
  title: string;
  authorName: string;
  action: "approved" | "rejected" | "removed" | "featured" | "unfeatured";
}): Promise<void> {
  if (!ENV.telegramBotToken || !ENV.telegramAdminChatId) return;

  const actionLabels: Record<string, string> = {
    approved: "✅ অনুমোদিত হয়েছে",
    rejected: "❌ প্রত্যাখ্যাত হয়েছে",
    removed: "🗑️ সরিয়ে দেওয়া হয়েছে",
    featured: "⭐ ফিচার্ড করা হয়েছে",
    unfeatured: "☆ ফিচার্ড থেকে সরানো হয়েছে",
  };
  const actionLabel = actionLabels[opts.action] ?? opts.action;

  const text =
    `${actionLabel}\n\n` +
    `✍️ *লেখক:* ${escapeMarkdown(opts.authorName)}\n` +
    `📌 *শিরোনাম:* ${escapeMarkdown(opts.title)}\n` +
    `🆔 *Post ID:* ${opts.postId}`;

  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ENV.telegramAdminChatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    console.error("[Telegram] post moderated notification error:", err);
  }
}

export async function sendTelegramCommentSubmitted(opts: {
  commentId: number;
  postTitle: string;
  authorName: string;
  contentPreview: string;
}): Promise<void> {
  if (!ENV.telegramBotToken || !ENV.telegramAdminChatId) return;

  const preview = opts.contentPreview.length > 120
    ? opts.contentPreview.slice(0, 120) + "..."
    : opts.contentPreview;

  const text =
    `💬 *নতুন মন্তব্য জমা পড়েছে — অনুমোদনের অপেক্ষায়*\n\n` +
    `✍️ *মন্তব্যকারী:* ${escapeMarkdown(opts.authorName)}\n` +
    `📌 *পোস্ট:* ${escapeMarkdown(opts.postTitle)}\n` +
    `🆔 *Comment ID:* ${opts.commentId}\n\n` +
    `📝 *মন্তব্য:*\n${escapeMarkdown(preview)}\n\n` +
    `👉 অ্যাডমিন প্যানেলে গিয়ে অনুমোদন বা প্রত্যাখ্যান করুন।`;

  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ENV.telegramAdminChatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    console.error("[Telegram] comment submitted notification error:", err);
  }
}

// ── Register webhook with Telegram ───────────────────────────────────────────
export async function registerTelegramWebhook(webhookUrl: string): Promise<void> {
  if (!ENV.telegramBotToken) return;

  try {
    const res = await fetch(`${TELEGRAM_API}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const data = await res.json() as { ok: boolean; description?: string };
    if (data.ok) {
      console.log("[Telegram] Webhook registered:", webhookUrl);
    } else {
      console.error("[Telegram] Webhook registration failed:", data.description);
    }
  } catch (err) {
    console.error("[Telegram] Webhook registration error:", err);
  }
}

// ── Escape Markdown special chars ────────────────────────────────────────────
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

interface TelegramMessage {
  message_id: number;
  chat: { id: number; type: string };
  text?: string;
  reply_to_message?: TelegramMessage;
}
