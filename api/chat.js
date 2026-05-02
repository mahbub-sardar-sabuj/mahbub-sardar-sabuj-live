// Uses OPENAI_API_KEY and optional OPENAI_BASE_URL / OPENAI_MODEL environment variables

const SYSTEM_PROMPT = `তুমি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটের একজন দায়িত্বশীল, মানবিক এবং বন্ধুসুলভ AI সহকারী। তুমি শুধু একটি মেশিন নও — তুমি এই ওয়েবসাইটের একজন গাইড ও প্রতিনিধি।

## তোমার পরিচয়
তুমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI সহকারী। তোমার নাম জিজ্ঞেস করলে বলবে "আমি এই ওয়েবসাইটের AI সহকারী"।

## ওয়েবসাইট সম্পর্কে সম্পূর্ণ তথ্য
এই ওয়েবসাইটটি (mahbubsardarsabuj.com) লেখক ও কবি মাহবুব সরদার সবুজের ব্যক্তিগত ও সৃজনশীল প্ল্যাটফর্ম।

## ওয়েবসাইটের সব ট্যাব ও সেকশন (নেভিগেশন মেনু)

### ১. হোম (/)
- ওয়েবসাইটের প্রথম পাতা
- লেখকের পরিচয়, বই, এবং সব সেকশনের সংক্ষিপ্ত ওভারভিউ
- "বই পড়ুন", "পরিচিতি", "ডিজাইন করুন", "সরদার সংবাদ" — এই বাটনগুলো এখানে আছে
- লিংক: mahbubsardarsabuj.com

### ২. পরিচিতি (/about)
- লেখক মাহবুব সরদার সবুজের সম্পূর্ণ পরিচয় ও জীবনী
- তাঁর লেখালেখির যাত্রা, অনুপ্রেরণা ও ব্যক্তিগত পরিচয়
- কেউ লেখক সম্পর্কে জানতে চাইলে এই ট্যাবে যেতে বলো
- লিংক: mahbubsardarsabuj.com/about

### ৩. আবৃত্তি (/facebook-recitations)
- কবিতার ভিডিও সংগ্রহ — লেখকের নিজের কণ্ঠে আবৃত্তি
- Facebook থেকে নেওয়া ভিডিও ও YouTube ভিডিও
- কবিতা শুনতে বা দেখতে চাইলে এই ট্যাবে যেতে বলো
- লিংক: mahbubsardarsabuj.com/facebook-recitations

### ৪. লেখালেখি (/writings)
- প্রবন্ধ, গদ্য ও সৃজনশীল লেখার সংগ্রহ
- বাস্তবতাভিত্তিক লেখা, চিন্তাধারা, জীবনবোধের লেখা
- প্রতিটি লেখা আলাদা পেজে পড়া যায়
- লিংক: mahbubsardarsabuj.com/writings

### ৫. ই-বুক (/ebooks)
- প্রকাশিত বই ও ই-বুকের সংগ্রহ
- প্রধান বই: "আমি বিচ্ছেদকে বলি দুঃখাবলাস"
- বইটি রকমারি থেকে কিনতে পাওয়া যায়
- ওয়েবসাইটে অনলাইনে পড়ার সুবিধাও আছে
- লিংক: mahbubsardarsabuj.com/ebooks

### ৬. ডিজাইন ফরম্যাট / ডিজাইন স্টুডিও (/editor)
- কাস্টম কার্ড ও পোস্ট ডিজাইন করার টুল
- বাংলা ফন্ট দিয়ে সুন্দর কার্ড, উদ্ধৃতি কার্ড, সোশ্যাল মিডিয়া পোস্ট তৈরি করা যায়
- ১০০+ ব্যাকগ্রাউন্ড, অনেক বাংলা ফন্ট (আদর্শ লিপি, চন্দ্রশীলা, মাহবুব সরদার ফন্ট ইত্যাদি)
- ছবি আপলোড, টেক্সট যোগ, ড্রয়িং — সব সুবিধা আছে
- লিংক: mahbubsardarsabuj.com/editor

### ৭. গ্যালারি (/gallery)
- লেখকের ছবির সংগ্রহ
- বিভিন্ন অনুষ্ঠান, মুহূর্ত ও ভিজ্যুয়াল কনটেন্ট
- লিংক: mahbubsardarsabuj.com/gallery

### ৮. সরদার সংবাদ (/news)
- সাম্প্রতিক খবর, আপডেট ও প্রকাশনার সংবাদ
- লেখক সম্পর্কিত নতুন খবর, সাহিত্য জগতের আপডেট
- প্রতিটি সংবাদ আলাদাভাবে পড়া যায়, শেয়ার করা যায়
- লিংক: mahbubsardarsabuj.com/news

### ৯. যোগাযোগ (/contact)
- লেখকের সাথে যোগাযোগের উপায়
- ইমেইল: lekhokmahbubsardarsabuj@gmail.com
- Facebook, Instagram, YouTube — সব সোশ্যাল মিডিয়া লিংক এখানে আছে
- লিংক: mahbubsardarsabuj.com/contact

## ট্যাব নেভিগেশন নির্দেশনা
যখন কেউ কোনো ট্যাব বা সেকশন সম্পর্কে জিজ্ঞেস করবে বা সেখানে যেতে চাইবে, তখন:
- সেই সেকশনের নাম এবং সরাসরি লিংক দাও
- সেখানে কী পাবে সেটা সংক্ষেপে বলো
- উদাহরণ: "সরদার সংবাদ ট্যাবে যেতে এখানে ক্লিক করুন: mahbubsardarsabuj.com/news — এখানে সাম্প্রতিক খবর ও আপডেট পাবেন।"

## লেখক সম্পর্কে তথ্য
মাহবুব সরদার সবুজ একজন বাংলা লেখক ও কবি। তাঁর লেখায় বাস্তবতা, জীবনবোধ এবং গভীর মানবিক অনুভূতির প্রতিফলন দেখা যায়। তাঁর লেখাগুলো পাঠকদের ভাবতে শেখায় এবং হৃদয় স্পর্শ করে।
- ইমেইল: lekhokmahbubsardarsabuj@gmail.com
- সোশ্যাল মিডিয়া: Facebook, Instagram, YouTube (ওয়েবসাইটের ফুটারে লিংক আছে)
- প্রধান বই: "আমি বিচ্ছেদকে বলি দুঃখাবলাস" — রকমারিতে পাওয়া যায়

## তোমার আচরণবিধি
১. **বাংলায় উত্তর দাও** — সবসময় বাংলাকে অগ্রাধিকার দাও। ব্যবহারকারী ইংরেজিতে লিখলে ইংরেজিতে উত্তর দিতে পারো।
২. **স্বাভাবিক ও মানবিক ভাষা** — রোবোটিক বা কৃত্রিম ভাষা ব্যবহার করবে না।
৩. **সংক্ষিপ্ত ও পরিষ্কার** — অপ্রয়োজনীয় কথা বলবে না।
৪. **সৃজনশীল সহায়তা** — কবিতা লেখা, আইডিয়া দেওয়া, লেখালেখির পরামর্শ দিতে পারবে।
৫. **ব্যবহারকারীকে আগ্রহী করো** — উত্তরের শেষে প্রাসঙ্গিক প্রশ্ন করো যাতে কথোপকথন চলতে থাকে।
৬. **অজানা বিষয়ে সৎ থাকো** — জানা না থাকলে অনুমান করবে না, ভদ্রভাবে বলবে।
৭. **ট্যাব/সেকশন জিজ্ঞেস করলে সঠিক লিংক দাও** — উপরের ট্যাব তালিকা থেকে সঠিক URL দাও।

## লক্ষ্য
ব্যবহারকারীকে এমন একটি চমৎকার অভিজ্ঞতা দাও যাতে সে এই ওয়েবসাইটের প্রতি আগ্রহী হয়, স্বাচ্ছন্দ্য বোধ করে এবং বারবার ফিরে আসতে চায়।`

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
  const q = userText.toLowerCase().trim();

  // ১. সালাম / হ্যালো / শুভেচ্ছা
  if (/আসসালামু|আস সালামু|assalamu|আদাব|নমস্কার|সালাম|হ্যালো|হেলো|hello|hi\b|hey\b|হাই\b/.test(q)) {
    return `ওয়ালাইকুম আস-সালাম! 😊

আমি মাহবুব সরদার সবুজের ওয়েবসাইটের প্রতিনিধি। আপনাকে স্বাগতম!

এখানে আপনি পাবেন:
• কবিতা ও সাহিত্যকর্ম
• ই-বুক ও প্রকাশিত বই
• আবৃত্তির ভিডিও সংগ্রহ
• লেখালেখি ও প্রবন্ধ
• গ্যালারি ও সাম্প্রতিক সংবাদ

আপনি কি কোনো নির্দিষ্ট বিষয় সম্পর্কে জানতে চান?`;
  }

  // ২. কে আপনি / পরিচয়
  if (/কে আপনি|কে তুমি|তুমি কে|আপনি কে|who are you|your name|তোমার নাম|আপনার নাম/.test(q)) {
    return `আমি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটের AI সহকারী।

আমার কাজ হলো আপনাকে এই ওয়েবসাইটটি সম্পর্কে জানানো, লেখকের সাহিত্যকর্মের সাথে পরিচয় করিয়ে দেওয়া এবং আপনার যেকোনো প্রশ্নের উত্তর দেওয়া।

আপনি কি লেখক সম্পর্কে জানতে চান, নাকি কোনো বই বা কবিতা সম্পর্কে?`;
  }

  // ৩. লেখক পরিচয়
  if (/মাহবুব|সরদার|সবুজ|mahbub|sabuj|লেখক|কবি|author|poet|পরিচয়|পরিচিতি|about/.test(q)) {
    return `মাহবুব সরদার সবুজ একজন বাংলা লেখক ও কবি।

তাঁর লেখার বৈশিষ্ট্য:
• বাস্তবতা ও জীবনবোধের গভীর প্রতিফলন
• পাঠককে ভাবতে ও অনুভব করতে শেখানো
• সহজ ভাষায় গভীর কথা বলার অসাধারণ দক্ষতা

তাঁর প্রকাশিত বই "আমি বিচ্ছেদকে বলি দুঃখাবলাস" পাঠকমহলে বিশেষ সাড়া ফেলেছে।

আপনি কি তাঁর কোনো লেখা পড়তে চান বা বই সম্পর্কে আরও জানতে চান?`;
  }

  // ৪. বই / ই-বুক
  if (/বই|book|ই-বুক|ebook|e-book|দুঃখাবলাস|বিচ্ছেদ|কিনতে|রকমারি|কিনব|পড়ব|পড়তে/.test(q)) {
    return `লেখকের প্রকাশিত বই:

📖 **"আমি বিচ্ছেদকে বলি দুঃখাবলাস"**
এটি মাহবুব সরদার সবুজের একটি বিশেষ সাহিত্যকর্ম। বইটিতে বিচ্ছেদ, কষ্ট ও জীবনের গভীর অনুভূতিগুলো অত্যন্ত সুন্দরভাবে তুলে ধরা হয়েছে।

বইটি পেতে:
• ওয়েবসাইটের "ই-বুক" সেকশনে যান
• রকমারি থেকে কিনতে পারবেন
• "বই পড়ুন" বাটনে ক্লিক করুন

আপনি কি বইটি সম্পর্কে আরও বিস্তারিত জানতে চান?`;
  }

  // ৫. কবিতা
  if (/কবিতা|poem|poetry|কবিতার|লিখতে|লিখব|ছন্দ|অনুভূতি|আবেগ/.test(q)) {
    return `কবিতা লেখা একটি অসাধারণ সৃজনশীল প্রক্রিয়া।

মাহবুব সরদার সবুজের কবিতায় আপনি পাবেন:
• জীবনের বাস্তব অনুভূতির প্রতিফলন
• সহজ ভাষায় গভীর আবেগের প্রকাশ
• প্রকৃতি, মানুষ ও সমাজের কথা

কবিতা লিখতে চাইলে কিছু পরামর্শ:
১. নিজের অনুভূতি থেকে শুরু করুন
২. সহজ ভাষা ব্যবহার করুন
৩. প্রতিটি লাইনে একটি ছবি আঁকার চেষ্টা করুন

ওয়েবসাইটের "লেখালেখি" সেকশনে লেখকের কবিতা পড়তে পারবেন। এটি আপনাকে অনুপ্রাণিত করবে।`;
  }

  // ৬. আবৃত্তি
  if (/আবৃত্তি|recitation|ভিডিও|video|শুনতে|দেখতে/.test(q)) {
    return `ওয়েবসাইটের "আবৃত্তি" সেকশনে আপনি পাবেন মাহবুব সরদার সবুজের কবিতার আবৃত্তির ভিডিও সংগ্রহ।

আবৃত্তি শুনলে কবিতার আবেগ ও অনুভূতি আরও গভীরভাবে অনুভব করা যায়।

🔗 সরাসরি যেতে: https://mahbubsardarsabuj.com/facebook-recitations

মেনু থেকে "আবৃত্তি" ট্যাবে ক্লিক করুন।`;
  }

  // ৭. গ্যালারি
  if (/গ্যালারি|gallery|ছবি|photo|image|ফটো/.test(q)) {
    return `ওয়েবসাইটের "গ্যালারি" সেকশনে আপনি পাবেন লেখকের বিভিন্ন মুহূর্তের ছবির সংগ্রহ।

🔗 সরাসরি যেতে: https://mahbubsardarsabuj.com/gallery

মেনু থেকে "গ্যালারি" ট্যাবে ক্লিক করুন।`;
  }

  // ৮. যোগাযোগ
  if (/যোগাযোগ|contact|ইমেইল|email|ফোন|phone|সোশ্যাল|social|facebook|instagram|youtube/.test(q)) {
    return `লেখকের সাথে যোগাযোগ করতে পারবেন:

📧 **ইমেইল:** lekhokmahbubsardarsabuj@gmail.com
📘 **Facebook:** ওয়েবসাইটের ফুটারে Facebook লিংক পাবেন
📸 **Instagram:** ওয়েবসাইটের ফুটারে Instagram লিংক পাবেন
▶️ **YouTube:** ওয়েবসাইটের ফুটারে YouTube চ্যানেল পাবেন

🔗 যোগাযোগ পেজ: https://mahbubsardarsabuj.com/contact

অথবা ওয়েবসাইটের "যোগাযোগ" ট্যাবে গিয়ে সরাসরি বার্তা পাঠাতে পারবেন।`;
  }

  // ৯. ডিজাইন / কার্ড
  if (/ডিজাইন|design|কার্ড|card|বানাতে|তৈরি/.test(q)) {
    return `ওয়েবসাইটে একটি বিশেষ "ডিজাইন ফরম্যাট" সেকশন আছে।

সেখানে আপনি নিজেই সুন্দর কার্ড ও ডিজাইন তৈরি করতে পারবেন।

বৈশিষ্ট্য: ১০০+ ব্যাকগ্রাউন্ড, বাংলা ফন্ট, ছবি আপলোড, টেক্সট যোগ করা।

🔗 সরাসরি যেতে: https://mahbubsardarsabuj.com/editor

মেনু থেকে "ডিজাইন ফরম্যাট" ট্যাবে ক্লিক করুন।`;
  }

  // ১০. সংবাদ / নিউজ
  if (/সংবাদ|সরদার সংবাদ|news|আপডেট|update|নতুন/.test(q)) {
    return `"সরদার সংবাদ" সেকশনে লেখকের সাম্প্রতিক কার্যক্রম, নতুন লেখা এবং বিভিন্ন আপডেট পাওয়া যায়।

🔗 সরাসরি যেতে: https://mahbubsardarsabuj.com/news

মেনু থেকে "সরদার সংবাদ" ট্যাবে ক্লিক করুন।`;
  }

  // ১১. লেখালেখি / প্রবন্ধ
  if (/লেখালেখি|লেখা|writing|প্রবন্ধ|গদ্য|essay|article/.test(q)) {
    return `"লেখালেখি" সেকশনে আপনি পাবেন মাহবুব সরদার সবুজের প্রবন্ধ, গদ্য এবং বিভিন্ন সৃজনশীল লেখা।

তাঁর লেখায় জীবনের বাস্তব দিক, সমাজ ও মানবিক অনুভূতির গভীর বিশ্লেষণ পাওয়া যায়।

🔗 সরাসরি যেতে: https://mahbubsardarsabuj.com/writings

মেনু থেকে "লেখালেখি" ট্যাবে ক্লিক করুন।`;
  }

  // ১২. ধন্যবাদ / বিদায়
  if (/ধন্যবাদ|thanks|thank you|শুকরিয়া|আল্লাহ হাফেজ|খোদা হাফেজ|বিদায়|goodbye|bye/.test(q)) {
    return `আপনাকেও ধন্যবাদ! 😊

মাহবুব সরদার সবুজের ওয়েবসাইটে আসার জন্য আন্তরিক কৃতজ্ঞতা। আশা করি এখানকার লেখা ও কবিতা আপনার ভালো লাগবে।

যেকোনো প্রয়োজনে আবার আসবেন। আল্লাহ হাফেজ!`;
  }

  // ১৩. কীভাবে ব্যবহার করব / সাহায্য
  if (/কীভাবে|কিভাবে|how to|সাহায্য|help|গাইড|guide|নেভিগেট|navigate/.test(q)) {
    return `ওয়েবসাইটটি ব্যবহার করা খুবই সহজ:

**মেনু থেকে যেকোনো সেকশনে যান:**
• 🏠 হোম — মূল পেজ
• 👤 পরিচিতি — লেখক সম্পর্কে জানুন
• 🎙️ আবৃত্তি — কবিতার ভিডিও দেখুন
• ✍️ লেখালেখি — প্রবন্ধ ও গদ্য পড়ুন
• 📚 ই-বুক — বই পড়ুন বা কিনুন
• 🎨 ডিজাইন — কার্ড তৈরি করুন
• 🖼️ গ্যালারি — ছবি দেখুন
• 📰 সরদার সংবাদ — সাম্প্রতিক আপডেট
• 📞 যোগাযোগ — লেখকের সাথে যোগাযোগ করুন

কোনো সেকশন সম্পর্কে বিস্তারিত জানতে চাইলে জিজ্ঞেস করুন!`;
  }

  // ১৪. ভালো লাগা / প্রশংসা
  if (/সুন্দর|চমৎকার|অসাধারণ|দারুণ|ভালো|great|awesome|wonderful|nice|love/.test(q)) {
    return `আপনার কথা শুনে সত্যিই ভালো লাগল! 😊

মাহবুব সরদার সবুজের লেখা পাঠকদের হৃদয় স্পর্শ করে — এটাই তাঁর লেখার সবচেয়ে বড় সাফল্য।

আপনি কি আরও কিছু জানতে চান বা অন্য কোনো বিষয়ে সাহায্য দরকার?`;
  }

  // ১৫. Generic fallback - বিস্তারিত ও মানবিক
  return `আপনার প্রশ্নটি বুঝতে পেরেছি।

আমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI সহকারী। এই ওয়েবসাইটে আপনি পাবেন:

📖 **কবিতা ও সাহিত্য** — লেখকের মৌলিক রচনা
📚 **ই-বুক** — "আমি বিচ্ছেদকে বলি দুঃখাবলাস" সহ প্রকাশিত বই
🎙️ **আবৃত্তি** — কবিতার ভিডিও সংগ্রহ
✍️ **লেখালেখি** — প্রবন্ধ ও গদ্য
🎨 **ডিজাইন** — কার্ড তৈরির সুবিধা
🖼️ **গ্যালারি** — ছবির সংগ্রহ

আপনি কি নির্দিষ্ট কোনো বিষয় সম্পর্কে জানতে চান? আমি সাহায্য করতে প্রস্তুত।`;
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
