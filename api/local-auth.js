/**
 * /api/local-auth — Custom email+password auth for "আমিও লিখবো বাস্তবতা"
 * Actions: register, login, logout, owner-reset, forgot-password, reset-password
 */

import { SignJWT } from "jose";
import { createPool } from "mysql2/promise";
import { nanoid } from "nanoid";
import * as crypto from "crypto";
import { checkRateLimit, limitJsonBodySize } from "./_utils/security.js";

const COOKIE_NAME = "app_session_id";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "mahbubsardarsabuj@gmail.com";
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
const APP_ID = process.env.APP_ID || process.env.VITE_APP_ID || "local-app";
const JWT_SECRET = process.env.COOKIE_SECRET || process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // Production guard: refuse to run with no secret
  // In local dev, set COOKIE_SECRET or JWT_SECRET in .env
  throw new Error("[local-auth] COOKIE_SECRET or JWT_SECRET env var is required. Refusing to use an insecure hardcoded fallback.");
}
const OWNER_BOOTSTRAP_PASSWORD_SHA256 = process.env.OWNER_BOOTSTRAP_PASSWORD_SHA256?.trim() || "";
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
  return Boolean(
    OWNER_BOOTSTRAP_PASSWORD_SHA256 &&
    isOwnerEmail(normalEmail) &&
    safeEqualHex(sha256Hex(password), OWNER_BOOTSTRAP_PASSWORD_SHA256)
  );
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

// ── Email helper (Gmail SMTP via Nodemailer) ──────────────────────────────────

async function sendPasswordResetEmail(toEmail, userName, resetToken) {
  const FROM = process.env.CONTACT_EMAIL_FROM || "mahbubsardarsabuj@gmail.com";
  const PASS = process.env.GMAIL_APP_PASSWORD;
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

  const resetLink = `https://www.mahbubsardarsabuj.com/amio-likhbo-bastobota?reset_token=${resetToken}`;

  // Send reset link via Telegram to the user's chat (if bot token available)
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_ADMIN_CHAT_ID) {
    try {
      const telegramText = `🔐 <b>পাসওয়ার্ড রিসেট অনুরোধ</b>\n\n👤 <b>নাম:</b> ${userName}\n📧 <b>ইমেইল:</b> ${toEmail}\n\n🔗 <b>রিসেট লিঙ্ক:</b>\n${resetLink}\n\n⏰ এই লিঙ্কটি ১৫ মিনিটের জন্য বৈধ।`;
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_ADMIN_CHAT_ID,
          text: telegramText,
          parse_mode: "HTML",
        }),
      });
    } catch (e) {
      console.warn("[forgot-password] Telegram notify failed:", e.message);
    }
  }

  if (!FROM || !PASS) {
    console.warn("[forgot-password] CONTACT_EMAIL_FROM or GMAIL_APP_PASSWORD not set — email not sent");
    return false;
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: { user: FROM, pass: PASS },
    });

    await transporter.sendMail({
      from: `"বাস্তবতা লেখক" <${FROM}>`,
      to: toEmail,
      subject: "পাসওয়ার্ড রিসেট — আমিও লিখবো বাস্তবতা",
      text: `প্রিয় ${userName},\n\nআপনি পাসওয়ার্ড রিসেটের অনুরোধ করেছেন।\n\nনিচের লিঙ্কে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন:\n${resetLink}\n\nএই লিঙ্কটি ১৫ মিনিটের জন্য বৈধ।\n\nযদি আপনি এই অনুরোধ না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।\n\n— বাস্তবতা টিম`,
      html: `
        <div style="font-family: 'Noto Sans Bengali', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #071426; border-radius: 16px; overflow: hidden; border: 1px solid rgba(232,201,122,0.3);">
          <div style="background: linear-gradient(135deg, #0d1f3c, #071426); padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid rgba(232,201,122,0.2);">
            <h1 style="color: #F7D56F; margin: 0; font-size: 22px; font-weight: 900;">আমিও লিখবো বাস্তবতা</h1>
            <p style="color: rgba(253,246,236,0.6); margin: 8px 0 0; font-size: 14px;">mahbubsardarsabuj.com</p>
          </div>
          <div style="padding: 32px;">
            <p style="color: #FDF6EC; font-size: 16px; margin: 0 0 16px;">প্রিয় <strong style="color: #F7D56F;">${userName}</strong>,</p>
            <p style="color: rgba(253,246,236,0.8); font-size: 15px; line-height: 1.7; margin: 0 0 24px;">আপনি পাসওয়ার্ড রিসেটের অনুরোধ করেছেন। নিচের বাটনে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন।</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #F7D56F 0%, #D4A843 58%, #B98A24 100%); color: #071426; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 900; font-size: 16px;">পাসওয়ার্ড রিসেট করুন</a>
            </div>
            <p style="color: rgba(253,246,236,0.5); font-size: 13px; text-align: center; margin: 0 0 8px;">এই লিঙ্কটি <strong style="color: #F7D56F;">১৫ মিনিটের</strong> জন্য বৈধ।</p>
            <p style="color: rgba(253,246,236,0.4); font-size: 12px; text-align: center; margin: 0;">যদি আপনি এই অনুরোধ না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।</p>
          </div>
          <div style="padding: 16px 32px; border-top: 1px solid rgba(232,201,122,0.15); text-align: center;">
            <p style="color: rgba(253,246,236,0.3); font-size: 11px; margin: 0;">© 2025 মাহবুব সরদার সবুজ — mahbubsardarsabuj.com</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("[forgot-password] Email send failed:", err.message);
    return false;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (limitJsonBodySize(req, res, 32 * 1024)) return;

  const { action, name, email, password } = req.body || {};

  if (!action) {
    return res.status(400).json({ error: "action required" });
  }

  if (action !== "logout") {
    const rate = checkRateLimit(req, res, {
      keyPrefix: "local-auth",
      windowMs: 15 * 60 * 1000,
      max: 8,
      message: "নিরাপত্তার কারণে সাময়িকভাবে অনেকবার চেষ্টা করা যাবে না। ১৫ মিনিট পরে আবার চেষ্টা করুন।",
    });
    if (rate.limited) return;
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
    if (password.length < 8) {
      return res.status(400).json({ error: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে" });
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

  // ── FORGOT PASSWORD — ইমেইলে রিসেট লিঙ্ক পাঠানো ─────────────────────────

  if (action === "forgot-password") {
    if (!email?.trim()) {
      return res.status(400).json({ error: "ইমেইল ঠিকানা দিন" });
    }
    const normalEmail = email.trim().toLowerCase();

    try {
      // Ensure table exists (auto-create if missing)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(320) NOT NULL,
          token VARCHAR(64) NOT NULL UNIQUE,
          expiresAt TIMESTAMP NOT NULL,
          usedAt TIMESTAMP NULL,
          createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Check user exists — always return same message to prevent email enumeration
      const [rows] = await db.execute(
        "SELECT name FROM local_users WHERE email = ? LIMIT 1",
        [normalEmail]
      );

      if (rows.length === 0) {
        // Return success anyway to prevent email enumeration attack
        return res.status(200).json({
          success: true,
          message: "যদি এই ইমেইলে একাউন্ট থাকে, তাহলে রিসেট লিঙ্ক পাঠানো হয়েছে।",
        });
      }

      const userName = rows[0].name;

      // Invalidate old tokens for this email
      await db.execute(
        "UPDATE password_reset_tokens SET usedAt = NOW() WHERE email = ? AND usedAt IS NULL",
        [normalEmail]
      );

      // Generate secure token
      const resetToken = nanoid(40);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await db.execute(
        "INSERT INTO password_reset_tokens (email, token, expiresAt) VALUES (?, ?, ?)",
        [normalEmail, resetToken, expiresAt]
      );

      // Send email
      await sendPasswordResetEmail(normalEmail, userName, resetToken);

      return res.status(200).json({
        success: true,
        message: "পাসওয়ার্ড রিসেটের লিঙ্ক আপনার ইমেইলে পাঠানো হয়েছে। ১৫ মিনিটের মধ্যে ব্যবহার করুন।",
      });
    } catch (err) {
      console.error("[local-auth forgot-password]", err);
      return res.status(500).json({ error: "পাসওয়ার্ড রিসেটে সমস্যা হয়েছে। আবার চেষ্টা করুন।" });
    }
  }

  // ── RESET PASSWORD — টোকেন যাচাই করে নতুন পাসওয়ার্ড সেট করা ────────────

  if (action === "reset-password") {
    const { token, newPassword } = req.body || {};

    if (!token?.trim()) {
      return res.status(400).json({ error: "রিসেট টোকেন প্রয়োজন" });
    }
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: "নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে" });
    }

    try {
      // Ensure table exists
      await db.execute(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(320) NOT NULL,
          token VARCHAR(64) NOT NULL UNIQUE,
          expiresAt TIMESTAMP NOT NULL,
          usedAt TIMESTAMP NULL,
          createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const [tokenRows] = await db.execute(
        "SELECT email, expiresAt, usedAt FROM password_reset_tokens WHERE token = ? LIMIT 1",
        [token.trim()]
      );

      if (tokenRows.length === 0) {
        return res.status(400).json({ error: "রিসেট লিঙ্কটি বৈধ নয় বা মেয়াদ শেষ হয়ে গেছে।" });
      }

      const tokenRow = tokenRows[0];

      if (tokenRow.usedAt) {
        return res.status(400).json({ error: "এই রিসেট লিঙ্কটি আগেই ব্যবহার করা হয়েছে।" });
      }

      if (new Date(tokenRow.expiresAt) < new Date()) {
        return res.status(400).json({ error: "রিসেট লিঙ্কের মেয়াদ শেষ হয়ে গেছে। নতুন লিঙ্কের জন্য আবার চেষ্টা করুন।" });
      }

      const normalEmail = tokenRow.email;
      const newHash = hashPassword(newPassword);

      // Update password
      const [result] = await db.execute(
        "UPDATE local_users SET passwordHash = ? WHERE email = ?",
        [newHash, normalEmail]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "ব্যবহারকারী পাওয়া যায়নি।" });
      }

      // Mark token as used
      await db.execute(
        "UPDATE password_reset_tokens SET usedAt = NOW() WHERE token = ?",
        [token.trim()]
      );

      return res.status(200).json({
        success: true,
        message: "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! এখন লগইন করুন।",
      });
    } catch (err) {
      console.error("[local-auth reset-password]", err);
      return res.status(500).json({ error: "পাসওয়ার্ড পরিবর্তনে সমস্যা হয়েছে। আবার চেষ্টা করুন।" });
    }
  }

  // ── OWNER RESET PASSWORD ──────────────────────────────────────────────────

  if (action === "owner-reset") {
    const resetToken = process.env.OWNER_RESET_TOKEN?.trim() || "";
    const { token, newPassword, targetEmail } = req.body || {};
    if (!resetToken) {
      return res.status(503).json({ error: "মালিকের পাসওয়ার্ড রিসেট কনফিগার করা নেই" });
    }
    if (!token || !safeEqualHex(sha256Hex(token), sha256Hex(resetToken))) {
      return res.status(403).json({ error: "অনুমতি নেই" });
    }
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: "নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে" });
    }
    const targetEmailNorm = (targetEmail || OWNER_EMAIL).toLowerCase().trim();
    try {
      const newHash = hashPassword(newPassword);
      const [result] = await db.execute(
        "UPDATE local_users SET passwordHash = ? WHERE email = ?",
        [newHash, targetEmailNorm]
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
