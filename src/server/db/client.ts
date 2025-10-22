// src/server/db/client.ts
import 'server-only';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

const ssl = /localhost|127\.0\.0\.1/i.test(url) ? undefined : 'require';

const client = postgres(url, { max: 1, ssl });
export const db = drizzle(client, { logger: true });
