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

// api/chat.js — v6.0: লেখা খোঁজার সক্ষমতা যোগ, ইমোজি ও মুক্ত

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
const SYSTEM_PROMPT = `তুমি "মাহবুব সরদার সবুজ AI Agent" — বাংলা সাহিত্যের লেখক মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটের বিশ্বমানের AI সহকারী। তুমি শুধু একটি সাধারণ চ্যাটবট নও — তুমি একজন বুদ্ধিমান, মানবসুলভ, প্রাসঙ্গিক এবং পেশাদার সহকারী যিনি বাংলা সাহিত্য ও লেখকের জগতকে গভীরভাবে চেনেন, এবং যেকোনো বিষয়ে সাহায্য করতে সক্ষম। অডিও এডিটিং, ইমেজ বিশ্লেষণ, ভিডিও প্রসেসিং সহ সকল মাল্টিমিডিয়া কাজ সরাসরি চ্যাটে করতে পারো।

## ব্যক্তিত্ব ও আচরণের মূলনীতি
${CHATBOT_PERSONA_RULES.map((rule, index) => `${index + 1}. ${rule}`).join("\n")}

## গুরুত্বপূর্ণ নির্দেশনা (অবশ্যই মানতে হবে)

### ১. সম্বোধন নীতি (অত্যন্ত গুরুত্বপূর্ণ)
- লেখক মাহবুব সরদার সবুজ সম্পর্কে বলার সময় সদা বলবে তিনি বর্তমানে সৌদি আরবে কর্মরত ও অবস্থানরত।
- কোনো অবস্থাতেই লেখককে "প্রবাসী" বলা যাবে না। এটি সর্বাবস্থায় নিষিদ্ধ।
- সঠিক সম্বোধন: "সৌদি আরবে কর্মরত", "সৌদি আরবে অবস্থানরত", "সৌদি আরবে থাকেন"।

### ২. ভিজিটর-ফ্রেন্ডলি কথোপকথনের নীতি (অত্যন্ত গুরুত্বপূর্ণ)
- প্রথমবার আসা ভিজিটরকে উষ্ণভাবে স্বাগত জানাও — যেন পুরনো বন্ধু কথা বলছে।
- ব্যবহারকারীর প্রশ্নের প্রসঙ্গ বুঝে স্বাভাবিকভাবে উত্তর দাও — কখনো রোবোটিক বা ঠান্ডা ভাষা নয়।
- উত্তর সবসময় সংক্ষিপ্ত ও সহজবোধ্য রাখো — ভিজিটর যেন বিরক্ত না হন।
- ব্যবহারকারী যদি আবেগপ্রবণ বিষয় নিয়ে লেখেন (বিচ্ছেদ, কষ্ট, ভালোবাসা), তাহলে আগে সহানুভূতি দাও, তারপর তথ্য।
- প্রতিটি উত্তরের শেষে একটি সহজ follow-up প্রশ্ন বা পরামর্শ দাও যা ভিজিটরকে আরও এগিয়ে যেতে সাহায্য করে।
- বাংলা সাহিত্য, প্রেম, বিচ্ছেদ, জীবনদর্শন সম্পর্কিত প্রশ্নে লেখকের দৃষ্টিভঙ্গি দিয়ে উত্তর দাও।
- নতুন ভিজিটর হলে ওয়েবসাইটের সুবিধাগুলো সংক্ষেপে জানাও।
- ভিজিটর যদি হতাশ বা বিরক্ত মনে হয়, তাহলে সরাসরি লাইভ চ্যাটে যাওয়ার পরামর্শ দাও।

### ৩. তথ্য দেওয়ার নীতি (ভিজিটর-ফ্রেন্ডলি)
- ওয়েবসাইট/লেখক সম্পর্কে প্রশ্ন হলে যাচাইকৃত knowledge base-কে শতভাগ অগ্রাধিকার দাও।
- সাধারণ জ্ঞানভিত্তিক প্রশ্নে গভীর ও বিস্তারিত উত্তর দাও।
- অজানা তথ্য বানিয়ে বলো না; নিশ্চিত না হলে নম্রভাবে স্বীকার করো।
- প্রতিটি উত্তরে প্রাসঙ্গিক হলে [BUTTON:/path] ফরম্যাটে internal navigation link দাও।
- সর্বোচ্চ ১৫০ শব্দে সংক্ষিপ্ত উত্তর দাও যদি বিস্তারিত না চাওয়া হয়; বিস্তারিত চাইলে পূর্ণাঙ্গ উত্তর দাও।
- উত্তরের শেষে সবসময় একটি প্রাসঙ্গিক বাটন বা পরামর্শ দাও।
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

### ৬. অডিও এডিটিং নির্দেশনা (Pro Max বিশেষ ফিচার)
- ব্যবহারকারী যদি অডিও ফাইল আপলোড করে এবং কী করতে হবে তা বাংলায় লেখে, তাহলে সিস্টেম স্বয়ংক্রিয়ভাবে /api/audio-edit এন্ডপয়েন্টে পাঠাবে।
- অডিও এডিটিং সম্পর্কে প্রশ্ন করলে বলো: "নিচের বাটনে ক্লিক করে অডিও ফাইল আপলোড করুন, তারপর বাংলায় লিখুন কী করতে চান।"
- সমর্থিত অডিও অপারেশন: নয়েজ রিমুভ, ভোকাল ক্লিন, ভয়েস এনহ্যান্স, EQ অ্যাডজাস্ট, ভলিউম নর্মালাইজ, ট্রিম, ফেড ইন/আউট, রিভার্ব, পডকাস্ট প্রিসেট, স্টুডিও মাস্টারিং, কবিতা/আবৃত্তি মোড।
- আলাদা কোনো অডিও এডিটিং টুলে যেতে বলো না — সবকিছু সরাসরি এই চ্যাটবটেই সম্পন্ন হবে।

### ৬. Pro Max মাল্টিমিডিয়া ক্যাপাবিলিটি
- ছবি আপলোড করলে: বিশ্লেষণ, বর্ণনা, প্রশ্নের উত্তর দাও।
- অডিও আপলোড করলে: নির্দেশ অনুযায়ী এডিট করো।
- ভিডিও আপলোড করলে: অডিও বের করে প্রসেস করো।
- সব মাল্টিমিডিয়া কাজ সরাসরি চ্যাটেই সম্পন্ন হয় — আলাদা টুলের দরকার নেই।

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
const payload = { model, messages, max_tokens: 8000, temperature: 0.7 };

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

// ── Writing search: find writing by title ─────────────────────────────────────
function searchWritingByTitle(query) {
const writings = getWritingsArchive();
if (!writings || writings.length === 0) return null;
const normalizedQuery = query.trim().toLowerCase();
if (normalizedQuery.length < 2) return null;
// 1. Exact match
const exactMatch = writings.find((w) => w.title.toLowerCase() === normalizedQuery);
if (exactMatch) return { writing: exactMatch, matchType: "exact" };
// 2. Starts-with match
const startsWithMatch = writings.find((w) => w.title.toLowerCase().startsWith(normalizedQuery));
if (startsWithMatch) return { writing: startsWithMatch, matchType: "startsWith" };
// 3. Contains match
const containsMatch = writings.find((w) => w.title.toLowerCase().includes(normalizedQuery));
if (containsMatch) return { writing: containsMatch, matchType: "contains" };
// 4. Partial word match
const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length >= 2);
if (queryWords.length > 0) {
const scored = writings
.map((w) => {
const titleLower = w.title.toLowerCase();
const hits = queryWords.filter((word) => titleLower.includes(word)).length;
return { writing: w, hits };
})
.filter((r) => r.hits > 0)
.sort((a, b) => b.hits - a.hits);
if (scored.length > 0) return { writing: scored[0].writing, matchType: "partial" };
}
return null;
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
return `ওয়েবসাইটে মাহবুব সরদার সবুজের মোট ১১৯৮টি লেখা রয়েছে। প্রধান বিভাগগুলো হলো: ${categories}।\n\nসব লেখা দেখতে: [BUTTON:/writings]\nই-বুক সংগ্রহ: [BUTTON:/ebooks]\n\nআপনি ভালোবাসা, বিচ্ছেদ, জীবনদর্শন, ছোট লেখা বা কবিতা—যে কোনো বিভাগ আলাদা করে চাইতে পারেন।`;
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

function buildCanonicalReply(messages = []) {
const rawText = extractUserText(messages);
const userText = normalizeForIntent(rawText);
if (!userText) return null;

// ── Writing search: check if user is looking for a specific writing ──────
const { hasSearchPattern, isLikelyTitleSearch } = detectWritingSearchIntent(rawText);
if (hasSearchPattern) {
  const writingReply = buildWritingSearchReply(rawText);
  if (writingReply) return writingReply;
}

const intent = detectIntent(userText);
if (!intent) {
  if (isLikelyTitleSearch) {
    const writingReply = buildWritingSearchReply(rawText);
    if (writingReply) return writingReply;
  }
  return null;
}

if (intent.intent === "teaching") {
return "অবশ্যই, আমি ধাপে ধাপে শেখাতে পারি। আপনি যে বিষয়টি শিখতে চান সেটি লিখুন — আমি সহজ ভাষায় ধারণা, উদাহরণ, অনুশীলন এবং পরবর্তী ধাপ সাজিয়ে দেব।";
}

switch (intent.intent) {
case "book":
return buildBookReply(userText);
case "writing":
if (isLikelyTitleSearch || hasSearchPattern) {
  const writingReply = buildWritingSearchReply(rawText);
  if (writingReply) return writingReply;
}
return buildWritingReply(userText);
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
return "মাহবুব সরদার সবুজের বই সংগ্রহ:\n\n ফিজিক্যাল বই: \"আমি বিচ্ছেদকে বলি দুঃখবিলাস\" — রকমারি: https://rkmri.co/TTMEoA3l3pM0/\n\n বিনামূল্যে ই-বুক:\n• স্মৃতির বসন্তে তুমি: [BUTTON:/ebooks/read/smritir-boshonte]\n• চাঁদফুল: [BUTTON:/ebooks/read/chand-phool]\n• সময়ের গহ্বরে: [BUTTON:/ebooks/read/shomoyer-gohvore]\n• অনবদ্য লেখা: [BUTTON:/ebooks/read/onoboddo-lekha]\n\nসব বই দেখতে: [BUTTON:/ebooks]";
}
if (/যোগাযোগ|contact|ইমেইল|email|ফেসবুক|facebook|instagram|youtube/.test(userText)) {
return "লেখকের সাথে যোগাযোগ করুন:\n ইমেইল: lekhokmahbubsardarsabuj@gmail.com\n Facebook: https://facebook.com/MahbubSardarSabuj\n Instagram: https://instagram.com/mahbub_sardar_sabuj\n▶ YouTube: https://youtube.com/@MahbubSardarSabuj\n\nযোগাযোগ ফর্ম: [BUTTON:/contact]";
}
if (/অডিও|audio|ভয়েস|voice|নয়েজ|noise|মিউজিক|music|রেকর্ড|record|এডিট|edit|সাউন্ড|sound|মিক্স|mix/.test(userText)) {
return " অডিও এডিটিং সুবিধা\n\nএই চ্যাটবটটি একটি শক্তিশালী AI অডিও এডিটর! আপনি যা করতে পারবেন:\n\n ভয়েস ক্লিনিং — নয়েজ কমানো, ভয়েস পরিষ্কার করা\n স্মার্ট মিক্স — ব্যাকগ্রাউন্ড মিউজিক যোগ করা\n পডকাস্ট মোড — রেডিও/পডকাস্ট কোয়ালিটি\n ইকো/রিভার্ব — কবিতা বা গজলের জন্য\n ভলিউম বুস্ট — সাউন্ড বাড়ানো/কমানো\n\n কীভাবে ব্যবহার করবেন:\n১. নিচের বাটনে ক্লিক করে অডিও ফাইল আপলোড করুন\n২. বলুন কী করতে চান (যেমন: \'নয়েজ কমাও\', \'মিউজিক যোগ করো\')\n৩. AI প্রসেস করে এডিটেড অডিও দিয়ে দেবে!";
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
return res.status(400).json({ error: "বার্তাটি একটু বড় হয়ে গেছে। সংক্ষিপ্ত করে আবার পাঠান — আমি সাহায্য করতে প্রস্তুত! " });
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
// Force redeploy Sun Jun 08 2026 — v6.0: writing search + emoji/bold cleanup
