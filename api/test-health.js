// Simple health check endpoint to test Vercel function
export default function handler(req, res) {
  res.status(200).json({ ok: true, time: Date.now() });
}
