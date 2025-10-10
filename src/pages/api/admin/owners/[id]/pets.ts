import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const ownerId = Number(req.query.id);
  if (!Number.isFinite(ownerId)) return res.status(400).json({ message: "Invalid owner id" });

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  try {
    const [items, total] = await Promise.all([
      prisma.pet.findMany({
        where: { owner_id: ownerId },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: { pet_type: { select: { id: true, pet_type_name: true } } },
      }),
      prisma.pet.count({ where: { owner_id: ownerId } }),
    ]);

    return res.json({
      items: items.map(p => ({
        id: p.id,
        name: p.name,
        pet_type_id: p.pet_type_id,
        pet_type_name: p.pet_type?.pet_type_name ?? null,
        is_banned: Boolean(p.is_banned),
        image_url: p.image_url,
        created_at: p.created_at,
      })),
      page,
      limit,
      total,
    });
  } catch {
    return res.status(500).json({ message: "Failed to load pets" });
  }
}