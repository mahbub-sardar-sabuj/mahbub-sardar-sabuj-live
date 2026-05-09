import { z } from "zod";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
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

async function enrichPost(post: typeof writingPosts.$inferSelect, userOpenId?: string) {
  const db = await getWritingDb();
  if (!db) {
    return {
      ...post,
      authorAvatarUrl: null as string | null,
      reactionCounts: { like: 0, love: 0, inspiring: 0, sad: 0 },
      commentCount: 0,
      myReaction: null as null | "like" | "love" | "inspiring" | "sad",
    };
  }

  const reactions = await db
    .select()
    .from(writingReactions)
    .where(eq(writingReactions.postId, post.id));

  const approvedComments = await db
    .select()
    .from(writingComments)
    .where(and(eq(writingComments.postId, post.id), eq(writingComments.status, "approved")));

  const reactionCounts = { like: 0, love: 0, inspiring: 0, sad: 0 };
  let myReaction: null | "like" | "love" | "inspiring" | "sad" = null;

  reactions.forEach((reaction) => {
    reactionCounts[reaction.type] += 1;
    if (userOpenId && reaction.userOpenId === userOpenId) {
      myReaction = reaction.type;
    }
  });

  // Fetch author avatar from local_users table
  let authorAvatarUrl: string | null = null;
  try {
    const avatarRows = await db.execute(
      sql.raw(`SELECT avatarUrl FROM local_users WHERE openId = '${post.authorOpenId.replace(/'/g, "''")}' LIMIT 1`)
    ) as any;
    const rows = Array.isArray(avatarRows) ? avatarRows[0] : avatarRows;
    if (Array.isArray(rows) && rows.length > 0 && rows[0].avatarUrl) {
      const av = rows[0].avatarUrl as string;
      // Only use non-base64 URLs to avoid sending large data
      if (!av.startsWith("data:")) {
        authorAvatarUrl = av;
      }
    }
  } catch {
    // avatarUrl not critical, ignore errors
  }

  return {
    ...post,
    authorAvatarUrl,
    reactionCounts,
    commentCount: approvedComments.length,
    myReaction,
  };
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

        return Promise.all(posts.map((post) => enrichPost(post, ctx.user?.openId)));
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
      const enriched = await Promise.all(posts.map((post) => enrichPost(post, ctx.user?.openId)));
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
        return Promise.all(posts.map((post) => enrichPost(post, ctx.user?.openId)));
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

      if (post.status === "approved") {
        await db
          .update(writingPosts)
          .set({ viewCount: post.viewCount + 1 })
          .where(eq(writingPosts.id, post.id));
      }

      const comments = await db
        .select()
        .from(writingComments)
        .where(and(eq(writingComments.postId, post.id), eq(writingComments.status, "approved")))
        .orderBy(writingComments.createdAt)
        .limit(100);

        return {
          post: await enrichPost({ ...post, viewCount: post.status === "approved" ? post.viewCount + 1 : post.viewCount }, ctx.user?.openId),
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

      return Promise.all(posts.map((post) => enrichPost(post, ctx.user.openId)));
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

        return Promise.all(posts.map((post) => enrichPost(post)));
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
