/**
 * /api/upload-avatar — Profile picture upload
 * POST multipart/form-data with "avatar" field
 * Stores image as base64 data URL (no external storage needed)
 */
import { jwtVerify } from "jose";
import formidable from "formidable";
import fs from "fs";
import mysql from "mysql2/promise";

const COOKIE_NAME = "app_session_id";
const JWT_SECRET = process.env.COOKIE_SECRET || process.env.JWT_SECRET || "local-secret-fallback-32chars!!";
const MAX_FILE_SIZE = Infinity; // কোনো সাইজ সীমা নেই
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

  // Parse multipart form
  const form = formidable({ maxFileSize: MAX_FILE_SIZE, keepExtensions: true });
  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    if (err.code === 1009) return res.status(400).json({ error: "ছবি আপলোড সমস্যা" });
    return res.status(400).json({ error: "ফাইল পার্স করতে সমস্যা হয়েছে" });
  }

  const file = Array.isArray(files.avatar) ? files.avatar[0] : files.avatar;
  if (!file) return res.status(400).json({ error: "ছবি দিন" });
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return res.status(400).json({ error: "শুধু JPG, PNG, GIF, WebP ছবি আপলোড করা যাবে" });
  }

  try {
    // ছবি base64 data URL হিসেবে সংরক্ষণ করা
    const imageBuffer = fs.readFileSync(file.filepath);
    const base64 = imageBuffer.toString("base64");
    const dataUrl = `data:${file.mimetype};base64,${base64}`;

    // DB তে সেভ করা
    const db = await getDb();
    try {
      // bio এবং avatarUrl কলাম যোগ করা (যদি না থাকে)
      await db.execute("ALTER TABLE local_users ADD COLUMN IF NOT EXISTS bio text").catch(() => {});
      await db.execute("ALTER TABLE local_users ADD COLUMN IF NOT EXISTS avatarUrl mediumtext").catch(() => {});

      await db.execute(
        "UPDATE local_users SET avatarUrl = ?, updatedAt = NOW() WHERE openId = ?",
        [dataUrl, session.openId]
      );
    } finally {
      await db.end().catch(() => {});
    }

    // temp file মুছে ফেলা
    fs.unlinkSync(file.filepath);

    return res.status(200).json({ success: true, avatarUrl: dataUrl });
  } catch (err) {
    console.error("[upload-avatar]", err);
    return res.status(500).json({ error: "ছবি আপলোড করতে সমস্যা হয়েছে" });
  }
}
