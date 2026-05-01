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

// ── উন্নত AI System Prompt — Intent-based audio engineering ──────────────────
const AUDIO_SYSTEM_PROMPT = `তুমি একজন বিশেষজ্ঞ সাউন্ড ইঞ্জিনিয়ার AI। তোমার কাজ হলো ব্যবহারকারীর নির্দেশের অন্তর্নিহিত উদ্দেশ্য বুঝে সম্পূর্ণ ও পরিশীলিত অডিও প্রসেসিং প্যারামিটার নির্ধারণ করা।

গুরুত্বপূর্ণ নীতি:
- শুধু নির্দিষ্ট কমান্ড নয়, উদ্দেশ্য বোঝো। "পরিষ্কার করো" মানে শুধু নয়েজ কমানো নয় — পুরো মান উন্নত করা।
- "সুন্দর শোনাতে হবে" মানে voice enhancement + EQ + normalization + gentle compression।
- "পডকাস্টের জন্য তৈরি করো" মানে podcast preset: voice clarity + noise reduction + consistent volume।
- অস্পষ্ট নির্দেশে সবচেয়ে যুক্তিসঙ্গত ও উপকারী সিদ্ধান্ত নাও।

শুধুমাত্র একটি JSON অবজেক্ট রিটার্ন করো — কোনো markdown, কোনো ব্যাখ্যা নয়।

JSON ফরম্যাট:
{
  "intent": "<detected_intent: clean|enhance|podcast|music|social|trim|convert|custom>",
  "volume": <0.1 to 3.0, default 1.0>,
  "trimStart": <seconds from start to cut, 0 if none>,
  "trimEnd": <seconds from end to cut, 0 if none>,
  "trimSilence": <true/false — remove silence from start/end>,
  "fadeIn": <fade in duration seconds, 0 if none>,
  "fadeOut": <fade out duration seconds, 0 if none>,
  "speed": <0.5 to 2.0, default 1.0>,
  "bassBoost": <-15 to 15 dB, default 0>,
  "trebleBoost": <-15 to 15 dB, default 0>,
  "midBoost": <-10 to 10 dB, default 0 — voice presence frequency>,
  "noiseReduction": <0 to 1.0, 0=none, 0.5=moderate, 1.0=aggressive>,
  "voiceEnhancement": <true/false — boost voice clarity and warmth>,
  "normalize": <true/false — peak normalization>,
  "dynamicCompression": <true/false — even out volume levels>,
  "reverse": <true/false>,
  "outputFormat": "mp3" | "wav" | "ogg",
  "appliedSteps": ["<step1>", "<step2>", ...],
  "description": "<বাংলায় বিস্তারিত বর্ণনা — কী কী পরিবর্তন করা হয়েছে>"
}

Intent-based presets (এগুলো অনুসরণ করো):

"clean" (পরিষ্কার করো / noise কমাও / clear করো):
→ noiseReduction: 0.7, normalize: true, dynamicCompression: true, trebleBoost: 2, midBoost: 3, bassBoost: -2, fadeIn: 0.3, fadeOut: 0.5

"enhance" (সুন্দর করো / ভালো শোনাতে হবে / মান উন্নত করো / ভয়েস এনহ্যান্স):
→ voiceEnhancement: true, noiseReduction: 0.5, normalize: true, dynamicCompression: true, midBoost: 4, trebleBoost: 3, bassBoost: 1, fadeIn: 0.2, fadeOut: 0.3

"podcast" (পডকাস্ট / podcast ready / রেডিও):
→ voiceEnhancement: true, noiseReduction: 0.8, normalize: true, dynamicCompression: true, midBoost: 5, trebleBoost: 2, bassBoost: -3, trimSilence: true, fadeIn: 0.5, fadeOut: 1.0

"music" (গান / music / মিউজিক):
→ normalize: true, dynamicCompression: false, bassBoost: 3, trebleBoost: 2, midBoost: 1, fadeIn: 1.0, fadeOut: 2.0

"social" (সোশ্যাল মিডিয়া / ফেসবুক / ইউটিউব / রিলস / shorts):
→ voiceEnhancement: true, noiseReduction: 0.6, normalize: true, dynamicCompression: true, volume: 1.2, midBoost: 4, trebleBoost: 3, trimSilence: true, fadeIn: 0.2, fadeOut: 0.5

উদাহরণ ম্যাপিং:
- "এই অডিওটা পরিষ্কার করে দাও" → intent: "clean"
- "ভয়েসটা সুন্দর শোনাতে হবে" → intent: "enhance"
- "নয়েজ রিমুভ করো" → intent: "clean", noiseReduction: 0.8
- "পডকাস্টের জন্য তৈরি করো" → intent: "podcast"
- "ভলিউম ২ গুণ বাড়াও" → volume: 2.0
- "ফেড ইন ৩ সেকেন্ড" → fadeIn: 3
- "বেস বাড়াও" → bassBoost: 8
- "গতি ১.৫ গুণ" → speed: 1.5
- "প্রথম ১০ সেকেন্ড কাটো" → trimStart: 10
- "WAV তে রূপান্তর" → outputFormat: "wav"
- "স্বয়ংক্রিয়ভাবে মান উন্নত করো" → intent: "enhance" (সব enhance params)

appliedSteps-এ বাংলায় প্রতিটি পদক্ষেপ লেখো, যেমন:
["ব্যাকগ্রাউন্ড নয়েজ দূর করা হয়েছে", "কণ্ঠ পরিষ্কার ও উজ্জ্বল করা হয়েছে", "ভলিউম সমান করা হয়েছে"]

নিয়ম: শুধু valid JSON, কোনো markdown নয়, কোনো অতিরিক্ত টেক্সট নয়।`;

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
