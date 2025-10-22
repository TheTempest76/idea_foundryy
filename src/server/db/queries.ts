import "server-only";
import { db } from "./client";
import { posts,users } from "./schema";
import { asc, isNotNull, eq } from "drizzle-orm";
import { PostRow } from "../../types/main";
export async function fetchDistinctCategories(): Promise<string[]> {
  const rows = await db
    .select({ category: posts.category })
    .from(posts)
    .where(isNotNull(posts.category))
    .orderBy(asc(posts.category));

  return rows
    .map(r => r.category)
    .filter((c): c is string => !!c && c.trim().length > 0);
}
export async function getPost(slug: string): Promise<PostRow | null> {
  const [row] = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      content: posts.content,
      category: posts.category,
      published: posts.publishedAt,
      createdAt: posts.createdAt,
      authorId: posts.authorId,
      username: users.username,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.slug, slug))
    .limit(1);

  if (!row) return null;
  return {
    ...row,
    published: row.published ? new Date(row.published) : null,
    createdAt: row.createdAt ? new Date(row.createdAt) : null,
  };
}