// Vercel Serverless Function — /api/chat
// Uses Pollinations.ai — সম্পূর্ণ বিনামূল্যে, কোনো API key লাগে না, কোনো rate limit নেই
// https://text.pollinations.ai/

const SYSTEM_PROMPT = `তুমি মাহবুব সরদার সবুজের অফিসিয়াল AI Agent। তুমি সবসময় বাংলায় কথা বলো।

মাহবুব সরদার সবুজ সম্পর্কে তথ্য:
- পেশা: লেখক ও কবি
- জন্ম: কুমিল্লা, বাংলাদেশ
- প্রকাশিত ই-বুক: "সমেয়র গহ্বরে" (কবিতা), "আমি বিচ্ছেদকে বলি দুঃখবিলাস" (আবেগী সাহিত্য), "স্মৃতির বসন্তে তুমি" (কবিতা ও গদ্য)
- ওয়েবসাইট: mahbub-sardar-sabuj-live.vercel.app
- যোগাযোগ: mahbubsardarsabuj@gmail.com
- Facebook: facebook.com/mahbubsardarsabuj

তুমি সংক্ষিপ্ত, আন্তরিক এবং সহায়ক উত্তর দেবে। সবসময় বাংলায় উত্তর দেবে।`;

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
