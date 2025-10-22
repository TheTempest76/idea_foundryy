// app/blog/new/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "../../server/db/client";
import { posts, users } from "../../server/db/schema";
import { eq, sql } from "drizzle-orm";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function ensureUniqueSlug(base: string) {
  let slug = base || "post";
  let i = 1;
  while (true) {
    const [found] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);
    if (!found) return slug;
    i += 1;
    slug = `${base}-${i}`;
  }
}

async function getAuthorId(authorUsername: string | null | undefined) {
  const username = (authorUsername || "guest").trim();
  const [u] = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
  if (u) return u.id;

  // Fallback to any existing user
  const [any] = await db.select({ id: users.id }).from(users).limit(1);
  if (any) return any.id;

  throw new Error("No users found. Please run seed first.");
}

export async function createPost(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const rawSlug = String(formData.get("slug") || "");
  const category = String(formData.get("category") || "uncategorized").slice(0, 100).trim();
  const content = String(formData.get("content") || "").trim();
  const authorUsername = String(formData.get("authorUsername") || "guest").trim();

  if (!title || !content) {
    return { ok: false, error: "Title and content are required." };
  }

  const authorId = await getAuthorId(authorUsername);
  const baseSlug = slugify(rawSlug || title);
  const slug = await ensureUniqueSlug(baseSlug);

  await db
    .insert(posts)
    .values({
      title,
      slug,
      category,
      content,
      authorId,
      publishedAt: new Date(), // publish immediately; remove if you want drafts
    })
    .onConflictDoUpdate({
      target: posts.slug,
      set: {
        title: sql`excluded.title`,
        content: sql`excluded.content`,
        category: sql`excluded.category`,
        authorId: sql`excluded.author_id`,
        publishedAt: sql`excluded.published_at`,
      },
    });

  // update users.posts_count (cheap + safe)
  await db.execute(sql`
    UPDATE "users" u
    SET "posts_count" = COALESCE(p.cnt, 0)
    FROM (SELECT "author_id", COUNT(*)::int AS cnt FROM "posts" GROUP BY "author_id") p
    WHERE u."id" = p."author_id"
  `);

  revalidatePath("/blog");
  redirect(`/blog/${slug}`);
}
