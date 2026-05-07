import { z } from "zod";
import { and, desc, eq, like, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { writingComments, writingPosts, writingReactions } from "../drizzle/schema";

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

async function enrichPost(post: typeof writingPosts.$inferSelect, userOpenId?: string) {
  const db = await getDb();
  if (!db) {
    return {
      ...post,
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

  return {
    ...post,
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
      const db = await getDb();
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
    }),

  listPostsPaginated: publicProcedure
    .input(z.object({
      category: postCategorySchema.optional(),
      featuredOnly: z.boolean().optional(),
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
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
    }),
  searchPosts: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(200),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
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
    }),
  getPostBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(180) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
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
    }),

  myPosts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const posts = await db
      .select()
      .from(writingPosts)
      .where(eq(writingPosts.authorOpenId, ctx.user.openId))
      .orderBy(desc(writingPosts.createdAt))
      .limit(50);

    return Promise.all(posts.map((post) => enrichPost(post, ctx.user.openId)));
  }),

  createPost: protectedProcedure
    .input(z.object({
      title: z.string().min(3).max(220),
      category: postCategorySchema,
      content: z.string().min(20).max(20000),
      mediaUrl: z.string().url().max(2000).optional().or(z.literal("")),
      mediaType: mediaTypeSchema.default("none"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const mediaUrl = input.mediaUrl?.trim() || null;
      const mediaType = mediaUrl ? input.mediaType : "none";

      await db.insert(writingPosts).values({
        slug: createSlug(input.title),
        authorOpenId: ctx.user.openId,
        authorName: normalizeAuthorName(ctx.user.name),
        title: input.title.trim(),
        category: input.category,
        content: input.content.trim(),
        mediaUrl,
        mediaType,
        status: ctx.user.role === "admin" ? "approved" : "pending",
      });

      return { success: true };
    }),

  deletePost: protectedProcedure
    .input(z.object({ postId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
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
      title: z.string().min(3).max(220),
      category: postCategorySchema,
      content: z.string().min(20).max(20000),
      mediaUrl: z.string().url().max(2000).optional().or(z.literal("")),
      mediaType: mediaTypeSchema.default("none"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
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
      await db.update(writingPosts).set({
        title: input.title.trim(),
        category: input.category,
        content: input.content.trim(),
        mediaUrl,
        mediaType,
        status: ctx.user.role === "admin" ? post.status : "pending",
      }).where(eq(writingPosts.id, input.postId));
      return { success: true };
    }),
  reactToPost: protectedProcedure
    .input(z.object({ postId: z.number().int().positive(), type: reactionTypeSchema }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
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
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const posts = await db
        .select()
        .from(writingPosts)
        .where(and(eq(writingPosts.id, input.postId), eq(writingPosts.status, "approved")))
        .limit(1);
      if (posts.length === 0) throw new Error("Post not found");

      await db.insert(writingComments).values({
        postId: input.postId,
        authorOpenId: ctx.user.openId,
        authorName: normalizeAuthorName(ctx.user.name),
        content: input.content.trim(),
        status: ctx.user.role === "admin" ? "approved" : "pending",
      });

      return { success: true };
    }),

  adminListPosts: adminProcedure
    .input(z.object({ status: postStatusSchema.or(z.literal("all")).default("pending") }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const query = db.select().from(writingPosts);
      const status = input?.status ?? "pending";
      const posts = status === "all"
        ? await query.orderBy(desc(writingPosts.createdAt)).limit(100)
        : await query.where(eq(writingPosts.status, status)).orderBy(desc(writingPosts.createdAt)).limit(100);

      return Promise.all(posts.map((post) => enrichPost(post)));
    }),

  adminUpdatePost: adminProcedure
    .input(z.object({
      postId: z.number().int().positive(),
      status: postStatusSchema.optional(),
      featured: z.boolean().optional(),
      boostedScore: z.number().int().min(0).max(100000).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const updateSet: Partial<typeof writingPosts.$inferInsert> = {};
      if (input.status !== undefined) updateSet.status = input.status;
      if (input.featured !== undefined) updateSet.featured = input.featured;
      if (input.boostedScore !== undefined) updateSet.boostedScore = input.boostedScore;

      await db.update(writingPosts).set(updateSet).where(eq(writingPosts.id, input.postId));
      return { success: true };
    }),

  adminListComments: adminProcedure
    .input(z.object({ status: commentStatusSchema.or(z.literal("all")).default("pending") }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const status = input?.status ?? "pending";
      const query = db.select().from(writingComments);
      return status === "all"
        ? query.orderBy(desc(writingComments.createdAt)).limit(100)
        : query.where(eq(writingComments.status, status)).orderBy(desc(writingComments.createdAt)).limit(100);
    }),

  adminUpdateComment: adminProcedure
    .input(z.object({ commentId: z.number().int().positive(), status: commentStatusSchema }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.update(writingComments).set({ status: input.status }).where(eq(writingComments.id, input.commentId));
      return { success: true };
    }),
});
