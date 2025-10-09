import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const raw = (req.query.ownerId ?? req.query.id) as string | string[] | undefined;
  const ownerId = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isFinite(ownerId)) {
    return res.status(400).json({ message: "Invalid owner id" });
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  const skip = (page - 1) * limit;

  try {
    const [items, total] = await Promise.all([
      prisma.pet.findMany({
        where: { owner_id: ownerId },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          pet_type: { select: { id: true, pet_type_name: true } },
        },
        // ✅ เลือกฟิลด์ที่ modal ต้องใช้ให้ครบ
        // (จริง ๆ ถ้าใช้ include pet_type อยู่แล้ว ไม่ต้อง select แยกเพิ่ม)
      }),
      prisma.pet.count({ where: { owner_id: ownerId } }),
    ]);

    return res.status(200).json({
      items: items.map((p) => ({
        id: p.id,
        name: p.name,
        // ฟิลด์ที่ modal ต้องใช้
        breed: p.breed ?? null,
        sex: p.sex ?? null,
        age_month: p.age_month ?? null,
        color: p.color ?? null,
        weight_kg: p.weight_kg ? Number(p.weight_kg) : null,
        about: p.about ?? null,

        image_url: p.image_url ?? null,
        is_banned: p.is_banned ?? null,
        created_at: p.created_at.toISOString(),

        pet_type_id: p.pet_type_id,
        pet_type_name: p.pet_type?.pet_type_name ?? null,
      })),
      page,
      limit,
      total,
    });
  } catch (e) {
    console.error("admin owner pets api error:", e);
    return res.status(500).json({ message: "Failed to load pets" });
  }
}