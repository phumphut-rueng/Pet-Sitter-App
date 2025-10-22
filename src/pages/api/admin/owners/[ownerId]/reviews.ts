import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { sendError, toInt, toPositiveInt } from "@/lib/api/api-utils";

/**
 * @openapi
 * /admin/owners/{ownerId}/reviews:
 *   get:
 *     tags: [Admin]
 *     summary: List reviews of an owner (admin)
 *     description: Return paginated reviews written for the specified owner, including sitter info and average rating.
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema: { type: integer }
 *         description: Owner ID
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-based)
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Items per page (max 50)
 *     responses:
 *       200:
 *         description: Reviews list with pagination meta and average rating
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminOwnerReviewsResponse'
 *       400:
 *         description: Invalid owner id
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal Server Error
 *     security:
 *       - cookieAuth: []
 *       - AdminApiKey: []
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return sendError(res, 405, "Method not allowed");
  }

  const ownerId = toPositiveInt(req.query.ownerId ?? req.query.id);
  if (!ownerId) return sendError(res, 400, "Invalid owner id");

  // pagination (ปลอดภัย + ค่าดีฟอลต์)
  const page = Math.max(1, toInt(req.query.page, 1));
  const pageSize = Math.min(50, Math.max(1, toInt(req.query.pageSize, 10)));
  const skip = (page - 1) * pageSize;

  try {
    const where = { user_id: ownerId };

    const [rows, total, agg] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          rating: true,
          comment: true,
          created_at: true,
          sitter: {
            select: {
              id: true,
              name: true,
              user: { select: { id: true, name: true, profile_image: true } },
            },
          },
        },
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({ where, _avg: { rating: true } }),
    ]);

    const data = rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment ?? "",
      createdAt: r.created_at.toISOString(),
      sitter: {
        id: r.sitter?.id ?? null,
        name: r.sitter?.user?.name ?? r.sitter?.name ?? "Pet Sitter",
        avatarUrl: r.sitter?.user?.profile_image ?? "",
        userId: r.sitter?.user?.id ?? null,
      },
    }));

    const avg = agg._avg.rating ?? 0;
    const averageRating = Math.round(avg * 100) / 100; // ทศนิยม 2 ตำแหน่ง (number)

    return res.status(200).json({
      data,
      meta: {
        page,
        pageSize,
        total,
        averageRating,
      },
    });
  } catch (e) {
    console.error("admin owner reviews api error:", e);
    return sendError(res, 500, "Internal Server Error");
  }
}