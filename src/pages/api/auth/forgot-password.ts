// app/api/forgot-password/route.ts
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"
import sgMail from "@sendgrid/mail"
import { NextApiRequest, NextApiResponse } from "next"

const prisma = new PrismaClient()
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
    try {
        const { email } = await req.body

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        //หา user จาก email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { accounts: true },
        })

        if (!user) {
            return res.status(404).json({
                message: "No account found with that email"
            })
        }

        //เช็กว่าเป็น OAuth หรือไม่
        const oauthAccount = user.accounts.find(acc => acc.provider !== "credentials")

        if (oauthAccount) {
            return res.status(403).json({
                message: "This account uses social login and cannot reset password."
            })
        }

        //สร้าง token
        const token = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date(Date.now() + 1000 * 60 * 15) // 15 นาที

        //ลบ token เก่าถ้ามี
        await prisma.password_reset_tokens.deleteMany({
            where: { user_id: user.id },
        })

        //สร้าง token ใหม่
        await prisma.password_reset_tokens.create({
            data: { user_id: user.id, token, expires_at: expiresAt },
        })

        //สร้างลิงก์รีเซ็ตรหัสผ่าน
        const resetLink = `${process.env.VERCEL_LINK}/auth/reset-password?token=${token}`

        //ส่งอีเมลผ่าน SendGrid
        const msg = {
            to: email,
            from: process.env.SENDGRID_SENDER_EMAIL!,
            subject: "Reset your password",
            html: `
        <div style="font-family: Arial, sans-serif;">
          <h3>Reset your password</h3>
          <p>Click the button below to reset your password. The link will expire in 15 minutes.</p>
          <a href="${resetLink}"
            style="background:#f97316;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">
            Reset Password
          </a>
          <p>If you didn’t request this, you can safely ignore this email.</p>
        </div>
      `,
        }

        await sgMail.send(msg)

        return res.status(200).json({
            message: "Reset link sent! Please check your email.",
        })
    } catch {
        // console.error("Forgot password error:", error)
        return res.status(500).json({
            message: "Error sending reset link."
        })
    }
}
