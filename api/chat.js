// Uses OPENAI_API_KEY and optional OPENAI_BASE_URL / OPENAI_MODEL environment variables

const SYSTEM_PROMPT = `তুমি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটের একজন দায়িত্বশীল, মানবিক এবং বন্ধুসুলভ প্রতিনিধি। তুমি শুধু একটি মেশিন নও, বরং এই ওয়েবসাইটের একজন গাইড। তোমার কথা বলার ভঙ্গি হবে একদম স্বাভাবিক, ভদ্র এবং মানুষের মতো সহজবোধ্য, যাতে ব্যবহারকারী তোমার সাথে কথা বলতে স্বাচ্ছন্দ্য বোধ করে।

তোমার প্রধান লক্ষ্য:
১. ব্যবহারকারীকে এমন একটি চমৎকার অভিজ্ঞতা দেওয়া, যাতে সে এই ওয়েবসাইটের প্রতি আগ্রহী হয়, স্বাচ্ছন্দ্য বোধ করে এবং বারবার ফিরে আসতে চায়।
২. প্রশ্নের সরাসরি ও পরিষ্কার উত্তর দেওয়া। অপ্রয়োজনীয় কথা বলা থেকে বিরত থাকা।
৩. কোনো তথ্য জানা না থাকলে অনুমান না করে ভদ্রভাবে জানানো যে বিষয়টি তোমার জানা নেই।

ওয়েবসাইট সম্পর্কে তোমার ধারণা:
এই ওয়েবসাইটটি লেখক ও কবি মাহবুব সরদার সবুজের ব্যক্তিগত ও সৃজনশীল প্ল্যাটফর্ম। এখানে তাঁর কবিতা, বাস্তবতা ভিত্তিক লেখা, চিন্তাধারা, ই-বুক, গ্যালারি এবং বিভিন্ন আপডেট প্রকাশিত হয়। কেউ ওয়েবসাইট সম্পর্কে জানতে চাইলে পরিষ্কার ও সংক্ষিপ্তভাবে এই বিষয়গুলো বুঝিয়ে বলবে।

মাহবুব সরদার সবুজ সম্পর্কে তথ্য:
কেউ লেখক সম্পর্কে জানতে চাইলে বলবে: "তিনি একজন বাংলা লেখক ও কবি। তাঁর লেখায় বাস্তবতা, জীবনবোধ এবং গভীর চিন্তার প্রতিফলন দেখা যায়। তাঁর লেখাগুলো পাঠকদের ভাবতে শেখায় এবং অনুভূতির ভেতরে নিয়ে যায়।" (এখানে কোনো অতিরঞ্জন করবে না, বরং সংক্ষিপ্ত ও বাস্তবভিত্তিক উপস্থাপন করবে)।

ব্যবহারকারীকে সাহায্য করা:
কেউ যদি জানতে চায় কীভাবে লেখা পড়বে, ই-বুক পড়বে, গ্যালারি দেখবে বা যোগাযোগ করবে, তাহলে তাকে ধাপে ধাপে খুব সহজভাবে বুঝিয়ে দেবে। তোমার নির্দেশনা এমন হবে যেন একদম নতুন ব্যবহারকারীও সহজে বুঝতে পারে।

সৃজনশীল সহায়তা:
তুমি শুধু তথ্য দেওয়ার মধ্যেই সীমাবদ্ধ থাকবে না। লেখালেখি, কবিতা বা চিন্তাধারা সংক্রান্ত প্রশ্নে তুমি সহায়ক ভূমিকা পালন করবে। প্রয়োজনে ছোট লেখা, আইডিয়া বা দিকনির্দেশনা দিতে পারবে, তবে সবসময় বাস্তবতা ও গভীরতার দিকে গুরুত্ব দেবে।

ভাষা ও আচরণ:
- বাংলা ভাষাকে সবসময় অগ্রাধিকার দেবে। তবে ব্যবহারকারী চাইলে ইংরেজিতেও উত্তর দিতে পারবে।
- ভাষা হবে সহজ, পরিষ্কার এবং স্বাভাবিক। কোনোভাবেই যেন তা রোবোটিক, কৃত্রিম বা জটিল মনে না হয়।
- ব্যবহারকারীর প্রতিটি প্রশ্নের প্রতি মনোযোগী হবে এবং সরাসরি উত্তর দেবে।`;

const GEMINI_OPENAI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

function isGeminiApiKey(apiKey = "") {
  return apiKey.startsWith("AIza");
}

function isGeminiBaseUrl(baseUrl = "") {
  return baseUrl.includes("generativelanguage.googleapis.com");
}

function buildChatCompletionsUrl(baseUrl) {
  const normalized = (baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
  if (normalized.endsWith("/chat/completions")) {
    return normalized;
  }
  if (normalized.endsWith("/v1") || normalized.endsWith("/openai")) {
    return `${normalized}/chat/completions`;
  }
  return `${normalized}/v1/chat/completions`;
}

function resolveProviderConfig({ apiKey, baseUrl, model, source, defaultModel = "gpt-4.1-mini" }) {
  const isOpenRouterKey = apiKey.startsWith("sk-or-");
  if (isGeminiApiKey(apiKey) || isGeminiBaseUrl(baseUrl)) {
    return {
      apiKey,
      baseUrl: baseUrl || GEMINI_OPENAI_BASE_URL,
      model: model || process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
      useForge: false,
      source: `${source}_GEMINI`,
    };
  }
  return {
    apiKey,
    baseUrl: baseUrl || (isOpenRouterKey ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1"),
    model: model || (isOpenRouterKey ? "openai/gpt-4.1-mini" : defaultModel),
    useForge: false,
    source,
  };
}

function resolveAiConfigs() {
  const configs = [];
  const chatbotApiKey = process.env.CHATBOT_API_KEY?.trim();
  const chatbotBaseUrl = process.env.CHATBOT_BASE_URL?.trim();
  const chatbotModel = process.env.CHATBOT_MODEL?.trim();
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const openRouterBaseUrl = process.env.OPENROUTER_BASE_URL?.trim();
  const openRouterModel = process.env.OPENROUTER_MODEL?.trim();
  const openAiApiKey = process.env.OPENAI_API_KEY?.trim();
  const openAiBaseUrl = process.env.OPENAI_BASE_URL?.trim();
  const openAiModel = process.env.OPENAI_MODEL?.trim();
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  const geminiBaseUrl = process.env.GEMINI_BASE_URL?.trim();
  const geminiModel = process.env.GEMINI_MODEL?.trim();
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY?.trim();
  const forgeBaseUrl = process.env.BUILT_IN_FORGE_API_URL?.trim();
  const forgeModel = process.env.BUILT_IN_FORGE_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  // Easiest long-term setup:
  // 1) Put your active Google AI key in GEMINI_API_KEY.
  // 2) Or put any supported provider key in CHATBOT_API_KEY / OPENAI_API_KEY.
  // 3) If the first provider is rate-limited, the API tries the next configured provider.
  if (geminiApiKey) {
    configs.push(resolveProviderConfig({
      apiKey: geminiApiKey,
      baseUrl: geminiBaseUrl,
      model: geminiModel,
      source: "GEMINI_API_KEY",
      defaultModel: DEFAULT_GEMINI_MODEL,
    }));
  }
  if (chatbotApiKey) {
    configs.push(resolveProviderConfig({
      apiKey: chatbotApiKey,
      baseUrl: chatbotBaseUrl,
      model: chatbotModel,
      source: "CHATBOT_API_KEY",
    }));
  }
  if (openRouterApiKey) {
    configs.push({
      apiKey: openRouterApiKey,
      baseUrl: openRouterBaseUrl || "https://openrouter.ai/api/v1",
      model: openRouterModel || "openai/gpt-4.1-mini",
      useForge: false,
      source: "OPENROUTER_API_KEY",
    });
  }
  if (openAiApiKey) {
    configs.push(resolveProviderConfig({
      apiKey: openAiApiKey,
      baseUrl: openAiBaseUrl,
      model: openAiModel,
      source: "OPENAI_API_KEY",
    }));
  }
  if (forgeApiKey && forgeBaseUrl) {
    configs.push({
      apiKey: forgeApiKey,
      baseUrl: forgeBaseUrl,
      model: forgeModel,
      useForge: true,
      source: "BUILT_IN_FORGE_API_KEY",
    });
  }

  const seen = new Set();
  return configs.filter((config) => {
    const key = `${config.source}:${config.baseUrl}:${config.model}:${config.apiKey.slice(0, 12)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function resolveAiConfig() {
  const configs = resolveAiConfigs();
  if (configs.length > 0) return configs[0];
  throw new Error("No AI API key configured. Set GEMINI_API_KEY for the simplest production setup.");
}
async function callAIWithConfig(messages, config) {
  const { apiKey, baseUrl, model, useForge, source } = config;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 28000);
  try {
    const payload = {
      model,
      messages,
      max_tokens: 1200,
      temperature: 0.7,
    };
    if (useForge && model.includes("gemini")) {
      payload.thinking = { budget_tokens: 128 };
    }
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    };
    if (source === "OPENROUTER_API_KEY" || baseUrl.includes("openrouter.ai")) {
      headers["HTTP-Referer"] = process.env.SITE_URL || process.env.VERCEL_URL || "https://mahbub-sardar-sabuj-live.vercel.app";
      headers["X-Title"] = "Mahbub Sardar Sabuj Live";
    }
    const response = await fetch(buildChatCompletionsUrl(baseUrl), {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}: ${errText.slice(0, 300)}`);
    }
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content || content.trim() === "") {
      throw new Error("Empty response from AI");
    }
    return content.trim();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
// Call AI API. It tries every configured provider before using the built-in natural fallback.
async function callAI(messages) {
  const configs = resolveAiConfigs();
  if (configs.length === 0) {
    throw new Error("No AI API key configured. Set GEMINI_API_KEY for the simplest production setup.");
  }
  let lastError;
  for (const config of configs) {
    try {
      return await callAIWithConfig(messages, config);
    } catch (err) {
      lastError = err;
      console.error(`AI provider ${config.source} failed; trying next provider if available:`, err.message);
    }
  }
  throw lastError || new Error("All AI providers failed");
}

function extractUserText(messages = []) {
  const lastUserMsg = [...messages].reverse().find((message) => message?.role === "user");
  if (!lastUserMsg) return "";
  if (Array.isArray(lastUserMsg.content)) {
    return lastUserMsg.content
      .map((part) => part?.type === "text" ? part.text : "")
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  return String(lastUserMsg.content || "").trim();
}

function buildFallbackReply(messages = [], aiError = null) {
  const userText = extractUserText(messages);
  const q = userText.toLowerCase();
  
  const websiteSummary = "এটি লেখক ও কবি মাহবুব সরদার সবুজের ব্যক্তিগত ও সৃজনশীল প্ল্যাটফর্ম। এখানে তাঁর কবিতা, বাস্তবতা ভিত্তিক লেখা, চিন্তাধারা, ই-বুক, গ্যালারি এবং বিভিন্ন আপডেট প্রকাশিত হয়। আপনি চাইলে আমি আপনাকে ওয়েবসাইটটি ঘুরে দেখতে সাহায্য করতে পারি।";
  
  if (/হ্যালো|সালাম|আসসালাম|hello|hi|hey/.test(q)) {
    return "হ্যালো! আমি মাহবুব সরদার সবুজের ওয়েবসাইটের প্রতিনিধি। আপনাকে কীভাবে সাহায্য করতে পারি? ওয়েবসাইট সম্পর্কে জানতে বা কোনো লেখা পড়তে চাইলে আমাকে জানাতে পারেন।";
  }
  if (/কে আপনি|তুমি কে|who are you/.test(q)) {
    return "আমি এই ওয়েবসাইটের একজন গাইড ও প্রতিনিধি। আমার কাজ হলো আপনাকে ওয়েবসাইটটি ঘুরে দেখতে সাহায্য করা এবং মাহবুব সরদার সবুজের লেখালেখি ও সাহিত্যকর্ম সম্পর্কে জানানো।";
  }
  if (/সবুজ|লেখক|কবি|mahbub|sabuj|author|poet/.test(q)) {
    return "মাহবুব সরদার সবুজ একজন বাংলা লেখক ও কবি। তাঁর লেখায় বাস্তবতা, জীবনবোধ এবং গভীর চিন্তার প্রতিফলন দেখা যায়। তাঁর লেখাগুলো পাঠকদের ভাবতে শেখায় এবং অনুভূতির ভেতরে নিয়ে যায়। আপনি কি তাঁর কোনো নির্দিষ্ট লেখা বা বই সম্পর্কে জানতে চান?";
  }
  if (/বই|book|ই-বুক|ebook/.test(q)) {
    return "ওয়েবসাইটের 'ই-বুক' বা 'বই পড়ুন' সেকশনে গেলে আপনি লেখকের প্রকাশিত বইগুলো পাবেন। সেখানে খুব সহজেই বইগুলো পড়া বা সংগ্রহ করা যায়। আমি কি আপনাকে সেই পেজের লিংকটি দেব?";
  }
  if (/যোগাযোগ|contact/.test(q)) {
    return "লেখকের সাথে যোগাযোগ করতে চাইলে ওয়েবসাইটের 'যোগাযোগ' সেকশনে যেতে পারেন। সেখানে ইমেইল বা সোশ্যাল মিডিয়ার মাধ্যমে যুক্ত হওয়ার উপায় দেওয়া আছে।";
  }
  
  return `আপনার কথাটি আমি বুঝতে পেরেছি। আমি এই ওয়েবসাইটের একজন প্রতিনিধি হিসেবে আপনাকে সাহায্য করতে প্রস্তুত।

${websiteSummary}

আপনি কি নির্দিষ্ট কোনো বিষয় সম্পর্কে জানতে চান?`;
}

function escapeTelegramHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function truncateTelegramText(value = "", maxLength = 3500) {
  const text = String(value);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 20) + "\n…[truncated]";
}


// Send photo to Telegram (base64 data URL)
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
  const headerBuf = Buffer.from(headerStr, "utf-8");
  const fileHeaderBuf = Buffer.from(fileHeader, "utf-8");
  const footerBuf = Buffer.from(footer, "utf-8");
  const body = Buffer.concat([headerBuf, fileHeaderBuf, buffer, footerBuf]);
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
    console.warn("Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID is not configured.");
    return { ok: false, skipped: true, reason: "missing_env" };
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
      // Send photo with caption (text as caption)
      await sendPhotoToTelegram(botToken, adminChatId, imageData, text);
    } else {
      const response = await fetch("https://api.telegram.org/bot" + botToken + "/sendMessage", {
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
        console.error("Telegram notification failed:", {
          status: response.status,
          description: result.description || "Unknown Telegram API error",
        });
        return { ok: false, status: response.status, description: result.description };
      }
    }
    return { ok: true };
  } catch (error) {
    console.error("Telegram notification failed:", error);
    return { ok: false, error: error?.message || String(error) };
  }
}
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-10),
    ];

    try {
      const reply = await callAI(allMessages);

      // Send notification to Telegram before returning the response.
      // Vercel serverless functions can stop background work after res.json(),
      // so fire-and-forget fetch calls may never reach Telegram.
      const lastUserMsg = messages.filter((message) => message.role === "user").slice(-1)[0];
      // Extract image from last user message if present
      const lastUserImgPart = Array.isArray(lastUserMsg?.content)
        ? lastUserMsg.content.find(p => p.type === "image_url")?.image_url?.url
        : null;
      await notifyTelegram({
        userMessage: lastUserMsg ? (Array.isArray(lastUserMsg.content) ? lastUserMsg.content.find(p => p.type === 'text')?.text || '[ছবি পাঠানো হয়েছে]' : lastUserMsg.content) : "(অজানা)",
        aiResponse: reply,
        clientIp: req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
        imageData: lastUserImgPart || null,
      });

      return res.status(200).json({ reply });
    } catch (err) {
      console.error("AI API failed; returning built-in fallback reply:", err.message);
      const fallbackReply = buildFallbackReply(messages, err);
      const lastUserMsg = messages.filter((message) => message.role === "user").slice(-1)[0];
      const lastUserImgPart = Array.isArray(lastUserMsg?.content)
        ? lastUserMsg.content.find(p => p.type === "image_url")?.image_url?.url
        : null;
      await notifyTelegram({
        userMessage: lastUserMsg ? (Array.isArray(lastUserMsg.content) ? lastUserMsg.content.find(p => p.type === 'text')?.text || '[ছবি পাঠানো হয়েছে]' : lastUserMsg.content) : "(অজানা)",
        aiResponse: `${fallbackReply}

[Fallback used because AI provider failed: ${err.message}]`,
        clientIp: req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
        imageData: lastUserImgPart || null,
      }).catch((notifyError) => console.error("Telegram fallback notification failed:", notifyError.message));
      return res.status(200).json({ reply: fallbackReply, fallback: true });
    }
  } catch (err) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
