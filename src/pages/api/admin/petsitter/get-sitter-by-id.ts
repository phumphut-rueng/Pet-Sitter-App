import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const { id } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid sitter ID" });
    }

    const sitterId = Number(id);

    // Query สำหรับดึงข้อมูล Pet Sitter โดย ID
    const mainQuery = `
      SELECT 
        s.*,
        s.service_description,
        u.name as user_name,
        u.email as user_email,
        u.dob as user_dob,
        u.profile_image as user_profile_image,
        s.approval_status_id,
        sas.status_name as approval_status,
        sas.description as status_description,
        COALESCE((
          SELECT AVG(r.rating)::numeric(3,2)
          FROM review r 
          WHERE r.sitter_id = s.id
        ), 0) as average_rating,
        (
          SELECT json_agg(
            json_build_object(
              'id', si.id,
              'image_url', si.image_url
            )
          )
          FROM sitter_image si 
          WHERE si.sitter_id = s.id
        ) as sitter_images,
        (
          SELECT json_agg(
            json_build_object(
              'pet_type_name', pt.pet_type_name
            )
          )
          FROM sitter_pet_type spt
          JOIN pet_type pt ON spt.pet_type_id = pt.id
          WHERE spt.sitter_id = s.id
        ) as pet_types
      FROM sitter s
      LEFT JOIN "user" u ON s.user_sitter_id = u.id
      LEFT JOIN sitter_approval_status sas ON s.approval_status_id = sas.id
      WHERE s.id = $1 AND sas.status_name != 'Pending submission'
    `;

    const result = await prisma.$queryRawUnsafe(mainQuery, sitterId);
    const sitters = result as Record<string, unknown>[];

    if (sitters.length === 0) {
      return res.status(404).json({ message: "Pet Sitter not found" });
    }

    const sitter = sitters[0];

    // Format result
    const formattedResult = {
      ...sitter,
      sitter_image: sitter.sitter_images || [],
      sitter_pet_type: ((sitter.pet_types as Record<string, unknown>[]) || []).map((pt: Record<string, unknown>) => ({
        pet_type: { pet_type_name: pt.pet_type_name }
      })),
      averageRating: Number(sitter.average_rating) || 0
    };

    return res.status(200).json(formattedResult);
  } catch (error) {
    console.error("❌ Error fetching sitter detail:", error);
    return res.status(500).json({ message: "Error fetching sitter detail" });
  }
}
