import "server-only";
import { db } from "./client";
import { posts,users } from "./schema";
import { asc, isNotNull, eq } from "drizzle-orm";
import { PostRow } from "../../types/main";
export async function fetchDistinctCategories(): Promise<string[]> {
  try {
    const rows = await db
      .select({ category: posts.category })
      .from(posts)
      .where(isNotNull(posts.category))
      .groupBy(posts.category)             // ✅ dedupe categories
      .orderBy(asc(posts.category));

    return rows
      .map((r) => r.category)
      .filter((c): c is string => !!c && c.trim().length > 0);
  } catch (e: any) {
    // If the column doesn't exist in this DB, don't explode the page.
    const msg = String(e?.message ?? e);
    const code = e?.code ?? e?.original?.code;
    if (code === "42703" || /column .*category.* does not exist/i.test(msg)) {
      console.error(
        'fetchDistinctCategories(): "posts.category" is missing in this database. ' +
        "Run the migration that adds it (or apply the ALTER TABLE)."
      );
      return []; 
    }
    throw e;
  }
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