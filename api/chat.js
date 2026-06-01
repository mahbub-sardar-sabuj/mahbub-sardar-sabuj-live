import { WEBSITE_KNOWLEDGE } from "./_knowledge/siteKnowledge.js";
import {
  CHATBOT_PERSONA_RULES,
  INTENT_RULES,
  buildKnowledgeContext,
  buildTrainingExampleContext,
} from "./_knowledge/trainingExamples.js";

// api/chat.js — সম্পূর্ণ আপডেট: General AI + Knowledge Base
const SYSTEM_PROMPT = `তুমি "মাহবুব সরদার সবুজ AI Agent"—লেখক মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটে থাকা একটি প্রিমিয়াম General AI সহকারী। তুমি শুধুমাত্র ওয়েবসাইট-তথ্যে সীমাবদ্ধ নও; ব্যবহারকারীর সাধারণ জ্ঞান, শিক্ষা, প্রযুক্তি, প্রোগ্রামিং, সাহিত্য, গণিত, জীবনযাপন, কনটেন্ট পরিকল্পনা, অনুবাদ, সারাংশ, আইডিয়া, বিশ্লেষণ এবং সৃজনশীল লেখার প্রশ্নেও সহায়তা করবে।

## মূল আচরণবিধি
${CHATBOT_PERSONA_RULES.map((rule, index) => `${index + 1}. ${rule}`).join("\\n")}

## যাচাইকৃত Knowledge Base
${buildKnowledgeContext(WEBSITE_KNOWLEDGE)}

## শেখানো ও উত্তর দেওয়ার উদাহরণ
${buildTrainingExampleContext()}

## উত্তর দেওয়ার নীতি (অবশ্যই মানতে হবে)
১. ব্যবহারকারীর উদ্দেশ্য আগে বোঝো, তারপর সরাসরি কার্যকর উত্তর দাও।
২. ওয়েবসাইট/লেখক সম্পর্কে প্রশ্ন হলে যাচাইকৃত knowledge base-কে অগ্রাধিকার দাও; অনুমান করো না।
৩. সাধারণ জ্ঞানভিত্তিক প্রশ্নে সহায়ক, গুছানো ও বাস্তবসম্মত উত্তর দাও।
৪. ছবি থাকলে ছবির দৃশ্যমান তথ্য বিশ্লেষণ করো; অদৃশ্য বা ব্যক্তিগত তথ্য দাবি করো না।
৫. চিকিৎসা, আইন, আর্থিক বা নিরাপত্তাজনিত বিষয়ে সতর্ক ডিসক্লেইমার দিয়ে সাধারণ সহায়তা দাও।
৬. অডিও/ভিডিও এডিটিং চাইলে ব্যবহারকারীকে ফাইল আপলোড ও স্পষ্ট নির্দেশ দিতে বলো; ফাইল থাকলে কী করা হবে তা সংক্ষেপে নিশ্চিত করো।
৭. উত্তর সুন্দর, শুদ্ধ, বিনয়ী ও প্রফেশনাল বাংলায় দাও; প্রয়োজনে সংক্ষিপ্ত তালিকা বা ধাপ ব্যবহার করো।
৮. তুমি "সব পারি" বললেও বাস্তব সীমা স্পষ্ট করবে: বাহ্যিক পেমেন্ট, লগইন, গোপন ডেটা বা অদেখা তথ্য নিজে থেকে দাবি করবে না।
৯. প্রতিটি উত্তরে প্রাসঙ্গিক হলে [BUTTON:/path] ফরম্যাটে internal navigation link দাও—বাইরের URL নয়, শুধু internal button।
১০. অজানা তথ্য বানিয়ে বলো না; নিশ্চিত না হলে নম্রভাবে বলো যে তথ্যটি ওয়েবসাইটে নেই বা যাচাই দরকার।
১১. বাংলা ভাষা অগ্রাধিকার দাও; ব্যবহারকারী ইংরেজি বা অন্য ভাষায় লিখলে সেই ভাষায় উত্তর দিতে পারো।
১২. সর্বোচ্চ ২০০ শব্দে সংক্ষিপ্ত উত্তর দাও যদি বিস্তারিত না চাওয়া হয়; বিস্তারিত চাইলে বিস্তারিত দাও।
১৩. প্রতিটি উত্তরের শেষে প্রাসঙ্গিক follow-up প্রশ্ন বা পরামর্শ দিতে পারো যাতে কথোপকথন স্বাভাবিক মনে হয়।`;

import {
  checkRateLimit,
  isProbablySpamText,
  limitJsonBodySize,
  normalizeText,
} from "./_utils/security.js";

// ── AI provider configuration ──────────────────────────────────────────────
// Provider priority order:
//   1. Groq API (primary, free tier, fast inference, no credit card required)
//   2. OpenAI-compatible API (secondary, if OPENAI_API_KEY is set)
//   3. Forge (built-in fallback, avoids downtime if other providers are unavailable)
//   4. Gemini direct API (last resort; free tier can hit quota)
//
// This order ensures the chatbot works for free using Groq as the primary provider,
// while still keeping robust fallback behavior for production visitors.
function resolveAiConfigs() {
  const configs = [];

  // 1. Groq API — free tier, no credit card required, OpenAI-compatible
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    const groqModel = process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";
    configs.push({
      source: "groq",
      apiKey: groqKey,
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      model: groqModel,
      skipOn429: false,
    });
  }

  // 2. OpenAI-compatible API — secondary provider
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    const baseUrl = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
    const model = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
    configs.push({ source: "openai", apiKey: openaiKey, endpoint: `${baseUrl}/chat/completions`, model, skipOn429: false });
  }

  // 3. Forge API — stable fallback
  const forgeKey = process.env.BUILT_IN_FORGE_API_KEY?.trim();
  const forgeUrl = process.env.BUILT_IN_FORGE_API_URL?.trim();
  if (forgeKey && forgeUrl) {
    configs.push({
      source: "forge",
      apiKey: forgeKey,
      endpoint: `${forgeUrl.replace(/\/$/, "")}/v1/chat/completions`,
      model: "gemini-2.5-flash",
      skipOn429: false,
    });
  }

  // 3. Gemini direct API — last resort (free tier has strict quota)
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    // Try flash-lite first (higher free quota), then fall back to flash
    const primaryModel = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash-lite";
    configs.push({
      source: "gemini",
      apiKey: geminiKey,
      endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      model: primaryModel,
      skipOn429: true, // If quota exceeded, skip immediately to fallback reply
    });
  }

  return configs;
}

async function callAIWithConfig(messages, config) {
  const { source, apiKey, endpoint, model } = config;
  const payload = { model, messages, max_tokens: 4000, temperature: 0.7 };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12000),
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




function normalizeForIntent(text = "") {
  return String(text || "")
    .toLowerCase()
    .replace(/[“”‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function keywordHits(text, keywords = []) {
  return keywords.filter((keyword) => text.includes(String(keyword).toLowerCase())).length;
}

function findBestByKeywords(text, items = []) {
  return items
    .map((item) => ({ item, score: keywordHits(text, [item.title, item.name, item.label, ...(item.keywords || [])].filter(Boolean)) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.item || null;
}

function detectIntent(rawText = "") {
  const text = normalizeForIntent(rawText);
  const scored = INTENT_RULES
    .map((rule) => {
      const hits = keywordHits(text, rule.keywords);
      const priority = typeof rule.priority === "number" ? rule.priority : 50;
      return { ...rule, hits, priority, score: hits * 20 + priority };
    })
    .filter((rule) => rule.hits > 0)
    .sort((a, b) => b.score - a.score || b.priority - a.priority);

  return scored[0] || null;
}

function pageButton(path, label) {
  return `${label}: [BUTTON:${path}]`;
}

function buildBookReply(text) {
  const book = findBestByKeywords(text, WEBSITE_KNOWLEDGE.books);
  if (book) {
    const buyLine = book.buyUrl ? `\nঅর্ডার করতে: ${book.buyUrl}` : "";
    return `**${book.title}**\n\nধরন: ${book.type}\nপ্রকাশ/সময়: ${book.year}\nপৃষ্ঠা/পরিমাণ: ${book.pages}\n\n${book.summary}${buyLine}\n\nপড়তে যান: [BUTTON:${book.readPath}]\nসব বই দেখতে: [BUTTON:/ebooks]\n\nআরও চাইলে লিখুন—“এই বইটির সারাংশ দাও” বা “আরও বই দেখাও”।`;
  }

  const rows = WEBSITE_KNOWLEDGE.books.map((item, index) => {
    const buy = item.buyUrl ? ` | অর্ডার: ${item.buyUrl}` : "";
    return `${index + 1}. **${item.title}** — ${item.type}, ${item.year}, ${item.pages}. পড়তে: [BUTTON:${item.readPath}]${buy}`;
  }).join("\n");
  return `মাহবুব সরদার সবুজের যাচাইকৃত বই ও ই-বুক তালিকা:\n\n${rows}\n\nসব বইয়ের পেজ: [BUTTON:/ebooks]\nআপনি চাইলে নির্দিষ্ট বইয়ের নাম লিখলে আমি সরাসরি সেই বইয়ের লিংক ও তথ্য দেব।`;
}

function buildWritingReply(text) {
  const category = findBestByKeywords(text, WEBSITE_KNOWLEDGE.writingCategories);
  if (category) {
    return `**${category.name}** বিভাগে মাহবুব সরদার সবুজের প্রায় ${category.count}টি লেখা রয়েছে।\n\nএই বিভাগের লেখা দেখতে লেখালেখি আর্কাইভে যান: [BUTTON:${category.path}]\n\nচাইলে আপনি লিখতে পারেন—“${category.name} থেকে জনপ্রিয় লেখা দেখাও” অথবা “${category.name} নিয়ে একটি পোস্ট লিখে দাও”।`;
  }

  const categories = WEBSITE_KNOWLEDGE.writingCategories.map((cat) => `${cat.name} ${cat.count}টি`).join(", ");
  return `ওয়েবসাইটে মাহবুব সরদার সবুজের মোট **১১৯৮টি লেখা** রয়েছে। প্রধান বিভাগগুলো হলো: ${categories}।\n\nসব লেখা দেখতে: [BUTTON:/writings]\nই-বুক সংগ্রহ: [BUTTON:/ebooks]\n\nআপনি ভালোবাসা, বিচ্ছেদ, জীবনদর্শন, ছোট লেখা বা কবিতা—যে কোনো বিভাগ আলাদা করে চাইতে পারেন।`;
}

function buildRecitationReply(text) {
  const recitation = findBestByKeywords(text, WEBSITE_KNOWLEDGE.recitations);
  if (recitation) {
    return `**${recitation.title}** আবৃত্তিটি Facebook আবৃত্তি সংগ্রহে রয়েছে।\n\nশুনতে/দেখতে যান: [BUTTON:${recitation.path}]\nঅফিসিয়াল Facebook পেজ: ${WEBSITE_KNOWLEDGE.contact.facebook}\n\nআরও আবৃত্তি চাইলে লিখুন—“সব আবৃত্তি দেখাও”।`;
  }

  const list = WEBSITE_KNOWLEDGE.recitations.map((item, index) => `${index + 1}. ${item.title}`).join("\n");
  return `মাহবুব সরদার সবুজের ৯টি জনপ্রিয় Facebook আবৃত্তি রয়েছে:\n\n${list}\n\nশুনতে/দেখতে যান: [BUTTON:/facebook-recitations]\nঅফিসিয়াল Facebook পেজ: ${WEBSITE_KNOWLEDGE.contact.facebook}`;
}

function buildAuthorReply() {
  const { author } = WEBSITE_KNOWLEDGE;
  return `${author.name} ${author.identity}\n\nযাচাইকৃত পরিচিতি:\n- জন্মস্থান: ${author.birthplace}\n- বর্তমান অবস্থান: ${author.currentLocation}\n- ${author.stats.join("\n- ")}\n\nতিনি নিজেকে এভাবে প্রকাশ করেন: “${author.signatureQuote}”\n\nআরও পড়ুন: [BUTTON:/about]\nলেখালেখি: [BUTTON:/writings]\nই-বুক: [BUTTON:/ebooks]`;
}

function buildContactReply() {
  const { contact } = WEBSITE_KNOWLEDGE;
  return `লেখকের অফিসিয়াল যোগাযোগ তথ্য:\n\nইমেইল: ${contact.email}\nFacebook: ${contact.facebook}\nInstagram: ${contact.instagram}\nYouTube: ${contact.youtube}\n\nযোগাযোগ ফর্ম: [BUTTON:/contact]\nসরাসরি কথা বলতে চাইলে চ্যাটবটের **সরাসরি চ্যাট** ট্যাব ব্যবহার করুন।`;
}

function buildSiteReply(text) {
  const matchedPage = findBestByKeywords(text, WEBSITE_KNOWLEDGE.pages);
  if (matchedPage) {
    return `${matchedPage.label} পেজে যেতে এখানে চাপুন: [BUTTON:${matchedPage.path}]\n\nআরও গুরুত্বপূর্ণ পেজ দেখতে লিখুন—“সব পেজ দেখাও”।`;
  }

  const pageList = WEBSITE_KNOWLEDGE.pages
    .filter((page) => page.key !== "home")
    .map((page) => pageButton(page.path, page.label))
    .join("\n");
  return `ওয়েবসাইটের গুরুত্বপূর্ণ পেজগুলো:\n\n${pageList}\n\nআপনি কী খুঁজছেন বললে আমি সরাসরি সঠিক পেজে নিয়ে যেতে পারি।`;
}

function buildToolReply(intent) {
  if (intent === "audio") {
    return `**Audio Studio Mode** দিয়ে আপনি অডিও/ভয়েস আরও পরিষ্কার ও প্রফেশনাল করতে পারবেন।\n\nসম্ভব কাজগুলো:\n- নয়েজ কমানো ও voice cleanup\n- volume boost ও clarity enhancement\n- podcast/radio style processing\n- কবিতা/আবৃত্তির জন্য reverb ambience\n- music mix নির্দেশনা\n\nব্যবহার: ফাইল আপলোড করে লিখুন—“নয়েজ কমাও”, “ভয়েস ক্লিন করো” বা “মিউজিকের সাথে মিক্স করো”।`;
  }
  if (intent === "vision") {
    return `**Vision Assistant** দিয়ে ছবি, স্ক্রিনশট বা ডিজাইন বিশ্লেষণ করা যায়।\n\nআপনি করতে পারেন:\n- ছবির caption বা description\n- design review ও improvement suggestion\n- screenshot error বুঝে সমাধান\n- ছবির লেখা পড়ে সারাংশ/অনুবাদ\n\nব্যবহার: ছবি আপলোড করে কী জানতে চান তা লিখুন।`;
  }
  return null;
}

function buildCanonicalReply(messages = []) {
  const rawText = extractUserText(messages);
  const userText = normalizeForIntent(rawText);
  if (!userText) return null;

  const intent = detectIntent(userText);
  if (!intent) return null;

  if (intent.intent === "teaching") {
    return "অবশ্যই, আমি ধাপে ধাপে শেখাতে পারি। আপনি যে বিষয়টি শিখতে চান সেটি লিখুন—আমি সহজ ভাষায় ধারণা, উদাহরণ, অনুশীলন এবং পরবর্তী ধাপ সাজিয়ে দেব।";
  }

  switch (intent.intent) {
    case "book":
      return buildBookReply(userText);
    case "writing":
      return buildWritingReply(userText);
    case "recitation":
      return buildRecitationReply(userText);
    case "author":
      return buildAuthorReply();
    case "contact":
      return buildContactReply();
    case "audio":
    case "vision":
      return buildToolReply(intent.intent);
    case "design":
      return "সরদার ডিজাইন স্টুডিওতে কবিতা, উক্তি বা লেখার কার্ড তৈরি করা যায়। ছবি, টেক্সট, স্টিকার, ফিল্টার ও ব্যাকগ্রাউন্ডসহ ডিজাইন করতে এখানে যান: [BUTTON:/editor]";
    case "gallery":
      return "মাহবুব সরদার সবুজের ছবি ও গ্যালারি দেখতে এই পেজে যান: [BUTTON:/gallery]";
    case "news":
      return "সর্বশেষ আপডেট ও সংবাদ পড়তে সরদার সংবাদ পেজে যান: [BUTTON:/news]";
    case "community":
      return "**আমিও লিখবো বাস্তবতা** হলো একটি সোশ্যাল ফিড, যেখানে পাঠকেরা নিজের বাস্তব অনুভূতি ও গল্প শেয়ার করতে পারেন। পেজ: [BUTTON:/amio-likhbo-bastobota]";
    case "site":
      return buildSiteReply(userText);
    default:
      return null;
  }
}

function buildFallbackReply(messages = [], originalError = null) {
  const canonicalReply = buildCanonicalReply(messages);
  if (canonicalReply) return canonicalReply;

  const userText = extractUserText(messages).toLowerCase();

  // Greetings — always respond warmly even in fallback mode
  if (/^(hi|hello|hey|হ্যালো|হ্যালো|হ্যাই|হাই|আস্সালামু|সালাম|নমস্কার|শুভেচ্ছা|কেমন আছ|কেমন আছেন|ভালো আছ|ভালো আছেন|শুভ সকাল|শুভ বিকাল|শুভ সন্ধ্যা|শুভ রাত|good morning|good evening|good night|good afternoon)/.test(userText.trim())) {
    return "আস্সালামু আলাইকুম! আমি মাহবুব সরদার সবুজের AI সহকারী।\n\nআপনাকে কীভাবে সাহায্য করতে পারি?\n• লেখক সম্পর্কে জানতে: [BUTTON:/about]\n• বই ও ই-বুক দেখতে: [BUTTON:/ebooks]\n• লেখালেখি পড়তে: [BUTTON:/writings]\n• যোগাযোগ করতে: [BUTTON:/contact]";
  }

  // Thank you messages
  if (/ধন্যবাদ|thanks|thank you|শুক্রিয়া|আপনাকে ধন্যবাদ/.test(userText)) {
    return "আপনাকেও ধন্যবাদ। আর কোনো প্রশ্ন থাকলে জানাবেন।";
  }

  if (/দুঃখবিলাস|বিচ্ছেদকে বলি/.test(userText)) {
    return "\"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" — মাহবুব সরদার সবুজের প্রথম ফিজিক্যাল বই (২০২৬)। রকমারি থেকে অর্ডার করুন: https://rkmri.co/TTMEoA3l3pM0/\n\nঅনলাইনে পড়তে: [BUTTON:/ebooks/read/dukkhovilash]";
  }
  if (/বই|ebook|ই-বুক|চাঁদফুল|স্মৃতির বসন্তে|সময়ের গহ্বরে|অনবদ্য|কিনব|পড়ব|পড়তে/.test(userText)) {
    return "মাহবুব সরদার সবুজের বই সংগ্রহ:\n\n📚 ফিজিক্যাল বই: \"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" — রকমারি: https://rkmri.co/TTMEoA3l3pM0/\n\n📖 বিনামূল্যে ই-বুক:\n• স্মৃতির বসন্তে তুমি: [BUTTON:/ebooks/read/smritir-boshonte]\n• চাঁদফুল: [BUTTON:/ebooks/read/chand-phool]\n• সময়ের গহ্বরে: [BUTTON:/ebooks/read/shomoyer-gohvore]\n• অনবদ্য লেখা: [BUTTON:/ebooks/read/onoboddo-lekha]\n\nসব বই দেখতে: [BUTTON:/ebooks]";
  }
  if (/যোগাযোগ|contact|ইমেইল|email|ফেসবুক|facebook|instagram|youtube/.test(userText)) {
    return "লেখকের সাথে যোগাযোগ করুন:\n📧 ইমেইল: lekhokmahbubsardarsabuj@gmail.com\n📘 Facebook: https://facebook.com/MahbubSardarSabuj\n📸 Instagram: https://instagram.com/mahbub_sardar_sabuj\n▶️ YouTube: https://youtube.com/@MahbubSardarSabuj\n\nযোগাযোগ ফর্ম: [BUTTON:/contact]";
  }
  if (/অডিও|audio|ভয়েস|voice|নয়েজ|noise|মিউজিক|music|রেকর্ড|record|এডিট|edit|সাউন্ড|sound|মিক্স|mix/.test(userText)) {
    return "🎙️ অডিও এডিটিং সুবিধা\n\nএই চ্যাটবটটি একটি শক্তিশালী AI অডিও এডিটর! আপনি যা করতে পারবেন:\n\n🔊 ভয়েস ক্লিনিং — নয়েজ কমানো, ভয়েস পরিষ্কার করা\n🎵 স্মার্ট মিক্স — ব্যাকগ্রাউন্ড মিউজিক যোগ করা\n🎤 পডকাস্ট মোড — রেডিও/পডকাস্ট কোয়ালিটি\n🔔 ইকো/রিভার্ব — কবিতা বা গজলের জন্য\n🎚️ ভলিউম বুস্ট — সাউন্ড বাড়ানো/কমানো\n\n📎 কীভাবে ব্যবহার করবেন:\n১. নিচের 📎 বাটনে ক্লিক করে অডিও ফাইল আপলোড করুন\n২. বলুন কী করতে চান (যেমন: \'নয়েজ কমাও\', \'মিউজিক যোগ করো\')\n৩. AI প্রসেস করে এডিটেড অডিও দিয়ে দেবে!";
  }
  if (/কে|পরিচয়|about|লেখক|কবি|জন্ম|কুমিল্লা|সৌদি|মাহবুব/.test(userText)) {
    return "মাহবুব সরদার সবুজ বাংলা ভাষার একজন লেখক ও কবি। কুমিল্লার বরুড়া উপজেলার আরিফপুর গ্রামে জন্মগ্রহণ করেন। বর্তমানে সৌদি আরবে কর্মরত। ফেসবুকে ১ লক্ষ ১০ হাজারেরও বেশি ফলোয়ার।\n\nবিস্তারিত: [BUTTON:/about]";
  }
  if (/আবৃত্তি|recitation|জানেন বাবা|কাঁদলে মা|তবুও তাকে|বিবেকের আদালত/.test(userText)) {
    return "মাহবুব সরদার সবুজের ৯টি জনপ্রিয় আবৃত্তি:\n১. জানেন বাবা\n২. আমি কাঁদলে মা আর কাঁদে না\n৩. তবুও তাকে ভালো\n৪. আমি জানি সব ঠিক হয়ে যাওয়ার একটা নিয়ম আছে\n৫. মাঝে মাঝে ইচ্ছে হয় তোমাকে ডেকে বলি\n৬. নারীকে ভালোবাসার আগে\n৭. মানুষটা তোমার প্রতি অন্ধ\n৮. এমনভাবে সরে যাবো একদিন\n৯. বিবেকের আদালত\n\nশুনতে যান: [BUTTON:/facebook-recitations]";
  }
  if (/সংবাদ|news|খবর|সরদার সংবাদ/.test(userText)) {
    return "সর্বশেষ সংবাদ পড়তে সরদার সংবাদ পেজে যান: [BUTTON:/news]";
  }
  if (/ডিজাইন|design|কার্ড|editor|এডিটর|স্টুডিও/.test(userText)) {
    return "সরদার ডিজাইন স্টুডিওতে কবিতার কার্ড তৈরি করুন: [BUTTON:/editor]";
  }
  if (/গ্যালারি|gallery|ছবি|ফটো/.test(userText)) {
    return "লেখকের গ্যালারি দেখতে যান: [BUTTON:/gallery]";
  }
  if (/লেখালেখি|writings|কবিতা|poem|ভালোবাসা|বিচ্ছেদ|জীবনদর্শন/.test(userText)) {
    return "মাহবুব সরদার সবুজের ১১৯৮টি লেখা পড়তে যান: [BUTTON:/writings]\n\nবিষয়ভিত্তিক: জীবনদর্শন (৫৭০), বিচ্ছেদ (২৫১), ভালোবাসা (১৬৮), কবিতা (৪০)";
  }
  if (/আমিও লিখবো|লিখবো বাস্তবতা|amio|bastobota/.test(userText)) {
    return "আমিও লিখবো বাস্তবতা — একটি সোশ্যাল ফিড যেখানে যে কেউ নিজের বাস্তব গল্প শেয়ার করতে পারেন: [BUTTON:/amio-likhbo-bastobota]";
  }
  if (/রকমারি|rokomari|কিনতে|order/.test(userText)) {
    return "\"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" বইটি রকমারি থেকে কিনুন: https://rkmri.co/TTMEoA3l3pM0/";
  }

  // Default: helpful navigation response instead of a dead-end error message
  return "আপনার প্রশ্নটি বুঝতে পারিনি, কিন্তু আমি সাহায্য করতে পারি:\n\n• লেখক সম্পর্কে জানতে: [BUTTON:/about]\n• বই ও ই-বুক দেখতে: [BUTTON:/ebooks]\n• লেখালেখি পড়তে: [BUTTON:/writings]\n• সরাসরি যোগাযোগ: [BUTTON:/contact]\n\nবিস্তারিত প্রশ্ন থাকলে আবার জিজ্ঞেস করুন অথবা লাইভ চ্যাটে সরাসরি কথা বলুন।";
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
    throw new Error("No AI API key configured. Set OPENAI_API_KEY, GEMINI_API_KEY, or BUILT_IN_FORGE_API_KEY.");
  }
  let lastError;
  for (const config of configs) {
    try {
      return await callAIWithConfig(messages, config);
    } catch (err) {
      lastError = err;
      const is429 = err.message?.includes("429");
      const is503 = err.message?.includes("503") || err.message?.includes("overloaded");

      if (is429 && config.skipOn429) {
        // Quota exceeded — skip remaining providers and go straight to fallback
        console.warn(`[AI] ${config.source} quota exceeded (429). Skipping to built-in fallback.`);
        throw err;
      }

      if (is429 || is503) {
        // Rate-limited or overloaded — try next provider
        console.warn(`[AI] ${config.source} rate-limited/overloaded (${is429 ? 429 : 503}). Trying next provider...`);
        continue;
      }

      console.error(`[AI] ${config.source} failed:`, err.message);
      // For other errors (auth, network, etc.) also try next provider
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

// ── Streaming handler (for /api/chat-stream compatibility) ────────────────────
// Only use OpenAI-compatible streaming endpoints (Gemini native API has different SSE format)
function resolveStreamConfigs() {
  const configs = [];
  // Groq API — free tier, fast inference, supports streaming
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    const groqModel = process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";
    configs.push({
      source: "groq",
      apiKey: groqKey,
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      model: groqModel,
    });
  }
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    const baseUrl = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
    const model = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
    configs.push({ source: "openai", apiKey: openaiKey, endpoint: `${baseUrl}/chat/completions`, model });
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
  // Gemini direct API — OpenAI-compatible endpoint supports streaming
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    const primaryModel = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash-lite";
    configs.push({
      source: "gemini",
      apiKey: geminiKey,
      endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      model: primaryModel,
    });
  }
  return configs;
}

async function handleStream(req, res, allMessages) {
  const configs = resolveStreamConfigs();
  if (configs.length === 0) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.write(`data: ${JSON.stringify({ error: "AI API key not configured." })}\n\n`);
    res.end();
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  let streamSuccess = false;

  for (const config of configs) {
    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: allMessages,
          max_tokens: 4000,
          temperature: 0.7,
          stream: true,
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        console.warn(`[stream] ${config.source} error ${response.status}: ${errText.slice(0, 100)}`);
        continue;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullReply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json?.choices?.[0]?.delta?.content;
            if (delta) {
              fullReply += delta;
              const sanitized = sanitizeReply(delta);
              res.write(`data: ${JSON.stringify({ delta: sanitized })}\n\n`);
            }
          } catch {
            // skip malformed chunk
          }
        }
      }

      res.write(`data: ${JSON.stringify({ done: true, fullReply: sanitizeReply(fullReply) })}\n\n`);
      res.end();
      streamSuccess = true;
      break;

    } catch (err) {
      console.error(`[stream] ${config.source} failed:`, err.message);
      continue;
    }
  }

  if (!streamSuccess) {
    // Non-streaming fallback: use callAIWithConfig and emit as SSE
    const nonStreamConfigs = resolveAiConfigs();
    let fallbackReply = null;
    const fallbackErrors = [];
    for (const config of nonStreamConfigs) {
      try {
        fallbackReply = await callAIWithConfig(allMessages, config);
        if (fallbackReply) break;
      } catch (err) {
        const errMsg = err.message || String(err);
        console.error(`[stream-fallback] ${config.source} failed:`, errMsg);
        fallbackErrors.push(`${config.source}:${errMsg.slice(0, 50)}`);
      }
    }
    if (!fallbackReply) {
      // All AI providers failed — use built-in keyword-based reply as last resort
      fallbackReply = buildFallbackReply(allMessages);
      console.warn("[stream-fallback] All AI providers failed. Using built-in fallback reply.");
    }
    if (fallbackReply) {
      const sanitized = sanitizeReply(fallbackReply);
      res.write(`data: ${JSON.stringify({ delta: sanitized })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, fullReply: sanitized })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ error: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।", _debug: fallbackErrors.join("|") })}\n\n`);
    }
    res.end();
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (limitJsonBodySize(req, res, 2 * 1024 * 1024)) return;

  // Detect streaming mode: ?stream=1 query param (used by /api/chat-stream redirect)
  const url = new URL(req.url || "/", "https://local.invalid");
  const isStream = url.searchParams.get("stream") === "1";

  const rate = checkRateLimit(req, res, { keyPrefix: isStream ? "chat-stream" : "chat", windowMs: 60 * 1000, max: 20 });
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

    // Streaming mode — SSE response
    if (isStream) {
      return await handleStream(req, res, allMessages);
    }

    // Normal (non-streaming) mode
    res.setHeader("Cache-Control", "no-store");

    const lastUserMsg = messages.filter((m) => m.role === "user").slice(-1)[0];
    const lastUserImgPart = Array.isArray(lastUserMsg?.content)
      ? lastUserMsg.content.find((p) => p.type === "image_url")?.image_url?.url
      : null;
    const userMsgText = lastUserMsg
      ? (Array.isArray(lastUserMsg.content) ? lastUserMsg.content.find((p) => p.type === "text")?.text || "[ছবি পাঠানো হয়েছে]" : lastUserMsg.content)
      : "(অজানা)";

    const canonicalReply = buildCanonicalReply(messages);
    if (canonicalReply) {
      await notifyTelegram({
        userMessage: userMsgText,
        aiResponse: canonicalReply,
        clientIp: rate.clientIp,
        userAgent: req.headers["user-agent"],
        imageData: lastUserImgPart || null,
      }).catch((e) => console.error("Telegram notification failed:", e.message));
      return res.status(200).json({ reply: sanitizeReply(canonicalReply), source: "canonical" });
    }

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
      const is429 = err.message?.includes("429");
      console.error("AI API failed; returning built-in fallback reply:", err.message);
      const fallbackReply = buildFallbackReply(messages, err);

      if (!is429) {
        await notifyTelegram({
          userMessage: userMsgText,
          aiResponse: `${fallbackReply}\n\n[Fallback: ${err.message.slice(0, 120)}]`,
          clientIp: rate.clientIp,
          userAgent: req.headers["user-agent"],
          imageData: lastUserImgPart || null,
        }).catch((e) => console.error("Telegram fallback notification failed:", e.message));
      } else {
        console.warn("[AI] Skipping Telegram notification for 429 quota error (not actionable)");
      }

      return res.status(200).json({ reply: sanitizeReply(fallbackReply), fallback: true });
    }
  } catch (err) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" });
  }
}
// Force redeploy Sat May 30 14:17:36 UTC 2026
