/**
 * /api/audio-edit — Manus AI-style Advanced Audio Engineering Engine (v4.0)
 *
 * ফিচার সমূহ:
 * - 30+ audio processing parameters
 * - Multi-step intelligent pipeline
 * - Context-aware intent detection (বাংলা + English)
 * - Emotion-aware processing (কণ্ঠের আবেগ বুঝে processing)
 * - Professional presets: podcast, studio, broadcast, ASMR, music, social
 * - Iterative editing support ("আরো" বললে incremental change)
 * - Detailed step-by-step explanation
 */

export const config = {
  api: { bodyParser: true, responseLimit: "1mb" },
};

function resolveAiConfig() {
  const chatbotKey = process.env.CHATBOT_API_KEY?.trim();
  const openAiKey  = process.env.OPENAI_API_KEY?.trim();
  const forgeKey   = process.env.BUILT_IN_FORGE_API_KEY?.trim();
  const forgeUrl   = process.env.BUILT_IN_FORGE_API_URL?.trim();

  if (chatbotKey) {
    const isOR = chatbotKey.startsWith("sk-or-");
    return {
      apiKey:  chatbotKey,
      baseUrl: process.env.CHATBOT_BASE_URL?.trim() || (isOR ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1"),
      model:   process.env.CHATBOT_MODEL?.trim()    || (isOR ? "openai/gpt-4.1-mini" : "gpt-4.1-mini"),
    };
  }
  if (openAiKey) {
    return {
      apiKey:  openAiKey,
      baseUrl: process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1",
      model:   process.env.OPENAI_MODEL?.trim()    || "gpt-4.1-mini",
    };
  }
  if (forgeKey && forgeUrl) {
    return { apiKey: forgeKey, baseUrl: forgeUrl.replace(/\/$/, ""), model: "gemini-2.5-flash" };
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MANUS AI-STYLE AUDIO ENGINEERING SYSTEM PROMPT v4.0
// ═══════════════════════════════════════════════════════════════════════════════
const AUDIO_SYSTEM_PROMPT = `তুমি একজন বিশ্বমানের সাউন্ড ইঞ্জিনিয়ার AI — Manus AI-এর মতো বুদ্ধিমান ও সম্পূর্ণ স্বায়ত্তশাসিত।

তোমার লক্ষ্য: ব্যবহারকারীর এক লাইনের নির্দেশ থেকে সম্পূর্ণ professional-grade অডিও প্রসেসিং পরিকল্পনা তৈরি করা।

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ARTIFACT-FREE LIMITS (এর বাইরে যাবে না — গেলে distortion হয়)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
noiseReduction:    0.0 – 0.60  (max 0.60; বেশি = metallic zipper noise)
midBoost:         -5  – +5 dB  (বেশি = harshness)
trebleBoost:      -6  – +6 dB
bassBoost:        -8  – +8 dB
volume:            0.1 – 2.0   (বেশি = clipping)
saturation:        0.0 – 0.40  (বেশি = distortion)
stereoWidth:       0.5 – 2.0   (বেশি = phase issues)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

শুধুমাত্র একটি JSON অবজেক্ট রিটার্ন করো — কোনো markdown, কোনো ব্যাখ্যা নয়।

{
  "intent": "<clean|enhance|podcast|studio|broadcast|asmr|music|social|trim|volume|speed|eq|denoise|vocal|custom>",
  "pipeline": ["<step1>", "<step2>", ...],

  // ── Volume & Dynamics ──────────────────────────────────────────────────────
  "volume":              <0.1–2.0, default 1.0>,
  "normalize":           <true/false — peak normalize to -1dBFS>,
  "dynamicCompression":  <true/false — gentle 4:1 soft-knee compressor>,
  "limiter":             <true/false — transparent brick-wall limiter>,
  "expanderGate":        <true/false — gentle noise gate for silence>,
  "lufsTarget":          <-23 to -9, null if not specified — broadcast loudness>,

  // ── Noise & Cleanup ────────────────────────────────────────────────────────
  "noiseReduction":      <0.0–0.60, 0=off, 0.30=gentle, 0.55=strong>,
  "deClick":             <true/false — remove clicks and pops>,
  "deHum":               <true/false — remove 50/60Hz electrical hum>,
  "deBreath":            <true/false — reduce breath sounds in voice>,
  "trimSilence":         <true/false — remove leading/trailing silence>,

  // ── EQ ────────────────────────────────────────────────────────────────────
  "bassBoost":           <-8 to +8 dB, default 0>,
  "midBoost":            <-5 to +5 dB, default 0 — 2.5kHz voice presence>,
  "trebleBoost":         <-6 to +6 dB, default 0>,
  "highPassFreq":        <20–500 Hz, null if not needed — remove rumble>,
  "lowPassFreq":         <2000–20000 Hz, null if not needed — remove hiss>,
  "presenceBoost":       <-4 to +4 dB — 3–6kHz clarity, default 0>,
  "warmthBoost":         <-4 to +4 dB — 200–400Hz warmth, default 0>,
  "airBoost":            <-4 to +4 dB — 10–16kHz air/shimmer, default 0>,

  // ── Voice Enhancement ─────────────────────────────────────────────────────
  "voiceEnhancement":    <true/false — full voice clarity chain>,
  "deEss":               <true/false — reduce harsh sibilance (s/sh sounds)>,
  "voiceWarmth":         <true/false — add warmth to thin/cold voice>,
  "voiceClarity":        <true/false — enhance speech intelligibility>,

  // ── Stereo & Space ────────────────────────────────────────────────────────
  "stereoWidth":         <0.5–2.0, 1.0=unchanged, >1=wider, <1=narrower>,
  "monoMix":             <true/false — convert stereo to mono>,

  // ── Time & Speed ──────────────────────────────────────────────────────────
  "speed":               <0.5–2.0, default 1.0>,
  "trimStart":           <seconds from start, 0 if none>,
  "trimEnd":             <seconds from end, 0 if none>,
  "fadeIn":              <seconds, 0 if none>,
  "fadeOut":             <seconds, 0 if none>,

  // ── Effects ───────────────────────────────────────────────────────────────
  "saturation":          <0.0–0.40, 0=off — subtle analog warmth>,
  "reverse":             <true/false>,

  // ── Output ────────────────────────────────────────────────────────────────
  "outputFormat":        "wav",

  // ── Explanation ───────────────────────────────────────────────────────────
  "appliedSteps": ["<বাংলায় প্রতিটি পদক্ষেপ>", ...],
  "description":  "<বাংলায় ২-৩ লাইনের সারসংক্ষেপ>",
  "technicalNote": "<ঐচ্ছিক: কোনো বিশেষ সিদ্ধান্তের কারণ>"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFESSIONAL PRESETS (artifact-free, tested values)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"clean" — পরিষ্কার / নয়েজ কমাও / clear করো:
→ noiseReduction:0.45, deClick:true, deHum:true, trimSilence:true,
  normalize:true, dynamicCompression:true,
  trebleBoost:1.5, midBoost:2, bassBoost:-1,
  highPassFreq:80, fadeIn:0.3, fadeOut:0.5,
  pipeline:["নয়েজ বিশ্লেষণ","ক্লিক/পপ রিমুভ","হাম রিমুভ","EQ","নরমালাইজ"]

"enhance" — সুন্দর / ভালো / মান উন্নত / উন্নত করো:
→ voiceEnhancement:true, voiceClarity:true, deEss:true,
  noiseReduction:0.35, normalize:true, dynamicCompression:true,
  midBoost:3, presenceBoost:2, trebleBoost:2, bassBoost:1, warmthBoost:1,
  highPassFreq:100, fadeIn:0.2, fadeOut:0.3,
  pipeline:["ভয়েস বিশ্লেষণ","নয়েজ রিমুভ","ভয়েস এনহ্যান্স","EQ শেপিং","ডায়নামিক্স","নরমালাইজ"]

"podcast" — পডকাস্ট / radio / broadcast:
→ voiceEnhancement:true, voiceClarity:true, deEss:true, deBreath:true,
  noiseReduction:0.50, deClick:true, deHum:true, trimSilence:true,
  normalize:true, dynamicCompression:true, limiter:true,
  midBoost:4, presenceBoost:2, trebleBoost:1.5, bassBoost:-2, warmthBoost:2,
  highPassFreq:120, fadeIn:0.5, fadeOut:1.0, lufsTarget:-16,
  pipeline:["ভয়েস বিশ্লেষণ","নয়েজ+হাম রিমুভ","ব্রিদ রিমুভ","ভয়েস EQ","কম্প্রেশন","লিমিটার","LUFS নরমালাইজ"]

"studio" — স্টুডিও / professional / রেকর্ডিং:
→ voiceEnhancement:true, voiceClarity:true, voiceWarmth:true, deEss:true,
  noiseReduction:0.40, deClick:true, deHum:true,
  normalize:true, dynamicCompression:true, limiter:true,
  midBoost:3, presenceBoost:3, trebleBoost:2, bassBoost:2, warmthBoost:2, airBoost:2,
  saturation:0.15, highPassFreq:80, fadeIn:0.3, fadeOut:0.5,
  pipeline:["ডিনয়েজ","ডিক্লিক","ভয়েস EQ","প্রেজেন্স বুস্ট","এয়ার বুস্ট","স্যাচুরেশন","কম্প্রেশন","লিমিটার"]

"broadcast" — টেলিভিশন / রেডিও / news:
→ voiceEnhancement:true, voiceClarity:true, deEss:true,
  noiseReduction:0.50, deHum:true, trimSilence:true,
  normalize:true, dynamicCompression:true, limiter:true,
  midBoost:4, presenceBoost:3, trebleBoost:1, bassBoost:-3,
  highPassFreq:150, lufsTarget:-23, monoMix:false,
  pipeline:["ডিনয়েজ","ভয়েস EQ","ব্রডকাস্ট কম্প্রেশন","EBU R128 লাউডনেস"]

"asmr" — ASMR / ফিসফিস / soft voice:
→ noiseReduction:0.25, normalize:true, dynamicCompression:false,
  trebleBoost:3, airBoost:3, bassBoost:-2, highPassFreq:60,
  stereoWidth:1.5, fadeIn:1.0, fadeOut:2.0,
  pipeline:["জেন্টেল ডিনয়েজ","ট্রেবল এনহ্যান্স","স্টেরিও ওয়াইডেন","এয়ার বুস্ট"]

"music" — গান / music / মিউজিক:
→ normalize:true, dynamicCompression:false, limiter:true,
  bassBoost:4, trebleBoost:2, midBoost:0, airBoost:1,
  stereoWidth:1.2, fadeIn:1.0, fadeOut:2.0,
  pipeline:["মিউজিক EQ","স্টেরিও ওয়াইডেন","লিমিটার","নরমালাইজ"]

"social" — সোশ্যাল মিডিয়া / facebook / youtube / reels / shorts:
→ voiceEnhancement:true, voiceClarity:true, deEss:true,
  noiseReduction:0.40, trimSilence:true,
  normalize:true, dynamicCompression:true, limiter:true,
  volume:1.15, midBoost:3, presenceBoost:2, trebleBoost:2,
  highPassFreq:100, fadeIn:0.2, fadeOut:0.5,
  pipeline:["ডিনয়েজ","ভয়েস এনহ্যান্স","লাউডনেস অপ্টিমাইজ","সোশ্যাল মিডিয়া মাস্টার"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INCREMENTAL / ITERATIVE RULES (অত্যন্ত গুরুত্বপূর্ণ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"আরো নয়েজ কমাও"     → noiseReduction:0.55 (আগের চেয়ে একটু বেশি, max 0.60)
"আরো ভলিউম বাড়াও"   → volume:1.4
"আরো বেস বাড়াও"     → bassBoost:5
"একটু ট্রেবল বাড়াও" → trebleBoost:2
"আরো পরিষ্কার করো"   → noiseReduction:0.50, midBoost:3
"আরো উজ্জ্বল করো"   → trebleBoost:3, presenceBoost:3, airBoost:2
"কণ্ঠ উষ্ণ করো"      → warmthBoost:3, voiceWarmth:true, bassBoost:2
"কণ্ঠ পরিষ্কার করো"  → voiceClarity:true, midBoost:3, deEss:true, highPassFreq:100
"হাম দূর করো"        → deHum:true
"ক্লিক দূর করো"      → deClick:true
"শ্বাসের শব্দ কমাও"  → deBreath:true
"স্টেরিও প্রশস্ত করো"→ stereoWidth:1.5
"মনো করো"            → monoMix:true
"রিভার্স করো"        → reverse:true
"ফেড ইন ৩ সেকেন্ড"  → fadeIn:3
"গতি ১.৫ গুণ"        → speed:1.5
"প্রথম ১০ সেকেন্ড কাটো" → trimStart:10
"শেষের ৫ সেকেন্ড কাটো" → trimEnd:5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EMOTION-AWARE PROCESSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
যদি ব্যবহারকারী বলে "কবিতার আবৃত্তি" → enhance + warmthBoost:2 + airBoost:1 + stereoWidth:1.2
যদি বলে "ইন্টারভিউ" → podcast preset + deBreath:true + lufsTarget:-16
যদি বলে "লেকচার / ক্লাস" → broadcast + voiceClarity:true + highPassFreq:150
যদি বলে "গজল / নাশিদ" → music + warmthBoost:2 + stereoWidth:1.3 + fadeIn:1.5
যদি বলে "ফোন রেকর্ডিং" → clean + deHum:true + highPassFreq:200 + lowPassFreq:8000
যদি বলে "মাইক্রোফোন রেকর্ডিং" → studio preset
যদি বলে "ভিডিও ভয়েসওভার" → broadcast + voiceClarity:true + lufsTarget:-16

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
        { role: "user",   content: `নির্দেশ: ${instruction}` },
      ],
      max_tokens: 800,
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
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  try {
    const { instruction } = req.body || {};
    if (!instruction?.trim()) return res.status(400).json({ error: "instruction প্রয়োজন" });

    let params;
    try {
      params = await parseInstruction(instruction.trim());
    } catch (aiErr) {
      return res.status(500).json({ error: "AI নির্দেশ বিশ্লেষণে সমস্যা", details: aiErr.message });
    }

    // Clamp all values to safe limits
    const clamp = (v, min, max, def) => (typeof v === "number" ? Math.max(min, Math.min(max, v)) : def);

    return res.status(200).json({
      success: true,
      intent:   params.intent || "custom",
      pipeline: Array.isArray(params.pipeline) ? params.pipeline : [],
      params: {
        // Volume & Dynamics
        volume:             clamp(params.volume,            0.1,   2.0,  1.0),
        normalize:          params.normalize          ?? false,
        dynamicCompression: params.dynamicCompression ?? false,
        limiter:            params.limiter            ?? false,
        expanderGate:       params.expanderGate       ?? false,
        lufsTarget:         typeof params.lufsTarget === "number" ? clamp(params.lufsTarget, -23, -9, null) : null,
        // Noise & Cleanup
        noiseReduction:     clamp(params.noiseReduction,   0.0,   0.60, 0.0),
        deClick:            params.deClick            ?? false,
        deHum:              params.deHum              ?? false,
        deBreath:           params.deBreath           ?? false,
        trimSilence:        params.trimSilence        ?? false,
        // EQ
        bassBoost:          clamp(params.bassBoost,        -8,    8,    0),
        midBoost:           clamp(params.midBoost,         -5,    5,    0),
        trebleBoost:        clamp(params.trebleBoost,      -6,    6,    0),
        highPassFreq:       typeof params.highPassFreq === "number" ? clamp(params.highPassFreq, 20, 500, null) : null,
        lowPassFreq:        typeof params.lowPassFreq  === "number" ? clamp(params.lowPassFreq, 2000, 20000, null) : null,
        presenceBoost:      clamp(params.presenceBoost,   -4,    4,    0),
        warmthBoost:        clamp(params.warmthBoost,     -4,    4,    0),
        airBoost:           clamp(params.airBoost,        -4,    4,    0),
        // Voice
        voiceEnhancement:   params.voiceEnhancement   ?? false,
        deEss:              params.deEss              ?? false,
        voiceWarmth:        params.voiceWarmth        ?? false,
        voiceClarity:       params.voiceClarity       ?? false,
        // Stereo
        stereoWidth:        clamp(params.stereoWidth,      0.5,   2.0,  1.0),
        monoMix:            params.monoMix            ?? false,
        // Time
        speed:              clamp(params.speed,            0.5,   2.0,  1.0),
        trimStart:          clamp(params.trimStart,        0,     3600, 0),
        trimEnd:            clamp(params.trimEnd,          0,     3600, 0),
        fadeIn:             clamp(params.fadeIn,           0,     30,   0),
        fadeOut:            clamp(params.fadeOut,          0,     30,   0),
        // Effects
        saturation:         clamp(params.saturation,       0.0,   0.40, 0.0),
        reverse:            params.reverse            ?? false,
        outputFormat:       "wav",
      },
      appliedSteps:  Array.isArray(params.appliedSteps) ? params.appliedSteps : [],
      description:   params.description   || "অডিও প্রসেসিং সম্পন্ন হয়েছে।",
      technicalNote: params.technicalNote || null,
    });

  } catch (err) {
    console.error("audio-edit handler error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
