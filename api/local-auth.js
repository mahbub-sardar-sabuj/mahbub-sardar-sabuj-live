/**
 * /api/local-auth — Custom email+password auth for "আমিও লিখবো বাস্তবতা"
 * Actions: register, login, logout
 */

import { SignJWT, jwtVerify } from "jose";
import { createPool } from "mysql2/promise";
import { nanoid } from "nanoid";
import * as crypto from "crypto";

const COOKIE_NAME = "app_session_id";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "mahbubsardarsabuj@gmail.com";
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
const APP_ID = process.env.VITE_APP_ID || "local-app";
const JWT_SECRET = process.env.JWT_SECRET || "local-secret-fallback-32chars!!";

// ── DB helper ─────────────────────────────────────────────────────────────────

let pool = null;
function getPool() {
  if (!pool) {
    pool = createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 5,
    });
  }
  return pool;
}

// ── Password helpers (using Node crypto — no bcrypt needed) ───────────────────

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const hashBuf = crypto.scryptSync(password, salt, 64).toString("hex");
  return hashBuf === hash;
}

// ── JWT helpers ───────────────────────────────────────────────────────────────

function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
}

async function createSessionToken(openId, name) {
  const secretKey = getSecretKey();
  return new SignJWT({ openId, appId: APP_ID, name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime("1y")
    .sign(secretKey);
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

function setCookieHeader(token) {
  const maxAge = Math.floor(ONE_YEAR_MS / 1000);
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${maxAge}`;
}

function clearCookieHeader() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0`;
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // CORS for same-origin
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, name, email, password } = req.body || {};

  if (!action) {
    return res.status(400).json({ error: "action required" });
  }

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error("[local-auth] DATABASE_URL is not set!");
    return res.status(500).json({ error: "ডেটাবেজ কনফিগারেশন সমস্যা। অ্যাডমিনকে জানান।" });
  }
  const db = getPool();

  // ── REGISTER ──────────────────────────────────────────────────────────────

  if (action === "register") {
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: "নাম, ইমেইল ও পাসওয়ার্ড দিন" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" });
    }

    const normalEmail = email.trim().toLowerCase();
    const normalName = name.trim();

    try {
      // Check if email already exists
      const [existing] = await db.execute(
        "SELECT id FROM local_users WHERE email = ? LIMIT 1",
        [normalEmail]
      );
      if (existing.length > 0) {
        return res.status(409).json({ error: "এই ইমেইল দিয়ে আগেই একাউন্ট আছে। লগইন করুন।" });
      }

      const openId = `local_${nanoid(20)}`;
      const passwordHash = hashPassword(password);

      // Insert into local_users
      await db.execute(
        "INSERT INTO local_users (openId, name, email, passwordHash) VALUES (?, ?, ?, ?)",
        [openId, normalName, normalEmail, passwordHash]
      );

      // Also upsert into main users table so tRPC auth.me works
      const ownerEmail = OWNER_EMAIL;
      const registerRole = (ownerEmail && normalEmail === ownerEmail.toLowerCase()) ? 'admin' : 'user';
      await db.execute(
        `INSERT INTO users (openId, name, email, loginMethod, role, lastSignedIn)
         VALUES (?, ?, ?, 'local', ?, NOW())
         ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), role=VALUES(role), lastSignedIn=NOW()`,
        [openId, normalName, normalEmail, registerRole]
      );

      const token = await createSessionToken(openId, normalName);
      res.setHeader("Set-Cookie", setCookieHeader(token));
      return res.status(200).json({ success: true, name: normalName });
    } catch (err) {
      console.error("[local-auth register]", err);
      return res.status(500).json({ error: "রেজিস্ট্রেশনে সমস্যা হয়েছে। আবার চেষ্টা করুন।" });
    }
  }

  // ── LOGIN ─────────────────────────────────────────────────────────────────

  if (action === "login") {
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: "ইমেইল ও পাসওয়ার্ড দিন" });
    }

    const normalEmail = email.trim().toLowerCase();

    try {
      const [rows] = await db.execute(
        "SELECT openId, name, passwordHash FROM local_users WHERE email = ? LIMIT 1",
        [normalEmail]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: "ইমেইল বা পাসওয়ার্ড সঠিক নয়" });
      }

      const user = rows[0];
      const valid = verifyPassword(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "ইমেইল বা পাসওয়ার্ড সঠিক নয়" });
      }

      // Update lastSignedIn in main users table
      const ownerEmail = OWNER_EMAIL;
      const loginRole = (ownerEmail && normalEmail === ownerEmail.toLowerCase()) ? 'admin' : 'user';
      await db.execute(
        `INSERT INTO users (openId, name, email, loginMethod, role, lastSignedIn)
         VALUES (?, ?, ?, 'local', ?, NOW())
         ON DUPLICATE KEY UPDATE role=VALUES(role), lastSignedIn=NOW()`,
        [user.openId, user.name, normalEmail, loginRole]
      );

      const token = await createSessionToken(user.openId, user.name);
      res.setHeader("Set-Cookie", setCookieHeader(token));
      return res.status(200).json({ success: true, name: user.name });
    } catch (err) {
      console.error("[local-auth login]", err);
      return res.status(500).json({ error: "লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।" });
    }
  }

  // ── LOGOUT ────────────────────────────────────────────────────────────────

  if (action === "logout") {
    res.setHeader("Set-Cookie", clearCookieHeader());
    return res.status(200).json({ success: true });
  }

  return res.status(400).json({ error: "অজানা action" });
}
