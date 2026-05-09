/**
 * /api/upload-avatar — Profile picture upload
 * POST multipart/form-data with "avatar" field
 * Stores image via Manus storage proxy (same as upload-image.js)
 */
import { jwtVerify } from "jose";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

const COOKIE_NAME = "app_session_id";
const JWT_SECRET = process.env.COOKIE_SECRET || process.env.JWT_SECRET || "local-secret-fallback-32chars!!";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

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

async function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return mysql.createConnection(url);
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Auth check
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.get(COOKIE_NAME);
  const session = await verifySession(token);
  if (!session?.openId) return res.status(401).json({ error: "লগইন করুন" });

  // Storage config check
  const FORGE_URL = process.env.BUILT_IN_FORGE_API_URL;
  const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY;
  if (!FORGE_URL || !FORGE_KEY) {
    return res.status(500).json({ error: "Storage configuration missing" });
  }

  // Parse multipart form
  const form = formidable({ maxFileSize: 5 * 1024 * 1024, uploadDir: "/tmp", keepExtensions: true });
  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    if (err.code === 1009) return res.status(400).json({ error: "ছবি আপলোড সমস্যা" });
    return res.status(400).json({ error: "ফাইল পার্স করতে সমস্যা হয়েছে" });
  }

  const file = Array.isArray(files.avatar) ? files.avatar[0] : files.avatar;
  if (!file) return res.status(400).json({ error: "ছবি দিন" });
  const mimeType = file.mimetype || "";
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return res.status(400).json({ error: "শুধু JPG, PNG, GIF, WebP ছবি আপলোড করা যাবে" });
  }

  try {
    const fileBuffer = fs.readFileSync(file.filepath);
    const ext = path.extname(file.originalFilename || file.newFilename || ".jpg") || ".jpg";
    const key = `avatars/${session.openId}/${Date.now()}${ext}`;

    // Upload to Manus storage proxy
    const uploadUrl = new URL("v1/storage/upload", FORGE_URL.endsWith("/") ? FORGE_URL : FORGE_URL + "/");
    uploadUrl.searchParams.set("path", key);

    const blob = new Blob([fileBuffer], { type: mimeType });
    const formData = new FormData();
    formData.append("file", blob, path.basename(key));

    const uploadRes = await fetch(uploadUrl.toString(), {
      method: "POST",
      headers: { Authorization: `Bearer ${FORGE_KEY}` },
      body: formData,
    });

    if (!uploadRes.ok) {
      const msg = await uploadRes.text().catch(() => uploadRes.statusText);
      console.error("[upload-avatar] Storage upload failed:", msg);
      return res.status(500).json({ error: "ছবি আপলোড করতে সমস্যা হয়েছে" });
    }

    const { url } = await uploadRes.json();

    // temp file মুছে ফেলা
    try { fs.unlinkSync(file.filepath); } catch {}

    // DB তে URL সেভ করা
    const db = await getDb();
    try {
      await db.execute("ALTER TABLE local_users ADD COLUMN IF NOT EXISTS bio text").catch(() => {});
      await db.execute("ALTER TABLE local_users ADD COLUMN IF NOT EXISTS avatarUrl text").catch(() => {});

      await db.execute(
        "UPDATE local_users SET avatarUrl = ?, updatedAt = NOW() WHERE openId = ?",
        [url, session.openId]
      );
    } finally {
      await db.end().catch(() => {});
    }

    return res.status(200).json({ success: true, avatarUrl: url });
  } catch (err) {
    console.error("[upload-avatar]", err);
    return res.status(500).json({ error: "ছবি আপলোড করতে সমস্যা হয়েছে" });
  }
}
