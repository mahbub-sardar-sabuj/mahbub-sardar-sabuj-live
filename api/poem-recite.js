import OpenAI from "openai";
import { checkRateLimit, getClientIp, normalizeText } from "./_utils/security.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Available voices for recitation — warm, emotional, human-like
const VOICES = {
  male: "Algieba",       // Smooth, deep — ideal for dramatic Bengali poetry
  female: "Sulafat",     // Warm, gentle — ideal for lyrical Bengali poetry
  neutral: "Enceladus",  // Breathy, soft — ideal for melancholic/introspective poems
};

/**
 * Build an emotionally-aware TTS prompt for Bengali poetry recitation.
 * The style instructions are always in English (per TTS best-practice),
 * while the spoken text is the original Bengali poem.
 */
function buildRecitationPrompt(poem, mood) {
  const moodInstructions = {
    romantic:
      "You are a passionate Bengali poet performing a live recitation. Speak in Bangla (Bangladesh) with a warm, tender, and deeply emotional tone. Let your voice carry longing and love. Breathe naturally between stanzas. Pace yourself slowly and expressively, as if each word holds a memory",
    sad:
      "You are a Bengali poet reciting a sorrowful poem on stage. Speak in Bangla (Bangladesh) with a heavy heart, a slightly trembling voice, and quiet grief. Let the pain come through in your pauses and your breath. Do not rush — let the sadness settle",
    spiritual:
      "You are a devout Bengali poet reciting a spiritual or philosophical poem. Speak in Bangla (Bangladesh) with a calm, reverent, and meditative tone. Your voice should feel like a gentle prayer — slow, deliberate, and full of inner peace",
    heroic:
      "You are a Bengali poet delivering a powerful, patriotic recitation on stage. Speak in Bangla (Bangladesh) with a bold, resonant, and passionate voice. Let the energy build with each line. Your delivery should inspire and move the audience",
    nature:
      "You are a Bengali poet reciting a poem about nature and beauty. Speak in Bangla (Bangladesh) with a light, flowing, and wonder-filled tone. Let your voice paint vivid images — soft breezes, gentle rain, open skies",
    default:
      "You are a skilled Bengali poet performing a heartfelt recitation. Speak in Bangla (Bangladesh) with a natural, expressive, and emotionally resonant voice. Breathe between stanzas. Let the rhythm and feeling of the poem guide your delivery — not too fast, not too slow",
  };

  const instruction = moodInstructions[mood] || moodInstructions.default;
  return `${instruction}: ${poem}`;
}

async function notifyTelegram({ poem, mood, voice, clientIp, userAgent }) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
  if (!botToken || !adminChatId) return;

  const preview = poem.length > 200 ? poem.slice(0, 200) + "…" : poem;
  const text = [
    "🎙️ <b>কবিতা আবৃত্তি অনুরোধ</b>",
    "",
    "<b>কবিতা (প্রথম ২০০ অক্ষর):</b>",
    preview,
    "",
    `<b>মুড:</b> ${mood || "default"}`,
    `<b>কণ্ঠ:</b> ${voice}`,
    `<b>IP:</b> ${clientIp || "unknown"}`,
    `<b>সময়:</b> ${new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}`,
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: adminChatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.error("Telegram notify failed:", e.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  // Rate limit: 5 requests per minute per IP
  const { limited, clientIp } = checkRateLimit(req, res, {
    keyPrefix: "poem-recite",
    windowMs: 60_000,
    max: 5,
    message: "অনেকবার আবৃত্তির অনুরোধ করা হয়েছে। একটু পরে আবার চেষ্টা করুন।",
  });
  if (limited) return;

  let body = req.body;
  if (!body || typeof body !== "object") {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return res.status(400).json({ success: false, error: "অনুরোধ পড়তে সমস্যা হয়েছে।" });
    }
  }

  const rawPoem = normalizeText(body?.poem || "", 3000);
  const mood = String(body?.mood || "default").toLowerCase();
  const voiceKey = String(body?.voice || "male").toLowerCase();

  if (!rawPoem || rawPoem.length < 5) {
    return res.status(400).json({ success: false, error: "কবিতার টেক্সট দিন।" });
  }

  const voice = VOICES[voiceKey] || VOICES.male;
  const prompt = buildRecitationPrompt(rawPoem, mood);

  try {
    const mp3Response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: voice,
      input: prompt,
      response_format: "mp3",
      speed: 0.9, // Slightly slower for poetic delivery
    });

    const audioBuffer = Buffer.from(await mp3Response.arrayBuffer());

    // Notify admin (non-blocking)
    notifyTelegram({
      poem: rawPoem,
      mood,
      voice,
      clientIp,
      userAgent: req.headers?.["user-agent"],
    }).catch(() => {});

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="abritti-${Date.now()}.mp3"`
    );
    return res.status(200).send(audioBuffer);
  } catch (err) {
    console.error("TTS error:", err?.message || err);
    const status = err?.status || 500;
    const msg =
      status === 429
        ? "সার্ভার এখন ব্যস্ত। একটু পরে আবার চেষ্টা করুন।"
        : "আবৃত্তি তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।";
    return res.status(status).json({ success: false, error: msg });
  }
}
