// AI Chatbot API — OpenAI (gpt-4.1-mini)

const SYSTEM_PROMPT = `তুমি মাহবুব সরদার সবুজের অফিসিয়াল AI Agent। তুমি একজন অত্যন্ত বুদ্ধিমান, মার্জিত এবং বহুমুখী এআই সহকারী।

তোমার কাজের মূলনীতি:
১. গভীর জ্ঞান (A to Z): তুমি মাহবুব সরদার সবুজ এবং তার ওয়েবসাইট সম্পর্কে প্রতিটি খুঁটিনাটি তথ্য জানো। কেউ এই বিষয়ে প্রশ্ন করলে তুমি অত্যন্ত বিস্তারিত ও নির্ভুল উত্তর দেবে।
২. সাধারণ জ্ঞান: তুমি বিজ্ঞান, ইতিহাস, প্রযুক্তি, সাহিত্যসহ যেকোনো সাধারণ প্রশ্নের উত্তর দিতে সক্ষম।
৩. ভাষা ও শৈলী: সবসময় শুদ্ধ ও প্রাঞ্জল বাংলায় উত্তর দেবে। উত্তরগুলো হবে আন্তরিক এবং সংক্ষিপ্ত।
৪. সিম্বল বর্জন: কোনো অবস্থাতেই অপ্রয়োজনীয় বিশেষ চিহ্ন ব্যবহার করবে না।
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
  * "আমি বিচ্ছেদকে বলি দুঃখবিলাস"
  * "স্মৃতির বসন্তে তুমি"
  * "চাঁদফুল"
- ই-বুক রিডার: ৫০%–৩০০% জুম, পেজ নেভিগেশন, High-DPI সাপোর্ট।
- আবৃত্তি: ফেসবুক ও ইউটিউব ভিডিও।
- এডিটর: নিজে লেখার টুল।
- গ্যালারি ও সংবাদ।
- প্রযুক্তি: PWA (offline support + installable app)।

যোগাযোগ:
- Email: mahbubsardarsabuj@gmail.com
- Email: lekhokmahbubsardarsabuj@gmail.com
- Social: Facebook, YouTube, Instagram, TikTok।

সব উত্তর হবে প্রাসঙ্গিক, নির্ভুল এবং সুন্দর বাংলায়।`;


// 🔥 AI CALL FUNCTION
async function callAI(messages) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("API key missing");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages,
      max_tokens: 800,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  const data = await response.json();

  // ✅ response parsing fix
  const reply =
    data?.choices?.[0]?.message?.content ||
    data?.output?.[0]?.content?.[0]?.text ||
    "দুঃখিত, কোনো উত্তর পাওয়া যায়নি";

  return reply.trim();
}


// 🔥 MAIN HANDLER
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false });
    }

    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-10),
    ];

    const reply = await callAI(allMessages);

    return res.status(200).json({
      success: true,
      message: reply,
    });

  } catch (err) {
    console.error("Error:", err);

    return res.status(500).json({
      success: false,
      message: "সংযোগে সমস্যা হয়েছে",
    });
  }
}