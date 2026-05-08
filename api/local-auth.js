/**
 * /api/local-auth — Custom email+password auth for "আমিও লিখবো বাস্তবতা"
 * Actions: register, login, logout, owner-reset
 */

import { SignJWT } from "jose";
import { createPool } from "mysql2/promise";
import { nanoid } from "nanoid";
import * as crypto from "crypto";

const COOKIE_NAME = "app_session_id";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "mahbubsardarsabuj@gmail.com";
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
const APP_ID = process.env.APP_ID || process.env.VITE_APP_ID || "local-app";
const JWT_SECRET = process.env.COOKIE_SECRET || process.env.JWT_SECRET || "local-secret-fallback-32chars!!";
const OWNER_BOOTSTRAP_PASSWORD_SHA256 =
  process.env.OWNER_BOOTSTRAP_PASSWORD_SHA256 ||
  "fd336472ae35f647ae39f5bafc62ef5e52b7af47860e8786f9de536bc0195391";
const OWNER_BOOTSTRAP_NAME = process.env.OWNER_BOOTSTRAP_NAME || "মাহবুব সরদার সবুজ";

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
  if (!stored || typeof stored !== "string") return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(crypto.scryptSync(password, salt, 64).toString("hex"), "hex");
  const storedBuf = Buffer.from(hash, "hex");
  if (hashBuf.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(hashBuf, storedBuf);
}

function isOwnerEmail(email) {
  return Boolean(OWNER_EMAIL && email === OWNER_EMAIL.toLowerCase().trim());
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function safeEqualHex(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

function canUseOwnerBootstrap(normalEmail, password) {
  return isOwnerEmail(normalEmail) && safeEqualHex(sha256Hex(password), OWNER_BOOTSTRAP_PASSWORD_SHA256);
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

async function upsertMainUser(db, { openId, name, email }) {
  const role = isOwnerEmail(email) ? "admin" : "user";
  await db.execute(
    `INSERT INTO users (openId, name, email, loginMethod, role, lastSignedIn)
     VALUES (?, ?, ?, 'local', ?, NOW())
     ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), loginMethod='local', role=VALUES(role), lastSignedIn=NOW()`,
    [openId, name, email, role]
  );
}

async function issueLoginResponse(res, db, user, email) {
  await upsertMainUser(db, { openId: user.openId, name: user.name, email });
  const token = await createSessionToken(user.openId, user.name);
  res.setHeader("Set-Cookie", setCookieHeader(token));
  return res.status(200).json({ success: true, name: user.name, email });
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, name, email, password } = req.body || {};

  if (!action) {
    return res.status(400).json({ error: "action required" });
  }

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
      const [existing] = await db.execute(
        "SELECT id FROM local_users WHERE email = ? LIMIT 1",
        [normalEmail]
      );
      if (existing.length > 0) {
        return res.status(409).json({ error: "এই ইমেইল দিয়ে আগেই একাউন্ট আছে। লগইন করুন।" });
      }

      const openId = `local_${nanoid(20)}`;
      const passwordHash = hashPassword(password);

      await db.execute(
        "INSERT INTO local_users (openId, name, email, passwordHash) VALUES (?, ?, ?, ?)",
        [openId, normalName, normalEmail, passwordHash]
      );

      const user = { openId, name: normalName };
      return issueLoginResponse(res, db, user, normalEmail);
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
        if (canUseOwnerBootstrap(normalEmail, password)) {
          const openId = `local_${nanoid(20)}`;
          const passwordHash = hashPassword(password);
          await db.execute(
            "INSERT INTO local_users (openId, name, email, passwordHash) VALUES (?, ?, ?, ?)",
            [openId, OWNER_BOOTSTRAP_NAME, normalEmail, passwordHash]
          );
          return issueLoginResponse(res, db, { openId, name: OWNER_BOOTSTRAP_NAME }, normalEmail);
        }
        return res.status(401).json({ error: "ইমেইল বা পাসওয়ার্ড সঠিক নয়" });
      }

      const user = rows[0];
      const valid = verifyPassword(password, user.passwordHash);
      if (!valid) {
        if (canUseOwnerBootstrap(normalEmail, password)) {
          const passwordHash = hashPassword(password);
          const ownerName = user.name || OWNER_BOOTSTRAP_NAME;
          await db.execute(
            "UPDATE local_users SET name = ?, passwordHash = ? WHERE email = ?",
            [ownerName, passwordHash, normalEmail]
          );
          return issueLoginResponse(res, db, { openId: user.openId, name: ownerName }, normalEmail);
        }
        return res.status(401).json({ error: "ইমেইল বা পাসওয়ার্ড সঠিক নয়" });
      }

      return issueLoginResponse(res, db, user, normalEmail);
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

  // ── OWNER RESET PASSWORD ──────────────────────────────────────────────────

  if (action === "owner-reset") {
    const resetToken = process.env.OWNER_RESET_TOKEN;
    const { token, newPassword } = req.body || {};
    if (!resetToken || !token || token !== resetToken) {
      return res.status(403).json({ error: "অনুমতি নেই" });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" });
    }
    const ownerEmail = OWNER_EMAIL.toLowerCase();
    try {
      const newHash = hashPassword(newPassword);
      const [result] = await db.execute(
        "UPDATE local_users SET passwordHash = ? WHERE email = ?",
        [newHash, ownerEmail]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "ব্যবহারকারী পাওয়া যায়নি" });
      }
      return res.status(200).json({ success: true, message: "পাসওয়ার্ড আপডেট হয়েছে" });
    } catch (err) {
      console.error("[local-auth owner-reset]", err);
      return res.status(500).json({ error: "পাসওয়ার্ড রিসেটে সমস্যা হয়েছে" });
    }
  }

  return res.status(400).json({ error: "অজানা action" });
}
