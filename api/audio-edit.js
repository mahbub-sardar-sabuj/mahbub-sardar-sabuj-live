/**
 * /api/audio-edit — AI-powered audio editing serverless function
 *
 * IMPORTANT: Vercel config exports `config = { api: { bodyParser: false } }`
 * so we read the raw stream ourselves and parse multipart manually.
 *
 * Flow:
 * 1. Read raw multipart body from stream
 * 2. Parse: audioFile (binary) + instruction (text)
 * 3. Ask GPT to convert Bengali instruction → ffmpeg filter args
 * 4. Write audio to /tmp, run ffmpeg, return edited file
 */

import { execFileSync } from "child_process";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join, extname } from "path";
import { randomBytes } from "crypto";
import { createRequire } from "module";

// Use ffmpeg-static binary (bundled, works on Vercel)
const require = createRequire(import.meta.url);
let FFMPEG_PATH = "ffmpeg"; // fallback to system ffmpeg
try {
  FFMPEG_PATH = require("ffmpeg-static");
} catch (_) {
  // ffmpeg-static not available, use system ffmpeg
}

// ── Vercel: disable built-in body parser so we can read raw stream ───────────
export const config = {
  api: {
    bodyParser: false,
    responseLimit: "50mb",
  },
};

// ── Read full request body as Buffer ─────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// ── Multipart parser ──────────────────────────────────────────────────────────
function parseMultipart(buffer, boundary) {
  const sep = Buffer.from(`--${boundary}`);
  const CRLF = Buffer.from("\r\n");
  const parts = [];
  let pos = 0;

  while (pos < buffer.length) {
    // Find next boundary
    const boundaryIdx = indexOf(buffer, sep, pos);
    if (boundaryIdx === -1) break;

    const afterBoundary = boundaryIdx + sep.length;

    // Check for terminal --
    if (
      afterBoundary + 2 <= buffer.length &&
      buffer[afterBoundary] === 0x2d &&
      buffer[afterBoundary + 1] === 0x2d
    ) break;

    // Skip \r\n after boundary
    const headerStart = afterBoundary + 2;

    // Find \r\n\r\n (end of headers)
    const headerEnd = indexOf(buffer, Buffer.from("\r\n\r\n"), headerStart);
    if (headerEnd === -1) break;

    const headerStr = buffer.slice(headerStart, headerEnd).toString("utf8");
    const bodyStart = headerEnd + 4;

    // Find next boundary to determine body end
    const nextBoundary = indexOf(buffer, sep, bodyStart);
    const bodyEnd = nextBoundary === -1 ? buffer.length : nextBoundary - 2; // -2 for \r\n

    parts.push({ headers: headerStr, body: buffer.slice(bodyStart, bodyEnd) });
    pos = nextBoundary === -1 ? buffer.length : nextBoundary;
  }

  return parts;
}

// Buffer.indexOf helper
function indexOf(buf, search, start = 0) {
  for (let i = start; i <= buf.length - search.length; i++) {
    let found = true;
    for (let j = 0; j < search.length; j++) {
      if (buf[i + j] !== search[j]) { found = false; break; }
    }
    if (found) return i;
  }
  return -1;
}

function getField(parts, name) {
  for (const part of parts) {
    // Use a more precise regex: match name= that is NOT preceded by file
    // Pattern: look for ; name="value" or start with name="value"
    const cdLine = part.headers.split(/\r?\n/)[0]; // first header line only
    const nameMatch = cdLine.match(/(?:^|;)\s*name="([^"]+)"/i);
    if (!nameMatch || nameMatch[1] !== name) continue;
    const filenameMatch = cdLine.match(/(?:^|;)\s*filename="([^"]+)"/i);
    if (filenameMatch) return { filename: filenameMatch[1], data: part.body };
    return { value: part.body.toString("utf8") };
  }
  return null;
}

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

// ── Parse Bengali/English instruction → ffmpeg params via AI ─────────────────
const AUDIO_SYSTEM_PROMPT = `তুমি একটি অডিও এডিটিং AI। ব্যবহারকারী বাংলায় বা ইংরেজিতে অডিও এডিটিং নির্দেশ দেবে।
শুধুমাত্র একটি JSON অবজেক্ট রিটার্ন করো — অন্য কোনো টেক্সট নয়।

JSON ফরম্যাট:
{
  "filters": "<ffmpeg -af filter string or null>",
  "outputFormat": "mp3",
  "trimStart": <seconds or null>,
  "trimEnd": <seconds or null>,
  "speed": <0.5-2.0 or null>,
  "description": "<বাংলায় সংক্ষিপ্ত বর্ণনা>"
}

উদাহরণ:
- ভলিউম ২ গুণ বাড়াও → filters: "volume=2.0"
- ভলিউম কমাও → filters: "volume=0.5"
- নয়েজ রিমুভ / নয়েজ কমাও → filters: "highpass=f=80,lowpass=f=8000,afftdn=nf=-25"
- ফেড ইন ৩ সেকেন্ড → filters: "afade=t=in:st=0:d=3"
- ফেড আউট → filters: "afade=t=out:st=0:d=3"
- বেস বাড়াও → filters: "equalizer=f=100:width_type=o:width=2:g=8"
- ট্রেবল বাড়াও → filters: "equalizer=f=8000:width_type=o:width=2:g=6"
- রিভার্ব → filters: "aecho=0.8:0.88:60:0.4"
- গতি বাড়াও ১.৫ → speed: 1.5, filters: null
- ১০ সেকেন্ড থেকে শুরু → trimStart: 10
- প্রথম ৩০ সেকেন্ড → trimEnd: 30
- WAV তে রূপান্তর → outputFormat: "wav"
- স্বয়ংক্রিয় মান উন্নত → filters: "highpass=f=80,lowpass=f=8000,afftdn=nf=-25,volume=1.2"
- একাধিক → filters: "volume=1.5,afade=t=in:st=0:d=2"

নিয়ম: শুধু valid JSON, কোনো markdown নয়। outputFormat ডিফল্ট "mp3"।`;

async function parseInstruction(instruction, inputFormat) {
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
        { role: "user", content: `ইনপুট ফরম্যাট: ${inputFormat}\nনির্দেশ: ${instruction}` },
      ],
      max_tokens: 400,
      temperature: 0.1,
    }),
  });

  if (!resp.ok) throw new Error(`AI API ${resp.status}`);
  const data = await resp.json();
  const raw = data.choices?.[0]?.message?.content?.trim() || "{}";
  const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(cleaned);
}

// ── Build ffmpeg args ─────────────────────────────────────────────────────────
function buildFfmpegArgs(inputPath, outputPath, parsed) {
  const args = ["-y", "-i", inputPath];

  if (parsed.trimStart != null && parsed.trimStart > 0) args.push("-ss", String(parsed.trimStart));
  if (parsed.trimEnd != null && parsed.trimEnd > 0) args.push("-to", String(parsed.trimEnd));

  // Speed via atempo
  let speedFilter = null;
  const speed = parsed.speed;
  if (speed && speed !== 1.0 && speed > 0) {
    if (speed >= 0.5 && speed <= 2.0) {
      speedFilter = `atempo=${speed}`;
    } else if (speed > 2.0) {
      const steps = Math.ceil(Math.log2(speed));
      const s = Math.pow(speed, 1 / steps).toFixed(4);
      speedFilter = Array(steps).fill(`atempo=${s}`).join(",");
    } else {
      speedFilter = `atempo=0.5,atempo=${(speed / 0.5).toFixed(4)}`;
    }
  }

  const filterParts = [];
  if (parsed.filters) filterParts.push(parsed.filters);
  if (speedFilter) filterParts.push(speedFilter);
  if (filterParts.length > 0) args.push("-af", filterParts.join(","));

  const fmt = (parsed.outputFormat || "mp3").toLowerCase();
  if (fmt === "mp3") args.push("-codec:a", "libmp3lame", "-q:a", "2");
  else if (fmt === "wav") args.push("-codec:a", "pcm_s16le");
  else if (fmt === "ogg") args.push("-codec:a", "libvorbis", "-q:a", "5");
  else if (fmt === "flac") args.push("-codec:a", "flac");
  else if (fmt === "aac") args.push("-codec:a", "aac", "-b:a", "192k");
  else args.push("-codec:a", "libmp3lame", "-q:a", "2");

  args.push(outputPath);
  return args;
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const tmpId = randomBytes(8).toString("hex");
  let tmpInPath = null;
  let tmpOutPath = null;

  try {
    // ── 1. Read raw body ────────────────────────────────────────────────────
    const rawBody = await readBody(req);

    // ── 2. Parse multipart ──────────────────────────────────────────────────
    const contentType = req.headers["content-type"] || "";
    const boundaryMatch = contentType.match(/boundary=([^\s;,]+)/);
    if (!boundaryMatch) {
      return res.status(400).json({ error: "multipart boundary not found in Content-Type" });
    }
    const boundary = boundaryMatch[1].replace(/^"(.*)"$/, "$1"); // strip quotes if any

    const parts = parseMultipart(rawBody, boundary);

    const audioField = getField(parts, "audio");
    const instructionField = getField(parts, "instruction");

    if (!audioField?.data || audioField.data.length === 0) {
      return res.status(400).json({ error: "audio ফাইল পাওয়া যায়নি" });
    }

    // instruction can be empty — default to auto-enhance
    const instruction = instructionField?.value?.trim() ||
      "অডিওটি বিশ্লেষণ করে স্বয়ংক্রিয়ভাবে মান উন্নত করো, নয়েজ কমাও";

    const originalFilename = audioField.filename || "audio.mp3";
    const inputExt = (extname(originalFilename).replace(".", "").toLowerCase()) || "mp3";

    // Validate size (50MB)
    if (audioField.data.length > 50 * 1024 * 1024) {
      return res.status(400).json({ error: "ফাইলের আকার সর্বোচ্চ ৫০ MB" });
    }

    // ── 3. Write input to /tmp ──────────────────────────────────────────────
    tmpInPath = join(tmpdir(), `audio_in_${tmpId}.${inputExt}`);
    writeFileSync(tmpInPath, audioField.data);

    // ── 4. Parse instruction via AI ─────────────────────────────────────────
    let parsed;
    try {
      parsed = await parseInstruction(instruction, inputExt);
    } catch (aiErr) {
      if (existsSync(tmpInPath)) unlinkSync(tmpInPath);
      return res.status(500).json({ error: "AI নির্দেশ বিশ্লেষণে সমস্যা", details: aiErr.message });
    }

    const outputFmt = (parsed.outputFormat || "mp3").toLowerCase();
    tmpOutPath = join(tmpdir(), `audio_out_${tmpId}.${outputFmt}`);

    // ── 5. Run ffmpeg ───────────────────────────────────────────────────────
    const ffmpegArgs = buildFfmpegArgs(tmpInPath, tmpOutPath, parsed);

    try {
      execFileSync(FFMPEG_PATH, ffmpegArgs, { timeout: 60000, maxBuffer: 100 * 1024 * 1024 });
    } catch (ffErr) {
      if (existsSync(tmpInPath)) unlinkSync(tmpInPath);
      if (existsSync(tmpOutPath)) unlinkSync(tmpOutPath);
      const errMsg = ffErr.stderr?.toString() || ffErr.message || "ffmpeg error";
      console.error("ffmpeg error:", errMsg.slice(-500));
      return res.status(500).json({ error: "অডিও প্রসেসিং ব্যর্থ হয়েছে", details: errMsg.slice(-300) });
    }

    if (existsSync(tmpInPath)) unlinkSync(tmpInPath);

    // ── 6. Read output and respond ──────────────────────────────────────────
    if (!existsSync(tmpOutPath)) {
      return res.status(500).json({ error: "এডিটেড ফাইল তৈরি হয়নি" });
    }

    const outputBuffer = readFileSync(tmpOutPath);
    if (existsSync(tmpOutPath)) unlinkSync(tmpOutPath);

    const mimeMap = { mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", flac: "audio/flac", aac: "audio/aac" };
    const mime = mimeMap[outputFmt] || "audio/mpeg";
    const outputFilename = `edited_${Date.now()}.${outputFmt}`;
    const description = parsed.description || "অডিও এডিটিং সম্পন্ন হয়েছে।";

    res.setHeader("Content-Type", mime);
    res.setHeader("Content-Disposition", `attachment; filename="${outputFilename}"`);
    res.setHeader("X-Audio-Description", encodeURIComponent(description));
    res.setHeader("X-Output-Format", outputFmt);
    res.setHeader("Content-Length", outputBuffer.length);
    return res.status(200).send(outputBuffer);

  } catch (err) {
    console.error("audio-edit handler error:", err);
    try { if (tmpInPath && existsSync(tmpInPath)) unlinkSync(tmpInPath); } catch (_) {}
    try { if (tmpOutPath && existsSync(tmpOutPath)) unlinkSync(tmpOutPath); } catch (_) {}
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
