// src/server/db/schema.ts
import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  timestamp,
  boolean,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";

// --- Enums ---
export const postStatusEnum = pgEnum("post_status", ["draft", "published"]);

// --- Tables ---
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    displayName: varchar("display_name", { length: 100 }),
    email: varchar("email", { length: 255 }).unique(),              // optional but handy
    bio: text("bio"),
    role: varchar("role", { length: 32 }).notNull().default("user"), // user | admin
    postsCount: integer("posts_count").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    idxUsersUsername: uniqueIndex("users_username_uq").on(table.username),
    idxUsersEmail: uniqueIndex("users_email_uq").on(table.email),
  })
);

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    authorId: integer("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    content: text("content").notNull(),
    excerpt: varchar("excerpt", { length: 512 }),                    // for cards/SEO
    category: varchar("category", { length: 100 }).notNull(),
    tags: text("tags").array(),                                      // text[] tags
    readingMinutes: integer("reading_minutes").notNull().default(3), // a quick hint
    coverImageUrl: varchar("cover_image_url", { length: 1024 }),
    status: postStatusEnum("status").notNull().default("published"),
    publishedAt: timestamp("published_at"),                          // null if draft
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    idxPostsAuthor: index("posts_author_idx").on(table.authorId),
    idxPostsCategory: index("posts_category_idx").on(table.category),
    idxPostsStatus: index("posts_status_idx").on(table.status),
    idxPostsPublishedAt: index("posts_published_at_idx").on(table.publishedAt),
  })
);
