/**
 * /api/upscale — AI Image Upscaling endpoint
 * Uses Replicate Real-ESRGAN or falls back gracefully
 * If REPLICATE_API_TOKEN is not set, returns error so client falls back to canvas upscaling
 */

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { image, scale = 2 } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN?.trim();

    // If no Replicate token, return error so client uses canvas fallback
    if (!replicateToken) {
      return res.status(503).json({
        error: "AI upscaling service not configured. Client-side upscaling will be used.",
        fallback: true,
      });
    }

    // Upload image to Replicate and run Real-ESRGAN
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 110000);

    try {
      // Start prediction
      const predictionRes = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Token ${replicateToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
          input: {
            image: image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`,
            scale: Number(scale),
            face_enhance: false,
          },
        }),
        signal: controller.signal,
      });

      if (!predictionRes.ok) {
        const errText = await predictionRes.text().catch(() => "");
        console.error("Replicate prediction start error:", predictionRes.status, errText.slice(0, 200));
        throw new Error(`Replicate error: ${predictionRes.status}`);
      }

      const prediction = await predictionRes.json();
      const predictionId = prediction.id;

      if (!predictionId) throw new Error("No prediction ID returned");

      // Poll for result (max 90 seconds)
      const maxPolls = 30;
      let pollCount = 0;

      while (pollCount < maxPolls) {
        await new Promise(r => setTimeout(r, 3000));
        pollCount++;

        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: { "Authorization": `Token ${replicateToken}` },
          signal: controller.signal,
        });

        if (!pollRes.ok) continue;

        const pollData = await pollRes.json();

        if (pollData.status === "succeeded") {
          clearTimeout(timeoutId);
          const outputUrl = Array.isArray(pollData.output) ? pollData.output[0] : pollData.output;
          if (!outputUrl) throw new Error("No output URL");

          // Fetch the output image and return as base64
          const imgRes = await fetch(outputUrl);
          if (!imgRes.ok) throw new Error("Failed to fetch output image");

          const imgBuffer = await imgRes.arrayBuffer();
          const base64 = Buffer.from(imgBuffer).toString("base64");
          const contentType = imgRes.headers.get("content-type") || "image/png";

          return res.status(200).json({
            outputUrl: `data:${contentType};base64,${base64}`,
          });
        }

        if (pollData.status === "failed" || pollData.status === "canceled") {
          throw new Error(`Prediction ${pollData.status}: ${pollData.error || "unknown"}`);
        }
      }

      throw new Error("Upscaling timed out");

    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }

  } catch (err) {
    console.error("Upscale handler error:", err);
    return res.status(500).json({
      error: "Upscaling service temporarily unavailable.",
      fallback: true,
      details: err.message,
    });
  }
}
