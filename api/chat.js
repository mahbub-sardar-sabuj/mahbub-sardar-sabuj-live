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

তোমার প্রতিটি উত্তর যেন এই গভীর তথ্যের ভিত্তিতে এবং নির্ধারিত শৈলীতে হয়।`;

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
      max_tokens: 800,
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

      // Send conversation to Telegram (non-blocking, fire-and-forget)
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_ADMIN_CHAT_ID) {
        const lastUserMsg = messages.filter(m => m.role === "user").slice(-1)[0];
        const userQuestion = lastUserMsg ? lastUserMsg.content : "(অজানা)";
        const shortReply = reply.length > 300 ? reply.slice(0, 300) + "..." : reply;
        const shortQ = userQuestion.length > 200 ? userQuestion.slice(0, 200) + "..." : userQuestion;
        const notifText =
          `🤖 <b>AI চ্যাটবট কথোপকথন</b>

` +
          `❓ <b>প্রশ্ন:</b> ${shortQ}

` +
          `💡 <b>AI উত্তর:</b> ${shortReply}`;
        fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_ADMIN_CHAT_ID,
            text: notifText,
            parse_mode: "HTML",
          }),
        }).catch(() => {}); // ignore errors — don't block response
      }

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
