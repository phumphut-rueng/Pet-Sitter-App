// src/pages/api/admin/owners/get-owners.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import type { OwnerListResponse } from "@/types/admin/owners";
import type { Prisma, user_status } from "@prisma/client";

const OWNER_ROLE_NAMES = ["Owner", "pet_owner", "OWNER", "PET_OWNER"] as const;

type ErrorResponse = {
  message: string;
};

type StatusFilter = "all" | "ACTIVE" | "SUSPENDED";

const toInt = (v: unknown, def: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
};

const normalizeStatus = (s?: string | string[] | null): StatusFilter => {
  if (!s) return "all";
  const v = Array.isArray(s) ? s[0] : s;
  const k = v.toLowerCase();
  if (k === "active") return "ACTIVE";
  if (k === "suspended") return "SUSPENDED";
  return "all";
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OwnerListResponse | ErrorResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const page = toInt(req.query.page, 1);
  const limit = toInt(req.query.limit, 10);
  const skip = (page - 1) * limit;

  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const status = normalizeStatus(req.query.status);

  try {
    // ✅ ใช้ Prisma.userWhereInput (ตัวเล็ก เพราะ model = user)
    const whereBase: Prisma.userWhereInput = {
      user_role: {
        some: {
          role: {
            role_name: { in: [...OWNER_ROLE_NAMES] },
          },
        },
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
      // ✅ cast เป็น enum ที่ Prisma generate: user_status
      whereBase.status = status as user_status;
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
      status: u.status as "ACTIVE" | "SUSPENDED",
    }));

    return res.status(200).json({ items, total, page, limit });
  } catch (error) {
    console.error("get-owners error:", error);
    return res.status(500).json({ message: "Failed to load owners" });
  }
}