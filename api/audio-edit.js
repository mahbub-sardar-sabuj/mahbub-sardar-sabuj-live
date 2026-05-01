/**
 * /api/audio-edit — AI-powered audio editing instruction parser
 *
 * This endpoint:
 * 1. Receives a Bengali/English instruction text
 * 2. Uses AI to parse it into structured audio editing parameters
 * 3. Returns JSON with the parameters for the frontend to apply via Web Audio API
 *
 * The actual audio processing happens in the browser (client-side) using Web Audio API.
 * This avoids the Vercel 50MB function size limit that ffmpeg-static would exceed.
 */

export const config = {
  api: {
    bodyParser: true,
    responseLimit: "1mb",
  },
};

// ── AI config ─────────────────────────────────────────────────────────────────
function resolveAiConfig() {
  const chatbotKey = process.env.CHATBOT_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const forgeKey = process.env.BUILT_IN_FORGE_API_KEY?.trim();
  const forgeUrl = process.env.BUILT_IN_FORGE_API_URL?.trim();

  if (chatbotKey) {
    const isOR = chatbotKey.startsWith("sk-or-");
    return {
      apiKey: chatbotKey,
      baseUrl: process.env.CHATBOT_BASE_URL?.trim() || (isOR ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1"),
      model: process.env.CHATBOT_MODEL?.trim() || (isOR ? "openai/gpt-4.1-mini" : "gpt-4.1-mini"),
    };
  }
  if (openAiKey) {
    return {
      apiKey: openAiKey,
      baseUrl: process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini",
    };
  }
  if (forgeKey && forgeUrl) {
    return { apiKey: forgeKey, baseUrl: forgeUrl.replace(/\/$/, ""), model: "gemini-2.5-flash" };
  }
  return null;
}

// ── Parse Bengali/English instruction → structured audio params ───────────────
const AUDIO_SYSTEM_PROMPT = `তুমি একটি অডিও এডিটিং AI। ব্যবহারকারী বাংলায় বা ইংরেজিতে অডিও এডিটিং নির্দেশ দেবে।
শুধুমাত্র একটি JSON অবজেক্ট রিটার্ন করো — অন্য কোনো টেক্সট নয়।

JSON ফরম্যাট:
{
  "volume": <0.1 to 5.0, default 1.0>,
  "trimStart": <seconds from start, 0 if no trim>,
  "trimEnd": <seconds from end to cut, 0 if no trim>,
  "fadeIn": <fade in duration seconds, 0 if none>,
  "fadeOut": <fade out duration seconds, 0 if none>,
  "speed": <0.25 to 4.0, default 1.0>,
  "bassBoost": <-20 to 20 dB, default 0>,
  "trebleBoost": <-20 to 20 dB, default 0>,
  "reverse": <true/false>,
  "normalize": <true/false>,
  "outputFormat": "mp3" | "wav" | "ogg",
  "description": "<বাংলায় সংক্ষিপ্ত বর্ণনা>"
}

উদাহরণ:
- ভলিউম ২ গুণ বাড়াও → volume: 2.0
- ভলিউম কমাও → volume: 0.5
- নয়েজ রিমুভ / নয়েজ কমাও → normalize: true, bassBoost: -3, trebleBoost: -2
- ফেড ইন ৩ সেকেন্ড → fadeIn: 3
- ফেড আউট ২ সেকেন্ড → fadeOut: 2
- বেস বাড়াও → bassBoost: 8
- ট্রেবল বাড়াও → trebleBoost: 6
- গতি ১.৫ গুণ বাড়াও → speed: 1.5
- ধীর করো → speed: 0.75
- উল্টো করো / রিভার্স → reverse: true
- নরমালাইজ করো → normalize: true
- প্রথম ১০ সেকেন্ড কাটো → trimStart: 10
- শেষ ৫ সেকেন্ড কাটো → trimEnd: 5
- স্বয়ংক্রিয় মান উন্নত → normalize: true, volume: 1.2
- WAV তে রূপান্তর → outputFormat: "wav"

নিয়ম: শুধু valid JSON, কোনো markdown নয়।`;

async function parseInstruction(instruction) {
  const cfg = resolveAiConfig();
  if (!cfg) throw new Error("AI config not found");

  const url = cfg.baseUrl.endsWith("/chat/completions")
    ? cfg.baseUrl
    : cfg.baseUrl.endsWith("/v1")
    ? `${cfg.baseUrl}/chat/completions`
    : `${cfg.baseUrl}/v1/chat/completions`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.apiKey}` },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: "system", content: AUDIO_SYSTEM_PROMPT },
        { role: "user", content: `নির্দেশ: ${instruction}` },
      ],
      max_tokens: 300,
      temperature: 0.1,
    }),
  });

  if (!resp.ok) throw new Error(`AI API ${resp.status}: ${await resp.text().catch(() => "")}`);
  const data = await resp.json();
  const raw = data.choices?.[0]?.message?.content?.trim() || "{}";
  const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(cleaned);
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { instruction } = req.body || {};

    if (!instruction || !instruction.trim()) {
      return res.status(400).json({ error: "instruction প্রয়োজন" });
    }

    let params;
    try {
      params = await parseInstruction(instruction.trim());
    } catch (aiErr) {
      return res.status(500).json({ error: "AI নির্দেশ বিশ্লেষণে সমস্যা", details: aiErr.message });
    }

    // Return structured params for client-side processing
    return res.status(200).json({
      success: true,
      params: {
        volume: params.volume ?? 1.0,
        trimStart: params.trimStart ?? 0,
        trimEnd: params.trimEnd ?? 0,
        fadeIn: params.fadeIn ?? 0,
        fadeOut: params.fadeOut ?? 0,
        speed: params.speed ?? 1.0,
        bassBoost: params.bassBoost ?? 0,
        trebleBoost: params.trebleBoost ?? 0,
        reverse: params.reverse ?? false,
        normalize: params.normalize ?? false,
        outputFormat: params.outputFormat ?? "mp3",
      },
      description: params.description || "অডিও এডিটিং প্যারামিটার প্রস্তুত।",
    });

  } catch (err) {
    console.error("audio-edit handler error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
