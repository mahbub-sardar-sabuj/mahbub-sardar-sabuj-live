import { z } from "zod";
import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { writingBookmarks, writingChallenges, writingComments, writingEditorialPicks, writingFeedback, writingPosts, writingReactions, writingReports } from "../drizzle/schema";
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
    isOwner: Boolean(userOpenId && post.authorOpenId === userOpenId),
  });

  if (!db) return posts.map(emptyEnrich);

  const postIds = posts.map((p) => p.id);
  const authorOpenIds = [...new Set(posts.map((p) => p.authorOpenId))];

  // ── Batch enrichment queries ──
  const [allReactions, allComments, avatarRows, allFeedback, myBookmarks] = await Promise.all([
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
      // Send Telegram notification for new posts
      {
        const insertId = (insertResult as any).insertId ?? (insertResult as any)[0]?.insertId ?? 0;
        sendTelegramPostSubmitted({
          postId: insertId,
          title: autoTitle,
          authorName: normalizeAuthorName(ctx.user.name),
          category,
          slug: "",
        }).catch(err => console.error("[Telegram post submit notify error]", err));
      }

      return { success: true };
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
        return { success: true, action: "updated" as const };
      }

      await db.insert(writingReactions).values({
        postId: input.postId,
        userOpenId: ctx.user.openId,
        type: input.type,
      });

      return { success: true, action: "created" as const };
    }),

  addComment: protectedProcedure
    .input(z.object({ postId: z.number().int().positive(), content: z.string().min(2).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");

      const posts = await db
        .select()
        .from(writingPosts)
        .where(and(eq(writingPosts.id, input.postId), eq(writingPosts.status, "approved")))
        .limit(1);
      if (posts.length === 0) throw new Error("Post not found");

      const commentInsert = await db.insert(writingComments).values({
        postId: input.postId,
        authorOpenId: ctx.user.openId,
        authorName: normalizeAuthorName(ctx.user.name),
        content: input.content.trim(),
        status: "approved",
      });
      // Send Telegram notification for new comments
      {
        const commentId = (commentInsert as any).insertId ?? (commentInsert as any)[0]?.insertId ?? 0;
        sendTelegramCommentSubmitted({
          commentId,
          postTitle: posts[0].title,
          authorName: normalizeAuthorName(ctx.user.name),
          contentPreview: input.content.trim(),
        }).catch(err => console.error("[Telegram comment submit notify error]", err));
      }

      return { success: true };
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
    return safeWritingRead("getMyCommunityOverview", { submitted: 0, approved: 0, saved: 0, badges: [] as string[] }, async () => {
      const db = await getWritingDb();
      if (!db) return { submitted: 0, approved: 0, saved: 0, badges: [] as string[] };
      const [submittedRows, approvedRows, savedRows] = await Promise.all([
        db.select({ count: sql<number>`COUNT(*)` }).from(writingPosts).where(eq(writingPosts.authorOpenId, ctx.user.openId)),
        db.select({ count: sql<number>`COUNT(*)` }).from(writingPosts).where(and(eq(writingPosts.authorOpenId, ctx.user.openId), eq(writingPosts.status, "approved"))),
        db.select({ count: sql<number>`COUNT(*)` }).from(writingBookmarks).where(eq(writingBookmarks.userOpenId, ctx.user.openId)),
      ]);
      const submitted = Number(submittedRows[0]?.count ?? 0);
      const approved = Number(approvedRows[0]?.count ?? 0);
      const saved = Number(savedRows[0]?.count ?? 0);
      const badges = [
        ...(submitted >= 1 ? ["প্রথম কলম"] : []),
        ...(approved >= 1 ? ["প্রকাশিত লেখক"] : []),
        ...(approved >= 5 ? ["নিয়মিত লেখক"] : []),
        ...(saved >= 3 ? ["মনোযোগী পাঠক"] : []),
      ];
      return { submitted, approved, saved, badges };
    });
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
