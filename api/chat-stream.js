// api/chat-stream.js — Streaming Chat API (Server-Sent Events)
// Token-by-token streaming response for faster perceived speed
import { WEBSITE_KNOWLEDGE } from "./_knowledge/siteKnowledge.js";
import {
  CHATBOT_PERSONA_RULES,
  INTENT_RULES,
  buildKnowledgeContext,
  buildTrainingExampleContext,
} from "./_knowledge/trainingExamples.js";
import {
  checkRateLimit,
  isProbablySpamText,
  limitJsonBodySize,
  normalizeText,
} from "./_utils/security.js";

const SYSTEM_PROMPT = `তুমি "মাহবুব সরদার সবুজ AI Agent"—লেখক মাহবুব সরদার সবুজের অফিসিয়াল ওয়েবসাইটে থাকা একটি প্রিমিয়াম General AI সহকারী। তুমি শুধুমাত্র ওয়েবসাইট-তথ্যে সীমাবদ্ধ নও; ব্যবহারকারীর সাধারণ জ্ঞান, শিক্ষা, প্রযুক্তি, প্রোগ্রামিং, সাহিত্য, গণিত, জীবনযাপন, কনটেন্ট পরিকল্পনা, অনুবাদ, সারাংশ, আইডিয়া, বিশ্লেষণ এবং সৃজনশীল লেখার প্রশ্নেও সহায়তা করবে।

## মূল আচরণবিধি
${CHATBOT_PERSONA_RULES.map((rule, index) => `${index + 1}. ${rule}`).join("\\n")}

## যাচাইকৃত Knowledge Base
${buildKnowledgeContext(WEBSITE_KNOWLEDGE)}

## শেখানো ও উত্তর দেওয়ার উদাহরণ
${buildTrainingExampleContext()}

## উত্তর দেওয়ার নীতি (অবশ্যই মানতে হবে)
১. ব্যবহারকারীর উদ্দেশ্য আগে বোঝো, তারপর সরাসরি কার্যকর উত্তর দাও।
২. ওয়েবসাইট/লেখক সম্পর্কে প্রশ্ন হলে যাচাইকৃত knowledge base-কে অগ্রাধিকার দাও; অনুমান করো না।
৩. সাধারণ জ্ঞানভিত্তিক প্রশ্নে সহায়ক, গুছানো ও বাস্তবসম্মত উত্তর দাও।
৪. চিকিৎসা, আইন, আর্থিক বা নিরাপত্তাজনিত বিষয়ে সতর্ক ডিসক্লেইমার দিয়ে সাধারণ সহায়তা দাও।
৫. উত্তর সুন্দর, শুদ্ধ, বিনয়ী ও প্রফেশনাল বাংলায় দাও; প্রয়োজনে সংক্ষিপ্ত তালিকা বা ধাপ ব্যবহার করো।
৬. প্রতিটি উত্তরে প্রাসঙ্গিক হলে [BUTTON:/path] ফরম্যাটে internal navigation link দাও।
৭. অজানা তথ্য বানিয়ে বলো না; নিশ্চিত না হলে নম্রভাবে বলো।
৮. বাংলা ভাষা অগ্রাধিকার দাও; ব্যবহারকারী ইংরেজি বা অন্য ভাষায় লিখলে সেই ভাষায় উত্তর দিতে পারো।
৯. সর্বোচ্চ ২০০ শব্দে সংক্ষিপ্ত উত্তর দাও যদি বিস্তারিত না চাওয়া হয়।`;

function resolveAiConfigs() {
  const configs = [];
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    const baseUrl = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
    const model = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
    configs.push({ source: "openai", apiKey: openaiKey, endpoint: `${baseUrl}/chat/completions`, model });
  }
  const forgeKey = process.env.BUILT_IN_FORGE_API_KEY?.trim();
  const forgeUrl = process.env.BUILT_IN_FORGE_API_URL?.trim();
  if (forgeKey && forgeUrl) {
    configs.push({
      source: "forge",
      apiKey: forgeKey,
      endpoint: `${forgeUrl.replace(/\/$/, "")}/v1/chat/completions`,
      model: "gemini-2.5-flash",
    });
  }
  return configs;
}

function sanitizeReply(reply) {
  if (!reply || typeof reply !== "string") return reply;
  reply = reply.replace(/\[([^\]]+)\]\(https?:\/\/(?:www\.)?mahbubsardarsabuj\.com(\/[^\)]*)?\)/g, (_, _t, path) => path ? `[BUTTON:${path}]` : `[BUTTON:/]`);
  reply = reply.replace(/https?:\/\/(?:www\.)?mahbubsardarsabuj\.com(\/[^\s\)\"\']+)?/g, (_, path) => path ? `[BUTTON:${path}]` : `[BUTTON:/]`);
  return reply;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (limitJsonBodySize(req, res, 2 * 1024 * 1024)) return;

  const rate = checkRateLimit(req, res, { keyPrefix: "chat-stream", windowMs: 60 * 1000, max: 20 });
  if (rate.limited) return;

  try {
    const { messages } = req.body || {};
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    const lastUserContent = messages.filter((m) => m?.role === "user").slice(-1)[0]?.content;
    const lastUserText = Array.isArray(lastUserContent)
      ? lastUserContent.find((p) => p?.type === "text")?.text || ""
      : lastUserContent || "";

    if (normalizeText(lastUserText, 5000).length > 4000 || isProbablySpamText(lastUserText)) {
      return res.status(400).json({ error: "আপনার বার্তাটি খুব বড় বা সন্দেহজনক।" });
    }

    const filteredMessages = messages
      .filter((m) => m.role !== "system" && ["user", "assistant"].includes(m.role))
      .slice(-12);
    const allMessages = [{ role: "system", content: SYSTEM_PROMPT }, ...filteredMessages];

    const configs = resolveAiConfigs();
    if (configs.length === 0) {
      return res.status(500).json({ error: "AI API key not configured." });
    }

    // Set SSE headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    let streamSuccess = false;

    for (const config of configs) {
      try {
        const response = await fetch(config.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            messages: allMessages,
            max_tokens: 4000,
            temperature: 0.7,
            stream: true,
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          console.warn(`[stream] ${config.source} error ${response.status}: ${errText.slice(0, 100)}`);
          continue;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullReply = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;
            if (!trimmed.startsWith("data: ")) continue;

            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json?.choices?.[0]?.delta?.content;
              if (delta) {
                fullReply += delta;
                const sanitized = sanitizeReply(delta);
                res.write(`data: ${JSON.stringify({ delta: sanitized })}\n\n`);
              }
            } catch {
              // skip malformed chunk
            }
          }
        }

        // Send final sanitized complete reply
        res.write(`data: ${JSON.stringify({ done: true, fullReply: sanitizeReply(fullReply) })}\n\n`);
        res.end();
        streamSuccess = true;
        break;

      } catch (err) {
        console.error(`[stream] ${config.source} failed:`, err.message);
        continue;
      }
    }

    if (!streamSuccess) {
      // Fallback: send error event
      res.write(`data: ${JSON.stringify({ error: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" })}\n\n`);
      res.end();
    }

  } catch (err) {
    console.error("Stream handler error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে।" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "সার্ভারে সমস্যা হয়েছে।" })}\n\n`);
      res.end();
    }
  }
}
