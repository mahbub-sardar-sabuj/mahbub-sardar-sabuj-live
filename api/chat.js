// api/chat.js — সম্পূর্ণ আপডেট: General AI + Knowledge Base
const SYSTEM_PROMPT = `তুমি একটি অত্যন্ত বুদ্ধিমান, সহায়ক এবং সাধারণ AI (General AI)। তোমার নাম "সবুজের AI সহকারী"। তুমি লেখক মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটে কাজ করো।
তোমার প্রধান দায়িত্ব হলো একজন সাধারণ AI হিসেবে ব্যবহারকারীর যেকোনো প্রশ্নের উত্তর দেওয়া এবং একই সাথে মাহবুব সরদার সবুজের ওয়েবসাইট সম্পর্কে যেকোনো তথ্য নির্ভুলভাবে জানানো।

## তোমার পরিচয় ও সক্ষমতা
১. তুমি একজন সাধারণ AI (General AI) - তুমি বিজ্ঞান, ইতিহাস, প্রযুক্তি, গণিত, রান্না, স্বাস্থ্য, প্রোগ্রামিং, সাহিত্যসহ যেকোনো বিষয়ে উত্তর দিতে পারো।
২. তুমি ChatGPT বা Gemini-এর মতোই সব বিষয়ে পারদর্শী। কেউ যেকোনো বিষয়ে প্রশ্ন করলে তুমি বিস্তারিত, তথ্যবহুল এবং গুছিয়ে উত্তর দেবে।
৩. তুমি একই সাথে মাহবুব সরদার সবুজের ওয়েবসাইটের "বিশেষজ্ঞ"। ওয়েবসাইটের সব তথ্য তোমার জানা আছে।
৪. তুমি একজন শক্তিশালী "অডিও এডিটর"। ব্যবহারকারী অডিও আপলোড করে কমান্ড দিলে তুমি তা প্রসেস করতে পারো।

## মাহবুব সরদার সবুজ সম্পর্কে (Website Knowledge)
- জন্মস্থান: কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রাম।
- পেশা: লেখক, কবি ও সাহিত্যিক।
- সোশ্যাল মিডিয়া: 
  - Facebook: https://facebook.com/MahbubSardarSabuj
  - Instagram: https://www.instagram.com/mahbub_sardar_sabuj
  - YouTube: https://youtube.com/@MahbubSardarSabuj
- ইমেইল: lekhokmahbubsardarsabuj@gmail.com

## ওয়েবসাইটের লেখালেখি (১১৯৯টি লেখা)
ওয়েবসাইটে মোট ১১৯৯টি লেখা রয়েছে:
- জীবনদর্শন: ৬৬২টি (সবচেয়ে বেশি)
- বিচ্ছেদ: ২৫১টি
- ভালোবাসা: ১৯০টি
- ছোট লেখা: ৫৫টি
- কবিতা: ৪০টি

## বই ও ই-বুক (E-Books & Books)
১. আমি বিচ্ছেদকে বলি দুঃখবিলাস (প্রথম ফিজিক্যাল বই) - কেনার লিংক: https://rkmri.co/TTMEoA3l3pM0/
২. স্মৃতির বসন্তে তুমি (ই-বুক)
৩. চাঁদফুল (ই-বুক)
৪. সময়ের গহ্বরে (ই-বুক)
৫. মাহবুব সরদার সবুজের অনবদ্য লেখা (ই-বুক সংকলন)

## আবৃত্তি (Recitations)
ওয়েবসাইটে ইউটিউব ও ফেসবুকের অনেক আবৃত্তি রয়েছে। যেমন:
- জানেন বাবা
- আমি কাঁদলে মা আর কাঁদে না
- তবুও তাকে ভালো
- আমি জানি সব ঠিক হয়ে যাওয়ার একটা নিয়ম আছে
- তোমাকে ভুলে গেছি-এই কথাটা নিজেকে প্রতিদিন বলি
- এক সময় ভেবেছিলাম,মানুষগুলো হয়তো অন্তর থেকে ভালো

## অডিও এডিটিং (Audio Editing)
তুমি একটি অত্যন্ত শক্তিশালী অডিও এডিটর। ব্যবহারকারীরা অডিও ফাইল আপলোড করে কমান্ড দিলে তুমি তা প্রসেস করে দেবে।
কী কী করতে পারো:
১. স্মার্ট মিক্স (Smart Mix): ভয়েসের সাথে ব্যাকগ্রাউন্ড মিউজিক যোগ করা।
২. ভয়েস ক্লিনিং (Clean/Enhance): নয়েজ পরিষ্কার করা।
৩. পডকাস্ট/রেডিও (Podcast/Radio): রেডিও বা পডকাস্টের মতো সাউন্ড করা।
৪. ইকো/রিভার্ব (Echo/Reverb): ভয়েসে ইকো বা রিভার্ব যোগ করা।
৫. ভয়েস চেঞ্জার (Voice Changer): ভয়েস মোটা বা চিকন করা।
৬. ভলিউম বাড়ানো (Volume Boost): সাউন্ড বাড়ানো বা কমানো।
৭. মিউট/সাইলেন্স (Remove Silence): অডিও থেকে সাইলেন্স বাদ দেওয়া।

## ওয়েবসাইটের পেজসমূহ
- হোম (Home): /
- পরিচিতি (About): /about
- বই (Books): /ebooks
- লেখালেখি (Writings): /writings
- আবৃত্তি (Recitations): /recitations
- খবর (News): /news
- যোগাযোগ (Contact): /contact

## তোমার কাজের নিয়ম (Rules)
১. সাধারণ প্রশ্ন (General AI): কেউ যদি বিজ্ঞান, ইতিহাস, প্রযুক্তি বা যেকোনো বিষয়ে প্রশ্ন করে, তবে তুমি একজন সাধারণ AI-এর মতো বিস্তারিত ও নির্ভুল উত্তর দেবে। কখনোই বলবে না যে তুমি শুধু ওয়েবসাইট সম্পর্কে জানো।
২. ওয়েবসাইট প্রশ্ন: কেউ লেখক, বই বা ওয়েবসাইট সম্পর্কে জানতে চাইলে উপরের তথ্যগুলো ব্যবহার করে নির্ভুল উত্তর দেবে।
৩. অডিও এডিটিং: কেউ অডিও আপলোড করে কমান্ড দিলে (যেমন: "নয়েজ কমাও") তুমি তা প্রসেস করবে।
৪. ভাষা: তুমি সব সময় সুন্দর ও শুদ্ধ বাংলায় উত্তর দেবে (যদি না ব্যবহারকারী অন্য ভাষায় প্রশ্ন করে)।
৫. টোন: তোমার টোন হবে অত্যন্ত বিনয়ী, সহায়ক এবং প্রফেশনাল।
৬. কোনো প্রশ্নের উত্তর না জানা থাকলে বিনীতভাবে স্বীকার করবে।
৭. তুমি এখন আর কোনো নির্দিষ্ট বিষয়ে সীমাবদ্ধ নও, তুমি সব পারো!`;

import {
  checkRateLimit,
  isProbablySpamText,
  limitJsonBodySize,
  normalizeText,
} from "./_utils/security.js";

// ── AI provider configuration ──────────────────────────────────────────────
// Provider priority order:
//   1. OpenAI-compatible API (primary, best instruction-following for factual site Q&A)
//   2. Forge (built-in fallback, avoids downtime if OpenAI is unavailable)
//   3. Gemini direct API (last resort; free tier can hit quota)
//
// This order reduces wrong profile answers by using the strongest configured model first,
// while still keeping robust fallback behavior for production visitors.
function resolveAiConfigs() {
  const configs = [];

  // 1. OpenAI-compatible API — primary provider
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    const baseUrl = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
    const model = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
    configs.push({ source: "openai", apiKey: openaiKey, endpoint: `${baseUrl}/chat/completions`, model, skipOn429: false });
  }

  // 2. Forge API — stable fallback
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


function buildCanonicalReply(messages = []) {
  const rawText = extractUserText(messages);
  const userText = rawText.toLowerCase().replace(/\s+/g, " ").trim();
  if (!userText) return null;

  const wantsBook = /দুঃখবিলাস|বিচ্ছেদকে বলি|বই|ebook|ই-বুক|চাঁদফুল|স্মৃতির বসন্তে|সময়ের গহ্বরে|অনবদ্য|কিনব|কিনতে|পড়ব|পড়তে|রকমারি|rokomari|order/.test(userText);
  const wantsContact = /যোগাযোগ|contact|ইমেইল|email|ফেসবুক|facebook|instagram|ইনস্টাগ্রাম|youtube|ইউটিউব|সোশ্যাল|social/.test(userText);
  const wantsRecitation = /আবৃত্তি|recitation|জানেন বাবা|কাঁদলে মা|তবুও তাকে|বিবেকের আদালত|নারীকে ভালোবাসার আগে/.test(userText);
  const wantsWriting = /লেখালেখি|writings|লেখা|ভালোবাসার লেখা|বিচ্ছেদের লেখা|জীবনদর্শন|ছোট লেখা|কবিতা পড়|কবিতা দেখ|archive|আর্কাইভ/.test(userText);
  const wantsAuthor = /মাহবুব|সবুজ|লেখক|কবি|পরিচয়|about|জন্ম|জন্মস্থান|কোথায় থাকেন|বর্তমান অবস্থান|সৌদি|কুমিল্লা|আরিফপুর|খোশবাস|ফলোয়ার|পাঠকসংখ্যা|আপনি কে|তুমি কে|আপনার সম্পর্কে|তার সম্পর্কে|আমার সম্পর্কে/.test(userText);
  const wantsSite = /ওয়েবসাইট|website|পেজ|লিংক|মেনু|কোথায় পাব|কোথায় আছে/.test(userText);

  if (/দুঃখবিলাস|বিচ্ছেদকে বলি|রকমারি|rokomari|order|কিনতে/.test(userText)) {
    return "**আমি বিচ্ছেদকে বলি দুঃখবিলাস** মাহবুব সরদার সবুজের প্রথম ফিজিক্যাল কাব্যগ্রন্থ। প্রকাশ: ২০২৬, পৃষ্ঠা: ১৫০+। বইটি বিচ্ছেদ, অপেক্ষা, হারানোর বেদনা ও ভালোবাসার গভীর অনুভূতি নিয়ে লেখা।\n\nরকমারি থেকে অর্ডার করুন: https://rkmri.co/TTMEoA3l3pM0/\n\nঅনলাইনে পড়তে: [BUTTON:/ebooks/read/dukkhovilash]\nসব বই দেখতে: [BUTTON:/ebooks]";
  }

  if (wantsBook) {
    return "মাহবুব সরদার সবুজের যাচাইকৃত বই ও ই-বুক তালিকা:\n\n১. **আমি বিচ্ছেদকে বলি দুঃখবিলাস** — প্রথম ফিজিক্যাল কাব্যগ্রন্থ, ২০২৬, ১৫০+ পৃষ্ঠা। রকমারি: https://rkmri.co/TTMEoA3l3pM0/ এবং পাঠ: [BUTTON:/ebooks/read/dukkhovilash]\n২. **স্মৃতির বসন্তে তুমি** — ই-বুক, ২০২৪, ৮০+ পৃষ্ঠা। [BUTTON:/ebooks/read/smritir-boshonte]\n৩. **চাঁদফুল** — ই-বুক, ২০২৩, ৬০+ পৃষ্ঠা। [BUTTON:/ebooks/read/chand-phool]\n৪. **সময়ের গহ্বরে** — ই-বুক, ২০২৩, ১০০+ পৃষ্ঠা। [BUTTON:/ebooks/read/shomoyer-gohvore]\n৫. **মাহবুব সরদার সবুজের অনবদ্য লেখা** — ১০০টি জীবনমুখী ও অনুপ্রেরণামূলক লেখার সংকলন। [BUTTON:/ebooks/read/onoboddo-lekha]\n\nসব ই-বুক বিনামূল্যে পড়া যায়। সম্পূর্ণ সংগ্রহ: [BUTTON:/ebooks]";
  }

  if (wantsContact) {
    return "লেখকের অফিসিয়াল যোগাযোগ তথ্য:\n\nইমেইল: lekhokmahbubsardarsabuj@gmail.com\nFacebook: https://facebook.com/MahbubSardarSabuj\nInstagram: https://instagram.com/mahbub_sardar_sabuj\nYouTube: https://youtube.com/@MahbubSardarSabuj\n\nযোগাযোগ ফর্ম ব্যবহার করতে পারেন: [BUTTON:/contact]\nসরাসরি কথা বলতে চাইলে চ্যাটবটের **সরাসরি চ্যাট** ট্যাব ব্যবহার করুন।";
  }

  if (wantsRecitation) {
    return "মাহবুব সরদার সবুজের ৯টি জনপ্রিয় Facebook আবৃত্তি রয়েছে:\n\n১. জানেন বাবা\n২. আমি কাঁদলে মা আর কাঁদে না\n৩. তবুও তাকে ভালো\n৪. আমি জানি সব ঠিক হয়ে যাওয়ার একটা নিয়ম আছে\n৫. মাঝে মাঝে ইচ্ছে হয় তোমাকে ডেকে বলি\n৬. নারীকে ভালোবাসার আগে\n৭. মানুষটা তোমার প্রতি অন্ধ\n৮. এমনভাবে সরে যাবো একদিন\n৯. বিবেকের আদালত\n\nশুনতে/দেখতে যান: [BUTTON:/facebook-recitations]\nঅফিসিয়াল Facebook পেজ: https://www.facebook.com/MahbubSardarSabuj";
  }

  if (wantsWriting) {
    return "ওয়েবসাইটে মাহবুব সরদার সবুজের মোট **১১৯৮টি লেখা** রয়েছে। বিভাগগুলো হলো: জীবনদর্শন ৫৭০টি, বিচ্ছেদ ২৫১টি, ভালোবাসা ১৬৮টি, ছোট লেখা ৫৫টি এবং কবিতা ৪০টি।\n\nলেখাগুলো পড়তে: [BUTTON:/writings]\nই-বুক সংগ্রহ: [BUTTON:/ebooks]\nআপনি চাইলে নির্দিষ্টভাবে বলতে পারেন—ভালোবাসা, বিচ্ছেদ, জীবনদর্শন বা কবিতা কোন ধরনের লেখা দেখতে চান।";
  }

  if (wantsAuthor) {
    return "মাহবুব সরদার সবুজ বাংলা ভাষার একজন নিবেদিতপ্রাণ লেখক ও কবি। তিনি ভালোবাসা, বিচ্ছেদ, জীবনসংগ্রাম, স্মৃতি ও মানবিক অনুভূতিকে সহজ অথচ আবেগঘন ভাষায় প্রকাশ করেন।\n\nযাচাইকৃত পরিচিতি:\n- জন্মস্থান: কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়ি\n- বর্তমান অবস্থান: কর্মসূত্রে সৌদি আরব\n\n- Facebook পেজ: ১ লক্ষ ১০ হাজারেরও বেশি ফলোয়ার\n- পাঠকসংখ্যা: ৫০ হাজারেরও বেশি পাঠক তাঁর ই-বুক পড়েছেন\n\nতিনি নিজেকে এভাবে প্রকাশ করেন: “কলমের স্পর্শে আমি বিদ্রোহী, ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি; কেউ কেউ ভালোবেসে ডাকে আমায় কবি।”\n\nআরও পড়ুন: [BUTTON:/about]";
  }

  if (/ডিজাইন|design|কার্ড|editor|এডিটর|স্টুডিও|পোস্টার/.test(userText)) {
    return "সরদার ডিজাইন স্টুডিওতে কবিতা, উক্তি বা লেখার কার্ড তৈরি করা যায়। ছবি, টেক্সট, স্টিকার, ফিল্টার ও ব্যাকগ্রাউন্ডসহ ডিজাইন করতে এখানে যান: [BUTTON:/editor]";
  }

  if (/গ্যালারি|gallery|ছবি|ফটো/.test(userText)) {
    return "মাহবুব সরদার সবুজের ছবি ও গ্যালারি দেখতে এই পেজে যান: [BUTTON:/gallery]";
  }

  if (/সংবাদ|news|খবর|সরদার সংবাদ/.test(userText)) {
    return "সর্বশেষ আপডেট ও সংবাদ পড়তে সরদার সংবাদ পেজে যান: [BUTTON:/news]";
  }

  if (/আমিও লিখবো|লিখবো বাস্তবতা|amio|bastobota/.test(userText)) {
    return "**আমিও লিখবো বাস্তবতা** হলো একটি সোশ্যাল ফিড, যেখানে পাঠকেরা নিজের বাস্তব অনুভূতি ও গল্প শেয়ার করতে পারেন। পেজ: [BUTTON:/amio-likhbo-bastobota]";
  }

  if (wantsSite) {
    return "ওয়েবসাইটের গুরুত্বপূর্ণ পেজগুলো:\n\nপরিচিতি: [BUTTON:/about]\nলেখালেখি: [BUTTON:/writings]\nই-বুক: [BUTTON:/ebooks]\nআবৃত্তি: [BUTTON:/facebook-recitations]\nডিজাইন স্টুডিও: [BUTTON:/editor]\nগ্যালারি: [BUTTON:/gallery]\nসংবাদ: [BUTTON:/news]\nযোগাযোগ: [BUTTON:/contact]";
  }

  return null;
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
    return "আপনাকেও ধন্যবাদ! আর কোনো প্রশ্ন থাকলে জানাবেন। 😊";
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

      // FIX: Don't spam Telegram on every 429 quota error — only notify for unexpected failures
      // 429 = quota exceeded (expected, not actionable), so we skip Telegram notification
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
