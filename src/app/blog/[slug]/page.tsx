import "server-only";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { db } from "../../../server/db/client";
import { posts, users } from "../../../server/db/schema";
import { eq } from "drizzle-orm";

type PostRow = {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string | null;
  published: Date | null;
  createdAt: Date | null;
  authorId: number;
  username: string | null;
};

async function getPost(slug: string): Promise<PostRow | null> {
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

// In Next 15, `params` is a Promise
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const row = await db
    .select({ title: posts.title })
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  if (row.length === 0) return { title: "Post not found" };
  return { title: row[0].title ?? "Post" };
}

// In Next 15, `params` is a Promise here too
export default async function PostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/blog" className="text-sm text-muted-foreground hover:underline">
        ← Back to blog
      </Link>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{post.title}</h1>

      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-3">
        <span>@{post.username ?? `author#${post.authorId}`}</span>
        <span>·</span>
        {/* Optional: move locale formatting to a tiny client component to avoid hydration drift */}
        <time suppressHydrationWarning dateTime={post.published ? post.published.toISOString() : ""}>
          {post.published ? post.published.toLocaleString() : "draft / not published"}
        </time>
        {post.category && (
          <>
            <span>·</span>
            <span className="px-2 py-0.5 rounded-full border">{post.category}</span>
          </>
        )}
      </div>

      <article className="prose prose-neutral dark:prose-invert mt-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </article>
    </main>
  );
}
