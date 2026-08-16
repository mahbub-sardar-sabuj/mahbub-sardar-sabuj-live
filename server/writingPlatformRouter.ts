import { z } from "zod";
import { and, asc, desc, eq, gte, inArray, isNull, like, lte, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import {
  writingBookmarks,
  writingChallenges,
  writingCollectionItems,
  writingCollections,
  writingCollaborationInvites,
  writingComments,
  writingDrafts,
  writingEditorialPicks,
  writingEvents,
  writingFeedback,
  writingFollows,
  writingModerationSignals,
  writingNotifications,
  writingPosts,
  writingPrompts,
  writingReadingEvents,
  writingReactions,
  writingReports,
} from "../drizzle/schema";
import {
  sendTelegramPostSubmitted,
  sendTelegramPostModerated,
  sendTelegramCommentSubmitted,
} from "./telegramService";

const postCategorySchema = z.enum(["experience", "story", "poem", "thought", "photo", "video"]);
const mediaTypeSchema = z.enum(["none", "image", "video"]);
const postStatusSchema = z.enum(["pending", "approved", "rejected", "removed"]);
const reactionTypeSchema = z.enum(["like", "love", "inspiring", "sad"]);
const commentStatusSchema = z.enum(["pending", "approved", "rejected", "removed"]);
const feedbackKindSchema = z.enum(["meaningful", "relatable", "helpful", "beautiful"]);
const reportReasonSchema = z.enum(["harassment", "misinformation", "plagiarism", "other"]);
const reportStatusSchema = z.enum(["pending", "reviewed", "actioned", "dismissed"]);
const challengeStatusSchema = z.enum(["draft", "active", "archived"]);

function normalizeAuthorName(name: string | null | undefined) {
  return name?.trim() || "নামহীন লেখক";
}

function createSlug(title: string) {
  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);

  return `${normalized || "post"}-${nanoid(8)}`;
}

type WritingDb = NonNullable<Awaited<ReturnType<typeof getDb>>>;
type WritingPost = typeof writingPosts.$inferSelect;

// Database schema is managed by migrations. Request handlers must never run DDL:
// on a cold serverless start that can add tens of seconds before the feed responds.
async function getWritingDb() {
  return (await getDb()) ?? null;
}

async function safeWritingRead<T>(label: string, fallback: T, operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    console.error(`[WritingPlatform] ${label} failed:`, error);
    return fallback;
  }
}

async function createCommunityNotification(
  db: WritingDb,
  notification: {
    recipientOpenId: string;
    actorOpenId?: string | null;
    type: "follow" | "reaction" | "comment" | "reply" | "mention" | "editorial" | "challenge" | "collaboration";
    postId?: number | null;
    commentId?: number | null;
    title: string;
    body?: string | null;
  },
) {
  if (!notification.recipientOpenId || notification.recipientOpenId === notification.actorOpenId) return;
  await db.insert(writingNotifications).values({
    recipientOpenId: notification.recipientOpenId,
    actorOpenId: notification.actorOpenId || null,
    type: notification.type,
    postId: notification.postId || null,
    commentId: notification.commentId || null,
    title: notification.title.slice(0, 220),
    body: notification.body?.slice(0, 600) || null,
  }).catch((error) => console.error("[WritingPlatform] notification write failed:", error));
}

function detectModerationSignals(content: string) {
  const normalized = content.toLowerCase();
  const sensitiveTerms = ["আত্মহত্যা", "নিজেকে শেষ", "মরে যেতে", "suicide"];
  const profanityTerms = ["হারামি", "বেশ্যা", "চুদ", "fuck"];
  return {
    sensitive: sensitiveTerms.some((term) => normalized.includes(term)),
    profanity: profanityTerms.some((term) => normalized.includes(term)),
  };
}

// ── OPTIMIZED: Batch-enrich multiple posts in 3 parallel queries ──
async function enrichPostsBatch(posts: WritingPost[], userOpenId?: string, _db?: WritingDb) {
  if (posts.length === 0) return [];

  const db = _db ?? await getWritingDb();
  const emptyEnrich = (post: WritingPost) => ({
    ...post,
    authorAvatarUrl: null as string | null,
    reactionCounts: { like: 0, love: 0, inspiring: 0, sad: 0 },
    feedbackCounts: { meaningful: 0, relatable: 0, helpful: 0, beautiful: 0 },
    commentCount: 0,
    bookmarked: false,
    myFeedback: null as null | "meaningful" | "relatable" | "helpful" | "beautiful",
    myReaction: null as null | "like" | "love" | "inspiring" | "sad",
    followingAuthor: false,
    isOwner: Boolean(userOpenId && post.authorOpenId === userOpenId),
  });

  if (!db) return posts.map(emptyEnrich);

  const postIds = posts.map((p) => p.id);
  const authorOpenIds = [...new Set(posts.map((p) => p.authorOpenId))];

  // ── Batch enrichment queries ──
  const [allReactions, allComments, avatarRows, allFeedback, myBookmarks, myFollows] = await Promise.all([
    // Batch query 1: reactions (only needed columns)
    db
      .select({ postId: writingReactions.postId, type: writingReactions.type, userOpenId: writingReactions.userOpenId })
      .from(writingReactions)
      .where(inArray(writingReactions.postId, postIds)),

    // Batch query 2: approved comment counts
    db
      .select({ postId: writingComments.postId })
      .from(writingComments)
      .where(
        and(
          inArray(writingComments.postId, postIds),
          eq(writingComments.status, "approved")
        )
      ),

    // Batch query 3: author avatars
    authorOpenIds.length > 0
      ? db.execute(
          sql.raw(
            `SELECT openId,
              CASE WHEN avatarUrl LIKE 'data:%' THEN NULL ELSE avatarUrl END AS avatarUrl
              FROM local_users WHERE openId IN (${authorOpenIds
              .map((id) => `'${id.replace(/'/g, "''")}'`)
              .join(",")}) LIMIT ${authorOpenIds.length}`
          )
        ).catch(() => null)
      : Promise.resolve(null),

    // Batch query 4: reader feedback counts and current user's selection
    db
      .select({ postId: writingFeedback.postId, kind: writingFeedback.kind, userOpenId: writingFeedback.userOpenId })
      .from(writingFeedback)
      .where(inArray(writingFeedback.postId, postIds))
      .catch(() => []),

    // Batch query 5: current user's saved posts only
    userOpenId
      ? db
        .select({ postId: writingBookmarks.postId })
        .from(writingBookmarks)
        .where(and(inArray(writingBookmarks.postId, postIds), eq(writingBookmarks.userOpenId, userOpenId)))
        .catch(() => [])
      : Promise.resolve([]),

    // Batch query 6: whether the current reader follows each visible author.
    userOpenId && authorOpenIds.length > 0
      ? db
        .select({ followingOpenId: writingFollows.followingOpenId })
        .from(writingFollows)
        .where(and(eq(writingFollows.followerOpenId, userOpenId), inArray(writingFollows.followingOpenId, authorOpenIds)))
        .catch(() => [])
      : Promise.resolve([]),
  ]);

  // Build lookup maps from batch results
  // Reactions map: postId → { counts, myReaction }
  const reactionsMap = new Map<number, { counts: Record<string, number>; myReaction: string | null }>();
  for (const reaction of allReactions) {
    if (!reactionsMap.has(reaction.postId)) {
      reactionsMap.set(reaction.postId, {
        counts: { like: 0, love: 0, inspiring: 0, sad: 0 },
        myReaction: null,
      });
    }
    const entry = reactionsMap.get(reaction.postId)!;
    entry.counts[reaction.type] = (entry.counts[reaction.type] || 0) + 1;
    if (userOpenId && reaction.userOpenId === userOpenId) {
      entry.myReaction = reaction.type;
    }
  }

  // Comment count map: postId → count
  const commentCountMap = new Map<number, number>();
  for (const comment of allComments) {
    commentCountMap.set(comment.postId, (commentCountMap.get(comment.postId) || 0) + 1);
  }

  // Feedback map: postId → summary and current user's selection
  const feedbackMap = new Map<number, { counts: Record<string, number>; myFeedback: string | null }>();
  for (const feedback of allFeedback) {
    if (!feedbackMap.has(feedback.postId)) {
      feedbackMap.set(feedback.postId, {
        counts: { meaningful: 0, relatable: 0, helpful: 0, beautiful: 0 },
        myFeedback: null,
      });
    }
    const entry = feedbackMap.get(feedback.postId)!;
    entry.counts[feedback.kind] = (entry.counts[feedback.kind] || 0) + 1;
    if (userOpenId && feedback.userOpenId === userOpenId) entry.myFeedback = feedback.kind;
  }
  const bookmarkIds = new Set(myBookmarks.map((bookmark) => bookmark.postId));
  const followingAuthorIds = new Set(myFollows.map((follow) => follow.followingOpenId));

  // Avatar map: authorOpenId → lightweight external avatar URL only.
  // Inline base64 avatars are deliberately excluded from feed responses.
  const avatarMap = new Map<string, string>();
  if (avatarRows) {
    const rows = Array.isArray(avatarRows) ? avatarRows[0] : avatarRows;
    if (Array.isArray(rows)) {
      for (const row of rows as any[]) {
        if (row.openId && row.avatarUrl) {
          avatarMap.set(row.openId, row.avatarUrl);
        }
      }
    }
  }

  // Assemble enriched posts using lookup maps (no additional DB queries)
  return posts.map((post) => {
    const reactionData = reactionsMap.get(post.id);
    return {
      ...post,
      authorAvatarUrl: avatarMap.get(post.authorOpenId) ?? null,
      reactionCounts: (reactionData?.counts ?? { like: 0, love: 0, inspiring: 0, sad: 0 }) as {
        like: number; love: number; inspiring: number; sad: number;
      },
      feedbackCounts: (feedbackMap.get(post.id)?.counts ?? { meaningful: 0, relatable: 0, helpful: 0, beautiful: 0 }) as {
        meaningful: number; relatable: number; helpful: number; beautiful: number;
      },
      commentCount: commentCountMap.get(post.id) ?? 0,
      bookmarked: bookmarkIds.has(post.id),
      myFeedback: (feedbackMap.get(post.id)?.myFeedback ?? null) as null | "meaningful" | "relatable" | "helpful" | "beautiful",
      myReaction: (reactionData?.myReaction ?? null) as null | "like" | "love" | "inspiring" | "sad",
      followingAuthor: followingAuthorIds.has(post.authorOpenId),
      isOwner: Boolean(userOpenId && post.authorOpenId === userOpenId),
    };
  });
}

// ── Single-post enrich (for getPostBySlug) ──
async function enrichPost(post: WritingPost, userOpenId?: string, db?: WritingDb) {
  const results = await enrichPostsBatch([post], userOpenId, db);
  return results[0];
}

export const writingPlatformRouter = router({
  listPosts: publicProcedure
    .input(z.object({
      category: postCategorySchema.optional(),
      featuredOnly: z.boolean().optional(),
      limit: z.number().min(1).max(50).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      return safeWritingRead("listPosts", [], async () => {
        const db = await getWritingDb();
        if (!db) return [];

        const conditions = [eq(writingPosts.status, "approved")];
        if (input?.category) conditions.push(eq(writingPosts.category, input.category));
        if (input?.featuredOnly) conditions.push(eq(writingPosts.featured, true));

        // Only select needed columns for feed
        // mediaUrl is truncated to 500 chars — base64 images can be 400KB+ each and destroy performance
        const posts = await db
          .select({
            id: writingPosts.id,
            slug: writingPosts.slug,
            authorOpenId: writingPosts.authorOpenId,
            authorName: writingPosts.authorName,
            title: writingPosts.title,
            category: writingPosts.category,
            content: sql<string>`SUBSTRING(${writingPosts.content}, 1, 600)`,
            mediaUrl: sql<string>`SUBSTRING(${writingPosts.mediaUrl}, 1, 500)`,
            mediaType: writingPosts.mediaType,
            status: writingPosts.status,
            featured: writingPosts.featured,
            boostedScore: writingPosts.boostedScore,
            viewCount: writingPosts.viewCount,
            createdAt: writingPosts.createdAt,
            updatedAt: writingPosts.updatedAt,
          })
          .from(writingPosts)
          .where(and(...conditions))
          .orderBy(desc(writingPosts.featured), desc(writingPosts.boostedScore), desc(writingPosts.createdAt))
          .limit(input?.limit ?? 20);

        // OPTIMIZED: batch enrich — pass db to avoid extra getWritingDb() call
        return enrichPostsBatch(posts as any, ctx.user?.openId, db);
      });
    }),

  listPostsPaginated: publicProcedure
    .input(z.object({
      category: postCategorySchema.optional(),
      featuredOnly: z.boolean().optional(),
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      return safeWritingRead("listPostsPaginated", { posts: [], hasMore: false }, async () => {
        const db = await getWritingDb();
        if (!db) return { posts: [], hasMore: false };

        const conditions = [eq(writingPosts.status, "approved")];
        if (input?.category) conditions.push(eq(writingPosts.category, input.category));
        if (input?.featuredOnly) conditions.push(eq(writingPosts.featured, true));

        const limit = input?.limit ?? 10;
        // OPTIMIZED: truncate content and mediaUrl for feed display
        const posts = await db
          .select({
            id: writingPosts.id,
            slug: writingPosts.slug,
            authorOpenId: writingPosts.authorOpenId,
            authorName: writingPosts.authorName,
            title: writingPosts.title,
            category: writingPosts.category,
            content: sql<string>`SUBSTRING(${writingPosts.content}, 1, 600)`,
            mediaUrl: sql<string>`SUBSTRING(${writingPosts.mediaUrl}, 1, 500)`,
            mediaType: writingPosts.mediaType,
            status: writingPosts.status,
            featured: writingPosts.featured,
            boostedScore: writingPosts.boostedScore,
            viewCount: writingPosts.viewCount,
            createdAt: writingPosts.createdAt,
            updatedAt: writingPosts.updatedAt,
          })
          .from(writingPosts)
          .where(and(...conditions))
          .orderBy(desc(writingPosts.featured), desc(writingPosts.boostedScore), desc(writingPosts.createdAt))
          .limit(limit)
          .offset(input?.offset ?? 0);

        // OPTIMIZED: batch enrich — pass db to avoid extra getWritingDb() call
        const enriched = await enrichPostsBatch(posts as any, ctx.user?.openId, db);
        return { posts: enriched, hasMore: posts.length === limit };
      });
    }),

  listFollowingFeed: protectedProcedure
    .input(z.object({
      category: postCategorySchema.optional(),
      limit: z.number().min(1).max(30).default(10),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      return safeWritingRead("listFollowingFeed", { posts: [], hasMore: false }, async () => {
        const db = await getWritingDb();
        if (!db) return { posts: [], hasMore: false };
        const limit = input?.limit ?? 10;
        const conditions = [eq(writingFollows.followerOpenId, ctx.user.openId), eq(writingPosts.status, "approved")];
        if (input?.category) conditions.push(eq(writingPosts.category, input.category));
        const posts = await db
          .select({
            id: writingPosts.id,
            slug: writingPosts.slug,
            authorOpenId: writingPosts.authorOpenId,
            authorName: writingPosts.authorName,
            title: writingPosts.title,
            category: writingPosts.category,
            content: sql<string>`SUBSTRING(${writingPosts.content}, 1, 600)`,
            mediaUrl: sql<string>`SUBSTRING(${writingPosts.mediaUrl}, 1, 500)`,
            mediaType: writingPosts.mediaType,
            status: writingPosts.status,
            featured: writingPosts.featured,
            boostedScore: writingPosts.boostedScore,
            viewCount: writingPosts.viewCount,
            createdAt: writingPosts.createdAt,
            updatedAt: writingPosts.updatedAt,
          })
          .from(writingPosts)
          .innerJoin(writingFollows, eq(writingPosts.authorOpenId, writingFollows.followingOpenId))
          .where(and(...conditions))
          .orderBy(desc(writingPosts.createdAt))
          .limit(limit)
          .offset(input?.offset ?? 0);
        return { posts: await enrichPostsBatch(posts as any, ctx.user.openId, db), hasMore: posts.length === limit };
      });
    }),

  listTrendingPosts: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(6) }).optional())
    .query(async ({ ctx, input }) => {
      return safeWritingRead("listTrendingPosts", [], async () => {
        const db = await getWritingDb();
        if (!db) return [];
        const posts = await db
          .select({
            id: writingPosts.id,
            slug: writingPosts.slug,
            authorOpenId: writingPosts.authorOpenId,
            authorName: writingPosts.authorName,
            title: writingPosts.title,
            category: writingPosts.category,
            content: sql<string>`SUBSTRING(${writingPosts.content}, 1, 600)`,
            mediaUrl: sql<string>`SUBSTRING(${writingPosts.mediaUrl}, 1, 500)`,
            mediaType: writingPosts.mediaType,
            status: writingPosts.status,
            featured: writingPosts.featured,
            boostedScore: writingPosts.boostedScore,
            viewCount: writingPosts.viewCount,
            createdAt: writingPosts.createdAt,
            updatedAt: writingPosts.updatedAt,
          })
          .from(writingPosts)
          .where(eq(writingPosts.status, "approved"))
          .orderBy(desc(writingPosts.boostedScore), desc(writingPosts.viewCount), desc(writingPosts.createdAt))
          .limit(input?.limit ?? 6);
        return enrichPostsBatch(posts as any, ctx.user?.openId, db);
      });
    }),

  toggleFollow: protectedProcedure
    .input(z.object({ authorOpenId: z.string().min(1).max(64) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      if (input.authorOpenId === ctx.user.openId) throw new Error("নিজেকে অনুসরণ করা যায় না");
      const existing = await db.select({ id: writingFollows.id }).from(writingFollows)
        .where(and(eq(writingFollows.followerOpenId, ctx.user.openId), eq(writingFollows.followingOpenId, input.authorOpenId))).limit(1);
      if (existing.length > 0) {
        await db.delete(writingFollows).where(eq(writingFollows.id, existing[0].id));
        return { following: false };
      }
      await db.insert(writingFollows).values({ followerOpenId: ctx.user.openId, followingOpenId: input.authorOpenId });
      await createCommunityNotification(db, {
        recipientOpenId: input.authorOpenId,
        actorOpenId: ctx.user.openId,
        type: "follow",
        title: `${normalizeAuthorName(ctx.user.name)} আপনাকে অনুসরণ করেছেন`,
        body: "আপনার নতুন লেখা এখন তাঁর অনুসরণ করা ফিডে দেখা যাবে।",
      });
      return { following: true };
    }),

  myFollowing: protectedProcedure.query(async ({ ctx }) => {
    return safeWritingRead("myFollowing", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];
      return db.select({ authorOpenId: writingFollows.followingOpenId, createdAt: writingFollows.createdAt })
        .from(writingFollows).where(eq(writingFollows.followerOpenId, ctx.user.openId)).orderBy(desc(writingFollows.createdAt)).limit(200);
    });
  }),

  listSuggestedAuthors: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(8).default(4) }).optional())
    .query(async ({ ctx, input }) => {
      return safeWritingRead("listSuggestedAuthors", [], async () => {
        const db = await getWritingDb();
        if (!db) return [];
        const limit = input?.limit ?? 4;
        const candidates = await db
          .select({
            authorOpenId: writingPosts.authorOpenId,
            authorName: writingPosts.authorName,
            postCount: sql<number>`COUNT(*)`,
            totalViews: sql<number>`COALESCE(SUM(${writingPosts.viewCount}), 0)`,
            lastPublishedAt: sql<Date>`MAX(${writingPosts.createdAt})`,
          })
          .from(writingPosts)
          .where(eq(writingPosts.status, "approved"))
          .groupBy(writingPosts.authorOpenId, writingPosts.authorName)
          .orderBy(desc(sql`COUNT(*)`), desc(sql`MAX(${writingPosts.createdAt})`))
          .limit(Math.min(30, limit + 6));

        const authors = candidates
          .filter((author) => author.authorOpenId !== ctx.user?.openId)
          .slice(0, limit);
        if (authors.length === 0) return [];

        const authorOpenIds = authors.map((author) => author.authorOpenId);
        const [avatarRows, followRows] = await Promise.all([
          db.execute(
            sql.raw(
              `SELECT openId, CASE WHEN avatarUrl LIKE 'data:%' THEN NULL ELSE avatarUrl END AS avatarUrl FROM local_users WHERE openId IN (${authorOpenIds
                .map((id) => `'${id.replace(/'/g, "''")}'`)
                .join(",")}) LIMIT ${authorOpenIds.length}`
            )
          ).catch(() => null),
          ctx.user?.openId
            ? db.select({ followingOpenId: writingFollows.followingOpenId }).from(writingFollows)
              .where(and(eq(writingFollows.followerOpenId, ctx.user.openId), inArray(writingFollows.followingOpenId, authorOpenIds)))
              .catch(() => [])
            : Promise.resolve([]),
        ]);

        const avatarMap = new Map<string, string>();
        if (avatarRows) {
          const rows = Array.isArray(avatarRows) ? avatarRows[0] : avatarRows;
          if (Array.isArray(rows)) {
            for (const row of rows as any[]) {
              if (row.openId && row.avatarUrl) avatarMap.set(String(row.openId), String(row.avatarUrl));
            }
          }
        }
        const followingIds = new Set(followRows.map((row) => row.followingOpenId));
        return authors.map((author) => ({
          authorOpenId: author.authorOpenId,
          authorName: normalizeAuthorName(author.authorName),
          authorAvatarUrl: avatarMap.get(author.authorOpenId) ?? null,
          postCount: Number(author.postCount ?? 0),
          totalViews: Number(author.totalViews ?? 0),
          following: followingIds.has(author.authorOpenId),
        }));
      });
    }),

  listNotifications: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
    .query(async ({ ctx, input }) => {
      return safeWritingRead("listNotifications", { items: [], unreadCount: 0 }, async () => {
        const db = await getWritingDb();
        if (!db) return { items: [], unreadCount: 0 };
        const [items, unreadRows] = await Promise.all([
          db.select().from(writingNotifications).where(eq(writingNotifications.recipientOpenId, ctx.user.openId))
            .orderBy(desc(writingNotifications.createdAt)).limit(input?.limit ?? 20),
          db.select({ count: sql<number>`COUNT(*)` }).from(writingNotifications)
            .where(and(eq(writingNotifications.recipientOpenId, ctx.user.openId), isNull(writingNotifications.readAt))),
        ]);
        return { items, unreadCount: Number(unreadRows[0]?.count ?? 0) };
      });
    }),

  markNotificationsRead: protectedProcedure
    .input(z.object({ notificationIds: z.array(z.number().int().positive()).max(50).optional() }).optional())
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const conditions = [eq(writingNotifications.recipientOpenId, ctx.user.openId), isNull(writingNotifications.readAt)];
      if (input?.notificationIds?.length) conditions.push(inArray(writingNotifications.id, input.notificationIds));
      await db.update(writingNotifications).set({ readAt: new Date() }).where(and(...conditions));
      return { success: true };
    }),

  searchPosts: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(200),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      return safeWritingRead("searchPosts", [], async () => {
        const db = await getWritingDb();
        if (!db) return [];

        const searchTerm = `%${input.query.trim()}%`;
        // OPTIMIZED: Search only title and authorName; truncate mediaUrl
        const posts = await db
          .select({
            id: writingPosts.id,
            slug: writingPosts.slug,
            authorOpenId: writingPosts.authorOpenId,
            authorName: writingPosts.authorName,
            title: writingPosts.title,
            category: writingPosts.category,
            content: sql<string>`SUBSTRING(${writingPosts.content}, 1, 600)`,
            mediaUrl: sql<string>`SUBSTRING(${writingPosts.mediaUrl}, 1, 500)`,
            mediaType: writingPosts.mediaType,
            status: writingPosts.status,
            featured: writingPosts.featured,
            boostedScore: writingPosts.boostedScore,
            viewCount: writingPosts.viewCount,
            createdAt: writingPosts.createdAt,
            updatedAt: writingPosts.updatedAt,
          })
          .from(writingPosts)
          .where(and(
            eq(writingPosts.status, "approved"),
            or(
              like(writingPosts.title, searchTerm),
              like(writingPosts.authorName, searchTerm)
            )
          ))
          .orderBy(desc(writingPosts.createdAt))
          .limit(input.limit);

        // OPTIMIZED: batch enrich — pass db to avoid extra getWritingDb() call
        return enrichPostsBatch(posts as any, ctx.user?.openId, db);
      });
    }),

  getPostBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(180) }))
    .query(async ({ ctx, input }) => {
      return safeWritingRead("getPostBySlug", null, async () => {
        const db = await getWritingDb();
        if (!db) return null;

        const posts = await db
          .select()
          .from(writingPosts)
          .where(eq(writingPosts.slug, input.slug))
          .limit(1);

        if (posts.length === 0) return null;
        const post = posts[0];
        const canView = post.status === "approved" || ctx.user?.role === "admin" || ctx.user?.openId === post.authorOpenId;
        if (!canView) return null;

        // Increment view count and fetch comments in parallel
        const [comments] = await Promise.all([
          db
            .select()
            .from(writingComments)
            .where(and(eq(writingComments.postId, post.id), eq(writingComments.status, "approved")))
            .orderBy(writingComments.createdAt)
            .limit(100),
          post.status === "approved"
            ? db.update(writingPosts).set({ viewCount: post.viewCount + 1 }).where(eq(writingPosts.id, post.id))
            : Promise.resolve(),
        ]);

        return {
          post: await enrichPost(
            { ...post, viewCount: post.status === "approved" ? post.viewCount + 1 : post.viewCount },
            ctx.user?.openId,
            db
          ),
          comments,
        };
      });
    }),

  // Lightweight recent-comment endpoint for feed cards. It only runs after a reader expands comments.
  listRecentComments: publicProcedure
    .input(z.object({ postId: z.number().int().positive(), limit: z.number().min(1).max(8).default(3) }))
    .query(async ({ input }) => {
      return safeWritingRead("listRecentComments", [], async () => {
        const db = await getWritingDb();
        if (!db) return [];
        return db
          .select({
            id: writingComments.id,
            authorName: writingComments.authorName,
            content: writingComments.content,
            parentCommentId: writingComments.parentCommentId,
            mentionedOpenId: writingComments.mentionedOpenId,
            createdAt: writingComments.createdAt,
          })
          .from(writingComments)
          .where(and(eq(writingComments.postId, input.postId), eq(writingComments.status, "approved")))
          .orderBy(desc(writingComments.createdAt))
          .limit(input.limit);
      });
    }),

  // Lightweight endpoint to fetch only the mediaUrl of a post (for lazy loading images in feed)
  getPostMedia: publicProcedure
    .input(z.object({ postId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return safeWritingRead("getPostMedia", null, async () => {
        const db = await getWritingDb();
        if (!db) return null;
        const rows = await db
          .select({ mediaUrl: writingPosts.mediaUrl, mediaType: writingPosts.mediaType })
          .from(writingPosts)
          .where(and(eq(writingPosts.id, input.postId), eq(writingPosts.status, "approved")))
          .limit(1);
        if (rows.length === 0) return null;
        return rows[0];
      });
    }),

  myPosts: protectedProcedure.query(async ({ ctx }) => {
    return safeWritingRead("myPosts", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];

      // OPTIMIZED: truncate content and mediaUrl for feed display
      const posts = await db
        .select({
          id: writingPosts.id,
          slug: writingPosts.slug,
          authorOpenId: writingPosts.authorOpenId,
          authorName: writingPosts.authorName,
          title: writingPosts.title,
          category: writingPosts.category,
          content: sql<string>`SUBSTRING(${writingPosts.content}, 1, 600)`,
          mediaUrl: sql<string>`SUBSTRING(${writingPosts.mediaUrl}, 1, 500)`,
          mediaType: writingPosts.mediaType,
          status: writingPosts.status,
          featured: writingPosts.featured,
          boostedScore: writingPosts.boostedScore,
          viewCount: writingPosts.viewCount,
          createdAt: writingPosts.createdAt,
          updatedAt: writingPosts.updatedAt,
        })
        .from(writingPosts)
        .where(eq(writingPosts.authorOpenId, ctx.user.openId))
        .orderBy(desc(writingPosts.createdAt))
        .limit(50);

      // OPTIMIZED: batch enrich — pass db to avoid extra getWritingDb() call
      return enrichPostsBatch(posts as any, ctx.user.openId, db);
    });
  }),

  listPrompts: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(30).default(12) }).optional())
    .query(async ({ input }) => {
      return safeWritingRead("listPrompts", [], async () => {
        const db = await getWritingDb();
        if (!db) return [];
        return db.select().from(writingPrompts).where(eq(writingPrompts.active, true))
          .orderBy(asc(writingPrompts.position), desc(writingPrompts.createdAt)).limit(input?.limit ?? 12);
      });
    }),

  listDrafts: protectedProcedure.query(async ({ ctx }) => {
    return safeWritingRead("listDrafts", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];
      return db.select().from(writingDrafts).where(eq(writingDrafts.authorOpenId, ctx.user.openId))
        .orderBy(desc(writingDrafts.updatedAt)).limit(30);
    });
  }),

  saveDraft: protectedProcedure
    .input(z.object({
      draftId: z.number().int().positive().optional(),
      title: z.string().max(220).optional(),
      category: postCategorySchema.default("thought"),
      content: z.string().max(600000).default(""),
      mediaUrl: z.string().optional().or(z.literal("")),
      mediaType: mediaTypeSchema.default("none"),
      challengeId: z.number().int().positive().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const values = {
        title: input.title?.trim() || null,
        category: input.category,
        content: input.content,
        mediaUrl: input.mediaUrl?.trim() || null,
        mediaType: input.mediaUrl?.trim() ? input.mediaType : "none" as const,
        challengeId: input.challengeId || null,
        autosavedAt: new Date(),
      };
      if (input.draftId) {
        const owned = await db.select({ id: writingDrafts.id }).from(writingDrafts)
          .where(and(eq(writingDrafts.id, input.draftId), eq(writingDrafts.authorOpenId, ctx.user.openId))).limit(1);
        if (owned.length === 0) throw new Error("Draft পাওয়া যায়নি");
        await db.update(writingDrafts).set(values).where(eq(writingDrafts.id, input.draftId));
        return { draftId: input.draftId, saved: true };
      }
      const result = await db.insert(writingDrafts).values({ authorOpenId: ctx.user.openId, ...values });
      return { draftId: Number((result as any).insertId ?? (result as any)[0]?.insertId ?? 0), saved: true };
    }),

  deleteDraft: protectedProcedure
    .input(z.object({ draftId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(writingDrafts).where(and(eq(writingDrafts.id, input.draftId), eq(writingDrafts.authorOpenId, ctx.user.openId)));
      return { success: true };
    }),

  createPost: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(220).optional(),
      category: postCategorySchema.optional(),
      challengeId: z.number().int().positive().optional(),
      content: z.string().max(600000).optional().default(""),
      mediaUrl: z.string().optional().or(z.literal("")),
      mediaType: mediaTypeSchema.default("none"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");

      const mediaUrl = input.mediaUrl?.trim() || null;
      const mediaType = mediaUrl ? input.mediaType : "none";
      const contentText = input.content?.trim() || "";
      // Require at least caption or image
      if (!contentText && !mediaUrl) throw new Error("ক্যাপশন বা ছবি যোগ করুন");
      // Use provided title or auto-generate from first line of content
      const autoTitle = input.title?.trim() || contentText.split("\n")[0].slice(0, 80) || "বাস্তবতার গল্প";
      let category = input.category ?? "thought";
      let challengeId: number | null = null;
      if (input.challengeId) {
        const challenges = await db
          .select()
          .from(writingChallenges)
          .where(and(eq(writingChallenges.id, input.challengeId), eq(writingChallenges.status, "active")))
          .limit(1);
        if (challenges.length === 0) throw new Error("এই লেখার চ্যালেঞ্জটি এখন সক্রিয় নেই");
        challengeId = challenges[0].id;
        category = challenges[0].category;
      }

      const insertResult = await db.insert(writingPosts).values({
        slug: createSlug(autoTitle),
        authorOpenId: ctx.user.openId,
        authorName: normalizeAuthorName(ctx.user.name),
        title: autoTitle,
        category,
        challengeId,
        content: contentText,
        mediaUrl,
        mediaType,
        // New community submissions require moderation before appearing publicly.
        status: "pending",
      });
      const insertId = Number((insertResult as any).insertId ?? (insertResult as any)[0]?.insertId ?? 0);
      const moderation = detectModerationSignals(contentText);
      const signalRows = [
        ...(moderation.sensitive ? [{ postId: insertId, type: "sensitive" as const, score: 90, details: "Sensitive language review needed" }] : []),
        ...(moderation.profanity ? [{ postId: insertId, type: "profanity" as const, score: 80, details: "Potentially offensive language review needed" }] : []),
      ];
      if (signalRows.length) await db.insert(writingModerationSignals).values(signalRows).catch((error) => console.error("[WritingPlatform] moderation signal failed:", error));
      // Send Telegram notification for new posts
      sendTelegramPostSubmitted({
        postId: insertId,
        title: autoTitle,
        authorName: normalizeAuthorName(ctx.user.name),
        category,
        slug: "",
      }).catch(err => console.error("[Telegram post submit notify error]", err));

      return { success: true, postId: insertId };
    }),

  deletePost: protectedProcedure
    .input(z.object({ postId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");

      const posts = await db
        .select()
        .from(writingPosts)
        .where(eq(writingPosts.id, input.postId))
        .limit(1);
      if (posts.length === 0) throw new Error("Post not found");
      const post = posts[0];
      if (post.authorOpenId !== ctx.user.openId && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      await db.delete(writingPosts).where(eq(writingPosts.id, input.postId));
      return { success: true };
    }),

  editPost: protectedProcedure
    .input(z.object({
      postId: z.number().int().positive(),
      title: z.string().min(1).max(220).optional(),
      category: postCategorySchema.optional(),
      content: z.string().max(600000).optional().default(""),
      mediaUrl: z.string().optional().or(z.literal("")),
      mediaType: mediaTypeSchema.default("none"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");

      const posts = await db
        .select()
        .from(writingPosts)
        .where(eq(writingPosts.id, input.postId))
        .limit(1);
      if (posts.length === 0) throw new Error("Post not found");
      const post = posts[0];
      if (post.authorOpenId !== ctx.user.openId && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const mediaUrl = input.mediaUrl?.trim() || null;
      const mediaType = mediaUrl ? input.mediaType : "none";
      const contentText = input.content?.trim() || "";
      if (!contentText && !mediaUrl) throw new Error("ক্যাপশন বা ছবি যোগ করুন");
      // Use provided title or auto-generate from first line of content
      const autoTitle = input.title?.trim() || contentText.split("\n")[0].slice(0, 80) || post.title;
      const category = input.category ?? post.category;
      await db.update(writingPosts).set({
        title: autoTitle,
        category,
        content: contentText,
        mediaUrl,
        mediaType,
        status: "approved",
      }).where(eq(writingPosts.id, input.postId));
      return { success: true };
    }),

  reactToPost: protectedProcedure
    .input(z.object({ postId: z.number().int().positive(), type: reactionTypeSchema }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");

      const posts = await db
        .select()
        .from(writingPosts)
        .where(and(eq(writingPosts.id, input.postId), eq(writingPosts.status, "approved")))
        .limit(1);
      if (posts.length === 0) throw new Error("Post not found");
      const post = posts[0];

      const existing = await db
        .select()
        .from(writingReactions)
        .where(and(eq(writingReactions.postId, input.postId), eq(writingReactions.userOpenId, ctx.user.openId)))
        .limit(1);

      if (existing.length > 0 && existing[0].type === input.type) {
        await db.delete(writingReactions).where(eq(writingReactions.id, existing[0].id));
        return { success: true, action: "removed" as const };
      }

      if (existing.length > 0) {
        await db.update(writingReactions).set({ type: input.type }).where(eq(writingReactions.id, existing[0].id));
        await createCommunityNotification(db, { recipientOpenId: post.authorOpenId, actorOpenId: ctx.user.openId, type: "reaction", postId: post.id, title: `${normalizeAuthorName(ctx.user.name)} আপনার লেখায় প্রতিক্রিয়া জানিয়েছেন`, body: post.title });
        return { success: true, action: "updated" as const };
      }

      await db.insert(writingReactions).values({
        postId: input.postId,
        userOpenId: ctx.user.openId,
        type: input.type,
      });
      await createCommunityNotification(db, { recipientOpenId: post.authorOpenId, actorOpenId: ctx.user.openId, type: "reaction", postId: post.id, title: `${normalizeAuthorName(ctx.user.name)} আপনার লেখায় প্রতিক্রিয়া জানিয়েছেন`, body: post.title });

      return { success: true, action: "created" as const };
    }),

  addComment: protectedProcedure
    .input(z.object({ postId: z.number().int().positive(), content: z.string().min(2).max(2000), parentCommentId: z.number().int().positive().optional(), mentionedOpenId: z.string().min(1).max(64).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");

      const posts = await db
        .select()
        .from(writingPosts)
        .where(and(eq(writingPosts.id, input.postId), eq(writingPosts.status, "approved")))
        .limit(1);
      if (posts.length === 0) throw new Error("Post not found");

      let replyTargetOpenId: string | null = null;
      if (input.parentCommentId) {
        const parent = await db.select({ id: writingComments.id, postId: writingComments.postId, authorOpenId: writingComments.authorOpenId })
          .from(writingComments).where(eq(writingComments.id, input.parentCommentId)).limit(1);
        if (parent.length === 0 || parent[0].postId !== input.postId) throw new Error("মূল মন্তব্যটি পাওয়া যায়নি");
        replyTargetOpenId = parent[0].authorOpenId;
      }
      const commentInsert = await db.insert(writingComments).values({
        postId: input.postId,
        authorOpenId: ctx.user.openId,
        authorName: normalizeAuthorName(ctx.user.name),
        content: input.content.trim(),
        parentCommentId: input.parentCommentId || null,
        mentionedOpenId: input.mentionedOpenId || null,
        status: "approved",
      });
      const commentId = Number((commentInsert as any).insertId ?? (commentInsert as any)[0]?.insertId ?? 0);
      const recipientOpenId = replyTargetOpenId || posts[0].authorOpenId;
      await createCommunityNotification(db, {
        recipientOpenId,
        actorOpenId: ctx.user.openId,
        type: replyTargetOpenId ? "reply" : "comment",
        postId: input.postId,
        commentId,
        title: replyTargetOpenId ? `${normalizeAuthorName(ctx.user.name)} আপনার মন্তব্যের উত্তর দিয়েছেন` : `${normalizeAuthorName(ctx.user.name)} আপনার লেখায় মন্তব্য করেছেন`,
        body: input.content.trim(),
      });
      if (input.mentionedOpenId && input.mentionedOpenId !== recipientOpenId) {
        await createCommunityNotification(db, { recipientOpenId: input.mentionedOpenId, actorOpenId: ctx.user.openId, type: "mention", postId: input.postId, commentId, title: `${normalizeAuthorName(ctx.user.name)} আপনাকে একটি মন্তব্যে উল্লেখ করেছেন`, body: input.content.trim() });
      }
      // Send Telegram notification for new comments
      sendTelegramCommentSubmitted({
        commentId,
        postTitle: posts[0].title,
        authorName: normalizeAuthorName(ctx.user.name),
        contentPreview: input.content.trim(),
      }).catch(err => console.error("[Telegram comment submit notify error]", err));

      return { success: true, commentId };
    }),

  // ── Reader library: bookmarks and meaningful feedback ─────────────────────
  toggleBookmark: protectedProcedure
    .input(z.object({ postId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const post = await db.select({ id: writingPosts.id }).from(writingPosts)
        .where(and(eq(writingPosts.id, input.postId), eq(writingPosts.status, "approved"))).limit(1);
      if (post.length === 0) throw new Error("Post not found");
      const existing = await db.select({ id: writingBookmarks.id }).from(writingBookmarks)
        .where(and(eq(writingBookmarks.postId, input.postId), eq(writingBookmarks.userOpenId, ctx.user.openId))).limit(1);
      if (existing.length > 0) {
        await db.delete(writingBookmarks).where(eq(writingBookmarks.id, existing[0].id));
        return { success: true, saved: false };
      }
      await db.insert(writingBookmarks).values({ postId: input.postId, userOpenId: ctx.user.openId });
      return { success: true, saved: true };
    }),

  myBookmarks: protectedProcedure.query(async ({ ctx }) => {
    return safeWritingRead("myBookmarks", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];
      const rows = await db.select({ post: writingPosts }).from(writingBookmarks)
        .innerJoin(writingPosts, eq(writingBookmarks.postId, writingPosts.id))
        .where(and(eq(writingBookmarks.userOpenId, ctx.user.openId), eq(writingPosts.status, "approved")))
        .orderBy(desc(writingBookmarks.createdAt)).limit(50);
      return enrichPostsBatch(rows.map((row) => row.post), ctx.user.openId, db);
    });
  }),

  setFeedback: protectedProcedure
    .input(z.object({ postId: z.number().int().positive(), kind: feedbackKindSchema }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const post = await db.select({ id: writingPosts.id }).from(writingPosts)
        .where(and(eq(writingPosts.id, input.postId), eq(writingPosts.status, "approved"))).limit(1);
      if (post.length === 0) throw new Error("Post not found");
      const existing = await db.select().from(writingFeedback)
        .where(and(eq(writingFeedback.postId, input.postId), eq(writingFeedback.userOpenId, ctx.user.openId))).limit(1);
      if (existing.length > 0 && existing[0].kind === input.kind) {
        await db.delete(writingFeedback).where(eq(writingFeedback.id, existing[0].id));
        return { success: true, kind: null };
      }
      if (existing.length > 0) await db.update(writingFeedback).set({ kind: input.kind }).where(eq(writingFeedback.id, existing[0].id));
      else await db.insert(writingFeedback).values({ postId: input.postId, userOpenId: ctx.user.openId, kind: input.kind });
      return { success: true, kind: input.kind };
    }),

  // ── Writing challenges and editorial selections ─────────────────────────────
  listActiveChallenges: publicProcedure.query(async () => {
    return safeWritingRead("listActiveChallenges", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];
      return db.select().from(writingChallenges).where(eq(writingChallenges.status, "active"))
        .orderBy(desc(writingChallenges.createdAt)).limit(3);
    });
  }),

  listEditorialPicks: publicProcedure.query(async ({ ctx }) => {
    return safeWritingRead("listEditorialPicks", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];
      const rows = await db.select({ pick: writingEditorialPicks, post: writingPosts })
        .from(writingEditorialPicks).innerJoin(writingPosts, eq(writingEditorialPicks.postId, writingPosts.id))
        .where(and(eq(writingEditorialPicks.active, true), eq(writingPosts.status, "approved")))
        .orderBy(writingEditorialPicks.position, desc(writingEditorialPicks.createdAt)).limit(3);
      if (rows.length === 0) {
        const featuredPosts = await db.select().from(writingPosts)
          .where(and(eq(writingPosts.status, "approved"), eq(writingPosts.featured, true)))
          .orderBy(desc(writingPosts.createdAt)).limit(3);
        const posts = await enrichPostsBatch(featuredPosts, ctx.user?.openId, db);
        return posts.map((post, index) => ({ id: `featured-${post.id}`, postId: post.id, headline: index === 0 ? "আজকের নির্বাচিত লেখা" : "বিশেষভাবে নির্বাচিত", editorNote: "সম্প্রদায়ের জন্য বাছাই করা একটি লেখা।", position: index, active: true, post }));
      }
      const posts = await enrichPostsBatch(rows.map((row) => row.post), ctx.user?.openId, db);
      return rows.map((row, index) => ({ ...row.pick, post: posts[index] }));
    });
  }),

  getMyCommunityOverview: protectedProcedure.query(async ({ ctx }) => {
    return safeWritingRead("getMyCommunityOverview", { submitted: 0, approved: 0, saved: 0, following: 0, badges: [] as string[] }, async () => {
      const db = await getWritingDb();
      if (!db) return { submitted: 0, approved: 0, saved: 0, following: 0, badges: [] as string[] };
      const [submittedRows, approvedRows, savedRows, followingRows] = await Promise.all([
        db.select({ count: sql<number>`COUNT(*)` }).from(writingPosts).where(eq(writingPosts.authorOpenId, ctx.user.openId)),
        db.select({ count: sql<number>`COUNT(*)` }).from(writingPosts).where(and(eq(writingPosts.authorOpenId, ctx.user.openId), eq(writingPosts.status, "approved"))),
        db.select({ count: sql<number>`COUNT(*)` }).from(writingBookmarks).where(eq(writingBookmarks.userOpenId, ctx.user.openId)),
        db.select({ count: sql<number>`COUNT(*)` }).from(writingFollows).where(eq(writingFollows.followerOpenId, ctx.user.openId)),
      ]);
      const submitted = Number(submittedRows[0]?.count ?? 0);
      const approved = Number(approvedRows[0]?.count ?? 0);
      const saved = Number(savedRows[0]?.count ?? 0);
      const following = Number(followingRows[0]?.count ?? 0);
      const badges = [
        ...(submitted >= 1 ? ["প্রথম কলম"] : []),
        ...(approved >= 1 ? ["প্রকাশিত লেখক"] : []),
        ...(approved >= 5 ? ["নিয়মিত লেখক"] : []),
        ...(saved >= 3 ? ["মনোযোগী পাঠক"] : []),
        ...(following >= 1 ? ["পাঠক-বন্ধু"] : []),
      ];
      return { submitted, approved, saved, following, badges };
    });
  }),

  // ── Reading, analytics, editorial collections and live community events ───────
  recordReadingEvent: publicProcedure
    .input(z.object({ postId: z.number().int().positive(), eventType: z.enum(["view", "complete", "share", "audio_play"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) return { success: false };
      const post = await db.select({ id: writingPosts.id }).from(writingPosts)
        .where(and(eq(writingPosts.id, input.postId), eq(writingPosts.status, "approved"))).limit(1);
      if (post.length === 0) return { success: false };
      await db.insert(writingReadingEvents).values({ postId: input.postId, readerOpenId: ctx.user?.openId || null, eventType: input.eventType }).catch(() => {});
      return { success: true };
    }),

  getMyAuthorAnalytics: protectedProcedure.query(async ({ ctx }) => {
    return safeWritingRead("getMyAuthorAnalytics", { posts: 0, views: 0, reactions: 0, comments: 0, saves: 0, completionEvents: 0 }, async () => {
      const db = await getWritingDb();
      if (!db) return { posts: 0, views: 0, reactions: 0, comments: 0, saves: 0, completionEvents: 0 };
      const ownPosts = await db.select({ id: writingPosts.id, viewCount: writingPosts.viewCount }).from(writingPosts)
        .where(and(eq(writingPosts.authorOpenId, ctx.user.openId), eq(writingPosts.status, "approved"))).limit(500);
      const postIds = ownPosts.map((post) => post.id);
      if (postIds.length === 0) return { posts: 0, views: 0, reactions: 0, comments: 0, saves: 0, completionEvents: 0 };
      const [reactionRows, commentRows, saveRows, completionRows] = await Promise.all([
        db.select({ count: sql<number>`COUNT(*)` }).from(writingReactions).where(inArray(writingReactions.postId, postIds)),
        db.select({ count: sql<number>`COUNT(*)` }).from(writingComments).where(and(inArray(writingComments.postId, postIds), eq(writingComments.status, "approved"))),
        db.select({ count: sql<number>`COUNT(*)` }).from(writingBookmarks).where(inArray(writingBookmarks.postId, postIds)),
        db.select({ count: sql<number>`COUNT(*)` }).from(writingReadingEvents).where(and(inArray(writingReadingEvents.postId, postIds), eq(writingReadingEvents.eventType, "complete"))),
      ]);
      return {
        posts: ownPosts.length,
        views: ownPosts.reduce((sum, post) => sum + Number(post.viewCount || 0), 0),
        reactions: Number(reactionRows[0]?.count ?? 0),
        comments: Number(commentRows[0]?.count ?? 0),
        saves: Number(saveRows[0]?.count ?? 0),
        completionEvents: Number(completionRows[0]?.count ?? 0),
      };
    });
  }),

  listCollections: publicProcedure.query(async () => {
    return safeWritingRead("listCollections", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];
      return db.select().from(writingCollections).where(eq(writingCollections.active, true))
        .orderBy(desc(writingCollections.createdAt)).limit(20);
    });
  }),

  getCollectionBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(180) }))
    .query(async ({ ctx, input }) => {
      return safeWritingRead("getCollectionBySlug", null, async () => {
        const db = await getWritingDb();
        if (!db) return null;
        const collections = await db.select().from(writingCollections)
          .where(and(eq(writingCollections.slug, input.slug), eq(writingCollections.active, true))).limit(1);
        if (collections.length === 0) return null;
        const items = await db.select({ post: writingPosts }).from(writingCollectionItems)
          .innerJoin(writingPosts, eq(writingCollectionItems.postId, writingPosts.id))
          .where(and(eq(writingCollectionItems.collectionId, collections[0].id), eq(writingPosts.status, "approved")))
          .orderBy(asc(writingCollectionItems.position), desc(writingCollectionItems.createdAt)).limit(50);
        return { collection: collections[0], posts: await enrichPostsBatch(items.map((item) => item.post), ctx.user?.openId, db) };
      });
    }),

  listLiveEvents: publicProcedure.query(async () => {
    return safeWritingRead("listLiveEvents", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];
      const now = new Date();
      return db.select().from(writingEvents)
        .where(or(eq(writingEvents.status, "live"), and(eq(writingEvents.status, "scheduled"), gte(writingEvents.endsAt, now))))
        .orderBy(asc(writingEvents.startsAt)).limit(10);
    });
  }),

  createCollaborationInvite: protectedProcedure
    .input(z.object({ postId: z.number().int().positive(), inviteeOpenId: z.string().min(1).max(64) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      if (input.inviteeOpenId === ctx.user.openId) throw new Error("নিজেকে সহযোগী হিসেবে আমন্ত্রণ দেওয়া যায় না");
      const post = await db.select({ id: writingPosts.id, authorOpenId: writingPosts.authorOpenId, title: writingPosts.title }).from(writingPosts).where(eq(writingPosts.id, input.postId)).limit(1);
      if (post.length === 0 || (post[0].authorOpenId !== ctx.user.openId && ctx.user.role !== "admin")) throw new Error("এই লেখায় আমন্ত্রণ দেওয়ার অনুমতি নেই");
      const existing = await db.select({ id: writingCollaborationInvites.id }).from(writingCollaborationInvites)
        .where(and(eq(writingCollaborationInvites.postId, input.postId), eq(writingCollaborationInvites.inviteeOpenId, input.inviteeOpenId))).limit(1);
      if (existing.length) await db.update(writingCollaborationInvites).set({ inviterOpenId: ctx.user.openId, status: "pending" }).where(eq(writingCollaborationInvites.id, existing[0].id));
      else await db.insert(writingCollaborationInvites).values({ postId: input.postId, inviterOpenId: ctx.user.openId, inviteeOpenId: input.inviteeOpenId });
      await createCommunityNotification(db, { recipientOpenId: input.inviteeOpenId, actorOpenId: ctx.user.openId, type: "collaboration", postId: input.postId, title: `${normalizeAuthorName(ctx.user.name)} আপনাকে যৌথ লেখার আমন্ত্রণ জানিয়েছেন`, body: post[0].title });
      return { success: true };
    }),

  myCollaborationInvites: protectedProcedure.query(async ({ ctx }) => {
    return safeWritingRead("myCollaborationInvites", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];
      return db.select({ invite: writingCollaborationInvites, post: writingPosts }).from(writingCollaborationInvites)
        .innerJoin(writingPosts, eq(writingCollaborationInvites.postId, writingPosts.id))
        .where(and(eq(writingCollaborationInvites.inviteeOpenId, ctx.user.openId), eq(writingCollaborationInvites.status, "pending")))
        .orderBy(desc(writingCollaborationInvites.createdAt)).limit(30);
    });
  }),

  respondToCollaborationInvite: protectedProcedure
    .input(z.object({ inviteId: z.number().int().positive(), accept: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const invites = await db.select().from(writingCollaborationInvites)
        .where(and(eq(writingCollaborationInvites.id, input.inviteId), eq(writingCollaborationInvites.inviteeOpenId, ctx.user.openId), eq(writingCollaborationInvites.status, "pending"))).limit(1);
      if (invites.length === 0) throw new Error("আমন্ত্রণটি আর সক্রিয় নেই");
      const invite = invites[0];
      await db.update(writingCollaborationInvites).set({ status: input.accept ? "accepted" : "declined" }).where(eq(writingCollaborationInvites.id, invite.id));
      await createCommunityNotification(db, { recipientOpenId: invite.inviterOpenId, actorOpenId: ctx.user.openId, type: "collaboration", postId: invite.postId, title: `${normalizeAuthorName(ctx.user.name)} ${input.accept ? "যৌথ লেখার আমন্ত্রণ গ্রহণ করেছেন" : "যৌথ লেখার আমন্ত্রণ প্রত্যাখ্যান করেছেন"}` });
      return { success: true, status: input.accept ? "accepted" : "declined" };
    }),

  adminListModerationSignals: adminProcedure.query(async () => {
    return safeWritingRead("adminListModerationSignals", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];
      return db.select({ signal: writingModerationSignals, post: writingPosts }).from(writingModerationSignals)
        .innerJoin(writingPosts, eq(writingModerationSignals.postId, writingPosts.id))
        .where(eq(writingModerationSignals.status, "open")).orderBy(desc(writingModerationSignals.createdAt)).limit(100);
    });
  }),

  adminUpdateModerationSignal: adminProcedure
    .input(z.object({ signalId: z.number().int().positive(), status: z.enum(["reviewed", "dismissed"]) }))
    .mutation(async ({ input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(writingModerationSignals).set({ status: input.status }).where(eq(writingModerationSignals.id, input.signalId));
      return { success: true };
    }),

  adminCreatePrompt: adminProcedure
    .input(z.object({ category: postCategorySchema, title: z.string().min(2).max(180), prompt: z.string().min(5).max(900), position: z.number().int().min(0).max(999).default(0) }))
    .mutation(async ({ input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const result = await db.insert(writingPrompts).values({ category: input.category, title: input.title.trim(), prompt: input.prompt.trim(), position: input.position });
      return { success: true, promptId: Number((result as any).insertId ?? (result as any)[0]?.insertId ?? 0) };
    }),

  adminUpdatePrompt: adminProcedure
    .input(z.object({ promptId: z.number().int().positive(), active: z.boolean().optional(), title: z.string().min(2).max(180).optional(), prompt: z.string().min(5).max(900).optional(), category: postCategorySchema.optional(), position: z.number().int().min(0).max(999).optional() }))
    .mutation(async ({ input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const { promptId, ...changes } = input;
      await db.update(writingPrompts).set(changes).where(eq(writingPrompts.id, promptId));
      return { success: true };
    }),

  adminCreateCollection: adminProcedure
    .input(z.object({ slug: z.string().min(2).max(180), title: z.string().min(2).max(180), description: z.string().max(900).optional(), coverUrl: z.string().max(600000).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const slug = createSlug(input.slug).slice(0, 180);
      const result = await db.insert(writingCollections).values({ slug, title: input.title.trim(), description: input.description?.trim() || null, coverUrl: input.coverUrl?.trim() || null, createdByOpenId: ctx.user.openId });
      return { success: true, collectionId: Number((result as any).insertId ?? (result as any)[0]?.insertId ?? 0), slug };
    }),

  adminSetCollectionItems: adminProcedure
    .input(z.object({ collectionId: z.number().int().positive(), postIds: z.array(z.number().int().positive()).max(50) }))
    .mutation(async ({ input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(writingCollectionItems).where(eq(writingCollectionItems.collectionId, input.collectionId));
      if (input.postIds.length) await db.insert(writingCollectionItems).values(input.postIds.map((postId, position) => ({ collectionId: input.collectionId, postId, position })));
      return { success: true };
    }),

  adminCreateEvent: adminProcedure
    .input(z.object({ title: z.string().min(2).max(180), prompt: z.string().min(5).max(6000), category: postCategorySchema, startsAt: z.string().datetime(), endsAt: z.string().datetime(), status: z.enum(["draft", "scheduled", "live"]).default("scheduled") }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const startsAt = new Date(input.startsAt);
      const endsAt = new Date(input.endsAt);
      if (endsAt <= startsAt) throw new Error("শেষ সময় শুরুর সময়ের পরে হতে হবে");
      const result = await db.insert(writingEvents).values({ title: input.title.trim(), prompt: input.prompt.trim(), category: input.category, status: input.status, startsAt, endsAt, createdByOpenId: ctx.user.openId });
      return { success: true, eventId: Number((result as any).insertId ?? (result as any)[0]?.insertId ?? 0) };
    }),

  adminUpdateEvent: adminProcedure
    .input(z.object({ eventId: z.number().int().positive(), status: z.enum(["draft", "scheduled", "live", "ended", "archived"]).optional(), title: z.string().min(2).max(180).optional(), prompt: z.string().min(5).max(6000).optional(), startsAt: z.string().datetime().optional(), endsAt: z.string().datetime().optional() }))
    .mutation(async ({ input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const { eventId, startsAt, endsAt, ...rest } = input;
      await db.update(writingEvents).set({ ...rest, ...(startsAt ? { startsAt: new Date(startsAt) } : {}), ...(endsAt ? { endsAt: new Date(endsAt) } : {}) }).where(eq(writingEvents.id, eventId));
      return { success: true };
    }),

  // ── Safety reports ─────────────────────────────────────────────────────────
  submitReport: protectedProcedure
    .input(z.object({ postId: z.number().int().positive(), reason: reportReasonSchema, details: z.string().trim().max(600).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const posts = await db.select({ id: writingPosts.id, authorOpenId: writingPosts.authorOpenId }).from(writingPosts).where(eq(writingPosts.id, input.postId)).limit(1);
      if (posts.length === 0) throw new Error("Post not found");
      if (posts[0].authorOpenId === ctx.user.openId) throw new Error("নিজের লেখা রিপোর্ট করা যায় না");
      const existing = await db.select({ id: writingReports.id }).from(writingReports)
        .where(and(eq(writingReports.postId, input.postId), eq(writingReports.reporterOpenId, ctx.user.openId))).limit(1);
      if (existing.length > 0) {
        await db.update(writingReports).set({ reason: input.reason, details: input.details || null, status: "pending", adminNote: null }).where(eq(writingReports.id, existing[0].id));
      } else {
        await db.insert(writingReports).values({ postId: input.postId, reporterOpenId: ctx.user.openId, reason: input.reason, details: input.details || null });
      }
      return { success: true };
    }),

  adminListReports: adminProcedure
    .input(z.object({ status: reportStatusSchema.or(z.literal("all")).default("pending") }).optional())
    .query(async ({ input }) => {
      return safeWritingRead("adminListReports", [], async () => {
        const db = await getWritingDb();
        if (!db) return [];
        const status = input?.status ?? "pending";
        const query = db.select({ report: writingReports, post: writingPosts }).from(writingReports)
          .innerJoin(writingPosts, eq(writingReports.postId, writingPosts.id));
        const rows = status === "all" ? await query.orderBy(desc(writingReports.createdAt)).limit(100) : await query.where(eq(writingReports.status, status)).orderBy(desc(writingReports.createdAt)).limit(100);
        return rows.map((row) => ({ ...row.report, postTitle: row.post.title, postSlug: row.post.slug, postAuthorName: row.post.authorName }));
      });
    }),

  adminUpdateReport: adminProcedure
    .input(z.object({ reportId: z.number().int().positive(), status: reportStatusSchema, adminNote: z.string().trim().max(600).optional() }))
    .mutation(async ({ input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(writingReports).set({ status: input.status, adminNote: input.adminNote || null }).where(eq(writingReports.id, input.reportId));
      return { success: true };
    }),

  adminListChallenges: adminProcedure.query(async () => {
    return safeWritingRead("adminListChallenges", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];
      return db.select().from(writingChallenges).orderBy(desc(writingChallenges.createdAt)).limit(50);
    });
  }),

  adminCreateChallenge: adminProcedure
    .input(z.object({ title: z.string().trim().min(3).max(180), prompt: z.string().trim().min(10).max(4000), category: postCategorySchema, status: challengeStatusSchema.default("draft"), endsAt: z.string().datetime().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(writingChallenges).values({ title: input.title, prompt: input.prompt, category: input.category, status: input.status, endsAt: input.endsAt ? new Date(input.endsAt) : null, createdByOpenId: ctx.user.openId });
      return { success: true };
    }),

  adminUpdateChallenge: adminProcedure
    .input(z.object({ challengeId: z.number().int().positive(), title: z.string().trim().min(3).max(180).optional(), prompt: z.string().trim().min(10).max(4000).optional(), category: postCategorySchema.optional(), status: challengeStatusSchema.optional(), endsAt: z.string().datetime().nullable().optional() }))
    .mutation(async ({ input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const updateSet: Record<string, unknown> = {};
      if (input.title !== undefined) updateSet.title = input.title;
      if (input.prompt !== undefined) updateSet.prompt = input.prompt;
      if (input.category !== undefined) updateSet.category = input.category;
      if (input.status !== undefined) updateSet.status = input.status;
      if (input.endsAt !== undefined) updateSet.endsAt = input.endsAt ? new Date(input.endsAt) : null;
      await db.update(writingChallenges).set(updateSet).where(eq(writingChallenges.id, input.challengeId));
      return { success: true };
    }),

  adminSetEditorialPick: adminProcedure
    .input(z.object({ postId: z.number().int().positive(), active: z.boolean().default(true), position: z.number().int().min(0).max(99).default(0), headline: z.string().trim().max(180).optional(), editorNote: z.string().trim().max(600).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const posts = await db.select({ id: writingPosts.id }).from(writingPosts).where(and(eq(writingPosts.id, input.postId), eq(writingPosts.status, "approved"))).limit(1);
      if (posts.length === 0) throw new Error("শুধু অনুমোদিত লেখা সম্পাদকীয় নির্বাচনে রাখা যায়");
      const existing = await db.select({ id: writingEditorialPicks.id }).from(writingEditorialPicks).where(eq(writingEditorialPicks.postId, input.postId)).limit(1);
      const values = { active: input.active, position: input.position, headline: input.headline || null, editorNote: input.editorNote || null, createdByOpenId: ctx.user.openId };
      if (existing.length > 0) await db.update(writingEditorialPicks).set(values).where(eq(writingEditorialPicks.id, existing[0].id));
      else await db.insert(writingEditorialPicks).values({ postId: input.postId, ...values });
      return { success: true };
    }),

  adminListPosts: adminProcedure
    .input(z.object({ status: postStatusSchema.or(z.literal("all")).default("pending") }).optional())
    .query(async ({ input }) => {
      return safeWritingRead("adminListPosts", [], async () => {
        const db = await getWritingDb();
        if (!db) return [];

        const query = db.select().from(writingPosts);
        const status = input?.status ?? "pending";
        const posts = status === "all"
          ? await query.orderBy(desc(writingPosts.createdAt)).limit(100)
          : await query.where(eq(writingPosts.status, status)).orderBy(desc(writingPosts.createdAt)).limit(100);

        // OPTIMIZED: batch enrich
        return enrichPostsBatch(posts);
      });
    }),

  adminUpdatePost: adminProcedure
    .input(z.object({
      postId: z.number().int().positive(),
      status: postStatusSchema.optional(),
      featured: z.boolean().optional(),
      boostedScore: z.number().int().min(0).max(100000).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");

      // Fetch post info for Telegram notification
      const existingPosts = await db
        .select()
        .from(writingPosts)
        .where(eq(writingPosts.id, input.postId))
        .limit(1);
      const existingPost = existingPosts[0];

      const updateSet: Partial<typeof writingPosts.$inferInsert> = {};
      if (input.status !== undefined) updateSet.status = input.status;
      if (input.featured !== undefined) updateSet.featured = input.featured;
      if (input.boostedScore !== undefined) updateSet.boostedScore = input.boostedScore;

      await db.update(writingPosts).set(updateSet).where(eq(writingPosts.id, input.postId));

      // Send Telegram notification for moderation actions
      if (existingPost) {
        let action: "approved" | "rejected" | "removed" | "featured" | "unfeatured" | null = null;
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
            action,
          }).catch(err => console.error("[Telegram post moderated notify error]", err));
        }
      }

      return { success: true };
    }),

  adminListComments: adminProcedure
    .input(z.object({ status: commentStatusSchema.or(z.literal("all")).default("pending") }).optional())
    .query(async ({ input }) => {
      return safeWritingRead("adminListComments", [], async () => {
        const db = await getWritingDb();
        if (!db) return [];

        const status = input?.status ?? "pending";
        const query = db.select().from(writingComments);
        return status === "all"
          ? query.orderBy(desc(writingComments.createdAt)).limit(100)
          : query.where(eq(writingComments.status, status)).orderBy(desc(writingComments.createdAt)).limit(100);
      });
    }),

  adminUpdateComment: adminProcedure
    .input(z.object({ commentId: z.number().int().positive(), status: commentStatusSchema }))
    .mutation(async ({ input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");

      await db.update(writingComments).set({ status: input.status }).where(eq(writingComments.id, input.commentId));
      return { success: true };
    }),
});
