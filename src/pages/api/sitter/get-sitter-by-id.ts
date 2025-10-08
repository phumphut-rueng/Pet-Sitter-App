import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id, page = "1", limit = "5" } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ 
        message: "Invalid sitter ID",
        data: null 
      });
    }

    const sitterId = Number(id);
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));
    const offset = (pageNumber - 1) * limitNumber;

    // ดึงข้อมูล sitter พื้นฐานก่อน
    const sitter = await prisma.sitter.findUnique({
      where: { id: sitterId },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        profile_image: true,
      },
    },
  },
    });

    if (!sitter) {
      return res.status(404).json({ 
        message: "ไม่พบข้อมูล pet sitter",
        data: null
      });
    }

    // ดึงข้อมูลที่เกี่ยวข้องแยก
    const [sitterImages, sitterPetTypes, reviews, totalReviews] = await Promise.all([
      prisma.sitter_image.findMany({
        where: { sitter_id: sitterId }
      }),
      prisma.sitter_pet_type.findMany({
        where: { sitter_id: sitterId },
        include: { pet_type: true }
      }),
      prisma.review.findMany({
        where: { sitter_id: sitterId },
        orderBy: { created_at: "desc" },
        skip: offset,
        take: limitNumber,
        include: {
          user: {
            select: { id: true, name: true, profile_image: true }
          }
        }
      }),
      prisma.review.count({
        where: { sitter_id: sitterId }
      })
    ]);

    // คำนวณคะแนนเฉลี่ย
    const averageRating = totalReviews > 0 
      ? (await prisma.review.aggregate({
          where: { sitter_id: sitterId },
          _avg: { rating: true }
        }))._avg.rating || 0
      : 0;

    // Format results
    const formattedSitter = {
      ...sitter,
      owner: sitter.user,
      sitter_image: sitterImages,
      sitter_pet_type: sitterPetTypes,
      reviews,
      averageRating: Number(averageRating.toFixed(1)),
      reviewPagination: {
        page: pageNumber,
        limit: limitNumber,
        totalCount: totalReviews,
        totalPages: Math.ceil(totalReviews / limitNumber)
      }
    };

    return res.status(200).json({
      data: formattedSitter
    });
  } catch (error) {
    console.error("❌ Error fetching sitter by ID:", error);
    return res.status(500).json({ 
      message: "Error fetching sitter",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
