import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ 
        message: "Invalid sitter ID",
        data: null 
      });
    }

    const sitterId = Number(id);

    // ดึงข้อมูล sitter พื้นฐานก่อน
    const sitter = await prisma.sitter.findUnique({
      where: {
        id: sitterId
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    if (!sitter) {
      return res.status(404).json({ 
        message: "ไม่พบข้อมูล pet sitter",
        data: null
      });
    }

    // ดึงข้อมูลที่เกี่ยวข้องแยก
    const [sitterImages, sitterPetTypes, reviews] = await Promise.all([
      prisma.sitter_image.findMany({
        where: { sitter_id: sitterId }
      }),
      prisma.sitter_pet_type.findMany({
        where: { sitter_id: sitterId },
        include: { pet_type: true }
      }),
      prisma.review.findMany({
        where: { sitter_id: sitterId },
        orderBy: { created_at: 'desc' }
      })
    ]);

    // คำนวณคะแนนเฉลี่ย
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    // Format results
    const formattedSitter = {
      ...sitter,
      sitter_image: sitterImages,
      sitter_pet_type: sitterPetTypes,
      reviews: reviews,
      averageRating: Number(averageRating.toFixed(1))
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
