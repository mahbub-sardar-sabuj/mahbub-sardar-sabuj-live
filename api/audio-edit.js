/**
 * /api/audio-edit — AI-powered audio editing serverless function
 *
 * Flow:
 * 1. Receive multipart form: audioFile + instruction (Bengali/English text)
 * 2. Use GPT to parse the instruction into structured ffmpeg commands
 * 3. Run ffmpeg to apply edits
 * 4. Return the edited audio file as a downloadable response
 *
 * Supported operations (বাংলায় নির্দেশ দিন):
 * - ভলিউম বাড়াও / কমাও  → volume adjustment
 * - ট্রিম করো / কাটো      → trim start/end
 * - ফেড ইন / ফেড আউট     → fade in/out
 * - গতি বাড়াও / কমাও     → speed change
 * - নয়েজ কমাও            → noise reduction (highpass/lowpass)
 * - রিভার্ব যোগ করো       → reverb effect
 * - MP3/WAV/OGG তে রূপান্তর → format conversion
 * - নীরবতা কাটো           → silence removal
 * - বেস বাড়াও / কমাও     → bass boost/cut
 * - ট্রেবল বাড়াও / কমাও  → treble boost/cut
 */

import { execSync, spawnSync } from "child_process";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join, extname } from "path";
import { randomBytes } from "crypto";

// ── AI config (same pattern as chat.js) ─────────────────────────────────────
function resolveAiConfig() {
  const chatbotApiKey = process.env.CHATBOT_API_KEY?.trim();
  const openAiApiKey = process.env.OPENAI_API_KEY?.trim();
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY?.trim();
  const forgeBaseUrl = process.env.BUILT_IN_FORGE_API_URL?.trim();

  if (chatbotApiKey) {
    const isOpenRouter = chatbotApiKey.startsWith("sk-or-");
    return {
      apiKey: chatbotApiKey,
      baseUrl: process.env.CHATBOT_BASE_URL?.trim() || (isOpenRouter ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1"),
      model: process.env.CHATBOT_MODEL?.trim() || (isOpenRouter ? "openai/gpt-4.1-mini" : "gpt-4.1-mini"),
    };
  }
  if (openAiApiKey) {
    return {
      apiKey: openAiApiKey,
      baseUrl: process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini",
    };
  }
  if (forgeApiKey && forgeBaseUrl) {
    return {
      apiKey: forgeApiKey,
      baseUrl: forgeBaseUrl.replace(/\/$/, ""),
      model: process.env.BUILT_IN_FORGE_MODEL?.trim() || "gemini-2.5-flash",
    };
  }
  return null;
}

// ── Parse instruction → ffmpeg filter string via AI ─────────────────────────
const AUDIO_SYSTEM_PROMPT = `তুমি একটি অডিও এডিটিং AI। ব্যবহারকারী বাংলায় বা ইংরেজিতে অডিও এডিটিং নির্দেশ দেবে।
তোমাকে শুধুমাত্র একটি JSON অবজেক্ট রিটার্ন করতে হবে — অন্য কোনো টেক্সট নয়।

JSON ফরম্যাট:
{
  "filters": "<ffmpeg -af filter string>",
  "outputFormat": "mp3" | "wav" | "ogg" | "flac" | "aac",
  "trimStart": <seconds or null>,
  "trimEnd": <seconds or null>,
  "speed": <0.5-2.0 or null>,
  "description": "<বাংলায় সংক্ষিপ্ত বর্ণনা>"
}

ffmpeg filter উদাহরণ:
- ভলিউম ২ গুণ বাড়াও → "volume=2.0"
- ভলিউম অর্ধেক করো → "volume=0.5"
- ভলিউম ৬ dB বাড়াও → "volume=6dB"
- ফেড ইন ৩ সেকেন্ড → "afade=t=in:st=0:d=3"
- ফেড আউট ৩ সেকেন্ড → "afade=t=out:st=0:d=3"
- নয়েজ কমাও → "highpass=f=200,lowpass=f=3000"
- বেস বাড়াও → "equalizer=f=100:width_type=o:width=2:g=6"
- ট্রেবল বাড়াও → "equalizer=f=8000:width_type=o:width=2:g=6"
- রিভার্ব → "aecho=0.8:0.88:60:0.4"
- একাধিক ফিল্টার → "volume=1.5,afade=t=in:st=0:d=2"

নিয়ম:
- শুধুমাত্র valid JSON রিটার্ন করবে, কোনো markdown বা ব্যাখ্যা নয়
- যদি কোনো ফিল্টার প্রযোজ্য না হয় তাহলে filters: null দাও
- trimStart/trimEnd শুধু সেকেন্ড সংখ্যা, যেমন 5 মানে ৫ সেকেন্ড থেকে শুরু
- speed পরিবর্তন করলে filters এ atempo ব্যবহার করো না, speed ফিল্ড ব্যবহার করো
- outputFormat ডিফল্ট হবে ইনপুটের মতো, যদি রূপান্তরের নির্দেশ না থাকে`;

async function parseInstruction(instruction, inputFormat) {
  const config = resolveAiConfig();
  if (!config) throw new Error("AI config not found");

  const url = config.baseUrl.endsWith("/chat/completions")
    ? config.baseUrl
    : config.baseUrl.endsWith("/v1")
    ? `${config.baseUrl}/chat/completions`
    : `${config.baseUrl}/v1/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: AUDIO_SYSTEM_PROMPT },
        {
          role: "user",
          content: `ইনপুট ফরম্যাট: ${inputFormat}\nনির্দেশ: ${instruction}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content?.trim() || "{}";

  // Strip markdown code blocks if present
  const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(cleaned);
}

// ── Build ffmpeg command ──────────────────────────────────────────────────────
function buildFfmpegArgs(inputPath, outputPath, parsed) {
  const args = ["-y", "-i", inputPath];

  // Trim: -ss start -to end
  if (parsed.trimStart != null) {
    args.push("-ss", String(parsed.trimStart));
  }
  if (parsed.trimEnd != null) {
    args.push("-to", String(parsed.trimEnd));
  }

  // Speed via atempo (supports 0.5–2.0; chain for extreme values)
  const speed = parsed.speed;
  let speedFilter = null;
  if (speed && speed !== 1.0) {
    if (speed >= 0.5 && speed <= 2.0) {
      speedFilter = `atempo=${speed}`;
    } else if (speed > 2.0) {
      // Chain: max 2.0 per atempo
      const n = Math.ceil(Math.log2(speed));
      const perStep = Math.pow(speed, 1 / n);
      speedFilter = Array(n).fill(`atempo=${perStep.toFixed(4)}`).join(",");
    } else if (speed < 0.5) {
      speedFilter = `atempo=0.5,atempo=${(speed / 0.5).toFixed(4)}`;
    }
  }

  // Combine filters
  const filterParts = [];
  if (parsed.filters) filterParts.push(parsed.filters);
  if (speedFilter) filterParts.push(speedFilter);

  if (filterParts.length > 0) {
    args.push("-af", filterParts.join(","));
  }

  // Output format codec
  const fmt = (parsed.outputFormat || "mp3").toLowerCase();
  if (fmt === "mp3") {
    args.push("-codec:a", "libmp3lame", "-q:a", "2");
  } else if (fmt === "wav") {
    args.push("-codec:a", "pcm_s16le");
  } else if (fmt === "ogg") {
    args.push("-codec:a", "libvorbis", "-q:a", "5");
  } else if (fmt === "flac") {
    args.push("-codec:a", "flac");
  } else if (fmt === "aac") {
    args.push("-codec:a", "aac", "-b:a", "192k");
  }

  args.push(outputPath);
  return args;
}

// ── Multipart form parser (no external deps) ─────────────────────────────────
function parseMultipart(buffer, boundary) {
  const sep = Buffer.from(`--${boundary}`);
  const parts = [];
  let start = 0;

  while (start < buffer.length) {
    const sepIdx = buffer.indexOf(sep, start);
    if (sepIdx === -1) break;
    const afterSep = sepIdx + sep.length;
    // Check for final boundary --boundary--
    if (buffer.slice(afterSep, afterSep + 2).toString() === "--") break;
    // Skip \r\n after boundary
    const headerStart = afterSep + 2;
    const headerEnd = buffer.indexOf(Buffer.from("\r\n\r\n"), headerStart);
    if (headerEnd === -1) break;
    const headers = buffer.slice(headerStart, headerEnd).toString();
    const bodyStart = headerEnd + 4;
    const nextSep = buffer.indexOf(sep, bodyStart);
    const bodyEnd = nextSep === -1 ? buffer.length : nextSep - 2; // -2 for \r\n
    const body = buffer.slice(bodyStart, bodyEnd);
    parts.push({ headers, body });
    start = nextSep === -1 ? buffer.length : nextSep;
  }

  return parts;
}

function getFormField(parts, name) {
  for (const part of parts) {
    const cdMatch = part.headers.match(/Content-Disposition:[^\r\n]*name="([^"]+)"/i);
    if (cdMatch && cdMatch[1] === name) {
      // Check if it's a file
      const filenameMatch = part.headers.match(/filename="([^"]+)"/i);
      if (filenameMatch) {
        return { filename: filenameMatch[1], data: part.body };
      }
      return { value: part.body.toString("utf8") };
    }
  }
  return null;
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const tmpId = randomBytes(8).toString("hex");
  const tmpIn = join(tmpdir(), `audio_in_${tmpId}`);
  let tmpOut = null;

  try {
    // ── Parse multipart body ──────────────────────────────────────────────
    const contentType = req.headers["content-type"] || "";
    const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
    if (!boundaryMatch) {
      return res.status(400).json({ error: "multipart/form-data boundary not found" });
    }
    const boundary = boundaryMatch[1];

    // Collect raw body
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks);

    const parts = parseMultipart(rawBody, boundary);
    const audioField = getFormField(parts, "audio");
    const instructionField = getFormField(parts, "instruction");

    if (!audioField?.data || !instructionField?.value) {
      return res.status(400).json({ error: "audio ফাইল এবং instruction উভয়ই প্রয়োজন" });
    }

    const instruction = instructionField.value.trim();
    const originalFilename = audioField.filename || "audio.mp3";
    const inputExt = extname(originalFilename).replace(".", "").toLowerCase() || "mp3";

    // Validate file size (max 50MB)
    if (audioField.data.length > 50 * 1024 * 1024) {
      return res.status(400).json({ error: "ফাইলের আকার সর্বোচ্চ ৫০ MB হতে পারবে" });
    }

    // Validate audio format
    const allowedFormats = ["mp3", "wav", "ogg", "flac", "aac", "m4a", "webm", "opus"];
    if (!allowedFormats.includes(inputExt)) {
      return res.status(400).json({ error: `সমর্থিত ফরম্যাট: ${allowedFormats.join(", ")}` });
    }

    // Write input to temp file
    const tmpInPath = `${tmpIn}.${inputExt}`;
    writeFileSync(tmpInPath, audioField.data);

    // ── Parse instruction via AI ──────────────────────────────────────────
    let parsed;
    try {
      parsed = await parseInstruction(instruction, inputExt);
    } catch (aiErr) {
      // Cleanup
      if (existsSync(tmpInPath)) unlinkSync(tmpInPath);
      return res.status(500).json({
        error: "AI নির্দেশ বিশ্লেষণে সমস্যা হয়েছে",
        details: aiErr.message,
      });
    }

    const outputFmt = (parsed.outputFormat || inputExt).toLowerCase();
    const tmpOutPath = `${tmpIn}_out.${outputFmt}`;
    tmpOut = tmpOutPath;

    // ── Run ffmpeg ────────────────────────────────────────────────────────
    const ffmpegArgs = buildFfmpegArgs(tmpInPath, tmpOutPath, parsed);
    const result = spawnSync("ffmpeg", ffmpegArgs, {
      timeout: 60000, // 60s max
      maxBuffer: 100 * 1024 * 1024,
    });

    // Cleanup input
    if (existsSync(tmpInPath)) unlinkSync(tmpInPath);

    if (result.status !== 0) {
      const errMsg = result.stderr?.toString() || "ffmpeg error";
      console.error("ffmpeg failed:", errMsg.slice(-500));
      if (existsSync(tmpOutPath)) unlinkSync(tmpOutPath);
      return res.status(500).json({
        error: "অডিও প্রসেসিং ব্যর্থ হয়েছে",
        details: errMsg.slice(-300),
      });
    }

    // ── Read output and send ──────────────────────────────────────────────
    const outputBuffer = readFileSync(tmpOutPath);
    if (existsSync(tmpOutPath)) unlinkSync(tmpOutPath);

    const mimeMap = {
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      flac: "audio/flac",
      aac: "audio/aac",
    };
    const mime = mimeMap[outputFmt] || "audio/mpeg";
    const outputFilename = `edited_${Date.now()}.${outputFmt}`;

    res.setHeader("Content-Type", mime);
    res.setHeader("Content-Disposition", `attachment; filename="${outputFilename}"`);
    res.setHeader("X-Audio-Description", encodeURIComponent(parsed.description || ""));
    res.setHeader("X-Output-Format", outputFmt);
    res.setHeader("Content-Length", outputBuffer.length);
    return res.status(200).send(outputBuffer);

  } catch (err) {
    console.error("audio-edit handler error:", err);
    // Cleanup any temp files
    try {
      if (tmpOut && existsSync(tmpOut)) unlinkSync(tmpOut);
    } catch (_) {}
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
