/**
 * /api/profile — User profile management
 * GET  /api/profile        → নিজের প্রোফাইল দেখা (auth required)
 * POST /api/profile        → প্রোফাইল আপডেট (auth required)
 * GET  /api/profile?openId=xxx → অন্যের প্রোফাইল দেখা (public)
 */
import { jwtVerify } from "jose";
import mysql from "mysql2/promise";

const COOKIE_NAME = "app_session_id";
const JWT_SECRET = process.env.COOKIE_SECRET || process.env.JWT_SECRET || "local-secret-fallback-32chars!!";

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
  const conn = await mysql.createConnection(url);
  return conn;
}

async function ensureProfileColumns(db) {
  // bio এবং avatarUrl কলাম যোগ করা (যদি না থাকে)
  await db.execute(
    "ALTER TABLE local_users ADD COLUMN IF NOT EXISTS bio text"
  ).catch(() => {});
  await db.execute(
    "ALTER TABLE local_users ADD COLUMN IF NOT EXISTS avatarUrl text"
  ).catch(() => {});
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const db = await getDb();
  await ensureProfileColumns(db);

  try {
    // ── GET: প্রোফাইল দেখা ──────────────────────────────────────────────────
    if (req.method === "GET") {
      const { openId } = req.query;

      if (openId) {
        // অন্যের পাবলিক প্রোফাইল
        const [rows] = await db.execute(
          "SELECT openId, name, bio, avatarUrl, createdAt FROM local_users WHERE openId = ? LIMIT 1",
          [openId]
        );
        if (!rows.length) return res.status(404).json({ error: "প্রোফাইল পাওয়া যায়নি" });
        const user = rows[0];
        // পোস্ট সংখ্যা
        const [postRows] = await db.execute(
          "SELECT COUNT(*) as count FROM writing_posts WHERE authorOpenId = ? AND status = 'approved'",
          [openId]
        );
        return res.status(200).json({
          ...user,
          postCount: postRows[0]?.count || 0,
        });
      }

      // নিজের প্রোফাইল (auth required)
      const cookies = parseCookies(req.headers.cookie);
      const token = cookies.get(COOKIE_NAME);
      const session = await verifySession(token);
      if (!session?.openId) return res.status(401).json({ error: "লগইন করুন" });

      const [rows] = await db.execute(
        "SELECT openId, name, email, bio, avatarUrl, createdAt FROM local_users WHERE openId = ? LIMIT 1",
        [session.openId]
      );
      if (!rows.length) return res.status(404).json({ error: "প্রোফাইল পাওয়া যায়নি" });
      const user = rows[0];
      const [postRows] = await db.execute(
        "SELECT COUNT(*) as count FROM writing_posts WHERE authorOpenId = ?",
        [session.openId]
      );
      const [approvedRows] = await db.execute(
        "SELECT COUNT(*) as count FROM writing_posts WHERE authorOpenId = ? AND status = 'approved'",
        [session.openId]
      );
      return res.status(200).json({
        ...user,
        postCount: postRows[0]?.count || 0,
        approvedPostCount: approvedRows[0]?.count || 0,
      });
    }

    // ── POST: প্রোফাইল আপডেট ────────────────────────────────────────────────
    if (req.method === "POST") {
      const cookies = parseCookies(req.headers.cookie);
      const token = cookies.get(COOKIE_NAME);
      const session = await verifySession(token);
      if (!session?.openId) return res.status(401).json({ error: "লগইন করুন" });

      const { name, bio, avatarUrl } = req.body || {};

      if (!name?.trim()) return res.status(400).json({ error: "নাম দিন" });
      if (name.trim().length > 160) return res.status(400).json({ error: "নাম সর্বোচ্চ ১৬০ অক্ষর" });
      if (bio && bio.length > 500) return res.status(400).json({ error: "বায়ো সর্বোচ্চ ৫০০ অক্ষর" });

      await db.execute(
        "UPDATE local_users SET name = ?, bio = ?, avatarUrl = ?, updatedAt = NOW() WHERE openId = ?",
        [name.trim(), bio?.trim() || null, avatarUrl || null, session.openId]
      );

      // writing_posts এও authorName আপডেট করা
      await db.execute(
        "UPDATE writing_posts SET authorName = ? WHERE authorOpenId = ?",
        [name.trim(), session.openId]
      );

      return res.status(200).json({ success: true, name: name.trim() });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[profile]", err);
    return res.status(500).json({ error: "সার্ভার ত্রুটি" });
  } finally {
    await db.end().catch(() => {});
  }
}
