import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import type { OwnerDetail } from "@/types/admin/owners";

const OWNER_ROLE_NAMES = ["Owner", "pet_owner", "OWNER", "PET_OWNER"] as const;

type ErrorResponse = {
  message: string;
};

/**
 * 📡 API Route: GET /api/admin/owners/get-owner-by-id
 * 
 * ดึงข้อมูล Owner พร้อม Pets ของเขาจากฐานข้อมูล
 * ใช้ Prisma ORM query ฐานข้อมูลโดยตรง (ไม่ใช่ fetch API หรือ axios)
 * 
 * @param req.query.id - Owner ID
 * @returns OwnerDetail พร้อมรายการ Pets
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OwnerDetail | ErrorResponse>
) {
  // อนุญาตเฉพาะ GET method
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const id = Number(req.query.id);

    // ตรวจสอบว่า id เป็นตัวเลขที่ถูกต้อง
    if (!Number.isFinite(id)) {
      return res.status(400).json({
        message: "Invalid id"
      });
    }

    /**
     *  Query ข้อมูล Owner จากฐานข้อมูลด้วย Prisma
     * หมายเหตุ: นี่คือ API Route (Backend) ใช้ Prisma query ฐานข้อมูลโดยตรง
     * ไม่ใช่การเรียก HTTP API ด้วย fetch หรือ axios
     */
    const user = await prisma.user.findFirst({
      where: {
        id,
        user_role: {
          some: {
            role: {
              role_name: { in: [...OWNER_ROLE_NAMES] }
            }
          }
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
        status: true,
        suspended_at: true,
        suspend_reason: true,
        // ดึงข้อมูล pets ที่ไม่ถูก ban
        pets: {
          where: {
            OR: [
              { is_banned: false },
              { is_banned: null },
            ],
          },
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
            pet_type: {
              select: {
                pet_type_name: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    // ถ้าไม่เจอ Owner ตาม id
    if (!user) {
      return res.status(404).json({
        message: "Owner not found"
      });
    }

    //  แปลงข้อมูลจาก Prisma เป็นรูปแบบที่ส่งให้ Frontend
    const payload: OwnerDetail = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at.toISOString(),
      profile_image: user.profile_image,
      profile_image_public_id: user.profile_image_public_id ?? null,
      id_number: null,
      dob: null,
      status: user.status as OwnerDetail["status"],
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
      })),
    };

    //  ส่งข้อมูลกลับไป
    return res.status(200).json(payload);

  } catch (error) {
    console.error("get-owner-by-id error:", error);



    return res.status(500).json({
      message: "Failed to load owner details"
    });
  }
}