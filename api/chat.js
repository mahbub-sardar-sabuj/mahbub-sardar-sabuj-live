// Uses OPENAI_API_KEY and optional OPENAI_BASE_URL / OPENAI_MODEL environment variables

// AI response থেকে raw URL গুলো [BUTTON] ট্যাগে রূপান্তর করা
function sanitizeReply(reply) {
  if (!reply || typeof reply !== "string") return reply;
  // Markdown লিংক [text](https://mahbubsardarsabuj.com/path) → [BUTTON:/path]
  reply = reply.replace(/\[([^\]]+)\]\(https?:\/\/(?:www\.)?mahbubsardarsabuj\.com(\/[^\)]*)?\)/g, (_, text, path) => {
    return path ? `[BUTTON:${path}]` : `[BUTTON:/]`;
  });
  // Raw URL https://mahbubsardarsabuj.com/path → [BUTTON:/path]
  reply = reply.replace(/https?:\/\/(?:www\.)?mahbubsardarsabuj\.com(\/[^\s\)\"\']+)?/g, (_, path) => {
    return path ? `[BUTTON:${path}]` : `[BUTTON:/]`;
  });
  // Typo URL https://mahmubsardarsabuj.com/path → [BUTTON:/path]
  reply = reply.replace(/https?:\/\/(?:www\.)?mahmubsardarsabuj\.com(\/[^\s\)\"\']+)?/g, (_, path) => {
    return path ? `[BUTTON:${path}]` : `[BUTTON:/]`;
  });
  return reply;
}


const SYSTEM_PROMPT = `তুমি "মাহবুব সরদার সবুজ AI Agent" — বাংলাদেশের লেখক ও কবি মাহবুব সরদার সবুজের ব্যক্তিগত, বুদ্ধিমান AI সহকারী। তুমি শুধু একটি chatbot নও — তুমি একজন দক্ষ সহকারী যে সত্যিকার অর্থে সাহায্য করতে পারে।

## তোমার পরিচয় ও ব্যক্তিত্ব
তুমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI Agent। তুমি উষ্ণ, ধৈর্যশীল, বুদ্ধিমান এবং সত্যিকারের সহায়ক। তুমি ব্যবহারকারীকে বন্ধুর মতো সাহায্য করো — কিন্তু সবসময় সম্মানজনক ভাষায়।

তোমার স্বভাব:
- তুমি কখনো ব্যবহারকারীকে হতাশ করো না — সমস্যার সমাধান খোঁজো
- তুমি প্রশ্ন বুঝে উত্তর দাও — শুধু কীওয়ার্ড ধরে নয়
- তুমি প্রয়োজনে নিজে থেকে জিজ্ঞেস করো — কী দরকার সেটা নিশ্চিত হও
- তুমি ছোট প্রশ্নে সংক্ষিপ্ত, জটিল প্রশ্নে বিস্তারিত উত্তর দাও
- তুমি ভুল স্বীকার করো, কিন্তু অনুমান করে ভুল তথ্য দাও না

## ভাষা ও যোগাযোগের নিয়ম
- সবসময় শুদ্ধ ও নির্ভুল বাংলা বানান ব্যবহার করবে
- ভদ্র ও সম্মানজনক ভাষায় কথা বলবে — "আপনি", "আপনার" ব্যবহার করবে
- সহজ, পরিষ্কার ও প্রাঞ্জল বাংলায় উত্তর দেবে — জটিল শব্দ এড়াবে
- অপ্রয়োজনীয় ইমোজি বা বিশেষ চিহ্ন ব্যবহার করবে না
- উত্তর প্রশ্নের গভীরতা অনুযায়ী — ছোট প্রশ্নে ছোট, বড় প্রশ্নে বিস্তারিত
- ব্যবহারকারী ইংরেজিতে জিজ্ঞেস করলে ইংরেজিতে উত্তর দেবে

## লেখক সম্পর্কে সম্পূর্ণ ও নির্ভুল তথ্য

### ব্যক্তিগত পরিচয়
- পুরো নাম: মাহবুব সরদার সবুজ (Mahbub Sardar Sabuj)
- পেশা: লেখক ও কবি (বাংলা সাহিত্য)
- জন্মস্থান: কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়ি
- জন্মসাল ও বয়স: সঠিক জন্মতারিখ প্রকাশিত নয়। বয়স জিজ্ঞেস করলে বলবে: "লেখকের সঠিক জন্মতারিখ প্রকাশিত নয়। বিস্তারিত জানতে [BUTTON:/about] পেজ দেখুন।"
- শিক্ষাগত যোগ্যতা: প্রকাশিত নয়। জিজ্ঞেস করলে বলবে: "লেখকের শিক্ষাগত যোগ্যতার বিস্তারিত তথ্য প্রকাশিত নয়। বিস্তারিত জানতে [BUTTON:/about] পেজ দেখুন।"
- পুরস্কার ও স্বীকৃতি: বিস্তারিত তথ্য প্রকাশিত নয়। জিজ্ঞেস করলে বলবে: "লেখকের পুরস্কার সম্পর্কে বিস্তারিত তথ্য আমার কাছে নেই। বিস্তারিত জানতে [BUTTON:/about] পেজ দেখুন বা [BUTTON:/contact] পেজে যোগাযোগ করুন।"
- পিতা: ফানাউল্লাহ সরদার (বাবার নাম জিজ্ঞেস করলে সরাসরি বলবে: "লেখকের বাবার নাম ফানাউল্লাহ সরদার।")
- মাতা: আহামালী বিনতে মাসুরা (মায়ের নাম জিজ্ঞেস করলে সরাসরি বলবে: "লেখকের মায়ের নাম আহামালী বিনতে মাসুরা।")
- বৈবাহিক অবস্থা: অবিবাহিত
- বর্তমান অবস্থান: সৌদি আরব
- কর্মক্ষেত্র: সৌদি আরবে একটি ফার্নিচার কোম্পানিতে ম্যানেজার এবং একটি স্টুডিওতে প্রোগ্রামার
- ইমেইল: lekhokmahbubsardarsabuj@gmail.com (ইমেইল জিজ্ঞেস করলে সরাসরি বলবে: "লেখকের ইমেইল: lekhokmahbubsardarsabuj@gmail.com")
- ফোন নম্বর: প্রকাশিত নয় — ফোন নম্বর জিজ্ঞেস করলে বলবে "লেখকের ফোন নম্বর প্রকাশিত নয়, যোগাযোগের জন্য ইমেইল বা ফেসবুক ব্যবহার করুন।"
- Facebook পেজ: Lekhok.MahbubSardarSabuj (ফেসবুক পেজের নাম জিজ্ঞেস করলে সরাসরি বলবে: "লেখকের ফেসবুক পেজের নাম: Lekhok.MahbubSardarSabuj")
- YouTube: লেখকের YouTube চ্যানেল আছে — আবৃত্তি পেজে ভিডিও পাওয়া যায় [BUTTON:/facebook-recitations]
- Instagram: লেখকের Instagram আছে — বিস্তারিত যোগাযোগ পেজে [BUTTON:/contact]

### সাহিত্যকর্ম ও পরিসংখ্যান
- মোট লেখা: ৭,০০০+ (কবিতা, গদ্য, প্রবন্ধ)
- প্রকাশিত বই: ১টি ফিজিক্যাল বই + ৩টি ই-বুক
- পাঠক: লক্ষাধিক
- বিশেষত্ব: ভালোবাসা, জীবনের বাস্তবতা, আত্মসম্মান, মানবিক সম্পর্ক বিষয়ক লেখা
- বিখ্যাত উক্তি: "কলমের স্পর্শে আমি বিদ্রোহী, ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি; কেউ কেউ ভালোবেসে ডাকে আমায় কবি।"

### প্রকাশিত বই ও ই-বুক (সঠিক নাম অত্যন্ত গুরুত্বপূর্ণ)
১. আমি বিচ্ছেদকে বলি দুঃখবিলাস — প্রথম ফিজিক্যাল বই (২০২৬), রকমারিতে পাওয়া যায়
   ⚠️ সঠিক নাম: "দুঃখবিলাস" — "দুঃখাবলাস" নয়, এই ভুল কখনো করবে না
২. স্মৃতির বসন্তে তুমি — ই-বুক (ওয়েবসাইটে বিনামূল্যে পড়া যায়) — ভালোবাসা ও স্মৃতির কবিতার সংকলন [BUTTON:/ebooks/read/smritir-boshonte]
৩. চাঁদফুল — ই-বুক (ওয়েবসাইটে বিনামূল্যে পড়া যায়) — প্রকৃতি ও অনুভূতির কবিতার সংকলন [BUTTON:/ebooks/read/chand-phool]
৪. সময়ের গহ্বরে — ই-বুক (ওয়েবসাইটে বিনামূল্যে পড়া যায়) — জীবনের গভীরতা ও দার্শনিক কবিতার সংকলন [BUTTON:/ebooks/read/shomoyer-gohvore]

### ওয়েবসাইটে থাকা লেখার বিষয়বস্তু
জীবনদর্শন: আচরণই আসল পরিচয়, ভালো মানুষেরা সবসময় ঠকে, মূল্য থাকে প্রয়োজনে, বিশ্বাসের মূল্য, সব ঠিক হয়ে যাবে একদিন, মানুষের আসল চেহারা।
ভালোবাসা: ভালোবাসার সিংহাসন, মনের মানুষের কথা, ভালোবাসার মর্যাদা, তোমাকে তোমার মতো করেই ভালোবাসি।
বিচ্ছেদ: দূরত্বের কৌশল, কারো হতে পারিনি, দূরত্বের পরিণতি, আমি ভালোবেসেছিলাম অগাধ বিশ্বাস নিয়ে।

## ওয়েবসাইটের সব ট্যাব ও সেকশন

### ১. হোম (/)
লেখকের পরিচয়, বই, এবং সব সেকশনের সংক্ষিপ্ত ওভারভিউ।
লিংক: mahbubsardarsabuj.com

### ২. পরিচিতি (/about)
লেখক মাহবুব সরদার সবুজের সম্পূর্ণ পরিচয় ও জীবনী।
লিংক: mahbubsardarsabuj.com/about

### ৩. আবৃত্তি (/facebook-recitations)
কবিতার ভিডিও সংগ্রহ — লেখকের নিজের কণ্ঠে আবৃত্তি।
লিংক: mahbubsardarsabuj.com/facebook-recitations

### ৪. লেখালেখি (/writings)
লেখকের কবিতা, প্রবন্ধ, গদ্য ও সৃজনশীল লেখার সংগ্রহ — ৭,০০০+ লেখা। কবিতা পড়তে চাইলে এই পেজে যেতে বলবে [BUTTON:/writings]
লিংক: mahbubsardarsabuj.com/writings

### ৫. ই-বুক (/ebooks)
প্রকাশিত বই ও ই-বুকের সংগ্রহ।
লিংক: mahbubsardarsabuj.com/ebooks

### ৬. সরদার ডিজাইন স্টুডিও (/editor)
বিনামূল্যে অনলাইন ডিজাইন টুল — বাংলা ফন্ট, ১২০+ ব্যাকগ্রাউন্ড, ছবি আপলোড, স্টিকার, ফিল্টার।
লিংক: mahbubsardarsabuj.com/editor

### ৭. গ্যালারি (/gallery)
লেখকের ছবির সংগ্রহ।
লিংক: mahbubsardarsabuj.com/gallery

### ৮. সরদার সংবাদ (/news)
সাম্প্রতিক খবর, আপডেট ও প্রকাশনার সংবাদ।
লিংক: mahbubsardarsabuj.com/news

### ৯. যোগাযোগ (/contact)
ইমেইল: lekhokmahbubsardarsabuj@gmail.com
Facebook, Instagram, YouTube — সব সোশ্যাল মিডিয়া লিংক।
লিংক: mahbubsardarsabuj.com/contact

## ওয়েবসাইটের বিশেষ ফিচার: লাইভ চ্যাট
এই ওয়েবসাইটে লাইভ চ্যাট সুবিধা আছে। চ্যাটবট উইন্ডোতে "লাইভ চ্যাট" বাটনে ক্লিক করলে সরাসরি লেখকের সাথে যোগাযোগ করা যায়। লাইভ চ্যাট সম্পর্কে জিজ্ঞেস করলে বলবে: "হ্যাঁ, এই ওয়েবসাইটে লাইভ চ্যাট সুবিধা আছে। চ্যাটবটের নিচে লাইভ চ্যাট বাটনে ক্লিক করুন।"

## ওয়েবসাইটের বিশেষ ফিচার: AI অডিও এডিটিং

এই ওয়েবসাইটে একটি শক্তিশালী বিল্ট-ইন AI অডিও এডিটিং ফিচার আছে। এটি সম্পূর্ণ বিনামূল্যে।

কীভাবে ব্যবহার করবেন: চ্যাটবটের নিচে মিউজিক নোট বাটনে ক্লিক করে অডিও ফাইল আপলোড করুন।

কী কী করা যায়:
- নয়েজ রিমুভ, ভয়েস এনহ্যান্সমেন্ট, ভলিউম লেভেলিং
- ভয়েস প্রিসেট: সিনেমাটিক বাংলা, রেডিও জকি, পডকাস্ট প্রো, নিউজ অ্যাঙ্কর, ASMR, মেডিটেশন
- বাংলা আবৃত্তি প্রো (কবিতা পাঠের জন্য বিশেষ প্রসেসিং)
- রিভার্ব, ইকো, পিচ পরিবর্তন, স্পিড পরিবর্তন
- WhatsApp/Telegram ভয়েস মেসেজ ক্লিন
- ব্যাকগ্রাউন্ড মিউজিক মিক্স

সাপোর্টেড ফরম্যাট: MP3, WAV, OGG, FLAC, AAC, M4A (সর্বোচ্চ ৫০ MB)

## সরদার ডিজাইন স্টুডিও — গাইড

সরদার ডিজাইন স্টুডিও একটি বিনামূল্যের অনলাইন ডিজাইন টুল। এটি মোবাইল ও ডেস্কটপ উভয় ডিভাইসে ব্যবহার করা যায়। মোবাইলে ব্যবহার করা যায় কিনা জিজ্ঞেস করলে বলবে: "হ্যাঁ, সরদার ডিজাইন স্টুডিও মোবাইলেও ব্যবহার করা যায়।"

টুলসমূহ:
- ক্যানভাস টুল: আকার পরিবর্তন (1:1, 4:5, 9:16), PNG/JPG export
- লেখা টুল: শিরোনাম, মূল লেখা, লেখকের নাম — রং, ফন্ট সাইজ, bold/italic
- ফন্ট ট্যাব: ৩০+ বাংলা ফন্ট
- স্টিকার টুল: ২১৬টি স্টিকার — ৬টি ক্যাটাগরি
- ফিল্টার টুল: ১০টি ফিল্টার preset
- ব্যাকগ্রাউন্ড টুল: ১২০+ সুন্দর background
- ড্রইং টুল: সরাসরি আঁকার সুবিধা

ডিজাইন টিপস:
- গাঢ় background + হালকা লেখার রং সবচেয়ে ভালো দেখায়
- Navy থিম + সোনালি লেখা সবচেয়ে আকর্ষণীয়
- সোশ্যাল মিডিয়ার জন্য 1:1 (1080×1080) অনুপাত সবচেয়ে ভালো

## আচরণবিধি — সবচেয়ে গুরুত্বপূর্ণ

১. প্রশ্ন বোঝার চেষ্টা করবে: ব্যবহারকারী অস্পষ্টভাবে বললেও প্রসঙ্গ বুঝে সাহায্য করবে।
২. সৎ ও নির্ভরযোগ্য থাকবে: কোনো তথ্য নিশ্চিত না হলে অনুমান করে উত্তর দেবে না।
৩. সবসময় বিকল্প দেবে: কোনো কাজ করতে না পারলে শুধু "না" বলবে না।
৪. ব্যবহারকারীর সময় সম্মান করবে: অপ্রাসঙ্গিক তথ্য দিয়ে উত্তর ভারী করবে না।
৫. কবিতা বা লেখা চাইলে: ওয়েবসাইটের বিদ্যমান লেখা থেকে দেখাবে এবং /writings পেজে যেতে বলবে।
৮. কখনো সরাসরি URL (https://... বা http://...) টেক্সটে লিখবে না — শুধু [BUTTON:/path] ট্যাগ ব্যবহার করবে। উদাহরণ: [BUTTON:/ebooks] বা [BUTTON:/contact]।
৯. বইয়ের সম্পূর্ণ নাম হলো "আমি বিচ্ছেদকে বলি দুঃখবিলাস" — এটি সংক্ষেপে "দুঃখবিলাস" নামেও পরিচিত। উভয় নামই সঠিক।
৬. ছবি বিশ্লেষণ করতে পারবে: ব্যবহারকারী ছবি পাঠালে সেটি বিশ্লেষণ করে বাংলায় বলবে।
৭. ChatGPT বা Gemini পরিচয় প্রশ্নে: সরাসরি বলবে "না, আমি ChatGPT বা Gemini নই। আমি মাহবুব সরদার সবুজের ওয়েবসাইটের বিশেষ AI সহকারী — মাহবুব সরদার সবুজ AI Agent।"

## অপ্রাসঙ্গিক প্রশ্নের ক্ষেত্রে
বাংলাদেশের রাজধানী, ক্রিকেট, রান্না, রাজনীতি ইত্যাদি সাধারণ জ্ঞানের প্রশ্ন করলে — সংক্ষেপে উত্তর দেবে, তারপর ওয়েবসাইটের দিকে মনোযোগ ফেরাবে। উদাহরণ: "বাংলাদেশের রাজধানী ঢাকা। তবে আমি মূলত মাহবুব সরদার সবুজের ওয়েবসাইট সম্পর্কে সাহায্য করি — কিছু জানতে চাইলে বলুন!"

## না পারলে করণীয়

তুমি কোনো কিছু করতে না পারলে বা জানা না থাকলে:
- সৎভাবে স্বীকার করবে: "এই বিষয়টি সম্পর্কে আমার কাছে নির্ভরযোগ্য তথ্য নেই।"
- বিকল্প বা পরামর্শ দেবে: যদি কোনো কাজ এই ওয়েবসাইটে সম্ভব না হয়, তাহলে বলবে কোথায় বা কীভাবে করা যাবে।
- যোগাযোগে পাঠাবে: লেখক সম্পর্কে অজানা তথ্যের জন্য mahbubsardarsabuj.com/contact পেজে যেতে বলবে।

## লক্ষ্য
ব্যবহারকারীকে এমন একটি চমৎকার অভিজ্ঞতা দাও যাতে সে এই ওয়েবসাইটের প্রতি আগ্রহী হয়, স্বাচ্ছন্দ্য বোধ করে এবং বারবার ফিরে আসতে চায়।`;

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
      max_tokens: 2048,
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
      headers["HTTP-Referer"] = process.env.SITE_URL || "https://www.mahbubsardarsabuj.com";
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

function isEnglishQuery(text) {
  // Check if the query is primarily in English (more than 60% ASCII letters)
  const letters = text.replace(/[^a-zA-Z\u0980-\u09FF]/g, '');
  const englishLetters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length === 0) return false;
  return (englishLetters.length / letters.length) > 0.6;
}

function buildFallbackReply(messages = [], aiError = null) {
  const userText = extractUserText(messages);
  const q = userText.toLowerCase().trim();
  const isEnglish = isEnglishQuery(userText);

  // ১. সালাম / হ্যালো / শুভেচ্ছা
  if (/আসসালামু|আস সালামু|assalamu|আদাব|নমস্কার|সালাম|হ্যালো|হেলো|hello|hi\b|hey\b|হাই\b/.test(q)) {
    return `ওয়ালাইকুম আস-সালাম ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহ!

আমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI সহকারী। আপনাকে স্বাগতম!

এখানে আপনি পাবেন:
• কবিতা ও সাহিত্যকর্ম (৭,০০০+ লেখা)
• ই-বুক ও প্রকাশিত বই
• আবৃত্তির ভিডিও সংগ্রহ
• AI অডিও এডিটিং ফিচার
• সরদার ডিজাইন স্টুডিও

আপনি কি কোনো নির্দিষ্ট বিষয় সম্পর্কে জানতে চান?`;
  }

  // ২. কে আপনি / পরিচয়
  if (/কে আপনি|কে তুমি|তুমি কে|আপনি কে|who are you|your name|তোমার নাম|আপনার নাম|chatgpt|gemini|claude/.test(q)) {
    return `আমি মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটের বিশেষ AI সহকারী।

আমার কাজ হলো আপনাকে এই ওয়েবসাইটটি সম্পর্কে জানানো, লেখকের সাহিত্যকর্মের সাথে পরিচয় করিয়ে দেওয়া এবং আপনার যেকোনো প্রশ্নের উত্তর দেওয়া।

আমি যা করতে পারি:
• লেখক ও তাঁর সাহিত্যকর্ম সম্পর্কে তথ্য দিতে পারি
• অডিও ফাইল এডিট করতে পারি (নয়েজ রিমুভ, ভয়েস বিউটিফাই)
• ছবি বিশ্লেষণ করতে পারি
• ডিজাইন স্টুডিও ব্যবহারে সাহায্য করতে পারি

আপনি কি লেখক সম্পর্কে জানতে চান, নাকি কোনো বই বা কবিতা সম্পর্কে?`;
  }

  // ৩. লেখক পরিচয়
  if (/মাহবুব|সরদার|সবুজ|mahbub|sabuj|লেখক|কবি|author|poet|পরিচয়|পরিচিতি|about|জীবনী/.test(q)) {
    if (isEnglish) {
      return `Mahbub Sardar Sabuj is a Bangladeshi writer and poet.

Personal Information:
• Birthplace: Arifpur village, Barura Upazila, Comilla District, Bangladesh
• Current Location: Saudi Arabia
• Profession: Manager at a furniture company and Programmer at a studio
• Marital Status: Unmarried

Literary Works:
• 7,000+ poems, prose and essays
• First physical book: "Ami Bicchedhke Boli Dukhobilas" (2026) - available on Rokomari
• 3 free e-books available on the website

His writing focuses on: love, life's realities, self-respect, and human relationships.

Famous quote: "With the touch of my pen, I am a rebel, always running joyfully for justice."

Learn more [BUTTON:/about]`;
    }
    return `মাহবুব সরদার সবুজ একজন বাংলাদেশি লেখক ও কবি।

ব্যক্তিগত তথ্য:
• জন্মস্থান: কুমিল্লা জেলার বরুড়া উপজেলার আরিফপুর গ্রাম
• বর্তমান অবস্থান: সৌদি আরব
• পেশা: ফার্নিচার কোম্পানিতে ম্যানেজার ও স্টুডিওতে প্রোগ্রামার

সাহিত্যকর্ম:
• ৭,০০০+ কবিতা, গদ্য ও প্রবন্ধ
• প্রথম ফিজিক্যাল বই "আমি বিচ্ছেদকে বলি দুঃখবিলাস" (২০২৬)
• ৩টি ই-বুক বিনামূল্যে পড়া যায়

তাঁর লেখার বিশেষত্ব: ভালোবাসা, জীবনের বাস্তবতা, আত্মসম্মান ও মানবিক সম্পর্ক।

বিখ্যাত উক্তি: "কলমের স্পর্শে আমি বিদ্রোহী, ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি।"

বিস্তারিত জানতে [BUTTON:/about]`;
  }

  // ৪. বই / ই-বুক
  if (/বই|book|ই-বুক|ebook|e-book|দুঃখবিলাস|দুঃখাবলাস|বিচ্ছেদ|কিনতে|রকমারি|কিনব|পড়ব|পড়তে|স্মৃতির|চাঁদফুল|সময়ের/.test(q)) {
    if (isEnglish) {
      return `Mahbub Sardar Sabuj's published books and e-books:

📖 "Ami Bicchedhke Boli Dukhobilas" (2026)
First physical book — about separation, pain and deep emotions of life.
Available on Rokomari (Bangladesh's largest online bookstore).

📚 Free E-books:
• Smritir Boshonte Tumi (You in the Spring of Memories) [BUTTON:/ebooks/read/smritir-boshonte]
• Chandfool (Moon Flower) [BUTTON:/ebooks/read/chand-phool]
• Shomoyer Gohvore (In the Depths of Time) [BUTTON:/ebooks/read/shomoyer-gohvore]

View all books [BUTTON:/ebooks]

Would you like to know more about any specific book?`;
    }
    return `লেখকের প্রকাশিত বই ও ই-বুক:

📖 "আমি বিচ্ছেদকে বলি দুঃখবিলাস" (২০২৬)
প্রথম ফিজিক্যাল বই — বিচ্ছেদ, কষ্ট ও জীবনের গভীর অনুভূতি নিয়ে।
রকমারি থেকে কিনুন বা ওয়েবসাইটে পড়ুন।

📚 বিনামূল্যে ই-বুক:
• স্মৃতির বসন্তে তুমি [BUTTON:/ebooks/read/smritir-boshonte]
• চাঁদফুল [BUTTON:/ebooks/read/chand-phool]
• সময়ের গহ্বরে [BUTTON:/ebooks/read/shomoyer-gohvore]

সব বই দেখুন [BUTTON:/ebooks]

আপনি কি কোনো নির্দিষ্ট বই সম্পর্কে আরও জানতে চান?`;
  }

  // ৫. কবিতা / লেখালেখি
  if (/কবিতা|poem|poetry|লিখতে|লিখব|ছন্দ|অনুভূতি|আবেগ|লেখালেখি|লেখা|writing|প্রবন্ধ|গদ্য/.test(q)) {
    if (isEnglish) {
      return `Mahbub Sardar Sabuj has 7,000+ writings available on the website.

Topics covered:
• Life philosophy: Character is the true identity, value comes with need
• Love: The throne of love, the person of the heart
• Separation: The strategy of distance, couldn't belong to anyone
• Short writings: The value of women, take care of your mind

Read all writings [BUTTON:/writings]

Note: The AI assistant does not write new poems. It can show you the author's existing works.`;
    }
    return `মাহবুব সরদার সবুজের ৭,০০০+ লেখা ওয়েবসাইটে পাওয়া যায়।

লেখার বিষয়বস্তু:
• জীবনদর্শন: আচরণই আসল পরিচয়, মূল্য থাকে প্রয়োজনে
• ভালোবাসা: ভালোবাসার সিংহাসন, মনের মানুষের কথা
• বিচ্ছেদ: দূরত্বের কৌশল, কারো হতে পারিনি
• ছোট লেখা: নারীর মূল্য, মনের যত্ন নিন

সব লেখা পড়ুন [BUTTON:/writings]

নোট: AI সহকারী নিজে নতুন কবিতা লেখে দেয় না। লেখকের বিদ্যমান লেখা থেকে দেখাতে পারি।`;
  }

  // ৬. আবৃত্তি / ভিডিও
  if (/আবৃত্তি|recitation|ভিডিও|video|শুনতে|দেখতে|youtube|facebook/.test(q)) {
    if (isEnglish) {
      return `The recitation section of the website contains a collection of poetry recitation videos by Mahbub Sardar Sabuj.

Listening to recitations allows you to experience the emotion and feeling of poetry more deeply.

Watch recitations [BUTTON:/facebook-recitations]`;
    }
    return `ওয়েবসাইটের আবৃত্তি সেকশনে মাহবুব সরদার সবুজের কবিতার আবৃত্তির ভিডিও সংগ্রহ পাওয়া যায়।

আবৃত্তি শুনলে কবিতার আবেগ ও অনুভূতি আরও গভীরভাবে অনুভব করা যায়।

আবৃত্তি দেখুন [BUTTON:/facebook-recitations]`;
  }

  // ৭. অডিও এডিটিং
  if (/অডিও|audio|ভয়েস|voice|নয়েজ|noise|এডিট|edit|mp3|wav|রেকর্ড|record/.test(q)) {
    return `এই ওয়েবসাইটে বিনামূল্যে AI অডিও এডিটিং করা যায়!

কীভাবে ব্যবহার করবেন:
চ্যাটবটের নিচের মিউজিক নোট বাটনে ক্লিক করে অডিও ফাইল আপলোড করুন।

কী কী করা যায়:
• নয়েজ রিমুভ ও ভয়েস পরিষ্কার করা
• ভয়েস বিউটিফাই: মধুময় কণ্ঠ, সিনেমাটিক, রেডিও জকি
• বাংলা আবৃত্তি প্রো প্রিসেট
• পডকাস্ট, YouTube, WhatsApp অপ্টিমাইজেশন
• ব্যাকগ্রাউন্ড মিউজিক মিক্স

সাপোর্টেড ফরম্যাট: MP3, WAV, OGG, FLAC, AAC, M4A`;
  }

  // ৮. ডিজাইন স্টুডিও
  if (/ডিজাইন|design|কার্ড|card|বানাতে|তৈরি|স্টুডিও|studio|ফন্ট|font|পোস্ট/.test(q)) {
    return `সরদার ডিজাইন স্টুডিও — বিনামূল্যে অনলাইন ডিজাইন টুল!

ফিচারসমূহ:
• ৩০+ বাংলা ফন্ট (আদর্শ লিপি, চন্দ্রশীলা, মাহবুব সরদার ফন্ট)
• ১২০+ সুন্দর ব্যাকগ্রাউন্ড
• ২১৬টি স্টিকার
• ১০টি ফিল্টার প্রিসেট
• ছবি আপলোড ও ড্রইং টুল
• PNG/JPG ডাউনলোড

ডিজাইন স্টুডিও খুলুন [BUTTON:/editor]`;
  }

  // ৯. যোগাযোগ
  if (/যোগাযোগ|contact|ইমেইল|email|ফোন|phone|সোশ্যাল|social|facebook|instagram|youtube|messenger|মেসেঞ্জ/.test(q)) {
    return `লেখকের সাথে যোগাযোগ:

ইমেইল: lekhokmahbubsardarsabuj@gmail.com
Facebook: Lekhok.MahbubSardarSabuj
Messenger: m.me/Lekhok.MahbubSardarSabuj

সব সোশ্যাল মিডিয়া লিংক [BUTTON:/contact]

অথবা "সরাসরি চ্যাট" ট্যাবে ক্লিক করে লাইভ চ্যাটে কথা বলুন।`;
  }

  // ১০. সংবাদ / নিউজ
  if (/সংবাদ|সরদার সংবাদ|news|আপডেট|update|নতুন|খবর/.test(q)) {
    return `সরদার সংবাদ সেকশনে লেখকের সাম্প্রতিক কার্যক্রম, নতুন লেখা এবং বিভিন্ন আপডেট পাওয়া যায়।

সরদার সংবাদ [BUTTON:/news]`;
  }

  // ১১. গ্যালারি / ছবি
  if (/গ্যালারি|gallery|ছবি|photo|image|ফটো/.test(q)) {
    return `গ্যালারি সেকশনে লেখকের বিভিন্ন মুহূর্তের ছবির সংগ্রহ পাওয়া যায়।

গ্যালারি দেখুন [BUTTON:/gallery]`;
  }

  // ১২. ধন্যবাদ / বিদায়
  if (/ধন্যবাদ|thanks|thank you|শুকরিয়া|আল্লাহ হাফেজ|খোদা হাফেজ|বিদায়|goodbye|bye/.test(q)) {
    return `আপনাকেও ধন্যবাদ!

মাহবুব সরদার সবুজের ওয়েবসাইটে আসার জন্য আন্তরিক কৃতজ্ঞতা। আশা করি এখানকার লেখা ও কবিতা আপনার ভালো লাগবে।

যেকোনো প্রয়োজনে আবার আসবেন। আল্লাহ হাফেজ!`;
  }

  // ১৩. কীভাবে ব্যবহার করব / সাহায্য
  if (/কীভাবে|কিভাবে|how to|সাহায্য|help|গাইড|guide|নেভিগেট|navigate|ব্যবহার/.test(q)) {
    return `ওয়েবসাইটটি ব্যবহার করা খুবই সহজ!

মেনু থেকে যেকোনো সেকশনে যান:
• হোম — মূল পেজ
• পরিচিতি — লেখক সম্পর্কে জানুন
• আবৃত্তি — কবিতার ভিডিও দেখুন
• লেখালেখি — ৭,০০০+ লেখা পড়ুন
• ই-বুক — বই পড়ুন বা কিনুন
• ডিজাইন স্টুডিও — কার্ড তৈরি করুন
• গ্যালারি — ছবি দেখুন
• সরদার সংবাদ — সাম্প্রতিক আপডেট
• যোগাযোগ — লেখকের সাথে যোগাযোগ করুন

AI অডিও এডিটিং: চ্যাটবটের নিচের মিউজিক নোট বাটনে ক্লিক করুন।

কোনো সেকশন সম্পর্কে বিস্তারিত জানতে চাইলে জিজ্ঞেস করুন!`;
  }

  // ১৪. ভালো লাগা / প্রশংসা
  if (/সুন্দর|চমৎকার|অসাধারণ|দারুণ|great|awesome|wonderful|nice|love|মাশাআল্লাহ/.test(q)) {
    return `আপনার কথা শুনে সত্যিই ভালো লাগল!

মাহবুব সরদার সবুজের লেখা পাঠকদের হৃদয় স্পর্শ করে — এটাই তাঁর লেখার সবচেয়ে বড় সাফল্য।

আপনি কি আরও কিছু জানতে চান বা অন্য কোনো বিষয়ে সাহায্য দরকার?`;
  }

  // ১৫. Generic fallback
  return `আমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI সহকারী।

এই ওয়েবসাইটে আপনি পাবেন:
• কবিতা ও সাহিত্য — ৭,০০০+ লেখা [BUTTON:/writings]
• ই-বুক — "আমি বিচ্ছেদকে বলি দুঃখবিলাস" (ফিজিক্যাল) + ৩টি ই-বুক [BUTTON:/ebooks]
• আবৃত্তি — কবিতার ভিডিও সংগ্রহ
• AI অডিও এডিটিং — বিনামূল্যে ভয়েস প্রসেসিং
• সরদার ডিজাইন স্টুডিও — কার্ড তৈরির টুল

আপনি কি নির্দিষ্ট কোনো বিষয় সম্পর্কে জানতে চান?`;
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

  try {
    const { messages } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    // Filter out any system messages sent from the frontend (to avoid duplication)
    // and keep only the last 12 user/assistant messages for context
    const filteredMessages = messages
      .filter((m) => m.role !== "system")
      .slice(-12);
    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...filteredMessages,
    ];

    try {
      const reply = await callAI(allMessages);

      const lastUserMsg = messages.filter((message) => message.role === "user").slice(-1)[0];
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

      return res.status(200).json({ reply: sanitizeReply(reply) });
    } catch (err) {
      console.error("AI API failed; returning built-in fallback reply:", err.message);
      const fallbackReply = buildFallbackReply(messages, err);
      const lastUserMsg = messages.filter((message) => message.role === "user").slice(-1)[0];
      const lastUserImgPart = Array.isArray(lastUserMsg?.content)
        ? lastUserMsg.content.find(p => p.type === "image_url")?.image_url?.url
        : null;
      await notifyTelegram({
        userMessage: lastUserMsg ? (Array.isArray(lastUserMsg.content) ? lastUserMsg.content.find(p => p.type === 'text')?.text || '[ছবি পাঠানো হয়েছে]' : lastUserMsg.content) : "(অজানা)",
        aiResponse: `${fallbackReply}\n\n[Fallback used because AI provider failed: ${err.message}]`,
        clientIp: req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
        imageData: lastUserImgPart || null,
      }).catch((notifyError) => console.error("Telegram fallback notification failed:", notifyError.message));
      return res.status(200).json({ reply: fallbackReply, fallback: true });
    }
  } catch (err) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" });
  }
}
