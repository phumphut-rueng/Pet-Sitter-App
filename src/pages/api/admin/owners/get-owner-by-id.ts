import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { apiHandler, methodNotAllowed } from "@/lib/api/api-utils";

type OwnerDetail = {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  profile_image: string | null;
  profile_image_public_id: string | null;
  id_number: string | null;
  dob: string | null;
  status: "normal" | "ban";
  created_at: string;
  suspended_at: string | null;
  banned_at: string | null;
  suspend_reason: string | null;
  admin_note: string | null;
  pets: Array<{
    id: number;
    name: string;
    pet_type_name: string;
    breed: string;
    sex: string;
    age_month: number;
    color: string;
    weight_kg: string;
    image_url: string | null;
    is_banned: boolean;
    banned_at: string | null;
    ban_reason: string | null;
  }>;
};

type ErrorResponse = {
  message: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OwnerDetail | ErrorResponse>
) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid owner ID" });
    }

    const owner = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        pets: {
          include: {
            pet_type: true,
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    if (!owner) {
      return res.status(404).json({ message: "Pet owner not found" });
    }

    return res.status(200).json({
      id: owner.id,
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      profile_image: owner.profile_image,
      profile_image_public_id: owner.profile_image_public_id,
      id_number: owner.id_number,
      dob: owner.dob ? owner.dob.toISOString() : null,
      status: owner.status as "normal" | "ban",
      created_at: owner.created_at.toISOString(),
      suspended_at: owner.suspended_at ? owner.suspended_at.toISOString() : null,
      banned_at: owner.suspended_at ? owner.suspended_at.toISOString() : null,
      suspend_reason: owner.suspend_reason,
      admin_note: owner.admin_note,
      pets: owner.pets.map((pet) => ({
        id: pet.id,
        name: pet.name,
        pet_type_name: pet.pet_type.pet_type_name,
        breed: pet.breed,
        sex: pet.sex,
        age_month: pet.age_month,
        color: pet.color,
        weight_kg: pet.weight_kg.toString(),
        image_url: pet.image_url,
        is_banned: pet.is_banned ?? false,
        banned_at: pet.banned_at ? pet.banned_at.toISOString() : null,
        ban_reason: pet.ban_reason,
      })),
    });
  } catch (err) {
    console.error("❌ Error fetching owner detail:", err);
    if (err instanceof Error) {
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
    }
    return res.status(500).json({ message: "Failed to fetch owner detail" });
  }
}

export default apiHandler(handler);