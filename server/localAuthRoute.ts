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
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

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
          lastSignedIn: new Date(),
        }).onDuplicateKeyUpdate({
          set: {
            name: trimmedName,
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
          res.status(401).json({ error: "ইমেইল বা পাসওয়ার্ড ভুল।" });
          return;
        }

        const localUser = localUserResult[0];
        const valid = await verifyPassword(password, localUser.passwordHash);

        if (!valid) {
          res.status(401).json({ error: "ইমেইল বা পাসওয়ার্ড ভুল।" });
          return;
        }

        // Update last signed in
        await db.insert(users).values({
          openId: localUser.openId,
          name: localUser.name,
          email: localUser.email,
          loginMethod: "local",
          lastSignedIn: new Date(),
        }).onDuplicateKeyUpdate({
          set: { lastSignedIn: new Date() }
        });

        // Create session token
        const sessionToken = await sdk.createSessionToken(localUser.openId, {
          name: localUser.name,
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        res.json({ success: true, name: localUser.name, email: localUser.email });
      }
    } catch (error) {
      console.error("[LocalAuth] Error:", error);
      res.status(500).json({ error: "সমস্যা হয়েছে। আবার চেষ্টা করুন।" });
    }
  });
}
