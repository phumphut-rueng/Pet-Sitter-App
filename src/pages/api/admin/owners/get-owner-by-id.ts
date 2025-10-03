import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import type { OwnerDetail } from "@/types/admin/owners";

const OWNER_ROLE_NAMES = ["Owner", "pet_owner", "OWNER", "PET_OWNER"] as const;

// unknown  string ที่อ่านง่าย
const toErr = (e: unknown) =>
  e instanceof Error ? e.message : typeof e === "string" ? e : "Internal Server Error";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OwnerDetail | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const id = Number(req.query.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const user = await prisma.user.findFirst({
      where: {
        id,
        user_role: { some: { role: { role_name: { in: [...OWNER_ROLE_NAMES] } } } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        created_at: true,
        profile_image: true,             // legacy url
        profile_image_public_id: true,   // ถ้าไม่มีคอลัมน์นี้ในสคีมา ให้คอมเมนต์ทิ้ง
        // id_number: true,               // ถ้า schema มี ค่อยเปิด
        // dob: true,                     // ถ้า schema มี ค่อยเปิด
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

    if (!user) return res.status(404).json({ error: "Owner not found" });

    // แคบชนิดแบบปลอดภัยสำหรับฟิลด์ที่ "อาจ" ไม่มีใน select/สคีมา
    type MaybeExtra = Partial<{
      profile_image_public_id: string | null;
      id_number: string | null;
      dob: string | Date | null;
    }>;

    const u = user as typeof user & MaybeExtra;

    const payload: OwnerDetail = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at.toISOString(),
      profile_image_public_id: u.profile_image_public_id ?? null, // ถ้ามีใช้เลย ไม่มีก็ null
      profile_image: user.profile_image,                          // legacy url
      id_number: u.id_number ?? null,
      dob:
        typeof u.dob === "string"
          ? u.dob
          : u.dob instanceof Date
          ? u.dob.toISOString()
          : null,
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
  } catch (err: unknown) {
    console.error("get-owner-by-id error:", err);
    return res.status(500).json({ error: toErr(err) });
  }
}