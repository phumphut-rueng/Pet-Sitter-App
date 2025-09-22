import { PrismaClient } from "@prisma/client";

declare global {
  // เพิ่ม property prisma ให้ NodeJS global object
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"], // optional ดู query ที่รัน
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;