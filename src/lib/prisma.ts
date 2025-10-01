// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// เก็บ prisma ไว้บน globalThis แบบ type-safe
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// สร้าง singleton
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // เปิด log ตอน dev เท่านั้น
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

// กันสร้างซ้ำตอน dev/hot-reload
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}