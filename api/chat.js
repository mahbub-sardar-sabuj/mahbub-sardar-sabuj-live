// AI Chatbot API — OpenAI-compatible (gpt-4.1-mini)
// Uses OPENAI_API_KEY and OPENAI_BASE_URL environment variables set in Vercel

const SYSTEM_PROMPT = `তুমি মাহবুব সরদার সবুজের অফিসিয়াল AI Agent। তুমি একজন অত্যন্ত বুদ্ধিমান, মার্জিত এবং বহুমুখী এআই সহকারী।

তোমার কাজের মূলনীতি:
১. গভীর জ্ঞান (A to Z): তুমি মাহবুব সরদার সবুজ এবং তার ওয়েবসাইট সম্পর্কে প্রতিটি খুঁটিনাটি তথ্য জানো। কেউ এই বিষয়ে প্রশ্ন করলে তুমি অত্যন্ত বিস্তারিত ও নির্ভুল উত্তর দেবে।
২. সাধারণ জ্ঞান: তুমি বিজ্ঞান, ইতিহাস, প্রযুক্তি, সাহিত্যসহ যেকোনো সাধারণ প্রশ্নের উত্তর দিতে সক্ষম।
৩. ভাষা ও শৈলী: সবসময় শুদ্ধ ও প্রাঞ্জল বাংলায় উত্তর দেবে। উত্তরগুলো হবে আন্তরিক এবং সংক্ষিপ্ত।
৪. সিম্বল বর্জন: কোনো অবস্থাতেই অপ্রয়োজনীয় বিশেষ চিহ্ন (যেমন: **, #, __, *, >) ব্যবহার করবে না। উত্তর হবে সাধারণ টেক্সট ফরম্যাটে।
৫. নাম ব্যবহারের নিয়ম: বাংলা নাম দিলে আলাদা করে ইংরেজি নাম উল্লেখ করবে না।

মাহবুব সরদার সবুজ সম্পর্কে বিস্তারিত তথ্য:
- পরিচয়: তিনি একজন প্রথিতযশা লেখক ও কবি। বাংলা সাহিত্যে তার অবদান অনস্বীকার্য।
- জন্ম ও পরিবার: কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়িতে তার জন্ম। পিতা: ফানাউল্লাহ সরদার, মাতা: আহামালী বীনতে মাসুরা।
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

// Call AI API (Manus Forge or OpenAI)
async function callAI(messages) {
  // Use BUILT_IN_FORGE_API_KEY if available, otherwise fallback to OPENAI_API_KEY
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY || process.env.OPENAI_API_KEY;
  
  // Correctly resolve the base URL and model
  let baseUrl = "https://api.openai.com/v1";
  let model = "gpt-4.1-mini";

  if (process.env.BUILT_IN_FORGE_API_KEY) {
    baseUrl = process.env.BUILT_IN_FORGE_API_URL 
      ? process.env.BUILT_IN_FORGE_API_URL.replace(/\/$/, "")
      : "https://forge.manus.im/v1";
    model = "gemini-2.5-flash";
  } else if (process.env.OPENAI_BASE_URL) {
    baseUrl = process.env.OPENAI_BASE_URL.replace(/\/$/, "");
    model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  }

  if (!apiKey) {
    throw new Error("API key not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 28000);

  try {
    const payload = {
      model,
      messages,
      max_tokens: 800,
      temperature: 0.7,
    };

    // Add thinking budget for Forge models
    if (model.includes("gemini")) {
      payload.thinking = { budget_tokens: 128 };
    }

    let fetchUrl = baseUrl;
    if (!fetchUrl.endsWith("/chat/completions")) {
      // If it ends with /v1, just append /chat/completions
      // If it doesn't end with /v1, append /v1/chat/completions
      // But if it's already a full path like /api/llm-proxy/v1, we should be careful
      if (fetchUrl.endsWith("/v1")) {
        fetchUrl = `${fetchUrl}/chat/completions`;
      } else if (fetchUrl.includes("/v1/")) {
        // If /v1 is already in the middle, just append /chat/completions
        fetchUrl = `${fetchUrl.replace(/\/$/, "")}/chat/completions`;
      } else {
        fetchUrl = `${fetchUrl.replace(/\/$/, "")}/v1/chat/completions`;
      }
    }
    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}: ${errText.slice(0, 200)}`);
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

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-10), // Keep last 10 messages for context
    ];

    try {
      const reply = await callAI(allMessages);
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
