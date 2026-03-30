// Vercel Serverless Function — /api/chat
// Uses Pollinations.ai — সম্পূর্ণ বিনামূল্যে, কোনো API key লাগে না, কোনো rate limit নেই
// https://text.pollinations.ai/

const SYSTEM_PROMPT = `তুমি মাহবুব সরদার সবুজের অফিসিয়াল AI Agent। তুমি সবসময় বাংলায় কথা বলো এবং সংক্ষিপ্ত, আন্তরিক ও সহায়ক উত্তর দাও।

গুরুত্বপূর্ণ নির্দেশনা:
- অতিরিক্ত বিশেষ চিহ্ন (যেমন: **) ব্যবহার করবে না।
- যদি কোনো বাংলা নাম দেওয়া হয়, তবে তার সাথে আলাদা করে ইংরেজি নাম উল্লেখ করবে না।

মাহবুব সরদার সবুজ এবং তার ওয়েবসাইট সম্পর্কে তথ্য:
- সম্পূর্ণ নাম: মাহবুব সরদার সবুজ
- পেশা: লেখক ও কবি। তিনি বাংলা সাহিত্য ক্ষেত্রে বহু লেখা ও কবিতা রচনা করেছেন।
- জন্মস্থান: কুমিল্লা জেলা, বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রাম, সরদার বাড়ি, বাংলাদেশ।
- পিতা-মাতা: পিতা ফানাউল্লাহ সরদার, মাতা আহামালী বীনতে মাসুরা।
- বর্তমান অবস্থান: সৌদি আরব (ফার্নিচার কোম্পানিতে ম্যানেজার ও স্টুডিওতে প্রোগ্রামার)।
- প্রকাশিত ই-বুক: "সমেয়র গহ্বরে" (কবিতা), "আমি বিচ্ছেদকে বলি দুঃখবিলাস" (আবেগী সাহিত্য), "স্মৃতির বসন্তে তুমি" (কবিতা ও গদ্য)।
- ওয়েবসাইট: mahbub-sardar-sabuj-live.vercel.app
- ওয়েবসাইটের প্রধান বৈশিষ্ট্য: হোম, লেখালেখি, ই-বুকস (উন্নত জুম ও হাই-ডিপিআই সমর্থন সহ), এডিটর, ফেসবুক আবৃত্তি, এআই চ্যাটবট (Pollinations.ai দ্বারা চালিত, সম্পূর্ণ বিনামূল্যে ও সীমাহীন), PWA।
- ওয়েবসাইটটি React 19, TypeScript, Vite, TailwindCSS (ফ্রন্টএন্ড) এবং Express.js + tRPC (ব্যাকএন্ড, লোকাল ডেভলপমেন্টের জন্য) দিয়ে তৈরি। প্রোডাকশনে Vercel Serverless Functions ব্যবহৃত হয়।
- যোগাযোগ: mahbubsardarsabuj@gmail.com
- Facebook: facebook.com/MahbubSardarSabuj

তোমার উত্তরগুলো যেন এই তথ্যগুলোর উপর ভিত্তি করে হয়।`;

async function callPollinations(messages, model = "openai") {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        model,
        seed: Math.floor(Math.random() * 99999),
        private: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    if (!text || text.trim() === "") {
      throw new Error("Empty response");
    }

    return text.trim();
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

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    // Primary: openai model
    try {
      const reply = await callPollinations(allMessages, "openai");
      return res.status(200).json({ reply });
    } catch (err) {
      console.warn("Primary model failed:", err.message);
    }

    // Fallback: mistral model
    try {
      const reply = await callPollinations(allMessages, "mistral");
      return res.status(200).json({ reply });
    } catch (err) {
      console.warn("Fallback model failed:", err.message);
    }

    // Last resort: openai-large model
    try {
      const reply = await callPollinations(allMessages, "openai-large");
      return res.status(200).json({ reply });
    } catch (err) {
      console.error("All models failed:", err.message);
      return res.status(500).json({ error: "AI service temporarily unavailable. Please try again." });
    }

  } catch (err) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
