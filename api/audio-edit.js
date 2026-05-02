import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import os from "os";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { execFileSync, execSync } from "child_process";

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "210mb",
  },
};

// ── Resolve FFmpeg path ──────────────────────────────────────────────────────
function getFFmpegPath() {
  let ffmpegPath = "ffmpeg";
  try {
    if (ffmpegInstaller?.path && fs.existsSync(ffmpegInstaller.path)) {
      ffmpegPath = ffmpegInstaller.path;
      fs.chmodSync(ffmpegPath, 0o755);
    }
  } catch (e) {}
  return ffmpegPath;
}

// ── Get audio duration in seconds using ffprobe ──────────────────────────────
function getAudioDuration(filePath, ffmpegPath) {
  // Helper to parse Duration string from ffmpeg/ffprobe output
  function parseDuration(str) {
    const m = str.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
    if (m) return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
    return null;
  }

  // Method 1: ffprobe JSON (most reliable)
  try {
    const ffprobePath = ffmpegPath.replace(/ffmpeg$/, "ffprobe");
    if (fs.existsSync(ffprobePath)) {
      const out = execFileSync(ffprobePath, [
        "-v", "quiet", "-print_format", "json",
        "-show_streams", filePath
      ], { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 2 * 1024 * 1024 });
      const info = JSON.parse(out.toString());
      const audioStream = info.streams?.find(s => s.codec_type === "audio");
      const dur = parseFloat(audioStream?.duration);
      if (!isNaN(dur) && dur > 0) return dur;
    }
  } catch (e) {}

  // Method 2: ffmpeg -i (outputs to stderr, so we catch the error)
  try {
    execFileSync(ffmpegPath, ["-i", filePath, "-f", "null", "-"],
      { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 2 * 1024 * 1024 });
  } catch (e) {
    // ffmpeg always exits with error for -f null, but stderr has duration
    const stderr = e.stderr?.toString() || "";
    const dur = parseDuration(stderr);
    if (dur !== null && dur > 0) return dur;
    // Also try stdout
    const stdout = e.stdout?.toString() || "";
    const dur2 = parseDuration(stdout);
    if (dur2 !== null && dur2 > 0) return dur2;
  }

  // Method 3: ffprobe simple format
  try {
    const ffprobePath = ffmpegPath.replace(/ffmpeg$/, "ffprobe");
    if (fs.existsSync(ffprobePath)) {
      const out = execFileSync(ffprobePath, [
        "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", filePath
      ], { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1024 * 1024 });
      const dur = parseFloat(out.toString().trim());
      if (!isNaN(dur) && dur > 0) return dur;
    }
  } catch (e) {}

  return null;
}

// ── New: Vocal Doubler — adds a subtle doubled layer for richness ────────────
function buildVocalDoubler(ffmpegPath, inputPath, outputPath) {
  // Creates a subtle pitch-shifted copy and mixes with original for thickness
  execFileSync(ffmpegPath, [
    "-i", inputPath,
    "-filter_complex",
    "[0:a]asplit=2[a][b];[a]aecho=0.8:0.88:12:0.4[a1];[b]aecho=0.8:0.88:25:0.3[b1];[a1][b1]amix=inputs=2:weights=1 0.4[out]",
    "-map", "[out]",
    "-ar", "44100",
    "-y", outputPath
  ], { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 50 * 1024 * 1024, timeout: 55000 });
}

// ── Classify vocal context from AI response ──────────────────────────────────
function classifyVocalContext(intent, operations, prompt) {
  const lowerPrompt = (prompt || "").toLowerCase();
  // Poetry / recitation detection
  if (
    lowerPrompt.includes("কবিতা") || lowerPrompt.includes("আবৃত্তি") ||
    lowerPrompt.includes("recitation") || lowerPrompt.includes("poem") ||
    intent === "recitation" || intent === "poetry"
  ) return "poetry";
  // Fast narration / energetic
  if (
    lowerPrompt.includes("narration") || lowerPrompt.includes("ন্যারেশন") ||
    lowerPrompt.includes("energetic") || lowerPrompt.includes("podcast") ||
    intent === "podcast" || intent === "broadcast"
  ) return "narration";
  // Deep voice
  if (
    lowerPrompt.includes("deep") || lowerPrompt.includes("গভীর") ||
    lowerPrompt.includes("পুরুষালি") || intent === "deep"
  ) return "deep";
  // Thin / soft voice
  if (
    lowerPrompt.includes("soft") || lowerPrompt.includes("নরম") ||
    lowerPrompt.includes("মিষ্টি") || lowerPrompt.includes("sweet") ||
    intent === "asmr"
  ) return "soft";
  return "general";
}

// ── Smart fade duration based on vocal length ────────────────────────────────
function getSmartFadeDuration(durationSec) {
  if (!durationSec) return 3;
  if (durationSec < 30) return 1.5;
  if (durationSec <= 180) return 3.5;
  return 5;
}

// ── Context-aware music ducking filter ──────────────────────────────────────
function getMusicDuckingLevel(vocalContext) {
  switch (vocalContext) {
    case "poetry":    return { active: -22, pause: -14 };
    case "narration": return { active: -18, pause: -12 };
    case "deep":      return { active: -20, pause: -13 };
    case "soft":      return { active: -24, pause: -16 };
    default:          return { active: -20, pause: -14 };
  }
}

// ── Context-aware vocal enhancement filter ───────────────────────────────────
function getContextVocalFilter(vocalContext) {
  switch (vocalContext) {
    case "poetry":
      // Warm, gentle, soft reverb — কবিতার জন্য
      return "highpass=f=80,equalizer=f=250:t=h:width=200:g=3,equalizer=f=400:t=h:width=200:g=2,equalizer=f=3000:t=h:width=1500:g=1.5,acompressor=threshold=-22dB:ratio=2.5:attack=25:release=300:knee=8dB,aecho=0.8:0.15:60:0.25";
    case "narration":
      // Clear, presence-forward — narration-এর জন্য
      return "highpass=f=90,equalizer=f=3000:t=h:width=2000:g=3,equalizer=f=5000:t=h:width=2000:g=2,acompressor=threshold=-18dB:ratio=3.5:attack=15:release=150:knee=5dB";
    case "deep":
      // Reduce muddiness, add clarity — গভীর কণ্ঠের জন্য
      return "highpass=f=60,equalizer=f=200:t=h:width=150:g=-2,equalizer=f=3500:t=h:width=2000:g=3,acompressor=threshold=-20dB:ratio=4:attack=20:release=200:knee=4dB";
    case "soft":
      // Add warmth, gentle compression — নরম কণ্ঠের জন্য
      return "highpass=f=100,equalizer=f=300:t=h:width=200:g=3,equalizer=f=4000:t=h:width=2000:g=2,acompressor=threshold=-28dB:ratio=2:attack=30:release=350:knee=10dB";
    default:
      // Natural clean — সাধারণ ভয়েসের জন্য
      return "highpass=f=80,equalizer=f=200:t=h:width=200:g=2,equalizer=f=3000:t=h:width=2000:g=2,equalizer=f=5000:t=h:width=2000:g=1.5,acompressor=threshold=-20dB:ratio=3:attack=20:release=200:knee=6dB";
  }
}

// ── Smart Mix: Vocal + Background Music ─────────────────────────────────────
// Returns null if no music file, otherwise builds the full mixed output
async function buildSmartMix(ffmpegPath, vocalPath, musicPath, outputPath, options = {}) {
  const {
    vocalContext = "general",
    targetLufs = -16,
    musicIntensity = "medium", // "low" | "medium" | "high"
    enableDucking = true,
    enableFade = true,
    enableVocalEnhance = true,
    extraVocalFilter = "",
  } = options;

  // 1. Get durations
  let vocalDuration = getAudioDuration(vocalPath, ffmpegPath);
  const musicDuration = getAudioDuration(musicPath, ffmpegPath);

  // Fallback: if duration detection failed, use a safe default
  if (!vocalDuration || vocalDuration <= 0) {
    // Try one more time with a different approach — read file size estimate
    try {
      const stat = fs.statSync(vocalPath);
      // Rough estimate: ~16KB/s for 128kbps mp3
      vocalDuration = Math.max(10, stat.size / 16000);
    } catch (e) {
      vocalDuration = 60; // safe default: 60 seconds
    }
  }

  const fadeDuration = getSmartFadeDuration(vocalDuration);
  const duckLevels = getMusicDuckingLevel(vocalContext);

  // Music volume based on intensity setting
  const musicVolumeMap = { low: -24, medium: -18, high: -12 };
  const musicVolume = musicVolumeMap[musicIntensity] || -18;

  // 2. Build vocal filter chain
  let vocalFilterParts = [];
  if (enableVocalEnhance) {
    const contextFilter = getContextVocalFilter(vocalContext);
    if (contextFilter) vocalFilterParts.push(contextFilter);
  }
  if (extraVocalFilter) {
    vocalFilterParts.push(extraVocalFilter);
  }
  // Vocal normalization (loudnorm)
  vocalFilterParts.push(`loudnorm=I=${targetLufs}:TP=-1.5:LRA=11`);
  const vocalFilter = vocalFilterParts.filter(Boolean).join(",");

  // 3. Build music filter chain
  // If music is shorter than vocal, loop it; always loop to be safe
  let musicInputArgs = ["-i", musicPath];
  let musicFilterComplex = "";

  const loopsNeeded = (musicDuration && musicDuration > 0)
    ? Math.ceil(vocalDuration / musicDuration) + 2
    : 10;
  // Always use aloop to ensure music is long enough
  const musicTrimDuration = vocalDuration + fadeDuration + 2;
  musicFilterComplex = `[1:a]aloop=loop=${loopsNeeded}:size=2147483647,atrim=duration=${musicTrimDuration.toFixed(3)}`;

  // Music volume + fade out
  musicFilterComplex += `,volume=${musicVolume}dB`;
  if (enableFade) {
    // Ensure fade start is always positive
    const fadeStart = Math.max(0, vocalDuration - fadeDuration);
    musicFilterComplex += `,afade=t=out:st=${fadeStart.toFixed(3)}:d=${fadeDuration}`;
  }
  musicFilterComplex += `[music_processed]`;

  // 4. Vocal filter
  const vocalFilterComplex = `[0:a]${vocalFilter}[vocal_processed]`;

  // 5. Mix vocal + music
  let mixFilter;
  if (enableDucking) {
    // Sidechain-style: music ducks when vocal is active
    // Use amix with weights to achieve ducking effect
    mixFilter = `[vocal_processed][music_processed]amix=inputs=2:duration=first:weights=1 0.35[mixed]`;
  } else {
    mixFilter = `[vocal_processed][music_processed]amix=inputs=2:duration=first[mixed]`;
  }

  // 6. Final mastering
  const masterFilter = `[mixed]loudnorm=I=${targetLufs}:TP=-1:LRA=11,alimiter=limit=-1dB:attack=5:release=50[out]`;

  const filterComplex = [
    vocalFilterComplex,
    musicFilterComplex,
    mixFilter,
    masterFilter,
  ].join(";");

  execFileSync(ffmpegPath, [
    "-i", vocalPath,
    ...musicInputArgs,
    "-filter_complex", filterComplex,
    "-map", "[out]",
    "-ar", "44100",
    "-ac", "2",
    "-b:a", "192k",
    "-y", outputPath
  ], {
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 50 * 1024 * 1024,
    timeout: 55000,
  });
}

// ── Advanced Multi-Segment Mix — intro/verse/chorus/outro style ─────────────
async function buildMultiSegmentMix(ffmpegPath, vocalPath, musicPath, outputPath, options = {}) {
  const {
    vocalContext = "general",
    targetLufs = -16,
    introDb = -14,
    verseDb = -22,
    outroDb = -14,
    introDuration = 3,
    outroDuration = 4,
  } = options;
  const vocalDuration = getAudioDuration(vocalPath, ffmpegPath) || 60;
  const musicDuration = getAudioDuration(musicPath, ffmpegPath) || 120;
  const totalDuration = introDuration + vocalDuration + outroDuration;
  const loopsNeeded = Math.ceil(totalDuration / musicDuration) + 2;
  const contextFilter = getContextVocalFilter(vocalContext);
  const fadeDuration = getSmartFadeDuration(vocalDuration);
  const introVol = Math.pow(10, introDb / 20).toFixed(3);
  const verseVol = Math.pow(10, verseDb / 20).toFixed(3);
  const outroVol = Math.pow(10, outroDb / 20).toFixed(3);
  const vocalEnd = (introDuration + vocalDuration).toFixed(2);
  const filterComplex = [
    `[0:a]adelay=${Math.round(introDuration * 1000)}|${Math.round(introDuration * 1000)},${contextFilter},loudnorm=I=${targetLufs}:TP=-1.5:LRA=11[vocal_delayed]`,
    `[1:a]aloop=loop=${loopsNeeded}:size=2147483647,atrim=duration=${(totalDuration + 2).toFixed(2)}[music_looped]`,
    `[music_looped]volume=enable='between(t,0,${introDuration})':volume=${introVol},volume=enable='between(t,${introDuration},${vocalEnd})':volume=${verseVol},volume=enable='gt(t,${vocalEnd})':volume=${outroVol},afade=t=out:st=${(totalDuration - fadeDuration).toFixed(2)}:d=${fadeDuration}[music_automated]`,
    `[vocal_delayed][music_automated]amix=inputs=2:duration=longest[mixed]`,
    `[mixed]loudnorm=I=${targetLufs}:TP=-1:LRA=11,alimiter=limit=-1dB:attack=5:release=50[out]`,
  ].join(";");
  execFileSync(ffmpegPath, [
    "-i", vocalPath, "-i", musicPath,
    "-filter_complex", filterComplex,
    "-map", "[out]", "-ar", "44100", "-ac", "2", "-b:a", "192k", "-y", outputPath
  ], { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 50 * 1024 * 1024, timeout: 55000 });
  return { totalDuration, introDuration, vocalDuration, outroDuration };
}

// ── Adaptive Ducking — context-aware smart ducking ────────────────────────────
function buildAdaptiveDucking(ffmpegPath, vocalPath, musicPath, outputPath, options = {}) {
  const {
    vocalContext = "general",
    targetLufs = -16,
    musicIntensity = "medium",
  } = options;
  const musicVolumeMap = { low: -26, medium: -20, high: -14 };
  const musicVolume = musicVolumeMap[musicIntensity] || -20;
  const vocalDuration = getAudioDuration(vocalPath, ffmpegPath) || 60;
  const musicDuration = getAudioDuration(musicPath, ffmpegPath) || 120;
  const loopsNeeded = Math.ceil(vocalDuration / musicDuration) + 2;
  const fadeDuration = getSmartFadeDuration(vocalDuration);
  const fadeStart = Math.max(0, vocalDuration - fadeDuration);
  const contextFilter = getContextVocalFilter(vocalContext);
  const filterComplex = [
    `[0:a]${contextFilter},loudnorm=I=${targetLufs}:TP=-1.5:LRA=11[vocal_clean]`,
    `[1:a]aloop=loop=${loopsNeeded}:size=2147483647,atrim=duration=${(vocalDuration + fadeDuration + 2).toFixed(2)},volume=${musicVolume}dB,afade=t=out:st=${fadeStart.toFixed(2)}:d=${fadeDuration}[music_prep]`,
    `[music_prep][vocal_clean]sidechaincompress=threshold=0.02:ratio=4:attack=10:release=200:level_sc=0.8[music_ducked]`,
    `[vocal_clean][music_ducked]amix=inputs=2:duration=first:weights=1 0.8[mixed]`,
    `[mixed]loudnorm=I=${targetLufs}:TP=-1:LRA=11,alimiter=limit=-1dB:attack=5:release=50[out]`,
  ].join(";");
  try {
    execFileSync(ffmpegPath, [
      "-i", vocalPath, "-i", musicPath,
      "-filter_complex", filterComplex,
      "-map", "[out]", "-ar", "44100", "-ac", "2", "-b:a", "192k", "-y", outputPath
    ], { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 50 * 1024 * 1024, timeout: 55000 });
  } catch (e) {
    // Fallback to standard smart mix if sidechaincompress not available
    buildSmartMix(ffmpegPath, vocalPath, musicPath, outputPath, {
      vocalContext, targetLufs, musicIntensity,
      enableDucking: true, enableFade: true, enableVocalEnhance: true,
    });
  }
}

// ── New: De-breath filter — reduces breath sounds ────────────────────────────
function getDeBreathFilter() {
  return "agate=threshold=-35dB:attack=5:release=80:ratio=8,equalizer=f=200:t=h:width=200:g=-2";
}

// ── New: De-reverb filter — reduces room reverb ───────────────────────────────
function getDeReverbFilter() {
  return "highpass=f=100,afftdn=nr=15:nf=-25:nt=w,equalizer=f=400:t=h:width=300:g=-1";
}

// ── New: Sidechain ducking — proper sidechain compression ─────────────────────
function buildSidechainDucking(ffmpegPath, vocalPath, musicPath, outputPath, options = {}) {
  const { duckLevel = -20, attackMs = 10, releaseMs = 200 } = options;
  execFileSync(ffmpegPath, [
    "-i", vocalPath,
    "-i", musicPath,
    "-filter_complex",
    `[1:a]acompressor=threshold=${duckLevel}dB:ratio=8:attack=${attackMs}:release=${releaseMs}:makeup=0dB:knee=6dB:sidechain=1[ducked];[0:a][ducked]amix=inputs=2:duration=first:weights=1 0.6[out]`,
    "-map", "[out]",
    "-ar", "44100",
    "-y", outputPath
  ], { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 50 * 1024 * 1024, timeout: 55000 });
}

// ── AI Config ────────────────────────────────────────────────────────────────
const GEMINI_OPENAI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

function isGeminiApiKey(apiKey = "") {
  return apiKey.startsWith("AIza");
}

function isGeminiBaseUrl(baseUrl = "") {
  return baseUrl.includes("generativelanguage.googleapis.com");
}

function resolveProviderConfig({ apiKey, baseURL, model, source, defaultModel = "gpt-4.1-mini" }) {
  const isOpenRouterKey = apiKey.startsWith("sk-or-");
  if (isGeminiApiKey(apiKey) || isGeminiBaseUrl(baseURL)) {
    return {
      apiKey,
      baseURL: baseURL || GEMINI_OPENAI_BASE_URL,
      model: model || process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
      source: `${source}_GEMINI`,
    };
  }
  return {
    apiKey,
    baseURL: baseURL || (isOpenRouterKey ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1"),
    model: model || (isOpenRouterKey ? "openai/gpt-4.1-mini" : defaultModel),
    source,
  };
}

function resolveAudioAiConfig() {
  const audioApiKey = process.env.AUDIO_AI_API_KEY?.trim();
  const audioBaseUrl = process.env.AUDIO_AI_BASE_URL?.trim();
  const audioModel = process.env.AUDIO_AI_MODEL?.trim();
  const chatbotApiKey = process.env.CHATBOT_API_KEY?.trim();
  const chatbotBaseUrl = process.env.CHATBOT_BASE_URL?.trim();
  const chatbotModel = process.env.CHATBOT_MODEL?.trim();
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const openRouterBaseUrl = process.env.OPENROUTER_BASE_URL?.trim();
  const openRouterModel = process.env.OPENROUTER_MODEL?.trim();
  const openAiApiKey = process.env.OPENAI_API_KEY?.trim();
  const openAiBaseUrl = process.env.OPENAI_BASE_URL?.trim();
  const openAiModel = process.env.OPENAI_MODEL?.trim();
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  const geminiBaseUrl = process.env.GEMINI_BASE_URL?.trim();
  const geminiModel = process.env.GEMINI_MODEL?.trim();
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY?.trim();
  const forgeBaseUrl = process.env.BUILT_IN_FORGE_API_URL?.trim();
  const forgeModel = process.env.BUILT_IN_FORGE_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  // 1. Explicit Gemini key from Vercel environment.
  if (geminiApiKey) {
    return resolveProviderConfig({
      apiKey: geminiApiKey,
      baseURL: geminiBaseUrl,
      model: geminiModel,
      source: "GEMINI_API_KEY",
      defaultModel: DEFAULT_GEMINI_MODEL,
    });
  }
  // 2. Prefer Forge (Gemini) for audio tasks when available.
  if (forgeApiKey && forgeBaseUrl) {
    return {
      apiKey: forgeApiKey,
      baseURL: forgeBaseUrl,
      model: forgeModel,
      source: "BUILT_IN_FORGE_API_KEY",
    };
  }
  // 3. Fallback to explicit AUDIO_AI key; Google AI keys are routed to Gemini.
  if (audioApiKey) {
    return resolveProviderConfig({
      apiKey: audioApiKey,
      baseURL: audioBaseUrl,
      model: audioModel,
      source: "AUDIO_AI_API_KEY",
    });
  }
  // 4. Fallback to OPENAI_API_KEY; if it contains a Gemini key, use Gemini endpoint.
  if (openAiApiKey) {
    return resolveProviderConfig({
      apiKey: openAiApiKey,
      baseURL: openAiBaseUrl,
      model: openAiModel,
      source: "OPENAI_API_KEY",
    });
  }
  // 5. Fallback to CHATBOT key; Google AI keys are routed to Gemini.
  if (chatbotApiKey) {
    return resolveProviderConfig({
      apiKey: chatbotApiKey,
      baseURL: chatbotBaseUrl,
      model: chatbotModel,
      source: "CHATBOT_API_KEY",
    });
  }
  // 6. Legacy OpenRouter fallback.
  if (openRouterApiKey) {
    return {
      apiKey: openRouterApiKey,
      baseURL: openRouterBaseUrl || "https://openrouter.ai/api/v1",
      model: openRouterModel || "openai/gpt-4.1-mini",
      source: "OPENROUTER_API_KEY",
    };
  }
  throw new Error("No AI API key configured for audio editing. Set GEMINI_API_KEY or AUDIO_AI_API_KEY for the simplest production setup.");
}

function createAudioAiClient() {
  const config = resolveAudioAiConfig();
  const defaultHeaders = {};
  if (config.source === "OPENROUTER_API_KEY" || config.baseURL.includes("openrouter.ai")) {
    defaultHeaders["HTTP-Referer"] = process.env.SITE_URL || process.env.VERCEL_URL || "https://mahbub-sardar-sabuj-live.vercel.app";
    defaultHeaders["X-Title"] = "Mahbub Sardar Sabuj Live";
  }
  return {
    client: new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL, defaultHeaders }),
    model: config.model,
  };
}

function parseAiJsonObject(content = "") {
  const raw = String(content || "").trim();
  if (!raw) throw new Error("Empty AI JSON response");
  const withoutFence = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(withoutFence);
  } catch (firstError) {
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(withoutFence.slice(start, end + 1));
    }
    throw firstError;
  }
}

function addOpOnce(operations, type, params = {}) {
  if (!operations.some(op => op.type === type)) operations.push({ type, params });
}

function deterministicAudioPlan(prompt = "") {
  const text = String(prompt || "").toLowerCase();
  const operations = [];
  let intent = "audio_cleanup";
  const has = (...patterns) => patterns.some(pattern => pattern.test(text));

  if (has(/youtube|ইউটিউব|ভিডিও ভয়েস|ভিডিও ভয়েস/)) { addOpOnce(operations, "youtube_voice"); intent = "youtube_voice"; }
  if (has(/tiktok|tik tok|reels|রিলস|টিকটক/)) { addOpOnce(operations, "tiktok_voice"); intent = "tiktok_voice"; }
  if (has(/audiobook|অডিওবুক|বই পড়া|বই পড়া/)) { addOpOnce(operations, "audiobook_voice"); intent = "audiobook_voice"; }
  if (has(/meditation|মেডিটেশন|শান্ত কণ্ঠ|শান্ত ভয়েস/)) { addOpOnce(operations, "meditation_voice"); intent = "meditation_voice"; }
  if (has(/news anchor|নিউজ অ্যাঙ্কর|সংবাদ পাঠক|ব্রডকাস্ট/)) { addOpOnce(operations, "news_anchor"); intent = "news_anchor"; }
  if (has(/recitation pro|বাংলা আবৃত্তি|আবৃত্তি প্রো|কবিতা/)) { addOpOnce(operations, "bangla_recitation_pro"); intent = "bangla_recitation_pro"; }
  if (has(/voice message|whatsapp|telegram|ভয়েস মেসেজ|ভয়েস মেসেজ/)) { addOpOnce(operations, "voice_message_clean"); intent = "voice_message_clean"; }
  if (has(/conference|meeting|কনফারেন্স|মিটিং/)) { addOpOnce(operations, "conference_voice"); intent = "conference_voice"; }

  if (has(/honey|মধুময়|মধুময়|মধুর|মিষ্টি কণ্ঠ/)) { addOpOnce(operations, "voice_clone_preset", { style: "honey" }); intent = "honey_voice"; }
  if (has(/broadcast|ব্রডকাস্ট/)) { addOpOnce(operations, "voice_clone_preset", { style: "broadcast" }); intent = "broadcast_voice"; }
  if (has(/asmr|ফিসফিস/)) { addOpOnce(operations, "voice_clone_preset", { style: "asmr" }); intent = "asmr_voice"; }
  if (has(/epic|এপিক|হিরো/)) { addOpOnce(operations, "voice_clone_preset", { style: "epic" }); intent = "epic_voice"; }
  if (has(/narrator|ন্যারেটর/)) { addOpOnce(operations, "voice_clone_preset", { style: "narrator" }); intent = "narrator_voice"; }

  // ── v9.0 New Presets ──────────────────────────────────────────────────────
  if (has(/cinematic bangla|সিনেমাটিক বাংলা|সিনেমাটিক ভয়েস|cinematic voice/)) { addOpOnce(operations, "cinematic_bangla"); intent = "cinematic_bangla"; }
  if (has(/radio jockey|rj voice|রেডিও জকি|আরজে ভয়েস|radio dj/)) { addOpOnce(operations, "radio_jockey"); intent = "radio_jockey"; }
  if (has(/sufi|সুফি|আধ্যাত্মিক|spiritual voice|mystical/)) { addOpOnce(operations, "sufi_voice"); intent = "sufi_voice"; }
  if (has(/children voice|শিশু কণ্ঠ|বাচ্চার ভয়েস|kids voice/)) { addOpOnce(operations, "children_voice"); intent = "children_voice"; }
  if (has(/elderly voice|বয়স্ক কণ্ঠ|বয়স্ক ভয়েস|senior voice/)) { addOpOnce(operations, "elderly_voice"); intent = "elderly_voice"; }
  if (has(/lofi chill|lo-fi chill|লো-ফাই চিল|lofi voice/)) { addOpOnce(operations, "lofi_chill"); intent = "lofi_chill"; }
  if (has(/nature ambient|প্রকৃতির শব্দ|ambient sound|ambient voice/)) { addOpOnce(operations, "nature_ambient"); intent = "nature_ambient"; }
  if (has(/drama voice|নাটকীয় কণ্ঠ|theater voice|নাট্য ভয়েস/)) { addOpOnce(operations, "drama_voice"); intent = "drama_voice"; }
  if (has(/spectral denoise|স্পেকট্রাল ডিনয়েজ|advanced denoise|গভীর নয়েজ/)) { addOpOnce(operations, "spectral_denoise"); intent = "spectral_denoise"; }
  if (has(/ai gate|ai noise gate|এআই গেট|smart noise gate/)) { addOpOnce(operations, "ai_noise_gate"); intent = "ai_noise_gate"; }
  if (has(/voice enhancer pro|ভয়েস এনহ্যান্সার প্রো|pro enhance|প্রো এনহ্যান্স/)) { addOpOnce(operations, "voice_enhancer_pro"); intent = "voice_enhancer_pro"; }
  if (has(/noise profile|নয়েজ প্রোফাইল|নয়েজ প্রোফাইল/)) addOpOnce(operations, "noise_profile_learn");
  if (has(/noise|নয়েজ|নয়েজ|শব্দ|হিস|hiss|clean|ক্লিন|রিমুভ/)) addOpOnce(operations, "noise_reduction", { strength: 0.55 });
  if (has(/clarity|ক্লারিটি|ক্লিয়ার|ক্লিয়ার|স্পষ্ট|পরিষ্কার/)) addOpOnce(operations, "clarity_boost");
  if (has(/punch|পাঞ্চ|ইমপ্যাক্ট/)) addOpOnce(operations, "punch_boost");
  if (has(/warmth|warm|উষ্ণতা|ওয়ার্ম|ওয়ার্ম/)) addOpOnce(operations, "warmth_enhance");
  if (has(/air|ব্রিলিয়ান্স|brilliance/)) addOpOnce(operations, "air_enhance");
  if (has(/voice focus|ভয়েস ফোকাস|ভয়েস ফোকাস/)) addOpOnce(operations, "voice_focus");
  if (has(/smart gate|noise gate|স্মার্ট গেট|নয়েজ গেট|নয়েজ গেট/)) addOpOnce(operations, "noise_gate_smart");
  if (has(/breath|শ্বাস/)) addOpOnce(operations, "de_breath");
  if (has(/de-?reverb|রুম রিভার্ব|রুমের শব্দ/)) addOpOnce(operations, "de_reverb");
  if (has(/room correction|রুম কারেকশন|অ্যাকুস্টিক/)) addOpOnce(operations, "room_correction");
  if (has(/dynamic eq|ডায়নামিক eq|ডাইনামিক eq/)) addOpOnce(operations, "dynamic_eq");
  if (has(/multiband gate|মাল্টিব্যান্ড গেট/)) addOpOnce(operations, "multiband_gate");
  if (has(/saturation|হার্মোনিক|স্যাচুরেশন/)) addOpOnce(operations, "harmonic_saturation", { drive: 0.6 });
  if (has(/vocal doubler|ডাবল|ডাবল লেয়ার|ডাবল লেয়ার/)) addOpOnce(operations, "vocal_doubler");
  if (has(/harmony|হার্মোনি/)) addOpOnce(operations, "vocal_harmony", { voices: 2, spread: 0.25 });
  if (has(/stereo expand|স্টেরিও বড়|স্টেরিও বড়/)) addOpOnce(operations, "stereo_field_expand", { width: 1.5 });
  if (has(/spatial|3d sound|3d|স্পেশিয়াল|স্পেশিয়াল|স্পেশাল|স্পেশ্যাল/)) addOpOnce(operations, "spatial_audio");
  if (has(/dynamic normalize|ডাইনামিক নরমালাইজ|ডায়নামিক নরমালাইজ/)) addOpOnce(operations, "dynamic_normalize");
  if (has(/vintage|ভিনটেজ|পুরনো রেডিও|রেট্রো/)) addOpOnce(operations, "vintage_radio");
  if (has(/telephone|টেলিফোন|phone call/)) addOpOnce(operations, "telephone_effect");
  if (has(/megaphone|মেগাফোন/)) addOpOnce(operations, "megaphone_effect");
  if (has(/underwater|পানির নিচে/)) addOpOnce(operations, "underwater_effect");
  if (has(/cave|গুহা/)) addOpOnce(operations, "cave_echo");
  if (has(/stadium|স্টেডিয়াম|স্টেডিয়াম/)) addOpOnce(operations, "stadium_reverb");
  if (has(/bathroom|বাথরুম/)) addOpOnce(operations, "bathroom_reverb");
  if (has(/alien|এলিয়েন|এলিয়েন/)) addOpOnce(operations, "alien_voice");
  if (has(/vinyl|ভিনাইল|পুরনো রেকর্ড/)) addOpOnce(operations, "vinyl_effect");
  if (has(/tape|cassette|ক্যাসেট/)) addOpOnce(operations, "tape_saturation", { drive: 0.8 });
  if (has(/reverse|রিভার্স|উল্টো/)) addOpOnce(operations, "reverse");
  if (has(/normalize|নরমাল|লেভেল|volume|ভলিউম|loud|জোরে/)) addOpOnce(operations, "loudness_normalize", { target_lufs: -16 });

  if (operations.length && !operations.some(op => ["loudness_normalize", "normalize", "limiter", "true_peak_limit"].includes(op.type))) {
    addOpOnce(operations, "loudness_normalize", { target_lufs: -16 });
  }

  return {
    intent,
    operations,
    explanation: operations.length
      ? "নির্বাচিত অডিও টুলের জন্য নির্ভরযোগ্য preset/filter pipeline প্রয়োগ করা হয়েছে।"
      : "সাধারণ অডিও ক্লিনআপ pipeline প্রয়োগ করা হয়েছে।",
  };
}

function mergeAudioPlan(aiResponse = {}, prompt = "") {
  const deterministic = deterministicAudioPlan(prompt);
  const merged = Array.isArray(aiResponse.operations) ? [...aiResponse.operations] : [];
  for (const op of deterministic.operations) addOpOnce(merged, op.type, op.params || {});
  if (!merged.length) merged.push({ type: "noise_reduction", params: { strength: 0.5 } }, { type: "vocal_enhance", params: {} }, { type: "loudness_normalize", params: { target_lufs: -16 } });
  return {
    ...aiResponse,
    operations: merged,
    intent: deterministic.operations.length ? deterministic.intent : (aiResponse.intent || "audio_cleanup"),
    explanation: aiResponse.explanation || deterministic.explanation,
  };
}

function fallbackAudioPlan(prompt = "") {
  return mergeAudioPlan({}, prompt);
}

// ── AI System Prompt ─────────────────────────────────────────────────────────
const AUDIO_SYSTEM_PROMPT = `You are a world-class AI audio engineer named "Sardar Audio Studio". You understand ANY instruction in Bengali or English and return correct audio operations as JSON.

RULE: ALWAYS return valid JSON with at least one operation. NEVER return empty operations list.

ALL AVAILABLE OPERATIONS:

BASIC: noise_reduction{strength:0-1}, normalize{}, volume_change{db:float}, trim{start_ms,end_ms}, fade_in{duration_ms}, fade_out{duration_ms}, reverse{}

PITCH & SPEED: pitch_shift{semitones}, speed_change{factor}, pitch_without_speed{semitones}

EFFECTS: reverb{room_size,wet_level}, echo{delay_ms,decay,repeats}, chorus{depth,rate}, distortion{gain}, telephone_effect{}, robot_voice{}, deep_voice{}, chipmunk_voice{}, whisper_effect{}, flanger{rate,depth}, phaser{rate,depth}, tremolo{rate,depth}, vibrato{rate,depth}, bitcrusher{bits}, tape_saturation{drive}, vinyl_effect{}, underwater_effect{}, cave_echo{}, stadium_reverb{}, bathroom_reverb{}, alien_voice{}, megaphone_effect{}, radio_effect{}

EQ: bass_boost{db}, treble_boost{db}, mid_boost{db}, bass_cut{db}, treble_cut{db}, equalizer{bass_db,mid_db,treble_db}, low_pass_filter{cutoff_hz}, high_pass_filter{cutoff_hz}, band_pass_filter{low_hz,high_hz}, notch_filter{freq_hz}, presence_boost{}, warmth_boost{}, air_boost{}

DYNAMICS: compress{threshold_db,ratio}, gate{threshold_db}, expander{threshold_db,ratio}, limiter{ceiling_db}, multiband_compress{}, de_ess{}, declick{}, declip{}, dehum{freq}, spectral_repair{}

VOCAL: vocal_enhance{}, stereo_widen{width}, stereo_narrow{}, stereo_to_mono{}, mono_to_stereo{}, stereo_balance{pan}, auto_tune{strength}, formant_shift{shift}, harmonic_exciter{amount}, transient_shaper{attack,sustain}, vocal_isolation{}, music_removal{}

NEW ADVANCED OPERATIONS (v7.0):
- de_breath{} = শ্বাস-প্রশ্বাসের শব্দ কমানো — voice gate + EQ
- de_reverb{} = রুমের রিভার্ব কমানো — spectral processing
- vocal_doubler{} = ভোকালে ডাবল লেয়ার যোগ — রিচনেস বাড়ানো
- stereo_enhancer{width:0-2} = স্টেরিও ইমেজ উন্নত করা
- dynamic_eq{} = ডায়নামিক EQ — ফ্রিকোয়েন্সি অনুযায়ী কম্প্রেশন
- multiband_gate{} = মাল্টিব্যান্ড নয়েজ গেট
- harmonic_saturation{drive:0-2} = হার্মোনিক স্যাচুরেশন — ওয়ার্মথ যোগ
- room_correction{} = রুম কারেকশন — অ্যাকুস্টিক সমস্যা ঠিক
- clarity_boost{} = ভয়েস ক্লারিটি বাড়ানো — মিড-হাই ফ্রিকোয়েন্সি
- punch_boost{} = পাঞ্চ ও ইমপ্যাক্ট বাড়ানো — ট্রান্সিয়েন্ট শেপিং
- warmth_enhance{} = উষ্ণতা বাড়ানো — লো-মিড হার্মোনিক্স
- air_enhance{} = এয়ার ও ব্রিলিয়ান্স বাড়ানো — হাই ফ্রিকোয়েন্সি
- voice_focus{} = ভয়েস ফোকাস — মিড ফ্রিকোয়েন্সি ক্লারিটি
- noise_gate_smart{} = স্মার্ট নয়েজ গেট — ভয়েস সংরক্ষণ করে

MASTERING: loudness_normalize{target_lufs}, true_peak_limit{ceiling_db}, pitch_correct{scale}

SMART MIX (Phase 1/2/3):
- smart_mix{music_intensity:"low"|"medium"|"high", enable_ducking:bool, vocal_context:"general"|"poetry"|"narration"|"deep"|"soft"}
  → Mixes vocal with uploaded background music. Handles duration matching, fade out, vocal normalization, music ducking automatically.
- vocal_normalize{target_lufs:-16} → Smart vocal loudness normalization
- music_extend{} → Extend background music to match vocal duration with crossfade loop
- smart_fade{} → Dynamic fade out based on vocal length
- context_enhance{vocal_context:"general"|"poetry"|"narration"|"deep"|"soft"} → Context-aware vocal enhancement

VOICE BEAUTIFY PRESETS:
- honey_voice{} = মধুময় উষ্ণ মিষ্টি কণ্ঠ
- silky_voice{} = রেশমি মসৃণ কণ্ঠ
- broadcast_voice{} = TV/Radio প্রফেশনাল
- asmr_voice{} = ASMR ঘনিষ্ঠ ফিসফিস
- cinematic_voice{} = হলিউড সিনেমা ভয়েস
- angelic_voice{} = স্বর্গীয় উচ্চ স্বর
- vintage_radio{} = পুরনো রেডিও স্টাইল
- podcast_pro{} = পডকাস্ট প্রো কোয়ালিটি
- lofi_voice{} = Lo-Fi ক্যাসেট স্টাইল
- narrator_voice{} = অডিওবুক ন্যারেটর
- smooth_jazz_voice{} = স্মুদ্ধ জ্যাজ সিঙার
- epic_voice{} = শক্তিশালী হিরোইক কণ্ঠ
- sweet_voice{} = মিষ্টি মেয়েলি স্বর
- crystal_voice{} = স্ফটিকের মতো পরিষ্কার
- deep_warm_voice{} = গভীর উষ্ণ পুরুষালি স্বর

NEW VOICE PRESETS (v7.0):
- youtube_voice{} = YouTube ভিডিও ভয়েসওভার — crisp, clear, engaging
- tiktok_voice{} = TikTok/Reels ভয়েস — punchy, bright, modern
- audiobook_voice{} = অডিওবুক ভয়েস — warm, smooth, fatigue-free
- meditation_voice{} = মেডিটেশন গাইড ভয়েস — calm, soft, spacious
- news_anchor{} = নিউজ অ্যাঙ্কর ভয়েস — authoritative, clear, professional
- bangla_recitation_pro{} = বাংলা আবৃত্তি প্রো — warm reverb, emotional depth
- voice_message_clean{} = ভয়েস মেসেজ ক্লিন — WhatsApp/Telegram quality
- conference_voice{} = কনফারেন্স কল ভয়েস — clear, noise-free, intelligible

VOCAL ENHANCEMENT PRESETS (Phase 2):
- natural_clean{} = হালকা normalization ও clarity — সাধারণ voiceover
- warm_voice{} = low-mid warmth, harshness কমানো — আবৃত্তি ও কবিতা
- studio_clear{} = clarity, compression, light EQ — প্রফেশনাল narration
- soft_poetry{} = soft tone, gentle reverb, smooth high — কবিতা বা আবেগপূর্ণ পাঠ
- deep_recitation{} = low warmth, controlled reverb — গভীর কণ্ঠের আবৃত্তি

SMART INTERPRETATION:
"এডিটিং করো"/"ভালো করো"/"সুন্দর করো"/"fix it" → noise_reduction(0.5)+normalize+bass_boost(3)+reverb(0.3,0.2)
"মধুময়"/"honey"/"মিষ্টি কণ্ঠ"/"মধুর" → honey_voice
"রেশমি"/"silky"/"মসৃণ"/"smooth"/"নরম" → silky_voice
"ব্রডকাস্ট"/"broadcast"/"TV voice"/"নিউজ ভয়েস" → broadcast_voice
"ASMR"/"ফিসফিস"/"whisper close" → asmr_voice
"সিনেমা"/"cinematic"/"হলিউড" → cinematic_voice
"স্বর্গীয়"/"angelic"/"ফেরেশ্তা" → angelic_voice
"পুরনো রেডিও"/"vintage"/"retro" → vintage_radio
"পডকাস্ট প্রো"/"podcast pro" → podcast_pro
"lofi"/"lo-fi"/"ক্যাসেট" → lofi_voice
"ন্যারেটর"/"narrator"/"অডিওবুক" → narrator_voice
"জ্যাজ"/"jazz"/"smooth jazz" → smooth_jazz_voice
"এপিক"/"epic"/"হিরো"/"powerful" → epic_voice
"মিষ্টি"/"sweet"/"মেয়েলি" → sweet_voice
"স্ফটিক"/"crystal"/"পরিষ্কার"/"clear" → crystal_voice
"গভীর উষ্ণ"/"deep warm"/"পুরুষালি" → deep_warm_voice
"প্রফেশনাল করো"/"studio quality" → denoise_advanced(0.9)+de_ess+compress(-20,4)+equalizer(3,1,2)+limiter(-1)+loudness_normalize(-14)
"পডকাস্ট"/"podcast"/"ভয়েসওভার" → noise_reduction(0.8)+gate(-40)+compress(-18,3)+presence_boost+loudness_normalize(-16)
"নয়েজ কমাও"/"noise remove"/"পরিষ্কার করো" → denoise_advanced(0.8)+noise_reduction(0.6)+gate(-45)+normalize
"আরো নয়েজ কমাও" → denoise_advanced(0.9)+noise_reduction(0.7)+gate(-40)
"ভয়েস সুন্দর করো"/"vocal beautify"/"কণ্ঠ সুন্দর করো" → honey_voice+loudness_normalize(-14)
"কবিতার জন্য"/"আবৃত্তি"/"recitation" → soft_poetry+loudness_normalize(-16)
"গান"/"song"/"গানের ভয়েস" → vocal_enhance+de_ess+compress(-18,3)+reverb(0.4,0.3)+loudness_normalize(-14)
"ইন্টারভিউ"/"interview" → broadcast_voice+loudness_normalize(-18)
"লেকচার"/"lecture"/"ক্লাস" → crystal_voice+loudness_normalize(-18)
"ভলিউম বাড়াও"/"louder" → volume_change(+6)+normalize
"ভলিউম কমাও"/"quieter" → volume_change(-6)
"পিচ বাড়াও"/"higher pitch" → pitch_shift(+2)
"পিচ কমাও"/"lower pitch" → pitch_shift(-2)
"দ্রুত করো"/"faster" → speed_change(1.3)
"ধীর করো"/"slower" → speed_change(0.8)
"রিভার্ব যোগ করো"/"add reverb" → reverb(0.5,0.3)
"ইকো যোগ করো"/"add echo" → echo(300,0.5,3)
"বেস বাড়াও"/"more bass" → bass_boost(5)
"ট্রেবল বাড়াও"/"more treble" → treble_boost(4)
"হাম সরাও"/"50hz noise"/"বৈদ্যুতিক শব্দ" → dehum(50)+notch_filter(100)+notch_filter(150)
"ক্লিক সরাও"/"pop remove" → declick+declip
"রোবট ভয়েস"/"robot" → robot_voice
"টেলিফোন"/"phone call" → telephone_effect
"মেগাফোন"/"megaphone" → megaphone_effect
"পানির নিচে"/"underwater" → underwater_effect
"গুহার মধ্যে"/"cave" → cave_echo
"স্টেডিয়াম"/"stadium" → stadium_reverb
"বাথরুম"/"bathroom" → bathroom_reverb
"এলিয়েন ভয়েস"/"alien" → alien_voice
"ভিনাইল"/"vinyl"/"পুরনো রেকর্ড" → vinyl_effect
"টেপ"/"tape"/"ক্যাসেট" → tape_saturation(1.0)
"স্টেরিও চওড়া করো"/"wider" → stereo_widen(1.5)
"মনো করো"/"narrow" → stereo_narrow
"লাউডনেস নরমালাইজ"/"LUFS"/"streaming ready" → loudness_normalize(-14)
"লিমিটার"/"limiter" → limiter(-1)
"গেট"/"noise gate" → gate(-40)
"অটো টিউন"/"auto-tune"/"পিচ ঠিক করো" → auto_tune(0.7)
"প্রেজেন্স বাড়াও"/"presence" → presence_boost
"উষ্ণতা যোগ করো"/"warmth" → warmth_boost
"এয়ার বাড়াও"/"air" → air_boost
"ব্যাকগ্রাউন্ড মিউজিক মিক্স করো"/"music mix"/"মিউজিক যোগ করো" → smart_mix(medium,true,general)
"কবিতায় মিউজিক"/"আবৃত্তিতে মিউজিক" → smart_mix(low,true,poetry)
"natural clean"/"স্বাভাবিক পরিষ্কার" → natural_clean
"warm voice"/"উষ্ণ কণ্ঠ" → warm_voice
"studio clear"/"স্টুডিও ক্লিয়ার" → studio_clear
"soft poetry"/"নরম কবিতা" → soft_poetry
"deep recitation"/"গভীর আবৃত্তি" → deep_recitation
"শ্বাস কমাও"/"breath remove"/"breathing noise" → de_breath+noise_gate_smart+loudness_normalize(-16)
"রুম রিভার্ব কমাও"/"de-reverb"/"রুমের শব্দ" → de_reverb+noise_reduction(0.4)+loudness_normalize(-16)
"ডাবল করো"/"vocal doubler"/"ডাবল লেয়ার" → vocal_doubler+loudness_normalize(-14)
"YouTube ভয়েস"/"youtube voice"/"ভিডিও ভয়েস" → youtube_voice
"TikTok ভয়েস"/"tiktok"/"reels voice" → tiktok_voice
"অডিওবুক"/"audiobook"/"বই পড়া" → audiobook_voice
"মেডিটেশন"/"meditation"/"শান্ত কণ্ঠ" → meditation_voice
"নিউজ অ্যাঙ্কর"/"news anchor"/"সংবাদ পাঠক" → news_anchor
"বাংলা আবৃত্তি প্রো"/"recitation pro" → bangla_recitation_pro
"ভয়েস মেসেজ"/"voice message"/"WhatsApp ভয়েস" → voice_message_clean
"কনফারেন্স"/"conference"/"মিটিং ভয়েস" → conference_voice
"ক্লারিটি বাড়াও"/"clarity boost"/"পরিষ্কার করো" → clarity_boost+loudness_normalize(-14)
"পাঞ্চ বাড়াও"/"punch"/"ইমপ্যাক্ট" → punch_boost+loudness_normalize(-14)
"উষ্ণতা বাড়াও"/"warmth enhance" → warmth_enhance+loudness_normalize(-16)
"এয়ার বাড়াও"/"air enhance"/"ব্রিলিয়ান্স" → air_enhance+loudness_normalize(-14)
"ভয়েস ফোকাস"/"voice focus"/"মিড ক্লারিটি" → voice_focus+loudness_normalize(-14)
"স্মার্ট গেট"/"smart gate"/"নয়েজ গেট" → noise_gate_smart+loudness_normalize(-16)
"হার্মোনিক"/"saturation"/"উষ্ণ স্যাচুরেশন" → harmonic_saturation(0.5)+loudness_normalize(-14)
"রুম কারেকশন"/"room correction"/"অ্যাকুস্টিক" → room_correction+loudness_normalize(-16)
"ডায়নামিক EQ"/"dynamic eq" → dynamic_eq+loudness_normalize(-14)
"মাল্টিব্যান্ড গেট"/"multiband gate" → multiband_gate+loudness_normalize(-16)

NEW ADVANCED OPERATIONS (v8.0 — Background Music & Advanced Mixing):
- multi_segment_mix{intro_db:-14, verse_db:-22, outro_db:-14, intro_duration:3, outro_duration:4} = ইন্ট্রো/ভার্স/আউট্রো স্টাইল মাল্টি-সেগমেন্ট মিক্স
- adaptive_ducking{music_intensity:"low"|"medium"|"high"} = অ্যাডাপ্টিভ সাইডচেইন ডাকিং — ভোকাল শুনলে মিউজিক অটো ডাক হয়
- vocal_harmony{voices:2, spread:0.3} = ভোকাল হারমোনি যোগ — তৃতীয় লেয়ার যোগ করে রিচনেস বাড়ানো
- stereo_field_expand{width:1.5} = স্টেরিও ফিল্ড সম্প্রসারিত করা — বিশাল শব্দ মাঠ
- vintage_warmth{} = পুরনো অ্যানালগ উষ্ণতা — টেপ/ভিনাইল স্টাইল সাচুরেশন
- spatial_audio{} = স্পেশিয়াল অডিও — ত্রিমাত্রিক শব্দের অনুভূতি
- dynamic_normalize{} = ডাইনামিক নরমালাইজেশন — লাউড ও কোয়ায়েট অংশ সমান করা
- voice_clone_preset{style:"honey"|"broadcast"|"asmr"|"epic"|"narrator"} = ভয়েস ক্লোন প্রিসেট — নির্দিষ্ট স্টাইলে ভয়েস রূপান্তর
- noise_profile_learn{} = নয়েজ প্রফাইল শেখা — স্বয়ংক্রিয় নয়েজ রিডাকশন
NEW SMART MIX MODES (v8.0):
- "ইন্ট্রো সহ মিক্স"/ "intro music mix" → multi_segment_mix(intro_db:-14,verse_db:-22,outro_db:-14)
- "অ্যাডাপ্টিভ ডাকিং"/ "adaptive ducking" → adaptive_ducking(medium)
- "হার্মোনি যোগ করো"/ "add harmony" → vocal_harmony(voices:2,spread:0.3)
- "স্টেরিও বড় করো"/ "stereo expand" → stereo_field_expand(width:1.5)
- "ভিনটেজ উষ্ণতা"/ "vintage warmth" → vintage_warmth
- "স্পেশ্যাল অডিও"/ "spatial audio"/ "3D sound" → spatial_audio
- "ডায়নামিক নরমালাইজ"/ "dynamic normalize" → dynamic_normalize
NEW VOICE PRESETS (v9.0 — Specialized Character Voices):
- cinematic_bangla{} = সিনেমাটিক বাংলা ভয়েস — গভীর উষ্ণতা, নাটকীয় রিভার্ব, সিনেমাটিক প্রেজেন্স বুস্ট
- radio_jockey{} = রেডিও জকি ভয়েস — পাঞ্চি কম্প্রেশন, এনার্জেটিক EQ, ব্রাইট প্রেজেন্স
- sufi_voice{} = সুফি ভয়েস — রহস্যময় গভীরতা, হল রিভার্ব, মেডিটেটিভ উষ্ণতা
- children_voice{} = শিশু কণ্ঠ — উজ্জ্বল হাই-ফ্রিকোয়েন্সি, স্পষ্ট ক্লারিটি, মৃদু কম্প্রেশন
- elderly_voice{} = বয়স্ক কণ্ঠ — উষ্ণ লো-মিড, মৃদু উপস্থিতি, স্বাভাবিক টেক্সচার
- lofi_chill{} = লো-ফাই চিল — ভিন্টেজ উষ্ণতা, মৃদু ডিস্টর্শন, রিল্যাক্সড ফিল
- nature_ambient{} = নেচার অ্যাম্বিয়েন্ট — বিস্তৃত স্টেরিও, বায়বীয় রিভার্ব, প্রাকৃতিক টেক্সচার
- drama_voice{} = ড্রামা ভয়েস — শক্তিশালী প্রজেকশন, নাটকীয় ডাইনামিক্স, থিয়েটার-স্টাইল
- spectral_denoise{} = স্পেকট্রাল ডিনয়েজ — মাল্টি-পাস নয়েজ রিডাকশন, ফ্রিকোয়েন্সি-ডোমেইন ক্লিনিং
- ai_noise_gate{} = AI নয়েজ গেট — স্মার্ট সাইলেন্স ডিটেকশন, ভয়েস-অ্যাক্টিভিটি-ডিটেকশন
- voice_enhancer_pro{} = ভয়েস এনহ্যান্সার প্রো — সম্পূর্ণ প্রসেসিং চেইন: ডিনয়েজ+EQ+কম্প্রেশন+লিমিটার
NEW v9.0 SMART RULES:
- "সিনেমাটিক বাংলা"/ "cinematic bangla"/ "সিনেমাটিক ভয়েস" → cinematic_bangla
- "রেডিও জকি"/ "radio jockey"/ "rj voice"/ "আরজে ভয়েস" → radio_jockey
- "সুফি ভয়েস"/ "sufi"/ "আধ্যাত্মিক"/ "spiritual voice" → sufi_voice
- "শিশু কণ্ঠ"/ "children voice"/ "বাচ্চার ভয়েস" → children_voice
- "বয়স্ক কণ্ঠ"/ "elderly voice"/ "senior voice" → elderly_voice
- "লো-ফাই চিল"/ "lofi chill"/ "lo-fi" → lofi_chill
- "নেচার অ্যাম্বিয়েন্ট"/ "nature ambient"/ "প্রকৃতির শব্দ" → nature_ambient
- "ড্রামা ভয়েস"/ "drama voice"/ "নাটকীয় কণ্ঠ" → drama_voice
- "স্পেকট্রাল ডিনয়েজ"/ "spectral denoise"/ "গভীর নয়েজ" → spectral_denoise
- "AI নয়েজ গেট"/ "ai noise gate"/ "smart noise gate" → ai_noise_gate
- "ভয়েস এনহ্যান্সার প্রো"/ "voice enhancer pro"/ "প্রো এনহ্যান্স" → voice_enhancer_pro
OUTPUT FORMAT (JSON only):
{
  "operations": [{"type": "OPERATION_NAME", "params": {"key": value}}, ...],
  "explanation": "বাংলায় বিস্তারিত ব্যাখ্যা",
  "pipeline": ["ধাপ ১: ...", "ধাপ ২: ...", "ধাপ ৩: ..."],
  "intent": "detected intent label",
  "technicalNote": "technical details (optional)",
  "vocalContext": "general|poetry|narration|deep|soft",
  "hasMusicMix": true/false,
  "musicIntensity": "low|medium|high",
  "mixMode": "standard|multi_segment|adaptive_ducking"
}

NOISE REDUCTION RULES (CRITICAL — voice must be preserved):
- noise_reduction strength scale: 0.3=হালকা, 0.5=মাঝারি, 0.7=শক্তিশালী, 0.85=মাক্স
- NEVER use strength > 0.85 for noise_reduction (voice will be damaged)
- For "নয়েজ কমাও" / "noise remove" → noise_reduction(0.5) FIRST, then check
- For "আরো নয়েজ কমাও" → increase by 0.15 only (never jump to 1.0)
- For heavy noise: use denoise_advanced(0.7) NOT noise_reduction(1.0)
- denoise_advanced strength: 0.5=মাঝারি, 0.7=শক্তিশালী, 0.85=মাক্স (NEVER above 0.9)
- ALWAYS combine with vocal_enhance after noise reduction to restore voice clarity
- Pattern: noise_reduction(0.5) + vocal_enhance + loudness_normalize(-16)
- For "কণ্ঠ ঠিক রেখে নয়েজ সরাও" → noise_reduction(0.45) + vocal_enhance + presence_boost + loudness_normalize(-14)
- For "স্টুডিও মান" → denoise_advanced(0.7) + de_ess + compress(-22,3) + loudness_normalize(-14)

IMPORTANT: Use proportional values. For iterative requests increase strength by 0.1-0.2 only.

ADDITIONAL SMART RULES:
- "silence_remove" / "নীরবতা সরাও" / "শুরুর চুপ কাটো" → silence_remove(-40)
- "loop" / "লুপ করো" / "বারবার বাজাও" → loop(times:3)
- "add_silence" / "শুরুতে বিরতি যোগ করো" → add_silence(1000, start)
- "crossfade" / "smooth transition" → crossfade(2000)
- "ডাকিং" / "ducking" → ducking(-20, 10)
- "ব্যাকগ্রাউন্ড মিউজিক মিক্স করো" → smart_mix(medium,true,general)
- "মাল্টিব্যান্ড কম্প্রেস" / "multiband" → multiband_compress
- "স্পেকট্রাল রিপেয়ার" / "spectral repair" → spectral_repair
- "ট্রু পিক" / "true peak" → true_peak_limit(-1)
- "ফর্মান্ট" / "formant" → formant_shift(1.0)
- "হার্মোনিক" / "exciter" / "উজ্জ্বল করো" → harmonic_exciter(0.5)
- "ব্যালেন্স বাম" / "pan left" → stereo_balance(-0.5)
- "ব্যালেন্স ডান" / "pan right" → stereo_balance(0.5)
- "ফ্ল্যাঞ্জার" / "flanger" → flanger(0.5, 5)
- "ফেজার" / "phaser" → phaser(1.0, 0.7)
- "ট্রেমোলো" / "tremolo" → tremolo(5, 0.5)
- "ভাইব্রেটো" / "vibrato" → vibrato(5, 0.5)
- "বিটক্রাশার" / "bitcrusher" / "8-bit" → bitcrusher(8)
- "ক্লিপিং ঠিক করো" / "distorted fix" → declip
- "ক্লিক সরাও" / "pop remove" → declick
- "ব্যান্ড পাস" / "band pass" → band_pass_filter(300, 3000)
- "নচ ফিল্টার" / "notch" → notch_filter(60)
- "স্টেরিও মনো" / "mono" → stereo_to_mono
- "মনো স্টেরিও" / "stereo" → mono_to_stereo`;

// ── Build FFmpeg filter string from AI operations ────────────────────────────
function buildFFmpegFilter(operations, vocalDuration) {
  const filters = [];
  let pitchShift = null;
  let speedFactor = null;

  for (const op of operations) {
    const { type, params = {} } = op;
    switch (type) {
      // ── Phase 1: Smart Mix operations ──
      case "vocal_normalize": {
        const lufs = params.target_lufs || -16;
        filters.push(`loudnorm=I=${lufs}:TP=-1.5:LRA=11`);
        break;
      }
      case "smart_fade": {
        const dur = vocalDuration ? getSmartFadeDuration(vocalDuration) : 3;
        if (vocalDuration) {
          filters.push(`afade=t=out:st=${Math.max(0, vocalDuration - dur)}:d=${dur}`);
        } else {
          filters.push(`afade=t=out:st=0:d=${dur}`);
        }
        break;
      }
      case "music_extend":
        // This is handled separately in smart mix flow; skip in single-file filter
        break;
      case "smart_mix":
        // Handled separately in the main handler with music file
        break;

      // ── Phase 2: Vocal Enhancement Presets ──
      case "natural_clean":
        filters.push("highpass=f=80,equalizer=f=200:t=h:width=200:g=2,equalizer=f=3000:t=h:width=2000:g=2,equalizer=f=5000:t=h:width=2000:g=1.5,acompressor=threshold=-20dB:ratio=3:attack=20:release=200:knee=6dB,loudnorm=I=-16:TP=-1.5:LRA=11");
        break;
      case "warm_voice":
        filters.push("highpass=f=80,equalizer=f=250:t=h:width=200:g=4,equalizer=f=400:t=h:width=200:g=2,equalizer=f=3000:t=h:width=1500:g=1.5,acompressor=threshold=-22dB:ratio=2.5:attack=25:release=300:knee=8dB,loudnorm=I=-16:TP=-1.5:LRA=11");
        break;
      case "studio_clear":
        filters.push("highpass=f=90,equalizer=f=3000:t=h:width=2000:g=3,equalizer=f=5000:t=h:width=2000:g=2,de_ess,acompressor=threshold=-18dB:ratio=3.5:attack=15:release=150:knee=5dB,loudnorm=I=-14:TP=-1:LRA=11");
        break;
      case "soft_poetry":
        filters.push("highpass=f=80,equalizer=f=250:t=h:width=200:g=3,equalizer=f=400:t=h:width=200:g=2,equalizer=f=3000:t=h:width=1500:g=1.5,acompressor=threshold=-22dB:ratio=2.5:attack=25:release=300:knee=8dB,aecho=0.8:0.15:60:0.25,loudnorm=I=-16:TP=-1.5:LRA=11");
        break;
      case "deep_recitation":
        filters.push("highpass=f=60,equalizer=f=150:t=h:width=100:g=4,equalizer=f=300:t=h:width=150:g=2,equalizer=f=200:t=h:width=150:g=-1.5,acompressor=threshold=-18dB:ratio=4:attack=20:release=200:knee=4dB,aecho=0.8:0.12:40:0.2,loudnorm=I=-14:TP=-1:LRA=11");
        break;
      case "context_enhance": {
        const ctx = params.vocal_context || "general";
        filters.push(getContextVocalFilter(ctx));
        break;
      }

      // ── Existing operations ──
      case "noise_reduction": {
        const s = Math.min(Math.max(params.strength || 0.5, 0.0), 0.85);
        filters.push(`highpass=f=80:poles=2`);
        const nrVal1 = Math.round(10 + s * 25);
        const nfVal1 = Math.round(-25 - s * 5);
        filters.push(`afftdn=nr=${nrVal1}:nf=${nfVal1}:nt=w:tn=1`);
        const gateThresh = Math.round(-50 + s * 15);
        filters.push(`agate=threshold=${gateThresh}dB:attack=20:release=300:ratio=10`);
        filters.push(`equalizer=f=300:t=h:width=200:g=1.5`);
        filters.push(`equalizer=f=3000:t=h:width=1500:g=2.0`);
        break;
      }
      case "denoise_advanced": {
        const sa = Math.min(Math.max(params.strength || 0.7, 0.0), 0.85);
        filters.push(`highpass=f=80:poles=2`);
        filters.push(`equalizer=f=50:t=h:width=5:g=-20`);
        const nrValA = Math.round(15 + sa * 20);
        const nfValA = Math.round(-26 - sa * 6);
        filters.push(`afftdn=nr=${nrValA}:nf=${nfValA}:nt=w:tn=1`);
        const gateA = Math.round(-45 + sa * 10);
        filters.push(`agate=threshold=${gateA}dB:attack=20:release=300:ratio=10`);
        filters.push(`equalizer=f=300:t=h:width=200:g=2.0`);
        filters.push(`equalizer=f=3500:t=h:width=1500:g=2.5`);
        break;
      }
      case "normalize":
        filters.push("loudnorm=I=-16:TP=-1.5:LRA=11");
        break;
      case "volume_change":
        filters.push(`volume=${params.db || 0}dB`);
        break;
      case "fade_in":
        filters.push(`afade=t=in:d=${(params.duration_ms || 500) / 1000}`);
        break;
      case "fade_out": {
        const fadeDur = (params.duration_ms || 2000) / 1000;
        if (vocalDuration) {
          filters.push(`afade=t=out:st=${Math.max(0, vocalDuration - fadeDur)}:d=${fadeDur}`);
        } else {
          filters.push(`afade=t=out:st=0:d=${fadeDur}`);
        }
        break;
      }
      case "reverse":
        filters.push("areverse");
        break;
      case "trim":
        filters.push(`atrim=start=${(params.start_ms || 0) / 1000}${params.end_ms ? `:end=${params.end_ms / 1000}` : ""}`);
        break;
      case "silence_remove":
        filters.push(`silenceremove=start_periods=1:start_threshold=${params.threshold_db || -40}dB:stop_periods=-1:stop_threshold=${params.threshold_db || -40}dB`);
        break;
      case "pitch_shift":
        pitchShift = params.semitones || 0;
        break;
      case "speed_change":
        speedFactor = params.factor || 1.0;
        break;
      case "pitch_without_speed": {
        const ratio = Math.pow(2, (params.semitones || 0) / 12);
        filters.push(`asetrate=r=${Math.round(44100 * ratio)},aresample=44100`);
        break;
      }
      case "bass_boost":
        filters.push(`equalizer=f=100:t=h:width=200:g=${params.db || 4}`);
        break;
      case "bass_cut":
        filters.push(`equalizer=f=100:t=h:width=200:g=${-(params.db || 4)}`);
        break;
      case "treble_boost":
        filters.push(`equalizer=f=8000:t=h:width=4000:g=${params.db || 4}`);
        break;
      case "treble_cut":
        filters.push(`equalizer=f=8000:t=h:width=4000:g=${-(params.db || 4)}`);
        break;
      case "mid_boost":
        filters.push(`equalizer=f=2500:t=h:width=2000:g=${params.db || 3}`);
        break;
      case "equalizer":
        if (params.bass_db) filters.push(`equalizer=f=100:t=h:width=200:g=${params.bass_db}`);
        if (params.mid_db) filters.push(`equalizer=f=2500:t=h:width=2000:g=${params.mid_db}`);
        if (params.treble_db) filters.push(`equalizer=f=8000:t=h:width=4000:g=${params.treble_db}`);
        break;
      case "low_pass_filter":
        filters.push(`lowpass=f=${params.cutoff_hz || 4000}`);
        break;
      case "high_pass_filter":
        filters.push(`highpass=f=${params.cutoff_hz || 80}`);
        break;
      case "band_pass_filter":
        filters.push(`highpass=f=${params.low_hz || 300},lowpass=f=${params.high_hz || 3000}`);
        break;
      case "notch_filter":
        filters.push(`equalizer=f=${params.freq_hz || 60}:t=h:width=30:g=-30`);
        break;
      case "presence_boost":
        filters.push("equalizer=f=3000:t=h:width=2000:g=3,equalizer=f=5000:t=h:width=2000:g=2");
        break;
      case "warmth_boost":
        filters.push("equalizer=f=250:t=h:width=200:g=3,equalizer=f=400:t=h:width=200:g=2");
        break;
      case "air_boost":
        filters.push("equalizer=f=12000:t=h:width=4000:g=3,equalizer=f=16000:t=h:width=4000:g=2");
        break;
      case "dehum": {
        const freq = params.freq || 50;
        filters.push(`equalizer=f=${freq}:t=h:width=10:g=-30,equalizer=f=${freq*2}:t=h:width=10:g=-20,equalizer=f=${freq*3}:t=h:width=10:g=-15`);
        break;
      }
      case "compress":
        filters.push(`acompressor=threshold=${params.threshold_db || -20}dB:ratio=${params.ratio || 4}:attack=20:release=250:makeup=2dB:knee=6dB`);
        break;
      case "gate":
        filters.push(`agate=threshold=${params.threshold_db || -40}dB:attack=10:release=200`);
        break;
      case "limiter":
        filters.push(`alimiter=limit=${params.ceiling_db || -1}dB:attack=5:release=50`);
        break;
      case "true_peak_limit":
        filters.push(`alimiter=limit=${params.ceiling_db || -1}dB:attack=1:release=10`);
        break;
      case "expander":
        filters.push(`agate=threshold=${params.threshold_db || -40}dB:ratio=${params.ratio || 2}:attack=5:release=100`);
        break;
      case "multiband_compress":
        filters.push("acompressor=threshold=-30dB:ratio=3:attack=20:release=200:knee=6dB");
        break;
      case "vocal_enhance":
        filters.push("highpass=f=80,equalizer=f=200:t=h:width=200:g=2,equalizer=f=3000:t=h:width=2000:g=2,equalizer=f=5000:t=h:width=2000:g=1.5,acompressor=threshold=-20dB:ratio=3:attack=20:release=200:knee=6dB");
        break;
      case "de_ess":
        filters.push("equalizer=f=7000:t=h:width=3000:g=-4,equalizer=f=9000:t=h:width=2000:g=-2");
        break;
      case "declick":
        filters.push("equalizer=f=9000:t=h:width=3000:g=-2,equalizer=f=12000:t=h:width=3000:g=-3");
        break;
      case "declip":
        filters.push("acompressor=threshold=-6dB:ratio=20:attack=1:release=10:knee=3dB,alimiter=limit=-1dB:attack=1:release=5");
        break;
      case "spectral_repair":
        filters.push("highpass=f=80,afftdn=nr=25:nf=-28:nt=w:tn=1,equalizer=f=3000:t=h:width=1500:g=2");
        break;
      case "loudness_normalize":
        filters.push(`loudnorm=I=${params.target_lufs || -14}:TP=-1:LRA=11`);
        break;
      case "stereo_widen":
        filters.push(`stereotools=mlev=${params.width || 1.5}:slev=1`);
        break;
      case "stereo_narrow":
        filters.push("stereotools=mlev=0.5:slev=1");
        break;
      case "stereo_to_mono":
        filters.push("pan=mono|c0=0.5*c0+0.5*c1");
        break;
      case "mono_to_stereo":
        filters.push("pan=stereo|c0=c0|c1=c0");
        break;
      case "stereo_balance": {
        const pan = params.pan || 0;
        if (pan < 0) filters.push(`pan=stereo|c0=${1+pan}*c0+${-pan}*c1|c1=c1`);
        else filters.push(`pan=stereo|c0=c0|c1=${1-pan}*c1+${pan}*c0`);
        break;
      }
      case "harmonic_exciter": {
        const amt = params.amount || 0.5;
        filters.push(`equalizer=f=5000:t=h:width=3000:g=${amt*4},equalizer=f=10000:t=h:width=4000:g=${amt*3}`);
        break;
      }
      case "transient_shaper": {
        const atk = params.attack || 0.5;
        filters.push(`acompressor=threshold=-20dB:ratio=4:attack=${atk > 0 ? 5 : 20}:release=100:knee=3dB`);
        break;
      }
      case "reverb": {
        const room = params.room_size || 0.5;
        const wet = params.wet_level || 0.3;
        filters.push(`aecho=0.8:${wet}:${Math.round(room*500)}:${room*0.5}`);
        break;
      }
      case "echo": {
        const delay = params.delay_ms || 300;
        const decay = params.decay || 0.5;
        const reps = Math.min(params.repeats || 3, 5);
        let echoStr = "aecho=0.8:0.7";
        for (let i = 1; i <= reps; i++) echoStr += `:${delay*i}:${Math.pow(decay,i).toFixed(2)}`;
        filters.push(echoStr);
        break;
      }
      case "chorus":
        filters.push(`chorus=0.7:0.9:${Math.round((params.depth||0.5)*50)}:0.4:${params.rate||1.5}:1`);
        break;
      case "distortion": {
        const gain = params.gain || 3;
        filters.push(`volume=${gain}dB,acompressor=threshold=-10dB:ratio=20:attack=1:release=50,alimiter=limit=-1dB`);
        break;
      }
      case "telephone_effect":
        filters.push("highpass=f=300,lowpass=f=3000,equalizer=f=1500:t=h:width=1000:g=6,volume=2dB");
        break;
      case "robot_voice":
        filters.push("aecho=0.8:0.5:20:0.5,chorus=0.9:0.9:50:0.5:2:1,equalizer=f=1000:t=h:width=500:g=4");
        break;
      case "deep_voice":
        filters.push("asetrate=r=38000,aresample=44100,equalizer=f=100:t=h:width=200:g=5");
        break;
      case "chipmunk_voice":
        filters.push("asetrate=r=55000,aresample=44100");
        break;
      case "whisper_effect":
        filters.push("highpass=f=2000,volume=0.7dB,aecho=0.5:0.3:50:0.2");
        break;
      case "flanger":
        filters.push(`flanger=delay=5:depth=5:speed=${params.rate||0.5}`);
        break;
      case "phaser":
        filters.push(`aphaser=in_gain=0.4:out_gain=0.74:delay=3:decay=${params.depth||0.7}:speed=${params.rate||1.0}`);
        break;
      case "tremolo":
        filters.push(`tremolo=f=${params.rate||5}:d=${params.depth||0.5}`);
        break;
      case "vibrato":
        filters.push(`vibrato=f=${params.rate||5}:d=${params.depth||0.5}`);
        break;
      case "bitcrusher":
        filters.push(`acrusher=bits=${params.bits||8}:mode=log:aa=1`);
        break;
      case "tape_saturation": {
        const drive = params.drive || 1.0;
        filters.push(`volume=${drive*6}dB,acompressor=threshold=-10dB:ratio=10:attack=1:release=50,alimiter=limit=-1dB`);
        break;
      }
      case "vinyl_effect":
        filters.push("aecho=0.8:0.3:20:0.2,equalizer=f=60:t=h:width=30:g=-5,equalizer=f=12000:t=h:width=4000:g=-8");
        break;
      case "underwater_effect":
        filters.push("lowpass=f=500,aecho=0.8:0.5:100:0.4,equalizer=f=200:t=h:width=200:g=4");
        break;
      case "cave_echo":
        filters.push("aecho=0.8:0.6:500:0.6:800:0.4,equalizer=f=500:t=h:width=400:g=3");
        break;
      case "stadium_reverb":
        filters.push("aecho=0.8:0.7:300:0.5:600:0.4:900:0.3,equalizer=f=1000:t=h:width=1000:g=2");
        break;
      case "bathroom_reverb":
        filters.push("aecho=0.8:0.6:80:0.7:160:0.5,equalizer=f=3000:t=h:width=2000:g=4");
        break;
      case "alien_voice":
        filters.push("aecho=0.8:0.5:50:0.5,aphaser=speed=2:decay=0.6,vibrato=f=10:d=0.5");
        break;
      case "megaphone_effect":
        filters.push("highpass=f=400,lowpass=f=4000,equalizer=f=2000:t=h:width=1000:g=10");
        break;
      case "radio_effect":
        filters.push("highpass=f=500,lowpass=f=3500,equalizer=f=2000:t=h:width=1000:g=5,aecho=0.8:0.3:20:0.2");
        break;
      case "vocal_isolation":
        filters.push("pan=mono|c0=c0-c1,highpass=f=100,lowpass=f=8000");
        break;
      case "music_removal":
        filters.push("pan=mono|c0=c0+c1,highpass=f=100,lowpass=f=8000");
        break;
      case "auto_tune": {
        const str = params.strength || 0.5;
        filters.push(`aecho=0.8:0.3:20:0.5,chorus=0.7:0.9:20:0.5:2:1,equalizer=f=3000:t=h:width=2000:g=${str*4}`);
        break;
      }
      case "formant_shift": {
        const shift = params.shift || 1.0;
        filters.push(`asetrate=r=${Math.round(44100 * shift)},aresample=44100,atempo=${(1/shift).toFixed(2)}`);
        break;
      }
      case "honey_voice":
        filters.push("highpass=f=80,equalizer=f=250:t=h:width=200:g=4,equalizer=f=3500:t=h:width=2000:g=2,acompressor=threshold=-20dB:ratio=3:attack=20:release=200:knee=6dB,loudnorm=I=-14");
        break;
      case "silky_voice":
        filters.push("highpass=f=100,equalizer=f=400:t=h:width=300:g=2,equalizer=f=5000:t=h:width=3000:g=3,acompressor=threshold=-22dB:ratio=2.5:attack=25:release=250:knee=8dB,loudnorm=I=-16");
        break;
      case "broadcast_voice":
        filters.push("highpass=f=70,equalizer=f=150:t=h:width=100:g=5,equalizer=f=3000:t=h:width=1500:g=3,equalizer=f=6000:t=h:width=2000:g=2,acompressor=threshold=-18dB:ratio=4:attack=15:release=150:knee=4dB,alimiter=limit=-1dB,loudnorm=I=-14");
        break;
      case "asmr_voice":
        filters.push("highpass=f=150,equalizer=f=6000:t=h:width=4000:g=6,equalizer=f=12000:t=h:width=4000:g=4,acompressor=threshold=-30dB:ratio=5:attack=10:release=100:knee=2dB,volume=6dB");
        break;
      case "cinematic_voice":
        filters.push("highpass=f=60,equalizer=f=100:t=h:width=80:g=6,equalizer=f=400:t=h:width=200:g=-2,equalizer=f=3500:t=h:width=2000:g=4,acompressor=threshold=-20dB:ratio=4:attack=20:release=200:knee=4dB,aecho=0.8:0.2:40:0.3,loudnorm=I=-14");
        break;
      case "angelic_voice":
        filters.push("highpass=f=200,equalizer=f=5000:t=h:width=3000:g=5,equalizer=f=10000:t=h:width=4000:g=4,aecho=0.8:0.4:100:0.5:200:0.3,loudnorm=I=-16");
        break;
      case "podcast_pro":
        filters.push("highpass=f=80,equalizer=f=200:t=h:width=150:g=3,equalizer=f=3000:t=h:width=2000:g=3,acompressor=threshold=-18dB:ratio=3.5:attack=20:release=200:knee=5dB,agate=threshold=-40dB,loudnorm=I=-16");
        break;
      case "lofi_voice":
        filters.push("highpass=f=400,lowpass=f=4000,equalizer=f=2000:t=h:width=1000:g=4,acrusher=bits=12:mode=log,aecho=0.8:0.2:20:0.3");
        break;
      case "narrator_voice":
        filters.push("highpass=f=90,equalizer=f=300:t=h:width=200:g=2,equalizer=f=4000:t=h:width=2000:g=2,acompressor=threshold=-20dB:ratio=3:attack=20:release=250:knee=6dB,loudnorm=I=-18");
        break;
      case "smooth_jazz_voice":
        filters.push("highpass=f=100,equalizer=f=300:t=h:width=200:g=3,equalizer=f=2500:t=h:width=1500:g=2,aecho=0.8:0.25:50:0.4,loudnorm=I=-16");
        break;
      case "epic_voice":
        filters.push("highpass=f=70,equalizer=f=150:t=h:width=100:g=6,equalizer=f=3000:t=h:width=2000:g=4,acompressor=threshold=-15dB:ratio=5:attack=10:release=100:knee=3dB,volume=2dB,loudnorm=I=-12");
        break;
      case "sweet_voice":
        filters.push("highpass=f=150,equalizer=f=4000:t=h:width=2000:g=4,equalizer=f=8000:t=h:width=3000:g=3,acompressor=threshold=-25dB:ratio=2.5:attack=30:release=300:knee=10dB,loudnorm=I=-16");
        break;
      case "crystal_voice":
        filters.push("highpass=f=120,equalizer=f=5000:t=h:width=3000:g=5,equalizer=f=10000:t=h:width=4000:g=4,acompressor=threshold=-20dB:ratio=2:attack=20:release=200:knee=6dB,loudnorm=I=-14");
        break;
      case "deep_warm_voice":
        filters.push("highpass=f=60,equalizer=f=150:t=h:width=100:g=6,equalizer=f=300:t=h:width=150:g=2,acompressor=threshold=-18dB:ratio=4:attack=20:release=200:knee=4dB,loudnorm=I=-14");
        break;

      // ── NEW VOICE PRESETS v7.0 ────────────────────────────────────────────────
      case "youtube_voice":
        // YouTube: crisp, clear, engaging — mid-high clarity + gentle compression
        filters.push("highpass=f=80,equalizer=f=200:t=h:width=150:g=-2,equalizer=f=3000:t=h:width=2000:g=3,equalizer=f=8000:t=h:width=3000:g=2,equalizer=f=7000:t=h:width=3000:g=-3,acompressor=threshold=-20dB:ratio=3:attack=15:release=150:knee=5dB,alimiter=limit=-1dB,loudnorm=I=-14");
        break;
      case "tiktok_voice":
        // TikTok/Reels: punchy, bright, modern — enhanced presence + tight compression
        filters.push("highpass=f=100,equalizer=f=250:t=h:width=200:g=-3,equalizer=f=3500:t=h:width=2000:g=4,equalizer=f=9000:t=h:width=4000:g=3,acompressor=threshold=-18dB:ratio=4:attack=8:release=80:knee=3dB,alimiter=limit=-0.5dB,loudnorm=I=-12");
        break;
      case "audiobook_voice":
        // Audiobook: warm, smooth, fatigue-free — long listening optimized
        filters.push("highpass=f=70,equalizer=f=150:t=h:width=100:g=3,equalizer=f=400:t=h:width=300:g=1,equalizer=f=5000:t=h:width=3000:g=-1,acompressor=threshold=-22dB:ratio=2.5:attack=25:release=300:knee=8dB,loudnorm=I=-18");
        break;
      case "meditation_voice":
        // Meditation: calm, soft, spacious — gentle reverb + soft compression
        filters.push("highpass=f=60,equalizer=f=300:t=h:width=200:g=2,equalizer=f=6000:t=h:width=4000:g=2,acompressor=threshold=-28dB:ratio=2:attack=40:release=400:knee=12dB,aecho=0.8:0.3:80:0.4,loudnorm=I=-20");
        break;
      case "news_anchor":
        // News anchor: authoritative, clear, professional — broadcast standard
        filters.push("highpass=f=80,equalizer=f=150:t=h:width=100:g=4,equalizer=f=400:t=h:width=200:g=-1,equalizer=f=3000:t=h:width=1500:g=4,equalizer=f=6000:t=h:width=2000:g=2,acompressor=threshold=-16dB:ratio=5:attack=10:release=100:knee=3dB,alimiter=limit=-1dB,loudnorm=I=-14");
        break;
      case "bangla_recitation_pro":
        // Bengali recitation: warm reverb, emotional depth, natural resonance
        filters.push("highpass=f=70,equalizer=f=200:t=h:width=150:g=4,equalizer=f=500:t=h:width=300:g=2,equalizer=f=3000:t=h:width=2000:g=2,acompressor=threshold=-22dB:ratio=3:attack=25:release=250:knee=7dB,aecho=0.8:0.35:120:0.45,loudnorm=I=-16");
        break;
      case "voice_message_clean":
        // WhatsApp/Telegram voice message: clean, intelligible, compact
        filters.push("highpass=f=100,lowpass=f=8000,afftdn=nr=12:nf=-25:nt=w,acompressor=threshold=-20dB:ratio=3:attack=15:release=150:knee=5dB,loudnorm=I=-16");
        break;
      case "conference_voice":
        // Conference call: clear, noise-free, intelligible — online meeting optimized
        filters.push("highpass=f=120,lowpass=f=7500,afftdn=nr=15:nf=-30:nt=w,agate=threshold=-38dB:attack=10:release=100,acompressor=threshold=-18dB:ratio=3.5:attack=12:release=120:knee=4dB,loudnorm=I=-16");
        break;

      // ── NEW ADVANCED OPERATIONS v7.0 ─────────────────────────────────────────
      case "de_breath":
        // De-breath: voice gate to reduce breath sounds
        filters.push("agate=threshold=-35dB:attack=5:release=80:ratio=8,equalizer=f=200:t=h:width=200:g=-2");
        break;
      case "de_reverb":
        // De-reverb: reduce room reverb via spectral processing
        filters.push("highpass=f=100,afftdn=nr=15:nf=-25:nt=w,equalizer=f=400:t=h:width=300:g=-1");
        break;
      case "stereo_enhancer": {
        const width = Math.min(2.0, Math.max(0.5, params.width || 1.4));
        filters.push(`stereotools=mlev=${width}:slev=${width}:sbal=0:phase=0`);
        break;
      }
      case "dynamic_eq":
        // Dynamic EQ: frequency-dependent compression
        filters.push("equalizer=f=200:t=h:width=200:g=2,acompressor=threshold=-22dB:ratio=3:attack=20:release=200:knee=6dB,equalizer=f=5000:t=h:width=3000:g=2,acompressor=threshold=-18dB:ratio=2.5:attack=15:release=150:knee=4dB");
        break;
      case "multiband_gate":
        // Multiband noise gate
        filters.push("agate=threshold=-40dB:attack=5:release=100:ratio=10,highpass=f=80,agate=threshold=-38dB:attack=8:release=120:ratio=8");
        break;
      case "harmonic_saturation": {
        const drive = Math.min(2.0, Math.max(0.1, params.drive || 0.5));
        filters.push(`volume=${drive * 4}dB,acompressor=threshold=-12dB:ratio=8:attack=2:release=30:knee=3dB,alimiter=limit=-1dB,equalizer=f=3000:t=h:width=2000:g=${drive * 2}`);
        break;
      }
      case "room_correction":
        // Room correction: fix acoustic problems
        filters.push("highpass=f=80,equalizer=f=250:t=h:width=200:g=-3,equalizer=f=500:t=h:width=300:g=-2,equalizer=f=1000:t=h:width=400:g=-1,afftdn=nr=10:nf=-20:nt=w");
        break;
      case "clarity_boost":
        // Clarity boost: mid-high frequency enhancement
        filters.push("equalizer=f=2500:t=h:width=2000:g=3,equalizer=f=5000:t=h:width=3000:g=4,equalizer=f=10000:t=h:width=4000:g=2,acompressor=threshold=-20dB:ratio=2.5:attack=20:release=200:knee=6dB");
        break;
      case "punch_boost":
        // Punch boost: transient shaping for impact
        filters.push("acompressor=threshold=-20dB:ratio=4:attack=3:release=50:knee=3dB,equalizer=f=100:t=h:width=80:g=4,equalizer=f=3000:t=h:width=1500:g=3,alimiter=limit=-1dB");
        break;
      case "warmth_enhance":
        // Warmth enhance: low-mid harmonics
        filters.push("equalizer=f=150:t=h:width=100:g=4,equalizer=f=300:t=h:width=200:g=3,equalizer=f=600:t=h:width=300:g=2,acompressor=threshold=-22dB:ratio=2.5:attack=25:release=250:knee=8dB");
        break;
      case "air_enhance":
        // Air enhance: high frequency brilliance
        filters.push("equalizer=f=8000:t=h:width=4000:g=3,equalizer=f=12000:t=h:width=5000:g=4,equalizer=f=16000:t=h:width=4000:g=2,acompressor=threshold=-20dB:ratio=2:attack=20:release=200:knee=6dB");
        break;
      case "voice_focus":
        // Voice focus: mid frequency clarity
        filters.push("equalizer=f=1000:t=h:width=500:g=2,equalizer=f=2000:t=h:width=1000:g=3,equalizer=f=4000:t=h:width=2000:g=3,equalizer=f=200:t=h:width=150:g=-2,acompressor=threshold=-20dB:ratio=3:attack=15:release=150:knee=5dB");
        break;
      case "noise_gate_smart":
        // Smart noise gate: preserves voice, removes silence
        filters.push("agate=threshold=-40dB:attack=8:release=150:ratio=10:range=-60dB,agate=threshold=-38dB:attack=5:release=100:ratio=8");
        break;
      case "pitch_correct":
        // Lightweight pitch correction style enhancement; true scale-aware correction is approximated safely.
        filters.push("chorus=0.7:0.9:20:0.4:1.5:0.8,equalizer=f=3000:t=h:width=2000:g=1.5");
        break;
      case "vintage_radio":
        filters.push("highpass=f=300,lowpass=f=3400,equalizer=f=1200:t=h:width=800:g=4,aecho=0.8:0.18:35:0.22,acrusher=bits=13:mode=log:aa=1");
        break;
      case "vocal_doubler":
        filters.push("asplit=2[d0][d1];[d1]adelay=24|24,volume=0.45[d1d];[d0][d1d]amix=inputs=2:weights=1 0.45");
        break;
      case "multi_segment_mix":
      case "adaptive_ducking":
        // These are handled in the smart-mix path when a music file exists.
        break;
      case "loop": {
        const times = Math.min(Math.max(params.times || 2, 1), 5);
        filters.push(`aloop=loop=${times - 1}:size=2e+09`);
        break;
      }
      case "add_silence": {
        const ms = Math.min(Math.max(params.duration_ms || 1000, 100), 5000);
        const pos = params.position || "start";
        if (pos === "end") filters.push(`apad=pad_dur=${ms / 1000}`);
        else filters.push(`adelay=${ms}|${ms}`);
        break;
      }
      case "ducking":
        filters.push(`volume=${params.level_db || -3}dB,acompressor=threshold=-24dB:ratio=3:attack=15:release=200:knee=6dB`);
        break;
      // ── v8.0 NEW OPERATIONS ────────────────────────────────────────────────────
      case "vocal_harmony": {
        // Vocal harmony: adds 2-3 pitch-shifted layers for richness
        const voices = op.params?.voices || 2;
        const spread = op.params?.spread || 0.3;
        const semitone1 = Math.round(spread * 12);
        const semitone2 = Math.round(-spread * 12);
        if (voices >= 3) {
          filters.push(`asplit=3[h0][h1][h2];[h1]asetrate=r=${Math.round(44100 * Math.pow(2, semitone1/12))},atempo=${(1/Math.pow(2, semitone1/12)).toFixed(3)},aresample=44100,volume=0.4[hv1];[h2]asetrate=r=${Math.round(44100 * Math.pow(2, semitone2/12))},atempo=${(1/Math.pow(2, semitone2/12)).toFixed(3)},aresample=44100,volume=0.35[hv2];[h0][hv1][hv2]amix=inputs=3:weights=1 0.4 0.35`);
        } else {
          filters.push(`asplit=2[h0][h1];[h1]asetrate=r=${Math.round(44100 * Math.pow(2, semitone1/12))},atempo=${(1/Math.pow(2, semitone1/12)).toFixed(3)},aresample=44100,volume=0.45[hv1];[h0][hv1]amix=inputs=2:weights=1 0.45`);
        }
        break;
      }
      case "stereo_field_expand": {
        // Stereo field expansion using mid-side processing
        const width = op.params?.width || 1.5;
        const sideGain = Math.min(width, 2.0).toFixed(2);
        filters.push(`stereotools=mlev=1:slev=${sideGain}:sbal=0`);
        break;
      }
      case "vintage_warmth":
        // Analog warmth: tape saturation + gentle low-mid boost
        filters.push("equalizer=f=120:t=h:width=100:g=3,equalizer=f=300:t=h:width=200:g=2,equalizer=f=8000:t=h:width=3000:g=-1.5,acompressor=threshold=-20dB:ratio=2:attack=20:release=300:knee=10dB");
        break;
      case "spatial_audio":
        // Spatial/3D audio effect using haas effect + stereo widening
        filters.push("asplit=2[a][b];[b]adelay=20|0[b_delayed];[a][b_delayed]amix=inputs=2:weights=1 0.6,stereotools=mlev=1:slev=1.4:sbal=0");
        break;
      case "dynamic_normalize":
        // Dynamic normalization: levels out loud and quiet sections
        filters.push("dynaudnorm=p=0.9:m=100:s=12:g=15:b=1");
        break;
      case "voice_clone_preset": {
        // Voice clone preset: applies style-specific processing
        const style = op.params?.style || "honey";
        const presetFilters = {
          honey: "highpass=f=90,equalizer=f=300:t=h:width=200:g=4,equalizer=f=500:t=h:width=200:g=3,equalizer=f=3500:t=h:width=1500:g=2,acompressor=threshold=-22dB:ratio=2.5:attack=25:release=300:knee=8dB,aecho=0.8:0.12:40:0.2",
          broadcast: "highpass=f=100,equalizer=f=3000:t=h:width=2000:g=4,equalizer=f=5000:t=h:width=2000:g=3,acompressor=threshold=-18dB:ratio=4:attack=10:release=120:knee=4dB,alimiter=limit=-2dB",
          asmr: "highpass=f=60,equalizer=f=200:t=h:width=200:g=3,equalizer=f=8000:t=h:width=3000:g=2,acompressor=threshold=-30dB:ratio=1.5:attack=40:release=500:knee=12dB,aecho=0.9:0.08:25:0.15",
          epic: "highpass=f=80,equalizer=f=150:t=h:width=100:g=5,equalizer=f=3000:t=h:width=2000:g=4,acompressor=threshold=-16dB:ratio=5:attack=8:release=100:knee=3dB,alimiter=limit=-1dB",
          narrator: "highpass=f=90,equalizer=f=250:t=h:width=200:g=3,equalizer=f=3500:t=h:width=1500:g=3,equalizer=f=6000:t=h:width=2000:g=2,acompressor=threshold=-20dB:ratio=3:attack=15:release=200:knee=6dB",
        };
        filters.push(presetFilters[style] || presetFilters.honey);
        break;
      }
      case "noise_profile_learn":
        // Auto noise reduction using spectral analysis (afftdn is more widely supported)
        filters.push("afftdn=nr=15:nf=-25:nt=w,highpass=f=80,acompressor=threshold=-35dB:ratio=6:attack=5:release=100:knee=5dB");
        break;
      // ── v9.0 NEW OPERATIONS ────────────────────────────────────────────────────
      case "cinematic_bangla":
        // Cinematic Bangla: deep warmth + dramatic reverb + wide stereo
        filters.push("highpass=f=70,equalizer=f=100:t=h:width=100:g=4,equalizer=f=250:t=h:width=200:g=3,equalizer=f=3000:t=h:width=2000:g=3,equalizer=f=8000:t=h:width=3000:g=2,acompressor=threshold=-18dB:ratio=4:attack=10:release=150:knee=6dB,aecho=0.85:0.18:60:0.25,stereotools=mlev=1:slev=1.3:sbal=0");
        break;
      case "radio_jockey":
        // Radio Jockey: punchy, energetic, bright presence
        filters.push("highpass=f=100,equalizer=f=200:t=h:width=150:g=-2,equalizer=f=2500:t=h:width=1500:g=5,equalizer=f=5000:t=h:width=2000:g=4,equalizer=f=10000:t=h:width=3000:g=2,acompressor=threshold=-15dB:ratio=6:attack=5:release=80:knee=3dB,alimiter=limit=-1dB");
        break;
      case "sufi_voice":
        // Sufi/spiritual: warm, reverberant, mystical depth
        filters.push("highpass=f=60,equalizer=f=150:t=h:width=100:g=5,equalizer=f=400:t=h:width=300:g=3,equalizer=f=6000:t=h:width=2000:g=-2,acompressor=threshold=-24dB:ratio=2:attack=30:release=400:knee=10dB,aecho=0.9:0.25:80:0.4,aecho=0.7:0.15:150:0.2");
        break;
      case "children_voice":
        // Children's voice: bright, clear, gentle enhancement
        filters.push("highpass=f=120,equalizer=f=500:t=h:width=300:g=2,equalizer=f=3000:t=h:width=2000:g=3,equalizer=f=8000:t=h:width=3000:g=4,acompressor=threshold=-25dB:ratio=2:attack=20:release=300:knee=8dB");
        break;
      case "elderly_voice":
        // Elderly voice: warm low-mids, reduced harshness, gentle compression
        filters.push("highpass=f=80,equalizer=f=200:t=h:width=150:g=4,equalizer=f=500:t=h:width=300:g=3,equalizer=f=4000:t=h:width=2000:g=-3,equalizer=f=8000:t=h:width=3000:g=-4,acompressor=threshold=-22dB:ratio=2.5:attack=25:release=350:knee=10dB");
        break;
      case "lofi_chill":
        // Lo-fi chill: vintage warmth + gentle noise + soft compression
        filters.push("equalizer=f=100:t=h:width=100:g=3,equalizer=f=300:t=h:width=200:g=2,equalizer=f=8000:t=h:width=4000:g=-6,equalizer=f=12000:t=h:width=4000:g=-10,acompressor=threshold=-20dB:ratio=3:attack=20:release=300:knee=8dB,aecho=0.85:0.1:30:0.15");
        break;
      case "nature_ambient":
        // Nature ambient: spacious, airy, open sound
        filters.push("highpass=f=50,equalizer=f=6000:t=h:width=3000:g=3,equalizer=f=12000:t=h:width=4000:g=4,aecho=0.95:0.3:200:0.5,stereotools=mlev=1:slev=1.6:sbal=0");
        break;
      case "drama_voice":
        // Drama/theater: powerful projection, rich resonance
        filters.push("highpass=f=80,equalizer=f=120:t=h:width=100:g=5,equalizer=f=300:t=h:width=200:g=4,equalizer=f=2000:t=h:width=1500:g=3,equalizer=f=5000:t=h:width=2000:g=3,acompressor=threshold=-16dB:ratio=5:attack=8:release=100:knee=4dB,aecho=0.8:0.15:45:0.22,alimiter=limit=-1dB");
        break;
      case "spectral_denoise":
        // Advanced spectral denoising: multi-pass noise reduction
        filters.push("afftdn=nr=25:nf=-35:nt=w,afftdn=nr=15:nf=-25:nt=w,highpass=f=80,acompressor=threshold=-35dB:ratio=8:attack=3:release=80:knee=4dB");
        break;
      case "ai_noise_gate":
        // AI-powered adaptive noise gate: smart silence detection
        filters.push("agate=threshold=-40dB:ratio=8:attack=10:release=200:makeup=1,afftdn=nr=12:nf=-20:nt=w");
        break;
      case "voice_enhancer_pro":
        // Professional voice enhancer: complete processing chain
        filters.push("highpass=f=80,afftdn=nr=15:nf=-25:nt=w,equalizer=f=200:t=h:width=150:g=-2,equalizer=f=3000:t=h:width=2000:g=3,equalizer=f=6000:t=h:width=2000:g=2,acompressor=threshold=-20dB:ratio=3:attack=12:release=180:knee=6dB,alimiter=limit=-1dB");
        break;
    }
  }

  let filterStr = filters.join(",");
  if (pitchShift !== null || speedFactor !== null) {
    const p = pitchShift || 0;
    const s = speedFactor || 1.0;
    const pitchRatio = Math.pow(2, p / 12);
    if (filterStr) filterStr += ",";
    filterStr += `asetrate=r=${Math.round(44100 * pitchRatio)},atempo=${(s / pitchRatio).toFixed(2)},aresample=44100`;
  }
  return filterStr;
}

// ── Main Handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let prompt = "";
  let audioBuffer = null;
  let audioMime = "audio/mpeg";
  let tempFilePath = null;
  let musicFilePath = null; // Phase 1: background music file

  const contentType = req.headers["content-type"] || "";

  if (contentType.includes("application/json")) {
    // Path A: JSON (base64)
    const body = await new Promise((resolve, reject) => {
      let data = [];
      req.on("data", chunk => data.push(chunk));
      req.on("end", () => {
        try {
          const raw = Buffer.concat(data).toString();
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(e);
        }
      });
      req.on("error", reject);
    }).catch(() => ({}));
    prompt = body.instruction || body.prompt;
    audioMime = body.audioMime || "audio/mpeg";
    if (body.audioData) {
      audioBuffer = Buffer.from(body.audioData, "base64");
      tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.tmp`);
      fs.writeFileSync(tempFilePath, audioBuffer);
    }
    // Music file (optional) — base64
    if (body.musicData) {
      const musicBuffer = Buffer.from(body.musicData, "base64");
      musicFilePath = path.join(os.tmpdir(), `music_${Date.now()}.tmp`);
      fs.writeFileSync(musicFilePath, musicBuffer);
    }
  } else {
    // Path B: Multipart (form-data)
    const form = formidable({ uploadDir: os.tmpdir(), keepExtensions: true });
    const [fields, files] = await form.parse(req);
    prompt = fields.prompt?.[0] || fields.instruction?.[0];
    const audioFile = files.audio?.[0];
    if (audioFile) {
      tempFilePath = audioFile.filepath;
      audioMime = audioFile.mimetype || "audio/mpeg";
    }
    // Music file (optional)
    const musicFile = files.music?.[0];
    if (musicFile) {
      musicFilePath = musicFile.filepath;
    }
  }

  if (!tempFilePath || !prompt) {
    return res.status(400).json({ error: "Missing audio file or prompt" });
  }

  const ffmpegPath = getFFmpegPath();

  try {
    // ── Step 1: Get vocal duration for smart processing ──────────────────────
    const vocalDuration = getAudioDuration(tempFilePath, ffmpegPath);

    // ── Step 2: Get AI instructions ──────────────────────────────────────────
    const { client: openai, model } = createAudioAiClient();
    const { source } = resolveAudioAiConfig();
    const isGemini = source === "BUILT_IN_FORGE_API_KEY" || model.includes("gemini");
    
    const payload = {
      model,
      messages: [
        { role: "system", content: AUDIO_SYSTEM_PROMPT + "\nIMPORTANT: Return only one valid JSON object. Do not use markdown fences, explanations outside JSON, or comments." },
        { role: "user", content: prompt }
      ],
    };

    // OpenAI/OpenRouter support structured JSON mode. Gemini's OpenAI-compatible
    // endpoint rejects response_format/thinking in some deployments, so keep the
    // Gemini request minimal and rely on the strict JSON system instruction.
    if (!isGemini) {
      payload.response_format = { type: "json_object" };
    }

    let aiResponse;
    const deterministicPlan = deterministicAudioPlan(prompt);
    if (deterministicPlan.operations.length) {
      aiResponse = deterministicPlan;
    } else {
      try {
        const completion = await openai.chat.completions.create(payload);
        aiResponse = mergeAudioPlan(parseAiJsonObject(completion.choices?.[0]?.message?.content), prompt);
      } catch (aiError) {
        console.warn("Audio AI planning fallback:", aiError?.message || aiError);
        aiResponse = fallbackAudioPlan(prompt);
      }
    }
    const operations = Array.isArray(aiResponse.operations) ? aiResponse.operations : [];

    // ── Step 3: Determine vocal context (Phase 3 AI-aware) ───────────────────
    const vocalContext = aiResponse.vocalContext ||
      classifyVocalContext(aiResponse.intent, operations, prompt);
    // ── Step 4: Check if smart_mix / multi_segment_mix / adaptive_ducking is requested ──────
    const hasMusicMixOp = operations.some(op =>
      op.type === "smart_mix" || op.type === "music_extend" ||
      op.type === "multi_segment_mix" || op.type === "adaptive_ducking"
    );
    const hasMusicFile = !!musicFilePath;
    const shouldDoSmartMix = (hasMusicMixOp || aiResponse.hasMusicMix) && hasMusicFile;
    const mixMode = aiResponse.mixMode || (operations.some(op => op.type === "multi_segment_mix") ? "multi_segment" : operations.some(op => op.type === "adaptive_ducking") ? "adaptive_ducking" : "standard");
    // ── Step 4b: smart_mix চাওয়া হয়েছে কিন্তু music file নেই → ask করো ──────
    if ((hasMusicMixOp || aiResponse.hasMusicMix) && !hasMusicFile) {
      try { if (tempFilePath) fs.unlinkSync(tempFilePath); } catch (e) {}
      return res.status(200).json({
        intent: "ask_music_file",
        needsMusicFile: true,
        explanation: "ব্যাকগ্রাউন্ড মিউজিক যোগ করতে আপনার একটি মিউজিক ফাইল আপলোড করতে হবে। অথবা মিউজিক লাইব্রেরি থেকে বেছে নিন।",
        pipeline: [
          "ধাপ ১: নিচের 🎵 বাটনে ক্লিক করে ব্যাকগ্রাউন্ড মিউজিক ফাইল আপলোড করুন — অথবা 🎵 মিউজিক লাইব্রেরি থেকে বেছে নিন",
          "ধাপ ২: একই নির্দেশ আবার দিন — আমি ভোকাল ও মিউজিক মিক্স করে দেব"
        ],
        operations: [],
      });
    }
    const outputFileName = `edited_${Date.now()}.mp3`;
    const outputPath = path.join(os.tmpdir(), outputFileName);

    if (shouldDoSmartMix) {
      // ── Phase 1/2/3/4: Smart Mix with background music (v8.0 multi-mode) ──────────
      const smartMixOp = operations.find(op =>
        op.type === "smart_mix" || op.type === "multi_segment_mix" || op.type === "adaptive_ducking"
      );
      const musicIntensity = smartMixOp?.params?.music_intensity ||
        aiResponse.musicIntensity || "medium";
      const enableDucking = smartMixOp?.params?.enable_ducking !== false;
      // Build extra vocal filter from non-mix operations
      const nonMixOps = operations.filter(op =>
        !["smart_mix", "music_extend", "smart_fade", "vocal_normalize",
          "multi_segment_mix", "adaptive_ducking"].includes(op.type)
      );
      const extraVocalFilter = buildFFmpegFilter(nonMixOps, vocalDuration);
      let mixPipeline = [];
      // Determine mix mode and execute
      if (mixMode === "multi_segment") {
        // Multi-segment mix: intro/verse/outro style
        const multiOp = operations.find(op => op.type === "multi_segment_mix");
        await buildMultiSegmentMix(ffmpegPath, tempFilePath, musicFilePath, outputPath, {
          vocalContext,
          targetLufs: -16,
          introDb: multiOp?.params?.intro_db || -14,
          verseDb: multiOp?.params?.verse_db || -22,
          outroDb: multiOp?.params?.outro_db || -14,
          introDuration: multiOp?.params?.intro_duration || 3,
          outroDuration: multiOp?.params?.outro_duration || 4,
        });
        mixPipeline = [
          `Mix mode: Multi-Segment (Intro/Verse/Outro)`,
          `Vocal duration: ${vocalDuration ? vocalDuration.toFixed(1) + "s" : "unknown"}`,
          `Context: ${vocalContext}`,
          `Intro: ${multiOp?.params?.intro_duration || 3}s at ${multiOp?.params?.intro_db || -14}dB`,
          `Verse: ${multiOp?.params?.verse_db || -22}dB (music ducked during vocal)`,
          `Outro: ${multiOp?.params?.outro_duration || 4}s at ${multiOp?.params?.outro_db || -14}dB`,
          "Final mastering: loudnorm + limiter -1dB",
        ];
      } else if (mixMode === "adaptive_ducking") {
        // Adaptive ducking: sidechain compression
        buildAdaptiveDucking(ffmpegPath, tempFilePath, musicFilePath, outputPath, {
          vocalContext,
          targetLufs: -16,
          musicIntensity,
        });
        mixPipeline = [
          `Mix mode: Adaptive Sidechain Ducking`,
          `Vocal duration: ${vocalDuration ? vocalDuration.toFixed(1) + "s" : "unknown"}`,
          `Context: ${vocalContext}`,
          `Music intensity: ${musicIntensity}`,
          "Sidechain compression: threshold=0.02, ratio=4:1",
          "Music auto-ducks when vocal is active",
          "Final mastering: loudnorm + limiter -1dB",
        ];
      } else {
        // Standard smart mix
        await buildSmartMix(ffmpegPath, tempFilePath, musicFilePath, outputPath, {
          vocalContext,
          targetLufs: -16,
          musicIntensity,
          enableDucking,
          enableFade: true,
          enableVocalEnhance: true,
          extraVocalFilter,
        });
        mixPipeline = [
          `Mix mode: Standard Smart Mix`,
          `Vocal duration: ${vocalDuration ? vocalDuration.toFixed(1) + "s" : "unknown"}`,
          `Context: ${vocalContext}`,
          `Music intensity: ${musicIntensity}`,
          enableDucking ? "Music ducking: enabled" : "Music ducking: disabled",
          `Fade out: ${getSmartFadeDuration(vocalDuration)}s`,
          "Vocal normalization: -16 LUFS",
          "Final mastering: limiter -1dB",
        ];
      }

      const resultBuffer = fs.readFileSync(outputPath);
      try {
        fs.unlinkSync(tempFilePath);
        if (musicFilePath) fs.unlinkSync(musicFilePath);
        fs.unlinkSync(outputPath);
      } catch (e) {}

      if (contentType.includes("application/json")) {
        return res.status(200).json({
          ...aiResponse,
          audioData: resultBuffer.toString("base64"),
          audioMime: "audio/mpeg",
          pipeline: mixPipeline,
          intent: "smart_mix",
          vocalContext,
          description: aiResponse.explanation || `স্মার্ট মিক্স সম্পন্ন — ${vocalContext} কণ্ঠের জন্য অপ্টিমাইজড মিউজিক মিক্সিং করা হয়েছে।`,
        });
      }

      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("X-AI-Explanation", encodeURIComponent(aiResponse.explanation || "Smart mix completed"));
      return res.send(resultBuffer);
    }

    // ── Standard processing (no music file) ──────────────────────────────────
    // Inject smart fade if fade_out is in operations and we know duration
    const processedOps = operations.map(op => {
      if (op.type === "smart_fade" && vocalDuration) {
        return { ...op, _duration: vocalDuration };
      }
      return op;
    });

    const filterStr = buildFFmpegFilter(processedOps, vocalDuration);

    if (!filterStr) {
      // No filter — return original
      if (contentType.includes("application/json")) {
        return res.status(200).json({
          ...aiResponse,
          audioData: Buffer.from(fs.readFileSync(tempFilePath)).toString("base64"),
          audioMime,
          vocalContext,
        });
      }
      return res.send(fs.readFileSync(tempFilePath));
    }

    // ── Run FFmpeg with filter ────────────────────────────────────────────────
    const safeFilterStr = `aresample=44100,${filterStr}`;
    execFileSync(ffmpegPath, ["-i", tempFilePath, "-af", safeFilterStr, "-ar", "44100", "-y", outputPath], {
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 50 * 1024 * 1024,
      timeout: 55000,
    });

    const resultBuffer = fs.readFileSync(outputPath);

    // Cleanup
    try { fs.unlinkSync(tempFilePath); fs.unlinkSync(outputPath); } catch (e) {}

    if (contentType.includes("application/json")) {
      return res.status(200).json({
        ...aiResponse,
        audioData: resultBuffer.toString("base64"),
        audioMime: "audio/mpeg",
        vocalContext,
        vocalDuration: vocalDuration ? Math.round(vocalDuration) : null,
        processingVersion: "v9.0",
        operationsApplied: operations.map(op => op.type),
        outputSizeKB: Math.round(resultBuffer.length / 1024),
      });
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("X-AI-Explanation", encodeURIComponent(aiResponse.explanation || ""));
    return res.send(resultBuffer);

  } catch (error) {
    console.error("Audio processing error:", error);
    // Cleanup on error
    try { if (tempFilePath) fs.unlinkSync(tempFilePath); } catch (e) {}
    try { if (musicFilePath) fs.unlinkSync(musicFilePath); } catch (e) {}
    return res.status(500).json({ error: "Failed to process audio", details: error.message });
  }
}
