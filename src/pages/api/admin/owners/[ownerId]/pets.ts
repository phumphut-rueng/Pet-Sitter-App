import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { apiHandler, methodNotAllowed } from "@/lib/api/api-utils";

type PetListResponse = {
  items: Array<{
    id: number;
    name: string | null;
    breed: string | null;
    sex: string | null;
    age_month: number | null;
    color: string | null;
    weight_kg: number | null;
    about: string | null;
    image_url: string | null;
    is_banned: boolean;
    created_at: string;
    pet_type_id: number | null;
    pet_type_name: string | null;
  }>;
  page: number;
  limit: number;
  total: number;
};

type ErrorResponse = { message: string };

function getOwnerId(query: NextApiRequest["query"]): number | null {
  const raw = query.ownerId ?? query.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

function toPositiveInt(value: unknown, fallback: number): number {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : fallback;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PetListResponse | ErrorResponse>
) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  const ownerId = getOwnerId(req.query);
  if (!ownerId) {
    return res.status(400).json({ message: "Invalid owner id" });
  }

  const page = Math.max(1, toPositiveInt(req.query.page, 1));
  const limit = Math.min(50, Math.max(1, toPositiveInt(req.query.limit, 12)));
  const skip = (page - 1) * limit;

  try {
    const where = { owner_id: ownerId };

    const [items, total] = await Promise.all([
      prisma.pet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          name: true,
          breed: true,
          sex: true,
          age_month: true,
          color: true,
          weight_kg: true,
          about: true,
          image_url: true,
          is_banned: true,
          created_at: true,
          pet_type_id: true,
          pet_type: { select: { pet_type_name: true } },
        },
      }),
      prisma.pet.count({ where }),
    ]);

    return res.status(200).json({
      items: items.map((p) => ({
        id: p.id,
        name: p.name,
        breed: p.breed,
        sex: p.sex,
        age_month: p.age_month,
        color: p.color,
        weight_kg: p.weight_kg != null ? Number(p.weight_kg) : null,
        about: p.about,
        image_url: p.image_url,
        is_banned: Boolean(p.is_banned),
        created_at: p.created_at.toISOString(),
        pet_type_id: p.pet_type_id,
        pet_type_name: p.pet_type?.pet_type_name ?? null,
      })),
      page,
      limit,
      total,
    });
  } catch (err) {
    console.error("Error loading pets:", err);
    return res.status(500).json({ message: "Failed to load pets" });
  }
}

export default apiHandler(handler);