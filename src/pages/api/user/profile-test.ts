import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma/prisma";


/**
 * @openapi
 * /user/profile-test:
 *   get:
 *     tags: [User]
 *     summary: Get my profile (session)
 *     description: คืนข้อมูลโปรไฟล์ของผู้ใช้ตาม session (ต้องล็อกอินด้วยคุกกี้ NextAuth)
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer, example: 101 }
 *                 name: { type: string, example: "Jane Doe" }
 *                 email: { type: string, example: "jane@example.com" }
 *                 phone: { type: string, nullable: true, example: "0812345678" }
 *                 profile_image: { type: string, nullable: true, example: "https://..." }
 *                 roles:
 *                   type: array
 *                   items: { type: string }
 *       401:
 *         description: Unauthorized
 *     security:
 *       - cookieAuth: []
 *
 *   put:
 *     tags: [User]
 *     summary: Update my profile (name only)
 *     description: อัปเดตชื่อผู้ใช้ของบัญชีที่ล็อกอินอยู่
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer, example: 101 }
 *                 name: { type: string, example: "Jane Doe" }
 *                 email: { type: string, example: "jane@example.com" }
 *                 phone: { type: string, nullable: true, example: "0812345678" }
 *                 profile_image: { type: string, nullable: true, example: "https://..." }
 *                 roles:
 *                   type: array
 *                   items: { type: string }
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 *     security:
 *       - cookieAuth: []
 */

// API สำหรับจัดการข้อมูลโปรไฟล์ผู้ใช้
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

    // GET: ดึงข้อมูลโปรไฟล์ผู้ใช้
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

    // PUT: อัพเดทข้อมูลโปรไฟล์ผู้ใช้
    if (req.method === "PUT") {
      const { name } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { name },
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

    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error("Profile API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}