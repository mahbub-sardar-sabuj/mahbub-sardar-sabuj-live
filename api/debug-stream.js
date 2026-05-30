// Debug streaming endpoint
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const results = [];
  
  // Test OpenAI
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const openaiBase = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
  const openaiModel = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
  
  if (openaiKey) {
    try {
      const r = await fetch(`${openaiBase}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: openaiModel,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 10,
          stream: true,
        }),
        signal: AbortSignal.timeout(8000),
      });
      const text = await r.text();
      results.push({ provider: 'openai', status: r.status, ok: r.ok, preview: text.slice(0, 100) });
    } catch (e) {
      results.push({ provider: 'openai', error: e.message });
    }
  }
  
  // Test Gemini
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const geminiModel = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash-lite";
  
  if (geminiKey) {
    try {
      const r = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${geminiKey}` },
        body: JSON.stringify({
          model: geminiModel,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 10,
          stream: true,
        }),
        signal: AbortSignal.timeout(8000),
      });
      const text = await r.text();
      results.push({ provider: 'gemini', status: r.status, ok: r.ok, preview: text.slice(0, 100) });
    } catch (e) {
      results.push({ provider: 'gemini', error: e.message });
    }
  }
  
  res.status(200).json({ results });
}
