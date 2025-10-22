import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

/**
 * @openapi
 * /sitter/post-sitter:
 *   post:
 *     tags: [Sitter]
 *     summary: Create a pet sitter profile
 *     description: Create a sitter with images and supported pet types.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_sitter_id
 *               - name
 *               - phone
 *               - address_province
 *               - address_district
 *             properties:
 *               user_sitter_id:
 *                 type: integer
 *                 example: 123
 *               name:
 *                 type: string
 *                 example: "Happy Paws"
 *               location_description:
 *                 type: string
 *                 nullable: true
 *                 example: "Near Central Plaza"
 *               phone:
 *                 type: string
 *                 example: "0812345678"
 *               experience:
 *                 type: number
 *                 example: 3
 *               introduction:
 *                 type: string
 *                 nullable: true
 *                 example: "I love dogs and cats."
 *               address_detail:
 *                 type: string
 *                 nullable: true
 *                 example: "123/45 Moo 6"
 *               address_province:
 *                 type: string
 *                 example: "Bangkok"
 *               address_district:
 *                 type: string
 *                 example: "Bang Kapi"
 *               address_sub_district:
 *                 type: string
 *                 nullable: true
 *                 example: "Hua Mak"
 *               address_post_code:
 *                 type: string
 *                 nullable: true
 *                 example: "10240"
 *               base_price:
 *                 type: number
 *                 nullable: true
 *                 example: 500
 *               images:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["https://cdn.example.com/sitter/1.jpg","https://cdn.example.com/sitter/2.jpg"]
 *               petTypeIds:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [1,2]
 *     responses:
 *       201:
 *         description: Sitter created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       400:
 *         description: Bad request
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Error creating sitter
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
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
