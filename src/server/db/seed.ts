import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users, posts } from './schema';

// Load environment variables (make sure DATABASE_URL is set)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // or use your Aiven CA config
});

const db = drizzle(pool);

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear tables (optional — for development)
    await db.delete(posts);
    await db.delete(users);

    // Insert sample users
    const insertedUsers = await db
      .insert(users)
      .values([
        { username: 'alice' },
        { username: 'bob' },
        { username: 'charlie' },
      ])
      .returning({ id: users.id, username: users.username });

    console.log('✅ Users inserted:', insertedUsers);

    // Insert posts for each user
    const insertedPosts = await db
      .insert(posts)
      .values([
        {
          authorId: insertedUsers[0].id,
          title: 'Welcome to Idea Foundry',
          slug: 'welcome-idea-foundry',
          content: 'This is the very first post on our multi-user blog!',
          category: 'Introduction',
        },
        {
          authorId: insertedUsers[1].id,
          title: 'Drizzle ORM Tips',
          slug: 'drizzle-orm-tips',
          content: 'Here’s how to make your workflow smoother with Drizzle ORM.',
          category: 'Development',
        },
        {
          authorId: insertedUsers[2].id,
          title: 'Next.js + PostgreSQL Setup Guide',
          slug: 'nextjs-postgresql-setup',
          content: 'Learn how to set up Next.js with Drizzle and PostgreSQL.',
          category: 'Development',
        },
      ])
      .returning({ id: posts.id, title: posts.title });

    console.log('✅ Posts inserted:', insertedPosts);
    console.log('🌿 Seeding completed successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
