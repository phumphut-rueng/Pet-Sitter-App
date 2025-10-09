// /api/admin/owners/get-owner-by-id.ts
// ดึงข้อมูล Owner พร้อม Pets
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import type { OwnerDetail } from "@/types/admin/owners";
import { OWNER_ROLE_NAMES } from "@/lib/constants/roles";
import { parseId, apiHandler, methodNotAllowed } from "@/lib/api/api-utils";
import { $Enums } from "@prisma/client";

// DB enum (user_status): 'ban' | 'normal'  -> public: 'ban' | 'normal'
const userToPublicStatus = (db: $Enums.user_status | string): OwnerDetail["status"] =>
  db === "ban" ? "ban" : "normal";

type ErrorResponse = { message: string };

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OwnerDetail | ErrorResponse>
) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  const id = parseId(req.query.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const user = await prisma.user.findFirst({
    where: {
      id,
      user_role: {
        some: { role: { role_name: { in: [...OWNER_ROLE_NAMES] } } },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      created_at: true,
      profile_image: true,
      profile_image_public_id: true,
      status: true,            // 'ban' | 'normal'
      suspended_at: true,      // เวลาแบน (ยังใช้ฟิลด์นี้เก็บ)
      suspend_reason: true,    // เหตุผลแบน
      pets: {
        // ⛳ ดึงทั้งหมด เพื่อให้เห็นสถานะจริงหลังแบนทันที
        where: { owner_id: id },
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
          banned_at: true,
          pet_type: { select: { pet_type_name: true } },
        },
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "Owner not found" });
  }

  const payload: OwnerDetail = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    created_at: user.created_at.toISOString(),
    profile_image: user.profile_image,
    profile_image_public_id: user.profile_image_public_id ?? null,

    // ฟิลด์ที่ยังไม่มีจริงในตาราง user (คงไว้เป็น null)
    id_number: null,
    dob: null,

    // map สถานะ DB -> public
    status: userToPublicStatus(user.status),

    // ข้อมูลแบน (ใช้ชื่อเดิมใน DB แต่ map ไป field สื่อความ)
    suspended_at: user.suspended_at ? user.suspended_at.toISOString() : null,
    suspend_reason: user.suspend_reason ?? null,

    pets: user.pets.map((p) => ({
      id: p.id,
      name: p.name,
      breed: p.breed,
      sex: p.sex,
      age_month: p.age_month,
      color: p.color,
      image_url: p.image_url,
      created_at: p.created_at.toISOString(),
      is_banned: p.is_banned ?? null,
      pet_type_name: p.pet_type?.pet_type_name ?? null,
      // ถ้า FE อยากโชว์เวลาแบน pet ด้วย จะเพิ่ม field ตรง type ได้:
      // banned_at: p.banned_at ? p.banned_at.toISOString() : null,
    })),
  };

  return res.status(200).json(payload);
}

export default apiHandler(handler);