import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";


/**
 * @openapi
 * /sitter/get-sitter-by-id:
 *   get:
 *     tags: [Sitter]
 *     summary: Get sitter detail by id (with paginated reviews)
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: Sitter ID
 *       - in: query
 *         name: page
 *         required: false
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Review page (1-based)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema: { type: integer, minimum: 1, default: 5 }
 *         description: Reviews per page
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *                   example:
 *                     id: 42
 *                     name: "Happy Paws"
 *                     phone: "0891112222"
 *                     user_sitter_id: 123
 *                     owner: { id: 123, name: "Jane", profile_image: "https://..." }
 *                     sitter_image: [{ id: 1, sitter_id: 42, image_url: "https://..." }]
 *                     sitter_pet_type: [{ pet_type: { id: 1, pet_type_name: "Dog" } }]
 *                     averageRating: 4.6
 *                     reviews: [
 *                       {
 *                         id: 9001,
 *                         rating: 5,
 *                         comment: "Great service",
 *                         created_at: "2025-10-20T10:00:00.000Z",
 *                         user: { id: 7, name: "Bob", profile_image: "https://..." }
 *                       }
 *                     ]
 *                     reviewPagination: { page: 1, limit: 5, totalCount: 12, totalPages: 3 }
 *       400:
 *         description: Invalid sitter ID
 *       404:
 *         description: Not found
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Error fetching sitter
 */


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
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
