// scripts/trpc-bundled-entry.ts
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Telegram Live Chat Bot
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramAdminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/liveChatRouter.ts
import { z as z2 } from "zod";
import { eq as eq3, desc, and as and2, gt } from "drizzle-orm";
import { nanoid } from "nanoid";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, longtext } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var liveChatSessions = mysqlTable("live_chat_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  visitorName: varchar("visitorName", { length: 128 }).default("\u0985\u09A4\u09BF\u09A5\u09BF"),
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["active", "closed", "waiting"]).default("waiting").notNull(),
  adminRead: boolean("adminRead").default(false).notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var liveChatMessages = mysqlTable("live_chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  sender: mysqlEnum("sender", ["visitor", "admin"]).notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var writingPosts = mysqlTable("writing_posts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  authorOpenId: varchar("authorOpenId", { length: 64 }).notNull(),
  authorName: varchar("authorName", { length: 160 }).notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  category: mysqlEnum("category", ["experience", "story", "poem", "thought", "photo", "video"]).default("thought").notNull(),
  content: text("content").notNull(),
  mediaUrl: text("mediaUrl"),
  mediaType: mysqlEnum("mediaType", ["none", "image", "video"]).default("none").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "removed"]).default("pending").notNull(),
  featured: boolean("featured").default(false).notNull(),
  boostedScore: int("boostedScore").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var writingComments = mysqlTable("writing_comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  authorOpenId: varchar("authorOpenId", { length: 64 }).notNull(),
  authorName: varchar("authorName", { length: 160 }).notNull(),
  content: text("content").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "removed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var writingReactions = mysqlTable("writing_reactions", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userOpenId: varchar("userOpenId", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["like", "love", "inspiring", "sad"]).default("like").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var localUsers = mysqlTable("local_users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  bio: text("bio"),
  avatarUrl: longtext("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId || user.email && user.email === (process.env.OWNER_EMAIL || "mahbubsardarsabuj@gmail.com")) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/telegramService.ts
import { eq as eq2 } from "drizzle-orm";
var TELEGRAM_API = `https://api.telegram.org/bot${ENV.telegramBotToken}`;
async function sendTelegramNotification(opts) {
  if (!ENV.telegramBotToken || !ENV.telegramAdminChatId) {
    console.warn("[Telegram] Bot token or admin chat ID not configured");
    return;
  }
  const text2 = `\u{1F4AC} *\u09A8\u09A4\u09C1\u09A8 \u09AC\u09BE\u09B0\u09CD\u09A4\u09BE \u2014 \u09B2\u09BE\u0987\u09AD \u099A\u09CD\u09AF\u09BE\u099F*

\u{1F464} *\u09AD\u09BF\u099C\u09BF\u099F\u09B0:* ${escapeMarkdown(opts.visitorName)}
\u{1F511} *Session:* \`${opts.sessionId}\`

\u{1F4DD} *\u09AC\u09BE\u09B0\u09CD\u09A4\u09BE:*
${escapeMarkdown(opts.message)}

\u21A9\uFE0F *\u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987 \u09A6\u09BF\u09A4\u09C7:* \u098F\u0987 \u09AE\u09C7\u09B8\u09C7\u099C\u09C7\u09B0 Reply \u0995\u09B0\u09C1\u09A8`;
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ENV.telegramAdminChatId,
        text: text2,
        parse_mode: "Markdown"
      })
    });
    const data = await res.json();
    if (!data.ok) {
      console.error("[Telegram] sendMessage failed:", data.description);
    }
  } catch (err) {
    console.error("[Telegram] sendMessage error:", err);
  }
}
async function sendTelegramSessionClosed(sessionId, visitorName) {
  if (!ENV.telegramBotToken || !ENV.telegramAdminChatId) return;
  const text2 = `\u{1F534} *\u0995\u09A5\u09CB\u09AA\u0995\u09A5\u09A8 \u09B6\u09C7\u09B7 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7*

\u{1F464} *\u09AD\u09BF\u099C\u09BF\u099F\u09B0:* ${escapeMarkdown(visitorName)}
\u{1F511} *Session:* \`${sessionId}\``;
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ENV.telegramAdminChatId,
        text: text2,
        parse_mode: "Markdown"
      })
    });
  } catch (err) {
    console.error("[Telegram] session closed notification error:", err);
  }
}
async function sendTelegramPostSubmitted(opts) {
  if (!ENV.telegramBotToken || !ENV.telegramAdminChatId) return;
  const categoryLabels = {
    experience: "\u0985\u09AD\u09BF\u099C\u09CD\u099E\u09A4\u09BE",
    story: "\u0997\u09B2\u09CD\u09AA",
    poem: "\u0995\u09AC\u09BF\u09A4\u09BE",
    thought: "\u09AD\u09BE\u09AC\u09A8\u09BE",
    photo: "\u099B\u09AC\u09BF",
    video: "\u09AD\u09BF\u09A1\u09BF\u0993"
  };
  const catLabel = categoryLabels[opts.category] ?? opts.category;
  const text2 = `\u{1F4DD} *\u09A8\u09A4\u09C1\u09A8 \u09B2\u09C7\u0996\u09BE \u099C\u09AE\u09BE \u09AA\u09A1\u09BC\u09C7\u099B\u09C7 \u2014 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC*

\u270D\uFE0F *\u09B2\u09C7\u0996\u0995:* ${escapeMarkdown(opts.authorName)}
\u{1F4CC} *\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE:* ${escapeMarkdown(opts.title)}
\u{1F3F7}\uFE0F *\u09AC\u09BF\u09AD\u09BE\u0997:* ${catLabel}
\u{1F194} *Post ID:* ${opts.postId}`;
  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: "\u2705 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u0995\u09B0\u09C1\u09A8", callback_data: `post_approve_${opts.postId}` },
        { text: "\u274C \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8", callback_data: `post_reject_${opts.postId}` }
      ]
    ]
  };
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ENV.telegramAdminChatId,
        text: text2,
        parse_mode: "Markdown",
        reply_markup: inlineKeyboard
      })
    });
    const data = await res.json();
    if (!data.ok) {
      console.error("[Telegram] sendTelegramPostSubmitted failed:", data.description);
    }
  } catch (err) {
    console.error("[Telegram] post submitted notification error:", err);
  }
}
async function sendTelegramPostModerated(opts) {
  if (!ENV.telegramBotToken || !ENV.telegramAdminChatId) return;
  const actionLabels = {
    approved: "\u2705 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7",
    rejected: "\u274C \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A4 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7",
    removed: "\u{1F5D1}\uFE0F \u09B8\u09B0\u09BF\u09AF\u09BC\u09C7 \u09A6\u09C7\u0993\u09AF\u09BC\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7",
    featured: "\u2B50 \u09AB\u09BF\u099A\u09BE\u09B0\u09CD\u09A1 \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7",
    unfeatured: "\u2606 \u09AB\u09BF\u099A\u09BE\u09B0\u09CD\u09A1 \u09A5\u09C7\u0995\u09C7 \u09B8\u09B0\u09BE\u09A8\u09CB \u09B9\u09AF\u09BC\u09C7\u099B\u09C7"
  };
  const actionLabel = actionLabels[opts.action] ?? opts.action;
  const text2 = `${actionLabel}

\u270D\uFE0F *\u09B2\u09C7\u0996\u0995:* ${escapeMarkdown(opts.authorName)}
\u{1F4CC} *\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE:* ${escapeMarkdown(opts.title)}
\u{1F194} *Post ID:* ${opts.postId}`;
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ENV.telegramAdminChatId,
        text: text2,
        parse_mode: "Markdown"
      })
    });
  } catch (err) {
    console.error("[Telegram] post moderated notification error:", err);
  }
}
async function sendTelegramCommentSubmitted(opts) {
  if (!ENV.telegramBotToken || !ENV.telegramAdminChatId) return;
  const preview = opts.contentPreview.length > 120 ? opts.contentPreview.slice(0, 120) + "..." : opts.contentPreview;
  const text2 = `\u{1F4AC} *\u09A8\u09A4\u09C1\u09A8 \u09AE\u09A8\u09CD\u09A4\u09AC\u09CD\u09AF \u099C\u09AE\u09BE \u09AA\u09A1\u09BC\u09C7\u099B\u09C7 \u2014 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC*

\u270D\uFE0F *\u09AE\u09A8\u09CD\u09A4\u09AC\u09CD\u09AF\u0995\u09BE\u09B0\u09C0:* ${escapeMarkdown(opts.authorName)}
\u{1F4CC} *\u09AA\u09CB\u09B8\u09CD\u099F:* ${escapeMarkdown(opts.postTitle)}
\u{1F194} *Comment ID:* ${opts.commentId}

\u{1F4DD} *\u09AE\u09A8\u09CD\u09A4\u09AC\u09CD\u09AF:*
${escapeMarkdown(preview)}`;
  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: "\u2705 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u0995\u09B0\u09C1\u09A8", callback_data: `comment_approve_${opts.commentId}` },
        { text: "\u274C \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8", callback_data: `comment_reject_${opts.commentId}` }
      ]
    ]
  };
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ENV.telegramAdminChatId,
        text: text2,
        parse_mode: "Markdown",
        reply_markup: inlineKeyboard
      })
    });
    const data = await res.json();
    if (!data.ok) {
      console.error("[Telegram] sendTelegramCommentSubmitted failed:", data.description);
    }
  } catch (err) {
    console.error("[Telegram] comment submitted notification error:", err);
  }
}
function escapeMarkdown(text2) {
  return text2.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

// server/liveChatRouter.ts
var liveChatRouter = router({
  // Visitor creates/resumes session
  startSession: publicProcedure.input(z2.object({
    visitorId: z2.string().min(1).max(64),
    visitorName: z2.string().max(128).optional()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const existing = await db.select().from(liveChatSessions).where(
      and2(
        eq3(liveChatSessions.visitorId, input.visitorId),
        eq3(liveChatSessions.status, "active")
      )
    ).limit(1);
    if (existing.length > 0) {
      return { sessionId: existing[0].sessionId, isNew: false };
    }
    const waiting = await db.select().from(liveChatSessions).where(
      and2(
        eq3(liveChatSessions.visitorId, input.visitorId),
        eq3(liveChatSessions.status, "waiting")
      )
    ).limit(1);
    if (waiting.length > 0) {
      return { sessionId: waiting[0].sessionId, isNew: false };
    }
    const sessionId = nanoid(16);
    await db.insert(liveChatSessions).values({
      sessionId,
      visitorId: input.visitorId,
      visitorName: input.visitorName || "\u0985\u09A4\u09BF\u09A5\u09BF",
      status: "waiting",
      adminRead: false,
      lastMessageAt: /* @__PURE__ */ new Date()
    });
    return { sessionId, isNew: true };
  }),
  // Visitor sends a message
  sendMessage: publicProcedure.input(z2.object({
    sessionId: z2.string().min(1).max(64),
    content: z2.string().min(1).max(2e3),
    visitorId: z2.string().min(1).max(64)
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const session = await db.select().from(liveChatSessions).where(
      and2(
        eq3(liveChatSessions.sessionId, input.sessionId),
        eq3(liveChatSessions.visitorId, input.visitorId)
      )
    ).limit(1);
    if (session.length === 0) throw new Error("Session not found");
    if (session[0].status === "closed") throw new Error("Session is closed");
    await db.insert(liveChatMessages).values({
      sessionId: input.sessionId,
      sender: "visitor",
      content: input.content,
      read: false
    });
    const visitorName = session[0].visitorName || "\u0985\u09A4\u09BF\u09A5\u09BF";
    sendTelegramNotification({
      sessionId: input.sessionId,
      visitorName,
      message: input.content
    }).catch((err) => console.error("[Telegram notify error]", err));
    await db.update(liveChatSessions).set({
      status: "active",
      adminRead: false,
      lastMessageAt: /* @__PURE__ */ new Date()
    }).where(eq3(liveChatSessions.sessionId, input.sessionId));
    return { success: true };
  }),
  // Visitor polls for new messages (since a given message id)
  pollMessages: publicProcedure.input(z2.object({
    sessionId: z2.string().min(1).max(64),
    visitorId: z2.string().min(1).max(64),
    afterId: z2.number().optional()
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { messages: [], sessionStatus: "waiting" };
    const session = await db.select().from(liveChatSessions).where(
      and2(
        eq3(liveChatSessions.sessionId, input.sessionId),
        eq3(liveChatSessions.visitorId, input.visitorId)
      )
    ).limit(1);
    if (session.length === 0) return { messages: [], sessionStatus: "waiting" };
    const conditions = [eq3(liveChatMessages.sessionId, input.sessionId)];
    if (input.afterId) {
      conditions.push(gt(liveChatMessages.id, input.afterId));
    }
    const messages = await db.select().from(liveChatMessages).where(and2(...conditions)).orderBy(liveChatMessages.createdAt).limit(50);
    return {
      messages,
      sessionStatus: session[0].status
    };
  }),
  // ── Admin procedures ──────────────────────────────────────────────────────
  // Admin: get all active/waiting sessions
  adminGetSessions: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const sessions = await db.select().from(liveChatSessions).orderBy(desc(liveChatSessions.lastMessageAt)).limit(50);
    return sessions;
  }),
  // Admin: get messages for a session
  adminGetMessages: adminProcedure.input(z2.object({
    sessionId: z2.string().min(1).max(64),
    afterId: z2.number().optional()
  })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions = [eq3(liveChatMessages.sessionId, input.sessionId)];
    if (input.afterId) {
      conditions.push(gt(liveChatMessages.id, input.afterId));
    }
    const messages = await db.select().from(liveChatMessages).where(and2(...conditions)).orderBy(liveChatMessages.createdAt).limit(100);
    await db.update(liveChatSessions).set({ adminRead: true }).where(eq3(liveChatSessions.sessionId, input.sessionId));
    return messages;
  }),
  // Admin: reply to a session
  adminReply: adminProcedure.input(z2.object({
    sessionId: z2.string().min(1).max(64),
    content: z2.string().min(1).max(2e3)
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    await db.insert(liveChatMessages).values({
      sessionId: input.sessionId,
      sender: "admin",
      content: input.content,
      read: false
    });
    await db.update(liveChatSessions).set({
      status: "active",
      lastMessageAt: /* @__PURE__ */ new Date()
    }).where(eq3(liveChatSessions.sessionId, input.sessionId));
    return { success: true };
  }),
  // Admin: close a session
  adminCloseSession: adminProcedure.input(z2.object({
    sessionId: z2.string().min(1).max(64)
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const sessions = await db.select().from(liveChatSessions).where(eq3(liveChatSessions.sessionId, input.sessionId)).limit(1);
    await db.update(liveChatSessions).set({ status: "closed" }).where(eq3(liveChatSessions.sessionId, input.sessionId));
    if (sessions.length > 0) {
      sendTelegramSessionClosed(input.sessionId, sessions[0].visitorName || "\u0985\u09A4\u09BF\u09A5\u09BF").catch((err) => console.error("[Telegram close notify error]", err));
    }
    return { success: true };
  }),
  // Admin: get unread count
  adminUnreadCount: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { count: 0 };
    const unread = await db.select().from(liveChatSessions).where(
      and2(
        eq3(liveChatSessions.adminRead, false),
        eq3(liveChatSessions.status, "active")
      )
    );
    return { count: unread.length };
  })
});

// server/writingPlatformRouter.ts
import { z as z3 } from "zod";
import { and as and3, desc as desc2, eq as eq4, like, or, sql } from "drizzle-orm";
import { nanoid as nanoid2 } from "nanoid";
var postCategorySchema = z3.enum(["experience", "story", "poem", "thought", "photo", "video"]);
var mediaTypeSchema = z3.enum(["none", "image", "video"]);
var postStatusSchema = z3.enum(["pending", "approved", "rejected", "removed"]);
var reactionTypeSchema = z3.enum(["like", "love", "inspiring", "sad"]);
var commentStatusSchema = z3.enum(["pending", "approved", "rejected", "removed"]);
function normalizeAuthorName(name) {
  return name?.trim() || "\u09A8\u09BE\u09AE\u09B9\u09C0\u09A8 \u09B2\u09C7\u0996\u0995";
}
function createSlug(title) {
  const normalized = title.trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^\p{L}\p{N}-]+/gu, "").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
  return `${normalized || "post"}-${nanoid2(8)}`;
}
var writingTablesReady = false;
var writingTablesReadyPromise = null;
async function ensureWritingPlatformTables(db) {
  if (writingTablesReady) return;
  if (!writingTablesReadyPromise) {
    writingTablesReadyPromise = (async () => {
      await db.execute(sql.raw("CREATE TABLE IF NOT EXISTS `writing_posts` (`id` int AUTO_INCREMENT NOT NULL, `slug` varchar(180) NOT NULL, `authorOpenId` varchar(64) NOT NULL, `authorName` varchar(160) NOT NULL, `title` varchar(220) NOT NULL, `category` enum('experience','story','poem','thought','photo','video') NOT NULL DEFAULT 'thought', `content` longtext NOT NULL, `mediaUrl` text, `mediaType` enum('none','image','video') NOT NULL DEFAULT 'none', `status` enum('pending','approved','rejected','removed') NOT NULL DEFAULT 'pending', `featured` boolean NOT NULL DEFAULT false, `boostedScore` int NOT NULL DEFAULT 0, `viewCount` int NOT NULL DEFAULT 0, `createdAt` timestamp NOT NULL DEFAULT (now()), `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT `writing_posts_id` PRIMARY KEY(`id`), CONSTRAINT `writing_posts_slug_unique` UNIQUE(`slug`))"));
      await db.execute(sql.raw("ALTER TABLE `writing_posts` MODIFY COLUMN `content` longtext NOT NULL")).catch(() => {
      });
      await db.execute(sql.raw("ALTER TABLE `writing_posts` MODIFY COLUMN `mediaUrl` longtext")).catch(() => {
      });
      await db.execute(sql.raw("CREATE TABLE IF NOT EXISTS `writing_comments` (`id` int AUTO_INCREMENT NOT NULL, `postId` int NOT NULL, `authorOpenId` varchar(64) NOT NULL, `authorName` varchar(160) NOT NULL, `content` text NOT NULL, `status` enum('pending','approved','rejected','removed') NOT NULL DEFAULT 'pending', `createdAt` timestamp NOT NULL DEFAULT (now()), `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT `writing_comments_id` PRIMARY KEY(`id`))"));
      await db.execute(sql.raw("CREATE TABLE IF NOT EXISTS `writing_reactions` (`id` int AUTO_INCREMENT NOT NULL, `postId` int NOT NULL, `userOpenId` varchar(64) NOT NULL, `type` enum('like','love','inspiring','sad') NOT NULL DEFAULT 'like', `createdAt` timestamp NOT NULL DEFAULT (now()), `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT `writing_reactions_id` PRIMARY KEY(`id`))"));
      writingTablesReady = true;
    })().catch((error) => {
      writingTablesReadyPromise = null;
      console.error("[WritingPlatform] Failed to ensure tables:", error);
      throw error;
    });
  }
  await writingTablesReadyPromise;
}
async function getWritingDb() {
  const db = await getDb();
  if (!db) return null;
  await ensureWritingPlatformTables(db);
  return db;
}
async function safeWritingRead(label, fallback, operation) {
  try {
    return await operation();
  } catch (error) {
    console.error(`[WritingPlatform] ${label} failed:`, error);
    return fallback;
  }
}
async function enrichPost(post, userOpenId) {
  const db = await getWritingDb();
  if (!db) {
    return {
      ...post,
      reactionCounts: { like: 0, love: 0, inspiring: 0, sad: 0 },
      commentCount: 0,
      myReaction: null
    };
  }
  const reactions = await db.select().from(writingReactions).where(eq4(writingReactions.postId, post.id));
  const approvedComments = await db.select().from(writingComments).where(and3(eq4(writingComments.postId, post.id), eq4(writingComments.status, "approved")));
  const reactionCounts = { like: 0, love: 0, inspiring: 0, sad: 0 };
  let myReaction = null;
  reactions.forEach((reaction) => {
    reactionCounts[reaction.type] += 1;
    if (userOpenId && reaction.userOpenId === userOpenId) {
      myReaction = reaction.type;
    }
  });
  return {
    ...post,
    reactionCounts,
    commentCount: approvedComments.length,
    myReaction
  };
}
var writingPlatformRouter = router({
  listPosts: publicProcedure.input(z3.object({
    category: postCategorySchema.optional(),
    featuredOnly: z3.boolean().optional(),
    limit: z3.number().min(1).max(50).default(20)
  }).optional()).query(async ({ ctx, input }) => {
    return safeWritingRead("listPosts", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];
      const conditions = [eq4(writingPosts.status, "approved")];
      if (input?.category) conditions.push(eq4(writingPosts.category, input.category));
      if (input?.featuredOnly) conditions.push(eq4(writingPosts.featured, true));
      const posts = await db.select().from(writingPosts).where(and3(...conditions)).orderBy(desc2(writingPosts.featured), desc2(writingPosts.boostedScore), desc2(writingPosts.createdAt)).limit(input?.limit ?? 20);
      return Promise.all(posts.map((post) => enrichPost(post, ctx.user?.openId)));
    });
  }),
  listPostsPaginated: publicProcedure.input(z3.object({
    category: postCategorySchema.optional(),
    featuredOnly: z3.boolean().optional(),
    limit: z3.number().min(1).max(50).default(10),
    offset: z3.number().min(0).default(0)
  }).optional()).query(async ({ ctx, input }) => {
    return safeWritingRead("listPostsPaginated", { posts: [], hasMore: false }, async () => {
      const db = await getWritingDb();
      if (!db) return { posts: [], hasMore: false };
      const conditions = [eq4(writingPosts.status, "approved")];
      if (input?.category) conditions.push(eq4(writingPosts.category, input.category));
      if (input?.featuredOnly) conditions.push(eq4(writingPosts.featured, true));
      const limit = input?.limit ?? 10;
      const posts = await db.select().from(writingPosts).where(and3(...conditions)).orderBy(desc2(writingPosts.featured), desc2(writingPosts.boostedScore), desc2(writingPosts.createdAt)).limit(limit).offset(input?.offset ?? 0);
      const enriched = await Promise.all(posts.map((post) => enrichPost(post, ctx.user?.openId)));
      return { posts: enriched, hasMore: posts.length === limit };
    });
  }),
  searchPosts: publicProcedure.input(z3.object({
    query: z3.string().min(1).max(200),
    limit: z3.number().min(1).max(50).default(20)
  })).query(async ({ ctx, input }) => {
    return safeWritingRead("searchPosts", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];
      const searchTerm = `%${input.query.trim()}%`;
      const posts = await db.select().from(writingPosts).where(and3(
        eq4(writingPosts.status, "approved"),
        or(
          like(writingPosts.title, searchTerm),
          like(writingPosts.content, searchTerm),
          like(writingPosts.authorName, searchTerm)
        )
      )).orderBy(desc2(writingPosts.createdAt)).limit(input.limit);
      return Promise.all(posts.map((post) => enrichPost(post, ctx.user?.openId)));
    });
  }),
  getPostBySlug: publicProcedure.input(z3.object({ slug: z3.string().min(1).max(180) })).query(async ({ ctx, input }) => {
    return safeWritingRead("getPostBySlug", null, async () => {
      const db = await getWritingDb();
      if (!db) return null;
      const posts = await db.select().from(writingPosts).where(eq4(writingPosts.slug, input.slug)).limit(1);
      if (posts.length === 0) return null;
      const post = posts[0];
      const canView = post.status === "approved" || ctx.user?.role === "admin" || ctx.user?.openId === post.authorOpenId;
      if (!canView) return null;
      if (post.status === "approved") {
        await db.update(writingPosts).set({ viewCount: post.viewCount + 1 }).where(eq4(writingPosts.id, post.id));
      }
      const comments = await db.select().from(writingComments).where(and3(eq4(writingComments.postId, post.id), eq4(writingComments.status, "approved"))).orderBy(writingComments.createdAt).limit(100);
      return {
        post: await enrichPost({ ...post, viewCount: post.status === "approved" ? post.viewCount + 1 : post.viewCount }, ctx.user?.openId),
        comments
      };
    });
  }),
  myPosts: protectedProcedure.query(async ({ ctx }) => {
    return safeWritingRead("myPosts", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];
      const posts = await db.select().from(writingPosts).where(eq4(writingPosts.authorOpenId, ctx.user.openId)).orderBy(desc2(writingPosts.createdAt)).limit(50);
      return Promise.all(posts.map((post) => enrichPost(post, ctx.user.openId)));
    });
  }),
  createPost: protectedProcedure.input(z3.object({
    title: z3.string().min(1).max(220).optional(),
    category: postCategorySchema.optional(),
    content: z3.string().max(6e5).optional().default(""),
    mediaUrl: z3.string().optional().or(z3.literal("")),
    mediaType: mediaTypeSchema.default("none")
  })).mutation(async ({ ctx, input }) => {
    const db = await getWritingDb();
    if (!db) throw new Error("Database unavailable");
    const mediaUrl = input.mediaUrl?.trim() || null;
    const mediaType = mediaUrl ? input.mediaType : "none";
    const contentText = input.content?.trim() || "";
    if (!contentText && !mediaUrl) throw new Error("\u0995\u09CD\u09AF\u09BE\u09AA\u09B6\u09A8 \u09AC\u09BE \u099B\u09AC\u09BF \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8");
    const autoTitle = input.title?.trim() || contentText.split("\n")[0].slice(0, 80) || "\u09AC\u09BE\u09B8\u09CD\u09A4\u09AC\u09A4\u09BE\u09B0 \u0997\u09B2\u09CD\u09AA";
    const category = input.category ?? "thought";
    const insertResult = await db.insert(writingPosts).values({
      slug: createSlug(autoTitle),
      authorOpenId: ctx.user.openId,
      authorName: normalizeAuthorName(ctx.user.name),
      title: autoTitle,
      category,
      content: contentText,
      mediaUrl,
      mediaType,
      status: "approved"
    });
    {
      const insertId = insertResult.insertId ?? insertResult[0]?.insertId ?? 0;
      sendTelegramPostSubmitted({
        postId: insertId,
        title: autoTitle,
        authorName: normalizeAuthorName(ctx.user.name),
        category,
        slug: ""
      }).catch((err) => console.error("[Telegram post submit notify error]", err));
    }
    return { success: true };
  }),
  deletePost: protectedProcedure.input(z3.object({ postId: z3.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = await getWritingDb();
    if (!db) throw new Error("Database unavailable");
    const posts = await db.select().from(writingPosts).where(eq4(writingPosts.id, input.postId)).limit(1);
    if (posts.length === 0) throw new Error("Post not found");
    const post = posts[0];
    if (post.authorOpenId !== ctx.user.openId && ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    await db.delete(writingPosts).where(eq4(writingPosts.id, input.postId));
    return { success: true };
  }),
  editPost: protectedProcedure.input(z3.object({
    postId: z3.number().int().positive(),
    title: z3.string().min(1).max(220).optional(),
    category: postCategorySchema.optional(),
    content: z3.string().max(6e5).optional().default(""),
    mediaUrl: z3.string().optional().or(z3.literal("")),
    mediaType: mediaTypeSchema.default("none")
  })).mutation(async ({ ctx, input }) => {
    const db = await getWritingDb();
    if (!db) throw new Error("Database unavailable");
    const posts = await db.select().from(writingPosts).where(eq4(writingPosts.id, input.postId)).limit(1);
    if (posts.length === 0) throw new Error("Post not found");
    const post = posts[0];
    if (post.authorOpenId !== ctx.user.openId && ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const mediaUrl = input.mediaUrl?.trim() || null;
    const mediaType = mediaUrl ? input.mediaType : "none";
    const contentText = input.content?.trim() || "";
    if (!contentText && !mediaUrl) throw new Error("\u0995\u09CD\u09AF\u09BE\u09AA\u09B6\u09A8 \u09AC\u09BE \u099B\u09AC\u09BF \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8");
    const autoTitle = input.title?.trim() || contentText.split("\n")[0].slice(0, 80) || post.title;
    const category = input.category ?? post.category;
    await db.update(writingPosts).set({
      title: autoTitle,
      category,
      content: contentText,
      mediaUrl,
      mediaType,
      status: "approved"
    }).where(eq4(writingPosts.id, input.postId));
    return { success: true };
  }),
  reactToPost: protectedProcedure.input(z3.object({ postId: z3.number().int().positive(), type: reactionTypeSchema })).mutation(async ({ ctx, input }) => {
    const db = await getWritingDb();
    if (!db) throw new Error("Database unavailable");
    const posts = await db.select().from(writingPosts).where(and3(eq4(writingPosts.id, input.postId), eq4(writingPosts.status, "approved"))).limit(1);
    if (posts.length === 0) throw new Error("Post not found");
    const existing = await db.select().from(writingReactions).where(and3(eq4(writingReactions.postId, input.postId), eq4(writingReactions.userOpenId, ctx.user.openId))).limit(1);
    if (existing.length > 0 && existing[0].type === input.type) {
      await db.delete(writingReactions).where(eq4(writingReactions.id, existing[0].id));
      return { success: true, action: "removed" };
    }
    if (existing.length > 0) {
      await db.update(writingReactions).set({ type: input.type }).where(eq4(writingReactions.id, existing[0].id));
      return { success: true, action: "updated" };
    }
    await db.insert(writingReactions).values({
      postId: input.postId,
      userOpenId: ctx.user.openId,
      type: input.type
    });
    return { success: true, action: "created" };
  }),
  addComment: protectedProcedure.input(z3.object({ postId: z3.number().int().positive(), content: z3.string().min(2).max(2e3) })).mutation(async ({ ctx, input }) => {
    const db = await getWritingDb();
    if (!db) throw new Error("Database unavailable");
    const posts = await db.select().from(writingPosts).where(and3(eq4(writingPosts.id, input.postId), eq4(writingPosts.status, "approved"))).limit(1);
    if (posts.length === 0) throw new Error("Post not found");
    const commentInsert = await db.insert(writingComments).values({
      postId: input.postId,
      authorOpenId: ctx.user.openId,
      authorName: normalizeAuthorName(ctx.user.name),
      content: input.content.trim(),
      status: "approved"
    });
    {
      const commentId = commentInsert.insertId ?? commentInsert[0]?.insertId ?? 0;
      sendTelegramCommentSubmitted({
        commentId,
        postTitle: posts[0].title,
        authorName: normalizeAuthorName(ctx.user.name),
        contentPreview: input.content.trim()
      }).catch((err) => console.error("[Telegram comment submit notify error]", err));
    }
    return { success: true };
  }),
  adminListPosts: adminProcedure.input(z3.object({ status: postStatusSchema.or(z3.literal("all")).default("pending") }).optional()).query(async ({ input }) => {
    return safeWritingRead("adminListPosts", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];
      const query = db.select().from(writingPosts);
      const status = input?.status ?? "pending";
      const posts = status === "all" ? await query.orderBy(desc2(writingPosts.createdAt)).limit(100) : await query.where(eq4(writingPosts.status, status)).orderBy(desc2(writingPosts.createdAt)).limit(100);
      return Promise.all(posts.map((post) => enrichPost(post)));
    });
  }),
  adminUpdatePost: adminProcedure.input(z3.object({
    postId: z3.number().int().positive(),
    status: postStatusSchema.optional(),
    featured: z3.boolean().optional(),
    boostedScore: z3.number().int().min(0).max(1e5).optional()
  })).mutation(async ({ input }) => {
    const db = await getWritingDb();
    if (!db) throw new Error("Database unavailable");
    const existingPosts = await db.select().from(writingPosts).where(eq4(writingPosts.id, input.postId)).limit(1);
    const existingPost = existingPosts[0];
    const updateSet = {};
    if (input.status !== void 0) updateSet.status = input.status;
    if (input.featured !== void 0) updateSet.featured = input.featured;
    if (input.boostedScore !== void 0) updateSet.boostedScore = input.boostedScore;
    await db.update(writingPosts).set(updateSet).where(eq4(writingPosts.id, input.postId));
    if (existingPost) {
      let action = null;
      if (input.status === "approved") action = "approved";
      else if (input.status === "rejected") action = "rejected";
      else if (input.status === "removed") action = "removed";
      else if (input.featured === true) action = "featured";
      else if (input.featured === false && existingPost.featured === true) action = "unfeatured";
      if (action) {
        sendTelegramPostModerated({
          postId: input.postId,
          title: existingPost.title,
          authorName: existingPost.authorName,
          action
        }).catch((err) => console.error("[Telegram post moderated notify error]", err));
      }
    }
    return { success: true };
  }),
  adminListComments: adminProcedure.input(z3.object({ status: commentStatusSchema.or(z3.literal("all")).default("pending") }).optional()).query(async ({ input }) => {
    return safeWritingRead("adminListComments", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];
      const status = input?.status ?? "pending";
      const query = db.select().from(writingComments);
      return status === "all" ? query.orderBy(desc2(writingComments.createdAt)).limit(100) : query.where(eq4(writingComments.status, status)).orderBy(desc2(writingComments.createdAt)).limit(100);
    });
  }),
  adminUpdateComment: adminProcedure.input(z3.object({ commentId: z3.number().int().positive(), status: commentStatusSchema })).mutation(async ({ input }) => {
    const db = await getWritingDb();
    if (!db) throw new Error("Database unavailable");
    await db.update(writingComments).set({ status: input.status }).where(eq4(writingComments.id, input.commentId));
    return { success: true };
  })
});

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  liveChat: liveChatRouter,
  writingPlatform: writingPlatformRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      if (typeof ctx.res.clearCookie === "function") {
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      }
      return {
        success: true
      };
    })
  })
});

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret || "local-secret-fallback-32chars!!";
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// scripts/trpc-bundled-entry.ts
var COOKIE_NAME2 = "app_session_id";
function firstHeaderValue(value) {
  return Array.isArray(value) ? value[0] : value;
}
function getRequestProtocol(req) {
  const forwardedProto = firstHeaderValue(req.headers["x-forwarded-proto"]);
  if (forwardedProto?.split(",").some((proto) => proto.trim().toLowerCase() === "https")) {
    return "https";
  }
  return "http";
}
function serializeExpiredCookie(name, options = {}) {
  const parts = [
    `${name}=`,
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    `Path=${typeof options.path === "string" ? options.path : "/"}`
  ];
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${String(options.sameSite)}`);
  if (typeof options.domain === "string" && options.domain) parts.push(`Domain=${options.domain}`);
  return parts.join("; ");
}
function addExpressCompatibility(req, res) {
  const compatibleReq = Object.assign(req, {
    protocol: getRequestProtocol(req),
    hostname: firstHeaderValue(req.headers["x-forwarded-host"]) || firstHeaderValue(req.headers.host) || ""
  });
  const compatibleRes = Object.assign(res, {
    clearCookie(name, options = {}) {
      const cookieName = name || COOKIE_NAME2;
      const nextCookie = serializeExpiredCookie(cookieName, options);
      const previous = res.getHeader("Set-Cookie");
      if (!previous) {
        res.setHeader("Set-Cookie", nextCookie);
      } else if (Array.isArray(previous)) {
        res.setHeader("Set-Cookie", [...previous, nextCookie]);
      } else {
        res.setHeader("Set-Cookie", [String(previous), nextCookie]);
      }
      return compatibleRes;
    }
  });
  return { compatibleReq, compatibleRes };
}
async function createVercelContext({ req, res }) {
  const { compatibleReq, compatibleRes } = addExpressCompatibility(req, res);
  let user = null;
  try {
    user = await sdk.authenticateRequest(compatibleReq);
  } catch {
    user = null;
  }
  return {
    req: compatibleReq,
    res: compatibleRes,
    user
  };
}
function getTrpcPath(req) {
  const trpcPath = req.query?.trpc;
  if (Array.isArray(trpcPath)) return trpcPath.join("/");
  if (typeof trpcPath === "string") return trpcPath;
  const url = req.url ? new URL(req.url, "https://local.invalid") : null;
  const queryPath = url?.searchParams.get("trpc");
  if (queryPath) return queryPath;
  const pathname = url?.pathname ?? "";
  const routePrefix = "/api/trpc/";
  if (pathname.startsWith(routePrefix)) return decodeURIComponent(pathname.slice(routePrefix.length));
  return "";
}
function sendFunctionError(res, error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("[tRPC function failure]", error);
  if (!res.headersSent) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("x-app-function-error", message.slice(0, 180));
  }
  res.end(
    JSON.stringify({
      error: "API function failed to initialize.",
      message: message.slice(0, 300)
    })
  );
}
async function handler(req, res) {
  try {
    await nodeHTTPRequestHandler({
      router: appRouter,
      path: getTrpcPath(req),
      req,
      res,
      createContext: createVercelContext
    });
  } catch (error) {
    sendFunctionError(res, error);
  }
}
export {
  handler as default
};
