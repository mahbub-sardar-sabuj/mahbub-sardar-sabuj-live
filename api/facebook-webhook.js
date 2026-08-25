import crypto from "node:crypto";
import mysql from "mysql2/promise";

export const config = {
  api: {
    bodyParser: false,
  },
};

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 3,
      queueLimit: 0,
    });
  }
  return pool;
}

function hasRequiredConfig() {
  return Boolean(
    process.env.FACEBOOK_APP_SECRET?.trim()
    && process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN?.trim()
    && process.env.DATABASE_URL,
  );
}

async function readRawBody(req, limit = 1024 * 1024) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > limit) throw new Error("Payload too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function safeEqual(left, right) {
  const a = Buffer.from(left || "", "utf8");
  const b = Buffer.from(right || "", "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function verifySignature(rawBody, header) {
  if (typeof header !== "string" || !header.startsWith("sha256=")) return false;
  const expected = `sha256=${crypto.createHmac("sha256", process.env.FACEBOOK_APP_SECRET).update(rawBody).digest("hex")}`;
  return safeEqual(header, expected);
}

function extractEvents(payload) {
  const output = [];
  for (const entry of Array.isArray(payload?.entry) ? payload.entry : []) {
    const pageId = String(entry?.id || "").slice(0, 64) || null;
    const entryTime = String(entry?.time || Date.now());
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    changes.forEach((change, index) => {
      const value = change?.value || {};
      const eventId = value?.comment_id || value?.post_id || `${pageId || "page"}:${entryTime}:feed:${index}`;
      output.push({
        providerEventId: `feed:${String(eventId).slice(0, 170)}`,
        pageId,
        eventType: String(change?.field || "feed").slice(0, 100),
        payload: JSON.stringify({ object: payload?.object || "page", entry: { id: pageId, time: entry?.time }, change }),
      });
    });
    const messaging = Array.isArray(entry?.messaging) ? entry.messaging : [];
    messaging.forEach((event, index) => {
      const eventId = event?.message?.mid || event?.postback?.mid || `${pageId || "page"}:${event?.timestamp || entryTime}:message:${index}`;
      output.push({
        providerEventId: `message:${String(eventId).slice(0, 166)}`,
        pageId,
        eventType: event?.message ? "messages" : event?.postback ? "postback" : "messaging",
        payload: JSON.stringify({ object: payload?.object || "page", entry: { id: pageId, time: entry?.time }, messaging: event }),
      });
    });
  }
  return output;
}

async function persistEvents(events) {
  if (events.length === 0) return;
  const database = getPool();
  if (!database) throw new Error("Database unavailable");
  for (const event of events) {
    await database.execute(
      `INSERT IGNORE INTO facebook_webhook_events
        (providerEventId, pageId, eventType, payload, processStatus)
       VALUES (?, ?, ?, ?, 'pending')`,
      [event.providerEventId, event.pageId, event.eventType, event.payload],
    );
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");

  if (req.method === "GET") {
    const mode = req.query?.["hub.mode"];
    const token = req.query?.["hub.verify_token"];
    const challenge = req.query?.["hub.challenge"];
    if (!hasRequiredConfig()) return res.status(503).send("Facebook webhook is not configured");
    if (mode === "subscribe" && typeof challenge === "string" && safeEqual(String(token || ""), process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN)) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Forbidden");
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!hasRequiredConfig()) return res.status(503).json({ error: "Facebook webhook is not configured" });

  try {
    const rawBody = await readRawBody(req);
    if (!verifySignature(rawBody, req.headers["x-hub-signature-256"])) return res.status(401).json({ error: "Invalid signature" });
    const payload = JSON.parse(rawBody.toString("utf8"));
    if (payload?.object !== "page") return res.status(404).json({ error: "Unsupported webhook object" });

    const events = extractEvents(payload);
    // Save first. Draft creation and any future official send run separately; the webhook never auto-replies.
    await persistEvents(events);
    return res.status(200).send("EVENT_RECEIVED");
  } catch (error) {
    console.error("[facebook-webhook] event intake failed:", error instanceof Error ? error.message : "unknown");
    return res.status(500).json({ error: "Webhook intake failed" });
  }
}
