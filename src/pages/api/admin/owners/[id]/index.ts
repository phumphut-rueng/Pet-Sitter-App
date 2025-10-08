import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const ownerId = Number(req.query.id);
  if (!Number.isFinite(ownerId)) return res.status(400).json({ message: "Invalid owner id" });

  try {
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        suspended_at: true,
        suspend_reason: true,
        pets: { select: { id: true, is_banned: true } },
      },
    });
    if (!owner) return res.status(404).json({ message: "Owner not found" });

    const petTotal = owner.pets.length;
    const petBanned = owner.pets.filter(p => Boolean(p.is_banned)).length;

    return res.json({
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        status: owner.status,                      // ACTIVE | SUSPENDED
        suspended_at: owner.suspended_at,          // Date | null
        suspend_reason: owner.suspend_reason ?? null,
      },
      stats: {
        pet_total: petTotal,
        pet_banned: petBanned,
      },
    });
  } catch {
    return res.status(500).json({ message: "Failed to load owner detail" });
  }
}