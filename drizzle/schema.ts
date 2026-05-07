import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Live Chat Sessions ────────────────────────────────────────────────────────
export const liveChatSessions = mysqlTable("live_chat_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  visitorName: varchar("visitorName", { length: 128 }).default("অতিথি"),
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["active", "closed", "waiting"]).default("waiting").notNull(),
  adminRead: boolean("adminRead").default(false).notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LiveChatSession = typeof liveChatSessions.$inferSelect;
export type InsertLiveChatSession = typeof liveChatSessions.$inferInsert;

// ── Live Chat Messages ────────────────────────────────────────────────────────
export const liveChatMessages = mysqlTable("live_chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  sender: mysqlEnum("sender", ["visitor", "admin"]).notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LiveChatMessage = typeof liveChatMessages.$inferSelect;
export type InsertLiveChatMessage = typeof liveChatMessages.$inferInsert;

// ── “আমিও লিখবো বাস্তবতা” Writing Platform ───────────────────────────────────
export const writingPosts = mysqlTable("writing_posts", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WritingPost = typeof writingPosts.$inferSelect;
export type InsertWritingPost = typeof writingPosts.$inferInsert;

export const writingComments = mysqlTable("writing_comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  authorOpenId: varchar("authorOpenId", { length: 64 }).notNull(),
  authorName: varchar("authorName", { length: 160 }).notNull(),
  content: text("content").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "removed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WritingComment = typeof writingComments.$inferSelect;
export type InsertWritingComment = typeof writingComments.$inferInsert;

export const writingReactions = mysqlTable("writing_reactions", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userOpenId: varchar("userOpenId", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["like", "love", "inspiring", "sad"]).default("like").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WritingReaction = typeof writingReactions.$inferSelect;
export type InsertWritingReaction = typeof writingReactions.$inferInsert;
