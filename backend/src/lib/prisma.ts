import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Always store on globalThis so the same client is reused across invocations
// within the same serverless instance (connection pool is preserved).
globalForPrisma.prisma = prisma;
