// api/chat.js — Fixed version with resolveAiConfigs and callAIWithConfig

const SYSTEM_PROMPT = `তুমি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটের AI সহকারী। তোমার নাম "সহকারী"। তুমি বাংলায় কথা বলো এবং পাঠকদের সাথে আন্তরিক ও উষ্ণ ব্যবহার করো।

## লেখক পরিচয়
মাহবুব সরদার সবুজ একজন বাংলা ভাষার লেখক ও কবি। তিনি ভালোবাসা, বিচ্ছেদ, জীবনসংগ্রাম, স্মৃতি এবং মানবিক অনুভূতিকে সহজ অথচ আবেগঘন ভাষায় প্রকাশ করেন। তিনি কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়িতে জন্মগ্রহণ করেন। কর্মসূত্রে বর্তমানে সৌদি আরবে অবস্থান করছেন। ২০১৫ সাল থেকে সামাজিক মাধ্যমে লেখালেখি শুরু করেন। তাঁর ফেসবুক পেজে ১ লক্ষ ১০ হাজারেরও বেশি ফলোয়ার রয়েছে।

## প্রকাশিত বই ও ই-বুক সমূহ

### ১. আমি বিচ্ছেদকে বলি দুঃখবিলাস (ফিজিক্যাল বই)
- ধরন: ফিজিক্যাল বই (প্রথম মুদ্রিত বই)
- বিষয়: আবেগী সাহিত্য
- প্রকাশ: ২০২৬
- পৃষ্ঠা: ১৫০+
- বিবরণ: বিচ্ছেদের ব্যথা, হারানোর কষ্ট আর জীবনের গভীর অনুভূতিগুলো এই বইয়ে অনন্যভাবে তুলে ধরা হয়েছে।
- কোথায় পাবেন: রকমারি থেকে অর্ডার করুন — https://rkmri.co/TTMEoA3l3pM0/
- পড়ার লিংক: [BUTTON:/ebooks/read/dukkhovilash]
- বই পেজ: [BUTTON:/ebooks]

### ২. স্মৃতির বসন্তে তুমি (ই-বুক)
- ধরন: ই-বুক (বিনামূল্যে পড়া যায়)
- পড়ার লিংক: [BUTTON:/ebooks/read/smritir-boshonte]

### ৩. চাঁদফুল (ই-বুক)
- ধরন: ই-বুক (বিনামূল্যে পড়া যায়)
- পড়ার লিংক: [BUTTON:/ebooks/read/chand-phool]

### ৪. সময়ের গহ্বরে (ই-বুক)
- ধরন: ই-বুক (বিনামূল্যে পড়া যায়)
- পড়ার লিংক: [BUTTON:/ebooks/read/shomoyer-gohvore]

### ৫. অনবদ্য লেখা (ই-বুক)
- ধরন: ই-বুক (বিনামূল্যে পড়া যায়)
- পড়ার লিংক: [BUTTON:/ebooks/read/onoboddo-lekha]

## ওয়েবসাইটের পেজসমূহ
- হোম: [BUTTON:/]
- পরিচিতি: [BUTTON:/about]
- লেখালেখি: [BUTTON:/writings]
- ই-বুক: [BUTTON:/ebooks]
- আবৃত্তি: [BUTTON:/facebook-recitations]
- আমিও লিখবো বাস্তবতা: [BUTTON:/amio-likhbo-bastobota]
- ডিজাইন স্টুডিও: [BUTTON:/editor]
- গ্যালারি: [BUTTON:/gallery]
- সরদার সংবাদ: [BUTTON:/news]
- যোগাযোগ: [BUTTON:/contact]

## যোগাযোগ তথ্য
- ইমেইল: lekhokmahbubsardarsabuj@gmail.com
- Facebook: https://facebook.com/Lekhok.MahbubSardarSabuj
- Instagram: https://instagram.com/mahbub_sardar_sabuj
- YouTube: https://youtube.com/@MahbubSardarSabuj

## গুরুত্বপূর্ণ নির্দেশনা
- সবসময় বাংলায় উত্তর দাও।
- পাঠকদের সাথে আন্তরিক ও উষ্ণ ব্যবহার করো।
- বই বা ই-বুকের কথা উল্লেখ করলে সংশ্লিষ্ট [BUTTON:...] লিংক দাও।
- ওয়েবসাইটের বাইরের বিষয়ে বিনয়ের সাথে জানাও যে তুমি শুধু এই ওয়েবসাইট সম্পর্কিত তথ্য দিতে পারো।
- রকমারি থেকে "দুঃখবিলাস" বইটি কেনার লিংক: https://rkmri.co/TTMEoA3l3pM0/
- ই-বুকগুলো সম্পূর্ণ বিনামূল্যে পড়া যায়।`;


import {
  checkRateLimit,
  isProbablySpamText,
  limitJsonBodySize,
  normalizeText,
} from "./_utils/security.js";

// ── AI provider configuration ──────────────────────────────────────────────
function resolveAiConfigs() {
  const configs = [];

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    const baseUrl = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
    const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
    configs.push({ source: "openai", apiKey: openaiKey, endpoint: `${baseUrl}/chat/completions`, model });
  }

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    configs.push({
      source: "gemini",
      apiKey: geminiKey,
      endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
    });
  }

  const forgeKey = process.env.BUILT_IN_FORGE_API_KEY?.trim();
  const forgeUrl = process.env.BUILT_IN_FORGE_API_URL?.trim();
  if (forgeKey && forgeUrl) {
    configs.push({
      source: "forge",
      apiKey: forgeKey,
      endpoint: `${forgeUrl.replace(/\/$/, "")}/v1/chat/completions`,
      model: "gemini-2.5-flash",
    });
  }

  return configs;
}

async function callAIWithConfig(messages, config) {
  const { source, apiKey, endpoint, model } = config;
  const payload = { model, messages, max_tokens: 1024, temperature: 0.7 };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`${source} API error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (!reply || typeof reply !== "string") {
    throw new Error(`${source} returned empty or invalid response`);
  }
  return reply.trim();
}

function extractUserText(messages = []) {
  const lastUserMsg = [...messages].reverse().find((m) => m?.role === "user");
  if (!lastUserMsg) return "";
  if (Array.isArray(lastUserMsg.content)) {
    return lastUserMsg.content.map((p) => p?.type === "text" ? p.text : "").filter(Boolean).join(" ").trim();
  }
  return String(lastUserMsg.content || "").trim();
}

function buildFallbackReply(messages = []) {
  const userText = extractUserText(messages).toLowerCase();

  if (/বই|ebook|ই-বুক|দুঃখবিলাস|চাঁদফুল|স্মৃতির|সময়ের|অনবদ্য|কিনব|পড়ব|পড়তে/.test(userText)) {
    return "মাহবুব সরদার সবুজের বই সংগ্রহ দেখতে এখানে যান: [BUTTON:/ebooks]\n\nফিজিক্যাল বই \"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" রকমারি থেকে অর্ডার করুন: https://rkmri.co/TTMEoA3l3pM0/\n\nই-বুকগুলো বিনামূল্যে পড়া যায়।";
  }
  if (/যোগাযোগ|contact|ইমেইল|email|ফোন|phone|facebook|ফেসবুক/.test(userText)) {
    return "লেখকের সাথে যোগাযোগ করুন:\n📧 ইমেইল: lekhokmahbubsardarsabuj@gmail.com\n📘 Facebook: Lekhok.MahbubSardarSabuj\n📸 Instagram: mahbub_sardar_sabuj\n\nযোগাযোগ পেজ: [BUTTON:/contact]";
  }
  if (/কে|পরিচয়|about|লেখক|কবি|জন্ম|কুমিল্লা|সৌদি/.test(userText)) {
    return "মাহবুব সরদার সবুজ একজন বাংলা ভাষার লেখক ও কবি। কুমিল্লার বরুড়া উপজেলার আরিফপুর গ্রামে জন্মগ্রহণ করেন। বর্তমানে সৌদি আরবে কর্মরত। বিস্তারিত জানতে: [BUTTON:/about]";
  }
  if (/আবৃত্তি|recitation|কণ্ঠ|শুনতে/.test(userText)) {
    return "মাহবুব সরদার সবুজের ৯টি আবৃত্তি শুনতে পারবেন এখানে: [BUTTON:/facebook-recitations]";
  }
  if (/সংবাদ|news|খবর/.test(userText)) {
    return "সর্বশেষ সংবাদ পড়তে সরদার সংবাদ পেজে যান: [BUTTON:/news]";
  }
  if (/ডিজাইন|design|কার্ড|editor|এডিটর/.test(userText)) {
    return "সরদার ডিজাইন স্টুডিওতে কবিতার কার্ড তৈরি করুন: [BUTTON:/editor]";
  }
  if (/গ্যালারি|gallery|ছবি|ফটো/.test(userText)) {
    return "লেখকের গ্যালারি দেখতে যান: [BUTTON:/gallery]";
  }
  if (/লেখালেখি|writings|কবিতা|poem/.test(userText)) {
    return "মাহবুব সরদার সবুজের লেখালেখি পড়তে যান: [BUTTON:/writings]";
  }
  if (/আমিও লিখবো|লিখবো বাস্তবতা|amio|bastobota/.test(userText)) {
    return "আমিও লিখবো বাস্তবতা পেজে আপনার গল্প শেয়ার করুন: [BUTTON:/amio-likhbo-bastobota]";
  }

  return "দুঃখিত, এই মুহূর্তে AI সেবা অনুপলব্ধ। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন অথবা সরাসরি যোগাযোগ করুন: [BUTTON:/contact]";
}

function sanitizeReply(reply) {
  if (!reply || typeof reply !== "string") return reply;
  reply = reply.replace(/\[([^\]]+)\]\(https?:\/\/(?:www\.)?mahbubsardarsabuj\.com(\/[^\)]*)?\)/g, (_, _t, path) => path ? `[BUTTON:${path}]` : `[BUTTON:/]`);
  reply = reply.replace(/https?:\/\/(?:www\.)?mahbubsardarsabuj\.com(\/[^\s\)\"\']+)?/g, (_, path) => path ? `[BUTTON:${path}]` : `[BUTTON:/]`);
  reply = reply.replace(/https?:\/\/(?:www\.)?mahmubsardarsabuj\.com(\/[^\s\)\"\']+)?/g, (_, path) => path ? `[BUTTON:${path}]` : `[BUTTON:/]`);
  return reply;
}

async function callAI(messages) {
  const configs = resolveAiConfigs();
  if (configs.length === 0) {
    throw new Error("No AI API key configured. Set OPENAI_API_KEY or GEMINI_API_KEY.");
  }
  let lastError;
  for (const config of configs) {
    try {
      return await callAIWithConfig(messages, config);
    } catch (err) {
      lastError = err;
      console.error(`AI provider ${config.source} failed:`, err.message);
    }
  }
  throw lastError || new Error("All AI providers failed");
}

function escapeTelegramHtml(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function truncateTelegramText(value = "", maxLength = 3500) {
  const text = String(value);
  return text.length <= maxLength ? text : text.slice(0, maxLength - 20) + "\n…[truncated]";
}

async function sendPhotoToTelegram(botToken, adminChatId, base64Data, caption) {
  const matches = base64Data.match(/^data:(.+);base64,(.+)$/s);
  if (!matches) return { ok: false, error: "Invalid image data" };
  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], "base64");
  const ext = mimeType.split("/")[1] || "jpg";
  const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
  const CRLF = "\r\n";
  const parts = [];
  parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="chat_id"${CRLF}${CRLF}${adminChatId}`);
  if (caption) {
    parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="caption"${CRLF}Content-Type: text/plain; charset=utf-8${CRLF}${CRLF}${caption}`);
    parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="parse_mode"${CRLF}${CRLF}HTML`);
  }
  const headerStr = parts.join(CRLF) + CRLF;
  const fileHeader = `--${boundary}${CRLF}Content-Disposition: form-data; name="photo"; filename="photo.${ext}"${CRLF}Content-Type: ${mimeType}${CRLF}${CRLF}`;
  const footer = `${CRLF}--${boundary}--`;
  const body = Buffer.concat([Buffer.from(headerStr, "utf-8"), Buffer.from(fileHeader, "utf-8"), buffer, Buffer.from(footer, "utf-8")]);
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body,
  });
  return res.json().catch(() => ({}));
}

async function notifyTelegram({ userMessage, aiResponse, clientIp, userAgent, imageData }) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
  if (!botToken || !adminChatId) {
    console.warn("Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID not configured.");
    return { ok: false, reason: "not_configured" };
  }
  const text = [
    "🤖 <b>AI Chatbot Conversation</b>",
    "",
    "<b>Visitor:</b> " + escapeTelegramHtml(truncateTelegramText(userMessage, 1200)),
    "",
    "<b>AI Reply:</b> " + escapeTelegramHtml(truncateTelegramText(aiResponse, 1800)),
    "",
    "<b>IP:</b> " + escapeTelegramHtml(clientIp || "unknown"),
    "<b>User Agent:</b> " + escapeTelegramHtml(truncateTelegramText(userAgent || "unknown", 400)),
    "<b>Time:</b> " + escapeTelegramHtml(new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })),
  ].join("\n");
  try {
    if (imageData && imageData.startsWith("data:")) {
      await sendPhotoToTelegram(botToken, adminChatId, imageData, text);
    } else {
      const response = await fetch("https://api.telegram.org/bot" + botToken + "/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: adminChatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok === false) {
        console.error("Telegram notification failed:", { status: response.status, description: result.description });
        return { ok: false, status: response.status, description: result.description };
      }
    }
    return { ok: true };
  } catch (error) {
    console.error("Telegram notification failed:", error);
    return { ok: false, error: error.message };
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (limitJsonBodySize(req, res, 2 * 1024 * 1024)) return;

  const rate = checkRateLimit(req, res, { keyPrefix: "chat", windowMs: 60 * 1000, max: 20 });
  if (rate.limited) return;

  try {
    const { messages } = req.body || {};
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    const lastUserContent = messages.filter((m) => m?.role === "user").slice(-1)[0]?.content;
    const lastUserText = Array.isArray(lastUserContent)
      ? lastUserContent.find((p) => p?.type === "text")?.text || ""
      : lastUserContent || "";

    if (normalizeText(lastUserText, 5000).length > 4000 || isProbablySpamText(lastUserText)) {
      return res.status(400).json({ error: "আপনার বার্তাটি খুব বড় বা সন্দেহজনক। অনুগ্রহ করে সংক্ষিপ্ত ও স্বাভাবিক বার্তা পাঠান।" });
    }

    const filteredMessages = messages
      .filter((m) => m.role !== "system" && ["user", "assistant"].includes(m.role))
      .slice(-12);
    const allMessages = [{ role: "system", content: SYSTEM_PROMPT }, ...filteredMessages];

    const lastUserMsg = messages.filter((m) => m.role === "user").slice(-1)[0];
    const lastUserImgPart = Array.isArray(lastUserMsg?.content)
      ? lastUserMsg.content.find((p) => p.type === "image_url")?.image_url?.url
      : null;
    const userMsgText = lastUserMsg
      ? (Array.isArray(lastUserMsg.content) ? lastUserMsg.content.find((p) => p.type === "text")?.text || "[ছবি পাঠানো হয়েছে]" : lastUserMsg.content)
      : "(অজানা)";

    try {
      const reply = await callAI(allMessages);
      await notifyTelegram({
        userMessage: userMsgText,
        aiResponse: reply,
        clientIp: rate.clientIp,
        userAgent: req.headers["user-agent"],
        imageData: lastUserImgPart || null,
      }).catch((e) => console.error("Telegram notification failed:", e.message));
      return res.status(200).json({ reply: sanitizeReply(reply) });
    } catch (err) {
      console.error("AI API failed; returning built-in fallback reply:", err.message);
      const fallbackReply = buildFallbackReply(messages, err);
      await notifyTelegram({
        userMessage: userMsgText,
        aiResponse: `${fallbackReply}\n\n[Fallback: ${err.message}]`,
        clientIp: rate.clientIp,
        userAgent: req.headers["user-agent"],
        imageData: lastUserImgPart || null,
      }).catch((e) => console.error("Telegram fallback notification failed:", e.message));
      return res.status(200).json({ reply: fallbackReply, fallback: true });
    }
  } catch (err) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" });
  }
}
