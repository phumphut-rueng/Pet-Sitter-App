import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { sitterId, page = "1", limit = "5" } = req.query;

      if (!sitterId || isNaN(Number(sitterId))) {
        return res.status(400).json({ message: "Invalid sitter ID" });
      }

      const id = Number(sitterId);
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.max(1, Number(limit));
      const offset = (pageNum - 1) * limitNum;

      const [reviews, totalReviews] = await Promise.all([
        prisma.review.findMany({
          where: { sitter_id: id },
          orderBy: { created_at: "desc" },
          skip: offset,
          take: limitNum,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_image: true,
              },
            },
          },
        }),
        prisma.review.count({
          where: { sitter_id: id },
        }),
      ]);

      const totalPages = Math.ceil(totalReviews / limitNum);

      return res.status(200).json({
        data: reviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRecords: totalReviews,
          totalPages,
        },
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { reviewId } = req.query;

      if (!reviewId || isNaN(Number(reviewId))) {
        return res.status(400).json({ message: "Invalid review ID" });
      }

      const id = Number(reviewId);

      await prisma.review.delete({
        where: { id },
      });

      return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "DELETE"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
