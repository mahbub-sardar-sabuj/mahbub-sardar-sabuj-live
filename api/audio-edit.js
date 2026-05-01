/**
 * /api/audio-edit — AI-powered audio editing instruction parser (v2.0)
 *
 * এই endpoint:
 * 1. বাংলা/ইংরেজি নির্দেশ গ্রহণ করে
 * 2. AI দিয়ে নির্দেশের অন্তর্নিহিত উদ্দেশ্য বিশ্লেষণ করে structured params তৈরি করে
 * 3. Frontend-এ Web Audio API দিয়ে প্রসেস করার জন্য JSON রিটার্ন করে
 *
 * নতুন ফিচার (v2.0):
 * - Intent-based processing: অস্পষ্ট নির্দেশ বুঝে সম্পূর্ণ প্রসেসিং সিদ্ধান্ত নেওয়া
 * - Smart presets: podcast, voice, music, social media অনুযায়ী অটো-সেটিং
 * - Noise reduction: normalize + EQ দিয়ে noise reduction effect
 * - Voice enhancement: clarity, warmth, presence বাড়ানো
 * - Volume leveling: dynamic range compression simulation
 * - Detailed summary: কী কী পরিবর্তন হলো তার বিস্তারিত বাংলা বিবরণ
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

// ── উন্নত AI System Prompt v3.0 — Proportional, artifact-free audio engineering ──
const AUDIO_SYSTEM_PROMPT = `তুমি একজন বিশেষজ্ঞ সাউন্ড ইঞ্জিনিয়ার AI। তোমার কাজ হলো ব্যবহারকারীর নির্দেশের অন্তর্নিহিত উদ্দেশ্য বুঝে সম্পূর্ণ ও পরিশীলিত অডিও প্রসেসিং প্যারামিটার নির্ধারণ করা।

⚠️ গুরুত্বপূর্ণ: Artifact-free processing নিশ্চিত করতে নিচের সীমা মেনে চলো:
- noiseReduction: সর্বোচ্চ 0.6 (বেশি দিলে zipper/metallic noise হয়)
- midBoost: সর্বোচ্চ ±5 dB (বেশি দিলে harshness হয়)
- trebleBoost: সর্বোচ্চ ±6 dB
- bassBoost: সর্বোচ্চ ±8 dB
- volume: সর্বোচ্চ 2.0 (বেশি দিলে clipping হয়)
- EQ পরিবর্তন সবসময় proportional ও gentle রাখো

মূল নীতি:
- শুধু নির্দিষ্ট কমান্ড নয়, উদ্দেশ্য বোঝো
- "আরো নয়েজ কমাও" মানে noiseReduction আগের চেয়ে একটু বাড়াও (0.4 থেকে 0.55)
- "আরো" বা "আরও" শব্দ থাকলে incremental change করো, সব max-এ দিও না
- অস্পষ্ট নির্দেশে সবচেয়ে যুক্তিসঙ্গত ও উপকারী সিদ্ধান্ত নাও

শুধুমাত্র একটি JSON অবজেক্ট রিটার্ন করো — কোনো markdown, কোনো ব্যাখ্যা নয়।

JSON ফরম্যাট:
{
  "intent": "<clean|enhance|podcast|music|social|trim|volume|speed|custom>",
  "volume": <0.1 to 2.0, default 1.0>,
  "trimStart": <seconds, 0 if none>,
  "trimEnd": <seconds, 0 if none>,
  "trimSilence": <true/false>,
  "fadeIn": <seconds, 0 if none>,
  "fadeOut": <seconds, 0 if none>,
  "speed": <0.5 to 2.0, default 1.0>,
  "bassBoost": <-8 to 8 dB, default 0>,
  "trebleBoost": <-6 to 6 dB, default 0>,
  "midBoost": <-5 to 5 dB, default 0>,
  "noiseReduction": <0 to 0.6, default 0 — 0=off, 0.3=gentle, 0.6=strong>,
  "voiceEnhancement": <true/false>,
  "normalize": <true/false>,
  "dynamicCompression": <true/false>,
  "reverse": <true/false>,
  "appliedSteps": ["step1", "step2", ...],
  "description": "<বাংলায় সংক্ষিপ্ত বর্ণনা>"
}

Presets (artifact-free values):

"clean" (পরিষ্কার / নয়েজ কমাও / clear):
→ noiseReduction:0.45, normalize:true, dynamicCompression:true, trebleBoost:1.5, midBoost:2, bassBoost:-1, fadeIn:0.3, fadeOut:0.5

"enhance" (সুন্দর / ভালো / মান উন্নত / voice enhance):
→ voiceEnhancement:true, noiseReduction:0.35, normalize:true, dynamicCompression:true, midBoost:3, trebleBoost:2, bassBoost:1, fadeIn:0.2, fadeOut:0.3

"podcast" (পডকাস্ট / radio / broadcast):
→ voiceEnhancement:true, noiseReduction:0.5, normalize:true, dynamicCompression:true, midBoost:4, trebleBoost:1.5, bassBoost:-2, trimSilence:true, fadeIn:0.5, fadeOut:1.0

"music" (গান / music / মিউজিক):
→ normalize:true, dynamicCompression:false, bassBoost:4, trebleBoost:2, midBoost:0, fadeIn:1.0, fadeOut:2.0

"social" (সোশ্যাল মিডিয়া / facebook / youtube / reels):
→ voiceEnhancement:true, noiseReduction:0.4, normalize:true, dynamicCompression:true, volume:1.15, midBoost:3, trebleBoost:2, trimSilence:true, fadeIn:0.2, fadeOut:0.5

Incremental examples:
- "আরো নয়েজ কমাও" → noiseReduction:0.55 (not 1.0)
- "আরো ভলিউম বাড়াও" → volume:1.4 (not 3.0)
- "আরো বেস বাড়াও" → bassBoost:5
- "একটু ট্রেবল বাড়াও" → trebleBoost:2
- "ভলিউম ২ গুণ" → volume:2.0
- "ফেড ইন ৩ সেকেন্ড" → fadeIn:3
- "গতি ১.৫ গুণ" → speed:1.5
- "প্রথম ১০ সেকেন্ড কাটো" → trimStart:10

appliedSteps বাংলায়, সংক্ষিপ্ত:
["নয়েজ কমানো হয়েছে", "কণ্ঠ উজ্জ্বল করা হয়েছে", "ভলিউম সমান করা হয়েছে"]

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
      max_tokens: 600,
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
      intent: params.intent || "custom",
      params: {
        volume: params.volume ?? 1.0,
        trimStart: params.trimStart ?? 0,
        trimEnd: params.trimEnd ?? 0,
        trimSilence: params.trimSilence ?? false,
        fadeIn: params.fadeIn ?? 0,
        fadeOut: params.fadeOut ?? 0,
        speed: params.speed ?? 1.0,
        bassBoost: params.bassBoost ?? 0,
        trebleBoost: params.trebleBoost ?? 0,
        midBoost: params.midBoost ?? 0,
        noiseReduction: params.noiseReduction ?? 0,
        voiceEnhancement: params.voiceEnhancement ?? false,
        normalize: params.normalize ?? false,
        dynamicCompression: params.dynamicCompression ?? false,
        reverse: params.reverse ?? false,
        outputFormat: params.outputFormat ?? "wav",
      },
      appliedSteps: params.appliedSteps || [],
      description: params.description || "অডিও প্রসেসিং সম্পন্ন হয়েছে।",
    });

  } catch (err) {
    console.error("audio-edit handler error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
