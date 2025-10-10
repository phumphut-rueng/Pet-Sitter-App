import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(200).json({ suggestions: [] });
    }

    const searchTerm = query.trim();

    if (searchTerm.length < 2) {
      return res.status(200).json({ suggestions: [] });
    }

    // ค้นหาทั้ง Pet Sitter Name และ Full Name โดยใช้ Prisma ORM
    const suggestions = await prisma.sitter.findMany({
      where: {
        AND: [
          {
            sitter_approval_status: {
              status_name: {
                not: 'Pending submission'
              }
            }
          },
          {
            OR: [
              {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              },
              {
                user: {
                  name: {
                    contains: searchTerm,
                    mode: 'insensitive'
                  }
                }
              }
            ]
          }
        ]
      },
      select: {
        name: true,
        user: {
          select: {
            name: true
          }
        }
      },
      take: 5,
      orderBy: [
        {
          name: 'asc'
        }
      ]
    });

    // Format results
    const formattedSuggestions = suggestions.map(sitter => {
      const results = [];

      // เพิ่ม Pet Sitter Name ถ้าตรงกับคำค้นหา
      if (sitter.name && sitter.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({
          sitterName: sitter.name,
          userName: sitter.user?.name || '',
          type: 'sitter'
        });
      }

      // เพิ่ม Full Name ถ้าตรงกับคำค้นหา
      if (sitter.user?.name &&
        sitter.user.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({
          sitterName: sitter.name || '',
          userName: sitter.user.name,
          type: 'user'
        });
      }

      return results;
    }).flat().slice(0, 5); // จำกัดไม่เกิน 5 รายการ

    return res.status(200).json({ suggestions: formattedSuggestions });
  } catch (error) {
    console.error("❌ Error fetching search suggestions:", error);
    return res.status(500).json({ message: "Error fetching search suggestions" });
  }
}
