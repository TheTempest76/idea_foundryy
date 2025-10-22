// app/blog/[slug]/page.tsx
import "server-only";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
import CategoryFilter from "../../../components/CategoryFilter";
import { fetchDistinctCategories } from "../../../src/server/db/queries";

import { notFound } from "next/navigation";
import { db } from "../../../src/server/db/client";
import { posts, users } from "../../../src/server/db/schema";
import { eq } from "drizzle-orm";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { PostRow } from "../../../src/types/main";


export async function generateMetadata({ params }: { params: { slug: string } }) {
  const row = await db
    .select({ title: posts.title })
    .from(posts)
    .where(eq(posts.slug, params.slug))
    .limit(1);
  if (row.length === 0) return { title: "Post not found" };
  return { title: row[0].title };
}

async function getPost(slug: string): Promise<PostRow | null> {
  const [row] = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      content: posts.content,
      category: posts.category,
      published: posts. publishedAt,
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

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const categories = await fetchDistinctCategories();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/blog" className="text-sm text-muted-foreground hover:underline">
        ← Back to blog
      </Link>

      <div className="mt-3 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>

        {/* 🔽 Reusable category filter, points to /blog by default */}
        <CategoryFilter
          categories={categories}
          selected={post.category}
          targetPath="/blog"
        />
      </div>

      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-3">
        <span>@{post.username ?? `author#${post.authorId}`}</span>
        <span>·</span>
        <time dateTime={post.published ? post.published.toISOString() : ""}>
          {post.published ? post.published.toLocaleString() : "draft / not published"}
        </time>
        {post.category && (
          <>
            <span>·</span>
            <Link
              href={`/blog?category=${encodeURIComponent(post.category)}`}
              className="px-2 py-0.5 rounded-full border hover:bg-accent"
            >
              {post.category}
            </Link>
          </>
        )}
      </div>

      <article className="prose prose-neutral dark:prose-invert mt-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </article>
    </main>
  );
}
