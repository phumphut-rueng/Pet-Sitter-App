import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const data = req.body;

    const sitter = await prisma.sitter.create({
      data: {
        user_sitter_id: data.user_sitter_id,
        name: data.name,
        location_description: data.location_description,
        phone: data.phone,
        experience: data.experience,
        introduction: data.introduction,
        address_detail: data.address_detail,
        address_province: data.address_province,
        address_district: data.address_district,
        address_sub_district: data.address_sub_district,
        address_post_code: data.address_post_code,
        base_price: data.base_price,
        sitter_image: {
          create: data.images?.map((url: string) => ({
            image_url: url,
          })) || [],
        },
        sitter_pet_type: {
          create: data.petTypeIds?.map((id: number) => ({
            pet_type: { connect: { id } },
          })) || [],
        },
      },
      include: {
        sitter_image: true,
        sitter_pet_type: { include: { pet_type: true } },
      },
    });


    return res.status(201).json(sitter);
  } catch (error) {
    console.error("❌ Error creating sitter:", error);
    return res.status(500).json({ message: "Error creating sitter" });
  }
}
