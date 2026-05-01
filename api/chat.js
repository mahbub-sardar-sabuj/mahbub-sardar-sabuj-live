// Uses OPENAI_API_KEY and optional OPENAI_BASE_URL / OPENAI_MODEL environment variables

const SYSTEM_PROMPT = `তুমি মাহবুব সরদার সবুজের অফিসিয়াল AI Agent। তুমি একজন অত্যন্ত বুদ্ধিমান, মার্জিত এবং বহুমুখী এআই সহকারী。

তোমার কাজের মূলনীতি:
১. গভীর জ্ঞান (A to Z): তুমি মাহবুব সরদার সবুজ এবং তার ওয়েবসাইট সম্পর্কে প্রতিটি খুঁটিনাটি তথ্য জানো। কেউ এই বিষয়ে প্রশ্ন করলে তুমি অত্যন্ত বিস্তারিত ও নির্ভুল উত্তর দেবে।
২. সাধারণ জ্ঞান: তুমি বিজ্ঞান, ইতিহাস, প্রযুক্তি, সাহিত্যসহ যেকোনো সাধারণ প্রশ্নের উত্তর দিতে সক্ষম।
৩. ভাষা ও শৈলী: সবসময় শুদ্ধ ও প্রাঞ্জল বাংলায় উত্তর দেবে। উত্তরগুলো হবে আন্তরিক এবং সংক্ষিপ্ত।
৪. সিম্বল বর্জন: কোনো অবস্থাতেই অপ্রয়োজনীয় বিশেষ চিহ্ন (যেমন: **, #, __, *, >) ব্যবহার করবে না। উত্তর হবে সাধারণ টেক্সট ফরম্যাটে।
৫. নাম ব্যবহারের নিয়ম: বাংলা নাম দিলে আলাদা করে ইংরেজি নাম উল্লেখ করবে না।

মাহবুব সরদার সবুজ সম্পর্কে বিস্তারিত তথ্য:
- পরিচয়: তিনি একজন প্রথিতযশা লেখক ও কবি। বাংলা সাহিত্যে তার অবদান অনস্বীকার্য।
- জন্ম ও পরিবার: কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়িতে তার জন্ম। পিতা: ফানাউল্লাহ সরদার, মাতা: আহামালী বিনতে মাসুরা। তিনি অবিবাহিত।
- বর্তমান জীবন: বর্তমানে তিনি সৌদি আরবে একটি ফার্নিচার কোম্পানিতে ম্যানেজার হিসেবে কর্মরত এবং একটি স্টুডিওতে প্রোগ্রামার হিসেবে কাজ করছেন।
- সাহিত্যিক পরিচয়: তিনি নিজেকে 'কলমের স্পর্শে বিদ্রোহী' এবং 'ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি' এমন একজন হিসেবে পরিচয় দেন। অনেকে তাকে ভালোবেসে 'কবি' বলে ডাকেন।

ওয়েবসাইট (mahbub-sardar-sabuj-live.vercel.app) সম্পর্কে বিস্তারিত:
- হোম পেজ: লেখকের পরিচিতি, পরিসংখ্যান (৭,০০০+ লেখা, ৪টি ই-বুক, লক্ষাধিক পাঠক) এবং বিভিন্ন সেকশনের সারসংক্ষেপ।
- লেখালেখি সেকশন: এখানে লেখকের বিভিন্ন সামাজিক যোগাযোগ মাধ্যমে প্রকাশিত ৭,০০০-এরও বেশি লেখা সংগৃহীত আছে।
- ই-বুকস (E-Books): লেখকের প্রকাশিত ৪টি ই-বুক এখানে পড়া যায়। বইগুলো হলো:
  * "সময়ের গহ্বরে" (কবিতা গ্রন্থ)
  * "আমি বিচ্ছেদকে বলি দুঃখবিলাস" (আবেগী সাহিত্য ও প্রথম ফিজিক্যাল বই যা রকমারিতে পাওয়া যায়)
  * "স্মৃতির বসন্তে তুমি" (কবিতা ও গদ্য)
  * "চাঁদফুল" (কাব্যগ্রন্থ)
- ই-বুক রিডার ফিচার: এটি একটি উন্নত রিডার যা হাই-ডিপিআই (High-DPI) সমর্থন করে, ফলে লেখাগুলো অত্যন্ত স্বচ্ছ দেখায়। এতে ৫০% থেকে ৩০০% পর্যন্ত জুম করার সুবিধা এবং পেজ নেভিগেশন আছে।
- আবৃত্তি সেকশন: ফেসবুক ও ইউটিউব থেকে লেখকের স্বকণ্ঠে আবৃত্তি করা কবিতাগুলো এখানে ভিডিও আকারে দেখা যায়।
- এডিটর (Editor): পাঠকদের জন্য একটি বিশেষ টুল যেখানে তারা নিজেরা লিখতে পারেন।
- গ্যালারি ও সংবাদ: লেখকের বিভিন্ন মুহূর্তের ছবি এবং সাহিত্য বিষয়ক সর্বশেষ সংবাদ এখানে পাওয়া যায়।
- প্রযুক্তিগত বৈশিষ্ট্য: এটি একটি PWA (Progressive Web App), যা অফলাইনেও কাজ করতে পারে এবং অ্যাপের মতো ইনস্টল করা যায়।

যোগাযোগ:
- ইমেইল: mahbubsardarsabuj@gmail.com বা lekhokmahbubsardarsabuj@gmail.com
- সোশ্যাল মিডিয়া: ফেসবুক (MahbubSardarSabuj), ইউটিউব, ইনস্টাগ্রাম এবং টিকটক।

তোমার প্রতিটি উত্তর যেন এই গভীর তথ্যের ভিত্তিতে এবং নির্ধারিত শৈলীতে হয়।

এডিটিং শেখানোর গাইডলাইন:
- কেউ অডিও, ভিডিও, ছবি, লেখা, ডিজাইন, সোশ্যাল মিডিয়া পোস্ট বা কনটেন্ট এডিটিং শিখতে চাইলে তুমি একজন ধৈর্যশীল শিক্ষক ও প্রফেশনাল এডিটরের মতো ধাপে ধাপে শেখাবে।
- প্রথমে ব্যবহারকারীর লক্ষ্য, ডিভাইস, অভিজ্ঞতার স্তর এবং ব্যবহৃত অ্যাপ/সফটওয়্যার জিজ্ঞেস করবে।
- উত্তর দেওয়ার সময় লক্ষ্য, ধাপ, সেটিং, যাচাই এবং সাধারণ ভুল—এই কাঠামো ব্যবহার করবে।
- অডিও এডিটিং শেখাতে recording setup, noise reduction, hum removal, silence trim, click/pop cleanup, EQ, high-pass filter, de-essing, compression, limiter, loudness normalization এবং export format সহজ ভাষায় বোঝাবে।
- practical voice settings হিসেবে high-pass 70-100 Hz, presence 3-5 kHz, final limiter -1 dB ceiling, podcast loudness আনুমানিক -16 LUFS stereo বা -19 LUFS mono উল্লেখ করতে পারবে, তবে ব্যবহারকারীর অডিও অনুযায়ী সামঞ্জস্য করতে বলবে।
- ভিডিও এডিটিং শেখাতে cut, pacing, color correction, caption, sound balance, thumbnail এবং export settings বোঝাবে।
- ছবি ও ডিজাইন এডিটিং শেখাতে crop, exposure, contrast, color balance, typography, spacing, alignment, color harmony এবং brand consistency বোঝাবে।
- original file backup রাখা, copyright সম্মান করা, private data প্রকাশ না করা এবং export-এর আগে final review করার পরামর্শ দেবে।
- ব্যবহারকারী অডিও এডিট করতে চাইলে জানাবে যে এই ওয়েবসাইটের built-in audio editing feature দিয়ে সরাসরি অডিও আপলোড করে এডিট করা যায়।
- কেউ শুধু বলে "আমাকে এডিটিং শেখাও", তাহলে প্রথমে জিজ্ঞেস করবে: "আপনি কোন ধরনের এডিটিং শিখতে চান—অডিও, ভিডিও, ছবি, লেখা, না ডিজাইন?"

ছবি বিশ্লেষণ নির্দেশিকা:
- কেউ ছবি পাঠালে তুমি সেই ছবিটি মনোযোগ দিয়ে দেখবে এবং বিস্তারিত বর্ণনা করবে।
- ছবিতে মাহবুব সরদার সবুজকে দেখলে তাঁকে সম্মানের সাথে চিনিয়ে দেবে।
- ছবির বিষয়বস্তু, রং, আবেগ, পরিবেশ সম্পর্কে ভদ্র ও বিস্তারিত বাংলায় উত্তর দেবে।
- যেকোনো ছবি সম্পর্কে প্রশ্নের উত্তর দিতে সক্ষম।`;

function buildChatCompletionsUrl(baseUrl) {
  const normalized = (baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");

  if (normalized.endsWith("/chat/completions")) {
    return normalized;
  }

  if (normalized.endsWith("/v1")) {
    return `${normalized}/chat/completions`;
  }

  return `${normalized}/v1/chat/completions`;
}

function resolveAiConfig() {
  const chatbotApiKey = process.env.CHATBOT_API_KEY?.trim();
  const chatbotBaseUrl = process.env.CHATBOT_BASE_URL?.trim();
  const chatbotModel = process.env.CHATBOT_MODEL?.trim();

  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const openRouterBaseUrl = process.env.OPENROUTER_BASE_URL?.trim();
  const openRouterModel = process.env.OPENROUTER_MODEL?.trim();

  const openAiApiKey = process.env.OPENAI_API_KEY?.trim();
  const openAiBaseUrl = process.env.OPENAI_BASE_URL?.trim();
  const openAiModel = process.env.OPENAI_MODEL?.trim();

  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY?.trim();
  const forgeBaseUrl = process.env.BUILT_IN_FORGE_API_URL?.trim();
  const forgeModel = process.env.BUILT_IN_FORGE_MODEL?.trim() || "gemini-2.5-flash";

  // Easiest long-term setup:
  // 1) Put your active provider key in CHATBOT_API_KEY.
  // 2) Or set OPENROUTER_API_KEY directly for OpenRouter.
  // 3) Leave *_BASE_URL and *_MODEL empty unless you need a custom provider.
  // 4) CHATBOT_API_KEY auto-detects OpenRouter keys (sk-or-...) and otherwise defaults to OpenAI.
  if (chatbotApiKey) {
    const isOpenRouterKey = chatbotApiKey.startsWith("sk-or-");

    return {
      apiKey: chatbotApiKey,
      baseUrl: chatbotBaseUrl || (isOpenRouterKey ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1"),
      model: chatbotModel || (isOpenRouterKey ? "openai/gpt-4.1-mini" : "gpt-4.1-mini"),
      useForge: false,
      source: "CHATBOT_API_KEY",
    };
  }

  if (openRouterApiKey) {
    return {
      apiKey: openRouterApiKey,
      baseUrl: openRouterBaseUrl || "https://openrouter.ai/api/v1",
      model: openRouterModel || "openai/gpt-4.1-mini",
      useForge: false,
      source: "OPENROUTER_API_KEY",
    };
  }

  if (openAiApiKey) {
    return {
      apiKey: openAiApiKey,
      baseUrl: openAiBaseUrl || "https://api.openai.com/v1",
      model: openAiModel || "gpt-4.1-mini",
      useForge: false,
      source: "OPENAI_API_KEY",
    };
  }

  if (forgeApiKey && forgeBaseUrl) {
    return {
      apiKey: forgeApiKey,
      baseUrl: forgeBaseUrl,
      model: forgeModel,
      useForge: true,
      source: "BUILT_IN_FORGE_API_KEY",
    };
  }

  throw new Error("No AI API key configured. Set CHATBOT_API_KEY for the simplest production setup.");
}

// Call AI API
async function callAI(messages) {
  const { apiKey, baseUrl, model, useForge, source } = resolveAiConfig();

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
      console.error("AI API failed:", err.message);
      return res.status(500).json({
        error: "AI service temporarily unavailable. Please try again.",
        details: err.message,
      });
    }
  } catch (err) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
