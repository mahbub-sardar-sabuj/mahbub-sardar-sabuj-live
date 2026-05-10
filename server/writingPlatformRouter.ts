import { z } from "zod";
import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { writingComments, writingPosts, writingReactions } from "../drizzle/schema";
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

let writingTablesReady = false;
let writingTablesReadyPromise: Promise<void> | null = null;

async function ensureWritingPlatformTables(db: WritingDb) {
  if (writingTablesReady) return;

  if (!writingTablesReadyPromise) {
    writingTablesReadyPromise = (async () => {
      await db.execute(sql.raw("CREATE TABLE IF NOT EXISTS `writing_posts` (`id` int AUTO_INCREMENT NOT NULL, `slug` varchar(180) NOT NULL, `authorOpenId` varchar(64) NOT NULL, `authorName` varchar(160) NOT NULL, `title` varchar(220) NOT NULL, `category` enum('experience','story','poem','thought','photo','video') NOT NULL DEFAULT 'thought', `content` longtext NOT NULL, `mediaUrl` text, `mediaType` enum('none','image','video') NOT NULL DEFAULT 'none', `status` enum('pending','approved','rejected','removed') NOT NULL DEFAULT 'pending', `featured` boolean NOT NULL DEFAULT false, `boostedScore` int NOT NULL DEFAULT 0, `viewCount` int NOT NULL DEFAULT 0, `createdAt` timestamp NOT NULL DEFAULT (now()), `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT `writing_posts_id` PRIMARY KEY(`id`), CONSTRAINT `writing_posts_slug_unique` UNIQUE(`slug`))"));
      // Upgrade existing columns to LONGTEXT if they were created as TEXT
      await db.execute(sql.raw("ALTER TABLE `writing_posts` MODIFY COLUMN `content` longtext NOT NULL")).catch(() => {});
      await db.execute(sql.raw("ALTER TABLE `writing_posts` MODIFY COLUMN `mediaUrl` longtext")).catch(() => {});
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

async function safeWritingRead<T>(label: string, fallback: T, operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    console.error(`[WritingPlatform] ${label} failed:`, error);
    return fallback;
  }
}

// ── OPTIMIZED: Batch-enrich multiple posts in 3 queries instead of 3N queries ──
// Old approach: N posts × 3 queries each = 3N DB round-trips (N+1 problem)
// New approach: 3 batch queries regardless of post count = O(1) DB round-trips
async function enrichPostsBatch(posts: WritingPost[], userOpenId?: string) {
  if (posts.length === 0) return [];

  const db = await getWritingDb();
  const emptyEnrich = (post: WritingPost) => ({
    ...post,
    authorAvatarUrl: null as string | null,
    reactionCounts: { like: 0, love: 0, inspiring: 0, sad: 0 },
    commentCount: 0,
    myReaction: null as null | "like" | "love" | "inspiring" | "sad",
  });

  if (!db) return posts.map(emptyEnrich);

  const postIds = posts.map((p) => p.id);
  const authorOpenIds = [...new Set(posts.map((p) => p.authorOpenId))];

  // ── 3 parallel batch queries instead of 3N sequential queries ──
  const [allReactions, allComments, avatarRows] = await Promise.all([
    // Batch query 1: all reactions for all posts at once
    db
      .select()
      .from(writingReactions)
      .where(inArray(writingReactions.postId, postIds)),

    // Batch query 2: approved comment counts for all posts at once
    db
      .select({ postId: writingComments.postId })
      .from(writingComments)
      .where(
        and(
          inArray(writingComments.postId, postIds),
          eq(writingComments.status, "approved")
        )
      ),

    // Batch query 3: author avatars for all unique authors at once
    authorOpenIds.length > 0
      ? db.execute(
          sql.raw(
            `SELECT openId, avatarUrl FROM local_users WHERE openId IN (${authorOpenIds
              .map((id) => `'${id.replace(/'/g, "''")}'`)
              .join(",")}) LIMIT ${authorOpenIds.length}`
          )
        ).catch(() => null)
      : Promise.resolve(null),
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

  // Avatar map: authorOpenId → avatarUrl
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
      commentCount: commentCountMap.get(post.id) ?? 0,
      myReaction: (reactionData?.myReaction ?? null) as null | "like" | "love" | "inspiring" | "sad",
    };
  });
}

// ── Single-post enrich (for getPostBySlug) — still uses 3 queries but only for 1 post ──
async function enrichPost(post: WritingPost, userOpenId?: string) {
  const results = await enrichPostsBatch([post], userOpenId);
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

        const posts = await db
          .select()
          .from(writingPosts)
          .where(and(...conditions))
          .orderBy(desc(writingPosts.featured), desc(writingPosts.boostedScore), desc(writingPosts.createdAt))
          .limit(input?.limit ?? 20);

        // OPTIMIZED: batch enrich — 3 queries total instead of 3N
        return enrichPostsBatch(posts, ctx.user?.openId);
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
        const posts = await db
          .select()
          .from(writingPosts)
          .where(and(...conditions))
          .orderBy(desc(writingPosts.featured), desc(writingPosts.boostedScore), desc(writingPosts.createdAt))
          .limit(limit)
          .offset(input?.offset ?? 0);

        // OPTIMIZED: batch enrich
        const enriched = await enrichPostsBatch(posts, ctx.user?.openId);
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
        const posts = await db
          .select()
          .from(writingPosts)
          .where(and(
            eq(writingPosts.status, "approved"),
            or(
              like(writingPosts.title, searchTerm),
              like(writingPosts.content, searchTerm),
              like(writingPosts.authorName, searchTerm)
            )
          ))
          .orderBy(desc(writingPosts.createdAt))
          .limit(input.limit);

        // OPTIMIZED: batch enrich
        return enrichPostsBatch(posts, ctx.user?.openId);
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
            ctx.user?.openId
          ),
          comments,
        };
      });
    }),

  myPosts: protectedProcedure.query(async ({ ctx }) => {
    return safeWritingRead("myPosts", [], async () => {
      const db = await getWritingDb();
      if (!db) return [];

      const posts = await db
        .select()
        .from(writingPosts)
        .where(eq(writingPosts.authorOpenId, ctx.user.openId))
        .orderBy(desc(writingPosts.createdAt))
        .limit(50);

      // OPTIMIZED: batch enrich
      return enrichPostsBatch(posts, ctx.user.openId);
    });
  }),

  createPost: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(220).optional(),
      category: postCategorySchema.optional(),
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
        status: "approved",
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

  // ── ফিড কার্ড থেকে ভিউ ট্র্যাক করা (লগইন করা ইউজারের জন্য) ──
  incrementView: protectedProcedure
    .input(z.object({ postId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      return safeWritingRead("incrementView", { success: false }, async () => {
        const db = await getWritingDb();
        if (!db) return { success: false };
        const posts = await db
          .select({ id: writingPosts.id, viewCount: writingPosts.viewCount })
          .from(writingPosts)
          .where(and(eq(writingPosts.id, input.postId), eq(writingPosts.status, "approved")))
          .limit(1);
        if (posts.length === 0) return { success: false };
        await db
          .update(writingPosts)
          .set({ viewCount: posts[0].viewCount + 1 })
          .where(eq(writingPosts.id, input.postId));
        return { success: true };
      });
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

  // ── সব পোস্টে র‍্যান্ডম ভিউ বুস্ট করা (Admin only) ──
  // ── slug দিয়ে পোস্ট রিমুভ করা (Admin only) ──
  adminRemoveBySlug: adminProcedure
    .input(z.object({ slug: z.string().min(1).max(180) }))
    .mutation(async ({ input }) => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const posts = await db
        .select({ id: writingPosts.id, title: writingPosts.title, authorName: writingPosts.authorName })
        .from(writingPosts)
        .where(eq(writingPosts.slug, input.slug))
        .limit(1);
      if (posts.length === 0) throw new Error("Post not found");
      await db
        .update(writingPosts)
        .set({ status: "removed" })
        .where(eq(writingPosts.id, posts[0].id));
      sendTelegramPostModerated({
        postId: posts[0].id,
        title: posts[0].title,
        authorName: posts[0].authorName,
        action: "removed",
      }).catch(() => {});
      return { success: true, postId: posts[0].id, title: posts[0].title };
    }),

  adminBulkBoostViews: adminProcedure
    .mutation(async () => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const posts = await db
        .select({ id: writingPosts.id })
        .from(writingPosts)
        .where(eq(writingPosts.status, "approved"));
      if (posts.length === 0) return { success: true, updated: 0 };
      // প্রতিটি পোস্টে আলাদা র‍্যান্ডম ভিউ সেট করা (3000–4000)
      for (const post of posts) {
        const randomView = Math.floor(Math.random() * 1001) + 3000; // 3000 to 4000
        await db
          .update(writingPosts)
          .set({ viewCount: randomView })
          .where(eq(writingPosts.id, post.id));
      }
      return { success: true, updated: posts.length };
    }),

  // ── সব পোস্টে র‍্যান্ডম লাইক বুস্ট করা (Admin only) ──
  adminBulkBoostLikes: adminProcedure
    .mutation(async () => {
      const db = await getWritingDb();
      if (!db) throw new Error("Database unavailable");
      const posts = await db
        .select({ id: writingPosts.id })
        .from(writingPosts)
        .where(eq(writingPosts.status, "approved"));
      if (posts.length === 0) return { success: true, updated: 0 };
      const reactionTypes: Array<"like" | "love" | "inspiring" | "sad"> = ["like", "love", "inspiring", "sad"];
      // প্রতিটি পোস্টের জন্য ফেক রিঅ্যাকশন ইনসার্ট করা
      for (const post of posts) {
        // আগের ফেক রিঅ্যাকশন মুছে দেওয়া (boost_ prefix দিয়ে চেনা যাবে)
        await db
          .delete(writingReactions)
          .where(
            and(
              eq(writingReactions.postId, post.id),
              like(writingReactions.userOpenId, "boost_%")
            )
          );
        // র‍্যান্ডম সংখ্যক লাইক দেওয়া (3000–4000)
        const totalLikes = Math.floor(Math.random() * 1001) + 3000;
        const batchSize = 500;
        let inserted = 0;
        while (inserted < totalLikes) {
          const batch = Math.min(batchSize, totalLikes - inserted);
          const values = Array.from({ length: batch }, (_, i) => ({
            postId: post.id,
            userOpenId: `boost_${post.id}_${inserted + i}`,
            type: reactionTypes[Math.floor(Math.random() * reactionTypes.length)],
          }));
          await db.insert(writingReactions).values(values);
          inserted += batch;
        }
      }
      return { success: true, updated: posts.length };
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
