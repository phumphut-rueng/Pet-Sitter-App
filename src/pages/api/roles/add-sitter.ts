// src/pages/api/roles/add-sitter.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma"; // ให้ชัวร์ว่าไฟล์นี้มีจริง (หรือปรับเป็น relative path)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "unauthorized" });

  const userId = Number(session.user.id);

  const sitterRole = await prisma.role.findFirst({ where: { role_name: "sitter" } });
  if (!sitterRole) return res.status(500).json({ error: "role 'sitter' not found" });

  //  แบบ simple: หาอยู่ก่อน ถ้าไม่มีก็ค่อยสร้าง
  const existed = await prisma.user_role.findFirst({
    where: { user_id: userId, role_id: sitterRole.id },
    select: { id: true },
  });

  if (!existed) {
    await prisma.user_role.create({
      data: { user_id: userId, role_id: sitterRole.id },
    });
  }

  return res.json({ ok: true });
}