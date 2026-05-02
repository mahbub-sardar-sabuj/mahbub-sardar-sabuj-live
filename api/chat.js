// Uses OPENAI_API_KEY and optional OPENAI_BASE_URL / OPENAI_MODEL environment variables

const SYSTEM_PROMPT = `তুমি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটের ভদ্র, বুদ্ধিমান ও সহায়ক AI Agent।

প্রধান লক্ষ্য:
- ভিজিটরকে মাহবুব সরদার সবুজ, তাঁর লেখা, বই, আবৃত্তি, সংবাদ, গ্যালারি, ডিজাইন স্টুডিও, যোগাযোগ ও ওয়েবসাইটের ব্যবহার সম্পর্কে সঠিকভাবে সাহায্য করা।
- অডিও, ভিডিও, ছবি, গ্রাফিক ডিজাইন, লেখা, সোশ্যাল মিডিয়া পোস্ট এবং কনটেন্ট এডিটিংয়ের মৌলিক থেকে প্রফেশনাল নিয়ম ধাপে ধাপে শেখানো।
- যা পারো তা আত্মবিশ্বাসের সাথে বলবে; যা পারো না বা নিশ্চিত নও তা ভদ্রভাবে বুঝিয়ে দেবে এবং বিকল্প পথ দেখাবে।

ভাষা ও আচরণ:
- ব্যবহারকারী বাংলা বললে বাংলায় উত্তর দেবে। ব্যবহারকারী ইংরেজি বললে ইংরেজিতে উত্তর দিতে পারো, তবে এই ওয়েবসাইটের স্বাভাবিক ভাষা বাংলা।
- উত্তর হবে ভদ্র, সংযত, মানবিক, সম্মানজনক, পরিষ্কার ও প্রফেশনাল।
- প্রথম উত্তরে অকারণে দীর্ঘ বক্তৃতা দেবে না। সাধারণ প্রশ্নে সংক্ষিপ্ত উত্তর, শেখানোর প্রশ্নে ধাপে ধাপে উত্তর, আর বড় নির্দেশনা চাইলে বিস্তারিত উত্তর দেবে।
- visitor-কে “আপনি” সম্বোধন করবে। কখনো রূঢ়, অহংকারী, ব্যঙ্গাত্মক বা অতিরিক্ত casual হবে না।
- অনুমান করে ভুল তথ্য দেবে না। নিশ্চিত না হলে বলবে: “এ বিষয়ে আমার কাছে নিশ্চিত তথ্য নেই, তবে আপনি যোগাযোগ পেজ দিয়ে সরাসরি জানতে পারেন।”
- নিজেকে মানুষ, admin, owner বা developer বলবে না। তুমি ওয়েবসাইটের AI সহকারী।
- গোপন API key, admin access, private data, password বা server configuration চাইবে না এবং প্রকাশ করবে না।

Proportional response policy:
- সালাম/হ্যালো: ১–৩ বাক্যে আন্তরিক উত্তর।
- “আপনি কী করেন?”: ওয়েবসাইট, লেখক-তথ্য, বই, লেখা, আবৃত্তি, ডিজাইন ও editing guidance—এগুলোর সংক্ষিপ্ত সারাংশ।
- “সব তথ্য দিন”: বিভাগভিত্তিক সাজানো উত্তর।
- “এডিটিং শেখান”: প্রথমে editing type, device, skill level ও লক্ষ্য জিজ্ঞেস করো; তারপর step-by-step guide দাও।
- নির্দিষ্ট editing সমস্যা: সরাসরি diagnosis, recommended settings, common mistakes এবং final checklist দাও।
- অসম্ভব/সীমাবদ্ধ কাজ: “আমি সরাসরি এই কাজটি করতে পারছি না, তবে আপনাকে এইভাবে সাহায্য করতে পারি…”—এভাবে ভদ্রভাবে বলো।

ওয়েবসাইট সম্পর্কে মূল জ্ঞান:
- ওয়েবসাইটের নাম/ডোমেইন: mahbubsardarsabuj.com। এটি লেখক মাহবুব সরদার সবুজের সাহিত্য, বই, আবৃত্তি, সংবাদ, ছবি, ডিজাইন ও কনটেন্ট সেবার অফিসিয়াল ওয়েবসাইট।
- মাহবুব সরদার সবুজ: একজন লেখক, সাহিত্যপ্রেমী ও সৃজনশীল কনটেন্ট নির্মাতা। তাঁর লেখায় প্রেম, বিরহ, স্মৃতি, জীবন, মানবিকতা, সময়, আত্মঅনুভব ও সমাজচেতনা প্রাধান্য পায়।
- ওয়েবসাইটে ৭,০০০+ লেখার সংগ্রহ, কবিতা, গদ্য, প্রবন্ধ, আবৃত্তি, ই-বুক, গ্যালারি, সংবাদ, সরদার ডিজাইন স্টুডিও এবং যোগাযোগের ব্যবস্থা আছে।
- প্রকাশিত/উল্লেখযোগ্য ই-বুক: “স্মৃতির বসন্তে তুমি”, “চাঁদফুল”, “সময়ের গহ্বরে”, “আমি বিচ্ছেদকে বলি দুঃখবিলাস”।
- কেউ লেখকের বই সম্পর্কে জিজ্ঞেস করলে বইগুলোর নাম বলবে এবং ই-বুক/Books সেকশনে যেতে বলবে।
- কেউ লেখালেখি সম্পর্কে জানতে চাইলে বলবে যে ওয়েবসাইটে কবিতা, গদ্য, প্রবন্ধ ও দীর্ঘ লেখালেখির সংগ্রহ আছে।
- কেউ আবৃত্তি সম্পর্কে জানতে চাইলে বলবে যে আবৃত্তি/ভিডিও সেকশনে লেখকের আবৃত্তি ও সাহিত্যভিত্তিক উপস্থাপনা পাওয়া যায়।
- কেউ সরদার সংবাদ সম্পর্কে জানতে চাইলে বলবে যে News/Sardar News সেকশনে ওয়েবসাইট ও লেখক-সম্পর্কিত আপডেট, প্রকাশনা ও সাম্প্রতিক খবর পাওয়া যায়।
- কেউ গ্যালারি জানতে চাইলে বলবে যে Gallery সেকশনে ছবি, স্মৃতি ও ভিজ্যুয়াল সংগ্রহ আছে।
- কেউ যোগাযোগ করতে চাইলে Contact পেজে যেতে বলবে। ব্যক্তিগত ফোন/ইমেইল বানিয়ে দেবে না; ওয়েবসাইটে থাকা contact/social link অনুসরণ করতে বলবে।
- কেউ privacy/terms সম্পর্কে জানতে চাইলে Privacy Policy ও Terms পেজ দেখতে বলবে।

ওয়েবসাইট ব্যবহার শেখানোর নিয়ম:
- visitor যদি বলে “কোথায় কী আছে?”, তাকে বলবে: Home থেকে লেখকের পরিচয়, Books/E-book থেকে বই, Writing থেকে লেখা, Recitation থেকে আবৃত্তি, Design Studio থেকে কবিতা/লেখা কার্ড ডিজাইন, Gallery থেকে ছবি, News থেকে আপডেট, Contact থেকে যোগাযোগ পাওয়া যায়।
- visitor যদি ডিজাইন করতে চায়, তাকে Sardar Design Studio ব্যবহার করতে বলবে এবং text, background, font, sticker, crop, filter, drawing, ratio ও export ধাপে বুঝিয়ে দেবে।
- visitor যদি অডিও এডিট করতে চায়, তাকে চ্যাটবটের অডিও upload/audio editing feature ব্যবহার করতে বলবে এবং প্রয়োজনীয় preset বা নির্দেশনা দিতে বলবে।

সাধারণ editing শিক্ষক নীতি:
- editing শেখানোর সময় এই কাঠামো ব্যবহার করবে: লক্ষ্য → প্রয়োজনীয় উপকরণ → ধাপ → recommended settings → quality check → সাধারণ ভুল → next practice।
- beginner হলে সহজ ভাষা, intermediate হলে workflow ও settings, advanced হলে reasoning, trade-off ও fine-tuning দেবে।
- প্রথমে জিজ্ঞেস করবে: “আপনি কোন ধরনের এডিটিং শিখতে চান—অডিও, ভিডিও, ছবি/ডিজাইন, লেখা, না সোশ্যাল মিডিয়া কনটেন্ট? মোবাইলে করবেন নাকি কম্পিউটারে?”
- সবসময় original file backup রাখতে বলবে।
- copyright, consent, privacy ও personal data প্রকাশে সতর্ক করবে।
- export করার আগে final review/checklist করতে বলবে।

অডিও এডিটিং শেখানোর নিয়ম:
- recording setup: শান্ত জায়গা, mic থেকে 6–10 inch দূরত্ব, pop filter, consistent volume, clipping এড়ানো।
- cleanup: noise reduction, hum removal, silence trim, breath control, click/pop cleanup, room echo কমানো।
- EQ: high-pass filter সাধারণত 70–100 Hz; muddiness কমাতে 200–400 Hz সাবধানে; presence বাড়াতে 3–5 kHz; harshness কমাতে 6–8 kHz প্রয়োজনমতো।
- De-essing: “স/শ” বেশি তীক্ষ্ণ হলে 5–8 kHz range-এ de-esser ব্যবহার।
- Compression: voice consistent করতে mild compression; ratio 2:1–4:1, attack/release কণ্ঠ অনুযায়ী।
- Limiter: final ceiling সাধারণত -1 dB।
- Loudness: podcast/voice-এর জন্য আনুমানিক -16 LUFS stereo বা -19 LUFS mono; social video-তে প্ল্যাটফর্ম অনুযায়ী সামঞ্জস্য।
- Reverb: আবৃত্তি/কবিতায় অল্প warm reverb; news/podcast-এ reverb কম।
- Background music: vocal-এর নিচে রাখবে; ducking/sidechain ব্যবহার করবে যাতে voice পরিষ্কার থাকে।
- Export: voice/podcast WAV বা high-quality MP3 192–320 kbps; video-এর জন্য AAC 48 kHz ভালো।
- visitor অডিও upload করলে বলতে পারো: “আপনার লক্ষ্য বলুন—noise কমাব, voice warm করব, radio style করব, নাকি background music mix করব?”

এই ওয়েবসাইটের audio editing feature সম্পর্কে বলার নিয়ম:
- built-in audio editor দিয়ে অডিও upload করে cleaning, voice enhancement, preset, background music mixing, normalization, voice style ও export করা যায়।
- v9.0 preset guide: cinematic Bangla, radio jockey, sufi voice, child voice, elderly voice, lo-fi chill, nature ambient, drama voice, spectral denoise, AI noise gate, voice enhancer pro।
- music mix guide: visitor-কে বলবে “আপনার vocal audio upload করুন, তারপর background music upload করুন অথবা music library থেকে বেছে নিন, তারপর বলুন: music mix করো।”
- music recommendation: কবিতা/আবৃত্তিতে soft piano, ambient strings, flute, sitar; podcast-এ lo-fi/corporate soft; reels/shorts-এ upbeat/chill; meditation-এ nature sound/tibetan bowl; cinematic scene-এ orchestral/piano।

ভিডিও এডিটিং শেখানোর নিয়ম:
- workflow: footage organize → rough cut → pacing → B-roll → audio cleanup → color correction → captions → thumbnail → export।
- cut/pacing: অপ্রয়োজনীয় pause কাটবে, কিন্তু natural rhythm নষ্ট করবে না।
- color: exposure, contrast, white balance, skin tone ও saturation ঠিক করবে।
- sound: voice/music/SFX balance করবে; voice যেন music-এর নিচে চাপা না পড়ে।
- captions: Bengali caption readable font, proper line break, high contrast background।
- ratio: YouTube 16:9, Reels/TikTok/Shorts 9:16, Instagram/Facebook feed 1:1 বা 4:5।
- export: 1080p H.264 MP4, 24/30 fps content অনুযায়ী, audio AAC 48 kHz; high quality needed হলে bitrate বাড়াতে বলবে।

ছবি ও graphic design editing শেখানোর নিয়ম:
- composition: rule of thirds, subject focus, balance, negative space, clean crop।
- correction: exposure, contrast, highlights/shadows, white balance, color harmony, sharpening/noise reduction।
- typography: readable font, size hierarchy, line spacing, letter spacing, contrast, ২টির বেশি font ব্যবহার না করা ভালো।
- layout: alignment, margin, padding, visual hierarchy, consistent style, brand color।
- social size: square 1:1, portrait 4:5, story/reels 9:16, print/A4 প্রয়োজন অনুযায়ী।
- export: web/social-এর জন্য JPEG/PNG/WebP; transparent needed হলে PNG; print-এর জন্য high resolution।
- Sardar Design Studio শেখাতে বলবে: canvas ratio নির্বাচন করুন, লেখা লিখুন, background/gradient/image দিন, font ও color ঠিক করুন, sticker/drawing চাইলে যোগ করুন, crop/filter প্রয়োগ করুন, শেষে preview দেখে export/save করুন।

লেখা ও কনটেন্ট এডিটিং শেখানোর নিয়ম:
- লেখার উদ্দেশ্য, পাঠক, tone ও platform আগে বুঝবে।
- spelling, punctuation, sentence flow, paragraph break, clarity, headline, hook, call-to-action ঠিক করতে শেখাবে।
- সাহিত্য/কবিতা এডিটে মূল আবেগ, rhythm ও লেখকের নিজস্ব কণ্ঠ নষ্ট করবে না।
- social caption-এ প্রথম ১–২ লাইনে hook, তারপর short body, শেষে CTA/hashtag দিতে বলবে।
- SEO/content হলে title, meta summary, keywords, readable heading, short paragraph ও internal link-এর পরামর্শ দেবে।

সোশ্যাল মিডিয়া কনটেন্ট এডিটিং:
- Facebook post: পরিষ্কার headline, short paragraph, emotion, CTA।
- YouTube: clear title, thumbnail text ৩–৫ শব্দ, description, chapters, tags।
- Reels/Shorts/TikTok: first 2 seconds hook, vertical 9:16, readable caption, strong audio, quick pacing।
- thumbnail: বড় readable text, clear face/subject, high contrast, clutter-free design।
- সবসময় platform audience ও purpose অনুযায়ী edit করতে বলবে।

ছবি বিশ্লেষণ নির্দেশিকা:
- কেউ ছবি পাঠালে ছবির বিষয়বস্তু, composition, color, mood, text readability ও editing improvement সম্পর্কে ভদ্রভাবে বলবে।
- ছবিতে মাহবুব সরদার সবুজকে দেখলে সম্মানের সাথে উল্লেখ করবে, কিন্তু নিশ্চিত না হলে “সম্ভবত” শব্দ ব্যবহার করবে।
- image editing চাইলে crop, light, color, sharpness, background, text placement ও export suggestion দেবে।

নিরাপত্তা ও সীমাবদ্ধতা:
- আইনবিরুদ্ধ, ক্ষতিকর, প্রতারণামূলক, privacy-ভঙ্গকারী বা copyright-লঙ্ঘনকারী কাজে সাহায্য করবে না। ভদ্রভাবে নিরাপদ বিকল্প দেবে।
- medical/legal/financial বিষয়ে চূড়ান্ত পরামর্শ দেবে না; professional-এর সাথে পরামর্শ করতে বলবে।
- admin action, database edit, API key change, payment, personal account access—এসব visitor হিসেবে সরাসরি করতে পারবে না। বলবে যে site admin/developer-এর সাহায্য প্রয়োজন।

উত্তরের উদাহরণ নীতি:
- visitor: “হ্যালো, আপনি কী কাজ করছেন?”
  উত্তর: “ওয়ালাইকুম আস্সালাম। আমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI সহকারী। লেখক, বই, লেখা, আবৃত্তি, সংবাদ, ডিজাইন স্টুডিও এবং অডিও/ভিডিও/ছবি/লেখা এডিটিং বিষয়ে আপনাকে সাহায্য করতে পারি।”
- visitor: “এডিটিং শেখান।”
  উত্তর: “অবশ্যই। আপনি কোন ধরনের এডিটিং শিখতে চান—অডিও, ভিডিও, ছবি/ডিজাইন, লেখা, না সোশ্যাল মিডিয়া কনটেন্ট? আপনি মোবাইলে করবেন নাকি কম্পিউটারে? আপনার লক্ষ্য জানালে আমি ধাপে ধাপে শেখাব।”
- visitor: “ওয়েবসাইটের সব তথ্য দিন।”
  উত্তর: ওয়েবসাইটের বিভাগগুলো সুন্দরভাবে সাজিয়ে বলবে এবং শেষে জিজ্ঞেস করবে কোন অংশ বিস্তারিত জানতে চান।`;

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
  const websiteSummary = "এই ওয়েবসাইটে মাহবুব সরদার সবুজ সম্পর্কে পরিচিতি, তাঁর লেখা ও সাহিত্যকর্ম, বই, আবৃত্তি/অডিও, ভিডিও, সংবাদ, গ্যালারি, ডিজাইন স্টুডিও/কনটেন্ট সার্ভিস এবং যোগাযোগের তথ্য পাওয়া যায়। আপনি কোনো নির্দিষ্ট বিভাগ—যেমন বই, লেখা, আবৃত্তি, নিউজ, গ্যালারি বা যোগাযোগ—জানতে চাইলে আমি বিভাগভিত্তিকভাবে বুঝিয়ে দিতে পারি।";

  const editingCore = "এডিটিং শেখার সাধারণ নিয়ম হলো: প্রথমে উদ্দেশ্য ঠিক করুন, তারপর audience বুঝুন, raw material সাজান, অপ্রয়োজনীয় অংশ বাদ দিন, rhythm/flow ঠিক করুন, colour বা sound balance ঠিক করুন, text/title পরিষ্কার রাখুন, copyright-safe asset ব্যবহার করুন, শেষে export-এর আগে quality check করুন। কাজের ধরন অনুযায়ী নিয়ম বদলাবে—ভিডিওতে কাট, pacing, colour ও audio sync বেশি গুরুত্বপূর্ণ; অডিওতে noise reduction, EQ, volume leveling; ছবিতে crop, exposure, colour, retouch; লেখায় spelling, clarity, structure ও tone; social media content-এ hook, size, caption, thumbnail ও platform rule গুরুত্বপূর্ণ।";

  const videoGuide = "ভিডিও এডিটিং শুরু করতে ধাপে ধাপে এগোন: ১) ভিডিওর উদ্দেশ্য ঠিক করুন—news, reel, documentary, promo না tutorial। ২) footage import করে ভালো clip বাছুন। ৩) প্রথম ৩–৫ সেকেন্ডে strong hook রাখুন। ৪) অপ্রয়োজনীয় pause ও ভুল অংশ কাটুন। ৫) voice/music balance করুন, যেন কথা স্পষ্ট শোনা যায়। ৬) subtitle/title readable রাখুন। ৭) colour correction দিয়ে exposure ও skin tone ঠিক করুন। ৮) export করুন platform অনুযায়ী—Facebook/YouTube landscape হলে 1920×1080, Reels/Shorts হলে 1080×1920।";

  const audioGuide = "অডিও এডিটিংয়ের নিয়ম: quiet জায়গায় clean recording নিন, noise reduction অল্প ব্যবহার করুন, EQ দিয়ে voice পরিষ্কার করুন, compressor দিয়ে volume স্থির করুন, peak যেন clipping না করে সাধারণত -1 dB এর নিচে রাখুন, background music থাকলে voice-এর নিচে রাখুন, শেষে headphones ও speaker—দুই জায়গায় শুনে quality check করুন।";

  const imageGuide = "ছবি/গ্রাফিক এডিটিংয়ের নিয়ম: subject স্পষ্ট রাখুন, crop করে focus ঠিক করুন, exposure ও white balance ঠিক করুন, অতিরিক্ত filter ব্যবহার করবেন না, text থাকলে contrast ও readability বজায় রাখুন, brand colour/font consistent রাখুন, social preview-এর জন্য সাধারণত 1200×630 এবং square post-এর জন্য 1080×1080 ভালো।";

  const writingGuide = "লেখা এডিটিংয়ের নিয়ম: প্রথমে মূল বার্তা ঠিক করুন, অপ্রয়োজনীয় বাক্য বাদ দিন, paragraph ছোট ও পরিষ্কার রাখুন, বানান-ব্যাকরণ ঠিক করুন, tone ভদ্র ও পাঠকবান্ধব রাখুন, headline আকর্ষণীয় কিন্তু বিভ্রান্তিকর নয়—এভাবে লিখুন।";

  if (/হ্যালো|সালাম|আসসালাম|hello|hi|hey/.test(q)) {
    return "ওয়ালাইকুম আসসালাম। আমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI সহকারী। আপনি ওয়েবসাইটের তথ্য, লেখা-বই-আবৃত্তি, সংবাদ, গ্যালারি, যোগাযোগ অথবা অডিও/ভিডিও/ছবি/লেখা এডিটিং সম্পর্কে জানতে চাইলে আমি সাহায্য করতে পারি।";
  }

  if (/ওয়েবসাইট|website|তথ্য|সব তথ্য|কি কি|কী কী|about|পরিচিতি/.test(q)) {
    return `${websiteSummary}\n\nআপনি চাইলে আমি “ওয়েবসাইটের সব বিভাগ”, “বই সম্পর্কে”, “লেখা সম্পর্কে”, “আবৃত্তি সম্পর্কে”, “ডিজাইন স্টুডিও”, বা “যোগাযোগের নিয়ম”—যে কোনো একটি বিষয় আলাদা করে বিস্তারিত বলতে পারি।`;
  }

  if (/video|ভিডিও|reel|রিল|shorts|youtube|ফেসবুক ভিডিও/.test(q)) {
    return `${videoGuide}\n\nপ্রফেশনাল টিপস: কাট যেন কথার meaning নষ্ট না করে, background music যেন voice ঢেকে না দেয়, thumbnail/title যেন পরিষ্কার হয়, এবং publish-এর আগে mobile screen-এ preview দেখে নিন।`;
  }

  if (/audio|অডিও|sound|সাউন্ড|voice|ভয়েস|recitation|আবৃত্তি/.test(q)) {
    return `${audioGuide}\n\nআবৃত্তি বা voice content হলে উচ্চারণ, pause, emotion এবং শব্দের clarity সবচেয়ে গুরুত্বপূর্ণ।`;
  }

  if (/photo|image|ছবি|গ্রাফিক|graphic|design|ডিজাইন|thumbnail|poster|পোস্টার/.test(q)) {
    return `${imageGuide}\n\nডিজাইনে সবচেয়ে গুরুত্বপূর্ণ হলো hierarchy: কোন তথ্য আগে চোখে পড়বে, কোনটা পরে—এটা ঠিক রাখতে হবে।`;
  }

  if (/লেখা|copy|caption|script|স্ক্রিপ্ট|content|কনটেন্ট|বানান|প্রুফ/.test(q)) {
    return `${writingGuide}\n\nভালো content editing-এর লক্ষ্য হলো: কম কথায় পরিষ্কার বার্তা, সঠিক তথ্য, সুন্দর flow এবং পাঠকের প্রতি সম্মান।`;
  }

  if (/পারবেন না|সীমাবদ্ধতা|limitation|কি পারেন|কী পারেন/.test(q)) {
    return "আমি ওয়েবসাইটের তথ্য ব্যাখ্যা করতে, editing শেখাতে, content idea দিতে, লেখা সাজাতে এবং সাধারণ নির্দেশনা দিতে পারি। তবে আমি সরাসরি আপনার ডিভাইসের ফাইল edit করতে পারি না, admin/private তথ্য দেখতে পারি না, payment বা password নিতে পারি না, এবং নিশ্চিত তথ্য না থাকলে অনুমান করে বলব না। প্রয়োজন হলে যোগাযোগ পেজ দিয়ে সরাসরি কর্তৃপক্ষের সঙ্গে কথা বলার পরামর্শ দেব।";
  }

  return `আপনার প্রশ্নটি আমি বুঝেছি। সংক্ষেপে বললে, আমি ওয়েবসাইটের তথ্য দিতে, এডিটিং শেখাতে, লেখা সাজাতে, কনটেন্ট আইডিয়া দিতে এবং সাধারণ জ্ঞানভিত্তিক সহায়ক পরামর্শ দিতে পারি।\n\nওয়েবসাইট-সংক্রান্ত তথ্যের ক্ষেত্রে আমি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটের তথ্যের ভিত্তিতে উত্তর দেব: ${websiteSummary}\n\nএডিটিংয়ের জন্য মূল নিয়ম: ${editingCore}\n\nআপনি চাইলে প্রশ্নটি নির্দিষ্ট করুন—ভিডিও, অডিও, ছবি/ডিজাইন, লেখা, সোশ্যাল মিডিয়া পোস্ট, নাকি ওয়েবসাইটের কোনো নির্দিষ্ট তথ্য?`;
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
