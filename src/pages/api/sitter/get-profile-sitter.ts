import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";
import { Prisma } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        email: true, 
        phone: true, 
        name: true, 
        profile_image: true,
        approval_status_id: true,
        sitter_approval_status: {
          select: {
            status_name: true
          }
        }
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const sitter = await prisma.sitter.findFirst({
      where: { user_sitter_id: user.id },
      include: {
        sitter_image: true,
        sitter_pet_type: { include: { pet_type: true } },
        sitter_approval_status: true,
      },
    }) as Prisma.sitterGetPayload<{
      include: {
        sitter_image: true;
        sitter_pet_type: { include: { pet_type: true } };
      };
    }>;

    if (!sitter) {
      return res.status(200).json({ 
        exists: false, 
        user: {
          ...user,
          sitter_approval_status: user.sitter_approval_status
        }, 
        sitter: null 
      });
    }

    return res.status(200).json({
      exists: true,
      user,
      sitter: {
        id: sitter.id,
        name: sitter.name,
        phone: sitter.phone,
        experience: sitter.experience,
        introduction: sitter.introduction,
        location_description: sitter.location_description,
        service_description: sitter.service_description,
        address_detail: sitter.address_detail,
        address_province: sitter.address_province,
        address_district: sitter.address_district,
        address_sub_district: sitter.address_sub_district,
        address_post_code: sitter.address_post_code,
        admin_note: sitter.admin_note,
        latitude: sitter.latitude,
        longitude: sitter.longitude,
        images: sitter.sitter_image.map((i) => i.image_url),
        petTypes: sitter.sitter_pet_type.map((sp) => ({
          id: sp.pet_type_id,
          name: sp.pet_type.pet_type_name,
        })),
      },
    });
  } catch (error) {
    console.error("get-sitter error:", error);
    return res.status(500).json({ message: "Server error while fetching sitter" });
  }
}
