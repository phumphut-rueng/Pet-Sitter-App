// src/pages/api/admin/owners/get-owner-by-id.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import type { OwnerDetail } from "@/types/admin/owners";

const OWNER_ROLE_NAMES = ["Owner", "pet_owner", "OWNER", "PET_OWNER"] as const;

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
        profile_image: true,           // legacy url
        profile_image_public_id: true, // ถ้า schema ไม่มี ให้คอมเมนต์ทิ้ง

        // ✅ ฟิลด์สถานะ Owner
        status: true,                  // "ACTIVE" | "SUSPENDED"
        suspended_at: true,
        suspend_reason: true,

        // ✅ รายการสัตว์ของ owner
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
            banned_at: true, // เพิ่ม field นี้เพื่อใช้ใน UI
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "Owner not found" });

    // ✅ map ออกเป็น OwnerDetail (แนบ field ที่จำเป็นทั้งหมด)
    const payload: OwnerDetail = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at.toISOString(),

      profile_image: user.profile_image,
      profile_image_public_id: user.profile_image_public_id ?? null,

      // ถ้า schema ยังไม่มี id_number/dob → ส่ง null ไว้ก่อน (type รองรับ)
      id_number: null,
      dob: null,

      status: user.status as OwnerDetail["status"], // คุม type ให้ตรง
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
        // เผื่ออยากใช้ใน UI ต่อไป:
        // banned_at: p.banned_at ? p.banned_at.toISOString() : null,
      })),
    };

    return res.status(200).json(payload);
  } catch (err: unknown) {
    console.error("get-owner-by-id error:", err);
    return res.status(500).json({ error: toErr(err) });
  }
}