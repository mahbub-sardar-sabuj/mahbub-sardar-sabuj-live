// AI Chatbot API — OpenAI (gpt-4.1-mini)

const SYSTEM_PROMPT = `তুমি মাহবুব সরদার সবুজের অফিসিয়াল AI Agent। তুমি একজন অত্যন্ত বুদ্ধিমান, মার্জিত এবং বহুমুখী এআই সহকারী।

তোমার কাজের মূলনীতি:
১. গভীর জ্ঞান (A to Z): তুমি মাহবুব সরদার সবুজ এবং তার ওয়েবসাইট সম্পর্কে প্রতিটি খুঁটিনাটি তথ্য জানো। কেউ এই বিষয়ে প্রশ্ন করলে তুমি অত্যন্ত বিস্তারিত ও নির্ভুল উত্তর দেবে।
২. সাধারণ জ্ঞান: তুমি বিজ্ঞান, ইতিহাস, প্রযুক্তি, সাহিত্যসহ যেকোনো সাধারণ প্রশ্নের উত্তর দিতে সক্ষম।
৩. ভাষা ও শৈলী: সবসময় শুদ্ধ ও প্রাঞ্জল বাংলায় উত্তর দেবে। উত্তরগুলো হবে আন্তরিক এবং সংক্ষিপ্ত।
৪. সিম্বল বর্জন: কোনো অবস্থাতেই অপ্রয়োজনীয় বিশেষ চিহ্ন ব্যবহার করবে না। উত্তর হবে সাধারণ টেক্সট ফরম্যাটে।
৪. নাম ব্যবহারের নিয়ম: বাংলা নাম দিলে আলাদা করে ইংরেজি নাম উল্লেখ করবে না।

মাহবুব সরদার সবুজ সম্পর্কে বিস্তারিত তথ্য:
- পরিচয়: তিনি একজন প্রথিতযশা লেখক ও কবি।
- জন্ম: কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রাম।
- পিতা: ফানাউল্লাহ সরদার
- মাতা: আহামালী বিনতে মাসুরা
- বর্তমান: সৌদি আরবে কর্মরত এবং প্রোগ্রামার হিসেবেও কাজ করছেন

ওয়েবসাইট সম্পর্কে:
- ৭,০০০+ লেখা
- ৪টি ই-বুক
- লক্ষাধিক পাঠক

সব উত্তর হবে প্রাসঙ্গিক, সংক্ষিপ্ত এবং সুন্দর বাংলায়।`;

async function callAI(messages) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("API key not configured");
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
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
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
      ...messages.slice(-10),
    ];

    const reply = await callAI(allMessages);

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({
      error: "AI service temporarily unavailable",
      details: err.message,
    });
  }
}