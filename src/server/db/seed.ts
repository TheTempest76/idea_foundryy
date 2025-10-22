import fs from 'node:fs';
import path from 'node:path';
import { config as dotenvConfig } from 'dotenv';

// Find the nearest .env walking up from current file (robust if run from subdirs)
function findDotEnv(startDir: string) {
  let dir = startDir;
  const { root } = path.parse(dir);
  while (true) {
    const p = path.join(dir, '.env');
    if (fs.existsSync(p)) return p;
    if (dir === root) return null;
    dir = path.dirname(dir);
  }
}

// __dirname works after TS compile; for tsx it’s set too.
const envPath = findDotEnv(__dirname) ?? path.join(process.cwd(), '.env');
dotenvConfig({ path: envPath });


// src/server/db/seed.ts
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, inArray, sql } from 'drizzle-orm';

import { users, posts } from './schema';

// ---------- helpers ----------
function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function envOrThrow(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

// ---------- connection ----------
const DATABASE_URL = envOrThrow('DATABASE_URL');

// If you're on Neon/Vercel/etc., you likely need SSL; localhost typically doesn't.
const ssl =
  /localhost|127\.0\.0\.1/i.test(DATABASE_URL) ? false : 'require';

const client = postgres(DATABASE_URL, {
  max: 1,
  ssl,
});
const db = drizzle(client, { logger: true });

// ---------- data you want to seed ----------
const seedUsers: { username: string }[] = [
  { username: 'sujan' },
  { username: 'joyce' },
  { username: 'indu' },
  { username: 'guest' },
];

const seedPosts: Array<{
  title: string;
  content: string;
  authorUsername: string;
  category: string;
  published?: Date | null;
}> = [
  {
    title: 'Hello, Drizzle + tRPC + Next.js',
    content:
      'This is a starter post proving the end-to-end pipeline is wired correctly.',
    authorUsername: 'sujan',
    category: 'dev',
  },
  {
    title: 'Why type-safe SQL is underrated',
    content:
      'Type-safety prevents entire classes of runtime bugs in your backend.',
    authorUsername: 'joyce',
    category: 'engineering',
  },
  {
    title: 'Publishing flow checklist',
    content:
      'Draft → Review → Final copy → Publish → Share to socials → Monitor analytics.',
    authorUsername: 'indu',
    category: 'product',
  },
  {
    title: 'Guest note: minimal blogging stack',
    content:
      'Next.js App Router, tRPC, Drizzle ORM, Postgres. Add Tailwind + MDX for comfort.',
    authorUsername: 'guest',
    category: 'notes',
  },
];

// ---------- preflight guard ----------
async function assertSchemaGuards() {
  // Fast-fail if someone forgot to run migrations that add "category"
  // (error code was 42703: column posts.category does not exist)
  try {
    // Touch the column once; if it doesn't exist, this will throw immediately.
    await db.select({ _probe: posts.category }).from(posts).limit(1);
  } catch (e: any) {
    throw new Error(
      'Schema guard failed: "posts.category" is missing in the database.\n' +
        '→ Run your migrations that add the column (or apply the ALTER TABLE), then re-run seed.\n' +
        `Original: ${e?.message ?? e}`
    );
  }
}

// ---------- main seed ----------
async function main() {
  await assertSchemaGuards();

  await db.transaction(async (tx) => {
    // 1) Upsert users by username (unique)
    await tx
      .insert(users)
      .values(seedUsers)
      .onConflictDoNothing({ target: users.username });

    // fetch ids for mapping username -> id
    const usernames = seedUsers.map((u) => u.username);
    const existingUsers = await tx
      .select({
        id: users.id,
        username: users.username,
      })
      .from(users)
      .where(inArray(users.username, usernames));

    const idByUsername = new Map(existingUsers.map((u) => [u.username, u.id]));

    // 2) Prepare posts with authorId + slug
    const now = new Date();
    type PostInsert = {
      authorId: number;
      title: string;
      slug: string;
      content: string;
      category: string;
      published: Date | null;
    };
    const postRows = seedPosts
      .map((p) => {
        const authorId = idByUsername.get(p.authorUsername);
        if (!authorId) return null;
        const slug = slugify(p.title);
        return {
          authorId,
          title: p.title,
          slug,
          content: p.content,
          category: p.category.slice(0, 100),
          published: p.published ?? now, // respects your default, but we set explicitly
          // createdAt will use defaultNow()
        } as PostInsert;
      })
      .filter((x): x is PostInsert => x !== null);

    if (postRows.length > 0) {
      // 3) Upsert posts by slug (unique)
      await tx
        .insert(posts)
        .values(postRows)
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
    }

    // 4) Recompute users.posts_count from posts
    await tx.execute(sql`
      UPDATE "users" u
      SET "posts_count" = COALESCE(p.cnt, 0)
      FROM (
        SELECT "author_id", COUNT(*)::int AS cnt
        FROM "posts"
        GROUP BY "author_id"
      ) p
      WHERE u."id" = p."author_id";
    `);

    // Make sure users with zero posts are set to 0 (if they weren't in the subquery)
    await tx.execute(sql`
      UPDATE "users" u
      SET "posts_count" = 0
      WHERE NOT EXISTS (
        SELECT 1 FROM "posts" p WHERE p."author_id" = u."id"
      );
    `);
  });

  console.log('✅ Seed completed successfully.');
}

// ---------- run ----------
main()
  .catch((err) => {
    console.error('❌ Seed failed:\n', err);
    process.exit(1);
  })
  .finally(async () => {
    await client.end({ timeout: 5 });
  });
