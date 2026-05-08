/**
 * Local Auth Route — /api/local-auth
 * Handles email+password registration and login for "আমিও লিখবো বাস্তবতা" platform.
 * Uses Node.js built-in crypto (scrypt) for password hashing — no extra packages needed.
 */

import type { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { localUsers, users } from "../drizzle/schema";
import { sdk } from "./_core/sdk";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { ENV } from "./_core/env";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const OWNER_EMAIL = (process.env.OWNER_EMAIL || "mahbubsardarsabuj@gmail.com").toLowerCase().trim();
const OWNER_BOOTSTRAP_PASSWORD_SHA256 = process.env.OWNER_BOOTSTRAP_PASSWORD_SHA256 || "7ed1bc948ce36459e8fbdf9243fe0ab1c5c420ec3cc71c96b476e57cb4901305";
const OWNER_BOOTSTRAP_NAME = process.env.OWNER_BOOTSTRAP_NAME || "মাহবুব সরদার সবুজ";

/** Hash a password using scrypt */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

/** Verify a password against a stored hash */
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedHash = Buffer.from(hashHex, "hex");
  if (hash.length !== storedHash.length) return false;
  return timingSafeEqual(hash, storedHash);
}

/** Generate a unique openId for local users */
function generateLocalOpenId(email: string): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString("hex");
  return `local_${timestamp}_${random}`;
}

function isOwnerEmail(email: string): boolean {
  return email.toLowerCase().trim() === OWNER_EMAIL;
}

function safeEqualHex(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

function canUseOwnerBootstrap(email: string, password: string): boolean {
  const passwordHash = createHash("sha256").update(password).digest("hex");
  return isOwnerEmail(email) && safeEqualHex(passwordHash, OWNER_BOOTSTRAP_PASSWORD_SHA256);
}

export function registerLocalAuthRoute(app: Express) {
  app.post("/api/local-auth", async (req: Request, res: Response) => {
    const { action, email, password, name } = req.body || {};

    // Validate inputs
    if (!action || !email || !password) {
      res.status(400).json({ error: "action, email এবং password প্রয়োজন।" });
      return;
    }

    if (!["login", "register"].includes(action)) {
      res.status(400).json({ error: "Invalid action" });
      return;
    }

    if (typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ error: "সঠিক ইমেইল দিন।" });
      return;
    }

    if (typeof password !== "string" || password.length < 6) {
      res.status(400).json({ error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "ডেটাবেস সংযোগ নেই। পরে চেষ্টা করুন।" });
      return;
    }

    try {
      if (action === "register") {
        // Registration
        if (!name || typeof name !== "string" || name.trim().length < 2) {
          res.status(400).json({ error: "নাম কমপক্ষে ২ অক্ষর হতে হবে।" });
          return;
        }

        // Check if email already exists
        const existing = await db
          .select()
          .from(localUsers)
          .where(eq(localUsers.email, email.toLowerCase().trim()))
          .limit(1);

        if (existing.length > 0) {
          res.status(409).json({ error: "এই ইমেইল দিয়ে আগেই একাউন্ট আছে। লগইন করুন।" });
          return;
        }

        // Hash password and create user
        const passwordHash = await hashPassword(password);
        const openId = generateLocalOpenId(email);
        const trimmedName = name.trim();
        const normalizedEmail = email.toLowerCase().trim();

        // Insert into local_users table
        await db.insert(localUsers).values({
          openId,
          name: trimmedName,
          email: normalizedEmail,
          passwordHash,
        });

        // Also upsert into main users table for auth context
        await db.insert(users).values({
          openId,
          name: trimmedName,
          email: normalizedEmail,
          loginMethod: "local",
          role: isOwnerEmail(normalizedEmail) ? "admin" : "user",
          lastSignedIn: new Date(),
        }).onDuplicateKeyUpdate({
          set: {
            name: trimmedName,
            email: normalizedEmail,
            loginMethod: "local",
            role: isOwnerEmail(normalizedEmail) ? "admin" : "user",
            lastSignedIn: new Date(),
          }
        });

        // Create session token
        const sessionToken = await sdk.createSessionToken(openId, {
          name: trimmedName,
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        res.json({ success: true, name: trimmedName, email: normalizedEmail });

      } else {
        // Login
        const normalizedEmail = email.toLowerCase().trim();

        const localUserResult = await db
          .select()
          .from(localUsers)
          .where(eq(localUsers.email, normalizedEmail))
          .limit(1);

        if (localUserResult.length === 0) {
          if (canUseOwnerBootstrap(normalizedEmail, password)) {
            const passwordHash = await hashPassword(password);
            const openId = generateLocalOpenId(normalizedEmail);
            await db.insert(localUsers).values({
              openId,
              name: OWNER_BOOTSTRAP_NAME,
              email: normalizedEmail,
              passwordHash,
            });
            await db.insert(users).values({
              openId,
              name: OWNER_BOOTSTRAP_NAME,
              email: normalizedEmail,
              loginMethod: "local",
              role: "admin",
              lastSignedIn: new Date(),
            }).onDuplicateKeyUpdate({
              set: { name: OWNER_BOOTSTRAP_NAME, email: normalizedEmail, loginMethod: "local", role: "admin", lastSignedIn: new Date() }
            });
            const sessionToken = await sdk.createSessionToken(openId, { name: OWNER_BOOTSTRAP_NAME, expiresInMs: ONE_YEAR_MS });
            const cookieOptions = getSessionCookieOptions(req);
            res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
            res.json({ success: true, name: OWNER_BOOTSTRAP_NAME, email: normalizedEmail });
            return;
          }
          res.status(401).json({ error: "ইমেইল বা পাসওয়ার্ড ভুল।" });
          return;
        }

        const localUser = localUserResult[0];
        const valid = await verifyPassword(password, localUser.passwordHash);

        if (!valid) {
          if (canUseOwnerBootstrap(normalizedEmail, password)) {
            const passwordHash = await hashPassword(password);
            await db.update(localUsers).set({ name: localUser.name || OWNER_BOOTSTRAP_NAME, passwordHash }).where(eq(localUsers.email, normalizedEmail));
          } else {
            res.status(401).json({ error: "ইমেইল বা পাসওয়ার্ড ভুল।" });
            return;
          }
        }

        const localUserName = localUser.name || OWNER_BOOTSTRAP_NAME;

        // Update last signed in
        await db.insert(users).values({
          openId: localUser.openId,
          name: localUserName,
          email: localUser.email,
          loginMethod: "local",
          role: isOwnerEmail(normalizedEmail) ? "admin" : "user",
          lastSignedIn: new Date(),
        }).onDuplicateKeyUpdate({
          set: { name: localUserName, email: localUser.email, loginMethod: "local", role: isOwnerEmail(normalizedEmail) ? "admin" : "user", lastSignedIn: new Date() }
        });

        // Create session token
        const sessionToken = await sdk.createSessionToken(localUser.openId, {
          name: localUserName,
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        res.json({ success: true, name: localUserName, email: localUser.email });
      }
    } catch (error) {
      console.error("[LocalAuth] Error:", error);
      res.status(500).json({ error: "সমস্যা হয়েছে। আবার চেষ্টা করুন।" });
    }
  });
}
