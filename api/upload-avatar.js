/**
 * /api/upload-avatar — Profile picture upload
 * POST multipart/form-data with "avatar" field
 * Accepts ANY file size — no limit.
 * Stores as base64 data URL in DB (longtext column).
 */
import { jwtVerify } from "jose";
import formidable from "formidable";
import fs from "fs";
import mysql from "mysql2/promise";

const COOKIE_NAME = "app_session_id";
const JWT_SECRET = process.env.COOKIE_SECRET || process.env.JWT_SECRET || "local-secret-fallback-32chars!!";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"];

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

// No body size limit — accept any size
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Auth check
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.get(COOKIE_NAME);
  const session = await verifySession(token);
  if (!session?.openId) return res.status(401).json({ error: "লগইন করুন" });

  // Parse multipart form — NO maxFileSize limit
  const form = formidable({
    maxFileSize: Infinity,
    uploadDir: "/tmp",
    keepExtensions: true,
  });

  let files;
  try {
    [, files] = await form.parse(req);
  } catch (err) {
    console.error("[upload-avatar] parse error:", err);
    return res.status(400).json({ error: "ফাইল পার্স করতে সমস্যা হয়েছে" });
  }

  const file = Array.isArray(files.avatar) ? files.avatar[0] : files.avatar;
  if (!file) return res.status(400).json({ error: "ছবি দিন (field name: avatar)" });

  const mimeType = (file.mimetype || "").toLowerCase();
  if (!ALLOWED_TYPES.includes(mimeType)) {
    try { fs.unlinkSync(file.filepath); } catch {}
    return res.status(400).json({ error: "শুধু JPG, PNG, GIF, WebP ছবি আপলোড করা যাবে" });
  }

  try {
    const fileBuffer = fs.readFileSync(file.filepath);
    try { fs.unlinkSync(file.filepath); } catch {}

    // Try Manus storage first; fall back to base64 if unavailable
    const FORGE_URL = process.env.BUILT_IN_FORGE_API_URL;
    const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY;
    let avatarUrl = "";

    if (FORGE_URL && FORGE_KEY) {
      try {
        const ext = mimeType.split("/")[1] || "jpg";
        const key = `avatars/${session.openId}/${Date.now()}.${ext}`;
        const uploadUrl = new URL(
          "v1/storage/upload",
          FORGE_URL.endsWith("/") ? FORGE_URL : FORGE_URL + "/"
        );
        uploadUrl.searchParams.set("path", key);
        const blob = new Blob([fileBuffer], { type: mimeType });
        const formData = new FormData();
        formData.append("file", blob, key.split("/").pop());
        const uploadRes = await fetch(uploadUrl.toString(), {
          method: "POST",
          headers: { Authorization: `Bearer ${FORGE_KEY}` },
          body: formData,
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          avatarUrl = data.url || "";
        }
      } catch (storageErr) {
        console.warn("[upload-avatar] Storage error, using base64:", storageErr.message);
      }
    }

    // If storage failed or not configured → use base64 data URL
    if (!avatarUrl) {
      avatarUrl = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
    }

    // Save to DB
    const db = await getDb();
    try {
      // Ensure column exists
      await db.execute(
        "ALTER TABLE local_users ADD COLUMN IF NOT EXISTS avatarUrl longtext"
      ).catch(() => {});
      await db.execute(
        "ALTER TABLE local_users ADD COLUMN IF NOT EXISTS bio text"
      ).catch(() => {});

      await db.execute(
        "UPDATE local_users SET avatarUrl = ?, updatedAt = NOW() WHERE openId = ?",
        [avatarUrl, session.openId]
      );
    } finally {
      await db.end().catch(() => {});
    }

    return res.status(200).json({ success: true, avatarUrl });
  } catch (err) {
    console.error("[upload-avatar] error:", err);
    return res.status(500).json({ error: "ছবি সেভ করতে সমস্যা হয়েছে: " + err.message });
  }
}
