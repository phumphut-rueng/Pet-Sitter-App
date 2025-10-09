
//  ใช้สำหรับหน้ารายการ Owner ทั้งหมด (listing)
//  รองรับ pagination, search, และ filter ตาม status

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import type { OwnerListResponse } from "@/types/admin/owners";
import type { Prisma } from "@prisma/client";
import { OWNER_ROLE_NAMES } from "@/lib/constants/roles";
import { toInt, apiHandler, methodNotAllowed } from "@/lib/api/api-utils";

type StatusFilter = "all" | "normal" | "ban";

type ErrorResponse = { message: string };

/** Normalize status filter (รับได้ทั้งรูปแบบใหม่/เก่า) */
const normalizeStatus = (s?: string | string[] | null): StatusFilter => {
  if (!s) return "all";
  const v = (Array.isArray(s) ? s[0] : s).trim().toLowerCase();

  // รูปแบบใหม่
  if (v === "normal") return "normal";
  if (v === "ban") return "ban";

  // รูปแบบเก่า (ยังรองรับเพื่อ backward-compat)
  if (v === "active") return "normal";
  if (v === "suspended") return "ban";

  return "all";
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OwnerListResponse | ErrorResponse>
) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  const page = toInt(req.query.page, 1);
  const limit = toInt(req.query.limit, 10);
  const skip = (page - 1) * limit;

  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const status = normalizeStatus(req.query.status);

  const whereBase: Prisma.userWhereInput = {
    user_role: {
      some: { role: { role_name: { in: [...OWNER_ROLE_NAMES] } } },
    },
  };

  if (q) {
    whereBase.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  if (status !== "all") {
    whereBase.status = status as any;
  }

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where: whereBase,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        created_at: true,
        status: true,
        profile_image: true,
        profile_image_public_id: true,
        _count: { select: { pets: true } },
      },
      orderBy: { created_at: "desc" },
      take: limit,
      skip,
    }),
    prisma.user.count({ where: whereBase }),
  ]);

  const items = rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    created_at: u.created_at.toISOString(),
    pet_count: u._count.pets,
    profile_image: u.profile_image,
    profile_image_public_id: u.profile_image_public_id,
    status: u.status as "normal" | "ban",
  }));

  return res.status(200).json({ items, total, page, limit });
}

export default apiHandler(handler);