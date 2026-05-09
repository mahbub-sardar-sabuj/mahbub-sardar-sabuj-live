/**
 * Telegram Bot Service
 * - Sends visitor messages as notifications to admin's Telegram
 * - Handles admin replies from Telegram → stores in DB → visitor sees in chat
 * - Handles post/comment moderation via inline Approve/Reject buttons
 *
 * Bot: @MahbubLiveChat_bot
 * Token: stored in TELEGRAM_BOT_TOKEN env var
 * Admin Chat ID: stored in TELEGRAM_ADMIN_CHAT_ID env var
 */
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { liveChatMessages, liveChatSessions, writingPosts, writingComments } from "../drizzle/schema";
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
  // Handle callback_query (inline button presses)
  if (body.callback_query) {
    await handleCallbackQuery(body.callback_query);
    return;
  }

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

// ── Handle inline button callback queries ────────────────────────────────────
async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<void> {
  const chatId = String(callbackQuery.message?.chat?.id);
  const messageId = callbackQuery.message?.message_id;
  const data = callbackQuery.data || "";

  // Acknowledge the callback to remove the loading spinner
  await answerCallbackQuery(callbackQuery.id);

  const db = await getDb();
  if (!db) {
    await sendTelegramMessage(chatId, "❌ ডেটাবেজ সংযোগ ব্যর্থ হয়েছে।");
    return;
  }

  // ── Post moderation: post_approve_ID or post_reject_ID ──────────────────
  const postApproveMatch = data.match(/^post_approve_(\d+)$/);
  const postRejectMatch = data.match(/^post_reject_(\d+)$/);

  if (postApproveMatch || postRejectMatch) {
    const postId = parseInt((postApproveMatch || postRejectMatch)![1]);
    const newStatus = postApproveMatch ? "approved" : "rejected";
    const actionLabel = postApproveMatch ? "✅ অনুমোদিত হয়েছে" : "❌ প্রত্যাখ্যাত হয়েছে";

    const posts = await db
      .select()
      .from(writingPosts)
      .where(eq(writingPosts.id, postId))
      .limit(1);

    if (posts.length === 0) {
      await sendTelegramMessage(chatId, `❌ Post ID ${postId} পাওয়া যায়নি।`);
      return;
    }

    const post = posts[0];

    if (post.status !== "pending") {
      const currentLabel = post.status === "approved" ? "অনুমোদিত" : post.status === "rejected" ? "প্রত্যাখ্যাত" : post.status;
      await editMessageReplyMarkup(chatId, messageId);
      await sendTelegramMessage(chatId, `ℹ️ এই পোস্টটি ইতিমধ্যে *${currentLabel}* অবস্থায় আছে।`);
      return;
    }

    await db
      .update(writingPosts)
      .set({ status: newStatus as "approved" | "rejected", updatedAt: new Date() })
      .where(eq(writingPosts.id, postId));

    // Remove inline buttons after action
    await editMessageReplyMarkup(chatId, messageId);

    await sendTelegramMessage(
      chatId,
      `${actionLabel}\n\n` +
      `📌 *শিরোনাম:* ${escapeMarkdown(post.title)}\n` +
      `✍️ *লেখক:* ${escapeMarkdown(post.authorName)}\n` +
      `🆔 *Post ID:* ${postId}`
    );
    return;
  }

  // ── Comment moderation: comment_approve_ID or comment_reject_ID ─────────
  const commentApproveMatch = data.match(/^comment_approve_(\d+)$/);
  const commentRejectMatch = data.match(/^comment_reject_(\d+)$/);

  if (commentApproveMatch || commentRejectMatch) {
    const commentId = parseInt((commentApproveMatch || commentRejectMatch)![1]);
    const newStatus = commentApproveMatch ? "approved" : "rejected";
    const actionLabel = commentApproveMatch ? "✅ মন্তব্য অনুমোদিত হয়েছে" : "❌ মন্তব্য প্রত্যাখ্যাত হয়েছে";

    const comments = await db
      .select()
      .from(writingComments)
      .where(eq(writingComments.id, commentId))
      .limit(1);

    if (comments.length === 0) {
      await sendTelegramMessage(chatId, `❌ Comment ID ${commentId} পাওয়া যায়নি।`);
      return;
    }

    const comment = comments[0];

    if (comment.status !== "pending") {
      const currentLabel = comment.status === "approved" ? "অনুমোদিত" : comment.status === "rejected" ? "প্রত্যাখ্যাত" : comment.status;
      await editMessageReplyMarkup(chatId, messageId);
      await sendTelegramMessage(chatId, `ℹ️ এই মন্তব্যটি ইতিমধ্যে *${currentLabel}* অবস্থায় আছে।`);
      return;
    }

    await db
      .update(writingComments)
      .set({ status: newStatus as "approved" | "rejected", updatedAt: new Date() })
      .where(eq(writingComments.id, commentId));

    // Remove inline buttons after action
    await editMessageReplyMarkup(chatId, messageId);

    await sendTelegramMessage(
      chatId,
      `${actionLabel}\n\n` +
      `✍️ *মন্তব্যকারী:* ${escapeMarkdown(comment.authorName)}\n` +
      `🆔 *Comment ID:* ${commentId}`
    );
    return;
  }

  // Unknown callback
  await sendTelegramMessage(chatId, "⚠️ অজানা অ্যাকশন।");
}

// ── Helper: answer callback query (removes loading spinner) ──────────────────
async function answerCallbackQuery(callbackQueryId: string): Promise<void> {
  try {
    await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQueryId }),
    });
  } catch (err) {
    console.error("[Telegram] answerCallbackQuery error:", err);
  }
}

// ── Helper: remove inline keyboard from a message ────────────────────────────
async function editMessageReplyMarkup(chatId: string, messageId?: number): Promise<void> {
  if (!messageId) return;
  try {
    await fetch(`${TELEGRAM_API}/editMessageReplyMarkup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: [] },
      }),
    });
  } catch (err) {
    console.error("[Telegram] editMessageReplyMarkup error:", err);
  }
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
    `ℹ️ *মাহবুব সরদার সবুজ — অ্যাডমিন বট*\n\n` +
    `📝 নতুন লেখা জমা পড়লে Approve/Reject বাটন সহ নোটিফিকেশন আসবে।\n` +
    `💬 লাইভ চ্যাট বার্তা আসলে সেই মেসেজটি *Reply* করুন।`
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
    `🆔 *Post ID:* ${opts.postId}`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: "✅ অনুমোদন করুন", callback_data: `post_approve_${opts.postId}` },
        { text: "❌ প্রত্যাখ্যান করুন", callback_data: `post_reject_${opts.postId}` },
      ],
    ],
  };

  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ENV.telegramAdminChatId,
        text,
        parse_mode: "Markdown",
        reply_markup: inlineKeyboard,
      }),
    });
    const data = await res.json() as { ok: boolean; description?: string };
    if (!data.ok) {
      console.error("[Telegram] sendTelegramPostSubmitted failed:", data.description);
    }
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
    `📝 *মন্তব্য:*\n${escapeMarkdown(preview)}`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: "✅ অনুমোদন করুন", callback_data: `comment_approve_${opts.commentId}` },
        { text: "❌ প্রত্যাখ্যান করুন", callback_data: `comment_reject_${opts.commentId}` },
      ],
    ],
  };

  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ENV.telegramAdminChatId,
        text,
        parse_mode: "Markdown",
        reply_markup: inlineKeyboard,
      }),
    });
    const data = await res.json() as { ok: boolean; description?: string };
    if (!data.ok) {
      console.error("[Telegram] sendTelegramCommentSubmitted failed:", data.description);
    }
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
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
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
  callback_query?: TelegramCallbackQuery;
}

interface TelegramMessage {
  message_id: number;
  chat: { id: number; type: string };
  text?: string;
  reply_to_message?: TelegramMessage;
}

interface TelegramCallbackQuery {
  id: string;
  from: { id: number; username?: string };
  message?: {
    message_id: number;
    chat: { id: number; type: string };
    text?: string;
  };
  data?: string;
}
