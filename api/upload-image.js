/**
 * /api/upload-image — Image upload for writing platform posts
 * Accepts multipart/form-data with a single "image" field
 * Uploads to Manus storage proxy and returns the public URL
 * Falls back to compressed base64 data URL if storage is not configured
 */

import { jwtVerify } from "jose";
import formidable from "formidable";
import fs from "fs";
import path from "path";

// Compress image using sharp if available, otherwise return original buffer
async function compressImage(buffer, mimeType) {
  try {
    const sharp = (await import("sharp")).default;
    // Resize to max 1200px wide and compress
    const compressed = await sharp(buffer)
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer();
    return { buffer: compressed, mimeType: "image/jpeg" };
  } catch {
    // sharp not available, return original
    return { buffer, mimeType };
  }
}

const COOKIE_NAME = "app_session_id";
const JWT_SECRET = process.env.COOKIE_SECRET || process.env.JWT_SECRET || "local-secret-fallback-32chars!!";
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
}

function parseCookies(cookieHeader) {
  const map = new Map();
  if (!cookieHeader) return map;
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k) map.set(k.trim(), v.join("=").trim());
  }
  return map;
}

async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Auth check
  const cookies = parseCookies(req.headers.cookie);
  const sessionCookie = cookies.get(COOKIE_NAME);
  const session = await verifySession(sessionCookie);
  if (!session?.openId) {
    return res.status(401).json({ error: "লগইন করুন" });
  }

  // Check storage config
  const FORGE_URL = process.env.BUILT_IN_FORGE_API_URL;
  const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY;
  const USE_BASE64_FALLBACK = !FORGE_URL || !FORGE_KEY;

  // Parse multipart form — NO size limit
  const form = formidable({
    maxFileSize: Infinity,
    uploadDir: "/tmp",
    keepExtensions: true,
  });

  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    console.error("[upload-image] parse error:", err);
    return res.status(400).json({ error: "ফাইল পার্স করতে সমস্যা হয়েছে" });
  }

  const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
  if (!imageFile) {
    return res.status(400).json({ error: "ছবি নির্বাচন করুন" });
  }

  const mimeType = imageFile.mimetype || "image/jpeg";
  // Accept all image types
  if (mimeType && !mimeType.startsWith("image/")) {
    try { fs.unlinkSync(imageFile.filepath); } catch {}
    return res.status(400).json({ error: "শুধু ছবি আপলোড করা যাবে" });
  }

  try {
    const rawBuffer = fs.readFileSync(imageFile.filepath);
    // Compress image to reduce size
    const { buffer: fileBuffer, mimeType: finalMimeType } = await compressImage(rawBuffer, mimeType);

    // Fallback: compressed base64 data URL (when Forge storage not configured)
    if (USE_BASE64_FALLBACK) {
      const base64 = fileBuffer.toString("base64");
      const dataUrl = `data:${finalMimeType};base64,${base64}`;
      try { fs.unlinkSync(imageFile.filepath); } catch {}
      return res.status(200).json({ success: true, url: dataUrl });
    }

    const ext = finalMimeType === "image/jpeg" ? ".jpg" : (path.extname(imageFile.originalFilename || imageFile.newFilename || ".jpg") || ".jpg");
    const key = `writing-posts/${session.openId}/${Date.now()}${ext}`;

    // Upload to Manus storage proxy
    const uploadUrl = new URL("v1/storage/upload", FORGE_URL.endsWith("/") ? FORGE_URL : FORGE_URL + "/");
    uploadUrl.searchParams.set("path", key);

    const blob = new Blob([fileBuffer], { type: finalMimeType });
    const formData = new FormData();
    formData.append("file", blob, path.basename(key));

    const uploadRes = await fetch(uploadUrl.toString(), {
      method: "POST",
      headers: { Authorization: `Bearer ${FORGE_KEY}` },
      body: formData,
    });

    if (!uploadRes.ok) {
      const msg = await uploadRes.text().catch(() => uploadRes.statusText);
      console.error("[upload-image] Storage upload failed:", msg);
      // Fallback to compressed base64 on storage failure
      const base64 = fileBuffer.toString("base64");
      const dataUrl = `data:${finalMimeType};base64,${base64}`;
      try { fs.unlinkSync(imageFile.filepath); } catch {}
      return res.status(200).json({ success: true, url: dataUrl });
    }

    const { url } = await uploadRes.json();

    // Cleanup temp file
    try { fs.unlinkSync(imageFile.filepath); } catch {}

    return res.status(200).json({ success: true, url });
  } catch (err) {
    console.error("[upload-image] Error:", err);
    try { fs.unlinkSync(imageFile.filepath); } catch {}
    return res.status(500).json({ error: "ছবি আপলোড করতে সমস্যা হয়েছে" });
  }
}
