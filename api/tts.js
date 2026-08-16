import audioHandler from "./audio-edit.js";

/**
 * Dedicated Vercel entrypoint for the Text-to-Speech page.
 * The shared audio handler already contains the provider fallback and PCM/WAV
 * conversion; this adapter makes `/api/tts` an actual deployable route and
 * explicitly selects its TTS branch instead of relying on URL heuristics.
 */
export default async function handler(req, res) {
  if (!req.headers) req.headers = {};
  req.headers["x-tts-request"] = "1";
  return audioHandler(req, res);
}
