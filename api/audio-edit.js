/**
 * /api/audio-edit — Manus AI-style Professional Audio Engineering (v5.0)
 *
 * Architecture: AI intent detection → FFmpeg server-side processing
 *
 * FFmpeg filter chain (professional-grade):
 *   - highpass / lowpass
 *   - equalizer (bass, warmth, mid, presence, treble, air)
 *   - afftdn (AI-powered noise reduction)
 *   - agate (expander/noise gate)
 *   - acompressor (dynamics compression)
 *   - alimiter (brick-wall limiter)
 *   - loudnorm (EBU R128 loudness normalization)
 *   - atempo (speed change)
 *   - areverse (reverse)
 *   - afade (fade in/out)
 *   - volume (gain)
 *   - stereotools (stereo width)
 *   - pan (mono mix)
 *   - silenceremove (trim silence)
 */

import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import { createRequire } from "module";
import { tmpdir } from "os";

const execFileAsync = promisify(execFile);

// ── Resolve ffmpeg binary ──────────────────────────────────────────────────────
function getFfmpegPath() {
  try {
    const require = createRequire(import.meta.url);
    const p = require("ffmpeg-static");
    if (p) return p;
  } catch {}
  // Vercel includes the binary at this path when includeFiles is set
  return "/var/task/node_modules/ffmpeg-static/ffmpeg";
}

// ── Resolve AI config ──────────────────────────────────────────────────────────
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
// MANUS AI-STYLE AUDIO ENGINEERING SYSTEM PROMPT v5.0
// ═══════════════════════════════════════════════════════════════════════════════
const AUDIO_SYSTEM_PROMPT = `তুমি একজন বিশ্বমানের সাউন্ড ইঞ্জিনিয়ার AI। তোমার কাছে FFmpeg-এর সম্পূর্ণ ক্ষমতা আছে।

ব্যবহারকারীর নির্দেশ বিশ্লেষণ করে একটি JSON রিটার্ন করো। শুধু JSON, কোনো markdown নয়।

{
  "intent": "<clean|enhance|podcast|studio|broadcast|asmr|music|social|denoise|vocal|eq|volume|speed|trim|custom>",
  "pipeline": ["<step1>", "<step2>", ...],

  // ── Noise & Cleanup ──────────────────────────────────────────────────────
  "noiseReduction":    <0.0–1.0, 0=off, 0.3=gentle, 0.7=strong, 1.0=max>,
  "noiseType":         <"voice"|"music"|"general">,
  "deHum":             <true/false — 50/60Hz hum removal>,
  "deClick":           <true/false — click/pop removal>,
  "deBreath":          <true/false — breath sound reduction>,
  "trimSilence":       <true/false — remove leading/trailing silence>,

  // ── EQ ───────────────────────────────────────────────────────────────────
  "highPassFreq":      <20–500 Hz, null=off — remove rumble>,
  "lowPassFreq":       <2000–20000 Hz, null=off — remove hiss>,
  "bassBoost":         <-12 to +12 dB, 0=off>,
  "warmthBoost":       <-8 to +8 dB, 0=off — 300Hz warmth>,
  "midBoost":          <-8 to +8 dB, 0=off — 2.5kHz presence>,
  "presenceBoost":     <-8 to +8 dB, 0=off — 4kHz clarity>,
  "deEss":             <true/false — reduce harsh sibilance>,
  "trebleBoost":       <-8 to +8 dB, 0=off>,
  "airBoost":          <-6 to +6 dB, 0=off — 12kHz shimmer>,

  // ── Dynamics ─────────────────────────────────────────────────────────────
  "dynamicCompression": <true/false>,
  "compressionRatio":  <1.5–20, default 4>,
  "compressionThresh": <-40 to -6 dB, default -24>,
  "limiter":           <true/false>,
  "expanderGate":      <true/false — gentle noise gate>,

  // ── Loudness ─────────────────────────────────────────────────────────────
  "normalize":         <true/false — peak normalize>,
  "loudnorm":          <true/false — EBU R128 integrated loudness>,
  "lufsTarget":        <-23 to -9, default -16 for podcast, -14 for social>,
  "volume":            <0.1–4.0, default 1.0>,

  // ── Voice Enhancement ────────────────────────────────────────────────────
  "voiceEnhancement":  <true/false — full voice clarity chain>,
  "voiceWarmth":       <true/false — add warmth to thin voice>,
  "voiceClarity":      <true/false — enhance intelligibility>,

  // ── Stereo ───────────────────────────────────────────────────────────────
  "stereoWidth":       <0.0–2.0, 1.0=unchanged, 1.5=wider, 0.5=narrower>,
  "monoMix":           <true/false>,

  // ── Time ─────────────────────────────────────────────────────────────────
  "speed":             <0.5–2.0, default 1.0>,
  "trimStart":         <seconds, 0=none>,
  "trimEnd":           <seconds, 0=none>,
  "fadeIn":            <seconds, 0=none>,
  "fadeOut":           <seconds, 0=none>,
  "reverse":           <true/false>,

  // ── Explanation ──────────────────────────────────────────────────────────
  "appliedSteps": ["<বাংলায় প্রতিটি পদক্ষেপ>", ...],
  "description":  "<বাংলায় ২-৩ লাইনের সারসংক্ষেপ>",
  "technicalNote": "<ঐচ্ছিক>"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFESSIONAL PRESETS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"clean" / "পরিষ্কার" / "নয়েজ কমাও":
→ noiseReduction:0.6, noiseType:"voice", deHum:true, deClick:true, trimSilence:true,
  normalize:true, dynamicCompression:true, compressionRatio:3, compressionThresh:-20,
  highPassFreq:80, bassBoost:-1, midBoost:2, trebleBoost:1.5, fadeIn:0.3, fadeOut:0.5

"enhance" / "সুন্দর" / "ভালো" / "মান উন্নত":
→ noiseReduction:0.5, noiseType:"voice", deHum:true, deClick:true,
  voiceEnhancement:true, voiceClarity:true, deEss:true,
  normalize:true, dynamicCompression:true, compressionRatio:4, compressionThresh:-24,
  highPassFreq:100, bassBoost:1, warmthBoost:2, midBoost:3, presenceBoost:2, trebleBoost:2, airBoost:1,
  fadeIn:0.2, fadeOut:0.3

"podcast" / "পডকাস্ট" / "radio":
→ noiseReduction:0.7, noiseType:"voice", deHum:true, deClick:true, deBreath:true, trimSilence:true,
  voiceEnhancement:true, voiceClarity:true, deEss:true,
  normalize:false, loudnorm:true, lufsTarget:-16,
  dynamicCompression:true, compressionRatio:5, compressionThresh:-22, limiter:true,
  highPassFreq:120, bassBoost:-2, warmthBoost:2, midBoost:4, presenceBoost:3, trebleBoost:1.5,
  fadeIn:0.5, fadeOut:1.0

"studio" / "স্টুডিও" / "professional" / "recording":
→ noiseReduction:0.5, noiseType:"voice", deHum:true, deClick:true,
  voiceEnhancement:true, voiceClarity:true, voiceWarmth:true, deEss:true,
  normalize:false, loudnorm:true, lufsTarget:-14,
  dynamicCompression:true, compressionRatio:4, compressionThresh:-20, limiter:true,
  highPassFreq:80, bassBoost:2, warmthBoost:3, midBoost:3, presenceBoost:3, trebleBoost:2, airBoost:2,
  fadeIn:0.3, fadeOut:0.5

"broadcast" / "টেলিভিশন" / "news":
→ noiseReduction:0.6, noiseType:"voice", deHum:true, trimSilence:true,
  voiceEnhancement:true, voiceClarity:true, deEss:true,
  normalize:false, loudnorm:true, lufsTarget:-23, limiter:true,
  dynamicCompression:true, compressionRatio:6, compressionThresh:-18,
  highPassFreq:150, bassBoost:-3, midBoost:4, presenceBoost:3, trebleBoost:1

"asmr" / "ফিসফিস" / "soft":
→ noiseReduction:0.3, noiseType:"general",
  normalize:true, dynamicCompression:false,
  trebleBoost:3, airBoost:3, bassBoost:-2, highPassFreq:60,
  stereoWidth:1.5, fadeIn:1.0, fadeOut:2.0

"music" / "গান" / "মিউজিক":
→ noiseReduction:0.2, noiseType:"music",
  normalize:false, loudnorm:true, lufsTarget:-14, limiter:true,
  bassBoost:3, trebleBoost:2, airBoost:1, stereoWidth:1.2,
  fadeIn:1.0, fadeOut:2.0

"social" / "facebook" / "youtube" / "reels":
→ noiseReduction:0.5, noiseType:"voice", deHum:true, trimSilence:true,
  voiceEnhancement:true, voiceClarity:true, deEss:true,
  normalize:false, loudnorm:true, lufsTarget:-14, limiter:true,
  dynamicCompression:true, compressionRatio:4, compressionThresh:-22,
  highPassFreq:100, midBoost:3, presenceBoost:2, trebleBoost:2,
  fadeIn:0.2, fadeOut:0.5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INCREMENTAL RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"আরো নয়েজ কমাও"     → noiseReduction:0.85
"আরো ভলিউম বাড়াও"   → volume:1.5, normalize:true
"আরো বেস বাড়াও"     → bassBoost:6
"কণ্ঠ উষ্ণ করো"      → warmthBoost:4, voiceWarmth:true
"কণ্ঠ পরিষ্কার করো"  → voiceClarity:true, midBoost:4, deEss:true, highPassFreq:100
"হাম দূর করো"        → deHum:true
"স্টেরিও প্রশস্ত করো"→ stereoWidth:1.6
"মনো করো"            → monoMix:true
"রিভার্স করো"        → reverse:true
"গতি ১.৫ গুণ"        → speed:1.5
"ফেড ইন ৩ সেকেন্ড"  → fadeIn:3
"প্রথম ১০ সেকেন্ড কাটো" → trimStart:10
"শেষের ৫ সেকেন্ড কাটো"  → trimEnd:5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EMOTION-AWARE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"কবিতার আবৃত্তি" → enhance + warmthBoost:3 + airBoost:2 + stereoWidth:1.2
"ইন্টারভিউ"       → podcast + deBreath:true
"লেকচার / ক্লাস"  → broadcast + voiceClarity:true
"গজল / নাশিদ"     → music + warmthBoost:3 + stereoWidth:1.3 + fadeIn:1.5
"ফোন রেকর্ডিং"    → clean + deHum:true + highPassFreq:200 + lowPassFreq:8000
"ভিডিও ভয়েসওভার" → broadcast + voiceClarity:true + lufsTarget:-16

শুধু valid JSON রিটার্ন করো।`;

// ── AI intent parsing ──────────────────────────────────────────────────────────
async function parseInstruction(instruction) {
  const cfg = resolveAiConfig();
  if (!cfg) throw new Error("AI config not found");

  const url = cfg.baseUrl.endsWith("/chat/completions")
    ? cfg.baseUrl
    : `${cfg.baseUrl.replace(/\/$/, "")}/chat/completions`;

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

// ── Build FFmpeg filter chain from params ──────────────────────────────────────
function buildFilterChain(p) {
  const filters = [];

  // 1. Silence removal (trim leading/trailing silence)
  if (p.trimSilence) {
    filters.push("silenceremove=start_periods=1:start_silence=0.5:start_threshold=-50dB:stop_periods=-1:stop_silence=1:stop_threshold=-50dB");
  }

  // 2. High-pass filter (remove rumble/sub-bass)
  if (p.highPassFreq) {
    filters.push(`highpass=f=${Math.max(20, Math.min(500, p.highPassFreq))}:poles=2`);
  }

  // 3. Low-pass filter (remove hiss/high noise)
  if (p.lowPassFreq) {
    filters.push(`lowpass=f=${Math.max(2000, Math.min(20000, p.lowPassFreq))}:poles=2`);
  }

  // 4. De-hum (50Hz notch filter + harmonics)
  if (p.deHum) {
    filters.push("equalizer=f=50:width_type=o:width=2:g=-20");
    filters.push("equalizer=f=100:width_type=o:width=2:g=-12");
    filters.push("equalizer=f=150:width_type=o:width=2:g=-8");
    filters.push("equalizer=f=60:width_type=o:width=2:g=-15");  // 60Hz for US
  }

  // 5. AI-powered noise reduction (afftdn — FFmpeg's spectral noise reduction)
  if (p.noiseReduction && p.noiseReduction > 0) {
    const nr = Math.max(0.01, Math.min(1.0, p.noiseReduction));
    const nrLevel = Math.round(nr * 97);  // 0–97 dB
    const noiseType = p.noiseType === "music" ? "m" : p.noiseType === "voice" ? "v" : "s";
    // afftdn: AI spectral noise reduction
    filters.push(`afftdn=nf=-${nrLevel}:nt=${noiseType}:om=o`);
  }

  // 6. De-click (agate with very short attack for click removal)
  if (p.deClick) {
    filters.push("adeclick=w=55:o=75:a=2");
  }

  // 7. De-breath (gentle gate to reduce breath sounds)
  if (p.deBreath) {
    filters.push("agate=threshold=0.015:ratio=8:attack=10:release=200:makeup=1");
  }

  // 8. Expander/noise gate (gentle expansion for silence)
  if (p.expanderGate) {
    filters.push("agate=threshold=0.02:ratio=4:attack=5:release=100");
  }

  // 9. EQ chain
  // Bass (low-shelf at 100Hz)
  if (p.bassBoost && p.bassBoost !== 0) {
    const g = Math.max(-12, Math.min(12, p.bassBoost));
    filters.push(`equalizer=f=100:width_type=h:width=200:g=${g}`);
  }

  // Warmth (peaking at 300Hz)
  if (p.warmthBoost && p.warmthBoost !== 0) {
    const g = Math.max(-8, Math.min(8, p.warmthBoost));
    filters.push(`equalizer=f=300:width_type=o:width=1.5:g=${g}`);
  }

  // Mid / Voice presence (peaking at 2.5kHz)
  if (p.midBoost && p.midBoost !== 0) {
    const g = Math.max(-8, Math.min(8, p.midBoost));
    filters.push(`equalizer=f=2500:width_type=o:width=1.2:g=${g}`);
  }

  // Presence / Clarity (peaking at 4kHz)
  if (p.presenceBoost && p.presenceBoost !== 0) {
    const g = Math.max(-8, Math.min(8, p.presenceBoost));
    filters.push(`equalizer=f=4000:width_type=o:width=1.0:g=${g}`);
  }

  // De-ess (notch at 7kHz to reduce sibilance)
  if (p.deEss) {
    filters.push("equalizer=f=7000:width_type=o:width=1.5:g=-4");
    filters.push("equalizer=f=8500:width_type=o:width=1.0:g=-2");
  }

  // Treble (high-shelf at 8kHz)
  if (p.trebleBoost && p.trebleBoost !== 0) {
    const g = Math.max(-8, Math.min(8, p.trebleBoost));
    filters.push(`equalizer=f=8000:width_type=h:width=8000:g=${g}`);
  }

  // Air (high-shelf at 12kHz)
  if (p.airBoost && p.airBoost !== 0) {
    const g = Math.max(-6, Math.min(6, p.airBoost));
    filters.push(`equalizer=f=12000:width_type=h:width=8000:g=${g}`);
  }

  // 10. Dynamics compression
  if (p.dynamicCompression) {
    const ratio = Math.max(1.5, Math.min(20, p.compressionRatio || 4));
    const thresh = Math.max(-40, Math.min(-6, p.compressionThresh || -24));
    filters.push(`acompressor=threshold=${Math.pow(10, thresh / 20)}:ratio=${ratio}:attack=3:release=250:makeup=1:knee=0.5`);
  }

  // 11. Limiter
  if (p.limiter) {
    filters.push("alimiter=level_in=1:level_out=0.95:limit=0.95:attack=5:release=50:asc=1");
  }

  // 12. Volume gain
  if (p.volume && p.volume !== 1.0) {
    const vol = Math.max(0.1, Math.min(4.0, p.volume));
    filters.push(`volume=${vol}`);
  }

  // 13. Peak normalize
  if (p.normalize) {
    filters.push("dynaudnorm=p=0.95:m=100:s=12:g=15");
  }

  // 14. Stereo width (stereotools)
  if (p.stereoWidth && Math.abs(p.stereoWidth - 1.0) > 0.05) {
    const sw = Math.max(0.0, Math.min(2.0, p.stereoWidth));
    filters.push(`stereotools=mlev=${sw}:slev=${sw}:sbal=0:mbal=0`);
  }

  // 15. Mono mix
  if (p.monoMix) {
    filters.push("pan=mono|c0=0.5*c0+0.5*c1");
  }

  // 16. Speed change
  if (p.speed && p.speed !== 1.0) {
    const spd = Math.max(0.5, Math.min(2.0, p.speed));
    filters.push(`atempo=${spd}`);
  }

  // 17. Fade in
  if (p.fadeIn && p.fadeIn > 0) {
    const fi = Math.max(0.01, Math.min(30, p.fadeIn));
    filters.push(`afade=t=in:st=0:d=${fi}:curve=exp`);
  }

  // 18. Fade out (requires knowing duration — applied at end)
  if (p.fadeOut && p.fadeOut > 0) {
    const fo = Math.max(0.01, Math.min(30, p.fadeOut));
    // We'll add this as a separate step after getting duration
    filters.push(`__FADEOUT__:${fo}`);
  }

  return filters;
}

// ── Run FFmpeg with filter chain ───────────────────────────────────────────────
async function processWithFFmpeg(inputPath, outputPath, p, duration) {
  const ffmpegPath = getFfmpegPath();

  // Trim start/end
  const trimArgs = [];
  if (p.trimStart && p.trimStart > 0) {
    trimArgs.push("-ss", String(Math.max(0, p.trimStart)));
  }
  if (p.trimEnd && p.trimEnd > 0 && duration) {
    const endTime = Math.max(0.1, duration - p.trimEnd);
    trimArgs.push("-to", String(endTime));
  }

  // Build filter chain
  let filters = buildFilterChain(p);

  // Handle fade out (needs duration)
  const fadeOutIdx = filters.findIndex(f => f.startsWith("__FADEOUT__:"));
  if (fadeOutIdx >= 0) {
    const fo = parseFloat(filters[fadeOutIdx].split(":")[1]);
    filters.splice(fadeOutIdx, 1);
    if (duration) {
      const effectiveDuration = duration - (p.trimStart || 0) - (p.trimEnd || 0);
      const fadeStart = Math.max(0, effectiveDuration - fo);
      filters.push(`afade=t=out:st=${fadeStart.toFixed(2)}:d=${fo}:curve=exp`);
    }
  }

  // Reverse (must be done before other filters in separate pass or at start)
  const reverseFilter = p.reverse ? "areverse," : "";

  // Loudness normalization (EBU R128) — use loudnorm filter
  if (p.loudnorm) {
    const target = Math.max(-23, Math.min(-9, p.lufsTarget || -16));
    filters.push(`loudnorm=I=${target}:TP=-1.5:LRA=11:print_format=none`);
  }

  const filterStr = reverseFilter + filters.join(",");

  const args = [
    "-y",
    ...trimArgs,
    "-i", inputPath,
    "-vn",  // no video
  ];

  if (filterStr) {
    args.push("-af", filterStr);
  }

  // Output: high-quality WAV (PCM 16-bit, 44100 Hz)
  args.push(
    "-acodec", "pcm_s16le",
    "-ar", "44100",
    "-ac", p.monoMix ? "1" : "2",
    outputPath
  );

  try {
    await execFileAsync(ffmpegPath, args, { timeout: 55000 });
  } catch (err) {
    // If stereotools fails (mono input), retry without it
    if (err.message?.includes("stereotools") || err.message?.includes("pan=mono")) {
      const retryFilters = filters.filter(f => !f.includes("stereotools") && !f.includes("pan=mono"));
      const retryStr = reverseFilter + retryFilters.join(",");
      const retryArgs = [...args];
      const afIdx = retryArgs.indexOf("-af");
      if (afIdx >= 0) retryArgs[afIdx + 1] = retryStr;
      await execFileAsync(ffmpegPath, retryArgs, { timeout: 55000 });
    } else {
      throw err;
    }
  }
}

// ── Get audio duration using ffprobe ──────────────────────────────────────────
async function getAudioDuration(inputPath) {
  const ffmpegPath = getFfmpegPath();
  const ffprobePath = ffmpegPath.replace(/ffmpeg$/, "ffprobe");
  try {
    const { stdout } = await execFileAsync(ffprobePath, [
      "-v", "quiet",
      "-print_format", "json",
      "-show_format",
      inputPath,
    ], { timeout: 10000 });
    const info = JSON.parse(stdout);
    return parseFloat(info.format?.duration || "0");
  } catch {
    return 0;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "25mb",
    },
    responseLimit: "25mb",
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  const tmpInput  = join(tmpdir(), `audio_in_${Date.now()}.tmp`);
  const tmpOutput = join(tmpdir(), `audio_out_${Date.now()}.wav`);

  try {
    const { instruction, audioData, audioMime } = req.body || {};

    if (!instruction?.trim()) return res.status(400).json({ error: "instruction প্রয়োজন" });
    if (!audioData)           return res.status(400).json({ error: "audioData প্রয়োজন" });

    // Decode base64 audio
    const audioBuffer = Buffer.from(audioData, "base64");
    await writeFile(tmpInput, audioBuffer);

    // Get duration
    const duration = await getAudioDuration(tmpInput);

    // Parse instruction with AI
    let aiParams;
    try {
      aiParams = await parseInstruction(instruction.trim());
    } catch (aiErr) {
      return res.status(500).json({ error: "AI নির্দেশ বিশ্লেষণে সমস্যা", details: aiErr.message });
    }

    // Clamp values
    const p = {
      noiseReduction:    Math.max(0, Math.min(1.0, aiParams.noiseReduction || 0)),
      noiseType:         aiParams.noiseType || "voice",
      deHum:             !!aiParams.deHum,
      deClick:           !!aiParams.deClick,
      deBreath:          !!aiParams.deBreath,
      trimSilence:       !!aiParams.trimSilence,
      highPassFreq:      aiParams.highPassFreq || null,
      lowPassFreq:       aiParams.lowPassFreq  || null,
      bassBoost:         Math.max(-12, Math.min(12, aiParams.bassBoost    || 0)),
      warmthBoost:       Math.max(-8,  Math.min(8,  aiParams.warmthBoost  || 0)),
      midBoost:          Math.max(-8,  Math.min(8,  aiParams.midBoost     || 0)),
      presenceBoost:     Math.max(-8,  Math.min(8,  aiParams.presenceBoost|| 0)),
      deEss:             !!aiParams.deEss,
      trebleBoost:       Math.max(-8,  Math.min(8,  aiParams.trebleBoost  || 0)),
      airBoost:          Math.max(-6,  Math.min(6,  aiParams.airBoost     || 0)),
      dynamicCompression:!!aiParams.dynamicCompression,
      compressionRatio:  Math.max(1.5, Math.min(20, aiParams.compressionRatio  || 4)),
      compressionThresh: Math.max(-40, Math.min(-6, aiParams.compressionThresh || -24)),
      limiter:           !!aiParams.limiter,
      expanderGate:      !!aiParams.expanderGate,
      normalize:         !!aiParams.normalize,
      loudnorm:          !!aiParams.loudnorm,
      lufsTarget:        Math.max(-23, Math.min(-9, aiParams.lufsTarget || -16)),
      volume:            Math.max(0.1, Math.min(4.0, aiParams.volume || 1.0)),
      voiceEnhancement:  !!aiParams.voiceEnhancement,
      voiceWarmth:       !!aiParams.voiceWarmth,
      voiceClarity:      !!aiParams.voiceClarity,
      stereoWidth:       Math.max(0.0, Math.min(2.0, aiParams.stereoWidth || 1.0)),
      monoMix:           !!aiParams.monoMix,
      speed:             Math.max(0.5, Math.min(2.0, aiParams.speed || 1.0)),
      trimStart:         Math.max(0, aiParams.trimStart || 0),
      trimEnd:           Math.max(0, aiParams.trimEnd   || 0),
      fadeIn:            Math.max(0, Math.min(30, aiParams.fadeIn  || 0)),
      fadeOut:           Math.max(0, Math.min(30, aiParams.fadeOut || 0)),
      reverse:           !!aiParams.reverse,
    };

    // Process with FFmpeg
    await processWithFFmpeg(tmpInput, tmpOutput, p, duration);

    // Read output and return as base64
    const outputBuffer = await readFile(tmpOutput);
    const outputBase64 = outputBuffer.toString("base64");

    // Cleanup
    await unlink(tmpInput).catch(() => {});
    await unlink(tmpOutput).catch(() => {});

    return res.status(200).json({
      success:      true,
      intent:       aiParams.intent || "custom",
      pipeline:     Array.isArray(aiParams.pipeline)      ? aiParams.pipeline      : [],
      appliedSteps: Array.isArray(aiParams.appliedSteps)  ? aiParams.appliedSteps  : [],
      description:  aiParams.description  || "অডিও প্রসেসিং সম্পন্ন হয়েছে।",
      technicalNote:aiParams.technicalNote || null,
      audioData:    outputBase64,
      audioMime:    "audio/wav",
      params: p,
    });

  } catch (err) {
    console.error("audio-edit handler error:", err);
    // Cleanup on error
    await unlink(tmpInput).catch(() => {});
    await unlink(tmpOutput).catch(() => {});
    return res.status(500).json({ error: "অডিও প্রসেসিং ব্যর্থ হয়েছে", details: err.message });
  }
}
