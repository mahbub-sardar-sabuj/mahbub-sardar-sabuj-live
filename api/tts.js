// api/tts.js — Text-to-Speech API using Google Gemini TTS
// Supports Bengali and other languages with human-like voice synthesis
// Returns base64 audio (WAV) for download

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, voice = "Sulafat", language = "bn-BD", style = "" } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text is required" });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ error: "text cannot be empty" });
    }

    if (text.length > 5000) {
      return res.status(400).json({ error: "text too long (max 5000 characters)" });
    }

    // Build TTS prompt following the skill guidelines
    // Style instructions (before colon) + spoken text (after colon)
    let styleInstruction = "";
    if (style && style.trim()) {
      styleInstruction = style.trim();
    } else {
      // Default: warm, expressive Bengali recitation style
      styleInstruction = `Speak in Bengali (Bangla) with a warm, expressive, and natural human voice. 
Read with the rhythm and emotion of a skilled Bengali poet reciting their own work. 
Use natural pauses, gentle emphasis on emotional words, and a flowing cadence. 
The voice should feel like a real person speaking from the heart`;
    }

    const prompt = `${styleInstruction}: ${text.trim()}`;

    // Use Gemini TTS via Google AI API
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    if (!geminiKey) {
      return res.status(500).json({ error: "TTS service not configured" });
    }

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice
            }
          }
        }
      }
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${geminiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[TTS] Gemini API error:", response.status, errorText);
      return res.status(502).json({ 
        error: "TTS generation failed", 
        details: response.status === 429 ? "Rate limit exceeded, please try again" : "Service temporarily unavailable"
      });
    }

    const data = await response.json();

    // Extract audio data from response
    const audioData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || "audio/wav";

    if (!audioData) {
      console.error("[TTS] No audio data in response:", JSON.stringify(data).slice(0, 500));
      return res.status(502).json({ error: "No audio generated" });
    }

    return res.status(200).json({
      audioData,
      mimeType,
      voice,
      language,
      charCount: text.length,
    });

  } catch (err) {
    console.error("[TTS] Error:", err);
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
}
