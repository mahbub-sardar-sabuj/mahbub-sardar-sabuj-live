// Vercel Serverless Function — /api/chat
// Uses Pollinations.ai — সম্পূর্ণ বিনামূল্যে, কোনো API key লাগে না, কোনো rate limit নেই
// https://text.pollinations.ai/

const SYSTEM_PROMPT = `তুমি মাহবুব সরদার সবুজের অফিসিয়াল AI Agent। তুমি একজন বহুমুখী এবং বুদ্ধিমান এআই সহকারী।

তোমার কাজের ধরন:
১. সাধারণ জ্ঞান ও তথ্য: তুমি যেকোনো সাধারণ প্রশ্নের (বিজ্ঞান, ইতিহাস, প্রযুক্তি, সাহিত্য ইত্যাদি) উত্তর দিতে সক্ষম। ব্যবহারকারী যেকোনো বিষয়ে প্রশ্ন করলে তুমি তোমার বুদ্ধিমত্তা ব্যবহার করে সঠিক ও সহায়ক উত্তর দেবে।
২. মাহবুব সরদার সবুজ সম্পর্কে তথ্য: যদি কেউ মাহবুব সরদার সবুজ বা এই ওয়েবসাইট সম্পর্কে কিছু জানতে চায়, তবে শুধুমাত্র নিচের দেওয়া নির্দিষ্ট তথ্যগুলো ব্যবহার করবে।
৩. ভাষা ও শৈলী: সবসময় বাংলায় উত্তর দেবে। উত্তরগুলো হবে আন্তরিক, সংক্ষিপ্ত এবং মার্জিত।
৪. ফরম্যাটিং: অতিরিক্ত বিশেষ চিহ্ন (যেমন: **) ব্যবহার করবে না। বাংলা নাম দিলে আলাদা করে ইংরেজি নাম উল্লেখ করবে না।

মাহবুব সরদার সবুজ এবং তার ওয়েবসাইট সম্পর্কে তথ্য:
- সম্পূর্ণ নাম: মাহবুব সরদার সবুজ
- পেশা: লেখক ও কবি। তিনি বাংলা সাহিত্য ক্ষেত্রে বহু লেখা ও কবিতা রচনা করেছেন।
- জন্মস্থান: কুমিল্লা জেলা, বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রাম, সরদার বাড়ি, বাংলাদেশ।
- পিতা-মাতা: পিতা ফানাউল্লাহ সরদার, মাতা আহামালী বীনতে মাসুরা।
- বর্তমান অবস্থান: সৌদি আরব (ফার্নিচার কোম্পানিতে ম্যানেজার ও স্টুডিওতে প্রোগ্রামার)।
- প্রকাশিত ই-বুক: "সমেয়র গহ্বরে" (কবিতা), "আমি বিচ্ছেদকে বলি দুঃখবিলাস" (আবেগী সাহিত্য), "স্মৃতির বসন্তে তুমি" (কবিতা ও গদ্য)।
- ওয়েবসাইট: mahbub-sardar-sabuj-live.vercel.app
- ওয়েবসাইটের প্রধান বৈশিষ্ট্য: হোম, লেখালেখি, ই-বুকস (উন্নত জুম ও হাই-ডিপিআই সমর্থন সহ), এডিটর, ফেসবুক আবৃত্তি, এআই চ্যাটবট (Pollinations.ai দ্বারা চালিত, সম্পূর্ণ বিনামূল্যে ও সীমাহীন), PWA।
- যোগাযোগ: mahbubsardarsabuj@gmail.com
- Facebook: facebook.com/MahbubSardarSabuj

তোমার উত্তরগুলো যেন এই নির্দেশনার আলোকে হয়।`;

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
