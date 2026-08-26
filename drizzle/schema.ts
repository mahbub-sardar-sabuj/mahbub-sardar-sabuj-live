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
  status: mysqlEnum("status", ["draft", "scheduled", "pending", "approved", "rejected", "removed"]).default("pending").notNull(),
  featured: boolean("featured").default(false).notNull(),
  boostedScore: int("boostedScore").default(0).notNull(),
  challengeId: int("challengeId"),
  scheduledFor: timestamp("scheduledFor"),
  publishedAt: timestamp("publishedAt"),
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
  parentCommentId: int("parentCommentId"),
  mentionedOpenId: varchar("mentionedOpenId", { length: 64 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "removed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  postStatusIdx: index("writing_comments_post_status_idx").on(table.postId, table.status),
  parentIdx: index("writing_comments_parent_idx").on(table.parentCommentId),
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

// ── Literary community social graph and writing workflows ─────────────────────
export const writingFollows = mysqlTable("writing_follows", {
  id: int("id").autoincrement().primaryKey(),
  followerOpenId: varchar("followerOpenId", { length: 64 }).notNull(),
  followingOpenId: varchar("followingOpenId", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  followerFollowingUnique: uniqueIndex("writing_follows_follower_following_unique").on(table.followerOpenId, table.followingOpenId),
  followingIdx: index("writing_follows_following_idx").on(table.followingOpenId),
}));
export type WritingFollow = typeof writingFollows.$inferSelect;

export const writingNotifications = mysqlTable("writing_notifications", {
  id: int("id").autoincrement().primaryKey(),
  recipientOpenId: varchar("recipientOpenId", { length: 64 }).notNull(),
  actorOpenId: varchar("actorOpenId", { length: 64 }),
  type: mysqlEnum("type", ["follow", "reaction", "comment", "reply", "mention", "editorial", "challenge", "collaboration", "scheduled"]).notNull(),
  postId: int("postId"),
  commentId: int("commentId"),
  title: varchar("title", { length: 220 }).notNull(),
  body: varchar("body", { length: 600 }),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  recipientReadCreatedIdx: index("writing_notifications_recipient_read_created_idx").on(table.recipientOpenId, table.readAt, table.createdAt),
}));
export type WritingNotification = typeof writingNotifications.$inferSelect;

export const writingDrafts = mysqlTable("writing_drafts", {
  id: int("id").autoincrement().primaryKey(),
  authorOpenId: varchar("authorOpenId", { length: 64 }).notNull(),
  title: varchar("title", { length: 220 }),
  category: mysqlEnum("category", ["experience", "story", "poem", "thought", "photo", "video"]).default("thought").notNull(),
  content: text("content").notNull(),
  mediaUrl: text("mediaUrl"),
  mediaType: mysqlEnum("mediaType", ["none", "image", "video"]).default("none").notNull(),
  challengeId: int("challengeId"),
  scheduledFor: timestamp("scheduledFor"),
  autosavedAt: timestamp("autosavedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  authorUpdatedIdx: index("writing_drafts_author_updated_idx").on(table.authorOpenId, table.updatedAt),
  scheduledIdx: index("writing_drafts_scheduled_idx").on(table.scheduledFor),
}));
export type WritingDraft = typeof writingDrafts.$inferSelect;

export const writingReadingEvents = mysqlTable("writing_reading_events", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  readerOpenId: varchar("readerOpenId", { length: 64 }),
  eventType: mysqlEnum("eventType", ["view", "complete", "share", "audio_play"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  postCreatedIdx: index("writing_reading_events_post_created_idx").on(table.postId, table.createdAt),
  readerCreatedIdx: index("writing_reading_events_reader_created_idx").on(table.readerOpenId, table.createdAt),
}));
export type WritingReadingEvent = typeof writingReadingEvents.$inferSelect;

export const writingPrompts = mysqlTable("writing_prompts", {
  id: int("id").autoincrement().primaryKey(),
  category: mysqlEnum("category", ["experience", "story", "poem", "thought", "photo", "video"]).default("thought").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  prompt: varchar("prompt", { length: 900 }).notNull(),
  active: boolean("active").default(true).notNull(),
  position: int("position").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  activePositionIdx: index("writing_prompts_active_position_idx").on(table.active, table.position),
}));
export type WritingPrompt = typeof writingPrompts.$inferSelect;

export const writingCollections = mysqlTable("writing_collections", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  title: varchar("title", { length: 180 }).notNull(),
  description: varchar("description", { length: 900 }),
  coverUrl: text("coverUrl"),
  active: boolean("active").default(true).notNull(),
  createdByOpenId: varchar("createdByOpenId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  activeCreatedIdx: index("writing_collections_active_created_idx").on(table.active, table.createdAt),
}));
export type WritingCollection = typeof writingCollections.$inferSelect;

export const writingCollectionItems = mysqlTable("writing_collection_items", {
  id: int("id").autoincrement().primaryKey(),
  collectionId: int("collectionId").notNull(),
  postId: int("postId").notNull(),
  position: int("position").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  collectionPostUnique: uniqueIndex("writing_collection_items_collection_post_unique").on(table.collectionId, table.postId),
  collectionPositionIdx: index("writing_collection_items_collection_position_idx").on(table.collectionId, table.position),
}));
export type WritingCollectionItem = typeof writingCollectionItems.$inferSelect;

export const writingEvents = mysqlTable("writing_events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  prompt: text("prompt").notNull(),
  category: mysqlEnum("category", ["experience", "story", "poem", "thought", "photo", "video"]).default("thought").notNull(),
  status: mysqlEnum("status", ["draft", "scheduled", "live", "ended", "archived"]).default("draft").notNull(),
  startsAt: timestamp("startsAt").notNull(),
  endsAt: timestamp("endsAt").notNull(),
  createdByOpenId: varchar("createdByOpenId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  statusStartsIdx: index("writing_events_status_starts_idx").on(table.status, table.startsAt),
}));
export type WritingEvent = typeof writingEvents.$inferSelect;

export const writingCollaborationInvites = mysqlTable("writing_collaboration_invites", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  inviterOpenId: varchar("inviterOpenId", { length: 64 }).notNull(),
  inviteeOpenId: varchar("inviteeOpenId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "declined", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  postInviteeUnique: uniqueIndex("writing_collaboration_invites_post_invitee_unique").on(table.postId, table.inviteeOpenId),
  inviteeStatusIdx: index("writing_collaboration_invites_invitee_status_idx").on(table.inviteeOpenId, table.status),
}));
export type WritingCollaborationInvite = typeof writingCollaborationInvites.$inferSelect;

export const writingModerationSignals = mysqlTable("writing_moderation_signals", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  type: mysqlEnum("type", ["duplicate", "sensitive", "profanity", "community_report"]).notNull(),
  score: int("score").default(0).notNull(),
  details: varchar("details", { length: 900 }),
  status: mysqlEnum("status", ["open", "reviewed", "dismissed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  postTypeUnique: uniqueIndex("writing_moderation_signals_post_type_unique").on(table.postId, table.type),
  statusCreatedIdx: index("writing_moderation_signals_status_created_idx").on(table.status, table.createdAt),
}));
export type WritingModerationSignal = typeof writingModerationSignals.$inferSelect;

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
