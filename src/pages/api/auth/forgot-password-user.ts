//  Forgot Password สำหรับผู้ใช้ที่ไม่ใช่ Google-login
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { prisma } from "@/lib/prisma/prisma";
import { PASSWORD_SUCCESS_MESSAGES } from "@/lib/constants/messages";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    
    if (!email) {
      return res.status(200).json({ message: PASSWORD_SUCCESS_MESSAGES.resetEmailSent });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });
    
    if (!user) {
      return res.status(200).json({ message: PASSWORD_SUCCESS_MESSAGES.resetEmailSent });
    }

    // ถ้ามี google account และไม่มี password → ถือเป็น Google-login
    const googleAcc = await prisma.account.findFirst({
      where: { userId: user.id, provider: "google" },
      select: { id: true },
    });
    
    if (googleAcc && !user.password) {
      // บอก front ให้เด้งไปหน้าเพื่อน
      return res.status(200).json({ 
        message: PASSWORD_SUCCESS_MESSAGES.resetEmailSent, 
        flow: "google" 
      });
    }

    // ผู้ใช้ปกติ → ออก token (เก็บเป็น hash ในคอลัมน์ token เดิม)
    await prisma.password_reset_tokens.deleteMany({ 
      where: { user_id: user.id } 
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.password_reset_tokens.create({
      data: { 
        user_id: user.id, 
        token: tokenHash, 
        expires_at: expiresAt 
      },
    });

    return res.status(200).json({
      message: PASSWORD_SUCCESS_MESSAGES.resetEmailSent,
      flow: "password",
      token: rawToken, // 🔧 DEV ONLY (โปรดักชันอย่าคืน)
      email,
    });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ message: PASSWORD_SUCCESS_MESSAGES.resetEmailSent });
  }
}