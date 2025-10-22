// app/blog/page.tsx
import 'server-only';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';
import { db } from '../../src/server/db/client';
import { posts, users } from '../../src/server/db/schema';
import { desc, eq } from 'drizzle-orm';

type Row = {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string | null;
  published: Date | null;
  createdAt: Date | null;
  authorId: number;
  username?: string | null;
};


async function getPosts(): Promise<Row[]> {
  const rows = await db
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


  return rows.map((r) => ({
    ...r,
    published: r.published ? new Date(r.published) : null,
    createdAt: r.createdAt ? new Date(r.createdAt) : null,
  }));
}

export default async function BlogPage() {
  const rows = await getPosts();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>

      
      <ul className="mt-8 space-y-6">
        {rows.map((p) => (
          <li key={p.id} className="rounded-2xl border p-5">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/blog/${p.slug}`} className="text-xl font-medium hover:underline">
                {p.title}
              </Link>
              <span className="text-xs px-2 py-1 rounded-full border">
                {p.category ?? 'uncategorized'}
              </span>
            </div>

            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.content}</p>

            <div className="mt-4 text-xs text-muted-foreground flex items-center gap-3">
              <time dateTime={p.published ? p.published.toISOString() : ''}>
                {p.published ? p.published.toLocaleString() : 'draft / not published'}
              </time>
              <span>·</span>
              <span>@{p.username ?? `author#${p.authorId}`}</span>
            </div>
          </li>
        ))}
      </ul>

      {rows.length === 0 && (
        <p className="mt-8 text-sm text-amber-600">
          No rows found. If you ran the seed, confirm this page’s DB hint matches the DB you seeded.
          Restart <code>next dev</code> after editing <code>.env</code>.
        </p>
      )}
    </main>
  );
}
