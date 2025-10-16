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
    name: string | null;
    pet_type_name: string | null;
    breed: string | null;
    sex: string | null;
    age_month: number | null;
    color: string | null;
    weight_kg: string;
    about: string | null;  // ← เพิ่มบรรทัดนี้
    image_url: string | null;
    is_banned: boolean;
    banned_at: string | null;
    ban_reason: string | null;
  }>;
};

type ErrorResponse = { message: string };

function getOwnerId(query: NextApiRequest["query"]): number | null {
  const raw = query.ownerId ?? query.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OwnerDetail | ErrorResponse>
) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  const ownerId = getOwnerId(req.query);
  if (!ownerId) {
    return res.status(400).json({ message: "Owner ID is required" });
  }

  try {
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profile_image: true,
        profile_image_public_id: true,
        id_number: true,
        dob: true,
        status: true,
        created_at: true,
        suspended_at: true,
        suspend_reason: true,
        admin_note: true,
        pets: {
          orderBy: { created_at: "desc" },
          select: {
            id: true,
            name: true,
            breed: true,
            sex: true,
            age_month: true,
            color: true,
            weight_kg: true,
            about: true,  // ← เพิ่มบรรทัดนี้
            image_url: true,
            is_banned: true,
            banned_at: true,
            ban_reason: true,
            pet_type: { select: { pet_type_name: true } },
          },
        },
      },
    });

    if (!owner) {
      return res.status(404).json({ message: "Pet owner not found" });
    }

    const payload: OwnerDetail = {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      profile_image: owner.profile_image,
      profile_image_public_id: owner.profile_image_public_id,
      id_number: owner.id_number,
      dob: owner.dob?.toISOString() ?? null,
      status: owner.status as "normal" | "ban",
      created_at: owner.created_at.toISOString(),
      suspended_at: owner.suspended_at?.toISOString() ?? null,
      banned_at: owner.suspended_at?.toISOString() ?? null,
      suspend_reason: owner.suspend_reason,
      admin_note: owner.admin_note,
      pets: owner.pets.map((p) => ({
        id: p.id,
        name: p.name,
        pet_type_name: p.pet_type?.pet_type_name ?? null,
        breed: p.breed,
        sex: p.sex,
        age_month: p.age_month,
        color: p.color,
        weight_kg: p.weight_kg != null ? String(p.weight_kg) : "",
        about: p.about,  // ← เพิ่มบรรทัดนี้
        image_url: p.image_url,
        is_banned: Boolean(p.is_banned),
        banned_at: p.banned_at?.toISOString() ?? null,
        ban_reason: p.ban_reason,
      })),
    };

    return res.status(200).json(payload);
  } catch (err) {
    console.error("Error fetching owner detail:", err);
    return res.status(500).json({ message: "Failed to fetch owner detail" });
  }
}

export default apiHandler(handler);