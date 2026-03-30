// Vercel Serverless Function — /api/chat
// Uses OpenRouter with multi-model fallback — 100% free, no credits needed

const FREE_MODELS = [
  "google/gemma-3-27b-it:free",
  "google/gemma-3-12b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-4b-it:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
];

async function tryModel(model, messages, apiKey) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://mahbub-sardar-sabuj-live.vercel.app",
      "X-Title": "Mahbub Sardar Sabuj AI Agent",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const errMsg = data?.error?.message || "Unknown error";
    throw new Error(`${model}: ${errMsg}`);
  }

  const reply = data.choices?.[0]?.message?.content;
  if (!reply) throw new Error(`${model}: Empty response`);

  return reply;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    let lastError = null;

    // Try each model in order until one works
    for (const model of FREE_MODELS) {
      try {
        const reply = await tryModel(model, messages, apiKey);
        return res.status(200).json({ reply });
      } catch (err) {
        console.warn(`Model failed, trying next: ${err.message}`);
        lastError = err;
      }
    }

    // All models failed
    console.error("All models failed:", lastError?.message);
    return res.status(500).json({ error: "AI service temporarily unavailable. Please try again." });

  } catch (err) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
