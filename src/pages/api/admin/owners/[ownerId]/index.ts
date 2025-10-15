import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";



function sendError(res: NextApiResponse, status: number, message: string) {
  return res.status(status).json({ message });
}

function parseOwnerId(queryId: unknown): number | null {
  const raw = Array.isArray(queryId) ? queryId[0] : queryId;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return sendError(res, 405, "Method not allowed");
  }

  const ownerId = parseOwnerId(req.query.id);
  if (ownerId == null) {
    return sendError(res, 400, "Invalid owner id");
  }

  try {
    const u = await prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        created_at: true,
        status: true,               // e.g. "normal" | "ban"
        suspended_at: true,
        suspend_reason: true,
        profile_image: true,
        profile_image_public_id: true,
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
            is_banned: true,
            pet_type: { select: { pet_type_name: true } },
          },
          orderBy: { created_at: "desc" }, //ายการล่าสุดขึ้นก่อน 
        },
      },
    });

    if (!u) return sendError(res, 404, "Owner not found");

    // Normalize payload ให้ FE ใช้ง่าย
    const payload = {
      id: u.id,
      name: u.name ?? null,
      email: u.email ?? null,
      phone: u.phone ?? null,
      profile_image: u.profile_image ?? null,
      profile_image_public_id: u.profile_image_public_id ?? null,
      created_at: u.created_at.toISOString(),

      // ฟิลด์สถานะแบบใหม่
      status: u.status as "normal" | "ban",
      banned_at: u.suspended_at ? u.suspended_at.toISOString() : null,
      ban_reason: u.suspend_reason ?? null,

      pets: u.pets.map((p) => ({
        id: p.id,
        name: p.name ?? null,
        breed: p.breed ?? null,
        sex: p.sex ?? null,
        age_month: p.age_month ?? null,
        color: p.color ?? null,
        image_url: p.image_url ?? null,
        created_at: p.created_at.toISOString(),
        is_banned: Boolean(p.is_banned), // ให้เป็น boolean ชัดๆ
        pet_type_name: p.pet_type?.pet_type_name ?? null,
      })),
    };

    return res.status(200).json(payload);
  } catch (e) {
    console.error("get owner detail error:", e);
    return sendError(res, 500, "Failed to load owner detail");
  }
}