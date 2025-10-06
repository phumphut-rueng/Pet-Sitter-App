import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import type { OwnerListResponse } from "@/types/admin/owners";

const OWNER_ROLE_NAMES = ["Owner", "pet_owner", "OWNER", "PET_OWNER"] as const;

const toInt = (v: unknown, def: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
};

const normalizeStatus = (s?: string | string[] | null) => {
  if (!s) return "all" as const;
  const v = Array.isArray(s) ? s[0] : s;
  const k = v.toLowerCase();
  if (k === "active") return "ACTIVE" as const;
  if (k === "suspended") return "SUSPENDED" as const;
  return "all" as const;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OwnerListResponse | { error: string }>
) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const page = toInt(req.query.page, 1);
  const limit = toInt(req.query.limit, 10);
  const skip = (page - 1) * limit;

  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const status = normalizeStatus(req.query.status); // "all" | "ACTIVE" | "SUSPENDED"

  try {
    // ── WHERE ──────────────────────────────────────────────
    const whereBase: any = {
      user_role: { some: { role: { role_name: { in: [...OWNER_ROLE_NAMES] } } } },
    };

    // คำค้น (name / phone / email)
    if (q) {
      whereBase.OR = [
        { name: { contains: q, mode: "insensitive" as const } },
        { phone: { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
      ];
    }

    // สถานะ
    if (status !== "all") {
      whereBase.status = status;
    }

    // ── QUERY ──────────────────────────────────────────────
    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where: whereBase,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          created_at: true,
          status: true, // ✅ NEW
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
      status: u.status as "ACTIVE" | "SUSPENDED", // ✅ cast ให้ชัด
    }));

    return res.status(200).json({ items, total, page, limit });
  } catch (e) {
    console.error("get-owners error:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}