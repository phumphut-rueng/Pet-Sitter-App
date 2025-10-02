import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma/prisma";

// API สำหรับจัดการข้อมูลโปรไฟล์ผู้ดูแลสัตว์
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // NextAuth: ดึง session จาก cookies โดยอัตโนมัติ - ไม่ต้องส่ง token มาเอง
    // NextAuth: getServerSession จะอ่าน HttpOnly cookies และ decode JWT ให้เราเลย
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // NextAuth: session.user.id มาจาก JWT token ที่ถูก decode แล้ว
    // NextAuth: ข้อมูลนี้มาจาก callbacks.session ใน [...nextauth].ts
    // แปลง user ID เป็นตัวเลข
    const userId = parseInt(session.user.id);

    if (isNaN(userId)) {
      console.error("Invalid user ID:", session.user.id);
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // GET: ดึงข้อมูลโปรไฟล์ผู้ดูแลสัตว์
    if (req.method === "GET") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profile_image: true,
          user_role: { include: { role: true } }
        }
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile_image: user.profile_image,
        roles: user.user_role.map(ur => ur.role.role_name) || []
      });
    }

    // PUT: อัพเดทข้อมูลโปรไฟล์ผู้ดูแลสัตว์
    if (req.method === "PUT") {
      const { name, profile_image } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(profile_image !== undefined && { profile_image })
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profile_image: true,
          user_role: { include: { role: true } }
        }
      });

      return res.json({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        profile_image: updated.profile_image,
        roles: updated.user_role.map(ur => ur.role.role_name) || []
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Sitter Profile API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}