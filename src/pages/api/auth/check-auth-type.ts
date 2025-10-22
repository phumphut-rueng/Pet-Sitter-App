//  เช็คว่าบัญชีนี้เป็น "password" หรือ "google"
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

/**
 * @openapi
 * /auth/check-auth-type:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Check user's auth flow type
 *     description: >
 *       ตรวจสอบว่าอีเมลที่ให้มาใช้การล็อกอินแบบใด:
 *       - `"google"` = ผูก Google OAuth และไม่มีรหัสผ่านในระบบ  
 *       - `"password"` = ใช้รหัสผ่าน (credentials) ได้  
 *       - `"unknown"` = ไม่พบผู้ใช้ หรือเกิดข้อผิดพลาดภายใน (endpoint นี้จะตอบ 200 เสมอเพื่อเลี่ยง email enumeration)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *           examples:
 *             sample:
 *               value:
 *                 email: "john@example.com"
 *     responses:
 *       200:
 *         description: Auth flow type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flow:
 *                   type: string
 *                   enum: [google, password, unknown]
 *             examples:
 *               google:
 *                 value: { flow: "google" }
 *               password:
 *                 value: { flow: "password" }
 *               unknown:
 *                 value: { flow: "unknown" }
 *       405:
 *         description: Method not allowed
 */


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "email required" });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });
    if (!user) return res.status(200).json({ flow: "unknown" });

    const googleAcc = await prisma.account.findFirst({
      where: { userId: user.id, provider: "google" },
      select: { id: true },
    });

    // ถ้ามี Google และ password ว่าง  ถือเป็น Google-only
    if (googleAcc && !user.password) {
      return res.status(200).json({ flow: "google" });
    }
    return res.status(200).json({ flow: "password" });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ flow: "unknown" });
  }
}