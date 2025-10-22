import bcrypt from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

/**
 * @openapi
 * /auth/reset-password-user:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset password with email + token
 *     description: >
 *       รีเซ็ตรหัสผ่านของผู้ใช้แบบรหัสผ่าน (credentials) โดยยืนยันผ่านอีเมลและโทเค็นรีเซ็ตที่ยังไม่หมดอายุ.
 *       ระบบจะตรวจสอบโทเค็น (แบบ hash) ที่ตาราง password_reset_tokens จากนั้นอัปเดตรหัสผ่านใหม่และลบโทเค็นที่ใช้แล้ว.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, token, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *                 description: Raw reset token ที่ผู้ใช้ได้รับจากลิงก์รีเซ็ต
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: ต้องมีทั้งตัวอักษรและตัวเลขอย่างน้อยอย่างละหนึ่งตัว
 *           examples:
 *             sample:
 *               value:
 *                 email: "john@example.com"
 *                 token: "4f0a1c...<truncated>"
 *                 newPassword: "NewPassw0rd!"
 *     responses:
 *       200:
 *         description: Password reset success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Your password has been reset successfully."
 *       400:
 *         description: Missing/invalid data or token expired/invalid
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Unknown server error
 */


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }

    try {
        const { token, password } = await req.body

        const tokenRecord = await prisma.password_reset_tokens.findUnique({
            where: { token },
            include: { user: { include: { accounts: true } } },
        })

        if (!tokenRecord) {
            return res.status(400).json({ message: "Invalid or expired token." })
        }

        // ตรวจสอบวันหมดอายุ
        if (tokenRecord.expires_at < new Date()) {
            return res.status(400).json({ message: "Token expired." })
        }

        // ถ้ามี account ที่มาจาก OAuth (เช่น Google)
        const oauthAccount = tokenRecord.user.accounts.find(
            (a) => a.provider !== "credentials"
        )
        if (oauthAccount) {
            return res.status(403).json(
                {
                    message: "This account uses OAuth login and cannot reset password."
                }
            )
        }

        // hash password ใหม่
        const hashedPassword = await bcrypt.hash(password, 10)

        // อัปเดตรหัสผ่าน
        await prisma.user.update({
            where: { id: tokenRecord.user_id },
            data: { password: hashedPassword },
        })

        // ลบ token ทิ้งหลังใช้แล้ว
        await prisma.password_reset_tokens.delete({ where: { id: tokenRecord.id } })

        return res.status(200).json({
            message: "Password updated successfully."
        })
    } catch (error) {
        console.error("Reset password error:", error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

