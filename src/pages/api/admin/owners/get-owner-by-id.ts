import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import type { OwnerDetail } from "@/types/admin/owners";

const prisma = new PrismaClient();
const OWNER_ROLE_NAMES = ["Owner", "pet_owner", "OWNER", "PET_OWNER"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OwnerDetail | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const id = parseInt(String(req.query.id), 10);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // ต้องเป็น user ที่มี role owner/pet_owner
    const user = await prisma.user.findFirst({
      where: {
        id,
        user_role: {
          some: {
            role: { role_name: { in: OWNER_ROLE_NAMES } },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profile_image: true,
        created_at: true,
        pets: {
          select: {
            id: true,
            name: true,
            breed: true,
            sex: true,
            age_month: true,
            color: true,
            image_url: true,
            created_at: true,
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Owner not found" });
    }

    const payload: OwnerDetail = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profile_image: user.profile_image,
      created_at: user.created_at.toISOString(),
      pets: user.pets.map((p) => ({
        id: p.id,
        name: p.name,
        breed: p.breed,
        sex: p.sex,
        age_month: p.age_month,
        color: p.color,
        image_url: p.image_url,
        created_at: p.created_at.toISOString(),
      })),
    };

    return res.status(200).json(payload);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
}