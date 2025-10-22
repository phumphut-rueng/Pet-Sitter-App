import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import type { OwnerListResponse } from "@/types/admin/owners";
import type { Prisma } from "@prisma/client";
import { user_status } from "@prisma/client";
import { OWNER_ROLE_NAMES } from "@/lib/constants/roles";
import { toInt, apiHandler, methodNotAllowed } from "@/lib/api/api-utils";
import type { ErrorResponse } from "@/lib/types/api";

type StatusFilter = "all" | "normal" | "ban";

function getStatusFilter(status?: string | string[]): StatusFilter {
  if (!status) return "all";
  
  const value = (Array.isArray(status) ? status[0] : status).trim().toLowerCase();
  
  if (value === "normal" || value === "active") return "normal";
  if (value === "ban" || value === "suspended") return "ban";
  
  return "all";
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OwnerListResponse | ErrorResponse>
) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  const page = Math.max(1, toInt(req.query.page, 1));
  const limit = Math.min(50, Math.max(1, toInt(req.query.limit, 10)));
  const skip = (page - 1) * limit;

  const search = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const status = getStatusFilter(req.query.status);

  const where: Prisma.userWhereInput = {
    user_role: {
      some: { role: { role_name: { in: [...OWNER_ROLE_NAMES] as string[] } } },
    },
    ...(status !== "all" && { status: status as user_status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  try {
    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
      prisma.user.count({ where }),
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
  } catch (err) {
    console.error("Error loading owners:", err);
    return res.status(500).json({ message: "Failed to load owners" });
  }
}

export default apiHandler(handler);