// api/analytics.js — Chatbot Analytics & Fallback Tracking
// Logs intent hits, fallbacks, and usage patterns for improvement
import { checkRateLimit, getClientIp, limitJsonBodySize } from "./_utils/security.js";

// In-memory store (resets on cold start — suitable for Vercel serverless)
// For persistent analytics, replace with a database or external service
const analyticsStore = {
  intentHits: new Map(),    // intent -> count
  fallbackCount: 0,
  totalMessages: 0,
  topQuestions: [],         // last 50 user questions
  providerStats: new Map(), // provider -> { success, fail }
  sessionCount: 0,
  lastReset: Date.now(),
};

function recordEvent(event) {
  switch (event.type) {
    case "intent_hit": {
      const count = analyticsStore.intentHits.get(event.intent) || 0;
      analyticsStore.intentHits.set(event.intent, count + 1);
      analyticsStore.totalMessages++;
      if (event.userText) {
        analyticsStore.topQuestions.unshift({
          text: event.userText.slice(0, 80),
          intent: event.intent,
          timestamp: Date.now(),
        });
        if (analyticsStore.topQuestions.length > 50) {
          analyticsStore.topQuestions.pop();
        }
      }
      break;
    }
    case "fallback": {
      analyticsStore.fallbackCount++;
      analyticsStore.totalMessages++;
      if (event.userText) {
        analyticsStore.topQuestions.unshift({
          text: event.userText.slice(0, 80),
          intent: "fallback",
          timestamp: Date.now(),
        });
        if (analyticsStore.topQuestions.length > 50) {
          analyticsStore.topQuestions.pop();
        }
      }
      break;
    }
    case "provider_success": {
      const stats = analyticsStore.providerStats.get(event.provider) || { success: 0, fail: 0 };
      stats.success++;
      analyticsStore.providerStats.set(event.provider, stats);
      break;
    }
    case "provider_fail": {
      const stats = analyticsStore.providerStats.get(event.provider) || { success: 0, fail: 0 };
      stats.fail++;
      analyticsStore.providerStats.set(event.provider, stats);
      break;
    }
    case "session_start": {
      analyticsStore.sessionCount++;
      break;
    }
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Key");

  if (req.method === "OPTIONS") return res.status(200).end();

  // POST: record an event
  if (req.method === "POST") {
    if (limitJsonBodySize(req, res, 64 * 1024)) return;

    const rate = checkRateLimit(req, res, { keyPrefix: "analytics", windowMs: 60_000, max: 60 });
    if (rate.limited) return;

    const { type, intent, userText, provider } = req.body || {};
    if (!type) return res.status(400).json({ error: "Missing event type" });

    recordEvent({ type, intent, userText, provider });
    return res.status(200).json({ ok: true });
  }

  // GET: return analytics dashboard data (admin only)
  if (req.method === "GET") {
    const adminKey = req.headers["x-admin-key"];
    const expectedKey = process.env.ADMIN_ANALYTICS_KEY?.trim();

    if (!expectedKey || adminKey !== expectedKey) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const intentHitsObj = Object.fromEntries(analyticsStore.intentHits);
    const providerStatsObj = Object.fromEntries(analyticsStore.providerStats);

    // Sort intents by count
    const sortedIntents = Object.entries(intentHitsObj)
      .sort(([, a], [, b]) => b - a)
      .map(([intent, count]) => ({ intent, count }));

    const fallbackRate = analyticsStore.totalMessages > 0
      ? ((analyticsStore.fallbackCount / analyticsStore.totalMessages) * 100).toFixed(1)
      : "0.0";

    return res.status(200).json({
      summary: {
        totalMessages: analyticsStore.totalMessages,
        fallbackCount: analyticsStore.fallbackCount,
        fallbackRate: `${fallbackRate}%`,
        sessionCount: analyticsStore.sessionCount,
        uptime: Math.round((Date.now() - analyticsStore.lastReset) / 1000 / 60) + " minutes",
      },
      topIntents: sortedIntents.slice(0, 10),
      recentQuestions: analyticsStore.topQuestions.slice(0, 20),
      providerStats: providerStatsObj,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
