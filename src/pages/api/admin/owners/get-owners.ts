import type { NextApiRequest, NextApiResponse } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const q = (String(req.query.q ?? "")).trim();

    // where สำหรับ “Owner”
    const where: Prisma.userWhereInput = {
      user_role: {
        some: {
          role: {
            // ใส่ชื่อ role ให้ตรงกับในตารางของคุณ
            role_name: { in: ["Owner", "pet_owner"] },
          },
        },
      },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          created_at: true,
          profile_image: true,
          profile_image_public_id: true,
          status: true,
          _count: { select: { pets: true } }, // <- เอาไว้คำนวณ pet_count
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      status: u.status,
    }));

    return res.status(200).json({
      items,
      total,
      page,
      pageSize,
    });
  } catch (err: any) {
    console.error("get-owners error:", err);
    return res.status(500).json({ message: err?.message ?? "Internal Server Error" });
  }
}