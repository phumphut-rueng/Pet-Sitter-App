import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

type Body = { action: "ban" | "unban"; reason?: string };

async function getAdminUserIdFromRequest(req: NextApiRequest): Promise<number | null> {
  const id = Number(req.headers["x-user-id"]);
  return Number.isFinite(id) ? id : null;
}
async function getAdminIdByUserId(userId: number) {
  const admin = await prisma.admin.findUnique({ where: { user_id: userId } });
  return admin?.id ?? null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  const petId = Number(req.query.petId);
  if (!Number.isFinite(petId)) return res.status(400).json({ message: "Invalid pet id" });

  const { action, reason }: Body = req.body ?? {};
  if (action !== "ban" && action !== "unban") {
    return res.status(400).json({ message: "Invalid action" });
  }

  try {
    const adminUserId = await getAdminUserIdFromRequest(req);
    if (!adminUserId) return res.status(403).json({ message: "Forbidden" });
    const adminId = await getAdminIdByUserId(adminUserId); // อาจเป็น null ได้ (ยอมให้ผ่านถ้าอยาก)

    // ตรวจว่ามี pet จริงก่อน
    const existing = await prisma.pet.findUnique({
      where: { id: petId },
      select: {
        id: true,
        owner_id: true,
        is_banned: true,
        banned_at: true,
        ban_reason: true,
        name: true,
        image_url: true,
        breed: true,
        sex: true,
        age_month: true,
        color: true,
      },
    });
    if (!existing) return res.status(404).json({ message: "Pet not found" });

    const now = new Date();

    const updated = await prisma.pet.update({
      where: { id: petId },
      data:
        action === "ban"
          ? {
              // idempotent: กดซ้ำก็ยืนยันสถานะแบนอีกรอบ
              is_banned: true,
              banned_at: now,
              banned_by_admin_id: adminId ?? undefined,
              ban_reason: reason ?? null,
            }
          : {
              is_banned: false,
              banned_at: null,
              banned_by_admin_id: null,
              ban_reason: null,
            },
      select: {
        id: true,
        owner_id: true,
        is_banned: true,
        banned_at: true,
        ban_reason: true,
        name: true,
        image_url: true,
        breed: true,
        sex: true,
        age_month: true,
        color: true,
      },
    });

    return res.status(200).json({
      ok: true,
      pet: {
        ...updated,
        banned_at: updated.banned_at ? updated.banned_at.toISOString() : null,
      },
    });
  } catch (e: any) {
    console.error("ban/unban pet error:", e);
    // ถ้าอยากละเอียดกว่านี้ ตรวจ e.code ของ Prisma ได้ (เช่น P2025)
    return res.status(500).json({ message: "Operation failed" });
  }
}