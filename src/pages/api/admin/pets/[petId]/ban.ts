// src/pages/api/admin/pets/[petId]/ban.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

type Body = { action: "ban" | "unban"; reason?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const petId = Number(req.query.petId);
  if (!Number.isFinite(petId)) return res.status(400).json({ message: "Invalid pet id" });

  const { action, reason }: Body = req.body ?? {};
  if (action !== "ban" && action !== "unban") return res.status(400).json({ message: "Invalid action" });

  try {
    // ⛳️ adminId อาจเป็น null ได้ (ไม่บังคับ header)
    const adminUserId = Number(req.headers["x-user-id"]);
    const admin = Number.isFinite(adminUserId)
      ? await prisma.admin.findUnique({ where: { user_id: adminUserId } })
      : null;
    const adminId = admin?.id ?? null;

    if (action === "ban") {
      await prisma.pet.update({
        where: { id: petId },
        data: {
          is_banned: true,
          banned_at: new Date(),
          banned_by_admin_id: adminId ?? undefined,
          ban_reason: reason ?? null,
        },
      });
    } else {
      await prisma.pet.update({
        where: { id: petId },
        data: {
          is_banned: false,
          banned_at: null,
          banned_by_admin_id: null,
          ban_reason: null,
        },
      });
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Operation failed" });
  }
}