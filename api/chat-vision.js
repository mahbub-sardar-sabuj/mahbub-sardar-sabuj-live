/**
 * /api/chat-vision — AI Vision endpoint
 * Accepts an image (base64) + optional text prompt
 * Uses GPT-4o vision capability to analyze the image
 */

function resolveAiConfig() {
  const chatbotApiKey = process.env.CHATBOT_API_KEY?.trim();
  const chatbotBaseUrl = process.env.CHATBOT_BASE_URL?.trim();
  const openAiApiKey = process.env.OPENAI_API_KEY?.trim();
  const openAiBaseUrl = process.env.OPENAI_BASE_URL?.trim();
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY?.trim();
  const forgeBaseUrl = process.env.BUILT_IN_FORGE_API_URL?.trim();

  if (chatbotApiKey) {
    const isOpenRouter = chatbotApiKey.startsWith("sk-or-");
    return {
      apiKey: chatbotApiKey,
      baseUrl: chatbotBaseUrl || (isOpenRouter ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1"),
      model: isOpenRouter ? "openai/gpt-4o" : "gpt-4o",
    };
  }
  if (openAiApiKey) {
    return {
      apiKey: openAiApiKey,
      baseUrl: openAiBaseUrl || "https://api.openai.com/v1",
      model: "gpt-4o",
    };
  }
  if (forgeApiKey && forgeBaseUrl) {
    return {
      apiKey: forgeApiKey,
      baseUrl: forgeBaseUrl,
      model: "gemini-2.5-flash",
    };
  }
  throw new Error("No AI API key configured.");
}

const VISION_SYSTEM_PROMPT = `তুমি "মাহবুব সরদার সবুজ AI Agent" — একজন বহুমুখী AI সহকারী যিনি ছবি বিশ্লেষণ করতে পারেন।

ছবি বিশ্লেষণের নিয়ম:
১. ছবিতে কী আছে তা বিস্তারিত বাংলায় বর্ণনা করো।
২. ছবির বিষয়বস্তু, রং, আলো, পরিবেশ, মানুষ বা বস্তু সম্পর্কে বলো।
৩. যদি ছবিতে লেখা থাকে, তা পড়ে জানাও।
৪. যদি ছবিতে কোনো সমস্যা বা অস্বাভাবিক বিষয় থাকে, তা উল্লেখ করো।
৫. সহজ, পরিষ্কার ও প্রাঞ্জল বাংলায় উত্তর দাও।
৬. ব্যবহারকারী যদি ইংরেজিতে প্রশ্ন করে, ইংরেজিতে উত্তর দাও।
৭. অপ্রয়োজনীয় ইমোজি বা বিশেষ চিহ্ন ব্যবহার করবে না।`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { image, mimeType = "image/jpeg", prompt = "এই ছবিটি বিশ্লেষণ করুন এবং বাংলায় বিস্তারিত বলুন।" } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Validate base64 size (max ~8MB base64 = ~6MB image)
    if (image.length > 11_000_000) {
      return res.status(400).json({ error: "Image too large. Maximum 8MB allowed." });
    }

    const { apiKey, baseUrl, model } = resolveAiConfig();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      // Build the message with image
      const messages = [
        { role: "system", content: VISION_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${image}`,
                detail: "high",
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ];

      const normalizedBase = (baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
      const chatUrl = normalizedBase.endsWith("/chat/completions")
        ? normalizedBase
        : normalizedBase.endsWith("/v1")
          ? `${normalizedBase}/chat/completions`
          : `${normalizedBase}/v1/chat/completions`;

      const response = await fetch(chatUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 1000,
          temperature: 0.5,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        console.error("Vision API error:", response.status, errText.slice(0, 300));

        // If model doesn't support vision, return helpful message
        if (response.status === 400 || response.status === 422) {
          return res.status(200).json({
            reply: "দুঃখিত, বর্তমান AI মডেলটি ছবি বিশ্লেষণ সমর্থন করে না। ছবি সম্পর্কে আপনার প্রশ্নটি টেক্সটে লিখুন।",
          });
        }

        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content || content.trim() === "") {
        throw new Error("Empty response from Vision API");
      }

      return res.status(200).json({ reply: content.trim() });

    } catch (err) {
      clearTimeout(timeoutId);

      if (err?.name === "AbortError") {
        return res.status(200).json({
          reply: "ছবি বিশ্লেষণে সময় বেশি লাগছে। অনুগ্রহ করে ছোট ছবি দিয়ে আবার চেষ্টা করুন।",
        });
      }

      throw err;
    }

  } catch (err) {
    console.error("Vision handler error:", err);
    return res.status(500).json({
      error: "Vision service temporarily unavailable.",
      details: err.message,
    });
  }
}
