import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import fs from 'fs';
export default defineConfig({
  out: './src/server/drizzle',
  schema: './src/server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url:    process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false , 
            ca: fs.readFileSync("app/certs/ca.pem", "utf8"),
     },
  },
});
