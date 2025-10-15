import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const ownerId = Number(req.query.id);
  if (!Number.isFinite(ownerId)) {
    return res.status(400).json({ message: "Invalid owner id" });
  }

  try {
    const u = await prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        created_at: true,
        status: true,       
        suspended_at: true,
        suspend_reason: true,
        profile_image: true,
        profile_image_public_id: true,
        pets: {
          select: {
            id: true,
            name: true,
            breed: true,
            sex: true,
            age_month: true,
            color: true,
            image_url: true,
            created_at: true,
            is_banned: true,
            pet_type: { select: { pet_type_name: true } },
          },
        },
      },
    });

    if (!u) return res.status(404).json({ message: "Owner not found" });

    // ส่งเฉพาะฟิลด์ "ใหม่" ที่ FE จะใช้ต่อไป
    const payload = {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? null,
      profile_image: u.profile_image ?? null,
      profile_image_public_id: u.profile_image_public_id ?? null,
      created_at: u.created_at.toISOString(),

      // ✅ ฟิลด์สถานะแบบใหม่
      status: u.status as "normal" | "ban",
      banned_at: u.suspended_at ? u.suspended_at.toISOString() : null,
      ban_reason: u.suspend_reason ?? null,

      pets: u.pets.map((p) => ({
        id: p.id,
        name: p.name ?? null,
        breed: p.breed ?? null,
        sex: p.sex ?? null,
        age_month: p.age_month ?? null,
        color: p.color ?? null,
        image_url: p.image_url ?? null,
        created_at: p.created_at.toISOString(),
        is_banned: p.is_banned ?? null,
        pet_type_name: p.pet_type?.pet_type_name,
      })),
    };

    return res.status(200).json(payload);
  } catch {
    return res.status(500).json({ message: "Failed to load owner detail" });
  }
}