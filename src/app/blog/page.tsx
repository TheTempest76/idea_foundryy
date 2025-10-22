import "server-only";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { db } from "../../server/db/client";
import { posts, users } from "../../server/db/schema";
import { desc, eq, and } from "drizzle-orm";
import CategoryFilter from "../../../components/CategoryFilter";
import { fetchDistinctCategories } from "../../server/db/queries";
import { ArrowBigLeft } from "lucide-react";
export default async function BlogPage(
  { searchParams }: { searchParams: Promise<{ category?: string }> }
) {
  noStore();

  const { category } = await searchParams;
  const categories = await fetchDistinctCategories();

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
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded border hover:bg-accent">
          <ArrowBigLeft className="h-4 w-4" />
          Back
        </Link>
      </div>
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
