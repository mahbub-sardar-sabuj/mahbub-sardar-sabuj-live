// Temporary debug endpoint to check which env vars are set
// Version: v2 - 2026-05-30
export default function handler(req, res) {
  const envStatus = {
    version: "v2",
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || null,
    OPENAI_MODEL: process.env.OPENAI_MODEL || null,
    BUILT_IN_FORGE_API_KEY: !!process.env.BUILT_IN_FORGE_API_KEY,
    BUILT_IN_FORGE_API_URL: !!process.env.BUILT_IN_FORGE_API_URL,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || null,
    stream_has_gemini_fallback: true,
  };
  res.status(200).json(envStatus);
}
