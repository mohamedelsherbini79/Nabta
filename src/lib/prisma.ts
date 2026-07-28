import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var prismaClient: PrismaClient | undefined;
}

function createPrismaClient() {
  // The local `npx prisma dev` proxy corrupts its unnamed prepared statements
  // when multiple physical connections are used concurrently (Next.js renders
  // Header + page Server Components concurrently, each issuing Prisma queries).
  // Capping the pool to a single connection serializes all queries and avoids
  // it. Real pooled Postgres in production doesn't have this bug, so this is
  // dev-only.
  const isProd = process.env.NODE_ENV === "production";
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ...(isProd ? {} : { max: 1 }),
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaClient = prisma;
}
