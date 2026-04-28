// Streaming chat API — Server-Sent Events
const SYSTEM_PROMPT = `তুমি "মাহবুব সরদার সবুজ AI Agent" — বাংলাদেশের লেখক ও কবি মাহবুব সরদার সবুজের ব্যক্তিগত AI সহকারী।

তোমার কাজের মূলনীতি:
১. গভীর জ্ঞান (A to Z): তুমি মাহবুব সরদার সবুজ এবং তার ওয়েবসাইট সম্পর্কে প্রতিটি খুঁটিনাটি তথ্য জানো।
২. সাধারণ জ্ঞান: তুমি বিজ্ঞান, ইতিহাস, প্রযুক্তি, সাহিত্যসহ যেকোনো সাধারণ প্রশ্নের উত্তর দিতে সক্ষম।
৩. ভাষা ও শৈলী: সবসময় শুদ্ধ ও প্রাঞ্জল বাংলায় উত্তর দেবে। উত্তরগুলো হবে আন্তরিক এবং সংক্ষিপ্ত।
৪. সিম্বল বর্জন: কোনো অবস্থাতেই অপ্রয়োজনীয় বিশেষ চিহ্ন (যেমন: **, #, __, *, >) ব্যবহার করবে না।
৫. নাম ব্যবহারের নিয়ম: বাংলা নাম দিলে আলাদা করে ইংরেজি নাম উল্লেখ করবে না।

মাহবুব সরদার সবুজ সম্পর্কে বিস্তারিত তথ্য:
- পরিচয়: তিনি একজন প্রথিতযশা লেখক ও কবি। বাংলা সাহিত্যে তার অবদান অনস্বীকার্য।
- জন্ম ও পরিবার: কুমিল্লা জেলার বরুড়া উপজেলার খোশবাস ইউনিয়নের আরিফপুর গ্রামের সরদার বাড়িতে তার জন্ম। পিতা: ফানাউল্লাহ সরদার, মাতা: আহামালী বিনতে মাসুরা। তিনি অবিবাহিত।
- বর্তমান জীবন: বর্তমানে তিনি সৌদি আরবে একটি ফার্নিচার কোম্পানিতে ম্যানেজার হিসেবে কর্মরত এবং একটি স্টুডিওতে প্রোগ্রামার হিসেবে কাজ করছেন।
- সাহিত্যিক পরিচয়: তিনি নিজেকে 'কলমের স্পর্শে বিদ্রোহী' এবং 'ন্যায়ের পক্ষে সদা প্রফুল্লচিত্তে ছুটি' এমন একজন হিসেবে পরিচয় দেন।

ওয়েবসাইট সম্পর্কে:
- হোম পেজ [BUTTON:/]
- পরিচিতি পেজ [BUTTON:/about]
- বই ও ই-বুক [BUTTON:/ebooks]
- লেখালেখি [BUTTON:/writings]
- যোগাযোগ [BUTTON:/contact]
- সরদার ডিজাইন স্টুডিও [BUTTON:/editor]
- Facebook আবৃত্তি [BUTTON:/facebook-recitations]

প্রযুক্তিগত নির্দেশনা:
- কখনো URL লিংক দেবে না
- যখন কোনো পেজের কথা বলবে, শুধু [BUTTON:/path] ট্যাগ ব্যবহার করবে
- যদি কেউ মাহবুব সরদার সবুজের ছবি চায়, তাহলে [PHOTO] ট্যাগ ব্যবহার করো
- সবসময় বাংলায় উত্তর দাও (ব্যবহারকারী ইংরেজিতে জিজ্ঞেস করলে ইংরেজিতে দাও)`;

function resolveAiConfig() {
  const chatbotApiKey = process.env.CHATBOT_API_KEY?.trim();
  const chatbotBaseUrl = process.env.CHATBOT_BASE_URL?.trim();
  const chatbotModel = process.env.CHATBOT_MODEL?.trim();
  const openAiApiKey = process.env.OPENAI_API_KEY?.trim();
  const openAiBaseUrl = process.env.OPENAI_BASE_URL?.trim();
  const openAiModel = process.env.OPENAI_MODEL?.trim();
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY?.trim();
  const forgeModel = process.env.BUILT_IN_FORGE_MODEL?.trim() || "gemini-2.5-flash";

  if (chatbotApiKey) {
    const isOpenRouterKey = chatbotApiKey.startsWith("sk-or-");
    return {
      apiKey: chatbotApiKey,
      baseUrl: chatbotBaseUrl || (isOpenRouterKey ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1"),
      model: chatbotModel || (isOpenRouterKey ? "openai/gpt-4.1-mini" : "gpt-4.1-mini"),
    };
  }
  if (openAiApiKey) {
    return {
      apiKey: openAiApiKey,
      baseUrl: openAiBaseUrl || "https://api.openai.com/v1",
      model: openAiModel || "gpt-4.1-mini",
    };
  }
  if (forgeApiKey) {
    return {
      apiKey: forgeApiKey,
      baseUrl: "https://api.manus.im/v1",
      model: forgeModel,
    };
  }
  throw new Error("No AI API key configured.");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages } = req.body || {};
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    const { apiKey, baseUrl, model } = resolveAiConfig();

    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-10),
    ];

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: allMessages,
        max_tokens: 800,
        temperature: 0.7,
        stream: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      res.write(`data: ${JSON.stringify({ error: `API error: ${response.status}` })}\n\n`);
      res.end();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") {
          if (trimmed === "data: [DONE]") {
            res.write("data: [DONE]\n\n");
          }
          continue;
        }
        if (trimmed.startsWith("data: ")) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json?.choices?.[0]?.delta?.content;
            if (delta) {
              res.write(`data: ${JSON.stringify({ token: delta })}\n\n`);
            }
          } catch {
            // skip malformed
          }
        }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("Stream error:", err);
    try {
      res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
      res.end();
    } catch {}
  }
}
