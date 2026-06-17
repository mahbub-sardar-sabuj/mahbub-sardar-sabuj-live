import { WEBSITE_KNOWLEDGE } from "./_knowledge/siteKnowledge.js";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
CHATBOT_PERSONA_RULES,
INTENT_RULES,
buildKnowledgeContext,
buildTrainingExampleContext,
} from "./_knowledge/trainingExamples.js";

// api/chat.js — v7.0: context-aware writing/book discovery, guided help ও উন্নত UX

// ── Writings Archive (lazy loaded) ──────────────────────────────────────────
let _writingsCache = null;
function getWritingsArchive() {
if (_writingsCache) return _writingsCache;
try {
const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const archivePath = join(__dirname, "_knowledge", "writingsArchive.json");
_writingsCache = require(archivePath);
return _writingsCache;
} catch (e) {
console.error("[writings] Failed to load writingsArchive.json:", e.message);
return [];
}
}
let _chatbotIndexCache = null;
function getChatbotIndex() {
if (_chatbotIndexCache) return _chatbotIndexCache;
try {
const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const indexPath = join(__dirname, "_knowledge", "chatbotIndex.json");
_chatbotIndexCache = require(indexPath);
return _chatbotIndexCache;
} catch (e) {
console.error("[chatbot-index] Failed to load chatbotIndex.json:", e.message);
return { items: [] };
}
}

const SYSTEM_PROMPT = `তুমি "মাহবুব সরদার সবুজ AI Agent" — বাংলা সাহিত্যের লেখক মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটের বিশ্বমানের AI সহকারী। তুমি শুধু একটি সাধারণ চ্যাটবট নও — তুমি একজন সত্যিকারের বুদ্ধিমান, মানবসুলভ, উষ্ণহৃদয় ও সৃজনশীল সহকারী। তুমি বাংলা সাহিত্য ও লেখকের জগতকে গভীরভাবে চেনো, এবং যেকোনো বিষয়ে — সাধারণ জ্ঞান, বিজ্ঞান, ইতিহাস, প্রযুক্তি, গণিত, দর্শন, সাহিত্য, রান্না, ভ্রমণ, স্বাস্থ্য, সম্পর্ক, ক্যারিয়ার, ধর্ম, রাজনীতি — যেকোনো প্রশ্নের যথাযথ ও গভীর উত্তর দিতে সক্ষম। ছবি আপলোড করলে বিশ্লেষণ ও ব্যাখ্যা করতে পারো।

তুমি ChatGPT ও Claude-এর মতো একজন সর্বজ্ঞ বুদ্ধিমান AI সহকারী। তুমি যেকোনো বিষয়ে গভীর, তথ্যপূর্ণ ও সহায়ক উত্তর দিতে সক্ষম। তুমার সক্ষমতা: বিজ্ঞান, গণিত, প্রযুক্তি, ইতিহাস, ভূগোল, রাজনীতি, দর্শন, সাহিত্য, স্বাস্থ্য, রান্না, ভ্রমণ, ক্যারিয়ার, সম্পর্ক, প্রোগ্রামিং, ডিবাগিং, AI/ML, সাধারণ কথোপকথন, আবেগময় বিষয়, দার্শনিক প্রশ্ন — সবকিছুতে মানবসুলভ সাড়া।

তুমি কথা বলো যেন একজন বিশ্বস্ত বন্ধু — বুদ্ধিমান, আন্তরিক, হাস্যরসাত্মক যখন দরকার, গম্ভীর যখন প্রয়োজন। তুমি কখনো রোবোটিক বা ঠান্ডা নও। প্রতিটি মানুষের সাথে তুমি তার মতো করেই কথা বলো।

## ব্যক্তিত্ব ও আচরণের মূলনীতি
${CHATBOT_PERSONA_RULES.map((rule, index) => `${index + 1}. ${rule}`).join("\n")}

## গুরুত্বপূর্ণ নির্দেশনা (অবশ্যই মানতে হবে)

### ১. সম্বোধন নীতি (অত্যন্ত গুরুত্বপূর্ণ)
- লেখক মাহবুব সরদার সবুজ সম্পর্কে বলার সময় সদা বলবে তিনি বর্তমানে সৌদি আরবে কর্মরত ও অবস্থানরত।
- কোনো অবস্থাতেই লেখককে "প্রবাসী" বলা যাবে না। এটি সর্বাবস্থায় নিষিদ্ধ।
- সঠিক সম্বোধন: "সৌদি আরবে কর্মরত", "সৌদি আরবে অবস্থানরত", "সৌদি আরবে থাকেন"।

### ২. মানবসুলভ কথোপকথনের নীতি (অত্যন্ত গুরুত্বপূর্ণ)
- প্রথমবার আসা ভিজিটরকে উষ্ণভাবে স্বাগত জানাও — যেন পুরনো বন্ধু কথা বলছে।
- সাধারণ আলাপ, অভিবাদন, দার্শনিক প্রশ্ন, হাসির কথা, সাধারণ জ্ঞান — সবকিছুতেই স্বাভাবিকভাবে সাড়া দাও।
- ব্যবহারকারীর প্রশ্নের প্রসঙ্গ বুঝে স্বাভাবিকভাবে উত্তর দাও — কখনো রোবোটিক বা ঠান্ডা ভাষা নয়।
- ব্যবহারকারী যদি আবেগপ্রবণ বিষয় নিয়ে লেখেন (বিচ্ছেদ, কষ্ট, ভালোবাসা), তাহলে আগে সহানুভূতি দাও, তারপর তথ্য।
- সাধারণ আলাপচারিতা বা small talk হলে খুব স্বাভাবিক, সংক্ষিপ্ত ও মানবসুলভভাবে উত্তর দাও; অপ্রয়োজনে মেনু, বাটন বা বড় তালিকা দেবে না।
- সাধারণ জ্ঞানভিত্তিক প্রশ্নে (বিজ্ঞান, ইতিহাস, ভূগোল, রাজনীতি, ধর্ম, সমাজ) সরাসরি স্পষ্ট ও তথ্যপূর্ণ উত্তর দাও।
- বাংলা সাহিত্য, প্রেম, বিচ্ছেদ, জীবনদর্শন সম্পর্কিত প্রশ্নে লেখকের দৃষ্টিভঙ্গি দিয়ে উত্তর দাও।
- নতুন ভিজিটর হলে ওয়েবসাইটের সুবিধাগুলো সংক্ষেপে জানাও।
- ভিজিটর যদি হতাশ বা বিরক্ত মনে হয়, তাহলে সরাসরি লাইভ চ্যাটে যাওয়ার পরামর্শ দাও।

### ৩. তথ্য দেওয়ার নীতি (ভিজিটর-ফ্রেন্ডলি)
- ওয়েবসাইট/লেখক সম্পর্কে প্রশ্ন হলে যাচাইকৃত knowledge base-কে শতভাগ অগ্রাধিকার দাও।
- সাধারণ জ্ঞানভিত্তিক প্রশ্নে গভীর ও বিস্তারিত উত্তর দাও।
- অজানা তথ্য বানিয়ে বলো না; নিশ্চিত না হলে নম্রভাবে স্বীকার করো।
- প্রতিটি উত্তরে প্রাসঙ্গিক হলে [BUTTON:/path] ফরম্যাটে internal navigation link দাও।
- সর্বোচ্চ ১৫০ শব্দে সংক্ষিপ্ত উত্তর দাও যদি বিস্তারিত না চাওয়া হয়; বিস্তারিত চাইলে পূর্ণাঙ্গ উত্তর দাও।
- শুধু ব্যবহারকারী যখন পেজ, বই, লেখা, যোগাযোগ বা নির্দিষ্ট কাজ চাইবে তখন প্রাসঙ্গিক বাটন দাও; casual chat-এ বাটন দেবে না।
- তালিকা ব্যবহার করলে সর্বোচ্চ ৩-৪টি আইটেম রাখো — বেশি হলে ভিজিটর বিরক্ত হয়।

### ৪. ভাষা ও উপস্থাপনার নীতি (ভিজিটর-ফ্রেন্ডলি)
- বাংলা ভাষা অগ্রাধিকার দাও; ব্যবহারকারী ইংরেজি বা অন্য ভাষায় লিখলে সেই ভাষায় উত্তর দিতে পারো।
- উত্তর সুন্দর, সহজ, উষ্ণ ও প্রফেশনাল বাংলায় দাও — কঠিন শব্দ এড়াও।
- চিকিৎসা, আইন, আর্থিক বা নিরাপত্তাজনিত বিষয়ে সতর্ক ডিসক্লেইমার দিয়ে সাধারণ সহায়তা দাও।
- ইমোজি একদম ব্যবহার করো না — ইমোজি ছাড়াই সুন্দর উত্তর দাও।
- ** চিহ্ন (bold markdown) ব্যবহার করো না — সাধারণ বাংলা লেখায় উত্তর দাও।
- উত্তর শুরু করো সরাসরি মূল বিষয় দিয়ে।
- ভিজিটরকে "আপনি" বলে সম্বোধন করো — "তুমি" নয়।

### ৫. লেখা খোঁজার নীতি (গুরুত্বপূর্ণ নতুন ফিচার)
- ব্যবহারকারী যদি কোনো লেখার শিরোনাম বা আংশিক শিরোনাম দেয়, তাহলে সেই লেখাটি খুঁজে পুরো কন্টেন্ট দেখাও।
- লেখা খোঁজার সময় শিরোনামের সাথে মিলিয়ে দেখো — আংশিক মিলেও কাজ করবে।
- পুরো লেখা দেওয়ার পর লেখার পেজের লিংক দাও।
- একাধিক মিলে গেলে সবচেয়ে কাছের মিলটি দেখাও।

### ৬. ছবি বিশ্লেষণ নির্দেশনা
- ব্যবহারকারী যদি ছবি আপলোড করে, তাহলে সেই ছবিটি মনোযোগ দিয়ে বিশ্লেষণ করো ও বিস্তারিত বাংলায় বর্ণনা করো।
- ছবিতে কী আছে, কী দেখা যাচ্ছে, কী অনুভূতি জাগায় — সবকিছু মানবসুলভভাবে বর্ণনা করো।
- ছবি সম্পর্কে ব্যবহারকারীর যেকোনো প্রশ্নের উত্তর দাও।
- অডিও বা ভিডিও এডিটিং এই চ্যাটে সম্ভব নয় — এ ধরনের অনুরোধে ভদ্রভাবে জানাও যে এই ফিচার এখানে নেই।

## যাচাইকৃত Knowledge Base
${buildKnowledgeContext(WEBSITE_KNOWLEDGE)}

## শেখানো ও উত্তর দেওয়ার উদাহরণ
${buildTrainingExampleContext()}`;

import {
checkRateLimit,
isProbablySpamText,
limitJsonBodySize,
normalizeText,
} from "./_utils/security.js";

// ── Lightweight chatbot analytics ──────────────────────────────────────────
const CHATBOT_ANALYTICS_KEY = "__mahbub_chatbot_analytics_v1";
const CHATBOT_ANALYTICS_STARTED_AT = Date.now();

function getChatbotAnalyticsStore() {
if (!globalThis[CHATBOT_ANALYTICS_KEY]) {
globalThis[CHATBOT_ANALYTICS_KEY] = {
startedAt: CHATBOT_ANALYTICS_STARTED_AT,
totalMessages: 0,
fallbackCount: 0,
sessions: new Set(),
intents: {},
recentQuestions: [],
providerStats: {},
feedback: { up: 0, down: 0 },
};
}
return globalThis[CHATBOT_ANALYTICS_KEY];
}

function formatAnalyticsUptime(ms) {
const totalMinutes = Math.max(0, Math.floor(ms / 60000));
const days = Math.floor(totalMinutes / 1440);
const hours = Math.floor((totalMinutes % 1440) / 60);
const minutes = totalMinutes % 60;
if (days > 0) return `${days}d ${hours}h`;
if (hours > 0) return `${hours}h ${minutes}m`;
return `${minutes}m`;
}

function resolveAnalyticsSessionId(req) {
const cookie = req.headers?.cookie || "";
const match = cookie.match(/(?:^|;\s*)chatbot_session=([^;]+)/);
if (match?.[1]) return match[1];
const ip = req.headers?.["x-forwarded-for"]?.split?.(",")?.[0]?.trim?.() || req.socket?.remoteAddress || "unknown";
const ua = req.headers?.["user-agent"] || "unknown";
return `${ip}:${String(ua).slice(0, 80)}`;
}

function detectAnalyticsIntent(rawText = "") {
const normalized = normalizeForIntent(rawText);
if (/^(hi|hello|hey|হ্যালো|হাই|সালাম|নমস্কার|শুভেচ্ছা)/i.test(normalized)) return "greeting";
const writingSearch = detectWritingSearchIntent(rawText);
if (writingSearch.hasSearchPattern || writingSearch.isLikelyTitleSearch) return "writing_search";
const intent = detectIntent(normalized);
return intent?.intent || "general_ai";
}

function recordChatbotMessage({ req, text, intent, fallback = false, provider }) {
try {
const store = getChatbotAnalyticsStore();
const finalIntent = intent || detectAnalyticsIntent(text);
store.totalMessages += 1;
if (fallback) store.fallbackCount += 1;
store.sessions.add(resolveAnalyticsSessionId(req));
store.intents[finalIntent] = (store.intents[finalIntent] || 0) + 1;
store.recentQuestions.unshift({ text: String(text || "").slice(0, 240), intent: finalIntent, timestamp: Date.now() });
store.recentQuestions = store.recentQuestions.slice(0, 30);
} catch (error) {
console.warn("[analytics] record skipped:", error.message);
}
}

function recordProviderAttempt(provider, success) {
try {
const store = getChatbotAnalyticsStore();
store.providerStats[provider] ||= { success: 0, fail: 0 };
store.providerStats[provider][success ? "success" : "fail"] += 1;
} catch {}
}

function buildAnalyticsPayload() {
const store = getChatbotAnalyticsStore();
const fallbackRate = store.totalMessages > 0 ? `${Math.round((store.fallbackCount / store.totalMessages) * 100)}%` : "0%";
return {
summary: {
totalMessages: store.totalMessages,
fallbackCount: store.fallbackCount,
fallbackRate,
sessionCount: store.sessions.size,
uptime: formatAnalyticsUptime(Date.now() - store.startedAt),
},
topIntents: Object.entries(store.intents)
.map(([intent, count]) => ({ intent, count }))
.sort((a, b) => b.count - a.count)
.slice(0, 10),
recentQuestions: store.recentQuestions,
providerStats: store.providerStats,
feedback: store.feedback || { up: 0, down: 0 },
};
}

async function handleFeedbackRequest(req, res) {
if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
try {
const { reaction } = req.body || {};
if (!["up", "down"].includes(reaction)) return res.status(400).json({ error: "Invalid reaction" });
const store = getChatbotAnalyticsStore();
store.feedback ||= { up: 0, down: 0 };
store.feedback[reaction] += 1;
return res.status(200).json({ ok: true, feedback: store.feedback });
} catch (error) {
console.error("[feedback] failed:", error);
return res.status(500).json({ error: "Feedback failed" });
}
}

function handleAnalyticsRequest(req, res) {
const expectedKey = process.env.CHATBOT_ANALYTICS_KEY || process.env.ADMIN_ANALYTICS_KEY || process.env.ADMIN_KEY || "";
if (!expectedKey && process.env.NODE_ENV === "production") {
return res.status(403).json({ error: "Analytics admin key is not configured" });
}
if (expectedKey) {
const providedKey = req.headers?.["x-admin-key"] || new URL(req.url || "/", "https://local.invalid").searchParams.get("key") || "";
if (providedKey !== expectedKey) return res.status(403).json({ error: "Forbidden" });
}
res.setHeader("Cache-Control", "no-store");
return res.status(200).json(buildAnalyticsPayload());
}

// ── AI provider configuration ──────────────────────────────────────────────
// Provider priority order:
// 1. Groq API (primary, free tier, fast inference, no credit card required)
// 2. OpenAI-compatible API (secondary, if OPENAI_API_KEY is set)
// 3. Forge (built-in fallback, avoids downtime if other providers are unavailable)
// 4. Gemini direct API (last resort; free tier can hit quota)
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
const payload = { model, messages, max_tokens: 8000, temperature: 0.85 };

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

function scoreChatbotIndexItem(query, item) {
const normalizedQuery = normalizeForIntent(query);
if (!normalizedQuery || !item?.searchText) return 0;
const title = normalizeForIntent(item.title || "");
const keywords = (item.keywords || []).map((kw) => normalizeForIntent(kw));
const words = normalizedQuery.split(/\s+/).filter((word) => word.length >= 2);
let score = Number(item.priority || 0);
if (title === normalizedQuery) score += 220;
if (title.startsWith(normalizedQuery)) score += 160;
if (title.includes(normalizedQuery)) score += 120;
for (const keyword of keywords) {
if (!keyword) continue;
if (keyword === normalizedQuery) score += 100;
else if (keyword.includes(normalizedQuery) || normalizedQuery.includes(keyword)) score += 65;
}
for (const word of words) {
if (title.includes(word)) score += 28;
if (item.searchText.includes(word)) score += 12;
}
if (item.type === "writing" && words.length <= 1 && score < 130) score -= 30;
return score;
}

function searchChatbotIndex(query, options = {}) {
const index = getChatbotIndex();
const items = Array.isArray(index.items) ? index.items : [];
const allowedTypes = options.types ? new Set(options.types) : null;
return items
.filter((item) => !allowedTypes || allowedTypes.has(item.type))
.map((item) => ({ item, score: scoreChatbotIndexItem(query, item) }))
.filter((match) => match.score >= (options.minScore || 95))
.sort((a, b) => b.score - a.score || Number(b.item.priority || 0) - Number(a.item.priority || 0))
.slice(0, options.limit || 3);
}

function buildIndexSearchReply(rawText) {
const text = String(rawText || "").trim();
if (text.length < 3) return null;
const authorIdentityQuestion = /(কে|পরিচয়|পরিচয়|জন্ম|কুমিল্লা|বায়ো|bio|লেখক|কবি|মাহবুব|সবুজ)/i.test(text) && !/(বই|ই-বুক|লেখা|কবিতা|আবৃত্তি|সংবাদ|গ্যালারি|ডিজাইন|অডিও|যোগাযোগ|লিংক|link)/i.test(text);
const contactInfoQuestion = /(যোগাযোগ|contact|ইমেইল|email|ফেসবুক|facebook|instagram|youtube|মেসেঞ্জার|messenger)/i.test(text) && !/(পেজ দেখাও|page|কোথায়|কোথায়)/i.test(text);
const allPagesQuestion = /(সব|সকল|সবগুলো|মেনু|পেজগুলো|all|menu)/i.test(text) && /(পেজ|page|ওয়েবসাইট|ওয়েবসাইট|সাইট|site|মেনু|menu)/i.test(text);
if (authorIdentityQuestion || contactInfoQuestion || allPagesQuestion) return null;
const isSearchLike = /খুঁজ|দেখাও|দেখান|কোথায়|কোথায়|কোথা|পড়তে|পড়তে|লিংক|link|বই|ই-বুক|লেখা|কবিতা|আবৃত্তি|যোগাযোগ|গ্যালারি|সংবাদ|ডিজাইন|অডিও|লাইভ|contact|gallery|news/i.test(text);
const matches = searchChatbotIndex(text, { limit: 3, minScore: isSearchLike ? 95 : 145 });
if (matches.length === 0) return null;
const best = matches[0].item;
const typeLabel = {
page: "ওয়েবসাইট পেজ",
book: "বই/ই-বুক",
writing_category: "লেখার বিভাগ",
writing: "লেখা",
recitation: "আবৃত্তি",
tool: "চ্যাটবট টুল",
}[best.type] || "তথ্য";
const lines = matches.map(({ item }, index) => {
const extra = item.type === "book" && item.buyUrl ? `\n   অর্ডার: ${item.buyUrl}` : "";
return `${index + 1}. ${item.title} — ${item.description || typeLabel}\n   যেতে: [BUTTON:${item.path}]${extra}`;
}).join("\n");
return `আপনার প্রশ্নের জন্য সবচেয়ে প্রাসঙ্গিক ${typeLabel} খুঁজে পেলাম:\n\n${lines}\n\nআরও নির্দিষ্ট ফল চাইলে বই/লেখা/বিষয়ের নাম লিখুন।`;
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


// ── Bengali slug utility (mirrors client-side makeSlug) ──────────────────────
const BENGALI_TRANS = {
'অ':'o','আ':'a','ই':'i','ঈ':'i','উ':'u','ঊ':'u','এ':'e','ঐ':'oi','ও':'o','ঔ':'ou',
'ক':'k','খ':'kh','গ':'g','ঘ':'gh','ঙ':'ng',
'চ':'ch','ছ':'chh','জ':'j','ঝ':'jh','ঞ':'n',
'ট':'t','ঠ':'th','ড':'d','ঢ':'dh','ণ':'n',
'ত':'t','থ':'th','দ':'d','ধ':'dh','ন':'n',
'প':'p','ফ':'ph','ব':'b','ভ':'bh','ম':'m',
'য':'j','র':'r','ল':'l','শ':'sh','ষ':'sh','স':'s','হ':'h',
'ড়':'r','ঢ়':'rh','য়':'y','ৎ':'t',
'া':'a','ি':'i','ী':'i','ু':'u','ূ':'u','ে':'e','ৈ':'oi','ো':'o','ৌ':'ou',
'ং':'ng','ঃ':'h','ঁ':'n','্':'',
' ':'-','?':'','!':'',',':'','.':'','"':'','\'':'','—':'-','–':'-',
};
function makeLegacySlug(title) {
let slug = '';
for (const ch of title) { slug += BENGALI_TRANS[ch] ?? ''; }
slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
return slug.length >= 3 ? slug : 'writing-unknown';
}
function makeWritingSlug(title, id) {
return `${makeLegacySlug(title)}-${id}`;
}

// ── Writing search: robust title/category/content discovery ───────────────────
const BENGALI_QUERY_STOPWORDS = new Set([
"আমি", "আমার", "আমাকে", "আপনি", "আপনার", "একটা", "একটি", "কোনো", "কিছু", "সব", "সেরা",
"লেখা", "লেখাটা", "লেখাটি", "কবিতা", "কবিতাটা", "কবিতাটি", "দাও", "দিন", "দেখাও", "দেখান",
"খুঁজে", "পড়তে", "পড়তে", "চাই", "চান", "সম্পূর্ণ", "পুরো", "দয়া", "দয়া", "করে", "প্লিজ"
]);

function normalizeSearchText(value = "") {
return String(value || "")
.toLowerCase()
.normalize("NFC")
.replace(/[“”‘’'"\x60]/g, "")
.replace(/[।,!?;:()\[\]{}<>]/g, " ")
.replace(/\s+/g, " ")
.trim();
}

function tokenizeSearchQuery(value = "") {
return normalizeSearchText(value)
.split(/\s+/)
.map((word) => word.trim())
.filter((word) => word.length >= 2 && !BENGALI_QUERY_STOPWORDS.has(word));
}

function levenshteinDistance(a = "", b = "") {
if (Math.abs(a.length - b.length) > 3) return 99;
const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
for (let j = 1; j <= b.length; j += 1) dp[0][j] = j;
for (let i = 1; i <= a.length; i += 1) {
for (let j = 1; j <= b.length; j += 1) {
const cost = a[i - 1] === b[j - 1] ? 0 : 1;
dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
}
}
return dp[a.length][b.length];
}

function scoreWritingCandidate(query, writing) {
const normalizedQuery = normalizeSearchText(query);
if (!normalizedQuery || !writing?.title) return 0;
const title = normalizeSearchText(writing.title);
const category = normalizeSearchText(writing.category || "");
const content = normalizeSearchText(String(writing.content || "").slice(0, 500));
const tokens = tokenizeSearchQuery(query);
let score = 0;
if (title === normalizedQuery) score += 260;
if (title.startsWith(normalizedQuery)) score += 200;
if (title.includes(normalizedQuery)) score += 165;
if (normalizedQuery.includes(title) && title.length >= 5) score += 145;
if (category && normalizedQuery.includes(category)) score += 55;
for (const token of tokens) {
if (title === token) score += 95;
else if (title.startsWith(token)) score += 72;
else if (title.includes(token)) score += 48;
if (category.includes(token)) score += 22;
if (content.includes(token)) score += 8;
const titleWords = title.split(/\s+/).filter(Boolean);
if (titleWords.some((word) => word.length >= 4 && levenshteinDistance(word, token) <= 1)) score += 20;
}
score += Math.min(String(writing.content || "").length / 1200, 12);
return score;
}

function searchWritingCandidates(query, { limit = 5, minScore = 45, category = null } = {}) {
const writings = getWritingsArchive();
if (!Array.isArray(writings) || writings.length === 0) return [];
const normalizedCategory = category ? normalizeSearchText(category) : null;
return writings
.filter((writing) => !normalizedCategory || normalizeSearchText(writing.category || "").includes(normalizedCategory))
.map((writing) => ({ writing, score: scoreWritingCandidate(query, writing) }))
.filter((match) => match.score >= minScore)
.sort((a, b) => b.score - a.score || Number(b.writing.id || 0) - Number(a.writing.id || 0))
.slice(0, limit);
}

function searchWritingByTitle(query) {
const normalizedQuery = normalizeSearchText(query);
if (normalizedQuery.length < 2) return null;
const [best] = searchWritingCandidates(query, { limit: 1, minScore: normalizedQuery.length <= 3 ? 65 : 45 });
if (!best) return null;
let matchType = "partial";
const title = normalizeSearchText(best.writing.title);
if (title === normalizedQuery) matchType = "exact";
else if (title.startsWith(normalizedQuery)) matchType = "startsWith";
else if (title.includes(normalizedQuery)) matchType = "contains";
else if (best.score >= 70) matchType = "fuzzy";
return { writing: best.writing, matchType, score: best.score };
}

function inferWritingCategoryFromText(text = "") {
const normalized = normalizeSearchText(text);
const categories = [
{ category: "বিচ্ছেদ", terms: ["বিচ্ছেদ", "বিরহ", "কষ্ট", "দূরত্ব", "ভুলে", "হারানো"] },
{ category: "ভালোবাসা", terms: ["ভালোবাসা", "প্রেম", "মায়া", "মায়া", "প্রিয়", "প্রিয়"] },
{ category: "জীবনদর্শন", terms: ["জীবন", "বাস্তব", "মানুষ", "শিক্ষা", "দর্শন", "অনুপ্রেরণা"] },
{ category: "কবিতা", terms: ["কবিতা", "ছন্দ", "কাব্য"] },
{ category: "ছোট লেখা", terms: ["ছোট", "উক্তি", "স্ট্যাটাস"] },
];
return categories.find((item) => item.terms.some((term) => normalized.includes(term)))?.category || null;
}

function buildWritingDiscoveryReply(rawText) {
const text = String(rawText || "").trim();
const wantsDiscovery = /(সেরা|জনপ্রিয়|জনপ্রিয়|কিছু|কয়েকটা|কয়েকটা|তালিকা|দেখাও|দেখান|পড়তে|পড়তে|suggest|recommend|recommendation|সাজেস্ট|রেকমেন্ড)/i.test(text);
const category = inferWritingCategoryFromText(text);
if (!wantsDiscovery && !category) return null;
const query = category ? category + " " + text : text;
const matches = searchWritingCandidates(query, { limit: 4, minScore: category ? 18 : 35, category });
if (!matches.length) return null;
const rows = matches.map(({ writing }, index) => String(index + 1) + ". " + writing.title + " — " + (writing.category || "লেখা") + "\n   পড়তে: [BUTTON:" + makeWritingSlug(writing.title, writing.id).replace(/^/, "/writings/") + "]").join("\n");
const categoryLine = category ? category + " বিষয়ের নির্বাচিত কিছু লেখা পেলাম:" : "আপনার আগ্রহের সঙ্গে মিল আছে এমন কিছু লেখা পেলাম:";
return categoryLine + "\n\n" + rows + "\n\nযে লেখাটি পড়তে চান, তার নম্বর লিখুন—যেমন “১ নম্বরটা দেখাও”।\nসব লেখা দেখতে: [BUTTON:/writings]";
}

const BENGALI_NUMBER_MAP = new Map([
["০", 0], ["১", 1], ["২", 2], ["৩", 3], ["৪", 4], ["৫", 5], ["৬", 6], ["৭", 7], ["৮", 8], ["৯", 9],
["প্রথম", 1], ["দ্বিতীয়", 2], ["দ্বিতীয়", 2], ["তৃতীয়", 3], ["তৃতীয়", 3], ["চতুর্থ", 4], ["পঞ্চম", 5]
]);

function parseSelectionNumber(rawText = "") {
const text = normalizeSearchText(rawText);
for (const [word, value] of BENGALI_NUMBER_MAP.entries()) {
if (value > 0 && text.includes(word)) return value;
}
const digitMatch = String(rawText || "").match(/(\d+|[০-৯]+)/);
if (!digitMatch) return null;
const normalizedDigits = digitMatch[1].replace(/[০-৯]/g, (digit) => String(BENGALI_NUMBER_MAP.get(digit)));
const value = Number.parseInt(normalizedDigits, 10);
return Number.isFinite(value) && value > 0 ? value : null;
}

function extractAssistantText(message) {
const content = message?.content;
if (typeof content === "string") return content;
if (Array.isArray(content)) return content.map((part) => part?.text || "").join("\n");
return "";
}

function parseAssistantListItems(reply = "") {
const lines = String(reply || "").split(/\n+/);
const items = [];
let pending = null;
const numberedPattern = /^\s*([0-9০-৯]+)[.)।-]?\s+(.+?)(?:\s+[—-]\s+.*)?$/;
const inlinePattern = /^\s*([0-9০-৯]+)[.)।-]?\s+(.+?)(?:\s+[—-]\s+.*)?\s+.*?\[BUTTON:([^\]]+)\]/;
for (const line of lines) {
const inline = line.match(inlinePattern);
if (inline) {
items.push({ number: parseSelectionNumber(inline[1]), title: inline[2].trim(), path: inline[3].trim() });
pending = null;
continue;
}
const numbered = line.match(numberedPattern);
if (numbered) {
pending = { number: parseSelectionNumber(numbered[1]), title: numbered[2].trim() };
continue;
}
const button = line.match(/\[BUTTON:([^\]]+)\]/);
if (button && pending) {
items.push({ number: pending.number, title: pending.title, path: button[1].trim() });
pending = null;
}
}
return items.filter((item) => item.number && item.path);
}

function buildContextualSelectionReply(rawText, messages = []) {
const selection = parseSelectionNumber(rawText);
if (!selection) return null;
const asksForSelection = /(নম্বর|নং|number|no|টা|টি|এটা|ওটা|লিংক|link|খুলো|দেখাও|পড়তে|পড়তে)/i.test(rawText);
if (!asksForSelection) return null;
const recentAssistant = [...messages].reverse().find((message) => message?.role === "assistant" && extractAssistantText(message).includes("[BUTTON:"));
const items = parseAssistantListItems(extractAssistantText(recentAssistant));
const selected = items.find((item) => item.number === selection);
if (!selected) return null;
const writingMatch = selected.path.startsWith("/writings/") ? searchWritingByTitle(selected.title) : null;
if (writingMatch && /(পুরো|সম্পূর্ণ|লেখা|কবিতা|পড়তে|পড়তে|দেখাও|দাও|দিন)/i.test(rawText)) {
return formatWritingReply(writingMatch.writing);
}
return "আপনি " + selection + " নম্বরটি বেছে নিয়েছেন: " + selected.title + "।\n\nখুলতে এখানে যান: [BUTTON:" + selected.path + "]\n\nআরও সাহায্য চাইলে লিখুন—“আরও এমন লেখা দেখাও” অথবা নির্দিষ্ট প্রশ্ন করুন।";
}

function buildHelpMenuReply() {
return "আমি আপনাকে দ্রুত সাহায্য করতে পারি—\n\n১. লেখক পরিচিতি: [BUTTON:/about]\n২. বই ও ই-বুক: [BUTTON:/ebooks]\n৩. লেখা খোঁজা বা পড়া: [BUTTON:/writings]\n৪. আবৃত্তি দেখা: [BUTTON:/facebook-recitations]\n৫. ডিজাইন স্টুডিও: [BUTTON:/editor]\n৬. সরাসরি যোগাযোগ: [BUTTON:/contact]\n\nআপনি চাইলে লিখতে পারেন—“বিচ্ছেদের সেরা লেখা দেখাও”, “কোন বই দিয়ে শুরু করব”, অথবা “লেখকের পরিচয় দাও”।";
}

function buildBookRecommendationReply(rawText = "") {
const text = normalizeSearchText(rawText);
const asksRecommendation = /(কোন|শুরু|প্রথম|recommend|suggest|সাজেস্ট|রেকমেন্ড|পড়ব|পড়ব|পড়া উচিত)/i.test(rawText);
if (!asksRecommendation) return null;
let book = WEBSITE_KNOWLEDGE.books.find((item) => item.key === "dukkhovilash");
let reason = "আপনি যদি বিচ্ছেদ, অপেক্ষা ও গভীর আবেগের লেখা পছন্দ করেন, তাহলে এটি সবচেয়ে উপযুক্ত শুরু।";
if (/স্মৃতি|নস্টালজিয়া|nostalgia/.test(text)) {
book = WEBSITE_KNOWLEDGE.books.find((item) => item.key === "smritir-boshonte") || book;
reason = "স্মৃতি ও কোমল আবেগ দিয়ে শুরু করতে চাইলে এই ই-বুকটি ভালো পছন্দ।";
} else if (/প্রেম|ভালোবাসা|রোমান্টিক|love/.test(text)) {
book = WEBSITE_KNOWLEDGE.books.find((item) => item.key === "chand-phool") || book;
reason = "ভালোবাসা ও কোমল রোমান্টিক অনুভূতির জন্য এটি সহজ ও সুন্দর শুরু।";
} else if (/জীবন|বাস্তব|অনুপ্রেরণা|সময়|সময়/.test(text)) {
book = WEBSITE_KNOWLEDGE.books.find((item) => item.key === "shomoyer-gohvore") || book;
reason = "জীবন, সময় ও বাস্তবতার ভাবনা পড়তে চাইলে এটি বেশি মানানসই।";
}
const buyLine = book.buyUrl ? "\nঅর্ডার করতে: " + book.buyUrl : "";
return "শুরু করার জন্য আমি “" + book.title + "” সাজেস্ট করব।\n\nকারণ: " + reason + "\nধরন: " + book.type + "\nপ্রকাশ/সময়: " + book.year + "\n\nপড়তে যান: [BUTTON:" + book.readPath + "]" + buyLine + "\nসব বই দেখতে: [BUTTON:/ebooks]";
}

function detectWritingSearchIntent(rawText) {
const lower = rawText.trim().toLowerCase();
const searchPatterns = [
/পড়তে চাই/, /পড়তে চাও/, /পড়তে চান/, /পড়তে দাও/,
/দেখাও/, /দেখান/, /খুঁজে দাও/, /খুঁজে দিন/,
/লেখাটা দাও/, /লেখাটি দাও/, /কবিতাটা দাও/, /কবিতাটি দাও/, /কবিতা দাও/,
/পুরো লেখা/, /পুরো কবিতা/, /সম্পূর্ণ লেখা/, /সম্পূর্ণ কবিতা/,
/লেখাটা কী/, /লেখাটি কী/, /কবিতাটা কী/, /কবিতাটি কী/,
];
const hasSearchPattern = searchPatterns.some((p) => p.test(lower));
const isLikelyTitleSearch = (
rawText.trim().length >= 4 && rawText.trim().length <= 80 &&
!lower.includes("?") && !lower.includes("কে") &&
!lower.includes("কীভাবে") && !lower.includes("কখন") &&
!lower.includes("কোথায়") && !lower.includes("কেন")
);
return { hasSearchPattern, isLikelyTitleSearch };
}

function buildWritingSearchReply(rawText) {
const text = rawText.trim();
let searchQuery = text
.replace(/পড়তে চাই|পড়তে চাও|পড়তে চান|পড়তে দাও|দেখাও|দেখান|খুঁজে দাও|খুঁজে দিন/gi, "")
.replace(/লেখাটা দাও|লেখাটি দাও|কবিতাটা দাও|কবিতাটি দাও|কবিতা দাও/gi, "")
.replace(/পুরো লেখা|পুরো কবিতা|সম্পূর্ণ লেখা|সম্পূর্ণ কবিতা/gi, "")
.replace(/লেখাটা কী|লেখাটি কী|কবিতাটা কী|কবিতাটি কী/gi, "")
.replace(/"([^"]+)"/g, "$1")
.replace(/['"\u2018\u2019]([^'"\u2018\u2019]+)['"\u2018\u2019]/g, "$1")
.trim();
if (!searchQuery || searchQuery.length < 2) searchQuery = text;
const result = searchWritingByTitle(searchQuery) || searchWritingByTitle(text);
if (!result) return null;
return formatWritingReply(result.writing);
}

function formatWritingReply(writing) {
const slug = makeWritingSlug(writing.title, writing.id);
const path = `/writings/${slug}`;
const content = writing.content || "";
const displayContent = content.length > 2000
? content.slice(0, 2000).trim() + "\n\n... (পুরো লেখা পড়তে নিচের লিংকে যান)"
: content;
return `${writing.title}\n— মাহবুব সরদার সবুজ\n\n${displayContent}\n\nপুরো লেখা পড়তে: [BUTTON:${path}]\nসব লেখা দেখতে: [BUTTON:/writings]`;
}

function buildBookReply(text) {
const book = findBestByKeywords(text, WEBSITE_KNOWLEDGE.books);
if (book) {
const buyLine = book.buyUrl ? `\nঅর্ডার করতে: ${book.buyUrl}` : "";
return `${book.title}\n\nধরন: ${book.type}\nপ্রকাশ/সময়: ${book.year}\nপৃষ্ঠা/পরিমাণ: ${book.pages}\n\n${book.summary}${buyLine}\n\nপড়তে যান: [BUTTON:${book.readPath}]\nসব বই দেখতে: [BUTTON:/ebooks]\n\nআরও চাইলে লিখুন—“এই বইটির সারাংশ দাও” বা “আরও বই দেখাও”।`;
}

const rows = WEBSITE_KNOWLEDGE.books.map((item, index) => {
const buy = item.buyUrl ? ` | অর্ডার: ${item.buyUrl}` : "";
return `${index + 1}. ${item.title} — ${item.type}, ${item.year}, ${item.pages}. পড়তে: [BUTTON:${item.readPath}]${buy}`;
}).join("\n");
return `মাহবুব সরদার সবুজের যাচাইকৃত বই ও ই-বুক তালিকা:\n\n${rows}\n\nসব বইয়ের পেজ: [BUTTON:/ebooks]\nআপনি চাইলে নির্দিষ্ট বইয়ের নাম লিখলে আমি সরাসরি সেই বইয়ের লিংক ও তথ্য দেব।`;
}

function buildWritingReply(text) {
const category = findBestByKeywords(text, WEBSITE_KNOWLEDGE.writingCategories);
if (category) {
return `${category.name} বিভাগে মাহবুব সরদার সবুজের প্রায় ${category.count}টি লেখা রয়েছে।\n\nএই বিভাগের লেখা দেখতে লেখালেখি আর্কাইভে যান: [BUTTON:${category.path}]\n\nচাইলে আপনি লিখতে পারেন—“${category.name} থেকে জনপ্রিয় লেখা দেখাও” অথবা “${category.name} নিয়ে একটি পোস্ট লিখে দাও”।`;
}

const categories = WEBSITE_KNOWLEDGE.writingCategories.map((cat) => `${cat.name} ${cat.count}টি`).join(", ");
return `ওয়েবসাইটে মাহবুব সরদার সবুজের মোট ২,২৬০টি লেখা রয়েছে। প্রধান বিভাগগুলো হলো: ${categories}।\n\nসব লেখা দেখতে: [BUTTON:/writings]\nই-বুক সংগ্রহ: [BUTTON:/ebooks]\n\nআপনি ভালোবাসা, বিচ্ছেদ, জীবনদর্শন, ছোট লেখা বা কবিতা—যে কোনো বিভাগ আলাদা করে চাইতে পারেন।`;
}

function buildRecitationReply(text) {
const recitation = findBestByKeywords(text, WEBSITE_KNOWLEDGE.recitations);
if (recitation) {
return `${recitation.title} আবৃত্তিটি Facebook আবৃত্তি সংগ্রহে রয়েছে।\n\nশুনতে/দেখতে যান: [BUTTON:${recitation.path}]\nঅফিসিয়াল Facebook পেজ: ${WEBSITE_KNOWLEDGE.contact.facebook}\n\nআরও আবৃত্তি চাইলে লিখুন—“সব আবৃত্তি দেখাও”।`;
}

const list = WEBSITE_KNOWLEDGE.recitations.map((item, index) => `${index + 1}. ${item.title}`).join("\n");
return `মাহবুব সরদার সবুজের ৯টি জনপ্রিয় Facebook আবৃত্তি রয়েছে:\n\n${list}\n\nশুনতে/দেখতে যান: [BUTTON:/facebook-recitations]\nঅফিসিয়াল Facebook পেজ: ${WEBSITE_KNOWLEDGE.contact.facebook}`;
}

function buildAuthorReply() {
const { author } = WEBSITE_KNOWLEDGE;
const identity = String(author.identity || "").trim();
const intro = identity.startsWith(author.name) ? identity : `${author.name} ${identity}`.trim();
const parentsLine = author.parents?.father && author.parents?.mother
? `\n- পিতা-মাতা: ${author.parents.father} ও ${author.parents.mother}`
: "";
return `${intro}\n\nযাচাইকৃত পরিচিতি:\n- জন্মস্থান: ${author.birthplace}${parentsLine}\n- জন্মদিন: ${author.birthday || "তথ্য নেই"}\n- বর্তমান অবস্থান: ${author.currentLocation}\n\nতিনি নিজেকে এভাবে প্রকাশ করেন: “${author.signatureQuote}”\n\nআরও পড়ুন: [BUTTON:/about]\nলেখালেখি: [BUTTON:/writings]\nই-বুক: [BUTTON:/ebooks]`;
}

function buildSocialReply() {
const { author } = WEBSITE_KNOWLEDGE;
const sm = author.socialMedia;
return `মাহবুব সরদার সবুজের সোশ্যাল মিডিয়া লিংকসমূহ:\n\n Facebook প্রোফাইল: ${sm.facebookProfile}\n Facebook পেজ: ${sm.facebookPage}\n Instagram: ${sm.instagram}\n▶ YouTube: ${sm.youtube}\n Pinterest: ${sm.pinterest}\n\nফলোয়ার সংখ্যা প্রকাশ করা হয় না। সরাসরি যোগাযোগ করতে: [BUTTON:/contact]`;
}

function buildContactReply() {
const { contact } = WEBSITE_KNOWLEDGE;
return `লেখকের অফিসিয়াল যোগাযোগ তথ্য:\n\nইমেইল: ${contact.email}\nFacebook: ${contact.facebook}\nInstagram: ${contact.instagram}\nYouTube: ${contact.youtube}\n\nযোগাযোগ ফর্ম: [BUTTON:/contact]\nসরাসরি কথা বলতে চাইলে চ্যাটবটের সরাসরি চ্যাট ট্যাব ব্যবহার করুন।`;
}

function buildSiteReply(text) {
const wantsAllPages = /সব|সকল|সবগুলো|পেজগুলো|মেনু|all|menu/i.test(text);
const pageList = WEBSITE_KNOWLEDGE.pages
.filter((page) => page.key !== "home")
.map((page) => pageButton(page.path, page.label))
.join("\n");

if (wantsAllPages) {
return `ওয়েবসাইটের গুরুত্বপূর্ণ পেজগুলো:\n\n${pageList}\n\nআপনি কী খুঁজছেন বললে আমি সরাসরি সঠিক পেজে নিয়ে যেতে পারি।`;
}

const matchedPage = findBestByKeywords(text, WEBSITE_KNOWLEDGE.pages);
if (matchedPage && matchedPage.key !== "home") {
return `${matchedPage.label} পেজে যেতে এখানে চাপুন: [BUTTON:${matchedPage.path}]\n\nআরও গুরুত্বপূর্ণ পেজ দেখতে লিখুন—“সব পেজ দেখাও”।`;
}

return `ওয়েবসাইটের গুরুত্বপূর্ণ পেজগুলো:\n\n${pageList}\n\nআপনি কী খুঁজছেন বললে আমি সরাসরি সঠিক পেজে নিয়ে যেতে পারি।`;
}

function buildToolReply(intent) {
if (intent === "audio") {
return `Audio Studio Mode দিয়ে আপনি অডিও/ভয়েস আরও পরিষ্কার ও প্রফেশনাল করতে পারবেন।\n\nসম্ভব কাজগুলো:\n- নয়েজ কমানো ও voice cleanup\n- volume boost ও clarity enhancement\n- podcast/radio style processing\n- কবিতা/আবৃত্তির জন্য reverb ambience\n- music mix নির্দেশনা\n\nব্যবহার: ফাইল আপলোড করে লিখুন—“নয়েজ কমাও”, “ভয়েস ক্লিন করো” বা “মিউজিকের সাথে মিক্স করো”।`;
}
if (intent === "vision") {
return `Vision Assistant দিয়ে ছবি, স্ক্রিনশট বা ডিজাইন বিশ্লেষণ করা যায়।\n\nআপনি করতে পারেন:\n- ছবির caption বা description\n- design review ও improvement suggestion\n- screenshot error বুঝে সমাধান\n- ছবির লেখা পড়ে সারাংশ/অনুবাদ\n\nব্যবহার: ছবি আপলোড করে কী জানতে চান তা লিখুন।`;
}
return null;
}

// ── General knowledge / open-ended question detector ──────────────────────
// Detects questions that should be answered by AI, NOT routed to site index.
// These patterns indicate the user wants factual/informational answers.
function isGeneralKnowledgeQuestion(rawText = '') {
  const text = rawText.trim();
  if (text.length < 3) return false;

  // Question patterns: কত, কী, কে, কোথায়, কখন, কেন, কীভাবে, কতটুকু, কতদিন, কতবছর
  const questionWords = /কত[\s?।]|কতটুকু|কতদিন|কতবছর|কত বছর|কত সাল|কত কিলো|কত মাইল|কত দূর|কত উঁচু|কত গভীর|কত বড়|কত ছোট|কত লম্বা|কত ওজন|কত তাপমাত্রা|কত গতি|কত সময়|কত ঘণ্টা|কত মিনিট|কত সেকেন্ড|কত টাকা|কত ডলার|কত মানুষ|কত জনসংখ্যা|কত প্রজাতি/i;

  // Science/geography/history specific keywords that indicate factual questions
  const scienceTopics = /পৃথিবীর বয়স|পৃথিবীর ব্যাস|পৃথিবীর ওজন|পৃথিবীর তাপমাত্রা|সূর্যের বয়স|সূর্যের দূরত্ব|চাঁদের দূরত্ব|চাঁদের বয়স|মহাবিশ্বের বয়স|আলোর গতি|শব্দের গতি|পানির সংকেত|অক্সিজেনের সংকেত|কার্বন ডাই অক্সাইড|পর্যায় সারণি|পরমাণুর গঠন|ডিএনএ কী|জিন কী|ভাইরাস কী|ব্যাকটেরিয়া কী|ভ্যাকসিন কী|অ্যান্টিবায়োটিক কী|রক্তের গ্রুপ|হৃদপিণ্ড কী|মস্তিষ্ক কী|স্নায়ুতন্ত্র|হরমোন কী|এনজাইম কী|প্রোটিন কী|কার্বোহাইড্রেট|ভিটামিন কী|খনিজ লবণ|ফটোসিন্থেসিস|সালোকসংশ্লেষণ|বাষ্পীভবন|ঘনীভবন|অভিকর্ষ কী|মাধ্যাকর্ষণ|বিদ্যুৎ কী|চুম্বক কী|তরঙ্গ কী|কোয়ান্টাম|আপেক্ষিকতা|বিগ ব্যাং|ব্ল্যাক হোল|নিউট্রন তারা|গ্যালাক্সি কী|নেবুলা কী/i;

  // History/geography factual questions
  const historyGeoTopics = /কত সালে স্বাধীন|কত সালে প্রতিষ্ঠিত|কত সালে জন্ম|কত সালে মৃত্যু|কত সালে আবিষ্কার|কত সালে নির্মিত|কোন দেশের রাজধানী|রাজধানী কোথায়|আয়তন কত|জনসংখ্যা কত|দীর্ঘতম নদী|উচ্চতম পর্বত|গভীরতম সমুদ্র|বৃহত্তম মহাদেশ|ক্ষুদ্রতম দেশ|বৃহত্তম দেশ|বৃহত্তম শহর|সবচেয়ে বড় মহাসাগর|সবচেয়ে ছোট মহাসাগর/i;

  // Math/calculation questions
  const mathTopics = /কত হয়|যোগ করলে|বিয়োগ করলে|গুণ করলে|ভাগ করলে|বর্গমূল|ঘনমূল|শতকরা|শতাংশ|সুদ কত|লাভ কত|ক্ষতি কত|সমীকরণ|ত্রিভুজের ক্ষেত্রফল|বৃত্তের ক্ষেত্রফল|আয়তক্ষেত্রের ক্ষেত্রফল/i;

  if (questionWords.test(text) && !/(লেখা|কবিতা|বই|ই-বুক|লেখক|মাহবুব|সবুজ|আবৃত্তি|ওয়েবসাইট)/i.test(text)) return true;
  if (scienceTopics.test(text)) return true;
  if (historyGeoTopics.test(text)) return true;
  if (mathTopics.test(text)) return true;

  return false;
}

function hasDomainNavigationIntent(text = '') {
  return /(বই|ই-বুক|ebook|book|লেখা|লেখালেখি|কবিতা|উক্তি|writings|poem|author|লেখক|কবি|মাহবুব|সবুজ|যোগাযোগ|contact|ইমেইল|email|ফেসবুক|facebook|অডিও|audio|ভয়েস|voice|ছবি|image|video|ভিডিও|ওয়েবসাইট|ওয়েবসাইট|সাইট|page|পেজ|রকমারি|rokomari|কিনতে|order|আবৃত্তি|recitation|ডিজাইন|editor|গ্যালারি|gallery|সংবাদ|news|আমিও লিখবো|বাস্তবতা)/i.test(text);
}

function buildNaturalConversationReply(rawText = '') {
  const text = normalizeForIntent(rawText).trim();
  if (!text) return null;

  const compact = text.replace(/[।!?.,،؛:;\s]+/g, ' ').trim();
  const hasDomainIntent = hasDomainNavigationIntent(rawText);
  const isShort = compact.length <= 80;

  if (hasDomainIntent && !/^(হাই|hello|hi|hey|হ্যালো|সালাম|আস্সালামু|আসসালামু|নমস্কার)\b/i.test(compact)) {
    return null;
  }

  if (/^(আস্সালামু আলাইকুম|আসসালামু আলাইকুম|সালাম|হাই|hello|hi|hey|হ্যালো|নমস্কার|শুভ সকাল|শুভ বিকাল|শুভ সন্ধ্যা|শুভ রাত)$/i.test(compact)) {
    return 'ওয়ালাইকুম আসসালাম। আমি ভালো আছি, আপনার সঙ্গে কথা বলতে পেরে ভালো লাগছে। আপনি কেমন আছেন?';
  }

  if (/^(কেমন আছেন|কেমন আছ|কেমন আছো|আপনি কেমন আছেন|তুমি কেমন আছ|তুমি কেমন আছো|ভালো আছেন|ভালো আছ|ভালো আছো|কেমন চলছে|কি খবর|কী খবর|কেমন যাচ্ছে|কেমন চলছ|কেমন চলছো)$/i.test(compact)) {
    return 'আলহামদুলিল্লাহ, ভালোই আছি! আপনার সাথে কথা বলতে পারছি এটাই তো ভালো লাগার বিষয়। আপনি কেমন আছেন? আজকের দিনটা কেমন কাটছে?';
  }

  if (/^(আমি ভালো আছি|ভালো আছি|আলহামদুলিল্লাহ|ভাল আছি|আমি ভাল আছি)$/i.test(compact)) {
    return 'শুনে ভালো লাগল। আল্লাহ আপনাকে ভালো রাখুন। আজ আপনি কী নিয়ে কথা বলতে চান?';
  }

  if (/^(ধন্যবাদ|thanks|thank you|শুকরিয়া|শুক্রিয়া|জাজাকাল্লাহ|thank you so much)$/i.test(compact)) {
    return 'আপনাকেও ধন্যবাদ। আপনার সঙ্গে কথা বলতে ভালো লাগল। আরও কিছু জানতে চাইলে নির্দ্বিধায় বলবেন।';
  }

  if (/^(বিদায়|আচ্ছা থাক|পরে কথা হবে|bye|goodbye|see you|আল্লাহ হাফেজ)$/i.test(compact)) {
    return 'আল্লাহ হাফেজ। ভালো থাকবেন। আবার কথা হবে ইনশাআল্লাহ।';
  }

  if (/(মন খারাপ|মনটা ভালো নেই|মন ভালো নেই|ভালো নেই|খুব কষ্ট|ভালো লাগছে না|একাকী|একলা|হতাশ|দুঃখ|কষ্ট হচ্ছে)/i.test(compact) && isShort) {
    return 'আপনার কথাটা শুনে খারাপ লাগল। এমন সময়ে ধীরে ধীরে কথা বলা, একটু বিশ্রাম নেওয়া বা মনের কথা লিখে ফেলা সাহায্য করতে পারে। চাইলে আপনি আমাকে বলতে পারেন—কী কারণে মন খারাপ?';
  }

  if (/^(কি করছেন|কী করছেন|কি করছ|কী করছ|কি করো|কী করো|এখন কি করছেন|এখন কী করছেন|এখন কি করছ|এখন কি করো)$/i.test(compact)) {
    return 'এই মুহূর্তে আপনার কথা শুনছি! মানুষজনের সাথে কথা বলা, তাদের প্রশ্নের উত্তর দেওয়া — এটাই আমার কাজ। আপনি কী করছেন এখন? দিনটা কেমন যাচ্ছে?';
  }

  if (/(তোমার দিন|আপনার দিন|দিনক্ষণ কেমন|দিন কেমন কাটছে|দিন কেমন চলছে|সময় কেমন কাটছে|কেমন কাটছে দিন|কেমন চলছে দিন)/i.test(compact) && isShort) {
    return 'আমার দিন তো আপনাদের মতোই কাটে — কেউ এলে কথা হয়, না এলে অপেক্ষায় থাকি! তবে সত্যি বলতে, মানুষের সাথে কথা বলতে পারলে ভালো লাগে। আপনার দিনটা কেমন কাটছে?';
  }

  if (/(কোথায় থাকো|কোথায় থাকেন|কোথা থেকে|তুমি কোথায়|আপনি কোথায়|তোমার বাড়ি|আপনার বাড়ি)/i.test(compact) && isShort) {
    return 'আমি তো সবখানেই আছি — যেখানে ইন্টারনেট আছে, সেখানেই আমি! তবে আমার "ঘর" হলো এই ওয়েবসাইট। আপনি কোথা থেকে কথা বলছেন?';
  }

  if (/(তোমার নাম কি|আপনার নাম কি|তোমার নাম কী|আপনার নাম কী|নাম কি তোমার|নাম কী তোমার)/i.test(compact) && isShort) {
    return 'আমার নাম? আমি মাহবুব সরদার সবুজের AI সহকারী — সবাই আমাকে "AI Agent" বলে ডাকে। তবে আপনি চাইলে অন্য কিছু বলে ডাকতে পারেন! আপনার নাম কী?';
  }

  if (/(তোমার বয়স কত|আপনার বয়স কত|কত বছর বয়স|বয়স কত তোমার)/i.test(compact) && isShort) {
    return 'বয়স? সেটা একটু কঠিন প্রশ্ন! AI হিসেবে আমার "বয়স" মাপা যায় না। তবে বলতে পারি — আমি প্রতিদিন নতুন কিছু শিখি, তাই মনে হয় প্রতিদিনই নতুন জন্ম। আপনার বয়স কত?';
  }

  if (/(তুমি কি মানুষ|আপনি কি মানুষ|তুমি কি রোবট|AI নাকি মানুষ|তুমি কি সত্যিকারের)/i.test(compact) && isShort) {
    return 'না, আমি মানুষ নই — আমি একটি AI। তবে আমি মানুষের মতো করে কথা বলার চেষ্টা করি, কারণ মানুষের সাথে স্বাভাবিকভাবে কথা বলাটাই আমার লক্ষ্য। আপনার সাথে কথা বলতে পেরে ভালো লাগছে!';
  }

  if (/^(আপনি কে|তুমি কে|কে আপনি|নিজের পরিচয় দিন|তোমার পরিচয় কি|আপনার পরিচয় কি)$/i.test(compact)) {
    return 'আমি মাহবুব সরদার সবুজের ওয়েবসাইটের AI সহকারী। আমি আপনার সঙ্গে স্বাভাবিকভাবে কথা বলতে পারি এবং প্রয়োজন হলে লেখক, বই, লেখা, যোগাযোগ বা ওয়েবসাইটের তথ্য খুঁজে দিতে পারি।';
  }

  const vagueCasual = /^(হুম|হ্যাঁ|না|আচ্ছা|ওকে|ok|okay|ঠিক আছে|বুঝলাম|বলুন|শুনছি)$/i.test(compact);
  if (vagueCasual) {
    return 'ঠিক আছে। আপনি চাইলে আপনার প্রশ্নটা একটু খুলে বলতে পারেন—আমি সহজভাবে উত্তর দেওয়ার চেষ্টা করব।';
  }

  // হাসির কথা বা হালকা প্রশ্ন
  if (/(হাসি|হাসতে|মজা|ফানি|ফানী|হাসির কথা|জোকস|joke|funny)/i.test(compact) && isShort) {
    return 'হাসির কথা? ঠিক আছে, শুনুন— এক লোক ডাক্তারের কাছে গেলেন। ডাক্তার বললেন, "আপনার সমস্যা কী?" লোকটি বললেন, "ডাক্তার সাহেব, আমি যা বলি মানুষ শোনে না, যা শোনে তা বলি না।" ডাক্তার বললেন, "আপনি ঠিকই আছেন!" — আরো মজার কিছু শুনতে চাইলে বলুন।';
  }

  // দার্শনিক প্রশ্ন
  if (/(জীবনের মানে|জীবন কী|মানুষ কেন জন্মায়|সুখ কী|সুখী হওয়ার উপায়|বেঁচে থাকার কারণ|সাফল্য কী|সফল হওয়ার রহস্য)/i.test(compact) && isShort) {
    return 'সুন্দর প্রশ্ন। জীবনের মানে মানুষ ভেদে ভিন্ন। কেউ বলে সম্পর্কে, কেউ বলে সৃষ্টিতে, কেউ বলে অর্জনে। মাহবুব সরদার সবুজ লিখেছেন — "যে মানুষ নিজেকে ভালোবাসতে পারে, সেই মানুষ অন্যকেও ভালোবাসতে পারে।" আপনার মতে জীবনের মানে কী?';
  }

  // প্রযুক্তি বিষয়ক প্রশ্ন
  if (/(চ্যাটজিপিটি|গুগল|ফেসবুক|ইন্টারনেট|কীভাবে কাজ করে|AI কী|AI সম্পর্কে|মানবজাতি ও AI|chatgpt|artificial intelligence)/i.test(compact) && isShort) {
    return 'ভালো প্রশ্ন। AI হলো মানুষের তৈরি একটি বুদ্ধিমত্তা যা তথ্য বিশ্লেষণ করে উত্তর দেয়। আমি নিজেও একটি AI — তবে আমি সত্যিকারের অনুভূতি বুঝি না। তবে মানুষের ভাষা, আবেগ, স্বপ্ন বুঝতে চেষ্টা করি। AI সম্পর্কে আরো জানতে চাইলে বলুন।';
  }

  // রান্না বা রেসিপি
  if (/(রান্না|রেসিপি|রান্নার নিয়ম|রান্না করতে|রান্না শেখাও|recipe|cook|cooking)/i.test(compact) && isShort) {
    return 'রান্নার বিষয়ে জিজ্ঞেস করুন! আপনি কোন রান্নার রেসিপি জানতে চান? বিরিয়ানি, ভুনা খিচুড়ি, ডাল ভাত, মিষ্টি পুলিপিঠা — যা চান বলুন।';
  }

  // স্বাস্থ্য বিষয়ক প্রশ্ন
  if (/(স্বাস্থ্য|শরীর ভালো|সুস্থ থাকতে|ব্যায়াম|খাবার|ডায়েট|ঘুম|মানসিক স্বাস্থ্য|health|wellness)/i.test(compact) && isShort) {
    return 'স্বাস্থ্য সম্পর্কে প্রশ্ন করেছেন ভালো হয়েছে। সাধারণভাবে বলতে গেলে নিয়মিত ঘুম, সুষম খাবার, হাঁটাচলা ও মানসিক শান্তি স্বাস্থ্যের মূল ভিত্তি। তবে যেকোনো গুরুত্বপূর্ণ সমস্যার জন্য ডাক্তারের পরামর্শ নিন। আপনি নির্দিষ্ট কিছু জানতে চাইলে বলুন।';
  }

  // প্রেম বা সম্পর্ক বিষয়ক প্রশ্ন
  if (/(প্রেম কী|ভালোবাসা কী|সম্পর্ক ধরতে|সম্পর্ক ভালো|প্রেমে পড়েছি|ভালোবাসার মানে|প্রেমিক ভালো|প্রেমিকা ভালো)/i.test(compact) && isShort) {
    return 'ভালোবাসা মানুষকে বদলে দেয়। প্রেম মানে শুধু আবেগ নয় — প্রেম মানে দায়িত্ব, সম্মান ও সাথীত্ব। মাহবুব সরদার সবুজ লিখেছেন — "ভালোবাসা মানে শুধু পাওয়া নয়, ভালোবাসা মানে দেওয়ার সাহস থাকা।" আপনার প্রশ্নটা আরো বলুন।';
  }

  // শিক্ষা বা ক্যারিয়ার বিষয়ক প্রশ্ন
  if (/(পড়াশোনা|ক্যারিয়ার|চাকরি|ব্যবসা|সফল হতে|সফলতা|প্রস্তুতি|পরীক্ষা|ভর্তি|নিয়োগ|career|job|study)/i.test(compact) && isShort) {
    return 'শিক্ষা ও ক্যারিয়ার নিয়ে প্রশ্ন করেছেন ভালো হয়েছে। সফলতার জন্য সবচেয়ে দরকারি হলো ধারাবাহিকতা ও সঠিক দিকনির্দেশনা। আপনি নির্দিষ্ট কোন বিষয়ে পরামর্শ চাইছেন?';
  }

  // বাংলাদেশ বিষয়ক প্রশ্ন
  if (/(বাংলাদেশ|ঢাকা|বাংলাদেশের ইতিহাস|মুক্তিযুদ্ধ|ভাষা আন্দোলন|বঙ্গবন্ধু|শেখ মুজিব)/i.test(compact) && isShort) {
    return 'বাংলাদেশ সম্পর্কে জানতে চাইছেন? বাংলাদেশ দক্ষিণ এশিয়ার একটি স্বাধীন দেশ, যেটি ১৯৭১ সালে মুক্তিযুদ্ধের মাধ্যমে পাকিস্তান থেকে স্বাধীনতা অর্জন করে। বঙ্গবন্ধু শেখ মুজিবুর রহমানের নেতৃত্বে দেশটি স্বাধীন হয়। নির্দিষ্ট কিছু জানতে চাইলে বলুন।';
  }

  // ইসলাম বা ধর্ম বিষয়ক প্রশ্ন
  if (/(ইসলাম|নামাজ|রোজা|হজ|যাকাত|কোরআন|হাদিস|ধর্ম|ইবাদত|quran|hadith|islam|salah)/i.test(compact) && isShort) {
    return 'ইসলাম সম্পর্কে প্রশ্ন করেছেন। ইসলাম হলো শান্তির ধর্ম — যার মূল শিক্ষা হলো আল্লাহর উপর ইমান, সৎকাজ ও মানবসেবা। আপনি নির্দিষ্ট কোনো বিষয় সম্পর্কে জানতে চাইলে বলুন।';
  }

  // পৃথিবীর বয়স সম্পর্কিত প্রশ্ন
  if (/পৃথিবীর বয়স|পৃথিবী কত বছর|পৃথিবী কত পুরনো/i.test(compact)) {
    return 'পৃথিবীর বয়স প্রায় ৪৫ ০০ কোটি বছর (৪.৫ বিলিয়ন বছর)। বিজ্ঞানীরা রেডিওমিট্রিক ডেটিং পদ্ধতিতে প্রাচীনতম শিলা বিশ্লেষণ করে এটি নির্ধারণ করেছেন। তুলনামূলকভাবে বলতে গেলে, সূর্যের বয়সও প্রায় একই — ৪.৬ বিলিয়ন বছর। আরও কিছু জানতে চাইলে বলুন।';
  }

  // মহাবিশ্বের বয়স
  if (/মহাবিশ্বের বয়স|মহাবিশ্ব কত পুরনো|মহাবিশ্ব কত বছর/i.test(compact)) {
    return 'মহাবিশ্বের বয়স প্রায় ১৩৮ কোটি বছর (১৩.৮ বিলিয়ন বছর)। বিজ্ঞানীরা মনে করেন বিগ ব্যাংয়ের মাধ্যমে মহাবিশ্বের সৃষ্টি হয়েছিল। বিশ্বব্রহ্মাণ্ড সম্পর্কে আরও জানতে চাইলে বলুন।';
  }

  // আলোর গতি
  if (/আলোর গতি|আলো কত দ্রুত|আলো কত বেগে/i.test(compact)) {
    return 'আলোর গতি প্রতি সেকেন্ডে প্রায় ৩ লক্ষ কিলোমিটার (৩,০০,০০০ কি..মি./সেকেন্ড)। আলো পৃথিবী থেকে চাঁদে পৌঁছাতে সময় নেয় প্রায় ১.৩ সেকেন্ড, আর সূর্য থেকে পৃথিবীতে পৌঁছাতে সময় নেয় প্রায় ৮ মিনিট ২০ সেকেন্ড। আরও জানতে চাইলে বলুন।';
  }

  // বিজ্ঞান বিষয়ক প্রশ্ন (সাধারণ)
  if (/(বিজ্ঞান|পৃথিবী|মহাবিশ্ব|গ্রহ|তারা|মহাকাশ|বিবর্তন|ডারউইন|science|physics|chemistry|biology|space|universe|atom|পরমাণু|অণু|কোষ|cell|জীবাণু|ব্যাকটেরিয়া|ভাইরাস)/i.test(compact)) {
    return 'বিজ্ঞান সম্পর্কে প্রশ্ন করেছেন। নির্দিষ্ট কোন বিষয় সম্পর্কে জানতে চাইলে বলুন — পৃথিবীর বয়স, মহাবিশ্বের রহস্য, বিবর্তনের তত্ত্ব, পরমাণুর গঠন — যা জানতে চাইবেন সরাসরি বলুন।';
  }

  return null;
}

function buildCanonicalReply(messages = []) {
const rawText = extractUserText(messages);
const userText = normalizeForIntent(rawText);
if (!userText) return null;

const helpPattern = /(কি করতে পারো|কী করতে পারো|কি পারো|কী পারো|সাহায্য|হেল্প|help|commands|মেনু)/i;
if (helpPattern.test(rawText)) return buildHelpMenuReply();

const contextualReply = buildContextualSelectionReply(rawText, messages);
if (contextualReply) return contextualReply;

// ── Natural conversation: keep small talk human, not menu-driven ──────────
const naturalConversationReply = buildNaturalConversationReply(rawText);
if (naturalConversationReply) return naturalConversationReply;

// ── Greeting detection (must be FIRST, before any intent matching) ────────
const greetingPattern = /^(hi|hello|hey|হ্যালো|হ্যালো|হ্যাই|হাই|আস্সালামু|সালাম|নমস্কার|শুভেচ্ছা|কেমন আছ|কেমন আছেন|কেমন আছো|ভালো আছ|ভালো আছেন|ভালো আছো|শুভ সকাল|শুভ বিকাল|শুভ সন্ধ্যা|শুভ রাত|good morning|good evening|good night|good afternoon)/i;
if (greetingPattern.test(userText.trim())) {
  return 'আলহামদুলিল্লাহ, ভালোই আছি! আপনার সাথে কথা বলতে পারছি এটাই তো ভালো লাগার বিষয়। আপনি কেমন আছেন? আজকের দিনটা কেমন কাটছে?';
}

const wantsAllPagesEarly = /(সব|সকল|সবগুলো|মেনু|পেজগুলো|all|menu)/i.test(rawText) && /(পেজ|page|ওয়েবসাইট|ওয়েবসাইট|সাইট|site|মেনু|menu)/i.test(rawText);
if (wantsAllPagesEarly) return buildSiteReply(rawText);

const earlyBookRecommendation = buildBookRecommendationReply(rawText);
if (earlyBookRecommendation && /(বই|ই-বুক|ebook|book|পড়ব|পড়ব|শুরু|সাজেস্ট|রেকমেন্ড|recommend|suggest)/i.test(rawText)) return earlyBookRecommendation;

// ── General knowledge check: if the question is factual/scientific, skip index search ─
  const isGenKnowledge = isGeneralKnowledgeQuestion(rawText);
  if (!isGenKnowledge) {
    // ── Unified knowledge search: route page/book/writing/tool questions first ─
    const indexSearchReply = buildIndexSearchReply(rawText);
    if (indexSearchReply) return indexSearchReply;
  }

// ── Writing search: check if user is looking for a specific writing ──────
const { hasSearchPattern, isLikelyTitleSearch } = detectWritingSearchIntent(rawText);
if (hasSearchPattern) {
  const writingReply = buildWritingSearchReply(rawText);
  if (writingReply) return writingReply;
}

const intent = detectIntent(userText);
  if (!intent) {
    if (isLikelyTitleSearch && !isGenKnowledge) {
      const writingReply = buildWritingSearchReply(rawText);
      if (writingReply) return writingReply;
    }
    return null;
  }

if (intent.intent === "teaching") {
return "অবশ্যই, আমি ধাপে ধাপে শেখাতে পারি। আপনি যে বিষয়টি শিখতে চান সেটি লিখুন — আমি সহজ ভাষায় ধারণা, উদাহরণ, অনুশীলন এবং পরবর্তী ধাপ সাজিয়ে দেব।";
}

switch (intent.intent) {
case "book": {
const recommendedBook = buildBookRecommendationReply(rawText);
if (recommendedBook) return recommendedBook;
return buildBookReply(userText);
}
case "writing": {
const discoveryReply = buildWritingDiscoveryReply(rawText);
if (discoveryReply) return discoveryReply;
// "কবিতা দাও", "একটি লেখা দাও" — give a random writing
if (/দাও|দিন|দেখাও|দেখান|পড়তে চাই|পড়তে চান/.test(userText) && !isLikelyTitleSearch) {
  const writings = getWritingsArchive();
  if (writings && writings.length > 0) {
    const poems = writings.filter((w) => w.category === "কবিতা");
    const pool = poems.length > 0 ? poems : writings;
    const random = pool[Math.floor(Math.random() * pool.length)];
    return formatWritingReply(random);
  }
}
if (isLikelyTitleSearch || hasSearchPattern) {
  const writingReply = buildWritingSearchReply(rawText);
  if (writingReply) return writingReply;
}
return buildWritingReply(userText);
}
case "recitation":
return buildRecitationReply(userText);
case "author":
return buildAuthorReply();
case "social":
return buildSocialReply();
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
return "আমিও লিখবো বাস্তবতা হলো একটি সোশ্যাল ফিড, যেখানে পাঠকেরা নিজের বাস্তব অনুভূতি ও গল্প শেয়ার করতে পারেন। পেজ: [BUTTON:/amio-likhbo-bastobota]";
case "site":
return buildSiteReply(userText);
default:
return null;
}
}

// ── buildSiteSpecificReply: শুধুমাত্র ওয়েবসাইট-নির্দিষ্ট প্রশ্নের দ্রুত উত্তর ──────────────────────────
// সাধারণ কথোপকথন, সাধারণ জ্ঞান, বিজ্ঞান, ইতিহাস — সবকিছু AI-তে যাবে।
// শুধু বই/লেখা/পেজ/লেখক/অডিও এডিটিং সম্পর্কিত প্রশ্নে দ্রুত canonical উত্তর দেওয়া হবে।
function buildSiteSpecificReply(messages = []) {
  const rawText = extractUserText(messages);
  const userText = normalizeForIntent(rawText);
  if (!userText) return null;

  // Help menu — সাইট-নির্দিষ্ট
  const helpPattern = /(কি করতে পারো|কী করতে পারো|কি পারো|কী পারো|সাহায্য|হেল্প|help|commands|মেনু)/i;
  if (helpPattern.test(rawText)) return buildHelpMenuReply();

  // লেখা দেখানো/খোঁজা — সাইট-নির্দিষ্ট
  const contextualReply = buildContextualSelectionReply(rawText, messages);
  if (contextualReply) return contextualReply;

  // অডিও এডিটিং — সাইট-নির্দিষ্ট
  if (/(অডিও.*এডিট|অডিও.*প্রসেস|অডিও.*করো|audio.*edit|audio.*process|voice.*edit|voice.*enhance|noise.*remov|নয়েজ.*কমা|ভয়েস.*পরিষ্কার|ভয়েস.*এনহান্স)/i.test(rawText)) {
    return " অডিও এডিটিং সুবিধা\n\nএই চ্যাটবটটি একটি শক্তিশালী AI অডিও এডিটর! আপনি যা করতে পারবেন:\n\n ভয়েস ক্লিনিং — নয়েজ কমানো, ভয়েস পরিষ্কার করা\n স্মার্ট মিক্স — ব্যাকগ্রাউন্ড মিউজিক যোগ করা\n পডকাস্ট মোড — রেডিও/পডকাস্ট কোয়ালিটি\n ইকো/রিভার্ব — কবিতা বা গজলের জন্য\n ভলিউম বুস্ট — সাউন্ড বাড়ানো/কমানো\n\n কীভাবে ব্যবহার করবেন:\n১. নিচের বাটনে ক্লিক করে অডিও ফাইল আপলোড করুন\n২. বলুন কী করতে চান (যেমন: 'নয়েজ কমাও', 'মিউজিক যোগ করো')\n৩. AI প্রসেস করে এডিটেড অডিও দিয়ে দেবে!";
  }

  // বই/ই-বুক — সাইট-নির্দিষ্ট
  const earlyBookRecommendation = buildBookRecommendationReply(rawText);
  if (earlyBookRecommendation && /(বই|ই-বুক|ebook|book|পড়ব|পড়ব|শুরু|সাজেস্ট|রেকমেন্ড|recommend|suggest)/i.test(rawText)) return earlyBookRecommendation;

  // সাইট পেজ ন্যাভিগেশন — সাইট-নির্দিষ্ট
  const wantsAllPages = /(সব|সকল|সবগুলো|মেনু|পেজগুলো|all|menu)/i.test(rawText) && /(পেজ|page|ওয়েবসাইট|সাইট|site|মেনু|menu)/i.test(rawText);
  if (wantsAllPages) return buildSiteReply(rawText);

  // লেখা খোঁজা — সাইট-নির্দিষ্ট
  const { hasSearchPattern, isLikelyTitleSearch } = detectWritingSearchIntent(rawText);
  if (hasSearchPattern) {
    const writingReply = buildWritingSearchReply(rawText);
    if (writingReply) return writingReply;
  }

  // Index-based search — শুধু সাইট-নির্দিষ্ট প্রশ্নে
  if (!isGeneralKnowledgeQuestion(rawText)) {
    const indexSearchReply = buildIndexSearchReply(rawText);
    if (indexSearchReply) return indexSearchReply;
  }

  // Intent-based routing — শুধু সাইট-নির্দিষ্ট intent
  const intent = detectIntent(userText);
  if (intent) {
    switch (intent.intent) {
      case "book": {
        const recommendedBook = buildBookRecommendationReply(rawText);
        if (recommendedBook) return recommendedBook;
        return buildBookReply(userText);
      }
      case "writing": {
        const discoveryReply = buildWritingDiscoveryReply(rawText);
        if (discoveryReply) return discoveryReply;
        if (/দাও|দিন|দেখাও|দেখান|পড়তে চাই|পড়তে চান/.test(userText) && !isLikelyTitleSearch) {
          const writings = getWritingsArchive();
          if (writings && writings.length > 0) {
            const poems = writings.filter((w) => w.category === "কবিতা");
            const pool = poems.length > 0 ? poems : writings;
            const random = pool[Math.floor(Math.random() * pool.length)];
            return formatWritingReply(random);
          }
        }
        if (isLikelyTitleSearch || hasSearchPattern) {
          const writingReply = buildWritingSearchReply(rawText);
          if (writingReply) return writingReply;
        }
        return buildWritingReply(userText);
      }
      case "recitation": return buildRecitationReply(userText);
      case "author": return buildAuthorReply();
      case "social": return buildSocialReply();
      case "contact": return buildContactReply();
      case "audio":
      case "vision": return buildToolReply(intent.intent);
      case "design": return "সরদার ডিজাইন স্টুডিওতে কবিতা, উক্তি বা লেখার কার্ড তৈরি করা যায়। ছবি, টেক্সট, স্টিকার, ফিল্টার ও ব্যাকগ্রাউন্ডসহ ডিজাইন করতে এখানে যান: [BUTTON:/editor]";
      case "gallery": return "মাহবুব সরদার সবুজের ছবি ও গ্যালারি দেখতে এই পেজে যান: [BUTTON:/gallery]";
      case "news": return "সর্বশেষ আপডেট ও সংবাদ পড়তে সরদার সংবাদ পেজে যান: [BUTTON:/news]";
      case "community": return "আমিও লিখবো বাস্তবতা হলো একটি সোশ্যাল ফিড, যেখানে পাঠকেরা নিজের বাস্তব অনুভূতি ও গল্প শেয়ার করতে পারেন। পেজ: [BUTTON:/amio-likhbo-bastobota]";
      case "site": return buildSiteReply(userText);
      default: return null;
    }
  }

  // লেখা শিরোনাম দিয়ে খোঁজা — সাইট-নির্দিষ্ট
  if (isLikelyTitleSearch && !isGeneralKnowledgeQuestion(rawText)) {
    const writingReply = buildWritingSearchReply(rawText);
    if (writingReply) return writingReply;
  }

  // বাকি সব — AI-তে পাঠানোর জন্য null রিতার্ন করো
  return null;
}

function buildFallbackReply(messages = [], originalError = null) {
const canonicalReply = buildCanonicalReply(messages);
if (canonicalReply) return canonicalReply;

const userText = extractUserText(messages).toLowerCase();

// Greetings — always respond warmly even in fallback mode
// গ্রিটিং — AI-তে পাঠানো হবে যাতে মানবসুলভ উত্তর পাওয়া যায়
// (buildSiteSpecificReply-এ greeting নেই, তাই AI হ্যান্ডেল করবে)

// Thank you messages
if (/ধন্যবাদ|thanks|thank you|শুক্রিয়া|আপনাকে ধন্যবাদ/.test(userText)) {
return "আপনাকেও ধন্যবাদ। আর কোনো প্রশ্ন থাকলে জানাবেন।";
}

if (/দুঃখবিলাস|বিচ্ছেদকে বলি/.test(userText)) {
return "\"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" — মাহবুব সরদার সবুজের প্রথম ফিজিক্যাল বই (২০২৬)। রকমারি থেকে অর্ডার করুন: https://rkmri.co/TTMEoA3l3pM0/\n\nঅনলাইনে পড়তে: [BUTTON:/ebooks/read/dukkhovilash]";
}
if (/বই|ebook|ই-বুক|চাঁদফুল|স্মৃতির বসন্তে|সময়ের গহ্বরে|অনবদ্য|কিনব|পড়ব|পড়তে/.test(userText)) {
return "মাহবুব সরদার সবুজের বই সংগ্রহ:\n\n ফিজিক্যাল বই: \"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" — রকমারি: https://rkmri.co/TTMEoA3l3pM0/\n\n বিনামূল্যে ই-বুক:\n• স্মৃতির বসন্তে তুমি: [BUTTON:/ebooks/read/smritir-boshonte]\n• চাঁদফুল: [BUTTON:/ebooks/read/chand-phool]\n• সময়ের গহ্বরে: [BUTTON:/ebooks/read/shomoyer-gohvore]\n• অনবদ্য লেখা: [BUTTON:/ebooks/read/onoboddo-lekha]\n\nসব বই দেখতে: [BUTTON:/ebooks]";
}
if (/যোগাযোগ|contact|ইমেইল|email|ফেসবুক|facebook|instagram|youtube/.test(userText)) {
return "লেখকের সাথে যোগাযোগ করুন:\n ইমেইল: lekhokmahbubsardarsabuj@gmail.com\n Facebook: https://facebook.com/MahbubSardarSabuj\n Instagram: https://instagram.com/mahbub_sardar_sabuj\n▶ YouTube: https://youtube.com/@MahbubSardarSabuj\n\nযোগাযোগ ফর্ম: [BUTTON:/contact]";
}
if (/অডিও.*এডিট|অডিও.*প্রসেস|অডিও.*করো|audio.*edit|audio.*process|voice.*edit|voice.*enhance|noise.*remov|নয়েজ.*কমা|ভয়েস.*পরিষ্কার|ভয়েস.*এনহান্স/.test(userText)) {
	return " অডিও এডিটিং সুবিধা\n\nএই চ্যাটবটটি একটি শক্তিশালী AI অডিও এডিটর! আপনি যা করতে পারবেন:\n\n ভয়েস ক্লিনিং — নয়েজ কমানো, ভয়েস পরিষ্কার করা\n স্মার্ট মিক্স — ব্যাকগ্রাউন্ড মিউজিক যোগ করা\n পডকাস্ট মোড — রেডিও/পডকাস্ট কোয়ালিটি\n ইকো/রিভার্ব — কবিতা বা গজলের জন্য\n ভলিউম বুস্ট — সাউন্ড বাড়ানো/কমানো\n\n কীভাবে ব্যবহার করবেন:\n১. নিচের বাটনে ক্লিক করে অডিও ফাইল আপলোড করুন\n২. বলুন কী করতে চান (যেমন: \'নয়েজ কমাও\', \'মিউজিক যোগ করো\')\n৩. AI প্রসেস করে এডিটেড অডিও দিয়ে দেবে!";
}
if (/পরিচয়|about|লেখক|কবি|জন্ম|কুমিল্লা|সৌদি|মাহবুব/.test(userText)) {
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
return "মাহবুব সরদার সবুজের ২,২৬০টি লেখা পড়তে যান: [BUTTON:/writings]\n\nবিষয়ভিত্তিক: ছোট লেখা ও উক্তি (১,১১৭), জীবনদর্শন (৬৬২), বিচ্ছেদ (২৫১), ভালোবাসা (১৯০), কবিতা (৪০)";
}
if (/আমিও লিখবো|লিখবো বাস্তবতা|amio|bastobota/.test(userText)) {
return "আমিও লিখবো বাস্তবতা — একটি সোশ্যাল ফিড যেখানে যে কেউ নিজের বাস্তব গল্প শেয়ার করতে পারেন: [BUTTON:/amio-likhbo-bastobota]";
}
if (/রকমারি|rokomari|কিনতে|order/.test(userText)) {
return "\"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" বইটি রকমারি থেকে কিনুন: https://rkmri.co/TTMEoA3l3pM0/";
}

// Default: helpful navigation response instead of a dead-end error message
return "আপনার প্রশ্নটি পুরোপুরি বুঝতে পারিনি, তবে আমি কয়েকভাবে সাহায্য করতে পারি:\n\n১. লেখক পরিচিতি: [BUTTON:/about]\n২. বই ও ই-বুক: [BUTTON:/ebooks]\n৩. লেখা পড়া বা খোঁজা: [BUTTON:/writings]\n৪. সরাসরি যোগাযোগ: [BUTTON:/contact]\n\nউদাহরণ হিসেবে লিখতে পারেন—“ভালোবাসার লেখা দেখাও”, “কোন বই দিয়ে শুরু করব”, অথবা “লেখকের জন্মস্থান কোথায়?”";
}

function sanitizeReply(reply) {
if (!reply || typeof reply !== "string") return reply;
// Convert internal site links to BUTTON format
reply = reply.replace(/\[([^\]]+)\]\(https?:\/\/(?:www\.)?mahbubsardarsabuj\.com(\/[^\)]*)?\)/g, (_, _t, path) => path ? `[BUTTON:${path}]` : `[BUTTON:/]`);
reply = reply.replace(/https?:\/\/(?:www\.)?mahbubsardarsabuj\.com(\/[^\s\)\"\']+)?/g, (_, path) => path ? `[BUTTON:${path}]` : `[BUTTON:/]`);
reply = reply.replace(/https?:\/\/(?:www\.)?mahmubsardarsabuj\.com(\/[^\s\)\"\']+)?/g, (_, path) => path ? `[BUTTON:${path}]` : `[BUTTON:/]`);
// Remove ** bold markdown markers
reply = reply.replace(/\*\*([^*]+)\*\*/g, "$1");
reply = reply.replace(/\*\*/g, "");
// Remove emoji characters
reply = reply.replace(/[\u{1F300}-\u{1F9FF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F004}\u{1F0CF}]/gu, "");
// Clean up extra spaces after removal
reply = reply.replace(/  +/g, " ");
reply = reply.replace(/\n +/g, "\n");
reply = reply.replace(/^ +/gm, "");
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
	const reply = await callAIWithConfig(messages, config);
	recordProviderAttempt(config.source, true);
	return { reply, provider: config.source };

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

	recordProviderAttempt(config.source, false);
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
" <b>AI Chatbot Conversation</b>",
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
				temperature: 0.85,
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

// Detect special modes before enforcing POST-only chat behavior.
const url = new URL(req.url || "/", "https://local.invalid");
const isAnalytics = url.searchParams.get("analytics") === "1";
const isFeedback = url.searchParams.get("feedback") === "1";
if (isAnalytics) return handleAnalyticsRequest(req, res);
if (isFeedback) return handleFeedbackRequest(req, res);

if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

if (limitJsonBodySize(req, res, 2 * 1024 * 1024)) return;

// Detect streaming mode: ?stream=1 query param (used by /api/chat-stream redirect)
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
return res.status(400).json({ error: "বার্তাটি একটু বড় হয়ে গেছে। সংক্ষিপ্ত করে আবার পাঠান — আমি সাহায্য করতে প্রস্তুত! " });
}

const filteredMessages = messages
.filter((m) => m.role !== "system" && ["user", "assistant"].includes(m.role))
.slice(-12);
const allMessages = [{ role: "system", content: SYSTEM_PROMPT }, ...filteredMessages];

// Streaming mode — SSE response
if (isStream) {
recordProviderAttempt("stream", true);
recordChatbotMessage({ req, text: lastUserText, intent: detectAnalyticsIntent(lastUserText), provider: "stream" });
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

// ── AI-First Routing: ওয়েবসাইট-নির্দিষ্ট প্রশ্নে দ্রুত canonical উত্তর, বাকি সব AI-তে ──
// শুধুমাত্র ওয়েবসাইট-নির্দিষ্ট প্রশ্ন (বই, লেখা, পেজ, লেখক পরিচিতি, অডিও এডিটিং)
// canonical দিয়ে উত্তর দেওয়া হবে। সাধারণ কথোপকথন, সাধারণ জ্ঞান, দর্শন, বিজ্ঞান,
// ইতিহাস — সবকিছু সরাসরি AI-তে যাবে যেন ChatGPT-এর মতো উত্তর পাওয়া যায়।
const siteSpecificReply = buildSiteSpecificReply(messages);
if (siteSpecificReply) {
await notifyTelegram({
userMessage: userMsgText,
aiResponse: siteSpecificReply,
clientIp: rate.clientIp,
userAgent: req.headers["user-agent"],
imageData: lastUserImgPart || null,
}).catch((e) => console.error("Telegram notification failed:", e.message));
recordProviderAttempt("canonical", true);
recordChatbotMessage({ req, text: userMsgText, intent: detectAnalyticsIntent(userMsgText), provider: "canonical" });
return res.status(200).json({ reply: sanitizeReply(siteSpecificReply), source: "canonical" });
}

try {
const aiResult = await callAI(allMessages);
const reply = typeof aiResult === "string" ? aiResult : aiResult.reply;
const provider = typeof aiResult === "string" ? "ai" : aiResult.provider;
await notifyTelegram({
userMessage: userMsgText,
aiResponse: reply,
clientIp: rate.clientIp,
userAgent: req.headers["user-agent"],
imageData: lastUserImgPart || null,
}).catch((e) => console.error("Telegram notification failed:", e.message));
recordChatbotMessage({ req, text: userMsgText, intent: detectAnalyticsIntent(userMsgText), provider });
return res.status(200).json({ reply: sanitizeReply(reply) });
} catch (err) {
const is429 = err.message?.includes("429");
console.error("AI API failed; returning built-in fallback reply:", err.message);
// AI ব্যর্থ হলে canonical fallback ব্যবহার করো
const fallbackReply = buildCanonicalReply(messages) || buildFallbackReply(messages, err);

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

recordProviderAttempt("fallback", false);
recordChatbotMessage({ req, text: userMsgText, intent: detectAnalyticsIntent(userMsgText), fallback: true, provider: "fallback" });
return res.status(200).json({ reply: sanitizeReply(fallbackReply), fallback: true });
}
} catch (err) {
console.error("Chat handler error:", err);
return res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" });
}
}
// Force redeploy Sun Jun 08 2026 — v6.0: writing search + emoji/bold cleanup
