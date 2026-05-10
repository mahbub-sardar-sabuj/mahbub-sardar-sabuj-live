/**
 * /api/upload — Combined upload handler for images, avatars, and covers
 * Route is determined by the `type` query parameter:
 *   ?type=image   → writing post image upload (upload-image.js)
 *   ?type=avatar  → profile picture upload (upload-avatar.js)
 *   ?type=cover   → profile cover photo upload (upload-cover.js)
 */
import { jwtVerify } from "jose";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

const COOKIE_NAME = "app_session_id";
const JWT_SECRET = process.env.COOKIE_SECRET || process.env.JWT_SECRET || "local-secret-fallback-32chars!!";
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

export const config = { api: { bodyParser: false } };

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

async function compressImage(buffer, mimeType) {
  try {
    const sharp = (await import("sharp")).default;
    const compressed = await sharp(buffer)
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer();
    return { buffer: compressed, mimeType: "image/jpeg" };
  } catch {
    return { buffer, mimeType };
  }
}

async function resizeToThumbnail(buffer, mimeType) {
  try {
    const sharp = (await import("sharp")).default;
    const resized = await sharp(buffer)
      .resize(200, 200, { fit: "cover", position: "center" })
      .jpeg({ quality: 85 })
      .toBuffer();
    return { buffer: resized, mimeType: "image/jpeg" };
  } catch {
    return { buffer, mimeType };
  }
}

async function uploadToStorage(fileBuffer, mimeType, key) {
  const FORGE_URL = process.env.BUILT_IN_FORGE_API_URL;
  const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY;
  if (!FORGE_URL || !FORGE_KEY) return null;
  try {
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
    if (uploadRes.ok) {
      const data = await uploadRes.json();
      return data.url || null;
    }
    return null;
  } catch {
    return null;
  }
}

// Handle writing post image upload
async function handleImageUpload(req, res, session) {
  const form = formidable({ maxFileSize: Infinity, uploadDir: "/tmp", keepExtensions: true });
  let files;
  try {
    [, files] = await form.parse(req);
  } catch (err) {
    return res.status(400).json({ error: "ফাইল পার্স করতে সমস্যা হয়েছে" });
  }
  const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
  if (!imageFile) return res.status(400).json({ error: "ছবি নির্বাচন করুন" });
  const mimeType = imageFile.mimetype || "image/jpeg";
  if (mimeType && !mimeType.startsWith("image/")) {
    try { fs.unlinkSync(imageFile.filepath); } catch {}
    return res.status(400).json({ error: "শুধু ছবি আপলোড করা যাবে" });
  }
  try {
    const rawBuffer = fs.readFileSync(imageFile.filepath);
    const { buffer: fileBuffer, mimeType: finalMimeType } = await compressImage(rawBuffer, mimeType);
    const ext = finalMimeType === "image/jpeg" ? ".jpg" : (path.extname(imageFile.originalFilename || imageFile.newFilename || ".jpg") || ".jpg");
    const key = `writing-posts/${session.openId}/${Date.now()}${ext}`;
    const storageUrl = await uploadToStorage(fileBuffer, finalMimeType, key);
    try { fs.unlinkSync(imageFile.filepath); } catch {}
    if (storageUrl) return res.status(200).json({ success: true, url: storageUrl });
    const base64 = fileBuffer.toString("base64");
    return res.status(200).json({ success: true, url: `data:${finalMimeType};base64,${base64}` });
  } catch (err) {
    try { fs.unlinkSync(imageFile.filepath); } catch {}
    return res.status(500).json({ error: "ছবি আপলোড করতে সমস্যা হয়েছে" });
  }
}

// Handle avatar upload
async function handleAvatarUpload(req, res, session) {
  const form = formidable({ maxFileSize: Infinity, uploadDir: "/tmp", keepExtensions: true });
  let files;
  try {
    [, files] = await form.parse(req);
  } catch {
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
    const ext = mimeType.split("/")[1] || "jpg";
    const key = `avatars/${session.openId}/${Date.now()}.${ext}`;
    let avatarUrl = await uploadToStorage(fileBuffer, mimeType, key);
    if (!avatarUrl) {
      const { buffer: thumbBuffer, mimeType: thumbMime } = await resizeToThumbnail(fileBuffer, mimeType);
      avatarUrl = `data:${thumbMime};base64,${thumbBuffer.toString("base64")}`;
    }
    const db = await getDb();
    try {
      await db.execute("ALTER TABLE local_users ADD COLUMN IF NOT EXISTS avatarUrl longtext").catch(() => {});
      await db.execute("ALTER TABLE local_users MODIFY COLUMN avatarUrl longtext").catch(() => {});
      await db.execute("ALTER TABLE local_users ADD COLUMN IF NOT EXISTS bio text").catch(() => {});
      await db.execute("UPDATE local_users SET avatarUrl = ?, updatedAt = NOW() WHERE openId = ?", [avatarUrl, session.openId]);
    } finally {
      await db.end().catch(() => {});
    }
    return res.status(200).json({ success: true, avatarUrl });
  } catch (err) {
    return res.status(500).json({ error: "ছবি সেভ করতে সমস্যা হয়েছে: " + err.message });
  }
}

// Handle cover photo upload
async function handleCoverUpload(req, res, session) {
  const form = formidable({ maxFileSize: Infinity, uploadDir: "/tmp", keepExtensions: true });
  let files;
  try {
    [, files] = await form.parse(req);
  } catch {
    return res.status(400).json({ error: "ফাইল পার্স করতে সমস্যা হয়েছে" });
  }
  const file = Array.isArray(files.cover) ? files.cover[0] : files.cover;
  if (!file) return res.status(400).json({ error: "কভার ছবি দিন" });
  const mimeType = file.mimetype || "";
  if (!ALLOWED_TYPES.includes(mimeType)) {
    try { fs.unlinkSync(file.filepath); } catch {}
    return res.status(400).json({ error: "শুধু JPG, PNG, GIF, WebP ছবি আপলোড করা যাবে" });
  }
  try {
    const fileBuffer = fs.readFileSync(file.filepath);
    const ext = path.extname(file.originalFilename || file.newFilename || ".jpg") || ".jpg";
    const key = `covers/${session.openId}/${Date.now()}${ext}`;
    let url = await uploadToStorage(fileBuffer, mimeType, key);
    if (!url) url = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
    try { fs.unlinkSync(file.filepath); } catch {}
    const db = await getDb();
    try {
      await db.execute("ALTER TABLE local_users ADD COLUMN IF NOT EXISTS coverUrl longtext").catch(() => {});
      await db.execute("ALTER TABLE local_users MODIFY COLUMN coverUrl longtext").catch(() => {});
      await db.execute("UPDATE local_users SET coverUrl = ?, updatedAt = NOW() WHERE openId = ?", [url, session.openId]);
    } finally {
      await db.end().catch(() => {});
    }
    return res.status(200).json({ success: true, coverUrl: url });
  } catch (err) {
    try { fs.unlinkSync(file.filepath); } catch {}
    return res.status(500).json({ error: "কভার ছবি আপলোড করতে সমস্যা হয়েছে" });
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Auth check
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.get(COOKIE_NAME);
  const session = await verifySession(token);
  if (!session?.openId) return res.status(401).json({ error: "লগইন করুন" });

  const uploadType = req.query?.type || new URL(req.url, "http://localhost").searchParams.get("type");

  if (uploadType === "avatar") return handleAvatarUpload(req, res, session);
  if (uploadType === "cover") return handleCoverUpload(req, res, session);
  // Default: writing post image
  return handleImageUpload(req, res, session);
}
