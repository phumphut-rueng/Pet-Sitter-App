import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const ownerId = Number(req.query.id);
  if (!Number.isFinite(ownerId)) return res.status(400).json({ message: "Invalid owner id" });

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  try {
    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where: { user_id: ownerId },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: { sitter: { select: { id: true, name: true } } },
      }),
      prisma.review.count({ where: { user_id: ownerId } }),
    ]);

    return res.json({
      items: items.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        sitter: r.sitter ? { id: r.sitter.id, name: r.sitter.name } : null,
      })),
      page,
      limit,
      total,
    });
  } catch {
    return res.status(500).json({ message: "Failed to load reviews" });
  }
}