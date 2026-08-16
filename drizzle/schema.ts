import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar, boolean, longtext } from "drizzle-orm/mysql-core";

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
  visitorContact: varchar("visitorContact", { length: 200 }),
  visitorContactType: mysqlEnum("visitorContactType", ["whatsapp", "gmail", "other"]),
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
  challengeId: int("challengeId"),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  feedIdx: index("writing_posts_status_feed_idx").on(table.status, table.featured, table.boostedScore, table.createdAt),
  categoryFeedIdx: index("writing_posts_status_category_feed_idx").on(table.status, table.category, table.featured, table.boostedScore, table.createdAt),
}));

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
}, (table) => ({
  postStatusIdx: index("writing_comments_post_status_idx").on(table.postId, table.status),
}));

export type WritingComment = typeof writingComments.$inferSelect;
export type InsertWritingComment = typeof writingComments.$inferInsert;

export const writingReactions = mysqlTable("writing_reactions", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userOpenId: varchar("userOpenId", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["like", "love", "inspiring", "sad"]).default("like").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  postIdx: index("writing_reactions_post_idx").on(table.postId),
  userPostIdx: index("writing_reactions_user_post_idx").on(table.userOpenId, table.postId),
}));

export type WritingReaction = typeof writingReactions.$inferSelect;
export type InsertWritingReaction = typeof writingReactions.$inferInsert;

// ── Literary Community Extensions ─────────────────────────────────────────────
export const writingBookmarks = mysqlTable("writing_bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userOpenId: varchar("userOpenId", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userPostUnique: uniqueIndex("writing_bookmarks_user_post_unique").on(table.userOpenId, table.postId),
  postIdx: index("writing_bookmarks_post_idx").on(table.postId),
}));
export type WritingBookmark = typeof writingBookmarks.$inferSelect;

export const writingFeedback = mysqlTable("writing_feedback", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userOpenId: varchar("userOpenId", { length: 64 }).notNull(),
  kind: mysqlEnum("kind", ["meaningful", "relatable", "helpful", "beautiful"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userPostUnique: uniqueIndex("writing_feedback_user_post_unique").on(table.userOpenId, table.postId),
  postIdx: index("writing_feedback_post_idx").on(table.postId),
}));
export type WritingFeedback = typeof writingFeedback.$inferSelect;

export const writingReports = mysqlTable("writing_reports", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  reporterOpenId: varchar("reporterOpenId", { length: 64 }).notNull(),
  reason: mysqlEnum("reason", ["harassment", "misinformation", "plagiarism", "other"]).notNull(),
  details: varchar("details", { length: 600 }),
  status: mysqlEnum("status", ["pending", "reviewed", "actioned", "dismissed"]).default("pending").notNull(),
  adminNote: varchar("adminNote", { length: 600 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  reporterPostUnique: uniqueIndex("writing_reports_reporter_post_unique").on(table.reporterOpenId, table.postId),
  statusIdx: index("writing_reports_status_idx").on(table.status),
}));
export type WritingReport = typeof writingReports.$inferSelect;

export const writingChallenges = mysqlTable("writing_challenges", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  prompt: text("prompt").notNull(),
  category: mysqlEnum("category", ["experience", "story", "poem", "thought", "photo", "video"]).default("thought").notNull(),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  startsAt: timestamp("startsAt").defaultNow().notNull(),
  endsAt: timestamp("endsAt"),
  createdByOpenId: varchar("createdByOpenId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  statusIdx: index("writing_challenges_status_idx").on(table.status),
}));
export type WritingChallenge = typeof writingChallenges.$inferSelect;

export const writingEditorialPicks = mysqlTable("writing_editorial_picks", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  headline: varchar("headline", { length: 180 }),
  editorNote: varchar("editorNote", { length: 600 }),
  position: int("position").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdByOpenId: varchar("createdByOpenId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  postUnique: uniqueIndex("writing_editorial_picks_post_unique").on(table.postId),
  activePositionIdx: index("writing_editorial_picks_active_position_idx").on(table.active, table.position),
}));
export type WritingEditorialPick = typeof writingEditorialPicks.$inferSelect;

// ── Local Auth Users (email+password login without OAuth) ─────────────────────
export const localUsers = mysqlTable("local_users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  bio: text("bio"),
  avatarUrl: longtext("avatarUrl"),
  coverUrl: longtext("coverUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

// ── Password Reset Tokens ─────────────────────────────────────────────────────
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// ── Newsletter Subscribers ────────────────────────────────────────────────────
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 160 }),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;
