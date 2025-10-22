// src/server/trpc/routers/app.ts
import { router, publicProcedure } from "../trpc";
import db from "../index";
import { posts, users } from "../db/schema";
import { z } from "zod";
import {
  and,
  or,
  eq,
  ilike,
  desc,
  asc,
  isNull,
  sql,
} from "drizzle-orm";

const paginationInput = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  order: z.enum(["new", "old"]).default("new"),
  category: z.string().min(1).optional(),
  tag: z.string().min(1).optional(),
  authorId: z.number().int().optional(),
  authorUsername: z.string().min(1).optional(),
  q: z.string().min(1).optional(), // simple search
});

export const appRouter = router({
  /**
   * Public feed: published posts only
   * - pagination
   * - filters: category, tag, author
   * - search: title/excerpt/content
   * - order: publishedAt desc/asc
   */
  getAllPosts: publicProcedure
    .input(paginationInput.optional())
    .query(async ({ input }) => {
      const {
        page = 1,
        pageSize = 10,
        order = "new",
        category,
        tag,
        authorId,
        authorUsername,
        q,
      } = input ?? {};

      const where = and(
        // published posts only
        eq(posts.status, "published"),
        // publishedAt not null (safety)
        sql<boolean>`${posts.publishedAt} IS NOT NULL`,
        category ? eq(posts.category, category) : undefined,
        tag ? sql<boolean>`${tag} = ANY(${posts.tags})` : undefined,
        authorId ? eq(posts.authorId, authorId) : undefined,
        authorUsername ? eq(users.username, authorUsername) : undefined,
        q
          ? or(
              ilike(posts.title, `%${q}%`),
              ilike(posts.excerpt, `%${q}%`),
              ilike(posts.content, `%${q}%`)
            )
          : undefined
      );

      const orderBy =
        order === "new"
          ? [desc(posts.publishedAt), desc(posts.createdAt)]
          : [asc(posts.publishedAt), asc(posts.createdAt)];

      const offset = (page - 1) * pageSize;

      // main query
      const rows = await db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          category: posts.category,
          tags: posts.tags,
          readingMinutes: posts.readingMinutes,
          coverImageUrl: posts.coverImageUrl,
          publishedAt: posts.publishedAt,
          createdAt: posts.createdAt,
          authorId: posts.authorId,
          authorUsername: users.username,
          authorDisplayName: users.displayName,
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(where)
        .orderBy(...orderBy)
        .limit(pageSize)
        .offset(offset);

      // total count for pagination
      const [{ count }] = (await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(where)) as { count: number }[];

      return {
        data: rows,
        pagination: {
          page,
          pageSize,
          total: Number(count),
          totalPages: Math.max(1, Math.ceil(Number(count) / pageSize)),
        },
      };
    }),

  /**
   * Public: get a single post by slug (published only)
   */
  getPostBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const row = await db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          content: posts.content,
          excerpt: posts.excerpt,
          category: posts.category,
          tags: posts.tags,
          readingMinutes: posts.readingMinutes,
          coverImageUrl: posts.coverImageUrl,
          status: posts.status,
          publishedAt: posts.publishedAt,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          authorId: posts.authorId,
          authorUsername: users.username,
          authorDisplayName: users.displayName,
          authorBio: users.bio,
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(and(eq(posts.slug, input.slug), eq(posts.status, "published")))
        .limit(1);

      return row[0] ?? null;
    }),

  /**
   * Public: lightweight list for sitemaps or cards
   */
  getSitemapPosts: publicProcedure
    .query(async () => {
      const rows = await db
        .select({
          slug: posts.slug,
          publishedAt: posts.publishedAt,
          updatedAt: posts.updatedAt,
          category: posts.category,
        })
        .from(posts)
        .where(and(eq(posts.status, "published"), sql`${posts.publishedAt} IS NOT NULL`))
        .orderBy(desc(posts.publishedAt));

      return rows;
    }),

  /**
   * Public: list authors with counts (active only)
   */
  getAllAuthors: publicProcedure.query(async () => {
    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        bio: users.bio,
        postsCount: users.postsCount,
      })
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(desc(users.postsCount), asc(users.username));

    return rows;
  }),

  /**
   * Public: related posts by tags/category (published only)
   */
  getRelatedPosts: publicProcedure
    .input(z.object({ slug: z.string().min(1), limit: z.number().int().min(1).max(10).default(4) }))
    .query(async ({ input }) => {
      // 1) Fetch the source post
      const base = await db
        .select({
          id: posts.id,
          slug: posts.slug,
          tags: posts.tags,
          category: posts.category,
        })
        .from(posts)
        .where(eq(posts.slug, input.slug))
        .limit(1);

      if (!base[0]) return [];

      const { id: baseId, tags: baseTags, category } = base[0];

      // 2) Find related by overlapping tags OR same category, excluding itself
      const where = and(
        eq(posts.status, "published"),
        sql`${posts.publishedAt} IS NOT NULL`,
        sql`(${posts.id} <> ${baseId})`,
        or(
          baseTags && baseTags.length > 0
            ? sql<boolean>`${posts.tags} && ${baseTags}` // array overlap
            : undefined,
          category ? eq(posts.category, category) : undefined
        )
      );

      const rows = await db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          coverImageUrl: posts.coverImageUrl,
          publishedAt: posts.publishedAt,
          readingMinutes: posts.readingMinutes,
        })
        .from(posts)
        .where(where)
        .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
        .limit(input.limit);

      return rows;
    }),
});

export type AppRouter = typeof appRouter;
