// app/blog/page.tsx  (server component)
import "server-only";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { db } from "../../src/server/db/client";
import { posts, users } from "../../src/server/db/schema";
import { desc, eq, and } from "drizzle-orm";
import CategoryFilter from "../../components/CategoryFilter";
import { fetchDistinctCategories } from "../../src/server/db/queries";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  noStore();

  const category = searchParams?.category?.trim();
  const categories = await fetchDistinctCategories();

  // Build the query conditionally
  const baseSelect = db
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
    .orderBy(desc(posts.publishedAt));

  const rows = category
    ? await baseSelect.where(eq(posts.category, category))
    : await baseSelect;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <CategoryFilter categories={categories} selected={category ?? null} targetPath="/blog" />
      </div>

      <ul className="mt-8 space-y-6">
        {rows.map((p) => (
          <li key={p.id} className="rounded-2xl border p-5">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/blog/${p.slug}`} className="text-xl font-medium hover:underline">
                {p.title}
              </Link>
              <Link
                href={`/blog?category=${encodeURIComponent(p.category ?? "")}`}
                className="text-xs px-2 py-1 rounded-full border hover:bg-accent"
              >
                {p.category ?? "uncategorized"}
              </Link>
            </div>

            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.content}</p>

            <div className="mt-4 text-xs text-muted-foreground flex items-center gap-3">
              <time dateTime={p.published ? new Date(p.published).toISOString() : ""}>
                {p.published ? new Date(p.published).toLocaleString() : "draft / not published"}
              </time>
              <span>·</span>
              <span>@{p.username ?? `author#${p.authorId}`}</span>
            </div>
          </li>
        ))}
      </ul>

      {rows.length === 0 && (
        <p className="mt-8 text-sm text-amber-600">
          No posts found{category ? ` in “${category}”` : ""}.
        </p>
      )}
    </main>
  );
}
