import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js loads .env.local automatically; the Prisma CLI runs outside Next.js
// so we load it explicitly here to keep a single source of truth for secrets.
config({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
