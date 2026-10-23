import { PrismaClient } from "@prisma/client";

// Giữ một client duy nhất khi Next.js hot-reload ở chế độ dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
