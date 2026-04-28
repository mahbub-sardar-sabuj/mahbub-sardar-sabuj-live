/**
 * Live Chat Router — tRPC
 * Visitor ↔ Admin real-time messaging via polling
 */
import { z } from "zod";
import { eq, desc, and, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { liveChatSessions, liveChatMessages } from "../drizzle/schema";

// ── Visitor: start or resume a session ───────────────────────────────────────
export const liveChatRouter = router({

  // Visitor creates/resumes session
  startSession: publicProcedure
    .input(z.object({
      visitorId: z.string().min(1).max(64),
      visitorName: z.string().max(128).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
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
        return { sessionId: waiting[0].sessionId, isNew: false };
      }

      const sessionId = nanoid(16);
      await db.insert(liveChatSessions).values({
        sessionId,
        visitorId: input.visitorId,
        visitorName: input.visitorName || "অতিথি",
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
      const db = await getDb();
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
      const db = await getDb();
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
      const db = await getDb();
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
      const db = await getDb();
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
      const db = await getDb();
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
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(liveChatSessions)
        .set({ status: "closed" })
        .where(eq(liveChatSessions.sessionId, input.sessionId));

      return { success: true };
    }),

  // Admin: get unread count
  adminUnreadCount: adminProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { count: 0 };

      const unread = await db
        .select()
        .from(liveChatSessions)
        .where(
          and(
            eq(liveChatSessions.adminRead, false),
            eq(liveChatSessions.status, "active")
          )
        );

      return { count: unread.length };
    }),
});
