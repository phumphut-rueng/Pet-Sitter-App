import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

// รองรับทั้ง /owners/[ownerId]/reviews และ fallback ?id=
function parseOwnerId(q: NextApiRequest["query"]): number {
  const raw = (q.ownerId ?? q.id) as string | string[] | undefined;
  const v = Array.isArray(raw) ? raw[0] : raw;
  return Number(v);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const ownerId = parseOwnerId(req.query);
  if (!Number.isFinite(ownerId)) {
    return res.status(400).json({ message: "Invalid owner id" });
  }

  // pagination (ปลอดภัยและมี default)
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));
  const skip = (page - 1) * pageSize;

  try {
    // ดึงรีวิวของ owner (user_id คือ id ของ owner ที่ถูกรีวิว)
    const [rows, total, agg] = await Promise.all([
      prisma.review.findMany({
        where: { user_id: ownerId },
        orderBy: { created_at: "desc" },
        include: {
          sitter: {
            include: {
              user: { select: { id: true, name: true, profile_image: true } },
            },
          },
        },
        skip,
        take: pageSize,
      }),
      prisma.review.count({ where: { user_id: ownerId } }),
      prisma.review.aggregate({
        where: { user_id: ownerId },
        _avg: { rating: true },
      }),
    ]);

    const data = rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment ?? "",
      createdAt: r.created_at.toISOString(),
      sitter: {
        id: r.sitter.id,
        name: r.sitter.user?.name ?? r.sitter.name ?? "Pet Sitter",
        avatarUrl: r.sitter.user?.profile_image ?? "",
        userId: r.sitter.user?.id ?? null,
      },
    }));

    return res.status(200).json({
      data,
      meta: {
        page,
        pageSize,
        total,
        averageRating: Number(agg._avg.rating ?? 0).toFixed(2),
      },
    });
  } catch (e) {
    console.error("admin owner reviews api error:", e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}