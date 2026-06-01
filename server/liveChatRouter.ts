/**
 * Live Chat Router — tRPC
 * Visitor ↔ Admin real-time messaging via polling
 */
import { z } from "zod";
import { eq, desc, and, gt, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { liveChatSessions, liveChatMessages } from "../drizzle/schema";
import { sendTelegramNotification, sendTelegramSessionClosed } from "./telegramService";

// ── Auto-create / migrate live chat tables ────────────────────────────────────
let liveChatTablesReady = false;
let liveChatTablesReadyPromise: Promise<void> | null = null;

type LiveChatDb = NonNullable<Awaited<ReturnType<typeof getDb>>>;

async function ensureLiveChatTables(db: LiveChatDb) {
  if (liveChatTablesReady) return;
  if (!liveChatTablesReadyPromise) {
    liveChatTablesReadyPromise = (async () => {
      // Create sessions table if it doesn't exist
      await db.execute(sql.raw(
        "CREATE TABLE IF NOT EXISTS `live_chat_sessions` (" +
        "`id` int AUTO_INCREMENT NOT NULL, " +
        "`sessionId` varchar(64) NOT NULL, " +
        "`visitorId` varchar(64) NOT NULL, " +
        "`visitorName` varchar(128) NOT NULL DEFAULT 'অতিথি', " +
        "`visitorContact` varchar(200), " +
        "`visitorContactType` enum('whatsapp','gmail','other'), " +
        "`status` enum('waiting','active','closed') NOT NULL DEFAULT 'waiting', " +
        "`adminRead` boolean NOT NULL DEFAULT false, " +
        "`lastMessageAt` timestamp NOT NULL DEFAULT (now()), " +
        "`createdAt` timestamp NOT NULL DEFAULT (now()), " +
        "`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP, " +
        "CONSTRAINT `live_chat_sessions_id` PRIMARY KEY(`id`), " +
        "CONSTRAINT `live_chat_sessions_sessionId_unique` UNIQUE(`sessionId`))"
      ));
      // Add missing columns if table already exists without them
      await db.execute(sql.raw("ALTER TABLE `live_chat_sessions` ADD COLUMN `visitorContact` varchar(200)")).catch(() => {});
      await db.execute(sql.raw("ALTER TABLE `live_chat_sessions` ADD COLUMN `visitorContactType` enum('whatsapp','gmail','other')")).catch(() => {});

      // Create messages table if it doesn't exist
      await db.execute(sql.raw(
        "CREATE TABLE IF NOT EXISTS `live_chat_messages` (" +
        "`id` int AUTO_INCREMENT NOT NULL, " +
        "`sessionId` varchar(64) NOT NULL, " +
        "`sender` enum('visitor','admin') NOT NULL DEFAULT 'visitor', " +
        "`content` text NOT NULL, " +
        "`read` boolean NOT NULL DEFAULT false, " +
        "`createdAt` timestamp NOT NULL DEFAULT (now()), " +
        "`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP, " +
        "CONSTRAINT `live_chat_messages_id` PRIMARY KEY(`id`))"
      ));

      liveChatTablesReady = true;
    })().catch((error) => {
      liveChatTablesReadyPromise = null;
      console.error("[LiveChat] Failed to ensure tables:", error);
      throw error;
    });
  }
  await liveChatTablesReadyPromise;
}

async function getLiveChatDb() {
  const db = await getDb();
  if (!db) return null;
  await ensureLiveChatTables(db);
  return db;
}

// ── Visitor: start or resume a session ───────────────────────────────────────
export const liveChatRouter = router({

  // Visitor creates/resumes session
  startSession: publicProcedure
    .input(z.object({
      visitorId: z.string().min(1).max(64),
      visitorName: z.string().max(128).optional(),
      visitorContact: z.string().max(200).optional(),
      visitorContactType: z.enum(["whatsapp", "gmail", "other"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getLiveChatDb();
      if (!db) throw new Error("Database unavailable");

      // Check if visitor already has an active session
      const existing = await db
        .select()
        .from(liveChatSessions)
        .where(
          and(
            eq(liveChatSessions.visitorId, input.visitorId),
            eq(liveChatSessions.status, "active")
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update contact info if provided
        if (input.visitorContact) {
          await db
            .update(liveChatSessions)
            .set({
              visitorContact: input.visitorContact,
              visitorContactType: input.visitorContactType,
            })
            .where(eq(liveChatSessions.sessionId, existing[0].sessionId));
        }
        return { sessionId: existing[0].sessionId, isNew: false };
      }

      // Also check waiting sessions
      const waiting = await db
        .select()
        .from(liveChatSessions)
        .where(
          and(
            eq(liveChatSessions.visitorId, input.visitorId),
            eq(liveChatSessions.status, "waiting")
          )
        )
        .limit(1);

      if (waiting.length > 0) {
        // Update contact info if provided
        if (input.visitorContact) {
          await db
            .update(liveChatSessions)
            .set({
              visitorContact: input.visitorContact,
              visitorContactType: input.visitorContactType,
            })
            .where(eq(liveChatSessions.sessionId, waiting[0].sessionId));
        }
        return { sessionId: waiting[0].sessionId, isNew: false };
      }

      const sessionId = nanoid(16);
      await db.insert(liveChatSessions).values({
        sessionId,
        visitorId: input.visitorId,
        visitorName: input.visitorName || "অতিথি",
        visitorContact: input.visitorContact,
        visitorContactType: input.visitorContactType,
        status: "waiting",
        adminRead: false,
        lastMessageAt: new Date(),
      });

      return { sessionId, isNew: true };
    }),

  // Visitor sends a message
  sendMessage: publicProcedure
    .input(z.object({
      sessionId: z.string().min(1).max(64),
      content: z.string().min(1).max(2000),
      visitorId: z.string().min(1).max(64),
    }))
    .mutation(async ({ input }) => {
      const db = await getLiveChatDb();
      if (!db) throw new Error("Database unavailable");

      // Verify session belongs to this visitor
      const session = await db
        .select()
        .from(liveChatSessions)
        .where(
          and(
            eq(liveChatSessions.sessionId, input.sessionId),
            eq(liveChatSessions.visitorId, input.visitorId)
          )
        )
        .limit(1);

      if (session.length === 0) throw new Error("Session not found");
      if (session[0].status === "closed") throw new Error("Session is closed");

      await db.insert(liveChatMessages).values({
        sessionId: input.sessionId,
        sender: "visitor",
        content: input.content,
        read: false,
      });

      // Send Telegram notification to admin
      const visitorName = session[0].visitorName || "অতিথি";
      const visitorContact = session[0].visitorContact;
      const visitorContactType = session[0].visitorContactType;
      sendTelegramNotification({
        sessionId: input.sessionId,
        visitorName,
        visitorContact,
        visitorContactType,
        message: input.content,
      }).catch(err => console.error("[Telegram notify error]", err));

      // Update session status to active & update lastMessageAt
      await db
        .update(liveChatSessions)
        .set({
          status: "active",
          adminRead: false,
          lastMessageAt: new Date(),
        })
        .where(eq(liveChatSessions.sessionId, input.sessionId));

      return { success: true };
    }),

  // Visitor polls for new messages (since a given message id)
  pollMessages: publicProcedure
    .input(z.object({
      sessionId: z.string().min(1).max(64),
      visitorId: z.string().min(1).max(64),
      afterId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getLiveChatDb();
      if (!db) return { messages: [], sessionStatus: "waiting" as const };

      const session = await db
        .select()
        .from(liveChatSessions)
        .where(
          and(
            eq(liveChatSessions.sessionId, input.sessionId),
            eq(liveChatSessions.visitorId, input.visitorId)
          )
        )
        .limit(1);

      if (session.length === 0) return { messages: [], sessionStatus: "waiting" as const };

      const conditions = [eq(liveChatMessages.sessionId, input.sessionId)];
      if (input.afterId) {
        conditions.push(gt(liveChatMessages.id, input.afterId));
      }

      const messages = await db
        .select()
        .from(liveChatMessages)
        .where(and(...conditions))
        .orderBy(liveChatMessages.createdAt)
        .limit(50);

      return {
        messages,
        sessionStatus: session[0].status,
      };
    }),

  // ── Admin procedures ──────────────────────────────────────────────────────

  // Admin: get all active/waiting sessions
  adminGetSessions: adminProcedure
    .query(async ({ ctx }) => {
      const db = await getLiveChatDb();
      if (!db) return [];

      const sessions = await db
        .select()
        .from(liveChatSessions)
        .orderBy(desc(liveChatSessions.lastMessageAt))
        .limit(50);

      return sessions;
    }),

  // Admin: get messages for a session
  adminGetMessages: adminProcedure
    .input(z.object({
      sessionId: z.string().min(1).max(64),
      afterId: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getLiveChatDb();
      if (!db) return [];

      const conditions = [eq(liveChatMessages.sessionId, input.sessionId)];
      if (input.afterId) {
        conditions.push(gt(liveChatMessages.id, input.afterId));
      }

      const messages = await db
        .select()
        .from(liveChatMessages)
        .where(and(...conditions))
        .orderBy(liveChatMessages.createdAt)
        .limit(100);

      // Mark session as admin-read
      await db
        .update(liveChatSessions)
        .set({ adminRead: true })
        .where(eq(liveChatSessions.sessionId, input.sessionId));

      return messages;
    }),

  // Admin: reply to a session
  adminReply: adminProcedure
    .input(z.object({
      sessionId: z.string().min(1).max(64),
      content: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getLiveChatDb();
      if (!db) throw new Error("Database unavailable");

      await db.insert(liveChatMessages).values({
        sessionId: input.sessionId,
        sender: "admin",
        content: input.content,
        read: false,
      });

      await db
        .update(liveChatSessions)
        .set({
          status: "active",
          lastMessageAt: new Date(),
        })
        .where(eq(liveChatSessions.sessionId, input.sessionId));

      return { success: true };
    }),

  // Admin: close a session
  adminCloseSession: adminProcedure
    .input(z.object({
      sessionId: z.string().min(1).max(64),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getLiveChatDb();
      if (!db) throw new Error("Database unavailable");

      // Get visitor name before closing
      const sessions = await db
        .select()
        .from(liveChatSessions)
        .where(eq(liveChatSessions.sessionId, input.sessionId))
        .limit(1);

      await db
        .update(liveChatSessions)
        .set({ status: "closed" })
        .where(eq(liveChatSessions.sessionId, input.sessionId));

      // Notify via Telegram
      if (sessions.length > 0) {
        sendTelegramSessionClosed(input.sessionId, sessions[0].visitorName || "অতিথি")
          .catch(err => console.error("[Telegram close notify error]", err));
      }

      return { success: true };
    }),

  // Admin: get unread count (active + waiting with adminRead=false)
  adminUnreadCount: adminProcedure
    .query(async ({ ctx }) => {
      const db = await getLiveChatDb();
      if (!db) return { count: 0 };

      const unread = await db
        .select()
        .from(liveChatSessions)
        .where(
          and(
            eq(liveChatSessions.adminRead, false),
            inArray(liveChatSessions.status, ["active", "waiting"])
          )
        );

      return { count: unread.length };
    }),
});
